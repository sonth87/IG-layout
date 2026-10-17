# Danh mục tài sản (M20)

Ngày: 2026-10-17. Liên quan: D-106 (giấy phép), D-107 (bộ sinh khung), D-108 (thư mục), [kế hoạch M20](../roadmap/m20-plan.md).

Tài liệu này là **"hợp đồng" chung** giữa người thu thập tài sản (Gemini, chủ dự án) và app (Claude). Ai thêm tài sản cũng phải theo đúng định dạng này; script `validate.mjs` kiểm tra tự động.

## 1. Tài sản nào đi qua danh mục

| Loại (`kind`) | Là gì | Ví dụ |
|---|---|---|
| `sticker` | Hình nền trong suốt, thêm lên canvas như một ảnh tự do | tem cổ, vé, hoa lá vẽ, doodle, băng dính chụp thật |
| `frame` | Ảnh khung có **cửa sổ trong suốt**; ảnh của người dùng nằm dưới, khung đè lên trên | khung tranh cổ, bưu thiếp, khung tem, polaroid chụp thật |
| `texture` | Ảnh chất liệu cho **Nền** slide (có thể lát lặp) | giấy, vải, gỗ, đá |
| `overlay` | Ảnh phủ lên slide với chế độ hoà trộn | vệt sáng, bụi, hạt phim, giấy nhăn |
| `font` | Phông chữ (file WOFF2 chia theo bảng chữ) | viết tay, thư pháp, tiếng Nhật |

Những thứ **vẽ bằng code** vẫn ở trong `src/lib/elements/` như cũ: hình, sticker SVG tự vẽ, widget, chất liệu tự vẽ, và khung do bộ sinh tạo ra (D-107).

## 2. Thư mục

```
assets/                          ← nguồn (commit)
  <kind>/<pack>/manifest.json    ← hồ sơ của một gói: tên, bộ, từng mục kèm giấy phép
  <kind>/<pack>/src/             ← file gốc tải về (KHÔNG commit — .gitignore)
  _sources/<tên>/manifest.json   ← tài sản phụ không vào thư viện (ví dụ mép giấy xé thật cho bộ sinh khung)
  text/                          ← dữ liệu chữ (câu xem trước phông…)

public/packs/                    ← thứ app tải về (commit)
  catalog.json                   ← sinh tự động: danh sách gói, phông, ghi công
  <kind>/<pack>.json             ← sinh tự động: các mục của gói (tải khi mở gói)
  <kind>/<pack>/<id>.webp        ← ảnh đã xử lý
  <kind>/<pack>/<id>.thumb.webp  ← ảnh thu nhỏ cho lưới thư viện
  font/<pack>/<id>/<file>.woff2  ← phông
```

`<pack>` và `<id>`: chữ thường, số, gạch nối (kebab-case), không dấu. Ví dụ `vintage-stamps`, `stamp-france-1902`.

## 3. `manifest.json`

```json
{
  "id": "vintage-stamps",
  "kind": "sticker",
  "name": { "en": "Vintage stamps", "vi": "Tem cổ" },
  "collections": ["vintage", "travel"],
  "order": 20,
  "items": [
    {
      "id": "stamp-france-1902",
      "name": { "en": "French stamp 1902", "vi": "Tem Pháp 1902" },
      "tags": { "en": ["stamp", "postage", "france", "red"], "vi": ["tem", "bưu chính", "pháp", "đỏ"] },
      "collections": ["journal"],
      "source": {
        "provider": "Smithsonian Open Access",
        "url": "https://www.si.edu/object/…",
        "author": "…",
        "title": "…",
        "license": "CC0-1.0",
        "retrieved": "2026-10-18"
      },
      "width": 812,
      "height": 1024
    }
  ]
}
```

Các trường (kiểu TypeScript ở `src/lib/catalog/types.ts`):

- **Gói:** `id` (trùng tên thư mục), `kind` (trùng thư mục cha), `name.en/vi`, `collections` (bộ của cả gói), `order` (số nhỏ hiện trước).
- **Mục:**
  - `id`, `name.en/vi`, `tags.en[]/vi[]` (từ khoá tìm kiếm, mỗi thứ tiếng ít nhất 2), `collections` (bộ thêm).
  - `source` — **bắt buộc**:
    - `provider`, `url` (trang của **chính mục đó**, không phải trang tìm kiếm), `license`, `retrieved`.
    - Nên có `author`, `title`.
    - Giấy phép `custom` phải có `licenseUrl`.
  - `width`, `height` — kích thước file đã xử lý (script xử lý tự điền).
  - Riêng `frame`: `windows` — các cửa sổ ảnh, toạ độ 0–1 theo kích thước ảnh khung: `{x, y, w, h, shape?: "rect"|"ellipse", path?, rotation?}`.
  - Riêng `texture`: `tile: true` nếu lát lặp được (mép khớp nhau).
  - Riêng `overlay`: `blend` — `screen` / `multiply` / `overlay` / `soft-light` / `normal`.
  - Tuỳ chọn `process: { removeBg?: false, trim?: false }` — bảo script xử lý không tách nền / không cắt sát mục này.
