# SRS — Hệ thống Đặt món & Quản lý quán F&B (1 cửa hàng)

**Trạng thái:** Draft — Chờ stakeholder review & approve

---

## Mục lục

1. Giới thiệu
2. Mô tả tổng quan hệ thống
3. Đối tượng sử dụng (Actors)
4. Phạm vi hệ thống (Scope)
5. Vòng đời đơn hàng (Order State Machine)
6. Yêu cầu chức năng (Functional Requirements)
7. Yêu cầu phi chức năng (Non-Functional Requirements)
8. Ràng buộc kỹ thuật (Technical Constraints)
9. Câu hỏi còn pending với Stakeholder
10. Tài liệu liên quan

---

## 1. Giới thiệu

### 1.1 Mục đích tài liệu

Tài liệu này mô tả toàn bộ yêu cầu chức năng và phi chức năng của Hệ thống Đặt món & Quản lý quán F&B (1 cửa hàng). SRS là căn cứ chính thức để:

- Nhóm phát triển (backend, frontend, mobile) hiểu đúng và build đúng.
- Stakeholder (mentor đóng vai khách hàng) review và approve trước khi nhóm bắt đầu code.
- Làm cơ sở viết test case và nghiệm thu sản phẩm cuối sprint.

### 1.2 Phạm vi áp dụng

Tài liệu áp dụng cho **Phase 2**, bao gồm:

- **Web Admin:** Ứng dụng web cho Owner và Staff.
- **Mobile App:** Ứng dụng Flutter cho Khách hàng gọi món tại bàn.
- **Backend API:** NestJS + PostgreSQL phục vụ cả hai nền tảng trên.

### 1.3 Định nghĩa & Từ viết tắt

| Thuật ngữ     | Giải thích                                            |
| ------------- | ----------------------------------------------------- |
| Owner         | Chủ quán — toàn quyền trên hệ thống                   |
| Staff         | Nhân viên phục vụ / Thu ngân / Bếp                    |
| Guest         | Khách hàng ẩn danh — nhận diện qua QR bàn             |
| FR            | Functional Requirement — yêu cầu chức năng            |
| NFR           | Non-Functional Requirement — yêu cầu phi chức năng    |
| AC            | Acceptance Criteria — tiêu chí chấp nhận              |
| US            | User Story                                            |
| JWT           | JSON Web Token — cơ chế xác thực                      |
| RBAC          | Role-Based Access Control — phân quyền theo vai trò   |
| CRUD          | Create, Read, Update, Delete                          |
| Realtime      | Cập nhật tức thì không cần tải lại trang              |
| Snapshot      | Chụp giá trị tại một thời điểm, không thay đổi sau đó |
| Soft delete   | Ẩn bản ghi thay vì xóa hẳn khỏi database              |
| State Machine | Sơ đồ trạng thái mô tả vòng đời đơn hàng              |
| QR tĩnh       | Mã QR cố định theo bàn, không thay đổi theo phiên     |

### 1.4 Tài liệu tham chiếu

- `Domain-Brief-FnB-Ordering-Phenikaa.md` — Bối cảnh nghiệp vụ do stakeholder cung cấp
- `Backlog-Sprint0-Phenikaa-v2.1.md` — User Story & Acceptance Criteria (do BA viết)

---

## 2. Mô tả tổng quan hệ thống

### 2.1 Bối cảnh & Vấn đề

Một quán cà phê / nhà hàng nhỏ (1 cửa hàng) đang vận hành theo quy trình thủ công:

- Khách gọi nhân viên → nhân viên ghi giấy → chuyển xuống bếp → dễ sai sót vào giờ cao điểm.
- Chủ quán không nắm được doanh thu theo ngày một cách rõ ràng.

### 2.2 Mục tiêu hệ thống

1. **Khách tự gọi món tại bàn** qua điện thoại (quét QR → xem menu → đặt đơn → theo dõi trạng thái).
2. **Nhân viên/Bếp xử lý đơn trên web** theo thời gian thực.
3. **Chủ quán quản lý toàn bộ** menu, bàn, nhân viên và xem báo cáo doanh thu.

### 2.3 Kiến trúc tổng quan

