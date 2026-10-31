"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { openCamera, stopCamera, type Facing } from "@ig-layout/core/booth/camera";
import type { Camera } from "./CameraView";
import { frameById } from "@ig-layout/core/booth/frames";
import { frameBlob } from "@ig-layout/core/booth/render";
import { saveRoll, type BoothClip, type BoothRoll } from "@ig-layout/core/storage/booth";
import { registerServiceWorker } from "@/lib/pwa";
import { useT } from "@/store/settings";
import { boothMono, boothSerif } from "./fonts";
import { BoothHome } from "./Home";
import { syncBoothDocumentMeta } from "./meta";
import { Pick } from "./Pick";
import { Decorate } from "./Decorate";
import { Result } from "./Result";
import { NamePrompt, RoomScreen } from "./RoomScreen";
import { openRoom, peekRoom, type Room } from "./room";
import { randomCode } from "@ig-layout/core/booth/session";
import { isRoomCode } from "@ig-layout/core/booth/protocol";
import { Setup } from "./Setup";
import { Shoot } from "./Shoot";
import { loadThemeFonts, rollRender, withTheme } from "./look";
import { Mood } from "./Mood";
import { useSharedRoll } from "./share";
import { themeById } from "@ig-layout/core/booth/themes";
import { Btn, Label, Paper, display, floorStyle, mono, serif } from "./ui";
import { COUNTDOWN_S, takesFor } from "./timing";
import { chromeVars, loadLobby, subscribeLobby, type LobbyTheme } from "./lobby/themes";

// The booth app (/booth, D-150 / D-152): its own screens and look (Cinema), sharing logic and
// assets with IG Layout through packages/core. Flow: lobby → frame (camera on) → shoot
// (3 / 5 / 8 s countdown, 2 s rest, D-162) → pick (only with spare shots, D-157 / D-162) → result (print,
// save, retake one shot). Rolls are kept on the device (D-156).

type Screen = "home" | "setup" | "shoot" | "pick" | "result" | "decorate" | "room";

/** What the shoot screen takes: a new roll, or some shots of the current one (retake / fill). */
interface Plan {
  count: number;
  /** Shot indices to replace in the current roll; null = a new roll. */
  targets: number[] | null;
  /** Where to go back to after a retake (the print, or decorating). */
  back?: Screen;
}

interface Prefs {
  /** Shown to the others in a group room. */
  name?: string;
  frameId: string;
  /** The theme new rolls start in (picked before shooting; sets the booth's mood). */
  theme?: string;
  /** Spare shots, then pick (D-162). A new key: on by default even for those who had the old +2 off. */
  spares: boolean;
  /** Seconds counted down before each shot (3 / 5 / 8, D-162). */
  countdown: number;
  sound: boolean;
}

const PREFS_KEY = "ig-layout:booth";

