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
- [x] Chủ dự án chạy bước 4 trên iPhone: nguồn H.264 1920×1080 + AAC 48 kHz stereo → file nén **có tiếng**
- [ ] Instagram chọn được file MP4 khi tạo bài (chưa báo)

### M13.1 — Video: nền tảng — xong phần code 2026-10-16
Đặc tả: [video-spec](../product/video-spec.md).
- [x] Nhập video (MP4, MOV / HEVC): **nén trên máy** về ≤ 1080p, 30 fps, ≤ 60 s, H.264 4 Mbps + AAC (giữ tiếng; AAC dự phòng nếu trình duyệt không có); thanh tiến độ; ảnh bìa = khung đầu
- [x] Video là "ảnh có phát": kéo, co giãn, xoay, mask, khung, viền, bóng, độ mờ, ô template, vắt qua nhiều slide, cắt khung (trên ảnh bìa)
- [x] **Thanh phát**: Phát / Dừng, thời gian, tua; mọi video chạy cùng một đồng hồ, tự lặp theo đoạn
- [x] **Âm thanh** từng video: bật / tắt, âm lượng (1 bước hoàn tác)
- [x] **Xuất**: slide có video → MP4 H.264 + AAC 1080 × (1350…), 30 fps, dài bằng đoạn video dài nhất (video khác lặp); khung lấy từ giải mã chính xác; tiếng trộn theo âm lượng; tuỳ chọn **"Xuất video có tiếng"**; xem trước Instagram phát video; tên `…_01.mp4`
- [x] Lưu / mở lại (video, ảnh bìa, thiết lập tiếng)
- [x] Kiểm tra tự động `e2e/m13.mjs` (ffprobe: H.264 1080×1350, AAC, độ dài; tắt tiếng → không có track âm thanh)
- [ ] Chủ dự án thử trên iPhone với video thật (nhập, phát có tiếng, xuất, lưu vào Ảnh, đăng Instagram)
- [x] → M13.2 (dưới)

### M13.2 — Cắt đoạn và tốc độ — xong phần code 2026-10-16
- [x] Màn **Cắt đoạn**: video xem trước, **dải khung hình** + **dạng sóng âm thanh**, 2 tay nắm (kéo → thấy đúng khung ở điểm đó), phần ngoài đoạn tối đi, vạch đang phát, nút ±0,1 s cho đầu / cuối, **Phát đoạn đã chọn** (có tiếng, lặp trong đoạn)
- [x] **Tốc độ** 0,5× / 1× / 1,5× / 2× (khác 1× thì tắt tiếng, có ghi chú); **Lặp lại** khi slide dài hơn, hoặc dừng ở khung cuối
- [x] Phát trong editor và xuất theo đoạn / tốc độ / lặp (độ dài file = đoạn ÷ tốc độ)
- [x] ~~Ảnh bìa~~ bỏ (Instagram tự cho chọn)

### M13.3 — Hiệu ứng và chuyển động — xong phần code 2026-10-16
- [x] **Bộ lọc + chỉnh màu cho video** (25 filter, 13 thông số; xử lý từng khung bằng WebGL, xem trước ≤ 1080 px, xuất đủ độ phân giải)
- [x] **Chuyển động** cho mọi phần tử (chữ, sticker, emoji, hình, ảnh, video): **Vào** (hiện dần, trượt 4 hướng, phóng, nảy, đánh máy cho chữ) + thời lượng + chờ; **Ra** (hiện dần, trượt, phóng) + thời lượng; **Liên tục** (nhịp đập, lơ lửng, nhấp nháy, xoay tròn, rung); **Trong khung** cho ảnh / video (Ken Burns: phóng to / thu nhỏ dần, lia trái / phải); **Độ dài slide** có chuyển động (mặc định 5 s); **Xem thử**
- [x] Chỉ hiện chuyển động khi phát / tua; dừng ở 0 s hoặc bắt đầu sửa → phần tử về đúng vị trí thật
- [x] Slide có chuyển động (không cần video) được **xuất thành MP4**
- [x] Kiểm tra `e2e/m13b.mjs`

### M13.4 — Nhạc và xuất nâng cao — xong phần code 2026-10-16
- [x] **Nhạc nền** (⋯ → Nhạc): chọn file trong máy (chuyển về AAC trên máy, ≤ 5 phút), bắt đầu từ, nghe thử 5 s, âm lượng, nhỏ dần đầu / cuối, đổi / bỏ; phát cùng project (lặp nếu bài ngắn hơn); trộn vào mọi video xuất
- [x] **Một video 9:16** (Reels / Story / TikTok) cho Post / Story: lần lượt từng slide (video: dài bằng video; chuyển động: độ dài slide; ảnh tĩnh: 2,5 s), **lướt ngang 0,6 s** sang slide sau (dải canvas di chuyển → carousel liền mạch vẫn liền), có tiếng video + nhạc
- [x] ~~Tự chia story 15 s~~ bỏ (Instagram nhận story 60 s)
- [x] Kiểm tra `e2e/m13c.mjs`
- [ ] Chủ dự án thử toàn bộ video trên iPhone (cắt đoạn, tốc độ, filter, chuyển động, nhạc, video 9:16)
- [x] Sửa (2026-10-17): chạm ô trống "+" mở ngay trình chọn ảnh và điền vào đúng ô đó (trước chỉ chọn ô, không phản hồi) — kiểm trong `e2e/m10.mjs`
- [x] Sửa (2026-10-17, D-85): ảnh bị khoá (nền template, panorama) vẫn kéo / chụm để dời / phóng ảnh trong khung, khung không đổi; thanh công cụ luôn có Kiểu (Mở khoá chỉ ở menu nổi); chụm trên ô lưới đã chọn cũng phóng ảnh trong ô — kiểm trong `e2e/m10.mjs`

