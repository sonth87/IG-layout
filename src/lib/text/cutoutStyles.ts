import type { FontKey } from "@/lib/project/types";

// Cut-out letter styles (D-141), second round (owner, 2026-10-28: "more fonts, more colours,
// paper that is crumpled, torn many ways, stained, old papers of many colours"; no burnt
// paper: owner, same day). A style is data: font pool, paper / ink pools, scrap shapes and paper effects
// with how often each shows. Catalog fonts (c:<id>) are fine: scripts/build-template-art.mjs
// copies their files to cutoutFonts.json.

export type PieceShape =
  | "rect"
  /** Cut with scissors: four slightly skewed straight sides. */
  | "scissor"
  /** Torn all round, small even bites. */
  | "tornFine"
  /** Torn all round, big uneven bites, white paper core showing. */
  | "tornRough"
  /** Cut on some sides, torn on one or two. */
  | "tornSide"
  /** Handmade paper: soft wavy edge. */
  | "deckle"
  | "round"
  | "pill"
  | "circle"
  | "tape"
  | "ticket"
  | "label"
  | "none";

export type PieceTexture = "lines" | "grid" | "dots" | "stripes" | "halftone";

/** Paper wear drawn over a scrap (each picked with its own chance). */
export type PaperEffect = "crumple" | "fold" | "aged" | "stain" | "foxing" | "grain" | "light";

export interface CutoutFont {
  font: FontKey;
  weight?: number;
  italic?: boolean;
}

export interface CutoutStyle {
  id: string;
  name: { en: string; vi: string };
  fonts: CutoutFont[];
  /** Scrap colour, letter colour. */
  palette: [string, string][];
  /** Shapes to pick from (repeat one to make it likelier). */
  shapes: PieceShape[];
  textures?: (PieceTexture | null)[];
  /** Chance (0..1) of each paper effect on a scrap. */
  effects?: Partial<Record<PaperEffect, number>>;
  /** "mixed": each letter upper or lower case at random. */
  letterCase?: "keep" | "upper" | "lower" | "mixed";
  /** Drop shadow under scraps; "soft": barely there (scraps lying flat). */
  shadow?: boolean | "soft";
  /** Letters glow in their own colour (neon). */
  glow?: boolean;
  /** How much letter sizes differ at full mess (0.2 = ±20 %). */
  sizeVar?: number;
  /** Space around the letter in its scrap, relative to the letter size. */
  pad?: number;
  /** Space between scraps, relative to the letter size (negative: they overlap). */
  gap?: number;
  /** How far scraps turn at full mess, in degrees (default 14). */
  tilt?: number;
  /** Printed look: small ink gaps in the letters. */
  print?: boolean;
}

// ── Paper and ink pools ───────────────────────────────────────────────────
const AGED = ["#f3ead2", "#efe3c4", "#e9dcb5", "#e6d3a8", "#f1e6cf", "#ddcfae", "#ece4d0", "#e2d2a2"];
const NEWSPRINT = ["#e9e6dd", "#dedad0", "#d6d2c6", "#ecebe6", "#e4dfd3", "#cfcabd"];
const SALMON = ["#f4d7c3", "#f0cdb6", "#f6e0d0"];
const SEPIA = ["#d8c3a0", "#cdb48a", "#c9ad80", "#bfa074"];
const WHITE = ["#ffffff", "#fbfaf6", "#f7f5ef"];
const KRAFT = ["#c8a374", "#d9bf94", "#b8895a", "#cfae82", "#a87f52"];
const BLUEPRINT = ["#dfe7ef", "#d3dee8", "#e6ecf1"];
const MINTY = ["#dde8de", "#e3ece2"];
const INKS = ["#1d1c1a", "#2b2622", "#3b2f25", "#1f2a44", "#5a1e1e", "#2f3a2c"];

/** Every paper with every ink, plus some dark scraps with paper-coloured letters. */
function paperInk(papers: string[], inks: string[], darks: [string, string][] = []): [string, string][] {
  return [...papers.flatMap((p) => inks.map((i) => [p, i] as [string, string])), ...darks];
}

const DARKS: [string, string][] = [
  ["#1d1c1a", "#f3ead2"],
  ["#2b2622", "#efe3c4"],
  ["#7a1f1f", "#f3ead2"],
  ["#1f2a44", "#ece4d0"],
  ["#3b2f25", "#e9dcb5"],
];

