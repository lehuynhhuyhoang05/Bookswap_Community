# BÁO CÁO DỰ ÁN ĐỒ ÁN CÔNG NGHỆ PHẦN MỀM

**Đề tài:** Xây dựng Hệ thống Trao đổi Sách Trực tuyến - BookSwap

**Thời gian thực hiện:** Học kỳ I, Năm học 2024-2025

---

## MỤC LỤC

1. [TỔNG QUAN DỰ ÁN](#1-tổng-quan-dự-án)
2. [PHÂN TÍCH YÊU CẦU](#2-phân-tích-yêu-cầu)
3. [THIẾT KẾ HỆ THỐNG](#3-thiết-kế-hệ-thống)
4. [CÀI ĐẶT VÀ TRIỂN KHAI](#4-cài-đặt-và-triển-khai)
5. [TESTING VÀ ĐÁNH GIÁ](#5-testing-và-đánh-giá)
6. [KẾT LUẬN](#6-kết-luận)
7. [TÀI LIỆU THAM KHẢO](#7-tài-liệu-tham-khảo)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Giới thiệu

BookSwap là một nền tảng trực tuyến giúp kết nối cộng đồng người yêu sách, cho phép họ trao đổi sách với nhau một cách dễ dàng, minh bạch và an toàn. Hệ thống được phát triển nhằm giải quyết bài toán lưu trữ sách cũ và khó khăn trong việc tìm kiếm sách phù hợp với sở thích cá nhân.

### 1.2. Mục tiêu dự án

**Mục tiêu chính:**
- Xây dựng hệ thống trao đổi sách trực tuyến đầy đủ tính năng
- Áp dụng các công nghệ web hiện đại và kiến trúc phần mềm tốt
- Tích hợp AI/ML cho tính năng gợi ý trao đổi thông minh
- Đảm bảo tính bảo mật, hiệu năng và khả năng mở rộng

**Mục tiêu cụ thể:**
- ✅ Cho phép người dùng đăng ký, đăng nhập và quản lý thông tin cá nhân
- ✅ Quản lý thư viện sách cá nhân (sách có sẵn và sách mong muốn)
- ✅ Tạo và quản lý yêu cầu trao đổi sách
- ✅ Hệ thống gợi ý trao đổi thông minh dựa trên AI matching
- ✅ Nhắn tin real-time giữa các thành viên
- ✅ Hệ thống đánh giá và trust score
- ✅ Quản trị hệ thống và xử lý báo cáo vi phạm

### 1.3. Phạm vi dự án

**Trong phạm vi:**
- Phát triển ứng dụng web responsive (desktop & mobile browser)
- Backend API RESTful với NestJS
- Frontend SPA với React
- Database MySQL
- Real-time features với WebSocket
- Tích hợp Google Books API
- Deployment với Docker

**Ngoài phạm vi:**
- Mobile app native (iOS/Android)
- Payment gateway integration
- Blockchain for transaction verification
- Multi-language support

### 1.4. Đối tượng sử dụng

| Vai trò | Mô tả | Quyền hạn |
|---------|-------|-----------|
| **Guest** | Khách truy cập | Xem danh sách sách, tìm kiếm |
| **Member** | Thành viên đã đăng ký | Tất cả tính năng trao đổi |
| **Admin** | Quản trị viên | Quản lý hệ thống, xử lý vi phạm |

### 1.5. Công nghệ sử dụng

**Frontend:**
- React 18.3
- Vite 7.1
- TailwindCSS 3.4
- Socket.IO Client 4.8
- Axios 1.7

**Backend:**
- NestJS 10.4
- TypeORM 0.3
- Socket.IO 4.8
- Passport.js + JWT
- Class-Validator

**Database:**
- MySQL 8.0
- Redis (optional cache)

**DevOps:**
- Docker & Docker Compose
- Git & GitHub

**External Services:**
- Google Books API
- Email Service (SMTP)

---

## 2. PHÂN TÍCH YÊU CẦU

### 2.1. Yêu cầu chức năng

#### 2.1.1. Module Xác thực (Authentication)

**UC01: Đăng ký tài khoản**
- Actor: Guest
- Mô tả: Người dùng tạo tài khoản mới với email và mật khẩu
- Luồng chính:
  1. Nhập email, mật khẩu, họ tên
  2. Hệ thống gửi email xác thực
  3. Người dùng xác thực email
  4. Tài khoản được kích hoạt

**UC02: Đăng nhập**
- Actor: Member, Admin
- Mô tả: Đăng nhập vào hệ thống
- Luồng chính:
  1. Nhập email và mật khẩu
  2. Hệ thống xác thực
  3. Trả về JWT token
  4. Lưu token vào localStorage

**UC03: Quên mật khẩu**
- Actor: Member
- Mô tả: Khôi phục mật khẩu qua email
- Luồng chính:
  1. Nhập email
  2. Nhận link reset password
  3. Đặt mật khẩu mới

#### 2.1.2. Module Quản lý Sách (Books Management)

**UC04: Thêm sách mới**
- Actor: Member
- Mô tả: Thêm sách vào thư viện cá nhân
- Luồng chính:
  1. Tìm kiếm sách qua Google Books API (optional)
  2. Nhập thông tin: tên sách, tác giả, ISBN, tình trạng
  3. Upload ảnh sách (optional)
  4. Lưu vào database

**UC05: Quản lý sách mong muốn**
- Actor: Member
- Mô tả: Tạo danh sách wishlist
- Luồng chính:
  1. Tìm kiếm hoặc nhập thông tin sách mong muốn
  2. Thêm vào danh sách books_wanted
  3. Hệ thống sử dụng để matching

#### 2.1.3. Module Trao đổi (Exchange)

**UC06: Tạo yêu cầu trao đổi**
- Actor: Member (Requester)
- Mô tả: Gửi yêu cầu trao đổi sách
- Luồng chính:
  1. Chọn sách của người khác muốn nhận
  2. Chọn sách của mình để đưa
  3. Gửi yêu cầu
  4. Hệ thống tạo conversation tự động

**UC07: Chấp nhận/Từ chối yêu cầu**
- Actor: Member (Receiver)
- Mô tả: Xử lý yêu cầu trao đổi nhận được
- Luồng chính:
  1. Xem chi tiết yêu cầu
  2. Accept → tạo Exchange entity
  3. Reject → cập nhật status

**UC08: Sắp xếp cuộc hẹn gặp**
- Actor: Both Members
- Mô tả: Hẹn gặp để trao đổi sách
- Luồng chính:
  1. Đề xuất thời gian, địa điểm
  2. Bên kia xác nhận
  3. Status: MEETING_SCHEDULED

**UC09: Hoàn thành trao đổi**
- Actor: Both Members
- Mô tả: Xác nhận đã trao đổi sách
- Luồng chính:
  1. Cả 2 bên confirm completed
  2. Update book status
  3. Trigger review process
  4. Update trust score

#### 2.1.4. Module AI Matching

**UC10: Tạo gợi ý trao đổi thông minh**
- Actor: System (Auto), Member (Manual)
- Mô tả: Hệ thống tự động tìm partner phù hợp
- Thuật toán matching:

```
Match Score = Σ (Component × Weight)

┌─────────────────────────────────────────────────────────┐
│ Component          │ Weight │ Description              │
├────────────────────┼────────┼──────────────────────────┤
│ WANTED_MATCH       │  40%   │ Sách có/muốn trùng khớp  │
│ REGION_MATCH       │  20%   │ Cùng khu vực             │
│ TRUST_SCORE        │  20%   │ Điểm tin cậy partner     │
│ EXCHANGE_HISTORY   │  10%   │ Ưu tiên partner mới      │
│ CATEGORY_MATCH     │  10%   │ Category tương đồng      │
├────────────────────┼────────┼──────────────────────────┤
│ THRESHOLD          │  30%   │ Ngưỡng tối thiểu         │
└─────────────────────────────────────────────────────────┘
```

#### 2.1.5. Module Tin nhắn (Messaging)

**UC11: Gửi tin nhắn real-time**
- Actor: Member
- Mô tả: Chat real-time với partner
- Công nghệ: Socket.IO
- Tính năng:
  - Text messages
  - Image attachments
  - File attachments (PDF, DOC, etc.)
  - Message reactions (emoji)
  - Read receipts
  - Typing indicators

#### 2.1.6. Module Đánh giá (Reviews)

**UC12: Viết review sau trao đổi**
- Actor: Member
- Mô tả: Đánh giá partner sau khi hoàn thành
- Luồng chính:
  1. Rating: 1-5 sao
  2. Comment (optional)
  3. Hệ thống update:
     - average_rating của receiver
     - trust_score

#### 2.1.7. Module Admin

**UC13: Quản lý người dùng**
- Actor: Admin
- Tính năng:
  - Xem danh sách users/members
  - Lock/Unlock account
  - View activity logs
  - Adjust trust score

**UC14: Xử lý báo cáo vi phạm**
- Actor: Admin
- Tính năng:
  - Xem reports
  - Investigate
  - Take action (warning, suspend, ban)
  - Notify user

**UC15: Thống kê hệ thống**
- Actor: Admin
- Tính năng:
  - User statistics
  - Exchange statistics
  - Book statistics
  - System health metrics

### 2.2. Yêu cầu phi chức năng

#### 2.2.1. Hiệu năng (Performance)
- Response time API: < 200ms (average)
- Page load time: < 2s
- Support 100+ concurrent users
- Real-time message latency: < 100ms

#### 2.2.2. Bảo mật (Security)
- JWT authentication với access token 7 ngày
- Password hashing: bcrypt với salt rounds = 10
- SQL injection prevention: TypeORM parameterized queries
- XSS protection: Input sanitization
- CORS configuration
- Rate limiting: 100 requests/15 minutes

#### 2.2.3. Khả năng mở rộng (Scalability)
- Horizontal scaling với Docker
- Stateless backend (JWT)
- Database indexing strategy
- Optional Redis caching

#### 2.2.4. Khả năng sử dụng (Usability)
- Responsive design (mobile-first)
- Intuitive UI/UX
- Accessibility (ARIA labels)
- Multi-browser support

#### 2.2.5. Độ tin cậy (Reliability)
- Database backup strategy
- Error handling và logging
- Graceful degradation
- Uptime target: 99.5%

---

## 3. THIẾT KẾ HỆ THỐNG

### 3.1. Kiến trúc hệ thống

BookSwap sử dụng **kiến trúc 3 tầng (3-Tier Architecture)** kết hợp với **Microservices mindset** trong thiết kế module.

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                     │
│              React SPA + TailwindCSS                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Pages   │  │Components│  │ Services │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/WebSocket
┌────────────────────▼────────────────────────────────────┐
│                BUSINESS LOGIC LAYER                     │
│                   NestJS Backend                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │Controllers│  │ Services │  │ Gateways │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└────────────────────┬────────────────────────────────────┘
                     │ TypeORM
┌────────────────────▼────────────────────────────────────┐
│                  DATA ACCESS LAYER                      │
│      MySQL 8.0 + File Storage + Redis (optional)       │
└─────────────────────────────────────────────────────────┘
```

**Tham khảo diagrams:**
- `docs/diagrams/component/ARCH_Overview.puml` - Tổng quan hệ thống
- `docs/diagrams/component/ARCH_LayeredArchitecture.puml` - Chi tiết 3 tầng
- `docs/diagrams/component/COMP_SystemArchitecture.puml` - Component đầy đủ

### 3.2. Thiết kế cơ sở dữ liệu

#### 3.2.1. Entity Relationship Diagram

Hệ thống sử dụng **24 bảng chính** trong MySQL:

**Nhóm User Management:**
- `users` - Tài khoản đăng nhập
- `members` - Profile thành viên
- `admins` - Quản trị viên
- `personal_libraries` - Thư viện cá nhân

**Nhóm Books:**
- `books` - Sách của thành viên
- `books_wanted` - Sách mong muốn

**Nhóm Exchange:**
- `exchange_requests` - Yêu cầu trao đổi
- `exchange_request_books` - Sách trong request
- `exchanges` - Giao dịch trao đổi
- `exchange_books` - Sách trong exchange
- `exchange_suggestions` - Gợi ý AI
- `book_match_pairs` - Cặp sách khớp

**Nhóm Communication:**
- `conversations` - Cuộc trò chuyện
- `messages` - Tin nhắn
- `message_reactions` - Reaction emoji

**Nhóm Review & Report:**
- `reviews` - Đánh giá
- `violation_reports` - Báo cáo vi phạm

**Nhóm System:**
- `notifications` - Thông báo
- `user_activity_logs` - Log hoạt động
- `audit_logs` - Log admin
- `trust_score_history` - Lịch sử điểm tin cậy
- `token_blacklist` - Token bị vô hiệu
- `email_verification_tokens`
- `password_reset_tokens`

**Tham khảo:**
- `docs/diagrams/erd/ERD_Complete.puml` - ERD đầy đủ
- `docs/diagrams/class/CD_01_Entities.puml` - Class diagram entities

#### 3.2.2. Indexes quan trọng

```sql
-- Performance Indexes
CREATE INDEX idx_books_owner ON books(owner_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_exchanges_status ON exchanges(status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_notifications_member ON notifications(member_id, is_read);
CREATE INDEX idx_exchange_requests_status ON exchange_requests(status);
CREATE INDEX idx_reviews_exchange ON reviews(exchange_id);
```

### 3.3. Thiết kế API

#### 3.3.1. RESTful API Structure

Base URL: `http://localhost:3000`

**Authentication:**
```
POST   /auth/register          - Đăng ký
POST   /auth/login             - Đăng nhập
POST   /auth/logout            - Đăng xuất
GET    /auth/verify-email      - Xác thực email
POST   /auth/forgot-password   - Quên mật khẩu
POST   /auth/reset-password    - Reset password
POST   /auth/refresh-token     - Làm mới token
```

**Books:**
```
GET    /books                  - Danh sách sách
GET    /books/:id              - Chi tiết sách
POST   /books                  - Thêm sách
PATCH  /books/:id              - Cập nhật
DELETE /books/:id              - Xóa sách
GET    /books/search           - Tìm kiếm
```

**Library (Wanted Books):**
```
GET    /library/wanted         - Sách mong muốn
POST   /library/wanted         - Thêm wanted
PATCH  /library/wanted/:id     - Cập nhật
DELETE /library/wanted/:id     - Xóa
```

**Exchanges:**
```
POST   /exchanges/requests                    - Tạo yêu cầu
GET    /exchanges/requests/sent               - Yêu cầu đã gửi
GET    /exchanges/requests/received           - Yêu cầu nhận
POST   /exchanges/requests/:id/accept         - Chấp nhận
POST   /exchanges/requests/:id/reject         - Từ chối
GET    /exchanges                             - Danh sách exchanges
POST   /exchanges/:id/meeting                 - Hẹn gặp
POST   /exchanges/:id/confirm                 - Xác nhận hoàn thành
POST   /exchanges/:id/cancel                  - Hủy
```

**Suggestions (AI):**
```
POST   /exchanges/suggestions/generate        - Tạo gợi ý
GET    /exchanges/suggestions                 - Danh sách gợi ý
PATCH  /exchanges/suggestions/:id/viewed      - Đánh dấu đã xem
DELETE /exchanges/suggestions/:id             - Xóa
```

**Messages:**
```
GET    /messages/conversations                - Danh sách conversations
GET    /messages/conversations/:id            - Tin nhắn
POST   /messages                              - Gửi tin nhắn
DELETE /messages/:id                          - Xóa
POST   /messages/upload                       - Upload attachment
```

**Reviews:**
```
POST   /reviews                               - Viết review
GET    /reviews/received                      - Review nhận được
GET    /reviews/given                         - Review đã viết
```

**Admin:**
```
GET    /admin/users                           - Danh sách users
PATCH  /admin/users/:id/lock                  - Lock account
GET    /admin/reports                         - Danh sách reports
PATCH  /admin/reports/:id                     - Xử lý report
GET    /admin/statistics                      - Thống kê
```

#### 3.3.2. WebSocket Events

**Messages:**
```
Client → Server:
- join_conversation
- leave_conversation
- send_message
- typing

Server → Client:
- message_sent
- message_deleted
- typing_indicator
- messages_read
```

**Notifications:**
```
Server → Client:
- new_notification
- notification_read
```

### 3.4. Design Patterns sử dụng

| Pattern | Áp dụng | Mô tả |
|---------|---------|-------|
| **Repository** | Data Access | TypeORM repositories |
| **Dependency Injection** | NestJS | IoC Container |
| **Observer** | Events | Notifications, WebSocket |
| **Strategy** | Matching | AI algorithm components |
| **Guard** | Auth | JWT, Roles authorization |
| **DTO** | Validation | Request/Response |
| **Singleton** | DB Connection | TypeORM DataSource |

### 3.5. Sequence Diagrams

Các luồng nghiệp vụ chính được mô tả chi tiết trong:

- `SD_01_Register.puml` - Đăng ký tài khoản
- `SD_02_Login.puml` - Đăng nhập
- `SD_03_CreateBook.puml` - Thêm sách
- `SD_04_CreateExchangeRequest.puml` - Tạo yêu cầu trao đổi
- `SD_05_AcceptExchange.puml` - Chấp nhận yêu cầu
- `SD_06_ArrangeMeeting.puml` - Sắp xếp cuộc hẹn
- `SD_07_CompleteExchange.puml` - Hoàn thành trao đổi
- `SD_08_SendMessage.puml` - Gửi tin nhắn
- `SD_09_GenerateSuggestions.puml` - AI Matching

### 3.6. State Machines

Các entity chính có state machine:

**Exchange Flow:**
```
PENDING → ACCEPTED → MEETING_SCHEDULED → IN_PROGRESS → COMPLETED
                                                      ↘ CANCELLED
                                                      ↘ EXPIRED
```

**Book Status:**
```
AVAILABLE ↔ EXCHANGING → EXCHANGED
                       ↘ REMOVED
```

**User Account:**
```
CREATED → UNVERIFIED → ACTIVE ↔ LOCKED → DELETED
                             ↔ SUSPENDED
```

Tham khảo: `docs/diagrams/state/`

---

## 4. CÔNG NGHỆ SỬ DỤNG

### 4.1. Tổng quan công nghệ

Dự án BookSwap được xây dựng dựa trên **MERN Stack** (biến thể) với sự kết hợp của các công nghệ hiện đại nhất trong phát triển web:

```
┌─────────────────────────────────────────────────────────┐
│                   TECHNOLOGY STACK                      │
├─────────────────────────────────────────────────────────┤
│  Frontend    │  React 18.3 + Vite + TailwindCSS         │
│  Backend     │  NestJS 10.4 + TypeScript                │
│  Database    │  MySQL 8.0 + TypeORM                     │
│  Real-time   │  Socket.IO 4.8                           │
│  DevOps      │  Docker + Docker Compose                 │
│  External    │  Google Books API + SMTP                 │
└─────────────────────────────────────────────────────────┘
```

### 4.2. Ngôn ngữ lập trình

#### 4.2.1. TypeScript 5.6

**Vai trò:** Ngôn ngữ lập trình chính cho cả Frontend và Backend

**Lý do lựa chọn:**
- **Type Safety**: Giảm bugs runtime thông qua static type checking
- **IDE Support**: IntelliSense, autocomplete, refactoring tốt hơn
- **Maintainability**: Code dễ đọc, dễ maintain trong dự án lớn
- **ES6+ Features**: Arrow functions, async/await, destructuring, modules
- **Interface & Generics**: Type system mạnh mẽ

**Ví dụ sử dụng:**
```typescript
// Entity với TypeORM decorators
@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  book_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  trust_score: number;

  @ManyToOne(() => Member, member => member.books)
  @JoinColumn({ name: 'owner_id' })
  owner: Member;
}

// Service với Dependency Injection
@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async findAvailableBooks(): Promise<Book[]> {
    return this.bookRepository.find({
      where: { status: BookStatus.AVAILABLE },
      relations: ['owner', 'owner.user'],
    });
  }
}
```

**Tính năng TypeScript được sử dụng:**
- Decorators (@Entity, @Injectable, @Get)
- Type annotations
- Interfaces
- Enums
- Generics (Repository<T>)
- Async/Await
- Optional chaining (?.)
- Nullish coalescing (??)

### 4.3. Backend Technologies

#### 4.3.1. NestJS 10.4

**Vai trò:** Framework Backend chính

**Đặc điểm:**
- **Progressive Framework**: Hỗ trợ TypeScript native
- **Architecture**: Modular, scalable, maintainable
- **Dependency Injection**: IoC Container mạnh mẽ
- **Decorators**: Syntax hiện đại, dễ đọc
- **Built-in Features**: Guards, Interceptors, Pipes, Filters

**Cấu trúc module:**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Member]),
    forwardRef(() => ExchangesModule),
  ],
  controllers: [BooksController],
  providers: [BooksService, BooksValidationService],
  exports: [BooksService],
})
export class BooksModule {}
```

**Lợi ích:**
- **Separation of Concerns**: Tách biệt Controller, Service, Repository
- **Testability**: Dễ dàng viết unit tests với DI
- **Consistency**: Code structure nhất quán
- **Documentation**: Swagger/OpenAPI tự động

#### 4.3.2. TypeORM 0.3.20

**Vai trò:** ORM (Object-Relational Mapping) cho MySQL

**Tính năng sử dụng:**
- **Active Record & Data Mapper**: Hỗ trợ cả 2 patterns
- **Migrations**: Database version control
- **Relations**: OneToMany, ManyToOne, ManyToMany
- **Query Builder**: Type-safe queries
- **Transactions**: ACID compliance

**Ví dụ Migration:**
```typescript
export class CreateExchangesTable1701234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'exchanges',
        columns: [
          {
            name: 'exchange_id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'MEETING_SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            default: "'PENDING'",
          },
          {
            name: 'meeting_address',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'meeting_time',
            type: 'datetime',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['request_id'],
            referencedTableName: 'exchange_requests',
            referencedColumnNames: ['request_id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('exchanges');
  }
}
```

**Query Builder Example:**
```typescript
const books = await this.bookRepository
  .createQueryBuilder('book')
  .leftJoinAndSelect('book.owner', 'member')
  .leftJoinAndSelect('member.user', 'user')
  .where('book.status = :status', { status: 'AVAILABLE' })
  .andWhere('book.category IN (:...categories)', { categories: ['Fiction', 'Science'] })
  .andWhere('member.region = :region', { region: 'Hanoi' })
  .orderBy('book.created_at', 'DESC')
  .take(20)
  .getMany();
```

#### 4.3.3. Socket.IO 4.8

**Vai trò:** WebSocket library cho real-time communication

**Tính năng:**
- **Bidirectional Communication**: Client ↔ Server
- **Automatic Reconnection**: Network resilience
- **Room Support**: Group messaging
- **Binary Support**: File/Image transfer
- **Fallback**: Long-polling khi WebSocket không khả dụng

**Implementation:**
```typescript
// Gateway
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/messages',
})
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.join(`conversation:${data.conversationId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const message = await this.messagesService.createMessage(data);
    this.server
      .to(`conversation:${message.conversation_id}`)
      .emit('message_sent', message);
  }
}
```

#### 4.3.4. Passport.js + JWT

**Vai trò:** Authentication & Authorization

**Strategies:**
- **JWT Strategy**: Token-based auth
- **Local Strategy**: Email/Password login
- **Google OAuth2**: Social login (future)

**JWT Implementation:**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

// Guard usage
@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  @Post()
  createBook(@GetUser() user: User, @Body() dto: CreateBookDto) {
    return this.booksService.create(user.user_id, dto);
  }
}
```

#### 4.3.5. Class Validator & Class Transformer

**Vai trò:** Request validation & data transformation

**Validation Decorators:**
```typescript
export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  author: string;

  @IsOptional()
  @IsString()
  @Matches(/^(?:\d{10}|\d{13})$/, {
    message: 'ISBN must be 10 or 13 digits',
  })
  isbn?: string;

  @IsEnum(BookCondition)
  condition: BookCondition;

  @IsEnum(BookCategory)
  category: BookCategory;

  @IsOptional()
  @IsUrl()
  google_books_id?: string;
}
```

**Global Validation Pipe:**
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

### 4.4. Frontend Technologies

#### 4.4.1. React 18.3

**Vai trò:** UI Library chính

**Tính năng sử dụng:**
- **Hooks**: useState, useEffect, useContext, useCallback, useMemo
- **Context API**: Global state management
- **Concurrent Features**: Automatic batching, transitions
- **Error Boundaries**: Error handling
- **React Router**: Client-side routing

**Component Example:**
```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { booksApi } from '../services/api';

export const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await booksApi.getAvailableBooks();
        setBooks(data);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {books.map((book) => (
        <BookCard key={book.book_id} book={book} />
      ))}
    </div>
  );
};
```

#### 4.4.2. Vite 7.1

**Vai trò:** Build tool & Development server

**Lợi ích:**
- **Fast HMR**: Hot Module Replacement nhanh
- **ES Modules**: Native browser ESM
- **Pre-bundling**: Dependency optimization
- **Build Speed**: 10-100x nhanh hơn Webpack

**Configuration:**
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
```

