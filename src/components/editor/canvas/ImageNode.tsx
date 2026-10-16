"use client";

import type Konva from "konva";
import { useEffect, useMemo, useRef } from "react";
import { Shape } from "react-konva";
import { drawShape } from "@/lib/elements/shapes";
import { frameInset, straightenScale } from "@/lib/project/geometry";
import { traceMask } from "@/lib/project/masks";
import { frameColor, type ImageElement, pansInside, type Rect } from "@/lib/project/types";
import { useEditor } from "@/store/editor";
import { useElementInteraction } from "./interaction";
import { useHtmlImage } from "./useHtmlImage";
import { frameOverrides } from "@/lib/video/frames";
import { attachVideo, defaultMedia, detachVideo } from "@/lib/video/playback";
import { filterById } from "@/lib/color/filters";
import { isNeutral, shaderParams } from "@/lib/color/params";
import { processFrame } from "@/lib/color/processor";

/** Long edge of video frames while editing (colour processed every frame). */
const VIDEO_PREVIEW_MAX = 1080;
import { kenBurnsCrop, motionClock } from "@/lib/motion/motion";
import { liveCrops } from "@/lib/project/liveCrop";
import { useProcessedImage } from "./useProcessedImage";

interface Props {
  element: ImageElement;
  onDragMove: (node: Konva.Node, element: ImageElement) => void;
  onDragEnd: () => void;
}

/**
 * One Konva shape draws the whole photo: shadow, masked + cropped + straightened
 * image, border. Its self rect is exactly the frame, so selection handles fit it.
 * Positioned by its center (rotation around the center).
 *
 * Template cells (`slot`): dragging pans the photo inside the frame instead of
 * moving the frame. Empty cells (no photo) show a "+" placeholder.
 */
