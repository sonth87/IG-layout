# 13 — So sánh với app hiện tại, lộ trình và câu hỏi mở

## 1. App hiện tại đang ở đâu

Ứng dụng hiện tại (sau M13) đã có phần lớn **năng lực** cần thiết: canvas dải slide liền nhau và xuất cắt đúng ranh giới; ảnh, chữ (78 phông tiếng Việt), sticker và emoji, hình, khung, nét vẽ; 25 bộ lọc và 13 thông số chỉnh màu; xoá nền trên máy; video có cắt đoạn, tốc độ, âm thanh, chuyển động, nhạc nền; xuất ảnh, video từng slide và video 9:16; lưu tự động, hoàn tác không giới hạn, chạy offline; giao diện sáng / tối theo hệ thống.

Cái còn thiếu chủ yếu là **cách tổ chức và cách thao tác**:

- **Mô hình dữ liệu phẳng.** Ô của layout hiện là các ảnh rời nhau; không có "khối bố cục" để chọn và thao tác cả cụm. Đây là gốc của việc không làm được quy tắc chọn cha → con.
- **Cử chỉ đoán theo vị trí ngón tay.** Chụm lên ảnh thì phóng ảnh, chụm chỗ trống thì phóng canvas — gây nhầm lẫn mà chủ dự án đã gặp.
- **Zoom vừa một slide** thay vì thấy hết slide; quản lý slide nằm ở dải thumbnail dưới canvas thay vì nút ngay dưới từng slide.
- **Thanh công cụ ngắn (≤ 5 nút)** và các chức năng vị trí / kiểu nằm rải rác ở nhiều chỗ.
- **Thêm ảnh vào ô từng ảnh một**, chưa chọn nhiều theo số ô trống.
- **Bottom sheet cố định**, không đẩy canvas lên.
- **Trang chủ hai tab đơn giản**, chưa có banner, nhóm trượt ngang, màn chi tiết template riêng.
- **Phong cách** chưa theo kiểu kính mờ, nút nổi bo tròn.

## 2. Lộ trình đề xuất (D-87)

Thứ tự được chọn sao cho mỗi mốc là nền cho mốc sau, và những thay đổi người dùng cảm nhận rõ nhất (chọn / cử chỉ) đến sớm nhất.

**M14 — Khối bố cục và mô hình chọn.** Thêm khái niệm khối bố cục chứa ô vào dữ liệu và chuyển đổi các dự án cũ; viết lại cách chọn theo quy tắc cha → con; phân xử cử chỉ (không chọn = canvas, có chọn = phần tử); khung chọn mới với thanh giữa cạnh, nút xoay phía dưới, khung bao ảnh trong ô; thước đo kích thước bằng nhau. Tài liệu: [02](02-khai-niem-va-du-lieu.md), [06](06-chon-va-cu-chi.md), [07](07-khung-chon-va-thanh-cong-cu.md) mục 1–4.

**M15 — Canvas và slide.** Zoom "thấy hết slide" có mức nhỏ nhất bật lại; nút ‖ ⋯ dưới slide, nút + sau slide cuối; menu slide (thêm trái / phải, nhân bản, xoá); kéo đổi chỗ slide; sheet Slide mới. Tài liệu: [05](05-canvas-va-slide.md).

**M16 — Thêm ảnh.** Sheet Lấp đầy khung; chọn nhiều theo số ô trống; thứ tự điền; nút Ảnh thêm ảnh tự do vào slide đang xem; Thay. Tài liệu: [09](09-anh-va-video.md) mục 1–3.

**M17 — Thanh công cụ và các sheet.** Thanh công cụ theo đối tượng, trượt ngang, có ✕; sheet Vị trí, Kiểu, bảng màu chung, Bố cục, Điều chỉnh; bottom sheet kéo 50 – 95 % và đẩy canvas lên. Tài liệu: [07](07-khung-chon-va-thanh-cong-cu.md) mục 5, [08](08-cac-sheet-chinh-sua.md), [12](12-sheet-menu-xuat-lop.md) mục 1.

**M18 — Giao diện, trang chủ, tạo dự án.** Phong cách kính mờ, nút nổi ở cả chế độ sáng và tối; trang chủ mới; màn chi tiết template; sheet tạo dự án với tỉ lệ khác và tuỳ chỉnh. Tài liệu: [01](01-giao-dien.md), [03](03-trang-chu-va-template.md), [04](04-tao-du-an.md).

**M19 — Chữ, chỉnh ảnh, thư viện, xuất.** Gõ chữ trực tiếp và sheet Định dạng; màn Chỉnh ảnh toàn màn hình; Công cụ nền mở rộng; menu "+" và thư viện Hình / Khung / Widget / Brand Kit theo nhóm; Nền có chất liệu và chuyển màu tuỳ chỉnh; Xem trước; màn Xuất mới; bảng Lớp có thumbnail. Tài liệu: [09](09-anh-va-video.md) mục 5–6, [10](10-chu.md), [11](11-thu-vien.md), [12](12-sheet-menu-xuat-lop.md) mục 2–6.

