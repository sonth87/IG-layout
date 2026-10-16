"use client";

import { useState } from "react";
import { useT } from "@/store/settings";

const KEY = "ig-layout:onboarded";

/** First launch only (S1). Storage blocked → treated as seen, never a loop. */
export function useOnboarding() {
  const [show, setShow] = useState(() => {
    try {
      return !localStorage.getItem(KEY);
    } catch {
      return false;
    }
  });
  return {
    show,
    done: () => {
      try {
        localStorage.setItem(KEY, "1");
      } catch {
        // Ignore: shown again next time.
      }
      setShow(false);
    },
  };
}

/** Small drawings for each step: plain shapes, theme colours. */
function Art({ step }: { step: number }) {
  const box = "absolute rounded-md";
  if (step === 0)
    return (
      <div className="relative h-36 w-72">
        <div className={`${box} inset-y-4 left-2 right-2 bg-gradient-to-r from-[#d8c3a5] via-[#b9c4c9] to-[#cdbfd2]`} />
        {[1, 2].map((i) => (
          <div key={i} className="absolute inset-y-2 border-l-2 border-dashed border-white" style={{ left: `${(i * 100) / 3}%` }} />
        ))}
        <div className={`${box} top-9 left-[22%] h-20 w-28 bg-[#8a7d6b] shadow-lg`} />
      </div>
    );
  if (step === 1)
    return (
      <div className="relative grid h-36 w-72 grid-cols-3 gap-2">
        {["#e9e1d4", "#1f1f21", "#e4d2cd"].map((c, i) => (
          <div key={i} className="relative rounded-lg shadow" style={{ background: c }}>
            <div className="absolute inset-x-2 top-2 h-16 rounded bg-[#b9c4c9]" />
            <div className="absolute inset-x-2 bottom-3 h-2 rounded bg-[#8a8174]" />
          </div>
        ))}
      </div>
    );
  return (
    <div className="flex h-36 w-72 items-center justify-center">
      <div className="flex h-28 w-28 items-center justify-center rounded-[28px] bg-accent-soft text-5xl">🔒</div>
    </div>
  );
}

/**
 * Onboarding (S1, like SCRL's short intro, without the paywall): three steps,
 * then "Browse templates" or "Start".
 */
export function Onboarding({ onDone }: { onDone: (next: "templates" | "projects") => void }) {
  const t = useT();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const steps = [0, 1, 2] as const;
  const last = step === steps.length - 1;

  return (
    <div role="dialog" aria-modal="true" aria-label={t("onboarding.title")} className="fixed inset-0 z-50 flex flex-col bg-bg">
      <div className="flex justify-end px-5 pt-5">
        {!last && (
          <button type="button" onClick={() => onDone("projects")} className="h-10 px-2 text-sm font-semibold text-muted">
            {t("onboarding.skip")}
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 text-center">
        <Art step={step} />
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-[28px] leading-tight font-bold">{t(`onboarding.${step}.title`)}</h1>
          <p className="text-[15px] leading-relaxed text-text-2">{t(`onboarding.${step}.body`)}</p>
        </div>
      </div>
      <div className="flex justify-center gap-2 pb-6" aria-hidden="true">
        {steps.map((i) => (
          <span key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-accent" : "w-2 bg-border-2"}`} />
        ))}
      </div>
      <div className="flex flex-col gap-2.5 px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))]">
        {last ? (
          <>
            <button type="button" onClick={() => onDone("templates")} className="h-14 rounded-2xl bg-accent text-[17px] font-bold text-on-accent">
              {t("onboarding.browse")}
            </button>
            <button type="button" onClick={() => onDone("projects")} className="h-12 rounded-2xl border border-border-2 font-semibold">
              {t("onboarding.start")}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setStep((step + 1) as 1 | 2)} className="h-14 rounded-2xl bg-accent text-[17px] font-bold text-on-accent">
            {t("onboarding.next")}
          </button>
        )}
      </div>
    </div>
  );
}
