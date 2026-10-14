# Checklist

Đi kèm [plan.md](plan.md). Tick khi xong; mốc chưa bắt đầu chỉ ghi việc ở mức thô, sẽ chi tiết hóa trước khi làm.

## Giai đoạn 0 — Làm rõ yêu cầu

- [x] Phân tích đề bài và thị trường
- [x] Chốt: không upload Instagram, user tự tải về
- [x] Chốt: miễn phí, không cạnh tranh
- [x] Chốt: Next.js + PWA
- [x] Tạo bộ tài liệu `docs/`
- [x] Chốt: mobile-first
- [x] Tham khảo tính năng chỉnh ảnh từ các app khác
- [x] Chốt: 3 loại project Post / Story / Grid, mỗi project một loại
- [x] Chốt: cơ chế history (xác nhận mới ghi), không giới hạn, chỉ Back / Next
- [x] Chốt: chỉnh sửa không phá hủy
- [x] Chốt: nhóm và tên filter, 5 filter thử nghiệm, áp cho tất cả có xác nhận
- [x] Chốt: lưu trữ IndexedDB, nhiều project, tự thu nhỏ ảnh khi nhập
- [x] Chốt: ngôn ngữ (EN mặc định, có VI); theme sáng / tối
- [x] Chốt: font (Google Fonts), sticker (thư viện riêng), tùy chọn Grid
- [x] Phân tích các dạng layout ([layouts.md](../user/layouts.md))
- [x] Wireframe v1 + v2 (19 màn hình) — lưu tại [design/wireframes/](../design/wireframes/index.html)
- [x] Viết lộ trình, các mốc MVP (M1–M7), quy trình làm việc ([plan.md](plan.md))
- [x] Duyệt phạm vi MVP: toàn bộ plan (D-46)
- [x] Chốt kiến trúc D-06, D-07
- [x] Thiết kế kỹ thuật toàn dự án ([editor-model.md](../architecture/editor-model.md))
- [ ] Góp ý & chốt wireframe
- [ ] Xác minh lại thông số Instagram
- [ ] Trả lời các câu hỏi còn lại: Q-03, Q-08, Q-13

## Giai đoạn 1 — Prototype kỹ thuật

- [x] Khởi tạo project Next.js 16 (static export) + manifest PWA + icon
- [x] Nhập ảnh: đọc EXIF orientation, tự thu nhỏ theo D-29, giới hạn diện tích cho iOS
- [x] Canvas nhiều slide (Konva): đặt ảnh, kéo, scale, xoay, đổi lớp, xóa, thêm / bớt slide
- [x] Lịch sử undo / redo (ghi 1 bước khi thả tay)
- [x] Export từng slide → JPEG đúng kích thước; ZIP / từng ảnh / share sheet
- [x] Kiểm tra tự động trên Chromium: 3 slide 4:5 → 3 file 1080 × 1350, chỗ nối khớp, không lỗi console
- [x] Khởi tạo git, push lên GitHub (`sonth87/IG-layout`)
- [x] Deploy thử (HTTPS): Vercel — https://ig-layout.vercel.app/
- [ ] Test trên iPhone (Safari): chạm, kéo, xoay, cuộn dải slide, Save images, nhập 20 ảnh
- [ ] Test trên Android (Chrome): như trên
- [ ] Chốt D-38: giữ Konva hay đổi Fabric

## Giai đoạn 2 — MVP

### M1 — Nền tảng
Nhánh: `m1-foundation`. Chi tiết hóa ngày 2026-10-14.

