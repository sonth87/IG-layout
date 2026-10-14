# Kế hoạch (Roadmap)

> **Đang ở:** M5 — Text & Elements. M1–M4 xong 2026-10-14. Phạm vi MVP đã duyệt: toàn bộ plan (D-46).
> **Bản chạy thử:** https://ig-layout.vercel.app/ (tự deploy khi push lên `main`). Còn treo từ GĐ1: test trên điện thoại thật (để sau theo ý chủ dự án), chốt D-38. Từ GĐ0: duyệt phạm vi MVP, góp ý wireframe.
> **Việc tiếp theo:** xem mục "Việc tiếp theo" cuối file và [checklist.md](checklist.md).
> Cập nhật lần cuối: 2026-10-14.

## Tổng quan

```
GĐ0 Làm rõ yêu cầu ──▶ GĐ1 Prototype ──▶ GĐ2 MVP (M1 → M7) ──▶ v1.0 phát hành ──▶ GĐ3 Mở rộng
   (gần xong)          (đang làm)        (7 mốc nhỏ)
```

| Giai đoạn | Mục tiêu | Trạng thái |
|---|---|---|
| GĐ0 — Làm rõ yêu cầu | Chốt tính năng, phạm vi, kiến trúc, wireframe | Gần xong |
| GĐ1 — Prototype kỹ thuật | Chứng minh phần rủi ro nhất chạy được trên điện thoại thật | Đang làm |
| GĐ2 — MVP | Bản dùng được đầy đủ luồng chính, chia 7 mốc (M1–M7) | Chưa bắt đầu |
| GĐ3 — Mở rộng | Các tính năng mức "Sau" / "Cân nhắc" | Chưa bắt đầu |

Không đặt ngày cố định; mỗi mốc có **điều kiện hoàn thành** rõ ràng. Thứ tự các mốc có thể đổi nếu chủ dự án muốn.

---

## Giai đoạn 0 — Làm rõ yêu cầu

**Mục tiêu:** chốt tính năng, phạm vi MVP, kiến trúc và giao diện.

**Đã xong:** phân tích đề bài; các quyết định D-01 → D-35; tài liệu `docs/`; wireframe v2 (19 màn hình).

**Còn lại:**
- Chốt phạm vi MVP (mục "Phạm vi MVP" bên dưới — **chờ chủ dự án duyệt**, Q-15, Q-30).
- Chốt kiến trúc D-06 (100% client) và D-07 (canvas nhiều slide) — prototype đã làm theo hướng này (Q-11, Q-12).
- Góp ý & chốt wireframe.
- Xác minh lại thông số Instagram (tỉ lệ, số slide tối đa, vùng an toàn Story).

**Xong khi:** phạm vi MVP được duyệt và mọi tính năng MVP ở trạng thái `Đã chốt`.

---

## Giai đoạn 1 — Prototype kỹ thuật

**Mục tiêu:** chứng minh các phần rủi ro nhất chạy được, nhất là trên iOS Safari.

**Đã xong (2026-10-14):** project Next.js 16 xuất tĩnh + manifest PWA; nhập ảnh (EXIF, thu nhỏ); canvas nhiều slide Konva (kéo, scale, xoay, lớp, thêm / bớt slide); undo / redo; xuất từng slide JPEG + ZIP / từng ảnh / share sheet; kiểm tra tự động trên Chromium.

**Còn lại:**
- Thử trên điện thoại thật: cử chỉ chạm, cuộn dải slide, share sheet "Save images", bộ nhớ khi nhập 20 ảnh.
- Deploy thử (HTTPS) để test PWA và share sheet.
- Quyết định giữ Konva hay đổi Fabric (D-38).

**Xong khi:** luồng chọn ảnh → kéo → xuất → lưu vào Ảnh chạy ổn trên 1 iPhone và 1 Android; D-38 được chốt.

---

## Giai đoạn 2 — MVP

### Phạm vi MVP (đã duyệt 2026-10-14)

Lấy từ các mục gắn nhãn **MVP** trong [features.md](../user/features.md) và [layouts.md](../user/layouts.md):

| Có trong MVP | Để sau MVP |
|---|---|
| 3 loại project: Post, Story, Grid | Mỗi ô Grid là một carousel |
| Nhiều project, lưu trên máy, "Project của tôi" | Xuất / nhập file project |
| Layout: khung đơn, lưới chia ô, scrapbook, khung trang trí, panorama, seamless; gợi ý theo số ảnh; tự điền ảnh; đổi chỗ ảnh | Kéo đường chia ô; đổi template giữ ảnh; template tự tạo; slide chữ; zoom sequence |
| Biến đổi phần tử, căn chỉnh / hít, undo / redo | Nhóm phần tử |
| Crop, nắn thẳng, mask theo hình | Chỉnh phối cảnh |
| Chỉnh màu cơ bản (sáng, tương phản, highlights, shadows, bão hòa, vibrance, nhiệt độ, tint) + vignette, grain, fade | HSL, curves, color grading, sharpen, clarity |
| 5 filter thử nghiệm, cường độ, áp cho tất cả (có xác nhận) | Thêm filter; preset tự lưu; LUT |
| Text (font Google có tiếng Việt, màu, viền, bóng, nền chữ), hình khối, icon, vài khung | Sticker, material, chữ uốn cong |
| Viền, nền (màu, gradient, blur fill) | Nền texture |
| Xem trước kiểu Instagram, tải về (share sheet / ZIP / từng ảnh), mẹo đăng | — |
| PWA cài được + chạy offline; theme sáng / tối; EN + VI | — |

