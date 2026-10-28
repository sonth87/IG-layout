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
    ProjectsScreen.tsx  trang chủ: tab Template / Dự án của tôi (danh sách, dung lượng, banner cài app)
    home/               TemplateLibrary (thư viện template, chi tiết, Dùng template), Onboarding (lần đầu)
    NewProject.tsx      chọn tỉ lệ, số slide, chọn ảnh
    SettingsScreen.tsx  theme, ngôn ngữ, dung lượng, xóa tất cả
    editor/
      Editor.tsx        khung editor: header (trạng thái lưu, nhân bản / xoá / xong), vùng canvas (zoom, cuộn tới phần tử), thanh công cụ ≤ 5 nút + Thêm
      EditorSheets.tsx  ActionSheet (menu Thêm), LayersSheet (bảng lớp, khoá), CoachTips (mẹo lần đầu)
      SlideNavigator.tsx dải thumbnail slide (Post / Story), chỉ vẽ lại slide thay đổi, lúc rảnh
      FloatingMenu.tsx  menu nổi trên phần tử đang chọn (đặt vị trí bằng tay, không render lại khi cuộn)
      ExportSheet.tsx   xem trước & tải về
      useImportPhotos.ts
      canvas/           CanvasStage chỉ to bằng vùng nhìn (dính cố định, cuộn = dịch nội dung, mật độ ≤ 2×; lấy ảnh 1 vùng thì dùng `layerRegion` trong export/slices), interaction.ts (quy tắc chọn / kéo cảm ứng vs chuột, phần tử khoá), CanvasStage (3 layer, pinch, hít, giới hạn pixel), ImageNode, TextNode, ShapeIconNodes, BackgroundNode, useNodeHandlers, useProcessedImage (bản xem trước + màu)
      useShortcuts.ts   phím tắt trên máy tính
      tools/            controls (ToolSheet ✕/✓, Slider, Swatches), CropTool, ElementTools (Mask, Style), ColorTools (Adjust, Filters), TextTools (TextTool, TextEditDialog), ElementsSheet, ProjectTools (Background, Slides)
    layout/             LayoutPicker (chọn layout), TemplatePreview
    export/             InstagramPreview (carousel, trang cá nhân, story)
    HelpScreen.tsx      hướng dẫn ngắn trong app
    ui/Icon.tsx
    ui/Dialog.tsx       ConfirmDialog, PromptDialog (thay prompt / confirm)
  lib/
    project/types.ts    mô hình dữ liệu (tọa độ theo pixel xuất)
    project/placement.ts  đặt ảnh ban đầu (1 ảnh → panorama, nhiều ảnh → mỗi slide 1 ảnh, thêm sau → nổi trên slide đang xem)
    project/geometry.ts   cover crop, nắn thẳng, bounds khi xoay, slide của phần tử
    project/masks.ts      đường viền 8 hình mask
    project/snap.ts       hít & đường gióng
    project/layout.ts     vị trí slide / ô (Post, Story: 1 hàng; Grid: 3 × N + khe), thứ tự xuất, vùng an toàn Story
    project/slides.ts     thêm / xóa / đổi chỗ slide; Grid: thêm / bớt hàng, bật / tắt bù khe
    project/migrate.ts    nâng cấp dữ liệu project cũ
    templates/          types, library (layout cho LayoutPicker), designs/ (template thiết kế sẵn cho trang chủ, mỗi nhóm một file, hàm dựng chung ở kit.ts; khung / sticker thư viện dùng trong template được trích vào packArt.json bằng scripts/build-template-art.mjs), seasons (lịch mùa / sự kiện cho trang chủ; thử ngày khác bằng `?today=YYYY-MM-DD`), widgetSpec (widget trong template, nạp lười), samples (ảnh mẫu theo chủ đề cho ô xem trước — public/samples, tải bằng `node --env-file=.env.local scripts/fetch-samples.mjs`, cần PEXELS_API_KEY trong .env.local), apply (template → phần tử)
    color/              params (thông số màu), filters (danh sách filter + công thức filter v2), lut (công thức → bảng tra màu 3D), processor (WebGL + cache), filmfx (Film FX: lớp phủ + dấu ngày + máy ảnh retro)
    text/cutout.ts      chữ cắt báo (D-141, D-142): xếp chữ, hàm vẽ dùng chung (canvas Konva, xuất ảnh, xem trước template); kiểu ở text/cutoutStyles.ts, phông thư viện dùng tới ở text/cutoutFonts.json (sinh bởi scripts/build-template-art.mjs)
    text/fonts.ts       danh sách 78 font (nhóm, độ đậm) + chờ font tải; text/webfonts.ts khai báo next/font (đi cùng trình chỉnh sửa)
    elements/           create (tạo chữ / hình / icon / sticker / lớp phủ / khung), stickers (SVG tự vẽ), overlays (lớp phủ sinh bằng code), resize (co giãn cỡ chữ, viền theo tỉ lệ), shapes (vẽ hình), icons (Lucide)
  app/fonts.ts          khai báo 6 font (next/font), dùng chung cho giao diện và canvas
    image/import.ts     đọc ảnh, xoay theo EXIF, thu nhỏ (D-29)
    motion/motion.ts    chuyển động: trạng thái theo thời gian (vào / ra / liên tục / Ken Burns), áp lên Konva và trả về
    video/              import (nén bằng Mediabunny), music (nhạc nền), analyze (dải hình + sóng âm), reel (video 9:16), playback (đồng hồ chung + <video> ẩn mỗi phần tử), export (slide có video → MP4), frames (khung giải mã khi xuất)
    image/removeBg*.ts  xoá nền: worker (Transformers.js + ormbg) và phía giao diện; runtime ONNX copy vào public/ort bởi scripts/copy-ort.mjs (chạy trong `pnpm dev` / `pnpm build`)
    export/slices.ts    cắt canvas theo ranh giới slide → JPEG
    export/deliver.ts   share sheet / ZIP / tải từng ảnh
    storage/db.ts       IndexedDB: projects (thông tin), states (doc + lịch sử), assets (ảnh)
    storage/projects.ts các thao tác lưu / mở / đổi tên / xóa, xin quyền lưu lâu dài
    i18n/en.ts, vi.ts   từ điển giao diện
    gesture.ts          đang có ngón tay / chuột nhấn? + whenIdle: việc nền (thumbnail, lưu) chờ hết thao tác
    pwa.ts              cài app (install prompt), đăng ký service worker
    format.ts           định dạng dung lượng, thời gian
  store/editor.ts       Zustand: project đang mở, ảnh, lịch sử undo / redo
  store/autosave.ts     tự lưu sau mỗi bước (debounce) + ảnh thu nhỏ slide 1
  store/settings.ts     theme, ngôn ngữ (localStorage) + useT()
