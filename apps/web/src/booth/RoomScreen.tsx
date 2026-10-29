"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { frameById, shotAspect } from "@ig-layout/core/booth/frames";
import { tileShot } from "@ig-layout/core/booth/group";
import { MAX_MEMBERS } from "@ig-layout/core/booth/protocol";
import type { BoothRoll } from "@ig-layout/core/storage/booth";
import { useT } from "@/store/settings";
import { FrameCanvas } from "./FrameCanvas";
import { FramePicker } from "./FramePicker";
import { ThemePicker } from "./ThemePicker";
import type { Room } from "./room";
import { useSession } from "./room";
import { shutter } from "./Shoot";
import { COUNTDOWN_S, REST_S } from "./timing";
import { Btn, Confirm, Label, Paper, display, mono, serif } from "./ui";

// The group room (D-148, D-159; design: docs/discussions/2026-10-29-booth-thiet-ke.md §20).
// The code is the ticket; everyone is a polaroid with their live camera and voice; the host
// lets people in, picks the frame (everyone sees it) and starts the roll; one countdown on
// every phone (8 s, 2 s rest — D-154); each phone shoots its own camera and the photos are
// swapped peer-to-peer; when everyone's photos are in, each shot becomes everyone tiled in
// its cell and the roll goes to the print screen — on every phone.

const EMPTY: never[] = [];
/** Stop waiting for someone's photos after this long (they may have dropped). */
const RECEIVE_TIMEOUT = 25_000;

