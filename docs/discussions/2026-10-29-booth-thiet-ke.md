# 2026-10-29 — Booth chụp một mình: tham khảo + đề xuất thiết kế

> Trạng thái: **Đã chốt phần lớn** (D-152 → D-157, 2026-10-29). Còn mở: theme (Q-P4), video hậu trường (Q-P20). Chưa code.
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