public/sw.js           service worker (offline; chỉ "/" làm bản offline)
public/labs/video.html trang thử nghiệm video M13 (độc lập, không thuộc app)
src/app/labs/filters  trang thử filter v2 (/labs/filters — dùng chính bộ xử lý màu của app, không có link trong app); ảnh mẫu ở public/labs/filter-samples
src/app/labs/templates  trang thử template (/labs/templates?cat=grid, ?event=christmas, ?cutout=1 xem các kiểu chữ cắt báo — mọi template của trang chủ, cả dải carousel; không có link trong app)
scripts/              copy-ort.mjs (runtime ONNX), build-emoji.mjs (sticker emoji) — chạy trong pnpm dev / build; đổi tên CACHE khi đổi chiến lược cache
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
- Không tự tính vị trí slide kiểu `i * width`: luôn dùng `slideRect` / `canvasSize` trong `layout.ts` (Grid có 2 chiều và khe hở).
- Chỉ thay đổi project qua action của store; mỗi action = 1 bước lịch sử. Cử chỉ kéo / xoay / pinch ghi khi thả tay.
- Công cụ có ✕ / ✓ sửa trên `draft` (`beginDraft` → `updateDraft` → `applyDraft` / `cancelDraft`); hiển thị dùng `useViewDoc()` (= draft ?? doc).
- Đổi cấu trúc `ProjectDoc` → cập nhật `migrate.ts` để project đã lưu vẫn mở được.
- Kiểm tra tự động đọc store qua `window.__igEditor` (chỉ đọc).
- Hiệu năng: khi chỉnh, ảnh luôn vẽ từ bản xem trước ≤ 1600 px; chỉ khi xuất (`exporting`) mới dùng ảnh đầy đủ. Đo lại bằng `node e2e/perf.mjs <url>` khi đổi phần vẽ.
- Mọi chữ hiển thị đi qua `useT()`; thêm key vào **cả** `en.ts` và `vi.ts` (TypeScript báo lỗi nếu thiếu bên `vi`).
- Service worker chỉ chạy ở bản build (`pnpm build`), không chạy ở `pnpm dev`.
- Thứ gì không được xuất ra ảnh (đường chia slide, khung chọn) phải nằm ở layer khác layer nội dung.
- Next.js 16 khác nhiều so với bản cũ: đọc `node_modules/next/dist/docs/` trước khi dùng API mới (xem `AGENTS.md`).

Trước khi code tính năng mới, đọc: [product/brief.md](../product/brief.md), [architecture/overview.md](../architecture/overview.md), [roadmap/plan.md](../roadmap/plan.md).
