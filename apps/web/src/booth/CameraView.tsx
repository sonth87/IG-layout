"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { CameraError, Facing } from "@ig-layout/core/booth/camera";
import { mono } from "./ui";

export interface Camera {
  stream: MediaStream;
  /** The test picture (no camera): never mirrored. */
  fake: boolean;
  error?: CameraError;
}

// The live camera in a polaroid. The photo area has the shape of the cell the next shot goes
// into and shows exactly what lands in it (the centre crop of the full sensor frame, as
// render.ts crops it). The front camera is shown mirrored, like a mirror (the saved photo is
// not, D-153); the test picture never is.

const PAD = 12;
const CAPTION = 40;

export function CameraView({ camera, facing, aspect, videoRef, caption, tilt = -1.2, children }: {
  camera: Camera | null;
  facing: Facing;
  /** Cell w / h. */
  aspect: number;
  videoRef?: RefObject<HTMLVideoElement | null>;
  caption?: ReactNode;
  tilt?: number;
  /** Drawn over the photo (countdown…). */
  children?: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const ownVideo = useRef<HTMLVideoElement>(null);
  const video = videoRef ?? ownVideo;
  const [size, setSize] = useState({ W: 0, H: 0, vw: 0, vh: 0 });
  const stream = camera?.stream ?? null;

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.srcObject = stream;
    if (stream) void v.play().catch(() => {});
  }, [stream, video]);

  useEffect(() => {
    const el = box.current;
    const v = video.current;
    if (!el || !v) return;
    const measure = () => setSize({ W: el.clientWidth, H: el.clientHeight, vw: v.videoWidth, vh: v.videoHeight });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    v.addEventListener("loadedmetadata", measure);
    v.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      v.removeEventListener("loadedmetadata", measure);
      v.removeEventListener("resize", measure);
    };
  }, [video]);

  const { W, H, vw, vh } = size;
  // The photo area: as big as fits (room for the polaroid border and caption, and the tilt).
  const roomW = Math.max(0, W * 0.9 - PAD * 2);
  const roomH = Math.max(0, H * 0.92 - PAD - CAPTION);
  const pw = Math.min(roomW, roomH * aspect);
  const ph = pw / aspect;
  // The video, scaled so the cell's crop of the sensor frame covers the photo area.
  const crop = vw && vh ? (vw / vh > aspect ? { w: vh * aspect, h: vh } : { w: vw, h: vw / aspect }) : null;
  const k = crop ? pw / crop.w : 0;
  const mirror = facing === "user" && !camera?.fake;

  return (
    <div ref={box} className="flex h-full w-full items-center justify-center">
      <div
        className="bg-[#f6efe2] shadow-[6px_6px_0_#0b0806] transition-transform duration-500"
        style={{ padding: `${PAD}px ${PAD}px 0`, transform: `rotate(${tilt}deg)`, visibility: pw ? "visible" : "hidden" }}
      >
        <div className="relative overflow-hidden bg-[#2a231d] transition-[width,height] duration-300 ease-out" style={{ width: pw, height: ph }}>
          <video
            ref={video}
            muted
            playsInline
            className="absolute max-w-none"
            style={{
              width: vw * k || "100%",
              height: vh * k || "100%",
              left: pw / 2 - (vw * k) / 2 || 0,
              top: ph / 2 - (vh * k) / 2 || 0,
              transform: mirror ? "scaleX(-1)" : undefined,
            }}
          />
          {children}
        </div>
        <div className={`${mono} flex items-center px-1 text-[13px] font-bold text-[#1d1612]`} style={{ height: CAPTION }}>
          {caption}
        </div>
      </div>
    </div>
  );
}
