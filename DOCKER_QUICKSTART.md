# 🐳 Docker Quick Start

## Cho Frontend Team (3 Bước Đơn Giản)

### Windows:
```bash
# Bước 1: Clone repo
git clone https://github.com/lehuynhhuyhoang05/Bookswap_Community.git
cd Bookswap_Community/bookswap-backend

# Bước 2: Chạy script
start-docker.bat

# Bước 3: Test API
curl http://localhost:3000/health
```

### Linux/Mac:
```bash
# Bước 1: Clone repo
git clone https://github.com/lehuynhhuyhoang05/Bookswap_Community.git
cd Bookswap_Community/bookswap-backend

# Bước 2: Make script executable và chạy
chmod +x start-docker.sh
./start-docker.sh

# Bước 3: Test API
curl http://localhost:3000/health
```

### Hoặc Dùng Docker Compose Trực Tiếp:
```bash
docker-compose up -d
```

---

## 🎯 API Endpoints

**Base URL:** `http://localhost:3000`

### Test Nhanh:
```bash
# Health check
curl http://localhost:3000/health

# Response:
# {
#   "status": "ok",
#   "timestamp": "2025-11-05T...",
#   "uptime": 123.45,
#   "environment": "production"
# }
```

### Ví Dụ Trong Frontend:
```javascript
// Config
const API_URL = 'http://localhost:3000';

// Login
const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  return data.access_token;
};

// Get Books
const getBooks = async (token) => {
  const response = await fetch(`${API_URL}/books`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

## 📦 Services Running

| Service | Port | URL | Mô Tả |
|---------|------|-----|-------|
| Backend API | 3000 | http://localhost:3000 | REST API |
| MySQL | 3308 | localhost:3308 | Database |
| Redis | 6379 | localhost:6379 | Cache |
| Adminer | 8080 | http://localhost:8080 | DB Manager |

---

## 🛑 Dừng & Xóa

```bash
# Dừng (giữ data)
docker-compose stop

# Xóa containers (giữ data)
docker-compose down

# Xóa tất cả (mất data)
docker-compose down -v
```

---

## ❓ Troubleshooting

### Backend không start?
```bash
# Xem logs
docker-compose logs -f backend

# Restart
docker-compose restart backend
```

### Port bị chiếm?
```bash
# Check port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Đổi port trong docker-compose.yml
ports:
  - "3001:3000"
```

### Build lại?
```bash
docker-compose down
docker-compose up --build -d
```

---

## 📚 Documentation

- **Frontend Guide:** [README_DOCKER_FRONTEND.md](./README_DOCKER_FRONTEND.md)
- **Full Documentation:** [DOCKER_GUIDE.md](./DOCKER_GUIDE.md)
- **API Docs:** http://localhost:3000/api (khi server chạy)

---

**Ready to code! 🚀**
