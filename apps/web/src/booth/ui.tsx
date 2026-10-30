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
  main: "bg-[var(--c-red)] text-[var(--c-paper)] border-[var(--c-ink)]",
  paper: "bg-[var(--c-paper)] text-[var(--c-ink)] border-[var(--c-ink)]",
  ink: "bg-[var(--c-ink)] text-[var(--c-paper)] border-[var(--c-paper)]/70",
  danger: "bg-[var(--c-paper)] text-[var(--c-red)] border-[var(--c-red)]",
};

/** A button printed on paper: hard shadow, sinks into it when pressed. */
export function Btn({ tone = "paper", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button
      type="button"
      {...props}
      className={`${mono} border-2 px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] shadow-[4px_4px_0_var(--c-shadow)] transition-[transform,box-shadow] duration-75 enabled:active:translate-x-[3px] enabled:active:translate-y-[3px] enabled:active:shadow-[1px_1px_0_var(--c-shadow)] disabled:opacity-45 ${TONES[tone]} ${className}`}
    />
  );
}

/** Cream paper card. `notch`: ticket notches on both sides. */
export function Paper({ children, className = "", notch, tilt = 0, style }: { children: ReactNode; className?: string; notch?: boolean; tilt?: number; style?: CSSProperties }) {
  const mask = notch ? "radial-gradient(circle 11px at 0 50%, transparent 10px, #000 11px) left / 51% 100% no-repeat, radial-gradient(circle 11px at 100% 50%, transparent 10px, #000 11px) right / 51% 100% no-repeat" : undefined;
  return (
    <div className={`relative ${className}`} style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined, filter: "drop-shadow(5px 5px 0 #0b0806)", ...style }}>
      <div className="h-full border-2 border-[var(--c-ink)] bg-[var(--c-paper)] text-[var(--c-ink)]" style={{ WebkitMask: mask, mask }}>
        {children}
      </div>
    </div>
  );
}

/** A dashed tear line. */
export function Perforation({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`border-t-2 border-dashed border-[var(--c-ink)]/35 ${className}`} />;
}

/** Small red spaced caps, the ticket's printed labels. */
export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`${mono} text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--c-red)] ${className}`}>{children}</p>;
}

/** The scrolling band at the top, like the text running on a cinema's front. */
export function Ticker({ items }: { items: string[] }) {
  const text = items.map((s) => `✶ ${s} `).join("");
  return (
    <div aria-hidden className="relative overflow-hidden border-b-2 border-[var(--c-shadow)] bg-[#0f0b09] py-2">
      <div className={`${mono} flex w-max animate-[booth-marquee_28s_linear_infinite] whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--c-amber)]`}>
        <span className="pr-6">{text.repeat(3)}</span>
        <span className="pr-6">{text.repeat(3)}</span>
      </div>
    </div>
  );
}

/** A frame of light bulbs that chase around (the marquee sign). Lobby themes (D-164) give it
 * their board colour and bulb colours (several colours take turns along the row). */
export function Bulbs({ children, className = "", colors = ["#ffd88a"], board = "#2a1d16" }: { children: ReactNode; className?: string; colors?: string[]; board?: string }) {
  const n = colors.length;
  const dots = (dir: "x" | "y") =>
    ({
      backgroundImage: colors.map((c) => `radial-gradient(circle, ${c} 0 3px, color-mix(in srgb, ${c} 70%, #000) 3.5px, transparent 4.5px)`).join(", "),
      backgroundSize: colors.map(() => (dir === "x" ? `${18 * n}px 12px` : `12px ${18 * n}px`)).join(", "),
      backgroundPosition: colors.map((_, i) => (dir === "x" ? `${i * 18}px 0` : `0 ${i * 18}px`)).join(", "),
      backgroundRepeat: dir === "x" ? "repeat-x" : "repeat-y",
    }) satisfies CSSProperties;
  return (
    <div className={`relative rounded-[14px] border-2 border-[var(--c-shadow)] p-4 shadow-[5px_5px_0_var(--c-shadow)] ${className}`} style={{ background: board }}>
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
  // The lobby scene's floor (lobby/themes.ts CHROME), cinema by default.
  backgroundColor: `var(--c-floor, ${C.floor})`,
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
