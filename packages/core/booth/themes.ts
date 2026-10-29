import type { Decor } from "./decor";
import type { LayoutChoice } from "./layout";

// Booth themes (D-161 step 3, docs/discussions/2026-10-30-booth-khung-theme.md §3): a whole
// look, in groups — the paper and its pattern, ink, cells (border, corners), caption faces,
// the filter, the layout it suggests (arrangement + cell shape), the drawn decorations it
// brings, and the mood of the booth's own screens while shooting / decorating (backdrop,
// falling bits). Picking a theme applies all of it; anything can still be changed after.
// Plain data; render.ts / decor.ts draw it. Adding a theme = adding an entry.

/** Font roles; the app maps them to loaded faces (booth/fonts.ts). */
export type FontRole = "serif" | "mono" | "body" | "candy" | "alice" | "y2k" | "hand" | "script" | "brush" | "poster" | "news" | "tech";

/** The paper's pattern. */
export type Pattern = "none" | "dots" | "suits" | "stars" | "grain" | "kraft" | "hearts" | "snow" | "night" | "news" | "grid" | "stripes" | "neongrid" | "reels";

/** What drifts across the booth's screens. */
export type Particles = "none" | "leaves" | "candy" | "stars" | "snow" | "sparks" | "confetti" | "petals" | "fireflies";

export type ThemeGroup = "cinema" | "vintage" | "forest" | "candy" | "party" | "romance" | "sky" | "school" | "future" | "classic" | "y2k" | "alice" | "season";
export const THEME_GROUPS: ThemeGroup[] = ["cinema", "vintage", "forest", "candy", "party", "romance", "sky", "school", "future", "classic", "y2k", "alice", "season"];

export interface BoothTheme {
  id: string;
  group: ThemeGroup;
  /** Paper: a colour, or top → bottom gradient stops. */
  bg: string | string[];
  /** Caption text. */
  ink: string;
  /** A small rule / accents. */
  accent: string;
  /** An empty cell and its grey figure. */
  empty: string;
  ghost: string;
  /** Film sprocket holes on strips (colour), or none. */
  holes?: string;
  /** The paper's pattern. */
  decor: Pattern;
  /** Around each photo. */
  cellBorder?: { color: string; width: number };
  cellRadius?: number;
  title: { font: FontRole; weight: number; italic?: boolean; upper?: boolean; text: string };
  sub: { font: FontRole };
  /** The filter this theme suggests (filters.ts id); the user can change it. */
  filter?: string;
  /** The arrangement / cell shape it suggests. */
  layout?: LayoutChoice;
  /** The drawn decorations it brings (seeds are set when applied). */
  pieces?: Omit<Decor, "seed">[];
  /** The booth's screens: backdrop (CSS), drifting bits, polaroid paper colour. */
  mood: { floor: string; particles: Particles; colors: string[]; polaroid?: string };
  /** Swatch for the picker. */
  swatch: string[];
}

const floor = (top: string, bottom: string, glow = "rgba(234,166,60,0.18)") => `radial-gradient(ellipse 80% 45% at 50% -5%, ${glow}, transparent 70%), linear-gradient(180deg, ${top}, ${bottom})`;

