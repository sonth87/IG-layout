"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { BoothFrame } from "@ig-layout/core/booth/frames";
import type { RenderOptions } from "@ig-layout/core/booth/render";
import type { Facing } from "@ig-layout/core/booth/camera";
import { FrameCanvas } from "./FrameCanvas";
import { useShotImages } from "./images";

// The whole frame, live ("all of us" view): the print with the shots taken so far, the live
// camera playing in the cell being shot (object-fit: cover is the same centre crop render.ts
// makes), the empty cells numbered. Fits its box at the frame's shape (container units).
// In a group room, other people's cells will play their video the same way.

const NONE: never[] = [];

export function FrameLive({ frame, shots, current, stream, facing, fake, look, landed, children }: {
  frame: BoothFrame;
  /** Shots so far, by shot index (null = not yet). */
  shots: (Blob | null)[];
  /** The shot being taken (its cells show the camera), or null. */
  current: number | null;
  stream: MediaStream | null;
  facing: Facing;
  fake?: boolean;
  look?: RenderOptions;
  /** Bumped when a shot lands: its cell flashes. */
  landed?: { shot: number; n: number } | null;
  children?: ReactNode;
}) {
  const images = useShotImages(shots);
  const ar = frame.width / frame.height;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;
  const cells = frame.cells.filter((c) => c.shot === current);
  const border = look?.theme?.cellBorder?.width ?? 0;

  return (
    <div className="flex h-full w-full items-center justify-center [container-type:size]">
      <div className="relative shadow-[5px_6px_0_rgba(11,8,6,0.85)]" style={{ width: `min(100cqw, calc(100cqh * ${ar}))`, aspectRatio: `${frame.width} / ${frame.height}` }}>
        <FrameCanvas frame={frame} images={images ?? NONE} look={{ ...look, placeholders: true }} numbers scale={Math.min(1, 900 / Math.max(frame.width, frame.height))} className="absolute inset-0 h-full w-full" />
        {cells.map((c, i) => (
          <div
            key={`${current}-${i}`}
            className="absolute overflow-hidden outline outline-2 outline-offset-2 outline-[var(--c-amber)]"
            style={{ left: pct(c.x + border, frame.width), top: pct(c.y + border, frame.height), width: pct(c.w - border * 2, frame.width), height: pct(c.h - border * 2, frame.height) }}
          >
            <LiveVideo stream={stream} mirror={facing === "user" && !fake} />
          </div>
        ))}
        {landed &&
          frame.cells
            .filter((c) => c.shot === landed.shot)
            .map((c, i) => (
              <div
                key={`${landed.n}-${i}`}
                aria-hidden
                className="pointer-events-none absolute animate-[booth-flash_0.6s_ease-out_forwards] bg-white"
                style={{ left: pct(c.x, frame.width), top: pct(c.y, frame.height), width: pct(c.w, frame.width), height: pct(c.h, frame.height) }}
              />
            ))}
        {children}
      </div>
    </div>
  );
}

function LiveVideo({ stream, mirror }: { stream: MediaStream | null; mirror: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.srcObject = stream;
    if (stream) void v.play().catch(() => {});
  }, [stream]);
  return <video ref={ref} muted playsInline className="h-full w-full max-w-none object-cover" style={{ transform: mirror ? "scaleX(-1)" : undefined }} />;
}
