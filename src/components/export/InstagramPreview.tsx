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


/** A grey bar standing for text we don't have (a name, a caption…). */
function Skeleton({ className }: { className: string }) {
  return <span aria-hidden="true" className={`block rounded-full bg-surface-2 ${className}`} />;
}

/**
 * A feed post as Instagram shows it (owner, 2026-10-19), so the result looks familiar:
 * header (avatar, name / subtitle as skeleton bars, ⋯), the picture with "1/N" at the
 * top right and the dots under it, the actions (like, comment, repost, share · save) faded
 * and not tappable, a caption skeleton. Only the swipe is real.
 */
export function CarouselPreview({ urls, aspect }: { urls: string[]; aspect: number }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const many = urls.length > 1;
  const action = "text-text opacity-40";
  return (
    <article aria-label={t("preview.carousel")} className="overflow-hidden rounded-2xl border border-border bg-bg text-text">
      <header className="flex items-center gap-3 px-3 py-2.5">
        <span aria-hidden="true" className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#f2b84b] to-[#d9728a] p-[2px]">
          <span className="block h-full w-full rounded-full border-2 border-bg bg-surface-2" />
        </span>
        <span className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-2.5 w-28" />
          <Skeleton className="h-2 w-44" />
        </span>
        <span aria-hidden="true" className={action}>
          <Icon name="igMore" size={22} />
        </span>
      </header>
      <div className="relative">
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
        {many && (
          <span aria-label={t("preview.count", { index: index + 1, count: urls.length })} className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white tabular-nums">
            {index + 1}/{urls.length}
          </span>
        )}
      </div>
      <div className="relative flex items-center gap-4 px-3 pt-2.5 pb-1" aria-hidden="true">
        <span className={action}><Icon name="igHeart" size={24} /></span>
        <span className={action}><Icon name="igComment" size={24} /></span>
        <span className={action}><Icon name="igRepost" size={24} /></span>
        <span className={action}><Icon name="igSend" size={24} /></span>
        <span className={`ml-auto ${action}`}><Icon name="igSave" size={24} /></span>
        {many && (
          // Dots under the picture, centred like Instagram's.
          <span className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center gap-1">
            {urls.map((u, i) => (
              <span key={u} className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-[#4f8ef7]" : "bg-text/20"}`} />
            ))}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5 px-3 pt-2 pb-3.5" aria-hidden="true">
        <Skeleton className="h-2.5 w-3/4" />
        <Skeleton className="h-2 w-20" />
      </div>
    </article>
  );
}

/**
 * A profile as Instagram shows it (owner, 2026-10-19): name bar, avatar and counts, bio and
 * buttons as skeletons, highlights, the grid / reels / tagged tabs, then the grid of posts
 * (3:4 thumbnails, newest top-left). `newestFirst` = the images in profile order; older posts
 * are grey placeholders. Nothing but the picture is real or tappable.
 */
export function ProfilePreview({ newestFirst }: { newestFirst: string[] }) {
  const t = useT();
  const placeholders = (3 - (newestFirst.length % 3)) % 3 + 3;
  const faded = "text-text opacity-40";
  return (
    <article aria-label={t("preview.profile")} className="overflow-hidden rounded-2xl border border-border bg-bg text-text">
      <div className="flex items-center gap-2 px-3 pt-3" aria-hidden="true">
        <span className={faded}><Icon name="igLock" size={16} /></span>
        <Skeleton className="h-3 w-28" />
        <span className={faded}><Icon name="igDown" size={16} /></span>
        <span className={`ml-auto ${faded}`}><Icon name="igNew" size={22} /></span>
        <span className={faded}><Icon name="igMenu" size={22} /></span>
      </div>
      <div className="flex items-center gap-5 px-3 pt-3" aria-hidden="true">
        <span className="h-[72px] w-[72px] shrink-0 rounded-full bg-gradient-to-br from-[#f2b84b] to-[#d9728a] p-[2px]">
          <span className="block h-full w-full rounded-full border-2 border-bg bg-surface-2" />
        </span>
        <div className="grid flex-1 grid-cols-3 gap-2 text-center">
          {[0, 1, 2].map((i) => (
            <span key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-2 w-12" />
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 px-3 pt-3" aria-hidden="true">
        <Skeleton className="h-2.5 w-32" />
        <Skeleton className="h-2 w-56" />
        <Skeleton className="h-2 w-40" />
      </div>
      <div className="flex gap-1.5 px-3 pt-3" aria-hidden="true">
        <span className="h-8 flex-1 rounded-lg bg-surface-2" />
        <span className="h-8 flex-1 rounded-lg bg-surface-2" />
        <span className="h-8 w-9 rounded-lg bg-surface-2" />
      </div>
      <div className="flex gap-4 px-3 pt-4 pb-2" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex flex-col items-center gap-1.5">
            <span className="h-14 w-14 rounded-full border border-border bg-surface-2" />
            <Skeleton className="h-2 w-10" />
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 border-t border-border" aria-hidden="true">
        {(["igGrid", "igReels", "igTagged"] as const).map((n, i) => (
          <span key={n} className={`flex justify-center py-2.5 ${i === 0 ? "border-b-2 border-text" : "opacity-40"}`}>
            <Icon name={n} size={22} />
          </span>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-[2px]">
        {newestFirst.map((u, i) => (
          <Media key={u} src={u} alt={t("preview.post", { index: i + 1 })} className="aspect-[3/4] w-full object-cover" />
        ))}
        {Array.from({ length: placeholders }, (_, i) => (
          <span key={i} aria-hidden="true" className="aspect-[3/4] w-full bg-surface-2" />
        ))}
      </div>
    </article>
  );
}

/**
 * A story as Instagram shows it (owner, 2026-10-19): progress bars, avatar with name / time
 * skeletons, ⋯ and ✕, the reply pill with like and share at the bottom — faded, not
 * tappable. Tapping the left / right third moves between frames, like the real one.
 */
export function StoryPreview({ urls }: { urls: string[] }) {
  const t = useT();
  const [index, setIndex] = useState(0);
  const go = (d: number) => setIndex((i) => Math.max(0, Math.min(urls.length - 1, i + d)));
  return (
    <article aria-label={t("preview.story")} className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-2xl bg-black text-white">
      <Media src={urls[index]} alt={t("export.slide", { index: index + 1 })} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-2 top-2 flex gap-1" aria-hidden="true">
        {urls.map((u, i) => (
          <span key={u} className={`h-[2.5px] flex-1 rounded-full ${i <= index ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
      <div className="absolute inset-x-3 top-5 flex items-center gap-2" aria-hidden="true">
        <span className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-[#f2b84b] to-[#d9728a] p-[2px]">
          <span className="block h-full w-full rounded-full border-2 border-black bg-white/30" />
        </span>
        <span className="block h-2.5 w-20 rounded-full bg-white/70" />
        <span className="block h-2 w-8 rounded-full bg-white/45" />
        <span className="ml-auto opacity-80"><Icon name="igMore" size={20} /></span>
        <span className="opacity-80"><Icon name="igClose" size={22} /></span>
      </div>
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-3" aria-hidden="true">
        <span className="h-10 flex-1 rounded-full border border-white/70 px-4 text-[13px] leading-10 text-white/80">{t("preview.reply")}</span>
        <span className="opacity-80"><Icon name="igHeart" size={24} /></span>
        <span className="opacity-80"><Icon name="igSend" size={24} /></span>
      </div>
      <button type="button" aria-label={t("preview.previous")} onClick={() => go(-1)} className="absolute inset-y-16 left-0 w-1/3" />
      <button type="button" aria-label={t("preview.next")} onClick={() => go(1)} className="absolute inset-y-16 right-0 w-1/3" />
    </article>
  );
}

export type PreviewTab = "carousel" | "profile" | "story";

export function previewTabs(type: ProjectType): PreviewTab[] {
  if (type === "story") return ["story"];
  if (type === "grid") return ["profile"];
  return ["carousel", "profile"];
}
