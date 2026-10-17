"use client";

import { Icon } from "@/components/ui/Icon";
import { useT } from "@/store/settings";

// About (M20 C6b, D-110): who makes the app. The avatar is a copy of the GitHub one,
// kept in the app so the screen works offline.

const GITHUB = "https://github.com/sonth87";

export function AboutScreen({ version, onBack, onThanks }: { version: string; onBack: () => void; onThanks: () => void }) {
  const t = useT();
  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col md:max-w-xl">
      <header className="flex items-center gap-1 px-2 pt-2.5 pb-1">
        <button type="button" aria-label={t("common.back")} onClick={onBack} className="flex h-11 w-11 items-center justify-center">
          <Icon name="back" />
        </button>
        <h1 className="font-display text-[22px] font-semibold">{t("about.title")}</h1>
      </header>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pt-4 pb-8 text-[14px]">
        <section aria-label={t("about.maker")} className="flex flex-col items-center gap-3 rounded-[14px] bg-surface px-4 py-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- a small static picture */}
          <img src="/about/avatar.webp" alt="" width={96} height={96} className="h-24 w-24 rounded-full object-cover shadow-sm" />
          <div>
            <p className="text-[19px] font-bold">sonth87</p>
            <p className="text-[13px] text-muted">{t("about.role")}</p>
          </div>
          <a href={GITHUB} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-2 rounded-full border border-border px-4 text-[13px] font-semibold">
            <Icon name="link" size={16} />
            github.com/sonth87
          </a>
        </section>
        <section aria-label={t("about.app")} className="rounded-[14px] bg-surface p-4">
          <h2 className="pb-1.5 text-[15px] font-bold">IG Layout</h2>
          <p className="leading-relaxed text-text-2">{t("about.body")}</p>
          <p className="pt-2 text-[12px] text-muted">{t("settings.version", { version })}</p>
        </section>
        <button type="button" onClick={onThanks} className="flex items-center justify-between rounded-[14px] bg-surface px-4 py-3.5 text-left">
          <span className="font-medium">{t("thanks.title")}</span>
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </main>
  );
}
