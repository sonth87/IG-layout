// Booth strip (lab): rows = shots, columns = people (the "table" layout, D-147), on a dark
// film strip with sprocket holes. Each photo is cover-cropped to a 4:3 cell.

const CELL_W = 640;
const CELL_H = 480;
const GAP = 20;
const EDGE = 56; // film margin holding the sprocket holes
const FOOT = 90;

export async function renderStrip(rows: (Blob | undefined)[][], caption: string): Promise<Blob> {
  const cols = Math.max(1, ...rows.map((r) => r.length));
  const W = EDGE * 2 + cols * CELL_W + (cols - 1) * GAP;
  const H = GAP + rows.length * (CELL_H + GAP) + FOOT;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;

  c.fillStyle = "#15110e";
  c.fillRect(0, 0, W, H);
  c.fillStyle = "#efe6d6";
  for (let y = 18; y < H - 18; y += 44) {
    roundRect(c, 18, y, 20, 26, 4);
    roundRect(c, W - 38, y, 20, 26, 4);
  }

  for (let r = 0; r < rows.length; r++) {
    for (let col = 0; col < cols; col++) {
      const x = EDGE + col * (CELL_W + GAP);
      const y = GAP + r * (CELL_H + GAP);
      const blob = rows[r][col];
      if (!blob) {
        c.fillStyle = "#2a231d";
        c.fillRect(x, y, CELL_W, CELL_H);
        continue;
      }
      const img = await createImageBitmap(blob);
      const k = Math.max(CELL_W / img.width, CELL_H / img.height);
      const sw = CELL_W / k;
      const sh = CELL_H / k;
      c.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, CELL_W, CELL_H);
      img.close();
    }
  }

  c.fillStyle = "#efe6d6";
  c.font = "600 30px ui-monospace, Menlo, monospace";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(caption, W / 2, H - FOOT / 2 - 4);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob"))), "image/jpeg", 0.92));
}

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
}
