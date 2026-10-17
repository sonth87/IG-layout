# 05 — Màn editor: bố cục, canvas và slide

Ảnh tham chiếu: IMG_3957 → IMG_3965, IMG_3977, IMG_3978. Video: 1:51 → 2:36.

## 1. Bố cục màn editor

Màn editor có nền tối toàn màn (ở chế độ tối) hoặc xám rất nhạt (ở chế độ sáng), và **canvas** — dải các slide nằm liền nhau theo chiều ngang — nằm ở giữa. Mọi nút điều khiển đều là các khối nổi bo tròn đặt ở bốn góc, để phần lớn màn hình dành cho nội dung.

**Góc trên bên trái** là một nút tròn **‹**. Chạm vào sẽ lưu dự án (việc lưu vốn đã diễn ra tự động sau mỗi thao tác, ở đây chỉ đảm bảo lần lưu cuối đã xong) và quay về trang chủ.

**Phía trên, lệch về bên phải** là một viên thuốc chứa ba nút: **↶ Hoàn tác**, **↷ Làm lại** và **⋯** (menu của dự án, mô tả ở [12](12-sheet-menu-xuat-lop.md)). Hoàn tác và làm lại mờ đi khi không có gì để hoàn tác / làm lại.

**Góc trên bên phải** là một nút tròn **chia sẻ** (icon hộp có mũi tên lên), mở màn Xuất.

**Dưới mỗi slide**, cách cạnh dưới slide khoảng 16 px và căn giữa theo slide, có **hai nút tròn nhỏ** (đường kính khoảng 32 px) đứng cạnh nhau: nút **‖** (tay kéo để đổi chỗ slide) và nút **⋯** (menu của slide). Khi dự án chỉ có **một slide**, nút ‖ không hiện vì không có gì để đổi chỗ — chỉ có nút ⋯ (IMG_3957, IMG_3977) [QS].

**Bên phải slide cuối cùng**, cách mép slide khoảng 16 px và nằm giữa theo chiều cao của canvas, có một nút tròn **+** lớn hơn (khoảng 44 px) để thêm slide.

**Góc dưới bên trái** là **thanh công cụ mặc định**: một viên thuốc chứa năm icon không có chữ — **Ảnh**, **Chữ**, **Sticker**, **Hình** và **+** (mở toàn bộ danh sách những thứ có thể thêm). **Góc dưới bên phải** là một nút tròn **Lớp** tách riêng [QS].

Khi người dùng **chọn một phần tử**, thanh công cụ mặc định được **thay thế** bằng thanh công cụ của phần tử đó (xem [07](07-khung-chon-va-thanh-cong-cu.md)) và nút Lớp ẩn đi; các nút ‖ ⋯ dưới slide và nút + vẫn hiện. Khi một bottom sheet mở ra, toàn bộ canvas bị **đẩy lên** phía trên sheet (xem [12](12-sheet-menu-xuat-lop.md)).

## 2. Zoom canvas [CDA][QS]

### 2.1 Mặc định: thấy hết các slide

Theo mô tả của chủ dự án, editor **không** phóng một slide ra đầy màn hình. Thay vào đó, khi mở dự án, canvas được zoom ở mức **vừa đủ để thấy hết tất cả các slide** trong vùng làm việc (phần màn hình giữa nhóm nút trên cùng và thanh công cụ dưới cùng, chừa lề hai bên). Ví dụ một dự án 3 slide 4:5 sẽ hiện ba slide nằm liền nhau, mỗi slide rộng khoảng một phần ba màn hình (IMG_3963).

### 2.2 Tự thu nhỏ khi thêm slide

Khi người dùng thêm slide, canvas **tự thu nhỏ** để vẫn thấy hết các slide, với hiệu ứng chuyển mượt khoảng 250 ms. Ngược lại, khi xoá slide, canvas tự phóng lại cho vừa [ĐX].

### 2.3 Mức nhỏ nhất và hiệu ứng bật lại

