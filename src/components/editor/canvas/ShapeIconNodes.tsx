"use client";

import type Konva from "konva";
import { Image as KImage, Shape } from "react-konva";
import { iconDataUrl } from "@/lib/elements/icons";
import { drawShape, strokePath } from "@/lib/elements/shapes";
import { drawWidget, type WidgetData } from "@/lib/elements/widgets";
import type { DrawingElement, IconElement, ShapeElement } from "@/lib/project/types";
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

/** Card widgets (D-114): drawn on the canvas from their texts, scaled to the box. */
export function WidgetNode({ element: el, widget, hooks }: { element: IconElement; widget: WidgetData; hooks: DragHooks }) {
  const props = useNodeHandlers(el, hooks);
  return (
    <Shape
      {...props}
      width={el.width}
      height={el.height}
      sceneFunc={(ctx: Konva.Context) => drawWidget(ctx._context, widget, el.color, el.width)}
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
  const image = useHtmlImage(iconDataUrl(el.icon, el.color, size, el.svg));
  return <KImage {...props} image={image ?? undefined} width={el.width} height={el.height} />;
}

/** Freehand drawing (M11): strokes scaled to the box; resizing scales the line width too. */
export function DrawingNode({ element: el, hooks }: { element: DrawingElement; hooks: DragHooks }) {
  const props = useNodeHandlers(el, hooks, (k) => ({ strokeWidth: el.strokeWidth * k }));
  return (
    <Shape
      {...props}
      width={el.width}
      height={el.height}
      sceneFunc={(ctx: Konva.Context) => {
        const c = ctx._context;
        c.save();
        c.strokeStyle = el.color;
        c.lineWidth = el.strokeWidth;
        c.lineCap = "round";
        c.lineJoin = "round";
        for (const st of el.strokes) {
          strokePath(c, st.map((v, i) => v * (i % 2 === 0 ? el.width : el.height)));
          c.stroke();
        }
        c.restore();
      }}
      hitFunc={(ctx: Konva.Context, shape: Konva.Shape) => {
        ctx.beginPath();
        ctx.rect(0, 0, el.width, el.height);
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
    />
  );
}
