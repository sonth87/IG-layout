# 08 — Các sheet chỉnh sửa

Ảnh tham chiếu: không có ảnh chụp riêng; nội dung lấy từ video 4:09 → 6:24, 10:12 → 10:30. Các sheet này mở từ thanh công cụ theo đối tượng ([07](07-khung-chon-va-thanh-cong-cu.md)) và tác động lên phần tử đang chọn. Khi sheet mở, canvas bị đẩy lên phía trên để người dùng thấy ngay kết quả ([12](12-sheet-menu-xuat-lop.md)). Mỗi lần mở rồi đóng một sheet được tính là **một bước hoàn tác**, dù trong sheet người dùng đã chỉnh nhiều lần.

## 1. Vị trí

Sheet **Vị trí** có hai tab viên thuốc ở trên cùng là **Vị trí** và **Nâng cao**, nút ✕ ở bên phải.

### 1.1 Tab Vị trí

Tab này gồm năm nhóm nút, mỗi nhóm có tiêu đề nhỏ màu nhạt, các nút là icon có nhãn chữ bên dưới, xếp ba hoặc bốn nút một hàng.

**Sắp lớp** gồm bốn nút: **Lên trên cùng** đưa phần tử lên lớp cao nhất; **Lên một lớp** đưa lên trên phần tử ngay phía trên nó; **Xuống một lớp**; **Xuống dưới cùng**. Nút không có tác dụng (ví dụ "Lên trên cùng" khi phần tử đã ở trên cùng) hiện mờ.

**Dịch** gồm bốn nút mũi tên **← → ↑ ↓**, mỗi lần chạm dịch phần tử đi một đơn vị nhỏ (1 px theo toạ độ ảnh xuất). Giữ nút thì phần tử dịch liên tục và nhanh dần [ĐX]. Dùng để căn chính xác mà ngón tay khó làm.

**Căn** gồm sáu nút: **Trái, Giữa (ngang), Phải** và **Trên, Giữa (dọc), Dưới**. Phần tử được căn so với **slide chứa tâm của nó** — ví dụ "Trái" đặt cạnh trái phần tử trùng cạnh trái slide.

**Lấp đầy** gồm ba nút: **Cao** — co giãn giữ tỉ lệ để phần tử cao đúng bằng slide và căn giữa dọc; **Rộng** — co giãn để rộng đúng bằng slide và căn giữa ngang; **Rộng 2×** — co giãn để rộng đúng bằng **hai slide** và đặt vắt đều qua slide hiện tại với slide kế bên phải, rất tiện khi làm ảnh panorama liền mạch qua hai slide [QS].

**Lật** gồm hai nút: **Ngang** và **Dọc**, lật nội dung phần tử (với khối bố cục: lật vị trí các ô [ĐX]).

### 1.2 Tab Nâng cao

Tab này cho nhập số chính xác. Hàng đầu có hai ô **Rộng** và **Cao** (đơn vị px theo kích thước ảnh xuất), kèm một nút **khoá tỉ lệ** hình ổ khoá bên cạnh — khi khoá, sửa một ô thì ô kia tự tính lại. Hàng thứ hai có hai ô **X** và **Y** (vị trí góc trên trái, tính từ góc trên trái của slide đầu tiên) và một ô **Xoay** (độ). Giá trị được áp dụng khi người dùng rời khỏi ô hoặc bấm phím xác nhận trên bàn phím số.

## 2. Kiểu

Sheet **Kiểu** chỉnh hình thức của phần tử, gồm các dòng theo thứ tự:

**Độ mờ** — thanh trượt bên trái, ô số phần trăm bên phải (0 – 100 %).

**Bo góc** — thanh trượt và ô số (px). Bên dưới là công tắc **Bo từng góc**; khi bật, thanh trượt được thay bằng bốn ô số cho bốn góc (trên trái, trên phải, dưới phải, dưới trái), cho phép làm ví dụ ảnh bo tròn hai góc trên và vuông hai góc dưới.

**Bóng ›** — chạm vào mở màn con trong cùng sheet (có nút ‹ quay lại). Màn con có công tắc **bật / tắt bóng**, và khi bật thì có các thanh trượt **Độ mờ** của bóng, **Góc** chiếu, **Khoảng cách** từ phần tử tới bóng, **Độ nhoè**, và dòng **Màu ›** mở bảng màu dùng chung. Dòng "Bóng" ở màn chính ghi trạng thái hiện tại ("Tắt" hoặc "Bật").

