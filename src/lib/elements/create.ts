import { imageElement } from "@/lib/project/placement";
import {
  type BlendMode,
  type FrameStyle,
  type ImageAsset,
  type IconElement,
  type ImageElement,
  newId,
  type ShapeElement,
  type ShapeKind,
  slideSize,
  type AspectRatio,
  type TextElement,
  type Rect,
} from "@/lib/project/types";
import { defaultShapeSize } from "./shapes";
import { STICKERS } from "./stickers";

// New elements, centered on a slide (M5).

/** Box of the given size centered on `slide` (a slide rect from lib/project/layout). */
function centered(_ratio: AspectRatio, slide: Rect, width: number, height: number) {
  return { x: slide.x + (slide.width - width) / 2, y: slide.y + (slide.height - height) / 2, width, height };
}

/** New text box at the top-left corner of the slide in view (editor-v2/10 §1). */
export function newText(ratio: AspectRatio, slide: Rect, text: string): TextElement {
  const s = slideSize(ratio);
  const fontSize = Math.round(s.width * 0.09);
  const margin = Math.round(s.width * 0.06);
  return {
    id: newId(),
    type: "text",
    x: slide.x + margin,
    y: slide.y + margin,
    width: s.width * 0.8,
    height: fontSize * 1.2,
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
  const size = defaultShapeSize(shape, slideSize(ratio).width);
  return { id: newId(), type: "shape", ...centered(ratio, slide, size.width, size.height), rotation: 0, opacity: 1, shape, fill };
}

export function newIcon(ratio: AspectRatio, slide: Rect, icon: string, color: string): IconElement {
  const size = slideSize(ratio).width * 0.22;
  return { id: newId(), type: "icon", ...centered(ratio, slide, size, size), rotation: 0, opacity: 1, icon, color };
}

/** A sticker (M11): an icon element whose key is in the sticker set, at its own aspect. */
export function newSticker(ratio: AspectRatio, slide: Rect, key: string): IconElement {
  const st = STICKERS[key];
  const width = slideSize(ratio).width * (st.w > st.h * 1.6 ? 0.42 : 0.26);
  const height = (width * st.h) / st.w;
  return { id: newId(), type: "icon", ...centered(ratio, slide, width, height), rotation: 0, opacity: 1, icon: key, color: st.color };
}

/** An emoji sticker (Fluent Emoji, MIT): the SVG body is stored in the element. */
export function newEmoji(ratio: AspectRatio, slide: Rect, name: string, body: string): IconElement {
  const size = slideSize(ratio).width * 0.24;
  return { id: newId(), type: "icon", ...centered(ratio, slide, size, size), rotation: 0, opacity: 1, icon: `emoji:${name}`, color: "#000000", svg: body };
}

/** A generated overlay (M11) covering the slide, blended with what is below. */
export function newOverlay(slide: Rect, asset: ImageAsset, blend: BlendMode): ImageElement {
  return { ...imageElement(asset, { ...slide }), blend };
}

/** An empty photo frame (tap "Add photo" to fill it). */
export function newFramedPhoto(ratio: AspectRatio, slide: Rect, frame: FrameStyle): ImageElement {
  const s = slideSize(ratio);
  const w = s.width * 0.6;
  const h = frame === "polaroid" || frame === "polaroidBlack" ? w * 1.2 : frame === "film" ? w * 0.8 : w;
  const el = { ...imageElement({ id: "", width: w, height: h }, centered(ratio, slide, w, h)), assetId: null };
  el.frame = frame;
  el.rotation = frame === "polaroid" || frame === "polaroidBlack" ? -4 : 0;
  el.shadow = frame !== "film";
  return el;
}
