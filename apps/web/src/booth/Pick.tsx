"use client";

import { useEffect, useMemo, useState } from "react";
import { useT } from "@/store/settings";
import { Btn, Label, display, mono, serif } from "./ui";

// Pick the shots that go into the frame when spares were taken (design §2.4, D-157): a
// contact sheet — tap in the order they go into the cells (a red grease-pencil circle with
// the number), tap again to drop one.

export function Pick({ takes, need, onDone }: { takes: Blob[]; need: number; onDone: (order: number[]) => void }) {
  const t = useT();
  const [order, setOrder] = useState<number[]>([]);
  const urls = useMemo(() => takes.map((b) => URL.createObjectURL(b)), [takes]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  function toggle(i: number) {
    setOrder((o) => (o.includes(i) ? o.filter((x) => x !== i) : o.length < need ? [...o, i] : o));
  }

  return (
    <div className="flex h-full flex-col bg-[#f3e9d6] text-[#1d1612]">
      <div className="shrink-0 border-b-2 border-[#0b0806] px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4">
        <Label>{t("booth.pickHint")}</Label>
        <h1 className={`${serif} mt-1 text-4xl`} style={display}>
          {t("booth.pick", { count: need })}
        </h1>
      </div>
      {/* The contact sheet: dark film with frame numbers. */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#1d1612] p-4">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 lg:grid-cols-4">
          {urls.map((u, i) => {
            const n = order.indexOf(i);
            return (
              <button key={u} type="button" aria-pressed={n >= 0} onClick={() => toggle(i)} className="relative text-left">
                {/* eslint-disable-next-line @next/next/no-img-element -- a local blob URL */}
                <img src={u} alt="" className={`block w-full transition-opacity ${n >= 0 || order.length < need ? "" : "opacity-45"}`} />
                <span className={`${mono} mt-1 block text-[10px] font-bold tracking-[0.2em] text-[#eaa63c]`}>▸ {String(i + 1).padStart(2, "0")}A</span>
                {n >= 0 && (
                  <span aria-hidden className="pointer-events-none absolute -inset-1.5 animate-[booth-pop_0.2s_ease-out] rounded-[50%] border-[3px] border-[#c8432f]" style={{ rotate: `${i % 2 ? 2 : -3}deg` }}>
                    <span className={`${serif} absolute -top-3 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#c8432f] text-xl text-[#f3e9d6]`} style={display}>
                      {n + 1}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="shrink-0 border-t-2 border-[#0b0806] px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Btn tone="main" className="mx-auto block w-full max-w-sm py-4 text-sm" disabled={order.length !== need} onClick={() => onDone(order)}>
          {t("booth.next")} · {order.length}/{need}
        </Btn>
      </div>
    </div>
  );
}
