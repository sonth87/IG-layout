# 12 — Bottom sheet, menu dự án, xem trước, xuất, lớp, hoàn tác

Ảnh tham chiếu: IMG_3981 (sheet 50 %), IMG_3987 (sheet ~95 %), IMG_3996 → IMG_3999, IMG_4001. Video: 10:48 → 11:36.

## 1. Bottom sheet [CDA]

### 1.1 Chiều cao kéo được

Chủ dự án mô tả: **các bottom sheet có thể thay đổi kích thước; mặc định hiển thị 50 %, nhỏ nhất cũng là 50 %, lớn nhất là 95 %** [CDA]. Áp dụng cho mọi sheet chọn nội dung: Slide mới, Lớp mới, Sticker, Hình, Khung, Widget, Brand Kit, Lớp, Nền.

Người dùng kéo **tay cầm** ở mép trên sheet lên hoặc xuống để đổi chiều cao. Khi nội dung trong sheet đã cuộn lên tới đầu, kéo nội dung xuống cũng kéo sheet xuống (giống sheet của iOS). Khi thả tay, sheet **bám** về mốc gần nhất trong hai mốc 50 % và 95 % [ĐX], có hiệu ứng lò xo nhẹ. Kéo sheet xuống thấp hơn 50 % rồi thả: đề xuất **đóng sheet** (giống thói quen trên iOS), hoặc bật về 50 % nếu chủ dự án muốn giữ đúng "nhỏ nhất 50 %" (Q-E5).

Sheet công cụ nhỏ (Vị trí, Kiểu, Định dạng chữ, Độ mờ, Lấp đầy khung…) có chiều cao **vừa với nội dung** và không kéo dãn [ĐX].

### 1.2 Đẩy canvas lên [CDA]

Chủ dự án mô tả: **khi bottom sheet mở lên sẽ đẩy toàn bộ canvas lên, mục đích là để người dùng vừa thao tác với các mục trong bottom sheet vừa thấy trực quan luôn nó hiện thế nào trên canvas** [CDA].

Cụ thể: khi một sheet mở, vùng làm việc của canvas co lại thành phần màn hình nằm **phía trên** sheet, và canvas được zoom lại để **thấy hết các slide** (hoặc thấy phần tử đang chọn, nếu có) trong phần đó, với hiệu ứng mượt cùng lúc với sheet trượt lên. Khi người dùng kéo sheet cao hơn, canvas co tiếp; ở mức 95 % canvas gần như bị che hết (chấp nhận được vì lúc đó người dùng đang duyệt thư viện). Khi sheet đóng, canvas trở về như trước khi mở. Phần tử mới thêm từ sheet xuất hiện ngay trong phần canvas còn thấy.

## 2. Menu "⋯" của dự án [QS] (IMG_3996, IMG_3998)

Nút **⋯** trong viên thuốc trên cùng mở một **popup** kính mờ ngay dưới nút, gồm (có vạch ngăn giữa các nhóm):

- **Nền** — mở sheet Nền (mục 3).
- **Tỉ lệ** — mở sheet chọn tỉ lệ giống màn tạo dự án ([04](04-tao-du-an.md)) để **đổi tỉ lệ của cả dự án**; các phần tử giữ vị trí tương đối theo slide [ĐX].
- **Hít ›** — chạm vào thì popup **mở rộng ngay tại chỗ** hai lựa chọn **Bật** và **Tắt**, lựa chọn hiện tại có dấu ✓ (IMG_3998). Tắt hít thì không còn đường gióng, thước đo kích thước và hít góc xoay.
- **Chọn nhiều** — vào chế độ chọn nhiều ([06](06-chon-va-cu-chi.md)).
- **Xem trước** — mở màn xem trước (mục 4).

## 3. Nền [QS] (video 11:00 → 11:15)

Sheet **Nền** có ba tab viên thuốc: **Màu**, **Chuyển màu**, **Chất liệu**, và nút ✕.

**Màu** dùng bảng màu chung ([08](08-cac-sheet-chinh-sua.md)), áp màu đó làm nền cho toàn dải slide.

**Chuyển màu** có nút rộng **"Chuyển màu tuỳ chỉnh"** mở bộ chỉnh: một thanh hiển thị dải chuyển màu với các **điểm dừng** kéo được (chạm điểm dừng để đổi màu, chạm vào thanh để thêm điểm), ô **vị trí** (%) của điểm dừng đang chọn, ô **góc** (°) và lựa chọn **kiểu** (thẳng / toả tròn). Bên dưới là lưới các chuyển màu **Đã lưu** và **Mặc định** dạng chấm tròn.

