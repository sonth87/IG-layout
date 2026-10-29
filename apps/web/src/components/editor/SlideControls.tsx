"use client";

import { useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Icon, type IconName } from "@/components/ui/Icon";
import { slideRect } from "@ig-layout/core/project/layout";
import { moveSlideTo, slideOfUnit } from "@ig-layout/core/project/slides";
import { MAX_SLIDES, type ProjectDoc } from "@ig-layout/core/project/types";
import { useEditor } from "@/store/editor";
import { useT } from "@/store/settings";

// Buttons on the canvas itself (editor-v2/05 §1, 3, 4): ‖ and ⋯ under every slide, + after
// the last one. ‖ held then dragged sideways moves the slide with everything on it; ⋯
// opens the slide menu. Positioned in the scroll content, so they scroll with the canvas.

const HOLD_MS = 200;
const BTN = "flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface shadow-md";

interface Drag {
  from: number;
  pointerId: number;
  startX: number;
  dx: number;
  to: number;
  base: ProjectDoc;
  ids: Set<string>;
}

export function SlideControls(props: {
  doc: ProjectDoc;
  origin: { x: number; y: number };
  viewScale: number;
  onAddSlide: () => void;
  onSlidesChanged: (count: number) => void;
}) {
  const { doc, origin, viewScale } = props;
  const t = useT();
  const [drag, setDrag] = useState<Drag | null>(null);
  // With something selected, the slide buttons step aside (only + stays, like IMG_3966).
  const selecting = useEditor((s) => s.selectedId !== null);
  const [menu, setMenu] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const hold = useRef<{ timer: number; pointerId: number; x: number; y: number; index: number } | null>(null);
  const size = { width: slideRect(doc, doc.slideCount - 1).x + slideRect(doc, doc.slideCount - 1).width, height: slideRect(doc, 0).height };
  const slideW = slideRect(doc, 0).width;
  const many = doc.slideCount > 1;

  function startDrag(index: number, pointerId: number, x: number) {
    const st = useEditor.getState();
    const base = st.doc!;
    st.select(null);
    st.beginDraft();
    navigator.vibrate?.(10);
    const ids = new Set(base.elements.filter((el) => slideOfUnit(base, el) === index).map((el) => el.id));
    setDrag({ from: index, pointerId, startX: x, dx: 0, to: index, base, ids });
  }

  /** The slide's content follows the finger; the others make room at the new place. */
  function preview(d: Drag, dx: number) {
    const k = dx / viewScale;
    const to = Math.max(0, Math.min(d.base.slideCount - 1, d.from + Math.round(k / slideW)));
    const shift = k - (to - d.from) * slideW;
    useEditor.getState().updateDraft(() => {
      const moved = moveSlideTo(d.base, d.from, to);
      return { ...moved, elements: moved.elements.map((el) => (d.ids.has(el.id) ? { ...el, x: el.x + shift } : el)) };
    });
    setDrag({ ...d, dx, to });
  }

  function endDrag(d: Drag) {
    const st = useEditor.getState();
    if (d.to === d.from) st.cancelDraft();
    else {
      st.updateDraft(() => moveSlideTo(d.base, d.from, d.to));
      st.applyDraft();
    }
    setDrag(null);
  }

  const handleEvents = (index: number) => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      // Mouse: drag at once; touch: hold first, so a swipe still scrolls the canvas.
      if (e.pointerType === "mouse") return startDrag(index, e.pointerId, e.clientX);
      const { pointerId, clientX: x, clientY: y } = e;
      hold.current = { pointerId, x, y, index, timer: window.setTimeout(() => startDrag(index, pointerId, x), HOLD_MS) };
    },
    onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => {
      const h = hold.current;
      if (h && !drag && Math.hypot(e.clientX - h.x, e.clientY - h.y) > 10) {
        clearTimeout(h.timer);
        hold.current = null;
      }
      if (drag && e.pointerId === drag.pointerId) preview(drag, e.clientX - drag.startX);
    },
    onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (hold.current) clearTimeout(hold.current.timer);
      hold.current = null;
      if (drag && e.pointerId === drag.pointerId) endDrag(drag);
    },
    onPointerCancel: () => {
      if (hold.current) clearTimeout(hold.current.timer);
      hold.current = null;
      if (drag) {
        useEditor.getState().cancelDraft();
        setDrag(null);
      }
    },
  });

  function run(index: number, action: "left" | "right" | "duplicate" | "delete") {
    const st = useEditor.getState();
    setMenu(null);
    if (action === "left") st.addSlide(index, null);
    else if (action === "right") st.addSlide(index + 1, null);
    else if (action === "duplicate") st.duplicateSlide(index);
    else {
      const used = st.doc!.elements.some((el) => slideOfUnit(st.doc!, el) === index);
      if (used) return setConfirmDelete(index);
      st.deleteSlide(index);
    }
    props.onSlidesChanged(useEditor.getState().doc!.slideCount);
  }

  const below = (i: number) => {
    const r = slideRect(doc, i);
    return { x: origin.x + (r.x + r.width / 2) * viewScale, y: origin.y + (r.y + r.height) * viewScale + 14 };
  };
  const items: { key: "left" | "right" | "duplicate" | "delete"; label: string; icon: IconName; danger?: boolean }[] = [
    { key: "left", label: t("slide.addLeft"), icon: "insertLeft" },
    { key: "right", label: t("slide.addRight"), icon: "insertRight" },
    { key: "duplicate", label: t("slide.duplicate"), icon: "duplicate" },
    ...(many ? [{ key: "delete" as const, label: t("slide.delete"), icon: "trash" as IconName, danger: true }] : []),
  ];
  const full = doc.slideCount >= MAX_SLIDES;

  return (
    <>
      {drag && (
        // Outline of the slide being moved, under the finger.
        <div
          className="pointer-events-none absolute z-[2] rounded-sm border-2 border-accent"
          style={{
            left: origin.x + slideRect(doc, drag.from).x * viewScale + drag.dx,
            top: origin.y,
            width: slideW * viewScale,
            height: size.height * viewScale,
          }}
        />
      )}
      {Array.from({ length: doc.slideCount }, (_, i) => {
        if ((drag && drag.from !== i) || (selecting && !drag)) return null;
        const p = below(i);
        const dragging = drag?.from === i;
        return (
          <div
            key={i}
            className="absolute z-[2] flex -translate-x-1/2 gap-2"
            style={{ left: p.x + (dragging ? drag.dx : 0), top: p.y }}
          >
            {many && (
              <button
                type="button"
                aria-label={t("slide.reorder", { index: i + 1 })}
                {...handleEvents(i)}
                style={{ touchAction: "none", transform: dragging ? "scale(1.5)" : undefined, transition: "transform 120ms" }}
                className={`${BTN} ${dragging ? "bg-accent text-on-accent" : ""}`}
              >
                <Icon name="handle" size={16} />
              </button>
            )}
            {!dragging && (
              <button type="button" aria-label={t("slide.menu", { index: i + 1 })} onClick={() => setMenu(menu === i ? null : i)} className={BTN}>
                <Icon name="more" size={16} />
              </button>
            )}
          </div>
        );
      })}
      {!drag && (
        <button
          type="button"
          aria-label={t("editor.addSlide")}
          disabled={full}
          onClick={props.onAddSlide}
          className="absolute z-[2] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface shadow-lg disabled:opacity-40"
          style={{ left: origin.x + size.width * viewScale + 12, top: origin.y + (size.height * viewScale) / 2 - 22 }}
        >
          <Icon name="plus" />
        </button>
      )}
      {menu !== null && (
        <>
          <div className="fixed inset-0 z-[3]" onClick={() => setMenu(null)} />
          <div
            role="menu"
            aria-label={t("slide.menu", { index: menu + 1 })}
            className="absolute z-[4] w-48 -translate-x-1/2 -translate-y-full overflow-hidden rounded-2xl border border-border bg-surface/95 py-1 shadow-xl backdrop-blur"
            style={{ left: below(menu).x, top: below(menu).y - 8 }}
          >
            {items.map((it, n) => (
              <button
                key={it.key}
                type="button"
                role="menuitem"
                disabled={full && it.key !== "delete"}
                onClick={() => run(menu, it.key)}
                className={`flex h-11 w-full items-center gap-3 px-4 text-left text-sm disabled:opacity-40 ${it.danger ? "text-danger" : ""} ${
                  n === 2 ? "border-t border-border" : ""
                }`}
              >
                <Icon name={it.icon} size={19} />
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
      {confirmDelete !== null && (
        <ConfirmDialog
          title={t("slide.deleteConfirm", { index: confirmDelete + 1 })}
          body={t("slide.deleteBody")}
          confirmLabel={t("common.delete")}
          danger
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            useEditor.getState().deleteSlide(confirmDelete);
            setConfirmDelete(null);
            props.onSlidesChanged(useEditor.getState().doc!.slideCount);
          }}
        />
      )}
    </>
  );
}
