// Builds what the app reads from the manifests (M20): public/packs/catalog.json (packs,
// fonts, credits) and one items file per pack. Images are not touched (the processing
// script writes them). Usage: node scripts/assets/build-catalog.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { itemFiles, LICENSES, manifests, PACKS } from "./common.mjs";

const credits = [];
const creditIndex = new Map();
function credit(s) {
  const lic = LICENSES.licenses[s.license];
  // Public domain needs no names; others are credited per author.
  const author = lic.attribution ? s.author : undefined;
  const key = `${s.provider}|${author ?? ""}|${s.license}`;
  if (!creditIndex.has(key)) {
    creditIndex.set(key, credits.length);
    credits.push({ provider: s.provider, author, license: s.license, licenseUrl: s.licenseUrl, url: s.url, items: 0 });
  } else if (credits[creditIndex.get(key)].url !== s.url) {
    // Several items: point to the provider rather than one item.
    const c = credits[creditIndex.get(key)];
    c.url = new URL(c.url).origin;
  }
  const i = creditIndex.get(key);
  credits[i].items++;
  return i;
}

const search = (...parts) => [...new Set(parts.flat().filter(Boolean).map((s) => s.toLowerCase()))].join(" ");

const packs = [];
const fonts = [];
for (const { kind, pack, manifest: m } of manifests().sort((a, b) => a.manifest.order - b.manifest.order)) {
  if (kind === "font") {
    for (const f of m.items) {
      const { source, ...rest } = f;
      fonts.push({ ...rest, collections: [...new Set([...(m.collections ?? []), ...(f.collections ?? [])])], credit: credit(source), search: search(f.label, f.family, f.styles, f.languages) });
    }
    continue;
  }
  const items = m.items.map((it) => {
    const files = itemFiles(kind, pack, it.id);
    return {
      id: `${pack}/${it.id}`,
      name: it.name,
      search: search(it.name.en, it.name.vi, it.tags.en, it.tags.vi, m.name.en, m.name.vi),
      collections: [...new Set([...(m.collections ?? []), ...(it.collections ?? [])])],
      ...files,
      width: it.width,
      height: it.height,
      credit: credit(it.source),
      ...(it.windows ? { windows: it.windows } : {}),
      ...(it.tile ? { tile: true } : {}),
      ...(it.blend ? { blend: it.blend } : {}),
    };
  });
  const file = `${kind}/${pack}.json`;
  mkdirSync(path.join(PACKS, kind), { recursive: true });
  writeFileSync(path.join(PACKS, file), JSON.stringify(items));
  packs.push({ id: pack, kind, name: m.name, collections: m.collections ?? [], order: m.order, count: items.length, file, preview: items.slice(0, 8) });
}

mkdirSync(PACKS, { recursive: true });
writeFileSync(path.join(PACKS, "catalog.json"), JSON.stringify({ version: 1, packs, fonts, credits }));
console.log(`catalog: ${packs.length} packs, ${packs.reduce((n, p) => n + p.count, 0)} items, ${fonts.length} fonts, ${credits.length} credits`);
