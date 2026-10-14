// Project data model. All coordinates are in export pixels: one slide is
// SLIDE_SIZE[ratio] wide/high, and the canvas is slideCount slides side by side.
// Full design: docs/architecture/editor-model.md.

import type { Adjustments, FilterRef } from "@/lib/color/params";

export type ProjectType = "post" | "story" | "grid";

export type AspectRatio = "1:1" | "4:5" | "3:4" | "9:16";

export const SLIDE_SIZE: Record<AspectRatio, { width: number; height: number }> = {
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
  "3:4": { width: 1080, height: 1440 },
  "9:16": { width: 1080, height: 1920 },
};

export const POST_RATIOS: AspectRatio[] = ["1:1", "4:5", "3:4"];

export const MAX_SLIDES = 20;

export interface ImageAsset {
  id: string;
  blob: Blob;
  /** Object URL of `blob`, used for rendering. */
  url: string;
  width: number;
  height: number;
  name: string;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const MASK_SHAPES = ["none", "rounded", "circle", "arch", "heart", "star", "hexagon", "blob"] as const;
export type MaskShape = (typeof MASK_SHAPES)[number];

export interface Border {
  width: number;
  color: string;
}

export type Background =
  | { kind: "color"; color: string }
  | { kind: "gradient"; from: string; to: string; angle: number }
  | { kind: "blur"; assetId: string };

interface ElementBase {
  id: string;
  /** Top-left of the frame before rotation. Rotation is around the frame center. */
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
}

export const FRAME_STYLES = ["none", "polaroid", "white", "film"] as const;
export type FrameStyle = (typeof FRAME_STYLES)[number];

export interface ImageElement extends ElementBase {
  type: "image";
  /** null = empty template slot. */
  assetId: string | null;
  /** Region of the image shown in the frame, in image pixels. */
  crop: Rect;
  /** Degrees; rotates the image inside the frame (auto-zoomed to keep it covered). */
  straighten: number;
  flipX: boolean;
  flipY: boolean;
  mask: MaskShape;
  /** For the "rounded" mask, in export pixels. */
  cornerRadius: number;
  border: Border | null;
  shadow: boolean;
  /** Template cell: dragging pans the photo inside instead of moving the frame. */
  slot: boolean;
  /** Manual colour adjustments (M4). */
  adjust: Adjustments;
  filter: FilterRef | null;
  /** Decorative frame around the photo (M5); the photo fills the inner area. */
  frame: FrameStyle;
}

export const FONT_KEYS = ["beVietnam", "playfair", "lora", "montserrat", "dancing", "spaceGrotesk"] as const;
export type FontKey = (typeof FONT_KEYS)[number];

export interface TextElement extends ElementBase {
  type: "text";
  text: string;
  font: FontKey;
  bold: boolean;
  /** Export pixels. `width` wraps the text; `height` follows the text (derived). */
  fontSize: number;
  color: string;
  align: "left" | "center" | "right";
  /** Export pixels. */
  letterSpacing: number;
  /** Multiplier of the font size. */
  lineHeight: number;
  stroke: Border | null;
  shadow: boolean;
  background: { color: string; padding: number; radius: number } | null;
}

export const SHAPES = ["rect", "roundRect", "circle", "triangle", "line", "arrow", "film"] as const;
export type ShapeKind = (typeof SHAPES)[number];

export interface ShapeElement extends ElementBase {
  type: "shape";
  shape: ShapeKind;
  fill: string;
}

export interface IconElement extends ElementBase {
  type: "icon";
  /** Key in lib/elements/icons.ts. */
  icon: string;
  color: string;
}

export type CanvasElement = ImageElement | TextElement | ShapeElement | IconElement;

export function isImage(el: CanvasElement | undefined): el is ImageElement {
  return el?.type === "image";
}

export interface ProjectDoc {
  type: ProjectType;
  ratio: AspectRatio;
  slideCount: number;
  background: Background;
  /** Back to front. */
  elements: CanvasElement[];
}

export function canvasSize(doc: Pick<ProjectDoc, "ratio" | "slideCount">) {
  const slide = SLIDE_SIZE[doc.ratio];
  return { width: slide.width * doc.slideCount, height: slide.height, slide };
}

export function newId() {
  return `id${Math.random().toString(36).slice(2, 10)}`;
}
