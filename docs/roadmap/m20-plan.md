# Kế hoạch M20 — Mở rộng thư viện

Ngày lập: 2026-10-17. Trao đổi: [2026-10-17-m20-mo-rong-thu-vien.md](../discussions/2026-10-17-m20-mo-rong-thu-vien.md). Quyết định: D-104 … D-110.
Định dạng tài sản: [architecture/asset-catalog.md](../architecture/asset-catalog.md). Việc giao Gemini: [ai/gemini-tasks.md](../ai/gemini-tasks.md).

## Mục tiêu

- Lâu dài **hơn 1.000 mục** trong thư viện, nhiều phong cách, nhiều bộ.
- **Ưu tiên nguồn ngoài** có giấy phép dùng được (D-106).
- Phần vẽ bằng code chỉ dành cho những gì nguồn ngoài không có: khung giấy xé / phim / polaroid qua bộ sinh tự nhiên (D-107), hình, widget.
- Thêm nhiều phông (viết tay, Nhật, kỳ ảo, khối đồ chơi, Tết…) và màn chọn phông mới.
- Duyệt theo **Loại** hoặc theo **Bộ**.
- Màn **Cảm ơn** (ghi công tự động) và màn **Giới thiệu**.

## Chia việc

| Mã | Việc | Ai | Phụ thuộc |
|---|---|---|---|
| **C1** | Định dạng danh mục, `validate.mjs`, `build-catalog.mjs`, kiểu TypeScript | Claude | — (**xong**) |
| **C2** | App đọc danh mục: tải gói khi cần, thêm sticker / khung / chất liệu / lớp phủ từ gói vào dự án (lưu như ảnh), offline | Claude | C1 |
| **C3** | Nút **Loại / Bộ** trong sheet thư viện; màn **Bộ sưu tập** (một bộ → mọi loại); bộ theo mùa lên đầu; tìm kiếm EN / VI trên cả gói | Claude | C2 |
| **C4** | **Khung có lớp trang trí + nhiều cửa sổ**: khung là một khối, ô ảnh theo `windows`, ảnh trang trí vẽ đè lên ô | Claude | C2 |
| **C5** | **Màn chọn phông mới**: xem trước bằng chữ của phần tử đang chọn hoặc câu ngẫu nhiên, tên phông nhỏ ở dưới, lọc theo ngôn ngữ và kiểu; tải phông từ danh mục | Claude | C1, G5, G6 |
| **C6** | **Màn Cảm ơn** (từ `credits` + thư viện code) và **màn Giới thiệu** | Claude | C2; nội dung Giới thiệu từ chủ dự án |
| **C7** | **Bộ sinh khung tự nhiên** (D-107): giấy xé, phim, polaroid / khung tranh; trang duyệt biến thể | Claude | C4; mép xé thật từ G4 (nếu có) |
| **C8** | Ghép từng đợt tài sản của Gemini vào app, kiểm thử e2e, merge, deploy | Claude | mỗi G |
| **G1** | Script xử lý ảnh `process.mjs` + trang duyệt `review.mjs` | Gemini | C1 |
| **G2** | Sticker đợt 1 (~200 mục) | Gemini | G1 |
| **G3** | Chất liệu nền (~40) + lớp phủ (~20) | Gemini | G1 |
| **G4** | Khung từ nguồn ngoài (~40) + mép giấy xé thật cho C7 | Gemini | G1 |
| **G5** | Phông (~150) | Gemini | C1 |
| **G6** | Câu xem trước phông, chữ mẫu widget | Gemini | — |
| **G7** | Nghiên cứu cho M21 (filter, hiệu ứng tĩnh, bút vẽ) | Gemini | — |

Thứ tự gợi ý cho Gemini: **G6 → G1 → G5 → G2 → G3 → G4 → G7**. G6 nhỏ, làm khởi động. G1 là nền cho G2 – G4.

## Các đợt

1. **Nền tảng:** C1 – C6, đồng thời G1, G5, G6.
2. **Nội dung đợt 1** (~300 mục): G2, G3, G4, C7, C8.
3. **Các đợt sau** tới hơn 1.000 mục: lặp G2 – G4 theo bộ (Tết, Trung thu, Noel, Du lịch…), mở rộng C7.

## Điều kiện xong của M20

- Thư viện có ít nhất 1.000 mục (tính cả vẽ bằng code), mỗi mục có giấy phép hợp lệ, `validate.mjs` OK.
- Sheet thư viện chuyển được Loại / Bộ; màn Bộ sưu tập chạy; tìm kiếm EN / VI.
- Khung có lớp trang trí và nhiều cửa sổ; ít nhất 3 bộ sinh khung tự nhiên, chủ dự án đã duyệt.
- Màn chọn phông mới, lọc được theo ngôn ngữ / kiểu, có ít nhất 150 phông.
- Màn Cảm ơn liệt kê đủ nguồn; màn Giới thiệu có nội dung.
- Dùng offline được với những gói đã mở; e2e đạt.

## Quy tắc phối hợp

- Gemini làm trên **nhánh riêng** (`gemini/<mã việc>`), chỉ sửa trong phạm vi được giao (xem từng việc), đẩy nhánh lên `origin`, **không merge vào `main`**.
- Claude xem lại, chạy `validate.mjs` + e2e, rồi merge.
- Mọi tài liệu viết bằng tiếng Việt; không nêu tên app tham khảo trong docs; không commit `refs/`.
