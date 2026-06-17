# Database Architecture — F&B Ordering & Management System

> **Scope:** Single-store food & beverage outlet.  
> **Engine:** PostgreSQL.  
> **Character set:** `utf8mb4` — supports emoji and full Unicode.

---

## Quick Reference

| Table | Purpose |
|---|---|
| `TABLE` | Physical tables in the restaurant |
| `CATEGORY` | Menu categories (e.g. Drinks, Mains) |
| `ITEM` | Menu items belonging to a category |
| `ORDER` | A customer order linked to a table |
| `ORDERITEM` | Line items inside an order (which item, how many) |
| `USER` | Staff accounts (OWNER or STAFF) |
| `USERTOKEN` | Refresh tokens for authentication sessions |

---

## Entity Relationship Overview

```
TABLE ──< ORDER >── ORDERITEM ── ITEM
                                   │
                               CATEGORY
USER ──< USERTOKEN
USER ──< ORDER 
```

**Notation:**
- `──<` = one-to-many (one TABLE has many ORDERs)
- `>──` = many-to-one
- `>──<` = many-to-many resolved through a junction table (ORDERITEM)

---

## Table Definitions

### TABLE
Represents a physical dining table in the restaurant.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `CHAR(36)` | `PK` | UUID v4 — used by frontend to generate QR code dynamically. **QR is never stored in the database.** |
| `name` | `VARCHAR(100)` | `NOT NULL, UNIQUE` | Human-readable table name shown to staff (e.g. "Bàn 01", "Bàn VIP 01"). Must be unique across the store. |
| `capacity` | `INT` | `NULLABLE` | Seating capacity of the table (e.g. 2, 4, 8). |
| `is_available` | `BOOLEAN` | `NOT NULL, DEFAULT TRUE` | `TRUE` = table is free; `FALSE` = table is occupied or reserved. |

