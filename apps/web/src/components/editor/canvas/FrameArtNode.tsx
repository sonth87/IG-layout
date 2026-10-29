"use client";

import { Image as KImage } from "react-konva";
import type { LayoutElement } from "@ig-layout/core/project/types";
import { useEditor } from "@/store/editor";
import { useHtmlImage } from "./useHtmlImage";

/**
 * The art of a pack frame (M20 C4), drawn right above the frame's cells so the photos show
 * only through its windows. Not hit: taps go to the cells (windows) or the block (frame).
 */
export function FrameArtNode({ block }: { block: LayoutElement }) {
  const url = useEditor((s) => (block.art ? s.assets[block.art.assetId]?.url : undefined));
  const image = useHtmlImage(url);
  if (!image) return null;
  return (
    <KImage
      image={image}
      listening={false}
      x={block.x + block.width / 2}
      y={block.y + block.height / 2}
      width={block.width}
      height={block.height}
      offsetX={block.width / 2}
      offsetY={block.height / 2}
      rotation={block.rotation}
      opacity={block.opacity}
      visible={!block.hidden}
    />
  );
}
