# 09 — Ảnh và video: thêm, thay, cắt, chỉnh, công cụ nền

Ảnh tham chiếu: IMG_3971 → IMG_3974, IMG_3978. Video: 3:06 → 4:03 (thêm ảnh), 6:31 → 7:51 (chỉnh ảnh), 8:00 → 8:31 (thêm ảnh tự do, công cụ nền).

Có **hai cách thêm ảnh** với mục đích khác nhau: **điền vào ô trống** của bố cục (mục 1), và **thêm ảnh tự do** lên slide (mục 2).

## 1. Lấp đầy khung — điền ảnh vào ô trống [CDA][QS]

### 1.1 Mở sheet

Khi người dùng chạm vào một **ô trống** (ô có nền xám và dấu + — theo quy tắc ở [06](06-chon-va-cu-chi.md)), ứng dụng đánh dấu ô đó là **ô đang chọn** và mở bottom sheet **"Lấp đầy khung"** (IMG_3971). Sheet này thấp (khoảng 25 % màn hình), có tiêu đề ở giữa và nút ✕, nội dung là **ba nút tròn lớn** (đường kính khoảng 64 px, nền xám) xếp hàng ngang, mỗi nút có icon và nhãn bên dưới:

- **Ảnh** — chọn ảnh từ thư viện ảnh của máy.
- **Video** — chọn video từ thư viện (video được nén về 1080p như tính năng video đã có).
- **Tệp** — chọn ảnh hoặc video từ **trình quản lý tệp** của hệ thống: trên iOS là ứng dụng Tệp (Files), trên Android là trình chọn tệp của hệ thống [CDA].

Nếu người dùng đóng sheet mà không chọn gì, ô vẫn trống và vẫn là ô đang chọn; thanh công cụ đáy hiện thanh của ô trống (Thay · Vị trí · Kiểu) để có thể mở lại.

### 1.2 Chọn nhiều ảnh, tối đa bằng số ô trống [CDA]

Chạm **Ảnh** mở trình chọn ảnh cho phép **chọn nhiều ảnh một lúc**. Số ảnh tối đa được chọn bằng **tổng số ô đang trống trên toàn bộ dự án** — không chỉ trong slide hiện tại. Trong tham chiếu, trình chọn có tiêu đề **"Chọn tối đa N ảnh"**, hai tab **Ảnh** và **Bộ sưu tập**, nút ✕ ở trái, nút ✓ ở phải, và ở đáy có nút **"Đã chọn (k)"** để xem lại các ảnh đã đánh dấu (video 3:12 → 3:45).

Ghi chú kỹ thuật: ứng dụng web dùng trình chọn ảnh của hệ điều hành, không tự vẽ được tiêu đề "Chọn tối đa N ảnh" và không chặn được người dùng chọn quá N. Vì vậy: nếu người dùng chọn nhiều hơn N ảnh, ứng dụng dùng **N ảnh đầu tiên** theo thứ tự chọn và hiện thông báo ngắn "Đã dùng N ảnh cho N ô trống" [ĐX].

### 1.3 Thứ tự điền ảnh [CDA]

Các ảnh được chọn điền vào các ô trống theo thứ tự ưu tiên chủ dự án mô tả: **ô đang chọn trước, rồi đến các ô trống khác trong cùng slide, rồi đến các slide từ đầu đến cuối**.

Cụ thể, ứng dụng lập danh sách ô đích như sau:

1. Ô đang chọn (ô người dùng vừa chạm).
2. Các ô trống còn lại **trong cùng slide** với ô đang chọn, theo thứ tự của các ô trong bố cục (thứ tự đọc: từ trái sang phải, từ trên xuống dưới [ĐX]).
3. Các ô trống của **các slide khác**, đi **từ slide đầu tiên đến slide cuối cùng** (bỏ qua slide đã xét ở bước 2), trong mỗi slide theo thứ tự của các ô.

