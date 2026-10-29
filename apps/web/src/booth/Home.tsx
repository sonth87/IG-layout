"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { listRolls, type BoothRoll } from "@ig-layout/core/storage/booth";
import { SwitchTag } from "@/components/SwitchTag";
import { useSettings, useT } from "@/store/settings";
import { FilmHoles, mono, serif } from "./ui";

// The booth lobby (design §2.1): three ticket cards, upload, recent rolls; the hanging tag
// goes back to IG Layout (D-151).

export function BoothHome({ onSolo, onUpload, onOpen }: { onSolo: () => void; onUpload: (files: File[]) => void; onOpen: (roll: BoothRoll) => void }) {
  const t = useT();
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [rolls, setRolls] = useState<BoothRoll[]>([]);
  useEffect(() => {
    void listRolls().then(setRolls, () => {});
  }, []);

  return (
    <div className="h-full overflow-y-auto pb-16">
      <FilmHoles className="mt-0" />
      <div className="mx-auto max-w-md px-6">
        {/* Right padding: the hanging tag lives there. */}
        <p className={`${mono} mt-12 pr-28 text-xs uppercase tracking-[0.3em] opacity-70`}>{t("booth.kicker")}</p>
        <h1 className={`${serif} mt-1 pr-28 text-4xl font-black`}>{t("booth.title")}</h1>

        <div className="mt-24 flex flex-col gap-3">
          <Ticket title={t("booth.solo")} hint={t("booth.soloHint")} onClick={onSolo} />
          <Ticket title={t("booth.room")} hint={t("booth.soon")} disabled />
          <Ticket title={t("booth.join")} hint={t("booth.soon")} disabled />
        </div>

        <button type="button" className={`${mono} mt-5 text-xs uppercase tracking-[0.15em] underline underline-offset-4 opacity-80`} onClick={() => file.current?.click()}>
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

        {rolls.length > 0 && (
          <section className="mt-10">
            <h2 className={`${mono} text-xs uppercase tracking-[0.3em] opacity-70`}>{t("booth.recent")}</h2>
            <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
              {rolls.map((r) => (
                <RollThumb key={r.id} roll={r} label={t("booth.openRoll", { date: new Date(r.createdAt).toLocaleString(useSettings.getState().locale === "vi" ? "vi-VN" : "en-GB") })} onOpen={() => onOpen(r)} />
              ))}
            </div>
          </section>
        )}
      </div>
      <SwitchTag tone="dark" kicker={t("booth.switchTo")} label="IG Layout" icon={<span className="text-xl leading-none">▦</span>} onSwitch={() => router.push("/")} />
    </div>
  );
}

function Ticket({ title, hint, disabled, onClick }: { title: string; hint: string; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex items-center justify-between rounded-lg border border-dashed border-[#efe6d6]/40 px-5 py-5 text-left enabled:active:scale-[0.98] disabled:opacity-45"
    >
      <span>
        <span className={`${mono} block text-sm font-bold uppercase tracking-[0.2em]`}>{title}</span>
        <span className="mt-1 block text-sm opacity-65">{hint}</span>
      </span>
      <span aria-hidden className={`${serif} text-2xl`}>
        →
      </span>
    </button>
  );
}

function RollThumb({ roll, label, onOpen }: { roll: BoothRoll; label: string; onOpen: () => void }) {
  const url = useMemo(() => (roll.thumbnail.size ? URL.createObjectURL(roll.thumbnail) : null), [roll.thumbnail]);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  return (
    <button type="button" aria-label={label} onClick={onOpen} className="h-36 shrink-0 overflow-hidden rounded bg-[#2a231d]">
      {/* eslint-disable-next-line @next/next/no-img-element -- a local blob URL */}
      {url && <img src={url} alt="" className="h-full w-auto" />}
    </button>
  );
}
