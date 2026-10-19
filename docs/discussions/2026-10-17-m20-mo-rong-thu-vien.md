# M20 — Mở rộng thư viện: hiện trạng, đề xuất và câu hỏi

Ngày: 2026-10-17. Trạng thái: **đã chốt hướng** (§7, §11). Bắt đầu từ phần nền tảng.
Liên quan: D-104 (đổi thứ tự: M20 = mở rộng thư viện, M21 = xoá vật thể), D-66 (tài sản là của mình hoặc có giấy phép), [editor-v2/11](../product/editor-v2/11-thu-vien.md).

## 1. Hiện app có gì

| Thư viện | Hiện có | Ghi chú |
|---|---|---|
| Khung | 13 — 5 lấy liền (polaroid trắng / đen, viền trắng / đen, triển lãm), 1 phim, 7 cửa sổ cắt hình (tròn, tim, sao, lục giác, mây, vòm, bo góc) | Chưa có **lớp trang trí đè lên ảnh**, chưa có khung **nhiều cửa sổ** |
| Hình | 46, chia 9 nhóm (Cơ bản, Đường, Sao, Tim, Mũi tên, Chú ý, Băng rôn, Hoa, Trừu tượng) | Chưa có nhóm **Mực / tem dấu** |
| Sticker | 20 tự vẽ + khoảng 1.600 emoji Fluent (MIT) | Sticker kiểu scrapbook (băng dính, giấy note, ghim…) gần như chưa có |
| Widget | 5 — Nhãn, Tin nhắn, Địa điểm, Tô sáng, Đồng hồ lật | |
| Lớp phủ | 8 — vệt sáng, cháy phim, lăng kính, bokeh, bụi, xước, giấy… | |
| Chất liệu nền | 18 — giấy các màu, kraft, lanh, cẩm thạch, gỗ, bê tông, đá mài, giấy ô ly / chấm / kẻ dòng, màu nước… | Vẽ bằng code |
| Lưới | đủ, trải hết | |
| Brand Kit | logo, tài sản, màu | Chưa có **phông thương hiệu** |

## 2. Tham khảo các app khác

- **Ứng dụng tham khảo chính** (đã phân tích ở [11](../product/editor-v2/11-thu-vien.md)): Khung chia nhóm Lấy liền (~38), Phim (~70), Máy ảnh, Giấy, Vẽ tay, Kỹ thuật số, Theo mùa; Hình có thêm nhóm Mực (tem, dấu bưu điện); nhiều mục trả phí.
- **Unfold**: hơn 400 template story chia theo bộ sưu tập (Film Frames, Ripped Paper, Journal, Moodboard, Digital Wave, Plastic…). Mỗi bộ có phong cách riêng, gồm khung, sticker, chữ và chất liệu cùng tông. Bản miễn phí chỉ có phần cơ bản.
- **Picsart / các app collage scrapbook**: sticker scrapbook theo bộ (băng dính, khung, nét vẽ tay, băng rôn, nhãn, giấy cắt), sticker theo dịp (sinh nhật, Noel, Phục sinh); có app quảng cáo "150+ viền", "1000+ cách phối".
- **App giấy xé (ví dụ Vespera, 2026)**: bán đúng một cảm giác — giấy xé có xơ giấy, chất liệu thật.

Rút ra:
1. Các app mạnh tổ chức theo **bộ / phong cách** (phim, giấy xé, nhật ký…), không chỉ theo loại phần tử. Một bộ đồng bộ làm bài đăng đẹp hơn là có thật nhiều mục rời rạc.
2. Thứ tạo cảm giác "xịn" là **độ thật của chất liệu** (mép giấy xé có xơ, băng dính trong mờ, bóng đổ nhẹ), không phải số lượng.
3. Họ khoá phần lớn sau trả phí. Mình miễn phí toàn bộ, nên chỉ cần **ít hơn nhưng đều đẹp** là đã có lợi thế.

## 3. Đề xuất phạm vi (mức "vừa", để bàn)

