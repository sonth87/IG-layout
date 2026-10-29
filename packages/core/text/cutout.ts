import type { CutoutText, FontKey, TextElement } from "../project/types";
import { packUrl } from "../catalog/load";
import { type CutoutStyle, cutoutStyle, type PaperEffect, type PieceShape, type PieceTexture } from "./cutoutStyles";
import CATALOG_FONTS from "./cutoutFonts.json";
import { fontInfo, nearestWeight } from "./fonts";

// Cut-out letters (ransom note, D-141): one text element whose letters (or words) are each a
// scrap of paper with its own font, colours, shape, tilt and wear. Everything follows from the
// seed, so the canvas, the export and the template previews draw the same picture. Laid out
// here, drawn with plain canvas 2D calls (Konva shape, preview canvases). Styles: cutoutStyles.

export { CUTOUT_STYLES, cutoutStyle, type CutoutStyle } from "./cutoutStyles";

export const DEFAULT_CUTOUT: CutoutText = { style: "classic", seed: 1, by: "letter", mess: 0.4, wave: 0.2, curve: 0 };

type CatalogFontFiles = Record<string, { vi: boolean; files: { weight: number; file: string; unicodeRange: string }[] }>;
const CATALOG = CATALOG_FONTS as CatalogFontFiles;

const isCatalog = (key: FontKey) => key.startsWith("c:");

function familyOf(key: FontKey) {
  // Same family name as the catalog's own declarations (lib/text/fonts), so both agree.
  return isCatalog(key) ? `'c-${key.slice(2)}'` : fontInfo(key).family;
}

function weightOf(key: FontKey, wanted = 400) {
  if (!isCatalog(key)) return nearestWeight(key, wanted);
  const weights = CATALOG[key.slice(2)]?.files.map((f) => f.weight) ?? [400];
  return weights.reduce((best, w) => (Math.abs(w - wanted) < Math.abs(best - wanted) ? w : best), weights[0]);
}

/** Can the font draw Vietnamese letters? Built-in fonts all can (D-32). */
function hasVietnamese(key: FontKey) {
  return !isCatalog(key) || !!CATALOG[key.slice(2)]?.vi;
}

/** Every font a style uses, with the weight drawn. */
export function cutoutFonts(style: CutoutStyle) {
  return style.fonts.map((f) => ({ font: f.font, family: familyOf(f.font), weight: weightOf(f.font, f.weight), italic: !!f.italic, vi: hasVietnamese(f.font) }));
}

const declared = new Set<string>();
/** Declares a catalog font from cutoutFonts.json (not the whole catalog). */
function declare(id: string) {
  if (declared.has(id) || typeof document === "undefined") return;
  declared.add(id);
  const css = (CATALOG[id]?.files ?? [])
    .map((f) => `@font-face{font-family:'c-${id}';font-style:normal;font-weight:${f.weight};font-display:swap;src:url(${packUrl(f.file)}) format('woff2');unicode-range:${f.unicodeRange};}`)
    .join("\n");
  const style = document.createElement("style");
  style.dataset.cutoutFont = id;
  style.textContent = css;
  document.head.appendChild(style);
}

/** Loads a style's fonts (canvas text only uses a web font once it is loaded). */
export async function loadCutoutFonts(style: CutoutStyle) {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all(
    cutoutFonts(style).map((f) => {
      if (isCatalog(f.font)) declare(f.font.slice(2));
      return document.fonts.load(`${f.italic ? "italic " : ""}${f.weight} 64px ${f.family}`, f.vi ? "Đà Lạt ấm áp" : "Abc").catch(() => undefined);
    }),
  );
}

