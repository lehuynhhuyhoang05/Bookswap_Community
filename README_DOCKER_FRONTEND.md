# 🚀 HƯỚNG DẪN CHO FRONTEND TEAM

## 📦 Chạy Backend API Bằng Docker (3 Bước)

### Bước 1: Cài Docker Desktop
- Tải về: https://www.docker.com/products/docker-desktop/
- Cài đặt và khởi động Docker Desktop

### Bước 2: Clone & Chạy
```bash
# Clone repository
git clone https://github.com/lehuynhhuyhoang05/Bookswap_Community.git
cd Bookswap_Community/bookswap-backend

# Chạy tất cả (MySQL + Redis + Backend API)
docker-compose up -d

# Xem logs để kiểm tra
docker-compose logs -f backend
```

### Bước 3: Kiểm Tra API
```bash
# Test API
curl http://localhost:3000/health

# Hoặc mở browser: http://localhost:3000
```

**Đợi khoảng 1-2 phút để services khởi động!** ⏳

---

## 🎯 API Endpoints Sử Dụng

**Base URL:** `http://localhost:3000`

### Ví Dụ Fetch Trong Frontend:
```javascript
// Đăng ký
fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test123!',
    username: 'testuser',
    fullName: 'Test User'
  })
});

// Đăng nhập
fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test123!'
  })
})
.then(res => res.json())
.then(data => {
  const accessToken = data.access_token;
  // Lưu token vào localStorage hoặc state
});

// Gọi API với token
fetch('http://localhost:3000/books', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## 🛑 Tắt & Dọn Dẹp

```bash
# Dừng containers (giữ data)
docker-compose stop

# Xóa containers (giữ data)
docker-compose down

# Xóa tất cả (mất data)
docker-compose down -v
```

---

## 📊 Services Đang Chạy

| Service | Port | URL |
|---------|------|-----|
| **Backend API** | 3000 | http://localhost:3000 |
| **MySQL** | 3308 | localhost:3308 |
| **Redis** | 6379 | localhost:6379 |
| **Adminer** | 8080 | http://localhost:8080 |

---

## ❓ Troubleshooting

### Backend không start?
```bash
# Xem logs
docker-compose logs backend

# Restart
docker-compose restart backend
```

### Port 3000 đã được dùng?
```bash
# Windows
netstat -ano | findstr :3000

# Đổi port trong docker-compose.yml
ports:
  - "3001:3000"  # Thay 3001 thành port khác
```

### Cần build lại?
```bash
docker-compose down
docker-compose up --build -d
```

---


