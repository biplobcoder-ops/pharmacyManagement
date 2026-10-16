# 🏥 Pharmacy Management System — Backend Architecture

> **Version:** 2.0 (Fully Implemented)
> **Last Updated:** 2026
> **Status:** ✅ Production Ready
> **Total Files:** ~180+
> **Total Models:** 24
> **Total Services:** 27
> **Total Controllers:** 26
> **Total Routes:** 26

---

## 📑 Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Entity Map](#3-database-entity-map)
4. [Relationship Diagram](#4-relationship-diagram)
5. [Business Workflow](#5-business-workflow)
6. [API Module Map](#6-api-module-map)
7. [Permission Matrix](#7-permission-matrix)
8. [Transaction Rules](#8-transaction-rules)
9. [Folder Structure](#9-folder-structure)
10. [Code Conventions](#10-code-conventions)
11. [Development Phases](#11-development-phases)
12. [Appendix](#12-appendix)

---

## 1. Overview

### 1.1 Project Name
**Pharmacy Management System (PMS)** — Backend API

### 1.2 Purpose
Large retail pharmacies and pharmacy businesses in Bangladesh er jonno ekta professional, scalable, maintainable backend system.

### 1.3 Key Features
- ✅ Multi-branch ready architecture
- ✅ Batch-aware inventory (multiple batches per medicine)
- ✅ FEFO (First Expiry, First Out) stock selection
- ✅ Complete purchase → sale → return workflow
- ✅ Customer & supplier due tracking
- ✅ Payment management (cash, card, bank, mobile)
- ✅ Role-based access control (RBAC) — 5 roles
- ✅ Full audit trail
- ✅ Dashboard & reporting APIs (aggregation pipelines)
- ✅ Notification system (extensible: email/SMS/WhatsApp ready)
- ✅ Light/Dark mode support (user preference)
- ✅ Cloudinary image upload (Multer memory storage)
- ✅ MongoDB transaction (atomic workflows)

### 1.4 Target Users
| Role | Description |
|------|-------------|
| Admin | Full system access |
| Manager | Branch-level management |
| Pharmacist | Medicine & prescription handling |
| Cashier | Sales & customer handling |
| Accountant | Finance, payments, reports |

---

## 2. Tech Stack

### 2.1 Core Stack
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (v18+) |
| Framework | Express.js 5 |
| Database | MongoDB (local dev, Atlas prod) |
| ODM | Mongoose 9 |
| Authentication | JWT (access + refresh token) |
| Password Hashing | bcryptjs |
| Validation | Joi |
| API Style | REST |
| Image Upload | Multer (memory storage) + Cloudinary |

### 2.2 Supporting Libraries
| Purpose | Library |
|---------|---------|
| Environment | dotenv |
| Security | helmet, cors, express-rate-limit |
| Sanitization | Custom middleware (Express 5 compatible) |
| Logging | morgan (dev), winston (prod) |
| Testing | jest, supertest |
| Dev | nodemon |
| Image Upload | multer, cloudinary |

### 2.3 Response Format
```json
// Success
{
  "success": true,
  "statusCode": 200,
  "message": "Medicines fetched",
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 100 }
}

// Error
{
  "success": false,
  "statusCode": 404,
  "message": "Medicine not found",
  "errors": []
}
```

### 2.4 Environment Variables
| Variable | Purpose | Example |
|----------|---------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 5000 |
| MONGODB_URI | DB connection | mongodb://localhost:27017/pharmacy_db |
| JWT_SECRET | Access token secret | (random) |
| JWT_EXPIRES_IN | Access token expiry | 15m |
| JWT_REFRESH_SECRET | Refresh token secret | (random) |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | 7d |
| BCRYPT_SALT_ROUNDS | Password hashing | 10 |
| CORS_ORIGIN | Frontend URL | http://localhost:3000 |
| CLOUDINARY_CLOUD_NAME | Cloudinary | (your-cloud) |
| CLOUDINARY_API_KEY | Cloudinary | (your-key) |
| CLOUDINARY_API_SECRET | Cloudinary | (your-secret) |

---

## 3. Database Entity Map

> Ei section e **24 ta collection** er structure, field, index, ar reference deya ache.

### 3.1 User
**Purpose:** System e login korte para user

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | ✅ | Full name |
| email | String | ✅ | Login email (unique) |
| phone | String | ❌ | Contact |
| password | String | ✅ | Hashed (bcrypt) |
| role | ObjectId → Role | ✅ | User role |
| branch | ObjectId → Branch | ❌ | Assigned branch |
| status | String | ✅ | active/inactive/suspended |
| preferences.theme | String | ❌ | light/dark (default: light) |
| lastLogin | Date | ❌ | Last login |
| createdAt, updatedAt | Date | auto | — |

**Indexes:** email (unique), role, branch, status

---

### 3.2 Role
**Purpose:** User er role ar permission

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | ✅ | admin/manager/pharmacist/cashier/accountant |
| description | String | ❌ | Role description |
| permissions | [String] | ✅ | Permission strings |
| isSystem | Boolean | ❌ | System role |
| status | String | ✅ | active/inactive |

**Indexes:** name (unique)

---

### 3.3 RefreshToken
**Purpose:** JWT refresh token store

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| user | ObjectId → User | ✅ | Token owner |
| token | String | ✅ | Refresh token (unique) |
| expiresAt | Date | ✅ | Expiry time (TTL) |

**Indexes:** token (unique), user, expiresAt (TTL)

---

### 3.4 AuditLog
**Purpose:** Important action tracking

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| user | ObjectId → User | ✅ | User |
| action | String | ✅ | login/create/update/delete/etc. |
| module | String | ✅ | Module name |
| reference | ObjectId | ❌ | Affected document |
| oldData, newData | Mixed | ❌ | Before/after |
| ip, userAgent | String | ❌ | Device metadata |
| timestamp | Date | auto | — |

**Indexes:** user, action, module, timestamp, reference

---

### 3.5 Category
**Purpose:** Medicine category (hierarchical)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | ✅ | Category name (unique) |
| description | String | ❌ | Description |
| parentCategory | ObjectId → Category | ❌ | Sub-category support |
| image | Object | ❌ | { url, publicId } |
| sortOrder | Number | ❌ | Display order |
| status | String | ✅ | active/inactive |

**Indexes:** name (unique), parentCategory, status

---

### 3.6 Brand
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | ✅ | Brand name (unique) |
| company | String | ❌ | Company name |
| country | String | ❌ | Country of origin |
| description | String | ❌ | Description |
| logo | Object | ❌ | { url, publicId } |
| website | String | ❌ | Company website |
| status | String | ✅ | active/inactive |

---

### 3.7 Generic
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | ✅ | Generic name (unique) |
| description | String | ❌ | Description |
| indications | String | ❌ | Ki rog e use hoy |
| sideEffects | String | ❌ | Side effects |
| contraindications | String | ❌ | Kokhon khaoa jabe na |
| dosageForm | [String] | ❌ | tablet/capsule/etc. |
| status | String | ✅ | active/inactive |

---

### 3.8 Unit
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | ✅ | Unit name (unique) |
| shortName | String | ✅ | Short code (unique) |
| baseUnit | ObjectId → Unit | ❌ | Base unit reference |
| conversionFactor | Number | ❌ | Conversion rate (1 Box = 100 Pieces) |
| description | String | ❌ | Description |
| status | String | ✅ | active/inactive |

---

### 3.9 Organization
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | ✅ | Organization name (unique) |
| owner | String | ❌ | Owner name |
| phone, email, address | String | ❌ | Contact |
| logo | Object | ❌ | { url, publicId } |
| website | String | ❌ | Website |
| taxId | String | ❌ | VAT/Tax ID |
| tradeLicense | String | ❌ | Trade license |
| status | String | ✅ | active/inactive |

---

### 3.10 Branch
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| organization | ObjectId → Organization | ✅ | Parent org |
| name | String | ✅ | Branch name |
| code | String | ✅ | Unique code (DHM-001) |
| phone, email, address | String | ❌ | Contact |
| manager | ObjectId → User | ❌ | Branch manager |
| openingHours | Object | ❌ | { open, close } |
| isMainBranch | Boolean | ❌ | Main branch |
| status | String | ✅ | active/inactive |

**Indexes:** code (unique), organization, status

---

### 3.11 Medicine
**Purpose:** Master data (NOT inventory)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | ✅ | Medicine name |
| generic | ObjectId → Generic | ✅ | Generic |
| brand | ObjectId → Brand | ❌ | Brand |
| category | ObjectId → Category | ✅ | Category |
| unit | ObjectId → Unit | ✅ | Unit |
| strength | String | ✅ | e.g., "500 mg" |
| dosageForm | String | ✅ | tablet/capsule/syrup/injection/etc. |
| barcode | String | ❌ | Barcode (unique sparse) |
| sku | String | ❌ | SKU (unique sparse) |
| image | Object | ❌ | { url, publicId } (Cloudinary) |
| prescriptionRequired | Boolean | ❌ | Prescription lagbe |
| description | String | ❌ | Description |
| manufacturer | String | ❌ | Manufacturer |
| storageCondition | String | ❌ | Storage info |
| minStockLevel | Number | ❌ | Minimum stock alert |
| status | String | ✅ | active/inactive |
| createdBy | ObjectId → User | ❌ | Creator |

**Indexes:** name, barcode (sparse unique), sku (sparse unique), generic, brand, category, status, text search

---

### 3.12 Batch
**Purpose:** Medicine er specific batch (multiple per medicine)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| medicine | ObjectId → Medicine | ✅ | Medicine |
| batchNumber | String | ✅ | Batch number |
| manufacturingDate | Date | ❌ | Manufacturing |
| expiryDate | Date | ✅ | Expiry (FEFO) |
| purchasePrice | Number | ✅ | Cost price |
| sellingPrice | Number | ✅ | Selling price |
| quantity | Number | ✅ | Current stock |
| initialQuantity | Number | ✅ | Initial stock |
| supplier | ObjectId → Supplier | ❌ | Supplier |
| branch | ObjectId → Branch | ✅ | Branch |
| status | String | ✅ | active/expired/damaged/depleted |
| notes | String | ❌ | Notes |

**Indexes:** medicine, batchNumber, expiryDate, branch, status
**Compound Unique:** { medicine, batchNumber, branch }
**FEFO Index:** { medicine, branch, status, expiryDate }

---

### 3.13 Supplier
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | ✅ | Supplier name |
| company | String | ❌ | Company |
| phone | String | ✅ | Contact |
| email, address | String | ❌ | Contact |
| contactPerson | String | ❌ | Representative |
| tradeLicense, taxId | String | ❌ | Legal |
| openingBalance | Number | ❌ | Opening due |
| dueBalance | Number | ✅ | Current payable |
| totalPurchase, totalPaid | Number | ❌ | Cached totals |
| notes | String | ❌ | Notes |
| status | String | ✅ | active/inactive |
| createdBy | ObjectId → User | ❌ | Creator |

**Indexes:** name, phone, status

---

### 3.14 Purchase
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| invoiceNumber | String | ✅ | Unique (PU-00001) |
| supplier | ObjectId → Supplier | ✅ | Supplier |
| branch | ObjectId → Branch | ✅ | Branch |
| purchaseDate | Date | ✅ | Purchase date |
| items | [ObjectId → PurchaseItem] | ✅ | Items |
| subtotal, discount, tax, total | Number | ✅ | Amounts |
| paidAmount, dueAmount | Number | ✅ | Payment |
| paymentStatus | String | ✅ | paid/partial/due |
| status | String | ✅ | pending/completed/cancelled |
| notes | String | ❌ | Notes |
| createdBy | ObjectId → User | ✅ | Creator |

**Indexes:** invoiceNumber (unique), supplier, branch, purchaseDate, status

---

### 3.15 PurchaseItem
**Purpose:** Purchase er individual item (snapshot)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| purchase | ObjectId → Purchase | ✅ | Parent |
| medicine | ObjectId → Medicine | ✅ | Medicine |
| medicineName | String | ✅ | Snapshot |
| medicineImage | Object | ❌ | Snapshot { url, publicId } |
| batch | ObjectId → Batch | ❌ | Created batch |
| batchNumber | String | ✅ | Batch number |
| manufacturingDate, expiryDate | Date | ❌/✅ | Dates |
| quantity, freeQuantity, returnedQuantity | Number | ✅ | Quantities |
| purchasePrice, sellingPrice | Number | ✅ | Prices (snapshot) |
| discount, total | Number | ✅ | Amounts |

**Indexes:** purchase, medicine, batch

---

### 3.16 PurchaseReturn
**Purpose:** Supplier ke return (inline PurchaseReturnItem)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| returnNumber | String | ✅ | Unique (PR-00001) |
| purchase | ObjectId → Purchase | ✅ | Original purchase |
| supplier | ObjectId → Supplier | ✅ | Supplier |
| branch | ObjectId → Branch | ✅ | Branch |
| returnDate | Date | ✅ | Return date |
| items | [ObjectId → PurchaseReturnItem] | ✅ | Items |
| total | Number | ✅ | Total |
| reason | String | ✅ | Reason |
| status | String | ✅ | pending/completed/cancelled |
| createdBy | ObjectId → User | ✅ | Creator |

---

### 3.17 Customer
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| name | String | ✅ | Name |
| phone | String | ❌ | Phone (sparse unique) |
| email, address | String | ❌ | Contact |
| isWalkIn | Boolean | ❌ | Walk-in customer flag |
| totalPurchase, totalPaid, dueBalance | Number | ❌ | Cached financials |
| totalSales | Number | ❌ | Sales count |
| notes | String | ❌ | Notes |
| status | String | ✅ | active/inactive |
| createdBy | ObjectId → User | ❌ | Creator |

**Indexes:** name, phone (sparse unique), isWalkIn, status

---

### 3.18 Sale
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| invoiceNumber | String | ✅ | Unique (SL-00001) |
| customer | ObjectId → Customer | ❌ | Customer (null = walk-in) |
| customerName | String | ✅ | Snapshot |
| customerPhone | String | ❌ | Snapshot |
| branch | ObjectId → Branch | ✅ | Branch |
| saleDate | Date | ✅ | Sale date |
| items | [ObjectId → SaleItem] | ✅ | Items |
| subtotal, discount, tax, total | Number | ✅ | Amounts |
| paidAmount, dueAmount | Number | ✅ | Payment |
| totalCost, totalProfit | Number | ❌ | Profit (cached) |
| paymentStatus | String | ✅ | paid/partial/due |
| status | String | ✅ | completed/cancelled |
| createdBy | ObjectId → User | ✅ | Cashier |

---

### 3.19 SaleItem
**Purpose:** Sale er individual item (snapshot + FEFO)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| sale | ObjectId → Sale | ✅ | Parent |
| medicine | ObjectId → Medicine | ✅ | Medicine |
| medicineName | String | ✅ | Snapshot |
| medicineImage | Object | ❌ | Snapshot { url, publicId } |
| strength, dosageForm | String | ❌ | Snapshot |
| batch | ObjectId → Batch | ✅ | Batch (FEFO) |
| batchNumber, expiryDate | String/Date | ✅ | Snapshot |
| quantity, returnedQuantity | Number | ✅ | Quantities |
| sellingPrice, costPrice | Number | ✅ | Snapshot |
| discount, tax, total | Number | ✅ | Amounts |
| profit | Number | ✅ | Historical profit |

---

### 3.20 SalesReturn
**Purpose:** Customer theke return (inline SalesReturnItem)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| returnNumber | String | ✅ | Unique (SR-00001) |
| sale | ObjectId → Sale | ✅ | Original sale |
| customer | ObjectId → Customer | ❌ | Customer |
| branch | ObjectId → Branch | ✅ | Branch |
| returnDate | Date | ✅ | Return date |
| items | [ObjectId → SalesReturnItem] | ✅ | Items |
| total | Number | ✅ | Total |
| refundAmount, refundMethod | Number/String | ✅ | Refund |
| reason | String | ✅ | Reason |
| status | String | ✅ | pending/completed/cancelled |

---

### 3.21 Payment
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| paymentNumber | String | ✅ | Unique (PM-00001 / SM-00001) |
| type | String | ✅ | customer/supplier |
| method | String | ✅ | cash/card/bank/mobile/other |
| amount | Number | ✅ | Amount |
| reference | String | ❌ | Transaction ref |
| date | Date | ✅ | Payment date |
| customer | ObjectId → Customer | ❌ | Customer |
| supplier | ObjectId → Supplier | ❌ | Supplier |
| sale | ObjectId → Sale | ❌ | Related sale |
| purchase | ObjectId → Purchase | ❌ | Related purchase |
| branch | ObjectId → Branch | ✅ | Branch |
| notes | String | ❌ | Notes |
| createdBy | ObjectId → User | ✅ | Creator |

---

### 3.22 Expense
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| expenseNumber | String | ✅ | Unique (EX-00001) |
| category | String | ✅ | rent/salary/electricity/transport/etc. |
| title | String | ✅ | Title |
| amount | Number | ✅ | Amount |
| date | Date | ✅ | Date |
| description | String | ❌ | Description |
| paymentMethod | String | ✅ | cash/card/bank/mobile/other |
| reference | String | ❌ | Receipt ref |
| branch | ObjectId → Branch | ✅ | Branch |
| attachment | Object | ❌ | { url, publicId } (Cloudinary) |
| createdBy | ObjectId → User | ✅ | Creator |

---

### 3.23 StockMovement
**Purpose:** Sob stock change er audit trail

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| medicine | ObjectId → Medicine | ✅ | Medicine |
| batch | ObjectId → Batch | ✅ | Batch |
| branch | ObjectId → Branch | ✅ | Branch |
| type | String | ✅ | PURCHASE/SALE/SALE_RETURN/PURCHASE_RETURN/DAMAGE/EXPIRED/ADJUSTMENT/TRANSFER_IN/TRANSFER_OUT |
| quantity | Number | ✅ | Change (+/-) |
| previousQuantity, newQuantity | Number | ✅ | Before/after |
| referenceType, referenceId | String/ObjectId | ✅ | Reference |
| reason | String | ❌ | Reason |
| createdBy | ObjectId → User | ✅ | User |

**Indexes:** medicine, batch, branch, type, referenceType+referenceId, createdAt

---

### 3.24 Notification
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| type | String | ✅ | low_stock/expiring_soon/expired/customer_due/supplier_due/system/sale/purchase |
| title, message | String | ✅ | Content |
| branch | ObjectId → Branch | ❌ | Branch |
| referenceType, referenceId | String/ObjectId | ❌ | Reference |
| isRead | Boolean | ✅ | Read status |
| priority | String | ✅ | low/medium/high |
| channels | Object | ❌ | { email, sms, whatsapp } (future) |
| metadata | Mixed | ❌ | Extra data |

**Indexes:** type, branch, isRead, priority, createdAt

---

### 3.25 Setting
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | auto | Primary key |
| key | String | ✅ | Unique key |
| value | Mixed | ✅ | Value |
| category | String | ✅ | general/invoice/expiry/notification/tax/business/other |
| label, description | String | ❌ | Admin UI |
| dataType | String | ❌ | string/number/boolean/array/object |
| isSystem | Boolean | ❌ | System setting |
| updatedBy | ObjectId → User | ❌ | Who updated |

**Indexes:** key (unique), category

---

## 4. Relationship Diagram

### 4.1 Overall ERD

```
Organization (1) ──▶ (N) Branch
Branch (1) ──▶ (N) User
Role (1) ──▶ (N) User

Generic (1) ──▶ (N) Medicine
Brand (1) ──▶ (N) Medicine
Category (1) ──▶ (N) Medicine
Unit (1) ──▶ (N) Medicine
Medicine (1) ──▶ (N) Batch
Batch (1) ──▶ (N) StockMovement

Supplier (1) ──▶ (N) Purchase
Purchase (1) ──▶ (N) PurchaseItem
Purchase (1) ──▶ (N) PurchaseReturn

Customer (1) ──▶ (N) Sale
Sale (1) ──▶ (N) SaleItem
Sale (1) ──▶ (N) SalesReturn

Customer (1) ──▶ (N) Payment
Supplier (1) ──▶ (N) Payment
```

### 4.2 Central Business Flow

```
Supplier → Purchase → Batch → Inventory → Sale → Customer → Payment → Profit
Batch → Expiry → Stock Movement → Audit
```

---

## 📌 Part 1 Complete

**Part 1 e ki ki thaklo:**
- Section 1: Overview
- Section 2: Tech Stack
- Section 3: Database Entity Map (25 models)
- Section 4: Relationship Diagram

**Part 2 e ki thakbe:**
- Section 5: Business Workflow
- Section 6: API Module Map
- Section 7: Permission Matrix
- Section 8: Transaction Rules

**Part 3 e ki thakbe:**
- Section 9: Folder Structure
- Section 10: Code Conventions
- Section 11: Development Phases
- Section 12: Appendix
---

## 5. Business Workflow

### 5.1 Purchase Flow

**Purpose:** Supplier theke medicine purchase kore stock increase kora

```
1. User purchase form fill kore
   ├── Supplier select
   ├── Invoice number (auto-generate PU-00001)
   ├── Purchase date
   └── Items add:
       ├── Medicine
       ├── Batch number
       ├── Manufacturing date
       ├── Expiry date
       ├── Quantity + Free quantity
       ├── Purchase price
       └── Selling price

2. Backend validation:
   ├── Supplier exist kore?
   ├── Medicine exist kore?
   ├── Quantity > 0?
   ├── Expiry date > manufacturing date?
   └── Duplicate invoice number?

3. Transaction start:
   ├── a) Purchase document create
   ├── b) Prottek item er jonno:
   │     ├── PurchaseItem create (snapshot)
   │     ├── Batch create/update (same batch number + branch)
   │     ├── Stock increase (inventoryService.increaseStock)
   │     └── StockMovement create (type: PURCHASE)
   ├── c) Supplier due update (+ dueAmount)
   ├── d) Supplier stats update
   └── e) Audit log create

4. Transaction commit
5. Response return
```

**Flow Diagram:**
```
Supplier ──▶ Purchase ──▶ PurchaseItem ──▶ Batch ──▶ Stock ──▶ StockMovement
                │
                ├──▶ Payment
                └──▶ Supplier Balance
```

---

### 5.2 Sale Flow (POS)

**Purpose:** Customer ke medicine sale kore stock decrease (FEFO)

```
1. Cashier sale form fill kore
   ├── Customer select (or walk-in)
   └── Items add:
       ├── Medicine
       ├── Quantity
       └── (Optional) Batch select manually

2. Backend validation:
   ├── Medicine exist kore?
   ├── Quantity > 0?
   ├── Stock available?
   └── Customer exist kore?

3. Transaction start:
   ├── a) FEFO batch selection (expiry ASC):
   │     ├── Active batches (expiry > today)
   │     ├── Sort by expiryDate ASC
   │     └── Allocate quantity
   ├── b) Sale document create
   ├── c) Prottek allocation er jonno:
   │     ├── SaleItem create (snapshot)
   │     ├── Stock decrease (inventoryService.decreaseStock)
   │     └── StockMovement create (type: SALE)
   ├── d) Customer due update
   ├── e) Customer stats update
   ├── f) Invoice number generate (atomic SL-00001)
   └── g) Audit log create

4. Transaction commit
5. Response return
```

**FEFO Example:**
```
Batch A → Jan 2027 → Qty: 20
Batch B → Jun 2027 → Qty: 100

Sells 30 units:
├── Batch A = 20 (fully consumed, earliest expiry)
└── Batch B = 10 (partially consumed)
```

**Flow Diagram:**
```
Customer ──▶ Sale ──▶ SaleItem ──▶ Batch (FEFO) ──▶ Stock ──▶ StockMovement
               │
               ├──▶ Payment
               └──▶ Customer Due
```

---

### 5.3 Sales Return Flow

```
1. User sale return form fill kore
2. Validation:
   ├── Sale exist kore?
   ├── Return quantity ≤ (sold - already returned)?
   └── Sale cancelled na?

3. Transaction:
   ├── a) SalesReturn create (SR-00001)
   ├── b) Prottek item:
   │     ├── SalesReturnItem create
   │     ├── SaleItem.returnedQuantity update
   │     ├── Stock increase
   │     └── StockMovement create (SALE_RETURN)
   ├── c) Customer due adjust (if credit refund)
   └── d) Refund record

4. Commit
```

**Rules:**
- Original sale **never delete**
- Return quantity **exceed korte parbe na**
- History preserved

---

### 5.4 Purchase Return Flow

```
1. User purchase return form fill kore
2. Validation:
   ├── Purchase exist kore?
   ├── Return quantity ≤ (purchased - already returned)?
   └── Stock available?

3. Transaction:
   ├── a) PurchaseReturn create (PR-00001)
   ├── b) Prottek item:
   │     ├── PurchaseReturnItem create
   │     ├── PurchaseItem.returnedQuantity update
   │     ├── Stock decrease
   │     └── StockMovement create (PURCHASE_RETURN)
   └── c) Supplier due adjust

4. Commit
```

---

### 5.5 Payment Flow

**Customer Payment:**
```
1. Payment form fill
2. Validation:
   ├── Customer exist kore?
   ├── Amount > 0?
   └── Amount ≤ customer due?
3. Transaction:
   ├── a) Payment create (type: customer, PM-00001)
   ├── b) Customer.dueBalance decrease
   ├── c) Jodi sale reference → Sale.paidAmount update
   └── d) Audit log
4. Commit
```

**Supplier Payment:** Same, type: supplier, SM-00001.

**Flow Diagram:**
```
Customer ──▶ Payment ──▶ Customer Due (decrease)
Supplier ──▶ Payment ──▶ Supplier Payable (decrease)
```

---

### 5.6 Stock Movement Types

| Type | Trigger | Sign |
|------|---------|------|
| PURCHASE | Purchase confirmed | + |
| SALE | Sale confirmed | - |
| SALE_RETURN | Sale return | + |
| PURCHASE_RETURN | Purchase return | - |
| DAMAGE | Manual entry | - |
| EXPIRED | Manual/auto | - |
| ADJUSTMENT | Manual | +/- |
| TRANSFER_IN | Branch transfer | + |
| TRANSFER_OUT | Branch transfer | - |

---

## 6. API Module Map

**Base URL:** `/api`

### 6.1 Auth APIs
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login | Public |
| POST | `/api/auth/logout` | Logout | Auth |
| POST | `/api/auth/refresh` | Refresh token | Public |
| GET | `/api/auth/me` | Current user | Auth |
| PATCH | `/api/auth/change-password` | Change password | Auth |

### 6.2 User APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/users` | user:view |
| GET | `/api/users/:id` | user:view |
| POST | `/api/users` | user:create |
| PATCH | `/api/users/:id` | user:update |
| DELETE | `/api/users/:id` | user:delete |
| PATCH | `/api/users/preferences` | Auth (theme) |

### 6.3 Role APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/roles` | role:view |
| GET | `/api/roles/permissions` | role:view |
| GET | `/api/roles/:id` | role:view |
| POST | `/api/roles` | role:create |
| PATCH | `/api/roles/:id` | role:update |
| DELETE | `/api/roles/:id` | role:delete |

### 6.4 Category APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/categories` | category:view |
| GET | `/api/categories/:id` | category:view |
| POST | `/api/categories` | category:create |
| PATCH | `/api/categories/:id` | category:update |
| DELETE | `/api/categories/:id` | category:delete |

### 6.5 Brand APIs
Same pattern (`brand:*`)

### 6.6 Generic APIs
Same pattern (`generic:*`)

### 6.7 Unit APIs
Same pattern (`unit:*`)

### 6.8 Organization APIs
Same pattern (`organization:*`)

### 6.9 Branch APIs
Same pattern (`branch:*`)

### 6.10 Medicine APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/medicines` | medicine:view |
| GET | `/api/medicines/:id` | medicine:view |
| GET | `/api/medicines/barcode/:code` | medicine:view |
| POST | `/api/medicines` | medicine:create (with image) |
| PATCH | `/api/medicines/:id` | medicine:update (with image) |
| DELETE | `/api/medicines/:id` | medicine:delete |
| POST | `/api/medicines/:id/image` | medicine:update |
| DELETE | `/api/medicines/:id/image` | medicine:update |

### 6.11 Batch APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/batches` | batch:view |
| GET | `/api/batches/:id` | batch:view |
| GET | `/api/batches/medicine/:medicineId` | batch:view |
| GET | `/api/batches/expiring` | batch:view |
| GET | `/api/batches/expired` | batch:view |
| POST | `/api/batches` | batch:create |
| PATCH | `/api/batches/:id` | batch:update |
| DELETE | `/api/batches/:id` | batch:delete |

### 6.12 Inventory APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/inventory` | inventory:view |
| GET | `/api/inventory/summary` | inventory:view |
| GET | `/api/inventory/low-stock` | inventory:view |
| GET | `/api/inventory/out-of-stock` | inventory:view |
| GET | `/api/inventory/medicine/:medicineId` | inventory:view |

### 6.13 Stock Movement APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/stock-movements` | stock:view |
| GET | `/api/stock-movements/:id` | stock:view |
| GET | `/api/stock-movements/batch/:batchId` | stock:view |
| GET | `/api/stock-movements/medicine/:medicineId` | stock:view |
| POST | `/api/stock-movements/adjust` | inventory:adjust |

### 6.14 Supplier APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/suppliers` | supplier:view |
| GET | `/api/suppliers/:id` | supplier:view |
| POST | `/api/suppliers` | supplier:create |
| PATCH | `/api/suppliers/:id` | supplier:update |
| DELETE | `/api/suppliers/:id` | supplier:delete |

### 6.15 Purchase APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/purchases` | purchase:view |
| GET | `/api/purchases/:id` | purchase:view |
| POST | `/api/purchases` | purchase:create (transaction) |
| PATCH | `/api/purchases/:id/cancel` | purchase:approve |
| DELETE | `/api/purchases/:id` | purchase:delete |

### 6.16 Purchase Return APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/purchase-returns` | purchase-return:view |
| GET | `/api/purchase-returns/:id` | purchase-return:view |
| POST | `/api/purchase-returns` | purchase-return:create |
| PATCH | `/api/purchase-returns/:id/cancel` | purchase-return:approve |

### 6.17 Customer APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/customers` | customer:view |
| GET | `/api/customers/:id` | customer:view |
| GET | `/api/customers/phone/:phone` | customer:view |
| POST | `/api/customers` | customer:create |
| PATCH | `/api/customers/:id` | customer:update |
| DELETE | `/api/customers/:id` | customer:delete |

### 6.18 Sale APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/sales` | sale:view |
| GET | `/api/sales/:id` | sale:view |
| GET | `/api/sales/invoice/:invoiceNumber` | sale:view |
| POST | `/api/sales` | sale:create (FEFO + transaction) |
| PATCH | `/api/sales/:id/cancel` | sale:approve |

### 6.19 Sales Return APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/sales-returns` | sales-return:view |
| GET | `/api/sales-returns/:id` | sales-return:view |
| POST | `/api/sales-returns` | sales-return:create |
| PATCH | `/api/sales-returns/:id/cancel` | sales-return:approve |

### 6.20 Payment APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/payments` | payment:view |
| GET | `/api/payments/:id` | payment:view |
| POST | `/api/payments` | payment:create |
| POST | `/api/payments/customer` | payment:create |
| POST | `/api/payments/supplier` | payment:create |
| DELETE | `/api/payments/:id` | payment:delete |

### 6.21 Expense APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/expenses` | expense:view |
| GET | `/api/expenses/:id` | expense:view |
| POST | `/api/expenses` | expense:create (with attachment) |
| PATCH | `/api/expenses/:id` | expense:update |
| DELETE | `/api/expenses/:id` | expense:delete |

### 6.22 Report APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/reports/dashboard` | report:view |
| GET | `/api/reports/sales` | report:view |
| GET | `/api/reports/sales/product-wise` | report:view |
| GET | `/api/reports/sales/category-wise` | report:view |
| GET | `/api/reports/sales/user-wise` | report:view |
| GET | `/api/reports/purchases` | report:view |
| GET | `/api/reports/inventory` | report:view |
| GET | `/api/reports/finance` | report:view |

### 6.23 Notification APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/notifications` | Auth |
| GET | `/api/notifications/unread` | Auth |
| GET | `/api/notifications/:id` | Auth |
| PATCH | `/api/notifications/:id/read` | Auth |
| PATCH | `/api/notifications/read-all` | Auth |
| DELETE | `/api/notifications/:id` | Auth |
| DELETE | `/api/notifications/read-all` | Auth |
| POST | `/api/notifications/run-checks` | setting:update |

### 6.24 Audit Log APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/audit-logs` | audit:view |
| GET | `/api/audit-logs/summary` | audit:view |
| GET | `/api/audit-logs/user/:userId` | audit:view |
| GET | `/api/audit-logs/:id` | audit:view |

### 6.25 Setting APIs
| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/api/settings` | setting:view |
| GET | `/api/settings/category/:category` | setting:view |
| GET | `/api/settings/:key` | setting:view |
| POST | `/api/settings` | setting:update |
| PATCH | `/api/settings/bulk` | setting:update |
| PATCH | `/api/settings/:key` | setting:update |
| DELETE | `/api/settings/:key` | setting:update |

---

## 7. Permission Matrix

### 7.1 Roles
| Role | Description |
|------|-------------|
| Admin | Full access (`*`) |
| Manager | Branch management |
| Pharmacist | Medicine & prescription |
| Cashier | Sales & customer |
| Accountant | Finance & reports |

### 7.2 Actions
| Action | Meaning |
|--------|---------|
| view | Read data |
| create | Add new |
| update | Modify |
| delete | Remove |
| approve | Approve/cancel |
| adjust | Stock adjustment |
| export | Export data |
| manage | Full control |

### 7.3 Permission Matrix Table

| Module | Admin | Manager | Pharmacist | Cashier | Accountant |
|--------|-------|---------|------------|---------|------------|
| User | manage | view | ❌ | ❌ | ❌ |
| Role | manage | view | ❌ | ❌ | ❌ |
| Category | manage | manage | view | view | view |
| Brand | manage | manage | view | view | view |
| Generic | manage | manage | view | view | view |
| Unit | manage | manage | view | view | view |
| Organization | manage | view | view | ❌ | ❌ |
| Branch | manage | view, create, update | view | ❌ | ❌ |
| Medicine | manage | manage | view, create, update | view | view |
| Batch | manage | manage | view, create, update | view | view |
| Inventory | manage | view, adjust | view, adjust | view | view |
| Stock Movement | manage | view | view | ❌ | view |
| Supplier | manage | manage | view | ❌ | view |
| Purchase | manage | create, view, approve | view | ❌ | view |
| Purchase Return | manage | create, approve | view | ❌ | view |
| Customer | manage | manage | view | view, create | view |
| Sale | manage | view, approve | view | create, view | view |
| Sales Return | manage | create, approve | view | create, view | view |
| Payment | manage | create, view | ❌ | create, view | create, view |
| Expense | manage | create, view, update | ❌ | ❌ | create, view, update, delete |
| Report | manage, export | view, export | ❌ | ❌ | view, export |
| Notification | view | view | view | view | view |
| Audit Log | manage | view | ❌ | ❌ | view |
| Setting | manage | view | ❌ | ❌ | ❌ |

### 7.4 Example: Cashier Permissions

```json
{
  "name": "cashier",
  "permissions": [
    "medicine:view",
    "batch:view",
    "inventory:view",
    "customer:view",
    "customer:create",
    "sale:view",
    "sale:create",
    "sales-return:view",
    "sales-return:create",
    "payment:view",
    "payment:create",
    "notification:view"
  ]
}
```

**Cashier cannot:**
- Delete medicine
- Modify purchase price
- Manage users
- Modify system settings
- View audit logs
- View reports

---

## 8. Transaction Rules

### 8.1 When to Use Transaction

| Operation | Collections | Transaction? |
|-----------|-------------|--------------|
| Create Purchase | Purchase, PurchaseItem, Batch, StockMovement, Supplier | ✅ YES |
| Create Sale | Sale, SaleItem, Batch, StockMovement, Customer | ✅ YES |
| Create Sales Return | SalesReturn, SalesReturnItem, SaleItem, Batch, StockMovement, Customer | ✅ YES |
| Create Purchase Return | PurchaseReturn, PurchaseReturnItem, PurchaseItem, Batch, StockMovement, Supplier | ✅ YES |
| Create Payment | Payment, Customer/Supplier, Sale/Purchase | ✅ YES |
| Create Expense | Expense, AuditLog | ❌ NO |
| Update Medicine | Medicine, AuditLog | ❌ NO |
| Stock Adjustment | Batch, StockMovement | ✅ YES |
| Cancel Sale | Sale, SaleItem, Batch, StockMovement, Customer | ✅ YES |

### 8.2 Standard Transaction Pattern

```js
async createSale(data, user) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // 1. Validation
    // 2. Create sale
    // 3. Create items
    // 4. Decrease stock
    // 5. Create movements
    // 6. Create payment
    // 7. Update customer due
    await session.commitTransaction();
    return sale;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### 8.3 Critical Rules

**Rule 1:** Stock change **shudhu inventoryService** diye
```js
// ❌ NEVER
batch.quantity -= 5;
await batch.save();

// ✅ ALWAYS
await inventoryService.decreaseStock({
  batch, quantity, type, referenceType, referenceId, user, session
});
```

**Rule 2:** Transaction **fail hole sob rollback**

**Rule 3:** Invoice number **atomic increment** (Setting counter)

**Rule 4:** Stock check **age**, decrease **pore**

**Rule 5:** Sob transaction **try-catch-finally** e wrap

### 8.4 Inventory Service Methods

```js
class InventoryService {
  async increaseStock({ batch, quantity, type, referenceType, referenceId, user, reason, session }) {}
  async decreaseStock({ batch, quantity, type, referenceType, referenceId, user, reason, session }) {}
  async fefoSelectBatches(medicine, branch, quantity, session) {}
  async getAvailableStock(medicine, branch, session) {}
  async bulkIncrease(items, params) {}
  async bulkDecrease(items, params) {}
}
```

### 8.5 Snapshot Rules

| Document | Snapshot Fields |
|----------|----------------|
| SaleItem | medicineName, medicineImage, strength, dosageForm, batchNumber, expiryDate, sellingPrice, costPrice |
| PurchaseItem | medicineName, medicineImage, batchNumber, expiryDate |
| SalesReturnItem | medicineName, batchNumber, sellingPrice, costPrice |
| PurchaseReturnItem | medicineName, batchNumber, purchasePrice |

**Kano?**
- Medicine name change hole **purono sale** e purono name thakbe
- Cost price change hole **purono profit** change hobe na
- Historical report **accurate** thakbe

### 8.6 FEFO Selection Logic

```
FEFO = First Expiry, First Out

1. Filter batches:
   ├── medicine matches
   ├── branch matches
   ├── quantity > 0
   ├── status = 'active'
   └── expiryDate > today
2. Sort: expiryDate ASC
3. Allocate:
   ├── Loop batches
   ├── If batch qty >= needed → consume all
   ├── Else → consume available, move to next
   └── Continue until quantity fulfilled
4. Return: [{ batch, quantity }]
```

**Manual override:** Admin/Manager `batch` field diye manually batch select korte parbe.

### 8.7 Rollback Rules

| Failure | Action |
|---------|--------|
| Stock insufficient | Abort, 400 |
| Batch not found | Abort, 404 |
| Duplicate invoice | Abort, 409 |
| DB error | Abort, 500 |
| Validation fail | Abort, 400 |

**Never allow:**
- ❌ Sale created but stock not decreased
- ❌ Stock decreased but sale does not exist
- ❌ Payment recorded but customer due not updated
- ❌ Batch created but purchase item missing

---

## 📌 Part 2 Complete

**Part 2 e ki ki thaklo:**
- Section 5: Business Workflow (6 flows)
- Section 6: API Module Map (25 modules)
- Section 7: Permission Matrix (5 roles × 25 modules)
- Section 8: Transaction Rules

**Part 3 e ki thakbe:**
- Section 9: Folder Structure
- Section 10: Code Conventions
- Section 11: Development Phases
- Section 12: Appendix
---

## 9. Folder Structure

```
backend/
├── docs/
│   └── ARCHITECTURE.md
├── src/
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── cloudinary.js
│   ├── constants/
│   │   ├── roles.js
│   │   ├── permissions.js
│   │   ├── statuses.js
│   │   └── index.js
│   ├── models/                     (25 models)
│   │   ├── User.js
│   │   ├── Role.js
│   │   ├── RefreshToken.js
│   │   ├── AuditLog.js
│   │   ├── Category.js
│   │   ├── Brand.js
│   │   ├── Generic.js
│   │   ├── Unit.js
│   │   ├── Organization.js
│   │   ├── Branch.js
│   │   ├── Medicine.js
│   │   ├── Batch.js
│   │   ├── Supplier.js
│   │   ├── StockMovement.js
│   │   ├── Purchase.js
│   │   ├── PurchaseItem.js
│   │   ├── Customer.js
│   │   ├── Sale.js
│   │   ├── SaleItem.js
│   │   ├── SalesReturn.js
│   │   ├── Payment.js
│   │   ├── Expense.js
│   │   ├── Notification.js
│   │   ├── Setting.js
│   │   └── index.js
│   ├── services/                   (27 services)
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── role.service.js
│   │   ├── audit.service.js
│   │   ├── auditLog.service.js
│   │   ├── category.service.js
│   │   ├── brand.service.js
│   │   ├── generic.service.js
│   │   ├── unit.service.js
│   │   ├── organization.service.js
│   │   ├── branch.service.js
│   │   ├── medicine.service.js
│   │   ├── batch.service.js
│   │   ├── inventory.service.js    ⭐ CRITICAL
│   │   ├── supplier.service.js
│   │   ├── stockMovement.service.js
│   │   ├── purchase.service.js
│   │   ├── purchaseReturn.service.js
│   │   ├── customer.service.js
│   │   ├── sale.service.js         ⭐ CRITICAL
│   │   ├── salesReturn.service.js
│   │   ├── payment.service.js
│   │   ├── expense.service.js
│   │   ├── report.service.js
│   │   ├── notification.service.js
│   │   ├── setting.service.js
│   │   ├── upload.service.js
│   │   └── index.js
│   ├── controllers/                (26 controllers)
│   │   └── index.js
│   ├── routes/                     (26 routes)
│   │   └── index.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── rbac.middleware.js
│   │   ├── validate.middleware.js
│   │   ├── upload.middleware.js
│   │   ├── error.middleware.js
│   │   ├── notFound.middleware.js
│   │   └── index.js
│   ├── validations/                (23 validations)
│   │   └── index.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── logger.js
│   │   └── index.js
│   ├── seeds/
│   │   └── seed.js
│   ├── app.js
│   └── server.js
├── tests/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## 10. Code Conventions

### 10.1 Variable & Function Naming

| Type | Convention | Example |
|------|-----------|---------|
| Variable | camelCase | `userName`, `batchNumber` |
| Constant | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| Class | PascalCase | `InventoryService`, `ApiError` |
| Function | camelCase, verb-first | `createSale()`, `decreaseStock()` |
| Private | _camelCase | `_generateInvoiceNumber()` |
| Boolean | is/has/can prefix | `isActive`, `hasPermission` |

### 10.2 Model Naming

- Model: **Singular, PascalCase** (`User`, `Medicine`, `SaleItem`)
- Collection: **Plural, lowercase** (`users`, `medicines`, `saleitems`)

### 10.3 Route Naming

- Plural, kebab-case: `/api/medicines`, `/api/stock-movements`, `/api/sales-returns`
- Sub-resources: `/api/batches/medicine/:medicineId`
- Actions: `/api/sales/:id/cancel`

### 10.4 Response Format

**Success:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Medicines fetched",
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 100 }
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Medicine not found",
  "errors": []
}
```

### 10.5 HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | GET, PUT, PATCH success |
| 201 | Created | POST success |
| 204 | No Content | DELETE success |
| 400 | Bad Request | Validation fail |
| 401 | Unauthorized | Token missing/invalid |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource missing |
| 409 | Conflict | Duplicate, stock conflict |
| 422 | Unprocessable | Business rule fail |
| 500 | Server Error | Unhandled error |

### 10.6 Controller Pattern (Thin)

```js
exports.create = asyncHandler(async (req, res) => {
  const medicine = await medicineService.create(req.body, req.user, req);
  res.status(201).json(new ApiResponse(201, medicine, 'Medicine created'));
});
```

### 10.7 Service Pattern (Fat)

```js
class MedicineService {
  async create(data, user, req) {
    // 1. Duplicate check
    // 2. Relations validate
    // 3. Image upload (jodi thake)
    // 4. Create
    // 5. Audit log
    return medicine;
  }
}
module.exports = new MedicineService();
```

### 10.8 Route Pattern

```js
const router = express.Router();
router.use(auth); // sob route protected

router
  .route('/')
  .get(authorize('medicine', 'view'), medicineController.getAll)
  .post(
    authorize('medicine', 'create'),
    uploadSingle,
    validate(medicineValidation.createMedicine),
    medicineController.create
  );
```

### 10.9 Validation Pattern (Joi)

```js
const createMedicine = {
  body: Joi.object({
    name: Joi.string().required().trim().min(2).max(200),
    generic: objectId.required(),
    strength: Joi.string().required(),
    dosageForm: Joi.string().valid('tablet', 'capsule', 'syrup').required(),
    // ...
  })
};
```

**Joi Methods (Important):**
| Correct | Wrong |
|---------|-------|
| `.lowercase()` | `.toLowerCase()` |
| `.uppercase()` | `.toUpperCase()` |
| `.trim()` | `.trim()` ✅ |
| `.email()` | `.email()` ✅ |

### 10.10 Error Handling

```js
throw new ApiError(404, 'Medicine not found');
throw new ApiError(400, 'Insufficient stock', [
  { batch: 'B001', available: 10, requested: 20 }
]);
```

### 10.11 Git Commit Convention

```
feat(auth): add login endpoint
fix(sale): correct FEFO batch selection
refactor(inventory): extract stock check to service
docs(readme): add setup instructions
test(sale): add sale creation test
chore(deps): update mongoose
```

---

## 11. Development Phases

### PHASE 1: Auth + Users + Roles ✅
- User, Role, RefreshToken, AuditLog models
- Auth service (login, logout, refresh, me, change-password)
- JWT middleware, RBAC middleware
- Audit service
- Seed: Admin user + 5 roles

### PHASE 2: Master Data ✅
- Category, Brand, Generic, Unit, Organization, Branch
- CRUD APIs

### PHASE 3: Medicine + Batch + Image Upload ✅
- Medicine model + CRUD + Cloudinary image
- Batch model + CRUD
- Barcode search
- Expiry management

### PHASE 4: Supplier + Purchase + Inventory ✅
- Supplier CRUD
- Purchase + PurchaseItem (transaction)
- **Inventory service** (increaseStock, decreaseStock, FEFO)
- **StockMovement** service
- Supplier payable tracking

### PHASE 5: Inventory + FEFO ✅ (Phase 4 e done)
- Inventory view APIs
- Low stock, out of stock
- FEFO batch selection
- Stock adjustment

### PHASE 6: Customer + Sales (POS) ✅
- Customer CRUD
- Sale + SaleItem (FEFO + transaction)
- Walk-in customer support
- Customer due tracking

### PHASE 7: Sales Return + Purchase Return ✅
- SalesReturn + PurchaseReturn
- Return item validation
- Stock adjustment
- Refund/Credit

### PHASE 8: Payment + Expense ✅
- Payment (customer + supplier)
- Due settlement
- Expense CRUD + attachment

### PHASE 9: Reports + Dashboard ✅
- Dashboard API (KPI + charts)
- Sales reports (daily/weekly/monthly/custom)
- Product-wise, category-wise, user-wise
- Purchase report
- Inventory report
- Finance report

### PHASE 10: Notification + Audit + Settings ✅
- Notification service (low stock, expiry, due)
- Audit log complete
- Setting model + CRUD
- 12 default settings

---

**Total: 10 phases ✅ ALL COMPLETE**

---

## 12. Appendix

### 12.1 Constants

**Roles:**
```js
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  PHARMACIST: 'pharmacist',
  CASHIER: 'cashier',
  ACCOUNTANT: 'accountant'
};
```

**Stock Movement Types:**
```js
PURCHASE, SALE, SALE_RETURN, PURCHASE_RETURN,
DAMAGE, EXPIRED, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT
```

**Payment Methods:**
```js
cash, card, bank, mobile, other
```

**Statuses:**
```js
active, inactive, suspended,
pending, completed, cancelled,
paid, partial, due,
expired, damaged, depleted
```

### 12.2 Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| NODE_ENV | No | development |
| PORT | No | 5000 |
| MONGODB_URI | **Yes** | - |
| JWT_SECRET | **Yes** | - |
| JWT_EXPIRES_IN | No | 15m |
| JWT_REFRESH_SECRET | **Yes** | - |
| JWT_REFRESH_EXPIRES_IN | No | 7d |
| BCRYPT_SALT_ROUNDS | No | 10 |
| CORS_ORIGIN | No | http://localhost:3000 |
| CLOUDINARY_CLOUD_NAME | **Yes** | - |
| CLOUDINARY_API_KEY | **Yes** | - |
| CLOUDINARY_API_SECRET | **Yes** | - |

### 12.3 Default Settings (Seed)

| Key | Value | Category |
|-----|-------|----------|
| invoice_prefix | SL | invoice |
| purchase_prefix | PU | invoice |
| sales_return_prefix | SR | invoice |
| purchase_return_prefix | PR | invoice |
| expiry_threshold_days | 30 | expiry |
| currency | BDT | general |
| currency_symbol | ৳ | general |
| low_stock_alert | true | notification |
| expiry_alert | true | notification |
| company_name | My Pharmacy | business |
| company_address | Dhanmondi, Dhaka | business |
| company_phone | +8801700000000 | business |

### 12.4 Invoice Number Formats

| Type | Prefix | Example |
|------|--------|---------|
| Sale | SL | SL-00001 |
| Purchase | PU | PU-00001 |
| Sales Return | SR | SR-00001 |
| Purchase Return | PR | PR-00001 |
| Customer Payment | PM | PM-00001 |
| Supplier Payment | SM | SM-00001 |
| Expense | EX | EX-00001 |

### 12.5 Seed Data Summary

| Item | Count |
|------|-------|
| Roles | 5 |
| Settings | 12 |
| Organization | 1 |
| Branch | 1 |
| Admin User | 1 |
| Categories | 4 |
| Brands | 4 |
| Generics | 4 |
| Units | 3 |
| Medicines | 4 |
| Suppliers | 3 |
| Customers | 3 + 1 walk-in |
| Expenses | 4 |

### 12.6 Default Login

```
Email:    admin@pharmacy.com
Password: Admin@123
```

### 12.7 Glossary

| Term | Meaning |
|------|---------|
| FEFO | First Expiry, First Out |
| RBAC | Role-Based Access Control |
| JWT | JSON Web Token |
| CRUD | Create, Read, Update, Delete |
| ODM | Object Data Modeling (Mongoose) |
| COGS | Cost of Goods Sold |
| POS | Point of Sale |
| Batch | Medicine er specific lot with expiry |
| Snapshot | Historical data copy |
| Atomic | All-or-nothing operation |
| Rollback | Transaction fail hole sob undo |
| Session | MongoDB transaction context |
| TTL | Time To Live (auto-delete) |
| Payable | Supplier ke dite hobe |
| Due | Customer theke pabo |
| Walk-in | Customer without account |

### 12.8 Final Architectural Rules

**Golden Rules:**
1. Business logic **service e**, controller e nai
2. Stock change **shudhu inventoryService** diye
3. Payment **shudhu paymentService** diye
4. Audit log **shudhu auditService** diye
5. Multi-collection operation e **transaction**
6. **Snapshot** historical data
7. **FEFO** batch selection
8. Invoice number **atomic increment**
9. **Consistent** response format
10. **Consistent** error handling

**Central Business Flow:**
```
Supplier → Purchase → Batch → Inventory → Sale → Customer → Payment → Profit
Batch → Expiry → Stock Movement → Audit
```

**Never Allow:**
- ❌ Sale created but stock not decreased
- ❌ Stock decreased but sale does not exist
- ❌ Payment recorded but due not updated
- ❌ Historical data changed by master data
- ❌ Direct stock modification outside inventory service
- ❌ Hardcoded permissions in controllers
- ❌ Secrets in code

---

## ✅ Document Complete

**Total Sections:** 12
**Total Models:** 25
**Total Services:** 27
**Total Controllers:** 26
**Total Routes:** 26
**Total APIs:** 25 modules
**Total Roles:** 5
**Total Phases:** 10 (ALL COMPLETE ✅)

**End of ARCHITECTURE.md**