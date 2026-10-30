"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Laid, PlacedCell } from "@ig-layout/core/booth/layout";
import { Handles, OUTLINE } from "./Handles";

// Free arrangement (D-161): over the print, each cell can be picked (it comes to the top),
// dragged, scaled from its corner and turned from its knob. Snaps: centres to the sheet's
// middle and to other cells' centres, the turn to 0°. Changes are shown live and committed
// when the finger lifts (one save per gesture).

const SNAP = 0.015; // of the sheet's width / height
const SNAP_DEG = 3;

type Drag = { kind: "move" | "scale" | "turn"; id: number; sx: number; sy: number; start: PlacedCell; k: number };

export function LayoutEditor({ frame, onChange, onLive }: { frame: Laid; onChange: (cells: PlacedCell[]) => void; onLive: (cells: PlacedCell[] | null) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [cells, setCells] = useState(frame.cells);
  const [sel, setSel] = useState<number | null>(null);
  const drag = useRef<Drag | null>(null);
  // A new layout from outside (shuffle, realign, another frame) replaces the draft.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the draft follows its source
    setCells(frame.cells);
  }, [frame.cells]);

  // The print redraws as the cell moves.
  useEffect(() => onLive(cells === frame.cells ? null : cells), [cells, frame.cells, onLive]);

  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const put = (i: number, c: PlacedCell) => setCells((all) => all.map((x, j) => (j === i ? c : x)));

  function start(e: PointerEvent, i: number, kind: Drag["kind"]) {
    e.stopPropagation();
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const r = box.current!.getBoundingClientRect();
    // Picked → on top.
    const top = Math.max(...cells.map((c) => c.z)) + 1;
    const c = cells[i].z === top - 1 ? cells[i] : { ...cells[i], z: top };
    put(i, c);
    setSel(i);
    drag.current = { kind, id: i, sx: e.clientX, sy: e.clientY, start: c, k: frame.width / r.width };
  }

  function move(e: PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const dx = (e.clientX - d.sx) * d.k;
    const dy = (e.clientY - d.sy) * d.k;
    const s = d.start;
    if (d.kind === "move") {
      let cx = s.x + s.w / 2 + dx;
      let cy = s.y + s.h / 2 + dy;
      // Snap centres: the sheet's middle and the other cells' centres.
      const xs = [frame.width / 2, ...cells.filter((_, j) => j !== d.id).map((c) => c.x + c.w / 2)];
      const ys = [frame.height / 2, ...cells.filter((_, j) => j !== d.id).map((c) => c.y + c.h / 2)];
      const nx = xs.find((x) => Math.abs(x - cx) < frame.width * SNAP);
      const ny = ys.find((y) => Math.abs(y - cy) < frame.height * SNAP);
      if (nx !== undefined) cx = nx;
      if (ny !== undefined) cy = ny;
      put(d.id, { ...s, x: cx - s.w / 2, y: cy - s.h / 2 });
    } else if (d.kind === "scale") {
      // From the centre, keeping the shape; the corner follows the finger along the diagonal.
      const r = box.current!.getBoundingClientRect();
      const cx = r.left + ((s.x + s.w / 2) / frame.width) * r.width;
      const cy = r.top + ((s.y + s.h / 2) / frame.height) * r.height;
      const k0 = Math.hypot(d.sx - cx, d.sy - cy) || 1;
      const k = Math.max(0.3, Math.min(2.5, Math.hypot(e.clientX - cx, e.clientY - cy) / k0));
      const w = Math.max(frame.width * 0.12, s.w * k);
      const h = (w / s.w) * s.h;
      put(d.id, { ...s, x: s.x + (s.w - w) / 2, y: s.y + (s.h - h) / 2, w, h });
    } else {
      const r = box.current!.getBoundingClientRect();
      const cx = r.left + ((s.x + s.w / 2) / frame.width) * r.width;
      const cy = r.top + ((s.y + s.h / 2) / frame.height) * r.height;
      let deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
      if (deg > 180) deg -= 360;
      if (Math.abs(deg) < SNAP_DEG) deg = 0;
      put(d.id, { ...s, rot: Math.round(deg * 10) / 10 });
    }
  }

  function end() {
    if (!drag.current) return;
    drag.current = null;
    onChange(cells);
  }

  return (
    <div ref={box} className="absolute inset-0 touch-none" onPointerMove={move} onPointerUp={end} onPointerCancel={end} onPointerDown={() => setSel(null)} data-layout-editor>
      {cells.map((c, i) => (
        <div
          key={i}
          role="button"
          aria-label={`Cell ${i + 1}`}
          aria-pressed={sel === i}
          data-cell={i}
          onPointerDown={(e) => start(e, i, "move")}
          className={`absolute cursor-move ${sel === i ? "outline outline-2 outline-[#eaa63c]" : "outline outline-1 outline-dashed outline-white/50"}`}
          style={{ left: pct(c.x, frame.width), top: pct(c.y, frame.height), width: pct(c.w, frame.width), height: pct(c.h, frame.height), transform: `rotate(${c.rot}deg)`, zIndex: c.z + 1, ...OUTLINE }}
        >
          {sel === i && <Handles onTurn={(e) => start(e, i, "turn")} onScale={(e) => start(e, i, "scale")} />}
        </div>
      ))}
    </div>
  );
}
