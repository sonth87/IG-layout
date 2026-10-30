"use client";

import type { CSSProperties, ReactNode } from "react";
import { Drift } from "../Mood";
import { Stage } from "../Stage";
import type { LobbyId } from "./themes";

// The lobby's scenes (D-164), drawn in code (SVG + CSS), each with something alive in it:
// Christmas — a snowy night through the window, a tree, string lights that twinkle, snow;
// Tết — swinging red lanterns, branches of yellow apricot blossom, petals falling;
// Halloween — a big moon, a bare tree, a haunted house on the hill, carved pumpkins
// flickering, bats, fog; cyberpunk — a rainy city of neon signs over a glowing grid;
// glitch — a CRT screen with scanlines and blocks of broken colour that jump now and then.
// Behind the ticket and the sign; nothing here can be tapped. Movement stops with "reduce
// motion"; nothing flashes faster than three times a second (WCAG 2.3.1).

/** A scene fills its page; `active` false pauses what moves (pages beside the shown one). */
export function Scene({ id, active }: { id: LobbyId; active: boolean }) {
  const scene: Record<LobbyId, ReactNode> = {
    cinema: <Stage />,
    noel: <Noel active={active} />,
    tet: <Tet active={active} />,
    halloween: <Halloween active={active} />,
    cyber: <Cyber active={active} />,
    glitch: <Glitch />,
  };
  return <div className={`absolute inset-0 ${active ? "" : "[&_*]:[animation-play-state:paused]"}`}>{scene[id]}</div>;
}

const box = "pointer-events-none absolute inset-0 overflow-hidden";
/** A delay that differs per item, so things don't move in step. */
const lag = (i: number, period: number): CSSProperties => ({ animationDelay: `${-((i * 0.37) % 1) * period}s` });

// ── Christmas ────────────────────────────────────────────────────────────────

/** One swag of string lights (the row repeats across the screen). */
function LightSwag({ seed }: { seed: number }) {
  const colors = ["#ff5a5a", "#ffd36e", "#7fd4ff", "#9dff8a", "#ff9ad5"];
  const bulbs = Array.from({ length: 7 }, (_, i) => {
    const t = (i + 0.5) / 7;
    return { x: 200 * t, y: 8 + 46 * 4 * t * (1 - t), c: colors[(i + seed) % colors.length], i };
  });
  return (
    <svg viewBox="0 0 200 80" className="h-auto w-1/2 shrink-0 md:w-1/4 lg:w-1/6">
      <path d="M0 8 Q100 100 200 8" fill="none" stroke="#0d2417" strokeWidth="2.5" />
      {bulbs.map((b) => (
        <g key={b.i} transform={`translate(${b.x} ${b.y}) rotate(${(b.x - 100) / 5})`}>
          <rect x="-2.5" y="-1" width="5" height="5" rx="1" fill="#2a3b2f" />
          <ellipse cy="9" rx="5" ry="7.5" fill={b.c} className="motion-safe:animate-[lobby-twinkle_2.8s_ease-in-out_infinite]" style={{ ...lag(b.i + seed * 3, 2.8), filter: `drop-shadow(0 0 6px ${b.c})` }} />
        </g>
      ))}
    </svg>
  );
}

