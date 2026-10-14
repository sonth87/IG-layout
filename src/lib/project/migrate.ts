import { NO_ADJUST } from "@/lib/color/params";
import type { Background, CanvasElement, ImageElement, ProjectDoc } from "./types";

// Upgrades docs saved by older versions to the current model:
// - M1: image elements had no crop; background was a plain color string.
// - M2–M5: image fields added over time (slot, adjust, filter, frame).
// Elements without a `type` are images (M1). Text / shape / icon (M5+) pass through.

type LegacyDoc = Omit<ProjectDoc, "background" | "elements"> & {
  background: Background | string;
  elements: (Partial<ImageElement> | CanvasElement)[];
};

type AssetSize = (id: string) => { width: number; height: number } | undefined;

function migrateImage(el: Partial<ImageElement>, assetSize: AssetSize): ImageElement {
  const size = el.assetId ? assetSize(el.assetId) : undefined;
  return {
    id: el.id!,
    type: "image",
    assetId: el.assetId ?? null,
    x: el.x ?? 0,
    y: el.y ?? 0,
    width: el.width ?? 100,
    height: el.height ?? 100,
    rotation: el.rotation ?? 0,
    opacity: el.opacity ?? 1,
    crop: el.crop ?? { x: 0, y: 0, width: size?.width ?? 1, height: size?.height ?? 1 },
    straighten: el.straighten ?? 0,
    flipX: el.flipX ?? false,
    flipY: el.flipY ?? false,
    mask: el.mask ?? "none",
    cornerRadius: el.cornerRadius ?? 40,
    border: el.border ?? null,
    shadow: el.shadow ?? false,
    slot: el.slot ?? false,
    adjust: { ...NO_ADJUST, ...el.adjust },
    filter: el.filter ?? null,
    frame: el.frame ?? "none",
  };
}

export function migrateDoc(raw: ProjectDoc | LegacyDoc, assetSize: AssetSize): ProjectDoc {
  const background: Background =
    typeof raw.background === "string" ? { kind: "color", color: raw.background } : raw.background;
  const elements = raw.elements.map((el): CanvasElement =>
    !el.type || el.type === "image" ? migrateImage(el as Partial<ImageElement>, assetSize) : (el as CanvasElement),
  );
  return { ...raw, background, elements };
}
