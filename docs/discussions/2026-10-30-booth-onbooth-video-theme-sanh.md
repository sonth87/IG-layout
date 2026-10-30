# 2026-10-30 — Booth: học luồng chụp ONBOOTH, ảnh động, Duo, theme sảnh, khung từ IG Layout

> Trạng thái: **Đề xuất** — chưa chốt, chưa code. Câu hỏi: Q-P28 → Q-P35 ([open-questions.md](../roadmap/open-questions.md)).
> Nền: [2026-10-29-booth-thiet-ke.md](2026-10-29-booth-thiet-ke.md), [2026-10-30-booth-khung-theme.md](2026-10-30-booth-khung-theme.md).
> Ảnh: `sample/5/IMG_4204 → 4214` (chủ dự án chụp onboothvn.com trên iPhone, 2026-10-30).

## Ý của chủ dự án
1. Chụp solo ở ONBOOTH: **chụp nhiều hơn số ô** (khung 3 → chụp 6), chọn tấm ưng, chụp lại được; chụp xong **hiện tấm vừa chụp ~2 s** rồi chụp tiếp; **số đếm ngược ở góc** để không che người. Chọn xong mới làm đẹp. Luồng hợp lý → học theo.
2. ONBOOTH **quay video ngắn** thay vì chỉ chụp → tải được "video" = khung có các ô chuyển động. Mình làm hơn được không: **video / GIF / Live Photo**.
3. Duo (IMG_4213, 4214): cách hiển thị; đoán là khung 4 thì mỗi người chụp 2.
4. Sảnh booth trên điện thoại: các nút **xếp một hàng dọc**.
5. Sảnh có **nhiều theme** ngoài rạp chiếu phim: **Noel, Tết, Halloween, Cyberpunk, Glitch**. Đổi theme bằng **vuốt ngang**; góc màn có **ô vuông nhỏ theo màu theme** để biết đang ở theme nào. Theme sảnh cũng dùng được làm theme cho khung.
6. Đưa **khung / template của IG Layout** vào booth (xé giấy, phim, khung tranh…) để bổ trợ theme.

---

## 1. Đọc ảnh ONBOOTH — chụp solo

| Ảnh | Màn | Thấy gì |
|---|---|---|
| 4204 | Chụp | Thanh trên kem, viền lỗ phim đỏ. Camera trong **polaroid lớn hơi nghiêng**, chú thích "you". Nhãn **SHOT 1/6** trên polaroid. **Thẻ đếm ngược ở góc trên phải**: số to (serif, bóng đỏ) + nhãn vàng **gợi ý tạo dáng** ("HANDS UP!"). Thẻ đè lên mép polaroid, không đè mặt. Dưới: **CAPTURE NOW** (đỏ), MIRROR, LEAVE. |
| 4206 | Chụp | SHOT 3/6, thẻ đếm "7 · DUCK FACE!" (mỗi kiểu một gợi ý khác). Dưới polaroid: **6 ô chờ** — ô đã chụp là ảnh nhỏ, ô chưa chụp là **khung nét đứt đánh số 3, 4, 5, 6**. |
| 4207 | Sau khi chụp | Cả màn tối đi, **ảnh vừa chụp hiện thành polaroid lớn ở giữa** + dòng "NEXT SHOT COMING UP…"; nút CAPTURE NOW ẩn. Ô số 3 dưới đáy đã có ảnh. |
| 4208 | Chọn ảnh | "THE ROLL IS DEVELOPED" / **Pick your favorites** / "your picks are just for you — everyone chooses their own". **0/3 PICKED**, lưới 2 × 3 ảnh đánh số 01–06, nút mờ "pick 3 more". |
| 4209 | Chọn ảnh | Ảnh đã chọn: **viền vàng + dấu ✓**; 3/3 → nút đỏ **PRINT THE STRIP →**. Không có thứ tự chọn (số trên ảnh là số kiểu). |
| 4210 | Chờ in | Strip mờ + nhãn **✨ BEAUTIFYING…**, **confetti rơi**; trên cùng "↓ scroll down to pick a theme ↓". Strip mặc định trắng, chữ ONBOOTH + ngày dưới đáy. |
| 4211 | Kết quả | Kéo lên một tấm giấy: **THEME (JUST FOR YOU) · PICK A THEME PACK**, tab **Simple / Patterns**, thẻ Black · White · Cream · Pink… vuốt ngang có chấm trang. **FILTER**: Original · Beauty · Vintage warm · Classic film… Nút: **KEEP IT ↓** (lưu), **SHARE TO STORY ↗**, **DOWNLOAD VIDEO 🎥**, CHANGE PICKS, NEW ROLL. |

### So với booth của mình hiện tại

