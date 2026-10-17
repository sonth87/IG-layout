# assets/

Nguồn của tài sản thư viện (sticker, khung, chất liệu, lớp phủ, phông) — M20.
Định dạng và quy trình: [docs/architecture/asset-catalog.md](../docs/architecture/asset-catalog.md).

- `<kind>/<pack>/manifest.json` — hồ sơ gói, mỗi mục có giấy phép (commit).
- `<kind>/<pack>/src/` — file gốc tải về (không commit).
- `_sources/` — tài sản phụ không vào thư viện (ví dụ mép giấy xé thật).
- `text/` — dữ liệu chữ.

Kiểm tra: `node scripts/assets/validate.mjs` · Sinh danh mục: `node scripts/assets/build-catalog.mjs`.
