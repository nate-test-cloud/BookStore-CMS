# BookStore CMS - System Architecture

## Overview

BookStore CMS is a comprehensive, enterprise-grade bookstore management system built with modern technology stack designed for both retail POS operations and ecommerce capabilities.

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: TanStack React Query + Axios
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Caching**: Redis
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: class-validator + class-transformer
- **File Upload**: Cloudinary (configurable)
- **Search**: Meilisearch
- **Task Queue**: Bull (Redis-backed)
- **Logging**: Winston
- **API Docs**: Swagger

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx
- **Development**: Node.js 18+

## Application Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend (Next.js)                  │
│  - Pages, Components, Layouts               │
│  - API Client, Hooks, Stores                │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│    API Gateway (Nginx Reverse Proxy)        │
│  - Request routing, Load balancing          │
│  - SSL/TLS termination, Rate limiting       │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│      Backend API (NestJS)                   │
│  ┌─────────────────────────────────────┐    │
│  │      Controllers & Routes           │    │
│  ├─────────────────────────────────────┤    │
│  │   Services (Business Logic)         │    │
│  │  - Auth, Inventory, Orders, etc     │    │
│  ├─────────────────────────────────────┤    │
│  │  Repositories & Data Access Layer   │    │
│  │  - Prisma client, queries           │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │  Cross-cutting Concerns             │    │
│  │  - Auth Guards, Validation          │    │
│  │  - Error Handling, Logging          │    │
│  │  - Caching, Rate Limiting           │    │
│  └─────────────────────────────────────┘    │
└────────────────────┬────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼─────┐ ┌────▼─────┐ ┌──▼──────┐
   │ PostgreSQL│ │  Redis   │ │ Search  │
   │ Database  │ │ (Cache)  │ │Service  │
   └───────────┘ └──────────┘ └─────────┘
```

## Database Schema

### Core Entities

**Users**
- Admin, Manager, Cashier, Inventory Staff, Customer roles
- Email verification, password reset
- JWT tokens storage for refresh

**Books**
- Title, ISBN, barcode, edition
- Category, Author, Publisher relationships
- Price, discount, stock tracking
- Cover image (Cloudinary)
- Shelf/rack location

**Inventory**
- Stock tracking per location
- Adjustment logs with audit trail
- Low stock alerts

**Orders**
- POS orders (in-store)
- Ecommerce orders
- Order items with pricing snapshots
- Status workflow: Pending → Paid → Shipped → Delivered

**Customers**
- Profiles with purchase history
- Loyalty points
- Membership tiers
- Wishlist items
- Preferences

**Transactions**
- Payment records
- Refunds and returns
- Invoice generation

**Suppliers & Procurement**
- Supplier management
- Purchase orders
- Restock requests

## Module Structure

### 1. **Auth Module**
- User registration/login
- JWT authentication with refresh tokens
- Password reset workflow
- Email verification
- RBAC implementation
- 2FA support

### 2. **Inventory Module**
- CRUD operations for books
- Batch import/export
- Stock management
- Low-stock alerts
- Barcode generation and scanning
- Location tracking

### 3. **POS Module**
- Fast checkout interface
- Barcode scanning
- Discount/coupon application
- Multiple payment methods
- Invoice generation
- Refund handling

### 4. **Order Module**
- Order lifecycle management
- Status tracking
- Shipment management
- Return/cancellation workflows
- Invoice management

### 5. **Customer Module**
- Profile management
- Loyalty program
- Purchase history
- Preferences & recommendations
- Notifications

### 6. **Analytics Module**
- Sales metrics
- Revenue analysis
- Inventory valuation
- Customer analytics
- Staff performance
- Report generation

### 7. **Supplier Module**
- Supplier management
- Purchase orders
- Procurement tracking
- Payment management

### 8. **Search Module**
- Full-text search via Meilisearch
- ISBN/title/author indexing
- Typo tolerance

## Authentication Flow

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ POST /auth/login
       ▼
┌──────────────────────────┐
│   Auth Controller        │
│  - Validate credentials  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│   Auth Service           │
│  - Hash check            │
│  - JWT generation        │
└──────┬───────────────────┘
       │
       ▼ Response
┌──────────────────────────┐
│ Frontend                 │
│ - Store tokens           │
│ - Set Authorization      │
│   header                 │
└──────────────────────────┘

Refresh Token Rotation:
- Access token (15 min expiry)
- Refresh token (7 day expiry, rotated on use)
- Tokens stored in HttpOnly cookies (secure)
```

## Security Architecture

1. **Authentication**
   - JWT with HS256/RS256
   - Refresh token rotation
   - HttpOnly, Secure cookies

2. **Authorization**
   - Role-based access control (RBAC)
   - Route guards
   - Permission decorators

3. **Data Protection**
   - Password hashing (bcrypt)
   - Input validation with Zod
   - SQL injection prevention (Prisma ORM)
   - XSS protection (React built-in)

