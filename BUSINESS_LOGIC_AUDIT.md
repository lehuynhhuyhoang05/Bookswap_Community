# 🔍 Kiểm Tra Nghiệp Vụ Toàn Hệ Thống - Business Logic Audit

## 📅 Ngày: November 21, 2025

---

## ✅ 1. EXCHANGE REQUEST (Tạo Yêu Cầu Trao Đổi)

### Flow Hiện Tại
```
User A tạo request → Validate books → Check trust score → Tạo request_books → Sách vẫn AVAILABLE
```

### Validations
| Check | Status | Logic | Thực tế? |
|-------|--------|-------|----------|
| ✅ Requester exists | OK | Phải có member profile | ✅ HỢP LÝ |
| ✅ Receiver exists | OK | Phải tìm được receiver | ✅ HỢP LÝ |
| ✅ Not self-exchange | OK | Không trao đổi với chính mình | ✅ HỢP LÝ |
| ✅ Trust score ≥ 10 | OK | Dưới 10 không được tạo | ✅ HỢP LÝ |
| ✅ Trust score 10-19: max 2 pending | OK | Giới hạn người xấu | ✅ HỢP LÝ |
| ✅ Offered books owned by requester | OK | Phải sở hữu sách offer | ✅ HỢP LÝ |
| ✅ Offered books AVAILABLE | OK | Sách không bị lock | ✅ HỢP LÝ |
| ✅ Requested books owned by receiver | OK | Người nhận phải có sách | ✅ HỢP LÝ |
| ✅ Requested books AVAILABLE | OK | Sách người nhận chưa lock | ✅ HỢP LÝ |
| ✅ No duplicate pending request | OK | Tránh spam | ✅ HỢP LÝ |

### 🚨 VẤN ĐỀ PHÁT HIỆN

#### ⚠️ Issue 1: Sách AVAILABLE cho phép nhiều requests
**Hiện tại**: Sách có thể nằm trong 10 pending requests khác nhau
**Vấn đề**: User nhận 10 requests cho cùng 1 cuốn sách → Accept 1 cái → 9 cái kia tự động reject
**Hậu quả**: 
- Người gửi request bị reject mà không rõ lý do
- Waste time cho cả 2 bên
- Người có sách hot bị spam requests

**Giải pháp đề xuất**:
```typescript
// Option 1: Giới hạn số pending requests cho 1 cuốn sách
const pendingRequestsForBook = await this.requestBookRepo.count({
  where: { 
    book_id: bookId, 
    request: { status: ExchangeRequestStatus.PENDING }
  }
});

if (pendingRequestsForBook >= 3) {
  throw new BadRequestException('This book already has 3 pending requests. Please try later.');
}

// Option 2: Hiển thị "popularity score" để người dùng biết
book.pending_requests_count = pendingRequestsForBook;
```

**Mức độ**: 🟡 **MEDIUM** - Không critical nhưng ảnh hưởng UX

---

## ✅ 2. RESPOND TO REQUEST (Phản Hồi Request)

### Flow Accept Request
```
Receiver accept → Check trust score 24h rule → Check book conflicts → Lock books → 
Create exchange → Auto-reject conflicting requests → Calculate expiry by trust score
```

### Validations
| Check | Status | Logic | Thực tế? |
|-------|--------|-------|----------|
| ✅ Only receiver can respond | OK | Chỉ người nhận mới respond | ✅ HỢP LÝ |
| ✅ Request must be PENDING | OK | Không respond 2 lần | ✅ HỢP LÝ |
| ✅ Trust < 20: must respond within 24h | OK | Phạt người xấu chậm trễ | ✅ HỢP LÝ |
| ✅ Check books not in active exchange | OK | Tránh double-booking | ✅ HỢP LÝ |
| ✅ Lock books to EXCHANGING | OK | Ngăn chặn xung đột | ✅ HỢP LÝ |
| ✅ Auto-reject conflicting requests | OK | Dọn dẹp tự động | ✅ HỢP LÝ |
| ✅ Expiry based on trust score | OK | 3/7/14 days theo trust | ✅ HỢP LÝ |

### 🚨 VẤN ĐỀ PHÁT HIỆN

#### ⚠️ Issue 2: 24h response rule có thể quá harsh
**Hiện tại**: Trust < 20 phải respond trong 24h
**Vấn đề**: 
- Request lúc 11pm → Sáng 12h đã quá 24h
- Không tính weekend/holidays
- User đi du lịch 2 ngày = bị block

