# 2026-10-30 — Booth: khung tự do, đồ trang trí, theme theo chủ đề

> Trạng thái: **Đã chốt** ("ok tất", D-161, 2026-10-30). Đã làm: bố cục (§6), hoạ tiết (§7), theme nhóm + không khí (§8).
> Nền: [2026-10-29-booth-thiet-ke.md](2026-10-29-booth-thiet-ke.md) (khung D-152, theme §8 / §13, phòng D-159).

## Ý của chủ dự án (2026-10-30)
- Ô trong khung đang chỉ một kiểu **thẳng hàng**. Muốn có: **lệch trái / lệch phải, chèn lên nhau**; có **hoa lá cành, dải lụa, dây leo, dây hoa, pháo hoa, pháo que, ruy băng, sao, trăng, dây neon**… và các kiểu khác.
- Cách xếp: **dọc, ngang, lưới, ngẫu nhiên dọc, ngẫu nhiên ngang, ngẫu nhiên lưới**, và **tự sắp xếp / căn chỉnh lại các ô**.
- **Chế độ đồng bộ:** sửa hiệu ứng / item cho một ô thì các ô khác ăn theo; hoặc **áp cho cả bản in** — vd. dây leo cuốn từ đầu này tới đầu kia của cả bản in (đề xuất mặc định).
- **Theme phải rõ chủ đề:** đổi theme là đổi cả item đi theo, hiệu ứng, font, màu, nền, effect — không chỉ màu nền. Hay hơn nữa: theme đổi cả **nền / không khí của màn chụp và màn sửa** (vd. nền mờ theo theme; Rừng thì nhiều thứ đổi theo, Candy cũng vậy).
- Có thể chia **nhóm theme**, mỗi nhóm nhiều kiểu; có thể **ngẫu nhiên bên trong một kiểu** — nhưng cần nghĩ vì ngẫu nhiên có thể phá bố cục đã sắp đẹp.

## Hiện trạng
- Khung = danh sách ô chữ nhật thẳng, toạ độ cố định (`packages/core/booth/frames.ts`, 8 khung).
- Theme = màu giấy + mực + một kiểu trang trí vẽ bằng code (chấm bi / chất bài / lấp lánh / hạt phim) + font + filter gợi ý (`themes.ts`, 6 theme).
- Kho dùng chung của IG Layout có sẵn: sticker (thực vật, bướm, chim, lễ hội, Tết, Trung thu, Giáng sinh, nét vẽ tay, washi, tem…), khung ảnh (polaroid, xé giấy, phim, phong bì…), lớp phủ ánh sáng / lens flare, texture giấy / vải / gỗ, 1586 emoji, hiệu ứng phần tử. **Chưa có:** dây leo, dây hoa, ruy băng, pháo hoa, pháo que, dây neon, đèn dây.

## Tham khảo
(Theo hiểu biết chung về các app — chưa đối chiếu tận tay lần này.)
- **Tiệm Hàn (Life4Cuts, Photoism, Harufilm):** khung theo mùa / collab có nhân vật, hoạ tiết **tràn qua nhiều ô**, ô vẫn thẳng để ảnh rõ mặt.
- **PicCollage / Picsart "Freestyle":** ảnh rải nghiêng, chồng nhau, nút **Shuffle / xáo lại** bố cục; kéo, xoay từng ảnh.
- **Canva / Instagram Layout:** lưới đều, kéo đường chia để chỉnh tỉ lệ ô.
- **Snow / B612:** sticker, hiệu ứng động theo chủ đề, nền và màu giao diện đổi theo bộ hiệu ứng.

## 1. Bố cục ô (Đề xuất)
Khung không còn là toạ độ cố định mà là **"cách xếp" + số kiểu chụp + khổ giấy**, app tính ra ô.

| Cách xếp | Mô tả |
|---|---|
| Dọc | như dải hiện tại |
| Ngang | dải ngang |
| Lưới | 2 × 2, 2 × 3… theo số kiểu |
| Dọc lệch | dọc, ô **so le trái / phải**, hơi nghiêng xen kẽ, **chồng mép lên nhau** một chút |
| Ngang lệch | tương tự theo chiều ngang |
| Lưới lệch | lưới, mỗi ô nghiêng / dịch nhẹ kiểu ảnh dán lên bảng |
| Tự do | như "lệch" nhưng **mỗi ô kéo / xoay / phóng to / đưa lên trên – xuống dưới** được bằng tay |

