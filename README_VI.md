# 📚 BookSwap - Hệ Thống Trao Đổi Sách Thông Minh

## 📖 Giới Thiệu

BookSwap là nền tảng trao đổi sách trực tuyến với AI matching system, giúp người dùng tìm kiếm và trao đổi sách một cách thông minh dựa trên sở thích, vị trí địa lý và trust score.

## ✨ Tính Năng Nổi Bật

### 🤖 AI Matching System
- Gợi ý trao đổi thông minh dựa trên:
  - Sách bạn có ↔ Sách người khác muốn
  - Khoảng cách địa lý
  - Trust score của cả hai bên
  - Lịch sử trao đổi
- Filter và sort theo nhiều tiêu chí
- Xóa suggestions không phù hợp

### 📚 Quản Lý Sách
- Thêm/Sửa/Xóa sách cá nhân
- Upload ảnh bìa sách
- Tìm kiếm theo tên, tác giả, thể loại
- Xem lịch sử trao đổi của từng cuốn sách
- Tích hợp Google Books API cho ảnh bìa

### 🔄 Hệ Thống Trao Đổi
- Tạo yêu cầu trao đổi
- Chấp nhận/Từ chối yêu cầu
- Hẹn gặp (thời gian, địa điểm)
- Xác nhận hoàn thành
- Hủy trao đổi (với lý do)

### 💬 Tin Nhắn Real-time
- Chat trực tiếp với Socket.IO
- Gửi file đính kèm (ảnh, tài liệu)
- React emoji trên tin nhắn
- Typing indicator
- Đánh dấu đã đọc

### ⭐ Trust Score & Đánh Giá
- Đánh giá sau mỗi lần trao đổi
- Trust score tự động cập nhật (0-100)
- Hiển thị rating ở profile và suggestions
- Sửa/Xóa đánh giá

### 📢 Báo Cáo Vi Phạm
- Báo cáo user/exchange/message
- Admin xem xét và xử lý
- Các loại: SPAM, SCAM, INAPPROPRIATE_CONTENT...

### 🔧 Admin Dashboard
- Quản lý users (lock/unlock, đổi role)
- Xóa content vi phạm
- Xem lịch sử hoạt động users
- Thống kê hệ thống

## 🚀 Công Nghệ

**Backend**:
- NestJS + TypeScript
- MySQL + TypeORM
- JWT Authentication
- Socket.IO
- Docker

**Frontend**:
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Lucide Icons
- Google Books API

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Touch targets tối thiểu 44x44px
- ✅ Breakpoints: sm (640px), md (768px), lg (1024px)
- ✅ Tất cả pages đã optimize cho mobile

## 🐳 Cài Đặt & Chạy

### Sử dụng Docker (Khuyến nghị)

```bash
# 1. Clone repository
git clone <repo-url>
cd bookswap-backend

# 2. Start Docker containers
docker-compose up -d

# 3. Truy cập
# - Backend API: http://localhost:3000
# - Frontend: http://localhost:5173
# - Swagger Docs: http://localhost:3000/api/docs
# - PhpMyAdmin: http://localhost:8080
```

### Development (Manual)

**Backend**:
```bash
cd bookswap-backend
npm install
cp .env.example .env  # Cấu hình DB, JWT, Email
npm run start:dev     # Port 3000
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev           # Port 5173
```

## 📚 API Documentation

### Swagger UI
- URL: `http://localhost:3000/api/docs`
- Tất cả endpoints đều có docs đầy đủ
- Try out trực tiếp trong browser

### Danh Sách API Chính

