import type { Recipe } from "./lut";
import type { FilterPreset } from "./params";

// Named filters, grouped by style (docs/user/filters.md, D-19, D-21).
// Names stay in English in every language. First 5 for testing (D-15), the rest of the
// agreed list + nature / food groups in M11 (S10). Adding a filter = adding an entry here.

export type FilterGroup =
  | "film" | "analog" | "mood" | "bright" | "vivid" | "instant" | "cinema" | "urban" | "lights"
  | "mono" | "vintage" | "modern" | "future" | "nature" | "food";

export const FILTER_GROUPS: FilterGroup[] = [
  "film", "analog", "mood", "bright", "vivid", "instant", "cinema", "urban", "lights", "mono", "vintage", "modern", "nature", "food", "future",
];

export interface FilterDef {
  id: string;
  name: string;
  group: FilterGroup;
  preset: FilterPreset;
}

// ── Filter v2, batch 1 (D-132, docs/discussions/2026-10-20-filter-v2.md) ──────────
// Each one is a recipe baked into a 3D table (lut.ts), aimed at a look the references
// share: the film stock or the VSCO family named beside it (never in the name, D-19).

interface Fx {
  grain?: number;
  vignette?: number;
  bloom?: number;
  halation?: number;
}

const RECIPES = new Map<string, Recipe>();

function v2(id: string, name: string, group: FilterGroup, recipe: Recipe, fx: Fx = {}): FilterDef {
  RECIPES.set(id, recipe);
  const adjust: FilterPreset["adjust"] = {};
  if (fx.grain) adjust.grain = fx.grain;
  if (fx.vignette) adjust.vignette = fx.vignette;
  return { id, name, group, preset: { adjust, lut: id, lutMono: !!recipe.bw, bloom: fx.bloom, halation: fx.halation } };
}

export function recipeFor(id: string) {
  return RECIPES.get(id);
}