**Lưu trữ (IndexedDB)**
- [x] DB `ig-layout`: store `projects` (thông tin hiển thị: tên, loại, tỉ lệ, số slide, ngày sửa, ảnh thu nhỏ, dung lượng), `states` (doc + lịch sử), `assets` (ảnh, theo project)
- [x] Tạo project → lưu ngay; nhập ảnh → lưu ảnh ngay
- [x] Tự lưu doc + lịch sử sau mỗi bước (debounce), cập nhật ảnh thu nhỏ slide 1
- [x] Mở lại project: nạp doc, lịch sử (undo được tiếp), ảnh
- [x] Đổi tên, xóa project (xóa cả ảnh)
- [x] Xin quyền lưu lâu dài (`navigator.storage.persist`) khi tạo project đầu tiên

**Màn hình**
- [x] "Project của tôi": danh sách (ảnh thu nhỏ, loại, tỉ lệ · số slide · dung lượng, lần sửa), lọc theo loại, thanh dung lượng, nút New project
- [x] Banner nhắc cài app (Android/Chrome: nút Install; iOS: hướng dẫn Add to Home Screen); ẩn khi đã cài
- [x] Settings: theme (System / Light / Dark), ngôn ngữ (English / Tiếng Việt), dung lượng, xóa tất cả, About
- [x] Editor: nút Back lưu rồi về danh sách (bỏ hộp xác nhận)

**Theme & ngôn ngữ**
- [x] Theme lưu ở localStorage, áp trước khi hiển thị (không nháy màu)
- [x] i18n gọn tự viết (từ điển EN / VI + hook `useT`), không dùng thư viện vì app chỉ chạy client
- [x] Font giao diện có tiếng Việt: Be Vietnam Pro (thay DM Sans)

**Offline (PWA)**
- [x] Service worker `public/sw.js` (cache khi tải + "warm" danh sách file đã tải), đăng ký ở bản production
- [x] Kiểm tra: vào trang 1 lần → tắt mạng → tải lại vẫn chạy (local + Vercel)

**Kiểm tra & bàn giao**
- [x] Kiểm tra tự động: tạo project → nhập ảnh → kéo → tải lại trang → project còn, undo được → đổi tên → xóa; đổi theme / ngôn ngữ; offline
- [x] Cập nhật tài liệu, commit, push nhánh
- [x] Deploy tự động khi push lên `main` (Vercel nối với repo GitHub)

### M2 — Editor cốt lõi
Nhánh: `m2-editor-core` — xong 2026-10-14, đã merge vào `main`. Thiết kế: [editor-model.md](../architecture/editor-model.md) mục 1–5.
- [x] Mô hình phần tử chung (base + image mở rộng: crop, straighten, flip, mask, viền, bóng, opacity) + chuyển đổi dữ liệu project cũ
- [x] Bản nháp công cụ: `beginDraft / updateDraft / applyDraft / cancelDraft`; autosave bỏ qua draft
- [x] Hiển thị ảnh dạng Group + clip theo mask + viền + bóng
- [x] Thanh công cụ theo ngữ cảnh: chưa chọn (Add photos, Background, Slides) / chọn ảnh (Replace, Crop, Mask, Style, Forward, Backward, Duplicate, Delete); lật nằm trong Crop
- [x] Cử chỉ 2 ngón: pinch + xoay phần tử đang chọn
- [x] Hít & đường gióng (slide, ranh giới, phần tử khác)
- [x] Công cụ Crop: khung cắt, tỉ lệ (Free, Original, 1:1, 4:5, 3:4, 16:9), nắn thẳng, xoay 90°, lật, reset
- [x] Công cụ Mask: 8 hình + bo góc
- [x] Công cụ Border: độ dày, màu; bóng đổ; độ mờ
- [x] Thay ảnh (Replace), nhân bản
- [x] Nền: màu, gradient, ảnh làm mờ
- [x] Quản lý slide: thêm sau slide đang xem, xóa, đổi chỗ; dịch phần tử theo
- [x] Kiểm tra tự động (13 nhóm, gồm pinch 2 ngón qua sự kiện chạm thật, tải lại trang, project cũ M1) + cập nhật tài liệu
- [x] Lưu ngay khi app bị ẩn / đóng (không mất thay đổi cuối)

