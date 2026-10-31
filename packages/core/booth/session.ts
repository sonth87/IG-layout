import { CODE_ALPHABET, CODE_LENGTH, type ClientMsg, type Member, type ServerMsg } from "./protocol";

// One booth session (lab, /labs/booth — docs/discussions/2026-10-29-photobooth.md).
// The room server (apps/signal) only introduces people; everything else is peer-to-peer:
// a full mesh of RTCPeerConnections, each with the camera tracks and one data channel for
// the countdown and the photos. Each phone shoots its own camera at full resolution and
// sends the JPEG to the others, so everyone ends with every photo.

const ICE: RTCIceServer[] = [{ urls: "stun:stun.cloudflare.com:3478" }];
const CHUNK = 16 * 1024;

export type Status = "connecting" | "waiting" | "in" | "error";
export type ErrorCode = Extract<ServerMsg, { t: "error" }>["code"] | "network";

export interface Peer {
  member: Member;
  stream: MediaStream | null;
  /** RTCPeerConnection.connectionState, to show "connecting… / relay needed". */
  link: RTCPeerConnectionState;
}

/** A shooting run started by the host: `shots` photos, the first `lead` ms after `startAt`,
 * then every `gap`. `members`: who was in the room when it started (whose photos to expect). */
export interface Roll {
  id: number;
  shots: number;
  gap: number;
  lead: number;
  startAt: number; // performance.now() on this device
  frameId?: string;
  members: string[];
}

type PeerMsg =
  | { t: "ready"; on: boolean }
  | { t: "shoot"; roll: number; shots: number; gap: number; lead?: number; delay: number; frameId?: string; order?: string[] }
  | { t: "app"; data: unknown }
  | { t: "frame"; frameId: string; theme?: string }
  | { t: "photo"; roll: number; shot: number; size: number };

interface Link {
  peer: Peer;
  pc: RTCPeerConnection;
  dc: RTCDataChannel;
  queue: Promise<unknown>; // signaling steps run in order (ICE before the remote description fails)
  incoming: { roll: number; shot: number; size: number; parts: ArrayBuffer[]; got: number } | null;
}

