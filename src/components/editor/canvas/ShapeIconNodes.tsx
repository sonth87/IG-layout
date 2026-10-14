"use client";

import type Konva from "konva";
import { Image as KImage, Shape } from "react-konva";
import { iconDataUrl } from "@/lib/elements/icons";
import { drawShape } from "@/lib/elements/shapes";
import type { IconElement, ShapeElement } from "@/lib/project/types";
import { useHtmlImage } from "./useHtmlImage";
import { type DragHooks, useNodeHandlers } from "./useNodeHandlers";

export function ShapeNode({ element: el, hooks }: { element: ShapeElement; hooks: DragHooks }) {
  const props = useNodeHandlers(el, hooks);
  return (
    <Shape
      {...props}
      width={el.width}
      height={el.height}
      sceneFunc={(ctx: Konva.Context) => drawShape(ctx._context, el.shape, el.width, el.height, el.fill)}
      hitFunc={(ctx: Konva.Context, shape: Konva.Shape) => {
        ctx.beginPath();
        ctx.rect(0, 0, el.width, el.height);
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
    />
  );
}

/** Icons are SVG images rasterised at (about) the size they are drawn, so they stay sharp. */
export function IconNode({ element: el, hooks }: { element: IconElement; hooks: DragHooks }) {
  const props = useNodeHandlers(el, hooks);
  const size = Math.max(128, Math.ceil(Math.max(el.width, el.height) / 128) * 128);
  const image = useHtmlImage(iconDataUrl(el.icon, el.color, size));
  return <KImage {...props} image={image ?? undefined} width={el.width} height={el.height} />;
}
