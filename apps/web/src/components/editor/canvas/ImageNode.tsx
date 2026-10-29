"use client";

import type Konva from "konva";
import { useEffect, useMemo, useRef } from "react";
import { Shape } from "react-konva";
import { drawShape } from "@ig-layout/core/elements/shapes";
import { frameInset, innerFrame, straightenScale } from "@ig-layout/core/project/geometry";
import { refitCrop } from "@ig-layout/core/project/blocks";
import { traceMask } from "@ig-layout/core/project/masks";
import { fixedCell, frameColor, type ImageElement, pansInside } from "@ig-layout/core/project/types";
import { useEditor } from "@/store/editor";
import { useFx } from "./useFx";
import { useHtmlImage } from "./useHtmlImage";
import { frameOverrides } from "@ig-layout/core/video/frames";
import { attachVideo, defaultMedia, detachVideo } from "@ig-layout/core/video/playback";
import { filterById } from "@ig-layout/core/color/filters";
import { drawFilmFx } from "@ig-layout/core/color/filmfx";
import { isNeutral, shaderParams, vignetteOf } from "@ig-layout/core/color/params";
import { processFrame } from "@ig-layout/core/color/processor";

/** Long edge of video frames while editing (colour processed every frame). */
const VIDEO_PREVIEW_MAX = 1080;
import { kenBurnsCrop, motionClock } from "@ig-layout/core/motion/motion";
import { liveCrops } from "@ig-layout/core/project/liveCrop";
import { screenToPicture, tilted, toView } from "@ig-layout/core/project/cropView";
import { warpInto } from "@ig-layout/core/image/warp";
import { useProcessedImage } from "./useProcessedImage";

interface Props {
  element: ImageElement;
}

/**
 * One Konva shape draws the whole photo: shadow, masked + cropped + straightened
 * image, border. Its self rect is exactly the frame, so selection handles fit it.
 * Positioned by its center (rotation around the center).
 *
 * Empty cells (no photo) show a "+" placeholder. Tapping, dragging and pinching are
 * handled by the canvas for the selected element (M14, editor-v2/06). While a photo in
 * a frame is selected, the rest of the picture is drawn faintly around the frame so the
 * user sees what is cut off (editor-v2/07 §1).
 */
/** The soft shadow photos had before it could be tuned (M17 keeps it as the default). */
export function defaultShadow(w: number, h: number) {
  return { opacity: 0.35, angle: 90, distance: Math.max(w, h) * 0.015, blur: Math.max(w, h) * 0.04, color: "#000000" };
}

