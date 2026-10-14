# Tham khảo Grids + góp ý sau khi thử M8 (2026-10-15)

> Trạng thái: **đã duyệt hướng** (D-66..D-68): làm theo toàn bộ Grids trừ đăng nhập / trả phí; sửa F-01..F-04 trước. Nguồn: góp ý của chủ dự án sau khi dùng thử bản M8, cùng thông tin công khai về Grids.
> Chủ dự án chọn **Grids** ("GRIDS Post maker for Instagram") làm app chuẩn để tham chiếu.

## 1. Góp ý của chủ dự án

> "Khi drag ảnh trên canvas, rotate… đều kém mượt, đồng thời không thể cho về đúng như lúc đầu khi rotate. Một số UI hiện lên làm phần ảnh hiển thị bị nhảy lên xuống. Một số UI ở phần chọn style lúc đầu (sau khi chọn ảnh, chọn layout) thì khá tệ, ở phần chọn layout bị duplicate… Gọi là có tính năng, nhưng tính năng không "ngon", chưa thấy tham khảo các phần mềm khác."

Bài học về cách làm: e2e chỉ chứng minh tính năng chạy được, không đo được cảm giác khi dùng. Từ M9 trở đi, mỗi màn hình phải có: (1) tham chiếu cách app chuẩn làm, (2) tiêu chí về cảm giác đo được, (3) bản quay màn hình gửi chủ dự án duyệt.

## 2. Nguyên nhân các lỗi đã nêu (tìm trong code)

| # | Lỗi | Nguyên nhân | Hướng sửa |
|---|---|---|---|
| F-01 | Kéo ảnh không mượt | Mỗi lần ngón tay di chuyển, đường gióng được lưu vào React state (`setGuides`) → render lại toàn bộ `CanvasStage` và mọi node ảnh (kể cả ảnh có filter) | Đường gióng vẽ thẳng bằng Konva qua ref, không qua React. Trong lúc kéo chỉ vẽ lại layer cần thiết. Đo FPS bằng script |
| F-02 | Xoay không về đúng 0° | Xoay bằng hai ngón không hít góc (chỉ tay nắm của Transformer có `rotationSnaps`). Hơi xoắn ngón khi phóng to cũng làm ảnh lệch vài độ. Không có nút đặt lại góc | Hít về 0 / 90 / 180 / 270° khi lệch dưới ~6°, có ngưỡng "chết" để chụm không làm xoay. Hiện số độ khi xoay. Rung nhẹ khi hít (nếu máy hỗ trợ). Nút "Thẳng lại" |
| F-03 | Canvas nhảy lên xuống | Thanh trên đổi bộ nút khi chọn / bỏ chọn, chữ "Đã lưu" hiện rồi ẩn, sheet công cụ đẩy vùng canvas | Thanh trên / dưới cao cố định. Sheet nổi đè lên canvas, không làm canvas co lại. Trạng thái lưu không đổi chiều cao. Đo bằng e2e: vị trí canvas không đổi khi chọn / mở sheet |
| F-04 | Màn chọn layout bị trùng | Bug ở [library.ts](../../src/lib/templates/library.ts) `suggestTemplates`: với 1 ảnh, layout panorama nằm trong cả `exact` lẫn `panorama` nên hiện 2 lần. Ngoài ra có vài layout trông gần như giống nhau | Bỏ trùng. Rà lại bộ layout để mỗi mẫu khác nhau rõ ràng |
| F-05 | Màn chọn style / layout lúc đầu "khá tệ" | Cần chủ dự án chỉ rõ (ảnh chụp). Đánh giá của tôi: bản xem trước nhỏ, tab nhóm khó hiểu, khay ảnh đổi thứ tự bằng "chạm 2 ảnh" khó đoán | Làm lại theo mục 4 |

**Kết quả (2026-10-15):** F-01..F-04 đã sửa, xem [checklist M9](../roadmap/checklist.md). F-01 hoá ra không do JavaScript (chỉ vài ms) mà do mỗi khung hình phải vẽ lại cả dải canvas nhiều slide ở mật độ 3×. Canvas giờ chỉ to bằng màn hình.

## 3. Grids — những gì biết được

