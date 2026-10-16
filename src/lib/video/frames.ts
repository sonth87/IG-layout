// Export (M13.1): exact decoded frames to draw instead of the live <video>, keyed by
// element id. Set by the exporter for each output frame, read by ImageNode.draw.
export const frameOverrides = new Map<string, CanvasImageSource>();
