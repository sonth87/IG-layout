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
| `m11.mjs` | 78 font (nhóm, độ đậm, font tải đúng), 25 filter, sticker (thêm, đổi màu), lớp phủ (hoà trộn làm sáng ảnh, đổi chế độ), vẽ tay (chạm thật, bỏ nét, ✓), khung triển lãm, lưu & mở lại, xuất |
| `m12.mjs` | (chạy riêng: `node e2e/m12.mjs <url>`, tải mô hình 44 MB) Xoá nền: hỏi trước lần đầu, PNG trong suốt, 1 bước hoàn tác, runtime từ cùng domain, ảnh không tải lên, lần sau không hỏi |
| `m13.mjs` | Video: nhập + nén (giữ tiếng, ảnh bìa), phát / dừng, công cụ Âm thanh, xuất MP4 (ffprobe: H.264 1080×1350 + AAC, độ dài; tắt tiếng), mở lại. Cần ffmpeg / ffprobe |
| `m13b.mjs` | Filter trên video (xuất ra xám với Noir), chuyển động (đánh máy, trượt ra, xoay tròn liên tục), Ken Burns, về vị trí thật khi dừng, slide chuyển động → MP4 |
| `m13c.mjs` | Nhạc nền (chọn, âm lượng, phát cùng project, trộn vào video, mở lại), xuất: ảnh tĩnh JPEG / video & chuyển động MP4 có tiếng, video 9:16 (1080×1920, độ dài = các slide + lướt, có tiếng) |
| `booth-solo.mjs` | Booth `/booth` (camera giả của Chromium): sảnh, 8 khung, ô camera đúng hình ô, đếm 8 giây + nghỉ 2 giây, tự chụp đủ 4 kiểu, ảnh in trượt ra, lưu JPEG 600×1800, chạm ảnh → chụp lại riêng kiểu đó, lật ảnh, cuộn phim còn sau khi tải lại, chụp dư 1 + 2 → chọn, xoá cuộn |
| `booth-decorate.mjs` | Booth trang trí: tải 4 ảnh lên → Trang trí: 6 theme vẽ khác nhau, filter Noir làm ảnh xám, dòng chữ riêng + tắt ngày giờ, đổi sang Lưới 2×2 sau khi chụp → lưu JPEG 1200×1800 → theme / filter / chữ còn sau khi tải lại |
| `booth-handoff.mjs` | Booth bước 3: lưu dạng Post 4:5 (1080×1350) / Story (1080×1920); Mở trong IG Layout → Carousel (bản in + 4 kiểu = 5 slide), Story, Bất ngờ (bố cục bốc ngẫu nhiên) — vào editor, project được lưu |
| `booth-desktop.mjs` | Booth trên máy tính 1280×800: chọn khung ở cột phải cạnh camera, 1 camera → không có nút đổi camera, hình góc to hơn, Enter bắt đầu, Space tạm dừng, Esc thoát; bản in bên trái, nút bên phải |
| `tag.mjs` | Tag treo `/labs/tag`: đung đưa, giật nhẹ không chuyển, kéo quá ngưỡng → booth, chạm → về, nghiêng điện thoại → tag ngả theo |
| `tag-switch.mjs` | Kéo tag chuyển IG Layout ↔ booth: lấy mẫu màu giữa màn liên tục — sáng → tối (hoặc ngược lại) một lần, không nháy về màu cũ / trang trắng |
| `drag-perf.mjs` | (không nằm trong `pnpm e2e`) đo thời gian khung hình khi kéo / chụm trên điện thoại giả lập, CPU chậm 4× |
| `perf.mjs` | (không nằm trong `pnpm e2e`) đo thời gian nhập 20 ảnh 4000 px, thời gian vẽ lại, bộ nhớ canvas |
| `sheets.mjs` | Chạm ra ngoài đóng hẳn sheet của phần tử, chọn lại không tự bật lại; ảnh panorama thêm vào không khoá (D-134) |
| `filters.mjs` | Filter v2: trang thử `/labs/filters` vẽ đủ filter công thức, filter Film đổi màu ảnh, filter đen trắng ở 30 % vẫn xám hoàn toàn; trong editor: máy ảnh retro (filter + lớp, chạm lại xáo), viền vẽ trên canvas, dấu ngày, ✓ = 1 bước (D-131, D-132) |
| `offline.mjs` | Vào trang 1 lần → tắt mạng → vẫn chạy, kể cả mở trình chỉnh sửa lần đầu (tải muộn, M11) |

- Cần Chromium: `CHROME_PATH=...` hoặc `npx playwright install chromium-headless-shell`.
- `m2.mjs` dùng `sips` (macOS) để đọc kích thước ảnh xuất.
- Ảnh chụp màn hình, file ZIP: `e2e/.out/` (không commit).
- Test đọc trạng thái editor qua `window.__igEditor` (chỉ đọc).
