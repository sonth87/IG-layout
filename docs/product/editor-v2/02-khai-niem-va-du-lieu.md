# 02 — Khái niệm và mô hình dữ liệu

Phần này định nghĩa các khái niệm được dùng xuyên suốt bộ đặc tả. Hiểu đúng các khái niệm này là điều kiện để hiểu mô hình chọn phần tử ở [06](06-chon-va-cu-chi.md) — vốn là thay đổi lớn nhất của Editor v2.

## 1. Dự án và slide

Một **dự án** tương ứng với một bài đăng. Dự án có một **tỉ lệ khung** cố định (ví dụ 4:5, 9:16, 1:1, hoặc kích thước tuỳ chỉnh rộng 1080 px với chiều cao từ 565 đến 1920 px) và gồm một hoặc nhiều **slide**. Mỗi slide là một khung hình trong carousel khi đăng lên.

Điểm quan trọng là các slide **không phải là những trang tách rời**. Chúng nằm liền nhau theo chiều ngang, tạo thành **một dải canvas dài**. Ranh giới giữa hai slide chỉ là một đường mảnh mờ để người dùng biết chỗ cắt. Một phần tử — ảnh, chữ, sticker — có thể nằm vắt qua ranh giới đó; khi xuất ra, mỗi slide được cắt đúng theo ranh giới nên phần tử vắt qua sẽ hiện nửa này ở slide trước, nửa kia ở slide sau, và khi người xem vuốt carousel thì hình ảnh liền mạch. Đây là cơ chế đã có trong ứng dụng hiện tại và được giữ nguyên.

## 2. Phần tử

**Phần tử** là mọi thứ đặt lên canvas: ảnh, video, chữ, sticker, hình khối, khung ảnh, widget, nét vẽ tay, và **khối bố cục** (mục 3). Mỗi phần tử có vị trí, kích thước, góc xoay, độ mờ, trạng thái khoá và trạng thái ẩn. Các phần tử chồng lên nhau theo thứ tự **lớp**: phần tử ở lớp trên che phần tử ở lớp dưới.

## 3. Khối bố cục và ô

Đây là khái niệm mới. Một **khối bố cục** (layout block) là một phần tử **chứa bên trong nó nhiều ô**, sắp xếp theo một **kiểu chia** nhất định — ví dụ chia đôi dọc, lưới 2 × 2, một ô lớn bên trái và hai ô nhỏ bên phải, hay bố cục hai ảnh chéo nhau. Khi người dùng thêm một slide mới từ mục "Bố cục" hoặc "Lưới" (xem [05](05-canvas-va-slide.md)), ứng dụng tạo ra một khối bố cục phủ đúng slide đó.

Khối bố cục **là một phần tử tự do như mọi phần tử khác**. Người dùng có thể kéo nó đi, co nhỏ lại, phóng to ra — kể cả to hơn slide và vắt sang slide bên cạnh (ảnh IMG_3968 cho thấy một khối lưới được kéo to phủ sang hai slide khác) — và xoay nó. Khi khối di chuyển, co giãn hay xoay, tất cả các ô bên trong và ảnh trong các ô đi theo.

Mỗi **ô** là một vùng hình chữ nhật trong khối, vị trí được tính tương đối theo khối (chứ không theo slide). Một ô chứa **không hoặc một** ảnh / video. Ô chưa có ảnh được gọi là **ô trống** và hiển thị nền xám nhạt với một **dấu + tròn** màu xám đậm ở giữa (đường kính khoảng 28 px trên màn hình), báo hiệu "chạm vào đây để thêm ảnh".

Ảnh nằm trong ô gọi là **ảnh trong ô**. Ô hoạt động như một cửa sổ: ảnh có thể lớn hơn ô, và chỉ phần nằm trong ô là được nhìn thấy. Người dùng có thể **dời** ảnh trong ô để chọn phần nào hiện ra, **phóng to** ảnh trong ô, hoặc **xoay** ảnh trong ô, trong khi bản thân ô đứng yên. Khi ảnh vừa được đặt vào ô, nó được căn **phủ kín** ô (tức là phóng vừa đủ để không còn khoảng trống, tâm ảnh trùng tâm ô).

Ứng dụng hiện tại đã có khái niệm gần giống là "ô lưới của layout" (ảnh đánh dấu `slot`). Khác biệt là hiện nay mỗi ô là một phần tử ảnh độc lập, không có thứ gì gom chúng lại; trong Editor v2 các ô thuộc về một khối chung, nên người dùng có thể chọn và thao tác **cả khối** một lần.

## 4. Quan hệ cha – con

Các phần tử có thể lồng nhau, tạo thành quan hệ **cha – con**:

- Khối bố cục là **cha** của các ô của nó.
- Ô là cha của ảnh trong ô.
- Khung ảnh (ví dụ khung polaroid, khung máy ảnh — xem [11](11-thu-vien.md)) là cha của ảnh bên trong khung.
- Khi người dùng gom nhiều phần tử thành nhóm (tính năng chọn nhiều) [ĐX], nhóm là cha của các phần tử trong nhóm.

Chữ, sticker, hình khối, nét vẽ, ảnh tự do đặt thẳng lên canvas không có cha — chúng là **phần tử ngoài cùng**.

Quan hệ này quyết định cách chọn: lần chạm đầu tiên luôn chọn phần tử ngoài cùng, lần chạm tiếp theo mới đi vào phần tử con. Chi tiết ở [06](06-chon-va-cu-chi.md).

## 5. Template

Một **template** là một dự án mẫu: tỉ lệ khung, số slide, nền, và danh sách các phần tử (khối bố cục với các ô, chữ, hình, sticker, khung, widget). Template trong thư viện được hiển thị **kèm ảnh mẫu** để người dùng thấy trông nó thế nào. Khi người dùng chọn "Dùng template", ứng dụng tạo dự án mới với mọi thứ của template **trừ ảnh mẫu** — tất cả các ô trở thành ô trống (xem [03](03-trang-chu-va-template.md)).

## 6. Lớp

**Lớp** là thứ tự trên – dưới của các phần tử ngoài cùng trong dự án. Bảng Lớp (xem [12](12-sheet-menu-xuat-lop.md)) liệt kê các phần tử theo thứ tự này, phần tử trên cùng ở đầu danh sách. Các ô trong một khối bố cục không xuất hiện như lớp riêng trong bảng Lớp [ĐX]; người dùng chọn chúng bằng cách chạm vào khối.

## 7. Dữ liệu phải lưu

Với mỗi khối bố cục cần lưu: vị trí, kích thước, góc xoay, khoá / ẩn, kiểu chia (để đổi kiểu chia sau này), khe giữa các ô, lề ngoài, bo góc ô, màu nền khối, và danh sách ô. Với mỗi ô cần lưu: vị trí và kích thước tương đối trong khối (0 đến 1), và nếu có ảnh thì: ảnh nào, vùng ảnh đang hiện (vùng cắt), góc xoay của ảnh trong ô, lật ngang / dọc, bộ lọc và chỉnh màu của ảnh. Chi tiết kỹ thuật ở [tài liệu dev](../../dev/editor-v2.md). Các dự án đã tạo bằng phiên bản hiện tại phải mở được bình thường: các ô lưới cũ sẽ được gom lại thành khối bố cục theo từng slide khi mở dự án.