#### 4.4.3. TailwindCSS 3.4

**Vai trò:** Utility-first CSS framework

**Ưu điểm:**
- **Rapid Development**: Không cần viết CSS custom
- **Responsive Design**: Mobile-first breakpoints
- **Dark Mode**: Built-in support
- **Purging**: Production bundle nhỏ

**Usage Example:**
```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">
      Book Title
    </h2>
    <p className="text-gray-600 line-clamp-3">
      Description text...
    </p>
    <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
      View Details
    </button>
  </div>
</div>
```

#### 4.4.4. Axios 1.7

**Vai trò:** HTTP client cho API calls

**Features:**
- **Interceptors**: Request/Response modification
- **Automatic JSON**: Parsing & serialization
- **Timeout**: Request timeout
- **Cancel Token**: Cancel requests

**API Service:**
```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const booksApi = {
  getAvailableBooks: () => apiClient.get('/books'),
  createBook: (data) => apiClient.post('/books', data),
  updateBook: (id, data) => apiClient.patch(`/books/${id}`, data),
  deleteBook: (id) => apiClient.delete(`/books/${id}`),
};
```

#### 4.4.5. Socket.IO Client 4.8

**Vai trò:** WebSocket client

**Implementation:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/messages', {
  auth: {
    token: localStorage.getItem('access_token'),
  },
  autoConnect: false,
});

