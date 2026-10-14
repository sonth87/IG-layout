"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Circle, Group, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import { rotatedBounds } from "@/lib/project/geometry";
import { snap, snapTargets } from "@/lib/project/snap";
import { canvasSize, GRID_GAP, postingNumber, slideRect, STORY_SAFE } from "@/lib/project/layout";
import { scaleExtras } from "@/lib/elements/resize";
import type { CanvasElement } from "@/lib/project/types";
import { useEditor, useViewDoc } from "@/store/editor";
import { BackgroundNode } from "./BackgroundNode";
import { ImageNode } from "./ImageNode";
import { IconNode, ShapeNode } from "./ShapeIconNodes";
import { isTouchUI } from "./interaction";
import { TextNode } from "./TextNode";

const SNAP_SCREEN_PX = 8;
/** Max backing-store pixels per layer (~32 MB each). */
const MAX_LAYER_PIXELS = 8_000_000;

/**
 * Lives in its own layer so selection handles never end up in exports.
 * Grid cells and locked elements show the outline only (UX-09). Bigger handles on touch (UX-06).
 */
function SelectionTransformer({ selectedId }: { selectedId: string | null }) {
  const trRef = useRef<Konva.Transformer>(null);
  const elements = useViewDoc()?.elements;
  const el = elements?.find((e) => e.id === selectedId);
  const fixed = !!el && (el.locked || (el.type === "image" && el.slot));

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
      rotateEnabled={!fixed}
      resizeEnabled={!fixed}
      anchorSize={isTouchUI ? 26 : 16}
      anchorCornerRadius={13}
      borderStroke="#f2b84b"
      borderStrokeWidth={2}
      anchorStroke="#f2b84b"
      anchorFill="#ffffff"
      rotateAnchorOffset={isTouchUI ? 44 : 32}
      rotationSnaps={[0, 90, 180, 270]}
      rotationSnapTolerance={4}
      enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
      ignoreStroke
    />
  );
}

type Pinch =
  | { kind: "element"; node: Konva.Node; dist: number; angle: number; mid: { x: number; y: number }; rotation: number; pos: { x: number; y: number } }
  | { kind: "zoom"; dist: number; angle: number; mid: { x: number; y: number } };

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
  /** Story: show the areas covered by Instagram's UI. */
  showSafeZone?: boolean;
  /** Two-finger pinch on empty space: zoom the view (k = distance ratio since start). */
  onPinchZoom?: (k: number, phase: "start" | "move" | "end") => void;
}

