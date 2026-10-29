// Filter v2 (D-132, docs/discussions/2026-10-20-filter-v2.md): a filter is a recipe —
// tone curves per channel, colour by hue band, three-way grading, a black-and-white
// channel mix — baked once into a 3D lookup table the shader samples per pixel.

/** Curve point, Lightroom style: input → output, both 0..255. */
export type CurvePoint = [number, number];

export const HUE_BANDS = ["red", "orange", "yellow", "green", "aqua", "blue", "purple", "magenta"] as const;
export type HueBand = (typeof HUE_BANDS)[number];
const BAND_HUE: Record<HueBand, number> = { red: 0, orange: 30, yellow: 60, green: 120, aqua: 180, blue: 225, purple: 270, magenta: 315 };

/** A colour wheel push: hue in degrees (0 red, 60 yellow, 120 green, 180 cyan, 240 blue, 300 magenta), strength 0..100. */
export type Wheel = [number, number];

export interface Recipe {
  /** Stops. */
  exposure?: number;
  /** White balance, -100..100: warm (+) / cool, magenta (+) / green. */
  temp?: number;
  tint?: number;
  /** -100..100: S-curve on every channel. */
  contrast?: number;
  /** -100..100. */
  saturation?: number;
  vibrance?: number;
  /** Per hue band: hue shift in degrees, saturation -100..100, luminance -100..100. */
  hsl?: Partial<Record<HueBand, [number, number, number]>>;
  /** Black-and-white: weights of R, G, B (a coloured lens filter); true = plain luminance. */
  bw?: [number, number, number] | true;
  /** Tone curves, applied after everything above: master, then each channel. */
  curve?: CurvePoint[];
  r?: CurvePoint[];
  g?: CurvePoint[];
  b?: CurvePoint[];
  /** Three-way colour grading (and the tone of a black-and-white). */
  grade?: { shadows?: Wheel; midtones?: Wheel; highlights?: Wheel };
  /** 0..100: lifts the blacks into a matte grey. */
  fade?: number;
}

export const LUT_SIZE = 33;

