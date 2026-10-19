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

## Đợt 2 — đề xuất loại và biến thể (chờ duyệt)

Sheet Widget chia theo **loại**, mỗi loại một hàng các biến thể. Tổng khoảng 70 biến thể; † là cái đã có.

| Loại | Biến thể |
| --- | --- |
| Chữ | Nhãn†, Tin nhắn†, Địa điểm†, Tô sáng†, Ruy băng, Nhãn tròn, Chữ neon, Băng chữ máy đánh chữ |
| Đồng hồ | Đồng hồ lật†, Số lớn kiểu màn hình khoá (giờ + ngày), Kim tròn, Kim tối giản, Số điện tử LED, Hai múi giờ, Báo thức, Bấm giờ |
| Lịch | Tờ lịch†, Đếm ngược†, Lịch tháng, Dải tuần, Viên ngày (pill), "Save the date", Dấu ngày kiểu máy phim cam |
| Thời tiết | Thẻ thời tiết†, Nhiệt độ lớn tối giản, Dự báo 5 ngày, Viên (icon + độ), Thẻ nền trời gradient, Mặt trời mọc / lặn |
| Trích dẫn | Phiếu đọc sách†, Ngoặc kép lớn, Giấy máy đánh chữ, Kiểu bài đăng (avatar + chữ), Giấy note trích dẫn, Một dòng tối giản |
| Mạng xã hội | Bình chọn†, Hộp câu hỏi†, Chat†, Thông báo†, Hashtag†, @Nhắc tên†, Tìm kiếm†, Đánh giá sao†, Đếm tim / bình luận, Nút theo dõi, Thanh trượt emoji, Liên kết |
| Âm nhạc | Bài hát đang nghe†, Trình phát mini (viên), Đĩa than, Băng cát-xét, Danh sách phát, Lời bài hát, Sóng âm |
| Thể thao | Số bước†, Ba vòng hoạt động, Tổng kết chạy (quãng đường / pace / thời gian), Nhịp tim, Uống nước, Giấc ngủ |
| Du lịch | Vé máy bay†, Thông số máy ảnh†, Dấu hộ chiếu, Thẻ hành lý, Vé tàu, Thẻ ghim bản đồ, Bưu thiếp |
| Hoá đơn | Hoá đơn†, Giá / khuyến mãi†, Phiếu giảm giá, Danh sách mua sắm, Chia tiền, Tóm tắt đơn hàng |
| Việc cần làm | Danh sách việc†, Thanh tiến trình†, Tâm trạng†, Công thức†, Theo dõi thói quen (lưới), Mục tiêu, Lịch trình trong ngày |

Mỗi biến thể có menu riêng như Đợt 1: danh sách thêm / bớt, thanh trượt, chọn ngày… tuỳ loại.
