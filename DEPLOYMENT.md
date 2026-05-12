# BookStore CMS - Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ and pnpm
- PostgreSQL 15+
- Redis 7+
- Git

## Local Development Setup

### 1. Environment Configuration

Copy the example environment files:

```bash
cp apps/api/.env.example apps/api/.env.development
```

Update `apps/api/.env.development`:

```env
DATABASE_URL="postgresql://bookstore:bookstore@localhost:5432/bookstore"
JWT_SECRET="your-dev-secret-key"
REDIS_URL="redis://localhost:6379"
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Services with Docker Compose

```bash
cd infra
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Meilisearch (port 7700)

### 4. Setup Database

```bash
cd apps/api

# Run migrations
pnpm exec prisma migrate deploy

# Seed database with test data
pnpm exec prisma db seed
```

### 5. Start Development Servers

**Backend:**
```bash
cd apps/api
pnpm run start:dev
```

API runs on: http://localhost:3000
API Docs: http://localhost:3000/api/docs

**Frontend:**
```bash
cd apps/web
pnpm run dev
```

Frontend runs on: http://localhost:3001

## Production Deployment

### Prerequisites

- A production-grade server with Docker
- Domain name with SSL certificate
- Environment variables configured

### 1. Prepare Environment

Create `.env.production`:

```bash
cp apps/api/.env.example apps/api/.env.production
```

Configure production values:

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@db-host:5432/bookstore"
JWT_SECRET="use-strong-random-secret-here"
JWT_REFRESH_SECRET="use-strong-random-secret-here"
FRONTEND_URL="https://yourdomain.com"
```

### 2. Build Docker Images

```bash
cd infra
docker-compose build
```

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Database Migrations

```bash
docker exec bookstore_api pnpm exec prisma migrate deploy
```

### 5. Verify Deployment

Check service health:

```bash
docker-compose ps
```

Access the application:
- Frontend: https://yourdomain.com
- API: https://yourdomain.com/api/v1
- Docs: https://yourdomain.com/api/docs

## SSL/TLS Configuration

### Using Let's Encrypt with Certbot

```bash
docker run -it --rm --name certbot \
  -v /path/to/infra/ssl:/etc/letsencrypt \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d yourdomain.com
```

Copy certificates to `infra/docker/ssl/`:

```bash
cp /path/to/ssl/live/yourdomain.com/fullchain.pem infra/docker/ssl/cert.pem
cp /path/to/ssl/live/yourdomain.com/privkey.pem infra/docker/ssl/key.pem
```

Restart Nginx:

```bash
docker-compose restart nginx
```

## Database Backup

### Backup PostgreSQL

```bash
docker exec bookstore_postgres pg_dump \
  -U bookstore bookstore > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore PostgreSQL

```bash
docker exec -i bookstore_postgres psql \
  -U bookstore bookstore < backup.sql
```

## Monitoring and Logs

### View Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

### Health Checks

```bash
# API health
curl http://localhost:3000/api/v1/health

# Overall health
curl http://localhost/health
```

## Scaling

### Horizontal Scaling with Multiple API Instances

Update `docker-compose.yml`:

```yaml
api:
  deploy:
    replicas: 3
```

Nginx will load-balance across instances automatically.

### Database Connection Pooling

Configure PgBouncer for connection pooling:

```yaml
pgbouncer:
  image: pgbouncer:latest
  environment:
    DATABASES_HOST: postgres
    DATABASES_PORT: 5432
    DATABASES_USER: bookstore
    DATABASES_PASSWORD: bookstore
    DATABASES_DBNAME: bookstore
  ports:
    - '6432:6432'
```

## Performance Optimization

### 1. Redis Caching

Enabled by default. Configure TTLs in environment variables.

### 2. Meilisearch Indexing

Automatically indexes books. Monitor with:

```bash
curl http://localhost:7700/health
```

### 3. Database Indexes

Critical indexes are created during migrations. Monitor query performance:

```bash
docker exec bookstore_postgres psql -U bookstore bookstore \
  -c "SELECT query, calls FROM pg_stat_statements ORDER BY calls DESC;"
```

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
docker exec bookstore_postgres pg_isready -U bookstore

# Check logs
docker-compose logs postgres
```

### API Not Starting

```bash
# Check API logs
docker-compose logs api

# Restart
docker-compose restart api
```

### High Memory Usage

```bash
# Check container stats
docker stats

# Reduce Redis memory limit
docker exec bookstore_redis redis-cli CONFIG SET maxmemory 256mb
```

### Nginx Routing Issues

```bash
# Check nginx configuration
docker-compose exec nginx nginx -t

# View logs
docker-compose logs nginx
```

## Maintenance

### Regular Updates

```bash
# Update dependencies
pnpm update

# Rebuild images
docker-compose build --no-cache

# Restart services
docker-compose down
docker-compose up -d
```

### Cleanup Disk Space

```bash
# Remove unused volumes
docker volume prune

# Remove unused images
docker image prune -a

# Remove old logs
docker exec bookstore_postgres vacuumdb -U bookstore bookstore
```

## Security Checklist

- [ ] Change default passwords
- [ ] Enable SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Use strong JWT secrets
- [ ] Configure CORS properly
- [ ] Implement backup strategy
- [ ] Set up monitoring alerts
- [ ] Regular security updates

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push
        run: |
          docker-compose build
          docker-compose push
      - name: Deploy
        run: |
          ssh user@host 'cd /app && docker-compose pull && docker-compose up -d'
```

## Support and Documentation

- API Documentation: http://localhost:3000/api/docs
- Architecture Guide: [ARCHITECTURE.md](../ARCHITECTURE.md)
- Database Schema: [DATABASE.md](../DATABASE.md)
