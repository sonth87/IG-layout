# Việc giao cho Gemini (M20)

Ngày: 2026-10-17. Kế hoạch: [roadmap/m20-plan.md](../roadmap/m20-plan.md). Định dạng: [architecture/asset-catalog.md](../architecture/asset-catalog.md).

Mỗi việc gồm: mục tiêu, phạm vi được sửa, đầu ra, tiêu chí xong, và **prompt** để dán cho Gemini. Mỗi lần giao một việc thì dán **phần chung** (§0) trước, rồi tới prompt của việc đó.

Trạng thái:

| Việc | Nhánh | Trạng thái |
|---|---|---|
| G6 — Câu xem trước phông, chữ mẫu widget | `gemini/g6-text` | **Đã duyệt, đã merge** (2026-10-18) |
| G1 — Script xử lý ảnh + trang duyệt | `gemini/g1-process` | **Đã duyệt, đã merge** (2026-10-18) |
| G5 — Phông (~150) | `gemini/g5-fonts` | **Đã duyệt, đã merge** — 195 phông (2026-10-18) |
| G2 — Sticker đợt 1 (~200) | `gemini/g2-stickers` | **Claude đã tự sửa và merge** — còn 141 / 212 (2026-10-18) |
| G3 — Chất liệu nền + lớp phủ | `gemini/g3-textures` | **Đã merge sau khi lọc** — 42 / 46 chất liệu, 4 / 22 lớp phủ (2026-10-18) |
| G4 — Khung từ nguồn ngoài + mép giấy xé | `gemini/g4-frames` | Xong (chờ duyệt) |
| G7 — Nghiên cứu M21 | `gemini/g7-m21-research` | **Đã duyệt, đã merge** (2026-10-18) |
| G8 — Lớp phủ (làm lại, ~30) | `gemini/g8-overlays` | **Đã trên main** (merge theo yêu cầu chủ dự án); Claude duyệt sau: đạt, bỏ 1 mục — 52 lớp phủ (2026-10-19) |
| G10 — Mở rộng thư viện đợt 4 (theo góp ý 19/10) | `gemini/g10-library` | Chưa giao |
| G9 — Sticker lễ hội & Việt Nam (~80) | `gemini/g9-festive` | **Đã trên main** (merge theo yêu cầu chủ dự án); Claude duyệt sau: đạt — 83 sticker (2026-10-19) |

---

> **Ghi chú (2026-10-19):** G8 / G9 được merge vào `main` **theo yêu cầu của chủ dự án**. Mặc định Gemini chỉ đẩy nhánh `gemini/<việc>`; chỉ merge vào `main` khi chủ dự án bảo. Khi merge, lời commit ghi đúng ai đã duyệt (không ghi "after review" nếu chưa được duyệt), và chạy `validate.mjs` + `build-catalog.mjs` + e2e trước khi push.

## 0. Phần chung — dán trước mọi việc

```
Bạn đang làm việc trong repo "IG Layout" (Next.js 16 PWA, miễn phí, phi thương mại: làm layout ảnh cho Instagram, chạy trên điện thoại). Một AI khác (Claude) phụ trách code của app; bạn phụ trách một việc thu thập / xử lý tài sản được giao bên dưới.

Đọc trước khi làm:
1. docs/ai/context.md — bối cảnh và quy tắc chung.
2. docs/architecture/asset-catalog.md — định dạng tài sản BẮT BUỘC theo.
3. docs/roadmap/m20-plan.md — kế hoạch M20 và cách phối hợp.
4. docs/ai/gemini-tasks.md — mục của việc bạn được giao.
5. packages/core/catalog/types.ts, licenses.json, collections.json; apps/web/scripts/assets/common.mjs, validate.mjs, build-catalog.mjs.

Quy tắc:
- Trao đổi và viết tài liệu bằng tiếng Việt. Code và comment bằng tiếng Anh, theo phong cách code sẵn có.
- Tạo nhánh riêng từ main (tên ghi trong việc). Chỉ sửa file trong PHẠM VI của việc. Không sửa src/ (trừ khi việc cho phép), không sửa apps/web/e2e/, không đổi package.json trừ khi việc cho phép.
- Không commit thư mục refs/ và assets/**/src/ (file gốc tải về).
- Không nhắc tên app tham khảo nào trong tài liệu.
- Giấy phép (D-106): chỉ dùng CC0, Public Domain, MIT, ISC, Apache-2.0, OFL-1.1, CC-BY, CC-BY-SA, CC-BY-NC, CC-BY-NC-SA, hoặc giấy phép riêng của tác giả có cho dùng miễn phí phi thương mại (ghi "custom" + licenseUrl). App phi thương mại nên NC dùng được.
- CẤM các nguồn có điều khoản không cho đưa nội dung vào app / thư viện, kể cả khi ghi "miễn phí": Pixabay, Unsplash, Pexels, Freepik, Flaticon, Canva, Vecteezy, Shutterstock, Adobe Stock, iStock, Getty, Etsy, Creative Market, DaFont, các gói "free" trên Gumroad / blog cá nhân không ghi giấy phép rõ ràng.
- Kiểm tra giấy phép ở TRANG GỐC của từng mục, không tin nhãn của trang tổng hợp. Mỗi mục phải có source.url trỏ tới trang của chính mục đó.
- Không lấy logo / nhãn hiệu, nhân vật có bản quyền, ảnh có người nhận diện được, ảnh có watermark, nội dung nhạy cảm.
- Trước khi báo xong: chạy `node apps/web/scripts/assets/validate.mjs` (phải OK) và `node apps/web/scripts/assets/build-catalog.mjs`. Commit theo từng phần nhỏ, message tiếng Anh rõ ràng. Đẩy nhánh lên origin, KHÔNG merge / push vào main trừ khi chủ dự án bảo. Làm trong `git worktree` riêng (không phải thư mục chính của repo).
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
2. assets/text/widget-samples.json — chữ mẫu VI/EN cho 5 widget hiện có (label, message, location, highlight, clock — xem packages/core/elements/create.ts) và đề xuất ≥ 20 kiểu widget mới đa dạng (ví dụ thời tiết, lịch, đếm ngược, bài hát đang nghe, đánh giá sao, bình chọn, đoạn chat hai người, thông báo điện thoại, câu hỏi, giá / khuyến mãi, hashtag, @nhắc tên, thanh tiến trình, vé máy bay, công thức món ăn…). Mỗi kiểu: id (camelCase), name {en, vi}, description (tiếng Việt), fields (tên các trường chữ), samples {en: {...}, vi: {...}}.
Không sửa file nào khác ngoài 2 file trên và bảng trạng thái trong docs/ai/gemini-tasks.md.
```

