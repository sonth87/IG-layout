# Thiết kế kỹ thuật editor (toàn dự án)

> Viết 2026-10-14 khi lập kế hoạch cho M2–M7. Là bản thiết kế để code theo; khi code thực tế khác đi thì cập nhật file này.
> Liên quan: [overview.md](overview.md) (mô hình canvas nhiều slide), [storage.md](storage.md).

## 1. Mô hình dữ liệu

Mọi tọa độ tính bằng **pixel xuất** (1 slide 4:5 = 1080 × 1350).

```ts
ProjectDoc {
  type: "post" | "story" | "grid"
  ratio: "1:1" | "4:5" | "3:4" | "9:16"
  slideCount: number              // Post / Story: số slide (xếp 1 hàng ngang)
  grid?: { rows: number; gapCompensation: boolean }   // Grid: 3 cột × rows hàng (M6)
  background: Background          // một nền liền cho cả canvas
  elements: CanvasElement[]       // thứ tự = lớp (sau → trước)
}

Background =
  | { kind: "color"; color }
  | { kind: "gradient"; from; to; angle }
  | { kind: "blur"; assetId }     // ảnh làm mờ phủ kín canvas

ElementBase { id, x, y, width, height, rotation, opacity, locked? }

ImageElement extends ElementBase {
  type: "image"
  assetId: string | null          // null = ô trống của template ("chạm để thêm ảnh")
  crop: { x, y, width, height }   // vùng lấy từ ảnh (pixel ảnh)
  straighten: number              // độ, xoay ảnh bên trong khung
  flipX, flipY: boolean
  mask: MaskShape                 // none | rounded | circle | arch | heart | star | hexagon | blob
  cornerRadius: number            // cho mask "rounded"
  border: { width, color } | null
  shadow: boolean
  frame: FrameStyle               // none | polaroid | film | white (M5)
  adjust: Adjustments             // M4
  filter: { id, intensity } | null  // M4
}

TextElement extends ElementBase {
  type: "text"; text; fontFamily; fontWeight; fontSize; color; align
  letterSpacing; lineHeight; stroke: { width, color } | null
  shadow: boolean; background: { color, padding, radius } | null
}

ShapeElement extends ElementBase { type: "shape"; shape: rect | roundRect | circle | triangle | line | arrow; fill; stroke }
IconElement  extends ElementBase { type: "icon"; icon: string; color }
```

Kích thước khung (`width`, `height`) là khung hiển thị; ảnh được **cover** vào khung theo `crop` (+ `straighten`).

## 2. Hiển thị (Konva)

> **Đã cài đặt (M2):** mỗi ảnh là **một** `Konva.Shape` tự vẽ (bóng → clip theo mask → ảnh crop / nắn thẳng / lật → viền) trong `sceneFunc`, hit theo đường mask. Lý do: khung chọn (Transformer) lấy kích thước từ `width/height` của shape nên luôn khớp khung, kể cả khi ảnh bên trong được phóng to để nắn thẳng. Code: `apps/web/src/components/editor/canvas/ImageNode.tsx`, đường mask: `packages/core/project/masks.ts`.

- Mỗi phần tử ảnh = `Group` (vị trí, xoay, `clipFunc` theo mask) chứa `Image` (crop, lật, nắn thẳng) + viền vẽ cùng đường mask phía trên + bóng vẽ phía dưới.
- 3 layer: **nội dung** (được xuất), **đường chia slide** (không xuất), **UI** (khung chọn, đường gióng — không xuất).
- Ảnh hiển thị dùng ảnh đã nhập (≤ 4000 px). Ảnh đã qua filter / chỉnh màu (M4) được xử lý bằng WebGL thành canvas riêng ở độ phân giải xem trước; khi xuất xử lý lại ở độ phân giải đầy đủ.

## 3. Bản nháp khi dùng công cụ (D-12)

Store có `draft: ProjectDoc | null`.
- Mở công cụ (crop, mask, viền, chỉnh màu…) → `beginDraft()` sao chép doc.
- Kéo slider → `updateDraft()` — màn hình vẽ theo draft, **không ghi lịch sử, không tự lưu**.
- ✓ → `applyDraft()` ghi **1 bước**; ✕ → `cancelDraft()`.
- Thao tác kéo / xoay / pinch trực tiếp trên canvas: ghi 1 bước khi thả tay (không qua draft).

## 4. Cử chỉ & căn chỉnh (M2)

- **1 ngón:** kéo phần tử; chạm chọn; chạm nền bỏ chọn; vuốt vùng trống cuộn dải slide.
- **2 ngón trên phần tử đang chọn:** pinch phóng to / thu nhỏ + xoay quanh tâm hai ngón. Áp trực tiếp vào node Konva, ghi lịch sử khi nhấc tay.
- **Hít (snap):** khi kéo, so cạnh trái / giữa / phải và trên / giữa / dưới của phần tử với: tâm & mép từng slide, ranh giới slide, cạnh & tâm các phần tử khác. Ngưỡng ~8 px màn hình. Vẽ đường gióng ở layer UI.

## 5. Quản lý slide (M2)

