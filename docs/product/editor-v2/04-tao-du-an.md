# 04 — Tạo dự án

Ảnh tham chiếu: IMG_3953 → IMG_3956. Video: 1:37 → 1:51.

## 1. Mục đích

Cho người dùng bắt đầu một bài đăng trống với **một kích cỡ có sẵn**, hoặc với **kích cỡ tuỳ chỉnh** nếu kích cỡ có sẵn không phù hợp [CDA]. Luồng này phải nhanh: chọn kích cỡ là vào thẳng editor, không hỏi thêm số slide (người dùng thêm slide sau trong editor).

## 2. Điểm vào

Nút tròn **+** trên thanh điều hướng đáy của trang chủ (và thẻ "Tạo mới" nếu được duyệt — Q-E4).

## 3. Bước 1 — sheet "Dự án mới"

Một bottom sheet trượt từ dưới lên, cao khoảng 30 % màn hình, có tiêu đề "Dự án mới" ở giữa và nút ✕ ở bên phải. Nội dung là **một hàng thẻ nằm ngang** có thể trượt ngang. Mỗi thẻ là một **hình chữ nhật được vẽ đúng tỉ lệ** mà nó đại diện — thẻ 9:16 cao và hẹp, thẻ 1:1 vuông, thẻ 1.91:1 thấp và rộng — tất cả **đứng chung một đường đáy** nên nhìn vào là hiểu ngay hình dạng khung. Bên trong thẻ ghi tỉ lệ (ví dụ "4:5"), bên dưới thẻ ghi tên ngắn. Thứ tự các thẻ:

1. **4:5 — Dọc** (khung bài đăng phổ biến nhất)
2. **3:4 — Dọc**
3. **9:16 — Story**
4. **1:1 — Vuông**
5. **1.91:1 — Ngang**
6. **W:H — Khác** (thẻ này ghi "W:H")
7. [ĐX] **Lưới profile** — loại dự án riêng của app mình (ghép một ảnh lớn trên lưới trang cá nhân 3 × N), giữ lại vì là tính năng sẵn có.

Chạm một thẻ có sẵn → sheet đóng, ứng dụng tạo dự án mới gồm **một slide trắng** đúng tỉ lệ và mở editor. Chạm **Lưới profile** → mở thêm lựa chọn số hàng và bù khe như hiện tại [ĐX].

## 4. Bước 2 — sheet "Khác"

Chạm thẻ **Khác** mở sheet thứ hai (thay thế sheet đầu) tên "Khác", là một **danh sách dọc**, mỗi dòng một tỉ lệ và có mũi tên › ở phải: **2:3, 3:2, 3:4, 4:3, 5:4, 5:6, 16:9**, và cuối cùng ngăn bởi một vạch là dòng **Tuỳ chỉnh**. Chạm một tỉ lệ → tạo dự án với tỉ lệ đó (chiều rộng 1080 px, chiều cao tính theo tỉ lệ) và mở editor.

Lưu ý cho thiết kế: Instagram chỉ hiển thị bài đăng trong khoảng tỉ lệ từ 1.91:1 đến 4:5 (story 9:16). Các tỉ lệ ngoài khoảng đó (ví dụ 2:3, 16:9 dọc) vẫn tạo được để dùng cho mục đích khác, nhưng nên có một dòng chú thích nhỏ "Instagram sẽ cắt về 4:5" ở các tỉ lệ dọc hơn 4:5 [ĐX].

## 5. Bước 3 — hộp thoại "Kích thước tuỳ chỉnh"

Chạm **Tuỳ chỉnh** mở một hộp thoại nổi ở giữa phía trên màn hình (bàn phím số bật sẵn ở dưới). Hộp thoại có tiêu đề "Kích thước tuỳ chỉnh", dòng giải thích **"Nhập chiều cao từ 565 đến 1920 px. Chiều rộng cố định là 1080 px."**, một **ô nhập "Chiều cao"** (chỉ nhận số), và hai nút **Huỷ** và **Tạo** nằm cạnh nhau.

Nút **Tạo** mờ đi khi ô trống. Khi người dùng nhập một số ngoài khoảng 565–1920 và chạm Tạo, ô chuyển viền đỏ và hiện lời nhắc "Chiều cao phải từ 565 đến 1920 px" ngay dưới ô, không tạo dự án. Số hợp lệ → tạo dự án 1080 × chiều cao đã nhập, một slide trắng, mở editor. **Huỷ** đóng hộp thoại, quay về sheet "Khác".

Con số 565 tương ứng với tỉ lệ 1.91:1 và 1920 tương ứng với 9:16 — đúng hai đầu khoảng tỉ lệ Instagram chấp nhận.

## 6. Dữ liệu

Dự án lưu tỉ lệ dưới dạng kích thước slide (1080 × chiều cao) thay vì chỉ một trong vài tỉ lệ cố định như hiện nay. Các dự án cũ (4:5, 3:4, 1:1, 9:16) chuyển đổi tự động sang kích thước tương ứng.

## 7. Tiêu chí nghiệm thu

1. Sheet "Dự án mới" có đủ các thẻ, mỗi thẻ vẽ đúng tỉ lệ và đứng chung đường đáy; trượt ngang được.
2. Chạm 4:5 → editor có đúng một slide trắng 1080 × 1350.
3. Khác → 16:9 → slide 1080 × 608.
4. Tuỳ chỉnh: nhập 564 hoặc 1921 → báo lỗi, không tạo; nhập 1200 → slide 1080 × 1200; Huỷ → quay lại danh sách "Khác".
5. Dự án cũ 3:4 mở ra đúng 1080 × 1440.
