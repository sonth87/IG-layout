# 06 — Chọn phần tử và cử chỉ

Đây là phần quan trọng nhất của Editor v2, vì nó giải quyết vấn đề chủ dự án gặp phải: **muốn phóng canvas nhưng lại phóng nhầm ảnh**, và ngược lại. Ảnh tham chiếu: IMG_3966, IMG_3969 → IMG_3974. Video: 2:42 → 3:00, 3:51 → 4:03. Quyết định liên quan: D-86.

## 1. Nguyên tắc: chọn rồi mới chỉnh

Toàn bộ mô hình dựa trên một câu: **phần tử nào đang được chọn thì nhận mọi thao tác; không có gì được chọn thì mọi thao tác dành cho canvas.** Ứng dụng không bao giờ "đoán" người dùng muốn tác động lên cái gì dựa vào chỗ ngón tay đặt; điều đó được quyết định hoàn toàn bởi trạng thái chọn hiện tại, mà trạng thái chọn thì luôn nhìn thấy được (khung chọn, thanh công cụ đổi theo). Vì vậy người dùng luôn biết trước thao tác của mình sẽ tác động lên đâu.

## 2. Quy tắc chọn từ ngoài vào trong [CDA]

Chủ dự án mô tả: việc chọn đi **từ phần tử lớn đến phần tử nhỏ hơn bên trong**. Lần chạm đầu tiên chọn **phần tử ngoài cùng**; chạm thêm một lần nữa vào phần tử đó, đúng chỗ có phần tử con, thì **bỏ chọn phần tử ngoài và chọn phần tử con** tại đúng điểm chạm. Ví dụ phần tử A chứa B và C: chạm A lần đầu → chọn A; chạm vào A lần nữa ở vị trí của C → chuyển sang chọn C. Lúc này mọi thao tác di chuyển, hiển thị sẽ do C nhận.

Áp vào các khái niệm ở [02](02-khai-niem-va-du-lieu.md), quy tắc được phát biểu đầy đủ như sau:

**Quy tắc 1 — không chọn gì thì cử chỉ dành cho canvas.** Khi chưa có phần tử nào được chọn, chụm hai ngón là phóng / thu canvas, kéo một ngón là dời canvas (hoặc cuộn dải slide), xoay hai ngón không làm gì [ĐX] — kể cả khi các ngón tay đặt đúng lên một tấm ảnh.

**Quy tắc 2 — chạm lần đầu chọn phần tử ngoài cùng.** Khi chưa chọn gì, chạm vào một điểm sẽ chọn phần tử **ngoài cùng** (không có cha) đang nằm trên cùng tại điểm đó. Chạm vào một ô trong lưới → chọn **cả khối bố cục**, không phải ô. Chạm vào một chữ đặt tự do → chọn chữ đó (chữ không có cha).

**Quy tắc 3 — chạm lại phần tử đang chọn để đi vào trong.** Khi một phần tử đang được chọn và người dùng chạm một lần nữa **vào chính nó**, ở đúng chỗ có một **phần tử con**, thì phần tử đang chọn được bỏ chọn và **phần tử con tại điểm chạm** được chọn. Từ khối bố cục, chạm lại vào một ô có ảnh → chọn ảnh trong ô đó. Nếu chỗ chạm không có phần tử con (ví dụ khe trắng giữa hai ô), không có gì thay đổi.

**Quy tắc 4 — phần tử đang chọn nhận mọi thao tác.** Khi một phần tử được chọn, các cử chỉ **luôn** tác động lên phần tử đó:
- với **khối bố cục**: kéo một ngón là dời cả khối; chụm là co giãn cả khối; xoay hai ngón là xoay cả khối;
- với **ảnh trong ô**: kéo là **dời ảnh bên trong ô** (ô đứng yên); chụm là **phóng ảnh trong ô**, không được thu nhỏ hơn mức phủ kín ô; xoay hai ngón là xoay ảnh trong ô;
- với **phần tử tự do** (chữ, sticker, ảnh tự do, hình…): kéo là dời; chụm là co giãn; xoay hai ngón là xoay.

Theo chủ dự án, khi đang chọn C thì **việc di chuyển hiển thị C sẽ luôn nhận được** — tức là người dùng không phải đặt ngón tay chính xác lên C mới kéo được; đề xuất cụ thể là cử chỉ bắt đầu **ở bất cứ đâu trên canvas** cũng tác động lên phần tử đang chọn [ĐX]. Điều này giúp chỉnh những phần tử nhỏ dễ dàng mà không che mất chúng bằng ngón tay.