function rng(...parts: number[]) {
  let a = 0x9e3779b9;
  for (const p of parts) a = Math.imul(a ^ (p | 0), 0x85ebca6b) ^ (a >>> 13);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Piece {
  /** Index among the scraps (letters or words), stable while the text stays the same. */
  index: number;
  text: string;
  /** Baseline offset from the scrap's centre. */
  baseline: number;
  /** Centre and size in element pixels, before turning. */
  cx: number;
  cy: number;
  w: number;
  h: number;
  rotation: number;
  size: number;
  font: string;
  weight: number;
  italic: boolean;
  bg: string;
  fg: string;
  shape: PieceShape;
  texture: PieceTexture | null;
  effects: PaperEffect[];
  seed: number;
}

export interface CutoutLayout {
  pieces: Piece[];
  height: number;
  shadow: boolean | "soft";
  glow: boolean;
  print: boolean;
}

/** Width, and how far the ink goes above / below the baseline. */
type Measure = (text: string, font: string) => { width: number; ascent: number; descent: number };

let measurer: CanvasRenderingContext2D | null = null;
function canvasMeasure(text: string, font: string) {
  if (!measurer) measurer = document.createElement("canvas").getContext("2d");
  const size = parseFloat(/(\d+(?:\.\d+)?)px/.exec(font)?.[1] ?? "10");
  if (!measurer) return { width: text.length * size * 0.6, ascent: size * 0.75, descent: size * 0.2 };
  measurer.font = font;
  const m = measurer.measureText(text);
  return { width: m.width, ascent: m.actualBoundingBoxAscent || size * 0.75, descent: m.actualBoundingBoxDescent || size * 0.2 };
}

/** Shapes cut to the letter: as tall as its ink (accents included), like SCRL's scraps. */
const TIGHT: PieceShape[] = ["rect", "scissor", "tornFine", "tornRough", "tornSide", "deckle", "none"];

export function pieceFont(p: Pick<Piece, "italic" | "weight" | "size" | "font">) {
  return `${p.italic ? "italic " : ""}${p.weight} ${p.size}px ${p.font}`;
}

function luminance(hex: string) {
  const n = parseInt(hex.slice(1, 7), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114;
}

function applyCase(ch: string, mode: CutoutStyle["letterCase"], r: () => number) {
  if (mode === "upper") return ch.toUpperCase();
  if (mode === "lower") return ch.toLowerCase();
  if (mode === "mixed") return r() < 0.5 ? ch.toUpperCase() : ch.toLowerCase();
  return ch;
}

const NON_ASCII = /[^\u0000-\u007f]/;

/**
 * Where every scrap goes. Lines wrap at the element width; `wave` moves scraps up and down,
 * `mess` turns them and varies their size, `curve` bends each line into an arc (scraps
 * follow its slope). The height fits the scraps.
 */
export function cutoutLayout(el: Pick<TextElement, "text" | "width" | "fontSize" | "align" | "letterSpacing" | "lineHeight"> & { cutout: CutoutText }, measure: Measure = canvasMeasure): CutoutLayout {
  const c = el.cutout;
  const style = cutoutStyle(c.style);
  const fonts = cutoutFonts(style);
  const viFonts = fonts.filter((f) => f.vi);
  const s = el.fontSize;
  const pad = style.pad ?? 0.14;
  const sizeVar = (style.sizeVar ?? 0.22) * c.mess;
  const effects = Object.entries(style.effects ?? {}) as [PaperEffect, number][];
  let index = 0;

  // 1. Scraps, word by word, line by line.
  type Word = Piece[];
  const lines: Word[][] = el.text.split("\n").map((line) =>
    line
      .split(/ +/)
      .filter(Boolean)
      .map((word) => {
        const chunks = c.by === "word" ? [word] : [...word];
        return chunks.map((chunk) => {
          const i = index++;
          const seed = (c.seed * 7919 + i * 104729 + (c.rolls?.[i] ?? 0) * 15485863) | 0;
          const r = rng(seed);
          const text = [...chunk].map((ch) => applyCase(ch, style.letterCase, r)).join("");
          // Vietnamese letters only in fonts that have them.
          const pool = NON_ASCII.test(text) && viFonts.length ? viFonts : fonts;
          const f = pool[Math.floor(r() * pool.length)];
          let [bg, fg] = style.palette[Math.floor(r() * style.palette.length)];
          let shape = style.shapes[Math.floor(r() * style.shapes.length)];
          // A letter without its scrap takes the darker colour of the pair (readable on paper).
          if (shape === "none" && luminance(fg) > luminance(bg)) [bg, fg] = [fg, bg];
          if (shape === "circle" && [...chunk].length > 1) shape = "round";
          const textures = style.textures ?? [null];
          const texture = textures[Math.floor(r() * textures.length)];
          const wear = shape === "none" ? [] : effects.filter(([, chance]) => r() < chance).map(([e]) => e);
          const size = s * (1 + (r() * 2 - 1) * sizeVar);
          const m = measure(text, pieceFont({ italic: f.italic, weight: f.weight, size, font: f.family }));
          let w = m.width + size * pad * 2;
          let h = size * 1.32;
          // Ink centred in the scrap: baseline below the middle by half the ink's imbalance.
          let baseline = (m.ascent - m.descent) / 2;
          if (TIGHT.includes(shape)) h = Math.max(size * 0.55, m.ascent + m.descent + size * pad * 2 * 0.9);
          else baseline = size * 0.36;
          if (shape === "circle") w = h = Math.max(w, h) * 1.05;
          if (shape === "pill") w += size * 0.3;
          if (shape === "tape" || shape === "ticket") w += size * 0.4;
          if (shape === "tornRough" || shape === "deckle") {
            w += size * 0.12;
            h += size * 0.1;
          }
          const piece: Piece = { index: i, text, baseline, cx: 0, cy: 0, w, h, rotation: (r() * 2 - 1) * (style.tilt ?? 14) * c.mess, size, font: f.family, weight: f.weight, italic: f.italic, bg, fg, shape, texture, effects: wear, seed };
          // Up / down (wave) is decided now so it stays with the scrap.
          piece.cy = (r() * 2 - 1) * c.wave * s * 0.42;
          return piece;
        });
      }),
  );

  // 2. Wrap words to the width.
  const gap = s * (style.gap ?? 0.05) + el.letterSpacing;
  const space = s * 0.32;
  const advance = s * 1.18 * el.lineHeight + s * 0.12;
  const wordWidth = (w: Word) => w.reduce((sum, p) => sum + p.w, 0) + gap * (w.length - 1);
  const rows: Word[][] = [];
  for (const line of lines) {
    let row: Word[] = [];
    let used = 0;
    for (const word of line) {
      const ww = wordWidth(word);
      if (row.length && used + space + ww > el.width) {
        rows.push(row);
        row = [];
        used = 0;
      }
      used += (row.length ? space : 0) + ww;
      row.push(word);
    }
    rows.push(row);
  }

  // 3. Place: alignment, wave, curve.
  const pieces: Piece[] = [];
  rows.forEach((row, ri) => {
    const rowWidth = row.reduce((sum, w, i) => sum + wordWidth(w) + (i ? space : 0), 0);
    let x = el.align === "right" ? el.width - rowWidth : el.align === "left" ? 0 : (el.width - rowWidth) / 2;
    // Scraps sit on a common baseline (printed letters), not centred on the line.
    const baseY = ri * advance + s * 1.02;
    const mid = x + rowWidth / 2;
    const half = Math.max(rowWidth / 2, s);
    // Arc height: up to ~a third of the line's half width.
    const bend = c.curve * half * 0.34;
    for (const word of row) {
      for (const p of word) {
        p.cx = x + p.w / 2;
        const u = (p.cx - mid) / half;
        p.cy += baseY - p.baseline - bend * (1 - u * u);
        p.rotation += (Math.atan((2 * bend * u) / half) * 180) / Math.PI;
        pieces.push(p);
        x += p.w + gap;
      }
      x += space - gap;
    }
  });

  // 4. Fit the height to what is drawn (turned scraps included).
  let top = Infinity;
  let bottom = -Infinity;
  for (const p of pieces) {
    const a = (p.rotation * Math.PI) / 180;
    const hh = (Math.abs(Math.sin(a)) * p.w + Math.abs(Math.cos(a)) * p.h) / 2;
    top = Math.min(top, p.cy - hh);
    bottom = Math.max(bottom, p.cy + hh);
  }
  if (!pieces.length) return { pieces, height: s, shadow: style.shadow ?? false, glow: !!style.glow, print: !!style.print };
  const margin = s * 0.08;
  for (const p of pieces) p.cy += margin - top;
  return { pieces, height: bottom - top + margin * 2, shadow: style.shadow ?? false, glow: !!style.glow, print: !!style.print };
}

/** The scrap under a point of the element (element pixels), for "tap a letter to reshuffle it". */
export function pieceAt(layout: CutoutLayout, x: number, y: number) {
  for (let i = layout.pieces.length - 1; i >= 0; i--) {
    const p = layout.pieces[i];
    const a = (-p.rotation * Math.PI) / 180;
    const dx = x - p.cx;
    const dy = y - p.cy;
    const lx = dx * Math.cos(a) - dy * Math.sin(a);
    const ly = dx * Math.sin(a) + dy * Math.cos(a);
    if (Math.abs(lx) <= p.w / 2 && Math.abs(ly) <= p.h / 2) return p;
  }
  return null;
}

/** Last layout drawn for each element: the canvas finds the tapped scrap with it. */
export const drawnLayouts = new Map<string, CutoutLayout>();
// The end-to-end checks find a letter to tap with it.
if (typeof window !== "undefined") (window as unknown as { __igCutout: typeof drawnLayouts }).__igCutout = drawnLayouts;

// ── Drawing ───────────────────────────────────────────────────────────────

type Pt = [number, number];

/**
 * A torn edge from a to b: the tear drifts (low-frequency wobble) and bites (small jitter).
 * `depth` relative to the letter size.
 */
function tearEdge(r: () => number, a: Pt, b: Pt, size: number, depth: number, out: Pt[]) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const step = Math.max(2, size * 0.035);
  const n = Math.max(2, Math.round(len / step));
  // Normal pointing out of the scrap (edges go clockwise).
  const nx = (b[1] - a[1]) / len;
  const ny = -(b[0] - a[0]) / len;
  const p1 = r() * 6.28;
  const p2 = r() * 6.28;
  const f1 = 1 + r() * 2;
  const f2 = 3 + r() * 4;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const drift = Math.sin(t * Math.PI * f1 + p1) * 0.6 + Math.sin(t * Math.PI * f2 + p2) * 0.3;
    const bite = (r() - 0.5) * 0.9;
    const d = (drift + bite) * depth * size;
    out.push([a[0] + (b[0] - a[0]) * t + nx * d, a[1] + (b[1] - a[1]) * t + ny * d]);
  }
}

