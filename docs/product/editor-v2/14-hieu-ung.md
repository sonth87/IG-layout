# 14 — Hiệu ứng (Effects)

Trạng thái: **đã làm đủ 48** — khung + đợt 1 (17) + đợt 2 (19) + đợt 3 (12) (D-123 → D-125, 2026-10-19). Còn: kéo tâm / mép trên canvas. Thuộc M21. Nghiên cứu kỹ thuật gốc ở [discussions/2026-10-18-m21-nghien-cuu.md](../../discussions/2026-10-18-m21-nghien-cuu.md) §2.

> "cho thêm 1 mục, nhưng mà phải định nghĩa và có thêm nhiều effect và đưa ra rõ ràng nó là như thế nào, cấu hình ra sao, hiệu ứng thế nào, kết quả đạt được. ví dụ như hiệu ứng chảy có thể set để nó chảy theo hướng nào, mức độ chảy ra sao…"

## 1. Hiệu ứng là gì

- **Hiệu ứng** làm **thay đổi hình dạng hoặc thêm lớp hiệu ứng** cho một phần tử. Ví dụ: chảy, xoáy, sóng, glitch, phát sáng, đổ bóng dài, màu nước…
- **Filter** (đã có, M21 phần 1) thì **chỉ đổi màu** ảnh.
- Hai thứ tách riêng, dùng chồng lên nhau được. Ví dụ một ảnh vừa có filter "Phim nhựa" vừa có hiệu ứng "Chảy".

## 2. Phần tử nào có Hiệu ứng

| Phần tử | Có nút Hiệu ứng | Ghi chú |
| --- | --- | --- |
| Ảnh, video | ✓ | dùng được mọi hiệu ứng |
| Chữ | ✓ | trừ những hiệu ứng chỉ hợp với ảnh (ghi "chỉ ảnh") |
| Sticker, emoji | ✓ | |
| Widget | ✓ | |
| Hình | ✓ | |
| Nét vẽ tay | ✓ | |
| Khối layout / lưới | ✗ | chọn từng ảnh trong ô để áp |
| Nền slide | ✗ | để sau |

Mỗi hiệu ứng ở mục 6 ghi rõ **Áp cho** gì.

## 3. Cách dùng

1. Chọn phần tử, bấm **Hiệu ứng** trên thanh công cụ (icon lấp lánh, nằm sau Nội dung / Kiểu / Màu).
2. Mở sheet **Hiệu ứng** gồm:
   - hàng tab nhóm: Biến dạng · Kỹ thuật số · Ánh sáng & khối · Chất liệu & vẽ · Chuyển động · Nhiếp ảnh;
   - lưới các ô, mỗi ô là **ảnh xem trước bằng chính phần tử đang chọn**, có tên bên dưới;
   - ô đầu tiên là **Không** (bỏ hiệu ứng).
3. Chạm một hiệu ứng:
   - phần tử trên canvas đổi ngay;
   - dưới lưới hiện **bảng thông số** của hiệu ứng đó: thanh trượt, nút chọn hướng, ô màu…;
   - các thông số chính hiện sẵn, thông số phụ nằm trong **"Thêm"**.
4. **Chạm trực tiếp trên canvas** cho các thông số có vị trí (tâm xoáy, tâm phình, điểm gốc tia sáng, mép bàn của Chảy): kéo điểm tròn nhỏ hiện trên phần tử.
5. Nút **Xáo** (🎲) cho hiệu ứng có yếu tố ngẫu nhiên (giọt chảy, glitch, mảnh vỡ, lấp lánh): mỗi lần bấm ra một biến thể khác. Biến thể được giữ lại, mở lại dự án vẫn y như cũ.
6. Nút **Đặt lại** đưa thông số về mặc định.
7. **✓** lưu thành một bước hoàn tác. **✕** huỷ, trả về như trước khi mở sheet.

**Hành vi chung:**

- Mỗi phần tử **một hiệu ứng** tại một thời điểm. Chồng nhiều hiệu ứng: để sau.
- Chữ / widget có hiệu ứng **vẫn sửa nội dung bình thường**; hiệu ứng tự áp lại.
- Kéo, xoay, đổi cỡ phần tử: hiệu ứng đi theo, tính theo kích thước của phần tử.
- Hiệu ứng làm phần tử **tràn ra ngoài khung** (bóng dài, phát sáng, giọt chảy, mảnh vỡ): phần tràn vẫn hiện và được xuất.
- **Xuất** ảnh / video giữ nguyên hiệu ứng, cùng độ nét.
- **Lớp**: ảnh thu nhỏ trong danh sách lớp có hiệu ứng; tên lớp kèm "· tên hiệu ứng".

## 4. Thông số dùng chung

Nhiều hiệu ứng dùng chung các kiểu thông số sau. Ở mục 6 chỉ ghi tên.

| Kiểu thông số | Điều khiển | Ý nghĩa |
| --- | --- | --- |
| **Mức độ** | thanh trượt 0–100 | hiệu ứng mạnh / yếu; 0 là như không có |
| **Hướng** | vòng chọn 8 hướng (↑ ↗ → ↘ ↓ ↙ ← ↖) + thanh trượt góc 0–360° trong "Thêm" | hướng hiệu ứng đi tới |
| **Tâm** | điểm kéo trên canvas; mặc định giữa phần tử | nơi hiệu ứng bắt đầu / mạnh nhất |
| **Bán kính / Phạm vi** | thanh trượt 5–100 % kích thước phần tử | vùng chịu ảnh hưởng |
| **Màu** | bảng màu như công cụ Màu (có màu thương hiệu, màu gần đây) | |
| **Độ mềm** | 0–100 | chuyển tiếp gắt hay mượt ở rìa vùng hiệu ứng |
| **Ngẫu nhiên** | 0–100 + nút Xáo | mức không đều, và biến thể ngẫu nhiên |
| **Trộn** | 0–100 % | hoà hiệu ứng với bản gốc (100 = chỉ hiệu ứng) |

## 5. Mục lục hiệu ứng (48)

| Nhóm | Hiệu ứng |
| --- | --- |
| **A. Biến dạng** (16) | Chảy · Vắt qua mép · Xoáy · Phình / Co · Sóng uốn · Cờ bay · Gợn nước · Uốn cong · Phối cảnh 3D · Mắt cá · Gương · Kính vạn hoa · Kéo vệt · Vỡ mảnh · Xé đôi · Gấp giấy |
| **B. Kỹ thuật số** (9) | Glitch · Pixel · Tách màu RGB · Màn hình CRT / VHS · Chấm báo in · Hai tông màu · Pop art · Ký tự ASCII · Dither 1-bit |
| **C. Ánh sáng & khối** (9) | Phát sáng neon · Đổ bóng dài · Bóng cứng lệch · Khối 3D · Viền sticker · Phản chiếu · Kính mờ · Tia sáng · Dập nổi / chìm |
| **D. Chất liệu & vẽ** (10) | Màu nước loang · Mực tàu · Phác thảo chì · Sơn dầu · Sáp màu / phấn · In lụa Riso · Khói / sương · Lửa viền · Băng giá · Kim tuyến |
| **E. Chuyển động (ảnh tĩnh)** (3) | Nhòe chuyển động · Phóng tâm · Bóng lặp |
| **F. Nhiếp ảnh** (1, chỉ ảnh) | Tilt-shift |

