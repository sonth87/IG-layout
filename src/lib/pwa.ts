"use client";

import { useEffect, useState } from "react";

// Install prompt + service worker registration (M1).

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((l) => l());
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    listeners.forEach((l) => l());
  });
}

export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && navigator.maxTouchPoints > 1);
}

/** `mode`: "prompt" (browser offers install), "ios" (manual steps), or null (installed / unsupported). */
export function useInstall() {
  const [mode, setMode] = useState<"prompt" | "ios" | null>(null);

  useEffect(() => {
    const update = () => {
      if (isStandalone()) setMode(null);
      else if (deferredPrompt) setMode("prompt");
      else setMode(isIOS() ? "ios" : null);
    };
    update();
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    listeners.forEach((l) => l());
  }

  return { mode, install };
}

/** Files this page has already loaded, so the service worker can cache them for offline use. */
function loadedUrls() {
  const urls = new Set<string>(["/"]);
  for (const entry of performance.getEntriesByType("resource")) urls.add(entry.name);
  document.querySelectorAll<HTMLScriptElement>("script[src]").forEach((s) => urls.add(s.src));
  document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"], link[rel="preload"]').forEach((l) => urls.add(l.href));
  return [...urls].filter((u) => new URL(u, location.href).origin === location.origin);
}

export async function registerServiceWorker() {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
    const registration = await navigator.serviceWorker.ready;
    const channel = new MessageChannel();
    registration.active?.postMessage({ type: "warm", urls: loadedUrls() }, [channel.port2]);
  } catch (err) {
    console.warn("Service worker registration failed", err);
  }
}
