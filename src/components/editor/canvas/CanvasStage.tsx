"use client";

import Konva from "konva";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Circle, Group, Label, Layer, Line, Rect, Shape, Stage, Tag, Text, Transformer } from "react-konva";
import { rotatedBounds } from "@/lib/project/geometry";
import { snap, snapTargets } from "@/lib/project/snap";
import { canvasSize, GRID_GAP, postingNumber, slideRect, STORY_SAFE } from "@/lib/project/layout";
import { scaleExtras } from "@/lib/elements/resize";
import { strokePath } from "@/lib/elements/shapes";
import { type CanvasElement, type ImageAsset, type ImageElement, pansInside, type Rect as Box, slideSize } from "@/lib/project/types";
import { liveCrops } from "@/lib/project/liveCrop";
import { coverCrop, innerFrame } from "@/lib/project/geometry";
import { panCrop, wholePicture } from "@/lib/project/blocks";
import { endFollow, type Follow, follow, startFollow } from "./followers";
import { LayoutNode } from "./LayoutNode";
import { elementOf, tapResult } from "./selection";
import { useSettings } from "@/store/settings";
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
  if (!useSettings.getState().snap) return { rotation: r, snapped: false };
  const nearest = Math.round(r / 90) * 90;
  return Math.abs(r - nearest) <= ROTATE_SNAP ? { rotation: nearest === -180 ? 180 : nearest, snapped: true } : { rotation: r, snapped: false };
}

// Gesture smoothness (D-69): every frame of a drag redraws whole layers, and the cost
// grows with their pixel count. 2× is sharp on phones; 3× costs 2.25× the pixels.
// Exports render at their own pixel ratio, unaffected.
if (typeof window !== "undefined") Konva.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

/** Equal-size ruler colour (editor-v2/07 §4). */
const RULER = "#3b82f6";
/** Snap distance for equal sizes, screen px. */
const SIZE_SNAP = 6;
const PROXY_ID = "__whole-picture";

/**
 * Selection box (M14, editor-v2/07). Lives in its own layer so it never ends up in
 * exports. Corner handles keep the ratio, side bars stretch one way, the turn handle sits
 * below. A photo in a frame gets a box around the whole picture (zoom only). Locked
 * elements: outline only.
 */
