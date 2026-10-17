// A small fake catalog served in place of /packs/ (M20): two packs made from the
// fixture photos, so the libraries can be tested before real packs exist.
import path from "node:path";
import sharp from "sharp";
import { FIXTURES } from "./lib.mjs";

const credit = { provider: "Test", license: "CC0-1.0", url: "https://example.org/", items: 3 };

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
  files["sticker/test-stickers.json"] = JSON.stringify(items);
  files["overlay/test-overlays.json"] = JSON.stringify([overlay]);
  files["catalog.json"] = JSON.stringify({
    version: 1,
    packs: [
      { id: "test-stickers", kind: "sticker", name: { en: "Test stickers", vi: "Sticker thử" }, collections: ["vintage"], order: 1, count: 3, file: "sticker/test-stickers.json", preview: items.slice(0, 2) },
      { id: "test-overlays", kind: "overlay", name: { en: "Test overlays", vi: "Lớp phủ thử" }, collections: ["film"], order: 1, count: 1, file: "overlay/test-overlays.json", preview: [overlay] },
    ],
    fonts: [],
    credits: [credit],
  });
  return files;
}

/** Serves the fake packs for every page of `context`. */
export async function routePacks(context) {
  const files = await fakePacks();
  await context.route("**/packs/**", (route) => {
    const rel = new URL(route.request().url()).pathname.replace(/^\/packs\//, "");
    const body = files[rel];
    if (body === undefined) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ status: 200, body, contentType: rel.endsWith(".json") ? "application/json" : "image/webp" });
  });
}
