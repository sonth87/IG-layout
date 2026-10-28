# Tính năng & chức năng (góc nhìn người dùng)

> Tài liệu mô tả **người dùng làm được gì**, không mô tả cách cài đặt kỹ thuật.
> Trạng thái: `Đề xuất` | `Đã chốt` | `Bỏ`. Mức ưu tiên: **MVP** / **Sau** / **Cân nhắc**.
> Danh mục tham khảo đầy đủ: [discussions/2026-10-14-tham-khao-chinh-anh.md](../discussions/2026-10-14-tham-khao-chinh-anh.md).

## Định hướng chung — `Đã chốt`

- **Mobile-first:** người dùng chủ yếu thao tác trên điện thoại. Desktop dùng được nhưng không phải ưu tiên.
- **Ba loại project:** **Post** (bài đăng feed / carousel), **Story** (9:16), **Grid** (lưới trang cá nhân). User chọn khi tạo project.

## Giao diện sáng / tối — `Đã chốt`

- Có theme **Light** và **Dark**; mặc định **theo hệ thống (System)**; user đổi trong Settings.

## Ngôn ngữ — `Đã chốt`

- Mặc định **tiếng Anh**; user đổi sang **tiếng Việt** trong cài đặt.

## Luồng sử dụng chính

```
Chọn ảnh → Chọn tỉ lệ + số slide → Sắp xếp layout → Chỉnh ảnh, thêm phần tử, filter
→ Xem trước kiểu Instagram → Tải về → (User tự đăng lên Instagram)
```

## 1. Nhập ảnh — `Đã chốt`

- Chọn ảnh từ thư viện điện thoại / máy, kéo thả (desktop), dán (paste).
- Chọn nhiều ảnh cùng lúc.
- Hỗ trợ JPEG, PNG, WebP, HEIC *(HEIC: Đề xuất)*.
- **Tự động thu nhỏ khi nhập:** ảnh thường thu nhỏ về cạnh dài tối đa khoảng **4000px**; ảnh panorama (tỉ lệ > ~2:1) chỉ giới hạn cạnh ngắn khoảng **2400px** để không bị mờ khi trải nhiều slide. Thu nhỏ trước khi lưu để project nhẹ (khoảng 1–2 MB / ảnh thay vì 3–6 MB). Ảnh trong thư viện điện thoại của user không bị ảnh hưởng. Con số cụ thể sẽ tinh chỉnh khi làm prototype.

## 2. Thiết lập khung — `Đã chốt`

- **Bước đầu tiên: chọn loại** — Post, Story hay Grid. **Mỗi project chỉ một loại**, không trộn.
- **Grid:** chọn số hàng (3 cột × N hàng); mỗi ô xuất 1080 × 1440 và là một bài đăng riêng.
- **Post:** chọn tỉ lệ 1:1, 4:5, 3:4; chọn số slide carousel (tối đa theo giới hạn của Instagram).
- **Story:** khung 9:16 (1080 × 1920); hiển thị **vùng an toàn** (mép trên / dưới bị giao diện Instagram che). Có thể làm nhiều khung Story liên tiếp, mỗi khung xuất thành một ảnh.
- Thêm / bớt / sắp xếp lại thứ tự slide / khung.

## 3. Biến đổi phần tử — `Đã chốt`

Áp dụng cho **mọi phần tử** (ảnh, text, icon, sticker, hình khối, material…):
- Di chuyển, phóng to / thu nhỏ, xoay — bằng cử chỉ ngón tay. **MVP**
- Lật, độ mờ, thứ tự lớp, nhân bản, xóa, khóa. **MVP**
- Đường gióng và tự hít vào tâm, mép, ranh giới slide. **MVP**
- Nhóm nhiều phần tử. **Sau**
- Undo / redo — xem mục 16. **MVP**

## 4. Chỉnh ảnh — `Đã chốt` (phạm vi rộng, chi tiết theo mức ưu tiên)

