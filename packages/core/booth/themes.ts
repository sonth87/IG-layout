// Booth themes (design §4, Q-P4 proposal 2026-10-29): what a print looks like around the
// photos — paper colour, ink, decoration, caption face — plus the filter it suggests. Plain
// data; render.ts draws it. Adding a theme = adding an entry (and its font role if new).

/** Font roles; the app maps them to loaded faces (booth/fonts.ts). */
export type FontRole = "serif" | "mono" | "body" | "candy" | "alice" | "y2k";

export type Decor = "none" | "dots" | "suits" | "stars" | "grain";

export interface BoothTheme {
  id: string;
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
  decor: Decor;
  /** Around each photo. */
  cellBorder?: { color: string; width: number };
  cellRadius?: number;
  title: { font: FontRole; weight: number; italic?: boolean; upper?: boolean; text: string };
  sub: { font: FontRole };
  /** The filter this theme suggests (filters.ts id); the user can change it. */
  filter?: string;
  /** Swatch for the picker. */
  swatch: string[];
}

export const THEMES: BoothTheme[] = [
  {
    id: "cinema",
    bg: "#15110e",
    ink: "#efe6d6",
    accent: "#b5452f",
    empty: "#2a231d",
    ghost: "#3d332a",
    holes: "rgba(239,230,214,0.85)",
    decor: "none",
    title: { font: "serif", weight: 700, text: "Photobooth" },
    sub: { font: "mono" },
    swatch: ["#15110e", "#efe6d6", "#b5452f"],
  },
  {
    id: "classic",
    bg: "#ffffff",
    ink: "#1b1b1b",
    accent: "#1b1b1b",
    empty: "#ece9e3",
    ghost: "#d6d2c9",
    decor: "none",
    title: { font: "body", weight: 700, text: "photobooth" },
    sub: { font: "body" },
    swatch: ["#ffffff", "#1b1b1b", "#d6d2c9"],
  },
  {
    id: "mono",
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
    swatch: ["#0c0c0c", "#f1f1f1", "#777"],
  },
  {
    id: "candy",
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
    swatch: ["#ffd3e2", "#e0457b", "#9be3d6", "#ffe28a"],
  },
  {
    id: "alice",
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
    swatch: ["#f3e7c9", "#3b2a1e", "#b2302b"],
  },
  {
    id: "y2k",
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
    swatch: ["#d9c7ff", "#b9e6ff", "#ff4fd8", "#2b1d6b"],
  },
];

export function themeById(id: string | undefined): BoothTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

/** Filters offered in the booth (a short, booth-friendly pick of filters.ts). */
export const BOOTH_FILTERS = ["honey400", "cotton", "blossom", "peach", "snapshot", "flash", "kyoto", "tokyo90", "aeropink", "noir", "sepia"];
