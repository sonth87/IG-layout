# Widget có menu riêng (2026-10-19)

Trạng thái: **Đợt 1 đã làm (D-118)**, Đợt 2 (loại + biến thể) **chờ chủ dự án duyệt danh sách**.

## Góp ý của chủ dự án

1. Đổi một số thứ của widget (ví dụ màu) xong thì không sửa được chữ nữa.
   - Claude đã thử: Màu → chọn màu → ✓ → Sửa widget → gõ: vẫn sửa được.
   - Cần biết các bước chính xác. Cách làm mới bên dưới bỏ luôn đường đi cũ.
2. Bình chọn chỉ có 2 lựa chọn, không thêm được.
3. Mới chạm vào widget đã bật sheet sửa, không làm được gì khác.
4. Mong muốn:
   - chọn widget thì thanh dưới hiện **menu riêng của widget**, như chọn ảnh có menu của ảnh;
   - mỗi loại widget có thể có menu khác nhau.

## Đề xuất

### Chạm

- Chạm vào widget thì chỉ chọn, không tự mở gì. Bỏ hành vi "chạm widget đang chọn = mở sheet sửa" của D-115.
- Chạm đúp vào widget thì mở **Nội dung**, như chạm đúp vào chữ để gõ.

### Thanh công cụ khi chọn widget

Thứ tự trên thanh:

1. **Các nút riêng** của loại widget đó.
2. Các nút chung: **Nội dung** · **Kiểu thẻ** (Sáng / Tối / Màu) · **Màu** · **Vị trí** · **Độ mờ**.
3. Phần đuôi như mọi phần tử: lên / xuống lớp…

Mỗi nút mở một sheet nhỏ chỉ làm đúng việc đó. ✕ là huỷ, ✓ là một bước hoàn tác.

### Nút riêng theo loại

| Widget | Nút riêng |
| --- | --- |
| Bình chọn | **Lựa chọn**: thêm / bớt 2–4 lựa chọn, sửa chữ và %; nút "chia đều" |
| Danh sách việc | **Mục**: thêm / bớt (tối đa 8), tích xong / chưa |
| Cụm hashtag | **Thẻ**: thêm / bớt (tối đa 8) |
| Hoá đơn | **Dòng**: thêm / bớt (tối đa 8) |
| Chat 2 người | **Tin nhắn**: thêm tin đến / tin đi, đổi chiều, xoá (tối đa 6) |
| Công thức | **Nguyên liệu**: thêm / bớt |
| Đánh giá sao | **Số sao**: thanh trượt 0–5, có nửa sao |
| Thanh tiến trình, Thước đo tâm trạng | **Mức**: thanh trượt 0–100 % |
| Bài hát đang nghe | **Tiến độ**: thanh trượt; giờ đã phát tự tính |
| Thời tiết | **Biểu tượng**: ☀️ ⛅ ☁️ 🌧️ ⛈️ ❄️ 🌫️ 🌈 🌙 |
| Tâm trạng | **Emoji**: chọn nhanh vài mặt cảm xúc |
| Tờ lịch | **Ngày**: chọn ngày; tự điền tháng / ngày / thứ theo ngôn ngữ |
| Đếm ngược | **Ngày**: chọn ngày đích; tự tính "còn N ngày" |

Các widget còn lại chỉ có các nút chung:

- thông báo, hộp câu hỏi;
- giá / khuyến mãi;
- @nhắc tên, tìm kiếm;
- vé máy bay;
- thông số máy ảnh;
- phiếu đọc sách;
- số bước chân.

### Dữ liệu

- Các phần lặp (lựa chọn, mục, thẻ, dòng, tin nhắn, nguyên liệu) thành **danh sách** trong `widget`.
- Widget đã tạo trước đây (dạng ô cố định `optionA`, `item1`…) được đọc sang danh sách khi mở, không mất gì.

### Không đổi

- 5 widget chữ cũ (Nhãn, Tin nhắn, Địa điểm, Tô sáng, Đồng hồ lật) vẫn là chữ, sửa như chữ.


## Góp ý thêm (2026-10-19, lần 2)

1. Chạm vào widget đang chọn thì mở bảng sửa (đúng ý). Nhưng chạm ra ngoài hoặc bấm huỷ xong, chạm lại vào widget thì bảng sửa **tự bật lên**.
2. Bình chọn:
   - xoá hết câu hỏi thì **ẩn phần câu hỏi**, không để chỗ trống;
   - lựa chọn và % nằm **cùng dòng**;
   - **thêm lựa chọn được, tối thiểu 2**.
   - Mọi widget dạng danh sách cũng thêm / bớt như vậy.
