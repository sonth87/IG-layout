# Câu hỏi còn mở

Khi có câu trả lời: chuyển xuống mục "Đã trả lời", ghi ngày và cập nhật tài liệu liên quan.

## Chưa trả lời

### Người dùng & nền tảng
- **Q-03.** Người dùng chính là ai? (Người dùng phổ thông, người chụp ảnh bằng máy ảnh, người làm nội dung…)

### Phạm vi tính năng
- **Q-08.** Template layout: tự thiết kế, hay để người dùng tự tạo và lưu template?

### Chữ cắt báo (2026-10-28 — [2026-10-28-template-anh-that.md](../discussions/2026-10-28-template-anh-that.md), đợt 6)
- **Q-T1.** ~~Có làm "Chữ cắt báo" không?~~ Có (chủ dự án, 2026-10-28): tự chọn kiểu, rất nhiều kiểu. Còn chờ: duyệt thiết kế D-141 — nhất là chỉnh riêng từng chữ chỉ ở mức "chạm một chữ để xáo riêng" có đủ không.

### Filter v2 (2026-10-20 — [2026-10-20-filter-v2.md](../discussions/2026-10-20-filter-v2.md))
- **Q-F5.** Chủ dự án gửi 5–8 ảnh mẫu chỉnh bằng VSCO (thêm thẳng vào trang thử `/labs/filters`, ô "Ảnh đối chiếu") — đã đồng ý, chờ ảnh.
- **Q-F6.** "Áp dụng cho tất cả ảnh" có áp cả Film FX / máy ảnh không? (Đã làm theo hướng có — D-133 đề xuất.)

### Kỹ thuật
- **Q-13.** Có cần analytics (đếm lượt dùng) không? Nếu có, loại nào tôn trọng quyền riêng tư?

## Đã trả lời

| ID | Câu hỏi | Trả lời | Ngày |
|---|---|---|---|
| — | Có làm bước đăng lên Instagram không? | Không. User tự tải về và tự đăng | 2026-10-14 |
| — | Có cần chiến lược cạnh tranh / kiếm tiền? | Không. Miễn phí cho mọi người | 2026-10-14 |
| — | Công nghệ? | Next.js + PWA | 2026-10-14 |
| Q-F1 | Cường độ mặc định 100, filter đen trắng luôn xám hoàn toàn? | Đồng ý (D-131) | 2026-10-20 |
| Q-F2 | Filter và Film FX tách hay gộp? | Tách như VSCO + thêm nhóm "Máy ảnh retro" gộp sẵn (D-132) | 2026-10-20 |
| Q-F4 | Đợt 1 làm họ nào? | Film, Analog, Mood, Bright / Portrait, B&W ≈ 40 filter (D-132) | 2026-10-20 |
| Q-F3 | Tự dựng công thức màu hay dùng LUT mở? | Phải tham khảo, đánh giá từ nhiều nguồn, không chỉ tự nghĩ ra (D-131) | 2026-10-20 |
| Q-01 | Ưu tiên mobile hay desktop? | Mobile-first | 2026-10-14 |
| Q-04 | Có làm Story không? | Chỉ làm ảnh đăng bài; Story chưa định hình, để sau | 2026-10-14 |
| Q-05 | Mức độ chỉnh ảnh? | Phạm vi rộng: crop, xoay, layout, viền, chỉnh màu, hiệu ứng, filter có sẵn + tùy chỉnh, nhiều loại phần tử biến đổi được | 2026-10-14 |
| Q-14 | Filter áp cho từng ảnh hay cả project? | Theo từng ảnh; có ô tick "áp dụng cho tất cả" | 2026-10-14 |
| Q-17 | Có làm Story không? | Có. User chọn Post hoặc Story khi tạo project (thay câu trả lời Q-04) | 2026-10-14 |
| — | Bộ filter có sẵn bao nhiêu? | Làm trước 5 filter để thử nghiệm, bổ sung sau | 2026-10-14 |
| Q-18 | "Áp dụng cho tất cả" áp gì? | Chỉ filter; có xác nhận trước khi áp | 2026-10-14 |
| Q-19 | Giữ lịch sử sau khi đóng app? | Nên có nếu làm được, không bắt buộc | 2026-10-14 |
| Q-20 | Giới hạn số bước lịch sử? | Không giới hạn | 2026-10-14 |
| Q-21 | Danh sách lịch sử để nhảy bước? | Không cần, chỉ Back / Next | 2026-10-14 |
| Q-22 | Project chứa cả Post và Story? | Không, mỗi project một loại | 2026-10-14 |
| Q-16 | Nhóm và tên filter? | Đồng ý theo user/filters.md; 5 filter thử nghiệm: Classic, Kyoto, Retro 70, Clean, Cyberpunk | 2026-10-14 |
| Q-23 | Tên filter tiếng Anh hay Việt? | Tiếng Anh | 2026-10-14 |
| Q-25 | Phương án lưu trữ? | IndexedDB, không dùng SQLite | 2026-10-14 |
| Q-24 | Một hay nhiều project? | Nhiều project, có màn hình "Project của tôi" | 2026-10-14 |
| Q-26 | Thu nhỏ ảnh khi nhập? | Có, tự động (cạnh dài ~4000px) | 2026-10-14 |
| Q-27 | Xuất / nhập file project? | Không làm trong giai đoạn này | 2026-10-14 |
| Q-02 | Ngôn ngữ giao diện? | Mặc định tiếng Anh, chọn được tiếng Việt | 2026-10-14 |
| Q-06 | Làm puzzle grid? | Có | 2026-10-14 |
| Q-28 | Quy tắc thu nhỏ ảnh? | Đồng ý: thường ~4000px cạnh dài; panorama ~2400px cạnh ngắn | 2026-10-14 |
| Q-29 | Grid là loại project riêng? | Có: Post / Story / Grid | 2026-10-14 |
| Q-09 | Nguồn sticker? | Thư viện riêng, tải về từ nguồn miễn phí có giấy phép | 2026-10-14 |
| Q-10 | Font chữ? | Google Fonts (có tiếng Việt), tự host | 2026-10-14 |
| Q-31 | Tùy chọn Grid? | Đồng ý cả hai: bù khe hở; mỗi ô là carousel (Sau) | 2026-10-14 |
| Q-15 | Danh sách MVP chỉnh ảnh hợp lý? | Đồng ý toàn bộ theo plan | 2026-10-14 |
| Q-30 | Danh sách layout hợp lý? | Đồng ý toàn bộ theo plan | 2026-10-14 |
| Q-11, Q-12 | Chốt 100% client, canvas nhiều slide? | Có — đã làm theo hướng này từ prototype, chủ dự án đồng ý tiếp tục theo plan | 2026-10-14 |
