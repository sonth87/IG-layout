# 09 — Ảnh và video: thêm, thay, cắt, chỉnh, công cụ nền

Ảnh tham chiếu: IMG_3971 → IMG_3974, IMG_3978. Video: 3:06 → 4:03 (thêm ảnh), 6:31 → 7:51 (chỉnh ảnh), 8:00 → 8:31 (thêm ảnh tự do, công cụ nền).

Có **hai cách thêm ảnh** với mục đích khác nhau: **điền vào ô trống** của bố cục (mục 1), và **thêm ảnh tự do** lên slide (mục 2).

## 1. Lấp đầy khung — điền ảnh vào ô trống [CDA][QS]

### 1.1 Mở sheet

Khi người dùng chạm **trúng dấu + tròn** của một **ô trống** (Q-E1 — xem quy tắc 6 ở [06](06-chon-va-cu-chi.md); chạm vào phần khác của ô trống trong lưới thì chỉ chọn lưới), ứng dụng đánh dấu ô đó là **ô đang chọn** và mở bottom sheet **"Lấp đầy khung"** (IMG_3971). Sheet này thấp (khoảng 25 % màn hình), có tiêu đề ở giữa và nút ✕, nội dung là **ba nút tròn lớn** (đường kính khoảng 64 px, nền xám) xếp hàng ngang, mỗi nút có icon và nhãn bên dưới:

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

Chủ dự án đã chốt (Q-E2, 2026-10-17): **bấm nút Ảnh ở thanh công cụ — tức là không phải đang chạm vào một ô ảnh trống — thì luôn thêm ảnh tự do như bình thường, không điền vào các ô trống**, kể cả khi dự án đang còn ô trống [CDA]. Điền vào ô trống chỉ xảy ra qua "Lấp đầy khung" (mục 1).

## 3. Thanh công cụ khi chọn ảnh [CDA][QS] (IMG_4020 → IMG_4022)

Khi chọn một ảnh (ảnh tự do, ảnh trong ô hay ảnh trong khung), thanh công cụ đáy có đủ các nút sau, trượt ngang để xem hết: **Thay · Vị trí · Cắt · Kiểu · Chỉnh · Công cụ nền · Xoá vật thể · Mở rộng bằng AI · Lưu sticker · Khoá · Nhân bản · Làm trống · Xoá**, và nút ✕ ở cuối để bỏ chọn.

Chủ dự án nhận định: trừ "Mở rộng bằng AI" (cần AI tạo thêm phần ảnh) thì các nút khác đều làm được. Cần lưu ý thêm là **"Xoá vật thể" cũng là một tính năng AI** (tô lên vật thể, máy tự vẽ lại phần nền phía sau): có thể chạy ngay trên máy giống xoá nền, nhưng mô hình nặng khoảng 200 MB và chạy chậm trên điện thoại — chủ dự án chốt **làm, để sau cùng** (Q-E8, 2026-10-17): đưa vào mốc cuối M20; trước đó nút này chưa hiện [CDA]. **"Mở rộng bằng AI" bỏ** (cần máy chủ).

## 4. Thay [CDA]

Nút **Thay** mở đúng sheet **"Lấp đầy khung"** như khi chạm ô trống (IMG_3971): ba nút **Ảnh · Video · Tệp** [CDA]. Khác ở chỗ khi Thay, người dùng chỉ chọn **một** ảnh / video. Ảnh mới thay vào đúng phần tử đang chọn, giữ nguyên khung, vị trí, kích thước, kiểu (bo góc, viền, bóng), độ mờ; nội dung được căn phủ lại vào khung. Bộ lọc và chỉnh màu của ảnh cũ được giữ cho ảnh mới [ĐX].

## 5. Vị trí

Sheet Vị trí của ảnh giống mục 1 của [08](08-cac-sheet-chinh-sua.md) (IMG_4006, IMG_4007): tab **Vị trí** có Sắp lớp (Lên trên cùng, Lên một lớp, Xuống một lớp, Xuống dưới cùng), Dịch (← → ↑ ↓), Căn (trái, giữa, phải, trên, giữa, dưới), Lấp đầy, Lật; tab **Nâng cao** có Rộng, Cao, nút khoá tỉ lệ, X, Y, Xoay.

## 6. Cắt [CDA][QS] (IMG_4008)

Chạm **Cắt**: canvas giữ nguyên chỗ cũ, nhưng tại phần tử đang chọn ứng dụng **hiện toàn bộ tấm ảnh gốc**. Phần ảnh nằm **trong khung hiển thị** sáng bình thường; phần ảnh **nằm ngoài khung** hiện **mờ đi** (phủ một lớp tối bán trong suốt), để người dùng thấy cả tấm ảnh và biết phần nào đang được dùng [CDA]. Khung hiển thị có bốn tay nắm góc và bốn thanh giữa cạnh. Người dùng có thể:

- **kéo tấm ảnh** (chạm vào phần ảnh rồi kéo) để **đổi vị trí hiển thị** của ảnh trong khung;
- **kéo tay nắm của khung** để đổi vùng cắt;
- **chụm** để phóng / thu tấm ảnh so với khung.

Ở đáy là sheet **"Cắt"** gồm: dòng **Tỉ lệ khung** với các nút icon hình chữ nhật đúng tỉ lệ kèm nhãn **1:1, 2:3, 3:4, 4:3, 4:5, 9:16, 16:9** (chạm để ép khung về tỉ lệ đó; chạm lại để bỏ ép — tự do [ĐX]); và dòng **Xoay** với thanh trượt (0 ở giữa, khoảng −45° đến 45°) và ô số độ, xoay tấm ảnh bên trong khung (ảnh tự phóng để khung không lộ khoảng trống — như "nắn thẳng" hiện có). Nút ✕ đóng sheet và giữ thay đổi [QS: tham chiếu không có nút ✓ riêng]; hoàn tác được như một bước.

Với **ảnh trong ô / trong khung**, khung cắt chính là hình của ô / khung (không đổi được tỉ lệ), người dùng chỉ dời, phóng và xoay ảnh bên trong.

## 7. Kiểu [QS] (IMG_4009, IMG_4010)

Sheet **Kiểu** của ảnh: **Độ mờ** (thanh trượt + ô %), **Bo góc** (thanh trượt + ô px), công tắc **Bo từng góc** — khi bật, thanh trượt được thay bằng **bốn ô số** xếp 2 × 2, mỗi ô có icon góc tương ứng (trên trái, trên phải, dưới trái, dưới phải); dòng **Bóng** (ghi "Tắt" / "Bật", có ›); dòng **Viền** (ghi "0 px", có ›). Chi tiết bóng và viền ở [08](08-cac-sheet-chinh-sua.md).

## 8. Chỉnh ảnh — màn toàn màn hình [QS] (IMG_4011 → IMG_4014, video 6:31 → 7:51)

Nút **Chỉnh** mở một **màn riêng toàn màn hình**, nền đen, tấm ảnh hiện đầy chiều ngang ở giữa, để người dùng tập trung chỉnh màu.

**Thanh trên**: bên trái nút **✕** (huỷ mọi thay đổi trong lần mở này); bên phải viên thuốc **↶ ↷** (hoàn tác / làm lại trong màn chỉnh) và nút **✓** (áp dụng và quay về). Trong video còn có nút **so sánh** (giữ để xem ảnh gốc) — giữ lại.

**Thanh công cụ đáy** (trượt ngang), đúng thứ tự quan sát: **Bộ lọc · Phơi sáng · Độ sáng · Tương phản · Vùng sáng · Vùng tối · Nhiệt độ màu · Sắc thái (tint) · Độ rực · Bão hoà · Làm mờ · Làm nét · Hạt · Đặt lại**. App mình đã có gần đủ các thông số này (13 thông số); cần thêm **Làm mờ** và **Làm nét**, và có thể giữ thêm "Sắc độ (hue)", "Làm tối viền (vignette)", "Bạc màu (fade)" đang có.

Chạm một công cụ mở **sheet nhỏ** ở đáy: tên công cụ ở giữa, ✕ ở phải, **thanh trượt** có 0 ở giữa và **ô số** giá trị. Ảnh cập nhật ngay khi kéo. Công cụ **đã chỉnh** có **chấm đỏ nhỏ** trên icon. **Đặt lại** đưa mọi giá trị về 0 và bỏ bộ lọc (mờ đi khi chưa chỉnh gì).

**Bộ lọc** (IMG_4014): tham chiếu hiện một dải thumbnail của chính tấm ảnh áp từng bộ lọc (Không, Film I, Film II, Film III…). Chủ dự án yêu cầu **dùng bộ lọc của mình**: bộ lọc được **chia theo nhóm** (hiện có 6 nhóm: Đơn sắc, Cổ điển, Hiện đại, Thiên nhiên, Ẩm thực, Tương lai), và **thêm tab "Tất cả"** đứng đầu để hiện toàn bộ bộ lọc [CDA]. Bố cục: hàng tab nhóm ở trên (Tất cả · Đơn sắc · Cổ điển · …), dưới là dải thumbnail trượt ngang của nhóm đang chọn, ô đầu tiên luôn là **Không**; bộ lọc đang dùng có viền sáng; chạm lại bộ lọc đang dùng để hiện thanh **cường độ**.

Bấm ✓: mọi thay đổi trong lần mở màn chỉnh thành **một bước hoàn tác** trong editor.