- Ô có **hình**: chữ nhật, bo góc, polaroid (viền dày dưới), vòm, tròn, tim, xé giấy (dùng khung có sẵn của IG Layout).
- **Ngẫu nhiên có kiểm soát** (trả lời băn khoăn "ngẫu nhiên có thể phá bố cục"): mỗi bố cục lệch có **một hạt giống** (seed); nút **🎲 Xáo lại** đổi hạt giống; luật cố định để luôn ra đẹp:
  - Ô không ra ngoài lề an toàn, không che **vùng chữ** (tiêu đề / ngày).
  - Ô chỉ chồng nhau **≤ 12 %** cạnh và **không chồng vào phần giữa ô** (vùng mặt người thường nằm ở giữa).
  - Góc nghiêng trong khoảng ±2–6°, thứ tự trên / dưới xen kẽ.
  - Ưng một lần xáo → nó **được giữ** (lưu seed), không tự đổi nữa.
- **Tự sắp xếp:** chạm một ô → tay nắm kéo, xoay, đổi kích thước; có hít mép / hít thẳng hàng như IG Layout; nút **"Căn lại"** về bố cục gốc.

## 2. Đồ trang trí (Đề xuất)
Hai nguồn:
1. **Item có sẵn** từ kho IG Layout (sticker, emoji, khung, ánh sáng) — kéo thả, xoay, phóng (dùng `packages/canvas`).
2. **Đồ trang trí vẽ bằng code** (mới) — cái chủ dự án liệt kê. Vẽ bằng code vì chúng cần **chạy theo đường** và **co giãn theo bố cục** (một dây leo phải uốn quanh đúng các ô đang có), ảnh tĩnh không làm được:

| Đồ trang trí | Cách vẽ |
|---|---|
| Dây leo | một đường cong mềm chạy dọc mép / luồn giữa các ô, lá mọc so le hai bên, có tua cuốn |
| Dây hoa / vòng hoa | như dây leo + hoa nhỏ theo bảng màu theme |
| Ruy băng / dải lụa | dải băng có bề rộng, mặt trong tối hơn ở chỗ xoắn; nơ ở góc |
| Đèn dây | dây võng giữa hai điểm + bóng đèn phát sáng |
| Dây neon | nét phát sáng nhiều lớp (lõi trắng + quầng màu), chữ / hình neon |
| Pháo hoa | chùm tia toả tròn, đuôi mờ dần, vài chùm ở nền / góc |
| Pháo que | lõi sáng + tia lửa gãy khúc |
| Sao, trăng | sao 4 / 5 cánh, trăng khuyết, lấp lánh rải theo mật độ |
| Hoa lá cành | cụm lá / hoa ở góc ô hoặc góc bản in (kết hợp sticker thực vật có sẵn) |
| Confetti, kẹo, bong bóng, tim… | rải theo mật độ |

- Mỗi đồ trang trí có **hạt giống** riêng (xáo lại được) + vài tham số (mật độ, màu theo theme, độ dày).
- **Phạm vi** (chủ dự án): 
  - **Cả bản in** (mặc định): đồ trang trí chạy trên toàn bộ — dây leo bò từ đầu này tới đầu kia, **luồn qua khe giữa các ô** (đường đi tính từ vị trí các ô), pháo hoa ở nền.
  - **Từng ô, đồng bộ:** đặt / sửa ở một ô → **các ô khác ăn theo** (cùng vị trí tương đối, cùng kiểu; xoay theo ô). Bỏ đồng bộ cho riêng một ô được.
- **Lớp:** đồ trang trí có thể nằm **sau ảnh** (nền) hoặc **trên ảnh** (vắt qua mép ô); mặc định trên ảnh nhưng **tránh vùng giữa ô** (mặt người).

## 3. Theme theo chủ đề (Đề xuất)
Theme = **cả bộ**: nền (màu / dải chuyển / hoạ tiết / texture / ảnh nền vẽ bằng code), bố cục gợi ý (cách xếp + hình ô), đồ trang trí đi kèm, item gợi ý (sticker theo chủ đề), font tiêu đề + phụ, màu chữ, filter, hiệu ứng ảnh (hạt, loá, viền), **không khí màn chụp / sửa**.
- **Không khí theo theme:** màn chụp và màn trang trí đổi nền theo theme (nền mờ đổi màu + hạt rơi nhẹ: lá rơi cho Rừng, kẹo / confetti cho Candy, sao cho Đêm, tuyết cho Giáng sinh), khung polaroid camera đổi màu theo theme. Giao diện nút vẫn giữ kiểu booth để dễ dùng. (Tắt khi bật "giảm chuyển động".)
- **Nhóm → kiểu:** mỗi nhóm 2–3 kiểu khác hẳn nhau về bố cục / đồ trang trí; trong một kiểu có thể **🎲 xáo** (đổi hạt giống của bố cục lệch + đồ trang trí) — bố cục gốc của kiểu vẫn giữ, chỉ chi tiết đổi.

