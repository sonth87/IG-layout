import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { listRolls, saveRoll, type BoothRoll } from "@ig-layout/core/storage/booth";
import type { Room } from "./room";

// Decorating together in a group room (D-148, docs/discussions/2026-10-30-booth-khung-theme.md
// §10). Everyone has the same print (same shots, tiled in the host's order); the look is a
// handful of fields — frame, theme, filter, layout, decorations, caption, flip. A change goes
// to the others peer-to-peer; each field keeps a version (a counter + who), the higher one
// wins, so phones end up the same whatever order messages arrive in. Opening the print asks
// the others for theirs (catch up after being elsewhere). "Who's decorating" goes around
// every few seconds. Zoom and the tab you're on stay yours.

export const SHARED = ["frameId", "theme", "filter", "layout", "decor", "stickers", "title", "showDate", "flip"] as const;
type Field = (typeof SHARED)[number];
type Versions = Partial<Record<Field, { v: number; by: string }>>;

type Msg =
  | { t: "edit" | "state"; key: string; patch: Partial<BoothRoll>; ver: Versions }
  | { t: "ask"; key: string }
  | { t: "here"; key: string; tab: string | null };

export interface Editor {
  id: string;
  name: string;
  /** The Decorate tab they're on. */
  tab: string;
  key: string;
  at: number;
}

const HEARTBEAT = 4000;
const GONE = 11000;

const newer = (a: { v: number; by: string } | undefined, b: { v: number; by: string } | undefined) => !!a && (!b || a.v > b.v || (a.v === b.v && a.by > b.by));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function useSharedRoll(room: Room | null, roll: BoothRoll | null, setRoll: Dispatch<SetStateAction<BoothRoll | null>>, decorating: string | null) {
  const key = room && roll?.room?.key ? roll.room.key : null;
  const versions = useRef(new Map<string, Versions>());
  const [editors, setEditors] = useState<Map<string, Editor>>(new Map());
  const rollRef = useRef(roll);
  useEffect(() => {
    rollRef.current = roll;
  });

  /** Take the fields whose version is higher than ours. Returns the patch actually taken. */
  const merge = useCallback((k: string, patch: Partial<BoothRoll>, ver: Versions) => {
    const mine = versions.current.get(k) ?? {};
    const take: Partial<Record<Field, unknown>> = {};
    for (const f of SHARED) {
      if (!(f in patch) || !newer(ver[f], mine[f])) continue;
      take[f] = patch[f];
      mine[f] = ver[f];
    }
    versions.current.set(k, mine);
    return take as Partial<BoothRoll>;
  }, []);

  useEffect(() => {
    if (!room) return;
    const s = room.session;
    return s.onData((from, data) => {
      const msg = data as Msg;
      const cur = rollRef.current;
      if (msg.t === "here") {
        setEditors((m) => {
          const next = new Map(m);
          if (msg.tab === null) next.delete(from.id);
          else next.set(from.id, { id: from.id, name: from.name, tab: msg.tab, key: msg.key, at: Date.now() });
          return next;
        });
        return;
      }
      if (msg.t === "ask") {
        // Someone opened this print: tell them how ours looks.
        if (cur?.room?.key === msg.key) {
          const patch = Object.fromEntries(SHARED.map((f) => [f, cur[f]])) as Partial<BoothRoll>;
          s.send({ t: "state", key: msg.key, patch, ver: versions.current.get(msg.key) ?? {} } satisfies Msg);
        }
        return;
      }
      const take = merge(msg.key, msg.patch, msg.ver);
      if (!Object.keys(take).length) return;
      if (cur?.room?.key === msg.key) setRoll((r) => (r && r.room?.key === msg.key ? { ...r, ...take, updatedAt: Date.now() } : r));
      else
        // Not the print on screen: update the kept copy.
        void listRolls().then((all) => {
          const kept = all.find((r) => r.room?.key === msg.key);
          if (kept) void saveRoll({ ...kept, ...take, updatedAt: Date.now() });
        });
    });
  }, [room, merge, setRoll]);

  // Opening a shared print: catch up with the others.
  useEffect(() => {
    if (room && key) room.session.send({ t: "ask", key } satisfies Msg);
  }, [room, key]);

  // Who's decorating: say it now and every few seconds; say when we stop.
  useEffect(() => {
    if (!room || !key) return;
    const s = room.session;
    const say = () => s.send({ t: "here", key, tab: decorating } satisfies Msg);
    say();
    if (decorating === null) return;
    const id = setInterval(say, HEARTBEAT);
    return () => {
      clearInterval(id);
      s.send({ t: "here", key, tab: null } satisfies Msg);
    };
  }, [room, key, decorating]);

  // Forget people who stopped saying so (left, phone locked).
  useEffect(() => {
    const id = setInterval(() => setEditors((m) => (([...m.values()].some((e) => Date.now() - e.at > GONE) ? new Map([...m].filter(([, e]) => Date.now() - e.at <= GONE)) : m))), HEARTBEAT);
    return () => clearInterval(id);
  }, []);

  /** A change made here: keep it, send what changed to the others. */
  const edit = useCallback(
    (next: BoothRoll) => {
      const cur = rollRef.current;
      const k = next.room?.key;
      if (room && k && cur && room.session.me) {
        const mine = versions.current.get(k) ?? {};
        const patch: Partial<Record<Field, unknown>> = {};
        const ver: Versions = {};
        for (const f of SHARED) {
          if (same(cur[f], next[f])) continue;
          ver[f] = { v: (mine[f]?.v ?? 0) + 1, by: room.session.me.id };
          mine[f] = ver[f];
          patch[f] = next[f];
        }
        versions.current.set(k, mine);
        if (Object.keys(patch).length) room.session.send({ t: "edit", key: k, patch: patch as Partial<BoothRoll>, ver } satisfies Msg);
      }
      setRoll({ ...next, updatedAt: Date.now() });
    },
    [room, setRoll],
  );

  const others = key ? [...editors.values()].filter((e) => e.key === key && room?.session.peers().some((p) => p.member.id === e.id)) : [];
  return { edit, others };
}
