import type { FilterPreset } from "./params";

// Named filters, grouped by style (docs/user/filters.md, D-19, D-21).
// Names stay in English in every language. First 5 for testing (D-15), the rest of the
// agreed list + nature / food groups in M11 (S10). Adding a filter = adding an entry here.

export type FilterGroup = "mono" | "vintage" | "modern" | "future" | "nature" | "food";

export const FILTER_GROUPS: FilterGroup[] = ["mono", "vintage", "modern", "nature", "food", "future"];

export interface FilterDef {
  id: string;
  name: string;
  group: FilterGroup;
  preset: FilterPreset;
}

export const FILTERS: FilterDef[] = [
  {
    id: "classic",
    name: "Classic",
    group: "mono",
    preset: { adjust: { contrast: 24, highlights: -14, shadows: -4, fade: 6 }, mono: 1, monoTint: [1, 1, 1] },
  },
  {
    id: "kyoto",
    name: "Kyoto",
    group: "vintage",
    // Japanese film feel: soft greens, warm skin, cool lifted shadows.
    preset: {
      adjust: { contrast: -4, highlights: -16, saturation: -14, temperature: 4, fade: 24 },
      split: { shadows: [0.42, 0.56, 0.6], highlights: [0.6, 0.54, 0.46], strength: 0.4 },
    },
  },
  {
    id: "retro70",
    name: "Retro 70",
    group: "vintage",
    preset: {
      adjust: { contrast: 6, saturation: -6, temperature: 32, fade: 28, grain: 24 },
      split: { shadows: [0.56, 0.46, 0.4], highlights: [0.62, 0.55, 0.4], strength: 0.32 },
    },
  },
  {
    id: "clean",
    name: "Clean",
    group: "modern",
    preset: { adjust: { exposure: 8, brightness: 4, contrast: 6, highlights: -10, shadows: 12, vibrance: 22, saturation: 4 } },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    group: "future",
    preset: {
      adjust: { exposure: -12, contrast: 32, saturation: 22, temperature: -16, tint: -14, highlights: -22, shadows: -12 },
      split: { shadows: [0.3, 0.58, 0.74], highlights: [0.74, 0.36, 0.7], strength: 0.56 },
    },
  },
  // ── M11: the rest of the agreed list (docs/user/filters.md) ──────────────
  { id: "noir", name: "Noir", group: "mono", preset: { adjust: { contrast: 48, highlights: 6, shadows: -26, exposure: -4, grain: 10 }, mono: 1, monoTint: [1, 1, 1] } },
  { id: "mist", name: "Mist", group: "mono", preset: { adjust: { contrast: -26, exposure: 6, fade: 30, highlights: -10 }, mono: 1, monoTint: [1, 1, 1] } },
  { id: "sepia", name: "Sepia", group: "mono", preset: { adjust: { contrast: 8, fade: 14, grain: 8 }, mono: 1, monoTint: [1, 0.87, 0.68] } },
  { id: "cyan", name: "Cyan", group: "mono", preset: { adjust: { contrast: 14, fade: 8 }, mono: 1, monoTint: [0.68, 0.85, 1] } },
  {
    id: "tokyo90",
    name: "Tokyo 90",
    group: "vintage",
    preset: {
      adjust: { contrast: -8, saturation: -18, highlights: -20, tint: 6, fade: 32, grain: 18 },
      split: { shadows: [0.46, 0.5, 0.58], highlights: [0.58, 0.54, 0.5], strength: 0.3 },
    },
  },
  {
    id: "instant",
    name: "Instant",
    group: "vintage",
    preset: {
      adjust: { exposure: 6, contrast: -10, saturation: -10, temperature: 10, fade: 26, vignette: 26 },
      split: { shadows: [0.4, 0.54, 0.58], highlights: [0.62, 0.56, 0.46], strength: 0.36 },
    },
  },
  { id: "faded", name: "Faded", group: "vintage", preset: { adjust: { contrast: -14, saturation: -26, fade: 40, highlights: -8 } } },
  { id: "editorial", name: "Editorial", group: "modern", preset: { adjust: { contrast: 14, saturation: -16, highlights: -12, shadows: 6, temperature: -4 } } },
  {
    id: "moody",
    name: "Moody",
    group: "modern",
    preset: {
      adjust: { exposure: -14, contrast: 18, saturation: -28, highlights: -24, shadows: -10, vignette: 30 },
      split: { shadows: [0.44, 0.48, 0.54], highlights: [0.54, 0.52, 0.48], strength: 0.24 },
    },
  },
  {
    id: "tealorange",
    name: "Teal & Orange",
    group: "modern",
    preset: {
      adjust: { contrast: 16, saturation: 10, highlights: -10 },
      split: { shadows: [0.3, 0.56, 0.6], highlights: [0.72, 0.52, 0.34], strength: 0.5 },
    },
  },
  { id: "softskin", name: "Soft Skin", group: "modern", preset: { adjust: { exposure: 6, contrast: -12, highlights: -14, shadows: 10, temperature: 10, tint: 4, saturation: -6, fade: 8 } } },
  {
    id: "neon",
    name: "Neon",
    group: "future",
    preset: { adjust: { contrast: 26, saturation: 46, vibrance: 30, highlights: -16 }, split: { shadows: [0.46, 0.36, 0.7], highlights: [0.6, 0.5, 0.62], strength: 0.3 } },
  },
  {
    id: "vaporwave",
    name: "Vaporwave",
    group: "future",
    preset: {
      adjust: { contrast: -6, saturation: -4, fade: 18, highlights: -10 },
      split: { shadows: [0.5, 0.42, 0.7], highlights: [0.74, 0.5, 0.62], strength: 0.5 },
    },
  },
  {
    id: "synthwave",
    name: "Synthwave",
    group: "future",
    preset: {
      adjust: { contrast: 22, saturation: 18, exposure: -6 },
      split: { shadows: [0.5, 0.3, 0.68], highlights: [0.78, 0.48, 0.32], strength: 0.56 },
    },
  },
  {
    id: "matrix",
    name: "Matrix",
    group: "future",
    preset: { adjust: { exposure: -10, contrast: 24, saturation: -30 }, split: { shadows: [0.38, 0.56, 0.42], highlights: [0.5, 0.62, 0.46], strength: 0.5 } },
  },
  // Nature
  { id: "forest", name: "Forest", group: "nature", preset: { adjust: { contrast: 10, vibrance: 26, temperature: -6, tint: -10, shadows: 8, highlights: -12 } } },
  { id: "golden", name: "Golden", group: "nature", preset: { adjust: { exposure: 4, temperature: 30, tint: 6, vibrance: 16, highlights: -18, vignette: 14 } } },
  {
    id: "skyline",
    name: "Skyline",
    group: "nature",
    preset: { adjust: { contrast: 14, highlights: -30, shadows: 14, vibrance: 22, temperature: -12 }, split: { shadows: [0.46, 0.5, 0.56], highlights: [0.5, 0.52, 0.56], strength: 0.2 } },
  },
  // Food
  { id: "warmplate", name: "Warm Plate", group: "food", preset: { adjust: { exposure: 6, contrast: 12, temperature: 18, vibrance: 28, saturation: 6, shadows: 10 } } },
  { id: "fresh", name: "Fresh", group: "food", preset: { adjust: { exposure: 10, brightness: 6, contrast: 8, vibrance: 34, temperature: -4, highlights: -10 } } },
];

export function filterById(id: string | undefined) {
  return id ? FILTERS.find((f) => f.id === id) : undefined;
}