```
[Khách - Flutter App]
        |
        | REST API / WebSocket
        ↓
[Backend - NestJS + PostgreSQL]
        ↑
        | REST API / WebSocket
        |
[Staff/Owner - Next.js Web Admin]
```

---

## 3. Đối tượng sử dụng (Actors)

| Actor                 | Kênh                 | Mô tả                                                             |
| --------------------- | -------------------- | ----------------------------------------------------------------- |
| **Khách (Guest)**     | Mobile App (Flutter) | Ẩn danh — quét QR tại bàn, xem menu, đặt món, theo dõi trạng thái |
| **Nhân viên (Staff)** | Web Admin            | Xem đơn mới, xử lý trạng thái đơn, xác nhận thanh toán            |
| **Chủ quán (Owner)**  | Web Admin            | Toàn quyền: quản lý menu, bàn, nhân viên, xem báo cáo             |

> **Lưu ý:** Khách **không cần tài khoản**. Chỉ Staff và Owner mới cần đăng nhập qua Web Admin.

---

## 4. Phạm vi hệ thống (Scope)

### 4.1 Trong phạm vi (In Scope)

- Đăng nhập, phân quyền theo vai trò, quản lý phiên đăng nhập (JWT).
- Quản lý danh mục và món ăn (CRUD, trạng thái còn/hết, giá snapshot).
- Quản lý bàn: tạo, sửa, xóa, sinh mã QR tĩnh.
- Quản lý tài khoản nhân viên: tạo, vô hiệu hóa.
- Khách: quét QR → xem menu → thêm giỏ → đặt đơn → theo dõi trạng thái realtime.
- Bảng đơn (Order Board) cho Staff/Bếp, cập nhật realtime qua WebSocket.
- Vòng đời đơn hàng theo State Machine (xem mục 5).
- Xác nhận thanh toán thủ công (tiền mặt / chuyển khoản).
- Báo cáo doanh thu cơ bản theo ngày.

### 4.2 Ngoài phạm vi (Out of Scope)

- Tích hợp cổng thanh toán thật (VNPay, Momo...).
- Quản lý kho nguyên liệu / công thức chế biến.
- Khuyến mãi, mã giảm giá, tích điểm khách hàng.
- Nhiều chi nhánh / multi-tenant.
- Chấm công, phân ca nhân viên.
- In hóa đơn máy in nhiệt.

---

## 5. Vòng đời đơn hàng (Order State Machine)

> **Quy tắc cứng — do stakeholder quyết định, KHÔNG thay đổi.**

```
Mới ──► Đang chuẩn bị ──► Đã phục vụ ──► Đã thanh toán
 │               │
 └───────────────┴──► Đã hủy   (chỉ khi CHƯA thanh toán)
```

| Chuyển trạng thái          | Ai thực hiện     | Điều kiện                           |
| -------------------------- | ---------------- | ----------------------------------- |
| Mới → Đang chuẩn bị        | Staff / Bếp      | Đơn đang ở trạng thái Mới           |
| Đang chuẩn bị → Đã phục vụ | Staff / Bếp      | Đơn đang ở trạng thái Đang chuẩn bị |
| Đã phục vụ → Đã thanh toán | Staff / Thu ngân | Đơn đang ở trạng thái Đã phục vụ    |
| Mới → Đã hủy               | Staff / Owner    | Đơn chưa thanh toán                 |
| Đang chuẩn bị → Đã hủy     | Staff / Owner    | Đơn chưa thanh toán                 |

**Quy tắc bất biến:**

- Không có chuyển trạng thái ngược (trừ hủy trước thanh toán).
- Đơn **Đã thanh toán** là bất biến — không sửa, không hủy dưới mọi hình thức.

> ⚠️ **Pending stakeholder (Q1):** Đơn ở trạng thái "Đã phục vụ" có được hủy không? Bảng trên chưa cover trường hợp này.

---

## 6. Yêu cầu chức năng (Functional Requirements)

---

### FR-01: Xác thực & Phân quyền _(US-00)_

#### FR-01.1: Đăng nhập

- Hệ thống cung cấp trang đăng nhập tại `/login`.
- Người dùng đăng nhập bằng **email và mật khẩu**.
- Khi xác thực thành công, hệ thống cấp **JWT token** và điều hướng theo vai trò:
  - Owner → `/dashboard` (sidebar đầy đủ 5 mục)
  - Staff → `/orders` (sidebar chỉ hiển thị "Bảng đơn")
