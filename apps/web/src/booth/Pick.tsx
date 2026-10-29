"use client";

import { useEffect, useMemo, useState } from "react";
import { useT } from "@/store/settings";
import { Btn, mono, serif } from "./ui";

// Pick the shots that go into the frame when spares were taken (design §2.4, D-157): tap in
// the order they go into the cells; tap again to drop one.

export function Pick({ takes, need, onDone }: { takes: Blob[]; need: number; onDone: (order: number[]) => void }) {
  const t = useT();
  const [order, setOrder] = useState<number[]>([]);
  const urls = useMemo(() => takes.map((b) => URL.createObjectURL(b)), [takes]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  function toggle(i: number) {
    setOrder((o) => (o.includes(i) ? o.filter((x) => x !== i) : o.length < need ? [...o, i] : o));
  }

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <h1 className={`${serif} text-3xl font-black`}>{t("booth.pick", { count: need })}</h1>
        <p className="mt-1 text-sm opacity-70">{t("booth.pickHint")}</p>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto p-5">
        {urls.map((u, i) => {
          const n = order.indexOf(i);
          return (
            <button key={u} type="button" aria-pressed={n >= 0} onClick={() => toggle(i)} className={`relative overflow-hidden rounded ${n >= 0 ? "outline outline-3 outline-[#efe6d6]" : "opacity-75"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- a local blob URL */}
              <img src={u} alt="" className="block w-full" />
              {n >= 0 && <span className={`${mono} absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#efe6d6] text-sm font-bold text-[#15110e]`}>{n + 1}</span>}
            </button>
          );
        })}
      </div>
      <div className="shrink-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <Btn tone="main" className="w-full py-4 text-sm" disabled={order.length !== need} onClick={() => onDone(order)}>
          {t("booth.next")} · {order.length}/{need}
        </Btn>
      </div>
    </div>
  );
}