function Tree() {
  const tiers = [
    { y: 40, w: 70 },
    { y: 95, w: 110 },
    { y: 155, w: 150 },
    { y: 220, w: 190 },
  ];
  const balls = [
    [92, 92, "#e23b3b"], [126, 118, "#ffd36e"], [74, 150, "#7fd4ff"], [130, 176, "#e23b3b"], [60, 205, "#ffd36e"],
    [104, 214, "#ff9ad5"], [150, 238, "#7fd4ff"], [40, 262, "#e23b3b"], [96, 272, "#ffd36e"], [170, 284, "#e23b3b"],
  ] as const;
  return (
    <svg viewBox="0 0 200 330" className="absolute bottom-[3%] left-[-8%] h-[46%] max-h-[560px] md:left-[2%]">
      <defs>
        <linearGradient id="noel-tree" x1="0" x2="1">
          <stop offset="0" stopColor="#0f4a2c" />
          <stop offset="0.5" stopColor="#1f7a47" />
          <stop offset="1" stopColor="#0c3a22" />
        </linearGradient>
      </defs>
      <rect x="88" y="290" width="24" height="34" fill="#5a3a22" />
      {tiers.map((t, i) => (
        <g key={i}>
          <path d={`M100 ${t.y - 60} L${100 + t.w / 2} ${t.y + 50} Q100 ${t.y + 62} ${100 - t.w / 2} ${t.y + 50} Z`} fill="url(#noel-tree)" />
          {/* Snow on the tips. */}
          <path d={`M${100 + t.w / 2 - 14} ${t.y + 44} Q${100 + t.w / 2} ${t.y + 46} ${100 + t.w / 2} ${t.y + 50} Q100 ${t.y + 60} ${100 - t.w / 2} ${t.y + 50} Q${100 - t.w / 2 + 4} ${t.y + 44} ${100 - t.w / 2 + 16} ${t.y + 44} Q100 ${t.y + 54} ${100 + t.w / 2 - 14} ${t.y + 44} Z`} fill="#eef6ff" opacity="0.9" />
        </g>
      ))}
      {balls.map(([x, y, c], i) => (
        <circle key={i} cx={x} cy={y} r="6" fill={c} className="motion-safe:animate-[lobby-twinkle_3.4s_ease-in-out_infinite]" style={{ ...lag(i, 3.4), filter: `drop-shadow(0 0 5px ${c})` }} />
      ))}
      {/* The star. */}
      <path d="M100 -18 L106 -2 L123 -2 L109 8 L115 25 L100 15 L85 25 L91 8 L77 -2 L94 -2 Z" transform="translate(0 6)" fill="#ffd36e" style={{ filter: "drop-shadow(0 0 10px #ffd36e)" }} />
    </svg>
  );
}

function Gifts() {
  return (
    <svg viewBox="0 0 160 100" className="absolute right-[-4%] bottom-[4%] h-[13%] max-h-[170px] md:right-[6%]">
      {[
        [0, 40, 60, 60, "#c62828", "#ffd36e"],
        [52, 20, 56, 80, "#1f7a47", "#fffaf0"],
        [100, 50, 56, 50, "#2f6fb5", "#ff9ad5"],
      ].map(([x, y, w, h, c, r], i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width={w as number} height={h as number} fill={c as string} />
          <rect x={(x as number) + (w as number) / 2 - 4} y={y as number} width="8" height={h as number} fill={r as string} />
          <path d={`M${(x as number) + (w as number) / 2} ${y} q-14 -14 -18 -2 q4 8 18 2 q14 -14 18 -2 q-4 8 -18 2`} fill="none" stroke={r as string} strokeWidth="4" />
        </g>
      ))}
    </svg>
  );
}