- Khi đăng nhập thất bại: hiển thị thông báo lỗi chung, **không tiết lộ** email hay mật khẩu sai.

#### FR-01.2: Phân quyền theo vai trò (RBAC)

| Tính năng                   | Owner | Staff | Guest |
| --------------------------- | :---: | :---: | :---: |
| Quản lý Danh mục (CRUD)     |  ✅   |  ❌   |  ❌   |
| Quản lý Món ăn (CRUD)       |  ✅   |  ❌   |  ❌   |
| Quản lý Bàn + QR            |  ✅   |  ❌   |  ❌   |
| Xem Bảng đơn                |  ✅   |  ✅   |  ❌   |
| Cập nhật trạng thái đơn     |  ✅   |  ✅   |  ❌   |
| Xác nhận thanh toán         |  ✅   |  ✅   |  ❌   |
| Xem Báo cáo doanh thu       |  ✅   |  ❌   |  ❌   |
| Quản lý Nhân viên           |  ✅   |  ❌   |  ❌   |
| Xem Menu & Đặt món (Mobile) |  ❌   |  ❌   |  ✅   |

> **Ghi chú:** Owner không dùng Mobile App để đặt món — Owner quản lý menu qua Web Admin. Dấu ❌ ở cột Guest với Web Admin nghĩa là Guest không có kênh truy cập Web Admin, không phải "không có quyền".

- Staff truy cập route không được phép → Hệ thống trả về **403 Forbidden**.
- Người dùng chưa đăng nhập truy cập route bảo vệ → Tự động chuyển hướng về `/login`.

#### FR-01.3: Đăng xuất

- User bấm "Đăng xuất" → Hệ thống xóa token → Chuyển về `/login`.

#### FR-01.4: Phiên đăng nhập hết hạn

- Khi JWT hết hạn trong khi User đang sử dụng, hệ thống tự chuyển về `/login` kèm thông báo: _"Phiên làm việc đã hết hạn, vui lòng đăng nhập lại."_

---

### FR-02: Quản lý Danh mục _(US-01a)_

#### FR-02.1: Xem danh sách

- Hiển thị danh sách danh mục: Tên danh mục, Số món thuộc danh mục.

#### FR-02.2: Tạo danh mục

- Trường bắt buộc: Tên danh mục.
- Tên **không được để trống** và **không được trùng** với danh mục đã có.
- Nếu vi phạm: báo lỗi cụ thể, không gọi API, form giữ nguyên dữ liệu.

#### FR-02.3: Sửa danh mục

- Owner sửa tên danh mục. Ràng buộc trùng tên vẫn áp dụng.

#### FR-02.4: Xóa danh mục

- Nếu danh mục **còn món ăn**: Từ chối xóa, hiển thị cảnh báo _"Danh mục này còn [n] món ăn. Vui lòng chuyển hoặc xóa các món trước."_
- Nếu danh mục **rỗng**: Yêu cầu xác nhận → Xóa thành công.

---

### FR-03: Quản lý Món ăn _(US-01b)_

#### FR-03.1: Xem danh sách món ăn

- Hiển thị dạng bảng: Ảnh, Tên món, Danh mục, Giá, Trạng thái.
- Hỗ trợ **tìm kiếm** theo tên (debounce 300ms), **lọc** theo danh mục, **phân trang** 10 bản ghi/trang.

#### FR-03.2: Tạo món ăn

- Trường bắt buộc: Tên món, Danh mục (chọn từ dropdown), Giá bán (số nguyên ≥ 0).
- Trường optional: Ảnh (upload hoặc URL), Mô tả.
- Trạng thái mặc định khi tạo: **Còn hàng**.

#### FR-03.3: Sửa món ăn

- Owner sửa bất kỳ thông tin nào (tên, giá, ảnh, mô tả, danh mục, trạng thái).

#### FR-03.4: Thay đổi trạng thái (Toggle nhanh)

- Owner bật/tắt Toggle "Còn hàng / Hết hàng" trực tiếp trên danh sách.
- Khi món chuyển sang **Hết hàng**: Nút "Thêm vào giỏ" trên Mobile App bị **disable** trong vòng 3–5 giây qua WebSocket, không cần khách refresh.
- Khi món chuyển lại **Còn hàng**: Nút được **enable** trở lại theo cơ chế tương tự.