Nhóm đề xuất bản đầu:
| Nhóm | Kiểu (ví dụ) | Nét chính |
|---|---|---|
| **Cinema** | Rạp cũ · Vé xem phim | phim, lỗ phim, đèn biển, serif đậm |
| **Rừng** | Rừng sáng · Rừng đêm đom đóm | **dây leo** + lá + nấm, nền xanh rêu / giấy kraft, đom đóm phát sáng, font viết tay |
| **Candy** | Kẹo ngọt · Bong bóng | pastel, chấm bi, kẹo mút, ô bo tròn, confetti |
| **Đêm hội** | Pháo hoa · Neon | **pháo hoa, pháo que, dây neon**, nền đêm, ô viền phát sáng |
| **Lãng mạn** | Ruy băng · Vườn hoa | **ruy băng, dải lụa, dây hoa**, tim, nền kem / hồng |
| **Bầu trời** | Đêm sao · Mơ màng | **sao, trăng**, mây, dải chuyển tím xanh |
| **Y2K / Alice / Classic / Đen trắng** | (giữ các theme đã có, nâng lên đủ bộ) | |
| Theo mùa | Tết · Trung thu · Giáng sinh | dùng sticker Tết / Trung thu / Giáng sinh có sẵn + đèn dây, pháo hoa |

## 4. Ảnh hưởng tới phần khác
- **Phòng chụp chung:** chủ phòng chọn theme + bố cục (như chọn khung, D-159); ô ghép ảnh mọi người như hiện tại.
- **Sửa chung (D-148):** dữ liệu bản in (bố cục, đồ trang trí, item) là thứ sẽ đồng bộ khi sửa chung → nên làm phần này **trước** sửa chung.
- **Xuất / Mở trong IG Layout:** không đổi (vẫn là bản in đã vẽ).
- Cuộn phim cũ (khung thẳng) vẫn mở được — 8 khung hiện tại trở thành bố cục "thẳng" có sẵn.

## 5. Thứ tự làm (Đề xuất)
1. **Bố cục mới:** dữ liệu ô có xoay / thứ tự lớp / hình ô; 7 cách xếp; xáo lại có luật; chế độ tự sắp xếp (kéo, xoay, phóng).
2. **Đồ trang trí vẽ bằng code:** dây leo, dây hoa, ruy băng, đèn dây, neon, pháo hoa, pháo que, sao / trăng, confetti — phạm vi cả bản in / từng ô đồng bộ; + item từ kho IG Layout.
3. **Theme theo nhóm** (đủ bộ) + **không khí màn chụp / sửa** theo theme.
4. Sửa chung trong phòng (D-148).

## Câu hỏi cho chủ dự án
Xem [open-questions.md](../roadmap/open-questions.md) mục Photobooth (Q-P21 → Q-P26).