Có một **mức zoom nhỏ nhất**. Trong tham chiếu, ở mức này một slide 4:5 chỉ rộng khoảng một phần tư màn hình (IMG_3977). Chủ dự án mô tả: **mặc định sẽ zoom nhỏ về đến mức như ảnh IMG_3977, và nếu người dùng chụm thu nhỏ hơn mức đó thì khi thả tay canvas tự bật về mức nhỏ nhất** [CDA] — giống một lò xo, trong lúc chụm vẫn thu nhỏ được thêm một chút (có lực cản) nhưng thả ra là trở về.

Khi dự án có quá nhiều slide đến mức "thấy hết" sẽ nhỏ hơn mức nhỏ nhất, canvas dừng ở mức nhỏ nhất và người dùng **vuốt ngang** để xem các slide còn lại [ĐX].

### 2.4 Phóng to và dời canvas

Khi **không có phần tử nào được chọn**, chụm hai ngón sẽ phóng to / thu nhỏ canvas quanh điểm giữa hai ngón tay, phóng tối đa khoảng 5 lần [ĐX]. Khi đã phóng to, kéo một ngón sẽ dời canvas để xem chỗ khác. Chạm đúp vào vùng trống sẽ đưa canvas về mức "thấy hết" [ĐX]. Khi đang chọn một phần tử, các cử chỉ này tác động lên phần tử chứ không phải canvas — xem [06](06-chon-va-cu-chi.md).

## 3. Menu "⋯" của slide [QS] (IMG_3958)

Chạm nút **⋯** dưới một slide mở một **popup nổi** ngay phía trên nút, nền kính mờ, phóng nhẹ ra từ chính nút. Popup có ba mục, mỗi mục một icon bên trái:

- **Thêm bên trái** — chèn một slide trắng vào ngay trước slide này. Mọi phần tử của các slide từ vị trí này trở về sau được dời sang phải đúng một chiều rộng slide.
- **Thêm bên phải** — chèn một slide trắng vào ngay sau slide này.
- *(một vạch ngăn)*
- **Nhân bản** — chèn ngay sau slide này một bản sao của slide, **kèm bản sao của mọi phần tử nằm trên slide** (phần tử thuộc slide được xác định theo vị trí tâm của nó).

Đề xuất thêm mục **Xoá slide** (chữ đỏ) ở cuối [ĐX]: nếu slide có phần tử thì hỏi xác nhận; mục này ẩn khi dự án chỉ còn một slide. Chạm ra ngoài popup thì đóng popup.

## 4. Kéo đổi chỗ slide [CDA][QS] (IMG_3965, video 2:36)

Chủ dự án mô tả chi tiết thao tác này: người dùng **giữ** nút **‖** dưới một slide rồi **kéo ngang** để đưa slide đó tới vị trí khác trong dãy; **các phần tử nằm trên slide đó đi theo slide**.

Diễn biến cụ thể:

1. Người dùng đặt ngón lên nút ‖ và giữ khoảng 200 ms (để phân biệt với vuốt canvas). Nút ‖ **to lên** khoảng 1,5 lần và hơi sáng lên, báo hiệu đã "cầm" được slide. Có rung nhẹ nếu thiết bị hỗ trợ.
2. Ngay khi bắt đầu kéo, **toàn bộ các nút ‖ ⋯ của những slide khác ẩn đi**, nút + cũng ẩn, để màn hình gọn.
3. Khi người dùng di chuyển ngón tay, nút ‖ **đi theo ngón tay nhưng chỉ theo chiều ngang** — nó không lên xuống dù ngón tay lệch lên xuống. Slide đang kéo đi theo nút.
4. Khi slide đang kéo vượt qua giữa slide bên cạnh, slide bên cạnh **tự trượt sang** để nhường chỗ (có hiệu ứng), tạo ra khoảng trống ở vị trí mới.
5. Khi người dùng thả tay, slide nằm vào vị trí mới; mọi phần tử của nó được dời theo đúng khoảng mà slide đã dời; các nút ‖ ⋯ của mọi slide hiện lại.
6. Toàn bộ lần kéo là **một bước hoàn tác**.

