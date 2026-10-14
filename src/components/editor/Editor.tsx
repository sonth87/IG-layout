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
import { useT } from "@/store/settings";
import CanvasStage from "./canvas/CanvasStage";
import { isTouchUI } from "./canvas/interaction";
import { type Action, ActionSheet, CoachTips, LayersSheet } from "./EditorSheets";
import { ExportSheet } from "./ExportSheet";
import { SlideNavigator } from "./SlideNavigator";
import { AdjustTool, FilterTool } from "./tools/ColorTools";
import { CropTool } from "./tools/CropTool";
import { ElementsSheet } from "./tools/ElementsSheet";
import { FillTool, MaskTool, StyleTool } from "./tools/ElementTools";
import { BackgroundTool, SlidesTool } from "./tools/ProjectTools";
import { TextEditDialog, TextTool } from "./tools/TextTools";
import { useImportPhotos } from "./useImportPhotos";
import { useShortcuts } from "./useShortcuts";

const STAGE_PADDING = 24;
const LABEL_SPACE = 20;
/**
 * Room kept for the tallest bottom bar (slide strip + selection toolbar). The canvas is
 * sized against the screen minus this, not against whatever bar is showing, so it
 * never changes size when you select something or open a tool (F-03).
 */
const DOCK_RESERVE = 210;
const MIN_ZOOM = 1;
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
  | "layers";