## 6. Bước 1 đã làm: bố cục (2026-10-30)
- `packages/core/booth/layout.ts`: khung vẫn là khổ + số kiểu + ô thẳng (8 khung cũ: dọc = dải, ngang = dải ngang, lưới = 2 × 2 / 6 ô); **cách xếp** đặt lên trên: **Thẳng · So le** (xen trái / phải hoặc lên / xuống theo chiều khung, nghiêng xen kẽ, to hơn 6 % cho mép chạm nhau) **· Rải** (mỗi ô dịch / nghiêng / to nhỏ riêng, thứ tự trên dưới ngẫu nhiên) **· Tự do** (đặt bằng tay) → đủ 7 cách xếp đã bàn (dọc / ngang / lưới × thẳng / lệch + tự do).
- **Luật cho ngẫu nhiên** (kiểm từng ô, thử tối đa 40 lần, mỗi lần dịu hơn; cuối cùng về ô thẳng): trong lề 3 %, không chạm vùng chữ, chồng nhau ≤ 12 % cạnh nhỏ nhất, **vùng giữa ô (60 %) không bị ô nào chồng lên**, nghiêng 2–6°. Ngẫu nhiên theo **hạt giống** lưu trong cuộn → không tự đổi; 🎲 Xáo lại = hạt giống mới.
- **Hình ô:** vuông, bo góc, polaroid (thẻ trắng, mép dưới dày), vòm, tròn, tim, xé giấy (mép răng cưa cố định theo ô). Ô nghiêng / polaroid có bóng mềm để ô trên đọc ra là "nằm trên". Theme có viền ô thì viền theo đúng hình ô.
- **Tự do:** chạm một ô → lên trên cùng, khung vàng; kéo để di chuyển (hít tâm vào giữa bản in / tâm các ô khác), góc dưới phải để phóng to – thu nhỏ (giữ tỉ lệ), núm trên để xoay (hít 0°); bản in vẽ lại theo tay, lưu khi nhấc tay; **Căn lại** về ô thẳng. Đổi khung khác → bỏ vị trí tay đã đặt.
- Thẻ **Bố cục** (thay thẻ Khung) trong màn Trang trí: khung, cách xếp (mỗi lựa chọn là hình thu nhỏ của chính khung đó), hình ô, 🎲 / Căn lại. Bảng dưới trên điện thoại cao tối đa 42 % màn và tự cuộn, để bản in không bị thu nhỏ.
- Chạm ảnh để chụp lại vẫn đúng ô khi ô nghiêng / chồng (tính theo ô trên cùng, có xoay).
- Tiếp theo: bước 2 — đồ trang trí vẽ bằng code.

## 7. Bước 2 đã làm: đồ trang trí vẽ bằng code (2026-10-30)
- `packages/core/booth/decor.ts`, thẻ **Hoạ tiết** trong màn Trang trí (chạm để thêm / bỏ; mỗi cái thêm vào có: **Cả bản in / Từng ô**, **Trên ảnh / Dưới ảnh**, mật độ **• •• •••**, 🎲 vẽ lại).
- **Cả bản in** (mặc định): dây leo / dây hoa / ruy băng chạy theo **đường lề** — lên mép trái (ghé vào khe giữa các hàng ô), qua mép trên, xuống một đoạn mép phải; đèn dây võng ngang mép trên; neon bao quanh cả khối ô + vài hình neon (tim / sao); pháo hoa, pháo que, sao, trăng, confetti rải vào chỗ trống.
- **Từng ô (đồng bộ):** cùng một hoạ tiết lặp trên mọi ô, xoay theo ô: dây leo ôm góc trên trái, dây hoa, nơ giữa mép trên, đèn võng mép trên, **neon theo đúng hình ô** (vòm, tim…), pháo hoa ló sau góc, pháo que góc dưới, sao ở hai góc, trăng góc trên phải, confetti quanh mép.
- **Không che mặt:** hoạ tiết rải ở lớp trên không đặt vào vùng giữa ô (64 %) và vùng chữ; ở lớp dưới thì đặt ngoài ô (để ló ra); hết chỗ thì đặt lên ảnh nhưng vẫn tránh giữa ô, rồi thu nhỏ.
- Vẽ hoàn toàn bằng code (lá, tua cuốn, hoa 5 cánh, dải băng xoắn, nơ, bóng đèn phát sáng, neon 3 lớp, chùm pháo hoa có đuôi rơi, tia lửa gãy khúc, sao 4 / 5 cánh, trăng khuyết phát sáng) → co giãn theo khổ, không cần tải ảnh.
- Còn: item từ kho IG Layout kéo thả trên bản in; màu hoạ tiết theo theme (bước 3).

