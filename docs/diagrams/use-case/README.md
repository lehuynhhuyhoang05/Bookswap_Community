# Use Case Diagrams - BookSwap System

## 📋 Tổng quan

Thư mục này chứa **6 Use Case Diagrams** tuân thủ chuẩn **UML 2.5**, thiết kế chuyên nghiệp phục vụ báo cáo đồ án tốt nghiệp.

### Đặc điểm thiết kế

✨ **Chuyên nghiệp & Chuẩn mực:**
- Tuân thủ UML 2.5 Standard
- Màu sắc phân biệt rõ ràng theo module
- Icon trực quan cho actors và packages
- Notes và legends đầy đủ
- Relationships rõ ràng (include, extend, generalization)

🎨 **Thẩm mỹ cao:**
- Gradient màu sắc hài hòa
- Typography rõ ràng (Segoe UI)
- Border và spacing đồng nhất
- Layout dễ đọc, không bị chồng chéo

📊 **Nội dung đầy đủ:**
- 40+ Use Cases tổng cộng
- 5 Actors chính
- External systems (Google Books API, Email, WebSocket, etc.)
- Internal processes
- Business rules và constraints

---

## 📚 Danh sách Use Case Diagrams

### 1. UC_01_Overview.puml
**📌 Use Case Diagram - Tổng quan Hệ thống**

**Nội dung:**
- Tổng quan **40 Use Cases** của toàn hệ thống
- **5 Actors:** Guest, Member, Admin, Email Server, Google Books API
- **10 Modules chức năng:**
  - 🔐 Authentication (UC01-UC06)
  - 📚 Book Management (UC07-UC13)
  - 🔄 Exchange (UC14-UC19)
  - 🤖 AI Matching (UC20-UC22)
  - 💬 Messaging (UC23-UC26)
  - ⭐ Reviews (UC27-UC29)
  - 🚨 Reports (UC30-UC31)
  - ⚙️ Admin (UC32-UC35)
  - 👤 Profile (UC36-UC38)
  - 🔔 Notifications (UC39-UC40)

**Actor Hierarchy:**
```
Guest <|-- Member <|-- Admin
```

**Mục đích:** 
- Cung cấp cái nhìn toàn cảnh về hệ thống
- Hiển thị tất cả actors và mối quan hệ
- Phân nhóm chức năng theo module