**Giải pháp đề xuất**:
```typescript
// Option 1: Cho phép gia hạn 1 lần
if (requestAge > maxResponseTime && !request.extension_requested) {
  throw new BadRequestException('Request auto-extension...');
}

// Option 2: Thay 24h → 48h (hợp lý hơn)
const maxResponseTime = 48 * 60 * 60 * 1000; // 48 hours

// Option 3: Chỉ tính giờ làm việc (8am-10pm)
const businessHours = calculateBusinessHours(request.created_at, Date.now());
if (businessHours > 24) throw error;
```

**Mức độ**: 🟡 **MEDIUM** - Có thể khó chịu nhưng không phá vỡ hệ thống

---

#### ✅ Issue 3: Auto-reject message rõ ràng
**Hiện tại**: "Books no longer available - already in another exchange"
**Đánh giá**: ✅ **GOOD** - Message rõ ràng, người dùng hiểu ngay

---

## ✅ 3. CONFIRM EXCHANGE (Xác Nhận Hoàn Thành)

### Flow
```
User confirm → Check if both confirmed → Transfer ownership → Update stats → 
Save exchange → Update trust scores
```

### Validations
| Check | Status | Logic | Thực tế? |
|-------|--------|-------|----------|
| ✅ Only exchange members can confirm | OK | Chỉ 2 người tham gia | ✅ HỢP LÝ |
| ✅ Individual confirmations tracked | OK | A và B confirm riêng | ✅ HỢP LÝ |
| ✅ Both must confirm for completion | OK | Cần cả 2 đồng ý | ✅ HỢP LÝ |
| ✅ Transfer ownership after both confirm | OK | Chuyển owner_id | ✅ HỢP LÝ |
| ✅ Books back to AVAILABLE | OK | Unlock sau khi xong | ✅ HỢP LÝ |
| ✅ Update completed_exchanges count | OK | Tăng stats | ✅ HỢP LÝ |
| ✅ Save exchange before trust update | OK | Tránh race condition | ✅ HỢP LÝ |
| ✅ Trust score +5 for both | OK | Thưởng người tốt | ✅ HỢP LÝ |

### 🟢 KHÔNG CÓ VẤN ĐỀ - Logic hoàn hảo!

---

## ⚠️ 4. CANCEL EXCHANGE (Hủy Giao Dịch)

### Flow
```
User cancel → Check status → Set cancelled_by → Update status → Release books → 
Update trust score (chỉ người vi phạm)
```

### Validations
| Check | Status | Logic | Thực tế? |
|-------|--------|-------|----------|
| ✅ Only exchange members can cancel | OK | Chỉ 2 người liên quan | ✅ HỢP LÝ |
| ✅ Cannot cancel COMPLETED | OK | Đã xong thì không hủy | ✅ HỢP LÝ |
| ✅ Track cancelled_by | OK | Biết ai hủy | ✅ HỢP LÝ |
| ✅ Release books to AVAILABLE | OK | Unlock sách | ✅ HỢP LÝ |
| ✅ NO_SHOW: chỉ người hủy bị -20 | OK | Công bằng! | ✅ HỢP LÝ |
| ✅ USER_CANCELLED: chỉ người hủy -10 | OK | Đúng người | ✅ HỢP LÝ |
| ✅ BOTH_NO_SHOW: cả 2 -20 | OK | Cả 2 đều sai | ✅ HỢP LÝ |
| ✅ ADMIN_CANCELLED: không phạt | OK | Admin can thiệp | ✅ HỢP LÝ |

### 🚨 VẤN ĐỀ PHÁT HIỆN

#### 🔴 Issue 4: DISPUTE reason không có logic xử lý
**Hiện tại**: 
```typescript
if (dto.reason === 'USER_CANCELLED') { ... }
else if (dto.reason === 'NO_SHOW') { ... }
else if (dto.reason === 'BOTH_NO_SHOW') { ... }
// ❌ DISPUTE không có trong if-else!
```

**Vấn đề**: 
- User chọn DISPUTE → Không ai bị phạt
- Có thể lợi dụng: "Tôi không đến nhưng báo DISPUTE để tránh -20"

