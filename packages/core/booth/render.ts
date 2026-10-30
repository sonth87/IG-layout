import type { BoothFrame } from "./frames";
import { drawDecor, type Decor } from "./decor";
import { shapePath } from "./layout";
import { drawStickers, type StickerDraw } from "./stickers";
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
  /** Stickers placed by hand (stickers.ts), on top of everything. */
  stickers?: StickerDraw[];
  /** Drawn decorations (decor.ts), behind and over the photos. */
  decor?: Decor[];
  /** Empty cells show a grey figure — a shot still to take (frame previews, shooting). Off,
   * an empty cell is a plain panel: room to decorate. */
  placeholders?: boolean;
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
  drawDecor(c, frame, opts.decor, "back");

  const shape = frame.shape ?? "rect";
  const cells = [...frame.cells].sort((p, q) => (p.z ?? 0) - (q.z ?? 0));
  for (const box of cells) {
    const img = shots[box.shot];
    const rot = box.rot ?? 0;
    // Each cell is drawn around its centre (turned prints, shapes).
    c.save();
    c.translate(box.x + box.w / 2, box.y + box.h / 2);
    if (rot) c.rotate((rot * Math.PI) / 180);
    let w = box.w;
    let h = box.h;
    let oy = 0;
    // A turned or polaroid print casts a soft shadow, so prints on top read as on top.
    const lifted = rot !== 0 || shape === "polaroid";
    if (shape === "polaroid") {
      // A white card, the photo inset with a deep bottom edge.
      if (lifted) shadow(c, Math.min(w, h));
      c.fillStyle = "#fbfaf6";
      c.fillRect(-w / 2, -h / 2, w, h);
      c.shadowColor = "transparent";
      const side = Math.min(w, h) * 0.05;
      const foot = Math.min(w, h) * 0.16;
      oy = (side - foot) / 2;
      w -= side * 2;
      h -= side + foot;
    }
    // A bordered theme draws the border on the cell and the photo inside it, so the gaps
    // between cells stay.
    const b = th.cellBorder;
    const radius = th.cellRadius ?? 0;
    if (b && shape !== "polaroid") {
      if (lifted) shadow(c, Math.min(w, h));
      c.fillStyle = b.color;
      shapePath(c, shape, w, h, box.shot + 1, radius + b.width);
      c.fill();
      c.shadowColor = "transparent";
      w -= b.width * 2;
      h -= b.width * 2;
    } else if (lifted && shape !== "polaroid") {
      shadow(c, Math.min(w, h));
      c.fillStyle = th.empty;
      shapePath(c, shape, w, h, box.shot + 1, radius);
      c.fill();
      c.shadowColor = "transparent";
    }
    c.translate(0, oy);
    shapePath(c, shape, w, h, box.shot + 1, shape === "rect" ? radius : 0);
    c.clip();
    if (img) {
      // Cover: fill the cell, crop the centre.
      const k = Math.max(w / img.width, h / img.height);
      if (opts.flip) c.scale(-1, 1);
      c.drawImage(img.source, (-img.width * k) / 2, (-img.height * k) / 2, img.width * k, img.height * k);
    } else {
      empty(c, { x: -w / 2, y: -h / 2, w, h }, th, opts.numbers ? box.shot + 1 : null, font(opts, "mono"), !!opts.placeholders);
    }
    c.restore();
  }
  drawDecor(c, frame, opts.decor, "front");
  if (frame.footPanel) panel(c, frame, th);
  caption(c, frame, th, opts);
  drawStickers(c, opts.stickers, font(opts, "candy"));
}

function font(opts: RenderOptions, role: FontRole) {
  return opts.fonts?.[role] ?? (role === "mono" ? "monospace" : "serif");
}

/** A cell of its own for the caption (frames with a title cell): a plain card in the theme,
 * no border (owner, 2026-10-30) — it reads as part of the paper, not as a missing photo. */
function panel(c: CanvasRenderingContext2D, f: BoothFrame, th: BoothTheme) {
  const { x, y, w, h } = f.foot;
  c.save();
  c.translate(x + w / 2, y + h / 2);
  c.fillStyle = th.empty;
  c.globalAlpha = 0.55;
  shapePath(c, f.shape === "polaroid" ? "rect" : (f.shape ?? "rect"), w, h, 99, th.cellRadius ?? 0);
  c.fill();
  c.restore();
}

function shadow(c: CanvasRenderingContext2D, size: number) {
  c.shadowColor = "rgba(0,0,0,0.28)";
  c.shadowBlur = size * 0.05;
  c.shadowOffsetY = size * 0.02;
}

