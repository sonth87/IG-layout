import type { Template, TemplateShape, TemplateSlot, TemplateText } from "../types";
import { block, design, icon, INK, KRAFT, PAPER, photo, t, text, type Words } from "./kit";

// Profile grids, second batch (2026-10-28): 3 × 3 plans where every tile is one post —
// photos and quote tiles taking turns, a word across a row, colour blocks, frames.
// Tile = one slide (3:4); slide n sits at row n / 3, column n % 3.

const G = 0.75;
const TILES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

/** A full-bleed photo on each of `tiles`, numbered in posting order. */
function photoTiles(tiles: number[], extra: Partial<TemplateSlot> = {}) {
  return tiles.map((s, i) => photo(i, s, 0, 0, 1, 1, extra));
}

/** A coloured tile with one word or line on it. */
function wordTile(slide: number, fill: string, words: Words, style: Partial<TemplateText> & { font: TemplateText["font"]; color: string; size: number }): { shape: TemplateShape; text: TemplateText } {
  const { font, color, size, ...rest } = style;
  return { shape: block(slide, 0, 0, 1, 1, fill), text: text(slide, 0.06, 0.5 - (size * G * 0.8) / 2, 0.88, words, { font, color, size, ...rest }) };
}

const CHECKER = [
  wordTile(1, "#efe6d8", t("slow", "chậm"), { font: "cormorant", color: INK, size: 0.2, italic: true }),
  wordTile(3, "#d9c6ad", t("days", "lại"), { font: "cormorant", color: INK, size: 0.2, italic: true }),
  wordTile(5, "#efe6d8", t("are", "những"), { font: "cormorant", color: INK, size: 0.18, italic: true }),
  wordTile(7, "#d9c6ad", t("the best", "ngày đẹp"), { font: "cormorant", color: INK, size: 0.16, italic: true }),
];

const EDGE_WORDS = [
  wordTile(1, "#1d1c1a", t("GOOD", "NGÀY"), { font: "anton", color: "#ffffff", size: 0.2, letterSpacing: 0.06 }),
  wordTile(3, "#1d1c1a", t("DAYS", "ĐẸP"), { font: "anton", color: "#ffffff", size: 0.2, letterSpacing: 0.06 }),
  wordTile(5, "#1d1c1a", t("ARE", "ĐANG"), { font: "anton", color: "#ffffff", size: 0.2, letterSpacing: 0.06 }),
  wordTile(7, "#1d1c1a", t("AHEAD", "TỚI"), { font: "anton", color: "#ffffff", size: 0.2, letterSpacing: 0.06 }),
];

const RAINBOW = ["#f6c9c4", "#f8dcc0", "#f7ecbf", "#d8ecc6", "#c9e6e2", "#c8dcf2", "#d9d0f1", "#efd0e8", "#f2d7d0"];

