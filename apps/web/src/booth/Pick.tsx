"use client";

import { useEffect, useMemo, useState } from "react";
import { useT } from "@/store/settings";
import { Btn, Label, display, mono, serif } from "./ui";

// Pick the shots that go into the frame when spares were taken (design §2.4, D-157): a
// contact sheet of little prints — tap in the order they go into the cells (the print lifts,
// an amber edge hugs it, a numbered tab on its corner), tap again to drop one. Once enough
// are picked, the rest go grey. (The red grease-pencil ellipse it had was stretched by tall
// shots and ran over faces and the next print — owner, 2026-10-30.)

export function Pick({ takes, need, onDone }: { takes: Blob[]; need: number; onDone: (order: number[]) => void }) {
  const t = useT();
  const [order, setOrder] = useState<number[]>([]);
  const urls = useMemo(() => takes.map((b) => URL.createObjectURL(b)), [takes]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  function toggle(i: number) {
    setOrder((o) => (o.includes(i) ? o.filter((x) => x !== i) : o.length < need ? [...o, i] : o));
  }

  return (
    <div className="flex h-full flex-col bg-[var(--c-paper)] text-[var(--c-ink)]">
      <div className="shrink-0 border-b-2 border-[var(--c-shadow)] px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
        <Label>{t("booth.pickHint")}</Label>
        <h1 className={`${serif} mt-1 text-4xl`} style={display}>
          {t("booth.pick", { count: need })}
        </h1>
      </div>
      {/* The contact sheet: dark film with frame numbers. */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--c-floor)] p-4">
        <div className="mx-auto grid max-w-5xl grid-cols-3 gap-x-2.5 gap-y-3 md:grid-cols-4 md:gap-x-4 md:gap-y-5 lg:grid-cols-5">
          {urls.map((u, i) => {
            const n = order.indexOf(i);
            const on = n >= 0;
            const muted = !on && order.length >= need;
            return (
              <button
                key={u}
                type="button"
                aria-pressed={on}
                aria-label={`${String(i + 1).padStart(2, "0")}${on ? ` · ${n + 1}` : ""}`}
                onClick={() => toggle(i)}
                className={`relative bg-[#f6efe2] p-1 pb-0 text-left transition-[transform,box-shadow,opacity,filter] duration-200 ease-out ${on ? "-translate-y-1 shadow-[0_0_0_3px_var(--c-amber),4px_6px_0_var(--c-shadow)]" : "shadow-[3px_3px_0_var(--c-shadow)]"} ${muted ? "opacity-40 grayscale" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- a local blob URL */}
                <img src={u} alt="" className="block aspect-[3/4] w-full object-cover" />
                <span className={`${mono} flex items-center justify-between px-0.5 py-1 text-[9px] font-bold tracking-[0.15em] text-[var(--c-ink)]/60`}>
                  <span>{String(i + 1).padStart(2, "0")}A</span>
                  {on && <span className="text-[var(--c-red)]">✓</span>}
                </span>
                {on && (
                  <span
                    aria-hidden
                    className={`${serif} absolute -top-2 -left-2 flex h-8 w-8 animate-[booth-pop_0.2s_ease-out] items-center justify-center border-2 border-[var(--c-ink)] bg-[var(--c-amber)] text-lg leading-none text-[var(--c-ink)] shadow-[2px_2px_0_var(--c-shadow)]`}
                    style={{ ...display, rotate: "-6deg" }}
                  >
                    {n + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 border-t-2 border-[var(--c-shadow)] px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Btn tone="main" className="mx-auto block w-full max-w-sm py-4 text-sm" disabled={order.length !== need} onClick={() => onDone(order)}>
          {t("booth.next")} · {order.length}/{need}
        </Btn>
      </div>
    </div>
  );
}
