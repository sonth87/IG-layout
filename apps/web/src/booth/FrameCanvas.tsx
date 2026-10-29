"use client";

import { useEffect, useRef } from "react";
import type { BoothFrame } from "@ig-layout/core/booth/frames";
import { renderFrame, type RenderOptions, type ShotImage } from "@ig-layout/core/booth/render";
import { canvasFonts } from "./fonts";
import { loadThemeFonts } from "./look";

/** A frame drawn with its shots (the same drawing as the saved file), sized by CSS. */
export function FrameCanvas({ frame, images, scale, look, numbers, className = "", onCell }: {
  frame: BoothFrame;
  images: (ShotImage | null)[];
  /** Drawing scale (pick from the size it's shown at × devicePixelRatio). */
  scale: number;
  /** Theme, caption, flip… (lookOptions). */
  look?: RenderOptions;
  numbers?: boolean;
  className?: string;
  /** Tap on a cell: which shot it shows. */
  onCell?: (shot: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let gone = false;
    const draw = () => !gone && renderFrame(canvas, frame, images, { fonts: canvasFonts, ...look, scale, numbers });
    draw();
    // Redraw once the faces arrive (the first draw may use the fallback).
    void Promise.all([document.fonts.load(`700 20px ${canvasFonts.serif}`).catch(() => []), loadThemeFonts(look?.theme?.id)]).then(draw);
    return () => {
      gone = true;
    };
  }, [frame, images, scale, look, numbers]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ aspectRatio: `${frame.width} / ${frame.height}` }}
      onClick={
        onCell &&
        ((e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * frame.width;
          const y = ((e.clientY - r.top) / r.height) * frame.height;
          const cell = frame.cells.find((c) => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h);
          if (cell) onCell(cell.shot);
        })
      }
    />
  );
}
