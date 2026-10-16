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

### M8 — Sửa UX ✅ (2026-10-15)
Nguồn: [đánh giá UX 2026-10-14](../discussions/2026-10-14-danh-gia-ux.md). Quyết định: D-60..D-65.
- [x] UX-01 Cảm ứng: chạm để chọn, chỉ kéo phần tử đã chọn → vuốt cuộn được slide; ảnh nền (panorama, nền layout) bị khoá; chạm nền khoá = bỏ chọn
- [x] UX-02 Đổi layout giữ chữ / hình / icon / ảnh tự thêm (chỉ thay phần tử do layout sinh ra), kẹp vào trong canvas mới
- [x] UX-03 Thanh công cụ ≤ 5 nút + "Thêm"; Nhân bản / Xoá / Xong luôn ở thanh trên khi đang chọn
- [x] UX-04 + UX-05 Dải thumbnail slide dưới canvas (chạm để tới slide, "+" thêm slide)
- [x] UX-06 Phóng to vùng làm việc (nút + / − / Vừa, pinch trên vùng trống, 1–4×); tay nắm 26 px trên cảm ứng
- [x] UX-07 Pinch hai ngón trên phần tử chưa chọn → chọn và co giãn phần tử đó
- [x] UX-08 Canvas không đổi kích thước khi mở công cụ; tự cuộn tới phần tử đang chọn
- [x] UX-09 Ô lưới / phần tử khoá: chỉ có khung, không tay nắm co giãn / xoay
- [x] UX-10 Bảng Lớp: chọn phần tử bị che, khoá / mở khoá; "Lên trên cùng / Xuống dưới cùng"
- [x] UX-11 Chữ "Đang lưu… / Đã lưu" ở thanh trên
- [x] UX-12 Chạm đúp chữ để sửa; chữ mới có nền tối mờ, dễ đọc trên mọi ảnh
- [x] UX-13 Nút đặt lại cạnh mỗi thanh trượt (ẩn khi đang ở mặc định)
- [x] UX-14 Story không gợi ý layout liền mạch
- [x] UX-15 Hộp thoại trong app thay prompt / confirm (đổi tên, xoá, xoá tất cả)
- [x] UX-16 Tên file xuất theo tên project (bỏ dấu), ví dụ `post-oct-15_01.jpg`
- [x] UX-17 Mẹo lần đầu khi mở editor (3 mẹo, nhớ đã xem)
- [x] UX-20 Lỗi đọc ảnh gợi ý cách xử lý HEIC
- [x] Kiểm tra tự động `e2e/m8.mjs`; các suite cũ cập nhật theo giao diện mới
- [ ] Để sau v1.0: UX-18 (thêm thư viện), UX-19 (giữ trên ảnh để so sánh), UX-22 (chất lượng xuất, xuất 1 slide). UX-21 nằm trong device-test

### M9 — Làm cho "ngon" theo Grids (đang làm)
Nguồn: [tham khảo Grids](../discussions/2026-10-15-tham-khao-grids.md). Quyết định: D-66..D-69.
- [x] D-67 Không bôi đen chữ, không zoom cả trang (viewport + chặn gesture Safari + `touch-action`)
- [x] F-01 Kéo / chụm mượt: canvas chỉ to bằng màn hình (dính cố định, cuộn = dịch nội dung), mật độ ≤ 2×, đường gióng vẽ thẳng bằng Konva. Đo `e2e/drag-perf.mjs` (CPU chậm 4×): khung chậm nhất khi kéo 88 → 26 ms, khi chụm 109 → 27 ms
- [x] F-02 Xoay: vùng chết 8° (chụm không làm lệch góc), hít 0 / 90 / 180 / 270° (±6°, rung nhẹ trên Android), hiện số độ khi xoay, "Thêm → Xoay về 0°"
- [x] F-03 Canvas không nhảy: kích thước tính theo màn hình (chừa chỗ cho thanh dưới cao nhất), căn giữa dọc; trên cảm ứng bỏ nút +/− (chụm để zoom, nút % để về vừa màn)
- [x] F-04 Màn chọn layout không còn mẫu trùng
- [x] Góp ý lần 2 (2026-10-15): chặn kéo xuống để tải lại (`overscroll-behavior`); kéo phần tử đã chọn không còn cuộn cả nền (chặn cuộn ngay từ lúc chạm, cả khi hai ngón); thumbnail slide chỉ vẽ lại slide thay đổi, từng slide lúc rảnh, tự lưu chờ nhấc tay — không còn khựng sau khi thả
- [x] Kiểm tra tự động `e2e/m9.mjs`
- [x] Đổi hướng: làm theo SCRL (D-71), [phân tích bản 2](../discussions/2026-10-16-phan-tich-scrl-grids.md)
- [x] S7 Menu nổi trên phần tử đang chọn: nhân bản, xoá, khoá / mở khoá, ⋯ (ẩn khi đang kéo / chụm; căn giữa phần đang thấy). Thanh dưới khi chọn: công cụ + Xong (cùng chiều cao với thanh khi không chọn)
- [x] S5 Thu nhỏ dưới 100% tới khi thấy cả dải (chụm, hoặc nút − trên máy tính); canvas hẹp thì căn giữa
- [x] S8 Bảng lớp: kéo ⠿ để đổi thứ tự, mắt để ẩn / hiện (lớp ẩn không vẽ, không xuất, không hít), khoá
- [ ] Chủ dự án quay video SCRL (danh sách ở mục 7 bản phân tích) để chỉnh cho đúng
- [x] → chuyển sang M10

