"use client";

import { Icon } from "@/components/ui/Icon";
import type { MessageKey } from "@ig-layout/core/i18n/en";
import { useT } from "@/store/settings";

const SECTIONS = ["start", "layouts", "editing", "post", "story", "grid", "data", "keys"] as const;

/** Short in-app guide (M7). Full guide: docs/user/guide.md. */
export function HelpScreen({ onBack }: { onBack: () => void }) {
  const t = useT();
  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col md:max-w-xl">
      <header className="flex items-center gap-1 px-2 pt-2.5 pb-1">
        <button type="button" aria-label={t("common.back")} onClick={onBack} className="flex h-11 w-11 items-center justify-center">
          <Icon name="back" />
        </button>
        <h1 className="font-display text-[22px] font-semibold">{t("help.title")}</h1>
      </header>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-8">
        {SECTIONS.map((k) => (
          <section key={k} className="rounded-[14px] bg-surface p-4">
            <h2 className="pb-1.5 text-[15px] font-bold">{t(`help.${k}.title` as MessageKey)}</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line text-text-2">{t(`help.${k}.body` as MessageKey)}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
