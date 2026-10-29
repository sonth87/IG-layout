"use client";

import { SheetHeader } from "@/components/ui/SheetHeader";
import { useEffect, useRef, useState } from "react";
import { catalogAsset, loadCatalog, loadPack, packsOf, packUrl, useCatalog } from "@ig-layout/core/catalog/load";
import { TEXTURE_KEYS, TEXTURES, textureTile } from "@ig-layout/core/elements/textures";
import { Icon } from "@/components/ui/Icon";
import { type Background, isImage } from "@ig-layout/core/project/types";
import { GRID_COLS, MAX_GRID_TILES, MIN_GRID_TILES } from "@ig-layout/core/project/layout";
import { GapDemo, gridRowsHint } from "@/components/layout/GridProfilePreview";
import { MAX_SLIDES } from "@ig-layout/core/project/types";
import { useEditor, useViewDoc } from "@/store/editor";
import { useSettings, useT } from "@/store/settings";
import { stillUrl } from "@ig-layout/core/project/types";
import { Slider, Swatches, ToolSheet } from "./controls";

const GRADIENTS: [string, string][] = [
  ["#f3e3c3", "#d9728a"],
  ["#6e8fb3", "#f0c08a"],
  ["#111214", "#3b3f6b"],
  ["#9dbf8e", "#f6e58d"],
  ["#e6e3dd", "#ffffff"],
  ["#8e8fc9", "#f28b82"],
];

type Stop = { color: string; at: number };
const SAVED_KEY = "ig-layout:gradients";

function readSaved(): Stop[][] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function css(stops: Stop[], radial = false, angle = 90) {
  const list = [...stops].sort((a, b) => a.at - b.at).map((s) => `${s.color} ${Math.round(s.at * 100)}%`).join(", ");
  return radial ? `radial-gradient(circle, ${list})` : `linear-gradient(${angle}deg, ${list})`;
}

/** Colour at `at` between the two stops around it (for a new stop). */
function colorAt(stops: Stop[], at: number) {
  const s = [...stops].sort((a, b) => a.at - b.at);
  const right = s.find((x) => x.at >= at) ?? s.at(-1)!;
  const left = [...s].reverse().find((x) => x.at <= at) ?? s[0];
  const k = right.at === left.at ? 0 : (at - left.at) / (right.at - left.at);
  const mix = (i: number) => Math.round(parseInt(left.color.slice(i, i + 2), 16) * (1 - k) + parseInt(right.color.slice(i, i + 2), 16) * k);
  return `#${[1, 3, 5].map((i) => mix(i).toString(16).padStart(2, "0")).join("")}`;
}

