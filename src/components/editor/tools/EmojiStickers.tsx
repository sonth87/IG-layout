"use client";

import { useEffect, useState } from "react";
import { iconDataUrl } from "@/lib/elements/icons";

// Emoji stickers (Fluent Emoji Flat, © Microsoft, MIT): ~1600 pictures split by
// category in /emoji/*.json (scripts/build-emoji.mjs). A category is fetched when
// opened (then cached by the service worker); search covers every name.

interface EmojiIndex {
  categories: { id: string; name: string; names: string[] }[];
}

let indexPromise: Promise<EmojiIndex> | null = null;
const bodies = new Map<string, Promise<Record<string, string>>>();
const loadIndex = () => (indexPromise ??= fetch("/emoji/index.json").then((r) => r.json()));
function loadCategory(id: string) {
  if (!bodies.has(id)) bodies.set(id, fetch(`/emoji/${id}.json`).then((r) => r.json()));
  return bodies.get(id)!;
}

const MAX_RESULTS = 80;
const label = (name: string) => name.replace(/-/g, " ");

export function EmojiStickers({ query, onPick }: { query: string; onPick: (name: string, body: string) => void }) {
  const [index, setIndex] = useState<EmojiIndex | null>(null);
  const [category, setCategory] = useState("smileys-emotion");
  const [loaded, setLoaded] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;
    void loadIndex().then((i) => alive && setIndex(i));
    return () => {
      alive = false;
    };
  }, []);

  // Names to show: the open category, or search matches across all categories.
  const q = query.trim().toLowerCase();
  const shown = !index
    ? []
    : q
      ? index.categories.flatMap((c) => c.names.filter((n) => label(n).includes(q)).map((n) => ({ n, c: c.id }))).slice(0, MAX_RESULTS)
      : (index.categories.find((c) => c.id === category)?.names ?? []).map((n) => ({ n, c: category }));
  const needed = [...new Set(shown.map((s) => s.c))].join(",");

  useEffect(() => {
    let alive = true;
    for (const id of needed.split(",").filter(Boolean)) {
      void loadCategory(id).then((b) => alive && setLoaded((old) => ({ ...old, ...b })));
    }
    return () => {
      alive = false;
    };
  }, [needed]);

  if (!index) return null;
  return (
    <>
      {!q && (
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {index.categories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
              className={`h-8 shrink-0 rounded-full px-3 text-[12px] ${category === c.id ? "bg-text font-semibold text-bg" : "border border-border"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-6 gap-1.5">
        {shown.map(({ n }) => {
          const body = loaded[n];
          return (
            <button
              key={n}
              type="button"
              aria-label={label(n)}
              disabled={!body}
              onClick={() => body && onPick(n, body)}
              style={{ contentVisibility: "auto", containIntrinsicSize: "auto 48px" }}
              className="flex h-12 items-center justify-center rounded-xl bg-surface-2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- generated SVG */}
              {body && <img src={iconDataUrl(n, "", 64, body)} alt="" width={32} height={32} loading="lazy" />}
            </button>
          );
        })}
      </div>
    </>
  );
}
