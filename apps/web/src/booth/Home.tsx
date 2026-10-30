"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { isRoomCode } from "@ig-layout/core/booth/protocol";
import { listRolls, type BoothRoll } from "@ig-layout/core/storage/booth";
import type { MessageKey } from "@ig-layout/core/i18n/en";
import { useAppSwitch } from "@/components/AppSwitch";
import { SwitchTag } from "@/components/SwitchTag";
import { LAYOUT_TAG, LayoutTagFace } from "@/components/TagFaces";
import { useSettings, useT } from "@/store/settings";
import { Bulbs, Label, display, mono, serif } from "./ui";
import { Scene } from "./lobby/scenes";
import { LOBBIES, loadLobby, lobbyById, lobbyVars, saveLobby, type LobbyId, type LobbyTheme } from "./lobby/themes";

// The booth lobby (design §2.1, D-164): a scene — the cinema it started as, or Christmas,
// Tết, Halloween, cyberpunk, glitch — with its sign and a ticket with the ways in (solo,
// start a group room, join one by code), upload; recent prints pinned under it. Swipe
// sideways (or the arrows / ← → on a computer) for the next scene: it follows the finger,
// the backdrop a little slower than the ticket; the little squares in the corner say which
// one this is and jump to any. The scene is remembered. The hanging tag goes back to
// IG Layout (D-151).

interface Ways {
  onSolo: () => void;
  onRoom: (code: string | null) => void;
  /** Open the file picker (one for the lobby, not one per scene). */
  onUpload: () => void;
}

/** `preview`: drawn as IG Layout's peek at the booth (no tag, nothing to tap). `onTheme`: a
 * scene was picked (new rolls start in its print theme). */
