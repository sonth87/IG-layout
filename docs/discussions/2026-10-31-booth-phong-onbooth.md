# 2026-10-31 — Phòng chụp chung: học ONBOOTH Duo / nhóm, đổi chủ phòng, link phòng cũ, lag khi sửa chung

> Ảnh: `sample/6/IMG_4221 → 4237` + `chon anh tren ipad.png` (chủ dự án thử ONBOOTH bằng 2 máy, chế độ Duo và nhóm).
> Trạng thái: **Đã làm** phần sẵn sàng, "Chuẩn bị", đổi chủ phòng, kiểm tra link, giảm lag (D-168). Chờ: deploy server phòng; chụp dư + mỗi người tự chọn ảnh trong phòng (Q-P37).

## Ý của chủ dự án
1. Duo ONBOOTH chụp được nhiều tấm (cần 4 tấm thì chụp nhiều lần). Trước khi bấm chụp **mọi người phải sẵn sàng**: máy chủ phòng có nút bắt đầu bị khoá, máy người khác có nút **Ready** và dòng **Waiting for host to start**. Trước lần đếm đầu tiên có thông báo **Get ready**.
2. Chủ phòng thoát / mất kết nối → **chuyển chủ phòng cho người khác**, không đóng phòng.
3. Mở link phòng đã đóng → đang hiện **màn chờ rồi mới bị đá về sảnh**, không hợp lý. Nên: ở **sảnh**, hiện đang kiểm tra; có phòng thì vào, không thì báo "phòng không tồn tại" và ở lại sảnh.
4. Sửa chung **khá lag** — có cách nào không?

## Đọc ảnh ONBOOTH
| Ảnh | Thấy gì |
|---|---|
| 4221, 4225–4226 | **Duo**: một polaroid **chia đôi**, mỗi nửa là camera một người (nhãn "H (you)", "T"…), dưới ghi DUO. Người còn lại bấm sẵn sàng thì nửa của họ có nhãn **READY ✓**. Chủ phòng: nút **PICK A LAYOUT →** chỉ sáng khi mọi người sẵn sàng (trước đó "WAITING FOR EVERYONE…" mờ). |
| 4222, 4227 | Chủ phòng chọn bố cục Duo: Classic strip 3 / 4, Stack polaroid 4; "the booth takes 6 shots — you keep your favorite 4" → **Duo cũng chụp dư** (6 kiểu, giữ 4). Nút START SHOOTING mờ khi "waiting for both cameras to turn on…". |
| 4228–4230 | Chụp: "SHOT 1/6", thẻ đếm ở góc + gợi ý dáng, **mỗi kiểu là ảnh ghép cả hai nửa** (hai người cùng một khoảnh khắc); sau mỗi kiểu "Next shot coming up…"; ô chờ đánh số. |
| 4231, 4233 | "Pick your favorites — your picks are just for you, everyone chooses their own": **mỗi người tự chọn 4 / 6**. |
| 4234–4236 | **Nhóm** (≥ 3): mỗi người một polaroid, chủ phòng có nhãn ★ HOST. Khách: nút **I'M READY** → **READY ✓** (xanh) + nhãn trên polaroid. Khách thấy "HOLD ON — Host is setting up the booth…", bố cục **Grid / Strip**, "only the host can choose the layout", "**one countdown, one shot — all 2 of you in frame**", "WAITING FOR HOST TO START…". |
| 4237 | **GET READY** to giữa màn + gợi ý dáng ("FLEX THOSE MUSCLES!") trước lần đếm đầu. |
| chon anh tren ipad | iPad ngang: bản in bên trái có ô "THÊM ẢNH", lưới ảnh để chọn bên phải (tiếng Việt). |

**So với phòng của mình:** mình đã làm đúng kiểu "mỗi kiểu là ảnh ghép mọi người" (cả Duo lẫn nhóm — mỗi ô của bản in ghép camera mọi người, `tileShot`). Khác biệt: chưa có **sẵn sàng**, **Get ready**, **chụp dư + mỗi người tự chọn** trong phòng.

