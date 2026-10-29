# 2026-10-30 — Booth: khung tự do, đồ trang trí, theme theo chủ đề

> Trạng thái: **Đề xuất** — chờ chủ dự án chốt (Q-P21 → Q-P26). Chưa code.
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