### M14 — Khối bố cục và mô hình chọn — xong phần code 2026-10-17
Đặc tả: [02](../product/editor-v2/02-khai-niem-va-du-lieu.md), [06](../product/editor-v2/06-chon-va-cu-chi.md), [07](../product/editor-v2/07-khung-chon-va-thanh-cong-cu.md) mục 1–4; cách cài: [dev/editor-v2](../dev/editor-v2.md) mục 0 (D-91).
- [x] **Khối bố cục**: lưới / layout là một phần tử chứa các ô; dời, co giãn (cả kéo một chiều), xoay khối → mọi ô và ảnh trong ô đi theo, ngay trong lúc kéo; một bước hoàn tác
- [x] Dự án cũ và template: ô lưới cũ được gom thành một khối mỗi slide khi mở (không đổi ảnh xuất)
- [x] Bảng Lớp: một dòng cho mỗi khối; lên / xuống lớp, nhân bản, xoá đi cả cụm; xoá ảnh trong ô → ô trống
- [x] **Chọn cha → con**: chạm lần đầu chọn khối, chạm lần nữa vào ảnh → chọn ảnh đó; đang trong khối chạm ô khác → chọn luôn ô đó; chạm phần tử khác → chọn phần tử đó; chạm chỗ không có gì → bỏ chọn; phần tử khoá vẫn chọn được
- [x] Ô trống trong lưới / template: chạm **trúng dấu +** → mở ngay trình chọn ảnh cho ô đó; chạm chỗ khác của ô → chọn khối (Q-E1, D-90)
- [x] **Cử chỉ theo lựa chọn**: không chọn gì → kéo / chụm là cuộn / zoom canvas (kể cả khi ngón đặt lên ảnh); có chọn → kéo / chụm ở bất kỳ đâu tác động lên phần tử đó (ảnh trong ô: dời / phóng ảnh bên trong; khoá: không làm gì)
- [x] **Khung chọn mới**: 4 góc giữ tỉ lệ + 4 thanh giữa cạnh kéo một chiều (ảnh cắt lại, không méo), nút xoay **phía dưới** hít 0 / 90 / 180 / 270°
- [x] Ảnh trong ô: khung chọn bao **toàn bộ ảnh** (phần ngoài ô hiện mờ), kéo góc → phóng ảnh trong ô
- [x] **Thước đo kích thước bằng nhau**: khi co giãn tới đúng rộng / cao của phần tử khác (mọi slide) → hít đúng kích thước và hiện thước xanh trên cả hai
- [x] Thanh nổi ẩn trong lúc kéo bằng một ngón; thanh công cụ của khối: Bố cục · Xong
- [x] Kiểm tra tự động `e2e/m14.mjs`; m3, m8 cập nhật theo quy tắc mới
- [x] Sửa (2026-10-17, D-92): nút **Lớp** tách ra thành nút tròn riêng bên phải thanh công cụ đáy
- [x] Sửa (2026-10-17): thanh công cụ đáy gọn lại thành **viên thuốc nổi** — không chọn gì: chỉ icon (Ảnh · Chữ · Thành phần · Bố cục · ⋯) + nút tròn Lớp; có chọn: icon + nhãn nhỏ, trượt ngang, nút tròn ✕ bỏ chọn bên phải (thay nút Xong)
- [ ] Chủ dự án thử trên iPhone: chọn khối / ảnh trong ô, kéo khối, chụm khi không chọn gì, nút xoay, thước đo

