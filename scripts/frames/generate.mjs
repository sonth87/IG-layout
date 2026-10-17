// Frame generator CLI (M20 C7, D-107).
//   node scripts/frames/generate.mjs explore <kind> <count> [firstSeed]
//     → assets/_review/frames/<kind>/index.html: every seed over a sample photo, to pick from.
//   node scripts/frames/generate.mjs build
//     → the picked seeds (scripts/frames/picks.json) as frame packs in assets/ + public/packs/.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ASSETS, PACKS, ROOT } from "../assets/common.mjs";
import { KINDS } from "./kinds.mjs";

const [cmd, kind, countArg, firstArg] = process.argv.slice(2);
const PHOTO = path.join(ROOT, "e2e", "fixtures", "portrait.jpg");

/** The art with a photo under its windows (what the user will see). */
async function preview(f, size = 520) {
  const art = await sharp(Buffer.from(f.svg)).png().toBuffer();
  const layers = [];
  for (const w of f.windows) {
    const bw = Math.max(1, Math.round(w.w * f.width));
    const bh = Math.max(1, Math.round(w.h * f.height));
    let photo = await sharp(PHOTO).resize(bw, bh, { fit: "cover" }).png().toBuffer();
    if (w.points) {
      const pts = [];
      for (let i = 0; i < w.points.length; i += 2) pts.push(`${(w.points[i] * bw).toFixed(1)},${(w.points[i + 1] * bh).toFixed(1)}`);
      const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${bw}" height="${bh}"><polygon points="${pts.join(" ")}" fill="#fff"/></svg>`);
      photo = await sharp(photo).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
    }
    layers.push({ input: photo, left: Math.round(w.x * f.width), top: Math.round(w.y * f.height) });
  }
  layers.push({ input: art, left: 0, top: 0 });
  const comp = await sharp({ create: { width: f.width, height: f.height, channels: 4, background: { r: 233, g: 230, b: 224, alpha: 1 } } }).composite(layers).png().toBuffer();
  return sharp(comp).resize(size, size, { fit: "inside" }).webp({ quality: 82 }).toBuffer();
}