function loadPrefs(): Prefs {
  const base: Prefs = { frameId: "strip4", spares: true, countdown: COUNTDOWN_S, sound: true };
  try {
    return { ...base, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") };
  } catch {
    return base;
  }
}

interface SavedRoomSession {
  code: string;
  id: string;
  name: string;
}

const ROOM_SESSION_KEY = "ig-layout:booth-room";

function loadRoomSession(): SavedRoomSession | null {
  try {
    const raw = sessionStorage.getItem(ROOM_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedRoomSession;
    return parsed && isRoomCode(parsed.code) && parsed.id && parsed.name ? parsed : null;
  } catch {
    return null;
  }
}

function saveRoomSession(s: SavedRoomSession | null) {
  try {
    if (s) sessionStorage.setItem(ROOM_SESSION_KEY, JSON.stringify(s));
    else sessionStorage.removeItem(ROOM_SESSION_KEY);
  } catch {}
}

export function Booth() {
  // Prefs live in localStorage: render on the client only (no flash of the defaults).
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  // The screens take the colours of the lobby's scene (owner, 2026-10-30), as CSS variables.
  const lobby = useSyncExternalStore(subscribeLobby, loadLobby, () => "cinema" as const);
  // overflow: clip — nothing (a focused field, scrollIntoView) can scroll the booth's frame away.
  return (
    <div className={`${boothSerif.variable} ${boothMono.variable} fixed inset-0 overflow-clip text-[var(--c-paper)]`} style={{ ...chromeVars(lobby), ...floorStyle }}>
      {isClient && <BoothApp />}
    </div>
  );
}

function BoothApp() {
  const t = useT();
  const [screen, setScreen] = useState<Screen>("home");
  // Same app, same offline worker as IG Layout (opening /booth first installs it too).
  useEffect(() => void registerServiceWorker(), []);
  const [prefs, setPrefsState] = useState(loadPrefs);
  const [facing, setFacing] = useState<Facing>("user");
  const [camera, setCamera] = useState<Camera | null>(null);
  /** Bumped by "Try the camera again". */
  const [cameraTry, setCameraTry] = useState(0);
  const [roll, setRoll] = useState<BoothRoll | null>(null);
  const [plan, setPlan] = useState<Plan>({ count: 4, targets: null });
  /** All shots of a roll with spares, before picking. */
  const [takes, setTakes] = useState<{ shots: Blob[]; clips: (BoothClip | null)[] }>({ shots: [], clips: [] });
  const frame = frameById(roll && screen !== "setup" ? roll.frameId : prefs.frameId);
  const shootLook = useMemo(() => ({ theme: themeById(plan.targets && roll ? roll.theme : prefs.theme) }), [plan.targets, roll, prefs.theme]);
  /** The group room we're in (kept across the room, print and decorate screens). */
  const [room, setRoom] = useState<Room | null>(null);
  /** The Decorate tab on screen (others in the room see "Mai is decorating · Theme"). */
  const [decorTab, setDecorTab] = useState("theme");
  const shared = useSharedRoll(room, roll, setRoll, screen === "decorate" ? decorTab : null);
  /** A change to the print: shared with the room when it's a group print. */
  const change = (r: BoothRoll) => (room && r.room?.key ? shared.edit(r) : setRoll({ ...r, updatedAt: Date.now() }));
  /** Asking for a name before opening / joining a room. */
  const [askName, setAskName] = useState<{ code: string | null; viaLink?: boolean } | null>(null);

  const setPrefs = (p: Partial<Prefs>) =>
    setPrefsState((old) => {
      const next = { ...old, ...p };
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

  // The camera is on while choosing a frame and shooting, off everywhere else.
  const wantCamera = screen === "setup" || screen === "shoot";
  useEffect(() => {
    if (!wantCamera) return;
    let stream: MediaStream | null = null;
    let gone = false;
    void openCamera(facing, "BOOTH").then((cam) => {
      if (gone) return stopCamera(cam.stream);
      stream = cam.stream;
      setCamera(cam);
    });
    return () => {
      gone = true;
      stopCamera(stream);
      setCamera(null);
    };
  }, [wantCamera, facing, cameraTry]);

  // Keep the roll on the device whenever it changes (D-156) — a moment after the last change,
  // so a run of edits (yours or the room's) doesn't redraw the thumbnail and write each time.
  useEffect(() => {
    if (!roll) return;
    let gone = false;
    const timer = setTimeout(async () => {
      const { frame: f, images, opts } = await rollRender(roll);
      await loadThemeFonts(roll.theme);
      if (gone) return;
      const thumbnail = await frameBlob(f, images, { ...opts, scale: 360 / Math.max(f.width, f.height) });
      if (!gone) await saveRoll({ ...roll, thumbnail });
    }, 600);
    return () => {
      gone = true;
      clearTimeout(timer);
    };
  }, [roll]);

  // In a room, the camera goes to the others only on the room screen (less work while
  // printing / decorating together — owner, 2026-10-31: "khá lag").
  useEffect(() => {
    room?.session.setVideo(screen === "room");
  }, [room, screen]);

  /** Looking up a room code before going in; a code with no room. */
  const [checking, setChecking] = useState<string | null>(null);
  const [noRoom, setNoRoom] = useState<{ code: string; full: boolean } | null>(null);

  async function enterRoom(code: string | null, name: string, viaLink = false) {
    const actualCode = (code ?? randomCode()).toUpperCase();
    const saved = loadRoomSession();
    const id = saved?.code === actualCode ? saved.id : crypto.randomUUID().slice(0, 8);
    saveRoomSession({ code: actualCode, id, name });
    history.replaceState(null, "", `${location.pathname}?r=${actualCode}`);
    const r = await openRoom({ code: actualCode, name, create: !code, id });
    if (viaLink) {
      const bounceIfEnded = () => {
        if (r.session.status === "in" || r.session.status === "waiting") {
          unsub();
        } else if (r.session.status === "error" && (r.session.error === "not-found" || r.session.error === "closed")) {
          unsub();
          r.leave(false);
          saveRoomSession(null);
          history.replaceState(null, "", location.pathname);
          setRoom((cur) => (cur === r ? null : cur));
          setRoll(null);
          setScreen("home");
        }
      };
      const unsub = r.session.subscribe(bounceIfEnded);
      bounceIfEnded();
    }
    setRoom(r);
    setRoll(null);
    setScreen("room");
  }
  function startRoom(code: string | null, viaLink = false) {
    const norm = code?.toUpperCase() ?? null;
    if (!norm) return joinRoom(null, viaLink);
    // A code: is the room there? (On the lobby, with a "looking for the room" card.)
    setChecking(norm);
    void peekRoom(norm).then((r) => {
      setChecking(null);
      if (r === "missing" || r === "full") {
        if (viaLink) history.replaceState(null, "", location.pathname);
        if (loadRoomSession()?.code === norm) saveRoomSession(null);
        setNoRoom({ code: norm, full: r === "full" });
        return;
      }
      joinRoom(norm, viaLink);
    });
  }
  function joinRoom(norm: string | null, viaLink: boolean) {
    const saved = norm ? loadRoomSession() : null;
    const knownName = (saved?.code === norm ? saved.name : undefined) ?? prefs.name;
    if (knownName) void enterRoom(norm, knownName, viaLink);
    else setAskName({ code: norm, viaLink });
  }
  function leaveRoom() {
    room?.leave(true);
    saveRoomSession(null);
    history.replaceState(null, "", location.pathname);
    setRoom(null);
    setRoll(null);
    setScreen("home");
  }
  // A link to a room (/booth?r=AB12) opens or reconnects it straight away (once).
  const linked = useRef(false);
  useEffect(() => {
    if (linked.current) return;
    linked.current = true;
    const r = new URLSearchParams(location.search).get("r")?.toUpperCase();
    if (!r || !isRoomCode(r)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL once on arrival (static export)
    startRoom(r, true);
  });
  // In a room, a roll started by the host brings everyone back to the room screen.
  useEffect(() => {
    if (!room) return;
    return room.session.subscribe(() => {
      if (room.session.roll) setScreen("room");
    });
  }, [room]);
  // Leave the room when the booth unmounts.
  const roomRef = useRef(room);
  useEffect(() => {
    roomRef.current = room;
  });
  useEffect(() => () => roomRef.current?.leave(false), []);

  // Keep <title> and <meta> (description, og:title, og:description, twitter:*) in sync with the active room code.
  const activeRoomCode = room?.code ?? askName?.code ?? null;
  useEffect(() => {
    syncBoothDocumentMeta(
      activeRoomCode,
      activeRoomCode
        ? {
            title: t("booth.room.metaTitle", { code: activeRoomCode }),
            description: t("booth.room.metaDesc", { code: activeRoomCode }),
          }
        : undefined,
    );
  }, [activeRoomCode, t]);

  // Warn before accidentally refreshing or closing the tab while in a room or mid-shoot.
  const warnUnload = (!!room && room.session.status !== "error") || screen === "shoot" || screen === "pick";
  useEffect(() => {
    if (!warnUnload) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [warnUnload]);

  const pickLobby = useCallback((l: LobbyTheme) => setPrefs({ theme: l.print }), []);

  function newRoll(shots: (Blob | null)[], frameId = prefs.frameId, clips?: (BoothClip | null)[]): BoothRoll {
    const now = Date.now();
    return withTheme({ id: crypto.randomUUID(), frameId, shots, clips, flip: false, createdAt: now, updatedAt: now, thumbnail: new Blob() }, themeById(prefs.theme));
  }

  function shootDone(blobs: Blob[], clips: (BoothClip | null)[]) {
    if (plan.targets && roll) {
      const shots = [...roll.shots];
      const rollClips = roll.shots.map((_, i) => roll.clips?.[i] ?? null);
      plan.targets.forEach((t, i) => {
        if (!blobs[i]) return;
        shots[t] = blobs[i];
        rollClips[t] = clips[i] ?? null;
      });
      setRoll({ ...roll, shots, clips: rollClips, updatedAt: Date.now() });
      setScreen(plan.back ?? "result");
    } else if (blobs.length > frame.shots) {
      setTakes({ shots: blobs, clips });
      setScreen("pick");
    } else {
      setRoll(newRoll(blobs, undefined, clips));
      setScreen("result");
    }
  }

  function retake(targets: number[]) {
    setPlan({ count: targets.length, targets });
    setScreen("shoot");
  }

  function upload(files: File[]) {
    const f = frameById(prefs.frameId);
    const shots = Array.from({ length: f.shots }, (_, i) => files[i] ?? null);
    setRoll(newRoll(shots));
    setScreen("result");
  }

  const view = (() => {
  switch (screen) {
    case "home":
      return (
        <BoothHome
          // A lobby scene starts new rolls in its print theme (D-164).
          onTheme={pickLobby}
          onSolo={() => setScreen("setup")}
          onRoom={startRoom}
          onUpload={upload}
          onOpen={(r) => {
            setRoll(r);
            setScreen("result");
          }}
        />
      );
    case "setup":
      return (
        <Setup
          camera={camera}
          facing={facing}
          frameId={prefs.frameId}
          spare={prefs.spares}
          countdown={prefs.countdown}
          onFrame={(frameId) => setPrefs({ frameId })}
          onSpare={(spares) => setPrefs({ spares })}
          onCountdown={(countdown) => setPrefs({ countdown })}
          theme={themeById(prefs.theme).id}
          onTheme={(theme) => setPrefs({ theme })}
          onFacing={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
          onRetryCamera={() => setCameraTry((n) => n + 1)}
          onBack={() => setScreen("home")}
          onStart={() => {
            setPlan({ count: takesFor(frameById(prefs.frameId).shots, prefs.spares), targets: null });
            setRoll(null);
            setScreen("shoot");
          }}
        />
      );
    case "shoot":
      return (
        <Shoot
          camera={camera}
          facing={facing}
          frame={frame}
          plan={plan}
          base={plan.targets ? roll?.shots : undefined}
          look={shootLook}
          countdown={prefs.countdown}
          sound={prefs.sound}
          onSound={(sound) => setPrefs({ sound })}
          onDone={shootDone}
          onExit={() => setScreen(plan.targets ? (plan.back ?? "result") : "setup")}
        />
      );
    case "pick":
      return (
        <Pick
          takes={takes.shots}
          need={frame.shots}
          onDone={(order) => {
            setRoll(
              newRoll(
                order.map((i) => takes.shots[i]),
                undefined,
                order.map((i) => takes.clips[i] ?? null),
              ),
            );
            setTakes({ shots: [], clips: [] });
            setScreen("result");
          }}
        />
      );
    case "decorate":
      return roll ? (
        <Decorate
          roll={roll}
          onChange={change}
          others={shared.others}
          onTab={setDecorTab}
          onDone={() => setScreen("result")}
          onRetake={
            room
              ? undefined
              : (shot) => {
                  setPlan({ count: 1, targets: [shot], back: "decorate" });
                  setScreen("shoot");
                }
          }
        />
      ) : null;
    case "result":
      return roll ? (
        <Result
          roll={roll}
          sound={prefs.sound}
          onChange={change}
          onRetake={room ? undefined : retake}
          onDecorate={() => setScreen("decorate")}
          inRoom={!!room}
          onAgain={() => {
            setRoll(null);
            setScreen(room ? "room" : "setup");
          }}
          onHome={() => {
            setRoll(null);
            setScreen(room ? "room" : "home");
          }}
        />
      ) : null;
    case "room":
      return room ? (
        <RoomScreen
          room={room}
          sound={prefs.sound}
          countdown={prefs.countdown}
          theme={themeById(prefs.theme).id}
          onRoll={(r) => {
            // The host's theme: every phone starts from the same print.
            setRoll(withTheme(r, themeById(room.session.theme ?? prefs.theme)));
            setScreen("result");
          }}
          onLeave={leaveRoom}
        />
      ) : null;
  }
  })();

  // The mood follows the theme: the roll's while printing / decorating, the picked one
  // while choosing / shooting; the lobby stays the booth's own (Cinema).
  const moodTheme =
    screen === "home" ? themeById("cinema") : roll && (screen === "result" || screen === "decorate") ? themeById(roll.theme) : screen === "room" && room?.session.theme ? themeById(room.session.theme) : themeById(prefs.theme);
  return (
    <>
      <div className="relative z-10 h-full" style={{ "--booth-polaroid": moodTheme.mood.polaroid ?? "#f6efe2" } as React.CSSProperties}>
        {view}
      </div>
      {/* After the screen in the page (its canvases come first), behind it on screen. */}
      <Mood theme={moodTheme} />
      {(checking || noRoom) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6" onClick={() => setNoRoom(null)}>
          <div role={noRoom ? "alertdialog" : "status"} aria-label={noRoom ? t("booth.room.noRoom", { code: noRoom.code }) : undefined} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm animate-[booth-pop_0.2s_ease-out]">
            <Paper notch tilt={-1}>
              <div className="p-6 text-center">
                <Label>{t("booth.room.label")} · {checking ?? noRoom?.code}</Label>
                {checking ? (
                  <p className={`${mono} mt-3 animate-pulse text-sm font-bold uppercase tracking-[0.2em]`}>{t("booth.room.looking")}</p>
                ) : (
                  noRoom && (
                    <>
                      <p className={`${serif} mt-2 text-2xl leading-tight`} style={display}>
                        {t(noRoom.full ? "booth.room.err.full" : "booth.room.noRoom", { code: noRoom.code })}
                      </p>
                      {!noRoom.full && <p className={`${mono} mt-2 text-xs opacity-70`}>{t("booth.room.noRoomHint")}</p>}
                      <Btn tone="main" className="mt-5 w-full" onClick={() => setNoRoom(null)}>
                        {t("booth.room.ok")}
                      </Btn>
                    </>
                  )
                )}
              </div>
            </Paper>
          </div>
        </div>
      )}
      {askName && (
        <NamePrompt
          initial={prefs.name ?? ""}
          onCancel={() => {
            if (askName.viaLink) history.replaceState(null, "", location.pathname);
            setAskName(null);
          }}
          onName={(name) => {
            setPrefs({ name });
            setAskName(null);
            void enterRoom(askName.code, name, askName.viaLink);
          }}
        />
      )}
    </>
  );
}