Về "duo cần 4 tấm thì 2 người chụp 2 lần": theo ảnh, ONBOOTH Duo chụp **6 kiểu, mỗi kiểu có cả hai người** (hai nửa ghép), rồi **mỗi người tự chọn 4** — không phải mỗi người chụp riêng 2 tấm.

## Đã làm (D-168)
### 1. Sẵn sàng + Chuẩn bị
- Khách có nút **"Tôi sẵn sàng"** (bấm lại để huỷ) + dòng "Bấm khi bạn đã sẵn sàng — chủ phòng bắt đầu khi mọi người xong" → sau khi bấm: "Chờ chủ phòng bấm chụp…". Polaroid người đã sẵn sàng có nhãn xanh **Sẵn sàng ✓**.
- Nút chủ phòng **khoá** và ghi **"Chờ mọi người · 1/2 sẵn sàng"** tới khi đủ, rồi thành "Chụp N kiểu". Người mới vào / người tải lại trang là chưa sẵn sàng. Bắt đầu chụp xong thì mọi người về "chưa sẵn sàng" cho lượt sau.
- Trước lần đếm đầu: thẻ **"Chuẩn bị!"** to giữa màn + **gợi ý dáng** (cùng bộ 16 câu của chụp một mình), 2,5 giây, trên mọi máy.
- Phòng dùng **thời gian đếm 3 / 5 / 8 s của chủ phòng** (trước đây luôn 8 s).
- Trạng thái sẵn sàng đi peer-to-peer (kênh dữ liệu WebRTC), không qua server.

### 2. Đổi chủ phòng thay vì đóng phòng
- Server (`apps/signal`): chủ phòng **bấm Thoát**, hoặc **mất kết nối quá 30 s** (tải lại trang thì vẫn giữ chỗ 30 s như cũ) → **người vào phòng lâu nhất làm chủ**; mọi người nhận tin `host`; người đang gõ cửa được chuyển sang hỏi chủ mới. Phòng chỉ đóng khi **không còn ai**.
- Máy chủ mới có ngay bảng chọn khung / theme, nút bắt đầu, duyệt người gõ cửa; khung đang chọn giữ nguyên. Mọi người thấy thông báo **"★ Binh giờ là chủ phòng"** vài giây.
- Hộp hỏi khi chủ phòng thoát: "người khác trong phòng sẽ làm chủ (nếu chỉ có mình bạn thì phòng đóng)".

### 3. Link phòng cũ
- Server có thêm `GET /room/MÃ?peek=1` → `{ open, full }` (không mở WebSocket, không gõ cửa).
- Mở link `/booth?r=MÃ` **hoặc gõ mã ở sảnh**: ở lại **sảnh**, hiện thẻ "Đang tìm phòng…"; phòng còn → vào (hỏi tên nếu chưa có) như cũ; **không còn → "Phòng MÃ không còn nữa"** + giải thích + OK, bỏ `?r=` khỏi địa chỉ, quên phiên đã lưu của phòng đó; **đầy → "Phòng đã đủ người"**.
- Server cũ / mất mạng (không hỏi được) → đi như trước (màn chờ rồi về sảnh) — không hỏng gì khi server chưa deploy.

### 4. Lag khi sửa chung — nguyên nhân & cách xử lý
Kéo sticker / ô chỉ gửi **một lần khi thả tay**, nên lag không đến từ số lượng tin nhắn. Các chỗ nặng tìm được:
| Nguyên nhân | Xử lý |
|---|---|
| Ở màn kết quả / trang trí, máy **vẫn mã hoá video camera gửi cho từng người** (camera mở ở độ phân giải đầy đủ, N−1 luồng) — tốn CPU, nóng máy, mọi thứ chậm theo | **Tạm dừng gửi video khi không ở màn phòng** (`replaceTrack(null)`, không phải kết nối lại; tiếng vẫn đi); về màn phòng thì video có lại ngay |
| Video xem trước gửi đi ở độ phân giải gốc của camera | Giới hạn **~640 px, 20 hình/s, 600 kbps** (ô polaroid nhỏ; ảnh chụp vẫn chụp nét ở chính máy đó) |
| **Mỗi thay đổi** của bản in (của mình hoặc người khác gửi tới) làm máy vẽ lại ảnh thu nhỏ + ghi IndexedDB ngay | **Gom lại**: lưu 0,6 s sau thay đổi cuối |
| Nhịp "ai đang trang trí" 4 s / người làm cả booth vẽ lại | Cùng thẻ thì chỉ cập nhật giờ, không vẽ lại |
- Chưa đo trên điện thoại thật — chủ dự án thử lại xem còn lag không. Nếu còn: bước tiếp là gửi ảnh chụp qua kênh dữ liệu riêng (hiện ảnh và lệnh sửa đi chung một kênh, ảnh to có thể chặn lệnh sửa lúc vừa chụp xong).

