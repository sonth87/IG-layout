# Editor v2 — tài liệu kỹ thuật

> Dành cho người triển khai M14–M19. Đặc tả hành vi (cái gì, vì sao) ở [docs/product/editor-v2/](../product/editor-v2/README.md); tài liệu này mô tả **cách làm**: mô hình dữ liệu, chuyển đổi dữ liệu cũ, máy trạng thái chọn, phân xử cử chỉ, các thuật toán, cấu trúc component và kế hoạch kiểm thử. Mọi đề xuất ở đây là thiết kế ban đầu; khi triển khai mà thấy không ổn thì sửa tài liệu này cùng lúc với code.

## 0. Đã cài ở M14 (2026-10-17, D-91)

Khi bắt tay vào code, một số thiết kế ở các mục dưới được làm **đơn giản hơn** để ít rủi ro mà vẫn đúng hành vi của product/02, 06, 07 mục 1–4. Mục này là mô tả đúng của code hiện tại; các mục 2–4, 7, 9 giữ lại làm hướng đi cho các mốc sau và được đánh dấu chỗ khác biệt.

**Dữ liệu — ô là ảnh con, không phải `media` nằm trong ô.** `LayoutElement` (`type: "layout"`) chỉ giữ hình học: vị trí, kích thước, góc xoay của khối, và `cells: { id, x, y, w, h }[]` — toạ độ ô **tương đối 0..1** theo khối, `id` của ô chính là `id` của một `ImageElement` bình thường mang `parentId = id khối`. Ảnh trong ô vì vậy vẫn là ảnh như mọi ảnh khác: cắt, chỉnh màu, bộ lọc, xoá nền, video, chuyển động, xuất… chạy nguyên, không phải viết lại `ImageNode`. Hình học của ảnh con **luôn suy ra từ khối**: `syncLayout(doc, layoutId)` (`lib/project/blocks.ts`) đặt lại khung từng ô theo khối (xoay tâm ô quanh tâm khối, cùng góc xoay), kế thừa `hidden`, và cắt lại ảnh cho phủ kín nếu tỉ lệ ô đổi (`refitCrop`). Store gọi nó sau mọi `updateElement` / `toggleHidden` lên khối (`synced`). Khe, lề, bo góc vẫn nằm trên từng ảnh con như trước (`cornerRadius`, `mask`); sheet Điều chỉnh của khối (M17) sẽ thêm `gap / padding / radius` vào khối.

**Thứ tự lớp.** Mảng `elements` vẫn phẳng; khối đứng ngay dưới các ô của nó. Mọi thao tác lớp đi theo **đơn vị** (`units(doc)`: phần tử ngoài cùng + các con): bảng Lớp liệt kê một dòng cho mỗi khối, `moveUnit` dời cả cụm, `copyUnit` nhân bản khối kèm ô (id mới), xoá khối xoá cả ô (`blockIds`). Xoá một ảnh trong ô → ô trống (`assetId: null`); nhân bản ảnh trong ô → ảnh **tự do** đặt trên khối.

**Chuyển đổi dữ liệu cũ** (`groupSlots`, gọi trong `migrateDoc` và `applyTemplate`): các ảnh `slot` chưa có cha được gom theo slide chứa tâm; mỗi nhóm thành một khối phủ đúng slide đó, đặt ở vị trí lớp của ô thấp nhất, ô giữ nguyên khung cũ (toạ độ tương đối tính ngược). Không đổi điểm ảnh nào nên ảnh xuất trước / sau giống hệt. Ảnh template không phải `slot` (ảnh tự do, polaroid…) giữ nguyên là phần tử ngoài cùng.

**Chọn.** Giữ `selectedId: string | null`; "đường dẫn" cha → con suy ra từ `parentId` nên không cần kiểu `Selection` (mục 2.2). Bảng ở mục 3 được cài trong hàm thuần `tapResult(doc, selectedId, hitId, onPlus)` ở `canvas/selection.ts`; phần tử trúng được tìm bằng `stage.getIntersection` + `elementOf` (đi ngược cây Konva tới id có trong doc) thay vì dò hình học. Dấu + được tính trúng khi điểm chạm cách tâm ô ≤ `max(12 % cạnh ngắn của ô, 22 px màn hình)`. Ô trống trong khối **hoặc** ảnh trống của template (`fromLayout`) chạm trúng + → chọn ô và mở trình chọn ảnh ngay (Q-E1, D-90); ảnh trống người dùng tự đặt riêng → lần chạm đầu chỉ chọn. Phần tử khoá vẫn chọn được (quy tắc 7).

