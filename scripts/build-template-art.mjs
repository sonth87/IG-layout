// Pack pictures used by the home templates (2026-10-28): frames (torn paper, stamps,
// film…) and stickers. Their size and photo windows are copied here so a template preview
// draws at once, without loading whole packs; windows are thinned for the preview (the
// project gets the exact ones from the pack when the template is used).
//
//   node scripts/build-template-art.mjs     (also run by `pnpm dev` / `pnpm build`)
//
// Reads every "pack/item" id quoted in src/lib/templates/designs/*.ts and writes
// src/lib/templates/packArt.json.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const designs = path.join(root, "src", "lib", "templates", "designs");
const packs = path.join(root, "public", "packs");
const out = path.join(root, "src", "lib", "templates", "packArt.json");

const ids = new Set();
for (const f of readdirSync(designs)) {
  if (!f.endsWith(".ts")) continue;
  for (const m of readFileSync(path.join(designs, f), "utf8").matchAll(/"([a-z0-9-]+\/[a-z0-9-]+)"/g)) ids.add(m[1]);
}

const catalog = JSON.parse(readFileSync(path.join(packs, "catalog.json"), "utf8"));
const byPack = new Map(catalog.packs.map((p) => [p.id, p]));
const items = new Map();
const art = {};
const missing = [];
const round = (v) => Math.round(v * 1000) / 1000;

for (const id of [...ids].sort()) {
  const pack = byPack.get(id.split("/")[0]);
  if (!pack) continue;
  if (!items.has(pack.id)) {
    const file = path.join(packs, pack.file);
    items.set(pack.id, existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : []);
  }
  const item = items.get(pack.id).find((it) => it.id === id);
  if (!item) {
    missing.push(id);
    continue;
  }
  const windows = item.windows?.map((w) => {
    const { points, ...rest } = w;
    const box = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, typeof v === "number" ? round(v) : v]));
    if (!points) return box;
    // About 60 corners are plenty for a small preview.
    const n = points.length / 2;
    const step = Math.max(1, Math.floor(n / 60));
    const thin = [];
    for (let i = 0; i < n; i += step) thin.push(round(points[i * 2]), round(points[i * 2 + 1]));
    return { ...box, points: thin };
  });
  art[id] = { kind: pack.kind, file: item.file, thumb: item.thumb, width: item.width, height: item.height, ...(windows && { windows }) };
}

writeFileSync(out, JSON.stringify(art) + "\n");
if (missing.length) console.warn(`template art: not in the packs: ${missing.join(", ")}`);
console.log(`template art: ${Object.keys(art).length} pictures`);

// Catalog fonts of the cut-out letter styles (D-141): their files, so the editor and the home
// previews declare just these instead of loading the whole catalog.
const cutoutSrc = readFileSync(path.join(root, "src", "lib", "text", "cutoutStyles.ts"), "utf8");
const fontIds = [...new Set([...cutoutSrc.matchAll(/"c:([a-z0-9-]+)"/g)].map((m) => m[1]))].sort();
const fonts = {};
for (const id of fontIds) {
  const f = catalog.fonts.find((x) => x.id === id);
  if (!f) {
    console.warn(`cut-out fonts: not in the catalog: ${id}`);
    continue;
  }
  fonts[id] = { vi: f.languages.includes("vietnamese"), files: f.files.map(({ weight, file, unicodeRange }) => ({ weight, file, unicodeRange })) };
}
writeFileSync(path.join(root, "src", "lib", "text", "cutoutFonts.json"), JSON.stringify(fonts) + "\n");
console.log(`cut-out fonts: ${Object.keys(fonts).length} catalog fonts`);
