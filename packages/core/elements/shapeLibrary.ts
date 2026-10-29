// Shape library (M19, editor-v2/11 §4): outlines as SVG paths in a 100 × 100 box,
// drawn with Path2D at any size and colour. Generated (polygons, stars, flowers…) or
// hand-written; our own drawings (D-66).

const f = (n: number) => Math.round(n * 10) / 10;

function polygon(n: number, rot = -90, r = 50) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    return `${f(50 + r * Math.cos(a))},${f(50 + r * Math.sin(a))}`;
  });
  return `M${pts.join("L")}Z`;
}

function star(n: number, inner: number) {
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = ((-90 + (180 / n) * i) * Math.PI) / 180;
    const r = i % 2 ? 50 * inner : 50;
    return `${f(50 + r * Math.cos(a))},${f(50 + r * Math.sin(a))}`;
  });
  return `M${pts.join("L")}Z`;
}

/** Petals as circles around the centre. */
function flower(n: number, petal: number, ring: number) {
  let d = `M${50 + ring - petal},50`;
  for (let i = 0; i < n; i++) {
    const a = ((360 / n) * i * Math.PI) / 180;
    const cx = f(50 + ring * Math.cos(a));
    const cy = f(50 + ring * Math.sin(a));
    d += `M${f(cx - petal)},${cy}a${petal},${petal} 0 1,0 ${f(petal * 2)},0a${petal},${petal} 0 1,0 ${-f(petal * 2)},0`;
  }
  return `${d}M${50 - ring},50a${ring},${ring} 0 1,0 ${ring * 2},0a${ring},${ring} 0 1,0 ${-ring * 2},0`;
}

/** Wavy circle / rectangle edge (scalloped). */
function scallop(n: number, depth: number) {
  const pts: string[] = [];
  for (let i = 0; i <= n * 8; i++) {
    const a = (i / (n * 8)) * Math.PI * 2;
    const r = 50 - depth + depth * Math.cos(a * n);
    pts.push(`${f(50 + r * Math.cos(a))},${f(50 + r * Math.sin(a))}`);
  }
  return `M${pts.join("L")}Z`;
}

/** Stamp: rectangle with round bites along its edges. */
function stamp() {
  const d = "M6,6H94V94H6Z";
  const holes: string[] = [];
  for (let i = 0; i <= 9; i++) {
    const p = 6 + i * 9.8;
    for (const [x, y] of [[p, 6], [p, 94], [6, p], [94, p]]) holes.push(`M${f(x - 3)},${f(y)}a3,3 0 1,0 6,0a3,3 0 1,0 -6,0`);
  }
  return d + holes.join("");
}

export interface LibraryShape {
  path: string;
  name: { en: string; vi: string };
  /** Box shape when added (width / height). */
  aspect?: number;
  /** Holes cut with even-odd filling (outlines, stamps). */
  evenOdd?: boolean;
}

const n = (en: string, vi: string) => ({ en, vi });

