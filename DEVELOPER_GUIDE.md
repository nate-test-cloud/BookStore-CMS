# BookStore CMS - Developer Quick Reference

## 🚀 Getting Started (5 minutes)

### 1. Clone & Install
```bash
git clone <repository> bookstore
cd bookstore
pnpm install
```

### 2. Start Services
```bash
cd infra
docker-compose up -d
```

### 3. Initialize Database
```bash
cd ../apps/api
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

### 4. Start Servers
```bash
# Terminal 1: Backend
cd apps/api
pnpm run start:dev

# Terminal 2: Frontend
cd apps/web
pnpm run dev
```

### 5. Access Applications
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3000/api/v1
- **API Docs**: http://localhost:3000/api/docs
- **Database**: localhost:5432 (postgres/bookstore)

---

## 🧠 Architecture at a Glance

### Backend Structure
```
api/
├── src/
│   ├── main.ts                 # App bootstrap
│   ├── app.module.ts           # Root module (imports all)
│   ├── database/               # Prisma setup
│   ├── config/                 # Environment & settings
│   └── modules/
│       ├── auth/               # JWT, RBAC, security
│       ├── inventory/          # Books, categories, stock
│       ├── orders/             # POS, ecommerce, returns
│       ├── customers/          # (TODO) Profiles, loyalty
│       ├── analytics/          # (TODO) Reports, metrics
│       └── suppliers/          # (TODO) Procurement
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
└── package.json
```

### Key Dependencies
```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/jwt": "^12.0.1",
  "@prisma/client": "^5.8.0",
  "bcrypt": "^5.1.1",
  "class-validator": "^0.14.0",
  "passport-jwt": "^4.0.1"
}
```

---

## 📝 Creating New Modules

### Step-by-Step Example: Customer Module

#### 1. Generate Module Files
```bash
cd apps/api
nest g module modules/customers
nest g service modules/customers
nest g controller modules/customers
```

#### 2. Create DTOs
```typescript
// src/modules/customers/dto/customer.dto.ts
export class CreateCustomerDto {
  @IsString()
  userId: string;
  
  @IsOptional()
  @IsString()
  companyName?: string;
}
```

#### 3. Implement Service
```typescript
// src/modules/customers/customers.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async createCustomer(createDto: CreateCustomerDto) {
    return this.prisma.customer.create({
      data: createDto,
    });
  }
}
```

#### 4. Create Controller
```typescript
// src/modules/customers/customers.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomersService } from './customers.service';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private service: CustomersService) {}

  @Post()
  async create(@Body() dto: CreateCustomerDto) {
    return this.service.createCustomer(dto);
  }
}
```

#### 5. Update Module
```typescript
// src/modules/customers/customers.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
```

#### 6. Add to App Module
```typescript
// src/app.module.ts - Add to imports
import { CustomersModule } from './modules/customers/customers.module';

@Module({
  imports: [
    // ... existing imports
    CustomersModule,  // Add this
  ],
})
export class AppModule {}
```

---

## 🔐 Authentication Usage

### Protecting Routes with JWT

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return user; // { userId, email, role }
  }
}
```

### Role-Based Access

```typescript
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Post()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
async deleteUser(@Param('id') id: string) {
  // Only ADMIN and MANAGER can access
  return this.service.deleteUser(id);
}
```

### Login/Signup Flow

```typescript
// Client
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@bookstore.com',
    password: 'Admin@123'
  })
});

const { accessToken, refreshToken } = await response.json();

// Use accessToken in subsequent requests
fetch('http://localhost:3000/api/v1/inventory/books', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## 💾 Database Operations

### Common Prisma Queries

```typescript
// Create
const book = await this.prisma.book.create({
  data: {
    isbn: '978-0451524935',
    title: '1984',
    categoryId: 'cat-123',
    basePrice: 599,
    stock: 50,
  },
});

// Read
const book = await this.prisma.book.findUnique({
  where: { id: 'book-123' },
  include: { category: true, authors: true }, // Join relations
});

// Update
const updated = await this.prisma.book.update({
  where: { id: 'book-123' },
  data: { stock: 45 },
});

// Delete (Soft)
await this.prisma.book.update({
  where: { id: 'book-123' },
  data: { deletedAt: new Date() },
});

// Query with filters
const books = await this.prisma.book.findMany({
  where: {
    deletedAt: null,
    category: { name: 'Fiction' },
    stock: { gte: 10 }, // Greater than or equal
  },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit,
});
```

### Migrations

```bash
# After modifying schema.prisma
pnpm exec prisma migrate dev --name description

# Seed database
pnpm exec prisma db seed