- **Crop, xoay, nắn thẳng.** **MVP**
- **Mask theo hình** (tròn, bo góc, trái tim…). **MVP**
- **Ánh sáng & màu:** Exposure, Brightness, Contrast, Highlights, Shadows, Saturation, Vibrance, Temperature, Tint. **MVP**
- **Hiệu ứng nhẹ:** Vignette, Grain, Fade. **MVP**
- **Nâng cao:** Sharpen, Clarity, HSL, Curves, Color grading. **Sau**
- **Hiệu ứng đặc biệt:** blur, light leak, film dust, duotone, glitch, blend mode. **Sau / Cân nhắc**
- Giữ để xem ảnh gốc (so sánh trước / sau). **MVP**

## 5. Filter — `Đã chốt`

- Bộ filter có sẵn, **có tên, chia theo nhóm phong cách** (Film, Analog, Trầm, Tươi sáng, Đen trắng, Vintage, Hiện đại, Thiên nhiên, Ẩm thực, Tương lai), có thanh chỉnh cường độ (mặc định 100; filter đen trắng luôn xám hoàn toàn). **Filter v2** (D-132): filter là công thức màu kiểu VSCO; **Film FX** (lớp phủ: Ánh sáng, Kết cấu, Viền, Cũ hỏng, Dấu ngày) và **Máy ảnh retro** (12 máy gộp sẵn filter + lớp phủ, chạm lại để xáo) là hai mục riêng trong màn Chỉnh. Danh sách: [filters.md](filters.md). **MVP** — làm trước **5 filter** để thử nghiệm, bổ sung dần sau. Chi tiết: [filters.md](filters.md).
- **Phạm vi áp dụng:** mặc định chỉnh **từng ảnh**. Có ô tick **"Áp dụng cho tất cả ảnh"** — **chỉ áp filter** (không áp thông số chỉnh tay), có **hộp thoại xác nhận** trước khi áp. **MVP**
- **Tùy chỉnh:** lưu bộ chỉnh của mình thành preset riêng. **Sau**
- Copy / dán bộ chỉnh giữa các ảnh. **Sau**
- Nhập file LUT. **Cân nhắc**

## 6. Phần tử thêm vào — `Đã chốt`

- **Text:** font, cỡ, màu, căn lề, giãn chữ, viền chữ, bóng, nền chữ; hỗ trợ tiếng Việt có dấu. **MVP**
  - Font lấy từ **Google Fonts** (chọn một bộ font có hỗ trợ tiếng Việt), **tự host trong app** để dùng được offline và export không bị lỗi font.
- **Ảnh khác:** chèn thêm ảnh, đặt tự do. **MVP**
- **Hình khối:** chữ nhật, tròn, đường kẻ, mũi tên. **MVP**
- **Icon.** **MVP**
- **Khung:** polaroid, cuộn film… (vài khung cơ bản). **MVP**
- **Sticker, emoji.** **Sau** — **thư viện riêng** của app: tải sticker từ các nguồn miễn phí, đưa vào app. Chỉ dùng nguồn có giấy phép cho phép dùng lại (CC0, CC BY, OFL…); ghi nguồn và giấy phép trong trang "Credits".
- **Material / chất liệu:** giấy, băng dính washi, giấy xé, texture. **Sau**
- **Text nâng cao:** chữ uốn cong, text style có sẵn. **Sau**

> Phân tích đầy đủ các dạng layout (mục 7–11): [layouts.md](layouts.md).

## 7. Chia ảnh / Carousel — `Đã chốt`

- Một ảnh panorama trải ra N slide; khi vuốt trên Instagram, ảnh nối liền.
- **Carousel liền mạch:** mọi phần tử đều có thể đặt vắt qua ranh giới giữa hai slide.

## 8. Layout / Collage — `Đã chốt`

- Template chia ô có sẵn (2, 3, 4, 6 ô…).
- Thư viện template trên trang chủ: **98 mẫu** theo nhóm (Mùa thu & Halloween, Thường ngày, Bưu thiếp du lịch, Chụp bằng phim, Tạp chí, Sổ tay, Liền mạch, Collage, Dịp đặc biệt, Story, Tối giản, Lưới profile), xem trước bằng ảnh thật (Pexels). Xem [2026-10-28](../discussions/2026-10-28-template-anh-that.md).
- Chỉnh khoảng cách giữa các ô, bo góc, màu nền.
- Thả ảnh vào ô, kéo để chỉnh vùng hiển thị trong ô.

