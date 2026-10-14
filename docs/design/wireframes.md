# Wireframe / Mockup

> Trạng thái: **Bản nháp v2** (2026-10-14) — thêm công cụ và theme sáng / tối; để trao đổi, chưa chốt.
> Canvas: https://claude.ai/artifact/HLVBkZ2J1e2FVuARUhq8tM (riêng tư — chỉ chủ dự án mở được, muốn chia sẻ thì dùng menu Share).
> **Bản lưu trên máy:** mở [wireframes/index.html](wireframes/index.html) bằng trình duyệt để xem toàn bộ; mỗi màn hình là một file HTML riêng. File gốc của canvas nằm trong [wireframes/source/](wireframes/source/).

## Các màn hình (khung điện thoại 390 × 844)

| # | Màn hình | Nội dung chính |
|---|---|---|
| 1 | My Projects | Danh sách project (ảnh thu nhỏ, loại, dung lượng), thanh dung lượng, banner nhắc cài app, lọc Post / Story / Grid, nút New project |
| 2 | New project | Chọn loại Post / Story / Grid; tỉ lệ 1:1, 4:5, 3:4; số slide |
| 3 | Choose layout | Khay ảnh đã chọn (đánh số, kéo để đổi thứ tự); nhóm template; gợi ý theo số ảnh |
| 4 | Editor — chọn ảnh | Dải canvas nhiều slide, ranh giới nét đứt; ảnh vắt qua ranh giới đang được chọn (khung, tay nắm, xoay); thanh nổi (nhân bản, lớp, lật, xóa); dải slide; công cụ ảnh (Replace, Crop, Adjust, Filters, Mask, Border) |
| 5 | Adjust | Bottom sheet: ✕ Hủy / ✓ Áp dụng; slider Hue với giá trị; chấm đánh dấu thông số đã chỉnh; giữ để so sánh |
| 6 | Filters | Tab nhóm (Mono, Vintage, Modern, Future); filter có tên; cường độ; ô "Apply to all photos — filter only" |
| 7 | Apply to all — confirm | Hộp xác nhận trước khi áp filter cho tất cả ảnh |
| 8 | Grid project | Lưới 3 × N, số trên ô = thứ tự đăng (ô 1 ở dưới phải); số hàng; bù khe hở |
| 9 | Story project | Khung 9:16, vùng an toàn trên / dưới có gạch chéo; dải khung Story; thanh công cụ chính |
| 10 | Preview & export | Xem trước kiểu Instagram (Carousel / Profile); thông số file; mẹo đăng; Lưu vào Ảnh / ZIP / từng ảnh |
| 11 | Text | Tab Font / Style / Color / Effects; font Google Fonts xem trước bằng chữ có dấu ("Đà Lạt"); căn lề; màu nhanh |
| 12 | Elements | Tìm kiếm; nhóm Shapes, Frames (polaroid, film, viền trắng, giấy xé), Materials (washi, giấy note, giấy kraft, giấy kẻ ô), Icons |
| 13 | Crop & rotate | Khung crop lưới 1/3; thước nắn thẳng (độ); tỉ lệ (Free, Original, theo ô, 1:1, 3:4, 16:9); xoay 90°, lật, reset |
| 14 | Mask | Hình: None, Rounded, Circle, Arch, Heart, Star, Hexagon, Blob; viền; kéo ảnh trong khung |
| 15 | Settings | Theme (System / Light / Dark); ngôn ngữ EN / VI; dung lượng, trạng thái lưu lâu dài, xóa tất cả; Credits; About |
| 1L, 4L, 6L, 10L | Bản theme sáng | Projects, Editor, Filters, Export ở theme sáng |

## Định hướng giao diện (đề xuất)

- **Theme sáng / tối:** có cả hai; mặc định **theo hệ thống**, user đổi trong Settings. Mỗi màn hình trên canvas có tweak `theme` để xem cả hai.
  - Tối: nền `#111214`, bề mặt `#1C1D21`, chữ `#F2F2F0`.
  - Sáng: nền `#F6F5F2`, bề mặt `#FFFFFF`, chữ `#1A1B1E`; chữ màu nhấn đậm hơn (`#8A5A00`) để đủ tương phản.
  - Vùng crop luôn tối để dễ thấy khung cắt.
- **Màu nhấn:** vàng hổ phách `#F2B84B` cho hành động chính và trạng thái được chọn.
- **Font giao diện:** Space Grotesk (tiêu đề) + DM Sans (nội dung).
- **Mobile-first:** vùng chạm ≥ 44px; công cụ ở dưới đáy (trong tầm ngón cái); bottom sheet cho từng công cụ.
- Hai trạng thái thanh công cụ dưới: **chưa chọn gì** → công cụ chung (Layout, Photos, Text, Elements, Filters, Background); **đang chọn phần tử** → công cụ của phần tử đó.

## Còn thiếu (làm ở vòng sau)

- Tab Style / Color / Effects của Text; Background; Border; Layer.
- Stickers trong Elements (chờ thư viện).
- Bản desktop.
