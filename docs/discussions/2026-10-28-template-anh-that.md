# 2026-10-28 — Mở rộng thư viện template + ảnh mẫu thật

## Yêu cầu của chủ dự án

- Trang chủ (thư viện template) còn nghèo nội dung, ảnh xem trước chỉ là tranh vẽ phong cảnh → tạo **thật nhiều loại template** tương tự SCRL (ảnh chụp tham khảo trong `sample/`, không commit).
- Đưa **ảnh thật** vào, lấy từ **Pexels** (chủ dự án cấp API key).

## Quan sát từ ảnh SCRL (`sample/IMG_4114…4138`)

- Trang chủ: banner lớn theo mùa (Halloween), "Continue", rồi các **mục theo chủ đề**: Fresh Picks, Halloween, Daily Essentials, In Fashion, Postcards From, From the Archive, Shot on Film, Scribbles by Hand, A Special Occasion, Scrapbook Diaries, Less Is More, Make It a Story, cuối cùng "Explore More" dạng 2 cột so le.
- Thẻ template luôn có **ảnh thật**, ♡, số ảnh / số slide, chấm cho carousel. Khung trang chủ của mình (M18) đã có đủ các phần này — thiếu là **nội dung**.
- Kiểu bố cục hay gặp: dải photobooth đen, tờ in thử (contact sheet), khung phim, polaroid nghiêng + băng keo, chữ viết tay, bìa tạp chí chữ lớn, mosaic dày không viền, ảnh vắt qua slide, nền giấy kraft, nhãn chữ trên nền trắng ("Japan recap").

## Đã làm

- **Ảnh mẫu:** `scripts/fetch-samples.mjs` gọi Pexels API (khoá đọc từ `.env.local`, **không commit**), tải 138 ảnh theo 13 chủ đề (du lịch, biển, phố, đồ ăn, chân dung, bạn bè, cặp đôi, mùa thu, thiên nhiên, tối giản, trắng đen, tiệc, thời trang), thu về WebP ≤ 720 px (~4.5 MB tổng) ở `public/samples/`, danh sách ở `src/lib/templates/samplePhotos.json`. Đã duyệt bằng mắt, bỏ 8 ảnh lệch chủ đề / nhoè / trùng loại. Ghi công tác giả trong `licenses.txt` (giấy phép Pexels không bắt buộc nhưng vẫn ghi).
- Mỗi template khai báo **chủ đề ảnh** (`design.themes`); ô dọc nhận ảnh dọc, ô ngang nhận ảnh ngang; mỗi template bắt đầu ở một chỗ khác trong kho nên ảnh không lặp nhiều.
- **Template: 22 → 98**, chia file theo nhóm trong `src/lib/templates/designs/`. Nhóm mới: **Mùa thu & Halloween** (đứng đầu — sát 31/10), **Bưu thiếp du lịch**, **Chụp bằng phim**, **Tạp chí**, **Sổ tay**; nhóm "Carousel" đổi tên hiển thị thành **Thường ngày**.
- Thành phần mới cho template: dải photobooth xoay nguyên khối, băng keo (hình chữ nhật mờ, xoay, nằm **trên** ảnh), khối màu / thẻ giấy, chấm tròn trang trí, ô lưới tự tính.
- 4 font chuyển sang tải cùng trang chủ để template có chữ viết tay / tạp chí: Cormorant Garamond, Anton, Great Vibes, Patrick Hand (chỉ thêm khai báo CSS; file font chỉ tải khi template dùng).
- Banner: Halloween / Bưu thiếp du lịch / Chụp bằng phim. "Khám phá thêm" trộn các nhóm xen kẽ.
- Hiệu năng: thẻ template chỉ dựng ảnh xem trước khi sắp cuộn tới (cách 400 px) → không tải hết 138 ảnh khi mở trang chủ.

## Chưa làm / để ngỏ