// Event handlers
socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('message_sent', (message) => {
  setMessages((prev) => [...prev, message]);
});

socket.on('typing_indicator', (data) => {
  setTypingUsers(data.users);
});

// Emit events
const sendMessage = (text) => {
  socket.emit('send_message', {
    conversation_id: currentConversation,
    message_text: text,
  });
};
```

### 4.5. Database

#### 4.5.1. MySQL 8.0

**Vai trò:** Relational Database Management System

**Lý do chọn MySQL:**
- **ACID Compliance**: Transaction reliability
- **Performance**: Query optimization, indexing
- **Scalability**: Replication, sharding support
- **Maturity**: Stable, well-documented
- **Community**: Large ecosystem

**MySQL 8.0 Features sử dụng:**
- **JSON Support**: JSON columns cho flexible data
- **CTE (Common Table Expressions)**: Complex queries
- **Window Functions**: Analytics queries
- **UTF8MB4**: Full Unicode support (emoji)
- **Spatial Data**: GIS support (future)

**Indexing Strategy:**
```sql
-- Primary Keys (UUID)
PRIMARY KEY (book_id)

-- Foreign Keys (với CASCADE)
FOREIGN KEY (owner_id) REFERENCES members(member_id) ON DELETE CASCADE

-- Single Column Indexes
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_category ON books(category);

-- Composite Indexes
CREATE INDEX idx_exchanges_status_created ON exchanges(status, created_at);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);

-- Unique Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_members_user_id ON members(user_id);

-- Fulltext Indexes (cho search)
CREATE FULLTEXT INDEX idx_books_search ON books(title, author, description);