**Giải pháp**:
```typescript
else if (dto.reason === 'DISPUTE') {
  // Tạm thời lock trust score, chờ admin review
  await this.createDisputeTicket(exchange, cancellingMemberId, dto.note);
  // Hoặc: Phạt cả 2 nhẹ (-5 mỗi người) cho đến khi admin quyết định
  this.logger.warn(`DISPUTE raised for exchange ${exchangeId}, admin review required`);
}
```

**Mức độ**: 🔴 **HIGH** - Có thể bị lợi dụng để tránh phạt

---

#### ⚠️ Issue 5: Có thể hủy trước khi hết hạn để tránh EXPIRED
**Hiện tại**: 
- Exchange có 3 ngày để confirm (trust < 20)
- Ngày 2.9: User tự hủy (USER_CANCELLED: -10)
- Nếu chờ đến ngày 3: Auto EXPIRED (-5 cho cả 2)

**Vấn đề**: User thông minh sẽ hủy trước để giảm thiểu phạt
**Đánh giá**: ✅ **OK** - Đây là behavior đúng! Khuyến khích user chủ động hủy nếu không thể hoàn thành

---

## ✅ 5. AUTO-EXPIRE EXCHANGES (Tự Động Hết Hạn)

### Flow
```
Cron job (mỗi giờ) → Tìm exchanges expires_at < now → Set EXPIRED → 
Release books → Update trust scores
```

### Validations
| Check | Status | Logic | Thực tế? |
|-------|--------|-------|----------|
| ✅ Run every hour | OK | @Cron('0 * * * *') | ✅ HỢP LÝ |
| ✅ Only expire PENDING exchanges | OK | Chỉ chưa confirm | ✅ HỢP LÝ |
| ✅ Check expires_at < now | OK | Đúng logic | ✅ HỢP LÝ |
| ✅ Set cancelled_by = null | OK | Không ai hủy, hết hạn | ✅ HỢP LÝ |
| ✅ Release books | OK | Unlock về AVAILABLE | ✅ HỢP LÝ |
| ✅ Both users -5 trust | OK | Cả 2 chậm trễ | ✅ HỢP LÝ |

### 🚨 VẤN ĐỀ PHÁT HIỆN

#### ⚠️ Issue 6: Cả 2 bị -5 trust khi expire - không công bằng
**Hiện tại**: 
```typescript
// Auto-expire: cả 2 bị -5
await this.trustScoreService.updateTrustScore(exchange.member_a_id);
await this.trustScoreService.updateTrustScore(exchange.member_b_id);
```

**Vấn đề**:
- User A confirm ngày 1 → Chờ User B
- User B không confirm → Exchange expire
- User A bị -5 dù đã confirm ✅

**Giải pháp**:
```typescript
// Chỉ phạt người chưa confirm
if (exchange.expires_at < new Date()) {
  if (!exchange.member_a_confirmed && !exchange.member_b_confirmed) {
    // Cả 2 chưa confirm → Cả 2 bị phạt
    await this.trustScoreService.updateTrustScore(exchange.member_a_id);
    await this.trustScoreService.updateTrustScore(exchange.member_b_id);
  } else if (!exchange.member_a_confirmed) {
    // Chỉ A chưa confirm → Chỉ A bị phạt
    await this.trustScoreService.updateTrustScore(exchange.member_a_id);
  } else if (!exchange.member_b_confirmed) {
    // Chỉ B chưa confirm → Chỉ B bị phạt
    await this.trustScoreService.updateTrustScore(exchange.member_b_id);
  }
  // Nếu cả 2 đã confirm (không thể expire) → Bỏ qua
}
```

**Mức độ**: 🔴 **HIGH** - Không công bằng cho người đã confirm

---

## ✅ 6. TRUST SCORE SYSTEM (Hệ Thống Điểm Uy Tín)

### Calculations
| Factor | Points | Logic | Thực tế? |
|--------|--------|-------|----------|
| ✅ Base score | 50 | Điểm khởi điểm | ✅ HỢP LÝ |
| ✅ Completed exchange | +5 | Khuyến khích hoàn thành | ✅ HỢP LÝ |
| ✅ Good review (4-5★) | +3 | Thưởng người tốt | ✅ HỢP LÝ |
| ✅ Email verified | +10 | Xác minh danh tính | ✅ HỢP LÝ |
| ✅ Has avatar | +5 | Hoàn thiện profile | ✅ HỢP LÝ |
| ✅ User cancelled | -10 | Phạt người hủy | ✅ HỢP LÝ |
| ✅ NO_SHOW | -20 | Phạt nặng | ✅ HỢP LÝ |
| ✅ Expired | -5 | Phạt nhẹ chậm trễ | ⚠️ Cần sửa (Issue 6) |
| ✅ Bad review (1-2★) | -15 | Phạt người xấu | ✅ HỢP LÝ |

