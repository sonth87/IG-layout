"use client";

import { useState } from "react";
import { frameById } from "@ig-layout/core/booth/frames";
import { frameBlob } from "@ig-layout/core/booth/render";
import { deleteRoll, type BoothRoll } from "@ig-layout/core/storage/booth";
import { useT } from "@/store/settings";
import { canvasFonts } from "./fonts";
import { FrameCanvas } from "./FrameCanvas";
import { useShotImages } from "./images";
import { Btn, Confirm, FilmHoles, mono } from "./ui";

// The print (design §2.6): it slides out of the printer's slot (tap to skip), one main
// button to save, flip (D-153), tap a photo to retake it, take the missing ones, new roll.

export function Result({ roll, onChange, onRetake, onAgain, onHome }: {
  roll: BoothRoll;
  onChange: (roll: BoothRoll) => void;
  onRetake: (shots: number[]) => void;
  onAgain: () => void;
  onHome: () => void;
}) {
  const t = useT();
  const frame = frameById(roll.frameId);
  const images = useShotImages(roll.shots);
  const [printed, setPrinted] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const missing = Array.from({ length: frame.shots }, (_, i) => i).filter((i) => !roll.shots[i]);
  const date = new Date(roll.createdAt);

  async function save() {
    if (!images) return;
    setSaving(true);
    try {
      const blob = await frameBlob(frame, images, { flip: roll.flip, date, fonts: canvasFonts });
      const pad = (n: number) => String(n).padStart(2, "0");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `booth_${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}.jpg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* The printer: a slot, the print comes out under it. */}
      <div className="relative min-h-0 flex-1 px-6 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="relative z-10 mx-auto h-4 max-w-sm rounded-full bg-[#0a0806] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)]" />
        <div className="mx-auto -mt-2 flex h-[calc(100%-0.5rem)] max-w-sm justify-center overflow-hidden" onClick={() => setPrinted(true)}>
          {images && (
            <div className={printed ? "" : "animate-[booth-print_1.8s_cubic-bezier(.3,.7,.3,1)_both]"} onAnimationEnd={() => setPrinted(true)}>
              <FrameCanvas
                frame={frame}
                images={images}
                scale={Math.min(1, 1200 / Math.max(frame.width, frame.height))}
                flip={roll.flip}
                date={date}
                numbers
                className="mt-2 max-h-[calc(100%-1rem)] max-w-full shadow-[0_12px_30px_rgba(0,0,0,0.6)]"
                onCell={printed ? (shot) => setSelected((s) => (s === shot ? null : shot)) : undefined}
              />
            </div>
          )}
        </div>
      </div>

      <FilmHoles className="mt-2 opacity-60" />
      <div className="shrink-0 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <p className={`${mono} text-center text-[11px] uppercase tracking-[0.2em] opacity-60`} aria-live="polite">
          {!printed ? t("booth.printing") : missing.length ? t("booth.missing", { count: missing.length }) : selected !== null ? "" : t("booth.tapCell")}
        </p>
        <div className="mx-auto mt-3 flex max-w-sm flex-col gap-2">
          {selected !== null && (
            <Btn onClick={() => onRetake([selected])}>↺ {t("booth.retakeShot", { n: selected + 1 })}</Btn>
          )}
          {missing.length > 0 ? (
            <Btn tone="main" className="py-4 text-sm" onClick={() => onRetake(missing)}>
              {t("booth.fill")}
            </Btn>
          ) : (
            <Btn tone="main" className="py-4 text-sm" disabled={!images || saving} onClick={save}>
              ↓ {t("booth.save")}
            </Btn>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Btn aria-pressed={roll.flip} className={roll.flip ? "bg-[#efe6d6]/15" : ""} onClick={() => onChange({ ...roll, flip: !roll.flip })}>
              ⇋ {t("booth.flip")}
            </Btn>
            <Btn onClick={onAgain}>{t("booth.again")}</Btn>
            <Btn onClick={onHome}>{t("booth.home")}</Btn>
            <Btn tone="danger" onClick={() => setDeleting(true)}>
              {t("booth.deleteRoll")}
            </Btn>
          </div>
          <p className="text-center text-[11px] opacity-45">{t("booth.saved")}</p>
        </div>
      </div>

      {deleting && (
        <Confirm
          title={t("booth.deleteConfirm")}
          yes={t("common.delete")}
          no={t("common.cancel")}
          danger
          onNo={() => setDeleting(false)}
          onYes={() => {
            void deleteRoll(roll.id).finally(onHome);
          }}
        />
      )}
    </div>
  );
}
