"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { isRoomCode } from "@ig-layout/core/booth/protocol";
import { listRolls, type BoothRoll } from "@ig-layout/core/storage/booth";
import { useAppSwitch } from "@/components/AppSwitch";
import { SwitchTag } from "@/components/SwitchTag";
import { LAYOUT_TAG, LayoutTagFace } from "@/components/TagFaces";
import { useSettings, useT } from "@/store/settings";
import { Bulbs, Label, Paper, Perforation, Ticker, display, mono, serif } from "./ui";
import { Stage } from "./Stage";

// The booth lobby (design §2.1): the running band and the bulb sign of a cinema front, a
// paper ticket with the three ways in (solo, start a group room, join one by code), upload, and recent prints
// pinned under it. The hanging tag goes back to IG Layout (D-151).

/** `preview`: drawn as IG Layout's peek at the booth (no tag, nothing to tap). */
export function BoothHome({ onSolo, onRoom, onUpload, onOpen, preview }: { onSolo: () => void; onRoom: (code: string | null) => void; onUpload: (files: File[]) => void; onOpen: (roll: BoothRoll) => void; preview?: boolean }) {
  const t = useT();
  const toLayout = useAppSwitch("layout");
  const locale = useSettings((s) => s.locale);
  const file = useRef<HTMLInputElement>(null);
  const [rolls, setRolls] = useState<BoothRoll[]>([]);
  const [code, setCode] = useState("");
  useEffect(() => {
    void listRolls().then(setRolls, () => {});
  }, []);

  return (
    // The lobby never scrolls (owner, 2026-10-30): the stage fills the screen, recent prints
    // peek up from its bottom edge.
    <div className="h-full overflow-hidden">
      <Stage />
      <div className="relative">
      <Ticker items={t("booth.ticker").split("|")} />
      {/* One column on the stage, centred; it grows with the screen (phone → tablet → computer). */}
      <div className="mx-auto flex max-w-md flex-col px-5 pt-[min(3rem,5dvh)] md:max-w-xl md:pt-[min(5rem,7dvh)] lg:max-w-2xl">
        {/* The sign; on a phone its right side is kept clear for the hanging tag. */}
        <div className="mr-24 animate-[booth-pop_0.5s_ease-out] md:mx-auto md:w-[min(100%,34rem)]">
          <Bulbs>
            <p className={`${mono} text-center text-[10px] font-bold uppercase tracking-[0.35em] text-[#eaa63c] md:text-xs`}>{t("booth.kicker")}</p>
            <h1 className={`${serif} text-center text-[32px] leading-none text-[#f3e9d6] [text-shadow:0_0_18px_rgba(234,166,60,0.45)] md:text-6xl lg:text-7xl`} style={display}>
              {t("booth.title")}
            </h1>
          </Bulbs>
        </div>
        <p className={`${mono} mt-5 pr-20 text-sm leading-relaxed opacity-85 md:pr-0 md:text-center md:text-base`}>{t("booth.tagline")}</p>

        <Paper notch tilt={-0.8} className="mx-auto mt-7 w-full md:mt-10 md:max-w-lg">
          <div className="px-5 pt-5 pb-6">
            <Label className="text-center">{t("booth.admit")}</Label>
            <button
              type="button"
              onClick={onSolo}
              className="group mt-3 flex w-full items-center justify-between border-2 border-[#1d1612] bg-[#c8432f] px-4 py-4 text-left text-[#f3e9d6] shadow-[4px_4px_0_#0b0806] transition-[transform,box-shadow] duration-75 active:translate-x-[3px] active:translate-y-[3px] active:shadow-[1px_1px_0_#0b0806]"
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
              <button type="button" onClick={() => onRoom(null)} className={`${mono} flex min-h-13 sm:min-h-16 items-center justify-center border-2 border-[#1d1612] bg-[#e7d9bd] px-2 text-center text-[11px] font-bold uppercase leading-snug tracking-[0.12em] shadow-[3px_3px_0_#0b0806] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_#0b0806]`}>
                {t("booth.room")}
              </button>
              <form
                className="flex min-h-13 flex-col justify-center gap-1.5 border-2 border-[#1d1612] bg-[#e7d9bd] p-1.5 shadow-[3px_3px_0_#0b0806]"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isRoomCode(code)) onRoom(code);
                }}
              >
                <span className={`${mono} text-center text-[10px] font-bold uppercase tracking-[0.1em]`}>{t("booth.join")}</span>
                <span className="flex gap-1">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
                    placeholder={t("booth.codePlaceholder")}
                    aria-label={t("booth.join")}
                    autoCapitalize="characters"
                    className={`${mono} w-0 min-w-0 flex-1 border-2 border-[#1d1612] bg-[#fbf6ec] px-1.5 py-1.5 text-center text-sm font-bold tracking-[0.2em] outline-none`}
                  />
                  <button type="submit" disabled={!isRoomCode(code)} className={`${mono} border-2 border-[#1d1612] bg-[#c8432f] px-4 text-[11px] font-bold uppercase text-[#f3e9d6] disabled:opacity-40 sm:px-2 sm:text-[10px]`}>
                    {t("booth.go")}
                  </button>
                </span>
              </form>
            </div>
            <Perforation className="my-5" />
            <button type="button" className={`${mono} w-full text-center text-xs font-bold uppercase tracking-[0.15em] underline decoration-2 underline-offset-4`} onClick={() => file.current?.click()}>
              {t("booth.upload")}
            </button>
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
        </Paper>

        <p className={`${mono} mt-6 text-center text-[10px] uppercase tracking-[0.25em] opacity-55`}>{t("booth.privacy")}</p>
      </div>
      </div>
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
    </div>
  );
}

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
    <div className="fixed inset-x-0 bottom-0 z-30">
      {/* Just above the lowered prints. */}
      <p className={`${mono} pointer-events-none absolute inset-x-0 bottom-[84px] text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[#eaa63c]/80`}>{title}</p>
      {/* Tall enough for a raised print; the lowered ones run off the bottom edge. */}
      <div ref={row} className="no-scrollbar h-[200px] overflow-x-auto overflow-y-hidden">
        <div className="mx-auto flex h-full w-max items-end gap-5 px-6">
          {rolls.map((r, i) => {
            const raised = up === r.id;
            return (
              <div
                key={r.id}
                data-roll={raised ? "up" : "down"}
                className="shrink-0 transition-transform duration-300 ease-out"
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
