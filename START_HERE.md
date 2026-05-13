# BookStore CMS - Complete System Setup & Launch Guide

## 🎉 Complete Frontend & Backend Implementation

This guide walks you through setting up and running the entire BookStore CMS system with all components.

---

## 📋 System Components

### Backend (NestJS API)
- ✅ Complete RESTful API with 50+ endpoints
- ✅ Authentication & JWT tokens
- ✅ Inventory management
- ✅ Order & POS system
- ✅ Database migrations with Prisma
- ✅ Swagger documentation

### Frontend (Next.js)
- ✅ Admin Dashboard
- ✅ POS Interface
- ✅ Ecommerce Storefront
- ✅ Authentication Pages
- ✅ Inventory Management
- ✅ Orders Management

### Infrastructure
- ✅ PostgreSQL Database
- ✅ Redis Cache
- ✅ Meilisearch
- ✅ Nginx Reverse Proxy
- ✅ Docker Compose Orchestration

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Docker & Docker Compose installed
  - **Windows**: Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
  - **Mac/Linux**: Install Docker and Docker Compose
- pnpm (or npm/yarn)
- Node.js 18+

### Step 1: Navigate to Project

**Linux/Mac:**
```bash
cd /home/nate/test/BookStore-CMS
```

**Windows (PowerShell):**
```powershell
cd C:\path\to\BookStore-CMS
```

**Windows (Command Prompt):**
```cmd
cd C:\path\to\BookStore-CMS
```

### Step 2: Install Dependencies
```bash
pnpm install
```

Or if using npm/yarn:
```bash
npm install
# or
yarn install
```

### Step 3: Start All Services

**Linux/Mac:**
```bash
# start docker.service first
# check if docker is running
docker ps

cd infra
docker-compose up -d

# if docker doesnt work (due to network issue) then pull image manually first
docker-compose pull
docker-compose up -d
```

**Windows (PowerShell or Command Prompt):**
```powershell
# Check if Docker is running
docker ps

cd infra
docker-compose up -d

# If network issues, pull images first
docker-compose pull
docker-compose up -d
```

Wait for all services to be healthy (30 seconds).

### Step 4: Initialize Database

This needs to be run only during the first run or when changing the database schema. Later run only need to start docker , frontend & backend

**Linux/Mac:**
```bash
cd ../apps/api
# copy .env.development -> .env
cp .env.development .env
# ORM mapping
pnpm exec prisma migrate dev
# adds dummy values
pnpm exec prisma db seed

# to visually see the database
pnpm exec prisma studio
```

**Windows (PowerShell):**
```powershell
cd ../apps/api
# copy .env.development -> .env
Copy-Item -Path .env.development -Destination .env
# ORM mapping
pnpm exec prisma migrate dev
# adds dummy values
pnpm exec prisma db seed

# to visually see the database
pnpm exec prisma studio
```

**Windows (Command Prompt):**
```cmd
cd ../apps/api
REM copy .env.development -> .env
copy .env.development .env
REM ORM mapping
pnpm exec prisma migrate dev
REM adds dummy values
pnpm exec prisma db seed

REM to visually see the database
pnpm exec prisma studio
```

### Step 5: Start Backend

```bash
pnpm run start:dev
```

Backend will start on **http://localhost:3000**

### Step 6: Start Frontend (New Terminal)

```bash
cd apps/web
pnpm install  # If not done yet
pnpm run dev
```

Frontend will start on **http://localhost:8080**

### Step 7: Login
- Open browser to **http://localhost:8080**
- Login with test credentials (see below)

---

## 🔑 Test Credentials

All test accounts are pre-seeded in the database:

### Admin Account
```
Email: admin@bookstore.com
Password: Admin@123
Role: ADMIN
Access: Full system access
```

### Supplier Account
```
Email: supplier@bookstore.com
Password: Supplier@123
Role: Supplier
Access: Dashboard, inventory, orders
```

### Customer Account
```
Email: customer@bookstore.com
Password: Customer@123
Role: CUSTOMER
Access: Ecommerce store only
```

---