- Slide "đang xem" = slide gần giữa màn hình nhất (theo vị trí cuộn).
- Thêm slide sau slide đang xem; xóa slide; đổi chỗ với slide bên cạnh.
- Phần tử thuộc slide theo **tâm** phần tử. Thêm / xóa / đổi chỗ slide → dịch các phần tử nằm sau đó ±1 chiều rộng slide. Xóa slide → xóa các phần tử có tâm trong slide đó (có undo).

## 6. Template (M3)

> **Đã cài đặt (M3):** template là dữ liệu TypeScript trong `packages/core/templates/library.ts` (có kiểu, dễ kiểm tra hơn JSON thuần; vẫn là dữ liệu — thêm layout không sửa code). `applyTemplate` trong `apply.ts`. Ô của template lưới có `slot: true`: kéo = dịch ảnh trong ô (đổi `crop`), đổi ảnh giữa hai ô bằng nút Swap. Template `perPhoto` sinh mỗi slide 1 ô theo số ảnh.

File JSON, toạ độ **tương đối** (0..1 theo slide) để dùng cho mọi tỉ lệ:

```json
{
  "id": "pano-floating-3",
  "group": "seamless",
  "photos": 4,
  "slides": 3,
  "background": { "kind": "photo", "photo": 0 },
  "elements": [
    { "type": "slot", "photo": 1, "slide": 0, "x": 0.55, "y": 0.2, "w": 0.6, "h": 0.5, "rotation": -4, "frame": "white" }
  ]
}
```

- `slide` + `x` cho phép phần tử vắt qua ranh giới (x > 1).
- `background.kind = "photo"` = ảnh panorama trải cả canvas.
- Áp template → sinh phần tử thật; ô thiếu ảnh = `assetId: null`.
- Gợi ý theo số ảnh: lọc template có `photos` = số ảnh đã chọn (hoặc gần nhất).

## 7. Màu & filter (M4)

> **Đã cài đặt (M4):** `packages/core/color/` — `params.ts` (13 thông số, đơn vị giao diện -100..100 → giá trị shader), `filters.ts` (danh sách filter), `processor.ts` (WebGL + cache). Hook `useProcessedImage` xử lý đồng bộ trong `useMemo` (không nháy). Vignette vẽ bằng gradient trong `ImageNode` để bám theo khung. Khi xuất: store bật `exporting` → ảnh xử lý lại full resolution → cắt slide → tắt.

- Một shader WebGL nhận toàn bộ thông số: exposure, brightness, contrast, highlights, shadows, saturation, vibrance, temperature, tint, vignette, grain, fade.
- **Filter = bộ thông số có sẵn** (+ tông màu vùng tối / vùng sáng, đơn sắc). Cường độ = nội suy từ 0 tới bộ thông số.
- Thứ tự áp: filter → chỉnh tay. "Áp cho tất cả" chỉ đổi `filter` của mọi ảnh.
- Kết quả dùng làm nguồn ảnh cho Konva; cache theo (asset, thông số, kích thước).

## 8. Text & font (M5)

> **Đã cài đặt (M5):** `CanvasElement` = image | text | shape | icon (`types.ts`, `isImage`). Font khai báo một lần ở `apps/web/src/app/fonts.ts`, canvas dùng qua `lib/text/fonts.ts` (`loadFont`). Chiều cao chữ là giá trị suy ra: `TextNode` đo rồi ghi bằng `setDerived` (không tạo bước lịch sử). Hình khối vẽ trong `lib/elements/shapes.ts`; icon Lucide render thành SVG theo kích thước (`lib/elements/icons.ts`). Khung ảnh: `frameInset` trong `geometry.ts`, ảnh lấp vùng bên trong.

- Font qua `next/font/google` (tự host), mỗi font có `vietnamese` subset; danh sách: Be Vietnam Pro, Playfair Display, Lora, Montserrat, Dancing Script, Space Grotesk.
- Trước khi vẽ / xuất: `document.fonts.load()` cho đúng font + độ đậm.
- Sửa chữ bằng ô nhập HTML phủ lên (bàn phím điện thoại), không gõ trực tiếp trên canvas.

## 9. Story & Grid (M6)

> **Đã cài đặt (M6):** `packages/core/project/layout.ts` là nơi duy nhất tính vị trí slide (`slideRect`), kích thước canvas (`canvasSize`), slide của một điểm (`slideAt`), thứ tự xuất (`exportOrder`). Grid: 3 cột, ô 3:4; bật bù khe → giữa các ô có dải `GRID_GAP` px (tô màu trong editor, không xuất). Thao tác slide / hàng dời phần tử theo ô chứa tâm (`slides.ts`). Template khai báo `types` để lọc theo loại project.

- **Story:** `ratio = 9:16`, các khung nằm liền nhau như Post nhưng hiển thị **vùng an toàn** (trên ~250 px, dưới ~340 px — cần xác minh).
- **Grid:** canvas 2 chiều 3 cột × `rows` hàng, mỗi ô 1080 × 1440. Xuất theo **thứ tự đăng** (ô dưới cùng bên phải = `_01`). Bù khe hở: thu nhỏ nội dung mỗi ô một chút quanh mép (tham số cần thử).

## 10. Xuất (M7)

- Xuất từng slide / ô một, từ ảnh đầy đủ độ phân giải (filter xử lý lại ở full res).
- Xem trước kiểu Instagram: carousel (vuốt) và lưới profile (thumbnail 3:4).
