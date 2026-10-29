// Background textures (M19, editor-v2/12 §3): tiles drawn by code — papers, kraft, linen,
// marble, wood… — so nothing is downloaded and every export matches (D-66: our own).

const TILE = 512;

/** Small seeded random, so a texture looks the same every time. */
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function noise(c: CanvasRenderingContext2D, amount: number, seed: number, dark = false) {
  const img = c.getImageData(0, 0, TILE, TILE);
  const r = rng(seed);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (r() - 0.5) * amount;
    img.data[i] += dark ? n * 0.6 : n;
    img.data[i + 1] += dark ? n * 0.6 : n;
    img.data[i + 2] += dark ? n * 0.6 : n;
  }
  c.putImageData(img, 0, 0);
}

function fill(c: CanvasRenderingContext2D, color: string) {
  c.fillStyle = color;
  c.fillRect(0, 0, TILE, TILE);
}

type Draw = (c: CanvasRenderingContext2D) => void;

const paper = (color: string, grain = 14): Draw => (c) => {
  fill(c, color);
  noise(c, grain, color.length * 97);
};

export const TEXTURES: Record<string, { name: { en: string; vi: string }; base: string; draw: Draw }> = {
  paper: { name: { en: "White paper", vi: "Giấy trắng" }, base: "#f7f5f0", draw: paper("#f7f5f0") },
  ivory: { name: { en: "Ivory paper", vi: "Giấy ngà" }, base: "#f1e8d4", draw: paper("#f1e8d4") },
  pinkPaper: { name: { en: "Pink paper", vi: "Giấy hồng" }, base: "#f4d9d6", draw: paper("#f4d9d6") },
  mintPaper: { name: { en: "Mint paper", vi: "Giấy xanh bạc hà" }, base: "#d9eade", draw: paper("#d9eade") },
  bluePaper: { name: { en: "Blue paper", vi: "Giấy xanh" }, base: "#d6e2ef", draw: paper("#d6e2ef") },
  kraft: {
    name: { en: "Kraft", vi: "Giấy kraft" },
    base: "#c49a6c",
    draw: (c) => {
      fill(c, "#c49a6c");
      const r = rng(7);
      c.strokeStyle = "rgba(90,60,30,0.18)";
      for (let i = 0; i < 260; i++) {
        const x = r() * TILE;
        const y = r() * TILE;
        c.lineWidth = r() * 1.2;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x + (r() - 0.5) * 40, y + (r() - 0.5) * 8);
        c.stroke();
      }
      noise(c, 22, 8);
    },
  },
  cardboard: {
    name: { en: "Cardboard", vi: "Bìa cứng" },
    base: "#b98d5d",
    draw: (c) => {
      fill(c, "#b98d5d");
      c.fillStyle = "rgba(80,50,20,0.08)";
      for (let x = 0; x < TILE; x += 16) c.fillRect(x, 0, 7, TILE);
      noise(c, 18, 9);
    },
  },
  linen: {
    name: { en: "Linen", vi: "Vải lanh" },
    base: "#e8e1d4",
    draw: (c) => {
      fill(c, "#e8e1d4");
      const r = rng(11);
      for (let i = 0; i < TILE; i += 2) {
        c.fillStyle = `rgba(120,100,80,${0.04 + r() * 0.06})`;
        c.fillRect(0, i, TILE, 1);
        c.fillStyle = `rgba(120,100,80,${0.03 + r() * 0.05})`;
        c.fillRect(i, 0, 1, TILE);
      }
      noise(c, 10, 12);
    },
  },
  marble: {
    name: { en: "Marble", vi: "Đá cẩm thạch" },
    base: "#f2f1ee",
    draw: (c) => {
      fill(c, "#f2f1ee");
      const r = rng(21);
      for (let v = 0; v < 9; v++) {
        c.strokeStyle = `rgba(110,110,120,${0.08 + r() * 0.2})`;
        c.lineWidth = 0.6 + r() * 2.4;
        c.beginPath();
        let x = r() * TILE;
        let y = 0;
        c.moveTo(x, y);
        while (y < TILE) {
          x += (r() - 0.5) * 60;
          y += 20 + r() * 30;
          c.lineTo(x, y);
        }
        c.stroke();
      }
      noise(c, 8, 22);
    },
  },
  wood: {
    name: { en: "Wood", vi: "Gỗ" },
    base: "#b58358",
    draw: (c) => {
      fill(c, "#b58358");
      const r = rng(31);
      for (let y = 0; y < TILE; y += 3) {
        c.fillStyle = `rgba(70,40,15,${0.05 + Math.abs(Math.sin(y * 0.05 + r())) * 0.12})`;
        c.fillRect(0, y, TILE, 2);
      }
      noise(c, 16, 32);
    },
  },
  concrete: {
    name: { en: "Concrete", vi: "Bê tông" },
    base: "#bdbab4",
    draw: (c) => {
      fill(c, "#bdbab4");
      const r = rng(41);
      for (let i = 0; i < 90; i++) {
        c.fillStyle = `rgba(${r() > 0.5 ? "255,255,255" : "60,60,60"},0.05)`;
        c.beginPath();
        c.arc(r() * TILE, r() * TILE, 10 + r() * 60, 0, Math.PI * 2);
        c.fill();
      }
      noise(c, 30, 42);
    },
  },
  terrazzo: {
    name: { en: "Terrazzo", vi: "Đá mài" },
    base: "#efe9e1",
    draw: (c) => {
      fill(c, "#efe9e1");
      const r = rng(51);
      const colors = ["#d9726b", "#7fa7a0", "#e8b65a", "#5c6b8a", "#b8a99a"];
      for (let i = 0; i < 140; i++) {
        c.fillStyle = colors[Math.floor(r() * colors.length)];
        c.beginPath();
        const x = r() * TILE;
        const y = r() * TILE;
        const s = 3 + r() * 9;
        c.moveTo(x, y);
        c.lineTo(x + s, y + r() * s);
        c.lineTo(x + r() * s, y + s);
        c.closePath();
        c.fill();
      }
    },
  },
  gridPaper: {
    name: { en: "Grid paper", vi: "Giấy ô ly" },
    base: "#fbfaf6",
    draw: (c) => {
      fill(c, "#fbfaf6");
      c.strokeStyle = "rgba(90,140,200,0.35)";
      c.lineWidth = 1;
      for (let i = 0; i <= TILE; i += 32) {
        c.beginPath();
        c.moveTo(i + 0.5, 0);
        c.lineTo(i + 0.5, TILE);
        c.moveTo(0, i + 0.5);
        c.lineTo(TILE, i + 0.5);
        c.stroke();
      }
    },
  },
  dotPaper: {
    name: { en: "Dot paper", vi: "Giấy chấm" },
    base: "#fbfaf6",
    draw: (c) => {
      fill(c, "#fbfaf6");
      c.fillStyle = "rgba(60,60,60,0.35)";
      for (let x = 16; x < TILE; x += 32) for (let y = 16; y < TILE; y += 32) c.fillRect(x - 1.5, y - 1.5, 3, 3);
    },
  },
  linedPaper: {
    name: { en: "Lined paper", vi: "Giấy kẻ dòng" },
    base: "#fdfcf7",
    draw: (c) => {
      fill(c, "#fdfcf7");
      c.fillStyle = "rgba(90,140,200,0.35)";
      for (let y = 40; y < TILE; y += 40) c.fillRect(0, y, TILE, 1.5);
    },
  },
  watercolor: {
    name: { en: "Watercolor", vi: "Màu nước" },
    base: "#f3e6ea",
    draw: (c) => {
      fill(c, "#fbf7f2");
      const r = rng(61);
      const colors = ["rgba(236,170,180,0.18)", "rgba(170,200,230,0.18)", "rgba(240,210,150,0.16)"];
      for (let i = 0; i < 40; i++) {
        c.fillStyle = colors[i % 3];
        c.beginPath();
        c.arc(r() * TILE, r() * TILE, 40 + r() * 120, 0, Math.PI * 2);
        c.fill();
      }
      noise(c, 8, 62);
    },
  },
  blackPaper: { name: { en: "Black paper", vi: "Giấy đen" }, base: "#1b1b1c", draw: paper("#1b1b1c", 18) },
  darkGrain: {
    name: { en: "Dark grain", vi: "Nền tối có vân" },
    base: "#2b2a28",
    draw: (c) => {
      fill(c, "#2b2a28");
      noise(c, 40, 71, true);
    },
  },
  sand: { name: { en: "Sand", vi: "Cát" }, base: "#e3d3b5", draw: paper("#e3d3b5", 30) },
  canvas: {
    name: { en: "Canvas", vi: "Vải canvas" },
    base: "#eee8dc",
    draw: (c) => {
      fill(c, "#eee8dc");
      for (let i = 0; i < TILE; i += 4) {
        c.fillStyle = "rgba(100,90,70,0.07)";
        c.fillRect(0, i, TILE, 2);
        c.fillRect(i, 0, 2, TILE);
      }
      noise(c, 12, 81);
    },
  },
};

export const TEXTURE_KEYS = Object.keys(TEXTURES);

const tiles = new Map<string, HTMLCanvasElement>();

/** The tile of a texture (drawn once). */
export function textureTile(key: string): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const def = TEXTURES[key];
  if (!def) return null;
  let tile = tiles.get(key);
  if (!tile) {
    tile = document.createElement("canvas");
    tile.width = tile.height = TILE;
    def.draw(tile.getContext("2d", { willReadFrequently: true })!);
    tiles.set(key, tile);
  }
  return tile;
}