/** Monotone cubic (Fritsch–Carlson) through the points → 256 entries, 0..1. */
export function curveTable(points: CurvePoint[] | undefined): Float32Array | null {
  if (!points || points.length < 2) return null;
  const p = [...points].sort((a, b) => a[0] - b[0]).map(([x, y]) => [x / 255, y / 255]);
  const n = p.length;
  const d = new Array<number>(n - 1);
  for (let i = 0; i < n - 1; i++) d[i] = (p[i + 1][1] - p[i][1]) / Math.max(1e-6, p[i + 1][0] - p[i][0]);
  const m = new Array<number>(n);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  const out = new Float32Array(256);
  let k = 0;
  for (let j = 0; j < 256; j++) {
    const x = j / 255;
    if (x <= p[0][0]) out[j] = p[0][1];
    else if (x >= p[n - 1][0]) out[j] = p[n - 1][1];
    else {
      while (k < n - 2 && x > p[k + 1][0]) k++;
      const h = p[k + 1][0] - p[k][0];
      const t = (x - p[k][0]) / h;
      const t2 = t * t;
      const t3 = t2 * t;
      out[j] = (2 * t3 - 3 * t2 + 1) * p[k][1] + (t3 - 2 * t2 + t) * h * m[k] + (-2 * t3 + 3 * t2) * p[k + 1][1] + (t3 - t2) * h * m[k + 1];
    }
  }
  return out;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const luma = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function lookup(table: Float32Array, v: number) {
  const x = clamp01(v) * 255;
  const i = Math.min(254, Math.floor(x));
  return table[i] + (table[i + 1] - table[i]) * (x - i);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    t = ((t % 1) + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const hh = h / 360;
  return [f(hh + 1 / 3), f(hh), f(hh - 1 / 3)];
}

/** A pure hue with its luminance removed: the direction a wheel pushes. */
function wheelVector([hue, strength]: Wheel): [number, number, number] {
  const [r, g, b] = hslToRgb(((hue % 360) + 360) % 360, 1, 0.5);
  const l = luma(r, g, b);
  const k = (strength / 100) * 0.3;
  return [(r - l) * k, (g - l) * k, (b - l) * k];
}

/** RGBA bytes, (LUT_SIZE²) × LUT_SIZE: x = blue slice × size + red, y = green. */
export function buildLut(recipe: Recipe, size = LUT_SIZE): Uint8Array {
  const curves = [curveTable(recipe.curve), curveTable(recipe.r), curveTable(recipe.g), curveTable(recipe.b)];
  const gain = 2 ** (recipe.exposure ?? 0);
  const temp = (recipe.temp ?? 0) / 100;
  const tint = (recipe.tint ?? 0) / 100;
  const wb = [gain * (1 + temp * 0.1 + tint * 0.03), gain * (1 - tint * 0.07), gain * (1 - temp * 0.12 + tint * 0.03)];
  const contrast = (recipe.contrast ?? 0) / 100;
  const sat = (recipe.saturation ?? 0) / 100;
  const vib = (recipe.vibrance ?? 0) / 100;
  const bands = recipe.hsl ? HUE_BANDS.filter((b) => recipe.hsl![b]).map((b) => [BAND_HUE[b], ...recipe.hsl![b]!] as const) : [];
  const bw = recipe.bw === true ? [0.2126, 0.7152, 0.0722] : recipe.bw;
  const bwSum = bw ? bw[0] + bw[1] + bw[2] : 1;
  const grade = recipe.grade;
  const gs = grade?.shadows ? wheelVector(grade.shadows) : null;
  const gm = grade?.midtones ? wheelVector(grade.midtones) : null;
  const gh = grade?.highlights ? wheelVector(grade.highlights) : null;
  const fade = ((recipe.fade ?? 0) / 100) * 0.16;

  const out = new Uint8Array(size * size * size * 4);
  const c = [0, 0, 0];
  for (let bi = 0; bi < size; bi++)
    for (let gi = 0; gi < size; gi++)
      for (let ri = 0; ri < size; ri++) {
        c[0] = (ri / (size - 1)) * wb[0];
        c[1] = (gi / (size - 1)) * wb[1];
        c[2] = (bi / (size - 1)) * wb[2];

        if (bands.length) {
          let [h, s, l] = rgbToHsl(clamp01(c[0]), clamp01(c[1]), clamp01(c[2]));
          let dh = 0;
          let ds = 0;
          let dl = 0;
          for (const [centre, shift, bs, bl] of bands) {
            const dist = Math.abs(((h - centre + 540) % 360) - 180);
            const w = Math.max(0, 1 - dist / 55);
            if (!w) continue;
            dh += shift * w;
            ds += (bs / 100) * w;
            dl += (bl / 100) * w;
          }
          h = (h + dh + 360) % 360;
          const sw = s; // luminance moves only coloured pixels
          s = clamp01(s * (1 + ds));
          l = clamp01(l + dl * 0.25 * sw);
          [c[0], c[1], c[2]] = hslToRgb(h, s, l);
        }

        if (bw) {
          const v = (c[0] * bw[0] + c[1] * bw[1] + c[2] * bw[2]) / bwSum;
          c[0] = c[1] = c[2] = v;
        } else if (sat || vib) {
          const l = luma(c[0], c[1], c[2]);
          const s = Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);
          const k = 1 + sat + vib * (1 - clamp01(s)) * 1.2;
          for (let i = 0; i < 3; i++) c[i] = l + (c[i] - l) * k;
        }

        if (contrast) for (let i = 0; i < 3; i++) {
          const x = clamp01(c[i]);
          c[i] = x + contrast * (x * x * (3 - 2 * x) - x);
        }
        for (let i = 0; i < 3; i++) {
          if (curves[0]) c[i] = lookup(curves[0], c[i]);
          if (curves[i + 1]) c[i] = lookup(curves[i + 1]!, c[i]);
        }

        if (grade) {
          const l = clamp01(luma(c[0], c[1], c[2]));
          const ws = 1 - smooth(0, 0.55, l);
          const wh = smooth(0.45, 1, l);
          const wm = Math.max(0, 1 - ws - wh) + 4 * l * (1 - l) * 0.35;
          for (let i = 0; i < 3; i++) c[i] += (gs ? gs[i] * ws : 0) + (gm ? gm[i] * wm : 0) + (gh ? gh[i] * wh : 0);
        }
        if (fade) for (let i = 0; i < 3; i++) c[i] = fade + c[i] * (1 - fade);

        const o = (gi * size * size + bi * size + ri) * 4;
        out[o] = Math.round(clamp01(c[0]) * 255);
        out[o + 1] = Math.round(clamp01(c[1]) * 255);
        out[o + 2] = Math.round(clamp01(c[2]) * 255);
        out[o + 3] = 255;
      }
  return out;
}