Rồi ảnh thứ nhất vào ô thứ nhất trong danh sách, ảnh thứ hai vào ô thứ hai, và cứ thế.

**Ví dụ của chủ dự án:** dự án có ba slide A, B, C. Slide A có hai ô ảnh G, H; slide B có ba ô I, J, K; slide C có một ô L. Tất cả đều trống. Người dùng chạm vào ô **K** để thêm ảnh:
- trình chọn cho chọn **tối đa 6 ảnh** (G, H, I, J, K, L);
- chọn **1** ảnh → ảnh vào **K**;
- chọn **3** ảnh → lần lượt vào **K, I, J** (K trước vì đang chọn, rồi I, J cùng slide B);
- chọn **6** ảnh → lần lượt vào **K, I, J, G, H, L** (K; rồi I, J cùng slide; rồi từ slide đầu: G, H của A; bỏ qua B vì đã xét; L của C).

Mỗi ảnh vào ô được căn **phủ kín ô**, tâm ảnh trùng tâm ô. Toàn bộ lần thêm (dù bao nhiêu ảnh) là **một bước hoàn tác**. Sau khi điền xong, không có phần tử nào được chọn [ĐX].

Ô trống của **khung ảnh** (khung polaroid, khung máy ảnh — [11](11-thu-vien.md)) cũng được tính là ô trống và tham gia thứ tự trên theo slide chứa khung [ĐX].

## 2. Nút "Ảnh" trên thanh công cụ — thêm ảnh tự do [CDA]

Chạm icon **Ảnh** ở thanh công cụ mặc định (khi không chọn gì) mở trình chọn ảnh cho phép **chọn nhiều**, theo chủ dự án **nên giới hạn khoảng 10 ảnh** để tránh nặng máy [CDA]. Nếu chọn quá 10, ứng dụng dùng 10 ảnh đầu và báo cho người dùng.

Các ảnh được thêm thành **ảnh tự do** (không nằm trong ô nào), đặt bắt đầu từ **góc trên bên trái của slide đang hiện trên màn hình** [CDA] — "slide đang hiện" là slide có phần lớn diện tích nằm trong vùng nhìn, hoặc slide gần tâm màn hình nhất. Đề xuất cụ thể [ĐX]: mỗi ảnh rộng khoảng 60 % chiều rộng slide, giữ tỉ lệ gốc; ảnh đầu đặt cách góc trên trái slide một khoảng lề nhỏ; mỗi ảnh tiếp theo lệch xuống và sang phải khoảng 40 px so với ảnh trước để không chồng khít lên nhau; ảnh cuối cùng được chọn sau khi thêm.

Câu hỏi mở (Q-E2): khi dự án vẫn còn ô trống mà người dùng bấm nút Ảnh, nên thêm ảnh tự do như tham chiếu, hay hỏi "Điền vào N ô trống / Thêm ảnh tự do"?

## 3. Thay

Nút **Thay** trên thanh của ảnh mở trình chọn **một** ảnh (hoặc video). Ảnh mới thay vào đúng phần tử / ô đang chọn, giữ nguyên khung, vị trí, kiểu, viền, bóng; nội dung được căn phủ lại vào khung. Bộ lọc và chỉnh màu của ảnh cũ được giữ cho ảnh mới [ĐX].

## 4. Cắt

Nút **Cắt** mở công cụ cắt đã có: chọn tỉ lệ (tự do, 1:1, 4:5…), kéo khung cắt, nắn thẳng, xoay 90°, lật ngang / dọc, xác nhận bằng ✓. Với ảnh trong ô, khung cắt luôn theo tỉ lệ của ô.

## 5. Chỉnh ảnh — màn toàn màn hình [QS] (video 6:31 → 7:51)

Nút **Chỉnh** mở một **màn riêng toàn màn hình** chỉ chứa tấm ảnh đang chọn, để người dùng tập trung chỉnh màu mà không bị các phần tử khác che.

