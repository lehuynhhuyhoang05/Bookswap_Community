# BookSwap - Software Design Document
## Tài liệu Thiết kế Phần mềm

**Phiên bản:** 1.0  
**Ngày:** 07/12/2024  
**Dự án:** BookSwap - Nền tảng Trao đổi Sách Cộng đồng

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Kiến trúc Hệ thống](#2-kiến-trúc-hệ-thống)
3. [Use Case Diagrams](#3-use-case-diagrams)
4. [Class Diagrams](#4-class-diagrams)
5. [Entity Relationship Diagram](#5-entity-relationship-diagram)
6. [Sequence Diagrams](#6-sequence-diagrams)
7. [Activity Diagrams](#7-activity-diagrams)
8. [State Machine Diagrams](#8-state-machine-diagrams)
9. [Component Diagram](#9-component-diagram)
10. [Deployment Diagram](#10-deployment-diagram)
11. [API Specification](#11-api-specification)
12. [Database Schema](#12-database-schema)
13. [Security Design](#13-security-design)
14. [Appendices](#14-appendices)

---

## 1. Giới thiệu

### 1.1 Mục đích

Tài liệu này mô tả chi tiết thiết kế phần mềm cho hệ thống BookSwap - một nền tảng trao đổi sách trực tuyến cho cộng đồng người yêu sách.

### 1.2 Phạm vi

Hệ thống BookSwap cung cấp các chức năng:
- Quản lý tài khoản người dùng (đăng ký, đăng nhập, xác thực)
- Quản lý sách cá nhân và sách mong muốn
- Tạo và quản lý yêu cầu trao đổi sách
- Hệ thống AI Matching gợi ý trao đổi thông minh
- Tin nhắn real-time giữa các thành viên
- Hệ thống đánh giá và Trust Score
- Quản trị hệ thống (Admin)

### 1.3 Đối tượng sử dụng

| Actor | Mô tả |
|-------|-------|
| Guest (Khách) | Người dùng chưa đăng nhập, có thể duyệt sách |
| Member (Thành viên) | Người dùng đã đăng ký, có thể trao đổi sách |
| Admin (Quản trị viên) | Quản lý hệ thống, xử lý báo cáo vi phạm |

### 1.4 Công nghệ sử dụng

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | NestJS 10, TypeORM, Socket.IO |
| Database | MySQL 8.0 |
| Cache | Redis (optional) |
| Authentication | JWT, Passport.js |
| File Storage | Local filesystem / Cloud Storage |

---

## 2. Kiến trúc Hệ thống

### 2.1 Tổng quan kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Web Browser   │  │  Mobile Browser │                  │
│  │  (React SPA)    │  │  (Responsive)   │                  │
│  └────────┬────────┘  └────────┬────────┘                  │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Nginx)                      │
│  • SSL Termination  • Rate Limiting  • Load Balancing       │
└───────────────────────────┬─────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│   REST API (:3000)  │         │  WebSocket (:3001)  │
│   NestJS Backend    │         │     Socket.IO       │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           └───────────────┬───────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
│  AuthService │ BooksService │ ExchangeService │ ...        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                        │
│  TypeORM Repositories │ Query Builder │ Migrations          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │    MySQL 8.0    │  │  File Storage   │                  │
│  │   (Primary DB)  │  │   (uploads/)    │                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Design Patterns sử dụng

| Pattern | Áp dụng |
|---------|---------|
| Repository Pattern | Data access layer (TypeORM) |
| Dependency Injection | NestJS IoC Container |
| Observer Pattern | Event-driven notifications, WebSocket |
| Strategy Pattern | Matching algorithm components |
| Guard Pattern | Authentication & Authorization |
| DTO Pattern | Request/Response validation |
| Singleton | Database connection, Socket instance |

---

## 3. Use Case Diagrams

### 3.1 Tổng quan hệ thống

**File:** `docs/diagrams/use-case/UC_01_Overview.puml`

Diagram này thể hiện toàn bộ use cases của hệ thống, phân theo các subsystem:
- Authentication (Xác thực)
- Book Management (Quản lý sách)
- Exchange System (Trao đổi)
- Messaging (Tin nhắn)
- Reviews (Đánh giá)
- Reports (Báo cáo)
- Admin (Quản trị)

### 3.2 Module Chi tiết

| File | Mô tả |
|------|-------|
| `UC_02_Authentication.puml` | Use cases xác thực: Đăng ký, Đăng nhập, Quên mật khẩu |
| `UC_03_BookManagement.puml` | Use cases quản lý sách và sách mong muốn |
| `UC_04_Exchange.puml` | Use cases trao đổi và AI Matching |
| `UC_05_Messaging.puml` | Use cases tin nhắn real-time |
| `UC_06_Admin.puml` | Use cases quản trị hệ thống |

---

## 4. Class Diagrams

### 4.1 Database Entities

**File:** `docs/diagrams/class/CD_01_Entities.puml`

Các entity chính của hệ thống:

```
┌─────────────────────────────────────────────────────────────┐
│                    USER MANAGEMENT                          │
│  User ──1:0..1── Member ──1:1── PersonalLibrary            │
│  User ──1:0..1── Admin                                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BOOK MANAGEMENT                          │
│  Member ──1:*── Book                                        │
│  PersonalLibrary ──1:*── BookWanted                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXCHANGE SYSTEM                          │
│  Member ──*:*── ExchangeRequest ──1:0..1── Exchange        │
│  Exchange ──1:*── ExchangeBook                             │
│  Exchange ──1:*── Review                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI MATCHING                              │
│  ExchangeSuggestion ──1:*── BookMatchPair                  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Enumerations

```typescript
enum UserRole { GUEST, MEMBER, ADMIN }
enum AccountStatus { ACTIVE, LOCKED, SUSPENDED, DELETED }
enum BookCondition { LIKE_NEW, VERY_GOOD, GOOD, FAIR, POOR }
enum BookStatus { AVAILABLE, EXCHANGING, REMOVED }
enum RequestStatus { PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED }
enum ExchangeStatus { PENDING, ACCEPTED, MEETING_SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, EXPIRED }
enum MessageType { TEXT, IMAGE, FILE }
enum ReportStatus { PENDING, IN_REVIEW, RESOLVED, DISMISSED }
```

---

## 5. Entity Relationship Diagram

**File:** `docs/diagrams/erd/ERD_Complete.puml`

### 5.1 Danh sách Tables

| # | Table | Mô tả |
|---|-------|-------|
| 1 | users | Thông tin tài khoản người dùng |
| 2 | members | Thông tin thành viên (profile mở rộng) |
| 3 | admins | Thông tin quản trị viên |
| 4 | books | Sách của thành viên |
| 5 | personal_libraries | Thư viện cá nhân |
| 6 | books_wanted | Sách mong muốn |
| 7 | exchange_requests | Yêu cầu trao đổi |
| 8 | exchange_request_books | Sách trong yêu cầu |
| 9 | exchanges | Giao dịch trao đổi |
| 10 | exchange_books | Sách trong giao dịch |
| 11 | exchange_suggestions | Gợi ý AI |
| 12 | book_match_pairs | Cặp sách match |
| 13 | conversations | Cuộc trò chuyện |
| 14 | messages | Tin nhắn |
| 15 | message_reactions | Reaction tin nhắn |
| 16 | reviews | Đánh giá |
| 17 | violation_reports | Báo cáo vi phạm |
| 18 | notifications | Thông báo |
| 19 | user_activity_logs | Log hoạt động |
| 20 | audit_logs | Log admin |
| 21 | blocked_members | Danh sách chặn |
| 22 | token_blacklist | Token bị vô hiệu |

### 5.2 Key Relationships

```
users (1) ─────── (0..1) members
users (1) ─────── (0..1) admins
members (1) ───── (1) personal_libraries
members (1) ───── (*) books
personal_libraries (1) ─── (*) books_wanted
members (1) ───── (*) exchange_requests [requester]
members (1) ───── (*) exchange_requests [receiver]
exchange_requests (1) ─── (0..1) exchanges
exchanges (1) ─── (*) exchange_books
exchanges (1) ─── (*) reviews
members (1) ───── (*) conversations
conversations (1) ─ (*) messages
```

---

## 6. Sequence Diagrams

### 6.1 Danh sách Sequence Diagrams

| File | Mô tả | Actors |
|------|-------|--------|
| `SD_01_Register.puml` | Đăng ký tài khoản | User, AuthService |
| `SD_02_Login.puml` | Đăng nhập | User, AuthService, JWT |
| `SD_03_CreateBook.puml` | Thêm sách mới | Member, BooksService |
| `SD_04_CreateExchangeRequest.puml` | Tạo yêu cầu trao đổi | Member, ExchangeService |
| `SD_05_AcceptExchange.puml` | Chấp nhận yêu cầu | Receiver, ExchangeService |
| `SD_06_ArrangeMeeting.puml` | Sắp xếp cuộc hẹn | Members, ExchangeService |
| `SD_07_CompleteExchange.puml` | Hoàn thành trao đổi | Members, TrustScoreService |
| `SD_08_SendMessage.puml` | Gửi tin nhắn real-time | Members, ChatGateway |
| `SD_09_GenerateSuggestions.puml` | AI Matching | Member, MatchingService |

### 6.2 Flow chính - Exchange Process

```
Member A                    System                    Member B
    │                          │                          │
    │──1. Create Request──────►│                          │
    │                          │──2. Notify──────────────►│
    │                          │◄─3. Accept──────────────│
    │◄─4. Notify Accept───────│                          │
    │──5. Arrange Meeting─────►│──6. Notify Meeting─────►│
    │                          │◄─7. Confirm Meeting─────│
    │◄─8. Meeting Confirmed───│                          │
    │                          │                          │
    │ ═══════ PHYSICAL MEETING ════════════════════════ │
    │                          │                          │
    │──9. Confirm Complete────►│                          │
    │                          │◄─10. Confirm Complete───│
    │◄─11. Exchange Completed─│──11. Exchange Completed─►│
    │                          │                          │
    │──12. Write Review───────►│                          │
    │                          │◄─13. Write Review───────│
```

---

## 7. Activity Diagrams

### 7.1 Danh sách Activity Diagrams

| File | Mô tả |
|------|-------|
| `AD_01_ExchangeFlow.puml` | Quy trình trao đổi sách end-to-end |
| `AD_02_AuthenticationFlow.puml` | Quy trình đăng ký, đăng nhập, quên mật khẩu |
| `AD_03_AIMatchingFlow.puml` | Thuật toán AI Matching chi tiết |

### 7.2 AI Matching Algorithm

```
Match Score = Σ (Component × Weight)

┌─────────────────────────────────────────────────────────────┐
│ Component          │ Weight │ Description                   │
├────────────────────┼────────┼───────────────────────────────┤
│ WANTED_MATCH       │  40%   │ Sách có/muốn trùng khớp       │
│ REGION_MATCH       │  20%   │ Cùng khu vực                  │
│ TRUST_SCORE        │  20%   │ Điểm tin cậy của partner      │
│ EXCHANGE_HISTORY   │  10%   │ Ưu tiên partner mới           │
│ CATEGORY_MATCH     │  10%   │ Category sách tương đồng      │
├────────────────────┼────────┼───────────────────────────────┤
│ TOTAL              │ 100%   │                               │
│ THRESHOLD          │  30%   │ Ngưỡng tối thiểu              │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. State Machine Diagrams

### 8.1 Danh sách State Diagrams

| File | Entity | States |
|------|--------|--------|
| `SM_01_ExchangeState.puml` | Exchange | PENDING → ACCEPTED → MEETING_SCHEDULED → COMPLETED/CANCELLED/EXPIRED |
| `SM_02_ExchangeRequestState.puml` | ExchangeRequest | PENDING → ACCEPTED/REJECTED/CANCELLED/EXPIRED |
| `SM_03_BookState.puml` | Book | AVAILABLE ↔ EXCHANGING → REMOVED |
| `SM_04_UserAccountState.puml` | User | UNVERIFIED → ACTIVE ↔ LOCKED/SUSPENDED → DELETED |

### 8.2 Exchange State Transitions

```
                    ┌─────────┐
         ┌─────────►│ EXPIRED │
         │          └─────────┘
         │ timeout       ▲
         │               │ timeout
    ┌────┴────┐    ┌─────┴─────┐    ┌───────────┐
───►│ PENDING │───►│ ACCEPTED  │───►│ MEETING   │
    └────┬────┘    └─────┬─────┘    │ SCHEDULED │
         │               │          └─────┬─────┘
         │ cancel        │ cancel         │ cancel
         ▼               ▼                ▼
    ┌─────────┐    ┌─────────┐    ┌─────────────┐
    │CANCELLED│◄───│CANCELLED│◄───│  CANCELLED  │
    └─────────┘    └─────────┘    └─────────────┘
                                        │ both confirm
                                        ▼
                                  ┌───────────┐
                                  │ COMPLETED │
                                  └───────────┘
```

---

## 9. Component Diagram

**File:** `docs/diagrams/component/COMP_SystemArchitecture.puml`

### 9.1 Backend Components

```
┌─────────────────────────────────────────────────────────────┐
│                     CONTROLLERS                             │
│  AuthController │ BooksController │ ExchangesController     │
│  MessagesController │ UsersController │ AdminController     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICES                               │
│  AuthService │ BooksService │ ExchangeService               │
│  MessagesService │ MatchingService │ TrustScoreService      │
│  NotificationService │ ReviewsService │ ReportsService      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    REPOSITORIES                             │
│  UserRepository │ MemberRepository │ BookRepository         │
│  ExchangeRepository │ MessageRepository │ ...               │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Frontend Components

```
┌─────────────────────────────────────────────────────────────┐
│                       PAGES                                 │
│  HomePage │ AuthPages │ BookPages │ ExchangePages           │
│  MessagingPages │ ProfilePages │ AdminPages                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    COMPONENTS                               │
│  BookCard │ ExchangeCard │ MessageBubble │ Navigation       │
│  Forms │ Modals │ Charts │ Tables                           │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICES                                │
│  APIService (Axios) │ AuthService │ SocketService           │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Deployment Diagram

**File:** `docs/diagrams/deployment/DEP_Deployment.puml`

### 10.1 Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET                                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (443)                              │
│  • SSL Termination  • Load Balancing  • Rate Limiting       │
└───────────────────────────┬─────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ Backend 1 │   │ Backend 2 │   │ Backend N │
    │  (3000)   │   │  (3000)   │   │  (3000)   │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │               │               │
          └───────────────┼───────────────┘
                          │
            ┌─────────────┼─────────────┐
            ▼             ▼             ▼
    ┌───────────┐   ┌───────────┐  ┌───────────┐
    │  MySQL    │   │   Redis   │  │   Files   │
    │  (3306)   │   │  (6379)   │  │ (uploads) │
    └───────────┘   └───────────┘  └───────────┘
```

### 10.2 Development Environment

```bash
# Docker Compose
docker-compose up -d

# Services
- MySQL:    localhost:3306
- Redis:    localhost:6379
- Backend:  localhost:3000
- Frontend: localhost:5173
```

---

## 11. API Specification

### 11.1 Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Đăng ký tài khoản |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/logout` | Đăng xuất |
| POST | `/auth/forgot-password` | Quên mật khẩu |
| POST | `/auth/reset-password` | Đặt lại mật khẩu |
| GET | `/auth/verify-email` | Xác thực email |
| POST | `/auth/refresh-token` | Làm mới token |

### 11.2 Books APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/books` | Danh sách sách |
| GET | `/books/:id` | Chi tiết sách |
| POST | `/books` | Thêm sách mới |
| PATCH | `/books/:id` | Cập nhật sách |
| DELETE | `/books/:id` | Xóa sách |
| GET | `/books/wanted` | Sách mong muốn |
| POST | `/books/wanted` | Thêm sách mong muốn |

### 11.3 Exchange APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/exchanges/requests` | Tạo yêu cầu |
| GET | `/exchanges/requests/sent` | Yêu cầu đã gửi |
| GET | `/exchanges/requests/received` | Yêu cầu nhận được |
| POST | `/exchanges/requests/:id/accept` | Chấp nhận |
| POST | `/exchanges/requests/:id/reject` | Từ chối |
| GET | `/exchanges` | Danh sách exchanges |
| GET | `/exchanges/:id` | Chi tiết exchange |
| POST | `/exchanges/:id/meeting` | Hẹn gặp |
| POST | `/exchanges/:id/confirm` | Xác nhận hoàn thành |
| POST | `/exchanges/:id/cancel` | Hủy trao đổi |

### 11.4 Suggestions (AI) APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/exchanges/suggestions/generate` | Tạo gợi ý mới |
| GET | `/exchanges/suggestions` | Danh sách gợi ý |
| PATCH | `/exchanges/suggestions/:id/viewed` | Đánh dấu đã xem |
| DELETE | `/exchanges/suggestions/:id` | Xóa gợi ý |

### 11.5 Messages APIs (REST + WebSocket)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages/conversations` | Danh sách conversations |
| GET | `/messages/conversations/:id` | Tin nhắn trong conversation |
| POST | `/messages` | Gửi tin nhắn |
| DELETE | `/messages/:id` | Xóa tin nhắn |

**WebSocket Events:**

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_conversation` | Client → Server | Join room |
| `leave_conversation` | Client → Server | Leave room |
| `send_message` | Client → Server | Gửi tin nhắn |
| `message_sent` | Server → Client | Tin nhắn mới |
| `typing` | Bidirectional | Đang nhập |
| `messages_read` | Server → Client | Đã đọc |

---

## 12. Database Schema

### 12.1 Core Tables Schema

```sql
-- Users Table
CREATE TABLE users (
    user_id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    role ENUM('GUEST','MEMBER','ADMIN') DEFAULT 'MEMBER',
    account_status ENUM('ACTIVE','LOCKED','SUSPENDED','DELETED') DEFAULT 'ACTIVE',
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    login_attempts INT DEFAULT 0,
    lock_reason VARCHAR(500),
    locked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Members Table
CREATE TABLE members (
    member_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    region VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    bio TEXT,
    trust_score DECIMAL(5,2) DEFAULT 50.00,
    average_rating DECIMAL(2,1) DEFAULT 0.0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen_at TIMESTAMP NULL,
    notification_settings JSON,
    total_exchanges INT DEFAULT 0,
    completed_exchanges INT DEFAULT 0,
    cancelled_exchanges INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Books Table
CREATE TABLE books (
    book_id CHAR(36) PRIMARY KEY,
    owner_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    isbn VARCHAR(20),
    google_books_id VARCHAR(100),
    publisher VARCHAR(255),
    publish_date DATE,
    description TEXT,
    category VARCHAR(100),
    language VARCHAR(50),
    page_count INT,
    cover_image_url VARCHAR(500),
    book_condition ENUM('LIKE_NEW','VERY_GOOD','GOOD','FAIR','POOR'),
    status ENUM('AVAILABLE','EXCHANGING','REMOVED') DEFAULT 'AVAILABLE',
    views INT DEFAULT 0,
    user_photos JSON,
    condition_notes TEXT,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES members(member_id)
);
```

### 12.2 Index Strategy

```sql
-- Performance Indexes
CREATE INDEX idx_books_owner ON books(owner_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_exchanges_status ON exchanges(status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_notifications_member ON notifications(member_id, is_read);
```

---

## 13. Security Design

### 13.1 Authentication

- **JWT Token**: Access token có thời hạn 7 ngày
- **Password Hashing**: bcrypt với salt rounds = 10
- **Email Verification**: Required before login
- **Token Blacklist**: Logout invalidates tokens

### 13.2 Authorization

```typescript
// Guard-based authorization
@UseGuards(JwtAuthGuard)           // Requires authentication
@UseGuards(JwtAuthGuard, RolesGuard)  // Requires specific role
@Roles('ADMIN')                    // Admin only
```

### 13.3 Data Protection

- **Input Validation**: class-validator DTOs
- **SQL Injection**: TypeORM parameterized queries
- **XSS Protection**: Response sanitization
- **CORS**: Configured allowed origins
- **Rate Limiting**: Request throttling

### 13.4 Trust Score System

| Action | Score Change |
|--------|-------------|
| Complete Exchange | +5 |
| Receive 5-star Review | +3 |
| Receive 4-star Review | +1 |
| Cancel Exchange | -3 |
| No-show at Meeting | -5 |
| Receive Violation Report | -10 |

---

## 14. Appendices

### 14.1 Diagram Files Index

```
docs/diagrams/
├── use-case/
│   ├── UC_01_Overview.puml
│   ├── UC_02_Authentication.puml
│   ├── UC_03_BookManagement.puml
│   ├── UC_04_Exchange.puml
│   ├── UC_05_Messaging.puml
│   └── UC_06_Admin.puml
├── class/
│   └── CD_01_Entities.puml
├── erd/
│   └── ERD_Complete.puml
├── sequence/
│   ├── SD_01_Register.puml
│   ├── SD_02_Login.puml
│   ├── SD_03_CreateBook.puml
│   ├── SD_04_CreateExchangeRequest.puml
│   ├── SD_05_AcceptExchange.puml
│   ├── SD_06_ArrangeMeeting.puml
│   ├── SD_07_CompleteExchange.puml
│   ├── SD_08_SendMessage.puml
│   └── SD_09_GenerateSuggestions.puml
├── activity/
│   ├── AD_01_ExchangeFlow.puml
│   ├── AD_02_AuthenticationFlow.puml
│   └── AD_03_AIMatchingFlow.puml
├── state/
│   ├── SM_01_ExchangeState.puml
│   ├── SM_02_ExchangeRequestState.puml
│   ├── SM_03_BookState.puml
│   └── SM_04_UserAccountState.puml
├── component/
│   └── COMP_SystemArchitecture.puml
└── deployment/
    └── DEP_Deployment.puml
```

### 14.2 Generating Diagrams

```bash
# Install PlantUML
# Using VS Code extension: PlantUML by jebbs

# Generate PNG from PUML
java -jar plantuml.jar docs/diagrams/**/*.puml

# Generate SVG
java -jar plantuml.jar -tsvg docs/diagrams/**/*.puml
```

### 14.3 References

- UML 2.5 Specification: https://www.omg.org/spec/UML/2.5
- PlantUML Documentation: https://plantuml.com
- NestJS Documentation: https://docs.nestjs.com
- TypeORM Documentation: https://typeorm.io

---

**Document Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 07/12/2024 | Team | Initial release |

---

*© 2024 BookSwap Team. All rights reserved.*