**Viền ›** — màn con có thanh trượt **độ dày** (px) và **Màu ›**. Dòng "Viền" ở màn chính ghi độ dày hiện tại ("0 px" nghĩa là không viền).

Mọi thay đổi hiển thị ngay trên canvas.

## 3. Bảng màu dùng chung

Mọi nơi cần chọn màu — màu chữ, màu nền, màu viền, màu bóng, màu hình khối — đều mở cùng một **bảng màu**, để người dùng chỉ phải học một lần. Bảng màu gồm, từ trên xuống:

- Một nút rộng **"Màu tuỳ chỉnh"** mở bộ chọn màu tự do: một ô vuông sắc độ (kéo để chọn độ sáng / độ bão hoà), một thanh màu cầu vồng, ô nhập mã HEX và thanh độ trong suốt [ĐX — tham chiếu chỉ cho thấy nút].
- Dòng **Màu thương hiệu**: các màu người dùng lưu trong Brand Kit ([11](11-thu-vien.md)), nút **+** để thêm màu đang chọn vào đây, nút **Sửa** để xoá / sắp xếp.
- Dòng **Đã lưu**: các màu dùng gần đây, tự động thêm vào khi người dùng chọn một màu tuỳ chỉnh.
- Lưới **Mặc định** khoảng 40 màu tròn: hàng đầu là các sắc xám từ đen đến trắng; các hàng sau là các màu bão hoà đi theo vòng màu (đỏ, cam, vàng, xanh lá, xanh ngọc, xanh dương, tím, hồng) và các màu pastel tương ứng.

Màu đang được dùng có viền nổi bật.

## 4. Bố cục của khối

Nút **Bố cục** trên thanh của khối mở danh sách kiểu chia giống mục "Lưới" của sheet Slide mới ([05](05-canvas-va-slide.md)). Chạm một kiểu → khối đổi sang kiểu chia đó ngay, giữ nguyên vị trí và kích thước khối. Ảnh đang có trong các ô được **giữ lại theo thứ tự ô** (ô thứ nhất cũ sang ô thứ nhất mới…) và căn phủ lại cho vừa ô mới. Nếu kiểu mới có ít ô hơn số ảnh đang có, ảnh thừa được chuyển thành **ảnh tự do** đặt cạnh khối và ứng dụng báo "N ảnh được đặt ngoài lưới" [ĐX]. Nếu kiểu mới có nhiều ô hơn, các ô thừa là ô trống.

## 5. Điều chỉnh của khối [ĐX]

Tham chiếu có nút **Điều chỉnh** trên thanh của khối nhưng video không cho thấy nội dung. Đề xuất sheet gồm: **Khe giữa các ô** (thanh trượt px), **Lề ngoài** (khoảng cách từ ô tới mép khối), **Bo góc ô**, **Màu nền** của khối (dùng bảng màu chung). App hiện tại đã có các tuỳ chọn khoảng cách, bo góc và màu nền cho layout — chuyển các tuỳ chọn đó vào đây.

## 6. Khoá, Nhân bản, Xoá

**Khoá** làm phần tử đứng yên: không kéo, không co giãn, không xoay được (thanh nổi chỉ còn nút ⋯ để mở khoá). Phần tử khoá vẫn chọn được; với ảnh khoá trong khung, ảnh bên trong vẫn dời và phóng được (D-85). Khoá một khối bố cục không ngăn chọn các ô bên trong để thay ảnh [ĐX].

**Nhân bản** tạo bản sao lệch khoảng 24 px xuống – sang phải và chọn bản sao.

**Xoá** xoá phần tử ngay, không hỏi; người dùng hoàn tác nếu lỡ tay.

## 7. Tiêu chí nghiệm thu

1. Vị trí → Căn → Trái: cạnh trái phần tử trùng cạnh trái slide chứa nó.
2. Vị trí → Lấp đầy → Rộng 2×: phần tử rộng đúng hai slide, vắt đều qua slide hiện tại và slide bên phải.
3. Nâng cao: khoá tỉ lệ, sửa Rộng 500 → Cao tự đổi theo; nhập Xoay 15 → phần tử xoay 15°.
4. Kiểu → Bo từng góc → chỉ bo hai góc trên; Bóng bật, đổi góc → bóng đổi hướng.
5. Chọn một màu tuỳ chỉnh → màu xuất hiện trong "Đã lưu".
6. Đổi kiểu chia khối 4 ô có 4 ảnh sang 2 ô → 2 ảnh vào ô, 2 ảnh thành ảnh tự do, có thông báo.
7. Mở sheet Kiểu, chỉnh 5 lần, đóng → một lần hoàn tác trả về như trước khi mở.