**Cử chỉ** — cài ngay trong `CanvasStage.tsx` (không tách `gestures.ts`): `onPointerDown/Move/Up` của stage, ngưỡng 6 px, mục tiêu chốt **một lần** khi vượt ngưỡng: không chọn gì → canvas (cảm ứng: cuộn gốc của trình duyệt; chuột: tự dời `scrollLeft/Top`); chọn ảnh trong ô / ảnh khoá trong khung → dời crop (`panCrop`, vẽ trực tiếp qua `liveCrops`); chọn phần tử khoá → không làm gì; còn lại → dời phần tử (có hít đường gióng). Không vượt ngưỡng → `onTap`. Hai ngón (`startPinch`) theo cùng quy tắc: không chọn → zoom canvas; ảnh trong ô → phóng crop; khoá → không làm gì; còn lại → co giãn / xoay phần tử. Khác mục 4: **không** đặt `touch-action: none` và **không** tự làm cuộn quán tính — một listener `touchstart` (không passive) chỉ `preventDefault` khi có phần tử đang chọn (đi được hoặc dời được ảnh bên trong), còn lại để trình duyệt cuộn như cũ. Mọi node đặt `preventDefault={false}` để Konva không tự chặn cuộn. Khi dời / dời crop bằng một ngón, stage phát `gesturestart` / `gestureend` để thanh nổi ẩn / hiện.

**Ô đi theo khối khi đang kéo.** Trong lúc dời, chụm, co giãn hay xoay khối, các node ảnh con được dời theo trực tiếp trên Konva (`canvas/followers.ts`: `startFollow` ghi lại vị trí / góc / scale tương đối của từng ô theo hệ trục khối, `follow` áp lại theo vị trí, góc và `scaleX/Y` hiện tại của node khối, `endFollow` trả node về như cũ trước khi store vẽ lại). Thả tay → một `updateElement` lên khối → `syncLayout` → một bước hoàn tác cho cả khối lẫn ô.

**Khung chọn** (`SelectionTransformer` trong `CanvasStage.tsx`): 4 tay nắm góc (giữ tỉ lệ) + 4 thanh giữa cạnh (kéo một chiều; chữ chỉ có thanh trái / phải), nút xoay **dưới** phần tử (`rotateAnchorAngle = 180`) hít 0 / 90 / 180 / 270°. Ảnh trong ô (và ảnh khoá dời được bên trong): transformer gắn vào một `Rect` vô hình `__whole-picture` (không nhận chạm) bao **toàn bộ ảnh** (`wholePicture`), chỉ có 4 góc, không xoay; kéo góc → `zoomCrop` (không nhỏ hơn mức phủ kín ô); ảnh mờ ngoài ô được `ImageNode` vẽ khi đang chọn (độ mờ 0,32).

**Thước đo kích thước bằng nhau** (mục 7): trong `boundBoxFunc`, so chiều rộng / cao đang kéo với mọi phần tử khác (trừ khối và ô của chính nó) theo px màn hình, ngưỡng 6 px; khớp → hít đúng kích thước đó và vẽ thước xanh (`#3b82f6`, đoạn thẳng + 2 vạch) phía trên (rộng) hoặc bên trái (cao) của phần tử đang kéo và mọi phần tử cùng kích thước, trong nhóm `rulers` của lớp UI; thả tay thì xoá. Chỉ áp dụng khi phần tử không xoay. Đường gióng khi dời bỏ qua các ô của khối đang dời.

**Thanh công cụ khối** (tạm, đủ cho M14): **Bố cục** (mở bộ chọn kiểu chia) · **Xong**; Xoá / Nhân bản / Khoá ở thanh nổi; ⋯ có các mục lớp. Thanh đầy đủ theo product/07 mục 5 làm ở M17.

**Kiểm thử:** `e2e/m14.mjs` (dữ liệu khối, quy tắc chạm 2/3/5/6, kéo không chọn không đụng phần tử, dời khối kèm ô + một lần hoàn tác, thanh cạnh, nút xoay, khung toàn ảnh + phóng bằng góc, thước đo, nhân bản / xoá khối, chuyển đổi dự án cũ từ IndexedDB). m3, m8 được sửa theo quy tắc mới (chạm lần đầu chọn khối; chụm khi không chọn = zoom canvas; khoá vẫn chọn được). `SUITES=m14.mjs node e2e/run.mjs` để chạy riêng.

## 0b. Đã cài ở M15 (2026-10-17, D-93)

**Zoom** (`Editor.tsx`): `zoom` vẫn tính theo `baseScale` (một slide vừa chiều cao vùng làm việc, trừ chỗ cho hàng nút dưới slide). `minZoom` = một slide rộng 25 % chiều ngang vùng làm việc; `fitZoom` = cả dải + nút + vừa chiều ngang (lề 16 px), kẹp trong `[minZoom, 1]`. Trạng thái: `userZoom` (null = đi theo `fitZoom`) và `easing` (giá trị tạm khi đang chuyển 250 ms, `easeZoom`, chạy bằng `requestAnimationFrame` trong các hàm xử lý sự kiện — không đặt state trong effect). Chụm dưới `minZoom`: `minZoom · (z / minZoom)^0.3`, thả tay → `easeZoom(minZoom)`. Chạm đúp vào chỗ không có phần tử (`onFit` của `CanvasStage`, đo bằng `timeStamp` của sự kiện) và nút "Vừa màn hình" → `fitAll()`.

