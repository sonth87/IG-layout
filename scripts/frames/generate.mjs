// Frame generator CLI (M20 C7, D-107).
//   node scripts/frames/generate.mjs explore <kind> <count> [firstSeed]
//     → assets/_review/frames/<kind>/index.html: every seed over a sample photo, to pick from.
//   node scripts/frames/generate.mjs build
//     → the picked seeds (scripts/frames/picks.json) as frame packs in assets/ + public/packs/.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ASSETS, PACKS, ROOT } from "../assets/common.mjs";
import { KINDS as FRAME_KINDS } from "./kinds.mjs";
import { STICKER_KINDS } from "./stickers.mjs";

const KINDS = { ...FRAME_KINDS, ...STICKER_KINDS };

const [cmd, kind, countArg, firstArg] = process.argv.slice(2);
const PHOTO = path.join(ROOT, "e2e", "fixtures", "portrait.jpg");

/** The art with a photo under its windows (what the user will see). */
async function preview(f, size = 520) {
  const art = await sharp(Buffer.from(f.svg)).png().toBuffer();
  const layers = [];
  for (const w of f.windows ?? []) {
    const bw = Math.max(1, Math.round(w.w * f.width));
    const bh = Math.max(1, Math.round(w.h * f.height));
    let photo = await sharp(PHOTO).resize(bw, bh, { fit: "cover" }).png().toBuffer();
    if (w.points) {
      const pts = [];
      for (let i = 0; i < w.points.length; i += 2) pts.push(`${(w.points[i] * bw).toFixed(1)},${(w.points[i + 1] * bh).toFixed(1)}`);
      const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${bw}" height="${bh}"><polygon points="${pts.join(" ")}" fill="#fff"/></svg>`);
      photo = await sharp(photo).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
    }
    if (w.rotation) {
      const turned = await sharp(photo).rotate(w.rotation, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
      const m = await sharp(turned).metadata();
      layers.push({ input: turned, left: Math.round(w.x * f.width + bw / 2 - m.width / 2), top: Math.round(w.y * f.height + bh / 2 - m.height / 2) });
    } else layers.push({ input: photo, left: Math.round(w.x * f.width), top: Math.round(w.y * f.height) });
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
    if (kind === "washi") {
    const P = { solid: ["plain", "trơn"], stripes: ["striped", "kẻ sọc"], dots: ["dotted", "chấm bi"], grid: ["grid", "kẻ ô"], gingham: ["gingham", "caro"], diagonal: ["diagonal", "sọc chéo"], dash: ["dashed", "nét đứt"], waves: ["wavy", "lượn sóng"], hearts: ["hearts", "trái tim"], stars: ["stars", "ngôi sao"] }[info.pattern];
    return { name: { en: `Washi tape, ${P[0]}`, vi: `Băng dính ${P[1]}` }, tags: { en: ["washi", "tape", "masking tape", P[0]], vi: ["băng dính", "washi", "băng keo", P[1]] } };
  }
  if (kind === "note") {
    const C = { yellow: ["yellow", "vàng"], pink: ["pink", "hồng"], blue: ["blue", "xanh dương"], green: ["green", "xanh lá"], orange: ["orange", "cam"], purple: ["purple", "tím"], white: ["white", "trắng"] }[info.color];
    return { name: { en: `Sticky note, ${C[0]}`, vi: `Giấy note ${C[1]}` }, tags: { en: ["sticky note", "note", "memo", "post-it", C[0]], vi: ["giấy note", "giấy nhớ", "ghi chú", C[1]] } };
  }
  if (kind === "scrap") {
    return { name: info.grid ? { en: "Torn grid paper", vi: "Mẩu giấy ô ly xé" } : { en: "Torn notebook paper", vi: "Mẩu giấy vở xé" }, tags: { en: ["paper", "torn", "notebook", "scrap", info.grid ? "grid" : "lined"], vi: ["giấy", "xé", "giấy vở", "mẩu giấy", info.grid ? "ô ly" : "kẻ dòng"] } };
  }
  if (kind === "stamp") return { name: { en: "Postage stamp", vi: "Con tem" }, tags: { en: ["stamp", "postage", "perforated", "mail", ...(info.mark ? ["postmark"] : [])], vi: ["tem", "tem thư", "bưu chính", "răng cưa", ...(info.mark ? ["dấu bưu điện"] : [])] } };
  if (kind === "pictureFrame") {
    const Wd = { oak: ["Oak", "gỗ sồi"], walnut: ["Walnut", "gỗ óc chó"], white: ["White", "trắng"], black: ["Black", "đen"], gold: ["Gold", "vàng"], natural: ["Natural wood", "gỗ mộc"] }[info.wood];
    return { name: { en: `${Wd[0]} picture frame${info.mat ? " with mat" : ""}`, vi: `Khung tranh ${Wd[1]}${info.mat ? " có viền giấy" : ""}` }, tags: { en: ["picture frame", "frame", "wood", Wd[0].toLowerCase()], vi: ["khung tranh", "khung ảnh", "gỗ", Wd[1]] } };
  }
  if (kind === "photoCorners") {
    const P = { kraft: ["kraft", "kraft"], black: ["black", "đen"], cream: ["cream", "kem"], white: ["white", "trắng"], sage: ["sage", "xanh xám"] }[info.page];
    return { name: { en: `Album page, ${P[0]}`, vi: `Trang album ${P[1]}` }, tags: { en: ["album", "photo corners", "scrapbook", P[0]], vi: ["album", "góc dán ảnh", "scrapbook", P[1]] } };
  }
  if (kind === "envelope") {
    const C = { kraft: ["kraft", "kraft"], white: ["white", "trắng"], pink: ["pink", "hồng"], blue: ["blue", "xanh dương"], sage: ["sage", "xanh xám"], red: ["red", "đỏ"] }[info.color];
    return { name: { en: `Envelope, ${C[0]}`, vi: `Phong bì ${C[1]}` }, tags: { en: ["envelope", "letter", "mail", C[0]], vi: ["phong bì", "thư", "lá thư", C[1]] } };
  }
  if (kind === "tornCollage") {
    const L = { "2v": ["2 pieces side by side", "2 mảnh ngang"], "2h": ["2 pieces stacked", "2 mảnh dọc"], "3v": ["3 strips", "3 dải đứng"], "3h": ["3 rows", "3 dải ngang"], 4: ["4 pieces", "4 mảnh"], "1+2": ["1 + 2 pieces", "1 + 2 mảnh"] }[info.layout];
    return { name: { en: `Torn collage, ${L[0]}`, vi: `Ảnh xé ghép ${L[1]}` }, tags: { en: ["torn", "collage", "ripped", "photos", "story"], vi: ["xé", "ảnh xé", "ghép", "nhiều ảnh"] } };
  }
  if (kind === "tornBacked") {
    const PAPER = { kraft: ["kraft", "kraft"], white: ["white", "trắng"], cream: ["cream", "kem"], pink: ["pink", "hồng"], blue: ["blue", "xanh dương"], mint: ["mint", "xanh bạc hà"], black: ["black", "đen"], newsprint: ["newsprint", "giấy báo"], yellow: ["yellow", "vàng"] }[info.paper];
    return { name: { en: `Torn photo on ${PAPER[0]} paper`, vi: `Ảnh xé trên giấy ${PAPER[1]}` }, tags: { en: ["torn", "photo", "paper", PAPER[0]], vi: ["xé", "ảnh xé", "giấy", PAPER[1]] } };
  }
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
    const catalogKind = pack.catalog ?? "frame";
    const out = path.join(PACKS, catalogKind, pack.id);
    mkdirSync(out, { recursive: true });
    const items = [];
    for (const seed of pack.seeds) {
      const f = make(seed);
      const auto = describe(pack.kind, f.info);
      const it = { id: `${pack.prefix}-${seed}`, seed, name: unique(auto.name), tags: auto.tags };
      const long = catalogKind === "sticker" ? 1024 : 1400;
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
        ...(f.windows ? { windows: f.windows } : {}),
      });
    }
    const dir = path.join(ASSETS, catalogKind, pack.id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "manifest.json"), JSON.stringify({ id: pack.id, kind: catalogKind, name: pack.name, collections: pack.collections, order: pack.order, items }, null, 2) + "\n");
    console.log(`${pack.id}: ${items.length} items`);
  }
} else {
  console.log("usage: generate.mjs explore <kind> <count> [firstSeed] | build");
}
