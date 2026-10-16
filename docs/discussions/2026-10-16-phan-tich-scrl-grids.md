# Phân tích SCRL + Grids để làm theo (2026-10-16)

> Trạng thái: **bản phân tích lần 1, chờ chủ dự án bổ sung ảnh / video và duyệt.**
> Yêu cầu của chủ dự án: kết hợp **SCRL** và **Grids**; luồng, thao tác cơ bản, tính năng, phong cách, hiệu ứng, cách sử dụng, layout, grid đều làm theo hai app này. Bỏ đăng nhập và trả phí (D-66).

## 0. Phạm vi và giới hạn

**Được làm theo:** luồng màn hình, cách thao tác (cử chỉ, menu ngữ cảnh, snapping), danh sách tính năng, cách tổ chức layout / grid, cách xuất và thứ tự đăng. Đây là cách hoạt động, không phải tài sản riêng của ai.

**Không sao chép** (rủi ro bản quyền / nhãn hiệu, và app sẽ bị coi là hàng nhái):
- Tên, logo, icon app, tên gọi riêng của tính năng.
- Hình ảnh template, sticker, overlay, texture, font trả phí của họ. Mình tự làm hoặc dùng nguồn có giấy phép (D-33).
- Giao diện y hệt từng pixel (màu, bố cục, icon). **Phong cách** sẽ theo cùng tinh thần (tối giản, canvas là trung tâm, thao tác bằng menu nổi), nhưng màu, chữ, icon là của app mình.

**Độ tin cậy của thông tin.** Tôi không cài được app iOS / Android. Bản này dựa trên trang App Store / Google Play, trang phân tích UI, các bài hướng dẫn (nguồn ở mục 9). Mỗi mục có ghi mức:
- **A** — nhiều nguồn mô tả rõ.
- **B** — chỉ một nguồn hoặc mô tả chung chung.
- **C** — suy luận, cần xác nhận bằng ảnh / video (mục 7).

## 1. Tổng quan hai app

| | SCRL (Appostrophe AB) | Grids |
|---|---|---|
| Thế mạnh | **Canvas liền một dải** (cuộn ngang), carousel liền mạch, collage tự do | **Chia lưới profile** + carousel, tự sắp thứ tự đăng, template post / story / reels |
| Mức độ phổ biến | 4.8★ / 125K đánh giá, "#1 tại Mỹ" về collage / carousel | Phổ biến, nhiều template |
| Kiếm tiền | Premium tuần / tháng / năm, dùng thử 7 ngày, paywall ở cuối onboarding | Pro tuần / năm, dùng thử 3 ngày |
| Lời khen | Đơn giản, hợp lý, "mạnh hơn cả VSCO", bài đăng "next level" | Nhanh, "không phải làm tay" |
| Lời chê | Tốn bộ nhớ máy, video xuất ra bị rung / kém, không liền mạch khi chia sẻ sang Facebook | Bản Pro mỏng, nhiều thứ Canva cũng làm được |

**Kết hợp đề xuất:** **editor theo SCRL** (canvas dải, menu nổi, lớp, snapping) + **lưới profile, cắt ảnh và thứ tự đăng theo Grids** + **thư viện template** lấy ý tưởng từ cả hai.

## 2. Bảng tính năng SCRL

