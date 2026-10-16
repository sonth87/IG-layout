"use client";

import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { formatBytes } from "@/lib/format";
import { modelReady, removeBackground, type RemoveBgProgress } from "@/lib/image/removeBg";
import { useEditor } from "@/store/editor";
import { useT } from "@/store/settings";

/**
 * Remove background (M12, S11): first time, explain the one-off model download; then
 * show progress (download → processing) and swap the photo for the cut-out (one undo step).
 */
export function RemoveBgDialog({ elementId, onClose }: { elementId: string; onClose: () => void }) {
  const t = useT();
  const [confirmed, setConfirmed] = useState(() => modelReady());
  const [progress, setProgress] = useState<RemoveBgProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!confirmed || started.current) return;
    started.current = true;
    const { doc, assets, swapAsset } = useEditor.getState();
    const el = doc?.elements.find((e) => e.id === elementId);
    const asset = el?.type === "image" && el.assetId ? assets[el.assetId] : undefined;
    if (!asset) return onClose();
    removeBackground(asset, setProgress)
      .then((cut) => {
        swapAsset(elementId, cut);
        onClose();
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)));
  }, [confirmed, elementId, onClose]);

  if (!confirmed)
    return (
      <ConfirmDialog
        title={t("removeBg.title")}
        body={t("removeBg.firstTime")}
        confirmLabel={t("removeBg.start")}
        onConfirm={() => setConfirmed(true)}
        onCancel={onClose}
      />
    );

  const pct = progress?.phase === "download" && progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : null;
  const label = error
    ? t("removeBg.failed")
    : progress?.phase === "download"
      ? t("removeBg.downloading", { done: formatBytes(progress.loaded), total: formatBytes(progress.total) })
      : progress?.phase === "running"
        ? t("removeBg.running")
        : t("removeBg.preparing");

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-6">
      <div role="alertdialog" aria-modal="true" aria-label={t("removeBg.title")} aria-busy={!error} className="flex w-full max-w-sm flex-col gap-3.5 rounded-[22px] border border-border bg-surface p-5">
        <h2 className="font-display text-xl leading-tight font-bold">{t("removeBg.title")}</h2>
        <p role="status" className="text-sm text-text-2">
          {label}
        </p>
        {!error && (
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            {pct === null ? (
              <div className="h-2 w-1/3 animate-pulse rounded-full bg-accent" />
            ) : (
              <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
            )}
          </div>
        )}
        {error && <p className="text-xs break-words text-muted">{error}</p>}
        {error && (
          <button type="button" onClick={onClose} className="h-12 rounded-[14px] border border-border-2 font-semibold">
            {t("common.close")}
          </button>
        )}
      </div>
    </div>
  );
}
