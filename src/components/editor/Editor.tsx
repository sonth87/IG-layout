"use client";

import type Konva from "konva";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LayoutPicker } from "@/components/layout/LayoutPicker";
import { Icon, type IconName } from "@/components/ui/Icon";
import { newText } from "@/lib/elements/create";
import { canvasSize, slideAt, slideRect } from "@/lib/project/layout";
import { fixedCell, type ImageAsset, isImage } from "@/lib/project/types";
import { flushSave, useSaveStatus } from "@/store/autosave";
import { useEditor, useViewDoc } from "@/store/editor";
import { WEB_FONTS } from "@/lib/text/webfonts";
import { useSettings, useT } from "@/store/settings";
import CanvasStage from "./canvas/CanvasStage";
import { isTouchUI } from "./canvas/interaction";
import { type Action, ActionSheet, CoachTips, LayersSheet } from "./EditorSheets";
import { ExportSheet } from "./ExportSheet";
import { RemoveBgDialog } from "./RemoveBgDialog";
import { FloatingMenu } from "./FloatingMenu";
import { NewSlideSheet } from "./NewSlideSheet";
import { PositionTool } from "./tools/PositionTool";
import { PreviewScreen } from "./PreviewScreen";
import { ProjectMenu } from "./ProjectMenu";
import { PhotoEditScreen } from "./tools/PhotoEditScreen";
import { MaskScreen } from "./tools/MaskScreen";
import { BlockAdjustTool, BlockLayoutTool } from "./tools/BlockTools";
import { FillFrameSheet } from "./FillFrameSheet";
import { fillTargets, MAX_FREE_PHOTOS } from "@/lib/project/fill";
import { SlideControls } from "./SlideControls";
import { CropGestures } from "./crop/CropGestures";
import { rotatedBounds } from "@/lib/project/geometry";
import { CropPanel, ratioAspect, type RatioKey } from "./crop/CropPanel";
import { DrawTool } from "./tools/DrawTool";
import { SoundTool } from "./tools/SoundTool";
import { TrimTool } from "./tools/TrimTool";
import { AnimationTool } from "./tools/AnimationTool";
import { MusicTool } from "./tools/MusicTool";
import { PlaybackBar } from "./PlaybackBar";
import { hasMotion } from "@/lib/motion/motion";
import { attachMusic, detachMusic, pause as pausePlayback, resetPlayback, seek, usePlayback } from "@/lib/video/playback";
import { type LibraryKind, LibrarySheet, NewLayerSheet } from "./library/LibrarySheet";
import { saveLibrary } from "@/lib/storage/library";
import { FillTool, MaskTool, StyleTool } from "./tools/ElementTools";
import { BackgroundTool, SlidesTool } from "./tools/ProjectTools";
import { TextTool } from "./tools/TextTools";
import { TextAlignPanel, TextFormatPanel } from "./tools/TextFormat";
import { OpacityTool } from "./tools/OpacityTool";
import { WidgetContentTool, WidgetDateTool, WidgetListTool, WidgetLookTool, WidgetPickTool, WidgetStyleTool, WidgetTimeTool, WidgetValueTool } from "./tools/WidgetTool";
import { WIDGET_DATES, WIDGET_LISTS, WIDGET_PICKS, WIDGET_TIMES, WIDGET_VALUES, WIDGET_VARIANTS } from "@/lib/elements/widgets";
import { InlineText } from "./InlineText";
import { useImportPhotos } from "./useImportPhotos";
import { useShortcuts } from "./useShortcuts";

const STAGE_PADDING = 24;
const LABEL_SPACE = 4;
/** Room under the slides for their ‖ ⋯ buttons, and after the last one for + (editor-v2/05 §1). */
const CONTROLS_SPACE = 56;
const PLUS_SPACE = 58;
/** Side margin when every slide is in view (about 5 % of the screen, like the reference). */
const FIT_MARGIN = 16;
/**
 * Smallest zoom: one slide about a quarter of the screen wide on a phone (editor-v2/05
 * §2.3), at most 120 px on a tablet so a whole carousel fits there.
 */
const MIN_SLIDE_FRACTION = 0.25;
const MIN_SLIDE_PX = 120;
/**
 * Room kept for the tallest bottom bar (slide strip + selection toolbar). The canvas is
 * sized against the screen minus this, not against whatever bar is showing, so it
 * never changes size when you select something or open a tool (F-03).
 */
const DOCK_RESERVE = 100;

/**
 * Animate is hidden for now (owner, 2026-10-18: still images don't need it). Motion already
 * in projects still plays. The hidden switch `ig-layout:labs-animate` = "1" shows it (tests).
 */
const SHOW_ANIMATE = typeof window !== "undefined" && (() => {
  try {
    return localStorage.getItem("ig-layout:labs-animate") === "1";
  } catch {
    return false;
  }
})();
const MAX_ZOOM = 4;

type Tool =
  | "crop"
  | "mask"
  | "style"
  | "adjust"
  | "filters"
  | "text"
  | "fill"
  | "elements"
  | "background"
  | "slides"
  | "layout"
  | "more"
  | "layers"
  | "draw"
  | "sound"
  | "trim"
  | "animate"
  | "music"
  | "newSlide"
  | "position"
  | "blockLayout"
  | "blockAdjust"
  | "projectMenu"
  | "opacity"
  | "bgTools"
  | "cutout"
  | "erase"
  | "library"
  | "newLayer"
  | "ratio"
  | "preview"
  | "widget"
  | "widgetList"
  | "widgetLook"
  | "widgetValue"
  | "widgetPick"
  | "widgetDate"
  | "widgetStyle"
  | "widgetTime";
/** Tools that edit a draft (✕ / ✓). */
const DRAFT_TOOLS: Tool[] = ["crop", "mask", "style", "adjust", "filters", "text", "fill", "background", "sound", "animate", "position", "blockLayout", "blockAdjust", "opacity", "widget", "widgetList", "widgetLook", "widgetValue", "widgetPick", "widgetDate", "widgetStyle", "widgetTime"];
/** Sheets about the selected element: they close (keeping their edits) when the selection changes (owner, 2026-10-19). */
const ELEMENT_TOOLS: Tool[] = ["fill", "opacity", "widget", "widgetList", "widgetLook", "widgetValue", "widgetPick", "widgetDate", "widgetStyle", "widgetTime"];

/**
 * Stage pixels per export pixel at zoom 1, and the height the canvas is centred in.
 * Post / Story: a slide fits the height and ~86% of the width (scroll sideways).
 * Grid: the whole grid width fits. Depends on the screen only, never on which bottom
 * bar or sheet is showing, so the canvas doesn't jump (UX-08, F-03).
 */
function useBaseScale(area: React.RefObject<HTMLDivElement | null>, slide: { width: number; height: number }, gridWidth: number | null) {
  const [base, setBase] = useState({ scale: 0, height: 0 });
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const update = () => {
      const height = window.innerHeight - el.getBoundingClientRect().top - (gridWidth ? 90 : DOCK_RESERVE);
      const scale = gridWidth
        ? (el.clientWidth - STAGE_PADDING * 2) / gridWidth
        : Math.min((height - STAGE_PADDING * 2 - LABEL_SPACE - CONTROLS_SPACE) / slide.height, (el.clientWidth * 0.86) / slide.width);
      setBase((b) => (b.scale === scale && b.height === height ? b : { scale: Math.max(0.05, scale), height }));
    };
    update();
    // Width only changes with the window; the height used is the window's.
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [area, slide.width, slide.height, gridWidth]);
  return base;
}

