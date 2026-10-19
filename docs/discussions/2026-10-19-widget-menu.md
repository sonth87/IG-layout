# Widget có menu riêng (2026-10-19)

Trạng thái: **đề xuất — chờ chủ dự án duyệt**.

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
