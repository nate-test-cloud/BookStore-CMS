# BookStore CMS - Database Schema

## Overview

The BookStore CMS uses PostgreSQL with Prisma ORM. This document outlines the complete database schema with relationships, indexes, and design decisions.

## Core Design Principles

1. **Normalization**: Follows BCNF to prevent anomalies
2. **Relationships**: Proper foreign keys with CASCADE deletes where appropriate
3. **Soft Deletes**: Support for data retention via `deletedAt` field
4. **Audit Trail**: Timestamps and user tracking for compliance
5. **Indexes**: Strategic indexing for query performance
6. **Scalability**: Design supports horizontal and vertical scaling

## Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         AUTH SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│  User (id, email, username, passwordHash, role, ...)           │
│  RefreshToken (id, token, userId, expiresAt, revokedAt)        │
│  EmailVerification (id, email, token, expiresAt, verified)      │
│  PasswordReset (id, email, token, expiresAt, usedAt)           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      INVENTORY SYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│  Book (id, isbn, title, categoryId, publisherId, ...)          │
│  Category (id, name, slug, parentId)  ◄── Self-referencing    │
│  Author (id, name, bio, born)                                  │
│  Publisher (id, name, email, phone, ...)                       │
│  BookAuthor (bookId, authorId)  ◄── Many-to-many             │
│  Inventory (id, bookId, location, quantity, lastRestockDate)  │
│  InventoryAdjustment (id, inventoryId, quantity, adjustmentType) │
│  LowStockAlert (id, bookId, threshold, isActive)              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       ORDER SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│  Order (id, userId, orderNumber, status, paymentMethod, ...)  │
│  OrderItem (id, orderId, bookId, quantity, unitPrice, ...)    │
│  Transaction (id, orderId, userId, amount, status, ...)       │
│  Return (id, orderId, reason, status, refundAmount, ...)      │
│  Invoice (id, orderId, invoiceNumber, total, ...)             │
│  Coupon (id, code, discountType, discountValue, ...)          │
│  Promotion (id, name, discountType, discountValue, ...)       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      CUSTOMER SYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│  Customer (id, userId, loyaltyTier, totalSpent, ...)           │
│  LoyaltyAccount (id, userId, points, tier, membershipExpiry)   │
│  Address (id, userId, type, street, city, isDefault)          │
│  WishlistItem (id, userId, bookId)                            │
│  CartItem (id, userId, bookId, quantity)                      │
│  Review (id, bookId, userId, rating, content, isVerified)     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SUPPLIER SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│  Supplier (id, name, email, phone, address, gstNumber, ...)   │
│  PurchaseOrder (id, supplierId, poNumber, status, ...)        │
│  PurchaseOrderItem (id, poId, bookId, quantity, unitCost, ...) │
│  RestockRequest (id, bookId, supplierId, status, ...)         │
│  SupplierPayment (id, supplierId, amount, paymentDate, ...)   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICS SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│  DailySalesReport (id, date, totalSales, totalOrders, ...)    │
│  InventoryValuation (id, date, totalBooks, totalValue, ...)   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    SETTINGS & AUDIT                             │
├─────────────────────────────────────────────────────────────────┤
│  StoreSettings (id, storeName, gstRate, currency, address, ...) │
│  AuditLog (id, userId, action, entity, entityId, changes, ...) │
│  ApiKey (id, name, key, secret, isActive, lastUsedAt)         │
└─────────────────────────────────────────────────────────────────┘
```

## Tables

### 1. User Management

#### User
```sql
CREATE TABLE User (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  fullName TEXT NOT NULL,
  passwordHash TEXT NOT NULL,
  phoneNumber TEXT,
  profileImage TEXT,  -- Cloudinary URL
  role UserRole NOT NULL DEFAULT 'CUSTOMER',
  isActive BOOLEAN NOT NULL DEFAULT true,
  isEmailVerified BOOLEAN NOT NULL DEFAULT false,
  emailVerifiedAt TIMESTAMP,
  lastLoginAt TIMESTAMP,
  twoFactorEnabled BOOLEAN NOT NULL DEFAULT false,
  twoFactorSecret TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  deletedAt TIMESTAMP  -- Soft delete
);

