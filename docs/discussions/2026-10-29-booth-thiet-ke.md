# 2026-10-29 — Booth chụp một mình: tham khảo + đề xuất thiết kế

> Trạng thái: **Đã chốt phần lớn** (D-152 → D-157, 2026-10-29). Còn mở: theme (Q-P4); video hậu trường (Q-P20) gác lại. **Bước 1 đã làm** (§9).
> Nền: [2026-10-29-photobooth.md](2026-10-29-photobooth.md) (phân tích chung, mô hình ô D-147, monorepo D-150, tag D-151).

## 1. Tham khảo (2026-10-29)

| App | Dạng | Luồng | Đáng học |
|---|---|---|---|
| **ONBOOTH** (onboothvn.com) | Web, miễn phí, solo / duo / nhóm 8 | Tên → mở / vào booth → layout → đếm 3-2-1 → giữ ảnh ưng → strip chung | Phong cách cinema (nâu đen, kem, đỏ gạch, serif + mono, lỗ phim), giọng văn thân mật, hỏi lại trước khi thoát mất ảnh |
| **ColorME** (colorme.vn/tools/photobooth) | Web, một máy | Bật camera **hoặc tải ảnh lên** → 5 bố cục theo khổ in → chụp 4 → strip "chạy ra từ máy in" | Hoạt ảnh máy in, **chụp bù từng ô** ("Chụp thêm 3"), ô thiếu hiện hình người xám, xuất PNG / GIF / video / ZIP |
| **WaveSpeed Online Photo Booth** | Web, không đăng ký | Bật camera → chọn số kiểu (1–4), đếm ngược, bố cục (strip 2×6" / strip đôi 4×6") → chọn filter **trước khi chụp** → chụp (Space / Enter, Esc huỷ) → trang trí (khung, sticker, chữ) → PNG / JPG / GIF / video | Phím tắt, chọn filter trước để xem trước đúng màu, strip đôi 4×6 |
| **Candid** | Web | Chọn theme (9 theme, xem trước trực tiếp) → 4 kiểu, có nghỉ giữa các kiểu → tải về | **Theme = khung + filter + lớp phủ** thấy ngay trên camera, ít bước |
| **LensBooth** | Web | Template strip, khung, theme theo mùa, sticker | "Shared Booth" 2 người khác nơi (giống phòng online của mình) |
| **BeautyPlus Photo Booth** | Web | Chụp 4 kiểu liền, 3 giây / kiểu → chọn màu khung, sticker sau | Nhanh, trang trí để sau |
| **Tiệm Hàn** (Life4Cuts, Photoism…) | Máy tại tiệm | Chọn khung → chụp nhiều kiểu liên tiếp có đồng hồ trên màn → chọn ảnh vào khung → filter → in + QR tải ảnh **và video quá trình tạo dáng** | Khung theo mùa / collab, video hậu trường; nhiều tiệm cho chụp dư rồi chọn (nhớ chung, chưa có nguồn chính thức — tra không ra) |
| **LumaBooth, Snappic** (app sự kiện) | iPad / iPhone | — | Người dùng phàn nàn: nhiều thao tác sau khi chụp, khó tìm nút lấy ảnh, ảnh bị lật / xoay; tính năng được xin nhiều: **chụp lại riêng một kiểu** |

