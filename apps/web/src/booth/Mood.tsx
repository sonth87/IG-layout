"use client";

import { useEffect, useRef } from "react";
import type { BoothTheme } from "@ig-layout/core/booth/themes";

// The booth's screens take the theme's mood (D-161 step 3): its backdrop, and a few things
// drifting across — leaves in the forest, sweets for candy, stars, snow, sparks, petals,
// fireflies. Behind everything, never in the way; still with "reduce motion".

export function Mood({ theme }: { theme: BoothTheme }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { particles, colors } = theme.mood;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || particles === "none") return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = canvas.getContext("2d")!;
    let W = 0;
    let H = 0;
    const size = () => {
      const d = Math.min(2, devicePixelRatio || 1);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * d;
      canvas.height = H * d;
      c.setTransform(d, 0, 0, d, 0, 0);
    };
    size();
    const rise = particles === "sparks" || particles === "fireflies";
    const count = particles === "stars" || particles === "fireflies" ? 28 : 22;
    const bits = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      s: 3 + Math.random() * 6,
      v: 10 + Math.random() * 22,
      a: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 2,
      color: colors[i % Math.max(1, colors.length)] ?? "#fff",
      phase: Math.random() * Math.PI * 2,
    }));
    let raf = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      c.clearRect(0, 0, W, H);
      for (const b of bits) {
        if (!reduced) {
          b.y += (rise ? -1 : 1) * b.v * dt;
          b.x += Math.sin(now / 1400 + b.phase) * 8 * dt;
          b.a += b.spin * dt;
          if (b.y > H + 12) b.y = -12;
          if (b.y < -12) b.y = H + 12;
        }
        const tw = particles === "stars" || particles === "fireflies" ? 0.35 + 0.65 * Math.abs(Math.sin(now / 900 + b.phase)) : 0.8;
        c.save();
        c.globalAlpha = tw;
        c.translate(b.x, b.y);
        c.rotate(b.a);
        c.fillStyle = b.color;
        switch (particles) {
          case "leaves":
            c.beginPath();
            c.ellipse(0, 0, b.s * 1.4, b.s * 0.6, 0, 0, Math.PI * 2);
            c.fill();
            break;
          case "petals":
            c.beginPath();
            c.ellipse(0, 0, b.s, b.s * 0.55, 0, 0, Math.PI * 2);
            c.fill();
            break;
          case "candy":
          case "confetti":
            if (b.phase > Math.PI) c.fillRect(-b.s, -b.s / 2, b.s * 2, b.s);
            else {
              c.beginPath();
              c.arc(0, 0, b.s * 0.8, 0, Math.PI * 2);
              c.fill();
            }
            break;
          case "snow":
            c.beginPath();
            c.arc(0, 0, b.s * 0.5, 0, Math.PI * 2);
            c.fill();
            break;
          default:
            // stars, sparks, fireflies: a glowing dot.
            c.shadowColor = b.color;
            c.shadowBlur = b.s * 2;
            c.beginPath();
            c.arc(0, 0, b.s * 0.35, 0, Math.PI * 2);
            c.fill();
        }
        c.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", size);
    };
  }, [particles, colors]);

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 transition-[background] duration-700" style={{ background: theme.mood.floor }} />
      {particles !== "none" && <canvas ref={ref} aria-hidden data-mood={particles} className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70" />}
    </>
  );
}
