# Editor v2 — bản tóm tắt (tra nhanh)

> Bản đầy đủ, viết chi tiết từng phần: xem [README](README.md). Bản này chỉ để tra nhanh; khi hai bản khác nhau, **bản đầy đủ là chuẩn**.


> **Mục đích:** tài liệu để **triển khai** — mô tả đủ để làm và kiểm thử mà **không cần xem lại ảnh / video gốc**.
> **Nguồn:** (1) mô tả của chủ dự án ngày 2026-10-17 (chép nguyên văn ở **Phụ lục A**); (2) quan sát 65 ảnh chụp màn hình + 1 video quay màn hình 11:49 (334 khung hình trích theo chuyển cảnh) của ứng dụng tham chiếu. Ảnh / video ở `refs/` trên máy chủ dự án, **không đưa lên git** — danh mục mô tả từng ảnh ở **Phụ lục B**, mốc video ở **Phụ lục C**.
> **Ký hiệu nguồn:** **[CDA]** chủ dự án mô tả / yêu cầu · **[QS]** quan sát từ ảnh / video · **[ĐX]** đề xuất của tôi (chờ duyệt).
> **Nguyên tắc:** làm theo **cách hoạt động** (luồng, thao tác, quy tắc). Màu, icon, chữ, ảnh mẫu, template là **của mình** (D-66). **Bỏ:** đăng nhập, gói trả phí / dùng thử / màn mời nâng cấp, kết nối và đăng thẳng mạng xã hội, lên lịch đăng, tính năng cần máy chủ.
> **Cấu trúc mỗi tính năng:** Mục đích → Điểm vào → Bố cục → Hành vi → Trạng thái & trường hợp biên → Dữ liệu → Nghiệm thu.

---