Nguồn: [WaveSpeed](https://wavespeed.ai/free-tools/online-photo-booth), [Candid](https://gowtham.is-a.dev/candid), [LensBooth](https://alternativeto.net/software/lensbooth/about/), [BeautyPlus](https://beautyplus.com/photo-booth), [Photoism QR](https://scanapp.org/blog/2026/05/24/scanning-photoism-qr-codes-retrieve-photos-and-videos.html), [LumaBooth — chụp lại từng kiểu](https://feedback.lumabooth.com/p/improvement-for-the-photo-retake-feature), [LumaBooth reviews](https://www.lumabooth.com/lumabooth-for-apple-reviews/), [Life4Cuts](https://www.koreajoongangdaily.com/business/innovative-photo-booth-brand-life-four-cuts-enhances-selfie-experience/11970208).

**Rút ra:**
1. Booth hay đều **ít bước trước khi chụp**: chọn khung / theme là bấm chụp được ngay. Tinh chỉnh để sau.
2. **Thấy kết quả trên camera** (khung, filter của theme) trước khi chụp → đỡ chụp xong mới thấy không hợp.
3. Chụp liền mạch tự động, **có nghỉ giữa các kiểu**, đếm ngược to rõ, loé trắng.
4. Chụp xong phải **chụp lại được từng kiểu**, không bắt chụp lại cả lượt.
5. Màn cuối **một nút tải chính rõ ràng**, các dạng khác xếp sau. Không lật / xoay sai ảnh.
6. Có điểm "vui": strip chạy ra từ máy in, video hậu trường.
7. Không ai trong số này có **editor đầy đủ phía sau** — đây là lợi thế của mình (chuyển sang IG Layout).

## 2. Luồng đề xuất (booth solo)

```
Home booth ─► Chọn khung ─► Chụp ─► (Chọn ảnh) ─► Trang trí ─► Xuất
   │                                                    └─► Mở trong IG Layout
   ├─ Tạo phòng / Vào phòng bằng mã  (phòng online, làm sau)
   └─ Tải ảnh lên  (bỏ qua bước Chụp)
```

### 2.1 Home booth
- 3 thẻ lớn kiểu vé xem phim: **Chụp một mình**, **Tạo phòng chụp chung**, **Vào phòng bằng mã** (ô 4 ký tự ngay trên thẻ). Dòng nhỏ: "Có ảnh sẵn? Tải lên".
- Tag treo dây góc phải → IG Layout (D-151).
- Dưới: **cuộn phim gần đây** (các strip đã làm, lưu trên máy như project của IG Layout) — Đề xuất, xem Q-P19.

### 2.2 Chọn khung (một màn, camera đã bật sẵn phía sau)
```
┌──────────────────────────┐
│  [ camera xem trước,      │  ← đã ướm khung + filter của theme
│    khung đang chọn ]      │
│                          │
├──────────────────────────┤
│ Khung: ▮ Dải 4  ▦ 2×2  ▭ Ngang  ▯ Polaroid  ⣿ 6 ô  … │  (cuộn ngang)
│ Theme: ● Cinema ○ Classic ○ Đen trắng ○ …             │
│ Đếm: 3s · 5s · 10s     Gương ⇄   Camera trước/sau     │
│            [  BẮT ĐẦU CHỤP  ]                          │
└──────────────────────────┘
```
- Số kiểu chụp do khung quyết định (dải 4 → 4 kiểu) + kiểu dư nếu bật (Q-P3).
- Mặc định nhớ lựa chọn lần trước → lần sau vào là bấm chụp luôn.

### 2.3 Chụp
- Toàn màn camera, khung xem trước chỉ còn **viền mờ của ô đang chụp** (biết mình sắp vào ô nào, tỉ lệ ô nào).
- Đếm ngược **8 giây mỗi kiểu, nghỉ 2 giây** (D-154). Số to giữa màn + vòng tròn chạy; **loé trắng** (làm đèn cho camera trước) + tiếng màn trập (tắt được).
- Sau mỗi kiểu: ảnh vừa chụp **bay xuống dải thumbnail** dưới đáy, nghỉ ~2 giây rồi đếm kiểu tiếp.
- Nút: **Tạm dừng**, **Chụp lại kiểu vừa rồi**, **Thoát** (hỏi lại như ONBOOTH nếu đã có ảnh).
- Ảnh chụp ở **độ phân giải gốc của camera**, giữ nguyên khung cảm biến (D-147), cắt vào ô sau.
- Đồng thời quay **video ngắn quanh mỗi lần chụp** (vài giây) để làm "live strip" / video hậu trường — để sau (P3), nhưng thiết kế chừa chỗ.

### 2.4 Chọn ảnh (chỉ khi chụp dư)
- Lưới các kiểu đã chụp; chạm để đưa vào ô theo thứ tự chạm (số thứ tự hiện trên ảnh), chạm lại để bỏ. Đủ ô → nút Tiếp sáng lên.

### 2.5 Trang trí
```
┌──────────────────────────┐
│        [ strip lớn ]      │  ← canvas packages/canvas
│                          │    chạm ô: đổi chỗ (kéo), xoay ô, chụp lại ô này,
│                          │    chỉnh vùng cắt
├──────────────────────────┤
│ Khung · Theme · Filter · Sticker · Chữ · Ngày │  (tab)
│ [ nội dung tab ]                              │
│ [ Xong → Xuất ]                               │
└──────────────────────────┘
```
- **Đổi khung sau khi chụp** được (D-147), app chỉ hiện khung hợp với số ảnh đang có; thiếu ảnh → ô xám "Chụp bù".
- Sticker, chữ, filter **dùng chung với IG Layout** (packages/core + packages/canvas), nhưng giao diện chọn là của booth (to, ít tuỳ chọn, theo theme).
- Không làm lớp, căn chỉnh, mask… — cần thì "Mở trong IG Layout".

### 2.6 Xuất
- Hoạt ảnh **strip chạy ra từ khe máy in** (học ColorME) — 1–2 giây, chạm để bỏ qua.
- **Một nút chính: Lưu ảnh** (dạng theo khung). Bên dưới các dạng khác:
  | Dạng | Ghi chú |
  |---|---|
  | Strip / khung gốc | PNG/JPEG độ phân giải in (300 dpi theo khổ) |
  | **Post 4:5** | 2 strip cạnh nhau, hoặc strip giữa nền theme |
  | **Story 9:16** | strip giữa nền theme / nền mờ |
  | **Carousel** | slide đầu = strip, các slide sau = từng kiểu |
  | Ảnh lẻ (ZIP) | từng kiểu gốc |
  | GIF / video | để sau (P3) |
- **Mở trong IG Layout:** tạo một project mới trong IG Layout (Post 4:5 hoặc Carousel / Story tuỳ chọn) với các ảnh đã chụp + strip, rồi chuyển sang editor (tag trượt sang, cùng hiệu ứng). Ảnh đi qua kho trên máy (IndexedDB), không qua mạng.
- Chia sẻ (Web Share API trên điện thoại) nếu có.

## 3. Bộ khung bản đầu (Đề xuất)

| Khung | Ô | Khổ | Ghi chú |
|---|---|---|---|
| **Dải 4** | 4 ô 4:3 dọc | 2×6" (1:3) | kinh điển |
| **Dải 3** | 3 ô | 2×6" | ô to hơn |
| **Lưới 2×2** | 4 ô | 4×6" | |
| **6 ô mini** | 2×3 | 4×6" | |
| **Dải ngang** | 4 ô ngang | 6×2" | hợp chụp nhóm đứng ngang |
| **Polaroid** | 1 ô vuông | ~3.5×4.2" | |
| **Post 4:5** | 2 dải 4 cạnh nhau (cùng 4 kiểu, hai màu khung) | 1080×1350 | khổ IG thẳng từ đầu |
| **Story 9:16** | 3–4 ô dọc lớn | 1080×1920 | |

Khung lưu dưới dạng dữ liệu (ô + vị trí + tỉ lệ) giống layout của IG Layout → thêm khung mới không cần code.

## 4. Theme bản đầu (Đề xuất, trả lời một phần Q-P4)
Theme = màu khung + filter + font + kiểu dấu ngày + sticker gợi ý.
- **Cinema** (mặc định, cũng là giao diện booth): nền `#15110e`, kem `#efe6d6`, đỏ gạch; lỗ phim hai bên, chữ serif đậm + mono giãn; dấu ngày kiểu vé "SUẤT 20:15 · 29.10.2026".
- **Classic**: khung trắng hoặc đen trơn, logo nhỏ dưới đáy (kiểu tiệm 4 ô Hàn).
- **Đen trắng**: filter Noir có sẵn + khung đen, hạt phim.
- Theo mùa (Tết, Giáng sinh…) thêm dần — chỉ là dữ liệu.

Giao diện booth (nút, chữ, màu) luôn theo **Cinema**, không đổi theo theme đang chọn — theme chỉ áp lên ảnh.

## 5. Kỹ thuật (Đề xuất)
- Route **`/booth`** trong `apps/web` (một app, Q-P11), code giao diện ở `apps/web/src/booth/` — không dùng component của editor (D-150).
- Store booth riêng (zustand) cài đặt `CanvasState` của `packages/canvas` → sticker / chữ / khung vẽ bằng đúng node của IG Layout; stage của booth đơn giản hơn `CanvasStage` (không pinch zoom, không hít).
- Chụp: `getUserMedia` + `ImageCapture.takePhoto()` khi trình duyệt có (ảnh nét hơn), không có thì vẽ khung video ra canvas (như `/labs/booth`).
- Khung, theme, bố cục xuất: dữ liệu trong `packages/core/booth/`. `renderStrip` ở bản thử bỏ đi, thay bằng xuất từ stage.
- Phòng online sau này dùng lại nguyên các màn này, chỉ thêm ô của người khác (D-147, D-148).

## 6. Thứ tự làm (Đề xuất)
1. `/booth` home + Chọn khung + Chụp + Xuất strip (chưa trang trí) — chạy được trọn vòng.
2. Trang trí (theme, filter, sticker, chữ, ngày), đổi khung sau khi chụp, chụp lại từng ô.
3. Xuất Post / Story / Carousel + Mở trong IG Layout.
4. Gắn tag vào home thật của cả hai app.
5. Phòng online dùng lại các màn trên + sửa chung.

## 7. Câu hỏi cho chủ dự án
Xem [open-questions.md](../roadmap/open-questions.md) mục Photobooth (Q-P14 → Q-P20).

## 8. Chủ dự án trả lời (2026-10-29)
- Q-P14 luồng: **ok** (D-152).
- Q-P15 khung: **tối đa 8 khung** (D-152) — giữ đúng 8 khung ở §3.
- Q-P16: **mặc định không lật**, có nút để lật (D-153).
- Q-P17: **đếm 8 giây, nghỉ 2 giây** (D-154).
- Q-P18: **hỏi người dùng**, hoặc cho dạng **"Bất ngờ"** (D-155) — đề xuất: màn hỏi có 4 lựa chọn Post 4:5 · Carousel · Story · 🎁 Bất ngờ; "Bất ngờ" bốc ngẫu nhiên một dạng + một bố cục / template hợp số ảnh, mở editor kèm hoạt ảnh "mở quà"; không ưng thì bấm bốc lại.
- Q-P19: **có lưu** (D-156).
- Q-P3 chụp dư: **ok** (D-157).
- Q-P20: chưa hiểu "video hậu trường" → giải thích bên dưới, chờ trả lời.
- Q-P4: **thêm vài theme**, ví dụ Candy, Alice… → danh sách đề xuất bên dưới, chờ chọn.

### Video hậu trường là gì (giải thích Q-P20)
Ở tiệm Hàn (Photoism, Life4Cuts…), máy **quay video suốt lúc mình tạo dáng**; quét QR trên ảnh in là tải được clip đó — thấy cả lúc cười, chỉnh tóc, đổi dáng giữa các kiểu. Trong app có thể làm hai dạng:
1. **Strip động (live strip):** mỗi ô là một đoạn **2–3 giây quay ngay trước lúc chụp** thay vì ảnh tĩnh → xuất MP4 / GIF, các ô cùng chuyển động trong khung. Hợp Story / Reels.
2. **Video hậu trường:** ghép các đoạn đó nối nhau (kiểu "đang tạo dáng → tách! → ảnh"), kèm tiếng màn trập.
Cách làm: trong lúc đếm ngược, máy ghi video camera (MediaRecorder, chỉ giữ vài giây cuối trước mỗi lần chụp) — không tốn thêm thao tác của người dùng. App đã có phần xuất video (mediabunny) nên dùng lại được. Đề xuất vẫn là **để sau** (sau khi booth ảnh tĩnh chạy ổn), nhưng thiết kế màn Chụp chừa chỗ từ đầu.

### Theme đề xuất thêm (Q-P4)
Theme = màu khung + filter + font + dấu ngày + bộ sticker gợi ý. Tất cả tự vẽ / dùng tài nguyên có sẵn, **không dùng hình nhân vật có bản quyền** (Alice dựa theo truyện gốc — đã hết bản quyền — nhưng tự vẽ, không lấy hình phim Disney).

| Theme | Cảm giác | Khung / chi tiết | Filter | Font |
|---|---|---|---|---|
| **Cinema** | rạp phim cũ | nâu đen, lỗ phim kem, dấu vé "SUẤT 20:15" | ấm, hạt phim | serif đậm + mono |
| **Classic** | tiệm 4 ô Hàn | trắng / đen trơn, logo nhỏ | tự nhiên | sans gọn |
| **Đen trắng** | ảnh báo cũ | đen, hạt phim | Noir | mono |
| **Candy** | kẹo ngọt, pastel | hồng – bạc hà – vàng bơ, viền lượn sóng, chấm bi, kẹo mút / kẹo cứng / tim | sáng, hồng nhẹ | tròn, mập |
| **Alice** | xứ sở thần tiên | giấy cũ, hoa văn lá bài ♠♥♦♣, tách trà, đồng hồ bỏ túi, chìa khoá, viền hoa hồng | ấm dịu, hơi mơ | serif cổ điển, chữ nghiêng |
| **Y2K** | đầu 2000 | chrome / holographic, ngôi sao lấp lánh, bong bóng chat, viền điện thoại nắp gập | tương phản, ánh tím xanh | pixel / bubble |
| **Dreamy** | mơ màng | mây, sao, trăng, nền xanh tím nhạt, hiệu ứng loá | mờ sáng, hồng tím | viết tay |
| **Polaroid / Film** | máy film | viền kem dày, chữ viết tay dưới ảnh, dấu ngày cam kiểu máy film | ấm, phai màu | viết tay + số cam |
| **Báo / Tạp chí** | bìa tạp chí | tiêu đề lớn, cột chữ giả, mã vạch, "ISSUE 29.10" | tương phản | serif tạp chí |
| **Tết** (theo mùa) | Tết Việt | đỏ – vàng, hoa mai / đào, bao lì xì, câu chúc | ấm đỏ | serif / thư pháp |
| **Giáng sinh** (theo mùa) | Noel | xanh – đỏ, tuyết, dây đèn | lạnh nhẹ | serif |

Đề xuất bản đầu: **Cinema, Classic, Đen trắng, Candy, Alice, Y2K** (6 theme); Dreamy, Polaroid, Báo, Tết, Giáng sinh thêm dần (chỉ là dữ liệu + sticker).

## 9. Bước 1 đã làm (2026-10-29)
Chủ dự án: "cứ tạm gác video hậu trường lại vì chưa hiểu mục đích. bắt đầu đi" → Q-P20 gác lại; làm bước 1 trên nhánh `monorepo`.

- **`/booth`** (`apps/web/src/booth/`, giao diện riêng kiểu Cinema, font Playfair Display + Space Mono chỉ tải ở trang này; chuỗi EN / VI trong `packages/core/i18n` khoá `booth.*`).
- **Sảnh:** 3 thẻ vé (Chụp một mình; Tạo phòng / Vào phòng bằng mã ghi "Sắp có"), "Có ảnh sẵn? Tải lên", **cuộn phim gần đây** (D-156, IndexedDB riêng `ig-layout-booth`), **tag treo** góc phải về IG Layout. Tiêu đề chừa chỗ bên phải cho tag.
- **Chọn khung:** camera bật sẵn, **ô sáng trên camera đúng bằng phần ảnh sẽ vào ô** (cắt giữa khung cảm biến, cùng cách `render.ts` cắt), phần ngoài tối đi; 8 khung có hình thu nhỏ vẽ bằng chính hàm vẽ lúc xuất; tuỳ chọn chụp dư; đổi camera trước / sau. Khung, chụp dư, tiếng nhớ cho lần sau.
- **Chụp:** bắt đầu khi camera đã có hình; số đếm to + vòng chạy, 8 s / kiểu, nghỉ 2 s (D-154); loé trắng + tiếng màn trập (tạo bằng Web Audio, tắt được); ảnh vừa chụp rơi xuống khay; Tạm dừng, Chụp lại kiểu vừa rồi, Thoát (hỏi lại nếu đã có ảnh). Ảnh chụp ở độ phân giải gốc, không lật (D-153).
- **Chọn ảnh** (khi chụp dư, D-157): chạm theo thứ tự, có số thứ tự.
- **Kết quả:** ảnh **trượt ra từ khe máy in** (chạm để bỏ qua); một nút chính **Lưu ảnh** (JPEG đúng khổ, vd. dải 4 = 600 × 1800); **chạm một ảnh → Chụp lại kiểu đó**; ô thiếu (tải lên ít ảnh) → **Chụp bù**; Lật ảnh; Chụp lượt mới; Về sảnh; Xoá cuộn.
- **Dữ liệu dùng chung** ở `packages/core/booth/`: `frames.ts` (8 khung = dữ liệu), `render.ts` (vẽ khung Cinema: lỗ phim, ô trống hình người xám, chữ "Photobooth" + ngày giờ kiểu vé), `camera.ts` (mở camera / camera giả / chụp — trang thử phòng `/labs/booth` cũng dùng), `storage/booth.ts`.
- Chưa làm (các bước sau): theme khác, filter, sticker, chữ; đổi khung sau khi chụp; xuất Post / Story / Carousel; Mở trong IG Layout; tag ở home IG Layout (chờ Q-P12); phòng online.
- Kiểm tra: `e2e/booth-solo.mjs` (camera giả của Chromium) — đủ luồng trên, 4 kiểu mất ≈ 39 s đúng 4 × 8 + 3 × 2.

## 10. Tag treo ở home IG Layout (2026-10-29)
Chủ dự án: "cho thêm cái tag treo ở home để vào booth đi".
- Home IG Layout (chỉ màn chính, không hiện khi mở nhóm template / tìm kiếm / chi tiết — D-151): tag **màu kem, dây sáng có bóng mờ** (bản tối chìm vào banner ảnh tối). Ghim cách mép phải 64 px: dây đi giữa thanh tab và nút tìm kiếm, tag treo trên banner.
- Kéo xuống / kéo ngang quá ngưỡng hoặc chạm → `/booth`. Ở sảnh booth có tag ngược lại về IG Layout.
- Vật lý giữ mặc định của `/labs/tag`; hướng kéo / độ nặng vẫn chờ chủ dự án thử (Q-P12).

## 11. Sửa sau khi chủ dự án thử (2026-10-29)
- **"Vào booth chẳng có gì, ấn vào một mục thì lỗi"** (`Cannot read properties of undefined (reading 'replace')`): trình duyệt chạy code cũ chưa có chuỗi `booth.*` (khả năng cao: service worker của một bản build production cũ trên localhost giữ cache). Sửa: khi chạy dev, app **tự gỡ service worker** còn sót; thiếu chuỗi thì hiện tên khoá thay vì sập; `/booth` cũng đăng ký service worker như IG Layout.
- **"Sao chữ ngược hết thế?"**: máy không mở được camera → dùng hình thử, mà hình xem trước camera trước được lật như gương → chữ hình thử bị ngược. Sửa: **hình thử không bao giờ lật**; nói rõ **vì sao** không mở được camera (trình duyệt chặn → bấm biểu tượng camera trên thanh địa chỉ; không có camera; camera đang bị app khác dùng như Zoom / Meet; trang không an toàn) + nút **Thử lại camera**. e2e `booth-solo.mjs` thêm mục 8 (camera bị chặn).

## 12. Làm lại giao diện booth (2026-10-29)
Chủ dự án: "giao diện trông boring thế? … onboothvn làm giao diện rất đẹp, colorme có animation máy in ảnh xong nhè ảnh ra khá hay". Bước 1 mới làm cho chạy trọn luồng; nay làm giao diện thật.

**Xem lại ONBOOTH** (chụp màn hình bằng trình duyệt tự động, 390 px): đẹp nhờ cảm giác **đồ in thật** — thẻ vé giấy kem hơi nghiêng trên nền tối có vân, khía tròn hai bên, viền mực đậm, **bóng đổ cứng lệch** (nút lún xuống khi bấm), chữ display rất đậm + nhãn mono giãn chữ màu đỏ, dải chữ chạy trên cùng, camera trong **khung polaroid** nghiêng, thanh dưới màu kem. ColorME chặn trình duyệt tự động (Cloudflare) → theo ảnh chủ dự án gửi trước đó (máy in nhả ảnh).

**Làm theo hướng đó nhưng là kiểu riêng** (không chép ONBOOTH):
- Font display **Fraunces** (SOFT / WONK — dáng chữ biển rạp cũ, có tiếng Việt) + Space Mono.
- Bộ UI giấy (`apps/web/src/booth/ui.tsx`): `Paper` (kem, viền mực, bóng cứng, khía vé), `Btn` (bóng cứng, lún khi bấm), `Label`, `Perforation`, `Ticker` (dải chữ chạy màu hổ phách), `Bulbs` (biển đèn bóng chạy quanh), nền "sàn rạp" (đèn rọi ấm từ trên + vân chấm).
- **Sảnh:** dải chữ chạy, biển đèn "Đang chiếu · Photobooth", vé "Vé vào cửa" (nút đỏ Chụp một mình, hai cuống vé chờ "Sắp có", đường xé, tải ảnh lên), ảnh in gần đây **dán băng keo**, nghiêng xen kẽ.
- **Chọn khung:** thanh trên giấy kem + dải lỗ phim đỏ; **camera trong polaroid** đúng hình ô (phần ảnh trong polaroid = đúng phần vào ô, không còn vùng tối); khung là thẻ giấy, khung đang chọn nổi lên, nền mực, bóng đỏ; ô chụp dư kiểu đánh dấu ✕ đỏ.
- **Chụp:** polaroid ghi "bạn · 01/04", số đếm chữ display viền mực + vòng hổ phách, 3 giây cuối vòng đỏ; ô vuông nhỏ cho từng kiểu (đã chụp đỏ, đang chụp hổ phách); ảnh vừa chụp rơi xuống khay thành ảnh in nhỏ nghiêng.
- **Chọn ảnh:** tờ contact sheet — phim tối, số khung "▸ 01A", chọn = **khoanh bút sáp đỏ** + số thứ tự.
- **Kết quả:** **máy in** (thân nâu, biển "Photobooth" phát sáng, đèn hổ phách nhấp nháy khi in → xanh khi xong, khe in); ảnh **bị đẩy ra từng nấc như mô-tơ** (hơi lắc), kèm **tiếng mô-tơ** (Web Audio, theo nút tiếng); in xong ảnh hơi nghiêng; "Ảnh nóng hổi đây!"; các nút phụ gọn một hàng.
- Giảm chuyển động (prefers-reduced-motion): tắt các chuyển động, ảnh in hiện ngay.
- Lỗi gặp khi làm: một selector CSS có ký tự `[` trong chuỗi làm bộ dịch CSS của Tailwind bỏ mất mọi `@keyframes` phía sau (ảnh in đứng yên, kẹt "Đang in…") → bỏ ký tự đó, ghi chú trong `globals.css`.

## 13. Bước 2a: Trang trí (2026-10-29)
Chủ dự án: "làm tiếp đi" → làm bước 2 theo đề xuất; **6 theme bản đầu theo đề xuất §8** (chưa được duyệt riêng — Q-P4 vẫn mở để đổi). Sticker để bước 2b (cần phần chạm / kéo / xoay của packages/canvas).

- Màn **Trang trí** (nút ✎ cạnh Lưu ảnh): bản in to ở trên, 4 thẻ dưới:
  - **Khung** — đổi khung sau khi chụp (D-147); khung cần nhiều kiểu hơn → ô thiếu → "Chụp bù".
  - **Theme** — mỗi thẻ là bản in thu nhỏ bằng chính ảnh của mình trong theme đó. Chọn theme thì filter về filter gợi ý của theme (vẫn đổi được).
  - **Filter** — "Không" + 11 filter chọn từ bộ của IG Layout (Honey 400, Cotton, Blossom, Peach, Snapshot, Flash, Kyoto, Tokyo 90, Aero Pink, Noir, Sepia), xem trước trên ảnh đầu; chạy đúng pipeline màu của IG Layout (`packages/core/color`, WebGL).
  - **Chữ** — dòng chữ riêng (để trống = không có chữ), bật / tắt ngày giờ, nút về chữ theo theme.
- **Theme = dữ liệu** (`packages/core/booth/themes.ts`): màu giấy (màu hoặc dải chuyển), mực, nhấn, ô trống, lỗ phim, kiểu trang trí vẽ bằng code (chấm bi / chất bài ♠♥♣♦ + viền đôi / lấp lánh 4 cánh / hạt phim), viền + bo ô, font chữ tiêu đề, filter gợi ý:
  | Theme | Giấy | Trang trí | Chữ | Filter gợi ý |
  |---|---|---|---|---|
  | Cinema | nâu đen, lỗ phim kem | — | Fraunces | — |
  | Classic | trắng | — | Be Vietnam Pro, chữ thường | — |
  | Đen trắng | đen, lỗ phim | hạt phim | mono, chữ hoa | Noir |
  | Candy | hồng | chấm bi trắng + bạc hà (tránh vùng chữ), viền trắng bo tròn | Coiny | Blossom |
  | Alice | giấy cũ chuyển màu | chất bài đỏ / đen quanh mép + viền đôi | Cormorant nghiêng "Wonderland" | Peach |
  | Y2K | tím – trắng – xanh | lấp lánh hồng / trắng, viền trắng bo | Bungee chữ hoa | Aero Pink |
- Ô có viền: ảnh thụt vào trong viền, khe giữa các ô giữ nguyên.
- Font theme (Coiny, Cormorant Garamond, Bungee — đều có tiếng Việt) chỉ tải khi bản in dùng tới.
- Lưu vào cuộn phim: theme, filter, chữ, ngày giờ (mở lại còn nguyên); ảnh lưu ra và ảnh thu nhỏ ở sảnh vẽ đúng theme + filter.
