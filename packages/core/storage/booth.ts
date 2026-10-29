import { type DBSchema, type IDBPDatabase, openDB } from "idb";

// Booth rolls kept on the device (D-156): the shots of one session and the frame they were
// laid out in, so the home screen can show recent rolls and reopen one. A database of its
// own (not "ig-layout"), so the booth never has to upgrade the projects' database.

export interface BoothRoll {
  id: string;
  frameId: string;
  /** Full-resolution shots, in order (null = not taken yet). */
  shots: (Blob | null)[];
  flip: boolean;
  /** Decoration (step 2): theme id (default Cinema), filter id (null = none, undefined =
   * the theme's), caption title (undefined = the theme's), date under it (default on). */
  theme?: string;
  filter?: string | null;
  title?: string;
  showDate?: boolean;
  /** Layout (D-161): arrangement, cell shape, seed of the random ones, hand-placed cells. */
  layout?: import("../booth/layout").LayoutChoice;
  /** Drawn decorations (D-161 step 2). */
  decor?: import("../booth/decor").Decor[];
  /** Shot together in a group room (D-159): its code, everyone's names (host first), and the
   * key the room's phones share for it (decorating together, D-148). */
  room?: { code: string; names: string[]; key?: string };
  createdAt: number;
  updatedAt: number;
  /** Small JPEG of the laid-out frame, for the home screen. */
  thumbnail: Blob;
}

interface Schema extends DBSchema {
  rolls: { key: string; value: BoothRoll; indexes: { updatedAt: number } };
}

let dbPromise: Promise<IDBPDatabase<Schema>> | null = null;

function boothDb() {
  dbPromise ??= openDB<Schema>("ig-layout-booth", 1, {
    upgrade(d) {
      d.createObjectStore("rolls", { keyPath: "id" }).createIndex("updatedAt", "updatedAt");
    },
    terminated() {
      dbPromise = null;
    },
  });
  return dbPromise;
}

export async function listRolls(): Promise<BoothRoll[]> {
  const all = await (await boothDb()).getAllFromIndex("rolls", "updatedAt");
  return all.reverse();
}

export async function getRoll(id: string) {
  return (await boothDb()).get("rolls", id);
}

export async function saveRoll(roll: BoothRoll) {
  await (await boothDb()).put("rolls", roll);
}

export async function deleteRoll(id: string) {
  await (await boothDb()).delete("rolls", id);
}
