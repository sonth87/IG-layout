"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { snap, type Facing } from "@ig-layout/core/booth/camera";
import { shotAspect, type BoothFrame } from "@ig-layout/core/booth/frames";
import type { RenderOptions } from "@ig-layout/core/booth/render";
import type { BoothClip } from "@ig-layout/core/storage/booth";
import type { MessageKey } from "@ig-layout/core/i18n/en";
import { useT } from "@/store/settings";
import { CameraView, type Camera } from "./CameraView";
import { ClipRecorder } from "./clips";
import { DualView, type ViewKind } from "./DualView";
import { FrameLive } from "./FrameLive";
import { REST_S } from "./timing";
import { Btn, Confirm, display, mono, serif } from "./ui";

// Shooting (design §2.3, D-162, learnt from ONBOOTH): a 3 / 5 / 8 s countdown per shot on a
// little card in the corner (it doesn't cover the face) with a pose idea, a white flash (light
// for the front camera) and a shutter click, then the shot just taken shown big for the 2 s rest
// (tap it to retake it), next shot — on its own until the roll is done. Numbered slots below
// show how many are left. Pause, exit (asks first once there are shots). Each shot is a
// full-resolution frame from the camera, not mirrored (D-153); render.ts crops it into the cell.
// Around each shot a short clip is kept too (D-163, clips.ts) for the moving print.

/** Pose ideas, one per shot (booth.pose.0 … booth.pose.N-1). */
const POSES = 16;

type Phase = "wait" | "count" | "rest";

interface State {
  phase: Phase;
  /** When the current phase ends (performance.now() ms). */
  until: number;
  /** Paused: ms that were left. */
  paused: number | null;
}

