"use client";

import { Icon } from "@/components/ui/Icon";
import { seek, togglePlay, usePlayback } from "@/lib/video/playback";
import { useT } from "@/store/settings";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Play / pause and timeline for projects with video (M13.1). */
export function PlaybackBar() {
  const t = useT();
  const playing = usePlayback((s) => s.playing);
  const time = usePlayback((s) => s.time);
  const duration = usePlayback((s) => s.duration);
  if (duration <= 0) return null;
  return (
    <div className="flex items-center gap-2.5 border-t border-border bg-bg px-3 py-1.5">
      <button
        type="button"
        aria-label={playing ? t("video.pause") : t("video.play")}
        onClick={togglePlay}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-text text-bg"
      >
        <Icon name={playing ? "pause" : "play"} size={18} />
      </button>
      <span className="w-10 text-right text-xs tabular-nums">{fmt(time)}</span>
      <input
        type="range"
        aria-label={t("video.timeline")}
        min={0}
        max={duration}
        step={0.01}
        value={Math.min(time, duration)}
        onChange={(e) => seek(Number(e.target.value))}
        className="h-7 flex-1 accent-accent"
      />
      <span className="w-10 text-xs text-muted tabular-nums">{fmt(duration)}</span>
    </div>
  );
}
