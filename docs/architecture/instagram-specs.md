# Thông số Instagram

> ⚠️ Instagram thay đổi thông số thường xuyên. **Kiểm tra lại trước khi code** phần export và mỗi khi có phản hồi ảnh bị crop/vỡ.
> Lần ghi nhận: 2026-10-14 — chưa xác minh lại với nguồn chính thức.

## Tỉ lệ & kích thước bài đăng

| Tỉ lệ | Kích thước khuyến nghị | Ghi chú |
|---|---|---|
| 1:1 | 1080 × 1080 | Vuông truyền thống |
| 4:5 | 1080 × 1350 | Dọc |
| 3:4 | 1080 × 1440 | Lưới profile chuyển sang thumbnail 3:4 từ 2025 |
| 1.91:1 | 1080 × 566 | Ngang — ít dùng cho carousel |
| 9:16 | 1080 × 1920 | Story / Reel — có vùng UI che ở trên và dưới |

## Carousel

- Tối đa **20** slide (cần xác minh).
- **Mọi slide phải cùng tỉ lệ với slide đầu tiên.**

## Story

- 1080 × 1920 (9:16).
- **Vùng an toàn:** mép trên khoảng 250px (avatar, thanh tiến trình) và mép dưới khoảng 340px (ô trả lời, nút) bị giao diện che. *Cần xác minh.*
- Mỗi khung Story là một ảnh riêng; người xem chạm để chuyển, không vuốt liền mạch như carousel.

## Xuất file

- JPEG, không gian màu sRGB, chất lượng khoảng 90–95%.
- Xuất đúng chiều rộng 1080px để Instagram không phải resize lại (đỡ bị nén thêm).

## Giá trị đang dùng trong app (M6) — cần xác minh trên app thật

- Vùng an toàn Story: trên 250 px, dưới 340 px (`STORY_SAFE` trong `layout.ts`).
- Khe hở giữa các ô lưới profile: 12 px trên ô rộng 1080 px (`GRID_GAP`).
- Ô Grid xuất 1080 × 1440 (3:4).

## Lưới profile

- Thumbnail trên lưới là 3:4. Ảnh 1:1 và 4:5 sẽ bị cắt bớt khi hiển thị trên lưới.
- Công thức cắt puzzle grid phải tính theo thumbnail 3:4, không theo ô vuông như trước.
