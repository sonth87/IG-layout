# 2026-10-14 — Trao đổi & phân tích ban đầu

## Ý tưởng ban đầu (từ chủ dự án)

> Làm ứng dụng web chỉnh sửa ảnh, cắt ảnh, tạo layout ảnh; user export toàn bộ và upload lên Instagram.
> Ví dụ: 1 ảnh landscape cắt thành nhiều ảnh, ảnh chồng lên nhau, nhiều style, nhiều hiệu ứng; thêm text, border, kiểu chia ảnh, kiểu layout.

## Phân tích thị trường

Đã có nhiều app làm việc tương tự:

| Nhóm | Ví dụ | Điểm mạnh | Điểm yếu |
|---|---|---|---|
| Thiết kế đa năng | Canva, Adobe Express, Fotor, Pixlr | Template phong phú, có bản web | Không chuyên carousel; cắt panorama liền mạch phải làm tay |
| Carousel / panorama | SCRL, Unfold, PanoramaCrop, Swipeable, 9Cut, Grid Maker | Chuyên cắt ảnh, carousel liền mạch | Phần lớn chỉ có trên mobile, nhiều app thu phí / watermark |
| Collage | PhotoGrid, Picsart, Layout (Instagram — đã ngừng) | Có sẵn khung | Ít tự do sắp xếp |
| Chỉnh màu | Lightroom, VSCO, Snapseed | Filter/màu mạnh | Không có layout |

**Đánh giá:** khoảng trống nằm ở phần giao nhau của: *chạy trên web* + *lấy carousel làm trọng tâm* + *sắp xếp tự do* + *riêng tư (xử lý trên máy)* + *miễn phí, không watermark*.

## Kết luận từ trao đổi

1. **Không làm bước upload lên Instagram.** User tự tải ảnh về và tự đăng.
   → Không cần Meta API, không cần đăng nhập, không cần server xử lý ảnh.
2. **Miễn phí, không cạnh tranh.** Không cần chiến lược kiếm tiền hay định vị thị trường; tập trung vào chất lượng công cụ.
3. **Next.js + PWA.** User lưu lại như một app.
4. **Tài liệu trước, code sau.** Mọi yêu cầu và quyết định được ghi lại trong `docs/`.

## Ý tưởng kiến trúc cốt lõi (đề xuất)

**Một canvas dài = N slide × chiều rộng một slide.** Mọi thứ (ảnh, text, sticker) là phần tử đặt tự do trên canvas; khi xuất thì cắt canvas thành N ảnh.

Một mô hình này bao được mọi kiểu dùng: cắt panorama, collage, carousel liền mạch, ảnh chồng lớp vắt qua slide. Lưới profile là cùng ý tưởng nhưng canvas trải theo 2 chiều.
Chi tiết: [architecture/overview.md](../architecture/overview.md).

## Rủi ro kỹ thuật đã nhận diện

- iOS Safari giới hạn kích thước canvas (~16,7 triệu pixel) → phải render từng slide khi export.
- Ảnh HEIC từ iPhone: Chrome/Firefox không đọc được → cần thư viện decode (WASM).
- EXIF orientation: không xử lý thì ảnh bị xoay sai.
- Font chữ khi export: phải chờ font tải xong mới render.
- Instagram nén ảnh mạnh và thông số thay đổi theo thời gian → cần kiểm tra lại định kỳ.
- Trên mobile, user hay quên chọn đúng tỉ lệ khi đăng nên Instagram tự crop sai → cần hướng dẫn sau khi tải về.