export function RoomScreen({ room, sound, theme, onRoll, onLeave }: {
  room: Room;
  sound: boolean;
  /** The host's own theme (they pick it here for everyone). */
  theme: string;
  onRoll: (roll: BoothRoll) => void;
  onLeave: () => void;
}) {
  const t = useT();
  useSession(room);
  const s = room.session;
  const host = !!s.me?.host;
  const [mic, setMic] = useState(true);
  const [asking, setAsking] = useState(false);
  const [copied, setCopied] = useState(false);
  const people = s.everyone();
  const peers = new Map(s.peers().map((p) => [p.member.id, p]));
  const frame = frameById(s.frameId ?? "strip4");

  // The host's frame is everyone's: say it once on arrival (newcomers get it on connect).
  useEffect(() => {
    if (host && !s.frameId) s.setFrame("strip4", theme);
  }, [host, s, theme]);

  // ---- the roll: countdown, flash, then wait for everyone's photos ----
  const [now, setNow] = useState(() => performance.now());
  const roll = s.roll;
  useEffect(() => {
    if (!roll) return;
    const id = setInterval(() => setNow(performance.now()), 100);
    return () => clearInterval(id);
  }, [roll]);
  const shotAt = (k: number) => roll!.startAt + roll!.lead + roll!.gap * k;
  const next = roll ? Array.from({ length: roll.shots }, (_, k) => k).find((k) => shotAt(k) > now) : undefined;
  const left = roll && next !== undefined ? shotAt(next) - now : 0;
  const counting = roll && next !== undefined && left <= COUNTDOWN_S * 1000;
  const seconds = Math.max(1, Math.ceil(left / 1000));
  const taken = roll ? (next ?? roll.shots) : 0;

  const audio = useRef<AudioContext | null>(null);
  const [flash, setFlash] = useState(0);
  const lastTaken = useRef(0);
  useEffect(() => {
    if (taken > lastTaken.current) {
      if (sound) shutter(audio);
      setFlash((f) => f + 1);
    }
    lastTaken.current = roll ? taken : 0;
  }, [taken, roll, sound]);
  useEffect(() => () => void audio.current?.close(), []);

  // After the roll: everyone's photos in (or the wait is over) → the print, once per roll.
  const last = s.lastRoll;
  const present = last ? last.members.filter((id) => id === s.me?.id || peers.has(id)) : [];
  const got = last ? [...(s.photos.get(last.id)?.values() ?? [])].reduce((n, m) => n + [...m.keys()].filter((id) => present.includes(id)).length, 0) : 0;
  const total = last ? last.shots * present.length : 0;
  const receiving = !!last && !roll && got < total;
  const [timedOut, setTimedOut] = useState<number | null>(null);
  useEffect(() => {
    if (!last || roll) return;
    const id = setTimeout(() => setTimedOut(last.id), RECEIVE_TIMEOUT);
    return () => clearTimeout(id);
  }, [last, roll]);
  useEffect(() => {
    if (!last || roll || room.printed.has(last.id) || (got < total && timedOut !== last.id)) return;
    room.printed.add(last.id);
    void (async () => {
      const f = frameById(last.frameId ?? "strip4");
      // The host's order (the same on every phone), skipping anyone who left before shooting.
      const known = new Map(s.everyone().map((m) => [m.id, m.name]));
      const order = last.members.filter((id) => known.has(id));
      const names = order.map((id) => known.get(id)!);
      const shots: (Blob | null)[] = [];
      for (let k = 0; k < f.shots; k++) {
        const byMember = s.photos.get(last.id)?.get(k);
        const blobs = order.map((id) => byMember?.get(id)).filter((b): b is Blob => !!b);
        shots.push(blobs.length ? await tileShot(blobs, shotAspect(f, k)) : null);
      }
      const at = Date.now();
      onRoll({ id: crypto.randomUUID(), frameId: f.id, shots, flip: false, room: { code: room.code, names, key: `${room.code}:${s.everyone().find((m) => m.host)?.id ?? ""}:${last.id}` }, createdAt: at, updatedAt: at, thumbnail: new Blob() });
    })();
  }, [last, roll, got, total, timedOut, s, room, onRoll]);

  // ---- before being in: opening, knocking, errors ----
  if (s.status !== "in") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
        {s.status === "error" ? (
          <Paper notch tilt={-1} className="w-full max-w-sm">
            <div className="p-6 text-center">
              <Label>{t("booth.room.label")} · {room.code}</Label>
              <p className={`${serif} mt-2 text-2xl leading-tight`} style={display}>
                {t(`booth.room.err.${s.error ?? "network"}`)}
              </p>
              <Btn tone="main" className="mt-5 w-full" onClick={onLeave}>
                {t("booth.home")}
              </Btn>
            </div>
          </Paper>
        ) : (
          <>
            <div className="w-48">
              <Polaroid stream={room.stream} self name={t("booth.room.you")} mirror={!room.fake} />
            </div>
            <div className="text-center">
              <p className={`${serif} text-2xl`} style={display}>
                {s.status === "waiting" ? t("booth.room.knocking", { code: room.code }) : t("booth.room.opening")}
              </p>
              {s.status === "waiting" && <p className={`${mono} mt-1 text-xs opacity-70`}>{t("booth.room.knockHint")}</p>}
            </div>
            <Btn onClick={onLeave}>{t("booth.room.cancel")}</Btn>
          </>
        )}
      </div>
    );
  }

  const link = `${location.origin}/booth?r=${room.code}`;
  const cols = people.length <= 1 ? "grid-cols-1 max-w-xs" : people.length <= 4 ? "grid-cols-2 max-w-lg" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-4xl";

  return (
    <div className="flex h-full flex-col">
      {/* The ticket: room code, copy link, head count. */}
      <header className="flex shrink-0 items-center justify-between gap-3 border-b-2 border-[#0b0806] bg-[#f3e9d6] px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] text-[#1d1612]">
        <div className="flex items-baseline gap-3">
          <Label>{t("booth.room.label")}</Label>
          <span className={`${mono} text-2xl font-bold tracking-[0.3em]`} data-room-code>
            {room.code}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`${mono} hidden text-[10px] uppercase tracking-[0.15em] opacity-60 sm:inline`}>{t("booth.room.people", { n: people.length, max: MAX_MEMBERS })}</span>
          <Btn
            className="px-3 py-2 text-[10px]"
            onClick={() => {
              void navigator.clipboard?.writeText(link).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              });
            }}
          >
            {copied ? t("booth.room.copied") : t("booth.room.copy")}
          </Btn>
        </div>
      </header>
      <div aria-hidden className="h-2.5 shrink-0 bg-[#c8432f]" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 16px, #1a1310 16px 28px)", backgroundSize: "100% 45%", backgroundRepeat: "no-repeat", backgroundPosition: "bottom" }} />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Everyone. */}
        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-6">
          {host &&
            s.knocks.map((k) => (
              <div key={k.id} className="mx-auto mb-3 flex max-w-lg animate-[booth-pop_0.25s_ease-out] items-center justify-between gap-3 border-2 border-[#1d1612] bg-[#eaa63c] px-3 py-2 text-[#1d1612] shadow-[4px_4px_0_#0b0806]">
                <span className={`${mono} text-xs font-bold`}>{t("booth.room.knock", { name: k.name })}</span>
                <span className="flex gap-2">
                  <Btn tone="main" className="px-3 py-1.5 text-[10px]" onClick={() => s.admit(k.id, true)}>
                    {t("booth.room.admit")}
                  </Btn>
                  <Btn className="px-3 py-1.5 text-[10px]" onClick={() => s.admit(k.id, false)}>
                    {t("booth.room.deny")}
                  </Btn>
                </span>
              </div>
            ))}
          <div className={`mx-auto grid gap-4 ${cols}`}>
            {people.map((m, i) => {
              const self = m.id === s.me?.id;
              const peer = peers.get(m.id);
              return (
                <Polaroid
                  key={m.id}
                  stream={self ? room.stream : (peer?.stream ?? null)}
                  self={self}
                  mirror={self && !room.fake}
                  tilt={i % 2 ? 1.2 : -1.2}
                  name={m.name}
                  host={m.host}
                  you={self ? t("booth.room.you") : undefined}
                  hostLabel={t("booth.room.host")}
                  status={!self && peer && peer.link !== "connected" ? (peer.link === "failed" ? t("booth.room.noLink") : t("booth.room.connecting")) : undefined}
                />
              );
            })}
          </div>
          {people.length === 1 && <p className={`${mono} mx-auto mt-5 max-w-xs text-center text-xs leading-relaxed opacity-70`}>{t("booth.room.alone")}</p>}

          {/* The countdown, over everyone. */}
          {roll && (
            <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center">
              {counting ? (
                <span key={seconds} data-countdown className={`${serif} animate-[booth-pop_0.35s_ease-out] text-[120px] leading-none text-[#f3e9d6] [-webkit-text-stroke:3px_#1d1612] [paint-order:stroke_fill] drop-shadow-[4px_4px_0_#0b0806]`} style={display}>
                  {seconds}
                </span>
              ) : (
                <span className={`${mono} rounded-full bg-black/60 px-5 py-2 text-sm font-bold uppercase tracking-[0.25em]`}>{taken > 0 ? t("booth.room.rest") : t("booth.getReady")}</span>
              )}
            </div>
          )}
          {receiving && (
            <div role="status" className={`${mono} fixed inset-x-0 bottom-28 z-30 mx-auto w-fit rounded-full bg-black/70 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] lg:bottom-8`}>
              {t("booth.room.receiving", { got, total })}
            </div>
          )}
        </div>

        {/* The frame (the host picks) and the controls. */}
        <div className="shrink-0 border-t-2 border-[#0b0806] bg-[#f3e9d6] pb-[max(0.75rem,env(safe-area-inset-bottom))] text-[#1d1612] lg:flex lg:w-[440px] lg:flex-col lg:overflow-y-auto lg:border-t-0 lg:border-l-2">
          <Label className="px-5 pt-3">{t("booth.room.frameBy")}</Label>
          {host ? (
            <div className={roll ? "pointer-events-none opacity-50" : ""}>
              <FramePicker value={frame.id} onChange={(id) => s.setFrame(id)} />
              <ThemePicker compact value={s.theme ?? theme} onPick={(th) => s.setFrame(frame.id, th.id)} />
            </div>
          ) : (
            <div className="flex items-center gap-3 px-5 py-3" data-host-frame={frame.id}>
              <FrameCanvas frame={frame} images={EMPTY} scale={200 / Math.max(frame.width, frame.height)} className="max-h-20 max-w-20" />
              <span className={`${mono} text-xs font-bold uppercase tracking-[0.12em]`}>
                {t(`booth.frame.${frame.id}` as Parameters<typeof t>[0])} · {t("booth.shots", { count: frame.shots })}
                {s.theme && <> · {t(`booth.theme.${s.theme}` as Parameters<typeof t>[0])}</>}
              </span>
            </div>
          )}
          <div className="flex items-stretch gap-2 px-5 pt-1 lg:mt-auto lg:pb-4">
            {host ? (
              <Btn tone="main" className="flex-1 py-4 text-sm" disabled={!!roll || receiving} onClick={() => s.shoot(frame.shots, (COUNTDOWN_S + REST_S) * 1000, COUNTDOWN_S * 1000)}>
                ✶ {t("booth.room.shoot", { count: frame.shots })}
              </Btn>
            ) : (
              <p className={`${mono} flex flex-1 items-center justify-center border-2 border-dashed border-[#1d1612]/40 px-2 text-center text-[11px] font-bold uppercase tracking-[0.1em] opacity-70`}>{t("booth.room.waitHost")}</p>
            )}
            <Btn
              aria-label={t("booth.room.mic")}
              aria-pressed={mic}
              className={`px-3.5 ${mic ? "" : "!bg-[#1d1612] !text-[#f3e9d6]"}`}
              onClick={() => {
                room.setMic(!mic);
                setMic(!mic);
              }}
            >
              {mic ? "🎙" : "🔇"}
            </Btn>
            <Btn tone="danger" className="px-3.5" aria-label={t("booth.room.leave")} onClick={() => setAsking(true)}>
              ✕
            </Btn>
          </div>
        </div>
      </div>

      {flash > 0 && <div key={flash} aria-hidden className="pointer-events-none fixed inset-0 z-40 animate-[booth-flash_0.5s_ease-out_forwards] bg-white" />}
      {asking && (
        <Confirm
          title={t("booth.room.leaveTitle")}
          body={host ? t("booth.room.leaveHostBody") : t("booth.room.leaveBody")}
          yes={t("booth.room.leave")}
          no={t("booth.room.stay")}
          danger
          onYes={onLeave}
          onNo={() => setAsking(false)}
        />
      )}
    </div>
  );
}

