# 03 — Trang chủ và template

Ảnh tham chiếu: IMG_3937 → IMG_3952 (trang chủ), IMG_4003 → IMG_4005 (chi tiết template và sau khi dùng). Video: 0:00 → 1:43.

## 1. Mục đích

Trang chủ là nơi người dùng tìm cảm hứng và chọn một template để bắt đầu. Theo mô tả của chủ dự án, người dùng **kéo dọc để xem các nhóm template**, và **trượt ngang trong từng nhóm để xem thêm template của nhóm đó** [CDA]. Trang chủ cũng là nơi tiếp tục dự án đang làm dở và tạo dự án mới.

## 2. Bố cục từ trên xuống

### 2.1 Thanh trên

Ở trên cùng là một thanh **nổi** đè lên nội dung, nền trong suốt có làm mờ phía sau, nên khi cuộn trang thì nội dung trôi bên dưới thanh mà thanh vẫn đứng yên. Thanh có ba thành phần. Bên trái là một nút tròn có icon **trái tim**, dẫn tới danh sách template đã được người dùng thích. Ở giữa là một **công tắc hai tab** hình viên thuốc, hai tab là **"Dành cho bạn"** và **"Khám phá"**; tab đang mở có nền sáng hơn nổi lên như một viên thuốc nhỏ nằm trong viên thuốc lớn. Bên phải là một nút tròn có icon **kính lúp** để tìm kiếm [QS].

### 2.2 Banner

Ngay dưới (và nằm sau) thanh trên là một **banner lớn** chiếm khoảng 55 % chiều cao màn hình, kéo hết chiều ngang. Banner là một ảnh ghép đẹp làm nền, phía dưới có **tiêu đề chữ rất lớn** (ví dụ "TOP TEMPLATES", "Make It a Story", "Piece together your favorite memories"), một dòng phụ nhỏ hơn, và một **nút trắng bo tròn** "Khám phá ngay". Có ba banner, người dùng **vuốt ngang** để chuyển; dưới banner là **ba chấm chỉ trang**, chấm của banner hiện tại dài hơn các chấm khác. Chạm "Khám phá ngay" mở màn danh sách đầy đủ của nhóm mà banner đó giới thiệu [QS]. [ĐX] Banner tự chuyển sau mỗi 6 giây nếu người dùng không chạm vào.

### 2.3 Hàng thẻ "Tiếp tục"

Dưới banner là một hàng hai thẻ nhỏ nằm ngang, bo góc. Thẻ trái là **"Tiếp tục"**: có thumbnail nhỏ của dự án được mở gần nhất, tên "Tiếp tục" và dòng phụ là thời gian ("2 giờ trước"). Chạm vào mở lại đúng dự án đó trong editor. Thẻ này **ẩn** khi người dùng chưa có dự án nào [QS]. Thẻ phải trong tham chiếu là "kết nối tài khoản mạng xã hội" — **bỏ**; đề xuất thay bằng thẻ **"Tạo mới"** mở luồng tạo dự án (câu hỏi Q-E4) [ĐX].

### 2.4 Các nhóm template

Phần chính của trang là **danh sách các nhóm template** xếp dọc. Mỗi nhóm có một dòng tiêu đề chữ đậm (khoảng 17 px) với một **mũi tên ›** ở mép phải, và dưới tiêu đề là một dòng mô tả ngắn chữ nhỏ màu nhạt. Dưới phần tiêu đề là một **dải thẻ template trượt ngang** [CDA]: mỗi thẻ rộng khoảng 45 % chiều ngang màn hình, chiều cao theo tỉ lệ của template (thẻ template 4:5 thấp hơn thẻ template 9:16), các thẻ cách nhau khoảng 8 px, và thẻ cuối cùng trên màn hình chỉ lộ một phần để người dùng biết còn nữa nếu trượt sang.