### M3 — Layout & template
Nhánh: `m3-layouts` — xong 2026-10-14, đã merge vào `main`. Thiết kế: [editor-model.md](../architecture/editor-model.md) mục 6.
- [x] Định dạng template (dữ liệu TypeScript, tọa độ tương đối theo slide) + `applyTemplate` sinh phần tử thật
- [x] Ô trống (`assetId: null`) hiển thị "+"; chọn ô → "Add photo"
- [x] Bộ template đầu tiên (25 mẫu): lưới (2–9 ô, không đều, 2 slide), seamless (panorama + ảnh nổi, dải ảnh, zigzag, ảnh lớn 2 slide + ghép ô, polaroid rải), panorama, scrapbook, khung (viền trắng, vòm, bo góc), mỗi slide 1 ảnh
- [ ] Cuộn film chạy ngang — chuyển sang M5 (cần phần tử hình khối)
- [x] Màn chọn layout sau khi chọn ảnh (có Skip) và từ editor (nút Layout): khay ảnh (chạm 2 ảnh để đổi thứ tự), tab nhóm, gợi ý theo số ảnh, xem trước bằng ảnh thật
- [x] Tự điền ảnh vào ô; ô lưới: kéo = dịch ảnh trong ô; nút "Swap" đổi ảnh giữa hai ô
- [x] Khoảng cách giữa ô, bo góc, màu nền cho template lưới
- [x] i18n số nhiều (`{n|slide|slides}`)
- [x] Sửa lỗi: Thay ảnh / Thêm ảnh không nhận file (xóa input trước khi đọc)
- [x] Kiểm tra tự động: đưa vào repo (`e2e/`, `pnpm e2e`), 4 bộ M1 / M2 / M3 / offline đều đạt

### M4 — Màu & filter
Nhánh: `m4-color` — xong 2026-10-14, đã merge vào `main`. Thiết kế: [editor-model.md](../architecture/editor-model.md) mục 7.
- [x] Shader WebGL (1 lượt cho mọi thông số) + cache LRU; không có WebGL → hiện ảnh gốc
- [x] Công cụ Adjust: 13 thông số (thêm Hue), chip có chấm đánh dấu, slider, chạm đúp để đặt lại, giữ để so sánh, ✓ / ✕
- [x] Vignette vẽ theo khung ảnh (không theo cả ảnh gốc)
- [x] 5 filter (Classic, Kyoto, Retro 70, Clean, Cyberpunk) + cường độ + tab nhóm + ảnh xem trước từng filter
- [x] "Áp dụng cho tất cả ảnh" (chỉ filter) + hộp xác nhận + 1 bước lịch sử
- [x] Xem trước ở độ phân giải ≤ 1600 px; xuất ảnh xử lý lại ở độ phân giải đầy đủ
- [x] Kiểm tra tự động `e2e/m4.mjs` (đọc pixel trên canvas và trên ảnh xuất)
- [ ] Tinh chỉnh màu 5 filter trên ảnh thật — chờ góp ý chủ dự án
- [ ] Đo hiệu năng trên điện thoại tầm trung — gộp vào M7 (thử máy thật)

