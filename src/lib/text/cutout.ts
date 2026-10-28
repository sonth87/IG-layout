import type { BuiltinFontKey, CutoutText, TextElement } from "@/lib/project/types";
import { fontInfo, nearestWeight } from "./fonts";

// Cut-out letters (ransom note, D-141): one text element whose letters (or words) are each a
// scrap of paper with its own font, colours, shape and tilt. Everything follows from the seed,
// so the canvas, the export and the template previews draw the same picture. Laid out here,
// drawn with plain canvas 2D calls (Konva shape, preview canvas).

export type PieceShape = "rect" | "round" | "pill" | "circle" | "torn" | "tape" | "ticket" | "label" | "none";
export type PieceTexture = "lines" | "grid" | "dots" | "stripes";

export interface CutoutStyle {
  id: string;
  name: { en: string; vi: string };
  /** Fonts with the weight wanted (nearest the font has) and italic. */
  fonts: { font: BuiltinFontKey; weight?: number; italic?: boolean }[];
  /** Scrap colour, letter colour. */
  palette: [string, string][];
  /** Shapes to pick from (repeat one to make it likelier). */
  shapes: PieceShape[];
  textures?: (PieceTexture | null)[];
  /** "mixed": each letter upper or lower case at random. */
  letterCase?: "keep" | "upper" | "lower" | "mixed";
  shadow?: boolean;
  /** Letters glow in their own colour (neon). */
  glow?: boolean;
  /** How much letter sizes differ at full mess (0.2 = ±20 %). */
  sizeVar?: number;
  /** Space around the letter in its scrap, relative to the letter size. */
  pad?: number;
}

const INK = "#1d1c1a";