---

## G1 — Script xử lý ảnh + trang duyệt

- **Mục tiêu:** biến file gốc thành file đúng chuẩn `apps/web/public/packs/` (asset-catalog §5, §6).
- **Phạm vi:**
  - `apps/web/scripts/assets/process.mjs`, `apps/web/scripts/assets/review.mjs`, các file phụ trong `apps/web/scripts/assets/lib/`;
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
- **Xong khi:** gói mẫu chạy qua `process` → `validate` OK → `build-catalog`; có `apps/web/scripts/assets/README.md` hướng dẫn chạy.

**Prompt:**
```
Việc G1 — Script xử lý ảnh và trang duyệt tài sản. Nhánh: gemini/g1-process.

Đọc mục "G1" trong docs/ai/gemini-tasks.md và docs/architecture/asset-catalog.md (§2, §5, §6), rồi viết:
1. apps/web/scripts/assets/process.mjs <kind>/<pack> [--only <id>] [--force]: đọc manifest + file gốc ở assets/<kind>/<pack>/src/, xuất WebP + ảnh thu nhỏ vào apps/web/public/packs/<kind>/<pack>/ theo đúng giới hạn (§5), điền width/height (và windows cho khung) vào manifest. Sticker: tách nền bằng mô hình chạy trên máy (không gọi dịch vụ online), cắt sát chừa lề 3 %, làm sạch mép. Frame: dò cửa sổ trong suốt; hỗ trợ khai báo windows sẵn để đục lỗ. Texture: kiểm tra lát lặp. Tự hạ chất lượng WebP cho vừa dung lượng.
2. apps/web/scripts/assets/review.mjs <kind>/<pack>: sinh review.html (thêm vào .gitignore) xem cả gói trên nền sáng / tối / ca rô, kèm tên, giấy phép, link nguồn, khung đỏ quanh cửa sổ khung.
3. apps/web/scripts/assets/README.md: cách cài và chạy.
4. Thử với một gói mẫu 3 – 5 sticker CC0 thật (ví dụ tem / bưu thiếp cổ từ Smithsonian Open Access hoặc The Met Open Access) để chứng minh chạy hết chuỗi process → validate → build-catalog.
Dùng sharp (đã có trong devDependencies). Nếu thêm thư viện mới thì kiểm tra giấy phép và ghi lý do trong báo cáo. Node 20 (không chạy TypeScript trực tiếp). Phạm vi: apps/web/scripts/assets/**, assets/sticker/<gói mẫu>/, apps/web/public/packs/** của gói mẫu, .gitignore, package.json (chỉ devDependencies).
```

---

## G5 — Phông (~150)

- **Mục tiêu:** khoảng 150 phông mới, phong phú về kiểu và ngôn ngữ, tải được khi offline.
- **Phạm vi:**
  - `apps/web/scripts/assets/fonts.mjs` (script tải phông);
  - `assets/font/<pack>/manifest.json`;
  - `apps/web/public/packs/font/**`.
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
- **Không trùng** với 78 phông đang có trong `packages/core/text/fonts.ts`.
- Mỗi phông lấy **tối đa 3 độ đậm**: 400 và một hai độ đậm hay dùng. Chỉ lấy kiểu thường, không lấy nghiêng.
- Với tiếng Nhật / Hàn / Trung: lấy đủ các phần chia nhỏ của Fontsource (mỗi phần một `files[]` kèm `unicodeRange`). Tổng dung lượng mỗi phông CJK nên dưới 8 MB.
- `languages`: chỉ ghi `vietnamese` khi phông có subset `vietnamese` **và** hiển thị đúng chữ có dấu.
- **Xong khi:** ≥ 150 phông, `validate.mjs` OK, có bảng tóm tắt trong báo cáo (gói, số phông, ví dụ).