| Điểm | ONBOOTH | Booth mình (code hiện tại) |
|---|---|---|
| Chụp dư | **Luôn gấp đôi** số ô (3 → 6) | Tuỳ chọn "chụp dư", **+2 kiểu**, mặc định tắt (D-157, `SPARE = 2`) |
| Đếm ngược | **Thẻ nhỏ ở góc**, kèm gợi ý tạo dáng | Vòng tròn + số to **giữa màn** (`Shoot.tsx`) — che mặt người chụp |
| Sau mỗi kiểu | Ảnh vừa chụp **phủ lên giữa màn ~2 s** ("kiểu tiếp theo…") | Ảnh bay xuống dải thumbnail ở đáy, nghỉ 2 s (D-154) — mắt đang nhìn camera nên dễ không thấy |
| Ô chờ | Ô nét đứt đánh số dưới camera | Dải ô vuông nhỏ trên thanh trên + thumbnail đáy |
| Chọn ảnh | Chạm để chọn, không có thứ tự | Chạm theo thứ tự, có số thứ tự (Pick.tsx) — **của mình tốt hơn** (biết ảnh nào vào ô nào) |
| Chụp lại | Không thấy nút chụp lại một kiểu (chỉ CHANGE PICKS / NEW ROLL) | "Chụp lại kiểu vừa rồi" lúc chụp |
| Sau chọn | Màn "BEAUTIFYING…" + confetti, rồi theme / filter ngay dưới bản in | Màn kết quả → Trang trí (đủ hơn nhiều: bố cục, sticker, chữ…) |
| Video | **DOWNLOAD VIDEO** | Chưa có (Q-P20 gác) |

### Đề xuất sửa luồng chụp solo
1. **Chụp dư mặc định bật, gấp đôi số ô** (khung 3 → 6, khung 4 → 8). Vẫn tắt được. Khung 1 ô (polaroid) → 3 kiểu.
   - Thời gian: 8 s đếm + 2 s nghỉ (D-154) × 8 kiểu = **80 s** cho khung 4 — dài. Đề xuất: **kiểu đầu 8 s, các kiểu sau 5 s** (người ta đã vào tư thế). Cần chủ dự án chốt (**Q-P28**).
2. **Đếm ngược chuyển ra góc**: thẻ giấy nhỏ nghiêng ở góc trên (bên phải; nếu tay phải cầm máy thì vẫn không che), số to + **gợi ý tạo dáng** đổi theo từng kiểu (song ngữ, ~20 câu: "Giơ tay lên!", "Mặt ngầu!", "Nhìn sang trái", "Tim bằng tay"…). 3 giây cuối thẻ nảy + đổi đỏ. Tắt được gợi ý. Vòng tiến độ chuyển thành **viền chạy quanh polaroid camera** (thấy được mà không che).
3. **Xem lại ảnh vừa chụp 2 s**: dùng chính 2 s nghỉ hiện có — sau loé trắng, ảnh vừa chụp hiện thành polaroid lớn giữa màn (camera mờ phía sau), "Kiểu tiếp theo…", rồi **bay vào ô của nó** ở dải dưới. Chạm vào ảnh lúc đó = **chụp lại kiểu này** (thay cho nút riêng).
4. **Ô chờ nét đứt đánh số** dưới camera thay cho dải ô vuông nhỏ trên thanh trên (giống 4206) — rõ còn mấy kiểu.
5. **Chọn ảnh** giữ cách của mình (chọn theo thứ tự, có số), thêm: **giữ lâu để xem to**, nút **"Chụp thêm 1 kiểu"** nếu không ưng tấm nào, và từ màn kết quả có **"Chọn lại ảnh"** (như CHANGE PICKS).
6. Màn chờ "đang tráng phim…" + confetti (~1 s) trước khi ra bản in: hợp với hoạt ảnh máy in đã đề xuất (§2.6 booth-thiet-ke). Nhỏ, làm kèm.

---

## 2. Ảnh động: video / GIF / Live Photo

ONBOOTH gọi là "download video": bản in với **mỗi ô là một đoạn video ngắn** — chính là "live strip" đã giải thích ở Q-P20. Chủ dự án giờ đã thấy mục đích → đề xuất **bỏ gác Q-P20, làm**.

### Cách quay
- Trong lúc chụp, ghi camera liên tục bằng **MediaRecorder** (iOS Safari ≥ 14.5 ghi MP4, Chrome ghi WebM/MP4), cắt thành từng đoạn: **~1,5 s trước + ~1,5 s sau** lúc bấm chụp → mỗi kiểu một clip ~3 s. Không thêm thao tác nào cho người dùng.
- Ảnh tĩnh vẫn chụp như cũ (độ nét cao); clip chỉ cần 720p.
- Chụp dư 8 kiểu × 3 s × ~1–1,5 MB ≈ 10 MB/cuộn → lưu cùng cuộn trong IndexedDB (mở lại cuộn vẫn xuất video được). Khi xoá cuộn thì xoá clip.
- Clip gắn với kiểu: chọn ảnh nào vào ô thì clip đó vào ô; chụp lại thì thay clip.

