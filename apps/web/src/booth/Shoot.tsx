"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { snap, type Facing } from "@ig-layout/core/booth/camera";
import { shotAspect, type BoothFrame } from "@ig-layout/core/booth/frames";
import { useT } from "@/store/settings";
import { CameraView, type Camera } from "./CameraView";
import { COUNTDOWN_S, REST_S } from "./timing";
import { Confirm, RoundBtn, mono, serif } from "./ui";

// Shooting (design §2.3, D-154): an 8 s countdown per shot, a white flash (light for the front
// camera) and a shutter click, 2 s rest, next shot — on its own until the roll is done. Pause,
// retake the last shot, exit (asks first once there are shots). Each shot is a full-resolution
// frame from the camera, not mirrored (D-153); render.ts crops it into the cell.

type Phase = "wait" | "count" | "rest";

interface State {
  phase: Phase;
  /** When the current phase ends (performance.now() ms). */
  until: number;
  /** Paused: ms that were left. */
  paused: number | null;
}

export function Shoot({ camera, facing, frame, plan, sound, onSound, onDone, onExit }: {
  camera: Camera | null;
  facing: Facing;
  frame: BoothFrame;
  plan: { count: number; targets: number[] | null };
  sound: boolean;
  onSound: (on: boolean) => void;
  onDone: (shots: Blob[]) => void;
  onExit: () => void;
}) {
  const t = useT();
  const video = useRef<HTMLVideoElement>(null);
  const [shots, setShots] = useState<Blob[]>([]);
  const [st, setSt] = useState<State>({ phase: "wait", until: 0, paused: null });
  const [now, setNow] = useState(0);
  const [flash, setFlash] = useState(0);
  const [asking, setAsking] = useState(false);
  const busy = useRef(false);
  const audio = useRef<AudioContext | null>(null);

  // Which cell the next shot goes into: its shape is the window on the camera.
  const shotIndex = plan.targets ? plan.targets[Math.min(shots.length, plan.targets.length - 1)] : Math.min(shots.length, frame.shots - 1);
  const aspect = shotAspect(frame, shotIndex);

  // Latest values for the timer (it runs outside React's render).
  const live = useRef({ st, shots, sound, onDone, count: plan.count });
  useEffect(() => {
    live.current = { st, shots, sound, onDone, count: plan.count };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const t0 = performance.now();
      setNow(t0);
      const { st, shots } = live.current;
      const v = video.current;
      if (st.paused !== null || busy.current) return;
      if (st.phase === "wait") {
        // Start once the camera shows a picture.
        if (v && v.videoWidth) setSt({ phase: "count", until: t0 + COUNTDOWN_S * 1000, paused: null });
      } else if (st.phase === "rest" && t0 >= st.until) {
        setSt({ phase: "count", until: t0 + COUNTDOWN_S * 1000, paused: null });
      } else if (st.phase === "count" && t0 >= st.until && v) {
        busy.current = true;
        if (live.current.sound) shutter(audio);
        setFlash((f) => f + 1);
        void snap(v).then((blob) => {
          busy.current = false;
          if (!blob) return;
          const next = [...shots, blob];
          setShots(next);
          if (next.length >= live.current.count) {
            setSt({ phase: "rest", until: Infinity, paused: null });
            setTimeout(() => live.current.onDone(next), 700);
          } else {
            setSt({ phase: "rest", until: performance.now() + REST_S * 1000, paused: null });
          }
        });
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => () => void audio.current?.close(), []);

  const paused = st.paused !== null;
  const left = paused ? st.paused! : st.until - now;
  const seconds = Math.max(1, Math.ceil(left / 1000));
  const progress = st.phase === "count" ? 1 - Math.max(0, left) / (COUNTDOWN_S * 1000) : 0;

  function togglePause() {
    const t0 = performance.now();
    setSt((s) => (s.paused === null ? { ...s, paused: Math.max(0, s.until - t0) } : { ...s, until: t0 + s.paused, paused: null }));
  }

  function retakeLast() {
    if (!shots.length || busy.current) return;
    setShots(shots.slice(0, -1));
    setSt({ phase: "count", until: performance.now() + COUNTDOWN_S * 1000, paused: null });
  }

  const urls = useMemo(() => shots.map((b) => URL.createObjectURL(b)), [shots]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  return (
    <div className="relative h-full">
      <CameraView camera={camera} facing={facing} aspect={aspect} videoRef={video}>
        {/* Top bar */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <RoundBtn label={t("booth.exit")} onClick={() => (shots.length ? setAsking(true) : onExit())}>
            ✕
          </RoundBtn>
          <p className={`${mono} rounded-full bg-black/45 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em]`} aria-live="polite">
            {t("booth.shotOf", { n: Math.min(shots.length + 1, plan.count), total: plan.count })}
          </p>
          <div className="flex gap-2">
            <RoundBtn label={t("booth.sound")} aria-pressed={sound} onClick={() => onSound(!sound)}>
              {sound ? "🔊" : "🔇"}
            </RoundBtn>
            <RoundBtn label={paused ? t("booth.resume") : t("booth.pause")} onClick={togglePause}>
              {paused ? "▶" : "❚❚"}
            </RoundBtn>
          </div>
        </div>

        {/* Countdown */}
        {st.phase === "count" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#efe6d6" strokeOpacity={0.2} strokeWidth="3" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="#efe6d6" strokeWidth="3" strokeDasharray={289} strokeDashoffset={289 * (1 - progress)} strokeLinecap="round" />
              </svg>
              <span key={seconds} className={`${serif} animate-[booth-pop_0.35s_ease-out] text-8xl font-black drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]`}>
                {seconds}
              </span>
            </div>
          </div>
        )}
        {st.phase === "wait" && <p className={`${mono} absolute inset-x-0 top-1/2 text-center text-sm uppercase tracking-[0.3em]`}>{t("booth.getReady")}</p>}
        {paused && <div className="absolute inset-0 bg-black/40" />}

        {/* Shots so far, and retake the last one */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-2 overflow-x-auto">
            {urls.map((u, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- a local blob URL
              <img key={u} src={u} alt="" className="h-16 w-auto animate-[booth-drop_0.45s_ease-out] rounded-[3px] border-2 border-[#efe6d6]" data-shot={i} />
            ))}
          </div>
          {shots.length > 0 && shots.length < plan.count && (
            <button type="button" onClick={retakeLast} className={`${mono} shrink-0 rounded-full bg-black/55 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em]`}>
              ↺ {t("booth.retakeLast")}
            </button>
          )}
        </div>
      </CameraView>

      {/* Flash: white, then fades (lights the face on the front camera). */}
      {flash > 0 && <div key={flash} aria-hidden className="pointer-events-none absolute inset-0 animate-[booth-flash_0.5s_ease-out_forwards] bg-white" />}

      {asking && (
        <Confirm
          title={t("booth.exitTitle")}
          body={t("booth.exitBody")}
          yes={t("booth.leave")}
          no={t("booth.keep")}
          danger
          onYes={onExit}
          onNo={() => setAsking(false)}
        />
      )}
    </div>
  );
}

/** A short shutter click: a burst of noise, no sound file to load. */
function shutter(ctx: { current: AudioContext | null }) {
  try {
    ctx.current ??= new AudioContext();
    const a = ctx.current;
    const len = Math.floor(a.sampleRate * 0.09);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = a.createBufferSource();
    src.buffer = buf;
    const g = a.createGain();
    g.gain.value = 0.5;
    src.connect(g).connect(a.destination);
    src.start();
  } catch {}
}