/** The scrap outline (points) for torn, scissor and deckle shapes; `inset` shrinks it. */
function outlinePoints(p: Piece, salt: number, inset = 0): Pt[] {
  const r = rng(p.seed, salt);
  const w = p.w / 2 - inset;
  const h = p.h / 2 - inset;
  const j = p.size * 0.04;
  // Corners, a little off square (cut by hand).
  const c: Pt[] = [
    [-w + (r() - 0.5) * j, -h + (r() - 0.5) * j],
    [w + (r() - 0.5) * j, -h + (r() - 0.5) * j],
    [w + (r() - 0.5) * j, h + (r() - 0.5) * j],
    [-w + (r() - 0.5) * j, h + (r() - 0.5) * j],
  ];
  if (p.shape === "scissor") return c;
  const pts: Pt[] = [];
  const torn =
    p.shape === "tornSide"
      ? // One or two torn sides, the others cut.
        (() => {
          const first = Math.floor(rng(p.seed, 5)() * 4);
          const two = rng(p.seed, 6)() < 0.45;
          return [0, 1, 2, 3].map((k) => k === first || (two && k === (first + 2) % 4));
        })()
      : [true, true, true, true];
  const depth = p.shape === "tornRough" ? 0.075 : p.shape === "deckle" ? 0.03 : 0.035;
  for (let k = 0; k < 4; k++) {
    if (torn[k]) tearEdge(r, c[k], c[(k + 1) % 4], p.size, depth, pts);
    else pts.push(c[k]);
  }
  return pts;
}

