import type { Template, TemplateSlot } from "./types";

// First template set (M3). Coordinates relative to one slide; see types.ts.
// Adding a layout = adding an entry here, no other code changes.

/** Evenly divided cells on one slide. */
function cells(cols: number, rows: number, slide = 0, photoOffset = 0): TemplateSlot[] {
  const out: TemplateSlot[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      out.push({ photo: photoOffset + r * cols + c, slide, x: c / cols, y: r / rows, w: 1 / cols, h: 1 / rows });
  return out;
}

/** Photos laid along the canvas: canvas-relative x positions are split into slide + x. */
function along(positions: { p: number; y: number; w: number; h: number; rotation?: number }[], style: Partial<TemplateSlot> = {}) {
  return positions.map((pos, i) => ({
    photo: i,
    slide: Math.floor(pos.p),
    x: pos.p - Math.floor(pos.p),
    y: pos.y,
    w: pos.w,
    h: pos.h,
    rotation: pos.rotation,
    ...style,
  }));
}

const WHITE_FRAME = { border: { width: 0.022, color: "#ffffff" }, shadow: true };

export const TEMPLATES: Template[] = [
  // ── Grid (one slide, cells) ──────────────────────────────────────────
  { id: "grid-2v", group: "grid", name: { en: "2 side by side", vi: "2 cạnh nhau" }, photos: 2, slides: 1, gridded: true, slots: cells(2, 1) },
  { id: "grid-2h", group: "grid", name: { en: "2 stacked", vi: "2 trên dưới" }, photos: 2, slides: 1, gridded: true, slots: cells(1, 2) },
  {
    id: "grid-3-left",
    group: "grid",
    name: { en: "1 big + 2", vi: "1 lớn + 2" },
    photos: 3,
    slides: 1,
    gridded: true,
    slots: [
      { photo: 0, slide: 0, x: 0, y: 0, w: 0.6, h: 1 },
      { photo: 1, slide: 0, x: 0.6, y: 0, w: 0.4, h: 0.5 },
      { photo: 2, slide: 0, x: 0.6, y: 0.5, w: 0.4, h: 0.5 },
    ],
  },
  { id: "grid-3-rows", group: "grid", name: { en: "3 rows", vi: "3 hàng" }, photos: 3, slides: 1, gridded: true, slots: cells(1, 3) },
  { id: "grid-4", group: "grid", name: { en: "2 × 2", vi: "2 × 2" }, photos: 4, slides: 1, gridded: true, slots: cells(2, 2) },
  {
    id: "grid-4-top",
    group: "grid",
    name: { en: "1 big + 3", vi: "1 lớn + 3" },
    photos: 4,
    slides: 1,
    gridded: true,
    slots: [{ photo: 0, slide: 0, x: 0, y: 0, w: 1, h: 0.6 }, ...cells(3, 1).map((s, i) => ({ ...s, photo: i + 1, y: 0.6, h: 0.4 }))],
  },
  {
    id: "grid-5",
    group: "grid",
    name: { en: "2 + 3", vi: "2 + 3" },
    photos: 5,
    slides: 1,
    gridded: true,
    slots: [
      ...cells(2, 1).map((s) => ({ ...s, h: 0.5 })),
      ...cells(3, 1).map((s, i) => ({ ...s, photo: i + 2, y: 0.5, h: 0.5 })),
    ],
  },
  { id: "grid-6", group: "grid", name: { en: "2 × 3", vi: "2 × 3" }, photos: 6, slides: 1, gridded: true, slots: cells(2, 3) },
  { id: "grid-9", group: "grid", name: { en: "3 × 3", vi: "3 × 3" }, photos: 9, slides: 1, gridded: true, slots: cells(3, 3) },
  {
    id: "grid-8-2slides",
    group: "grid",
    name: { en: "2 × 2 on 2 slides", vi: "2 × 2 trên 2 slide" },
    photos: 8,
    slides: 2,
    gridded: true,
    slots: [...cells(2, 2, 0), ...cells(2, 2, 1, 4)],
  },

  // ── Seamless (content crosses slide boundaries) ──────────────────────
  {
    id: "seam-float-3",
    group: "seamless",
    name: { en: "Panorama + 3 floating", vi: "Panorama + 3 ảnh nổi" },
    photos: 4,
    slides: 3,
    background: { kind: "photo", photo: 0 },
    slots: [
      { photo: 1, slide: 0, x: 0.62, y: 0.18, w: 0.6, h: 0.5, rotation: -4, ...WHITE_FRAME },
      { photo: 2, slide: 1, x: 0.72, y: 0.46, w: 0.56, h: 0.42, rotation: 3, ...WHITE_FRAME },
      { photo: 3, slide: 2, x: 0.3, y: 0.14, w: 0.5, h: 0.56, rotation: -2, ...WHITE_FRAME },
    ],
  },
  {
    id: "seam-float-2",
    group: "seamless",
    name: { en: "Panorama + 2 floating", vi: "Panorama + 2 ảnh nổi" },
    photos: 3,
    slides: 2,
    background: { kind: "photo", photo: 0 },
    slots: [
      { photo: 1, slide: 0, x: 0.66, y: 0.22, w: 0.62, h: 0.52, rotation: -3, ...WHITE_FRAME },
      { photo: 2, slide: 1, x: 0.38, y: 0.4, w: 0.48, h: 0.42, rotation: 4, ...WHITE_FRAME },
    ],
  },
  {
    id: "seam-strip-5",
    group: "seamless",
    name: { en: "Photo strip", vi: "Dải ảnh" },
    photos: 5,
    slides: 3,
    background: { kind: "color", color: "#f3eee4" },
    slots: along([0.08, 0.68, 1.28, 1.88, 2.48].map((p) => ({ p, y: 0.2, w: 0.5, h: 0.6 })), { shadow: true }),
  },
  {
    id: "seam-zigzag-5",
    group: "seamless",
    name: { en: "Zigzag", vi: "Zigzag" },
    photos: 5,
    slides: 3,
    background: { kind: "gradient", from: "#1f2a36", to: "#3b3f6b", angle: 90 },
    slots: along(
      [0.06, 0.62, 1.18, 1.74, 2.3].map((p, i) => ({ p, y: i % 2 ? 0.44 : 0.08, w: 0.5, h: 0.48 })),
      { border: { width: 0.012, color: "#ffffff" } },
    ),
  },
  {
    id: "seam-big-collage",
    group: "seamless",
    name: { en: "Big photo + collage", vi: "Ảnh lớn + ghép ô" },
    photos: 4,
    slides: 3,
    gridded: true,
    slots: [
      { photo: 0, slide: 0, x: 0, y: 0, w: 2, h: 1 },
      { photo: 1, slide: 2, x: 0, y: 0, w: 1, h: 0.5 },
      { photo: 2, slide: 2, x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { photo: 3, slide: 2, x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
    ],
  },
  {
    id: "seam-film-5",
    group: "seamless",
    name: { en: "Film strip", vi: "Cuộn film" },
    photos: 5,
    slides: 3,
    background: { kind: "color", color: "#e9e4da" },
    shapes: [{ slide: 0, x: 0, y: 0.2, w: 3, h: 0.6, shape: "film", fill: "#161616" }],
    slots: along([0.08, 0.68, 1.28, 1.88, 2.48].map((p) => ({ p, y: 0.29, w: 0.5, h: 0.42 }))),
  },
  {
    id: "seam-polaroid-4",
    group: "seamless",
    name: { en: "Polaroid scatter", vi: "Polaroid rải" },
    photos: 4,
    slides: 2,
    background: { kind: "color", color: "#d8cfc2" },
    slots: [
      { photo: 0, slide: 0, x: 0.08, y: 0.08, w: 0.48, h: 0.46, rotation: -6, frame: "polaroid", shadow: true },
      { photo: 1, slide: 0, x: 0.64, y: 0.36, w: 0.48, h: 0.46, rotation: 5, frame: "polaroid", shadow: true },
      { photo: 2, slide: 1, x: 0.34, y: 0.06, w: 0.44, h: 0.42, rotation: -3, frame: "polaroid", shadow: true },
      { photo: 3, slide: 1, x: 0.44, y: 0.5, w: 0.44, h: 0.42, rotation: 7, frame: "polaroid", shadow: true },
    ],
  },

  // ── Panorama ─────────────────────────────────────────────────────────
  {
    id: "pano",
    group: "panorama",
    name: { en: "Panorama", vi: "Panorama" },
    photos: 1,
    slides: "any",
    background: { kind: "photo", photo: 0 },
    slots: [],
  },
  {
    id: "pano-title-space",
    group: "panorama",
    name: { en: "Panorama with margin", vi: "Panorama có lề" },
    photos: 1,
    slides: 3,
    background: { kind: "color", color: "#ffffff" },
    slots: [{ photo: 0, slide: 0, x: 0.06, y: 0.22, w: 2.88, h: 0.56 }],
  },

  // ── Scrapbook ────────────────────────────────────────────────────────
  {
    id: "scrap-3",
    group: "scrapbook",
    name: { en: "Scrapbook 3", vi: "Scrapbook 3" },
    photos: 3,
    slides: 1,
    background: { kind: "color", color: "#efe6d8" },
    slots: [
      { photo: 0, slide: 0, x: 0.06, y: 0.07, w: 0.56, h: 0.44, rotation: -7, ...WHITE_FRAME },
      { photo: 1, slide: 0, x: 0.4, y: 0.3, w: 0.54, h: 0.44, rotation: 5, ...WHITE_FRAME },
      { photo: 2, slide: 0, x: 0.12, y: 0.56, w: 0.52, h: 0.38, rotation: -2, ...WHITE_FRAME },
    ],
  },
  {
    id: "scrap-5",
    group: "scrapbook",
    name: { en: "Scrapbook 5 on 2 slides", vi: "Scrapbook 5 trên 2 slide" },
    photos: 5,
    slides: 2,
    background: { kind: "color", color: "#f6efe4" },
    slots: [
      { photo: 0, slide: 0, x: 0.07, y: 0.08, w: 0.6, h: 0.46, rotation: -5, ...WHITE_FRAME },
      { photo: 1, slide: 0, x: 0.2, y: 0.52, w: 0.5, h: 0.4, rotation: 4, ...WHITE_FRAME },
      { photo: 2, slide: 0, x: 0.72, y: 0.28, w: 0.55, h: 0.44, rotation: -3, ...WHITE_FRAME },
      { photo: 3, slide: 1, x: 0.34, y: 0.06, w: 0.56, h: 0.42, rotation: 6, ...WHITE_FRAME },
      { photo: 4, slide: 1, x: 0.22, y: 0.5, w: 0.6, h: 0.44, rotation: -4, ...WHITE_FRAME },
    ],
  },

  // ── Frame (one framed photo per slide) ───────────────────────────────
  {
    id: "frame-white",
    group: "frame",
    name: { en: "White frame", vi: "Khung trắng" },
    photos: 1,
    slides: "any",
    perPhoto: true,
    background: { kind: "color", color: "#c8a27c" },
    slots: [{ photo: 0, slide: 0, x: 0.12, y: 0.12, w: 0.76, h: 0.7, rotation: -2, border: { width: 0.04, color: "#ffffff" }, shadow: true }],
  },
  {
    id: "frame-arch",
    group: "frame",
    name: { en: "Arch", vi: "Vòm" },
    photos: 1,
    slides: "any",
    perPhoto: true,
    background: { kind: "color", color: "#efe6d8" },
    slots: [{ photo: 0, slide: 0, x: 0.16, y: 0.1, w: 0.68, h: 0.74, mask: "arch" }],
  },
  {
    id: "frame-rounded",
    group: "frame",
    name: { en: "Rounded", vi: "Bo góc" },
    photos: 1,
    slides: "any",
    perPhoto: true,
    background: { kind: "gradient", from: "#f3e3c3", to: "#d9728a", angle: 135 },
    slots: [{ photo: 0, slide: 0, x: 0.08, y: 0.08, w: 0.84, h: 0.84, mask: "rounded", cornerRadius: 0.06, shadow: true }],
  },

  // ── Single (one photo per slide) ─────────────────────────────────────
  {
    id: "single-fill",
    group: "single",
    name: { en: "One per slide", vi: "Mỗi slide 1 ảnh" },
    photos: 1,
    slides: "any",
    perPhoto: true,
    slots: [{ photo: 0, slide: 0, x: 0, y: 0, w: 1, h: 1 }],
  },
  {
    id: "single-border",
    group: "single",
    name: { en: "One per slide, white margin", vi: "Mỗi slide 1 ảnh, lề trắng" },
    photos: 1,
    slides: "any",
    perPhoto: true,
    background: { kind: "color", color: "#ffffff" },
    slots: [{ photo: 0, slide: 0, x: 0.06, y: 0.06, w: 0.88, h: 0.88 }],
  },
];

export function templateById(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}

/** Templates that fit `count` photos best: exact matches first, then per-photo layouts. */
export function suggestTemplates(count: number) {
  // No photos yet: any fixed layout (cells start empty).
  if (count === 0) return TEMPLATES.filter((t) => !t.perPhoto);
  const exact = TEMPLATES.filter((t) => !t.perPhoto && t.photos === count);
  const perPhoto = TEMPLATES.filter((t) => t.perPhoto);
  const panorama = count === 1 ? TEMPLATES.filter((t) => t.group === "panorama") : [];
  return [...exact, ...panorama, ...perPhoto];
}