**Prompt:**
```
Việc G5 — Thêm khoảng 150 phông chữ. Nhánh: gemini/g5-fonts.

Đọc mục "G5" trong docs/ai/gemini-tasks.md và docs/architecture/asset-catalog.md (§3 phần Phông).
1. Viết apps/web/scripts/assets/fonts.mjs: từ một danh sách phông (khai báo trong chính manifest hoặc một file danh sách trong apps/web/scripts/assets/), tải WOFF2 từ Fontsource (npm @fontsource/<tên> hoặc cdn.jsdelivr.net/fontsource), mỗi phông tối đa 3 độ đậm, kiểu thường, đủ các subset cần thiết, lưu vào apps/web/public/packs/font/<pack>/<id>/ và điền files[] (weight, subset, file, unicodeRange) vào assets/font/<pack>/manifest.json.
2. Chọn khoảng 150 phông KHÔNG trùng với packages/core/text/fonts.ts, chia gói: handwriting, calligraphy, vietnamese-display, japanese, korean, chinese, fantasy (phong cách cổ điển / phù thuỷ kiểu "Harry Potter" nhưng là phông OFL), playful (khối tròn kiểu đồ chơi / "Lego" nhưng là phông OFL), festive (lễ hội / Tết / Noel), retro-pixel, brush-grunge. Ưu tiên phông có subset vietnamese.
3. Mỗi phông: id kebab-case, family, label, styles, languages (chỉ ghi vietnamese khi thật sự đủ dấu), weights, files, source (provider "Google Fonts", url trang phông trên fonts.google.com, author = foundry/designer, license OFL-1.1 hoặc Apache-2.0, retrieved), collections phù hợp (tet, christmas, japan, vintage, cute, handDrawn…).
4. Chạy validate.mjs và build-catalog.mjs. Báo cáo bảng: gói → số phông → vài tên ví dụ → tổng dung lượng.
Phạm vi: apps/web/scripts/assets/fonts.mjs (+ file danh sách nếu cần), assets/font/**, apps/web/public/packs/font/**, apps/web/public/packs/catalog.json.
```

---

## G2 — Sticker đợt 1 (~200)

