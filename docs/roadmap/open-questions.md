# Câu hỏi còn mở

Khi có câu trả lời: chuyển xuống mục "Đã trả lời", ghi ngày và cập nhật tài liệu liên quan.

## Chưa trả lời

### Người dùng & nền tảng
- **Q-03.** Người dùng chính là ai? (Người dùng phổ thông, người chụp ảnh bằng máy ảnh, người làm nội dung…)

### Phạm vi tính năng
- **Q-08.** Template layout: tự thiết kế, hay để người dùng tự tạo và lưu template?

### Chữ cắt báo (2026-10-28 — [2026-10-28-template-anh-that.md](../discussions/2026-10-28-template-anh-that.md), đợt 6)
- **Q-T1.** ~~Có làm "Chữ cắt báo" không?~~ Có (chủ dự án, 2026-10-28): tự chọn kiểu, rất nhiều kiểu. Đã chốt D-141 (chạm để xáo riêng, thêm biên độ / độ cong) — đã làm.

### Filter v2 (2026-10-20 — [2026-10-20-filter-v2.md](../discussions/2026-10-20-filter-v2.md))
- **Q-F5.** Chủ dự án gửi 5–8 ảnh mẫu chỉnh bằng VSCO (thêm thẳng vào trang thử `/labs/filters`, ô "Ảnh đối chiếu") — đã đồng ý, chờ ảnh.
- **Q-F6.** "Áp dụng cho tất cả ảnh" có áp cả Film FX / máy ảnh không? (Đã làm theo hướng có — D-133 đề xuất.)

### Photobooth (2026-10-29 — [2026-10-29-photobooth.md](../discussions/2026-10-29-photobooth.md))
- **Q-P1.** Photobooth là một cách nhập ảnh rồi vào editor (đề xuất), hay một chế độ riêng chỉ ra strip?
- **Q-P2.** Bản đầu xuất những dạng nào? (Đề xuất: strip gốc 1:3, Post 4:5 hai strip, Story 9:16, ảnh lẻ; GIF / video để sau.)
- **Q-P3.** Có chụp dư rồi chọn (vd. chụp 8 chọn 4) như tiệm Hàn không?
- **Q-P4.** Theme bản đầu: Cinema + Classic + Đen trắng — thêm / bớt gì?
- **Q-P5.** Có làm phòng chụp online không? Nếu có thì chấp nhận dùng một dịch vụ signaling bên ngoài (đổi một phần D-06 / D-37) không, và tối đa bao nhiêu người (đề xuất 4)?
- **Q-P6.** Làm P1 (solo) trước ở `/labs/photobooth` được không?
- **Q-P7.** ~~Mô hình bảng ảnh S × P?~~ Tạm theo đề xuất (chủ dự án chưa rõ photobooth nên như nào) — D-147.
- **Q-P8.** ~~Sửa riêng hay sửa chung?~~ Còn trong phòng → sửa chung kiểu collaborator — D-148.
- **Q-P9.** ~~Mã QR?~~ Không, chỉ cần mã phòng 4 ký tự chữ + số — D-149.
- **Q-P10.** ~~Trong project này hay tách?~~ Trong project này, nhưng tái cấu trúc monorepo (chủ dự án, 2026-10-29).
- **Q-P11.** Hai app hay một app, server ở đâu? Đề xuất (cập nhật 2026-10-29): **một app** `apps/web` (IG Layout + `/booth`) trên Vercel, **giữ xuất tĩnh**; signaling + TURN trên **Cloudflare** (Worker + Durable Objects + Realtime TURN) ở `apps/signal`. Phương án cũ (bỏ xuất tĩnh + Upstash) để dự phòng — chờ chủ dự án chốt.
- **Q-P12.** ~~Tag ở đâu?~~ Chỉ ở màn home (2026-10-29). Còn mở: kéo hướng nào để chuyển.
- **Q-P13.** ~~Thứ tự?~~ Đồng ý: monorepo + tách packages trước, booth sau (2026-10-29).

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
