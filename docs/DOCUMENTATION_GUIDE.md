# 📚 HƯỚNG DẪN HOÀN THIỆN TÀI LIỆU ĐỒ ÁN BOOKSWAP

## 📋 MỤC LỤC TÀI LIỆU ĐỒ ÁN

### Chương 1: GIỚI THIỆU
- 1.1 Đặt vấn đề
- 1.2 Mục tiêu đề tài
- 1.3 Phạm vi dự án
- 1.4 Đối tượng sử dụng

### Chương 2: PHÂN TÍCH YÊU CẦU
- 2.1 Yêu cầu chức năng (Functional Requirements)
- 2.2 Yêu cầu phi chức năng (Non-functional Requirements)
- 2.3 Use Case Diagram tổng quan
- 2.4 Đặc tả Use Case chi tiết

### Chương 3: THIẾT KẾ HỆ THỐNG
- 3.1 Kiến trúc hệ thống (System Architecture)
- 3.2 Class Diagram
- 3.3 Entity Relationship Diagram (ERD)
- 3.4 Sequence Diagrams
- 3.5 Activity Diagrams
- 3.6 State Diagrams
- 3.7 Component Diagram
- 3.8 Deployment Diagram

### Chương 4: THIẾT KẾ CƠ SỞ DỮ LIỆU
- 4.1 Mô hình quan hệ
- 4.2 Mô tả chi tiết các bảng
- 4.3 Các ràng buộc và indexes

### Chương 5: THIẾT KẾ GIAO DIỆN
- 5.1 Wireframes
- 5.2 Mockups
- 5.3 Responsive Design

### Chương 6: CÀI ĐẶT VÀ TRIỂN KHAI
- 6.1 Công nghệ sử dụng
- 6.2 Cấu trúc source code
- 6.3 API Documentation
- 6.4 Deployment Guide

### Chương 7: KẾT QUẢ VÀ ĐÁNH GIÁ
- 7.1 Kết quả đạt được
- 7.2 Hạn chế
- 7.3 Hướng phát triển

---

## 🔄 NHỮNG THAY ĐỔI CẦN CẬP NHẬT SO VỚI THIẾT KẾ BAN ĐẦU

### 1. CƠ SỞ DỮ LIỆU (Database Schema)

#### Các bảng MỚI được thêm:
| Bảng | Mô tả | Lý do thêm |
|------|-------|------------|
| `exchange_suggestions` | Lưu gợi ý trao đổi AI | Feature AI Matching System |
| `book_match_pairs` | Cặp sách matching trong suggestion | Chi tiết hóa suggestions |
| `user_activity_logs` | Log hoạt động user | Audit trail, security |
| `audit_logs` | Log hành động admin | Admin accountability |
| `admins` | Thông tin admin | Admin management |
| `blocked_members` | Danh sách chặn | Privacy feature |
| `message_reactions` | React emoji tin nhắn | UX enhancement |
| `message_templates` | Template tin nhắn | UX enhancement |
| `token_blacklist` | Blacklist JWT tokens | Security (logout) |
| `notifications` | Thông báo hệ thống | Notification system |
| `system_statistics` | Thống kê hệ thống | Dashboard analytics |

#### Các cột MỚI trong bảng cũ:

**Bảng `exchanges`:**
- `meeting_latitude`, `meeting_longitude` - Tọa độ GPS
- `meeting_confirmed_by_a`, `meeting_confirmed_by_b` - Xác nhận meeting
- `meeting_scheduled_at`, `meeting_scheduled_by` - Thông tin schedule
- `meeting_updated_by`, `meeting_updated_at` - Lịch sử cập nhật
- `cancellation_reason`, `cancellation_note` - Chi tiết hủy

**Bảng `messages`:**
- `message_type` (TEXT/IMAGE/FILE) - Loại tin nhắn
- `attachment_url`, `attachment_type`, `attachment_name`, `attachment_size` - File đính kèm
- `is_edited`, `edited_at` - Chỉnh sửa tin nhắn
- `status` (sent/delivered/read) - Trạng thái delivery
- `metadata` - JSON cho dữ liệu mở rộng

**Bảng `books`:**
- `user_photos` - Ảnh thực tế do user chụp
- `condition_notes` - Mô tả tình trạng sách

**Bảng `books_wanted`:**
- `cover_image_url` - Ảnh bìa
- `preferred_condition` - Điều kiện sách mong muốn
- `language` - Ngôn ngữ

**Bảng `members`:**
- `is_online`, `last_seen_at` - Trạng thái online
- `notification_settings` - Cài đặt thông báo
- `average_rating` - Đánh giá trung bình

**Bảng `users`:**
- `lock_reason`, `locked_until` - Thông tin khóa tài khoản
- `login_attempts`, `lockout_until` - Bảo mật đăng nhập

### 2. TÍNH NĂNG MỚI

| Tính năng | Mô tả | Module |
|-----------|-------|--------|
| **AI Matching System** | Gợi ý trao đổi thông minh dựa trên sở thích, vị trí, trust score | `/exchanges/suggestions` |
| **Real-time Chat** | Tin nhắn real-time với Socket.IO | `/messages` |
| **Trust Score System** | Điểm tin cậy tự động tính | `/reviews`, `/members` |
| **Meeting Arrangement** | Hẹn gặp với thời gian, địa điểm | `/exchanges` |
| **File Attachments** | Gửi ảnh/file trong chat | `/messages` |
| **Admin Dashboard** | Quản lý hệ thống | `/admin` |
| **Report System** | Báo cáo vi phạm | `/reports` |
| **Activity Logging** | Theo dõi hoạt động | `user_activity_logs` |