Nguồn: [App Store](https://apps.apple.com/us/app/grids-post-maker-for-instagram/id666575203) cùng các bài giới thiệu. Tôi **chưa dùng trực tiếp** được Grids, nên phần giao diện chi tiết cần chủ dự án xác nhận bằng ảnh chụp hoặc quay màn hình (mục 6).

- **Tính năng chính:** cắt ảnh thành lưới cho profile (tối đa 5 hàng) và tự sắp đúng thứ tự đăng. Carousel liền mạch 2–10 khung. Template cho post / story / reels. Collage. Trình chỉnh có font, filter, sticker, hiệu ứng, xoá nền.
- **Định vị:** "no manual work needed": nhanh, ít bước, kết quả đẹp ngay nhờ template thiết kế sẵn.
- **Lời khen:** trực quan, nhanh, "như có designer trong túi".
- **Lời chê:** nhiều thứ làm được bằng Canva / Instagram. Bản Pro mỏng.

### Nguyên tắc rút ra để áp dụng

| Nguyên tắc | Grids / app cùng loại | App mình hiện tại |
|---|---|---|
| Đi từ mẫu đẹp | Bắt đầu bằng thư viện template lớn, xem trước to, đã có chữ / trang trí | Layout chỉ là khung ô trống, xem trước nhỏ, chọn sau khi đã chọn ảnh |
| Ít bước tới kết quả | Chọn mẫu → chạm ô → thêm ảnh → xuất | Loại → tỉ lệ → số slide → ảnh → layout → editor |
| Carousel là một dải liền | Kéo ngang dải, đường chia khung rõ, chỉnh vị trí ảnh dễ | Có, nhưng thao tác chưa mượt (F-01..F-03) |
| Thao tác kiểu ứng dụng gốc | Kéo / chụm / xoay mượt, có hít góc, có rung | Chưa đạt |
| Xuất theo thứ tự | Lưu vào thư viện ảnh, đúng thứ tự | Đã có |

## 4. Đề xuất M9 — "Làm cho ngon"

Thứ tự ưu tiên:

1. **Thao tác trên canvas (F-01, F-02, F-03):** kéo, chụm, xoay đạt 60 fps trên điện thoại tầm trung; hít góc xoay; giao diện xung quanh không xê dịch. Tiêu chí đo: script đo khung hình khi kéo / chụm, e2e kiểm vị trí canvas không đổi.
2. **Màn chọn layout (F-04, F-05):** sửa trùng; xem trước lớn kiểu Grids (cuộn dọc, mỗi mẫu chiếm gần hết chiều ngang, xem trước bằng ảnh thật của người dùng); nhóm rõ ràng; đổi thứ tự ảnh bằng kéo thả.
3. **Bộ template "đẹp sẵn":** template có sẵn chữ, nền, trang trí (đúng tinh thần Grids), không chỉ khung ô. Cần chủ dự án chọn 5–10 mẫu Grids muốn có tương đương.
4. **(Cần chốt)** Có đổi luồng tạo project thành "chọn mẫu trước, thêm ảnh sau" giống Grids không, hay giữ "chọn ảnh trước" như hiện tại?

Mỗi mục làm xong: quay màn hình (390 × 844) gửi chủ dự án duyệt rồi mới làm mục tiếp theo.

## 5. Câu hỏi cho chủ dự án

- **Q-M9-1:** ~~Luồng tạo theo Grids?~~ → Có, làm theo Grids (D-66).
- **Q-M9-2:** Trong Grids, bạn thích nhất màn hay thao tác nào? Gửi giúp 3–5 ảnh chụp hoặc một đoạn quay màn hình: màn chọn mẫu, editor carousel, thanh công cụ.
- **Q-M9-3:** ~~Làm ngay F-01..F-04?~~ → Có (D-68). Thêm: chặn bôi đen / zoom trang (D-67).

## 6. Nguồn

- [GRIDS Post maker for Instagram — App Store](https://apps.apple.com/us/app/grids-post-maker-for-instagram/id666575203)
- [Big grid trên Instagram — Sked Social](https://skedsocial.com/blog/big-grid-instagram)
- [Hướng dẫn xoay có điểm hít — Microsoft](https://learn.microsoft.com/bs-latn-ba/windows/apps/develop/input/guidelines-for-rotation)
- [Cấu hình hít khi xoay — PhotoEditor SDK](https://img.ly/docs/pesdk/web/configuration/snapping/)
