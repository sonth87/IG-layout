"use client";

import { DECOR_KINDS, defaultLayer, type Decor, type DecorKind } from "@ig-layout/core/booth/decor";
import { newSeed } from "@ig-layout/core/booth/layout";
import { useT } from "@/store/settings";
import { mono } from "./ui";

// The Decor tab (D-161 step 2): tap a piece to add it, tap again to take it off. Each one
// added: over the whole print or on every cell (synced), over or behind the photos, how
// many, 🎲 another draw of it.

const ICONS: Record<DecorKind, string> = {
  vine: "🌿",
  garland: "💐",
  ribbon: "🎀",
  lights: "💡",
  neon: "〰️",
  fireworks: "🎆",
  sparklers: "🎇",
  stars: "✨",
  moon: "🌙",
  confetti: "🎊",
};

export function DecorPanel({ value, onChange }: { value: Decor[]; onChange: (d: Decor[]) => void }) {
  const t = useT();
  const has = (k: DecorKind) => value.some((d) => d.kind === k);
  const toggle = (k: DecorKind) => onChange(has(k) ? value.filter((d) => d.kind !== k) : [...value, { kind: k, seed: newSeed(), scope: "print", density: 2 }]);
  const set = (k: DecorKind, patch: Partial<Decor>) => onChange(value.map((d) => (d.kind === k ? { ...d, ...patch } : d)));
  const seg = (on: boolean) => `${mono} border-r-2 border-[var(--c-ink)] px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] last:border-r-0 ${on ? "bg-[var(--c-ink)] text-[var(--c-paper)]" : ""}`;

  return (
    <div className="pb-3">
      <div role="group" aria-label={t("booth.tab.decor")} className="grid grid-cols-5 gap-2 px-5 pt-4">
        {DECOR_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={has(k)}
            onClick={() => toggle(k)}
            className={`flex flex-col items-center gap-0.5 border-2 border-[var(--c-ink)] py-1.5 transition-[transform,box-shadow] duration-100 ${has(k) ? "-translate-y-0.5 bg-[var(--c-ink)] text-[var(--c-paper)] shadow-[3px_3px_0_var(--c-red)]" : "bg-[var(--c-paper2)] shadow-[2px_2px_0_var(--c-shadow)]"}`}
          >
            <span aria-hidden className="text-xl leading-none">
              {ICONS[k]}
            </span>
            <span className={`${mono} text-[8.5px] font-bold uppercase leading-tight tracking-wide`}>{t(`booth.decor.${k}`)}</span>
          </button>
        ))}
      </div>

      {value.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2.5 px-5">
          {value.map((d) => (
            <li key={d.kind} className="flex flex-wrap items-center gap-2 border-t-2 border-dashed border-[var(--c-ink)]/25 pt-2.5" data-decor={d.kind}>
              <span className={`${mono} w-full text-[11px] font-bold uppercase tracking-[0.12em]`}>
                {ICONS[d.kind]} {t(`booth.decor.${d.kind}`)}
              </span>
              <span className="flex border-2 border-[var(--c-ink)]" role="radiogroup" aria-label={t("booth.decor.scope")}>
                <button type="button" role="radio" aria-checked={d.scope === "print"} className={seg(d.scope === "print")} onClick={() => set(d.kind, { scope: "print" })}>
                  {t("booth.decor.print")}
                </button>
                <button type="button" role="radio" aria-checked={d.scope === "cells"} className={seg(d.scope === "cells")} onClick={() => set(d.kind, { scope: "cells" })}>
                  {t("booth.decor.cells")}
                </button>
              </span>
              <span className="flex border-2 border-[var(--c-ink)]" role="radiogroup" aria-label={t("booth.decor.layer")}>
                {(["front", "back"] as const).map((l) => (
                  <button key={l} type="button" role="radio" aria-checked={(d.layer ?? defaultLayer(d.kind)) === l} className={seg((d.layer ?? defaultLayer(d.kind)) === l)} onClick={() => set(d.kind, { layer: l })}>
                    {t(`booth.decor.${l}`)}
                  </button>
                ))}
              </span>
              <span className="flex border-2 border-[var(--c-ink)]" role="radiogroup" aria-label={t("booth.decor.density")}>
                {([1, 2, 3] as const).map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={d.density === n} aria-label={t(`booth.decor.density${n}`)} className={seg(d.density === n)} onClick={() => set(d.kind, { density: n })}>
                    {"•".repeat(n)}
                  </button>
                ))}
              </span>
              <button type="button" aria-label={t("booth.shuffle")} title={t("booth.shuffle")} className="border-2 border-[var(--c-ink)] bg-[var(--c-paper2)] px-2 py-1 text-sm shadow-[2px_2px_0_var(--c-shadow)]" onClick={() => set(d.kind, { seed: newSeed() })}>
                🎲
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