export const GRIDS: Template[] = [
  design("grid-checker", "grid", t("Checkerboard", "Bàn cờ"), {
    format: "grid",
    themes: ["minimal", "food", "nature"],
    slides: 9,
    shapes: CHECKER.map((c) => c.shape),
    slots: photoTiles([0, 2, 4, 6, 8]),
    texts: CHECKER.map((c) => c.text),
  }),
  design("grid-center-note", "grid", t("Note in the middle", "Lời nhắn ở giữa"), {
    format: "grid",
    themes: ["friends", "travel", "food"],
    slides: 9,
    shapes: [block(4, 0, 0, 1, 1, PAPER)],
    slots: photoTiles([0, 1, 2, 3, 5, 6, 7, 8]),
    texts: [
      text(4, 0.08, 0.3, 0.84, t("hello,\n2027", "xin chào,\n2027"), { font: "greatVibes", size: 0.2, color: INK, lineHeight: 0.95 }),
      text(4, 0.08, 0.72, 0.84, t("new chapter", "chương mới"), { font: "spaceGrotesk", size: 0.06, color: INK, letterSpacing: 0.2 }),
    ],
  }),
  design("grid-plus", "grid", t("Words in a cross", "Chữ hình chữ thập"), {
    format: "grid",
    themes: ["city", "fashion", "mono"],
    slides: 9,
    shapes: [...EDGE_WORDS.map((c) => c.shape)],
    slots: photoTiles([0, 2, 4, 6, 8]),
    texts: EDGE_WORDS.map((c) => c.text),
  }),
  design("grid-panorama-row", "grid", t("Wide middle row", "Hàng giữa toàn cảnh"), {
    format: "grid",
    themes: ["travel", "nature", "beach"],
    slides: 9,
    slots: [photo(0, 0, 0, 0, 1, 1), photo(1, 1, 0, 0, 1, 1), photo(2, 2, 0, 0, 1, 1), photo(3, 3, 0, 0, 3, 1), photo(4, 6, 0, 0, 1, 1), photo(5, 7, 0, 0, 1, 1), photo(6, 8, 0, 0, 1, 1)],
  }),
  design("grid-hi-row", "grid", t("Hi across the row", "Chữ HI giữa lưới"), {
    format: "grid",
    group: "panorama",
    themes: ["beach", "portrait", "nature"],
    slides: "any",
    background: { kind: "photo", photo: 0 },
    slots: [],
    texts: [
      text(3, 0.04, 0.3, 0.92, t("H", "X"), { font: "anton", size: 0.6, color: "#ffffff" }),
      text(4, 0.04, 0.3, 0.92, t("I", "I"), { font: "anton", size: 0.6, color: "#ffffff" }),
      text(5, 0.04, 0.3, 0.92, t("!", "N"), { font: "anton", size: 0.6, color: "#ffffff" }),
    ],
  }),
  design("grid-gallery", "grid", t("Gallery wall", "Tường tranh"), {
    format: "grid",
    themes: ["minimal", "travel", "nature"],
    slides: 9,
    background: { kind: "color", color: "#f4f1ea" },
    slots: TILES.map((s) => photo(s, s, 0.12, 0.12, 0.76, 0.76, { border: { width: 0.012, color: "#ffffff" }, shadow: true })),
    texts: TILES.map((s) => text(s, 0.12, 0.905, 0.76, t(`N° ${String(s + 1).padStart(2, "0")}`, `N° ${String(s + 1).padStart(2, "0")}`), { font: "spaceGrotesk", size: 0.045, color: "#8a8378", align: "right", letterSpacing: 0.15 })),
  }),
  design("grid-polaroids", "grid", t("Polaroid grid", "Lưới polaroid"), {
    format: "grid",
    themes: ["friends", "couple", "party"],
    slides: 9,
    background: { kind: "color", color: KRAFT },
    slots: TILES.map((s) => photo(s, s, 0.1, 0.1, 0.8, 0.7, { frame: "polaroid", shadow: true, rotation: [-4, 3, -2, 5, -3, 2, -5, 4, -1][s] })),
  }),
  design("grid-circles", "grid", t("Pastel circles", "Vòng tròn pastel"), {
    format: "grid",
    themes: ["kids", "flowers", "food"],
    slides: 9,
    shapes: TILES.map((s) => block(s, 0, 0, 1, 1, RAINBOW[s])),
    slots: TILES.map((s) => photo(s, s, 0.1, 0.5 - (0.8 * G) / 2, 0.8, 0.8 * G, { mask: "circle" })),
  }),
  design("grid-rainbow", "grid", t("Rainbow tiles", "Ô cầu vồng"), {
    format: "grid",
    themes: ["flowers", "food", "fashion"],
    slides: 9,
    shapes: TILES.map((s) => block(s, 0, 0, 1, 1, RAINBOW[s])),
    slots: TILES.map((s) => photo(s, s, 0.14, 0.1, 0.72, 0.62)),
    texts: TILES.map((s) => text(s, 0.14, 0.8, 0.72, [t("mon", "t2"), t("tue", "t3"), t("wed", "t4"), t("thu", "t5"), t("fri", "t6"), t("sat", "t7"), t("sun", "cn"), t("& more", "& nữa"), t("♡", "♡")][s], { font: "patrickHand", size: 0.09, color: INK })),
  }),
  design("grid-film-rows", "grid", t("Three film strips", "Ba dải phim"), {
    format: "grid",
    themes: ["mono", "city", "retro"],
    slides: 9,
    background: { kind: "color", color: "#e9e4dc" },
    shapes: [0, 3, 6].map((s) => ({ slide: s, x: 0, y: 0.18, w: 3, h: 0.64, shape: "film" as const, fill: "#161616" })),
    slots: TILES.map((s) => photo(s, s, 0.08, 0.3, 0.84, 0.4)),
    texts: [text(0, 0.08, 0.06, 0.84, t("ROLL 03", "CUỘN 03"), { font: "spaceGrotesk", size: 0.07, color: INK, align: "left", bold: true, letterSpacing: 0.2 })],
  }),
  design("grid-quote-row", "grid", t("Quote across the middle", "Câu nói hàng giữa"), {
    format: "grid",
    themes: ["travel", "nature", "minimal"],
    slides: 9,
    shapes: [3, 4, 5].map((s) => block(s, 0, 0, 1, 1, "#f2ede4")),
    slots: photoTiles([0, 1, 2, 6, 7, 8]),
    texts: [
      text(3, 0.1, 0.36, 2.8, t("“not all who wander are lost”", "“không phải ai lang thang cũng là lạc lối”"), { font: "cormorant", size: 0.16, color: INK, italic: true }),
      text(4, 0.1, 0.66, 0.8, t("— keep going", "— cứ đi tiếp"), { font: "spaceGrotesk", size: 0.05, color: "#8a8378", letterSpacing: 0.2 }),
    ],
  }),
  design("grid-corners", "grid", t("Corners & centre", "Góc & tâm"), {
    format: "grid",
    themes: ["portrait", "fashion", "city"],
    slides: 9,
    shapes: [1, 3, 5, 7].map((s) => block(s, 0, 0, 1, 1, "#e9e2f5")),
    slots: photoTiles([0, 2, 4, 6, 8]),
    icons: [1, 3, 5, 7].map((s, i) => icon(["doodle-sparkle", "doodle-heart", "doodle-star", "doodle-smile"][i], s, 0.3, 0.38, 0.4, { color: "#6d5a9e" })),
  }),
];