#### FR-03.5: Quy tắc chốt giá (Price Snapshot Rule)

- **Giá chốt tại thời điểm đặt:** Khi khách đặt đơn, giá từng món được lưu vào `OrderItem.price_at_order_time`.
- Nếu Owner thay đổi giá sau đó, **các đơn đã đặt không bị ảnh hưởng**. Chỉ đơn mới dùng giá mới.

#### FR-03.6: Xóa món ăn _(⚠️ Pending — xem Q9)_

- Khi Owner xóa một món đã có trong đơn hàng cũ, cần stakeholder quyết định hướng xử lý: soft delete (ẩn khỏi menu nhưng giữ trong database để đơn cũ vẫn hiển thị tên món) hay hard delete. FR này sẽ được bổ sung sau khi có câu trả lời.

#### FR-03.7: Phân quyền

- Staff truy cập `/menu` bằng URL → Hệ thống trả về 403. Không trả về bất kỳ dữ liệu nào.

---

### FR-04: Quản lý Bàn & Sinh mã QR _(US-02)_

> ⚠️ **Lỗ hổng nghiệp vụ cần stakeholder quyết định (Q3 + Q4):** FR này đang thiết kế dựa trên **QR tĩnh** (cố định theo bàn). Điều này tiềm ẩn rủi ro : Khách A bỏ về quên thanh toán → Khách B ngồi vào quét QR đặt món → hệ thống gộp đơn của cả 2 → **Khách B trả tiền cho cả Khách A.** Stakeholder cần quyết định: (1) QR tĩnh + bắt buộc có cơ chế "đóng bàn/mở bàn" thủ công, hoặc (2) QR đổi theo phiên — sinh QR mới sau mỗi lần thanh toán. Scope và ERD sẽ thay đổi tùy theo hướng chọn.

#### FR-04.1: Xem danh sách bàn

- Hiển thị: Tên bàn, Sức chứa, Trạng thái (Trống / Đang có khách), Mã QR.

#### FR-04.2: Tạo bàn

- Trường bắt buộc: Tên bàn (không được trùng).
- Trường optional: Sức chứa.
- Khi tạo bàn, hệ thống **tự động sinh mã QR tĩnh** chứa `table_id`.
- Bàn mới có trạng thái mặc định: **Trống**.

#### FR-04.3: Sửa bàn

- Owner sửa Tên bàn hoặc Sức chứa.
- Mã QR **không thay đổi** khi sửa tên — vì QR chứa `table_id`, không chứa tên bàn.

#### FR-04.4: Tải mã QR

- Owner tải xuống file **PNG** chứa mã QR của từng bàn để in dán.

#### FR-04.5: Xóa bàn

- Nếu bàn đang có **đơn hàng chưa hoàn tất**: Từ chối xóa.
- Nếu bàn **trống**: Yêu cầu xác nhận → Xóa thành công.
- Mã QR cũ sau khi xóa bàn sẽ trả về lỗi _"Bàn không tồn tại"_ khi được quét.

---

### FR-05: Khách hàng Xem Menu & Đặt món _(US-03)_

#### FR-05.1: Xác định bàn qua QR

- Khách quét mã QR → App đọc `table_id` và gọi API xác thực.
- Nếu `table_id` **hợp lệ**: Hiển thị menu của quán kèm tên bàn.
- Nếu `table_id` **không hợp lệ / không tồn tại**: Hiển thị thông báo lỗi thân thiện _"Mã QR không hợp lệ. Vui lòng liên hệ nhân viên."_ — không crash app, không hiển thị menu.

#### FR-05.2: Xem Menu

- Menu tổ chức theo danh mục.
- Món trạng thái **Hết hàng**: Bị mờ, nút "Thêm vào giỏ" bị disable.
- Giá hiển thị là giá hiện tại của món.

#### FR-05.3: Giỏ hàng & Đặt đơn

