// Messages between a booth page and its room (Durable Object), as JSON over the WebSocket.
// Used by the room server (apps/signal) and the booth pages (booth/session.ts).
// The room only introduces people and relays WebRTC offers / answers / ICE candidates;
// video, countdown and photos go peer-to-peer.

/** Room codes: 4 characters, no look-alikes (0/O, 1/I/L) — D-149. */
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const CODE_LENGTH = 4;
export const MAX_MEMBERS = 8;

export function isRoomCode(s: string) {
  return s.length === CODE_LENGTH && [...s].every((c) => CODE_ALPHABET.includes(c));
}

export interface Member {
  id: string;
  name: string;
  host: boolean;
}

/** Page → room. */
export type ClientMsg =
  | { t: "admit"; id: string } // host only
  | { t: "deny"; id: string } // host only
  | { t: "signal"; to: string; data: unknown }; // members only

/** Room → page. */
export type ServerMsg =
  | { t: "hosting"; you: Member } // you created the room
  | { t: "waiting" } // knocked; the host decides
  | { t: "welcome"; you: Member; members: Member[] } // admitted; `members` excludes you
  | { t: "knock"; id: string; name: string } // to the host: someone wants in
  | { t: "joined"; member: Member }
  | { t: "left"; id: string }
  | { t: "signal"; from: string; data: unknown }
  | { t: "error"; code: "taken" | "not-found" | "full" | "denied" | "closed" | "bad-request" };
