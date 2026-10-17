# 07 — Khung chọn, thanh nổi, nút xoay, thước đo và thanh công cụ

Ảnh tham chiếu: IMG_3966 → IMG_3970, IMG_3973, IMG_3979, IMG_3980. Video: 2:42 → 3:06, 9:56 → 10:42.

## 1. Khung chọn

Khi một phần tử được chọn, quanh nó xuất hiện **khung chọn**: một đường viền mảnh (màu trắng ở chế độ tối, màu nhấn đậm ở chế độ sáng [ĐX]) bao đúng ranh giới của phần tử, xoay theo phần tử nếu phần tử đang xoay.

Ở **bốn góc** khung có bốn **tay nắm tròn** màu trắng, đường kính khoảng 14 px trên màn hình (vùng chạm thực tế 44 px). Kéo một tay nắm góc sẽ **co giãn giữ nguyên tỉ lệ**, điểm neo là góc đối diện [ĐX: giữ đúng hành vi của app hiện tại].

Ở **giữa bốn cạnh** có bốn **thanh ngắn** bo tròn (khoảng 16 × 5 px, nằm dọc theo cạnh). Kéo thanh ở cạnh nào sẽ **kéo dãn phần tử theo một chiều** của cạnh đó — kéo thanh cạnh phải sang phải thì phần tử rộng ra về bên phải, chiều cao giữ nguyên [QS]. Với ảnh tự do, kéo dãn một chiều thay đổi khung mà không làm méo ảnh: ảnh được cắt lại để phủ kín khung mới [ĐX]. Với chữ, kéo dãn ngang thay đổi chiều rộng vùng xuống dòng; chiều cao chữ tự tính theo nội dung [ĐX].

Khi đang chọn **ảnh trong ô**, khung chọn không bao ô mà bao **toàn bộ ảnh**, kể cả phần ảnh nằm ngoài ô (IMG_3973, IMG_3974). Tay nắm góc lúc này phóng / thu ảnh trong ô (không nhỏ hơn mức phủ kín ô).

## 2. Thanh nổi phía trên phần tử [QS]

Phía trên khung chọn, cách cạnh trên khoảng 12 px và căn giữa theo phần tử, là một **viên thuốc nổi** chứa ba nút icon:

- **🗑 Xoá** — xoá phần tử (hoàn tác được).
- **⧉ Nhân bản** — tạo bản sao lệch xuống – sang phải khoảng 24 px và chọn bản sao.
- **⋯ Thêm** — mở popup nhỏ ngay dưới nút với hai mục: **Khoá** (hoặc **Mở khoá** nếu đang khoá) và **Chọn nhiều** (IMG_3969).

Nếu phía trên phần tử không đủ chỗ (phần tử sát mép trên vùng làm việc), thanh nổi chuyển xuống dưới phần tử, bên dưới nút xoay [ĐX]. Thanh nổi **ẩn trong lúc kéo, chụm, xoay** và hiện lại khi thả tay, để không che phần tử (đã có trong app hiện tại).

## 3. Nút xoay phía dưới phần tử [CDA][QS]

Phía dưới khung chọn, cách cạnh dưới khoảng 16 px và căn giữa, có một **nút tròn nhỏ** (khoảng 28 px) mang icon mũi tên vòng **⟳**. Chủ dự án mô tả: **giữ và kéo để xoay, có hít về 0** [CDA].

Khi người dùng giữ nút xoay và kéo, phần tử xoay quanh tâm của nó theo góc giữa tâm và ngón tay. Khi góc tới gần **0°** (trong khoảng ±5°), phần tử **hít** đúng về 0° và có rung nhẹ; đề xuất hít thêm ở 90°, 180°, 270° [ĐX]. Trong lúc xoay, phía trên vùng làm việc hiện một nhãn nhỏ ghi số độ hiện tại (ví dụ "28°") — app hiện tại đã có nhãn này cho cử chỉ xoay hai ngón.

## 4. Thước đo kích thước bằng nhau [CDA][QS] (IMG_3967)

Chủ dự án mô tả: khi co giãn một phần tử, **có một tiện ích đo kích thước: khi kích thước của nó tương đương với một phần tử nào đó trên toàn bộ canvas thì hiện thêm một cái thước** (IMG_3967) [CDA].

Cách hoạt động: trong lúc người dùng kéo tay nắm để co giãn phần tử A, ứng dụng so sánh liên tục chiều rộng và chiều cao của A với chiều rộng, chiều cao của **mọi phần tử khác trên toàn bộ canvas** (không chỉ cùng slide). Khi chiều rộng của A bằng chiều rộng của một phần tử B (sai lệch trong khoảng 1 % hoặc vài pixel trên màn hình), ứng dụng:

- **hít** kích thước của A về đúng bằng B;
- vẽ một **thước màu xanh dương** — một đoạn thẳng nằm ngang có hai vạch đứng nhỏ ở hai đầu — sát phía trên cạnh của A **và** sát phía trên cạnh của B, để người dùng thấy hai phần tử nào đang bằng nhau. Nếu có nhiều phần tử cùng bằng, thước hiện trên tất cả.

Tương tự với chiều cao: thước nằm dọc, sát cạnh bên của các phần tử. Thước biến mất khi kích thước lệch ra khỏi ngưỡng hoặc khi thả tay.

Song song, khi **dời** phần tử, các **đường gióng** màu hồng (đã có) hiện khi tâm hoặc mép phần tử thẳng hàng với tâm / mép slide hoặc mép phần tử khác, kèm hít. Cả thước và đường gióng được bật / tắt bằng mục **Hít** trong menu ⋯ của dự án ([12](12-sheet-menu-xuat-lop.md)).

## 5. Thanh công cụ theo đối tượng [CDA][QS]

Khi chọn một phần tử, thanh công cụ mặc định ở đáy (Ảnh · Chữ · Sticker · Hình · +) **được thay** bằng thanh công cụ riêng của loại phần tử đó. Thanh này cũng là một viên thuốc nổi, nhưng dài hơn: mỗi nút có **icon và nhãn chữ nhỏ bên dưới**, và nếu không đủ chỗ thì thanh **trượt ngang** để thấy các nút còn lại (nút cuối cùng bị cắt một nửa ở mép để gợi ý còn nữa). Ở **cuối bên phải** thanh, tách riêng, là một nút tròn **✕** để **bỏ chọn** và quay về thanh mặc định [QS].

Các thanh công cụ quan sát được:

**Khối bố cục** (IMG_3966, IMG_3970): **Bố cục** (đổi kiểu chia) · **Điều chỉnh** (khe, lề, bo góc ô) · **Vị trí** · **Kiểu** · **Khoá** · **Nhân bản** · **Xoá**.

**Ảnh** — ảnh tự do, ảnh trong ô hoặc trong khung (IMG_4020 → IMG_4022): **Thay · Vị trí · Cắt · Kiểu · Chỉnh · Công cụ nền · Xoá vật thể · Mở rộng bằng AI · Lưu sticker · Khoá · Nhân bản · Làm trống · Xoá**. **Mở rộng bằng AI** bỏ (cần máy chủ); **Xoá vật thể** là AI chạy được trên máy nhưng nặng — chờ quyết (Q-E8). Chi tiết từng nút ở [09](09-anh-va-video.md).

**Ô trống** (sau khi đóng "Lấp đầy khung" mà không chọn ảnh — video 2:42): **Thay** (ở đây nghĩa là thêm ảnh) · **Vị trí** · **Kiểu**.

**Chữ** (IMG_3979, IMG_3980): **Sửa** · **Định dạng** · **Căn lề** · **Vị trí** · **Độ mờ** · **Khoá** · **Nhân bản** · **Xoá**.

**Sticker** (video 8:31): **Mở rộng** · **Lưu sticker** · **Khoá** · **Nhân bản** · **Xoá**. "Lưu sticker" lưu sticker (ví dụ sticker tạo từ ảnh tách nền) vào thư viện riêng của người dùng để dùng lại ở dự án khác [ĐX].

**Hình, khung, widget** [ĐX — không thấy rõ trong tham chiếu]: **Màu** · **Vị trí** · **Kiểu** · **Khoá** · **Nhân bản** · **Xoá**; widget có thêm **Sửa** để đổi chữ.

**Video** [ĐX — dựa trên M13 đã có]: **Thay** · **Cắt đoạn** · **Âm thanh** · **Chuyển động** · **Vị trí** · **Cắt** · **Kiểu** · **Chỉnh**.

Mỗi nút mở một bottom sheet tương ứng, mô tả ở [08](08-cac-sheet-chinh-sua.md), [09](09-anh-va-video.md), [10](10-chu.md). Nút **Khoá / Nhân bản / Xoá** tác động ngay, không mở sheet.

## 6. Tiêu chí nghiệm thu

1. Kéo thanh giữa cạnh phải của một ảnh → ảnh rộng ra về bên phải, không méo; kéo tay nắm góc → co giãn giữ tỉ lệ.
2. Thanh nổi 🗑 ⧉ ⋯ hiện phía trên phần tử; ⋯ có Khoá và Chọn nhiều; thanh ẩn khi đang kéo.
3. Giữ nút ⟳ kéo vòng → phần tử xoay, gần 0° thì hít đúng 0° kèm rung.
4. Co giãn ảnh A tới đúng chiều rộng ảnh B ở slide khác → thước xanh hiện trên cả A và B, kích thước hít đúng.
5. Chọn khối / ảnh / chữ → thanh đáy đổi đúng danh sách nút; thanh trượt ngang được; ✕ bỏ chọn.
