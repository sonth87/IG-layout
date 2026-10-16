# Phân tích SCRL để làm theo — bản 2 (2026-10-16)

> **Quyết định D-71:** chỉ lấy **SCRL** làm chuẩn ("tôi thích SCRL và cách mà SCRL đưa ra… cần clone lại toàn bộ chức năng của SCRL"). Thay cho hướng kết hợp SCRL + Grids (D-70).
> Bản 1 đã được [đánh giá độc lập](2026-10-16-danh-gia-phan-tich-scrl.md). Bản 2 sửa theo đánh giá đó: bỏ phần Grids (bị trộn hai app); sửa giới hạn Instagram (20); hạ mức tin cậy; tách "đã quan sát" và "đề xuất"; thêm rủi ro, khả năng làm trên web, tiêu chí nghiệm thu.

## 0. Phạm vi

- **Làm theo toàn bộ chức năng, luồng và cách thao tác của SCRL.** Bỏ đăng nhập, trả phí, quảng cáo, theo dõi người dùng (D-66). Mọi tính năng Premium của SCRL là **miễn phí** ở app mình.
- **Không sao chép tài sản:** tên, logo, template / sticker / overlay của họ. Template và sticker do mình tự làm hoặc lấy từ nguồn có giấy phép.
- **Giữ điểm khác biệt của app mình:** không tài khoản, ảnh không rời máy, chạy offline, không theo dõi. Theo nhãn quyền riêng tư trên App Store, SCRL thu thập dữ liệu để quảng cáo.

**Mức tin cậy:**
- **A** — đã thấy trong ảnh / video của app. Hiện **chưa có mục nào** đạt A.
- **B** — mô tả chính thức (App Store / Google Play) hoặc trang phân tích UI.
- **C** — chỉ một bài viết bên thứ ba, hoặc suy luận.

## 1. Danh sách chức năng SCRL

| # | Chức năng (SCRL) | Mức | App mình hiện tại | Làm trên web |
|---|---|---|---|---|
| S1 | Onboarding vài bước (kết thúc bằng paywall) | B | Không | Dễ (bỏ paywall) |
| S2 | Tạo từ **template** hoặc **trang trắng** | B | Chỉ trang trắng → chọn layout sau khi chọn ảnh | Dễ (phần code); **nội dung template là việc lớn** |
| S3 | Chọn kích thước ảnh + số khung (free 10, Premium **20**) | B | Có (1:1 / 4:5 / 3:4, ≤ 20) | Có |
| S4 | **Canvas liền một dải** cuộn ngang, ảnh vắt qua nhiều slide | B | Có | Có |
| S5 | **Zoom tự do**: phóng to chi tiết, **thu nhỏ xem cả dự án** | B | Phóng 1–4×; **chưa** thu nhỏ < 1× | Dễ |
| S6 | Điều khiển từng slide (thêm / bớt / chỉnh) | B | Có | Có |
| S7 | **Menu nổi nhỏ khi chọn phần tử**: xoá, nhân bản, khoá… | B | Không (thanh dưới + header) | Dễ–vừa |
| S8 | **Bảng lớp**: kéo thả đổi thứ tự, khoá, nhân bản | B | Có bảng lớp + khoá; **chưa kéo thả** | Dễ |
| S9 | **Snapping**: tâm / mép slide / phần tử khác | B | Có | Có |
| S10 | Ảnh: exposure, màu, filter | B | Có (13 thông số, 5 filter) | Có; cần thêm filter |
| S11 | **Xoá nền ảnh** (cắt sản phẩm / chân dung) | B | Không | **Làm được nhưng nặng**: mô hình AI chạy trong trình duyệt (~40–80 MB tải lần đầu, chạy chậm trên máy yếu). Cần chọn thư viện có giấy phép phù hợp |
| S12 | **Chữ: 70+ font biến thiên**, chỉnh độ đậm, giãn chữ, căn lề | B | 6 font, chưa có độ đậm biến thiên | Dễ (Google Fonts có nhiều font biến thiên miễn phí) |
| S13 | **Sticker, overlay**, chất liệu (texture), chiều sâu | B | Chưa | Code dễ; **nội dung cần nguồn có giấy phép** |
| S14 | **Khung (frames)** | B | Có (polaroid, viền trắng, film) | Có; thêm mẫu |
| S15 | **Lưới bố cục (grids)** trong canvas | B | Có (layout ô) | Có |
| S16 | Hình khối (shapes) | C | Có | Có |
| S17 | Vẽ tay (drawing) | C | Không | Vừa |
| S18 | Nền chuyển màu (Premium) | B | Có | Có |
| S19 | **Video** trong canvas, video trong ô lưới (Premium) | B | Không | **Khó**: phát nhiều video cùng lúc trên điện thoại, đồng bộ, bộ nhớ |
| S20 | Xem trước cả bộ, kiểm khoảng cách giữa khung | B | Có (xem trước Instagram) | Có |
| S21 | Xuất **bộ ảnh** hoặc **một video chuyển động** | B | Có bộ ảnh | Video: **khó vừa** (ghi canvas thành video; Safari hỗ trợ hạn chế) |
| S22 | **Đăng thẳng** lên Instagram / TikTok | B | Không | **Không làm được trên web**. Gần nhất là share sheet (đã có) |
| S23 | Story template | B | Có loại Story; chưa có template | Có |
| S24 | Bố cục lưới profile trải nhiều bài | B | Có (Grid, thứ tự đăng) | Có |
| S25 | Hỏi đánh giá sau khi xuất | B | Không | Không cần |
| S26 | Một bài viết nói SCRL có thể lưu **ngược thứ tự** | C | Mình đánh số đúng thứ tự đăng | Giữ cách của mình |

