import type { Recipe } from "./lut";
import type { FilterPreset } from "./params";

// Named filters, grouped by style (docs/user/filters.md, D-19, D-21).
// Names stay in English in every language. First 5 for testing (D-15), the rest of the
// agreed list + nature / food groups in M11 (S10). Adding a filter = adding an entry here.

export type FilterGroup = "film" | "analog" | "mood" | "bright" | "mono" | "vintage" | "modern" | "future" | "nature" | "food";

export const FILTER_GROUPS: FilterGroup[] = ["film", "analog", "mood", "bright", "mono", "vintage", "modern", "nature", "food", "future"];

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
    hsl: { green: [-25, -30, 0], blue: [-20, -30, 0] },
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

export const FILTERS: FilterDef[] = [
  ...V2,
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