**Độ nặng** (trên điện thoại):

- **Nhẹ**: mượt khi kéo thanh trượt.
- **Vừa**: khi kéo, xem trước ở độ phân giải thấp hơn.
- **Nặng**: xem trước khi thả tay; xuất mất vài giây.

---

## 6. Chi tiết từng hiệu ứng

### A. Biến dạng

#### A1. Chảy (Melt)

- **Trông thế nào:** phần tử như sáp / kem đang chảy. Một mép giữ nguyên, phần còn lại kéo dài về một hướng thành những vệt và **giọt** dài ngắn khác nhau. Đầu giọt tròn, có thể có bóng.
- **Áp cho:** ảnh, chữ, sticker, widget, hình, nét vẽ.
- **Thông số:**

| Thông số | Khoảng | Mặc định | Tác dụng |
| --- | --- | --- | --- |
| Hướng chảy | 8 hướng / 0–360° | ↓ | chiều chảy (↓ là chảy xuống, → là chảy ngang như bị gió thổi) |
| Mức chảy | 0–100 | 45 | giọt dài thêm tới 0–150 % chiều cao phần tử |
| Bắt đầu từ | 0–100 % | 50 % | chảy từ đâu (0 = từ mép đầu, mọi chỗ đều chảy; 100 = chỉ phần cuối chảy) |
| Số giọt | 1–12 | 4 | số giọt nổi bật |
| Độ dài giọt khác nhau | 0–100 | 60 | 0 = giọt đều nhau; cao = có giọt rất dài, giọt rất ngắn |
| Độ đặc | 0–100 | 50 | thấp = chảy loãng, mỏng như nước; cao = đặc, giọt mập như sáp |
| Bóng / bóng loáng | 0–100 | 30 | đánh bóng và highlight trên giọt cho cảm giác ướt |
| Xáo | 🎲 | | đổi vị trí giọt |

- **Kết quả:** chữ "chảy" kiểu kem tan, logo chảy, ảnh chảy kiểu Dalí. Hợp ảnh mùa hè, đồ ngọt, phong cách siêu thực.
- **Độ nặng:** nhẹ.

#### A2. Vắt qua mép (Drape)

- **Trông thế nào:** như đồng hồ chảy của widget Đồng hồ.
  - Một phần nằm phẳng (bị dẹt theo phối cảnh) trên một "mép bàn" tưởng tượng.
  - Phần còn lại **gập xuống** và rủ, có nếp gập sáng / tối và giọt ở đáy.
- **Áp cho:** ảnh, sticker, widget, hình, chữ.
- **Thông số:**

| Thông số | Khoảng | Mặc định | Tác dụng |
| --- | --- | --- | --- |
| Vị trí mép | 10–90 % | 50 % | đường gập cắt ngang phần tử ở đâu (có điểm kéo trên canvas) |
| Hướng rủ | ↓ ← → | ↓ | phần rủ xuống, sang trái hay sang phải |
| Độ dẹt phần nằm | 0–100 | 60 | phần nằm trên bàn bị ép dẹt bao nhiêu |
| Độ rủ | 0–100 | 50 | phần treo dài thêm bao nhiêu |
| Giọt ở đáy | 0–6 | 2 | số giọt chảy ở mép dưới |
| Bóng nếp gập | 0–100 | 50 | độ đậm vùng tối dưới nếp gập |
| Bóng trên bàn | bật / tắt | bật | vệt bóng mờ dưới phần nằm |

- **Kết quả:** đặt phần tử lên mép bàn, mép tường, mép khung ảnh trong ảnh thật cho cảm giác đồ vật mềm oặt vắt qua.
- **Độ nặng:** nhẹ.

#### A3. Xoáy (Twirl)

- **Trông thế nào:** phần tử bị vặn quanh một tâm như nước xoáy vào lỗ; gần tâm xoắn mạnh, ra xa nhẹ dần.
- **Áp cho:** tất cả.
- **Thông số:**
  - **Góc xoáy** −720°…720° (mặc định 180°; âm là ngược chiều kim đồng hồ);
  - **Tâm** (điểm kéo);
  - **Bán kính** 5–100 % (60 %);
  - **Độ mềm** rìa 0–100 (60).
- **Kết quả:** chữ / ảnh như bị hút vào xoáy, cảm giác chóng mặt, ảo giác.
- **Độ nặng:** nhẹ.

#### A4. Phình / Co (Bulge / Pinch)

- **Trông thế nào:**
  - **Phình**: vùng quanh tâm phồng to như nhìn qua giọt nước, quả cầu;
  - **Co**: vùng quanh tâm bị hút nhỏ lại.
- **Áp cho:** tất cả.
- **Thông số:**
  - **Mức** −100 (co) … +100 (phình), mặc định +50;
  - **Tâm**;
  - **Bán kính** 5–100 % (50 %);
  - **Độ mềm** 0–100 (50).
- **Kết quả:** mặt người "to đầu" vui nhộn, chữ có một chữ cái phồng lên, nhấn mạnh một chi tiết trong ảnh.
- **Độ nặng:** nhẹ.

#### A5. Sóng uốn (Wave)

- **Trông thế nào:** phần tử uốn lượn theo hình sin như nhìn qua mặt nước gợn hay tấm vải.
- **Áp cho:** tất cả.
- **Thông số:**
  - **Hướng sóng** ngang / dọc / cả hai (ngang);
  - **Biên độ** 0–100 (30), là độ cao sóng tối đa 20 % kích thước phần tử;
  - **Số sóng** 0.5–10 (2), là số chu kỳ trên chiều dài phần tử;
  - **Pha** 0–360° (0), để dịch đỉnh sóng;
  - **Dạng** sin / tam giác / vuông (sin).
- **Kết quả:** chữ lượn sóng kiểu retro 70s, ảnh như phản chiếu dưới nước, banner lượn.
- **Độ nặng:** nhẹ.

#### A6. Cờ bay (Flag)

- **Trông thế nào:** như sóng uốn nhưng có **đổ sáng tối theo nếp vải** (đỉnh sáng, hõm tối); mép buộc giữ thẳng.
- **Áp cho:** ảnh, sticker, chữ có nền, widget, hình.
- **Thông số:**
  - **Mép buộc** trái / phải / trên (trái);
  - **Gió** 0–100 (50), quyết định biên độ;
  - **Số nếp** 1–6 (3);
  - **Bóng vải** 0–100 (50).
- **Kết quả:** ảnh / logo như lá cờ hoặc tấm vải căng trong gió.
- **Độ nặng:** nhẹ.

#### A7. Gợn nước (Ripple)

- **Trông thế nào:** các vòng sóng tròn lan ra từ một điểm như giọt nước rơi xuống mặt hồ; xa tâm sóng yếu dần.
- **Áp cho:** ảnh, sticker, hình, widget (chữ: được, nhưng nên nhẹ).
- **Thông số:**
  - **Tâm**;
  - **Biên độ** 0–100 (30);
  - **Khoảng cách vòng** 2–30 % (8 %);
  - **Tắt dần** 0–100 (50);
  - **Pha** 0–360° (0);
  - **Ánh sáng mặt nước** 0–100 (20), là highlight trên đỉnh sóng.
- **Kết quả:** ảnh như in dưới mặt nước, cảm giác mơ màng.
- **Độ nặng:** nhẹ.