## 8. Bước 3 đã làm: theme theo nhóm + không khí (2026-10-30)
- `packages/core/booth/themes.ts`: **19 theme trong 10 nhóm**, mỗi theme đủ bộ: giấy (màu / dải chuyển) + hoạ tiết nền (kraft, chấm bi, tim, tuyết, trời đêm, chất bài, lấp lánh, hạt phim), mực, viền ô + bo góc, font tiêu đề + phụ, chữ tiêu đề mặc định, filter, **bố cục gợi ý** (cách xếp + hình ô), **hoạ tiết đi kèm** (màu riêng theo theme), **không khí** (nền màn chụp / sửa, thứ trôi qua màn, màu giấy polaroid):
  | Nhóm | Theme | Nét chính |
  |---|---|---|
  | Cinema | Cinema · Vé xem phim | lỗ phim / giấy kraft, "ADMIT ONE" chữ poster, so le |
  | Rừng | Rừng sáng · Đom đóm | giấy kraft xanh, **dây leo cả bản in + dây hoa từng ô**, chữ viết tay, lá rơi · trời đêm, ô vòm, dây leo + đom đóm phát sáng bay lên |
  | Candy | Candy · Bong bóng | hồng chấm bi, ô bo tròn viền trắng, confetti, kẹo rơi · xanh – hồng, ô tròn, lấp lánh từng ô |
  | Đêm hội | Pháo hoa · Neon | trời đêm, **pháo hoa sau ảnh + pháo que**, "CELEBRATE!", tia lửa bay lên · **neon theo hình từng ô** + đèn dây, "NIGHT OUT" |
  | Lãng mạn | Ruy băng · Vườn hoa | hoạ tiết tim, **ruy băng cả bản in + nơ từng ô**, ô polaroid, chữ thư pháp "With Love", cánh hoa rơi · **dây hoa**, ô vòm, "Bloom" |
  | Bầu trời | Đêm sao · Mơ màng | **trăng + sao**, chữ nghiêng cổ điển · dải chuyển tím hồng xanh, sao từng ô, "daydream" |
  | Cổ điển | Classic · Đen trắng | (như cũ) |
  | Y2K, Xứ sở thần tiên | Y2K · Alice | (nâng lên đủ bộ: rải, lấp lánh / dây hoa đỏ trắng) |
  | Theo mùa | Tết · Trung thu · Giáng sinh | đỏ vàng, pháo hoa + đèn dây, "Happy Tết" · trăng + đèn lồng (đèn dây cam đỏ), ô tròn, "Trung Thu" · xanh thông, **tuyết**, đèn dây nhiều màu, ô polaroid, "Merry Christmas" |
- **Chọn theme = đổi cả bộ** (filter, cách xếp + hình ô, hoạ tiết); khung, ảnh, chữ đã gõ giữ nguyên; đổi gì sau đó cũng được. Hoạ tiết của theme có hạt giống cố định theo theme → chọn lại ra y như cũ, 🎲 để đổi.
- Thẻ **Theme** chia theo nhóm, mỗi theme là bản in thu nhỏ của chính cuộn đó trong theme ấy.
- **Chọn theme ngay ở màn chọn khung** (dải theme dưới danh sách khung) → cuộn mới bắt đầu trong theme đó; phòng chụp chung cũng vậy.
- **Không khí** (`apps/web/src/booth/Mood.tsx`): nền + hạt trôi (lá, kẹo / confetti, sao, tuyết, tia lửa, cánh hoa, đom đóm) theo theme ở màn chọn khung, chụp, phòng, kết quả, trang trí; sảnh giữ kiểu Cinema của booth. Giấy polaroid camera / người trong phòng đổi màu theo theme. Khung xem trước "cả khung" lúc chọn / chụp vẽ theo theme. Giảm chuyển động → hạt đứng yên.
- Font thêm (chỉ tải khi bản in dùng): viết tay (Patrick Hand), thư pháp (Great Vibes), bút lông (Dancing Script), poster (Anton) — đều có tiếng Việt.
- Hình **vòm** ở ô ngang: đỉnh vòm thành nửa elip để không trồi sang ô khác.
- Tiếp theo: sửa chung trong phòng (D-148); item từ kho IG Layout kéo thả trên bản in.

