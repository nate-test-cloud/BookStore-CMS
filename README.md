# BookStore CMS - Enterprise Bookstore Management System

A comprehensive, production-ready bookstore management system built with modern technologies. Combines retail POS operations with full ecommerce capabilities, inventory management, analytics, and multi-user workflows.

## ✨ Key Features

### Core Functionality

- **Authentication & Authorization**: JWT-based auth with refresh tokens, role-based access control (RBAC)
- **Inventory Management**: Book catalog with authors, publishers, categories, stock tracking, barcode support
- **Point of Sale (POS)**: Fast checkout, barcode scanning, multiple payment methods, receipts
- **Order Management**: POS and ecommerce orders, returns/refunds, invoice generation
- **Customer Management**: Profiles, loyalty program, purchase history, preferences
- **Ecommerce Storefront**: Product browsing, search, cart, checkout, reviews
- **Analytics Dashboard**: Sales metrics, inventory valuation, customer analytics
- **Supplier Management**: Purchase orders, supplier tracking, procurement analytics

### Technical Highlights

- 🏗️ **Enterprise Architecture**: Modular, scalable, production-ready
- 🔐 **Security**: JWT authentication, role-based access, input validation, CORS
- 📦 **Containerized**: Docker Compose setup for all services
- 🗄️ **Database**: PostgreSQL with Prisma ORM, comprehensive schema
- ⚡ **Caching**: Redis for performance optimization
- 🔍 **Search**: Meilisearch for fast, typo-tolerant book search
- 📊 **Analytics**: Built-in reporting and dashboards
- 🚀 **Deployment-Ready**: Nginx reverse proxy, health checks, monitoring

## 🛠️ Tech Stack

### Frontend

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - Beautiful React components
- **Zustand** - Lightweight state management
- **React Query** - Data fetching and caching
- **Zod** - Schema validation

### Backend

- **NestJS** - Node.js enterprise framework
- **TypeScript** - Type-safe backend
- **Prisma** - Next-gen ORM
- **PostgreSQL** - Relational database
- **Redis** - In-memory cache
- **Meilisearch** - Search engine
- **JWT** - Authentication

### DevOps

- **Docker** - Containerization
- **Docker Compose** - Service orchestration
- **Nginx** - Reverse proxy and load balancing
- **GitHub Actions** - CI/CD ready

## 📋 Project Structure

```
BookStore-CMS/
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # Authentication
│   │   │   │   ├── inventory/        # Book & inventory management
│   │   │   │   ├── orders/           # Orders & transactions
│   │   │   │   ├── customers/        # Customer management
│   │   │   │   ├── analytics/        # Analytics & reporting
│   │   │   │   └── suppliers/        # Supplier management
│   │   │   ├── database/             # Prisma setup
│   │   │   ├── config/               # Configuration
│   │   │   └── main.ts               # Entry point
│   │   ├── prisma/                   # Database schema & migrations
│   │   └── package.json
│   │
│   └── web/                          # Next.js Frontend
│       ├── src/
│       │   ├── app/                  # App Router pages
│       │   │   ├── (auth)/           # Authentication
│       │   │   ├── admin/            # Admin dashboard
│       │   │   ├── pos/              # POS interface
│       │   │   ├── store/            # Ecommerce store
│       │   │   └── ...
│       │   ├── components/           # React components
│       │   ├── lib/                  # Utilities
│       │   ├── stores/               # Zustand stores
│       │   └── types/                # TypeScript types
│       └── package.json
│
├── infra/
│   ├── docker-compose.yml            # Service orchestration
│   └── docker/
│       ├── Dockerfile.api            # Backend image
│       ├── Dockerfile.web            # Frontend image
│       └── nginx.conf                # Nginx configuration
│
├── docs/
│   ├── ARCHITECTURE.md               # System architecture
│   ├── DATABASE.md                   # Database schema
│   └── DEPLOYMENT.md                 # Deployment guide
│
└── README.md                          # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- pnpm (recommended) or npm

### Development Setup

1. **Clone and install**:
   ```bash
   git clone <repository>
   cd BookStore-CMS
   pnpm install
   ```

2. **Start services**:
   ```bash
   cd infra
   docker-compose up -d
   ```

3. **Setup database**:
   ```bash
   cd apps/api
   pnpm exec prisma migrate dev
   pnpm exec prisma db seed
   ```

4. **Start development servers**:
   
   Backend:
   ```bash
   cd apps/api
   pnpm run start:dev
   ```
   
   Frontend:
   ```bash
   cd apps/web
   pnpm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:3001
   - API: http://localhost:3000/api/v1
   - API Docs: http://localhost:3000/api/docs

### Default Users (for testing)

