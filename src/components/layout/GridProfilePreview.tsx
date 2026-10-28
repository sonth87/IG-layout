"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { GRID_COLS, GRID_GAP } from "@/lib/project/layout";
import { slideSize } from "@/lib/project/types";
import { samplesOf } from "@/lib/templates/samples";
import { useT } from "@/store/settings";

// New grid project (owner, 2026-10-28): a mock of the Instagram profile, as wide as the
// screen, so the user sees where the big picture lands — the new tiles show one sample
// picture cut up (with their posting numbers), the rest are "your older posts".

const TILE = slideSize("3:4");
const PICTURE = samplesOf(["travel"]).find((p) => p.width > p.height) ?? samplesOf(["travel"])[0];
const OLDER = samplesOf(["food", "city", "friends", "beach", "portrait", "nature"]);
const AVATAR = samplesOf(["portrait"])[0];

export function GridProfilePreview({ count, gap }: { count: number; gap: boolean }) {
  const t = useT();
  // Its own width, so the tiles fill it exactly.
  const ref = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(340);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const rows = Math.ceil(count / GRID_COLS);
  // Instagram's gap is about 12 px at 1080 px wide; never thinner than a hairline here.
  const g = Math.max(1.5, (width / GRID_COLS) * (GRID_GAP / TILE.width));
  const tw = (width - g * (GRID_COLS - 1)) / GRID_COLS;
  const th = (tw * TILE.height) / TILE.width;
  // The big picture covers every new row; with the gap on, it also runs under the gaps.
  const areaW = gap ? width : tw * GRID_COLS;
  const areaH = gap ? rows * th + (rows - 1) * g : rows * th;
  const cover = Math.max(areaW / PICTURE.width, areaH / PICTURE.height);
  const pw = PICTURE.width * cover;
  const ph = PICTURE.height * cover;
  const cells = (rows + 1) * GRID_COLS;

  return (
    <figure ref={ref} aria-label={t("gridPreview.label")} className="overflow-hidden rounded-2xl bg-surface">
      <div className="flex items-center gap-3 px-3.5 pt-3.5 pb-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- sample avatar */}
        <img src={AVATAR?.url} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="truncate text-[14px] font-semibold">your.profile</span>
          <span className="flex gap-4 text-[12px]">
            {[
              [String(count + 24), t("gridPreview.posts")],
              ["1.2K", t("gridPreview.followers")],
              ["321", t("gridPreview.following")],
            ].map(([n, label]) => (
              <span key={label}>
                <b className="font-semibold">{n}</b> <span className="text-muted">{label}</span>
              </span>
            ))}
          </span>
        </div>
      </div>
      <div className="flex border-b border-border text-muted">
        <span className="flex h-9 flex-1 items-center justify-center border-b-2 border-text text-text">
          <Icon name="igGrid" size={18} />
        </span>
        <span className="flex h-9 flex-1 items-center justify-center">
          <Icon name="igReels" size={18} />
        </span>
        <span className="flex h-9 flex-1 items-center justify-center">
          <Icon name="igTagged" size={18} />
        </span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, ${tw}px)`, gap: g }}>
        {Array.from({ length: cells }, (_, i) => {
          const c = i % GRID_COLS;
          const r = Math.floor(i / GRID_COLS);
          if (i < count) {
            const ox = (areaW - pw) / 2 - c * (gap ? tw + g : tw);
            const oy = (areaH - ph) / 2 - r * (gap ? th + g : th);
            return (
              <div
                key={i}
                className="relative"
                style={{ height: th, backgroundImage: `url("${PICTURE.url}")`, backgroundSize: `${pw}px ${ph}px`, backgroundPosition: `${ox}px ${oy}px` }}
              >
                <span className="absolute top-1 left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/55 px-1 text-[10px] font-bold text-white">
                  {count - i}
                </span>
              </div>
            );
          }
          const old = OLDER[(i * 7) % OLDER.length];
          return (
            <div key={i} className="relative bg-surface-2" style={{ height: th }}>
              <div className="h-full w-full bg-cover bg-center opacity-40 grayscale-[40%]" style={{ backgroundImage: `url("${old?.url}")` }} />
              {i === count && <span className="absolute inset-x-0 bottom-1.5 text-center text-[10px] font-semibold text-text">{t("gridPreview.older")}</span>}
            </div>
          );
        })}
      </div>
    </figure>
  );
}

/** "2 full rows", "2 full rows + 1", "2 posts in one row" (grid tile counter). */
export function gridRowsHint(t: ReturnType<typeof useT>, count: number) {
  const full = Math.floor(count / GRID_COLS);
  const extra = count % GRID_COLS;
  if (!extra) return t("grid.rowsFull", { rows: full });
  return full ? t("grid.rowsShort", { rows: full, extra }) : t("grid.rowsOne", { extra });
}

/**
 * What "line up across the gaps" does, drawn big: two tiles with a slanted line. On: the
 * line carries on straight (the part under the gap is skipped). Off: it jumps at the gap.
 */
export function GapDemo({ on }: { on: boolean }) {
  const t = useT();
  const id = useId();
  const panel = (lined: boolean) => {
    const tile = 52;
    const g = 10;
    const h = 64;
    // On: one line across tile + gap + tile. Off: the picture is two tiles wide, so the
    // right tile shows what follows the left one, moved over by the gap.
    const shift = lined ? 0 : g;
    const span = lined ? tile * 2 + g : tile * 2;
    return (
      <div className={`flex flex-1 flex-col items-center gap-1 rounded-xl p-2 ${on === lined ? "bg-accent-soft ring-2 ring-accent" : "bg-surface-2"}`}>
        <svg viewBox={`0 0 ${tile * 2 + g} ${h}`} className="h-16 w-full" aria-hidden="true">
          <defs>
            <clipPath id={`${id}-l${lined}`}>
              <rect x="0" y="0" width={tile} height={h} />
            </clipPath>
            <clipPath id={`${id}-r${lined}`}>
              <rect x={tile + g} y="0" width={tile} height={h} />
            </clipPath>
          </defs>
          <rect x="0" y="0" width={tile} height={h} fill="#9cc3e6" />
          <rect x={tile + g} y="0" width={tile} height={h} fill="#9cc3e6" />
          <line x1="0" y1={h} x2={span} y2="0" stroke="#1d1c1a" strokeWidth="5" clipPath={`url(#${id}-l${lined})`} />
          <line x1={shift} y1={h} x2={span + shift} y2="0" stroke="#1d1c1a" strokeWidth="5" clipPath={`url(#${id}-r${lined})`} />
        </svg>
        <span className="text-center text-[11px] leading-tight text-muted">{t(lined ? "gridPreview.gapOn" : "gridPreview.gapOff")}</span>
      </div>
    );
  };
  return (
    <div className="flex gap-2">
      {panel(true)}
      {panel(false)}
    </div>
  );
}
