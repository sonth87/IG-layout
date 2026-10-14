// Project data model. All coordinates are in export pixels: one slide is
// SLIDE_SIZE[ratio] wide/high, and the canvas is slideCount slides side by side.
// See docs/architecture/overview.md ("Mô hình canvas nhiều slide").

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

export interface ImageElement {
  id: string;
  type: "image";
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export type CanvasElement = ImageElement;

export interface ProjectDoc {
  type: ProjectType;
  ratio: AspectRatio;
  slideCount: number;
  background: string;
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