export function BoothHome({ onSolo, onRoom, onUpload, onOpen, onTheme, preview }: Omit<Ways, "onUpload"> & { onUpload: (files: File[]) => void; onOpen: (roll: BoothRoll) => void; onTheme?: (t: LobbyTheme) => void; preview?: boolean }) {
  const t = useT();
  const toLayout = useAppSwitch("layout");
  const locale = useSettings((s) => s.locale);
  const [rolls, setRolls] = useState<BoothRoll[]>([]);
  const [lobby, setLobby] = useState<LobbyId>(loadLobby);
  const [code, setCode] = useState("");
  useEffect(() => {
    void listRolls().then(setRolls, () => {});
  }, []);
  const pick = useCallback(
    (id: LobbyId) => {
      setLobby(id);
      saveLobby(id);
      onTheme?.(lobbyById(id));
    },
    [onTheme],
  );
  const file = useRef<HTMLInputElement>(null);
  const ways = useMemo(() => ({ onSolo, onRoom, onUpload: () => file.current?.click() }), [onSolo, onRoom]);
  const page = (th: LobbyTheme, active: boolean) => <LobbyPage theme={th} active={active} ways={ways} code={code} onCode={setCode} />;

  return (
    <div className="h-full overflow-hidden">
      {preview ? <div className="absolute inset-0">{page(lobbyById(lobby), true)}</div> : <Pager value={lobby} onChange={pick} page={page} />}
      {!preview && <Squares value={lobby} onPick={pick} />}
      {rolls.length > 0 && !preview && (
        <RollShelf
          title={t("booth.recent")}
          rolls={rolls}
          label={(r) => t("booth.openRoll", { date: new Date(r.createdAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-GB") })}
          onOpen={onOpen}
        />
      )}
      {!preview && <SwitchTag label={`${t("booth.switchTo")} IG Layout`} face={<LayoutTagFace />} {...LAYOUT_TAG} string="#f3e9d6" onSwitch={toLayout.onSwitch} onProgress={toLayout.onProgress} />}
      {!preview && toLayout.overlay}
      <input
        ref={file}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) onUpload(files);
        }}
      />
    </div>
  );
}

// ── Swiping between scenes ───────────────────────────────────────────────────

const SNAP_MS = 420;

/** The shown scene and its two neighbours side by side; a drag moves them with the finger. All
 * positions come from two CSS variables (--pos per page, --drag on the row), so a drag never
 * re-renders React. */
function Pager({ value, onChange, page }: { value: LobbyId; onChange: (id: LobbyId) => void; page: (t: LobbyTheme, active: boolean) => ReactNode }) {
  const t = useT();
  const row = useRef<HTMLDivElement>(null);
  const i = LOBBIES.findIndex((l) => l.id === value);
  const n = LOBBIES.length;
  const at = (k: number) => LOBBIES[(((i + k) % n) + n) % n];
  const drag = useRef<{ x: number; y: number; t: number; id: number; on: boolean } | null>(null);
  const moved = useRef(false);
  const busy = useRef(false);

  const setDrag = (px: number, animate: boolean) => {
    const el = row.current;
    if (!el) return;
    el.dataset.snap = animate ? "1" : "";
    el.style.setProperty("--drag", `${px}px`);
  };

  /** Slide to the neighbour (dir ±1), then make it the shown one. */
  const go = useCallback(
    (dir: 1 | -1) => {
      const el = row.current;
      if (!el || busy.current) return;
      busy.current = true;
      setDrag(-dir * el.clientWidth, !matchMedia("(prefers-reduced-motion: reduce)").matches);
      setTimeout(
        () => {
          flushSync(() => onChange(at(dir).id));
          setDrag(0, false);
          busy.current = false;
        },
        matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : SNAP_MS,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `at` follows `i`
    [onChange, i],
  );

  // A computer: ← → (not while typing a code).
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [go]);

  return (
    <div
      ref={row}
      data-lobby={value}
      className="group/pager absolute inset-0 touch-pan-y overflow-hidden"
      style={{ ["--drag" as string]: "0px" }}
      onPointerDown={(e) => {
        if (e.button !== 0 || busy.current || (e.target as HTMLElement).closest("input, textarea")) return;
        drag.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, on: false };
        moved.current = false;
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d || d.id !== e.pointerId) return;
        const dx = e.clientX - d.x;
        const dy = e.clientY - d.y;
        if (!d.on) {
          if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) drag.current = null;
          else if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) {
            d.on = true;
            moved.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          return;
        }
        setDrag(dx, false);
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (!d?.on) return;
        const dx = e.clientX - d.x;
        const v = dx / Math.max(1, performance.now() - d.t);
        const w = row.current?.clientWidth ?? 1;
        if (Math.abs(dx) > w * 0.22 || Math.abs(v) > 0.45) go(dx < 0 ? 1 : -1);
        else setDrag(0, true);
      }}
      onPointerCancel={() => {
        if (drag.current?.on) setDrag(0, true);
        drag.current = null;
      }}
      // A drag isn't a tap on whatever it started on.
      onClickCapture={(e) => {
        if (moved.current) {
          e.stopPropagation();
          e.preventDefault();
          moved.current = false;
        }
      }}
    >
      {[-1, 0, 1].map((k) => {
        const th = at(k);
        return (
          <div
            key={th.id}
            data-page={th.id}
            aria-hidden={k !== 0 || undefined}
            inert={k !== 0}
            className="absolute inset-0 group-data-[snap=1]/pager:transition-transform group-data-[snap=1]/pager:duration-[420ms] group-data-[snap=1]/pager:ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ ["--pos" as string]: k, transform: "translateX(calc(var(--pos) * 100% + var(--drag)))" }}
          >
            {page(th, k === 0)}
          </div>
        );
      })}
      {/* Computer: arrows on the edges. */}
      {(
        [
          [-1, "left-3", "‹", t("booth.lobby.prev")],
          [1, "right-3", "›", t("booth.lobby.next")],
        ] as const
      ).map(([dir, side, glyph, label]) => (
        <button
          key={dir}
          type="button"
          aria-label={label}
          onClick={() => go(dir)}
          className={`absolute top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 bg-black/30 text-3xl text-white backdrop-blur-sm transition-colors hover:bg-black/50 md:flex ${side}`}
        >
          {glyph}
        </button>
      ))}
    </div>
  );
}

/** Little squares in the corner, one per scene in its colours; the shown one is bigger. Its
 * name shows for a moment when it changes. */
function Squares({ value, onPick }: { value: LobbyId; onPick: (id: LobbyId) => void }) {
  const t = useT();
  const [named, setNamed] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setNamed(true);
    const h = setTimeout(() => setNamed(false), 1600);
    return () => clearTimeout(h);
  }, [value]);
  return (
    <div className="pointer-events-none fixed top-[46px] left-3 z-30 flex items-center gap-2 md:top-[52px] md:left-5">
      <div role="radiogroup" aria-label={t("booth.lobby.pick")} className="pointer-events-auto flex items-center gap-1.5 rounded-md bg-black/35 px-1.5 backdrop-blur-[2px]">
        {LOBBIES.map((l) => {
          const on = l.id === value;
          return (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={t(`booth.lobby.${l.id}` as MessageKey)}
              onClick={() => onPick(l.id)}
              // A bigger box to tap than the square drawn.
              className="flex h-7 w-5 items-center justify-center"
            >
              <span
                className={`block transition-all duration-300 ${on ? "h-[18px] w-[18px] rotate-[-8deg] border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.6),0_0_12px_rgba(255,255,255,0.5)]" : "h-[11px] w-[11px] border border-white/45"}`}
                style={{ background: `linear-gradient(135deg, ${l.swatch[0]} 50%, ${l.swatch[1]} 50%)` }}
              />
            </button>
          );
        })}
      </div>
      <span aria-live="polite" className={`${mono} rounded-sm bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity duration-300 ${named ? "opacity-100" : "opacity-0"}`}>
        {t(`booth.lobby.${value}` as MessageKey)}
      </span>
    </div>
  );
}