4. **API Security**
   - Rate limiting
   - CORS configuration
   - Helmet middleware
   - CSRF tokens
   - Request validation

5. **Audit Trail**
   - User action logging
   - Inventory change logs
   - Payment transaction records
   - Admin activity monitoring

## File Upload Strategy

- **Cover Images**: Cloudinary (CDN, resizing, optimization)
- **Documents**: S3-compatible storage
- **CSV Imports**: Local temporary storage with validation

## Caching Strategy

```
Cache Layers:
1. Browser Cache (Static assets, images)
2. Redis Cache
   - Book catalog (24 hours)
   - Customer data (6 hours)
   - Leaderboards (1 hour)
   - Session data (TTL from JWT)
3. Database Query Cache
```

## Deployment Architecture

```
Internet
  │
  └─► Nginx (Reverse Proxy, Load Balancer, SSL)
       │
       ├─► Backend API (Docker container)
       │    └─► Port 3000
       │
       ├─► Frontend (Next.js, Docker container)
       │    └─► Port 3001
       │
       └─► Services
            ├─► PostgreSQL (Port 5432)
            ├─► Redis (Port 6379)
            └─► Meilisearch (Port 7700)
```

## Directory Structure

```
BookStore-CMS/
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/              # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── inventory/
│   │   │   │   ├── orders/
│   │   │   │   ├── customers/
│   │   │   │   ├── analytics/
│   │   │   │   └── ...
│   │   │   ├── common/               # Guards, interceptors, middleware
│   │   │   ├── database/             # Prisma client
│   │   │   ├── config/               # Configuration
│   │   │   ├── utils/                # Helper functions
│   │   │   └── main.ts               # Entry point
│   │   ├── prisma/                   # Database schema & migrations
│   │   └── package.json
│   │
│   ├── web/                          # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   │   ├── (auth)/           # Auth pages group
│   │   │   │   ├── admin/            # Admin dashboard
│   │   │   │   ├── pos/              # POS interface
│   │   │   │   ├── store/            # Ecommerce storefront
│   │   │   │   └── ...
│   │   │   ├── components/           # Reusable UI components
│   │   │   │   ├── admin/
│   │   │   │   ├── pos/
│   │   │   │   └── common/
│   │   │   ├── lib/                  # Utilities
│   │   │   │   ├── api.ts            # API client
│   │   │   │   ├── hooks.ts          # Custom hooks
│   │   │   │   └── utils.ts
│   │   │   ├── stores/               # Zustand stores
│   │   │   ├── types/                # Shared types
│   │   │   └── styles/               # Global styles
│   │   └── package.json
│   │
│   └── shared/                       # Shared types & utilities
│       ├── types/                    # DTOs, interfaces
│       └── constants/                # Shared constants
│
├── packages/                         # Shared packages (optional)
│   └── eslint-config/
│
├── infra/                            # Infrastructure & deployment
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.web
│   │   └── nginx.conf
│   └── docker-compose.yml
│
└── docs/
    ├── API.md                        # API documentation
    ├── DATABASE.md                   # Database schema
    └── DEPLOYMENT.md                 # Deployment guide
```

## Development Workflow

1. **Local Development**
   - Docker Compose for services (DB, Redis, Meilisearch)
   - HMR on frontend and backend
   - Seed script for test data

2. **Testing**
   - Unit tests with Jest
   - E2E tests with Playwright
   - API integration tests

3. **CI/CD**
   - GitHub Actions (template provided)
   - Docker image builds
   - Automated tests
   - Staging deployment

4. **Production**
   - Docker Compose deployment
   - Environment variable configuration
   - Health checks
   - Monitoring and logging

## Performance Optimizations

1. **Database**
   - Indexed queries for fast lookups
   - Connection pooling
   - Query optimization

2. **Backend**
   - Caching with Redis
   - Pagination for large datasets
   - Compression middleware

3. **Frontend**
   - Code splitting
   - Image optimization
   - CSS-in-JS optimization
   - Lazy loading

4. **Search**
   - Meilisearch indexing
   - Incremental sync

## Scalability Considerations

1. **Horizontal Scaling**
   - Stateless backend services
   - Load balancing via Nginx
   - Distributed session via Redis

2. **Database Scaling**
   - Read replicas for queries
   - Sharding strategy (by tenant/region)
   - Archive old data

3. **Search Scaling**
   - Meilisearch clustering
   - Multi-index strategy

## Error Handling & Logging

1. **Global Exception Filter**
   - Catches all exceptions
   - Formatted error responses
   - Logging integration

2. **Logging Strategy**
   - Winston logger with levels
   - Structured logs (JSON)
   - Log aggregation ready

3. **Monitoring Points**
   - API response times
   - Error rates
   - Database query performance
   - Cache hit rates

## Next Steps

See individual module documentation for:
- API endpoints and schemas
- Database queries
- Frontend component specifications
- Deployment procedures