## 9. Ảnh chồng lớp (scrapbook) — `Đã chốt`

- Đặt ảnh tự do, xoay, chồng lên nhau, kết hợp với khung, material, đổ bóng.

## 10. Viền & nền — `Đã chốt`

- Viền ảnh (màu, độ dày, bo góc). **MVP**
- Nền màu trơn, gradient, ảnh làm mờ (blur fill). **MVP**
- Nền texture / pattern. **Sau**

## 11. Cắt lưới profile (puzzle grid) — `Đã chốt`

- Một ảnh lớn cắt thành 3 × N ô; đăng lần lượt sẽ ghép thành ảnh lớn trên trang cá nhân.
- File đặt tên theo **thứ tự đăng** (ô dưới cùng bên phải đăng trước), có sơ đồ hướng dẫn.

## 12. Xem trước kiểu Instagram — `Đề xuất`

- Mô phỏng vuốt carousel như trên app.
- Mô phỏng lưới trang cá nhân.

## 13. Tải về — `Đã chốt`

- Mobile (ưu tiên): lưu thẳng vào thư viện ảnh qua menu chia sẻ của hệ điều hành; ZIP là phương án dự phòng.
- Desktop: tải ZIP hoặc từng ảnh.
- File đặt tên theo thứ tự (`_01`, `_02`…).
- Sau khi tải: hiện hướng dẫn ngắn cách đăng đúng thứ tự và đúng tỉ lệ.

## 14. Lưu project & "Project của tôi" — `Đã chốt` **MVP**

- Tự động lưu project ngay trên máy (IndexedDB), gồm: ảnh (bản đã thu nhỏ), thông số chỉnh sửa, lịch sử undo / redo.
- Mở lại app → xem và sửa tiếp đầy đủ, kể cả khi đã xóa ảnh gốc trong thư viện điện thoại.
- **Nhiều project.** Màn hình **"Project của tôi"**:
  - Danh sách project kèm ảnh thu nhỏ, loại (Post / Story), ngày sửa.
  - Dung lượng từng project và tổng dung lượng đã dùng.
  - Mở, đổi tên, xóa project.
- Không lưu lên server.
- **Không làm** xuất / nhập file project (sao lưu, chuyển máy) trong giai đoạn này.

## 15. Story (9:16) — `Đã chốt`

- Là một loại project, chọn ở bước đầu (xem mục 2). Dùng chung toàn bộ công cụ với Post.
- Khác Post: khung 9:16, có vùng an toàn, các khung Story không vuốt liền mạch như carousel (người xem chạm để chuyển).

## 16. Lịch sử thay đổi (History, Undo / Redo) — `Đã chốt` **MVP**

- Nút **Back (undo)** và **Next (redo)** để quay lại / làm lại các thay đổi.
- **Không lưu từng bước nhỏ.** Ví dụ khi kéo thanh trượt Hue, ảnh đổi theo ngay để xem trước, nhưng **chưa ghi vào lịch sử**.
- **Nút xác nhận:** khi chỉnh hiệu ứng / thông số, có nút **Áp dụng (✓)** và **Hủy (✕)**.
  - Áp dụng → ghi **một** bước vào lịch sử.
  - Hủy → trở về giá trị trước khi mở công cụ.
- **Nhớ giá trị:** mở lại công cụ (ví dụ Hue) sẽ thấy giá trị đang áp dụng trước đó, chỉnh tiếp từ đó.
- **Không sửa file gốc.** Ảnh gốc luôn giữ nguyên; mọi chỉnh sửa chỉ là thông số lưu kèm và có thể sửa / bỏ bất cứ lúc nào.
- Thao tác kéo, phóng to, xoay phần tử: ghi một bước khi **thả tay** (kết thúc cử chỉ), không ghi trong lúc đang kéo. *(Đề xuất)*
- **Không giới hạn số bước.**
- Chỉ có nút Back / Next, **không có danh sách lịch sử** để nhảy tới bước bất kỳ.
- Giữ lại project và lịch sử sau khi đóng app / tải lại trang: **nên có** nếu làm được, không bắt buộc. Xem mục 14.
