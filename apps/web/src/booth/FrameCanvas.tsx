"use client";

import { useEffect, useRef } from "react";
import type { BoothFrame } from "@ig-layout/core/booth/frames";
import { renderFrame, type ShotImage } from "@ig-layout/core/booth/render";
import { canvasFonts } from "./fonts";

/** A frame drawn with its shots (the same drawing as the saved file), sized by CSS. */
export function FrameCanvas({ frame, images, scale, flip, date, numbers, className = "", onCell }: {
  frame: BoothFrame;
  images: (ShotImage | null)[];
  /** Drawing scale (pick from the size it's shown at × devicePixelRatio). */
  scale: number;
  flip?: boolean;
  date?: Date;
  numbers?: boolean;
  className?: string;
  /** Tap on a cell: which shot it shows. */
  onCell?: (shot: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => renderFrame(canvas, frame, images, { scale, flip, date, numbers, fonts: canvasFonts });
    draw();
    // Redraw once the booth fonts arrive (the first draw may use the fallback).
    void document.fonts.load(`700 20px ${canvasFonts.serif}`).then(draw, () => {});
  }, [frame, images, scale, flip, date, numbers]);

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
