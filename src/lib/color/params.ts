// Colour adjustments (M4). Values are in UI units: -100..100, except
// vignette / grain / fade which are 0..100. See docs/architecture/editor-model.md, mục 7.

export const ADJUST_KEYS = [
  "exposure",
  "brightness",
  "contrast",
  "highlights",
  "shadows",
  "saturation",
  "vibrance",
  "temperature",
  "tint",
  "hue",
  "vignette",
  "grain",
  "fade",
  "blur",
  "sharpen",
] as const;

export type AdjustKey = (typeof ADJUST_KEYS)[number];
export type Adjustments = Record<AdjustKey, number>;

export const NO_ADJUST: Adjustments = Object.fromEntries(ADJUST_KEYS.map((k) => [k, 0])) as Adjustments;

export const ADJUST_MIN: Record<AdjustKey, number> = {
  ...(Object.fromEntries(ADJUST_KEYS.map((k) => [k, -100])) as Adjustments),
  vignette: 0,
  grain: 0,
  fade: 0,
  blur: 0,
  sharpen: 0,
};

export interface FilterRef {
  id: string;
  /** 0..100 */
  intensity: number;
}

/** A filter preset: adjustment values + extras that only filters use. */
export interface FilterPreset {
  adjust: Partial<Adjustments>;
  /** 0..1: blend to monochrome, tinted by `monoTint` (rgb 0..1). */
  mono?: number;
  monoTint?: [number, number, number];
  /** Colour pushed into shadows / highlights (rgb 0..1, 0.5 = neutral), strength 0..1. */
  split?: { shadows: [number, number, number]; highlights: [number, number, number]; strength: number };
}

/** Values the shader receives (normalised). */
export interface ShaderParams {
  exposure: number; // stops
  brightness: number;
  contrast: number;
  highlights: number;
  shadows: number;
  saturation: number;
  vibrance: number;
  temperature: number;
  tint: number;
  hue: number; // turns (-0.5..0.5)
  grain: number;
  fade: number;
  /** 0..1 (M19). */
  blur: number;
  sharpen: number;
  mono: number;
  monoTint: [number, number, number];
  splitShadows: [number, number, number];
  splitHighlights: [number, number, number];
  split: number;
}

export function isNeutral(adjust: Adjustments | undefined, filter: FilterRef | null | undefined) {
  return (!filter || filter.intensity === 0) && (!adjust || ADJUST_KEYS.every((k) => k === "vignette" || !adjust[k]));
}

/** Filter (scaled by intensity) + manual adjustments → shader values. Vignette is drawn separately. */
export function shaderParams(adjust: Adjustments, preset: FilterPreset | undefined, intensity: number): ShaderParams {
  const k = preset ? intensity / 100 : 0;
  const v = (key: AdjustKey) => (adjust[key] ?? 0) + (preset?.adjust[key] ?? 0) * k;
  return {
    exposure: (v("exposure") / 100) * 1.5,
    brightness: v("brightness") / 100,
    contrast: v("contrast") / 100,
    highlights: v("highlights") / 100,
    shadows: v("shadows") / 100,
    saturation: v("saturation") / 100,
    vibrance: v("vibrance") / 100,
    temperature: v("temperature") / 100,
    tint: v("tint") / 100,
    hue: v("hue") / 200,
    grain: v("grain") / 100,
    fade: v("fade") / 100,
    blur: v("blur") / 100,
    sharpen: v("sharpen") / 100,
    // A black-and-white filter stays fully grey at any intensity; intensity only scales its tone and tint (owner 2026-10-20).
    mono: preset?.mono && k > 0 ? preset.mono : 0,
    monoTint: (preset?.monoTint ?? [1, 1, 1]).map((c) => 1 + (c - 1) * k) as [number, number, number],
    splitShadows: preset?.split?.shadows ?? [0.5, 0.5, 0.5],
    splitHighlights: preset?.split?.highlights ?? [0.5, 0.5, 0.5],
    split: (preset?.split?.strength ?? 0) * k,
  };
}

export function paramsKey(p: ShaderParams) {
  return JSON.stringify(p);
}
