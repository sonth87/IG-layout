"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { canvasSize } from "@/lib/project/types";
import { flushSave } from "@/store/autosave";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import CanvasStage from "./canvas/CanvasStage";
import { ExportSheet } from "./ExportSheet";
import { CropTool } from "./tools/CropTool";
import { MaskTool, StyleTool } from "./tools/ElementTools";
import { BackgroundTool, SlidesTool } from "./tools/ProjectTools";
import { LayoutPicker } from "@/components/layout/LayoutPicker";
import type { ImageAsset } from "@/lib/project/types";
import { useImportPhotos } from "./useImportPhotos";

const STAGE_PADDING = 24;

type Tool = "crop" | "mask" | "style" | "background" | "slides" | "layout";
/** Tools that edit a draft (✕ / ✓). Slides acts directly. */
const DRAFT_TOOLS: Tool[] = ["crop", "mask", "style", "background"];

/** Stage pixels per export pixel: a slide fits the area height and ~86% of its width. */
function useViewScale(area: React.RefObject<HTMLDivElement | null>, slide: { width: number; height: number }) {
  const [scale, setScale] = useState(0);
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const update = () => {
      const h = el.clientHeight - STAGE_PADDING * 2 - 20;
      const w = el.clientWidth * 0.86;
      setScale(Math.max(0.05, Math.min(h / slide.height, w / slide.width)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [area, slide.width, slide.height]);
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
  } = useEditor.getState();
  const { importFiles, decodeFiles, busy, errors } = useImportPhotos();

  const areaRef = useRef<HTMLDivElement>(null);
  const contentLayerRef = useRef<Konva.Layer>(null);
  const addInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [tool, setTool] = useState<Tool | null>(null);

  const { slide } = canvasSize(doc);
  const viewScale = useViewScale(areaRef, slide);
  const slideW = slide.width * viewScale;
  const selected = doc.elements.find((el) => el.id === selectedId);
  /** Photos used in the project, back to front, without duplicates (for re-layout). */
  const usedPhotos = [...new Set(doc.elements.map((el) => el.assetId).filter((id): id is string => !!id))]
    .map((id) => assets[id])
    .filter((a): a is ImageAsset => !!a);

  function openTool(next: Tool) {
    if (DRAFT_TOOLS.includes(next)) beginDraft();
    setTool(next);
  }

  function onScroll() {
    const area = areaRef.current;
    if (!area || slideW <= 0) return;
    const index = Math.round((area.scrollLeft + area.clientWidth / 2 - STAGE_PADDING) / slideW - 0.5);
    const clamped = Math.max(0, Math.min(doc.slideCount - 1, index));
    if (clamped !== useEditor.getState().currentSlide) setCurrentSlide(clamped);
  }

  async function onBack() {
    select(null);
    await flushSave();
    closeProject();
    onClose();
  }

  let bottom: React.ReactNode;
  if (tool === "mask" && selected) bottom = <MaskTool elementId={selected.id} onClose={() => setTool(null)} />;
  else if (tool === "style" && selected) bottom = <StyleTool elementId={selected.id} onClose={() => setTool(null)} />;
  else if (tool === "background") bottom = <BackgroundTool onClose={() => setTool(null)} />;
  else if (tool === "slides") bottom = <SlidesTool onClose={() => setTool(null)} />;
  else if (selected)
    bottom = (
      <section aria-label={t("editor.photoTools")} className="rounded-t-[18px] bg-surface px-2 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between px-2.5 pb-1.5">
          <span className="text-[13px] font-semibold tracking-wider text-muted uppercase">{t("editor.photo")}</span>
          <button
            type="button"
            onClick={() => select(null)}
            className="h-8 rounded-[10px] border border-border px-3 text-[13px] font-semibold"
          >
            {t("common.done")}
          </button>
        </div>
        <div className="flex overflow-x-auto">
          <ToolButton
            label={selected.assetId ? t("editor.replace") : t("editor.addPhoto")}
            icon={selected.assetId ? "replace" : "image"}
            onClick={() => replaceInput.current?.click()}
          />
          {selected.slot && <ToolButton label={t("editor.swap")} icon="swap" onClick={() => startSwap(selected.id)} />}
          {selected.assetId && <ToolButton label={t("editor.crop")} icon="crop" onClick={() => openTool("crop")} />}
          <ToolButton label={t("editor.mask")} icon="mask" onClick={() => openTool("mask")} />
          <ToolButton label={t("editor.style")} icon="style" onClick={() => openTool("style")} />
          <ToolButton label={t("editor.forward")} icon="layerUp" onClick={() => moveLayer(selected.id, "up")} />
          <ToolButton label={t("editor.backward")} icon="layerDown" onClick={() => moveLayer(selected.id, "down")} />
          <ToolButton label={t("editor.duplicate")} icon="duplicate" onClick={() => duplicateElement(selected.id)} />
          <ToolButton label={t("common.delete")} icon="trash" danger onClick={() => removeElement(selected.id)} />
        </div>
      </section>
    );
  else
    bottom = (
      <section aria-label={t("editor.tools")} className="rounded-t-[18px] bg-surface px-2 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex">
          <ToolButton
            label={busy ? t("editor.importing") : t("editor.addPhotos")}
            icon="image"
            onClick={() => addInput.current?.click()}
          />
          <ToolButton label={t("editor.layout")} icon="layout" onClick={() => setTool("layout")} />
          <ToolButton label={t("editor.background")} icon="background" onClick={() => openTool("background")} />
          <ToolButton label={t("editor.slides")} icon="slides" onClick={() => openTool("slides")} />
        </div>
      </section>
    );

  return (
    <main className="mx-auto flex h-dvh max-w-3xl flex-col">
      <header className="flex items-center gap-0.5 px-2 pt-2.5 pb-1.5">
        <button type="button" aria-label={t("common.back")} onClick={onBack} className="flex h-11 w-11 items-center justify-center">
          <Icon name="back" />
        </button>
        <div className="min-w-0 flex-1 truncate text-[15px] font-semibold">
          {t("editor.title", { ratio: doc.ratio, count: doc.slideCount })}
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

      <div ref={areaRef} onScroll={onScroll} className="relative flex-1 overflow-x-auto overflow-y-hidden bg-canvas">
        {viewScale > 0 && (
          <div className="relative inline-block" style={{ padding: STAGE_PADDING, paddingTop: STAGE_PADDING + 20 }}>
            {Array.from({ length: doc.slideCount }, (_, i) => (
              <span
                key={i}
                className={`absolute text-xs ${i === currentSlide ? "font-bold text-accent-text" : "text-muted"}`}
                style={{ left: STAGE_PADDING + i * slideW, top: STAGE_PADDING - 2 }}
              >
                {t("editor.slideOf", { index: i + 1, count: doc.slideCount })}
              </span>
            ))}
            <CanvasStage viewScale={viewScale} contentLayerRef={contentLayerRef} />
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
          onClose={() => setTool(null)}
          onApply={(tpl, photos, options) => {
            applyLayout(tpl, photos, options);
            setTool(null);
          }}
        />
      )}

      {tool === "crop" && selected && <CropTool elementId={selected.id} onClose={() => setTool(null)} />}

      {exportOpen && (
        <ExportSheet contentLayerRef={contentLayerRef} viewScale={viewScale} onClose={() => setExportOpen(false)} />
      )}
    </main>
  );
}
