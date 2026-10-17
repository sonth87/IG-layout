"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useSettings, useT } from "@/store/settings";

// The project's ⋯ menu (editor-v2/12 §2): a frosted popover right under the button, not a
// sheet. "Snap ›" opens in place with On / Off, the current one ticked.

export type ProjectMenuKey = "background" | "ratio" | "preview" | "slides" | "music" | "draw" | "layout";

export function ProjectMenu(props: { onPick: (key: ProjectMenuKey) => void; onClose: () => void; slidesLabel: string; canRatio: boolean }) {
  const t = useT();
  const snap = useSettings((s) => s.snap);
  const setSnap = useSettings((s) => s.setSnap);
  const [snapOpen, setSnapOpen] = useState(false);
  const item = "flex h-11 w-full items-center gap-3 px-4 text-left text-[15px] active:bg-surface-2";
  const row = (key: ProjectMenuKey, label: string, icon: IconName) => (
    <button key={key} type="button" role="menuitem" onClick={() => (props.onClose(), props.onPick(key))} className={item}>
      <Icon name={icon} size={19} />
      {label}
    </button>
  );
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={props.onClose} />
      <div
        role="menu"
        aria-label={t("editor.projectMenu")}
        className="animate-pop-in absolute top-[58px] right-3 z-40 w-60 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface/90 py-1 shadow-xl backdrop-blur-xl"
      >
        {row("background", t("editor.background"), "background")}
        {props.canRatio && row("ratio", t("pm.ratio"), "crop")}
        <button type="button" role="menuitem" aria-expanded={snapOpen} onClick={() => setSnapOpen(!snapOpen)} className={item}>
          <Icon name="move" size={19} />
          <span className="flex-1">{t("pm.snap")}</span>
          <span className={`text-muted transition-transform ${snapOpen ? "rotate-90" : ""}`}>
            <Icon name="chevronRight" size={16} />
          </span>
        </button>
        {snapOpen &&
          [true, false].map((on) => (
            <button key={String(on)} type="button" role="menuitemradio" aria-checked={snap === on} onClick={() => setSnap(on)} className={`${item} pl-12 text-[14px]`}>
              <span className="flex-1">{on ? t("pm.on") : t("pm.off")}</span>
              {snap === on && <Icon name="check" size={18} />}
            </button>
          ))}
        {row("preview", t("pm.preview"), "play")}
        <div className="my-1 h-px bg-border" />
        {row("slides", props.slidesLabel, "slides")}
        {row("layout", t("editor.layout"), "layout")}
        {row("music", t("music.title"), "music")}
        {row("draw", t("editor.draw"), "pencil")}
      </div>
    </>
  );
}