**Nút trên canvas** (`SlideControls.tsx`): nằm trong nội dung cuộn (cuộn cùng canvas), toạ độ = `origin + slideRect · viewScale`. Bỏ `SlideNavigator` (dải thumbnail) và nhãn "1 / 5" phía trên slide. Menu ⋯ là popup tuyệt đối phía trên nút, có lớp nền trong suốt để chạm ra ngoài là đóng.

**Kéo đổi chỗ**: nút ‖ có `touch-action: none` + `setPointerCapture`; cảm ứng phải giữ 200 ms (lệch > 10 px trước đó thì huỷ), chuột kéo ngay. Khi bắt đầu: `beginDraft()`; mỗi lần di chuyển: `updateDraft(() => moveSlideTo(base, from, to))` rồi cộng thêm phần lệch của ngón tay cho các phần tử của slide đang kéo (tập id lấy theo `slideOfUnit` trên bản gốc) → các slide khác nhường chỗ ngay; thả tay: bản nháp = đúng `moveSlideTo` → `applyDraft()` (một bước hoàn tác), không đổi chỗ thì `cancelDraft()`. Viền màu nhấn bao slide đang kéo đi theo ngón tay.

**Thao tác slide** (`lib/project/slides.ts`): `slideOfUnit` (ô theo slide của khối), `insertSlideAt`, `moveSlideTo(from, to)`, `duplicateSlide` (sao chép theo đơn vị lớp: khối + ô, id mới, đặt ngay trên bản gốc). `relocate` dùng `slideOfUnit` nên khối và ô luôn đi cùng nhau.

**Slide mới** (`lib/templates/slideLayouts.ts`, `NewSlideSheet.tsx`): dữ liệu `SLIDE_LAYOUTS` (12) và `SLIDE_GRIDS` (36, sinh từ mô tả hàng / cột), toạ độ 0..1 theo slide; lưới có đường trắng `GRID_LINE` giữa các ô (mép slide không có). `addLayoutSlide(doc, at, layout)` (`templates/apply.ts`) chèn slide rồi thêm một `LayoutElement` phủ slide + các ảnh con trống (`slot: true`). Ô có thể có góc xoay riêng (`LayoutCell.rotation`, cộng với góc của khối — dùng cho polaroid nghiêng).

**Chụm hai ngón** giờ nghe bằng listener gốc (`touchmove/touchend`) trên **cả vùng cuộn**, không qua sự kiện Konva: ngón đặt lên tay nắm khung chọn (Konva chặn lan truyền) hoặc lên nút dưới slide vẫn bắt đầu chụm được; khi bắt đầu chụm, thao tác tay nắm đang dở bị dừng (`stopTransform`).

**Kiểm thử:** `e2e/m15.mjs` theo 8 tiêu chí của product/05.

## 0c. Đã cài ở M16 (2026-10-17, D-95)

**Điền ô trống** (`lib/project/fill.ts`): `fillTargets(doc, activeId)` — "ô trống" là mọi `ImageElement` chưa có ảnh (ô của khối, ảnh trống của template, khung ảnh), không bị ẩn; slide của ô = slide chứa **tâm của ô**; thứ tự đọc trong slide = theo hàng (tâm lệch nhau ≤ 4 % chiều cao slide coi là cùng hàng) rồi trái → phải. `fillCells(doc, targets, assets)` đặt ảnh `i` vào ô `i` với `coverCrop(innerFrame)`. Store: `fillEmpty(activeId, assets)` (một `commit`, bỏ chọn).

**Sheet "Lấp đầy khung"** (`FillFrameSheet.tsx`): store giữ `fillFrame: { id, mode: "fill" | "replace" }` (`openFillFrame` cũng chọn ô đó). Mở từ: chạm trúng dấu + (`tapResult` → `"fill"`, `CanvasStage` gọi `openFillFrame`), nút "Thêm ảnh" của ô trống, nút "Thay" của ảnh. Ba `<input type=file>`: `image/*` multiple, `video/*` multiple, không `accept` (Tệp). Ở chế độ thay: không `multiple`, `replaceImage`. Số tối đa = `fillTargets(...).length`; thừa thì `slice` + thông báo (`notice` trong `Editor`, tự ẩn sau 3,5 s). Bỏ `#replace-photo-input` cũ.

**Nút Ảnh** (`addImages`): dự án trống → bố cục ban đầu như cũ (`placeImages`); có nội dung → `freePhotos(doc, assets, currentSlide)` (lề 6 %, 60 % slide, lệch 40 px), không bao giờ điền ô trống; giới hạn `MAX_FREE_PHOTOS = 10` ở `Editor`.

**Ô của khối** không có tay nắm, không dời / chụm riêng (`SelectionTransformer.fixed`, `onPointerMove`, `startPinch` coi `parentId` như khoá) — trừ khi ô có ảnh thì vẫn dời / phóng ảnh bên trong như M14.

**Kiểm thử:** `e2e/m16.mjs` (ví dụ G H / I J K / L với 1, 3, 7 ảnh; một bước hoàn tác; Thay; nút Ảnh tự do, giới hạn 10).

## 0d. Đã cài ở M17 (2026-10-17, D-96) — phần thanh công cụ, Vị trí, khối

