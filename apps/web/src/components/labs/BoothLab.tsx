"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { BoothSession, randomCode, type ErrorCode, type Peer } from "@ig-layout/core/booth/session";
import { renderStrip } from "@ig-layout/core/booth/strip";
import { isRoomCode } from "@ig-layout/core/booth/protocol";
import { openCamera, snap } from "@ig-layout/core/booth/camera";
import { syncBoothDocumentMeta } from "@/booth/meta";

// Booth lab (/labs/booth, 2026-10-29): try a shared online photobooth room — room code,
// host lets people in, everyone's camera on screen, one countdown for all, each phone shoots
// its own camera and the photos are swapped peer-to-peer, then one strip (rows = shots,
// columns = people). Not the booth UI: just enough to test the connection on real phones.
// Room server: apps/signal (Cloudflare Durable Object); ?r=AB12 pre-fills the code.

const ERRORS: Record<ErrorCode, string> = {
  taken: "Mã phòng đã có người dùng — thử lại.",
  "not-found": "Không có phòng này (hoặc chủ phòng đã thoát).",
  full: "Phòng đã đủ người.",
  denied: "Chủ phòng không cho vào.",
  closed: "Chủ phòng đã đóng phòng.",
  "bad-request": "Lỗi tin nhắn.",
  network: "Mất kết nối tới máy chủ phòng.",
};

const LINK: Partial<Record<RTCPeerConnectionState, string>> = {
  new: "đang nối…",
  connecting: "đang nối…",
  disconnected: "rớt mạng",
  failed: "không nối được (cần TURN?)",
};

export function BoothLab() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [session, setSession] = useState<BoothSession | null>(null);
  const [fakeCam, setFakeCam] = useState(false);
  const [mirror, setMirror] = useState(true);
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const meVideo = useRef<HTMLVideoElement>(null);
  const mirrorRef = useRef(mirror);
  useEffect(() => {
    mirrorRef.current = mirror;
  }, [mirror]);

  useEffect(() => {
    // Reading the URL once on mount (static export: no server props).
    const r = new URLSearchParams(location.search).get("r");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (r) setCode(r.toUpperCase());
  }, []);
  useEffect(() => session?.subscribe(rerender), [session]);
  useEffect(() => () => session?.leave(false), [session]);
  useEffect(() => {
    const active = session ? code : isRoomCode(code) ? code : null;
    syncBoothDocumentMeta(active, active ? undefined : { title: "Booth lab — IG Layout" });
  }, [session, code]);

  async function start(create: boolean) {
    const { stream, fake } = await openCamera("user", name || "?");
    setFakeCam(fake);
    const roomCode = create ? randomCode() : code.toUpperCase();
    const s = new BoothSession({
      server: SIGNAL_URL,
      code: roomCode,
      name: name.trim() || "Khách",
      create,
      stream,
      onShot: () => (meVideo.current ? snap(meVideo.current, mirrorRef.current) : Promise.resolve(null)),
    });
    setCode(roomCode);
    history.replaceState(null, "", `?r=${roomCode}`);
    setSession(s);
  }

  function leave() {
    session?.leave();
    session?.stream.getTracks().forEach((t) => t.stop());
    history.replaceState(null, "", location.pathname);
    setCode("");
    setSession(null);
  }

  if (!session) {
    const joinable = isRoomCode(code.toUpperCase());
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 bg-bg p-4 text-text">
        <h1 className="text-xl font-semibold">Booth lab — phòng chụp chung</h1>
        <p className="text-sm text-muted">Thử kết nối: mỗi người một khung, đếm ngược chung, mỗi máy tự chụp rồi gửi ảnh cho nhau. Server phòng: {SIGNAL_URL}</p>
        <label className="flex flex-col gap-1 text-sm">
          Tên của bạn
          <input className="rounded-lg border border-border bg-surface px-3 py-2" value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
        </label>
        <button className="rounded-lg bg-accent px-4 py-3 font-semibold text-on-accent" onClick={() => start(true)}>
          Tạo phòng mới
        </button>
        <div className="flex gap-2">
          <input
            className="w-28 rounded-lg border border-border bg-surface px-3 py-2 text-center font-mono text-lg uppercase tracking-widest"
            placeholder="AB12"
            value={code}
            maxLength={4}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <button className="flex-1 rounded-lg border border-border bg-surface px-4 py-2 font-semibold disabled:opacity-40" disabled={!joinable} onClick={() => start(false)}>
            Vào phòng
          </button>
        </div>
      </main>
    );
  }

  const host = session.me?.host;
  const everyone = session.everyone();
  const peers = new Map(session.peers().map((p) => [p.member.id, p]));

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-3 bg-bg p-4 text-text">
      <header className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Phòng</span>
        <span className="font-mono text-2xl font-bold tracking-[0.3em]">{code}</span>
        <button className="rounded-lg border border-border px-3 py-1 text-sm" onClick={() => navigator.clipboard?.writeText(location.href)}>
          Sao chép link
        </button>
        <label className="ml-auto flex items-center gap-1 text-sm">
          <input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} /> Gương
        </label>
        <button className="rounded-lg border border-border px-3 py-1 text-sm" onClick={leave}>
          Thoát
        </button>
      </header>

      {session.status === "connecting" && <p className="text-muted">Đang vào phòng…</p>}
      {session.status === "waiting" && <p className="text-muted">Đang chờ chủ phòng cho vào…</p>}
      {session.status === "error" && <p className="text-danger">{ERRORS[session.error ?? "network"]}</p>}
      {fakeCam && <p className="text-sm text-muted">Không mở được camera — đang dùng camera giả để thử kết nối.</p>}

      {session.knocks.map((k) => (
        <div key={k.id} className="flex items-center gap-2 rounded-lg bg-surface p-3">
          <span className="flex-1">
            <b>{k.name}</b> muốn vào phòng
          </span>
          <button className="rounded-lg bg-accent px-3 py-1 font-semibold text-on-accent" onClick={() => session.admit(k.id, true)}>
            Cho vào
          </button>
          <button className="rounded-lg border border-border px-3 py-1" onClick={() => session.admit(k.id, false)}>
            Từ chối
          </button>
        </div>
      ))}

      <div className="relative grid grid-cols-2 gap-2">
        {everyone.map((m) =>
          m.id === session.me?.id ? (
            <Tile key={m.id} stream={session.stream} label={`${m.name} · bạn`} host={m.host} mirror={mirror} videoRef={meVideo} />
          ) : (
            <PeerTile key={m.id} peer={peers.get(m.id)} name={m.name} host={m.host} />
          ),
        )}
        <Countdown session={session} />
      </div>

      {session.status === "in" &&
        (host ? (
          <button className="rounded-lg bg-accent px-4 py-3 font-semibold text-on-accent disabled:opacity-40" disabled={!!session.roll} onClick={() => session.shoot()}>
            {session.roll ? "Đang chụp…" : `Chụp 4 kiểu (${everyone.length} người)`}
          </button>
        ) : (
          <p className="text-center text-sm text-muted">Chủ phòng bấm chụp — đếm ngược cùng lúc cho cả nhóm.</p>
        ))}

      {[...session.photos.keys()].reverse().map((roll) => (
        <Strip key={roll} session={session} roll={roll} code={code} />
      ))}
    </main>
  );
}

