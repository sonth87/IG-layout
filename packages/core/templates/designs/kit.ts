import { PACK_ART } from "../apply";
import type { EventId } from "../seasons";
import type { SampleTheme, Template, TemplateArt, TemplateCategory, TemplateIcon, TemplateShape, TemplateSlot, TemplateText } from "../types";

// Building blocks for designed templates (home library, M10). Our own designs (D-66: no
// copying of other apps' templates). Coordinates: x / w relative to slide width, y / h to
// slide height; text size to width. Story texts stay out of Instagram's top / bottom
// zones (y 0.13 … 0.82).

export const PAPER = "#f3eee6";
export const KRAFT = "#e6d8c3";
export const INK = "#1d1c1a";
export const WHITE_FRAME = { border: { width: 0.02, color: "#ffffff" }, shadow: true };

export const t = (en: string, vi: string) => ({ en, vi });
export type Words = ReturnType<typeof t>;

export function text(slide: number, x: number, y: number, w: number, value: Words, style: Omit<TemplateText, "slide" | "x" | "y" | "w" | "text">): TemplateText {
  return { slide, x, y, w, text: value, ...style };
}

/** Photo cell; `photo` numbers count up in reading order. */
export function photo(n: number, slide: number, x: number, y: number, w: number, h: number, extra: Partial<TemplateSlot> = {}): TemplateSlot {
  return { photo: n, slide, x, y, w, h, ...extra };
}

/**
 * A cols × rows block of cells from photo `first` on, inside the box (x, y, w, h), `gap`
 * relative to slide width (vertical gap converted with the slide's `aspect`, width / height).
 */
export function cells(first: number, slide: number, box: [number, number, number, number], cols: number, rows: number, gap = 0, aspect = 0.8, extra: Partial<TemplateSlot> = {}): TemplateSlot[] {
  const [x, y, w, h] = box;
  const gy = gap * aspect;
  const cw = (w - gap * (cols - 1)) / cols;
  const ch = (h - gy * (rows - 1)) / rows;
  const out: TemplateSlot[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) out.push(photo(first + r * cols + c, slide, x + c * (cw + gap), y + r * (ch + gy), cw, ch, extra));
  return out;
}

/** A strip of masking tape over a photo's edge, centred on (cx, cy). */
export function tape(slide: number, cx: number, cy: number, rotation = -8, fill = "#efe4c8", w = 0.16): TemplateShape {
  return { slide, x: cx - w / 2, y: cy - 0.018, w, h: 0.036, shape: "rect", fill, opacity: 0.86, rotation, above: true };
}

/** A plain block of colour under the photos (paper card, strip, band). */
export function block(slide: number, x: number, y: number, w: number, h: number, fill: string, extra: Partial<TemplateShape> = {}): TemplateShape {
  return { slide, x, y, w, h, shape: "rect", fill, ...extra };
}

/**
 * A photobooth strip: a dark band holding `n` photos one above the other, centred on
 * (cx, cy), `w` wide, turned `rotation` degrees as one piece. `aspect` = slide width / height.
 */
export function strip(first: number, slide: number, cx: number, cy: number, w: number, n: number, rotation = 0, aspect = 0.8, fill = "#111111") {
  // Sizes in slide-width units; heights converted with `aspect` at the end.
  const pad = w * 0.08;
  const pw = w - pad * 2;
  const ph = pw * 0.8;
  const gap = pad * 0.6;
  const total = pad * 2.5 + n * ph + (n - 1) * gap;
  const a = (rotation * Math.PI) / 180;
  const slots = Array.from({ length: n }, (_, i) => {
    // Offset from the strip's centre, turned with it (y down, clockwise).
    const oy = -total / 2 + pad + ph / 2 + i * (ph + gap);
    const x = cx - oy * Math.sin(a);
    const y = cy + oy * Math.cos(a) * aspect;
    return photo(first + i, slide, x - pw / 2, y - (ph * aspect) / 2, pw, ph * aspect, { rotation });
  });
  return { shape: block(slide, cx - w / 2, cy - (total * aspect) / 2, w, total * aspect, fill, { rotation }), slots };
}

/**
 * A hand-drawn border around (x, y, w, h): two loose strokes a side, overshooting the
 * corners. `aspect` = slide width / height (keeps strokes the same thickness).
 */
export function sketch(slide: number, x: number, y: number, w: number, h: number, aspect = 0.8, color = INK): TemplateShape[] {
  const k = 0.0035;
  const o = 0.025;
  return [
    block(slide, x - o, y - k, w + o * 2, k, color, { rotation: -0.6 }),
    block(slide, x - o / 2, y + k * 1.5, w + o, k * 0.7, color, { rotation: 0.4 }),
    block(slide, x - o, y + h, w + o * 2, k, color, { rotation: 0.5 }),
    block(slide, x - o / 3, y + h - k * 2, w + o, k * 0.7, color, { rotation: -0.3 }),
    block(slide, x - k, y - o * aspect, k * aspect, h + o * 2 * aspect, color, { rotation: 0.4 }),
    block(slide, x + w, y - o * aspect, k * aspect, h + o * 2 * aspect, color, { rotation: -0.5 }),
  ];
}

/** A pack frame (its windows take photos from `photo` on) or a pack sticker; height follows the picture. */
export function art(id: string, slide: number, x: number, y: number, w: number, extra: Partial<TemplateArt> = {}): TemplateArt {
  return { id, slide, x, y, w, ...extra };
}

/** A drawn sticker / doodle (lib/elements/stickers). */
export function icon(name: string, slide: number, x: number, y: number, w: number, extra: Partial<TemplateIcon> = {}): TemplateIcon {
  return { icon: name, slide, x, y, w, ...extra };
}

/** Height (slide-height units) of a pack picture `w` wide. `aspect` = slide width / height. */
export function artH(id: string, w: number, aspect = 0.8) {
  const info = PACK_ART[id];
  return info ? ((w * info.height) / info.width) * aspect : w * aspect;
}

type Spec = Omit<Template, "id" | "name" | "group" | "photos" | "design"> & {
  group?: Template["group"];
  format?: "post" | "story" | "grid";
  themes?: SampleTheme[];
  /** Seasons / events it suits: shown at the top of the home screen when they come up. */
  events?: EventId[];
};

export function design(id: string, category: TemplateCategory, name: Words, spec: Spec): Template {
  const { format = "post", group = "scrapbook", themes, events, ...rest } = spec;
  const used = new Set(rest.slots.map((s) => s.photo));
  for (const a of rest.art ?? []) (PACK_ART[a.id]?.windows ?? []).forEach((_, i) => used.add((a.photo ?? 0) + i));
  const photos = used.size + (rest.background?.kind === "photo" ? 1 : 0);
  return {
    id: `design-${id}`,
    group,
    name,
    photos,
    types: [format],
    design: { category, type: format, ratio: format === "story" ? "9:16" : format === "grid" ? "3:4" : "4:5", ...(themes ? { themes } : {}), ...(events ? { events } : {}) },
    ...rest,
  };
}