// ── One scene with its sign and ticket ───────────────────────────────────────

const v = (k: keyof LobbyTheme["vars"]) => `var(--l-${k})`;

/** The page: the scene (moving a little slower than the page while swiped) and in front, the
 * band, the sign, the line under it and the ticket (a little faster). */
const LobbyPage = memo(function LobbyPage({ theme, active, ways, code, onCode }: { theme: LobbyTheme; active: boolean; ways: Ways; code: string; onCode: (c: string) => void }) {
  const t = useT();
  return (
    <div className="absolute inset-0 overflow-hidden" style={lobbyVars(theme)}>
      <div className="absolute inset-0" style={{ transform: "translateX(calc(var(--pos) * -35% + var(--drag) * -0.35))" }}>
        <Scene id={theme.id} active={active} />
      </div>
      <div className="relative" style={{ transform: "translateX(calc(var(--pos) * 6% + var(--drag) * 0.06))" }}>
        <Band text={t((theme.id === "cinema" ? "booth.ticker" : `booth.lobby.${theme.id}.ticker`) as MessageKey)} />
        {/* One column on the stage, centred; it grows with the screen (phone → tablet → computer). */}
        <div className="mx-auto flex max-w-md flex-col px-5 pt-[min(3rem,5dvh)] md:max-w-xl md:pt-[min(5rem,7dvh)] lg:max-w-2xl">
          {/* The sign; on a phone its right side is kept clear for the hanging tag. */}
          <div className="mr-24 animate-[booth-pop_0.5s_ease-out] md:mx-auto md:w-[min(100%,34rem)]">
            <Sign theme={theme} kicker={t((theme.id === "cinema" ? "booth.kicker" : `booth.lobby.${theme.id}.kicker`) as MessageKey)} title={t("booth.title")} />
          </div>
          <p className={`${mono} mt-5 pr-20 text-sm leading-relaxed opacity-90 md:pr-0 md:text-center md:text-base`} style={{ color: v("onScene"), textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
            {t("booth.tagline")}
          </p>
          <Ticket theme={theme} ways={ways} code={code} onCode={onCode} />
          <p className={`${mono} mt-6 text-center text-[10px] uppercase tracking-[0.25em] opacity-60`} style={{ color: v("onScene") }}>
            {t("booth.privacy")}
          </p>
        </div>
      </div>
    </div>
  );
});

/** The running band at the top, in the scene's colours. */
function Band({ text }: { text: string }) {
  const line = text
    .split("|")
    .map((s) => `✶ ${s} `)
    .join("");
  return (
    <div aria-hidden className="relative overflow-hidden border-b-2 border-black/70 py-2" style={{ background: v("band") }}>
      <div className={`${mono} flex w-max animate-[booth-marquee_28s_linear_infinite] whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.3em]`} style={{ color: v("bandInk") }}>
        <span className="pr-6">{line.repeat(3)}</span>
        <span className="pr-6">{line.repeat(3)}</span>
      </div>
    </div>
  );
}

function Sign({ theme, kicker, title }: { theme: LobbyTheme; kicker: string; title: string }) {
  const kick = <p className={`${mono} text-center text-[10px] font-bold uppercase tracking-[0.35em] md:text-xs`} style={{ color: v("kicker") }}>{kicker}</p>;
  const big = `${serif} text-center text-[32px] leading-none md:text-6xl lg:text-7xl`;
  if (theme.sign === "neon")
    return (
      <div className="rounded-2xl border-2 border-[#ff2bd6] bg-[#0b0618]/85 p-4 shadow-[0_0_14px_#ff2bd6,inset_0_0_14px_rgba(255,43,214,0.5)]">
        {kick}
        <h1 className={`${big} motion-safe:animate-[lobby-neon-sign_6s_linear_infinite]`} style={{ ...display, color: v("title"), textShadow: "0 0 6px #ff2bd6, 0 0 18px #ff2bd6, 0 0 36px #ff2bd6" }}>
          {title}
        </h1>
      </div>
    );
  if (theme.sign === "window")
    return (
      <div className="border-2 border-t-white border-r-black border-b-black border-l-white bg-[#c3c3c3] p-[3px] shadow-[5px_5px_0_#00ff9c]">
        <div className={`${mono} flex items-center justify-between bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-0.5 text-[10px] font-bold text-white`}>
          <span>PHOTOBOOTH.EXE</span>
          <span aria-hidden className="flex gap-0.5">
            {["_", "□", "×"].map((g) => (
              <span key={g} className="flex h-3.5 w-4 items-center justify-center border border-t-white border-r-black border-b-black border-l-white bg-[#c3c3c3] text-[9px] leading-none text-black">
                {g}
              </span>
            ))}
          </span>
        </div>
        <div className="bg-black px-3 pt-3 pb-4">
          {kick}
          <h1 className={`${big} motion-safe:animate-[lobby-glitch_4.2s_steps(1)_infinite]`} style={{ ...display, color: v("title"), textShadow: "-3px 0 #ff00e1, 3px 0 #00ffe1" }}>
            {title}
          </h1>
        </div>
      </div>
    );
  return (
    <Bulbs colors={theme.bulbs} board={v("board")}>
      {kick}
      <h1 className={big} style={{ ...display, color: v("title"), textShadow: `0 0 18px ${theme.vars.glow}` }}>
        {title}
      </h1>
    </Bulbs>
  );
}

/** The paper the ways in are printed on, with a touch of the scene. */
function Ticket({ theme, ways, code, onCode }: { theme: LobbyTheme; ways: Ways; code: string; onCode: (c: string) => void }) {
  const t = useT();
  const body = (
    <div className="px-5 pt-5 pb-6">
      <Label className="text-center !text-[var(--l-label)]">{t("booth.admit")}</Label>
      <button
        type="button"
        onClick={ways.onSolo}
        className="group mt-3 flex w-full items-center justify-between border-2 px-4 py-4 text-left shadow-[4px_4px_0_var(--l-shadow)] transition-[transform,box-shadow] duration-75 active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_var(--l-shadow)]"
        style={{ background: v("main"), color: v("mainInk"), borderColor: v("edge") }}
      >
        <span>
          <span className={`${serif} block text-2xl leading-tight`} style={display}>
            {t("booth.solo")}
          </span>
          <span className={`${mono} mt-0.5 block text-xs opacity-90`}>{t("booth.soloHint")}</span>
        </span>
        <span aria-hidden className="text-2xl transition-transform group-hover:translate-x-1">
          ✶
        </span>
      </button>
      {/* Group room (D-159): create one (the code is made for you) or join with a code. One
          column on a phone (D-164), side by side from a wider screen. */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => ways.onRoom(null)}
          className={`${mono} flex min-h-13 items-center justify-center border-2 px-2 text-center text-[11px] font-bold uppercase leading-snug tracking-[0.12em] shadow-[3px_3px_0_var(--l-shadow)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--l-shadow)] sm:min-h-16`}
          style={{ background: v("second"), color: v("secondInk"), borderColor: v("edge") }}
        >
          {t("booth.room")}
        </button>
        <form
          className="flex min-h-13 flex-col justify-center gap-1.5 border-2 p-1.5 shadow-[3px_3px_0_var(--l-shadow)]"
          style={{ background: v("second"), color: v("secondInk"), borderColor: v("edge") }}
          onSubmit={(e) => {
            e.preventDefault();
            if (isRoomCode(code)) ways.onRoom(code);
          }}
        >
          <span className={`${mono} text-center text-[10px] font-bold uppercase tracking-[0.1em]`}>{t("booth.join")}</span>
          <span className="flex gap-1">
            <input
              value={code}
              onChange={(e) => onCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
              placeholder={t("booth.codePlaceholder")}
              aria-label={t("booth.join")}
              autoCapitalize="characters"
              className={`${mono} w-0 min-w-0 flex-1 border-2 px-1.5 py-1.5 text-center text-sm font-bold tracking-[0.2em] outline-none placeholder:opacity-50`}
              style={{ background: v("field"), color: v("fieldInk"), borderColor: v("edge") }}
            />
            <button type="submit" disabled={!isRoomCode(code)} className={`${mono} border-2 px-4 text-[11px] font-bold uppercase disabled:opacity-40 sm:px-2 sm:text-[10px]`} style={{ background: v("main"), color: v("mainInk"), borderColor: v("edge") }}>
              {t("booth.go")}
            </button>
          </span>
        </form>
      </div>
      <div aria-hidden className="my-5 border-t-2 border-dashed opacity-35" style={{ borderColor: v("ink") }} />
      <button type="button" className={`${mono} w-full text-center text-xs font-bold uppercase tracking-[0.15em] underline decoration-2 underline-offset-4`} style={{ color: v("ink") }} onClick={ways.onUpload}>
        {t("booth.upload")}
      </button>
    </div>
  );

  if (theme.ticket === "window")
    return (
      <div className="mx-auto mt-7 w-full border-2 border-t-white border-r-black border-b-black border-l-white bg-[#c3c3c3] p-[3px] text-[#0b0b0b] shadow-[6px_6px_0_var(--l-shadow)] md:mt-10 md:max-w-lg" style={{ rotate: "0.6deg" }}>
        <div className={`${mono} flex items-center justify-between bg-gradient-to-r from-[#000080] to-[#1084d0] px-2 py-0.5 text-[10px] font-bold text-white`}>
          <span>📷 SHOOT.EXE</span>
          <span aria-hidden className="flex gap-0.5">
            {["_", "□", "×"].map((g) => (
              <span key={g} className="flex h-3.5 w-4 items-center justify-center border border-t-white border-r-black border-b-black border-l-white bg-[#c3c3c3] text-[9px] leading-none text-black">
                {g}
              </span>
            ))}
          </span>
        </div>
        {body}
      </div>
    );
  const mask = "radial-gradient(circle 11px at 0 50%, transparent 10px, #000 11px) left / 51% 100% no-repeat, radial-gradient(circle 11px at 100% 50%, transparent 10px, #000 11px) right / 51% 100% no-repeat";
  const glow: CSSProperties = theme.id === "cyber" ? { filter: "drop-shadow(5px 5px 0 #ff2bd6) drop-shadow(0 0 14px rgba(45,246,255,0.55))" } : { filter: `drop-shadow(5px 5px 0 ${theme.vars.shadow})` };
  return (
    <div className="relative mx-auto mt-7 w-full md:mt-10 md:max-w-lg" style={{ rotate: "-0.8deg", ...glow }}>
      <div className="relative h-full border-2" style={{ background: v("paper"), color: v("ink"), borderColor: v("edge"), WebkitMask: mask, mask }}>
        {theme.id === "tet" && <div aria-hidden className="pointer-events-none absolute inset-2 border-2 border-double border-[#ffd76a]/70" />}
        {/* Corner brackets, like a HUD. */}
        {theme.id === "cyber" &&
          ["top-2 left-2 border-t-2 border-l-2", "top-2 right-2 border-t-2 border-r-2", "bottom-2 left-2 border-b-2 border-l-2", "right-2 bottom-2 border-r-2 border-b-2"].map((c) => <span key={c} aria-hidden className={`pointer-events-none absolute h-4 w-4 border-[#2df6ff] ${c}`} />)}
        <div className="relative">{body}</div>
      </div>
      <Ornament id={theme.id} />
    </div>
  );
}

/** A touch of the scene on the ticket's corner. */
function Ornament({ id }: { id: LobbyId }) {
  if (id === "noel")
    return (
      <svg aria-hidden viewBox="0 0 80 60" className="pointer-events-none absolute -top-6 -right-3 h-14 w-20 rotate-[8deg]">
        <path d="M40 30 C22 8 4 14 10 28 C14 38 30 34 40 30 C50 34 66 38 70 28 C76 14 58 8 40 30 Z" fill="#c62828" stroke="#7a1010" strokeWidth="2" />
        <path d="M38 32 L28 58 L36 54 L40 60 L42 32 M42 32 L52 58 L46 54" fill="#c62828" stroke="#7a1010" strokeWidth="2" />
        <circle cx="40" cy="30" r="6" fill="#e23b3b" stroke="#7a1010" strokeWidth="2" />
      </svg>
    );
  if (id === "tet")
    return (
      <svg aria-hidden viewBox="0 0 60 60" className="pointer-events-none absolute -top-5 -left-3 h-12 w-12 -rotate-12">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="30" cy="16" rx="9" ry="13" transform={`rotate(${a} 30 30)`} fill="#ffd12e" stroke="#e8a400" />
        ))}
        <circle cx="30" cy="30" r="6" fill="#f08a00" />
      </svg>
    );
  if (id === "halloween")
    return (
      <svg aria-hidden viewBox="0 0 60 26" className="pointer-events-none absolute -top-4 -right-2 h-8 w-auto rotate-[10deg]">
        <path d="M30 10 q-6 -6 -10 0 q-6 -8 -20 -4 q8 4 8 12 q6 -4 12 2 q4 -6 10 -4 q6 -2 10 4 q6 -6 12 -2 q0 -8 8 -12 q-14 -4 -20 4 q-4 -6 -10 0 Z" fill="#1e1029" />
        <circle cx="27" cy="9" r="1.3" fill="#ff8c2a" />
        <circle cx="33" cy="9" r="1.3" fill="#ff8c2a" />
      </svg>
    );
  return null;
}

