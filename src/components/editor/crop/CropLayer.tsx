"use client";

import { Group, Layer, Shape } from "react-konva";
import { cropWindow, toView } from "@/lib/project/cropView";
import { useEditor, useViewDoc } from "@/store/editor";
import { useHtmlImage } from "../canvas/useHtmlImage";
import { picSize, pictureHandles, windowHandles, windowResizable } from "./cropModel";

const ACCENT = "#f2b84b";

/**
 * Cropping on the canvas (D-111): everything else dark, the whole picture faint outside
 * the window and bright inside it, the window with its corner marks (and edge bars when
 * it can be resized), the picture's own outline with its zoom handles. Drawn only — the
 * gestures are handled by CropGestures above the stage.
 */
export function CropLayer({ id, viewScale }: { id: string; viewScale: number }) {
  const doc = useViewDoc();
  const found = doc?.elements.find((e) => e.id === id);
  const el = found?.type === "image" ? found : undefined;
  const asset = useEditor((s) => (el?.assetId ? s.assets[el.assetId] : undefined));
  const image = useHtmlImage(asset?.video ? asset.video.posterUrl : asset?.url);
  if (!el || !asset) return null;
  const win = cropWindow(el);
  const pic = picSize(asset);
  const view = toView(el, win, pic);
  const px = 1 / viewScale;
  const resizable = windowResizable(el);

  return (
    <Layer listening={false}>
      <Group x={el.x + el.width / 2} y={el.y + el.height / 2} rotation={el.rotation}>
        <Group x={win.cx} y={win.cy}>
          <Shape
            sceneFunc={(ctx) => {
              const c = ctx._context;
              const hw = win.width / 2;
              const hh = win.height / 2;
              const drawPicture = () => {
                if (!image) return;
                c.save();
                c.translate(view.px, view.py);
                c.rotate((view.theta * Math.PI) / 180);
                c.scale(view.z * (el.flipX ? -1 : 1), view.z * (el.flipY ? -1 : 1));
                c.drawImage(image, -pic.width / 2, -pic.height / 2, pic.width, pic.height);
                c.restore();
              };
              const BIG = 1e6;
              // Outside the window: dark over everything, the picture faint on top.
              c.save();
              c.beginPath();
              c.rect(-BIG, -BIG, BIG * 2, BIG * 2);
              c.rect(-hw, -hh, win.width, win.height);
              c.clip("evenodd");
              c.fillStyle = "rgba(14,14,16,0.93)";
              c.fillRect(-BIG, -BIG, BIG * 2, BIG * 2);
              c.globalAlpha = 0.45;
              drawPicture();
              c.restore();
              // Inside: the picture as it will be (above any element over it).
              c.save();
              c.beginPath();
              c.rect(-hw, -hh, win.width, win.height);
              c.clip();
              drawPicture();
              // Thirds.
              c.strokeStyle = "rgba(255,255,255,0.4)";
              c.lineWidth = px;
              c.beginPath();
              for (let i = 1; i < 3; i++) {
                c.moveTo(-hw + (win.width * i) / 3, -hh);
                c.lineTo(-hw + (win.width * i) / 3, hh);
                c.moveTo(-hw, -hh + (win.height * i) / 3);
                c.lineTo(hw, -hh + (win.height * i) / 3);
              }
              c.stroke();
              c.restore();

              // The picture's outline and zoom handles.
              const hs = pictureHandles(view, pic);
              c.strokeStyle = ACCENT;
              c.lineWidth = 1.5 * px;
              c.beginPath();
              hs.slice(0, 4).forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
              c.closePath();
              c.stroke();
              for (const p of hs) {
                c.beginPath();
                c.arc(p.x, p.y, 6 * px, 0, Math.PI * 2);
                c.fillStyle = "#ffffff";
                c.fill();
                c.lineWidth = 1.5 * px;
                c.stroke();
              }

              // The window: border, corner marks, edge bars.
              c.strokeStyle = "#ffffff";
              c.lineWidth = 1.5 * px;
              c.strokeRect(-hw, -hh, win.width, win.height);
              c.lineWidth = 4 * px;
              c.lineCap = "round";
              const L = Math.min(22 * px, win.width / 3, win.height / 3);
              for (const h of windowHandles(win)) {
                c.beginPath();
                if (h.sx && h.sy) {
                  c.moveTo(h.x, h.y - h.sy * L);
                  c.lineTo(h.x, h.y);
                  c.lineTo(h.x - h.sx * L, h.y);
                } else if (resizable) {
                  const b = Math.min(14 * px, (h.sx ? win.height : win.width) / 6);
                  if (h.sx) {
                    c.moveTo(h.x, h.y - b);
                    c.lineTo(h.x, h.y + b);
                  } else {
                    c.moveTo(h.x - b, h.y);
                    c.lineTo(h.x + b, h.y);
                  }
                }
                c.stroke();
              }
            }}
          />
        </Group>
      </Group>
    </Layer>
  );
}