**M20 — Mở rộng thư viện** (D-104). Khung có lớp trang trí đè lên ảnh và khung nhiều cửa sổ, thêm sticker scrapbook, hình (nhóm Mực), widget, lớp phủ / chất liệu, phông thương hiệu. Phạm vi đang bàn: [2026-10-17-m20-mo-rong-thu-vien.md](../../discussions/2026-10-17-m20-mo-rong-thu-vien.md).

**M21 — Công cụ sáng tạo** (D-105). Bộ filter lớn chia nhóm; hiệu ứng tĩnh (gương, xoáy, nước, lửa, chảy màu, loang màu…) áp cho ảnh, chữ hay bất kỳ phần tử nào; vẽ tay / viết tay. Sẽ bàn chi tiết khi tới.

**M23 — Liquid glass** (D-109). Thanh công cụ, menu nổi, sheet dùng kính kiểu thấu kính Apple (mép kính khúc xạ, có tán sắc, lòng kính phẳng) từ thư viện của chủ dự án. Cài đặt có lựa chọn **Tint / Trong suốt** (và tắt), máy yếu dùng kiểu nhẹ.
- **Lưu ý kỹ thuật:** hiệu ứng thấu kính dùng SVG filter trong `backdrop-filter`, hiện **chỉ Chromium chạy được**. Safari (và mọi trình duyệt trên iPhone / iPad, vì đều dùng nhân Safari) sẽ lùi về kính mờ thường.
- **Chốt (2026-10-17):** **không** tự khúc xạ bằng WebGL (sợ nặng). Dựa hoàn toàn vào thư viện của chủ dự án: Chromium có thấu kính, Safari lùi về kính mờ. Người dùng **tự tắt được** trong Cài đặt để nhẹ máy.

**M22 — Xoá vật thể.** Tô lên vật thể để máy tự xoá và vẽ lại nền phía sau, chạy trên máy (mô hình ~200 MB, tải lần đầu khi dùng, như xoá nền). Làm sau cùng (Q-E8). Tài liệu: [09](09-anh-va-video.md) mục 3.

Mỗi mốc kết thúc bằng: kiểm thử tự động cho các tiêu chí nghiệm thu của tài liệu tương ứng, ảnh chụp màn hình cả hai chế độ sáng / tối, và chủ dự án thử trên điện thoại.

## 3. Câu hỏi đã chốt (2026-10-17)

- **Q-E2 — Nút Ảnh.** Bấm nút Ảnh ở thanh công cụ (không phải chạm vào ô trống) thì luôn **thêm ảnh tự do**, không điền vào ô trống. → [09](09-anh-va-video.md) mục 2.
- **Q-E3 — Chạm phần tử khác khi đang chọn.** **Chuyển sang chọn phần tử đó luôn**; chạm chỗ không thuộc phần tử nào thì bỏ chọn. → [06](06-chon-va-cu-chi.md) quy tắc 5.
- **Q-E5 — Kéo bottom sheet.** Thả ở **0 – 20 %** → đóng; **20 – 50 %** → bật về 50 %. → [12](12-sheet-menu-xuat-lop.md) mục 1.1.
- **Q-E6 — Nút chính.** Giữ màu nhấn hiện tại. → [01](01-giao-dien.md).
- **Q-E7 — Ba tab đáy.** Đồng ý **Trang chủ / Dự án / Cài đặt**. → [03](03-trang-chu-va-template.md).
- **Q-E1 — Chạm ô ảnh trống.** Ô đứng riêng trên slide trắng: chạm là chọn luôn ô đó. Ô trong lưới / template: chạm **trúng dấu +** → mở ngay "Lấp đầy khung"; chạm chỗ khác của ô → chọn cha (vì chưa có ảnh để đi vào). → [06](06-chon-va-cu-chi.md) quy tắc 6.
- **Q-E4 — Thẻ cạnh "Tiếp tục".** Thêm thẻ **"Tạo mới"**. → [03](03-trang-chu-va-template.md).
- **Q-E8 — Xoá vật thể.** Làm, **để sau cùng** (M22, D-105).

## 4. Câu hỏi còn mở

- **Q-E9 — Template ghép từ nhiều khung (như IMG_4036).** Bốn khung giấy xé trong template là **bốn phần tử riêng** (chạm lần đầu chọn từng mảnh giấy, kéo đi được từng mảnh), hay được **gom thành một nhóm** (chạm lần đầu chọn cả nhóm bốn mảnh, chạm lần nữa mới chọn từng mảnh — giống khối lưới)?