// ── Font pools ────────────────────────────────────────────────────────────
/** Newspaper mastheads (blackletter, like the big papers' names). */
const MASTHEAD: CutoutFont[] = [{ font: "c:fruktur" }, { font: "grenze", weight: 800 }, { font: "c:pirata-one" }, { font: "grenze", weight: 600 }];
/** Classic text serifs (old newspapers and books). */
const OLD_SERIF: CutoutFont[] = [
  { font: "playfair", weight: 900 },
  { font: "playfair", weight: 700, italic: true },
  { font: "bodoni", weight: 700 },
  { font: "bodoni", weight: 400, italic: true },
  { font: "ebGaramond", weight: 800 },
  { font: "ebGaramond", weight: 500, italic: true },
  { font: "newsreader", weight: 800 },
  { font: "newsreader", weight: 400, italic: true },
  { font: "literata", weight: 700 },
  { font: "crimson", weight: 700, italic: true },
  { font: "vollkorn", weight: 900 },
  { font: "merriweather", weight: 900 },
  { font: "sourceSerif", weight: 700 },
  { font: "alegreya", weight: 800, italic: true },
];
/** Roman capitals (inscriptions, Trajan-like). */
const ROMAN: CutoutFont[] = [{ font: "c:gideon-roman" }, { font: "c:luxurious-roman" }, { font: "c:viaoda-libre" }, { font: "c:cinzel-decorative", weight: 700 }, { font: "cormorant", weight: 600 }, { font: "yeseva" }];
const SLAB: CutoutFont[] = [{ font: "robotoSlab", weight: 800 }, { font: "bitter", weight: 900 }, { font: "c:alfa-slab-one" }, { font: "brygada", weight: 700 }];
const CONDENSED: CutoutFont[] = [{ font: "oswald", weight: 600 }, { font: "anton" }, { font: "bigShoulders", weight: 900 }, { font: "leagueSpartan", weight: 800 }, { font: "archivo", weight: 900 }, { font: "c:vina-sans" }, { font: "yanone", weight: 700 }];
const TYPEWRITER: CutoutFont[] = [{ font: "c:special-elite" }, { font: "spaceMono", weight: 400 }, { font: "spaceMono", weight: 700 }, { font: "robotoMono", weight: 500 }, { font: "jetbrains", weight: 400 }, { font: "c:vt323" }, { font: "recursive", weight: 600 }];
const DISPLAY: CutoutFont[] = [{ font: "bungee" }, { font: "c:bungee-shade" }, { font: "c:bungee-inline" }, { font: "dela" }, { font: "c:rowdies", weight: 400 }, { font: "c:sigmar" }, { font: "c:calistoga" }, { font: "c:sansita-swashed", weight: 600 }, { font: "paytone" }, { font: "c:big-shoulders-inline", weight: 600 }];
const HAND: CutoutFont[] = [{ font: "patrickHand" }, { font: "itim" }, { font: "mali", weight: 600 }, { font: "shantell", weight: 600 }, { font: "playpen", weight: 600 }, { font: "c:mansalva" }, { font: "c:pangolin" }, { font: "c:grape-nuts" }];
const SCRIPT: CutoutFont[] = [{ font: "lobster" }, { font: "pacifico" }, { font: "dancing", weight: 700 }, { font: "greatVibes" }, { font: "c:alex-brush" }, { font: "c:sansita-swashed", weight: 600 }, { font: "playball" }];
const ROUNDED: CutoutFont[] = [{ font: "nunito", weight: 900 }, { font: "quicksand", weight: 700 }, { font: "comfortaa", weight: 700 }, { font: "gluten", weight: 700 }, { font: "playpen", weight: 700 }, { font: "c:baloo-2", weight: 600 }, { font: "c:coiny" }, { font: "c:grandstander", weight: 600 }];
const BRUSH: CutoutFont[] = [{ font: "c:protest-riot" }, { font: "c:protest-strike" }, { font: "c:protest-revolution" }, { font: "c:sedgwick-ave-display" }, { font: "c:road-rage" }, { font: "c:splash" }];
const STENCIL: CutoutFont[] = [{ font: "c:black-ops-one" }, { font: "c:saira-stencil-one" }, { font: "c:protest-guerrilla" }];
const PIXEL: CutoutFont[] = [{ font: "c:vt323" }, { font: "c:handjet", weight: 600 }, { font: "tektur", weight: 700 }, { font: "c:goldman", weight: 700 }];
const MODERN: CutoutFont[] = [{ font: "montserrat", weight: 900 }, { font: "montserrat", weight: 300 }, { font: "unbounded", weight: 800 }, { font: "bricolage", weight: 800 }, { font: "fraunces", weight: 300 }, { font: "fraunces", weight: 900, italic: true }];

