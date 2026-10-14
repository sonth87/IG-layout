"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { canvasSize, MAX_SLIDES } from "@/lib/project/types";
import { useEditor } from "@/store/editor";
import CanvasStage from "./CanvasStage";
import { ExportSheet } from "./ExportSheet";
import { useImportPhotos } from "./useImportPhotos";

const STAGE_PADDING = 24;

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

function ToolButton(props: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`flex h-16 flex-1 flex-col items-center justify-center gap-1.5 text-[11px] ${props.danger ? "text-danger" : ""}`}
    >
      {props.children}
      {props.label}
    </button>
  );
}

export function Editor() {
  const doc = useEditor((s) => s.doc)!;
  const selectedId = useEditor((s) => s.selectedId);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const { undo, redo, select, removeElement, moveLayer, setSlideCount, closeProject } = useEditor.getState();
  const { importFiles, busy, errors } = useImportPhotos();

  const areaRef = useRef<HTMLDivElement>(null);
  const contentLayerRef = useRef<Konva.Layer>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [exportOpen, setExportOpen] = useState(false);

  const { slide } = canvasSize(doc);
  const viewScale = useViewScale(areaRef, slide);
  const slideW = slide.width * viewScale;

  function onBack() {
    if (doc.elements.length === 0 || confirm("Leave this project? It is not saved yet in this prototype.")) {
      closeProject();
    }
  }

  return (
    <main className="mx-auto flex h-dvh max-w-3xl flex-col">
      <header className="flex items-center gap-0.5 px-2 pt-2.5 pb-1.5">
        <button type="button" aria-label="Back" onClick={onBack} className="flex h-11 w-11 items-center justify-center">
          <Icon name="back" />
        </button>
        <div className="min-w-0 flex-1 truncate text-[15px] font-semibold">
          Post · {doc.ratio} · {doc.slideCount} slides
        </div>
        <button
          type="button"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={undo}
          className="flex h-11 w-11 items-center justify-center disabled:text-disabled"
        >
          <Icon name="undo" />
        </button>
        <button
          type="button"
          aria-label="Redo"
          disabled={!canRedo}
          onClick={redo}
          className="flex h-11 w-11 items-center justify-center disabled:text-disabled"
        >
          <Icon name="redo" />
        </button>
        <button
          type="button"
          disabled={doc.elements.length === 0}
          onClick={() => {
            select(null);
            setExportOpen(true);
          }}
          className="ml-1 h-[38px] rounded-xl bg-accent px-3.5 text-sm font-bold text-on-accent disabled:opacity-50"
        >
          Export
        </button>
      </header>

      <div ref={areaRef} className="relative flex-1 overflow-x-auto overflow-y-hidden bg-canvas">
        {viewScale > 0 && (
          <div className="relative inline-block" style={{ padding: STAGE_PADDING, paddingTop: STAGE_PADDING + 20 }}>
            {Array.from({ length: doc.slideCount }, (_, i) => (
              <span
                key={i}
                className="absolute text-xs text-muted"
                style={{ left: STAGE_PADDING + i * slideW, top: STAGE_PADDING - 2 }}
              >
                {i + 1} / {doc.slideCount}
              </span>
            ))}
            <CanvasStage viewScale={viewScale} contentLayerRef={contentLayerRef} />
          </div>
        )}
        {doc.elements.length === 0 && (
          <p className="pointer-events-none absolute inset-x-0 bottom-4 text-center text-sm text-muted">
            {busy ? "Importing photos…" : "Add photos to start"}
          </p>
        )}
      </div>

      {errors.length > 0 && (
        <div role="alert" className="bg-surface px-4 py-2 text-sm text-danger">
          {errors.join(" ")}
        </div>
      )}

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) importFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <section
        aria-label={selectedId ? "Photo tools" : "Tools"}
        className="rounded-t-[18px] bg-surface px-2 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        {selectedId ? (
          <>
            <div className="flex items-center justify-between px-2.5 pb-1.5">
              <span className="text-[13px] font-semibold tracking-wider text-muted uppercase">Photo</span>
              <button
                type="button"
                onClick={() => select(null)}
                className="h-8 rounded-[10px] border border-border px-3 text-[13px] font-semibold"
              >
                Done
              </button>
            </div>
            <div className="flex">
              <ToolButton label="Forward" onClick={() => moveLayer(selectedId, "up")}>
                <Icon name="layerUp" />
              </ToolButton>
              <ToolButton label="Backward" onClick={() => moveLayer(selectedId, "down")}>
                <Icon name="layerDown" />
              </ToolButton>
              <ToolButton label="Delete" danger onClick={() => removeElement(selectedId)}>
                <Icon name="trash" />
              </ToolButton>
            </div>
          </>
        ) : (
          <div className="flex items-center">
            <ToolButton label={busy ? "Importing…" : "Add photos"} onClick={() => fileInput.current?.click()}>
              <Icon name="image" />
            </ToolButton>
            <div className="flex flex-1 flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Remove last slide"
                  disabled={doc.slideCount <= 1}
                  onClick={() => setSlideCount(doc.slideCount - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border disabled:text-disabled"
                >
                  <Icon name="minus" size={18} />
                </button>
                <span className="w-8 text-center font-display text-lg font-bold">{doc.slideCount}</span>
                <button
                  type="button"
                  aria-label="Add slide"
                  disabled={doc.slideCount >= MAX_SLIDES}
                  onClick={() => setSlideCount(doc.slideCount + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border disabled:text-disabled"
                >
                  <Icon name="plus" size={18} />
                </button>
              </div>
              <span className="text-[11px]">Slides</span>
            </div>
          </div>
        )}
      </section>

      {exportOpen && (
        <ExportSheet
          contentLayerRef={contentLayerRef}
          viewScale={viewScale}
          onClose={() => setExportOpen(false)}
        />
      )}
    </main>
  );
}