| Loại | Hiện | Đề xuất | Nội dung đề xuất |
|---|---|---|---|
| Khung | 13 | ~60 | Lấy liền 15 (nhiều tỉ lệ, viền màu, có băng dính, chồng nghiêng, dải photobooth) · Phim 10 (dải ngang / dọc, 35 mm, âm bản có số khung, cuộn phim) · Giấy 15 (xé, răng cưa tem thư, sổ tay, phong bì, chỉ khâu, hình cắt giấy màu) · Máy ảnh 6 · Kỹ thuật số 8 (tin nhắn, trình duyệt, ghi chú, lịch, máy nghe nhạc, khung ngắm camera) · Vẽ tay 6 |
| Sticker scrapbook | 20 | ~150 | Băng dính washi 15 · Giấy note / nhãn 15 · Ghim / kẹp / đinh 10 · Nét vẽ tay 25 (mũi tên, gạch chân, khoanh tròn, lấp lánh) · Chữ viết tay sẵn 20 (EN + VI) · Du lịch 15 · Đồ ăn / cà phê 15 · Lễ Việt Nam 20 (Tết, Trung thu…) · Tem / mực 15 |
| Hình | 46 | ~80 | Nhóm **Mực** (tem răng cưa, ~10 dấu bưu điện), thêm bong bóng thoại, blob, khung nét vẽ tay, mũi tên vẽ tay |
| Widget | 5 | ~20 | Thời tiết, ngày / lịch, đếm ngược, bài hát đang nghe, đánh giá sao, bình chọn kiểu story, đoạn chat hai bên, thông báo, câu hỏi, giá / khuyến mãi, hashtag, @nhắc tên, thanh tiến trình, vé máy bay |
| Lớp phủ / chất liệu nền | 8 / 18 | ~15 / ~30 | Thêm vệt sáng, giấy nhăn, vải, giấy cũ ố màu… |
| Brand Kit | — | + phông | Phông thương hiệu hiện ở đầu danh sách phông |

Tổng: khoảng **+300 mục**, chưa tính emoji.

### Việc kỹ thuật đi kèm (bắt buộc cho phần Khung)
- **Lớp trang trí đè lên ảnh** (editor-v2/11 §5.1): khung = cửa sổ ảnh + hình trang trí phía trên, ảnh không bao giờ che trang trí.
- **Khung nhiều cửa sổ** (dải phim, photobooth, chồng polaroid).
- **Thứ tự lớp giữa các khung**, để làm template giấy xé chồng mép (IMG_4036). Phần này phụ thuộc câu Q-E9.
- **Tìm kiếm có nhãn EN / VI** cho mọi thư viện, không chỉ sticker.

## 4. Tài sản lấy từ đâu (quan trọng nhất)

| Cách | Ưu | Nhược |
|---|---|---|
| A. Vẽ bằng code (SVG / canvas, như hình và chất liệu hiện nay) | Nhẹ, nét ở mọi cỡ, **đổi màu được**, không lo giấy phép | Trông phẳng, khó ra cảm giác "thật" (xơ giấy, băng dính trong mờ) |
| B. Nguồn mở có giấy phép (CC0 / MIT / CC-BY: ảnh chất liệu CC0, bộ icon / emoji mở…) | Nhanh, trông thật | Phải chọn lọc kỹ, ghi Credits; không nhiều sticker scrapbook chất lượng ở dạng CC0 |
| C. Ảnh do AI tạo | Nhanh, đúng phong cách mình muốn | Chất lượng không đều; tình trạng pháp lý / đạo đức còn tranh cãi |
| D. Chủ dự án / người quen vẽ | Độc đáo, đúng gu | Tốn thời gian của người |

Đề xuất: **A làm nền** (hình, khung, widget, nét vẽ tay, tem), **thêm hiệu ứng chất liệu bằng code** (xơ giấy, bóng đổ, độ trong của băng dính) để tăng độ thật. Chỉ dùng **B** cho ảnh chất liệu (giấy, vải) nếu cần. Phương án C chỉ dùng nếu chủ dự án đồng ý.

## 5. Tải và dung lượng