/** Custom gradient (editor-v2/12 §3): stops dragged along a bar, tap the bar to add one. */
function GradientEditor({ bg, set }: { bg: Extract<Background, { kind: "gradient" }>; set: (b: Background) => void }) {
  const t = useT();
  const stops: Stop[] = bg.stops ?? [
    { color: bg.from, at: 0 },
    { color: bg.to, at: 1 },
  ];
  const [active, setActive] = useState(0);
  const [saved, setSaved] = useState<Stop[][]>(() => readSaved());
  const barRef = useRef<HTMLDivElement>(null);
  const drag = useRef<number | null>(null);
  const update = (next: Stop[]) => {
    const sorted = [...next].sort((a, b) => a.at - b.at);
    set({ ...bg, stops: next, from: sorted[0].color, to: sorted.at(-1)!.color });
  };
  const at = (clientX: number) => {
    const r = barRef.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  };
  const cur = stops[Math.min(active, stops.length - 1)];
  return (
    <div className="flex flex-col gap-2">
      <div
        ref={barRef}
        role="slider"
        aria-label={t("bg.custom")}
        aria-valuenow={Math.round(cur.at * 100)}
        className="relative mx-3 mt-2 h-10 rounded-xl border border-border"
        style={{ background: css(stops, false, 90), touchAction: "none" }}
        onPointerDown={(e) => {
          if (e.target !== e.currentTarget) return;
          // Tap on the bar: a new stop there, in the colour already shown there.
          const p = at(e.clientX);
          update([...stops, { color: colorAt(stops, p), at: p }]);
          setActive(stops.length);
        }}
      >
        {stops.map((s, i) => (
          <button
            key={i}
            type="button"
            aria-label={t("bg.stop", { index: i + 1 })}
            aria-pressed={i === active}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              drag.current = i;
              setActive(i);
            }}
            onPointerMove={(e) => drag.current === i && update(stops.map((x, n) => (n === i ? { ...x, at: at(e.clientX) } : x)))}
            onPointerUp={() => (drag.current = null)}
            className={`absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] shadow ${i === active ? "border-accent" : "border-white"}`}
            style={{ left: `${s.at * 100}%`, background: s.color, touchAction: "none" }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Slider label={t("bg.position")} value={Math.round(cur.at * 100)} min={0} max={100} defaultValue={Math.round(cur.at * 100)} format={(v) => `${v}%`} onChange={(v) => update(stops.map((x, n) => (n === active ? { ...x, at: v / 100 } : x)))} />
        <button type="button" disabled={stops.length <= 2} aria-label={t("bg.removeStop")} onClick={() => (update(stops.filter((_, n) => n !== active)), setActive(0))} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted disabled:opacity-30">
          <Icon name="trash" size={18} />
        </button>
      </div>
      <Swatches value={cur.color} onChange={(color) => update(stops.map((x, n) => (n === active ? { ...x, color } : x)))} />
      <div className="flex items-center gap-2">
        <div role="radiogroup" className="flex gap-1 rounded-full bg-surface-2 p-1">
          {[false, true].map((r) => (
            <button key={String(r)} type="button" role="radio" aria-checked={!!bg.radial === r} onClick={() => set({ ...bg, radial: r })} className={`h-8 rounded-full px-3 text-[13px] ${!!bg.radial === r ? "bg-surface font-semibold shadow-sm" : "text-muted"}`}>
              {r ? t("bg.radial") : t("bg.linear")}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const next = [stops, ...saved].slice(0, 12);
            setSaved(next);
            try {
              localStorage.setItem(SAVED_KEY, JSON.stringify(next));
            } catch {
              // Storage blocked: kept for this visit only.
            }
          }}
          className="ml-auto h-8 rounded-full border border-border px-3 text-[13px]"
        >
          {t("bg.save")}
        </button>
      </div>
      {!bg.radial && <Slider label={t("bg.angle")} value={bg.angle} min={0} max={360} step={5} defaultValue={90} format={(v) => `${v}°`} onChange={(angle) => set({ ...bg, angle })} />}
      {saved.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-full text-[12px] font-semibold text-muted">{t("bg.saved")}</span>
          {saved.map((g, i) => (
            <button key={i} type="button" aria-label={`${t("bg.saved")} ${i + 1}`} onClick={() => update(g)} className="h-9 w-9 rounded-full border border-border-2" style={{ background: css(g, false, 135) }} />
          ))}
        </div>
      )}
    </div>
  );
}

export function BackgroundTool({ onClose }: { onClose: () => void }) {
  const t = useT();
  const doc = useViewDoc();
  const assets = useEditor((s) => s.assets);
  const updateDraft = useEditor((s) => s.updateDraft);
  const applyDraft = useEditor((s) => s.applyDraft);
  const cancelDraft = useEditor((s) => s.cancelDraft);
  const [tab, setTab] = useState<Background["kind"]>(doc?.background.kind ?? "color");
  if (!doc) return null;
  const bg = doc.background;
  const set = (background: Background) => updateDraft((d) => ({ ...d, background }));
  const usedAssets = Object.values(assets).filter((a) => doc.elements.some((el) => isImage(el) && el.assetId === a.id));

  return (
    <ToolSheet
      title={t("tool.background")}
      onApply={() => {
        applyDraft();
        onClose();
      }}
      onCancel={() => {
        cancelDraft();
        onClose();
      }}
    >
      <div className="max-h-[48dvh] overflow-y-auto">
        <div role="tablist" className="mb-2 flex gap-1 rounded-full bg-surface-2 p-1">
          {(["color", "gradient", "texture", "blur"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`h-9 flex-1 rounded-full text-[13px] ${tab === k ? "bg-surface font-bold shadow-sm" : "text-muted"}`}
            >
              {t(`bg.${k}`)}
            </button>
          ))}
        </div>

        {tab === "color" && <Swatches value={bg.kind === "color" ? bg.color : "#ffffff"} onChange={(color) => set({ kind: "color", color })} />}

        {tab === "gradient" && (
          <>
            {bg.kind === "gradient" ? (
              <GradientEditor bg={bg} set={set} />
            ) : (
              <button type="button" onClick={() => set({ kind: "gradient", from: GRADIENTS[0][0], to: GRADIENTS[0][1], angle: 90 })} className="mb-2 h-11 w-full rounded-xl bg-surface-2 text-sm font-semibold">
                {t("bg.custom")}
              </button>
            )}
            <div className="flex flex-wrap items-center gap-2 py-2">
              <span className="w-full text-[12px] font-semibold text-muted">{t("bg.defaults")}</span>
              {GRADIENTS.map(([from, to]) => {
                const active = bg.kind === "gradient" && bg.from === from && bg.to === to && !bg.stops;
                return (
                  <button
                    key={from + to}
                    type="button"
                    aria-label={`${from} → ${to}`}
                    aria-pressed={active}
                    onClick={() => set({ kind: "gradient", from, to, angle: bg.kind === "gradient" ? bg.angle : 90 })}
                    className={`h-9 w-9 rounded-full border ${active ? "border-2 border-accent" : "border-border-2"}`}
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  />
                );
              })}
            </div>
          </>
        )}

        {tab === "texture" && <TextureTab bg={bg} set={set} />}

        {tab === "blur" && (
          <div className="flex gap-2 overflow-x-auto py-2">
            {usedAssets.length === 0 && <p className="text-sm text-muted">{t("bg.noPhotos")}</p>}
            {usedAssets.map((a) => {
              const active = bg.kind === "blur" && bg.assetId === a.id;
              return (
                <button key={a.id} type="button" aria-pressed={active} aria-label={a.name} onClick={() => set({ kind: "blur", assetId: a.id })} className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl ${active ? "ring-2 ring-accent" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob thumbnail */}
                  <img src={stillUrl(a)} alt="" className="h-full w-full object-cover blur-[2px]" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </ToolSheet>
  );
}

/** Slide management acts directly (each action = one history step). Grid: rows + gap. */
export function SlidesTool(props: { onClose: () => void; showSafeZone: boolean; onSafeZone: (on: boolean) => void }) {
  const t = useT();
  const doc = useViewDoc();
  const current = useEditor((s) => s.currentSlide);
  const { insertSlide, deleteSlide, moveSlide, setCurrentSlide, setGridCount, setGridGap } = useEditor.getState();
  if (!doc) return null;
  const index = Math.min(current, doc.slideCount - 1);
  const isStory = doc.type === "story";

  const shell = (title: string, children: React.ReactNode) => (
    <section aria-label={title} className="rounded-t-[20px] bg-surface px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <SheetHeader title={title} right={{ icon: "check", label: t("common.done"), onClick: props.onClose, accent: true }} />
      {children}
    </section>
  );

  if (doc.type === "grid" && doc.grid) {
    const count = doc.slideCount;
    return shell(
      t("grid.title", { count }),
      <>
        <div className="flex items-center justify-between py-1">
          <span className="flex flex-col text-sm">
            {t("grid.count")}
            <span className="text-xs text-muted">{gridRowsHint(t, count)}</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={t("grid.fewer")}
              disabled={count <= MIN_GRID_TILES}
              onClick={() => setGridCount(count - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border disabled:text-disabled"
            >
              <Icon name="minus" size={18} />
            </button>
            <span className="w-6 text-center font-display text-lg font-bold">{count}</span>
            <button
              type="button"
              aria-label={t("grid.more")}
              disabled={count >= MAX_GRID_TILES}
              onClick={() => setGridCount(count + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border disabled:text-disabled"
            >
              <Icon name="plus" size={18} />
            </button>
          </div>
        </div>
        {count % GRID_COLS !== 0 && <p className="rounded-xl bg-accent-soft px-3 py-2 text-xs leading-relaxed">{t("grid.shortRowNote")}</p>}
        <label className="flex items-center justify-between gap-3 py-2 text-sm">
          <span>
            {t("grid.gap")}
            <span className="block text-xs text-muted">{t("grid.gapHint")}</span>
          </span>
          <input
            type="checkbox"
            checked={doc.grid.gapCompensation}
            onChange={(e) => setGridGap(e.target.checked)}
            className="h-[22px] w-[22px] accent-accent"
          />
        </label>
        <GapDemo on={doc.grid.gapCompensation} />
        <p className="pt-2 text-xs leading-relaxed text-muted">{t("grid.orderHint")}</p>
      </>,
    );
  }

  const button = "flex h-16 flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-border text-[11px] disabled:text-disabled";

  return shell(
    t(isStory ? "frames.title" : "slides.title", { index: index + 1, count: doc.slideCount }),
    <>
      <div className="flex gap-2">
        <button
          type="button"
          className={button}
          disabled={index === 0}
          onClick={() => {
            moveSlide(index, -1);
            setCurrentSlide(index - 1);
          }}
        >
          <Icon name="back" />
          {t("slides.moveLeft")}
        </button>
        <button
          type="button"
          className={button}
          disabled={index >= doc.slideCount - 1}
          onClick={() => {
            moveSlide(index, 1);
            setCurrentSlide(index + 1);
          }}
        >
          <span className="rotate-180">
            <Icon name="back" />
          </span>
          {t("slides.moveRight")}
        </button>
        <button type="button" className={button} disabled={doc.slideCount >= MAX_SLIDES} onClick={() => insertSlide(index)}>
          <Icon name="plus" />
          {t("slides.add")}
        </button>
        <button
          type="button"
          className={`${button} text-danger`}
          disabled={doc.slideCount <= 1}
          onClick={() => {
            deleteSlide(index);
            setCurrentSlide(Math.max(0, index - 1));
          }}
        >
          <Icon name="trash" />
          {t("slides.delete")}
        </button>
      </div>
      {isStory && (
        <label className="flex items-center justify-between pt-3 text-sm">
          <span>{t("story.safeZone")}</span>
          <input
            type="checkbox"
            checked={props.showSafeZone}
            onChange={(e) => props.onSafeZone(e.target.checked)}
            className="h-[22px] w-[22px] accent-accent"
          />
        </label>
      )}
    </>,
  );
}

/** Textures: the app's own drawn tiles, then the packs (M20) — downloaded into the project when picked. */
function TextureTab({ bg, set }: { bg: Background; set: (b: Background) => void }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const catalog = useCatalog((s) => s.catalog);
  const items = useCatalog((s) => s.items);
  const addAsset = useEditor((s) => s.addAsset);
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    void loadCatalog().then((c) => packsOf(c, "texture").forEach((p) => void loadPack(p)));
  }, []);
  const tile = (key: string, label: string, active: boolean, image: string, size: string, onPick: () => void) => (
    <button key={key} type="button" aria-label={label} aria-pressed={active} onClick={onPick} className={`flex flex-col items-center gap-1 text-[11px] ${active ? "font-bold" : ""}`}>
      <span className={`block aspect-square w-full overflow-hidden rounded-xl border ${active ? "border-2 border-accent" : "border-border"} ${busy === key ? "animate-pulse" : ""}`} style={{ backgroundImage: `url(${image})`, backgroundSize: size }} />
      <span className="w-full truncate text-center">{label}</span>
    </button>
  );
  return (
    <div className="py-1">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {TEXTURE_KEYS.map((k) => tile(k, TEXTURES[k].name[locale], bg.kind === "texture" && bg.texture === k, textureTile(k)?.toDataURL("image/jpeg", 0.7) ?? "", "64px", () => set({ kind: "texture", texture: k })))}
      </div>
      {packsOf(catalog, "texture").map((p) => (
        <section key={p.id} aria-label={p.name[locale]} className="pt-3">
          <h3 className="pb-2 text-[13px] font-bold">{p.name[locale]}</h3>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {(items[p.id] ?? p.preview).map((it) =>
              tile(it.id, it.name[locale], bg.kind === "texture" && bg.texture === it.id, packUrl(it.thumb), "cover", () => {
                setBusy(it.id);
                void catalogAsset(it)
                  .then((asset) => {
                    addAsset(asset);
                    set({ kind: "texture", texture: it.id, assetId: asset.id, tile: !!it.tile });
                  })
                  .catch(() => window.alert(t("lib.offline")))
                  .finally(() => setBusy(null));
              }),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