/** One person: their live camera in a polaroid, name under it. Remote ones play their voice. */
function Polaroid({ stream, self, mirror, tilt = 0, name, host, you, hostLabel, status }: {
  stream: MediaStream | null;
  self?: boolean;
  mirror?: boolean;
  tilt?: number;
  name: string;
  host?: boolean;
  you?: string;
  hostLabel?: string;
  status?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.srcObject = stream;
    if (stream) void v.play().catch(() => {});
  }, [stream]);
  const initial = useMemo(() => name.trim().slice(0, 1).toUpperCase(), [name]);
  return (
    <figure className="bg-[var(--booth-polaroid,#f6efe2)] p-2 pb-0 shadow-[5px_5px_0_#0b0806]" style={{ transform: `rotate(${tilt}deg)` }} data-person={name}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#2a231d]">
        {!stream && <span className={`${serif} absolute inset-0 flex items-center justify-center text-6xl text-[#f3e9d6]/40`} style={display}>{initial}</span>}
        {/* Own video muted (no echo); others' play their voice. */}
        <video ref={ref} muted={self} playsInline autoPlay className="h-full w-full object-cover" style={{ transform: mirror ? "scaleX(-1)" : undefined }} />
        {host && <span className={`${mono} absolute top-1.5 left-1.5 bg-[#eaa63c] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#1d1612]`}>★ {hostLabel}</span>}
        {status && <span className={`${mono} absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-[10px] uppercase tracking-[0.12em] text-[#f3e9d6]`}>{status}</span>}
      </div>
      <figcaption className={`${mono} flex h-9 items-center gap-1 truncate px-0.5 text-[13px] font-bold text-[#1d1612]`}>
        {name}
        {you && <span className="font-normal opacity-55">· {you}</span>}
      </figcaption>
    </figure>
  );
}

