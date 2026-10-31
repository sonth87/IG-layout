import { DurableObject } from "cloudflare:workers";
import { isRoomCode, MAX_MEMBERS, type ClientMsg, type Member, type RoomPeek, type ServerMsg } from "@ig-layout/core/booth/protocol";

// Booth signaling (docs/discussions/2026-10-29-photobooth.md).
//   GET /room/AB12?create=1&name=…  → WebSocket; creates room AB12 ("taken" if it exists)
//   GET /room/AB12?name=…           → WebSocket; knocks on room AB12, the host admits or denies
//   GET /room/AB12?peek=1           → JSON { open, full }: is there a room to join (a link's check)
// When the host leaves (or doesn't come back), the next person becomes the host instead of
// the room closing (owner, 2026-10-31); the room closes when nobody is left.
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
    const code = m[1].toUpperCase();
    if (!isRoomCode(code)) return new Response("Bad room code", { status: 400 });
    const peek = url.searchParams.has("peek");
    if (!peek && req.headers.get("Upgrade") !== "websocket") return new Response("Expected a WebSocket", { status: 426 });
    // Rooms are made from Vietnam: keep the object in Asia-Pacific.
    const room = env.ROOM.get(env.ROOM.idFromName(code), { locationHint: "apac" });
    if (peek) {
      const res = await room.fetch(req);
      return new Response(res.body, { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": origin, Vary: "Origin", "Cache-Control": "no-store" } });
    }
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

const RECONNECT_MS = 30_000;
const EMPTY_GRACE_MS = 6_000;

export class Room extends DurableObject<Env> {
  /** Admitted seats that disconnected unexpectedly (e.g. F5 refresh) and may reconnect shortly. */
  private away = new Map<string, { seat: Seat; timer: ReturnType<typeof setTimeout> }>();
  private emptyTimer: ReturnType<typeof setTimeout> | null = null;

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    if (url.searchParams.has("peek")) {
      const admitted = this.seats().filter((s) => s.admitted).length + this.away.size;
      const peek: RoomPeek = { open: admitted > 0 && this.hasHost(), full: admitted >= MAX_MEMBERS };
      return Response.json(peek);
    }
    const name = (url.searchParams.get("name") ?? "").trim().slice(0, 24) || "?";
    const create = url.searchParams.has("create");
    const seatId = (url.searchParams.get("id") ?? "").trim().slice(0, 16);
    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];
    this.ctx.acceptWebSocket(server);

    const fail = (code: Extract<ServerMsg, { t: "error" }>["code"]) => {
      send(server, { t: "error", code });
      server.close(4000, code);
    };

    // Reconnecting after an accidental page refresh (F5) or brief drop.
    if (seatId && this.away.has(seatId)) {
      const saved = this.away.get(seatId)!;
      clearTimeout(saved.timer);
      this.away.delete(seatId);
      if (this.emptyTimer) {
        clearTimeout(this.emptyTimer);
        this.emptyTimer = null;
      }
      const connectedAdmitted = this.seats().filter((s) => s.admitted);
      const seat: Seat = {
        id: saved.seat.id,
        name: name !== "?" ? name : saved.seat.name,
        host: saved.seat.host,
        admitted: true,
      };
      server.serializeAttachment(seat);
      send(server, {
        t: "welcome",
        you: member(seat),
        members: connectedAdmitted.map(member),
        away: [...this.away.values()].map((a) => member(a.seat)),
      });
      if (seat.host) {
        for (const k of this.seats().filter((s) => !s.admitted)) {
          send(server, { t: "knock", id: k.id, name: k.name });
        }
      }
      for (const s of connectedAdmitted) this.sendTo(s.id, { t: "joined", member: member(seat) });
      return new Response(null, { status: 101, webSocket: client });
    }

    const seats = this.seats();
    const connectedAdmitted = seats.filter((s) => s.admitted);
    if (connectedAdmitted.length === 0) {
      if (!create) {
        fail("not-found");
        return new Response(null, { status: 101, webSocket: client });
      }
      this.clearAway();
    }

    const host = seats.find((s) => s.host) ?? [...this.away.values()].map((a) => a.seat).find((s) => s.host);
    const totalAdmitted = connectedAdmitted.length + this.away.size;
    const seat: Seat = { id: seatId || crypto.randomUUID().slice(0, 8), name, host: create, admitted: create };
    if (create && host) fail("taken");
    else if (!create && !host) fail("not-found");
    else if (!create && totalAdmitted >= MAX_MEMBERS) fail("full");
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
    if (!me) return;
    if (msg.t === "leave") {
      this.leaveExplicit(ws, me);
      return;
    }
    if (!me.admitted) return;
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
      if (members.length + this.away.size >= MAX_MEMBERS) return send(ws2, { t: "error", code: "full" });
      seat.admitted = true;
      ws2.serializeAttachment(seat);
      send(ws2, {
        t: "welcome",
        you: member(seat),
        members: members.map(member),
        away: [...this.away.values()].map((a) => member(a.seat)),
      });
      for (const s of members) this.sendTo(s.id, { t: "joined", member: member(seat) });
    }
  }

  async webSocketClose(ws: WebSocket) {
    this.gone(ws);
  }

  async webSocketError(ws: WebSocket) {
    this.gone(ws);
  }

  /** Explicit leave (clicked Leave / Cancel): closes room immediately if host, or removes member. */
  private leaveExplicit(ws: WebSocket, seat: Seat) {
    ws.serializeAttachment(null);
    const saved = this.away.get(seat.id);
    if (saved) {
      clearTimeout(saved.timer);
      this.away.delete(seat.id);
    }
    if (seat.host) {
      this.passHost(seat.id, ws);
      return;
    }
    if (seat.admitted) {
      for (const other of this.ctx.getWebSockets()) {
        if (other !== ws && seatOf(other)?.admitted) send(other, { t: "left", id: seat.id });
      }
      if (this.seats().filter((s) => s.admitted).length === 0) this.clearAway();
    } else {
      this.toHost({ t: "left", id: seat.id });
    }
  }

  /** Unexpected socket close (F5 refresh / drop): hold admitted seats briefly so they can rejoin. */
  private gone(ws: WebSocket) {
    const seat = seatOf(ws);
    if (!seat) return;
    ws.serializeAttachment(null);
    if (!seat.admitted) {
      this.toHost({ t: "left", id: seat.id });
      return;
    }
    for (const other of this.ctx.getWebSockets()) {
      if (other !== ws && seatOf(other)?.admitted) send(other, { t: "away", member: member(seat) });
    }
    const existing = this.away.get(seat.id);
    if (existing) clearTimeout(existing.timer);
    const timer = setTimeout(() => {
      this.away.delete(seat.id);
      if (seat.host) {
        this.passHost(seat.id);
      } else {
        for (const other of this.ctx.getWebSockets()) {
          if (seatOf(other)?.admitted) send(other, { t: "left", id: seat.id });
        }
      }
    }, RECONNECT_MS);
    this.away.set(seat.id, { seat, timer });

    if (this.seats().filter((s) => s.admitted).length === 0) {
      if (this.emptyTimer) clearTimeout(this.emptyTimer);
      this.emptyTimer = setTimeout(() => this.clearAway(), EMPTY_GRACE_MS);
    }
  }

  /** The host is gone for good (`oldId`): the person who's been in the room longest takes over
   * (their phone gets the knocks and the frame picker); nobody left → the room closes.
   * `leaving`: the host's own socket, when they left on purpose. */
  private passHost(oldId: string, leaving?: WebSocket) {
    const next = this.ctx.getWebSockets().find((ws) => ws !== leaving && seatOf(ws)?.admitted);
    const seat = next && seatOf(next);
    if (!next || !seat) {
      this.closeRoom(leaving);
      return;
    }
    seat.host = true;
    next.serializeAttachment(seat);
    for (const other of this.ctx.getWebSockets()) {
      if (other === leaving || !seatOf(other)?.admitted) continue;
      send(other, { t: "left", id: oldId });
      send(other, { t: "host", id: seat.id });
    }
    // Whoever is knocking now asks the new host.
    for (const k of this.seats().filter((s) => !s.admitted)) send(next, { t: "knock", id: k.id, name: k.name });
  }

  private hasHost() {
    return this.seats().some((s) => s.host) || [...this.away.values()].some((a) => a.seat.host);
  }

  private closeRoom(except?: WebSocket) {
    this.clearAway();
    for (const other of this.ctx.getWebSockets()) {
      if (other === except || !seatOf(other)) continue;
      send(other, { t: "error", code: "closed" });
      other.serializeAttachment(null);
      other.close(4000, "closed");
    }
  }

  private clearAway() {
    for (const a of this.away.values()) clearTimeout(a.timer);
    this.away.clear();
    if (this.emptyTimer) {
      clearTimeout(this.emptyTimer);
      this.emptyTimer = null;
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
