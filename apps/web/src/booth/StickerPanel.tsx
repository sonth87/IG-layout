"use client";

import { useMemo, useState } from "react";
import { PROP_GROUPS, PROPS, propsIn, type PropGroup } from "@ig-layout/core/elements/props";
import { stickerSvg } from "@ig-layout/core/elements/stickers";
import type { BoothSticker } from "@ig-layout/core/booth/stickers";
import { useT } from "@/store/settings";
import { mono } from "./ui";

// The Sticker tab (2026-10-30): props and occasions by group (the set IG Layout's library
// has too); tap one to put it on the print. The picked sticker: its words (bubbles, signs),
// colour, flip, front / back, remove.

const COLORS = ["#1d1c1a", "#ffffff", "#e2283f", "#ff6b9a", "#ff8a1f", "#ffd23f", "#46d36a", "#3aa0ff", "#7b61ff", "#a0673f"];

export function StickerPanel({ selected, onAdd, onEdit, onOrder, onRemove }: {
  selected: BoothSticker | null;
  onAdd: (key: string) => void;
  onEdit: (patch: Partial<BoothSticker>) => void;
  onOrder: (front: boolean) => void;
  onRemove: () => void;
}) {
  const t = useT();
  const [group, setGroup] = useState<PropGroup>("props");
  const urls = useMemo(() => Object.fromEntries(propsIn(group).map((k) => [k, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(stickerSvg(k, PROPS[k].color, 96))}`])), [group]);
  const prop = selected ? PROPS[selected.key] : null;
  const chip = (on: boolean) => `${mono} shrink-0 border-2 border-[#1d1612] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${on ? "bg-[#1d1612] text-[#f3e9d6]" : "bg-[#e7d9bd]"}`;

  return (
    <div className="pb-3">
      {selected && prop && (
        <div className="flex flex-col gap-2 border-b-2 border-dashed border-[#1d1612]/25 px-5 pt-3 pb-3" data-sticker-tools>
          {prop.text && (
            <input
              value={selected.text ?? prop.text.value}
              maxLength={24}
              aria-label={t("booth.sticker.words")}
              onChange={(e) => onEdit({ text: e.target.value })}
              className={`${mono} border-2 border-[#1d1612] bg-[#fbf6ec] px-3 py-2 text-base outline-none focus:shadow-[3px_3px_0_#c8432f]`}
            />
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            {COLORS.map((c) => (
              <button key={c} type="button" aria-label={c} onClick={() => onEdit({ color: c })} className={`h-7 w-7 rounded-full border-2 ${(selected.color ?? prop.color) === c ? "border-[#c8432f] ring-2 ring-[#c8432f]" : "border-[#1d1612]"}`} style={{ background: c }} />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={chip(!!selected.flip)} onClick={() => onEdit({ flip: !selected.flip })}>
              ⇋ {t("booth.sticker.flip")}
            </button>
            <button type="button" className={chip(false)} onClick={() => onOrder(true)}>
              ↑ {t("booth.sticker.front")}
            </button>
            <button type="button" className={chip(false)} onClick={() => onOrder(false)}>
              ↓ {t("booth.sticker.back")}
            </button>
            <button type="button" className={`${chip(false)} !text-[#c8432f]`} onClick={onRemove}>
              ✕ {t("booth.sticker.remove")}
            </button>
          </div>
        </div>
      )}
      <div role="tablist" aria-label={t("booth.tab.sticker")} className="flex gap-2 overflow-x-auto px-5 pt-3 pb-2">
        {PROP_GROUPS.map((g) => (
          <button key={g} type="button" role="tab" aria-selected={group === g} className={chip(group === g)} onClick={() => setGroup(g)}>
            {t(`lib.props.${g}`)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 px-5 pt-1 lg:grid-cols-6">
        {propsIn(group).map((k) => (
          <button key={k} type="button" aria-label={PROPS[k].name.en} title={PROPS[k].name.en} onClick={() => onAdd(k)} className="flex aspect-square items-center justify-center border-2 border-[#1d1612] bg-[#fbf6ec] p-1.5 shadow-[2px_2px_0_#0b0806] active:translate-x-[1px] active:translate-y-[1px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- an inline SVG sticker */}
            <img src={urls[k]} alt="" className="max-h-full max-w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
