
---

# US-01b: Menu Item Management

## 1. Overview & Context

### Problem Statement

The restaurant needs to manage a digital menu: adding, editing, deleting items, and controlling availability status (In Stock/Out of Stock). This data serves as the single source of truth for the customer-facing Mobile App.

### Current Pain Points

* **Manual Order Recording:** Prone to errors when customers order items that are out of stock without the staff's knowledge.
* **Lack of Quick Controls:** No tool to quickly toggle "In Stock/Out of Stock" status during peak hours.
* **Price Synchronization Issues:** Difficult to synchronize prices, leading to disputes if updates are applied incorrectly.

### Business Value

* Updates from the Menu Admin reflect immediately on the customer app, reducing the risk of accidental out-of-stock orders.
* Owners gain flexible control over pricing and categories.
* *(Out of Scope: Raw material inventory management and recipes are excluded from this phase.)*

### Target Actors

* **Primary Actor:** Owner (Full CRUD + status toggling privileges)
* **Secondary Actor:** Staff (No Permission)

> **User Story Statement:**
> As an Owner, I want to centrally manage the menu item list (create, read, update, delete, and change status) so that the menu displayed to customers via QR codes is always accurate and synchronized.

---

## 2. User Flows

### 2.1. View Menu Item List

1. Owner navigates to **"Menu Management"** $\rightarrow$ **"Items"** tab.
2. The list displays: Image, Name, Category, Price, and Status.
3. Features include search by name (with a 300ms debounce), filtering by category, and pagination.
4. Each row includes an **"Edit"** button, a **"Delete"** button, and an **"In Stock/Out of Stock"** toggle.

### 2.2. Add New Item

1. Owner clicks the **"+ Add New Item"** button.
2. The form fields include: Images *(Optional)*, Name *(Required)*, Category *(Required)*, Price *(Required, $\ge 0$)*, Description *(Optional)*, and Status *(Default: In Stock)*.
3. Owner clicks **"Save"** $\rightarrow$ System Validates $\rightarrow$ System Creates $\rightarrow$ Displays a toast notification: *"Item added successfully"*.

### 2.3. Update Item Information

1. Owner clicks **"Edit"** $\rightarrow$ The form opens pre-filled with existing data.
2. Owner updates the information and clicks **"Save"**.
3. **Critical Business Logic:** If the price is updated, existing orders are unaffected (the price must be snapshot within `OrderItem`). Only new orders will apply the updated price.

### 2.4. Quick Status Toggle

1. Owner toggles the **"In Stock/Out of Stock"** switch directly from the list view.
2. When switched to **"Out of Stock"**: The **"Add to Cart"** button on the Mobile App is disabled within 3–5 seconds via WebSockets—without requiring the customer to refresh the page.

### 2.5. Delete Item

1. Owner clicks **"Delete"** $\rightarrow$ A confirmation dialog appears.

### 2.6. Staff Access

1. If Staff attempts to access the `/menu` URL directly $\rightarrow$ System returns a **403 Forbidden** error.

---

## 3. Acceptance Criteria

### AC-01: Display Menu Item List

* **Given:** The Owner is logged into the system.
* **When:** Navigating to **"Menu Management"** $\rightarrow$ **"Items"** tab.
* **Then:** The system displays the complete list including: First Image, Name, Category, Price, and Status, along with a search bar, category filters, pagination, and the **"+ Add New Item"** button.

### AC-02: Successfully Add New Item

* **Given:** The Owner is on the **"Add New Item"** form.
* **When:** Entering all required valid data (Name, Category, Price $\ge 0$) and clicking **"Save"**.
* **Then:** The item is saved. The form closes, a toast message *"Item added successfully"* appears, and the list automatically refreshes.

### AC-03: Validation on Adding Item

* **Given:** The Owner is on the **"Add New Item"** form.
* **When:** Leaving the Name blank or entering a negative Price (e.g., `-50,000`), then clicking **"Save"**.
* **Then:** The system blocks the API call. Specific error messages are displayed directly beneath the corresponding fields: *"Item name is required"* or *"Price must be a valid number $\ge 0$"*. The form retains all entered data.

### AC-04: Update "Out of Stock" Status — Real-time Mobile App

* **Given:** The item "Peach Orange Lemongrass Tea" is currently **"In Stock"** (is_remain=true in database).
* **When:** The Owner switches the toggle to **"Out of Stock"**.
* **Then:** Within 3–5 seconds (via WebSockets), the item appears grayed out on the Mobile App, the **"Add to Cart"** button is disabled, and an **"Out of Stock"** badge is displayed—all without requiring a page refresh.

### AC-05: Price Snapshotting at Order Time

* **Given:** "Black Coffee" is priced at 30,000đ. Order #1 contains this item and is currently in "New" status.
* **When:** The Owner updates the price of "Black Coffee" to 35,000đ.
* **Then:** The menu displays 35,000đ for new customer orders. The price of "Black Coffee" in Order #1 remains 30,000đ — past or pending customer bills are unchanged.

### AC-06: Staff Authorization

* **Given:** A user is logged in with a Staff account.
* **When:** Accessing the `/menu` route directly.
* **Then:** The system displays a **403 Forbidden** error page and returns no menu data.

### AC-07: Delete Menu Item

* **Given:** The item "Black Coffee" exists in historical, fully-paid orders.
* **When:** The Owner clicks **"Delete"** and confirms the action.
* **Then:** The item should be soft-deleted/hidden