/** `#rrggbb` + alpha → rgba(). */
function withAlpha(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export function ImageNode({ element: el }: Props) {
  const asset = useEditor((s) => (el.assetId ? s.assets[el.assetId] : undefined));
  const updateElement = useEditor((s) => s.updateElement);
  // The faint whole picture around a selected cell — not in a pack frame's window: its art is
  // see-through outside the window (torn edges…), so the picture would look like it spills out.
  const showWhole = useEditor((s) => {
    const els = (s.draft ?? s.doc)?.elements;
    return s.selectedId === el.id && !s.exporting && pansInside(el, els) && !fixedCell(el, els) && !s.drawing && !s.cropping;
  });
  const isVideo = !!asset?.video;
  // Videos (M13): the poster stands in until the player has a frame.
  const original = useHtmlImage(isVideo ? asset?.video?.posterUrl : asset?.url);
  const player = useRef<HTMLVideoElement | null>(null);
  const media = el.media ?? (asset?.video ? defaultMedia(asset.video.duration) : undefined);
  const mediaKey = media ? `${media.start}|${media.end}|${media.muted}|${media.volume}` : "";
  useEffect(() => {
    if (!isVideo || !asset || !media) return;
    player.current = attachVideo(el.id, asset.url, media);
    // media is described by mediaKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVideo, asset, el.id, mediaKey]);
  useEffect(() => {
    const id = el.id;
    return () => {
      if (player.current) detachVideo(id);
      player.current = null;
    };
  }, [el.id]);
  const compareThis = useEditor((s) => s.compare && s.selectedId === el.id);
  const exporting = useEditor((s) => s.exporting);
  const image = useProcessedImage(original, el, { original: compareThis, full: exporting });
  // Effects (editor-v2/14): not on videos (their frames keep changing).
  const fxRef = useFx<Konva.Shape>(isVideo ? { ...el, effect: undefined } : el, [image, original, showWhole]);
  /** Canvas the tilted picture is drawn into (D-111 part 2), and a counter for new video frames. */
  const warpOut = useRef<HTMLCanvasElement | null>(null);
  const warpStamp = useRef(0);
  // Colour on video frames (M13.3): processed each draw into reused canvases.
  const preset = filterById(el.filter?.id)?.preset;
  const videoParams = useMemo(
    () => (isVideo && !compareThis && !isNeutral(el.adjust, el.filter) ? shaderParams(el.adjust, preset, el.filter?.intensity ?? 0) : null),
    [isVideo, compareThis, el.adjust, el.filter, preset],
  );
  const frameCanvas = useRef<{ scratch: HTMLCanvasElement; out: HTMLCanvasElement } | null>(null);

  const w = el.width;
  const h = el.height;
  /** One radius for every corner, or four (Style sheet → per corner, M17). */
  const radius = el.corners ?? el.cornerRadius;
  const cx = el.x + w / 2;
  const cy = el.y + h / 2;

  function draw(ctx: Konva.Context, shape: Konva.Shape) {
    const c = ctx._context;
    // Blend with what is below (overlays). Wraps the whole drawing.
    c.save();
    if (el.blend && el.blend !== "normal") c.globalCompositeOperation = el.blend;
    drawPhoto(c, shape, ctx);
    c.restore();
  }

  function drawPhoto(c: CanvasRenderingContext2D, shape: Konva.Shape, ctx: Konva.Context) {
    const framed = el.frame !== "none";
    // Framed photos are rectangular (the frame replaces the mask).
    const mask = framed ? "none" : el.mask;
    const points = framed ? undefined : el.maskPoints;
    if (el.shadow) {
      c.save();
      const sh = el.shadowStyle ?? defaultShadow(w, h);
      c.shadowColor = withAlpha(sh.color, sh.opacity);
      // Shadow sizes are in device pixels: account for view scale and export pixel ratio.
      const k = shape.getAbsoluteScale().x * ctx.canvas.getPixelRatio();
      const a = (sh.angle * Math.PI) / 180;
      c.shadowBlur = sh.blur * k;
      c.shadowOffsetX = Math.cos(a) * sh.distance * k;
      c.shadowOffsetY = Math.sin(a) * sh.distance * k;
      traceMask(c, mask, w, h, radius, 0, points);
      c.fillStyle = "#000";
      c.fill();
      c.restore();
    }

    if (framed) {
      if (el.frame === "film") drawShape(c, "film", w, h, "#161616");
      else {
        c.fillStyle = frameColor(el.frame);
        c.fillRect(0, 0, w, h);
      }
    }

    // Photo area: the whole frame, or the inside of the decorative frame.
    const inner = frameInset(el.frame, w, h);
    const iw = inner.width;
    const ih = inner.height;
    c.save();
    c.translate(inner.x, inner.y);
    traceMask(c, mask, iw, ih, radius, 0, points);
    c.clip();
    // Video: the exporter's decoded frame, else the live player, else the poster.
    const override = frameOverrides.get(el.id);
    const live = player.current && player.current.readyState >= 2 ? player.current : null;
    let source: CanvasImageSource | null = isVideo ? (override ?? live ?? original) : image;
    let videoScale = 1; // processed frame px per source px
    if (isVideo && source && videoParams && asset) {
      const max = exporting ? Infinity : VIDEO_PREVIEW_MAX;
      const k = Math.min(1, max / Math.max(asset.width, asset.height));
      frameCanvas.current ??= { scratch: document.createElement("canvas"), out: document.createElement("canvas") };
      const { scratch, out } = frameCanvas.current;
      const w = Math.round(asset.width * k);
      const h = Math.round(asset.height * k);
      if (scratch.width !== w || scratch.height !== h) {
        scratch.width = w;
        scratch.height = h;
      }
      scratch.getContext("2d")!.drawImage(source, 0, 0, w, h);
      const processed = processFrame(scratch, videoParams, max, out);
      if (processed) {
        source = processed;
        videoScale = processed.width / asset.width;
      }
    }
    if (source && original) {
      let crop = liveCrops.get(el.id) ?? el.crop;
      // Ken Burns (M13.3): drift inside the frame while playing / exporting.
      const kb = el.motion?.kenBurns;
      const progress = kb ? motionClock()?.progress.get(el.id) : undefined;
      if (kb && progress !== undefined && asset) crop = kenBurnsCrop(crop, kb, progress, asset);
      // The processed copy may be smaller than the original: crop is in original pixels.
      // Crop is in source pixels; the processed photo copy may be smaller (videos: same size).
      const k = isVideo ? (source === original ? original.width / (asset?.width || original.width) : videoScale) : image!.width / original.width;
      const s = straightenScale(iw, ih, el.straighten);
      if (showWhole && asset && !el.straighten && !el.tiltX && !el.tiltY) {
        // The whole picture, faint, outside the clip (editor-v2/07 §1): drawn on the
        // un-clipped context below, then the frame's part on top as usual.
        c.restore();
        c.save();
        c.translate(inner.x, inner.y);
        const z = iw / crop.width; // frame px per picture px
        c.globalAlpha *= 0.32;
        c.translate(iw / 2, ih / 2);
        c.scale(el.flipX ? -1 : 1, el.flipY ? -1 : 1);
        c.drawImage(source, 0, 0, asset.width * k, asset.height * k, -iw / 2 - crop.x * z, -ih / 2 - crop.y * z, asset.width * z, asset.height * z);
        c.restore();
        c.save();
        c.translate(inner.x, inner.y);
        traceMask(c, mask, iw, ih, radius, 0, points);
        c.clip();
      }
      const tilt = { x: el.tiltX ?? 0, y: el.tiltY ?? 0 };
      let drawn = false;
      if (tilted(tilt) && asset) {
        // 3D tilt (D-111 part 2): the frame's pixels looked up through a homography (WebGL).
        const res = Math.min(2048 / Math.max(iw, ih), shape.getAbsoluteScale().x * ctx.canvas.getPixelRatio());
        const out = (warpOut.current ??= document.createElement("canvas"));
        out.width = Math.max(1, Math.round(iw * res));
        out.height = Math.max(1, Math.round(ih * res));
        const win = { width: iw, height: ih };
        const pic = { width: asset.width, height: asset.height };
        const view = toView({ crop, straighten: el.straighten, flipX: el.flipX, flipY: el.flipY }, win, pic);
        const map = screenToPicture(view, el, win, pic, tilt, { x: -iw / 2, y: -ih / 2, width: iw, height: ih }, { width: out.width, height: out.height });
        if (warpInto(out, source as TexImageSource, pic, map, isVideo ? ++warpStamp.current : 0)) {
          c.drawImage(out, 0, 0, iw, ih);
          drawn = true;
        }
      }
      if (!drawn) {
        c.save();
        c.translate(iw / 2, ih / 2);
        c.rotate((el.straighten * Math.PI) / 180);
        c.scale(s * (el.flipX ? -1 : 1), s * (el.flipY ? -1 : 1));
        c.drawImage(source, crop.x * k, crop.y * k, crop.width * k, crop.height * k, -iw / 2, -ih / 2, iw, ih);
        c.restore();
      }
      const vignette = compareThis ? 0 : vignetteOf(el.adjust, el.filter) / 100;
      if (vignette > 0) {
        const r = Math.hypot(iw, ih) / 2;
        const g = c.createRadialGradient(iw / 2, ih / 2, r * 0.35, iw / 2, ih / 2, r);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, `rgba(0,0,0,${0.75 * vignette})`);
        c.fillStyle = g;
        c.fillRect(0, 0, iw, ih);
      }
      if (!compareThis) drawFilmFx(c, iw, ih, el.filmFx);
    } else {
      c.fillStyle = "#d9d5cd";
      c.fillRect(0, 0, iw, ih);
      if (!el.assetId && !exporting) {
        // "+" placeholder for an empty cell / frame (an editing aid: never in previews / exports).
        const r = Math.min(iw, ih) * 0.12;
        c.fillStyle = "rgba(255,255,255,0.85)";
        c.beginPath();
        c.arc(iw / 2, ih / 2, r, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "#8a857c";
        c.lineWidth = r * 0.16;
        c.lineCap = "round";
        c.beginPath();
        c.moveTo(iw / 2 - r * 0.45, ih / 2);
        c.lineTo(iw / 2 + r * 0.45, ih / 2);
        c.moveTo(iw / 2, ih / 2 - r * 0.45);
        c.lineTo(iw / 2, ih / 2 + r * 0.45);
        c.stroke();
      }
    }
    c.restore();

    if (el.frame === "gallery") {
      // Thin line around the photo, like a mount in a gallery frame.
      const inner = frameInset("gallery", w, h);
      const lw = Math.max(1, Math.min(w, h) * 0.004);
      c.save();
      c.strokeStyle = "rgba(0,0,0,0.28)";
      c.lineWidth = lw;
      c.strokeRect(inner.x - lw * 3, inner.y - lw * 3, inner.width + lw * 6, inner.height + lw * 6);
      c.restore();
    }

    if (el.border && el.border.width > 0) {
      c.save();
      traceMask(c, mask, w, h, radius, el.border.width / 2, points);
      c.lineWidth = el.border.width;
      c.strokeStyle = el.border.color;
      c.stroke();
      c.restore();
    }
  }

  function hit(ctx: Konva.Context, shape: Konva.Shape) {
    traceMask(ctx._context, el.frame !== "none" ? "none" : el.mask, w, h, radius, 0, el.frame !== "none" ? undefined : el.maskPoints);
    ctx.fillStrokeShape(shape);
  }

  return (
    <Shape
      ref={fxRef}
      id={el.id}
      preventDefault={false}
      x={cx}
      y={cy}
      width={w}
      height={h}
      offsetX={w / 2}
      offsetY={h / 2}
      rotation={el.rotation}
      opacity={el.opacity}
      visible={!el.hidden}
      sceneFunc={draw}
      hitFunc={hit}
      onTransformEnd={(e) => {
        const node = e.target;
        const nw = Math.max(20, w * node.scaleX());
        const nh = Math.max(20, h * node.scaleY());
        node.scale({ x: 1, y: 1 });
        const next = { ...el, width: nw, height: nh };
        const inner = innerFrame(next);
        const before = innerFrame(el);
        // A side handle changes the frame's shape (M14): re-crop instead of stretching.
        const reshaped = asset && Math.abs(inner.width / inner.height - before.width / before.height) > 1e-3;
        updateElement(el.id, {
          x: node.x() - nw / 2,
          y: node.y() - nh / 2,
          width: nw,
          height: nh,
          rotation: node.rotation(),
          ...(reshaped && { crop: refitCrop(el.crop, inner.width / inner.height, asset) }),
        });
      }}
    />
  );
}
