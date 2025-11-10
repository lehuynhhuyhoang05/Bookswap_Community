# 🐳 Docker Setup Guide - BookSwap Backend

**Mục đích:** Đóng gói toàn bộ backend (NestJS + MySQL + Redis) vào Docker container để frontend có thể chạy dễ dàng mà không cần cài đặt gì.

---

## 📋 Prerequisites (Yêu Cầu)

Frontend developer chỉ cần cài:
- ✅ **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop/))
- ✅ **Git** (để clone repo)

**Không cần cài:**
- ❌ Node.js
- ❌ MySQL
- ❌ Redis
- ❌ npm packages

---

## 🚀 Quick Start (Cho Frontend Developer)

### Bước 1: Clone Repository
```bash
git clone https://github.com/lehuynhhuyhoang05/Bookswap_Community.git
cd Bookswap_Community/bookswap-backend
```

### Bước 2: Chạy Docker Containers
```bash
# Chạy tất cả services (MySQL + Redis + Backend API)
docker-compose up -d

# Xem logs để kiểm tra
docker-compose logs -f backend
```

### Bước 3: Đợi Services Khởi Động
```
⏳ MySQL: ~15-20 giây
⏳ Redis: ~5 giây  
⏳ Backend: ~30-40 giây (build + start)
```

### Bước 4: Kiểm Tra API
```bash
# Health check
curl http://localhost:3000/health

# Test API endpoint
curl http://localhost:3000/api/health

# Hoặc mở browser: http://localhost:3000
```

### Bước 5: Sử Dụng API Trong Frontend
```javascript
// Frontend config
const API_BASE_URL = 'http://localhost:3000';

// Example: Login
fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: 'password' })
});
```

---

## 🛑 Dừng & Xóa Containers

```bash
# Dừng containers (giữ data)
docker-compose stop

# Dừng và xóa containers (giữ data)
docker-compose down

# Xóa containers + volumes (MẤT DATA)
docker-compose down -v

# Xóa containers + images (tiết kiệm dung lượng)
docker-compose down --rmi all
```

---

## 📦 Services Đang Chạy

| Service | Port | URL | Mô Tả |
|---------|------|-----|-------|
| **Backend API** | 3000 | http://localhost:3000 | NestJS REST API |
| **MySQL** | 3308 | localhost:3308 | Database |
| **Redis** | 6379 | localhost:6379 | Cache & Sessions |
| **Adminer** | 8080 | http://localhost:8080 | Database GUI |

---

## 🔧 Configuration (Cho Backend Developer)

### 1. Environment Variables

Copy và chỉnh sửa file `.env.docker`:
```bash
cp .env.docker .env
```

**Các biến quan trọng cần đổi:**
```env
# JWT Secrets (BẮT BUỘC đổi trong production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-min-32-chars

# Email (nếu cần gửi email)
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-16-char-app-password

# Google Books API (nếu dùng)
GOOGLE_BOOKS_API_KEY=your-google-books-api-key-here
```

### 2. Generate Strong Secrets
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. Database Configuration

**Mặc định trong docker-compose.yml:**
```yaml
DB_HOST: mysql          # Container name
DB_PORT: 3306          # Internal port
DB_USERNAME: bookswap_user
DB_PASSWORD: bookswap_pass
DB_DATABASE: bookswap_db
```

**Kết nối từ host machine (để debug):**
```bash
mysql -h 127.0.0.1 -P 3308 -u bookswap_user -p
# Password: bookswap_pass
```

---

## 🏗️ Build Process

### Development Build (với hot reload)
```bash
docker-compose up --build
```

### Production Build
```bash
# Build image
docker build -t bookswap-backend:latest .

# Run container
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  bookswap-backend:latest
```

### Multi-stage Build Details
```
Stage 1 (builder):
- Install dependencies
- Build TypeScript → JavaScript
- Prune devDependencies

Stage 2 (production):
- Copy only dist/ and node_modules/
- Run as non-root user (security)
- Alpine base (smaller image)
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mysql

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Check Container Status
```bash
docker-compose ps
```

### Check Resource Usage
```bash
docker stats
```

### Health Check
```bash
# Backend health
curl http://localhost:3000/health

# MySQL health
docker-compose exec mysql mysqladmin ping -h localhost -u root -proot

