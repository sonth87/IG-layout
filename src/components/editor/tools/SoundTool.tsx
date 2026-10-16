"use client";

import type { ImageElement, MediaSettings } from "@/lib/project/types";
import { defaultMedia } from "@/lib/video/playback";
import { updateEl, useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { Slider, ToolSheet } from "./controls";

/** Sound of a video element (M13.1): on / off and volume. Draft tool (✕ / ✓). */
export function SoundTool({ elementId, onClose }: { elementId: string; onClose: () => void }) {
  const t = useT();
  const el = useViewDoc()?.elements.find((e) => e.id === elementId) as ImageElement | undefined;
  const asset = useEditor((s) => (el?.assetId ? s.assets[el.assetId] : undefined));
  const { updateDraft, applyDraft, cancelDraft } = useEditor.getState();
  if (!el || !asset?.video) return null;
  const media = el.media ?? defaultMedia(asset.video.duration);
  const patch = (p: Partial<MediaSettings>) => updateDraft((d) => updateEl(d, elementId, { media: { ...media, ...p } }));

  return (
    <ToolSheet
      title={t("video.sound")}
      onApply={() => {
        applyDraft();
        onClose();
      }}
      onCancel={() => {
        cancelDraft();
        onClose();
      }}
    >
      {!asset.video.hasAudio ? (
        <p className="py-2 text-sm text-muted">{t("video.noAudio")}</p>
      ) : (
        <>
          <label className="flex items-center justify-between py-2 text-sm">
            <span>{t("video.soundOn")}</span>
            <input type="checkbox" checked={!media.muted} onChange={(e) => patch({ muted: !e.target.checked })} className="h-[22px] w-[22px] accent-accent" />
          </label>
          <Slider
            label={t("video.volume")}
            value={Math.round(media.volume * 100)}
            min={0}
            max={100}
            defaultValue={100}
            format={(v) => `${v}%`}
            onChange={(v) => patch({ volume: v / 100 })}
          />
        </>
      )}
    </ToolSheet>
  );
}
