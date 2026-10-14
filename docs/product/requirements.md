# Yêu cầu

Trạng thái: `Đề xuất` | `Đã chốt` | `Bỏ`. Chi tiết từng tính năng xem [user/features.md](../user/features.md).

## Yêu cầu chức năng (Functional)

| ID | Yêu cầu | Trạng thái |
|---|---|---|
| FR-01 | Người dùng chọn/kéo thả ảnh từ máy vào ứng dụng | Đã chốt |
| FR-02 | Chỉnh sửa ảnh cơ bản: crop, xoay, lật | Đã chốt |
| FR-03 | Cắt một ảnh lớn thành nhiều slide carousel | Đã chốt |
| FR-04 | Tạo layout nhiều ảnh (collage, chia ô) | Đã chốt |
| FR-05 | Đặt ảnh chồng lên nhau, xoay, đổi thứ tự lớp | Đã chốt |
| FR-06 | Thêm text | Đã chốt |
| FR-07 | Thêm viền / khung / nền | Đã chốt |
| FR-08 | Chỉnh màu, ánh sáng, hiệu ứng; filter có sẵn và tùy chỉnh | Đã chốt |
| FR-09 | Xem trước kết quả mô phỏng Instagram (vuốt carousel, lưới profile) | Đề xuất |
| FR-10 | Tải ảnh về máy (từng ảnh, ZIP, hoặc lưu vào thư viện ảnh trên mobile) | Đã chốt |
| FR-11 | Lưu nhiều project trên máy (kèm ảnh + lịch sử); màn hình "Project của tôi" | Đã chốt |
| FR-12 | Cắt ảnh thành lưới profile (puzzle grid) | Đã chốt |
| FR-13 | Thêm phần tử: text, icon, hình khối, ảnh khác, khung, sticker, material | Đã chốt |
| FR-14 | Mọi phần tử đều di chuyển, scale, xoay, lật, đổi lớp được | Đã chốt |
| FR-15 | Chọn loại project: Post (feed / carousel) hoặc Story (9:16) | Đã chốt |
| FR-16 | Lịch sử thay đổi undo / redo; chỉ ghi khi user xác nhận "Áp dụng", không ghi từng bước kéo slider | Đã chốt |
| FR-17 | Filter / chỉnh màu theo từng ảnh; tùy chọn "áp dụng cho tất cả" chỉ áp filter, có xác nhận | Đã chốt |
| FR-18 | Filter có tên, chia theo nhóm phong cách | Đã chốt |
| FR-19 | Lịch sử không giới hạn số bước; chỉ Back / Next, không có danh sách lịch sử | Đã chốt |
| FR-20 | Mỗi project chỉ một loại: Post, Story hoặc Grid | Đã chốt |
| FR-21 | Tự động thu nhỏ ảnh khi nhập (thường: cạnh dài ~4000px; panorama: cạnh ngắn ~2400px) | Đã chốt |
| FR-23 | Thư viện template layout định nghĩa bằng dữ liệu, chia nhóm, mở rộng dần | Đã chốt |
| FR-22 | Xuất / nhập file project | Bỏ (giai đoạn này) |

## Yêu cầu phi chức năng (Non-functional)

| ID | Yêu cầu | Trạng thái |
|---|---|---|
| NFR-01 | Miễn phí cho mọi người | Đã chốt |
| NFR-02 | Next.js + PWA, cài được như app | Đã chốt |
| NFR-03 | Không làm bước đăng Instagram | Đã chốt |
| NFR-04 | Xử lý ảnh hoàn toàn trên trình duyệt, ảnh không rời khỏi máy người dùng | Đề xuất |
| NFR-05 | Không bắt buộc đăng ký / đăng nhập | Đề xuất |
| NFR-06 | Ảnh xuất ra đúng thông số Instagram (xem [instagram-specs](../architecture/instagram-specs.md)) | Đã chốt |
| NFR-07 | Dùng được offline sau lần tải đầu (PWA) | Đề xuất |
| NFR-08 | Chạy mượt trên điện thoại tầm trung (kể cả iOS Safari) | Đã chốt |
| NFR-11 | Mobile-first: thiết kế cho cảm ứng trên điện thoại trước, desktop sau | Đã chốt |
| NFR-12 | ~~Chỉ phục vụ ảnh đăng bài (feed / carousel)~~ — thay bởi FR-15 (có cả Story) | Bỏ |
| NFR-13 | Chỉnh sửa không phá hủy: không bao giờ ghi đè ảnh gốc | Đã chốt |
| NFR-14 | Theme sáng / tối, mặc định theo hệ thống | Đã chốt |
| NFR-09 | Hỗ trợ ảnh HEIC từ iPhone | Đề xuất |
| NFR-10 | Ngôn ngữ giao diện: mặc định tiếng Anh, chọn được tiếng Việt | Đã chốt |
