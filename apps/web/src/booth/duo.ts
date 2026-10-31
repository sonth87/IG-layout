import { composeDuo, type DuoArrange } from "@ig-layout/core/booth/duo";
import { shotAspect } from "@ig-layout/core/booth/frames";
import type { BoothRoll } from "@ig-layout/core/storage/booth";
import { rollFrame } from "./look";

// Duo rolls (2026-10-31): the shots are the two people's photos put together; when the way or
// the frame changes they're put together again from the kept pairs, each to its cell's shape.

/** The roll's shots put together `arrange`'s way, for its frame as it is now. */
export async function rearrange(roll: BoothRoll, arrange: DuoArrange): Promise<BoothRoll> {
  if (!roll.duo) return roll;
  const frame = rollFrame(roll);
  const shots = await Promise.all(roll.duo.pairs.map((p, i) => (p ? composeDuo(p[0], p[1], arrange, shotAspect(frame, i)) : Promise.resolve(roll.shots[i] ?? null))));
  return { ...roll, shots, duo: { ...roll.duo, arrange } };
}
