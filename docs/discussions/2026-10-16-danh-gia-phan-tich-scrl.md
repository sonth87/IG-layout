# Đánh giá độc lập: bản phân tích SCRL + Grids (2026-10-16)

> **Đã xử lý:** bản 2 (cùng file) sửa theo đánh giá này; chủ dự án chọn chỉ SCRL (D-71).
> Đối tượng đánh giá: [2026-10-16-phan-tich-scrl-grids.md](2026-10-16-phan-tich-scrl-grids.md) (bản lần 1).
> Cách làm: đọc lại toàn bộ, kiểm tra lại nguồn, đối chiếu với yêu cầu của chủ dự án ("clone hoàn toàn luồng, thao tác, tính năng, phong cách, hiệu ứng, cách dùng, layout, grid").

## Kết luận

**Chưa đạt để dùng làm cơ sở clone.** Bản này dùng được như **danh sách tính năng sơ bộ** và **danh sách việc cần quay video**. Nó **không** phải là phân tích UX:
- Nguồn mỏng.
- Có một lỗi thực tế nghiêm trọng: trộn hai app khác nhau dưới cùng tên "Grids".
- Mức độ tin cậy được chấm quá cao.
- Phần "luồng mục tiêu" trộn thiết kế của tôi với hành vi của SCRL / Grids nhưng không tách bạch.

Điểm: **4/10** so với mục tiêu "clone hoàn toàn". **7/10** nếu chỉ coi là bản kiểm kê ban đầu.

## Lỗi nghiêm trọng

### E1. Trộn hai app khác nhau dưới tên "Grids"
- Phần nguồn trích **"GRIDS Post maker for Instagram"** (App Store id666575203).
- Nhưng **G6 "55+ filter"**, **G7 "logo / watermark"** và cách ghi **G1 "3×1 … 3×5"** lấy từ một app khác: **"Grid Post – Grids Photo Crop"** (id1192303985, nhà phát triển INFOSTRING TECHNOLABS). Tôi đã kiểm tra lại trang App Store của app này.
- App này còn có những thứ bản phân tích không nhắc tới: 600+ font, 10.000+ đồ hoạ, design studio (poster, CV…), Brand Kit.
- **Hậu quả:** bảng Grids (mục 3) không tin được. Quan trọng hơn: **chưa rõ chủ dự án thích app "Grids" nào.** Phải hỏi lại trước khi clone.

