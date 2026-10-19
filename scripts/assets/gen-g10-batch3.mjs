import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT = process.cwd();

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }

function syncExistingSrc(kind, packId) {
  const dir = path.join(ROOT, 'assets', kind, packId);
  const srcDir = path.join(dir, 'src');
  ensureDir(srcDir);
  const pubDir = path.join(ROOT, 'public', 'packs', kind, packId);
  const manifestPath = path.join(dir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) return;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const oldDate = new Date(1000000000000);
  for (const item of manifest.items) {
    const pubWebp = path.join(pubDir, `${item.id}.webp`);
    if (fs.existsSync(pubWebp)) {
      for (const ext of ['.png', '.jpg', '.jpeg', '.svg', '.webp']) {
        const p = path.join(srcDir, `${item.id}${ext}`);
        if (fs.existsSync(p) && ext !== '.webp') fs.unlinkSync(p);
      }
      const destWebp = path.join(srcDir, `${item.id}.webp`);
      fs.copyFileSync(pubWebp, destWebp);
      fs.utimesSync(destWebp, oldDate, oldDate);
    }
  }
}

async function saveSvgAsPng(svgBody, outPath, w = 800, h = 800) {
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <filter id="drop" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#1A1512" flood-opacity="0.16"/>
      </filter>
    </defs>
    <g filter="url(#drop)">
      ${svgBody}
    </g>
  </svg>`;
  await sharp(Buffer.from(fullSvg)).png().toFile(outPath);
}

const ILLUS_ITEMS = [
  ['illus-girl-watering-plants', 'Girl Watering Houseplants Illustration', 'Cô gái tưới chậu cây xanh trong nhà', ['illustration', 'girl', 'plants', 'watering'], ['minh hoạ', 'cô gái', 'tưới cây', 'cây xanh'], ['handDrawn', 'cute', 'nature'],
    `<circle cx="340" cy="240" r="65" fill="#FDE2C8" stroke="#2B2118" stroke-width="9"/>
     <path d="M275 230 C275 160 405 160 405 230 C415 190 385 155 340 155 C295 155 265 190 275 230 Z" fill="#2B2118"/>
     <circle cx="320" cy="235" r="7" fill="#2B2118"/><circle cx="360" cy="235" r="7" fill="#2B2118"/>
     <path d="M330 260 Q340 272 350 260" fill="none" stroke="#2B2118" stroke-width="6" stroke-linecap="round"/>
     <path d="M265 560 L295 320 L385 320 L415 560 Z" fill="#E07A5F" stroke="#2B2118" stroke-width="9" stroke-linejoin="round"/>
     <path d="M460 390 L550 360 L570 440 L470 450 Z" fill="#81B29A" stroke="#2B2118" stroke-width="9" stroke-linejoin="round"/>
     <path d="M555 390 L635 335" stroke="#2B2118" stroke-width="10" stroke-linecap="round"/>
     <circle cx="655" cy="370" r="8" fill="#6EC6FF"/><circle cx="675" cy="400" r="8" fill="#6EC6FF"/><circle cx="645" cy="415" r="8" fill="#6EC6FF"/>
     <path d="M590 540 L710 540 L690 660 L610 660 Z" fill="#D47A46" stroke="#2B2118" stroke-width="9" stroke-linejoin="round"/>
     <path d="M650 540 C610 470 570 490 620 440 C650 470 670 430 690 480 C710 460 720 510 650 540 Z" fill="#52B788" stroke="#2B2118" stroke-width="8"/>`],
  ['illus-boy-headphones-music', 'Boy Listening to Music with Headphones', 'Chàng trai đeo tai nghe thưởng thức âm nhạc', ['illustration', 'music', 'headphones', 'boy'], ['minh hoạ', 'âm nhạc', 'tai nghe', 'chàng trai'], ['handDrawn', 'cute'],
    `<circle cx="400" cy="310" r="95" fill="#FAD4B8" stroke="#2B2118" stroke-width="10"/>
     <path d="M295 305 A110 110 0 0 1 505 305" fill="none" stroke="#E63946" stroke-width="22" stroke-linecap="round"/>
     <rect x="270" y="275" width="42" height="85" rx="20" fill="#E63946" stroke="#2B2118" stroke-width="9"/>
     <rect x="488" y="275" width="42" height="85" rx="20" fill="#E63946" stroke="#2B2118" stroke-width="9"/>
     <path d="M320 245 C340 195 460 195 480 245 C450 225 350 225 320 245 Z" fill="#2B2118"/>
     <path d="M360 305 Q372 292 384 305 M416 305 Q428 292 440 305" fill="none" stroke="#2B2118" stroke-width="7" stroke-linecap="round"/>
     <path d="M375 345 Q400 365 425 345" fill="none" stroke="#2B2118" stroke-width="7" stroke-linecap="round"/>
     <path d="M270 640 C280 460 520 460 530 640 Z" fill="#457B9D" stroke="#2B2118" stroke-width="10" stroke-linejoin="round"/>
     <path d="M570 210 L570 140 L620 125 L620 195" fill="none" stroke="#F4A261" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
     <circle cx="558" cy="210" r="16" fill="#F4A261"/><circle cx="608" cy="195" r="16" fill="#F4A261"/>`],
  ['illus-girl-bicycle-flowers', 'Girl Riding Bicycle with Flower Basket', 'Cô gái đạp xe chở giỏ hoa tươi', ['illustration', 'bicycle', 'flowers', 'girl'], ['minh hoạ', 'xe đạp', 'giỏ hoa', 'cô gái'], ['handDrawn', 'cute', 'travel'],
    `<circle cx="240" cy="520" r="95" fill="none" stroke="#2B2118" stroke-width="12"/>
     <circle cx="560" cy="520" r="95" fill="none" stroke="#2B2118" stroke-width="12"/>
     <path d="M240 520 L370 520 L465 380 L315 380 Z" fill="none" stroke="#E76F51" stroke-width="14" stroke-linejoin="round"/>
     <path d="M560 520 L465 310 L425 310" fill="none" stroke="#E76F51" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
     <rect x="480" y="315" width="90" height="65" rx="12" fill="#E9C46A" stroke="#2B2118" stroke-width="9"/>
     <circle cx="505" cy="300" r="22" fill="#FF6B8B" stroke="#2B2118" stroke-width="7"/>
     <circle cx="545" cy="295" r="24" fill="#FFD166" stroke="#2B2118" stroke-width="7"/>
     <circle cx="355" cy="230" r="52" fill="#FDE2C8" stroke="#2B2118" stroke-width="9"/>
     <path d="M295 365 L340 285 L395 285 L425 365 Z" fill="#2A9D8F" stroke="#2B2118" stroke-width="9"/>`],
  ['illus-painter-palette-beret', 'Artist with Beret and Paint Palette', 'Hoạ sĩ đội mũ nồi cầm bảng pha màu', ['illustration', 'artist', 'palette', 'painting'], ['minh hoạ', 'hoạ sĩ', 'bảng màu', 'nghệ thuật'], ['handDrawn', 'cute', 'journal'],
    `<path d="M240 420 C160 280 340 160 520 220 C650 260 660 440 560 540 C480 610 380 570 380 490 C380 440 300 480 240 420 Z" fill="#F4D5A6" stroke="#2B2118" stroke-width="12"/>
     <circle cx="330" cy="445" r="28" fill="#FFFFFF" stroke="#2B2118" stroke-width="9"/>
     <circle cx="320" cy="280" r="32" fill="#E63946"/><circle cx="430" cy="255" r="32" fill="#F4A261"/>
     <circle cx="530" cy="310" r="32" fill="#2A9D8F"/><circle cx="545" cy="420" r="32" fill="#457B9D"/>
     <circle cx="465" cy="505" r="28" fill="#9B5DE5"/>
     <path d="M480 150 L660 330" stroke="#8D5524" stroke-width="18" stroke-linecap="round"/>
     <path d="M480 150 C440 110 420 150 455 175 Z" fill="#E63946" stroke="#2B2118" stroke-width="7"/>`],
  ['illus-cozy-cat-window', 'Cat Sleeping on Sunny Window Sill', 'Mèo nhỏ nằm ngủ bên khung cửa sổ nắng', ['illustration', 'cat', 'window', 'cozy'], ['minh hoạ', 'mèo ngủ', 'cửa sổ', 'ấm áp'], ['handDrawn', 'cute'],
    `<rect x="180" y="130" width="440" height="520" rx="220" fill="#BDE0FE" stroke="#2B2118" stroke-width="12"/>
     <line x1="400" y1="130" x2="400" y2="650" stroke="#2B2118" stroke-width="10"/>
     <line x1="180" y1="390" x2="620" y2="390" stroke="#2B2118" stroke-width="10"/>
     <circle cx="310" cy="260" r="45" fill="#FFD166"/>
     <rect x="140" y="620" width="520" height="55" rx="14" fill="#DDA15E" stroke="#2B2118" stroke-width="12"/>
     <ellipse cx="410" cy="595" rx="115" ry="55" fill="#F4A261" stroke="#2B2118" stroke-width="10"/>
     <circle cx="325" cy="575" r="45" fill="#F4A261" stroke="#2B2118" stroke-width="10"/>
     <polygon points="295,540 310,505 330,535" fill="#F4A261" stroke="#2B2118" stroke-width="8"/>
     <polygon points="335,535 355,505 365,540" fill="#F4A261" stroke="#2B2118" stroke-width="8"/>
     <path d="M515 605 C565 615 585 665 535 675" fill="none" stroke="#F4A261" stroke-width="22" stroke-linecap="round"/>`],
  ['illus-moka-pot-espresso', 'Classic Italian Moka Espresso Pot', 'Ấm pha cà phê Moka cổ điển Ý', ['illustration', 'coffee', 'moka pot', 'cafe'], ['minh hoạ', 'ấm pha cà phê', 'moka', 'cà phê'], ['handDrawn', 'cute', 'journal'],
    `<polygon points="270,660 530,660 485,430 315,430" fill="#A8B5C2" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <rect x="305" y="395" width="190" height="38" rx="8" fill="#7D8C9D" stroke="#2B2118" stroke-width="10"/>
     <polygon points="315,395 485,395 520,210 280,210" fill="#C5D1DB" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <polygon points="260,210 315,250 280,210" fill="#C5D1DB" stroke="#2B2118" stroke-width="10" stroke-linejoin="round"/>
     <polygon points="280,210 520,210 470,155 330,155" fill="#95A5B5" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <circle cx="400" cy="130" r="24" fill="#2B2118"/>
     <path d="M495 240 L575 240 L575 390 L490 390" fill="none" stroke="#2B2118" stroke-width="24" stroke-linejoin="round" stroke-linecap="round"/>`],
  ['illus-croissant-coffee-cup', 'Butter Croissant & Morning Latte Cup', 'Bánh sừng bò bơ & tách cà phê sáng', ['illustration', 'croissant', 'coffee', 'breakfast'], ['minh hoạ', 'bánh sừng bò', 'cà phê sáng', 'bữa sáng'], ['handDrawn', 'cute', 'journal'],
    `<ellipse cx="470" cy="360" rx="165" ry="125" fill="#FFF8F0" stroke="#2B2118" stroke-width="10"/>
     <ellipse cx="470" cy="340" rx="110" ry="85" fill="#C68B59" stroke="#2B2118" stroke-width="10"/>
     <path d="M445 340 C445 310 495 310 495 340 C495 370 445 370 445 340 Z" fill="#FFF8F0"/>
     <path d="M580 320 C635 320 635 380 580 380" fill="none" stroke="#2B2118" stroke-width="14" stroke-linecap="round"/>
     <path d="M160 540 C150 420 270 350 390 420 C480 475 470 590 380 590 C340 590 340 520 280 520 C220 520 210 580 160 540 Z" fill="#E09F3E" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <path d="M235 415 Q280 475 250 520 M335 410 Q355 475 325 525" fill="none" stroke="#9E5A1A" stroke-width="9" stroke-linecap="round"/>`],
  ['illus-vinyl-record-player', 'Retro Turntable & Vinyl Record', 'Máy đĩa than cổ điển & đĩa nhạc vinyl', ['illustration', 'vinyl', 'turntable', 'music'], ['minh hoạ', 'máy đĩa than', 'đĩa vinyl', 'âm nhạc'], ['handDrawn', 'vintage', 'journal'],
    `<rect x="140" y="180" width="520" height="440" rx="36" fill="#E07A5F" stroke="#2B2118" stroke-width="12"/>
     <circle cx="355" cy="400" r="165" fill="#222222" stroke="#2B2118" stroke-width="10"/>
     <circle cx="355" cy="400" r="115" fill="none" stroke="#444444" stroke-width="5"/>
     <circle cx="355" cy="400" r="58" fill="#F4A261" stroke="#2B2118" stroke-width="8"/>
     <circle cx="355" cy="400" r="14" fill="#FFF8F0"/>
     <circle cx="585" cy="255" r="32" fill="#F2CC8F" stroke="#2B2118" stroke-width="9"/>
     <path d="M585 255 L560 445 L475 495" fill="none" stroke="#F2CC8F" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
     <circle cx="590" cy="545" r="20" fill="#F2CC8F" stroke="#2B2118" stroke-width="7"/>`],
  ['illus-polaroid-instant-camera', 'Pastel Instant Polaroid Camera', 'Máy ảnh chụp lấy liền sắc màu pastel', ['illustration', 'camera', 'polaroid', 'photo'], ['minh hoạ', 'máy ảnh lấy liền', 'polaroid', 'chụp ảnh'], ['handDrawn', 'cute', 'travel'],
    `<rect x="160" y="180" width="480" height="390" rx="55" fill="#FFE5EC" stroke="#2B2118" stroke-width="12"/>
     <rect x="375" y="180" width="50" height="390" fill="#FF6B8B"/>
     <rect x="395" y="180" width="25" height="390" fill="#FFD166"/>
     <rect x="415" y="180" width="25" height="390" fill="#52B788"/>
     <circle cx="400" cy="360" r="105" fill="#3D405B" stroke="#2B2118" stroke-width="12"/>
     <circle cx="400" cy="360" r="65" fill="#1D2030" stroke="#FFFFFF" stroke-width="6"/>
     <circle cx="378" cy="338" r="18" fill="#FFFFFF"/>
     <rect x="515" y="230" width="75" height="55" rx="12" fill="#BDE0FE" stroke="#2B2118" stroke-width="9"/>
     <circle cx="245" cy="255" r="26" fill="#FF6B8B" stroke="#2B2118" stroke-width="9"/>
     <rect x="260" y="515" width="280" height="195" rx="10" fill="#FFFFFF" stroke="#2B2118" stroke-width="10"/>
     <rect x="285" y="535" width="230" height="125" fill="#A8DADC" stroke="#2B2118" stroke-width="7"/>`],
  ['illus-open-sketchbook-pencils', 'Open Sketchbook with Colored Pencils', 'Sổ ký hoạ mở rộng & bút chì màu', ['illustration', 'sketchbook', 'journal', 'drawing'], ['minh hoạ', 'sổ ký hoạ', 'vẽ tranh', 'sổ tay'], ['handDrawn', 'journal'],
    `<path d="M130 230 Q265 200 400 240 Q535 200 670 230 L670 590 Q535 560 400 600 Q265 560 130 590 Z" fill="#FFFDF7" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <line x1="400" y1="240" x2="400" y2="600" stroke="#2B2118" stroke-width="10"/>
     <circle cx="265" cy="365" r="55" fill="#FFD166" stroke="#2B2118" stroke-width="8"/>
     <path d="M185 480 Q265 415 345 480" fill="none" stroke="#52B788" stroke-width="14" stroke-linecap="round"/>
     <line x1="455" y1="320" x2="610" y2="320" stroke="#E07A5F" stroke-width="12" stroke-linecap="round"/>
     <line x1="455" y1="375" x2="590" y2="375" stroke="#81B29A" stroke-width="12" stroke-linecap="round"/>
     <g transform="rotate(-25 520 510)">
       <rect x="370" y="490" width="260" height="36" fill="#E63946" stroke="#2B2118" stroke-width="9"/>
       <polygon points="630,490 680,508 630,526" fill="#FDE2C8" stroke="#2B2118" stroke-width="9"/>
     </g>`],
  ['illus-monstera-ceramic-pot', 'Monstera Deliciosa in Terracotta Pot', 'Chậu cây trầu bà lá xẻ Monstera xanh mát', ['illustration', 'monstera', 'plant', 'botanical'], ['minh hoạ', 'cây trầu bà', 'monstera', 'cây cảnh'], ['handDrawn', 'nature'],
    `<polygon points="280,480 520,480 485,680 315,680" fill="#E07A5F" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <rect x="260" y="445" width="280" height="45" rx="12" fill="#D46548" stroke="#2B2118" stroke-width="12"/>
     <path d="M400 445 C360 360 220 350 200 220 C190 140 310 130 355 240 C370 280 385 360 400 445 Z" fill="#2A9D8F" stroke="#2B2118" stroke-width="10"/>
     <path d="M400 445 C440 350 600 340 610 200 C615 120 490 110 445 230 C425 280 415 360 400 445 Z" fill="#52B788" stroke="#2B2118" stroke-width="10"/>
     <path d="M400 445 C375 310 330 120 400 100 C470 120 425 310 400 445 Z" fill="#40916C" stroke="#2B2118" stroke-width="10"/>
     <ellipse cx="265" cy="235" rx="22" ry="10" fill="#FFFFFF"/><ellipse cx="535" cy="220" rx="22" ry="10" fill="#FFFFFF"/>`],
  ['illus-stack-vintage-books', 'Stack of Colorful Hardcover Books & Glasses', 'Chồng sách bìa cứng sắc màu & mắt kính', ['illustration', 'books', 'reading', 'glasses'], ['minh hoạ', 'chồng sách', 'đọc sách', 'mắt kính'], ['handDrawn', 'journal'],
    `<rect x="160" y="540" width="480" height="85" rx="18" fill="#E76F51" stroke="#2B2118" stroke-width="12"/>
     <rect x="180" y="555" width="430" height="55" rx="10" fill="#FFF8E7" stroke="#2B2118" stroke-width="8"/>
     <rect x="190" y="445" width="430" height="95" rx="18" fill="#2A9D8F" stroke="#2B2118" stroke-width="12"/>
     <rect x="210" y="462" width="380" height="60" rx="10" fill="#FFF8E7" stroke="#2B2118" stroke-width="8"/>
     <rect x="220" y="360" width="370" height="85" rx="18" fill="#E9C46A" stroke="#2B2118" stroke-width="12"/>
     <circle cx="335" cy="300" r="48" fill="#BDE0FE" fill-opacity="0.6" stroke="#2B2118" stroke-width="12"/>
     <circle cx="465" cy="300" r="48" fill="#BDE0FE" fill-opacity="0.6" stroke="#2B2118" stroke-width="12"/>
     <path d="M383 300 Q400 280 417 300" fill="none" stroke="#2B2118" stroke-width="12"/>`],
  ['illus-matcha-boba-tea', 'Iced Matcha Bubble Milk Tea Cup', 'Ly trà sữa trân châu Matcha mát lạnh', ['illustration', 'boba', 'matcha', 'drink'], ['minh hoạ', 'trà sữa', 'trân châu', 'matcha'], ['handDrawn', 'cute'],
    `<polygon points="250,260 550,260 505,670 295,670" fill="#CBE8BA" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <path d="M260 350 Q330 390 400 350 Q470 310 540 350 L530 450 L270 450 Z" fill="#74C69D" opacity="0.7"/>
     <path d="M235 260 C235 160 565 160 565 260 Z" fill="#FFFFFF" fill-opacity="0.85" stroke="#2B2118" stroke-width="12"/>
     <rect x="380" y="95" width="42" height="320" rx="12" fill="#FF6B8B" stroke="#2B2118" stroke-width="10" transform="rotate(8 400 250)"/>
     <circle cx="340" cy="615" r="20" fill="#2B2118"/><circle cx="395" cy="625" r="20" fill="#2B2118"/>
     <circle cx="455" cy="610" r="20" fill="#2B2118"/><circle cx="365" cy="575" r="20" fill="#2B2118"/><circle cx="430" cy="570" r="20" fill="#2B2118"/>`],
  ['illus-strawberry-shortcake-slice', 'Strawberry Shortcake Slice with Cream', 'Miếng bánh kem dâu tây tươi ngọt ngào', ['illustration', 'cake', 'strawberry', 'dessert'], ['minh hoạ', 'bánh kem', 'dâu tây', 'tráng miệng'], ['handDrawn', 'cute'],
    `<polygon points="170,560 630,560 630,350 170,450" fill="#FDE2C8" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <polygon points="170,450 630,350 440,220" fill="#FFFDF9" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <line x1="170" y1="505" x2="630" y2="455" stroke="#FF6B8B" stroke-width="26"/>
     <path d="M400 230 C375 165 465 165 440 230 C425 255 415 255 400 230 Z" fill="#E63946" stroke="#2B2118" stroke-width="10"/>
     <path d="M395 170 L420 145 L445 170" fill="none" stroke="#52B788" stroke-width="10" stroke-linecap="round"/>`],
  ['illus-ceramic-vase-tulips', 'Ceramic Vase with Spring Tulips', 'Bình gốm nghệ thuật cắm hoa tulip xuân', ['illustration', 'vase', 'tulips', 'flowers'], ['minh hoạ', 'bình gốm', 'hoa tulip', 'mùa xuân'], ['handDrawn', 'nature', 'cute'],
    `<path d="M310 380 L490 380 C555 470 540 650 470 680 L330 680 C260 650 245 470 310 380 Z" fill="#F4A261" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <path d="M275 430 C215 430 215 535 280 535 M525 430 C585 430 585 535 520 535" fill="none" stroke="#2B2118" stroke-width="12" stroke-linecap="round"/>
     <path d="M400 380 L400 210 M360 380 Q320 290 290 230 M440 380 Q480 290 510 230" fill="none" stroke="#2A9D8F" stroke-width="12" stroke-linecap="round"/>
     <path d="M355 215 C355 130 445 130 445 215 C445 250 355 250 355 215 Z" fill="#E63946" stroke="#2B2118" stroke-width="10"/>
     <path d="M245 235 C245 155 330 155 330 235 Z" fill="#FF6B8B" stroke="#2B2118" stroke-width="10"/>
     <path d="M470 235 C470 155 555 155 555 235 Z" fill="#FFD166" stroke="#2B2118" stroke-width="10"/>`],
  ['illus-retro-roller-skate', 'Retro Pastel Quad Roller Skate', 'Giày trượt patin 4 bánh phong cách retro', ['illustration', 'roller skate', 'retro', 'pastel'], ['minh hoạ', 'giày trượt patin', 'retro', 'năng động'], ['handDrawn', 'cute'],
    `<path d="M230 170 L390 170 L425 365 L590 420 C625 435 625 510 580 510 L215 510 L230 170 Z" fill="#FF8FA3" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <path d="M230 250 L400 250 M225 320 L412 320" stroke="#FFD166" stroke-width="16" stroke-linecap="round"/>
     <rect x="210" y="510" width="380" height="36" rx="12" fill="#FFF8F0" stroke="#2B2118" stroke-width="10"/>
     <circle cx="275" cy="605" r="55" fill="#4EA8DE" stroke="#2B2118" stroke-width="12"/>
     <circle cx="275" cy="605" r="20" fill="#FFD166"/>
     <circle cx="515" cy="605" r="55" fill="#4EA8DE" stroke="#2B2118" stroke-width="12"/>
     <circle cx="515" cy="605" r="20" fill="#FFD166"/>`],
  ['illus-acoustic-guitar-folk', 'Wooden Folk Acoustic Guitar', 'Đàn guitar gỗ mộc mạc du ca', ['illustration', 'guitar', 'music', 'acoustic'], ['minh hoạ', 'đàn guitar', 'âm nhạc', 'du ca'], ['handDrawn', 'journal'],
    `<g transform="rotate(-30 400 400)">
       <rect x="372" y="80" width="56" height="280" rx="12" fill="#8D5524" stroke="#2B2118" stroke-width="11"/>
       <path d="M310 340 C240 340 245 450 315 475 C215 510 220 680 400 680 C580 680 585 510 485 475 C555 450 560 340 490 340 Z" fill="#E09F3E" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
       <circle cx="400" cy="465" r="52" fill="#3D2314" stroke="#FFF8E7" stroke-width="10"/>
       <rect x="345" y="575" width="110" height="28" rx="8" fill="#3D2314" stroke="#2B2118" stroke-width="8"/>
     </g>`],
  ['illus-scented-candle-jar', 'Aromatherapy Glass Jar Scented Candle', 'Hũ nến thơm thư giãn ánh lửa ấm', ['illustration', 'candle', 'cozy', 'relax'], ['minh hoạ', 'nến thơm', 'thư giãn', 'ấm áp'], ['handDrawn', 'cute', 'journal'],
    `<rect x="240" y="290" width="320" height="380" rx="42" fill="#FDE2E4" stroke="#2B2118" stroke-width="12"/>
     <rect x="280" y="410" width="240" height="160" rx="16" fill="#FFFDF9" stroke="#2B2118" stroke-width="9"/>
     <line x1="330" y1="465" x2="470" y2="465" stroke="#2B2118" stroke-width="9" stroke-linecap="round"/>
     <line x1="355" y1="510" x2="445" y2="510" stroke="#E07A5F" stroke-width="9" stroke-linecap="round"/>
     <line x1="400" y1="290" x2="400" y2="245" stroke="#2B2118" stroke-width="10" stroke-linecap="round"/>
     <path d="M400 120 C345 190 365 245 400 245 C435 245 455 190 400 120 Z" fill="#FFB703" stroke="#2B2118" stroke-width="10"/>
     <path d="M400 165 C380 200 385 230 400 230 C415 230 420 200 400 165 Z" fill="#FFF3B0"/>`],
  ['illus-sunny-fried-egg-toast', 'Sunny-Side Up Fried Egg on Toast', 'Bánh mì nướng ốp la trứng lòng đào', ['illustration', 'toast', 'egg', 'breakfast'], ['minh hoạ', 'bánh mì ốp la', 'trứng chiên', 'bữa sáng'], ['handDrawn', 'cute'],
    `<path d="M190 310 C150 220 290 150 400 195 C510 150 650 220 610 310 L590 610 C590 645 555 665 520 665 L280 665 C245 665 210 645 210 610 Z" fill="#DDA15E" stroke="#2B2118" stroke-width="14" stroke-linejoin="round"/>
     <path d="M230 330 C200 260 310 205 400 240 C490 205 600 260 570 330 L550 585 L250 585 Z" fill="#FDE2C8"/>
     <path d="M265 420 C245 330 350 280 435 310 C535 340 555 460 490 525 C425 590 285 520 265 420 Z" fill="#FFFFFF" stroke="#2B2118" stroke-width="10"/>
     <circle cx="405" cy="425" r="62" fill="#FFB703" stroke="#2B2118" stroke-width="10"/>
     <circle cx="385" cy="405" r="16" fill="#FFFFFF"/>`],
  ['illus-paint-tubes-brushes', 'Gouache Paint Tubes & Wooden Brushes', 'Tuýp màu vẽ gouache & cọ gỗ nghệ thuật', ['illustration', 'paint', 'art', 'brushes'], ['minh hoạ', 'màu vẽ', 'cọ vẽ', 'nghệ thuật'], ['handDrawn', 'journal'],
    `<g transform="rotate(-15 310 420)">
       <polygon points="220,240 360,240 390,580 190,580" fill="#FFFDF9" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
       <rect x="205" y="340" width="170" height="130" fill="#E63946" stroke="#2B2118" stroke-width="9"/>
       <rect x="260" y="180" width="60" height="60" rx="8" fill="#457B9D" stroke="#2B2118" stroke-width="10"/>
     </g>
     <g transform="rotate(20 530 420)">
       <rect x="505" y="280" width="38" height="360" rx="14" fill="#E9C46A" stroke="#2B2118" stroke-width="10"/>
       <rect x="500" y="230" width="48" height="55" fill="#A8B5C2" stroke="#2B2118" stroke-width="10"/>
       <path d="M495 230 C495 140 555 140 555 230 Z" fill="#2A9D8F" stroke="#2B2118" stroke-width="10"/>
     </g>`],
  ['illus-crescent-moon-clouds', 'Dreamy Golden Crescent Moon & Clouds', 'Trăng lưỡi liềm vàng & mây bồng bềnh', ['illustration', 'moon', 'clouds', 'dreamy'], ['minh hoạ', 'trăng lưỡi liềm', 'mây', 'mộng mơ'], ['handDrawn', 'cute', 'nature'],
    `<path d="M480 140 C310 140 200 280 230 450 C255 595 390 675 535 630 C410 610 340 490 365 360 C385 245 465 180 480 140 Z" fill="#FFD166" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <path d="M170 560 C130 560 110 510 155 490 C165 440 235 435 260 475 C295 450 355 475 350 520 C385 525 380 560 340 560 Z" fill="#FFFFFF" stroke="#2B2118" stroke-width="10" stroke-linejoin="round"/>
     <polygon points="560,240 575,275 610,290 575,305 560,340 545,305 510,290 545,275" fill="#FFD166" stroke="#2B2118" stroke-width="8"/>`],
  ['illus-sunburst-boho-arch', 'Boho Minimalist Terracotta Sun & Arch', 'Khung vòm Boho đất nung & mặt trời toả nắng', ['illustration', 'boho', 'arch', 'sun'], ['minh hoạ', 'phong cách boho', 'mặt trời', 'trừu tượng'], ['handDrawn', 'nature', 'journal'],
    `<path d="M200 660 L200 340 A200 200 0 0 1 600 340 L600 660 Z" fill="#E07A5F" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <circle cx="400" cy="360" r="95" fill="#F2CC8F" stroke="#2B2118" stroke-width="10"/>
     <path d="M200 540 Q300 470 400 540 Q500 610 600 540 L600 660 L200 660 Z" fill="#2A9D8F" stroke="#2B2118" stroke-width="10"/>
     <path d="M400 220 L400 175 M290 265 L255 235 M510 265 L545 235" stroke="#F2CC8F" stroke-width="12" stroke-linecap="round"/>`],
  ['illus-picnic-wicker-basket', 'Wicker Picnic Basket with Checkered Cloth', 'Giỏ mây dã ngoại & khăn caro đỏ', ['illustration', 'picnic', 'basket', 'outdoor'], ['minh hoạ', 'giỏ dã ngoại', 'picnic', 'khăn caro'], ['handDrawn', 'cute', 'nature'],
    `<path d="M260 360 C260 170 540 170 540 360" fill="none" stroke="#BC6C25" stroke-width="22" stroke-linecap="round"/>
     <polygon points="180,380 620,380 565,640 235,640" fill="#DDA15E" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <path d="M160 360 L640 360 L615 445 Q540 475 480 435 Q400 480 320 435 Q250 475 185 445 Z" fill="#E63946" stroke="#2B2118" stroke-width="10" stroke-linejoin="round"/>
     <line x1="260" y1="460" x2="290" y2="640" stroke="#9E5A1A" stroke-width="10"/>
     <line x1="400" y1="460" x2="400" y2="640" stroke="#9E5A1A" stroke-width="10"/>
     <line x1="540" y1="460" x2="510" y2="640" stroke="#9E5A1A" stroke-width="10"/>`],
  ['illus-watering-can-daisies', 'Mint Garden Watering Can with Daisies', 'Bình tưới cây xanh bạc hà cắm hoa cúc trắng', ['illustration', 'watering can', 'daisies', 'garden'], ['minh hoạ', 'bình tưới cây', 'hoa cúc họa mi', 'khu vườn'], ['handDrawn', 'cute', 'nature'],
    `<rect x="270" y="340" width="260" height="290" rx="28" fill="#81B29A" stroke="#2B2118" stroke-width="12"/>
     <path d="M270 385 C175 385 175 560 270 560" fill="none" stroke="#81B29A" stroke-width="24" stroke-linecap="round"/>
     <path d="M270 385 C175 385 175 560 270 560" fill="none" stroke="#2B2118" stroke-width="10" stroke-linecap="round"/>
     <path d="M530 480 L675 340" stroke="#81B29A" stroke-width="28" stroke-linecap="round"/>
     <ellipse cx="685" cy="330" rx="22" ry="38" transform="rotate(-45 685 330)" fill="#F2CC8F" stroke="#2B2118" stroke-width="10"/>
     <circle cx="345" cy="255" r="52" fill="#FFFFFF" stroke="#2B2118" stroke-width="10"/>
     <circle cx="345" cy="255" r="22" fill="#FFB703"/>
     <circle cx="455" cy="240" r="56" fill="#FFFFFF" stroke="#2B2118" stroke-width="10"/>
     <circle cx="455" cy="240" r="24" fill="#FFB703"/>`],
  ['illus-envelope-love-letter', 'Wax-Sealed Love Letter & Floral Sprig', 'Phong thư tình gắn dấu sáp đỏ & nhánh hoa', ['illustration', 'letter', 'envelope', 'love'], ['minh hoạ', 'phong thư', 'thư tình', 'dấu sáp'], ['handDrawn', 'cute', 'journal'],
    `<rect x="140" y="240" width="520" height="350" rx="24" fill="#FDF0D5" stroke="#2B2118" stroke-width="12"/>
     <polygon points="140,245 400,445 660,245" fill="#F4E2B8" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <circle cx="400" cy="435" r="48" fill="#C1121F" stroke="#2B2118" stroke-width="10"/>
     <path d="M400 455 C365 425 375 395 400 415 C425 395 435 425 400 455 Z" fill="#FFD166"/>`],
  ['illus-retro-cassette-mixtape', '90s Retro Mixtape Audio Cassette', 'Băng cassette âm nhạc thập niên 90', ['illustration', 'cassette', 'mixtape', 'retro'], ['minh hoạ', 'băng cassette', 'âm nhạc', 'hoài cổ'], ['handDrawn', 'vintage', 'journal'],
    `<rect x="130" y="220" width="540" height="360" rx="30" fill="#457B9D" stroke="#2B2118" stroke-width="12"/>
     <rect x="175" y="265" width="450" height="195" rx="16" fill="#FFF8E7" stroke="#2B2118" stroke-width="10"/>
     <rect x="175" y="295" width="450" height="38" fill="#E63946"/>
     <rect x="245" y="345" width="310" height="85" rx="42" fill="#2B2118"/>
     <circle cx="305" cy="387" r="30" fill="#FFF8E7"/><circle cx="495" cy="387" r="30" fill="#FFF8E7"/>
     <polygon points="230,580 570,580 535,505 265,505" fill="#1D3557" stroke="#2B2118" stroke-width="10"/>`],
  ['illus-strawberry-milk-carton', 'Kawaii Pink Strawberry Milk Carton', 'Hộp sữa dâu màu hồng pastel đáng yêu', ['illustration', 'strawberry milk', 'kawaii', 'cute'], ['minh hoạ', 'hộp sữa dâu', 'hồng pastel', 'dễ thương'], ['handDrawn', 'cute'],
    `<rect x="230" y="300" width="340" height="380" rx="18" fill="#FFC8DD" stroke="#2B2118" stroke-width="12"/>
     <polygon points="230,300 570,300 495,180 305,180" fill="#FFAFCC" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <rect x="305" y="135" width="190" height="45" rx="10" fill="#FFF0F5" stroke="#2B2118" stroke-width="10"/>
     <rect x="275" y="370" width="250" height="220" rx="22" fill="#FFFFFF" stroke="#2B2118" stroke-width="9"/>
     <path d="M400 535 C345 485 355 415 400 425 C445 415 455 485 400 535 Z" fill="#E63946" stroke="#2B2118" stroke-width="9"/>`],
  ['illus-potted-cactus-bloom', 'Blooming Desert Cactus in Clay Pot', 'Chậu xương rồng nở hoa hồng xinh xắn', ['illustration', 'cactus', 'succulent', 'plant'], ['minh hoạ', 'xương rồng', 'chậu cây', 'nở hoa'], ['handDrawn', 'cute', 'nature'],
    `<polygon points="270,480 530,480 490,670 310,670" fill="#E07A5F" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <rect x="325" y="210" width="150" height="275" rx="75" fill="#52B788" stroke="#2B2118" stroke-width="12"/>
     <path d="M325 360 C235 360 235 260 275 260 C305 260 305 320 325 320" fill="#52B788" stroke="#2B2118" stroke-width="12" stroke-linecap="round"/>
     <path d="M475 330 C565 330 565 230 525 230 C495 230 495 290 475 290" fill="#52B788" stroke="#2B2118" stroke-width="12" stroke-linecap="round"/>
     <circle cx="400" cy="180" r="42" fill="#FF6B8B" stroke="#2B2118" stroke-width="10"/>
     <circle cx="400" cy="180" r="16" fill="#FFD166"/>`],
  ['illus-origami-paper-boat', 'Pastel Paper Boat Sailing on Waves', 'Thuyền giấy pastel lướt trên sóng nhỏ', ['illustration', 'paper boat', 'origami', 'waves'], ['minh hoạ', 'thuyền giấy', 'sóng nước', 'tuổi thơ'], ['handDrawn', 'cute', 'travel'],
    `<polygon points="130,430 670,430 545,580 255,580" fill="#A8DADC" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <polygon points="400,190 545,430 255,430" fill="#F1FAEE" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <polygon points="130,430 400,340 255,580" fill="#8ECAE6" stroke="#2B2118" stroke-width="10" stroke-linejoin="round"/>
     <polygon points="670,430 400,340 545,580" fill="#8ECAE6" stroke="#2B2118" stroke-width="10" stroke-linejoin="round"/>
     <path d="M160 630 Q240 590 320 630 T480 630 T640 630" fill="none" stroke="#457B9D" stroke-width="14" stroke-linecap="round"/>`],
  ['illus-hanging-ivy-planter', 'Macrame Hanging Planter with Trailing Ivy', 'Chậu cây dây thường xuân treo macrame', ['illustration', 'planter', 'ivy', 'macrame'], ['minh hoạ', 'chậu cây treo', 'macrame', 'dây thường xuân'], ['handDrawn', 'nature'],
    `<circle cx="400" cy="115" r="24" fill="none" stroke="#BC6C25" stroke-width="12"/>
     <path d="M400 140 L285 410 M400 140 L515 410 M400 140 L400 410" stroke="#BC6C25" stroke-width="9"/>
     <path d="M270 390 L530 390 C535 520 475 565 400 565 C325 565 265 520 270 390 Z" fill="#E07A5F" stroke="#2B2118" stroke-width="12"/>
     <circle cx="310" cy="380" r="45" fill="#40916C" stroke="#2B2118" stroke-width="9"/>
     <circle cx="400" cy="365" r="55" fill="#52B788" stroke="#2B2118" stroke-width="9"/>
     <circle cx="490" cy="380" r="45" fill="#40916C" stroke="#2B2118" stroke-width="9"/>
     <path d="M285 420 Q240 530 275 660 M515 420 Q560 530 525 660" fill="none" stroke="#2D6A4F" stroke-width="12" stroke-linecap="round"/>
     <circle cx="255" cy="520" r="22" fill="#52B788"/><circle cx="270" cy="610" r="22" fill="#52B788"/>
     <circle cx="545" cy="520" r="22" fill="#52B788"/><circle cx="530" cy="610" r="22" fill="#52B788"/>`],
  ['illus-rainbow-pastel-stars', 'Pastel Rainbow Arch with Twinkling Stars', 'Cầu vồng pastel & những vì sao lấp lánh', ['illustration', 'rainbow', 'stars', 'pastel'], ['minh hoạ', 'cầu vồng', 'ngôi sao', 'pastel'], ['handDrawn', 'cute'],
    `<path d="M150 540 A250 250 0 0 1 650 540" fill="none" stroke="#FF8FA3" stroke-width="44" stroke-linecap="round"/>
     <path d="M195 540 A205 205 0 0 1 605 540" fill="none" stroke="#FFD166" stroke-width="44" stroke-linecap="round"/>
     <path d="M240 540 A160 160 0 0 1 560 540" fill="none" stroke="#80ED99" stroke-width="44" stroke-linecap="round"/>
     <path d="M285 540 A115 115 0 0 1 515 540" fill="none" stroke="#8ECAE6" stroke-width="44" stroke-linecap="round"/>
     <circle cx="195" cy="560" r="65" fill="#FFFFFF" stroke="#2B2118" stroke-width="10"/>
     <circle cx="605" cy="560" r="65" fill="#FFFFFF" stroke="#2B2118" stroke-width="10"/>`],
  ['illus-glass-teapot-chamomile', 'Glass Teapot Infusing Chamomile Flowers', 'Ấm trà thuỷ tinh ủ hoa cúc vàng dịu nhẹ', ['illustration', 'teapot', 'chamomile', 'tea'], ['minh hoạ', 'ấm trà', 'trà hoa cúc', 'thư giãn'], ['handDrawn', 'cute', 'journal'],
    `<ellipse cx="400" cy="450" rx="185" ry="155" fill="#E0FBFC" stroke="#2B2118" stroke-width="12"/>
     <path d="M230 465 C245 585 555 585 570 465 Z" fill="#F4A261" opacity="0.65"/>
     <path d="M570 430 C645 415 660 325 690 315" fill="none" stroke="#2B2118" stroke-width="22" stroke-linecap="round"/>
     <path d="M225 390 C140 390 140 520 225 520" fill="none" stroke="#2B2118" stroke-width="18" stroke-linecap="round"/>
     <ellipse cx="400" cy="295" rx="95" ry="28" fill="#DDA15E" stroke="#2B2118" stroke-width="10"/>
     <circle cx="400" cy="255" r="24" fill="#BC6C25" stroke="#2B2118" stroke-width="9"/>
     <circle cx="355" cy="505" r="28" fill="#FFFFFF"/><circle cx="355" cy="505" r="12" fill="#FFB703"/>
     <circle cx="445" cy="515" r="28" fill="#FFFFFF"/><circle cx="445" cy="515" r="12" fill="#FFB703"/>`],
  ['illus-fresh-baguette-tote', 'Canvas Tote Bag with Fresh Baguette & Greens', 'Túi vải canvas đựng bánh mì Pháp & hoa lá', ['illustration', 'tote bag', 'baguette', 'market'], ['minh hoạ', 'túi vải', 'bánh mì pháp', 'đi chợ'], ['handDrawn', 'cute', 'journal'],
    `<path d="M310 310 C310 150 490 150 490 310" fill="none" stroke="#2B2118" stroke-width="16"/>
     <polygon points="230,310 570,310 595,670 205,670" fill="#F4EFE6" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <rect x="295" y="160" width="90" height="220" rx="45" transform="rotate(-18 340 270)" fill="#E09F3E" stroke="#2B2118" stroke-width="10"/>
     <circle cx="475" cy="255" r="55" fill="#52B788" stroke="#2B2118" stroke-width="10"/>
     <circle cx="515" cy="285" r="42" fill="#FF6B8B" stroke="#2B2118" stroke-width="9"/>`],
  ['illus-desk-lamp-studying', 'Vintage Architect Desk Lamp Glowing', 'Đèn bàn học cổ điển toả ánh sáng vàng ấm', ['illustration', 'desk lamp', 'study', 'light'], ['minh hoạ', 'đèn bàn', 'học tập', 'ánh sáng ấm'], ['handDrawn', 'journal'],
    `<ellipse cx="380" cy="645" rx="145" ry="38" fill="#2A9D8F" stroke="#2B2118" stroke-width="12"/>
     <polyline points="340,630 220,410 390,200" fill="none" stroke="#2B2118" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>
     <circle cx="220" cy="410" r="22" fill="#E9C46A" stroke="#2B2118" stroke-width="8"/>
     <polygon points="355,175 455,145 575,275 365,335" fill="#E76F51" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <polygon points="390,320 555,275 660,540 320,540" fill="#FFE66D" opacity="0.38"/>`],
  ['illus-sleeping-corgi-pillow', 'Sleeping Corgi Puppy on Cloud Pillow', 'Chú chó Corgi ngủ say trên gối mây mềm', ['illustration', 'corgi', 'dog', 'sleeping'], ['minh hoạ', 'chó corgi', 'ngủ ngon', 'dễ thương'], ['handDrawn', 'cute'],
    `<ellipse cx="400" cy="520" rx="260" ry="95" fill="#BDE0FE" stroke="#2B2118" stroke-width="12"/>
     <ellipse cx="410" cy="455" rx="165" ry="85" fill="#F4A261" stroke="#2B2118" stroke-width="12"/>
     <circle cx="275" cy="435" r="68" fill="#F4A261" stroke="#2B2118" stroke-width="12"/>
     <polygon points="225,385 245,315 285,375" fill="#F4A261" stroke="#2B2118" stroke-width="10"/>
     <polygon points="295,375 335,315 345,390" fill="#F4A261" stroke="#2B2118" stroke-width="10"/>
     <ellipse cx="535" cy="465" rx="38" ry="30" fill="#FFF8F0" stroke="#2B2118" stroke-width="9"/>`],
  ['illus-cherry-blossom-teacup', 'Handcrafted Ceramic Cup of Sakura Tea', 'Tách gốm thủ công thưởng trà hoa anh đào', ['illustration', 'teacup', 'ceramic', 'tea'], ['minh hoạ', 'tách trà gốm', 'trà hoa', 'thủ công'], ['handDrawn', 'cute', 'journal'],
    `<path d="M220 280 L580 280 C580 540 500 620 400 620 C300 620 220 540 220 280 Z" fill="#F2CC8F" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <ellipse cx="400" cy="280" rx="180" ry="48" fill="#FFF8E7" stroke="#2B2118" stroke-width="12"/>
     <ellipse cx="400" cy="285" rx="150" ry="32" fill="#FFAFCC"/>
     <path d="M245 430 Q320 390 400 430 T555 430" fill="none" stroke="#E07A5F" stroke-width="14" stroke-linecap="round"/>`],
  ['illus-watermelon-summer-popsicle', 'Watermelon Slice Ice Popsicle', 'Kem que dưa hấu mùa hè mát lạnh', ['illustration', 'watermelon', 'popsicle', 'summer'], ['minh hoạ', 'kem dưa hấu', 'mùa hè', 'mát lạnh'], ['handDrawn', 'cute'],
    `<rect x="372" y="510" width="56" height="175" rx="28" fill="#DDA15E" stroke="#2B2118" stroke-width="11"/>
     <polygon points="400,120 610,490 190,490" fill="#E63946" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <rect x="190" y="470" width="420" height="45" rx="14" fill="#52B788" stroke="#2B2118" stroke-width="12"/>
     <circle cx="400" cy="295" r="10" fill="#2B2118"/><circle cx="355" cy="375" r="10" fill="#2B2118"/>
     <circle cx="445" cy="375" r="10" fill="#2B2118"/><circle cx="315" cy="435" r="10" fill="#2B2118"/><circle cx="485" cy="435" r="10" fill="#2B2118"/>`],
  ['illus-cloud-rain-heart-drops', 'Fluffy Cloud Raining Pastel Hearts', 'Đám mây bồng bềnh mưa trái tim hồng', ['illustration', 'cloud', 'hearts', 'cute'], ['minh hoạ', 'đám mây', 'trái tim', 'đáng yêu'], ['handDrawn', 'cute'],
    `<path d="M210 420 C135 420 120 315 190 290 C210 195 340 180 390 250 C445 195 565 220 575 305 C645 315 640 420 565 420 Z" fill="#FFFFFF" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
     <path d="M270 555 C240 525 250 490 270 510 C290 490 300 525 270 555 Z" fill="#FF6B8B" stroke="#2B2118" stroke-width="8"/>
     <path d="M400 615 C370 585 380 550 400 570 C420 550 430 585 400 615 Z" fill="#FF8FA3" stroke="#2B2118" stroke-width="8"/>
     <path d="M525 555 C495 525 505 490 525 510 C545 490 555 525 525 555 Z" fill="#FF6B8B" stroke="#2B2118" stroke-width="8"/>`],
  ['illus-washi-tape-rolls', 'Stack of Patterned Washi Tape Rolls', 'Chồng cuộn băng dính trang trí Washi Tape', ['illustration', 'washi tape', 'stationery', 'journal'], ['minh hoạ', 'băng dính washi', 'văn phòng phẩm', 'sổ tay'], ['handDrawn', 'cute', 'journal'],
    `<rect x="210" y="480" width="380" height="110" rx="26" fill="#FF8FA3" stroke="#2B2118" stroke-width="12"/>
     <circle cx="290" cy="535" r="18" fill="#FFFFFF"/><circle cx="400" cy="535" r="18" fill="#FFFFFF"/><circle cx="510" cy="535" r="18" fill="#FFFFFF"/>
     <rect x="235" y="365" width="330" height="115" rx="26" fill="#FFD166" stroke="#2B2118" stroke-width="12"/>
     <line x1="280" y1="365" x2="280" y2="480" stroke="#E07A5F" stroke-width="14"/>
     <line x1="400" y1="365" x2="400" y2="480" stroke="#E07A5F" stroke-width="14"/>
     <line x1="520" y1="365" x2="520" y2="480" stroke="#E07A5F" stroke-width="14"/>
     <rect x="260" y="250" width="280" height="115" rx="26" fill="#81B29A" stroke="#2B2118" stroke-width="12"/>`],
  ['illus-shooting-star-sparkle', 'Magical Golden Shooting Star & Sparkles', 'Sao băng vàng lấp lánh mang điều ước', ['illustration', 'shooting star', 'magic', 'wish'], ['minh hoạ', 'sao băng', 'điều ước', 'lấp lánh'], ['handDrawn', 'cute'],
    `<path d="M130 580 Q260 430 470 360" fill="none" stroke="#FF8FA3" stroke-width="36" stroke-linecap="round"/>
     <path d="M155 615 Q290 470 490 400" fill="none" stroke="#FFD166" stroke-width="32" stroke-linecap="round"/>
     <path d="M185 650 Q320 510 510 440" fill="none" stroke="#8ECAE6" stroke-width="28" stroke-linecap="round"/>
     <polygon points="535,170 575,260 670,270 595,335 615,430 535,380 455,430 475,335 400,270 495,260" fill="#FFB703" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>`]
];

const TRAVEL_ITEMS = [
  ['travel-retro-rangefinder-camera', 'Vintage Silver & Leather Film Camera', 'Máy ảnh phim cơ cổ điển bọc da', ['camera', 'film', 'vintage', 'photography'], ['máy ảnh cổ', 'máy phim', 'du lịch', 'nhiếp ảnh'], ['vintage', 'travel'],
    `<rect x="140" y="250" width="520" height="360" rx="34" fill="#3B322C" stroke="#1E1814" stroke-width="12"/>
     <path d="M140 285 Q140 250 175 250 L625 250 Q660 250 660 285 L660 355 L140 355 Z" fill="#D8D2C5" stroke="#1E1814" stroke-width="12"/>
     <rect x="210" y="205" width="90" height="45" rx="8" fill="#B8B0A0" stroke="#1E1814" stroke-width="10"/>
     <rect x="520" y="215" width="70" height="35" rx="6" fill="#C89D54" stroke="#1E1814" stroke-width="9"/>
     <rect x="480" y="280" width="110" height="50" rx="8" fill="#88B2CC" stroke="#1E1814" stroke-width="9"/>
     <circle cx="380" cy="445" r="135" fill="#D8D2C5" stroke="#1E1814" stroke-width="12"/>
     <circle cx="380" cy="445" r="98" fill="#232931" stroke="#1E1814" stroke-width="10"/>
     <circle cx="380" cy="445" r="55" fill="#11151C"/>
     <circle cx="350" cy="415" r="22" fill="#FFFFFF" opacity="0.7"/>`],
  ['travel-leather-trunk-suitcase', 'Antique Strapped Leather Travel Suitcase', 'Vali da cổ điển đai đồng dán nhãn du lịch', ['suitcase', 'luggage', 'leather', 'travel'], ['vali cổ', 'vali da', 'hành lý', 'du lịch'], ['vintage', 'travel'],
    `<path d="M325 230 L325 170 L475 170 L475 230" fill="none" stroke="#5C3A21" stroke-width="22" stroke-linejoin="round"/>
     <rect x="120" y="230" width="560" height="390" rx="28" fill="#9E5A2B" stroke="#24170E" stroke-width="12"/>
     <rect x="215" y="230" width="52" height="390" fill="#5C3A21" stroke="#24170E" stroke-width="9"/>
     <rect x="533" y="230" width="52" height="390" fill="#5C3A21" stroke="#24170E" stroke-width="9"/>
     <rect x="205" y="395" width="72" height="50" rx="8" fill="#E0A96D" stroke="#24170E" stroke-width="8"/>
     <rect x="523" y="395" width="72" height="50" rx="8" fill="#E0A96D" stroke="#24170E" stroke-width="8"/>
     <polygon points="330,310 460,285 480,385 350,410" fill="#E63946" stroke="#FFF8E7" stroke-width="8"/>
     <circle cx="390" cy="510" r="48" fill="#F4D35E" stroke="#24170E" stroke-width="8"/>`],
  ['travel-vintage-train-ticket', 'Perforated Vintage Express Train Ticket', 'Vé tàu tốc hành cổ điển đục lỗ', ['ticket', 'train', 'ephemera', 'travel'], ['vé tàu cổ', 'vé xe lửa', 'lưu niệm', 'du lịch'], ['vintage', 'travel', 'journal'],
    `<g transform="rotate(-8 400 400)">
       <path d="M120 260 L680 260 L680 350 A45 45 0 0 0 680 450 L680 540 L120 540 L120 450 A45 45 0 0 0 120 350 Z" fill="#F2D398" stroke="#2B1E16" stroke-width="12" stroke-linejoin="round"/>
       <rect x="160" y="295" width="480" height="210" fill="none" stroke="#8C2D19" stroke-width="8"/>
       <line x1="520" y1="265" x2="520" y2="535" stroke="#2B1E16" stroke-width="8" stroke-dasharray="16 14"/>
       <text x="340" y="375" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="#2B1E16" text-anchor="middle">EXPRESS</text>
       <text x="340" y="435" font-family="monospace" font-size="34" font-weight="bold" fill="#8C2D19" text-anchor="middle">No. 04829</text>
       <text x="340" y="480" font-family="Georgia, serif" font-size="24" fill="#2B1E16" text-anchor="middle">FIRST CLASS • ADMIT ONE</text>
     </g>`],
  ['travel-airmail-boarding-pass', 'Vintage Par Avion Boarding Pass & Stub', 'Thẻ lên máy bay cổ điển viền xanh đỏ', ['boarding pass', 'airmail', 'flight', 'ticket'], ['vé máy bay', 'hàng không', 'du lịch', 'cổ điển'], ['vintage', 'travel', 'journal'],
    `<g transform="rotate(6 400 400)">
       <rect x="110" y="250" width="580" height="300" rx="20" fill="#FFFDF7" stroke="#1D2D44" stroke-width="12"/>
       <rect x="110" y="250" width="580" height="48" fill="#C1121F"/>
       <rect x="110" y="502" width="580" height="48" fill="#1D3557"/>
       <line x1="510" y1="250" x2="510" y2="550" stroke="#1D2D44" stroke-width="8" stroke-dasharray="14 12"/>
       <text x="310" y="365" font-family="Georgia, serif" font-size="38" font-weight="bold" fill="#1D3557" text-anchor="middle">PAR AVION</text>
       <text x="310" y="425" font-family="monospace" font-size="30" font-weight="bold" fill="#C1121F" text-anchor="middle">PARIS ✈ TOKYO</text>
       <text x="310" y="470" font-family="monospace" font-size="24" fill="#1D2D44" text-anchor="middle">GATE 07 • SEAT 14A</text>
     </g>`],
  ['travel-terrestrial-desk-globe', 'Antique Brass Meridian Terrestrial Globe', 'Quả địa cầu cổ điển khung đồng khắc độ', ['globe', 'world', 'geography', 'map'], ['quả địa cầu', 'bản đồ thế giới', 'địa lý', 'đồ cổ'], ['vintage', 'travel'],
    `<path d="M400 110 A240 240 0 0 1 400 590" fill="none" stroke="#C89D54" stroke-width="26" stroke-linecap="round"/>
     <line x1="400" y1="590" x2="400" y2="665" stroke="#C89D54" stroke-width="28"/>
     <path d="M270 675 L530 675 L490 635 L310 635 Z" fill="#8C6239" stroke="#24170E" stroke-width="12"/>
     <circle cx="390" cy="350" r="195" fill="#E8D8B5" stroke="#24170E" stroke-width="12"/>
     <path d="M260 270 C310 230 370 260 350 330 C330 390 270 360 260 270 Z" fill="#7A9A76" stroke="#24170E" stroke-width="7"/>
     <path d="M415 240 C480 230 535 290 500 380 C470 450 410 420 415 240 Z" fill="#7A9A76" stroke="#24170E" stroke-width="7"/>
     <ellipse cx="390" cy="350" rx="195" ry="65" fill="none" stroke="#8C6239" stroke-width="6"/>`],
  ['travel-rolled-treasure-map', 'Rolled Parchment Map Tied with Twine', 'Cuộn bản đồ giấy da cổ buộc dây gai', ['map', 'parchment', 'scroll', 'treasure'], ['bản đồ cuộn', 'giấy da cổ', 'kho báu', 'phiêu lưu'], ['vintage', 'travel', 'journal'],
    `<g transform="rotate(-15 400 400)">
       <rect x="130" y="330" width="540" height="140" rx="22" fill="#E6CFA7" stroke="#2B1E16" stroke-width="12"/>
       <ellipse cx="145" cy="400" rx="28" ry="70" fill="#B59264" stroke="#2B1E16" stroke-width="10"/>
       <ellipse cx="655" cy="400" rx="28" ry="70" fill="#D5B88A" stroke="#2B1E16" stroke-width="10"/>
       <rect x="375" y="320" width="50" height="160" rx="10" fill="#9E2A2B" stroke="#2B1E16" stroke-width="10"/>
       <path d="M400 320 C350 250 310 290 385 330 M400 320 C450 250 490 290 415 330" fill="none" stroke="#9E2A2B" stroke-width="14" stroke-linecap="round"/>
     </g>`],
  ['travel-roman-pocket-watch', 'Gold Roman Numeral Pocket Watch & Chain', 'Đồng hồ quả quýt vàng số La Mã & dây xích', ['pocket watch', 'timepiece', 'vintage', 'clock'], ['đồng hồ quả quýt', 'đồng hồ cổ', 'thời gian', 'vàng đồng'], ['vintage', 'travel'],
    `<path d="M400 130 C490 90 590 150 620 260" fill="none" stroke="#D4AF37" stroke-width="14" stroke-dasharray="22 12" stroke-linecap="round"/>
     <circle cx="400" cy="145" r="42" fill="none" stroke="#D4AF37" stroke-width="14"/>
     <rect x="372" y="175" width="56" height="45" rx="10" fill="#C59B27" stroke="#24170E" stroke-width="10"/>
     <circle cx="400" cy="435" r="220" fill="#E5C158" stroke="#24170E" stroke-width="14"/>
     <circle cx="400" cy="435" r="175" fill="#FFFDF5" stroke="#24170E" stroke-width="10"/>
     <text x="400" y="315" font-family="Georgia, serif" font-size="38" font-weight="bold" fill="#24170E" text-anchor="middle">XII</text>
     <text x="535" y="448" font-family="Georgia, serif" font-size="38" font-weight="bold" fill="#24170E" text-anchor="middle">III</text>
     <text x="400" y="580" font-family="Georgia, serif" font-size="38" font-weight="bold" fill="#24170E" text-anchor="middle">VI</text>
     <text x="265" y="448" font-family="Georgia, serif" font-size="38" font-weight="bold" fill="#24170E" text-anchor="middle">IX</text>
     <polyline points="330,380 400,435 485,390" fill="none" stroke="#24170E" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`],
  ['travel-mechanical-typewriter', 'Vintage Mechanical Typewriter with Paper', 'Máy đánh chữ cơ khí cổ điển & trang thư', ['typewriter', 'writer', 'vintage', 'journal'], ['máy đánh chữ', 'nhà văn', 'thư cổ', 'hoài cổ'], ['vintage', 'journal'],
    `<rect x="235" y="130" width="330" height="230" rx="8" fill="#FFFDF7" stroke="#24170E" stroke-width="10"/>
     <line x1="280" y1="190" x2="510" y2="190" stroke="#24170E" stroke-width="10" stroke-linecap="round"/>
     <line x1="280" y1="240" x2="460" y2="240" stroke="#24170E" stroke-width="10" stroke-linecap="round"/>
     <rect x="175" y="295" width="450" height="55" rx="26" fill="#4A4E69" stroke="#24170E" stroke-width="11"/>
     <polygon points="150,350 650,350 690,620 110,620" fill="#2B2D42" stroke="#24170E" stroke-width="12" stroke-linejoin="round"/>
     <circle cx="230" cy="510" r="22" fill="#FFFDF7"/><circle cx="315" cy="510" r="22" fill="#FFFDF7"/><circle cx="400" cy="510" r="22" fill="#FFFDF7"/><circle cx="485" cy="510" r="22" fill="#FFFDF7"/><circle cx="570" cy="510" r="22" fill="#FFFDF7"/>
     <circle cx="270" cy="565" r="22" fill="#FFFDF7"/><circle cx="355" cy="565" r="22" fill="#FFFDF7"/><circle cx="445" cy="565" r="22" fill="#FFFDF7"/><circle cx="530" cy="565" r="22" fill="#FFFDF7"/>`],
  ['travel-brass-kerosene-lantern', 'Vintage Brass Hurricane Oil Lantern', 'Đèn bão dầu hoả bằng đồng thau cổ điển', ['lantern', 'lamp', 'brass', 'camping'], ['đèn dầu cổ', 'đèn bão', 'đồng thau', 'phiêu lưu'], ['vintage', 'travel'],
    `<circle cx="400" cy="120" r="32" fill="none" stroke="#C89D54" stroke-width="12"/>
     <polygon points="300,190 500,190 460,150 340,150" fill="#B8860B" stroke="#24170E" stroke-width="11"/>
     <path d="M290 210 C220 310 220 440 290 530 L510 530 C580 440 580 310 510 210 Z" fill="#FFF3B0" fill-opacity="0.75" stroke="#24170E" stroke-width="12"/>
     <path d="M400 310 C355 375 370 445 400 445 C430 445 445 375 400 310 Z" fill="#FF9F1C" stroke="#C1121F" stroke-width="8"/>
     <polygon points="260,530 540,530 580,660 220,660" fill="#B8860B" stroke="#24170E" stroke-width="12" stroke-linejoin="round"/>`],
  ['travel-penny-farthing-bicycle', 'Victorian High-Wheel Penny-Farthing Bicycle', 'Xe đạp bánh cao cổ điển thời Victoria', ['bicycle', 'penny farthing', 'victorian', 'vintage'], ['xe đạp cổ', 'bánh lớn', 'thời victoria', 'đồ cổ'], ['vintage', 'travel'],
    `<circle cx="310" cy="430" r="195" fill="none" stroke="#24170E" stroke-width="16"/>
     <circle cx="310" cy="430" r="24" fill="#C89D54" stroke="#24170E" stroke-width="8"/>
     <line x1="310" y1="235" x2="310" y2="625" stroke="#5C4D42" stroke-width="6"/>
     <line x1="115" y1="430" x2="505" y2="430" stroke="#5C4D42" stroke-width="6"/>
     <circle cx="615" cy="555" r="70" fill="none" stroke="#24170E" stroke-width="14"/>
     <path d="M310 430 L310 175 L265 160 M310 215 C475 235 565 385 615 555" fill="none" stroke="#B8860B" stroke-width="16" stroke-linecap="round"/>
     <ellipse cx="385" cy="215" rx="45" ry="18" fill="#6F3E18" stroke="#24170E" stroke-width="8"/>`],
  ['travel-brass-field-binoculars', 'Antique Brass & Leather Field Binoculars', 'Ống nhòm đồng bọc da thám hiểm cổ điển', ['binoculars', 'optics', 'safari', 'explorer'], ['ống nhòm cổ', 'thám hiểm', 'quan sát', 'du lịch'], ['vintage', 'travel'],
    `<polygon points="180,220 330,220 360,580 140,580" fill="#3B2B20" stroke="#1E150F" stroke-width="12" stroke-linejoin="round"/>
     <polygon points="470,220 620,220 660,580 440,580" fill="#3B2B20" stroke="#1E150F" stroke-width="12" stroke-linejoin="round"/>
     <rect x="210" y="160" width="90" height="60" rx="10" fill="#C89D54" stroke="#1E150F" stroke-width="10"/>
     <rect x="500" y="160" width="90" height="60" rx="10" fill="#C89D54" stroke="#1E150F" stroke-width="10"/>
     <rect x="330" y="340" width="140" height="45" rx="8" fill="#C89D54" stroke="#1E150F" stroke-width="10"/>
     <rect x="135" y="555" width="230" height="55" rx="12" fill="#C89D54" stroke="#1E150F" stroke-width="11"/>
     <rect x="435" y="555" width="230" height="55" rx="12" fill="#C89D54" stroke="#1E150F" stroke-width="11"/>`],
  ['travel-detective-magnifying-glass', 'Ornate Brass Detective Magnifying Glass', 'Kính lúp đồng thám tử cán gỗ cổ điển', ['magnifying glass', 'lens', 'detective', 'vintage'], ['kính lúp cổ', 'thám tử', 'khám phá', 'đồ cổ'], ['vintage', 'journal'],
    `<g transform="rotate(-35 400 400)">
       <rect x="372" y="430" width="56" height="260" rx="24" fill="#6F3E18" stroke="#1E150F" stroke-width="12"/>
       <rect x="365" y="395" width="70" height="45" rx="8" fill="#C89D54" stroke="#1E150F" stroke-width="10"/>
       <circle cx="400" cy="240" r="165" fill="#D4AF37" stroke="#1E150F" stroke-width="14"/>
       <circle cx="400" cy="240" r="128" fill="#D8F3DC" fill-opacity="0.7" stroke="#1E150F" stroke-width="10"/>
       <path d="M325 175 A95 95 0 0 1 455 155" fill="none" stroke="#FFFFFF" stroke-width="16" stroke-linecap="round"/>
     </g>`],
  ['travel-transatlantic-steamship', 'Vintage Transatlantic Ocean Liner Steamship', 'Tàu thuỷ hơi nước vượt đại dương cổ điển', ['steamship', 'ship', 'ocean liner', 'nautical'], ['tàu thuỷ cổ', 'tàu hơi nước', 'hàng hải', 'vượt biển'], ['vintage', 'travel'],
    `<rect x="290" y="210" width="55" height="140" fill="#D62828" stroke="#1D2D44" stroke-width="10"/>
     <rect x="290" y="210" width="55" height="35" fill="#1D2D44"/>
     <rect x="410" y="210" width="55" height="140" fill="#D62828" stroke="#1D2D44" stroke-width="10"/>
     <rect x="410" y="210" width="55" height="35" fill="#1D2D44"/>
     <rect x="210" y="340" width="380" height="90" rx="10" fill="#FFFDF7" stroke="#1D2D44" stroke-width="11"/>
     <polygon points="100,420 700,420 620,575 170,575" fill="#1D2D44" stroke="#111927" stroke-width="12" stroke-linejoin="round"/>
     <line x1="145" y1="525" x2="645" y2="525" stroke="#D62828" stroke-width="24"/>
     <path d="M120 615 Q210 575 300 615 T480 615 T680 615" fill="none" stroke="#457B9D" stroke-width="16" stroke-linecap="round"/>`],
  ['travel-vintage-hot-air-balloon', 'Striped Victorian Hot Air Balloon', 'Khinh khí cầu sọc cổ điển bay giữa trời', ['hot air balloon', 'flight', 'balloon', 'adventure'], ['khinh khí cầu', 'bay lượn', 'phiêu lưu', 'du lịch'], ['vintage', 'travel'],
    `<path d="M400 100 C210 100 160 280 265 435 L330 520 L470 520 L535 435 C640 280 590 100 400 100 Z" fill="#FFF8E7" stroke="#24170E" stroke-width="12" stroke-linejoin="round"/>
     <path d="M400 100 C310 100 285 280 345 435 L365 520 L435 520 L455 435 C515 280 490 100 400 100 Z" fill="#C1121F" stroke="#24170E" stroke-width="10"/>
     <line x1="345" y1="520" x2="355" y2="590" stroke="#24170E" stroke-width="10"/>
     <line x1="455" y1="520" x2="445" y2="590" stroke="#24170E" stroke-width="10"/>
     <rect x="330" y="585" width="140" height="95" rx="16" fill="#9E5A2B" stroke="#24170E" stroke-width="12"/>`],
  ['travel-steam-locomotive-train', 'Classic Black & Red Steam Locomotive', 'Đầu máy xe lửa hơi nước cổ điển', ['locomotive', 'steam train', 'railway', 'travel'], ['đầu máy xe lửa', 'tàu hoả cổ', 'đường sắt', 'du lịch'], ['vintage', 'travel'],
    `<circle cx="255" cy="180" r="38" fill="#E5E5E5"/><circle cx="330" cy="145" r="48" fill="#E5E5E5"/>
     <polygon points="215,240 295,240 280,350 230,350" fill="#2B2D42" stroke="#14151F" stroke-width="11"/>
     <rect x="180" y="340" width="320" height="175" rx="22" fill="#2B2D42" stroke="#14151F" stroke-width="12"/>
     <rect x="470" y="255" width="190" height="260" rx="14" fill="#9E2A2B" stroke="#14151F" stroke-width="12"/>
     <rect x="505" y="290" width="120" height="95" rx="10" fill="#FFF3B0" stroke="#14151F" stroke-width="9"/>
     <polygon points="180,515 110,595 200,595" fill="#C1121F" stroke="#14151F" stroke-width="10"/>
     <circle cx="265" cy="560" r="65" fill="#C1121F" stroke="#14151F" stroke-width="12"/>
     <circle cx="425" cy="560" r="65" fill="#C1121F" stroke="#14151F" stroke-width="12"/>
     <circle cx="575" cy="560" r="65" fill="#C1121F" stroke="#14151F" stroke-width="12"/>`],
  ['travel-ornate-skeleton-key', 'Antique Brass Ornate Skeleton Key', 'Chìa khoá đồng chạm khắc hoa văn cổ', ['skeleton key', 'key', 'antique', 'brass'], ['chìa khoá cổ', 'đồng thau', 'bí ẩn', 'đồ cổ'], ['vintage', 'journal'],
    `<g transform="rotate(35 400 400)">
       <circle cx="400" cy="210" r="105" fill="none" stroke="#C89D54" stroke-width="26"/>
       <circle cx="400" cy="175" r="35" fill="none" stroke="#C89D54" stroke-width="16"/>
       <circle cx="365" cy="235" r="30" fill="none" stroke="#C89D54" stroke-width="16"/>
       <circle cx="435" cy="235" r="30" fill="none" stroke="#C89D54" stroke-width="16"/>
       <rect x="382" y="310" width="36" height="360" rx="16" fill="#C89D54" stroke="#24170E" stroke-width="10"/>
       <path d="M418 540 L505 540 L505 635 L418 635 L418 600 L465 600 L465 575 L418 575 Z" fill="#C89D54" stroke="#24170E" stroke-width="10"/>
     </g>`],
  ['travel-brass-horn-gramophone', 'Antique Wooden Gramophone with Brass Horn', 'Máy hát đĩa than loa kèn đồng cổ điển', ['gramophone', 'phonograph', 'music', 'antique'], ['máy hát loa kèn', 'máy đĩa than', 'nhạc cổ', 'đồ cổ'], ['vintage', 'journal'],
    `<rect x="220" y="485" width="360" height="165" rx="18" fill="#8C4A27" stroke="#24170E" stroke-width="12"/>
     <ellipse cx="400" cy="475" rx="145" ry="26" fill="#222222" stroke="#24170E" stroke-width="9"/>
     <path d="M510 475 C590 465 590 325 480 285" fill="none" stroke="#C89D54" stroke-width="26" stroke-linecap="round"/>
     <path d="M490 295 L230 130 C165 180 165 360 245 400 Z" fill="#E5C158" stroke="#24170E" stroke-width="12" stroke-linejoin="round"/>
     <ellipse cx="225" cy="265" rx="45" ry="135" fill="#B8860B" stroke="#24170E" stroke-width="10"/>`],
  ['travel-rotary-dial-telephone', 'Classic Vintage Black Rotary Telephone', 'Điện thoại quay số cổ điển thập niên cũ', ['telephone', 'rotary phone', 'vintage', 'retro'], ['điện thoại bàn cổ', 'điện thoại quay số', 'hoài cổ', 'đồ cổ'], ['vintage', 'journal'],
    `<path d="M165 250 C250 185 550 185 635 250 L585 320 C515 275 285 275 215 320 Z" fill="#2B2D42" stroke="#11131C" stroke-width="12" stroke-linejoin="round"/>
     <circle cx="195" cy="295" r="55" fill="#2B2D42" stroke="#11131C" stroke-width="12"/>
     <circle cx="605" cy="295" r="55" fill="#2B2D42" stroke="#11131C" stroke-width="12"/>
     <polygon points="220,350 580,350 645,620 155,620" fill="#2B2D42" stroke="#11131C" stroke-width="12" stroke-linejoin="round"/>
     <circle cx="400" cy="490" r="105" fill="#FFFDF7" stroke="#C89D54" stroke-width="12"/>
     <circle cx="400" cy="425" r="16" fill="#2B2D42"/><circle cx="455" cy="450" r="16" fill="#2B2D42"/>
     <circle cx="465" cy="515" r="16" fill="#2B2D42"/><circle cx="415" cy="555" r="16" fill="#2B2D42"/>
     <circle cx="345" cy="535" r="16" fill="#2B2D42"/><circle cx="340" cy="465" r="16" fill="#2B2D42"/>`],
  ['travel-brass-spyglass-telescope', 'Collapsible Mariner Brass Spyglass Telescope', 'Ống nhòm đơn hàng hải bằng đồng kéo dài', ['spyglass', 'telescope', 'nautical', 'mariner'], ['ống nhòm hải tặc', 'kính viễn vọng', 'hàng hải', 'đồng cổ'], ['vintage', 'travel'],
    `<g transform="rotate(-30 400 400)">
       <rect x="110" y="340" width="220" height="120" rx="12" fill="#6F3E18" stroke="#1E150F" stroke-width="12"/>
       <rect x="330" y="355" width="160" height="90" rx="8" fill="#C89D54" stroke="#1E150F" stroke-width="11"/>
       <rect x="490" y="370" width="140" height="60" rx="8" fill="#E5C158" stroke="#1E150F" stroke-width="11"/>
       <rect x="630" y="382" width="60" height="36" rx="6" fill="#C89D54" stroke="#1E150F" stroke-width="10"/>
       <ellipse cx="115" cy="400" rx="22" ry="60" fill="#88B2CC" stroke="#1E150F" stroke-width="10"/>
     </g>`],
  ['travel-fountain-pen-inkwell', 'Glass Inkwell & Vintage Gold Nib Fountain Pen', 'Lọ mực thuỷ tinh & bút máy ngòi vàng cổ điển', ['fountain pen', 'inkwell', 'calligraphy', 'writing'], ['bút máy cổ', 'lọ mực', 'viết thư', 'thư pháp'], ['vintage', 'journal'],
    `<rect x="190" y="380" width="240" height="240" rx="32" fill="#A8DADC" fill-opacity="0.75" stroke="#1D2D44" stroke-width="12"/>
     <rect x="210" y="465" width="200" height="135" rx="18" fill="#1D3557"/>
     <rect x="255" y="315" width="110" height="65" rx="10" fill="#C89D54" stroke="#1D2D44" stroke-width="10"/>
     <g transform="rotate(28 520 350)">
       <polygon points="495,460 545,460 520,575" fill="#E5C158" stroke="#1D2D44" stroke-width="10" stroke-linejoin="round"/>
       <rect x="490" y="130" width="60" height="330" rx="28" fill="#6F1D1B" stroke="#1D2D44" stroke-width="11"/>
     </g>`],
  ['travel-wax-seal-stamper', 'Wooden Handle Brass Wax Seal Stamper & Red Wax', 'Con dấu đóng sáp cán gỗ & ấn sáp đỏ cổ', ['wax seal', 'stamper', 'letter', 'antique'], ['con dấu sáp', 'đóng dấu thư', 'sáp đỏ', 'đồ cổ'], ['vintage', 'journal'],
    `<circle cx="285" cy="535" r="115" fill="#9E2A2B" stroke="#24170E" stroke-width="12"/>
     <circle cx="285" cy="535" r="78" fill="#B23A3B" stroke="#E5C158" stroke-width="6"/>
     <g transform="rotate(18 490 340)">
       <ellipse cx="490" cy="175" rx="68" ry="85" fill="#6F3E18" stroke="#24170E" stroke-width="12"/>
       <polygon points="455,250 525,250 545,440 435,440" fill="#6F3E18" stroke="#24170E" stroke-width="12"/>
       <rect x="415" y="440" width="150" height="55" rx="12" fill="#D4AF37" stroke="#24170E" stroke-width="12"/>
     </g>`],
  ['travel-nautical-anchor-rope', 'Heavy Iron Mariner Anchor Entwined with Rope', 'Mỏ neo hàng hải cổ điển quấn dây thừng', ['anchor', 'nautical', 'maritime', 'sailor'], ['mỏ neo', 'hàng hải', 'dây thừng', 'biển cả'], ['vintage', 'travel'],
    `<circle cx="400" cy="145" r="42" fill="none" stroke="#2B2D42" stroke-width="22"/>
     <line x1="400" y1="185" x2="400" y2="635" stroke="#2B2D42" stroke-width="34" stroke-linecap="round"/>
     <line x1="255" y1="265" x2="545" y2="265" stroke="#2B2D42" stroke-width="28" stroke-linecap="round"/>
     <path d="M185 455 C200 660 600 660 615 455" fill="none" stroke="#2B2D42" stroke-width="34" stroke-linecap="round"/>
     <polygon points="155,470 195,410 230,475" fill="#2B2D42"/>
     <polygon points="645,470 605,410 570,475" fill="#2B2D42"/>
     <path d="M400 185 C310 265 490 365 400 465 C315 550 475 610 400 645" fill="none" stroke="#DDA15E" stroke-width="22" stroke-linecap="round"/>`],
  ['travel-passport-booklet-stamps', 'Vintage Leather Passport Booklet & Boarding Ticket', 'Sổ hộ chiếu cổ điển ép nhũ vàng & vé du lịch', ['passport', 'travel', 'visa', 'journey'], ['hộ chiếu', 'du lịch', 'xuất hành', 'hành trình'], ['vintage', 'travel', 'journal'],
    `<rect x="275" y="120" width="320" height="440" rx="20" transform="rotate(14 435 340)" fill="#F2D398" stroke="#24170E" stroke-width="10"/>
     <rect x="175" y="170" width="360" height="490" rx="26" fill="#1D3557" stroke="#111927" stroke-width="12"/>
     <text x="355" y="275" font-family="Georgia, serif" font-size="42" font-weight="bold" fill="#E5C158" text-anchor="middle">PASSPORT</text>
     <circle cx="355" cy="425" r="95" fill="none" stroke="#E5C158" stroke-width="10"/>
     <ellipse cx="355" cy="425" rx="48" ry="95" fill="none" stroke="#E5C158" stroke-width="8"/>
     <line x1="260" y1="425" x2="450" y2="425" stroke="#E5C158" stroke-width="8"/>`],
  ['travel-vintage-camper-van', 'Classic Two-Tone Retro Camper Van', 'Xe cắm trại cổ điển hai tông màu du mục', ['camper van', 'road trip', 'vanlife', 'retro'], ['xe cắm trại', 'du lịch bụi', 'xe cổ', 'hành trình'], ['vintage', 'travel'],
    `<rect x="110" y="250" width="580" height="320" rx="65" fill="#FFF8E7" stroke="#24170E" stroke-width="12"/>
     <path d="M110 410 L690 410 L690 510 Q690 570 630 570 L170 570 Q110 570 110 510 Z" fill="#2A9D8F" stroke="#24170E" stroke-width="12"/>
     <polygon points="115,410 385,485 685,410" fill="none" stroke="#FFF8E7" stroke-width="14"/>
     <rect x="160" y="290" width="135" height="95" rx="16" fill="#8ECAE6" stroke="#24170E" stroke-width="10"/>
     <rect x="330" y="290" width="135" height="95" rx="16" fill="#8ECAE6" stroke="#24170E" stroke-width="10"/>
     <rect x="500" y="290" width="135" height="95" rx="16" fill="#8ECAE6" stroke="#24170E" stroke-width="10"/>
     <circle cx="245" cy="575" r="65" fill="#2B2D42" stroke="#24170E" stroke-width="12"/><circle cx="245" cy="575" r="28" fill="#FFF8E7"/>
     <circle cx="555" cy="575" r="65" fill="#2B2D42" stroke="#24170E" stroke-width="12"/><circle cx="555" cy="575" r="28" fill="#FFF8E7"/>`]
];

function buildExtraIllus() {
  const extras = [
    ['illus-vinyl-headphones-retro', 'Retro Headphones & Musical Notes', 'Tai nghe cổ điển & nốt nhạc bay bổng', ['illustration', 'headphones', 'music', 'notes'], ['minh hoạ', 'tai nghe', 'nốt nhạc', 'giai điệu'], ['handDrawn', 'cute'],
      `<path d="M210 440 A190 190 0 0 1 590 440" fill="none" stroke="#2B2118" stroke-width="24" stroke-linecap="round"/>
       <rect x="165" y="380" width="85" height="165" rx="42" fill="#E76F51" stroke="#2B2118" stroke-width="12"/>
       <rect x="550" y="380" width="85" height="165" rx="42" fill="#E76F51" stroke="#2B2118" stroke-width="12"/>
       <circle cx="400" cy="400" r="65" fill="#FFD166" stroke="#2B2118" stroke-width="10"/>`],
    ['illus-french-press-coffee', 'Glass French Press Coffee Maker', 'Bình pha cà phê French Press thuỷ tinh', ['illustration', 'french press', 'coffee', 'cafe'], ['minh hoạ', 'bình pha cà phê', 'cà phê', 'buổi sáng'], ['handDrawn', 'journal'],
      `<rect x="260" y="230" width="280" height="420" rx="22" fill="#E0FBFC" stroke="#2B2118" stroke-width="12"/>
       <rect x="272" y="380" width="256" height="255" rx="14" fill="#6F3E18"/>
       <path d="M540 290 C635 290 635 540 540 540" fill="none" stroke="#2B2118" stroke-width="22" stroke-linecap="round"/>
       <ellipse cx="400" cy="230" rx="150" ry="30" fill="#A8B5C2" stroke="#2B2118" stroke-width="12"/>
       <line x1="400" y1="140" x2="400" y2="380" stroke="#2B2118" stroke-width="14" stroke-linecap="round"/>
       <circle cx="400" cy="135" r="24" fill="#2B2118"/>`],
    ['illus-blueberry-pancake-stack', 'Fluffy Pancakes with Maple Syrup & Butter', 'Chồng bánh kếp mật ong & bơ vàng', ['illustration', 'pancakes', 'breakfast', 'dessert'], ['minh hoạ', 'bánh kếp', 'mật ong', 'bữa sáng'], ['handDrawn', 'cute'],
      `<ellipse cx="400" cy="560" rx="240" ry="65" fill="#FFFFFF" stroke="#2B2118" stroke-width="12"/>
       <ellipse cx="400" cy="510" rx="185" ry="52" fill="#E09F3E" stroke="#2B2118" stroke-width="11"/>
       <ellipse cx="400" cy="450" rx="185" ry="52" fill="#E09F3E" stroke="#2B2118" stroke-width="11"/>
       <ellipse cx="400" cy="390" rx="185" ry="52" fill="#E09F3E" stroke="#2B2118" stroke-width="11"/>
       <path d="M270 380 Q320 460 350 430 Q400 500 440 420 Q490 470 530 380 Z" fill="#9E2A2B" stroke="#2B2118" stroke-width="9"/>
       <rect x="360" y="335" width="80" height="45" rx="8" fill="#FFE66D" stroke="#2B2118" stroke-width="9"/>`],
    ['illus-succulent-terrarium-glass', 'Geometric Glass Terrarium with Succulents', 'Bình thuỷ tinh đa giác trồng sen đá', ['illustration', 'terrarium', 'succulent', 'plant'], ['minh hoạ', 'bình sen đá', 'terrarium', 'cây cảnh'], ['handDrawn', 'nature'],
      `<polygon points="400,120 620,310 540,650 260,650 180,310" fill="#E0FBFC" fill-opacity="0.7" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
       <polygon points="260,650 540,650 570,520 230,520" fill="#DDA15E" stroke="#2B2118" stroke-width="10"/>
       <circle cx="400" cy="485" r="75" fill="#52B788" stroke="#2B2118" stroke-width="10"/>
       <circle cx="400" cy="485" r="42" fill="#74C69D" stroke="#2B2118" stroke-width="8"/>
       <line x1="400" y1="120" x2="400" y2="650" stroke="#2B2118" stroke-width="8"/>`],
    ['illus-fountain-pen-journal-page', 'Handwritten Journal Page & Floral Washi', 'Trang nhật ký viết tay dán băng dính hoa', ['illustration', 'journal', 'note', 'paper'], ['minh hoạ', 'trang nhật ký', 'ghi chú', 'sổ tay'], ['handDrawn', 'journal'],
      `<rect x="190" y="160" width="420" height="500" rx="18" transform="rotate(-4 400 410)" fill="#FFFDF7" stroke="#2B2118" stroke-width="12"/>
       <rect x="310" y="125" width="180" height="55" rx="8" transform="rotate(-12 400 150)" fill="#FF8FA3" stroke="#2B2118" stroke-width="9"/>
       <line x1="255" y1="280" x2="535" y2="265" stroke="#2B2118" stroke-width="10" stroke-linecap="round"/>
       <line x1="255" y1="350" x2="515" y2="335" stroke="#2B2118" stroke-width="10" stroke-linecap="round"/>
       <line x1="255" y1="420" x2="485" y2="405" stroke="#2B2118" stroke-width="10" stroke-linecap="round"/>
       <circle cx="475" cy="535" r="48" fill="#FFD166" stroke="#2B2118" stroke-width="9"/>`],
    ['illus-retro-sunglasses-heart', 'Heart-Shaped Retro Pink Sunglasses', 'Kính mát hình trái tim hồng cổ điển', ['illustration', 'sunglasses', 'heart', 'summer'], ['minh hoạ', 'kính trái tim', 'mùa hè', 'dễ thương'], ['handDrawn', 'cute', 'travel'],
      `<path d="M250 510 C120 410 130 250 250 310 C370 250 380 410 250 510 Z" fill="#FF6B8B" stroke="#FFFFFF" stroke-width="18"/>
       <path d="M250 510 C120 410 130 250 250 310 C370 250 380 410 250 510 Z" fill="#FF6B8B" stroke="#2B2118" stroke-width="12"/>
       <path d="M550 510 C420 410 430 250 550 310 C670 250 680 410 550 510 Z" fill="#FF6B8B" stroke="#2B2118" stroke-width="12"/>
       <line x1="340" y1="345" x2="460" y2="345" stroke="#2B2118" stroke-width="16" stroke-linecap="round"/>`],
    ['illus-knitting-yarn-ball', 'Cozy Pastel Wool Yarn Ball & Needles', 'Cuộn len hồng ấm áp & đôi kim đan gỗ', ['illustration', 'yarn', 'knitting', 'cozy'], ['minh hoạ', 'cuộn len', 'đan len', 'ấm áp'], ['handDrawn', 'cute'],
      `<line x1="160" y1="180" x2="640" y2="620" stroke="#BC6C25" stroke-width="18" stroke-linecap="round"/>
       <line x1="640" y1="180" x2="160" y2="620" stroke="#BC6C25" stroke-width="18" stroke-linecap="round"/>
       <circle cx="160" cy="180" r="24" fill="#E63946" stroke="#2B2118" stroke-width="8"/>
       <circle cx="640" cy="180" r="24" fill="#E63946" stroke="#2B2118" stroke-width="8"/>
       <circle cx="400" cy="410" r="165" fill="#FF8FA3" stroke="#2B2118" stroke-width="12"/>
       <path d="M265 340 Q400 280 535 360 M255 430 Q400 370 545 450 M290 510 Q400 465 510 520" fill="none" stroke="#2B2118" stroke-width="9"/>`],
    ['illus-cherry-pair-stem', 'Sweet Red Twin Cherries with Green Leaf', 'Đôi quả anh đào đỏ mọng cuống lá xanh', ['illustration', 'cherries', 'fruit', 'cute'], ['minh hoạ', 'quả cherry', 'anh đào', 'ngọt ngào'], ['handDrawn', 'cute'],
      `<path d="M275 490 Q340 260 430 150 Q460 310 525 490" fill="none" stroke="#2D6A4F" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
       <path d="M430 150 C520 120 595 180 545 245 C490 265 445 215 430 150 Z" fill="#52B788" stroke="#2B2118" stroke-width="10"/>
       <circle cx="265" cy="535" r="105" fill="#E63946" stroke="#2B2118" stroke-width="12"/>
       <circle cx="535" cy="535" r="105" fill="#E63946" stroke="#2B2118" stroke-width="12"/>
       <circle cx="230" cy="500" r="22" fill="#FFFFFF"/><circle cx="500" cy="500" r="22" fill="#FFFFFF"/>`],
    ['illus-origami-paper-plane', 'Pastel Blue Paper Airplane with Dotted Trail', 'Máy bay giấy xanh bay theo đường nét đứt', ['illustration', 'paper plane', 'flight', 'message'], ['minh hoạ', 'máy bay giấy', 'ước mơ', 'bay cao'], ['handDrawn', 'cute', 'travel'],
      `<polygon points="680,160 140,360 340,445" fill="#8ECAE6" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
       <polygon points="680,160 340,445 395,580" fill="#219EBC" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
       <polygon points="680,160 395,580 545,495" fill="#BDE0FE" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
       <path d="M120 650 Q230 640 295 545" fill="none" stroke="#E76F51" stroke-width="12" stroke-dasharray="18 18" stroke-linecap="round"/>`],
    ['illus-mushroom-toadstool-duo', 'Red Polka-Dot Woodland Toadstool Mushrooms', 'Đôi nấm đỏ chấm trắng trong khu rừng cổ tích', ['illustration', 'mushroom', 'toadstool', 'nature'], ['minh hoạ', 'nấm đỏ', 'cổ tích', 'thiên nhiên'], ['handDrawn', 'cute', 'nature'],
      `<path d="M275 390 L385 390 L405 645 L255 645 Z" fill="#FFF8E7" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
       <path d="M140 400 C140 165 520 165 520 400 Z" fill="#E63946" stroke="#2B2118" stroke-width="12" stroke-linejoin="round"/>
       <circle cx="260" cy="295" r="32" fill="#FFF8E7"/><circle cx="385" cy="260" r="36" fill="#FFF8E7"/><circle cx="435" cy="345" r="26" fill="#FFF8E7"/>
       <path d="M510 490 L585 490 L595 645 L495 645 Z" fill="#FFF8E7" stroke="#2B2118" stroke-width="11"/>
       <path d="M435 500 C435 360 660 360 660 500 Z" fill="#E76F51" stroke="#2B2118" stroke-width="11"/>`]
  ];
  return ILLUS_ITEMS.concat(extras);
}

// 42 Monochrome Black Ink Stamps & Postmarks matching refs/scrl/IMG_3988.PNG
const INK_STAMPS = [
  { id: 'stamp-circle-paris-postes', en: 'Paris Postes Circular Cancellation Postmark', vi: 'Dấu bưu điện tròn Paris Postes 1928', type: 'circle', top: 'PARIS ★ POSTES ★', bot: 'RÉPUBLIQUE FRANÇAISE', mid: '14 AOUT 28', seed: 11 },
  { id: 'stamp-circle-hanoi-vietnam', en: 'Bưu Điện Hà Nội Việt Nam Circular Postmark', vi: 'Dấu bưu điện tròn Hà Nội - Việt Nam', type: 'circle', top: 'BƯU ĐIỆN VIỆT NAM', bot: '★ HÀ NỘI ★', mid: '19 - 10 - 26', seed: 17 },
  { id: 'stamp-circle-saigon-buudien', en: 'Sài Gòn Post Office Circular Ink Stamp', vi: 'Dấu mực tròn Bưu Điện Sài Gòn', type: 'circle', top: 'BƯU ĐIỆN TRUNG ƯƠNG', bot: '★ SÀI GÒN ★', mid: '08 . 03 . 65', seed: 23 },
  { id: 'stamp-circle-tokyo-japan', en: 'Tokyo Imperial Post Circular Cancellation', vi: 'Dấu bưu điện tròn Tokyo Nhật Bản (郵便局)', type: 'circle', top: 'TOKYO CENTRAL POST', bot: '★ 郵便局 • JAPAN ★', mid: '24 . 11 . 32', seed: 29 },
  { id: 'stamp-circle-london-royal-mail', en: 'London Royal Mail Double-Ring Postmark', vi: 'Dấu bưu điện tròn đôi London Royal Mail', type: 'circle', top: 'LONDON • ROYAL MAIL', bot: '★ GREAT BRITAIN ★', mid: '22 DEC 1934', seed: 37 },
  { id: 'stamp-circle-newyork-airmail', en: 'New York U.S. Air Mail Circular Postmark', vi: 'Dấu bưu điện hàng không New York U.S.A.', type: 'circle', top: 'NEW YORK • U.S.A.', bot: '★ AIR MAIL SERVICE ★', mid: 'OCT 18 1948', seed: 41 },
  { id: 'stamp-circle-roma-italia', en: 'Poste Italiane Roma Circular Postmark', vi: 'Dấu bưu điện tròn Roma Poste Italiane', type: 'circle', top: 'POSTE ITALIANE • ROMA', bot: '★ FERROVIA ★', mid: '05 . IV . 38', seed: 47 },
  { id: 'stamp-circle-madrid-correos', en: 'Correos España Madrid Circular Postmark', vi: 'Dấu bưu điện tròn Madrid Correos España', type: 'circle', top: 'CORREOS • ESPAÑA', bot: '★ MADRID CENTRO ★', mid: '12 MAY 52', seed: 53 },
  { id: 'stamp-circle-lisboa-portugal', en: 'Correios Portugal Lisboa Circular Postmark', vi: 'Dấu bưu điện tròn Lisboa Bồ Đào Nha', type: 'circle', top: 'PORTUGAL • CORREIOS', bot: '★ LISBOA CENTRAL ★', mid: '19 SET 45', seed: 59 },
  { id: 'stamp-circle-mexico-postal', en: 'Servicio Postal Mexicano Circular Postmark', vi: 'Dấu bưu điện tròn Servicio Postal México', type: 'circle', top: 'MÉXICO • SERVICIO POSTAL', bot: '★ CORREO AÉREO ★', mid: '03 MAR 56', seed: 67 },
  { id: 'stamp-wave-paris-louvre', en: 'Paris Louvre Postmark with Wavy Cancellation Lines', vi: 'Dấu bưu điện Paris kèm 6 đường sóng huỷ tem', type: 'wave-combo', top: 'PARIS • LOUVRE', bot: '★ FRANCE ★', mid: '27 JUIN 35', seed: 71 },
  { id: 'stamp-wave-airmail-express', en: 'Air Mail Express Postmark with Wavy Lines', vi: 'Dấu bưu điện Air Mail kèm đường sóng mực', type: 'wave-combo', top: 'INTERNATIONAL', bot: '★ AIR MAIL ★', mid: '10 NOV 58', seed: 79 },
  { id: 'stamp-wave-saigon-paravion', en: 'Sài Gòn Par Avion Postmark & Wavy Bars', vi: 'Dấu bưu điện Sài Gòn Par Avion kèm vạch sóng', type: 'wave-combo', top: 'SÀI GÒN • PAR AVION', bot: '★ VIỆT NAM ★', mid: '15 . 04 . 62', seed: 83 },
  { id: 'stamp-wave-tokyo-kyoto', en: 'Kyoto Japan Postmark with Wavy Cancellation', vi: 'Dấu bưu điện Kyoto Nhật Bản kèm đường sóng', type: 'wave-combo', top: 'KYOTO • JAPAN POST', bot: '★ 京都郵便局 ★', mid: '09 . 10 . 54', seed: 89 },
  { id: 'stamp-wave-lines-seven', en: 'Seven Parallel Wavy Postal Cancellation Lines', vi: 'Dải 7 đường sóng mực huỷ tem bưu chính', type: 'waves-only', seed: 97 },
  { id: 'stamp-wave-bars-obliterator', en: 'Vintage Horizontal Bar & Slogan Obliterator', vi: 'Dấu gạch ngang huỷ tem cổ điển', type: 'bars-only', top: 'ALWAYS USE ZIP CODE', bot: 'FIRST CLASS MAIL', seed: 103 },
  { id: 'stamp-perf-france-25c', en: 'Perforated Postage Stamp Frame France 0,25F', vi: 'Tem bưu chính răng cưa République Française 0,25F', type: 'perf-stamp', country: 'RÉPUBLIQUE FRANÇAISE', val: '0,25 F', sub: 'POSTES', motif: 'liberty', seed: 109 },
  { id: 'stamp-perf-vietnam-50d', en: 'Perforated Postage Stamp Việt Nam 50 Đồng', vi: 'Tem bưu chính răng cưa Việt Nam 50 Đồng', type: 'perf-stamp', country: 'BƯU CHÍNH VIỆT NAM', val: '50 Đ', sub: 'VIỆT NAM', motif: 'lotus', seed: 113 },
  { id: 'stamp-perf-japan-10yen', en: 'Perforated Postage Stamp Nippon Japan 10 Yen', vi: 'Tem bưu chính răng cưa Nhật Bản (日本郵便) 10¥', type: 'perf-stamp', country: 'NIPPON • 日本郵便', val: '10 ¥', sub: 'POSTAGE', motif: 'fuji', seed: 127 },
  { id: 'stamp-perf-usa-5cents', en: 'Perforated Postage Stamp United States 5¢', vi: 'Tem bưu chính răng cưa Hoa Kỳ 5 Cents', type: 'perf-stamp', country: 'UNITED STATES POSTAGE', val: '5 ¢', sub: 'U.S. MAIL', motif: 'eagle', seed: 131 },
  { id: 'stamp-perf-italia-100lire', en: 'Perforated Postage Stamp Poste Italiane 100 Lire', vi: 'Tem bưu chính răng cưa Ý Poste Italiane 100L', type: 'perf-stamp', country: 'POSTE ITALIANE', val: '100 L.', sub: 'ITALIA', motif: 'column', seed: 137 },
  { id: 'stamp-perf-espana-1pta', en: 'Perforated Postage Stamp Correos España 1 Pta', vi: 'Tem bưu chính răng cưa Tây Ban Nha 1 Peseta', type: 'perf-stamp', country: 'CORREOS • ESPAÑA', val: '1 PTA', sub: 'CORREOS', motif: 'crown', seed: 149 },
  { id: 'stamp-perf-uk-2pence', en: 'Perforated Postage Stamp Great Britain 2d', vi: 'Tem bưu chính răng cưa Vương Quốc Anh 2d', type: 'perf-stamp', country: 'POSTAGE • REVENUE', val: '2 d', sub: 'ROYAL MAIL', motif: 'crown', seed: 157 },
  { id: 'stamp-perf-portugal-50c', en: 'Perforated Postage Stamp Portugal Correios 50c', vi: 'Tem bưu chính răng cưa Bồ Đào Nha 50 Centavos', type: 'perf-stamp', country: 'PORTUGAL • CORREIOS', val: '50 C', sub: 'SERVIÇO POSTAL', motif: 'ship', seed: 163 },
  { id: 'stamp-perf-airmail-wide', en: 'Wide Perforated Air Mail Stamp with Biplane', vi: 'Tem ngang răng cưa Air Mail hình máy bay cánh kép', type: 'perf-wide', country: 'INTERNATIONAL AIR MAIL', val: '25 ¢', sub: 'PAR AVION', seed: 173 },
  { id: 'stamp-perf-orient-express', en: 'Wide Perforated Stamp Orient Express Locomotive', vi: 'Tem ngang răng cưa tàu tốc hành Orient Express', type: 'perf-wide', country: 'COMPAGNIE INTERNATIONALE', val: '1,50 F', sub: 'GRAND EXPRESS', seed: 181 },
  { id: 'stamp-box-par-avion', en: 'Boxed PAR AVION / BY AIR MAIL Rubber Stamp', vi: 'Dấu đóng khung chữ nhật PAR AVION / BY AIR MAIL', type: 'box-stamp', line1: 'PAR AVION', line2: 'BY AIR MAIL • HÀNG KHÔNG', seed: 191 },
  { id: 'stamp-box-registered-mail', en: 'Boxed REGISTERED / RECOMMANDÉ Postal Stamp', vi: 'Dấu đóng khung RECOMMANDÉ - Thư bảo đảm', type: 'box-stamp', line1: 'RECOMMANDÉ', line2: 'REGISTERED • № 48291', seed: 197 },
  { id: 'stamp-box-via-airmail', en: 'Winged VIA AIR MAIL Express Ink Stamp', vi: 'Dấu mực VIA AIR MAIL kèm đôi cánh cổ điển', type: 'box-stamp', line1: '✈ VIA AIR MAIL', line2: 'CORREO AÉREO • EXPRESS', seed: 211 },
  { id: 'stamp-box-approved-authentic', en: 'Double-Border APPROVED & AUTHENTICATED Stamp', vi: 'Dấu khung đôi APPROVED - Chứng thực nguyên bản', type: 'box-stamp', line1: 'AUTHENTICATED', line2: 'ORIGINAL ARCHIVE • 1924', seed: 223 },
  { id: 'stamp-box-fragile-handle', en: 'Vintage Stencil FRAGILE Special Delivery Stamp', vi: 'Dấu kiện hàng FRAGILE - Chuyển phát đặc biệt', type: 'box-stamp', line1: 'SPECIAL DELIVERY', line2: '★ FRAGILE • URGENT ★', seed: 229 },
  { id: 'stamp-box-porto-paye', en: 'Boxed PORT PAYÉ / POSTAGE PAID French Stamp', vi: 'Dấu bưu chính Pháp PORT PAYÉ - Đã trả cước', type: 'box-stamp', line1: 'PORT PAYÉ', line2: 'TAXE PERÇUE • PARIS', seed: 239 },
  { id: 'stamp-oval-hotel-grand-palace', en: 'Oval Grand Hotel de l\'Europe Luggage Ink Stamp', vi: 'Dấu mực bầu dục Grand Hôtel de l\'Europe', type: 'oval-stamp', top: 'GRAND HÔTEL DE L\'EUROPE', bot: '★ CONCIERGE • BAGAGES ★', mid: 'PARIS', seed: 241 },
  { id: 'stamp-oval-customs-douane', en: 'Oval Customs Inspection Douane Officielle Stamp', vi: 'Dấu hải quan hình bầu dục Douane Contrôle', type: 'oval-stamp', top: 'DOUANE FRANÇAISE • CONTRÔLE', bot: '★ PASSEPORT VÉRIFIÉ ★', mid: 'LE HAVRE', seed: 251 },
  { id: 'stamp-oval-biblioteca-archive', en: 'Oval Ex-Libris Royal Library Archive Stamp', vi: 'Dấu thư viện cổ Ex-Libris Bibliothèque Royale', type: 'oval-stamp', top: 'BIBLIOTHÈQUE HISTORIQUE', bot: '★ EX-LIBRIS ARCHIVES ★', mid: 'N° 1889', seed: 263 },
  { id: 'stamp-triangle-airmail-avion', en: 'Triangular Par Avion Air Post Ink Stamp', vi: 'Dấu bưu điện tam giác Par Avion cổ điển', type: 'triangle-stamp', top: 'PAR AVION', bot: 'CORREO AÉREO', mid: '15 C', seed: 271 },
  { id: 'stamp-diamond-colonial-post', en: 'Diamond Lozenge Indochine Postes Ink Stamp', vi: 'Dấu mực hình thoi Đông Dương Bưu Chính', type: 'diamond-stamp', top: 'POSTES', bot: 'INDOCHINE', mid: '1930', seed: 281 },
  { id: 'stamp-octagon-visa-immigration', en: 'Octagonal Immigration Visa Entry Ink Stamp', vi: 'Dấu thị thực nhập cảnh hình bát giác cổ', type: 'octagon-stamp', top: 'IMMIGRATION • ENTRY VISA', bot: '★ ADMITTED ★', mid: '21 OCT 1954', seed: 293 },
  { id: 'stamp-ornament-fleuron-scroll', en: 'Victorian Typographic Scrollwork Fleuron Divider', vi: 'Hoa văn dây lá uốn lượn khắc mực cổ điển', type: 'ornament-scroll', seed: 307 },
  { id: 'stamp-ornament-heraldic-crest', en: 'Vintage Post Horn & Laurel Wreath Emblem', vi: 'Biểu tượng tù và bưu chính & vòng nguyệt quế nét mực', type: 'ornament-horn', seed: 317 },
  { id: 'stamp-ornament-pointing-hand', en: 'Victorian Manicule Pointing Hand Return to Sender', vi: 'Bàn tay chỉ hướng cổ điển Return to Sender', type: 'ornament-hand', seed: 331 },
  { id: 'stamp-ornament-crown-rosette', en: 'Ornate Engraved Rosette Seal & Flourish', vi: 'Hoa thị khắc nét cổ điển & đường lượn thư pháp', type: 'ornament-rosette', seed: 347 }
];

function renderInkStampSvg(st) {
  const ink = '#191716';
  let content = '';
  if (st.type === 'circle') {
    content = `
      <g transform="rotate(${(st.seed % 15) - 7} 400 400)">
        <circle cx="400" cy="400" r="285" fill="none" stroke="${ink}" stroke-width="14"/>
        <circle cx="400" cy="400" r="262" fill="none" stroke="${ink}" stroke-width="5"/>
        <circle cx="400" cy="400" r="165" fill="none" stroke="${ink}" stroke-width="8"/>
        <line x1="142" y1="348" x2="658" y2="348" stroke="${ink}" stroke-width="8"/>
        <line x1="142" y1="452" x2="658" y2="452" stroke="${ink}" stroke-width="8"/>
        <circle cx="205" cy="300" r="10" fill="${ink}"/><circle cx="595" cy="300" r="10" fill="${ink}"/>
        <circle cx="205" cy="500" r="10" fill="${ink}"/><circle cx="595" cy="500" r="10" fill="${ink}"/>
        <text x="400" y="255" font-family="Georgia, 'Times New Roman', serif" font-size="27" font-weight="bold" letter-spacing="2" fill="${ink}" text-anchor="middle">${st.top}</text>
        <text x="400" y="318" font-family="'Courier New', monospace" font-size="22" font-weight="bold" letter-spacing="4" fill="${ink}" text-anchor="middle">★ POSTES • MAIL ★</text>
        <text x="400" y="415" font-family="'Courier New', monospace" font-size="44" font-weight="bold" letter-spacing="3" fill="${ink}" text-anchor="middle">${st.mid}</text>
        <text x="400" y="505" font-family="'Courier New', monospace" font-size="22" font-weight="bold" letter-spacing="4" fill="${ink}" text-anchor="middle">• EXPÉDITION •</text>
        <text x="400" y="562" font-family="Georgia, 'Times New Roman', serif" font-size="25" font-weight="bold" letter-spacing="2" fill="${ink}" text-anchor="middle">${st.bot}</text>
      </g>`;
  } else if (st.type === 'wave-combo') {
    let waves = '';
    for (let i = 0; i < 6; i++) {
      const y = 240 + i * 62;
      waves += `<path d="M 435 ${y} Q 495 ${y - 34} 555 ${y} T 675 ${y} T 785 ${y}" fill="none" stroke="${ink}" stroke-width="13" stroke-linecap="round"/>`;
    }
    content = `
      <circle cx="235" cy="400" r="195" fill="none" stroke="${ink}" stroke-width="12"/>
      <circle cx="235" cy="400" r="176" fill="none" stroke="${ink}" stroke-width="4"/>
      <circle cx="235" cy="400" r="110" fill="none" stroke="${ink}" stroke-width="6"/>
      <line x1="58" y1="362" x2="412" y2="362" stroke="${ink}" stroke-width="6"/>
      <line x1="58" y1="438" x2="412" y2="438" stroke="${ink}" stroke-width="6"/>
      <text x="235" y="295" font-family="Georgia, serif" font-size="20" font-weight="bold" letter-spacing="1.5" fill="${ink}" text-anchor="middle">${st.top}</text>
      <text x="235" y="340" font-family="'Courier New', monospace" font-size="18" font-weight="bold" letter-spacing="2" fill="${ink}" text-anchor="middle">★ POST ★</text>
      <text x="235" y="411" font-family="'Courier New', monospace" font-size="30" font-weight="bold" fill="${ink}" text-anchor="middle">${st.mid}</text>
      <text x="235" y="478" font-family="'Courier New', monospace" font-size="18" font-weight="bold" letter-spacing="2" fill="${ink}" text-anchor="middle">• AIR MAIL •</text>
      <text x="235" y="518" font-family="Georgia, serif" font-size="20" font-weight="bold" letter-spacing="1.5" fill="${ink}" text-anchor="middle">${st.bot}</text>
      ${waves}`;
  } else if (st.type === 'waves-only') {
    let waves = '';
    for (let i = 0; i < 7; i++) {
      const y = 185 + i * 70;
      waves += `<path d="M 65 ${y} Q 155 ${y - 42} 245 ${y} T 425 ${y} T 605 ${y} T 745 ${y}" fill="none" stroke="${ink}" stroke-width="15" stroke-linecap="round"/>`;
    }
    content = waves;
  } else if (st.type === 'bars-only') {
    content = `
      <line x1="70" y1="220" x2="730" y2="220" stroke="${ink}" stroke-width="16"/>
      <line x1="70" y1="265" x2="730" y2="265" stroke="${ink}" stroke-width="12"/>
      <rect x="90" y="310" width="620" height="180" fill="none" stroke="${ink}" stroke-width="12"/>
      <text x="400" y="385" font-family="'Courier New', monospace" font-size="44" font-weight="bold" letter-spacing="4" fill="${ink}" text-anchor="middle">${st.top}</text>
      <text x="400" y="455" font-family="Georgia, serif" font-size="36" font-weight="bold" letter-spacing="6" fill="${ink}" text-anchor="middle">${st.bot}</text>
      <line x1="70" y1="535" x2="730" y2="535" stroke="${ink}" stroke-width="12"/>
      <line x1="70" y1="580" x2="730" y2="580" stroke="${ink}" stroke-width="16"/>`;
  } else if (st.type === 'perf-stamp') {
    let holes = '';
    for (let x = 160; x <= 640; x += 32) {
      holes += `<circle cx="${x}" cy="95" r="10" fill="black"/><circle cx="${x}" cy="705" r="10" fill="black"/>`;
    }
    for (let y = 95; y <= 705; y += 32) {
      holes += `<circle cx="160" cy="${y}" r="10" fill="black"/><circle cx="640" cy="${y}" r="10" fill="black"/>`;
    }
    let hatch = '';
    for (let y = 215; y <= 550; y += 12) {
      hatch += `<line x1="215" y1="${y}" x2="585" y2="${y}" stroke="${ink}" stroke-width="2" opacity="0.35"/>`;
    }
    let motifSvg = `<circle cx="400" cy="390" r="115" fill="none" stroke="${ink}" stroke-width="9"/>
                    <path d="M350 455 L400 285 L450 455 M335 385 L465 385 M325 320 L400 265 L475 320" fill="none" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/>`;
    if (st.motif === 'lotus') {
      motifSvg = `<circle cx="400" cy="390" r="115" fill="none" stroke="${ink}" stroke-width="9"/>
                  <path d="M400 290 C365 350 365 420 400 465 C435 420 435 350 400 290 Z M400 465 C330 430 310 365 345 320 C375 355 385 415 400 465 Z M400 465 C470 430 490 365 455 320 C425 355 415 415 400 465 Z" fill="none" stroke="${ink}" stroke-width="9"/>`;
    } else if (st.motif === 'fuji') {
      motifSvg = `<circle cx="400" cy="390" r="115" fill="none" stroke="${ink}" stroke-width="9"/>
                  <circle cx="435" cy="340" r="28" fill="none" stroke="${ink}" stroke-width="8"/>
                  <path d="M295 455 L365 355 L415 355 L495 455 Z" fill="none" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/>`;
    } else if (st.motif === 'ship') {
      motifSvg = `<circle cx="400" cy="390" r="115" fill="none" stroke="${ink}" stroke-width="9"/>
                  <path d="M320 435 L480 435 L455 475 L345 475 Z M400 300 L400 435 M400 310 L465 410 L400 410 M390 325 L335 410 L390 410" fill="none" stroke="${ink}" stroke-width="9" stroke-linejoin="round"/>`;
    } else if (st.motif === 'eagle') {
      motifSvg = `<circle cx="400" cy="390" r="115" fill="none" stroke="${ink}" stroke-width="9"/>
                  <polygon points="400,295 425,365 495,365 440,410 460,475 400,435 340,475 360,410 305,365 375,365" fill="none" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/>`;
    } else if (st.motif === 'column') {
      motifSvg = `<circle cx="400" cy="390" r="115" fill="none" stroke="${ink}" stroke-width="9"/>
                  <rect x="335" y="310" width="130" height="24" fill="none" stroke="${ink}" stroke-width="8"/>
                  <rect x="355" y="334" width="90" height="115" fill="none" stroke="${ink}" stroke-width="8"/>
                  <line x1="380" y1="334" x2="380" y2="449" stroke="${ink}" stroke-width="6"/>
                  <line x1="420" y1="334" x2="420" y2="449" stroke="${ink}" stroke-width="6"/>
                  <rect x="330" y="449" width="140" height="24" fill="none" stroke="${ink}" stroke-width="8"/>`;
    } else if (st.motif === 'crown') {
      motifSvg = `<circle cx="400" cy="390" r="115" fill="none" stroke="${ink}" stroke-width="9"/>
                  <polygon points="320,445 305,335 365,380 400,315 435,380 495,335 480,445" fill="none" stroke="${ink}" stroke-width="10" stroke-linejoin="round"/>
                  <line x1="315" y1="465" x2="485" y2="465" stroke="${ink}" stroke-width="10"/>`;
    }
    content = `
      <defs>
        <mask id="perfMask">
          <rect x="0" y="0" width="800" height="800" fill="white"/>
          ${holes}
        </mask>
      </defs>
      <g mask="url(#perfMask)">
        <rect x="160" y="95" width="480" height="610" fill="none" stroke="${ink}" stroke-width="14"/>
        <rect x="190" y="125" width="420" height="550" fill="none" stroke="${ink}" stroke-width="8"/>
        <rect x="205" y="140" width="390" height="58" fill="none" stroke="${ink}" stroke-width="8"/>
        <text x="400" y="179" font-family="Georgia, serif" font-size="24" font-weight="bold" letter-spacing="1.5" fill="${ink}" text-anchor="middle">${st.country}</text>
        ${hatch}
        ${motifSvg}
        <rect x="205" y="575" width="230" height="75" fill="none" stroke="${ink}" stroke-width="8"/>
        <text x="320" y="623" font-family="Georgia, serif" font-size="27" font-weight="bold" letter-spacing="2" fill="${ink}" text-anchor="middle">${st.sub}</text>
        <rect x="445" y="575" width="150" height="75" fill="none" stroke="${ink}" stroke-width="10"/>
        <text x="520" y="626" font-family="Georgia, serif" font-size="38" font-weight="bold" fill="${ink}" text-anchor="middle">${st.val}</text>
      </g>`;
  } else if (st.type === 'perf-wide') {
    let holes = '';
    for (let x = 95; x <= 705; x += 32) {
      holes += `<circle cx="${x}" cy="190" r="10" fill="black"/><circle cx="${x}" cy="610" r="10" fill="black"/>`;
    }
    for (let y = 190; y <= 610; y += 32) {
      holes += `<circle cx="95" cy="${y}" r="10" fill="black"/><circle cx="705" cy="${y}" r="10" fill="black"/>`;
    }
    content = `
      <defs>
        <mask id="perfWideMask">
          <rect x="0" y="0" width="800" height="800" fill="white"/>
          ${holes}
        </mask>
      </defs>
      <g mask="url(#perfWideMask)">
        <rect x="95" y="190" width="610" height="420" fill="none" stroke="${ink}" stroke-width="14"/>
        <rect x="125" y="220" width="550" height="360" fill="none" stroke="${ink}" stroke-width="8"/>
        <text x="400" y="268" font-family="Georgia, serif" font-size="28" font-weight="bold" letter-spacing="4" fill="${ink}" text-anchor="middle">${st.country}</text>
        <line x1="145" y1="285" x2="655" y2="285" stroke="${ink}" stroke-width="5"/>
        <path d="M220 390 L580 390 M320 340 L480 340 M320 440 L480 440 M400 320 L400 460" stroke="${ink}" stroke-width="12" stroke-linecap="round"/>
        <circle cx="400" cy="390" r="32" fill="none" stroke="${ink}" stroke-width="9"/>
        <text x="270" y="545" font-family="'Courier New', monospace" font-size="34" font-weight="bold" letter-spacing="3" fill="${ink}" text-anchor="middle">${st.sub}</text>
        <rect x="515" y="495" width="140" height="68" fill="none" stroke="${ink}" stroke-width="9"/>
        <text x="585" y="542" font-family="Georgia, serif" font-size="38" font-weight="bold" fill="${ink}" text-anchor="middle">${st.val}</text>
      </g>`;
  } else if (st.type === 'box-stamp') {
    content = `
      <g transform="rotate(${(st.seed % 11) - 5} 400 400)">
        <rect x="85" y="240" width="630" height="320" rx="22" fill="none" stroke="${ink}" stroke-width="16"/>
        <rect x="108" y="263" width="584" height="274" rx="12" fill="none" stroke="${ink}" stroke-width="6"/>
        <line x1="130" y1="425" x2="670" y2="425" stroke="${ink}" stroke-width="7"/>
        <text x="400" y="382" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="bold" letter-spacing="4" fill="${ink}" text-anchor="middle">${st.line1}</text>
        <text x="400" y="492" font-family="'Courier New', monospace" font-size="32" font-weight="bold" letter-spacing="3" fill="${ink}" text-anchor="middle">${st.line2}</text>
      </g>`;
  } else if (st.type === 'oval-stamp') {
    content = `
      <ellipse cx="400" cy="400" rx="330" ry="215" fill="none" stroke="${ink}" stroke-width="14"/>
      <ellipse cx="400" cy="400" rx="308" ry="193" fill="none" stroke="${ink}" stroke-width="5"/>
      <ellipse cx="400" cy="400" rx="195" ry="95" fill="none" stroke="${ink}" stroke-width="7"/>
      <text x="400" y="275" font-family="Georgia, serif" font-size="25" font-weight="bold" letter-spacing="2" fill="${ink}" text-anchor="middle">${st.top}</text>
      <text x="400" y="415" font-family="Georgia, serif" font-size="42" font-weight="bold" letter-spacing="5" fill="${ink}" text-anchor="middle">${st.mid}</text>
      <text x="400" y="542" font-family="Georgia, serif" font-size="24" font-weight="bold" letter-spacing="2" fill="${ink}" text-anchor="middle">${st.bot}</text>`;
  } else if (st.type === 'triangle-stamp') {
    content = `
      <polygon points="400,115 695,635 105,635" fill="none" stroke="${ink}" stroke-width="16" stroke-linejoin="round"/>
      <polygon points="400,160 655,610 145,610" fill="none" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>
      <text x="400" y="435" font-family="Georgia, serif" font-size="44" font-weight="bold" letter-spacing="4" fill="${ink}" text-anchor="middle">${st.top}</text>
      <text x="400" y="510" font-family="'Courier New', monospace" font-size="52" font-weight="bold" fill="${ink}" text-anchor="middle">${st.mid}</text>
      <text x="400" y="580" font-family="Georgia, serif" font-size="30" font-weight="bold" letter-spacing="5" fill="${ink}" text-anchor="middle">${st.bot}</text>`;
  } else if (st.type === 'diamond-stamp') {
    content = `
      <polygon points="400,90 710,400 400,710 90,400" fill="none" stroke="${ink}" stroke-width="16" stroke-linejoin="round"/>
      <polygon points="400,128 672,400 400,672 128,400" fill="none" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>
      <line x1="210" y1="340" x2="590" y2="340" stroke="${ink}" stroke-width="7"/>
      <line x1="210" y1="460" x2="590" y2="460" stroke="${ink}" stroke-width="7"/>
      <text x="400" y="305" font-family="Georgia, serif" font-size="38" font-weight="bold" letter-spacing="5" fill="${ink}" text-anchor="middle">${st.top}</text>
      <text x="400" y="418" font-family="'Courier New', monospace" font-size="54" font-weight="bold" letter-spacing="6" fill="${ink}" text-anchor="middle">${st.mid}</text>
      <text x="400" y="520" font-family="Georgia, serif" font-size="36" font-weight="bold" letter-spacing="4" fill="${ink}" text-anchor="middle">${st.bot}</text>`;
  } else if (st.type === 'octagon-stamp') {
    content = `
      <polygon points="275,110 525,110 690,275 690,525 525,690 275,690 110,525 110,275" fill="none" stroke="${ink}" stroke-width="15"/>
      <polygon points="288,135 512,135 665,288 665,512 512,665 288,665 135,512 135,288" fill="none" stroke="${ink}" stroke-width="5"/>
      <line x1="165" y1="345" x2="635" y2="345" stroke="${ink}" stroke-width="7"/>
      <line x1="165" y1="455" x2="635" y2="455" stroke="${ink}" stroke-width="7"/>
      <text x="400" y="290" font-family="Georgia, serif" font-size="28" font-weight="bold" letter-spacing="3" fill="${ink}" text-anchor="middle">${st.top}</text>
      <text x="400" y="415" font-family="'Courier New', monospace" font-size="46" font-weight="bold" letter-spacing="4" fill="${ink}" text-anchor="middle">${st.mid}</text>
      <text x="400" y="535" font-family="Georgia, serif" font-size="34" font-weight="bold" letter-spacing="5" fill="${ink}" text-anchor="middle">${st.bot}</text>`;
  } else if (st.type === 'ornament-scroll') {
    content = `
      <path d="M 90 400 C 160 280 280 280 400 400 C 520 520 640 520 710 400" fill="none" stroke="${ink}" stroke-width="14" stroke-linecap="round"/>
      <path d="M 90 400 C 160 520 280 520 400 400 C 520 280 640 280 710 400" fill="none" stroke="${ink}" stroke-width="10" stroke-linecap="round"/>
      <circle cx="400" cy="400" r="42" fill="${ink}"/>
      <circle cx="195" cy="400" r="22" fill="${ink}"/><circle cx="605" cy="400" r="22" fill="${ink}"/>
      <path d="M 330 270 Q 400 190 470 270 M 330 530 Q 400 610 470 530" fill="none" stroke="${ink}" stroke-width="10" stroke-linecap="round"/>`;
  } else if (st.type === 'ornament-horn') {
    content = `
      <circle cx="370" cy="390" r="105" fill="none" stroke="${ink}" stroke-width="18"/>
      <path d="M 180 390 L 560 390 L 635 315 L 635 465 L 560 390" fill="none" stroke="${ink}" stroke-width="18" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M 240 560 C 130 460 130 260 265 180 M 560 560 C 670 460 670 260 535 180" fill="none" stroke="${ink}" stroke-width="14" stroke-dasharray="28 14" stroke-linecap="round"/>`;
  } else if (st.type === 'ornament-hand') {
    content = `
      <path d="M 120 350 L 260 350 L 260 470 L 120 470 Z" fill="${ink}"/>
      <path d="M 260 355 L 440 330 L 440 295 L 680 295 C 710 295 710 345 680 345 L 515 345 L 535 475 L 260 465 Z" fill="none" stroke="${ink}" stroke-width="14" stroke-linejoin="round"/>
      <line x1="450" y1="385" x2="545" y2="385" stroke="${ink}" stroke-width="12" stroke-linecap="round"/>
      <line x1="450" y1="430" x2="540" y2="430" stroke="${ink}" stroke-width="12" stroke-linecap="round"/>
      <text x="400" y="575" font-family="'Courier New', monospace" font-size="36" font-weight="bold" letter-spacing="4" fill="${ink}" text-anchor="middle">RETURN TO SENDER</text>`;
  } else {
    content = `
      <circle cx="400" cy="400" r="245" fill="none" stroke="${ink}" stroke-width="12" stroke-dasharray="26 14"/>
      <circle cx="400" cy="400" r="195" fill="none" stroke="${ink}" stroke-width="10"/>
      <polygon points="400,175 450,330 610,330 480,425 530,580 400,485 270,580 320,425 190,330 350,330" fill="none" stroke="${ink}" stroke-width="12" stroke-linejoin="round"/>
      <circle cx="400" cy="400" r="55" fill="${ink}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <defs>
      <filter id="inkGrunge" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="${st.seed}" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.5" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.14" numOctaves="3" seed="${st.seed + 50}" result="fineNoise"/>
        <feColorMatrix in="fineNoise" type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0   0 0 0 2.9 -0.55" result="grainMask"/>
        <feComposite in="displaced" in2="grainMask" operator="in"/>
      </filter>
    </defs>
    <g filter="url(#inkGrunge)">
      ${content}
    </g>
  </svg>`;
}

