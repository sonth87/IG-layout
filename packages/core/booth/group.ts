// Group rooms (D-159): the host picks the frame; each shot of the roll is everyone's photo
// of that moment, tiled into the cell (2 people side by side, 4 in a 2 × 2…). The tiled
// shot then goes through the same frames, themes and export as a solo roll.

/** Columns × rows for `n` tiles in a cell of aspect `cell` (w / h): the tiles closest to a
 * camera's own shape (4:3 or 3:4, whichever suits the cell), ties to more columns. */
export function tiling(n: number, cell: number): { cols: number; rows: number } {
  let best = { cols: 1, rows: n, score: Infinity };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const tile = (cell * rows) / cols;
    // Distance from a 4:3 / 3:4 photo (log scale, so 2× wide = 2× tall), plus empty slots.
    const score = Math.min(Math.abs(Math.log(tile / (4 / 3))), Math.abs(Math.log(tile / (3 / 4)))) + (cols * rows - n) * 0.15;
    if (score < best.score - 1e-6) best = { cols, rows, score };
  }
  return { cols: best.cols, rows: best.rows };
}

const WIDTH = 1600;
const GAP = 6;

/** Everyone's photo of one shot, tiled into one picture of aspect `cell` (JPEG). */
export async function tileShot(photos: Blob[], cell: number): Promise<Blob> {
  const images = await Promise.all(photos.map((b) => createImageBitmap(b)));
  const W = WIDTH;
  const H = Math.round(WIDTH / cell);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#111";
  c.fillRect(0, 0, W, H);
  const { cols, rows } = tiling(images.length, cell);
  const tw = (W - GAP * (cols - 1)) / cols;
  const th = (H - GAP * (rows - 1)) / rows;
  images.forEach((img, i) => {
    const row = Math.floor(i / cols);
    // The last row, if short, is centred.
    const inRow = row === rows - 1 ? images.length - cols * (rows - 1) : cols;
    const x0 = (W - (inRow * tw + (inRow - 1) * GAP)) / 2;
    const x = x0 + (i - row * cols) * (tw + GAP);
    const y = row * (th + GAP);
    const k = Math.max(tw / img.width, th / img.height);
    c.save();
    c.beginPath();
    c.rect(x, y, tw, th);
    c.clip();
    c.drawImage(img, x + (tw - img.width * k) / 2, y + (th - img.height * k) / 2, img.width * k, img.height * k);
    c.restore();
    img.close();
  });
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.92));
}
