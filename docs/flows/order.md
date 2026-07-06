# Order Module — Workflow Diagrams

## 1. Order State Machine

```mermaid
stateDiagram-v2
    [*] --> NEW : Customer đặt đơn

    NEW --> PREPARING : Staff xác nhận
    NEW --> CANCEL : Staff huỷ

    PREPARING --> SERVED : Món đã lên bàn
    PREPARING --> CANCEL : Staff huỷ

    SERVED --> PAID : Staff xác nhận thanh toán
    SERVED --> CANCEL : Staff huỷ

    PAID --> [*] : Terminal
    CANCEL --> [*] : Terminal

    note right of PAID : Không thể chỉnh sửa\nhoặc huỷ sau khi PAID
    note right of CANCEL : Không thể chuyển\nsang trạng thái khác
```

---

## 2. Place Order — Customer Flow

```mermaid
sequenceDiagram
    actor Customer
    participant Controller as OrdersController
    participant Service as OrdersService
    participant TableSvc as TableService
    participant ItemsSvc as ItemsService
    participant DB as Database
    participant WS as RealtimeService

    Customer->>Controller: POST /api/orders<br/>{ tableId, items[] }
    Controller->>Service: createOrder(dto)

    Service->>TableSvc: findById(tableId)
    TableSvc-->>Service: Table entity

    loop Với mỗi item trong đơn
        Service->>ItemsSvc: findById(itemId)
        ItemsSvc-->>Service: Item entity

        alt Item bị xoá mềm (deletedAt != null)
            Service-->>Controller: 400 — Item đã bị xoá
        else Item hết hàng (isRemain = false)
            Service-->>Controller: 400 — Item hết hàng
        else Item hợp lệ
            Note over Service: Snapshot giá (priceAtOrder = item.price)
        end
    end

    Note over Service: Tính totalAmount = Σ(price × quantity)
    Note over Service: Tạo trackingCode = UUID ngẫu nhiên

    Service->>DB: Transaction: Save Order + OrderItems
    alt Bàn đang trống (isAvailable = true)
        Service->>DB: table.isAvailable = false
    end
    DB-->>Service: Saved Order

    Service->>WS: emit("order:new", payload)
    WS-->>Customer: Broadcast tới staff

    Service-->>Controller: Order entity
    Controller-->>Customer: 201 { success: true, data: order }
```

---

## 3. Track Order — Customer Flow

```mermaid
sequenceDiagram
    actor Customer
    participant Controller as OrdersController
    participant Service as OrdersService
    participant Repo as OrderRepository

    Customer->>Controller: GET /api/orders/track/:trackingCode
    Controller->>Service: trackOrder(trackingCode)
    Service->>Repo: findByTrackingCode(trackingCode)

    alt Tìm thấy
        Repo-->>Service: Order + OrderItems + Item details
        Service-->>Controller: Order entity
        Controller-->>Customer: 200 { success: true, data: order }
    else Không tìm thấy
        Repo-->>Service: null
        Service-->>Controller: 404 — Order not found
        Controller-->>Customer: 404 { success: false }
    end
```

---

## 4. Update Order Status — Staff Flow

```mermaid
sequenceDiagram
    actor Staff
    participant Controller as OrdersController
    participant Service as OrdersService
    participant Repo as OrderRepository
    participant DB as Database
    participant WS as RealtimeService

    Staff->>Controller: PATCH /api/orders/:id/status<br/>{ status, paymentMethod?, cancelReason? }
    Note over Controller: JWT Guard + RolesGuard (STAFF/OWNER)

    Controller->>Service: updateStatus(id, dto)
    Service->>Repo: findById(id)
    Repo-->>Service: Order entity

    Note over Service: Kiểm tra State Machine:<br/>allowedTransitions[currentStatus].includes(newStatus)

    alt Transition không hợp lệ
        Service-->>Controller: 400 — Cannot transition
    else Transition → PAID
        alt Thiếu paymentMethod
            Service-->>Controller: 400 — Payment method required
        else Có paymentMethod
            Note over Service: order.paymentMethod = dto.paymentMethod<br/>order.paidAt = now
        end
    else Transition → CANCEL
        Note over Service: order.cancelReason = dto.cancelReason
    end

    Service->>DB: Transaction: Save Order
    
    alt Status = PAID hoặc CANCEL
        Service->>Repo: countActiveOrdersByTableId(tableId)
        alt Không còn đơn active nào
            Service->>DB: table.isAvailable = true
            Note over DB: Bàn được giải phóng
        end
    end

    Service->>WS: emitToRoom("order:track:{code}", payload)
    Service->>WS: emit("order:status-changed", payload)

    Service-->>Controller: Updated Order
    Controller-->>Staff: 200 { success: true, data: order }
```

