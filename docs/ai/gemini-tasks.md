# Việc giao cho Gemini (M20)

Ngày: 2026-10-17. Kế hoạch: [roadmap/m20-plan.md](../roadmap/m20-plan.md). Định dạng: [architecture/asset-catalog.md](../architecture/asset-catalog.md).

Mỗi việc gồm: mục tiêu, phạm vi được sửa, đầu ra, tiêu chí xong, và **prompt** để dán cho Gemini. Mỗi lần giao một việc thì dán **phần chung** (§0) trước, rồi tới prompt của việc đó.

Trạng thái:

| Việc | Nhánh | Trạng thái |
|---|---|---|
| G6 — Câu xem trước phông, chữ mẫu widget | `gemini/g6-text` | Chưa giao |
| G1 — Script xử lý ảnh + trang duyệt | `gemini/g1-process` | Xong (chờ duyệt) |
| G5 — Phông (~150) | `gemini/g5-fonts` | Chưa giao |
| G2 — Sticker đợt 1 (~200) | `gemini/g2-stickers` | Chưa giao (cần G1) |
| G3 — Chất liệu nền + lớp phủ | `gemini/g3-textures` | Xong (chờ duyệt) |
| G4 — Khung từ nguồn ngoài + mép giấy xé | `gemini/g4-frames` | Chưa giao (cần G1) |
| G7 — Nghiên cứu M21 | `gemini/g7-m21-research` | Chưa giao |

---

## 0. Phần chung — dán trước mọi việc

```
Bạn đang làm việc trong repo "IG Layout" (Next.js 16 PWA, miễn phí, phi thương mại: làm layout ảnh cho Instagram, chạy trên điện thoại). Một AI khác (Claude) phụ trách code của app; bạn phụ trách một việc thu thập / xử lý tài sản được giao bên dưới.

Đọc trước khi làm:
1. docs/ai/context.md — bối cảnh và quy tắc chung.
2. docs/architecture/asset-catalog.md — định dạng tài sản BẮT BUỘC theo.
3. docs/roadmap/m20-plan.md — kế hoạch M20 và cách phối hợp.
4. docs/ai/gemini-tasks.md — mục của việc bạn được giao.
5. src/lib/catalog/types.ts, licenses.json, collections.json; scripts/assets/common.mjs, validate.mjs, build-catalog.mjs.

Quy tắc:
- Trao đổi và viết tài liệu bằng tiếng Việt. Code và comment bằng tiếng Anh, theo phong cách code sẵn có.
- Tạo nhánh riêng từ main (tên ghi trong việc). Chỉ sửa file trong PHẠM VI của việc. Không sửa src/ (trừ khi việc cho phép), không sửa e2e/, không đổi package.json trừ khi việc cho phép.
- Không commit thư mục refs/ và assets/**/src/ (file gốc tải về).
- Không nhắc tên app tham khảo nào trong tài liệu.
- Giấy phép (D-106): chỉ dùng CC0, Public Domain, MIT, ISC, Apache-2.0, OFL-1.1, CC-BY, CC-BY-SA, CC-BY-NC, CC-BY-NC-SA, hoặc giấy phép riêng của tác giả có cho dùng miễn phí phi thương mại (ghi "custom" + licenseUrl). App phi thương mại nên NC dùng được.
- CẤM các nguồn có điều khoản không cho đưa nội dung vào app / thư viện, kể cả khi ghi "miễn phí": Pixabay, Unsplash, Pexels, Freepik, Flaticon, Canva, Vecteezy, Shutterstock, Adobe Stock, iStock, Getty, Etsy, Creative Market, DaFont, các gói "free" trên Gumroad / blog cá nhân không ghi giấy phép rõ ràng.
- Kiểm tra giấy phép ở TRANG GỐC của từng mục, không tin nhãn của trang tổng hợp. Mỗi mục phải có source.url trỏ tới trang của chính mục đó.
- Không lấy logo / nhãn hiệu, nhân vật có bản quyền, ảnh có người nhận diện được, ảnh có watermark, nội dung nhạy cảm.
- Trước khi báo xong: chạy `node scripts/assets/validate.mjs` (phải OK) và `node scripts/assets/build-catalog.mjs`. Commit theo từng phần nhỏ, message tiếng Anh rõ ràng. Đẩy nhánh lên origin, KHÔNG merge vào main, KHÔNG push lên main.
- Khi xong: cập nhật bảng trạng thái ở docs/ai/gemini-tasks.md (cột Trạng thái của việc mình) và viết báo cáo ngắn bằng tiếng Việt: đã làm gì, bao nhiêu mục, nguồn nào, điều gì chưa chắc chắn (giấy phép, chất lượng) cần chủ dự án xem.
- Gặp chỗ định dạng không đủ hoặc mâu thuẫn: KHÔNG tự đổi định dạng; ghi lại trong báo cáo để Claude sửa.
```