**Thanh công cụ** (`Editor.tsx`): danh sách nút theo loại phần tử, trong viên thuốc trượt ngang; ✕ (aria "Done") bỏ chọn. Ảnh trong ô (`parentId`) không có Vị trí / Khoá / Nhân bản; "Xoá" của ô = làm trống ô. "Làm trống" = `assetId: null`.

**Sheet Vị trí** (`tools/PositionTool.tsx`, `lib/project/position.ts`): là công cụ nháp (`beginDraft` khi mở). `patchDraft(id, patch)` → `patchElement` (khối: `syncLayout` + dàn lại ô nếu đổi khe / lề / kích thước; ảnh: `refitCrop` nếu khung đổi tỉ lệ). Sắp lớp dùng `moveUnit` trên bản nháp. Căn theo `rotatedBounds` so với slide chứa tâm. Lấp đầy co giãn giữ tỉ lệ và đưa góc xoay về 0. Lật: ảnh đổi `flipX/Y`, khối lật toạ độ ô.

**Khối có kiểu chia** (`LayoutElement.layout / gap / padding / radius / fill`): khối tạo từ sheet Slide mới hoặc đổi Bố cục nhớ id kiểu chia → `respaced()` tính lại ô theo khe / lề (`slideCells(def, aspect, gap, padding)`). Khối cũ (gom từ ô lưới cũ) chưa có id → sheet Điều chỉnh chỉ cho Bo góc và Màu nền, ghi chú "chọn kiểu bố cục trước". `radius` áp lên mọi ô trong `syncLayout` (mask `rounded`); `fill` do `LayoutNode` vẽ. `relayout()` (`lib/templates/blockLayout.ts`) dùng lại phần tử ảnh cũ theo thứ tự ô (ảnh trước, ô trống sau), ảnh thừa bỏ `parentId` và đặt bên phải khối; luôn tính từ `doc` gốc (không phải bản nháp) nên thử nhiều kiểu không mất ảnh.

**Kiểu** (`tools/ElementTools.tsx → StyleTool`): `ImageElement.corners?: [tl, tr, br, bl]` thay `cornerRadius` khi bật "Bo từng góc" (`traceMask` nhận một hoặc bốn bán kính); `shadowStyle?: { opacity, angle, distance, blur, color }` (px xuất) — không có thì dùng bóng mặc định cũ (`defaultShadow`). **Bảng màu** (`controls.tsx → Swatches`, dùng chung mọi nơi): `<input type=color>` + ô HEX, 12 màu dùng gần đây lưu `localStorage["ig-layout:colors"]`, 40 màu mặc định xếp 2 hàng trượt ngang.

## 1. Hiện trạng cần thay đổi

Code hiện tại (sau M13) có các điểm sau liên quan trực tiếp tới Editor v2:

- `src/lib/project/types.ts` định nghĩa `ProjectDoc` với một mảng phẳng `elements: CanvasElement[]`. Ô của layout là `ImageElement` có `slot: true`; không có thực thể nào gom các ô của một layout lại.
- `src/store/editor.ts` giữ trạng thái chọn bằng một `selectedId: string | null`.
- Cử chỉ được xử lý rải rác: `canvas/interaction.ts` (quy tắc chạm / kéo theo cảm ứng hay chuột), `canvas/CanvasStage.tsx` (chụm hai ngón: chọn phần tử dưới ngón, phóng ảnh trong ô, hoặc phóng canvas), `canvas/ImageNode.tsx` (kéo ô = dời ảnh trong ô).
- Zoom: `Editor.tsx` tính `baseScale` theo chiều cao vùng làm việc để vừa **một** slide; `zoom` từ `minZoom` (thấy cả dải) đến 4.
- Stage Konva chỉ to bằng vùng nhìn và dời theo cuộn (D-69); `layerRegion()` dùng khi cần ảnh của một vùng.
- Thanh công cụ ở `Editor.tsx` (hàm dựng `bottom`), menu nổi ở `FloatingMenu.tsx`, sheet ở `EditorSheets.tsx` và `tools/*`.

Editor v2 đổi ba thứ nền tảng: **dữ liệu có cấp bậc** (khối bố cục chứa ô), **trạng thái chọn có đường dẫn** (cha → con), và **một nơi duy nhất phân xử cử chỉ**.

## 2. Mô hình dữ liệu

### 2.1 Kiểu mới

> M14 đã cài bản đơn giản hơn (mục 0): `LayoutElement` chỉ có hình học + `cells: {id,x,y,w,h}`, ảnh trong ô là `ImageElement` có `parentId`. Thiết kế dưới (media trong ô, `gap / padding / cellRadius` trên khối) là hướng mở rộng ở M17.

