# Nhật ký quyết định

Mỗi quyết định ghi: ngày, nội dung, lý do, trạng thái. Không xóa quyết định cũ; nếu thay đổi thì thêm dòng mới và đánh dấu dòng cũ là `Thay thế bởi D-xx`.

| ID | Ngày | Quyết định | Lý do | Trạng thái |
|---|---|---|---|---|
| D-01 | 2026-10-14 | Ứng dụng web, không làm app native | Không cần cài đặt, dùng được trên mọi thiết bị | Đã chốt |
| D-02 | 2026-10-14 | Không đăng trực tiếp lên Instagram; user tự tải về và tự đăng | API của Meta chỉ hỗ trợ tài khoản Business/Creator, cần app review; bỏ bước này giúp không cần server và đăng nhập | Đã chốt |
| D-03 | 2026-10-14 | Miễn phí, không đặt mục tiêu cạnh tranh | Định hướng của chủ dự án | Đã chốt |
| D-04 | 2026-10-14 | Next.js + PWA | Định hướng của chủ dự án; PWA cho phép cài như app, dùng offline | Đã chốt |
| D-05 | 2026-10-14 | Viết tài liệu và chốt yêu cầu trước khi code | Tránh mất định hướng | Đã chốt |
| D-06 | 2026-10-14 | Xử lý ảnh 100% phía client | Riêng tư, không tốn chi phí server, phù hợp với việc miễn phí | Đề xuất |
| D-07 | 2026-10-14 | Mô hình "canvas nhiều slide", cắt ra khi export | Một mô hình bao được mọi kiểu layout, không phải code riêng từng chế độ | Đề xuất |
| D-08 | 2026-10-14 | Mobile-first | Người dùng chủ yếu làm trên điện thoại | Đã chốt |
| D-09 | 2026-10-14 | Chỉ làm ảnh đăng bài (feed / carousel); Story để sau | Chủ dự án chưa định hình nhu cầu Story | Thay thế bởi D-11 |
| D-10 | 2026-10-14 | Chỉnh ảnh phạm vi rộng: chỉnh màu, hiệu ứng, filter có sẵn + tùy chỉnh, nhiều loại phần tử; mọi phần tử biến đổi được | Tham khảo các app khác; chia mức ưu tiên MVP / Sau | Đã chốt |
| D-11 | 2026-10-14 | Hỗ trợ cả Post và Story; user chọn loại khi tạo project | Story về bản chất là ảnh khác kích thước (9:16) + vùng an toàn; mô hình canvas đáp ứng được | Đã chốt |
| D-12 | 2026-10-14 | History undo/redo theo mô hình "xác nhận mới ghi": chỉnh thử xem trước, bấm Áp dụng mới ghi một bước | Tránh lịch sử bị rác bởi hàng trăm bước nhỏ khi kéo slider | Đã chốt |
| D-13 | 2026-10-14 | Chỉnh sửa không phá hủy, không ghi đè ảnh gốc | Có thể sửa / bỏ mọi chỉnh sửa bất cứ lúc nào | Đã chốt |
| D-14 | 2026-10-14 | Filter / chỉnh màu mặc định theo từng ảnh, có ô tick "áp dụng cho tất cả" | Linh hoạt nhưng vẫn nhanh khi muốn đồng bộ màu cả carousel | Đã chốt |
| D-15 | 2026-10-14 | Làm trước 5 filter để thử nghiệm, bổ sung dần | Kiểm chứng pipeline filter trước khi đầu tư nhiều | Đã chốt |
| D-16 | 2026-10-14 | "Áp dụng cho tất cả" chỉ áp filter, có hộp thoại xác nhận | Tránh vô tình ghi đè chỉnh sửa riêng của từng ảnh | Đã chốt |
| D-17 | 2026-10-14 | Lịch sử không giới hạn; chỉ Back / Next | Các bước không có tên nên danh sách lịch sử không hữu ích; lưu dạng patch nên nhẹ | Đã chốt |
| D-18 | 2026-10-14 | Mỗi project một loại: Post hoặc Story | Đơn giản hóa; tỉ lệ khung cố định theo project | Đã chốt |
| D-19 | 2026-10-14 | Filter có tên, chia nhóm phong cách; không dùng tên thương hiệu | Dễ chọn theo cảm xúc; tránh vấn đề nhãn hiệu | Đã chốt |
| D-20 | 2026-10-14 | Lưu trữ cục bộ bằng IndexedDB (project, lịch sử, ảnh); không dùng SQLite; OPFS dự phòng cho ảnh | Có sẵn trong trình duyệt, đủ nhu cầu; SQLite thừa. Xem architecture/storage.md | Đã chốt |
| D-21 | 2026-10-14 | Nhóm và tên filter theo user/filters.md; tên filter bằng tiếng Anh | Chủ dự án đồng ý | Đã chốt |
| D-22 | 2026-10-14 | Lịch sử lưu thông số của từng bước (không lưu ảnh), lưu bền cùng project | Mỗi bước đủ dữ liệu để dựng lại ngay | Đã chốt |
| D-23 | 2026-10-14 | Lưu nhiều project kèm ảnh; có màn hình "Project của tôi" | Lưu ảnh trong IndexedDB làm được; giữ project không có ảnh thì vô nghĩa | Đã chốt |
| D-24 | 2026-10-14 | Tự động thu nhỏ ảnh khi nhập (cạnh dài ~4000px); không lưu ảnh gốc nguyên bản | 20 ảnh × 5 MB = 100 MB / project là quá nặng | Đã chốt |
| D-25 | 2026-10-14 | Không làm xuất / nhập file project trong giai đoạn này | Chưa thấy cần thiết | Đã chốt |
| D-26 | 2026-10-14 | Giao diện mặc định tiếng Anh, có tùy chọn tiếng Việt | Phục vụ được người dùng quốc tế | Đã chốt |
| D-27 | 2026-10-14 | Làm puzzle grid (cắt ảnh thành lưới trang cá nhân) | Là một dạng layout | Đã chốt |
| D-28 | 2026-10-14 | Grid (lưới trang cá nhân) là loại project thứ ba: Post / Story / Grid | Mỗi ô là một bài đăng riêng, thứ tự đăng ngược — khác hẳn carousel | Đã chốt |
| D-29 | 2026-10-14 | Thu nhỏ ảnh: thường cạnh dài ~4000px; panorama cạnh ngắn ~2400px | Nhẹ nhưng panorama không bị mờ | Đã chốt |
| D-30 | 2026-10-14 | Carousel là một bố cục liền, xuất bằng cách cắt đúng kích thước slide, cắt qua mọi phần tử trên ranh giới | Vuốt trên Instagram thấy liền mạch | Đã chốt |
| D-31 | 2026-10-14 | Template layout định nghĩa bằng dữ liệu, chia nhóm, mở rộng dần | Số kiểu layout rất nhiều, phải thêm được mà không sửa code | Đã chốt |
| D-32 | 2026-10-14 | Font từ Google Fonts, tự host | Miễn phí (OFL), có tiếng Việt; tự host để chạy offline và export ổn định | Đã chốt |
| D-33 | 2026-10-14 | Sticker là thư viện riêng, tải từ nguồn có giấy phép cho phép dùng lại, có trang Credits | Kiểm soát nội dung và bản quyền | Đã chốt |
| D-34 | 2026-10-14 | Grid: có tùy chọn bù khe hở; mỗi ô có thể là carousel (ưu tiên Sau) | Chủ dự án đồng ý | Đã chốt |
| D-35 | 2026-10-14 | Có theme sáng và tối, mặc định theo hệ thống, đổi trong Settings | Chủ dự án yêu cầu | Đã chốt |
| D-36 | 2026-10-14 | Bắt đầu Giai đoạn 1 (prototype) song song với việc chốt MVP | Chủ dự án đồng ý triển khai thử | Đã chốt |
| D-37 | 2026-10-14 | Next.js 16 xuất tĩnh (`output: "export"`), tắt `cacheComponents` | App chạy hoàn toàn trên client; Cache Components cần server Node | Đã chốt |
| D-38 | 2026-10-14 | Prototype dùng Konva + react-konva, Zustand, Tailwind 4, fflate | Lựa chọn để thử; đổi được nếu test mobile có vấn đề | Đề xuất |
| D-39 | 2026-10-14 | Lộ trình: GĐ0 → GĐ1 → GĐ2 (mốc M1–M7) → v1.0 → GĐ3; mỗi mốc có điều kiện hoàn thành, không đặt ngày cố định | Làm bù lộ trình sau khi đã code prototype, để các bước tiếp theo rõ ràng | Đã chốt |
| D-40 | 2026-10-14 | Mã nguồn trên GitHub `sonth87/IG-layout`, nhánh `main` | Chủ dự án tạo repo | Đã chốt |
| D-41 | 2026-10-14 | Font giao diện: Be Vietnam Pro (nội dung) + Space Grotesk (tiêu đề), thay DM Sans | DM Sans không có bộ ký tự tiếng Việt | Đã chốt |
| D-42 | 2026-10-14 | Service worker tự sinh sau khi build (`scripts/generate-sw.mjs`), không dùng Serwist | App xuất tĩnh, chỉ cần precache toàn bộ `out/`; ít phụ thuộc, dễ kiểm soát | Đề xuất |
| D-43 | 2026-10-14 | i18n tự viết (từ điển `en` / `vi` + `useT`), không dùng next-intl | App chỉ chạy client, không cần định tuyến theo ngôn ngữ | Đề xuất |
| D-44 | 2026-10-14 | Host trên Vercel (https://ig-layout.vercel.app/), tự deploy khi push lên `main` | Chủ dự án đã cài đặt | Đã chốt |
| D-45 | 2026-10-14 | Trước v1.0: được merge nhánh vào `main` bất cứ lúc nào | Chưa phát hành chính thức, `main` là bản chạy thử | Đã chốt |