### Dạng xuất (đề xuất, theo thứ tự ưu tiên)
| Dạng | Mô tả | Khả thi |
|---|---|---|
| **Video MP4** (chính) | Bản in đầy đủ (theme, sticker, chữ) với các ô **chuyển động cùng lúc**, lặp 2–3 lần, ~6–9 s. Khổ bản in hoặc Story 9:16 / Post 4:5. | **Cao** — vẽ từng khung hình bằng chính hàm vẽ bản in, mã hoá bằng **mediabunny** đã có (D-81). |
| **Boomerang** | Mỗi ô chạy xuôi rồi ngược (kiểu IG Boomerang), loop mượt không giật ở chỗ nối. | **Cao** — cùng đường MP4, chỉ đổi thứ tự khung. Hợp đăng Story / Reels. |
| **GIF** | Bản nhỏ (≤ 540 px, 10–12 fps, ~3 s) để gửi chat / dán. | **Cao**, file to (3–8 MB). Cần thư viện mã hoá GIF nhỏ (vd. `gifenc`, MIT) chạy trong worker. |
| **Video hậu trường** | Nối các clip theo thứ tự chụp, có tiếng màn trập + loé, cuối là bản in. | Trung bình — làm sau MP4. |
| **Motion Photo (Android)** | Một file JPEG có kèm video (định dạng Google Motion Photo: JPEG + MP4 nối đuôi + XMP). Google Photos / Samsung Gallery hiện thành ảnh động. | **Làm được trên web** (chỉ là ghép byte) — nhưng phải thử máy thật. |
| **Live Photo (iPhone)** | Cần **cặp JPEG + MOV** có chung "content identifier" (siêu dữ liệu Apple). Web không có API lưu Live Photo vào Ảnh; chia sẻ 2 file qua share sheet **thường bị lưu thành 2 mục riêng**. | **Thấp / chưa chắc** — cần trang thử trên iPhone thật trước khi hứa. Instagram cũng không đăng Live Photo như ảnh động (Story có thể biến thành boomerang tuỳ phiên bản). |

**Đề xuất:** làm **MP4 + Boomerang** trước (dùng lại mediabunny), GIF ngay sau. Motion Photo / Live Photo làm **trang thử** (`/labs/livephoto`) trên máy thật rồi mới quyết (**Q-P29**).

### Ở màn kết quả
- Thêm công tắc **Ảnh / Động** ngay trên bản in: bật "Động" thì bản in xem trước chạy luôn (người dùng thấy ngay ảnh động trông ra sao — ONBOOTH không cho xem trước).
- Nút lưu theo dạng đang xem: Ảnh → PNG/JPEG như cũ; Động → MP4 (mặc định) · Boomerang · GIF.
- "Mở trong IG Layout": các ô thành **video** trong project (IG Layout đã hỗ trợ video, M13) → chỉnh tiếp như mọi video.

### Phòng chụp chung
Mỗi máy quay clip của mình; gửi clip qua WebRTC nặng hơn ảnh nhiều (~1 MB/clip). Đề xuất **làm sau solo**, khi đó gửi clip đã nén 480p.

---

## 3. Duo (IMG_4213, 4214)

**Thấy gì:** phòng có mã (BOOTH d55k3jp · COPY LINK). Không phải mỗi người một polaroid như phòng nhóm — mà **một polaroid duy nhất chia đôi dọc**: nửa trái là mình (nhãn vàng "H (you)" / "Host"), nửa phải là bạn (nhãn đỏ "Partner", chưa vào thì chữ cái đầu + "WAITING…"); dưới polaroid chữ **DUO**. Nút chính **PICK A LAYOUT →**, rồi MIC, CAM, MIRROR, LEAVE. Ảnh 4214 là lúc trình duyệt xin quyền micro (cam/mic chưa bật → MIC× CAM× đỏ).

**Đoán "khung 4 thì mỗi người chụp 2 tấm":** từ 2 ảnh này **chưa chắc**. Cách hiển thị chia đôi một polaroid gợi ý cách khác: **mỗi kiểu chụp là một ô chứa cả hai người đứng cạnh nhau** (nửa trái / nửa phải ghép lại, như đứng chung một booth) → khung 4 = chụp 4 kiểu, mỗi ô có cả 2 người. Cần thử tới màn kết quả với 2 máy có camera để biết (**Q-P30**).

**Đề xuất cho mình:** làm **Duo = "chung một ô"** (cách thứ hai), vì đó là điểm khác thật so với phòng nhóm hiện tại (phòng nhóm đã xếp mỗi người vào ô riêng theo thứ tự). Cụ thể:
- Ô được chia đôi (dọc cho ô đứng, ngang cho ô nằm… hoặc luôn dọc), mỗi máy chụp cắt đúng nửa của mình; khung xem trước chụp hiện **cả hai nửa ghép trong một polaroid** như ONBOOTH.
- Có đường nối mềm / để trống mảnh giấy giữa hai nửa tuỳ theme.
- Nếu chủ dự án muốn "mỗi người 2 tấm" thì đó chính là phòng nhóm hiện tại với 2 người — giữ như cũ.

---

## 4. Sảnh trên điện thoại: nút xếp dọc