- "Dùng template" vẫn tạo **ô ảnh trống** (D-72) — ảnh mẫu chỉ để xem trước. Có thể cân nhắc tuỳ chọn "giữ ảnh mẫu" sau.
- Template theo mùa cần thay theo thời gian (Giáng sinh, Tết…). Chưa có cơ chế tự đổi theo ngày.
- Chưa dùng khung giấy xé / sticker từ thư viện (packs) trong template — mô hình template chưa tham chiếu tài sản pack.

---

## Đợt 2 (cùng ngày) — mùa / sự kiện, phong cách mới, +105 mẫu

### Yêu cầu
- Nâng cấp Next.js.
- Trang chủ **tự đẩy** các mục theo mùa / sự kiện (xuân hạ thu đông, Halloween, Noel, Tết, Trung thu, Valentine, các ngày lễ…).
- Thêm template đa dạng: giấy xé, phim, có text / shape / widget / sticker theo phong cách teen, love, retro… — tham khảo ảnh mới trong `sample/1` (39 ảnh).
- Thêm khoảng 100 mẫu.

### Quan sát từ `sample/1`
Mép giấy xé (ngang giữa các ảnh, quanh ảnh, vòng tròn xé), khung tem răng cưa + kẹp giấy, khung phim có chữ số mép, viền vẽ tay nguệch ngoạc, doodle sao / xoáy rải, nhãn vị trí 📍, hoa ép, chữ cắt báo (ransom), vạch highlight dưới tên, nền giấy xám, khung máy ảnh, mép sổ lò xo.

### Đã làm
- **Next.js 16.4.0 → 16.4.3** (bản vá bảo mật cùng dòng; `eslint-config-next` theo). Build, lint, e2e đều qua.
- **Lịch mùa & sự kiện** (`src/lib/templates/seasons.ts`): 17 mục — 4 mùa, Halloween, Giáng sinh, Năm mới, Tết, Valentine, 8/3, Ngày của mẹ, 1/6, Trung thu, 20/10, 20/11, mùa tốt nghiệp, mùa tựu trường. Tết và Trung thu theo bảng ngày âm lịch 2025–2035. Mỗi sự kiện hiện trước ngày một khoảng (Halloween 24 ngày, Noel 30, Tết 21, Trung thu 14…). Template gắn `design.events`.
  - Trang chủ: **2 banner đầu** và **tối đa 3 mục đầu** là sự kiện đang tới gần nhất (rồi tới mùa); còn lại là các nhóm thường. Có màn riêng cho từng sự kiện.
  - Thử ngày khác: thêm `?today=2026-12-20` vào URL.
- **Template dùng tài sản thư viện** (mô hình mới): `art` (khung có cửa sổ ảnh — giấy xé, tem, phim, polaroid, album, phong bì, khung tranh, bưu thiếp; hoặc sticker ảnh — washi, giấy note, mẩu giấy xé, hoa, Noel, Tết, Trung thu, sinh nhật…), `icons` (sticker / doodle vẽ sẵn: sao, xoáy, tim, mũi tên, gạch chân, vương miện…), `widgets` (đếm ngược, bài hát, thời tiết, vé máy bay, lịch, thông số phim, hashtag), chữ có viền / nghiêng / bóng. Kit thêm: viền vẽ tay (`sketch`), chữ cắt báo (`ransom`).
  - Xem trước không phải tải cả gói: `scripts/build-template-art.mjs` trích kích thước + cửa sổ (rút gọn) của các khung / sticker được dùng vào `packArt.json` (chạy cùng `pnpm dev` / `pnpm build`). Khi bấm "Dùng template", app tải ảnh khung / sticker vào dự án và lấy cửa sổ chính xác từ gói; offline thì bỏ qua phần đó. Widget nạp lười (không làm nặng trang chủ).