export const CUTOUT_STYLES: CutoutStyle[] = [
  {
    id: "newspaper",
    name: { en: "Old newspaper", vi: "Báo cũ" },
    fonts: [{ font: "playfair", weight: 900 }, { font: "bodoni", weight: 700 }, { font: "oswald", weight: 600 }, { font: "ebGaramond", weight: 500, italic: true }, { font: "robotoSlab", weight: 700 }, { font: "anton" }, { font: "merriweather", weight: 900 }],
    palette: [["#f1ead8", INK], ["#e9e1cc", INK], ["#ffffff", INK], ["#efe6cf", "#5a4a3a"], ["#1d1c1a", "#f1ead8"]],
    shapes: ["rect", "rect", "torn"],
    letterCase: "mixed",
    shadow: true,
  },
  {
    id: "magazine",
    name: { en: "Glossy magazine", vi: "Tạp chí màu" },
    fonts: [{ font: "anton" }, { font: "bungee" }, { font: "playfair", weight: 900, italic: true }, { font: "montserrat", weight: 900 }, { font: "dela" }, { font: "yeseva" }, { font: "archivo", weight: 900 }],
    palette: [["#e63946", "#ffffff"], ["#ffd84d", INK], ["#2b59c3", "#ffffff"], ["#ff8fab", INK], ["#1d1c1a", "#ffffff"], ["#2a9d8f", "#ffffff"], ["#ffffff", "#e63946"]],
    shapes: ["rect", "rect", "round", "circle"],
    letterCase: "mixed",
    shadow: true,
  },
  {
    id: "fashion",
    name: { en: "Fashion", vi: "Thời trang" },
    fonts: [{ font: "bodoni", weight: 400 }, { font: "playfair", weight: 400, italic: true }, { font: "cormorant", weight: 600 }, { font: "fraunces", weight: 300 }, { font: "montserrat", weight: 300 }],
    palette: [["#ffffff", INK], [INK, "#ffffff"], ["#c1121f", "#ffffff"], ["#f5f0e8", "#c1121f"]],
    shapes: ["rect"],
    letterCase: "upper",
    shadow: true,
    sizeVar: 0.15,
  },
  {
    id: "headline",
    name: { en: "Headline", vi: "Tiêu đề lớn" },
    fonts: [{ font: "anton" }, { font: "bigShoulders", weight: 900 }, { font: "oswald", weight: 700 }, { font: "dela" }, { font: "bungee" }, { font: "leagueSpartan", weight: 900 }, { font: "playfair", weight: 900 }],
    palette: [["#f1ead8", INK], ["#ffffff", "#c1121f"], ["#1d1c1a", "#ffffff"], ["#ffd84d", INK]],
    shapes: ["rect", "none", "none", "torn"],
    letterCase: "upper",
    shadow: true,
    sizeVar: 0.45,
  },
  {
    id: "kraft",
    name: { en: "Kraft paper", vi: "Giấy kraft" },
    fonts: [{ font: "robotoSlab", weight: 700 }, { font: "bitter", weight: 800 }, { font: "patrickHand" }, { font: "spaceMono", weight: 700 }, { font: "oswald", weight: 500 }],
    palette: [["#c8a374", INK], ["#d9bf94", INK], ["#b8895a", "#fff8ec"], ["#e6d8c3", "#5b3a24"]],
    shapes: ["torn", "rect"],
    letterCase: "mixed",
    shadow: true,
  },
  {
    id: "lined",
    name: { en: "Notebook paper", vi: "Giấy vở" },
    fonts: [{ font: "patrickHand" }, { font: "itim" }, { font: "mali", weight: 600 }, { font: "shantell", weight: 600 }, { font: "playpen", weight: 600 }],
    palette: [["#fbfaf6", INK], ["#fbfaf6", "#2b4fa8"], ["#f7f3e6", INK], ["#fbfaf6", "#c1121f"]],
    shapes: ["torn", "rect"],
    textures: ["lines"],
    shadow: true,
  },
  {
    id: "grid",
    name: { en: "Grid paper", vi: "Giấy ô ly" },
    fonts: [{ font: "patrickHand" }, { font: "itim" }, { font: "gluten", weight: 600 }, { font: "spaceMono", weight: 700 }],
    palette: [["#fbfaf6", INK], ["#fbfaf6", "#2b4fa8"], ["#eef4fb", INK]],
    shapes: ["rect", "torn"],
    textures: ["grid"],
    shadow: true,
  },
  {
    id: "scraps",
    name: { en: "Torn scraps", vi: "Mẩu giấy xé" },
    fonts: [{ font: "playfair", weight: 800 }, { font: "anton" }, { font: "patrickHand" }, { font: "cormorant", weight: 700 }, { font: "oswald", weight: 600 }],
    palette: [["#fbfaf6", INK], ["#f1ead8", INK], ["#e8dcc6", "#5b3a24"], ["#dfe6ea", INK], ["#f6dede", "#9c2f3f"]],
    shapes: ["torn"],
    letterCase: "mixed",
    shadow: true,
  },
  {
    id: "notes",
    name: { en: "Sticky notes", vi: "Giấy note" },
    fonts: [{ font: "patrickHand" }, { font: "itim" }, { font: "comfortaa", weight: 700 }, { font: "gluten", weight: 600 }],
    palette: [["#fff176", INK], ["#ffb3c7", INK], ["#a7d8ff", INK], ["#b9f6ca", INK], ["#ffcc80", INK]],
    shapes: ["rect"],
    shadow: true,
  },
  {
    id: "labelMaker",
    name: { en: "Label maker", vi: "Máy in nhãn" },
    fonts: [{ font: "spaceMono", weight: 700 }, { font: "robotoMono", weight: 700 }, { font: "jetbrains", weight: 800 }],
    palette: [["#111111", "#ffffff"], ["#d62828", "#ffffff"], ["#1d4ed8", "#ffffff"], ["#15803d", "#ffffff"], ["#f4d35e", INK]],
    shapes: ["label"],
    letterCase: "upper",
    sizeVar: 0.08,
  },
  {
    id: "washi",
    name: { en: "Washi tape", vi: "Băng dính washi" },
    fonts: [{ font: "quicksand", weight: 700 }, { font: "nunito", weight: 800 }, { font: "comfortaa", weight: 700 }, { font: "patrickHand" }],
    palette: [["#f6c9d0", INK], ["#cfe2ef", INK], ["#f2e3a3", INK], ["#d6e8c8", INK], ["#e2d4f0", INK]],
    shapes: ["tape"],
    textures: ["stripes", "dots", null],
  },
  {
    id: "ticket",
    name: { en: "Tickets", vi: "Vé" },
    fonts: [{ font: "oswald", weight: 700 }, { font: "spaceMono", weight: 700 }, { font: "bungee" }, { font: "robotoSlab", weight: 800 }],
    palette: [["#f4d35e", INK], ["#e76f51", "#ffffff"], ["#2a9d8f", "#ffffff"], ["#f1ead8", "#c1121f"]],
    shapes: ["ticket"],
    letterCase: "upper",
    shadow: true,
  },
  {
    id: "typewriter",
    name: { en: "Typewriter", vi: "Đánh máy" },
    fonts: [{ font: "spaceMono" }, { font: "robotoMono" }, { font: "jetbrains" }, { font: "spaceMono", italic: true }],
    palette: [["#ffffff", INK], ["#f4efe3", INK], ["#f4efe3", "#b3202a"]],
    shapes: ["rect"],
    letterCase: "lower",
    shadow: true,
    sizeVar: 0.1,
  },
  {
    id: "pastel",
    name: { en: "Pastel", vi: "Pastel" },
    fonts: [{ font: "nunito", weight: 900 }, { font: "quicksand", weight: 700 }, { font: "comfortaa", weight: 700 }, { font: "gluten", weight: 700 }, { font: "playpen", weight: 700 }],
    palette: [["#ffd6e0", "#b0466c"], ["#d7ecff", "#2f5d8a"], ["#e2f7e1", "#2f6b4f"], ["#fff1c1", "#8a5a17"], ["#e9ddff", "#5b3fa0"]],
    shapes: ["round", "circle", "rect", "pill"],
  },
  {
    id: "mono",
    name: { en: "Black & white", vi: "Đen trắng" },
    fonts: [{ font: "playfair", weight: 900 }, { font: "anton" }, { font: "bodoni", weight: 700 }, { font: "spaceMono", weight: 700 }, { font: "oswald", weight: 600 }, { font: "cormorant", weight: 700, italic: true }],
    palette: [["#000000", "#ffffff"], ["#ffffff", "#000000"], ["#e5e5e5", "#000000"], ["#333333", "#ffffff"]],
    shapes: ["rect", "rect", "torn"],
    letterCase: "mixed",
    shadow: true,
  },
  {
    id: "neon",
    name: { en: "Neon", vi: "Neon" },
    fonts: [{ font: "bungee" }, { font: "tektur", weight: 700 }, { font: "unbounded", weight: 700 }, { font: "pacifico" }],
    palette: [["#0b0b14", "#ff4fd8"], ["#140a2a", "#4ff3ff"], ["#0b0b14", "#c6ff4f"], ["#1a0b14", "#ffd84f"]],
    shapes: ["round", "rect"],
    glow: true,
  },
  {
    id: "y2k",
    name: { en: "Y2K", vi: "Y2K" },
    fonts: [{ font: "unbounded", weight: 800 }, { font: "bungee" }, { font: "smooch", weight: 800 }, { font: "tektur", weight: 800 }, { font: "lobster" }],
    palette: [["#d9d9e3", "#6b21a8"], ["#ff9ce6", "#ffffff"], ["#b28dff", "#ffffff"], ["#9cf6ff", "#6b21a8"], ["#ffffff", "#ff4fd8"]],
    shapes: ["pill", "round", "circle"],
    shadow: true,
  },
  {
    id: "comic",
    name: { en: "Comic", vi: "Truyện tranh" },
    fonts: [{ font: "bungee" }, { font: "anton" }, { font: "dela" }, { font: "archivo", weight: 900 }],
    palette: [["#ffe14d", INK], ["#4fc3f7", INK], ["#ff5a5f", "#ffffff"], ["#ffffff", INK]],
    shapes: ["rect", "round"],
    textures: ["dots", null],
    letterCase: "upper",
    shadow: true,
  },
  {
    id: "grunge",
    name: { en: "Grunge", vi: "Bụi bặm" },
    fonts: [{ font: "grenze", weight: 800 }, { font: "oswald", weight: 700 }, { font: "bigShoulders", weight: 900 }, { font: "anton" }, { font: "spaceMono", weight: 700 }],
    palette: [["#2b2b2b", "#e9e4da"], ["#4a4a46", "#ffffff"], ["#e9e4da", "#1d1c1a"], ["#7a1f1f", "#f1ead8"]],
    shapes: ["torn", "torn", "rect"],
    textures: ["dots", null, null],
    letterCase: "upper",
    shadow: true,
  },
  {
    id: "christmas",
    name: { en: "Christmas", vi: "Giáng sinh" },
    fonts: [{ font: "playfair", weight: 900 }, { font: "lobster" }, { font: "anton" }, { font: "cormorant", weight: 700, italic: true }, { font: "bungee" }],
    palette: [["#b3202a", "#f5ecd9"], ["#14382a", "#f5ecd9"], ["#f5ecd9", "#b3202a"], ["#e9c46a", "#14382a"], ["#ffffff", "#14382a"]],
    shapes: ["rect", "round", "ticket", "torn"],
    letterCase: "mixed",
    shadow: true,
  },
  {
    id: "tet",
    name: { en: "Lunar New Year", vi: "Tết" },
    fonts: [{ font: "playfair", weight: 900 }, { font: "charm", weight: 700 }, { font: "oswald", weight: 700 }, { font: "anton" }, { font: "lobster" }],
    palette: [["#b71c1c", "#f2c75c"], ["#f2c75c", "#b71c1c"], ["#fff4e0", "#b71c1c"], ["#7f1010", "#ffd84d"]],
    shapes: ["rect", "round", "circle"],
    shadow: true,
  },
  {
    id: "love",
    name: { en: "Love", vi: "Tình yêu" },
    fonts: [{ font: "playfair", weight: 800, italic: true }, { font: "lobster" }, { font: "pacifico" }, { font: "montserrat", weight: 800 }, { font: "dancing", weight: 700 }],
    palette: [["#f8e1e4", "#c2304b"], ["#c2304b", "#ffffff"], ["#ff8fab", "#ffffff"], ["#ffffff", "#c2304b"], ["#3b1219", "#ffb3c1"]],
    shapes: ["round", "rect", "pill"],
    shadow: true,
  },
];

