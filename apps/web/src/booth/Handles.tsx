"use client";

import type { PointerEvent, ReactNode } from "react";

// Handles of a piece being placed by hand (a cell, a sticker): turn knob above, resize corner
// at the bottom right, remove at the top left. Each sits at its anchor point and is counter-
// scaled by the zoom (`--inv` from ZoomView), so it stays the same size on screen however far
// the print is zoomed in.

/** A zero-size point on the piece's box; what's inside is scaled around it by 1 / zoom. */
function Anchor({ at, children }: { at: string; children: ReactNode }) {
  return (
    <span className={`absolute h-0 w-0 ${at}`} style={{ transform: "scale(var(--inv, 1))", transformOrigin: "0 0" }}>
      {children}
    </span>
  );
}

export function Handles({ onTurn, onScale, onRemove }: { onTurn: (e: PointerEvent) => void; onScale: (e: PointerEvent) => void; onRemove?: () => void }) {
  return (
    <>
      <Anchor at="top-0 left-1/2">
        <span aria-hidden className="absolute -top-2 -left-px h-2 w-0.5 bg-[var(--c-amber)]" />
        <span aria-label="Turn" data-turn onPointerDown={onTurn} className="absolute -top-7 -left-2.5 h-5 w-5 cursor-grab rounded-full border-2 border-[var(--c-ink)] bg-[var(--c-amber)]" />
      </Anchor>
      <Anchor at="right-0 bottom-0">
        <span aria-label="Scale" data-scale onPointerDown={onScale} className="absolute -top-2.5 -left-2.5 h-5 w-5 cursor-nwse-resize border-2 border-[var(--c-ink)] bg-[var(--c-paper)]" />
      </Anchor>
      {onRemove && (
        <Anchor at="top-0 left-0">
          <button
            type="button"
            aria-label="Remove"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onRemove}
            className="absolute -top-3 -left-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--c-ink)] bg-[var(--c-red)] text-xs font-bold text-[var(--c-paper)]"
          >
            ✕
          </button>
        </Anchor>
      )}
    </>
  );
}

/** The selection outline, 2 px on screen at any zoom. */
export const OUTLINE = { outlineWidth: "calc(2px * var(--inv, 1))" };