export function randomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH));
  return [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

export class BoothSession {
  status: Status = "connecting";
  error: ErrorCode | null = null;
  me: Member | null = null;
  knocks: { id: string; name: string }[] = [];
  /** Admitted members temporarily disconnected (e.g. refreshing page). */
  away = new Map<string, Member>();
  roll: Roll | null = null;
  /** The last roll started (kept after it ends, to know whose photos to wait for). */
  lastRoll: Roll | null = null;
  /** The frame and theme the host picked (the host decides for everyone). */
  frameId: string | null = null;
  theme: string | null = null;
  /** photos[roll][shot][memberId] */
  photos = new Map<number, Map<number, Map<string, Blob>>>();
  /** Who said they're ready for the next roll (owner, 2026-10-31: the host can start once
   * everyone is). Cleared when a roll starts. */
  ready = new Set<string>();

  readonly stream: MediaStream;
  private ws: WebSocket;
  private links = new Map<string, Link>();
  private rollTimers: ReturnType<typeof setTimeout>[] = [];
  private listeners = new Set<() => void>();
  private onShot: (roll: number, shot: number) => Promise<Blob | null>;
  private appListeners = new Set<(from: Member, data: unknown) => void>();
  /** Sending our camera to the others (off while we're not on the room screen: less work). */
  private video = true;

  constructor(opts: { server: string; code: string; name: string; create: boolean; id?: string; stream: MediaStream; onShot: (roll: number, shot: number) => Promise<Blob | null> }) {
    this.stream = opts.stream;
    this.onShot = opts.onShot;
    const q = new URLSearchParams({ name: opts.name });
    if (opts.create) q.set("create", "1");
    if (opts.id) q.set("id", opts.id);
    this.ws = new WebSocket(`${opts.server}/room/${opts.code}?${q}`);
    this.ws.onmessage = (e) => this.onServer(JSON.parse(e.data) as ServerMsg);
    this.ws.onclose = () => {
      if (this.status !== "error" && this.status !== "in") this.fail("network");
    };
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  }

  peers(): Peer[] {
    return [...this.links.values()].map((l) => l.peer);
  }

  /** Everyone in shooting order: host first, then by arrival (including temporarily away members). */
  everyone(): Member[] {
    const active = [...(this.me ? [this.me] : []), ...this.peers().map((p) => p.member)];
    const seen = new Set(active.map((m) => m.id));
    const all = [...active, ...[...this.away.values()].filter((m) => !seen.has(m.id))];
    return all.sort((a, b) => Number(b.host) - Number(a.host));
  }

  /** Say we're ready (or not) for the next roll. */
  setReady(on: boolean) {
    if (!this.me) return;
    if (on) this.ready.add(this.me.id);
    else this.ready.delete(this.me.id);
    for (const l of this.links.values()) sendJson(l.dc, { t: "ready", on });
    this.emit();
  }

  /** Everyone but the host has said they're ready (connected people; nobody away). */
  allReady() {
    return this.away.size === 0 && this.peers().every((p) => p.member.host || this.ready.has(p.member.id)) && (!!this.me?.host || this.ready.has(this.me?.id ?? ""));
  }

  /** Send our camera to the others, or not (the room screen shows it; the print and decorate
   * screens don't — the phone then doesn't encode video for everyone). Voice keeps going. */
  setVideo(on: boolean) {
    if (this.video === on) return;
    this.video = on;
    for (const l of this.links.values()) applyVideo(l.pc, this.stream, on);
  }

  admit(id: string, ok: boolean) {
    this.knocks = this.knocks.filter((k) => k.id !== id);
    this.toServer({ t: ok ? "admit" : "deny", id });
    this.emit();
  }

  /** Host: the frame for everyone (sent now, and to whoever joins later). */
  setFrame(frameId: string, theme = this.theme ?? undefined) {
    if (!this.me?.host) return;
    this.frameId = frameId;
    this.theme = theme ?? null;
    for (const l of this.links.values()) sendJson(l.dc, { t: "frame", frameId, theme });
    this.emit();
  }

  /** Host: start a roll for everyone — the first shot `lead` ms after the start, then every `gap`. */
  shoot(shots = 4, gap = 4000, lead = gap) {
    if (!this.me?.host || this.roll) return;
    const roll = (Math.max(0, ...this.photos.keys()) || 0) + 1;
    const delay = 1500; // time for the message to reach everyone; latency skew is a few tens of ms
    const frameId = this.frameId ?? undefined;
    // The host's order of people, so every phone tiles each shot the same way.
    const order = this.everyone().map((m) => m.id);
    for (const l of this.links.values()) sendJson(l.dc, { t: "shoot", roll, shots, gap, lead, delay, frameId, order });
    this.startRoll(roll, shots, gap, lead, delay, frameId, order);
  }

  /** The app's own messages to everyone in the room (shared decorating). */
  send(data: unknown) {
    for (const l of this.links.values()) sendJson(l.dc, { t: "app", data });
  }

  onData(fn: (from: Member, data: unknown) => void) {
    this.appListeners.add(fn);
    return () => void this.appListeners.delete(fn);
  }

  leave(explicit = true) {
    this.cancelRoll();
    if (explicit) this.toServer({ t: "leave" });
    this.ws.close();
    for (const l of this.links.values()) l.pc.close();
    this.links.clear();
    this.away.clear();
    this.listeners.clear();
    this.appListeners.clear();
  }

  // ---- room server -------------------------------------------------------------------

  private onServer(msg: ServerMsg) {
    switch (msg.t) {
      case "hosting":
        this.me = msg.you;
        this.status = "in";
        break;
      case "waiting":
        this.status = "waiting";
        break;
      case "welcome":
        this.me = msg.you;
        this.status = "in";
        this.away = new Map((msg.away ?? []).map((m) => [m.id, m]));
        // The newcomer calls everyone already there (so two people never offer at once).
        for (const m of msg.members) void this.call(m);
        break;
      case "knock":
        this.knocks = [...this.knocks.filter((k) => k.id !== msg.id), { id: msg.id, name: msg.name }];
        break;
      case "joined":
        this.away.delete(msg.member.id);
        this.links.get(msg.member.id)?.pc.close();
        this.links.delete(msg.member.id);
        this.link(msg.member); // they call us; this keeps their name for when the offer comes
        break;
      case "away":
        this.ready.delete(msg.member.id);
        this.links.get(msg.member.id)?.pc.close();
        this.links.delete(msg.member.id);
        this.away.set(msg.member.id, msg.member);
        if (this.roll) this.cancelRoll();
        break;
      case "host":
        // The host left: someone else hosts now (their phone picks the frame, starts rolls).
        for (const m of [this.me, ...this.peers().map((p) => p.member), ...this.away.values()]) if (m) m.host = m.id === msg.id;
        for (const l of this.links.values()) l.peer = { ...l.peer, member: { ...l.peer.member, host: l.peer.member.id === msg.id } };
        this.ready.clear();
        break;
      case "left":
        this.away.delete(msg.id);
        this.ready.delete(msg.id);
        this.knocks = this.knocks.filter((k) => k.id !== msg.id);
        this.links.get(msg.id)?.pc.close();
        this.links.delete(msg.id);
        break;
      case "signal":
        this.onSignal(msg.from, msg.data as Signal);
        break;
      case "error":
        this.fail(msg.code);
        break;
    }
    this.emit();
  }

  private fail(code: ErrorCode) {
    this.status = "error";
    this.error = code;
    this.emit();
  }

  private toServer(msg: ClientMsg) {
    if (this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
  }

  // ---- WebRTC ------------------------------------------------------------------------

  private link(member: Member): Link {
    const existing = this.links.get(member.id);
    if (existing) return existing;
    const pc = new RTCPeerConnection({ iceServers: ICE });
    for (const track of this.stream.getTracks()) pc.addTrack(track, this.stream);
    applyVideo(pc, this.stream, this.video);
    // Same pre-agreed channel on both sides: no "who creates it" asymmetry.
    const dc = pc.createDataChannel("booth", { negotiated: true, id: 0 });
    dc.binaryType = "arraybuffer";
    const l: Link = { peer: { member, stream: null, link: "new" }, pc, dc, queue: Promise.resolve(), incoming: null };
    pc.onicecandidate = (e) => e.candidate && this.toServer({ t: "signal", to: member.id, data: { ice: e.candidate.toJSON() } });
    pc.ontrack = (e) => {
      l.peer = { ...l.peer, stream: e.streams[0] ?? new MediaStream([e.track]) };
      this.emit();
    };
    pc.onconnectionstatechange = () => {
      l.peer = { ...l.peer, link: pc.connectionState };
      this.emit();
    };
    dc.onmessage = (e) => this.onPeer(l, e.data);
    // The host tells a newcomer which frame is picked; everyone says whether they're ready.
    dc.onopen = () => {
      if (this.me?.host && this.frameId) sendJson(dc, { t: "frame", frameId: this.frameId, theme: this.theme ?? undefined });
      if (this.me && this.ready.has(this.me.id)) sendJson(dc, { t: "ready", on: true });
    };
    this.links.set(member.id, l);
    return l;
  }

  private async call(member: Member) {
    const l = this.link(member);
    l.queue = l.queue.then(async () => {
      await l.pc.setLocalDescription(await l.pc.createOffer());
      this.toServer({ t: "signal", to: member.id, data: { sdp: l.pc.localDescription!.toJSON() } });
    });
  }

  private onSignal(from: string, data: Signal) {
    const l = this.links.get(from);
    if (!l) return; // "joined" (same socket, so always earlier) made the link
    l.queue = l.queue
      .then(async () => {
        if (data.sdp) {
          await l.pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === "offer") {
            await l.pc.setLocalDescription(await l.pc.createAnswer());
            this.toServer({ t: "signal", to: from, data: { sdp: l.pc.localDescription!.toJSON() } });
          }
        } else if (data.ice) await l.pc.addIceCandidate(data.ice);
      })
      .catch((e) => console.warn("booth signal", e));
  }

  // ---- countdown & photos (data channel) ---------------------------------------------

  private onPeer(l: Link, data: string | ArrayBuffer) {
    if (typeof data !== "string") {
      const inc = l.incoming;
      if (!inc) return;
      inc.parts.push(data);
      inc.got += data.byteLength;
      if (inc.got >= inc.size) {
        l.incoming = null;
        this.addPhoto(inc.roll, inc.shot, l.peer.member.id, new Blob(inc.parts, { type: "image/jpeg" }));
      }
      return;
    }
    const msg = JSON.parse(data) as PeerMsg;
    if (msg.t === "ready") {
      if (msg.on) this.ready.add(l.peer.member.id);
      else this.ready.delete(l.peer.member.id);
      this.emit();
    } else if (msg.t === "shoot" && l.peer.member.host) this.startRoll(msg.roll, msg.shots, msg.gap, msg.lead ?? msg.gap, msg.delay, msg.frameId, msg.order);
    else if (msg.t === "app") for (const fn of this.appListeners) fn(l.peer.member, msg.data);
    else if (msg.t === "frame" && l.peer.member.host) {
      this.frameId = msg.frameId;
      this.theme = msg.theme ?? null;
      this.emit();
    } else if (msg.t === "photo") l.incoming = { roll: msg.roll, shot: msg.shot, size: msg.size, parts: [], got: 0 };
  }

  private startRoll(id: number, shots: number, gap: number, lead: number, delay: number, frameId?: string, order?: string[]) {
    this.cancelRoll();
    const startAt = performance.now() + delay;
    this.roll = { id, shots, gap, lead, startAt, frameId, members: order ?? this.everyone().map((m) => m.id) };
    this.lastRoll = this.roll;
    // Ready again for the next one.
    this.ready.clear();
    if (frameId) this.frameId = frameId;
    this.emit();
    for (let shot = 0; shot < shots; shot++) {
      const at = startAt + lead + gap * shot;
      const timer = setTimeout(async () => {
        if (this.roll?.id !== id) return;
        const blob = await this.onShot(id, shot);
        if (this.roll?.id !== id) return;
        if (blob && this.me) {
          this.addPhoto(id, shot, this.me.id, blob);
          for (const l of this.links.values()) void sendBlob(l.dc, { t: "photo", roll: id, shot, size: blob.size }, blob);
        }
        if (shot === shots - 1 && this.roll?.id === id) {
          this.roll = null;
          this.emit();
        }
      }, at - performance.now());
      this.rollTimers.push(timer);
    }
  }

  private cancelRoll() {
    for (const t of this.rollTimers) clearTimeout(t);
    this.rollTimers = [];
    if (this.roll) {
      this.photos.delete(this.roll.id);
      if (this.lastRoll?.id === this.roll.id) this.lastRoll = null;
      this.roll = null;
    }
  }

  private addPhoto(roll: number, shot: number, member: string, blob: Blob) {
    const r = this.photos.get(roll) ?? new Map<number, Map<string, Blob>>();
    const s = r.get(shot) ?? new Map<string, Blob>();
    s.set(member, blob);
    r.set(shot, s);
    this.photos.set(roll, r);
    this.emit();
  }

  private emit() {
    for (const fn of this.listeners) fn();
  }
}

interface Signal {
  sdp?: RTCSessionDescriptionInit;
  ice?: RTCIceCandidateInit;
}

/** The camera as everyone else sees it: a small preview (the photos are shot on each phone at
 * full size), or nothing while `on` is false. No renegotiation: the same sender, its track
 * swapped and its encoding capped. */
function applyVideo(pc: RTCPeerConnection, stream: MediaStream, on: boolean) {
  const track = stream.getVideoTracks()[0] ?? null;
  for (const sender of pc.getSenders()) {
    if (sender.track?.kind === "audio" || (!sender.track && !track)) continue;
    if (sender.track && sender.track.kind !== "video") continue;
    void sender.replaceTrack(on ? track : null).catch(() => {});
    if (!on || !track) continue;
    const w = track.getSettings().width ?? 640;
    const params = sender.getParameters();
    if (!params.encodings?.length) continue;
    params.encodings[0].maxBitrate = 600_000;
    params.encodings[0].maxFramerate = 20;
    params.encodings[0].scaleResolutionDownBy = Math.max(1, w / 640);
    void sender.setParameters(params).catch(() => {});
  }
}

function sendJson(dc: RTCDataChannel, msg: PeerMsg) {
  if (dc.readyState === "open") dc.send(JSON.stringify(msg));
}

/** Header, then the bytes in small chunks (Safari's message limit is low), pausing when the buffer fills. */
async function sendBlob(dc: RTCDataChannel, header: PeerMsg, blob: Blob) {
  if (dc.readyState !== "open") return;
  const bytes = await blob.arrayBuffer();
  dc.send(JSON.stringify(header));
  dc.bufferedAmountLowThreshold = 256 * 1024;
  for (let i = 0; i < bytes.byteLength; i += CHUNK) {
    if (dc.bufferedAmount > 1024 * 1024) await new Promise((r) => dc.addEventListener("bufferedamountlow", r, { once: true }));
    if (dc.readyState !== "open") return;
    dc.send(bytes.slice(i, i + CHUNK));
  }
}
