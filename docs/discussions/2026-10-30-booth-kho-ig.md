# 2026-10-30 — Booth: đưa kho IG Layout sang để theme "đã mắt" hơn (Q-P27, D-167)

> Trạng thái: **Đề xuất** — 3 phương án, chờ chủ dự án chọn (Q-P36). Chưa code.

## Vấn đề
Chủ dự án: theme bản in "chưa đã mắt" vì **đơn giản quá, thiếu item, chưa đa dạng**; liên quan khung, template, sticker, hình… bên IG Layout; đưa sang thì **rất nhiều**, nên UI phải nghiên cứu.

Nhìn lại 27 theme mới (§16 [2026-10-30-booth-onbooth-video-theme-sanh.md](2026-10-30-booth-onbooth-video-theme-sanh.md)):
- Bản in dải dọc: **ảnh che gần hết giấy**, hoạ tiết nền chỉ lộ ở mép → đổi nền / hoạ tiết bao nhiêu cũng không "đã" hơn bao nhiêu.
- Cái làm bản in tiệm Hàn / ONBOOTH trông "đã" là **thứ nằm trên và quanh ảnh**: khung ô có hình (phim, polaroid, tem, giấy xé), băng dính dán chéo mép ảnh, sticker tràn ra ngoài ô, ánh sáng / loá phủ lên, chữ có kiểu — và **bố cục do người thiết kế sắp sẵn**.

## Kho IG Layout hiện có (đếm 2026-10-30)
| Loại | Số lượng | Ví dụ |
|---|---|---|
| Khung có cửa sổ ảnh | 294 (17 gói) | phim, polaroid / instant, giấy xé (3 gói), khung tranh, khung mạ vàng, khung gỗ, tem, bưu thiếp, album, máy ảnh, sổ, phong bì |
| Sticker ảnh | 354 (17 gói) | Giáng sinh, Tết, Trung thu, lễ hội, băng dính washi, giấy ghi chú, mẩu giấy, vẽ tay, chim / bướm, thực vật, nhãn cổ, tem, bưu thiếp, bản đồ, di sản Việt Nam, tranh Nhật |
| Lớp phủ ánh sáng | 52 (3 gói) | hạt phim, loá ống kính, vệt sáng |
| Chất liệu nền | 42 (6 gói) | giấy, vải, gỗ, đá, thiên nhiên |
| Template | ~450 (28 nhóm) | xé giấy, phim, scrapbook, Tết, mùa đông, lễ hội… |
| Bộ sưu tập | 44 | có gắn mùa: tet, halloween, christmas, newYear, midAutumn… |
| Font | 78 | có tiếng Việt |

Booth hiện chỉ dùng: sticker vẽ bằng code (8 nhóm), 10 loại hoạ tiết vẽ bằng code, theme = giấy + hoạ tiết.

## Tham khảo
- **Tiệm Hàn (Photoism, Life4Cuts…)**: người chụp **chỉ chọn một khung đã thiết kế sẵn** — khung theo mùa (Giáng sinh, Halloween, Valentine…), theo trend, **khung collab** với nhân vật / thương hiệu (Photoism × Kkam & Ant Giáng sinh 15/11 – 31/12; Life4Cuts × Moomin đã tới đợt 7). Không có thư viện sticker: độ "đã" đến từ khung do designer làm.
- **ONBOOTH** (IMG_4211): sau khi in, "Pick a theme pack" — hai tab **Simple / Patterns**, các gói vuốt ngang có chấm trang; mỗi gói là cả bộ.
- **Canva** (thư viện rất lớn): bảng Elements = **ô tìm kiếm + danh mục** (Graphics, Photos, Stickers, Frames, Shapes…) + hàng **"Dùng gần đây"** ở đầu; danh mục hiện ra thay đổi theo loại thiết kế.
- **Picsart** (11.000+ sticker): **tìm kiếm** là lối vào chính, kèm tab Mới / Phổ biến / Thịnh hành, chia theo chủ đề, và **gói sticker** (100+ gói).
- **Bộ SDK sửa ảnh (PhotoEditor SDK / IMG.LY)**: cho bật / tắt từng danh mục, hoặc "làm phẳng" — bỏ danh mục, hiện thẳng một số sticker đã chọn → thư viện càng nhỏ càng nên làm phẳng.

Rút ra: **app chụp nhanh** (tiệm Hàn, ONBOOTH) cho chọn **bộ thiết kế sẵn**, ít lựa chọn mà mỗi lựa chọn đều đẹp; **app chỉnh sửa** (Canva, Picsart) mới mở cả kho + tìm kiếm. Booth là app chụp nhanh; editor đầy đủ đã có ở IG Layout ("Mở trong IG Layout").

---

