import { outermost } from "@/lib/project/blocks";
import type { CanvasElement, ProjectDoc } from "@/lib/project/types";

// What a tap does (M14, editor-v2/06, dev/editor-v2 §3). Pure: tested on its own.
//  - nothing hit → deselect;
//  - the "+" of an empty photo in a block or a template (or of the selected empty photo)
//    → select it and open the photo picker (D-90); one the user placed alone on a slide
//    is selected first (Q-E1);
//  - first tap selects the outermost element (a cell → its layout block);
//  - tapping the selected block again on a cell with a photo goes into that photo;
//  - tapping the selected text again starts editing;
//  - anything else → select the outermost element there (Q-E3, D-88).

export interface TapResult {
  select: string | null;
  action?: "fill" | "editText";
}

export function tapResult(doc: Pick<ProjectDoc, "elements">, selectedId: string | null, hitId: string | null, onPlus: boolean): TapResult {
  const el = hitId ? doc.elements.find((e) => e.id === hitId) : undefined;
  if (!el) return { select: null };
  if (el.type === "image" && !el.assetId && onPlus && (el.parentId || el.fromLayout || selectedId === el.id)) return { select: el.id, action: "fill" };
  if (selectedId === el.id) return el.type === "text" ? { select: el.id, action: "editText" } : { select: el.id };
  const selected = selectedId ? doc.elements.find((e) => e.id === selectedId) : undefined;
  if (el.parentId && (selectedId === el.parentId || selected?.parentId === el.parentId)) {
    // Inside the selected block a cell is selectable, empty or not; only its "+" also opens
    // "Fill frame" (owner, 2026-10-18; cells are ordinary elements, D-113).
    return { select: el.id };
  }
  return { select: outermost(doc, el).id };
}

/** The element a Konva node belongs to (walks up to an id the document knows). */
export function elementOf(node: { id(): string; getParent(): unknown } | null, elements: CanvasElement[]): string | null {
  let n = node as { id(): string; getParent(): unknown } | null;
  while (n) {
    const id = n.id();
    if (id && elements.some((e) => e.id === id)) return id;
    n = n.getParent() as typeof n;
  }
  return null;
}
