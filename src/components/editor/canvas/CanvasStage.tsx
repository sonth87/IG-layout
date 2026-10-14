"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Layer, Line, Stage, Transformer } from "react-konva";
import { rotatedBounds } from "@/lib/project/geometry";
import { snap, snapTargets } from "@/lib/project/snap";
import { canvasSize, type CanvasElement } from "@/lib/project/types";
import { useEditor, useViewDoc } from "@/store/editor";
import { BackgroundNode } from "./BackgroundNode";
import { ImageNode } from "./ImageNode";
import { IconNode, ShapeNode } from "./ShapeIconNodes";
import { TextNode } from "./TextNode";

const SNAP_SCREEN_PX = 8;

/** Lives in its own layer so selection handles never end up in exports. */
function SelectionTransformer({ selectedId }: { selectedId: string | null }) {
  const trRef = useRef<Konva.Transformer>(null);
  const elements = useViewDoc()?.elements;

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedId ? tr.getStage()?.findOne(`#${selectedId}`) : undefined;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, elements]);

  return (
    <Transformer
      ref={trRef}
      keepRatio
      rotateEnabled
      anchorSize={18}
      anchorCornerRadius={9}
      borderStroke="#f2b84b"
      borderStrokeWidth={2}
      anchorStroke="#f2b84b"
      anchorFill="#ffffff"
      rotateAnchorOffset={36}
      rotationSnaps={[0, 90, 180, 270]}
      rotationSnapTolerance={4}
      enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
      ignoreStroke
    />
  );
}

interface Pinch {
  node: Konva.Node;
  dist: number;
  angle: number;
  mid: { x: number; y: number };
  rotation: number;
  pos: { x: number; y: number };
}

function touchInfo(stage: Konva.Stage, touches: TouchList) {
  const rect = stage.container().getBoundingClientRect();
  const a = { x: touches[0].clientX - rect.left, y: touches[0].clientY - rect.top };
  const b = { x: touches[1].clientX - rect.left, y: touches[1].clientY - rect.top };
  return {
    dist: Math.hypot(b.x - a.x, b.y - a.y),
    angle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
    mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
  };
}

interface Props {
  viewScale: number;
  contentLayerRef: React.RefObject<Konva.Layer | null>;
}

export default function CanvasStage({ viewScale, contentLayerRef }: Props) {
  const doc = useViewDoc();
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const setCanvas = useEditor((s) => s.setCanvas);
  const updateElement = useEditor((s) => s.updateElement);
  const [guides, setGuides] = useState<{ xs: number[]; ys: number[] }>({ xs: [], ys: [] });
  const targets = useRef<{ xs: number[]; ys: number[] } | null>(null);
  const pinch = useRef<Pinch | null>(null);

  // Expose the content layer for thumbnails (autosave) and export.
  useEffect(() => {
    const layer = contentLayerRef.current;
    if (layer) setCanvas({ layer, viewScale });
    return () => setCanvas(null);
  }, [contentLayerRef, viewScale, setCanvas]);

  if (!doc) return null;
  const { width, height, slide } = canvasSize(doc);

  function onDragMove(node: Konva.Node, el: CanvasElement) {
    targets.current ??= snapTargets(doc!, el.id);
    const bounds = rotatedBounds({
      x: node.x() - el.width / 2,
      y: node.y() - el.height / 2,
      width: el.width,
      height: el.height,
      rotation: node.rotation(),
    });
    const result = snap(bounds, targets.current, SNAP_SCREEN_PX / viewScale);
    node.position({ x: node.x() + result.dx, y: node.y() + result.dy });
    setGuides((g) =>
      g.xs.join() === result.guidesX.join() && g.ys.join() === result.guidesY.join()
        ? g
        : { xs: result.guidesX, ys: result.guidesY },
    );
  }

  function onDragEnd() {
    targets.current = null;
    setGuides({ xs: [], ys: [] });
  }

  // Two fingers: pinch to scale + rotate the selected element (one history step on release).
  function onTouchMove(e: Konva.KonvaEventObject<TouchEvent>) {
    const stage = e.target.getStage();
    const touches = e.evt.touches;
    if (!stage || !selectedId || touches.length !== 2) return;
    e.evt.preventDefault();
    const info = touchInfo(stage, touches);
    if (!pinch.current) {
      const node = stage.findOne(`#${selectedId}`);
      if (!node) return;
      node.stopDrag();
      node.draggable(false);
      pinch.current = { node, ...info, rotation: node.rotation(), pos: node.position() };
      return;
    }
    const p = pinch.current;
    const k = info.dist / p.dist;
    p.node.scale({ x: k, y: k });
    p.node.rotation(p.rotation + info.angle - p.angle);
    p.node.position({
      x: p.pos.x + (info.mid.x - p.mid.x) / viewScale,
      y: p.pos.y + (info.mid.y - p.mid.y) / viewScale,
    });
    p.node.getLayer()?.batchDraw();
  }

  function onTouchEnd(e: Konva.KonvaEventObject<TouchEvent>) {
    const p = pinch.current;
    if (!p || e.evt.touches.length >= 2) return;
    pinch.current = null;
    p.node.draggable(true);
    const el = doc!.elements.find((x) => x.id === p.node.id());
    if (!el) return;
    const k = p.node.scaleX();
    p.node.scale({ x: 1, y: 1 });
    const w = Math.max(20, el.width * k);
    const h = Math.max(20, el.height * k);
    updateElement(el.id, { x: p.node.x() - w / 2, y: p.node.y() - h / 2, width: w, height: h, rotation: p.node.rotation() });
  }

  return (
    <Stage
      width={width * viewScale}
      height={height * viewScale}
      scaleX={viewScale}
      scaleY={viewScale}
      onMouseDown={(e) => e.target === e.target.getStage() && select(null)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Content layer: exactly what gets exported. */}
      <Layer ref={contentLayerRef}>
        <BackgroundNode background={doc.background} width={width} height={height} />
        {doc.elements.map((el) => {
          const hooks = { onDragMove, onDragEnd };
          if (el.type === "text") return <TextNode key={el.id} element={el} hooks={hooks} />;
          if (el.type === "shape") return <ShapeNode key={el.id} element={el} hooks={hooks} />;
          if (el.type === "icon") return <IconNode key={el.id} element={el} hooks={hooks} />;
          return <ImageNode key={el.id} element={el} onDragMove={onDragMove} onDragEnd={onDragEnd} />;
        })}
      </Layer>
      {/* Slide boundaries, never exported. */}
      <Layer listening={false}>
        {Array.from({ length: doc.slideCount - 1 }, (_, i) => (
          <Line
            key={i}
            points={[(i + 1) * slide.width, 0, (i + 1) * slide.width, height]}
            stroke="#ffffff"
            strokeWidth={2 / viewScale}
            dash={[10 / viewScale, 8 / viewScale]}
            shadowColor="#000000"
            shadowBlur={2 / viewScale}
            shadowOpacity={0.6}
          />
        ))}
      </Layer>
      {/* Selection + snapping guides, never exported. */}
      <Layer>
        {guides.xs.map((x) => (
          <Line key={`x${x}`} points={[x, 0, x, height]} stroke="#ff4fa3" strokeWidth={1.5 / viewScale} listening={false} />
        ))}
        {guides.ys.map((y) => (
          <Line key={`y${y}`} points={[0, y, width, y]} stroke="#ff4fa3" strokeWidth={1.5 / viewScale} listening={false} />
        ))}
        <SelectionTransformer selectedId={selectedId} />
      </Layer>
    </Stage>
  );
}
