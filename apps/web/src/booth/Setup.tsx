"use client";

import { FRAMES, frameById, shotAspect } from "@ig-layout/core/booth/frames";
import type { Facing } from "@ig-layout/core/booth/camera";
import { useT } from "@/store/settings";
import { COUNTDOWN_S } from "./timing";
import { CameraView, type Camera } from "./CameraView";
import { FrameCanvas } from "./FrameCanvas";
import { Btn, RoundBtn, mono, useFrameName } from "./ui";

// Choose a frame with the camera already on (design §2.2, D-152): the window on the camera
// is the shape of the frame's first cell, so you see your framing before the first shot.

const EMPTY: never[] = [];

export function Setup(props: {
  camera: Camera | null;
  facing: Facing;
  frameId: string;
  spare: boolean;
  onFrame: (id: string) => void;
  onSpare: (on: boolean) => void;
  onFacing: () => void;
  onRetryCamera: () => void;
  onBack: () => void;
  onStart: () => void;
}) {
  const t = useT();
  const frameName = useFrameName();
  const frame = frameById(props.frameId);

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        <CameraView camera={props.camera} facing={props.facing} aspect={shotAspect(frame, 0)}>
          <div className="absolute inset-x-0 top-0 flex justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <RoundBtn label={t("common.back")} onClick={props.onBack}>
              ←
            </RoundBtn>
            <RoundBtn label={t("booth.switchCamera")} onClick={props.onFacing}>
              ⇄
            </RoundBtn>
          </div>
          {props.camera?.fake && (
            <div role="status" className="absolute inset-x-3 bottom-3 flex flex-col items-center gap-2 rounded-lg bg-black/70 p-3 text-center text-sm">
              <p>
                {t(`booth.camera.${props.camera.error ?? "other"}`)} {t("booth.camera.test")}
              </p>
              <button type="button" onClick={props.onRetryCamera} className={`${mono} rounded-full border border-[#efe6d6]/50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em]`}>
                ↻ {t("booth.camera.retry")}
              </button>
            </div>
          )}
        </CameraView>
      </div>

      <div className="shrink-0 border-t border-dashed border-[#efe6d6]/25 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className={`${mono} px-5 pt-4 text-[11px] uppercase tracking-[0.3em] opacity-60`}>{t("booth.frame")}</p>
        <div role="radiogroup" aria-label={t("booth.frame")} className="flex gap-3 overflow-x-auto px-5 py-3">
          {FRAMES.map((f) => {
            const on = f.id === frame.id;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => props.onFrame(f.id)}
                className={`flex w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-lg p-1.5 ${on ? "bg-[#efe6d6]/12 outline outline-1 outline-[#efe6d6]" : ""}`}
              >
                <span className="flex h-20 items-center">
                  <FrameCanvas frame={f} images={EMPTY} scale={160 / Math.max(f.width, f.height)} className="max-h-20 max-w-[72px] rounded-[2px]" />
                </span>
                <span className={`${mono} text-[10px] font-bold uppercase leading-tight tracking-wider`}>{frameName(f.id)}</span>
                <span className="text-[10px] opacity-55">{t("booth.shots", { count: f.shots })}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-3 px-5">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" className="h-5 w-5 accent-[#b5452f]" checked={props.spare} onChange={(e) => props.onSpare(e.target.checked)} />
            {t("booth.spare")}
          </label>
          <p className={`${mono} text-[11px] uppercase tracking-[0.15em] opacity-55`}>
            {frame.size} · {t("booth.countdown", { seconds: COUNTDOWN_S })}
          </p>
          <Btn tone="main" className="py-4 text-sm" disabled={!props.camera} onClick={props.onStart}>
            {t("booth.start")}
          </Btn>
        </div>
      </div>
    </div>
  );
}