/** Visible size of the canvas area (the stage covers just that, D-69). */
function useAreaSize(area: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const update = () => setSize((s) => (s.width === el.clientWidth && s.height === el.clientHeight ? s : { width: el.clientWidth, height: el.clientHeight }));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [area]);
  return size;
}

function ToolButton(props: { label: string; icon: IconName; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`flex h-14 min-w-[58px] shrink-0 flex-col items-center justify-center gap-1 px-2 text-[10.5px] leading-tight ${
        props.danger ? "text-danger" : ""
      }`}
    >
      <Icon name={props.icon} size={21} />
      <span className="max-w-full truncate">{props.label}</span>
    </button>
  );
}

/** Icon-only button of the floating tool pill (nothing selected, like editor-v2/07 §5). */
function PillButton(props: { label: string; icon: IconName; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={props.label}
      title={props.label}
      onClick={props.onClick}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full active:bg-surface-2"
    >
      <Icon name={props.icon} size={26} />
    </button>
  );
}

/** Frosted floating group / round button (editor-v2/01 §2–3). */
const GLASS = "rounded-full border border-border bg-surface/80 shadow-sm backdrop-blur-xl";
const GLASS_ROUND = `flex h-11 w-11 shrink-0 items-center justify-center ${GLASS}`;

/** Round floating button beside the pill (Layers, ✕). */
const ROUND = "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border bg-surface shadow-lg";
const PILL = "rounded-full border border-border bg-surface shadow-lg";

function SaveIndicator() {
  const t = useT();
  const status = useSaveStatus((s) => s.status);
  if (status === "idle") return null;
  const text = status === "saved" ? t("save.saved") : status === "error" ? t("save.error") : t("save.saving");
  return (
    <span role="status" className={`text-[11px] ${status === "error" ? "text-danger" : "text-muted"}`}>
      {status === "saved" && "✓ "}
      {text}
    </span>
  );
}

/**
 * iPhone Safari: a two-finger pinch the page doesn't take can become Safari's own gesture
 * (pinching in shows every tab). In the editor every pinch is ours: Safari's gesture events
 * are cancelled, and so is any two-finger move, wherever the fingers are. One-finger
 * gestures (scrolling, dragging, taps) are untouched; the canvas zoom uses touch / pointer
 * events, not these. Owner, 2026-10-19.
 */
function useNoBrowserPinch() {
  useEffect(() => {
    const stop = (e: Event) => {
      if (e.cancelable) e.preventDefault();
    };
    const twoFingers = (e: TouchEvent) => {
      if (e.touches.length >= 2 && e.cancelable) e.preventDefault();
    };
    const opts = { passive: false } as const;
    for (const type of ["gesturestart", "gesturechange", "gestureend"]) document.addEventListener(type, stop, opts);
    document.addEventListener("touchmove", twoFingers, opts);
    return () => {
      for (const type of ["gesturestart", "gesturechange", "gestureend"]) document.removeEventListener(type, stop);
      document.removeEventListener("touchmove", twoFingers);
    };
  }, []);
}