```ts
/** Khối bố cục: phần tử chứa các ô (product/editor-v2/02). */
export interface LayoutElement extends ElementBase {
  type: "layout";
  /** Kiểu chia, để đổi sang kiểu khác mà vẫn biết ô nào là ô nào. */
  layout: string;              // id trong thư viện kiểu chia
  cells: Cell[];               // theo thứ tự đọc của kiểu chia
  gap: number;                 // khe giữa ô, px xuất
  padding: number;             // lề ngoài, px xuất
  cellRadius: number;          // bo góc ô, px xuất
  fill: string | null;         // màu nền khối
}

export interface Cell {
  id: string;
  /** Vị trí trong khối, 0..1 theo kích thước khối (trước khi trừ gap / padding). */
  x: number; y: number; w: number; h: number;
  /** Ảnh / video trong ô; null = ô trống. */
  media: CellMedia | null;
}

/** Ảnh trong ô: tái dùng các trường của ImageElement trừ hình học của khung. */
export type CellMedia = Pick<ImageElement,
  "assetId" | "crop" | "straighten" | "flipX" | "flipY" | "adjust" | "filter" | "media" | "blend">;
```

`CanvasElement` thêm `LayoutElement`.

**Khung (product/11 mục 5, D-88).** Khung là khung tranh: trang trí ở trên, ảnh ở dưới, ảnh lộ qua một hoặc nhiều cửa sổ có hình dạng bất kỳ. Dùng chung cấu trúc khối bố cục, thêm hình cửa sổ và lớp trang trí:

```ts
export interface FrameElement extends ElementBase {
  type: "frame";
  frame: string;            // id trong thư viện khung
  cells: Cell[];            // mỗi cửa sổ là một ô (rect tương đối + media)
}

/** Thư viện khung (dữ liệu, không lưu trong dự án). */
interface FrameDef {
  id: string; group: string;
  aspect: number;                        // tỉ lệ mặc định
  windows: { rect: Rect01; path?: string }[];  // path SVG (0..1) cho cửa sổ không chữ nhật: tim, sao, giấy xé
  overlay: string;                       // ảnh trang trí (PNG / SVG, chỗ cửa sổ trong suốt)
  under?: string;                        // lớp nền dưới ảnh (ví dụ mặt giấy), tuỳ chọn
}
```

Vẽ theo thứ tự: `under` → từng ô (clip theo `path` hoặc `rect`, vẽ ảnh) → `overlay`. Vì `overlay` vẽ sau cùng, băng dính / chữ in / viền luôn nằm trên ảnh. Template ghép từ khung (IMG_4023 → 4025, rõ nhất IMG_4036: 4 mảnh giấy xé chồng mép) là nhiều `FrameElement` trong một template. Vì mép trang trí của khung trên phải che ảnh của khung dưới, mỗi khung vẽ trọn `under → ảnh → overlay` trong lớp của nó, và thứ tự lớp giữa các khung giữ đúng như template; `overlay` của mảnh giấy xé tràn ra ngoài cửa sổ một chút (mép xé) để phủ lên mảnh bên cạnh. `fillTargets` (mục 6) duyệt cả ô của `LayoutElement` lẫn `FrameElement`.

### 2.2 Đường dẫn chọn

> M14: không dùng kiểu `Selection`; giữ `selectedId`, cha suy ra từ `parentId` (mục 0). Kiểu dưới vẫn cần khi làm Chọn nhiều.

```ts
/** Thứ đang được chọn: phần tử ngoài cùng, và (tuỳ chọn) ô bên trong nó. */
export type Selection =
  | null
  | { kind: "element"; id: string }
  | { kind: "cell"; id: string; cellId: string }        // ảnh trong ô / ô trống
  | { kind: "multi"; ids: string[] };
```

Store thay `selectedId` bằng `selection`. Để không phải sửa một lần mọi nơi dùng `selectedId`, giữ một selector tính `selectedId = selection?.kind === "element" ? selection.id : null` trong giai đoạn chuyển tiếp.

### 2.3 Chuyển đổi dữ liệu cũ (`migrate.ts`)

> M14: đã cài là `groupSlots` (mục 0) — khối phủ đúng slide, ô giữ nguyên khung, không đổi điểm ảnh nào.

Khi mở một dự án cũ, gom các `ImageElement` có `slot: true` thành khối bố cục:

1. Nhóm các ảnh `slot` theo slide chứa tâm (`slideOfElement`).
2. Với mỗi nhóm, khối có hộp bao = hộp bao các ảnh (cộng lại khoảng khe ước lượng); mỗi ảnh thành một `Cell` với toạ độ tương đối trong khối, `media` lấy từ ảnh (ảnh `assetId: null` → `media: null`).
3. `layout = "legacy"`; `gap`, `cellRadius`, `fill` suy ra từ khoảng cách giữa ô, `cornerRadius` và màu nền slide.
4. Thứ tự lớp: khối thế chỗ ảnh `slot` đứng thấp nhất của nhóm.
5. Ảnh `slot` bị khoá (`locked`) → khối `locked`.

`migrateDoc` đã chạy mỗi lần mở dự án; viết thêm bước này kèm test so sánh ảnh xuất trước / sau chuyển đổi (phải giống nhau từng điểm ảnh trong sai số nhỏ).

### 2.4 Template

