# Kiến trúc tổng thể

> Trạng thái: **Đề xuất** — chưa chốt, chưa code.

## Nguyên tắc

1. **Client-only.** Mọi xử lý ảnh chạy trong trình duyệt. Ảnh không gửi lên server. Next.js dùng để build và phục vụ trang tĩnh, không cần backend.
2. **Một mô hình canvas cho mọi layout** (bên dưới).
3. **Tách bản xem trước và bản xuất.** Lúc chỉnh hiển thị ảnh thu nhỏ để chạy mượt; khi xuất mới render từ ảnh gốc.
4. **PWA, ưu tiên offline.** Sau lần tải đầu, app dùng được không cần mạng.
5. **Mobile-first.** Thiết kế cho cảm ứng (pinch, xoay 2 ngón, chạm giữ), bottom toolbar / bottom sheet; hiệu năng đo trên điện thoại tầm trung.
6. **Chỉnh màu không phá hủy (non-destructive).** Ảnh gốc giữ nguyên; các thông số chỉnh và filter là dữ liệu gắn với phần tử, áp lại khi render.

## Mô hình canvas nhiều slide

```
┌─────────┬─────────┬─────────┬─────────┐
│ slide 1 │ slide 2 │ slide 3 │ slide 4 │   ← canvas rộng = N × slideWidth
│   [ảnh panorama trải qua nhiều slide] │
│      [text]    [ảnh nhỏ vắt qua ranh giới]
└─────────┴─────────┴─────────┴─────────┘
        Xuất: cắt canvas theo ranh giới slide → N file ảnh
```

- **Project** = loại (Post / Story / Grid) + tỉ lệ khung + số slide + danh sách phần tử + nền.
- **Phần tử** (ảnh, text, hình, sticker) có vị trí, kích thước, góc xoay, thứ tự lớp, độ mờ… theo tọa độ của toàn canvas.
- **Template layout** = tập phần tử "ô chứa ảnh" đặt sẵn, **định nghĩa bằng dữ liệu (JSON)**; về bản chất vẫn là phần tử trên canvas. Thêm template mới không cần sửa code.
- **Lưới profile** = cùng mô hình nhưng canvas trải theo 2 chiều (3 cột × N hàng).

Như vậy panorama, collage, scrapbook và carousel liền mạch không cần code riêng từng chế độ.

## Lịch sử thay đổi (History)

Mô hình **"bản nháp → xác nhận"**:

```
State đã xác nhận ──mở công cụ──▶ Bản nháp (draft) ──kéo slider──▶ cập nhật preview (KHÔNG ghi history)
       ▲                               │
       │                    ┌──────────┴──────────┐
       │                 Áp dụng ✓              Hủy ✕
       │                    │                     │
       └── ghi 1 bước ◀─────┘          bỏ draft ──┘ (về state cũ)
```

- History lưu các **state đã xác nhận** của project (danh sách phần tử + thông số), **không lưu ảnh / pixel**. Mỗi bước đã đủ thông số để dựng lại ảnh ở đúng bước đó → undo / redo là hiển thị ngay. Lịch sử được lưu cùng project trong IndexedDB.
- Undo / redo = chuyển qua lại giữa các state đã xác nhận.
- Mở lại công cụ → đọc thông số từ state hiện tại → hiển thị đúng giá trị trước đó.
- Thao tác kéo / pinch / xoay phần tử: ghi một bước khi kết thúc cử chỉ.
- **Không giới hạn số bước.** Mỗi bước lưu dạng **patch** (chỉ phần thay đổi, ví dụ dùng Immer patches) thay vì chụp lại toàn bộ state, nên lịch sử dài vẫn nhẹ.
- "Áp dụng cho tất cả ảnh" = **một** bước history duy nhất cho mọi ảnh bị ảnh hưởng.

## Các khối chức năng chính

| Khối | Trách nhiệm |
|---|---|
| Import | Đọc file, decode HEIC, xử lý EXIF orientation, tạo ảnh thu nhỏ để xem trước |
| Editor state | Trạng thái project, bản nháp, lịch sử undo/redo |
| Renderer | Vẽ canvas tương tác (chọn, kéo, xoay, scale) |
| Effects | Filter / chỉnh màu (dự kiến dùng WebGL) |
| Exporter | Render từng slide từ ảnh gốc, encode JPEG, đặt tên, đóng gói ZIP / chia sẻ |
| Storage | Lưu project, lịch sử, ảnh gốc trên máy — xem [storage.md](storage.md) |
| PWA shell | Service worker, manifest, cache offline |

## Ràng buộc kỹ thuật cần thiết kế quanh

- iOS Safari giới hạn diện tích canvas (~16,7 triệu pixel) → **export từng slide một**, không render cả canvas lớn một lần.
- Bộ nhớ trên mobile hạn chế → dùng ảnh thu nhỏ khi chỉnh sửa, giải phóng bitmap khi không dùng.
- Phải đợi font tải xong trước khi export.
- Thông số Instagram: [instagram-specs.md](instagram-specs.md).

## Chưa chốt

Thư viện canvas, quản lý state, cách làm filter: xem [dev/tech-stack.md](../dev/tech-stack.md).