## 📊 What's Running

### Docker Services
```bash
# Check status
docker-compose ps

# Services running:
- postgres (Database port 5432)
- redis (Cache port 6379)
- meilisearch (Search port 7700)

```

### Key URLs

| Component | URL |
|-----------|-----|
| Frontend App | http://localhost:8080 |
| Backend API | http://localhost:3000/api/v1 |
| API Documentation | http://localhost:3000/api/docs |
| Database | localhost:5432 |
| Redis | localhost:6379 |
| Meilisearch | http://localhost:7700 |

---

## 🧭 Navigation Guide

## ENDPOINTS
```bash
# landing page
 /   
 /login , /signup  , /logout

# Customer
/dashboard    
/issued     
/return-deadline    
/online-read    
/cart   
/settings    

# Admin
# For convinence the admin pages are kept seperate (only for dev phase)
# The isolation is turned off

/admin/dashboard      
/admin/books         
/admin/orders          
/admin/customers         
/admin/inventory           
/admin/suppliers         
/admin/analytics        
/admin/settings  

```

---

## 🛠️ Troubleshooting

### Database Issues

**Linux/Mac:**
```bash
# Reset database (dev only!)
cd apps/api
pnpm exec prisma migrate reset

# Or manually reset
cd infra
docker-compose down -v
docker-compose up -d

cd ../apps/api
rm -rf prisma/migrations
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

**Windows (PowerShell):**
```powershell
# Reset database (dev only!)
cd apps/api
pnpm exec prisma migrate reset

# Or manually reset
cd infra
docker-compose down -v
docker-compose up -d

cd ../apps/api
Remove-Item -Path prisma/migrations -Recurse -Force
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

**Windows (Command Prompt):**
```cmd
REM Reset database (dev only!)
cd apps/api
pnpm exec prisma migrate reset

REM Or manually reset
cd infra
docker-compose down -v
docker-compose up -d

cd ../apps/api
rmdir /s /q prisma\migrations
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

# Rebuild images
```bash
docker-compose build --no-cache

# Full reset
docker-compose down
docker volume prune
docker-compose up -d
```

### API Connection Errors
```bash
# Verify backend is running
curl http://localhost:3000/api/v1/health

# Check frontend .env
cat apps/web/.env.local
# Should have: NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

**Windows (PowerShell):**
```powershell
# Verify backend is running
Invoke-WebRequest http://localhost:3000/api/v1/health

# Check frontend .env
type apps/web/.env.local
# Should have: NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---


## 🆘 Support

### Common Issues & Solutions

| Issue | Linux/Mac Solution | Windows Solution |
|-------|----------|----------|
| Can't connect to database | Check Docker service running: `docker-compose ps` | Check Docker running: `docker ps` |
| Blank frontend | Check API URL: `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1` | Check API URL: `NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1` |
| Login fails | Verify test credentials and database seed: `pnpm exec prisma db seed` | Verify test credentials and database seed: `pnpm exec prisma db seed` |
| Port already in use | Kill process: `lsof -ti:PORT \| xargs kill -9` | Kill process: `netstat -ano \| findstr :PORT` then `taskkill /PID <PID> /F` |
| CORS errors | Check NestJS CORS config in `main.ts` | Check NestJS CORS config in `main.ts` |
| Missing modules | Run `pnpm install` in root and `apps/web` | Run `pnpm install` in root and `apps/web` |

### Getting Help

1. Check relevant documentation file
2. Review error messages in logs: `docker-compose logs -f`
3. Check database: `docker exec bookstore_postgres psql -U bookstore -d bookstore` (Linux/Mac)
   - Or on Windows, use DBeaver/other GUI tools connected to localhost:5432
4. Review API: `curl -X GET http://localhost:3000/api/v1/inventory/books` (Linux/Mac)
   - Or on Windows: `Invoke-WebRequest http://localhost:3000/api/v1/inventory/books` (PowerShell)

---

**🚀 You're all set! Welcome to BookStore CMS - Your Complete Bookstore Management System**

Last Updated: December 2026
Version: 1.0.0
