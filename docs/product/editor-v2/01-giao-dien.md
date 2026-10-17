# 01 — Giao diện: chế độ sáng / tối và phong cách

## 1. Chế độ sáng và tối [CDA]

Ứng dụng có hai chế độ hiển thị là **Sáng** và **Tối**, và **mặc định đi theo cài đặt của hệ thống**. Nếu điện thoại đang để giao diện tối thì ứng dụng hiện tối; nếu đang sáng thì hiện sáng. Khi người dùng đổi chế độ của hệ thống trong lúc ứng dụng đang mở (ví dụ điện thoại tự chuyển sang tối lúc chiều tối), ứng dụng phải đổi theo ngay mà không cần tải lại trang. Trong màn Cài đặt vẫn giữ lựa chọn hiện có: "Theo hệ thống" (mặc định), "Sáng", "Tối"; khi người dùng chọn cố định Sáng hoặc Tối thì ứng dụng không còn đi theo hệ thống nữa.

Toàn bộ ảnh tham chiếu đều chụp ở chế độ tối, nên bố cục và phong cách dưới đây được mô tả theo chế độ tối trước. Chế độ sáng là bản đối ứng giữ nguyên bố cục, kích thước và chuyển động, chỉ đổi bảng màu: nền sáng, panel trắng hoặc xám rất nhạt, chữ và icon màu tối. Mọi màn, mọi bottom sheet, mọi popup trong bộ đặc tả này đều phải dùng được ở cả hai chế độ; không có màn nào "chỉ tối".

## 2. Bảng màu

Ở **chế độ tối**, vùng làm việc của editor có nền đen gần như tuyệt đối (khoảng #000 đến #111) để slide — thường là trắng hoặc là ảnh — nổi bật hẳn lên. Các thanh, nhóm nút và bottom sheet dùng màu xám đậm bán trong suốt (độ đục khoảng 85 %) kèm hiệu ứng **làm mờ phần phía sau** (kiểu kính mờ), nên khi một thanh nổi đè lên ảnh, ta vẫn lờ mờ thấy ảnh bên dưới nhưng chữ trên thanh vẫn đọc rõ. Chữ chính màu trắng, chữ phụ (mô tả nhóm, nhãn số) màu xám nhạt. Ô chọn trong các thư viện (sticker, hình, khung) có nền xám đậm hơn nền sheet một bậc.

Ở **chế độ sáng** [ĐX], vùng làm việc của editor dùng xám rất nhạt (khoảng #ECECEF) thay vì trắng, để slide trắng vẫn tách khỏi nền. Thanh và sheet là trắng bán trong suốt có làm mờ phía sau. Chữ chính gần đen, chữ phụ xám trung tính. Ô chọn trong thư viện có nền xám nhạt.

Ở cả hai chế độ, màu nhấn (nút chính, mục đang chọn, viền khung chọn) giữ nhất quán. Tham chiếu dùng trắng làm màu nút chính trên nền tối ("Explore Now", "Use Template" là nút trắng chữ đen); app mình có thể giữ màu nhấn hiện tại (vàng hổ phách) cho nút chính, nhưng các thành phần còn lại theo phong cách mô tả ở đây. Đây là điểm cần chủ dự án chọn (xem câu hỏi Q-E6 trong [13](13-lo-trinh-va-cau-hoi.md)).

## 3. Hình khối và kích thước

Phong cách đặc trưng là **mọi nhóm nút đều là khối bo tròn hoàn toàn và nổi lên**, không dính sát mép màn hình. Các nhóm nút trên cùng của editor (nút quay lại, nhóm hoàn tác – làm lại – menu, nút xuất) là những viên thuốc hoặc hình tròn đặt cách mép trái / phải khoảng 12–16 px. Thanh công cụ ở đáy cũng là một viên thuốc nổi cách đáy và cách mép trái khoảng 16 px, chứ không phải một dải kéo hết chiều ngang như kiểu thanh tab truyền thống. Nút tròn đơn lẻ có đường kính khoảng 40–44 px; vùng chạm của mọi nút không nhỏ hơn 44 × 44 px để dễ bấm bằng ngón tay. Icon dùng nét mảnh khoảng 1,5 px, kích thước khoảng 20–22 px, cùng một bộ icon trên toàn ứng dụng.

Bottom sheet bo góc trên khoảng 28 px. Ở giữa mép trên có một **tay cầm** ngang nhỏ (khoảng 36 × 5 px, bo tròn) báo hiệu sheet kéo được. Tiêu đề sheet căn giữa, chữ khoảng 17 px đậm vừa. Nút đóng **✕** là một nút tròn nhỏ ở phía phải hàng tiêu đề. Khi sheet đang hiển thị một màn con (ví dụ danh sách đầy đủ của một nhóm hình), phía trái hàng tiêu đề có nút **‹** để quay lại.

Thẻ ảnh và thẻ template bo góc khoảng 10–12 px. Ô trong các lưới thư viện là hình vuông bo góc khoảng 14 px, xếp 4 cột, khoảng cách giữa các ô khoảng 8 px. Nhãn chữ dưới icon trên thanh công cụ khoảng 11–12 px.

## 4. Chuyển động

Chuyển động giúp người dùng hiểu mình đang đi đâu. Màn con (ví dụ chi tiết template, danh sách đủ của một nhóm) **trượt từ phải sang** che màn cũ, và khi quay lại thì trượt về phía phải — giống điều hướng của iOS. Bottom sheet **trượt từ dưới lên** và có thể kéo lên xuống bằng tay (xem [12](12-sheet-menu-xuat-lop.md)). Popup menu (menu "⋯" dưới slide, menu "⋯" trên cùng) **phóng nhẹ ra từ chính nút được bấm** rồi thu lại về nút khi đóng. Màn xem trước mở ra theo kiểu phóng to từ nút. Các thay đổi zoom của canvas (ví dụ khi thêm slide và canvas tự thu nhỏ) chạy mượt trong khoảng 250 ms chứ không nhảy cóc. Mọi chuyển động phải tắt hoặc rút ngắn khi người dùng bật "Giảm chuyển động" trong cài đặt hệ thống.

## 5. Tiêu chí nghiệm thu

1. Đặt điện thoại ở chế độ tối rồi mở ứng dụng: ứng dụng hiện tối. Trong lúc đang mở, chuyển điện thoại sang sáng: ứng dụng đổi sang sáng ngay.
2. Chọn "Sáng" trong Cài đặt rồi chuyển điện thoại sang tối: ứng dụng vẫn sáng.
3. Đi qua toàn bộ các màn trong bộ đặc tả ở cả hai chế độ: không có chữ hay icon nào bị chìm vào nền (độ tương phản chữ thường ≥ 4,5 : 1).
4. Mọi nút có vùng chạm ≥ 44 × 44 px.
5. Bật "Giảm chuyển động" của hệ thống: các hiệu ứng trượt / phóng được thay bằng hiện mờ nhanh hoặc tắt.
