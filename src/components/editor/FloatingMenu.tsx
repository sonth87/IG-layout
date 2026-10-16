"use client";

import type Konva from "konva";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";

const GAP = 14;
const EDGE = 8;

/**
 * Small menu floating over the selected element (S7, like SCRL): duplicate, delete,
 * lock, more. Positioned imperatively (no React render per scroll frame), hidden while
 * the element is being dragged / pinched, back when the finger is lifted.
 * Lives in the sticky box that also holds the stage, so both share coordinates.
 */
export function FloatingMenu({ scrollRef, onMore }: { scrollRef: React.RefObject<HTMLDivElement | null>; onMore: () => void }) {
  const t = useT();
  const doc = useViewDoc();
  const canvas = useEditor((s) => s.canvas);
  const selectedId = useEditor((s) => s.selectedId);
  const swapFrom = useEditor((s) => s.swapFrom);
  const { duplicateElement, removeElement, toggleLock } = useEditor.getState();
  const ref = useRef<HTMLDivElement>(null);
  const el = doc?.elements.find((e) => e.id === selectedId);

  /** Puts the menu above the element (below if there is no room), or hides it. */
  const place = useRef(() => {});
  useLayoutEffect(() => {
    place.current = () => {
      const box = ref.current;
      const stage = canvas?.layer.getStage();
      const node = selectedId ? stage?.findOne(`#${selectedId}`) : undefined;
      if (!box || !stage || !node) return;
      const r = node.getClientRect();
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      const vw = stage.width();
      const vh = stage.height();
      const offscreen = r.x + r.width < 0 || r.x > vw || r.y + r.height < 0 || r.y > vh;
      let y = r.y - GAP - h;
      if (y < EDGE) y = r.y + r.height + GAP;
      if (y + h > vh - EDGE) y = Math.max(EDGE, Math.min(vh - h - EDGE, r.y + GAP)); // tall element: inside its top
      // Centred on the part of the element that is on screen (a panorama is wider than it).
      const left = Math.max(r.x, 0);
      const right = Math.min(r.x + r.width, vw);
      const x = Math.max(EDGE, Math.min(vw - w - EDGE, (left + right) / 2 - w / 2));
      box.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      box.style.visibility = offscreen ? "hidden" : "visible";
      box.style.opacity = "1";
    };
  });

  // Re-place after every change (commit, zoom, selection) and on scroll.
  useLayoutEffect(() => place.current());
  useEffect(() => {
    const area = scrollRef.current;
    const stage = canvas?.layer.getStage();
    if (!area || !stage) return;
    let frame = 0;
    const onScroll = () => (frame ||= requestAnimationFrame(() => ((frame = 0), place.current())));
    // Out of the way during a gesture on the canvas.
    const hide = () => ref.current && (ref.current.style.opacity = "0");
    const show = () => requestAnimationFrame(() => place.current());
    const onTouch = (e: Konva.KonvaEventObject<TouchEvent>) => e.evt.touches.length >= 2 && hide();
    area.addEventListener("scroll", onScroll, { passive: true });
    stage.on("dragstart.menu transformstart.menu", hide);
    stage.on("dragend.menu transformend.menu", show);
    stage.on("touchstart.menu", onTouch);
    stage.on("touchend.menu", show);
    return () => {
      area.removeEventListener("scroll", onScroll);
      stage.off(".menu");
      cancelAnimationFrame(frame);
    };
  }, [scrollRef, canvas]);

  if (!el || swapFrom) return null;
  const btn = "flex h-10 w-10 items-center justify-center rounded-full";

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label={t("editor.quickActions")}
      // Placed by `place()`; starts invisible so it never flashes at the corner.
      style={{ opacity: 0, transition: "opacity 120ms ease" }}
      className="absolute top-0 left-0 z-10 flex items-center gap-0.5 rounded-full border border-border bg-surface/95 p-1 shadow-lg"
    >
      {el.locked ? (
        <button type="button" aria-label={t("editor.unlock")} onClick={() => toggleLock(el.id)} className={`${btn} text-accent-text`}>
          <Icon name="lock" size={19} />
        </button>
      ) : (
        <>
          <button type="button" aria-label={t("editor.duplicate")} onClick={() => duplicateElement(el.id)} className={btn}>
            <Icon name="duplicate" size={19} />
          </button>
          <button type="button" aria-label={t("common.delete")} onClick={() => removeElement(el.id)} className={`${btn} text-danger`}>
            <Icon name="trash" size={19} />
          </button>
          <button type="button" aria-label={t("editor.lock")} onClick={() => toggleLock(el.id)} className={btn}>
            <Icon name="unlock" size={19} />
          </button>
        </>
      )}
      <button type="button" aria-label={t("editor.more")} onClick={onMore} className={btn}>
        <Icon name="more" size={19} />
      </button>
    </div>
  );
}