Hiện tại (ảnh chủ dự án gửi): vé "ADMIT ONE" — **Shoot solo** to, dưới là hai ô cạnh nhau **Start a group room** | **Join with a code** (ô mã + GO bị ép nhỏ), rồi "Have photos already? Upload them".

Đề xuất trên điện thoại (< 640 px): **một cột**
1. Chụp một mình (thẻ đỏ to, như cũ)
2. Mở phòng chụp chung (rộng hết)
3. Vào bằng mã: ô mã rộng + nút Vào trên **cùng một hàng**, rộng hết
4. Đã có ảnh? Tải lên (dòng chữ)

Màn rộng hơn giữ hai ô cạnh nhau. Việc nhỏ, làm được ngay khi chủ dự án đồng ý.

---

## 5. Theme cho sảnh booth

### Thay đổi so với đã chốt
§4 booth-thiet-ke ghi "giao diện booth luôn theo Cinema". Giờ: **sảnh có nhiều theme**; các màn sau (chọn khung, chụp, trang trí) đã có "không khí" theo theme bản in (Mood.tsx) — giữ nguyên.

### 6 theme sảnh (Cinema + 5 mới), tất cả vẽ bằng code (SVG / CSS / canvas), không dùng hình có bản quyền
| Theme | Cảnh nền | Chuyển động | Vé / nút | Ô màu ở góc |
|---|---|---|---|---|
| **Cinema** (hiện tại) | Rèm nhung đỏ, đèn sân khấu, viền bóng đèn | Đèn nhấp nháy nhẹ | Vé "ADMIT ONE" kem / đỏ | đỏ nhung |
| **Noel** | Cửa sổ đêm tuyết, cây thông, dây đèn nhiều màu, vòng nguyệt quế | Tuyết rơi, đèn nháy chậm | Vé thành **thiệp / thẻ quà** buộc nơ đỏ | xanh thông + đỏ |
| **Tết** | Nền đỏ son, câu đối, đèn lồng treo, cành mai / đào | Hoa mai rơi, đèn lồng đung đưa | Vé thành **bao lì xì** (viền vàng, chữ Phúc vẽ bằng nét) | đỏ + vàng |
| **Halloween** | Đêm tím, trăng to, hàng rào, bí ngô khắc mặt phát sáng, mạng nhện góc | Dơi bay, sương trôi, bí ngô lập loè | **Vé nhà ma** (cam / đen, mép rách) | cam bí ngô |
| **Cyberpunk** | Phố đêm mưa, biển hiệu neon (hồng / cyan), toà nhà cao | Mưa xiên, neon chập chờn | **Thẻ hologram** viền neon, chữ mono | hồng neon |
| **Glitch** | Màn CRT cong, scanline, khối nhiễu | Tách kênh RGB, chữ giật theo nhịp | **Hộp thoại lỗi** kiểu hệ điều hành cũ ("Shoot.exe") | xanh lục / tím lệch kênh |

- Mỗi theme sảnh có **giọng chữ riêng** (font tiêu đề + câu chào), song ngữ.
- **Glitch / Cyberpunk an toàn mắt**: không nhấp nháy quá 3 lần / giây, không mảng lớn sáng tối đột ngột; **`prefers-reduced-motion` → tắt giật / hạt rơi**, chỉ còn cảnh tĩnh.

### Đổi theme
- **Vuốt ngang** trên vùng sân khấu (không phải trên hàng ảnh gần đây ló từ đáy — hàng đó đang cuộn ngang, §16 khung-theme) → cảnh **đi theo ngón tay**, các lớp chạy lệch tốc độ (parallax: rèm / cửa sổ gần đi nhanh, nền xa đi chậm), thả tay thì **hít về theme gần nhất** bằng lò xo; vuốt nhanh thì sang luôn.
- **Ô vuông nhỏ ở góc** (dưới tag IG Layout hoặc góc trên trái): mỗi theme một ô màu, ô đang chọn to hơn / có viền; **chạm ô để nhảy thẳng tới theme**. Trên máy tính thêm phím ← → và mũi tên mờ hai mép.
- Vuốt vòng (theme cuối → theme đầu).
- **Nhớ theme lần trước.** Đề xuất thêm: theo mùa tự mở theme hợp (tháng 12 → Noel, quanh Tết → Tết, tháng 10 → Halloween) — app đã có `templates/seasons.ts` (**Q-P31**).
- Hiệu năng: chỉ dựng theme đang xem + 2 theme kề; mỗi theme tách file, tải lười; hạt rơi dùng chung `Mood.tsx`.

### Theme sảnh → theme bản in
- Mỗi theme sảnh **dẫn tới một nhóm theme bản in**: chọn "Chụp một mình" từ sảnh Tết → cuộn mới mặc định theme bản in Tết (vẫn đổi được).
- 24 theme bản in hiện có đã có Cyberpunk (nhóm Tương lai) và tuyết; **cần thêm** theme bản in **Tết, Halloween, Glitch** (và Noel đủ bộ) theo đúng nét của sảnh — cùng bảng màu, hoạ tiết, font. Đề xuất mỗi theme sảnh có 2–3 theme bản in đi kèm.

