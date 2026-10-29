"use client";

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { useT } from "@/store/settings";

// The booth's own small UI kit (D-150: no shared UI with IG Layout). The look: printed paper
// on a dark cinema floor — cream cards with ink borders and hard offset shadows that press
// down when tapped, ticket notches and perforations, a marquee sign with bulbs.

export const C = {
  floor: "#1a1310",
  ink: "#1d1612",
  paper: "#f3e9d6",
  paper2: "#e7d9bd",
  red: "#c8432f",
  amber: "#eaa63c",
  shadow: "#0b0806",
};

export const serif = "font-[family-name:var(--font-booth-serif)]";
export const mono = "font-[family-name:var(--font-booth-mono)]";
/** Fraunces at its softest and wonkiest: the retro sign face. */
export const display: CSSProperties = { fontVariationSettings: '"SOFT" 100, "WONK" 1', fontWeight: 900 };

type Tone = "main" | "paper" | "ink" | "danger";

const TONES: Record<Tone, string> = {
  main: "bg-[#c8432f] text-[#f3e9d6] border-[#1d1612]",
  paper: "bg-[#f3e9d6] text-[#1d1612] border-[#1d1612]",
  ink: "bg-[#1d1612] text-[#f3e9d6] border-[#f3e9d6]/70",
  danger: "bg-[#f3e9d6] text-[#c8432f] border-[#c8432f]",
};

/** A button printed on paper: hard shadow, sinks into it when pressed. */
export function Btn({ tone = "paper", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button
      type="button"
      {...props}
      className={`${mono} border-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] shadow-[4px_4px_0_#0b0806] transition-[transform,box-shadow] duration-75 enabled:active:translate-x-[3px] enabled:active:translate-y-[3px] enabled:active:shadow-[1px_1px_0_#0b0806] disabled:opacity-45 ${TONES[tone]} ${className}`}
    />
  );
}

/** Cream paper card. `notch`: ticket notches on both sides. */
export function Paper({ children, className = "", notch, tilt = 0, style }: { children: ReactNode; className?: string; notch?: boolean; tilt?: number; style?: CSSProperties }) {
  const mask = notch ? "radial-gradient(circle 11px at 0 50%, transparent 10px, #000 11px) left / 51% 100% no-repeat, radial-gradient(circle 11px at 100% 50%, transparent 10px, #000 11px) right / 51% 100% no-repeat" : undefined;
  return (
    <div className={`relative ${className}`} style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined, filter: "drop-shadow(5px 5px 0 #0b0806)", ...style }}>
      <div className="h-full border-2 border-[#1d1612] bg-[#f3e9d6] text-[#1d1612]" style={{ WebkitMask: mask, mask }}>
        {children}
      </div>
    </div>
  );
}

/** A dashed tear line. */
export function Perforation({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`border-t-2 border-dashed border-[#1d1612]/35 ${className}`} />;
}

/** Small red spaced caps, the ticket's printed labels. */
export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`${mono} text-[11px] font-bold uppercase tracking-[0.3em] text-[#c8432f] ${className}`}>{children}</p>;
}

/** The scrolling band at the top, like the text running on a cinema's front. */
export function Ticker({ items }: { items: string[] }) {
  const text = items.map((s) => `✶ ${s} `).join("");
  return (
    <div aria-hidden className="relative overflow-hidden border-b-2 border-[#0b0806] bg-[#0f0b09] py-2">
      <div className={`${mono} flex w-max animate-[booth-marquee_28s_linear_infinite] whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.3em] text-[#eaa63c]`}>
        <span className="pr-6">{text.repeat(3)}</span>
        <span className="pr-6">{text.repeat(3)}</span>
      </div>
    </div>
  );
}

/** A frame of light bulbs that chase around (the marquee sign). */
export function Bulbs({ children, className = "" }: { children: ReactNode; className?: string }) {
  const dots = (dir: "x" | "y") =>
    ({
      backgroundImage: "radial-gradient(circle, #ffd88a 0 3px, #eaa63c 3.5px, transparent 4.5px)",
      backgroundSize: dir === "x" ? "18px 12px" : "12px 18px",
      backgroundRepeat: dir === "x" ? "repeat-x" : "repeat-y",
    }) satisfies CSSProperties;
  return (
    <div className={`relative rounded-[14px] border-2 border-[#0b0806] bg-[#2a1d16] p-4 shadow-[5px_5px_0_#0b0806] ${className}`}>
      <span aria-hidden className="absolute inset-x-3 top-0.5 h-3 animate-[booth-bulbs_1.2s_steps(2)_infinite]" style={dots("x")} />
      <span aria-hidden className="absolute inset-x-3 bottom-0.5 h-3 animate-[booth-bulbs_1.2s_steps(2)_infinite_0.6s]" style={dots("x")} />
      <span aria-hidden className="absolute inset-y-3 left-0.5 w-3 animate-[booth-bulbs_1.2s_steps(2)_infinite_0.6s]" style={dots("y")} />
      <span aria-hidden className="absolute inset-y-3 right-0.5 w-3 animate-[booth-bulbs_1.2s_steps(2)_infinite]" style={dots("y")} />
      <div className="relative">{children}</div>
    </div>
  );
}

/** The dark cinema floor: warm spotlight from the top, a fine dot texture. */
export const floorStyle: CSSProperties = {
  backgroundColor: C.floor,
  backgroundImage: "radial-gradient(ellipse 80% 45% at 50% -5%, rgba(234,166,60,0.18), transparent 70%), radial-gradient(rgba(243,233,214,0.05) 1px, transparent 1.2px)",
  backgroundSize: "100% 100%, 14px 14px",
};

export function Confirm(props: { title: string; body?: string; yes: string; no: string; danger?: boolean; onYes: () => void; onNo: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6" onClick={props.onNo}>
      <div role="alertdialog" aria-modal="true" aria-label={props.title} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm animate-[booth-pop_0.2s_ease-out]">
        <Paper notch tilt={-1}>
          <div className="p-6 text-center">
            <h2 className={`${serif} text-3xl leading-tight`} style={display}>
              {props.title}
            </h2>
            {props.body && <p className={`${mono} mt-2 text-sm opacity-75`}>{props.body}</p>}
            <div className="mt-5 flex flex-col gap-3">
              <Btn tone="main" onClick={props.onNo}>
                {props.no}
              </Btn>
              <Btn tone={props.danger ? "danger" : "paper"} onClick={props.onYes}>
                {props.yes}
              </Btn>
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
}

export function useFrameName() {
  const t = useT();
  return (id: string) => t(`booth.frame.${id}` as Parameters<typeof t>[0]);
}