---

## G6 — Câu xem trước phông, chữ mẫu widget

- **Mục tiêu:** dữ liệu chữ cho màn chọn phông mới (C5) và widget.
- **Phạm vi:** chỉ tạo `assets/text/preview-sentences.json` và `assets/text/widget-samples.json`.
- **Đầu ra:**
  - `preview-sentences.json`: `{ "vi": [...], "en": [...], "ja": [...], "ko": [...], "zh": [...] }`
    - `vi`, `en` mỗi thứ tiếng ≥ 120 câu; `ja`, `ko`, `zh` ≥ 30 câu.
    - Câu ngắn (≤ 40 ký tự), hay, có ý nghĩa, tích cực, hợp đăng Instagram: kỷ niệm, du lịch, tình yêu, gia đình, mùa, cà phê, động lực…
    - Không trích nguyên văn lời bài hát / sách có bản quyền. Không chính trị, tôn giáo, nhạy cảm.
    - Câu tiếng Việt phải dùng nhiều dấu (ă â đ ê ô ơ ư, đủ thanh) để thử phông có đủ dấu không.
  - `widget-samples.json`: chữ mẫu VI / EN cho các widget hiện có (Nhãn, Tin nhắn, Địa điểm, Tô sáng, Đồng hồ) và đề xuất ≥ 20 kiểu widget mới. Mỗi kiểu có `id`, tên EN / VI, mô tả, các trường chữ, chữ mẫu.
- **Xong khi:** đủ số lượng, JSON hợp lệ, không trùng câu.

**Prompt:**
```
Việc G6 — Câu xem trước phông và chữ mẫu widget. Nhánh: gemini/g6-text.

Đọc mục "G6" trong docs/ai/gemini-tasks.md và làm đúng đầu ra ghi ở đó:
1. assets/text/preview-sentences.json — vi ≥ 120, en ≥ 120, ja/ko/zh ≥ 30 câu; câu ≤ 40 ký tự; hay, có ý nghĩa, hợp Instagram; tiếng Việt dùng nhiều dấu để thử phông; không trích lời bài hát / sách có bản quyền; không chủ đề nhạy cảm. Câu tiếng Nhật / Hàn / Trung phải tự nhiên (như người bản xứ viết), không dịch máy cứng.
2. assets/text/widget-samples.json — chữ mẫu VI/EN cho 5 widget hiện có (label, message, location, highlight, clock — xem src/lib/elements/create.ts) và đề xuất ≥ 20 kiểu widget mới đa dạng (ví dụ thời tiết, lịch, đếm ngược, bài hát đang nghe, đánh giá sao, bình chọn, đoạn chat hai người, thông báo điện thoại, câu hỏi, giá / khuyến mãi, hashtag, @nhắc tên, thanh tiến trình, vé máy bay, công thức món ăn…). Mỗi kiểu: id (camelCase), name {en, vi}, description (tiếng Việt), fields (tên các trường chữ), samples {en: {...}, vi: {...}}.
Không sửa file nào khác ngoài 2 file trên và bảng trạng thái trong docs/ai/gemini-tasks.md.
```

---

## G1 — Script xử lý ảnh + trang duyệt