---

## 5. Bulk Checkout Table — Staff Flow

```mermaid
sequenceDiagram
    actor Staff
    participant Controller as PaymentsController
    participant Service as OrdersService
    participant TableSvc as TableService
    participant Repo as OrderRepository
    participant DB as Database
    participant WS as RealtimeService

    Staff->>Controller: POST /api/payments/checkout-table/:tableId<br/>{ paymentMethod }
    Note over Controller: JWT + RolesGuard (STAFF/OWNER)

    Controller->>Service: checkoutTable(tableId, dto)
    Service->>TableSvc: findById(tableId)
    TableSvc-->>Service: Table entity

    Service->>Repo: findActiveOrdersByTableId(tableId)
    Repo-->>Service: Active orders list

    alt Không có đơn active
        Service-->>Controller: 400 — No active orders
    end

    Service->>DB: Transaction bắt đầu

    loop Với mỗi đơn active
        Note over Service: order.status = PAID<br/>order.paymentMethod = dto.paymentMethod<br/>order.paidAt = now
    end

    Service->>DB: Save all orders
    Service->>DB: table.isAvailable = true
    Service->>DB: Transaction commit

    loop Với mỗi đơn đã thanh toán
        Service->>WS: emitToRoom("order:track:{code}", payload)
        Service->>WS: emit("order:status-changed", payload)
    end

    Service-->>Controller: Paid orders[]
    Controller-->>Staff: 200 { success: true, data: orders }
```

---

## 6. Table Availability Sync Logic

```mermaid
flowchart TD
    A["Sự kiện xảy ra"] --> B{Loại sự kiện?}
    
    B -->|Đặt đơn mới| C{Bàn đang trống?<br/>isAvailable = true}
    C -->|Có| D["Set isAvailable = false<br/>(Bàn bận)"]
    C -->|Không| E["Giữ nguyên<br/>(Bàn đã bận)"]
    
    B -->|Đơn → PAID hoặc CANCEL| F["Đếm đơn active còn lại<br/>countActiveOrdersByTableId"]
    F --> G{Còn đơn active?}
    G -->|Còn ≥ 1| H["Giữ nguyên<br/>(Bàn vẫn bận)"]
    G -->|Còn 0| I["Set isAvailable = true<br/>(Bàn trống)"]
    
    B -->|Bulk Checkout| J["Tất cả đơn → PAID"]
    J --> K["Set isAvailable = true<br/>(Bàn trống)"]

    style D fill:#ff6b6b,color:#fff
    style I fill:#51cf66,color:#fff
    style K fill:#51cf66,color:#fff
```

---

## 7. WebSocket Realtime Event Flow

```mermaid
sequenceDiagram
    participant CustomerApp as Customer App
    participant Gateway as RealtimeGateway
    participant Service as RealtimeService
    participant StaffDashboard as Staff Dashboard

    Note over CustomerApp,StaffDashboard: === Kết nối & Đăng ký room ===
    
    CustomerApp->>Gateway: connect()
    Gateway-->>CustomerApp: connected (client.id)
    
    CustomerApp->>Gateway: emit("join-order-tracking",<br/>{ trackingCode })
    Gateway->>Gateway: client.join("order:track:{code}")
    
    StaffDashboard->>Gateway: connect()
    Gateway-->>StaffDashboard: connected (client.id)

    Note over CustomerApp,StaffDashboard: === Đơn mới được đặt ===
    
    Service->>Gateway: emit("order:new", payload)
    Gateway-->>StaffDashboard: "order:new" broadcast

    Note over CustomerApp,StaffDashboard: === Trạng thái đơn thay đổi ===
    
    Service->>Gateway: emitToRoom("order:track:{code}",<br/>"order:status-changed", payload)
    Gateway-->>CustomerApp: "order:status-changed"<br/>(chỉ client trong room)
    
    Service->>Gateway: emit("order:status-changed", payload)
    Gateway-->>StaffDashboard: "order:status-changed"<br/>(broadcast tất cả)
```