export function Editor({ onClose }: { onClose: () => void }) {
  const t = useT();
  useNoBrowserPinch();
  const doc = useViewDoc()!;
  const selectedId = useEditor((s) => s.selectedId);
  const currentSlide = useEditor((s) => s.currentSlide);
  const swapFrom = useEditor((s) => s.swapFrom);
  const assets = useEditor((s) => s.assets);
  const editingText = useEditor((s) => s.editingTextId);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const store = useEditor.getState();
  const { importFiles, decodeFiles, busy, errors, videoProgress } = useImportPhotos();

  const areaRef = useRef<HTMLDivElement>(null);
  const contentLayerRef = useRef<Konva.Layer>(null);
  const addInput = useRef<HTMLInputElement>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [removeBgFor, setRemoveBgFor] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool | null>(null);
  const [showSafeZone, setShowSafeZone] = useState(true);
  /** Zoom chosen by the user; null = follow "see every slide" (editor-v2/05 §2). */
  const [userZoom, setUserZoom] = useState<number | null>(null);
  /** Zoom shown while easing to a new "see every slide" level. */
  const [easing, setEasing] = useState<number | null>(null);
  const pinchZoomStart = useRef(1);
  /** Latest pinch ratio waiting for the next frame, and that frame. */
  const pinchPending = useRef<number | null>(null);
  const pinchFrame = useRef(0);
  const playing = usePlayback((s) => s.playing);
  const snapOn = useSettings((s) => s.snap);
  const locale = useSettings((s) => s.locale);
  /** Which library the "library" sheet shows (editor-v2/11). */
  const [library, setLibrary] = useState<LibraryKind>("sticker");
  const openLibrary = (kind: LibraryKind) => {
    setLibrary(kind);
    setTool("library");
  };
  const videoInput = useRef<HTMLInputElement>(null);
  const filesInput = useRef<HTMLInputElement>(null);
  /** What the typing bar shows for the text being typed: keyboard, Format or Align. */
  const [textMode, setTextMode] = useState<{ id: string; mode: "type" | "format" | "align" } | null>(null);
  const typingMode = editingText && textMode?.id === editingText ? textMode.mode : "type";
  const fillFrame = useEditor((s) => s.fillFrame);
  /** Short message at the bottom of the canvas (e.g. some picked photos were not used). */
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef(0);
  function showNotice(text: string) {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3500);
  }
  useShortcuts(tool === null && !editingText && !exportOpen);

  const size = canvasSize(doc);
  const { slide } = size;
  const isGrid = doc.type === "grid";
  const sheetOpen =
    tool !== null && tool !== "more" && tool !== "layers" && tool !== "library" && tool !== "newLayer" && tool !== "layout" && tool !== "newSlide";
  /** Sheets that take the toolbar's place under the canvas. */
  const contentSheet = tool === "layers" || tool === "library" || tool === "newLayer" || tool === "newSlide";
  const base = useBaseScale(areaRef, slide, isGrid ? size.width : null);
  const baseScale = base.scale;
  const areaSize = useAreaSize(areaRef);
  const ready = baseScale > 0 && areaSize.width > 0;
  /** Grid: the whole strip fitting the screen; Post / Story: a slide a quarter of the screen. */
  const minZoom = !ready
    ? 1
    : isGrid
      ? Math.min(1, (areaSize.width - STAGE_PADDING * 2) / (size.width * baseScale))
      : Math.min(1, Math.min(areaSize.width * MIN_SLIDE_FRACTION, MIN_SLIDE_PX) / (slide.width * baseScale));
  /** Every slide in view (plus the + after them), never below the smallest zoom. */
  const fitFor = (width: number) =>
    !ready || isGrid
      ? 1
      : Math.max(
          minZoom,
          Math.min(
            1,
            (areaSize.width - FIT_MARGIN * 2 - PLUS_SPACE) / (width * baseScale),
            // A sheet below may leave less height: the slides still fit above it (editor-v2/12 §1.2).
            (areaSize.height - STAGE_PADDING * 2 - LABEL_SPACE - CONTROLS_SPACE) / (slide.height * baseScale),
          ),
        );
  const fitZoom = fitFor(size.width);
  const zoom = userZoom ?? easing ?? fitZoom;
  const viewScale = baseScale * zoom;
  /** Canvas origin inside the scroll content: vertically centred when it fits. */
  const originFor = (s: number) => ({
    // Zoomed out narrower than the screen: centred (S5).
    x: Math.max(isGrid ? STAGE_PADDING : FIT_MARGIN, Math.round((areaSize.width - size.width * s - (isGrid ? 0 : PLUS_SPACE)) / 2)),
    // Centred in the space left above whatever bar or sheet is open.
    y: Math.max(STAGE_PADDING + LABEL_SPACE, Math.round((areaSize.height - size.height * s - (isGrid ? 0 : CONTROLS_SPACE) + LABEL_SPACE) / 2)),
  });
  const origin = originFor(viewScale);
  const selected = doc.elements.find((el) => el.id === selectedId);
  const selectedIsVideo = selected?.type === "image" && !!(selected.assetId && assets[selected.assetId]?.video);
  /** Photos used in the project, back to front, without duplicates (for re-layout). */
  const usedPhotos = [...new Set(doc.elements.filter(isImage).map((el) => el.assetId).filter((id): id is string => !!id))]
    .map((id) => assets[id])
    .filter((a): a is ImageAsset => !!a);

  // Cropping on the canvas (D-111): the crop layer takes the gestures; the view zooms to the
  // photo (with room around it for the rest of the picture) and comes back afterwards.
  const cropId = tool === "crop" && selected?.type === "image" ? selected.id : null;
  const cropSaved = useRef<{ zoom: number | null; left: number; top: number } | null>(null);
  /** Zooms to `z` (default: the photo with room around it) keeping the cropped photo centred. */
  function focusCrop(id: string, z?: number) {
    const area = areaRef.current;
    const el = doc.elements.find((e) => e.id === id);
    if (!area || !el) return;
    const b = rotatedBounds(el);
    const fit = Math.max(minZoom, Math.min(MAX_ZOOM, (areaSize.width * 0.62) / (b.width * baseScale), (areaSize.height * 0.62) / (b.height * baseScale)));
    const to = Math.max(minZoom, Math.min(MAX_ZOOM, z ?? fit));
    setEasing(null);
    setUserZoom(to);
    requestAnimationFrame(() => {
      const sc = baseScale * to;
      const o = originFor(sc);
      area.scrollTo({ left: o.x + (b.x + b.width / 2) * sc - area.clientWidth / 2, top: o.y + (b.y + b.height / 2) * sc - area.clientHeight / 2 });
    });
  }
  useEffect(() => {
    store.setCropping(cropId);
    const area = areaRef.current;
    if (!area || !ready) return;
    if (cropId) {
      cropSaved.current ??= { zoom: userZoom, left: area.scrollLeft, top: area.scrollTop };
      focusCrop(cropId);
    } else if (cropSaved.current) {
      const saved = cropSaved.current;
      cropSaved.current = null;
      setUserZoom(saved.zoom);
      requestAnimationFrame(() => area.scrollTo({ left: saved.left, top: saved.top }));
    }
    // Only when cropping starts / stops, or the space above the bar changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropId, ready, areaSize.width, areaSize.height]);
  const [cropRatio, setCropRatio] = useState<RatioKey>("free");

  /** Scrolls the canvas area so a point (export px) is centred, if it isn't visible. */
  function reveal(x: number, y: number, force = false) {
    const area = areaRef.current;
    if (!area) return;
    const px = origin.x + x * viewScale;
    const py = origin.y + y * viewScale;
    const visible =
      px > area.scrollLeft + 24 && px < area.scrollLeft + area.clientWidth - 24 && py > area.scrollTop + 24 && py < area.scrollTop + area.clientHeight - 24;
    if (visible && !force) return;
    area.scrollTo({ left: px - area.clientWidth / 2, top: py - area.clientHeight / 2, behavior: "smooth" });
  }

  // Background music plays with the project (M13.4).
  const musicAsset = doc.music ? assets[doc.music.assetId] : undefined;
  useEffect(() => {
    if (doc.music && musicAsset?.audio) attachMusic(musicAsset.url, doc.music, musicAsset.audio.duration);
    else detachMusic();
  }, [doc.music, musicAsset]);
  useEffect(() => detachMusic, []);

  // Editing an element: stop playing and go back to the start, where elements sit at
  // their real positions (animations are only shown while playing, M13.3).
  useEffect(() => {
    if (!selectedId) return;
    const p = usePlayback.getState();
    if (p.playing || p.time > 0) {
      pausePlayback();
      seek(0);
    }
  }, [selectedId]);

  // Tapping elsewhere (or another element) closes an element's sheet, keeping what was done;
  // otherwise it came back the next time the element was selected.
  const toolRef = useRef(tool);
  useLayoutEffect(() => {
    toolRef.current = tool;
  });
  useEffect(
    () =>
      useEditor.subscribe((s, prev) => {
        const t = toolRef.current;
        if (s.selectedId === prev.selectedId || !t || !ELEMENT_TOOLS.includes(t)) return;
        if (s.draft) s.applyDraft();
        setTool(null);
      }),
    [],
  );

  /** Layout / Adjust of a block lay its cells out again: say so if they were placed by hand (D-113). */
  function openBlockTool(next: Tool) {
    if (selected?.type === "layout" && selected.custom) showNotice(t("block.resetCells"));
    openTool(next);
  }

  function openTool(next: Tool) {
    if (DRAFT_TOOLS.includes(next)) store.beginDraft();
    setTool(next);
    // Keep what is being edited in view above the sheet (UX-08).
    if (selected) requestAnimationFrame(() => reveal(selected.x + selected.width / 2, selected.y + selected.height / 2));
  }

  /** Current slide = the one under the middle of the visible area. */
  function onScroll() {
    const area = areaRef.current;
    if (!area || viewScale <= 0) return;
    const x = (area.scrollLeft + area.clientWidth / 2 - origin.x) / viewScale;
    const y = (area.scrollTop + area.clientHeight / 2 - origin.y) / viewScale;
    const index = slideAt(doc, x, y);
    if (index !== useEditor.getState().currentSlide) store.setCurrentSlide(index);
  }

  /**
   * The canvas point (ax, ay; export px) kept under a screen point (sx, sy; px in the visible
   * area) while zooming. Applied right after the new zoom is laid out — scroll and stage in
   * the same frame — so nothing drifts or shakes between the canvas and the controls.
   */
  const zoomAnchor = useRef<{ ax: number; ay: number; sx: number; sy: number; once: boolean; lockX: boolean; lockY: boolean; fingers?: { x: number; y: number }; sx0?: number; sy0?: number } | null>(null);
  useLayoutEffect(() => {
    const a = zoomAnchor.current;
    const area = areaRef.current;
    if (!a || !area) return;
    area.scrollLeft = origin.x + a.ax * viewScale - a.sx;
    area.scrollTop = origin.y + a.ay * viewScale - a.sy;
    const stage = useEditor.getState().canvas?.layer.getStage();
    if (stage) {
      stage.position({ x: origin.x - area.scrollLeft, y: origin.y - area.scrollTop });
      stage.batchDraw();
    }
    if (a.once) zoomAnchor.current = null;
  }, [viewScale, origin.x, origin.y]);

  /**
   * Anchor at a point of the visible area (default: its middle). On an axis where the
   * canvas fits (it is centred, nothing to scroll), the anchor is the canvas centre instead:
   * the canvas grows evenly from there, then the same point simply stays put once it can be
   * scrolled — no back-and-forth.
   */
  function anchorAt(sx?: number, sy?: number, once = false, free = false) {
    const area = areaRef.current;
    if (!area) return;
    // `free` (wheel steps): always the given point — no back-and-forth to avoid between steps.
    const lockX = !free && area.scrollWidth <= area.clientWidth + 1;
    const lockY = !free && area.scrollHeight <= area.clientHeight + 1;
    const ax = lockX ? size.width / 2 : (area.scrollLeft + (sx ?? area.clientWidth / 2) - origin.x) / viewScale;
    const ay = lockY ? size.height / 2 : (area.scrollTop + (sy ?? area.clientHeight / 2) - origin.y) / viewScale;
    zoomAnchor.current = { ax, ay, sx: origin.x + ax * viewScale - area.scrollLeft, sy: origin.y + ay * viewScale - area.scrollTop, once, lockX, lockY };
  }

  /** Zoom around the middle of the visible area. `elastic`: may go a little below the smallest zoom (pinch). */
  function zoomTo(next: number, elastic = false) {
    let z = Math.min(MAX_ZOOM, next);
    // Below the smallest zoom the canvas resists, and springs back on release (editor-v2/05 §2.3).
    if (z < minZoom) z = elastic ? minZoom * (z / minZoom) ** 0.3 : minZoom;
    if (z === zoom) return;
    if (!zoomAnchor.current) anchorAt(undefined, undefined, true);
    setEasing(null);
    setUserZoom(z);
  }

  /**
   * Mouse wheel / trackpad zoom (owner, 2026-10-19): the wheel zooms around the pointer —
   * the point under it stays put. Ctrl / ⌘ + wheel (a trackpad pinch) too, finer. Shift +
   * wheel or a sideways swipe still scrolls. One zoom per frame, like the pinch.
   */
  const wheel = useRef({ k: 1, x: 0, y: 0, frame: 0 });
  const onWheel = useRef<(e: WheelEvent) => void>(() => {});
  useLayoutEffect(() => {
    onWheel.current = (e: WheelEvent) => {
      const area = areaRef.current;
      if (!area || e.shiftKey || (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaX) > Math.abs(e.deltaY))) return;
      e.preventDefault();
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
      const w = wheel.current;
      w.k *= Math.exp(-Math.max(-60, Math.min(60, dy)) * (e.ctrlKey || e.metaKey ? 0.01 : 0.002));
      const r = area.getBoundingClientRect();
      w.x = e.clientX - r.left;
      w.y = e.clientY - r.top;
      w.frame ||= requestAnimationFrame(() => {
        w.frame = 0;
        const k = w.k;
        w.k = 1;
        anchorAt(w.x, w.y, true, true);
        zoomTo(zoom * k);
        // Nothing changed (already at the smallest / largest zoom): drop the anchor.
        if (Math.min(MAX_ZOOM, Math.max(minZoom, zoom * k)) === zoom) zoomAnchor.current = null;
      });
    };
  });
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const listener = (e: WheelEvent) => onWheel.current(e);
    // Not passive: the page must not scroll (or zoom) while the wheel zooms the canvas.
    area.addEventListener("wheel", listener, { passive: false });
    return () => area.removeEventListener("wheel", listener);
  }, []);

  /** Eases the zoom to `to` in 250 ms; `follow`: then keep "see every slide". */
  const easeRun = useRef(0);
  function easeZoom(to: number, follow: boolean) {
    const from = zoom;
    const run = ++easeRun.current;
    const t0 = performance.now();
    setUserZoom(null);
    const step = (now: number) => {
      if (run !== easeRun.current) return;
      const k = Math.min(1, (now - t0) / 250);
      const e = 1 - (1 - k) ** 3;
      if (k < 1) {
        setEasing(from + (to - from) * e);
        requestAnimationFrame(step);
      } else {
        setEasing(null);
        if (!follow) setUserZoom(to);
      }
    };
    requestAnimationFrame(step);
  }

  /** Back to "see every slide". */
  function fitAll() {
    easeZoom(fitZoom, true);
    requestAnimationFrame(() => areaRef.current?.scrollTo({ left: 0, top: 0, behavior: "smooth" }));
  }

  /** Slides added / removed: ease to the new "see every slide" level (editor-v2/05 §2.2). */
  function onSlidesChanged(count: number) {
    if (userZoom !== null) return;
    const w = slide.width * count;
    easeZoom(fitFor(w), true);
  }

  async function onBack() {
    resetPlayback();
    store.select(null);
    await flushSave();
    store.closeProject();
    onClose();
  }

  function addText() {
    const el = newText(doc.ratio, slideRect(doc, currentSlide), t("text.placeholder"));
    store.addElement(el);
    typeText(el.id, "type");
  }

  /** Starts (or switches) the typing session on a text: keyboard, format or align (editor-v2/10 §2). */
  function typeText(id: string, mode: "type" | "format" | "align") {
    setTextMode({ id, mode });
    store.setEditingText(id);
  }

  const close = () => setTool(null);
  const sheet = (label: string, children: React.ReactNode) => (
    // Floating over the canvas colour, not a full-width panel (editor-v2/01, 07 §5).
    <section aria-label={label} className="bg-(--canvas) px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {children}
    </section>
  );

  type MoreKey = "background" | "slides" | "layers" | "draw" | "layout" | "ratio" | "snap" | "preview" | "music" | "replace" | "swap" | "mask" | "up" | "down" | "front" | "back" | "lock" | "unrotate" | "removeBg" | "crop" | "animate";

  /** Secondary actions for the selection ("⋯ More"), described as data. */
  /** The project menu (the ⋯ at the top): background, slides, music, drawing. */
  function projectActions(): Action<MoreKey>[] {
    return [
        { key: "background", label: t("editor.background"), icon: "background" },
        ...(isGrid ? [] : [{ key: "ratio" as const, label: t("pm.ratio"), icon: "crop" as const }]),
        { key: "snap", label: snapOn ? t("pm.snapOn") : t("pm.snapOff"), icon: "move" },
        { key: "preview", label: t("pm.preview"), icon: "play" },
        { key: "slides", label: isGrid ? t("editor.grid") : doc.type === "story" ? t("editor.frames") : t("editor.slides"), icon: "slides" },
        { key: "music", label: t("music.title"), icon: "music" },
        { key: "draw", label: t("editor.draw"), icon: "pencil" },
        { key: "layout", label: t("editor.layout"), icon: "layout" },
      ];
  }

  function moreActions(): Action<MoreKey>[] {
    if (!selected) return projectActions();
    const list: Action<MoreKey>[] = [];
    if (selected.type === "image") {
      if (selected.assetId) list.push({ key: "replace", label: t("editor.replace"), icon: "replace" });
      if (selectedIsVideo) list.unshift({ key: "crop", label: t("editor.crop"), icon: "crop" }, ...(SHOW_ANIMATE ? [{ key: "animate" as const, label: t("editor.animate"), icon: "motion" as const }] : []));
      else if (selected.assetId) list.push({ key: "removeBg", label: t("removeBg.title"), icon: "sparkles" });
      if (selected.slot) list.push({ key: "swap", label: t("editor.swap"), icon: "swap" });
      if (selected.frame === "none") list.push({ key: "mask", label: t("editor.mask"), icon: "mask" });
    }
    if (selected.rotation !== 0 && !selected.locked) list.push({ key: "unrotate", label: t("editor.unrotate"), icon: "rotate" });
    list.push(
      { key: "up", label: t("editor.forward"), icon: "layerUp" },
      { key: "down", label: t("editor.backward"), icon: "layerDown" },
      { key: "front", label: t("editor.toFront"), icon: "layerUp" },
      { key: "back", label: t("editor.toBack"), icon: "layerDown" },
      { key: "lock", label: selected.locked ? t("editor.unlock") : t("editor.lock"), icon: selected.locked ? "unlock" : "lock" },
      { key: "layers", label: t("layers.title"), icon: "layers" },
    );
    return list;
  }

  function runMore(key: MoreKey) {
    const id = selected?.id;
    if (key === "background") return openTool("background");
    if (key === "slides") return openTool("slides");
    if (key === "layers") return setTool("layers");
    if (key === "layout") return setTool("layout");
    if (key === "ratio") return setTool("ratio");
    if (key === "snap") return useSettings.getState().setSnap(!snapOn);
    if (key === "preview") return setTool("preview");
    if (key === "music") return setTool("music");
    if (key === "draw") {
      store.startDrawing();
      return setTool("draw");
    }
    if (!id) return;
    if (key === "replace") return store.openFillFrame(id, "replace");
    if (key === "swap") return store.startSwap(id);
    if (key === "mask") return openTool("mask");
    if (key === "up" || key === "down") return store.moveLayer(id, key);
    if (key === "front" || key === "back") return store.moveLayerTo(id, key);
    if (key === "lock") return store.toggleLock(id);
    if (key === "unrotate") return store.updateElement(id, { rotation: 0 });
    if (key === "removeBg") return setRemoveBgFor(id);
    if (key === "crop") return openTool("crop");
    if (key === "animate") return openTool("animate");
  }


  let bottom: React.ReactNode;
  if (tool === "mask" && selected) bottom = <MaskTool elementId={selected.id} onClose={close} />;
  else if (tool === "position" && selected) bottom = <PositionTool elementId={selected.id} onClose={close} />;
  else if (tool === "opacity" && selected) bottom = <OpacityTool elementId={selected.id} onClose={close} />;
  else if (editingText)
    // Typing bar (editor-v2/10 §2): A| keyboard · Aa Format · ≡ Align, ✕ ends typing.
    bottom = (
      <div>
        <section aria-label={t("type.edit")} className="bg-(--canvas) px-3 pt-2 pb-2">
          <div className="flex items-center gap-2">
            <div role="tablist" className={`flex h-12 flex-1 items-center gap-1 px-1 ${PILL}`}>
              {(
                [
                  ["type", "cursor", t("type.edit")],
                  ["format", "text", t("type.format")],
                  ["align", "alignLeft", t("type.align")],
                ] as const
              ).map(([mode, icon, label]) => (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={typingMode === mode}
                  onClick={() => typeText(editingText, mode)}
                  className={`flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] ${typingMode === mode ? "bg-surface-2 font-semibold" : "text-muted"}`}
                >
                  <Icon name={icon} size={18} />
                  {label}
                </button>
              ))}
            </div>
            <button type="button" aria-label={t("type.done")} onClick={() => store.setEditingText(null)} className={`${ROUND} h-12! w-12!`}>
              <Icon name="close" />
            </button>
          </div>
        </section>
        {typingMode === "format" && <TextFormatPanel elementId={editingText} />}
        {typingMode === "align" && <TextAlignPanel elementId={editingText} />}
      </div>
    );
  else if (tool === "crop" && selected) bottom = <CropPanel elementId={selected.id} ratio={cropRatio} onRatio={setCropRatio} onClose={close} />;
  else if (tool === "blockLayout" && selected)
    bottom = <BlockLayoutTool elementId={selected.id} onClose={close} onOutside={(n) => showNotice(t("block.outside", { count: n }))} />;
  else if (tool === "blockAdjust" && selected) bottom = <BlockAdjustTool elementId={selected.id} onClose={close} />;
  else if (tool === "style" && selected) bottom = <StyleTool elementId={selected.id} onClose={close} />;
  else if (tool === "text" && selected) bottom = <TextTool elementId={selected.id} onClose={close} />;
  else if (tool === "fill" && selected) bottom = <FillTool elementId={selected.id} onClose={close} />;
  else if (tool === "widget" && selected) bottom = <WidgetContentTool elementId={selected.id} onClose={close} />;
  else if (tool === "widgetList" && selected) bottom = <WidgetListTool elementId={selected.id} onClose={close} />;
  else if (tool === "widgetLook" && selected) bottom = <WidgetLookTool elementId={selected.id} onClose={close} />;
  else if (tool === "widgetValue" && selected) bottom = <WidgetValueTool elementId={selected.id} onClose={close} />;
  else if (tool === "widgetPick" && selected) bottom = <WidgetPickTool elementId={selected.id} onClose={close} />;
  else if (tool === "widgetDate" && selected) bottom = <WidgetDateTool elementId={selected.id} onClose={close} />;
  else if (tool === "widgetStyle" && selected) bottom = <WidgetStyleTool elementId={selected.id} onClose={close} />;
  else if (tool === "widgetTime" && selected) bottom = <WidgetTimeTool elementId={selected.id} onClose={close} />;
  else if (tool === "background") bottom = <BackgroundTool onClose={close} />;
  else if (tool === "draw") bottom = <DrawTool onClose={close} />;
  else if (tool === "music") bottom = <MusicTool onClose={close} />;
  else if (tool === "sound" && selected) bottom = <SoundTool elementId={selected.id} onClose={close} />;
  else if (tool === "animate" && selected) bottom = <AnimationTool elementId={selected.id} onClose={close} />;
  else if (tool === "slides") bottom = <SlidesTool onClose={close} showSafeZone={showSafeZone} onSafeZone={setShowSafeZone} />;
  else if (selected) {
    // Toolbar of the selected kind of element (editor-v2/07 §5): slides sideways, ✕ deselects.
    const id = selected.id;
    const inBlock = !!selected.parentId;
    // Cells are ordinary elements (D-113), except a pack frame's windows.
    const fixedSlot = inBlock && fixedCell(selected, doc.elements);
    const position = !fixedSlot && <ToolButton key={t("editor.position")} label={t("editor.position")} icon="move" onClick={() => openTool("position")} />;
    const tail = [
      !fixedSlot && <ToolButton key={selected.locked ? t("editor.unlock") : t("editor.lock")} label={selected.locked ? t("editor.unlock") : t("editor.lock")} icon={selected.locked ? "unlock" : "lock"} onClick={() => store.toggleLock(id)} />,
      !fixedSlot && <ToolButton key={t("editor.duplicate")} label={t("editor.duplicate")} icon="duplicate" onClick={() => store.duplicateElement(id)} />,
      <ToolButton key={t("common.delete")} label={t("common.delete")} icon="trash" onClick={() => store.removeElement(id)} danger />,
    ];
    let tools: React.ReactNode;
    if (selected.type === "image" && !selected.assetId)
      tools = [
        <ToolButton key={t("editor.addPhoto")} label={t("editor.addPhoto")} icon="image" onClick={() => store.openFillFrame(id, "fill")} />,
        selected.slot && <ToolButton key={t("editor.swap")} label={t("editor.swap")} icon="swap" onClick={() => store.startSwap(id)} />,
        position,
        <ToolButton key={t("editor.style")} label={t("editor.style")} icon="style" onClick={() => openTool("style")} />,
        ...tail,
      ];
    else if (selected.type === "image" && selectedIsVideo)
      tools = [
        <ToolButton key={t("editor.replace")} label={t("editor.replace")} icon="replace" onClick={() => store.openFillFrame(id, "replace")} />,
        <ToolButton key={t("trim.title")} label={t("trim.title")} icon="scissors" onClick={() => openTool("trim")} />,
        <ToolButton key={t("video.sound")} label={t("video.sound")} icon="volume" onClick={() => openTool("sound")} />,
        <ToolButton key={t("editor.filters")} label={t("editor.filters")} icon="filters" onClick={() => openTool("filters")} />,
        <ToolButton key={t("editor.adjust")} label={t("editor.adjust")} icon="adjust" onClick={() => openTool("adjust")} />,
        SHOW_ANIMATE && <ToolButton key={t("editor.animate")} label={t("editor.animate")} icon="motion" onClick={() => openTool("animate")} />,
        position,
        <ToolButton key={t("editor.crop")} label={t("editor.crop")} icon="crop" onClick={() => openTool("crop")} />,
        <ToolButton key={t("editor.style")} label={t("editor.style")} icon="style" onClick={() => openTool("style")} />,
        ...tail,
      ];
    else if (selected.type === "image")
      tools = [
        <ToolButton key={t("editor.replace")} label={t("editor.replace")} icon="replace" onClick={() => store.openFillFrame(id, "replace")} />,
        position,
        <ToolButton key={t("editor.crop")} label={t("editor.crop")} icon="crop" onClick={() => openTool("crop")} />,
        <ToolButton key={t("editor.style")} label={t("editor.style")} icon="style" onClick={() => openTool("style")} />,
        <ToolButton key={t("editor.adjust")} label={t("editor.adjust")} icon="adjust" onClick={() => openTool("adjust")} />,
        <ToolButton key={t("editor.filters")} label={t("editor.filters")} icon="filters" onClick={() => openTool("filters")} />,
        <ToolButton key="bgTools" label={t("bg.title")} icon="sparkles" onClick={() => setTool("bgTools")} />,
        <ToolButton
          key="saveSticker"
          label={t("lib.saveSticker")}
          icon="heart"
          onClick={() => {
            // Kept on this device for every project ("My stickers", editor-v2/09 §10).
            const a = selected.assetId ? assets[selected.assetId] : undefined;
            if (a) void saveLibrary("sticker", a.blob, a.width, a.height, a.name).then(() => showNotice(t("lib.saved")));
          }}
        />,
        SHOW_ANIMATE && <ToolButton key={t("editor.animate")} label={t("editor.animate")} icon="motion" onClick={() => openTool("animate")} />,
        selected.slot && <ToolButton key={t("editor.swap")} label={t("editor.swap")} icon="swap" onClick={() => store.startSwap(id)} />,
        selected.frame === "none" && !inBlock && <ToolButton key={t("editor.mask")} label={t("editor.mask")} icon="mask" onClick={() => openTool("mask")} />,
        tail[0],
        tail[1],
        <ToolButton key={t("editor.clear")} label={t("editor.clear")} icon="reset" onClick={() => store.updateElement(id, { assetId: null })} />,
        tail[2],
      ];
    else if (selected.type === "layout")
      // A pack frame's windows come from its art (M20 C4): no re-splitting / re-spacing.
      tools = selected.art
        ? [position, <ToolButton key="opacity" label={t("tool.opacityTitle")} icon="adjust" onClick={() => openTool("opacity")} />, ...tail]
        : [
            <ToolButton key="layout" label={t("block.layout")} icon="layout" onClick={() => openBlockTool("blockLayout")} />,
            <ToolButton key="adjust" label={t("block.adjust")} icon="adjust" onClick={() => openBlockTool("blockAdjust")} />,
            position,
            ...tail,
          ];
    else if (selected.type === "text")
      tools = [
        <ToolButton key="edit" label={t("type.edit")} icon="pencil" onClick={() => typeText(id, "type")} />,
        <ToolButton key="format" label={t("type.format")} icon="text" onClick={() => typeText(id, "format")} />,
        <ToolButton key="align" label={t("type.align")} icon="alignLeft" onClick={() => typeText(id, "align")} />,
        position,
        <ToolButton key="opacity" label={t("tool.opacityTitle")} icon="adjust" onClick={() => openTool("opacity")} />,
        SHOW_ANIMATE && <ToolButton key="animate" label={t("editor.animate")} icon="motion" onClick={() => openTool("animate")} />,
        ...tail,
      ];
    else if (selected.type === "icon" && selected.widget) {
      // Its own toolbar (D-118): what this kind of widget has, then content, card, colour…
      const k = selected.widget.kind;
      const lang = (p: [string, string]) => p[locale === "vi" ? 1 : 0];
      const list = WIDGET_LISTS[k];
      const value = WIDGET_VALUES[k];
      const pick = WIDGET_PICKS[k];
      tools = [
        WIDGET_VARIANTS[k] && <ToolButton key="style" label={t("widget.style")} icon="style" onClick={() => openTool("widgetStyle")} />,
        WIDGET_TIMES.includes(k) && <ToolButton key="time" label={t("widget.time")} icon="clock" onClick={() => openTool("widgetTime")} />,
        list && <ToolButton key="list" label={lang(list.label)} icon="listPlus" onClick={() => openTool("widgetList")} />,
        value && <ToolButton key="value" label={lang(value.label)} icon="sliders" onClick={() => openTool("widgetValue")} />,
        pick && <ToolButton key="pick" label={lang(pick.label)} icon="smilePlus" onClick={() => openTool("widgetPick")} />,
        WIDGET_DATES.includes(k) && <ToolButton key="date" label={t("widget.date")} icon="calendar" onClick={() => openTool("widgetDate")} />,
        <ToolButton key="content" label={t("widget.content")} icon="pencil" onClick={() => openTool("widget")} />,
        <ToolButton key="look" label={t("widget.look")} icon="contrast" onClick={() => openTool("widgetLook")} />,
        <ToolButton key="color" label={t("tool.color")} icon="palette" onClick={() => openTool("fill")} />,
        position,
        <ToolButton key="opacity" label={t("tool.opacityTitle")} icon="adjust" onClick={() => openTool("opacity")} />,
        ...tail,
      ];
    }
    else
      tools = [
        // Emoji keep their own colours: opacity only (still in the Color tool).
        selected.type !== "drawing" &&
          <ToolButton key={selected.type === "icon" && selected.svg ? t("tool.opacity") : t("tool.color")} label={selected.type === "icon" && selected.svg ? t("tool.opacity") : t("tool.color")} icon="palette" onClick={() => openTool("fill")} />,
        position,
        SHOW_ANIMATE && <ToolButton key={t("editor.animate")} label={t("editor.animate")} icon="motion" onClick={() => openTool("animate")} />,
        ...tail,
      ];
    bottom = sheet(
      t("editor.tools"),
      <div className="flex items-center gap-2">
        {/* Slides sideways when the tools don't fit; ✕ deselects (editor-v2/07 §5). */}
        <div className={`no-scrollbar flex h-14 min-w-0 flex-1 touch-pan-x overflow-x-auto px-1 ${PILL}`}>
          {tools}
        </div>
        <button type="button" aria-label={t("common.done")} onClick={() => store.select(null)} className={ROUND}>
          <Icon name="close" />
        </button>
      </div>,
    );
  } else
    bottom = sheet(
      t("editor.tools"),
      <div className="flex items-center justify-between gap-2">
        <div className={`flex h-14 items-center px-1 ${PILL}`}>
          <PillButton label={busy ? t("editor.importing") : t("editor.addPhotos")} icon="image" onClick={() => addInput.current?.click()} />
          <PillButton label={t("editor.text")} icon="text" onClick={addText} />
          <PillButton label={t("lib.stickers")} icon="origami" onClick={() => openLibrary("sticker")} />
          <PillButton label={t("lib.shapes")} icon="shapes" onClick={() => openLibrary("shape")} />
          <PillButton label={t("lib.newLayer")} icon="plus" onClick={() => setTool("newLayer")} />
        </div>
        {/* Layers stand apart from the tools, as a round button on the right (D-92). */}
        <button type="button" aria-label={t("layers.title")} onClick={() => setTool("layers")} className={ROUND}>
          <Icon name="layers" size={26} />
        </button>
      </div>,
    );

  return (
    // data-fonts uses the text-font module so its @font-face CSS ships with the editor (M11).
    <main data-fonts={WEB_FONTS} className="flex h-dvh flex-col">
      {/* Floating round buttons over the canvas colour (editor-v2/05 §1): ‹ · title, ↶ ↷ ⋯, export. */}
      <header className="flex items-center gap-2 bg-(--canvas) px-3 pt-2.5 pb-1.5">
        <button type="button" aria-label={t("common.back")} onClick={onBack} className={GLASS_ROUND}>
          <Icon name="back" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col px-1 leading-tight">
          <span className="truncate text-[14px] font-semibold">
            {doc.type === "grid"
              ? t("editor.titleGrid", { rows: doc.grid?.rows ?? 1 })
              : doc.type === "story"
                ? t("editor.titleStory", { count: doc.slideCount })
                : t("editor.title", { ratio: doc.ratio.replace("1080x", "1080×"), count: doc.slideCount })}
          </span>
          <SaveIndicator />
        </div>
        <div className={`flex h-11 items-center px-1 ${GLASS}`}>
          <button type="button" aria-label={t("editor.undo")} disabled={!canUndo || sheetOpen || !!editingText} onClick={store.undo} className="flex h-10 w-10 items-center justify-center disabled:text-disabled">
            <Icon name="undo" />
          </button>
          <button type="button" aria-label={t("editor.redo")} disabled={!canRedo || sheetOpen || !!editingText} onClick={store.redo} className="flex h-10 w-10 items-center justify-center disabled:text-disabled">
            <Icon name="redo" />
          </button>
          <button type="button" aria-label={t("editor.projectMenu")} disabled={sheetOpen} onClick={() => setTool("projectMenu")} className="flex h-10 w-10 items-center justify-center disabled:text-disabled">
            <Icon name="more" />
          </button>
        </div>
        <button
          type="button"
          aria-label={t("editor.export")}
          disabled={doc.elements.length === 0 || sheetOpen}
          onClick={() => {
            store.select(null);
            setExportOpen(true);
          }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg disabled:opacity-50"
        >
          <Icon name="share" />
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          ref={areaRef}
          onScroll={onScroll}
          // Browser pinch-zoom off: two fingers resize elements or zoom the canvas instead.
          style={{ touchAction: "pan-x pan-y" }}
          className="relative flex-1 overflow-auto overscroll-contain bg-canvas"
        >
          {viewScale > 0 && areaSize.width > 0 && (
            // Scroll content at full size; the stage sticks to the visible part (D-69).
            <div
              className="relative"
              style={{
                width: Math.max(areaSize.width, origin.x + size.width * viewScale + (isGrid ? STAGE_PADDING : PLUS_SPACE + FIT_MARGIN)),
                height: Math.max(areaSize.height, origin.y + STAGE_PADDING + size.height * viewScale + (isGrid ? 0 : CONTROLS_SPACE)),
              }}
            >
              <div className="sticky top-0 left-0 z-[1]" style={{ width: areaSize.width, height: areaSize.height }}>
                <CanvasStage
                  viewScale={viewScale}
                  viewport={areaSize}
                  scrollRef={areaRef}
                  origin={origin}
                  contentLayerRef={contentLayerRef}
                  showSafeZone={showSafeZone}
                  onPinchZoom={(k, phase, mid) => {
                    if (phase === "start") {
                      pinchZoomStart.current = zoom;
                      // Zoom around the fingers; the point under them stays under them.
                      anchorAt(mid?.x, mid?.y);
                      const a = zoomAnchor.current;
                      if (a && mid) Object.assign(a, { fingers: mid, sx0: a.sx, sy0: a.sy });
                    } else if (phase === "move") {
                      // The fingers can also pan while they pinch (not on a centred axis).
                      const a = zoomAnchor.current;
                      if (a && mid && a.fingers) {
                        if (!a.lockX) a.sx = (a.sx0 ?? a.sx) + mid.x - a.fingers.x;
                        if (!a.lockY) a.sy = (a.sy0 ?? a.sy) + mid.y - a.fingers.y;
                      }
                      // One zoom per frame: touch events come faster than the screen draws.
                      pinchPending.current = k;
                      pinchFrame.current ||= requestAnimationFrame(() => {
                        pinchFrame.current = 0;
                        if (pinchPending.current !== null) zoomTo(pinchZoomStart.current * pinchPending.current, true);
                        pinchPending.current = null;
                      });
                    } else {
                      cancelAnimationFrame(pinchFrame.current);
                      pinchFrame.current = 0;
                      if (pinchPending.current !== null && zoomAnchor.current) {
                        // The last step still keeps the point under the fingers, then the anchor goes.
                        zoomAnchor.current.once = true;
                        zoomTo(pinchZoomStart.current * pinchPending.current, true);
                      } else zoomAnchor.current = null;
                      pinchPending.current = null;
                      if (zoom < minZoom) easeZoom(minZoom, minZoom >= fitZoom);
                    }
                  }}
                  onFit={fitAll}
                  onEditWidget={() => openTool("widget")}
                />
                {cropId && (
                  <CropGestures id={cropId} aspect={ratioAspect(cropRatio, selected?.type === "image" && selected.assetId ? assets[selected.assetId] : undefined)} />
                )}
                {!sheetOpen && !editingText && <FloatingMenu scrollRef={areaRef} onMore={() => setTool("more")} />}
                {editingText && (
                  <InlineText elementId={editingText} origin={origin} viewScale={viewScale} scrollRef={areaRef} active={typingMode === "type"} />
                )}
              </div>
              {/* Where the canvas is in the scroll content (layout reference for tests). */}
              <div
                data-stage-frame
                className="pointer-events-none absolute"
                style={{ left: origin.x, top: origin.y, width: size.width * viewScale, height: size.height * viewScale }}
              />
              {!isGrid && !sheetOpen && (
                <SlideControls
                  doc={doc}
                  origin={origin}
                  viewScale={viewScale}
                  onAddSlide={() => setTool("newSlide")}
                  onSlidesChanged={onSlidesChanged}
                />
              )}
            </div>
          )}
          {doc.elements.length === 0 && (
            <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-sm text-muted">
              {busy ? t("editor.importingPhotos") : t("editor.emptyHint")}
            </p>
          )}
        </div>

        {/* Zoom (UX-06). Touch: pinch, with a pill to get back to fit; mouse: buttons. */}
        {isTouchUI ? (
          (cropId || Math.abs(zoom - fitZoom) > 0.01) && (
            <button
              type="button"
              aria-label={t("zoom.fit")}
              onClick={() => (cropId ? focusCrop(cropId) : fitAll())}
              className="absolute right-2 bottom-2 z-10 h-9 rounded-full border border-border bg-surface/90 px-3 text-xs font-semibold tabular-nums shadow-sm"
            >
              {Math.round(zoom * 100)}%
            </button>
          )
        ) : (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-0.5 rounded-full border border-border bg-surface/90 p-0.5 shadow-sm">
            <button
              type="button"
              aria-label={t("zoom.out")}
              disabled={zoom <= minZoom + 0.001}
              onClick={() => (cropId ? focusCrop(cropId, zoom / 1.5) : zoomTo(zoom / 1.5))}
              className="flex h-9 w-9 items-center justify-center rounded-full disabled:text-disabled"
            >
              <Icon name="minus" size={18} />
            </button>
            {(cropId || Math.abs(zoom - fitZoom) > 0.01) && (
              // Cropping: back to the photo, not to every slide (the canvas can't be scrolled then).
              <button type="button" aria-label={t("zoom.fit")} onClick={() => (cropId ? focusCrop(cropId) : fitAll())} className="h-9 px-1 text-xs font-semibold tabular-nums">
                {Math.round(zoom * 100)}%
              </button>
            )}
            <button
              type="button"
              aria-label={t("zoom.in")}
              disabled={zoom >= MAX_ZOOM}
              onClick={() => (cropId ? focusCrop(cropId, zoom * 1.5) : zoomTo(zoom * 1.5))}
              className="flex h-9 w-9 items-center justify-center rounded-full disabled:text-disabled"
            >
              <Icon name="plus" size={18} />
            </button>
          </div>
        )}

        {!sheetOpen && <CoachTips />}
      </div>

      {/* Play bar: only for a selected video / animated element, or while playing (owner, 2026-10-17). */}
      {!sheetOpen && (playing || selectedIsVideo || (!!selected && hasMotion(selected)) || (!selected && !!doc.music)) && <PlaybackBar />}

      {videoProgress && (
        <div role="status" className="flex items-center gap-3 bg-surface px-4 py-2 text-sm">
          <span className="min-w-0 flex-1 truncate">{t("import.videoProgress", { name: videoProgress.name, pct: Math.round(videoProgress.value * 100) })}</span>
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full bg-accent" style={{ width: `${Math.round(videoProgress.value * 100)}%` }} />
          </span>
        </div>
      )}

      {errors.length > 0 && (
        <div role="alert" className="bg-surface px-4 py-2 text-sm text-danger">
          {errors.join(" ")}
        </div>
      )}

      {/* "+ → Video / Files" (editor-v2/11 §1): free photos / videos like the photo button. */}
      <input
        ref={videoInput}
        type="file"
        accept="video/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) void importFiles(files.slice(0, MAX_FREE_PHOTOS), currentSlide);
        }}
      />
      <input
        ref={filesInput}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) void importFiles(files.slice(0, MAX_FREE_PHOTOS), currentSlide);
        }}
      />
      <input
        ref={addInput}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => {
          // Free photos on the slide in view, at most 10 at once (editor-v2/09 §2).
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length) return;
          if (files.length > MAX_FREE_PHOTOS && doc.elements.length > 0) showNotice(t("photos.trimmed", { count: MAX_FREE_PHOTOS }));
          void importFiles(doc.elements.length > 0 ? files.slice(0, MAX_FREE_PHOTOS) : files, currentSlide);
        }}
      />

      {swapFrom && (
        <div role="status" className="flex items-center justify-between gap-3 bg-accent-soft px-4 py-2.5 text-sm">
          <span>{t("editor.swapHint")}</span>
          <button type="button" onClick={() => store.startSwap(null)} className="font-semibold text-accent-text">
            {t("common.cancel")}
          </button>
        </div>
      )}

      {/* A content sheet (layers, elements, new slide) takes the toolbar's place and pushes the canvas up. */}
      {!contentSheet && bottom}

      {tool === "layout" && (
        <LayoutPicker
          photos={usedPhotos}
          ratio={doc.ratio}
          slides={doc.slideCount}
          type={doc.type}
          grid={doc.grid}
          onClose={close}
          onApply={(tpl, photos, options) => {
            store.applyLayout(tpl, photos, options);
            close();
          }}
        />
      )}
      {fillFrame && (
        <FillFrameSheet
          replace={fillFrame.mode === "replace"}
          max={fillFrame.mode === "replace" ? 1 : Math.max(1, fillTargets(doc, fillFrame.id).length)}
          onClose={store.closeFillFrame}
          onFiles={async (files) => {
            const { id, mode } = fillFrame;
            const max = mode === "replace" ? 1 : Math.max(1, fillTargets(doc, id).length);
            if (files.length > max) showNotice(t("fill.trimmed", { count: max }));
            store.closeFillFrame();
            const assets = await decodeFiles(files.slice(0, max));
            if (mode === "replace") {
              if (assets[0]) store.replaceImage(id, assets[0]);
            } else store.fillEmpty(id, assets);
          }}
        />
      )}
      {notice && (
        <div role="status" className="pointer-events-none fixed inset-x-0 bottom-28 z-30 flex justify-center px-4">
          <span className="rounded-full bg-text px-4 py-2 text-sm text-bg shadow-lg">{notice}</span>
        </div>
      )}
      {tool === "bgTools" && selected?.type === "image" && (
        // Background tools (editor-v2/09 §9).
        <ActionSheet
          title={t("bg.title")}
          actions={[
            selected.originalAssetId
              ? { key: "restore" as const, label: t("bg.restore"), icon: "reset" as const }
              : { key: "remove" as const, label: t("bg.remove"), icon: "sparkles" as const },
            { key: "cutout" as const, label: t("bg.cutout"), icon: "lasso" as const },
            { key: "erase" as const, label: t("bg.erase"), icon: "eraser" as const },
          ]}
          onAction={(key) => {
            if (key === "remove") setRemoveBgFor(selected.id);
            else if (key === "restore") store.restoreOriginal(selected.id);
            else setTool(key);
          }}
          onClose={close}
        />
      )}
      {(tool === "cutout" || tool === "erase") && selected && <MaskScreen elementId={selected.id} mode={tool === "cutout" ? "cutout" : "erase"} onClose={close} />}
      {(tool === "adjust" || tool === "filters") && selected && (
        // Full-screen "Adjust" (editor-v2/09 §8): filters and every adjustment.
        <PhotoEditScreen elementId={selected.id} start={tool === "filters" ? "filters" : "exposure"} onClose={close} />
      )}
      {tool === "newSlide" && (
        <NewSlideSheet
          aspect={slide.width / slide.height}
          onClose={close}
          onPick={(layoutId) => {
            close();
            store.addSlide(doc.slideCount, layoutId);
            onSlidesChanged(useEditor.getState().doc!.slideCount);
          }}
        />
      )}
      {tool === "more" && <ActionSheet title={t("editor.more")} actions={moreActions()} onAction={runMore} onClose={close} />}
      {tool === "projectMenu" && (
        <ProjectMenu
          canRatio={!isGrid}
          slidesLabel={isGrid ? t("editor.grid") : doc.type === "story" ? t("editor.frames") : t("editor.slides")}
          onClose={close}
          onPick={(key) => runMore(key)}
        />
      )}
      {tool === "layers" && <LayersSheet onClose={close} />}
      {tool === "trim" && selected && <TrimTool elementId={selected.id} onClose={close} />}
      {tool === "library" && <LibrarySheet kind={library} onClose={close} onNotice={showNotice} />}
      {tool === "preview" && <PreviewScreen onClose={close} />}
      {tool === "ratio" && (
        // Another slide shape for the whole project (editor-v2/12 §2).
        <ActionSheet
          title={t("pm.ratioTitle")}
          actions={(["4:5", "3:4", "1:1", "9:16", "1.91:1", "2:3", "4:3", "16:9"] as const).map((r) => ({ key: r, label: r, icon: "crop" as const }))}
          onAction={(r) => store.setRatio(r)}
          onClose={close}
        />
      )}
      {tool === "newLayer" && (
        <NewLayerSheet
          onClose={close}
          onPick={(key) => {
            close();
            if (key === "photo") addInput.current?.click();
            else if (key === "video") videoInput.current?.click();
            else if (key === "files") filesInput.current?.click();
            else if (key === "text") addText();
            else if (key === "draw") {
              store.startDrawing();
              setTool("draw");
            } else openLibrary(key);
          }}
        />
      )}

      {removeBgFor && <RemoveBgDialog elementId={removeBgFor} onClose={() => setRemoveBgFor(null)} />}
      {exportOpen && <ExportSheet contentLayerRef={contentLayerRef} viewScale={viewScale} onClose={() => setExportOpen(false)} />}
    </main>
  );
}
