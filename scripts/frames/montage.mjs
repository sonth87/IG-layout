// Contact sheet of review previews (for picking seeds): montage.mjs <dir> <out.png> [cols] [cell]
import sharp from "sharp";
import { readdirSync } from "node:fs";
import path from "node:path";
const [dir, out, cols = 4, cell = 300] = process.argv.slice(2);
const files = readdirSync(dir).filter((f) => f.endsWith(".webp")).sort((a, b) => parseInt(a) - parseInt(b)).slice(0, 64);
const c = Number(cols), s = Number(cell);
const rows = Math.ceil(files.length / c);
const layers = [];
for (let i = 0; i < files.length; i++) {
  const buf = await sharp(path.join(dir, files[i])).resize(s - 10, s - 10, { fit: "contain", background: "#e9e6e0" }).png().toBuffer();
  const label = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="22"><rect width="60" height="22" fill="#fff"/><text x="4" y="16" font-size="14" font-family="sans-serif">${parseInt(files[i])}</text></svg>`);
  layers.push({ input: buf, left: (i % c) * s + 5, top: Math.floor(i / c) * s + 5 }, { input: label, left: (i % c) * s + 5, top: Math.floor(i / c) * s + 5 });
}
await sharp({ create: { width: c * s, height: rows * s, channels: 3, background: "#e9e6e0" } }).composite(layers).png().toFile(out);