function pathOf(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}

const OUTLINED: PieceShape[] = ["scissor", "tornFine", "tornRough", "tornSide", "deckle"];

function scrapPath(ctx: CanvasRenderingContext2D, p: Piece) {
  const { w, h } = p;
  const x = -w / 2;
  const y = -h / 2;
  if (OUTLINED.includes(p.shape)) return pathOf(ctx, outlinePoints(p, 77));
  ctx.beginPath();
  switch (p.shape) {
    case "round":
      ctx.roundRect(x, y, w, h, h * 0.22);
      break;
    case "pill":
    case "label":
      ctx.roundRect(x, y, w, h, p.shape === "pill" ? h / 2 : h * 0.14);
      break;
    case "circle":
      ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
      break;
    case "tape": {
      // Zigzag torn ends.
      const n = 6;
      const z = p.size * 0.06;
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      for (let i = 1; i <= n; i++) ctx.lineTo(x + w + (i % 2 ? -z : 0), y + (h * i) / n);
      ctx.lineTo(x, y + h);
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(x + (i % 2 ? z : 0), y + (h * i) / n);
      ctx.closePath();
      break;
    }
    case "ticket": {
      // Notches on both short sides.
      const n = h * 0.13;
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h / 2 - n);
      ctx.arc(x + w, y + h / 2, n, -Math.PI / 2, Math.PI / 2, true);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + h / 2 + n);
      ctx.arc(x, y + h / 2, n, Math.PI / 2, -Math.PI / 2, true);
      ctx.closePath();
      break;
    }
    default:
      ctx.rect(x, y, w, h);
  }
}

