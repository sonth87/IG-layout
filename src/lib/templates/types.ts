import type { EventId } from "./seasons";
import type { AspectRatio, Border, CutoutText, FontKey, FrameStyle, MaskShape, ProjectType, ShapeKind } from "@/lib/project/types";

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
  frame?: FrameStyle;
}

/**
 * Decorative shape (film strip band, colour block, paper card, tape). Same coordinates as
 * slots. Drawn under the photos unless `above` (tape over a photo's edge).
 */
export interface TemplateShape {
  slide: number;
  x: number;
  y: number;
  w: number;
  h: number;
  shape: ShapeKind;
  fill: string;
  rotation?: number;
  opacity?: number;
  above?: boolean;
}

/**
 * A picture from a pack (M20) placed by a template (2026-10-28): a frame whose windows take
 * photos `photo`, `photo + 1`… (torn paper, stamp, film, instant…), or a sticker. Height
 * follows the picture. Ids are "pack/item" (see src/lib/templates/packArt.json).
 */
export interface TemplateArt {
  slide: number;
  x: number;
  y: number;
  w: number;
  id: string;
  /** Frames: number of the photo in the first window. */
  photo?: number;
  rotation?: number;
  opacity?: number;
  /** Stickers: drawn under the photo cells (a paper scrap behind photos). */
  under?: boolean;
}

/** A drawn sticker or doodle (lib/elements/stickers: "heart", "doodle-swirl"…). Height follows its shape. */
export interface TemplateIcon {
  slide: number;
  x: number;
  y: number;
  w: number;
  icon: string;
  /** Main colour; default: the sticker's own. */
  color?: string;
  rotation?: number;
  opacity?: number;
}

/** A card widget (D-114: weather, now playing, hashtag…) with its own texts. */
export interface TemplateWidget {
  slide: number;
  x: number;
  y: number;
  w: number;
  kind: string;
  variant?: string;
  /** Field texts replacing the samples. */
  fields?: Record<string, { en: string; vi: string }>;
  color?: string;
  rotation?: number;
}

/** Text placed by a template (designed templates, M10). Sizes relative to slide width. */
export interface TemplateText {
  slide: number;
  x: number;
  y: number;
  w: number;
  text: { en: string; vi: string };
  font: FontKey;
  /** Font size relative to slide width. */
  size: number;
  color: string;
  align?: "left" | "center" | "right";
  bold?: boolean;
  /** Relative to the font size. */
  letterSpacing?: number;
  lineHeight?: number;
  rotation?: number;
  /** Box behind the text. Padding relative to the font size; radius too (default 0.2). */
  background?: { color: string; padding: number; radius?: number };
  /** Outline; width relative to the font size. */
  stroke?: { color: string; width: number };
  italic?: boolean;
  shadow?: boolean;
  opacity?: number;
  /** Cut-out letters (D-141); missing fields take the defaults. */
  cutout?: Partial<CutoutText> & { style: string };
}

/** Where a designed template appears in the home library (M10). */
export type TemplateCategory =
  | "seasonal"
  | "cutout"
  | "carousel"
  | "travel"
  | "film"
  | "torn"
  | "scrapbook"
  | "doodle"
  | "teen"
  | "love"
  | "retro"
  | "editorial"
  | "seamless"
  | "collage"
  | "story"
  | "occasion"
  | "minimal"
  | "grid";

/** Home order (SCRL-like sections, 2026-10-28). Events in season come before all of these (seasons.ts). */
export const TEMPLATE_CATEGORIES: TemplateCategory[] = ["carousel", "cutout", "torn", "film", "travel", "scrapbook", "doodle", "teen", "love", "retro", "editorial", "seamless", "collage", "occasion", "story", "minimal", "grid", "seasonal"];

/** Kinds of sample photo a template's preview shows (public/samples, from Pexels). */
export type SampleTheme = "travel" | "beach" | "city" | "food" | "portrait" | "friends" | "couple" | "autumn" | "nature" | "minimal" | "mono" | "party" | "fashion" | "winter" | "christmas" | "lunar" | "spring" | "flowers" | "school" | "kids" | "retro" | "concert" | "mirror" | "ootd";

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
  /** Project types the layout suits (default: post + story). */
  types?: ProjectType[];
  background?: TemplateBackground;
  shapes?: TemplateShape[];
  texts?: TemplateText[];
  slots: TemplateSlot[];
  /** Pack frames and stickers, drawn after the slots in this order. */
  art?: TemplateArt[];
  /** Drawn stickers / doodles, above the art. */
  icons?: TemplateIcon[];
  widgets?: TemplateWidget[];
  /** Designed templates (home library): category and the format a new project starts with. */
  design?: { category: TemplateCategory; type: ProjectType; ratio: AspectRatio; themes?: SampleTheme[]; events?: EventId[] };
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
