// Third-party notices (owner, 2026-10-19): the Thanks screen lists only the sources that
// must be credited to people (CC BY…); the licences that only ask for their text to come
// with the app (MIT, ISC, Apache, MPL, OFL…) are gathered here into public/licenses.txt.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
// Code shipped to the browser, plus what the app serves: ONNX runtime, Fluent Emoji.
const names = [...Object.keys(pkg.dependencies), "onnxruntime-web", "@iconify-json/fluent-emoji-flat"];

const out = ["IG Layout — third-party notices", "", "Open-source software and assets used in this app, with their licences.", ""];
for (const name of names) {
  const dir = path.join(root, "node_modules", name);
  if (!existsSync(dir)) continue;
  const meta = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"));
  const file = readdirSync(dir).find((f) => /^licen[sc]e/i.test(f));
  out.push("=".repeat(72), `${name} ${meta.version ?? ""} — ${typeof meta.license === "string" ? meta.license : meta.license?.type ?? "see package"}`, meta.homepage ?? meta.repository?.url ?? "", "");
  if (file) out.push(readFileSync(path.join(dir, file), "utf8").trim(), "");
}

// Fonts: Google Fonts under the SIL Open Font License 1.1 / Apache 2.0.
const catalog = path.join(root, "public", "packs", "catalog.json");
const fonts = existsSync(catalog) ? JSON.parse(readFileSync(catalog, "utf8")).fonts : [];
const builtin = [...readFileSync(path.join(root, "src", "lib", "text", "fonts.ts"), "utf8").matchAll(/label: "([^"]+)"/g)].map((m) => m[1]);
out.push("=".repeat(72), "Fonts — Google Fonts, SIL Open Font License 1.1 (https://openfontlicense.org) or Apache License 2.0", "");
out.push([...new Set([...builtin, ...fonts.map((f) => f.label)])].sort().join(", "), "");

// Library pictures under permissive licences (no on-screen credit required).
if (existsSync(catalog)) {
  const permissive = JSON.parse(readFileSync(catalog, "utf8")).credits.filter((c) => !/^CC-BY|^custom/.test(c.license) && !/^CC0|^PDM/.test(c.license));
  if (permissive.length) {
    out.push("=".repeat(72), "Library pictures", "");
    for (const c of permissive) out.push(`${c.author ? `${c.author} · ` : ""}${c.provider} — ${c.license} — ${c.url}`);
    out.push("");
  }
}

writeFileSync(path.join(root, "public", "licenses.txt"), out.join("\n") + "\n");
console.log(`licenses.txt: ${names.length} packages, ${builtin.length + fonts.length} fonts`);
