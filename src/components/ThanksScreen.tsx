"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { loadCatalog, useCatalog } from "@/lib/catalog/load";
import { LICENSES } from "@/lib/catalog/licenses";
import { TEXT_FONTS } from "@/lib/text/fonts";
import { useT } from "@/store/settings";

// Thanks (M20 C6, D-110): every library, font, icon set and asset source the app uses,
// with its licence. Pack sources come from the catalog's credits (built from each item's
// licence record), so the list grows with the libraries.

const CODE: [name: string, license: string, url: string][] = [
  ["Next.js", "MIT", "https://nextjs.org"],
  ["React", "MIT", "https://react.dev"],
  ["Konva · react-konva", "MIT", "https://konvajs.org"],
  ["Zustand", "MIT", "https://github.com/pmndrs/zustand"],
  ["idb", "ISC", "https://github.com/jakearchibald/idb"],
  ["fflate", "MIT", "https://github.com/101arrowz/fflate"],
  ["Mediabunny", "MPL-2.0", "https://mediabunny.dev"],
  ["Transformers.js", "Apache-2.0", "https://github.com/huggingface/transformers.js"],
  ["ONNX Runtime Web", "MIT", "https://onnxruntime.ai"],
  ["Tailwind CSS", "MIT", "https://tailwindcss.com"],
];

const ART: [name: string, license: string, url: string][] = [
  ["Lucide icons", "ISC", "https://lucide.dev"],
  ["Fluent Emoji © Microsoft", "MIT", "https://github.com/microsoft/fluentui-emoji"],
  ["ormbg (background removal model)", "Apache-2.0", "https://huggingface.co/schirrmacher/ormbg"],
];

function Row({ name, detail, url }: { name: string; detail: string; url?: string }) {
  return (
    <li className="flex items-baseline justify-between gap-3 py-2">
      {url ? (
        <a href={url} target="_blank" rel="noreferrer" className="min-w-0 font-medium underline decoration-border-2 underline-offset-2">
          {name}
        </a>
      ) : (
        <span className="min-w-0 font-medium">{name}</span>
      )}
      <span className="shrink-0 text-right text-[12px] text-muted">{detail}</span>
    </li>
  );
}

export function ThanksScreen({ onBack }: { onBack: () => void }) {
  const t = useT();
  const catalog = useCatalog((s) => s.catalog);
  useEffect(() => {
    void loadCatalog();
  }, []);
  const credits = catalog?.credits ?? [];
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
                <Row key={i} name={c.author ? `${c.author} · ${c.provider}` : c.provider} url={c.url} detail={`${licenseName(c.license)} · ${t("thanks.items", { count: c.items })}`} />
              ))}
            </ul>
          </section>
        )}
        <section aria-label={t("thanks.fonts")} className="rounded-[14px] bg-surface px-4 py-2">
          <h2 className="pt-2 text-[13px] font-semibold tracking-wider text-muted uppercase">{t("thanks.fonts")}</h2>
          <ul className="divide-y divide-border">
            <Row name={`Google Fonts — ${Object.keys(TEXT_FONTS).length + (catalog?.fonts.length ?? 0)} ${t("thanks.fontsCount")}`} url="https://fonts.google.com" detail="OFL 1.1 · Apache 2.0" />
          </ul>
        </section>
        <section aria-label={t("thanks.art")} className="rounded-[14px] bg-surface px-4 py-2">
          <h2 className="pt-2 text-[13px] font-semibold tracking-wider text-muted uppercase">{t("thanks.art")}</h2>
          <ul className="divide-y divide-border">
            {ART.map(([n, l, u]) => (
              <Row key={n} name={n} url={u} detail={l} />
            ))}
          </ul>
        </section>
        <section aria-label={t("thanks.code")} className="rounded-[14px] bg-surface px-4 py-2">
          <h2 className="pt-2 text-[13px] font-semibold tracking-wider text-muted uppercase">{t("thanks.code")}</h2>
          <ul className="divide-y divide-border">
            {CODE.map(([n, l, u]) => (
              <Row key={n} name={n} url={u} detail={l} />
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
