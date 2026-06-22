# Phenikaa F&B - Restaurant Ordering System 🍔📱

Chào mừng đến với dự án Mobile App Đặt Món Dành Khách Hàng (Customer Ordering App) cho hệ thống **Phenikaa F&B**. 
Ứng dụng được xây dựng bằng **Flutter**, tuân thủ tiêu chuẩn thiết kế hiện đại và quản lý trạng thái mượt mà.

## 🌟 Tính Năng Chính
- 📷 **Quét mã QR tại bàn:** Định danh bàn và cửa hàng tự động để gọi món.
- 📜 **Thực đơn động (Dynamic Menu):** Danh sách món ăn phân theo danh mục, tính năng cuộn đồng bộ thông minh (Sync Scrolling) và tìm kiếm (Search Delegate).
- 🛒 **Quản lý Giỏ Hàng (Cart):** Tính toán tổng tiền realtime, thêm bớt ghi chú và số lượng món ăn dễ dàng qua Bottom Sheet.
- 📦 **Theo dõi Đơn Hàng:** Tích hợp WebSocket (chuẩn bị) để theo dõi trạng thái đơn hàng (Đang nấu, Đã xong) theo thời gian thực.

## 🏗️ Kiến Trúc Dự Án (Architecture)
Dự án được xây dựng dựa trên nguyên lý **Clean Architecture**, phân lớp rõ ràng để dễ dàng mở rộng và bảo trì:
- **Presentation Layer (`lib/presentation`):** Chứa các màn hình UI và quản lý trạng thái bằng **BLoC Pattern** (`flutter_bloc`). Tách biệt hoàn toàn logic hiển thị và tính toán.
- **Data Layer (`lib/data`):**
  - `models/`: Định nghĩa các cấu trúc dữ liệu, sử dụng `Freezed` và `Json_Serializable` để sinh mã tự động (Type-safe, Immutable).
  - `repositories/`: Nơi tổng hợp và phân giải dữ liệu.
  - `datasources/`: Nơi giao tiếp trực tiếp với Backend (hiện tại đang sử dụng Mock Data, sẵn sàng tích hợp REST API qua `Dio`).

## 🛠️ Công Nghệ & Thư Viện Nổi Bật (Tech Stack)
- **Framework:** Flutter (Dart)
- **State Management:** `flutter_bloc`, `equatable`
- **Routing:** `go_router` (Hỗ trợ tốt Deep Link)
- **Network & API:** `dio` (HTTP Client), `web_socket_channel`
- **Code Generation:** `freezed`, `json_annotation`, `build_runner`
- **Tiện ích khác:** `mobile_scanner` (Quét QR), `cupertino_icons`.

## 🚀 Hướng Dẫn Cài Đặt (Getting Started)

**1. Clone dự án và cài đặt thư viện:**
```bash
flutter pub get
```

**2. Sinh mã tự động (Bắt buộc cho Freezed & Json Serializable):**
Do dự án sử dụng code generation cho các file model (`*.freezed.dart`, `*.g.dart`), nếu bạn gặp lỗi gạch đỏ ở các file model, hãy chạy lệnh sau:
```bash
dart run build_runner build --delete-conflicting-outputs
```

**3. Chạy ứng dụng:**
```bash
flutter run
```

## 📂 Cấu trúc thư mục cốt lõi
```text
lib/
├── data/
│   ├── datasources/    # Gọi API (hiện tại chứa mock_data)
│   ├── models/         # Freezed Data Classes
│   └── repositories/   # Nơi chuyển đổi JSON thành Models
├── presentation/
│   ├── blocs/          # Logic quản lý trạng thái (Cart, Menu, Order, Session)
│   └── screens/        # Các màn hình chính (Menu, QR Scanner, History...)
├── theme/              # Quy tắc thiết kế UI (Màu sắc, Font chữ)
├── widgets/            # Các component dùng chung
└── main.dart           # Điểm khởi chạy (Entry point & GoRouter config)
```
