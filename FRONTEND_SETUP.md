# 🚀 CHO FRONTEND TEAM - 3 BƯỚC ĐƠN GIẢN

## Bước 1: Cài Docker Desktop
- Tải: https://www.docker.com/products/docker-desktop/
- Cài và khởi động Docker Desktop

## Bước 2: Clone & Chạy
```bash
git clone https://github.com/lehuynhhuyhoang05/Bookswap_Community.git
cd Bookswap_Community

# Tạo file .env từ template
cp .env.example .env
# Hoặc trên Windows: copy .env.example .env

# Chạy backend (tự động tải MySQL, Redis, Backend)
docker-compose up -d

# Đợi 1-2 phút để services khởi động
```

**⚠️ LƯU Ý:** File `.env` đã được tạo với cấu hình mặc định. Nếu cần thay đổi (JWT secrets, API keys), chỉnh sửa file `.env`.

## Bước 3: Sử Dụng API
**API URL:** `http://localhost:3000`

```javascript
// Trong Frontend code
const API_URL = 'http://localhost:3000';

// Example: Đăng ký
fetch(`${API_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test123!',
    username: 'testuser'
  })
});

// Example: Đăng nhập
fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test123!'
  })
})
.then(res => res.json())
.then(data => {
  const token = data.access_token;
  // Lưu token để dùng cho các request khác
});

// Example: Get books (cần token)
fetch(`${API_URL}/books`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## ⚙️ Services Đang Chạy
| Service | Port | URL |
|---------|------|-----|
| Backend API | 3000 | http://localhost:3000 |
| MySQL | 3308 | localhost:3308 |
| Redis | 6379 | localhost:6379 |

---

## 🛑 Dừng Backend
```bash
# Dừng tất cả
docker-compose stop

# Xóa containers (giữ data)
docker-compose down

# Xóa tất cả kể cả data
docker-compose down -v
```

---

## ❓ Có Vấn Đề?

### Backend không start?
```bash
docker-compose logs -f backend
docker-compose restart backend
```

### Port 3000 đã được dùng?
Tắt app đang dùng port 3000 hoặc đổi port trong `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Đổi 3001 thành port khác
```

### Cần build lại?
```bash
docker-compose down
docker-compose up --build -d
```

---

## 📚 API Documentation
Swagger UI: http://localhost:3000/api/docs

---

**Xong! Giờ có thể fetch API từ Frontend! 🎉**
