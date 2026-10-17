# Đặc tả Editor v2 — luồng, thao tác, giao diện (2026-10-17)

> Nguồn: **mô tả chi tiết của chủ dự án** (2026-10-17) + quan sát **65 ảnh chụp màn hình** và **1 video quay màn hình 11 phút 49 giây** (334 khung hình trích theo chuyển cảnh) của một ứng dụng tham chiếu.
> Ảnh / video gốc nằm ở `refs/` trên máy chủ dự án, **không đưa lên git**. Vì vậy tài liệu này mô tả lại đủ để hình dung khi không có ảnh: bố cục, vị trí, kích thước tương đối, nội dung từng màn. Mã ảnh (IMG_xxxx) và mốc thời gian video (m:ss) được giữ để đối chiếu khi có tệp.
> Ký hiệu: **[CDA]** = chủ dự án mô tả / yêu cầu trực tiếp · **[QS]** = quan sát từ ảnh / video · **[ĐX]** = đề xuất của tôi khi áp dụng vào app mình.
> Nguyên tắc chung: làm theo **cách hoạt động**; màu, icon, chữ, ảnh mẫu, template là **của mình**. Bỏ: đăng nhập, gói trả phí / dùng thử, kết nối mạng xã hội, quảng cáo.

---

## 0. Phong cách chung [QS]

