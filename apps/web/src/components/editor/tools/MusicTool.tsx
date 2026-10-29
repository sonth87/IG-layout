"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Music } from "@ig-layout/core/project/types";
import { defaultMusic, importMusic, isAudioFile } from "@ig-layout/core/video/music";
import { pause } from "@ig-layout/core/video/playback";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { Slider, ToolSheet } from "./controls";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Background music (M13.4): pick a track (converted on the device), where it starts
 * (with a 5 s preview), volume, fade in / out, remove. ✓ = one undo step.
 * Plays with the project and goes into exported videos.
 */
export function MusicTool({ onClose }: { onClose: () => void }) {
  const t = useT();
  const doc = useViewDoc();
  const assets = useEditor((s) => s.assets);
  const setMusic = useEditor((s) => s.setMusic);
  const [music, setLocal] = useState<Music | null>(doc?.music ?? null);
  const [newAsset, setNewAsset] = useState<ReturnType<typeof useEditor.getState>["assets"][string] | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const preview = useRef<HTMLAudioElement>(null);
  const asset = music ? (newAsset?.id === music.assetId ? newAsset : assets[music.assetId]) : undefined;
  const trackLength = asset?.audio?.duration ?? 0;
  const set = (p: Partial<Music>) => setLocal((m) => (m ? { ...m, ...p } : m));

  async function pick(file: File) {
    if (!isAudioFile(file)) return setError(t("music.notAudio"));
    setError(null);
    setBusy(0);
    try {
      const a = await importMusic(file, setBusy);
      setNewAsset(a);
      setLocal({ ...defaultMusic(a.id), volume: music?.volume ?? 0.8 });
    } catch {
      setError(t("music.failed", { name: file.name }));
    } finally {
      setBusy(null);
    }
  }

  function listen() {
    const a = preview.current;
    if (!a || !music) return;
    if (!a.paused) return a.pause();
    pause();
    a.currentTime = music.start;
    a.volume = music.volume;
    void a.play();
    setTimeout(() => a.pause(), 5000);
  }

  return (
    <ToolSheet
      title={t("music.title")}
      onApply={() => {
        preview.current?.pause();
        setMusic(music, newAsset && music?.assetId === newAsset.id ? newAsset : undefined);
        onClose();
      }}
      onCancel={() => {
        preview.current?.pause();
        onClose();
      }}
    >
      <input
        ref={input}
        type="file"
        accept="audio/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void pick(f);
        }}
      />
      {asset && <audio ref={preview} src={asset.url} preload="auto" />}
      <div className="flex items-center gap-2 py-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold">{asset ? asset.name : t("music.none")}</span>
          {asset && <span className="text-xs text-muted">{fmt(trackLength)}</span>}
        </div>
        <button type="button" onClick={() => input.current?.click()} disabled={busy !== null} className="h-10 rounded-xl border border-border-2 px-3 text-sm font-semibold">
          {busy !== null ? t("music.converting", { pct: Math.round(busy * 100) }) : asset ? t("music.change") : t("music.choose")}
        </button>
        {asset && (
          <button type="button" aria-label={t("music.remove")} onClick={() => setLocal(null)} className="flex h-10 w-10 items-center justify-center text-danger">
            <Icon name="trash" size={19} />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {music && asset && (
        <>
          <div className="flex items-center gap-2">
            <Slider
              label={t("music.start")}
              value={music.start}
              min={0}
              max={Math.max(0, trackLength - 1)}
              step={0.5}
              defaultValue={0}
              format={fmt}
              onChange={(v) => set({ start: v })}
            />
            <button type="button" aria-label={t("music.listen")} onClick={listen} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-text text-bg">
              <Icon name="play" size={14} />
            </button>
          </div>
          <Slider label={t("video.volume")} value={Math.round(music.volume * 100)} min={0} max={100} defaultValue={80} format={(v) => `${v}%`} onChange={(v) => set({ volume: v / 100 })} />
          <label className="flex items-center justify-between py-1.5 text-sm">
            <span>{t("music.fadeIn")}</span>
            <input type="checkbox" checked={music.fadeIn} onChange={(e) => set({ fadeIn: e.target.checked })} className="h-[22px] w-[22px] accent-accent" />
          </label>
          <label className="flex items-center justify-between py-1.5 text-sm">
            <span>{t("music.fadeOut")}</span>
            <input type="checkbox" checked={music.fadeOut} onChange={(e) => set({ fadeOut: e.target.checked })} className="h-[22px] w-[22px] accent-accent" />
          </label>
          <p className="text-xs text-muted">{t("music.hint")}</p>
        </>
      )}
    </ToolSheet>
  );
}
