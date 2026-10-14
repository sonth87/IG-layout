"use client";

import { useState } from "react";
import { useT } from "@/store/settings";

// In-app dialogs (UX-15): replace the browser's prompt / confirm, which look out of
// place (and are blocked in some embedded views).

function Frame(props: { title: string; children: React.ReactNode; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-6" onClick={props.onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={props.title}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-3.5 rounded-[22px] border border-border bg-surface p-5"
      >
        <h2 className="font-display text-xl leading-tight font-bold">{props.title}</h2>
        {props.children}
      </div>
    </div>
  );
}

export function ConfirmDialog(props: {
  title: string;
  body?: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useT();
  return (
    <Frame title={props.title} onCancel={props.onCancel}>
      {props.body && <p className="text-sm leading-relaxed text-text-2">{props.body}</p>}
      <div className="mt-1 flex gap-2.5">
        <button type="button" onClick={props.onCancel} className="h-12 flex-1 rounded-[14px] border border-border-2 font-semibold">
          {t("common.cancel")}
        </button>
        <button
          type="button"
          autoFocus
          onClick={props.onConfirm}
          className={`h-12 flex-1 rounded-[14px] font-bold ${props.danger ? "bg-danger text-white" : "bg-accent text-on-accent"}`}
        >
          {props.confirmLabel}
        </button>
      </div>
    </Frame>
  );
}

export function PromptDialog(props: {
  title: string;
  label: string;
  initial: string;
  confirmLabel: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [value, setValue] = useState(props.initial);
  const submit = () => {
    const v = value.trim();
    if (v) props.onConfirm(v);
  };
  return (
    <Frame title={props.title} onCancel={props.onCancel}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-3.5"
      >
        <input
          id="prompt-dialog-input"
          aria-label={props.label}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={(e) => e.target.select()}
          className="h-12 rounded-xl border border-border bg-surface-2 px-3 text-base outline-none focus:border-accent"
        />
        <div className="flex gap-2.5">
          <button type="button" onClick={props.onCancel} className="h-12 flex-1 rounded-[14px] border border-border-2 font-semibold">
            {t("common.cancel")}
          </button>
          <button type="submit" disabled={!value.trim()} className="h-12 flex-1 rounded-[14px] bg-accent font-bold text-on-accent disabled:opacity-50">
            {props.confirmLabel}
          </button>
        </div>
      </form>
    </Frame>
  );
}