- Hiện mọi thứ vẽ bằng code nên **gần như không tốn dung lượng** và dùng được offline ngay.
- Nếu có tài sản dạng ảnh (B / C / D): đề xuất **tải theo nhóm khi mở lần đầu**, rồi lưu offline (giống phông chữ). Như vậy app không bị nặng lên.

## 6. Câu hỏi cho chủ dự án

- **Q-L1 — Phong cách chính:** phẳng / tối giản · vẽ tay · giống thật (giấy xé, băng dính như chụp) · trộn theo từng bộ?
- **Q-L2 — Quy mô:** nhỏ (~+150, làm nhanh, chăm chút từng mục) · vừa (~+300, như bảng trên) · lớn (1.000+, cần nguồn B / C)?
- **Q-L3 — Nguồn tài sản:** chỉ vẽ bằng code · cho phép nguồn mở có giấy phép · cho phép ảnh AI tạo · anh/chị có người vẽ?
- **Q-L4 — Ưu tiên loại nào trước:** Khung · Sticker scrapbook · Widget · Hình · Lớp phủ / chất liệu?
- **Q-L5 — Nội dung Việt Nam:** có cần bộ Tết / Trung thu / chữ viết tay tiếng Việt không?
- **Q-L6 — Người dùng chính:** lưu kỷ niệm cá nhân hay **bán hàng online**? Câu này quyết định có làm widget giá / khuyến mãi / đánh giá không.
- **Q-L7 — Tổ chức thư viện:** giữ theo loại (Khung, Sticker, Hình…) hay thêm cách duyệt **theo bộ phong cách** như Unfold (bộ Phim, bộ Giấy xé, bộ Nhật ký — mỗi bộ có khung + sticker + chất liệu + template cùng tông)?
- **Q-L8 — Đổi màu:** sticker có cần đổi màu được không? Vẽ bằng code thì đổi được; ảnh thì không.
- **Q-L9 — Template:** M20 có làm thêm template ở trang chủ dựng từ khung / sticker mới không, hay để mốc riêng?
- **Q-E9 (vẫn mở):** template nhiều khung là các phần tử rời hay gom thành một nhóm?

## 7. Kết quả trao đổi (2026-10-17)

Chủ dự án trả lời:
- **Q-L1 Phong cách:** nhiều phong cách, nhiều bộ khác nhau.
- **Q-L2 Quy mô:** lâu dài **trên 1.000 mục**.
- **Q-L3 Nguồn:** **ưu tiên nguồn ngoài**, để dành công sức (token) cho những việc không lấy từ ngoài được (bộ filter, hiệu ứng, vẽ tay — xem M21). Vẽ được thì tốt nhưng tốn công mà hiệu quả có thể không cao (giấy xé, phim, khung tranh…).
- **Phông:** thêm nhiều kiểu: viết tay, tiếng Nhật, kiểu "Harry Potter", kiểu Tết, kiểu Lego, các phông đặc biệt khác.
  - Ô xem trước phông **không hiện "Đà Lạt"** nữa. Hiện **chữ của phần tử chữ đang chọn**, hoặc một câu hay, có ý nghĩa, lấy ngẫu nhiên từ một danh sách. Tên phông nhỏ ở dưới.
  - Có **lọc phông theo ngôn ngữ hỗ trợ**.
- **Q-L6 Widget:** đặc biệt và đa dạng hơn, không bó buộc vài kiểu.
- **Q-L7 Tổ chức:**
  - Tạm thời giữ chia theo loại.
  - Khi có nhiều bộ (Noel, Tết, Trung thu…) thì thêm nút **chuyển xem theo loại / theo bộ**. Cách làm cụ thể cần nghĩ thêm, xem §9.
- **Q-E9:** cái nào dễ làm trước. Trước mắt template là **các khung rời ghép lại**.
- **Đề xuất thêm của chủ dự án:**
  - **M21** làm bộ filter lớn, hiệu ứng tĩnh, vẽ tay / viết tay.
  - Hiệu ứng tĩnh gồm gương, xoáy, nước, lửa, chảy màu, loang màu… và áp được cho ảnh, chữ hay bất kỳ phần tử nào.
  - Xoá vật thể chuyển sang **M22** (D-105).

