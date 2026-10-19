"use client";

import { SheetHeader } from "@/components/ui/SheetHeader";
import { useRef } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useT } from "@/store/settings";

// "Fill frame" sheet (editor-v2/09 §1.1): Photos / Video / Files. Several can be picked;
// they go into the empty frames in order (the caller keeps at most `max`).

export function FillFrameSheet({ max, replace, onFiles, onClose }: { max: number; replace: boolean; onFiles: (files: File[]) => void; onClose: () => void }) {
  const t = useT();
  const inputs = {
    photos: useRef<HTMLInputElement>(null),
    video: useRef<HTMLInputElement>(null),
    files: useRef<HTMLInputElement>(null),
  };
  const options: { key: keyof typeof inputs; label: string; icon: IconName; accept: string }[] = [
    { key: "photos", label: t("fill.photos"), icon: "image", accept: "image/*" },
    { key: "video", label: t("fill.video"), icon: "video", accept: "video/*" },
    // No type filter: on iOS / Android this offers the Files app / the system file picker.
    { key: "files", label: t("fill.files"), icon: "folder", accept: "" },
  ];
  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-end bg-black/40 [&>section]:mx-auto [&>section]:w-full [&>section]:max-w-2xl" onClick={onClose}>
      <section
        aria-label={t("fill.title")}
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-[22px] bg-surface px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <SheetHeader title={t("fill.title")} right={{ icon: "close", label: t("common.close"), onClick: onClose }} />
        <p className="pb-4 text-center text-xs text-muted">{replace ? t("fill.replaceHint") : t("fill.hint", { count: max })}</p>
        <div className="flex justify-center gap-8">
          {options.map((o) => (
            <div key={o.key}>
              <button type="button" onClick={() => inputs[o.key].current?.click()} className="flex flex-col items-center gap-2 text-xs">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
                  <Icon name={o.icon} size={26} />
                </span>
                {o.label}
              </button>
              <input
                ref={inputs[o.key]}
                type="file"
                accept={o.accept || undefined}
                multiple={!replace}
                hidden
                aria-label={o.label}
                onChange={(e) => {
                  // Copy before clearing the input: clearing empties its FileList.
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (files.length) onFiles(files);
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
