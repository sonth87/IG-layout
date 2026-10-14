# 2026-10-14 — Đánh giá UX / tương tác (vai tester + người dùng)

> Người đánh giá: AI (Claude), đứng ngoài vai trò đội phát triển. Đối tượng đọc: đội phát triển.
> Bản đánh giá: https://ig-layout.vercel.app/ — commit `4493608` (sau M7).
> Cách làm: dùng thử như người dùng trên khung điện thoại 390 × 844 (Chromium, giả lập cảm ứng thật qua CDP), chụp màn hình, đo hành vi ở các điểm nghi vấn; kết hợp đọc code. **Chưa thử trên iPhone / Android thật** — cảm giác chạm, hiệu năng, share sheet thật cần xác nhận lại.

## Tóm tắt

App đã làm được **phần lớn những gì một người làm carousel cần**: 3 loại project, 25+ layout, chỉnh ảnh khá đầy đủ, chữ tiếng Việt, xuất đúng kích thước, lưu tự động, chạy offline. Phần "xuất ra file" và "dữ liệu" chắc chắn.

Điểm yếu nằm ở **tương tác trực tiếp trên canvas khi dùng điện thoại** — đúng chỗ người dùng ở lâu nhất. Ba vấn đề sẽ làm người dùng mới bối rối ngay trong 1 phút đầu:

1. **Vuốt để xem slide khác lại kéo lệch ảnh nền** (đã đo: vuốt ngang trên canvas → ảnh panorama dịch −769 px, dải slide không cuộn).
2. **Đổi layout xoá mất chữ / hình / icon đã thêm** mà không báo.
3. **Thanh công cụ ảnh có 10 nút nhưng chỉ hiện 6** — Nhân bản, Xoá, Lên / Xuống bị khuất, không có dấu hiệu cuộn.

Đánh giá chung: **chưa sẵn sàng v1.0**. Sửa nhóm P0 + vài mục P1 (khoảng 1 mốc nhỏ) là app dùng thoải mái.

## App làm được gì (góc nhìn người dùng)

| Việc | Có | Ghi chú |
|---|---|---|
| Tạo Post / Story / Grid | ✓ | Màn tạo rõ ràng, có hình minh hoạ số ô |
| Chọn layout có xem trước bằng ảnh thật | ✓ | Điểm mạnh — thấy ngay kết quả |
| Carousel liền mạch, ảnh vắt qua slide | ✓ | Đúng ý tưởng cốt lõi |
| Cắt, nắn thẳng, mask, khung, viền, bóng | ✓ | |
| Chỉnh màu 13 thông số, 5 filter, áp cho tất cả | ✓ | Có xác nhận, 1 bước hoàn tác |
| Chữ tiếng Việt, 6 font | ✓ | Dấu hiển thị đúng |
| Hình khối, icon, cuộn film | ✓ | Ít (17 icon), chưa có sticker |
| Xem trước kiểu Instagram, xuất ZIP / lưu ảnh | ✓ | Grid ghép đúng thứ tự |
| Tự lưu, nhiều project, offline, sáng / tối, EN / VI | ✓ | |

## Điểm mạnh

- **Luồng chính ngắn:** chọn loại → chọn ảnh → chọn layout → xuất, 4 bước.
- **Màn chọn layout** dùng chính ảnh của người dùng để xem trước; gợi ý theo số ảnh.
- **Hoàn tác đáng tin:** công cụ có ✕ / ✓, kéo slider không làm "rác" lịch sử; một thao tác = một bước.
- **Xuất đúng chuẩn:** kích thước chính xác, tên file theo thứ tự đăng, Grid tự đảo thứ tự, mẹo đăng theo loại.
- **Không cần tài khoản, ảnh không rời máy** — điểm cộng lớn về niềm tin.
- **Nhất quán thị giác:** thanh công cụ dưới, bottom sheet, theme tối đẹp.

## Vấn đề

Mức độ: **P0** = chặn / gây mất dữ liệu / bối rối ngay; **P1** = khó chịu thường xuyên; **P2** = đánh bóng.

### P0