**Quy tắc 5 — chạm sang phần tử khác thì chọn luôn nó; chạm ra ngoài thì bỏ chọn.** Chủ dự án đã chốt (Q-E3, 2026-10-17): **đang chọn một thứ mà chạm vào một thứ khác thì chuyển sang chọn thứ khác luôn** — một chạm, không phải bỏ chọn trước. "Thứ khác" được chọn theo quy tắc 2, tức là phần tử ngoài cùng tại điểm chạm. **Chạm ra chỗ không thuộc phần tử nào** (vùng trống của slide hoặc nền đen quanh canvas) thì **bỏ chọn**; sau đó cử chỉ quay về dành cho canvas [CDA].

**Quy tắc 6 — ô ảnh trống: chạm đúng dấu + là thêm ảnh ngay.** Chủ dự án đã chốt (Q-E1, 2026-10-17) [CDA]. "Ô ảnh trống" là chỗ chứa ảnh chưa có ảnh: hình xám có **dấu + tròn** ở giữa. Có hai tình huống:

- **Ô ảnh đứng riêng** — ví dụ một chỗ chứa ảnh / một khung đặt thẳng lên một slide trắng, không nằm trong lưới hay template nào. Ô này **là phần tử ngoài cùng**, nên chạm vào nó là **chọn luôn nó** (không có cha để chọn trước). Chạm đúng vào dấu + cũng mở ngay "Lấp đầy khung" như tình huống dưới [ĐX — để thao tác thống nhất].
- **Ô ảnh nằm trong một lưới / template** (ví dụ slide tạo từ mục Bố cục hoặc Lưới — IMG_3959, IMG_3960). Có hai khả năng tuỳ chỗ chạm:
  - chạm **trúng dấu + tròn** → **mở ngay** sheet **"Lấp đầy khung"** (IMG_3971) để chọn ảnh / video / tệp, kể cả khi đang chưa chọn gì; ô đó trở thành **ô đang chọn** (dùng cho thứ tự điền ảnh — [09](09-anh-va-video.md));
  - chạm **vào phần còn lại của ô** (không trúng dấu +) → hiểu là **chọn phần tử cha** (cả lưới / khung chứa nó) theo quy tắc 2, vì lúc này ở chỗ đó **chưa có phần tử con** (chưa có ảnh) để đi vào.

Vùng chạm của dấu + lớn hơn hình vẽ của nó: hình tròn hiển thị khoảng 28 px nhưng vùng nhận chạm là hình tròn đường kính 44 px quanh tâm [ĐX], để dễ bấm trúng mà không lấn hết ô. Khi canvas đang thu nhỏ đến mức ô nhỏ hơn vùng chạm, vùng chạm co lại bằng ô.

**Quy tắc 7 — phần tử bị khoá.** Phần tử bị khoá vẫn chọn được (để mở khoá, đổi kiểu, thay ảnh…), nhưng không kéo, co giãn hay xoay được. Phần tử khoá không có tay nắm và không dời / phóng được ảnh bên trong; chỉ dấu + của ô trống vẫn thêm được ảnh (D-101, thay D-85).

## 3. Bảng tình huống

| Đang ở trạng thái | Người dùng làm | Kết quả |
|---|---|---|
| Không chọn gì | Chụm hai ngón (ở bất kỳ đâu, kể cả trên ảnh) | Phóng / thu canvas |
| Không chọn gì | Kéo một ngón | Dời canvas khi đang phóng, hoặc cuộn dải slide |
| Không chọn gì | Chạm một ô trong lưới (có ảnh, hoặc ô trống nhưng **không trúng** dấu +) | Chọn **cả khối bố cục** |
| Bất kỳ | Chạm **trúng dấu +** của một ô trống | Mở **Lấp đầy khung** ngay cho ô đó |
| Không chọn gì | Chạm ô ảnh trống **đứng riêng** trên slide | Chọn ô đó |
| Không chọn gì | Chạm một chữ / sticker / ảnh tự do | Chọn phần tử đó |
| Không chọn gì | Chạm vùng trống | Không có gì xảy ra |
| Đang chọn khối | Kéo một ngón | Dời cả khối (các ô và ảnh đi theo) |
| Đang chọn khối | Chụm / xoay hai ngón | Co giãn / xoay cả khối |
| Đang chọn khối | Chạm lại vào một ô **có ảnh** | Chọn **ảnh trong ô** đó |
| Đang chọn khối | Chạm lại vào một ô **trống** (không trúng dấu +) | Giữ chọn khối [ĐX] |
| Đang chọn khối | Chạm vào khe giữa các ô | Giữ nguyên chọn khối |
| Đang chọn ảnh trong ô | Kéo một ngón | **Dời ảnh trong ô**, ô đứng yên |
| Đang chọn ảnh trong ô | Chụm | **Phóng ảnh trong ô**, không nhỏ hơn mức phủ kín |
| Đang chọn ảnh trong ô | Chạm vào phần tử khác | Chọn luôn phần tử ngoài cùng đó |
| Đang chọn bất kỳ | Chạm chỗ không thuộc phần tử nào | Bỏ chọn |
| Đang chọn chữ | Chạm lại vào chữ | Vào chế độ gõ chữ (xem [10](10-chu.md)) |
| Đang chọn bất kỳ | Bấm ✕ trên thanh công cụ | Bỏ chọn |
| Đang chọn bất kỳ | Mở một bottom sheet công cụ | Vẫn giữ chọn; sheet tác động lên phần tử đang chọn |