- **Mục tiêu:** biến file gốc thành file đúng chuẩn `public/packs/` (asset-catalog §5, §6).
- **Phạm vi:**
  - `scripts/assets/process.mjs`, `scripts/assets/review.mjs`, các file phụ trong `scripts/assets/lib/`;
  - thêm devDependency nếu cần (ghi rõ lý do; ưu tiên `sharp` đã có);
  - một gói mẫu nhỏ để thử: `assets/sticker/sample-test/` — 3 – 5 mục CC0 thật; xoá trước khi báo xong, hoặc giữ nếu tốt và đổi tên gói cho đúng nội dung.
- **Yêu cầu `process.mjs <kind>/<pack> [--only <id>] [--force]`:**
  - Đọc `assets/<kind>/<pack>/manifest.json` và file gốc `assets/<kind>/<pack>/src/<id>.<jpg|png|webp|svg|tif>`.
  - **Sticker:**
    - Tách nền khi ảnh gốc không có alpha. Dùng mô hình chạy trên máy, không gọi dịch vụ online. Gợi ý `@imgly/background-removal-node` (kiểm tra giấy phép), hoặc `rembg` qua Python nếu có sẵn; ghi rõ trong README.
    - Cho phép tắt tách nền / cắt sát theo từng mục bằng trường `process: { removeBg?: false, trim?: false }` trong manifest (đã có trong định dạng).
    - Cắt sát theo alpha, chừa lề 3 %.
    - Làm sạch mép: bỏ quầng màu, alpha thấp → 0.
  - **Frame:**
    - Dò các vùng trong suốt kín bên trong khung → ghi vào `windows`.
    - Nếu gốc là ảnh khung có vùng giữa đặc (ví dụ ảnh khung tranh có tranh bên trong): cho phép khai báo `windows` sẵn trong manifest rồi **đục** vùng đó thành trong suốt.
  - **Texture:** đổi cỡ; nếu `tile: true` thì kiểm tra mép trái / phải, trên / dưới gần khớp (báo cảnh báo nếu lệch nhiều).
  - **Overlay:** đổi cỡ, giữ nguyên.
  - Mọi loại: WebP đúng giới hạn cạnh và dung lượng (tự hạ chất lượng tới khi vừa), ảnh thu nhỏ 192 px, điền `width` / `height` vào manifest (giữ nguyên thứ tự trường và định dạng JSON 2 dấu cách).
  - Bỏ qua mục đã có file đầu ra mới hơn file gốc (trừ khi `--force`).
- **Yêu cầu `review.mjs <kind>/<pack>`:**
  - Sinh `assets/<kind>/<pack>/review.html` (không commit, thêm vào .gitignore).
  - Lưới mọi mục trên ba nền: sáng, tối, ca rô.
  - Mỗi mục hiện tên VI, giấy phép, link nguồn; khung thì vẽ khung đỏ quanh `windows` đã dò.
- **Xong khi:** gói mẫu chạy qua `process` → `validate` OK → `build-catalog`; có `scripts/assets/README.md` hướng dẫn chạy.

**Prompt:**
```
Việc G1 — Script xử lý ảnh và trang duyệt tài sản. Nhánh: gemini/g1-process.

Đọc mục "G1" trong docs/ai/gemini-tasks.md và docs/architecture/asset-catalog.md (§2, §5, §6), rồi viết:
1. scripts/assets/process.mjs <kind>/<pack> [--only <id>] [--force]: đọc manifest + file gốc ở assets/<kind>/<pack>/src/, xuất WebP + ảnh thu nhỏ vào public/packs/<kind>/<pack>/ theo đúng giới hạn (§5), điền width/height (và windows cho khung) vào manifest. Sticker: tách nền bằng mô hình chạy trên máy (không gọi dịch vụ online), cắt sát chừa lề 3 %, làm sạch mép. Frame: dò cửa sổ trong suốt; hỗ trợ khai báo windows sẵn để đục lỗ. Texture: kiểm tra lát lặp. Tự hạ chất lượng WebP cho vừa dung lượng.
2. scripts/assets/review.mjs <kind>/<pack>: sinh review.html (thêm vào .gitignore) xem cả gói trên nền sáng / tối / ca rô, kèm tên, giấy phép, link nguồn, khung đỏ quanh cửa sổ khung.
3. scripts/assets/README.md: cách cài và chạy.
4. Thử với một gói mẫu 3 – 5 sticker CC0 thật (ví dụ tem / bưu thiếp cổ từ Smithsonian Open Access hoặc The Met Open Access) để chứng minh chạy hết chuỗi process → validate → build-catalog.
Dùng sharp (đã có trong devDependencies). Nếu thêm thư viện mới thì kiểm tra giấy phép và ghi lý do trong báo cáo. Node 20 (không chạy TypeScript trực tiếp). Phạm vi: scripts/assets/**, assets/sticker/<gói mẫu>/, public/packs/** của gói mẫu, .gitignore, package.json (chỉ devDependencies).
```