**UX-01 · Vuốt trên canvas kéo ảnh thay vì cuộn slide** — *đã tái hiện*
- Tái hiện: Post, layout "Panorama + 3 ảnh nổi" → vuốt ngang vùng không có ảnh nổi.
- Kết quả: ảnh nền bị kéo lệch 769 px (lộ nền trắng), được chọn; dải slide không cuộn. Với layout "mỗi slide 1 ảnh" cũng vậy vì mọi chỗ đều là ảnh.
- Ảnh hưởng: người dùng không có cách tự nhiên để xem slide 2, 3…; dễ làm hỏng bố cục mà không biết (phải nhớ bấm Hoàn tác).
- Đề xuất: (a) chỉ kéo được phần tử **đã được chọn** — chạm lần đầu = chọn, vuốt khi chưa chọn = cuộn; (b) ảnh nền phủ cả canvas tự **khoá**; (c) thêm thanh điều hướng slide (thumbnail) như wireframe.

**UX-02 · Đổi layout xoá chữ / hình / icon đã thêm** — *đã tái hiện*
- Tái hiện: thêm chữ → Layout → chọn layout khác.
- Kết quả: 5 phần tử → 4, chữ mất, không có thông báo (chỉ cứu được bằng Hoàn tác nếu người dùng nghĩ ra).
- Đề xuất: giữ nguyên các phần tử không phải ảnh khi đổi layout; hoặc hộp xác nhận "Layout mới sẽ thay toàn bộ bố cục".

**UX-03 · Thanh công cụ ảnh bị tràn, nút quan trọng bị khuất** — *đã đo*
- Ảnh có 10 nút (640 px) trên vùng 374 px → chỉ thấy 6: Thay, Cắt, Chỉnh màu, Filter, Hình dạng, Kiểu. **Xoá, Nhân bản, Lên / Xuống ở ngoài màn hình**, không có dấu hiệu cuộn. Tiếng Việt còn bị cắt chữ ("Hình dạng").
- Đề xuất: giữ ~5 nút thường dùng + nút "⋯ Thêm"; hoặc 2 hàng; hoặc làm mờ mép phải để báo còn nữa. Đưa Xoá / Nhân bản lên thanh nổi cạnh vùng chọn (như wireframe).

### P1

**UX-04 · Không thấy tổng thể carousel, không có điều hướng slide.** Dải slide chỉ xem được bằng cuộn (vốn đã bị UX-01 chặn). Wireframe có dải thumbnail nhưng chưa làm. Phần tử mới / ảnh thêm vào rơi vào "slide đang xem" — người dùng không biết slide nào đang được coi là hiện tại ngoài số "1 / 3" nhỏ.

**UX-05 · Lãng phí gần nửa màn hình dưới canvas.** Canvas giới hạn theo 86 % chiều ngang nên trên điện thoại (Post 4:5) phía dưới trống ~40 % chiều cao. Có thể dùng cho dải thumbnail (UX-04) hoặc phóng canvas lớn hơn.

**UX-06 · Không phóng to vùng làm việc; tay nắm nhỏ.** Không pinch-zoom được canvas để chỉnh chi tiết nhỏ (chữ nhỏ, khung nhỏ). Tay nắm của khung chọn 18 px — dưới mức khuyến nghị 44 px cho ngón tay.

**UX-07 · Pinch / xoay hai ngón chỉ áp cho phần tử đã chọn.** Đặt hai ngón lên một ảnh chưa chọn → không có gì xảy ra. Người dùng quen Instagram / Canva sẽ thử ngay và tưởng lỗi.

**UX-08 · Canvas nhảy kích thước khi mở công cụ.** Mở Kiểu chữ: canvas co 419 → 371 px. Phần tử đang sửa có thể bị đẩy xa / che dưới bottom sheet. Nên giữ tỉ lệ và cuộn để phần tử đang sửa luôn nằm trong vùng thấy được.

**UX-09 · Ô lưới vẫn có tay nắm co giãn và xoay.** Ô layout lưới được thiết kế "kéo = dịch ảnh trong ô" nhưng khung chọn vẫn cho kéo góc / xoay → phá lưới. Nên ẩn tay nắm cho ô lưới (hoặc chỉ cho co giãn ảnh bên trong).