/** What the paper and its decoration need: a size, and where the caption goes (kept clear). */
type Sheet = Pick<BoothFrame, "width" | "height"> & { foot?: Box };

function paper(c: CanvasRenderingContext2D, f: Sheet, th: BoothTheme) {
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

function decor(c: CanvasRenderingContext2D, f: Sheet, th: BoothTheme) {
  const unit = Math.min(f.width, f.height) / 600;
  if (th.decor === "dots") {
    // Polka dots, alternating white and the theme's accent.
    const step = 46 * unit;
    for (let y = step / 2, row = 0; y < f.height; y += step, row++)
      for (let x = (row % 2 ? step / 2 : 0) + step / 4; x < f.width; x += step) {
        // Not behind the caption: it stays readable.
        const ft = f.foot;
        if (ft && x > ft.x - 8 * unit && x < ft.x + ft.w + 8 * unit && y > ft.y && y < ft.y + ft.h) continue;
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
  } else if (th.decor === "news") {
    // An old newspaper: columns of faint print, rules, a masthead line at the top.
    const r = rng(17);
    const col = 120 * unit;
    const gut = 16 * unit;
    const lh = 9 * unit;
    c.fillStyle = "rgba(28,26,23,0.16)";
    for (let x = 14 * unit; x < f.width - 14 * unit; x += col + gut)
      for (let y = 22 * unit; y < f.height - 10 * unit; y += lh) {
        if (r() < 0.06) {
          y += lh; // a paragraph break
          continue;
        }
        const w = (r() < 0.12 ? 0.4 + r() * 0.4 : 0.92 + r() * 0.08) * Math.min(col, f.width - 14 * unit - x);
        c.fillRect(x, y, w, 3.2 * unit);
      }
    c.fillStyle = "rgba(28,26,23,0.55)";
    c.fillRect(10 * unit, 10 * unit, f.width - 20 * unit, 2.5 * unit);
    c.fillRect(10 * unit, 15 * unit, f.width - 20 * unit, 1 * unit);
    c.fillRect(10 * unit, f.height - 12 * unit, f.width - 20 * unit, 1.5 * unit);
  } else if (th.decor === "grid") {
    // A Vietnamese ô ly notebook: small squares, every fourth line darker, a red margin.
    const sq = 9 * unit;
    for (let i = 0, x = 0; x < f.width; x += sq, i++) {
      c.fillStyle = i % 4 ? "rgba(70,110,200,0.16)" : "rgba(70,110,200,0.38)";
      c.fillRect(x, 0, Math.max(1, unit * (i % 4 ? 0.6 : 1)), f.height);
    }
    for (let i = 0, y = 0; y < f.height; y += sq, i++) {
      c.fillStyle = i % 4 ? "rgba(70,110,200,0.16)" : "rgba(70,110,200,0.38)";
      c.fillRect(0, y, f.width, Math.max(1, unit * (i % 4 ? 0.6 : 1)));
    }
    c.fillStyle = "rgba(226,69,60,0.6)";
    c.fillRect(f.width * 0.07, 0, 1.6 * unit, f.height);
  } else if (th.decor === "stripes") {
    // A circus tent: red and cream stripes, a scalloped gold valance at the top, and a plate
    // behind the caption so it reads.
    const sw = 34 * unit;
    c.fillStyle = "#d8262f";
    for (let x = 0; x < f.width; x += sw * 2) c.fillRect(x, 0, sw, f.height);
    const sc = 26 * unit;
    for (let x = 0; x < f.width + sc; x += sc * 2) {
      c.fillStyle = "#f2b632";
      c.beginPath();
      c.arc(x + sc, 0, sc, 0, Math.PI);
      c.fill();
      c.fillStyle = "#8a1018";
      c.beginPath();
      c.arc(x + sc, 0, sc * 0.55, 0, Math.PI);
      c.fill();
    }
    const ft = f.foot ?? { x: 0, y: f.height, w: f.width, h: 0 };
    c.fillStyle = "#fff4e2";
    c.strokeStyle = "#f2b632";
    c.lineWidth = 4 * unit;
    c.beginPath();
    c.roundRect(ft.x + ft.w * 0.04, ft.y + ft.h * 0.14, ft.w * 0.92, ft.h * 0.72, 14 * unit);
    c.fill();
    c.stroke();
  } else if (th.decor === "neongrid") {
    // Cyberpunk: a glowing floor grid running to the horizon, scanlines over everything.
    const hz = f.height * 0.45;
    const vx = f.width / 2;
    c.save();
    c.shadowColor = "#ff2bd6";
    c.shadowBlur = 8 * unit;
    c.strokeStyle = "rgba(255,43,214,0.55)";
    c.lineWidth = 1.4 * unit;
    for (let k = 1; k < 24; k++) {
      const y = hz + (f.height - hz) * Math.pow(k / 24, 1.8);
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(f.width, y);
      c.stroke();
    }
    c.strokeStyle = "rgba(45,246,255,0.45)";
    for (let k = -14; k <= 14; k++) {
      c.beginPath();
      c.moveTo(vx + k * f.width * 0.04, hz);
      c.lineTo(vx + k * f.width * 0.32, f.height);
      c.stroke();
    }
    c.restore();
    c.fillStyle = "rgba(0,0,0,0.18)";
    for (let y = 0; y < f.height; y += 4 * unit) c.fillRect(0, y, f.width, 1.2 * unit);
  } else if (th.decor === "reels") {
    // Old cinema: two big film reels half off the sheet, a filmstrip snaking between them.
    const R = Math.max(f.width, f.height) * 0.22;
    for (const [x, y] of [
      [f.width * 0.95, f.height * 0.12],
      [f.width * 0.05, f.height * 0.78],
    ] as const) {
      c.save();
      c.translate(x, y);
      c.strokeStyle = "rgba(217,164,65,0.4)";
      c.fillStyle = "rgba(217,164,65,0.14)";
      c.lineWidth = 5 * unit;
      c.beginPath();
      c.arc(0, 0, R, 0, Math.PI * 2);
      c.arc(0, 0, R * 0.16, 0, Math.PI * 2, true);
      // Six windows in the reel.
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        c.moveTo(Math.cos(a) * R * 0.58 + R * 0.24, Math.sin(a) * R * 0.58);
        c.arc(Math.cos(a) * R * 0.58, Math.sin(a) * R * 0.58, R * 0.24, 0, Math.PI * 2, true);
      }
      c.fill("evenodd");
      c.stroke();
      c.beginPath();
      c.arc(0, 0, R * 0.06, 0, Math.PI * 2);
      c.fillStyle = "rgba(217,164,65,0.5)";
      c.fill();
      c.restore();
    }
    c.strokeStyle = "rgba(236,223,196,0.12)";
    c.lineWidth = 46 * unit;
    c.beginPath();
    c.moveTo(f.width * 0.95, f.height * 0.12 + R);
    c.bezierCurveTo(f.width * 1.1, f.height * 0.5, -f.width * 0.1, f.height * 0.4, f.width * 0.05, f.height * 0.78 - R);
    c.stroke();
  } else if (th.decor === "kraft") {
    // Paper fibres: short faint strokes every which way.
    const r = rng(11);
    const n = Math.round((f.width * f.height) / (900 * unit));
    c.lineWidth = 1 * unit;
    for (let i = 0; i < n; i++) {
      const x = r() * f.width;
      const y = r() * f.height;
      const a = r() * Math.PI;
      const l = (4 + r() * 10) * unit;
      c.strokeStyle = r() < 0.5 ? "rgba(90,70,40,0.10)" : "rgba(255,255,255,0.18)";
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
      c.stroke();
    }
  } else if (th.decor === "hearts") {
    const step = 64 * unit;
    c.fillStyle = th.accent;
    c.globalAlpha = 0.14;
    for (let y = step / 2, row = 0; y < f.height; y += step, row++)
      for (let x = (row % 2 ? step / 2 : 0) + step / 4; x < f.width; x += step) {
        c.save();
        c.translate(x, y);
        c.rotate(((row + Math.round(x)) % 3) * 0.2 - 0.2);
        shapePath(c, "heart", 16 * unit, 15 * unit);
        c.fill();
        c.restore();
      }
    c.globalAlpha = 1;
  } else if (th.decor === "snow" || th.decor === "night") {
    // Snowflakes or a starry night sky: soft dots of many sizes.
    const r = rng(th.decor === "snow" ? 5 : 9);
    const n = Math.round((f.width * f.height) / ((th.decor === "snow" ? 1800 : 2600) * unit * unit));
    c.fillStyle = "#ffffff";
    for (let i = 0; i < n; i++) {
      c.globalAlpha = 0.15 + r() * (th.decor === "snow" ? 0.5 : 0.6);
      c.beginPath();
      c.arc(r() * f.width, r() * f.height, (th.decor === "snow" ? 1 + r() * 3 : 0.5 + r() * 1.6) * unit, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;
  } else if (th.decor === "plaid") {
    // Tartan: wide bands of the accent and of shadow both ways, a thin light line in each.
    const band = 64 * unit;
    c.fillStyle = th.accent;
    c.globalAlpha = 0.24;
    for (let x = 0; x < f.width; x += band * 2) c.fillRect(x, 0, band * 0.55, f.height);
    for (let y = 0; y < f.height; y += band * 2) c.fillRect(0, y, f.width, band * 0.55);
    c.fillStyle = "#000000";
    c.globalAlpha = 0.14;
    for (let x = band; x < f.width; x += band * 2) c.fillRect(x, 0, band * 0.3, f.height);
    for (let y = band; y < f.height; y += band * 2) c.fillRect(0, y, f.width, band * 0.3);
    c.fillStyle = "#ffffff";
    c.globalAlpha = 0.3;
    for (let x = band * 0.75; x < f.width; x += band * 2) c.fillRect(x, 0, 1.4 * unit, f.height);
    for (let y = band * 0.75; y < f.height; y += band * 2) c.fillRect(0, y, f.width, 1.4 * unit);
    c.globalAlpha = 1;
  } else if (th.decor === "clouds") {
    // Auspicious clouds (Tết): curled clouds in the accent, scattered, clear of the caption.
    const r = rng(11);
    const size = 30 * unit;
    c.strokeStyle = th.accent;
    c.lineWidth = 2.4 * unit;
    c.lineCap = "round";
    c.globalAlpha = 0.42;
    for (let y = size; y < f.height; y += size * 3.2)
      for (let x = (Math.round(y / size) % 2 ? size * 1.6 : 0) + size; x < f.width; x += size * 3.6) {
        const ft = f.foot;
        if (ft && x > ft.x - size && x < ft.x + ft.w + size && y > ft.y - size && y < ft.y + ft.h + size) continue;
        const k = 0.7 + r() * 0.6;
        c.save();
        c.translate(x + (r() - 0.5) * size, y + (r() - 0.5) * size);
        c.scale(k, k);
        c.beginPath();
        c.arc(-size * 0.6, 0, size * 0.42, Math.PI * 0.9, Math.PI * 2.05);
        c.arc(0, -size * 0.18, size * 0.55, Math.PI * 1.05, Math.PI * 1.98);
        c.arc(size * 0.65, 0, size * 0.42, Math.PI * 1.1, Math.PI * 2.1);
        c.moveTo(-size * 1.05, size * 0.12);
        c.lineTo(size * 1.08, size * 0.12);
        // The curl inside.
        c.moveTo(-size * 0.05, -size * 0.12);
        c.arc(-size * 0.05, -size * 0.25, size * 0.13, Math.PI * 0.5, Math.PI * 2.3);
        c.stroke();
        c.restore();
      }
    c.globalAlpha = 1;
  } else if (th.decor === "web") {
    // Spider webs in two corners, and a few little bats.
    const webAt = (cx: number, cy: number, a0: number, rad: number) => {
      c.save();
      c.strokeStyle = th.ink;
      c.globalAlpha = 0.4;
      c.lineWidth = 1.2 * unit;
      const spokes = 7;
      const ang = (k: number) => a0 + (k / (spokes - 1)) * (Math.PI / 2);
      for (let k = 0; k < spokes; k++) {
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx + Math.cos(ang(k)) * rad, cy + Math.sin(ang(k)) * rad);
        c.stroke();
      }
      for (let ring = 1; ring <= 5; ring++) {
        const rr = (rad * ring) / 5.4;
        c.beginPath();
        for (let k = 0; k < spokes; k++) {
          const x = cx + Math.cos(ang(k)) * rr;
          const y = cy + Math.sin(ang(k)) * rr;
          if (k === 0) c.moveTo(x, y);
          else {
            // Threads sag between the spokes.
            const m = (ang(k) + ang(k - 1)) / 2;
            c.quadraticCurveTo(cx + Math.cos(m) * rr * 0.86, cy + Math.sin(m) * rr * 0.86, x, y);
          }
        }
        c.stroke();
      }
      c.restore();
    };
    const rad = Math.min(f.width, f.height) * 0.42;
    webAt(0, 0, 0, rad);
    webAt(f.width, f.height, Math.PI, rad);
    const r = rng(17);
    c.fillStyle = th.ink;
    c.globalAlpha = 0.5;
    for (let i = 0; i < 6; i++) {
      const x = f.width * (0.15 + r() * 0.7);
      const y = f.height * (0.1 + r() * 0.8);
      const w = (10 + r() * 10) * unit;
      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo(x - w * 0.5, y - w * 0.45, x - w, y - w * 0.1);
      c.quadraticCurveTo(x - w * 0.6, y + w * 0.05, x - w * 0.5, y + w * 0.25);
      c.quadraticCurveTo(x - w * 0.25, y + w * 0.05, x, y + w * 0.2);
      c.quadraticCurveTo(x + w * 0.25, y + w * 0.05, x + w * 0.5, y + w * 0.25);
      c.quadraticCurveTo(x + w * 0.6, y + w * 0.05, x + w, y - w * 0.1);
      c.quadraticCurveTo(x + w * 0.5, y - w * 0.45, x, y);
      c.fill();
    }
    c.globalAlpha = 1;
  } else if (th.decor === "circuit") {
    // A circuit board: right-angled traces ending in pads, glowing in the accent.
    const r = rng(23);
    const g = 22 * unit;
    c.save();
    c.strokeStyle = th.accent;
    c.fillStyle = th.accent;
    c.shadowColor = th.accent;
    c.shadowBlur = 6 * unit;
    c.lineWidth = 1.6 * unit;
    c.globalAlpha = 0.45;
    const n = Math.round((f.width * f.height) / (g * g * 14));
    for (let i = 0; i < n; i++) {
      let x = Math.round((r() * f.width) / g) * g;
      let y = Math.round((r() * f.height) / g) * g;
      c.beginPath();
      c.moveTo(x, y);
      for (let s = 0; s < 3 + Math.floor(r() * 4); s++) {
        const len = (1 + Math.floor(r() * 4)) * g;
        if (r() < 0.5) x += r() < 0.5 ? len : -len;
        else y += r() < 0.5 ? len : -len;
        c.lineTo(x, y);
      }
      c.stroke();
      c.beginPath();
      c.arc(x, y, 3 * unit, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  } else if (th.decor === "scan") {
    // A screen: scanlines in the ink, and a few bars of broken colour.
    c.fillStyle = th.ink;
    c.globalAlpha = 0.07;
    for (let y = 0; y < f.height; y += 4 * unit) c.fillRect(0, y, f.width, 1.4 * unit);
    const r = rng(29);
    const bars = ["#00ffe1", "#ff00e1", "#00ff9c", th.accent];
    for (let i = 0; i < 16; i++) {
      c.fillStyle = bars[i % bars.length];
      c.globalAlpha = 0.25 + r() * 0.35;
      c.fillRect(r() * f.width * 0.9, r() * f.height, (20 + r() * 140) * unit, (1.5 + r() * 5) * unit);
    }
    c.globalAlpha = 1;
  } else if (th.decor === "bokeh") {
    // Out-of-focus lights: soft discs in the accent, white and gold.
    const r = rng(31);
    const n = Math.round((f.width * f.height) / (5200 * unit * unit));
    const cols = [th.accent, "#ffffff", "#ffd88a"];
    for (let i = 0; i < n; i++) {
      const x = r() * f.width;
      const y = r() * f.height;
      const rad = (8 + r() * 34) * unit;
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      const col = cols[i % cols.length];
      g.addColorStop(0, col);
      g.addColorStop(0.7, col);
      g.addColorStop(1, "transparent");
      c.fillStyle = g;
      c.globalAlpha = 0.08 + r() * 0.22;
      c.beginPath();
      c.arc(x, y, rad, 0, Math.PI * 2);
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
function empty(c: CanvasRenderingContext2D, cell: Box, th: BoothTheme, n: number | null, mono: string, ghost: boolean) {
  c.fillStyle = th.empty;
  c.fillRect(cell.x, cell.y, cell.w, cell.h);
  if (!ghost) {
    // A plain panel; on screen a faint "+" says it can still be shot.
    if (n !== null) {
      c.fillStyle = th.ink;
      c.globalAlpha = 0.28;
      c.font = `400 ${Math.round(Math.min(cell.w, cell.h) * 0.22)}px ${mono}`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("+", cell.x + cell.w / 2, cell.y + cell.h / 2);
      c.globalAlpha = 1;
    }
    return;
  }
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
  const unit = Math.min(vertical ? w : h, f.footPanel ? 420 : 260);
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

/** The theme's paper and decoration on a sheet of any size (Post / Story backgrounds). */
export function paintBackdrop(canvas: HTMLCanvasElement, width: number, height: number, theme: BoothTheme = THEMES[0]) {
  canvas.width = width;
  canvas.height = height;
  const c = canvas.getContext("2d")!;
  paper(c, { width, height }, theme);
  decor(c, { width, height }, theme);
  return c;
}

export function frameBlob(frame: BoothFrame, shots: (ShotImage | null)[], opts: RenderOptions = {}): Promise<Blob> {
  const canvas = document.createElement("canvas");
  renderFrame(canvas, frame, shots, opts);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92));
}