## 8. Nguồn ngoài — giấy phép là điều kiện số 1

Thư viện của app là **phân phối lại tài sản cho người khác dùng**. Nhiều nguồn "miễn phí" cấm đúng việc này:

- **Pixabay** cấm phân phối nội dung "standalone", tức là gần như nguyên dạng.
- **Unsplash** cấm gom ảnh để làm dịch vụ tương tự.
- **Pexels, Freepik**, các gói "free for commercial use" trên Gumroad hay Etsy đều có điều khoản cấm đưa vào app / thư viện, hoặc bắt ghi nguồn theo từng chỗ dùng.

→ **Không dùng các nguồn đó.**

Đề xuất quy tắc (D-106, chờ chốt):
- **Dùng được:**
  - CC0 / public domain.
  - MIT, Apache, ISC, OFL (phông).
  - CC-BY: ghi nguồn trên màn Credits.
- **Tránh:** CC-BY-SA (ràng buộc chia sẻ lại cùng giấy phép), mọi giấy phép "NC" (phi thương mại), và các nguồn ở trên.
- **Hồ sơ từng mục:** mỗi mục lưu nguồn, tác giả, giấy phép, link gốc. Màn Credits sinh tự động từ đó.

| Nhóm tài sản | Nguồn đề xuất | Giấy phép | Ghi chú |
|---|---|---|---|
| Sticker vintage: tem, vé, nhãn, bưu thiếp, hoa lá vẽ, bản đồ cổ | Smithsonian Open Access (hơn 5 triệu mục), The Met Open Access, Rijksmuseum, NYPL Public Domain, Wikimedia Commons (PD), Openverse (lọc cc0 / pdm) | CC0 / PD | Cần **tách nền, cắt, nén** — dùng luôn mô hình xoá nền của M12 trong một script xử lý hàng loạt |
| Hình vẽ tay, doodle, người | Open Doodles, Open Peeps, Kenney, OpenGameArt (lọc CC0) | CC0 | Vector, đổi màu được |
| Emoji | Fluent (đã có), Noto Emoji | MIT / Apache, OFL | |
| Chất liệu nền: giấy, vải, gỗ… | ambientCG, Poly Haven | CC0 | Ảnh chụp thật |
| Phông | Google Fonts | OFL / Apache | Có sẵn nhãn ngôn ngữ (Vietnamese, Japanese…) và kiểu (Handwriting, Display…) |
| Khung giấy xé, phim, polaroid, khung tranh | Ít nguồn CC0 chất lượng | — | Xem dưới |

**Khung là chỗ khó nhất:** gần như không có bộ khung giấy xé / phim CC0 đẹp. Đề xuất **máy tạo khung bằng tham số** thay cho vẽ từng cái:
- Viết một bộ sinh "giấy xé": mép xé theo nhiễu, có xơ giấy, bóng đổ, nhận ảnh chất liệu CC0.
- Viết một bộ sinh "phim": số khung, màu phim, chữ in mép.
- Viết một bộ sinh "polaroid / khung tranh": tỉ lệ, viền, chất liệu, băng dính.

Mỗi bộ sinh viết một lần, ra **hàng trăm biến thể** (đổi tham số và hạt ngẫu nhiên), nên tốn công ít hơn nhiều so với vẽ từng khung và vẫn ra cảm giác thật. Đây không phải "vẽ tay từng cái" mà chủ dự án lo.

**Phông "Harry Potter", "Lego":** phông gốc là thương hiệu hoặc phông fan làm, chỉ cho dùng phi thương mại → **không dùng**. Thay bằng phông OFL **cùng phong cách** (cổ điển / kỳ ảo, khối tròn đồ chơi…).

**Cách đưa vào app:**
- Một script thu thập + xử lý (tải → tách nền → cắt → WebP → gắn nhãn EN / VI, bộ, giấy phép) sinh ra một **danh mục JSON**.
- Tài sản chia theo nhóm, **tải khi mở nhóm lần đầu** rồi lưu offline. App không nặng lên.
- Ước tính 1.000 mục × 30 – 60 KB ≈ 30 – 60 MB tổng cộng. Người dùng chỉ tải nhóm họ mở.

