"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { canvasSize, slideAt, slideRect } from "@/lib/project/layout";
import { isImage } from "@/lib/project/types";
import { flushSave } from "@/store/autosave";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import CanvasStage from "./canvas/CanvasStage";
import { ExportSheet } from "./ExportSheet";
import { CropTool } from "./tools/CropTool";
import { AdjustTool, FilterTool } from "./tools/ColorTools";
import { ElementsSheet } from "./tools/ElementsSheet";
import { FillTool, MaskTool, StyleTool } from "./tools/ElementTools";
import { TextEditDialog, TextTool } from "./tools/TextTools";
import { newText } from "@/lib/elements/create";
import { BackgroundTool, SlidesTool } from "./tools/ProjectTools";
import { LayoutPicker } from "@/components/layout/LayoutPicker";
import type { ImageAsset } from "@/lib/project/types";
import { useImportPhotos } from "./useImportPhotos";
import { useShortcuts } from "./useShortcuts";

const STAGE_PADDING = 24;

type Tool = "crop" | "mask" | "style" | "adjust" | "filters" | "text" | "fill" | "elements" | "background" | "slides" | "layout";
/** Tools that edit a draft (✕ / ✓). Slides acts directly. */
const DRAFT_TOOLS: Tool[] = ["crop", "mask", "style", "adjust", "filters", "text", "fill", "background"];

/** Stage pixels per export pixel: a slide fits the area height and ~86% of its width. */
/**
 * Stage pixels per export pixel. Post / Story: a slide fits the area height and
 * ~86% of its width (scroll sideways). Grid: the whole grid width fits (scroll down).
 */
