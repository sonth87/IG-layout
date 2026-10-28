# 2026-10-28 — Mở rộng thư viện template + ảnh mẫu thật

## Yêu cầu của chủ dự án

- Trang chủ (thư viện template) còn nghèo nội dung, ảnh xem trước chỉ là tranh vẽ phong cảnh → tạo **thật nhiều loại template** tương tự SCRL (ảnh chụp tham khảo trong `sample/`, không commit).
- Đưa **ảnh thật** vào, lấy từ **Pexels** (chủ dự án cấp API key).

## Quan sát từ ảnh SCRL (`sample/IMG_4114…4138`)

- Trang chủ: banner lớn theo mùa (Halloween), "Continue", rồi các **mục theo chủ đề**: Fresh Picks, Halloween, Daily Essentials, In Fashion, Postcards From, From the Archive, Shot on Film, Scribbles by Hand, A Special Occasion, Scrapbook Diaries, Less Is More, Make It a Story, cuối cùng "Explore More" dạng 2 cột so le.
- Thẻ template luôn có **ảnh thật**, ♡, số ảnh / số slide, chấm cho carousel. Khung trang chủ của mình (M18) đã có đủ các phần này — thiếu là **nội dung**.
- Kiểu bố cục hay gặp: dải photobooth đen, tờ in thử (contact sheet), khung phim, polaroid nghiêng + băng keo, chữ viết tay, bìa tạp chí chữ lớn, mosaic dày không viền, ảnh vắt qua slide, nền giấy kraft, nhãn chữ trên nền trắng ("Japan recap").

## Đã làm

- **Ảnh mẫu:** `scripts/fetch-samples.mjs` gọi Pexels API (khoá đọc từ `.env.local`, **không commit**), tải 138 ảnh theo 13 chủ đề (du lịch, biển, phố, đồ ăn, chân dung, bạn bè, cặp đôi, mùa thu, thiên nhiên, tối giản, trắng đen, tiệc, thời trang), thu về WebP ≤ 720 px (~4.5 MB tổng) ở `public/samples/`, danh sách ở `src/lib/templates/samplePhotos.json`. Đã duyệt bằng mắt, bỏ 8 ảnh lệch chủ đề / nhoè / trùng loại. Ghi công tác giả trong `licenses.txt` (giấy phép Pexels không bắt buộc nhưng vẫn ghi).
- Mỗi template khai báo **chủ đề ảnh** (`design.themes`); ô dọc nhận ảnh dọc, ô ngang nhận ảnh ngang; mỗi template bắt đầu ở một chỗ khác trong kho nên ảnh không lặp nhiều.
- **Template: 22 → 98**, chia file theo nhóm trong `src/lib/templates/designs/`. Nhóm mới: **Mùa thu & Halloween** (đứng đầu — sát 31/10), **Bưu thiếp du lịch**, **Chụp bằng phim**, **Tạp chí**, **Sổ tay**; nhóm "Carousel" đổi tên hiển thị thành **Thường ngày**.
- Thành phần mới cho template: dải photobooth xoay nguyên khối, băng keo (hình chữ nhật mờ, xoay, nằm **trên** ảnh), khối màu / thẻ giấy, chấm tròn trang trí, ô lưới tự tính.
- 4 font chuyển sang tải cùng trang chủ để template có chữ viết tay / tạp chí: Cormorant Garamond, Anton, Great Vibes, Patrick Hand (chỉ thêm khai báo CSS; file font chỉ tải khi template dùng).
- Banner: Halloween / Bưu thiếp du lịch / Chụp bằng phim. "Khám phá thêm" trộn các nhóm xen kẽ.
- Hiệu năng: thẻ template chỉ dựng ảnh xem trước khi sắp cuộn tới (cách 400 px) → không tải hết 138 ảnh khi mở trang chủ.

## Chưa làm / để ngỏ

- "Dùng template" vẫn tạo **ô ảnh trống** (D-72) — ảnh mẫu chỉ để xem trước. Có thể cân nhắc tuỳ chọn "giữ ảnh mẫu" sau.
- Template theo mùa cần thay theo thời gian (Giáng sinh, Tết…). Chưa có cơ chế tự đổi theo ngày.
- Chưa dùng khung giấy xé / sticker từ thư viện (packs) trong template — mô hình template chưa tham chiếu tài sản pack.
