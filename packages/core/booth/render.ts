import type { BoothFrame } from "./frames";
import { THEMES, type BoothTheme, type FontRole } from "./themes";

// Draws a booth frame (D-152) with its shots in a theme (themes.ts): the previews and the
// saved file come from this one function, so what you see is what you save. Shots arrive
// already filtered (the app applies the shared colour pipeline first).

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
  theme?: BoothTheme;
  /** Caption title; default: the theme's. */
  title?: string;
  /** Date + time under the title (default on). */
  showDate?: boolean;
  date?: Date;
  /** Font family per role (unloaded roles fall back to serif / monospace). */
  fonts?: Partial<Record<FontRole, string>>;
  /** Number the empty cells (picker thumbnails, shots still to take). */
  numbers?: boolean;
}

/** Kept for callers that only need the Cinema colours. */
export const CINEMA = { bg: "#15110e", paper: "#efe6d6", brick: "#b5452f", empty: "#2a231d", ghost: "#3d332a" };

type Box = { x: number; y: number; w: number; h: number };

export function renderFrame(canvas: HTMLCanvasElement, frame: BoothFrame, shots: (ShotImage | null)[], opts: RenderOptions = {}) {
  const th = opts.theme ?? THEMES[0];
  const s = opts.scale ?? 1;
  canvas.width = Math.round(frame.width * s);
  canvas.height = Math.round(frame.height * s);
  const c = canvas.getContext("2d")!;
  c.setTransform(s, 0, 0, s, 0, 0);
  paper(c, frame, th);
  decor(c, frame, th);
  if (frame.holes && th.holes) holes(c, frame, th.holes);

  for (const box of frame.cells) {
    const img = shots[box.shot];
    // A bordered theme draws the border on the cell and the photo inside it, so the gaps
    // between cells stay.
    const b = th.cellBorder;
    const cell = b ? { ...box, x: box.x + b.width, y: box.y + b.width, w: box.w - b.width * 2, h: box.h - b.width * 2 } : box;
    if (b) {
      c.fillStyle = b.color;
      rounded(c, box, (th.cellRadius ?? 0) + b.width);
      c.fill();
    }
    c.save();
    rounded(c, cell, th.cellRadius ?? 0);
    c.clip();
    if (img) {
      // Cover: fill the cell, crop the centre.
      const k = Math.max(cell.w / img.width, cell.h / img.height);
      const w = img.width * k;
      const h = img.height * k;
      if (opts.flip) {
        c.translate(cell.x * 2 + cell.w, 0);
        c.scale(-1, 1);
      }
      c.drawImage(img.source, cell.x + (cell.w - w) / 2, cell.y + (cell.h - h) / 2, w, h);
    } else {
      empty(c, cell, th, opts.numbers ? cell.shot + 1 : null, font(opts, "mono"));
    }
    c.restore();
  }
  caption(c, frame, th, opts);
}

function font(opts: RenderOptions, role: FontRole) {
  return opts.fonts?.[role] ?? (role === "mono" ? "monospace" : "serif");
}

function rounded(c: CanvasRenderingContext2D, b: Box, r: number) {
  c.beginPath();
  if (r > 0) c.roundRect(b.x, b.y, b.w, b.h, r);
  else c.rect(b.x, b.y, b.w, b.h);
}

function paper(c: CanvasRenderingContext2D, f: BoothFrame, th: BoothTheme) {
  if (Array.isArray(th.bg)) {
    const g = c.createLinearGradient(0, 0, f.width * 0.3, f.height);
    th.bg.forEach((col, i) => g.addColorStop(i / (th.bg.length - 1), col));
    c.fillStyle = g;
  } else c.fillStyle = th.bg;
  c.fillRect(0, 0, f.width, f.height);
}