function useViewScale(
  area: React.RefObject<HTMLDivElement | null>,
  slide: { width: number; height: number },
  gridWidth: number | null,
) {
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const update = () => {
      if (gridWidth) return setScale(Math.max(0.05, (el.clientWidth - STAGE_PADDING * 2) / gridWidth));
      const h = el.clientHeight - STAGE_PADDING * 2 - 20;
      const w = el.clientWidth * 0.86;
      setScale(Math.max(0.05, Math.min(h / slide.height, w / slide.width)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [area, slide.width, slide.height, gridWidth]);
  return scale;
}

function ToolButton(props: { label: string; icon: IconName; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`flex h-16 min-w-16 flex-1 shrink-0 flex-col items-center justify-center gap-1.5 text-[11px] ${
        props.danger ? "text-danger" : ""
      }`}
    >
      <Icon name={props.icon} />
      {props.label}
    </button>
  );
}

export function Editor({ onClose }: { onClose: () => void }) {
  const t = useT();
  const doc = useViewDoc()!;
  const selectedId = useEditor((s) => s.selectedId);
  const currentSlide = useEditor((s) => s.currentSlide);
  const swapFrom = useEditor((s) => s.swapFrom);
  const assets = useEditor((s) => s.assets);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const {
    undo,
    redo,
    select,
    removeElement,
    moveLayer,
    duplicateElement,
    replaceImage,
    closeProject,
    beginDraft,
    setCurrentSlide,
    startSwap,
    applyLayout,
    addElement,
  } = useEditor.getState();
  const { importFiles, decodeFiles, busy, errors } = useImportPhotos();

  const areaRef = useRef<HTMLDivElement>(null);
  const contentLayerRef = useRef<Konva.Layer>(null);
  const addInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [tool, setTool] = useState<Tool | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [showSafeZone, setShowSafeZone] = useState(true);
  useShortcuts(tool === null && !editingText && !exportOpen);

  const size = canvasSize(doc);
  const { slide } = size;
  const isGrid = doc.type === "grid";
  const viewScale = useViewScale(areaRef, slide, isGrid ? size.width : null);
  const selected = doc.elements.find((el) => el.id === selectedId);
  /** Photos used in the project, back to front, without duplicates (for re-layout). */
  const usedPhotos = [...new Set(doc.elements.filter(isImage).map((el) => el.assetId).filter((id): id is string => !!id))]
    .map((id) => assets[id])
    .filter((a): a is ImageAsset => !!a);

  function openTool(next: Tool) {
    if (DRAFT_TOOLS.includes(next)) beginDraft();
    setTool(next);
  }

  /** Current slide = the one under the middle of the visible area. */
  function onScroll() {
    const area = areaRef.current;
    if (!area || viewScale <= 0) return;
    const x = (area.scrollLeft + area.clientWidth / 2 - STAGE_PADDING) / viewScale;
    const y = (area.scrollTop + area.clientHeight / 2 - STAGE_PADDING - 20) / viewScale;
    const index = slideAt(doc, x, y);
    if (index !== useEditor.getState().currentSlide) setCurrentSlide(index);
  }

  async function onBack() {
    select(null);
    await flushSave();
    closeProject();
    onClose();
  }

  const close = () => setTool(null);
  const sheet = (label: string, children: React.ReactNode) => (
    <section aria-label={label} className="rounded-t-[18px] bg-surface px-2 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      {children}
    </section>
  );
  /** Tools shared by every element type. */
  const commonTools = (id: string) => (
    <>
      <ToolButton label={t("editor.forward")} icon="layerUp" onClick={() => moveLayer(id, "up")} />
      <ToolButton label={t("editor.backward")} icon="layerDown" onClick={() => moveLayer(id, "down")} />
      <ToolButton label={t("editor.duplicate")} icon="duplicate" onClick={() => duplicateElement(id)} />
      <ToolButton label={t("common.delete")} icon="trash" danger onClick={() => removeElement(id)} />
    </>
  );

  let bottom: React.ReactNode;
  if (tool === "mask" && selected) bottom = <MaskTool elementId={selected.id} onClose={close} />;
  else if (tool === "style" && selected) bottom = <StyleTool elementId={selected.id} onClose={close} />;
  else if (tool === "adjust" && selected) bottom = <AdjustTool elementId={selected.id} onClose={close} />;
  else if (tool === "filters" && selected) bottom = <FilterTool elementId={selected.id} onClose={close} />;
  else if (tool === "text" && selected) bottom = <TextTool elementId={selected.id} onClose={close} />;
  else if (tool === "fill" && selected) bottom = <FillTool elementId={selected.id} onClose={close} />;
  else if (tool === "background") bottom = <BackgroundTool onClose={close} />;
  else if (tool === "slides")
    bottom = <SlidesTool onClose={close} showSafeZone={showSafeZone} onSafeZone={setShowSafeZone} />;
  else if (selected) {
    const header = (
      <div className="flex items-center justify-between px-2.5 pb-1.5">
        <span className="text-[13px] font-semibold tracking-wider text-muted uppercase">{t(`editor.kind.${selected.type}`)}</span>
        <button type="button" onClick={() => select(null)} className="h-8 rounded-[10px] border border-border px-3 text-[13px] font-semibold">
          {t("common.done")}
        </button>
      </div>
    );
    let tools: React.ReactNode;
    if (selected.type === "image")
      tools = (
        <>
          <ToolButton
            label={selected.assetId ? t("editor.replace") : t("editor.addPhoto")}
            icon={selected.assetId ? "replace" : "image"}
            onClick={() => replaceInput.current?.click()}
          />
          {selected.slot && <ToolButton label={t("editor.swap")} icon="swap" onClick={() => startSwap(selected.id)} />}
          {selected.assetId && <ToolButton label={t("editor.crop")} icon="crop" onClick={() => openTool("crop")} />}
          {selected.assetId && <ToolButton label={t("editor.adjust")} icon="adjust" onClick={() => openTool("adjust")} />}
          {selected.assetId && <ToolButton label={t("editor.filters")} icon="filters" onClick={() => openTool("filters")} />}
          {selected.frame === "none" && <ToolButton label={t("editor.mask")} icon="mask" onClick={() => openTool("mask")} />}
          <ToolButton label={t("editor.style")} icon="style" onClick={() => openTool("style")} />
          {commonTools(selected.id)}
        </>
      );
    else if (selected.type === "text")
      tools = (
        <>
          <ToolButton label={t("editor.editText")} icon="pencil" onClick={() => setEditingText(selected.id)} />
          <ToolButton label={t("editor.textStyle")} icon="text" onClick={() => openTool("text")} />
          {commonTools(selected.id)}
        </>
      );
    else
      tools = (
        <>
          <ToolButton label={t("tool.color")} icon="palette" onClick={() => openTool("fill")} />
          {commonTools(selected.id)}
        </>
      );
    bottom = sheet(
      t("editor.tools"),
      <>
        {header}
        <div className="flex overflow-x-auto">{tools}</div>
      </>,
    );
  } else
    bottom = sheet(
      t("editor.tools"),
      <div className="flex overflow-x-auto">
        <ToolButton label={busy ? t("editor.importing") : t("editor.addPhotos")} icon="image" onClick={() => addInput.current?.click()} />
        <ToolButton
          label={t("editor.text")}
          icon="text"
          onClick={() => {
            const el = newText(doc.ratio, slideRect(doc, currentSlide), t("text.placeholder"));
            addElement(el);
            setEditingText(el.id);
          }}
        />
        <ToolButton label={t("editor.elements")} icon="shapes" onClick={() => setTool("elements")} />
        <ToolButton label={t("editor.layout")} icon="layout" onClick={() => setTool("layout")} />
        <ToolButton label={t("editor.background")} icon="background" onClick={() => openTool("background")} />
        <ToolButton
          label={isGrid ? t("editor.grid") : doc.type === "story" ? t("editor.frames") : t("editor.slides")}
          icon="slides"
          onClick={() => openTool("slides")}
        />
      </div>,
    );

  return (
    <main className="mx-auto flex h-dvh max-w-3xl flex-col">
      <header className="flex items-center gap-0.5 px-2 pt-2.5 pb-1.5">
        <button type="button" aria-label={t("common.back")} onClick={onBack} className="flex h-11 w-11 items-center justify-center">
          <Icon name="back" />
        </button>
        <div className="min-w-0 flex-1 truncate text-[15px] font-semibold">
          {doc.type === "grid"
            ? t("editor.titleGrid", { rows: doc.grid?.rows ?? 1 })
            : doc.type === "story"
              ? t("editor.titleStory", { count: doc.slideCount })
              : t("editor.title", { ratio: doc.ratio, count: doc.slideCount })}
        </div>
        <button
          type="button"
          aria-label={t("editor.undo")}
          disabled={!canUndo || tool !== null}
          onClick={undo}
          className="flex h-11 w-11 items-center justify-center disabled:text-disabled"
        >
          <Icon name="undo" />
        </button>
        <button
          type="button"
          aria-label={t("editor.redo")}
          disabled={!canRedo || tool !== null}
          onClick={redo}
          className="flex h-11 w-11 items-center justify-center disabled:text-disabled"
        >
          <Icon name="redo" />
        </button>
        <button
          type="button"
          disabled={doc.elements.length === 0 || tool !== null}
          onClick={() => {
            select(null);
            setExportOpen(true);
          }}
          className="ml-1 h-[38px] rounded-xl bg-accent px-3.5 text-sm font-bold text-on-accent disabled:opacity-50"
        >
          {t("editor.export")}
        </button>
      </header>

      <div
        ref={areaRef}
        onScroll={onScroll}
        className={`relative flex-1 bg-canvas ${isGrid ? "overflow-y-auto" : "overflow-x-auto overflow-y-hidden"}`}
      >
        {viewScale > 0 && (
          <div className="relative inline-block" style={{ padding: STAGE_PADDING, paddingTop: STAGE_PADDING + 20 }}>
            {!isGrid && Array.from({ length: doc.slideCount }, (_, i) => (
              <span
                key={i}
                className={`absolute text-xs ${i === currentSlide ? "font-bold text-accent-text" : "text-muted"}`}
                style={{ left: STAGE_PADDING + slideRect(doc, i).x * viewScale, top: STAGE_PADDING - 2 }}
              >
                {t("editor.slideOf", { index: i + 1, count: doc.slideCount })}
              </span>
            ))}
            <CanvasStage viewScale={viewScale} contentLayerRef={contentLayerRef} showSafeZone={showSafeZone} />
          </div>
        )}
        {doc.elements.length === 0 && (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-sm text-muted">
            {busy ? t("editor.importingPhotos") : t("editor.emptyHint")}
          </p>
        )}
      </div>

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
        ref={replaceInput}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          // Copy before clearing the input: clearing empties its FileList.
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (!files.length || !selected) return;
          const [asset] = await decodeFiles(files);
          if (asset) replaceImage(selected.id, asset);
        }}
      />

      {swapFrom && (
        <div role="status" className="flex items-center justify-between gap-3 bg-accent-soft px-4 py-2.5 text-sm">
          <span>{t("editor.swapHint")}</span>
          <button type="button" onClick={() => startSwap(null)} className="font-semibold text-accent-text">
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
          onClose={() => setTool(null)}
          onApply={(tpl, photos, options) => {
            applyLayout(tpl, photos, options);
            setTool(null);
          }}
        />
      )}

      {tool === "crop" && selected && <CropTool elementId={selected.id} onClose={close} />}
      {tool === "elements" && <ElementsSheet onClose={close} />}
      {editingText && <TextEditDialog elementId={editingText} onClose={() => setEditingText(null)} />}

      {exportOpen && (
        <ExportSheet contentLayerRef={contentLayerRef} viewScale={viewScale} onClose={() => setExportOpen(false)} />
      )}
    </main>
  );
}