const TORN_SHAPES: PieceShape[] = ["tornFine", "tornRough", "tornSide", "tornRough"];
const CUT_SHAPES: PieceShape[] = ["scissor", "scissor", "rect"];

export const CUTOUT_STYLES: CutoutStyle[] = [
  {
    // Like printed letters cut out with scissors and glued edge to edge (SCRL's cut-out
    // phrases, owner 2026-10-28): tight scraps that touch, hardly turned, heavy print faces,
    // mostly off-white paper and black ink with a little red, mustard and blue.
    id: "classic",
    name: { en: "Classic cut & paste", vi: "Cắt dán cổ điển" },
    fonts: [
      { font: "playfair", weight: 900 },
      { font: "bodoni", weight: 900 },
      { font: "bodoni", weight: 700, italic: true },
      { font: "ebGaramond", weight: 800 },
      { font: "c:alfa-slab-one" },
      { font: "robotoSlab", weight: 900 },
      { font: "bitter", weight: 900 },
      { font: "archivo", weight: 900 },
      { font: "oswald", weight: 700 },
      { font: "anton" },
      { font: "leagueSpartan", weight: 900 },
      { font: "montserrat", weight: 900 },
      { font: "c:calistoga" },
      { font: "newsreader", weight: 800 },
      { font: "vollkorn", weight: 900 },
      { font: "merriweather", weight: 900 },
      { font: "fraunces", weight: 900 },
      { font: "yeseva" },
      { font: "c:special-elite" },
      { font: "grenze", weight: 800 },
    ],
    palette: [
      ...paperInk(["#f2efe8", "#ebe7de", "#e4e0d6", "#f5f3ee", "#ddd8cc", "#efe8d8"], ["#1a1a1a", "#1a1a1a", "#262422"]),
      ["#d64a3b", "#ffffff"], ["#d64a3b", "#ffffff"], ["#1a1a1a", "#f2efe8"], ["#1a1a1a", "#f2efe8"], ["#d9b44a", "#1a1a1a"], ["#d9b44a", "#1a1a1a"],
      ["#f2efe8", "#d64a3b"], ["#ebe7de", "#d64a3b"], ["#5a83b8", "#ffffff"], ["#f2efe8", "#2f5d9a"], ["#c9c3b5", "#1a1a1a"],
    ],
    shapes: ["scissor", "scissor", "scissor", "rect"],
    effects: { grain: 1, light: 1, crumple: 0.08, aged: 0.12 },
    letterCase: "mixed",
    shadow: "soft",
    sizeVar: 0.18,
    pad: 0.06,
    gap: -0.035,
    tilt: 4,
    print: true,
  },
  {
    id: "newspaper",
    name: { en: "Old newspaper", vi: "Báo cũ" },
    fonts: [...MASTHEAD, ...OLD_SERIF, ...CONDENSED.slice(0, 4), ...TYPEWRITER.slice(0, 3), ...ROMAN.slice(0, 2)],
    palette: paperInk([...AGED, ...NEWSPRINT, ...SALMON, ...SEPIA, ...WHITE], INKS, DARKS),
    shapes: [...CUT_SHAPES, ...TORN_SHAPES, "deckle"],
    effects: { crumple: 0.35, aged: 0.5, stain: 0.15, foxing: 0.25, grain: 0.7, fold: 0.2 },
    textures: [null, null, null, "halftone"],
    letterCase: "mixed",
    shadow: true,
    pad: 0.09,
    gap: -0.01,
    tilt: 8,
    print: true,
  },
  {
    id: "gazette",
    name: { en: "The Gazette", vi: "Nhật báo" },
    fonts: [...MASTHEAD, ...MASTHEAD, ...OLD_SERIF.slice(0, 8)],
    palette: paperInk([...NEWSPRINT, ...AGED.slice(0, 4), ...WHITE], ["#111111", "#1d1c1a", "#2b2622"], [["#111111", "#ecebe6"]]),
    shapes: CUT_SHAPES,
    effects: { grain: 0.8, crumple: 0.2, fold: 0.25, aged: 0.3 },
    letterCase: "keep",
    shadow: true,
    sizeVar: 0.15,
    pad: 0.08,
    gap: -0.02,
    tilt: 5,
    print: true,
  },
  {
    id: "oldLetters",
    name: { en: "Old letters", vi: "Thư cũ" },
    fonts: [...SCRIPT.slice(2), ...OLD_SERIF.filter((f) => f.italic), ...TYPEWRITER.slice(0, 2)],
    palette: paperInk([...AGED, ...SEPIA, "#e8d5b5", "#dcc49c"], ["#3b2f25", "#2b2622", "#1f2a44", "#5a3a1e"]),
    shapes: ["deckle", "tornFine", "tornSide", "scissor"],
    effects: { aged: 0.85, stain: 0.35, foxing: 0.5, crumple: 0.3, grain: 0.6, fold: 0.25 },
    shadow: true,
  },
  {
    id: "crumpled",
    name: { en: "Crumpled", vi: "Giấy nhàu" },
    fonts: [...OLD_SERIF.slice(0, 6), ...CONDENSED.slice(0, 4), ...HAND.slice(0, 3), ...TYPEWRITER.slice(0, 2)],
    palette: paperInk([...WHITE, ...NEWSPRINT, ...AGED.slice(0, 4), ...BLUEPRINT], INKS.slice(0, 4)),
    shapes: [...TORN_SHAPES, "scissor"],
    effects: { crumple: 1, fold: 0.4, grain: 0.5, aged: 0.2 },
    letterCase: "mixed",
    shadow: true,
  },
  {
    id: "magazine",
    name: { en: "Glossy magazine", vi: "Tạp chí màu" },
    fonts: [...DISPLAY, ...CONDENSED, { font: "playfair", weight: 900, italic: true }, ...MODERN, ...SCRIPT.slice(0, 2)],
    palette: [
      ["#e63946", "#ffffff"], ["#ffd84d", "#1d1c1a"], ["#2b59c3", "#ffffff"], ["#ff8fab", "#1d1c1a"], ["#1d1c1a", "#ffffff"], ["#2a9d8f", "#ffffff"], ["#ffffff", "#e63946"],
      ["#f4a261", "#1d1c1a"], ["#8e44ad", "#ffffff"], ["#00b4d8", "#ffffff"], ["#ffffff", "#1d1c1a"], ["#ff006e", "#ffffff"], ["#06d6a0", "#1d1c1a"], ["#fb5607", "#ffffff"], ["#3a86ff", "#ffd84d"], ["#f1ead8", "#e63946"],
    ],
    shapes: ["rect", "scissor", "scissor", "round", "circle", "tornSide"],
    effects: { crumple: 0.15, grain: 0.3, fold: 0.1 },
    textures: [null, null, null, "halftone", "dots"],
    letterCase: "mixed",
    shadow: true,
    pad: 0.1,
    gap: 0,
    tilt: 10,
  },
  {
    id: "fashion",
    name: { en: "Fashion", vi: "Thời trang" },
    fonts: [{ font: "bodoni", weight: 400 }, { font: "bodoni", weight: 700, italic: true }, { font: "playfair", weight: 400, italic: true }, { font: "cormorant", weight: 600 }, { font: "fraunces", weight: 300 }, { font: "montserrat", weight: 300 }, { font: "c:gideon-roman" }, { font: "c:viaoda-libre" }, { font: "c:luxurious-roman" }],
    palette: [["#ffffff", "#1d1c1a"], ["#1d1c1a", "#ffffff"], ["#c1121f", "#ffffff"], ["#f5f0e8", "#c1121f"], ["#e8e1d7", "#1d1c1a"], ["#d4c5b0", "#1d1c1a"], ["#ffffff", "#8a6a22"]],
    shapes: ["rect", "scissor"],
    effects: { grain: 0.2 },
    letterCase: "upper",
    shadow: true,
    sizeVar: 0.15,
    pad: 0.08,
    gap: -0.02,
    tilt: 5,
  },
  {
    id: "roman",
    name: { en: "Roman", vi: "La Mã" },
    fonts: [...ROMAN, ...ROMAN, { font: "c:im-fell-dw-pica-sc" }, { font: "c:metamorphous" }],
    palette: paperInk(["#e9e4da", "#d9d3c7", "#efe9de", "#cfc6b5", "#f4efe6", "#bfb7a8"], ["#2b2622", "#3d3a35", "#5a1e1e", "#6b5a3a"], [["#2b2622", "#e9e4da"], ["#5a1e1e", "#efe3c4"]]),
    shapes: ["scissor", "tornRough", "deckle", "rect"],
    effects: { grain: 0.8, aged: 0.4, stain: 0.15, crumple: 0.15 },
    textures: [null, null, "dots"],
    letterCase: "upper",
    shadow: true,
    sizeVar: 0.12,
    pad: 0.08,
    gap: -0.01,
    tilt: 5,
    print: true,
  },
  {
    id: "headline",
    name: { en: "Headline", vi: "Tiêu đề lớn" },
    fonts: [...CONDENSED, ...MASTHEAD, { font: "playfair", weight: 900 }, ...SLAB, { font: "dela" }, { font: "bungee" }],
    palette: [...paperInk([...NEWSPRINT, ...WHITE, ...AGED.slice(0, 3)], ["#1d1c1a", "#c1121f"]), ["#1d1c1a", "#ffffff"], ["#ffd84d", "#1d1c1a"], ["#c1121f", "#ffffff"]],
    shapes: ["scissor", "rect", "none", "none", "tornSide"],
    effects: { grain: 0.5, crumple: 0.2 },
    letterCase: "upper",
    shadow: true,
    sizeVar: 0.45,
    gap: 0,
    tilt: 8,
    print: true,
  },
  {
    id: "kraft",
    name: { en: "Kraft paper", vi: "Giấy kraft" },
    fonts: [...SLAB, ...HAND.slice(0, 4), ...TYPEWRITER.slice(0, 3), ...CONDENSED.slice(0, 3), { font: "c:special-elite" }],
    palette: paperInk(KRAFT, ["#1d1c1a", "#3b2f25", "#fff8ec"], [["#3b2f25", "#e6d8c3"]]),
    shapes: [...TORN_SHAPES, "scissor", "deckle"],
    effects: { grain: 0.9, crumple: 0.35, stain: 0.15, fold: 0.2 },
    letterCase: "mixed",
    shadow: true,
  },
  {
    id: "lined",
    name: { en: "Notebook paper", vi: "Giấy vở" },
    fonts: HAND,
    palette: paperInk(["#fbfaf6", "#f7f3e6", "#fdfdfb", "#f3f0e6"], ["#1d1c1a", "#2b4fa8", "#c1121f", "#1f2a44"]),
    shapes: ["tornFine", "tornSide", "tornSide", "scissor"],
    textures: ["lines"],
    effects: { crumple: 0.3, fold: 0.2, grain: 0.3 },
    shadow: true,
  },
  {
    id: "grid",
    name: { en: "Grid paper", vi: "Giấy ô ly" },
    fonts: [...HAND, ...TYPEWRITER.slice(1, 3)],
    palette: paperInk(["#fbfaf6", "#eef4fb", "#f3f7f2"], ["#1d1c1a", "#2b4fa8", "#2f6b4f"]),
    shapes: ["scissor", "tornFine", "tornSide"],
    textures: ["grid"],
    effects: { crumple: 0.25, grain: 0.3 },
    shadow: true,
  },
  {
    id: "scraps",
    name: { en: "Torn scraps", vi: "Mẩu giấy xé" },
    fonts: [...OLD_SERIF.slice(0, 6), ...CONDENSED.slice(0, 4), ...HAND.slice(0, 3), ...SLAB.slice(0, 2)],
    palette: paperInk([...WHITE, ...AGED.slice(0, 4), ...NEWSPRINT.slice(0, 3), "#dfe6ea", "#f6dede", ...MINTY], INKS.slice(0, 5)),
    shapes: TORN_SHAPES,
    effects: { crumple: 0.3, grain: 0.5, aged: 0.2 },
    letterCase: "mixed",
    shadow: true,
  },
  {
    id: "notes",
    name: { en: "Sticky notes", vi: "Giấy note" },
    fonts: [...HAND, ...ROUNDED.slice(0, 3)],
    palette: paperInk(["#fff176", "#ffb3c7", "#a7d8ff", "#b9f6ca", "#ffcc80", "#e1bee7", "#fff59d"], ["#1d1c1a", "#1f2a44"]),
    shapes: ["rect", "rect", "tornSide"],
    effects: { crumple: 0.2, fold: 0.15 },
    shadow: true,
  },
  {
    id: "labelMaker",
    name: { en: "Label maker", vi: "Máy in nhãn" },
    fonts: [{ font: "spaceMono", weight: 700 }, { font: "robotoMono", weight: 700 }, { font: "jetbrains", weight: 800 }, { font: "c:vt323" }],
    palette: [["#111111", "#ffffff"], ["#d62828", "#ffffff"], ["#1d4ed8", "#ffffff"], ["#15803d", "#ffffff"], ["#f4d35e", "#1d1c1a"], ["#7c3aed", "#ffffff"], ["#f472b6", "#ffffff"], ["#e5e7eb", "#111111"]],
    shapes: ["label"],
    letterCase: "upper",
    sizeVar: 0.08,
  },
  {
    id: "washi",
    name: { en: "Washi tape", vi: "Băng dính washi" },
    fonts: [...ROUNDED.slice(0, 4), ...HAND.slice(0, 3)],
    palette: paperInk(["#f6c9d0", "#cfe2ef", "#f2e3a3", "#d6e8c8", "#e2d4f0", "#ffd8b5", "#c8ece4"], ["#1d1c1a", "#5a3a4a"]),
    shapes: ["tape"],
    textures: ["stripes", "dots", "grid", null],
  },
  {
    id: "ticket",
    name: { en: "Tickets", vi: "Vé" },
    fonts: [...CONDENSED.slice(0, 3), ...TYPEWRITER.slice(1, 3), { font: "bungee" }, ...SLAB.slice(0, 3), { font: "c:bungee-inline" }],
    palette: [["#f4d35e", "#1d1c1a"], ["#e76f51", "#ffffff"], ["#2a9d8f", "#ffffff"], ["#f1ead8", "#c1121f"], ["#e9c46a", "#264653"], ["#ffb4a2", "#1d1c1a"], ["#a8dadc", "#1d3557"], ["#ffffff", "#e76f51"]],
    shapes: ["ticket"],
    effects: { crumple: 0.25, grain: 0.4, fold: 0.15 },
    letterCase: "upper",
    shadow: true,
  },
  {
    id: "typewriter",
    name: { en: "Typewriter", vi: "Đánh máy" },
    fonts: TYPEWRITER,
    palette: paperInk(["#ffffff", "#f4efe3", "#efe3c4", "#e9e6dd", "#f7f3e6"], ["#1d1c1a", "#2b2622", "#b3202a", "#1f2a44"]),
    shapes: ["scissor", "rect", "tornSide"],
    effects: { grain: 0.6, aged: 0.3, crumple: 0.2 },
    letterCase: "lower",
    shadow: true,
    sizeVar: 0.1,
    print: true,
  },
  {
    id: "pastel",
    name: { en: "Pastel", vi: "Pastel" },
    fonts: [...ROUNDED, ...SCRIPT.slice(0, 2)],
    palette: [["#ffd6e0", "#b0466c"], ["#d7ecff", "#2f5d8a"], ["#e2f7e1", "#2f6b4f"], ["#fff1c1", "#8a5a17"], ["#e9ddff", "#5b3fa0"], ["#ffe5d0", "#a0522d"], ["#d0f4f0", "#1f6f68"], ["#ffffff", "#e86f9a"], ["#fde2e4", "#6d597a"]],
    shapes: ["round", "circle", "rect", "pill", "scissor"],
  },
  {
    id: "mono",
    name: { en: "Black & white", vi: "Đen trắng" },
    fonts: [...OLD_SERIF.slice(0, 6), ...CONDENSED.slice(0, 4), ...TYPEWRITER.slice(0, 3), ...MASTHEAD.slice(0, 2), ...ROMAN.slice(0, 2), ...STENCIL.slice(0, 1)],
    palette: [["#000000", "#ffffff"], ["#ffffff", "#000000"], ["#e5e5e5", "#000000"], ["#333333", "#ffffff"], ["#bdbdbd", "#000000"], ["#f5f5f5", "#222222"], ["#111111", "#d9d9d9"]],
    shapes: ["rect", "scissor", ...TORN_SHAPES],
    effects: { grain: 0.6, crumple: 0.3, fold: 0.15 },
    textures: [null, null, null, "halftone"],
    letterCase: "mixed",
    shadow: true,
    pad: 0.1,
    gap: -0.01,
    tilt: 8,
    print: true,
  },
  {
    id: "neon",
    name: { en: "Neon", vi: "Neon" },
    fonts: [{ font: "bungee" }, { font: "tektur", weight: 700 }, { font: "unbounded", weight: 700 }, { font: "pacifico" }, { font: "c:tilt-neon" }, { font: "c:audiowide" }, { font: "c:goldman", weight: 700 }, { font: "lobster" }],
    palette: [["#0b0b14", "#ff4fd8"], ["#140a2a", "#4ff3ff"], ["#0b0b14", "#c6ff4f"], ["#1a0b14", "#ffd84f"], ["#0a1420", "#ff7a4f"], ["#120a1f", "#b48cff"]],
    shapes: ["round", "rect", "pill"],
    glow: true,
  },
  {
    id: "y2k",
    name: { en: "Y2K", vi: "Y2K" },
    fonts: [{ font: "unbounded", weight: 800 }, { font: "bungee" }, { font: "smooch", weight: 800 }, { font: "tektur", weight: 800 }, { font: "lobster" }, { font: "c:rubik-bubbles" }, { font: "c:coiny" }, { font: "c:zen-dots" }, { font: "c:bungee-shade" }],
    palette: [["#d9d9e3", "#6b21a8"], ["#ff9ce6", "#ffffff"], ["#b28dff", "#ffffff"], ["#9cf6ff", "#6b21a8"], ["#ffffff", "#ff4fd8"], ["#c0f1ff", "#ff4fd8"], ["#ffe066", "#7b2ff7"], ["#e8e8f0", "#0077ff"]],
    shapes: ["pill", "round", "circle", "rect"],
    shadow: true,
  },
  {
    id: "comic",
    name: { en: "Comic", vi: "Truyện tranh" },
    fonts: [{ font: "c:bangers" }, { font: "bungee" }, { font: "anton" }, { font: "dela" }, { font: "c:luckiest-guy" }, { font: "c:kablammo" }, { font: "c:sigmar" }, { font: "c:titan-one" }],
    palette: [["#ffe14d", "#1d1c1a"], ["#4fc3f7", "#1d1c1a"], ["#ff5a5f", "#ffffff"], ["#ffffff", "#1d1c1a"], ["#7bd389", "#1d1c1a"], ["#ff9f1c", "#1d1c1a"], ["#c77dff", "#ffffff"]],
    shapes: ["rect", "round", "scissor"],
    textures: ["dots", "halftone", null],
    letterCase: "upper",
    shadow: true,
  },
  {
    id: "grunge",
    name: { en: "Grunge", vi: "Bụi bặm" },
    fonts: [{ font: "grenze", weight: 800 }, ...CONDENSED.slice(0, 4), ...STENCIL, ...BRUSH.slice(0, 3), { font: "c:special-elite" }, { font: "c:rubik-dirt" }],
    palette: [["#2b2b2b", "#e9e4da"], ["#4a4a46", "#ffffff"], ["#e9e4da", "#1d1c1a"], ["#7a1f1f", "#f1ead8"], ["#3d3a2f", "#d9c9a3"], ["#c9c2b2", "#2b2b2b"], ["#1d1c1a", "#c1121f"]],
    shapes: TORN_SHAPES,
    textures: ["halftone", null, null],
    effects: { crumple: 0.5, stain: 0.3, grain: 0.9, fold: 0.3 },
    letterCase: "upper",
    shadow: true,
  },
  {
    id: "street",
    name: { en: "Street poster", vi: "Áp phích đường phố" },
    fonts: [...BRUSH, ...STENCIL, ...CONDENSED.slice(0, 3)],
    palette: [["#ffd84d", "#1d1c1a"], ["#ff3d00", "#ffffff"], ["#1d1c1a", "#ffd84d"], ["#ffffff", "#ff3d00"], ["#00c2a8", "#1d1c1a"], ["#ff4fa3", "#1d1c1a"], ["#e9e4da", "#1d1c1a"]],
    shapes: ["tornRough", "tornSide", "scissor"],
    effects: { crumple: 0.4, grain: 0.6, stain: 0.1, fold: 0.2 },
    textures: [null, "halftone"],
    letterCase: "upper",
    shadow: true,
  },
  {
    id: "vintageLabel",
    name: { en: "Vintage labels", vi: "Nhãn cổ điển" },
    fonts: [...SLAB, { font: "c:calistoga" }, { font: "c:sansita-swashed", weight: 600 }, ...SCRIPT.slice(0, 3), ...ROMAN.slice(0, 3), { font: "c:bungee-shade" }],
    palette: [["#2f4858", "#f6e7cb"], ["#8c2f39", "#f6e7cb"], ["#f6e7cb", "#8c2f39"], ["#e3b04b", "#2f2f2f"], ["#3d5a40", "#f6e7cb"], ["#f1e3c8", "#2f4858"], ["#b5651d", "#fff4e0"]],
    shapes: ["round", "ticket", "scissor", "deckle"],
    effects: { aged: 0.6, grain: 0.7, stain: 0.15, foxing: 0.2, crumple: 0.15 },
    shadow: true,
  },
  {
    id: "pixel",
    name: { en: "Pixel", vi: "Điểm ảnh" },
    fonts: PIXEL,
    palette: [["#111111", "#39ff14"], ["#1a1a2e", "#ff4fd8"], ["#ffffff", "#1d1c1a"], ["#4cc9f0", "#1d1c1a"], ["#ffd84d", "#1d1c1a"], ["#7209b7", "#ffffff"]],
    shapes: ["rect"],
    textures: ["grid", null],
    letterCase: "upper",
    sizeVar: 0.1,
  },
  {
    id: "christmas",
    name: { en: "Christmas", vi: "Giáng sinh" },
    fonts: [{ font: "playfair", weight: 900 }, { font: "lobster" }, { font: "anton" }, { font: "cormorant", weight: 700, italic: true }, { font: "bungee" }, { font: "c:mountains-of-christmas", weight: 700 }, ...MASTHEAD.slice(0, 2), ...SCRIPT.slice(3, 5), ...SLAB.slice(0, 2)],
    palette: [["#b3202a", "#f5ecd9"], ["#14382a", "#f5ecd9"], ["#f5ecd9", "#b3202a"], ["#e9c46a", "#14382a"], ["#ffffff", "#14382a"], ["#7a1f1f", "#e9c46a"], ["#2d6a4f", "#ffffff"], ["#f5ecd9", "#14382a"], ["#d9d9d9", "#b3202a"]],
    shapes: ["rect", "round", "ticket", "tornRough", "scissor", "deckle"],
    effects: { grain: 0.4, crumple: 0.15, aged: 0.15 },
    textures: [null, null, "stripes"],
    letterCase: "mixed",
    shadow: true,
  },
  {
    id: "tet",
    name: { en: "Lunar New Year", vi: "Tết" },
    fonts: [{ font: "playfair", weight: 900 }, { font: "charm", weight: 700 }, { font: "oswald", weight: 700 }, { font: "anton" }, { font: "lobster" }, { font: "c:charmonman", weight: 700 }, ...ROMAN.slice(0, 3), { font: "c:sansita-swashed", weight: 600 }],
    palette: [["#b71c1c", "#f2c75c"], ["#f2c75c", "#b71c1c"], ["#fff4e0", "#b71c1c"], ["#7f1010", "#ffd84d"], ["#d32f2f", "#ffffff"], ["#ffcc80", "#7f1010"], ["#ffe0b2", "#b71c1c"]],
    shapes: ["rect", "round", "circle", "scissor", "deckle"],
    effects: { grain: 0.4, crumple: 0.1 },
    shadow: true,
  },
  {
    id: "love",
    name: { en: "Love", vi: "Tình yêu" },
    fonts: [{ font: "playfair", weight: 800, italic: true }, ...SCRIPT, { font: "montserrat", weight: 800 }, ...ROMAN.slice(4), { font: "c:love-light" }],
    palette: [["#f8e1e4", "#c2304b"], ["#c2304b", "#ffffff"], ["#ff8fab", "#ffffff"], ["#ffffff", "#c2304b"], ["#3b1219", "#ffb3c1"], ["#ffd6e0", "#7a1f3d"], ["#e5989b", "#ffffff"], ["#f4acb7", "#3b1219"]],
    shapes: ["round", "rect", "pill", "scissor", "deckle"],
    effects: { grain: 0.3, aged: 0.1 },
    shadow: true,
  },
];

export function cutoutStyle(id: string) {
  return CUTOUT_STYLES.find((s) => s.id === id) ?? CUTOUT_STYLES[0];
}
