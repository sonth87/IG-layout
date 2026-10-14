# Đề bài & mục đích

## Đề bài

Xây dựng một **ứng dụng web** giúp người dùng **chỉnh sửa ảnh, cắt ảnh và tạo layout ảnh** để đăng lên Instagram.
Người dùng thiết kế xong thì **tải ảnh về máy** và **tự đăng lên Instagram** — ứng dụng không làm bước đăng bài.

Ví dụ nhu cầu:
- Một ảnh landscape/panorama cắt thành nhiều ảnh để đăng carousel (vuốt ngang liền mạch).
- Nhiều ảnh xếp chồng lên nhau, xoay lệch kiểu scrapbook/polaroid.
- Chia ảnh theo nhiều kiểu layout (collage 2, 3, 4 ô…).
- Thêm text, viền, khung, hiệu ứng.

## Mục đích

- Cung cấp **miễn phí** cho mọi người.
- **Không đặt mục tiêu cạnh tranh** với các app khác — làm công cụ tốt, dễ dùng, đúng nhu cầu.
- Dùng được như một app: **PWA**, người dùng "cài" lên màn hình chính điện thoại/máy tính.

## Mong muốn

- Dễ dùng, thao tác nhanh, kết quả đẹp.
- Ảnh xuất ra đúng chuẩn Instagram, đăng lên không bị crop sai hay giảm chất lượng.
- Nhiều style, nhiều hiệu ứng, nhiều kiểu layout.

## Không phải mục tiêu (Non-goals)

- Không đăng ảnh trực tiếp lên Instagram, không tích hợp Instagram/Meta API.
- Không cạnh tranh tính năng với Canva hay các bộ thiết kế đa năng.
- Không làm mạng xã hội, không có feed, không chia sẻ công khai trong app.

## Nền tảng

- Web app viết bằng **Next.js**, hỗ trợ **PWA**.
- **Mobile-first:** người dùng chủ yếu dùng trên điện thoại. Desktop vẫn dùng được.
- User chọn làm **Post** (feed / carousel), **Story** (9:16) hoặc **Grid** (lưới trang cá nhân).