### M10 — Trang chủ, template, onboarding (theo SCRL) — xong phần code 2026-10-16
Quyết định: D-72..D-74.
- [x] S1 Onboarding lần đầu: 3 bước (canvas liền dải, bắt đầu từ template, miễn phí / riêng tư / offline), Bỏ qua, cuối: "Xem template" / "Bắt đầu từ trang trắng". Không paywall
- [x] Trang chủ: 2 tab **Template** / **Dự án của tôi**; tiêu đề "IG Layout"; nút "Tạo project" (trang trắng) giữ nguyên
- [x] Thư viện template: nhóm (Tất cả, Carousel, Liền mạch, Collage, Story, Tối giản, Lưới profile); carousel chiếm cả chiều ngang, ảnh đơn / story 2 cột; ô ảnh trống tô màu nhạt
- [x] Chi tiết template: xem trước lớn, loại · tỉ lệ · số ảnh · số slide, "Dùng template"
- [x] S2 Dùng template → project mới (tên = tên template), ô ảnh trống, chữ theo ngôn ngữ đang dùng; không tính là bước hoàn tác
- [x] "Thêm ảnh" điền ô trống trước theo thứ tự của template; ảnh dư đặt nổi như cũ. Template nền ảnh (panorama) có ô nền trống đã khoá
- [x] Template có **chữ** (font, cỡ, màu, căn lề, giãn chữ, nền chữ, xoay) — `TemplateText`
- [x] Bộ 20 template tự thiết kế (`lib/templates/designs.ts`): 5 carousel, 4 liền mạch, 3 collage, 4 story, 3 tối giản, 1 lưới profile
- [x] Kiểm tra tự động `e2e/m10.mjs`
- [ ] Chủ dự án duyệt từng template (đẹp chưa, thêm / bỏ mẫu nào)
- [ ] Chỉnh theo video SCRL khi có (bố cục trang chủ, cách mở template)

### M11 — Thư viện (theo SCRL) — xong phần code 2026-10-16
Quyết định: D-75..D-78.
- [x] S12 **78 font** có tiếng Việt (Google Fonts), 5 nhóm (Không chân, Có chân, Trang trí, Viết tay, Đơn cách); **độ đậm** (thanh trượt cho font biến thiên, nút cho font có độ đậm cố định); nút B vẫn dùng được
- [x] Font chỉ tải khi dùng; CSS khai báo font đi cùng trình chỉnh sửa (tải muộn) — trang chủ chỉ còn 1 file CSS ~10 KB nén; trình chỉnh sửa được tải sẵn lúc rảnh để chạy offline
- [x] S10 **25 filter**: đủ danh sách đã chốt (Mono 5, Vintage 5, Modern 5, Future 5) + Thiên nhiên (Forest, Golden, Skyline) + Ẩm thực (Warm Plate, Fresh)
- [x] S13 **20 sticker** tự vẽ (SVG): băng dính, tim, lấp lánh, sao, mũi tên, vòng khoanh, gạch chân, bong bóng thoại, nhãn, tem, hoa, mặt trời, mây, kẹp giấy, đinh ghim, băng rôn, tia sét, mặt cười; đổi màu chính bằng công cụ Màu
- [x] S13 **8 lớp phủ** sinh bằng code: vệt sáng, vệt hồng, cháy phim, lăng kính, bokeh, bụi, vết xước, giấy; thành ảnh thường + **chế độ hoà trộn** (Thường, Làm sáng, Nhân, Phủ, Sáng dịu) chỉnh trong Kiểu
- [x] S14 Thêm 3 khung: viền đen, polaroid đen, triển lãm
- [x] S17 **Vẽ tay**: ⋯ → Vẽ, màu, cỡ nét, bỏ nét cuối, ✓ thành một phần tử (1 bước hoàn tác), co giãn / đổi màu được
- [x] Credits cập nhật (78 font OFL / Apache; sticker, lớp phủ, template tự làm)
- [x] Kiểm tra tự động `e2e/m11.mjs`
- [ ] Chủ dự án xem filter trên ảnh thật, sticker, lớp phủ, font (bỏ / thêm)
- [ ] Font chưa dùng lần nào sẽ không có khi offline (chấp nhận; ghi trong hướng dẫn)

