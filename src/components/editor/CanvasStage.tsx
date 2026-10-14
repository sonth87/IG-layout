"use client";

import type Konva from "konva";
import { useEffect, useRef, useState } from "react";
import { Image as KImage, Layer, Line, Rect, Stage, Transformer } from "react-konva";
import { canvasSize, type ImageElement } from "@/lib/project/types";
import { useEditor } from "@/store/editor";

function useHtmlImage(url: string | undefined) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) return;
    const img = new window.Image();
    img.onload = () => setImage(img);
    img.src = url;
    return () => {
      img.onload = null;
    };
  }, [url]);
  return image;
}

function ImageNode({ element }: { element: ImageElement }) {
  const asset = useEditor((s) => s.assets[element.assetId]);
  const select = useEditor((s) => s.select);
  const updateElement = useEditor((s) => s.updateElement);
  const image = useHtmlImage(asset?.url);
  const ref = useRef<Konva.Image>(null);

  // Rendered before the image has loaded so the selection can attach to it right away.
  return (
    <KImage
      ref={ref}
      id={element.id}
      image={image ?? undefined}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      draggable
      onMouseDown={() => select(element.id)}
      onTap={() => select(element.id)}
      onDragStart={() => select(element.id)}
      // One history step per gesture: recorded when the finger is lifted.
      onDragEnd={(e) => updateElement(element.id, { x: e.target.x(), y: e.target.y() })}
      onTransformEnd={() => {
        const node = ref.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scale({ x: 1, y: 1 });
        updateElement(element.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * scaleX),
          height: Math.max(20, node.height() * scaleY),
          rotation: node.rotation(),
        });
      }}
    />
  );
}

/** Lives in its own layer so selection handles never end up in exports. */
function SelectionTransformer({ selectedId }: { selectedId: string | null }) {
  const trRef = useRef<Konva.Transformer>(null);
  const elements = useEditor((s) => s.doc?.elements);

  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const node = selectedId ? tr.getStage()?.findOne(`#${selectedId}`) : undefined;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, elements]);

  return (
    <Transformer
      ref={trRef}
      keepRatio
      rotateEnabled
      anchorSize={18}
      anchorCornerRadius={9}
      borderStroke="#f2b84b"
      borderStrokeWidth={2}
      anchorStroke="#f2b84b"
      anchorFill="#ffffff"
      rotateAnchorOffset={36}
      enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
      ignoreStroke
    />
  );
}

interface Props {
  viewScale: number;
  contentLayerRef: React.RefObject<Konva.Layer | null>;
}

export default function CanvasStage({ viewScale, contentLayerRef }: Props) {
  const doc = useEditor((s) => s.doc);
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  if (!doc) return null;

  const { width, height, slide } = canvasSize(doc);

  return (
    <Stage
      width={width * viewScale}
      height={height * viewScale}
      scaleX={viewScale}
      scaleY={viewScale}
      onMouseDown={(e) => e.target === e.target.getStage() && select(null)}
    >
      {/* Content layer: exactly what gets exported. */}
      <Layer ref={contentLayerRef}>
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={doc.background}
          // Let swipes on empty space scroll the slide strip on touch devices.
          preventDefault={false}
          onMouseDown={() => select(null)}
          onTap={() => select(null)}
        />
        {doc.elements.map((el) => (
          <ImageNode key={el.id} element={el} />
        ))}
      </Layer>
      {/* Guides: slide boundaries, never exported. */}
      <Layer listening={false}>
        {Array.from({ length: doc.slideCount - 1 }, (_, i) => (
          <Line
            key={i}
            points={[(i + 1) * slide.width, 0, (i + 1) * slide.width, height]}
            stroke="#ffffff"
            strokeWidth={2 / viewScale}
            dash={[10 / viewScale, 8 / viewScale]}
            shadowColor="#000000"
            shadowBlur={2 / viewScale}
            shadowOpacity={0.6}
          />
        ))}
      </Layer>
      <Layer>
        <SelectionTransformer selectedId={selectedId} />
      </Layer>
    </Stage>
  );
}