#### A8. Uốn cong (Arc / Bend)

- **Trông thế nào:** toàn bộ phần tử uốn theo **một cung tròn**: lên (cười) hoặc xuống (buồn). Chữ chạy theo vòng cung.
- **Áp cho:** chữ (dùng nhiều nhất), sticker, widget, hình, ảnh.
- **Thông số:**
  - **Độ cong** −100…100 (40); dương là cong lên, ±100 là gần nửa vòng tròn;
  - **Chiều** ngang / dọc (ngang);
  - **Giữ chữ thẳng đứng** bật / tắt (tắt). Bật thì từng chữ cái chỉ dời chỗ theo cung, không nghiêng, như chữ trên con dấu.
- **Kết quả:** chữ vòng cung trên logo, huy hiệu, con dấu; dải băng uốn.
- **Độ nặng:** nhẹ.

#### A9. Phối cảnh 3D (Perspective)

- **Trông thế nào:** phần tử như một tấm phẳng nghiêng ra sau trong không gian 3D: một cạnh xa hơn và nhỏ hơn. Giống nghiêng 3D của ảnh trong công cụ Cắt (D-111), nhưng cho mọi phần tử.
- **Áp cho:** tất cả.
- **Thông số:**
  - **Nghiêng ngang** −60…60° (0);
  - **Nghiêng dọc** −60…60° (25°);
  - **Độ sâu ống kính** 0–100 (50); cao là phối cảnh gắt như góc rộng;
  - **Bóng đổ theo nghiêng** bật / tắt.
- **Kết quả:** chữ "Star Wars" chạy vào sâu, ảnh như dán lên mặt bàn hay tường nghiêng, poster nằm trên sàn.
- **Độ nặng:** nhẹ.

#### A10. Mắt cá (Fisheye)

- **Trông thế nào:** méo như ống kính mắt cá / camera nhìn qua lỗ cửa: giữa phồng to, rìa cong tròn.
- **Áp cho:** ảnh (chủ yếu), sticker, widget.
- **Thông số:**
  - **Mức** 0–100 (60);
  - **Cắt tròn** bật / tắt (tắt). Bật thì cắt phần tử thành hình tròn có viền đen như ảnh mắt cá thật;
  - **Tâm**.
- **Kết quả:** ảnh skate / street style, ảnh nhóm bạn ghé sát ống kính.
- **Độ nặng:** nhẹ.

#### A11. Gương (Mirror)

- **Trông thế nào:** một nửa phần tử được lật và ghép đối xứng với nửa kia.
- **Áp cho:** ảnh, sticker, hình, widget.
- **Thông số:**
  - **Kiểu**: trái → phải, phải → trái, trên → dưới, dưới → trên, 4 góc (trái → phải);
  - **Vị trí trục** 0–100 % (50 %), có điểm kéo;
  - **Góc trục** 0–360° (0), trong "Thêm".
- **Kết quả:** ảnh phong cảnh / kiến trúc đối xứng hoàn hảo, khuôn mặt đối xứng, hoạ tiết.
- **Độ nặng:** nhẹ.

#### A12. Kính vạn hoa (Kaleidoscope)

- **Trông thế nào:** phần tử bị cắt thành một lát hình quạt rồi nhân đối xứng xoay quanh tâm thành hoa văn tròn như ống kính vạn hoa.
- **Áp cho:** ảnh, sticker, nền.
- **Thông số:**
  - **Số cánh** 3–16 (6);
  - **Góc xoay** 0–360°;
  - **Tâm**;
  - **Phóng** 50–200 % (100 %).
- **Kết quả:** biến một ảnh hoa / cảnh thành hoa văn mandala, nền trừu tượng.
- **Độ nặng:** nhẹ.

#### A13. Kéo vệt (Pixel stretch)

- **Trông thế nào:** từ một đường cắt, các điểm ảnh ở mép bị **kéo thành vệt thẳng** dài tới hết phần tử theo một hướng, như ảnh bị "kéo dãn" kỹ thuật số.
- **Áp cho:** ảnh, sticker, chữ.
- **Thông số:**
  - **Hướng** 8 hướng (→);
  - **Vị trí cắt** 0–100 % (60 %), có điểm kéo;
  - **Lệch vệt** 0–100 (0): làm vệt không thẳng tuyệt đối, có sóng nhẹ;
  - **Nhoè** 0–100 (10).
- **Kết quả:** chân dung "tan vào" vệt màu, ảnh thời trang, poster điện tử.
- **Độ nặng:** nhẹ.

#### A14. Vỡ mảnh (Shatter)

- **Trông thế nào:** phần tử vỡ thành các mảnh đa giác như kính vỡ; mảnh tách nhẹ ra khỏi nhau, có khe hở và viền sáng ở cạnh mảnh.
- **Áp cho:** ảnh, chữ, sticker, widget, hình.
- **Thông số:**
  - **Số mảnh** 4–60 (18);
  - **Tách rời** 0–100 (30), là khoảng mảnh văng ra từ tâm;
  - **Xoay mảnh** 0–100 (20);
  - **Tâm vỡ** (điểm kéo), nơi mảnh nhỏ và dày nhất;
  - **Viền cạnh** 0–100 (40);
  - **Xáo** (đổi hình mảnh).
- **Kết quả:** chữ / ảnh vỡ tung, cảm giác mạnh, hành động, chia tay.
- **Độ nặng:** vừa.

#### A15. Xé đôi (Tear)

- **Trông thế nào:** phần tử bị **xé làm hai** dọc một đường răng cưa không đều; hai mảnh lệch nhau, mép xé có xơ giấy trắng.
- **Áp cho:** ảnh, sticker, widget, chữ có nền.
- **Thông số:**
  - **Hướng xé** dọc / ngang / chéo, góc 0–360° (dọc);
  - **Vị trí** 10–90 % (50 %);
  - **Khoảng hở** 0–100 (25);
  - **Lệch** 0–100 (20), là hai mảnh trượt lệch nhau;
  - **Mép giấy** 0–100 (60), là độ dày viền trắng xơ;
  - **Răng cưa** 0–100 (50);
  - **Xáo**.
- **Kết quả:** ảnh kỷ niệm "xé đôi", collage kiểu scrapbook.
- **Độ nặng:** nhẹ.

#### A16. Gấp giấy (Paper fold)

- **Trông thế nào:** phần tử như tờ giấy từng bị gấp: có các nếp thẳng, mỗi ô nghiêng sáng tối khác nhau; nếp có vệt sáng / tối mảnh.
- **Áp cho:** ảnh, sticker, widget, hình.
- **Thông số:**
  - **Số nếp ngang** 0–4 (1);
  - **Số nếp dọc** 0–4 (2);
  - **Độ sâu nếp** 0–100 (40);
  - **Hướng sáng** 8 hướng (↖);
  - **Nhăn giấy** 0–100 (0), là vết nhăn nhỏ ngẫu nhiên.
- **Kết quả:** ảnh như in ra giấy rồi gấp bỏ túi, bản đồ, thư cũ.
- **Độ nặng:** nhẹ.

### B. Kỹ thuật số

#### B1. Glitch

