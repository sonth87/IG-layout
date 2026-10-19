// Effects (M21, editor-v2/14): one per element. What each one is called, which group it
// belongs to, which elements take it and what can be set. The pixel work is in ./fx.ts.

export type EffectGroup = "distort" | "digital" | "light" | "material" | "motion";
export const EFFECT_GROUPS: { id: EffectGroup; name: [en: string, vi: string] }[] = [
  { id: "distort", name: ["Distort", "Biến dạng"] },
  { id: "digital", name: ["Digital", "Kỹ thuật số"] },
  { id: "light", name: ["Light & depth", "Ánh sáng & khối"] },
  { id: "material", name: ["Material", "Chất liệu"] },
  { id: "motion", name: ["Motion", "Chuyển động"] },
];

export type ParamSpec =
  | { key: string; type: "range"; label: [string, string]; min: number; max: number; step?: number; def: number; unit?: string; more?: boolean }
  | { key: string; type: "dir"; label: [string, string]; def: number; only?: number[]; more?: boolean }
  | { key: string; type: "select"; label: [string, string]; options: { id: string; label: [string, string] }[]; def: string; more?: boolean }
  | { key: string; type: "color"; label: [string, string]; def: string; more?: boolean }
  | { key: string; type: "bool"; label: [string, string]; def: boolean; more?: boolean };

export interface EffectSpec {
  id: string;
  group: EffectGroup;
  name: [en: string, vi: string];
  params: ParamSpec[];
  /** Has a random part: the Shuffle button. */
  random?: boolean;
}

const r = (key: string, label: [string, string], min: number, max: number, def: number, extra: { step?: number; unit?: string; more?: boolean } = {}): ParamSpec => ({ key, type: "range", label, min, max, def, ...extra });
const dir = (def = 90, more = false, only?: number[]): ParamSpec => ({ key: "dir", type: "dir", label: ["Direction", "Hướng"], def, more, only });
const centre: ParamSpec[] = [r("cx", ["Centre ←→", "Tâm ngang"], 0, 100, 50, { unit: "%", more: true }), r("cy", ["Centre ↑↓", "Tâm dọc"], 0, 100, 50, { unit: "%", more: true })];