---

## G5 — Phông (~150)

- **Mục tiêu:** khoảng 150 phông mới, phong phú về kiểu và ngôn ngữ, tải được khi offline.
- **Phạm vi:**
  - `scripts/assets/fonts.mjs` (script tải phông);
  - `assets/font/<pack>/manifest.json`;
  - `public/packs/font/**`.
- **Nguồn:**
  - **Google Fonts** — tải WOFF2 qua gói Fontsource trên npm / CDN jsDelivr, đã chia sẵn theo bảng chữ kèm `unicode-range`;
  - phông có giấy phép riêng cho dùng phi thương mại (`custom` + `licenseUrl`), **chỉ khi** trang chính thức của tác giả ghi rõ;
  - **không** DaFont và các trang tổng hợp.
- **Chia gói:**
  - `handwriting` — viết tay;
  - `calligraphy` — thư pháp, script;
  - `vietnamese-display` — trang trí có đủ dấu tiếng Việt;
  - `japanese`, `korean`, `chinese`;
  - `fantasy` — cổ điển / kỳ ảo, thay cho kiểu "Harry Potter";
  - `playful` — khối tròn, đồ chơi, thay cho kiểu "Lego";
  - `festive` — lễ hội / Tết / Noel;
  - `retro-pixel`;
  - `brush-grunge`.
- **Không trùng** với 78 phông đang có trong `src/lib/text/fonts.ts`.
- Mỗi phông lấy **tối đa 3 độ đậm**: 400 và một hai độ đậm hay dùng. Chỉ lấy kiểu thường, không lấy nghiêng.
- Với tiếng Nhật / Hàn / Trung: lấy đủ các phần chia nhỏ của Fontsource (mỗi phần một `files[]` kèm `unicodeRange`). Tổng dung lượng mỗi phông CJK nên dưới 8 MB.
- `languages`: chỉ ghi `vietnamese` khi phông có subset `vietnamese` **và** hiển thị đúng chữ có dấu.
- **Xong khi:** ≥ 150 phông, `validate.mjs` OK, có bảng tóm tắt trong báo cáo (gói, số phông, ví dụ).