Ví dụ các nhóm quan sát được, kèm ý nghĩa: "Gợi ý cho bạn" (template phù hợp với người dùng), "Hằng ngày" (template dùng thường xuyên), "Thời trang", "Bưu thiếp" (khoe những nơi đã đến), "Chụp bằng phim" (cảm giác ảnh phim analog), "Từ kho lưu trữ" (kỷ niệm phong cách tạp chí), "Nét vẽ tay" (template có chi tiết vẽ tay), "Dịp đặc biệt" (sinh nhật, kỷ niệm), "Nhật ký scrapbook" (ghép kỷ niệm), "Tối giản" (tối giản và liền mạch), "Làm story" [QS]. App mình dùng tên và nội dung nhóm của riêng mình; bộ nhóm hiện có (Carousel, Liền mạch, Collage, Story, Tối giản, Lưới profile) có thể đổi tên và tách nhỏ cho phong phú hơn.

Chạm vào **tiêu đề nhóm hoặc mũi tên ›** mở một màn con trượt từ phải sang: tiêu đề nhóm ở trên cùng với nút ‹ quay lại, bên dưới là toàn bộ template của nhóm trong **lưới hai cột**.

### 2.5 Khám phá thêm

Cuối trang chủ là nhóm **"Khám phá thêm"**. Khác với các nhóm phía trên, nhóm này hiển thị template trong một **lưới so le hai cột** (masonry — các thẻ cao thấp khác nhau theo tỉ lệ nên hai cột không thẳng hàng), cuộn tới đâu hiện tới đó [QS].

### 2.6 Thanh điều hướng đáy

Ở đáy màn hình là một **thanh điều hướng nổi**: một viên thuốc chứa ba icon — **Trang chủ**, **Dự án** (thư mục) và **Cài đặt** (tham chiếu là "Tài khoản"; app mình không có tài khoản nên đổi thành Cài đặt [ĐX]) — và tách riêng bên phải là một **nút tròn có dấu +** để tạo dự án mới. Icon của tab đang mở có nền sáng hơn. Thanh nằm cách đáy khoảng 20 px (cộng vùng an toàn của máy có tai thỏ). Trong tham chiếu còn có một thẻ quảng cáo gói trả phí nổi ngay trên thanh này — **bỏ**.

## 3. Thẻ template

Mỗi thẻ hiển thị **ảnh bìa** là slide đầu tiên của template, có ảnh mẫu. Ở góc trên bên phải có một nút **trái tim** trong vòng tròn mờ; chạm vào để thích hoặc bỏ thích — chạm vào trái tim **không** mở template. Ở góc dưới bên trái có hai **nhãn viên thuốc nhỏ**: một nhãn có icon ảnh kèm **số ô ảnh** của template, một nhãn có icon khung kèm **số slide** (ví dụ "🖼 12 ▢ 6" nghĩa là 12 ô ảnh trên 6 slide). Nếu template có nhiều slide, góc dưới bên phải có **ba chấm nhỏ** gợi ý rằng template có thể xem theo từng slide [QS].

## 4. Hai tab, tìm kiếm và yêu thích

Tab **"Dành cho bạn"** hiển thị bố cục đã mô tả ở trên: banner, hàng Tiếp tục, các nhóm, Khám phá thêm. Vì ứng dụng không có máy chủ, "gợi ý" được tính ngay trên máy: các nhóm có template người dùng đã thích hoặc đã dùng gần đây được đưa lên trước [ĐX].

Tab **"Khám phá"** hiển thị toàn bộ template trong lưới so le hai cột, phía trên có một hàng **chip nhóm** trượt ngang để lọc theo nhóm [ĐX — tham chiếu không thể hiện rõ nội dung tab này].

Nút **kính lúp** mở màn tìm kiếm: ô nhập ở trên (bàn phím bật sẵn), gõ tên template, tên nhóm hoặc từ khoá (ví dụ "biển", "sinh nhật", "phim") để lọc; kết quả hiển thị dạng lưới so le hai cột; khi chưa gõ gì thì hiện danh sách nhóm để chạm nhanh [ĐX].

Nút **trái tim** trên thanh trên mở danh sách template đã thích, dạng lưới hai cột; danh sách trống thì hiện lời nhắc "Chạm ♡ trên template để lưu vào đây". Dữ liệu thích lưu trên máy [ĐX].

## 5. Màn chi tiết template [CDA][QS]

