# Công cụ xử lý & kiểm tra tài sản thư viện (`scripts/assets/`)

Bộ script phục vụ quy trình thu thập, xử lý ảnh, duyệt trực quan và đóng gói danh mục tài sản (M20 — xem [docs/architecture/asset-catalog.md](../../docs/architecture/asset-catalog.md)).

## 1. Yêu cầu cài đặt

- **Node.js 20+** và `pnpm`.
- Các thư viện đã có sẵn trong `package.json`:
  - `sharp` (`0.35.x`): đọc ảnh gốc (`.png`, `.jpg`, `.webp`, `.tif`, `.svg`…), cắt lề, đục cửa sổ khung, đổi cỡ và nén WebP.
  - `@huggingface/transformers` (`^4.3.1`): chạy mô hình tách nền cục bộ `onnx-community/ormbg-ONNX` (giấy phép Apache-2.0, lượng tử hoá `q8` ~44 MB) ngay trên máy, không gọi dịch vụ đám mây. Lần chạy đầu tiên mô hình được tải về bộ nhớ đệm cục bộ trong `node_modules/.pnpm/.../@huggingface/transformers/.cache/`.

## 2. Cấu trúc thư mục

- Nguồn (commit `manifest.json`, **không** commit `src/` và `review.html`):
  - `assets/<kind>/<pack>/manifest.json`
  - `assets/<kind>/<pack>/src/<id>.<jpg|png|webp|svg|tif>`
- Đầu ra (commit vào repo):
  - `public/packs/<kind>/<pack>/<id>.webp`
  - `public/packs/<kind>/<pack>/<id>.thumb.webp`
  - `public/packs/<kind>/<pack>.json`
  - `public/packs/catalog.json`

## 3. Các lệnh sử dụng

### 3.1. Xử lý ảnh gốc (`process.mjs`)

```bash
node scripts/assets/process.mjs <kind>/<pack> [--only <id>] [--force]
```

Ví dụ:
```bash
node scripts/assets/process.mjs sticker/vintage-stamps
node scripts/assets/process.mjs sticker/vintage-stamps --only stamp-us-airmail-1918 --force
node scripts/assets/process.mjs frame/gilded-frames --force
```

**Cơ chế theo từng loại (`kind`):**
- `sticker`:
  - Tự động tách nền bằng mô hình `ormbg-ONNX` chạy trên máy nếu ảnh gốc chưa có kênh alpha trong suốt (có dự phòng flood-fill từ 4 góc nếu ảnh là tem/nhãn trên nền giấy đồng nhất). Có thể tắt tách nền cho từng mục bằng `"process": { "removeBg": false }`.
  - Làm sạch mép (`cleanStickerEdges`): khử nhiễu alpha thấp (`alpha <= 12%` → `0`), làm mượt biên bằng smoothstep và khử quầng màu nền (color decontamination) ở các điểm ảnh bán trong suốt.
  - Cắt sát vùng có hình (`alpha > 16`) và chừa lề trong suốt `3%` mỗi cạnh (tắt bằng `"process": { "trim": false }`).
- `frame`:
  - Nếu mục trong `manifest.json` đã khai báo sẵn `windows` (`[{ x, y, w, h, shape?, rotation? }]` trong hệ toạ độ `0–1`), script sẽ **đục vùng cửa sổ đó thành trong suốt** (`alpha = 0` kèm chuyển biên mượt).
  - Nếu chưa khai báo `windows`, script tự động dò các vùng trong suốt kín bên trong khung (loại trừ phần nền trong suốt thông ra mép ngoài) và ghi toạ độ chuẩn hoá `0–1` vào `manifest.json`.
- `texture`:
  - Đổi cỡ về giới hạn cạnh dài `≤ 1024 px`.
  - Nếu `"tile": true`, tự động kiểm tra độ khớp màu giữa mép trái/phải và trên/dưới, in cảnh báo nếu độ lệch trung bình cao.
- `overlay`:
  - Đổi cỡ về giới hạn cạnh dài `≤ 1600 px`.
- **Tất cả các loại:**
  - Tự động hạ mức chất lượng WebP (và giảm nhẹ kích thước nếu cần) để đảm bảo dung lượng nằm dưới ngưỡng quy định (`sticker ≤ 350 KB`, `frame ≤ 600 KB`, `texture ≤ 450 KB`, `overlay ≤ 600 KB`, `thumb ≤ 30 KB` ở cạnh dài `192 px`).
  - Tự điền `width`, `height` (và `windows` cho `frame`) vào `manifest.json` với định dạng JSON 2 dấu cách.
  - Bỏ qua các mục đã có file đầu ra mới hơn file gốc (trừ khi truyền `--force`).

### 3.2. Sinh trang duyệt trực quan (`review.mjs`)

```bash
node scripts/assets/review.mjs <kind>/<pack>
```

- Sinh file `assets/<kind>/<pack>/review.html` (đã có trong `.gitignore`, không commit).
- Hiển thị toàn bộ mục trong gói trên **3 nền**: Sáng, Tối, Ca rô.
- Hiện tên tiếng Việt / tiếng Anh, mã `id`, kích thước, dung lượng, nhãn giấy phép, link tới trang gốc và tác giả.
- Với gói `frame`, tự động vẽ **khung viền đỏ** đánh số quanh từng vùng cửa sổ `windows`.

### 3.3. Kiểm tra hợp lệ (`validate.mjs`)

```bash
node scripts/assets/validate.mjs
```

- Kiểm tra toàn bộ `manifest.json`, mã giấy phép, nguồn bị cấm (D-106), kích thước và định dạng WebP trong `public/packs/`. Phải báo `OK` (exit code `0`) trước khi commit.

### 3.4. Đóng gói danh mục (`build-catalog.mjs`)

```bash
node scripts/assets/build-catalog.mjs
```

- Sinh `public/packs/catalog.json` và `public/packs/<kind>/<pack>.json` từ các `manifest.json`.