### Các mốc (milestones)

Các mốc là **gói việc nối tiếp nhau** để chia nhỏ công việc — không bắt buộc mỗi mốc ra một bản dùng được (D-47). Bản dùng được là **v1.0** sau M7.
Thiết kế kỹ thuật chung cho mọi mốc: [architecture/editor-model.md](../architecture/editor-model.md).

| Mốc | Nội dung | Điều kiện xong (kỹ thuật) |
|---|---|---|
| **M1 — Nền tảng** | Lưu project vào IndexedDB (ảnh + doc + lịch sử); màn "Project của tôi"; service worker offline; Settings (theme, ngôn ngữ, dung lượng); khung đa ngôn ngữ EN / VI; deploy tự động | Tắt app mở lại vẫn sửa tiếp được; dùng offline; đổi theme / ngôn ngữ được |
| **M2 — Editor cốt lõi** | Mô hình phần tử chung (ảnh, text, hình); thanh công cụ theo ngữ cảnh; cử chỉ pinch / xoay 2 ngón; căn chỉnh & hít; crop, nắn thẳng, mask; viền & nền; quản lý slide (thêm / xóa / đổi thứ tự) | Làm được một carousel scrapbook hoàn chỉnh chỉ bằng tay |
| **M3 — Layout & template** | Template định nghĩa bằng JSON; bộ template đầu tiên (khung đơn, lưới, scrapbook, panorama, seamless); gợi ý theo số ảnh; tự điền ảnh; đổi chỗ ảnh | Chọn 5 ảnh → chọn template → xuất được ngay |
| **M4 — Màu & filter** | Pipeline WebGL; công cụ Adjust (✓ / ✕); 5 filter; cường độ; áp cho tất cả có xác nhận; giữ để so sánh | Chỉnh màu mượt trên điện thoại tầm trung; export giống preview |
| **M5 — Text & Elements** | Công cụ text (font tiếng Việt tự host, màu, viền, bóng, nền); hình khối, icon, khung cơ bản | Text tiếng Việt xuất ra ảnh đúng font |
| **M6 — Story & Grid** | Project Story (9:16, vùng an toàn, nhiều khung); project Grid (3 × N, thứ tự đăng, bù khe hở, tên file theo thứ tự đăng) | Xuất Grid 3 × 3 đăng thử khớp trên profile |
| **M7 — Xuất & hoàn thiện** | Xem trước kiểu Instagram (carousel / profile); hoàn thiện màn Export; hiệu năng (20 ảnh, ảnh lớn); khả năng truy cập; hướng dẫn sử dụng; trang Credits | Checklist phát hành bên dưới đạt hết |

### Checklist phát hành v1.0
- Chạy ổn trên iOS Safari (≥ 2 đời máy), Android Chrome, desktop Chrome / Safari.
- Cài PWA, dùng offline, dữ liệu không mất sau 1 tuần (đã cài app).
- Ảnh xuất đúng thông số Instagram; đăng thử thật mỗi loại project.
- Đủ bản dịch EN / VI; trang Credits đủ giấy phép font / icon.

---

## Giai đoạn 3 — Mở rộng (sau v1.0)

Thứ tự sẽ quyết định sau khi có phản hồi người dùng. Danh sách ứng viên: thêm filter & preset tự lưu, sticker & material, chỉnh màu nâng cao, kéo đường chia ô, đổi template giữ ảnh, template tự tạo, mỗi ô Grid là carousel, zoom sequence, slide chữ, bản desktop tối ưu.

---

## Quy trình làm việc

1. **Trước khi bắt đầu một mốc:** chi tiết hóa việc của mốc đó trong [checklist.md](checklist.md); mọi câu hỏi phát sinh ghi vào [open-questions.md](open-questions.md).
2. **Trong khi làm:** mỗi việc xong → tick checklist; quyết định mới → [decisions.md](../discussions/decisions.md).
3. **Kết thúc mốc:** kiểm tra điều kiện hoàn thành (có thử trên điện thoại), cập nhật mục "Đang ở" ở đầu file này, commit + push.
4. Code theo quy ước trong [dev/README.md](../dev/README.md).

## Việc tiếp theo

1. **M5 — Text & Elements** (tiếp theo), rồi M6 → M7.
2. Thử trên điện thoại thật qua link Vercel khi chủ dự án có thời gian; chốt D-38 (Konva).