const SIGNAL_URL = process.env.NEXT_PUBLIC_SIGNAL_URL ?? "ws://localhost:8787";

function Tile({ stream, label, host, mirror, videoRef }: { stream: MediaStream | null; label: string; host: boolean; mirror?: boolean; videoRef?: React.RefObject<HTMLVideoElement | null> }) {
  const own = useRef<HTMLVideoElement>(null);
  const ref = videoRef ?? own;
  useEffect(() => {
    if (ref.current && ref.current.srcObject !== stream) ref.current.srcObject = stream;
  }, [ref, stream]);
  return (
    <figure className="m-0 overflow-hidden rounded-lg bg-black">
      <div className="relative aspect-[4/3]">
        <video ref={ref} autoPlay playsInline muted className="h-full w-full object-cover" style={mirror ? { transform: "scaleX(-1)" } : undefined} />
        {host && <span className="absolute left-2 top-2 rounded bg-accent px-2 py-0.5 text-xs font-semibold text-on-accent">★ Chủ phòng</span>}
      </div>
      <figcaption className="bg-surface px-2 py-1 text-sm">{label}</figcaption>
    </figure>
  );
}

function PeerTile({ peer, name, host }: { peer?: Peer; name: string; host: boolean }) {
  const state = peer ? LINK[peer.link] : "đang nối…";
  return <Tile stream={peer?.stream ?? null} label={state ? `${name} · ${state}` : name} host={host} />;
}

/** 3-2-1 before each shot and a white flash on it, from the shared roll timing. */
function Countdown({ session }: { session: BoothSession }) {
  const [now, setNow] = useState(0);
  const roll = session.roll;
  useEffect(() => {
    if (!roll) return;
    let raf = 0;
    const tick = () => {
      setNow(performance.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [roll]);
  if (!roll || !now) return null;
  const t = now - roll.startAt;
  const shot = Math.floor(t / roll.gap); // shot n fires at (n + 1) * gap
  const left = (shot + 1) * roll.gap - t;
  const flash = t > roll.gap && t % roll.gap < 180;
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      {flash && <div className="absolute inset-0 bg-white/90" />}
      {t >= 0 && left <= 3000 && shot < roll.shots && <span className="text-8xl font-bold text-white drop-shadow-lg">{Math.ceil(left / 1000)}</span>}
      <span className="mt-2 rounded bg-black/50 px-2 text-sm text-white">
        Kiểu {Math.min(roll.shots, Math.max(1, shot + 1))}/{roll.shots}
      </span>
    </div>
  );
}

function Strip({ session, roll, code }: { session: BoothSession; roll: number; code: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const shots = session.photos.get(roll);
  const people = session.everyone();
  const got = shots ? [...shots.values()].reduce((n, s) => n + s.size, 0) : 0;
  const expected = (shots?.size ? Math.max(...shots.keys()) + 1 : 0) * people.length;
  useEffect(() => {
    if (!shots) return;
    let alive = true;
    const rows = [...shots.keys()].sort((a, b) => a - b).map((s) => people.map((m) => shots.get(s)?.get(m.id)));
    const date = new Date().toLocaleDateString("vi-VN");
    void renderStrip(rows, `${code} · ${date}`).then((b) => {
      if (!alive) return;
      setUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return URL.createObjectURL(b);
      });
    });
    return () => {
      alive = false;
    };
    // Re-render when a photo arrives (got) or someone joins / leaves (people).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [got, people.length]);
  return (
    <section className="flex flex-col items-center gap-2 rounded-lg bg-surface p-3">
      <p className="text-sm text-muted">
        Lượt {roll}: đã có {got}/{expected} ảnh
      </p>
      {url && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={`Strip lượt ${roll}`} className="max-h-[70vh] w-auto rounded" />
          <a className="rounded-lg bg-accent px-4 py-2 font-semibold text-on-accent" href={url} download={`booth-${code}-${roll}.jpg`}>
            Tải về
          </a>
        </>
      )}
    </section>
  );
}