## Phương án 1 — Bộ theme đầy đủ (theme = cả bộ item, tự sắp)
Mỗi theme bản in thành một **bộ** lấy từ kho IG: giấy / chất liệu nền + **khung ô** (từ gói khung: phim, polaroid, tem, giấy xé…) + **6–12 item** (sticker, băng dính, ghi chú, ánh sáng) + font. Chọn theme là app **tự sắp** item theo luật: góc bản in, khe giữa các ô, **dán chéo mép ảnh** (băng dính), cạnh dòng chữ, tràn nhẹ ra ngoài ô; tránh mặt (giữa ô). 🎲 xáo lại cách sắp. Item vẫn kéo / xoá / thêm được như sticker bây giờ.
```
 Theme ▸ [Ca-rô Noel] [Ngày tuyết] [Ánh vàng] …   ← vuốt như bây giờ
 ┌───────────┐
 │▒▒ washi ▒▒│  ← băng dính dán chéo mép ô
 │ ┌───────┐ │
 │ │ ảnh 1 │🎄  ← sticker tràn ra ngoài ô
 │ └───────┘ │
 │ ┌───────┐ │
 │ │ ảnh 2 │ │  ← khung ô = polaroid / phim / tem (từ gói khung)
 │ └───────┘ │
 │ ✨ Merry ✨│  ← font + sticker quanh chữ, loá sáng phủ nhẹ
 └───────────┘
 Thẻ Sticker: hàng đầu "Bộ của theme này" (8–12 item), dưới là các nhóm cũ
```
- **Giao diện:** gần như giữ nguyên (thẻ Theme như cũ; thẻ Sticker thêm một hàng "Bộ của theme"). Không phải học gì mới.
- **Lợi:** đẹp ngay một chạm; hợp tinh thần booth "ít bước"; dùng lại kho sẵn có, không phải tải thêm.
- **Hại:** phải chọn item cho từng theme (33 theme × ~10 item) — làm nhanh được nhờ bộ sưu tập có gắn chủ đề, rồi tinh chỉnh tay; cần **luật tự sắp** đủ tốt cho mọi khổ (dải, lưới, ngang, Post, Story).
- **Công sức:** vừa. Phần khó nhất là luật tự sắp.

## Phương án 2 — Kho IG trong booth (kiểu Canva / Picsart)
Thẻ **Sticker** thành bảng **Thêm** có **ô tìm kiếm** và các tab: Sticker · Khung ô · Băng dính & giấy · Ánh sáng · Chữ & hình. Đầu bảng: **"Hợp với theme"** (lọc theo bộ sưu tập của theme đang chọn), **"Dùng gần đây"**; dưới là các gói. Kéo thả lên bản in.
```
 ┌──────────────────────────────┐
 │ 🔍 Tìm: "tuyết", "tim", "tem"… │
 │ Sticker · Khung ô · Băng dính · Ánh sáng · Chữ │
 │ Hợp với theme ▸ ⛄ 🎁 🦌 ❄ 🎄 …   │
 │ Dùng gần đây  ▸ ⭐ 🎀 …          │
 │ Giáng sinh (24) ▸ …   Washi (40) ▸ … │
 └──────────────────────────────┘
```
- **Lợi:** dùng **toàn bộ** kho, tự do nhất.
- **Hại:** **lặp lại editor IG Layout** (đã có nút Mở trong IG Layout); bảng to, rối trên điện thoại, ngược với tinh thần booth; người dùng phải tự trang trí mới đẹp — nhiều người sẽ không làm.
- **Công sức:** lớn (tìm kiếm cần gắn từ khoá song ngữ cho ~700 item, ảnh thu nhỏ, tải lười theo gói).

## Phương án 3 — Mẫu bản in thiết kế sẵn (kiểu tiệm Hàn)
Thêm một lớp trên theme: **mẫu bản in** — bố cục đã sắp sẵn của khung + item + chữ, **chuyển từ template IG** (xé giấy, phim, scrapbook, tường polaroid, tem, bưu thiếp…) sang các khổ booth (dải 3 / 4, lưới 2×2, Post, Story). Chọn mẫu ở **màn chọn khung** (camera hiện trong ô của mẫu) hoặc sau khi chụp ở **màn kết quả** (vuốt qua các mẫu như "Pick a theme pack" của ONBOOTH). Theme lúc đó chỉ **đổi màu** mẫu.
```
 Màn kết quả:
   ◀ [ mẫu Phim cũ ] [ mẫu Giấy xé ] [ mẫu Tem thư ] ▶   ← vuốt, ảnh của mình đã nằm trong
        ● ○ ○ ○ ○
   Theme màu: ● ● ● ● ●
```
- **Lợi:** "đã mắt" nhất mỗi lần chạm (mỗi mẫu do người sắp tay); trùng với mức 2 của D-164 (template IG làm khung) — đằng nào cũng làm; hợp chụp theo mùa / sự kiện như khung collab.
- **Hại:** mỗi mẫu ứng với một số ô + một khổ → cần nhiều mẫu cho đủ khổ; bố cục cố định (sửa được nhưng ít tự do hơn PA1); cần bộ chuyển template IG → mẫu booth (ô ảnh của template thành ô chụp).
- **Công sức:** vừa → lớn (bộ chuyển + chọn / chỉnh ~30–50 mẫu đầu).

## So sánh
| | PA1 Bộ theme | PA2 Kho trong booth | PA3 Mẫu thiết kế sẵn |
|---|---|---|---|
| Đẹp ngay khi chạm | ●●○ | ●○○ | ●●● |
| Tự do trang trí | ●●○ | ●●● | ●○○ |
| Gọn trên điện thoại | ●●● | ●○○ | ●●● |
| Dùng được bao nhiêu kho | một phần (chọn lọc) | toàn bộ | một phần (qua template) |
| Trùng việc đã có | không | trùng editor IG | trùng D-164 mức 2 (là một) |
| Công sức | vừa | lớn | vừa → lớn |

## Đề xuất
**PA1 trước, PA3 sau, PA2 bản nhỏ nếu cần.**
1. **PA1** cho mọi theme "đã" hơn ngay, giao diện không đổi; luật tự sắp làm xong dùng lại được cho PA3.
2. **PA3** = mức 2 của D-164 (template IG làm khung) — làm khi PA1 xong, bắt đầu với mẫu theo mùa (Giáng sinh, Tết) vì sắp tới mùa.
3. **PA2** chỉ ở dạng nhỏ: thẻ Sticker thêm các gói ảnh IG **hợp với theme** (không tìm kiếm, không cả kho); ai muốn trang trí kỹ thì "Mở trong IG Layout".

## Câu hỏi cho chủ dự án
Q-P36 trong [open-questions.md](../roadmap/open-questions.md).