Nguyên tắc (D-89): **template = danh sách phần tử thường** (khối lưới, khung, chữ, hình, sticker…) với vị trí và thứ tự lớp; không có kiểu phần tử "template" riêng. Ví dụ chuẩn: IMG_4036 = 4 `FrameElement` giấy xé chồng mép. Định dạng template trong `lib/templates` vì vậy phải mô tả được mọi loại phần tử, không chỉ ô ảnh, và là **bố cục tự do** (D-89): mỗi phần tử có `x, y, w, h` (tương đối theo slide, được phép âm hoặc > 1 để vắt qua slide / tràn ra ngoài), `rotation`, thứ tự trong mảng = thứ tự lớp, cùng đầy đủ thuộc tính kiểu (độ mờ, hoà trộn, bóng, viền). Không giả định các ô không chồng nhau; không sắp xếp lại lớp khi áp dụng. Định dạng hiện tại (`TemplateSlot`, `TemplateText`, `TemplateShape`) đã có `rotation` và vị trí tự do một phần — mở rộng thành một danh sách phần tử tổng quát (`TemplateElement` = mọi `CanvasElement` không kèm asset), lưu dưới dạng dữ liệu (D-49).

Template trong `lib/templates` hiện sinh ra ảnh `slot`. Đổi `applyTemplate` để sinh `LayoutElement`; phần tử chữ / hình giữ nguyên. Template thiết kế sẵn (`designs.ts`) chuyển sang cùng định dạng. Sheet "Slide mới" (product/05) dùng chính danh sách kiểu chia này (Bố cục ~12, Lưới ~40) — thêm vào `lib/templates/library.ts` dưới dạng dữ liệu (D-49).

## 3. Máy trạng thái chọn

Toàn bộ quy tắc ở product/06 được cài trong **một hàm thuần** để test dễ:

```ts
/** Kết quả một lần chạm: trạng thái chọn mới, hoặc hành động (mở Lấp đầy khung). */
function onTap(doc: ProjectDoc, sel: Selection, hit: Hit): { selection: Selection; action?: "fillFrame" | "editText" }
```

`Hit` có thêm cờ `plus: boolean` — điểm chạm nằm trong vùng dấu + của một ô trống (D-90); kiểm tra cờ này **trước** mọi quy tắc khác. `Hit` là kết quả dò điểm chạm: `{ elementId, cellId? }` của phần tử **ngoài cùng trên cùng** tại điểm đó (dò bằng hình học trên `doc`, không dựa vào cây Konva, để không phụ thuộc thứ tự vẽ của Konva), hoặc `null` nếu trúng vùng trống.

Bảng chuyển trạng thái (Q-E1 / Q-E3 chọn theo đề xuất; đổi bằng cờ cấu hình):

| `sel` hiện tại | `hit` | `selection` mới | `action` |
|---|---|---|---|
| `null` | `null` | `null` | — |
| `null` | phần tử E (có hay không có ô) | `element E` | — |
| `element E` | cùng E, có `cellId` C, ô có ảnh | `cell E/C` | — |
| bất kỳ | **trúng dấu +** của ô trống C trong E (vùng tròn 44 px quanh tâm ô) | `cell E/C` | `fillFrame` (D-90) |
| `element E` | cùng E, có `cellId` C, ô trống, không trúng dấu + | `element E` | — |
| `element E` (chữ) | cùng E | `element E` | `editText` |
| `element E` | cùng E, không có ô (khe) | `element E` | — |
| `element E` / `cell E/*` | phần tử khác F | `element F` (Q-E3, D-88) | — |
| `cell E/C` | cùng ô C | `cell E/C` | ô trống → `fillFrame` |
| `cell E/C` | ô D khác trong E | `cell E/D` [ĐX] | ô trống → `fillFrame` |
| bất kỳ | `null` | `null` | — |

Ghi chú: phần tử bị ẩn (`hidden`) không bao giờ là `hit`; phần tử khoá vẫn là `hit` (chọn được).

## 4. Phân xử cử chỉ

Một module duy nhất `canvas/gestures.ts` nhận sự kiện con trỏ (pointer events) của container stage và quyết định **ai** nhận cử chỉ dựa trên `selection`, theo quy tắc 1 và 4 của product/06:

```
pointerdown → ghi nhận con trỏ; nếu là con trỏ đầu tiên: lưu điểm bắt đầu, chờ
pointermove → vượt ngưỡng 6 px (một ngón) hoặc có ngón thứ hai → xác định mục tiêu MỘT LẦN cho cả cử chỉ:
     selection == null            → mục tiêu = CANVAS (dời / phóng)
     selection = element E        → mục tiêu = E (dời / co giãn / xoay; khoá → không làm gì)
     selection = cell E/C (có ảnh) → mục tiêu = ẢNH TRONG Ô (dời crop / phóng crop / xoay)
pointerup   → kết thúc: ghi MỘT bước lịch sử (updateElement) cho mục tiêu; không vượt ngưỡng → coi là chạm → onTap
```

