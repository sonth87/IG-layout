import { imageElement } from "@/lib/project/placement";
import {
  type FrameStyle,
  type IconElement,
  type ImageElement,
  newId,
  type ShapeElement,
  type ShapeKind,
  SLIDE_SIZE,
  type AspectRatio,
  type TextElement,
  type Rect,
} from "@/lib/project/types";
import { defaultShapeSize } from "./shapes";

// New elements, centered on a slide (M5).

/** Box of the given size centered on `slide` (a slide rect from lib/project/layout). */
function centered(_ratio: AspectRatio, slide: Rect, width: number, height: number) {
  return { x: slide.x + (slide.width - width) / 2, y: slide.y + (slide.height - height) / 2, width, height };
}

export function newText(ratio: AspectRatio, slide: Rect, text: string): TextElement {
  const s = SLIDE_SIZE[ratio];
  const fontSize = Math.round(s.width * 0.09);
  return {
    id: newId(),
    type: "text",
    ...centered(ratio, slide, s.width * 0.8, fontSize * 1.2),
    rotation: 0,
    opacity: 1,
    text,
    font: "playfair",
    bold: true,
    fontSize,
    color: "#ffffff",
    align: "center",
    letterSpacing: 0,
    lineHeight: 1.15,
    stroke: null,
    shadow: false,
    // A soft dark box keeps white text readable on light and dark photos alike (UX-12).
    background: { color: "#1a1b1ecc", padding: Math.round(fontSize * 0.3), radius: Math.round(fontSize * 0.25) },
  };
}

export function newShape(ratio: AspectRatio, slide: Rect, shape: ShapeKind, fill: string): ShapeElement {
  const size = defaultShapeSize(shape, SLIDE_SIZE[ratio].width);
  return { id: newId(), type: "shape", ...centered(ratio, slide, size.width, size.height), rotation: 0, opacity: 1, shape, fill };
}

export function newIcon(ratio: AspectRatio, slide: Rect, icon: string, color: string): IconElement {
  const size = SLIDE_SIZE[ratio].width * 0.22;
  return { id: newId(), type: "icon", ...centered(ratio, slide, size, size), rotation: 0, opacity: 1, icon, color };
}

/** An empty photo frame (tap "Add photo" to fill it). */
export function newFramedPhoto(ratio: AspectRatio, slide: Rect, frame: FrameStyle): ImageElement {
  const s = SLIDE_SIZE[ratio];
  const w = s.width * 0.6;
  const h = frame === "polaroid" ? w * 1.2 : frame === "film" ? w * 0.8 : w;
  const el = { ...imageElement({ id: "", width: w, height: h }, centered(ratio, slide, w, h)), assetId: null };
  el.frame = frame;
  el.rotation = frame === "polaroid" ? -4 : 0;
  el.shadow = frame !== "film";
  return el;
}
