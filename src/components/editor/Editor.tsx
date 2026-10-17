"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { LayoutPicker } from "@/components/layout/LayoutPicker";
import { Icon, type IconName } from "@/components/ui/Icon";
import { newText } from "@/lib/elements/create";
import { canvasSize, slideAt, slideRect } from "@/lib/project/layout";
import { type ImageAsset, isImage } from "@/lib/project/types";
import { flushSave, useSaveStatus } from "@/store/autosave";
import { useEditor, useViewDoc } from "@/store/editor";
import { WEB_FONTS } from "@/lib/text/webfonts";
import { useT } from "@/store/settings";
import CanvasStage from "./canvas/CanvasStage";
import { isTouchUI } from "./canvas/interaction";
import { type Action, ActionSheet, CoachTips, LayersSheet } from "./EditorSheets";
import { ExportSheet } from "./ExportSheet";
import { RemoveBgDialog } from "./RemoveBgDialog";
import { FloatingMenu } from "./FloatingMenu";
import { NewSlideSheet } from "./NewSlideSheet";
import { SlideControls } from "./SlideControls";
import { AdjustTool, FilterTool } from "./tools/ColorTools";
import { CropTool } from "./tools/CropTool";
import { DrawTool } from "./tools/DrawTool";
import { SoundTool } from "./tools/SoundTool";
import { TrimTool } from "./tools/TrimTool";
import { AnimationTool } from "./tools/AnimationTool";
import { MusicTool } from "./tools/MusicTool";
import { PlaybackBar } from "./PlaybackBar";
import { attachMusic, detachMusic, pause as pausePlayback, resetPlayback, seek, usePlayback } from "@/lib/video/playback";
import { ElementsSheet } from "./tools/ElementsSheet";
import { FillTool, MaskTool, StyleTool } from "./tools/ElementTools";
import { BackgroundTool, SlidesTool } from "./tools/ProjectTools";
import { TextEditDialog, TextTool } from "./tools/TextTools";
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
const REPLACE_INPUT_ID = "replace-photo-input";

/** Opens the photo picker for "Replace" / "Add photo". */
function pickReplacement() {
  document.getElementById(REPLACE_INPUT_ID)?.click();
}
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
  | "newSlide";
/** Tools that edit a draft (✕ / ✓). */
const DRAFT_TOOLS: Tool[] = ["crop", "mask", "style", "adjust", "filters", "text", "fill", "background", "sound", "animate"];

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
      <Icon name={props.icon} />
    </button>
  );
}

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