### M12 — Xoá nền ảnh (theo SCRL) — xong phần code 2026-10-16
Quyết định: D-79. Tìm hiểu thêm: [SVG Repo](../discussions/2026-10-16-svgrepo.md) (chưa làm).
- [x] Chọn mô hình: **ormbg** (Apache-2.0, người + đồ vật), bản int8 ~44 MB; loại `@imgly/background-removal` (AGPL), RMBG-1.4 (phi thương mại), BiRefNet (tràn bộ nhớ WASM); MODNet (Apache, chỉ người) để dự phòng
- [x] Chạy trên máy bằng Transformers.js (Apache-2.0) trong Web Worker (không đơ giao diện); runtime ONNX (MIT) tự host ở `/ort/` (copy lúc build) → offline được sau lần đầu
- [x] ⋯ → **Xoá nền**: lần đầu hỏi trước khi tải ~60 MB (mô hình + runtime, khuyên Wi-Fi); thanh tiến độ tải → đang xử lý; ảnh đổi thành PNG trong suốt, giữ khung / vùng cắt; 1 bước hoàn tác; lần sau không hỏi
- [x] Làm sạch viền (alpha smoothstep) để không còn quầng nền cũ; ảnh > 2048 px được thu nhỏ trước khi xử lý
- [x] Ảnh không rời máy (chỉ tải mô hình từ Hugging Face)
- [x] Kiểm tra `e2e/m12.mjs` (chạy riêng, không nằm trong `pnpm e2e` vì tải 44 MB): 18 s trên máy tính kể cả tải
- [ ] Chủ dự án thử trên điện thoại với ảnh thật (người, đồ vật, thú cưng): chất lượng, thời gian
- [ ] Nếu chậm trên điện thoại: thêm WebGPU (fp16, 88 MB) hoặc MODNet nhẹ cho ảnh chân dung

### Sticker emoji (Fluent Emoji) — 2026-10-16
- [x] ~1600 emoji **Fluent Emoji Flat** (© Microsoft, **MIT**, qua `@iconify-json/fluent-emoji-flat`), bỏ biến thể màu da; 9 nhóm; tải theo nhóm (`public/emoji/*.json`, tạo lúc build bởi `scripts/build-emoji.mjs`); tìm theo tên (tiếng Anh)
- [x] SVG của emoji lưu trong phần tử → mở lại / offline không cần tải; emoji giữ màu gốc (chỉ chỉnh độ mờ)
- [x] Credits; kiểm tra trong `e2e/m11.mjs`

### M13 — Video: thử nghiệm (đang chờ kết quả máy thật)
Chi tiết: [video-lab](../discussions/2026-10-16-video-lab.md).
- [x] Trang thử `/labs/video`: khả năng trình duyệt, phát video trên canvas, xuất MP4 H.264 1080×1350 3 s, lưu / chia sẻ, sao chép kết quả
- [x] Máy tính: xuất 3 s trong 1,9 s, MP4 hợp lệ (ffprobe)
- [x] Service worker: trang khác `/` không ghi đè bản offline của app
- [x] Chủ dự án chạy trên iPhone: video thật 1902×1080 phát 60 fps trên canvas; xuất 3 s MP4 H.264 trong 1,8 s
- [ ] Xác nhận: file MP4 lưu vào Ảnh được và Instagram nhận (chọn được khi tạo bài)
- [x] Theo tiêu chí: **làm M13 đầy đủ** — [đặc tả video](../product/video-spec.md) (D-80, D-81)
- [x] Trang thử bước 4: nén video đã chọn về 1080p, giữ tiếng (Mediabunny) — máy tính: 10 s trong 1,4 s, H.264 + AAC
- [ ] Chủ dự án chạy bước 4 trên iPhone: có tiếng không, Instagram chọn được file không