## 9. Xem theo loại / theo bộ — đề xuất

- **Một danh mục chung:** mỗi mục có `loại` (khung, sticker, hình, widget, phông, nền, lớp phủ, template) và danh sách `bộ` (Tết, Trung thu, Noel, Valentine, Sinh nhật, Cưới, Du lịch, Biển, Cà phê, Phim, Giấy xé, Nhật ký, Vintage, Y2K, Kỹ thuật số, Nhật Bản…). Cả hai cách xem đều lấy từ danh mục này, không phải làm hai lần.
- **Trong mỗi sheet thư viện:** nút chuyển nhỏ **Loại | Bộ** ở đầu sheet.
  - "Loại" giữ các nhóm như hiện nay.
  - "Bộ" đổi các nhóm thành các bộ, chỉ hiện mục của loại đó. Ví dụ sheet Sticker → nhóm "Tết", "Noel"…
  - Lựa chọn được nhớ trên máy.
- **Màn "Bộ sưu tập"** (mở từ "Lớp mới" hoặc trang chủ): chạm một bộ → thấy **mọi thứ của bộ đó** chia theo loại: template, khung, sticker, phông, nền. Đây là cách duyệt kiểu Unfold.
- **Bộ theo mùa** tự đưa lên đầu khi gần dịp (Tết khoảng tháng 1 – 2, Trung thu khoảng tháng 9, Noel tháng 12).
- **Tìm kiếm** tìm trên cả tên, nhãn và tên bộ, bằng EN và VI.

## 10. Câu hỏi còn lại

- **Q-L10:** Chấp nhận quy tắc giấy phép ở §8 (D-106)? CC-BY (ghi tên trên màn Credits) có được không?
- **Q-L11:** Chấp nhận dùng **bộ sinh khung bằng tham số** cho giấy xé / phim / polaroid, vì nguồn CC0 cho khung rất ít?
- **Q-L12:** Tài sản để chung trong repo (Vercel phục vụ luôn), hay tách sang repo / CDN riêng cho nhẹ repo chính?
- **Q-L13:** Thứ tự làm M20 đề xuất:
  - **(1) Nền tảng:** danh mục + giấy phép + tải theo nhóm, khung có lớp trang trí + nhiều cửa sổ, nút Loại / Bộ, màn chọn phông mới.
  - **(2) Đợt nội dung 1:** khoảng 300 mục.
  - **(3) Các đợt sau** tới hơn 1.000.

  Đồng ý không?

## 11. Kết quả trao đổi đợt 2 (2026-10-17)

- **Q-L10 Giấy phép:** app **phi thương mại**, nên dùng được cả tài sản **chỉ cho phép phi thương mại** (CC-BY-NC, phông "free for personal use"…) — D-106.
  - **Vẫn loại** các nguồn cấm đưa tài sản vào một thư viện / app để người khác dùng lại. Điều khoản này không liên quan đến thương mại hay không. Gồm Pixabay (cấm "standalone"), Unsplash (cấm gom làm dịch vụ tương tự), Pexels, Freepik.
  - Mỗi mục **lưu giấy phép**. Nếu sau này app có quảng cáo / thu phí thì lọc ra được ngay các mục NC để thay.
  - CC-BY-SA: dùng được cho tài sản tách rời (sticker, phông); ghi rõ trên màn Cảm ơn.
- **Q-L11 Bộ sinh khung:** đồng ý, **nhưng phải tự nhiên** (D-107). Xem §12.
- **Q-L12 Nơi để tài sản:** chung repo, **thư mục riêng** — `assets/` (nguồn gốc + hồ sơ giấy phép) và `public/packs/` (bản đã xử lý app tải về) — D-108.
- **Q-L13 Thứ tự:** đồng ý — (1) nền tảng → (2) đợt nội dung 1 (~300 mục) → (3) các đợt sau tới > 1.000.
- **Thêm:**
  - Màn **Giới thiệu** về chủ dự án.
  - Một mục nhỏ **Cảm ơn** các thư viện / tác giả, sinh tự động từ hồ sơ giấy phép.
  - **M23 Liquid glass** (D-109).

