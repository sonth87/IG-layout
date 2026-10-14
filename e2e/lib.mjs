// Shared helpers for the end-to-end checks (see e2e/README.md).
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const FIXTURES = path.join(here, "fixtures");
export const OUT = path.join(here, ".out");
mkdirSync(OUT, { recursive: true });

/** Chromium binary: $CHROME_PATH, else the newest Playwright headless shell in the cache. */
export function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cache = path.join(os.homedir(), os.platform() === "darwin" ? "Library/Caches/ms-playwright" : ".cache/ms-playwright");
  const dirs = existsSync(cache) ? readdirSync(cache).filter((d) => d.startsWith("chromium_headless_shell-")).sort().reverse() : [];
  for (const d of dirs) {
    for (const sub of readdirSync(path.join(cache, d))) {
      const bin = path.join(cache, d, sub, "chrome-headless-shell");
      if (existsSync(bin)) return bin;
    }
  }
  throw new Error("No Chromium found. Set CHROME_PATH or run `npx playwright install chromium-headless-shell`.");
}

export const URL_ARG = process.argv[2] ?? "http://localhost:4321/";