const V2: FilterDef[] = [
  // Film — colour negative / slide stocks (VSCO Film X).
  // Warm portrait negative, ISO 400: soft contrast, creamy highlights, muted yellow-greens.
  v2("honey400", "Honey 400", "film", {
    temp: 8, contrast: -10, saturation: -6, vibrance: 8,
    curve: [[0, 14], [60, 62], [128, 134], [200, 206], [255, 248]],
    b: [[0, 10], [255, 242]],
    hsl: { red: [4, -6, 0], orange: [0, -8, 6], yellow: [-6, -14, 0], green: [-14, -28, -6], aqua: [-8, -10, 0], blue: [-6, -12, 0] },
    grade: { shadows: [195, 10], highlights: [38, 10] },
  }, { grain: 12 }),
  // Fine-grain portrait negative, ISO 160: flatter, cooler, pastel.
  v2("velvet160", "Velvet 160", "film", {
    temp: 2, contrast: -18, saturation: -14,
    curve: [[0, 18], [64, 70], [128, 136], [192, 200], [255, 250]],
    hsl: { orange: [0, -10, 8], green: [-6, -30, 8], blue: [-4, -18, 6] },
    grade: { shadows: [190, 8], highlights: [30, 6] },
  }, { grain: 8 }),
  // Consumer gold film, ISO 200: warm yellow cast, saturated reds, sunny.
  v2("gold200", "Gold 200", "film", {
    temp: 16, tint: 2, contrast: 10, saturation: 8, vibrance: 10,
    curve: [[0, 8], [64, 60], [128, 130], [192, 202], [255, 250]],
    r: [[0, 0], [128, 134], [255, 255]],
    b: [[0, 6], [128, 118], [255, 232]],
    hsl: { red: [0, 10, -4], yellow: [-4, 12, 6], green: [-18, -10, 0], blue: [-6, -8, -6] },
    grade: { shadows: [30, 6], highlights: [45, 16] },
  }, { grain: 14 }),
  // Ultra-saturated fine-grain negative, ISO 100: punchy reds, deep blues.
  v2("vivid100", "Vivid 100", "film", {
    temp: 4, contrast: 18, saturation: 20, vibrance: 12,
    curve: [[0, 0], [64, 56], [128, 128], [192, 204], [255, 255]],
    hsl: { red: [0, 14, -4], orange: [2, 6, 0], green: [-4, 8, -6], aqua: [6, 10, -4], blue: [0, 16, -10] },
    grade: { shadows: [220, 6] },
  }, { grain: 4 }),
  // Japanese consumer negative, ISO 400: green-cyan shadows, cool, strong greens.
  v2("verde400", "Verde 400", "film", {
    temp: -6, tint: -6, contrast: 8, saturation: 4,
    curve: [[0, 10], [64, 62], [128, 128], [192, 198], [255, 250]],
    g: [[0, 8], [128, 130], [255, 252]],
    hsl: { orange: [-2, -6, 4], yellow: [10, -10, 0], green: [8, 10, -6], blue: [-10, 6, -4] },
    grade: { shadows: [160, 14], highlights: [330, 6] },
  }, { grain: 14 }),
  // Pastel pro negative, ISO 400, overexposed: minty greens, airy, cool highlights.
  v2("mint400", "Mint 400", "film", {
    exposure: 0.15, contrast: -16, saturation: -12,
    curve: [[0, 22], [64, 78], [128, 144], [192, 208], [255, 250]],
    hsl: { orange: [0, -12, 10], yellow: [-10, -20, 8], green: [16, -22, 10], aqua: [-6, -10, 6], blue: [-12, -14, 8] },
    grade: { shadows: [185, 10], midtones: [20, 4], highlights: [175, 6] },
  }, { grain: 8 }),
  // Slide film, ISO 100: crushed blacks, very rich greens and blues.
  v2("slide100", "Slide 100", "film", {
    tint: 4, contrast: 24, saturation: 26, vibrance: 10,
    curve: [[0, 0], [48, 36], [128, 128], [208, 220], [255, 255]],
    hsl: { red: [0, 12, -4], green: [-4, 14, -8], blue: [4, 14, -12], magenta: [0, 10, 0] },
    grade: { shadows: [250, 6] },
  }, { grain: 3 }),
  // Tungsten cinema film shot at night, ISO 800: cool teal, red halation around lights.
  v2("tungsten800", "Tungsten 800", "film", {
    temp: -26, tint: 4, contrast: 10, saturation: -4,
    curve: [[0, 10], [64, 58], [128, 128], [200, 210], [255, 252]],
    hsl: { red: [0, 8, 0], orange: [6, -8, 6], aqua: [-6, 6, 0], blue: [-12, 4, -6] },
    grade: { shadows: [195, 18], highlights: [20, 8] },
  }, { grain: 18, halation: 0.55, bloom: 0.15 }),
  // Expired film: magenta-warm shift, faded, low contrast.
  v2("expired", "Expired", "film", {
    temp: 10, tint: 10, contrast: -14, saturation: -18, fade: 30,
    curve: [[0, 24], [64, 70], [128, 132], [192, 192], [255, 236]],
    g: [[0, 0], [128, 120], [255, 240]],
    hsl: { green: [-20, -30, 0], blue: [20, -20, 0] },
    grade: { shadows: [300, 10], highlights: [40, 16] },
  }, { grain: 26, vignette: 22 }),
  // Daylight cinema negative, ISO 50: neutral, long highlight roll-off, gentle teal and orange.
  v2("cine50", "Cine 50", "film", {
    contrast: -4, saturation: -6,
    curve: [[0, 8], [48, 44], [128, 128], [210, 214], [255, 246]],
    hsl: { orange: [2, 4, 4], aqua: [8, 6, -4], blue: [-10, -6, -4] },
    grade: { shadows: [190, 12], highlights: [32, 10] },
  }, { grain: 6 }),
  // European consumer negative, ISO 200: cool, punchy reds.
  v2("street200", "Street 200", "film", {
    temp: -6, contrast: 14, saturation: 6,
    curve: [[0, 4], [64, 58], [128, 128], [192, 204], [255, 252]],
    hsl: { red: [-4, 18, -4], orange: [-2, 4, 0], green: [6, -14, 0], blue: [6, 4, -6] },
    grade: { shadows: [210, 10], highlights: [200, 4] },
  }, { grain: 12 }),

  // Analog — pastel, lifted mid-tones, slight overexposure / natural, faded (VSCO A).
  v2("linen", "Linen", "analog", {
    exposure: 0.12, contrast: -12, saturation: -16,
    curve: [[0, 16], [64, 82], [128, 150], [192, 212], [255, 250]],
    hsl: { orange: [0, -6, 8], yellow: [-4, -20, 6], green: [-10, -36, 6], blue: [-6, -22, 8] },
    grade: { shadows: [200, 6], highlights: [40, 6] },
  }, { grain: 6 }),
  v2("cotton", "Cotton", "analog", {
    temp: -3, contrast: -6, saturation: -12,
    curve: [[0, 12], [64, 66], [128, 132], [192, 198], [255, 248]],
    hsl: { orange: [-2, -4, 6], yellow: [-4, -16, 0], green: [6, -26, 0] },
    grade: { shadows: [205, 8], midtones: [30, 3] },
  }, { grain: 6 }),
  v2("peach", "Peach", "analog", {
    temp: 10, tint: 6, contrast: -8, saturation: -4,
    curve: [[0, 14], [64, 70], [128, 140], [192, 206], [255, 250]],
    hsl: { red: [6, -6, 4], orange: [-2, 0, 8], green: [-14, -20, 0] },
    grade: { shadows: [180, 8], highlights: [20, 12] },
  }, { grain: 6 }),
  v2("sage", "Sage", "analog", {
    temp: 4, contrast: -4, saturation: -20,
    curve: [[0, 14], [64, 64], [128, 130], [192, 196], [255, 244]],
    hsl: { orange: [0, -4, 4], yellow: [-10, -30, -4], green: [-24, -36, -8], aqua: [-20, -24, 0], blue: [-10, -30, 0] },
    grade: { shadows: [90, 8], highlights: [50, 8] },
  }, { grain: 10 }),
  v2("dune", "Dune", "analog", {
    temp: 18, tint: 2, contrast: -8, saturation: -22, fade: 20,
    curve: [[0, 10], [64, 66], [128, 134], [192, 200], [255, 244]],
    hsl: { green: [-25, -30, 0], aqua: [8, -24, 0], blue: [6, -34, 0] },
    grade: { shadows: [25, 10], highlights: [40, 14] },
  }, { grain: 12 }),
  v2("haze", "Haze", "analog", {
    exposure: 0.25, contrast: -24, saturation: -14,
    curve: [[0, 30], [64, 92], [128, 158], [192, 216], [255, 250]],
    grade: { shadows: [210, 6], highlights: [45, 6] },
  }, { bloom: 0.25 }),

  // Mood — muted, understated / moody subtle and faded (VSCO F, M, T).
  // Blue fade of underexposed film: blacks lift to blue-grey, highlights dimmed.
  v2("tide", "Tide", "mood", {
    temp: -10, contrast: -8, saturation: -24,
    curve: [[0, 28], [64, 66], [128, 124], [192, 186], [255, 230]],
    b: [[0, 34], [128, 130], [255, 240]],
    grade: { shadows: [210, 8] },
  }, { grain: 8 }),
  v2("mellow", "Mellow", "mood", {
    contrast: -6, saturation: -26, vibrance: 6,
    curve: [[0, 14], [64, 64], [128, 130], [192, 196], [255, 246]],
    hsl: { red: [0, 4, 0], orange: [0, 10, 6] },
    grade: { highlights: [35, 5] },
  }, { grain: 6 }),
  v2("quiet", "Quiet", "mood", {
    temp: 6, contrast: -14, saturation: -30,
    curve: [[0, 20], [64, 70], [128, 132], [192, 194], [255, 240]],
    hsl: { orange: [0, 8, 4] },
    grade: { shadows: [30, 6], highlights: [45, 6] },
  }, { grain: 8 }),
  // Lighter and warmer, a rust cast over everything, faded highlights.
  v2("rust", "Rust", "mood", {
    exposure: 0.12, temp: 14, tint: 4, contrast: -10, saturation: -16,
    curve: [[0, 12], [64, 72], [128, 142], [192, 200], [255, 232]],
    hsl: { red: [6, -10, 0], orange: [-4, -4, 4], green: [-24, -30, 0], blue: [-10, -30, 0] },
    grade: { midtones: [25, 10], highlights: [30, 8] },
  }, { grain: 10 }),
  v2("dusk", "Dusk", "mood", {
    exposure: -0.1, temp: -8, contrast: 6, saturation: -22,
    curve: [[0, 10], [64, 54], [128, 120], [192, 186], [255, 238]],
    grade: { shadows: [215, 12], highlights: [40, 4] },
  }, { grain: 8, vignette: 18 }),
  v2("ember", "Ember", "mood", {
    exposure: -0.08, temp: 12, contrast: 8, saturation: -14,
    curve: [[0, 8], [64, 56], [128, 124], [192, 194], [255, 240]],
    hsl: { orange: [0, 4, 0], green: [-20, -30, -10], blue: [0, -30, -10] },
    grade: { shadows: [20, 12], highlights: [38, 10] },
  }, { grain: 8, vignette: 16 }),
  v2("smoke", "Smoke", "mood", {
    contrast: -16, saturation: -36,
    curve: [[0, 36], [64, 74], [128, 128], [192, 184], [255, 226]],
    grade: { shadows: [200, 8], highlights: [190, 4] },
  }, { grain: 10 }),
  v2("ash", "Ash", "mood", {
    temp: -4, tint: -6, contrast: -10, saturation: -30,
    curve: [[0, 30], [64, 64], [128, 124], [192, 190], [255, 232]],
    grade: { shadows: [150, 10], highlights: [40, 6] },
  }, { grain: 12 }),

  // Bright & portrait — clean light backgrounds, flattering skin (VSCO S, G, C1).
  v2("milk", "Milk", "bright", {
    exposure: 0.2, contrast: -6, saturation: -6,
    curve: [[0, 10], [64, 78], [128, 150], [192, 214], [255, 252]],
    hsl: { red: [2, -4, 6], orange: [0, -6, 10] },
    grade: { highlights: [30, 4] },
  }),
  v2("blossom", "Blossom", "bright", {
    exposure: 0.16, tint: 8, contrast: -8,
    curve: [[0, 12], [64, 76], [128, 146], [192, 212], [255, 252]],
    hsl: { red: [-4, 0, 6], orange: [-4, -4, 10], green: [10, -20, 6], magenta: [0, 10, 6] },
    grade: { shadows: [260, 4], highlights: [340, 8] },
  }),
  v2("air", "Air", "bright", {
    exposure: 0.18, temp: -10, contrast: -6, saturation: -8,
    curve: [[0, 12], [64, 78], [128, 148], [192, 212], [255, 252]],
    hsl: { orange: [0, -4, 8], blue: [-6, -6, 8] },
    grade: { shadows: [205, 8] },
  }),
  v2("glow", "Glow", "bright", {
    temp: 8, tint: 3, contrast: -4, saturation: -4,
    curve: [[0, 8], [64, 66], [128, 136], [192, 204], [255, 250]],
    hsl: { red: [4, -6, 6], orange: [-2, 6, 10], yellow: [-6, -12, 4], green: [-10, -20, 0] },
    grade: { highlights: [35, 8] },
  }, { bloom: 0.2 }),
  v2("rosy", "Rosy", "bright", {
    tint: 10, contrast: -2,
    curve: [[0, 6], [64, 64], [128, 134], [192, 202], [255, 252]],
    hsl: { red: [0, 4, 4], orange: [-8, -2, 8], yellow: [-10, -14, 0] },
    grade: { midtones: [350, 4], highlights: [345, 8] },
  }),
  v2("bare", "Bare", "bright", {
    contrast: -8, saturation: -4,
    curve: [[0, 6], [64, 64], [128, 132], [192, 198], [255, 250]],
    hsl: { red: [0, -6, 4], orange: [0, -8, 6] },
  }),
  // Overexposed film: pink highlights, blue-green shadows, medium-strong contrast.
  v2("candy", "Candy", "bright", {
    exposure: 0.15, contrast: 10, saturation: 8,
    curve: [[0, 6], [64, 66], [128, 142], [192, 214], [255, 255]],
    hsl: { orange: [-4, -6, 8], green: [16, -8, 0] },
    grade: { shadows: [175, 16], highlights: [340, 14] },
  }),

  // Black & white — channel mixes play the coloured lens filters of B&W film (VSCO B, X).
  v2("silver", "Silver", "mono", {
    bw: [0.3, 0.59, 0.11], contrast: 10,
    curve: [[0, 6], [64, 58], [128, 128], [192, 200], [255, 250]],
  }, { grain: 8 }),
  // Push-processed ISO 1600: hard contrast, heavy grain.
  v2("grit1600", "Grit 1600", "mono", {
    bw: [0.35, 0.55, 0.1], contrast: 34,
    curve: [[0, 0], [48, 26], [128, 126], [200, 224], [255, 255]],
  }, { grain: 36, vignette: 20 }),
  // Classic reportage ISO 400: punchy, rich mid-tones, visible grain.
  v2("press400", "Press 400", "mono", {
    bw: [0.32, 0.58, 0.1], contrast: 20,
    curve: [[0, 4], [64, 52], [128, 130], [192, 210], [255, 252]],
  }, { grain: 22 }),
  v2("softgray", "Soft Gray", "mono", {
    bw: true, contrast: -18,
    curve: [[0, 34], [64, 80], [128, 134], [192, 188], [255, 236]],
  }, { grain: 10 }),
  // Red lens filter: skies go dark, skin goes light.
  v2("redfilter", "Red Filter", "mono", {
    bw: [0.9, 0.25, -0.15], contrast: 16,
    curve: [[0, 0], [64, 54], [128, 128], [192, 206], [255, 255]],
  }, { grain: 14 }),
  // Green lens filter: foliage light, skin deeper.
  v2("greenfilter", "Green Filter", "mono", { bw: [0.15, 0.95, -0.1], contrast: 10 }, { grain: 10 }),
  // Selenium-toned print: cool purple-black shadows.
  v2("selenium", "Selenium", "mono", {
    bw: [0.3, 0.6, 0.1], contrast: 14,
    curve: [[0, 0], [64, 54], [128, 128], [192, 204], [255, 252]],
    grade: { shadows: [255, 12], midtones: [240, 4] },
  }, { grain: 8 }),
  // Platinum print: warm, soft, high-key.
  v2("platinum", "Platinum", "mono", {
    bw: true, exposure: 0.1, contrast: -8,
    curve: [[0, 18], [64, 78], [128, 144], [192, 206], [255, 246]],
    grade: { shadows: [30, 14], midtones: [38, 12], highlights: [45, 8] },
  }, { grain: 6 }),
  // Infrared B&W: foliage glows white, the sky turns black.
  v2("infrared", "Infrared", "mono", {
    bw: [0.5, 1.4, -0.9], contrast: 22,
    curve: [[0, 0], [64, 50], [128, 130], [192, 212], [255, 255]],
  }, { grain: 16, bloom: 0.35 }),

  // ── Batch 2 (D-132): the remaining VSCO families ──
  // Colour infrared film: foliage turns red / pink or gold, skies deepen.
  v2("aeropink", "Aero Pink", "film", {
    contrast: 14, saturation: -4,
    curve: [[0, 0], [64, 56], [128, 130], [192, 206], [255, 255]],
    hsl: { yellow: [-80, -16, 10], green: [-135, -22, 12], aqua: [-20, 0, -4], blue: [-6, 16, -14] },
    grade: { shadows: [230, 8] },
  }, { grain: 12 }),
  v2("aerogold", "Aero Gold", "film", {
    contrast: 14, saturation: 10, temp: 6,
    hsl: { yellow: [-24, 20, 6], green: [-80, 26, 8], blue: [4, 14, -12] },
    grade: { highlights: [45, 8] },
  }, { grain: 12 }),

  // Vivid — chromatic, punchy colour (VSCO C, KK).
  v2("pop", "Pop", "vivid", {
    exposure: 0.08, contrast: 14, saturation: 22, vibrance: 16,
    curve: [[0, 4], [64, 60], [128, 132], [192, 206], [255, 255]],
    hsl: { orange: [0, -4, 6], blue: [-4, 10, -6] },
  }),
  v2("cherry", "Cherry", "vivid", {
    contrast: 12, saturation: 12, tint: 4,
    curve: [[0, 6], [64, 60], [128, 130], [192, 204], [255, 252]],
    hsl: { red: [-4, 26, -6], magenta: [-6, 18, 0], orange: [-4, 0, 6], green: [10, -14, 0] },
    grade: { highlights: [345, 8] },
  }),
  v2("citrus", "Citrus", "vivid", {
    temp: 12, contrast: 10, saturation: 16,
    hsl: { orange: [4, 12, 6], yellow: [-4, 26, 8], green: [-14, 10, 0], blue: [-4, -10, 0] },
    grade: { highlights: [55, 12] },
  }),
  v2("lagoon", "Lagoon", "vivid", {
    temp: -6, contrast: 12, saturation: 14,
    hsl: { aqua: [-6, 28, 0], blue: [-10, 22, -6], green: [16, 10, 0], orange: [0, -6, 6] },
    grade: { shadows: [190, 12] },
  }),
  v2("sunny", "Sunny", "vivid", {
    exposure: 0.06, temp: 18, contrast: 8, saturation: 12, vibrance: 14,
    curve: [[0, 8], [64, 66], [128, 136], [192, 206], [255, 252]],
    hsl: { orange: [-2, 6, 8], green: [-12, 0, 0] },
    grade: { highlights: [40, 14] },
  }),
  v2("tropic", "Tropic", "vivid", {
    temp: 6, contrast: 16, saturation: 18,
    hsl: { green: [8, 22, -4], aqua: [-10, 24, 0], yellow: [-8, 14, 0], orange: [0, 4, 4] },
    grade: { shadows: [170, 10], highlights: [45, 10] },
  }),

  // Instant — peel-apart and integral instant film (VSCO P).
  v2("snapshot", "Snapshot", "instant", {
    exposure: 0.08, contrast: -16, saturation: -14, temp: 6,
    curve: [[0, 26], [64, 76], [128, 140], [192, 200], [255, 238]],
    hsl: { green: [10, -20, 4], blue: [-14, -18, 6] },
    grade: { shadows: [185, 16], highlights: [45, 14] },
  }, { grain: 10, vignette: 18 }),
  v2("seventies", "Seventies", "instant", {
    temp: 22, tint: 6, contrast: -12, saturation: -26,
    curve: [[0, 30], [64, 76], [128, 134], [192, 188], [255, 226]],
    hsl: { green: [-20, -30, 0], aqua: [10, -30, 0], blue: [8, -44, 0] },
    grade: { shadows: [25, 14], midtones: [30, 10], highlights: [42, 12] },
  }, { grain: 14, vignette: 24 }),
  v2("coolshot", "Cool Shot", "instant", {
    temp: -18, contrast: -10, saturation: -18,
    curve: [[0, 28], [64, 74], [128, 132], [192, 194], [255, 236]],
    b: [[0, 20], [255, 250]],
    grade: { shadows: [200, 14], highlights: [180, 8] },
  }, { grain: 12, vignette: 18 }),
  v2("pale", "Pale", "instant", {
    exposure: 0.3, contrast: -26, saturation: -22,
    curve: [[0, 40], [64, 104], [128, 166], [192, 216], [255, 244]],
    grade: { shadows: [190, 8], highlights: [40, 8] },
  }, { grain: 8, bloom: 0.2 }),
  v2("peel", "Peel", "instant", {
    tint: -10, contrast: -8, saturation: -10,
    curve: [[0, 22], [64, 70], [128, 132], [192, 198], [255, 240]],
    hsl: { orange: [-6, -4, 6], red: [-8, 6, 0] },
    grade: { shadows: [140, 14], highlights: [330, 12] },
  }, { grain: 12, vignette: 14 }),

  // Cinema — colour grading looks (VSCO CG).
  v2("blockbuster", "Blockbuster", "cinema", {
    contrast: 18, saturation: 4,
    curve: [[0, 4], [64, 54], [128, 128], [192, 206], [255, 250]],
    hsl: { orange: [4, 14, 4], aqua: [-4, 12, -4], blue: [-20, 8, -8], green: [30, -20, -6] },
    grade: { shadows: [190, 24], highlights: [32, 16] },
  }, { grain: 6 }),
  v2("thriller", "Thriller", "cinema", {
    exposure: -0.12, temp: -4, tint: -10, contrast: 14, saturation: -34,
    curve: [[0, 10], [64, 50], [128, 120], [192, 192], [255, 236]],
    grade: { shadows: [160, 14], midtones: [90, 6], highlights: [60, 6] },
  }, { grain: 10, vignette: 26 }),
  v2("bleach", "Bleach", "cinema", {
    contrast: 30, saturation: -46,
    curve: [[0, 0], [48, 30], [128, 130], [200, 222], [255, 255]],
    grade: { shadows: [200, 6] },
  }, { grain: 14 }),
  v2("technic", "Golden Age", "cinema", {
    temp: 8, contrast: 14, saturation: 18,
    curve: [[0, 10], [64, 60], [128, 130], [192, 202], [255, 246]],
    hsl: { red: [2, 20, -6], orange: [2, 4, 4], blue: [6, 10, -10], green: [-6, 4, -6] },
    grade: { shadows: [210, 8], highlights: [45, 10] },
  }, { grain: 8, bloom: 0.12 }),
  v2("reverie", "Reverie", "cinema", {
    exposure: 0.1, tint: 10, contrast: -12, saturation: -6,
    curve: [[0, 22], [64, 76], [128, 138], [192, 204], [255, 246]],
    grade: { shadows: [270, 14], highlights: [330, 12] },
  }, { bloom: 0.3 }),
  v2("arctic", "Arctic", "cinema", {
    temp: -30, contrast: 10, saturation: -20,
    curve: [[0, 8], [64, 58], [128, 128], [192, 200], [255, 248]],
    hsl: { orange: [0, 10, 4] },
    grade: { shadows: [215, 16], highlights: [195, 8] },
  }, { grain: 6 }),

  // Urban — cool streets and minimal clean frames (VSCO HB, J).
  v2("concrete", "Concrete", "urban", {
    temp: -8, contrast: 16, saturation: -26,
    curve: [[0, 8], [64, 54], [128, 126], [192, 202], [255, 248]],
    hsl: { orange: [0, 10, 0], red: [0, 10, 0] },
    grade: { shadows: [210, 10] },
  }, { grain: 10 }),
  v2("steel", "Steel", "urban", {
    temp: -16, contrast: 10, saturation: -34,
    curve: [[0, 14], [64, 62], [128, 128], [192, 196], [255, 244]],
    grade: { shadows: [215, 14], highlights: [205, 6] },
  }, { grain: 8 }),
  v2("streetcool", "Street Cool", "urban", {
    temp: -10, contrast: 20, saturation: -8,
    curve: [[0, 0], [64, 52], [128, 128], [192, 206], [255, 255]],
    hsl: { red: [0, 14, 0], yellow: [-10, -20, 0], green: [20, -30, -6], blue: [-6, 8, -10] },
    grade: { shadows: [200, 12], highlights: [40, 4] },
  }, { grain: 10 }),
  v2("gallery", "Gallery", "urban", {
    exposure: 0.12, contrast: -4, saturation: -24,
    curve: [[0, 12], [64, 72], [128, 142], [192, 210], [255, 254]],
    grade: { highlights: [50, 3] },
  }),
  v2("shade", "Shade", "urban", {
    contrast: -10, saturation: -30,
    curve: [[0, 20], [64, 66], [128, 128], [192, 192], [255, 240]],
    grade: { shadows: [210, 6], highlights: [40, 4] },
  }),

  // Lights — indoor and night light: neutralise or play up lamps, tubes, neon (VSCO AL).
  v2("lamp", "Lamp", "lights", {
    temp: -26, contrast: 6, saturation: -6,
    hsl: { orange: [4, -10, 6], yellow: [-6, -20, 0] },
    grade: { highlights: [40, 4] },
  }),
  v2("fluoro", "Fluoro", "lights", {
    tint: 22, temp: 4, contrast: 6,
    hsl: { green: [10, -20, 0], yellow: [-6, -10, 0], orange: [0, 0, 6] },
  }),
  v2("neonnight", "Neon Night", "lights", {
    exposure: -0.1, contrast: 22, saturation: 20, vibrance: 14,
    curve: [[0, 0], [64, 44], [128, 124], [192, 206], [255, 255]],
    hsl: { magenta: [0, 20, 6], purple: [0, 20, 6], aqua: [0, 20, 4], blue: [0, 14, 0] },
    grade: { shadows: [240, 12] },
  }, { grain: 10, bloom: 0.3 }),
  v2("candle", "Candle", "lights", {
    temp: 20, contrast: 4, saturation: -6,
    curve: [[0, 12], [64, 62], [128, 130], [192, 200], [255, 244]],
    hsl: { orange: [-2, 4, 6], blue: [0, -30, 0] },
    grade: { shadows: [30, 12], highlights: [40, 10] },
  }, { grain: 12, vignette: 22, bloom: 0.2 }),

  // Retro camera looks (also used by the cameras in filmfx.ts).
  // Disposable camera with flash: hard contrast, warm, bright faces, dark falloff.
  v2("flash", "Flash", "vintage", {
    exposure: 0.1, temp: 8, contrast: 22, saturation: 6,
    curve: [[0, 10], [64, 54], [128, 132], [200, 222], [255, 255]],
    hsl: { orange: [-2, 4, 8], green: [-10, -14, 0], blue: [-6, -6, -6] },
    grade: { shadows: [210, 8], highlights: [40, 8] },
  }, { grain: 18, vignette: 34, bloom: 0.15 }),
  // Early-2000s CCD compact: cool, crisp, saturated blues, hard clipped highlights.
  v2("ccd03", "CCD 03", "vintage", {
    temp: -12, tint: -3, contrast: 16, saturation: 12,
    curve: [[0, 6], [64, 58], [128, 132], [192, 214], [235, 255], [255, 255]],
    hsl: { orange: [-4, -6, 6], green: [10, 6, 0], aqua: [0, 14, 0], blue: [-6, 18, -4] },
    grade: { shadows: [200, 10], highlights: [190, 4] },
  }, { grain: 6 }),
  // Cross-processed slide film: yellow-green highlights, blue shadows, punchy.
  v2("cross", "Cross", "vintage", {
    contrast: 24, saturation: 22,
    curve: [[0, 0], [64, 50], [128, 130], [192, 214], [255, 255]],
    r: [[0, 0], [128, 126], [255, 255]],
    b: [[0, 22], [128, 120], [255, 210]],
    grade: { shadows: [210, 8], highlights: [70, 16] },
  }, { grain: 12, vignette: 45 }),
];