Phần tử **nằm vắt qua hai slide** được coi là thuộc slide chứa **tâm** của nó [ĐX]. Khi kéo tới gần mép trái / phải của vùng làm việc mà vẫn còn slide bên ngoài màn hình, canvas tự cuộn theo [ĐX].

## 5. Thêm slide — sheet "Slide mới" [CDA][QS] (IMG_3959 → IMG_3964, video 1:56 → 2:30)

Chạm nút **+** bên phải slide cuối mở bottom sheet **"Slide mới"** (mặc định cao 50 % màn hình, kéo lên được tới 95 %; canvas bị đẩy lên phía trên sheet). Chủ dự án mô tả đây là nơi **thêm slide với các kiểu chia sẵn** [CDA]. Sheet có ba phần, cuộn dọc:

**Trắng** — một ô vuông trắng duy nhất. Chọn sẽ thêm một slide trắng.

**Bố cục** — khoảng 12 mẫu bố cục đơn giản, hiển thị dạng ô vuông bo góc nền trắng với các hình chữ nhật xám tượng trưng cho ô ảnh. Các mẫu quan sát được gồm: một ảnh lớn có lề; hai ảnh lệch nhau chéo góc; hai ảnh cạnh nhau; hai ảnh trên dưới; một ảnh ngang có lề; một ảnh vuông ở giữa; một ảnh có viền dày; hai ảnh có viền; một ảnh tràn có viền mảnh; một ảnh tràn; một ảnh kiểu polaroid có miếng băng dính ở trên; hai khung đen trên dưới.

**Lưới** — khoảng 40 kiểu chia ô, hiển thị dạng ô xám nhạt có các đường chia màu trắng: chia đôi dọc, chia đôi ngang, ba hàng, ba cột, một lớn bên trái và hai nhỏ bên phải, lưới 2 × 2, một lớn trên và ba nhỏ dưới, các cột không đều, lưới 3 × 3, và nhiều biến thể chia không đều từ 2 đến 9 ô.

Chạm một mẫu → sheet đóng, ứng dụng thêm **một slide mới vào cuối dải** (hoặc vào vị trí người dùng đang thêm, nếu mở từ "Thêm bên trái / phải" [ĐX]), và slide đó chứa một **khối bố cục** theo đúng mẫu đã chọn, phủ slide, với **tất cả các ô đều trống** (nền xám, dấu + tròn ở giữa — IMG_3962, IMG_3963). Canvas tự thu nhỏ để thấy hết slide (mục 2.2). Không có phần tử nào được chọn sau khi thêm.

Trong tham chiếu, một số mẫu có biểu tượng ♥ nghĩa là thuộc gói trả phí và chạm vào sẽ mở màn mời nâng cấp — ở app mình **mọi mẫu đều dùng được** [ĐX].

## 6. Tiêu chí nghiệm thu

1. Dự án 1 slide: dưới slide chỉ có nút ⋯; dự án ≥ 2 slide: mỗi slide có ‖ và ⋯.
2. Mở dự án 3 slide thấy đủ 3 slide. Thêm slide thứ 4 → canvas thu nhỏ mượt, vẫn thấy đủ 4.
3. Chụm thu nhỏ quá mức nhỏ nhất rồi thả → canvas bật về mức nhỏ nhất.
4. Không chọn gì, chụm → canvas phóng to; chạm đúp vùng trống → về "thấy hết".
5. ⋯ → Thêm bên trái trên slide 2 → slide trắng mới ở vị trí 2, phần tử của slide 2 cũ dời sang slide 3.
6. ⋯ → Nhân bản → bản sao kèm đủ phần tử xuất hiện ngay sau.
7. Kéo ‖ của slide 1 sang vị trí 3: trong lúc kéo các nút khác ẩn, ‖ chỉ đi ngang; thả tay → slide và phần tử của nó ở vị trí 3; hoàn tác một lần là trở lại như cũ.
8. "Slide mới" → Lưới 2 × 2 → slide mới có khối 4 ô trống; Trắng → slide trắng.
