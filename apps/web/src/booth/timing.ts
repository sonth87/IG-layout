// Booth timing: a countdown picked before shooting (3 / 5 / 8 s, D-162; 8 s was D-154), a 2 s
// rest between shots — the shot just taken is shown big during it.
export const COUNTDOWNS = [3, 5, 8] as const;
export const COUNTDOWN_S = 8;
export const REST_S = 2;

/** Shots taken for a frame of `cells` when spares are on (D-162): a 1-cell frame shoots once. */
const TAKES: Record<number, number> = { 1: 1, 2: 5, 3: 6, 4: 7, 5: 8, 6: 10, 7: 11, 8: 12 };
export function takesFor(cells: number, spare: boolean): number {
  if (!spare) return cells;
  return TAKES[cells] ?? cells + 4;
}