export function ImageNode({ element: el, onDragMove, onDragEnd }: Props) {
  const asset = useEditor((s) => (el.assetId ? s.assets[el.assetId] : undefined));
  const { draggable, preventDefault, onSelect, onMouseSelect } = useElementInteraction(el);
  const updateElement = useEditor((s) => s.updateElement);
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
  // Colour on video frames (M13.3): processed each draw into reused canvases.
  const preset = filterById(el.filter?.id)?.preset;
  const videoParams = useMemo(
    () => (isVideo && !compareThis && !isNeutral(el.adjust, el.filter) ? shaderParams(el.adjust, preset, el.filter?.intensity ?? 0) : null),
    [isVideo, compareThis, el.adjust, el.filter, preset],
  );
  const frameCanvas = useRef<{ scratch: HTMLCanvasElement; out: HTMLCanvasElement } | null>(null);
  /** Crop while panning a slot (drawn live, committed on release). */
  const liveCrop = useRef<Rect | null>(null);
  const panStart = useRef<{ x: number; y: number } | null>(null);

  const inside = pansInside(el);

  /** Selects the empty cell and opens the photo picker (the editor fills the selected cell). */
  function fillEmpty() {
    useEditor.getState().select(el.id);
    document.getElementById("replace-photo-input")?.click();
  }

  const w = el.width;
  const h = el.height;
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
    if (el.shadow) {
      c.save();
      c.shadowColor = "rgba(0,0,0,0.35)";
      // Shadow sizes are in device pixels: account for view scale and export pixel ratio.
      const k = shape.getAbsoluteScale().x * ctx.canvas.getPixelRatio();
      c.shadowBlur = Math.max(w, h) * 0.04 * k;
      c.shadowOffsetY = Math.max(w, h) * 0.015 * k;
      traceMask(c, mask, w, h, el.cornerRadius);
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
    traceMask(c, mask, iw, ih, el.cornerRadius);
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
      let crop = liveCrops.get(el.id) ?? liveCrop.current ?? el.crop;
      // Ken Burns (M13.3): drift inside the frame while playing / exporting.
      const kb = el.motion?.kenBurns;
      const progress = kb ? motionClock()?.progress.get(el.id) : undefined;
      if (kb && progress !== undefined && asset) crop = kenBurnsCrop(crop, kb, progress, asset);
      // The processed copy may be smaller than the original: crop is in original pixels.
      // Crop is in source pixels; the processed photo copy may be smaller (videos: same size).
      const k = isVideo ? (source === original ? original.width / (asset?.width || original.width) : videoScale) : image!.width / original.width;
      const s = straightenScale(iw, ih, el.straighten);
      c.save();
      c.translate(iw / 2, ih / 2);
      c.rotate((el.straighten * Math.PI) / 180);
      c.scale(s * (el.flipX ? -1 : 1), s * (el.flipY ? -1 : 1));
      c.drawImage(source, crop.x * k, crop.y * k, crop.width * k, crop.height * k, -iw / 2, -ih / 2, iw, ih);
      c.restore();
      const vignette = compareThis ? 0 : (el.adjust?.vignette ?? 0) / 100;
      if (vignette > 0) {
        const r = Math.hypot(iw, ih) / 2;
        const g = c.createRadialGradient(iw / 2, ih / 2, r * 0.35, iw / 2, ih / 2, r);
        g.addColorStop(0, "rgba(0,0,0,0)");
        g.addColorStop(1, `rgba(0,0,0,${0.75 * vignette})`);
        c.fillStyle = g;
        c.fillRect(0, 0, iw, ih);
      }
    } else {
      c.fillStyle = "#d9d5cd";
      c.fillRect(0, 0, iw, ih);
      if (!el.assetId) {
        // "+" placeholder for an empty cell / frame.
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
      traceMask(c, mask, w, h, el.cornerRadius, el.border.width / 2);
      c.lineWidth = el.border.width;
      c.strokeStyle = el.border.color;
      c.stroke();
      c.restore();
    }
  }

  function hit(ctx: Konva.Context, shape: Konva.Shape) {
    traceMask(ctx._context, el.frame !== "none" ? "none" : el.mask, w, h, el.cornerRadius);
    ctx.fillStrokeShape(shape);
  }

  /** Slot panning: keep the frame in place, shift the crop instead. */
  function panSlot(node: Konva.Node) {
    const start = panStart.current;
    if (!start || !asset) return;
    const scale = el.crop.width / frameInset(el.frame, w, h).width; // image px per frame px
    const t = (-el.rotation * Math.PI) / 180;
    const dx = node.x() - start.x;
    const dy = node.y() - start.y;
    // Finger movement in the frame's own (rotated) axes.
    const fx = dx * Math.cos(t) - dy * Math.sin(t);
    const fy = dx * Math.sin(t) + dy * Math.cos(t);
    node.position(start);
    liveCrop.current = {
      ...el.crop,
      x: Math.max(0, Math.min(asset.width - el.crop.width, el.crop.x - fx * scale * (el.flipX ? -1 : 1))),
      y: Math.max(0, Math.min(asset.height - el.crop.height, el.crop.y - fy * scale * (el.flipY ? -1 : 1))),
    };
    node.getLayer()?.batchDraw();
  }

  return (
    <Shape
      id={el.id}
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
      draggable={draggable}
      preventDefault={preventDefault}
      onMouseDown={el.assetId ? onMouseSelect : undefined}
      // Empty cell ("+"): tap / click opens the photo picker right away and fills this cell.
      onClick={el.assetId ? undefined : () => fillEmpty()}
      onTap={el.assetId ? onSelect : () => fillEmpty()}
      onDragStart={(e) => {
        if (inside) panStart.current = { x: e.target.x(), y: e.target.y() };
      }}
      onDragMove={(e) => (inside ? panSlot(e.target) : onDragMove(e.target, el))}
      // One history step per gesture: recorded when the finger is lifted.
      onDragEnd={(e) => {
        if (inside) {
          const crop = liveCrop.current;
          liveCrop.current = null;
          panStart.current = null;
          e.target.position({ x: cx, y: cy });
          if (crop) updateElement(el.id, { crop });
          return;
        }
        onDragEnd();
        updateElement(el.id, { x: e.target.x() - w / 2, y: e.target.y() - h / 2 });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const nw = Math.max(20, w * node.scaleX());
        const nh = Math.max(20, h * node.scaleY());
        node.scale({ x: 1, y: 1 });
        updateElement(el.id, {
          x: node.x() - nw / 2,
          y: node.y() - nh / 2,
          width: nw,
          height: nh,
          rotation: node.rotation(),
        });
      }}
    />
  );
}
