# Editor v2 — bộ đặc tả

> Ngày lập: 2026-10-17. Trạng thái: **đã chốt hướng (D-86, D-87)**, chờ chủ dự án duyệt thứ tự triển khai và trả lời các câu hỏi mở.

## Bộ tài liệu này để làm gì

Đây là bộ đặc tả cho thế hệ thứ hai của trình chỉnh sửa (editor) và các màn xung quanh nó: trang chủ, màn chi tiết template, luồng tạo dự án. Nó được viết để một người chưa từng thấy ảnh tham chiếu vẫn có thể **triển khai đúng** và **kiểm thử được**: mỗi màn đều được mô tả bố cục, vị trí và kích thước tương đối của từng thành phần; mỗi thao tác đều có diễn biến từng bước, các tình huống đặc biệt và tiêu chí để biết khi nào là "làm xong".

Nội dung được tổng hợp từ hai nguồn. Nguồn thứ nhất là **mô tả chi tiết của chủ dự án** ngày 2026-10-17, được chép lại nguyên văn trong [Phụ lục A](phu-luc-a-nguyen-van.md) để không ý nào bị mất trong quá trình diễn giải. Nguồn thứ hai là **65 ảnh chụp màn hình và một video quay màn hình dài 11 phút 49 giây** của một ứng dụng tham chiếu, từ đó tôi trích ra 334 khung hình theo các điểm chuyển cảnh để xem từng thao tác. Ảnh và video gốc được giữ trong thư mục `refs/` trên máy của chủ dự án và **không đưa lên git**, vì đó là tài sản của bên khác. Để bù lại, [Phụ lục B](phu-luc-b-anh.md) mô tả nội dung từng ảnh và [Phụ lục C](phu-luc-c-video.md) ghi lại diễn biến của video theo mốc thời gian.

Trong toàn bộ bộ tài liệu, mỗi điều được đánh dấu nguồn của nó: **[CDA]** là điều chủ dự án mô tả hoặc yêu cầu trực tiếp; **[QS]** là điều tôi quan sát được trong ảnh hoặc video; **[ĐX]** là đề xuất của tôi, dùng để lấp chỗ mà nguồn không nói rõ — những chỗ này cần chủ dự án duyệt trước khi coi là đã chốt.

## Nguyên tắc chung

Chúng ta làm theo **cách hoạt động** của ứng dụng tham chiếu — luồng màn hình, cách chọn và thao tác, quy tắc xử lý — chứ không sao chép tài sản của họ. Màu sắc, bộ icon, câu chữ, ảnh mẫu và nội dung template đều là của mình (D-66). Những phần gắn với mô hình kinh doanh hoặc cần máy chủ đều **bỏ**: đăng nhập tài khoản, gói trả phí và các màn mời nâng cấp, kết nối và đăng thẳng lên mạng xã hội, lên lịch đăng bài, liên kết chia sẻ template, các công cụ AI phải chạy trên máy chủ. Ứng dụng của mình vẫn giữ những điểm khác biệt đã có: miễn phí hoàn toàn, không tài khoản, ảnh không rời khỏi máy, và chạy được khi không có mạng.

## Mục lục

| File | Nội dung |
|---|---|
| [01-giao-dien.md](01-giao-dien.md) | Chế độ sáng / tối theo hệ thống, phong cách hình ảnh, kích thước, chuyển động |
| [02-khai-niem-va-du-lieu.md](02-khai-niem-va-du-lieu.md) | Các khái niệm: dự án, slide, phần tử, khối bố cục, ô, quan hệ cha – con |
| [03-trang-chu-va-template.md](03-trang-chu-va-template.md) | Trang chủ, nhóm template, tìm kiếm, yêu thích, màn chi tiết template, "Dùng template" |
| [04-tao-du-an.md](04-tao-du-an.md) | Chọn tỉ lệ, tỉ lệ khác, kích thước tuỳ chỉnh |
| [05-canvas-va-slide.md](05-canvas-va-slide.md) | Bố cục màn editor, zoom "thấy hết slide", thêm / nhân bản / đổi chỗ / xoá slide |
| [06-chon-va-cu-chi.md](06-chon-va-cu-chi.md) | Mô hình chọn cha → con, cử chỉ dành cho phần tử hay canvas, chọn nhiều |
| [07-khung-chon-va-thanh-cong-cu.md](07-khung-chon-va-thanh-cong-cu.md) | Khung chọn, thanh nổi, nút xoay, thước đo bằng nhau, thanh công cụ theo đối tượng |
| [08-cac-sheet-chinh-sua.md](08-cac-sheet-chinh-sua.md) | Vị trí, Kiểu, bảng màu, Bố cục và Điều chỉnh của khối, Khoá / Nhân bản / Xoá |
| [09-anh-va-video.md](09-anh-va-video.md) | Lấp đầy khung, chọn nhiều ảnh và thứ tự điền, nút Ảnh, Thay, Cắt, màn Chỉnh ảnh, Công cụ nền |
| [10-chu.md](10-chu.md) | Thêm chữ, gõ trực tiếp, Định dạng, Căn lề |
| [11-thu-vien.md](11-thu-vien.md) | Menu "+", Sticker, Hình, Khung, Lưới, Widget, Brand Kit, Vẽ |
| [12-sheet-menu-xuat-lop.md](12-sheet-menu-xuat-lop.md) | Hành vi bottom sheet, menu "⋯", Nền, Tỉ lệ, Hít, Xem trước, Xuất, Lớp, Hoàn tác |
| [13-lo-trinh-va-cau-hoi.md](13-lo-trinh-va-cau-hoi.md) | So sánh với app hiện tại, lộ trình M14–M19, câu hỏi mở |
| [phu-luc-a-nguyen-van.md](phu-luc-a-nguyen-van.md) | Nguyên văn mô tả của chủ dự án |
| [phu-luc-b-anh.md](phu-luc-b-anh.md) | Mô tả từng ảnh tham chiếu |
| [phu-luc-c-video.md](phu-luc-c-video.md) | Diễn biến video theo mốc thời gian |
| [_ban-tom-tat.md](_ban-tom-tat.md) | Bản tóm tắt một trang (để tra nhanh) |

Tài liệu đi kèm:
- Cho đội phát triển: [docs/dev/editor-v2.md](../../dev/editor-v2.md) — kiến trúc, mô hình dữ liệu, máy trạng thái chọn, phân xử cử chỉ, thuật toán điền ảnh, chuyển đổi dữ liệu cũ, kế hoạch kiểm thử.
- Cho người dùng: [docs/user/huong-dan-editor-v2.md](../../user/huong-dan-editor-v2.md) — hướng dẫn dùng trình chỉnh sửa mới (áp dụng khi M14–M19 hoàn thành).