- **+105 mẫu → 203 template.** Nhóm mới: **Giấy xé** (15), **Vẽ tay** (10), **Teen & dễ thương** (12), **Tình yêu** (10), **Retro** (12); nhóm "Mùa thu & Halloween" đổi thành **Theo mùa & lễ hội** (Noel 6, Năm mới 4, Tết 5, Trung thu 4, 8/3–20/10 2, 20/11 2, Ngày của mẹ, 1/6, tốt nghiệp 2, xuân, đông, Halloween +2); sinh nhật +4 (chữ cắt báo, viền vẽ tay, bánh kem, bóng bay); thêm mẫu phim / du lịch có widget.
- **Ảnh mẫu +83** (Pexels): đông, Giáng sinh, Tết / đèn lồng / áo dài, xuân, hoa, trường học, trẻ em, retro → 221 ảnh, 7.5 MB. Cách chọn ảnh: mỗi ô bắt đầu ở một chỗ riêng **trong** chủ đề nên ít lặp.

### Để ngỏ
- Bảng ngày Tết / Trung thu cần bổ sung sau 2035.
- Chưa có khung "máy ảnh số" và "mép sổ lò xo" như SCRL — cần thêm vào thư viện khung (M20) nếu muốn.
- Mẫu theo mùa nên được chủ dự án duyệt trên điện thoại (màu, chữ tiếng Việt).

---

## Đợt 3 — vuốt trong hàng template

**Vấn đề (chủ dự án):** ở trang chủ, mỗi danh mục là một hàng cuộn ngang, mà thẻ carousel bên trong cũng vuốt ngang được → khó vuốt hàng cha.

**Chốt:** trên thẻ nhiều slide nằm trong hàng ngang, **dải dưới đáy (~20% chiều cao)** và **mép phải (~18% chiều rộng)** dùng để kéo cả hàng; phần còn lại lật slide của template. Chạm (không vuốt) ở đâu cũng mở template. Thẻ một slide, lưới nhóm và "Khám phá thêm" giữ như cũ.

**Cách làm:** hai lớp trong suốt nằm ngoài vùng cuộn của thẻ → trình duyệt tự cuộn hàng cha (giữ quán tính, hít thẻ). Đã thử bằng cử chỉ chạm giả lập: vuốt giữa → slide đổi, hàng đứng yên; vuốt dải dưới / mép phải → hàng trượt, slide đứng yên.

**Để sau:** "chuyền tiếp" (ở slide cuối vuốt tiếp thì sang template kế) — thử trên máy rồi mới tính.

---

## Đợt 4 — trang chủ bị lag

**Chủ dự án:** vào trang chủ khá lag, có vẻ do tải tất cả một lượt.

**Đo (Chrome giả lập điện thoại, CPU chậm 4 lần):** lúc mở trang có 7 lần đứng hình, tổng 1.33 s, dài nhất 413 ms; 8.715 phần tử DOM. Profiler: phần lớn thời gian là style / layout / vẽ của trình duyệt chứ không phải JS.

**Nguyên nhân:**
- Dựng **toàn bộ ~400 thẻ** ngay lúc mở (17 hàng + 203 thẻ "Khám phá thêm"), dù ảnh xem trước đã hoãn.
- ~1.200 nhãn trên thẻ dùng **làm mờ nền** (backdrop-blur), rất tốn công vẽ.
- Thẻ carousel vẽ **cả dải slide lặp lại cho từng slide** (thẻ 4 slide = 4 bản sao).

**Đã sửa:**
- Mỗi hàng chỉ dựng khi sắp cuộn tới, **tối đa 10 thẻ + ô "Xem tất cả"** (màn nhóm có đủ).
- "Khám phá thêm" (và các lưới 2 cột khác) dựng **12 thẻ mỗi đợt**, thêm khi gần cuối.
- Banner chỉ dựng ảnh khi được vuốt tới.
- Bỏ làm mờ nền trên nhãn / nút ♡ của thẻ (nền đen mờ thường); thanh trên cùng vẫn giữ.
- Thẻ carousel vẽ dải slide **một lần**, các điểm hít slide trong suốt đặt lên trên (vuốt / chạm như cũ).