function texture(ctx: CanvasRenderingContext2D, p: Piece) {
  const { w, h } = p;
  const x = -w / 2;
  const y = -h / 2;
  ctx.lineWidth = Math.max(1, p.size * 0.02);
  if (p.texture === "lines") {
    ctx.strokeStyle = "rgba(90,130,200,0.45)";
    for (let ly = y + h * 0.28; ly < y + h; ly += p.size * 0.32) {
      ctx.beginPath();
      ctx.moveTo(x, ly);
      ctx.lineTo(x + w, ly);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(220,80,80,0.55)";
    ctx.beginPath();
    ctx.moveTo(x + w * 0.16, y);
    ctx.lineTo(x + w * 0.16, y + h);
    ctx.stroke();
  } else if (p.texture === "grid") {
    ctx.strokeStyle = "rgba(90,130,200,0.32)";
    const g = p.size * 0.22;
    for (let gx = x + g / 2; gx < x + w; gx += g) {
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx, y + h);
      ctx.stroke();
    }
    for (let gy = y + g / 2; gy < y + h; gy += g) {
      ctx.beginPath();
      ctx.moveTo(x, gy);
      ctx.lineTo(x + w, gy);
      ctx.stroke();
    }
  } else if (p.texture === "dots" || p.texture === "halftone") {
    // Halftone: dots growing towards one corner, like a printed photo's edge.
    ctx.fillStyle = luminance(p.bg) < 110 ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.13)";
    const g = p.size * (p.texture === "halftone" ? 0.11 : 0.14);
    for (let gy = y; gy < y + h + g; gy += g)
      for (let gx = x + ((Math.round(gy / g) % 2) * g) / 2; gx < x + w + g; gx += g) {
        const k = p.texture === "halftone" ? Math.max(0.05, (gx - x) / w * 0.5 + (gy - y) / h * 0.5) : 1;
        ctx.beginPath();
        ctx.arc(gx, gy, g * 0.3 * k, 0, Math.PI * 2);
        ctx.fill();
      }
  } else if (p.texture === "stripes") {
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = p.size * 0.08;
    for (let sx = x - h; sx < x + w; sx += p.size * 0.24) {
      ctx.beginPath();
      ctx.moveTo(sx, y + h);
      ctx.lineTo(sx + h, y);
      ctx.stroke();
    }
  }
}