# Redis health
docker-compose exec redis redis-cli ping
```

---

## 🐛 Troubleshooting

### Problem: Backend không start được

**Solution 1: Check logs**
```bash
docker-compose logs backend
```

**Solution 2: MySQL chưa sẵn sàng**
```bash
# Wait for MySQL
docker-compose exec mysql mysqladmin ping -h localhost -u root -proot

# Restart backend
docker-compose restart backend
```

**Solution 3: Port đã được dùng**
```bash
# Check port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Kill process or change port in docker-compose.yml
```

### Problem: Database connection failed

**Check:**
1. MySQL container có chạy không?
```bash
docker-compose ps mysql
```

2. Database credentials đúng không?
```bash
docker-compose exec mysql mysql -u bookswap_user -pbookswap_pass bookswap_db
```

3. Init script đã chạy chưa?
```bash
docker-compose exec mysql ls /docker-entrypoint-initdb.d/
```

### Problem: Out of memory

**Solution: Increase Docker resources**
- Docker Desktop → Settings → Resources
- RAM: minimum 4GB recommended
- Swap: 2GB

### Problem: Build quá lâu

**Solution: Use build cache**
```bash
# Clear cache and rebuild
docker-compose build --no-cache

# Or use BuildKit (faster)
DOCKER_BUILDKIT=1 docker-compose build
```

---

## 🚢 Deployment to Production

### 1. Build Production Image
```bash
docker build -t bookswap-backend:v1.0.0 -f Dockerfile .
```

### 2. Push to Docker Hub
```bash
docker tag bookswap-backend:v1.0.0 yourusername/bookswap-backend:v1.0.0
docker push yourusername/bookswap-backend:v1.0.0
```

### 3. Deploy to Server
```bash
# On server
docker pull yourusername/bookswap-backend:v1.0.0
docker-compose up -d
```

### 4. Use Docker Secrets (Production)
```yaml
# docker-compose.prod.yml
services:
  backend:
    environment:
      JWT_SECRET: /run/secrets/jwt_secret
    secrets:
      - jwt_secret

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

---

## 📈 Performance Optimization

### 1. Use .dockerignore
Already configured in `.dockerignore` to exclude:
- node_modules (will be installed in container)
- dist (will be built in container)
- test files
- documentation

### 2. Multi-stage Build
Reduces final image size by ~60%:
```
Before: 1.2GB (with build tools)
After:  450MB (only runtime)
```

### 3. Layer Caching
Optimize Dockerfile order:
```dockerfile
COPY package*.json ./  # Changes rarely
RUN npm ci              # Cache this layer
COPY . .               # Changes frequently
RUN npm run build
```

---

## 🔒 Security Best Practices

### ✅ Implemented
- Non-root user (nestjs:nodejs)
- dumb-init for signal handling
- Health checks
- Read-only root filesystem (can be enabled)
- Security scanning with Snyk

### ⚠️ TODO for Production
- [ ] Change default passwords
- [ ] Use Docker secrets
- [ ] Enable TLS/HTTPS
- [ ] Implement rate limiting
- [ ] Use private Docker registry
- [ ] Regular security updates

---

## 📁 File Structure

```
bookswap-backend/
├── Dockerfile                 # Multi-stage build config
├── .dockerignore             # Files to exclude from build
├── docker-compose.yml        # All services configuration
├── .env.docker              # Environment variables template
├── DOCKER_GUIDE.md          # This file
├── sql/
│   └── init.sql             # Database initialization
└── src/
    └── main.ts              # Application entry point
```

---

## 💡 Tips for Frontend Team

### 1. API Base URL
```javascript
// Use environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### 2. CORS is Configured
Backend allows requests from:
- http://localhost:5173 (Vite default)
- http://localhost:3000 (Next.js default)

### 3. API Documentation
Access Swagger docs at: http://localhost:3000/api

### 4. Sample API Calls
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","username":"testuser"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get books
curl http://localhost:3000/books
```

---

## 🆘 Support

**Issues?** Contact backend team:
- Email: backend-team@bookswap.com
- Slack: #backend-support
- GitHub Issues: [Create Issue](https://github.com/lehuynhhuyhoang05/Bookswap_Community/issues)

---

## 📝 Changelog

### v1.0.0 (November 5, 2025)
- ✅ Initial Docker setup
- ✅ Multi-stage build
- ✅ MySQL + Redis + Backend
- ✅ Health checks
- ✅ Production-ready Dockerfile

---

*Last Updated: November 5, 2025*  
*Maintained by: Backend Team*