**Màu chủ đạo:** Blue (#3F51B5)

---

### 2. UC_02_Authentication.puml
**🔐 Use Case Diagram - Module Xác thực & Ủy quyền**

**Nội dung:**
- **9 Use Cases** chính cho xác thực
- **3 Actors:** Guest, Member, Email Server

**Use Cases:**
- **UC01-UC03:** Đăng ký & Xác thực Email
- **UC04-UC06:** Đăng nhập, Đăng xuất, Làm mới Token
- **UC07-UC09:** Quên mật khẩu, Đặt lại, Đổi mật khẩu
- **Internal:** Validate Token, Hash Password, Generate JWT, Send Email

**Relationships:**
- `<<include>>`: UC01 → Send Email, UC02 → Validate Token
- `<<extend>>`: UC06 (Refresh) → UC04 (Login) nếu token expired

**Security Features:**
- bcrypt hashing (salt rounds: 10)
- JWT expiration: 7 days
- Email token: 24 hours
- Password reset token: 1 hour

**Màu chủ đạo:** Light Blue (#0277BD)

---

### 3. UC_03_BookManagement.puml
**📚 Use Case Diagram - Module Quản lý Sách**

**Nội dung:**
- **16 Use Cases** cho quản lý sách & thư viện
- **4 Actors:** Guest, Member, Admin, Google Books API

**Nhóm chức năng:**

**🔍 Public (UC01-UC04):**
- Xem danh sách, Tìm kiếm, Lọc & Sắp xếp, Xem chi tiết

**📖 My Library (UC05-UC09):**
- Xem thư viện, Thêm/Sửa/Xóa sách, Upload ảnh

**⭐ Wishlist (UC10-UC13):**
- Quản lý sách mong muốn (wanted books)

**⚙️ Admin (UC14-UC16):**
- Kiểm duyệt, Xóa vi phạm, Xem lịch sử

**Integration:**
- Google Books API: Auto-fill book info từ ISBN/Title
- Validation: Check book data integrity

**Book States:**
- AVAILABLE → EXCHANGING → EXCHANGED
- REMOVED (deleted)

**Màu chủ đạo:** Green (#388E3C)

---

### 4. UC_04_Exchange.puml
**🔄 Use Case Diagram - Module Trao đổi Sách**

**Nội dung:**
- **20 Use Cases** cho trao đổi và AI matching
- **3 Actors:** Member, AI Matching Engine, Scheduler Service

**Nhóm chức năng:**

**📝 Exchange Requests (UC01-UC06):**
- Tạo/Xem/Chấp nhận/Từ chối/Hủy yêu cầu

**🔄 Exchange Management (UC07-UC13):**
- Quản lý exchanges, Sắp xếp cuộc hẹn, Xác nhận hoàn thành, Hủy

**🤖 AI Matching (UC14-UC18):**
- Tạo gợi ý thông minh, Xem/Lọc/Đánh dấu/Xóa gợi ý

**📊 Statistics (UC19-UC20):**
- Thống kê và lịch sử trao đổi

**AI Matching Algorithm:**
```
Score = 40% Wanted Match
      + 20% Region
      + 20% Trust Score
      + 10% Exchange History
      + 10% Category Match
      
Threshold: ≥ 30%
```

**Exchange Lifecycle:**
```
Request: PENDING → ACCEPTED/REJECTED/CANCELLED/EXPIRED
Exchange: ACCEPTED → MEETING_SCHEDULED → IN_PROGRESS → COMPLETED/CANCELLED
```

**Auto Actions:**
- Auto-expire requests after 7 days
- Auto-cancel if no meeting within 14 days

**Màu chủ đạo:** Orange (#F9A825)

---

### 5. UC_05_Messaging.puml
**💬 Use Case Diagram - Module Tin nhắn**

**Nội dung:**
- **16 Use Cases** cho messaging real-time
- **3 Actors:** Member, WebSocket Gateway, Storage Service

**Nhóm chức năng:**

**📋 Conversation Management (UC01-UC04):**
- Xem danh sách, Xem tin nhắn, Tìm kiếm, Xem chi tiết

**✉️ Send Messages (UC05-UC08):**
- Gửi text, ảnh, file đính kèm, nhiều files

**⚡ Message Actions (UC09-UC12):**
- Xóa, React emoji, Đánh dấu đã đọc, Sao chép

**🔄 Real-time Features (UC13-UC16):**
- Nhận tin nhắn real-time, Hiển thị "đang nhập", Read receipts, Notifications

**Technical Details:**
- **Transport:** Socket.IO (WebSocket)
- **Latency target:** < 100ms
- **Max file size:** 10MB
- **Max files/message:** 5

**Message Types:**
- Text (max 5000 chars)
- Image (PNG, JPG, GIF)
- Document (PDF, DOC, XLS)
- Archive (ZIP, RAR)

**Socket.IO Events:**
```
Client → Server:
- message:sent
- typing:start
- typing:stop

Server → Client:
- message:received
- read:receipt
- notification
```

**Màu chủ đạo:** Cyan (#0288D1)

---

### 6. UC_06_Admin.puml
**⚙️ Use Case Diagram - Module Quản trị Hệ thống**

**Nội dung:**
- **30 Use Cases** cho quản trị
- **2 Actors:** Admin, Super Admin

**Actor Hierarchy:**
```
Admin <|-- SuperAdmin (specializes)
```

**Nhóm chức năng:**

**👥 User Management (UC01-UC06):**
- Xem/Khóa/Mở khóa/Xóa users, Điều chỉnh Trust Score

**🔍 Content Moderation (UC07-UC12):**
- Kiểm duyệt và xóa sách/tin nhắn/reviews vi phạm

**🚨 Report Handling (UC13-UC17):**
- Xem/Xử lý/Bác bỏ báo cáo, Cảnh báo user

**🔄 Exchange Management (UC18-UC21):**
- Xem/Hủy exchanges, Xử lý tranh chấp

**📊 Analytics & Monitoring (UC22-UC27):**
- Dashboard, Thống kê, Activity logs, Audit logs, Export

**🔧 System Settings (UC28-UC30) - Super Admin Only:**
- Quản lý admins, Cấu hình hệ thống, Backup/Restore

**Report Resolution Actions:**
1. Dismiss - No action
2. Warning - Send notice
3. Delete Content - Remove violating content
4. Suspend User - Temporary ban
5. Ban User - Permanent removal

**Audit Trail:**
- Every admin action logged to `audit_logs`
- Includes: timestamp, admin_id, action, entity
- Immutable records for compliance

**Màu chủ đạo:** Pink (#D81B60)

---

## 🔗 Relationships trong UML

### Association (→)
**Ý nghĩa:** Actor sử dụng Use Case

**Ví dụ:**
```
Member --> UC_AddBook : add book
```

### Generalization (<|--)
**Ý nghĩa:** Kế thừa (is-a relationship)

**Ví dụ:**
```
Guest <|-- Member : generalizes
Member <|-- Admin : specializes
```

### Include (..>)
**Ý nghĩa:** Use Case A luôn bao gồm Use Case B (mandatory)

**Ví dụ:**
```
UC_Register ..> UC_SendEmail : <<include>>
```
→ Đăng ký luôn phải gửi email

### Extend (..>)
**Ý nghĩa:** Use Case B có thể mở rộng Use Case A (optional)

**Ví dụ:**
```
UC_RefreshToken ..> UC_Login : <<extend>> [token expired]
```
→ Làm mới token chỉ xảy ra khi token hết hạn

---

## 🎨 Color Scheme

| Module | Color | Hex Code | Ý nghĩa |
|--------|-------|----------|---------|
| **Authentication** | Light Blue | #0277BD | Bảo mật, Tin cậy |
| **Books** | Green | #388E3C | Tươi mới, Sách vở |
| **Exchange** | Orange | #F9A825 | Năng động, Trao đổi |
| **Messaging** | Cyan | #0288D1 | Giao tiếp, Kết nối |
| **Admin** | Pink | #D81B60 | Quyền lực, Quản trị |
| **AI/System** | Gray | #616161 | Công nghệ, Tự động |

---

## 📊 Thống kê Use Cases

| Module | Số UC | % |
|--------|-------|---|
| Authentication | 9 | 22.5% |
| Book Management | 16 | 40% |
| Exchange | 20 | 50% |
| Messaging | 16 | 40% |
| Reviews | 3 | 7.5% |
| Reports | 2 | 5% |
| Admin | 30 | 75% |
| Profile | 3 | 7.5% |
| Notifications | 2 | 5% |

**Tổng cộng:** **40+ Use Cases**

---

## 🛠️ Công cụ và Render

### PlantUML
**Website:** https://plantuml.com

**Render online:**
```bash
# Sử dụng PlantUML Server
http://www.plantuml.com/plantuml/uml/[encoded-diagram]
```

**VS Code Extension:**
- **PlantUML** by jebbs
- **PlantUML Previewer**

**Command line:**
```bash
# Install
npm install -g node-plantuml

# Render to PNG
puml generate UC_01_Overview.puml -o output/
```

**Export formats:**
- PNG (khuyến nghị cho báo cáo)
- SVG (vector, scale tốt)
- PDF (in ấn)

---

## 📝 Sử dụng trong Báo cáo

### Cách trích dẫn

**Trong báo cáo Word/LaTeX:**

```
Hình 3.1: Use Case Diagram - Tổng quan hệ thống BookSwap
(Nguồn: Tự thiết kế)
```

### Thứ tự trình bày đề xuất

1. **UC_01_Overview** - Giới thiệu tổng quan
2. **UC_02_Authentication** - Module cơ bản
3. **UC_03_BookManagement** - Core business
4. **UC_04_Exchange** - Main feature + AI
5. **UC_05_Messaging** - Real-time communication
6. **UC_06_Admin** - System management

### Mô tả cho từng diagram

Mỗi diagram nên có:
- **Tiêu đề rõ ràng**
- **Mô tả ngắn gọn** (2-3 câu)
- **Liệt kê actors và use cases chính**
- **Giải thích relationships quan trọng**
- **Highlight điểm đặc biệt** (AI, Real-time, etc.)

---

## ✅ Checklist Đồ án Tốt nghiệp

- [x] Tuân thủ UML 2.5 Standard
- [x] Actors rõ ràng với hierarchy
- [x] Use Cases đầy đủ và cụ thể
- [x] System boundary được định nghĩa
- [x] Relationships chính xác (include, extend)
- [x] External systems được thể hiện
- [x] Internal processes được mô tả
- [x] Notes giải thích business rules
- [x] Legends hướng dẫn đọc diagram
- [x] Color scheme nhất quán
- [x] Layout dễ đọc, không overlapping
- [x] Typography chuyên nghiệp

---

## 📚 Tài liệu tham khảo

1. **UML 2.5 Specification** - OMG
   https://www.omg.org/spec/UML/2.5

2. **Use Case Modeling** - Ivar Jacobson

3. **UML Distilled** - Martin Fowler

4. **PlantUML Language Reference Guide**
   https://plantuml.com/guide

5. **Software Engineering** - Ian Sommerville
   Chapter: Requirements Engineering

---

**© 2024 BookSwap Team**
*UML 2.5 Compliant | Professional Design for Graduation Project*
