"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { CameraError, Facing } from "@ig-layout/core/booth/camera";

export interface Camera {
  stream: MediaStream;
  /** The test picture (no camera): never mirrored. */
  fake: boolean;
  error?: CameraError;
}

// The live camera with a window the shape of the cell the next shot goes into: exactly the
// part of the picture that ends up in the cell (centre crop of the full sensor frame, as
// render.ts crops it); the rest is dimmed. The front camera is shown mirrored, like a
// mirror (the saved photo is not, D-153); the test picture never is.

export function CameraView({ camera, facing, aspect, videoRef, children }: {
  camera: Camera | null;
  facing: Facing;
  /** Cell w / h. */
  aspect: number;
  videoRef?: RefObject<HTMLVideoElement | null>;
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
  let view = { k: 0, cw: 0, ch: 0 };
  if (W && H && vw && vh) {
    // The crop the cell takes from the sensor frame, then a scale that fits it on screen.
    const cw = vw / vh > aspect ? vh * aspect : vw;
    const ch = vw / vh > aspect ? vh : vw / aspect;
    view = { k: Math.min(W / cw, H / ch) * 0.92, cw, ch };
  }
  const mirror = facing === "user" && !camera?.fake;

  return (
    <div ref={box} className="relative h-full w-full overflow-hidden bg-black">
      <video
        ref={video}
        muted
        playsInline
        className="absolute max-w-none"
        style={{
          width: vw * view.k || "100%",
          height: vh * view.k || "100%",
          left: W / 2 - (vw * view.k) / 2 || 0,
          top: H / 2 - (vh * view.k) / 2 || 0,
          transform: mirror ? "scaleX(-1)" : undefined,
        }}
      />
      {view.k > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-[3px] outline outline-1 outline-[#efe6d6]/70 transition-all duration-300"
          style={{
            width: view.cw * view.k,
            height: view.ch * view.k,
            left: W / 2 - (view.cw * view.k) / 2,
            top: H / 2 - (view.ch * view.k) / 2,
            boxShadow: "0 0 0 100vmax rgba(10,8,6,0.62)",
          }}
        />
      )}
      {children}
    </div>
  );
}