### M5 — Text & Elements
Nhánh: `m5-text-elements` — xong 2026-10-14, đã merge vào `main`. Thiết kế: [editor-model.md](../architecture/editor-model.md) mục 8.
- [x] Mô hình phần tử nhiều loại: ảnh, chữ, hình khối, icon (+ chuyển đổi dữ liệu cũ)
- [x] Phần tử chữ: 6 font có tiếng Việt (tự host), đậm, cỡ, màu, căn lề, giãn chữ, giãn dòng, viền chữ, bóng, nền chữ (màu, bo góc); co giãn = đổi cỡ chữ
- [x] Sửa chữ bằng ô nhập (bàn phím điện thoại); chờ font tải xong trước khi vẽ và khi xuất
- [x] Hình khối (chữ nhật, bo góc, tròn, tam giác, đường kẻ, mũi tên, cuộn film) + icon (Lucide, 17 icon) + màu, độ mờ
- [x] Khung ảnh: polaroid, viền trắng, film (ảnh lấp phần bên trong khung); chọn trong Style hoặc thêm khung trống từ Elements
- [x] Màn Elements: tìm kiếm, nhóm (Khung ảnh, Hình khối, Icon)
- [x] Layout "Cuộn film" (dời từ M3); "Polaroid rải" dùng khung polaroid thật
- [x] Thanh công cụ theo loại phần tử (ảnh / chữ / hình & icon); thanh chung có Text, Elements
- [x] Trang Credits (font OFL, Lucide ISC, thư viện MIT) trong Settings
- [x] Kiểm tra tự động `e2e/m5.mjs`
- [ ] Material (băng dính washi, giấy note, giấy kraft…) và sticker — để sau MVP như plan

### M6 — Story & Grid
Nhánh: `m6-story-grid` — xong 2026-10-14, đã merge vào `main`. Thiết kế: [editor-model.md](../architecture/editor-model.md) mục 9.
- [x] Module bố cục chung `lib/project/layout.ts` (vị trí slide, kích thước canvas, slide chứa điểm, thứ tự xuất); mọi phần dùng chung module này
- [x] Màn New project: chọn Post / Story / Grid + tùy chọn từng loại
- [x] Story: 9:16, 1–10 khung, vùng an toàn bật / tắt, xuất `story_01…`
- [x] Grid: canvas 3 × N (1–8 hàng), ô 1080 × 1440, số thứ tự đăng trên ô, bù khe hở (vùng khe tô màu, không xuất), thêm / bớt hàng, xuất `grid_01` = ô dưới phải
- [x] Layout lọc theo loại project (Grid: panorama cả lưới, mỗi ô 1 ảnh, khung)
- [x] Mẹo đăng theo loại project; thông tin project trong danh sách theo loại
- [x] Sửa lỗi: ảnh xuất có thể lệch 1 px do làm tròn → vẽ lại đúng kích thước
- [x] Kiểm tra tự động `e2e/m6.mjs` (kiểm thứ tự xuất Grid bằng màu ảnh)
- [ ] Xác minh thông số thật của Instagram: vùng an toàn Story (250 / 340 px), khe hở lưới profile (12 px) — chuyển sang M7 (thử trên app thật)

### M7 — Xuất & hoàn thiện
Nhánh: `m7-polish` — phần code xong 2026-10-14, đã merge vào `main`.
- [x] Xem trước kiểu Instagram: carousel (vuốt, chấm, đếm), trang cá nhân (ảnh bìa 3:4; Grid ghép đúng thứ tự), story (thanh tiến trình, chạm chuyển khung, ô trả lời)
- [x] Màn Export: tab xem trước theo loại project, danh sách file, mẹo đăng theo loại
- [x] Hiệu năng: vẽ từ bản xem trước ≤ 1600 px (vẽ lại 432 → 38 ms với 20 ảnh 4000 px, đo bằng `e2e/perf.mjs`); giới hạn bộ nhớ canvas ~8 MP / layer (tránh vượt giới hạn iOS)
- [x] Khả năng truy cập: viền focus bàn phím, phím tắt (hoàn tác, làm lại, xoá, mũi tên, Esc), nhãn cho nút icon
- [x] Hướng dẫn: màn **?** trong app (EN / VI) + [user/guide.md](../user/guide.md)
- [x] Kiểm tra tự động `e2e/m7.mjs`
- [ ] **Thử trên iPhone + Android thật** — checklist: [device-test.md](device-test.md) (chủ dự án)
- [ ] Xác minh thông số Instagram (vùng an toàn Story, khe lưới) — trong device-test
- [ ] Chốt D-38 (Konva) sau khi thử máy thật
- [ ] Checklist phát hành v1.0 ([plan.md](plan.md))