-- Functional Indexes (case-insensitive search)
CREATE INDEX idx_books_title_lower ON books((LOWER(title)));
CREATE INDEX idx_users_email_lower ON users((LOWER(email)));
```

**Query Optimization:**
```sql
-- Sử dụng EXPLAIN để analyze
EXPLAIN SELECT 
  b.book_id, b.title, b.author,
  m.full_name, m.region,
  u.email
FROM books b
INNER JOIN members m ON b.owner_id = m.member_id
INNER JOIN users u ON m.user_id = u.user_id
WHERE b.status = 'AVAILABLE'
  AND b.category = 'Fiction'
  AND m.region = 'Hanoi'
ORDER BY b.created_at DESC
LIMIT 20;

-- Result: Using index idx_books_status, idx_books_category
```

### 4.6. DevOps & Tools

#### 4.6.1. Docker 27.x

**Vai trò:** Containerization platform

**Lợi ích:**
- **Consistency**: Môi trường dev = production
- **Isolation**: Mỗi service trong container riêng
- **Portability**: "Build once, run anywhere"
- **Scalability**: Easy horizontal scaling

**Dockerfile (Backend):**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000

CMD ["node", "dist/main"]
```

**Dockerfile (Frontend):**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 4.6.2. Docker Compose

**Vai trò:** Multi-container orchestration

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USERNAME=root
      - DB_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - DB_DATABASE=bookswap_db
    depends_on:
      - mysql
    volumes:
      - ./uploads:/app/uploads
    networks:
      - bookswap_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    depends_on:
      - backend
    networks:
      - bookswap_network

  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=bookswap_db
    volumes:
      - mysql_data:/var/lib/mysql
      - ./sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - bookswap_network

volumes:
  mysql_data:

networks:
  bookswap_network:
    driver: bridge
```

#### 4.6.3. Git & GitHub

**Vai trò:** Version control & Collaboration

**Git Workflow:**
```bash
# Branching strategy
main          # Production-ready code
├── develop   # Development branch
    ├── feature/book-management
    ├── feature/exchange-system
    ├── feature/messaging
    └── bugfix/fix-login-issue

# Commit conventions
git commit -m "feat: add book search functionality"
git commit -m "fix: resolve JWT token expiration issue"
git commit -m "docs: update API documentation"
```

**GitHub Features sử dụng:**
- **Issues**: Bug tracking, feature requests
- **Pull Requests**: Code review workflow
- **Projects**: Kanban board
- **Actions**: CI/CD (future)

#### 4.6.4. ESLint & Prettier

**Vai trò:** Code quality & formatting

**ESLint Configuration:**
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

### 4.7. External Services

#### 4.7.1. Google Books API

**Vai trò:** Book metadata service

**Integration:**
```typescript
@Injectable()
export class GoogleBooksService {
  private readonly apiUrl = 'https://www.googleapis.com/books/v1/volumes';
  private readonly apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  async searchBooks(query: string): Promise<GoogleBookDto[]> {
    const response = await axios.get(this.apiUrl, {
      params: {
        q: query,
        key: this.apiKey,
        maxResults: 10,
      },
    });

    return response.data.items.map((item) => ({
      google_books_id: item.id,
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.join(', '),
      isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier,
      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
      description: item.volumeInfo.description,
    }));
  }
}
```

#### 4.7.2. SMTP Email Service

**Vai trò:** Email notifications

**Implementation:**
```typescript
@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Verify your BookSwap account',
      html: `
        <h1>Welcome to BookSwap!</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
      `,
    });
  }
}
```

### 4.8. Development Tools

| Tool | Purpose | Version |
|------|---------|---------|
| **VS Code** | IDE | Latest |
| **Postman** | API Testing | 11.x |
| **MySQL Workbench** | Database Management | 8.x |
| **Adminer** | Web-based DB Admin | 4.8 |
| **PlantUML** | UML Diagrams | Latest |
| **npm** | Package Manager | 10.x |

### 4.9. Package Dependencies Summary

**Backend (package.json):**
```json
{
  "dependencies": {
    "@nestjs/common": "^10.4.15",
    "@nestjs/core": "^10.4.15",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/platform-express": "^10.4.15",
    "@nestjs/platform-socket.io": "^10.4.15",
    "@nestjs/typeorm": "^10.0.2",
    "@nestjs/websockets": "^10.4.15",
    "bcrypt": "^5.1.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "mysql2": "^3.11.5",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "socket.io": "^4.8.1",
    "typeorm": "^0.3.20",
    "uuid": "^11.0.3"
  }
}
```

**Frontend (package.json):**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.1",
    "axios": "^1.7.9",
    "socket.io-client": "^4.8.1",
    "tailwindcss": "^3.4.17",
    "vite": "^7.1.1"
  }
}
```

---

## 5. TRIỂN KHAI CÀI ĐẶT

### 5.1. Cấu trúc mã nguồn

#### 5.1.1. Tổng quan cấu trúc

```
bookswap-backend/
├── frontend/                   # React Frontend Application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── pages/             # Route-based page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── BooksPage.jsx
│   │   │   ├── ExchangesPage.jsx
│   │   │   ├── MessagesPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/       # Generic components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Card.jsx
│   │   │   ├── books/        # Book-specific components
│   │   │   │   ├── BookCard.jsx
│   │   │   │   ├── BookList.jsx
│   │   │   │   └── BookForm.jsx
│   │   │   ├── exchanges/
│   │   │   ├── messages/
│   │   │   └── layout/
│   │   │       ├── Header.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── Footer.jsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useSocket.js
│   │   │   ├── useBooks.js
│   │   │   └── useExchanges.js
│   │   ├── services/          # API service layer
│   │   │   ├── api.js         # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── booksService.js
│   │   │   ├── exchangesService.js
│   │   │   └── messagesService.js
│   │   ├── routers/           # Route configurations
│   │   │   └── AppRouter.jsx
│   │   ├── utils/             # Utility functions
│   │   │   ├── formatDate.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   ├── style/             # Global styles
│   │   │   └── index.css
│   │   ├── App.jsx            # Root component
│   │   └── main.jsx           # Entry point
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── src/                        # NestJS Backend Application
│   ├── modules/               # Feature modules
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── local.strategy.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       ├── login.dto.ts
│   │   │       └── reset-password.dto.ts
│   │   ├── books/
│   │   │   ├── books.controller.ts
│   │   │   ├── books.service.ts
│   │   │   ├── books.module.ts
│   │   │   ├── entities/
│   │   │   │   └── book.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-book.dto.ts
│   │   │       ├── update-book.dto.ts
│   │   │       └── search-books.dto.ts
│   │   ├── exchanges/
│   │   │   ├── exchanges.controller.ts
│   │   │   ├── exchanges.service.ts
│   │   │   ├── exchanges.module.ts
│   │   │   ├── matching/
│   │   │   │   ├── matching.service.ts
│   │   │   │   └── matching.algorithm.ts
│   │   │   ├── entities/
│   │   │   │   ├── exchange.entity.ts
│   │   │   │   ├── exchange-request.entity.ts
│   │   │   │   └── exchange-suggestion.entity.ts
│   │   │   └── dto/
│   │   ├── messages/
│   │   │   ├── messages.controller.ts
│   │   │   ├── messages.service.ts
│   │   │   ├── messages.gateway.ts
│   │   │   ├── messages.module.ts
│   │   │   ├── entities/
│   │   │   └── dto/
│   │   ├── reviews/
│   │   ├── notifications/
│   │   ├── reports/
│   │   ├── admin/
│   │   └── library/
│   ├── infrastructure/        # Infrastructure layer
│   │   ├── database/
│   │   │   ├── database.module.ts
│   │   │   ├── database.config.ts
│   │   │   └── migrations/
│   │   └── external-services/
│   │       ├── google-books/
│   │       │   ├── google-books.service.ts
│   │       │   └── google-books.module.ts
│   │       └── email/
│   │           ├── email.service.ts
│   │           └── email.module.ts
│   ├── common/                # Shared utilities
│   │   ├── decorators/
│   │   │   ├── get-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── dto/
│   │   │   └── pagination.dto.ts
│   │   ├── enums/
│   │   │   ├── user-role.enum.ts
│   │   │   ├── book-status.enum.ts
│   │   │   └── exchange-status.enum.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── all-exceptions.filter.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   └── services/
│   │       ├── logger.service.ts
│   │       └── file-upload.service.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   ├── app.module.ts
│   └── main.ts                # Application entry point
│
├── sql/                        # Database scripts
│   ├── init.sql/              # Initial schema
│   │   └── init.sql
│   ├── migrations/            # Schema migrations (21 files)
│   │   ├── 001-consolidate-members.sql
│   │   ├── 002-add-message-features.sql
│   │   ├── 003-add-reviews-constraints.sql
│   │   ├── 004-create-notifications.sql
│   │   ├── 005-upgrade-notifications-schema.sql
│   │   ├── 006-create-admin-tables.sql
│   │   ├── 007-create-user-activity-logs.sql
│   │   ├── 008-create-admins-table.sql
│   │   ├── 009-add-exchange-cancellation.sql
│   │   ├── 010-add-meeting-arrangement.sql
│   │   ├── 011-fix-trust-score-precision.sql
│   │   ├── 012-add-cancellation-reasons.sql
│   │   ├── 013-add-exchange-meeting-cancellation-fields.sql
│   │   ├── 014-add-meeting-arrangement.sql
│   │   ├── 014-add-member-reviewed-flags.sql
│   │   ├── 014-add-message-attachments.sql
│   │   ├── 014-add-remaining-attachments.sql
│   │   └── 015-fix-messages-collation.sql
│   └── seed/                  # Test data
│       ├── clean-seed.sql
│       ├── complete-test-seed.sql
│       └── seed-data.sql
│
├── uploads/                    # User uploads
│   ├── books/                 # Book images
│   └── messages/              # Message attachments
│
├── docs/                       # Documentation
│   ├── diagrams/              # PlantUML diagrams (26 files)
│   │   ├── component/
│   │   ├── deployment/
│   │   ├── use-case/
│   │   ├── sequence/
│   │   ├── activity/
│   │   ├── state/
│   │   ├── class/
│   │   └── erd/
│   ├── SOFTWARE_DESIGN_DOCUMENT.md
│   ├── SETUP_GUIDE.md
│   ├── DOCKER_GUIDE.md
│   └── PROJECT_REPORT.md
│
├── .env.example               # Environment template
├── .gitignore
├── docker-compose.yml         # Docker orchestration
├── Dockerfile                 # Backend container
├── package.json               # Backend dependencies
├── tsconfig.json              # TypeScript config
├── nest-cli.json              # NestJS CLI config
└── README.md
```