### 🚨 VẤN ĐỀ PHÁT HIỆN

#### ⚠️ Issue 7: Review có thể bị spam
**Hiện tại**: Mỗi review 4-5★ = +3 điểm
**Vấn đề**: 
- User A và B tạo 100 fake exchanges
- Review cho nhau 5★ liên tục
- Tăng trust score giả mạo

**Phòng ngừa**:
```typescript
// Chỉ tính review từ exchanges thực sự completed
const validReviews = await this.reviewRepo
  .createQueryBuilder('review')
  .innerJoin('review.exchange', 'exchange')
  .where('review.reviewee_id = :memberId', { memberId })
  .andWhere('exchange.status = :status', { status: ExchangeStatus.COMPLETED })
  .andWhere('review.rating >= 4')
  .getCount();

// Giới hạn tối đa bonus từ reviews
const reviewBonus = Math.min(validReviews * 3, 30); // Max +30 từ reviews
```

**Mức độ**: 🟡 **MEDIUM** - Có thể xảy ra nhưng tốn công gian lận

---

## ✅ 7. BOOK LOCKING MECHANISM (Cơ Chế Khóa Sách)

### States
| State | When | Can be in requests? | Can be exchanged? |
|-------|------|---------------------|-------------------|
| ✅ AVAILABLE | Mặc định | ✅ Nhiều pending requests | ✅ Yes |
| ✅ EXCHANGING | Request accepted | ❌ No new requests | ❌ Locked |
| ✅ SOLD | User bán/tặng | ❌ No | ❌ No |
| ✅ DELETED | Xóa mềm | ❌ No | ❌ No |

### 🟢 Logic hoàn hảo!
- Race condition đã fix (moved save before trust update)
- Auto-reject conflicting requests
- Books properly unlocked on cancel/expire

---

## 📊 TỔNG KẾT VẤN ĐỀ

### 🔴 HIGH Priority (Cần sửa ngay)
1. **Issue 4**: DISPUTE không có logic xử lý → Có thể lợi dụng
2. **Issue 6**: Expire phạt cả người đã confirm → Không công bằng

### 🟡 MEDIUM Priority (Nên sửa)
1. **Issue 1**: Spam requests cho sách hot → Giới hạn pending requests
2. **Issue 2**: 24h rule quá harsh → Tăng lên 48h hoặc business hours
3. **Issue 7**: Review có thể spam → Giới hạn bonus tối đa

### 🟢 GOOD - Không cần sửa
- Trust score calculation logic
- Book locking mechanism
- Cancel penalty logic (trừ DISPUTE)
- Confirm exchange flow
- Auto-expire detection

---

## 🎯 ĐỀ XUẤT HÀNH ĐỘNG

### Priority 1 (Implement ngay):
```typescript
// 1. Fix DISPUTE logic
else if (dto.reason === 'DISPUTE') {
  // Cả 2 bị -5 tạm thời, chờ admin review
  await this.trustScoreService.updateTrustScore(exchange.member_a_id);
  await this.trustScoreService.updateTrustScore(exchange.member_b_id);
}

// 2. Fix EXPIRED penalty - chỉ phạt người chưa confirm
if (!exchange.member_a_confirmed) {
  await this.trustScoreService.updateTrustScore(exchange.member_a_id);
}
if (!exchange.member_b_confirmed) {
  await this.trustScoreService.updateTrustScore(exchange.member_b_id);
}
```

### Priority 2 (Cân nhắc):
- Tăng 24h → 48h response time
- Giới hạn 3 pending requests/book
- Cap review bonus ở +30

---

## ✅ KẾT LUẬN

**Tổng thể**: Hệ thống nghiệp vụ **rất tốt**, chỉ có 2 lỗ hổng cần sửa ngay:
1. DISPUTE không xử lý
2. EXPIRED phạt không công bằng

Sau khi fix 2 issues này → Hệ thống **hoàn hảo** cho production! 🚀
