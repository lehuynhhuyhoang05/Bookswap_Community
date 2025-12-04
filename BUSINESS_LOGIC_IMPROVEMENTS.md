# Cải Tiến Logic Nghiệp Vụ - Session Report

## Ngày: Session hiện tại

## Tổng quan
Các cải tiến được thực hiện để nâng cao chất lượng dự án BookSwap cho môn CNPM (Công Nghệ Phần Mềm).

---

## 1. Fix Cancel Penalty Logic ✅

### Vấn đề trước đây
- Khi một người cancel exchange, **CẢ HAI** người đều bị trừ điểm uy tín
- Không công bằng cho người không cancel

### Giải pháp
- Thêm field `cancelled_by` để track ai là người cancel
- Chỉ trừ điểm uy tín của người cancel
- Mức phạt: -0.10 điểm (trên thang 0-1, tương đương 10 điểm)

### Files đã sửa
- `src/infrastructure/database/entities/exchange.entity.ts` - Thêm cancelled_by column
- `src/modules/exchanges/services/exchanges.service.ts` - Cập nhật logic cancelExchange()

---

## 2. Request Expiration (14 days) ✅

### Vấn đề trước đây  
- Exchange requests có thể pending mãi mãi
- Sách bị "lock" vô thời hạn, người khác không thể request

### Giải pháp
- Thêm field `expires_at` = created_at + 14 ngày
- CRON job chạy mỗi giờ để tự động expire requests quá hạn
- Khi expire: status = EXPIRED, release sách về AVAILABLE

### Files đã sửa
- `src/infrastructure/database/entities/exchange-request.entity.ts` - Thêm expires_at column
- `src/modules/exchanges/services/exchanges.service.ts` - Thêm CRON job và expiration check

### Migration
```sql
ALTER TABLE exchange_requests ADD COLUMN expires_at TIMESTAMP NULL;
UPDATE exchange_requests SET expires_at = DATE_ADD(created_at, INTERVAL 14 DAY) WHERE status = 'PENDING';
```

---

## 3. Book Verification (User Photos) ✅

### Vấn đề trước đây
- Chỉ có cover image từ Google Books API
- Không biết user có thật sự sở hữu sách không
- Không có minh chứng về tình trạng thực tế của sách

### Giải pháp
- Thêm field `user_photos` (JSON array) - bắt buộc ít nhất 1 ảnh khi tạo sách
- Thêm field `condition_notes` - mô tả chi tiết tình trạng sách
- Thêm VERY_GOOD vào BookCondition enum (giữa LIKE_NEW và GOOD)

### Files đã sửa
- `src/infrastructure/database/entities/book.entity.ts`
- `src/modules/books/dto/create-book.dto.ts`
- `src/modules/books/services/books.service.ts`

### Migration
```sql
-- Migration 015-add-user-book-photos.sql
ALTER TABLE books ADD COLUMN user_photos JSON NULL;
ALTER TABLE books ADD COLUMN condition_notes TEXT NULL;
ALTER TABLE books MODIFY COLUMN book_condition ENUM('LIKE_NEW', 'VERY_GOOD', 'GOOD', 'FAIR', 'POOR') NULL;
```

---

## Database Changes Summary

### exchange_requests table
| Column | Type | Description |
|--------|------|-------------|
| expires_at | TIMESTAMP | Auto-set to created_at + 14 days |

### exchanges table
| Column | Type | Description |
|--------|------|-------------|
| cancelled_by | VARCHAR(36) | Member ID of who cancelled |

### books table
| Column | Type | Description |
|--------|------|-------------|
| user_photos | JSON | Array of user-uploaded photo URLs |
| condition_notes | TEXT | Description of book condition |
| book_condition | ENUM | Updated to include VERY_GOOD |

---

## TODO - Frontend Changes Needed

### 1. Add Book Page
- [ ] Add photo upload component (cho user_photos)
- [ ] Add condition notes textarea
- [ ] Add VERY_GOOD option in condition dropdown
- [ ] Validate minimum 1 photo required

### 2. Book Detail Page  
- [ ] Display user photos carousel/gallery
- [ ] Display condition notes
- [ ] Show VERY_GOOD condition badge

### 3. My Library Page
- [ ] Show indicator if book has user photos

---

## Các Điểm Cần Cải Thiện Thêm (Future)

### High Priority
1. **Fairness Check** - So sánh condition của sách trước khi tạo exchange
2. **Geographic Matching** - Ưu tiên người gần nhau
3. **Notification System** - Real-time notifications

### Medium Priority
4. **Rating System** - Đánh giá sau mỗi giao dịch
5. **Wishlist Matching** - Auto-suggest khi có sách match
6. **Multi-book Exchange** - Trao đổi nhiều sách cùng lúc

### Low Priority  
7. **Report System** - Report người dùng vi phạm
8. **Admin Dashboard** - Quản lý users, books, exchanges
9. **Analytics** - Thống kê hệ thống

---

## How to Apply Migrations

```bash
# Connect to MySQL container
docker exec -it bookswap_mysql mysql -u root -proot bookswap_db

# Run migrations
SOURCE /path/to/sql/migrations/015-add-user-book-photos.sql;
```

Or run directly:
```powershell
docker exec bookswap_mysql mysql -u root -proot bookswap_db -e "ALTER TABLE books ADD COLUMN user_photos JSON NULL; ALTER TABLE books ADD COLUMN condition_notes TEXT NULL; ALTER TABLE books MODIFY COLUMN book_condition ENUM('LIKE_NEW', 'VERY_GOOD', 'GOOD', 'FAIR', 'POOR') NULL;"
```