### 3. API ENDPOINTS MỚI

```
# AI Suggestions
POST   /exchanges/suggestions/generate
GET    /exchanges/suggestions
PATCH  /exchanges/suggestions/:id/view
DELETE /exchanges/suggestions/:id

# Meeting Arrangement
POST   /exchanges/:id/arrange-meeting
PATCH  /exchanges/:id/meeting/cancel
PATCH  /exchanges/:id/cancel

# Admin
GET    /admin/stats
GET    /admin/users
POST   /admin/users/:id/lock
POST   /admin/users/:id/unlock
GET    /admin/users/:id/activities
GET    /admin/reports
POST   /admin/reports/:id/resolve

# Reports
POST   /reports
GET    /reports/my-reports
```

### 4. TRẠNG THÁI (STATUS) THAY ĐỔI

**Exchange Status (cập nhật):**
```
PENDING → ACCEPTED → MEETING_SCHEDULED → IN_PROGRESS → COMPLETED
                                      ↘ CANCELLED
                                      ↘ EXPIRED
```

**Exchange Request Status:**
```
PENDING → ACCEPTED → (tạo Exchange)
        → REJECTED
        → CANCELLED
        → COMPLETED
```

**Book Status:**
```
AVAILABLE → EXCHANGING → AVAILABLE (sau exchange)
          → REMOVED (soft delete)
```

---

## 📁 CẤU TRÚC FILE PLANTUML

Các file PlantUML được đặt trong `docs/diagrams/`:

```
docs/diagrams/
├── use-case/
│   ├── UC_01_Overview.puml              # Use Case tổng quan
│   ├── UC_02_Authentication.puml        # UC Xác thực
│   ├── UC_03_BookManagement.puml        # UC Quản lý sách
│   ├── UC_04_Exchange.puml              # UC Trao đổi
│   ├── UC_05_Messaging.puml             # UC Tin nhắn
│   ├── UC_06_Admin.puml                 # UC Admin
│   └── UC_07_Reports.puml               # UC Báo cáo
│
├── class/
│   ├── CD_01_Overview.puml              # Class Diagram tổng quan
│   ├── CD_02_Entities.puml              # Database Entities
│   ├── CD_03_Services.puml              # Service Classes
│   └── CD_04_Controllers.puml           # Controller Classes
│
├── sequence/
│   ├── SD_01_Register.puml              # Đăng ký
│   ├── SD_02_Login.puml                 # Đăng nhập
│   ├── SD_03_CreateBook.puml            # Thêm sách
│   ├── SD_04_CreateExchangeRequest.puml # Tạo yêu cầu trao đổi
│   ├── SD_05_AcceptExchange.puml        # Chấp nhận trao đổi
│   ├── SD_06_ArrangeMeeting.puml        # Hẹn gặp
│   ├── SD_07_CompleteExchange.puml      # Hoàn thành trao đổi
│   ├── SD_08_SendMessage.puml           # Gửi tin nhắn
│   ├── SD_09_GenerateSuggestions.puml   # Tạo gợi ý AI
│   └── SD_10_AdminActions.puml          # Hành động admin
│
├── activity/
│   ├── AD_01_ExchangeFlow.puml          # Luồng trao đổi
│   ├── AD_02_AuthenticationFlow.puml    # Luồng xác thực
│   └── AD_03_AIMatchingFlow.puml        # Luồng AI matching
│
├── state/
│   ├── SM_01_ExchangeState.puml         # Trạng thái Exchange
│   ├── SM_02_ExchangeRequestState.puml  # Trạng thái Request
│   └── SM_03_BookState.puml             # Trạng thái Book
│
├── erd/
│   └── ERD_Complete.puml                # Entity Relationship Diagram
│
├── component/
│   └── COMP_SystemArchitecture.puml     # Component Diagram
│
└── deployment/
    └── DEP_Deployment.puml              # Deployment Diagram
```

---

## ⚠️ LƯU Ý KHI CẬP NHẬT TÀI LIỆU

1. **Đồng bộ với schema SQL mới nhất** (`schemaproject.sql`)
2. **Kiểm tra tất cả API endpoints** trong file `listapi.txt`
3. **Cập nhật screenshots UI** với phiên bản responsive mới
4. **Thêm mô tả tính năng AI Matching** - đây là điểm nổi bật của dự án
5. **Bổ sung phần Security** - JWT, bcrypt, CORS, etc.
6. **Thêm Docker deployment** - container orchestration

---

## 🎯 CHECKLIST HOÀN THIỆN TÀI LIỆU

### Diagrams cần có:
- [ ] Use Case Diagram (tổng quan + chi tiết)
- [ ] Class Diagram (entities + services)
- [ ] ERD (Entity Relationship Diagram)
- [ ] Sequence Diagrams (10+ scenarios)
- [ ] Activity Diagrams (3+ flows)
- [ ] State Machine Diagrams (3 entities)
- [ ] Component Diagram
- [ ] Deployment Diagram

### Documentation cần có:
- [ ] Đặc tả Use Case (mỗi UC có: Actor, Pre-condition, Post-condition, Main flow, Alternative flow)
- [ ] Mô tả Database Tables (mỗi bảng có: columns, types, constraints, relationships)
- [ ] API Documentation (mỗi endpoint có: method, path, request, response, errors)
- [ ] Screenshot UI (mỗi trang chính)
- [ ] Security measures
- [ ] Deployment guide

---

Xem chi tiết từng file PlantUML trong thư mục `docs/diagrams/`
