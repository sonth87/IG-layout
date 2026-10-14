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

## Kiểm tra tự động

`pnpm build && pnpm e2e` — chạy Chromium headless qua các luồng chính (xem [e2e/README.md](../../e2e/README.md)). Chạy trên bản deploy: `node e2e/run.mjs https://ig-layout.vercel.app/`. **Chạy trước khi merge vào `main`.**

## Cấu trúc thư mục

```
src/
  app/                  layout, page, manifest (PWA), globals.css (biến theme)
  components/
    App.tsx             điều hướng giữa các màn: Projects, New, Settings, Editor
    ProjectsScreen.tsx  "Project của tôi": danh sách, dung lượng, banner cài app
    NewProject.tsx      chọn tỉ lệ, số slide, chọn ảnh
    SettingsScreen.tsx  theme, ngôn ngữ, dung lượng, xóa tất cả
    editor/
      Editor.tsx        khung editor: header, vùng canvas, thanh công cụ theo ngữ cảnh, mở công cụ
      ExportSheet.tsx   xem trước & tải về
      useImportPhotos.ts
      canvas/           CanvasStage (3 layer, pinch, hít), ImageNode, BackgroundNode, useHtmlImage
      tools/            controls (ToolSheet ✕/✓, Slider, Swatches), CropTool, ElementTools (Mask, Style), ProjectTools (Background, Slides)
    layout/             LayoutPicker (chọn layout), TemplatePreview
    ui/Icon.tsx
  lib/
    project/types.ts    mô hình dữ liệu (tọa độ theo pixel xuất)
    project/placement.ts  đặt ảnh ban đầu (1 ảnh → panorama, nhiều ảnh → mỗi slide 1 ảnh, thêm sau → nổi trên slide đang xem)
    project/geometry.ts   cover crop, nắn thẳng, bounds khi xoay, slide của phần tử
    project/masks.ts      đường viền 8 hình mask
    project/snap.ts       hít & đường gióng
    project/slides.ts     thêm / xóa / đổi chỗ slide
    project/migrate.ts    nâng cấp dữ liệu project cũ
    templates/          types, library (danh sách template), apply (template → phần tử)
    image/import.ts     đọc ảnh, xoay theo EXIF, thu nhỏ (D-29)
    export/slices.ts    cắt canvas theo ranh giới slide → JPEG
    export/deliver.ts   share sheet / ZIP / tải từng ảnh
    storage/db.ts       IndexedDB: projects (thông tin), states (doc + lịch sử), assets (ảnh)
    storage/projects.ts các thao tác lưu / mở / đổi tên / xóa, xin quyền lưu lâu dài
    i18n/en.ts, vi.ts   từ điển giao diện
    pwa.ts              cài app (install prompt), đăng ký service worker
    format.ts           định dạng dung lượng, thời gian
  store/editor.ts       Zustand: project đang mở, ảnh, lịch sử undo / redo
  store/autosave.ts     tự lưu sau mỗi bước (debounce) + ảnh thu nhỏ slide 1
  store/settings.ts     theme, ngôn ngữ (localStorage) + useT()
public/sw.js           service worker (offline); đổi tên CACHE khi đổi chiến lược cache
```

## Deploy

- Vercel, nối với repo GitHub: mỗi lần push lên `main` tự build (`next build`) và deploy.
- Bản chạy: https://ig-layout.vercel.app/ — dùng link này để thử trên điện thoại (có HTTPS: cài PWA, share sheet).

## Git

- Repo: `git@github.com:sonth87/IG-layout.git`, nhánh chính `main`.
- Mỗi mốc (M1, M2…) hoặc việc lớn làm trên nhánh riêng (`m1-foundation`, `feat/...`). Trước khi phát hành v1.0, merge vào `main` bất cứ lúc nào (chủ dự án đồng ý), không cần chờ duyệt.
- Commit message theo Conventional Commits, tiếng Anh: `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`. *(Đề xuất)*
- Không commit `node_modules/`, `.next/`, `out/` (đã có trong `.gitignore`).

## Quy ước

- Mọi tọa độ trong `ProjectDoc` là **pixel xuất** (1 slide 4:5 = 1080 × 1350). Màn hình chỉ là `viewScale` của canvas.
- Chỉ thay đổi project qua action của store; mỗi action = 1 bước lịch sử. Cử chỉ kéo / xoay / pinch ghi khi thả tay.
- Công cụ có ✕ / ✓ sửa trên `draft` (`beginDraft` → `updateDraft` → `applyDraft` / `cancelDraft`); hiển thị dùng `useViewDoc()` (= draft ?? doc).
- Đổi cấu trúc `ProjectDoc` → cập nhật `migrate.ts` để project đã lưu vẫn mở được.
- Kiểm tra tự động đọc store qua `window.__igEditor` (chỉ đọc).
- Mọi chữ hiển thị đi qua `useT()`; thêm key vào **cả** `en.ts` và `vi.ts` (TypeScript báo lỗi nếu thiếu bên `vi`).
- Service worker chỉ chạy ở bản build (`pnpm build`), không chạy ở `pnpm dev`.
- Thứ gì không được xuất ra ảnh (đường chia slide, khung chọn) phải nằm ở layer khác layer nội dung.
- Next.js 16 khác nhiều so với bản cũ: đọc `node_modules/next/dist/docs/` trước khi dùng API mới (xem `AGENTS.md`).

Trước khi code tính năng mới, đọc: [product/brief.md](../product/brief.md), [architecture/overview.md](../architecture/overview.md), [roadmap/plan.md](../roadmap/plan.md).