- **Trông thế nào:** phần tử bị **cắt lát ngang** ngẫu nhiên; vài lát trượt lệch sang ngang, các kênh màu đỏ / xanh tách ra, có khối nhiễu và vạch quét.
- **Áp cho:** tất cả.
- **Thông số:**
  - **Mức** 0–100 (40), quyết định số lát lệch và độ lệch;
  - **Số lát** 2–40 (12);
  - **Lệch tối đa** 0–100 (30);
  - **Tách màu** 0–100 (40);
  - **Khối nhiễu** 0–100 (20);
  - **Vạch quét** 0–100 (0);
  - **Hướng lát** ngang / dọc (ngang);
  - **Xáo**.
- **Kết quả:** poster âm nhạc điện tử, cảm giác "lỗi", cyberpunk.
- **Độ nặng:** nhẹ.

#### B2. Pixel (Mosaic)

- **Trông thế nào:** phần tử thành các ô màu khối như ảnh độ phân giải thấp.
- **Áp cho:** tất cả.
- **Thông số:**
  - **Cỡ ô** 2–80 px (16);
  - **Hình ô** vuông / lục giác / tròn kiểu đèn LED / tam giác (vuông);
  - **Khe giữa ô** 0–6 px (0);
  - **Chỉ một vùng** bật / tắt (tắt). Bật thì có hình chữ nhật kéo được để che một phần, như che mặt / biển số.
- **Kết quả:** che thông tin nhạy cảm, phong cách game 8-bit, tranh ghép.
- **Độ nặng:** nhẹ.

#### B3. Tách màu RGB (Chromatic aberration)

- **Trông thế nào:** ba lớp đỏ, lục, lam lệch nhau một chút, tạo viền màu ở cạnh như ống kính rẻ tiền hoặc kính 3D.
- **Áp cho:** tất cả.
- **Thông số:**
  - **Kiểu** thẳng (theo một hướng) / toả tâm (mạnh dần ra rìa), mặc định thẳng;
  - **Khoảng lệch** 0–40 px (8);
  - **Hướng** 0–360° (0) với kiểu thẳng;
  - **Tâm** với kiểu toả tâm.
- **Kết quả:** chữ / ảnh "rung", cảm giác lo-fi, giấc mơ, Y2K.
- **Độ nặng:** nhẹ.

#### B4. Màn hình CRT / VHS

- **Trông thế nào:** như hình trên TV ống cũ hay băng video:
  - vạch quét ngang;
  - viền màu loang;
  - nhiễu hạt;
  - méo cong ở rìa;
  - đôi khi một dải nhiễu trượt ngang;
  - có thể có chữ "PLAY ▶" và giờ kiểu máy quay.
- **Áp cho:** ảnh (chủ yếu), sticker, chữ.
- **Thông số:**
  - **Kiểu** CRT / VHS (VHS);
  - **Vạch quét** 0–100 (40);
  - **Loang màu** 0–100 (40);
  - **Nhiễu** 0–100 (30);
  - **Cong màn** 0–100 (20);
  - **Dải nhiễu** 0–100 (20);
  - **Chữ OSD** tắt / PLAY / REC + ngày giờ (tắt). Chữ sửa được.
- **Kết quả:** ảnh hoài cổ thập niên 90, "đoạn phim gia đình".
- **Độ nặng:** nhẹ.

#### B5. Chấm báo in (Halftone)

- **Trông thế nào:** phần tử thành lưới **chấm tròn** to nhỏ theo độ đậm nhạt như ảnh in báo / truyện tranh cũ. Có thể 1 màu hoặc 4 màu in lệch góc (CMYK).
- **Áp cho:** ảnh, sticker, hình, chữ.
- **Thông số:**
  - **Cỡ chấm** 2–32 px (8);
  - **Kiểu** 1 màu / CMYK (1 màu);
  - **Góc lưới** 0–90° (45°);
  - **Hình chấm** tròn / vuông / đường kẻ (tròn);
  - **Màu mực, màu giấy** (đen / trong suốt).
- **Kết quả:** pop art, truyện tranh, poster in lụa.
- **Độ nặng:** nhẹ.

#### B6. Hai tông màu (Duotone)

- **Trông thế nào:** phần tử chỉ còn **2 (hoặc 3) màu**: vùng tối mang màu A, vùng sáng mang màu B, ở giữa chuyển dần.
- **Áp cho:** ảnh, sticker.
- **Thông số:**
  - **Màu tối**;
  - **Màu sáng**;
  - **Màu giữa** (tuỳ chọn);
  - **Tương phản** −50…50 (0);
  - **Trộn** 0–100 % (100).
  - Có **10 cặp màu gợi ý** (xanh–hồng, cam–tím, vàng–xanh navy…).
- **Kết quả:** poster kiểu Spotify, ảnh đồng bộ màu thương hiệu.
- **Độ nặng:** nhẹ.

#### B7. Pop art

- **Trông thế nào:** màu bị **gom về ít mảng phẳng** (posterize), viền đen dày quanh mảng, có thể thêm chấm bi ở vùng tối, như tranh Warhol / Lichtenstein.
- **Áp cho:** ảnh, sticker.
- **Thông số:**
  - **Số mảng màu** 2–8 (4);
  - **Viền đen** 0–100 (50);
  - **Chấm bi** 0–100 (30);
  - **Bảng màu** giữ màu gốc / 4 bảng pop (giữ màu gốc).
- **Kết quả:** chân dung pop art, sticker từ ảnh.
- **Độ nặng:** vừa.

#### B8. Ký tự ASCII

- **Trông thế nào:** phần tử được vẽ lại bằng **các ký tự** (`@ # % * + : .`) xếp lưới; ký tự đậm cho vùng tối.
- **Áp cho:** ảnh, sticker.
- **Thông số:**
  - **Cỡ ký tự** 6–32 px (12);
  - **Bộ ký tự** cổ điển / khối ▓▒░ / chữ tuỳ chọn (cổ điển). Chữ tuỳ chọn cho gõ một từ, ví dụ tên mình, để lặp làm ký tự;
  - **Màu** giữ màu gốc / 1 màu (1 màu xanh lá trên nền đen);
  - **Nền** trong suốt / đen / trắng.
- **Kết quả:** ảnh kiểu hacker, terminal; poster chữ.
- **Độ nặng:** vừa.

#### B9. Dither 1-bit

- **Trông thế nào:** phần tử thành **chấm điểm 2 màu** (hoặc 4 màu kiểu máy chơi game cầm tay đời đầu) theo mẫu dither, như ảnh máy tính cổ / màn hình e-ink.
- **Áp cho:** ảnh, sticker.
- **Thông số:**
  - **Bảng màu** đen trắng / 4 xanh lá cổ / 2 màu tuỳ chọn (đen trắng);
  - **Kiểu dither** Bayer / khuếch tán / chấm (khuếch tán);
  - **Cỡ điểm** 1–6 (2);
  - **Tương phản** −50…50.
- **Kết quả:** ảnh retro máy tính, zine.
- **Độ nặng:** vừa.

### C. Ánh sáng & khối

#### C1. Phát sáng neon (Glow)

- **Trông thế nào:** quanh phần tử có **quầng sáng** màu toả ra như đèn neon; lõi có thể trắng sáng, quầng gồm một lớp hẹp gắt và một lớp rộng dịu.
- **Áp cho:** chữ, sticker, hình, nét vẽ, widget (ảnh: quầng quanh khung).
- **Thông số:**
  - **Màu sáng** (theo màu phần tử / tuỳ chọn);
  - **Độ toả** 2–60 px (20);
  - **Cường độ** 0–200 % (100);
  - **Lõi trắng** 0–100 (40);
  - **Chỉ viền** bật / tắt (tắt). Bật thì phần tử thành ống neon rỗng;
  - **Chớp hỏng** 0–100 (0), là vài đoạn tối như ống neon hỏng.