function Noel({ active }: { active: boolean }) {
  return (
    <div className={box} style={{ background: "radial-gradient(ellipse 70% 50% at 50% 28%, #22497a 0%, #10284a 55%, #071226 100%)" }}>
      {/* Moon and a glow. */}
      <div className="absolute top-[12%] right-[10%] h-16 w-16 rounded-full md:h-24 md:w-24" style={{ background: "radial-gradient(circle at 38% 38%, #fffdf0, #f2e7bc 62%, #d6c78a)", boxShadow: "0 0 70px 26px rgba(255,248,220,0.22)" }} />
      {/* Far hills with little pines and a lit cabin. */}
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[34%] w-full">
        <path d="M0 140 Q180 70 360 120 T720 100 T1000 120 V300 H0 Z" fill="#bcd3ea" />
        <path d="M0 200 Q240 130 520 190 T1000 170 V300 H0 Z" fill="#e6f0fa" />
        <path d="M0 250 Q300 210 600 245 T1000 235 V300 H0 Z" fill="#f7fbff" />
      </svg>
      <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-[14%] h-[22%] w-full opacity-80">
        {[120, 180, 610, 660, 700, 880].map((x, i) => (
          <path key={i} d={`M${x} ${150 - (i % 3) * 18} l22 60 h-44 Z`} fill="#123a4e" />
        ))}
        <rect x="430" y="150" width="90" height="56" fill="#3a2a22" />
        <path d="M420 152 L475 112 L530 152 Z" fill="#eaf3ff" />
        <rect x="450" y="168" width="18" height="16" fill="#ffd36e" className="motion-safe:animate-[lobby-flicker_5s_ease-in-out_infinite]" style={{ filter: "drop-shadow(0 0 8px #ffb84a)" }} />
        <rect x="484" y="168" width="18" height="16" fill="#ffd36e" style={{ filter: "drop-shadow(0 0 8px #ffb84a)" }} />
      </svg>
      <Drift particles="snow" colors={["#ffffff", "#e6f2ff"]} count={70} active={active} />
      {/* String lights across the top. */}
      <div className="absolute inset-x-0 top-0 flex">
        {Array.from({ length: 6 }, (_, i) => (
          <LightSwag key={i} seed={i} />
        ))}
      </div>
      <Tree />
      <Gifts />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 75% at 50% 45%, transparent 55%, rgba(2,8,20,0.55))" }} />
    </div>
  );
}

// ── Tết ──────────────────────────────────────────────────────────────────────

/** A red lantern swinging on its string; `drop`: extra string above it (CSS length), so on a
 * phone it can hang down beside the line under the sign, clear of the sign. */
function Lantern({ className, period, i, drop = "0px" }: { className: string; period: number; i: number; drop?: string }) {
  return (
    <div className={`absolute top-0 flex origin-top flex-col items-center motion-safe:animate-[lobby-sway_var(--p)_ease-in-out_infinite_alternate] ${className}`} style={{ ["--p" as string]: `${period}s`, ...lag(i, period) }}>
      <span className="w-[2px] shrink-0 bg-[#ffd76a]" style={{ height: drop }} />
      <svg viewBox="0 0 80 190" className="min-h-0 w-auto flex-1">
        <defs>
          <radialGradient id={`lantern-${i}`} cx="0.4" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#ff6a4d" />
            <stop offset="0.55" stopColor="#d4141f" />
            <stop offset="1" stopColor="#7a060c" />
          </radialGradient>
        </defs>
        <line x1="40" y1="0" x2="40" y2="44" stroke="#ffd76a" strokeWidth="2" />
        <rect x="26" y="42" width="28" height="9" rx="2" fill="#e8b23a" />
        <ellipse cx="40" cy="92" rx="34" ry="42" fill={`url(#lantern-${i})`} style={{ filter: "drop-shadow(0 0 16px rgba(255,90,60,0.7))" }} />
        {[-22, -11, 0, 11, 22].map((dx) => (
          <path key={dx} d={`M${40 + dx * 0.4} 52 Q${40 + dx * 1.35} 92 ${40 + dx * 0.4} 132`} fill="none" stroke="#ffd76a" strokeOpacity="0.55" strokeWidth="1.5" />
        ))}
        <rect x="26" y="130" width="28" height="9" rx="2" fill="#e8b23a" />
        <text x="40" y="100" textAnchor="middle" fontSize="22" fontWeight="700" fill="#ffd76a" fontFamily="serif">
          福
        </text>
        {/* The tassel. */}
        <path d="M37 139 h6 l6 46 h-18 Z" fill="#d4141f" />
        <path d="M34 150 V184 M40 150 V186 M46 150 V184" stroke="#ffd76a" strokeOpacity="0.6" strokeWidth="1" />
      </svg>
    </div>
  );
}