---

## 6. Khung / template IG Layout trong booth

### Hiện có
- Booth: **10 khung** (ô vẽ bằng code) + **24 theme** (giấy + hoạ tiết vẽ bằng code).
- IG Layout: **~450 template** (28 nhóm: phim, xé giấy, scrapbook, Tết, mùa đông, holidays, hoài cổ…) và **17 gói khung có cửa sổ ảnh** (`public/packs/frame`: gen-film, gen-instant, gen-torn-photos, gen-torn-collage, gen-torn-backed, gen-picture-frames, gilded-frames, wooden-frames, vintage-photo-mounts, gen-stamps, postcards, gen-album, gen-camera, gen-notebook, gen-envelopes, labels-cards, ornaments) + **44 bộ sưu tập** (có bộ theo mùa: tet, halloween, christmas, newYear…).

### Ba mức đưa vào (đề xuất)
1. **Khung ảnh rời làm "ô" của booth** (dễ, giá trị cao). Mỗi khung trong gói có cửa sổ ảnh (D-88) → ô booth hình đó: ảnh chụp vào cửa sổ, viền phim / mép xé / khung gỗ / tem nằm trên. Dùng trong màn **Bố cục** của booth như một **"hình ô"** mới (hiện đã có vuông, bo góc, polaroid, vòm, tròn, tim, xé giấy). Ví dụ: dải 4 ô mà mỗi ô là một **tem thư**, hay một **khung phim** thật.
2. **Template IG làm khung booth** (trung bình). Template 1 slide có 2–8 ô ảnh → thành khung booth: số kiểu chụp = số ô; xuất ra **đúng khổ IG** (Post 4:5 / Story 9:16) chứ không phải khổ in 2×6. Template nhiều slide → kết quả là **carousel**. Lúc chụp, camera hiện trong ô đang chụp **ngay trên template** (FrameLive cần hỗ trợ lớp art đè trên ảnh + ô xoay). Đây là cầu nối mạnh nhất booth → IG Layout.
3. **Bộ sưu tập theo theme** (dễ). Theme sảnh / theme bản in chỉ tới bộ sưu tập IG tương ứng (Tết → `tet`, Noel → `christmas`, Halloween → `halloween`, Cyberpunk / Glitch → `neon`, `digital`, `y2k`): sticker gợi ý ở màn trang trí và khung / template gợi ý ở màn chọn khung lấy từ đó.

### Giao diện chọn khung
- Màn chọn khung thêm nhóm **"Từ IG Layout"** chia theo loại (Phim · Xé giấy · Khung tranh · Tem / bưu thiếp · Polaroid · Theo mùa), **lọc theo số kiểu** (2 / 3 / 4 / 6…). Theme sảnh đang chọn → nhóm theo mùa đó lên đầu.
- Khung IG khác khổ in: ghi rõ trên thẻ "Post 4:5" / "Story" / "Carousel 3".

### Lưu ý
- Giấy phép: các gói khung / template đã dùng trong IG Layout (licenses.json) → dùng trong booth cùng app không phát sinh thêm (cần soát lại gói nào là ảnh nguồn ngoài).
- Phòng chụp chung chỉ cần gửi **id khung / template** — dữ liệu có sẵn ở mọi máy.
- Ảnh động (§2) chạy được trên khung IG: video vào cửa sổ y như ảnh.
- Cửa sổ ảnh xoay / không phải chữ nhật → xem trước camera phải cắt theo đúng hình (đã làm cho ô hình tim / vòm, mở rộng thêm cho mask raster).

---

## 7. Thứ tự làm (đề xuất)
1. **Sảnh điện thoại xếp dọc** (§4) — nhỏ.
2. **Luồng chụp kiểu ONBOOTH** (§1): chụp dư mặc định ×2, đếm ở góc + gợi ý dáng, xem lại 2 s, ô chờ nét đứt, chọn lại ảnh.
3. **Ảnh động**: quay clip quanh mỗi kiểu → MP4 + Boomerang → GIF (§2). Trang thử Live Photo / Motion Photo song song.
4. **Theme sảnh**: khung vuốt + ô màu, rồi từng theme Noel → Tết → Halloween → Cyberpunk → Glitch (Noel trước vì sắp tới mùa); kèm theme bản in đi theo.
5. **Khung IG trong booth**: mức 1 (khung ảnh rời làm ô) → mức 3 (bộ sưu tập theo theme) → mức 2 (template IG làm khung).
6. **Duo "chung một ô"** sau khi thử xong Q-P30.

## Câu hỏi cho chủ dự án
Xem [open-questions.md](../roadmap/open-questions.md) mục Photobooth (Q-P28 → Q-P35).

---

