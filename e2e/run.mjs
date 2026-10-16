// Serves the static build (out/) and runs every end-to-end check against it.
// Usage: pnpm build && pnpm e2e            (or: node e2e/run.mjs <url> to test a deploy)
import { spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "out");
const SUITES = ["m1.mjs", "m2.mjs", "m3.mjs", "m4.mjs", "m5.mjs", "m6.mjs", "m7.mjs", "m8.mjs", "m9.mjs", "m10.mjs", "m11.mjs", "m13.mjs", "offline.mjs"];
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".webmanifest": "application/manifest+json", ".json": "application/json", ".woff2": "font/woff2", ".txt": "text/plain", ".svg": "image/svg+xml" };

let url = process.argv[2];
let server;
if (!url) {
  if (!existsSync(root)) {
    console.error("out/ not found — run `pnpm build` first.");
    process.exit(1);
  }
  server = http.createServer((req, res) => {
    let file = path.join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!existsSync(file)) file = path.join(root, "404.html");
    res.setHeader("Content-Type", TYPES[path.extname(file)] ?? "application/octet-stream");
    createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(0, r));
  url = `http://localhost:${server.address().port}/`;
}

let failed = 0;
for (const suite of SUITES) {
  console.log(`\n▶ ${suite}  (${url})`);
  // Run each suite in its own process so a crash doesn't hide the others.
  // (Async: the static server lives in this process and must keep serving.)
  const code = await new Promise((resolve) =>
    spawn(process.execPath, [path.join(here, suite), url], { stdio: "inherit" }).on("exit", resolve),
  );
  if (code !== 0) failed++;
}
server?.close();
console.log(failed ? `\n✗ ${failed} suite(s) failed` : "\n✓ all suites passed");
process.exit(failed ? 1 : 0);