**Design notes:**
- `table_id` is a UUID (`CHAR(36)`, format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`). The frontend reads this ID and draws the QR code client-side — no QR image or URL is persisted.
- `name` is the staff-facing label. It is separate from `table_id` so the UUID can be rotated (security reset) without renaming tables.
- There is no `qr_code` column. QR generation is entirely a frontend concern.

```sql
CREATE TABLE `table` (
    id     CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
    name   VARCHAR(100) NOT NULL UNIQUE,
    capacity     INT,
    is_available BOOLEAN     NOT NULL DEFAULT TRUE
);
```

---

### CATEGORY
Groups menu items into logical sections.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `INT` | `PK, AUTO_INCREMENT` | Surrogate primary key. |
| `name` | `VARCHAR(100)` | `NOT NULL` | Display name (e.g. "Beverages", "Desserts"). |
| `description` | `VARCHAR(255)` | `NULLABLE` | Optional short description shown in the menu. |

```sql
CREATE TABLE category (
    id  INT          PRIMARY KEY AUTO_INCREMENT,
    name         VARCHAR(100) NOT NULL,
    description  VARCHAR(255)
);
```

---

### ITEM
A menu item that can be ordered by customers.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `INT` | `PK, AUTO_INCREMENT` | Surrogate primary key. |
| `name` | `VARCHAR(150)` | `NOT NULL` | Display name of the dish/drink. |
| `price` | `DECIMAL(10,2)` | `NOT NULL` | Current selling price. **Note:** actual price charged on an order is stored in `ORDERITEM.price_at_order`, not here. |
| `images_url` | `JSON` | `NULLABLE` | Array of image URLs, e.g. `["https://cdn.example.com/img1.jpg"]`. Validated at the application layer. |
| `description` | `VARCHAR(500)` | `NULLABLE` | Ingredients, allergens, or short description. |
| `is_remain` | `BOOLEAN` | `NOT NULL, DEFAULT TRUE` | `TRUE` = in stock; `FALSE` = temporarily out of stock (still shown, just disabled). |
| `is_deleted` | `BOOLEAN` | `NOT NULL, DEFAULT FALSE` | Soft delete flag. `TRUE` = removed from menu but kept for historical order data. **Never hard-delete an item that appears in past orders.** |
| `category_id` | `INT` | `FK → CATEGORY` | The category this item belongs to. |

```sql
CREATE TABLE item (
    id     INT            PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(150)   NOT NULL,
    price       DECIMAL(10,2)  NOT NULL,
    images_url  JSON,
    description VARCHAR(500),
    is_remain   BOOLEAN        NOT NULL DEFAULT TRUE,
    is_deleted  BOOLEAN        NOT NULL DEFAULT FALSE,
    category_id INT            NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);
```

---

### ORDER
A customer's order session tied to a table.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `INT` | `PK, AUTO_INCREMENT` | Surrogate primary key. |
| `table_id` | `CHAR(36)` | `FK → TABLE` | Which table placed this order. |
| `status` | `ENUM` | `NOT NULL` | Current lifecycle state (see below). |
| `total_amount` | `DECIMAL(10,2)` | `NOT NULL, DEFAULT 0` | Sum of all `ORDERITEM.price_at_order × quantity`. Recalculated on each item add/remove. |
| `payment_method` | `ENUM` | `NULLABLE` | Filled when order is paid (see below). |
| `created_at` | `DATETIME` | `NOT NULL, DEFAULT NOW()` | When the order was first created. |
| `updated_at` | `DATETIME` | `NOT NULL, DEFAULT NOW() ON UPDATE NOW()` | Automatically updated whenever any field changes — used to track processing time. |
| `paid_at` | `DATETIME` | `NULLABLE` | Timestamp when payment was confirmed. `NULL` until status reaches `PAID`. |

**`status` enum values:**

| Value | Meaning |
|---|---|
| `NEW` | Order created, not yet sent to kitchen. |
| `PREPARING` | Kitchen acknowledged and is preparing. |
| `SERVED` | Food delivered to the table. |
| `PAID` | Payment confirmed. Terminal state. |
| `CANCEL` | Order cancelled before payment. Terminal state. |

**`payment_method` enum values:**

| Value | Meaning |
|---|---|
| `CASH` | Paid with cash at the counter. |
| `TRANSFER` | Paid via bank transfer / QR payment. |

```sql
CREATE TABLE `order` (
    id       INT            PRIMARY KEY AUTO_INCREMENT,
    table_id       CHAR(36)       NOT NULL,
    status         ENUM('NEW','PREPARING','SERVED','PAID','CANCEL') NOT NULL DEFAULT 'NEW',
    total_amount   DECIMAL(10,2)  NOT NULL DEFAULT 0,
    payment_method ENUM('CASH','TRANSFER'),
    created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at        DATETIME,
    FOREIGN KEY (table_id)   REFERENCES `table`(table_id),
    FOREIGN KEY (created_by) REFERENCES user(user_id)
);
```

---

### ORDERITEM
Junction table linking an order to one or more menu items.  
One row = one item line inside one order.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `order_id` | `INT` | `FK → ORDER` | The parent order. |
| `item_id` | `INT` | `FK → ITEM` | The menu item ordered. |
| `quantity` | `INT` | `NOT NULL, CHECK > 0` | How many units of this item. |
| `price_at_order` | `DECIMAL(10,2)` | `NOT NULL` | Price **copied from `ITEM.price` at the moment of ordering.** Immune to future price changes on the item. |
| `note` | `VARCHAR(255)` | `NULLABLE` | Per-line customer note, e.g. "less sugar", "no onion". |

**Composite primary key:** `(order_id, item_id)` — an item can appear only once per order (increase `quantity` instead of adding duplicate rows).

```sql
CREATE TABLE orderitem (
    order_id       INT            NOT NULL,
    item_id        INT            NOT NULL,
    quantity       INT            NOT NULL CHECK (quantity > 0),
    price_at_order DECIMAL(10,2)  NOT NULL,
    note           VARCHAR(255),
    PRIMARY KEY (order_id, item_id),
    FOREIGN KEY (order_id) REFERENCES `order`(order_id),
    FOREIGN KEY (item_id)  REFERENCES item(item_id)
);
```

---

### USER
Staff accounts for the management system.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `INT` | `PK, AUTO_INCREMENT` | Surrogate primary key. |
| `email` | `VARCHAR(100)` | `NOT NULL, UNIQUE` | Login email. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Bcrypt hash of the password. **Never store plain text.** |
| `role` | `ENUM` | `NOT NULL` | Permission level (see below). |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Display name shown in the UI and reports. |
| `phone` | `VARCHAR(20)` | `NULLABLE` | Optional contact number. |
| `is_active` | `BOOLEAN` | `NOT NULL, DEFAULT TRUE` | `FALSE` = account suspended. Deactivated users cannot log in but their historical data is preserved. |

**`role` enum values:**

| Value | Permissions |
|---|---|
| `OWNER` | Full access — menu management, reports, user management. |
| `STAFF` | Operational access — take orders, update status, process payments. |

```sql
CREATE TABLE user (
    id       INT            PRIMARY KEY AUTO_INCREMENT,
    email      VARCHAR(100)    NOT NULL UNIQUE,
    password_hash VARCHAR(255)   NOT NULL,
    role          ENUM('OWNER','STAFF') NOT NULL,
    full_name     VARCHAR(100)   NOT NULL,
    phone         VARCHAR(20),
    is_active     BOOLEAN        NOT NULL DEFAULT TRUE
);
```

---

### REFRESHTOKEN
Stores refresh tokens for authenticated sessions.  
One user can have at most **one** active token record at a time (`1-to-1`).

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | `VARCHAR(36)` | `PK` | UUID of this token record. |
| `user_id` | `INT` | `FK → USER, UNIQUE` | The owner of this token. UNIQUE enforces the 1-to-1 relationship. |
| `token_hash` | `VARCHAR(512)` | `NOT NULL` | The opaque refresh token string sent to the client. |
| `expired_at` | `DATETIME` | `NOT NULL` | When this refresh token expires and becomes invalid. |
| `revoked_at` | `DATETIME` | `NULLABLE` | Set when the user explicitly logs out. `NULL` = still valid (subject to `expired_at`). |

**Token lifecycle:**
1. User logs in → new row inserted (or existing row replaced).
2. Access token (short-lived JWT) expires → client sends refresh token → backend validates `expired_at` and `revoked_at`.
3. User logs out → `revoked_at` is set to `NOW()`.

```sql
CREATE TABLE refreshtoken (
    id      VARCHAR(36)  PRIMARY KEY,
    user_id       INT          NOT NULL UNIQUE,
    token_hash VARCHAR(512) NOT NULL,
    expired_at    DATETIME     NOT NULL,
    revoked_at    DATETIME,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);
```

---

## Key Design Decisions

### 1. UUID for `table_id`, not AUTO_INCREMENT integer
`table_id` is a `CHAR(36)` UUID. The frontend uses this UUID directly as input to generate a QR code (e.g. encode `https://order.example.com/table/{table_id}` into a QR image). This means:
- No QR image or URL is stored server-side.
- If a table's QR needs to be invalidated (e.g. a printed QR is stolen), the backend generates a new UUID for that table without renaming.
- `name` stays stable as the human-facing label.

### 2. `price_at_order` snapshot in ORDERITEM
`ITEM.price` can change over time. `ORDERITEM.price_at_order` captures the price at the moment the item was added to the order. This ensures historical orders always reflect what the customer was actually charged.

### 3. Soft delete on ITEM (`is_deleted`)
Hard-deleting an item breaks foreign key references in past `ORDERITEM` rows. Setting `is_deleted = TRUE` hides the item from the menu while preserving all historical order data.

### 4. `created_by` on ORDER
Every order records which staff member created it. This supports:
- Accountability and audit trails.
- Per-staff performance reports (orders taken, revenue).

### 5. `updated_at` on ORDER (auto-updated)
MySQL's `ON UPDATE CURRENT_TIMESTAMP` automatically refreshes this column on every write. Enables calculating time spent in each status (e.g. how long from `NEW` to `SERVED`).

---

## Indexes (Recommended)

```sql
-- Fast lookup: all orders for a table
CREATE INDEX idx_order_table    ON `order`(table_id);

-- Fast lookup: all orders by a staff member
CREATE INDEX idx_order_user     ON `order`(created_by);

-- Fast lookup: orders by status (e.g. all PREPARING orders for kitchen display)
CREATE INDEX idx_order_status   ON `order`(status);

-- Fast lookup: all items in a category
CREATE INDEX idx_item_category  ON item(category_id);
```

---

## Constraints Summary

| Rule | Enforced by |
|---|---|
| Each table name is unique | `UNIQUE` on `TABLE.name` |
| One token per user | `UNIQUE` on `USERTOKEN.user_id` |
| Order item quantity must be positive | `CHECK (quantity > 0)` on `ORDERITEM.quantity` |
| Price never negative | Application layer + optional `CHECK (price >= 0)` |
| Item soft-deleted before removal | Application layer enforces `is_deleted` before any `DELETE` |