// ── The first 25 (M4 / M11), rebuilt as recipes (owner 2026-10-20: "basic, not pretty").
// Same ids, names and groups, so projects that use them get the new look.
const V1: FilterDef[] = [
  // Mono
  v2("classic", "Classic", "mono", { bw: [0.3, 0.59, 0.11], contrast: 14, curve: [[0, 6], [64, 56], [128, 128], [192, 204], [255, 250]] }, { grain: 6 }),
  v2("noir", "Noir", "mono", { bw: [0.4, 0.5, 0.1], contrast: 40, curve: [[0, 0], [56, 24], [128, 120], [200, 226], [255, 255]] }, { grain: 12, vignette: 30 }),
  v2("mist", "Mist", "mono", { bw: true, exposure: 0.1, contrast: -26, curve: [[0, 46], [64, 92], [128, 144], [192, 196], [255, 238]] }, { grain: 6, bloom: 0.15 }),
  v2("sepia", "Sepia", "mono", {
    bw: [0.3, 0.6, 0.1], contrast: 6,
    curve: [[0, 14], [64, 64], [128, 132], [192, 200], [255, 244]],
    grade: { shadows: [25, 22], midtones: [35, 22], highlights: [45, 14] },
  }, { grain: 10, vignette: 16 }),
  // Cyanotype print.
  v2("cyan", "Cyan", "mono", { bw: [0.25, 0.6, 0.15], contrast: 12, grade: { shadows: [210, 30], midtones: [205, 26], highlights: [195, 12] } }, { grain: 6 }),
  // Vintage
  v2("kyoto", "Kyoto", "vintage", {
    temp: 4, contrast: -6, saturation: -10,
    curve: [[0, 18], [64, 70], [128, 134], [192, 198], [255, 246]],
    hsl: { orange: [0, -6, 8], yellow: [-6, -18, 0], green: [12, -14, 6], blue: [-8, -10, 4] },
    grade: { shadows: [185, 12], highlights: [40, 8] },
  }, { grain: 10 }),
  v2("retro70", "Retro 70", "vintage", {
    temp: 20, tint: 4, contrast: 6, saturation: -6, fade: 18,
    curve: [[0, 16], [64, 66], [128, 134], [192, 198], [255, 236]],
    b: [[0, 10], [255, 226]],
    hsl: { green: [-30, -20, 0], aqua: [10, -30, 0], blue: [8, -36, 0] },
    grade: { shadows: [25, 12], highlights: [42, 16] },
  }, { grain: 20, vignette: 18 }),
  v2("tokyo90", "Tokyo 90", "vintage", {
    tint: 6, contrast: -10, saturation: -20,
    curve: [[0, 24], [64, 70], [128, 130], [192, 190], [255, 236]],
    hsl: { red: [6, -10, 0], green: [16, -20, 4] },
    grade: { shadows: [200, 12], highlights: [330, 6] },
  }, { grain: 16 }),
  v2("instant", "Instant", "vintage", {
    exposure: 0.08, temp: 8, contrast: -12, saturation: -12,
    curve: [[0, 24], [64, 74], [128, 138], [192, 198], [255, 236]],
    grade: { shadows: [180, 16], highlights: [42, 12] },
  }, { grain: 10, vignette: 26 }),
  v2("faded", "Faded", "vintage", { contrast: -14, saturation: -28, curve: [[0, 40], [64, 76], [128, 128], [192, 188], [255, 240]] }, { grain: 6 }),
  // Modern
  v2("clean", "Clean", "modern", {
    exposure: 0.12, temp: -2, contrast: 6, vibrance: 18,
    curve: [[0, 4], [64, 66], [128, 138], [192, 212], [255, 255]],
    hsl: { orange: [0, -4, 8], blue: [-4, 8, 0] },
  }),
  v2("editorial", "Editorial", "modern", {
    contrast: 12, saturation: -18,
    curve: [[0, 8], [64, 58], [128, 128], [192, 202], [255, 250]],
    hsl: { orange: [0, 6, 4] },
    grade: { shadows: [210, 6], highlights: [40, 4] },
  }),
  v2("moody", "Moody", "modern", {
    exposure: -0.15, contrast: 14, saturation: -28,
    curve: [[0, 12], [64, 50], [128, 118], [192, 186], [255, 236]],
    hsl: { orange: [0, 6, 0], green: [-10, -30, -10], blue: [0, -24, -10] },
    grade: { shadows: [205, 10], highlights: [38, 6] },
  }, { grain: 8, vignette: 30 }),
  v2("tealorange", "Teal & Orange", "modern", {
    contrast: 16, saturation: 8,
    hsl: { orange: [4, 14, 4], yellow: [-14, 0, 0], green: [40, -20, -6], aqua: [-6, 14, -4], blue: [-24, 10, -6] },
    grade: { shadows: [188, 28], highlights: [30, 18] },
  }),
  v2("softskin", "Soft Skin", "modern", {
    exposure: 0.1, temp: 8, tint: 4, contrast: -12, saturation: -6,
    curve: [[0, 10], [64, 70], [128, 140], [192, 206], [255, 250]],
    hsl: { red: [4, -8, 8], orange: [-2, -6, 10] },
    grade: { highlights: [30, 6] },
  }, { bloom: 0.2 }),
  // Future
  v2("cyberpunk", "Cyberpunk", "future", {
    exposure: -0.1, temp: -12, tint: 10, contrast: 26, saturation: 20,
    curve: [[0, 0], [64, 46], [128, 124], [192, 206], [255, 255]],
    hsl: { red: [-20, 14, 0], yellow: [-60, 0, -10], green: [60, 10, -10], blue: [10, 20, 0] },
    grade: { shadows: [195, 30], highlights: [310, 24] },
  }, { grain: 8, bloom: 0.25 }),
  v2("neon", "Neon", "future", {
    contrast: 24, saturation: 40, vibrance: 24,
    curve: [[0, 0], [64, 50], [128, 128], [192, 210], [255, 255]],
    grade: { shadows: [270, 12] },
  }, { bloom: 0.3 }),
  v2("vaporwave", "Vaporwave", "future", {
    exposure: 0.08, contrast: -10, saturation: -6,
    curve: [[0, 30], [64, 80], [128, 138], [192, 198], [255, 242]],
    hsl: { yellow: [-50, -20, 0], green: [60, -30, 0], blue: [20, 10, 0] },
    grade: { shadows: [255, 22], midtones: [300, 10], highlights: [330, 16] },
  }, { grain: 6 }),
  v2("synthwave", "Synthwave", "future", {
    contrast: 22, saturation: 16,
    curve: [[0, 0], [64, 50], [128, 128], [192, 206], [255, 255]],
    hsl: { yellow: [-20, 10, 0], green: [-80, 0, -10], blue: [30, 20, 0] },
    grade: { shadows: [275, 28], highlights: [28, 24] },
  }, { bloom: 0.25 }),
  v2("matrix", "Matrix", "future", {
    exposure: -0.1, contrast: 24, saturation: -40,
    curve: [[0, 0], [64, 48], [128, 124], [192, 200], [255, 248]],
    grade: { shadows: [130, 26], midtones: [125, 16], highlights: [100, 10] },
  }, { grain: 10, vignette: 20 }),
  // Nature
  v2("forest", "Forest", "nature", {
    temp: -4, tint: -6, contrast: 10, vibrance: 20,
    curve: [[0, 8], [64, 60], [128, 130], [192, 202], [255, 248]],
    hsl: { yellow: [-12, 8, 0], green: [6, 10, -6], aqua: [0, 10, -4] },
    grade: { shadows: [160, 8] },
  }),
  v2("golden", "Golden", "nature", {
    exposure: 0.05, temp: 24, tint: 4, vibrance: 14,
    curve: [[0, 8], [64, 64], [128, 134], [192, 206], [255, 250]],
    hsl: { orange: [0, 8, 6], green: [-30, -10, 0] },
    grade: { shadows: [30, 8], highlights: [42, 20] },
  }, { bloom: 0.2, vignette: 14 }),
  v2("skyline", "Skyline", "nature", {
    temp: -8, contrast: 14, vibrance: 20,
    curve: [[0, 6], [64, 62], [128, 130], [192, 200], [255, 244]],
    hsl: { orange: [0, 6, 4], aqua: [-4, 16, -8], blue: [-6, 22, -14] },
    grade: { shadows: [215, 8] },
  }),
  // Food
  v2("warmplate", "Warm Plate", "food", {
    exposure: 0.08, temp: 14, contrast: 12, saturation: 8, vibrance: 20,
    hsl: { red: [0, 10, 0], orange: [0, 12, 4], yellow: [-4, 10, 4], green: [-8, 8, 0] },
    grade: { highlights: [40, 8] },
  }),
  v2("fresh", "Fresh", "food", {
    exposure: 0.14, temp: -4, contrast: 8, vibrance: 26,
    curve: [[0, 6], [64, 68], [128, 138], [192, 210], [255, 255]],
    hsl: { red: [0, 10, 0], yellow: [-6, 10, 4], green: [6, 14, 4] },
  }),
];