- **Kết quả:** biển hiệu neon, chữ trên ảnh đêm.
- **Độ nặng:** vừa.

#### C2. Đổ bóng dài (Long shadow)

- **Trông thế nào:** từ phần tử kéo ra một **khối bóng dài liền** theo một hướng, mờ dần về cuối, kiểu flat design.
- **Áp cho:** chữ, sticker, hình, widget, nét vẽ.
- **Thông số:**
  - **Hướng** 8 hướng / 0–360° (↘);
  - **Độ dài** 4–400 px (120);
  - **Màu bóng** (đen 30 %);
  - **Mờ dần** 0–100 (60);
  - **Kiểu** liền / sọc / chấm (liền).
- **Kết quả:** chữ tiêu đề nổi bật, icon kiểu flat.
- **Độ nặng:** nhẹ.

#### C3. Bóng cứng lệch (Offset shadow)

- **Trông thế nào:** một **bản sao đặc màu** của phần tử nằm lệch phía sau, không mờ, kiểu poster retro / neo-brutalism. Có thể nhiều lớp so le nhiều màu.
- **Áp cho:** chữ, sticker, hình, widget, ảnh.
- **Thông số:**
  - **Hướng** 8 hướng (↘);
  - **Khoảng lệch** 2–60 px (12);
  - **Số lớp** 1–5 (1);
  - **Màu từng lớp**;
  - **Kiểu** đặc / chỉ viền / sọc chéo (đặc).
- **Kết quả:** chữ retro 70s nhiều lớp màu, nhãn kiểu sticker nổi.
- **Độ nặng:** nhẹ.

#### C4. Khối 3D (Extrude)

- **Trông thế nào:** phần tử có **độ dày** như khối đặc nhìn hơi nghiêng: mặt trước là phần tử, mặt bên kéo dài ra sau tối dần, cạnh có vát sáng.
- **Áp cho:** chữ (chính), sticker, hình, widget.
- **Thông số:**
  - **Độ dày** 2–120 px (30);
  - **Hướng** 0–360° (↘);
  - **Màu mặt bên** (tối hơn màu phần tử / tuỳ chọn);
  - **Vát cạnh** 0–10 px (2);
  - **Hướng ánh sáng** 8 hướng (↖);
  - **Bóng đổ dưới** bật / tắt.
- **Kết quả:** chữ 3D kiểu đồ chơi, logo khối, tiêu đề game.
- **Độ nặng:** vừa.

#### C5. Viền sticker (Die-cut outline)

- **Trông thế nào:** quanh phần tử có **viền trắng dày** ôm theo hình dạng (bỏ qua chỗ trong suốt) và bóng nhẹ, như sticker cắt bế dán lên. Có thể hơi bong một góc.
- **Áp cho:** ảnh đã tách nền, sticker, chữ, nét vẽ, hình.
- **Thông số:**
  - **Độ dày viền** 0–40 px (14);
  - **Màu viền** (trắng);
  - **Viền thứ hai** 0–20 px (0);
  - **Bóng** 0–100 (40);
  - **Bong góc** 0–100 (0), kèm chọn góc;
  - **Độ bóng nhựa** 0–100 (0), là một vệt sáng chéo.
- **Kết quả:** biến ảnh tách nền / chữ thành sticker; style scrapbook, Instagram story.
- **Độ nặng:** vừa.

#### C6. Phản chiếu (Reflection)

- **Trông thế nào:** dưới (hoặc cạnh) phần tử có **bản lật ngược** mờ dần như đứng trên mặt kính / mặt nước.
- **Áp cho:** tất cả.
- **Thông số:**
  - **Phía** dưới / trên / trái / phải (dưới);
  - **Khoảng cách** 0–100 px (0);
  - **Độ dài** 10–100 % (50 %);
  - **Độ mờ đầu** 0–100 % (40 %);
  - **Gợn nước** 0–100 (0). Bật là phản chiếu lăn tăn như trên mặt hồ.
- **Kết quả:** sản phẩm "trên mặt kính", chữ phản chiếu mặt nước.
- **Độ nặng:** nhẹ.

#### C7. Kính mờ (Frosted / Fluted glass)

- **Trông thế nào:** phần tử như **nhìn qua tấm kính**: kính mờ hạt (mờ đều), hoặc kính sọc (từng sọc dọc khúc xạ lệch). Viền tấm kính có ánh sáng.
- **Áp cho:** ảnh, sticker, widget.
- **Thông số:**
  - **Kiểu** mờ hạt / sọc dọc / sọc ngang / ô lưới (sọc dọc);
  - **Số sọc** 5–60 (20);
  - **Khúc xạ** 0–100 (40);
  - **Độ mờ** 0–30 (8);
  - **Màu kính** (trong);
  - **Viền sáng** 0–100 (30).
- **Kết quả:** ảnh sau kính nhà tắm / quán cà phê, cảm giác riêng tư nghệ thuật.
- **Độ nặng:** vừa.

#### C8. Tia sáng (Light rays)

- **Trông thế nào:** từ phần sáng của phần tử (hoặc từ một điểm) **toả ra các tia sáng** như nắng xuyên qua mây / sau chữ.
- **Áp cho:** ảnh, chữ, sticker, widget.
- **Thông số:**
  - **Điểm gốc** (điểm kéo; mặc định sau phần tử);
  - **Độ dài tia** 0–100 (60);
  - **Cường độ** 0–100 (50);
  - **Màu** (theo phần tử / vàng ấm / tuỳ chọn);
  - **Số tia** mềm / rõ (mềm);
  - **Ngưỡng sáng** 0–100 (60), là phần nào đủ sáng để phát tia.
- **Kết quả:** chữ "thần thánh" có hào quang, ảnh nắng sớm xuyên rừng.
- **Độ nặng:** vừa.

#### C9. Dập nổi / chìm (Emboss)

- **Trông thế nào:** phần tử như được **dập nổi** (hoặc ấn chìm) vào giấy / da / kim loại. Màu gần như mất, chỉ còn khối nhờ sáng ở một cạnh và tối ở cạnh kia.
- **Áp cho:** chữ, sticker, hình, ảnh.
- **Thông số:**
  - **Kiểu** nổi / chìm (nổi);
  - **Độ sâu** 0–100 (40);
  - **Hướng sáng** 8 hướng (↖);
  - **Chất liệu** giữ màu / giấy trắng / da / vàng / bạc (giữ màu);
  - **Độ mềm** 0–100 (30).
- **Kết quả:** logo dập trên thiệp cưới, bìa da, huy hiệu kim loại.
- **Độ nặng:** nhẹ.

### D. Chất liệu & vẽ

#### D1. Màu nước loang (Watercolor)

- **Trông thế nào:** phần tử như **vẽ màu nước**: mảng màu bệt, rìa loang không đều và đậm hơn ở mép, thấy vân giấy, có thể có vết nước.
- **Áp cho:** ảnh, sticker, hình, chữ.
- **Thông số:**
  - **Độ loang** 0–100 (40);
  - **Viền đậm** 0–100 (50);
  - **Vân giấy** 0–100 (40);
  - **Chi tiết** 1–5 (3); thấp là mảng to;
  - **Vết nước** 0–100 (20);
  - **Xáo**.
