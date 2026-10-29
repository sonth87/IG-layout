import type { BoothFrame } from "./frames";

// Draws a booth frame (D-152) with its shots: the preview in the picker / result screen and
// the exported file come from this one function, so what you see is what you save. The
// look is the Cinema theme for now (docs/discussions/2026-10-29-booth-thiet-ke.md §4);
// themes become data later.

export interface ShotImage {
  source: CanvasImageSource;
  width: number;
  height: number;
}

export interface RenderOptions {
  /** Output scale (1 = the frame's full size). */
  scale?: number;
  /** Flip every shot left ↔ right (D-153: off by default). */
  flip?: boolean;
  date?: Date;
  fonts?: { serif: string; mono: string };
  /** Number the empty cells (picker thumbnails, shots still to take). */
  numbers?: boolean;
}

export const CINEMA = { bg: "#15110e", paper: "#efe6d6", brick: "#b5452f", empty: "#2a231d", ghost: "#3d332a" };

export function renderFrame(canvas: HTMLCanvasElement, frame: BoothFrame, shots: (ShotImage | null)[], opts: RenderOptions = {}) {
  const s = opts.scale ?? 1;
  canvas.width = Math.round(frame.width * s);
  canvas.height = Math.round(frame.height * s);
  const c = canvas.getContext("2d")!;
  c.setTransform(s, 0, 0, s, 0, 0);
  c.fillStyle = CINEMA.bg;
  c.fillRect(0, 0, frame.width, frame.height);
  if (frame.holes) holes(c, frame);

  for (const cell of frame.cells) {
    const img = shots[cell.shot];
    c.save();
    c.beginPath();
    c.rect(cell.x, cell.y, cell.w, cell.h);
    c.clip();
    if (img) {
      // Cover: fill the cell, crop the centre.
      const k = Math.max(cell.w / img.width, cell.h / img.height);
      const w = img.width * k;
      const h = img.height * k;
      const x = cell.x + (cell.w - w) / 2;
      const y = cell.y + (cell.h - h) / 2;
      if (opts.flip) {
        c.translate(cell.x * 2 + cell.w, 0);
        c.scale(-1, 1);
      }
      c.drawImage(img.source, x, y, w, h);
    } else {
      empty(c, cell, opts.numbers ? cell.shot + 1 : null, opts.fonts?.mono);
    }
    c.restore();
  }
  caption(c, frame, opts);
}

/** An empty cell: a grey figure, like ColorME's "Ảnh 2". */
function empty(c: CanvasRenderingContext2D, cell: { x: number; y: number; w: number; h: number }, n: number | null, mono = "monospace") {
  c.fillStyle = CINEMA.empty;
  c.fillRect(cell.x, cell.y, cell.w, cell.h);
  const r = Math.min(cell.w, cell.h) * 0.16;
  const cx = cell.x + cell.w / 2;
  const cy = cell.y + cell.h * 0.45;
  c.fillStyle = CINEMA.ghost;
  c.beginPath();
  c.arc(cx, cy - r * 0.3, r, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.ellipse(cx, cy + r * 2.4, r * 2, r * 1.5, 0, Math.PI, 0);
  c.fill();
  if (n !== null) {
    c.fillStyle = CINEMA.paper;
    c.globalAlpha = 0.55;
    c.font = `700 ${Math.round(Math.min(cell.w, cell.h) * 0.12)}px ${mono}`;
    c.textAlign = "left";
    c.textBaseline = "top";
    c.fillText(String(n).padStart(2, "0"), cell.x + cell.w * 0.05, cell.y + cell.h * 0.05);
    c.globalAlpha = 1;
  }
}

/** Film sprocket holes in the margin. */
function holes(c: CanvasRenderingContext2D, f: BoothFrame) {
  c.fillStyle = CINEMA.paper;
  c.globalAlpha = 0.85;
  const along = f.holes === "sides" ? f.height : f.width;
  const step = 44;
  for (let p = 18; p + 22 < along; p += step) {
    c.beginPath();
    if (f.holes === "sides") {
      c.roundRect(10, p, 16, 24, 4);
      c.roundRect(f.width - 26, p, 16, 24, 4);
    } else {
      c.roundRect(p, 10, 24, 16, 4);
      c.roundRect(p, f.height - 26, 24, 16, 4);
    }
    c.fill();
  }
  c.globalAlpha = 1;
}

/** Title + date in the foot, like a cinema ticket. */
function caption(c: CanvasRenderingContext2D, f: BoothFrame, opts: RenderOptions) {
  const { x, y, w, h } = f.foot;
  const serif = opts.fonts?.serif ?? "serif";
  const mono = opts.fonts?.mono ?? "monospace";
  const d = opts.date ?? new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const vertical = h > w;
  c.fillStyle = CINEMA.paper;
  c.textAlign = "center";
  c.textBaseline = "middle";
  // Sizes follow the foot's short side, so every frame gets a caption that fits.
  const unit = Math.min(vertical ? w : h, 260);
  const title = Math.round(unit * (vertical ? 0.24 : 0.34));
  const small = Math.max(14, Math.round(unit * 0.1));
  const cx = x + w / 2;
  const cy = y + h / 2;
  c.font = `700 ${title}px ${serif}`;
  c.fillText("Photobooth", cx, cy - small * 0.9, w);
  c.font = `400 ${small}px ${mono}`;
  c.globalAlpha = 0.75;
  c.fillText(date, cx, cy + title * 0.55, w);
  c.globalAlpha = 1;
  // A short brick-red rule above the title, the ticket's tear line.
  c.fillStyle = CINEMA.brick;
  c.fillRect(cx - unit * 0.12, cy - small * 0.9 - title * 0.75, unit * 0.24, Math.max(2, unit * 0.015));
}

export function frameBlob(frame: BoothFrame, shots: (ShotImage | null)[], opts: RenderOptions = {}): Promise<Blob> {
  const canvas = document.createElement("canvas");
  renderFrame(canvas, frame, shots, opts);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92));
}