- Mục tiêu được **chốt khi bắt đầu** cử chỉ, không đổi giữa chừng (tránh việc ngón thứ hai đặt xuống làm đổi mục tiêu).
- Cử chỉ bắt đầu **ở bất kỳ đâu** cũng tác động lên phần tử đang chọn (product/06 quy tắc 4, đề xuất).
- Tay nắm của khung chọn, nút xoay, thanh nổi bắt sự kiện **trước** module này (chúng nằm trên lớp UI) và dừng lan truyền.
- `touch-action: none` trên container stage; cuộn dải slide khi không chọn gì do chính module thực hiện (dời viewport), không dùng cuộn gốc của trình duyệt nữa → bỏ được các mẹo `preventDefault` theo `touchstart` hiện có.
- Trong lúc cử chỉ, cập nhật node Konva trực tiếp (như hiện nay) và chỉ ghi vào store khi thả tay.

Kéo một ngón khi `selection == null` và đang ở mức zoom "thấy hết" → dời viewport ngang (nếu dải dài hơn vùng nhìn), dọc bị khoá [ĐX].

## 5. Viewport và zoom

Thay `baseScale` (vừa 1 slide) bằng hai giá trị:

- `fitAll` = tỉ lệ để cả dải (`canvasSize(doc)`) vừa vùng làm việc (trừ lề, nhóm nút trên, thanh dưới, **sheet đang mở**).
- `minScale` = tỉ lệ để **một slide** rộng 25 % chiều ngang vùng làm việc (theo IMG_3977).

Mức mặc định = `max(fitAll, minScale)`. Phóng tối đa = 5 × mức mặc định. Khi chụm xuống dưới `minScale`: cho đi tiếp với lực cản (`scale = minScale * (raw / minScale) ** 0.3`), thả tay → hoạt ảnh về `minScale`. Khi số slide đổi hoặc sheet mở / đóng / đổi chiều cao: tính lại `fitAll`, hoạt ảnh tới mức mới trong 250 ms (bỏ qua nếu người dùng đang phóng gần một chi tiết [ĐX]).

Vùng làm việc khi sheet mở = phần màn hình phía trên mép trên sheet; sheet báo chiều cao hiện tại qua store (`sheetHeight`).

## 6. Thuật toán điền ảnh (product/09 mục 1.3)

```ts
/** Danh sách ô đích theo thứ tự: ô đang chọn → cùng slide → các slide từ đầu đến cuối. */
function fillTargets(doc: ProjectDoc, active: { elementId: string; cellId: string } | null): CellRef[] {
  const empty = allEmptyCells(doc);               // [{ elementId, cellId, slide, order }]
  // order = vị trí của ô trong khối (thứ tự đọc), khối sắp theo vị trí trên slide (trên → dưới, trái → phải)
  const bySlide = groupBy(empty, (c) => c.slide); // slide = slide chứa tâm của Ô (không phải của khối)
  const out: CellRef[] = [];
  if (active) {
    const first = empty.find((c) => c.elementId === active.elementId && c.cellId === active.cellId);
    if (first) {
      out.push(first);
      out.push(...sortCells(bySlide.get(first.slide)!).filter((c) => c !== first));
    }
  }
  for (const s of [...bySlide.keys()].sort((a, b) => a - b)) {
    if (active && out[0] && s === out[0].slide) continue;
    out.push(...sortCells(bySlide.get(s)!));
  }
  return out;
}
```

Số ảnh tối đa = `fillTargets(doc, active).length`. Ảnh thứ i vào `targets[i]` với `crop = coverCrop(asset, cellSize)`. Một lần `commit` cho cả lô.

**Test bắt buộc:** ví dụ G H / I J K / L của chủ dự án với 1, 3, 6 ảnh (kết quả K; K I J; K I J G H L), cộng các trường hợp: không có ô đang chọn (nút Ảnh khi Q-E2 chọn "điền ô trống"), ô vắt hai slide, khối xoay.

Trình chọn ảnh web (`<input type=file multiple>`) không giới hạn được số lượng; lấy `files.slice(0, n)` và báo nếu cắt bớt.

## 6b. Công cụ ảnh mới (product/09)

- **Làm trống**: `media = null` cho ô; với ảnh tự do, thay bằng một `FrameElement` một cửa sổ chữ nhật trống (giữ x, y, w, h, rotation, kiểu) [ĐX] — hoặc cho phép `ImageElement.assetId = null` như hiện nay (đã có cho ô trống).
- **Cắt rời (vẽ tay)**: lưu đường cắt dạng path tương đối (0..1 theo ảnh) trong `cutout?: string` của ảnh; khi vẽ, clip theo path trước khi vẽ ảnh. Không sửa ảnh gốc → "Khôi phục nền" chỉ cần xoá `cutout` / kết quả xoá nền (giữ asset gốc trong `originalAssetId`).
- **Cắt (crop) hiện cả ảnh**: trong chế độ cắt, vẽ thêm toàn bộ ảnh với độ mờ 35 % phía dưới phần trong khung; kéo trên ảnh = đổi `crop.x/y`, tay nắm khung = đổi `crop` + kích thước khung (ảnh tự do) hoặc chỉ `crop` (ảnh trong ô / khung).
- **Bộ lọc theo nhóm + Tất cả**: `FILTER_GROUPS` đã có; thêm tab "all" ở UI.

## 7. Thước đo kích thước bằng nhau

