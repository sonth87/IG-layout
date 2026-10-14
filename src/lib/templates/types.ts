import type { Border, MaskShape } from "@/lib/project/types";

// Layout templates are data (D-31): coordinates are relative to one slide
// (0..1), so the same template works for every ratio. `slide` + `x` > 1 lets a
// photo cross a slide boundary. See docs/architecture/editor-model.md, mục 6.

export type TemplateGroup = "single" | "grid" | "scrapbook" | "frame" | "panorama" | "seamless";

export const TEMPLATE_GROUPS: TemplateGroup[] = ["grid", "seamless", "panorama", "scrapbook", "frame", "single"];

export interface TemplateSlot {
  /** Index into the chosen photos. */
  photo: number;
  slide: number;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
  mask?: MaskShape;
  /** Relative to slide width. */
  cornerRadius?: number;
  /** Width relative to slide width. */
  border?: { width: number; color: string };
  shadow?: boolean;
}

export type TemplateBackground =
  | { kind: "color"; color: string }
  | { kind: "gradient"; from: string; to: string; angle: number }
  /** A photo covering the whole canvas (panorama under everything). */
  | { kind: "photo"; photo: number };

export interface Template {
  id: string;
  group: TemplateGroup;
  name: { en: string; vi: string };
  /** Number of photos used. For `perPhoto` templates: any number. */
  photos: number;
  /** Slides used; "any" keeps the project's slide count. */
  slides: number | "any";
  /** Grid-like: cells become slots (drag pans the photo, swap instead of move) and spacing applies. */
  gridded?: boolean;
  /** One slot per photo, one photo per slide (`slots[0]` is the pattern). */
  perPhoto?: boolean;
  background?: TemplateBackground;
  slots: TemplateSlot[];
}

export interface TemplateOptions {
  /** Gap between cells and around the edge, relative to slide width (gridded templates). */
  spacing: number;
  /** Corner radius relative to slide width (gridded templates). */
  radius: number;
  /** Background color behind cells (gridded templates). */
  color: string;
}

export const DEFAULT_OPTIONS: TemplateOptions = { spacing: 0.015, radius: 0, color: "#ffffff" };

export type { Border };
