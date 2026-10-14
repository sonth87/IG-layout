# Tài liệu dự án — IG Layout

> Nguồn sự thật duy nhất (single source of truth) cho định hướng dự án.
> Mọi quyết định, thay đổi yêu cầu, kết quả trao đổi đều phải được cập nhật vào đây **trước** khi code.

## Trạng thái hiện tại

**Giai đoạn 0 — Làm rõ yêu cầu.** Chưa có code. Đang trao đổi để chốt tính năng.

## Cấu trúc

| Thư mục | Dành cho | Nội dung |
|---|---|---|
| [product/](product/) | Mọi người | Đề bài, mục đích, mong muốn, yêu cầu, phạm vi |
| [discussions/](discussions/) | Mọi người | Nhật ký trao đổi, phân tích, đánh giá; nhật ký quyết định |
| [user/](user/) | Người dùng cuối | Tính năng & chức năng (góc nhìn người dùng), hướng dẫn sử dụng |
| [design/](design/) | Mọi người | Wireframe, mockup, định hướng giao diện |
| [architecture/](architecture/) | Dev / AI | Kiến trúc tổng thể, mô hình dữ liệu, ràng buộc kỹ thuật Instagram |
| [dev/](dev/) | Developer | Tech stack, quy ước code, cách chạy dự án |
| [ai/](ai/) | AI assistant | Bối cảnh & quy tắc làm việc khi AI tham gia dự án |
| [roadmap/](roadmap/) | Mọi người | Kế hoạch theo giai đoạn, checklist, câu hỏi còn mở |

## Quy ước

- Viết bằng tiếng Việt; thuật ngữ kỹ thuật giữ tiếng Anh khi cần.
- Mỗi mục tính năng/quyết định có trạng thái: `Đề xuất` → `Đã chốt` → `Đang làm` → `Xong` (hoặc `Bỏ`).
- Quyết định quan trọng ghi vào [discussions/decisions.md](discussions/decisions.md) kèm lý do.
- Câu hỏi chưa có câu trả lời ghi vào [roadmap/open-questions.md](roadmap/open-questions.md).