**Kết quả:** lúc mở 3 lần đứng hình, tổng ~0.3 s, dài nhất ~120 ms; 684 phần tử DOM. Khi cuộn 7.000 px: dài nhất ~80–108 ms (trước 226 ms).

**e2e:** mở template ngoài màn hình qua Tìm kiếm (`openTemplate` trong `e2e/lib.mjs`); "Khám phá thêm" kiểm tra đợt đầu ≥ 12 và tải thêm khi cuộn.

---

## Đợt 5 — làm đầy thư viện: Noel, Tết, khung mới, mọi nhóm ≥ 15

**Chủ dự án:** đồng ý làm trước những việc làm được ngay (template Giáng sinh / Tết, thư viện khung…) để tăng số lượng và độ đa dạng — nhiều nhóm còn rất ít mẫu (Lưới profile 3, Collage 7, Tối giản 8…).

### Khung mới (thư viện, M20)
Sinh bằng code như các gói `gen-*` khác (`scripts/frames/kinds.mjs`, giấy phép CC0), đã duyệt bằng mắt và chọn seed trong `scripts/frames/picks.json`:
- **Máy ảnh số** (`gen-camera`, 20 khung): mặt sau máy compact (bạc, đen, hồng, bạc hà, trắng, tím nhạt, vàng sâm panh, xanh) nằm ngang hoặc dựng đứng; ảnh hiện trên **màn LCD** cùng các ký hiệu của máy (pin, số kiểu còn lại, khung lấy nét, chế độ hoặc **dấu ngày màu cam** kiểu máy cũ). Bộ: digital, y2k, retro.
- **Sổ lò xo** (`gen-notebook`, 20 khung): trang sổ có **gáy lò xo** (trên hoặc trái, lò xo bạc / đen / vàng / trắng / hồng) hoặc **trang xé khỏi sổ** (mép lỗ đục xù xì); giấy trắng, kem, kraft, hồng, xanh, bạc hà, xám; kẻ dòng (có lề đỏ), ô ly, chấm, trơn; ảnh dán trên trang, chừa chỗ viết bên dưới, đôi khi có băng dính. Bộ: journal, school, cute.
- Thư viện: 742 mục.

### Template: 203 → 373
| Nhóm | Trước | Sau | | Sự kiện | Trước | Sau |
|---|---|---|---|---|---|---|
| Theo mùa & lễ hội | 40 | 81 | | Giáng sinh | 9 | 27 |
| Thường ngày | 12 | 20 | | Tết | 6 | 21 |
| Giấy xé | 15 | 20 | | Năm mới | 5 | 12 |
| Chụp bằng phim | 15 | 20 | | Mùa đông | 5 | 13 |
| Bưu thiếp du lịch | 12 | 20 | | Valentine | 8 | 15 |
| Collage | 7 | 19 | | Xuân | 2 | 4 |
| Sổ tay (scrapbook) | 7 | 18 | | | | |
| Vẽ tay, Teen, Tình yêu, Retro | 10–12 | 18 | | | | |
| Tạp chí | 9 | 18 | | | | |
| Dịp đặc biệt | 13 | 18 | | | | |
| Story, Tối giản | 8–10 | 18 | | | | |
| Liền mạch | 8 | 16 | | | | |
| Lưới profile | 3 | 15 | | | | |