| # | Tính năng | Mô tả | Mức | App mình hiện có |
|---|---|---|---|---|
| S1 | Onboarding 5 bước | Giới thiệu ngắn, cuối là paywall mềm | A | Không. Mình làm onboarding, **bỏ paywall** |
| S2 | Bắt đầu từ template hoặc trang trắng | Màn tạo: chọn template có sẵn hoặc "from scratch" | A | Chỉ có trang trắng → layout sau khi chọn ảnh |
| S3 | Chọn kích thước + số khung | Chọn cỡ ảnh, số khung (free 10, Premium 20) | A | Có (tỉ lệ 1:1 / 4:5 / 3:4, tối đa 20 slide) |
| S4 | **Canvas liền một dải, cuộn ngang** | Một không gian làm việc; ảnh / video đặt vắt qua nhiều slide | A | Có |
| S5 | Zoom canvas tự do | Phóng to chỉnh chi tiết, thu nhỏ xem toàn dải | A | Có (1–4×). **Chưa** thu nhỏ để xem toàn dải (< 1×) |
| S6 | Điều khiển từng slide | Thêm / bớt / chỉnh từng khung | B | Có (dải thumbnail, Slides) |
| S7 | **Menu nổi khi chọn** | Chọn phần tử → menu nhỏ nổi cạnh nó: xoá, nhân bản, khoá… | A | **Không**: thao tác nằm ở thanh dưới + header |
| S8 | **Bảng lớp kéo thả** | Đổi thứ tự lớp bằng kéo thả; khoá; nhân bản | A | Có bảng lớp, **chưa** kéo thả |
| S9 | Snapping thông minh | Tự hít vào tâm / mép slide / phần tử khác, có đường gióng | A | Có |
| S10 | Ảnh: chỉnh sáng, màu, filter | Exposure, màu, filter ngay trong app | A | Có (13 thông số, 5 filter) |
| S11 | Xoá nền ảnh | Background removal | B | Không |
| S12 | Chữ: 70+ font biến thiên | Chỉnh độ đậm (weight), giãn chữ, căn lề | A | 6 font, chưa có weight biến thiên |
| S13 | Sticker, overlay, texture | Thư viện lớn, thêm chiều sâu / chất liệu | A | Chưa (để sau MVP, D-56) |
| S14 | Khung (frames) | Khung ảnh | A | Có (polaroid, viền trắng, film) |
| S15 | Lưới bố cục trong canvas (layout grids) | Lưới chia ô để đặt ảnh | A | Có (layout lưới, ô) |
| S16 | Hình khối | Shapes | A | Có |
| S17 | Vẽ tay | Drawing | B | Không |
| S18 | Nền chuyển màu | Gradient background (Premium) | A | Có |
| S19 | Video trong canvas | Đặt video, video trong lưới (Premium) | A | Không (ngoài phạm vi hiện tại) |
| S20 | Xem trước | Xem cả bộ, kiểm khoảng cách giữa các khung | A | Có (xem trước Instagram) |
| S21 | Xuất | Bộ ảnh carousel **hoặc** một video chuyển động | A | Có ảnh. Video: không |
| S22 | Đăng thẳng lên Instagram / TikTok | | A | Không làm được trên web; mình dùng share sheet |
| S23 | > 10 ảnh trong một bài | | A | Có (20 slide) |
| S24 | Thứ tự lưu | Một bài hướng dẫn nói SCRL có thể lưu **ngược thứ tự** | B | Mình đánh số `_01…` đúng thứ tự đăng (tốt hơn) |
| S25 | Hỏi đánh giá sau khi xuất | Hiện nhẹ nhàng sau lần xuất thành công | A | Không cần |

## 3. Bảng tính năng Grids

| # | Tính năng | Mô tả | Mức | App mình hiện có |
|---|---|---|---|---|
| G1 | Lưới profile 3×1 … 3×5 | Cắt 1 ảnh / thiết kế thành lưới trên trang cá nhân | A | Có (Grid, số hàng tuỳ chọn, bù khe) |
| G2 | Tự sắp thứ tự đăng | Gợi ý đăng từng ảnh theo đúng thứ tự | A | Có (đánh số trên canvas, `_01` = ô dưới phải) |
| G3 | Carousel liền mạch 2–10 khung | Chia ảnh / thiết kế thành các khung khớp nhau | A | Có |
| G4 | Template post / story / reels | Kéo thả ảnh vào template | A | Layout ô trống, chưa có template "đẹp sẵn" |
| G5 | Collage | Ảnh + video + sticker + chữ | A | Có (trừ video, sticker) |
| G6 | 55+ filter | | A | 5 filter |
| G7 | Logo / watermark | Thêm logo, watermark riêng | A | Không (có thể dùng "thêm ảnh") |
| G8 | Editor linh hoạt từng khung | Chỉnh từng khung | A | Có |
| G9 | Xoá nền, tẩy vật thể | | A | Không |
| G10 | Bìa video / reels, nhạc | | A | Ngoài phạm vi |

