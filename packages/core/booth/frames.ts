// Booth frames (D-152, docs/discussions/2026-10-29-booth-thiet-ke.md §3): where each shot
// goes on the printed sheet. Plain data, sizes in output pixels (300 dpi for the print sizes,
// Instagram sizes for Post / Story). A cell shows one shot; a shot can appear in several
// cells (Post 4:5 is two copies of a 4-shot strip side by side).

export interface FrameCell {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Which shot (0-based) this cell shows. */
  shot: number;
  /** Arranged cells (layout.ts): turn in degrees, stacking order. */
  rot?: number;
  z?: number;
}

export interface BoothFrame {
  id: string;
  /** Output size, px. */
  width: number;
  height: number;
  /** Number of shots to take. */
  shots: number;
  cells: FrameCell[];
  /** Where the caption (title + date) goes, px. */
  foot: { x: number; y: number; w: number; h: number };
  /** Film sprocket holes along these edges (strips). */
  holes?: "sides" | "top-bottom";
  /** Shown in the picker: how it's printed / used. */
  size: string;
  /** The caption has a cell of its own (a title card among the photos). */
  footPanel?: boolean;
  /** Cell outline (layout.ts); rectangle when absent. */
  shape?: import("./layout").CellShape;
}

/** Cells in a column (or several columns) of equal cells. */
function column(x: number, y: number, w: number, h: number, n: number, gap: number, first = 0): FrameCell[] {
  return Array.from({ length: n }, (_, i) => ({ x, y: y + i * (h + gap), w, h, shot: first + i }));
}

function grid(x: number, y: number, w: number, h: number, cols: number, rows: number, gap: number): FrameCell[] {
  const cells: FrameCell[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) cells.push({ x: x + c * (w + gap), y: y + r * (h + gap), w, h, shot: r * cols + c });
  return cells;
}

export const FRAMES: BoothFrame[] = [
  // 2 × 6 in strip, 4 shots (the classic).
  { id: "strip4", width: 600, height: 1800, shots: 4, cells: column(40, 40, 520, 360, 4, 20), foot: { x: 40, y: 1540, w: 520, h: 220 }, holes: "sides", size: "2×6 in" },
  { id: "strip3", width: 600, height: 1800, shots: 3, cells: column(40, 40, 520, 450, 3, 20), foot: { x: 40, y: 1430, w: 520, h: 330 }, holes: "sides", size: "2×6 in" },
  { id: "grid4", width: 1200, height: 1800, shots: 4, cells: grid(50, 50, 540, 660, 2, 2, 20), foot: { x: 50, y: 1440, w: 1100, h: 310 }, size: "4×6 in" },
  { id: "grid6", width: 1200, height: 1800, shots: 6, cells: grid(50, 50, 540, 430, 2, 3, 20), foot: { x: 50, y: 1400, w: 1100, h: 350 }, size: "4×6 in" },
  // 6 × 2 in, side by side: suits a group standing in a row. Caption on the right.
  // 3 photos in a 2 × 2 grid, the fourth square a title card (owner, 2026-10-30).
  { id: "grid3", width: 1200, height: 1500, shots: 3, cells: grid(50, 50, 540, 690, 2, 2, 20).slice(0, 3), foot: { x: 610, y: 760, w: 540, h: 690 }, footPanel: true, size: "4×5 in" },
  // A strip with its title card on top, like the "Thank you" strips.
  { id: "strip3t", width: 600, height: 1800, shots: 3, cells: column(40, 470, 520, 410, 3, 20, 0), foot: { x: 40, y: 40, w: 520, h: 410 }, footPanel: true, holes: "sides", size: "2×6 in" },
  { id: "row4", width: 1800, height: 600, shots: 4, cells: [0, 1, 2, 3].map((i) => ({ x: 40 + i * 375, y: 40, w: 355, h: 520, shot: i })), foot: { x: 1540, y: 40, w: 220, h: 520 }, holes: "top-bottom", size: "6×2 in" },
  { id: "polaroid", width: 1050, height: 1260, shots: 1, cells: [{ x: 60, y: 60, w: 930, h: 930, shot: 0 }], foot: { x: 60, y: 1010, w: 930, h: 220 }, size: "3.5×4.2 in" },
  // Instagram Post 4:5: two copies of the 4-shot strip, like the two strips on a 4 × 6 print.
  { id: "post45", width: 1080, height: 1350, shots: 4, cells: [...column(50, 50, 470, 270, 4, 16), ...column(560, 50, 470, 270, 4, 16)], foot: { x: 50, y: 1206, w: 980, h: 110 }, size: "Post 4:5" },
  { id: "story", width: 1080, height: 1920, shots: 3, cells: column(80, 120, 920, 520, 3, 30), foot: { x: 80, y: 1760, w: 920, h: 120 }, size: "Story 9:16" },
];

export function frameById(id: string): BoothFrame {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}

/** The aspect (w / h) of the cell a shot goes into (the first cell showing it). */
export function shotAspect(frame: BoothFrame, shot: number): number {
  const c = frame.cells.find((c) => c.shot === shot) ?? frame.cells[0];
  return c.w / c.h;
}
