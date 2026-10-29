"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { snap, type Facing } from "@ig-layout/core/booth/camera";
import { shotAspect, type BoothFrame } from "@ig-layout/core/booth/frames";
import { useT } from "@/store/settings";
import { CameraView, type Camera } from "./CameraView";
import { DualView, type ViewKind } from "./DualView";
import { FrameLive } from "./FrameLive";
import { COUNTDOWN_S, REST_S } from "./timing";
import { Btn, Confirm, display, mono, serif } from "./ui";

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

export function Shoot({ camera, facing, frame, plan, base, sound, onSound, onDone, onExit }: {
  camera: Camera | null;
  facing: Facing;
  frame: BoothFrame;
  plan: { count: number; targets: number[] | null };
  /** The roll's shots when retaking some (shown around them in the frame view). */
  base?: (Blob | null)[];
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
  // Shooting: the big polaroid of me by default, the whole frame in the corner.
  const [view, setView] = useState<ViewKind>("me");
  const [landed, setLanded] = useState<{ shot: number; n: number } | null>(null);
  const busy = useRef(false);
  const audio = useRef<AudioContext | null>(null);

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
  const live = useRef({ st, shots, sound, onDone, count: plan.count, targets: plan.targets });
  useEffect(() => {
    live.current = { st, shots, sound, onDone, count: plan.count, targets: plan.targets };
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
          const { targets } = live.current;
          setLanded({ shot: targets ? targets[next.length - 1] : next.length - 1, n: next.length });
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

  // Computer: Space pauses, R retakes the last shot, Esc exits (asks first once there are shots).
  const keys = useRef({ togglePause, retakeLast, exit: () => (shots.length ? setAsking(true) : onExit()) });
  useEffect(() => {
    keys.current = { togglePause, retakeLast, exit: () => (shots.length ? setAsking(true) : onExit()) };
  });
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input")) return;
      if (e.key === " ") keys.current.togglePause();
      else if (e.key === "r" || e.key === "R") keys.current.retakeLast();
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
  const final = st.phase === "count" && seconds <= 3;

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
          <div aria-hidden className="flex gap-1">
            {Array.from({ length: plan.count }, (_, i) => (
              <span key={i} className={`h-2.5 w-4 border-2 border-[#1d1612] ${i < shots.length ? "bg-[#c8432f]" : i === shots.length ? "bg-[#eaa63c]" : ""}`} />
            ))}
          </div>
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
              <FrameLive frame={frame} shots={frameShots} current={current} stream={camera?.stream ?? null} facing={facing} fake={camera?.fake} landed={landed} />
            </div>
          )}
          overlay={
            <>
              {st.phase === "count" && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative flex h-36 w-36 items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                      <circle cx="50" cy="50" r="44" fill="rgba(29,22,18,0.35)" stroke="#f3e9d6" strokeOpacity={0.35} strokeWidth="5" />
                      <circle cx="50" cy="50" r="44" fill="none" stroke={final ? "#c8432f" : "#eaa63c"} strokeWidth="5" strokeDasharray={276.5} strokeDashoffset={276.5 * (1 - progress)} />
                    </svg>
                    <span
                      key={seconds}
                      data-countdown
                      className={`${serif} animate-[booth-pop_0.35s_ease-out] leading-none ${final ? "text-[96px]" : "text-7xl"} text-[#f3e9d6] [-webkit-text-stroke:2px_#1d1612] [paint-order:stroke_fill] drop-shadow-[3px_3px_0_#0b0806]`}
                      style={display}
                    >
                      {seconds}
                    </span>
                  </div>
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
        <div className="flex gap-2 overflow-x-auto py-1 pl-1">
          {urls.map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- a local blob URL
            <img key={u} src={u} alt="" data-shot={i} className="h-14 w-auto animate-[booth-drop_0.45s_ease-out] border-[3px] border-[#f6efe2] shadow-[3px_3px_0_#0b0806]" style={{ rotate: `${i % 2 ? 3 : -3}deg` }} />
          ))}
        </div>
        <p className={`${mono} ml-auto hidden shrink-0 text-[10px] uppercase tracking-[0.15em] opacity-50 [@media(pointer:fine)]:block`}>{t("booth.keys.shoot")}</p>
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