Mẫu mới đáng chú ý:
- **Giáng sinh** (`designs/winter.ts`): cây thông ghép từ ảnh tròn, quả châu ảnh treo dây, máy ảnh số Noel, kẻ caro tartan, thư gửi ông già Noel, bộ tem, photobooth, quả cầu tuyết, chợ Giáng sinh, đêm phim, danh sách điều ước (trang sổ), dây polaroid vắt 2 slide, thực đơn đêm Noel, khung vàng… **Năm mới**: số năm cỡ lớn, tổng kết năm (lưới 3 × 3), nâng ly, pháo hoa, tấm ảnh cuối năm, sổ tay mục tiêu. **Mùa đông**: áo len, ngày tuyết, trượt tuyết.
- **Tết** (`designs/tet.ts`): mùng 1 – 2 – 3 (tết cha, tết mẹ, tết thầy), chợ hoa 28 Tết, về nhà ăn Tết (vé máy bay về "Quê nhà"), múa lân, Tết tranh Đông Hồ, lời chúc đầu năm, quất & polaroid, máy ảnh ngày Tết, áo dài du xuân, mâm ngũ quả, gói bánh chưng, dây pháo, thu hoạch lì xì.
- **Lưới profile** (`designs/grids.ts`): kế hoạch 3 × 3 mà **mỗi ô là một bài**: bàn cờ ảnh / ô chữ, chữ hình chữ thập, lời nhắn ở giữa, hàng giữa toàn cảnh, chữ to vắt ngang hàng giữa, tường tranh đánh số, tường polaroid, vòng tròn pastel, ô cầu vồng theo thứ, ba dải phim, câu nói hàng giữa, góc & tâm.
- **Collage / Tối giản / Story** (`designs/collage.ts`, `designs/minimal.ts`), **Sổ tay** (`designs/journal.ts`: nhật ký trang sổ, giấy note, một tuần băng dính, sổ mở hai trang, hoa ép, bướm…); các nhóm còn lại thêm thẳng vào file của nhóm (mẫu mới xếp đầu).
- Chữ chỉ dùng 10 phông đã tải cùng trang chủ; mọi mẫu có chữ EN / VI.

### Trang thử `/labs/templates`
Hiện mọi template theo **nhóm** hoặc **sự kiện** (có số lượng), thấy cả dải carousel; bộ lọc nằm trên URL (`?cat=grid`, `?event=christmas`) để gửi link. Không có link trong app. Dùng để duyệt mẫu trên điện thoại.

### Tìm kiếm
Khi thư viện lớn, tìm "birthday" khớp cả mô tả nhóm Dịp đặc biệt nên mẫu tên "Birthday" bị đẩy ra sau đợt 12 thẻ đầu → kết quả giờ xếp **mẫu khớp tên trước**, mẫu khớp theo nhóm sau.

### Để ngỏ
- Chủ dự án duyệt mẫu mới trên điện thoại (qua `/labs/templates`), bỏ / sửa mẫu chưa đẹp; chốt D-140.
- Khung máy ảnh số có chữ "DIGITAL" trên thân máy và ký hiệu màn hình bằng tiếng Anh (MENU, DISP, AUTO) — giống máy thật; đổi nếu chủ dự án muốn.
- Template theo **năm cụ thể** (2027, "Tết 2027") cần cập nhật khi sang năm.

---

## Đợt 6 — chữ cắt báo (ransom) chưa có trong editor

**Chủ dự án:** mẫu "Sinh nhật chữ cắt" có phần chữ ghép từ mẩu báo cắt — hình như app chưa có gì kiểu này?

**Đúng.** Chữ "HAPPY BIRTHDAY" trong mẫu là **15 phần tử chữ riêng lẻ** (mỗi chữ cái một khối: phông, nền, góc xoay riêng), dựng bằng hàm `ransom()` trong `designs/kit.ts`. Trong editor không có kiểu chữ này; dùng template xong muốn đổi chữ thì phải sửa / thêm / xoá từng chữ cái. Hiện chỉ 1 template dùng.

**Đề xuất (chờ chủ dự án chọn, Q-T1):** thêm kiểu **"Chữ cắt báo"** cho phần tử chữ — gõ cả câu như chữ thường, mỗi ký tự tự nhận phông / màu nền / góc xoay / lệch dòng khác nhau theo seed, nút **Xáo** để đổi ngẫu nhiên, vài bộ màu (báo cũ, pastel, đen trắng, neon); xuất ảnh đúng như trên canvas. Sau đó thêm template dùng kiểu này (sinh nhật, tạp chí, teen, retro). Trước khi thiết kế giao diện sẽ tham khảo cách các app khác làm.

