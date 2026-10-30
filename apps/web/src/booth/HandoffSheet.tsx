"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatShortDate } from "@ig-layout/core/format";
import type { BoothRoll } from "@ig-layout/core/storage/booth";
import { useSettings, useT } from "@/store/settings";
import type { LiveMode } from "@ig-layout/core/booth/live";
import { openInLayout, type Handoff } from "./handoff";
import { hasClips } from "./live";
import { Label, Paper, display, mono, serif } from "./ui";

// "Open in IG Layout" (D-155): ask what to make — Post, Carousel, Story, or a surprise —
// build the project, then go to the editor. The surprise unwraps a gift first. A roll with
// clips opens as photos or as video (owner, 2026-10-30) — starting on what the result screen
// was showing.

const BACKDROP_KEY = "ig-layout:booth-backdrop";

const KINDS: { kind: Handoff; icon: string }[] = [
  { kind: "post", icon: "▭" },
  { kind: "carousel", icon: "▭▭" },
  { kind: "story", icon: "▯" },
  { kind: "surprise", icon: "🎁" },
];

export function HandoffSheet({ roll, onClose, live = null }: { roll: BoothRoll; onClose: () => void; /** Shown moving on the result screen (how it plays). */ live?: LiveMode | null }) {
  const t = useT();
  const locale = useSettings((s) => s.locale);
  const router = useRouter();
  const [working, setWorking] = useState<Handoff | null>(null);
  const [failed, setFailed] = useState(false);
  const moving = hasClips(roll);
  const [video, setVideo] = useState(moving && !!live);
  // The theme's paper as the slide's background, or not (remembered).
  const [backdrop, setBackdrop] = useState(() => {
    try {
      return localStorage.getItem(BACKDROP_KEY) !== "0";
    } catch {
      return true;
    }
  });

  async function go(kind: Handoff) {
    setWorking(kind);
    setFailed(false);
    try {
      const wait = kind === "surprise" ? new Promise((r) => setTimeout(r, 900)) : null;
      await openInLayout(roll, kind, t("booth.projectName", { date: formatShortDate(roll.createdAt, locale) }), backdrop, video ? (live ?? "loop") : null);
      await wait;
      router.push("/");
    } catch (e) {
      console.warn("Open in IG Layout failed", e);
      setFailed(true);
      setWorking(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" onClick={working ? undefined : onClose}>
      <div role="dialog" aria-modal="true" aria-label={t("booth.handoff.title")} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm animate-[booth-pop_0.2s_ease-out]">
        <Paper notch>
          {working ? (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <span aria-hidden className={`text-5xl ${working === "surprise" ? "animate-[booth-gift_0.9s_ease-in-out]" : "animate-pulse"}`}>
                {working === "surprise" ? "🎁" : "▦"}
              </span>
              <p className={`${mono} text-xs font-bold uppercase tracking-[0.2em]`} role="status">
                {t(video ? "booth.handoff.workingVideo" : "booth.handoff.working")}
              </p>
            </div>
          ) : (
            <div className="p-5">
              <Label className="text-center">{t("booth.openInLayout")}</Label>
              <h2 className={`${serif} mt-1 text-center text-2xl leading-tight`} style={display}>
                {t("booth.handoff.title")}
              </h2>
              {/* Photos or video (only a roll with clips can move). */}
              {moving && (
                <>
                  <div role="radiogroup" aria-label={t("booth.handoff.as")} className="mt-4 grid grid-cols-2 border-2 border-[#1d1612]">
                    {([false, true] as const).map((v) => (
                      <button
                        key={String(v)}
                        type="button"
                        role="radio"
                        aria-checked={video === v}
                        onClick={() => setVideo(v)}
                        className={`${mono} border-r-2 border-[#1d1612] py-2 text-xs font-bold uppercase tracking-[0.1em] last:border-r-0 ${video === v ? "bg-[#1d1612] text-[#f3e9d6]" : ""}`}
                      >
                        {v ? `▶ ${t("booth.handoff.asVideo")}` : t("booth.handoff.asPhoto")}
                      </button>
                    ))}
                  </div>
                  <p className={`${mono} mt-1.5 text-center text-[10px] opacity-60`}>{t(video ? "booth.handoff.asVideoHint" : "booth.handoff.asPhotoHint")}</p>
                </>
              )}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {KINDS.map(({ kind, icon }) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => void go(kind)}
                    className={`flex flex-col items-start gap-1 border-2 border-[#1d1612] p-3 text-left shadow-[3px_3px_0_#0b0806] transition-[transform,box-shadow] duration-75 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#0b0806] ${kind === "surprise" ? "bg-[#c8432f] text-[#f3e9d6]" : "bg-[#e7d9bd]"}`}
                  >
                    <span aria-hidden className={`${mono} text-lg font-bold leading-none`}>
                      {icon}
                    </span>
                    <span className={`${mono} text-[11px] font-bold uppercase tracking-[0.12em]`}>{t(`booth.handoff.${kind}`)}</span>
                    <span className="text-[11px] leading-snug opacity-75">{t(`booth.handoff.${kind}Hint`)}</span>
                  </button>
                ))}
              </div>
              <label className={`${mono} relative mt-4 flex cursor-pointer items-center gap-3 text-xs`}>
                <input
                  type="checkbox"
                  className="peer absolute top-0 left-0 h-6 w-6 cursor-pointer opacity-0"
                  checked={backdrop}
                  onChange={(e) => {
                    setBackdrop(e.target.checked);
                    try {
                      localStorage.setItem(BACKDROP_KEY, e.target.checked ? "1" : "0");
                    } catch {}
                  }}
                />
                <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-[#1d1612] bg-[#fbf6ec] text-sm font-bold text-[#c8432f]">
                  {backdrop ? "✕" : ""}
                </span>
                <span>
                  {t("booth.handoff.backdrop")}
                  <span className="block text-[10px] opacity-60">{t("booth.handoff.backdropHint")}</span>
                </span>
              </label>
              {failed && <p className={`${mono} mt-3 text-center text-xs text-[#c8432f]`}>{t("booth.handoff.failed")}</p>}
            </div>
          )}
        </Paper>
      </div>
    </div>
  );
}
