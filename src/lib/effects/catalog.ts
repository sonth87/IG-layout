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
  /** Only for these kinds of element (default: all). */
  only?: ("image" | "text" | "icon" | "shape" | "drawing")[];
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
    random: true,
    params: [
      dir(90, false, [90, 270, 0, 180]),
      r("length", ["Length", "Độ dài"], 10, 100, 50, { unit: "%" }),
      r("alpha", ["Strength", "Độ đậm"], 0, 100, 40, { unit: "%" }),
      r("ripple", ["Ripples", "Gợn nước"], 0, 100, 0),
      r("natural", ["Natural water", "Sóng tự nhiên"], 0, 100, 50),
      r("waveSize", ["Wave size", "Cỡ sóng"], 0, 100, 40, { more: true }),
      r("streaks", ["Light streaks", "Vệt sáng nước"], 0, 100, 0, { more: true }),
      r("blur", ["Water blur", "Nhòe nước"], 0, 100, 0, { more: true }),
      r("gap", ["Gap", "Khoảng cách"], 0, 100, 0, { unit: "px", more: true }),
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
  // ================================================================ round 2 (editor-v2/14 §8)
  {
    id: "flag",
    group: "distort",
    name: ["Flag", "Cờ bay"],
    params: [
      { key: "edge", type: "select", label: ["Tied at", "Mép buộc"], def: "left", options: [{ id: "left", label: ["Left", "Trái"] }, { id: "right", label: ["Right", "Phải"] }, { id: "top", label: ["Top", "Trên"] }] },
      r("wind", ["Wind", "Gió"], 0, 100, 50),
      r("folds", ["Folds", "Số nếp"], 1, 6, 3, { step: 0.5 }),
      r("shade", ["Cloth shading", "Bóng vải"], 0, 100, 50, { more: true }),
    ],
  },
  {
    id: "ripple",
    group: "distort",
    name: ["Water ripple", "Gợn nước"],
    params: [
      r("amp", ["Strength", "Biên độ"], 0, 100, 30),
      r("spacing", ["Ring spacing", "Khoảng cách vòng"], 2, 30, 8, { unit: "%" }),
      r("decay", ["Fade out", "Tắt dần"], 0, 100, 50, { more: true }),
      r("phase", ["Shift", "Dịch sóng"], 0, 360, 0, { unit: "°", more: true }),
      r("light", ["Water light", "Ánh mặt nước"], 0, 100, 20, { more: true }),
      ...centre,
    ],
  },
  {
    id: "perspective",
    group: "distort",
    name: ["3D tilt", "Phối cảnh 3D"],
    params: [r("tiltX", ["Tilt back", "Nghiêng dọc"], -60, 60, 25, { unit: "°" }), r("tiltY", ["Turn", "Nghiêng ngang"], -60, 60, 0, { unit: "°" }), r("depth", ["Lens depth", "Độ sâu ống kính"], 0, 100, 50, { more: true })],
  },
  {
    id: "fisheye",
    group: "distort",
    name: ["Fisheye", "Mắt cá"],
    params: [r("amount", ["Strength", "Mức"], 0, 100, 60), { key: "round", type: "bool", label: ["Cut round", "Cắt tròn"], def: false }, ...centre],
  },
  {
    id: "mirror",
    group: "distort",
    name: ["Mirror", "Gương"],
    params: [
      {
        key: "mode",
        type: "select",
        label: ["Copy", "Kiểu"],
        def: "lr",
        options: [
          { id: "lr", label: ["Left → right", "Trái → phải"] },
          { id: "rl", label: ["Right → left", "Phải → trái"] },
          { id: "tb", label: ["Top → bottom", "Trên → dưới"] },
          { id: "bt", label: ["Bottom → top", "Dưới → trên"] },
          { id: "quad", label: ["Four corners", "4 góc"] },
        ],
      },
      r("axis", ["Axis at", "Vị trí trục"], 10, 90, 50, { unit: "%" }),
    ],
  },
  {
    id: "kaleidoscope",
    group: "distort",
    name: ["Kaleidoscope", "Kính vạn hoa"],
    only: ["image", "icon", "shape"],
    params: [r("segments", ["Segments", "Số cánh"], 3, 16, 6, { step: 1 }), r("angle", ["Turn", "Góc xoay"], 0, 360, 0, { unit: "°" }), r("zoom", ["Zoom", "Phóng"], 50, 200, 100, { unit: "%", more: true }), ...centre],
  },
  {
    id: "stretch",
    group: "distort",
    name: ["Pixel stretch", "Kéo vệt"],
    params: [dir(0), r("cut", ["Cut at", "Vị trí cắt"], 5, 95, 60, { unit: "%" }), r("wobble", ["Wobble", "Lệch vệt"], 0, 100, 0, { more: true })],
  },
  {
    id: "tear",
    group: "distort",
    name: ["Torn in two", "Xé đôi"],
    random: true,
    params: [
      { key: "way", type: "select", label: ["Tear", "Hướng xé"], def: "v", options: [{ id: "v", label: ["Top to bottom", "Dọc"] }, { id: "h", label: ["Side to side", "Ngang"] }] },
      r("at", ["Where", "Vị trí"], 10, 90, 50, { unit: "%" }),
      r("gap", ["Gap", "Khoảng hở"], 0, 100, 25),
      r("shift", ["Shift", "Lệch"], 0, 100, 20),
      r("edge", ["Paper edge", "Mép giấy"], 0, 100, 60, { more: true }),
      r("jag", ["Ragged", "Răng cưa"], 0, 100, 50, { more: true }),
    ],
  },
  {
    id: "fold",
    group: "distort",
    name: ["Folded paper", "Gấp giấy"],
    random: true,
    params: [r("cols", ["Folds ↕", "Nếp dọc"], 0, 4, 2, { step: 1 }), r("rows", ["Folds ↔", "Nếp ngang"], 0, 4, 1, { step: 1 }), r("depth", ["Depth", "Độ sâu nếp"], 0, 100, 40), dir(225, true), r("wrinkles", ["Wrinkles", "Nhăn giấy"], 0, 100, 0, { more: true })],
  },
  {
    id: "crt",
    group: "digital",
    name: ["CRT / VHS", "Màn hình CRT / VHS"],
    random: true,
    params: [
      { key: "mode", type: "select", label: ["Kind", "Kiểu"], def: "vhs", options: [{ id: "vhs", label: ["VHS tape", "Băng VHS"] }, { id: "crt", label: ["CRT screen", "Màn CRT"] }] },
      r("scan", ["Scan lines", "Vạch quét"], 0, 100, 40),
      r("bleed", ["Colour bleed", "Loang màu"], 0, 100, 40),
      r("noise", ["Noise", "Nhiễu"], 0, 100, 30),
      r("curve", ["Screen curve", "Cong màn"], 0, 100, 20, { more: true }),
      r("band", ["Noise band", "Dải nhiễu"], 0, 100, 20, { more: true }),
      { key: "osd", type: "select", label: ["On-screen text", "Chữ trên màn"], def: "none", more: true, options: [{ id: "none", label: ["None", "Không"] }, { id: "play", label: ["PLAY ▶", "PLAY ▶"] }, { id: "rec", label: ["● REC", "● REC"] }] },
    ],
  },
  {
    id: "dither",
    group: "digital",
    name: ["Dither 1-bit", "Dither 1-bit"],
    params: [
      { key: "palette", type: "select", label: ["Colours", "Bảng màu"], def: "bw", options: [{ id: "bw", label: ["Black & white", "Đen trắng"] }, { id: "gb", label: ["Old green screen", "4 xanh lá cổ"] }, { id: "two", label: ["Two colours", "2 màu tuỳ chọn"] }] },
      { key: "kind", type: "select", label: ["Pattern", "Kiểu"], def: "diffuse", options: [{ id: "diffuse", label: ["Diffusion", "Khuếch tán"] }, { id: "bayer", label: ["Grid", "Lưới Bayer"] }] },
      r("size", ["Dot size", "Cỡ điểm"], 1, 6, 2, { step: 1 }),
      r("contrast", ["Contrast", "Tương phản"], -50, 50, 0, { more: true }),
      { key: "dark", type: "color", label: ["Dark", "Màu tối"], def: "#1d1a6b", more: true },
      { key: "light", type: "color", label: ["Light", "Màu sáng"], def: "#ffd23f", more: true },
    ],
  },
  {
    id: "riso",
    group: "material",
    name: ["Risograph", "In lụa Riso"],
    random: true,
    params: [
      { key: "inks", type: "select", label: ["Inks", "Màu mực"], def: "pinkBlue", options: [{ id: "pinkBlue", label: ["Pink + blue", "Hồng + xanh"] }, { id: "pinkYellow", label: ["Pink + yellow", "Hồng + vàng"] }, { id: "blueOrange", label: ["Blue + orange", "Xanh + cam"] }, { id: "greenRed", label: ["Green + red", "Xanh lá + đỏ"] }, { id: "pink", label: ["Pink only", "Chỉ hồng"] }] },
      r("offset", ["Misprint", "Lệch in"], 0, 20, 4, { unit: "px" }),
      r("grain", ["Ink grain", "Hạt mực"], 0, 100, 40),
      r("screen", ["Halftone", "Trame"], 0, 100, 30, { more: true }),
    ],
  },
  {
    id: "emboss",
    group: "light",
    name: ["Emboss", "Dập nổi / chìm"],
    params: [
      { key: "kind", type: "select", label: ["Kind", "Kiểu"], def: "raise", options: [{ id: "raise", label: ["Raised", "Nổi"] }, { id: "press", label: ["Pressed in", "Chìm"] }] },
      r("depth", ["Depth", "Độ sâu"], 0, 100, 40),
      dir(225),
      { key: "material", type: "select", label: ["Material", "Chất liệu"], def: "keep", options: [{ id: "keep", label: ["Its colours", "Giữ màu"] }, { id: "paper", label: ["White paper", "Giấy trắng"] }, { id: "gold", label: ["Gold", "Vàng"] }, { id: "silver", label: ["Silver", "Bạc"] }] },
      r("soft", ["Softness", "Độ mềm"], 0, 100, 30, { more: true }),
    ],
  },
  {
    id: "glow",
    group: "light",
    name: ["Neon glow", "Phát sáng neon"],
    random: true,
    params: [
      { key: "color", type: "color", label: ["Glow", "Màu sáng"], def: "#ff4fd8" },
      r("radius", ["Spread", "Độ toả"], 2, 60, 20, { unit: "px" }),
      r("intensity", ["Strength", "Cường độ"], 0, 200, 100, { unit: "%" }),
      r("core", ["White core", "Lõi trắng"], 0, 100, 40, { more: true }),
      { key: "outline", type: "bool", label: ["Tube only", "Chỉ viền"], def: false, more: true },
      r("flicker", ["Broken tube", "Chớp hỏng"], 0, 100, 0, { more: true }),
    ],
  },
  {
    id: "extrude",
    group: "light",
    name: ["3D block", "Khối 3D"],
    params: [
      dir(45),
      r("depth", ["Depth", "Độ dày"], 2, 120, 30, { unit: "px" }),
      { key: "side", type: "color", label: ["Sides", "Màu mặt bên"], def: "#2b2b38" },
      r("bevel", ["Bevel", "Vát cạnh"], 0, 10, 2, { unit: "px", more: true }),
      { key: "shadow", type: "bool", label: ["Shadow", "Bóng đổ"], def: true, more: true },
    ],
  },
  {
    id: "rays",
    group: "light",
    name: ["Light rays", "Tia sáng"],
    params: [
      r("length", ["Length", "Độ dài tia"], 0, 100, 60),
      r("intensity", ["Strength", "Cường độ"], 0, 100, 50),
      { key: "tone", type: "select", label: ["Colour", "Màu"], def: "warm", options: [{ id: "own", label: ["Its own", "Theo phần tử"] }, { id: "warm", label: ["Warm", "Vàng ấm"] }, { id: "white", label: ["White", "Trắng"] }] },
      r("threshold", ["Bright parts", "Ngưỡng sáng"], 0, 100, 60, { more: true }),
      ...centre,
    ],
  },
  {
    id: "motionBlur",
    group: "motion",
    name: ["Motion blur", "Nhòe chuyển động"],
    params: [dir(0), r("length", ["Length", "Độ dài"], 0, 100, 40), r("keep", ["Keep sharp", "Giữ nét"], 0, 100, 50, { more: true })],
  },
  {
    id: "zoomBlur",
    group: "motion",
    name: ["Zoom blur", "Phóng tâm"],
    params: [r("amount", ["Strength", "Mức"], 0, 100, 40), r("sharp", ["Sharp middle", "Vùng nét giữa"], 0, 100, 30, { unit: "%" }), ...centre],
  },
  {
    id: "tiltShift",
    group: "motion",
    name: ["Tilt-shift", "Tilt-shift"],
    only: ["image"],
    params: [
      { key: "kind", type: "select", label: ["Focus", "Vùng nét"], def: "band", options: [{ id: "band", label: ["Band", "Dải"] }, { id: "circle", label: ["Circle", "Tròn"] }] },
      r("at", ["Focus at", "Vị trí nét"], 0, 100, 50, { unit: "%" }),
      r("width", ["Focus width", "Độ rộng vùng nét"], 5, 60, 20, { unit: "%" }),
      r("blur", ["Blur", "Độ mờ"], 0, 100, 60),
      r("boost", ["More colour", "Tăng màu"], 0, 100, 30, { more: true }),
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
