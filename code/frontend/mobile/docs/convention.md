# Coding Convention

> Tài liệu quy ước viết code cho dự án sử dụng **NestJS** (backend), **Next.js** (frontend), **Flutter** (mobile), và **PostgreSQL** (cơ sở dữ liệu).
>
> Mọi thành viên trong team đều phải đọc và tuân thủ tài liệu này trước khi bắt đầu đóng góp code.

---

## Mục lục

1. [Đặt tên (Naming)](#1-đặt-tên-naming)
2. [Định dạng code (Formatting)](#2-định-dạng-code-formatting)
3. [Comment (Ghi chú code)](#3-comment-ghi-chú-code)
4. [Cấu trúc file & thư mục](#4-cấu-trúc-file--thư-mục)
5. [Git Convention](#5-git-convention)
6. [Tooling (Công cụ tự động)](#6-tooling-công-cụ-tự-động)
7. [Testing](#7-testing)
8. [Error Handling (Xử lý lỗi)](#8-error-handling-xử-lý-lỗi)
9. [Security (Bảo mật)](#9-security-bảo-mật)

---

## 1. Đặt tên (Naming)

> **Nguyên tắc chung:** Tên phải mô tả rõ mục đích. Không dùng tên viết tắt mơ hồ như `d`, `tmp`, `x`.

### 1.1 TypeScript / JavaScript (NestJS & Next.js)

| Loại | Quy tắc | Ví dụ đúng  | Ví dụ sai |
|------|---------|----------|----------|
| Biến, tham số | `camelCase` | `userName`, `totalPrice` | `UserName`, `total_price` |
| Hàm / phương thức | `camelCase` | `getUserById()`, `calculateTotal()` | `GetUser()`, `get_user()` |
| Class | `PascalCase` | `UserService`, `OrderController` | `userService`, `order_controller` |
| Interface | `PascalCase` + tiền tố `I` | `IUser`, `IOrderResponse` | `user_interface`, `userInterface` |
| Enum | `PascalCase`, giá trị `UPPER_SNAKE_CASE` | `OrderStatus.PENDING` | `orderstatus.pending` |
| Hằng số | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `JWT_SECRET` | `maxRetry`, `jwtSecret` |
| File TypeScript | `kebab-case` | `user.service.ts`, `auth.guard.ts` | `UserService.ts`, `authGuard.ts` |
| Component Next.js | `PascalCase` | `UserCard.tsx`, `LoginForm.tsx` | `userCard.tsx`, `login-form.tsx` |

### 1.2 Flutter (Dart)

| Loại | Quy tắc | Ví dụ đúng  | Ví dụ sai |
|------|---------|----------|----------|
| Biến, tham số | `camelCase` | `userName`, `isLoading` | `user_name`, `IsLoading` |
| Class / Widget | `PascalCase` | `LoginScreen`, `UserCard` | `login_screen`, `userCard` |
| Hằng số | `camelCase` với `const` | `const defaultPadding = 16.0` | `DEFAULT_PADDING` |
| File Dart | `snake_case` | `user_service.dart`, `login_screen.dart` | `UserService.dart`, `loginScreen.dart` |
| Enum | `PascalCase`, giá trị `camelCase` | `enum Status { pending, active }` | `enum STATUS { PENDING }` |

### 1.3 Cơ sở dữ liệu PostgreSQL

> Tất cả tên trong database đều dùng **`snake_case`** (chữ thường, nối bằng dấu gạch dưới).

| Loại | Quy tắc | Ví dụ đúng  | Ví dụ sai |
|------|---------|----------|----------|
| Tên bảng | `snake_case`, số nhiều | `users`, `order_items` | `User`, `OrderItems` |
| Tên cột | `snake_case` | `first_name`, `created_at` | `firstName`, `CreatedAt` |
| Khóa ngoại | `<tên_bảng>_id` | `user_id`, `order_id` | `userId`, `orderId` |
| Index | `idx_<bảng>_<cột>` | `idx_users_email` | `emailIndex` |
| Primary key | `id` | `id` (UUID hoặc serial) | `userId`, `user_id` |
| Timestamp | Dùng `created_at`, `updated_at`, `deleted_at` | `created_at` | `createdAt`, `create_time` |

**Ví dụ tạo bảng chuẩn:**

```sql
-- Đúng
CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id),
  product_id  UUID NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL,
  unit_price  NUMERIC(10, 2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sai
CREATE TABLE OrderItems (
  Id         UUID,
  orderId    UUID,
  unitPrice  DECIMAL
);
```

---

## 2. Định dạng code (Formatting)

> **Nguyên tắc:** Code được format tự động bởi công cụ (Prettier, dart format). Không chỉnh tay.

### 2.1 TypeScript / JavaScript (NestJS & Next.js)

| Quy tắc | Giá trị |
|---------|---------|
| Thụt lề (indent) | **2 dấu cách** (spaces), không dùng tab |
| Độ dài tối đa mỗi dòng | 100 ký tự |
| Dấu nháy chuỗi | Nháy đơn `'` (Prettier tự xử lý) |
| Dấu chấm phẩy cuối câu | Có `;` |
| Dấu phẩy cuối dòng (trailing comma) | Có, ở dòng cuối cùng của object/array nhiều dòng |
| Dấu ngoặc nhọn `{}` | Luôn có, kể cả khi `if` chỉ có 1 dòng |

**Ví dụ:**

```typescript
// Đúng — thụt lề 2 dấu cách, trailing comma, dấu ngoặc đầy đủ
const getUserById = async (id: string): Promise<User> => {
  const user = await userRepository.findOne({
    where: { id },
    relations: ['orders', 'profile'],
  });

  if (!user) {
    throw new NotFoundException(`Không tìm thấy user với id: ${id}`);
  }

  return user;
};

// Sai — dùng tab, thiếu dấu ngoặc, không có trailing comma
const getUserById = async (id: string): Promise<User> => {
	const user = await userRepository.findOne({
		where: { id },
		relations: ['orders', 'profile']
	})
	if (!user) throw new NotFoundException('Not found')
	return user
}
```

### 2.2 Flutter (Dart)

| Quy tắc | Giá trị |
|---------|---------|
| Thụt lề | **2 dấu cách** |
| Độ dài tối đa mỗi dòng | 80 ký tự |
| Format tự động | `dart format .` |

**Ví dụ:**

```dart
//  Đúng
class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Đăng nhập'),
      ),
      body: const LoginForm(),
    );
  }
}
```

### 2.3 SQL

| Quy tắc | Giá trị |
|---------|---------|
| Từ khóa SQL | UPPER CASE (`SELECT`, `WHERE`, `JOIN`) |
| Tên bảng, cột | snake_case, chữ thường |
| Thụt lề | 2 dấu cách |

```sql
--  Đúng
SELECT
  u.id,
  u.email,
  u.full_name,
  COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.deleted_at IS NULL
GROUP BY u.id
ORDER BY u.created_at DESC;
```

---

## 3. Comment (Ghi chú code)

> **Nguyên tắc:** Comment giải thích **tại sao**, không giải thích **cái gì** (code đã nói rõ điều đó rồi).

### 3.1 Khi nào nên comment

```typescript
//  Nên comment — giải thích lý do nghiệp vụ phức tạp
// Giảm giá 10% nếu user đã mua trên 5 đơn hàng trong 30 ngày qua
const discount = recentOrderCount > 5 ? 0.1 : 0;

// Không nên comment — code đã tự nói rõ
// Cộng 1 vào i
i = i + 1;
```

### 3.2 JSDoc — Mô tả hàm, class (TypeScript)

> **JSDoc** là cú pháp comment đặc biệt giúp IDE (như VS Code) hiển thị gợi ý khi bạn dùng hàm đó.

```typescript
/**
 * Lấy thông tin user theo ID.
 *
 * @param id - UUID của user cần tìm
 * @returns Thông tin user nếu tồn tại
 * @throws NotFoundException nếu không tìm thấy user
 */
async getUserById(id: string): Promise<User> {
  // ...
}
```

### 3.3 Dart Docstring (Flutter)

```dart
/// Hiển thị màn hình đăng nhập.
///
/// Nhận [onSuccess] là callback được gọi khi đăng nhập thành công.
class LoginScreen extends StatelessWidget {
  final VoidCallback onSuccess;
  // ...
}
```

### 3.4 Tag đặc biệt

| Tag | Ý nghĩa | Ví dụ |
|-----|---------|-------|
| `// TODO:` | Cần làm thêm trong tương lai | `// TODO: Thêm phân trang cho API này` |
| `// FIXME:` | Có lỗi cần sửa | `// FIXME: Xử lý trường hợp user null` |
| `// HACK:` | Giải pháp tạm thời, cần refactor | `// HACK: Workaround do API bên thứ 3 bị lỗi` |
| `// NOTE:` | Lưu ý quan trọng cho người đọc | `// NOTE: Hàm này chỉ gọi được sau khi đã auth` |

---

## 4. Cấu trúc file & thư mục

### 4.1 NestJS (Backend)

```
backend/
├── src/
│   ├── modules/              # Mỗi tính năng là 1 module riêng
│   │   ├── users/
│   │   │   ├── dto/          # DTO = Data Transfer Object, định nghĩa dữ liệu vào/ra
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── update-user.dto.ts
│   │   │   ├── entities/     # Entity = ánh xạ với bảng trong database
│   │   │   │   └── user.entity.ts
│   │   │   ├── users.controller.ts   # Nhận request HTTP
│   │   │   ├── users.service.ts      # Xử lý logic nghiệp vụ
│   │   │   ├── users.module.ts       # Khai báo module
│   │   │   └── users.repository.ts  # Tương tác với database
│   │   └── orders/
│   │       └── ...
│   ├── common/               # Code dùng chung toàn project
│   │   ├── decorators/       # Decorator tùy chỉnh
│   │   ├── filters/          # Bộ lọc xử lý lỗi
│   │   ├── guards/           # Bảo vệ route (auth, roles)
│   │   ├── interceptors/     # Xử lý request/response
│   │   └── pipes/            # Validate & transform dữ liệu
│   ├── config/               # Cấu hình app (database, JWT, ...)
│   ├── database/
│   │   └── migrations/       # File migration thay đổi cấu trúc DB
│   └── main.ts               # Điểm khởi chạy ứng dụng
├── test/
├── .env.example
└── package.json
```

**Quy tắc:**
- Mỗi module chứa đầy đủ controller, service, entity của tính năng đó.
- Không được import trực tiếp service của module khác — dùng qua module exports.
- File `*.module.ts` phải khai báo đầy đủ `imports`, `controllers`, `providers`, `exports`.

### 4.2 Next.js (Frontend)

```
frontend/
├── src/
│   ├── app/                  # App Router của Next.js 13+
│   │   ├── (auth)/           # Nhóm route (không ảnh hưởng URL)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/               # Component UI cơ bản (Button, Input, Modal)
│   │   └── features/         # Component theo tính năng (UserCard, OrderTable)
│   ├── hooks/                # Custom React Hook
│   ├── lib/                  # Tiện ích, helper functions
│   ├── services/             # Gọi API
│   ├── stores/               # State management (Zustand, Redux)
│   └── types/                # TypeScript type & interface dùng chung
├── public/
└── package.json
```

**Quy tắc:**
- Mỗi component nằm trong file riêng, đặt tên theo `PascalCase`.
- Không viết logic phức tạp trong component — tách ra custom hook.
- File trong `services/` chỉ được gọi API, không xử lý logic UI.

### 4.3 Flutter (Mobile)

```
mobile/
├── lib/
│   ├── core/
│   │   ├── constants/        # Hằng số toàn ứng dụng
│   │   ├── theme/            # Màu sắc, font chữ, kích thước
│   │   └── utils/            # Hàm tiện ích
│   ├── data/
│   │   ├── models/           # Model dữ liệu (ánh xạ từ JSON API)
│   │   ├── repositories/     # Lấy & lưu dữ liệu
│   │   └── datasources/      # Gọi API / đọc local storage
│   ├── presentation/
│   │   ├── screens/          # Màn hình chính (1 file = 1 màn hình)
│   │   ├── widgets/          # Widget tái sử dụng
│   │   └── blocs/            # Quản lý state (BLoC pattern)
│   └── main.dart
└── pubspec.yaml
```

### 4.4 Thứ tự import

Nhóm import theo thứ tự sau, mỗi nhóm cách nhau 1 dòng trắng:

**TypeScript:**
```typescript
// 1. Thư viện bên ngoài (node_modules)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

// 2. Module nội bộ (alias hoặc đường dẫn tuyệt đối)
import { User } from '@/modules/users/entities/user.entity';
import { CreateUserDto } from '@/modules/users/dto/create-user.dto';

// 3. File tương đối (cùng thư mục hoặc gần)
import { hashPassword } from './utils/hash';
```

**Dart:**
```dart
// 1. Thư viện Dart core
import 'dart:async';

// 2. Package bên ngoài
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// 3. Package nội bộ
import 'package:my_app/core/theme/app_colors.dart';
import 'package:my_app/data/models/user_model.dart';
```

---

## 5. Git Convention

### 5.1 Commit Message

Dùng chuẩn **Conventional Commits**: `<type>(<scope>): <mô tả ngắn>`

> **type** = loại thay đổi, **scope** = phạm vi ảnh hưởng (tùy chọn), **mô tả** = viết thường, không dấu chấm cuối.

| Type | Khi nào dùng | Ví dụ |
|------|-------------|-------|
| `feat` | Thêm tính năng mới | `feat(auth): thêm đăng nhập bằng Google` |
| `fix` | Sửa lỗi | `fix(orders): sửa lỗi tính tổng tiền sai` |
| `refactor` | Cải thiện code, không đổi chức năng | `refactor(users): tách logic vào service` |
| `docs` | Cập nhật tài liệu | `docs: cập nhật hướng dẫn cài đặt` |
| `style` | Format code (không đổi logic) | `style: chạy prettier toàn project` |
| `test` | Thêm/sửa test | `test(auth): thêm unit test cho login` |
| `chore` | Cấu hình, dependencies | `chore: cập nhật phiên bản nestjs lên 10` |
| `perf` | Cải thiện hiệu năng | `perf(query): thêm index cho bảng orders` |

**Ví dụ commit đầy đủ:**
```
feat(users): thêm API lấy danh sách user có phân trang

- Thêm query param page, limit
- Trả về metadata tổng số bản ghi
- Validate input bằng class-validator
```

### 5.2 Branch Naming

Format: `<type>/<mô-tả-ngắn-kebab-case>`

```
feat/user-authentication
fix/order-total-calculation
refactor/split-user-service
docs/update-readme
hotfix/payment-gateway-error
```

**Quy tắc:**
- Nhánh `main` — code production, chỉ merge qua PR đã được review.
- Nhánh `develop` — code đang phát triển, base để tạo nhánh mới.
- Tạo nhánh từ `develop`, merge về `develop` qua Pull Request.
- Không commit thẳng vào `main` hoặc `develop`.

### 5.3 Pull Request (PR)

**Tiêu đề PR:** Giống format commit message.

**Mô tả PR (template):**

```markdown
## Mô tả
<!-- Tính năng/lỗi này làm gì? -->

## Thay đổi chính
- [ ] ...
- [ ] ...

## Cách test
<!-- Hướng dẫn reviewer tự test -->
1. Gọi API `POST /users` với body {...}
2. Kiểm tra response trả về status 201

## Checklist
- [ ] Code đã được format (Prettier/dart format)
- [ ] Đã viết test cho logic mới
- [ ] Không có thông tin nhạy cảm trong code (password, API key)
- [ ] Đã tự review lại trước khi tạo PR
```

**Quy tắc review:**
- Mỗi PR cần ít nhất **1 người approve** trước khi merge.
- PR không nên vượt quá **400 dòng thay đổi** — nếu nhiều hơn, hãy tách nhỏ.
- Reviewer phải hoàn thành review trong **1 ngày làm việc**.

---

## 6. Tooling (Công cụ tự động)

### 6.1 NestJS & Next.js

| Công cụ | Mục đích | File cấu hình |
|---------|---------|--------------|
| **Prettier** | Tự động format code theo quy tắc | `.prettierrc` |
| **ESLint** | Phát hiện lỗi và code xấu | `.eslintrc.js` |
| **Husky** | Chạy kiểm tra tự động trước khi commit | `.husky/` |
| **lint-staged** | Chỉ kiểm tra file đã thay đổi | `lint-staged` trong `package.json` |

**Cấu hình Prettier (`.prettierrc`):**
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

**Cấu hình lint-staged (`package.json`):**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

> **lint-staged** là công cụ chỉ chạy linter/formatter trên những file bạn vừa thay đổi, giúp tiết kiệm thời gian hơn so với kiểm tra toàn bộ project.

### 6.2 Flutter

```bash
# Format toàn bộ code Dart
dart format .

# Phân tích lỗi và code xấu
flutter analyze

# Chạy trước khi commit (thêm vào pre-commit hook)
dart format . && flutter analyze
```

**Cấu hình `analysis_options.yaml`:**
```yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    - prefer_const_constructors
    - prefer_const_literals_to_create_immutables
    - avoid_print              # Dùng logger thay vì print()
    - prefer_single_quotes
```

### 6.3 Cài đặt Pre-commit Hook (NestJS/Next.js)

> **Pre-commit hook** là đoạn script tự động chạy mỗi khi bạn gõ `git commit`. Nếu có lỗi, commit sẽ bị chặn lại.

```bash
# Cài đặt một lần duy nhất sau khi clone project
npm install
npx husky install
```

---

## 7. Testing

### 7.1 Quy tắc chung

- Mỗi function/method có logic quan trọng phải có ít nhất **1 unit test**.
- Tên test phải mô tả rõ: **"nên [kết quả] khi [điều kiện]"**.
- Không test implementation (cách làm) — chỉ test behavior (kết quả).

### 7.2 NestJS — Unit Test

```typescript
//  Tên test rõ ràng theo format: "should [result] when [condition]"
describe('UsersService', () => {
  describe('getUserById', () => {
    it('should return user when valid id is provided', async () => {
      // Arrange — chuẩn bị dữ liệu
      const mockUser = { id: '123', email: 'test@example.com' };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      // Act — thực thi hàm cần test
      const result = await usersService.getUserById('123');

      // Assert — kiểm tra kết quả
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(usersService.getUserById('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

### 7.3 Flutter — Widget Test

```dart
testWidgets('should show loading indicator when isLoading is true', (tester) async {
  // Arrange
  await tester.pumpWidget(
    const MaterialApp(
      home: LoginScreen(isLoading: true),
    ),
  );

  // Assert
  expect(find.byType(CircularProgressIndicator), findsOneWidget);
});
```

### 7.4 Cấu trúc thư mục test

```
# NestJS
src/
└── modules/
    └── users/
        ├── users.service.ts
        └── users.service.spec.ts   # File test đặt cạnh file nguồn

# Flutter
test/
├── unit/
│   └── user_repository_test.dart
└── widget/
    └── login_screen_test.dart
```

---

## 8. Error Handling (Xử lý lỗi)

### 8.1 NestJS — Dùng Exception có sẵn của NestJS

> NestJS cung cấp sẵn các class lỗi HTTP. Dùng chúng thay vì tự trả về response lỗi.

```typescript
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

//  Đúng — dùng exception của NestJS
async getUserById(id: string): Promise<User> {
  const user = await this.userRepository.findOne({ where: { id } });

  if (!user) {
    throw new NotFoundException(`Không tìm thấy user với id: ${id}`);
  }

  return user;
}

// Sai — tự tạo object lỗi
async getUserById(id: string) {
  const user = await this.userRepository.findOne({ where: { id } });

  if (!user) {
    return { success: false, message: 'Not found' }; // Không nhất quán!
  }

  return user;
}
```

**Bảng HTTP Exception phổ biến:**

| Class | HTTP Status | Khi nào dùng |
|-------|------------|-------------|
| `BadRequestException` | 400 | Dữ liệu đầu vào không hợp lệ |
| `UnauthorizedException` | 401 | Chưa đăng nhập |
| `ForbiddenException` | 403 | Không có quyền |
| `NotFoundException` | 404 | Không tìm thấy tài nguyên |
| `ConflictException` | 409 | Dữ liệu bị trùng (email đã tồn tại) |

### 8.2 Flutter — Xử lý lỗi từ API

```dart
//  Đúng — dùng try/catch, hiển thị thông báo lỗi rõ ràng
Future<void> login(String email, String password) async {
  try {
    final user = await authRepository.login(email, password);
    emit(AuthSuccess(user));
  } on UnauthorizedException {
    emit(const AuthError('Email hoặc mật khẩu không đúng'));
  } on NetworkException {
    emit(const AuthError('Không có kết nối mạng, vui lòng thử lại'));
  } catch (e) {
    emit(const AuthError('Đã có lỗi xảy ra, vui lòng thử lại sau'));
  }
}

// Sai — bắt lỗi nhưng im lặng hoặc chỉ print
Future<void> login(String email, String password) async {
  try {
    await authRepository.login(email, password);
  } catch (e) {
    print(e); // Người dùng không biết có lỗi!
  }
}
```

### 8.3 Quy tắc chung

- **Không bao giờ** để lỗi im lặng (`catch` rồi không làm gì).
- Thông báo lỗi hiển thị cho user phải **bằng tiếng Việt, dễ hiểu**.
- Log lỗi kỹ thuật để debug, nhưng không hiển thị chi tiết lỗi cho người dùng cuối.
- Không để lộ thông tin hệ thống trong message lỗi (tên bảng DB, stack trace).

---

## 9. Security (Bảo mật)

### 9.1 Tuyệt đối không làm

```typescript
// KHÔNG hardcode thông tin nhạy cảm trong code
const JWT_SECRET = 'my-super-secret-key';
const DB_PASSWORD = 'password123';

//  Luôn lấy từ biến môi trường (.env)
const JWT_SECRET = process.env.JWT_SECRET;
```

```typescript
// KHÔNG log thông tin nhạy cảm
console.log('User logged in:', { email, password });

//  Chỉ log thông tin cần thiết
this.logger.log(`User logged in: ${user.id}`);
```

### 9.2 Biến môi trường

- File `.env` **không được commit** lên Git (đã có trong `.gitignore`).
- Luôn có file `.env.example` với các key nhưng **không có giá trị thật**.
- Dùng `@nestjs/config` để validate biến môi trường khi khởi động.

```bash
# .env.example — commit file này lên Git
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d
```

### 9.3 Validate dữ liệu đầu vào

> Luôn kiểm tra dữ liệu người dùng gửi lên trước khi xử lý — không tin tưởng bất kỳ input nào.

```typescript
//  Dùng class-validator trong DTO để validate tự động
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Tên không được để trống' })
  fullName: string;
}
```

### 9.4 Các quy tắc bảo mật khác

| Quy tắc | Chi tiết |
|---------|---------|
| **Hash mật khẩu** | Dùng `bcrypt` với salt rounds ≥ 12, không bao giờ lưu mật khẩu dạng plain text |
| **JWT** | Access token hết hạn sau 15 phút, dùng Refresh token cho session dài |
| **SQL Injection** | Luôn dùng TypeORM query builder hoặc parameterized query, không nối chuỗi SQL |
| **CORS** | Cấu hình whitelist domain cụ thể, không dùng `origin: '*'` trên production |
| **Rate Limiting** | Áp dụng giới hạn request cho các API đăng nhập, đăng ký |
| **File upload** | Kiểm tra MIME type, giới hạn kích thước, không lưu file trực tiếp theo tên gốc |

---

*Tài liệu này được cập nhật lần cuối: tháng 6 năm 2025.*
*Mọi thắc mắc hoặc đề xuất thay đổi, vui lòng tạo issue hoặc PR trên repository.*