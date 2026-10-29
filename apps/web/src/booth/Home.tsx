"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { listRolls, type BoothRoll } from "@ig-layout/core/storage/booth";
import { SwitchTag } from "@/components/SwitchTag";
import { useSettings, useT } from "@/store/settings";
import { Bulbs, Label, Paper, Perforation, Ticker, display, mono, serif } from "./ui";

// The booth lobby (design §2.1): the running band and the bulb sign of a cinema front, a
// paper ticket with the three ways in (solo; rooms come later), upload, and recent prints
// pinned under it. The hanging tag goes back to IG Layout (D-151).

export function BoothHome({ onSolo, onUpload, onOpen }: { onSolo: () => void; onUpload: (files: File[]) => void; onOpen: (roll: BoothRoll) => void }) {
  const t = useT();
  const router = useRouter();
  const locale = useSettings((s) => s.locale);
  const file = useRef<HTMLInputElement>(null);
  const [rolls, setRolls] = useState<BoothRoll[]>([]);
  useEffect(() => {
    void listRolls().then(setRolls, () => {});
  }, []);

  return (
    <div className="h-full overflow-y-auto pb-16">
      <Ticker items={t("booth.ticker").split("|")} />
      <div className="mx-auto max-w-md px-5">
        {/* The sign; its right side is kept clear for the hanging tag. */}
        <div className="mt-7 mr-24 animate-[booth-pop_0.5s_ease-out]">
          <Bulbs>
            <p className={`${mono} text-center text-[10px] font-bold uppercase tracking-[0.35em] text-[#eaa63c]`}>{t("booth.kicker")}</p>
            <h1 className={`${serif} text-center text-[32px] leading-none text-[#f3e9d6] [text-shadow:0_0_18px_rgba(234,166,60,0.45)]`} style={display}>
              {t("booth.title")}
            </h1>
          </Bulbs>
        </div>
        <p className={`${mono} mt-5 pr-24 text-sm leading-relaxed opacity-80`}>{t("booth.tagline")}</p>

        <Paper notch tilt={-0.8} className="mt-7">
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
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Stub title={t("booth.room")} />
              <Stub title={t("booth.join")} />
            </div>
            <p className={`${mono} mt-1.5 text-center text-[10px] uppercase tracking-[0.2em] opacity-55`}>{t("booth.soon")}</p>
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

        {rolls.length > 0 && (
          <section className="mt-10">
            <p className={`${mono} text-[11px] font-bold uppercase tracking-[0.3em] text-[#eaa63c]`}>{t("booth.recent")}</p>
            <div className="mt-4 flex gap-4 overflow-x-auto px-1 pt-2 pb-4">
              {rolls.map((r, i) => (
                <RollThumb key={r.id} roll={r} tilt={i % 2 ? 2.5 : -2} label={t("booth.openRoll", { date: new Date(r.createdAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-GB") })} onOpen={() => onOpen(r)} />
              ))}
            </div>
          </section>
        )}
        <p className={`${mono} mt-8 text-center text-[10px] uppercase tracking-[0.25em] opacity-45`}>{t("booth.privacy")}</p>
      </div>
      <SwitchTag tone="dark" kicker={t("booth.switchTo")} label="IG Layout" icon={<span className="text-xl leading-none">▦</span>} onSwitch={() => router.push("/")} />
    </div>
  );
}

/** A torn-off ticket stub for what's not open yet. */
function Stub({ title }: { title: string }) {
  return (
    <div aria-disabled className={`${mono} flex min-h-16 items-center justify-center border-2 border-dashed border-[#1d1612]/40 px-2 text-center text-[11px] font-bold uppercase leading-snug tracking-[0.12em] text-[#1d1612]/50`}>
      {title}
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
