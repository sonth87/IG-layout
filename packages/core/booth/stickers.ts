import { PROPS } from "../elements/props";

// Stickers on a booth print (owner, 2026-10-30): props and occasion pieces from the shared
// sticker set (elements/props.ts, also in IG Layout's library), placed by hand — where, how
// big, turned, flipped, recoloured; bubbles and signs carry the user's words.

export interface BoothSticker {
  id: string;
  key: string;
  /** Centre and width on the sheet, frame units; height from the sticker's aspect. */
  x: number;
  y: number;
  w: number;
  rot: number;
  flip?: boolean;
  color?: string;
  /** Words in a bubble / sign (default: the sticker's own). */
  text?: string;
}

/** A sticker ready to draw: its picture (an SVG image, loaded by the app). */
export interface StickerDraw extends BoothSticker {
  img: CanvasImageSource;
  h: number;
}

export function stickerAspect(key: string) {
  const p = PROPS[key];
  return p ? p.h / p.w : 1;
}

/** Draw the stickers, in order (last on top), with their words fitted into the text box. */
export function drawStickers(c: CanvasRenderingContext2D, list: StickerDraw[] | undefined, font: string) {
  for (const s of list ?? []) {
    const p = PROPS[s.key];
    c.save();
    c.translate(s.x, s.y);
    c.rotate((s.rot * Math.PI) / 180);
    c.save();
    if (s.flip) c.scale(-1, 1);
    c.drawImage(s.img, -s.w / 2, -s.h / 2, s.w, s.h);
    c.restore();
    const box = p?.text;
    const words = (s.text ?? box?.value ?? "").trim();
    if (box && words) {
      const k = s.w / p.w;
      const bx = -s.w / 2 + box.x * k;
      const by = -s.h / 2 + box.y * k;
      const bw = box.w * k;
      const bh = box.h * k;
      // Fit: one line if it goes, else two, as big as the box allows.
      c.fillStyle = box.color;
      c.textAlign = "center";
      c.textBaseline = "middle";
      const fit = (lines: string[]) => {
        let size = bh / lines.length / 1.15;
        c.font = `700 ${size}px ${font}`;
        const widest = Math.max(...lines.map((l) => c.measureText(l).width));
        if (widest > bw) size *= bw / widest;
        return size;
      };
      let lines = [words];
      let size = fit(lines);
      if (size < bh * 0.42 && words.includes(" ")) {
        const mid = words.lastIndexOf(" ", Math.ceil(words.length / 2)) > 0 ? words.lastIndexOf(" ", Math.ceil(words.length / 2)) : words.indexOf(" ");
        const two = [words.slice(0, mid), words.slice(mid + 1)];
        const s2 = fit(two);
        if (s2 > size) {
          lines = two;
          size = s2;
        }
      }
      c.font = `700 ${size}px ${font}`;
      lines.forEach((l, i) => c.fillText(l, bx + bw / 2, by + bh / 2 + (i - (lines.length - 1) / 2) * size * 1.1));
    }
    c.restore();
  }
}
