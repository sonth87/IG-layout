// Project data model. All coordinates are in export pixels: one slide is
// SLIDE_SIZE[ratio] wide/high, and the canvas is slideCount slides side by side.
// Full design: docs/architecture/editor-model.md.

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
}

export type CanvasElement = ImageElement;

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