export const THEMES: BoothTheme[] = [
  // ── Cinema ───────────────────────────────────────────────────────────────
  {
    id: "cinema",
    group: "cinema",
    bg: "#15110e",
    ink: "#efe6d6",
    accent: "#b5452f",
    empty: "#2a231d",
    ghost: "#3d332a",
    holes: "rgba(239,230,214,0.85)",
    decor: "none",
    title: { font: "serif", weight: 700, text: "Photobooth" },
    sub: { font: "mono" },
    mood: { floor: floor("#1a1310", "#120d0a"), particles: "none", colors: [] },
    swatch: ["#15110e", "#efe6d6", "#b5452f"],
  },
  {
    id: "ticket",
    group: "cinema",
    bg: "#efe2c8",
    ink: "#2a1d16",
    accent: "#c8432f",
    empty: "#e2d2b2",
    ghost: "#cdb894",
    decor: "kraft",
    cellBorder: { color: "#2a1d16", width: 5 },
    title: { font: "poster", weight: 400, upper: true, text: "Admit One" },
    sub: { font: "mono" },
    filter: "honey400",
    layout: { arrange: "stagger" },
    pieces: [{ kind: "stars", scope: "print", density: 1, colors: ["#c8432f", "#2a1d16"] }],
    mood: { floor: floor("#2a1d16", "#1a1310"), particles: "none", colors: [] },
    swatch: ["#efe2c8", "#2a1d16", "#c8432f"],
  },
  // ── Vintage (owner, 2026-10-30: báo cũ, phim cũ với cuộn phim tròn) ─────────
  {
    id: "newspaper",
    group: "vintage",
    bg: ["#efe6d2", "#e0d2b2"],
    ink: "#1c1a17",
    accent: "#1c1a17",
    empty: "#d9cdb2",
    ghost: "#c4b694",
    decor: "news",
    cellBorder: { color: "#1c1a17", width: 3 },
    title: { font: "news", weight: 900, text: "The Daily Booth" },
    sub: { font: "news" },
    filter: "press400",
    // Clippings: torn out, pasted a little askew.
    layout: { arrange: "scatter", shape: "torn" },
    mood: { floor: floor("#3a342b", "#1d1a15", "rgba(239,230,210,0.14)"), particles: "none", colors: [], polaroid: "#efe6d2" },
    swatch: ["#efe6d2", "#1c1a17", "#9a8f78"],
  },
  {
    id: "oldfilm",
    group: "vintage",
    bg: ["#221c17", "#14100d"],
    ink: "#ecdfc4",
    accent: "#d9a441",
    empty: "#2e2620",
    ghost: "#40352c",
    holes: "rgba(236,223,196,0.8)",
    decor: "reels",
    cellBorder: { color: "#ecdfc4", width: 3 },
    title: { font: "serif", weight: 700, italic: true, text: "Now Playing" },
    sub: { font: "mono" },
    filter: "expired",
    layout: { arrange: "stagger" },
    pieces: [{ kind: "stars", scope: "print", density: 1, colors: ["#d9a441", "#ecdfc4"] }],
    mood: { floor: floor("#2a221c", "#0f0c0a", "rgba(217,164,65,0.2)"), particles: "stars", colors: ["#ecdfc4"], polaroid: "#ecdfc4" },
    swatch: ["#221c17", "#d9a441", "#ecdfc4"],
  },
  // ── Forest ───────────────────────────────────────────────────────────────
  {
    id: "forest",
    group: "forest",
    bg: ["#e9e3c9", "#cfd9b0"],
    ink: "#2f4a24",
    accent: "#7a9a3c",
    empty: "#dbe3c2",
    ghost: "#b9c99a",
    decor: "kraft",
    cellBorder: { color: "#f7f3e3", width: 9 },
    cellRadius: 6,
    title: { font: "hand", weight: 400, text: "into the woods" },
    sub: { font: "hand" },
    filter: "verde400",
    layout: { arrange: "scatter", shape: "rounded" },
    pieces: [
      { kind: "vine", scope: "print", density: 3 },
      { kind: "garland", scope: "cells", density: 1, colors: ["#f6c453", "#ffffff", "#e98b6d", "#5c9a45"] },
    ],
    mood: { floor: floor("#24361f", "#141f12", "rgba(170,220,120,0.18)"), particles: "leaves", colors: ["#5c9a45", "#86b75a", "#c9a24a"], polaroid: "#f3efdc" },
    swatch: ["#cfd9b0", "#2f4a24", "#7a9a3c"],
  },
  {
    id: "firefly",
    group: "forest",
    bg: ["#16261d", "#0b140f"],
    ink: "#e9f5c9",
    accent: "#d9f26b",
    empty: "#1f3327",
    ghost: "#2c4636",
    decor: "night",
    cellBorder: { color: "#e9f5c9", width: 6 },
    cellRadius: 4,
    title: { font: "hand", weight: 400, text: "fireflies" },
    sub: { font: "hand" },
    filter: "moody",
    layout: { arrange: "stagger", shape: "arch" },
    pieces: [
      { kind: "vine", scope: "print", density: 2, colors: ["#3e6b3a", "#548a45", "#6fa055", "#2a4a28"] },
      { kind: "stars", scope: "print", density: 3, colors: ["#d9f26b", "#fff7a8"] },
    ],
    mood: { floor: floor("#0f1c14", "#070d09", "rgba(217,242,107,0.14)"), particles: "fireflies", colors: ["#d9f26b", "#fff7a8"], polaroid: "#e9f5c9" },
    swatch: ["#0b140f", "#d9f26b", "#e9f5c9"],
  },
  // ── Candy ────────────────────────────────────────────────────────────────
  {
    id: "candy",
    group: "candy",
    bg: "#ffd3e2",
    ink: "#e0457b",
    accent: "#4fbfae",
    empty: "#ffe8f0",
    ghost: "#ffc3d7",
    decor: "dots",
    cellBorder: { color: "#ffffff", width: 10 },
    cellRadius: 22,
    title: { font: "candy", weight: 400, text: "Sweet Booth" },
    sub: { font: "candy" },
    filter: "blossom",
    layout: { arrange: "stagger", shape: "rounded" },
    pieces: [{ kind: "confetti", scope: "print", density: 2, colors: ["#ff6b9a", "#ffd36e", "#6fd3c1", "#ffffff"] }],
    mood: { floor: floor("#ffb8cf", "#f78db1", "rgba(255,255,255,0.4)"), particles: "candy", colors: ["#ff6b9a", "#ffd36e", "#6fd3c1", "#ffffff", "#b99cff"], polaroid: "#ffffff" },
    swatch: ["#ffd3e2", "#e0457b", "#9be3d6", "#ffe28a"],
  },
  {
    id: "bubble",
    group: "candy",
    bg: ["#c9f1ff", "#ffe3f4"],
    ink: "#5b4bd6",
    accent: "#ff7ac3",
    empty: "#eaf7ff",
    ghost: "#cfe8f7",
    decor: "dots",
    cellBorder: { color: "#ffffff", width: 9 },
    title: { font: "candy", weight: 400, text: "bubble pop" },
    sub: { font: "candy" },
    filter: "cotton",
    layout: { arrange: "scatter", shape: "circle" },
    pieces: [{ kind: "stars", scope: "cells", density: 2, colors: ["#ffffff", "#ff7ac3"] }],
    mood: { floor: floor("#a9e4ff", "#ffc4e6", "rgba(255,255,255,0.45)"), particles: "candy", colors: ["#ffffff", "#ff7ac3", "#8fd8ff"], polaroid: "#ffffff" },
    swatch: ["#c9f1ff", "#5b4bd6", "#ff7ac3"],
  },
  // ── Party night ──────────────────────────────────────────────────────────
  {
    id: "fireworks",
    group: "party",
    bg: ["#0d1030", "#1a0b2e"],
    ink: "#ffe9a8",
    accent: "#ff6b8a",
    empty: "#1b1f45",
    ghost: "#2a2f5c",
    decor: "night",
    cellBorder: { color: "#ffe9a8", width: 4 },
    title: { font: "poster", weight: 400, upper: true, text: "Celebrate!" },
    sub: { font: "mono" },
    filter: "electric",
    layout: { arrange: "scatter" },
    pieces: [
      { kind: "fireworks", scope: "print", density: 3, layer: "back" },
      { kind: "sparklers", scope: "print", density: 2 },
    ],
    mood: { floor: floor("#141640", "#07081c", "rgba(255,107,138,0.2)"), particles: "sparks", colors: ["#ffd36e", "#ff6b8a", "#7ad7ff"], polaroid: "#fff7e6" },
    swatch: ["#0d1030", "#ffe9a8", "#ff6b8a"],
  },
  {
    id: "neon",
    group: "party",
    bg: "#0b0b12",
    ink: "#4ff3ff",
    accent: "#ff4fd8",
    empty: "#16161f",
    ghost: "#24243a",
    decor: "grain",
    title: { font: "y2k", weight: 400, upper: true, text: "Night Out" },
    sub: { font: "mono" },
    filter: "neonnight",
    layout: { arrange: "straight", shape: "rounded" },
    pieces: [
      { kind: "neon", scope: "cells", density: 2, colors: ["#ff4fd8", "#4ff3ff", "#b6ff4f"] },
      { kind: "lights", scope: "print", density: 1, colors: ["#ff4fd8", "#4ff3ff", "#b6ff4f"] },
    ],
    mood: { floor: floor("#120c1f", "#05050a", "rgba(255,79,216,0.22)"), particles: "sparks", colors: ["#ff4fd8", "#4ff3ff"], polaroid: "#16161f" },
    swatch: ["#0b0b12", "#ff4fd8", "#4ff3ff"],
  },
  {
    id: "circus",
    group: "party",
    bg: "#fff4e2",
    ink: "#8a1018",
    accent: "#f2b632",
    empty: "#f6e3cf",
    ghost: "#e6c9a8",
    decor: "stripes",
    cellBorder: { color: "#f2b632", width: 8 },
    title: { font: "poster", weight: 400, upper: true, text: "Circus Booth" },
    sub: { font: "mono" },
    filter: "seventies",
    layout: { arrange: "stagger", shape: "arch" },
    pieces: [
      { kind: "lights", scope: "print", density: 2, colors: ["#ffd36e", "#fff3c4"] },
      { kind: "stars", scope: "print", density: 1, colors: ["#f2b632", "#ffffff"] },
    ],
    mood: { floor: floor("#7d0e16", "#3a0609", "rgba(242,182,50,0.28)"), particles: "confetti", colors: ["#f2b632", "#ffffff", "#e23b3b"], polaroid: "#fff4e2" },
    swatch: ["#d8262f", "#fff4e2", "#f2b632"],
  },
  // ── Romance ──────────────────────────────────────────────────────────────
  {
    id: "ribbon",
    group: "romance",
    bg: ["#fbeee6", "#f6d9d6"],
    ink: "#8f2d3f",
    accent: "#d8394f",
    empty: "#f6e2dc",
    ghost: "#eccac3",
    decor: "hearts",
    cellBorder: { color: "#ffffff", width: 8 },
    title: { font: "script", weight: 400, text: "With Love" },
    sub: { font: "alice" },
    filter: "rosy",
    layout: { arrange: "stagger", shape: "polaroid" },
    pieces: [
      { kind: "ribbon", scope: "print", density: 2, colors: ["#d8394f", "#f5c6cf"] },
      { kind: "ribbon", scope: "cells", density: 1, colors: ["#d8394f", "#f5c6cf"] },
    ],
    mood: { floor: floor("#5c2230", "#2e1118", "rgba(255,180,190,0.25)"), particles: "petals", colors: ["#f5a3b5", "#ffd1dc", "#ffffff"], polaroid: "#fffaf6" },
    swatch: ["#f6d9d6", "#8f2d3f", "#d8394f"],
  },
  {
    id: "garden",
    group: "romance",
    bg: "#fdf6ec",
    ink: "#5b4636",
    accent: "#e98fa6",
    empty: "#f3eadc",
    ghost: "#e4d6c0",
    decor: "none",
    cellBorder: { color: "#ffffff", width: 7 },
    title: { font: "script", weight: 400, text: "Bloom" },
    sub: { font: "alice" },
    filter: "peach",
    layout: { arrange: "straight", shape: "arch" },
    pieces: [{ kind: "garland", scope: "print", density: 3, colors: ["#f29bb4", "#ffd36e", "#ffffff", "#c5a3ff"] }],
    mood: { floor: floor("#3b2c25", "#211813", "rgba(255,200,210,0.2)"), particles: "petals", colors: ["#f29bb4", "#ffffff", "#ffd36e"], polaroid: "#fffdf8" },
    swatch: ["#fdf6ec", "#e98fa6", "#5b4636"],
  },
  // ── Sky ──────────────────────────────────────────────────────────────────
  {
    id: "starry",
    group: "sky",
    bg: ["#0f1b3d", "#2a1f5c"],
    ink: "#fff2c2",
    accent: "#ffe28a",
    empty: "#1c2a55",
    ghost: "#2b3b6e",
    decor: "night",
    cellBorder: { color: "#fff2c2", width: 4 },
    cellRadius: 10,
    title: { font: "alice", weight: 700, italic: true, text: "Starry Night" },
    sub: { font: "alice" },
    filter: "midnight",
    layout: { arrange: "stagger", shape: "rounded" },
    pieces: [
      { kind: "moon", scope: "print", density: 2 },
      { kind: "stars", scope: "print", density: 3 },
    ],
    mood: { floor: floor("#121a3a", "#070a1a", "rgba(255,226,138,0.16)"), particles: "stars", colors: ["#fff2c2", "#ffffff"], polaroid: "#fff8e6" },
    swatch: ["#0f1b3d", "#2a1f5c", "#ffe28a"],
  },
  {
    id: "dreamy",
    group: "sky",
    bg: ["#d9d4ff", "#ffd6ec", "#c9ecff"],
    ink: "#6a4fb3",
    accent: "#ff9ccf",
    empty: "#efeaff",
    ghost: "#d8cff5",
    decor: "stars",
    cellBorder: { color: "#ffffff", width: 8 },
    cellRadius: 18,
    title: { font: "brush", weight: 700, text: "daydream" },
    sub: { font: "hand" },
    filter: "glow",
    layout: { arrange: "scatter", shape: "rounded" },
    pieces: [{ kind: "stars", scope: "cells", density: 2, colors: ["#ffffff", "#ffe28a"] }],
    mood: { floor: floor("#a99be8", "#f2b6d8", "rgba(255,255,255,0.4)"), particles: "stars", colors: ["#ffffff", "#fff2c2"], polaroid: "#ffffff" },
    swatch: ["#d9d4ff", "#ffd6ec", "#6a4fb3"],
  },
  // ── School (vở ô ly), Future (cyberpunk) ──────────────────────────────────
  {
    id: "notebook",
    group: "school",
    bg: "#fdfdfb",
    ink: "#2342a8",
    accent: "#e2453c",
    empty: "#eef1f7",
    ghost: "#d5dbe8",
    decor: "grid",
    cellBorder: { color: "#ffffff", width: 8 },
    title: { font: "hand", weight: 400, text: "my booth diary" },
    sub: { font: "hand" },
    filter: "snapshot",
    layout: { arrange: "scatter", shape: "polaroid" },
    pieces: [{ kind: "stars", scope: "print", density: 1, colors: ["#2342a8", "#e2453c"] }],
    mood: { floor: floor("#3b4157", "#1d2030", "rgba(255,255,255,0.12)"), particles: "none", colors: [], polaroid: "#ffffff" },
    swatch: ["#fdfdfb", "#2342a8", "#e2453c"],
  },
  {
    id: "cyberpunk",
    group: "future",
    bg: ["#0a0618", "#1a0b2e"],
    ink: "#2df6ff",
    accent: "#ff2bd6",
    empty: "#140d2a",
    ghost: "#251a45",
    decor: "neongrid",
    title: { font: "tech", weight: 700, upper: true, text: "Neo Saigon" },
    sub: { font: "mono" },
    filter: "cyberpunk",
    layout: { arrange: "stagger", shape: "rect" },
    pieces: [{ kind: "neon", scope: "cells", density: 2, colors: ["#ff2bd6", "#2df6ff"] }],
    mood: { floor: floor("#160a2e", "#05030d", "rgba(255,43,214,0.24)"), particles: "sparks", colors: ["#2df6ff", "#ff2bd6"], polaroid: "#140d2a" },
    swatch: ["#0a0618", "#ff2bd6", "#2df6ff"],
  },
  // ── Classic ──────────────────────────────────────────────────────────────
  {
    id: "classic",
    group: "classic",
    bg: "#ffffff",
    ink: "#1b1b1b",
    accent: "#1b1b1b",
    empty: "#ece9e3",
    ghost: "#d6d2c9",
    decor: "none",
    title: { font: "body", weight: 700, text: "photobooth" },
    sub: { font: "body" },
    mood: { floor: floor("#2a2826", "#141312", "rgba(255,255,255,0.1)"), particles: "none", colors: [], polaroid: "#ffffff" },
    swatch: ["#ffffff", "#1b1b1b", "#d6d2c9"],
  },
  {
    id: "mono",
    group: "classic",
    bg: "#0c0c0c",
    ink: "#f1f1f1",
    accent: "#f1f1f1",
    empty: "#222",
    ghost: "#333",
    holes: "rgba(241,241,241,0.8)",
    decor: "grain",
    title: { font: "mono", weight: 700, upper: true, text: "Photobooth" },
    sub: { font: "mono" },
    filter: "noir",
    mood: { floor: floor("#1a1a1a", "#050505", "rgba(255,255,255,0.08)"), particles: "none", colors: [], polaroid: "#f1f1f1" },
    swatch: ["#0c0c0c", "#f1f1f1", "#777"],
  },
  // ── Y2K, Alice ───────────────────────────────────────────────────────────
  {
    id: "y2k",
    group: "y2k",
    bg: ["#d9c7ff", "#f4f4ff", "#b9e6ff"],
    ink: "#2b1d6b",
    accent: "#ff4fd8",
    empty: "#efeaff",
    ghost: "#d6cdf5",
    decor: "stars",
    cellBorder: { color: "#ffffff", width: 8 },
    cellRadius: 16,
    title: { font: "y2k", weight: 400, upper: true, text: "Photobooth" },
    sub: { font: "mono" },
    filter: "aeropink",
    layout: { arrange: "scatter", shape: "rounded" },
    pieces: [{ kind: "stars", scope: "print", density: 2, colors: ["#ff4fd8", "#ffffff"] }],
    mood: { floor: floor("#8f7bea", "#5fb8ef", "rgba(255,255,255,0.35)"), particles: "stars", colors: ["#ffffff", "#ff4fd8"], polaroid: "#ffffff" },
    swatch: ["#d9c7ff", "#b9e6ff", "#ff4fd8", "#2b1d6b"],
  },
  {
    id: "alice",
    group: "alice",
    bg: ["#f3e7c9", "#e6d3a6"],
    ink: "#3b2a1e",
    accent: "#b2302b",
    empty: "#e4d3ab",
    ghost: "#cdb88c",
    decor: "suits",
    cellBorder: { color: "#3b2a1e", width: 4 },
    title: { font: "alice", weight: 700, italic: true, text: "Wonderland" },
    sub: { font: "alice" },
    filter: "peach",
    layout: { arrange: "scatter", shape: "rect" },
    pieces: [{ kind: "garland", scope: "print", density: 1, colors: ["#b2302b", "#ffffff", "#e9c46a", "#3e6b3a"] }],
    mood: { floor: floor("#3b2a1e", "#1e150e", "rgba(233,196,106,0.2)"), particles: "petals", colors: ["#b2302b", "#ffffff"], polaroid: "#f6ecd2" },
    swatch: ["#f3e7c9", "#3b2a1e", "#b2302b"],
  },
  // ── Seasons ──────────────────────────────────────────────────────────────
  {
    id: "tet",
    group: "season",
    bg: ["#b3141c", "#7d0a10"],
    ink: "#ffd76a",
    accent: "#ffd76a",
    empty: "#9a1219",
    ghost: "#b8282f",
    decor: "none",
    cellBorder: { color: "#ffd76a", width: 6 },
    cellRadius: 6,
    title: { font: "brush", weight: 700, text: "Happy Tết" },
    sub: { font: "alice" },
    filter: "warmplate",
    layout: { arrange: "stagger", shape: "rounded" },
    pieces: [
      { kind: "fireworks", scope: "print", density: 2, layer: "back", colors: ["#ffd76a", "#ffffff", "#ff9b5c"] },
      { kind: "lights", scope: "print", density: 2, colors: ["#ffd76a", "#ff5a4f", "#ffb347"] },
    ],
    mood: { floor: floor("#5c0a0e", "#2a0507", "rgba(255,215,106,0.25)"), particles: "petals", colors: ["#ffd76a", "#ffb3c4", "#ffffff"], polaroid: "#fff4d6" },
    swatch: ["#b3141c", "#ffd76a", "#7d0a10"],
  },
  {
    id: "midautumn",
    group: "season",
    bg: ["#1c2a4a", "#3a2a52"],
    ink: "#ffd98a",
    accent: "#ff9b5c",
    empty: "#26365c",
    ghost: "#33467a",
    decor: "night",
    cellBorder: { color: "#ffd98a", width: 5 },
    cellRadius: 8,
    title: { font: "brush", weight: 700, text: "Trung Thu" },
    sub: { font: "alice" },
    filter: "candle",
    layout: { arrange: "stagger", shape: "circle" },
    pieces: [
      { kind: "moon", scope: "print", density: 1, colors: ["#ffe7a3", "#ffd98a"] },
      { kind: "lights", scope: "print", density: 2, colors: ["#ff9b5c", "#ff5a4f", "#ffd98a"] },
    ],
    mood: { floor: floor("#15203a", "#0a0f1e", "rgba(255,217,138,0.2)"), particles: "fireflies", colors: ["#ffd98a", "#ff9b5c"], polaroid: "#fff4dc" },
    swatch: ["#1c2a4a", "#ffd98a", "#ff9b5c"],
  },
  {
    id: "xmas",
    group: "season",
    bg: ["#1f4d36", "#123324"],
    ink: "#fff6e8",
    accent: "#e23b3b",
    empty: "#245a40",
    ghost: "#2f6e50",
    decor: "snow",
    cellBorder: { color: "#fff6e8", width: 7 },
    title: { font: "script", weight: 400, text: "Merry Christmas" },
    sub: { font: "alice" },
    filter: "coolshot",
    layout: { arrange: "scatter", shape: "polaroid" },
    pieces: [
      { kind: "lights", scope: "print", density: 3, colors: ["#e23b3b", "#ffd36e", "#8ad4ff", "#b6ff8a"] },
      { kind: "stars", scope: "print", density: 1, colors: ["#ffd36e", "#ffffff"] },
    ],
    mood: { floor: floor("#173a29", "#0a1b13", "rgba(255,255,255,0.14)"), particles: "snow", colors: ["#ffffff"], polaroid: "#fffaf0" },
    swatch: ["#1f4d36", "#e23b3b", "#fff6e8"],
  },
];

export function themeById(id: string | undefined): BoothTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Filters offered in the booth (a short, booth-friendly pick of filters.ts). */
export const BOOTH_FILTERS = ["honey400", "cotton", "blossom", "peach", "rosy", "verde400", "snapshot", "flash", "kyoto", "tokyo90", "aeropink", "neonnight", "midnight", "noir", "sepia"];

/** A theme's decorations, ready to draw (a fixed seed per theme + kind, so its look is
 * the same each time it's picked; 🎲 changes it after). */
export function themePieces(t: BoothTheme): Decor[] {
  return (t.pieces ?? []).map((p, i) => ({ ...p, seed: hash(`${t.id}:${p.kind}:${i}`) }));
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
