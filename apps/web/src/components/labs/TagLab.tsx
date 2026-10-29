"use client";

import { useRef, useState } from "react";
import { DEFAULT_TAG, SwitchTag, type TagPhysics } from "@/components/SwitchTag";
import { BOOTH_TAG, BoothTagFace, LAYOUT_TAG, LayoutTagFace } from "@/components/TagFaces";

// Tag lab (/labs/tag, 2026-10-29): the hanging tag that switches IG Layout ↔ booth (D-151),
// on two stand-in home screens, with its physics on sliders to find what feels right on a
// phone. Pull down (or sideways) past the line and let go, or tap.

type App = "layout" | "booth";
const SLIDE_MS = 520;

export function TagLab() {
  const [app, setApp] = useState<App>("layout");
  const [physics, setPhysics] = useState<TagPhysics>(DEFAULT_TAG);
  const [panel, setPanel] = useState(false);
  // How far the other app has come in: follows the pull, then animates to 1 on a switch.
  const [peek, setPeek] = useState(0);
  const [switching, setSwitching] = useState(false);
  const busy = useRef(false);

  function switchApp() {
    if (busy.current) return;
    busy.current = true;
    setSwitching(true);
    setPeek(1);
    setTimeout(() => {
      setApp((a) => (a === "layout" ? "booth" : "layout"));
      setSwitching(false);
      setPeek(0);
      busy.current = false;
    }, SLIDE_MS);
  }

  const other: App = app === "layout" ? "booth" : "layout";
  // While pulling the other app shows a sliver (up to 18 %), on a switch it slides all the way.
  const shown = switching ? 1 : peek * 0.18;
  const ease = switching || peek === 0 ? `transform ${SLIDE_MS}ms cubic-bezier(.2,.8,.2,1)` : "none";

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <div className="absolute inset-0" style={{ transform: `translateX(${-shown * 100}%)`, transition: ease }}>
        <Screen app={app} />
      </div>
      <div className="absolute inset-0 shadow-2xl" style={{ transform: `translateX(${(1 - shown) * 100}%)`, transition: ease }}>
        <Screen app={other} />
      </div>

      {!switching && (
        <SwitchTag
          key={app}
          label={app === "layout" ? "Chuyển sang Photobooth" : "Chuyển sang IG Layout"}
          face={app === "layout" ? <BoothTagFace /> : <LayoutTagFace />}
          {...(app === "layout" ? BOOTH_TAG : LAYOUT_TAG)}
          string={app === "layout" ? "#3d4047" : "#efe6d6"}
          physics={physics}
          onProgress={setPeek}
          onSwitch={switchApp}
        />
      )}

      <button className="fixed bottom-4 right-4 z-50 rounded-full bg-black/70 px-4 py-2 text-sm text-white" onClick={() => setPanel((p) => !p)}>
        {panel ? "Đóng" : "Chỉnh"}
      </button>
      {panel && <Tuner physics={physics} onChange={setPhysics} />}
    </div>
  );
}

/** Stand-ins for the two home screens: enough to judge the tag against each look. */
function Screen({ app }: { app: App }) {
  if (app === "layout")
    return (
      <div className="h-full w-full bg-bg p-5 text-text">
        <p className="mt-10 text-sm text-muted">IG Layout</p>
        <h1 className="mt-1 text-3xl font-semibold">Template</h1>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="aspect-[4/5] rounded-xl bg-surface-2" />
          ))}
        </div>
      </div>
    );
  return (
    <div className="relative h-full w-full p-5" style={{ background: "#15110e", color: "#efe6d6" }}>
      <div className="absolute inset-y-0 left-1.5 w-3" style={{ backgroundImage: "repeating-linear-gradient(#efe6d6 0 14px, transparent 14px 30px)", opacity: 0.8 }} />
      <div className="absolute inset-y-0 right-1.5 w-3" style={{ backgroundImage: "repeating-linear-gradient(#efe6d6 0 14px, transparent 14px 30px)", opacity: 0.8 }} />
      <p className="mt-10 pl-4 font-mono text-xs uppercase tracking-[0.3em] opacity-70">Now showing</p>
      <h1 className="mt-1 pl-4 font-serif text-4xl font-bold">Photobooth</h1>
      <div className="mt-6 flex flex-col gap-3 px-4">
        {["Chụp một mình", "Tạo phòng chụp chung", "Vào phòng bằng mã"].map((t) => (
          <div key={t} className="rounded-lg border border-dashed px-4 py-4 font-mono text-sm uppercase tracking-widest" style={{ borderColor: "#efe6d655" }}>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function Tuner({ physics, onChange }: { physics: TagPhysics; onChange: (p: TagPhysics) => void }) {
  const rows: [keyof TagPhysics, string, number, number, number][] = [
    ["length", "Độ dài dây", 50, 200, 1],
    ["gravity", "Trọng lực", 600, 5000, 50],
    ["damping", "Độ cản (càng cao càng đung đưa lâu)", 0.95, 0.998, 0.001],
    ["threshold", "Kéo xuống thêm bao xa để chuyển", 30, 200, 5],
    ["side", "Kéo ngang bao xa để chuyển (0 = tắt)", 0, 300, 10],
  ];
  return (
    <div className="fixed inset-x-3 bottom-16 z-50 flex flex-col gap-2 rounded-xl bg-black/80 p-4 text-sm text-white">
      {rows.map(([k, label, min, max, step]) => (
        <label key={k} className="flex flex-col">
          <span>
            {label}: <b>{physics[k] as number}</b>
          </span>
          <input type="range" min={min} max={max} step={step} value={physics[k] as number} onChange={(e) => onChange({ ...physics, [k]: Number(e.target.value) })} />
        </label>
      ))}
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={physics.sway} onChange={(e) => onChange({ ...physics, sway: e.target.checked })} /> Gió nhẹ (luôn đung đưa)
      </label>
      <button className="self-start rounded-full border border-white/40 px-3 py-1" onClick={() => onChange(DEFAULT_TAG)}>
        Về mặc định
      </button>
    </div>
  );
}