## 8. Chủ dự án trả lời (2026-10-30)
- **Mục 1:** không gấp đôi — khung 8 mà chụp 16 là quá nhiều. Số kiểu theo bảng: **1 ô → 1 (chụp luôn), 2 → 5, 3 → 6, 4 → 7, 5 → 8, 6 → 10, 8 → 12** (7 ô nội suy → 11). Trước khi chụp **chọn thời gian đếm 3 / 5 / 8 s** → D-162 (bỏ đề xuất "kiểu đầu 8 s, kiểu sau 5 s").
- **Mục 2:** ok → D-163.
- **Mục 3:** chủ dự án hỏi "chụp chung một ô" có phải **tách người khỏi nền rồi ghép chung một khung** không — trả lời bên dưới, chờ chốt.
- **Mục 4:** ok → D-164.
- **Mục 5:** theme **phải đẹp, có hiệu ứng, đủ bộ**; **nhớ theme đang ở**, mở lại vẫn giữ → D-164.
- **Mục 6:** ok → D-164.

### "Chung một ô" không phải tách nền (giải thích Q-P30)
Ở ONBOOTH (IMG_4213) polaroid Duo chỉ là **hai nửa camera đặt cạnh nhau**: nửa trái là video máy A, nửa phải là video máy B, có đường kẻ ở giữa — **không tách người khỏi nền**. Mỗi ô của bản in sẽ trông như vậy: hai nửa ảnh (mỗi người một nền phòng riêng) ghép sát nhau, chụp cùng một khoảnh khắc. Làm được dễ: mỗi máy cắt camera của mình theo đúng nửa ô (như đang cắt theo ô bây giờ), ghép hai nửa khi in.
Muốn **hai người "đứng chung một phông"** thật thì mới cần tách nền (app đã có mô hình xoá nền ormbg, D-79) + nền chung theo theme — đẹp hơn nhưng nặng (mỗi kiểu tách nền 1–3 s trên điện thoại, viền tóc có thể lởm). Đề xuất: làm **hai nửa** trước; "chung phông" là tuỳ chọn nâng cấp sau.

## 9. Đã làm: sảnh xếp dọc + luồng chụp mới (2026-10-30)
- **Sảnh** (`Home.tsx`): dưới 640 px, "Mở phòng chụp chung" và "Vào bằng mã" xếp dọc, rộng hết; ô mã + nút Vào cùng một hàng. Từ 640 px giữ hai ô cạnh nhau.
- **Chọn khung** (`Setup.tsx`): mục **Đếm ngược 3 / 5 / 8 giây** (nhớ lần trước, mặc định 8); ô chụp dư ghi rõ "Chụp 7 kiểu rồi chọn 4 tấm đẹp nhất", **mặc định bật** (khoá lưu mới `spares` — ai đã tắt "+2" kiểu cũ cũng được bật lại một lần); khung 1 ô không có ô này. Dòng dưới nút: "7 kiểu · đếm 3 giây, nghỉ 2 giây".
- **Số kiểu** (`timing.ts`, `takesFor`): 1 → 1, 2 → 5, 3 → 6, 4 → 7, 5 → 8, 6 → 10, 7 → 11, 8 → 12, trên 8 → +4.
- **Chụp** (`Shoot.tsx`):
  - Số đếm trên **thẻ giấy nhỏ góc trên phải**, nghiêng nhẹ, vạch đỏ chạy dưới đáy thẻ; vài giây cuối số đổi đỏ. Dưới số là **gợi ý tạo dáng** (16 câu song ngữ, mỗi cuộn bắt đầu ở một câu ngẫu nhiên).
  - Chụp xong: **ảnh vừa chụp hiện to giữa màn** trong 2 s nghỉ ("Kiểu tiếp theo…"), nền tối + mờ; **chạm ảnh = chụp lại kiểu đó**. Kiểu cuối hiện "Xong cuộn phim!" ~1,2 s rồi sang chọn ảnh.
  - Dải dưới: **mỗi kiểu một ô**, ô đã chụp là ảnh, ô chưa chụp nét đứt đánh số, ô sắp chụp viền vàng. Bỏ dãy ô vuông nhỏ trên thanh trên (12 ô không vừa).
- **Phòng chụp chung** vẫn đếm 8 s (chưa có chỗ cho chủ phòng chọn) — làm khi làm Duo.
- e2e `booth-solo.mjs` viết lại theo luồng mới (sảnh xếp dọc, 3 s, 7 kiểu, thẻ góc, xem lại + chạm chụp lại, chọn 4, Polaroid không có chụp dư); `booth-desktop`, `booth-sticker`, `booth-zoom-retake` sửa theo mặc định mới — đều qua.