### M15 — Canvas và slide — xong phần code 2026-10-17
Đặc tả: [05](../product/editor-v2/05-canvas-va-slide.md); cách cài: [dev/editor-v2](../dev/editor-v2.md) mục 0b (D-93).
- [x] **Zoom "thấy hết slide"** khi mở dự án (mỗi slide không nhỏ hơn ¼ chiều ngang màn hình — nhiều slide hơn thì vuốt ngang); thêm / xoá / nhân bản slide → tự thu / phóng mượt 250 ms
- [x] Chụm thu nhỏ quá mức nhỏ nhất: còn co thêm chút (có lực cản), thả tay **bật về** mức nhỏ nhất; chạm đúp vào chỗ trống → về "thấy hết"; nút % / Vừa màn hình cũng về "thấy hết"
- [x] **‖ ⋯ dưới mỗi slide** (một slide: chỉ ⋯), **+ sau slide cuối**; bỏ dải thumbnail dưới canvas
- [x] **Menu ⋯ của slide**: Thêm bên trái · Thêm bên phải · Nhân bản (kèm bản sao mọi phần tử, khối kèm ô) · Xoá slide (hỏi lại nếu slide có nội dung; ẩn khi chỉ còn 1 slide)
- [x] **Kéo ‖ đổi chỗ slide**: giữ 200 ms (chuột: kéo luôn), ‖ to lên và chỉ đi ngang, khung slide đi theo ngón tay, các slide khác nhường chỗ ngay trong lúc kéo, các nút khác ẩn; thả → phần tử đi theo slide; một bước hoàn tác
- [x] **Sheet "Slide mới"**: Trắng · 12 Bố cục · 36 Lưới; chọn → slide mới ở cuối chứa khối bố cục với các ô trống
- [x] Phần tử thuộc slide theo tâm của nó; ô của khối đi theo slide của khối
- [x] Sửa kèm: chụm hai ngón không bị chặn khi một ngón đặt lên tay nắm khung chọn hoặc lên các nút dưới slide
- [x] Kiểm tra tự động `e2e/m15.mjs` (8 tiêu chí nghiệm thu); m7, m8, m9, m10 cập nhật
- [x] Sửa (2026-10-17, D-94): **bảng Lớp có ảnh xem trước** — mỗi dòng là ảnh thu nhỏ của chính phần tử (khối kèm ô) vẽ từ canvas, trên nền ô cờ; 👁 ẩn / hiện bên trái, 🔒 và ⠿ kéo đổi thứ tự bên phải; chạm ảnh để chọn
- [x] Sửa (2026-10-17, D-94): **hỗ trợ iPad** — editor dùng hết bề rộng, cho xoay ngang (manifest `orientation: any`), trang chủ / chọn layout / xuất rộng hơn và nhiều cột hơn, các sheet căn giữa tối đa 672 px; mức zoom nhỏ nhất ¼ màn hình nhưng ≤ 120 px / slide để cả carousel vừa màn iPad
- [ ] Chủ dự án thử trên iPhone: zoom "thấy hết", bật lại khi thu nhỏ quá, menu slide, giữ ‖ kéo đổi chỗ, Slide mới

### M16 — Thêm ảnh — xong phần code 2026-10-17
Đặc tả: [09](../product/editor-v2/09-anh-va-video.md) mục 1–2, 4; cách cài: [dev/editor-v2](../dev/editor-v2.md) mục 0c (D-95).
- [x] Chạm **dấu +** của ô trống (lưới / template / khung) → sheet **"Lấp đầy khung"**: Ảnh · Video · Tệp (Tệp không lọc loại → iOS mở app Tệp, Android mở trình chọn tệp); đóng mà không chọn thì ô vẫn được chọn
- [x] Chọn **nhiều ảnh**, tối đa bằng **số ô trống của cả dự án**; chọn thừa → dùng N ảnh đầu và báo "Đã dùng N ảnh đầu cho N ô trống"
- [x] **Thứ tự điền**: ô đang chọn → ô trống khác cùng slide (đọc trái → phải, trên → dưới) → các slide từ đầu đến cuối (ví dụ G H / I J K / L: 1 ảnh → K; 3 → K I J; 6 → K I J G H L); mỗi ảnh phủ kín ô; cả lô là **một bước hoàn tác**; xong thì bỏ chọn
- [x] **Nút Ảnh** ở thanh công cụ luôn thêm **ảnh tự do** (Q-E2), không điền ô trống: tối đa 10 ảnh (thừa thì báo), bắt đầu từ góc trên trái slide đang xem, rộng ~60 % slide, mỗi ảnh sau lệch 40 px, chọn ảnh cuối
- [x] **Thay**: nút đầu tiên trên thanh công cụ ảnh (và trong ⋯) mở cùng sheet, thay một ảnh
- [x] Ô trống thuộc khối không có tay nắm riêng, không kéo / chụm riêng được (đi theo khối)
- [x] Kiểm tra tự động `e2e/m16.mjs`; m3, m5, m10, m14 cập nhật theo sheet mới
- [x] Sửa (2026-10-17): khi đang chọn một phần tử / khối thì **ẩn ‖ ⋯ dưới các slide** (nút + vẫn hiện, như IMG_3966)
- [ ] Chủ dự án thử trên iPhone / iPad: chạm + → Lấp đầy khung → chọn nhiều ảnh; nút Ảnh thêm ảnh tự do