- **Giao diện tối** toàn app: nền đen (#000–#111), panel xám đậm trong suốt mờ (kiểu "kính mờ" — blur nền phía sau), chữ trắng, icon nét mảnh trắng.
- **Nút dạng viên thuốc / tròn nổi**: các nhóm nút trên cùng và thanh công cụ dưới cùng là **khối bo tròn nổi**, không kéo sát mép màn hình (cách mép ~16 px).
- **Bottom sheet bo góc lớn** (~28 px), có tay cầm nhỏ ở mép trên, tiêu đề ở giữa, nút **✕** tròn bên phải.
- Ảnh mẫu / thumbnail **bo góc ~12 px**, lưới **2 cột**.
- Chuyển màn: màn chi tiết **trượt từ phải sang** (kiểu điều hướng iOS); sheet **trượt từ dưới lên**.

---

## 1. Trang chủ — thư viện template (IMG_3937 → IMG_3952, video 0:00 → 1:43)

### 1.1 Bố cục [QS]
- **Thanh trên** (nổi trên nội dung, trong suốt mờ): trái là nút **♡** (template đã thích) hình tròn; giữa là **công tắc 2 tab "For You / Discover"** dạng viên thuốc (tab đang chọn nền sáng hơn); phải là nút **🔍** tìm kiếm hình tròn.
- **Banner lớn** đầu trang (~55 % chiều cao màn): ảnh ghép lớn, tiêu đề chữ to (ví dụ "TOP TEMPLATES", "Make It a Story"), dòng phụ, nút trắng **"Explore Now"**; **trượt ngang** giữa nhiều banner, có **chấm chỉ trang** bên dưới (IMG_3937, IMG_4003).
- Ngay dưới banner: **2 thẻ ngang** — "Continue · 2 hours ago" (mở lại dự án gần nhất, có thumbnail nhỏ) và một thẻ kết nối mạng xã hội (**bỏ**) (IMG_4003, video 0:02).
- **Thanh điều hướng đáy** (nổi, viên thuốc, cách đáy ~20 px): 3 icon **Trang chủ / Thư mục dự án / Tài khoản** + nút **+** tròn tách riêng bên phải (tạo dự án mới).
- Một **thẻ quảng cáo gói trả phí** nổi trên thanh đáy — **bỏ**.

### 1.2 Danh sách theo nhóm [CDA][QS]
- Kéo **dọc** để xem các **nhóm template**. Mỗi nhóm: **tiêu đề đậm** + **dòng mô tả nhỏ** + mũi tên **›** (mở toàn bộ nhóm). Ví dụ các nhóm: "Fresh Picks for You — Your personalized recommendations", "Daily Essentials — Go-to templates for everyday posts", "In Fashion", "Postcards From — Share the places that stay with you", "Shot on Film — Give your photos an analog feel", "From the Archive", "Scribbles by Hand — Templates with hand-drawn details", "A Special Occasion", "Scrapbook Diaries — Piece together your favorite memories", "Less Is More — Keep it minimal and seamless", "Make It a Story".
- Trong mỗi nhóm, **trượt ngang** để xem thêm template của nhóm đó [CDA]. Thẻ template ~45 % chiều ngang màn hình, tỉ lệ dọc (4:5 / 9:16 tuỳ template).
- Cuối trang: nhóm **"Explore More"** dạng **lưới so le 2 cột** (masonry, cuộn vô hạn) (IMG_3944 → 3952).
- **Mỗi thẻ template** hiển thị: ảnh bìa (slide đầu); góc trên phải nút **♡** tròn; góc dưới trái 2 nhãn nhỏ **🖼 số ảnh** và **▢ số slide** (ví dụ "🖼 12 ▢ 6"); góc dưới phải **chấm** nếu có nhiều slide.

### 1.3 Chi tiết template (IMG_4003 → IMG_4004, video 0:40 → 1:30) [CDA][QS]
- Chạm thẻ → màn **"Template"** trượt từ phải, có nút **‹** quay lại.
- **Xem trước lớn** (~60 % màn hình) **trượt ngang từng slide**, có chấm chỉ slide; xem được từng slide trông thế nào, các thành phần, **kèm ảnh mẫu**.
- Dưới xem trước: các nhãn **"Portrait" · 🖼 16 · ▢ 8** (tỉ lệ, số ảnh, số slide); dòng tác giả + nút mạng xã hội (**bỏ**).
- **"Similar Templates"**: lưới template tương tự.
- **Thanh đáy cố định**: nút trắng lớn **"Use Template"** + nút **chia sẻ** + nút **♡**.
- **Use Template** → vào editor với **toàn bộ layout, chữ, hình, sticker, phần tử** của template nhưng **không kèm ảnh mẫu**: các ô ảnh **trống, nền xám, có dấu + tròn** ở giữa (IMG_4005).

## 2. Tạo dự án mới (IMG_3953 → IMG_3956, video 1:37 → 1:51) [CDA][QS]

- Nút **+** → **bottom sheet "New Project"** (chiếm ~30 % dưới màn hình): hàng **thẻ hình chữ nhật có đúng tỉ lệ** (cao thấp khác nhau theo tỉ lệ), chữ tỉ lệ ở giữa, tên dưới:
  **4:5 Portrait · 3:4 Portrait · 9:16 Story · 1:1 Square · 1.91:1 Landscape · W:H Other** (trượt ngang để thấy hết).
- **Other** → sheet **"Other"** danh sách: 2:3, 3:2, 3:4, 4:3, 5:4, 5:6, 16:9 (mỗi dòng có ›) và **Custom**.
- **Custom** → hộp thoại **"Custom Size"**: "Nhập chiều cao từ 565 đến 1920 px. Chiều rộng cố định 1080 px", ô nhập **Height**, nút **Cancel / Create**, bàn phím số bật sẵn.
- Chọn xong → vào editor với **1 slide trắng**.

## 3. Editor — bố cục và zoom (IMG_3957, IMG_3977, IMG_3978, video 1:51 → 2:14)

### 3.1 Bố cục [QS]
- **Nền đen**. Canvas (các slide xếp ngang) nằm **giữa màn hình**.
- **Trên cùng trái**: nút **‹** tròn (thoát). **Trên giữa–phải**: nhóm viên thuốc **↶ ↷ ⋯**. **Trên cùng phải**: nút **chia sẻ / xuất** tròn.
- **Dưới mỗi slide**: 2 nút tròn nhỏ **‖** (tay kéo đổi chỗ slide) và **⋯** (menu slide).
- **Bên phải slide cuối**: nút **+** tròn (thêm slide).
- **Thanh công cụ đáy trái** (viên thuốc nổi): **Ảnh · Chữ · Sticker · Hình · +** (5 icon). **Đáy phải**: nút **Lớp** tròn tách riêng.

### 3.2 Zoom [CDA][QS]
- Mặc định **không** phóng slide full màn: zoom vừa để **thấy hết các slide**. Thêm slide → **tự thu nhỏ** để vẫn thấy hết.
- Có **mức thu nhỏ nhất** (như IMG_3977: 1 slide 4:5 chỉ rộng ~25 % màn hình). Chụm nhỏ hơn mức đó → **tự bật về** mức nhỏ nhất.
- Phóng to: chụm hai ngón (khi **không chọn gì**, xem §5).
- Khi mở bottom sheet: canvas **bị đẩy lên** phía trên sheet (thu vừa phần còn lại) để vừa chỉnh vừa thấy kết quả (xem §9).

## 4. Slide

### 4.1 Menu "⋯" dưới slide (IMG_3958) [QS]
Popup nổi: **Add Left · Add Right** | **Duplicate**.

### 4.2 Thêm slide "+" (IMG_3959 → IMG_3964, video 1:56 → 2:30) [CDA][QS]
- Bottom sheet **"New Slide"** (kéo lên được tới gần full màn):
  - **Blank**: 1 ô trắng.
  - **Templates**: ~12 bố cục sẵn (1 ảnh, 2 ảnh chéo nhau, 2 cạnh nhau, 2 trên dưới, ảnh có viền, polaroid có băng dính, 2 khung đen…).
  - **Grids**: ~40 kiểu chia lưới (2–9 ô, chia ngang / dọc / không đều) — icon xám nhạt có đường chia trắng.
- Chọn → slide mới được thêm (bên phải) với các **ô ảnh trống có dấu +**.

### 4.3 Kéo đổi chỗ slide (IMG_3965, video 2:36) [CDA]
- **Giữ** nút **‖** dưới slide rồi **kéo ngang** → slide đổi vị trí trong dãy; **mọi phần tử trên slide đi theo**.
- Khi đang kéo: **các nút ở slide khác ẩn đi**; nút **‖** **di chuyển theo ngón tay (chỉ theo chiều ngang)** và to lên; các slide khác **tự dịch chỗ** để nhường vị trí.

## 5. Mô hình chọn và cử chỉ (cốt lõi) [CDA][QS]

1. **Không chọn gì** → mọi cử chỉ (chụm phóng / thu, kéo, xoay…) **dành cho canvas**.
2. **Chạm lần 1** vào một chỗ → chọn **phần tử cha ngoài cùng** tại đó (ví dụ khối lưới / bố cục của slide, IMG_3966).
3. **Chạm lần nữa** vào phần tử cha đang chọn, đúng chỗ có **phần tử con** → **bỏ chọn cha, chọn con** tại đúng điểm chạm (ví dụ một ô ảnh trong lưới, IMG_3973).
4. Đang chọn phần tử nào thì **mọi thao tác tác động lên phần tử đó**: kéo, chụm, xoay. Ví dụ đang chọn ảnh trong ô → kéo luôn là **dời ảnh trong ô**.
5. **Chạm ra ngoài** → bỏ chọn.
6. Ô ảnh **trống (dấu +)**: chạm vào → mở sheet **"Fill Frame"** (§7.1) thay vì chọn.

### 5.1 Khung chọn [QS]
- Viền trắng mảnh; **tay nắm tròn ở 4 góc**, **thanh ngắn ở giữa 4 cạnh** (kéo cạnh = kéo dãn một chiều).
- **Thanh nổi phía trên** phần tử: **🗑 Xoá · ⧉ Nhân bản · ⋯** (⋯ → **Lock**, **Select Multiple**) (IMG_3969).
- **Nút xoay tròn phía dưới** phần tử: giữ và kéo để xoay, **hít về 0°** [CDA].
- **Ảnh trong ô đang chọn**: khung chọn bao **toàn bộ ảnh**, kể cả phần bị ô che khuất (IMG_3973, IMG_3974) → thấy được ảnh lớn hơn ô bao nhiêu, kéo / phóng ảnh trong ô.
- **Đo khoảng cách / kích thước** (IMG_3967) [CDA]: khi co giãn, nếu kích thước bằng với một phần tử khác trên toàn bộ canvas → hiện **thước đo màu xanh** trên cả hai phần tử để báo "bằng nhau". Có **đường gióng** khi căn.

## 6. Thanh công cụ theo phần tử đang chọn (thay thế thanh mặc định) [CDA][QS]

Thanh đáy **đổi theo phần tử đang chọn**; có nút **✕** tròn bên phải để bỏ chọn. Trượt ngang nếu nhiều nút.

| Đang chọn | Nút |
|---|---|
| **Khối bố cục / lưới** (IMG_3966, IMG_3969–3970) | **Layout** (đổi kiểu chia) · **Adjust** (chỉnh khe / bo) · **Position** · **Style** · **Lock** · **Duplicate** · **Delete** |
| **Ảnh** (IMG_3973, video 3:57, 5:11) | **Replace** · **Position** · **Crop** · **Style** · **Edit** · **BG Tools** · **Remove Object** · **AI Expand** |
| **Ô ảnh trống** (video 2:42) | **Replace** (= thêm ảnh) · **Position** · **Style** |
| **Chữ** (IMG_3979 → 3980, video 9:26) | **Edit** · **Format** · **Align** · **Position** · **Opacity** · **Lock** · **Duplicate** · **Delete** |
| **Sticker** (video 8:31) | **Expand** · **Save Sticker** · **Lock** · **Duplicate** · **Clear** … |

### 6.1 Position (video 4:09 → 5:41) [QS]
Sheet 2 tab **Position / Advanced**:
- **Arrange**: Front · Forward · Backward · Back.
- **Nudge**: ← → ↑ ↓ (dịch từng chút).
- **Align**: Trái · Giữa · Phải · Trên · Giữa · Dưới (so với slide).
- **Fill**: **Height** (cao bằng slide) · **Width** (rộng bằng slide) · **Width 2×** (rộng bằng 2 slide — trải qua 2 slide).
- **Flip**: Ngang · Dọc.
- **Advanced**: ô số **Width / Height** (px) + nút khoá tỉ lệ, **X / Y**, **Rotation**.

### 6.2 Style (video 5:50 → 6:16) [QS]
- **Opacity** (thanh trượt + ô %), **Corner Radius** (thanh trượt + ô px), công tắc **Individual Corners** (bo từng góc riêng).
- **Shadow** › : công tắc + Opacity, Angle, Distance, Blur, Color.
- **Border** › : độ dày + màu.
- **Bảng màu** (dùng chung mọi nơi): nút **Custom Color** (chọn màu tự do), **Brand Colors** (màu thương hiệu, + để thêm), **Saved** (màu đã lưu), **Defaults** (lưới ~40 màu).

### 6.3 Edit ảnh — màn riêng (video 6:37 → 7:45) [QS]
- Mở **toàn màn hình** ảnh. Trên: **✕ · ↶ ↷ · so sánh (trước / sau) · ✓**.
- Thanh công cụ đáy trượt ngang: **Filter · Exposure · Brightness · Contrast · Highlights · … · Saturation · Blur · Sharpen · Grain · Reset**.
- Mỗi công cụ mở **sheet nhỏ** có tên + ✕ + **thanh trượt** + ô số (ví dụ Exposure 24, Contrast −10).
- **Filter**: dải thumbnail ảnh thật có tên theo bộ: Film II, Film III, Tri-X, HP53, Classic I–III, Evocative I–III, Polaroid I, Chroma I–III, Gold I–V…
- Công cụ đã chỉnh có **chấm đỏ** nhỏ trên icon.

### 6.4 BG Tools (video 8:12) [QS]
Sheet: **Remove BG · Cut Out · Erase**.

### 6.5 Chữ (video 9:20 → 10:42) [QS]
- Thêm chữ: hộp **"Add text"** đặt ở **góc trên trái của slide đang xem** (IMG_3979) [CDA], bàn phím bật ngay, sửa trực tiếp trên canvas.
- Thanh khi gõ: **A| (sửa) · Aa (định dạng) · ≡ (căn lề) · ✕**.
- **Format**: B · I · U · S (gạch ngang); **Font ›** (Inter…); **Style ›** (Bold Italic…); **Text Color ›**; **Size ›** (140 px); **Spacing ›** (0 % · 120 %); **Text Outline ›**.

## 7. Thêm ảnh

### 7.1 Fill Frame — chạm ô trống (IMG_3971, video 3:06 → 3:45) [CDA]
- Sheet **"Fill Frame"**: 3 nút tròn lớn **Image · Video · File** (File = ứng dụng Tệp trên iOS; Android: trình chọn tệp).
- **Image** → trình chọn ảnh **chọn nhiều**: tiêu đề **"Select up to N photos"**, tab **Photos / Collections**, nút ✕ và ✓, đáy **"Show Selected (k)"**.
- **N = tổng số ô ảnh còn trống trên toàn bộ dự án**.
- **Thứ tự điền** [CDA]: **ô đang chọn → các ô trống cùng slide → các slide từ đầu đến cuối**.
  Ví dụ: slide A có ô G, H; slide B có I, J, K; slide C có L; tất cả trống; đang chọn **K**:
  - chọn 1 ảnh → K;
  - chọn 3 ảnh → **K, I, J**;
  - chọn 6 ảnh → **K, I, J, G, H, L**.

### 7.2 Nút Ảnh trên thanh đáy (IMG_3978, video 8:00) [CDA]
- Chọn nhiều ảnh từ thư viện (**giới hạn ~10** để nhẹ máy [CDA]).
- Ảnh thêm thành **phần tử ảnh tự do**, đặt từ **vị trí trên–trái của slide đang hiện trên màn hình**.

## 8. Menu "+" — tạo lớp mới (IMG_3989) [CDA][QS]

Sheet **"New Layer"**, lưới icon tròn có nhãn: **Image · Video · File · Text · Sticker · Frame · Grid · Drawing · Widget · Shape · Brand Kit**.

- **Sticker** (IMG_3981 → 3982): nhóm **Recently Used**, **Top Stickers**, **Love**, **Scribble Frames**…; mỗi nhóm hiện ~7 mục + ô **"+37"** (xem cả nhóm); **ô tìm kiếm nổi** ở đáy sheet.
- **Shape** (IMG_3983 → 3988): nhóm **Basic** (vuông, tròn, tam giác, thoi, ngũ giác, lục giác, bán nguyệt, bình hành), **Lines** (liền, gạch, chấm, mũi tên), **Stars**, **Hearts**, **Arrows**, **Attention** (thẻ, ghim, lịch, bong bóng thoại…), **Banners**, **Flowers**, **Abstract**, **Ink** (con dấu bưu điện). Ô **"+N"** → màn danh sách đủ của nhóm, có nút **‹** quay lại (IMG_3988).
- **Frame** (IMG_3990 → 3993): **Instant** (polaroid nhiều kiểu, +31), **Film** (dải phim), **Camera** (khung máy ảnh, điện thoại), **Paper** (giấy răng cưa, tem), **Scribbles**, **Digital** (khung giao diện ứng dụng / tin nhắn / lịch), **Halloween**, **Other**.
- **Widget** (IMG_3994): **Tag** (nhãn bong bóng), **Message** (bong bóng tin nhắn xanh), **Location** (ghim + địa điểm), **Highlight** (chữ tô nền như bôi đen), **đồng hồ lật** (9:41).
- **Brand Kit** (IMG_3995): **Brand Logos** (+ Add Logo), **Brand Assets** (+).

## 9. Bottom sheet [CDA]
- **Kéo đổi chiều cao**: mặc định **50 %** màn hình, nhỏ nhất **50 %**, lớn nhất **95 %**.
- Mở sheet → **canvas bị đẩy lên** phía trên sheet, vẫn thấy rõ để vừa chọn vừa xem kết quả.

## 10. Menu trên cùng "⋯" (IMG_3996, IMG_3998, video 10:48 → 11:15) [QS]
- **Background** → sheet 3 tab **Solid / Gradient / Texture**: Solid = bảng màu (§6.2); Gradient = **Custom Gradient** (điểm dừng, góc, kiểu) + gradient mẫu; Texture = ~20 chất liệu (giấy, gỗ, đá, vải).
- **Ratio** → sheet đổi tỉ lệ (9:16 · 1:1 · 1.91:1 · W:H Other).
- **Snapping ›** → **On / Off**.
- **Select Multiple** (chọn nhiều phần tử).
- **Preview** (IMG_3997, video 11:27): xem như bài đăng — avatar + tên giả, **vuốt ngang các slide**, chấm chỉ slide, hàng icon ♡ 💬 ✈ 🔖. Mở ra có hiệu ứng **phóng từ nút**.

## 11. Xuất / chia sẻ (IMG_3999) [QS]
- Nút chia sẻ trên cùng phải → màn **"Export"**: công tắc **Carousel / Video**; **xem trước lớn** vuốt ngang các slide; nút **phóng to** và **"2× ⚙"** (chất lượng); hàng nút đáy: **Camera Roll · (mạng xã hội — bỏ) · Template Link · More**.

## 12. Lớp (IMG_4001) [QS]
- Nút **Lớp** đáy phải → sheet **"Layers"**: mỗi dòng là **ảnh thu nhỏ của chính lớp đó** trên nền ô cờ (thấy hình dạng thật), bên trái nút **⊖** (ẩn / xoá), bên phải tay kéo **≡** để đổi thứ tự.

## 13. Màn khác (video 11:38 → 11:41) [QS]
- Tab **Thư mục**: "Projects" với tab **All Projects / Folders / Scheduled / Published**, lưới thumbnail dự án.
- Tab **Tài khoản**: "More" — tài khoản, gói, Brand Kit, giới thiệu, pháp lý (**phần lớn bỏ**; giữ Brand Kit, giới thiệu, pháp lý / giấy phép).

---

## 14. So sánh với app hiện tại và đề xuất [ĐX]

| Mảng | Hiện tại | Cần làm |
|---|---|---|
| Phong cách | Nền sáng / tối theo máy, nút thường | Giao diện tối, panel kính mờ, nút / thanh nổi bo tròn (§0) |
| Trang chủ | 2 tab Template / Dự án, lọc theo nhóm | Banner trượt, "Tiếp tục", **nhóm cuộn dọc + trượt ngang**, "Khám phá thêm" lưới so le, nhãn số ảnh / slide, ♡ thích, tìm kiếm (§1) |
| Chi tiết template | Sheet xem trước nhỏ | Màn riêng trượt ngang từng slide, mẫu tương tự, nút Dùng template cố định (§1.3) |
| Tạo dự án | Màn chọn loại / tỉ lệ / số slide | Sheet thẻ tỉ lệ + Khác + Tuỳ chỉnh chiều cao 565–1920 (§2). Loại "Grid profile" của mình giữ thêm |
| Zoom canvas | Vừa màn 1 slide, chụm 20 %–400 % | Mặc định **thấy hết các slide**, tự thu khi thêm slide, bật về mức nhỏ nhất (§3.2) |
| Slide | Dải thumbnail dưới canvas | Nút **‖ ⋯** dưới mỗi slide, **+** sau slide cuối, kéo đổi chỗ, Add Left / Right / Duplicate, sheet New Slide (Blank / Templates / Grids) (§4) |
| **Chọn / cử chỉ** | Chọn phẳng, chụm vào là tự chọn | **Chọn cha trước, chạm lần nữa chọn con; không chọn = canvas** (§5, D-86). Cần mô hình **nhóm bố cục** (khối lưới chứa ô) |
| Khung chọn | Konva Transformer + menu nổi | Thanh nổi 🗑 ⧉ ⋯, **nút xoay dưới**, tay nắm cạnh, khung bao **toàn ảnh trong ô**, **thước đo bằng nhau** (§5.1) |
| Thanh công cụ | ≤ 5 nút + Xong | Thanh theo phần tử, trượt ngang, ✕ bên phải (§6) |
| Position / Style | Rải rác (Kiểu, ⋯) | Sheet **Position** (Arrange / Nudge / Align / Fill / Flip / Advanced số) và **Style** (Opacity, bo góc riêng từng góc, Shadow chi tiết, Border) (§6.1–6.2) |
| Edit ảnh | Sheet Chỉnh màu / Filter trên canvas | Màn **toàn màn hình** có so sánh, công tắc chấm đỏ, thêm Blur / Sharpen / Saturation (§6.3) |
| Thêm ảnh | Chạm ô trống mở trình chọn 1 ảnh | Sheet **Fill Frame** (Ảnh / Video / Tệp); **chọn nhiều tới số ô trống**; **thứ tự ô chọn → cùng slide → từ đầu** (§7.1) |
| Menu + | Thành phần / ⋯ | Sheet **New Layer** đủ mục; Shape theo nhóm có "+N"; Frame / Widget / Brand Kit (§8) |
| Bottom sheet | Cố định | **Kéo 50–95 %, đẩy canvas lên** (§9) |
| Nền | Màu / gradient / ảnh mờ | Thêm **Texture**, gradient tuỳ chỉnh (§10) |
| Lớp | Dòng chữ + icon | Dòng là **ảnh thu nhỏ của lớp** trên nền ô cờ (§12) |

### Thứ tự đề xuất
1. **M14 — Mô hình chọn & cử chỉ** (§5): nhóm bố cục (khối lưới chứa ô), chọn cha → con, không chọn = canvas, nút xoay dưới, khung bao ảnh trong ô, thước đo bằng nhau. *Nền tảng cho mọi phần còn lại.*
2. **M15 — Canvas & slide** (§3–4): zoom thấy hết slide, nút ‖ ⋯ + dưới slide, kéo đổi chỗ, sheet New Slide.
3. **M16 — Thêm ảnh** (§7): Fill Frame, chọn nhiều theo số ô trống, thứ tự điền.
4. **M17 — Thanh công cụ & sheet** (§6, §9): thanh theo phần tử, Position / Style đầy đủ, bottom sheet 50–95 % đẩy canvas.
5. **M18 — Giao diện tối & trang chủ** (§0–2): phong cách, trang chủ nhóm, chi tiết template, tạo dự án.
6. **M19 — Thư viện** (§8, §10, §12): Shape / Frame / Widget / Brand Kit, Texture, lớp có thumbnail, Edit ảnh toàn màn hình.

### Không làm
Đăng nhập, gói trả phí / dùng thử, kết nối & đăng thẳng mạng xã hội, lên lịch / "Published", Template Link (cần máy chủ), các công cụ AI cần máy chủ (Remove Object, AI Expand). **Remove BG** đã có (chạy trên máy).