- **Mục tiêu:** khoảng 200 sticker chất lượng cao, chia 10 – 14 gói, nhiều phong cách.
- **Phạm vi:**
  - `assets/sticker/<pack>/manifest.json`;
  - `assets/sticker/<pack>/src/` (không commit);
  - `apps/web/public/packs/sticker/**`;
  - `apps/web/public/packs/catalog.json`.
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
Phạm vi: assets/sticker/**, apps/web/public/packs/sticker/**, apps/web/public/packs/catalog.json.
```

---

## G3 — Chất liệu nền (~40) + lớp phủ (~20)

- **Phạm vi:**
  - `assets/texture/**`, `assets/overlay/**`;
  - `apps/web/public/packs/texture/**`, `apps/web/public/packs/overlay/**`;
  - `apps/web/public/packs/catalog.json`.
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
Phạm vi: assets/texture/**, assets/overlay/**, apps/web/public/packs/texture/**, apps/web/public/packs/overlay/**, apps/web/public/packs/catalog.json.
```

---

## G4 — Khung từ nguồn ngoài (~40) + mép giấy xé thật

- **Mục tiêu:**
  - (a) khoảng 40 ảnh khung thật có cửa sổ;
  - (b) bộ ảnh **mép giấy xé thật** để bộ sinh khung của Claude (C7, D-107) dùng làm "cọ".
- **Phạm vi:**
  - `assets/frame/**`, `apps/web/public/packs/frame/**`, `apps/web/public/packs/catalog.json`;
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
Phạm vi: assets/frame/**, assets/_sources/torn-edges/**, apps/web/public/packs/frame/**, apps/web/public/packs/catalog.json.
```

---

## G7 — Nghiên cứu cho M21

- **Mục tiêu:** tài liệu đầu vào để bàn M21 (công cụ sáng tạo, D-105). **Chưa code vào app.**
- **Phạm vi:** `docs/discussions/<ngày>-m21-nghien-cuu.md`, và tuỳ chọn `assets/research/m21/filters.json`.
- **Nội dung:**
  1. **Filter:** ≥ 12 nhóm (phim, retro, điện ảnh, chân dung, ẩm thực, phong cảnh, đen trắng, pastel, vintage, neon, mùa, Hàn / Nhật…), mỗi nhóm 8 – 12 filter.
     - Mỗi filter có thông số theo **đúng các thông số app đang có**, xem `packages/core/color/params.ts` và `filters.ts`.
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

Đọc mục "G7" trong docs/ai/gemini-tasks.md, D-105 trong docs/discussions/decisions.md, packages/core/color/params.ts, packages/core/color/filters.ts, packages/core/color/processor.ts (để biết filter hiện có và các thông số đang hỗ trợ).
Viết docs/discussions/<YYYY-MM-DD>-m21-nghien-cuu.md bằng tiếng Việt gồm 4 phần như mô tả ở G7: (1) ≥ 12 nhóm filter × 8–12 filter với thông số theo params.ts (thông số mới liệt kê riêng; LUT nguồn mở ghi giấy phép) — có thể xuất kèm assets/research/m21/filters.json; (2) danh sách hiệu ứng tĩnh với cách làm, thông số, độ nặng trên điện thoại, tham khảo + giấy phép; (3) bút vẽ / viết tay; (4) tham khảo cách các app chỉnh ảnh / collage khác tổ chức các công cụ này. Kết thúc bằng bảng tóm tắt và đề xuất thứ tự làm.
Phạm vi: docs/discussions/<ngày>-m21-nghien-cuu.md, assets/research/m21/**, bảng trạng thái trong docs/ai/gemini-tasks.md.
```

---

## Quy tắc kiểm tra bằng mắt (bắt buộc từ đợt 3)

`validate.mjs` chỉ kiểm **định dạng**, không kiểm **nội dung**. Đợt 2 có rất nhiều mục sai nội dung lọt qua. Từ G8:
1. Sau `process.mjs`, mở `review.html` của gói, xem **trên nền ca rô**: nền chưa tách lộ ra ngay.
2. Với mỗi mục, ghi vào báo cáo **một dòng mô tả thứ thật sự nhìn thấy trong ảnh** (không chép tên file / tiêu đề nguồn). Nếu mô tả không khớp tên mục thì bỏ mục đó.
3. Loại ngay: ảnh còn hộp / nhãn / ghim / thước đo / **thẻ màu chuẩn** của bảo tàng; ảnh chụp màn hình; tiền giấy; người thật nhận diện được; tranh tôn giáo; chữ viết tay chiếm phần lớn; nền chưa tách (với sticker).

---

## G8 — Lớp phủ (làm lại, ~30)

- **Mục tiêu:** khoảng 30 lớp phủ **thật sự là lớp phủ**: chỉ có ánh sáng / hạt / vết / nếp, **không có vật thể** nào nhận ra được.
- **Phạm vi:** `assets/overlay/**`, `apps/web/public/packs/overlay/**`, `apps/web/public/packs/catalog.json`. Giữ 4 mục đang có (`film-paper-grain`, `light-effects`).
- **Loại cần:**
  - **Nền đen, `blend: screen`:** rò sáng phim (cam / đỏ / hồng), vệt sáng chéo, lens flare mềm, bokeh tròn mờ (chỉ đốm sáng, không thấy cây / đèn / người), bụi và xước phim (chấm / vạch trắng), hạt phim.
  - **Nền trắng, `blend: multiply`:** giấy nhăn, nếp gấp, vết cà phê / trà, mép cháy, giấy cũ ố, vân giấy dó.
- **Nguồn:** ưu tiên ảnh **tự tạo** bằng script (Gemini viết script sinh vệt sáng / hạt / bụi bằng canvas / sharp: CC0, ghi provider "IG Layout") **hoặc** CC0 / CC-BY rõ ràng (Wikimedia, Openverse, ambientCG cho giấy nhăn). Kiểm tra từng ảnh: không có vật thể.
- **Xong khi:** ≥ 30 lớp phủ (tính cả 4 cũ), đúng `blend`, đã xem trên `review.html`, báo cáo có dòng mô tả từng mục.

**Prompt:**
```
Việc G8 — Lớp phủ (làm lại). Nhánh: gemini/g8-overlays, tạo từ origin/main MỚI NHẤT.

LÀM TRONG THƯ MỤC RIÊNG (bắt buộc):
  git fetch origin && git worktree add ../IG-layout-gemini-g8 -b gemini/g8-overlays origin/main
  cd ../IG-layout-gemini-g8 && pnpm install
Mọi lệnh chạy trong ../IG-layout-gemini-g8. Không làm trong thư mục chính của repo.

Đọc mục "Quy tắc kiểm tra bằng mắt" và "G8" trong docs/ai/gemini-tasks.md, và ghi chú duyệt đợt 2 (vì sao 18/22 lớp phủ cũ bị loại).
Làm ~30 lớp phủ (giữ 4 mục đang có): nền đen + blend screen (rò sáng, vệt sáng, flare mềm, bokeh chỉ có đốm sáng, bụi / xước / hạt phim) và nền trắng + blend multiply (giấy nhăn, nếp gấp, vết cà phê / trà, giấy cũ ố). TUYỆT ĐỐI không có vật thể nhận ra được (cây, đèn, người, nhà, chữ, màn hình, tiền…).
Ưu tiên tự sinh bằng script (apps/web/scripts/assets/gen-overlays.mjs, dùng sharp / canvas, seed cố định, provider "IG Layout", license CC0-1.0, url trỏ tới file script trên GitHub); phần còn lại lấy CC0 / CC-BY rõ ràng.
Chạy process.mjs → mở review.html, xem từng mục → validate.mjs (OK) → build-catalog.mjs. Báo cáo: bảng mục → MÔ TẢ THỨ NHÌN THẤY → blend → nguồn → giấy phép.
Phạm vi: assets/overlay/**, apps/web/public/packs/overlay/**, apps/web/public/packs/catalog.json, apps/web/scripts/assets/gen-overlays.mjs, bảng trạng thái trong docs/ai/gemini-tasks.md. Đẩy nhánh, không merge.
```

---

## G9 — Sticker lễ hội & Việt Nam (~80)

- **Mục tiêu:** bù gói `festive-holidays` đã bị bỏ, và làm giàu nội dung Việt Nam.
- **Phạm vi:** `assets/sticker/**` (gói mới), `apps/web/public/packs/sticker/**`, `apps/web/public/packs/catalog.json`.
- **Gói:**
  - `tet` (~20): hoa mai, hoa đào, câu đối / chữ Phúc (hình vẽ, không phải ảnh chụp), bao lì xì, pháo, bánh chưng, mâm ngũ quả, đèn lồng đỏ, con giáp. Gắn `collections: ["tet", "vietnam"]`.
  - `mid-autumn` (~15): đèn ông sao, đèn cá chép, bánh trung thu, mặt trăng, thỏ ngọc, chú Cuội vẽ. `["midAutumn", "vietnam"]`.
  - `christmas` (~20): cây thông, chuông, quà, kẹo gậy, ông già Noel **vẽ minh hoạ**, người tuyết, vòng nguyệt quế, bông tuyết. `["christmas"]`.
  - `celebrations` (~25): bóng bay, bánh sinh nhật, nến, pháo giấy, ruy băng, nhẫn cưới, hoa cưới, mũ tốt nghiệp. `["birthday", "wedding", "graduation"]` theo mục.
- **Nguồn:** hình minh hoạ **rời** (một vật, nền tách sạch): tranh / thiệp cổ PD đã cắt riêng vật, bộ minh hoạ CC0 / CC-BY / CC-BY-NC (ví dụ bộ vẽ tay trên Wikimedia, Openverse lọc illustration, OpenMoji (CC-BY-SA) nếu cần kiểu phẳng — **trừ** Fluent Emoji vì app đã có). Không lấy cả tấm bưu thiếp.
- **Xong khi:** ≥ 80 mục sạch, xem từng mục trên nền ca rô, báo cáo có dòng mô tả từng mục.

**Prompt:**
```
Việc G9 — Sticker lễ hội & Việt Nam. Nhánh: gemini/g9-festive, tạo từ origin/main MỚI NHẤT.

LÀM TRONG THƯ MỤC RIÊNG (bắt buộc):
  git fetch origin && git worktree add ../IG-layout-gemini-g9 -b gemini/g9-festive origin/main
  cd ../IG-layout-gemini-g9 && pnpm install
Mọi lệnh chạy trong ../IG-layout-gemini-g9.

Đọc mục "Quy tắc kiểm tra bằng mắt" và "G9" trong docs/ai/gemini-tasks.md, cùng ghi chú duyệt G2 (vì sao gói festive-holidays cũ bị bỏ).
Làm 4 gói: tet (~20), mid-autumn (~15), christmas (~20), celebrations (~25). Mỗi sticker là MỘT vật rời, nền tách sạch, không lấy cả tấm bưu thiếp, không ảnh người thật, không tranh tôn giáo, không trùng Fluent Emoji. Gắn collections đúng (tet / midAutumn / christmas / birthday / wedding / graduation / vietnam). Tên VI tự nhiên, tags EN / VI ≥ 3 mỗi thứ tiếng.
Chạy process.mjs → mở review.html, xem từng mục trên nền ca rô, loại mục xấu → validate.mjs (OK) → build-catalog.mjs. Báo cáo: bảng mục → MÔ TẢ THỨ NHÌN THẤY → nguồn → giấy phép; liệt kê mục NC / custom.
Phạm vi: assets/sticker/<4 gói mới>/**, apps/web/public/packs/sticker/<4 gói mới>/**, apps/web/public/packs/catalog.json, bảng trạng thái trong docs/ai/gemini-tasks.md. Đẩy nhánh, không merge.
```

---

## G10 — Mở rộng thư viện đợt 4 (góp ý của chủ dự án, 2026-10-19)

**Mục tiêu:** thêm nhiều mục cho những nhóm người dùng hay dùng nhất, và đổi tên / mở rộng các gói đang quá hẹp. Tổng cộng khoảng **+500 mục**. Ưu tiên theo thứ tự bảng.

| # | Gói (id giữ nguyên) | Hiện | Mục tiêu | Nội dung cần thêm |
|---|---|---|---|---|
| 1 | `tet` | 20 | ~50 | hoa mai / đào nhiều kiểu, câu đối, chữ Phúc / Lộc / Thọ (hình vẽ), lì xì, bánh chưng / tét, mứt, cây quất, đèn lồng, pháo, 12 con giáp |
| 2 | `vietnam-heritage` | 7 | ~40 | tranh Đông Hồ / Hàng Trống (PD), áo dài, nón lá, xích lô, ghe, chùa / đình, trống đồng (hình vẽ), món ăn Việt |
| 3 | `japanese-ukiyoe` → tên **"Nhật Bản"** | 12 | ~50 | ukiyo-e, **kamon** (gia huy, đơn sắc), hoạ tiết sóng / mây / hoa anh đào, daruma, mèo vẫy tay, quạt, đèn lồng, torii (minh hoạ PD / CC) |
| 4 | **mới** `autumn` ("Mùa thu", collections `["autumn"]`) | 0 | ~40 | lá phong / lá khô nhiều màu, quả sồi, nấm, bí ngô, hạt dẻ, hoa cúc, cành khô — tranh thực vật cổ hoặc minh hoạ |
| 5 | `christmas` | 21 | ~50 | cây thông, quà, chuông, kẹo, bông tuyết, tuần lộc, người tuyết, vòng nguyệt quế, đèn dây — cùng nét với OpenMoji hoặc minh hoạ cổ (tách rời từng vật) |
| 6 | `celebrations` (sinh nhật…) | 26 | ~60 | bánh, nến số 0–9, bóng bay nhiều màu, mũ tiệc, pháo giấy, quà, banner "Happy Birthday" (hình vẽ), hoa |
| 7 | `birds-animals` → tên **"Chim cổ"** | 18 | ~50 | **nhiều loài** (không chỉ chim ruồi): chim sẻ, vẹt, hồng hạc, cú, chim công, hạc… tranh vẽ cổ |
| 8 | `butterflies-insects` → tên **"Động vật"** | 6 | ~60 | bướm, ong, chuồn chuồn, ve, bọ cánh cứng, ốc, cá, mèo, chó, thỏ, ếch… — **tranh vẽ / minh hoạ**, không ảnh mẫu bảo tàng có hộp / nhãn |
| 9 | `hand-doodles` → tên **"Minh hoạ"** | 20 | ~60 | đồ hoạ, art, illustration: người, đồ vật, cây cối, hình trang trí — CC0 (Open Doodles, Open Peeps, Humaaans, Kenney…) |
| 10 | `vintage-maps-compass` → tên **"Du lịch & đồ cổ"** | 16 | ~40 | máy ảnh cổ, vali, vé tàu / vé máy bay, quả địa cầu, bản đồ, đồng hồ, máy chữ, đèn dầu, xe đạp… |
| 11 | **mới** `ink-stamps` ("Tem & dấu mực", collections `["vintage", "travel", "journal"]`) | 0 | ~40 | **một màu, dạng nét mực** như ảnh tham khảo `refs/scrl/IMG_3988.PNG`: dấu bưu điện tròn có chữ chạy quanh + ngày, đường gợn sóng huỷ tem, khung tem răng cưa có mệnh giá, dấu cao su chữ nhật / bầu dục ("PAR AVION", "POSTES", "AIR MAIL", "郵便局", "CORREOS"…), hoa văn nhỏ. Nét **màu đen trên nền trong suốt**, có độ sần như mực đóng dấu thật |
| 12 | lớp phủ (`film-paper-grain`, `light-effects`, `lens-flares`) | 52 | ~90 | thêm bokeh, flare, rò sáng, hạt phim, bụi, giấy nhăn, nếp gấp, vết ố. App sẽ gộp mọi lớp phủ vào nhóm "Light & texture" — Gemini **không** đổi id gói |
| 13 | chất liệu `paper` | 7 | ~30 | giấy trắng / ngà / kraft / giấy báo / giấy cũ ố / giấy dó / giấy nhăn / bìa — ảnh CC0 (ambientCG, Poly Haven) |
| 14 | gắn **"featured"** | — | ~40 mục | chọn khoảng 40 mục **đẹp nhất, dùng được nhiều nhất** trong mọi gói sticker, thêm `"featured"` vào `collections` của chính mục đó (app hiện chúng ở nhóm "Nổi bật") |

**Quy tắc riêng của G10:**
- **Không đổi `id` của gói, không đổi `id` của mục, không chuyển mục sang gói khác** (dự án và mục "Dùng gần đây" của người dùng trỏ tới chúng). Đổi tên gói = chỉ sửa `name` trong manifest.
- Gói mới (`autumn`, `ink-stamps`) theo đúng định dạng; tem mực (11) có thể **tự sinh bằng script** (SVG chữ chạy vòng, gợn sóng, răng cưa + mặt nạ nhiễu để ra độ sần mực; provider "IG Layout", CC0) — thường sạch và đẹp hơn ảnh quét.
- Áp dụng đầy đủ **"Quy tắc kiểm tra bằng mắt"** ở trên: xem từng mục trên nền ca rô, báo cáo một dòng mô tả thứ nhìn thấy cho mỗi mục mới.
- Không trùng Fluent Emoji / OpenMoji đã có; sticker là **một vật rời**, nền tách sạch.
- Băng dính, giấy note, mẩu giấy là **bộ sinh của Claude** (`gen-*`) — **không** đụng vào.

**Prompt:**
```
Việc G10 — Mở rộng thư viện đợt 4. Nhánh: gemini/g10-library, tạo từ origin/main MỚI NHẤT.

LÀM TRONG THƯ MỤC RIÊNG:
  git fetch origin && git worktree add ../IG-layout-gemini-g10 -b gemini/g10-library origin/main
  cd ../IG-layout-gemini-g10 && pnpm install
Mọi lệnh chạy trong ../IG-layout-gemini-g10.

Đọc mục "Quy tắc kiểm tra bằng mắt" và "G10" trong docs/ai/gemini-tasks.md, xem ảnh tham khảo refs/scrl/IMG_3988.PNG (tem / dấu một màu dạng nét mực).
Làm lần lượt 14 mục trong bảng G10 (ưu tiên từ trên xuống), tổng ~+500 mục. KHÔNG đổi id gói / id mục, không chuyển mục giữa các gói; đổi tên gói chỉ sửa "name". Gói mới: autumn, ink-stamps (có thể tự sinh bằng script SVG, CC0, provider "IG Layout"). Gắn "featured" cho ~40 mục đẹp nhất. Không đụng các gói gen-* (bộ sinh của Claude).
Sau mỗi gói: process.mjs → mở review.html, xem từng mục trên nền ca rô, loại mục xấu → validate.mjs (OK) → build-catalog.mjs → commit. Báo cáo cuối: bảng gói → số mục trước / sau → nguồn → giấy phép, và một dòng MÔ TẢ THỨ NHÌN THẤY cho mỗi mục mới.
Phạm vi: assets/**, apps/web/public/packs/**, apps/web/scripts/assets/** (script mới nếu cần), bảng trạng thái trong docs/ai/gemini-tasks.md. Đẩy nhánh gemini/g10-library; chỉ merge vào main khi chủ dự án bảo.
```

---

## Cách Claude nhận việc từ Gemini

1. Chủ dự án báo nhánh đã xong.
2. Claude kéo nhánh về, đọc báo cáo, chạy `validate.mjs` và `build-catalog.mjs`, xem thử trong app, chạy e2e.
3. Nếu ổn thì merge vào `main`. Nếu chưa ổn thì ghi việc cần sửa vào mục của việc đó (dưới đây), rồi chủ dự án chuyển lại cho Gemini.

### Ghi chú nhận việc

- **2026-10-19 — G8 / G9: Gemini merge vào main theo yêu cầu của chủ dự án.** Claude duyệt lại sau: **nội dung đạt** — G9: 83 sticker OpenMoji (CC-BY-SA) + tự vẽ, cùng nét, nền sạch; G8: 52 lớp phủ đúng nghĩa (lens flare, bokeh, vệt sáng, giấy nhăn, vết cà phê, nếp gấp), bỏ 1 mục là ảnh chụp có chữ ký tác giả. Một bài e2e (m11) cần sửa tên trùng sau khi thêm lớp phủ.

- **2026-10-18 — Duyệt đợt 2 (Claude tự sửa rồi merge):**
  - **G2 chưa được Gemini sửa** (nhánh vẫn là commit cũ) → Claude tự áp các điểm của lần duyệt trước: bỏ gói `everyday-objects` (trùng emoji), bỏ gói `festive-holidays` (bưu thiếp tách nền hỏng, ảnh người thật, tranh tôn giáo), bỏ bướm còn hộp / nhãn, hiện vật chưa tách nền, nhãn mép nham nhở, tem trùng; đổi tên gói dấu sáp; sửa tên tem thu cước (bị đặt nhầm là tem Columbus). Còn **141** sticker.
  - **G3:** chất liệu tốt (bỏ 4 tấm bị nhuộm sai màu, gần như phẳng). **Lớp phủ: 18 / 22 bị bỏ** — là ảnh chụp thường, tên không khớp nội dung (vd. "vết nước trên giấy" là tờ đô la, "bokeh ấm" là ảnh chụp trang Wikipedia, "rò sáng" là ảnh toà nhà). Lớp phủ phải là **vệt sáng / hạt / bụi / nếp giấy trên nền đen hoặc trắng**, không có vật thể; luôn **mở ảnh ra xem** trước khi ghi tên.
  - **G4:** cả 44 khung **không tách nền ngoài** (nền trắng / xám của ảnh chụp bảo tàng còn nguyên) và cửa sổ nhỏ hơn mép trong của khung. Claude viết script tự xoá nền ngoài + nới cửa sổ tới mép trong + nhận ô bầu dục; bỏ 9 khung không sửa được và 9 mục không phải khung (giấy tờ toàn chữ, mục có **thẻ màu chuẩn của bảo tàng**, dấu sáp, tranh tôn giáo, bưu thiếp chữ viết tay). Còn **26** khung. 32 mép giấy xé: tốt.
  - **G7:** tốt — 120 filter đúng định dạng `FilterPreset`, 20 hiệu ứng tĩnh có phân tích độ nặng, đề xuất thứ tự.
  - Lỗi chung cần tránh ở đợt sau: **không kiểm tra bằng mắt** (validate.mjs chỉ kiểm định dạng, không kiểm nội dung). Bắt buộc mở `review.html` từng gói, xem trên nền ca rô để thấy nền chưa tách.

- **2026-10-18 — Quy tắc mới: làm trong thư mục riêng.** Gemini và Claude đang dùng chung một thư mục làm việc; một file nháp của G6 đã lọt vào commit của Claude. Từ nay Gemini làm trong **git worktree riêng**: `git worktree add ../IG-layout-gemini -b gemini/<việc> origin/main` rồi chỉ làm trong `../IG-layout-gemini` (cài `pnpm install` ở đó, hoặc symlink `node_modules`). Không checkout nhánh khác trong thư mục chính.
- **2026-10-18 — Duyệt G6:** đạt. Câu tự nhiên, đủ dấu, đủ số lượng; 27 widget có chữ mẫu VI / EN.
- **2026-10-18 — Duyệt G1:** đạt. Tách nền dùng lại ormbg chạy trên máy + flood-fill cho tem / nhãn; có README.
- **2026-10-18 — Duyệt G5:** đạt. 195 phông, hiển thị đúng dấu tiếng Việt ở các phông khai báo `vietnamese`; CJK ≤ 5 MB / phông. Lưu ý: gói `fantasy` toàn phông **chỉ Latin** (không gõ được tiếng Việt) — đợt sau tìm thêm phông kỳ ảo / cổ điển **có tiếng Việt**.
- **2026-10-18 — Duyệt G2: cần sửa** (giấy phép OK, `validate` OK; chất lượng hình chưa đạt ở nhiều gói):
  - **Bỏ gói `everyday-objects`** (19 mục): là Fluent Emoji — app đã có sẵn bộ emoji này.
  - **`butterflies-insects`**: ~8 mục là ảnh mẫu bảo tàng còn **hộp, nhãn, ghim, nền giấy** (vd. thứ 3, 5, 6, 9, 10, 13, 14, 17 trong gói) → bỏ hoặc tìm ảnh đã tách sạch (tranh vẽ côn trùng cổ dễ tách hơn ảnh chụp).
  - **`festive-holidays`**: nhiều bưu thiếp **bị tách nền thành bóng mờ** (chữ viết tay, tem dính lại), có ảnh **chân dung người thật** (cấm theo quy tắc) và tranh tôn giáo (Moses) không hợp → làm lại: chọn hình minh hoạ lễ hội rời (cây thông, chuông, quà, ông già Noel vẽ, đèn lồng…), không lấy cả tấm bưu thiếp.
  - **`vietnam-heritage`**: ảnh hiện vật bảo tàng **chưa tách nền** (tượng Chăm nền nâu, bình gốm trong tủ kính, hai mục bóng mờ) → bỏ; giữ tranh Đông Hồ (tốt).
  - **`vintage-postcards`** thực chất là **dấu sáp** → đổi tên gói cho đúng; bỏ các mục còn dính giấy / nền trắng loang (vd. thứ 4, 9, 17, 18).
  - **`vintage-labels`**: một nửa mép bị nham nhở / quầng sau khi tách nền (vd. 1, 3, 9, 11, 12) → với nhãn / poster stamp là hình chữ nhật, **không tách nền bằng AI**, chỉ cắt thẳng (`process.removeBg: false`) hoặc dùng flood-fill.
  - **`vintage-stamps`**: 5 tem "postage due" hồng (10, 2, 30, 50, 5) gần như giống nhau → giữ 2.
  - **`vintage-maps-compass`**: bỏ mục la bàn chữ Kirin (9) và đồng hồ quả quýt còn vệt nền đen (15).
  - **`japanese-ukiyoe`**: một số bản tách nền bị mờ nhạt (4, 5, 8) → giữ nguyên tranh hình chữ nhật thay vì tách nền.
  - **Tốt, giữ nguyên:** `botanical`, `hand-doodles`, `birds-animals` (đều một loạt tranh chim ruồi — đợt sau thêm loài khác).
  - Sau khi sửa: chạy lại `process.mjs`, xem `review.html` từng gói, `validate.mjs`, `build-catalog.mjs`; mục tiêu vẫn ~200 mục **sạch**.

- **2026-10-18 — đổi nhỏ định dạng `windows`** (Claude): trường `path` (chuỗi SVG) được thay bằng `points` — đa giác `[x0, y0, x1, y1…]` toạ độ 0–1 theo hộp của cửa sổ (xem asset-catalog §3). Khung chữ nhật / bầu dục không cần trường này.
- **Khung tự sinh** của Claude nằm ở các gói `assets/frame/gen-*` (đừng sửa tay — sinh lại bằng `apps/web/scripts/frames/generate.mjs build`). `apps/web/public/packs/catalog.json` là file sinh tự động: nếu bị xung đột khi merge thì chạy lại `build-catalog.mjs`.


### Ghi chú cho mọi đợt sau (2026-10-19, D-117)
Chế độ **Bộ** của thư viện xếp mỗi mục **một lần**: theo bộ chủ đề của **pack** (bộ cụ thể nhất trong `collections` của pack), trừ khi chính mục đó gắn một **dịp lễ** (tet, midAutumn, christmas, halloween, valentine, easter, womensDay, teachersDay, newYear, birthday, wedding, graduation, baby, backToSchool) thì vào dịp đó. Vì vậy: đặt bộ chủ đề thật của pack vào `collections` của pack; ở từng mục chỉ thêm dịp lễ khi mục đó đúng là của dịp ấy; các nhãn chung (vintage, journal, cute…) không quyết định chỗ hiện. Pack mới cần chủ đề khác cách tự suy ra thì báo Claude thêm vào `PACK_MAIN` (`packages/core/catalog/collections.ts`).