export const EFFECTS: EffectSpec[] = [
  // ---------------------------------------------------------------- distort
  {
    id: "melt",
    group: "distort",
    name: ["Melt", "Chảy"],
    random: true,
    params: [
      dir(90),
      r("amount", ["Melt", "Mức chảy"], 0, 100, 55),
      r("start", ["Starts at", "Bắt đầu từ"], 0, 95, 70, { unit: "%" }),
      r("drips", ["Drips", "Số giọt"], 1, 12, 4, { step: 1 }),
      r("vary", ["Uneven drips", "Giọt dài ngắn"], 0, 100, 60, { more: true }),
      r("thick", ["Thickness", "Độ đặc"], 0, 100, 50, { more: true }),
      r("gloss", ["Gloss", "Bóng loáng"], 0, 100, 30, { more: true }),
    ],
  },
  {
    id: "drape",
    group: "distort",
    name: ["Drape over an edge", "Vắt qua mép"],
    random: true,
    params: [
      dir(90, false, [90, 180, 0]),
      r("fold", ["Edge at", "Vị trí mép"], 10, 90, 50, { unit: "%" }),
      r("flat", ["Flattened", "Độ dẹt"], 0, 100, 60),
      r("droop", ["Droop", "Độ rủ"], 0, 100, 50),
      r("drips", ["Drips", "Giọt ở đáy"], 0, 6, 2, { step: 1, more: true }),
      r("shade", ["Fold shadow", "Bóng nếp gập"], 0, 100, 50, { more: true }),
    ],
  },
  {
    id: "twirl",
    group: "distort",
    name: ["Twirl", "Xoáy"],
    params: [r("angle", ["Turn", "Góc xoáy"], -720, 720, 180, { unit: "°" }), r("radius", ["Radius", "Bán kính"], 5, 100, 60, { unit: "%" }), ...centre],
  },
  {
    id: "bulge",
    group: "distort",
    name: ["Bulge / Pinch", "Phình / Co"],
    params: [r("amount", ["Pinch ← → Bulge", "Co ← → Phình"], -100, 100, 50), r("radius", ["Radius", "Bán kính"], 5, 100, 50, { unit: "%" }), ...centre],
  },
  {
    id: "wave",
    group: "distort",
    name: ["Wave", "Sóng uốn"],
    params: [
      {
        key: "axis",
        type: "select",
        label: ["Waves", "Sóng"],
        def: "h",
        options: [
          { id: "h", label: ["Side to side", "Ngang"] },
          { id: "v", label: ["Up and down", "Dọc"] },
          { id: "both", label: ["Both", "Cả hai"] },
        ],
      },
      r("amp", ["Height", "Biên độ"], 0, 100, 30),
      r("count", ["Waves", "Số sóng"], 0.5, 10, 2, { step: 0.5 }),
      r("phase", ["Shift", "Dịch sóng"], 0, 360, 0, { unit: "°", more: true }),
    ],
  },
  {
    id: "arc",
    group: "distort",
    name: ["Arc", "Uốn cong"],
    params: [r("bend", ["Down ← → Up", "Xuống ← → Lên"], -100, 100, 40)],
  },
  // ---------------------------------------------------------------- digital
  {
    id: "glitch",
    group: "digital",
    name: ["Glitch", "Glitch"],
    random: true,
    params: [
      r("amount", ["Strength", "Mức"], 0, 100, 40),
      r("slices", ["Slices", "Số lát"], 2, 40, 12, { step: 1 }),
      r("split", ["Colour split", "Tách màu"], 0, 100, 40),
      r("blocks", ["Noise blocks", "Khối nhiễu"], 0, 100, 20, { more: true }),
      r("scan", ["Scan lines", "Vạch quét"], 0, 100, 0, { more: true }),
    ],
  },
  {
    id: "pixelate",
    group: "digital",
    name: ["Pixels", "Pixel"],
    params: [
      r("size", ["Block size", "Cỡ ô"], 2, 80, 16, { step: 1, unit: "px" }),
      {
        key: "shape",
        type: "select",
        label: ["Shape", "Hình ô"],
        def: "square",
        options: [
          { id: "square", label: ["Squares", "Vuông"] },
          { id: "circle", label: ["Dots (LED)", "Tròn (LED)"] },
        ],
      },
      r("gap", ["Gap", "Khe"], 0, 6, 0, { step: 1, unit: "px", more: true }),
    ],
  },
  {
    id: "rgbSplit",
    group: "digital",
    name: ["RGB split", "Tách màu RGB"],
    params: [
      {
        key: "mode",
        type: "select",
        label: ["Kind", "Kiểu"],
        def: "linear",
        options: [
          { id: "linear", label: ["One way", "Một hướng"] },
          { id: "radial", label: ["From the centre", "Toả tâm"] },
        ],
      },
      r("amount", ["Offset", "Khoảng lệch"], 0, 40, 8, { unit: "px" }),
      { key: "angle", type: "range", label: ["Angle", "Góc"], min: 0, max: 360, def: 0, unit: "°", more: true },
    ],
  },
  {
    id: "halftone",
    group: "digital",
    name: ["Halftone", "Chấm báo in"],
    params: [
      r("size", ["Dot size", "Cỡ chấm"], 2, 32, 8, { step: 1, unit: "px" }),
      r("angle", ["Screen angle", "Góc lưới"], 0, 90, 45, { unit: "°" }),
      { key: "ink", type: "color", label: ["Ink", "Màu mực"], def: "#111111" },
      { key: "keep", type: "bool", label: ["Keep colours", "Giữ màu gốc"], def: false, more: true },
    ],
  },
  {
    id: "duotone",
    group: "digital",
    name: ["Duotone", "Hai tông màu"],
    params: [
      { key: "dark", type: "color", label: ["Shadows", "Màu tối"], def: "#1d1a6b" },
      { key: "light", type: "color", label: ["Highlights", "Màu sáng"], def: "#ff7eb6" },
      r("contrast", ["Contrast", "Tương phản"], -50, 50, 0, { more: true }),
      r("mix", ["Mix", "Trộn"], 0, 100, 100, { unit: "%", more: true }),
    ],
  },
  // ---------------------------------------------------------------- light & depth
  {
    id: "longShadow",
    group: "light",
    name: ["Long shadow", "Đổ bóng dài"],
    params: [
      dir(45),
      r("length", ["Length", "Độ dài"], 4, 400, 120, { unit: "px" }),
      { key: "color", type: "color", label: ["Shadow", "Màu bóng"], def: "#000000" },
      r("alpha", ["Strength", "Độ đậm"], 0, 100, 35, { unit: "%" }),
      r("fade", ["Fade out", "Mờ dần"], 0, 100, 60, { more: true }),
      {
        key: "kind",
        type: "select",
        label: ["Kind", "Kiểu"],
        def: "solid",
        more: true,
        options: [
          { id: "solid", label: ["Solid", "Liền"] },
          { id: "stripes", label: ["Stripes", "Sọc"] },
        ],
      },
    ],
  },
  {
    id: "offsetShadow",
    group: "light",
    name: ["Offset shadow", "Bóng cứng lệch"],
    params: [
      dir(45),
      r("offset", ["Offset", "Khoảng lệch"], 2, 60, 12, { unit: "px" }),
      r("layers", ["Layers", "Số lớp"], 1, 5, 1, { step: 1 }),
      { key: "color", type: "color", label: ["Colour", "Màu"], def: "#ff4f8b" },
      { key: "color2", type: "color", label: ["Second colour", "Màu thứ hai"], def: "#ffd23f", more: true },
      {
        key: "kind",
        type: "select",
        label: ["Kind", "Kiểu"],
        def: "solid",
        more: true,
        options: [
          { id: "solid", label: ["Solid", "Đặc"] },
          { id: "outline", label: ["Outline", "Chỉ viền"] },
        ],
      },
    ],
  },
  {
    id: "outline",
    group: "light",
    name: ["Sticker edge", "Viền sticker"],
    params: [
      r("width", ["Edge", "Độ dày viền"], 0, 40, 14, { unit: "px" }),
      { key: "color", type: "color", label: ["Edge colour", "Màu viền"], def: "#ffffff" },
      r("shadow", ["Shadow", "Bóng"], 0, 100, 40),
      r("width2", ["Second edge", "Viền thứ hai"], 0, 20, 0, { unit: "px", more: true }),
      { key: "color2", type: "color", label: ["Second colour", "Màu viền 2"], def: "#111111", more: true },
      r("gloss", ["Plastic shine", "Bóng nhựa"], 0, 100, 0, { more: true }),
    ],
  },
  {
    id: "reflection",
    group: "light",
    name: ["Reflection", "Phản chiếu"],
    params: [
      dir(90, false, [90, 270, 0, 180]),
      r("length", ["Length", "Độ dài"], 10, 100, 50, { unit: "%" }),
      r("alpha", ["Strength", "Độ đậm"], 0, 100, 40, { unit: "%" }),
      r("gap", ["Gap", "Khoảng cách"], 0, 100, 0, { unit: "px", more: true }),
      r("ripple", ["Ripples", "Gợn nước"], 0, 100, 0, { more: true }),
    ],
  },
  // ---------------------------------------------------------------- material
  {
    id: "glitter",
    group: "material",
    name: ["Glitter", "Kim tuyến"],
    random: true,
    params: [
      {
        key: "tone",
        type: "select",
        label: ["Glitter", "Kim tuyến"],
        def: "gold",
        options: [
          { id: "gold", label: ["Gold", "Vàng"] },
          { id: "silver", label: ["Silver", "Bạc"] },
          { id: "pink", label: ["Pink", "Hồng"] },
          { id: "rainbow", label: ["Rainbow", "Cầu vồng"] },
          { id: "own", label: ["Its own colour", "Theo màu"] },
        ],
      },
      r("grain", ["Grain", "Cỡ hạt"], 1, 6, 2, { step: 1 }),
      r("sparkle", ["Sparkle", "Lấp lánh"], 0, 100, 40),
      r("stars", ["Stars ✦", "Điểm sáng ✦"], 0, 20, 5, { step: 1, more: true }),
    ],
  },
  // ---------------------------------------------------------------- motion
  {
    id: "echo",
    group: "motion",
    name: ["Echo", "Bóng lặp"],
    params: [
      dir(135),
      r("count", ["Copies", "Số bản"], 1, 12, 5, { step: 1 }),
      r("spacing", ["Spacing", "Khoảng cách"], 2, 80, 16, { unit: "px" }),
      r("fade", ["Fade out", "Mờ dần"], 0, 100, 60, { more: true }),
      r("grow", ["Smaller ← → Bigger", "Nhỏ dần ← → To dần"], -50, 50, 0, { unit: "%", more: true }),
      {
        key: "tint",
        type: "select",
        label: ["Colour", "Màu"],
        def: "keep",
        more: true,
        options: [
          { id: "keep", label: ["Same", "Giữ màu"] },
          { id: "rainbow", label: ["Rainbow", "Cầu vồng"] },
          { id: "one", label: ["One colour", "Một màu"] },
        ],
      },
      { key: "color", type: "color", label: ["Copy colour", "Màu bản sao"], def: "#ff4f8b", more: true },
    ],
  },
];

export const EFFECT_BY_ID = Object.fromEntries(EFFECTS.map((e) => [e.id, e]));

/** The element's effect. */
export interface ElementEffect {
  id: string;
  params: Record<string, number | string | boolean>;
  seed?: number;
}

/** The settings with their defaults filled in. */
export function effectParams(e: ElementEffect): Record<string, number | string | boolean> {
  const spec = EFFECT_BY_ID[e.id];
  const out: Record<string, number | string | boolean> = {};
  for (const p of spec?.params ?? []) out[p.key] = e.params[p.key] ?? p.def;
  return out;
}

export function newEffect(id: string): ElementEffect {
  return { id, params: {}, seed: 1 };
}
