import type { FilterPreset } from "./params";

// Named filters, grouped by style (docs/user/filters.md, D-19, D-21).
// Names stay in English in every language. First 5 for testing (D-15);
// adding a filter = adding an entry here.

export type FilterGroup = "mono" | "vintage" | "modern" | "future";

export const FILTER_GROUPS: FilterGroup[] = ["mono", "vintage", "modern", "future"];

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
];

export function filterById(id: string | undefined) {
  return id ? FILTERS.find((f) => f.id === id) : undefined;
}