### Kiểm tra
- e2e `booth-room.mjs` (3 trình duyệt, server phòng chạy trên máy): khoá nút khi 0/2, khách bấm sẵn sàng → nhãn + 1/2 → 2/2 mở nút; "Chuẩn bị" trên mọi máy; chụp, in, sửa chung như cũ; F5 chủ / khách vào lại; **chủ phòng thoát → Binh làm chủ** (cả hai khách được báo, Binh có bảng khung + nút chụp); mọi người thoát; **link cũ → ở sảnh, báo phòng không còn, bỏ ?r=**. Video của cả 3 hiện lại sau khi về phòng (kiểm tra việc tạm dừng video). Các bộ booth khác qua.

### Cần làm để chạy trên bản thật
**Deploy server phòng** (đổi chủ phòng + kiểm tra link chỉ có ở server mới): `cd apps/signal && pnpm run deploy` (wrangler cần **Node ≥ 22**). Web đã chạy được với server cũ (rơi về cách cũ).

## Đã làm tiếp (chủ dự án chốt Q-P37 — 2026-10-31)
- **Nút "Chụp cặp đôi" ở sảnh** (`Home.tsx`): đặt cạnh nút "Tạo phòng chụp chung", mở phòng ở chế độ polaroid chia đôi ngay từ lúc đợi người thứ hai vào.
- **Polaroid chia đôi ở màn phòng** (`RoomScreen.tsx` — `DuoPolaroid`): khi phòng có đúng 2 người (hoặc vừa mở từ nút Chụp cặp đôi), hiện chung một thẻ polaroid chia đôi có gắn nhãn `DUO`.
- **6 cách ghép đôi** (`packages/core/booth/duo.ts`, `LayoutPanel.tsx` — `DuoPicker`):
  - Chung khung: `side` (trái–phải), `stack` (trên–dưới).
  - Hai polaroid riêng trên nền trong suốt (PNG để lộ giấy của bản in): `twin` (đứng thẳng), `tilt` (nghiêng hai bên), `offset` (so le), `overlap` (đè lên nhau).
  - Chủ phòng chọn trước ở màn phòng (`s.setDuo`), và ở màn **Trang trí → Khung** vẫn đổi lại cách ghép hoặc đổi khung bất kỳ lúc nào vì mỗi máy giữ cặp ảnh gốc `roll.duo.pairs` (`rearrange`).
- **Chụp dư + mỗi người tự chọn ảnh**: khi phòng có 2 người và bật chụp dư (`takesFor`), cả hai chụp đủ số kiểu dư rồi mỗi máy vào màn `Pick` tự chọn các kiểu ưng ý cho bản in của mình; sửa chung vẫn đồng bộ theme, khung, bố cục, chữ và tự ghép lại cặp ảnh theo tỉ lệ ô mới.
- **Tag treo chuyển app (`SwitchTag.tsx`)**: bỏ hoàn toàn phần đọc cảm biến nghiêng máy (`devicemotion`) gây lỗi trên iOS/Android; giữ dây treo thẳng tự nhiên, tăng nhẹ biên độ đung đưa nghỉ và thêm hiệu ứng **gió thổi định kỳ từ phải qua trái** (mỗi ~4,5–9 giây một cơn gió đẩy dây nghiêng sang trái kèm gợn rung nhẹ rồi thả về).