# Reset database (dev only!)
pnpm exec prisma migrate reset

# View migrations
pnpm exec prisma migrate status
```

---

## 🧪 API Endpoint Patterns

### Inventory Endpoints

```bash
# Create book
POST /api/v1/inventory/books
{
  "isbn": "978-0451524935",
  "title": "1984",
  "categoryId": "cat-123",
  "authorIds": ["auth-1"],
  "basePrice": 599,
  "stock": 50
}

# List books (paginated)
GET /api/v1/inventory/books?page=1&limit=20&search=harry

# Get single book
GET /api/v1/inventory/books/book-123

# Update book
PUT /api/v1/inventory/books/book-123
{ "title": "1984 (New Edition)" }

# Delete book
DELETE /api/v1/inventory/books/book-123

# Adjust stock
POST /api/v1/inventory/books/book-123/adjust
{
  "quantity": 10,
  "adjustmentType": "PURCHASE",
  "reason": "Restocking from supplier"
}
```

### Order Endpoints

```bash
# Create order
POST /api/v1/orders
{
  "orderType": "POS",
  "items": [
    { "bookId": "book-123", "quantity": 2 },
    { "bookId": "book-456", "quantity": 1 }
  ],
  "paymentMethod": "CARD",
  "couponId": "coupon-123"
}

# List user's orders
GET /api/v1/orders?page=1&limit=20

# Get order details
GET /api/v1/orders/order-123

# Update order status
PUT /api/v1/orders/order-123/status
{ "status": "SHIPPED" }

# Create return
POST /api/v1/orders/order-123/returns
{
  "reason": "DEFECTIVE",
  "description": "Book arrived with torn pages"
}
```

---

## 🐛 Debugging & Troubleshooting

### Check Application Logs

```bash
# Backend logs
docker-compose logs -f api

# Database logs
docker-compose logs -f postgres

# Full stack
docker-compose logs -f
```

### Common Issues & Solutions

#### "Cannot find module '@prisma/client'"
```bash
cd apps/api
pnpm install
pnpm exec prisma generate
```

#### "Connection refused to database"
```bash
# Ensure Docker containers running
docker-compose ps

# Start if needed
docker-compose up -d

# Check database connection
docker exec bookstore_postgres psql -U bookstore -c "\l"
```

#### "Port already in use"
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

#### JWT token invalid
```bash
# Check JWT_SECRET in environment
cat apps/api/.env.development | grep JWT_SECRET

# Regenerate token by logging in again
```

---

## 📊 Testing

### Run Tests

```bash
# Unit tests
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage
pnpm run test:cov

# E2E tests
pnpm run test:e2e
```

### Example Test

```typescript
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, PrismaService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should hash password', async () => {
    const hash = await bcrypt.hash('password123', 10);
    expect(hash).toBeDefined();
    expect(hash).not.toEqual('password123');
  });
});
```

---

## 📦 Deployment Checklist

Before deploying to production:

- [ ] Environment variables set
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] Secrets properly secured
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Health checks verified
- [ ] Backups configured
- [ ] Monitoring setup
- [ ] Logging enabled

---

## 🎯 Common Tasks

### Add New Book
```typescript
await this.inventoryService.createBook({
  isbn: '978-0451524935',
  title: '1984',
  categoryId: 'cat-fiction',
  authorIds: ['auth-orwell'],
  publisherId: 'pub-penguin',
  basePrice: 599,
  stock: 50,
  minimumStock: 10,
  language: 'English',
});
```

### Create Order
```typescript
const order = await this.ordersService.createOrder({
  orderType: 'POS',
  items: [{ bookId: 'book-123', quantity: 2 }],
  paymentMethod: 'CARD',
}, userId);
```

### Process Return
```typescript
await this.ordersService.approveReturn(returnId, {
  refundAmount: 599,
  notes: 'Quality issue - full refund'
});
```

### Generate Report
```typescript
const valuation = await this.inventoryService.getInventoryValuation();
// Returns: { totalValue, totalBooks, byCategory }
```

---

## 🔗 Useful Resources

- **Prisma Docs**: https://www.prisma.io/docs/
- **NestJS Docs**: https://docs.nestjs.com/
- **Next.js Docs**: https://nextjs.org/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Redis Docs**: https://redis.io/docs/

---

## 📞 Need Help?

1. **Check Logs**: `docker-compose logs -f`
2. **Review Docs**: See main [README.md](./README.md)
3. **API Docs**: http://localhost:3000/api/docs
4. **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
5. **Database**: [DATABASE.md](./DATABASE.md)

---

**Happy Coding! 🚀**

For more detailed information, see the [comprehensive documentation](./README.md).
