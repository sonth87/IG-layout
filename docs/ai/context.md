# Bối cảnh cho AI assistant

Đọc file này trước khi làm bất cứ việc gì trong dự án.

## Dự án là gì

Web app (Next.js + PWA) miễn phí, giúp người dùng chỉnh ảnh, cắt ảnh, tạo layout (carousel, collage, ảnh chồng lớp, text, viền, hiệu ứng) cho Instagram. User **tự tải ảnh về và tự đăng** — app không đăng lên Instagram.

## Thứ tự đọc tài liệu

1. [product/brief.md](../product/brief.md) — đề bài, mục đích, những gì không làm.
2. [discussions/decisions.md](../discussions/decisions.md) — các quyết định đã chốt.
3. [roadmap/plan.md](../roadmap/plan.md) và [roadmap/checklist.md](../roadmap/checklist.md) — đang ở giai đoạn nào, việc tiếp theo là gì.
4. [roadmap/open-questions.md](../roadmap/open-questions.md) — những gì chưa có câu trả lời.
5. [architecture/overview.md](../architecture/overview.md) khi làm việc với code.

## Quy tắc làm việc

- **Giao tiếp bằng tiếng Việt.**
- **Không code khi giai đoạn hiện tại chưa cho phép code.** Kiểm tra giai đoạn trong [roadmap/plan.md](../roadmap/plan.md). (Từ 2026-10-14: Giai đoạn 1 — được code prototype.)
- Khi code: đọc [dev/README.md](../dev/README.md) (cấu trúc, quy ước) và `AGENTS.md` ở thư mục gốc (Next.js 16).
- **Không tự chốt quyết định.** Chỉ được đề xuất; chủ dự án chốt. Mục chưa chốt ghi trạng thái `Đề xuất`.
- **Cập nhật tài liệu sau mỗi buổi trao đổi:**
  - Quyết định mới → `discussions/decisions.md`
  - Nội dung trao đổi, phân tích → `discussions/YYYY-MM-DD-<chu-de>.md`
  - Tính năng thay đổi → `user/features.md` và `product/requirements.md`
  - Câu hỏi mới hoặc đã được trả lời → `roadmap/open-questions.md`
  - Tiến độ → `roadmap/checklist.md`
- Không đề xuất tính năng đăng lên Instagram, đăng nhập bắt buộc, hay server xử lý ảnh trừ khi chủ dự án đổi định hướng.
- Mục tiêu không phải cạnh tranh — không phân tích theo hướng kinh doanh, kiếm tiền trừ khi được hỏi.