## 4. Phản hồi thị giác

Người dùng phải luôn thấy được đang chọn cái gì. Khi chọn khối bố cục, khung chọn bao **cả khối**. Khi đi vào ảnh trong ô, khung chọn chuyển sang bao **toàn bộ ảnh** — kể cả phần ảnh đang bị ô che khuất (IMG_3973, IMG_3974) — để người dùng biết ảnh còn dư bao nhiêu ở mỗi phía; phần ảnh nằm ngoài ô hiện mờ [ĐX]. Thanh công cụ ở đáy đổi theo phần tử đang chọn (khối có Bố cục / Điều chỉnh…, ảnh có Thay / Cắt / Chỉnh…) — chủ dự án mô tả: **khi chọn đến một ảnh bên trong slide thì ẩn các chức năng của slide, thanh công cụ hiện theo thanh của ảnh** [CDA]. Chuyển giữa các trạng thái chọn có hiệu ứng khung chọn co / giãn về kích thước mới trong khoảng 150 ms [ĐX].

## 5. Chọn nhiều [QS]

Mục **Chọn nhiều** có trong menu ⋯ của thanh nổi và trong menu ⋯ của dự án (IMG_3969, IMG_3996). Khi bật, phía trên canvas hiện dải thông báo "Chọn nhiều — chạm để thêm / bớt" kèm nút **Xong**. Mỗi lần chạm vào một phần tử ngoài cùng sẽ thêm nó vào hoặc bỏ nó khỏi tập đang chọn; khung chọn bao chung tất cả. Kéo bất kỳ phần tử nào trong tập sẽ dời cả tập. Thanh công cụ đáy hiện các nút áp dụng cho nhiều phần tử: **Căn chỉnh** (căn trái / giữa / phải / trên / giữa / dưới theo nhau), **Nhóm** [ĐX], **Nhân bản**, **Xoá**. Bấm Xong để thoát [ĐX — tham chiếu không cho xem bên trong chế độ này].

## 6. Tiêu chí nghiệm thu

1. Dự án có một ảnh nền phủ kín slide: khi chưa chọn gì, chụm hai ngón trên ảnh thì **canvas** phóng to, ảnh không đổi.
2. Chạm một ô trong khối lưới → khung chọn bao cả khối, thanh đáy là thanh của khối.
3. Chạm lại vào ô có ảnh → khung chọn bao toàn bộ ảnh (lớn hơn ô), thanh đáy là thanh của ảnh.
4. Kéo khi đang chọn ảnh trong ô → ảnh dời trong ô, khối và ô không di chuyển.
5. Chụm thu nhỏ ảnh trong ô → dừng ở mức ảnh vừa phủ kín ô.
6. Chạm vùng trống → bỏ chọn; chụm tiếp → canvas phóng.
7. Phần tử khoá: chọn được, kéo không động; ảnh bên trong cũng đứng yên (D-101).
8. Không còn tình huống "định phóng canvas nhưng lại phóng ảnh" trong bất kỳ trạng thái nào.

## Cập nhật D-113 (2026-10-18) — ô là phần tử bình thường

- Chạm lần 1 chọn **khối**, chạm lần 2 chọn **ô** (như cũ).
- Ô đang chọn: **kéo = dời ô** trong khối; có tay nắm góc / cạnh để đổi cỡ và nút xoay, như mọi phần tử. Ô vẫn thuộc khối: kéo / xoay / đổi cỡ khối thì ô đi theo.
- Dời / phóng **ảnh bên trong ô**: **chụm 2 ngón** trên ô, hoặc nút **Cắt** (cắt ngay trên canvas).
- Ô của **khung từ thư viện** (cửa sổ cố định theo ảnh khung): giữ như cũ — kéo = dời ảnh, không có tay nắm.
- **Bố cục / Điều chỉnh** của khối xếp lại mọi ô theo mẫu; nếu các ô đã được chỉnh tay thì app báo một dòng.
- **Ô trống** (2026-10-18): chạm **đúng dấu + tròn** → chọn ô **và** mở "Lấp đầy khung"; chạm **chỗ khác trên ô** → **chỉ chọn ô**.
