import { DurableObject } from "cloudflare:workers";
import { isRoomCode, MAX_MEMBERS, type ClientMsg, type Member, type ServerMsg } from "./protocol";

// Booth signaling (docs/discussions/2026-10-29-photobooth.md).
//   GET /room/AB12?create=1&name=…  → WebSocket; creates room AB12 ("taken" if it exists)
//   GET /room/AB12?name=…           → WebSocket; knocks on room AB12, the host admits or denies
// Every request for a code reaches the same Durable Object, wherever it comes from, so the
// room's people can live in that object. Sockets use the Hibernation API: an idle room isn't
// billed, and who's who is kept on each socket (serializeAttachment), not in memory.

interface Env {
  ROOM: DurableObjectNamespace<Room>;
  ALLOWED_ORIGINS: string;
}

const worker = {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname === "/health") return new Response("ok");
    const m = url.pathname.match(/^\/room\/([^/]+)$/);
    if (!m) return new Response("Not found", { status: 404 });
    const origin = req.headers.get("Origin") ?? "";
    if (!allowed(origin, env.ALLOWED_ORIGINS)) return new Response("Forbidden", { status: 403 });
    if (req.headers.get("Upgrade") !== "websocket") return new Response("Expected a WebSocket", { status: 426 });
    const code = m[1].toUpperCase();
    if (!isRoomCode(code)) return new Response("Bad room code", { status: 400 });
    // Rooms are made from Vietnam: keep the object in Asia-Pacific.
    const room = env.ROOM.get(env.ROOM.idFromName(code), { locationHint: "apac" });
    return room.fetch(req);
  },
};

export default worker;

/** "https://a.app,http://localhost:*" — `:*` is any port. */
function allowed(origin: string, list: string) {
  return list.split(",").some((o) => (o.endsWith(":*") ? origin.startsWith(o.slice(0, -1)) && /^\d+$/.test(origin.slice(o.length - 1)) : o === origin));
}

/** Kept on each socket, so it survives hibernation. */
interface Seat extends Member {
  admitted: boolean;
}

export class Room extends DurableObject<Env> {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const name = (url.searchParams.get("name") ?? "").trim().slice(0, 24) || "?";
    const create = url.searchParams.has("create");
    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];
    this.ctx.acceptWebSocket(server);

    const seats = this.seats();
    const host = seats.find((s) => s.host);
    const fail = (code: Extract<ServerMsg, { t: "error" }>["code"]) => {
      send(server, { t: "error", code });
      server.close(4000, code);
    };
    const seat: Seat = { id: crypto.randomUUID().slice(0, 8), name, host: create, admitted: create };
    if (create && host) fail("taken");
    else if (!create && !host) fail("not-found");
    else if (!create && seats.filter((s) => s.admitted).length >= MAX_MEMBERS) fail("full");
    else {
      server.serializeAttachment(seat);
      if (create) send(server, { t: "hosting", you: member(seat) });
      else {
        send(server, { t: "waiting" });
        this.toHost({ t: "knock", id: seat.id, name });
      }
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    const me = seatOf(ws);
    let msg: ClientMsg;
    try {
      msg = JSON.parse(typeof raw === "string" ? raw : new TextDecoder().decode(raw));
    } catch {
      return send(ws, { t: "error", code: "bad-request" });
    }
    if (!me?.admitted) return;
    if (msg.t === "signal") {
      const to = this.socket(msg.to);
      if (to && seatOf(to)?.admitted) send(to, { t: "signal", from: me.id, data: msg.data });
    } else if ((msg.t === "admit" || msg.t === "deny") && me.host) {
      const ws2 = this.socket(msg.id);
      const seat = ws2 && seatOf(ws2);
      if (!ws2 || !seat || seat.admitted) return;
      if (msg.t === "deny") {
        send(ws2, { t: "error", code: "denied" });
        ws2.close(4000, "denied");
        return;
      }
      const members = this.seats().filter((s) => s.admitted);
      if (members.length >= MAX_MEMBERS) return send(ws2, { t: "error", code: "full" });
      seat.admitted = true;
      ws2.serializeAttachment(seat);
      send(ws2, { t: "welcome", you: member(seat), members: members.map(member) });
      for (const s of members) this.sendTo(s.id, { t: "joined", member: member(seat) });
    }
  }

  async webSocketClose(ws: WebSocket) {
    this.gone(ws);
  }

  async webSocketError(ws: WebSocket) {
    this.gone(ws);
  }

  /** Someone left. The host leaving closes the room (the photos are on everyone's phone already). */
  private gone(ws: WebSocket) {
    const seat = seatOf(ws);
    if (!seat) return;
    ws.serializeAttachment(null);
    for (const other of this.ctx.getWebSockets()) {
      if (other === ws || !seatOf(other)) continue;
      if (seat.host) {
        send(other, { t: "error", code: "closed" });
        other.serializeAttachment(null);
        other.close(4000, "closed");
      } else if (seat.admitted && seatOf(other)?.admitted) send(other, { t: "left", id: seat.id });
    }
  }

  private seats(): Seat[] {
    return this.ctx.getWebSockets().map(seatOf).filter((s): s is Seat => !!s);
  }

  private socket(id: string) {
    return this.ctx.getWebSockets().find((ws) => seatOf(ws)?.id === id);
  }

  private sendTo(id: string, msg: ServerMsg) {
    const ws = this.socket(id);
    if (ws) send(ws, msg);
  }

  private toHost(msg: ServerMsg) {
    const host = this.ctx.getWebSockets().find((ws) => seatOf(ws)?.host);
    if (host) send(host, msg);
  }
}

function seatOf(ws: WebSocket): Seat | null {
  return (ws.deserializeAttachment() as Seat | null) ?? null;
}

function member({ id, name, host }: Seat): Member {
  return { id, name, host };
}

function send(ws: WebSocket, msg: ServerMsg) {
  try {
    ws.send(JSON.stringify(msg));
  } catch {
    // closed meanwhile
  }
}
