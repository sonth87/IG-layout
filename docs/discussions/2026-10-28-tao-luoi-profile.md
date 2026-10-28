# 2026-10-28 — Màn tạo dự án "Lưới profile": xem trước, bù khe, số ô tự chọn

## Góp ý của chủ dự án
1. Các ô xem trước lưới quá nhỏ → cho tràn ra cho đẹp.
2. "Compensate profile gaps" khó hiểu — user không hình dung được → có ảnh xem trước, hoặc xem trước giống trên Instagram thật.
3. Đang bắt chọn theo hàng (3 / 6 / 9… ô) → cho tự chọn số ô, ví dụ tối thiểu 2, tối đa 16.

## Hiện trạng (code)
- Lưới = 3 cột × `rows` hàng (`gridShape`, `lib/project/layout.ts`), `slideCount = rows × 3`, tối đa 8 hàng (24 ô).
- Bù khe: `GRID_GAP` = 12 px (khổ xuất) giữa các ô khi bật.

## Đề xuất
**A. Xem trước như trang cá nhân Instagram thật, tràn hết chiều ngang**
- Đầu trang giả lập profile (avatar, tên, số bài / người theo dõi, thanh tab lưới), rồi lưới 3 cột tỉ lệ 3:4 với khe mảnh như IG.
- Các ô mới được lấp bằng **một ảnh mẫu thật** cắt ra theo ô, có số thứ tự đăng ở góc; các ô còn lại là **"bài cũ của bạn"** (ảnh mẫu khác, mờ đi) để thấy bức ảnh lớn nằm ở đâu.
- Đổi số ô / bật tắt bù khe → xem trước đổi ngay.

**B. Bù khe dễ hiểu hơn**
- Đổi chữ: "Nối liền qua khe" + 1 dòng giải thích: *Instagram chèn khe trắng giữa các ô. Bật: ảnh như nhìn qua ô cửa sổ, đường thẳng nối liền. Tắt: giữ trọn từng ô, nhưng đường chéo lệch nhẹ ở khe.*
- Kèm hình minh hoạ nhỏ trước / sau (hai ô có một đường chéo đi qua khe), và xem trước chính (A) đổi theo.

**C. Tự chọn số ô 2 → 24 (hoặc 16)**
- Bộ đếm theo **ô** thay vì hàng. Số ô không chia hết cho 3 → hàng cuối thiếu, ảnh lớn có dạng "các hàng đủ + một hàng lửng bên trái" (đúng như Instagram sắp: bài mới nhất ở góc trên trái).
- Cảnh báo khi không phải bội của 3: *các bức lưới cũ trên trang của bạn sẽ bị lệch cột* (Instagram đẩy mọi bài cũ đi 1–2 ô), và bức này cũng sẽ lệch nếu sau đó đăng số bài không chia hết cho 3.
- Thứ tự đăng giữ như cũ (ô cuối đăng trước).

## Chủ dự án chốt
- **Tối đa 24 ô** (tối thiểu 2).
- **Có cảnh báo**, nhưng chỉ để biết — không chặn, không đổi lựa chọn của user.

## Đã làm
- Mô hình: lưới 3 cột, `slideCount` bất kỳ 2–24, `rows = ceil(slideCount / 3)`; hàng cuối có thể lửng (`setGridCount`, `lib/project/slides.ts`). Phần trống cuối hàng lửng trong editor được tô mờ như vùng ngoài khung (không xuất).
- Màn "Tạo mới" → Lưới: nút nhanh 3 / 6 / 9 / 12 + bộ đếm từng bài; dòng mô tả "2 hàng × 3 + 1 ô"; ghi chú vàng khi không chia hết cho 3; **xem trước giả lập trang cá nhân Instagram** (avatar, số bài, tab, lưới 3:4 khe mảnh, ảnh mẫu cắt theo ô có số thứ tự đăng, "bài cũ của bạn" mờ); "Nối liền qua khe" có giải thích + hình bật / tắt (đường chéo nối liền / lệch ở khe).
- Bảng "Lưới" trong editor: đếm theo bài (2–24), cùng ghi chú và hình minh hoạ.
- e2e m6 / m7 cập nhật (chọn 6 bài, 10 bài → 3 hàng + 1, ghi chú hiện, quay lại 9).
