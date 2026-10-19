"use client";

import type Konva from "konva";
import { useRef } from "react";
import { Image as KImage, Shape } from "react-konva";
import { iconDataUrl } from "@/lib/elements/icons";
import { drawShape, strokePath } from "@/lib/elements/shapes";
import { drawWidget, type WidgetData, widgetSize } from "@/lib/elements/widgets";
import { useEditor } from "@/store/editor";
import type { DrawingElement, IconElement, ShapeElement } from "@/lib/project/types";
import { useFx } from "./useFx";
import { useHtmlImage } from "./useHtmlImage";
import { type DragHooks, useNodeHandlers } from "./useNodeHandlers";

export function ShapeNode({ element: el, hooks }: { element: ShapeElement; hooks: DragHooks }) {
  const props = useNodeHandlers(el, hooks);
  const fxRef = useFx<Konva.Shape>(el);
  return (
    <Shape
      ref={fxRef}
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

/**
 * Card widgets (D-114): drawn on the canvas from their texts, scaled to the box. A side
 * handle stretches the layout instead (owner, 2026-10-20): wider card, longer route line,
 * same text size; the height follows. Widgets that cannot widen just scale.
 */
export function WidgetNode({ element: el, widget, hooks }: { element: IconElement; widget: WidgetData; hooks: DragHooks }) {
  const props = useNodeHandlers(el, hooks);
  const fxRef = useFx<Konva.Shape>(el);
  const updateLive = useEditor((s) => s.updateLive);
  /** The stretched layout while a side handle is dragged. */
  const live = useRef<WidgetData | null>(null);
  const sideOf = (node: Konva.Node) => (node.getStage()?.findOne<Konva.Transformer>("Transformer")?.getActiveAnchor() ?? "").includes("middle");
  /** The layout `sx` times as wide (base units), if this widget can widen; else null. */
  const stretched = (sx: number) => {
    const base = widgetSize(widget, el.color);
    const next = { ...widget, bw: base.w * sx };
    const size = widgetSize(next, el.color);
    return Math.abs(size.w - base.w * sx) < 2 ? { next, size, k: el.width / base.w } : null;
  };
  return (
    <Shape
      ref={fxRef}
      {...props}
      width={el.width}
      height={el.height}
      sceneFunc={(ctx: Konva.Context, shape: Konva.Shape) => drawWidget(ctx._context, live.current ?? widget, el.color, shape.width())}
      hitFunc={(ctx: Konva.Context, shape: Konva.Shape) => {
        ctx.beginPath();
        ctx.rect(0, 0, shape.width(), shape.height());
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
      onTransform={(e) => {
        const node = e.target as Konva.Shape;
        if (!sideOf(node)) return;
        const r = stretched((node.width() * node.scaleX()) / el.width);
        if (!r) return;
        // Draw the wider layout at the same scale, keeping the top edge.
        const h0 = node.height() * node.scaleY();
        const nw = r.size.w * r.k;
        const nh = r.size.h * r.k;
        live.current = r.next;
        node.scale({ x: 1, y: 1 });
        node.size({ width: nw, height: nh });
        node.offset({ x: nw / 2, y: nh / 2 });
        node.y(node.y() + (nh - h0) / 2);
      }}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Shape;
        const next = live.current;
        live.current = null;
        if (!next) return props.onTransformEnd(e);
        const nw = node.width() * node.scaleX();
        const nh = node.height() * node.scaleY();
        node.scale({ x: 1, y: 1 });
        updateLive(el.id, { widget: next, x: node.x() - nw / 2, y: node.y() - nh / 2, width: nw, height: nh, rotation: node.rotation() });
      }}
    />
  );
}

/** Icons are SVG images rasterised at (about) the size they are drawn, so they stay sharp. */
export function IconNode({ element: el, hooks }: { element: IconElement; hooks: DragHooks }) {
  const props = useNodeHandlers(el, hooks);
  const size = Math.max(128, Math.ceil(Math.max(el.width, el.height) / 128) * 128);
  const image = useHtmlImage(iconDataUrl(el.icon, el.color, size, el.svg));
  const fxRef = useFx<Konva.Image>(el, [image]);
  return <KImage ref={fxRef} {...props} image={image ?? undefined} width={el.width} height={el.height} />;
}

/** Freehand drawing (M11): strokes scaled to the box; resizing scales the line width too. */
export function DrawingNode({ element: el, hooks }: { element: DrawingElement; hooks: DragHooks }) {
  const props = useNodeHandlers(el, hooks, (k) => ({ strokeWidth: el.strokeWidth * k }));
  const fxRef = useFx<Konva.Shape>(el);
  return (
    <Shape
      ref={fxRef}
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
