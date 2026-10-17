"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { CanvasElement } from "@/lib/project/types";
import { useEditor, useViewDoc } from "@/store/editor";
import { isSticker, STICKERS } from "@/lib/elements/stickers";
import { units } from "@/lib/project/blocks";
import { useSettings, useT } from "@/store/settings";

export interface Action<K extends string = string> {
  key: K;
  label: string;
  icon: IconName;
  danger?: boolean;
}

/** Modal bottom sheet with secondary actions ("⋯ More", UX-03). Tapping an action closes it. */
export function ActionSheet<K extends string>({
  title,
  actions,
  onAction,
  onClose,
}: {
  title: string;
  actions: Action<K>[];
  onAction: (key: K) => void;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <section
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="rounded-t-[22px] bg-surface px-3 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between px-2 pb-2">
          <h2 className="text-[15px] font-bold">{title}</h2>
          <button type="button" aria-label={t("common.close")} onClick={onClose} className="flex h-10 w-10 items-center justify-center">
            <Icon name="close" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => {
                onClose();
                onAction(a.key);
              }}
              className={`flex h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl text-[11px] leading-tight hover:bg-surface-2 ${a.danger ? "text-danger" : ""}`}
            >
              <Icon name={a.icon} />
              <span className="px-1 text-center">{a.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function elementLabel(el: CanvasElement, index: number, t: ReturnType<typeof useT>) {
  if (el.type === "text") return `“${el.text.slice(0, 24)}${el.text.length > 24 ? "…" : ""}”`;
  if (el.type === "shape") return t(`shape.${el.shape}`);
  if (el.type === "icon" && el.svg) return el.icon.replace(/^emoji:/, "").replace(/-/g, " ");
  if (el.type === "icon") return isSticker(el.icon) ? STICKERS[el.icon].name[useSettings.getState().locale] : t(`icon.${el.icon}` as "icon.heart");
  if (el.type === "drawing") return t("editor.kind.drawing");
  if (el.type === "layout") return `${t("editor.kind.layout")} · ${el.cells.length}`;
  return `${t("editor.kind.image")} ${index}`;
}

const KIND_ICON: Record<CanvasElement["type"], IconName> = { image: "image", text: "text", shape: "shapes", icon: "heart", drawing: "pencil", layout: "layout" };

/** Layers list (UX-10): select anything, even when it is covered; lock / unlock. Top of the list = front. */
const LAYER_ROW = 48;

/**
 * Layers panel (UX-10, S8): front-most on top. Tap a row to select, drag the handle to
 * reorder, eye to hide / show, padlock to lock.
 */
export function LayersSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const doc = useViewDoc();
  const selectedId = useEditor((s) => s.selectedId);
  const { select, toggleLock, toggleHidden, moveLayerToIndex } = useEditor.getState();
  const [drag, setDrag] = useState<{ id: string; row: number; startY: number; dy: number } | null>(null);
  if (!doc) return null;
  let photo = 0;
  // One row per top-level element: a layout block is one row, not one per cell (M14).
  const rows = units(doc)
    .map(([el]) => ({ el, label: elementLabel(el, el.type === "image" ? ++photo : 0, t) }))
    .reverse();
  const last = rows.length - 1;
  const target = drag ? Math.max(0, Math.min(last, drag.row + Math.round(drag.dy / LAYER_ROW))) : -1;

  /** Where a row is drawn while another one is being dragged. */
  function shift(row: number) {
    if (!drag) return 0;
    if (row === drag.row) return drag.dy;
    if (drag.row < row && row <= target) return -LAYER_ROW;
    if (target <= row && row < drag.row) return LAYER_ROW;
    return 0;
  }

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <section
        aria-label={t("layers.title")}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[70dvh] flex-col rounded-t-[22px] bg-surface pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-between px-5 pb-1">
          <h2 className="text-[15px] font-bold">{t("layers.title")}</h2>
          <button type="button" aria-label={t("common.close")} onClick={onClose} className="flex h-10 w-10 items-center justify-center">
            <Icon name="close" />
          </button>
        </div>
        <p className="px-5 pb-2 text-xs text-muted">{t("layers.hint")}</p>
        <ul className="flex flex-col overflow-y-auto px-3">
          {rows.map(({ el, label }, row) => (
            <li
              key={el.id}
              style={{
                height: LAYER_ROW,
                transform: `translateY(${shift(row)}px)`,
                transition: drag && drag.id !== el.id ? "transform 150ms ease" : undefined,
                zIndex: drag?.id === el.id ? 1 : undefined,
              }}
              className={`relative flex shrink-0 items-center gap-0.5 rounded-xl ${el.id === selectedId ? "bg-accent-soft" : drag?.id === el.id ? "bg-surface-2 shadow-md" : ""}`}
            >
              <span
                role="button"
                aria-label={t("layers.reorder", { name: label })}
                className="flex h-11 w-9 shrink-0 cursor-grab items-center justify-center text-muted"
                style={{ touchAction: "none" }}
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  setDrag({ id: el.id, row, startY: e.clientY, dy: 0 });
                }}
                onPointerMove={(e) => drag?.id === el.id && setDrag({ ...drag, dy: e.clientY - drag.startY })}
                onPointerUp={() => {
                  if (drag && target !== drag.row) moveLayerToIndex(el.id, last - target);
                  setDrag(null);
                }}
                onPointerCancel={() => setDrag(null)}
              >
                <Icon name="grip" size={18} />
              </span>
              <button
                type="button"
                disabled={el.hidden}
                onClick={() => {
                  select(el.id);
                  onClose();
                }}
                className={`flex h-12 min-w-0 flex-1 items-center gap-3 px-1 text-left text-sm ${el.hidden ? "text-disabled" : ""}`}
              >
                <Icon name={KIND_ICON[el.type]} size={18} />
                <span className="truncate">{label}</span>
              </button>
              <button
                type="button"
                aria-label={el.hidden ? t("layers.show") : t("layers.hide")}
                aria-pressed={!!el.hidden}
                onClick={() => toggleHidden(el.id)}
                className={`flex h-10 w-10 items-center justify-center ${el.hidden ? "text-accent-text" : "text-muted"}`}
              >
                <Icon name={el.hidden ? "eyeOff" : "eye"} size={18} />
              </button>
              <button
                type="button"
                aria-label={el.locked ? t("editor.unlock") : t("editor.lock")}
                aria-pressed={!!el.locked}
                onClick={() => toggleLock(el.id)}
                className={`flex h-10 w-10 items-center justify-center ${el.locked ? "text-accent-text" : "text-muted"}`}
              >
                <Icon name={el.locked ? "lock" : "unlock"} size={18} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const TIPS_KEY = "ig-layout:tips-seen";

/** First-run tips in the editor (UX-17). Shown once per device. */
export function CoachTips() {
  const t = useT();
  const [show, setShow] = useState(() => {
    try {
      return !localStorage.getItem(TIPS_KEY);
    } catch {
      return false;
    }
  });
  if (!show) return null;
  const dismiss = () => {
    try {
      localStorage.setItem(TIPS_KEY, "1");
    } catch {
      // Storage blocked: the tips just show again next time.
    }
    setShow(false);
  };
  return (
    <div role="note" className="absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-border bg-surface p-4 shadow-lg">
      <h2 className="pb-2 text-sm font-bold">{t("tips.title")}</h2>
      <ul className="flex flex-col gap-1.5 text-[13px] leading-snug text-text-2">
        <li>• {t("tips.select")}</li>
        <li>• {t("tips.scroll")}</li>
        <li>• {t("tips.apply")}</li>
      </ul>
      <button type="button" onClick={dismiss} className="mt-3 h-10 w-full rounded-xl bg-accent text-sm font-bold text-on-accent">
        {t("tips.ok")}
      </button>
    </div>
  );
}