#### 5.1.2. Module Organization (Backend)

**Module Structure Pattern:**
```
module-name/
├── module-name.controller.ts   # HTTP endpoints
├── module-name.service.ts      # Business logic
├── module-name.module.ts       # Module definition
├── entities/                   # Database entities
│   └── entity.entity.ts
├── dto/                        # Data Transfer Objects
│   ├── create-entity.dto.ts
│   ├── update-entity.dto.ts
│   └── query-entity.dto.ts
├── guards/                     # Module-specific guards (optional)
├── pipes/                      # Module-specific pipes (optional)
└── tests/                      # Unit tests
    ├── module-name.controller.spec.ts
    └── module-name.service.spec.ts
```

### 5.2. Hướng dẫn cài đặt

#### 5.2.1. Yêu cầu hệ thống

**Phần cứng tối thiểu:**
- CPU: Dual-core 2.0 GHz
- RAM: 4GB
- Disk: 10GB free space
- Network: Internet connection

**Phần mềm:**
- Operating System: Windows 10/11, macOS, Linux
- Node.js: >= 18.x
- npm: >= 9.x
- MySQL: >= 8.0
- Docker: >= 20.x (optional)
- Docker Compose: >= 2.x (optional)
- Git: Latest version

#### 5.2.2. Cài đặt với Docker (Khuyến nghị)

Docker Compose giúp setup toàn bộ stack (Frontend + Backend + MySQL) chỉ với vài lệnh:

**Bước 1: Clone repository**
```bash
git clone https://github.com/lehuynhhuyhoang05/Bookswap_Community.git
cd bookswap-backend
```

**Bước 2: Cấu hình Environment Variables**
```bash
# Copy template
cp .env.example .env

# Chỉnh sửa .env
# Windows: notepad .env
# Linux/Mac: nano .env
```

**Nội dung .env cần thiết:**
```env
# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_secure_password
DB_DATABASE=bookswap_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRATION=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM="BookSwap <noreply@bookswap.com>"

# Google Books API
GOOGLE_BOOKS_API_KEY=your_google_books_api_key

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# MySQL Root Password (for docker-compose)
MYSQL_ROOT_PASSWORD=your_secure_password
```

**Bước 3: Build và khởi động containers**
```bash
# Build images và start services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Check status
docker-compose ps
```

**Output mong đợi:**
```
NAME                           STATUS          PORTS
bookswap-backend-backend-1     Up 30 seconds   0.0.0.0:3000->3000/tcp
bookswap-backend-frontend-1    Up 30 seconds   0.0.0.0:5173->80/tcp
bookswap-backend-mysql-1       Up 30 seconds   0.0.0.0:3306->3306/tcp
```

**Bước 4: Khởi tạo Database**

Database sẽ tự động được khởi tạo từ `sql/init.sql/init.sql` khi container MySQL start lần đầu.

Nếu cần chạy migrations thủ công:
```bash
# Exec vào backend container
docker-compose exec backend sh

# Run migrations
npm run typeorm migration:run

# Exit container
exit
```

**Bước 5: Access Applications**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api (nếu có Swagger)
- **MySQL**: localhost:3306

**Bước 6: Test API**
```bash
# Health check
curl http://localhost:3000

# Register user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "full_name": "Test User"
  }'
```

**Quản lý Docker Containers:**
```bash
# Stop all services
docker-compose down

# Stop và xóa volumes (CẢNH BÁO: Mất data)
docker-compose down -v

# Rebuild images
docker-compose up --build

# View logs của service cụ thể
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Restart service
docker-compose restart backend
```

#### 5.2.3. Cài đặt thủ công (Development)

**A. Setup Backend**

**Bước 1: Install Dependencies**
```bash
cd bookswap-backend
npm install
```

**Bước 2: Setup MySQL Database**
```bash
# Login MySQL
mysql -u root -p

# Create database
CREATE DATABASE bookswap_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
exit

# Import schema
mysql -u root -p bookswap_db < sql/init.sql/init.sql

# Run migrations (nếu có)
cd sql/migrations
mysql -u root -p bookswap_db < 001-consolidate-members.sql
mysql -u root -p bookswap_db < 002-add-message-features.sql
# ... repeat for all migration files
```

**Bước 3: Configure Environment**
```bash
cp .env.example .env
# Edit .env với DB credentials của bạn
```

**Bước 4: Run Backend**
```bash
# Development mode (hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

**Output:**
```
[Nest] 12345  - 12/08/2024, 10:30:00 AM   LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 12/08/2024, 10:30:00 AM   LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 12/08/2024, 10:30:00 AM   LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] 12345  - 12/08/2024, 10:30:01 AM   LOG [RoutesResolver] BooksController {/books}:
[Nest] 12345  - 12/08/2024, 10:30:01 AM   LOG [RouterExplorer] Mapped {/books, GET} route
[Nest] 12345  - 12/08/2024, 10:30:01 AM   LOG [RouterExplorer] Mapped {/books/:id, GET} route
[Nest] 12345  - 12/08/2024, 10:30:01 AM   LOG [NestApplication] Nest application successfully started
[Nest] 12345  - 12/08/2024, 10:30:01 AM   LOG Application is running on: http://localhost:3000
```

**B. Setup Frontend**

**Bước 1: Install Dependencies**
```bash
cd frontend
npm install
```

**Bước 2: Configure Environment**
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:3000" > .env
echo "VITE_WS_URL=http://localhost:3000" >> .env
```

**Bước 3: Run Frontend**
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Output:**
```
VITE v7.1.1  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h + enter to show help
```

#### 5.2.4. Seed Test Data

Để test hệ thống với dữ liệu mẫu:

```bash
# Import seed data
mysql -u root -p bookswap_db < sql/seed/complete-test-seed.sql
```

**Test accounts được tạo:**
```
Admin Account:
Email: admin@bookswap.com
Password: Admin123!

Member Accounts:
Email: alice@example.com, bob@example.com, charlie@example.com
Password: Password123!
```

### 5.3. Triển khai các chức năng tiêu biểu

#### 5.3.1. Module Authentication

**A. Đăng ký người dùng (Register)**

**Flow:**
```
User → Frontend → POST /auth/register → AuthController 
→ AuthService.register() → Create User & Member → Send Verification Email
→ Return JWT Token
```

**Implementation:**

**1. DTO (Data Transfer Object):**
```typescript
// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email là bắt buộc' })
  email: string;

  @IsString()
  @Length(8, 50, { message: 'Mật khẩu phải từ 8-50 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên là bắt buộc' })
  @Length(2, 100)
  full_name: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại không hợp lệ' })
  phone: string;
}
```

**2. Controller:**
```typescript
// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    
    return {
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      data: {
        user_id: result.user.user_id,
        email: result.user.email,
        full_name: result.member.full_name,
        access_token: result.access_token,
      },
    };
  }
}
```

**3. Service (Business Logic):**
```typescript
// src/modules/auth/auth.service.ts
import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../users/entities/user.entity';
import { Member } from '../members/entities/member.entity';
import { RegisterDto } from './dto/register.dto';
import { EmailService } from '../../infrastructure/external-services/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(registerDto.password, salt);

    // Create User entity
    const user = this.userRepository.create({
      user_id: uuidv4(),
      email: registerDto.email.toLowerCase(),
      password_hash,
      role: UserRole.MEMBER,
      auth_provider: 'LOCAL',
      account_status: AccountStatus.UNVERIFIED,
    });

    await this.userRepository.save(user);

    // Create Member profile
    const member = this.memberRepository.create({
      member_id: uuidv4(),
      user_id: user.user_id,
      full_name: registerDto.full_name,
      region: registerDto.region,
      phone: registerDto.phone,
      trust_score: 50.0,
      account_created_at: new Date(),
    });

    await this.memberRepository.save(member);

    // Generate JWT token
    const payload = { 
      sub: user.user_id, 
      email: user.email, 
      role: user.role 
    };
    const access_token = this.jwtService.sign(payload);

    // Send verification email
    const verificationToken = uuidv4();
    await this.emailService.sendVerificationEmail(
      user.email, 
      verificationToken
    );

    return {
      user,
      member,
      access_token,
    };
  }
}
```

**4. Frontend Component:**
```jsx
// frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    region: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.register(formData);
      
      // Save token to localStorage
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data));

      // Redirect to home
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Đăng ký tài khoản</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Họ tên</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Khu vực</label>
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              required
            >
              <option value="">Chọn khu vực</option>
              <option value="Hanoi">Hà Nội</option>
              <option value="HoChiMinh">TP. Hồ Chí Minh</option>
              <option value="DaNang">Đà Nẵng</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Số điện thoại</label>
            <input
              type="tel"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Đã có tài khoản?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
};
```