### M17 — Thanh công cụ và các sheet — xong phần code 2026-10-17
Đặc tả: [07](../product/editor-v2/07-khung-chon-va-thanh-cong-cu.md) mục 5, [08](../product/editor-v2/08-cac-sheet-chinh-sua.md), [12](../product/editor-v2/12-sheet-menu-xuat-lop.md) mục 1; cách cài: [dev/editor-v2](../dev/editor-v2.md) mục 0d.
- [x] Khi đang chọn: ẩn ‖ ⋯ dưới các slide, nút + vẫn hiện (chủ dự án, như IMG_3966)
- [x] **Thanh công cụ theo loại** (trượt ngang, ✕ bỏ chọn): Khối — Bố cục · Điều chỉnh · Vị trí · Khoá · Nhân bản · Xoá; Ảnh — Thay · Vị trí · Cắt · Kiểu · Chỉnh · Bộ lọc · Xoá nền · Chuyển động · (Đổi chỗ) · (Mặt nạ) · Khoá · Nhân bản · Làm trống · Xoá; Video — Thay · Cắt đoạn · Âm thanh · Bộ lọc · Chỉnh · Chuyển động · Vị trí · Cắt · Kiểu …; Ô trống — Thêm ảnh · (Đổi chỗ) · Kiểu · Xoá; Chữ — Sửa · Kiểu chữ · Vị trí · Chuyển động · Khoá · Nhân bản · Xoá; Hình / sticker — Màu · Vị trí · Chuyển động · Khoá · Nhân bản · Xoá. Ảnh trong ô không có Vị trí / Khoá / Nhân bản riêng (đi theo khối)
- [x] **Sheet Vị trí**: tab Vị trí — Sắp lớp (4 nút, mờ khi vô tác dụng), Dịch ← → ↑ ↓ (1 px, giữ thì lặp nhanh dần), Căn trái / giữa / phải / trên / giữa dọc / dưới theo slide chứa phần tử, Lấp đầy Cao / Rộng / Rộng 2×, Lật ngang / dọc (khối: lật vị trí ô); tab Nâng cao — Rộng, Cao (khoá tỉ lệ), X, Y, Xoay; ✓ là một bước hoàn tác, ✕ trả lại
- [x] **Bố cục của khối**: đổi sang kiểu chia khác (36 lưới + 12 bố cục), giữ vị trí / kích thước khối; ảnh giữ theo thứ tự ô, ảnh thừa thành ảnh tự do cạnh khối kèm thông báo, ô thừa để trống
- [x] **Điều chỉnh của khối**: Khe, Lề (khối có kiểu chia), Bo góc ô, Màu nền khối
- [x] **Sheet Kiểu** của ảnh: khung, độ mờ, bo góc + **Bo từng góc** (4 góc riêng), **Bóng ›** (bật / tắt, độ đậm, góc, khoảng cách, độ nhoè, màu), **Viền ›** (độ dày, màu), hoà trộn
- [x] **Bảng màu dùng chung** ở mọi chỗ chọn màu: Tuỳ chỉnh (bánh xe màu + ô HEX), màu dùng gần đây (lưu trên máy), 40 màu mặc định (xám, rực, đậm, pastel, tông đất)
- [x] **Bottom sheet kéo được** (Lớp, Thành phần, Slide mới): mở ở 50 %, kéo tay cầm lên tới 95 %; thả dưới 20 % → đóng, 20 – 50 % → bật về 50 %, trên 50 % → bám 50 / 95 % theo vị trí và tốc độ vuốt; sheet nằm dưới canvas nên **đẩy canvas lên**, canvas tự thu cho vừa phần còn lại (cả với sheet công cụ như Kiểu, Chỉnh); trên iPad sheet rộng tối đa 672 px giữa nền canvas
- [x] Kiểm tra `e2e/m17.mjs` (tiêu chí 08 §7 + thanh công cụ + bottom sheet); m8 / m9 đổi theo quy tắc mới "sheet đẩy canvas lên" (thay F-03 / UX-08); sửa test m13b chọn nhầm ảnh theo id ngẫu nhiên
- [ ] Chủ dự án thử trên iPhone / iPad: thanh công cụ, Vị trí, Bố cục / Điều chỉnh khối, Kiểu (bo từng góc, bóng), bảng màu, kéo bottom sheet

### M18 — Giao diện, trang chủ, tạo dự án — xong phần code 2026-10-17
Đặc tả: [01](../product/editor-v2/01-giao-dien.md), [03](../product/editor-v2/03-trang-chu-va-template.md), [04](../product/editor-v2/04-tao-du-an.md); cách cài: [dev/editor-v2](../dev/editor-v2.md) mục 0e (D-98).
- [x] **Thanh điều hướng nổi** 3 tab Trang chủ / Dự án / Cài đặt + nút tròn **+** tách riêng; thoát editor → về tab Dự án
- [x] **Sheet "Dự án mới"**: thẻ 4:5 · 3:4 · 9:16 · 1:1 · 1.91:1 · Khác vẽ đúng hình, chung đường đáy, trượt ngang → chạm là vào editor với **một slide trắng**; **Lưới profile** và **Từ ảnh** mở màn tạo từng bước (loại, số slide, chọn ảnh, layout) như trước
- [x] **Khác**: 2:3, 3:2, 3:4, 4:3, 5:4, 5:6, 16:9 (ghi chú "Instagram sẽ cắt về 4:5" khi dọc hơn 4:5) + **Tuỳ chỉnh** (chiều cao 565 – 1920 px, báo lỗi ngoài khoảng, Huỷ quay lại)
- [x] Tỉ lệ slide tổng quát: `"w:h"` hoặc `"1080x<cao>"` (`slideSize()`), dự án cũ giữ nguyên
- [x] **Trang chủ**: thanh trên nổi kính mờ (♡ · Dành cho bạn / Khám phá · 🔍); **3 banner** vuốt ngang, chấm chỉ trang, tự chuyển 6 s, "Khám phá ngay" mở nhóm; thẻ **Tiếp tục** (dự án gần nhất) + **Tạo mới**; **các nhóm** có mô tả, trượt ngang, › mở lưới cả nhóm; **Khám phá thêm** lưới so le 2 cột; nhóm có template đã thích lên trước
- [x] **Thẻ template**: ảnh bìa (slide đầu) có **ảnh mẫu tự vẽ** (SVG, không tải mạng), ♡ thích không mở template, nhãn số ảnh / số slide, chấm cho carousel
- [x] **Màn chi tiết template** trượt từ phải: vuốt xem từng slide có chấm, nhãn tỉ lệ / số ảnh / số slide, Template tương tự, thanh đáy "Dùng template" + ♡
- [x] Tab **Khám phá** (chip lọc nhóm + lưới so le), **Đã thích**, **Tìm kiếm** (tên, nhóm, mô tả — Anh / Việt); thêm nhóm **Dịp đặc biệt** (Sinh nhật, Kỷ niệm)
- [x] **Editor**: nút nổi kính mờ ‹ · (↶ ↷ ⋯) · Xuất (nút tròn); ⋯ là menu dự án (Nền, Slide, Nhạc, Vẽ); thanh công cụ dưới chỉ còn Ảnh · Chữ · Thành phần · Bố cục + Lớp
- [x] Kiểm tra tự động `e2e/m18.mjs`; các bộ cũ đổi sang luồng mới (`newProject()` = + → Từ ảnh, tab Dự án sau khi tải lại)
- [ ] Chủ dự án thử trên iPhone / iPad: trang chủ mới, tạo dự án theo tỉ lệ / tuỳ chỉnh, màn chi tiết template, editor mới