- Khách chọn món → số lượng → ghi chú (VD: _"Ít đá, nhiều đường"_) → Thêm vào giỏ.
- Khách xem giỏ hàng, kiểm tra danh sách và tổng tiền trước khi đặt.
- Khi bấm "Đặt đơn", hệ thống **validate lại trạng thái từng món trong giỏ** tại thời điểm gọi API:
  - Nếu có món vừa hết hàng: Từ chối tạo đơn, trả về thông báo _"Món [tên món] vừa hết hàng. Vui lòng xóa khỏi giỏ và tiếp tục."_ Giỏ hàng giữ nguyên các món còn lại.
  - Nếu tất cả món còn hàng: Tạo đơn với trạng thái **Mới**, giá các món được **snapshot** tại thời điểm này.

#### FR-05.4: Gọi thêm món

- Trong cùng phiên ngồi, khách có thể đặt thêm đơn mới.
- Mỗi lần bấm "Đặt đơn" tạo ra một **đơn hàng mới** gắn cùng `table_id`. Không ghi đè đơn cũ.

#### FR-05.5: Theo dõi trạng thái đơn

- Sau khi đặt, App hiển thị màn hình theo dõi trạng thái.
- Trạng thái cập nhật **realtime** (không cần refresh) khi Staff xử lý trên Web Admin.

#### FR-05.6: Khách tự hủy đơn _(⚠️ Pending — xem Q7)_

- Cần stakeholder quyết định: App có nút Hủy cho khách không, hay chỉ Staff mới được hủy. FR này sẽ bổ sung sau khi có câu trả lời.

---

### FR-06: Bảng đơn & Xử lý trạng thái _(US-04)_

#### FR-06.1: Bảng đơn Realtime

- Trang "Bảng đơn" hiển thị các đơn đang hoạt động theo cột trạng thái.
- Khi có đơn mới, thẻ đơn **tự động xuất hiện trong vòng 3–5 giây** (qua WebSocket) kèm âm báo nhẹ — không cần F5.

#### FR-06.2: Thông tin thẻ đơn

- Mỗi thẻ hiển thị: Tên bàn, Thời gian đặt, Danh sách món + Ghi chú, Tổng tiền, Trạng thái.

#### FR-06.3: Cập nhật trạng thái

- Staff/Bếp chuyển đơn theo vòng đời: **Mới → Đang chuẩn bị → Đã phục vụ**.
- **Không được** chuyển trạng thái ngược.
- Khi trạng thái thay đổi, Mobile App của khách cũng cập nhật realtime.

#### FR-06.4: Hủy đơn

- Chỉ được hủy khi đơn ở trạng thái **Mới** hoặc **Đang chuẩn bị**.
- _(⚠️ Pending Q8):_ Có yêu cầu nhập lý do hủy không? Cần confirm với stakeholder.
- Sau khi hủy: App của khách hiển thị trạng thái **Đã hủy**.
- Đơn **Đã thanh toán**: Nút Hủy bị vô hiệu hóa — không thể thao tác dưới bất kỳ hình thức nào.

#### FR-06.5: Hủy đơn Đã phục vụ _(⚠️ Pending — xem Q1)_

- Cần stakeholder quyết định: Đơn ở trạng thái "Đã phục vụ" có được hủy không? Nếu không cho hủy, sẽ dẫn đến rủi ro "treo bàn" khi khách bỏ về không thanh toán. FR này sẽ bổ sung sau khi có câu trả lời.

---

### FR-07: Thanh toán thủ công _(US-05a)_

#### FR-07.1: Gộp đơn tính tiền

- Thu ngân chọn bàn cần thanh toán.
- Hệ thống **tự động gộp tất cả đơn chưa thanh toán** của bàn thành 1 hóa đơn tổng.
- Hiển thị tổng tiền, danh sách đơn và món kèm giá snapshot.

#### FR-07.2: Xác nhận thanh toán

- Thu ngân chọn hình thức: **Tiền mặt** hoặc **Chuyển khoản**.
- Hệ thống lưu hình thức thanh toán vào database.
- _(Lưu ý: Chỉ ghi nhận — KHÔNG tích hợp cổng thanh toán thật)_

#### FR-07.3: Sau khi thanh toán

- Tất cả đơn của bàn chuyển sang **Đã thanh toán**.
- Bàn về trạng thái **Trống**.
- Đơn **Đã thanh toán** bị **khóa cứng** — không thể sửa hay hủy.