**Prompt:**
```
Việc G5 — Thêm khoảng 150 phông chữ. Nhánh: gemini/g5-fonts.

Đọc mục "G5" trong docs/ai/gemini-tasks.md và docs/architecture/asset-catalog.md (§3 phần Phông).
1. Viết scripts/assets/fonts.mjs: từ một danh sách phông (khai báo trong chính manifest hoặc một file danh sách trong scripts/assets/), tải WOFF2 từ Fontsource (npm @fontsource/<tên> hoặc cdn.jsdelivr.net/fontsource), mỗi phông tối đa 3 độ đậm, kiểu thường, đủ các subset cần thiết, lưu vào public/packs/font/<pack>/<id>/ và điền files[] (weight, subset, file, unicodeRange) vào assets/font/<pack>/manifest.json.
2. Chọn khoảng 150 phông KHÔNG trùng với src/lib/text/fonts.ts, chia gói: handwriting, calligraphy, vietnamese-display, japanese, korean, chinese, fantasy (phong cách cổ điển / phù thuỷ kiểu "Harry Potter" nhưng là phông OFL), playful (khối tròn kiểu đồ chơi / "Lego" nhưng là phông OFL), festive (lễ hội / Tết / Noel), retro-pixel, brush-grunge. Ưu tiên phông có subset vietnamese.
3. Mỗi phông: id kebab-case, family, label, styles, languages (chỉ ghi vietnamese khi thật sự đủ dấu), weights, files, source (provider "Google Fonts", url trang phông trên fonts.google.com, author = foundry/designer, license OFL-1.1 hoặc Apache-2.0, retrieved), collections phù hợp (tet, christmas, japan, vintage, cute, handDrawn…).
4. Chạy validate.mjs và build-catalog.mjs. Báo cáo bảng: gói → số phông → vài tên ví dụ → tổng dung lượng.
Phạm vi: scripts/assets/fonts.mjs (+ file danh sách nếu cần), assets/font/**, public/packs/font/**, public/packs/catalog.json.
```

---

## G2 — Sticker đợt 1 (~200)

- **Mục tiêu:** khoảng 200 sticker chất lượng cao, chia 10 – 14 gói, nhiều phong cách.
- **Phạm vi:**
  - `assets/sticker/<pack>/manifest.json`;
  - `assets/sticker/<pack>/src/` (không commit);
  - `public/packs/sticker/**`;
  - `public/packs/catalog.json`.
- **Gói gợi ý** (có thể điều chỉnh, ghi lý do):
  - Tem & dấu bưu chính cổ — Smithsonian National Postal Museum, The Met;
  - Vé, nhãn, bao bì cổ;
  - Bưu thiếp & thư cổ;
  - Hoa lá vẽ cổ (botanical) — Biodiversity Heritage Library, Rijksmuseum, The Met;
  - Bướm & côn trùng vẽ cổ;
  - Chim & động vật vẽ cổ;
  - Bản đồ & la bàn cổ;
  - Doodle vẽ tay — Open Doodles, Open Peeps (CC0);
  - Đồ vật đời thường (cà phê, máy ảnh, sách…) — CC0 / CC-BY;
  - Nhật Bản (tranh khắc gỗ ukiyo-e: sóng, hoa anh đào, cá chép — The Met / Rijksmuseum PD);
  - Việt Nam (tranh Đông Hồ, áo dài, nón lá… **chỉ khi có nguồn PD / CC rõ ràng**);
  - Lễ hội (Noel, Tết, Trung thu…) từ tranh / thiệp cổ PD.
- **Chất lượng:**
  - nền tách sạch, vật trọn vẹn, không bị cắt mất;
  - ảnh gốc cạnh ngắn ≥ 800 px;
  - trong một gói cùng một phong cách;
  - không trùng nhau;
  - không có chữ to bằng thứ tiếng lạ, trừ khi đó là đặc điểm (ví dụ tem).
- Mỗi mục: tên VI tự nhiên (không dịch máy cứng), tags EN / VI mỗi thứ tiếng ≥ 3.
- **Xong khi:** ≥ 200 mục, `validate.mjs` OK, đã xem `review.html` từng gói và bỏ mục xấu; báo cáo liệt kê gói, số mục, nguồn, các mục giấy phép NC / custom.

