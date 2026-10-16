# Kiểm tra end-to-end

Điều khiển Chromium headless trên bản build tĩnh, đi qua các luồng chính của từng mốc.

```bash
pnpm build
pnpm e2e                                   # chạy trên out/ (server tạm, cổng ngẫu nhiên)
node e2e/run.mjs https://ig-layout.vercel.app/   # chạy trên bản deploy
node e2e/m3.mjs http://localhost:4321/     # chạy một bộ
```

| File | Nội dung |
|---|---|
| `m1.mjs` | Projects: tạo, tự lưu, tải lại, undo sau khi mở lại, đổi tên, theme / ngôn ngữ, offline, xóa |
| `m2.mjs` | Editor: panorama, ảnh nổi, mask (✕ / ✓), style, crop, hít, pinch 2 ngón (CDP touch), nhân bản, nền, slide, lưu, xuất ZIP, project cũ |
| `m3.mjs` | Layout: picker sau khi chọn ảnh, đổi thứ tự, seamless, lưới + khoảng cách, kéo trong ô, đổi chỗ, ô trống, undo, Skip |
| `m4.mjs` | Màu: adjust (xem trước không ghi lịch sử, ✕ / ✓), vignette, giữ để so sánh, filter Classic, áp cho tất cả + xác nhận, ảnh xuất mang màu, lưu & mở lại |
| `m5.mjs` | Chữ tiếng Việt (font tải đúng, chiều cao tự theo chữ), kiểu chữ 1 bước, Elements (tìm, icon đổi màu, cuộn film), khung polaroid + điền ảnh, khung từ Style, layout cuộn film, xuất, lưu, Credits |
| `m6.mjs` | Story (9:16, vùng an toàn, xuất `story_01…`), Grid 3 × 2 có bù khe (layout lọc theo loại, ảnh phủ cả khe, thứ tự xuất `grid_01` = ô dưới phải kiểm bằng màu, thêm hàng, tắt bù khe), danh sách project |
| `m7.mjs` | Giới hạn bộ nhớ canvas (20 slide, mật độ 3×), phím tắt, xem trước carousel / trang cá nhân / story / lưới Grid ghép đúng, màn trợ giúp EN / VI |
| `m8.mjs` | Sửa UX: mẹo lần đầu, vuốt cuộn + ảnh nền khoá, chạm chọn rồi kéo, chạm nền bỏ chọn, thanh công cụ gọn, ô lưới không tay nắm, đổi layout giữ chữ, chạm đúp sửa chữ, pinch phần tử chưa chọn, bảng Lớp, canvas không nhảy, nút đặt lại thanh trượt, zoom, thumbnail slide, "Đã lưu", tên file theo project, Story không có layout liền mạch |
| `m9.mjs` | Menu nổi (nhân bản / xoá / khoá), thu nhỏ xem cả dải, bảng lớp kéo thả + ẩn, kéo phần tử không cuộn nền, không zoom / bôi đen trang, layout không trùng, canvas chỉ to bằng màn hình, canvas không nhảy khi chọn / mở công cụ, xoay: vùng chết, hít 0°, "Xoay về 0°" |
| `m10.mjs` | Onboarding lần đầu, thư viện template (nhóm), dùng template → ô trống + chữ (EN / VI), Thêm ảnh điền ô trống, template nền ảnh, xuất |
| `drag-perf.mjs` | (không nằm trong `pnpm e2e`) đo thời gian khung hình khi kéo / chụm trên điện thoại giả lập, CPU chậm 4× |
| `perf.mjs` | (không nằm trong `pnpm e2e`) đo thời gian nhập 20 ảnh 4000 px, thời gian vẽ lại, bộ nhớ canvas |
| `offline.mjs` | Vào trang 1 lần → tắt mạng → vẫn chạy |

- Cần Chromium: `CHROME_PATH=...` hoặc `npx playwright install chromium-headless-shell`.
- `m2.mjs` dùng `sips` (macOS) để đọc kích thước ảnh xuất.
- Ảnh chụp màn hình, file ZIP: `e2e/.out/` (không commit).
- Test đọc trạng thái editor qua `window.__igEditor` (chỉ đọc).