export function Shoot({ camera, facing, frame, plan, base, look, countdown, sound, onSound, onDone, onExit }: {
  camera: Camera | null;
  facing: Facing;
  frame: BoothFrame;
  plan: { count: number; targets: number[] | null };
  /** The roll's shots when retaking some (shown around them in the frame view). */
  base?: (Blob | null)[];
  /** The theme the roll is shot in (the whole-frame view is drawn in it). */
  look?: RenderOptions;
  /** Seconds counted down before each shot (D-162). */
  countdown: number;
  sound: boolean;
  onSound: (on: boolean) => void;
  onDone: (shots: Blob[], clips: (BoothClip | null)[]) => void;
  onExit: () => void;
}) {
  const t = useT();
  const video = useRef<HTMLVideoElement>(null);
  const [shots, setShots] = useState<Blob[]>([]);
  const [st, setSt] = useState<State>({ phase: "wait", until: 0, paused: null });
  const [now, setNow] = useState(0);
  const [flash, setFlash] = useState(0);
  const [asking, setAsking] = useState(false);
  // Shooting: the big polaroid of me by default, the whole frame in the corner.
  const [view, setView] = useState<ViewKind>("me");
  const [landed, setLanded] = useState<{ shot: number; n: number } | null>(null);
  const busy = useRef(false);
  // The clips, one per shot (in the same order), done a moment after their shot.
  const recorder = useRef<ClipRecorder | null>(null);
  const clips = useRef<Promise<BoothClip | null>[]>([]);
  useEffect(() => {
    const r = new ClipRecorder(() => video.current);
    recorder.current = r;
    return () => r.stop();
  }, []);
  const audio = useRef<AudioContext | null>(null);
  // Where the pose ideas start: a different run each roll.
  const [poseSeed] = useState(() => Math.floor(Math.random() * POSES));

  // Which cell the next shot goes into: its shape is the window on the camera.
  const shotIndex = plan.targets ? plan.targets[Math.min(shots.length, plan.targets.length - 1)] : Math.min(shots.length, frame.shots - 1);
  const aspect = shotAspect(frame, shotIndex);
  // The frame view: the roll so far, by shot index.
  const frameShots = useMemo(() => {
    if (plan.targets) {
      const all = [...(base ?? [])];
      shots.forEach((b, i) => (all[plan.targets![i]] = b));
      return all;
    }
    return shots.slice(0, frame.shots);
  }, [shots, plan.targets, base, frame.shots]);
  const current = plan.targets ? (shots.length < plan.targets.length ? shotIndex : null) : shots.length < frame.shots ? shots.length : null;

  // Latest values for the timer (it runs outside React's render).
  const live = useRef({ st, shots, sound, onDone, count: plan.count, targets: plan.targets, ms: countdown * 1000 });
  useEffect(() => {
    live.current = { st, shots, sound, onDone, count: plan.count, targets: plan.targets, ms: countdown * 1000 };
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
        if (v && v.videoWidth) setSt({ phase: "count", until: t0 + live.current.ms, paused: null });
      } else if (st.phase === "rest" && t0 >= st.until) {
        setSt({ phase: "count", until: t0 + live.current.ms, paused: null });
      } else if (st.phase === "count" && t0 >= st.until && v) {
        busy.current = true;
        if (live.current.sound) shutter(audio);
        setFlash((f) => f + 1);
        const clip = recorder.current?.mark() ?? Promise.resolve(null);
        void snap(v).then((blob) => {
          busy.current = false;
          if (!blob) return;
          clips.current = [...clips.current.slice(0, shots.length), clip];
          const next = [...shots, blob];
          setShots(next);
          const { targets } = live.current;
          setLanded({ shot: targets ? targets[next.length - 1] : next.length - 1, n: next.length });
          if (next.length >= live.current.count) {
            // The last one is shown a moment too before moving on.
            setSt({ phase: "rest", until: Infinity, paused: null });
            // …and its clip has its last second and a half.
            const all = clips.current;
            void Promise.all([Promise.all(all), new Promise((r) => setTimeout(r, 1200))]).then(([c]) => live.current.onDone(next, c as (BoothClip | null)[]));
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
  const progress = st.phase === "count" ? 1 - Math.max(0, left) / (countdown * 1000) : 0;

  function togglePause() {
    const t0 = performance.now();
    setSt((s) => (s.paused === null ? { ...s, paused: Math.max(0, s.until - t0) } : { ...s, until: t0 + s.paused, paused: null }));
  }

  /** Skip the rest of the countdown: shoot now. */
  function shootNow() {
    setSt((s) => (s.phase === "count" && s.paused === null ? { ...s, until: performance.now() } : s));
  }

  function retakeLast() {
    if (!shots.length || busy.current) return;
    setShots(shots.slice(0, -1));
    setSt({ phase: "count", until: performance.now() + countdown * 1000, paused: null });
  }

  // Computer: Space pauses, R retakes the last shot, Esc exits (asks first once there are shots).
  const keys = useRef({ togglePause, retakeLast, shootNow, exit: () => (shots.length ? setAsking(true) : onExit()) });
  useEffect(() => {
    keys.current = { togglePause, retakeLast, shootNow, exit: () => (shots.length ? setAsking(true) : onExit()) };
  });
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input")) return;
      if (e.key === " ") keys.current.togglePause();
      else if (e.key === "r" || e.key === "R") keys.current.retakeLast();
      else if (e.key === "Enter") keys.current.shootNow();
      else if (e.key === "Escape") keys.current.exit();
      else return;
      e.preventDefault();
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, []);

  const urls = useMemo(() => shots.map((b) => URL.createObjectURL(b)), [shots]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const n = Math.min(shots.length + 1, plan.count);
  const review = urls[urls.length - 1];
  // The last seconds (the last two of a 3 s countdown): the number turns red.
  const final = st.phase === "count" && seconds <= Math.min(3, countdown - 1);

  return (
    <div className="relative flex h-full flex-col">
      {/* Top: exit, which shot (one box per shot, filled when taken), sound, pause. */}
      <header className="flex shrink-0 items-center justify-between gap-2 border-b-2 border-[#0b0806] bg-[#f3e9d6] px-3 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] text-[#1d1612]">
        <Btn className="px-3 py-2" aria-label={t("booth.exit")} onClick={() => (shots.length ? setAsking(true) : onExit())}>
          ✕
        </Btn>
        <div className="flex flex-col items-center gap-1">
          <p className={`${mono} text-[11px] font-bold uppercase tracking-[0.2em]`} aria-live="polite">
            {t("booth.shotOf", { n, total: plan.count })}
          </p>
        </div>
        <div className="flex gap-2">
          <Btn className="px-2.5 py-2" aria-label={t("booth.sound")} aria-pressed={sound} onClick={() => onSound(!sound)}>
            {sound ? "♪" : "–"}
          </Btn>
          <Btn className="px-2.5 py-2" aria-label={paused ? t("booth.resume") : t("booth.pause")} onClick={togglePause}>
            {paused ? "▶" : "❚❚"}
          </Btn>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <DualView
          main={view}
          onSwap={() => setView((v) => (v === "me" ? "frame" : "me"))}
          label={view === "me" ? t("booth.view.frame") : t("booth.view.me")}
          me={(small) => (
            <CameraView
              compact={small}
              camera={camera}
              facing={facing}
              aspect={aspect}
              videoRef={video}
              tilt={shots.length % 2 ? 1 : -1.2}
              caption={`${t("booth.you")} · ${String(n).padStart(2, "0")}/${String(plan.count).padStart(2, "0")}`}
            />
          )}
          frame={(small) => (
            <div className={`h-full w-full ${small ? "" : "px-6 py-5"}`}>
              <FrameLive frame={frame} shots={frameShots} current={current} stream={camera?.stream ?? null} facing={facing} fake={camera?.fake} landed={landed} look={look} />
            </div>
          )}
          overlay={
            <>
              {/* The countdown on a card in the corner (D-162): the face stays in view. */}
              {st.phase === "count" && (
                <div className="pointer-events-none absolute top-3 right-3 z-10 w-[min(9.5rem,34vw)] rotate-[2deg] border-2 border-[#1d1612] bg-[#f3e9d6] px-3 pt-2 pb-3 text-center text-[#1d1612] shadow-[4px_4px_0_#0b0806] md:w-44">
                  <span
                    key={seconds}
                    data-countdown
                    className={`${serif} block animate-[booth-pop_0.35s_ease-out] leading-none ${final ? "text-[64px] text-[#c8432f] md:text-[76px]" : "text-[52px] md:text-[64px]"}`}
                    style={{ ...display, textShadow: `3px 3px 0 ${final ? "#1d1612" : "#c8432f"}` }}
                  >
                    {seconds}
                  </span>
                  <span className={`${mono} mt-1.5 inline-block -rotate-1 border-2 border-[#1d1612] bg-[#eaa63c] px-2 py-0.5 text-[10px] font-bold uppercase leading-tight tracking-[0.08em] shadow-[2px_2px_0_#0b0806]`}>
                    {t(`booth.pose.${(poseSeed + shots.length) % POSES}` as MessageKey)}
                  </span>
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-1 origin-left bg-[#c8432f]" style={{ transform: `scaleX(${progress})` }} />
                </div>
              )}
              {/* The shot just taken, big, for the rest (D-162); tap it to take it again. */}
              {st.phase === "rest" && review && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#120d0a]/90 px-6 backdrop-blur-sm">
                  <button
                    type="button"
                    disabled={st.until === Infinity}
                    onClick={retakeLast}
                    aria-label={t("booth.retakeLast")}
                    className="animate-[booth-pop_0.3s_ease-out] border-2 border-[#1d1612] bg-[#f6efe2] p-2.5 pb-0 shadow-[6px_6px_0_#0b0806]"
                    style={{ rotate: shots.length % 2 ? "1.5deg" : "-1.5deg" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- a local blob URL */}
                    <img src={review} alt="" className="block max-h-[52dvh] max-w-full" />
                    <span className={`${mono} block py-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#1d1612]/70`}>
                      {st.until === Infinity ? t("booth.rollDone") : t("booth.nextShot")}
                    </span>
                  </button>
                  {st.until !== Infinity && <span className={`${mono} text-[10px] uppercase tracking-[0.2em] opacity-70`}>↺ {t("booth.tapRetake")}</span>}
                </div>
              )}
              {st.phase === "wait" && <p className={`${mono} pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm font-bold uppercase tracking-[0.3em]`}>{t("booth.getReady")}</p>}
              {paused && <div className="pointer-events-none absolute inset-0 bg-[#1d1612]/50" />}
            </>
          }
        />
      </div>

      {/* The shots so far, as little prints; retake the last one. */}
      <div className="flex min-h-[92px] shrink-0 items-center justify-between gap-3 border-t-2 border-[#0b0806] bg-[#120d0a] px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1 pl-1">
          {/* One slot per shot (D-162): taken ones show the picture, the rest are numbered. */}
          {Array.from({ length: plan.count }, (_, i) =>
            urls[i] ? (
              // eslint-disable-next-line @next/next/no-img-element -- a local blob URL
              <img key={urls[i]} src={urls[i]} alt="" data-shot={i} className="h-14 w-auto shrink-0 animate-[booth-drop_0.45s_ease-out] border-[3px] border-[#f6efe2] shadow-[3px_3px_0_#0b0806]" style={{ rotate: `${i % 2 ? 3 : -3}deg` }} />
            ) : (
              <span key={`slot-${i}`} aria-hidden className={`${mono} flex h-14 w-12 shrink-0 items-center justify-center border-2 border-dashed text-xs ${i === shots.length ? "border-[#eaa63c] text-[#eaa63c]" : "border-[#f3e9d6]/35 text-[#f3e9d6]/45"}`}>
                {i + 1}
              </span>
            ),
          )}
        </div>
        {/* Keys: only where there's room for them (a computer). */}
        <p className={`${mono} ml-auto hidden shrink-0 text-[10px] uppercase tracking-[0.15em] opacity-50 lg:block`}>{t("booth.keys.shoot")}</p>
        {st.phase === "count" && !paused && (
          <Btn tone="main" className="shrink-0 py-2.5 text-[10px]" onClick={shootNow}>
            📸 {t("booth.shootNow")}
          </Btn>
        )}
        {shots.length > 0 && shots.length < plan.count && (
          <Btn className="shrink-0 py-2.5 text-[10px]" onClick={retakeLast}>
            ↺ {t("booth.retakeLast")}
          </Btn>
        )}
      </div>

      {/* Flash: white, then fades (lights the face on the front camera). */}
      {flash > 0 && <div key={flash} aria-hidden className="pointer-events-none fixed inset-0 z-40 animate-[booth-flash_0.5s_ease-out_forwards] bg-white" />}

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
export function shutter(ctx: { current: AudioContext | null }) {
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
