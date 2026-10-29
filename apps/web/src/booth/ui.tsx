"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useT } from "@/store/settings";

// The booth's own small UI kit (Cinema look; D-150: no shared UI with IG Layout).

export const serif = "font-[family-name:var(--font-booth-serif)]";
export const mono = "font-[family-name:var(--font-booth-mono)]";

export function Btn({ tone = "ghost", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "main" | "ghost" | "danger" }) {
  const look =
    tone === "main"
      ? "bg-[#efe6d6] text-[#15110e] disabled:opacity-40"
      : tone === "danger"
        ? "border border-[#b5452f] text-[#e08a76]"
        : "border border-[#efe6d6]/35 text-[#efe6d6]";
  return <button type="button" {...props} className={`${mono} rounded-full px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] ${look} ${className}`} />;
}

/** A round icon-ish button for the camera screens. */
export function RoundBtn({ label, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} {...props} className={`flex h-12 min-w-12 items-center justify-center rounded-full bg-black/45 px-3 text-lg text-[#efe6d6] backdrop-blur ${className}`}>
      {children}
    </button>
  );
}

/** A row of film holes, the booth's signature divider. */
export function FilmHoles({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`h-3 ${className}`} style={{ backgroundImage: "repeating-linear-gradient(90deg, #b5452f 0 14px, transparent 14px 26px)" }} />;
}

export function Confirm(props: { title: string; body?: string; yes: string; no: string; danger?: boolean; onYes: () => void; onNo: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6" onClick={props.onNo}>
      <div role="alertdialog" aria-modal="true" aria-label={props.title} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl border border-dashed border-[#efe6d6]/40 bg-[#1e1814] p-6">
        <h2 className={`${serif} text-2xl font-bold`}>{props.title}</h2>
        {props.body && <p className="mt-2 text-sm opacity-75">{props.body}</p>}
        <div className="mt-5 flex flex-col gap-2">
          <Btn tone="main" onClick={props.onNo}>
            {props.no}
          </Btn>
          <Btn tone={props.danger ? "danger" : "ghost"} onClick={props.onYes}>
            {props.yes}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function useFrameName() {
  const t = useT();
  return (id: string) => t(`booth.frame.${id}` as Parameters<typeof t>[0]);
}
