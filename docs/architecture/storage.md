# Lưu trữ cục bộ

> Trạng thái: **Đã chốt IndexedDB** (D-20). OPFS chỉ là phương án dự phòng cho ảnh nếu IndexedDB chậm. Yêu cầu: giữ project + lịch sử sau khi đóng app / tải lại trang — **nên có, không bắt buộc**.
> Mọi dữ liệu nằm trên máy người dùng, không gửi lên server.

## Đã cài đặt (M1)

DB `ig-layout` (v1), 3 store: `projects` (thông tin hiển thị + ảnh thu nhỏ + dung lượng), `states` (doc + lịch sử `past` / `future`), `assets` (ảnh đã thu nhỏ, index theo `projectId`). Code: `src/lib/storage/`.
Lưu ý: khi lưu, các bước lịch sử được ghi riêng rẽ (không còn chia sẻ phần chung như trong bộ nhớ) — cần theo dõi dung lượng nếu lịch sử rất dài.

## Cần lưu gì

| Dữ liệu | Đặc điểm | Dung lượng |
|---|---|---|
| Ảnh gốc | File nhị phân lớn, không bao giờ sửa | Vài MB / ảnh |
| Ảnh thu nhỏ (preview) | Tạo lại được từ ảnh gốc | Nhỏ |
| State project | JSON: phần tử, vị trí, thông số chỉnh, filter | Vài KB – vài trăm KB |
| Lịch sử | Danh sách patch (phần thay đổi) | Nhỏ, tăng dần theo số bước |

Không có nhu cầu truy vấn phức tạp (lọc, join, thống kê). Chủ yếu là: lưu / đọc theo ID project.

## Các phương án

### A. SQLite (chạy trong trình duyệt bằng WASM)

- **Có làm được:** bản SQLite WASM chính thức, lưu dữ liệu xuống OPFS.
- **Nhược điểm:**
  - Thêm khoảng 1 MB WASM phải tải về.
  - Một số chế độ lưu OPFS cần header COOP / COEP, dễ xung đột với cấu hình host tĩnh và thư viện bên thứ ba.
  - Không hợp để chứa ảnh lớn; ảnh vẫn nên để ngoài.
  - Thế mạnh của SQLite là truy vấn SQL — dự án này gần như không dùng tới.
- **Kết luận:** dùng được nhưng **thừa** so với nhu cầu.

### B. IndexedDB (có sẵn trong mọi trình duyệt) — **đề xuất**

- Có sẵn, không phải tải thêm gì.
- Lưu được cả JSON lẫn file ảnh (Blob).
- Dùng qua thư viện nhỏ (Dexie hoặc idb) cho dễ code.
- Đủ cho mọi nhu cầu ở trên.

### C. OPFS (Origin Private File System) — bổ sung cho ảnh gốc

- Hệ thống file riêng của trang web, đọc / ghi file lớn nhanh hơn IndexedDB.
- Có thể dùng cho ảnh gốc; dữ liệu còn lại để trong IndexedDB.
- Nếu thử nghiệm thấy IndexedDB đủ nhanh thì không cần.

## Đề xuất

- **IndexedDB** cho state project + lịch sử (+ ảnh, nếu đủ nhanh).
- **OPFS** cho ảnh gốc nếu IndexedDB chậm khi thử trên điện thoại.
- **Không dùng SQLite.**

## Ảnh lưu ở đâu? Mở lại có xem được không?

- Trên web, app **không giữ được đường dẫn** tới ảnh trong thư viện điện thoại. Khi user chọn ảnh, trình duyệt chỉ đưa cho app **một bản sao** của file.
  → Muốn mở lại project mà vẫn thấy ảnh, app **phải tự lưu bản sao ảnh** vào IndexedDB.
- Khi đã lưu: mở lại app (kể cả sau khi tắt máy) → **xem và sửa tiếp được đầy đủ**, kể cả khi user đã xóa ảnh gốc khỏi thư viện điện thoại.
- Ảnh chỉ mất khi: user xóa project, xóa dữ liệu trình duyệt, dùng chế độ ẩn danh, hoặc trình duyệt tự dọn (xem rủi ro bên dưới).

### Dung lượng

- Trình duyệt hiện đại cho mỗi trang web dùng một **phần đáng kể dung lượng trống** của máy (thường tính bằng hàng GB trên điện thoại còn trống nhiều). *Con số cụ thể trên iOS cần xác minh khi prototype.*
- Ước tính: ảnh điện thoại khoảng 3–6 MB → project 20 ảnh khoảng **60–120 MB**. Mười project khoảng 1 GB.
- **Đã chốt (D-24):** khi nhập ảnh, app thu nhỏ về cạnh dài tối đa khoảng **4000px**, nén chất lượng cao → khoảng 1–2 MB / ảnh. Đủ để xuất 1080px kể cả khi phóng to ảnh khá nhiều.
  - Ảnh nhỏ hơn mức này giữ nguyên kích thước.
  - Ảnh có nền trong suốt (PNG) giữ định dạng hỗ trợ trong suốt.
  - **Ảnh gốc không được lưu**; bản đã thu nhỏ trở thành "ảnh gốc" của project. Chỉnh sửa vẫn không phá hủy so với bản này.
  - **Ảnh panorama** (tỉ lệ > ~2:1): chỉ giới hạn **cạnh ngắn ~2400px**, cạnh dài giữ theo tỉ lệ — để không bị mờ khi trải nhiều slide (10 slide cần ~10800px chiều ngang). Đã chốt (Q-28).

### Kết luận cho câu hỏi "một hay nhiều project"

**Đã chốt (D-23):** nhiều project, có ảnh đầy đủ. Giới hạn thực tế là dung lượng máy, nên cần:
- Màn hình "Project của tôi" hiển thị dung lượng mỗi project và tổng dung lượng đã dùng.
- Cho xóa project dễ dàng.

## Rủi ro cần biết

- **Trình duyệt có thể tự xóa dữ liệu** khi máy hết dung lượng. Riêng Safari trên iOS có thể xóa dữ liệu của trang web không được mở trong khoảng 7 ngày — **trừ khi app đã được cài lên màn hình chính (PWA)**.
  → Gọi `navigator.storage.persist()` để xin quyền lưu lâu dài; khuyến khích user cài app; nói rõ với user rằng dữ liệu chỉ nằm trên máy.
- **Chế độ ẩn danh:** dữ liệu mất khi đóng tab.
- **Lịch sử không giới hạn** làm dữ liệu tăng dần (rất chậm, vì mỗi bước chỉ là thông số) → hiển thị dung lượng đã dùng, cho phép xóa project cũ.
- **Ảnh đã xóa khỏi project nhưng vẫn còn được tham chiếu trong lịch sử** (undo có thể khôi phục) → chỉ dọn ảnh khi xóa cả project. Cần xử lý khi thiết kế chi tiết.
- Vì việc giữ trạng thái là "nên có", nếu lưu thất bại app vẫn phải chạy bình thường (chỉ không khôi phục được).
