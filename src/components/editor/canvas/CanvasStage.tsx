"use client";

import Konva from "konva";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Circle, Group, Label, Layer, Line, Rect, Shape, Stage, Tag, Text, Transformer } from "react-konva";
import { rotatedBounds } from "@/lib/project/geometry";
import { snap, snapTargets } from "@/lib/project/snap";
import { canvasSize, GRID_GAP, postingNumber, slideRect, STORY_SAFE } from "@/lib/project/layout";
import { scaleExtras } from "@/lib/elements/resize";
import { strokePath } from "@/lib/elements/shapes";
import { type CanvasElement, type ImageAsset, SLIDE_SIZE } from "@/lib/project/types";
import { useEditor, useViewDoc } from "@/store/editor";
import { BackgroundNode } from "./BackgroundNode";
import { ImageNode } from "./ImageNode";
import { DrawingNode, IconNode, ShapeNode } from "./ShapeIconNodes";
import { isTouchUI } from "./interaction";
import { applyMotion, clearMotion, hasMotion, makeSlideDuration, motionDuration } from "@/lib/motion/motion";
import { defaultMedia, setExtraDuration, setFrameHook, setRedraw, timelineLength } from "@/lib/video/playback";
import { TextNode } from "./TextNode";

const SNAP_SCREEN_PX = 8;
/** Two-finger twist ignored below this, so a pinch doesn't tilt the photo (F-02). */
const ROTATE_DEAD_ZONE = 8;
/** Rotation sticks to 0 / 90 / 180 / 270° within this many degrees (F-02). */
const ROTATE_SNAP = 6;

/** Rotation with snapping to right angles; `snapped` = it stuck to one. */
export function snapRotation(deg: number): { rotation: number; snapped: boolean } {
  const r = ((((deg + 180) % 360) + 360) % 360) - 180; // -180..180
  const nearest = Math.round(r / 90) * 90;
  return Math.abs(r - nearest) <= ROTATE_SNAP ? { rotation: nearest === -180 ? 180 : nearest, snapped: true } : { rotation: r, snapped: false };
}

// Gesture smoothness (D-69): every frame of a drag redraws whole layers, and the cost
// grows with their pixel count. 2× is sharp on phones; 3× costs 2.25× the pixels.
// Exports render at their own pixel ratio, unaffected.
if (typeof window !== "undefined") Konva.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

/**
 * Lives in its own layer so selection handles never end up in exports.
 * Grid cells and locked elements show the outline only (UX-09). Bigger handles on touch (UX-06).
 */
function SelectionTransformer({ selectedId, onRotate }: { selectedId: string | null; onRotate: (deg: number | null) => void }) {
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
      rotationSnapTolerance={ROTATE_SNAP}
      onTransform={(e) => {
        if (trRef.current?.getActiveAnchor() === "rotater") onRotate(e.target.rotation());
      }}
      onTransformEnd={() => onRotate(null)}
      enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
      ignoreStroke
    />
  );
}

type Pinch =
  | {
      kind: "element";
      node: Konva.Node;
      dist: number;
      angle: number;
      mid: { x: number; y: number };
      rotation: number;
      pos: { x: number; y: number };
      /** The twist passed the dead zone: rotation follows the fingers from then on. */
      rotating: boolean;
      snapped: boolean;
    }
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
  /** Size of the visible area: the stage covers only that (D-69). */
  viewport: { width: number; height: number };
  /** The scrolling element, and where the canvas origin is inside its content (px). */
  scrollRef: React.RefObject<HTMLDivElement | null>;
  origin: { x: number; y: number };
  contentLayerRef: React.RefObject<Konva.Layer | null>;
  /** Story: show the areas covered by Instagram's UI. */
  showSafeZone?: boolean;
  /** Two-finger pinch on empty space: zoom the view (k = distance ratio since start). */
  onPinchZoom?: (k: number, phase: "start" | "move" | "end") => void;
}

