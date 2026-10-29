"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { openCamera, stopCamera, type Facing } from "@ig-layout/core/booth/camera";
import type { Camera } from "./CameraView";
import { frameById } from "@ig-layout/core/booth/frames";
import { frameBlob } from "@ig-layout/core/booth/render";
import { saveRoll, type BoothRoll } from "@ig-layout/core/storage/booth";
import { registerServiceWorker } from "@/lib/pwa";
import { boothMono, boothSerif } from "./fonts";
import { BoothHome } from "./Home";
import { Pick } from "./Pick";
import { Decorate } from "./Decorate";
import { Result } from "./Result";
import { Setup } from "./Setup";
import { Shoot } from "./Shoot";
import { loadThemeFonts, rollRender } from "./look";
import { floorStyle } from "./ui";
import { SPARE } from "./timing";

// The booth app (/booth, D-150 / D-152): its own screens and look (Cinema), sharing logic and
// assets with IG Layout through packages/core. Flow: lobby → frame (camera on) → shoot
// (8 s countdown, 2 s rest, D-154) → pick (only with spare shots, D-157) → result (print,
// save, retake one shot). Rolls are kept on the device (D-156).

type Screen = "home" | "setup" | "shoot" | "pick" | "result" | "decorate";

/** What the shoot screen takes: a new roll, or some shots of the current one (retake / fill). */
interface Plan {
  count: number;
  /** Shot indices to replace in the current roll; null = a new roll. */
  targets: number[] | null;
}

interface Prefs {
  frameId: string;
  spare: boolean;
  sound: boolean;
}

const PREFS_KEY = "ig-layout:booth";

function loadPrefs(): Prefs {
  const base: Prefs = { frameId: "strip4", spare: false, sound: true };
  try {
    return { ...base, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") };
  } catch {
    return base;
  }
}

export function Booth() {
  // Prefs live in localStorage: render on the client only (no flash of the defaults).
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return (
    <div className={`${boothSerif.variable} ${boothMono.variable} fixed inset-0 overflow-hidden text-[#f3e9d6]`} style={floorStyle}>
      {isClient && <BoothApp />}
    </div>
  );
}

function BoothApp() {
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
  const [takes, setTakes] = useState<Blob[]>([]);
  const frame = frameById(roll && screen !== "setup" ? roll.frameId : prefs.frameId);

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

  // Keep the roll on the device whenever it changes (D-156).
  useEffect(() => {
    if (!roll) return;
    let gone = false;
    void (async () => {
      const { frame: f, images, opts } = await rollRender(roll);
      await loadThemeFonts(roll.theme);
      if (gone) return;
      const thumbnail = await frameBlob(f, images, { ...opts, scale: 360 / Math.max(f.width, f.height) });
      if (!gone) await saveRoll({ ...roll, thumbnail });
    })();
    return () => {
      gone = true;
    };
  }, [roll]);

  function newRoll(shots: (Blob | null)[], frameId = prefs.frameId): BoothRoll {
    const now = Date.now();
    return { id: crypto.randomUUID(), frameId, shots, flip: false, createdAt: now, updatedAt: now, thumbnail: new Blob() };
  }

  function shootDone(blobs: Blob[]) {
    if (plan.targets && roll) {
      const shots = [...roll.shots];
      plan.targets.forEach((t, i) => (shots[t] = blobs[i] ?? shots[t]));
      setRoll({ ...roll, shots, updatedAt: Date.now() });
      setScreen("result");
    } else if (blobs.length > frame.shots) {
      setTakes(blobs);
      setScreen("pick");
    } else {
      setRoll(newRoll(blobs));
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

  switch (screen) {
    case "home":
      return (
        <BoothHome
          onSolo={() => setScreen("setup")}
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
          spare={prefs.spare}
          onFrame={(frameId) => setPrefs({ frameId })}
          onSpare={(spare) => setPrefs({ spare })}
          onFacing={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
          onRetryCamera={() => setCameraTry((n) => n + 1)}
          onBack={() => setScreen("home")}
          onStart={() => {
            setPlan({ count: frameById(prefs.frameId).shots + (prefs.spare ? SPARE : 0), targets: null });
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
          sound={prefs.sound}
          onSound={(sound) => setPrefs({ sound })}
          onDone={shootDone}
          onExit={() => setScreen(plan.targets ? "result" : "setup")}
        />
      );
    case "pick":
      return (
        <Pick
          takes={takes}
          need={frame.shots}
          onDone={(order) => {
            setRoll(newRoll(order.map((i) => takes[i])));
            setTakes([]);
            setScreen("result");
          }}
        />
      );
    case "decorate":
      return roll ? <Decorate roll={roll} onChange={(r) => setRoll({ ...r, updatedAt: Date.now() })} onDone={() => setScreen("result")} /> : null;
    case "result":
      return roll ? (
        <Result
          roll={roll}
          sound={prefs.sound}
          onChange={(r) => setRoll({ ...r, updatedAt: Date.now() })}
          onRetake={retake}
          onDecorate={() => setScreen("decorate")}
          onAgain={() => {
            setRoll(null);
            setScreen("setup");
          }}
          onHome={() => {
            setRoll(null);
            setScreen("home");
          }}
        />
      ) : null;
  }
}