## 12. Bộ sinh khung phải tự nhiên (D-107)

Yêu cầu của chủ dự án: tham số đơn giản (độ răng cưa, độ dày) **không đủ tự nhiên**. Giấy xé thật thì:
- không xé thẳng, có lúc lệch;
- vế to vế nhỏ, xé chéo, không vuông vức;
- cạnh to cạnh nhỏ, mỗi cạnh một kiểu.

Cách làm:
- **Hình dạng lớn trước, chi tiết sau.**
  - Đường xé là một đường cong đi lệch dần: hướng trôi ngẫu nhiên, có chỗ đổi hướng đột ngột, có chỗ "giật" khi giấy rách sai thớ.
  - Không phải một đường thẳng cộng nhiễu.
  - Sau đó mới thêm răng cưa nhỏ nhiều lớp (nhiễu nhiều tầng tần số).
- **Mỗi cạnh độc lập:**
  - Cạnh nào cũng có thể xé hay giữ mép cắt thẳng.
  - Mỗi cạnh có độ sâu, độ nghiêng và độ gồ ghề riêng.
  - Góc không vuông; mảnh có thể hơi hình thang hoặc méo.
- **Hai lớp giấy:**
  - Mép xé lộ **lõi giấy trắng có xơ**, bề rộng thay đổi dọc theo mép: chỗ rộng, chỗ gần như mất.
  - Đôi chỗ lớp mặt bong rộng hơn.
- **Chi tiết phụ ngẫu nhiên:** nếp gấp, góc quăn có bóng, vết nhăn nhẹ, bóng đổ không đều (giấy không nằm phẳng).
- **Chất liệu thật:** mặt giấy dùng ảnh chất liệu CC0 / NC, không tô màu phẳng.
- **Tuyển chọn bằng tay:**
  - Sinh rất nhiều biến thể, **chỉ giữ cái đẹp**.
  - Lưu lại hạt ngẫu nhiên, để cùng một khung luôn ra giống nhau.
  - Chủ dự án duyệt trên một trang so sánh trước khi đưa vào app.
- **Dùng mép xé thật:** nếu tìm được ảnh mép giấy xé thật có giấy phép dùng được, lấy mép đó làm "cọ" để vẽ dọc đường xé, cho độ thật cao hơn.

Phim, polaroid, khung tranh cũng theo tinh thần này. Ví dụ phim thì lỗ phim lệch nhẹ, mép phim cong, vệt sáng ngẫu nhiên, chữ in mép mờ chỗ đậm chỗ nhạt; polaroid thì viền hơi ố, góc hơi bo không đều, băng dính dán lệch.

## 13. Góp ý về kiểu xé (2026-10-18)

Chủ dự án: kiểu xé giấy là **ảnh bị xé ở viền ngoài**, không phải khung giấy bị xé thủng ở viền trong. → Bỏ gói "giấy xé có lỗ"; các kiểu xé gồm: ảnh xé (một mảnh), **ảnh xé ghép** 2–4 mảnh chồng mép (như IG-4036), **ảnh xé đặt trên mảnh giấy lót** (cả hai xé mép ngoài).

Bổ sung (2026-10-18): giấy xé **không nhất thiết vuông vức** — hình chữ nhật, hình thang, cạnh ngắn cạnh dài, cạnh xiên, không đều, xé không thẳng, vát, lẹm; xơ / lõi giấy chỗ to chỗ nhỏ; xé 1 tới nhiều cạnh, kể cả tròn. → Bộ sinh "mảnh ảnh xé" (`tornPiece`) thay cho gói ảnh xé cũ.

## 14. Bỏ màn Bộ sưu tập riêng (2026-10-19)

Chủ dự án: màn Bộ sưu tập lặp mục giữa các bộ, dải tab ngang càng nhiều bộ càng dài, và trùng chức năng với chế độ **Bộ** của sheet Sticker. → Bỏ màn riêng; giữ nút **Loại | Bộ** trong sheet Sticker, mỗi mục chỉ ở bộ chính của nó.