function SelectionTransformer(props: {
  selected: CanvasElement | undefined;
  viewScale: number;
  onRotate: (deg: number | null) => void;
  onRuler: (matches: { w: number | null; h: number | null }) => void;
  onWholeZoom: (k: number, phase: "move" | "end") => void;
  onBlockTransform: (phase: "start" | "move" | "end") => void;
}) {
  const { selected: el, viewScale } = props;
  const trRef = useRef<Konva.Transformer>(null);
  const elements = useViewDoc()?.elements;
  const whole = !!el && pansInside(el);
  // A cell of a layout block follows its block: no handles of its own (M14 / M16).
  const fixed = !!el && (el.locked || !!el.parentId) && !whole;
  const isText = el?.type === "text";
  const snapOn = useSettings((s) => s.snap);

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const stage = tr.getStage();
    const node = !el ? undefined : stage?.findOne(`#${whole ? PROXY_ID : el.id}`);
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [el, whole, elements]);

  /** Sizes of every other element (screen px), for the equal-size ruler. */
  const others = () =>
    (elements ?? []).filter((o) => o.id !== el?.id && o.parentId !== el?.id && !o.hidden && o.type !== "layout").map((o) => ({ w: o.width * viewScale, h: o.height * viewScale }));

  return (
    <Transformer
      ref={trRef}
      keepRatio
      rotateEnabled={!fixed && !whole}
      resizeEnabled={!fixed}
      anchorSize={isTouchUI ? 22 : 14}
      anchorCornerRadius={11}
      borderStroke="#f2b84b"
      borderStrokeWidth={2}
      anchorStroke="#f2b84b"
      anchorFill="#ffffff"
      // Turn handle below the element (editor-v2/07 §3).
      rotateAnchorAngle={180}
      rotateAnchorOffset={isTouchUI ? 40 : 30}
      rotationSnaps={snapOn ? [0, 90, 180, 270] : []}
      rotationSnapTolerance={ROTATE_SNAP}
      enabledAnchors={
        whole
          ? ["top-left", "top-right", "bottom-left", "bottom-right"]
          : isText
            ? ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right"]
            : ["top-left", "top-right", "bottom-left", "bottom-right", "top-center", "bottom-center", "middle-left", "middle-right"]
      }
      anchorStyleFunc={(anchor) => {
        // Side handles are short bars along the edge.
        const n = anchor.name();
        const s = isTouchUI ? 22 : 14;
        if (n.includes("top-center") || n.includes("bottom-center")) {
          anchor.width(s * 1.3);
          anchor.height(s * 0.42);
          anchor.offsetX((s * 1.3) / 2);
          anchor.offsetY((s * 0.42) / 2);
          anchor.cornerRadius(s * 0.21);
        } else if (n.includes("middle-left") || n.includes("middle-right")) {
          anchor.width(s * 0.42);
          anchor.height(s * 1.3);
          anchor.offsetX((s * 0.42) / 2);
          anchor.offsetY((s * 1.3) / 2);
          anchor.cornerRadius(s * 0.21);
        }
      }}
      boundBoxFunc={(oldBox, box) => {
        if (whole || Math.abs(box.rotation) > 0.01 || !snapOn) return box;
        // Equal sizes (editor-v2/07 §4): stick to another element's width / height.
        const anchor = trRef.current?.getActiveAnchor() ?? "";
        const sizes = others();
        const corner = !anchor.includes("center") && !anchor.includes("middle");
        let w: number | null = null;
        let h: number | null = null;
        if (corner || anchor.includes("middle")) w = sizes.find((o) => Math.abs(o.w - box.width) < SIZE_SNAP)?.w ?? null;
        if (!w && (corner || anchor.includes("center"))) h = sizes.find((o) => Math.abs(o.h - box.height) < SIZE_SNAP)?.h ?? null;
        props.onRuler({ w: w && w / viewScale, h: h && h / viewScale });
        if (!w && !h) return box;
        const next = { ...box };
        if (w) {
          next.width = w;
          if (corner) next.height = (box.height * w) / box.width;
        } else if (h) {
          next.height = h;
          if (corner) next.width = (box.width * h) / box.height;
        }
        if (anchor.includes("left")) next.x = box.x + box.width - next.width;
        if (anchor.includes("top")) next.y = box.y + box.height - next.height;
        return next.width < 5 || next.height < 5 ? oldBox : next;
      }}
      onTransformStart={() => el?.type === "layout" && props.onBlockTransform("start")}
      onTransform={(e) => {
        if (trRef.current?.getActiveAnchor() === "rotater") props.onRotate(e.target.rotation());
        if (whole) props.onWholeZoom(e.target.scaleX(), "move");
        if (el?.type === "layout") props.onBlockTransform("move");
      }}
      onTransformEnd={(e) => {
        props.onRotate(null);
        props.onRuler({ w: null, h: null });
        if (whole) props.onWholeZoom(e.target.scaleX(), "end");
        if (el?.type === "layout") props.onBlockTransform("end");
      }}
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
      /** A layout block: its cells follow (M14). */
      follow?: Follow;
    }
  | { kind: "zoom"; dist: number; angle: number; mid: { x: number; y: number } }
  /** Pinch on a selected cell / locked photo: zoom the picture inside its frame. */
  | { kind: "crop"; el: ImageElement; dist: number; angle: number; mid: { x: number; y: number } }
  /** Fingers down but nothing to act on (a locked element is selected). */
  | { kind: "none"; dist: number; angle: number; mid: { x: number; y: number } };

