# Các dạng layout

> Trạng thái: **Đang chốt dần.** Loại project: Post / Story / Grid (đã chốt). Bộ template đầu tiên đã có trong app (M3) — danh sách: `src/lib/templates/library.ts`. Mức ưu tiên: **MVP** / **Sau** / **Cân nhắc**.

## Khái niệm

- **Project** có một loại (**Post / Story / Grid**) và gồm nhiều **slide** (khung ảnh).
- **Layout** = cách sắp xếp nội dung trên các slide. Có ba phạm vi:
  1. **Trong một slide** — collage, khung đơn, scrapbook…
  2. **Trải qua nhiều slide** — panorama, carousel liền mạch…
  3. **Trên lưới trang cá nhân** — puzzle grid.
- **Template** = bố cục dựng sẵn, gồm các **ô ảnh (slot)** và có thể có trang trí (text, khung, nền). Áp template xong, mọi thứ vẫn là phần tử bình thường → **sửa tự do được**.
- **Ô ảnh (slot)**: một khung có hình dạng (chữ nhật, bo góc, tròn…). Ảnh nằm bên trong, user kéo / phóng to để chọn vùng hiển thị.

## A. Layout trong một slide

### A1. Khung đơn (Single) — **MVP**
Một ảnh trong một slide.
- Chế độ **Fill** (lấp kín, cắt bớt) hoặc **Fit** (hiện đủ ảnh, phần thừa là nền).
- Nền khi Fit: màu trơn, gradient, ảnh làm mờ (blur fill).
- Viền, bo góc, khoảng đệm (padding) quanh ảnh.
- Dùng nhiều nhất khi đăng ảnh ngang lên khung dọc mà không muốn bị cắt.

### A2. Lưới chia ô (Grid / Collage) — **MVP**
Chia slide thành nhiều ô.
- **Đều nhau:** 2 (ngang / dọc), 3, 4, 6, 9 ô.
- **Không đều:** 1 lớn + 2 nhỏ, 1 lớn + 3 nhỏ, kiểu tạp chí…
- Chỉnh khoảng cách giữa các ô, bo góc, màu nền. **MVP**
- **Kéo đường chia** để đổi kích thước ô (kiểu PhotoGrid). **Sau**
- Ô hình chéo, hình tròn, hình tự do. **Cân nhắc**

### A3. Tự do / Scrapbook (Freeform) — **MVP**
Không có ô cố định; ảnh đặt tự do, xoay, chồng lớp.
- Kết hợp khung polaroid, đổ bóng, băng dính washi, giấy xé, sticker.
- Template scrapbook dựng sẵn: ảnh xếp lệch, chồng nhau tự nhiên. **Sau**

### A4. Khung trang trí (Frame) — **MVP** (vài khung cơ bản)
Ảnh đặt trong một khung có phong cách.
- Polaroid, cuộn film (film strip), khung tranh, viền trắng kiểu ảnh in.

### A5. Slide chữ (Typography) — **Sau**
Slide chủ yếu là chữ: trích dẫn, tiêu đề mở đầu carousel, slide kết thúc.

### A6. Trước / sau (Before / After) — **Cân nhắc**
Một slide chia đôi, cùng ảnh trước và sau khi chỉnh.

## B. Layout trải qua nhiều slide (chỉ cho Post / carousel)

### B1. Panorama — **MVP**
Một ảnh trải đều N slide; vuốt trên Instagram thấy nối liền.

### B2. Carousel liền mạch (Seamless) — **MVP**
Nền và phần tử chạy liên tục qua các slide; ảnh, chữ, sticker có thể đặt vắt qua ranh giới slide.
Mỗi slide vẫn có thể có layout riêng (A1–A5) bên trên một nền liền mạch.

**Nguyên tắc cắt (chủ dự án mô tả):** toàn bộ carousel là **một bố cục liền**; khi xuất, app cắt **đúng theo kích thước slide**, cắt qua mọi thứ nằm trên ranh giới (kể cả ảnh nhỏ đặt bên trên). User chọn các ảnh xuất ra theo đúng thứ tự khi đăng → vuốt thấy liền mạch.

