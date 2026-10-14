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
- [ ] Duyệt phạm vi MVP (Q-15, Q-30)
- [ ] Chốt kiến trúc D-06, D-07 (Q-11, Q-12)
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
- [ ] Deploy thử (HTTPS) — chọn nơi host (Vercel / Cloudflare Pages / GitHub Pages)
- [ ] Test trên iPhone (Safari): chạm, kéo, xoay, cuộn dải slide, Save images, nhập 20 ảnh
- [ ] Test trên Android (Chrome): như trên
- [ ] Chốt D-38: giữ Konva hay đổi Fabric

## Giai đoạn 2 — MVP

### M1 — Nền tảng
- [ ] Lưu project vào IndexedDB (doc, ảnh, lịch sử); tự lưu sau mỗi bước
- [ ] Màn "Project của tôi": danh sách, ảnh thu nhỏ, dung lượng, đổi tên, xóa
- [ ] Xin quyền lưu lâu dài (`navigator.storage.persist`), banner nhắc cài app
- [ ] Service worker offline (Serwist)
- [ ] Settings: theme (System / Light / Dark), ngôn ngữ, dung lượng, xóa tất cả
- [ ] Khung đa ngôn ngữ EN / VI; chọn font giao diện có tiếng Việt
- [ ] Deploy tự động khi push lên `main`

### M2 — Editor cốt lõi
- [ ] Mô hình phần tử chung (ảnh / text / hình), thanh công cụ theo ngữ cảnh
- [ ] Cử chỉ pinch / xoay 2 ngón
- [ ] Đường gióng & hít vào tâm, mép, ranh giới slide
- [ ] Crop & nắn thẳng; mask theo hình
- [ ] Viền ảnh; nền (màu, gradient, blur fill)
- [ ] Quản lý slide: thêm / xóa / đổi thứ tự

### M3 — Layout & template
- [ ] Định dạng template JSON + bộ nạp
- [ ] Bộ template đầu tiên theo [layouts.md](../user/layouts.md)
- [ ] Màn chọn layout: gợi ý theo số ảnh, tự điền, đổi chỗ ảnh

### M4 — Màu & filter
- [ ] Pipeline WebGL cho preview và export
- [ ] Công cụ Adjust với ✓ / ✕, nhớ giá trị, giữ để so sánh
- [ ] 5 filter thử nghiệm + cường độ + áp cho tất cả (có xác nhận)

### M5 — Text & Elements
- [ ] Công cụ text + bộ font tiếng Việt tự host
- [ ] Hình khối, icon, khung cơ bản

### M6 — Story & Grid
- [ ] Project Story: 9:16, vùng an toàn, nhiều khung
- [ ] Project Grid: 3 × N, thứ tự đăng, bù khe hở, tên file theo thứ tự đăng

### M7 — Xuất & hoàn thiện
- [ ] Xem trước kiểu Instagram (carousel / profile)
- [ ] Hiệu năng: 20 ảnh, ảnh lớn, máy tầm trung
- [ ] Khả năng truy cập, hướng dẫn sử dụng, trang Credits
- [ ] Checklist phát hành v1.0 ([plan.md](plan.md))