### M19 — Chữ, chỉnh ảnh, thư viện, xuất — xong phần code 2026-10-17
Đặc tả: [10](../product/editor-v2/10-chu.md), [09](../product/editor-v2/09-anh-va-video.md) mục 6–10, [11](../product/editor-v2/11-thu-vien.md), [12](../product/editor-v2/12-sheet-menu-xuat-lop.md) mục 2–5; cách cài: [dev/editor-v2](../dev/editor-v2.md) mục 0f.
- [x] **Chữ gõ trực tiếp trên canvas**: nút Chữ đặt "Thêm chữ" ở góc trên trái slide đang xem, bàn phím mở ngay, chữ mẫu được chọn sẵn để gõ đè; hộp gõ nằm đúng chỗ, đúng phông / cỡ / màu / góc xoay của chữ
- [x] **Thanh gõ**: A| Sửa · Aa Định dạng · ≡ Căn lề · ✕; Aa / ≡ cất bàn phím và mở sheet ở chỗ bàn phím
- [x] **Định dạng**: B · I · U · S, Phông (theo nhóm, có độ đậm), Màu chữ, Cỡ, Giãn cách (chữ, dòng), Viền chữ, Nền chữ + Bóng; **Căn lề** trái / giữa / phải / đều hai bên
- [x] Kết thúc gõ bằng ✕ hoặc chạm ra ngoài; chữ vẫn được chọn; **cả lần gõ + định dạng là một bước hoàn tác**; xoá hết chữ thì hộp chữ biến mất
- [x] Thanh công cụ chữ: Sửa · Định dạng · Căn lề · Vị trí · **Độ mờ** · Chuyển động · Khoá · Nhân bản · Xoá
- [x] Kiểm tra `e2e/m19.mjs`; m5, m8, m11 chuyển sang sheet Định dạng
- [x] **Màn Chỉnh ảnh toàn màn hình** (nền đen): ✕ huỷ, ↶ ↷ riêng, giữ để so sánh, ✓ = một bước; hàng công cụ trượt ngang Bộ lọc · Phơi sáng · Độ sáng · Tương phản · Vùng sáng · Vùng tối · Nhiệt độ · Sắc thái · Độ rực · Bão hoà · **Làm mờ** · **Làm nét** (mới, trong shader) · Hạt · Sắc độ · Tối viền · Bạc màu · Đặt lại; **chấm đỏ** trên công cụ đã chỉnh; Bộ lọc có tab **Tất cả** + 6 nhóm, cường độ, áp cho mọi ảnh
- [x] **Cắt**: thêm tỉ lệ 2:3, 4:3, 9:16 (có hình chữ nhật đúng tỉ lệ trên nút), xoay ±45°
- [x] **Công cụ nền**: sheet Xoá nền / **Khôi phục nền** · **Cắt rời** (vẽ một vòng, nét đứt vàng, chấm đầu / cuối, tự khép, phần ngoài phủ đỏ, ✓ → PNG giữ phần trong) · **Tẩy** (tẩy / khôi phục, cỡ cọ, ↶ ↷); ảnh gốc được giữ (`originalAssetId`)
- [x] **Làm trống** ở thanh công cụ ảnh → ô trống cùng chỗ
- [x] Sửa: mở lại dự án không còn làm mất bo từng góc / bóng tuỳ chỉnh (M17)
- [x] Kiểm tra `e2e/m19b.mjs`
- [x] **Thanh công cụ mặc định** Ảnh · Chữ · Sticker · Hình · **+**; nút **+** mở **"Lớp mới"** với 11 mục: Ảnh · Video · Tệp · Chữ · Sticker · Khung · Lưới · Vẽ · Widget · Hình · Brand Kit; "Bố cục" cả dự án chuyển vào menu ⋯ của dự án
- [x] **Thư viện chia nhóm** (bottom sheet kéo được): mỗi nhóm hiện 7 mục + ô **"+N"** mở màn đủ nhóm có ‹ quay lại; chạm mục → thêm vào giữa slide đang xem, chọn luôn, đóng sheet
- [x] **Hình**: 9 nhóm (Cơ bản, Đường, Sao, Tim, Mũi tên, Chú ý, Băng rôn, Hoa, Trừu tượng) ~40 hình vẽ bằng path, đổi màu được
- [x] **Sticker**: Dùng gần đây · Của tôi · Nổi bật · Ánh sáng & chất liệu · Emoji; ô tìm kiếm nổi ở đáy
- [x] **Khung**: Lấy liền (polaroid trắng / đen, viền trắng / đen, triển lãm) · Phim · Giấy cắt hình (cửa sổ tròn, tim, sao, lục giác, mềm, vòm, bo góc) — đều là ô ảnh trống có dấu +
- [x] **Lưới**: thêm khối bố cục (80 % slide, căn giữa) vào slide đang xem; **Widget**: Nhãn, Tin nhắn, Địa điểm, Tô sáng, Đồng hồ lật (là chữ, sửa được)
- [x] **Brand Kit** lưu trên máy, dùng cho mọi dự án: logo, tài sản, màu thương hiệu (hiện đầu bảng màu chung); **Lưu sticker** (ảnh đang chọn → "Của tôi")
- [ ] Còn lại của thư viện: khung có lớp trang trí đè lên ảnh (băng dính, giấy xé, máy ảnh, kỹ thuật số), nhóm Mực / tem dấu, Phông thương hiệu
- [x] Kiểm tra `e2e/m19c.mjs`
- [x] **Menu ⋯ của dự án**: Nền · **Tỉ lệ** (đổi tỉ lệ cả dự án, phần tử giữ chỗ theo slide) · **Hít: bật / tắt** (tắt đường gióng, thước đo, hít góc; nhớ trên máy) · **Xem trước** · Slide · Nhạc · Vẽ · Bố cục
- [x] **Nền**: Màu · **Chuyển màu tuỳ chỉnh** (thanh có điểm dừng kéo được, chạm thanh để thêm, vị trí %, bỏ điểm, màu theo bảng chung, thẳng / **toả tròn**, góc, lưu chuyển màu; Đã lưu + Mặc định) · **Chất liệu** (20 chất liệu vẽ bằng code: giấy trắng / ngà / hồng / xanh, kraft, bìa cứng, vải lanh, canvas, đá cẩm thạch, gỗ, bê tông, đá mài, giấy ô ly / chấm / kẻ dòng, màu nước, giấy đen, nền tối có vân, cát) · Ảnh mờ
- [x] **Xem trước** toàn màn hình (vuốt ngang qua các slide như bài đăng)
- [x] **Xuất**: chọn độ phân giải **1× (1080 px) / 2× (2160 px)**
- [x] Kiểm tra `e2e/m19d.mjs`
- [ ] Chủ dự án thử trên iPhone / iPad: gõ chữ trên canvas, màn Chỉnh ảnh, Cắt rời / Tẩy, các thư viện, Brand Kit, Nền chuyển màu / chất liệu, Xem trước, xuất 2×