**Thanh trên** của màn này có, từ trái sang phải: nút **✕** (huỷ mọi thay đổi trong lần mở này và quay về editor); viên thuốc **↶ ↷** (hoàn tác / làm lại **trong** màn chỉnh); nút **so sánh** (giữ để xem ảnh gốc, thả ra xem ảnh đã chỉnh); và nút **✓** (áp dụng và quay về editor).

**Thanh công cụ đáy** là một hàng icon có nhãn, trượt ngang: **Bộ lọc · Phơi sáng · Độ sáng · Tương phản · Vùng sáng · Vùng tối · Nhiệt độ màu · Sắc độ · Bão hoà · Độ rực · Làm mờ · Làm nét · Hạt · Đặt lại**. Tham chiếu có Filter, Exposure, Brightness, Contrast, Highlights, …, Saturation, Blur, Sharpen, Grain, Reset; app mình đã có 13 thông số và 25 bộ lọc nên dùng bộ của mình, thêm **Làm mờ** và **Làm nét** [ĐX].

Chạm một công cụ chỉnh mở một **sheet nhỏ** ở đáy: tên công cụ ở giữa, ✕ ở phải, một **thanh trượt** mà vị trí 0 nằm giữa (kéo trái là âm, kéo phải là dương) và một ô số hiển thị giá trị. Ảnh cập nhật ngay khi kéo. Đóng sheet bằng ✕ để quay lại hàng công cụ.

Chạm **Bộ lọc** mở dải **thumbnail của chính tấm ảnh** đã áp từng bộ lọc, tên bộ lọc dưới mỗi thumbnail, bộ lọc đang dùng có viền sáng. Tham chiếu đặt tên theo họ có đánh số (Film II, Film III, Tri-X, HP53, Classic I–III, Evocative I–III, Polaroid I, Chroma I–III, Gold I–V); app mình có thể tổ chức 25 bộ lọc hiện có theo cách tương tự (họ + biến thể). Chạm lại bộ lọc đang dùng để chỉnh **cường độ** [ĐX].

Mỗi công cụ **đã được chỉnh** (giá trị khác 0 hoặc đã chọn bộ lọc) có một **chấm đỏ nhỏ** trên icon, để người dùng biết mình đã đụng vào những gì. **Đặt lại** đưa mọi giá trị về 0 và bỏ bộ lọc.

Khi bấm ✓, mọi thay đổi trong lần mở màn chỉnh được ghi thành **một bước hoàn tác** trong editor.

## 6. Công cụ nền [QS] (video 8:12)

Nút **Công cụ nền** mở sheet với ba công cụ:

- **Xoá nền** — tách chủ thể, xoá nền thành trong suốt, chạy ngay trên máy (đã có từ M12).
- **Cắt rời** — tách chủ thể thành một **sticker mới** đặt chồng lên ảnh, ảnh gốc giữ nguyên [ĐX].
- **Tẩy** — cọ tẩy tay: người dùng tô lên vùng muốn xoá, có thanh chỉnh cỡ cọ và nút đảo (vẽ lại phần đã tẩy) [ĐX].

## 7. Tiêu chí nghiệm thu

1. Chạm ô trống (theo quy tắc chọn) → sheet "Lấp đầy khung" có Ảnh, Video, Tệp.
2. Dự án G H / I J K / L trống, chạm K: chọn 1 ảnh → K; 3 ảnh → K, I, J; 6 ảnh → K, I, J, G, H, L.
3. Dự án còn 4 ô trống, chọn 6 ảnh → 4 ảnh được dùng, có thông báo.
4. Thêm 3 ảnh bằng nút Ảnh khi đang xem slide 2 → 3 ảnh tự do bắt đầu ở góc trên trái slide 2, lệch nhau.
5. Thay ảnh trong ô → khung, viền, bộ lọc giữ nguyên.
6. Màn Chỉnh: chỉnh Phơi sáng → icon có chấm đỏ; giữ so sánh thấy ảnh gốc; ✕ huỷ hết; ✓ áp dụng thành một bước hoàn tác.