// ── Recent prints ────────────────────────────────────────────────────────────

/** Recent prints peeking up from the bottom edge of the stage (owner, 2026-10-30): each shows
 * its top; the one under the mouse (computer) or held / tapped (phone) rises all the way, a tap
 * elsewhere lowers it, a tap on a raised one opens it. The wheel scrolls the row sideways. */
function RollShelf({ title, rolls, label, onOpen }: { title: string; rolls: BoothRoll[]; label: (r: BoothRoll) => string; onOpen: (r: BoothRoll) => void }) {
  const row = useRef<HTMLDivElement>(null);
  const [up, setUp] = useState<string | null>(null);
  const hold = useRef(0);
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (!(e.target as Element).closest?.("[data-roll]")) setUp(null);
    };
    addEventListener("pointerdown", outside);
    const el = row.current;
    const wheel = (e: WheelEvent) => {
      if (!el || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el?.addEventListener("wheel", wheel, { passive: false });
    return () => {
      removeEventListener("pointerdown", outside);
      el?.removeEventListener("wheel", wheel);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30">
      {/* Just above the lowered prints. */}
      <p className={`${mono} pointer-events-none absolute inset-x-0 bottom-[84px] text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/80 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]`}>{title}</p>
      {/* Tall enough for a raised print; the lowered ones run off the bottom edge. Only the
          prints catch taps — the rest of the strip lets a swipe through to the scene. */}
      <div ref={row} className="no-scrollbar h-[200px] overflow-x-auto overflow-y-hidden">
        <div className="mx-auto flex h-full w-max items-end gap-5 px-6">
          {rolls.map((r, i) => {
            const raised = up === r.id;
            return (
              <div
                key={r.id}
                data-roll={raised ? "up" : "down"}
                className="pointer-events-auto shrink-0 transition-transform duration-300 ease-out"
                style={{ transform: raised ? "translateY(-14px)" : "translateY(58%)" }}
                onPointerEnter={(e) => e.pointerType === "mouse" && setUp(r.id)}
                onPointerLeave={(e) => e.pointerType === "mouse" && setUp((u) => (u === r.id ? null : u))}
                onPointerDown={(e) => {
                  if (e.pointerType === "mouse" || raised) return;
                  hold.current = window.setTimeout(() => setUp(r.id), 250);
                }}
                onPointerUp={() => window.clearTimeout(hold.current)}
                onClickCapture={(e) => {
                  // A lowered print: the first tap only raises it.
                  if (!raised) {
                    e.stopPropagation();
                    setUp(r.id);
                  }
                }}
              >
                <RollThumb roll={r} tilt={i % 2 ? 2.5 : -2} label={label(r)} onOpen={() => onOpen(r)} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** A print pinned with a bit of tape. */
function RollThumb({ roll, label, tilt, onOpen }: { roll: BoothRoll; label: string; tilt: number; onOpen: () => void }) {
  const url = useMemo(() => (roll.thumbnail.size ? URL.createObjectURL(roll.thumbnail) : null), [roll.thumbnail]);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  return (
    <button type="button" aria-label={label} onClick={onOpen} className="relative shrink-0 transition-transform active:scale-95" style={{ transform: `rotate(${tilt}deg)` }}>
      <span aria-hidden className="absolute -top-2 left-1/2 z-10 h-4 w-10 -translate-x-1/2 rotate-[-4deg] bg-[#eaa63c]/70" />
      {/* eslint-disable-next-line @next/next/no-img-element -- a local blob URL */}
      {url ? <img src={url} alt="" className="h-40 w-auto shadow-[4px_4px_0_#0b0806]" /> : <span className="block h-40 w-14 bg-[#2a231d]" />}
    </button>
  );
}