export function cutoutStyle(id: string) {
  return CUTOUT_STYLES.find((s) => s.id === id) ?? CUTOUT_STYLES[0];
}

export const DEFAULT_CUTOUT: CutoutText = { style: "newspaper", seed: 1, by: "letter", mess: 0.5, wave: 0.3, curve: 0 };

/** Every font a style uses, with the weight drawn (to load before measuring). */
export function cutoutFonts(style: CutoutStyle) {
  return style.fonts.map((f) => ({ font: f.font, weight: nearestWeight(f.font, f.weight ?? 400), italic: !!f.italic }));
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
  seed: number;
}

export interface CutoutLayout {
  pieces: Piece[];
  height: number;
  shadow: boolean;
  glow: boolean;
}

type Measure = (text: string, font: string) => number;

let measurer: CanvasRenderingContext2D | null = null;
function canvasMeasure(text: string, font: string) {
  if (!measurer) measurer = document.createElement("canvas").getContext("2d");
  if (!measurer) return text.length * 10;
  measurer.font = font;
  return measurer.measureText(text).width;
}

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

/**
 * Where every scrap goes. Lines wrap at the element width; `wave` moves scraps up and down,
 * `mess` turns them and varies their size, `curve` bends each line into an arc (scraps
 * follow its slope). The height fits the scraps.
 */