### E2. Thông tin giới hạn Instagram đã cũ
- Bản phân tích ghi "Grids: carousel 2–10 khung" và trích nguồn nói "Instagram giới hạn 10 ảnh", nhưng không nhận ra thông tin này đã cũ.
- Instagram đã tăng giới hạn carousel lên **20 ảnh / video** từ 2024 ([Metricool](https://metricool.com/instagram-increases-carousel-content-limit/), [Social Media Today](https://www.socialmediatoday.com/news/instagram-expands-carousels-to-20-frames/723792/)).
- Giới hạn 20 slide của app mình là đúng. Cần sửa câu chữ và bỏ "> 10 ảnh" khỏi danh sách điểm mạnh của SCRL (S23), vì nay đó là mặc định.

### E3. Mức tin cậy chấm quá cao
- "Mức A = nhiều nguồn" nhưng các trang SEO thường chép lại mô tả App Store. Đó là **một nguồn lặp lại**, không phải nhiều nguồn độc lập.
- **S7 menu nổi**, **S8 lớp kéo thả**, **S9 snapping** chỉ đến từ một trang phân tích UI (screensdesign) và mô tả marketing → đáng ra là **B**.
- Gần như **không mục nào** được quan sát trực tiếp. Mức A thật sự cần ảnh hoặc video.

### E4. "Luồng màn hình mục tiêu" (mục 4) gắn nhãn [S] / [G] cho thứ chưa có bằng chứng
- Ví dụ "Thanh dưới: Thêm, Nền, Slide, Lớp [S]", "Trang chủ: thư viện template chia theo nhóm (Carousel, Grid, Story, Collage) [S][G]", "Cắt nhanh [G]".
- Đây là **thiết kế đề xuất của tôi**, không phải hành vi đã quan sát. Gắn nhãn nguồn dễ làm người đọc tưởng là clone đúng.
- Cần tách hai cột: "đã quan sát" và "đề xuất".

## Thiếu sót

| # | Thiếu | Vì sao quan trọng |
|---|---|---|
| M1 | **Không có phân tích UX thật**: kích thước nút, vị trí, cử chỉ, chuyển cảnh, hiệu ứng, trạng thái trống, lỗi | Đây chính là phần chủ dự án muốn clone ("thao tác, phong cách, hiệu ứng"). Mục 6 chỉ liệt kê câu hỏi |
| M2 | **Không đánh giá công sức / rủi ro** | Giá trị cốt lõi của SCRL là **template do designer làm tay**. Dự án không có designer. ~30 template đẹp là việc **nội dung**, tốn hơn code nhiều lần. Đây là rủi ro lớn nhất mà bản phân tích không nhắc |
| M3 | **Không nêu điểm khác biệt của app mình** | Theo nhãn quyền riêng tư trên App Store, SCRL **theo dõi người dùng cho quảng cáo**. App mình: miễn phí hoàn toàn, không tài khoản, ảnh không rời máy, chạy offline. Đó là lý do để người dùng chọn app mình, nên được giữ và nhấn mạnh khi clone |
| M4 | Bỏ qua lời chê **"đầy bộ nhớ máy"** của SCRL | App mình cũng lưu ảnh trong IndexedDB. Cần bài học: giới hạn dung lượng, dọn ảnh không dùng |
| M5 | Không có **tiêu chí nghiệm thu** cho việc "clone" | Không biết thế nào là "đã giống". Cần checklist so sánh từng màn với video tham chiếu |
| M6 | Không phân biệt **bản miễn phí / Premium** của SCRL | Video quay ở bản miễn phí sẽ thiếu tính năng Premium. Cần ghi rõ quay gì, ở bản nào |
| M7 | Nhận định "app mình hiện có" hơi lạc quan | Ví dụ S20 "Có" xem trước, nhưng chưa so tính năng "kiểm khoảng cách giữa khung" của SCRL. S3 "Có" nhưng chưa biết SCRL cho chọn những kích thước nào |

## Lỗi nhỏ

- Dòng 15 viết "nguồn ở mục 9", nhưng nguồn nằm ở **mục 10**.
- Bộ thông số gói Premium của SCRL có chỗ mâu thuẫn ($19.99 / $34.99) do trang App Store trả về nhiều vùng giá. Không ảnh hưởng vì app mình miễn phí, nhưng không nên ghi như số chắc chắn.
- Đề xuất "không làm video" lấy lý do "SCRL bị chê video". Lý do chính đáng hơn: phạm vi web app, hiệu năng điện thoại, dung lượng.

## Điểm làm được

- Nói rõ giới hạn: không cài được app, cần video. Có danh sách quay cụ thể (mục 7).
- Tách rõ "làm theo cách hoạt động" và "không sao chép tài sản" (tên, logo, template, sticker).
- Bảng so sánh với hiện trạng app mình giúp thấy nhanh phần thiếu.
- Hướng kết hợp hợp lý: editor theo SCRL + lưới profile theo Grids.

## Việc cần làm để có bản 2

1. **Hỏi chủ dự án: "Grids" là app nào?** Gửi ảnh icon hoặc link App Store. Sau đó làm lại bảng Grids chỉ với app đó.
2. Sửa E2 (giới hạn 20) và hạ mức tin cậy theo E3. Mức A chỉ dành cho thứ đã thấy trong ảnh / video.
3. Tách mục 4 thành "đã quan sát" và "đề xuất".
4. Thêm: rủi ro template / nội dung (M2), điểm khác biệt (M3), bài học dung lượng (M4), tiêu chí nghiệm thu (M5).
5. Khi có video: phân tích từng màn (bố cục, cử chỉ, hiệu ứng, thời gian chuyển cảnh), lúc đó mới là bản đủ để clone.
