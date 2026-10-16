# Đặc tả video (M13) — 2026-10-16

> Trạng thái: **đã chốt hướng**, làm theo giai đoạn. Nguồn: kết quả [video lab](../discussions/2026-10-16-video-lab.md) trên iPhone + yêu cầu của chủ dự án.
> Yêu cầu gốc: "cần giữ tiếng, có tuỳ chọn tắt tiếng; nên nén video; nhiều tuỳ chọn tinh chỉnh: chọn từ đoạn nào đến đoạn nào (có khung chọn kèm hình / âm thanh để phát thử trong khoảng đó), zoom, di chuyển vị trí hiển thị, hiệu ứng, bộ lọc, sticker, text, animation… thiếu thì bổ sung, chưa đủ thì mở rộng".
> Ký hiệu: **[Y]** chủ dự án yêu cầu · **[S]** có trong SCRL · **[+]** tôi đề xuất thêm.

## Đã xác nhận trên iPhone

- Phát video thật trên canvas 60 fps; xuất MP4 H.264 1080 × 1350 nhanh hơn thời gian thực (1,7 ×); **lưu vào Ảnh được**.
- **Mã hoá âm thanh AAC trên iPhone: được** (trang thử bước 4: video iPhone H.264 1920×1080 + AAC 48 kHz stereo → nén lại, file ra có tiếng).
- Instagram chọn được file MP4: **chưa kiểm, tạm coi là được** (chủ dự án, 2026-10-16).

## Thư viện

**Mediabunny** (MPL-2.0, dùng nguyên bản, không sửa → không phải công bố mã của app): đọc MP4 / MOV, giải mã / mã hoá bằng WebCodecs, cắt đoạn, đổi kích thước, giữ tiếng, ghép MP4. Dự phòng mã hoá AAC: `@mediabunny/aac-encoder` (khi Safari không có AudioEncoder AAC). Thay `mp4-muxer` của trang thử.

## Giai đoạn

### M13.1 — Nền tảng
- **Nhập video** [Y] từ máy (MP4, MOV/HEVC của iPhone). **Nén** [Y] về tối đa **1080p**, **≤ 60 s** (giới hạn video trong carousel Instagram), giữ tiếng; có thanh tiến độ, huỷ được. Video dài hơn 60 s → hỏi đoạn muốn giữ (dùng màn cắt đoạn M13.2; bản đầu lấy 60 s đầu).
- **Phần tử video** [S] dùng như ảnh: kéo, co giãn, xoay, xoá, nhân bản, khoá, lớp; **mask**, **khung**, **viền**, **bóng**, **độ mờ**; đặt vào **ô template** và vắt qua nhiều slide (carousel liền mạch có video).
- **Zoom và di chuyển nội dung trong khung** [Y]: kéo trong khung để dời, chụm để phóng (như ô lưới), nút "Vừa khung / Lấp khung".
- **Phát / Dừng** chung cho cả project + **thanh thời gian**; video tự lặp trong editor.
- **Tiếng** [Y]: mỗi video có **bật / tắt tiếng** và **âm lượng**; khi xuất có tuỳ chọn **"Xuất không tiếng"**.
- **Xuất** [S]: slide có video → **MP4 H.264 + AAC**, 30 fps, đúng kích thước slide; slide không có video → JPEG như cũ. Thời lượng slide = đoạn video dài nhất trên slide. Video vắt qua nhiều slide được cắt đúng ranh giới và chạy cùng lúc → vuốt vẫn liền. Thứ tự file như cũ (`…_01.mp4`, `…_02.jpg`).
- Lưu project: video (đã nén) lưu trong IndexedDB như ảnh; hiện dung lượng.

### M13.2 — Cắt đoạn và tốc độ
- **Màn cắt đoạn** [Y]: **dải hình** (các khung theo thời gian) + **dạng sóng âm thanh**; **2 tay nắm** chọn đầu / cuối; số giây chính xác; **phát thử trong đoạn** (có tiếng) với vạch đang phát; chạm dải hình để tua.
- **Lặp** trong slide khi video ngắn hơn slide, hoặc dừng ở khung cuối [+].
- **Tốc độ** 0,5× / 1× / 1,5× / 2× [+] (tiếng đổi theo, hoặc tắt tiếng khi khác 1×).
- ~~Ảnh bìa~~ — bỏ: Instagram tự cho chọn ảnh bìa khi đăng (2026-10-16).

### M13.3 — Hiệu ứng và chuyển động
- **Bộ lọc + chỉnh màu** [Y][S] áp lên video (cùng 25 filter, 13 thông số, xử lý từng khung bằng WebGL).
- **Chữ, sticker, emoji, hình, khung** [Y] đặt lên video như ảnh (đã có — chạy cả trên slide video).
- **Animation** [Y] cho chữ / sticker / ảnh / video: **vào** (hiện dần, trượt lên / xuống / trái / phải, phóng to, nảy, đánh máy cho chữ), **ra**, **thời điểm bắt đầu / thời lượng**; xem trước khi phát.
- **Ken Burns** [+]: ảnh tĩnh từ từ phóng / trượt → slide ảnh cũng xuất được thành video.
- **Hiệu ứng động** [+]: hạt film chạy, vệt sáng nhấp nháy, VHS, rung nhẹ (áp cho cả slide).

### M13.4 — Âm nhạc và xuất nâng cao
- **Nhạc nền** [+] từ file trong máy (MP3 / M4A): cắt đoạn, âm lượng, nhỏ dần đầu / cuối; trộn với tiếng video.
- **Xuất cả carousel thành một video** [S] (dải cuộn ngang — cho Reels / Story / TikTok).
- **Story có video** [+]: tự chia video dài thành các story 15 s.

## Giới hạn và rủi ro

- Bộ nhớ: nhiều video 1080p trong một project trên iPhone có thể làm tab bị đóng → giới hạn tổng thời lượng / số video, giải phóng khung ngay sau khi vẽ.
- Xuất có tiếng phụ thuộc AAC trên iPhone (đang kiểm bằng trang thử bước 4).
- Lọc màu từng khung khi phát có thể nặng trên máy yếu → khi phát dùng bản xem trước nhỏ, khi xuất dùng đủ độ phân giải.
- Font / sticker không đổi. Video không tải lên đâu cả (xử lý trên máy).
