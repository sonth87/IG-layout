"use client";

import { Image as KImage, Rect } from "react-konva";
import type { Background } from "@/lib/project/types";
import { useEditor } from "@/store/editor";
import { useBlurredImage } from "./useHtmlImage";

interface Props {
  background: Background;
  width: number;
  height: number;
}

function gradientPoints(angle: number, width: number, height: number) {
  const t = (angle * Math.PI) / 180;
  const dx = (Math.sin(t) * width) / 2;
  const dy = (-Math.cos(t) * height) / 2;
  return {
    start: { x: width / 2 - dx, y: height / 2 - dy },
    end: { x: width / 2 + dx, y: height / 2 + dy },
  };
}

/** Background of the whole canvas. Tapping it clears the selection. */
export function BackgroundNode({ background, width, height }: Props) {
  const select = useEditor((s) => s.select);
  const blurUrl = useEditor((s) => (background.kind === "blur" ? s.assets[background.assetId]?.url : undefined));
  const blurred = useBlurredImage(blurUrl, width / height);

  const common = {
    x: 0,
    y: 0,
    width,
    height,
    // Let swipes on empty space scroll the slide strip on touch devices.
    preventDefault: false,
    onMouseDown: () => select(null),
    onTap: () => select(null),
  };

  if (background.kind === "gradient") {
    const { start, end } = gradientPoints(background.angle, width, height);
    return (
      <Rect
        {...common}
        fillLinearGradientStartPoint={start}
        fillLinearGradientEndPoint={end}
        fillLinearGradientColorStops={[0, background.from, 1, background.to]}
      />
    );
  }
  if (background.kind === "blur") {
    return blurred ? <KImage {...common} image={blurred} /> : <Rect {...common} fill="#9a9a9a" />;
  }
  return <Rect {...common} fill={background.color} />;
}