## 10. Đã làm: ảnh động — MP4, Boomerang, GIF (D-163, 2026-10-30)
- **Quay** (`apps/web/src/booth/clips.ts`): trong lúc chụp, camera được chép liên tục thành khung JPEG nhỏ (cạnh dài 480 px, **12 hình / giây**), giữ 1,5 s gần nhất; bấm chụp thì lấy thêm 1,5 s sau → clip ~3 s (~36 khung, ~0,7–1 MB) gắn với kiểu đó. Không lật gương, cắt vào ô y như ảnh. Chụp lại / chọn ảnh khi chụp dư / chụp bù một ô đều mang clip theo đúng ô.
  - Chọn cách chép khung JPEG thay vì MediaRecorder: tự kiểm soát được từng khung (cắt đúng 1,5 s trước lúc bấm, không phụ thuộc định dạng WebM / MP4 của từng trình duyệt), giải mã lại chỉ cần `createImageBitmap`.
- **Lưu**: `BoothRoll.clips` cùng thứ tự với ảnh, trong IndexedDB cùng cuộn → mở lại cuộn vẫn có ảnh động. Cuộn tải ảnh lên / chụp trong phòng chưa có clip.
- **Cách phát** (`packages/core/booth/live.ts`): mọi ô chạy cùng lúc, **khoảnh khắc bấm máy của các ô trùng nhau**.
  - **Động** (lặp): clip, đến lúc bấm máy thì **giữ ảnh gốc nét 0,5 s** (giống Live Photo), rồi chạy tiếp.
  - **Boomerang**: chạy xuôi rồi ngược, không giữ, nối vòng không giật.
- **Màn kết quả**: thêm hàng **Ảnh · Động · Boomerang** (chỉ hiện khi cuộn có clip). Chọn Động / Boomerang thì bản in **chuyển động ngay trên màn** (giải mã từng khung khi cần, áp filter của cuộn bằng đường lọc video của IG Layout — không giữ cả cuộn trong bộ nhớ). Nút chính thành **Lưu video**, cạnh đó **↓ GIF** (khi đang ở Động / Boomerang, nút Trang trí tạm ẩn — về Ảnh để trang trí). Nút hiện "Đang làm video… n %".
- **Xuất**:
  - **MP4** (H.264, 24 fps, mediabunny): Bản in / Post 4:5 / Story 9:16; Động lặp 3 lần (~10 s), Boomerang 2 vòng (~12 s). Bản in dải 3: ~0,7 MB.
  - **GIF** (`gifenc`, MIT): một vòng, tự lặp, cạnh dài 720 px, ~1 MB.
  - Tên file: `booth_…_loop.mp4`, `…_story_boomerang.mp4`, `…_boomerang.gif`.
- **Chưa làm**: Live Photo (iPhone) / Motion Photo (Android) — cần trang thử trên máy thật; video hậu trường; ảnh động trong phòng chụp chung; "Mở trong IG Layout" với ô là video.
- e2e `booth-live.mjs` (ffprobe): có lựa chọn, bản in chuyển động thật, MP4 600 × 1800 H.264 ~10,5 s, Boomerang Story 1080 × 1920, GIF 720 px > 30 khung, còn sau khi tải lại. `tag-switch.mjs`: dời điểm lấy mẫu màu (tấm vé ở sảnh dài ra sau khi xếp dọc, che điểm cũ). Toàn bộ test booth qua.

## 11. Đã làm: theme sảnh (D-164, 2026-10-30)
Tham khảo trước khi làm: các cảnh Giáng sinh vẽ bằng CSS / SVG trên CodePen (dây đèn nhấp nháy, cây thông, tuyết rơi, cửa sổ đêm tuyết); mẫu onboarding vuốt có **parallax nhiều lớp** (nền chạy chậm hơn nội dung) và chỉ báo trang mà **trang đang xem phải khác hẳn** các trang còn lại (Baymard); WCAG 2.3.1 cho cảnh Glitch (không quá 3 lần loé / giây, loé chỉ ở vùng nhỏ, ưu tiên lệch vị trí thay vì đổi sáng tối).
- **6 cảnh** (`apps/web/src/booth/lobby/scenes.tsx`), vẽ bằng SVG / CSS, không dùng ảnh:
  - **Rạp phim** (cảnh cũ).
  - **Giáng sinh**: đêm xanh, trăng, đồi tuyết có thông nhỏ và căn nhà sáng đèn, dây đèn nhiều màu nhấp nháy chậm phía trên, cây thông có quả châu lấp lánh + ngôi sao, hộp quà, tuyết rơi. Vé có nơ đỏ, bảng hiệu bóng đèn nhiều màu.
  - **Tết**: nền đỏ son hoạ tiết mây vàng mờ, đèn lồng chữ 福 đung đưa, cành mai vàng, cánh mai rơi. Vé là tấm đỏ viền vàng đôi (kiểu bao lì xì), nút chính vàng.
  - **Halloween**: trăng to có mây trôi qua, dơi bay vỗ cánh, ngôi nhà ma trên đồi đèn chập chờn, hàng rào, cây trơ cành, mạng nhện góc + nhện đu dây, bí ngô khắc mặt sáng lập loè, sương trôi. Vé có con dơi ở góc.
  - **Cyberpunk**: mặt trời sọc kiểu synthwave, hai lớp nhà cao tầng có cửa sổ sáng, biển neon "ẢNH", "24H"… thỉnh thoảng chập, sàn lưới neon chạy về phía người xem, mưa xiên. Vé tối viền neon xanh + bóng hồng, góc kiểu HUD; bảng hiệu ống neon.
  - **Glitch**: màn CRT tối, cột số 0 / 1 chạy, chữ lớn "B00TH" tách kênh màu thỉnh thoảng giật, khối màu vỡ hiện chớp nhoáng (mỗi khối một chu kỳ 2,6–5,6 s), scanline, dải sáng quét. Bảng hiệu và vé là cửa sổ kiểu hệ điều hành cũ ("PHOTOBOOTH.EXE", "SHOOT.EXE").
  - (Bỏ chữ "ERROR" ở cảnh Glitch — người dùng có thể tưởng app lỗi.)