Khi co giãn phần tử A: lấy tập kích thước `W = {w của mọi phần tử khác}`, `H = {h …}` (sau xoay: dùng kích thước chưa xoay nếu cả hai cùng góc xoay, bỏ qua nếu khác góc [ĐX]). Ngưỡng hít = 6 px màn hình / scale. Nếu `|wA − w| < ngưỡng` → đặt `wA = w` (giữ tỉ lệ nếu đang kéo góc) và vẽ thước ngang trên A và mọi phần tử có cùng `w`. Vẽ trên layer UI (layer thứ ba hiện có) bằng `Konva.Line` + 2 vạch, không qua React mỗi khung hình (như đường gióng hiện tại).

## 8. Bottom sheet

Một component `Sheet` dùng chung: props `snap: [0.5, 0.95]` (hoặc `"content"` cho sheet vừa nội dung), `onClose`, `title`, `onBack?`. Kéo tay cầm / nội dung (khi đã cuộn tới đầu) bằng pointer events. Khi thả (Q-E5, D-88): chiều cao `h` (tỉ lệ màn hình) `< 0.2` → đóng; `0.2 ≤ h < 0.5` → về 0.5; `h ≥ 0.5` → bám 0.5 hoặc 0.95 theo vị trí + vận tốc. Ghi `sheetHeight` vào store để viewport (mục 5) tính lại. Thay thế các sheet hiện có (`ToolSheet`, `ActionSheet`, `LayersSheet`, `ElementsSheet`…) dần qua M17.

## 9. Cấu trúc component đề xuất

```
components/editor/
  Editor.tsx                 khung màn: thanh trên, viewport, thanh dưới, nơi gắn sheet
  viewport/Viewport.tsx      stage + zoom/pan (thay phần cuộn trong Editor.tsx)
  viewport/gestures.ts       phân xử cử chỉ (mục 4)
  viewport/hitTest.ts        dò phần tử / ô tại điểm (hình học trên doc)
  selection/selection.ts     onTap (mục 3) + selector
  selection/SelectionFrame.tsx  khung chọn, tay nắm cạnh / góc, nút xoay, thước đo
  selection/FloatingBar.tsx  🗑 ⧉ ⋯ (thay FloatingMenu.tsx)
  slides/SlideControls.tsx   ‖ ⋯ dưới slide, + sau slide cuối, kéo đổi chỗ
  slides/NewSlideSheet.tsx
  toolbars/                  một file mỗi loại đối tượng (Layout, Image, Text, Sticker…)
  sheets/Sheet.tsx           bottom sheet chung (mục 8)
  sheets/PositionSheet.tsx, StyleSheet.tsx, ColorPicker.tsx, LayoutSheet.tsx, AdjustSheet.tsx
  canvas/LayoutNode.tsx      vẽ khối bố cục + các ô (clip từng ô) — mới
```

`LayoutNode` vẽ khối trong một `Group` có `rotation`; mỗi ô là một `Group` có `clipFunc` theo hình ô (bo góc), bên trong vẽ ảnh bằng logic hiện có của `ImageNode.draw` (tách thành hàm dùng chung `drawPhoto(ctx, media, frame)`).

## 10. Kế hoạch kiểm thử

Mỗi mốc thêm một bộ e2e trong `e2e/` (chạy bằng `pnpm e2e`) bám đúng các mục "Tiêu chí nghiệm thu" của tài liệu product tương ứng. Các bài khó cần chạm thật dùng CDP `Input.dispatchTouchEvent` như các bộ hiện có (m8, m9, m10). Ngoài e2e:

- **Test đơn vị** (hàm thuần): `onTap` theo bảng mục 3; `fillTargets` theo ví dụ mục 6; chuyển đổi dữ liệu cũ (mục 2.3); tính `fitAll` / `minScale`.
- **So sánh ảnh xuất** trước / sau chuyển đổi dữ liệu cũ cho mọi template hiện có.
- **Ảnh chụp màn hình** mỗi màn ở cả chế độ sáng và tối, đính kèm khi báo cáo mốc.
- **Hiệu năng:** `e2e/drag-perf.mjs` phải giữ khung chậm nhất khi kéo ≤ 30 ms (CPU chậm 4×) sau khi thêm `LayoutNode`.

## 11. Rủi ro

- **Chuyển đổi dữ liệu cũ** có thể làm lệch vị trí ô vài pixel → kiểm bằng so sánh ảnh xuất; giữ khả năng mở lại bằng logic cũ nếu chuyển đổi thất bại [ĐX].
- ~~**Bỏ cuộn gốc của trình duyệt**~~ — M14 giữ cuộn gốc khi không chọn gì (mục 0), nên không phải tự làm quán tính. Vẫn cần thử trên iPhone thật: chọn rồi vuốt ở chỗ trống phải dời phần tử, không cuộn.
- **Trình chọn ảnh web** không hiển thị "Chọn tối đa N ảnh" → giải thích bằng thông báo sau khi chọn.
- Khối lượng lớn: M14 đụng gần như mọi file của editor; làm trên nhánh riêng, giữ e2e cũ chạy được tới khi thay thế.
