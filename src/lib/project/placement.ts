import { type ImageAsset, type ImageElement, type ProjectDoc, SLIDE_SIZE, newId } from "./types";

/** Size and position that make the image cover the box (centered). */
export function cover(
  asset: Pick<ImageAsset, "width" | "height">,
  box: { x: number; y: number; width: number; height: number },
) {
  const scale = Math.max(box.width / asset.width, box.height / asset.height);
  const width = asset.width * scale;
  const height = asset.height * scale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}

/**
 * Initial placement for freshly added photos:
 * - one photo → panorama across all slides,
 * - several photos → one per slide starting at `firstSlide`, extras stacked on the last slide.
 */
export function placeImages(
  doc: ProjectDoc,
  assets: ImageAsset[],
  firstSlide = 0,
): ImageElement[] {
  const slide = SLIDE_SIZE[doc.ratio];
  if (assets.length === 1 && doc.elements.length === 0) {
    const box = { x: 0, y: 0, width: slide.width * doc.slideCount, height: slide.height };
    return [{ id: newId(), type: "image", assetId: assets[0].id, rotation: 0, ...cover(assets[0], box) }];
  }
  return assets.map((asset, i) => {
    const index = Math.min(firstSlide + i, doc.slideCount - 1);
    const box = { x: index * slide.width, y: 0, width: slide.width, height: slide.height };
    return { id: newId(), type: "image", assetId: asset.id, rotation: 0, ...cover(asset, box) };
  });
}
