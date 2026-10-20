"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { FILTER_GROUPS, FILTERS, filterById, type FilterDef, type FilterGroup } from "@/lib/color/filters";
import { type Adjustments, ADJUST_MIN, type AdjustKey, type FilterRef, NO_ADJUST, shaderParams, vignetteOf } from "@/lib/color/params";
import { processImage } from "@/lib/color/processor";
import { type ImageElement, isImage, stillUrl } from "@/lib/project/types";
import { updateEl, useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { useHtmlImage } from "../canvas/useHtmlImage";
import { Slider } from "./controls";

// "Adjust" screen (M19, editor-v2/09 §8): the photo full screen on black, filters and
// every adjustment in one sliding row, a red dot on what was changed, its own ↶ ↷,
// hold to compare. ✕ drops everything since it opened; ✓ is one step in the editor.

/** Order seen in the reference, then the extras the app already had. */
const TOOLS: AdjustKey[] = ["exposure", "brightness", "contrast", "highlights", "shadows", "temperature", "tint", "vibrance", "saturation", "blur", "sharpen", "grain", "hue", "vignette", "fade"];

type Look = { adjust: Adjustments; filter: FilterRef | null };

function Chip(props: { image: HTMLImageElement | null; filter: FilterDef | null; active: boolean; label: string; onClick: () => void }) {
  const thumb = useMemo(() => {
    if (!props.image) return null;
    if (props.filter) return processImage(props.image, shaderParams(NO_ADJUST, props.filter.preset, 100), 96)?.toDataURL("image/jpeg", 0.8) ?? null;
    const c = document.createElement("canvas");
    const s = 96 / Math.max(props.image.width, props.image.height);
    c.width = Math.round(props.image.width * s);
    c.height = Math.round(props.image.height * s);
    c.getContext("2d")!.drawImage(props.image, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.8);
  }, [props.image, props.filter]);
  return (
    <button
      type="button"
      aria-pressed={props.active}
      onClick={props.onClick}
      className={`flex w-[70px] shrink-0 flex-col items-center gap-1.5 text-xs ${props.active ? "font-bold text-white" : "text-white/70"}`}
    >
      <span className={`h-16 w-16 overflow-hidden rounded-[10px] bg-white/10 ${props.active ? "ring-2 ring-white" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- generated preview */}
        {thumb && <img src={thumb} alt="" className="h-full w-full object-cover" />}
      </span>
      {props.label}
    </button>
  );
}

export function PhotoEditScreen({ elementId, start, onClose }: { elementId: string; start: "filters" | AdjustKey; onClose: () => void }) {
  const t = useT();
  const doc = useViewDoc();
  const found = doc?.elements.find((e) => e.id === elementId);
  const el = found?.type === "image" ? (found as ImageElement) : undefined;
  const asset = useEditor((s) => (el?.assetId ? s.assets[el.assetId] : undefined));
  const image = useHtmlImage(asset && stillUrl(asset));
  const { updateDraft, applyDraft, cancelDraft, setCompare } = useEditor.getState();
  const [tool, setTool] = useState<"filters" | AdjustKey>(start);
  const [group, setGroup] = useState<FilterGroup | "all">("all");
  const [comparing, setComparing] = useState(false);
  const [applyAll, setApplyAll] = useState(false);
  const [confirming, setConfirming] = useState(false);
  // The screen's own history of looks (↶ ↷); a run of changes to one tool is one entry.
  const [history, setHistory] = useState<{ looks: Look[]; at: number; key: string | null }>(() => ({
    looks: [{ adjust: { ...NO_ADJUST, ...el?.adjust }, filter: el?.filter ?? null }],
    at: 0,
    key: null,
  }));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const look: Look = el ? { adjust: { ...NO_ADJUST, ...el.adjust }, filter: el.filter } : history.looks[0];

  // The photo with the current look (the original while comparing).
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || !image) return;
    const preset = filterById(look.filter?.id)?.preset;
    const shown = comparing ? null : processImage(image, shaderParams(look.adjust, preset, look.filter?.intensity ?? 0), 1400);
    const src = shown ?? image;
    c.width = src.width;
    c.height = src.height;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(src, 0, 0, c.width, c.height);
  });

  if (!el || !doc) return null;
  const photoCount = doc.elements.filter((e) => isImage(e) && e.assetId).length;

  function set(next: Look, key: string) {
    updateDraft((d) => updateEl(d, elementId, { adjust: next.adjust, filter: next.filter }));
    setHistory((h) => {
      const looks = h.key === key ? [...h.looks.slice(0, h.at), next] : [...h.looks.slice(0, h.at + 1), next];
      return { looks, at: looks.length - 1, key };
    });
  }
  function go(at: number) {
    const l = history.looks[at];
    updateDraft((d) => updateEl(d, elementId, { adjust: l.adjust, filter: l.filter }));
    setHistory({ ...history, at, key: null });
  }
  const close = (apply: boolean) => {
    setCompare(false);
    if (apply) applyDraft();
    else cancelDraft();
    onClose();
  };
  function apply() {
    if (applyAll && photoCount > 1) return setConfirming(true);
    close(true);
  }
  const changed = (k: AdjustKey) => (look.adjust[k] ?? 0) !== 0;
  const dirty = !!look.filter || TOOLS.some(changed);
  const hold = (on: boolean) => {
    setComparing(on);
    setCompare(on);
  };
  const filters = group === "all" ? FILTERS : FILTERS.filter((f) => f.group === group);
  const current = filterById(look.filter?.id);
  const round = "flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white disabled:opacity-35";

  return (
    <div role="dialog" aria-label={t("edit.title")} className="fixed inset-0 z-40 flex flex-col bg-black text-white">
      <header className="flex shrink-0 items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <button type="button" aria-label={t("common.cancel")} onClick={() => close(false)} className={round}>
          <Icon name="close" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={() => hold(true)}
            onPointerUp={() => hold(false)}
            onPointerLeave={() => hold(false)}
            onPointerCancel={() => hold(false)}
            onContextMenu={(e) => e.preventDefault()}
            className="h-11 rounded-full bg-white/12 px-4 text-[13px] font-semibold select-none"
          >
            {t("tool.compare")}
          </button>
          <div className="flex h-11 items-center rounded-full bg-white/12 px-1">
            <button type="button" aria-label={t("edit.undo")} disabled={history.at === 0} onClick={() => go(history.at - 1)} className="flex h-10 w-10 items-center justify-center disabled:opacity-35">
              <Icon name="undo" />
            </button>
            <button type="button" aria-label={t("edit.redo")} disabled={history.at >= history.looks.length - 1} onClick={() => go(history.at + 1)} className="flex h-10 w-10 items-center justify-center disabled:opacity-35">
              <Icon name="redo" />
            </button>
          </div>
          <button type="button" aria-label={t("tool.apply")} onClick={apply} className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-on-accent">
            <Icon name="check" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center px-2">
        <div className="relative max-h-full max-w-full">
          <canvas ref={canvasRef} className="block max-h-[calc(100dvh-300px)] max-w-full object-contain" style={{ height: "auto", width: "100%" }} />
          {/* Vignette is drawn on the canvas over the photo; shown here the same way. */}
          {!comparing && vignetteOf(look.adjust, look.filter) > 0 && (
            <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${(vignetteOf(look.adjust, look.filter) / 100) * 0.75}) 100%)` }} />
          )}
        </div>
      </div>

      {/* The selected tool. */}
      <section aria-label={tool === "filters" ? t("tool.filters") : t(`adjust.${tool}`)} className="shrink-0 px-4 pt-2 [&_.text-muted]:text-white/60">
        {tool === "filters" ? (
          <>
            <div role="tablist" aria-label={t("tool.filters")} className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
              {(["all", ...FILTER_GROUPS] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  role="tab"
                  aria-selected={group === g}
                  onClick={() => setGroup(g)}
                  className={`h-8 shrink-0 text-sm ${group === g ? "border-b-2 border-white font-bold" : "text-white/60"}`}
                >
                  {g === "all" ? t("edit.all") : t(`filter.group.${g}`)}
                </button>
              ))}
            </div>
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
              <Chip image={image} filter={null} active={!look.filter} label={t("filter.none")} onClick={() => set({ ...look, filter: null }, "filter")} />
              {filters.map((f) => (
                <Chip key={f.id} image={image} filter={f} active={look.filter?.id === f.id} label={f.name} onClick={() => set({ ...look, filter: { id: f.id, intensity: look.filter?.intensity ?? 100 } }, "filter")} />
              ))}
            </div>
            {look.filter && current && (
              <Slider label={t("tool.intensity")} value={look.filter.intensity} min={0} max={100} defaultValue={100} onChange={(v) => set({ ...look, filter: { ...look.filter!, intensity: v } }, "intensity")} />
            )}
            {photoCount > 1 && (
              <label className="flex items-center gap-3 rounded-[14px] bg-white/10 px-3.5 py-2.5 text-sm">
                <input type="checkbox" checked={applyAll} onChange={(e) => setApplyAll(e.target.checked)} className="h-[20px] w-[20px] accent-accent" />
                <span className="flex-1">{t("filter.applyAll", { count: photoCount })}</span>
              </label>
            )}
          </>
        ) : (
          <Slider
            label={t(`adjust.${tool}`)}
            value={look.adjust[tool] ?? 0}
            min={ADJUST_MIN[tool]}
            max={100}
            defaultValue={0}
            onChange={(v) => set({ ...look, adjust: { ...look.adjust, [tool]: v } }, tool)}
          />
        )}
      </section>

      {/* Every tool in one sliding row; a red dot marks what was changed. */}
      <nav role="tablist" aria-label={t("tool.adjust")} className="no-scrollbar flex shrink-0 gap-1 overflow-x-auto px-3 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {(["filters", ...TOOLS] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={tool === k}
            onClick={() => setTool(k)}
            className={`relative flex h-14 min-w-[64px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] ${tool === k ? "bg-white/15 font-semibold" : "text-white/70"}`}
          >
            <Icon name={k === "filters" ? "filters" : (`adj${k[0].toUpperCase()}${k.slice(1)}` as IconName)} size={20} />
            {k === "filters" ? t("tool.filters") : t(`adjust.${k}`)}
            {(k === "filters" ? !!look.filter : changed(k)) && <span aria-hidden="true" className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-red-500" />}
          </button>
        ))}
        <button
          type="button"
          disabled={!dirty}
          onClick={() => set({ adjust: { ...NO_ADJUST }, filter: null }, "reset")}
          className="flex h-14 min-w-[64px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] text-white/70 disabled:opacity-35"
        >
          <Icon name="reset" size={20} />
          {t("edit.reset")}
        </button>
      </nav>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 text-text">
          <div role="alertdialog" aria-modal="true" aria-labelledby="apply-all-title" className="flex w-full max-w-sm flex-col gap-3.5 rounded-[22px] border border-border bg-surface p-5">
            <h2 id="apply-all-title" className="font-display text-[21px] leading-tight font-bold">
              {current ? t("filter.confirmTitle", { name: current.name, count: photoCount }) : t("filter.confirmTitleNone", { count: photoCount })}
            </h2>
            <p className="text-sm leading-relaxed text-text-2">{t("filter.confirmBody")}</p>
            <div className="mt-1 flex gap-2.5">
              <button type="button" onClick={() => setConfirming(false)} className="h-12 flex-1 rounded-[14px] border border-border-2 font-semibold">
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  // Filter only (D-16): each photo keeps its own adjustments. One history step.
                  const filter = look.filter;
                  updateDraft((d) => ({ ...d, elements: d.elements.map((e) => (isImage(e) && e.assetId ? { ...e, filter } : e)) }));
                  setConfirming(false);
                  close(true);
                }}
                className="h-12 flex-[1.4] rounded-[14px] bg-accent font-bold text-on-accent"
              >
                {t("filter.confirmApply")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