if (cmd === "explore") {
  const make = KINDS[kind];
  if (!make) throw new Error(`kind: ${Object.keys(KINDS).join(", ")}`);
  const count = Number(countArg ?? 24);
  const first = Number(firstArg ?? 1);
  const dir = path.join(ASSETS, "_review", "frames", kind);
  mkdirSync(dir, { recursive: true });
  const cards = [];
  for (let seed = first; seed < first + count; seed++) {
    const f = make(seed);
    writeFileSync(path.join(dir, `${seed}.webp`), await preview(f));
    cards.push(`<figure><img src="${seed}.webp"><figcaption>${seed} · ${JSON.stringify(f.info)}</figcaption></figure>`);
  }
  writeFileSync(path.join(dir, "index.html"), `<!doctype html><meta charset="utf-8"><title>${kind}</title><style>body{font:13px system-ui;background:#e9e6e0;margin:16px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}figure{margin:0}img{width:100%;display:block}figcaption{padding:4px 2px;color:#555}</style><main>${cards.join("")}</main>`);
  console.log(`${count} previews → ${path.relative(ROOT, dir)}/index.html`);
} else if (cmd === "build") {
  const named = new Map();
  /** Name and search words from what the generator made (EN / VI). */
  const describe = (kind, info) => {
    const RATIO = { [4 / 5]: ["portrait", "dọc"], 1: ["square", "vuông"], [3 / 4]: ["portrait", "dọc"], [5 / 4]: ["landscape", "ngang"], [2 / 3]: ["tall", "dọc cao"], [3 / 2]: ["wide", "ngang rộng"] };
    const PAPER = { kraft: ["Kraft", "kraft"], white: ["White", "trắng"], cream: ["Cream", "kem"], pink: ["Pink", "hồng"], blue: ["Blue", "xanh dương"], mint: ["Mint", "xanh bạc hà"], black: ["Black", "đen"], newsprint: ["Newsprint", "giấy báo"], yellow: ["Yellow", "vàng"] };
    const FILM = { black: ["black", "đen"], brown: ["brown", "nâu"], amber: ["negative", "âm bản"], grey: ["grey", "xám"] };
    const BORDER = { white: ["white", "trắng"], cream: ["cream", "kem"], black: ["black", "đen"], pink: ["pink", "hồng"], blue: ["blue", "xanh dương"], sage: ["sage", "xanh xám"] };
    if (kind === "tornPhoto") {
      const [en, vi] = RATIO[info.ratio] ?? ["", ""];
      return { name: { en: `Torn photo, ${en}`, vi: `Ảnh xé ${vi}` }, tags: { en: ["torn", "paper", "ripped", "photo", en], vi: ["xé", "giấy xé", "ảnh xé", vi] } };
    }
    if (kind === "tornPaper") {
      const [en, vi] = PAPER[info.paper];
      return { name: { en: `${en} paper, torn window`, vi: `Giấy ${vi} xé ô` }, tags: { en: ["torn", "paper", "hole", en.toLowerCase()], vi: ["xé", "giấy", "lỗ", vi] } };
    }
    if (kind === "film") {
      const [en, vi] = FILM[info.film];
      return {
        name: { en: `${info.n}-frame ${en} film${info.vertical ? ", vertical" : ""}`, vi: `Phim ${vi} ${info.n} khung${info.vertical ? " dọc" : ""}` },
        tags: { en: ["film", "strip", "35mm", "negative", en, ...(info.leak ? ["light leak"] : [])], vi: ["phim", "cuộn phim", "dải phim", vi, ...(info.leak ? ["vệt sáng"] : [])] },
      };
    }
    const [en, vi] = BORDER[info.border];
    const shape = { square: ["square", "vuông"], portrait: ["portrait", "dọc"], wide: ["wide", "ngang"] }[info.kind];
    return {
      name: { en: `Instant photo, ${en}${info.tape ? ", taped" : ""}`, vi: `Ảnh lấy liền viền ${vi}${info.tape ? " có băng dính" : ""}` },
      tags: { en: ["instant", "polaroid", "photo", en, shape[0], ...(info.tape ? ["tape", "washi"] : [])], vi: ["ảnh lấy liền", "polaroid", vi, shape[1], ...(info.tape ? ["băng dính"] : [])] },
    };
  };
  const unique = (name) => {
    const n = (named.get(name.en) ?? 0) + 1;
    named.set(name.en, n);
    return n === 1 ? name : { en: `${name.en} ${n}`, vi: `${name.vi} ${n}` };
  };
  const picks = JSON.parse(readFileSync(path.join(ROOT, "scripts", "frames", "picks.json"), "utf8"));
  const today = new Date().toISOString().slice(0, 10);
  for (const pack of picks.packs) {
    const make = KINDS[pack.kind];
    const out = path.join(PACKS, "frame", pack.id);
    mkdirSync(out, { recursive: true });
    const items = [];
    for (const seed of pack.seeds) {
      const f = make(seed);
      const auto = describe(pack.kind, f.info);
      const it = { id: `${pack.prefix}-${seed}`, seed, name: unique(auto.name), tags: auto.tags };
      const long = 1400;
      const k = Math.min(1, long / Math.max(f.width, f.height));
      const width = Math.round(f.width * k);
      const height = Math.round(f.height * k);
      const img = sharp(Buffer.from(f.svg)).resize(width, height);
      await img.clone().webp({ quality: 88, alphaQuality: 95 }).toFile(path.join(out, `${it.id}.webp`));
      writeFileSync(path.join(out, `${it.id}.thumb.webp`), await preview(f, 192));
      items.push({
        id: it.id,
        name: it.name,
        tags: it.tags,
        ...(it.collections ? { collections: it.collections } : {}),
        source: { provider: "IG Layout", author: "sonth87", title: `${pack.kind} #${it.seed}`, url: `https://github.com/sonth87/IG-layout/blob/main/scripts/frames/kinds.mjs#${pack.kind}-${it.seed}`, license: "CC0-1.0", retrieved: today },
        width,
        height,
        windows: f.windows,
      });
    }
    const dir = path.join(ASSETS, "frame", pack.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "manifest.json"), JSON.stringify({ id: pack.id, kind: "frame", name: pack.name, collections: pack.collections, order: pack.order, items }, null, 2) + "\n");
    console.log(`${pack.id}: ${items.length} frames`);
  }
} else {
  console.log("usage: generate.mjs explore <kind> <count> [firstSeed] | build");
}
