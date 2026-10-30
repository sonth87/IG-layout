// The booth lobby's backdrop (owner, 2026-10-30: "cái nền cho cả trang này"; then "chưa đẹp,
// chưa tự nhiên"): a theatre stage. Velvet curtains whose folds are soft light-to-shadow
// gradients, gathered at a gold tie-back and flaring out below it; a valance of draped swags
// with a gold fringe and tassels; a soft-edged spotlight with dust in it; perspective stage
// boards with footlights. SVG, sized to the screen: narrow curtains on a phone (the ticket
// sits in front), wide ones on a computer.

const FOLDS = 9;

/** One curtain, drawn for the left side (the right one is mirrored). viewBox 400 × 1000. */
function Curtain({ side }: { side: "left" | "right" }) {
  const id = `velvet-${side}`;
  const tie = { x: 150, y: 600 };
  // Each fold: a strip from the top, squeezed into the tie-back, flaring out to the floor.
  const folds = Array.from({ length: FOLDS }, (_, i) => {
    const a = (i / FOLDS) * 400;
    const b = ((i + 1) / FOLDS) * 400;
    const g = (x: number) => tie.x * 0.25 + x * 0.3; // squeezed at the tie
    const f = (x: number) => x * 0.78 - 10 + (x / 400) * 40; // flared at the floor
    const sag = 40 + (i / FOLDS) * 140; // the inner folds swing further in above the tie
    return `M${a} -2 C${a} 200 ${g(a) + sag * 0.4} ${tie.y - 220} ${g(a)} ${tie.y} C${g(a) - 10} ${tie.y + 160} ${f(a)} ${tie.y + 260} ${f(a)} 1002 L${f(b)} 1002 C${f(b)} ${tie.y + 260} ${g(b) - 10} ${tie.y + 160} ${g(b)} ${tie.y} C${g(b) + sag * 0.4} ${tie.y - 220} ${b} 200 ${b} -2 Z`;
  });
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 1000"
      preserveAspectRatio="none"
      className={`absolute top-0 h-full w-[26vw] max-w-[560px] min-w-[92px] md:w-[30vw] ${side === "left" ? "left-0" : "right-0 -scale-x-100"}`}
    >
      <defs>
        {[0, 1, 2].map((v) => (
          <linearGradient key={v} id={`${id}-${v}`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#3e050c" />
            <stop offset={0.3 + v * 0.05} stopColor="#8a1220" />
            <stop offset={0.48 + v * 0.04} stopColor={["#c22a37", "#b5202f", "#cf3a45"][v]} />
            <stop offset={0.66} stopColor="#7a0f1b" />
            <stop offset="1" stopColor="#36040a" />
          </linearGradient>
        ))}
        {/* Light from the stage on the inner edge; shadow at the top (under the valance) and at the floor. */}
        <linearGradient id={`${id}-light`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#ffb36b" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id={`${id}-depth`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.55" />
          <stop offset="0.18" stopColor="#000" stopOpacity="0" />
          <stop offset="0.85" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id={`${id}-gold`} cx="0.35" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.45" stopColor="#e9b44c" />
          <stop offset="1" stopColor="#8a5a1a" />
        </radialGradient>
      </defs>
      <clipPath id={`${id}-shape`}>
        {folds.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </clipPath>
      {folds.map((d, i) => (
        <path key={i} d={d} fill={`url(#${id}-${i % 3})`} />
      ))}
      {/* Shading only on the cloth, not the empty part of the box. */}
      <g clipPath={`url(#${id}-shape)`}>
        <rect width="400" height="1000" fill={`url(#${id}-light)`} />
        <rect width="400" height="1000" fill={`url(#${id}-depth)`} />
      </g>
      {/* The tie-back: a twisted gold cord, a knot and a tassel. */}
      <path d={`M-4 ${tie.y - 14} C60 ${tie.y + 8} 120 ${tie.y + 12} ${tie.x + 10} ${tie.y + 2}`} fill="none" stroke="#8a5a1a" strokeWidth="14" strokeLinecap="round" />
      <path d={`M-4 ${tie.y - 14} C60 ${tie.y + 8} 120 ${tie.y + 12} ${tie.x + 10} ${tie.y + 2}`} fill="none" stroke="#e9b44c" strokeWidth="9" strokeLinecap="round" strokeDasharray="10 6" />
      <circle cx={tie.x + 10} cy={tie.y + 4} r="13" fill={`url(#${id}-gold)`} />
      <path d={`M${tie.x + 2} ${tie.y + 14} Q${tie.x + 10} ${tie.y + 22} ${tie.x + 18} ${tie.y + 14} L${tie.x + 26} ${tie.y + 82} Q${tie.x + 10} ${tie.y + 90} ${tie.x - 6} ${tie.y + 82} Z`} fill={`url(#${id}-gold)`} />
      <path d={`M${tie.x - 2} ${tie.y + 40} V${tie.y + 80} M${tie.x + 6} ${tie.y + 40} V${tie.y + 84} M${tie.x + 14} ${tie.y + 40} V${tie.y + 84} M${tie.x + 22} ${tie.y + 40} V${tie.y + 80}`} stroke="#8a5a1a" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

/** The valance: draped swags (a repeating 320-px unit), a gold fringe, tassels between swags. */
function Valance() {
  return (
    <svg aria-hidden className="absolute inset-x-0 top-0 h-[78px] w-full md:h-[104px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id="swag" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4a0610" />
          <stop offset="0.55" stopColor="#a5182a" />
          <stop offset="0.8" stopColor="#c8303d" />
          <stop offset="1" stopColor="#6a0b16" />
        </linearGradient>
        <pattern id="swags" width="320" height="104" patternUnits="userSpaceOnUse">
          <rect width="320" height="34" fill="#3e050c" />
          <path d="M-6 20 Q160 120 326 20 L326 0 L-6 0 Z" fill="url(#swag)" />
          {/* Fabric folds following the drape. */}
          <path d="M20 26 Q160 104 300 26 M50 22 Q160 84 270 22 M90 20 Q160 60 230 20" fill="none" stroke="#2e0308" strokeOpacity="0.45" strokeWidth="4" />
          <path d="M30 28 Q160 100 290 28" fill="none" stroke="#e05a63" strokeOpacity="0.35" strokeWidth="2" />
          {/* Fringe along the hem. */}
          <path d="M-6 20 Q160 120 326 20" fill="none" stroke="#e9b44c" strokeWidth="6" strokeDasharray="2 4" />
          <path d="M-6 17 Q160 116 326 17" fill="none" stroke="#c99a3a" strokeWidth="3" />
          {/* A tassel where two swags meet. */}
          <circle cx="0" cy="24" r="8" fill="#e9b44c" />
          <path d="M-6 30 L6 30 L9 62 L-9 62 Z" fill="#d49b33" />
        </pattern>
        <linearGradient id="valance-shadow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#swags)" />
    </svg>
  );
}

/** Specks of dust drifting in the beam. */
const DUST = Array.from({ length: 26 }, (_, i) => ({
  x: 44 + ((i * 37) % 23) - 11 + Math.sin(i * 7.3) * 6,
  y: 8 + ((i * 53) % 70),
  r: 0.8 + ((i * 13) % 5) * 0.35,
  d: 9 + ((i * 7) % 9),
  delay: -((i * 11) % 13),
}));

export function Stage() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ background: "#120907" }}>
      {/* Back wall: dark, warmed where the light falls. */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 60% at 50% 38%, #3d1e14 0%, #22120c 50%, #110806 100%)" }} />
      {/* The spotlight: soft-edged, fading as it falls. */}
      <div
        className="absolute top-[-4%] left-1/2 h-[96%] w-[min(1200px,120vw)] -translate-x-1/2 blur-[18px]"
        style={{ background: "linear-gradient(180deg, rgba(255,219,150,0.26), rgba(255,219,150,0.08) 70%, transparent)", clipPath: "polygon(40% 0, 60% 0, 96% 100%, 4% 100%)" }}
      />
      {DUST.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[#ffe7b0] motion-safe:animate-[booth-dust_var(--d)_ease-in-out_infinite]"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.r * 2, height: d.r * 2, opacity: 0.35, ["--d" as string]: `${d.d}s`, animationDelay: `${d.delay}s` }}
        />
      ))}
      {/* Stage: boards running to the back, the lip, footlights, the pool of light. */}
      <div className="absolute inset-x-0 bottom-0 h-[17%] overflow-hidden" style={{ perspective: "500px" }}>
        <div
          className="absolute inset-x-[-20%] top-0 h-[260%] origin-top"
          style={{
            transform: "rotateX(62deg)",
            background: "repeating-linear-gradient(90deg, #4a2c18 0 86px, #3a2212 86px 90px), linear-gradient(#5a3820, #2a170c)",
            backgroundBlendMode: "multiply",
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.6))" }} />
      </div>
      <div className="absolute bottom-[3%] left-1/2 h-[20%] w-[min(1000px,95vw)] -translate-x-1/2 rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgba(255,214,150,0.3), transparent)" }} />
      <div className="absolute inset-x-0 bottom-[17%] h-2" style={{ background: "linear-gradient(#7a4a26, #3a2212)" }} />
      <div className="absolute inset-x-[8%] bottom-[16.2%] flex justify-between">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="h-2 w-6 rounded-t-full bg-[#ffd98a] shadow-[0_-6px_18px_6px_rgba(255,200,120,0.35)]" />
        ))}
      </div>
      <Curtain side="left" />
      <Curtain side="right" />
      <Valance />
      {/* A vignette pulls the eye to the middle. */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 75% 75% at 50% 45%, transparent 55%, rgba(0,0,0,0.5))" }} />
    </div>
  );
}
