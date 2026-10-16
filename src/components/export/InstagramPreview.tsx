"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { ProjectType } from "@/lib/project/types";

/** Exported files that are videos (M13): previews play them instead of showing an image. */
export const videoUrls = new Set<string>();

function Media(props: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  if (videoUrls.has(props.src))
    return <video src={props.src} aria-label={props.alt} className={props.className} style={props.style} autoPlay muted loop playsInline />;
  // eslint-disable-next-line @next/next/no-img-element -- local blob preview
  return <img src={props.src} alt={props.alt} className={props.className} style={props.style} />;
}
import { useT } from "@/store/settings";

// Approximate Instagram views of the exported images (wireframe 10, M7):
// how the carousel swipes, how the profile grid crops thumbnails (3:4), how a
// story frame looks with Instagram's UI on top. Not pixel-exact copies of the app.

function Avatar() {
  return <span aria-hidden="true" className="h-7 w-7 rounded-full bg-gradient-to-br from-[#f2b84b] to-[#d9728a] p-[2px]"><span className="block h-full w-full rounded-full border-2 border-black bg-[#3a3c42]" /></span>;
}

export function CarouselPreview({ urls, aspect }: { urls: string[]; aspect: number }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-black text-white">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <Avatar />
        <span className="text-[13px] font-semibold">{t("preview.account")}</span>
        <span className="ml-auto rounded-full bg-black/60 px-2 py-0.5 text-xs">
          {index + 1} / {urls.length}
        </span>
      </div>
      <div
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {urls.map((u, i) => (
          <Media key={u} src={u} alt={t("export.slide", { index: i + 1 })} className="w-full shrink-0 snap-center object-cover" style={{ aspectRatio: aspect }} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-1.5 py-2.5" aria-hidden="true">
        {urls.map((u, i) => (
          <span key={u} className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-[#4f8ef7]" : "bg-white/35"}`} />
        ))}
      </div>
    </div>
  );
}

/**
 * Profile grid: newest post top-left. `newestFirst` = images in the order they
 * appear on the profile; older posts are shown as grey placeholders.
 */
export function ProfilePreview({ newestFirst }: { newestFirst: string[] }) {
  const t = useT();
  const placeholders = (3 - (newestFirst.length % 3)) % 3 + 3;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-black text-white">
      <div className="flex items-center gap-3 px-3 py-3">
        <span aria-hidden="true" className="h-14 w-14 rounded-full bg-gradient-to-br from-[#f2b84b] to-[#d9728a] p-[2px]">
          <span className="block h-full w-full rounded-full border-2 border-black bg-[#3a3c42]" />
        </span>
        <div>
          <div className="text-sm font-semibold">{t("preview.account")}</div>
          <div className="text-xs text-white/60">{t("preview.profileHint")}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-[2px]">
        {newestFirst.map((u, i) => (
          <Media key={u} src={u} alt={t("preview.post", { index: i + 1 })} className="aspect-[3/4] w-full object-cover" />
        ))}
        {Array.from({ length: placeholders }, (_, i) => (
          <span key={i} aria-hidden="true" className="aspect-[3/4] w-full bg-[#26282d]" />
        ))}
      </div>
    </div>
  );
}

export function StoryPreview({ urls }: { urls: string[] }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const go = (d: number) => setIndex((i) => Math.max(0, Math.min(urls.length - 1, i + d)));
  return (
    <div className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-2xl bg-black text-white">
      <Media src={urls[index]} alt={t("export.slide", { index: index + 1 })} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-x-2 top-2 flex gap-1" aria-hidden="true">
        {urls.map((u, i) => (
          <span key={u} className={`h-[3px] flex-1 rounded-full ${i <= index ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
      <div className="absolute top-5 left-3 flex items-center gap-2 text-[13px] font-semibold drop-shadow">
        <Avatar />
        {t("preview.account")}
      </div>
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-2" aria-hidden="true">
        <span className="h-9 flex-1 rounded-full border border-white/70 px-3 text-xs leading-9 text-white/80">{t("preview.reply")}</span>
        <Icon name="heart" />
        <Icon name="share" />
      </div>
      <button type="button" aria-label={t("preview.previous")} onClick={() => go(-1)} className="absolute inset-y-0 left-0 w-1/3" />
      <button type="button" aria-label={t("preview.next")} onClick={() => go(1)} className="absolute inset-y-0 right-0 w-1/3" />
    </div>
  );
}

export type PreviewTab = "carousel" | "profile" | "story";

export function previewTabs(type: ProjectType): PreviewTab[] {
  if (type === "story") return ["story"];
  if (type === "grid") return ["profile"];
  return ["carousel", "profile"];
}