/** Paper wear over the scrap (inside its clip). */
function wear(ctx: CanvasRenderingContext2D, p: Piece, effect: PaperEffect) {
  const r = rng(p.seed, effect.length * 31 + effect.charCodeAt(0));
  const { w, h, size } = p;
  const x = -w / 2;
  const y = -h / 2;
  const rx = () => x + r() * w;
  const ry = () => y + r() * h;
  switch (effect) {
    case "grain": {
      // Fine speckle, light and dark.
      const n = Math.round((w * h) / (size * size) * 40);
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = r() < 0.5 ? `rgba(0,0,0,${0.05 + r() * 0.07})` : `rgba(255,255,255,${0.06 + r() * 0.08})`;
        ctx.fillRect(rx(), ry(), size * 0.012 + r() * size * 0.012, size * 0.012 + r() * size * 0.012);
      }
      break;
    }
    case "crumple": {
      // Facets catching light differently, and the creases between them.
      // Soft facets: each a faint gradient from light to shade across a random line.
      for (let i = 0; i < 6; i++) {
        const a: Pt = [rx(), ry()];
        const b: Pt = [rx(), ry()];
        const g = ctx.createLinearGradient(a[0], a[1], b[0], b[1]);
        g.addColorStop(0, `rgba(255,255,255,${0.06 + r() * 0.1})`);
        g.addColorStop(0.5, "rgba(0,0,0,0)");
        g.addColorStop(1, `rgba(0,0,0,${0.04 + r() * 0.07})`);
        ctx.fillStyle = g;
        pathOf(ctx, [a, b, [rx(), ry()], [rx(), ry()]]);
        ctx.fill();
      }
      // Creases: crooked lines (a few kinks), a light ridge beside a faint shadow.
      for (let i = 0; i < 3 + Math.floor(r() * 3); i++) {
        const pts: Pt[] = [];
        const horizontal = r() < 0.5;
        const n = 3 + Math.floor(r() * 3);
        const base = horizontal ? ry() : rx();
        const tilt = (r() - 0.5) * (horizontal ? h : w) * 0.8;
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          const wob = (r() - 0.5) * size * 0.12;
          pts.push(horizontal ? [x + w * t, base + tilt * t + wob] : [base + tilt * t + wob, y + h * t]);
        }
        for (const [color, off] of [["rgba(0,0,0,0.1)", size * 0.012], ["rgba(255,255,255,0.32)", 0]] as const) {
          ctx.lineWidth = size * 0.01;
          ctx.strokeStyle = color;
          ctx.beginPath();
          pts.forEach(([px, py], k) => (k ? ctx.lineTo(px + off, py + off) : ctx.moveTo(px + off, py + off)));
          ctx.stroke();
        }
      }
      break;
    }
    case "fold": {
      // One fold line: light ridge beside a soft shadow.
      const vertical = r() < 0.5;
      const t = 0.3 + r() * 0.4;
      const g = vertical ? ctx.createLinearGradient(x + w * t - size * 0.08, 0, x + w * t + size * 0.08, 0) : ctx.createLinearGradient(0, y + h * t - size * 0.08, 0, y + h * t + size * 0.08);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.45, "rgba(0,0,0,0.14)");
      g.addColorStop(0.5, "rgba(255,255,255,0.35)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      if (vertical) ctx.fillRect(x + w * t - size * 0.08, y, size * 0.16, h);
      else ctx.fillRect(x, y + h * t - size * 0.08, w, size * 0.16);
      break;
    }
    case "aged": {
      // Yellowed, darker towards the edges.
      const g = ctx.createRadialGradient(0, 0, Math.min(w, h) * 0.2, 0, 0, Math.hypot(w, h) * 0.6);
      g.addColorStop(0, "rgba(190,150,70,0.05)");
      g.addColorStop(1, `rgba(120,80,30,${0.22 + r() * 0.15})`);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      break;
    }
    case "stain": {
      // A coffee ring or a soft blotch, often half off the scrap.
      const cx = rx();
      const cy = ry();
      const rad = size * (0.3 + r() * 0.5);
      if (r() < 0.5) {
        ctx.strokeStyle = `rgba(130,80,30,${0.18 + r() * 0.15})`;
        ctx.lineWidth = size * (0.03 + r() * 0.04);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rad, rad * (0.85 + r() * 0.3), r() * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, `rgba(150,105,45,${0.1 + r() * 0.12})`);
      g.addColorStop(0.8, "rgba(150,105,45,0.05)");
      g.addColorStop(1, "rgba(150,105,45,0)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
      break;
    }
    case "foxing": {
      // Small brown age spots.
      const n = 3 + Math.floor(r() * 9);
      for (let i = 0; i < n; i++) {
        const rad = size * (0.01 + r() * 0.035);
        ctx.fillStyle = `rgba(140,90,40,${0.15 + r() * 0.25})`;
        ctx.beginPath();
        ctx.arc(rx(), ry(), rad, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "light": {
      // Light falling across the scrap (a photo of real paper): brighter on one side.
      const t = r() * Math.PI * 2;
      const d = Math.hypot(w, h) / 2;
      const g = ctx.createLinearGradient(-Math.cos(t) * d, -Math.sin(t) * d, Math.cos(t) * d, Math.sin(t) * d);
      g.addColorStop(0, `rgba(255,255,255,${0.1 + r() * 0.1})`);
      g.addColorStop(1, `rgba(0,0,0,${0.06 + r() * 0.08})`);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, w, h);
      break;
    }
  }
}

/** Draws the scraps (element pixels; the caller sets the transform). */
export function drawCutout(ctx: CanvasRenderingContext2D, layout: CutoutLayout) {
  for (const p of layout.pieces) {
    ctx.save();
    ctx.translate(p.cx, p.cy);
    ctx.rotate((p.rotation * Math.PI) / 180);
    if (p.shape !== "none") {
      const torn = p.shape === "tornRough" || p.shape === "tornFine" || p.shape === "tornSide";
      ctx.save();
      if (layout.shadow) {
        const soft = layout.shadow === "soft";
        ctx.shadowColor = soft ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.28)";
        ctx.shadowBlur = p.size * (soft ? 0.035 : 0.1);
        ctx.shadowOffsetY = p.size * (soft ? 0.012 : 0.04);
      }
      ctx.globalAlpha *= p.shape === "tape" ? 0.88 : 1;
      // Torn paper shows its white core along the tear: the outline in off-white, the
      // printed face a little inside it with its own tear.
      if (torn) {
        pathOf(ctx, outlinePoints(p, 77));
        ctx.fillStyle = luminance(p.bg) < 110 ? "#f4f1ea" : "#fdfcf8";
        ctx.fill();
        ctx.shadowColor = "transparent";
        pathOf(ctx, outlinePoints(p, 91, p.size * 0.035));
      } else scrapPath(ctx, p);
      ctx.fillStyle = p.bg;
      ctx.fill();
      ctx.restore();
      if (p.texture || p.effects.length) {
        ctx.save();
        if (torn) pathOf(ctx, outlinePoints(p, 91, p.size * 0.035));
        else scrapPath(ctx, p);
        ctx.clip();
        if (p.texture) texture(ctx, p);
        for (const e of p.effects) wear(ctx, p, e);
        ctx.restore();
      }
      if (p.shape === "label") {
        // Embossed plastic tape: a light line along the top.
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        ctx.fillRect(-p.w / 2 + p.h * 0.1, -p.h / 2 + p.h * 0.1, p.w - p.h * 0.2, p.h * 0.12);
      }
    }
    ctx.save();
    ctx.font = pieceFont(p);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = p.fg;
    if (layout.glow) {
      ctx.shadowColor = p.fg;
      ctx.shadowBlur = p.size * 0.25;
    } else if (p.shape === "label") {
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowOffsetY = p.size * 0.03;
    } else if (p.shape === "none" && layout.shadow === true) {
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = p.size * 0.06;
    }
    ctx.fillText(p.text, 0, p.baseline);
    ctx.restore();
    // Printed letters: small gaps in the ink, in the paper's colour (unseen on the paper).
    if (layout.print && p.shape !== "none") {
      ctx.save();
      scrapPath(ctx, p);
      ctx.clip();
      const r = rng(p.seed, 404);
      const n = Math.round(((p.w * p.h) / (p.size * p.size)) * 140);
      ctx.fillStyle = p.bg;
      for (let i = 0; i < n; i++) {
        ctx.globalAlpha = 0.2 + r() * 0.35;
        ctx.beginPath();
        ctx.arc(-p.w / 2 + r() * p.w, -p.h / 2 + r() * p.h, p.size * (0.003 + r() * 0.006), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
  }
}