Chạm vào một thẻ template sẽ mở **màn chi tiết** trượt từ phải sang. Mục đích của màn này, theo chủ dự án, là để người dùng **xem được template đó trông như thế nào, các slide ra sao, gồm những thành phần gì, kèm ảnh mẫu** trước khi quyết định dùng.

Trên cùng là thanh tiêu đề với nút **‹** quay lại ở bên trái và chữ "Template" ở giữa. Phần lớn màn hình (khoảng 60 % chiều cao, gần hết chiều ngang, bo góc) là **khung xem trước** hiển thị một slide của template với ảnh mẫu. Người dùng **vuốt ngang** để xem lần lượt từng slide; ở mép dưới bên trong khung có **chấm chỉ slide** cho biết đang ở slide nào.

Dưới khung xem trước là một hàng **nhãn viên thuốc**: tỉ lệ ("Dọc", "Story", "Vuông"…), số ô ảnh và số slide. Tiếp theo trong tham chiếu là hàng thông tin tác giả và nút mạng xã hội — **bỏ**. Bên dưới là mục **"Template tương tự"**: lưới so le hai cột các template cùng nhóm; chạm vào một template tương tự mở màn chi tiết của template đó (chồng thêm một màn, quay lại thì về template trước).

Ở đáy màn có một **thanh cố định** không cuộn theo nội dung: nút lớn màu trắng **"Dùng template"** chiếm phần lớn chiều ngang, bên phải là nút tròn **chia sẻ** và nút tròn **trái tim**. Nút chia sẻ trong tham chiếu dùng để gửi liên kết template — cần máy chủ nên **bỏ**, hoặc thay bằng chia sẻ ảnh xem trước của template [ĐX].

## 6. "Dùng template" [CDA]

Khi người dùng chạm **"Dùng template"**, ứng dụng tạo một **dự án mới** từ template và mở thẳng vào editor. Dự án mới có đúng tỉ lệ khung, đúng số slide, đúng nền, và **toàn bộ** khối bố cục, chữ, hình, sticker, khung, widget mà template sử dụng, ở đúng vị trí, kiểu và lớp. Điều duy nhất **không** được mang sang là **ảnh mẫu**: mọi ô ảnh của template trở thành ô trống với nền xám và dấu + ở giữa (IMG_4005). Chữ mẫu được giữ nguyên để người dùng sửa. Editor mở ở mức zoom "thấy hết các slide" (xem [05](05-canvas-va-slide.md)), không chọn sẵn phần tử nào. Tên dự án mặc định là tên template.

## 7. Trường hợp đặc biệt

Nếu một template dùng phông chữ chưa được tải về máy, các chữ hiện tạm bằng phông dự phòng và đổi sang đúng phông ngay khi tải xong (đã có cơ chế này). Nếu đang mất mạng và phông chưa từng được tải, chữ giữ phông dự phòng cho tới khi có mạng; ứng dụng không chặn việc dùng template. Ảnh xem trước của template là một phần của ứng dụng (không tải từ máy chủ), nên trang chủ xem được khi không có mạng.

## 8. Tiêu chí nghiệm thu

1. Trang chủ có banner vuốt ngang được, chấm chỉ trang đổi theo, nút "Khám phá ngay" mở đúng nhóm.
2. Có dự án → thẻ "Tiếp tục" hiện và mở đúng dự án gần nhất; chưa có dự án → thẻ ẩn.
3. Kéo dọc thấy các nhóm; trượt ngang trong một nhóm không làm trang cuộn dọc.
4. Chạm tiêu đề nhóm → màn lưới đầy đủ của nhóm, nút ‹ quay về đúng vị trí cũ trên trang chủ.
5. Thẻ có nhãn số ô ảnh và số slide đúng; chạm trái tim đổi trạng thái thích mà không mở template.
6. Màn chi tiết vuốt ngang xem được từng slide có ảnh mẫu.
7. "Dùng template" tạo dự án có đủ mọi phần tử của template, mọi ô ảnh trống có dấu +, chữ giữ nguyên.
8. Tìm "sinh nhật" ra template thuộc nhóm dịp đặc biệt.