## 9. Góp ý màn Trang trí (2026-10-30)
Chủ dự án: "ở bước decorate user có thể zoom phần xem được không, có nút reset zoom ở góc; zoom của mỗi người không ảnh hưởng người khác. Chụp 3 ảnh, sang trang trí chọn dải 4 thì sinh 1 ô trống — có cho click vào ô đã chụp lẫn chưa chụp để chụp lại không? Nếu cho thì confirm trước, chỉ chụp 1 tấm thay cho ô vừa chọn."
- **Zoom** (`ZoomView.tsx`): chụm 2 ngón / ctrl + lăn (chụm trackpad) để phóng quanh chỗ đặt tay, tối đa 500 %; đã phóng thì kéo 1 ngón (hoặc 2 ngón) để dời; nút **⟲ 250 %** ở góc trên phải → về 100 %. Bản in **vẽ lại nét hơn** mỗi nấc zoom (giới hạn ~16 MP). Kéo / chụm không bao giờ tính là chạm vào ảnh. Ở chế độ Tự do, kéo 1 ngón trên ô vẫn là đặt ô, 2 ngón để zoom. Zoom chỉ trên máy mình (không gửi đi, không lưu).
- **Chạm ô để chụp (lại)** ngay ở màn Trang trí — ô đã chụp hoặc ô trống (vd. đổi dải 3 → dải 4): hỏi trước **"Chụp lại ảnh 2?" / "Chụp ảnh 4?" — "Chỉ ô này thôi: đếm một lần, chụp một tấm, thay vào đúng ô này."** → Mở camera → đếm 8 s, **chụp đúng 1 tấm** vào ô đó → **quay lại màn Trang trí** (không phải màn kết quả). Ô trống có số thứ tự.
- Màn kết quả khi còn ô trống: cạnh nút "Chụp bù" có thêm nút Trang trí.
- Bản chụp chung trong phòng: không chụp lại từng ô (mỗi ô có cả nhóm).

## 10. Sửa chung trong phòng (D-148, 2026-10-30)
Chủ dự án: "ok làm tiếp đi" (sau đề xuất làm sửa chung tiếp theo).
- Mọi máy trong phòng có **cùng một bản in**: cùng ảnh, ô ghép theo **thứ tự người của chủ phòng** (gửi kèm lệnh chụp — trước đây mỗi máy tự xếp nên có thể lệch), bắt đầu từ **theme chủ phòng chọn** (chủ phòng giờ chọn **khung + theme** trong phòng; khách thấy "Dải 3 · 3 kiểu · Rừng sáng").
- Phần **được sửa chung**: khung, theme, filter, bố cục (cả ô đặt tay), hoạ tiết, dòng chữ, ngày giờ, lật ảnh. **Không chung:** zoom, thẻ đang mở, việc lưu / xuất (ai lưu bản của người đó).
- Cách đồng bộ (`apps/web/src/booth/share.ts`): sửa ở đâu thì gửi phần vừa đổi cho mọi người qua kênh P2P; **mỗi trường có số phiên bản** (bộ đếm + người sửa), bản cao hơn thắng → thứ tự tin đến thế nào thì mọi máy cũng ra giống nhau; hai người sửa cùng một thứ cùng lúc thì một người thắng, các thứ khác nhau thì giữ cả hai. Mở màn trang trí → **hỏi các máy kia bản mới nhất** (vào muộn / đang ở màn khác vẫn bắt kịp); máy đang ở màn khác cũng nhận và cập nhật bản đang mở / bản đã lưu.
- **"Mai đang sửa · Hoạ tiết"**: dải vàng dưới tiêu đề màn trang trí, cập nhật mỗi 4 giây, ai rời / khoá máy thì tự mất sau ~11 giây.
- Chưa làm: hoàn tác (booth chưa có hoàn tác nói chung); chụp lại từng ô trong phòng (mỗi ô có cả nhóm).

## 11. Thêm theme (2026-10-30)
Chủ dự án: "các theme đã hay ho hơn nhưng chưa thực sự đã mắt" + "thêm theme như báo cũ, vở ô ly, rạp xiếc (đường kẻ trắng đỏ), cyberpunk, phim cũ (cuộn phim tròn)…". Thêm 5 theme, 3 nhóm mới (Hoài cổ, Học trò, Tương lai), hoạ tiết nền vẽ bằng code:
| Theme | Nhóm | Nét chính |
|---|---|---|
| **Báo cũ** | Hoài cổ | giấy ngả vàng, **cột chữ in mờ + đường kẻ đầu / cuối trang**, tiêu đề "The Daily Booth" kiểu măng-sét báo (Playfair Display đậm), filter đen trắng Press 400, ảnh như **mẩu báo cắt xé dán rải** (ô xé giấy) |
| **Phim cũ** | Hoài cổ | nâu đen, **hai cuộn phim tròn lớn** (6 lỗ, lõi) ló ở góc + dải phim uốn giữa, lỗ phim hai bên, "Now Playing" nghiêng, filter Expired |
| **Vở ô ly** | Học trò | giấy trắng **ô ly xanh (đường thứ 4 đậm hơn) + lề đỏ**, chữ viết tay "my booth diary", ảnh polaroid rải, sao xanh đỏ như vẽ bút bi |
| **Rạp xiếc** | Đêm hội | **sọc đỏ – kem lều xiếc, diềm vàng hình vỏ sò ở mép trên**, ô vòm viền vàng, **bảng tên kem viền vàng** sau dòng chữ "CIRCUS BOOTH", đèn bóng vàng, confetti |
| **Cyberpunk** | Tương lai | tím đen, **lưới neon phối cảnh chạy về chân trời + vạch quét màn hình**, neon hồng / xanh từng ô, "NEO SAIGON" font Chakra Petch, filter Cyberpunk |
Tổng: **24 theme / 13 nhóm**. Chủ dự án muốn "đã mắt" hơn nữa → xem câu hỏi Q-P27.

