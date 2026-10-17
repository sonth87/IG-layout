# Phụ lục A — Nguyên văn mô tả của chủ dự án

Chép nguyên văn để không ý nào bị mất khi diễn giải. Tên ứng dụng tham chiếu được lược bỏ (thay bằng "…").


**2026-10-17 (lần 1 — mô hình chọn):**
> tôi thấy việc chọn item … như sau. nó sẽ chọn từ cái lớn đến cái nhỏ hơn bên trong. tức là lần đầu khi ấn vào sẽ chọn component ngoài cùng, khi ấn thêm 1 lần nữa vào component bên trong đó thì nó deselect component ngoài và select vào component trong theo đúng vị trí chạm vào component đó. và lúc select component nào thì việc tương tác sẽ diễn ra trên component đó. ví dụ componet A chứa B và C. chạm lần đầu vào A sẽ select A, chạm vào A lần nữa ở vị trí component C thì chuyển sang select C. lúc này việc di chuyển hiển thị C sẽ luôn nhận được. nếu ấn ra ngoài thì sẽ bỏ select của component đó, khi không select vào bất cứ component nào thì việc zoom in/out rotate hay các thao tác gì khác sẽ là dành cho canvas.

**2026-10-17 (lần 2 — mô tả ảnh / video):**
> - IMG_3937 --> IMG_3952 là ảnh ở màn hình đầu tiên là danh sách các template. người dùng có thể kéo xuống để xem các template được chia theo nhóm. có thể trượt ngang ở các nhóm để xem thêm các template thuộc nhóm đó.
> - IMG_3953 --> IMG_3956 là ảnh tạo mới project. … yêu cầu chọn loại kích cỡ có sẵn và custom. nếu custom thì nhập thông tin custom vào
> - IMG_3957, IMG_3977 là màn hình đầu tiên khi vào trong project. nó không giãn ra full screen, mà nếu để zoom xem hết các slide thì khi add thêm slide nó sẽ tự cho nhỏ lại cho user dễ nhìn, mặc định sẽ zoom nhỏ về đến mức như ảnh IMG_3977. zoom nhỏ hơn sẽ tự bật về mức độ zoom nhỏ nhất (IMG_3977)
> - IMG_3958 là ảnh khi ấn vào nút ... bên dưới mỗi slide
> - IMG_3959 --> IMG_3961 là ảnh khi ấn nút "+" để thêm slide, có các kiểu chia grid sẵn.
> - IMG_3962 --> IMG_3964 là ảnh khi đã thêm các slide mới từ 1 số loại đã có sẵn
> - IMG_3965 là ảnh khi tôi giữ vào icon "||" ở dưới 1 slide và drag để di chuyển vị trí slide đó trong list slide nhằm thay đổi vị trí. các item/component nào trên slide đó cũng đi theo. khi đang drag slide thì các nút ở slide khác không hiện và icon "||" cũng di chuyển theo vị trí tay đang drag (theo chiều ngang thôi), các slide khác tự thay đổi vị trí để cho slide đang được drag thay vào chỗ đó
> - IMG_3966 là khi tôi select vào 1 slide, có toolbar bên trên, có rotate bên dưới (giữ và drag để xoay, có snap ở 0), có menu bên dưới thay đổi theo slide/component được select
> - IMG_3967 --> IMG_3968 là khi tôi resize slide đó nhỏ đi và to lên, nó có thêm 1 cái tiện ích để đo kích thước, khi size nó tương đương với component nào trên toàn bộ slide thì nó hiện thêm cái ruler như ở ảnh IMG_3967
> - IMG_3969 --> IMG_3970 là khi chọn slide thì có những chức năng ở dưới panel cho slide đó. phía trên toolbar của slide đó khi ấn nút "..." thì có dropdown
> - ở trạng thái không select slide/component nào, khi ấn lần 1 vào slide/component thì nó sẽ select thằng cha trước tức là slide, ấn thêm 1 lần nữa vào vị trí component nào bên trong sẽ là select component đó thay vì component cha. nếu chưa có component nào bên trong mà chỉ là khoảng trống với dấu "+" thì sẽ hiện bottom sheet (không chắc có phải là bottom sheet không) như ảnh IMG_3971. user có thể chọn ảnh, video, hoặc ảnh/video trong thư mục File (ios là file còn android thì tôi cũng không rõ). khi ấn chọn ảnh, thì nó cho phép chọn số lượng ảnh tối đa mà trên toàn bộ slide có phần ảnh đang để trống, thứ tự sẽ ưu tiên từ slide/component đang chọn. tức là nếu có 3 slide A B C, trong A có 2 component (gọi tắt là comp) ảnh G H, trong B có 3 comp ảnh I J K, trong C có 1 comp ảnh L. tất cả các comp đều đang trống (chưa có ảnh) nếu tôi chọn vào K để add thêm ảnh thì khi chọn ảnh từ thư viện, tôi có thể chọn nhiều ảnh, tối đa là 6 ảnh (tương đương với G H I J K L). nếu tôi chỉ chọn 1 ảnh thì nó sẽ fill ảnh vào comp K (comp đang chọn), nếu tôi chọn 3 ảnh thì sẽ fill vào K I J (cùng trong 1 slide, và theo thứ tự ưu tiên là cái đang chọn trước), nếu tôi chọn 6 ảnh thì thứ tự ưu tiên là K I J G H L (theo thứ tự ưu tiên là theo comp đang chọn -> comp trong cùng slide -> từ slide đầu đến slide cuối)
> - IMG_3973, IMG_3974 là khi tôi chọn vào đến 1 comp ảnh bên trong slide thì ẩn các chức năng của slide, toolbar hiện theo toolbar của comp
> - IMG_3978 khi tôi không chọn slide/comp nào, thì menu mặc định, mức zoom cũng bình thường.
> - IMG_3979 --> IMG_3980 là khi tôi add text thì vị trí khi add text tự do nó sẽ như vậy và menu khi select text sẽ như ảnh
> - IMG_3978 khi tôi ấn vào nút ảnh ở dưới menu thì sẽ hiện lên chọn ảnh từ thư viện (chọn được nhiều nhưng có lẽ nên giới hạn khoảng 10 cái để tránh nặng) add comp ảnh vào vị trí đầu tiên bên trên trái của slide đang hiện trên màn hình.
> - IMG_3981 --> IMG_3982 là khi tôi ấn vào Sticker để add sticker thì hiện bottom sheet như vậy. Các bottom sheet này sẽ có thể resize được, mặc định hiển thị 50% như ảnh, và nhỏ nhất cũng là 50%, max là 95%. bottom sheet khi mở lên sẽ đẩy lui toàn bộ canvas lên. Mục đích của kiểu đẩy canvas lên để user vừa thao tác với các item trong bottom sheet vừa xem được trực quan luôn là nó hiện như thế nào trên canvas
> - IMG_3983 --> IMG_3988 là khi ấn vào Shape. các Shape được chia theo nhóm. mỗi nhóm sẽ có danh sách các shapes, và có nút "+number" khi ấn vào thì hiện danh sách các shape của nhóm đó và có nút quay lại.
> - IMG_3989 là khi ấn vào nút "+" ở menu thì hiện bottom sheet danh sách toàn bộ các tính năng ở menu.
> - IMG_3990 --> IMG_3993 là khi ấn vào Frame, thì hiện lên bottom sheet
> - IMG_3994 là khi ấn vào widget
> - IMG_3995 là khi ấn vào brand kit
> - IMG_3996 là khi ấn vào nút "..." trên top
> - IMG_3997 là khi ấn vào preview
> - IMG_3998 là khi ấn vào snapping thì nó show sub menu
> - IMG_3999 là khi ấn nút share trên top
> - IMG_4001 là khi ấn nút layer ở dưới cùng bên phải menu.
> - IMG_4003 --> IMG_4005 là khi ở ngoài màn danh sách template tôi ấn chọn vào 1 template, thì nó ra màn hình chi tiết của template đó cho tôi xem được template đó như thế nào, các slide ra sao, các thành phần slide, có ảnh của template đó luôn. khi tôi ấn nút "use template" thì nó chuyển tôi vào màn tạo như ảnh IMG_4005 sử dụng chính template đó nhưng không kèm ảnh có sẵn mà chỉ có toàn bộ layout, text, shape, sticker, item mà template đó sử dụng
> * Lưu ý, … hãy lưu lại các mô tả, lưu lại phân tích, hành vi, xử lý, ui, ux, flow, ... của toàn bộ những cái mô tả vào docs … mô tả thêm về việc ảnh đó hiển thị cái gì, ra sao, ở vị trí thế nào, kích cỡ thế nào …

**2026-10-17 (lần 3):**
> giao diện thì có sáng và tối, mặc định theo hệ thống nhé

**Ghi chú diễn giải:** trong mô tả, "slide" khi được chọn (IMG_3966 → 3970) thực chất là **khối bố cục phủ slide** (nó co giãn được to hơn slide và vắt sang slide khác — IMG_3968), nên tài liệu gọi là **khối bố cục** (Phần 2).

---