// ── Batch 3: more of each family (VSCO has 3–10 per family) ──
const V3: FilterDef[] = [
  // Film
  v2("honey800", "Honey 800", "film", {
    temp: 12, contrast: 4, saturation: -2,
    curve: [[0, 16], [60, 58], [128, 132], [200, 210], [255, 246]],
    hsl: { orange: [0, -4, 6], yellow: [-8, -10, 0], green: [-16, -24, -6], blue: [-8, -10, 0] },
    grade: { shadows: [200, 12], highlights: [36, 14] },
  }, { grain: 24 }),
  v2("gold400", "Gold 400", "film", {
    temp: 20, tint: 2, contrast: 14, saturation: 14, vibrance: 8,
    curve: [[0, 6], [64, 58], [128, 130], [192, 204], [255, 250]],
    b: [[0, 4], [128, 116], [255, 228]],
    hsl: { red: [0, 14, -4], yellow: [-4, 16, 6], green: [-20, -6, 0] },
    grade: { highlights: [45, 18] },
  }, { grain: 18 }),
  v2("tungsten500", "Tungsten 500", "film", {
    temp: -16, contrast: 6, saturation: -2,
    curve: [[0, 10], [64, 60], [128, 128], [200, 208], [255, 250]],
    hsl: { orange: [4, -4, 6], blue: [-10, 4, -4] },
    grade: { shadows: [195, 14], highlights: [25, 6] },
  }, { grain: 12, halation: 0.3 }),
  v2("verde800", "Verde 800", "film", {
    exposure: -0.06, temp: -8, tint: -8, contrast: 12,
    curve: [[0, 12], [64, 58], [128, 124], [192, 194], [255, 246]],
    g: [[0, 12], [128, 130], [255, 250]],
    hsl: { yellow: [10, -14, 0], green: [10, 6, -8], blue: [-10, 0, -6] },
    grade: { shadows: [155, 18], highlights: [40, 4] },
  }, { grain: 22 }),
  v2("velvet400", "Velvet 400", "film", {
    exposure: 0.06, temp: 4, contrast: -12, saturation: -10,
    curve: [[0, 16], [64, 72], [128, 138], [192, 202], [255, 248]],
    hsl: { orange: [0, -8, 8], green: [-2, -26, 6], blue: [-6, -16, 6] },
    grade: { shadows: [195, 8], highlights: [35, 8] },
  }, { grain: 12 }),

  // Analog
  v2("clay", "Clay", "analog", {
    temp: 16, tint: 4, contrast: -6, saturation: -18, fade: 14,
    hsl: { red: [8, -10, 0], orange: [4, -6, 4], green: [-24, -30, 0], blue: [-14, -34, 0] },
    grade: { shadows: [20, 12], midtones: [20, 6] },
  }, { grain: 10 }),
  v2("oat", "Oat", "analog", {
    exposure: 0.1, temp: 10, contrast: -14, saturation: -24,
    curve: [[0, 22], [64, 80], [128, 144], [192, 204], [255, 246]],
    grade: { shadows: [40, 8], highlights: [45, 8] },
  }, { grain: 8 }),
  v2("seasalt", "Sea Salt", "analog", {
    exposure: 0.12, temp: -10, contrast: -14, saturation: -14,
    curve: [[0, 20], [64, 80], [128, 146], [192, 210], [255, 250]],
    hsl: { aqua: [-6, -10, 8], blue: [-8, -16, 8], orange: [0, -8, 8] },
    grade: { shadows: [195, 10], highlights: [190, 4] },
  }, { grain: 6 }),
  v2("moss", "Moss", "analog", {
    temp: 2, tint: -6, contrast: -4, saturation: -12,
    hsl: { yellow: [-14, -20, -4], green: [-14, -16, -8], aqua: [-20, -20, 0], orange: [0, -4, 4] },
    grade: { shadows: [110, 12], highlights: [55, 6] },
  }, { grain: 10 }),
  v2("blush", "Blush", "analog", {
    exposure: 0.1, tint: 10, contrast: -12, saturation: -8,
    curve: [[0, 18], [64, 76], [128, 142], [192, 206], [255, 250]],
    hsl: { green: [10, -26, 6], orange: [-6, -6, 8] },
    grade: { shadows: [300, 8], highlights: [345, 10] },
  }, { grain: 6 }),

  // Mood
  v2("ink", "Ink", "mood", {
    exposure: -0.12, temp: -14, contrast: 18, saturation: -20,
    curve: [[0, 6], [64, 46], [128, 118], [192, 190], [255, 242]],
    grade: { shadows: [225, 18], highlights: [45, 4] },
  }, { grain: 8, vignette: 24 }),
  v2("midnight", "Midnight", "mood", {
    exposure: -0.2, temp: -20, contrast: 10, saturation: -16,
    curve: [[0, 14], [64, 48], [128, 112], [192, 180], [255, 230]],
    grade: { shadows: [230, 20], midtones: [220, 8] },
  }, { grain: 10, vignette: 30 }),
  v2("tobacco", "Tobacco", "mood", {
    exposure: -0.08, temp: 18, contrast: 10, saturation: -24,
    curve: [[0, 10], [64, 54], [128, 122], [192, 190], [255, 236]],
    hsl: { green: [-16, -34, -10], aqua: [0, -30, -6], blue: [6, -44, -10] },
    grade: { shadows: [28, 16], midtones: [32, 10], highlights: [40, 8] },
  }, { grain: 12, vignette: 22 }),
  v2("fog", "Fog", "mood", {
    temp: -6, contrast: -22, saturation: -32,
    curve: [[0, 42], [64, 84], [128, 134], [192, 190], [255, 232]],
    grade: { shadows: [205, 8], highlights: [200, 4] },
  }, { grain: 8, bloom: 0.15 }),
  v2("wine", "Wine", "mood", {
    exposure: -0.1, tint: 8, contrast: 14, saturation: -14,
    curve: [[0, 8], [64, 50], [128, 120], [192, 190], [255, 240]],
    hsl: { red: [-6, 16, -8], magenta: [-10, 10, -6], green: [-20, -30, -10] },
    grade: { shadows: [335, 16], highlights: [30, 6] },
  }, { grain: 8, vignette: 22 }),

  // Bright
  v2("cream", "Cream", "bright", {
    exposure: 0.18, temp: 8, contrast: -8, saturation: -10,
    curve: [[0, 14], [64, 80], [128, 150], [192, 214], [255, 250]],
    grade: { highlights: [45, 10] },
  }),
  v2("pearl", "Pearl", "bright", {
    exposure: 0.22, temp: -4, tint: 4, contrast: -10, saturation: -14,
    curve: [[0, 16], [64, 84], [128, 154], [192, 216], [255, 252]],
    grade: { shadows: [240, 6], highlights: [320, 4] },
  }, { bloom: 0.15 }),
  v2("daisy", "Daisy", "bright", {
    exposure: 0.16, temp: 12, contrast: -4, vibrance: 10,
    curve: [[0, 10], [64, 76], [128, 146], [192, 212], [255, 252]],
    hsl: { yellow: [0, 16, 8], green: [-10, -10, 6], orange: [0, -4, 8] },
    grade: { highlights: [55, 10] },
  }),
  v2("sky", "Sky", "bright", {
    exposure: 0.14, temp: -14, contrast: -2, vibrance: 8,
    curve: [[0, 8], [64, 74], [128, 144], [192, 210], [255, 254]],
    hsl: { aqua: [0, 10, 6], blue: [-6, 12, 6], orange: [0, -6, 8] },
    grade: { shadows: [210, 10] },
  }),

  // Vivid
  v2("mango", "Mango", "vivid", {
    temp: 16, contrast: 12, saturation: 18,
    hsl: { orange: [4, 20, 4], yellow: [-8, 18, 4], red: [6, 10, 0], blue: [0, -6, -4] },
    grade: { highlights: [38, 14], shadows: [200, 6] },
  }),
  v2("berry", "Berry", "vivid", {
    tint: 10, contrast: 14, saturation: 16,
    hsl: { red: [-6, 18, -6], magenta: [-6, 22, 0], purple: [0, 20, 0], green: [10, -16, 0] },
    grade: { shadows: [280, 12], highlights: [340, 8] },
  }),
  v2("electric", "Electric", "vivid", {
    temp: -10, contrast: 20, saturation: 24, vibrance: 10,
    curve: [[0, 0], [64, 52], [128, 128], [192, 208], [255, 255]],
    hsl: { blue: [-10, 26, -6], aqua: [-6, 24, 0], purple: [0, 18, 0] },
    grade: { shadows: [230, 12] },
  }),

  // Instant
  v2("sunbleach", "Sun Bleach", "instant", {
    exposure: 0.2, temp: 18, contrast: -20, saturation: -30,
    curve: [[0, 34], [64, 94], [128, 158], [192, 212], [255, 240]],
    hsl: { aqua: [10, -30, 6], blue: [8, -36, 8], green: [-30, -30, 6] },
    grade: { highlights: [55, 16], shadows: [40, 10] },
  }, { grain: 10, vignette: 16 }),
  v2("nightflash", "Night Flash", "instant", {
    exposure: 0.05, temp: 6, contrast: 26, saturation: 4,
    curve: [[0, 6], [48, 22], [128, 132], [200, 228], [255, 255]],
    grade: { shadows: [230, 12], highlights: [40, 8] },
  }, { grain: 16, vignette: 50 }),

  // Cinema
  v2("desert", "Desert", "cinema", {
    temp: 18, contrast: 14, saturation: -4,
    hsl: { orange: [4, 10, 4], yellow: [-10, 0, 0], blue: [-20, 10, -8], aqua: [-10, 10, -4], green: [-30, -30, 0] },
    grade: { shadows: [190, 18], highlights: [35, 22] },
  }, { grain: 8 }),
  v2("emerald", "Emerald", "cinema", {
    tint: -10, contrast: 16, saturation: -6,
    curve: [[0, 6], [64, 54], [128, 126], [192, 200], [255, 248]],
    hsl: { green: [16, 10, -6], aqua: [-10, 14, -6], orange: [0, 4, 4] },
    grade: { shadows: [165, 22], highlights: [40, 8] },
  }, { grain: 8, vignette: 16 }),
  // Colour kept only in reds, the rest nearly grey.
  v2("noirrouge", "Noir Rouge", "cinema", {
    contrast: 22,
    curve: [[0, 0], [64, 50], [128, 126], [192, 206], [255, 255]],
    hsl: { red: [0, 20, -4], orange: [-8, -70, 0], yellow: [0, -100, 0], green: [0, -100, 0], aqua: [0, -100, 0], blue: [0, -100, 0], purple: [0, -100, 0], magenta: [0, -50, 0] },
  }, { grain: 10, vignette: 24 }),

  // Urban
  v2("asphalt", "Asphalt", "urban", {
    exposure: -0.08, contrast: 22, saturation: -30,
    curve: [[0, 4], [64, 48], [128, 122], [192, 200], [255, 248]],
    grade: { shadows: [215, 6] },
  }, { grain: 12, vignette: 18 }),
  v2("glass", "Glass", "urban", {
    exposure: 0.1, temp: -10, contrast: 2, saturation: -18,
    curve: [[0, 10], [64, 70], [128, 140], [192, 208], [255, 254]],
    grade: { shadows: [205, 8], highlights: [195, 4] },
  }),

  // Lights
  v2("neonpink", "Neon Pink", "lights", {
    exposure: -0.08, tint: 14, contrast: 18, saturation: 14,
    curve: [[0, 0], [64, 46], [128, 124], [192, 206], [255, 255]],
    hsl: { magenta: [-6, 26, 6], red: [-10, 10, 0], purple: [10, 20, 0], aqua: [0, 14, 0] },
    grade: { shadows: [265, 14], highlights: [330, 10] },
  }, { grain: 8, bloom: 0.3 }),
  v2("streetlamp", "Street Lamp", "lights", {
    exposure: -0.05, temp: 26, contrast: 14, saturation: -10,
    curve: [[0, 6], [64, 50], [128, 124], [192, 200], [255, 246]],
    hsl: { blue: [10, 10, -10], aqua: [10, 6, -6] },
    grade: { shadows: [210, 16], highlights: [35, 16] },
  }, { grain: 14, bloom: 0.25, halation: 0.2 }),

  // Mono
  v2("charcoal", "Charcoal", "mono", { bw: [0.3, 0.6, 0.1], exposure: -0.2, contrast: 18, curve: [[0, 0], [64, 40], [128, 104], [192, 176], [255, 236]] }, { grain: 14, vignette: 28 }),
  v2("snow", "Snow", "mono", { bw: [0.3, 0.6, 0.1], exposure: 0.25, contrast: -6, curve: [[0, 30], [64, 104], [128, 170], [192, 222], [255, 255]] }, { grain: 4 }),
  // Blue lens filter: skin and reds darker, skies pale.
  v2("bluefilter", "Blue Filter", "mono", { bw: [-0.1, 0.5, 0.6], contrast: 12 }, { grain: 10 }),
  v2("gelatin", "Gelatin", "mono", {
    bw: [0.3, 0.59, 0.11], contrast: 10,
    curve: [[0, 8], [64, 60], [128, 130], [192, 202], [255, 246]],
    grade: { shadows: [35, 6], highlights: [50, 6] },
  }, { grain: 10 }),
  v2("halide", "Halide", "mono", { bw: [0.32, 0.58, 0.1], contrast: 16, curve: [[0, 4], [64, 54], [128, 128], [192, 206], [255, 252]] }, { grain: 30 }),
];

export const FILTERS: FilterDef[] = [...V2, ...V3, ...V1];

export function filterById(id: string | undefined) {
  return id ? FILTERS.find((f) => f.id === id) : undefined;
}
