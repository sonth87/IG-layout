// Close-up of one generated frame over a photo (checking edges): zoom.mjs <kind> <seed> <x> <y> <w> <h> <out.png>
import sharp from "sharp";
import { KINDS } from "./kinds.mjs";
const [kind, seed, x, y, w, h, out] = process.argv.slice(2);
const f = KINDS[kind](Number(seed));
const art = await sharp(Buffer.from(f.svg)).png().toBuffer();
const photo = await sharp(decodeURIComponent(new URL("../../e2e/fixtures/portrait.jpg", import.meta.url).pathname)).resize(f.width, f.height, { fit: "cover" }).png().toBuffer();
const win = f.windows[0];
let ph = await sharp(photo).extract({ left: 0, top: 0, width: Math.round(win.w * f.width), height: Math.round(win.h * f.height) }).png().toBuffer();
if (win.points) {
  const bw = Math.round(win.w * f.width), bh = Math.round(win.h * f.height);
  const pts = []; for (let i = 0; i < win.points.length; i += 2) pts.push(`${win.points[i] * bw},${win.points[i + 1] * bh}`);
  ph = await sharp(ph).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${bw}" height="${bh}"><polygon points="${pts.join(" ")}" fill="#fff"/></svg>`), blend: "dest-in" }]).png().toBuffer();
}
const comp = await sharp({ create: { width: f.width, height: f.height, channels: 4, background: "#e9e6e0" } }).composite([{ input: ph, left: Math.round(win.x * f.width), top: Math.round(win.y * f.height) }, { input: art }]).png().toBuffer();
await sharp(comp).extract({ left: +x, top: +y, width: +w, height: +h }).resize(+w * 2).png().toFile(out);