#### FR-07.4: Thanh toán khi còn đơn chưa hoàn tất _(⚠️ Pending — xem Q10)_

- Cần stakeholder quyết định: Nếu bàn có đơn đang ở trạng thái "Đang chuẩn bị" (chưa phục vụ xong), có cho phép thanh toán không hay phải đợi tất cả đơn về "Đã phục vụ"? FR này sẽ bổ sung sau khi có câu trả lời.

---

### FR-08: Báo cáo Doanh thu _(US-05b)_

#### FR-08.1: Nội dung báo cáo

- Tổng doanh thu trong ngày.
- Tổng số đơn đã hoàn tất (trạng thái Đã thanh toán).
- Top các món bán chạy nhất.
- _(⚠️ Pending Q2):_ "Món bán chạy" tính theo số lượng hay theo doanh thu?

#### FR-08.2: Quy tắc tính doanh thu

- **Chỉ tính** các đơn ở trạng thái **Đã thanh toán**.
- Đơn bị hủy và đơn đang xử lý **không được tính**.

#### FR-08.3: Lọc theo thời gian _(⚠️ Pending — xem Q2)_

- Hiện tại thiết kế hỗ trợ lọc theo **1 ngày đơn lẻ**. Cần confirm với stakeholder: có cần thêm date range không? FR này sẽ bổ sung sau khi có câu trả lời.

#### FR-08.4: Phân quyền

- Chỉ **Owner** được truy cập trang Báo cáo.
- Staff cố truy cập → Hệ thống trả về 403, không trả về bất kỳ dữ liệu doanh thu nào.

---

### FR-09: Quản lý Tài khoản Nhân viên _(US-06)_

#### FR-09.1: Xem danh sách nhân viên

- Hiển thị: Họ tên, Email, Vai trò, Trạng thái (Đang hoạt động / Vô hiệu hóa).

#### FR-09.2: Tạo tài khoản Staff

- Trường bắt buộc: Họ tên, Email (không được trùng), Mật khẩu tạm thời, Vai trò (Staff).
- Sau khi tạo, nhân viên có thể đăng nhập ngay với email & mật khẩu tạm thời.

#### FR-09.3: Vô hiệu hóa tài khoản

- Owner bấm "Vô hiệu hóa" → Tài khoản không thể đăng nhập từ thời điểm này.
- Nếu tài khoản đang đăng nhập: Token bị thu hồi, bị đăng xuất ngay lập tức.
- **Owner không thể tự vô hiệu hóa chính tài khoản của mình.**

#### FR-09.4: Chính sách mật khẩu _(⚠️ Pending — xem Q5 + Q6)_

- Cần stakeholder quyết định: (1) Staff có bắt buộc đổi mật khẩu sau lần đăng nhập đầu tiên không? (2) Staff có thể tự đổi mật khẩu bất cứ lúc nào không, hay chỉ Owner mới được reset? FR này sẽ bổ sung sau khi có câu trả lời.

---

## 7. Yêu cầu phi chức năng (Non-Functional Requirements)

### NFR-01: Hiệu năng Realtime

- Đơn hàng mới xuất hiện trên Order Board trong **vòng 3–5 giây** sau khi khách đặt.
- Trạng thái đơn cập nhật trên Mobile App trong **vòng 3–5 giây** sau khi Staff xử lý.
- Sử dụng **WebSocket** làm primary. Fallback về polling nếu WebSocket không khả dụng.

### NFR-02: Bảo mật (Security)

- Xác thực bằng **JWT token**.
- Phân quyền **RBAC** được kiểm tra tại cả tầng API (backend) và tầng UI (frontend).
- Thông báo lỗi đăng nhập không tiết lộ trường nào sai.
- Mã QR chỉ chứa `table_id` — không chứa thông tin nhạy cảm.

### NFR-03: Đa nền tảng (Cross-platform)

- **Mobile App** chạy được trên cả **Android và iOS** (Flutter).
- **Web Admin** responsive, sử dụng được trên desktop và tablet.

### NFR-04: Độ tin cậy (Reliability)