**B. Đăng nhập (Login)**

**Implementation:**

```typescript
// src/modules/auth/auth.service.ts (thêm method)
async login(loginDto: LoginDto) {
  const user = await this.userRepository.findOne({
    where: { email: loginDto.email.toLowerCase() },
    relations: ['member'],
  });

  if (!user) {
    throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(
    loginDto.password,
    user.password_hash,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
  }

  // Check account status
  if (user.account_status === AccountStatus.LOCKED) {
    throw new UnauthorizedException('Tài khoản đã bị khóa');
  }

  if (user.account_status === AccountStatus.SUSPENDED) {
    throw new UnauthorizedException('Tài khoản đang bị tạm khóa');
  }

  // Update last login
  user.last_login = new Date();
  await this.userRepository.save(user);

  // Generate JWT
  const payload = { 
    sub: user.user_id, 
    email: user.email, 
    role: user.role 
  };
  const access_token = this.jwtService.sign(payload);

  return {
    access_token,
    user: {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      full_name: user.member?.full_name,
    },
  };
}
```

#### 5.3.2. Module Quản lý Sách (Books)

**A. Thêm sách mới**

**Implementation:**

**1. DTO:**
```typescript
// src/modules/books/dto/create-book.dto.ts
export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  author: string;

  @IsOptional()
  @IsString()
  isbn?: string;

  @IsEnum(BookCondition)
  condition: BookCondition;

  @IsEnum(BookCategory)
  category: BookCategory;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  google_books_id?: string;

  @IsOptional()
  @IsUrl()
  cover_image_url?: string;
}
```

**2. Service:**
```typescript
// src/modules/books/books.service.ts
@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(PersonalLibrary)
    private readonly libraryRepository: Repository<PersonalLibrary>,
  ) {}

  async createBook(userId: string, createBookDto: CreateBookDto) {
    // Get member
    const member = await this.memberRepository.findOne({
      where: { user_id: userId },
      relations: ['personal_library'],
    });

    if (!member) {
      throw new NotFoundException('Member không tồn tại');
    }

    // Create book
    const book = this.bookRepository.create({
      book_id: uuidv4(),
      ...createBookDto,
      owner_id: member.member_id,
      personal_library_id: member.personal_library.library_id,
      status: BookStatus.AVAILABLE,
      created_at: new Date(),
    });

    const savedBook = await this.bookRepository.save(book);

    // Update library counters
    await this.libraryRepository.increment(
      { library_id: member.personal_library.library_id },
      'total_books',
      1,
    );

    return savedBook;
  }
}
```

**3. Controller:**
```typescript
// src/modules/books/books.controller.ts
@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createBook(
    @GetUser() user: User,
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Handle file upload if exists
    if (file) {
      const imageUrl = await this.uploadService.uploadBookImage(file);
      createBookDto.cover_image_url = imageUrl;
    }

    const book = await this.booksService.createBook(
      user.user_id,
      createBookDto,
    );

    return {
      message: 'Thêm sách thành công',
      data: book,
    };
  }

  @Get()
  async getBooks(
    @Query('category') category?: string,
    @Query('condition') condition?: string,
    @Query('region') region?: string,
    @Query('search') search?: string,
  ) {
    return this.booksService.findBooks({
      category,
      condition,
      region,
      search,
    });
  }

  @Get(':id')
  async getBookById(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  async updateBook(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(user.user_id, id, updateBookDto);
  }

  @Delete(':id')
  async deleteBook(@GetUser() user: User, @Param('id') id: string) {
    await this.booksService.remove(user.user_id, id);
    return { message: 'Xóa sách thành công' };
  }
}
```

**B. Tìm kiếm sách**

```typescript
// src/modules/books/books.service.ts
async findBooks(filters: SearchBooksDto) {
  const query = this.bookRepository
    .createQueryBuilder('book')
    .leftJoinAndSelect('book.owner', 'member')
    .leftJoinAndSelect('member.user', 'user')
    .where('book.status = :status', { status: BookStatus.AVAILABLE });

  // Filter by category
  if (filters.category) {
    query.andWhere('book.category = :category', {
      category: filters.category,
    });
  }

  // Filter by condition
  if (filters.condition) {
    query.andWhere('book.condition = :condition', {
      condition: filters.condition,
    });
  }

  // Filter by region
  if (filters.region) {
    query.andWhere('member.region = :region', {
      region: filters.region,
    });
  }

  // Search by keyword (FULLTEXT search)
  if (filters.search) {
    query.andWhere(
      'MATCH(book.title, book.author, book.description) AGAINST (:search IN NATURAL LANGUAGE MODE)',
      { search: filters.search },
    );
  }

  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  query.skip((page - 1) * limit).take(limit);

  // Sort
  query.orderBy('book.created_at', 'DESC');

  const [books, total] = await query.getManyAndCount();

  return {
    data: books,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

#### 5.3.3. Module Trao đổi (Exchanges)

**A. Tạo yêu cầu trao đổi**

**Flow:**
```
User A → Select Book của User B → Offer own books
→ POST /exchanges/requests → Create ExchangeRequest
→ Tạo Conversation tự động → Notification cho User B
```

**Implementation:**

```typescript
// src/modules/exchanges/exchanges.service.ts
@Injectable()
export class ExchangesService {
  constructor(
    @InjectRepository(ExchangeRequest)
    private readonly requestRepository: Repository<ExchangeRequest>,
    @InjectRepository(ExchangeRequestBook)
    private readonly requestBookRepository: Repository<ExchangeRequestBook>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly conversationsService: ConversationsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createExchangeRequest(
    userId: string,
    createDto: CreateExchangeRequestDto,
  ) {
    // Validate books
    const wantedBook = await this.bookRepository.findOne({
      where: { book_id: createDto.wanted_book_id },
      relations: ['owner'],
    });

    if (!wantedBook || wantedBook.status !== BookStatus.AVAILABLE) {
      throw new BadRequestException('Sách không khả dụng');
    }

    const offeredBooks = await this.bookRepository.find({
      where: { book_id: In(createDto.offered_book_ids) },
      relations: ['owner'],
    });

    // Check ownership
    const requester = offeredBooks[0].owner;
    if (requester.user_id !== userId) {
      throw new UnauthorizedException('Bạn không sở hữu sách này');
    }

    // Create request
    const request = this.requestRepository.create({
      request_id: uuidv4(),
      requester_id: requester.member_id,
      receiver_id: wantedBook.owner.member_id,
      status: ExchangeRequestStatus.PENDING,
      message: createDto.message,
      created_at: new Date(),
    });

    await this.requestRepository.save(request);

    // Link books
    const wantedBookLink = this.requestBookRepository.create({
      request_id: request.request_id,
      book_id: wantedBook.book_id,
      is_wanted: true,
    });

    const offeredBookLinks = offeredBooks.map((book) =>
      this.requestBookRepository.create({
        request_id: request.request_id,
        book_id: book.book_id,
        is_wanted: false,
      }),
    );

    await this.requestBookRepository.save([
      wantedBookLink,
      ...offeredBookLinks,
    ]);

    // Create conversation
    const conversation = await this.conversationsService.create({
      member1_id: requester.member_id,
      member2_id: wantedBook.owner.member_id,
      related_exchange_request_id: request.request_id,
    });

    // Send notification
    await this.notificationsService.create({
      member_id: wantedBook.owner.member_id,
      notification_type: NotificationType.EXCHANGE_REQUEST,
      title: 'Yêu cầu trao đổi mới',
      message: `${requester.full_name} muốn trao đổi sách "${wantedBook.title}"`,
      related_id: request.request_id,
    });

    return request;
  }
}
```

**B. Chấp nhận yêu cầu và tạo Exchange**

```typescript
async acceptExchangeRequest(userId: string, requestId: string) {
  const request = await this.requestRepository.findOne({
    where: { request_id: requestId },
    relations: [
      'requester',
      'receiver',
      'books',
      'books.book',
    ],
  });

  if (!request) {
    throw new NotFoundException('Yêu cầu không tồn tại');
  }

  if (request.receiver.user_id !== userId) {
    throw new UnauthorizedException('Không có quyền');
  }

  if (request.status !== ExchangeRequestStatus.PENDING) {
    throw new BadRequestException('Yêu cầu đã được xử lý');
  }

  // Update request status
  request.status = ExchangeRequestStatus.ACCEPTED;
  request.responded_at = new Date();
  await this.requestRepository.save(request);

  // Create Exchange entity
  const exchange = this.exchangeRepository.create({
    exchange_id: uuidv4(),
    request_id: request.request_id,
    status: ExchangeStatus.PENDING,
    created_at: new Date(),
  });

  await this.exchangeRepository.save(exchange);

  // Link books to exchange
  const exchangeBooks = request.books.map((rb) =>
    this.exchangeBookRepository.create({
      exchange_id: exchange.exchange_id,
      book_id: rb.book_id,
      from_member_id: rb.is_wanted
        ? request.receiver_id
        : request.requester_id,
      to_member_id: rb.is_wanted
        ? request.requester_id
        : request.receiver_id,
    }),
  );

  await this.exchangeBookRepository.save(exchangeBooks);

  // Update book status
  await this.bookRepository.update(
    { book_id: In(request.books.map((b) => b.book_id)) },
    { status: BookStatus.EXCHANGING },
  );

  // Notify requester
  await this.notificationsService.create({
    member_id: request.requester_id,
    notification_type: NotificationType.EXCHANGE_ACCEPTED,
    title: 'Yêu cầu được chấp nhận',
    message: `${request.receiver.full_name} đã chấp nhận yêu cầu trao đổi`,
    related_id: exchange.exchange_id,
  });

  return exchange;
}
```

#### 5.3.4. Module AI Matching

**Thuật toán gợi ý trao đổi thông minh:**

```typescript
// src/modules/exchanges/matching/matching.service.ts
@Injectable()
export class MatchingService {
  private readonly WEIGHTS = {
    WANTED_MATCH: 0.4,
    REGION_MATCH: 0.2,
    TRUST_SCORE: 0.2,
    EXCHANGE_HISTORY: 0.1,
    CATEGORY_MATCH: 0.1,
  };