3. Chia widget thành **các loại**: Chữ, Đồng hồ, Lịch, Thời tiết, Trích dẫn, Mạng xã hội, Âm nhạc, Thể thao, Du lịch, Hoá đơn, Việc cần làm… Mỗi loại **5–10 biến thể**.
4. Lỗi: đang mở bảng sửa mà **kéo widget trên canvas**, sau đó không sửa được gì nữa.

## Đợt 1 — đã làm (D-118)

### Nguyên nhân hai lỗi

- **Bảng tự bật lại:** khi bỏ chọn, công cụ đang mở không đóng mà chỉ bị ẩn. Chọn lại widget thì nó hiện lại.
  - Sửa: đổi chọn (chạm ra ngoài, chọn phần tử khác) thì **đóng sheet của phần tử và giữ những gì đã sửa**.
  - Áp dụng cho: sheet widget, Màu, Độ mờ.
- **Kéo khi đang mở bảng:** kéo / đổi cỡ trên canvas lưu thẳng vào dự án và xoá bản nháp của bảng, nên bảng hết chỗ ghi. Những gì đã sửa trước khi kéo cũng mất.
  - Sửa: kéo / đổi cỡ / xoay trên canvas **vừa lưu vào dự án vừa giữ bản nháp** của sheet đang mở. Sheet tiếp tục chạy; ✓ thì lưu cả hai.

### Chạm

- Một chạm chỉ chọn.
- **Chạm đúp** mở Nội dung.

### Thanh công cụ riêng của widget

- Thứ tự: [nút riêng] · Nội dung · Kiểu thẻ · Màu · Vị trí · Độ mờ · Khoá · Nhân bản · Xoá.
- Nút riêng theo loại:
  - **Lựa chọn** (Bình chọn): 2–4 dòng, chữ + % cùng dòng, nút **Chia đều**.
  - **Mục** (Danh sách việc): 1–8, ô tích xong / chưa.
  - **Thẻ** (Hashtag): 1–8.
  - **Dòng** (Hoá đơn): 1–8.
  - **Tin nhắn** (Chat): 1–6, mỗi tin chọn Đến / Đi.
  - **Nguyên liệu** (Công thức): 0–10.
  - **Số sao**: thanh trượt 0–5, nửa sao.
  - **Mức** (Tiến trình, Tâm trạng): 0–100 %.
  - **Đã phát** (Bài hát): giờ đã phát tự tính.
  - **Thời tiết / Cảm xúc**: bảng 16 biểu tượng.
  - **Ngày** (Tờ lịch, Đếm ngược): chọn ngày, tự điền tháng / ngày / thứ hoặc "còn N ngày".

### Phần trống thì ẩn

Các phần không có chữ không để lại chỗ trống:

- câu hỏi của Bình chọn;
- tiêu đề của Danh sách việc / Đánh giá sao;
- tên + giờ của Chat.

### Dữ liệu cũ

Widget tạo trước đây (ô cố định A / B, 1–3) được đọc sang danh sách, không mất nội dung.

## Đợt 2 — nguyên tắc (chủ dự án, 2026-10-19)

> "cái gì có thể giải quyết bằng việc add thêm widget thì nên đưa ra như thế để tránh việc cover quá nhiều thứ trong 1 widget."

- **Một widget làm một việc.**
  - Không gộp những thứ có thể có bằng cách thêm hoặc nhân bản một widget nữa.
  - Ví dụ: hai múi giờ, đồng hồ kèm ngày, dự báo nhiều ngày.
- **Biến thể = các kiểu nhìn khác nhau của cùng một thứ.**
  - Ví dụ đồng hồ:
    - **kim**: mặt tròn / vuông / méo / chảy; đánh dấu bằng đủ số / 12-3-6-9 / vạch / La Mã;
    - **số**: thường, lật, kỹ thuật số…
- Trên thanh công cụ có nút **Kiểu** để đổi qua lại giữa các biến thể của widget đó.
  - Nội dung (giờ, chữ…) giữ nguyên.
  - Kiểu thẻ Sáng / Tối / Màu theo mặc định của biến thể.

## Đợt 2 — Đồng hồ: đã làm (D-119)

14 kiểu, nút **Kiểu** và **Giờ** (chọn giờ):

