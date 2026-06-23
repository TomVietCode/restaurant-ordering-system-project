# Backend Implementation Instructions: Ordering & Payments Module

This document provides detailed design specifications and step-by-step instructions for implementing the backend ordering and payments functionality for the F&B ordering system. 

It is designed to address **US-03 (Customer Ordering)** and **US-04 (Web Admin Order Board)**, incorporating all agreed-upon business rules, database schema modifications, and realtime communication patterns.

---

## 1. Objectives & Scope
- **Anonymous Customer Ordering**: Allow customers to scan a table QR code, browse items, and submit orders without logging in.
- **Secure Status Tracking**: Allow customers to track their order status in realtime without exposing internal sequential order IDs.
- **Admin Order Board**: Provide staff and owners with a realtime interface to view, update status, and cancel orders.
- **Manual Payments**: Implement individual order payment updates and bulk table checkouts.
- **Table Occupancy Synchronization**: Automatically update table availability based on active orders and payment status.

---

## 2. Database Schema Updates
Make the following schema changes using TypeORM migrations. Reference [database.md](file:///home/cuongnm/Workspace/sources/ioc/restaurant-ordering-system-project/docs/database.md) for current schemas.

### 2.1 The `orders` Table
Modify the `orders` table to add support for secure tracking and optional cancellation reasons:
- `tracking_code` (`VARCHAR(36)` or `UUID`, `NOT NULL`, `UNIQUE`): A secure, randomly generated UUID to expose to the customer app for order tracking.
- `cancel_reason` (`VARCHAR(255)`, `NULL`): Optional reason provided when staff cancels an order.
- Map the status enum to: `NEW`, `PREPARING`, `SERVED`, `PAID`, `CANCEL`.
- Map the payment method enum to: `CASH`, `TRANSFER`.

### 2.2 The `order_items` Table
Ensure the junction table `order_items` implements a composite primary key `(order_id, item_id)`.
- `order_id` (`INT`, `FK` references `orders(id)`, `ON DELETE CASCADE`).
- `item_id` (`INT`, `FK` references `items(id)`, `ON DELETE RESTRICT`).
- `quantity` (`INT`, `NOT NULL`, check constraint `quantity > 0`).
- `price_at_order` (`DECIMAL(10,2)`, `NOT NULL`): Capture the price snapshot.
- `note` (`VARCHAR(255)`, `NULL`).

### 2.3 Recommended Indexes
Create database indexes for optimized querying:
```sql
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_tracking_code ON orders(tracking_code);
```

---

## 3. API Design

### 3.1 Public Customer Endpoints (No JWT Authentication)
- **Place Order**
  - **Method**: `POST`
  - **Path**: `/api/v1/orders`
  - **Payload**:
    ```json
    {
      "tableId": "UUID-of-table",
      "items": [
        {
          "itemId": 1,
          "quantity": 2,
          "note": "Less ice, more sugar"
        }
      ]
    }
    ```
  - **Behavior**:
    - Validates that the table exists and is active.
    - Validates that each item exists, is not soft-deleted, and is in stock (`isRemain = true`).
    - Snapshots each item's price at that moment (`price_at_order = item.price`).
    - Calculates the total amount.
    - Generates a UUID `trackingCode`.
    - Creates the order in the `NEW` state.
    - Sets `table.isAvailable = false` (occupied) if this is the first active order for that table.
    - Emits `order:new` to staff/owners via `IRealtimeService`.
    - Returns the created order envelope (including `id` and `trackingCode`).

- **Track Order Status**
  - **Method**: `GET`
  - **Path**: `/api/v1/orders/track/:trackingCode`
  - **Behavior**:
    - Fetches the order details (status, items, total amount) using the secure `trackingCode`.
    - Return `404 Not Found` if the code is invalid.

---

### 3.2 Protected Admin/Staff Endpoints (Requires JWT & Roles `STAFF` or `OWNER`)
- **Get Order Board (List Orders)**
  - **Method**: `GET`
  - **Path**: `/api/v1/orders`
  - **Query Params**: `page`, `limit`, `status` (optional filter), `tableId` (optional filter)
  - **Response**: Paginated list of orders following the API response envelope in [GEMINI.md](file:///home/cuongnm/Workspace/sources/ioc/restaurant-ordering-system-project/GEMINI.md).

- **Get Order Detail**
  - **Method**: `GET`
  - **Path**: `/api/v1/orders/:id`
  - **Behavior**: Fetch detailed order info by integer `id`.

- **Update Order Status**
  - **Method**: `PATCH`
  - **Path**: `/api/v1/orders/:id/status`
  - **Payload**:
    ```json
    {
      "status": "PREPARING" | "SERVED" | "PAID" | "CANCEL",
      "cancelReason": "Optional cancellation reason string",
      "paymentMethod": "CASH" | "TRANSFER"
    }
    ```
  - **Behavior**:
    - Implements the strict one-way state transitions (see State Machine section).
    - If status updated to `CANCEL`:
      - Requires the order not be `PAID`.
      - Optionally saves `cancelReason`.
    - If status updated to `PAID`:
      - Saves `paymentMethod` and sets `paidAt = CURRENT_TIMESTAMP`.
      - Verifies if there are any other active/unpaid orders (`NEW`, `PREPARING`, `SERVED`) left for the table. If none, sets `table.isAvailable = true` (free).
    - Emits `order:status-changed` to the specific order's room and staff board.

- **Bulk Checkout Table**
  - **Method**: `POST`
  - **Path**: `/api/v1/payments/checkout-table/:tableId`
  - **Payload**:
    ```json
    {
      "paymentMethod": "CASH" | "TRANSFER"
    }
    ```
  - **Behavior**:
    - Marks all active unpaid orders (`status` IN `['NEW', 'PREPARING', 'SERVED']`) for the specified table as `PAID`.
    - Sets `paymentMethod` and `paidAt = CURRENT_TIMESTAMP` for all affected orders.
    - Sets `table.isAvailable = true` (free) in a single transaction.
    - Emits `order:status-changed` for each updated order.

---

## 4. Business Logic & Validation Rules

### 4.1 Order State Machine Transitions
Validate the following transition rules in the service layer before executing updates:
- **`NEW`** ──► can go to **`PREPARING`** or **`CANCEL`**.
- **`PREPARING`** ──► can go to **`SERVED`** or **`CANCEL`**.
- **`SERVED`** ──► can go to **`PAID`** or **`CANCEL`**.
- **`PAID`** ──► Terminal state (No transitions allowed).
- **`CANCEL`** ──► Terminal state (No transitions allowed).

### 4.2 Out-of-Stock Validation (Concurrency Check)
When creating an order, do not trust client-side availability flags. Fetch all items by their IDs from the database:
- If any item has `isRemain = false` or `isDeleted = true`, abort the entire transaction.
- Throw a `BadRequestException` specifying the exact item that is unavailable (e.g. `Item "Black Coffee" is out of stock. Please remove it from your cart.`).
- Preserve the rest of the cart items intact on the client side.

### 4.3 Table Availability Rules
- A table becomes occupied (`table.isAvailable = false`) as soon as a customer places their first order for that table.
- A table becomes free (`table.isAvailable = true`) only when **all** orders associated with the table session have been marked as `PAID`.
- This check must run both when an individual order is updated to `PAID`, and during bulk table checkouts.

---

## 5. Realtime Socket.IO Notifications
Inject `IRealtimeService` (via `REALTIME_SERVICE_TOKEN`) into the orders service.

### 5.1 Connection & Rooms
- Standardize a room joining convention on the Socket.IO gateway:
  - When the customer app connects, it joins a room specific to the order tracking code: `order:track:${trackingCode}`.
  - Staff clients join a global admin room or namespace.

### 5.2 Emitted Events
- **`order:new`**: Broadcasted to all connected staff when a new order is successfully placed.
  - Payload: `{ orderId: number, tableId: string, totalAmount: number, status: 'NEW' }`.
- **`order:status-changed`**: Emitted when an order's status is updated.
  - Broadcasted to the order-specific room: `order:track:${trackingCode}`.
  - Broadcasted to the staff namespace to update the dashboard.
  - Payload: `{ trackingCode: string, orderId: number, status: OrderStatus }`.

---

## 6. Implementation Architecture

Create a new self-contained NestJS feature module: `OrdersModule`.

### 6.1 Directory Structure
Follow the established NestJS structure under `src/modules/orders`:
```
src/modules/orders/
├── orders.module.ts
├── orders.controller.ts
├── orders.service.ts
├── entities/
│   ├── order.entity.ts
│   └── order-item.entity.ts
├── repositories/
│   ├── order.repository.interface.ts
│   ├── order.repository.ts
│   └── dtos/
│       ├── create-order.dto.ts
│       └── update-order-status.dto.ts
└── orders.service.spec.ts
```

### 6.2 Resolving Circular Dependency
The `TableService` depends on checking active orders, and `OrdersService` depends on validating table status.
To prevent circular NestJS module dependencies:
- Register `OrderRepository` in the TypeORM feature imports of the `OrdersModule`.
- Expose an `OrderCheckService` in the `OrdersModule` that implements `IOrderCheckService` (defined in `@common/interfaces/order-check.interface.ts`).
- Inside `TableModule` imports, inject `OrdersModule` using `forwardRef(() => OrdersModule)`.
- Inside `OrdersModule` imports, inject `TableModule` using `forwardRef(() => TableModule)`.
- In `TableModule`, replace the `OrderCheckStub` provider:
  ```typescript
  {
    provide: ORDER_CHECK_SERVICE_TOKEN,
    useExisting: OrderCheckService,
  }
  ```

---

## 7. Testing Requirements
Ensure a minimum of **80% code coverage** for all new service and controller code.

### 7.1 Unit Tests
Implement unit tests in `orders.service.spec.ts` for the following scenarios:
- Placing an order successfully.
- Failing order placement due to out-of-stock items (verifying correct error message and transaction rollback).
- Table availability switching automatically (from free to occupied, and from occupied to free).
- Enforcing valid order state transitions (e.g. failing to transition from `SERVED` to `NEW`, or modifying `PAID` orders).
- Generating unique tracking codes on order creation.

### 7.2 Integration Tests
Write end-to-end integration tests using Supertest to verify:
- Placing an order via public POST endpoint and checking DB values.
- Fetching order status via tracking code without authentication.
- Updating status/checkout endpoints with correct roles, and blocking unauthorized users (401/403).
