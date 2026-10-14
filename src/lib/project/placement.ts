import { centeredRect, coverCrop } from "./geometry";
import { type ImageAsset, type ImageElement, type ProjectDoc, type Rect, SLIDE_SIZE, newId } from "./types";

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
  };
}

/**
 * Initial placement for freshly added photos:
 * - first photo of an empty project → panorama across all slides,
 * - several photos into an empty project → one per slide starting at `firstSlide`,
 * - photos added to a project that already has content → floating on the current slide.
 */
export function placeImages(doc: ProjectDoc, assets: ImageAsset[], firstSlide = 0): ImageElement[] {
  const slide = SLIDE_SIZE[doc.ratio];
  const empty = doc.elements.length === 0;

  if (empty && assets.length === 1) {
    return [imageElement(assets[0], { x: 0, y: 0, width: slide.width * doc.slideCount, height: slide.height })];
  }
  if (empty) {
    return assets.map((asset, i) => {
      const index = Math.min(firstSlide + i, doc.slideCount - 1);
      return imageElement(asset, { x: index * slide.width, y: 0, width: slide.width, height: slide.height });
    });
  }
  return assets.map((asset, i) => {
    const box = centeredRect({ width: slide.width * 0.7, height: slide.height * 0.7 }, asset.width / asset.height);
    const offset = i * 40;
    return imageElement(asset, {
      x: firstSlide * slide.width + slide.width * 0.15 + box.x + offset,
      y: slide.height * 0.15 + box.y + offset,
      width: box.width,
      height: box.height,
    });
  });
}
