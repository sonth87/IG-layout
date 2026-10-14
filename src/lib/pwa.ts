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

export function registerServiceWorker() {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch((err) => console.warn("Service worker registration failed", err));
}