**Prompt:**
```
Việc G2 — Sticker đợt 1, khoảng 200 mục. Nhánh: gemini/g2-stickers (tạo từ main sau khi G1 đã merge; nếu G1 chưa merge thì tạo từ nhánh gemini/g1-process).

Đọc mục "G2" trong docs/ai/gemini-tasks.md và docs/architecture/asset-catalog.md.
1. Tìm sticker từ các nguồn CC0 / Public Domain / CC-BY / CC-BY-NC hợp lệ (ưu tiên: Smithsonian Open Access, The Met Open Access, Rijksmuseum, NYPL Digital Collections (chỉ mục "public domain"), Biodiversity Heritage Library, Wikimedia Commons (kiểm tra từng file), Openverse lọc cc0/pdm rồi kiểm tra ở trang gốc, Open Doodles, Open Peeps, Kenney). Dùng API chính thức của các nguồn nếu có.
2. Chia 10 – 14 gói theo gợi ý (tem, vé / nhãn, bưu thiếp, hoa lá, bướm, chim / động vật, bản đồ, doodle, đồ vật, Nhật Bản, Việt Nam nếu có nguồn rõ ràng, lễ hội). Mỗi gói một phong cách thống nhất, gắn collections phù hợp.
3. Tải gốc vào assets/sticker/<pack>/src/, viết manifest (tên VI tự nhiên, tags EN/VI ≥ 3 mỗi thứ tiếng, source đầy đủ), chạy process.mjs, mở review.html để xem và LOẠI mục xấu (tách nền lỗi, mờ, bị cắt, trùng), chạy validate.mjs (OK) và build-catalog.mjs.
4. Báo cáo: bảng gói → số mục → nguồn chính → giấy phép; liệt kê riêng các mục NC / custom và mục còn nghi ngờ.
Phạm vi: assets/sticker/**, public/packs/sticker/**, public/packs/catalog.json.
```

---

## G3 — Chất liệu nền (~40) + lớp phủ (~20)

- **Phạm vi:**
  - `assets/texture/**`, `assets/overlay/**`;
  - `public/packs/texture/**`, `public/packs/overlay/**`;
  - `public/packs/catalog.json`.
- **Chất liệu nền:**
  - Nguồn ambientCG, Poly Haven (CC0): chỉ lấy ảnh màu (albedo / diffuse), không lấy normal map.
  - Nhóm: giấy (trắng, ngà, kraft, cũ, nhăn, giấy dó / giấy bản nếu có), bìa carton, vải (lanh, bố, nỉ, len, jean), gỗ, đá / bê tông / cẩm thạch, kim loại nhẹ, lá / cỏ, cát / nước nhìn từ trên.
  - Phần lớn phải `tile: true` (lát lặp liền mép).
- **Lớp phủ:**
  - vệt sáng, rò sáng phim, bụi / xước phim, hạt phim, bokeh, giấy nhăn (multiply), nếp gấp, vết cà phê, tia nắng, lăng kính…
  - Nguồn CC0 / CC-BY / NC hợp lệ (Wikimedia, Openverse, OpenGameArt…).
  - Ghi `blend` phù hợp. Nền đen dùng `screen`, nền trắng dùng `multiply`.
- **Xong khi:** ≥ 40 chất liệu, ≥ 20 lớp phủ, `validate.mjs` OK.

**Prompt:**
```
Việc G3 — Chất liệu nền và lớp phủ. Nhánh: gemini/g3-textures (từ main sau khi G1 merge, hoặc từ gemini/g1-process).

Đọc mục "G3" trong docs/ai/gemini-tasks.md và docs/architecture/asset-catalog.md.
1. ≥ 40 chất liệu nền từ ambientCG và Poly Haven (CC0), chỉ ảnh màu (albedo/diffuse), chia gói: paper, fabric, wood, stone, nature (cỏ / lá / cát / nước nhìn từ trên), misc. Đặt tile: true cho ảnh lát lặp liền mép (kiểm tra bằng cảnh báo của process.mjs).
2. ≥ 20 lớp phủ (vệt sáng, rò sáng, bụi / xước phim, hạt phim, bokeh, giấy nhăn, nếp gấp, vết cà phê, tia nắng, lăng kính) từ nguồn CC0 / CC-BY / NC hợp lệ, có blend phù hợp (nền đen → screen, nền trắng → multiply).
3. process.mjs → review.html (loại mục xấu) → validate.mjs OK → build-catalog.mjs. Báo cáo như các việc khác.
Phạm vi: assets/texture/**, assets/overlay/**, public/packs/texture/**, public/packs/overlay/**, public/packs/catalog.json.
```

---

## G4 — Khung từ nguồn ngoài (~40) + mép giấy xé thật