### Sửa theo góp ý của chủ dự án (2026-10-17, lần 2) — D-101, D-102
- [x] **Khoá = khoá mọi thứ** (thay D-85): phần tử khoá không kéo, không co giãn / xoay, không dời / phóng ảnh bên trong, không có tay nắm; chỉ còn chạm **dấu +** của ô trống để thêm ảnh / video; khoá khối thì khoá luôn các ô
- [x] Chế độ sáng / tối của app báo cho trình duyệt (`color-scheme`, màu thanh trạng thái) để bàn phím, thanh trạng thái, nền khi kéo quá theo đúng lựa chọn trong app chứ không theo máy
- [x] Xem trước và ảnh xuất **không có dấu +** của ô trống
- [x] Chữ mới: **màu đen, không nền**, căn trái
- [x] Co giãn chữ **cập nhật ngay khi kéo** (không méo rồi mới bật lại); chữ có thêm tay nắm trên / dưới (phóng cỡ chữ)
- [x] **Hít khi co giãn**: mép đang kéo dính vào mép / tâm slide và mép phần tử khác, có đường gióng hồng
- [x] Nút xoay có **icon ⟳**; hít góc xoay giảm **6° → 3°**
- [x] Kéo bottom sheet mượt hơn: trong lúc kéo sheet đè lên canvas, thả tay mới đẩy canvas một lần
- [x] Thanh phát chỉ hiện khi **đang chọn video / phần tử có chuyển động** (hoặc đang phát, hoặc dự án có nhạc nền và không chọn gì)
- [x] Đường phân cách slide **hai màu** (đậm + trắng xen kẽ), thấy được trên nền trắng
- [x] Menu ⋯ của dự án là **popover thả xuống** dưới nút (kính mờ), **Hít ›** mở tại chỗ Bật / Tắt có ✓
- [x] Thư viện **Lưới trải hết**, không cần "+N"
- [x] Thẻ template nhiều slide ở trang chủ **vuốt ngang ngay trên thẻ** để xem các slide, chấm chỉ slide đổi theo

### Sửa theo góp ý (2026-10-17, lần 3) — D-103
- [x] Nút xoay dùng icon **Lucide rotate-cw** (mũi tên đúng chiều)
- [x] Tay nắm co giãn **nhỏ lại** (góc 14 px cảm ứng / 10 px chuột, cạnh là thanh ngắn); vùng chạm vẫn ~30 px nhưng **lan ra ngoài khung** để phần tử nhỏ vẫn chạm vào được bên trong
- [x] Cạnh quá ngắn trên màn hình (thu nhỏ slide, phần tử nhỏ) thì **ẩn tay nắm cạnh**, giữ tay nắm góc
- [x] **Mỗi vùng cuộn chỉ một chiều**: dải công cụ chỉ cuộn ngang, sheet / panel chỉ cuộn dọc (sheet Nền không còn cuộn ngang; thanh công cụ chữ không còn cuộn dọc)

