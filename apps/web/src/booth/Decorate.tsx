"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PlacedCell } from "@ig-layout/core/booth/layout";
import type { ShotImage } from "@ig-layout/core/booth/render";
import { BOOTH_FILTERS, themeById } from "@ig-layout/core/booth/themes";
import { filterById } from "@ig-layout/core/color/filters";
import { NO_ADJUST, shaderParams } from "@ig-layout/core/color/params";
import { processImage } from "@ig-layout/core/color/processor";
import type { BoothRoll } from "@ig-layout/core/storage/booth";
import { useT } from "@/store/settings";
import { FrameCanvas } from "./FrameCanvas";
import { DecorPanel } from "./DecorPanel";
import { StickerEditor } from "./StickerEditor";
import { StickerPanel } from "./StickerPanel";
import type { BoothSticker } from "@ig-layout/core/booth/stickers";
import { LayoutEditor } from "./LayoutEditor";
import { LayoutPanel } from "./LayoutPanel";
import { lookOptions, rollFrame, rollFilter, useRollImages, useStickersLoaded, withTheme } from "./look";
import { ThemePicker } from "./ThemePicker";
import { Btn, Confirm, display, mono, serif } from "./ui";
import { ZoomView } from "./ZoomView";

// Decorate the print (design §2.5, step 2): change the frame after shooting (D-147), the theme
// (paper, ink, decoration, caption face — themes.ts), the filter (IG Layout's colour pipeline)
// and the caption (title, date). Every change redraws the print above; stickers come next.

type Tab = "frame" | "theme" | "decor" | "sticker" | "filter" | "text";
const TABS: Tab[] = ["frame", "theme", "decor", "sticker", "filter", "text"];