export default function CanvasStage({ viewScale, viewport, scrollRef, origin, contentLayerRef, showSafeZone = true, onPinchZoom }: Props) {
  const doc = useViewDoc();
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const setCanvas = useEditor((s) => s.setCanvas);
  const updateElement = useEditor((s) => s.updateElement);
  /** Snapping guides are drawn straight into Konva: no React render per drag frame (F-01). */
  const guidesRef = useRef<Konva.Group>(null);
  const drawing = useEditor((s) => s.drawing);
  const addStroke = useEditor((s) => s.addStroke);
  /** Stroke being drawn (M11): drawn live into a Konva line, saved on release. */
  const liveRef = useRef<Konva.Shape>(null);
  const live = useRef<{ points: number[]; pointers: Set<number> }>({ points: [], pointers: new Set() });
  const angleRef = useRef<Konva.Label>(null);
  const shownGuides = useRef("");
  const targets = useRef<{ xs: number[]; ys: number[] } | null>(null);
  const pinch = useRef<Pinch | null>(null);

  // The stage stays put (sticky) over the visible area; scrolling shifts its content.
  // Layers are only as big as the screen, whatever the number of slides (D-69).
  const stageRef = useRef<Konva.Stage>(null);
  const hasDoc = !!doc;
  // Touch: a gesture on the selected element (or with two fingers) belongs to the canvas,
  // not to the page. Decided at touchstart, the only moment the browser lets us stop
  // its scrolling for the whole gesture. Otherwise the item and the page both move.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const box = stage.container();
    const owned = (e: TouchEvent) => {
      if (e.touches.length >= 2 || useEditor.getState().drawing) return true;
      const r = box.getBoundingClientRect();
      const t = e.touches[0];
      let hit: Konva.Node | null = stage.getIntersection({ x: t.clientX - r.left, y: t.clientY - r.top });
      const s = useEditor.getState();
      while (hit && hit.id() !== s.selectedId) hit = hit.getParent();
      const el = hit && (s.draft ?? s.doc)?.elements.find((x) => x.id === s.selectedId);
      return !!el && !el.locked;
    };
    let gesture = false;
    const onStart = (e: TouchEvent) => {
      gesture = owned(e);
      if (gesture && e.cancelable) e.preventDefault();
    };
    const onMove = (e: TouchEvent) => {
      if ((gesture || Konva.isDragging()) && e.cancelable) e.preventDefault();
    };
    box.addEventListener("touchstart", onStart, { passive: false });
    box.addEventListener("touchmove", onMove, { passive: false });
    return () => {
      box.removeEventListener("touchstart", onStart);
      box.removeEventListener("touchmove", onMove);
    };
  }, [hasDoc]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const area = scrollRef.current;
    if (!stage || !area) return;
    let frame = 0;
    const place = () => {
      frame = 0;
      stage.position({ x: origin.x - area.scrollLeft, y: origin.y - area.scrollTop });
      stage.batchDraw();
    };
    place();
    const onScroll = () => (frame ||= requestAnimationFrame(place));
    area.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      area.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [scrollRef, origin.x, origin.y, viewScale, viewport.width, viewport.height, hasDoc]);

  // Videos redraw the canvas as they play / seek (M13.1); animations follow the clock (M13.3).
  useEffect(() => {
    setRedraw(() => contentLayerRef.current?.batchDraw());
    setFrameHook((t, active) => {
      const layer = contentLayerRef.current;
      const st = useEditor.getState();
      const d = st.draft ?? st.doc;
      if (!layer || !d) return;
      if (!active) return clearMotion(layer, d);
      const length = (el: CanvasElement, a: ImageAsset) => timelineLength((el.type === "image" && el.media) || defaultMedia(a.video!.duration));
      applyMotion(layer, d, t, makeSlideDuration(d, st.assets, length), SLIDE_SIZE[d.ratio]);
    });
    return () => {
      setRedraw(() => {});
      setFrameHook(() => {});
    };
  }, [contentLayerRef]);
  // Animations or music make the project playable even without video (M13.3, M13.4).
  const animated = !!doc?.elements.some(hasMotion) || !!doc?.music;
  const animationLength = doc ? motionDuration(doc) : 0;
  useEffect(() => setExtraDuration(animated ? animationLength : 0), [animated, animationLength]);

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
    showGuides(result.guidesX, result.guidesY);
  }

  function onDragEnd() {
    targets.current = null;
    showGuides([], []);
  }

  function showGuides(xs: number[], ys: number[]) {
    const group = guidesRef.current;
    const key = `${xs}|${ys}`;
    if (!group || key === shownGuides.current) return;
    shownGuides.current = key;
    group.destroyChildren();
    const stroke = { stroke: "#ff4fa3", strokeWidth: 1.5 / viewScale, listening: false };
    for (const x of xs) group.add(new Konva.Line({ points: [x, 0, x, height], ...stroke }));
    for (const y of ys) group.add(new Konva.Line({ points: [0, y, width, y], ...stroke }));
    group.getLayer()?.batchDraw();
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
    pinch.current = { kind: "element", node, ...info, rotation: node.rotation(), pos: node.position(), rotating: false, snapped: false };
  }

  function drawLive() {
    liveRef.current?.getLayer()?.batchDraw();
  }

  function onDrawDown(e: Konva.KonvaEventObject<PointerEvent>) {
    const l = live.current;
    l.pointers.add(e.evt.pointerId);
    // A second finger cancels the stroke (it was probably a pinch).
    if (l.pointers.size > 1) l.points = [];
    else {
      const p = e.target.getStage()!.getRelativePointerPosition()!;
      l.points = [p.x, p.y];
    }
    drawLive();
  }

  function onDrawMove(e: Konva.KonvaEventObject<PointerEvent>) {
    const l = live.current;
    if (l.pointers.size !== 1 || l.points.length === 0) return;
    const p = e.target.getStage()!.getRelativePointerPosition()!;
    const lx = l.points[l.points.length - 2];
    const ly = l.points[l.points.length - 1];
    if (Math.hypot(p.x - lx, p.y - ly) * viewScale < 2) return; // skip tiny moves
    l.points.push(p.x, p.y);
    drawLive();
  }

  function onDrawUp(e: Konva.KonvaEventObject<PointerEvent>) {
    const l = live.current;
    l.pointers.delete(e.evt.pointerId);
    if (l.points.length >= 2 && l.pointers.size === 0) addStroke(l.points);
    l.points = [];
    drawLive();
  }

  function onTouchMove(e: Konva.KonvaEventObject<TouchEvent>) {
    if (drawing) return;
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
    let twist = ((info.angle - p.angle + 540) % 360) - 180;
    if (!p.rotating && Math.abs(twist) > ROTATE_DEAD_ZONE) p.rotating = true;
    if (p.rotating) {
      twist -= Math.sign(twist) * Math.min(Math.abs(twist), ROTATE_DEAD_ZONE); // no jump when it starts
      const r = snapRotation(p.rotation + twist);
      if (r.snapped && !p.snapped) navigator.vibrate?.(8);
      p.snapped = r.snapped;
      p.node.rotation(r.rotation);
      showAngle(r.rotation);
    }
    p.node.position({
      x: p.pos.x + (info.mid.x - p.mid.x) / viewScale,
      y: p.pos.y + (info.mid.y - p.mid.y) / viewScale,
    });
    p.node.getLayer()?.batchDraw();
  }

  /** Angle badge at the top of the visible area while rotating (F-02). */
  function showAngle(deg: number | null) {
    const badge = angleRef.current;
    const stage = badge?.getStage();
    if (!badge || !stage) return;
    badge.visible(deg !== null);
    if (deg !== null) {
      badge.findOne<Konva.Text>("Text")?.text(`${Math.round(deg)}°`);
      badge.offsetX(badge.width() / 2);
      badge.absolutePosition({ x: stage.width() / 2, y: 14 });
      badge.scale({ x: 1 / viewScale, y: 1 / viewScale });
    }
    badge.getLayer()?.batchDraw();
  }

  function onTouchEnd(e: Konva.KonvaEventObject<TouchEvent>) {
    const p = pinch.current;
    if (!p || e.evt.touches.length >= 2) return;
    pinch.current = null;
    showAngle(null);
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
      width={viewport.width}
      height={viewport.height}
      scaleX={viewScale}
      scaleY={viewScale}
      onMouseDown={(e) => e.target === e.target.getStage() && select(null)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onPointerDown={drawing ? onDrawDown : undefined}
      onPointerMove={drawing ? onDrawMove : undefined}
      onPointerUp={drawing ? onDrawUp : undefined}
      onPointerCancel={drawing ? onDrawUp : undefined}
    >
      {/* Content layer: exactly what gets exported. */}
      {/* The stage also covers the margins around the canvas: clip to the canvas. */}
      <Layer ref={contentLayerRef} clipX={0} clipY={0} clipWidth={width} clipHeight={height} listening={!drawing}>
        <BackgroundNode background={doc.background} width={width} height={height} />
        {doc.elements.map((el) => {
          const hooks = { onDragMove, onDragEnd };
          if (el.type === "text") return <TextNode key={el.id} element={el} hooks={hooks} />;
          if (el.type === "shape") return <ShapeNode key={el.id} element={el} hooks={hooks} />;
          if (el.type === "icon") return <IconNode key={el.id} element={el} hooks={hooks} />;
          if (el.type === "drawing") return <DrawingNode key={el.id} element={el} hooks={hooks} />;
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
        <Group ref={guidesRef} listening={false} />
        {drawing && (
          // Strokes of the drawing in progress + the live one (not exported until ✓).
          <Shape
            ref={liveRef}
            listening={false}
            sceneFunc={(ctx) => {
              const c = ctx._context;
              c.save();
              c.strokeStyle = drawing.color;
              c.lineWidth = drawing.size;
              c.lineCap = "round";
              c.lineJoin = "round";
              for (const st of [...drawing.strokes, live.current.points]) {
                if (st.length < 2) continue;
                strokePath(c, st);
                c.stroke();
              }
              c.restore();
            }}
          />
        )}
        <SelectionTransformer selectedId={selectedId} onRotate={showAngle} />
        <Label ref={angleRef} visible={false} listening={false}>
          <Tag fill="rgba(17,18,20,0.85)" cornerRadius={12} pointerDirection="none" />
          <Text text="" fill="#ffffff" fontSize={14} fontStyle="700" padding={7} offsetX={0} />
        </Label>
      </Layer>
    </Stage>
  );
}