/** A branch of yellow apricot blossom (mai), drawn for the bottom-left corner. */
function Mai({ className }: { className: string }) {
  const flowers = [
    [70, 250], [120, 214], [165, 178], [210, 150], [250, 110], [150, 255], [205, 232], [96, 170], [280, 160], [300, 96], [60, 196],
  ];
  const Flower = ({ x, y, r, i }: { x: number; y: number; r: number; i: number }) => (
    <g transform={`translate(${x} ${y}) rotate(${i * 23})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy={-r * 0.9} rx={r * 0.62} ry={r * 0.95} transform={`rotate(${a})`} fill="#ffd12e" stroke="#e8a400" strokeWidth="0.8" />
      ))}
      <circle r={r * 0.38} fill="#f08a00" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <line key={a} x1="0" y1="0" x2="0" y2={-r * 0.75} transform={`rotate(${a})`} stroke="#b35a00" strokeWidth="0.8" />
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 340 340" className={`absolute ${className}`}>
      <path d="M-10 340 C40 300 80 270 120 230 S200 160 300 90" fill="none" stroke="#4a2414" strokeWidth="10" strokeLinecap="round" />
      <path d="M120 230 C150 240 190 240 220 232 M180 175 C190 150 220 135 270 160 M90 260 C80 220 90 190 100 170 M240 125 C260 110 290 100 310 96" fill="none" stroke="#4a2414" strokeWidth="5" strokeLinecap="round" />
      {flowers.map(([x, y], i) => (
        <Flower key={i} x={x} y={y} r={i % 3 ? 11 : 14} i={i} />
      ))}
      {[[140, 196], [230, 140], [85, 230], [262, 118]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="5" ry="7" fill="#9bc23c" transform={`rotate(${i * 40} ${x} ${y})`} />
      ))}
    </svg>
  );
}

function Tet({ active }: { active: boolean }) {
  return (
    <div className={box} style={{ background: "radial-gradient(ellipse 80% 60% at 50% 35%, #dc2533 0%, #a50d1a 52%, #5a040b 100%)" }}>
      {/* Faint gold clouds (a repeating motif). */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.12]">
        <defs>
          <pattern id="tet-cloud" width="160" height="110" patternUnits="userSpaceOnUse">
            <path d="M20 70 q0 -24 24 -24 q6 -22 30 -16 q16 -16 34 2 q24 -4 26 22 q16 4 12 20 Z" fill="none" stroke="#ffd76a" strokeWidth="3" />
            <path d="M60 64 q10 -14 22 -2 M92 58 q8 -10 18 0" fill="none" stroke="#ffd76a" strokeWidth="2.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#tet-cloud)" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-[30%]" style={{ background: "radial-gradient(ellipse 60% 70% at 50% 100%, rgba(255,200,90,0.35), transparent 70%)" }} />
      <Mai className="bottom-[-4%] left-[-12%] h-[40%] md:left-[-2%]" />
      <Mai className="top-[14%] right-[-3%] hidden h-[32%] -scale-x-100 rotate-[160deg] md:block" />
      <Drift particles="petals" colors={["#ffd12e", "#ffe680", "#ffb3c4"]} count={26} active={active} />
      {/* Phone: one lantern on a long string, beside the line under the sign. */}
      <Lantern className="right-[5%] h-[222px] md:hidden" drop="104px" period={4.4} i={1} />
      <Lantern className="hidden h-[22%] max-h-[220px] md:left-[8%] md:flex" period={3.6} i={0} />
      <Lantern className="hidden h-[20%] max-h-[200px] md:left-[20%] md:flex" period={4} i={2} />
      <Lantern className="hidden h-[16%] max-h-[170px] md:right-[19%] md:flex" period={3.2} i={3} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 75% at 50% 45%, transparent 55%, rgba(40,0,4,0.5))" }} />
    </div>
  );
}

// ── Halloween ────────────────────────────────────────────────────────────────

function Pumpkin({ className, i }: { className: string; i: number }) {
  return (
    <svg viewBox="0 0 120 100" className={`absolute ${className}`}>
      <path d="M56 12 q4 -12 14 -10 q-6 6 -6 14 Z" fill="#3b5a1e" />
      {[[-28, 30], [-12, 38], [12, 38], [28, 30]].map(([dx, rx], k) => (
        <ellipse key={k} cx={60 + dx} cy="56" rx={rx} ry="40" fill={k % 3 ? "#f07a12" : "#d9610a"} />
      ))}
      <ellipse cx="60" cy="56" rx="22" ry="41" fill="#ff8c1f" />
      {/* The carved face, lit from inside. */}
      <g fill="#ffd36e" className="motion-safe:animate-[lobby-flicker_3.2s_ease-in-out_infinite]" style={{ ...lag(i, 3.2), filter: "drop-shadow(0 0 6px #ffb02e)" }}>
        <path d="M34 44 l12 -12 l8 14 Z" />
        <path d="M86 44 l-12 -12 l-8 14 Z" />
        <path d="M54 58 l6 -8 l6 8 Z" />
        <path d="M30 66 q30 22 60 0 l-8 4 l-6 -6 l-8 8 l-8 -8 l-8 8 l-8 -8 l-6 6 Z" />
      </g>
    </svg>
  );
}

function Bat({ className, period, i }: { className: string; period: number; i: number }) {
  return (
    <div className={`absolute left-0 motion-safe:animate-[lobby-bat_var(--p)_linear_infinite] ${className}`} style={{ ["--p" as string]: `${period}s`, ...lag(i, period) }}>
      <svg viewBox="0 0 60 26" className="h-full w-auto motion-safe:animate-[lobby-flap_0.5s_ease-in-out_infinite_alternate]">
        <path d="M30 10 q-6 -6 -10 0 q-6 -8 -20 -4 q8 4 8 12 q6 -4 12 2 q4 -6 10 -4 q6 -2 10 4 q6 -6 12 -2 q0 -8 8 -12 q-14 -4 -20 4 q-4 -6 -10 0 Z" fill="#0b0612" />
      </svg>
    </div>
  );
}

function Halloween({ active }: { active: boolean }) {
  return (
    <div className={box} style={{ background: "radial-gradient(ellipse 70% 55% at 72% 18%, #553080 0%, #26133e 45%, #0c0615 100%)" }}>
      <div className="absolute top-[9%] right-[8%] h-24 w-24 rounded-full md:h-36 md:w-36" style={{ background: "radial-gradient(circle at 42% 40%, #fff6d8, #ffd98a 60%, #e0a64a)", boxShadow: "0 0 90px 36px rgba(255,190,90,0.25)" }} />
      {/* A cloud passing over the moon. */}
      <div className="absolute top-[13%] right-[-10%] h-10 w-56 rounded-full bg-[#1b0e2b]/70 blur-md motion-safe:animate-[lobby-cloud_26s_linear_infinite]" />
      <Bat className="top-[20%] h-5" period={13} i={0} />
      <Bat className="top-[30%] h-4" period={17} i={1} />
      <Bat className="top-[15%] h-3" period={21} i={2} />
      {/* The hill, the haunted house, the fence. */}
      <svg viewBox="0 0 1000 400" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[42%] w-full">
        <path d="M0 260 Q260 170 520 230 T1000 200 V400 H0 Z" fill="#170b24" />
        <g transform="translate(640 120)">
          <path d="M0 100 V40 L40 6 L80 40 V100 Z M80 100 V60 L110 34 L140 60 V100 Z M30 8 V-20 h10 V0 Z" fill="#0d0617" />
          {[[16, 52], [50, 52], [96, 70], [118, 70], [33, 76]].map(([x, y], k) => (
            <rect key={k} x={x} y={y} width="12" height="14" fill="#ffc94d" className="motion-safe:animate-[lobby-flicker_4s_ease-in-out_infinite]" style={{ ...lag(k, 4), filter: "drop-shadow(0 0 6px #ffb02e)" }} />
          ))}
        </g>
        <path d="M0 330 Q300 290 620 320 T1000 300 V400 H0 Z" fill="#0b0612" />
        {Array.from({ length: 16 }, (_, k) => (
          <path key={k} d={`M${560 + k * 28} 318 v-40 l7 -10 l7 10 v40 Z`} fill="#0b0612" />
        ))}
        <rect x="556" y="286" width="450" height="6" fill="#0b0612" />
      </svg>
      {/* A bare tree on the left. */}
      <svg viewBox="0 0 200 400" className="absolute bottom-[6%] left-[-10%] h-[56%] md:left-[0%]">
        <path d="M90 400 C96 320 80 260 96 200 C104 170 90 130 70 100 M96 200 C120 170 150 160 180 120 M92 250 C60 230 40 200 20 190 M80 130 C60 110 50 80 56 50 M150 160 C160 140 170 120 196 108 M84 112 C100 90 120 80 130 50" fill="none" stroke="#0b0612" strokeWidth="12" strokeLinecap="round" />
        <path d="M70 100 C60 80 40 70 30 60 M130 50 C134 36 146 28 160 26 M20 190 C10 186 4 176 2 166" fill="none" stroke="#0b0612" strokeWidth="5" strokeLinecap="round" />
      </svg>
      {/* A web in the corner, its spider going up and down. */}
      <svg viewBox="0 0 120 120" className="absolute top-0 left-0 h-28 w-28 opacity-60 md:h-40 md:w-40">
        {[0, 18, 36, 54, 72, 90].map((a) => (
          <line key={a} x1="0" y1="0" x2={120 * Math.cos((a * Math.PI) / 180)} y2={120 * Math.sin((a * Math.PI) / 180)} stroke="#d9cfe8" strokeWidth="0.8" />
        ))}
        {[24, 46, 70, 96].map((r) => (
          <path key={r} d={Array.from({ length: 6 }, (_, k) => `${k ? "Q" : "M"}${k ? `${(r - 6) * Math.cos(((k * 18 - 9) * Math.PI) / 180)} ${(r - 6) * Math.sin(((k * 18 - 9) * Math.PI) / 180)} ` : ""}${r * Math.cos((k * 18 * Math.PI) / 180)} ${r * Math.sin((k * 18 * Math.PI) / 180)}`).join(" ")} fill="none" stroke="#d9cfe8" strokeWidth="0.8" />
        ))}
      </svg>
      <div className="absolute top-0 left-[22%] origin-top motion-safe:animate-[lobby-spider_6s_ease-in-out_infinite_alternate] md:left-[14%]">
        <div className="mx-auto h-24 w-px bg-[#d9cfe8]/60" />
        <svg viewBox="0 0 30 24" className="-mt-1 h-5 w-6">
          <ellipse cx="15" cy="13" rx="6" ry="7" fill="#0b0612" />
          <path d="M9 10 l-8 -6 M9 13 l-8 0 M9 16 l-8 6 M21 10 l8 -6 M21 13 l8 0 M21 16 l8 6" stroke="#0b0612" strokeWidth="1.6" />
        </svg>
      </div>
      <Pumpkin className="bottom-[5%] left-[22%] h-[9%] max-h-[110px] md:left-[30%]" i={0} />
      <Pumpkin className="right-[6%] bottom-[3%] h-[12%] max-h-[140px] md:right-[18%]" i={1} />
      <Pumpkin className="right-[32%] bottom-[2%] hidden h-[7%] md:block" i={2} />
      {/* Fog along the ground. */}
      <div className="absolute inset-x-[-20%] bottom-[-4%] h-[18%] rounded-[50%] bg-[#c9b8e8]/20 blur-2xl motion-safe:animate-[lobby-fog_18s_ease-in-out_infinite_alternate]" />
      <Drift particles="fireflies" colors={["#ff8c2a", "#ffcf6e"]} count={14} active={active} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 75% at 50% 45%, transparent 50%, rgba(4,0,10,0.6))" }} />
    </div>
  );
}

// ── Cyberpunk ────────────────────────────────────────────────────────────────

/** Buildings: a fixed set of widths / heights (no randomness between renders). */
function Skyline({ seed, color, lit, className }: { seed: number; color: string; lit: string[]; className: string }) {
  const rects: { x: number; w: number; h: number }[] = [];
  let x = 0;
  for (let i = 0; x < 1000; i++) {
    const w = 40 + ((i * 37 + seed * 13) % 70);
    const h = 120 + ((i * 53 + seed * 29) % 220);
    rects.push({ x, w, h });
    x += w + 4;
  }
  return (
    <svg viewBox="0 0 1000 400" preserveAspectRatio="xMidYMax slice" className={`absolute inset-x-0 bottom-0 w-full ${className}`}>
      {rects.map((r, i) => (
        <g key={i}>
          <rect x={r.x} y={400 - r.h} width={r.w} height={r.h} fill={color} />
          {Array.from({ length: Math.floor(r.h / 22) * Math.floor(r.w / 14) }, (_, k) => {
            const cols = Math.floor(r.w / 14);
            const cx = r.x + 5 + (k % cols) * 14;
            const cy = 400 - r.h + 8 + Math.floor(k / cols) * 22;
            return (k * 7 + i * 11 + seed) % 5 === 0 ? <rect key={k} x={cx} y={cy} width="6" height="8" fill={lit[(k + i) % lit.length]} opacity="0.75" /> : null;
          })}
        </g>
      ))}
    </svg>
  );
}

function NeonSign({ text, color, className, i, vertical }: { text: string; color: string; className: string; i: number; vertical?: boolean }) {
  return (
    <div
      className={`absolute border-2 px-2 py-1 font-bold tracking-[0.2em] motion-safe:animate-[lobby-neon_var(--p)_linear_infinite] ${vertical ? "[writing-mode:vertical-rl]" : ""} ${className}`}
      style={{ ["--p" as string]: `${5 + i * 1.7}s`, ...lag(i, 5), color, borderColor: color, boxShadow: `0 0 12px ${color}, inset 0 0 10px ${color}`, textShadow: `0 0 8px ${color}, 0 0 18px ${color}`, fontFamily: "var(--font-booth-mono)" }}
    >
      {text}
    </div>
  );
}

function Cyber({ active }: { active: boolean }) {
  return (
    <div className={box} style={{ background: "linear-gradient(180deg, #07021a 0%, #1a0838 45%, #3a0b52 70%, #12041f 100%)" }}>
      <div className="absolute top-[16%] left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-80 md:h-56 md:w-56" style={{ background: "linear-gradient(180deg, #ff4fd8, #ff9a3c)", WebkitMask: "repeating-linear-gradient(180deg, #000 0 10px, transparent 10px 14px)", mask: "repeating-linear-gradient(180deg, #000 0 10px, transparent 10px 14px)", filter: "blur(0.5px) drop-shadow(0 0 30px #ff4fd8)" }} />
      <Skyline seed={3} color="#1d0b3a" lit={["#7a5cff", "#2df6ff"]} className="bottom-[18%] h-[44%] opacity-90" />
      <Skyline seed={8} color="#0b0420" lit={["#ffd36e", "#ff4fd8", "#2df6ff"]} className="bottom-[16%] h-[34%]" />
      <NeonSign text="ẢNH" color="#ff2bd6" className="top-[34%] left-[3%] text-lg md:left-[8%] md:text-2xl" i={0} vertical />
      <NeonSign text="24H" color="#2df6ff" className="top-[44%] right-[4%] text-sm md:right-[10%] md:text-xl" i={1} />
      <NeonSign text="BOOTH" color="#ffe14d" className="top-[56%] left-[2%] hidden text-sm md:block md:left-[16%]" i={2} />
      <NeonSign text="写真" color="#2df6ff" className="top-[28%] right-[6%] hidden text-xl md:block md:right-[20%]" i={3} vertical />
      {/* The grid floor, running towards you; neon spilling on the wet street. */}
      <div className="absolute inset-x-0 bottom-0 h-[18%] overflow-hidden" style={{ perspective: "260px" }}>
        <div
          className="absolute inset-x-[-50%] top-0 h-[300%] origin-top motion-safe:animate-[lobby-grid_2.4s_linear_infinite]"
          style={{ transform: "rotateX(70deg)", backgroundImage: "linear-gradient(#2df6ff 2px, transparent 2px), linear-gradient(90deg, #ff2bd6 2px, transparent 2px)", backgroundSize: "60px 60px", opacity: 0.55 }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(#12041f, transparent 55%)" }} />
      </div>
      <Drift particles="rain" colors={["#9fe8ff", "#d6b3ff"]} active={active} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 75% at 50% 45%, transparent 55%, rgba(4,0,12,0.6))" }} />
    </div>
  );
}

// ── Glitch ───────────────────────────────────────────────────────────────────

/** Blocks of broken colour: each shows for a moment in its own slow cycle. */
const BLOCKS = Array.from({ length: 12 }, (_, i) => ({
  x: (i * 37) % 92,
  y: (i * 59) % 90,
  w: 8 + ((i * 17) % 26),
  h: 1 + ((i * 7) % 5),
  c: ["#00ff9c", "#ff00e1", "#00e1ff", "#ffffff"][i % 4],
  p: 2.6 + ((i * 0.7) % 3),
}));

function Glitch() {
  return (
    <div className={box} style={{ background: "radial-gradient(ellipse 90% 80% at 50% 45%, #10161a 0%, #07090b 60%, #020303 100%)" }}>
      {/* Code raining in columns, faint. */}
      <div className="absolute inset-0 flex justify-around overflow-hidden font-[family-name:var(--font-booth-mono)] text-[11px] leading-[14px] text-[#00ff9c]/25">
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className="motion-safe:animate-[lobby-code_var(--p)_linear_infinite] whitespace-pre" style={{ ["--p" as string]: `${9 + (i % 5) * 2}s`, ...lag(i, 10) }}>
            {Array.from({ length: 80 }, (_, k) => ((i * 7 + k * 13) % 3 ? ((i + k) % 2 ? "1" : "0") : "▚")).join("\n")}
          </div>
        ))}
      </div>
      {/* A big word, its colour channels pulled apart. */}
      <div className="absolute inset-x-0 top-[62%] text-center font-[family-name:var(--font-booth-mono)] text-[22vw] leading-none font-bold text-[#0f1418] md:text-[14vw]" style={{ textShadow: "-4px 0 rgba(255,0,225,0.35), 4px 0 rgba(0,255,225,0.35)" }}>
        <span className="inline-block motion-safe:animate-[lobby-glitch_3.6s_steps(1)_infinite]">B00TH</span>
      </div>
      {BLOCKS.map((b, i) => (
        <span
          key={i}
          className="absolute opacity-0 mix-blend-screen motion-safe:animate-[lobby-block_var(--p)_steps(1)_infinite]"
          style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`, background: b.c, ["--p" as string]: `${b.p}s`, ...lag(i, b.p) }}
        />
      ))}
      {/* Scanlines, a bright band rolling down, the tube's curve. */}
      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(180deg, rgba(255,255,255,0.045) 0 1px, transparent 1px 3px)" }} />
      <div className="absolute inset-x-0 h-24 motion-safe:animate-[lobby-scan_7s_linear_infinite]" style={{ background: "linear-gradient(transparent, rgba(0,255,156,0.07), transparent)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,0.75))" }} />
    </div>
  );
}
