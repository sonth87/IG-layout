"use client";

import { Icon, type IconName } from "@/components/ui/Icon";

// The header every bottom sheet shares (D-129, like the colour sheet): a round button on
// each side, the title in the middle. It never scrolls with the sheet's content.

export interface SheetButton {
  icon: IconName;
  label: string;
  onClick: () => void;
  /** The confirm button (✓): filled with the accent colour. */
  accent?: boolean;
}

export function RoundSheetButton({ icon, label, onClick, accent }: SheetButton) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full active:scale-95 ${accent ? "bg-accent text-on-accent" : "bg-surface-2"}`}
    >
      <Icon name={icon} size={22} />
    </button>
  );
}

export function SheetHeader({ title, left, right, sub }: { title: React.ReactNode; left?: SheetButton; right?: SheetButton; sub?: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-2 pb-2">
      <div className="w-11 shrink-0">{left && <RoundSheetButton {...left} />}</div>
      <div className="flex min-w-0 flex-1 flex-col items-center text-center">
        <h2 className="w-full truncate text-[16px] font-bold">{title}</h2>
        {sub && <span className="w-full truncate text-[12px] text-muted">{sub}</span>}
      </div>
      <div className="w-11 shrink-0">{right && <RoundSheetButton {...right} />}</div>
    </div>
  );
}