- Giá món ăn được lưu dạng **snapshot** trong `OrderItem` tại thời điểm đặt — đảm bảo toàn vẹn dữ liệu dù menu thay đổi sau đó.
- Validate trạng thái món tại thời điểm gọi API đặt đơn — không chỉ khi browse menu (xem FR-05.3).
- Đơn **Đã thanh toán** là bất biến — không thể sửa hay xóa dưới bất kỳ hình thức nào.

### NFR-05: Triển khai (Deployment)

- Ứng dụng đóng gói bằng **Docker**.
- Pipeline **CI/CD** (GitHub Actions): tự động build và test khi push code.
- Deploy được lên **VPS**.

### NFR-06: Khả năng bảo trì (Maintainability)

- Backend theo **layered architecture** (Controller → Service → Repository).
- API theo chuẩn **RESTful**.
- Code có **unit test** cho các business logic quan trọng: price snapshot, state machine, concurrency check.

---

## 8. Ràng buộc kỹ thuật (Technical Constraints)

| Thành phần       | Công nghệ                  |
| ---------------- | -------------------------- |
| Backend          | NestJS + PostgreSQL        |
| Web Admin        | Next.js                    |
| Mobile App       | Flutter                    |
| Xác thực         | JWT                        |
| Realtime         | WebSocket (NestJS Gateway) |
| Containerization | Docker + Docker Compose    |
| CI/CD            | GitHub Actions             |
| Deploy           | VPS                        |

---

## 9. Câu hỏi còn pending với Stakeholder

Các câu hỏi dưới đây ảnh hưởng trực tiếp đến FR và cần được stakeholder trả lời **trước khi lock SRS và bắt đầu code**.

| #   | Câu hỏi                                                                                                                                    | Ảnh hưởng đến                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| Q1  | Đơn ở trạng thái "Đã phục vụ" có được phép hủy không? Nếu không, sẽ dẫn đến "treo bàn" khi khách bỏ về không trả tiền.                     | FR-06.5, State Machine mục 5             |
| Q2  | Báo cáo lọc theo 1 ngày đơn lẻ hay cần date range? "Món bán chạy" tính theo số lượng hay doanh thu?                                        | FR-08.1, FR-08.3                         |
| Q3  | Mã QR tĩnh (in 1 lần, dùng mãi) hay QR đổi theo phiên (sinh mới sau mỗi lần thanh toán)? Ảnh hưởng trực tiếp đến rủi ro "bóng ma gộp đơn". | FR-04, ERD (có cần Session entity không) |
| Q4  | Nếu chọn QR tĩnh: Có cơ chế "đóng bàn / mở bàn" thủ công không? Nhân viên cần bấm gì sau mỗi lượt khách?                                   | FR-04, FR-07                             |
| Q5  | Mật khẩu tạm thời có bắt buộc đổi sau lần đăng nhập đầu tiên không?                                                                        | FR-09.4                                  |
| Q6  | Staff có thể tự đổi mật khẩu không, hay chỉ Owner mới được reset?                                                                          | FR-09.4                                  |
| Q7  | App Mobile có nút Hủy đơn cho khách không, hay chỉ Staff/Owner mới được hủy?                                                               | FR-05.6, FR-06.4                         |
| Q8  | Hủy đơn có yêu cầu nhập lý do không?                                                                                                       | FR-06.4                                  |
| Q9  | Khi Owner xóa món đã có trong đơn cũ: soft delete (ẩn khỏi menu) hay hard delete? Nếu hard delete, đơn cũ có còn hiển thị tên món không?   | FR-03.6, ERD                             |
| Q10 | Nếu bàn còn đơn đang "Đang chuẩn bị", có cho phép thanh toán ngay không hay phải đợi tất cả đơn về "Đã phục vụ"?                           | FR-07.4                                  |

---

## 10. Tài liệu liên quan (do thành viên khác thực hiện)

| Tài liệu                          | Người thực hiện       | Trạng thái     |
| --------------------------------- | --------------------- | -------------- |
| ERD (Entity Relationship Diagram) | Cường + Trà (Backend) | Đang thực hiện |
| Wireframe Web Admin               | Đức (Frontend)        | Đang thực hiện |
| Wireframe Mobile App              | Dương (Mobile)        | Đang thực hiện |

---

_Các FR đánh dấu ⚠️ pending sẽ được cập nhật sau khi có phản hồi từ stakeholder (anh mentor)._