### M20 — Mở rộng thư viện (D-104, D-106 … D-110) — đang làm
Kế hoạch: [m20-plan.md](m20-plan.md) · Định dạng: [asset-catalog.md](../architecture/asset-catalog.md) · Việc của Gemini: [gemini-tasks.md](../ai/gemini-tasks.md)
- [x] Chủ dự án trả lời Q-L1…Q-L13, Q-E9 (2026-10-17)
- [x] **C1** Định dạng danh mục (`src/lib/catalog/`), `scripts/assets/validate.mjs`, `build-catalog.mjs`, thư mục `assets/` + `public/packs/`
- [x] **C2** App đọc danh mục: tải gói khi cần; sticker / lớp phủ từ gói trong sheet Sticker, chất liệu từ gói trong sheet Nền (lát lặp / phủ kín); mục từ gói được tải về **thành ảnh của dự án**; "Dùng gần đây"; tìm không cần dấu (e2e m20b) — khung từ gói làm cùng C4
- [x] **C3** Nút **Loại / Bộ** trong sheet Sticker (nhớ trên máy); màn **Bộ sưu tập** trong "Lớp mới" (chọn bộ → Sticker, Lớp phủ, Nền của bộ); bộ theo mùa lên đầu; tìm kiếm EN / VI không cần dấu
- [x] **C4** Khung từ gói = khối bố cục có **ảnh khung đè lên trên** các ô; mỗi cửa sổ một ô trống (cửa sổ bầu dục → ô tròn); giữ tỉ lệ ảnh khung (chỉ kéo góc); không chia lại ô; có trong sheet Khung và màn Bộ sưu tập (e2e m20d)
- [x] **C5** Màn chọn phông mới: mỗi phông hiện **dòng đầu của chữ đang chọn** (không có thì một câu hay ngẫu nhiên, phông Nhật / Hàn / Trung dùng câu tiếng đó), tên phông nhỏ ở dưới; lọc **kiểu** và **ngôn ngữ**, ô tìm phông; phông từ danh mục khai báo bằng @font-face, chỉ tải khi hiện / khi dùng; dùng được trên canvas và khi xuất (e2e m20c). Danh sách câu đầy đủ chờ G6
- [x] **C6a** Màn **Cảm ơn** (Cài đặt → Cảm ơn): nguồn tài sản từ `credits` của danh mục, phông, icon / emoji / mô hình, thư viện code kèm giấy phép
- [x] **C6b** Màn **Giới thiệu** (Cài đặt → Giới thiệu): sonth87, avatar GitHub (lưu sẵn trong app, dùng được offline), link github.com/sonth87, vài dòng về app, phiên bản, lối sang Cảm ơn
- [x] **C7** Bộ sinh khung tự nhiên (D-107), `scripts/frames/`: **ảnh xé** (ảnh theo đúng mép xé — ô cắt theo đa giác `maskPoints`), **giấy xé có lỗ**, **dải phim** (tỉ lệ 35 mm, lỗ phim lệch nhẹ, chữ in mép, vệt sáng), **ảnh lấy liền** (viền dưới dày như thật, ố nhẹ, băng dính dán lệch); xé = hình lớn trước (trôi, nghiêng, "giật"), mỗi cạnh một kiểu, lõi giấy trắng rộng hẹp, xơ mềm, viền mờ, bóng không đều
  - [x] Đợt 1: **134 khung** — 30 ảnh xé, 24 **ảnh xé ghép** 2–4 mảnh (kiểu template IG-4036: mép mảnh trên đè lên ảnh mảnh dưới, bóng đổ xuống), 24 **ảnh xé trên giấy lót**, 24 phim, 32 ảnh lấy liền — gói `gen-*`, CC0 (e2e m20e)
  - [x] Chủ dự án (2026-10-18): **xé là ảnh bị xé ở viền ngoài**, không phải khung giấy thủng lỗ ở giữa → bỏ gói "giấy xé có lỗ"
  - [x] **Sticker sinh tự động**: 40 băng dính washi (10 họa tiết, mép xé răng cưa, trong mờ), 24 giấy note (góc quăn, dải keo), 30 mẩu giấy vở / ô ly xé (lỗ đục, lề đỏ)
  - [x] **Nét vẽ tay** (doodle) bằng code, đổi màu được: 40 mẫu — mũi tên (thẳng, cong, vòng, zigzag, xoắn, hai đầu…), gạch chân, khoanh tròn, khung, sao, lấp lánh, tim, mặt cười, vương miện, mặt trời, mây, hoa, tia chớp, dấu tích / nhân, ngoặc kép, nốt nhạc, bong bóng thoại…
  - [ ] Chủ dự án duyệt: `node scripts/frames/generate.mjs explore <tornPhoto|tornPaper|film|polaroid> 40` → mở `assets/_review/frames/<kiểu>/index.html`; bỏ / thêm seed trong `scripts/frames/picks.json` rồi `generate.mjs build`
  - [x] Đợt 2: **84 khung** — 24 tem (răng cưa, chữ in, có lúc đóng dấu bưu điện), 24 khung tranh (gỗ sồi / óc chó / trắng / đen / mạ vàng / gỗ mộc, có hoặc không viền giấy), 20 trang album có góc dán ảnh (trang hơi nghiêng, ô ảnh nghiêng theo), 16 phong bì có ảnh thò ra
  - [x] Chủ dự án (2026-10-18): ảnh xé **không vuông vức** → gói "Ảnh xé" làm lại bằng bộ sinh **mảnh ảnh xé**: tứ giác méo, hình thang, xiên, 5–8 cạnh, tròn, mất góc theo đường chéo, dải dài; xé **1 cạnh tới mọi cạnh**; mép có chỗ **lẹm** vào, lõi giấy chỗ bong rộng chỗ gần như không có — 40 mảnh
  - Tổng sinh tự động: **228 khung + 94 sticker + 40 nét vẽ tay**