- **Kết quả:** ảnh du lịch như tranh, thiệp mời nhẹ nhàng.
- **Độ nặng:** nặng.

#### D2. Mực tàu (Ink wash)

- **Trông thế nào:** phần tử thành **tranh mực tàu đen xám** vài sắc độ trên giấy dó ngả vàng, rìa mực thấm xơ giấy.
- **Áp cho:** ảnh, sticker, chữ, hình.
- **Thông số:**
  - **Đậm mực** 0–100 (60);
  - **Số sắc độ** 2–6 (4);
  - **Thấm xơ** 0–100 (30);
  - **Màu giấy** trắng / dó ngà / trong suốt (dó ngà);
  - **Con dấu đỏ** bật / tắt, kèm chữ trên dấu.
- **Kết quả:** phong cảnh / chân dung kiểu tranh thuỷ mặc, phong cách Á Đông.
- **Độ nặng:** vừa.

#### D3. Phác thảo chì (Pencil sketch)

- **Trông thế nào:** phần tử thành **nét chì**: đường viền và các nét gạch bóng; giấy trắng hoặc trong suốt.
- **Áp cho:** ảnh, sticker.
- **Thông số:**
  - **Độ đậm nét** 0–100 (50);
  - **Gạch bóng** 0–100 (50);
  - **Hướng gạch** 0–180° (45°);
  - **Màu chì** chì xám / than / màu gốc (chì xám);
  - **Nền giấy** trắng / ngà / trong suốt.
- **Kết quả:** chân dung kiểu phác hoạ, sổ tay du lịch.
- **Độ nặng:** vừa.

#### D4. Sơn dầu (Oil paint)

- **Trông thế nào:** mảng màu dày **theo nét cọ**, mép mảng mềm, có ánh bóng nổi của lớp sơn.
- **Áp cho:** ảnh, sticker.
- **Thông số:**
  - **Cỡ cọ** 2–20 (6);
  - **Độ dày sơn** 0–100 (40);
  - **Hướng nét** tự nhiên / theo một hướng;
  - **Bóng sơn** 0–100 (30).
- **Kết quả:** ảnh như tranh sơn dầu treo tường.
- **Độ nặng:** nặng.

#### D5. Sáp màu / phấn (Crayon / Chalk)

- **Trông thế nào:** phần tử như **tô bằng sáp màu / phấn**: nét sần, chừa trống chỗ giấy lõm, mép không đều.
- **Áp cho:** chữ, sticker, hình, nét vẽ, ảnh.
- **Thông số:**
  - **Kiểu** sáp màu / phấn bảng / phấn tiên (sáp màu);
  - **Độ sần** 0–100 (50);
  - **Hướng tô** 0–180° (30°);
  - **Mép run** 0–100 (30).
- **Kết quả:** chữ kiểu trẻ con vẽ, bảng menu quán.
- **Độ nặng:** vừa.

#### D6. In lụa Riso (Risograph)

- **Trông thế nào:** như **in Risograph**: 1–3 lớp mực màu tươi (hồng, xanh, vàng) in chồng **lệch nhau một chút**, có hạt mực và chấm trame.
- **Áp cho:** ảnh, sticker, chữ, hình.
- **Thông số:**
  - **Màu mực** 1–3 lớp, chọn từ 12 màu Riso;
  - **Lệch in** 0–20 px (4);
  - **Hạt mực** 0–100 (40);
  - **Trame** 0–100 (30).
- **Kết quả:** poster indie, zine, ảnh kiểu ấn phẩm nghệ thuật.
- **Độ nặng:** nhẹ.

#### D7. Khói / sương (Smoke)

- **Trông thế nào:** quanh / trên phần tử có **làn khói / sương** cuộn mềm. Có thể làm mép phần tử tan dần vào khói.
- **Áp cho:** ảnh, chữ, sticker.
- **Thông số:**
  - **Mật độ** 0–100 (50);
  - **Cỡ cuộn** 1–10 (4);
  - **Màu khói** (trắng);
  - **Hướng bốc** 8 hướng (↑);
  - **Tan mép** 0–100 (30);
  - **Xáo**.
- **Kết quả:** chữ huyền bí, ảnh sân khấu, poster phim kinh dị.
- **Độ nặng:** vừa.

#### D8. Lửa viền (Fire)

- **Trông thế nào:** mép phần tử **bốc lửa**: các lưỡi lửa vàng–cam–đỏ liếm lên theo một hướng.
- **Áp cho:** chữ, sticker, hình, widget.
- **Thông số:**
  - **Độ cao lửa** 4–120 px (40);
  - **Hướng** 8 hướng (↑);
  - **Độ cuộn** 0–100 (50);
  - **Bảng màu** lửa đỏ / lửa xanh / lửa tím (lửa đỏ);
  - **Cường độ** 0–100 (70);
  - **Xáo**.
- **Kết quả:** chữ "HOT", "SALE" cháy, poster thể thao.
- **Độ nặng:** nặng.

#### D9. Băng giá (Frost)

- **Trông thế nào:** mép phần tử **đóng băng**: viền tinh thể đá trắng xanh, các nhánh sương giá mọc vào trong, có tuyết lấm tấm.
- **Áp cho:** chữ, sticker, hình, widget, ảnh.
- **Thông số:**
  - **Độ dày băng** 0–100 (40);
  - **Nhánh giá** 0–100 (50);
  - **Tuyết** 0–100 (30);
  - **Màu** xanh băng / trắng (xanh băng);
  - **Xáo**.
- **Kết quả:** chữ mùa đông, Giáng sinh, đồ uống lạnh.
- **Độ nặng:** vừa.

#### D10. Kim tuyến (Glitter)

- **Trông thế nào:** bề mặt phần tử phủ **hạt kim tuyến lấp lánh**: hạt nhỏ đổi sáng, vài điểm sáng chữ thập.
- **Áp cho:** chữ, sticker, hình, nét vẽ.
- **Thông số:**
  - **Màu kim tuyến** vàng / bạc / hồng / cầu vồng / theo màu phần tử (vàng);
  - **Cỡ hạt** 1–6 (2);
  - **Mật độ lấp lánh** 0–100 (40);
  - **Điểm sáng ✦** 0–20 (5);
  - **Xáo**.
- **Kết quả:** chữ sinh nhật, Tết, tiệc; sticker lung linh.
- **Độ nặng:** nhẹ.

### E. Chuyển động (trên ảnh tĩnh)

#### E1. Nhòe chuyển động (Motion blur)

- **Trông thế nào:** phần tử nhòe kéo vệt theo một hướng như đang lao nhanh. Có thể giữ một phần nét.
- **Áp cho:** tất cả.
- **Thông số:**
  - **Hướng** 0–360° (→);
  - **Độ dài** 0–100 (40);
  - **Giữ nét đầu** 0–100 (50);
  - **Lệch tâm** để chọn phía nào nét.
- **Kết quả:** chữ "SPEED", ảnh xe / người đang chạy.
- **Độ nặng:** vừa.

#### E2. Phóng tâm (Zoom blur)

