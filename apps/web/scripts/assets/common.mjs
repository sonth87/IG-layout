// Shared by the asset scripts (M20, docs/architecture/asset-catalog.md).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ROOT is the web app (apps/web); asset sources sit at the repo root, shared code in packages/core.
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const CORE = path.join(ROOT, "..", "..", "packages", "core");
export const ASSETS = path.join(ROOT, "..", "..", "assets");
export const PACKS = path.join(ROOT, "public", "packs");
const catalogDir = path.join(CORE, "catalog");
export const LICENSES = JSON.parse(readFileSync(path.join(catalogDir, "licenses.json"), "utf8"));
export const COLLECTIONS = JSON.parse(readFileSync(path.join(catalogDir, "collections.json"), "utf8"));

export const KINDS = ["sticker", "frame", "texture", "overlay", "font"];
export const FONT_STYLES = ["sans", "serif", "display", "handwriting", "script", "calligraphy", "brush", "fantasy", "playful", "retro", "pixel", "mono", "festive", "stencil", "outline"];
export const FONT_LANGUAGES = ["latin", "vietnamese", "japanese", "korean", "chinese-simplified", "chinese-traditional", "thai", "cyrillic", "greek"];
export const BLENDS = ["screen", "multiply", "overlay", "soft-light", "normal"];

/** Limits of the processed files (bytes / px). */
export const LIMITS = {
  sticker: { side: 1024, bytes: 350_000 },
  frame: { side: 1600, bytes: 600_000 },
  texture: { side: 1024, bytes: 450_000 },
  overlay: { side: 1600, bytes: 600_000 },
  thumb: { side: 192, bytes: 30_000 },
};

/** Every manifest: [{ kind, pack, dir, file, manifest }]. */
export function manifests() {
  const out = [];
  for (const kind of KINDS) {
    const kdir = path.join(ASSETS, kind);
    if (!existsSync(kdir)) continue;
    for (const pack of readdirSync(kdir)) {
      const dir = path.join(kdir, pack);
      const file = path.join(dir, "manifest.json");
      if (!statSync(dir).isDirectory() || !existsSync(file)) continue;
      out.push({ kind, pack, dir, file, manifest: JSON.parse(readFileSync(file, "utf8")) });
    }
  }
  return out;
}

/** Paths of an item's processed files, relative to public/packs. */
export function itemFiles(kind, pack, id) {
  const ext = kind === "texture" ? "webp" : "webp";
  return { file: `${kind}/${pack}/${id}.${ext}`, thumb: `${kind}/${pack}/${id}.thumb.webp` };
}
