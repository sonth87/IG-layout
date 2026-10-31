// Duo (owner, 2026-10-31): a room of two shoots like solo — spare shots, each picks their own —
// and every shot is the two of them together, put together one of several ways:
// - one frame split down the middle (side by side) or across (one above the other);
// - two polaroids of their own: straight, tilted apart, staggered, or one laid over the other.
// The two photos are kept, so the way can change after shooting. Polaroid ways leave the
// space around the cards clear (PNG), so the print's paper shows through.

export type DuoArrange = "side" | "stack" | "twin" | "tilt" | "offset" | "overlap";
export const DUO_ARRANGES: DuoArrange[] = ["side", "stack", "twin", "tilt", "offset", "overlap"];

/** Ways with two polaroids of their own (the rest share one frame). */
export const isDuoCards = (a: DuoArrange) => a !== "side" && a !== "stack";

const WIDTH = 1600;
const CARD = "#fbf8f1";

type Img = ImageBitmap;

/** `img` cropped to fill (x, y, w, h). */
function cover(c: CanvasRenderingContext2D, img: Img, x: number, y: number, w: number, h: number) {
  const k = Math.max(w / img.width, h / img.height);
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  c.drawImage(img, x + (w - img.width * k) / 2, y + (h - img.height * k) / 2, img.width * k, img.height * k);
  c.restore();
}

/** A polaroid card `w` wide, centred on (cx, cy), turned `rot` degrees: photo 4:5, a white
 * border, a deeper bottom. Returns its height. */
const cardH = (w: number) => w * 0.05 + (w * 0.9) / 0.8 + w * 0.2;
function card(c: CanvasRenderingContext2D, img: Img, cx: number, cy: number, w: number, rot: number) {
  const h = cardH(w);
  c.save();
  c.translate(cx, cy);
  c.rotate((rot * Math.PI) / 180);
  c.shadowColor = "rgba(0,0,0,0.32)";
  c.shadowBlur = w * 0.05;
  c.shadowOffsetY = w * 0.02;
  c.fillStyle = CARD;
  c.fillRect(-w / 2, -h / 2, w, h);
  c.shadowColor = "transparent";
  const pw = w * 0.9;
  cover(c, img, -pw / 2, -h / 2 + w * 0.05, pw, pw / 0.8);
  c.restore();
}

/** The two photos of one shot put together `arrange`'s way, a picture of aspect `cell` (w / h). */
export async function composeDuo(a: Blob, b: Blob, arrange: DuoArrange, cell: number): Promise<Blob> {
  const [ia, ib] = await Promise.all([createImageBitmap(a), createImageBitmap(b)]);
  const W = WIDTH;
  const H = Math.round(WIDTH / cell);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  const gap = Math.round(W * 0.012);
  if (arrange === "side") {
    const w = (W - gap) / 2;
    c.fillStyle = CARD;
    c.fillRect(0, 0, W, H);
    cover(c, ia, 0, 0, w, H);
    cover(c, ib, w + gap, 0, w, H);
  } else if (arrange === "stack") {
    const h = (H - gap) / 2;
    c.fillStyle = CARD;
    c.fillRect(0, 0, W, H);
    cover(c, ia, 0, 0, W, h);
    cover(c, ib, 0, h + gap, W, h);
  } else {
    // Two cards along the cell's long side: side by side in a wide cell, one above the other
    // in a tall one. A card `w` wide is cardH(1) × w tall; `along` / `across`: the share of
    // the cell one card may take each way.
    const wide = cell >= 0.9;
    const k = cardH(1);
    const fit = (along: number, across: number) => (wide ? Math.min(W * along, (H * across) / k) : Math.min((H * along) / k, W * across));
    const at = (u: number, v: number): [number, number] => (wide ? [W * u, H * v] : [W * v, H * u]);
    const spec: Record<Exclude<DuoArrange, "side" | "stack">, { size: number; a: [number, number, number]; b: [number, number, number]; scaleB?: number }> = {
      twin: { size: fit(0.42, 0.9), a: [0.27, 0.5, 0], b: [0.73, 0.5, 0] },
      tilt: { size: fit(0.46, 0.86), a: [0.31, 0.5, -7], b: [0.69, 0.52, 6] },
      offset: { size: fit(0.44, 0.78), a: [0.31, 0.42, -2], b: [0.69, 0.58, 3] },
      overlap: { size: fit(0.52, 0.86), a: [0.38, 0.47, -5], b: [0.66, 0.56, 8], scaleB: 0.84 },
    };
    const sp = spec[arrange];
    const [ax, ay] = at(sp.a[0], sp.a[1]);
    const [bx, by] = at(sp.b[0], sp.b[1]);
    card(c, ia, ax, ay, sp.size, sp.a[2]);
    card(c, ib, bx, by, sp.size * (sp.scaleB ?? 1), sp.b[2]);
  }
  ia.close();
  ib.close();
  const type = isDuoCards(arrange) ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), type, 0.92));
}