- **Mục tiêu:**
  - (a) khoảng 40 ảnh khung thật có cửa sổ;
  - (b) bộ ảnh **mép giấy xé thật** để bộ sinh khung của Claude (C7, D-107) dùng làm "cọ".
- **Phạm vi:**
  - `assets/frame/**`, `public/packs/frame/**`, `public/packs/catalog.json`;
  - `assets/_sources/torn-edges/` (manifest cùng định dạng; ảnh đã xử lý để trong `assets/_sources/torn-edges/files/`, PNG có alpha, được commit, mỗi file ≤ 500 KB).
- **(a) Khung:**
  - khung tranh cổ mạ vàng / gỗ chạm — The Met, Rijksmuseum, Smithsonian có ảnh khung tranh PD;
  - khung gương, khung ảnh cổ (cabinet card, carte de visite, ảnh có viền răng cưa);
  - bưu thiếp có ô;
  - khung hoa văn trang trí từ sách cổ PD;
  - thiệp / nhãn cổ có ô trống.
  - Vùng ảnh / tranh bên trong phải **đục trong suốt**: khai báo `windows` để `process.mjs` đục.
  - Mỗi khung 1 – 4 cửa sổ.
- **(b) Mép giấy xé:**
  - ≥ 30 ảnh mép xé thật (giấy trắng, kraft, giấy báo, bìa…), đủ dài (≥ 1500 px theo chiều mép);
  - thấy rõ lõi giấy trắng có xơ;
  - nền tách sạch;
  - giấy phép hợp lệ — nếu không đủ nguồn hợp lệ thì **báo lại số lượng thật**, không lấy bừa.
- **Xong khi:** (a) ≥ 40 khung, `windows` đúng (xem trong `review.html`), `validate` OK; (b) có manifest + file, báo cáo số lượng.

**Prompt:**
```
Việc G4 — Khung ảnh từ nguồn ngoài và mép giấy xé thật. Nhánh: gemini/g4-frames (từ main sau khi G1 merge, hoặc từ gemini/g1-process).

Đọc mục "G4" trong docs/ai/gemini-tasks.md, docs/architecture/asset-catalog.md, và §12 của docs/discussions/2026-10-17-m20-mo-rong-thu-vien.md (yêu cầu "tự nhiên" của khung giấy xé).
(a) ≥ 40 khung (kind "frame"): khung tranh cổ (mạ vàng, gỗ chạm), khung gương, ảnh cổ có viền (cabinet card, carte de visite, viền răng cưa), bưu thiếp có ô, khung hoa văn từ sách cổ, thiệp / nhãn có ô trống — nguồn PD / CC0 / CC hợp lệ (The Met, Rijksmuseum, Smithsonian, NYPL public domain, BHL, Wikimedia). Khai báo windows (toạ độ 0–1) cho vùng ảnh / tranh bên trong để process.mjs đục trong suốt; kiểm tra bằng review.html. Chia gói: gilded-frames, wooden-frames, vintage-photo-mounts, postcards, ornaments, labels-cards.
(b) Mép giấy xé thật: ≥ 30 ảnh (giấy trắng, kraft, giấy báo, bìa…), mép dài ≥ 1500 px, thấy rõ lõi trắng có xơ, tách nền sạch, PNG alpha ≤ 500 KB mỗi file, lưu ở assets/_sources/torn-edges/files/ kèm assets/_sources/torn-edges/manifest.json (cùng định dạng mục, kind "sticker"). Nếu không đủ nguồn có giấy phép hợp lệ, báo đúng số lượng tìm được — không lấy nguồn bị cấm.
Chạy validate.mjs (OK) và build-catalog.mjs. Báo cáo như các việc khác.
Phạm vi: assets/frame/**, assets/_sources/torn-edges/**, public/packs/frame/**, public/packs/catalog.json.
```

---

## G7 — Nghiên cứu cho M21