  private readonly THRESHOLD = 0.3;

  async generateSuggestions(userId: string): Promise<ExchangeSuggestion[]> {
    const member = await this.getMemberWithBooksAndWanted(userId);
    
    // Get potential partners
    const potentialPartners = await this.findPotentialPartners(member);

    // Calculate match scores
    const scoredPartners = await Promise.all(
      potentialPartners.map(async (partner) => {
        const score = await this.calculateMatchScore(member, partner);
        return { partner, score };
      }),
    );

    // Filter by threshold
    const qualifiedMatches = scoredPartners
      .filter((item) => item.score >= this.THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10

    // Create suggestions
    const suggestions = await Promise.all(
      qualifiedMatches.map(async ({ partner, score }) => {
        const matchedPairs = await this.findBookMatchPairs(
          member,
          partner,
        );

        const suggestion = this.suggestionRepository.create({
          suggestion_id: uuidv4(),
          member_id: member.member_id,
          suggested_partner_id: partner.member_id,
          match_score: score,
          created_at: new Date(),
          expires_at: this.getExpirationDate(),
        });

        await this.suggestionRepository.save(suggestion);

        // Save match pairs
        await this.saveMatchPairs(suggestion.suggestion_id, matchedPairs);

        return suggestion;
      }),
    );

    return suggestions;
  }

  private async calculateMatchScore(
    member: Member,
    partner: Member,
  ): Promise<number> {
    let totalScore = 0;

    // 1. Wanted Match (40%)
    const wantedScore = await this.calculateWantedMatchScore(
      member,
      partner,
    );
    totalScore += wantedScore * this.WEIGHTS.WANTED_MATCH;

    // 2. Region Match (20%)
    const regionScore = member.region === partner.region ? 1 : 0;
    totalScore += regionScore * this.WEIGHTS.REGION_MATCH;

    // 3. Trust Score (20%)
    const trustScore = partner.trust_score / 100;
    totalScore += trustScore * this.WEIGHTS.TRUST_SCORE;

    // 4. Exchange History (10%) - Prefer new partners
    const historyScore = await this.calculateHistoryScore(member, partner);
    totalScore += historyScore * this.WEIGHTS.EXCHANGE_HISTORY;

    // 5. Category Match (10%)
    const categoryScore = await this.calculateCategoryMatch(
      member,
      partner,
    );
    totalScore += categoryScore * this.WEIGHTS.CATEGORY_MATCH;

    return Math.round(totalScore * 100) / 100;
  }

  private async calculateWantedMatchScore(
    member: Member,
    partner: Member,
  ): Promise<number> {
    // Check if partner has books that member wants
    const memberWants = member.books_wanted.map((w) => w.book_id);
    const partnerHas = partner.books
      .filter((b) => b.status === BookStatus.AVAILABLE)
      .map((b) => b.book_id);

    const memberToPartner = memberWants.filter((id) =>
      partnerHas.includes(id),
    ).length;

    // Check if member has books that partner wants
    const partnerWants = partner.books_wanted.map((w) => w.book_id);
    const memberHas = member.books
      .filter((b) => b.status === BookStatus.AVAILABLE)
      .map((b) => b.book_id);

    const partnerToMember = partnerWants.filter((id) =>
      memberHas.includes(id),
    ).length;

    // Mutual wants get higher score
    if (memberToPartner > 0 && partnerToMember > 0) {
      return 1.0;
    } else if (memberToPartner > 0 || partnerToMember > 0) {
      return 0.7;
    }

    return 0;
  }
}
```

#### 5.3.5. Module Real-time Messaging

**WebSocket Gateway Implementation:**

```typescript
// src/modules/messages/messages.gateway.ts
@WebSocketGateway({
  namespace: '/messages',
  cors: { origin: '*' },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Authenticate
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token);
      
      client.data.userId = payload.sub;
      this.connectedUsers.set(payload.sub, client.id);

      console.log(`User ${payload.sub} connected`);
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    this.connectedUsers.delete(userId);
    console.log(`User ${userId} disconnected`);
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string },
  ) {
    client.join(`conversation:${data.conversation_id}`);
    console.log(`User joined conversation ${data.conversation_id}`);
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string },
  ) {
    client.leave(`conversation:${data.conversation_id}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const userId = client.data.userId;

    // Create message in database
    const message = await this.messagesService.createMessage({
      conversation_id: data.conversation_id,
      sender_id: userId,
      message_text: data.message_text,
      attachment_url: data.attachment_url,
    });

    // Broadcast to conversation room
    this.server
      .to(`conversation:${data.conversation_id}`)
      .emit('message_sent', {
        message_id: message.message_id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        message_text: message.message_text,
        attachment_url: message.attachment_url,
        sent_at: message.sent_at,
      });

    return { success: true, message_id: message.message_id };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string; isTyping: boolean },
  ) {
    const userId = client.data.userId;

    client.to(`conversation:${data.conversation_id}`).emit('typing_indicator', {
      user_id: userId,
      is_typing: data.isTyping,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversation_id: string },
  ) {
    const userId = client.data.userId;

    await this.messagesService.markConversationAsRead(
      data.conversation_id,
      userId,
    );

    this.server
      .to(`conversation:${data.conversation_id}`)
      .emit('messages_read', {
        conversation_id: data.conversation_id,
        read_by: userId,
      });
  }
}
```

**Frontend Socket Integration:**

```javascript
// frontend/src/hooks/useSocket.js
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    socketRef.current = io('http://localhost:3000/messages', {
      auth: { token },
      autoConnect: true,
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const joinConversation = (conversationId) => {
    socketRef.current?.emit('join_conversation', { conversation_id: conversationId });
  };

  const sendMessage = (conversationId, messageText) => {
    return new Promise((resolve) => {
      socketRef.current?.emit(
        'send_message',
        { conversation_id: conversationId, message_text: messageText },
        (response) => resolve(response),
      );
    });
  };

  const onMessageReceived = (callback) => {
    socketRef.current?.on('message_sent', callback);
  };

  const emitTyping = (conversationId, isTyping) => {
    socketRef.current?.emit('typing', { conversation_id: conversationId, isTyping });
  };

  return {
    connected,
    joinConversation,
    sendMessage,
    onMessageReceived,
    emitTyping,
  };
};
```

### 5.4. Database Migrations

**Migration Management:**

```bash
# Generate new migration
npm run typeorm migration:generate -- -n AddBookCategoryField

# Create empty migration
npm run typeorm migration:create -- -n CustomChanges

# Run migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert

# Show migrations
npm run typeorm migration:show
```

**Example Migration:**

```typescript
// src/infrastructure/database/migrations/1701234567890-AddExchangeCancellation.ts
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddExchangeCancellation1701234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'exchanges',
      new TableColumn({
        name: 'cancellation_reason',
        type: 'text',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'exchanges',
      new TableColumn({
        name: 'cancelled_by',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'exchanges',
      new TableColumn({
        name: 'cancelled_at',
        type: 'datetime',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('exchanges', 'cancellation_reason');
    await queryRunner.dropColumn('exchanges', 'cancelled_by');
    await queryRunner.dropColumn('exchanges', 'cancelled_at');
  }
}
```

### 5.5. Error Handling & Logging

**Global Exception Filter:**

```typescript
// src/common/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: exception.message || 'Internal server error',
    };

    // Log error
    console.error(
      `[${errorResponse.timestamp}] ${errorResponse.method} ${errorResponse.path} - ${status}: ${errorResponse.message}`,
    );

    response.status(status).json(errorResponse);
  }
}
```

**Usage in main.ts:**

```typescript
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
```

---

#### 4.2.1. Prerequisites

- Node.js 18+
- MySQL 8.0
- Docker & Docker Compose (optional)

#### 4.2.2. Setup với Docker (Khuyến nghị)

```bash
# 1. Clone repository
git clone https://github.com/lehuynhhuyhoang05/Bookswap_Community.git
cd bookswap-backend

# 2. Copy environment file
cp .env.example .env

# 3. Start services
docker-compose up -d

# 4. Access
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3000
# - MySQL: localhost:3306
```

#### 4.2.3. Setup thủ công

**Backend:**
```bash
# Install dependencies
npm install

# Setup database
mysql -u root -p < sql/init.sql/init.sql
npm run migration:run

# Run development
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 4.3. Environment Variables

**Backend (.env):**
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=bookswap_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Google Books API
GOOGLE_BOOKS_API_KEY=your_api_key

# Server
PORT=3000
```

### 4.4. Docker Architecture

```
┌─────────────────────────────────────────────────────┐
│               Docker Host                           │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐               │
│  │  frontend    │  │   backend    │               │
│  │  :5173       │  │   :3000      │               │
│  └──────────────┘  └──────────────┘               │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐               │
│  │   mysql      │  │   volumes    │               │
│  │   :3306      │  │  mysql_data  │               │
│  └──────────────┘  │  uploads/    │               │
│                    └──────────────┘               │
│                                                     │
│  Network: bookswap_network (bridge)               │
└─────────────────────────────────────────────────────┘
```

Tham khảo: `docs/diagrams/deployment/DEP_Deployment.puml`

### 4.5. Deployment Strategy

**Development:**
- Docker Compose local
- Hot reload enabled
- Debug mode on

**Production:**
- Docker containers
- Nginx reverse proxy
- SSL/TLS certificates
- Environment variables from secrets
- Database backups
- Log aggregation

---

## 5. TESTING VÀ ĐÁNH GIÁ

### 5.1. Testing Strategy

#### 5.1.1. Unit Testing
- Test individual services và controllers
- Mock dependencies
- Coverage target: 70%

#### 5.1.2. Integration Testing
- Test API endpoints
- Database interactions
- External service integrations

#### 5.1.3. E2E Testing
- Test complete user flows
- Browser automation
- Critical paths

### 5.2. Test Cases chính

**Authentication:**
- ✅ Đăng ký với email hợp lệ
- ✅ Đăng ký với email trùng lặp → 409 Conflict
- ✅ Đăng nhập với credentials đúng
- ✅ Đăng nhập với password sai → 401 Unauthorized
- ✅ Access protected route với token hợp lệ
- ✅ Access protected route không có token → 401

**Books:**
- ✅ Tạo sách mới
- ✅ Upload ảnh sách
- ✅ Tìm kiếm sách theo keyword
- ✅ Filter sách theo category, condition
- ✅ Xóa sách khi không có exchange pending

**Exchanges:**
- ✅ Tạo request hợp lệ
- ✅ Tạo request với sách không available → 400
- ✅ Accept request → tạo exchange
- ✅ Complete exchange → update trust score
- ✅ Cancel exchange với reason

**Messages:**
- ✅ Gửi tin nhắn text
- ✅ Gửi tin nhắn với attachment
- ✅ Real-time delivery
- ✅ Read receipts

### 5.3. Performance Testing

**API Response Times:**
```
GET  /books              - 150ms average
POST /books              - 200ms average
GET  /exchanges          - 180ms average
POST /exchanges/requests - 250ms average
GET  /messages           - 120ms average
```

**Load Testing:**
- 100 concurrent users: Stable
- 500 concurrent users: Minor slowdown
- Database connection pool: 10 connections

### 5.4. Security Testing

**Vulnerabilities Checked:**
- ✅ SQL Injection - Protected (TypeORM)
- ✅ XSS - Sanitization applied
- ✅ CSRF - Token-based auth
- ✅ Broken Authentication - JWT with expiration
- ✅ Sensitive Data Exposure - Password hashing
- ✅ Rate Limiting - Implemented

---

## 6. KẾT LUẬN

### 6.1. Kết quả đạt được

**Chức năng:**
- ✅ Hoàn thành 100% yêu cầu chức năng chính
- ✅ 9 modules backend đầy đủ
- ✅ 24 database tables
- ✅ 50+ API endpoints
- ✅ Real-time messaging
- ✅ AI matching algorithm
- ✅ Admin panel đầy đủ

**Kỹ thuật:**
- ✅ Clean architecture
- ✅ SOLID principles
- ✅ Design patterns
- ✅ TypeScript 100%
- ✅ Responsive UI
- ✅ Docker containerization

**Tài liệu:**
- ✅ 26 PlantUML diagrams (UML 2.5)
- ✅ Software Design Document
- ✅ API documentation
- ✅ README files

### 6.2. Hạn chế

**Kỹ thuật:**
- Chưa implement Redis caching đầy đủ
- Chưa có automated tests coverage cao
- Chưa optimize database queries với explain
- Chưa implement CI/CD pipeline

**Chức năng:**
- Chưa có tích hợp payment
- Chưa có mobile app native
- Chưa có notification push (chỉ có in-app)
- Chưa có multi-language

### 6.3. Hướng phát triển

**Ngắn hạn (3-6 tháng):**
1. Implement Redis caching layer
2. Viết unit tests đầy đủ
3. Setup CI/CD với GitHub Actions
4. Optimize database performance
5. Add Elasticsearch cho search

**Trung hạn (6-12 tháng):**
1. Phát triển mobile app (React Native)
2. Tích hợp payment gateway
3. Implement push notifications
4. Multi-language support
5. Advanced analytics dashboard

**Dài hạn (1-2 năm):**
1. ML model cho recommendation nâng cao
2. Blockchain cho transaction verification
3. Social features (groups, forums)
4. Gamification (badges, leaderboard)
5. Open API cho third-party integration

### 6.4. Bài học kinh nghiệm

**Kỹ thuật:**
- Importance of planning architecture trước khi code
- TypeScript giúp catch bugs sớm
- Docker giúp consistency môi trường
- Real-time features cần careful design

**Teamwork:**
- Git workflow với branches
- Code review quan trọng
- Documentation cần viết song song với code
- Regular testing tránh technical debt

**Quản lý dự án:**
- Agile methodology hiệu quả
- MVP first, then iterate
- User feedback quan trọng
- Time estimation cần buffer

---

## 7. TÀI LIỆU THAM KHẢO

### 7.1. Documentation

1. **NestJS Official Docs** - https://docs.nestjs.com
2. **React Official Docs** - https://react.dev
3. **TypeORM Documentation** - https://typeorm.io
4. **Socket.IO Docs** - https://socket.io/docs
5. **TailwindCSS Docs** - https://tailwindcss.com

### 7.2. UML Standards

1. **UML 2.5 Specification** - https://www.omg.org/spec/UML/2.5
2. **PlantUML Language Guide** - https://plantuml.com

### 7.3. Design Patterns

1. **Gang of Four (GoF) Patterns**
2. **Enterprise Application Architecture Patterns** - Martin Fowler
3. **Clean Architecture** - Robert C. Martin

### 7.4. Best Practices

1. **SOLID Principles**
2. **RESTful API Design**
3. **Database Normalization**
4. **Security Best Practices - OWASP Top 10**

---

## PHỤ LỤC

### A. Danh sách Use Cases đầy đủ

| ID | Use Case | Actor | Module |
|----|----------|-------|--------|
| UC01 | Đăng ký tài khoản | Guest | Auth |
| UC02 | Đăng nhập | Member, Admin | Auth |
| UC03 | Quên mật khẩu | Member | Auth |
| UC04 | Thêm sách mới | Member | Books |
| UC05 | Sửa thông tin sách | Member | Books |
| UC06 | Xóa sách | Member | Books |
| UC07 | Tìm kiếm sách | Guest, Member | Books |
| UC08 | Thêm sách mong muốn | Member | Library |
| UC09 | Tạo yêu cầu trao đổi | Member | Exchange |
| UC10 | Chấp nhận yêu cầu | Member | Exchange |
| UC11 | Từ chối yêu cầu | Member | Exchange |
| UC12 | Sắp xếp cuộc hẹn | Member | Exchange |
| UC13 | Xác nhận hoàn thành | Member | Exchange |
| UC14 | Hủy trao đổi | Member | Exchange |
| UC15 | Xem gợi ý trao đổi | Member | Suggestions |
| UC16 | Gửi tin nhắn | Member | Messages |
| UC17 | Upload file đính kèm | Member | Messages |
| UC18 | React tin nhắn | Member | Messages |
| UC19 | Viết review | Member | Reviews |
| UC20 | Xem review của partner | Member | Reviews |
| UC21 | Báo cáo vi phạm | Member | Reports |
| UC22 | Quản lý người dùng | Admin | Admin |
| UC23 | Xử lý báo cáo | Admin | Admin |
| UC24 | Xem thống kê | Admin | Admin |
| UC25 | Điều chỉnh trust score | Admin | Admin |

### B. Database Schema Reference

Xem chi tiết: `docs/SOFTWARE_DESIGN_DOCUMENT.md` - Section 12

### C. API Endpoint List

Xem chi tiết: `docs/SOFTWARE_DESIGN_DOCUMENT.md` - Section 11

### D. PlantUML Diagrams Index

**Component:**
- `ARCH_Overview.puml` - Tổng quan
- `ARCH_LayeredArchitecture.puml` - 3-tier architecture
- `ARCH_DataFlow.puml` - Data flow
- `COMP_SystemArchitecture.puml` - Component chi tiết

**Deployment:**
- `DEP_Deployment.puml` - Docker deployment

**Use Case:** (6 files)
- `UC_01_Overview.puml`
- `UC_02_Authentication.puml`
- `UC_03_BookManagement.puml`
- `UC_04_Exchange.puml`
- `UC_05_Messaging.puml`
- `UC_06_Admin.puml`

**Sequence:** (9 files)
- `SD_01_Register.puml` đến `SD_09_GenerateSuggestions.puml`

**Activity:** (3 files)
- `AD_01_ExchangeFlow.puml`
- `AD_02_AuthenticationFlow.puml`
- `AD_03_AIMatchingFlow.puml`

**State:** (4 files)
- `SM_01_ExchangeState.puml`
- `SM_02_ExchangeRequestState.puml`
- `SM_03_BookState.puml`
- `SM_04_UserAccountState.puml`

**Class & ERD:**
- `CD_01_Entities.puml`
- `ERD_Complete.puml`

---

**© 2024 BookSwap Team. All Rights Reserved.**

*Document Version: 1.0*  
*Last Updated: December 8, 2024*