export const SHAPE_PATHS = {
  diamond: { path: "M50,0L100,50L50,100L0,50Z", name: n("Diamond", "Hình thoi") },
  pentagon: { path: polygon(5), name: n("Pentagon", "Ngũ giác") },
  hexagon: { path: polygon(6, 0), name: n("Hexagon", "Lục giác") },
  semicircle: { path: "M0,75A50,50 0 0,1 100,75Z", name: n("Semicircle", "Bán nguyệt"), aspect: 2 },
  parallelogram: { path: "M25,20H100L75,80H0Z", name: n("Parallelogram", "Hình bình hành"), aspect: 1.6 },
  lineDashed: { path: Array.from({ length: 6 }, (_, i) => `M${i * 17.5},40h11v20h-11z`).join(""), name: n("Dashed line", "Đường gạch"), aspect: 10 },
  lineDotted: { path: Array.from({ length: 9 }, (_, i) => `M${i * 11.8 + 1},50a5,5 0 1,0 10,0a5,5 0 1,0 -10,0`).join(""), name: n("Dotted line", "Đường chấm"), aspect: 10 },
  star4: { path: star(4, 0.38), name: n("4-point star", "Sao 4 cánh") },
  star5: { path: star(5, 0.45), name: n("Star", "Sao 5 cánh") },
  star6: { path: star(6, 0.55), name: n("6-point star", "Sao 6 cánh") },
  star8: { path: star(8, 0.62), name: n("8-point star", "Sao 8 cánh") },
  heart: { path: "M50,92C20,70 0,52 0,30A24,24 0 0,1 50,18A24,24 0 0,1 100,30C100,52 80,70 50,92Z", name: n("Heart", "Tim") },
  heartRound: { path: "M50,95C12,72 2,50 8,30C14,8 40,6 50,24C60,6 86,8 92,30C98,50 88,72 50,95Z", name: n("Round heart", "Tim tròn") },
  heartTilt: { path: "M58,95C26,80 4,58 10,34C15,14 38,10 50,26C64,8 90,16 92,38C94,62 76,80 58,95Z", name: n("Tilted heart", "Tim nghiêng") },
  arrowLeft: { path: "M100,38H40V18L0,50L40,82V62H100Z", name: n("Arrow left", "Mũi tên trái"), aspect: 2 },
  arrowTurn: { path: "M10,90V45A25,25 0 0,1 35,20H70V5L95,30L70,55V40H35A5,5 0 0,0 30,45V90Z", name: n("Turn arrow", "Mũi tên rẽ") },
  chevron: { path: "M0,0H55L100,50L55,100H0L45,50Z", name: n("Chevron", "Mũi tên nhọn") },
  pin: { path: "M50,100C30,72 14,56 14,36A36,36 0 0,1 86,36C86,56 70,72 50,100ZM50,22A14,14 0 1,0 50.1,22Z", name: n("Map pin", "Ghim bản đồ"), evenOdd: true, aspect: 0.75 },
  bubbleRound: { path: "M50,6C77,6 98,24 98,46S77,86 50,86C42,86 34,85 28,82L6,94L14,74C6,66 2,56 2,46C2,24 23,6 50,6Z", name: n("Speech bubble", "Bong bóng thoại") },
  bubbleSquare: { path: "M6,6H94V72H40L18,94V72H6Z", name: n("Square bubble", "Bong bóng vuông") },
  bubbleCloud: { path: "M30,80A16,16 0 0,1 22,50A20,20 0 0,1 50,24A22,22 0 0,1 88,40A16,16 0 0,1 82,80ZM20,92a5,5 0 1,0 0.1,0Z", name: n("Thought bubble", "Bong bóng mây") },
  tag: { path: "M0,30H75L100,50L75,70H0Z", name: n("Tag", "Nhãn"), aspect: 2.5 },
  calendar: { path: "M8,18H92V94H8ZM24,6h10v22h-10zM66,6h10v22h-10zM18,40H82V84H18Z", name: n("Calendar", "Lịch"), evenOdd: true },
  idCard: { path: "M4,16H96V84H4ZM30,30a11,11 0 1,0 0.1,0ZM14,72c0-14 8-20 16-20s16 6 16 20ZM56,36H86V44H56ZM56,54H80V62H56Z", name: n("ID card", "Thẻ người"), evenOdd: true, aspect: 1.4 },
  pinRing: { path: "M50,100C30,72 14,56 14,36A36,36 0 0,1 86,36C86,56 70,72 50,100ZM50,88C64,68 76,54 76,36A26,26 0 0,0 24,36C24,54 36,68 50,88Z", name: n("Pin outline", "Ghim viền"), evenOdd: true, aspect: 0.75 },
  ribbon: { path: "M0,25H100L88,50L100,75H0L12,50Z", name: n("Ribbon", "Băng nơ"), aspect: 3 },
  swallowtail: { path: "M0,20H100V80H0L18,50Z", name: n("Swallowtail", "Cờ đuôi én"), aspect: 3 },
  hexFlat: { path: "M15,20H85L100,50L85,80H15L0,50Z", name: n("Flat hexagon", "Lục giác dẹt"), aspect: 2.5 },
  clover: { path: flower(4, 22, 22), name: n("Clover", "Cỏ bốn lá") },
  flowerRound: { path: flower(8, 14, 34), name: n("Flower", "Hoa tròn") },
  flowerStar: { path: star(10, 0.72), name: n("Star flower", "Hoa sao") },
  scallop: { path: scallop(12, 5), name: n("Scalloped circle", "Hoa răng cưa") },
  flower4: { path: "M50,0Q60,40 100,50Q60,60 50,100Q40,60 0,50Q40,40 50,0Z", name: n("Sparkle", "Hoa bốn cánh") },
  archShape: { path: "M0,100V50A50,50 0 0,1 100,50V100Z", name: n("Arch", "Vòm"), aspect: 0.8 },
  wave: { path: "M0,40Q12.5,20 25,40T50,40T75,40T100,40V60Q87.5,80 75,60T50,60T25,60T0,60Z", name: n("Wave", "Sóng"), aspect: 3 },
  uShape: { path: "M0,0H30V60A20,20 0 0,0 70,60V0H100V60A50,50 0 0,1 0,60Z", name: n("U", "Chữ U") },
  zShape: { path: "M0,0H100V22L38,78H100V100H0V78L62,22H0Z", name: n("Z", "Chữ Z") },
  xShape: { path: "M0,15L15,0L50,35L85,0L100,15L65,50L100,85L85,100L50,65L15,100L0,85L35,50Z", name: n("Cross", "Chữ X") },
  stamp: { path: stamp(), name: n("Stamp", "Con tem"), evenOdd: true, aspect: 0.8 },
} satisfies Record<string, LibraryShape>;

export type PathShape = keyof typeof SHAPE_PATHS;

/** Groups of the Shapes sheet, in the reference's order. Built-in kinds come first in "basic". */
export const SHAPE_GROUPS: { id: string; name: { en: string; vi: string }; items: string[] }[] = [
  { id: "basic", name: n("Basic", "Cơ bản"), items: ["rect", "roundRect", "circle", "triangle", "diamond", "pentagon", "hexagon", "semicircle", "parallelogram"] },
  { id: "lines", name: n("Lines", "Đường"), items: ["line", "lineDashed", "lineDotted", "arrow"] },
  { id: "stars", name: n("Stars", "Sao"), items: ["star4", "star5", "star6", "star8"] },
  { id: "hearts", name: n("Hearts", "Tim"), items: ["heart", "heartRound", "heartTilt"] },
  { id: "arrows", name: n("Arrows", "Mũi tên"), items: ["chevron", "arrowLeft", "arrowTurn"] },
  { id: "callouts", name: n("Callouts", "Chú ý"), items: ["idCard", "pin", "calendar", "pinRing", "bubbleRound", "bubbleCloud", "bubbleSquare", "tag", "stamp"] },
  { id: "banners", name: n("Banners", "Băng rôn"), items: ["hexFlat", "ribbon", "swallowtail"] },
  { id: "flowers", name: n("Flowers", "Hoa"), items: ["clover", "flowerStar", "flowerRound", "flower4", "scallop"] },
  { id: "abstract", name: n("Abstract", "Trừu tượng"), items: ["archShape", "wave", "uShape", "zShape", "xShape", "film"] },
];
