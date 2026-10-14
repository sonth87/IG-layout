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
| `offline.mjs` | Vào trang 1 lần → tắt mạng → vẫn chạy |

- Cần Chromium: `CHROME_PATH=...` hoặc `npx playwright install chromium-headless-shell`.
- `m2.mjs` dùng `sips` (macOS) để đọc kích thước ảnh xuất.
- Ảnh chụp màn hình, file ZIP: `e2e/.out/` (không commit).
- Test đọc trạng thái editor qua `window.__igEditor` (chỉ đọc).
