# Tech stack

| Hạng mục | Lựa chọn | Trạng thái | Ghi chú |
|---|---|---|---|
| Framework | Next.js 16 (App Router), `output: "export"` | Đã chốt | Build ra trang tĩnh (`out/`). Tắt `cacheComponents` vì cần server Node |
| PWA | `app/manifest.ts` + icon; service worker tĩnh `public/sw.js` | Đã có (M1) | Trang: network-first; asset: cache-first; "warm" danh sách file đã tải ngay lần đầu |
| Ngôn ngữ | TypeScript | Đã chốt | |
| Canvas tương tác | Konva 10 + react-konva | Dùng trong prototype | Đổi sang Fabric nếu test mobile có vấn đề |
| Filter / chỉnh màu | WebGL (shader) | Đề xuất | |
| State + undo/redo | Zustand 5 | Dùng trong prototype | Lịch sử = danh sách doc bất biến (chia sẻ phần không đổi) |
| Lưu project | IndexedDB qua `idb`; OPFS dự phòng cho ảnh | Đã chốt | Không dùng SQLite — xem [architecture/storage.md](../architecture/storage.md) |
| Decode HEIC | Thư viện WASM | Đề xuất | |
| Đóng gói ZIP | fflate | Dùng trong prototype | |
| Styling / UI | Tailwind CSS 4 + biến theme trong `globals.css` | Dùng trong prototype | Bảng màu theo wireframe |
| Font | Google Fonts qua `next/font` (tự host khi build): Be Vietnam Pro + Space Grotesk | Đã chốt | Chỉ chọn font có subset tiếng Việt; giấy phép OFL |
| Sticker / icon | Thư viện riêng, file tải về đưa vào repo | Đã chốt | Ghi nguồn + giấy phép từng bộ |
| Đa ngôn ngữ (i18n) | Tự viết: `src/lib/i18n/{en,vi}.ts` + `useT()` | Đã có (M1) | Mặc định `en`, có `vi` (D-43) |
| Hosting | Trang tĩnh (Vercel / Cloudflare Pages…) | Đề xuất | |