## 9. Công cụ nền [CDA][QS] (IMG_4015 → IMG_4018)

Nút **Công cụ nền** mở sheet **"Công cụ nền"** với ba nút tròn có nhãn:

**Xoá nền** — tách chủ thể, xoá nền thành trong suốt, chạy ngay trên máy (đã có từ M12). Sau khi đã xoá nền hoặc cắt rời, nút này đổi thành **Khôi phục nền** để lấy lại ảnh gốc (IMG_4018).

**Cắt rời** [CDA] — cho phép người dùng **vẽ một hình bất kỳ và cắt ảnh theo hình đó**. Diễn biến (IMG_4016 → IMG_4018):
1. Mở một màn toàn màn hình như màn Chỉnh: ✕ ở trái, ↶ ↷ và ✓ ở phải, tấm ảnh ở giữa.
2. Người dùng **vẽ bằng một ngón tay** một đường khép kín quanh vùng muốn giữ. Đường vẽ hiện là **nét đứt màu vàng**; điểm đầu và điểm cuối của nét có **chấm tròn vàng**; khi thả tay, đường tự **khép lại** bằng một đoạn thẳng nối điểm cuối với điểm đầu.
3. Ngay khi khép, phần ảnh **nằm ngoài** đường vẽ được **phủ màu đỏ** bán trong suốt để báo đó là phần sẽ bị bỏ (IMG_4017).
4. Người dùng có thể vẽ lại (↶ để xoá nét vừa vẽ).
5. Bấm ✓: ảnh trên canvas được **cắt theo đúng hình đã vẽ** — phần ngoài trở thành trong suốt; khung chọn vẫn là hình chữ nhật bao ảnh gốc (IMG_4018). Một bước hoàn tác.

**Tẩy** — cọ tẩy tay: tô lên vùng muốn xoá thành trong suốt; có thanh chỉnh cỡ cọ, chế độ khôi phục (tô lại để hiện lại phần đã tẩy) [ĐX về chi tiết].

## 10. Lưu sticker, Khoá, Nhân bản, Làm trống, Xoá [CDA][QS]

**Lưu sticker** — lưu ảnh đang chọn (thường là ảnh đã xoá nền / cắt rời) vào thư viện sticker riêng của người dùng ("Của tôi") để dùng lại ở dự án khác [ĐX].

**Khoá**, **Nhân bản** — như [08](08-cac-sheet-chinh-sua.md).

**Làm trống** (IMG_4019) [CDA] — **xoá ảnh nhưng giữ chỗ**: phần tử biến thành một **ô trống** cùng vị trí, kích thước, hình dạng, kiểu (nền xám, dấu + tròn ở giữa), để sau này điền ảnh khác vào. Áp dụng cho ảnh tự do, ảnh trong ô và ảnh trong khung.

**Xoá** [CDA] — **xoá luôn phần tử** khỏi canvas (với ảnh trong ô: xoá ảnh, ô thành trống [ĐX — xoá ô khỏi khối bố cục sẽ làm vỡ bố cục]).

## 7. Tiêu chí nghiệm thu

1. Chạm ô trống (theo quy tắc chọn) → sheet "Lấp đầy khung" có Ảnh, Video, Tệp.
2. Dự án G H / I J K / L trống, chạm K: chọn 1 ảnh → K; 3 ảnh → K, I, J; 6 ảnh → K, I, J, G, H, L.
3. Dự án còn 4 ô trống, chọn 6 ảnh → 4 ảnh được dùng, có thông báo.
4. Thêm 3 ảnh bằng nút Ảnh khi đang xem slide 2 → 3 ảnh tự do bắt đầu ở góc trên trái slide 2, lệch nhau.
5. Thay → sheet Ảnh / Video / Tệp; ảnh mới vào đúng khung, viền / bộ lọc giữ nguyên.
6. Cắt: thấy toàn bộ ảnh, phần ngoài khung mờ; kéo ảnh đổi vị trí hiển thị; chọn 4:5 → khung về 4:5; Xoay 10° → ảnh xoay trong khung.
7. Kiểu → Bo từng góc → 4 ô số; bo riêng góc trên trái.
8. Màn Chỉnh: chỉnh Phơi sáng → chấm đỏ; ✕ huỷ hết; ✓ thành một bước hoàn tác. Bộ lọc có tab Tất cả + các nhóm.
9. Cắt rời: vẽ vòng quanh chủ thể → phần ngoài phủ đỏ; ✓ → ảnh còn đúng hình đã vẽ; nút Xoá nền đổi thành Khôi phục nền.
10. Làm trống → phần tử thành ô trống có dấu + cùng chỗ; Xoá → phần tử biến mất.
