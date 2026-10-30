"use client";

import { useEffect, useRef, useState } from "react";
import { stickerAspect, type BoothSticker } from "@ig-layout/core/booth/stickers";

// Stickers on the print (2026-10-30): tap one to pick it; drag to move, the corner to resize,
// the knob to turn (snaps to 0°), × to remove. Drawn live, saved when the finger lifts.

type Drag = { kind: "move" | "scale" | "turn"; i: number; sx: number; sy: number; start: BoothSticker; k: number };

export function StickerEditor({ width, height, stickers, selected, onSelect, onLive, onChange }: {
  width: number;
  height: number;
  stickers: BoothSticker[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  onLive: (s: BoothSticker[] | null) => void;
  onChange: (s: BoothSticker[]) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [list, setList] = useState(stickers);
  const drag = useRef<Drag | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the draft follows its source
    setList(stickers);
  }, [stickers]);
  useEffect(() => onLive(list === stickers ? null : list), [list, stickers, onLive]);

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const put = (i: number, s: BoothSticker) => setList((all) => all.map((x, j) => (j === i ? s : x)));
  const centre = (s: BoothSticker) => {
    const r = box.current!.getBoundingClientRect();
    return { x: r.left + (s.x / width) * r.width, y: r.top + (s.y / height) * r.height };
  };

  function start(e: React.PointerEvent, i: number, kind: Drag["kind"]) {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    onSelect(list[i].id);
    const r = box.current!.getBoundingClientRect();
    drag.current = { kind, i, sx: e.clientX, sy: e.clientY, start: list[i], k: width / r.width };
  }

  function move(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const s = d.start;
    if (d.kind === "move") put(d.i, { ...s, x: s.x + (e.clientX - d.sx) * d.k, y: s.y + (e.clientY - d.sy) * d.k });
    else {
      const c = centre(s);
      if (d.kind === "scale") {
        const k0 = Math.hypot(d.sx - c.x, d.sy - c.y) || 1;
        const k = Math.hypot(e.clientX - c.x, e.clientY - c.y) / k0;
        put(d.i, { ...s, w: Math.max(width * 0.05, Math.min(width * 1.5, s.w * k)) });
      } else {
        let deg = (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI + 90;
        if (deg > 180) deg -= 360;
        if (Math.abs(deg) < 3) deg = 0;
        put(d.i, { ...s, rot: Math.round(deg * 10) / 10 });
      }
    }
  }

  function end() {
    if (!drag.current) return;
    drag.current = null;
    onChange(list);
  }

  return (
    <div ref={box} className="absolute inset-0 touch-none" onPointerMove={move} onPointerUp={end} onPointerCancel={end} onPointerDown={() => onSelect(null)} data-sticker-editor>
      {list.map((s, i) => {
        const h = s.w * stickerAspect(s.key);
        const on = s.id === selected;
        return (
          <div
            key={s.id}
            role="button"
            aria-label={`Sticker ${i + 1}`}
            aria-pressed={on}
            data-sticker={s.key}
            onPointerDown={(e) => start(e, i, "move")}
            className={`absolute cursor-move ${on ? "outline outline-2 outline-[#eaa63c]" : ""}`}
            style={{ left: pct(s.x - s.w / 2, width), top: pct(s.y - h / 2, height), width: pct(s.w, width), height: pct(h, height), transform: `rotate(${s.rot}deg)`, zIndex: 10 + i }}
          >
            {on && (
              <>
                <span aria-label="Turn" data-turn onPointerDown={(e) => start(e, i, "turn")} className="absolute -top-7 left-1/2 h-5 w-5 -translate-x-1/2 cursor-grab rounded-full border-2 border-[#1d1612] bg-[#eaa63c]" />
                <span aria-label="Scale" data-scale onPointerDown={(e) => start(e, i, "scale")} className="absolute -right-2.5 -bottom-2.5 h-5 w-5 cursor-nwse-resize border-2 border-[#1d1612] bg-[#f3e9d6]" />
                <button
                  type="button"
                  aria-label="Remove"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    onSelect(null);
                    onChange(list.filter((x) => x.id !== s.id));
                  }}
                  className="absolute -top-3 -left-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#1d1612] bg-[#c8432f] text-xs font-bold text-[#f3e9d6]"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
