"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { formatBytes } from "@ig-layout/core/format";
import { AboutScreen } from "./AboutScreen";
import { ThanksScreen } from "./ThanksScreen";
import { checkStorage } from "@ig-layout/core/storage/check";
import { deleteAllProjects, listProjects, storageEstimate } from "@ig-layout/core/storage/projects";
import { type Locale, type ThemeSetting, useSettings, useT } from "@/store/settings";

const VERSION = "0.1.0";

const THEME_PREVIEW: Record<ThemeSetting, string> = {
  system: "bg-[linear-gradient(90deg,#f6f5f2_50%,#111214_50%)]",
  light: "bg-[#f6f5f2]",
  dark: "bg-[#111214]",
};

export function SettingsScreen({ onBack, onHelp }: { onBack?: () => void; onHelp?: () => void }) {
  const t = useT();
  const { theme, locale, setTheme, setLocale } = useSettings();
  const [info, setInfo] = useState({ count: 0, usage: 0, persisted: false });

  const [reloadKey, setReloadKey] = useState(0);
  const [thanks, setThanks] = useState(false);
  /** Storage check (2026-10-19): a step-by-step report to send when projects can't be created. */
  const [report, setReport] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const runCheck = async () => {
    setChecking(true);
    setReport(await checkStorage());
    setChecking(false);
  };
  const [about, setAbout] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([listProjects(), storageEstimate()]).then(([list, estimate]) => {
      if (alive) setInfo({ count: list.length, usage: estimate.usage, persisted: estimate.persisted });
    });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const [confirming, setConfirming] = useState(false);

  async function onDeleteAll() {
    setConfirming(false);
    await deleteAllProjects();
    setReloadKey((k) => k + 1);
  }

  const themes: ThemeSetting[] = ["system", "light", "dark"];
  const locales: { value: Locale; label: string }[] = [
    { value: "en", label: "English" },
    { value: "vi", label: "Tiếng Việt" },
  ];

  if (thanks) return <ThanksScreen onBack={() => setThanks(false)} />;
  if (about) return <AboutScreen version={VERSION} onBack={() => setAbout(false)} onThanks={() => setThanks(true)} />;

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col md:max-w-xl">
      {confirming && (
        <ConfirmDialog
          title={t("settings.deleteAllConfirm")}
          confirmLabel={t("common.delete")}
          danger
          onCancel={() => setConfirming(false)}
          onConfirm={onDeleteAll}
        />
      )}
      <header className="flex items-center gap-1 px-2 pt-2.5 pb-1">
        {onBack ? (
          <button type="button" aria-label={t("common.back")} onClick={onBack} className="flex h-11 w-11 items-center justify-center">
            <Icon name="back" />
          </button>
        ) : (
          <span className="w-3" />
        )}
        <h1 className="font-display text-[22px] font-semibold">{t("settings.title")}</h1>
        {onHelp && (
          <button type="button" aria-label={t("help.title")} onClick={onHelp} className="ml-auto mr-2 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface">
            <Icon name="help" />
          </button>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pt-2 pb-32">
        <section className="flex flex-col gap-2.5">
          <h2 className="text-[13px] font-semibold tracking-wider text-muted uppercase">{t("settings.appearance")}</h2>
          <div role="radiogroup" aria-label={t("settings.theme")} className="grid grid-cols-3 gap-2.5">
            {themes.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={theme === value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-2 rounded-[14px] px-2 py-2.5 text-[13px] ${
                  theme === value ? "border-2 border-accent bg-accent-soft font-bold" : "border border-border bg-surface"
                }`}
              >
                <span className={`h-16 w-[54px] rounded-lg border border-border-2 ${THEME_PREVIEW[value]}`} />
                {t(`settings.${value}`)}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-[13px] font-semibold tracking-wider text-muted uppercase">{t("settings.language")}</h2>
          <div role="radiogroup" aria-label={t("settings.language")} className="flex rounded-xl bg-surface p-1">
            {locales.map((l) => (
              <button
                key={l.value}
                type="button"
                role="radio"
                aria-checked={locale === l.value}
                lang={l.value}
                onClick={() => setLocale(l.value)}
                className={`h-10 flex-1 rounded-[9px] text-sm ${locale === l.value ? "bg-text font-bold text-bg" : ""}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2.5">
          <h2 className="text-[13px] font-semibold tracking-wider text-muted uppercase">{t("settings.storage")}</h2>
          <div className="flex flex-col gap-2.5 rounded-[14px] bg-surface p-3.5">
            <div className="flex justify-between text-sm">
              <span>{t("settings.projectCount", { count: info.count })}</span>
              <span className="font-bold">{formatBytes(info.usage)}</span>
            </div>
            <p className={`flex items-start gap-2 text-[13px] ${info.persisted ? "text-muted" : "text-text-2"}`}>
              {info.persisted && <Icon name="check" size={16} />}
              {info.persisted ? t("settings.persisted") : t("settings.notPersisted")}
            </p>
            <p className="text-[13px] leading-relaxed text-muted">{t("settings.localOnly")}</p>
          </div>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={info.count === 0}
            className="h-12 rounded-[14px] border border-border text-sm font-semibold text-danger disabled:opacity-50"
          >
            {t("settings.deleteAll")}
          </button>
          <button type="button" onClick={runCheck} disabled={checking} className="h-12 rounded-[14px] border border-border text-sm font-semibold disabled:opacity-50">
            {checking ? t("settings.checking") : t("settings.check")}
          </button>
          {report && (
            <div role="region" aria-label={t("settings.checkResult")} className="flex flex-col gap-2 rounded-[14px] bg-surface p-3.5">
              <pre className="max-h-60 overflow-y-auto text-[11px] leading-relaxed whitespace-pre-wrap text-text-2">{report}</pre>
              <button type="button" onClick={() => void navigator.clipboard?.writeText(report)} className="h-10 rounded-full bg-surface-2 text-[13px] font-semibold">
                {t("settings.copy")}
              </button>
            </div>
          )}
        </section>

        <button type="button" onClick={() => setThanks(true)} className="flex items-center justify-between rounded-[14px] bg-surface px-3.5 py-3.5 text-left text-sm">
          <span>
            <span className="block font-medium">{t("thanks.title")}</span>
            <span className="block text-[12px] text-muted">{t("thanks.hint")}</span>
          </span>
          <Icon name="chevronRight" size={18} />
        </button>

        <button type="button" onClick={() => setAbout(true)} className="flex items-center justify-between rounded-[14px] bg-surface px-3.5 py-3.5 text-left text-sm">
          <span>{t("settings.about")}</span>
          <span className="flex items-center gap-1 text-[13px] text-muted">
            IG Layout · {t("settings.version", { version: VERSION })}
            <Icon name="chevronRight" size={18} />
          </span>
        </button>
      </div>
    </main>
  );
}
