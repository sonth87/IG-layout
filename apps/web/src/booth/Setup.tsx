"use client";

import { useEffect, useState } from "react";
import { frameById, shotAspect } from "@ig-layout/core/booth/frames";
import { themeById } from "@ig-layout/core/booth/themes";
import type { Facing } from "@ig-layout/core/booth/camera";
import { useT } from "@/store/settings";
import { CameraView, type Camera } from "./CameraView";
import { DualView, type ViewKind } from "./DualView";
import { FrameLive } from "./FrameLive";
import { FramePicker } from "./FramePicker";
import { ThemePicker } from "./ThemePicker";
import { COUNTDOWNS, REST_S, takesFor } from "./timing";
import { Btn, Label, display, mono, serif } from "./ui";

// Choose a frame with the camera already on (design §2.2, D-152): the camera plays in the
// frame's first cell (or a polaroid of that cell), so you see your framing before the first
// shot. Below, the frames as paper cards on a ticket-coloured sheet. Two views (DualView):
// the whole frame (default here) and the polaroid of the first cell, the other in a corner.

const NO_SHOTS: never[] = [];
/** Thumbnails on white paper: the layout of the cells reads at a glance. */
const PICKER_LOOK = { theme: themeById("classic"), showDate: false, title: "" };

export function Setup(props: {
  camera: Camera | null;
  facing: Facing;
  frameId: string;
  spare: boolean;
  countdown: number;
  onFrame: (id: string) => void;
  onSpare: (on: boolean) => void;
  onCountdown: (seconds: number) => void;
  theme: string;
  onTheme: (id: string) => void;
  onFacing: () => void;
  onRetryCamera: () => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const t = useT();
  const frame = frameById(props.frameId);
  // Choosing a frame: the whole frame big by default (you see how the cells are laid out).
  const [view, setView] = useState<ViewKind>("frame");
  // Switching camera only makes sense with two (phones; most computers have one).
  const [cameras, setCameras] = useState(0);
  useEffect(() => {
    if (!props.camera || props.camera.fake) return;
    void navigator.mediaDevices
      ?.enumerateDevices()
      .then((d) => setCameras(d.filter((x) => x.kind === "videoinput").length))
      .catch(() => {});
  }, [props.camera]);
  // Computer: Enter starts.
  const { camera, onStart } = props;
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || !camera || (e.target as HTMLElement).closest("button, input")) return;
      e.preventDefault();
      onStart();
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [camera, onStart]);

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-[var(--c-shadow)] bg-[var(--c-paper)] px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] text-[var(--c-ink)]">
        <Btn className="px-3 py-2" aria-label={t("common.back")} onClick={props.onBack}>
          ←
        </Btn>
        <h1 className={`${serif} text-2xl`} style={display}>
          {t("booth.setupTitle")}
        </h1>
        {cameras > 1 ? (
          <Btn className="px-3 py-2" aria-label={t("booth.switchCamera")} title={t("booth.switchCamera")} onClick={props.onFacing}>
            ⇄
          </Btn>
        ) : (
          <span className="w-11" />
        )}
      </header>
      <div aria-hidden className="h-2.5 shrink-0 bg-[var(--c-red)]" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 16px, #1a1310 16px 28px)", backgroundSize: "100% 45%", backgroundRepeat: "no-repeat", backgroundPosition: "bottom" }} />

      {/* Phone: camera above, choices below. Computer: camera left, choices in a side panel. */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative min-h-0 flex-1">
          <DualView
            main={view}
            onSwap={() => setView((v) => (v === "me" ? "frame" : "me"))}
            label={view === "me" ? t("booth.view.frame") : t("booth.view.me")}
            me={(small) => <CameraView compact={small} camera={props.camera} facing={props.facing} aspect={shotAspect(frame, 0)} caption={t("booth.you")} />}
            frame={(small) => (
              <div className={`h-full w-full ${small ? "" : "px-6 py-5"}`}>
                <FrameLive frame={frame} shots={NO_SHOTS} current={0} stream={props.camera?.stream ?? null} facing={props.facing} fake={props.camera?.fake} look={{ theme: themeById(props.theme) }} />
              </div>
            )}
          />
          {props.camera?.fake && (
            <div role="status" className="absolute inset-x-4 bottom-3 flex flex-col items-center gap-2 border-2 border-[var(--c-ink)] bg-[var(--c-paper)] p-3 text-center text-[var(--c-ink)] shadow-[4px_4px_0_var(--c-shadow)]">
              <p className={`${mono} text-xs leading-relaxed`}>
                {t(`booth.camera.${props.camera.error ?? "other"}`)} {t("booth.camera.test")}
              </p>
              <Btn tone="main" className="py-2" onClick={props.onRetryCamera}>
                ↻ {t("booth.camera.retry")}
              </Btn>
            </div>
          )}
        </div>

        {/* The choices scroll; the start button stays in view below them (owner, 2026-10-30:
            on a phone it was under the fold, people didn't know how to shoot). */}
        <div className="flex max-h-[54dvh] shrink-0 flex-col border-t-2 border-[var(--c-shadow)] bg-[var(--c-paper)] text-[var(--c-ink)] lg:max-h-none lg:w-[440px] lg:border-t-0 lg:border-l-2">
          <div className="min-h-0 flex-1 overflow-y-auto lg:pt-2">
            <Label className="px-5 pt-4">{t("booth.frame")}</Label>
            <FramePicker value={frame.id} onChange={props.onFrame} look={PICKER_LOOK} />
            <Label className="px-5">{t("booth.tab.theme")}</Label>
            <ThemePicker compact value={props.theme} onPick={(th) => props.onTheme(th.id)} />
            {/* Countdown (D-162): picked before shooting, kept for next time. */}
            <Label className="px-5">{t("booth.countdownPick")}</Label>
            <div role="radiogroup" aria-label={t("booth.countdownPick")} className="mx-5 mb-4 grid grid-cols-3 gap-2">
              {COUNTDOWNS.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={props.countdown === s}
                  onClick={() => props.onCountdown(s)}
                  className={`${mono} border-2 border-[var(--c-ink)] py-2 text-sm font-bold shadow-[2px_2px_0_var(--c-shadow)] ${props.countdown === s ? "bg-[var(--c-ink)] text-[var(--c-paper)]" : "bg-[var(--c-paper2)]"}`}
                >
                  {t("booth.seconds", { seconds: s })}
                </button>
              ))}
            </div>
            {/* Spare shots (D-162): a 1-cell frame just shoots once. */}
            {frame.shots > 1 && (
              <label className={`${mono} relative mx-5 mb-3 flex cursor-pointer items-center gap-3 text-xs`}>
                <input type="checkbox" className="peer absolute top-0 left-0 h-6 w-6 cursor-pointer opacity-0" checked={props.spare} onChange={(e) => props.onSpare(e.target.checked)} />
                <span aria-hidden className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-[var(--c-ink)] bg-[var(--c-paper)] text-sm font-bold text-[var(--c-red)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                  {props.spare ? "✕" : ""}
                </span>
                {t("booth.spare", { takes: takesFor(frame.shots, true), cells: frame.shots })}
              </label>
            )}
          </div>
          <div className="shrink-0 border-t-2 border-dashed border-[var(--c-ink)]/25 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_16px_rgba(243,233,214,0.9)]">
            <Btn tone="main" className="w-full py-4 text-[15px]" disabled={!props.camera} onClick={props.onStart}>
              ✶ {t("booth.start")}
            </Btn>
            <p className={`${mono} mt-2 text-center text-[10px] uppercase tracking-[0.2em] opacity-55`}>
              {t("booth.countdown", { seconds: props.countdown, takes: takesFor(frame.shots, props.spare), rest: REST_S })}
              <span className="hidden [@media(pointer:fine)]:inline"> · {t("booth.keys.start")}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
