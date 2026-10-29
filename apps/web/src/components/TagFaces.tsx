// The two faces of the hanging switch tag (SwitchTag), each the other app in miniature:
// on IG Layout, a little photobooth strip (film holes, three warm shots, "BOOTH") takes you
// to the booth; in the booth, a white card with a 3 × 3 profile grid ("IG Layout") takes you
// back. Pure CSS, no images.

/** The ring the string goes through (SwitchTag hangs the tag 7 px below its top). */
function Eyelet({ ring, hole }: { ring: string; hole: string }) {
  return <span aria-hidden className="absolute top-[3px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border-[1.5px]" style={{ borderColor: ring, background: hole }} />;
}

export const BOOTH_TAG = { width: 54, height: 92 };

export function BoothTagFace() {
  const holes = "repeating-linear-gradient(180deg, #f3e9d6 0 4px, transparent 4px 8px)";
  const shots = ["linear-gradient(160deg, #f0b27a, #b5452f)", "linear-gradient(160deg, #8fc1d4, #2f4f63)", "linear-gradient(160deg, #f6d2b0, #c4775a)"];
  return (
    <span className="relative block h-full w-full rounded-[3px] border-[1.5px] border-[#0b0806] bg-[#1d1612]">
      <Eyelet ring="#c9b9a0" hole="#0b0806" />
      <span aria-hidden className="absolute top-3.5 bottom-1.5 left-[3px] w-[3px] opacity-80" style={{ backgroundImage: holes }} />
      <span aria-hidden className="absolute top-3.5 right-[3px] bottom-1.5 w-[3px] opacity-80" style={{ backgroundImage: holes }} />
      <span aria-hidden className="absolute inset-x-[9px] top-3.5 flex flex-col gap-[3px]">
        {shots.map((bg) => (
          <span key={bg} className="relative block h-[16px] overflow-hidden" style={{ background: bg }}>
            {/* A tiny figure: head and shoulders. */}
            <span className="absolute bottom-[-3px] left-1/2 h-[8px] w-[12px] -translate-x-1/2 rounded-t-full bg-black/25" />
            <span className="absolute bottom-[4px] left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-black/25" />
          </span>
        ))}
      </span>
      <span className="absolute inset-x-0 bottom-[7px] flex flex-col items-center gap-[2px]">
        <span aria-hidden className="h-px w-3 bg-[#c8432f]" />
        <span className="font-mono text-[7px] font-bold tracking-[0.18em] text-[#f3e9d6]">BOOTH</span>
      </span>
    </span>
  );
}

export const LAYOUT_TAG = { width: 68, height: 84 };

export function LayoutTagFace() {
  const tiles = ["#f2b84b", "#e9e4da", "#f4c9a6", "#9fc6c0", "#f2b84b", "#e9e4da", "#e9e4da", "#c9b7e8", "#f4c9a6"];
  return (
    <span className="relative flex h-full w-full flex-col items-center rounded-[11px] border border-black/10 bg-white pt-4 pb-1.5">
      <Eyelet ring="#b5b8be" hole="#f6f5f2" />
      <span aria-hidden className="grid grid-cols-3 gap-[2px]">
        {tiles.map((c, i) => (
          <span key={i} className="block h-[15px] w-[15px] rounded-[2px]" style={{ background: c }} />
        ))}
      </span>
      <span className="mt-auto text-[9px] font-bold tracking-tight text-[#1a1b1e]">IG Layout</span>
    </span>
  );
}