export function cutoutLayout(el: Pick<TextElement, "text" | "width" | "fontSize" | "align" | "letterSpacing" | "lineHeight"> & { cutout: CutoutText }, measure: Measure = canvasMeasure): CutoutLayout {
  const c = el.cutout;
  const style = cutoutStyle(c.style);
  const fonts = cutoutFonts(style);
  const s = el.fontSize;
  const pad = style.pad ?? 0.14;
  const sizeVar = (style.sizeVar ?? 0.22) * c.mess;
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
          const f = fonts[Math.floor(r() * fonts.length)];
          let [bg, fg] = style.palette[Math.floor(r() * style.palette.length)];
          let shape = style.shapes[Math.floor(r() * style.shapes.length)];
          // A letter without its scrap takes the darker colour of the pair (readable on paper).
          if (shape === "none" && luminance(fg) > luminance(bg)) [bg, fg] = [fg, bg];
          if (shape === "circle" && [...chunk].length > 1) shape = "round";
          const textures = style.textures ?? [null];
          const texture = textures[Math.floor(r() * textures.length)];
          const size = s * (1 + (r() * 2 - 1) * sizeVar);
          const text = [...chunk].map((ch) => applyCase(ch, style.letterCase, r)).join("");
          const family = fontInfo(f.font).family;
          const tw = measure(text, pieceFont({ italic: f.italic, weight: f.weight, size, font: family }));
          let w = tw + size * pad * 2;
          let h = size * 1.32;
          if (shape === "circle") w = h = Math.max(w, h) * 1.05;
          if (shape === "pill") w += size * 0.3;
          if (shape === "tape" || shape === "ticket") w += size * 0.4;
          const piece: Piece = { index: i, text, cx: 0, cy: 0, w, h, rotation: (r() * 2 - 1) * 14 * c.mess, size, font: family, weight: f.weight, italic: f.italic, bg, fg, shape, texture, seed };
          // Up / down (wave) is decided now so it stays with the scrap.
          piece.cy = (r() * 2 - 1) * c.wave * s * 0.42;
          return piece;
        });
      }),
  );

  // 2. Wrap words to the width.
  const gap = s * 0.05 + el.letterSpacing;
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
    const baseY = ri * advance + s * 0.66;
    const mid = x + rowWidth / 2;
    const half = Math.max(rowWidth / 2, s);
    // Arc height: up to ~a third of the line's half width.
    const bend = c.curve * half * 0.34;
    for (const word of row) {
      for (const p of word) {
        p.cx = x + p.w / 2;
        const u = (p.cx - mid) / half;
        p.cy += baseY - bend * (1 - u * u);
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
  if (!pieces.length) return { pieces, height: s, shadow: !!style.shadow, glow: !!style.glow };
  const margin = s * 0.08;
  for (const p of pieces) p.cy += margin - top;
  return { pieces, height: bottom - top + margin * 2, shadow: !!style.shadow, glow: !!style.glow };
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

function scrapPath(ctx: CanvasRenderingContext2D, p: Piece) {
  const { w, h } = p;
  const x = -w / 2;
  const y = -h / 2;
  const r = rng(p.seed, 77);
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
    case "torn": {
      // Ragged edges: small random bites along every side.
      const step = Math.max(3, p.size * 0.07);
      const j = p.size * 0.035;
      ctx.moveTo(x, y);
      for (let t = step; t < w; t += step) ctx.lineTo(x + t, y + (r() - 0.5) * j * 2);
      for (let t = 0; t < h; t += step) ctx.lineTo(x + w + (r() - 0.5) * j * 2, y + t);
      for (let t = w; t > 0; t -= step) ctx.lineTo(x + t, y + h + (r() - 0.5) * j * 2);
      for (let t = h; t > 0; t -= step) ctx.lineTo(x + (r() - 0.5) * j * 2, y + t);
      ctx.closePath();
      break;
    }
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
  ctx.save();
  ctx.clip();
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
  } else if (p.texture === "dots") {
    ctx.fillStyle = "rgba(0,0,0,0.13)";
    const g = p.size * 0.14;
    for (let gy = y; gy < y + h; gy += g)
      for (let gx = x + ((gy / g) % 2 ? g / 2 : 0); gx < x + w; gx += g) {
        ctx.beginPath();
        ctx.arc(gx, gy, g * 0.28, 0, Math.PI * 2);
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
  ctx.restore();
}

/** Draws the scraps (element pixels; the caller sets the transform). `opacity` multiplies. */
export function drawCutout(ctx: CanvasRenderingContext2D, layout: CutoutLayout) {
  for (const p of layout.pieces) {
    ctx.save();
    ctx.translate(p.cx, p.cy);
    ctx.rotate((p.rotation * Math.PI) / 180);
    if (p.shape !== "none") {
      scrapPath(ctx, p);
      ctx.save();
      if (layout.shadow) {
        ctx.shadowColor = "rgba(0,0,0,0.28)";
        ctx.shadowBlur = p.size * 0.1;
        ctx.shadowOffsetY = p.size * 0.04;
      }
      ctx.globalAlpha *= p.shape === "tape" ? 0.88 : 1;
      ctx.fillStyle = p.bg;
      ctx.fill();
      ctx.restore();
      if (p.texture) texture(ctx, p);
      if (p.shape === "label") {
        // Embossed plastic tape: a light line along the top.
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        ctx.fillRect(-p.w / 2 + p.h * 0.1, -p.h / 2 + p.h * 0.1, p.w - p.h * 0.2, p.h * 0.12);
      }
    }
    ctx.font = pieceFont(p);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = p.fg;
    if (layout.glow) {
      ctx.shadowColor = p.fg;
      ctx.shadowBlur = p.size * 0.25;
    } else if (p.shape === "label") {
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowOffsetY = p.size * 0.03;
    } else if (p.shape === "none" && layout.shadow) {
      ctx.shadowColor = "rgba(0,0,0,0.25)";
      ctx.shadowBlur = p.size * 0.06;
    }
    ctx.fillText(p.text, 0, p.size * 0.05);
    ctx.restore();
  }
}