- **Mục tiêu:** tài liệu đầu vào để bàn M21 (công cụ sáng tạo, D-105). **Chưa code vào app.**
- **Phạm vi:** `docs/discussions/<ngày>-m21-nghien-cuu.md`, và tuỳ chọn `assets/research/m21/filters.json`.
- **Nội dung:**
  1. **Filter:** ≥ 12 nhóm (phim, retro, điện ảnh, chân dung, ẩm thực, phong cảnh, đen trắng, pastel, vintage, neon, mùa, Hàn / Nhật…), mỗi nhóm 8 – 12 filter.
     - Mỗi filter có thông số theo **đúng các thông số app đang có**, xem `src/lib/color/params.ts` và `filters.ts`.
     - Nếu cần thông số mới (đường cong tone, cân bằng màu vùng tối / sáng, hạt, LUT) thì liệt kê riêng.
     - Có thể dùng LUT nguồn mở (ghi giấy phép).
  2. **Hiệu ứng tĩnh** cho ảnh / chữ / mọi phần tử: gương, kính vạn hoa, xoáy, phình / co, gợn nước, sóng, lửa, khói, chảy màu, loang màu / màu nước, mực loang, glitch, điểm ảnh, halftone, duotone, phát sáng neon, tách màu RGB, đổ bóng dài, chữ 3D…
     - Mỗi hiệu ứng: cách làm (shader WebGL / canvas 2D / SVG filter), thông số người dùng chỉnh, độ nặng trên điện thoại (nhẹ / vừa / nặng), thư viện / bài tham khảo kèm giấy phép (ví dụ glfx.js MIT).
  3. **Bút vẽ / viết tay:**
     - các loại bút (bút chì, bút dạ, highlighter, sáp màu, phấn, neon, phun sơn, thư pháp, cọ màu nước);
     - lực nhấn Apple Pencil (Pointer Events), làm mượt nét (`perfect-freehand` MIT…), tẩy, thước / hình tự nhận dạng.
  4. **Tham khảo app khác:** chỉ mô tả chức năng / cách tổ chức, không nêu tên app tham khảo chính của dự án.
- **Xong khi:** tài liệu đủ 4 phần, có bảng tóm tắt độ nặng và đề xuất thứ tự làm.

**Prompt:**
```
Việc G7 — Nghiên cứu đầu vào cho M21 (filter, hiệu ứng tĩnh, bút vẽ). Nhánh: gemini/g7-m21-research. KHÔNG code vào app.

Đọc mục "G7" trong docs/ai/gemini-tasks.md, D-105 trong docs/discussions/decisions.md, src/lib/color/params.ts, src/lib/color/filters.ts, src/lib/color/processor.ts (để biết filter hiện có và các thông số đang hỗ trợ).
Viết docs/discussions/<YYYY-MM-DD>-m21-nghien-cuu.md bằng tiếng Việt gồm 4 phần như mô tả ở G7: (1) ≥ 12 nhóm filter × 8–12 filter với thông số theo params.ts (thông số mới liệt kê riêng; LUT nguồn mở ghi giấy phép) — có thể xuất kèm assets/research/m21/filters.json; (2) danh sách hiệu ứng tĩnh với cách làm, thông số, độ nặng trên điện thoại, tham khảo + giấy phép; (3) bút vẽ / viết tay; (4) tham khảo cách các app chỉnh ảnh / collage khác tổ chức các công cụ này. Kết thúc bằng bảng tóm tắt và đề xuất thứ tự làm.
Phạm vi: docs/discussions/<ngày>-m21-nghien-cuu.md, assets/research/m21/**, bảng trạng thái trong docs/ai/gemini-tasks.md.
```

---

## Cách Claude nhận việc từ Gemini

1. Chủ dự án báo nhánh đã xong.
2. Claude kéo nhánh về, đọc báo cáo, chạy `validate.mjs` và `build-catalog.mjs`, xem thử trong app, chạy e2e.
3. Nếu ổn thì merge vào `main`. Nếu chưa ổn thì ghi việc cần sửa vào mục của việc đó (dưới đây), rồi chủ dự án chuyển lại cho Gemini.

### Ghi chú nhận việc

(trống)