/** One-finger / mouse gesture in progress (M14, dev/editor-v2 §4). */
interface Gesture {
  pointerId: number;
  mouse: boolean;
  /** Where it started: client px, and the canvas scroll then. */
  sx: number;
  sy: number;
  scroll: { x: number; y: number };
  target: Konva.Node;
  moved: boolean;
  /** Decided once, when the finger first moves (editor-v2/06 rules 1 and 4). */
  mode: null | "canvas" | "move" | "pan" | "none";
  el?: CanvasElement;
  node?: Konva.Node;
  start?: { x: number; y: number };
  follow?: Follow;
  crop?: Box;
}

/** Crop of `el` zoomed by `k` around its centre: from "just covers the frame" up to 5×. */
function zoomCrop(el: ImageElement, asset: ImageAsset, k: number): Box {
  const max = coverCrop(asset, innerFrame(el));
  const w = Math.min(max.width, Math.max(max.width / 5, el.crop.width / k));
  const h = (w * el.crop.height) / el.crop.width;
  const cx = el.crop.x + el.crop.width / 2;
  const cy = el.crop.y + el.crop.height / 2;
  return {
    x: Math.max(0, Math.min(asset.width - w, cx - w / 2)),
    y: Math.max(0, Math.min(asset.height - h, cy - h / 2)),
    width: w,
    height: h,
  };
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
  /** Double tap where there is no element: back to "see every slide" (editor-v2/05 §2.4). */
  onFit?: () => void;
}