export function Decorate({ roll, onChange, onDone, onRetake, others = [], onTab }: {
  roll: BoothRoll;
  onChange: (roll: BoothRoll) => void;
  onDone: () => void;
  /** Shoot one cell again (solo rolls; a group roll has everyone in each cell). */
  onRetake?: (shot: number) => void;
  /** Group print: the others decorating it now, and which tab they're on. */
  others?: { id: string; name: string; tab: string }[];
  onTab?: (tab: string) => void;
}) {
  const t = useT();
  const [tab, setTabState] = useState<Tab>("theme");
  const setTab = (k: Tab) => {
    setTabState(k);
    onTab?.(k);
  };
  const frame = useMemo(() => rollFrame(roll), [roll]);
  const theme = themeById(roll.theme);
  const images = useRollImages(roll);
  /** Stickers while a finger moves one (drawn live, saved on release). */
  const [liveStickers, setLiveStickers] = useState<BoothSticker[] | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const stickers = roll.stickers ?? [];
  const loaded = useStickersLoaded(liveStickers ?? roll.stickers);
  const look = useMemo(() => lookOptions(liveStickers ? { ...roll, stickers: liveStickers } : roll), [roll, liveStickers, loaded]); // eslint-disable-line react-hooks/exhaustive-deps -- `loaded`: redraw when the pictures arrive
  const set = (patch: Partial<BoothRoll>) => onChange({ ...roll, ...patch });
  /** Free layout: the cells while a finger moves one (drawn live, saved on release). */
  const [draft, setDraft] = useState<PlacedCell[] | null>(null);
  /** The cell tapped: asks before going back to the camera. */
  const [retaking, setRetaking] = useState<number | null>(null);

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-[#0b0806] bg-[#f3e9d6] px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] text-[#1d1612]">
        <span className="w-16" />
        <h1 className={`${serif} text-2xl`} style={display}>
          {t("booth.decorate")}
        </h1>
        <Btn tone="main" className="py-2" onClick={onDone}>
          {t("booth.done")}
        </Btn>
      </header>

      {/* Decorating together: who else is on this print right now. */}
      {others.length > 0 && (
        <div role="status" className="flex shrink-0 flex-wrap items-center gap-2 border-b-2 border-[#0b0806] bg-[#eaa63c] px-4 py-1.5 text-[#1d1612]" data-others>
          {others.map((o) => (
            <span key={o.id} className={`${mono} text-[11px] font-bold`}>
              ✎ {t("booth.share.editing", { name: o.name, tab: t(`booth.tab.${o.tab}` as Parameters<typeof t>[0]) })}
            </span>
          ))}
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-0 flex-1 p-4 lg:p-8">
          <ZoomView label={t("booth.zoomReset")}>
            {(step) =>
              images && (
                <div className="relative shadow-[5px_6px_0_rgba(11,8,6,0.85)]" style={{ width: `min(100cqw, calc(100cqh * ${frame.width / frame.height}))`, aspectRatio: `${frame.width} / ${frame.height}` }}>
                  <FrameCanvas
                    frame={draft ? { ...frame, cells: draft } : frame}
                    images={images}
                    look={look}
                    numbers
                    // Sharper as the zoom grows, within ~16 MP.
                    scale={Math.min(Math.sqrt(16e6 / (frame.width * frame.height)), (1400 / Math.max(frame.width, frame.height)) * step)}
                    className="absolute inset-0 h-full w-full"
                    // Tap a photo (or an empty cell) to shoot that one again — solo rolls only.
                    onCell={onRetake && !(tab === "frame" && roll.layout?.arrange === "free") && tab !== "sticker" ? (shot) => setRetaking(shot) : undefined}
                  />
                  {tab === "frame" && roll.layout?.arrange === "free" && (
                    <LayoutEditor frame={frame} onLive={setDraft} onChange={(cells) => set({ layout: { ...roll.layout, cells } })} />
                  )}
                  {tab === "sticker" && (
                    <StickerEditor width={frame.width} height={frame.height} stickers={stickers} selected={picked} onSelect={setPicked} onLive={setLiveStickers} onChange={(st) => set({ stickers: st })} />
                  )}
                </div>
              )
            }
          </ZoomView>
        </div>

        <div className="shrink-0 border-t-2 border-[#0b0806] bg-[#f3e9d6] pb-[max(0.75rem,env(safe-area-inset-bottom))] text-[#1d1612] lg:w-[460px] lg:overflow-y-auto lg:border-t-0 lg:border-l-2">
          <div role="tablist" className="grid grid-cols-6 border-b-2 border-[#1d1612]">
            {TABS.map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={`${mono} border-r-2 border-[#1d1612] py-3 text-[9px] font-bold uppercase tracking-[0.04em] last:border-r-0 ${tab === k ? "bg-[#1d1612] text-[#f3e9d6]" : ""}`}
              >
                {t(`booth.tab.${k}`)}
              </button>
            ))}
          </div>

          <div className="max-h-[42dvh] min-h-[178px] overflow-y-auto lg:max-h-none">
            {tab === "frame" && (
              <LayoutPanel
                frameId={roll.frameId}
                layout={roll.layout ?? {}}
                look={look}
                // Another frame: hand-placed cells don't fit it any more.
                onFrame={(frameId) => set({ frameId, layout: { ...roll.layout, cells: undefined } })}
                onLayout={(layout) => set({ layout })}
              />
            )}

            {tab === "theme" && (
              <ThemePicker
                value={theme.id}
                // A theme is a whole look: filter, arrangement, decorations (frame and photos stay).
                onPick={(th) => onChange(withTheme(roll, th))}
                preview={(th) => {
                  if (!images) return null;
                  const r = withTheme(roll, th);
                  const f = rollFrame(r);
                  return <FrameCanvas frame={f} images={images} look={{ ...lookOptions(r), title: undefined }} scale={190 / Math.max(f.width, f.height)} className="max-h-[96px] max-w-[76px]" />;
                }}
              />
            )}

            {tab === "decor" && <DecorPanel value={roll.decor ?? []} onChange={(decor) => set({ decor })} />}

            {tab === "sticker" && (
              <StickerPanel
                selected={stickers.find((x) => x.id === picked) ?? null}
                onAdd={(key) => {
                  // In the middle of the print, a fifth of its width, slightly turned.
                  const id = crypto.randomUUID();
                  set({ stickers: [...stickers, { id, key, x: frame.width / 2, y: frame.height * 0.4, w: Math.min(frame.width, frame.height) * 0.38, rot: Math.round((Math.random() - 0.5) * 16) }] });
                  setPicked(id);
                }}
                onEdit={(patch) => set({ stickers: stickers.map((x) => (x.id === picked ? { ...x, ...patch } : x)) })}
                onOrder={(front) => {
                  const it = stickers.find((x) => x.id === picked);
                  if (!it) return;
                  const rest = stickers.filter((x) => x.id !== picked);
                  set({ stickers: front ? [...rest, it] : [it, ...rest] });
                }}
                onRemove={() => {
                  set({ stickers: stickers.filter((x) => x.id !== picked) });
                  setPicked(null);
                }}
              />
            )}

            {tab === "filter" && <FilterRow images={images} value={rollFilter(roll)} onChange={(filter) => set({ filter })} />}

            {tab === "text" && (
              <div className="flex flex-col gap-4 px-5 pt-4 pb-3">
                <label className="flex flex-col gap-1.5">
                  <span className={`${mono} text-[11px] font-bold uppercase tracking-[0.25em] text-[#c8432f]`}>{t("booth.text.title")}</span>
                  <input
                    value={roll.title ?? theme.title.text}
                    maxLength={28}
                    placeholder={t("booth.text.placeholder")}
                    onChange={(e) => set({ title: e.target.value })}
                    className={`${mono} border-2 border-[#1d1612] bg-[#fbf6ec] px-3 py-3 text-base outline-none focus:shadow-[3px_3px_0_#c8432f]`}
                  />
                </label>
                <div className="flex items-center justify-between gap-3">
                  <label className={`${mono} flex cursor-pointer items-center gap-3 text-xs`}>
                    <input type="checkbox" className="peer sr-only" checked={roll.showDate !== false} onChange={(e) => set({ showDate: e.target.checked })} />
                    <span aria-hidden className="flex h-6 w-6 items-center justify-center border-2 border-[#1d1612] bg-[#fbf6ec] text-sm font-bold text-[#c8432f] peer-focus-visible:outline peer-focus-visible:outline-2">
                      {roll.showDate !== false ? "✕" : ""}
                    </span>
                    {t("booth.text.date")}
                  </label>
                  {roll.title !== undefined && (
                    <button type="button" className={`${mono} text-[11px] font-bold uppercase tracking-[0.12em] underline underline-offset-4`} onClick={() => set({ title: undefined })}>
                      ↺ {t("booth.text.reset")}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {retaking !== null && (
        <Confirm
          title={roll.shots[retaking] ? t("booth.retakeAsk", { n: retaking + 1 }) : t("booth.fillAsk", { n: retaking + 1 })}
          body={t("booth.retakeBody")}
          yes={t("booth.retakeGo")}
          no={t("common.cancel")}
          onYes={() => {
            const shot = retaking;
            setRetaking(null);
            onRetake?.(shot);
          }}
          onNo={() => setRetaking(null)}
        />
      )}
    </div>
  );
}

/** "None" + the booth's filters, each previewed on the first shot. */
function FilterRow({ images, value, onChange }: { images: (ShotImage | null)[] | null; value: string | undefined; onChange: (id: string | null) => void }) {
  const t = useT();
  // The unfiltered first shot, small: the thumbnails filter this.
  const [base, setBase] = useState<HTMLCanvasElement | null>(null);
  const first = images?.find(Boolean) ?? null;
  useEffect(() => {
    if (!first) return;
    const k = 140 / Math.max(first.width, first.height);
    const c = document.createElement("canvas");
    c.width = Math.round(first.width * k);
    c.height = Math.round(first.height * k);
    c.getContext("2d")!.drawImage(first.source, 0, 0, c.width, c.height);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a canvas built from the image, once
    setBase(c);
  }, [first]);
  const ids: (string | null)[] = [null, ...BOOTH_FILTERS];

  return (
    <div role="radiogroup" aria-label={t("booth.tab.filter")} className="flex gap-3 overflow-x-auto px-5 pt-4 pb-4 lg:flex-wrap lg:overflow-visible">
      {ids.map((id) => {
        const on = (id ?? undefined) === value;
        return (
          <button
            key={id ?? "none"}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(id)}
            className={`flex w-[84px] shrink-0 flex-col items-center gap-1.5 border-2 border-[#1d1612] p-1.5 transition-[transform,box-shadow] duration-100 ${on ? "-translate-y-1 bg-[#1d1612] text-[#f3e9d6] shadow-[4px_4px_0_#c8432f]" : "bg-[#e7d9bd] shadow-[3px_3px_0_#0b0806]"}`}
          >
            <FilterThumb base={base} id={id} />
            <span className={`${mono} text-[10px] font-bold uppercase tracking-wider`}>{id ? filterById(id)?.name : t("booth.filter.none")}</span>
          </button>
        );
      })}
    </div>
  );
}

/** One filter on the small first shot. Shots are already flipped/unflipped at render, not here. */
function FilterThumb({ base, id }: { base: HTMLCanvasElement | null; id: string | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const out = ref.current;
    if (!out || !base) return;
    const f = id ? filterById(id) : undefined;
    const src = f ? (processImage(base, shaderParams(NO_ADJUST, f.preset, 100), 140) ?? base) : base;
    out.width = 72;
    out.height = 72;
    const k = Math.max(72 / src.width, 72 / src.height);
    out.getContext("2d")!.drawImage(src, (72 - src.width * k) / 2, (72 - src.height * k) / 2, src.width * k, src.height * k);
  }, [base, id]);
  return <canvas ref={ref} className="h-[72px] w-[72px] bg-[#2a231d]" />;
}