**UX-10 · Khó chọn phần tử bị che; không có bảng lớp.** Không chạm được ảnh nằm dưới ảnh khác; chạm vùng trống lại chọn ảnh nền (không bỏ chọn được bằng chạm). Lên / Xuống chỉ đi 1 lớp mỗi lần. Đề xuất: danh sách lớp, hoặc chạm lặp để chọn lần lượt các lớp chồng nhau.

**UX-11 · Không có tín hiệu "đã lưu".** Lưu tự động là tốt, nhưng người dùng không biết; nút Quay lại cũng không nói gì. Thêm chữ nhỏ "Đã lưu" ở thanh trên.

**UX-12 · Sửa chữ phải qua nút "Sửa chữ".** Chạm đúp vào chữ không mở ô nhập — thói quen phổ biến. Chữ mới mặc định trắng + bóng: trên nền sáng gần như không đọc được.

**UX-13 · "Chạm đúp để đặt lại" thanh trượt có thể không chạy trên điện thoại** (đang dùng sự kiện double-click). Nên có nút đặt lại rõ ràng cạnh giá trị.

**UX-14 · Story vẫn gợi ý layout "liền mạch".** Story chuyển khung bằng chạm, không vuốt liền → layout seamless gây hiểu nhầm. Lọc khỏi Story.

### P2

- **UX-15** Đổi tên / xoá project dùng hộp thoại hệ thống (prompt / confirm) — lệch phong cách app, trên iOS trông thô.
- **UX-16** File xuất luôn tên `post_01…` cho mọi project → ZIP / file tải về trùng tên giữa các project. Nên kèm tên project.
- **UX-17** Không có hướng dẫn lần đầu; nút "?" dễ bị bỏ qua. Gợi ý 2–3 mẹo nổi lúc mở editor lần đầu (vuốt, chọn, ✓ / ✕).
- **UX-18** Thư viện còn mỏng: 5 filter, 17 icon, chưa có sticker / material (đúng kế hoạch, nhưng người dùng sẽ thấy ít).
- **UX-19** "Giữ để so sánh" là nút nhỏ trong sheet; quen thuộc hơn là giữ trực tiếp trên ảnh.
- **UX-20** HEIC không đọc được trên trình duyệt ngoài Safari — chỉ báo lỗi; nên hướng dẫn cách đổi định dạng.
- **UX-21** Thông số Instagram (vùng an toàn Story 250 / 340 px, khe lưới 12 px) là ước lượng — cần đo thật (đã có trong device-test).
- **UX-22** Không chỉnh được chất lượng / dung lượng ảnh xuất; không xuất riêng 1 slide.

## Đánh giá theo luồng

| Luồng | Mức | Nhận xét |
|---|---|---|
| Tạo project + chọn ảnh | Tốt | Rõ, ít bước |
| Chọn layout | Tốt | Xem trước bằng ảnh thật; đổi thứ tự ảnh hơi khó đoán (chạm 2 ảnh) |
| Sắp xếp trên canvas (điện thoại) | **Kém** | UX-01, 06, 07, 09, 10 |
| Chỉnh ảnh (crop, màu, filter) | Khá | Mạnh về tính năng; thanh công cụ tràn (UX-03) |
| Chữ & thành phần | Khá | Thiếu chạm đúp để sửa, màu mặc định |
| Xuất & đăng | Tốt | Xem trước Instagram + mẹo đăng hữu ích |
| Quản lý project, dữ liệu | Tốt | Thiếu tín hiệu đã lưu |

## Đề xuất thứ tự sửa trước v1.0

1. UX-01 (vuốt / chọn / khoá nền) + UX-04 (dải thumbnail, dùng luôn khoảng trống UX-05).
2. UX-02 (giữ chữ khi đổi layout).
3. UX-03 (thanh công cụ gọn + thanh nổi).
4. UX-09, UX-07, UX-06 (ô lưới, pinch, tay nắm lớn).
5. UX-11, UX-12, UX-13, UX-14 (nhỏ, nhanh).
6. Sau đó thử máy thật theo [device-test.md](../roadmap/device-test.md).