-- Indexes
CREATE INDEX User_email_idx ON User(email);
CREATE INDEX User_role_idx ON User(role);
CREATE INDEX User_isActive_idx ON User(isActive);
```

**Relationships**:
- One User → Many RefreshTokens
- One User → Many Orders
- One User → Many Reviews
- One User → One LoyaltyAccount

#### RefreshToken
```sql
CREATE TABLE RefreshToken (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  userId TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  revokedAt TIMESTAMP,  -- NULL = active, set = revoked
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

CREATE INDEX RefreshToken_userId_idx ON RefreshToken(userId);
CREATE INDEX RefreshToken_token_idx ON RefreshToken(token);
```

### 2. Inventory System

#### Book
```sql
CREATE TABLE Book (
  id TEXT PRIMARY KEY,
  isbn TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  coverImage TEXT,  -- Cloudinary URL
  pages INT,
  format BookFormat NOT NULL DEFAULT 'PAPERBACK',
  language TEXT NOT NULL DEFAULT 'English',
  edition TEXT NOT NULL DEFAULT '1st',
  publicationDate TIMESTAMP,
  
  categoryId TEXT NOT NULL,
  publisherId TEXT,
  
  basePrice FLOAT NOT NULL,
  discountPercent FLOAT NOT NULL DEFAULT 0,
  currentPrice FLOAT NOT NULL,  -- Calculated: basePrice * (1 - discount/100)
  
  stock INT NOT NULL DEFAULT 0,
  reservedStock INT NOT NULL DEFAULT 0,
  minimumStock INT NOT NULL DEFAULT 10,
  shelfLocation TEXT,
  
  isActive BOOLEAN NOT NULL DEFAULT true,
  views INT NOT NULL DEFAULT 0,
  rating FLOAT NOT NULL DEFAULT 0,
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  deletedAt TIMESTAMP,
  
  FOREIGN KEY (categoryId) REFERENCES Category(id),
  FOREIGN KEY (publisherId) REFERENCES Publisher(id)
);

-- Indexes
CREATE INDEX Book_isbn_idx ON Book(isbn);
CREATE INDEX Book_categoryId_idx ON Book(categoryId);
CREATE INDEX Book_publisherId_idx ON Book(publisherId);
CREATE INDEX Book_isActive_idx ON Book(isActive);
CREATE INDEX Book_barcode_idx ON Book(barcode);
```

**Design Notes**:
- `currentPrice` is denormalized for query efficiency
- `stock` tracks total available quantity
- `minimumStock` used for low-stock alerts
- `views` tracks popular books

#### Category
```sql
CREATE TABLE Category (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,  -- URL-friendly
  description TEXT,
  parentId TEXT,  -- Self-reference for hierarchy
  image TEXT,
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  
  FOREIGN KEY (parentId) REFERENCES Category(id)
);

CREATE INDEX Category_slug_idx ON Category(slug);
CREATE INDEX Category_parentId_idx ON Category(parentId);
```

**Design Notes**:
- Supports category hierarchy (Fiction > Sci-Fi > Cyberpunk)
- `slug` used for SEO-friendly URLs

#### Author
```sql
CREATE TABLE Author (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  born TIMESTAMP,
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL
);

-- Many-to-many relationship with Book
CREATE TABLE BookAuthor (
  bookId TEXT NOT NULL,
  authorId TEXT NOT NULL,
  
  PRIMARY KEY (bookId, authorId),
  FOREIGN KEY (bookId) REFERENCES Book(id) ON DELETE CASCADE,
  FOREIGN KEY (authorId) REFERENCES Author(id) ON DELETE CASCADE
);
```

#### Inventory
```sql
CREATE TABLE Inventory (
  id TEXT PRIMARY KEY,
  bookId TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL,  -- Warehouse/shelf location
  quantity INT NOT NULL,
  lastRestockDate TIMESTAMP,
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  
  FOREIGN KEY (bookId) REFERENCES Book(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX Inventory_bookId_location_idx ON Inventory(bookId, location);
```

**Design Notes**:
- One-to-one with Book
- Supports tracking by location
- `lastRestockDate` tracks supply chain

#### InventoryAdjustment
```sql
CREATE TABLE InventoryAdjustment (
  id TEXT PRIMARY KEY,
  inventoryId TEXT NOT NULL,
  adjustmentType AdjustmentType NOT NULL,  -- PURCHASE, RETURN, DAMAGE, etc.
  quantity INT NOT NULL,
  reason TEXT,
  adjustedBy TEXT NOT NULL,
  notes TEXT,
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (inventoryId) REFERENCES Inventory(id) ON DELETE CASCADE,
  FOREIGN KEY (adjustedBy) REFERENCES User(id)
);

CREATE INDEX InventoryAdjustment_inventoryId_idx ON InventoryAdjustment(inventoryId);
CREATE INDEX InventoryAdjustment_adjustedBy_idx ON InventoryAdjustment(adjustedBy);
```

**Design Notes**:
- Immutable audit trail
- Tracks who made changes and why

### 3. Order System

#### Order
```sql
CREATE TABLE Order (
  id TEXT PRIMARY KEY,
  orderNumber TEXT UNIQUE NOT NULL,  -- Human-readable ID
  userId TEXT NOT NULL,
  
  orderType OrderType NOT NULL DEFAULT 'POS',  -- POS or ECOMMERCE
  status OrderStatus NOT NULL DEFAULT 'PENDING',
  
  subtotal FLOAT NOT NULL,
  taxAmount FLOAT NOT NULL DEFAULT 0,
  discountAmount FLOAT NOT NULL DEFAULT 0,
  totalAmount FLOAT NOT NULL,
  
  couponId TEXT,
  membershipDiscount FLOAT NOT NULL DEFAULT 0,
  
  paymentMethod PaymentMethod NOT NULL DEFAULT 'CASH',
  paymentStatus PaymentStatus NOT NULL DEFAULT 'UNPAID',
  paidAt TIMESTAMP,
  
  shippingAddress TEXT,
  shippingCost FLOAT NOT NULL DEFAULT 0,
  shippedAt TIMESTAMP,
  deliveredAt TIMESTAMP,
  
  notes TEXT,
  cancellationReason TEXT,
  cancelledAt TIMESTAMP,
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (couponId) REFERENCES Coupon(id)
);

-- Indexes
CREATE INDEX Order_userId_idx ON Order(userId);
CREATE INDEX Order_orderNumber_idx ON Order(orderNumber);
CREATE INDEX Order_status_idx ON Order(status);
CREATE INDEX Order_orderType_idx ON Order(orderType);
CREATE INDEX Order_createdAt_idx ON Order(createdAt);
```

**Design Notes**:
- `orderNumber` is human-readable (e.g., ORD-1704067200-ABC123)
- Pricing snapshot at order time
- Tracks complete order lifecycle

#### OrderItem
```sql
CREATE TABLE OrderItem (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  bookId TEXT NOT NULL,
  
  quantity INT NOT NULL,
  unitPrice FLOAT NOT NULL,  -- Snapshot of price at order time
  discount FLOAT NOT NULL DEFAULT 0,
  total FLOAT NOT NULL,
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (orderId) REFERENCES Order(id) ON DELETE CASCADE,
  FOREIGN KEY (bookId) REFERENCES Book(id)
);

CREATE INDEX OrderItem_orderId_idx ON OrderItem(orderId);
CREATE INDEX OrderItem_bookId_idx ON OrderItem(bookId);
```

**Design Notes**:
- `unitPrice` stored to handle price changes
- Allows order history to remain accurate

#### Transaction
```sql
CREATE TABLE Transaction (
  id TEXT PRIMARY KEY,
  transactionId TEXT UNIQUE NOT NULL,  -- For payment gateway reference
  orderId TEXT NOT NULL,
  userId TEXT NOT NULL,
  
  amount FLOAT NOT NULL,
  method PaymentMethod NOT NULL,
  status TransactionStatus NOT NULL,
  
  reference TEXT,  -- Bank reference, UPI ref, etc.
  notes TEXT,
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  
  FOREIGN KEY (orderId) REFERENCES Order(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES User(id)
);

CREATE INDEX Transaction_orderId_idx ON Transaction(orderId);
CREATE INDEX Transaction_userId_idx ON Transaction(userId);
CREATE INDEX Transaction_status_idx ON Transaction(status);
```

**Design Notes**:
- Tracks payment events
- `reference` links to external payment systems

### 4. Promotions

#### Coupon
```sql
CREATE TABLE Coupon (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  discountType DiscountType NOT NULL DEFAULT 'PERCENTAGE',
  discountValue FLOAT NOT NULL,
  maxDiscount FLOAT,  -- Cap for percentage discounts
  minPurchase FLOAT,  -- Minimum order value
  
  maxUses INT,  -- Global usage limit
  usageCount INT NOT NULL DEFAULT 0,
  maxUsesPerUser INT,  -- Per-user limit
  
  startDate TIMESTAMP NOT NULL,
  expiryDate TIMESTAMP NOT NULL,
  isActive BOOLEAN NOT NULL DEFAULT true,
  
  applicableBooks TEXT[],  -- Array of book IDs
  applicableCategories TEXT[],  -- Array of category IDs
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL
);

CREATE INDEX Coupon_code_idx ON Coupon(code);
CREATE INDEX Coupon_isActive_idx ON Coupon(isActive);
```

**Design Notes**:
- Flexible discount system (percentage or fixed)
- JSON arrays for applicable items
- Usage tracking built-in

### 5. Returns & Refunds

#### Return
```sql
CREATE TABLE Return (
  id TEXT PRIMARY KEY,
  returnNumber TEXT UNIQUE NOT NULL,
  orderId TEXT NOT NULL,
  
  reason ReturnReason NOT NULL,
  description TEXT,
  status ReturnStatus NOT NULL DEFAULT 'PENDING',
  
  refundAmount FLOAT NOT NULL,
  refundedAt TIMESTAMP,
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  
  FOREIGN KEY (orderId) REFERENCES Order(id) ON DELETE CASCADE
);

CREATE INDEX Return_orderId_idx ON Return(orderId);
CREATE INDEX Return_status_idx ON Return(status);
```

**Design Notes**:
- Separate from orders to maintain audit trail
- Workflow: PENDING → APPROVED → REFUNDED

### 6. Supplier Management

#### Supplier
```sql
CREATE TABLE Supplier (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  contactPerson TEXT,
  email TEXT,
  phone TEXT,
  
  address TEXT,
  city TEXT,
  state TEXT,
  postalCode TEXT,
  country TEXT,
  
  gstNumber TEXT,
  paymentTerms TEXT,  -- e.g., "Net 30"
  
  isActive BOOLEAN NOT NULL DEFAULT true,
  publisherId TEXT,  -- Link to publisher
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  
  FOREIGN KEY (publisherId) REFERENCES Publisher(id)
);

CREATE INDEX Supplier_email_idx ON Supplier(email);
CREATE INDEX Supplier_isActive_idx ON Supplier(isActive);
```

#### PurchaseOrder
```sql
CREATE TABLE PurchaseOrder (
  id TEXT PRIMARY KEY,
  poNumber TEXT UNIQUE NOT NULL,
  supplierId TEXT NOT NULL,
  
  status POStatus NOT NULL DEFAULT 'DRAFT',
  
  expectedDelivery TIMESTAMP,
  actualDelivery TIMESTAMP,
  
  totalAmount FLOAT NOT NULL,
  paymentStatus PaymentStatus NOT NULL DEFAULT 'UNPAID',
  
  notes TEXT,
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL,
  
  FOREIGN KEY (supplierId) REFERENCES Supplier(id)
);

CREATE INDEX PurchaseOrder_supplierId_idx ON PurchaseOrder(supplierId);
CREATE INDEX PurchaseOrder_status_idx ON PurchaseOrder(status);
```

### 7. Analytics

#### DailySalesReport
```sql
CREATE TABLE DailySalesReport (
  id TEXT PRIMARY KEY,
  date TIMESTAMP UNIQUE NOT NULL,
  
  totalSales FLOAT NOT NULL,
  totalOrders INT NOT NULL,
  totalItems INT NOT NULL,
  averageOrderValue FLOAT NOT NULL,
  
  cardPayments FLOAT NOT NULL,
  cashPayments FLOAT NOT NULL,
  upiPayments FLOAT NOT NULL,
  
  bestSellingBook TEXT,  -- Book ID
  
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL
);

CREATE INDEX DailySalesReport_date_idx ON DailySalesReport(date);
```

**Design Notes**:
- Pre-computed daily metrics for fast dashboards
- Can be refreshed nightly

## Enums

### UserRole
```
ADMIN              -- Full system access
MANAGER            -- Inventory, orders, analytics
CASHIER            -- POS operations
INVENTORY_STAFF    -- Inventory management
CUSTOMER           -- Store access
```

### OrderStatus
```
PENDING            -- Order created, not paid
PAID               -- Payment received
PROCESSING         -- Being prepared
SHIPPED            -- In transit
DELIVERED          -- Delivered
CANCELLED          -- Order cancelled
RETURNED           -- Returned/refunded
```

### PaymentStatus
```
UNPAID             -- Not paid
PAID               -- Fully paid
PARTIAL            -- Partially paid
REFUNDED           -- Refunded
FAILED             -- Payment failed
```

### AdjustmentType
```
PURCHASE           -- Restocking
RETURN             -- Customer return
DAMAGE             -- Damaged goods
LOSS               -- Lost/shrinkage
CORRECTION         -- Count correction
RECOUNT            -- Physical recount
```

## Performance Optimizations

### Indexes

Strategic indexes on:
- Foreign keys (automatic joins)
- Frequently searched fields (email, ISBN, orderNumber)
- Status fields (order_status, payment_status)
- Date fields (createdAt, for time-range queries)
- Business logic fields (isActive, category_id)

### Query Optimization

```sql
-- Good: Indexed query
SELECT * FROM Book WHERE isbn = '978-0451524935';

-- Good: Uses index on status
SELECT * FROM Order WHERE status = 'PAID' AND createdAt > NOW() - INTERVAL '30 days';

-- Avoid: Full table scan
SELECT * FROM Book WHERE LOWER(title) LIKE '%harry%';
-- Better: Use full-text search (Meilisearch)
```

### Denormalization Decisions

- `Book.currentPrice` - Avoids join for catalog display
- `Order` - Stores pricing snapshot - preserves history
- `DailySalesReport` - Pre-computed for dashboards

## Migrations

Database migrations are managed via Prisma:

```bash
# Create new migration
pnpm exec prisma migrate dev --name migration_name

# Apply migrations
pnpm exec prisma migrate deploy

# View migration status
pnpm exec prisma migrate status

# Reset database (dev only)
pnpm exec prisma migrate reset
```

## Backup & Recovery

### Backup

```bash
# Full database backup
pg_dump -U bookstore bookstore > backup.sql

# Compressed backup
pg_dump -U bookstore bookstore | gzip > backup.sql.gz
```

### Recovery

```bash
# Restore from backup
psql -U bookstore bookstore < backup.sql

# Restore from compressed
gunzip < backup.sql.gz | psql -U bookstore bookstore
```

## Compliance & Audit

- All data modifications tracked via `createdAt`, `updatedAt`
- User actions logged in `AuditLog` table
- Soft deletes preserve historical data
- Financial transactions immutable once recorded

---

For questions or schema improvements, refer to [ARCHITECTURE.md](./ARCHITECTURE.md).
