"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { loadCatalog, useCatalog } from "@/lib/catalog/load";
import { LICENSES } from "@/lib/catalog/licenses";
import { useT } from "@/store/settings";

// Thanks (M20 C6, D-110): only the sources whose licence asks for credit to be shown to
// people (CC BY, BY-SA, BY-NC…, authors' own terms) — owner, 2026-10-19. Licences that only
// ask for their text to come with the app (MIT, ISC, Apache, MPL, OFL) are in
// /licenses.txt (scripts/build-licenses.mjs), linked at the bottom.

/** Credit must be shown: Creative Commons "BY" licences and authors' own terms. */
const mustCredit = (license: string) => /^CC-BY/.test(license) || license === "custom";

export function ThanksScreen({ onBack }: { onBack: () => void }) {
  const t = useT();
  const catalog = useCatalog((s) => s.catalog);
  useEffect(() => {
    void loadCatalog();
  }, []);
  const credits = (catalog?.credits ?? []).filter((c) => mustCredit(c.license));
  const licenseName = (id: string) => (LICENSES as Record<string, { name: string }>)[id]?.name ?? id;

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col md:max-w-xl">
      <header className="flex items-center gap-1 px-2 pt-2.5 pb-1">
        <button type="button" aria-label={t("common.back")} onClick={onBack} className="flex h-11 w-11 items-center justify-center">
          <Icon name="back" />
        </button>
        <h1 className="font-display text-[22px] font-semibold">{t("thanks.title")}</h1>
      </header>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pt-2 pb-8 text-[14px]">
        <p className="text-text-2">{t("thanks.intro")}</p>
        {credits.length > 0 && (
          <section aria-label={t("thanks.assets")} className="rounded-[14px] bg-surface px-4 py-2">
            <h2 className="pt-2 text-[13px] font-semibold tracking-wider text-muted uppercase">{t("thanks.assets")}</h2>
            <ul className="divide-y divide-border">
              {credits.map((c, i) => (
                <li key={i} className="flex items-baseline justify-between gap-3 py-2">
                  <a href={c.url} target="_blank" rel="noreferrer" className="min-w-0 font-medium underline decoration-border-2 underline-offset-2">
                    {c.author ? `${c.author} · ${c.provider}` : c.provider}
                  </a>
                  <a href={c.licenseUrl ?? (LICENSES as Record<string, { url: string }>)[c.license]?.url} target="_blank" rel="noreferrer" className="shrink-0 text-right text-[12px] text-muted">
                    {licenseName(c.license)}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
        <a href="/licenses.txt" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[14px] bg-surface px-4 py-3 text-[13px] text-text-2">
          {t("thanks.openSource")}
          <Icon name="link" size={16} />
        </a>
      </div>
    </main>
  );
}
