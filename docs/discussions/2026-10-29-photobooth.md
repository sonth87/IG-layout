# 2026-10-29 — Chế độ Photobooth: phân tích

> Trạng thái: **Đề xuất** — đang trao đổi, chưa chốt gì. Chưa code.

## Ý tưởng của chủ dự án
- Photobooth đang thịnh (đi chụp 4 ô ngoài tiệm) → thêm một nút chuyển sang chế độ Photobooth trong app.
- Cần làm rõ: app sẽ như thế nào, output là gì, chụp nhiều người thì sao, nhiều người **online** thì sao.
- Tham khảo: [onboothvn.com](https://www.onboothvn.com/) — phong cách kiểu cinema, có "join room" chụp chung (chủ dự án chưa thử).

## Tham khảo: ONBOOTH
Đọc trang chủ + FAQ (2026-10-29), chưa thử tận tay (cần camera, 2 máy):
- Miễn phí, không tài khoản, không cài app, EN + VI. Cũng là Next.js + PWA.
- 3 chế độ: **Solo**, **Duo** (2 người một khung), **Group** (tối đa 8 người).
- Luồng: nhập tên → mở booth mới hoặc join booth có sẵn → chọn layout → đếm ngược 3-2-1 **đồng bộ cho cả nhóm** → giữ lại ảnh ưng → ra **một dải ảnh (strip) chung**.
- Kỹ thuật (theo FAQ và mô tả trang): video trực tiếp qua **WebRTC**; lúc bấm chụp **mỗi máy tự chụp khung hình từ camera của mình cùng một thời điểm**, gửi cho nhau **peer-to-peer**, rồi **mỗi trình duyệt tự ghép strip**. "No uploads, no server storage".
- Lưu ý: WebRTC vẫn cần một máy chủ nhỏ để các máy **tìm thấy nhau** (signaling) — FAQ không nói họ dùng gì.

### Chủ dự án thử phòng (2026-10-29, 2 trình duyệt trên cùng máy, không có camera)
- Link phòng dạng `/room/g4ydpuj?name=222` — mã 7 ký tự, tên nằm luôn trên link. Góc trên: "PHÒNG g4ydpuj · SAO CHÉP LINK".
- **Mỗi người vào là một khung riêng** (kiểu ảnh polaroid, hơi nghiêng, xếp dọc), dưới khung ghi tên, "· bạn" ở khung của mình; khung người tạo phòng có nhãn **★ CHỦ PHÒNG**.
- Không có camera → khung hiện **chữ cái đầu của tên** to ở giữa + "TẮT CAM RỒI"; máy không thấy camera có thông báo + nút "THỬ LẠI CAMERA".
- Thanh dưới: nút chính **"ĐANG CHỜ CẢ ĐÁM…"** (mờ — chờ đủ người / đủ camera mới bấm chụp được), **MIC×, CAM×** (có cả tiếng — là cuộc gọi video thật), **GƯƠNG** (lật gương), **THOÁT**.
- Thoát → hỏi lại: "Khoan đã! Rời khỏi booth luôn hả? Cuộn ảnh này sẽ mất — mấy tấm đã chụp sẽ không được lưu lại đâu." → "CHỤP TIẾP THÔI" / "VẪN RỜI ĐI". (Đúng tinh thần không lưu gì trên server.)
- Phong cách: nền nâu đen, giấy kem, đỏ gạch; **dải lỗ phim** đỏ dưới header; tiêu đề chữ serif đậm, nhãn chữ mono giãn rộng, viền nét đứt kiểu vé; giọng văn thân mật ("cả đám", "nha").
- Hai trình duyệt thấy nhau ngay → signaling chạy tốt khi cùng mạng. **Chưa thử được:** lúc chụp, ảnh ghép ra sao, khác mạng / 4G. Cần thử lại bằng 2 điện thoại có camera.

Ý hay nên học: chụp ảnh gốc ở máy từng người (nét hơn nhiều so với chụp lại hình video bị nén), ghép trên máy, không lưu gì trên server.

## Tham khảo: ColorME Photobooth (colorme.vn/tools/photobooth)
Chủ dự án gửi ảnh chụp màn hình (2026-10-29). Chỉ có chế độ một máy, không có phòng online.
- Trang đầu: "Chụp ảnh photobooth online" — đếm ngược 3-2-1, chụp 4 kiểu, ra ngay dải ảnh có khung, bộ lọc, sticker. Hai lối vào: **Bật camera, chụp ngay** / **Tải ảnh lên** (dùng ảnh có sẵn).
- **5 bố cục theo khổ in thật:** Dải 4 ảnh (5×15 cm), Dải 3 ảnh (5×15 cm), Lưới 2×2 (10×15 cm), Polaroid 1 ảnh, 6 ảnh mini (10×15 cm). "Xuất độ phân giải cao để in ngay tại sự kiện."
- Màn kết quả: **dải ảnh chạy ra từ một cái máy in** (hoạt ảnh), trạng thái "Đã in xong · 1 ảnh"; ô chưa có ảnh hiện hình người xám "Ảnh 2 / 3 / 4"; chân dải có chữ ("Cười lên nào!") + ngày + logo.
- Bảng bên phải: "Xong rồi! Dải 4 ảnh · còn thiếu 3 ảnh"; **Tải về** (chọn PNG); **GIF, Video, Chia sẻ, Sao chép, ZIP**; **Lấy mã QR** (ngoại lệ duy nhất có tải ảnh lên server, có ghi rõ); **Chụp thêm 3** (chụp bù ô thiếu); **Sửa**; dải **Từng ảnh** (thumbnail đánh số).
- Ghi chú riêng tư: "Ảnh chỉ nằm trên máy bạn… Nhớ tải về trước khi đóng trang."

Ý hay: hoạt ảnh máy in, cho tải ảnh có sẵn, chụp bù từng ô, bố cục gọi theo khổ in thật, QR để chuyển ảnh sang điện thoại (khi chụp trên laptop).

## Mô hình "ô" (ý chủ dự án, 2026-10-29)
Chủ dự án: mỗi người một ô; chụp xong tuỳ layout chọn mà hiển thị khác nhau. Có sẵn layout dọc, ngang, lưới…; thêm sticker, hoa lá cành; tự sắp lại thứ tự, xoay ngang / dọc từng ô. **Mỗi ô là 1 người hoặc 1 lần chụp.**

Đề xuất mô hình hoá:
- Một buổi chụp = **bảng ảnh S lần chụp × P người** (solo thì P = 1). Ảnh gốc giữ **nguyên khung cảm biến** (không cắt lúc chụp) để sau đổi layout / xoay ô vẫn cắt lại được.
- Layout là cách **rải bảng ảnh vào các ô**, 3 kiểu rải:
  | Kiểu | Một ô chứa | Ví dụ (2 người × 4 lần) |
  |---|---|---|
  | **Theo lần chụp** | 1 lần chụp, bên trong chia nhỏ cho P người | Dải 4 ô, mỗi ô 2 người cạnh nhau |
  | **Theo người** | 1 người ở 1 lần chụp; mỗi lần chụp ra 1 trang | Lưới 2 ô × 4 trang → hợp **carousel** |
  | **Bảng** | 1 ảnh: hàng = lần chụp, cột = người | Hai dải đặt cạnh nhau (Post 4:5) |
- Chọn **số lần chụp trước khi chụp** (để biết đếm bao nhiêu lượt); **layout đổi thoải mái sau khi chụp**, app tự lọc layout hợp với S × P. Thiếu ảnh → ô trống + nút "Chụp bù".
- Chỉnh sau khi rải: kéo đổi chỗ ô, xoay ô ngang / dọc (đổi tỉ lệ ô, ảnh tự cắt lại, kéo để chỉnh vùng cắt), sticker, chữ, ngày, khung theme, filter cho cả dải. Phần lớn **đã có trong editor** (layout lưới, đổi chỗ ảnh, sticker, filter, khung) → photobooth chủ yếu là màn chụp + bộ layout dải in + bước rải ảnh vào ô.
- **Online:** sau khi chụp, mỗi máy có đủ bảng ảnh gốc của cả nhóm. Đề xuất: chủ phòng chọn layout trước khi chụp (mọi người xem trước giống nhau), chụp xong **mỗi người tự sửa bản của mình** trên máy mình. Không làm chỉnh sửa chung realtime (khó hơn hẳn: phải đồng bộ từng thao tác).

### Chủ dự án trả lời (2026-10-29)
- Mô hình ô: **tạm thế** (D-147, đề xuất).
- Online: chụp xong, **còn trong phòng thì sửa chung** kiểu collaborator (D-148).
- **Không cần QR**, chỉ cần **mã phòng 4 ký tự chữ + số** (D-149).

Ghi chú kỹ thuật:
- **Mã 4 ký tự:** nên bỏ ký tự dễ nhầm (0/O, 1/I/L) → ~31⁴ ≈ 920 nghìn mã — đủ, nhưng **đoán được**. Bù lại: phòng hết hạn khi trống, server signaling giới hạn số lần thử mã, và **chủ phòng duyệt người vào** (người lạ gõ trúng mã vẫn phải được cho vào).
- **Sửa chung:** editor hiện lưu project là một `ProjectDoc` (JSON, zustand; undo = danh sách snapshot `past` / `future` — `src/store/editor.ts`). Ảnh gốc mọi máy đã có sau khi chụp → chỉ cần đồng bộ JSON qua kênh dữ liệu WebRTC. Cách đơn giản: mỗi thao tác đã xác nhận gửi bản cập nhật **theo từng phần tử** (ô / sticker / chữ), ai sửa sau thắng; hiện "X đang sửa ô này" để tránh giẫm chân. Cách chắc hơn (CRDT, vd. Yjs) phải đổi cấu trúc store — để sau nếu cần. Undo chỉ lùi thao tác của chính mình.

## Nên nằm trong project này hay tách riêng? (Q-P10)
| | Trong project này (route `/booth`) | Project độc lập |
|---|---|---|
| Dùng lại | Editor, layout, sticker (thư viện lớn), filter, khung, xuất ảnh, font, i18n, PWA, IndexedDB — có ngay | Phải chép hoặc tách thành package dùng chung (monorepo) — tốn công, hai nơi lệch nhau |
| Sửa chung | Gắn thẳng vào store editor | Phải dựng editor riêng |
| Nhận diện | App "layout Instagram" thêm một chế độ — hơi khác chủ đề | Thương hiệu, theme cinema, link ngắn riêng dễ nhớ |
| Dung lượng | Code camera / WebRTC chỉ tải khi vào `/booth` — không làm nặng phần còn lại | — |
| Server | Signaling vẫn là project nhỏ riêng (D-37: app xuất tĩnh) | Như nhau |

**Đề xuất: làm trong project này**, như một chế độ riêng ở `/booth` với giao diện / theme riêng (cinema), chỉ dùng chung editor và thư viện. Lý do chính: photobooth mà không có editor phía sau thì chỉ bằng ONBOOTH / ColorME; editor là phần đáng giá nhất và đã có. Sau này nếu muốn tên / link riêng thì trỏ thêm tên miền vào `/booth`, không cần tách code.
- Lưu ý xuất tĩnh: route động `/booth/[ma]` không xuất tĩnh được với mã tuỳ ý → dùng `/booth?r=AB12` (hoặc `#AB12`).
- Signaling: project nhỏ riêng (Next.js API route + Upstash Redis, polling) như đã bàn.

## Tái cấu trúc: monorepo (ý chủ dự án, 2026-10-29)
Chủ dự án nghiêng về để chung, nhưng tái cấu trúc:
1. Monorepo, pnpm workspace.
2. Hai app riêng, hoặc booth là một path của app hiện tại.
3. Booth **không dùng chung UI** với IG Layout, nhưng **dùng chung tài nguyên / logic**: sticker, shape, text, filter…
4. Nút chuyển app: **cái tag treo bằng dây** ở góc trên phải (màn home), đung đưa, kéo / chạm được bằng tay / chuột; kéo thì **trượt sang app còn lại**.
5. Booth có thêm layout hợp đăng IG, hoặc gợi ý **chuyển ảnh sang IG Layout** để làm bài post.

### Hiện trạng code (để đánh giá độ khó)
- Đã dùng pnpm (có `pnpm-workspace.yaml`, chỉ để cấu hình build deps) → chuyển workspace không đổi công cụ.
- `src/lib/*` gần như **không phụ thuộc UI**: 13 thư mục (catalog, color, effects, elements, export, image, project, templates, text, video…), chỉ 2 file trong `lib/elements` import `@/store/settings`. → tách thành package khá dễ.
- Phần vẽ canvas (Konva) nằm trong `src/components/editor` lẫn với UI editor → muốn booth dùng chung sticker / chữ / ô ảnh trên canvas thì cần tách **lớp vẽ** (render phần tử, kéo / xoay / scale) khỏi **giao diện** (thanh công cụ, panel).
- Tài nguyên tĩnh lớn: `public/packs` 174 MB (font 98, sticker 34, frame 26, texture 10), `public/ort` 39 MB (model AI), `public/samples` 10 MB. Đường dẫn cứng `/packs/` (`lib/catalog/load.ts`).
- App xuất tĩnh, có service worker `public/sw.js` (PWA, offline).

### Đánh giá từng ý
**(1) Monorepo — nên làm.** Ngoài booth còn có server signaling (project Next.js nhỏ) → workspace là nơi tự nhiên cho cả 3. Cấu trúc đề xuất:
```
apps/
  layout/     IG Layout (code hiện tại)
  booth/      Photobooth (hoặc nằm trong layout, xem (2))
  signal/     API signaling cho phòng online (Vercel + Upstash)
packages/
  core/       lib/* hiện tại: project model, templates, elements, color, effects (filter), text, image, export, storage
  canvas/     lớp vẽ Konva dùng chung: render phần tử, chọn / kéo / xoay, không có UI chrome
  assets/     catalog + script xử lý packs, kiểu dữ liệu tài nguyên
  ui-kit/     (tuỳ chọn) chỉ những thứ trung tính: icon, i18n, hook gesture — không theme
```
Chi phí: đổi import `@/lib/...` → `@ig/core/...` (~190 file, làm bằng script), dời các script build (`copy-ort`, `build-emoji`, `build-licenses`, `build-template-art`), e2e, cấu hình Vercel (root directory = `apps/layout`). Làm trên nhánh riêng, một lần, chạy e2e để kiểm tra.

**(2) Hai app hay một path — điểm quyết định là "cùng origin".** Trình duyệt tách IndexedDB, cache, service worker, quyền camera **theo origin** (tên miền). Ý (4) và (5) — trượt sang app kia, mang ảnh sang IG Layout — chỉ mượt khi **cùng origin**.
| | A. Hai app, khác tên miền | B. Hai app, cùng tên miền (multi-zone: `/booth/*` rewrite sang deploy của booth) | C. Một app, booth là route group `/booth` có layout / theme riêng |
|---|---|---|---|
| Chuyển ảnh sang IG Layout | Phải đóng gói gửi qua URL / file — vụng | Ghi thẳng IndexedDB chung | Ghi thẳng store / IndexedDB |
| Hiệu ứng kéo tag trượt sang | Tải lại trang hoàn toàn | Tải trang mới; giả "trượt" bằng View Transitions giữa 2 trang (Chrome, Safari 18.2+) — không thấy app kia lộ ra **trong lúc kéo** | **Mượt thật**: cả 2 màn cùng trong 1 trang, kéo tới đâu app kia lộ ra tới đó |
| Tài nguyên 174 MB | Deploy 2 lần hoặc gọi chéo (CORS), cache riêng | Một bên phục vụ `/packs`, bên kia dùng chung đường dẫn | Một bản |
| PWA / offline | 2 app cài riêng | Phải gộp phạm vi service worker — rối | 1 app cài, offline cả 2 |
| Tách biệt code | Cao | Cao | Đủ nếu giữ kỷ luật thư mục + quy tắc lint cấm import chéo |
| Deploy | 2 project | 2 project + rewrite | 1 project (+ signal) |

**Đề xuất: monorepo + phương án C** — `apps/layout` chứa cả IG Layout và booth (route group riêng, theme riêng, code booth nằm gọn trong một thư mục), dùng chung `packages/*`. Đủ "không chung UI", giữ được hiệu ứng tag mượt và chuyển ảnh trực tiếp. Vì phần dùng chung đã nằm trong packages, sau này muốn tách booth thành `apps/booth` (phương án B) chỉ là dời một thư mục.

**(3) Không chung UI, chung tài nguyên — hợp lý,** với một lưu ý: "tài nguyên" nên gồm cả **lớp vẽ canvas** (packages/canvas), không chỉ file sticker / font. Booth cần đặt sticker, chữ, xoay ô — viết lại lớp vẽ riêng là phí và hai bên sẽ vẽ ra khác nhau. Chỉ phần chrome (thanh công cụ, panel, màu, font giao diện) là riêng.

**(4) Tag treo dây — làm được, nên thử ở `/labs` trước.**
- Vật lý: dây = vài đoạn nối (verlet / con lắc lò xo), tag đung đưa nhẹ khi vào trang, lắc theo khi cuộn / khi chạm; kéo thì dây căng, thả thì bật lại. Tự viết (~150 dòng, canvas hoặc SVG), không cần thư viện.
- Chuyển app: kéo tag **sang trái / xuống** quá một ngưỡng → màn hiện tại trượt đi, app kia trượt vào theo tay (phương án C); chưa quá ngưỡng thì bật về.
- Chạm (không kéo) cũng phải chuyển được — người dùng không phải ai cũng nghĩ ra việc kéo. Có nhãn trên tag ("Photobooth" / "IG Layout"), đọc được bằng trình đọc màn hình, phím Enter. Tắt đung đưa khi bật "giảm chuyển động".
- Điện thoại: góc trên phải gần thanh trạng thái / vùng vuốt hệ thống → để tag thấp xuống một chút, kéo ngang không đụng cử chỉ "back" của iOS (cạnh trái).
- Cần tham khảo các tương tác "kéo dây" / thẻ treo trước khi chốt thiết kế (theo nguyên tắc tham khảo app khác).

**(5) Booth → IG — nên có, cả hai cách:**
- Layout booth có sẵn khổ IG: Post 4:5 (hai dải cạnh nhau), Story 9:16 (dải giữa nền), carousel (mỗi kiểu một slide).
- Nút **"Làm bài post với ảnh này"** ở màn kết quả: tạo project IG Layout mới (Post / Story / Grid) với ảnh đã chụp (từng ảnh gốc hoặc cả dải), gợi ý template hợp số ảnh → mở editor. Với phương án C chỉ là ghi project vào IndexedDB rồi chuyển route.

### Chủ dự án trả lời (2026-10-29, lượt 2)
- **Q-P12:** tag **chỉ ở màn home**.
- **Q-P13:** đồng ý — monorepo + tách packages trước, booth sau.
- **Q-P11:** hỏi lại — nếu làm app chung thì server thế nào, IG Layout dùng Next.js thì có làm chung trên một app được không?

### Server khi gộp một app
Đúng, IG Layout là Next.js 16, nhưng đang **xuất tĩnh** (`output: "export"`, D-37): build ra toàn file HTML / JS, không có phần chạy trên server. Theo tài liệu Next 16 (`static-exports.md`, mục Unsupported Features), chế độ này **không chạy được Route Handler đọc request** (chỉ được `GET` sinh sẵn lúc build), không rewrites / redirects / cookies → API signaling **không đặt được** trong app khi còn xuất tĩnh.

Hai cách:
| | A. Giữ xuất tĩnh, signaling là app riêng | B. Bỏ xuất tĩnh, API nằm luôn trong app |
|---|---|---|
| Thay đổi | Không đổi app chính; thêm `apps/signal` (deploy riêng, tên miền con hoặc gọi chéo có CORS) | Xoá `output: "export"` trong `next.config.ts`; thêm `app/api/room/...` (Route Handler) |
| Deploy | 2 project Vercel | 1 project Vercel |
| Trang hiện có | Như cũ | Vẫn là trang tĩnh (Next tự prerender các trang không dùng dữ liệu động) → tốc độ như cũ, vẫn qua CDN |
| PWA / offline | Như cũ | Như cũ (service worker cache trang tĩnh); chỉ API cần mạng — mà chụp online vốn cần mạng |
| Link phòng | `/booth?r=AB12` | Có thể `/booth/AB12` (route động) |
| Ràng buộc | — | Chỉ deploy được nơi chạy Next server (Vercel ok); mất khả năng "host ở đâu cũng được như file tĩnh" |
| Đổi quyết định | Không | Đổi D-37 |

Cả hai đều cần **Upstash Redis** (hoặc Vercel KV) vì function serverless không nhớ dữ liệu giữa các request. Ảnh / video vẫn đi P2P, không qua server.

**Đề xuất: B** — một app, một deploy, cùng origin, không CORS. Đổi ít (một dòng config + thư mục `app/api`), trang hiện có không chậm đi. Lưu ý: khi đó lý do lớn nhất cho monorepo (nhiều thứ deploy riêng) không còn; monorepo vẫn có ích để **khoá ranh giới** (core / canvas / assets không được import UI, booth không import UI của layout) và để sau tách được. Cấu trúc gọn lại:
```
apps/web/        Next.js: IG Layout + /booth + /api/room
packages/core/   packages/canvas/   packages/assets/
```

### Hỏi đáp: "Không dùng Upstash mà dùng SSE thì sao?" (2026-10-29)
SSE và Upstash giải hai việc khác nhau, không thay thế nhau:
- **SSE** = cách server **đẩy** tin xuống trình duyệt (thay cho việc trình duyệt hỏi lại liên tục — polling).
- **Upstash (Redis)** = **chỗ lưu chung** để các lần chạy server khác nhau thấy cùng dữ liệu phòng.

Vấn đề trên Vercel: mỗi request có thể chạy ở **một instance khác nhau**. Máy A mở SSE → nằm ở instance 1. Máy B gửi "danh thiếp" (POST) → có thể rơi vào instance 2, mà instance 2 không biết gì về kết nối SSE ở instance 1 → không đẩy cho A được. Lưu phòng trong RAM (`Map` trong code) chỉ đúng khi mọi người cùng rơi vào một instance — **thử 2 người thường chạy được, dùng thật thì hỏng ngẫu nhiên**. Thêm nữa function Vercel có giới hạn thời gian chạy → SSE bị cắt, phải nối lại.

Các lựa chọn:
| | Lưu trữ | Ghi chú |
|---|---|---|
| **Vercel + Upstash + polling** (đề xuất) | Redis | Đơn giản, chắc; polling 1–2 s chỉ trong lúc ở sảnh chờ / vào phòng; nối P2P xong thì thôi |
| Vercel + Upstash + SSE | Redis | Nhanh hơn chút nhưng instance giữ SSE vẫn phải tự hỏi Redis → thực chất vẫn là polling phía server, thêm phức tạp; chỉ đáng khi cần |
| **Một server chạy liên tục** (`next start` hoặc server nhỏ trên VPS / Railway / Fly, 1 instance) + SSE / WebSocket | RAM | Không cần Upstash, tức thời; đổi lại phải thuê và trông server, khởi động lại là mất phòng đang mở (chấp nhận được vì phòng chỉ là tạm) |
| Hạ tầng công cộng (Trystero) | — | Không server nào của mình, phụ thuộc người khác |

→ Ở lại Vercel thì cần một chỗ lưu chung (Upstash là gọn nhất, gói miễn phí dư dùng vì dữ liệu chỉ vài KB / phòng, tự xoá sau vài giờ). Muốn bỏ hẳn dịch vụ ngoài thì phải chuyển phần signaling sang một server chạy liên tục.

### Giới hạn WebSocket trên Vercel (tra tài liệu Vercel, 2026-10-29)
Đính chính: trước đó ghi "Vercel không giữ WebSocket" là **thông tin cũ**. Hiện Vercel Functions phục vụ WebSocket trên **mọi gói** (cần Fluid compute — mặc định cho project tạo sau 23/04/2025). Theo [Functions Limits](https://vercel.com/docs/functions/limitations) và [WebSockets](https://vercel.com/docs/functions/websockets):
| Gói | Mặc định | Tối đa | Tối đa mở rộng |
|---|---|---|---|
| Hobby (miễn phí) | 300 s (5 phút) | 300 s | — |
| Pro / Enterprise | 300 s | 800 s (~13 phút) | 1800 s (30 phút, beta) |
- Hết thời gian → kết nối bị đóng; client phải **tự nối lại**, và lần nối lại **có thể rơi vào instance khác** → Vercel khuyên lưu phòng / presence / pub-sub ở **kho ngoài (Redis)**, không để trong RAM. Mỗi instance giữ được nhiều kết nối, nhưng hai người ở hai instance không nói chuyện trực tiếp được.
- Tính tiền như function: tính cả thời gian kết nối mở (bộ nhớ cấp phát) + dữ liệu truyền.
- Next.js chưa có API nâng cấp WebSocket → dùng `upgradeWebSocket()` của `@vercel/functions` (≥ 3.10) trong Route Handler.

Với booth: server chỉ dùng lúc vào phòng / duyệt người vào / nối lại (đếm ngược, ảnh, sửa chung đều đi P2P) → kết nối 5 phút rồi nối lại là đủ dùng. Nhưng **vẫn cần Redis** để các instance thấy chung phòng — dùng WebSocket không bỏ được Upstash. Đổi polling → WebSocket chỉ làm tin đến nhanh hơn; với vài giây lúc vào phòng thì polling đủ.

### Hỏi đáp: "Chủ phòng tự tạo WS mới mỗi 5 phút, báo các máy khác qua WebRTC để nối lại — bỏ được Redis?" (2026-10-29)
Ý chủ dự án: sảnh chờ 5 phút, đếm ngược; hết 5 phút chủ phòng mở WS mới, báo qua kênh WebRTC cho các máy đang kết nối "đã có WS mới, thông tin xxx", các máy tự nối lại.

Đúng một nửa:
- **Đúng:** nối lại định kỳ trước khi hết hạn là cách Vercel khuyên làm. Và các máy **đã nối P2P thì không cần server nữa** — mọi tin giữa họ (đếm ngược, ảnh, sửa chung) đi qua WebRTC.
- **Chưa giải được:** "thông tin xxx" không chỉ đến được một instance cụ thể. Mọi kết nối WS mới tới cùng một địa chỉ (`/api/room`), Vercel tự chia vào instance nào nó muốn → máy chủ phòng và máy khác nối lại vẫn có thể rơi vào hai instance khác nhau. Không có "mã instance" để chỉ định.
- **Người cần server thật ra là người mới vào phòng** (chưa có P2P với ai). Họ gõ mã `AB12` → kết nối rơi vào instance bất kỳ → instance đó phải tra được "phòng AB12, chủ phòng đang ở đâu" → cần kho chung. Vấn đề nằm ở **chia instance**, không phải ở giới hạn 5 phút; xử lý 5 phút khéo đến đâu cũng không bỏ được kho chung.
- Lúc app ít người, thường chỉ có 1 instance nên cách này **chạy được khi thử** — rồi hỏng ngẫu nhiên khi Vercel mở thêm instance hoặc thay instance sau khi deploy.

Rút gọn được từ ý này: chỉ **chủ phòng** (và người đang xin vào) giữ kết nối server; thành viên đã nối P2P thì đóng kết nối server luôn. Nối lại định kỳ làm ngầm (vài giây trước khi hết hạn), không cần giới hạn sảnh 5 phút — giới hạn sảnh nếu có thì là để **phòng tự hết hạn** (vd. chủ phòng thoát / 30 phút không ai vào).

Nếu muốn không dùng Redis mà vẫn không tự chạy server: **Cloudflare Durable Objects** (hoặc PartyKit chạy trên đó) — mỗi phòng là một "object" có địa chỉ theo mã phòng, mọi kết nối của phòng `AB12` luôn về cùng một chỗ, giữ trạng thái trong bộ nhớ được. Đúng bài toán phòng chat / phòng chụp, có gói miễn phí. Đổi lại: thêm một nền tảng (Cloudflare) thay vì thêm Upstash.

**"Instance" là gì** (giải thích cho chủ dự án): một bản đang chạy của code server, có RAM riêng. Vercel không chạy code API trên một máy cố định mà tự bật / tắt nhiều bản tuỳ lượng truy cập (ít người: 1 bản; đông: bật thêm; lâu không ai dùng: tắt; deploy mới: thay bằng bản mới). Request nào vào bản nào là Vercel chia, code không chọn được. Biến trong RAM (vd. `const rooms = new Map()`) chỉ nằm trong bản đó — giống nhiều quầy giao dịch, mỗi quầy một cuốn sổ riêng: khách gửi tin ở quầy 1, người nhận hỏi ở quầy 2 thì quầy 2 không biết. Redis = cuốn sổ chung mọi quầy cùng đọc / ghi. Durable Objects = mỗi phòng có một quầy riêng cố định theo mã phòng.

Chủ dự án: "instance là do Vercel tự đưa ra chứ không phải do cơ chế WebSocket" — **đúng**. WebSocket chỉ là một kết nối hai chiều; chia nhiều instance là cách nền tảng serverless (Vercel, Lambda…) chạy code. Một server tự chạy (1 tiến trình) thì không có chuyện này.

### Phương án Cloudflare (chủ dự án đã có tài khoản Cloudflare, 2026-10-29)
Tra tài liệu Cloudflare ([DO pricing](https://developers.cloudflare.com/durable-objects/platform/pricing), [Realtime / TURN pricing](https://developers.cloudflare.com/realtime/sfu/platform/pricing/), [TURN FAQ](https://developers.cloudflare.com/realtime/turn/faq/)):
- **Durable Objects** có trong gói Workers miễn phí: 100.000 request / ngày (tin WebSocket tính 20 tin = 1 request), giới hạn thời gian chạy tính theo ngày, reset 0h UTC; vượt thì báo lỗi chứ không tự tính tiền. Dùng **WebSocket Hibernation API** → phòng đang chờ mà không có tin thì không bị tính thời gian chạy. Kết nối không bị cắt sau 5 phút như Vercel.
- **STUN** `stun.cloudflare.com`: miễn phí, không giới hạn.
- **TURN** (Cloudflare Realtime): **1.000 GB / tháng miễn phí** (chung với SFU), sau đó $0,05 / GB. → giải luôn vấn đề 4G không nối thẳng được (đã nêu ở mục rủi ro). Thông tin đăng nhập TURN phải sinh ở server bằng khoá API → Worker làm luôn việc này.

Giải thích thuật ngữ (cho chủ dự án):
- **Durable Object:** một "phòng nhỏ" chạy code trên Cloudflare, có tên cố định (vd. `AB12`). Ai kết nối tới `AB12` ở đâu trên thế giới cũng được dẫn vào đúng phòng đó → giữ được danh sách người trong phòng trong bộ nhớ. Phòng không có ai thì Cloudflare tự cất đi. (Ví dụ quầy giao dịch: mỗi mã phòng có một quầy riêng cố định.)
  - Không phải chỉ một phòng: mình viết **một loại** (class `Room`), Cloudflare tạo **mỗi mã phòng một object riêng** khi có người gọi tới lần đầu (`idFromName("AB12")`) — bao nhiêu phòng cùng lúc cũng được, mỗi phòng độc lập. Object được đặt gần người gọi đầu tiên (VN → khu vực Singapore / Hong Kong). Một phòng 2–8 người là rất nhỏ so với sức chứa một object.
- **STUN:** máy ở nhà / 4G chỉ biết địa chỉ nội bộ của mình (kiểu "phòng 302"), không biết địa chỉ ngoài Internet ("số 10 phố X"). STUN là server trả lời câu hỏi "nhìn từ ngoài vào thì tôi ở địa chỉ nào" → hai máy đưa địa chỉ đó cho nhau rồi nối thẳng. Chỉ hỏi một lần, rất nhẹ, nên miễn phí.
- **TURN:** khi mạng chặn không cho nối thẳng (4G, Wi-Fi công ty / trường học), TURN làm **trạm trung chuyển**: máy A gửi video tới TURN, TURN chuyển cho B. Luôn nối được nhưng mọi dữ liệu đi qua server → tốn băng thông, nên tính tiền theo GB. WebRTC tự thử nối thẳng trước, không được mới dùng TURN. Dữ liệu qua TURN vẫn được mã hoá đầu-cuối (TURN không xem được hình).

→ Ba thứ **không thay thế nhau mà dùng cả ba**, mỗi thứ một việc: Durable Object = sảnh / phòng (tìm nhau, duyệt vào); STUN = tìm địa chỉ để nối thẳng (đa số trường hợp); TURN = đường vòng dự phòng khi nối thẳng thất bại. Thiếu Durable Object: không vào phòng được. Thiếu STUN: hầu như không nối được qua Internet. Thiếu TURN: phần lớn vẫn chạy, nhưng một số người (thường 4G / mạng công ty) không thấy nhau.

Hỏi đáp: "Có Durable Object rồi thì server biết client ở đâu, sao còn cần STUN?" — Durable Object chỉ biết **đường WebSocket** (TCP) của mỗi máy, và chỉ chuyển tin; nó không biết địa chỉ của **đường WebRTC** (UDP, một cổng khác). Router / nhà mạng mở cổng ngoài riêng cho mỗi đường, chỉ biết được khi chính cổng UDP đó gửi gói ra ngoài — tức là hỏi STUN từ đúng cổng ấy. Nên: máy hỏi STUN → được địa chỉ UDP → gửi địa chỉ đó **qua Durable Object** cho máy kia. Durable Object là người đưa thư, STUN cho biết địa chỉ ghi trên thư. Durable Object cũng không chạy STUN được (chỉ nhận HTTP / WebSocket, không nhận UDP). Và dù biết địa chỉ, có mạng (4G, NAT đối xứng) vẫn không cho nối thẳng → TURN.

Kiến trúc nếu dùng Cloudflare:
```
Vercel (như hiện tại)                Cloudflare Worker  (apps/signal)
apps/web — xuất tĩnh, giữ D-37  ──WS──▶  /room/AB12 → Durable Object "AB12"
  IG Layout + /booth                      sảnh chờ, duyệt người vào, chuyển "danh thiếp"
                                          + cấp thông tin TURN tạm thời
máy ↔ máy: WebRTC (video, đếm ngược, ảnh, sửa chung) — STUN / TURN của Cloudflare
```
- App chính **giữ xuất tĩnh** (không đổi D-37) — API không còn nằm trong Next.js.
- Không cần Upstash, không cần polling; phòng nằm trong RAM của object, hết người thì tự biến mất.
- Monorepo lại có lý do rõ ràng: `apps/signal` (Worker) chung kiểu dữ liệu tin nhắn với `apps/web` qua `packages/core`.
- Gọi WebSocket khác tên miền được (WS không bị CORS chặn); Worker kiểm tra header `Origin` để chỉ nhận từ tên miền của app.
- Đổi lại: 2 nền tảng (Vercel + Cloudflare), 2 nơi deploy.

**Đề xuất mới cho Q-P11:** một app trên Vercel giữ xuất tĩnh + signaling / TURN trên Cloudflare (Workers + Durable Objects + Realtime TURN). Thay cho đề xuất "bỏ xuất tĩnh + Upstash" ở trên.

Lưu ý thêm (nếu vẫn chọn Vercel): function Vercel mặc định chạy ở `iad1` (Mỹ) → người ở VN trễ ~200 ms mỗi lượt; nên đặt vùng `sin1` (Singapore).

### Thứ tự làm đề xuất
1. Chuyển monorepo + tách `packages/core` (chưa đụng UI). Kiểm tra: build, e2e, deploy Vercel vẫn chạy.
2. Tách `packages/canvas` khỏi editor.
3. `/labs/booth-tag` — thử tag treo dây.
4. Booth P1 (solo) trong route group `/booth`.
5. `apps/signal` + phòng online (P2), sửa chung.

## 1. Chế độ Photobooth trong app này sẽ ra sao

**Vị trí:** một nút/thẻ "Photobooth" ở màn hình chính, cạnh tạo Post / Story / Grid. Nó là **cách nhập ảnh mới** (chụp thay vì chọn từ thư viện), không phải một app riêng — kết quả cuối vẫn đi vào editor sẵn có để chỉnh thêm và xuất cho Instagram. Đây là điểm khác với ONBOOTH: họ dừng ở strip, mình có cả editor phía sau.

**Luồng solo (đề xuất):**
1. **Chọn kiểu booth:** strip dọc 3 / 4 ô, lưới 2×2, 6 ô (2×3), ảnh đơn lớn. Mỗi kiểu là một khung (tận dụng hệ template / khung đang có).
2. **Chọn theme:** Cinema (cuộn phim, viền lỗ phim, chữ kiểu vé xem phim), Classic (viền trắng / đen kiểu tiệm 4 ô Hàn), Retro, Đen trắng, theo mùa (Giáng sinh, Tết…). Theme = khung + filter + font + dấu ngày.
3. **Màn camera:** camera trước, xem trước lật gương. Chọn giờ đếm 3 / 5 / 10 giây, **chụp tự động liên tiếp** đủ số ô (như ngoài tiệm: chụp – nghỉ vài giây – chụp tiếp). Màn hình **loé trắng** khi chụp (làm đèn flash cho camera trước), có âm thanh màn trập (tắt được).
4. **Chụp dư:** như tiệm Hàn — chụp 6–8 kiểu, chọn 4 kiểu đẹp nhất. Cho chụp lại từng ô.
5. **Hoàn thiện nhanh:** filter (dùng bộ filter sẵn có), màu khung, chữ / ngày, sticker.
6. **Xuất** hoặc **Mở trong editor** để chỉnh sâu.

**Chụp nhiều người cùng chỗ:** chỉ cần 1 máy dựng lên + hẹn giờ là đủ — chính là chế độ solo. Không cần làm gì thêm, chỉ cần: giờ đếm dài (10 s), camera sau / trước đổi được, khung ngang cho nhóm đông.

## 2. Output là gì

Ảnh strip in ngoài tiệm (2×6 inch, tỉ lệ 1:3) **không vừa khung Instagram** → nên xuất nhiều dạng:

| Dạng | Mô tả | Dùng cho |
|---|---|---|
| **Strip gốc** | 1:3 (vd. 600 × 1800 hoặc 1200 × 3600) | Lưu giữ, gửi bạn bè, in |
| **Post 4:5** | 2 strip đặt cạnh nhau (đúng như tiệm in 2 dải trên tờ 4×6) hoặc 1 strip trên nền | Feed |
| **Story 9:16** | 1 strip giữa nền màu / nền mờ, thêm chữ | Story — tỉ lệ gần strip nhất |
| **Carousel** | Mỗi kiểu một slide + slide đầu là strip | Feed, xem từng ảnh to |
| **GIF / video ngắn** | Các kiểu nối nhau kiểu flipbook, hoặc clip vài giây quanh lúc chụp (kiểu "live photo" của booth) | Story / Reels |
| **Ảnh lẻ** | Từng kiểu gốc độ phân giải đầy đủ | Lưu lại |

Đề xuất cho bản đầu: **strip gốc + Post 4:5 + Story 9:16 + ảnh lẻ**. GIF / video để sau (app đã có phần video, có thể dùng lại).

## 3. Chụp chung online

### Cách hoạt động (theo hướng ONBOOTH)
1. Một người **tạo phòng** → có mã 4–6 ký tự + link + QR để gửi.
2. Người khác mở link → nhập tên → vào phòng, thấy video trực tiếp của nhau.
3. Chủ phòng chọn kiểu booth / theme, bấm bắt đầu.
4. Đếm ngược **đồng bộ**: chủ phòng gửi "chụp lúc T" (giờ đã hiệu chỉnh lệch giữa các máy), mọi máy tự chụp đúng T.
5. Mỗi máy gửi ảnh gốc của mình (JPEG vài trăm KB) cho các máy khác qua kênh dữ liệu P2P.
6. Mọi máy ghép cùng một strip → ai cũng có bản giống hệt nhau, tự tải về / mở editor.

### Bố cục khi nhiều người
- **Chia ô** (ONBOOTH làm kiểu này — mỗi người một khung riêng): mỗi lần bấm chụp ra N ảnh (mỗi người 1). Strip có thể là: **mỗi hàng = 1 lần chụp, mỗi cột = 1 người** (2 người × 4 lần = strip 2 cột, như 2 dải đặt cạnh nhau — vừa khít Post 4:5), hoặc 3–4 người thì mỗi hàng là lưới nhỏ 2×2. Dễ, chắc chắn ra đẹp.
- **Mỗi người một hàng / cột** trong strip.
- **"Đứng chung một khung":** tách nền từng người (selfie segmentation chạy trên máy, vd. MediaPipe) rồi ghép mọi người lên cùng một nền theme. Đây là điểm "wow" nhất nhưng khó nhất (viền tóc, ánh sáng mỗi người khác nhau). → để sau.

### Phần khó & rủi ro
| Vấn đề | Chi tiết |
|---|---|
| **Cần máy chủ** | Trái D-06 / D-37 (100% client, xuất tĩnh). Ảnh và video vẫn đi P2P, nhưng **signaling** (giúp các máy tìm nhau) bắt buộc có một dịch vụ. Lựa chọn: (a) dịch vụ miễn phí công cộng (PeerJS cloud, hoặc thư viện kiểu Trystero dùng tracker / Nostr / MQTT công cộng — không phải tự chạy server, nhưng không kiểm soát được độ ổn định); (b) dịch vụ realtime có gói miễn phí (Ably, Pusher, Cloudflare Durable Objects / PartyKit…); (c) tự dựng. Vercel bản tĩnh không chạy WebSocket. |
| **Mạng di động** | 4G ở VN thường sau NAT nhiều lớp → một phần kết nối P2P **không nối được** nếu không có TURN (máy chủ chuyển tiếp video). TURN tốn băng thông = tốn tiền, và video đi qua máy chủ. Không có TURN → một số nhóm sẽ "vào phòng mà không thấy nhau". |
| **Số người** | Kiểu mesh: mỗi máy gửi video cho N−1 máy. Trên điện thoại 3–4 người là hợp lý; 8 người dễ nóng máy, giật. Đề xuất **tối đa 4**. Video xem trước có thể để độ phân giải thấp, chỉ ảnh chụp mới cần nét. |
| **iOS Safari** | Camera trong PWA đã cài, tab chạy nền bị dừng, tự khoá màn hình → cần thử máy thật. |
| **Riêng tư** | P2P làm lộ địa chỉ IP giữa các máy trong phòng; phòng nên có mã khó đoán, chủ phòng kick được người lạ, phòng tự huỷ khi mọi người rời. |
| **Đồng bộ** | Lệch vài trăm ms giữa các máy là chấp nhận được (mỗi người tự tạo dáng). Người mạng chậm gửi ảnh lâu → cần màn "đang chờ ảnh của X". |

### Hỏi đáp: "Dùng WebRTC thì sao vẫn cần dịch vụ ngoài?" (2026-10-29)
WebRTC chỉ lo **phần truyền** (video, ảnh đi thẳng máy ↔ máy). Trước khi truyền được, hai máy phải **trao đổi "danh thiếp"** cho nhau: thông tin kết nối (SDP offer / answer) và danh sách địa chỉ có thể nối tới (ICE candidate). Chuẩn WebRTC **cố ý không quy định** cách trao đổi này — tự lo. Hai trình duyệt lạ không thể tự tìm nhau trên Internet nếu không có trung gian.

Cần 3 thứ, mức độ khác nhau:
| Thành phần | Để làm gì | Bắt buộc? | Ghi chú |
|---|---|---|---|
| **Signaling** | Chuyển "danh thiếp" (vài KB văn bản, chỉ lúc vào phòng) | Có | Không đi qua ảnh / video |
| **STUN** | Cho mỗi máy biết địa chỉ IP công khai của mình | Gần như có | Có máy chủ công cộng miễn phí (vd. của Google), không tốn gì |
| **TURN** | Chuyển tiếp video khi hai máy không nối thẳng được (NAT khó, 4G) | Không, nhưng thiếu thì một phần nhóm không nối được | Tốn băng thông, thường phải trả tiền |

Cách làm signaling **không cần server của mình**:
1. **Trao tay bằng QR / copy-dán:** máy A hiện QR chứa "danh thiếp", máy B quét rồi hiện QR trả lời, A quét lại. Không cần bất kỳ server nào — nhưng chỉ tiện khi đứng cạnh nhau (mà đứng cạnh thì chụp chung 1 máy cho nhanh), còn ở xa phải gửi qua Zalo 2 lượt cho **mỗi cặp** người → 4 người là 6 cặp, không dùng nổi.
2. **Mượn hạ tầng công cộng có sẵn:** thư viện kiểu Trystero dùng tracker BitTorrent / relay Nostr / broker MQTT công cộng làm signaling. Không phải tự chạy, miễn phí, app vẫn xuất tĩnh — nhưng phụ thuộc dịch vụ của người khác (có thể chậm / chết).
3. **Dịch vụ realtime gói miễn phí** (PeerJS cloud, Ably, Pusher, Cloudflare…) — ổn định hơn, vẫn là bên ngoài.

4. **Tự làm signaling bằng một project Next.js** (chủ dự án hỏi, 2026-10-29) — được, với vài lưu ý:
   - App chính đang **xuất tĩnh** (D-37) → không có API route. Nên tách **project riêng** (vd. `ig-layout-signal`) để app chính giữ nguyên tĩnh; hoặc bỏ `output: "export"` ở app chính (đổi D-37).
   - Trên Vercel, function là serverless: WebSocket có hỗ trợ nhưng mỗi kết nối bị cắt khi hết thời gian tối đa của function (xem mục "Giới hạn WebSocket trên Vercel"), mỗi request có thể chạy ở máy khác nhau → không nhớ phòng trong RAM được. Cần thêm **kho dữ liệu nhanh** (Upstash Redis / Vercel KV, có gói miễn phí) để lưu "danh thiếp" theo mã phòng.
   - Signaling không cần realtime thật: các máy **gửi bằng POST, hỏi lại mỗi ~1 giây** (polling) hoặc nghe bằng SSE trong lúc vào phòng — vài giây là xong. Sau khi đã nối, đếm ngược và gửi ảnh đi bằng kênh dữ liệu WebRTC, không qua server nữa. Server chỉ dùng lại khi có người vào muộn / rớt mạng nối lại.
   - ~~Muốn dùng WebSocket thật thì phải chạy custom server, không chạy trên Vercel~~ — **sai, đính chính 2026-10-29**: Vercel Functions đã hỗ trợ WebSocket (mọi gói), có giới hạn thời gian mỗi kết nối — xem mục "Giới hạn WebSocket trên Vercel".
   - **TURN thì Next.js không làm được** (cần UDP, chạy coturn trên VPS riêng) — vẫn là bài toán riêng.

→ "Dịch vụ ngoài" ở P2 chỉ là chỗ chuyển vài KB lúc vào phòng; ảnh và video **không** đi qua đó. Hướng nhẹ nhất là (2): giữ app 100% tĩnh, không tự chạy server.

## 4. Đề xuất chia giai đoạn
1. **P1 — Photobooth solo** (hợp hoàn toàn với định hướng hiện tại, không cần server): camera + đếm ngược + chụp liên tiếp + chọn kiểu + theme (có Cinema) + xuất strip / Post / Story + mở trong editor. Làm trước ở trang thử `/labs/photobooth`.
2. **P2 — Phòng chụp online 2–4 người, chia ô.** Chỉ làm khi chủ dự án đồng ý đổi định hướng "không server" cho riêng phần signaling. Làm thử nghiệm nhỏ (2 máy, 1 nhà mạng di động) trước khi làm giao diện.
3. **P3 — GIF / video booth, tách nền "đứng chung một khung".**

Trước P2: nên **thử ONBOOTH bằng 2 điện thoại khác mạng** (1 Wi-Fi, 1 4G) để xem họ nối được không, chất lượng ảnh ghép, độ trễ đếm ngược.

## Câu hỏi cho chủ dự án
Xem [open-questions.md](../roadmap/open-questions.md) mục "Photobooth" (Q-P1 → Q-P6).

## Bản thử phòng chụp chung (2026-10-29)
Chủ dự án: "ok, thử đi xem nào" → làm bản thử trên nhánh `booth-signal-lab` (chưa phải giao diện booth, chỉ để thử kết nối).

**Đã làm**
- `pnpm-workspace.yaml` thêm `apps/*` (bước đầu monorepo, app web vẫn ở gốc). `apps/signal`: Cloudflare Worker + Durable Object `Room` (mỗi mã phòng một object, vùng `apac`, WebSocket Hibernation — trạng thái ghi trên từng socket, không trong RAM). Kiểu tin nhắn chung: `apps/signal/src/protocol.ts` (sẽ sang `packages/core`).
- Luật phòng: mã 4 ký tự (bỏ 0/O/1/I/L), người tạo là chủ phòng, người vào phải được **chủ phòng cho vào**, tối đa 8 người, chủ phòng thoát = đóng phòng; chỉ nhận kết nối từ origin trong `ALLOWED_ORIGINS`.
- Trang thử `/labs/booth` (`src/lib/booth/session.ts`, `strip.ts`, `components/labs/BoothLab.tsx`): WebRTC lưới (mesh) — người mới vào gọi cho mọi người đã có; STUN Cloudflare; mỗi cặp một kênh dữ liệu. Chủ phòng bấm chụp → gửi "chụp sau 1,5 s, 4 kiểu, cách 4 s" → máy nào cũng tự đếm 3-2-1, chụp **camera của chính mình** ở độ phân giải đầy đủ, gửi JPEG (chia gói 16 KB) cho mọi người → mỗi máy ghép strip giống nhau (hàng = lượt chụp, cột = người, nền phim tối có lỗ). Máy không có camera dùng camera giả để vẫn thử được.
- Kiểm tra tự động `e2e/booth.mjs` (cần chạy worker): 3 trình duyệt — tạo phòng, 2 người gõ mã, chủ phòng cho vào, 3 × 3 video chạy, chụp 1 lượt → **cả 3 trang đủ 12/12 ảnh, strip cùng cỡ 2072 × 2110**; chủ phòng thoát → 2 người kia thấy "phòng đã đóng". Camera giả của Chromium là đồng hồ quay: 3 cột cùng một vị trí kim ở mỗi hàng → **chụp đồng thời** giữa các máy.

**Chưa thử / còn thiếu**
- Mới chạy trên một máy (localhost). Chưa deploy worker (cần chủ dự án `wrangler login` vào tài khoản Cloudflare), chưa thử điện thoại thật, Wi-Fi ↔ 4G.
- Chưa có TURN → người ở mạng chặn nối thẳng sẽ thấy "không nối được (cần TURN?)".
- Đồng bộ đếm ngược theo "sau X ms" → lệch bằng độ trễ mạng (vài chục ms), chưa bù.
- Chưa giới hạn số lần thử mã phòng; WebSocket của thành viên vẫn mở suốt (chưa đóng sau khi nối P2P); không có mic; rớt mạng chưa tự nối lại.

## Tái cấu trúc monorepo — bước 1 (2026-10-29)
Chủ dự án nhắc: thứ tự đã chốt là **tái cấu trúc trước, chức năng sau** (Q-P13); bản thử phòng ở trên làm trước là lệch thứ tự. Đã làm bước 1 trên nhánh `monorepo`:
- `apps/web` — app Next.js cũ (giao diện, store, trang, PWA, scripts, e2e). Booth sẽ là route trong app này.
- `packages/core` — toàn bộ `src/lib` cũ (logic, không giao diện), import `@ig-layout/core/...`; app web biên dịch thẳng mã nguồn (`transpilePackages`). Ở lại app web: `pwa.ts`, `text/webfonts.ts` (gắn với Next). Kiểu `Locale` chuyển vào `core/i18n/locale.ts`. Phiên booth nhận địa chỉ server từ app (không đọc biến môi trường Next trong core).
- `apps/signal` — server phòng, dùng chung kiểu tin nhắn `core/booth/protocol.ts`.
- `assets/` (nguồn tài sản) giữ ở gốc; chưa tách `packages/assets` vì chỉ có một app web phục vụ `public/packs` — tách khi cần.
- ESLint một cấu hình ở gốc cho cả workspace.
- Cần chủ dự án: Vercel → Root Directory = `apps/web` (Vercel tự cài workspace từ gốc). Chưa đổi thì deploy từ `main` sẽ hỏng → chưa merge.