export function Editor({ onClose }: { onClose: () => void }) {
  const t = useT();
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
  useShortcuts(tool === null && !editingText && !exportOpen);

  const size = canvasSize(doc);
  const { slide } = size;
  const isGrid = doc.type === "grid";
  const sheetOpen = tool !== null && tool !== "more" && tool !== "layers" && tool !== "elements" && tool !== "layout" && tool !== "newSlide";
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
    !ready || isGrid ? 1 : Math.max(minZoom, Math.min(1, (areaSize.width - FIT_MARGIN * 2 - PLUS_SPACE) / (width * baseScale)));
  const fitZoom = fitFor(size.width);
  const zoom = userZoom ?? easing ?? fitZoom;
  const viewScale = baseScale * zoom;
  /** Canvas origin inside the scroll content: vertically centred when it fits. */
  const originFor = (s: number) => ({
    // Zoomed out narrower than the screen: centred (S5).
    x: Math.max(isGrid ? STAGE_PADDING : FIT_MARGIN, Math.round((areaSize.width - size.width * s - (isGrid ? 0 : PLUS_SPACE)) / 2)),
    y: Math.max(STAGE_PADDING + LABEL_SPACE, Math.round((base.height - size.height * s - (isGrid ? 0 : CONTROLS_SPACE) + LABEL_SPACE) / 2)),
  });
  const origin = originFor(viewScale);
  const selected = doc.elements.find((el) => el.id === selectedId);
  const selectedIsVideo = selected?.type === "image" && !!(selected.assetId && assets[selected.assetId]?.video);
  /** Photos used in the project, back to front, without duplicates (for re-layout). */
  const usedPhotos = [...new Set(doc.elements.filter(isImage).map((el) => el.assetId).filter((id): id is string => !!id))]
    .map((id) => assets[id])
    .filter((a): a is ImageAsset => !!a);

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

  /** Zoom around the middle of the visible area. `elastic`: may go a little below the smallest zoom (pinch). */
  function zoomTo(next: number, elastic = false) {
    const area = areaRef.current;
    let z = Math.min(MAX_ZOOM, next);
    // Below the smallest zoom the canvas resists, and springs back on release (editor-v2/05 §2.3).
    if (z < minZoom) z = elastic ? minZoom * (z / minZoom) ** 0.3 : minZoom;
    if (!area || z === zoom) return;
    const cx = (area.scrollLeft + area.clientWidth / 2 - origin.x) / viewScale;
    const cy = (area.scrollTop + area.clientHeight / 2 - origin.y) / viewScale;
    setEasing(null);
    setUserZoom(z);
    requestAnimationFrame(() => {
      const s = baseScale * z;
      const o = originFor(s);
      area.scrollTo({
        left: o.x + cx * s - area.clientWidth / 2,
        top: o.y + cy * s - area.clientHeight / 2,
      });
    });
  }

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
    store.setEditingText(el.id);
  }

  const close = () => setTool(null);
  const sheet = (label: string, children: React.ReactNode) => (
    // Floating over the canvas colour, not a full-width panel (editor-v2/01, 07 §5).
    <section aria-label={label} className="bg-(--canvas) px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {children}
    </section>
  );

  type MoreKey = "background" | "slides" | "layers" | "draw" | "music" | "replace" | "swap" | "mask" | "up" | "down" | "front" | "back" | "lock" | "unrotate" | "removeBg" | "crop" | "animate";

  /** Secondary actions for the selection ("⋯ More"), described as data. */
  function moreActions(): Action<MoreKey>[] {
    if (!selected) {
      return [
        { key: "background", label: t("editor.background"), icon: "background" },
        { key: "slides", label: isGrid ? t("editor.grid") : doc.type === "story" ? t("editor.frames") : t("editor.slides"), icon: "slides" },
        { key: "music", label: t("music.title"), icon: "music" },
        { key: "draw", label: t("editor.draw"), icon: "pencil" },
      ];
    }
    const list: Action<MoreKey>[] = [];
    if (selected.type === "image") {
      if (selected.assetId) list.push({ key: "replace", label: t("editor.replace"), icon: "replace" });
      if (selectedIsVideo) list.unshift({ key: "crop", label: t("editor.crop"), icon: "crop" }, { key: "animate", label: t("editor.animate"), icon: "motion" });
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
    if (key === "music") return setTool("music");
    if (key === "draw") {
      store.startDrawing();
      return setTool("draw");
    }
    if (!id) return;
    if (key === "replace") return pickReplacement();
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
  else if (tool === "style" && selected) bottom = <StyleTool elementId={selected.id} onClose={close} />;
  else if (tool === "adjust" && selected) bottom = <AdjustTool elementId={selected.id} onClose={close} />;
  else if (tool === "filters" && selected) bottom = <FilterTool elementId={selected.id} onClose={close} />;
  else if (tool === "text" && selected) bottom = <TextTool elementId={selected.id} onClose={close} />;
  else if (tool === "fill" && selected) bottom = <FillTool elementId={selected.id} onClose={close} />;
  else if (tool === "background") bottom = <BackgroundTool onClose={close} />;
  else if (tool === "draw") bottom = <DrawTool onClose={close} />;
  else if (tool === "music") bottom = <MusicTool onClose={close} />;
  else if (tool === "sound" && selected) bottom = <SoundTool elementId={selected.id} onClose={close} />;
  else if (tool === "animate" && selected) bottom = <AnimationTool elementId={selected.id} onClose={close} />;
  else if (tool === "slides") bottom = <SlidesTool onClose={close} showSafeZone={showSafeZone} onSafeZone={setShowSafeZone} />;
  else if (selected) {
    // Tools for the selection (≤ 4) + Done. Duplicate / delete / lock / more float over
    // the element (S7). Same height as the bar with nothing selected (F-03).
    let tools: React.ReactNode;
    if (selected.type === "image" && !selected.assetId)
      tools = (
        <>
          <ToolButton label={t("editor.addPhoto")} icon="image" onClick={() => pickReplacement()} />
          {selected.slot && <ToolButton label={t("editor.swap")} icon="swap" onClick={() => store.startSwap(selected.id)} />}
          <ToolButton label={t("editor.style")} icon="style" onClick={() => openTool("style")} />
        </>
      );
    else if (selected.type === "image" && selectedIsVideo)
      // Video: trim, sound, colour; crop is in ⋯ (M13.3).
      tools = (
        <>
          <ToolButton label={t("trim.title")} icon="scissors" onClick={() => openTool("trim")} />
          <ToolButton label={t("video.sound")} icon="volume" onClick={() => openTool("sound")} />
          <ToolButton label={t("editor.filters")} icon="filters" onClick={() => openTool("filters")} />
          <ToolButton label={t("editor.adjust")} icon="adjust" onClick={() => openTool("adjust")} />
          {/* Lock / unlock is in the floating menu, not instead of Style. */}
          <ToolButton label={t("editor.style")} icon="style" onClick={() => openTool("style")} />
        </>
      );
    else if (selected.type === "image")
      tools = (
        <>
          <ToolButton label={t("editor.crop")} icon="crop" onClick={() => openTool("crop")} />
          <ToolButton label={t("editor.adjust")} icon="adjust" onClick={() => openTool("adjust")} />
          <ToolButton label={t("editor.filters")} icon="filters" onClick={() => openTool("filters")} />
          {/* Lock / unlock is in the floating menu, not instead of Style. */}
          <ToolButton label={t("editor.style")} icon="style" onClick={() => openTool("style")} />
          <ToolButton label={t("editor.animate")} icon="motion" onClick={() => openTool("animate")} />
        </>
      );
    else if (selected.type === "layout")
      // Layout block (M14): change the split; move / resize / turn on the canvas.
      tools = (
        <>
          <ToolButton label={t("editor.layout")} icon="layout" onClick={() => setTool("layout")} />
        </>
      );
    else if (selected.type === "text")
      tools = (
        <>
          <ToolButton label={t("editor.editText")} icon="pencil" onClick={() => store.setEditingText(selected.id)} />
          <ToolButton label={t("editor.textStyle")} icon="text" onClick={() => openTool("text")} />
          <ToolButton label={t("editor.animate")} icon="motion" onClick={() => openTool("animate")} />
        </>
      );
    else
      tools = (
        <>
          {/* Emoji keep their own colours: opacity only (still in the Color tool). */}
          <ToolButton label={selected.type === "icon" && selected.svg ? t("tool.opacity") : t("tool.color")} icon="palette" onClick={() => openTool("fill")} />
          <ToolButton label={t("editor.animate")} icon="motion" onClick={() => openTool("animate")} />
        </>
      );
    bottom = sheet(
      t("editor.tools"),
      <div className="flex items-center gap-2">
        {/* Slides sideways when the tools don't fit; ✕ deselects (editor-v2/07 §5). */}
        <div className={`no-scrollbar flex h-14 min-w-0 flex-1 overflow-x-auto px-1 ${PILL}`}>
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
          <PillButton label={t("editor.elements")} icon="shapes" onClick={() => setTool("elements")} />
          <PillButton label={t("editor.layout")} icon="layout" onClick={() => setTool("layout")} />
          <PillButton label={t("editor.more")} icon="more" onClick={() => setTool("more")} />
        </div>
        {/* Layers stand apart from the tools, as a round button on the right (D-92). */}
        <button type="button" aria-label={t("layers.title")} onClick={() => setTool("layers")} className={ROUND}>
          <Icon name="layers" />
        </button>
      </div>,
    );

  return (
    // data-fonts uses the text-font module so its @font-face CSS ships with the editor (M11).
    <main data-fonts={WEB_FONTS} className="flex h-dvh flex-col">
      <header className="flex items-center gap-0.5 px-2 pt-2.5 pb-1.5">
        <button type="button" aria-label={t("common.back")} onClick={onBack} className="flex h-11 w-11 items-center justify-center">
          <Icon name="back" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[15px] font-semibold">
            {doc.type === "grid"
              ? t("editor.titleGrid", { rows: doc.grid?.rows ?? 1 })
              : doc.type === "story"
                ? t("editor.titleStory", { count: doc.slideCount })
                : t("editor.title", { ratio: doc.ratio, count: doc.slideCount })}
          </span>
          <SaveIndicator />
        </div>
        <button
          type="button"
          aria-label={t("editor.undo")}
          disabled={!canUndo || sheetOpen}
          onClick={store.undo}
          className="flex h-11 w-11 items-center justify-center disabled:text-disabled"
        >
          <Icon name="undo" />
        </button>
        <button
          type="button"
          aria-label={t("editor.redo")}
          disabled={!canRedo || sheetOpen}
          onClick={store.redo}
          className="flex h-11 w-11 items-center justify-center disabled:text-disabled"
        >
          <Icon name="redo" />
        </button>
        <button
          type="button"
          disabled={doc.elements.length === 0 || sheetOpen}
          onClick={() => {
            store.select(null);
            setExportOpen(true);
          }}
          className="ml-1 h-[38px] rounded-xl bg-accent px-3.5 text-sm font-bold text-on-accent disabled:opacity-50"
        >
          {t("editor.export")}
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
                  onPinchZoom={(k, phase) => {
                    if (phase === "start") pinchZoomStart.current = zoom;
                    else if (phase === "move") zoomTo(pinchZoomStart.current * k, true);
                    else if (zoom < minZoom) easeZoom(minZoom, minZoom >= fitZoom);
                  }}
                  onFit={fitAll}
                />
                {!sheetOpen && <FloatingMenu scrollRef={areaRef} onMore={() => setTool("more")} />}
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
          Math.abs(zoom - fitZoom) > 0.01 && (
            <button
              type="button"
              aria-label={t("zoom.fit")}
              onClick={fitAll}
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
              onClick={() => zoomTo(zoom / 1.5)}
              className="flex h-9 w-9 items-center justify-center rounded-full disabled:text-disabled"
            >
              <Icon name="minus" size={18} />
            </button>
            {Math.abs(zoom - fitZoom) > 0.01 && (
              <button type="button" aria-label={t("zoom.fit")} onClick={fitAll} className="h-9 px-1 text-xs font-semibold tabular-nums">
                {Math.round(zoom * 100)}%
              </button>
            )}
            <button
              type="button"
              aria-label={t("zoom.in")}
              disabled={zoom >= MAX_ZOOM}
              onClick={() => zoomTo(zoom * 1.5)}
              className="flex h-9 w-9 items-center justify-center rounded-full disabled:text-disabled"
            >
              <Icon name="plus" size={18} />
            </button>
          </div>
        )}

        {!sheetOpen && <CoachTips />}
      </div>

      {!sheetOpen && <PlaybackBar />}

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

      <input
        ref={addInput}
        type="file"
        accept="image/*,video/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) void importFiles(e.target.files, currentSlide);
          e.target.value = "";
        }}
      />
      <input
        id={REPLACE_INPUT_ID}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={async (e) => {
          // Copy before clearing the input: clearing empties its FileList.
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          // The cell selected when the picker opened (tapping an empty "+" cell selects it).
          const target = useEditor.getState().selectedId;
          if (!files.length || !target) return;
          const [asset] = await decodeFiles(files);
          if (asset) store.replaceImage(target, asset);
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

      {bottom}

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
      {tool === "layers" && <LayersSheet onClose={close} />}
      {tool === "crop" && selected && <CropTool elementId={selected.id} onClose={close} />}
      {tool === "trim" && selected && <TrimTool elementId={selected.id} onClose={close} />}
      {tool === "elements" && <ElementsSheet onClose={close} />}
      {editingText && <TextEditDialog elementId={editingText} onClose={() => store.setEditingText(null)} />}

      {removeBgFor && <RemoveBgDialog elementId={removeBgFor} onClose={() => setRemoveBgFor(null)} />}
      {exportOpen && <ExportSheet contentLayerRef={contentLayerRef} viewScale={viewScale} onClose={() => setExportOpen(false)} />}
    </main>
  );
}