- **Trông thế nào:** nhòe **toả ra từ một điểm** như máy ảnh zoom khi chụp; tâm nét, ra rìa nhòe kéo dài.
- **Áp cho:** ảnh, chữ, sticker.
- **Thông số:**
  - **Tâm** (điểm kéo);
  - **Mức** 0–100 (40);
  - **Vùng nét giữa** 0–100 % (30 %).
- **Kết quả:** ảnh hành động, chữ "BOOM".
- **Độ nặng:** vừa.

#### E3. Bóng lặp (Echo)

- **Trông thế nào:** phía sau phần tử có **nhiều bản sao mờ dần** nối đuôi theo một hướng như vệt chuyển động / phơi sáng nhiều lần. Có thể đổi màu từng bản.
- **Áp cho:** chữ, sticker, hình, widget, ảnh đã tách nền.
- **Thông số:**
  - **Số bản** 1–12 (5);
  - **Hướng** 8 hướng / góc (↙);
  - **Khoảng cách** 2–80 px (16);
  - **Mờ dần** 0–100 (60);
  - **Đổi cỡ** −50…50 % (0); âm là bản sau nhỏ dần;
  - **Màu** giữ màu / cầu vồng / một màu.
- **Kết quả:** chữ retro lặp kiểu 80s, người nhảy có vệt.
- **Độ nặng:** nhẹ.

### F. Nhiếp ảnh (chỉ ảnh)

#### F1. Tilt-shift

- **Trông thế nào:** một dải ngang (hoặc vòng tròn) nét, trên dưới mờ dần; màu hơi đậm lên, làm cảnh thật trông như **mô hình thu nhỏ**.
- **Áp cho:** ảnh.
- **Thông số:**
  - **Kiểu** dải / tròn (dải);
  - **Vị trí, góc dải** (kéo trên canvas);
  - **Độ rộng vùng nét** 5–60 % (20 %);
  - **Độ mờ** 0–100 (60);
  - **Tăng màu** 0–100 (30).
- **Kết quả:** ảnh phố từ trên cao như mô hình đồ chơi.
- **Độ nặng:** vừa.

---

## 7. Dữ liệu

- Mỗi phần tử thêm một trường:

  ```
  effect?: {
    id: string;                       // "melt", "twirl"…
    params: Record<string, number | string | boolean>;
    seed?: number;                    // nút Xáo
  }
  ```

- Thông số lưu theo **tỉ lệ kích thước phần tử** (không theo px màn hình), để phóng to / thu nhỏ phần tử thì hiệu ứng vẫn y vậy.
- Không có `effect` thì phần tử vẽ như hiện nay. Dự án cũ không bị ảnh hưởng.

## 8. Thứ tự làm (đề xuất)

1. **Khung chức năng**: nút Hiệu ứng, sheet, xem trước, ✓ / ✕, lưu, xuất.
2. **Đợt 1** (nhẹ, hay dùng):
   - Chảy, Vắt qua mép, Xoáy, Phình / Co, Sóng uốn, Uốn cong;
   - Glitch, Pixel, Tách màu RGB, Chấm báo in, Hai tông màu;
   - Đổ bóng dài, Bóng cứng lệch, Viền sticker, Phản chiếu, Bóng lặp, Kim tuyến.
3. **Đợt 2**:
   - Cờ bay, Gợn nước, Phối cảnh 3D, Mắt cá, Gương, Kính vạn hoa, Kéo vệt, Xé đôi, Gấp giấy;
   - CRT / VHS, Dither, In lụa Riso;
   - Dập nổi, Phát sáng neon, Khối 3D, Tia sáng;
   - Nhòe chuyển động, Phóng tâm, Tilt-shift.
4. **Đợt 3** (nặng):
   - Vỡ mảnh, Pop art, ASCII;
   - Kính mờ, Màu nước, Mực tàu, Phác thảo chì, Sơn dầu, Sáp màu / phấn;
   - Khói, Lửa viền, Băng giá.

## 9. Câu hỏi cho chủ dự án

1. Danh sách 48 hiệu ứng: cần thêm / bớt cái nào?
2. Mỗi phần tử một hiệu ứng có đủ không, hay cần chồng 2–3 hiệu ứng ngay từ đầu?
3. Làm Hiệu ứng trước hay 120 Filter trước?


## 10. Đã làm (D-123, 2026-10-19)

- **Mỗi phần tử một hiệu ứng** (chủ dự án chốt).
- Nút **Hiệu ứng** (icon đũa phép) có trên thanh công cụ của:
  - ảnh (trừ video);
  - chữ;
  - widget;
  - sticker / emoji / icon;
  - hình;
  - nét vẽ.
- Sheet gồm:
  - 5 tab nhóm;
  - ô **Không**;
  - ảnh xem trước từng hiệu ứng trên chính phần tử;
  - bảng thông số (thanh trượt, 8 hướng, lựa chọn, màu, bật / tắt);
  - **Thêm** cho thông số phụ;
  - **Xáo** 🎲 (hiệu ứng có phần ngẫu nhiên);
  - **Đặt lại**;
  - ✓ là một bước hoàn tác, ✕ huỷ.
- Đợt 1, 17 hiệu ứng:
  - **Biến dạng**: Chảy, Vắt qua mép, Xoáy, Phình / Co, Sóng uốn, Uốn cong;
  - **Kỹ thuật số**: Glitch, Pixel, Tách màu RGB, Chấm báo in, Hai tông màu;
  - **Ánh sáng & khối**: Đổ bóng dài, Bóng cứng lệch, Viền sticker, Phản chiếu;
  - **Chất liệu**: Kim tuyến;
  - **Chuyển động**: Bóng lặp.
- Cách vẽ:
  - phần tử có hiệu ứng được vẽ một lần vào bộ đệm có chừa lề (cho giọt chảy, bóng, phản chiếu tràn ra);
  - hiệu ứng chạy trên điểm ảnh;
  - canvas, xuất ảnh và danh sách lớp đều dùng bản này.
  - Chỉ làm lại khi nội dung / cỡ / thông số đổi; kéo, xoay không làm lại.
  - Tối đa khoảng 2,4 triệu điểm ảnh mỗi phần tử để điện thoại mượt.
- **Chảy**:
  - phần tử dẹt (dòng chữ) chảy theo cả bề rộng, số giọt tăng theo bề rộng;
  - giọt đầu tròn;
  - mặc định bắt đầu từ 70 % để con chữ giữ hình, chỉ chân chữ chảy.
- Tâm (Xoáy, Phình) hiện chỉnh bằng thanh trượt **Tâm ngang / dọc** trong "Thêm". Kéo điểm trên canvas: làm sau.
- Danh sách lớp ghi thêm "· tên hiệu ứng".
- Chưa làm: các hiệu ứng đợt 2, đợt 3 (mục 8).


## 11. Góp ý sau đợt 1 và đợt 2 (D-124, 2026-10-19)

### Chảy (chủ dự án: "trông như núm vú con bò sữa")

Trước đây giọt là các "lưỡi" kéo dài, rộng gốc, đầu tròn. Giờ vẽ như sơn / kem chảy thật:

- phần sau "Bắt đầu từ" chỉ **võng nhẹ và gợn không đều**;
- từ điểm thấp nhất của mép, mỗi giọt là một **dòng mảnh**, chân loe nối vào thân, cuối là **hạt giọt tròn mọng** to hơn dòng;
- giọt lấy màu tại chỗ nhỏ ra; thân hơi tối ở hai bên, có **vệt sáng ướt** và đốm bóng trên hạt (theo "Bóng loáng");
- độ dài và độ rộng mỗi giọt khác nhau; Xáo đổi vị trí.