async function run() {
  // 1. sticker/hand-doodles -> Illustrations / Minh hoạ (20 -> 60)
  {
    const dir = path.join(ROOT, 'assets', 'sticker', 'hand-doodles');
    syncExistingSrc('sticker', 'hand-doodles');
    const manifestPath = path.join(dir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.name = { en: 'Illustrations', vi: 'Minh hoạ' };
    manifest.items = manifest.items.slice(0, 20);
    const allIllus = buildExtraIllus().slice(0, 40);
    for (const [id, en, vi, tagsEn, tagsVi, cols, svg] of allIllus) {
      await saveSvgAsPng(svg, path.join(dir, 'src', `${id}.png`));
      manifest.items.push({
        id,
        name: { en, vi },
        tags: { en: tagsEn, vi: tagsVi },
        collections: cols,
        source: {
          provider: 'IG Layout',
          url: 'https://ig-layout.local/assets/hand-doodles',
          author: 'IG Layout Studio',
          title: en,
          license: 'CC0-1.0',
          retrieved: '2026-10-19'
        }
      });
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`hand-doodles: ${manifest.items.length} items`);
  }

  // 2. sticker/vintage-maps-compass -> Travel & Vintage / Du lịch & đồ cổ (16 -> 40)
  {
    const dir = path.join(ROOT, 'assets', 'sticker', 'vintage-maps-compass');
    syncExistingSrc('sticker', 'vintage-maps-compass');
    const manifestPath = path.join(dir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.name = { en: 'Travel & Vintage', vi: 'Du lịch & đồ cổ' };
    manifest.items = manifest.items.slice(0, 16);
    for (const [id, en, vi, tagsEn, tagsVi, cols, svg] of TRAVEL_ITEMS) {
      await saveSvgAsPng(svg, path.join(dir, 'src', `${id}.png`));
      manifest.items.push({
        id,
        name: { en, vi },
        tags: { en: tagsEn, vi: tagsVi },
        collections: cols,
        source: {
          provider: 'IG Layout',
          url: 'https://ig-layout.local/assets/vintage-maps-compass',
          author: 'IG Layout Studio',
          title: en,
          license: 'CC0-1.0',
          retrieved: '2026-10-19'
        }
      });
    }
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`vintage-maps-compass: ${manifest.items.length} items`);
  }

  // 3. NEW sticker/ink-stamps -> Ink Stamps & Postmarks / Tem & dấu mực (42 items)
  {
    const dir = path.join(ROOT, 'assets', 'sticker', 'ink-stamps');
    const srcDir = path.join(dir, 'src');
    ensureDir(srcDir);
    const items = [];
    for (const st of INK_STAMPS) {
      const fullSvg = renderInkStampSvg(st);
      await sharp(Buffer.from(fullSvg)).png().toFile(path.join(srcDir, `${st.id}.png`));
      items.push({
        id: st.id,
        name: { en: st.en, vi: st.vi },
        tags: {
          en: ['stamp', 'postmark', 'ink', 'vintage', 'postal'],
          vi: ['tem thư', 'dấu bưu điện', 'dấu mực', 'cổ điển', 'du lịch']
        },
        collections: ['vintage', 'travel', 'journal'],
        source: {
          provider: 'IG Layout',
          url: 'https://ig-layout.local/assets/ink-stamps',
          author: 'IG Layout Studio',
          title: st.en,
          license: 'CC0-1.0',
          retrieved: '2026-10-19'
        }
      });
    }
    const manifest = {
      id: 'ink-stamps',
      kind: 'sticker',
      name: { en: 'Ink Stamps & Postmarks', vi: 'Tem & dấu mực' },
      collections: ['vintage', 'travel', 'journal'],
      order: 15,
      items
    };
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    console.log(`ink-stamps: ${manifest.items.length} items`);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