export default function CanvasStage({ viewScale, viewport, scrollRef, origin, contentLayerRef, showSafeZone = true, onPinchZoom, onFit }: Props) {
  const doc = useViewDoc();
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const setCanvas = useEditor((s) => s.setCanvas);
  const updateElement = useEditor((s) => s.updateElement);
  /** Snapping guides are drawn straight into Konva: no React render per drag frame (F-01). */
  const guidesRef = useRef<Konva.Group>(null);
  const rulerRef = useRef<Konva.Group>(null);
  const drawing = useEditor((s) => s.drawing);
  const addStroke = useEditor((s) => s.addStroke);
  /** Stroke being drawn (M11): drawn live into a Konva line, saved on release. */
  const liveRef = useRef<Konva.Shape>(null);
  const live = useRef<{ points: number[]; pointers: Set<number> }>({ points: [], pointers: new Set() });
  const angleRef = useRef<Konva.Label>(null);
  const shownGuides = useRef("");
  const targets = useRef<{ xs: number[]; ys: number[] } | null>(null);
  const pinch = useRef<Pinch | null>(null);
  const lastEmptyTap = useRef(0);
  /** Latest pinch handlers, for the native listeners below. */
  const touchRef = useRef<{ move: (e: TouchEvent) => void; end: (e: TouchEvent) => void } | null>(null);
  const gesture = useRef<Gesture | null>(null);
  /** Cells following a layout block being transformed with the handles. */
  const blockFollow = useRef<Follow | null>(null);
  const proxyRef = useRef<Konva.Rect>(null);
  const setEditingText = useEditor((s) => s.setEditingText);
  const selected = doc?.elements.find((e) => e.id === selectedId);

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
    // M14 (editor-v2/06): with something selected, a one-finger gesture anywhere acts on
    // it; with nothing selected, the page scrolls the canvas as usual.
    const owned = (e: TouchEvent) => {
      if (e.touches.length >= 2 || useEditor.getState().drawing) return true;
      const s = useEditor.getState();
      const el = (s.draft ?? s.doc)?.elements.find((x) => x.id === s.selectedId);
      return !!el && (!el.locked || pansInside(el));
    };
    let gesture = false;
    const onStart = (e: TouchEvent) => {
      gesture = owned(e);
      if (gesture && e.cancelable) e.preventDefault();
    };
    const onMove = (e: TouchEvent) => {
      if ((gesture || Konva.isDragging() || e.touches.length >= 2) && e.cancelable) e.preventDefault();
    };
    // Pinch: listened to natively on the whole scrolling area, so neither a finger on a
    // selection handle (which stops Konva's events) nor one on the slide buttons under
    // the canvas keeps it from starting.
    const area = scrollRef.current ?? box;
    const pinchMove = (e: TouchEvent) => touchRef.current?.move(e);
    const pinchEnd = (e: TouchEvent) => touchRef.current?.end(e);
    box.addEventListener("touchstart", onStart, { passive: false });
    box.addEventListener("touchmove", onMove, { passive: false });
    area.addEventListener("touchmove", pinchMove, { passive: false });
    area.addEventListener("touchend", pinchEnd);
    area.addEventListener("touchcancel", pinchEnd);
    return () => {
      box.removeEventListener("touchstart", onStart);
      box.removeEventListener("touchmove", onMove);
      area.removeEventListener("touchmove", pinchMove);
      area.removeEventListener("touchend", pinchEnd);
      area.removeEventListener("touchcancel", pinchEnd);
    };
  }, [hasDoc, scrollRef]);

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
      applyMotion(layer, d, t, makeSlideDuration(d, st.assets, length), slideSize(d.ratio));
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

  // The native pinch listeners call this render's handlers. They are function
  // declarations further down (hoisted), only called after this render has finished.
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    touchRef.current = { move: onTouchMove, end: onTouchEnd };
  });

  if (!doc) return null;
  const { width, height } = canvasSize(doc);

  /** Konva attrs of the whole-picture box of a framed photo. */
  function wholeAttrs(el: ImageElement) {
    const asset = useEditor.getState().assets[el.assetId!];
    if (!asset) return {};
    const w = wholePicture(el, el.crop, asset);
    return { x: w.x, y: w.y, width: w.width, height: w.height, offsetX: w.width / 2, offsetY: w.height / 2, rotation: w.rotation };
  }
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
    // Snap off (project ⋯ → Snap): no guides, nothing sticks.
    if (!useSettings.getState().snap) return;
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
    cancelGesture();
    // A finger may have landed on a handle of a small element: the pinch takes over.
    const tr = stage.findOne<Konva.Transformer>("Transformer");
    if (tr?.isTransforming()) tr.stopTransform();
    // M14 (editor-v2/06): fingers act on the selected element; nothing selected → the canvas.
    const sel = selected;
    if (!sel) {
      onPinchZoom?.(1, "start");
      pinch.current = { kind: "zoom", ...info };
      return;
    }
    if (sel.type === "image" && pansInside(sel)) {
      pinch.current = { kind: "crop", el: sel, ...info };
      return;
    }
    const node = stage.findOne(`#${sel.id}`);
    if (sel.locked || sel.parentId || !node) {
      pinch.current = { kind: "none", ...info };
      return;
    }
    pinch.current = {
      kind: "element",
      node,
      ...info,
      rotation: node.rotation(),
      pos: node.position(),
      rotating: false,
      snapped: false,
      follow: sel.type === "layout" ? startFollow(node, sel.cells.map((c) => c.id)) : undefined,
    };
  }

  // ── One finger / mouse (M14, dev/editor-v2 §4) ───────────────────────
  const TAP_SLOP = 6;

  function cancelGesture() {
    const g = gesture.current;
    gesture.current = null;
    if (!g?.moved) return;
    if (g.mode === "move" && g.node && g.start) {
      g.node.position(g.start);
      if (g.follow) endFollow(g.follow);
      onDragEnd();
    }
    if (g.mode === "pan" && g.el) liveCrops.delete(g.el.id);
    stageRef.current?.fire("gestureend");
    contentLayerRef.current?.batchDraw();
  }

  function onPointerDown(e: Konva.KonvaEventObject<PointerEvent>) {
    if (drawing) return onDrawDown(e);
    if (!e.evt.isPrimary) return cancelGesture(); // a second finger: pinch takes over
    // Selection handles are handled by the transformer itself.
    if (e.target.getParent() instanceof Konva.Transformer) return;
    const area = scrollRef.current;
    gesture.current = {
      pointerId: e.evt.pointerId,
      mouse: e.evt.pointerType === "mouse",
      sx: e.evt.clientX,
      sy: e.evt.clientY,
      scroll: { x: area?.scrollLeft ?? 0, y: area?.scrollTop ?? 0 },
      target: e.target,
      moved: false,
      mode: null,
    };
  }

  function onPointerMove(e: Konva.KonvaEventObject<PointerEvent>) {
    if (drawing) return onDrawMove(e);
    const g = gesture.current;
    if (!g || e.evt.pointerId !== g.pointerId || pinch.current) return;
    const dx = e.evt.clientX - g.sx;
    const dy = e.evt.clientY - g.sy;
    if (!g.moved) {
      if (Math.hypot(dx, dy) < TAP_SLOP) return;
      g.moved = true;
      const sel = selected;
      if (!sel) g.mode = "canvas";
      else if (sel.type === "image" && pansInside(sel)) {
        g.mode = "pan";
        g.el = sel;
        g.crop = sel.crop;
      } else if (sel.locked || sel.parentId) g.mode = "none";
      else {
        const node = e.target.getStage()?.findOne(`#${sel.id}`);
        g.mode = node ? "move" : "none";
        g.el = sel;
        g.node = node;
        g.start = node?.position();
        if (node && sel.type === "layout") g.follow = startFollow(node, sel.cells.map((c) => c.id));
      }
      if (g.mode === "move" || g.mode === "pan") e.target.getStage()?.fire("gesturestart");
    }
    if (g.mode === "canvas") {
      // Touch scrolls natively; the mouse drags the canvas around.
      const area = scrollRef.current;
      if (g.mouse && area) {
        area.scrollLeft = g.scroll.x - dx;
        area.scrollTop = g.scroll.y - dy;
      }
    } else if (g.mode === "move" && g.node && g.start && g.el) {
      g.node.position({ x: g.start.x + dx / viewScale, y: g.start.y + dy / viewScale });
      onDragMove(g.node, g.el);
      if (g.follow) follow(g.follow);
      g.node.getLayer()?.batchDraw();
    } else if (g.mode === "pan" && g.el?.type === "image" && g.crop) {
      const asset = useEditor.getState().assets[g.el.assetId!];
      if (!asset) return;
      liveCrops.set(g.el.id, panCrop(g.el, g.crop, asset, dx / viewScale, dy / viewScale));
      placeProxy();
      contentLayerRef.current?.batchDraw();
    }
  }

  function onPointerUp(e: Konva.KonvaEventObject<PointerEvent>) {
    if (drawing) return onDrawUp(e);
    const g = gesture.current;
    if (!g || e.evt.pointerId !== g.pointerId) return;
    gesture.current = null;
    if (!g.moved) return onTap(g.target, e.evt.timeStamp);
    if (g.mode === "move" || g.mode === "pan") e.target.getStage()?.fire("gestureend");
    if (g.mode === "move" && g.node && g.el) {
      const p = g.node.position();
      if (g.follow) endFollow(g.follow);
      onDragEnd();
      updateElement(g.el.id, { x: p.x - g.el.width / 2, y: p.y - g.el.height / 2 });
    } else if (g.mode === "pan" && g.el) {
      const crop = liveCrops.get(g.el.id);
      liveCrops.delete(g.el.id);
      if (crop) updateElement(g.el.id, { crop });
    }
  }

  /** A tap (editor-v2/06 rules 2, 3, 5, 6). */
  function onTap(target: Konva.Node, time: number) {
    const st = useEditor.getState();
    // While typing, a tap outside the text box ends typing; the text stays selected (editor-v2/10 §7).
    if (st.editingTextId) return st.setEditingText(null);
    const d = st.draft ?? st.doc;
    if (!d) return;
    const hitId = elementOf(target, d.elements);
    const hit = d.elements.find((x) => x.id === hitId);
    // Swapping two cell photos: the next photo tapped is the other one.
    if (st.swapFrom && hit?.type === "image") return select(hit.id);
    let onPlus = false;
    if (hit?.type === "image" && !hit.assetId) {
      const p = target.getStage()?.getRelativePointerPosition();
      const inner = innerFrame(hit);
      const r = Math.max((Math.min(inner.width, inner.height) * 0.12), 22 / viewScale);
      onPlus = !!p && Math.hypot(p.x - (hit.x + hit.width / 2), p.y - (hit.y + hit.height / 2)) <= r;
    }
    if (!hitId) {
      if (time - lastEmptyTap.current < 320) onFit?.();
      lastEmptyTap.current = time;
    }
    const res = tapResult(d, st.selectedId, hitId, onPlus);
    select(res.select);
    if (res.action === "editText" && res.select) setEditingText(res.select);
    // Fill frame sheet for that cell (editor-v2/09 §1.1).
    if (res.action === "fill" && res.select) st.openFillFrame(res.select, "fill");
  }

  /** The box around the whole picture of the selected framed photo follows its crop. */
  function placeProxy() {
    const proxy = proxyRef.current;
    const st = useEditor.getState();
    const el = (st.draft ?? st.doc)?.elements.find((x) => x.id === st.selectedId);
    if (!proxy || el?.type !== "image" || !pansInside(el)) return;
    const asset = st.assets[el.assetId!];
    if (!asset) return;
    const w = wholePicture(el, liveCrops.get(el.id) ?? el.crop, asset);
    proxy.setAttrs({ x: w.x, y: w.y, width: w.width, height: w.height, offsetX: w.width / 2, offsetY: w.height / 2, rotation: w.rotation, scaleX: 1, scaleY: 1 });
    proxy.getLayer()?.batchDraw();
  }

  /** Corner handles of the whole-picture box zoom the photo inside its frame. */
  function onWholeZoom(k: number, phase: "move" | "end") {
    const el = selected;
    if (el?.type !== "image") return;
    const asset = useEditor.getState().assets[el.assetId!];
    if (!asset) return;
    const crop = zoomCrop(el, asset, k);
    if (phase === "move") {
      liveCrops.set(el.id, crop);
      contentLayerRef.current?.batchDraw();
      return;
    }
    liveCrops.delete(el.id);
    proxyRef.current?.scale({ x: 1, y: 1 });
    updateElement(el.id, { crop });
  }

  /** Cells follow their block while it is resized / turned with the handles. */
  function onBlockTransform(phase: "start" | "move" | "end") {
    const el = selected;
    const node = el && stageRef.current?.findOne(`#${el.id}`);
    if (el?.type !== "layout" || !node) return;
    if (phase === "start") blockFollow.current = startFollow(node, el.cells.map((c) => c.id));
    else if (phase === "move" && blockFollow.current) follow(blockFollow.current);
    else if (phase === "end") {
      if (blockFollow.current) endFollow(blockFollow.current);
      blockFollow.current = null;
      const sx = node.scaleX();
      const sy = node.scaleY();
      node.scale({ x: 1, y: 1 });
      const w = Math.max(20, el.width * sx);
      const h = Math.max(20, el.height * sy);
      updateElement(el.id, { x: node.x() - w / 2, y: node.y() - h / 2, width: w, height: h, rotation: node.rotation() });
    }
  }

  /** Equal-size rulers (editor-v2/07 §4) on the selected element and every match. */
  function showRuler(m: { w: number | null; h: number | null }) {
    const group = rulerRef.current;
    if (!group) return;
    group.destroyChildren();
    const node = selected && stageRef.current?.findOne(`#${selected.id}`);
    if (node && (m.w || m.h)) {
      const self = node.getClientRect({ relativeTo: stageRef.current! });
      const boxes = [
        self,
        ...(doc!.elements
          .filter((o) => o.id !== selected!.id && o.parentId !== selected!.id && !o.hidden && o.type !== "layout")
          .filter((o) => (m.w ? Math.abs(o.width - m.w) < 0.5 : Math.abs(o.height - m.h!) < 0.5))
          .map((o) => rotatedBounds(o))),
      ];
      const gap = 12 / viewScale;
      const tick = 7 / viewScale;
      const line = { stroke: RULER, strokeWidth: 2 / viewScale, listening: false };
      for (const b of boxes) {
        if (m.w) {
          const y = b.y - gap;
          group.add(new Konva.Line({ points: [b.x, y, b.x + b.width, y], ...line }));
          group.add(new Konva.Line({ points: [b.x, y - tick, b.x, y + tick], ...line }));
          group.add(new Konva.Line({ points: [b.x + b.width, y - tick, b.x + b.width, y + tick], ...line }));
        } else {
          const x = b.x - gap;
          group.add(new Konva.Line({ points: [x, b.y, x, b.y + b.height], ...line }));
          group.add(new Konva.Line({ points: [x - tick, b.y, x + tick, b.y], ...line }));
          group.add(new Konva.Line({ points: [x - tick, b.y + b.height, x + tick, b.y + b.height], ...line }));
        }
      }
    }
    group.getLayer()?.batchDraw();
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

  function onTouchMove(evt: TouchEvent) {
    if (drawing) return;
    const stage = stageRef.current;
    const touches = evt.touches;
    if (!stage || touches.length !== 2) return;
    if (evt.cancelable) evt.preventDefault();
    const info = touchInfo(stage, touches);
    if (!pinch.current) return startPinch(stage, info);
    const p = pinch.current;
    const k = info.dist / p.dist;
    if (p.kind === "zoom") return onPinchZoom?.(k, "move");
    if (p.kind === "none") return;
    if (p.kind === "crop") {
      const asset = useEditor.getState().assets[p.el.assetId!];
      if (asset) liveCrops.set(p.el.id, zoomCrop(p.el, asset, k));
      return contentLayerRef.current?.batchDraw();
    }
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
    if (p.follow) follow(p.follow);
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

  function onTouchEnd(evt: TouchEvent) {
    const p = pinch.current;
    if (!p || evt.touches.length >= 2) return;
    pinch.current = null;
    showAngle(null);
    if (p.kind === "zoom") return onPinchZoom?.(1, "end");
    if (p.kind === "none") return;
    if (p.kind === "crop") {
      const crop = liveCrops.get(p.el.id);
      liveCrops.delete(p.el.id);
      if (crop) updateElement(p.el.id, { crop });
      return;
    }
    const el = doc!.elements.find((x) => x.id === p.node.id());
    if (p.follow) endFollow(p.follow);
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
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={drawing ? onDrawUp : cancelGesture}
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
          if (el.type === "layout") return <LayoutNode key={el.id} element={el} />;
          return <ImageNode key={el.id} element={el} />;
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
        <Group ref={rulerRef} name="rulers" listening={false} />
        {selected?.type === "image" && pansInside(selected) && (
          // Stands for the whole picture of the selected framed photo (box + zoom handles).
          <Rect ref={proxyRef} id={PROXY_ID} listening={false} {...wholeAttrs(selected)} />
        )}
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
        <SelectionTransformer
          selected={selected}
          viewScale={viewScale}
          onRotate={showAngle}
          onRuler={showRuler}
          onWholeZoom={onWholeZoom}
          onBlockTransform={onBlockTransform}
        />
        <Label ref={angleRef} visible={false} listening={false}>
          <Tag fill="rgba(17,18,20,0.85)" cornerRadius={12} pointerDirection="none" />
          <Text text="" fill="#ffffff" fontSize={14} fontStyle="700" padding={7} offsetX={0} />
        </Label>
      </Layer>
    </Stage>
  );
}
