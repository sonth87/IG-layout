"use client";

import { useEffect } from "react";
import { useEditor } from "@/store/editor";

/**
 * Desktop keyboard shortcuts (M7): ⌘/Ctrl+Z undo, ⇧⌘Z / Ctrl+Y redo,
 * Delete / Backspace remove the selection, Esc deselects, arrows nudge
 * (Shift = 10×). Ignored while typing or while a tool is open.
 */
export function useShortcuts(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      const s = useEditor.getState();
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (mod && key === "z") {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
        return;
      }
      if (mod && key === "y") {
        e.preventDefault();
        s.redo();
        return;
      }
      const el = s.doc?.elements.find((x) => x.id === s.selectedId);
      if (!el) return;
      if (key === "delete" || key === "backspace") {
        e.preventDefault();
        s.removeElement(el.id);
      } else if (key === "escape") {
        s.select(null);
      } else if (key.startsWith("arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 50 : 5;
        const dx = key === "arrowleft" ? -step : key === "arrowright" ? step : 0;
        const dy = key === "arrowup" ? -step : key === "arrowdown" ? step : 0;
        s.updateElement(el.id, { x: el.x + dx, y: el.y + dy });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
