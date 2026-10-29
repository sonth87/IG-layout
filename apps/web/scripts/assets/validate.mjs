// Checks every manifest in assets/ and the processed files in public/packs/ (M20).
// Usage: node scripts/assets/validate.mjs        → exit 1 on any error.
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { BLENDS, COLLECTIONS, FONT_LANGUAGES, FONT_STYLES, itemFiles, LICENSES, LIMITS, manifests, PACKS } from "./common.mjs";

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);
const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const names = (where, n) => {
  if (!n || typeof n.en !== "string" || !n.en.trim() || typeof n.vi !== "string" || !n.vi.trim()) err(where, "name needs en and vi");
};
const collections = (where, list) => {
  for (const c of list ?? []) if (!(c in COLLECTIONS)) err(where, `unknown collection "${c}" (see packages/core/catalog/collections.json)`);
};

function source(where, s) {
  if (!s) return err(where, "source missing");
  for (const k of ["provider", "url", "license", "retrieved"]) if (!s[k]) err(where, `source.${k} missing`);
  if (s.license && !(s.license in LICENSES.licenses)) err(where, `unknown licence "${s.license}" (see packages/core/catalog/licenses.json)`);
  if (s.license === "custom" && !s.licenseUrl) err(where, "custom licence needs source.licenseUrl");
  if (s.retrieved && !/^\d{4}-\d{2}-\d{2}$/.test(s.retrieved)) err(where, "source.retrieved must be YYYY-MM-DD");
  for (const u of [s.url, s.licenseUrl].filter(Boolean)) {
    let host;
    try {
      host = new URL(u).hostname.replace(/^www\./, "");
    } catch {
      err(where, `bad url ${u}`);
      continue;
    }
    if (LICENSES.bannedHosts.some((b) => host === b || host.endsWith(`.${b}`))) err(where, `source from ${host} is not allowed (D-106)`);
  }
}

async function image(where, rel, limit, item) {
  const abs = path.join(PACKS, rel);
  if (!existsSync(abs)) return err(where, `missing public/packs/${rel}`);
  const size = statSync(abs).size;
  if (size > limit.bytes) warn(where, `${rel} is ${Math.round(size / 1000)} KB (limit ${limit.bytes / 1000} KB)`);
  const meta = await sharp(abs).metadata();
  if (meta.format !== "webp") err(where, `${rel} must be WebP`);
  if (Math.max(meta.width, meta.height) > limit.side) err(where, `${rel} is ${meta.width}×${meta.height}, longest side > ${limit.side}`);
  if (item && (item.width !== meta.width || item.height !== meta.height)) err(where, `width/height ${item.width}×${item.height} ≠ file ${meta.width}×${meta.height}`);
}

const seenPacks = new Set();
for (const { kind, pack, manifest: m } of manifests()) {
  const at = `${kind}/${pack}`;
  if (m.id !== pack) err(at, `manifest id "${m.id}" ≠ folder "${pack}"`);
  if (m.kind !== kind) err(at, `manifest kind "${m.kind}" ≠ folder "${kind}"`);
  if (!kebab.test(pack)) err(at, "pack folder must be kebab-case");
  if (seenPacks.has(pack)) err(at, "pack id used twice");
  seenPacks.add(pack);
  names(at, m.name);
  collections(at, m.collections);
  if (typeof m.order !== "number") err(at, "order (number) missing");
  if (!Array.isArray(m.items) || m.items.length === 0) err(at, "items empty");
  const ids = new Set();
  for (const it of m.items ?? []) {
    const where = `${at}/${it.id}`;
    if (!kebab.test(it.id ?? "")) err(where, "id must be kebab-case ascii");
    if (ids.has(it.id)) err(where, "id used twice in the pack");
    ids.add(it.id);
    source(where, it.source);
    collections(where, it.collections);
    if (kind === "font") {
      if (!it.family || !it.label) err(where, "font needs family and label");
      for (const s of it.styles ?? []) if (!FONT_STYLES.includes(s)) err(where, `unknown font style "${s}"`);
      if (!it.styles?.length) err(where, "font needs at least one style");
      for (const l of it.languages ?? []) if (!FONT_LANGUAGES.includes(l)) err(where, `unknown language "${l}"`);
      if (!it.languages?.length) err(where, "font needs languages");
      if (!it.files?.length) err(where, "font has no files");
      for (const f of it.files ?? []) {
        if (!existsSync(path.join(PACKS, f.file ?? ""))) err(where, `missing public/packs/${f.file}`);
        if (!f.unicodeRange) err(where, `${f.file}: unicodeRange missing`);
        if (!it.weights?.includes(f.weight)) err(where, `${f.file}: weight ${f.weight} not in weights`);
      }
      continue;
    }
    names(where, it.name);
    if (!it.tags || !Array.isArray(it.tags.en) || !Array.isArray(it.tags.vi)) err(where, "tags needs en[] and vi[]");
    else if (it.tags.en.length + it.tags.vi.length < 2) warn(where, "few search tags");
    const files = itemFiles(kind, pack, it.id);
    await image(where, files.file, LIMITS[kind], it);
    await image(where, files.thumb, LIMITS.thumb);
    if (kind === "frame") {
      if (!it.windows?.length) err(where, "frame needs windows");
      for (const w of it.windows ?? []) if ([w.x, w.y, w.w, w.h].some((v) => typeof v !== "number" || v < 0 || v > 1) || w.x + w.w > 1.001 || w.y + w.h > 1.001) err(where, "window outside 0–1");
    }
    if (kind === "overlay" && !BLENDS.includes(it.blend)) err(where, `overlay blend must be one of ${BLENDS.join(", ")}`);
  }
}

for (const w of warnings) console.log("  ! " + w);
for (const e of errors) console.log("  ✗ " + e);
console.log(errors.length ? `${errors.length} error(s), ${warnings.length} warning(s)` : `OK (${seenPacks.size} packs, ${warnings.length} warning(s))`);
if (errors.length) process.exitCode = 1;