**Chất liệu** là lưới khoảng 20 ô ảnh chất liệu: giấy trắng, giấy ngà, giấy kraft, bìa cứng, gỗ, đá cẩm thạch, vải lanh, giấy đen, nền tối có vân… Chạm một ô để dùng làm nền (lặp lại hoặc phủ theo dải slide).

App hiện tại có nền màu, chuyển màu và ảnh mờ — giữ "ảnh mờ" như một tab thứ tư [ĐX].

## 4. Xem trước [QS] (IMG_3997, video 11:27)

**Xem trước** mở một màn toàn màn hình (hiệu ứng phóng ra từ nút), tiêu đề "Xem trước" và nút ✕. Nội dung giả lập một **bài đăng trên mạng xã hội**: dòng trên có ảnh đại diện tròn và tên tài khoản giả; giữa là các slide, **vuốt ngang** để chuyển slide như khi xem carousel thật, có chấm chỉ slide bên dưới; dòng dưới có các icon thích, bình luận, gửi và lưu. Mục đích là để người dùng thấy bài đăng trông thế nào **trước khi xuất**. App hiện tại đã có xem trước kiểu này trong màn Xuất — thêm lối vào từ menu ⋯.

## 5. Xuất [QS] (IMG_3999)

Nút **chia sẻ** ở góc trên phải mở màn **"Xuất"** (nút ✕ ở phải tiêu đề). Trên cùng là công tắc hai lựa chọn **Carousel** (xuất mỗi slide thành một ảnh / video) và **Video** (cả carousel thành một video 9:16 — đã có từ M13.4). Giữa là **khung xem trước lớn** vuốt ngang được, có chấm chỉ slide; góc dưới trái khung có nút **⤢** để xem lớn toàn màn, góc dưới phải có nhãn **"2×"** kèm icon bánh răng để chọn **độ phân giải xuất** (1× = 1080 px, 2× = 2160 px chiều rộng) [ĐX về ý nghĩa]. Ở đáy là hàng **nút tròn có nhãn**: **Lưu vào Ảnh**, **Khác** (mở bảng chia sẻ của hệ thống), và [ĐX] **Tải ZIP**. Các nút đăng thẳng lên mạng xã hội và "Liên kết template" của tham chiếu — **bỏ**.

## 6. Lớp [QS] (IMG_4001)

Nút **Lớp** ở góc dưới phải mở sheet **"Lớp"**. Mỗi dòng là một phần tử ngoài cùng, phần tử ở lớp trên cùng nằm đầu danh sách. Điểm đặc biệt là **nội dung dòng là ảnh thu nhỏ của chính phần tử đó** — không phải tên — đặt trên **nền ô cờ** (kiểu nền trong suốt), nên người dùng nhận ra ngay đâu là chữ "Thêm chữ", đâu là tấm ảnh nào. Dòng cao khoảng 56 px, bo góc. Bên trái mỗi dòng có một nút tròn viền (⊖) — trong tham chiếu chưa rõ chức năng; đề xuất là **ẩn / hiện** phần tử [ĐX]. Bên phải mỗi dòng là **tay kéo ≡**: giữ và kéo dọc để đổi thứ tự lớp. Chạm vào dòng sẽ chọn phần tử đó và đóng sheet. App hiện tại có bảng Lớp với icon và tên — thay bằng thumbnail.

## 7. Hoàn tác / Làm lại

Hai nút ↶ ↷ trên cùng, không giới hạn số bước (đã có). Nguyên tắc chung: **một thao tác của người dùng = một bước** (một lần kéo, một lần thêm nhiều ảnh, một lần mở – đóng sheet chỉnh sửa, một lần gõ chữ, một lần kéo đổi chỗ slide).

## 8. Tiêu chí nghiệm thu

1. Mở sheet Sticker: cao 50 %, canvas bị đẩy lên và vẫn thấy hết slide phía trên sheet.
2. Kéo tay cầm lên → sheet 95 %; thả ở giữa → bám về mốc gần nhất.
3. Menu ⋯ → Hít → Tắt: kéo phần tử không còn đường gióng / hít.
4. Nền → Chuyển màu tuỳ chỉnh: thêm điểm dừng, đổi góc → nền đổi ngay.
5. Xem trước: vuốt ngang qua đủ các slide.
6. Xuất: Carousel / Video; chọn 2× → ảnh xuất rộng 2160 px.
7. Lớp: mỗi dòng là thumbnail của phần tử; kéo ≡ đổi thứ tự; chạm dòng chọn phần tử.