## 4. Luồng màn hình mục tiêu (kết hợp)

Đánh dấu nguồn: [S] SCRL, [G] Grids, [M] app mình đã có.

1. **Lần đầu mở app:** onboarding 3–5 màn [S]: canvas dải, lưới profile, đăng theo thứ tự. Không paywall.
2. **Trang chủ** [S][G]:
   - Nút **Tạo mới** nổi bật.
   - **Thư viện template** chia theo nhóm (Carousel, Grid, Story, Collage…), xem trước lớn [G].
   - **Dự án của tôi** [M].
3. **Tạo mới:**
   - **Từ template:** chọn template → editor, ô ảnh trống có dấu "+" → chạm để chọn ảnh [S][G].
   - **Trang trắng:** chọn định dạng (Carousel / Story / Grid), tỉ lệ, số khung → editor trống [S][M].
   - **Cắt nhanh** [G]: chọn 1 ảnh → chọn lưới 3×N hoặc số khung carousel → xem cắt → xuất ngay.
4. **Editor** [S]:
   - Canvas dải ở giữa. Thanh trên: quay lại, hoàn tác / làm lại, xem trước, xuất.
   - Thanh dưới: **Thêm** (ảnh, chữ, sticker, hình, khung, lưới), **Nền**, **Slide**, **Lớp**.
   - Chọn phần tử → **menu nổi** cạnh phần tử: xoá, nhân bản, khoá, đưa lên / xuống, công cụ riêng (cắt, màu, filter… với ảnh; font, màu… với chữ).
   - Chụm hai ngón trên vùng trống: zoom canvas, **thu nhỏ để thấy toàn dải**.
   - Bảng **Lớp**: kéo thả đổi thứ tự, khoá, ẩn.
5. **Xem trước** [S][G][M]: vuốt như trên Instagram; với Grid xem như trang cá nhân.
6. **Xuất** [M][G]: lưu vào Ảnh hoặc ZIP, đánh số đúng thứ tự đăng; hướng dẫn đăng từng bước.

## 5. Khác biệt cần làm (gap), theo ưu tiên

| Ưu tiên | Việc | Từ |
|---|---|---|
| P0 | Trang chủ có thư viện template + luồng "template trước" | S2, G4 |
| P0 | Menu nổi khi chọn phần tử (thay thanh công cụ dưới) | S7 |
| P0 | Zoom ra < 1× để xem toàn dải | S5 |
| P1 | Bảng lớp kéo thả, ẩn / hiện | S8 |
| P1 | Bộ template đẹp sẵn (tự thiết kế): carousel, grid, story, collage | S2, G4 |
| P1 | Cắt nhanh 1 ảnh → lưới / carousel | G1, G3 |
| P1 | Onboarding | S1 |
| P1 | Thêm filter (mục tiêu 20–30), font có độ đậm biến thiên (Google Fonts variable) | G6, S12 |
| P2 | Sticker / overlay / texture (nguồn có giấy phép) | S13 |
| P2 | Vẽ tay | S17 |
| P2 | Logo / watermark | G7 |
| P3 / cân nhắc | Xoá nền ảnh (cần mô hình ML chạy trên máy, nặng) | S11, G9 |
| Ngoài phạm vi (đề xuất) | Video, xuất video, nhạc, đăng thẳng lên Instagram | S19, S21, S22, G10 |

## 6. Hiệu ứng, cảm giác thao tác (cần xác nhận bằng video)

Mục tiêu đo được (đã đặt ở M9): kéo / chụm 60 fps, canvas không nhảy, xoay hít góc.