- **Phông** (gói `kind: "font"`): mỗi mục có
  - `family` (tên CSS), `label`, `styles[]`, `languages[]`, `weights[]`;
  - `files[]` gồm `{weight, subset, file, unicodeRange}`, với `file` là đường dẫn dưới `public/packs/`;
  - `source`.
  - Các giá trị hợp lệ của `styles` và `languages` nằm trong `scripts/assets/common.mjs`.
  - `languages` chỉ ghi khi phông **thật sự** có đủ chữ. Ví dụ `vietnamese` = đủ mọi chữ có dấu.

**Bộ** (`collections`): chỉ dùng mã trong `src/lib/catalog/collections.json` (tet, midAutumn, christmas, travel, film, tornPaper, journal, vintage…). Muốn thêm bộ mới thì thêm vào file đó (kèm tên EN / VI, `season` nếu theo mùa).

## 4. Giấy phép (D-106)

Mã giấy phép hợp lệ nằm trong `src/lib/catalog/licenses.json`:
- `CC0-1.0`, `PDM`;
- `MIT`, `ISC`, `Apache-2.0`, `OFL-1.1`;
- `CC-BY-4.0`, `CC-BY-3.0`, `CC-BY-SA-4.0`;
- `CC-BY-NC-4.0`, `CC-BY-NC-SA-4.0`;
- `custom` (kèm `licenseUrl`).

- App phi thương mại nên **NC dùng được**.
- **Cấm** các nguồn có điều khoản không cho đưa vào thư viện / app: Pixabay, Unsplash, Pexels, Freepik, Flaticon, Canva, Vecteezy, các kho ảnh trả phí, Etsy, Creative Market, DaFont… Danh sách `bannedHosts` trong cùng file; `validate.mjs` báo lỗi nếu `url` thuộc các trang đó.
- **Kiểm tra giấy phép ở trang gốc của từng mục**, không tin nhãn của trang tổng hợp. Ví dụ Openverse có khi gắn nhầm giấy phép.
- Không lấy: logo / nhãn hiệu, nhân vật có bản quyền, ảnh có người nhận diện được, ảnh có watermark.

## 5. Ảnh đã xử lý

| Loại | Định dạng | Cạnh dài tối đa | Dung lượng nên dưới |
|---|---|---|---|
| sticker | WebP có alpha | 1024 px | 350 KB |
| frame | WebP có alpha | 1600 px | 600 KB |
| texture | WebP | 1024 px | 450 KB |
| overlay | WebP | 1600 px | 600 KB |
| thumb (mọi loại) | WebP | 192 px | 30 KB |

- **Sticker:** đã tách nền, cắt sát vật (chừa 2 – 4 % lề), mép sạch, không viền trắng / quầng màu.
- **Frame:** cửa sổ trong suốt hoàn toàn (alpha = 0), phần khung đục; `windows` khớp đúng các lỗ.

## 6. Quy trình

1. Tìm tài sản, tải file gốc vào `assets/<kind>/<pack>/src/<id>.<đuôi>`, ghi mục vào `manifest.json`.
2. `node scripts/assets/process.mjs <kind>/<pack>` — xử lý ảnh gốc thành `public/packs/…` (tách nền, cắt, đổi cỡ, WebP, ảnh thu nhỏ, dò cửa sổ khung), điền `width/height/windows` vào manifest. *(Script này là việc G1 của Gemini.)*
3. `node scripts/assets/review.mjs <kind>/<pack>` — sinh trang HTML xem nhanh cả gói (trên nền sáng, tối, ca rô) để duyệt bằng mắt. *(G1.)*
4. `node scripts/assets/validate.mjs` — phải **OK**, không lỗi.
5. `node scripts/assets/build-catalog.mjs` — sinh `public/packs/catalog.json` và `<kind>/<pack>.json`.
6. Commit `assets/**/manifest.json` + `public/packs/**`, không commit `src/`.

## 7. App dùng danh mục thế nào

- Mở thư viện → tải `catalog.json` (nhỏ) → hiện các gói với vài mục xem trước.
- Mở một gói, hoặc cuộn tới gói đó → tải `<kind>/<pack>.json` và ảnh thu nhỏ.
- Chạm một mục:
  - tải ảnh lớn, lưu vào dự án như một ảnh (IndexedDB), nên dự án không phụ thuộc vào gói về sau;
  - thêm vào canvas.
- Service worker lưu lại những gì đã tải → dùng offline được.
- Phông: tải `woff2` theo từng bảng chữ khi cần (FontFace + `unicode-range`).
- Màn **Cảm ơn** đọc `credits` trong `catalog.json` (gom theo nguồn, tác giả, giấy phép), cộng với phần ghi công của thư viện code.
