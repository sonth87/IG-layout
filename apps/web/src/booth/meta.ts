import type { Metadata } from "next";
import { isRoomCode } from "@ig-layout/core/booth/protocol";

export const BOOTH_DEFAULT_TITLE = "Photobooth — IG Layout";
export const BOOTH_DEFAULT_DESCRIPTION =
  "A photobooth in your browser: pick a frame, strike a pose, save the strip.";

export function parseRoomParam(raw: string | string[] | undefined | null): string | null {
  const val = (Array.isArray(raw) ? raw[0] : raw)?.trim().toUpperCase();
  return val && isRoomCode(val) ? val : null;
}

export function boothRoomMetaText(
  code: string | null,
  opts?: { title?: string; description?: string },
) {
  if (!code || !isRoomCode(code)) {
    return {
      title: opts?.title ?? BOOTH_DEFAULT_TITLE,
      description: opts?.description ?? BOOTH_DEFAULT_DESCRIPTION,
    };
  }
  const c = code.toUpperCase();
  return {
    title: opts?.title ?? `Phòng ${c} · Photobooth — IG Layout`,
    description:
      opts?.description ??
      `Mã phòng: ${c} — Vào chụp photobooth chung trên IG Layout (Room code: ${c}).`,
  };
}

export function buildBoothMetadata(
  rawCode: string | string[] | undefined | null,
  opts?: { defaultTitle?: string; defaultDescription?: string; robots?: Metadata["robots"] },
): Metadata {
  const code = parseRoomParam(rawCode);
  const { title, description } = code
    ? boothRoomMetaText(code)
    : {
        title: opts?.defaultTitle ?? BOOTH_DEFAULT_TITLE,
        description: opts?.defaultDescription ?? BOOTH_DEFAULT_DESCRIPTION,
      };
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    ...(opts?.robots ? { robots: opts.robots } : {}),
  };
}

export function syncBoothDocumentMeta(
  code: string | null,
  opts?: { title?: string; description?: string },
) {
  if (typeof document === "undefined") return;
  const { title, description } = boothRoomMetaText(code, opts);
  document.title = title;
  setMetaTag("name", "description", description);
  setMetaTag("property", "og:title", title);
  setMetaTag("property", "og:description", description);
  setMetaTag("name", "twitter:card", "summary");
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);
}

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}