**Authentication**:
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/me
PATCH  /auth/profile
```

**Books**:
```
GET    /books
GET    /books/:id
POST   /books
PATCH  /books/:id
DELETE /books/:id
```

**Exchange**:
```
POST   /exchanges/requests
GET    /exchanges/requests
PATCH  /exchanges/requests/:id/respond
GET    /exchanges
PATCH  /exchanges/:id/confirm
```

**AI Suggestions**:
```
POST   /exchanges/suggestions/generate
GET    /exchanges/suggestions
DELETE /exchanges/suggestions/:id
```

**Messages**:
```
GET    /api/v1/messages/conversations
POST   /api/v1/messages
DELETE /api/v1/messages/:id
```

**Reviews**:
```
POST   /reviews
GET    /reviews/member/:memberId
PATCH  /reviews/:id
```

## 🎯 Workflow Trao Đổi Sách

1. **Thêm Sách**: User đăng sách muốn trao đổi
2. **Tìm Đối Tác**: 
   - Dùng AI Suggestions để tìm người phù hợp
   - Hoặc tìm kiếm thủ công trong danh sách books
3. **Tạo Request**: Gửi yêu cầu trao đổi (có thể nhiều sách)
4. **Phản Hồi**: Người nhận accept/reject request
5. **Hẹn Gặp**: Nếu accept, hẹn thời gian địa điểm
6. **Trao Đổi**: Gặp nhau trao đổi sách
7. **Hoàn Thành**: Xác nhận hoàn thành
8. **Đánh Giá**: Cả hai đánh giá lẫn nhau

## 🔒 Bảo Mật

- **JWT Authentication**: Access token 7 ngày
- **Token Blacklist**: Revoke token khi logout
- **Password Hashing**: bcrypt
- **Email Verification**: Bắt buộc xác thực email
- **Role-based Access**: USER/ADMIN
- **Input Validation**: DTO validation với class-validator

## 📊 Database Schema (Chính)

- **User** → **Member** (1:1)
- **Member** ↔ **Book** (1:N)
- **Member** ↔ **Exchange** (N:M)
- **Exchange** ↔ **Book** (N:M via ExchangeBook)
- **Member** ↔ **Conversation** ↔ **Message**
- **Exchange** → **Review**
- **Member** → **WantedBook**
- **ExchangeSuggestion** (AI generated)

## 📝 Cấu Trúc Thư Mục

```
bookswap-backend/
├── src/
│   ├── modules/
│   │   ├── auth/          # Authentication
│   │   ├── books/         # Book management
│   │   ├── exchanges/     # Exchange system + AI suggestions
│   │   ├── messages/      # Chat + Socket.IO
│   │   ├── reviews/       # Reviews & trust score
│   │   ├── library/       # Personal library & wanted books
│   │   ├── admin/         # Admin dashboard
│   │   └── reports/       # Violation reports
│   ├── infrastructure/
│   │   ├── database/      # Entities + migrations
│   │   └── external-services/  # Email service
│   └── common/            # Guards, decorators, middleware
├── frontend/
│   └── src/
│       ├── pages/         # All page components
│       ├── components/    # Reusable components
│       ├── hooks/         # Custom hooks
│       ├── services/      # API services
│       └── utils/         # Utilities
├── sql/                   # Database scripts
├── uploads/               # Uploaded files
└── docker-compose.yml     # Docker setup
```

## 🔧 Scripts Hữu Ích

```bash
# Backend
npm run start:dev          # Development mode
npm run start:prod         # Production mode
npm run build              # Build TypeScript
npm run test               # Run tests

# Frontend
npm run dev                # Development server
npm run build              # Production build
npm run preview            # Preview production build

# Docker
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose logs -f     # View logs
```

## 🎨 Improvements Gần Đây

### Session Vừa Rồi:
1. ✅ Thêm delete functionality cho AI suggestions
2. ✅ Filter & sort suggestions (match score, trust score, date)
3. ✅ Mobile responsive improvements:
   - BookCard responsive
   - Book detail page responsive
   - Exchange history timeline responsive
   - Touch targets optimization

### Session Trước:
1. ✅ Fix image loading (Google Books API integration)
2. ✅ AI suggestion module enhancements

## 📈 Trạng Thái Dự Án

**Status**: 🟢 Production Ready

**Features Hoàn Thành**:
- ✅ Authentication & Authorization
- ✅ Book Management
- ✅ Exchange System
- ✅ AI Matching Suggestions
- ✅ Real-time Messaging
- ✅ Reviews & Trust Score
- ✅ Reports & Violations
- ✅ Admin Dashboard
- ✅ Mobile Responsive UI
- ✅ Docker Deployment

**Features Có Thể Mở Rộng**:
- 🔄 Real-time notifications (hiện tại chỉ có email)
- 🔄 Full-text search (Elasticsearch)
- 🔄 Image CDN (Cloudinary/S3)
- 🔄 ML-based recommendations
- 🔄 Map integration
- 🔄 Native mobile app

## 📞 Liên Hệ & Hỗ Trợ

- **Documentation**: Xem thư mục docs/
- **API Docs**: http://localhost:3000/api/docs
- **Issues**: GitHub Issues

## 📄 Files Tài Liệu Khác

- `PROJECT_OVERVIEW.md` - Tổng quan chi tiết project
- `SETUP_GUIDE.md` - Hướng dẫn setup từng bước
- `DOCKER_GUIDE.md` - Hướng dẫn Docker đầy đủ
- `TRUST_SCORE_SYSTEM.md` - Giải thích trust score
- `SEEDING_GUIDE.md` - Hướng dẫn seed database
- `listapi.txt` - Danh sách tất cả API endpoints

## ⚠️ Lưu Ý

1. **Email Service**: Cần cấu hình Gmail App Password trong `.env` để gửi email
2. **JWT Secret**: Đổi `JWT_SECRET` trong production
3. **Database**: Backup thường xuyên
4. **Uploads**: Folder `uploads/` cần có quyền write
5. **CORS**: Cấu hình CORS cho production domain

## 🙏 Credits

- **Backend Framework**: [NestJS](https://nestjs.com/)
- **Frontend Framework**: [React](https://react.dev/)
- **UI Library**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Book Data**: [Google Books API](https://developers.google.com/books)

---

**Developed with ❤️ for book lovers**

Last Updated: January 2025