- **Kim**:
  - Cổ điển (số 1–12, vạch phút, kim giây màu nhấn);
  - 12 · 3 · 6 · 9;
  - Vạch;
  - La Mã (mặt kem, viền đồng);
  - Vuông;
  - Vuông vạch;
  - Vẽ tay (viền méo, kim cong, chữ viết tay);
  - **Chảy**: nửa trên nằm phẳng trên mặt bàn, nửa dưới buông xuống và chảy thành giọt, có bóng ở nếp gập.
- **Số**:
  - Số lớn (không thẻ, như màn hình khoá);
  - Số lật;
  - LED 7 đoạn (nghiêng nhẹ, phát sáng);
  - LCD (màn xanh xám);
  - Neon;
  - Chấm pixel.

Widget chữ "Đồng hồ lật" cũ không còn trong nhóm Chữ. Dự án cũ có nó vẫn giữ nguyên.

## Đợt 2 — các loại khác (đề xuất lại theo nguyên tắc, chờ duyệt)

Mỗi dòng là **một widget** (một việc), sau dấu `:` là **các kiểu** của nó. † là kiểu đã có.

| Loại | Widget: các kiểu |
| --- | --- |
| Lịch | **Ngày**: tờ lịch xé†, viên ngày, lịch để bàn gấp, dấu ngày máy phim (cam), số ngày lớn tối giản, tờ lịch tháng khoanh ngày, dải tuần khoanh ngày. **Đếm ngược**: thẻ†, "D-14" lớn, vòng tiến độ, số lật, viên |
| Thời tiết | **Thời tiết hiện tại**: thẻ†, nhiệt độ lớn tối giản, viên (biểu tượng + độ), nền trời đổi theo thời tiết, biểu tượng lớn, nhiệt kế |
| Trích dẫn | **Câu trích**: phiếu đọc sách†, ngoặc kép lớn, giấy máy đánh chữ, giấy note, một dòng tối giản, bảng phấn, trang sách mở |
| Mạng xã hội | **Bình chọn**: thanh†, hai nút lớn, tối giản. **Hộp câu hỏi**: thẻ†, bong bóng. **Chat**: bong bóng xanh†, bong bóng tròn kiểu khác, tối giản. **Thông báo**: banner†, kiểu màn hình khoá, kiểu Android. **Hashtag**: viên†, chữ nền, nhãn dán. **@Nhắc tên**: viên†, chữ có gạch chân. **Tìm kiếm**: thanh†, kiểu trình duyệt. **Đánh giá sao**: thẻ†, chỉ hàng sao, sao + số lớn. Mới: **Đếm tim / bình luận** (viên, bong bóng thông báo), **Thanh trượt emoji** |
| Âm nhạc | **Bài hát đang nghe**: thẻ†, trình phát mini (viên), đĩa than, băng cát-xét, mã quét dạng sóng, tối giản |
| Thể thao | **Số bước**: vòng†, thanh, số lớn. **Buổi chạy** (quãng đường · pace · thời gian): thẻ, tối giản, số lớn. **Vòng hoạt động** (3 vòng). **Uống nước**: cốc, giọt. **Giấc ngủ**: thanh, trăng |
| Du lịch | **Vé máy bay**: thẻ†, vé giấy có cuống xé, vé điện thoại. **Dấu hộ chiếu**: tròn, chữ nhật, tam giác, mực đỏ / xanh. **Thẻ hành lý**. **Vé tàu / xe** |
| Mua sắm | **Hoá đơn**: giấy nhiệt†, kiểu nhà hàng, viết tay. **Giá**: thẻ treo†, nhãn tròn SALE, giá gạch đơn giản. **Phiếu giảm giá**: vé răng cưa, thẻ |
| Việc cần làm | **Danh sách việc**: thẻ†, giấy kẻ dòng, note vàng, viết tay. **Tiến trình**: thanh†, vòng, pin. **Tâm trạng**: thước†, 5 mặt chọn, nhiệt kế. **Theo dõi thói quen**: lưới tuần |
| Ẩm thực | **Công thức**: thẻ†, giấy kẻ, thẻ tối giản |
| Máy ảnh | **Thông số máy ảnh**: dải phim†, khung ngắm (HUD), dấu ngày cam |
| Chữ | Nhãn†, Tin nhắn†, Địa điểm†, Tô sáng† (giữ là chữ) |

Sheet Widget xếp theo các loại này; mỗi widget hiện các kiểu của nó.
