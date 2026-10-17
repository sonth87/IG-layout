"use client";

import { Image as KImage, Rect } from "react-konva";
import type { Background } from "@/lib/project/types";
import { useEditor } from "@/store/editor";
import { stillUrl } from "@/lib/project/types";
import { useBlurredImage, useHtmlImage } from "./useHtmlImage";
import { TEXTURES, textureTile } from "@/lib/elements/textures";

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
  const blurUrl = useEditor((s) => (background.kind === "blur" ? s.assets[background.assetId] && stillUrl(s.assets[background.assetId]) : undefined));
  const blurred = useBlurredImage(blurUrl, width / height);
  const packUrl = useEditor((s) => (background.kind === "texture" && background.assetId ? s.assets[background.assetId]?.url : undefined));
  const packImage = useHtmlImage(packUrl);

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
    const stops = (background.stops ?? [
      { color: background.from, at: 0 },
      { color: background.to, at: 1 },
    ])
      .slice()
      .sort((a, b) => a.at - b.at)
      .flatMap((s) => [s.at, s.color]);
    if (background.radial)
      return (
        <Rect
          {...common}
          fillRadialGradientStartPoint={{ x: width / 2, y: height / 2 }}
          fillRadialGradientEndPoint={{ x: width / 2, y: height / 2 }}
          fillRadialGradientStartRadius={0}
          fillRadialGradientEndRadius={Math.hypot(width, height) / 2}
          fillRadialGradientColorStops={stops}
        />
      );
    const { start, end } = gradientPoints(background.angle, width, height);
    return <Rect {...common} fillLinearGradientStartPoint={start} fillLinearGradientEndPoint={end} fillLinearGradientColorStops={stops} />;
  }
  if (background.kind === "texture" && background.assetId) {
    // A pack texture (M20): repeated at its own size, or covering the canvas.
    if (!packImage) return <Rect {...common} fill="#f5f3ee" />;
    if (background.tile) return <Rect {...common} fillPatternImage={packImage} fillPatternRepeat="repeat" />;
    const k = Math.max(width / packImage.width, height / packImage.height);
    return <Rect {...common} fillPatternImage={packImage} fillPatternRepeat="no-repeat" fillPatternScaleX={k} fillPatternScaleY={k} fillPatternX={(width - packImage.width * k) / 2} fillPatternY={(height - packImage.height * k) / 2} />;
  }
  if (background.kind === "texture") {
    const tile = textureTile(background.texture);
    return tile ? <Rect {...common} fillPatternImage={tile as unknown as HTMLImageElement} fillPatternRepeat="repeat" /> : <Rect {...common} fill={TEXTURES[background.texture]?.base ?? "#f5f3ee"} />;
  }
  if (background.kind === "blur") {
    return blurred ? <KImage {...common} image={blurred} /> : <Rect {...common} fill="#9a9a9a" />;
  }
  return <Rect {...common} fill={background.color} />;
}