Ghi chú: Instagram đã cho phép **20** ảnh / video mỗi carousel từ 2024 ([Metricool](https://metricool.com/instagram-increases-carousel-content-limit/)), nên "hơn 10 ảnh" không còn là điểm riêng.

## 2. Luồng SCRL (theo mô tả, mức B / C)

Đã được mô tả:
1. Onboarding ngắn → paywall mềm (B).
2. Bắt đầu: **template** hoặc **from scratch** (B); chọn kích thước, số khung (C).
3. Editor: canvas dải cuộn ngang. Thêm ảnh / video / chữ / sticker / khung / lưới. Chọn phần tử → **menu nổi** (xoá, nhân bản, khoá). Bảng lớp kéo thả. Snapping. Zoom (B).
4. Xem trước → xuất ảnh hoặc video → đăng thẳng (B).
5. Sau khi xuất: hỏi đánh giá (B).

**Chưa biết, cần video** (mức C trở xuống): bố cục trang chủ; vị trí và tên từng nút trên thanh công cụ; menu nổi gồm những mục gì, hiện ở đâu; cách chọn font / màu; cách thêm và xoá slide; hiệu ứng chuyển màn; các tuỳ chọn xuất.

## 3. Đề xuất cho app mình (thiết kế của tôi, **không phải** hành vi đã quan sát)

- Trang chủ: Tạo mới + thư viện template theo nhóm + dự án của tôi.
- Editor: thanh dưới gồm Thêm (ảnh, chữ, sticker, hình, khung, lưới), Nền, Slide, Lớp. Chọn phần tử → menu nổi. Chụm trên vùng trống → zoom, thu nhỏ để thấy cả dải.
- Sẽ chỉnh lại cho đúng SCRL khi có video.

## 4. Rủi ro

| Rủi ro | Mức | Cách xử lý |
|---|---|---|
| **Template "đẹp như SCRL" cần designer.** SCRL có đội designer làm tay; dự án không có | Cao | Bắt đầu với ~20 mẫu từ các kiểu bố cục phổ biến; chủ dự án duyệt từng mẫu; có thể nhờ designer sau |
| Sticker / overlay / texture cần nguồn có giấy phép | Vừa | Dùng nguồn CC0 / tự vẽ; ghi trong Credits |
| Xoá nền: tải nặng, chậm trên máy yếu, giấy phép thư viện | Vừa | Chỉ tải mô hình khi người dùng bấm lần đầu; chọn thư viện giấy phép mở |
| Video: hiệu năng / bộ nhớ trên iPhone, Safari hỗ trợ ghi video hạn chế | Cao | Làm sau cùng, thử nghiệm trước |
| SCRL bị chê **đầy bộ nhớ máy** | Vừa | Giới hạn dung lượng ảnh lưu, dọn ảnh không dùng, hiện dung lượng (đã có trong Cài đặt) |
| Clone theo mô tả, không có video → lệch với SCRL thật | Cao | Cần video quay màn hình (mục 7) |

## 5. Lộ trình đề xuất

| Mốc | Nội dung |
|---|---|
| **M9** (đang làm) | ✅ Cảm giác thao tác (F-01..F-04, chạm). Tiếp: **menu nổi** (S7), **thu nhỏ xem cả dải** (S5), **bảng lớp kéo thả + ẩn** (S8) |
| **M10** | Onboarding (S1), **trang chủ + thư viện template**, luồng template / trang trắng (S2), template story (S23) |
| **M11** | Font biến thiên ~70 (S12), filter 20–30 (S10), sticker / overlay / texture (S13), thêm khung (S14), vẽ tay (S17) |
| **M12** | Xoá nền ảnh (S11) |
| **M13** | Video trong canvas (S19) + xuất video (S21), thử nghiệm trước |
| Không làm | Đăng thẳng (S22, web không làm được), hỏi đánh giá (S25), paywall |

## 6. Tiêu chí nghiệm thu "đã giống SCRL"

Cho mỗi màn: đặt video SCRL cạnh video app mình, kiểm:
1. Cùng các bước để làm xong một việc (ví dụ: thêm ảnh, xoá phần tử, thêm slide).
2. Cùng cử chỉ (chạm, giữ, kéo, chụm) cho cùng việc.
3. Cùng nhóm chức năng ở cùng chỗ (thanh dưới / menu nổi / sheet).
4. Thao tác mượt: kéo / chụm ≥ 50 fps trên máy tầm trung, giao diện không nhảy.

## 7. Cần chủ dự án quay (để nâng mức C → A)

Quay màn hình SCRL, mỗi đoạn 20–60 giây. Ghi rõ đang ở bản miễn phí hay đã dùng thử Premium.
1. Mở app lần đầu (nếu được: cài lại) → onboarding → trang chủ.
2. Trang chủ: cuộn thư viện template, mở 1 template, đổi ảnh trong template.
3. Tạo trang trắng: các bước chọn kích thước / số khung.
4. Editor: thêm ảnh, kéo, chụm, xoay; chọn phần tử (thấy **menu nổi**), mở từng mục.
5. Chữ: danh sách font, độ đậm, giãn chữ, màu.
6. Sticker / overlay / khung / lưới: mở từng thư viện.
7. Bảng lớp: kéo thả, khoá.
8. Zoom ra xem cả dải; thêm / xoá / đổi chỗ slide.
9. Xem trước → xuất (các tuỳ chọn).
10. Cài đặt.

## 8. Nguồn

- [SCRL — App Store](https://apps.apple.com/us/app/scrl/id1289057196) · [SCRL — Google Play](https://play.google.com/store/apps/details?id=com.appostrophe.scrl&hl=en_US)
- [SCRL UI Breakdown — screensdesign](https://screensdesign.com/showcase/scrl-photo-collage-maker)
- [SCRL — mwm.ai](https://mwm.ai/apps/scrl-2025-recap-collage-maker/1289057196)
- Hướng dẫn: [zettelphotography](https://zettelphotography.com/2024/09/01/how-to-use-the-scrl-app-to-create-a-seamless-instagram-post/) · [izoate](https://www.izoate.com/blog/how-to-make-seamless-instagram-carousel-without-canva-2026/)
- [Instagram tăng carousel lên 20 — Metricool](https://metricool.com/instagram-increases-carousel-content-limit/)
