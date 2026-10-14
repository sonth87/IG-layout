# 2026-10-14 — Tham khảo tính năng chỉnh ảnh từ các phần mềm khác

> Mục đích: liệt kê những gì các app phổ biến đang có, làm cơ sở để chọn tính năng cho dự án.
> Đây là **danh mục tham khảo**, chưa phải danh sách sẽ làm. Mức ưu tiên đề xuất: **MVP** / **Sau** / **Cân nhắc**.

Nguồn tham khảo: Lightroom Mobile, Snapseed, VSCO (chỉnh màu); Canva, Picsart, Unfold, SCRL (layout, phần tử, template); app scrapbook kiểu Collart, Tezza.

## 1. Biến đổi hình học (mọi phần tử)

| Tính năng | Có ở | Đề xuất |
|---|---|---|
| Di chuyển, phóng to/thu nhỏ, xoay (cử chỉ 2 ngón) | Tất cả | MVP |
| Lật ngang/dọc | Tất cả | MVP |
| Crop theo tỉ lệ / tự do | Tất cả | MVP |
| Nắn thẳng (straighten), xoay góc nhỏ | Lightroom, Snapseed | MVP |
| Chỉnh phối cảnh (perspective) | Lightroom, Snapseed | Sau |
| Mask theo hình (tròn, bo góc, trái tim, ngôi sao…) | Canva, Picsart | MVP |
| Đường gióng, hít (snap) vào tâm, mép, ranh giới slide | Canva | MVP |

## 2. Chỉnh màu & ánh sáng (Adjustments)

| Nhóm | Thông số | Có ở | Đề xuất |
|---|---|---|---|
| Ánh sáng | Exposure, Brightness, Contrast, Highlights, Shadows, Whites, Blacks | Lightroom, Snapseed, VSCO | MVP (bộ cơ bản) |
| Màu | Saturation, Vibrance, Temperature, Tint | Tất cả | MVP |
| Chi tiết | Sharpen, Clarity/Structure | Lightroom, Snapseed | Sau |
| Hiệu ứng | Vignette, Grain, Fade | VSCO, Lightroom | MVP |
| Nâng cao | HSL theo từng màu, Curves, Color grading (split toning) | Lightroom, VSCO | Sau |
| Khử mờ | Dehaze | Lightroom | Cân nhắc |

## 3. Filter / Preset

| Tính năng | Có ở | Đề xuất |
|---|---|---|
| Bộ filter có sẵn (film, vintage, đen trắng, ấm, lạnh, mờ…) | VSCO, Instagram, Picsart | MVP |
| Thanh chỉnh cường độ filter | VSCO | MVP |
| Lưu bộ chỉnh của mình thành preset riêng | Lightroom, VSCO | Sau |
| Nhập file LUT (.cube) | Một số app chuyên | Cân nhắc |
| Copy/dán bộ chỉnh từ ảnh này sang ảnh khác | Lightroom | Sau |

## 4. Hiệu ứng đặc biệt (Effects)

| Hiệu ứng | Có ở | Đề xuất |
|---|---|---|
| Blur (toàn ảnh, tilt-shift, làm mờ nền) | Snapseed, Picsart | Sau |
| Light leak, bụi, xước kiểu film | VSCO, Huji | Sau |
| Duotone, halftone | Canva, Picsart | Cân nhắc |
| Glitch, chromatic aberration | Picsart | Cân nhắc |
| Đổ bóng, phát sáng (glow) cho phần tử | Canva | MVP (đổ bóng) |
| Blend mode (multiply, screen, overlay…) | Picsart | Sau |

## 5. Phần tử thêm vào (Elements)

| Loại | Chi tiết | Có ở | Đề xuất |
|---|---|---|---|
| Text | Font, cỡ, màu, căn lề, giãn chữ, viền chữ, bóng, nền chữ | Tất cả | MVP |
| Text nâng cao | Chữ uốn cong, hiệu ứng chữ, text style có sẵn | Canva, Picsart | Sau |
| Ảnh khác | Chèn thêm ảnh, đặt tự do | Tất cả | MVP |
| Hình khối | Chữ nhật, tròn, đường kẻ, mũi tên | Canva | MVP |
| Icon | Bộ icon đơn sắc | Canva | MVP |
| Sticker | Sticker màu, emoji | Picsart, Canva | Sau |
| Material / chất liệu | Giấy, băng dính washi, giấy xé, nền texture | Scrapbook apps | Sau |
| Khung (frame) | Polaroid, cuộn film, khung tranh | Unfold, Picsart | MVP (vài khung cơ bản) |

## 6. Thao tác chung cho mọi phần tử

Di chuyển, scale, xoay, lật, độ mờ (opacity), thứ tự lớp, nhân bản, xóa, khóa, nhóm, căn chỉnh, undo/redo.
→ Đề xuất: **MVP** (trừ nhóm phần tử: Sau).

## 7. Nền & viền

| Tính năng | Đề xuất |
|---|---|
| Nền màu trơn, gradient | MVP |
| Nền ảnh làm mờ (blur fill) | MVP |
| Nền texture / pattern | Sau |
| Viền ảnh (màu, độ dày, bo góc) | MVP |
| Khoảng cách giữa các ô layout | MVP |

## Ghi chú cho mobile-first

- Mọi thao tác phải làm được bằng ngón tay: kéo, pinch để scale, xoay bằng 2 ngón, chạm giữ để mở menu.
- Bảng công cụ dạng thanh dưới đáy và bottom sheet (giống VSCO, Lightroom Mobile).
- Thanh trượt (slider) to, dễ kéo; chạm đúp vào slider để đặt lại giá trị.
- Nút "giữ để xem ảnh gốc" (so sánh trước/sau) — tính năng rất quen thuộc trên các app mobile.