| Email | Password | Role |
|-------|----------|------|
| admin@bookstore.com | Admin@123 | Admin |
| manager@bookstore.com | Manager@123 | Manager |
| cashier@bookstore.com | Cashier@123 | Cashier |
| customer@bookstore.com | Customer@123 | Customer |

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Inventory
- `GET /api/v1/inventory/books` - List books
- `POST /api/v1/inventory/books` - Create book
- `GET /api/v1/inventory/books/:id` - Get book details
- `PUT /api/v1/inventory/books/:id` - Update book
- `DELETE /api/v1/inventory/books/:id` - Delete book
- `GET /api/v1/inventory/categories` - List categories
- `POST /api/v1/inventory/books/:id/adjust` - Adjust inventory

### Orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - List orders
- `GET /api/v1/orders/:id` - Get order details
- `PUT /api/v1/orders/:id/status` - Update order status
- `POST /api/v1/orders/:id/returns` - Create return request

### Coupons
- `POST /api/v1/orders/coupons` - Create coupon
- `GET /api/v1/orders/coupons` - List coupons
- `POST /api/v1/orders/coupons/validate` - Validate coupon

See [API Documentation](http://localhost:3000/api/docs) for complete endpoint details.

## 🔐 Authentication

### JWT Flow

1. User logs in with credentials
2. Server validates and returns `accessToken` + `refreshToken`
3. Client stores tokens (HttpOnly cookies recommended)
4. Client includes `Authorization: Bearer <token>` in requests
5. When token expires, use refresh token to get new access token

### Role-Based Access Control

Roles with permissions:

| Role | Permissions |
|------|-------------|
| ADMIN | Full system access, user management, settings |
| MANAGER | Inventory, orders, analytics, reports |
| CASHIER | POS operations, order creation, returns |
| INVENTORY_STAFF | Inventory management, stock adjustments |
| CUSTOMER | Browse store, place orders, view history |

## 📊 Database

The system uses a comprehensive PostgreSQL schema with:

- **Users**: Multi-role user system with authentication
- **Books**: Full book catalog with metadata
- **Inventory**: Stock tracking with locations
- **Orders**: POS and ecommerce orders
- **Customers**: Customer profiles and loyalty
- **Suppliers**: Supplier and procurement management
- **Analytics**: Sales and inventory reports

See [DATABASE.md](./DATABASE.md) for detailed schema.

## 🐳 Docker Deployment

### Local Development

```bash
cd infra
docker-compose up -d
```

Services start on:
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Meilisearch: localhost:7700
- API: localhost:3000
- Web: localhost:3001

### Production Deployment

```bash
# Set environment variables
export JWT_SECRET="your-production-secret"
export DATABASE_URL="prod-database-url"

# Start services
docker-compose -f infra/docker-compose.yml up -d

# Run migrations
docker exec bookstore_api pnpm exec prisma migrate deploy
```

Access via Nginx reverse proxy on port 80/443.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📈 Performance

- **Database**: Indexed queries, connection pooling
- **Caching**: Redis for books, customers, leaderboards
- **Search**: Meilisearch for full-text search with typo tolerance
- **Frontend**: Code splitting, lazy loading, image optimization
- **API**: Response compression, rate limiting, pagination

## 🔍 Search

Full-text search via Meilisearch supports:
- ISBN, title, author search
- Typo tolerance
- Fuzzy matching
- Fast incremental indexing

Example:
```bash
GET /api/v1/search?q=harry+potter
```

## 🛡️ Security

- Password hashing with bcrypt
- JWT authentication with refresh token rotation
- Input validation with class-validator
- SQL injection protection via Prisma ORM
- XSS protection (React built-in)
- CORS configuration
- Rate limiting
- Helmet.js security headers
- Audit logging

## 📝 Environment Variables

Key variables (see `.env.example` for complete list):

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Authentication
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Services
REDIS_URL=redis://localhost:6379
MEILISEARCH_URL=http://localhost:7700

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
FRONTEND_URL=http://localhost:3001
```

## 🧪 Testing

### Backend Tests

```bash
cd apps/api
pnpm run test                # Unit tests
pnpm run test:watch         # Watch mode
pnpm run test:cov           # Coverage
pnpm run test:e2e           # E2E tests
```

### Frontend Tests

```bash
cd apps/web
pnpm run test               # Jest tests
pnpm run e2e               # Playwright E2E
```

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and architecture
- [DATABASE.md](./DATABASE.md) - Database schema and design
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment and operations
- [API Documentation](http://localhost:3000/api/docs) - Interactive Swagger docs

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/description`
2. Commit changes: `git commit -m "feat: description"`
3. Push branch: `git push origin feature/description`
4. Create Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🎯 Roadmap

- [ ] Multi-store support
- [ ] Advanced analytics with ML recommendations
- [ ] Mobile app (React Native)
- [ ] AI-powered customer recommendations
- [ ] Real-time inventory sync
- [ ] Offline POS mode
- [ ] Multi-tenant architecture
- [ ] GraphQL API
- [ ] Event-driven architecture

## 🆘 Support

For issues, questions, or suggestions:

1. Check [existing issues](https://github.com/yourrepo/issues)
2. Create a detailed issue
3. Include steps to reproduce
4. Provide environment details

## 🙏 Acknowledgments

Built with love using modern, battle-tested technologies.

---

**Happy coding! 🚀**
