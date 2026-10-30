// gifenc (MIT) ships no types: the part the booth uses (live.ts).
declare module "gifenc" {
  type Palette = number[][];
  interface Encoder {
    writeFrame(index: Uint8Array, width: number, height: number, opts?: { palette?: Palette; delay?: number; repeat?: number; transparent?: boolean }): void;
    finish(): void;
    bytes(): Uint8Array<ArrayBuffer>;
  }
  export function GIFEncoder(): Encoder;
  export function quantize(rgba: Uint8ClampedArray | Uint8Array, maxColors: number, opts?: { format?: string }): Palette;
  export function applyPalette(rgba: Uint8ClampedArray | Uint8Array, palette: Palette, format?: string): Uint8Array;
}