Ví dụ điển hình:
- **Ảnh nền trải dài + ảnh nhỏ nổi bên trên:** một ảnh lớn làm nền chạy qua tất cả slide; các ảnh nhỏ đặt bên trên, có cái nằm vắt qua ranh giới slide.
- **Dải ảnh chạy ngang:** các ảnh xếp thành hàng / zigzag / đường chéo chạy qua các slide.
- **Cuộn film chạy ngang:** khung film strip kéo dài qua nhiều slide, mỗi ô film là một ảnh.
- **Polaroid rải rác:** ảnh polaroid xoay lệch, vắt qua ranh giới.
- **Ảnh lớn 2 slide + ảnh nhỏ:** một ảnh chiếm 2 slide, các slide khác là collage.
- **Tiêu đề trải ngang:** chữ lớn chạy qua nhiều slide.

### B3. Phóng to chi tiết (Zoom sequence) — **Sau**
Slide 1 là toàn cảnh; các slide sau là cận cảnh từng chi tiết của cùng ảnh. App tạo tự động từ các vùng user chọn.

### B4. Kết hợp — **MVP** (là hệ quả của mô hình canvas)
Slide 1–3 là panorama, slide 4 là collage, slide 5 là khung đơn… trong cùng một carousel.

## C. Layout trên lưới trang cá nhân (Puzzle grid) — `Đã chốt làm`

Một ảnh lớn (hoặc một bố cục) cắt thành **3 cột × N hàng** ô; mỗi ô là **một bài đăng riêng**. Đăng đủ thì trang cá nhân ghép thành ảnh lớn.

Điểm cần lưu ý:
- **Thứ tự đăng ngược:** Instagram hiện bài mới nhất ở góc trên bên trái, nên phải đăng **ô dưới cùng bên phải trước**. App đặt tên file theo **thứ tự đăng** (`post_01` = đăng đầu tiên) và hiển thị sơ đồ thứ tự.
- **Tỉ lệ ô:** thumbnail trên lưới là 3:4 → mỗi ô xuất 1080 × 1440.
- **Khe hở giữa các ô** trên trang cá nhân (đường trắng mảnh): **có tùy chọn bù khe hở** để ảnh ghép khớp hơn. `Đã chốt`
- **Số hàng:** 1, 2, 3, 4… hàng (3, 6, 9, 12… bài).
- **Mỗi ô có thể là một carousel** (ô là slide đầu, các slide sau là nội dung khác). `Đã chốt` — mức ưu tiên: **Sau**
- Có thể dùng mọi công cụ (text, sticker, filter…) trên toàn bộ ảnh lớn trước khi cắt.

## D. Layout cho Story

- Dùng lại A1–A5 trên khung 9:16, có **vùng an toàn**.
- Nhiều khung Story liên tiếp = nhiều slide, nhưng người xem **chạm** để chuyển (không vuốt liền), nên B1 / B2 không có ý nghĩa nhiều. Panorama trải qua nhiều Story: **Cân nhắc**.

## Thư viện template — mở rộng dần

Số kiểu layout là **rất nhiều** và sẽ bổ sung liên tục. Vì vậy:
- Template được định nghĩa **dưới dạng dữ liệu** (ví dụ JSON: các ô ảnh, vị trí, kích thước, trang trí), không viết code riêng cho từng template → thêm template mới không cần sửa code.
- Template được chia **theo nhóm** (Khung đơn, Lưới, Scrapbook, Panorama, Seamless, Grid profile, Story…) và **theo số ảnh**.
- Template tự co giãn theo tỉ lệ khung (1:1, 4:5, 3:4, 9:16) và theo số slide khi có thể.
- MVP chỉ cần một bộ nhỏ để kiểm chứng; mở rộng dần sau.

## Tính năng hỗ trợ cho layout

| Tính năng | Mô tả | Đề xuất |
|---|---|---|
| Gợi ý theo số ảnh | Chọn N ảnh → app gợi ý các template hợp với N ảnh | MVP |
| Tự điền ảnh | Áp template → ảnh tự điền vào các ô theo thứ tự | MVP |
| Đổi template giữ ảnh | Đổi sang template khác, ảnh tự chuyển sang ô mới | Sau |
| Đổi chỗ ảnh | Kéo ảnh từ ô này thả vào ô khác để đổi chỗ | MVP |
| Áp layout cho mọi slide | Dùng cùng một layout cho tất cả slide | Sau |
| Lưu template của mình | User lưu bố cục tự tạo để dùng lại | Sau |