/** A fixed pseudo-random sequence, so a print's decoration never changes between redraws. */
function rng(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function decor(c: CanvasRenderingContext2D, f: BoothFrame, th: BoothTheme) {
  const unit = Math.min(f.width, f.height) / 600;
  if (th.decor === "dots") {
    // Polka dots, alternating white and the theme's accent.
    const step = 46 * unit;
    for (let y = step / 2, row = 0; y < f.height; y += step, row++)
      for (let x = (row % 2 ? step / 2 : 0) + step / 4; x < f.width; x += step) {
        // Not behind the caption: it stays readable.
        const ft = f.foot;
        if (x > ft.x - 8 * unit && x < ft.x + ft.w + 8 * unit && y > ft.y && y < ft.y + ft.h) continue;
        c.fillStyle = (row + Math.round(x / step)) % 3 === 0 ? th.accent : "#ffffff";
        c.globalAlpha = 0.75;
        c.beginPath();
        c.arc(x, y, 7 * unit, 0, Math.PI * 2);
        c.fill();
      }
    c.globalAlpha = 1;
  } else if (th.decor === "suits") {
    // Card suits along the edges, red and black, like a deck of cards.
    const glyphs = ["♠", "♥", "♣", "♦"];
    const size = 22 * unit;
    c.font = `${size}px serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    const edge = 14 * unit;
    let i = 0;
    const put = (x: number, y: number) => {
      const g = glyphs[i++ % 4];
      c.fillStyle = g === "♥" || g === "♦" ? th.accent : th.ink;
      c.globalAlpha = 0.8;
      c.fillText(g, x, y);
    };
    const step = 40 * unit;
    for (let x = step / 2; x < f.width; x += step) {
      put(x, edge);
      put(x, f.height - edge);
    }
    for (let y = step * 1.5; y < f.height - step; y += step) {
      put(edge, y);
      put(f.width - edge, y);
    }
    c.globalAlpha = 1;
    // A double rule inside, like an old playing card.
    c.strokeStyle = th.ink;
    c.lineWidth = 2 * unit;
    c.strokeRect(26 * unit, 26 * unit, f.width - 52 * unit, f.height - 52 * unit);
  } else if (th.decor === "stars") {
    // Four-point sparkles, scattered (same places every time).
    const r = rng(7);
    const n = Math.round((f.width * f.height) / (90 * 90 * unit * unit));
    for (let i = 0; i < n; i++) {
      const x = r() * f.width;
      const y = r() * f.height;
      const s = (6 + r() * 14) * unit;
      c.fillStyle = r() < 0.4 ? th.accent : "#ffffff";
      c.globalAlpha = 0.9;
      c.beginPath();
      c.moveTo(x, y - s);
      c.quadraticCurveTo(x, y, x + s, y);
      c.quadraticCurveTo(x, y, x, y + s);
      c.quadraticCurveTo(x, y, x - s, y);
      c.quadraticCurveTo(x, y, x, y - s);
      c.fill();
    }
    c.globalAlpha = 1;
  } else if (th.decor === "grain") {
    const r = rng(3);
    const n = Math.round((f.width * f.height) / 260);
    c.fillStyle = "#ffffff";
    for (let i = 0; i < n; i++) {
      c.globalAlpha = r() * 0.08;
      c.fillRect(r() * f.width, r() * f.height, 1.5, 1.5);
    }
    c.globalAlpha = 1;
  }
}

/** An empty cell: a grey figure, like ColorME's "Ảnh 2". */
function empty(c: CanvasRenderingContext2D, cell: Box, th: BoothTheme, n: number | null, mono: string) {
  c.fillStyle = th.empty;
  c.fillRect(cell.x, cell.y, cell.w, cell.h);
  const r = Math.min(cell.w, cell.h) * 0.16;
  const cx = cell.x + cell.w / 2;
  const cy = cell.y + cell.h * 0.45;
  c.fillStyle = th.ghost;
  c.beginPath();
  c.arc(cx, cy - r * 0.3, r, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.ellipse(cx, cy + r * 2.4, r * 2, r * 1.5, 0, Math.PI, 0);
  c.fill();
  if (n !== null) {
    c.fillStyle = th.ink;
    c.globalAlpha = 0.5;
    c.font = `700 ${Math.round(Math.min(cell.w, cell.h) * 0.12)}px ${mono}`;
    c.textAlign = "left";
    c.textBaseline = "top";
    c.fillText(String(n).padStart(2, "0"), cell.x + cell.w * 0.05, cell.y + cell.h * 0.05);
    c.globalAlpha = 1;
  }
}

/** Film sprocket holes in the margin. */
function holes(c: CanvasRenderingContext2D, f: BoothFrame, color: string) {
  c.fillStyle = color;
  const along = f.holes === "sides" ? f.height : f.width;
  for (let p = 18; p + 22 < along; p += 44) {
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
}

/** Title + date in the foot, like a ticket. */
function caption(c: CanvasRenderingContext2D, f: BoothFrame, th: BoothTheme, opts: RenderOptions) {
  const { x, y, w, h } = f.foot;
  const d = opts.date ?? new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const showDate = opts.showDate !== false;
  let text = (opts.title ?? th.title.text).trim();
  if (th.title.upper) text = text.toUpperCase();
  const vertical = h > w;
  c.fillStyle = th.ink;
  c.textAlign = "center";
  c.textBaseline = "middle";
  // Sizes follow the foot's short side, so every frame gets a caption that fits.
  const unit = Math.min(vertical ? w : h, 260);
  const title = Math.round(unit * (vertical ? 0.24 : 0.34) * (th.title.font === "y2k" ? 0.8 : 1));
  const small = Math.max(14, Math.round(unit * 0.1));
  const cx = x + w / 2;
  const ty = showDate ? y + h / 2 - small * 0.9 : y + h / 2;
  if (text) {
    c.font = `${th.title.italic ? "italic " : ""}${th.title.weight} ${title}px ${font(opts, th.title.font)}`;
    c.fillText(text, cx, ty, w);
  }
  if (showDate) {
    c.font = `400 ${small}px ${font(opts, th.sub.font)}`;
    c.globalAlpha = 0.75;
    c.fillText(date, cx, text ? ty + title * 0.55 + small * 0.9 : y + h / 2, w);
    c.globalAlpha = 1;
  }
  // A short rule above the title, the ticket's tear line.
  if (text) {
    c.fillStyle = th.accent;
    c.fillRect(cx - unit * 0.12, ty - title * 0.75, unit * 0.24, Math.max(2, unit * 0.015));
  }
}

export function frameBlob(frame: BoothFrame, shots: (ShotImage | null)[], opts: RenderOptions = {}): Promise<Blob> {
  const canvas = document.createElement("canvas");
  renderFrame(canvas, frame, shots, opts);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92));
}