## 12. Sticker, ô trống, khung có ô chữ, chụp ngay (2026-10-30)
Chủ dự án gửi ảnh mẫu (`sample/4`, photoboothtemplates.com, Etsy "harvest photobooth", ảnh chụp có đồ cầm tay, trang ONBOOTH) và góp ý:
- **Sticker / đồ cầm chụp** (kính, râu, bong bóng, bảng chữ, mũ, hoa lá, nến, bánh sinh nhật, chó mèo chim cá…, theo dịp Tết / Halloween / Noel / Trung thu) — "đưa thêm vào để làm giàu cả dữ liệu cho phần IG Layout".
  - `packages/core/elements/props.ts`: **52 sticker vẽ bằng SVG** (kiểu sticker sẵn có của IG Layout: màu phẳng, viền mực, màu chính đổi được), 8 nhóm: **Đồ chụp ảnh** (kính lưới, kính tim, kính sao, kính tròn, kính phi công, râu, râu xoắn, môi, nơ cổ, mũ sinh nhật, mũ chóp, vương miện, vòng hoa đội đầu, tai mèo, tai thỏ, tai & mũi cún, sừng quỷ, hào quang, vòng hoa cổ) · **Bong bóng & bảng chữ** (bong bóng thoại / nghĩ / hét, bảng cầm tay, bảng tim, bảng mũi tên, thẻ hashtag — **có ô chữ**) · **Sinh nhật & tiệc** (bánh có nến, nến, bóng bay, hộp quà, pháo giấy) · **Thú cưng** (mèo, cún, chim, cá, dấu chân) · **Tết** (bao lì xì, cành mai, đèn lồng, dây pháo) · **Halloween** (bí ngô, dơi, ma, mũ phù thuỷ) · **Giáng sinh** (mũ Noel, gạc tuần lộc, cây thông, người tuyết) · **Trung thu** (đèn ông sao, bánh trung thu, thỏ ngọc, trăng rằm).
  - **IG Layout:** thư viện sticker có thêm 8 nhóm đó.
  - **Booth:** thẻ **Sticker** trong màn Trang trí — chọn nhóm, chạm để thêm (giữa bản in, hơi nghiêng); trên bản in: kéo, phóng ở góc, xoay ở núm (hít 0°), ✕ xoá; bảng dưới: **chữ trên bong bóng / bảng** (tự co, tự xuống 2 dòng), 10 màu, lật, lên trên / xuống dưới. Sticker nằm trên cùng bản in, theo vào ảnh lưu / Post / Story / Mở trong IG Layout, **sửa chung** trong phòng.
- **Ô trống**: "chụp 3 ảnh chọn layout 4 thì đừng hiện hình người, biết đâu họ muốn 1 ô trống để trang trí" → ô không có ảnh giờ là **ô trơn màu theme** (màn trang trí có dấu "+" mờ để chạm chụp); hình người xám chỉ còn ở **xem trước khung / lúc chụp**.
- **"Layout 3 ảnh nhưng chia lưới 4 ô"** → thêm 2 khung có **ô chữ riêng** (ô thứ 4 là tấm thẻ tiêu đề theo theme, chữ to hơn): **3 ảnh + chữ** (lưới 2 × 2, 4 × 5 in) và **Dải + chữ** (thẻ tiêu đề trên cùng + 3 ảnh, kiểu dải "Thank you"). Tổng **10 khung** (D-152 trước đây là tối đa 8 — chủ dự án yêu cầu thêm).
- **Nút "Chụp ngay"** lúc đếm ngược (cạnh khay ảnh; trên máy tính: Enter) — bỏ phần đếm còn lại, chụp luôn. Chỉ khi chụp một mình (trong phòng giữ nhịp chung).
