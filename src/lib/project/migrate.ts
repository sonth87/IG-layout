import type { Background, ImageElement, ProjectDoc } from "./types";

// Upgrades docs saved by older versions (M1 prototype) to the current model.
// Old image elements had no crop (they were drawn uncropped, possibly larger
// than the canvas) and the background was a plain color string.

type LegacyDoc = Omit<ProjectDoc, "background" | "elements"> & {
  background: Background | string;
  elements: Partial<ImageElement>[];
};

export function migrateDoc(raw: ProjectDoc | LegacyDoc, assetSize: (id: string) => { width: number; height: number } | undefined): ProjectDoc {
  const background: Background =
    typeof raw.background === "string" ? { kind: "color", color: raw.background } : raw.background;

  const elements = raw.elements.map((el): ImageElement => {
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
    };
  });

  return { ...raw, background, elements };
}
