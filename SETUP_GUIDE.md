# BookSwap Backend - Setup Guide cho Frontend Team

## 📋 Yêu cầu hệ thống
- Docker Desktop đã cài đặt và đang chạy
- Git
- Port 3000, 3308, 6379, 8080 chưa bị sử dụng

## 🚀 Hướng dẫn Setup

### 1. Clone Repository
```bash
git clone https://github.com/lehuynhhuyhoang05/Bookswap_Community.git
cd Bookswap_Community
git checkout bookswap_backend
```

### 2. Tạo file `.env`
Tạo file `.env` trong thư mục root với nội dung sau:

```env
# Database - Sử dụng service names cho Docker
DB_TYPE=mysql
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=bookswap_user
DB_PASSWORD=bookswap_pass
DB_DATABASE=bookswap_db
DB_SYNCHRONIZE=false

# Application
NODE_ENV=production
PORT=3000
APP_NAME=BookSwap Community

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-different-from-access
JWT_REFRESH_EXPIRATION=30d

# Google OAuth (optional - có thể bỏ trống)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Google Books API
GOOGLE_BOOKS_API_KEY=AIzaSyDWxJoS4ODGgU7umfIPonYxBlA0cTxnX68

# Redis - Sử dụng service name cho Docker
REDIS_HOST=redis
REDIS_PORT=6379

# AWS S3 (optional - có thể bỏ trống)
AWS_S3_BUCKET=bookswap-uploads
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-southeast-1

# SendGrid (optional - có thể bỏ trống, registration vẫn hoạt động)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=your-email@example.com
APP_URL=http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Build và Start Docker Containers

#### Windows (PowerShell/CMD):
```powershell
# Build và start tất cả services
docker-compose up -d --build

# Hoặc start without rebuild (nếu đã build trước đó)
docker-compose up -d

# Kiểm tra status
docker-compose ps

# Xem logs
docker-compose logs -f backend
```

#### Linux/MacOS:
```bash
# Build và start tất cả services
docker-compose up -d --build

# Hoặc start without rebuild
docker-compose up -d

# Kiểm tra status
docker-compose ps

# Xem logs
docker-compose logs -f backend
```

### 4. Verify Services đang chạy

Các services sẽ available tại:
- ✅ **Backend API**: http://localhost:3000
- ✅ **MySQL Database**: localhost:3308
- ✅ **Redis**: localhost:6379
- ✅ **Adminer (DB Manager)**: http://localhost:8080

## 🛠️ Các lệnh Docker hữu ích

### Start/Stop/Restart Services
```bash
# Start tất cả services
docker-compose up -d

# Stop tất cả services
docker-compose stop

# Restart một service cụ thể
docker-compose restart backend

# Stop và remove containers
docker-compose down
```

### Xem Logs
```bash
# Logs của tất cả services
docker-compose logs

# Logs của backend only
docker-compose logs backend

# Follow logs (real-time)
docker-compose logs -f backend

# Logs 50 dòng cuối
docker-compose logs --tail=50 backend
```

### Rebuild Services
```bash
# Rebuild backend khi có code changes
docker-compose up -d --build backend

# Force recreate containers (khi thay đổi .env)
docker-compose up -d --force-recreate backend

# Rebuild tất cả từ đầu
docker-compose down
docker-compose up -d --build
```

### Truy cập vào Container
```bash
# Access backend container shell
docker-compose exec backend sh

# Check environment variables
docker-compose exec backend printenv

# Access MySQL
docker-compose exec mysql mysql -u bookswap_user -p
# Password: bookswap_pass
```

### Clean Up
```bash
# Remove containers và networks
docker-compose down

# Remove containers, networks VÀ volumes (⚠️ sẽ xóa database data)
docker-compose down -v

# Remove images
docker rmi bookswap-backend-backend
```

## 🔧 Troubleshooting

### Container không start được:
```bash
# Xem logs để biết lỗi
docker-compose logs backend

# Kiểm tra port conflicts
netstat -an | findstr "3000"  # Windows
lsof -i :3000                  # Linux/Mac
```

### Backend không connect được MySQL:
```bash
# Kiểm tra MySQL đã sẵn sàng chưa
docker-compose logs mysql

# Restart backend
docker-compose restart backend
```

### Thay đổi .env không có hiệu lực:
```bash
# Phải force recreate container
docker-compose up -d --force-recreate backend
```

### Reset toàn bộ (fresh start):
```bash
docker-compose down -v
docker-compose up -d --build
```

## 📡 Test API

### Test Registration:
```bash
# Windows PowerShell
$body = @{
    email = "test@example.com"
    password = "Test123456"
    full_name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/auth/register -Method Post -Body $body -ContentType "application/json"
```

```bash
# Linux/Mac (curl)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "full_name": "Test User"
  }'
```

### Test Login:
```bash
# Windows PowerShell
$body = @{
    email = "test@example.com"
    password = "Test123456"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/auth/login -Method Post -Body $body -ContentType "application/json"
```

```bash
# Linux/Mac (curl)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

## 🗄️ Database Access

### Via Adminer (Web UI):
1. Mở browser: http://localhost:8080
2. Login với:
   - **System**: MySQL
   - **Server**: mysql
   - **Username**: bookswap_user
   - **Password**: bookswap_pass
   - **Database**: bookswap_db

### Via MySQL CLI:
```bash
docker-compose exec mysql mysql -u bookswap_user -p bookswap_db
# Password: bookswap_pass
```

## 📚 API Documentation

Sau khi backend chạy, có thể access Swagger docs tại:
- http://localhost:3000/api (nếu có setup Swagger)

## 🔐 Security Notes

- ⚠️ **KHÔNG commit file `.env`** lên Git
- ⚠️ File `.env` đã có trong `.gitignore`
- ⚠️ Các API keys và secrets chỉ dùng cho development
- ⚠️ Production cần thay đổi tất cả secrets

## 💡 Tips

1. **Lần đầu setup**: Dùng `docker-compose up -d --build`
2. **Restart sau khi thay đổi code**: Backend tự rebuild trong container
3. **Thay đổi .env**: Dùng `docker-compose up -d --force-recreate backend`
4. **Check logs thường xuyên**: `docker-compose logs -f backend`

## 📞 Support

Nếu gặp vấn đề, hãy:
1. Check logs: `docker-compose logs backend`
2. Verify services: `docker-compose ps`
3. Check ports: Đảm bảo 3000, 3308, 6379, 8080 không bị chiếm

---

**Happy Coding! 🚀**
