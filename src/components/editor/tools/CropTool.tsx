"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { coverCrop, innerFrame, straightenScale } from "@/lib/project/geometry";
import type { ImageElement, Rect } from "@/lib/project/types";
import { updateEl, useEditor, useViewDoc } from "@/store/editor";
import { useT } from "@/store/settings";
import { useHtmlImage } from "../canvas/useHtmlImage";
import { Slider } from "./controls";

type RatioKey = "free" | "frame" | "original" | "1:1" | "4:5" | "3:4" | "16:9";
const FIXED: Partial<Record<RatioKey, number>> = { "1:1": 1, "4:5": 4 / 5, "3:4": 3 / 4, "16:9": 16 / 9 };
const HANDLE_PX = 28;
const MIN_CROP = 40;

type Drag =
  | { mode: "move"; start: { x: number; y: number }; crop: Rect }
  | { mode: "corner"; corner: [number, number]; crop: Rect };

/** Crop + straighten + flip in a full-screen editor (docs/design wireframe 13). */
export function CropTool({ elementId, onClose }: { elementId: string; onClose: () => void }) {
  const t = useT();
  const found = useViewDoc()?.elements.find((e) => e.id === elementId);
  const el = found?.type === "image" ? found : undefined;
  const asset = useEditor((s) => (el?.assetId ? s.assets[el.assetId] : undefined));
  const { updateDraft, applyDraft, cancelDraft } = useEditor.getState();
  const image = useHtmlImage(asset?.url);
  const areaRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [ratio, setRatio] = useState<RatioKey>("frame");
  const [frameAspect] = useState(() => {
    if (!el) return 1;
    const inner = innerFrame(el);
    return inner.width / inner.height;
  });
  const drag = useRef<Drag | null>(null);

  useEffect(() => {
    const node = areaRef.current;
    if (!node) return;
    const ro = new ResizeObserver(() => setArea({ width: node.clientWidth, height: node.clientHeight }));
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const imgW = asset?.width ?? 1;
  const imgH = asset?.height ?? 1;
  const fit = Math.min((area.width - 40) / imgW, (area.height - 40) / imgH) || 0;
  const ox = (area.width - imgW * fit) / 2;
  const oy = (area.height - imgH * fit) / 2;

  // Draw: straightened image + dimmed outside + thirds grid.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image || !el || fit <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = area.width * dpr;
    canvas.height = area.height * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, area.width, area.height);
    const c = el.crop;
    const cx = ox + (c.x + c.width / 2) * fit;
    const cy = oy + (c.y + c.height / 2) * fit;
    const s = straightenScale(c.width, c.height, el.straighten);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((el.straighten * Math.PI) / 180);
    ctx.scale(s * (el.flipX ? -1 : 1), s * (el.flipY ? -1 : 1));
    ctx.translate(-cx, -cy);
    ctx.drawImage(image, ox, oy, imgW * fit, imgH * fit);
    ctx.restore();

    const r = { x: ox + c.x * fit, y: oy + c.y * fit, w: c.width * fit, h: c.height * fit };
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.beginPath();
    ctx.rect(0, 0, area.width, area.height);
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.fill("evenodd");
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(r.x + (r.w * i) / 3, r.y);
      ctx.lineTo(r.x + (r.w * i) / 3, r.y + r.h);
      ctx.moveTo(r.x, r.y + (r.h * i) / 3);
      ctx.lineTo(r.x + r.w, r.y + (r.h * i) / 3);
      ctx.stroke();
    }
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.lineWidth = 4;
    const L = 18;
    for (const [px, py, sx, sy] of [
      [r.x, r.y, 1, 1],
      [r.x + r.w, r.y, -1, 1],
      [r.x, r.y + r.h, 1, -1],
      [r.x + r.w, r.y + r.h, -1, -1],
    ]) {
      ctx.beginPath();
      ctx.moveTo(px, py + sy * L);
      ctx.lineTo(px, py);
      ctx.lineTo(px + sx * L, py);
      ctx.stroke();
    }
  }, [image, el, area, fit, ox, oy, imgW, imgH]);

  if (!el || !asset) return null;

  const setCrop = (crop: Rect) => updateDraft((d) => updateEl(d, elementId, { crop }));
  const patch = (p: Partial<ImageElement>) => updateDraft((d) => updateEl(d, elementId, p));
  const lockedAspect = ratio === "free" ? null : ratio === "frame" ? frameAspect : ratio === "original" ? imgW / imgH : FIXED[ratio]!;

  function clamp(r: Rect): Rect {
    const width = Math.min(r.width, imgW);
    const height = Math.min(r.height, imgH);
    return {
      x: Math.max(0, Math.min(imgW - width, r.x)),
      y: Math.max(0, Math.min(imgH - height, r.y)),
      width,
      height,
    };
  }

  function chooseRatio(key: RatioKey) {
    setRatio(key);
    const aspect = key === "free" ? null : key === "frame" ? frameAspect : key === "original" ? imgW / imgH : FIXED[key]!;
    if (!aspect) return;
    const c = el!.crop;
    let width = c.width;
    let height = width / aspect;
    if (height > imgH) {
      height = imgH;
      width = height * aspect;
    }
    if (width > imgW) {
      width = imgW;
      height = width / aspect;
    }
    setCrop(clamp({ x: c.x + (c.width - width) / 2, y: c.y + (c.height - height) / 2, width, height }));
  }

  function toImage(e: React.PointerEvent) {
    const rect = areaRef.current!.getBoundingClientRect();
    return { x: (e.clientX - rect.left - ox) / fit, y: (e.clientY - rect.top - oy) / fit };
  }

  function onPointerDown(e: React.PointerEvent) {
    const p = toImage(e);
    const c = el!.crop;
    const tol = HANDLE_PX / fit;
    for (const cx of [0, 1]) {
      for (const cy of [0, 1]) {
        if (Math.abs(p.x - (c.x + cx * c.width)) < tol && Math.abs(p.y - (c.y + cy * c.height)) < tol) {
          drag.current = { mode: "corner", corner: [cx, cy], crop: c };
          e.currentTarget.setPointerCapture(e.pointerId);
          return;
        }
      }
    }
    if (p.x > c.x && p.x < c.x + c.width && p.y > c.y && p.y < c.y + c.height) {
      drag.current = { mode: "move", start: p, crop: c };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const p = toImage(e);
    if (d.mode === "move") {
      setCrop(clamp({ ...d.crop, x: d.crop.x + p.x - d.start.x, y: d.crop.y + p.y - d.start.y }));
      return;
    }
    // Resize from a corner; the opposite corner stays fixed.
    const [cx, cy] = d.corner;
    const fx = cx === 0 ? d.crop.x + d.crop.width : d.crop.x;
    const fy = cy === 0 ? d.crop.y + d.crop.height : d.crop.y;
    const px = Math.max(0, Math.min(imgW, p.x));
    const py = Math.max(0, Math.min(imgH, p.y));
    let width = Math.max(MIN_CROP, Math.abs(px - fx));
    let height = Math.max(MIN_CROP, Math.abs(py - fy));
    if (lockedAspect) {
      if (width / height > lockedAspect) width = height * lockedAspect;
      else height = width / lockedAspect;
    }
    const x = cx === 0 ? fx - width : fx;
    const y = cy === 0 ? fy - height : fy;
    if (x < 0 || y < 0 || x + width > imgW || y + height > imgH) return;
    setCrop({ x, y, width, height });
  }

  function apply() {
    // Keep the frame's width and center; its height follows the crop's aspect.
    updateDraft((d) => {
      const cur = d.elements.find((x) => x.id === elementId) as ImageElement;
      const aspect = cur.crop.width / cur.crop.height;
      if (cur.frame !== "none") {
        // Decorative frames keep their size: trim the crop to the inner area's aspect.
        const inner = innerFrame(cur);
        const target = inner.width / inner.height;
        if (Math.abs(aspect - target) < 0.001) return d;
        const c = cur.crop;
        const w = aspect > target ? c.height * target : c.width;
        const h = aspect > target ? c.height : c.width / target;
        return updateEl(d, elementId, { crop: { x: c.x + (c.width - w) / 2, y: c.y + (c.height - h) / 2, width: w, height: h } });
      }
      if (Math.abs(aspect - cur.width / cur.height) < 0.001) return d;
      const height = cur.width / aspect;
      return updateEl(d, elementId, { height, y: cur.y + (cur.height - height) / 2 });
    });
    applyDraft();
    onClose();
  }

  const ratios: RatioKey[] = ["free", "frame", "original", "1:1", "4:5", "3:4", "16:9"];
  const pill = (active: boolean) =>
    `h-9 shrink-0 rounded-full px-3 text-[13px] ${active ? "bg-text font-bold text-bg" : "border border-border"}`;
  const toolButton = "flex h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px]";

  return (
    <div role="dialog" aria-modal="true" aria-label={t("tool.crop")} className="fixed inset-0 z-20 flex flex-col bg-[#0b0b0c]">
      <div
        ref={areaRef}
        className="relative flex-1 touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>

      <section className="rounded-t-[20px] bg-surface pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            aria-label={t("common.cancel")}
            onClick={() => {
              cancelDraft();
              onClose();
            }}
            className="flex h-12 w-12 items-center justify-center"
          >
            <Icon name="close" size={24} />
          </button>
          <h2 className="text-[15px] font-bold">{t("tool.crop")}</h2>
          <button
            type="button"
            aria-label={t("tool.apply")}
            onClick={apply}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-on-accent"
          >
            <Icon name="check" size={24} />
          </button>
        </div>
        <div className="px-4">
          <Slider
            label={t("tool.straighten")}
            value={el.straighten}
            min={-45}
            max={45}
            step={0.5}
            defaultValue={0}
            format={(v) => `${v}°`}
            onChange={(v) => patch({ straighten: v })}
          />
          <div className="flex gap-2 overflow-x-auto py-1.5">
            {ratios.map((r) => (
              <button key={r} type="button" aria-pressed={ratio === r} onClick={() => chooseRatio(r)} className={pill(ratio === r)}>
                {r === "free" || r === "frame" || r === "original" ? t(`crop.${r}`) : r}
              </button>
            ))}
          </div>
          <div className="flex pt-1">
            <button type="button" className={toolButton} onClick={() => patch({ rotation: (el.rotation + 90) % 360 })}>
              <Icon name="rotate" />
              {t("crop.rotate")}
            </button>
            <button type="button" className={toolButton} onClick={() => patch({ flipX: !el.flipX })}>
              <Icon name="flipH" />
              {t("crop.flipH")}
            </button>
            <button type="button" className={toolButton} onClick={() => patch({ flipY: !el.flipY })}>
              <Icon name="flipV" />
              {t("crop.flipV")}
            </button>
            <button
              type="button"
              className={toolButton}
              onClick={() => {
                setRatio("frame");
                patch({ crop: coverCrop(asset, { width: frameAspect, height: 1 }), straighten: 0, flipX: false, flipY: false });
              }}
            >
              <Icon name="reset" />
              {t("crop.reset")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