## Mục lục
- [Phần 1 — Nguyên tắc giao diện](#phần-1--nguyên-tắc-giao-diện)
- [Phần 2 — Thuật ngữ và mô hình dữ liệu](#phần-2--thuật-ngữ-và-mô-hình-dữ-liệu)
- [Phần 3 — Trang chủ và template](#phần-3--trang-chủ-và-template)
- [Phần 4 — Tạo dự án](#phần-4--tạo-dự-án)
- [Phần 5 — Editor: bố cục, canvas, zoom](#phần-5--editor-bố-cục-canvas-zoom)
- [Phần 6 — Slide](#phần-6--slide)
- [Phần 7 — Chọn phần tử và cử chỉ](#phần-7--chọn-phần-tử-và-cử-chỉ)
- [Phần 8 — Khung chọn, thanh nổi, xoay, đo](#phần-8--khung-chọn-thanh-nổi-xoay-đo)
- [Phần 9 — Thanh công cụ theo đối tượng](#phần-9--thanh-công-cụ-theo-đối-tượng)
- [Phần 10 — Các sheet chỉnh sửa](#phần-10--các-sheet-chỉnh-sửa)
- [Phần 11 — Ảnh: thêm, thay, cắt, chỉnh, nền](#phần-11--ảnh-thêm-thay-cắt-chỉnh-nền)
- [Phần 12 — Chữ](#phần-12--chữ)
- [Phần 13 — Menu "+" và các thư viện](#phần-13--menu--và-các-thư-viện)
- [Phần 14 — Bottom sheet](#phần-14--bottom-sheet)
- [Phần 15 — Menu trên cùng, xem trước, xuất, lớp, hoàn tác](#phần-15--menu-trên-cùng-xem-trước-xuất-lớp-hoàn-tác)
- [Phần 16 — Quy tắc chung và trường hợp biên](#phần-16--quy-tắc-chung-và-trường-hợp-biên)
- [Phần 17 — So sánh với app hiện tại, lộ trình, câu hỏi mở](#phần-17--so-sánh-với-app-hiện-tại-lộ-trình-câu-hỏi-mở)
- [Phụ lục A — Nguyên văn mô tả của chủ dự án](#phụ-lục-a--nguyên-văn-mô-tả-của-chủ-dự-án)
- [Phụ lục B — Danh mục ảnh tham chiếu](#phụ-lục-b--danh-mục-ảnh-tham-chiếu)
- [Phụ lục C — Mốc video](#phụ-lục-c--mốc-video)

---

## Phần 1 — Nguyên tắc giao diện

### 1.1 Chế độ sáng / tối [CDA]
- Có **2 chế độ: Sáng và Tối**. **Mặc định theo hệ thống** (thiết bị đang sáng → app sáng; đang tối → app tối; đổi theo khi hệ thống đổi). Trong Cài đặt có thể chọn cố định Sáng / Tối / Theo hệ thống (đã có — giữ).
- Ảnh tham chiếu đều ở chế độ **tối**; chế độ **sáng** là bản đối ứng cùng bố cục: nền sáng, panel trắng / xám nhạt, chữ tối.

### 1.2 Phong cách chung [QS] (áp dụng cho cả 2 chế độ)
| Thành phần | Mô tả |
|---|---|
| Nền vùng làm việc (editor) | Tối: đen gần tuyệt đối (#000–#111). Sáng: xám rất nhạt [ĐX] để slide trắng vẫn nổi |
| Panel / thanh / sheet | Màu bán trong suốt + **làm mờ phần phía sau** (kính mờ). Tối: xám đậm ~85 % đục; sáng: trắng ~85 % đục [ĐX] |
| Nhóm nút | **Khối bo tròn hoàn toàn** (viên thuốc / hình tròn), **nổi**, cách mép màn ~12–16 px, không dính sát mép |
| Nút tròn đơn | Đường kính ~40–44 px (điểm chạm ≥ 44 px), icon ~20 px |
| Icon | Nét mảnh (~1.5 px), cùng một bộ |
| Bottom sheet | Bo góc trên ~28 px, tay cầm ngang nhỏ ở giữa mép trên, tiêu đề căn giữa, nút **✕** tròn ở góc phải tiêu đề, nút **‹** ở góc trái khi là màn con |
| Thẻ ảnh / template | Bo góc ~10–12 px |
| Ô chọn trong lưới (sticker, shape…) | Ô vuông bo ~14 px, nền xám đậm (tối) / xám nhạt (sáng), 4 cột |
| Chữ | Tiêu đề màn / sheet ~17 px đậm; nhãn nút ~11–12 px; tiêu đề nhóm ~15 px đậm + mô tả ~12 px nhạt |
| Chuyển màn | Màn con (chi tiết template, danh sách đủ của nhóm) **trượt từ phải sang**, quay lại trượt về phải. Sheet **trượt từ dưới lên**. Popup menu **phóng nhẹ từ nút bấm** |

### 1.3 Nghiệm thu
- [ ] Máy để chế độ tối → app tối; chuyển máy sang sáng khi đang mở app → app đổi sang sáng ngay.
- [ ] Mọi màn, sheet, popup trong tài liệu này dùng được ở cả 2 chế độ, chữ đủ tương phản (≥ 4.5 : 1 với chữ thường).

---

## Phần 2 — Thuật ngữ và mô hình dữ liệu

| Thuật ngữ | Nghĩa |
|---|---|
| **Dự án (project)** | Một bài đăng: 1 tỉ lệ khung, n slide, các phần tử |
| **Slide** | Một khung hình trong carousel. Các slide **nằm liền nhau theo chiều ngang** tạo thành một dải; phần tử có thể vắt qua ranh giới slide |
| **Phần tử** | Thứ đặt lên canvas: ảnh, video, chữ, sticker, hình, khung, widget, nét vẽ, **khối bố cục** |
| **Khối bố cục** (layout block) | Phần tử **chứa** các **ô** theo một kiểu chia (lưới / bố cục sẵn). Thêm slide từ "Templates / Grids" (Phần 6.3) tạo ra một khối bố cục phủ slide đó. Khối bố cục **là phần tử tự do**: di chuyển, co giãn (có thể to hơn slide, vắt sang slide khác), xoay được (Phần 8) |
| **Ô** (cell) | Vùng trong khối bố cục, chứa **0 hoặc 1 ảnh / video**. Ô trống hiển thị nền xám + **dấu + tròn** ở giữa |
| **Ảnh trong ô** | Ảnh nằm trong ô, bị ô cắt theo viền ô. Có thể **dời, phóng, xoay trong ô** mà ô đứng yên |
| **Phần tử cha / con** | Khối bố cục là **cha** của các ô; ô là cha của ảnh trong ô; nhóm (khi có) là cha của các phần tử trong nhóm |
| **Lớp** | Thứ tự trên–dưới của phần tử trong dự án |

**Dữ liệu cần thêm so với hiện tại [ĐX]:**
- `LayoutBlock { id, type: "layout", x, y, width, height, rotation, layout: LayoutKind, gap, radius, cells: Cell[] , locked, ... }`.
- `Cell { id, rect (tương đối trong khối, 0..1), media?: { assetId, crop, rotation, flip }, ... }`.
- Template = danh sách phần tử (khối bố cục, chữ, hình, sticker…) không kèm ảnh.
- Mỗi phần tử có `parentId` (để chọn cha → con) hoặc khối bố cục chứa ô lồng bên trong.
- **Chuyển đổi dữ liệu cũ:** các ô lưới hiện tại (`slot: true`) gom lại thành khối bố cục theo slide.

---

## Phần 3 — Trang chủ và template

### 3.1 Trang chủ — thư viện template [CDA][QS] (IMG_3937 → 3952, video 0:00 → 1:43)
**Mục đích:** người dùng duyệt template theo nhóm, chọn để làm bài.

**Bố cục (từ trên xuống):**
1. **Thanh trên nổi** (trong suốt mờ, đè lên nội dung khi cuộn): trái **♡** (danh sách template đã thích), giữa **công tắc 2 tab** viên thuốc **"Dành cho bạn / Khám phá"** (tab đang chọn nền sáng hơn), phải **🔍** (tìm kiếm).
2. **Banner lớn** (~55 % chiều cao màn hình): ảnh ghép nền, **tiêu đề chữ rất lớn** (ví dụ "TOP TEMPLATES", "Make It a Story"), dòng phụ, **nút trắng bo tròn "Khám phá ngay"**; **trượt ngang** giữa 3 banner, **chấm chỉ trang** bên dưới (chấm hiện tại dài hơn).
3. **Hàng 2 thẻ ngang** dưới banner: **"Tiếp tục · 2 giờ trước"** (thumbnail nhỏ của dự án mở gần nhất → chạm mở lại). Thẻ thứ hai trong tham chiếu là kết nối mạng xã hội — **bỏ**, thay bằng **"Tạo mới"** [ĐX].
4. **Các nhóm template** cuộn dọc. Mỗi nhóm:
   - Tiêu đề đậm + mũi tên **›** bên phải (chạm → màn danh sách đủ của nhóm), dòng mô tả nhạt bên dưới.
   - **Dải thẻ trượt ngang** [CDA]: thẻ rộng ~45 % màn, cao theo tỉ lệ template, khoảng cách ~8 px; thẻ cuối lộ một phần để gợi ý còn nữa.
   - Ví dụ nhóm trong tham chiếu: "Fresh Picks for You — gợi ý riêng", "Daily Essentials — template hằng ngày", "In Fashion", "Postcards From — nơi đã đến", "Shot on Film — cảm giác phim", "From the Archive", "Scribbles by Hand — nét vẽ tay", "A Special Occasion — dịp đặc biệt", "Scrapbook Diaries — ghép kỷ niệm", "Less Is More — tối giản, liền mạch", "Make It a Story — Story".
5. **"Khám phá thêm"** cuối trang: lưới **so le 2 cột** (masonry), cuộn tới đâu tải tới đó.
6. **Thanh điều hướng đáy nổi**: viên thuốc 3 icon **Trang chủ / Dự án / Cài đặt** [ĐX đổi "Tài khoản" thành "Cài đặt"] + **nút + tròn tách riêng** bên phải (tạo dự án mới, Phần 4). Tab đang mở có nền sáng hơn.

**Thẻ template:**
- Ảnh bìa = slide 1 (có ảnh mẫu).
- Góc trên phải: **♡** trong vòng tròn mờ — chạm để thích / bỏ thích (không mở template).
- Góc dưới trái: 2 nhãn viên thuốc nhỏ **🖼 số ô ảnh** và **▢ số slide** (ví dụ "🖼 12 ▢ 6").
- Góc dưới phải: **3 chấm nhỏ** khi có nhiều slide (gợi ý vuốt được).

**Hành vi:**
- Cuộn dọc mượt; thanh trên vẫn nổi.
- Trượt ngang trong một nhóm không làm cuộn dọc (khoá theo hướng vuốt đầu tiên).
- Chạm thẻ → **chi tiết template** (3.2).
- **Dành cho bạn:** các nhóm theo thứ tự cố định [ĐX: không có máy chủ nên "gợi ý" = nhóm hay dùng / mới thích]. **Khám phá:** toàn bộ template dạng lưới so le, có thanh nhóm ở trên [ĐX].
- **Tìm kiếm:** gõ tên / nhóm / từ khoá → kết quả dạng lưới so le [ĐX].
- **Thích:** lưu cục bộ; ♡ ở thanh trên mở danh sách đã thích.

**Nghiệm thu:**
- [ ] Banner trượt ngang, có chấm chỉ trang; nút Khám phá mở nhóm tương ứng.
- [ ] "Tiếp tục" mở đúng dự án gần nhất; ẩn khi chưa có dự án.
- [ ] Mỗi nhóm trượt ngang được; mũi tên › mở màn đủ nhóm (lưới 2 cột, nút ‹ quay lại).
- [ ] Thẻ có ♡ (bấm không mở template), số ô ảnh, số slide.
- [ ] Cuối trang có lưới so le.

### 3.2 Chi tiết template [CDA][QS] (IMG_4003 → 4004, video 0:40 → 1:30)
**Bố cục:**
- Thanh trên: **‹** (quay lại) + tiêu đề "Template".
- **Xem trước lớn** (~60 % chiều cao, gần full chiều ngang, bo góc): hiển thị **slide**, **vuốt ngang từng slide**, **chấm chỉ slide** ở cạnh dưới trong ảnh. Hiển thị **có ảnh mẫu** để thấy template trông thế nào [CDA].
- Hàng nhãn: **tỉ lệ** ("Dọc 4:5" / "Story 9:16"…) · **🖼 số ô ảnh** · **▢ số slide**.
- Hàng tác giả + nút mạng xã hội — **bỏ**.
- **"Template tương tự"**: lưới so le 2 cột.
- **Thanh đáy cố định**: nút **trắng lớn "Dùng template"** + nút tròn **chia sẻ** [ĐX: bỏ vì không có máy chủ, hoặc chia sẻ ảnh xem trước] + nút tròn **♡**.

**Hành vi "Dùng template"** [CDA]:
- Tạo **dự án mới** với **đúng tỉ lệ, số slide, toàn bộ khối bố cục, chữ, hình, sticker, khung, widget, nền** của template.
- **Không kèm ảnh mẫu**: mọi ô ảnh trống (nền xám + dấu + tròn) (IMG_4005).
- Mở editor ngay ở trạng thái "thấy hết slide" (Phần 5.2).

**Nghiệm thu:**
- [ ] Vuốt ngang xem từng slide, chấm chỉ slide đổi theo.
- [ ] Dùng template → editor có đủ phần tử, ô ảnh trống có dấu +, chữ giữ nguyên.

---

## Phần 4 — Tạo dự án
[CDA][QS] (IMG_3953 → 3956, video 1:37 → 1:51)

**Điểm vào:** nút **+** trên thanh điều hướng đáy (hoặc thẻ "Tạo mới").

**Bước 1 — sheet "Dự án mới"** (cao ~30 % màn, trượt từ dưới lên, ✕ ở phải tiêu đề):
- Một hàng **thẻ hình chữ nhật vẽ đúng tỉ lệ** (thẻ cao / thấp khác nhau, cùng đáy), chữ tỉ lệ ở giữa thẻ, tên dưới thẻ; **trượt ngang** để thấy hết:
  **4:5 Dọc · 3:4 Dọc · 9:16 Story · 1:1 Vuông · 1.91:1 Ngang · W:H Khác**.
- Chạm thẻ → tạo dự án **1 slide trắng** đúng tỉ lệ, vào editor.

**Bước 2 (khi chọn Khác) — sheet "Khác"**: danh sách dọc, mỗi dòng có ›: **2:3, 3:2, 3:4, 4:3, 5:4, 5:6, 16:9**, và **Tuỳ chỉnh**.

**Bước 3 (khi chọn Tuỳ chỉnh) — hộp thoại "Kích thước tuỳ chỉnh":**
- Dòng giải thích: "Nhập chiều cao từ **565** đến **1920** px. Chiều rộng cố định **1080** px."
- Ô nhập **Chiều cao**, **bàn phím số bật sẵn**.
- Nút **Huỷ** / **Tạo** (Tạo mờ khi chưa hợp lệ).
- Ngoài khoảng → báo lỗi dưới ô, không cho tạo.

**Khác biệt với app hiện tại [ĐX]:** app có thêm loại **Lưới profile** (Grid 3 × N) — giữ, thêm thẻ "Lưới profile" vào cuối hàng.

**Nghiệm thu:**
- [ ] 6 thẻ vẽ đúng tỉ lệ; chạm → editor 1 slide trắng đúng tỉ lệ.
- [ ] Tuỳ chỉnh: 564 / 1921 bị từ chối; 1200 → slide 1080 × 1200.

---

## Phần 5 — Editor: bố cục, canvas, zoom

### 5.1 Bố cục màn editor [QS] (IMG_3957, 3962, 3977, 3978)
| Vị trí | Thành phần |
|---|---|
| Trên cùng trái | Nút tròn **‹** — thoát về trang chủ (tự lưu) |
| Trên cùng giữa-phải | Viên thuốc **↶ (hoàn tác) · ↷ (làm lại) · ⋯ (menu dự án, Phần 15.1)**; ↶ / ↷ mờ khi không dùng được |
| Trên cùng phải | Nút tròn **chia sẻ / xuất** (Phần 15.3) |
| Giữa | **Canvas**: các slide xếp ngang liền nhau, ranh giới slide là **đường mảnh mờ** |
| Dưới mỗi slide | **‖** (tay kéo đổi chỗ, chỉ hiện khi có ≥ 2 slide) và **⋯** (menu slide), nút tròn nhỏ ~32 px, cách đáy slide ~16 px |
| Bên phải slide cuối | Nút tròn **+** ~44 px, giữa theo chiều dọc của canvas (thêm slide, Phần 6.3) |
| Đáy trái | **Thanh công cụ mặc định** viên thuốc: **Ảnh · Chữ · Sticker · Hình · +** |
| Đáy phải | Nút tròn **Lớp** (Phần 15.4) |

- Khi **chọn một phần tử**: thanh công cụ đáy **được thay** bằng thanh của phần tử đó (Phần 9); nút Lớp ẩn; ‖ ⋯ dưới slide vẫn hiện [QS].
- Khi mở **bottom sheet**: canvas bị **đẩy lên** (Phần 14).

### 5.2 Zoom canvas [CDA][QS]
- **Mặc định:** zoom sao cho **thấy hết toàn bộ các slide** trong vùng làm việc (không phóng một slide full màn).
- **Thêm slide** → **tự thu nhỏ** để vẫn thấy hết (có hiệu ứng mượt ~250 ms).
- **Mức nhỏ nhất:** mức "thấy hết slide" nhưng **không nhỏ hơn** mức tối thiểu cho 1 slide (IMG_3977: một slide 4:5 rộng ~25 % màn). Khi nhiều slide làm "thấy hết" nhỏ hơn mức tối thiểu → dừng ở mức tối thiểu, **cuộn ngang** để xem phần còn lại [ĐX].
- **Chụm thu nhỏ quá mức nhỏ nhất** → khi thả tay **bật về** mức nhỏ nhất (lò xo).
- **Chụm phóng to:** tối đa ~5× [ĐX]; kéo một ngón (khi không chọn gì) = **dời canvas** khi đang phóng.
- **Chạm đúp vùng trống** → về mức "thấy hết" [ĐX].
- **Chỉ khi không chọn phần tử nào** cử chỉ mới tác động lên canvas (Phần 7).

**Nghiệm thu:**
- [ ] Dự án 3 slide mở ra thấy đủ 3 slide.
- [ ] Thêm slide thứ 4 → tự thu nhỏ, vẫn thấy đủ (đến khi chạm mức tối thiểu).
- [ ] Chụm nhỏ hơn mức tối thiểu rồi thả → bật về.

---

## Phần 6 — Slide

### 6.1 Menu "⋯" dưới slide [QS] (IMG_3958)
Popup nổi phía trên nút (phóng từ nút), nền kính mờ, 3 mục có icon:
- **Thêm bên trái** — chèn slide trắng vào trước slide này.
- **Thêm bên phải** — chèn slide trắng vào sau.
- (vạch ngăn)
- **Nhân bản** — chèn bản sao (kèm mọi phần tử nằm trên slide) ngay sau.
- [ĐX] thêm **Xoá slide** (đỏ) — xác nhận nếu slide có nội dung; ẩn khi chỉ còn 1 slide.

### 6.2 Kéo đổi chỗ slide [CDA][QS] (IMG_3965, video 2:36)
- **Giữ** nút **‖** (~200 ms) rồi **kéo ngang**.
- Trong lúc kéo:
  - Nút **‖** **to lên** (~1.5×), **đi theo ngón tay chỉ theo chiều ngang** (không lên xuống).
  - **Các nút ‖ ⋯ của slide khác ẩn đi**; nút + ẩn.
  - Slide đang kéo **đi theo ngón tay**; các slide khác **tự dịch chỗ** (có hiệu ứng) để chừa vị trí cho slide đang kéo.
- Thả tay → slide nằm ở vị trí mới; **mọi phần tử nằm trên slide đó đi theo** [CDA] (dịch toạ độ đúng bằng khoảng dịch slide).
- Phần tử **vắt qua 2 slide**: đi theo slide chứa **tâm** của nó [ĐX].
- Một bước hoàn tác.

### 6.3 Thêm slide "+" — sheet "Slide mới" [CDA][QS] (IMG_3959 → 3964, video 1:56 → 2:30)
- Sheet mặc định 50 %, kéo lên tới ~95 %. Canvas bị đẩy lên phía trên.
- **Trắng**: 1 ô trắng → slide trắng.
- **Bố cục** (~12 mẫu): 1 ảnh lớn có lề; 2 ảnh chéo nhau; 2 ảnh cạnh nhau; 2 ảnh trên dưới; 1 ảnh ngang có lề; 1 ảnh vuông; 1 ảnh có viền dày; 2 ảnh có viền; 1 ảnh full có viền mảnh; 1 ảnh full; polaroid có miếng băng dính; 2 khung đen trên dưới…
- **Lưới** (~40 mẫu): chia 2–9 ô — 2 dọc, 2 ngang, 3 hàng, 1 lớn + 2, 2 × 2, 1 lớn + 3, cột không đều, 3 × 3… Icon xám nhạt có đường chia trắng.
- Chạm mẫu → thêm **slide mới vào cuối** (hoặc vị trí đang thêm), slide có **khối bố cục** với các **ô trống có dấu +** (IMG_3962). Sheet đóng.
- Ô trống: nền xám (~#C8C8CC), dấu + tròn xám đậm ~28 px ở giữa.

**Nghiệm thu:**
- [ ] ⋯ có Thêm trái / Thêm phải / Nhân bản; Nhân bản sao cả phần tử.
- [ ] Kéo ‖ đổi slide 1 ↔ 3: phần tử của slide 1 sang vị trí mới; các nút khác ẩn trong lúc kéo; một bước hoàn tác.
- [ ] Thêm slide "Lưới 2 × 2" → slide mới có khối bố cục 4 ô trống.

---

## Phần 7 — Chọn phần tử và cử chỉ

### 7.1 Quy tắc [CDA] (cốt lõi — D-86)
1. **Không chọn gì** → mọi cử chỉ (chụm phóng / thu, kéo, xoay hai ngón) **dành cho canvas**.
2. **Chạm lần 1** vào một điểm → chọn **phần tử ngoài cùng (cha)** chứa điểm đó. Ví dụ chạm vào một ô trong lưới → chọn **cả khối bố cục**.
3. **Chạm lần nữa** vào phần tử **đang chọn**, đúng chỗ có **phần tử con** → **bỏ chọn cha, chọn con** tại đúng điểm chạm. Ví dụ: A chứa B và C; chạm A lần 1 → chọn A; chạm A lần nữa ở vị trí C → chọn **C**.
4. Đang chọn phần tử nào thì **mọi thao tác chỉ tác động lên phần tử đó** — kéo, chụm, xoay luôn được nhận bởi nó [CDA]. Ví dụ đang chọn **ảnh trong ô** thì kéo = **dời ảnh trong ô**, chụm = **phóng ảnh trong ô**.
5. **Chạm ra ngoài** phần tử đang chọn (vùng trống hoặc phần tử khác **không phải con**) → **bỏ chọn**. [ĐX: chạm phần tử khác → bỏ chọn rồi chọn phần tử ngoài cùng tại đó, tức một chạm.]
6. **Ô ảnh trống** (dấu +): chạm vào khi khối cha **đã được chọn** → mở **"Lấp đầy khung"** (Phần 11.1) và đánh dấu ô đó là ô đang chọn [CDA]. [ĐX: chạm ô trống khi chưa chọn gì → chọn khối cha như quy tắc 2; chạm thêm lần nữa vào ô trống → mở "Lấp đầy khung".]

### 7.2 Bảng tình huống
| Trạng thái | Thao tác | Kết quả |
|---|---|---|
| Không chọn | Chụm 2 ngón | Phóng / thu canvas |
| Không chọn | Kéo 1 ngón | Dời canvas (khi đang phóng) / cuộn dải slide |
| Không chọn | Chạm ô trong lưới | Chọn **khối bố cục** |
| Chọn khối | Chạm lại vào ô có ảnh | Chọn **ảnh trong ô** |
| Chọn khối | Chạm lại vào ô trống | Mở **Lấp đầy khung** cho ô đó |
| Chọn khối | Kéo / chụm / xoay | **Dời / co giãn / xoay cả khối** |
| Chọn ảnh trong ô | Kéo | **Dời ảnh trong ô** (ô đứng yên) |
| Chọn ảnh trong ô | Chụm | **Phóng ảnh trong ô** (không nhỏ hơn mức phủ kín ô) |
| Chọn ảnh trong ô | Chạm ra ngoài ô | Bỏ chọn |
| Chọn chữ | Chạm lại vào chữ | Vào chế độ **gõ chữ** (Phần 12) |
| Chọn bất kỳ | Chụm ở chỗ **ngoài** phần tử | [ĐX] Vẫn tác động phần tử đang chọn (quy tắc 4) |
| Phần tử bị khoá | Chạm | Chọn được (để mở khoá / chỉnh kiểu); không kéo / co giãn / xoay được |

### 7.3 Chọn nhiều [QS]
- **⋯ (thanh nổi) → Chọn nhiều** hoặc **⋯ (menu dự án) → Chọn nhiều** → vào chế độ chọn nhiều: chạm từng phần tử để thêm / bớt; khung chọn bao tất cả; kéo = dời cả nhóm; thanh đáy: Căn chỉnh, Nhóm [ĐX], Nhân bản, Xoá, Xong.

**Nghiệm thu (tối thiểu):**
- [ ] Không chọn → chụm phóng canvas, kể cả khi ngón đặt lên ảnh.
- [ ] Chạm ô lần 1 chọn khối; lần 2 chọn ảnh trong ô; kéo dời ảnh trong ô, khối không động.
- [ ] Chạm vùng trống → bỏ chọn.
- [ ] Không còn tình huống "định phóng canvas nhưng lại phóng ảnh".

---

## Phần 8 — Khung chọn, thanh nổi, xoay, đo

### 8.1 Khung chọn [QS] (IMG_3966, 3970, 3973, 3979)
- Viền trắng mảnh (tối) / xanh đậm [ĐX] (sáng).
- **4 tay nắm tròn ở góc** (~14 px, điểm chạm 44 px): co giãn **giữ tỉ lệ**.
- **4 thanh ngắn ở giữa 4 cạnh** (bo tròn ~16 × 5 px): kéo dãn **một chiều**.
- Với **ảnh trong ô**: khung chọn bao **toàn bộ ảnh**, kể cả phần bị ô che (IMG_3973, 3974) — thấy được ảnh lớn hơn ô bao nhiêu; phần ngoài ô hiện **mờ** [ĐX] để biết đang bị cắt.

### 8.2 Thanh nổi phía trên [QS]
- Viên thuốc nổi cách cạnh trên khung chọn ~12 px, căn giữa: **🗑 Xoá · ⧉ Nhân bản · ⋯**.
- **⋯** → popup: **Khoá / Mở khoá**, **Chọn nhiều** (IMG_3969).
- Ẩn trong lúc kéo / chụm / xoay, hiện lại khi thả tay (đã có).

### 8.3 Nút xoay phía dưới [CDA][QS]
- Nút tròn **⟳** ~28 px, cách cạnh dưới khung ~16 px, căn giữa.
- **Giữ và kéo** quanh tâm phần tử để xoay; **hít về 0°** (và 90 / 180 / 270° [ĐX]) khi gần (±5°), rung nhẹ khi hít; hiện số độ khi xoay (đã có).

### 8.4 Đo kích thước bằng nhau [CDA][QS] (IMG_3967)
- Khi **co giãn** một phần tử, nếu **chiều rộng hoặc chiều cao** của nó **bằng** (sai số ~1 %) với một phần tử khác **trên toàn bộ canvas** → hiện **thước đo màu xanh dương** (đoạn thẳng có 2 vạch đầu) **trên cả hai phần tử** (cạnh trên với chiều rộng, cạnh bên với chiều cao) và **hít** vào đúng kích thước đó.
- Kết hợp với **đường gióng** khi dời (đã có): hít vào tâm / mép slide / mép phần tử khác.
- Bật / tắt bằng **⋯ → Hít** (Phần 15.1).

**Nghiệm thu:**
- [ ] Kéo tay nắm cạnh chỉ dãn 1 chiều; tay nắm góc giữ tỉ lệ.
- [ ] Co giãn ảnh A tới đúng rộng ảnh B → hiện thước xanh trên cả A và B, hít.
- [ ] Nút xoay dưới khung; hít 0°.

---

## Phần 9 — Thanh công cụ theo đối tượng
[CDA][QS] Thanh đáy **thay bằng** thanh của phần tử đang chọn; viên thuốc trượt ngang khi nhiều nút; nút **✕** tròn ở cuối bên phải để **bỏ chọn**. Mỗi nút: icon + nhãn nhỏ.

| Đang chọn | Nút (thứ tự) | Ảnh |
|---|---|---|
| **Khối bố cục** | **Bố cục · Điều chỉnh · Vị trí · Kiểu · Khoá · Nhân bản · Xoá** | IMG_3966, 3970 |
| **Ảnh** (tự do hoặc trong ô) | **Thay · Vị trí · Cắt · Kiểu · Chỉnh · Công cụ nền · (Xoá vật thể) · (Mở rộng AI)** | IMG_3973, video 3:57, 5:11 |
| **Ô trống** (đang chọn sau khi đóng Lấp đầy khung) | **Thay** (= thêm ảnh) · **Vị trí · Kiểu** | video 2:42 |
| **Chữ** | **Sửa · Định dạng · Căn lề · Vị trí · Độ mờ · Khoá · Nhân bản · Xoá** | IMG_3979, 3980 |
| **Sticker** | **Mở rộng · Lưu sticker · Khoá · Nhân bản · Xoá** | video 8:31 |
| **Hình / khung / widget** | [ĐX] **Màu · Vị trí · Kiểu · Khoá · Nhân bản · Xoá** | — |
| **Video** | [ĐX] **Thay · Cắt đoạn · Âm thanh · Vị trí · Cắt · Kiểu · Chỉnh** (đã có M13) | — |

- **Xoá vật thể, Mở rộng AI** cần máy chủ → **bỏ** (D-87). **Công cụ nền** dùng xoá nền trên máy (đã có).

---

## Phần 10 — Các sheet chỉnh sửa

### 10.1 Vị trí (Position) [QS] (video 4:09 → 5:41)
Sheet 2 tab viên thuốc **Vị trí / Nâng cao**, ✕ bên phải.

**Tab Vị trí** — 5 nhóm, mỗi nhóm có tiêu đề nhỏ, nút icon + nhãn:
| Nhóm | Nút | Hành vi |
|---|---|---|
| **Sắp lớp** | Lên trên cùng · Lên một lớp · Xuống một lớp · Xuống dưới cùng | Đổi thứ tự lớp |
| **Dịch** | ← → ↑ ↓ | Dịch 1 px theo toạ độ xuất (giữ nút = dịch liên tục, nhanh dần) [ĐX] |
| **Căn** | Trái · Giữa (ngang) · Phải · Trên · Giữa (dọc) · Dưới | Căn theo **slide chứa tâm** phần tử |
| **Lấp đầy** | Cao (bằng slide) · Rộng (bằng slide) · **Rộng 2×** (bằng 2 slide) | Co giãn giữ tỉ lệ rồi căn; **Rộng 2×** để phần tử vắt đều qua 2 slide liền nhau |
| **Lật** | Ngang · Dọc | Lật nội dung |

**Tab Nâng cao** — ô số: **Rộng / Cao (px)** + nút **khoá tỉ lệ**, **X / Y (px)**, **Xoay (°)**. Nhập số → áp dụng khi rời ô / Enter.

### 10.2 Kiểu (Style) [QS] (video 5:50 → 6:16)
- **Độ mờ**: thanh trượt + ô % (0–100).
- **Bo góc**: thanh trượt + ô px; công tắc **Bo từng góc** → 4 ô số cho 4 góc.
- **Bóng ›** (màn con có ‹): công tắc bật / tắt, **Độ mờ**, **Góc**, **Khoảng cách**, **Độ nhoè**, **Màu ›**.
- **Viền ›**: độ dày (px) + màu.
- Mỗi thay đổi xem trước ngay; ✕ đóng sheet; mỗi lần mở-đóng là **một bước hoàn tác** [ĐX — theo cách hiện tại của app].

### 10.3 Bảng màu dùng chung [QS] (video 6:13 → 6:18, 10:06)
Dùng cho mọi chỗ chọn màu (chữ, nền, viền, bóng, hình).
- Nút rộng **"Màu tuỳ chỉnh"** → bảng chọn màu tự do (vùng sắc độ + thanh màu + mã HEX) [ĐX].
- **Màu thương hiệu** (+ để thêm, "Sửa") — lấy từ Brand Kit (Phần 13.7).
- **Đã lưu**: các màu dùng gần đây / đã lưu.
- **Mặc định**: lưới ~40 màu (đen → trắng, rồi các màu bão hoà theo vòng màu, rồi pastel).

### 10.4 Bố cục (Layout) của khối [QS]
- Mở danh sách kiểu chia (như "Lưới" ở Phần 6.3) → đổi kiểu chia cho khối đang chọn; **ảnh đã có giữ lại** theo thứ tự ô [ĐX], ô dư trống, ảnh dư → hỏi / đặt thành ảnh tự do [ĐX].

### 10.5 Điều chỉnh (Adjust) của khối [ĐX — chưa thấy rõ trong tham chiếu]
- **Khe giữa ô** (px), **Lề ngoài**, **Bo góc ô**, **Màu nền khối**.

### 10.6 Khoá / Nhân bản / Xoá
- **Khoá**: phần tử không kéo / co giãn / xoay; vẫn chọn được để mở khoá (D-85).
- **Nhân bản**: bản sao lệch nhẹ (+24 px) và được chọn.
- **Xoá**: xoá ngay, hoàn tác được.

---

## Phần 11 — Ảnh: thêm, thay, cắt, chỉnh, nền

### 11.1 "Lấp đầy khung" — chạm ô trống [CDA][QS] (IMG_3971, video 3:06 → 3:45)
**Sheet "Lấp đầy khung"** (thấp, ~25 % màn): 3 nút tròn lớn ~64 px có nhãn: **Ảnh · Video · Tệp**.
- **Tệp**: trình chọn tệp hệ thống (iOS: ứng dụng Tệp; Android: trình chọn tệp) — chọn ảnh / video từ đó.

**Ảnh** → trình chọn ảnh **chọn nhiều** [CDA]:
- Tiêu đề **"Chọn tối đa N ảnh"**; tab **Ảnh / Bộ sưu tập**; ✕ trái, ✓ phải; đáy **"Đã chọn (k)"** để xem lại các ảnh đã chọn. [Ghi chú kỹ thuật: web dùng trình chọn ảnh của hệ thống; chặn quá N bằng cách chỉ lấy N ảnh đầu và báo "Chỉ dùng N ảnh đầu" [ĐX].]
- **N = tổng số ô ảnh đang trống trên toàn bộ dự án** [CDA].
- **Thứ tự điền** [CDA]: (1) **ô đang chọn** → (2) **các ô trống còn lại trong cùng slide** (theo thứ tự ô trong bố cục: trái → phải, trên → dưới) → (3) **các slide từ đầu đến cuối**, mỗi slide theo thứ tự ô.
  - Ví dụ: slide A có ô G, H; slide B có I, J, K; slide C có L; tất cả trống; đang chọn **K**:
    - chọn **1** ảnh → **K**;
    - chọn **3** ảnh → **K, I, J**;
    - chọn **6** ảnh → **K, I, J, G, H, L**.
- Ảnh vào ô được **căn phủ kín ô** (cover), tâm ảnh vào tâm ô.
- Một bước hoàn tác cho cả lần thêm.

**Video** → giống Ảnh nhưng chọn video (nén như M13).

**Nghiệm thu:**
- [ ] Ví dụ G H / I J K / L cho đúng 3 kết quả trên.
- [ ] Dự án 10 ô trống → trình chọn cho tối đa 10.

### 11.2 Nút "Ảnh" trên thanh đáy [CDA] (IMG_3978, video 8:00)
- Trình chọn **chọn nhiều**, **giới hạn ~10 ảnh** để nhẹ máy [CDA].
- Ảnh thêm thành **ảnh tự do**, đặt **bắt đầu từ góc trên–trái của slide đang hiện trên màn hình** (slide gần tâm màn nhất), mỗi ảnh tiếp theo lệch ~40 px xuống-phải [ĐX]; kích thước ~60 % chiều rộng slide [ĐX].
- [ĐX] Nếu dự án còn ô trống: hỏi "Điền vào ô trống hay thêm ảnh tự do?" — **chờ chủ dự án chốt** (Q-E2, Phần 17.3).

### 11.3 Thay (Replace)
- Mở trình chọn **1 ảnh** → thay ảnh trong phần tử / ô đang chọn, giữ khung, căn phủ lại.

### 11.4 Cắt (Crop)
- Màn cắt (đã có): tỉ lệ, nắn thẳng, xoay 90°, lật. Với ảnh trong ô: cắt = dời / phóng trong ô.

### 11.5 Chỉnh ảnh — màn toàn màn hình [QS] (video 6:31 → 7:51)
- Mở **toàn màn hình** chỉ có ảnh. Thanh trên: **✕ (huỷ) · ↶ ↷ (hoàn tác trong màn này) · ◧ so sánh (giữ để xem ảnh gốc) · ✓ (áp dụng)**.
- **Thanh công cụ đáy** trượt ngang: **Bộ lọc · Phơi sáng · Độ sáng · Tương phản · Vùng sáng · Vùng tối · … · Bão hoà · Làm mờ · Làm nét · Hạt · Đặt lại**.
- Chạm công cụ → **sheet nhỏ**: tên + ✕ + **thanh trượt** + ô số (giá trị âm / dương, 0 ở giữa).
- **Bộ lọc** → dải thumbnail **ảnh thật** áp từng bộ lọc, tên dưới thumbnail, bộ lọc đang dùng có viền; chạm lại để chỉnh cường độ [ĐX]. Tham chiếu có các họ: Film, Tri-X, Classic, Evocative, Polaroid, Chroma, Gold… — app mình dùng 25 bộ lọc của mình (M11), có thể thêm họ tương tự.
- Công cụ **đã chỉnh** có **chấm đỏ** nhỏ trên icon.
- ✓ → một bước hoàn tác trong editor.

### 11.6 Công cụ nền [QS] (video 8:12)
Sheet: **Xoá nền** (đã có, chạy trên máy) · **Cắt rời** (tách chủ thể thành sticker mới [ĐX]) · **Tẩy** (cọ tẩy tay thủ công [ĐX]).

---

## Phần 12 — Chữ
[CDA][QS] (IMG_3979 → 3980, video 9:20 → 10:42)

**Thêm:** nút **Chữ** trên thanh đáy → hộp chữ **"Thêm chữ"** đặt ở **góc trên–trái của slide đang hiện** [CDA], **bàn phím bật ngay**, gõ **trực tiếp trên canvas** (không mở hộp thoại riêng).

**Thanh khi đang gõ** (trên bàn phím): viên thuốc 3 nút **A| (Sửa) · Aa (Định dạng) · ≡ (Căn lề)** + ✕.

**Định dạng (Aa):**
- Hàng 4 nút: **B · I · U · S** (đậm, nghiêng, gạch chân, gạch ngang).
- **Phông ›** (danh sách phông, có tên phông hiện tại).
- **Kiểu ›** (Thường / Đậm / Nghiêng / Đậm nghiêng — theo phông).
- **Màu chữ ›** (bảng màu dùng chung).
- **Cỡ ›** (px).
- **Giãn cách ›** (giãn chữ % · giãn dòng %).
- **Viền chữ ›**.

**Căn lề (≡):** trái / giữa / phải / đều [ĐX].

**Hành vi:**
- Hộp chữ **tự rộng theo nội dung** đến khi chạm mép slide thì xuống dòng [ĐX].
- Chạm ra ngoài → kết thúc gõ, chữ vẫn được chọn.
- Chạm lại chữ đang chọn → vào gõ (Phần 7.2).
- Chữ rỗng khi kết thúc gõ → xoá phần tử [ĐX].

---

## Phần 13 — Menu "+" và các thư viện

### 13.1 Sheet "Lớp mới" [CDA][QS] (IMG_3989)
Lưới 4 cột nút tròn ~56 px + nhãn: **Ảnh · Video · Tệp · Chữ · Sticker · Khung · Lưới · Vẽ · Widget · Hình · Brand Kit**. Chạm → mở thư viện / trình chọn tương ứng.

### 13.2 Sticker [QS] (IMG_3981 → 3982)
- Nhóm theo hàng: **Dùng gần đây**, **Nổi bật**, theo chủ đề (Tình yêu, Khung vẽ tay…). Mỗi nhóm hiện **7 mục + ô "+N"** → màn đủ của nhóm (lưới 4 cột, ‹ quay lại).
- **Ô tìm kiếm nổi** dạng viên thuốc ở **đáy sheet** (đè lên nội dung).
- Sticker là **ảnh có nền trong suốt** (giấy, hoa, tim, băng dính…). App mình: 20 sticker vẽ + ~1.600 emoji (M11–M13).

### 13.3 Hình [QS] (IMG_3983 → 3988)
Nhóm (mỗi nhóm 4 cột, "+N" nếu nhiều):
| Nhóm | Ví dụ |
|---|---|
| Cơ bản | vuông, tròn, tam giác, thoi, ngũ giác, lục giác, bán nguyệt, bình hành |
| Đường | liền, gạch, chấm, mũi tên |
| Sao | sao 4 / 5 / 6 / 8 cánh |
| Tim | 3 kiểu tim |
| Mũi tên | ›, ←, ↱, ⇦ viền |
| Chú ý | thẻ người, ghim bản đồ, lịch, bong bóng thoại (tròn, mây, vuông) |
| Băng rôn | lục giác dẹt, nơ, cờ đuôi én, mũi tên dài |
| Hoa | cỏ 4 lá, sao hoa, hoa tròn, hoa 4 cánh nhọn, hoa răng cưa |
| Trừu tượng | vòm, sóng, chữ U, chữ Z, chữ X, móng ngựa, lò xo |
| Mực (con dấu) | tem răng cưa, dấu bưu điện các nước (dạng nét mực) |
- Hình xám trong thư viện; thêm vào canvas với màu mặc định, đổi màu bằng **Màu**.

### 13.4 Khung [QS] (IMG_3990 → 3993)
Khung là phần tử có **ô ảnh bên trong** (chạm ô → Lấp đầy khung):
| Nhóm | Ví dụ |
|---|---|
| Lấy liền | polaroid nhiều kiểu (viền dày đáy, viền đều, có vạch), +31 |
| Phim | dải phim ngang có lỗ, 3–4 khung |
| Máy ảnh | máy compact, máy số, máy cơ, điện thoại gập (ảnh nằm trong màn hình) |
| Giấy | giấy viền ren, giấy răng cưa (tem), giấy viền đôi |
| Vẽ tay | khung nét vẽ tay 1–4 ô |
| Kỹ thuật số | khung giao diện tin nhắn, ghi chú, lịch, lưới ứng dụng |
| Theo mùa | TV cổ, poster "WANTED"… |
| Khác | — |

### 13.5 Lưới
- Như "Lưới" trong Phần 6.3 nhưng thêm vào **slide đang xem** dưới dạng khối bố cục (không tạo slide mới).

### 13.6 Widget [QS] (IMG_3994)
| Widget | Mô tả | Chỉnh |
|---|---|---|
| **Nhãn** | bong bóng đen có đuôi, chữ trắng | chữ, màu |
| **Tin nhắn** | bong bóng xanh kiểu tin nhắn | chữ, màu |
| **Địa điểm** | viên thuốc trắng + icon ghim + tên địa điểm | chữ |
| **Tô sáng** | chữ có nền tô như bôi đen văn bản, 2 núm tròn ở 2 đầu | chữ, màu nền |
| **Đồng hồ lật** | đồng hồ số kiểu lật "9:41" | giờ |

### 13.7 Brand Kit [QS] (IMG_3995)
- **Logo thương hiệu**: ô "+ Thêm logo" → chọn ảnh → lưu cục bộ; chạm logo → thêm vào canvas.
- **Tài sản thương hiệu**: ô + → thêm ảnh / sticker riêng.
- **Màu thương hiệu**: dùng trong bảng màu (Phần 10.3).
- Lưu trong máy, dùng chung mọi dự án [ĐX].

### 13.8 Vẽ
- Đã có (M11): màu, cỡ nét, bỏ nét, ✓.

---

## Phần 14 — Bottom sheet
[CDA]
- Mọi sheet chọn nội dung (Slide mới, Sticker, Hình, Khung, Widget, Lớp mới, Lớp, Nền…) **kéo đổi chiều cao** bằng tay cầm / kéo nội dung khi đã cuộn tới đầu:
  - **Mặc định 50 %** chiều cao màn hình.
  - **Nhỏ nhất 50 %** (kéo xuống dưới 50 % rồi thả → **đóng sheet** [ĐX] hoặc bật về 50 %).
  - **Lớn nhất 95 %**.
  - Thả tay → bám về mốc gần nhất (50 % / 95 %) [ĐX].
- **Khi sheet mở, canvas bị đẩy lên**: vùng canvas co lại thành phần phía trên sheet và **zoom lại để thấy hết** trong phần đó, có hiệu ứng mượt — để vừa chọn trong sheet vừa thấy ngay kết quả trên canvas [CDA].
- Kéo sheet lên 95 % → canvas bị che (chấp nhận) [ĐX].
- Sheet công cụ nhỏ (Định dạng chữ, Vị trí, Kiểu, Bộ lọc…) có chiều cao vừa nội dung, cũng đẩy canvas lên.

---

## Phần 15 — Menu trên cùng, xem trước, xuất, lớp, hoàn tác

### 15.1 Menu "⋯" trên cùng [QS] (IMG_3996, 3998, video 10:48)
Popup kính mờ:
- **Nền** → sheet 3 tab **Màu / Chuyển màu / Chất liệu** (video 11:00 → 11:15):
  - **Màu**: bảng màu dùng chung.
  - **Chuyển màu**: nút **"Chuyển màu tuỳ chỉnh"** (thanh màu với các điểm dừng kéo được, ô vị trí %, **góc**, **kiểu** tuyến tính / toả tròn) + lưới chuyển màu mẫu (Đã lưu / Mặc định).
  - **Chất liệu**: lưới ~20 ô (giấy trắng, giấy kraft, gỗ, đá, vải lanh, giấy đen…).
- **Tỉ lệ** → sheet thẻ tỉ lệ như Phần 4 (đổi tỉ lệ cả dự án).
- (vạch ngăn)
- **Hít ›** → mở rộng tại chỗ: **Bật / Tắt** (dấu ✓ ở mục đang chọn).
- **Chọn nhiều**.
- (vạch ngăn)
- **Xem trước**.

### 15.2 Xem trước [QS] (IMG_3997, video 11:27)
- Mở toàn màn (hiệu ứng **phóng từ nút**): tiêu đề "Xem trước" + ✕.
- Giả lập bài đăng: avatar + tên giả, **vuốt ngang từng slide**, chấm chỉ slide, hàng icon ♡ 💬 ✈ và 🔖.
- (Đã có xem trước kiểu Instagram ở màn Xuất — tách thêm lối vào từ menu.)

### 15.3 Xuất [QS] (IMG_3999)
- Màn **"Xuất"** (✕ phải): công tắc **Carousel / Video** trên cùng.
- **Xem trước lớn** vuốt ngang các slide, chấm chỉ slide; góc dưới trái nút **⤢** (xem lớn); góc dưới phải **"2× ⚙"** (chất lượng / độ phân giải xuất) [ĐX: 1× / 2×].
- Hàng nút tròn đáy: **Lưu vào Ảnh · (mạng xã hội — bỏ) · (Liên kết template — bỏ) · Khác** (bảng chia sẻ hệ thống).
- App hiện có: ZIP, từng ảnh, chia sẻ, video 9:16 — sắp xếp lại theo bố cục này.

### 15.4 Lớp [QS] (IMG_4001)
- Sheet **"Lớp"**: mỗi dòng là **ảnh thu nhỏ của chính lớp đó** trên **nền ô cờ** (thấy đúng hình dạng / chữ), cao ~56 px.
- Trái: nút **⊖** (ẩn / hiện [ĐX] — tham chiếu không rõ), phải: tay kéo **≡** (giữ và kéo dọc để đổi thứ tự).
- Chạm dòng → chọn phần tử đó (đóng sheet).

### 15.5 Hoàn tác / làm lại
- ↶ ↷ trên cùng; không giới hạn số bước (đã có).

---

## Phần 16 — Quy tắc chung và trường hợp biên
1. **Một thao tác = một bước hoàn tác** (một lần kéo, một lần thêm nhiều ảnh, một lần đóng sheet Kiểu…).
2. **Tự lưu** sau mỗi bước (đã có).
3. Phần tử **vắt qua nhiều slide** thuộc về slide chứa **tâm** của nó khi cần quyết định (đổi chỗ slide, căn, xoá slide).
4. **Xoá slide** có nội dung → xác nhận; phần tử vắt sang slide khác bị cắt theo slide còn lại [ĐX].
5. **Chọn ảnh vượt số ô trống** → chỉ dùng N ảnh đầu, báo cho người dùng.
6. **Khoá**: khung đứng yên, ảnh trong khung vẫn dời / phóng được (D-85); khoá khối bố cục → ô bên trong vẫn chọn được [ĐX].
7. **Bàn phím mở** (đang gõ chữ): canvas đẩy lên trên bàn phím để thấy chữ.
8. **Xoay màn hình / cửa sổ đổi cỡ** → zoom lại "thấy hết".
9. **Không bôi đen / zoom cả trang** (D-67) — giữ.

---

## Phần 17 — So sánh với app hiện tại, lộ trình, câu hỏi mở

### 17.1 So sánh
| Mảng | App hiện tại | Cần làm (Phần) |
|---|---|---|
| Sáng / tối | Có, theo hệ thống | Đổi phong cách kính mờ, nút nổi (1) |
| Mô hình dữ liệu | Phần tử phẳng, ô lưới là ảnh `slot` | **Khối bố cục chứa ô** (2) |
| Trang chủ | 2 tab, lọc nhóm | Banner, Tiếp tục, nhóm trượt ngang, so le, ♡, tìm kiếm (3.1) |
| Chi tiết template | Sheet nhỏ | Màn riêng vuốt từng slide (3.2) |
| Tạo dự án | Màn chọn loại / tỉ lệ / số slide | Sheet thẻ tỉ lệ, Khác, Tuỳ chỉnh (4) |
| Canvas / zoom | Vừa 1 slide | Thấy hết slide, mức tối thiểu bật về (5) |
| Slide | Dải thumbnail | ‖ ⋯ + dưới slide, kéo đổi chỗ, sheet Slide mới (6) |
| Chọn / cử chỉ | Phẳng | Cha → con, không chọn = canvas (7) |
| Khung chọn | Transformer + menu nổi | Tay nắm cạnh, nút xoay dưới, khung bao ảnh trong ô, thước bằng nhau (8) |
| Thanh công cụ | ≤ 5 nút | Theo đối tượng, trượt ngang (9) |
| Sheet chỉnh | Rải rác | Vị trí, Kiểu, Bảng màu, Bố cục, Điều chỉnh (10) |
| Thêm ảnh | Chạm ô → 1 ảnh | Lấp đầy khung, chọn nhiều, thứ tự điền (11.1–11.2) |
| Chỉnh ảnh | Sheet trên canvas | Màn toàn màn hình (11.5) |
| Chữ | Hộp thoại sửa | Gõ trực tiếp, Định dạng đầy đủ (12) |
| Thư viện | Sticker, emoji, hình, khung | Nhóm "+N", Khung theo nhóm, Widget, Brand Kit (13) |
| Bottom sheet | Cố định | 50–95 %, đẩy canvas (14) |
| Nền / menu / xuất / lớp | Có phần | Chất liệu, chuyển màu tuỳ chỉnh, Xem trước riêng, Xuất mới, Lớp có thumbnail (15) |

### 17.2 Lộ trình đề xuất (D-87)
| Mốc | Nội dung | Phần |
|---|---|---|
| **M14** | Khối bố cục + ô (dữ liệu, chuyển đổi dữ liệu cũ); chọn cha → con; không chọn = canvas; khung chọn mới (tay nắm cạnh, nút xoay dưới, bao ảnh trong ô); thước bằng nhau | 2, 7, 8 |
| **M15** | Zoom "thấy hết slide"; ‖ ⋯ + dưới slide; kéo đổi chỗ; Thêm trái / phải / Nhân bản; sheet Slide mới | 5, 6 |
| **M16** | Lấp đầy khung, chọn nhiều theo số ô trống, thứ tự điền; nút Ảnh thêm tự do; Thay | 11.1–11.3 |
| **M17** | Thanh công cụ theo đối tượng; sheet Vị trí, Kiểu, Bảng màu, Bố cục, Điều chỉnh; bottom sheet 50–95 % đẩy canvas | 9, 10, 14 |
| **M18** | Phong cách kính mờ / nút nổi (sáng + tối); trang chủ mới; chi tiết template; tạo dự án | 1, 3, 4 |
| **M19** | Chữ gõ trực tiếp + Định dạng; màn Chỉnh ảnh; thư viện Hình / Khung / Widget / Brand Kit; Nền chất liệu; Xem trước; Xuất; Lớp thumbnail | 12, 11.5, 13, 15 |

### 17.3 Câu hỏi mở (chờ chủ dự án)
- **Q-E1:** Chạm vào **ô trống khi chưa chọn gì**: chọn khối cha trước (theo quy tắc chung) hay mở ngay "Lấp đầy khung"? (Hiện app mở ngay.)
- **Q-E2:** Nút **Ảnh** trên thanh đáy khi dự án còn ô trống: thêm ảnh tự do (như tham chiếu) hay hỏi điền vào ô trống?
- **Q-E3:** Chạm **phần tử khác** khi đang chọn: bỏ chọn rồi chọn luôn phần tử ngoài cùng tại đó (1 chạm) hay chỉ bỏ chọn (cần chạm thêm)?
- **Q-E4:** Thẻ thứ hai cạnh "Tiếp tục" ở trang chủ: "Tạo mới" hay bỏ?
- **Q-E5:** Kéo sheet xuống dưới 50 %: đóng sheet hay bật về 50 %?

---