- **Vé + bảng hiệu theo cảnh** (`lobby/themes.ts`): màu giấy, chữ, nút chính / phụ, ô nhập mã, viền, bóng, bảng hiệu, dải chữ chạy (câu riêng mỗi cảnh, song ngữ), dòng nhỏ trên bảng hiệu ("Giáng sinh an lành", "Chúc mừng năm mới", "Mở cửa tới nửa đêm", "Neo Sài Gòn · 24/7", "Hệ thống sẵn sàng_").
- **Đổi cảnh**: vuốt ngang ở bất cứ đâu (trừ ô nhập mã) → cảnh đi theo ngón tay, **nền chạy chậm hơn (35 %), vé chạy nhanh hơn chút (6 %)**; thả quá ~22 % bề ngang hoặc vuốt nhanh thì sang cảnh, không thì bật về; vòng tròn (Glitch → Rạp phim). Kéo không tính là chạm (không bấm nhầm nút). Máy tính: phím ← →, nút ‹ › hai bên. Giảm chuyển động: không trượt, không chuyển động trong cảnh.
- **Ô vuông góc trái** (trên nền mờ để cảnh nào cũng thấy rõ): mỗi cảnh một ô hai màu, ô đang xem to hơn, nghiêng, viền trắng; chạm ô để nhảy thẳng; đổi cảnh thì tên cảnh hiện 1,6 s.
- **Nhớ cảnh** (máy này), mở lại vẫn ở cảnh đó; trang xem trước booth trong IG Layout cũng hiện đúng cảnh.
- **Cảnh → theme bản in**: Rạp phim → Cinema, Giáng sinh → Giáng sinh, Tết → Tết, Cyberpunk → Cyberpunk, và **2 theme bản in mới**: **Halloween** (tím đêm, chữ cam, vòm, trăng + sao, đom đóm cam) và **Glitch** (đen, chữ xanh lục "B00TH.EXE", lưới, neon). Cuộn mới bắt đầu trong theme đó, màn chọn khung có không khí theo theme.
- Hiệu năng: chỉ cảnh đang xem chuyển động; hai cảnh kề sẵn sàng (vuốt không giật) nhưng tạm dừng; vuốt chỉ đổi biến CSS, không vẽ lại React.
- e2e `booth-lobby.mjs` mới; `tag-switch.mjs` lấy mẫu ở lề trái (giữa màn trang chủ IG Layout giờ có thẻ Halloween màu tối, làm bài test báo nháy giả). Toàn bộ test booth qua.

## 12. Đã làm: Mở trong IG Layout dạng ảnh hoặc video (2026-10-30)
Chủ dự án: "mở IG layout thì có thể cho chọn là mở sang theo dạng ảnh hay dạng video".
- Bảng "Mở trong IG Layout" có thêm hàng **Ảnh · ▶ Video** (chỉ khi cuộn có clip). Mặc định theo màn kết quả: đang xem Động / Boomerang thì mở sẵn ở Video (và chạy theo đúng kiểu đó), đang xem Ảnh thì ở Ảnh.
- **Video**: bản in là **video bản in chuyển động** (một vòng, IG Layout tự lặp; ảnh tĩnh của bản in làm ảnh bìa), mỗi kiểu là **clip của nó** (đã áp filter, lật như bản in, cạnh dài ≤ 1080, giữ ảnh gốc nét lúc bấm máy). Đều là phần tử video thường của IG Layout → phát, cắt đoạn, xuất MP4 như video người dùng tự nhập.
  - Post / Story: bản in động trên nền giấy theme (dải ảnh trong Post vẫn 2 bản cạnh nhau).
  - Carousel: slide đầu bản in động, các slide sau mỗi slide một clip.
  - Bất ngờ: các clip điền vào bố cục bốc ngẫu nhiên.
- Clip quay ở 480 px nên slide clip trong Carousel kém nét hơn ảnh (trừ lúc dừng ở ảnh gốc). Nếu cần nét hơn thì tăng cỡ clip lúc quay (đổi lấy dung lượng / độ mượt trên điện thoại) — chờ chủ dự án thử trên máy thật.
- e2e `booth-live.mjs` mục 7: mở Carousel dạng video → 2 bản in động + 3 clip là video trong IG Layout.