export default function CanvasStage({ viewScale, contentLayerRef, showSafeZone = true, onPinchZoom }: Props) {
  const doc = useViewDoc();
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const setCanvas = useEditor((s) => s.setCanvas);
  const updateElement = useEditor((s) => s.updateElement);
  const [guides, setGuides] = useState<{ xs: number[]; ys: number[] }>({ xs: [], ys: [] });
  const targets = useRef<{ xs: number[]; ys: number[] } | null>(null);
  const pinch = useRef<Pinch | null>(null);

  // Cap each layer's backing store: a long strip at 3× pixel density can exceed
  // iOS Safari's canvas memory (M7). Display only — exports render separately.
  const stageRef = useRef<Konva.Stage>(null);
  const stageArea = doc ? canvasSize(doc) : null;
  const stagePixels = stageArea ? stageArea.width * stageArea.height * viewScale * viewScale : 0;
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !stagePixels) return;
    const ratio = Math.min(window.devicePixelRatio || 1, Math.sqrt(MAX_LAYER_PIXELS / stagePixels));
    for (const layer of stage.getLayers()) {
      if (Math.abs(layer.getCanvas().getPixelRatio() - ratio) < 0.01) continue;
      layer.getCanvas().setPixelRatio(ratio);
      layer.draw();
    }
  }, [stagePixels]);

  // Expose the content layer for thumbnails (autosave) and export.
  useEffect(() => {
    const layer = contentLayerRef.current;
    if (layer) setCanvas({ layer, viewScale });
    return () => setCanvas(null);
  }, [contentLayerRef, viewScale, setCanvas]);

  if (!doc) return null;
  const { width, height } = canvasSize(doc);
  const rects = Array.from({ length: doc.slideCount }, (_, i) => slideRect(doc, i));

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

  /**
   * Two fingers (UX-07): pinch / rotate the element under the fingers (selecting it),
   * or the selected one; on empty space, locked or grid-cell elements, zoom the canvas.
   * One history step on release.
   */
  function startPinch(stage: Konva.Stage, info: ReturnType<typeof touchInfo>) {
    const movable = (id: string | null | undefined) => {
      const el = doc!.elements.find((x) => x.id === id);
      return el && !el.locked && !(el.type === "image" && el.slot) ? el : undefined;
    };
    let target = movable(selectedId);
    if (!target) {
      let hit: Konva.Node | null = stage.getIntersection(info.mid);
      while (hit && !movable(hit.id())) hit = hit.getParent();
      target = movable(hit?.id());
      if (target) select(target.id);
    }
    if (!target) {
      onPinchZoom?.(1, "start");
      pinch.current = { kind: "zoom", ...info };
      return;
    }
    const node = stage.findOne(`#${target.id}`);
    if (!node) return;
    node.stopDrag();
    node.draggable(false);
    pinch.current = { kind: "element", node, ...info, rotation: node.rotation(), pos: node.position() };
  }

  function onTouchMove(e: Konva.KonvaEventObject<TouchEvent>) {
    const stage = e.target.getStage();
    const touches = e.evt.touches;
    if (!stage || touches.length !== 2) return;
    e.evt.preventDefault();
    const info = touchInfo(stage, touches);
    if (!pinch.current) return startPinch(stage, info);
    const p = pinch.current;
    const k = info.dist / p.dist;
    if (p.kind === "zoom") return onPinchZoom?.(k, "move");
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
    if (p.kind === "zoom") return onPinchZoom?.(1, "end");
    const el = doc!.elements.find((x) => x.id === p.node.id());
    p.node.draggable(!!el && !el.locked);
    if (!el) return;
    const k = p.node.scaleX();
    p.node.scale({ x: 1, y: 1 });
    const w = Math.max(20, el.width * k);
    const h = Math.max(20, el.height * k);
    updateElement(el.id, {
      x: p.node.x() - w / 2,
      y: p.node.y() - h / 2,
      width: w,
      height: h,
      rotation: p.node.rotation(),
      ...scaleExtras(el, k),
    });
  }

  return (
    <Stage
      ref={stageRef}
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
      {/* Slide boundaries, grid gaps, story safe zones, posting order — never exported. */}
      <Layer listening={false}>
        {doc.type === "grid" &&
          doc.grid?.gapCompensation &&
          rects.slice(1).map((r, i) => (
            // Gap strips are cut away on export: tint them so the user sees what disappears.
            <Group key={`gap${i}`}>
              {r.x > 0 && <Rect x={r.x - GRID_GAP} y={r.y} width={GRID_GAP} height={r.height} fill="rgba(255,79,163,0.35)" />}
              {r.y > 0 && r.x === 0 && <Rect x={0} y={r.y - GRID_GAP} width={width} height={GRID_GAP} fill="rgba(255,79,163,0.35)" />}
            </Group>
          ))}
        {[...new Set(rects.flatMap((r) => [r.x, r.x + r.width]))]
          .filter((x) => x > 0.5 && x < width - 0.5)
          .map((x) => (
            <Line
              key={`vx${x}`}
              points={[x, 0, x, height]}
              stroke="#ffffff"
              strokeWidth={2 / viewScale}
              dash={[10 / viewScale, 8 / viewScale]}
              shadowColor="#000000"
              shadowBlur={2 / viewScale}
              shadowOpacity={0.6}
            />
          ))}
        {[...new Set(rects.flatMap((r) => [r.y, r.y + r.height]))]
          .filter((y) => y > 0.5 && y < height - 0.5)
          .map((y) => (
            <Line
              key={`hy${y}`}
              points={[0, y, width, y]}
              stroke="#ffffff"
              strokeWidth={2 / viewScale}
              dash={[10 / viewScale, 8 / viewScale]}
              shadowColor="#000000"
              shadowBlur={2 / viewScale}
              shadowOpacity={0.6}
            />
          ))}
        {doc.type === "story" &&
          showSafeZone &&
          rects.map((r, i) => (
            <Group key={`safe${i}`}>
              <Rect x={r.x} y={r.y} width={r.width} height={STORY_SAFE.top} fill="rgba(242,139,130,0.28)" />
              <Rect
                x={r.x}
                y={r.y + r.height - STORY_SAFE.bottom}
                width={r.width}
                height={STORY_SAFE.bottom}
                fill="rgba(242,139,130,0.28)"
              />
              <Line points={[r.x, r.y + STORY_SAFE.top, r.x + r.width, r.y + STORY_SAFE.top]} stroke="#f28b82" strokeWidth={2 / viewScale} dash={[8 / viewScale, 6 / viewScale]} />
              <Line
                points={[r.x, r.y + r.height - STORY_SAFE.bottom, r.x + r.width, r.y + r.height - STORY_SAFE.bottom]}
                stroke="#f28b82"
                strokeWidth={2 / viewScale}
                dash={[8 / viewScale, 6 / viewScale]}
              />
            </Group>
          ))}
        {doc.type === "grid" &&
          rects.map((r, i) => {
            const n = postingNumber(doc, i);
            const radius = 22 / viewScale;
            return (
              <Group key={`num${i}`} x={r.x + r.width - radius * 1.6} y={r.y + r.height - radius * 1.6}>
                <Circle radius={radius} fill={n === 1 ? "#f2b84b" : "rgba(17,18,20,0.8)"} />
                <Text
                  text={String(n)}
                  width={radius * 2}
                  height={radius * 2}
                  offsetX={radius}
                  offsetY={radius}
                  align="center"
                  verticalAlign="middle"
                  fontSize={20 / viewScale}
                  fontStyle="700"
                  fill={n === 1 ? "#1a1408" : "#ffffff"}
                />
              </Group>
            );
          })}
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