/** Tools that edit a draft (✕ / ✓). */
const DRAFT_TOOLS: Tool[] = ["crop", "mask", "style", "adjust", "filters", "text", "fill", "background"];

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
        : Math.min((height - STAGE_PADDING * 2 - LABEL_SPACE) / slide.height, (el.clientWidth * 0.86) / slide.width);
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
      className={`flex h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1.5 px-0.5 text-[11px] leading-tight ${
        props.danger ? "text-danger" : ""
      }`}
    >
      <Icon name={props.icon} />
      <span className="max-w-full truncate">{props.label}</span>
    </button>
  );
}

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
  const { importFiles, decodeFiles, busy, errors } = useImportPhotos();

  const areaRef = useRef<HTMLDivElement>(null);
  const contentLayerRef = useRef<Konva.Layer>(null);
  const addInput = useRef<HTMLInputElement>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [tool, setTool] = useState<Tool | null>(null);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [zoom, setZoom] = useState(1);
  const pinchZoomStart = useRef(1);
  useShortcuts(tool === null && !editingText && !exportOpen);

  const size = canvasSize(doc);
  const { slide } = size;
  const isGrid = doc.type === "grid";
  const sheetOpen = tool !== null && tool !== "more" && tool !== "layers" && tool !== "elements" && tool !== "layout";
  const base = useBaseScale(areaRef, slide, isGrid ? size.width : null);
  const baseScale = base.scale;
  const viewScale = baseScale * zoom;
  /** Canvas origin inside the scroll content: vertically centred when it fits. */
  const originFor = (s: number) => ({
    x: STAGE_PADDING,
    y: Math.max(STAGE_PADDING + LABEL_SPACE, Math.round((base.height - size.height * s + LABEL_SPACE) / 2)),
  });
  const origin = originFor(viewScale);
  const areaSize = useAreaSize(areaRef);
  const selected = doc.elements.find((el) => el.id === selectedId);
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

  function openTool(next: Tool) {
    if (DRAFT_TOOLS.includes(next)) store.beginDraft();
    setTool(next);
    // Keep what is being edited in view above the sheet (UX-08).
    if (selected) requestAnimationFrame(() => reveal(selected.x + selected.width / 2, selected.y + selected.height / 2));
  }

  function goToSlide(index: number) {
    const r = slideRect(doc, Math.min(index, doc.slideCount - 1));
    store.setCurrentSlide(index);
    requestAnimationFrame(() => reveal(r.x + r.width / 2, r.y + r.height / 2, true));
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

  /** Zoom around the middle of the visible area. */
  function zoomTo(next: number) {
    const area = areaRef.current;
    const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next));
    if (!area || z === zoom) return;
    const cx = (area.scrollLeft + area.clientWidth / 2 - origin.x) / viewScale;
    const cy = (area.scrollTop + area.clientHeight / 2 - origin.y) / viewScale;
    setZoom(z);
    requestAnimationFrame(() => {
      const s = baseScale * z;
      const o = originFor(s);
      area.scrollTo({
        left: o.x + cx * s - area.clientWidth / 2,
        top: o.y + cy * s - area.clientHeight / 2,
      });
    });
  }

  async function onBack() {
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
    <section aria-label={label} className="rounded-t-[18px] bg-surface px-2 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {children}
    </section>
  );

  type MoreKey = "background" | "slides" | "layers" | "replace" | "swap" | "mask" | "up" | "down" | "front" | "back" | "lock" | "unrotate";

  /** Secondary actions for the selection ("⋯ More"), described as data. */
  function moreActions(): Action<MoreKey>[] {
    if (!selected) {
      return [
        { key: "background", label: t("editor.background"), icon: "background" },
        { key: "slides", label: isGrid ? t("editor.grid") : doc.type === "story" ? t("editor.frames") : t("editor.slides"), icon: "slides" },
        { key: "layers", label: t("layers.title"), icon: "layers" },
      ];
    }
    const list: Action<MoreKey>[] = [];
    if (selected.type === "image") {
      if (selected.assetId) list.push({ key: "replace", label: t("editor.replace"), icon: "replace" });
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
    if (!id) return;
    if (key === "replace") return pickReplacement();
    if (key === "swap") return store.startSwap(id);
    if (key === "mask") return openTool("mask");
    if (key === "up" || key === "down") return store.moveLayer(id, key);
    if (key === "front" || key === "back") return store.moveLayerTo(id, key);
    if (key === "lock") return store.toggleLock(id);
    if (key === "unrotate") return store.updateElement(id, { rotation: 0 });
  }

  const more = <ToolButton label={t("editor.more")} icon="more" onClick={() => setTool("more")} />;

  let bottom: React.ReactNode;
  if (tool === "mask" && selected) bottom = <MaskTool elementId={selected.id} onClose={close} />;
  else if (tool === "style" && selected) bottom = <StyleTool elementId={selected.id} onClose={close} />;
  else if (tool === "adjust" && selected) bottom = <AdjustTool elementId={selected.id} onClose={close} />;
  else if (tool === "filters" && selected) bottom = <FilterTool elementId={selected.id} onClose={close} />;
  else if (tool === "text" && selected) bottom = <TextTool elementId={selected.id} onClose={close} />;
  else if (tool === "fill" && selected) bottom = <FillTool elementId={selected.id} onClose={close} />;
  else if (tool === "background") bottom = <BackgroundTool onClose={close} />;
  else if (tool === "slides") bottom = <SlidesTool onClose={close} showSafeZone={showSafeZone} onSafeZone={setShowSafeZone} />;
  else if (selected) {
    // Primary tools (≤ 5) + "More"; duplicate / delete always visible in the header (UX-03).
    let tools: React.ReactNode;
    if (selected.type === "image" && !selected.assetId)
      tools = (
        <>
          <ToolButton label={t("editor.addPhoto")} icon="image" onClick={() => pickReplacement()} />
          {selected.slot && <ToolButton label={t("editor.swap")} icon="swap" onClick={() => store.startSwap(selected.id)} />}
          <ToolButton label={t("editor.style")} icon="style" onClick={() => openTool("style")} />
          {more}
        </>
      );
    else if (selected.type === "image")
      tools = (
        <>
          <ToolButton label={t("editor.crop")} icon="crop" onClick={() => openTool("crop")} />
          <ToolButton label={t("editor.adjust")} icon="adjust" onClick={() => openTool("adjust")} />
          <ToolButton label={t("editor.filters")} icon="filters" onClick={() => openTool("filters")} />
          {selected.locked ? (
            <ToolButton label={t("editor.unlock")} icon="unlock" onClick={() => store.toggleLock(selected.id)} />
          ) : (
            <ToolButton label={t("editor.style")} icon="style" onClick={() => openTool("style")} />
          )}
          {more}
        </>
      );
    else if (selected.type === "text")
      tools = (
        <>
          <ToolButton label={t("editor.editText")} icon="pencil" onClick={() => store.setEditingText(selected.id)} />
          <ToolButton label={t("editor.textStyle")} icon="text" onClick={() => openTool("text")} />
          {more}
        </>
      );
    else
      tools = (
        <>
          <ToolButton label={t("tool.color")} icon="palette" onClick={() => openTool("fill")} />
          {more}
        </>
      );
    bottom = sheet(
      t("editor.tools"),
      <>
        <div className="flex items-center gap-1 px-2.5 pb-1">
          <span className="flex-1 text-[13px] font-semibold tracking-wider text-muted uppercase">
            {t(`editor.kind.${selected.type}`)}
            {selected.locked && <Icon name="lock" size={13} />}
          </span>
          <button
            type="button"
            aria-label={t("editor.duplicate")}
            onClick={() => store.duplicateElement(selected.id)}
            className="flex h-9 w-10 items-center justify-center rounded-[10px]"
          >
            <Icon name="duplicate" size={20} />
          </button>
          <button
            type="button"
            aria-label={t("common.delete")}
            onClick={() => store.removeElement(selected.id)}
            className="flex h-9 w-10 items-center justify-center rounded-[10px] text-danger"
          >
            <Icon name="trash" size={20} />
          </button>
          <button
            type="button"
            onClick={() => store.select(null)}
            className="ml-1 h-8 rounded-[10px] border border-border px-3 text-[13px] font-semibold"
          >
            {t("common.done")}
          </button>
        </div>
        <div className="flex">{tools}</div>
      </>,
    );
  } else
    bottom = sheet(
      t("editor.tools"),
      <div className="flex">
        <ToolButton label={busy ? t("editor.importing") : t("editor.addPhotos")} icon="image" onClick={() => addInput.current?.click()} />
        <ToolButton label={t("editor.text")} icon="text" onClick={addText} />
        <ToolButton label={t("editor.elements")} icon="shapes" onClick={() => setTool("elements")} />
        <ToolButton label={t("editor.layout")} icon="layout" onClick={() => setTool("layout")} />
        {more}
      </div>,
    );

  return (
    <main className="mx-auto flex h-dvh max-w-3xl flex-col">
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
          className="relative flex-1 overflow-auto bg-canvas"
        >
          {viewScale > 0 && areaSize.width > 0 && (
            // Scroll content at full size; the stage sticks to the visible part (D-69).
            <div
              className="relative"
              style={{
                width: Math.max(areaSize.width, origin.x + STAGE_PADDING + size.width * viewScale),
                height: Math.max(areaSize.height, origin.y + STAGE_PADDING + size.height * viewScale),
              }}
            >
              <div className="sticky top-0 left-0" style={{ width: areaSize.width, height: areaSize.height }}>
                <CanvasStage
                  viewScale={viewScale}
                  viewport={areaSize}
                  scrollRef={areaRef}
                  origin={origin}
                  contentLayerRef={contentLayerRef}
                  showSafeZone={showSafeZone}
                  onPinchZoom={(k, phase) => {
                    if (phase === "start") pinchZoomStart.current = zoom;
                    else if (phase === "move") zoomTo(pinchZoomStart.current * k);
                  }}
                />
              </div>
              {/* Where the canvas is in the scroll content (layout reference for tests). */}
              <div
                data-stage-frame
                className="pointer-events-none absolute"
                style={{ left: origin.x, top: origin.y, width: size.width * viewScale, height: size.height * viewScale }}
              />
              {!isGrid &&
                Array.from({ length: doc.slideCount }, (_, i) => (
                  <span
                    key={i}
                    className={`pointer-events-none absolute text-xs ${i === currentSlide ? "font-bold text-accent-text" : "text-muted"}`}
                    style={{ left: origin.x + slideRect(doc, i).x * viewScale, top: origin.y - LABEL_SPACE - 2 }}
                  >
                    {t("editor.slideOf", { index: i + 1, count: doc.slideCount })}
                  </span>
                ))}
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
          zoom > 1 && (
            <button
              type="button"
              aria-label={t("zoom.fit")}
              onClick={() => zoomTo(1)}
              className="absolute right-2 bottom-2 h-9 rounded-full border border-border bg-surface/90 px-3 text-xs font-semibold tabular-nums shadow-sm"
            >
              {Math.round(zoom * 100)}%
            </button>
          )
        ) : (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full border border-border bg-surface/90 p-0.5 shadow-sm">
            <button
              type="button"
              aria-label={t("zoom.out")}
              disabled={zoom <= MIN_ZOOM}
              onClick={() => zoomTo(zoom / 1.5)}
              className="flex h-9 w-9 items-center justify-center rounded-full disabled:text-disabled"
            >
              <Icon name="minus" size={18} />
            </button>
            {zoom > 1 && (
              <button type="button" aria-label={t("zoom.fit")} onClick={() => zoomTo(1)} className="h-9 px-1 text-xs font-semibold tabular-nums">
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

      {!isGrid && !sheetOpen && <SlideNavigator onPick={goToSlide} />}

      {errors.length > 0 && (
        <div role="alert" className="bg-surface px-4 py-2 text-sm text-danger">
          {errors.join(" ")}
        </div>
      )}

      <input
        ref={addInput}
        type="file"
        accept="image/*"
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
        accept="image/*"
        hidden
        onChange={async (e) => {
          // Copy before clearing the input: clearing empties its FileList.
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length || !selected) return;
          const [asset] = await decodeFiles(files);
          if (asset) store.replaceImage(selected.id, asset);
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
      {tool === "more" && <ActionSheet title={t("editor.more")} actions={moreActions()} onAction={runMore} onClose={close} />}
      {tool === "layers" && <LayersSheet onClose={close} />}
      {tool === "crop" && selected && <CropTool elementId={selected.id} onClose={close} />}
      {tool === "elements" && <ElementsSheet onClose={close} />}
      {editingText && <TextEditDialog elementId={editingText} onClose={() => store.setEditingText(null)} />}

      {exportOpen && <ExportSheet contentLayerRef={contentLayerRef} viewScale={viewScale} onClose={() => setExportOpen(false)} />}
    </main>
  );
}
