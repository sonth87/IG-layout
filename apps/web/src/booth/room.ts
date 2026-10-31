import { useEffect, useReducer } from "react";
import { openCamera, snap, stopCamera } from "@ig-layout/core/booth/camera";
import type { RoomPeek } from "@ig-layout/core/booth/protocol";
import { BoothSession } from "@ig-layout/core/booth/session";

// A group room for the booth (D-148, D-159): the camera with the mic (voice), a hidden
// <video> to shoot from (the room's screens come and go; the shots must not), and the
// session (room server + peer-to-peer mesh). Lives in Booth while you're in the room,
// across the room, result and decorate screens.

export const SIGNAL_URL = process.env.NEXT_PUBLIC_SIGNAL_URL ?? "ws://localhost:8787";

export interface Room {
  code: string;
  session: BoothSession;
  stream: MediaStream;
  fake: boolean;
  /** Opened from the "Shoot as a duo" button on the ticket (starts in the split polaroid view). */
  duo?: boolean;
  /** Rolls already turned into a print (the room screen comes and goes; a roll is printed once). */
  printed: Set<number>;
  setMic: (on: boolean) => void;
  leave: (explicit?: boolean) => void;
}

export async function openRoom(opts: { code: string; name: string; create: boolean; id?: string; duo?: boolean }): Promise<Room> {
  const cam = await openCamera("user", opts.name.slice(0, 1).toUpperCase() || "?", true);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.srcObject = cam.stream;
  void video.play().catch(() => {});
  const session = new BoothSession({
    server: SIGNAL_URL,
    code: opts.code,
    name: opts.name,
    create: opts.create,
    id: opts.id,
    stream: cam.stream,
    // Not mirrored (D-153), full resolution.
    onShot: () => snap(video),
  });
  return {
    code: opts.code,
    session,
    stream: cam.stream,
    fake: cam.fake,
    duo: opts.duo,
    printed: new Set(),
    setMic: (on) => cam.stream.getAudioTracks().forEach((t) => (t.enabled = on)),
    leave: (explicit = true) => {
      session.leave(explicit);
      stopCamera(cam.stream);
      video.srcObject = null;
    },
  };
}

/** Re-render when the session changes. */
export function useSession(room: Room | null) {
  const [, tick] = useReducer((n: number) => n + 1, 0);
  useEffect(() => room?.session.subscribe(tick), [room]);
}

/** Is there a room to join at `code`? Asked before showing the room (owner, 2026-10-31: an old
 * link shouldn't open a waiting screen and then bounce). "unknown" when the server can't say
 * (offline, an older server): the room screen then finds out as before. */
export async function peekRoom(code: string): Promise<"open" | "missing" | "full" | "unknown"> {
  try {
    const res = await fetch(`${SIGNAL_URL.replace(/^ws/, "http")}/room/${code}?peek=1`, { signal: AbortSignal.timeout(6000), cache: "no-store" });
    if (!res.ok) return "unknown";
    const p = (await res.json()) as RoomPeek;
    return !p.open ? "missing" : p.full ? "full" : "open";
  } catch {
    return "unknown";
  }
}