Cần quan sát từ video SCRL / Grids (mức C):
- Menu nổi hiện ra thế nào (mờ dần, bật lên?), nằm trên hay dưới phần tử, có đi theo khi kéo không.
- Chuyển cảnh giữa các màn (trượt, phóng), sheet kéo lên có nảy không.
- Có rung khi hít đường gióng không. Đường gióng màu gì.
- Thu nhỏ toàn dải: có tự hiện ranh giới / số slide không.
- Xem trước: vuốt có quán tính như Instagram không.

## 7. Cần chủ dự án quay / chụp (để làm đúng, mức C → A)

Quay màn hình (bật ghi màn hình iPhone / Android), mỗi đoạn 20–60 giây:

**SCRL**
1. Mở app → trang chủ → cuộn thư viện template → mở 1 template.
2. Tạo trang trắng: các bước chọn định dạng / kích thước / số khung.
3. Editor: thêm 2–3 ảnh, kéo, chụm, xoay; chọn phần tử để thấy **menu nổi**; mở từng mục trong menu.
4. Thêm chữ: danh sách font, chỉnh độ đậm / giãn chữ / màu.
5. Bảng lớp: kéo thả, khoá.
6. Zoom ra xem toàn dải; thêm / xoá slide.
7. Xem trước và xuất (các tuỳ chọn xuất).

**Grids**
8. Trang chủ + thư viện template (các nhóm).
9. Tạo lưới profile từ 1 ảnh: chọn 3×N, xem cắt, thứ tự đăng.
10. Editor của Grids: thanh công cụ, menu khi chọn phần tử.

Thêm: chụp màn hình **cài đặt** và **danh sách tính năng Pro** của cả hai (để biết đủ tính năng; mình làm miễn phí).

## 8. Đề xuất lộ trình

- **M9 (đang làm):** sửa cảm giác thao tác (xong F-01..F-04) → **menu nổi** + **zoom toàn dải** + **bảng lớp kéo thả**.
- **M10 — Trang chủ & template:** onboarding, trang chủ thư viện template, luồng template trước / trang trắng / cắt nhanh, bộ template đầu tiên (~30 mẫu tự thiết kế).
- **M11 — Thư viện:** filter 20–30, font biến thiên, sticker / overlay / texture (nguồn có giấy phép), logo / watermark, vẽ tay.
- **M12 (cân nhắc):** xoá nền ảnh.
- Video: đề xuất **không làm** (web app miễn phí, xử lý video nặng; chính SCRL cũng bị chê chất lượng video).

## 9. Câu hỏi cần chốt

- **Q-S1:** Phong cách giao diện: theo cùng tinh thần SCRL / Grids nhưng màu / icon / chữ riêng (khuyến nghị), hay giữ giao diện hiện tại và chỉ đổi luồng / thao tác?
- **Q-S2:** Video (đặt video trong canvas, xuất video): làm hay không? (khuyến nghị: không)
- **Q-S3:** Xoá nền ảnh: làm ở M12 hay bỏ?
- **Q-S4:** Thứ tự làm: theo mục 8, hay ưu tiên khác?

## 10. Nguồn

- [SCRL — App Store](https://apps.apple.com/us/app/scrl/id1289057196) · [SCRL — Google Play](https://play.google.com/store/apps/details?id=com.appostrophe.scrl&hl=en_US)
- [SCRL UI Breakdown — screensdesign](https://screensdesign.com/showcase/scrl-photo-collage-maker)
- [Hướng dẫn SCRL — zettelphotography](https://zettelphotography.com/2024/09/01/how-to-use-the-scrl-app-to-create-a-seamless-instagram-post/) · [captionsland](https://captionsland.com/scrl-app/) · [izoate](https://www.izoate.com/blog/how-to-make-seamless-instagram-carousel-without-canva-2026/)
- [SCRL — reviewed.app](https://reviewed.app/app/photo-collage-maker-scrl/)
- [GRIDS — App Store](https://apps.apple.com/us/app/grids-post-maker-for-instagram/id666575203) · [Grids Photo Crop — App Store](https://apps.apple.com/us/app/grid-post-grids-photo-crop/id1192303985)
- [Big grid trên Instagram — Sked Social](https://skedsocial.com/blog/big-grid-instagram)
