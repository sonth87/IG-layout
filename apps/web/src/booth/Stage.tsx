// The booth lobby's backdrop (owner, 2026-10-30: "cái nền cho cả trang này"): a theatre stage —
// red velvet curtains drawn back to both sides with gold tie-backs, a scalloped valance with a
// gold fringe, a spotlight falling on the middle, stage boards at the bottom. Pure CSS / SVG,
// scaled to the screen: narrow curtains on a phone (the ticket sits in front), wide ones on a
// computer.

function Curtain({ side }: { side: "left" | "right" }) {
  const id = `fold-${side}`;
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 1000"
      preserveAspectRatio="none"
      className={`absolute top-0 h-full w-[24vw] max-w-[560px] min-w-[84px] md:w-[30vw] ${side === "left" ? "left-0" : "right-0 -scale-x-100"}`}
    >
      <defs>
        {/* Folds: light ridges, dark valleys. */}
        <pattern id={id} width="56" height="1000" patternUnits="userSpaceOnUse">
          <rect width="56" height="1000" fill="#7c121b" />
          <rect x="6" width="18" height="1000" fill="#a81f2a" />
          <rect x="12" width="6" height="1000" fill="#c23440" opacity="0.7" />
          <rect x="34" width="16" height="1000" fill="#5a0b12" />
        </pattern>
        <linearGradient id={`${id}-shade`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.15" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      {/* Drawn back: gathered at the tie-back, falling free below it. */}
      <path d="M0 0 H400 C380 260 250 470 150 600 C210 700 260 840 300 1000 H0 Z" fill={`url(#${id})`} />
      <path d="M0 0 H400 C380 260 250 470 150 600 C210 700 260 840 300 1000 H0 Z" fill={`url(#${id}-shade)`} />
      {/* The tie-back: a gold cord and tassel. */}
      <path d="M0 585 C60 600 120 606 162 598" fill="none" stroke="#e9b44c" strokeWidth="12" strokeLinecap="round" />
      <path d="M0 585 C60 600 120 606 162 598" fill="none" stroke="#fff1b8" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <circle cx="160" cy="600" r="14" fill="#e9b44c" />
      <path d="M152 610 L144 670 H178 L170 610 Z" fill="#d49b33" />
    </svg>
  );
}

export function Stage() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden" style={{ background: "#170d0b" }}>
      {/* Back wall: dark, a warm haze in the middle. */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 55% at 50% 42%, #3a1d14 0%, #1f110d 55%, #120a08 100%)" }} />
      {/* The spotlight from above. */}
      <div
        className="absolute top-0 left-1/2 h-[92%] w-[min(1100px,110vw)] -translate-x-1/2"
        style={{ background: "linear-gradient(180deg, rgba(255,214,140,0.22), rgba(255,214,140,0.04) 80%, transparent)", clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)" }}
      />
      {/* Stage boards and the pool of light on them. */}
      <div className="absolute inset-x-0 bottom-0 h-[16%]" style={{ background: "repeating-linear-gradient(90deg, #3b2316 0 120px, #33200f 120px 124px), linear-gradient(#2a180e, #1a0f08)", backgroundBlendMode: "multiply" }} />
      <div className="absolute bottom-[4%] left-1/2 h-[18%] w-[min(900px,90vw)] -translate-x-1/2 rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgba(255,214,140,0.28), transparent)" }} />
      <div className="absolute inset-x-0 bottom-[16%] h-1.5 bg-[#5c3a22]" />
      <Curtain side="left" />
      <Curtain side="right" />
      {/* The valance: scallops of velvet with a gold fringe, across the top. */}
      <div
        className="absolute inset-x-0 top-0 h-[54px] md:h-[72px]"
        style={{
          background: "radial-gradient(circle at 50% 0, #8f1620 0 38px, #e9b44c 38px 42px, transparent 43px) 0 0 / 84px 54px repeat-x, linear-gradient(#5a0b12, #7c121b)",
          backgroundSize: "84px 100%, 100% 26px",
          backgroundRepeat: "repeat-x, no-repeat",
        }}
      />
    </div>
  );
}