### Phản chiếu (mặt nước tự nhiên)

| Thông số | Khoảng | Mặc định | Tác dụng |
| --- | --- | --- | --- |
| Gợn nước | 0–100 | 0 | độ lệch ngang của gợn, xa mép thì mạnh hơn |
| **Sóng tự nhiên** (mới) | 0–100 | 50 | 0 là gợn đều; cao là trộn nhiều sóng, gợn khác nhau dọc mặt nước, đứt quãng như mặt hồ |
| **Cỡ sóng** (mới) | 0–100 | 40 | sóng dày hay thưa |
| **Vệt sáng nước** (mới) | 0–100 | 0 | các dải sáng nằm ngang trên mặt nước |
| **Nhòe nước** (mới) | 0–100 | 0 | nhòe dọc mặt nước, xa mép nhòe hơn |

Có nút Xáo.

### Đợt 2: 19 hiệu ứng

| Nhóm | Hiệu ứng |
| --- | --- |
| Biến dạng | Cờ bay (mép buộc trái / phải / trên, gió, số nếp, bóng vải), Gợn nước (tâm, biên độ, khoảng vòng, tắt dần, ánh nước), Phối cảnh 3D (nghiêng dọc / ngang, độ sâu ống kính), Mắt cá (cắt tròn), Gương (trái → phải, phải → trái, trên → dưới, dưới → trên, 4 góc; vị trí trục), Kính vạn hoa (số cánh, góc, phóng, tâm), Kéo vệt (hướng, vị trí cắt, lệch vệt), Xé đôi (dọc / ngang, vị trí, khoảng hở, lệch, mép giấy xơ, răng cưa, Xáo), Gấp giấy (nếp dọc / ngang, độ sâu, hướng sáng, nhăn) |
| Kỹ thuật số | CRT / VHS (vạch quét, loang màu, nhiễu, cong màn, dải nhiễu, chữ PLAY ▶ / ● REC kèm giờ), Dither 1-bit (đen trắng / 4 xanh lá cổ / 2 màu; khuếch tán / lưới Bayer; cỡ điểm) |
| Ánh sáng & khối | Dập nổi / chìm (giữ màu / giấy trắng / vàng / bạc), Phát sáng neon (màu, độ toả, cường độ, lõi trắng, chỉ viền, chớp hỏng), Khối 3D (hướng, độ dày, màu mặt bên, vát cạnh, bóng đổ), Tia sáng (độ dài, cường độ, màu, ngưỡng sáng, tâm) |
| Chất liệu | In lụa Riso (5 cặp mực, lệch in, hạt mực, trame) |
| Chuyển động | Nhòe chuyển động (vệt phía sau hướng chạy, giữ nét), Phóng tâm (vùng nét giữa), Tilt-shift (dải / tròn, vị trí, độ rộng vùng nét, độ mờ, tăng màu) |

### Ghi chú

- **Kính vạn hoa** chỉ cho ảnh / sticker / hình.
- **Tilt-shift** chỉ cho ảnh; xếp ở nhóm Chuyển động, không mở thêm tab Nhiếp ảnh.
- **Tia sáng**:
  - phần tử trong suốt (chữ, sticker) toả theo **hình dạng**, ảnh toả từ **vùng sáng**;
  - tâm mặc định là **trọng tâm phần có nét** (chữ có thể nằm lệch trong khung);
  - tia có sọc theo góc và mờ dần trước mép.
- **Phát sáng neon** giữ màu của phần tử, chỉ toả sáng phía sau (chế độ "Chỉ viền" thì thành ống neon).
- **Cờ bay**: biên độ theo chiều dài tấm vải.


## 12. Đợt 3: 12 hiệu ứng (D-125, 2026-10-19)

| Hiệu ứng | Thông số | Ghi chú |
| --- | --- | --- |
| Vỡ mảnh | số mảnh, tách rời, xoay mảnh, viền cạnh, tâm vỡ, Xáo | mảnh nhỏ và dày gần tâm vỡ; khe nứt và viền sáng ở cạnh |
| Pop art | số mảng màu, viền đen, chấm bi, bảng màu (giữ màu / hồng vàng / truyện tranh / bạc hà san hô / đêm) | |
| Ký tự ASCII | cỡ ký tự, bộ ký tự (@#%*+:. / ▓▒░ / 01), màu (xanh terminal / giữ màu / đen trên giấy), nền | chỉ ảnh / sticker / hình |
| Kính mờ | kiểu (mờ hạt / sọc dọc / sọc ngang / ô lưới), số sọc, khúc xạ, độ mờ, viền sáng, màu kính | chỉ ảnh / sticker / hình |
| Màu nước loang | độ loang, viền đậm, vân giấy, chi tiết, Xáo | mép loang không đều, sắc tố đọng ở viền |
| Mực tàu | đậm mực, số sắc độ, thấm xơ, giấy (dó ngà / trắng / trong suốt), con dấu đỏ | |
| Phác thảo chì | độ đậm nét, gạch bóng (2 lớp chéo ở vùng tối), hướng gạch, màu chì (xám / than / màu gốc), nền giấy | chỉ ảnh / sticker / hình |
| Sơn dầu | cỡ cọ, độ dày sơn, bóng sơn | lọc Kuwahara (bảng cộng dồn, nhanh) + sáng tối theo nét cọ |
| Sáp màu / phấn | kiểu (sáp màu / phấn bảng / phấn tiên), độ sần, hướng tô, mép run, Xáo | |
| Khói / sương | mật độ, cỡ cuộn, màu khói, hướng bốc, tan mép, Xáo | làn khói loe dần, mỏng dần; phần tử tan ở chỗ khói bốc |
| Lửa viền | độ cao lửa (% cỡ phần tử), hướng, độ cuộn, lửa đỏ / xanh / tím, cường độ, Xáo | độ cao đổi từ px sang % để ảnh lớn cũng có lửa cao |
| Băng giá | độ dày băng, nhánh giá, tuyết, màu (xanh băng / trắng), Xáo | vỏ băng ngoài viền, sương giá mọc vào trong, đốm tuyết |

### Đo trên máy tính

Ảnh 900 × 1100: mỗi lần áp 40–290 ms (Khói, Màu nước, Vỡ mảnh nặng nhất).

### Đã chỉnh sau khi soát ảnh chụp

- **Khói** ban đầu thành khối chữ nhật cứng: giờ là làn khói loe hai bên, xoắn, tan dần.
- **Lửa** quá thấp trên phần tử lớn: độ cao đổi sang %.
- **Màu nước** sạn hạt: giảm hạt giấy, tăng độ loang.


## 13. Tốc độ (D-126, 2026-10-20)

Chủ dự án: "tốc độ xử lý ở vài hiệu ứng là khá chậm".

- **Đang kéo thanh trượt**: hiệu ứng vẽ ở khoảng 40 % độ phân giải, nhanh gấp khoảng 6 lần.
- **Dừng tay 0,35 giây**: vẽ lại nét đầy đủ.
- **Trần xử lý** mỗi phần tử: 2,4 → 1,6 triệu điểm ảnh.
