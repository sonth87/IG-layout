# Tài liệu cho Developer

## Chạy dự án

Yêu cầu: Node 20+, pnpm 10.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm lint
pnpm build    # xuất trang tĩnh ra out/
```

Xem bản build: phục vụ thư mục `out/` bằng bất kỳ static server nào, ví dụ `python3 -m http.server 4321 -d out`.

Thử trên điện thoại (cùng mạng Wi-Fi): `pnpm dev -H 0.0.0.0` rồi mở `http://<IP-máy>:3000`.
Lưu ý: share sheet ("Save images") và cài PWA cần **HTTPS** (hoặc localhost) — dùng tunnel (ví dụ cloudflared) hoặc deploy thử.

## Cấu trúc thư mục

```
src/
  app/                  layout, page, manifest (PWA), globals.css (biến theme)
  components/
    App.tsx             chuyển giữa màn tạo project và editor
    NewProject.tsx      chọn tỉ lệ, số slide, chọn ảnh
    editor/
      Editor.tsx        khung editor: header, vùng canvas, thanh công cụ
      CanvasStage.tsx   canvas Konva: lớp nội dung (được export), lớp đường chia slide, lớp khung chọn
      ExportSheet.tsx   xem trước & tải về
      useImportPhotos.ts
    ui/Icon.tsx
  lib/
    project/types.ts    mô hình dữ liệu (tọa độ theo pixel xuất)
    project/placement.ts  đặt ảnh ban đầu (1 ảnh → panorama, nhiều ảnh → mỗi slide 1 ảnh)
    image/import.ts     đọc ảnh, xoay theo EXIF, thu nhỏ (D-29)
    export/slices.ts    cắt canvas theo ranh giới slide → JPEG
    export/deliver.ts   share sheet / ZIP / tải từng ảnh
  store/editor.ts       Zustand: project, ảnh, lịch sử undo / redo
```

## Git

- Repo: `git@github.com:sonth87/IG-layout.git`, nhánh chính `main`.
- Mỗi mốc (M1, M2…) hoặc việc lớn làm trên nhánh riêng (`m1-foundation`, `feat/...`), xong thì merge vào `main`. *(Đề xuất)*
- Commit message theo Conventional Commits, tiếng Anh: `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`. *(Đề xuất)*
- Không commit `node_modules/`, `.next/`, `out/` (đã có trong `.gitignore`).

## Quy ước

- Mọi tọa độ trong `ProjectDoc` là **pixel xuất** (1 slide 4:5 = 1080 × 1350). Màn hình chỉ là `viewScale` của canvas.
- Chỉ thay đổi project qua action của store; mỗi action = 1 bước lịch sử. Cử chỉ kéo / xoay ghi khi thả tay.
- Thứ gì không được xuất ra ảnh (đường chia slide, khung chọn) phải nằm ở layer khác layer nội dung.
- Next.js 16 khác nhiều so với bản cũ: đọc `node_modules/next/dist/docs/` trước khi dùng API mới (xem `AGENTS.md`).

Trước khi code tính năng mới, đọc: [product/brief.md](../product/brief.md), [architecture/overview.md](../architecture/overview.md), [roadmap/plan.md](../roadmap/plan.md).