/** Asked once before the first room (kept for next time). */
export function NamePrompt({ initial, onName, onCancel }: { initial: string; onName: (name: string) => void; onCancel: () => void }) {
  const t = useT();
  const [name, setName] = useState(initial);
  const ok = name.trim().length > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6" onClick={onCancel}>
      <form
        role="dialog"
        aria-modal="true"
        aria-label={t("booth.room.name")}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) onName(name.trim());
        }}
        className="w-full max-w-sm animate-[booth-pop_0.2s_ease-out]"
      >
        <Paper notch tilt={-1}>
          <div className="p-6">
            <Label>{t("booth.room.name")}</Label>
            <input
              autoFocus
              value={name}
              maxLength={20}
              placeholder={t("booth.room.namePlaceholder")}
              onChange={(e) => setName(e.target.value)}
              className={`${mono} mt-2 w-full border-2 border-[#1d1612] bg-[#fbf6ec] px-3 py-3 text-base outline-none focus:shadow-[3px_3px_0_#c8432f]`}
            />
            <p className={`${mono} mt-1.5 text-[11px] opacity-60`}>{t("booth.room.nameHint")}</p>
            <Btn type="submit" tone="main" className="mt-4 w-full py-3.5" disabled={!ok}>
              {t("booth.room.continue")}
            </Btn>
          </div>
        </Paper>
      </form>
    </div>
  );
}
