// A small fake catalog served in place of /packs/ (M20): two packs made from the
// fixture photos, so the libraries can be tested before real packs exist.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { FIXTURES } from "./lib.mjs";

const credits = [{ provider: "Test", license: "CC-BY-4.0", url: "https://example.org/", items: 3 }, { provider: "Public domain source", license: "CC0-1.0", url: "https://example.org/pd", items: 1 }];

async function webp(file, size, crop) {
  let img = sharp(path.join(FIXTURES, file));
  if (crop) img = img.extract(crop);
  return img.resize(size, size, { fit: "inside" }).webp().toBuffer();
}

export async function fakePacks() {
  const files = {};
  const items = [];
  const names = [["Red stamp", "Tem đỏ", "stamp red"], ["Blue ticket", "Vé xanh", "ticket blue"], ["Flower", "Hoa", "flower floral"]];
  for (let i = 0; i < 3; i++) {
    const id = `item-${i}`;
    const buf = await webp("p3.jpg", 512, { left: i * 200, top: 100, width: 400, height: 300 });
    const meta = await sharp(buf).metadata();
    files[`sticker/test-stickers/${id}.webp`] = buf;
    files[`sticker/test-stickers/${id}.thumb.webp`] = await sharp(buf).resize(192, 192, { fit: "inside" }).webp().toBuffer();
    items.push({ id: `test-stickers/${id}`, name: { en: names[i][0], vi: names[i][1] }, search: `${names[i][0]} ${names[i][1]} ${names[i][2]}`.toLowerCase(), collections: ["vintage"], file: `sticker/test-stickers/${id}.webp`, thumb: `sticker/test-stickers/${id}.thumb.webp`, width: meta.width, height: meta.height, credit: 0 });
  }
  const leak = await webp("p4.jpg", 800);
  const lm = await sharp(leak).metadata();
  files["overlay/test-overlays/leak.webp"] = leak;
  files["overlay/test-overlays/leak.thumb.webp"] = await sharp(leak).resize(192, 192, { fit: "inside" }).webp().toBuffer();
  const overlay = { id: "test-overlays/leak", name: { en: "Test leak", vi: "Vệt thử" }, search: "test leak vệt thử", collections: ["film"], file: "overlay/test-overlays/leak.webp", thumb: "overlay/test-overlays/leak.thumb.webp", width: lm.width, height: lm.height, credit: 0, blend: "screen" };
  const paper = await sharp(path.join(FIXTURES, "p4.jpg")).resize(256, 256).webp().toBuffer();
  files["texture/test-textures/paper.webp"] = paper;
  files["texture/test-textures/paper.thumb.webp"] = await sharp(paper).resize(192, 192).webp().toBuffer();
  const texture = { id: "test-textures/paper", name: { en: "Test paper", vi: "Giấy thử" }, search: "test paper giấy thử", collections: ["journal"], file: "texture/test-textures/paper.webp", thumb: "texture/test-textures/paper.thumb.webp", width: 256, height: 256, credit: 0, tile: true };
  files["texture/test-textures.json"] = JSON.stringify([texture]);
  files["sticker/test-stickers.json"] = JSON.stringify(items);
  files["overlay/test-overlays.json"] = JSON.stringify([overlay]);
  // A frame: gold art 600 × 750 with a rectangle window and an oval window.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750"><path fill-rule="evenodd" fill="#c8a24a" d="M0 0H600V750H0Z M60 60H540V435H60Z M300 495 m-150 0 a150 97.5 0 1 0 300 0 a150 97.5 0 1 0 -300 0Z"/></svg>`;
  const art = await sharp(Buffer.from(svg)).webp({ lossless: true }).toBuffer();
  files["frame/test-frames/gold.webp"] = art;
  files["frame/test-frames/gold.thumb.webp"] = await sharp(art).resize(192, 192, { fit: "inside" }).webp().toBuffer();
  const frame = { id: "test-frames/gold", name: { en: "Gold frame", vi: "Khung vàng" }, search: "gold frame khung vàng", collections: ["vintage"], file: "frame/test-frames/gold.webp", thumb: "frame/test-frames/gold.thumb.webp", width: 600, height: 750, credit: 0, windows: [{ x: 0.1, y: 0.08, w: 0.8, h: 0.5 }, { x: 0.25, y: 0.53, w: 0.5, h: 0.26, shape: "ellipse" }] };
  files["frame/test-frames.json"] = JSON.stringify([frame]);
  // Two fonts made from a font file of the build (any woff2 will do for the test).
  const media = path.join(FIXTURES, "..", "..", "out", "_next", "static", "media");
  const woff = readdirSync(media).find((f) => f.endsWith(".woff2"));
  files["font/test/test-hand/latin-400.woff2"] = readFileSync(path.join(media, woff));
  files["font/test/test-jp/jp-400.woff2"] = readFileSync(path.join(media, woff));
  const fonts = [
    { id: "test-hand", family: "Test Hand", label: "Test Hand", styles: ["handwriting"], languages: ["latin", "vietnamese"], weights: [400], files: [{ weight: 400, subset: "latin", file: "font/test/test-hand/latin-400.woff2", unicodeRange: "U+0000-024F,U+1EA0-1EF9" }], credit: 0, search: "test hand", collections: ["handDrawn"] },
    { id: "test-jp", family: "Test JP", label: "Test JP", styles: ["sans"], languages: ["japanese"], weights: [400, 700], files: [{ weight: 400, subset: "japanese", file: "font/test/test-jp/jp-400.woff2", unicodeRange: "U+0000-FFFF" }], credit: 0, search: "test jp", collections: ["japan"] },
  ];
  files["catalog.json"] = JSON.stringify({
    version: 1,
    packs: [
      { id: "test-stickers", kind: "sticker", name: { en: "Test stickers", vi: "Sticker thử" }, collections: ["vintage"], order: 1, count: 3, file: "sticker/test-stickers.json", preview: items.slice(0, 2) },
      { id: "test-frames", kind: "frame", name: { en: "Test frames", vi: "Khung thử" }, collections: ["vintage"], order: 1, count: 1, file: "frame/test-frames.json", preview: [frame] },
      { id: "test-textures", kind: "texture", name: { en: "Test textures", vi: "Chất liệu thử" }, collections: ["journal"], order: 1, count: 1, file: "texture/test-textures.json", preview: [texture] },
      { id: "test-overlays", kind: "overlay", name: { en: "Test overlays", vi: "Lớp phủ thử" }, collections: ["film"], order: 1, count: 1, file: "overlay/test-overlays.json", preview: [overlay] },
    ],
    fonts,
    credits,
  });
  return files;
}

/** Serves the fake packs for every page of `context`. */
export async function routePacks(context) {
  const files = await fakePacks();
  await context.route("**/packs/**", (route) => {
    const rel = new URL(route.request().url()).pathname.replace(/^\/packs\//, "");
    const body = files[rel];
    // Pictures the home templates show (real pack files, 2026-10-28): served as they are.
    if (body === undefined) return rel.endsWith(".webp") ? route.continue() : route.fulfill({ status: 404, body: "" });
    return route.fulfill({ status: 200, body, contentType: rel.endsWith(".json") ? "application/json" : "image/webp" });
  });
}