- [ ] **C8** Ghép từng đợt của Gemini, e2e, merge, deploy
- [x] **G6** Câu xem trước phông (125 VI, 125 EN, 35 JA / KO / ZH — đã dùng trong màn chọn phông), chữ mẫu 27 widget (Gemini, duyệt 2026-10-18)
- [x] **G1** Script xử lý ảnh `process.mjs` + trang duyệt `review.mjs` (Gemini, duyệt 2026-10-18)
- [x] **G5** **195 phông** trong 11 gói (viết tay, thư pháp, Nhật, Hàn, Trung, kỳ ảo, vui nhộn, lễ hội, retro / pixel, cọ…) — 127 phông có dấu tiếng Việt; phông không có dấu tiếng Việt được ghi chú trong màn chọn phông (Gemini, duyệt 2026-10-18)
- [x] **G2** sticker — 141 mục sạch / 212 sau khi Claude lọc (tem, nhãn, dấu sáp, hoa hồng cổ, chim, bướm, bản đồ / la bàn, ukiyo-e, Đông Hồ, doodle người)
- [x] **G3** 42 chất liệu nền (giấy, vải, gỗ, đá, thiên nhiên…) + 4 lớp phủ — lớp phủ còn thiếu, làm lại đợt sau
- [x] **G4** 26 khung (tranh mạ vàng, gỗ, bạc, bìa ảnh, viền hoa văn sách cổ, thiệp) + 32 mép giấy xé thật
- [x] **G7** Nghiên cứu M21: [2026-10-18-m21-nghien-cuu.md](../discussions/2026-10-18-m21-nghien-cuu.md) + 120 filter (`assets/research/m21/filters.json`)
- [x] Soát lại G1, G5, G6 (2026-10-18): 195 phông tự vẽ đủ chữ của ngôn ngữ khai báo (dò tự động từng ký tự có dấu); không cần sửa
- [ ] **G8** Lớp phủ làm lại (~30) (Gemini)
- [ ] **G9** Sticker lễ hội & Việt Nam (~80) (Gemini)
- [ ] Đủ điều kiện xong ở [m20-plan.md](m20-plan.md) (≥ 1.000 mục…)

### M21 — Công cụ sáng tạo (D-105)
- [ ] Bàn chi tiết: nhóm filter, danh sách hiệu ứng tĩnh, bút vẽ / viết tay

### M23 — Liquid glass (D-109)
- [ ] Bàn chi tiết khi tới (kính trên Safari / iPhone)

### M22 — Xoá vật thể (D-104, D-105)
- [ ] Đặc tả: [editor-v2/09](../product/editor-v2/09-anh-va-video.md) mục 3

### Cắt ảnh làm lại (D-111, 2026-10-18)
- [x] Đợt 1 (e2e crop.mjs): cắt ngay trên canvas, phủ tối phần còn lại, phóng tới phần tử; khung nhìn đổi kích thước (không di chuyển); ảnh có tay nắm phóng / thu, kéo bất kỳ đâu = dời ảnh, chụm = phóng; ảnh luôn phủ kín khung; thanh Cắt (Xoay, tỉ lệ, xoay 90°, lật, đặt lại); tay nắm khung trùng tay nắm ảnh: kéo ra ngoài = phóng ảnh, kéo vào = thu khung
- [x] Đợt 2: xoay 3D **Dọc / Ngang** (±25°, phối cảnh quanh tâm khung) — vẽ qua phép chiếu (homography) bằng WebGL ở cả canvas lẫn ảnh xuất; ảnh tự phóng để luôn phủ kín khung; kéo / phóng tính trên mặt phẳng ảnh đã nghiêng (e2e crop.mjs)

### Phóng / thu mượt (2026-10-18)
- [x] Chụm 2 ngón: phóng quanh điểm giữa hai ngón (giữ cố định điểm neo suốt lần chụm, ngón tay kéo được trong lúc chụm); trục nào canvas đang vừa màn hình thì phóng quanh tâm canvas — không chạy tới chạy lui
- [x] Vị trí cuộn và vị trí canvas áp **cùng một khung hình** (layout effect), không trễ một nhịp → các thành phần không dịch trái / phải theo nhịp phóng; mỗi khung hình chỉ cập nhật một lần dù sự kiện chạm đến dồn dập (e2e zoom-smooth.mjs)
- [ ] Chủ dự án thử lại trên điện thoại
