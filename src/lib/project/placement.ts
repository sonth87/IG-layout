import { NO_ADJUST } from "@/lib/color/params";
import { centeredRect, coverCrop } from "./geometry";
import { canvasSize, slideRect } from "./layout";
import { type ImageAsset, type ImageElement, type ProjectDoc, type Rect, newId } from "./types";

export function imageElement(asset: Pick<ImageAsset, "id" | "width" | "height">, frame: Rect): ImageElement {
  return {
    id: newId(),
    type: "image",
    assetId: asset.id,
    ...frame,
    rotation: 0,
    opacity: 1,
    crop: coverCrop(asset, frame),
    straighten: 0,
    flipX: false,
    flipY: false,
    mask: "none",
    cornerRadius: 40,
    border: null,
    shadow: false,
    slot: false,
    adjust: { ...NO_ADJUST },
    filter: null,
    frame: "none",
  };
}

/**
 * Initial placement for freshly added photos:
 * - first photo of an empty project → panorama across all slides,
 * - several photos into an empty project → one per slide starting at `firstSlide`,
 * - photos added to a project that already has content → floating on the current slide.
 */
export function placeImages(doc: ProjectDoc, assets: ImageAsset[], firstSlide = 0): ImageElement[] {
  const empty = doc.elements.length === 0;

  if (empty && assets.length === 1) {
    const size = canvasSize(doc);
    return [imageElement(assets[0], { x: 0, y: 0, width: size.width, height: size.height })];
  }
  if (empty) {
    return assets.map((asset, i) => imageElement(asset, slideRect(doc, Math.min(firstSlide + i, doc.slideCount - 1))));
  }
  return assets.map((asset, i) => {
    const slide = slideRect(doc, firstSlide);
    const box = centeredRect({ width: slide.width * 0.7, height: slide.height * 0.7 }, asset.width / asset.height);
    const offset = i * 40;
    return imageElement(asset, {
      x: slide.x + slide.width * 0.15 + box.x + offset,
      y: slide.y + slide.height * 0.15 + box.y + offset,
      width: box.width,
      height: box.height,
    });
  });
}
