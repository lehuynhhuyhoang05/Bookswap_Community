# 🎯 Hệ Thống Trust Score (Điểm Uy Tín)

## 📊 Tổng Quan

Trust Score là hệ thống đánh giá uy tín người dùng dựa trên hành vi trao đổi sách. Điểm số từ **0-100**, càng cao càng đáng tin cậy.

**Điểm khởi điểm**: 50 điểm

---

## 🎁 Cách Tăng Điểm (Bonuses)

| Hành động | Điểm thưởng | Ghi chú |
|-----------|-------------|---------|
| ✅ Hoàn thành trao đổi | **+5** | Mỗi lần giao dịch thành công |
| ⭐ Review tốt (4-5 sao) | **+3** | Mỗi đánh giá tích cực nhận được |
| ✉️ Xác thực email | **+10** | Thưởng một lần |
| 📷 Có avatar | **+5** | Thưởng một lần |

---

## ⚠️ Cách Bị Trừ Điểm (Penalties)

### 🔴 Các Lỗi Vi Phạm

| Lỗi | Mức phạt | Ai bị phạt | Giải thích |
|-----|----------|------------|------------|
| **NO_SHOW** 🚫 | **-20** | Chỉ người không đến | Hẹn gặp nhưng không xuất hiện |
| **BOTH_NO_SHOW** | **-20** | Cả 2 người | Cả hai đều không đến |
| **USER_CANCELLED** | **-10** | Chỉ người hủy | Hủy giao dịch vì lý do cá nhân |
| **EXPIRED** ⏰ | **-5** | Cả 2 người | Quá hạn xác nhận (7 ngày) |
| **Bad Review (1-2 sao)** ⭐ | **-15** | Người bị đánh giá xấu | Nhận review tiêu cực |

### 📝 Logic Phạt Công Bằng

**Quan trọng**: Chỉ người vi phạm mới bị trừ điểm!

#### Ví dụ:
- **User A hẹn gặp, User B không đến (NO_SHOW)**
  - User A: **Không bị trừ điểm** ❌
  - User B: **-20 điểm** ✅ (người không đến)

- **User A tự hủy giao dịch (USER_CANCELLED)**
  - User A: **-10 điểm** ✅ (người hủy)
  - User B: **Không bị trừ điểm** ❌

- **Cả 2 đều không đến (BOTH_NO_SHOW)**
  - User A: **-20 điểm** ✅
  - User B: **-20 điểm** ✅

- **Admin hủy (ADMIN_CANCELLED)**
  - User A: **Không bị trừ điểm** ❌
  - User B: **Không bị trừ điểm** ❌

---

## 🚨 Hạn Chế & Phạt Khi Trust Score Thấp

### ⛔ Trust Score < 10 - CẤM THAM GIA

**KHÔNG THỂ TẠO YÊU CẦU TRAO ĐỔI**

```
Error: "Your trust score (8) is too low to create exchange requests. 
Minimum required: 10. Complete exchanges successfully to improve your score."
```

**Cách khắc phục**:
- Hoàn thành các giao dịch đang có (+5/lần)
- Xác thực email (+10)
- Thêm avatar (+5)
- Nhận review tốt (+3/review)

---

### ⚠️ Trust Score 10-19 - HẠN CHẾ NẶNG

#### 1. **Giới hạn Request (Max 2 Pending)**
```
Error: "Your trust score (15) limits you to 2 pending requests at a time. 
Wait for responses or improve your trust score."
```

#### 2. **Phải Phản Hồi Trong 24 Giờ** ⏰
- Nếu nhận request, **BẮT BUỘC** accept/reject trong 24h
- Quá 24h sẽ bị chặn accept
```
Error: "Users with trust score < 20 must respond within 24 hours. 
This request is 30 hours old."
```

#### 3. **Thời Gian Xác Nhận Ngắn** ⏱️
- Chỉ có **3 NGÀY** để confirm exchange (thay vì 14 ngày)
- Quá 3 ngày → Exchange tự động EXPIRED → -5 điểm
- **Áp lực cao**: Phải nhanh chóng hoàn thành

#### 4. **Request Bị Ẩn Xuống Dưới** 👎
- Request của bạn hiển thị **CÓ MỨC ĐỘ ƯU TIÊN THẤP**
- Người có trust score cao được hiển thị trước
- Khó tìm partner trao đổi

**Tổng kết**: Rất khó tham gia, bị giám sát chặt chẽ

---

### 🔶 Trust Score 20-39 - HẠN CHẾ VỪA

#### 1. **Không giới hạn số request** ✅
#### 2. **Thời gian xác nhận trung bình**: 7 ngày
#### 3. **Phản hồi thoải mái**: Không giới hạn 24h
#### 4. **Hiển thị bình thường**: Ưu tiên trung bình

**Tổng kết**: Có thể tham gia bình thường, nhưng chưa được ưu tiên

---

### ✅ Trust Score ≥ 40 - KHÔNG GIỚI HẠN

#### 1. **Unlimited requests** 🚀
#### 2. **Thời gian xác nhận dài**: 14 ngày đầy đủ
#### 3. **Phản hồi linh hoạt**: Không áp lực thời gian
#### 4. **Hiển thị ưu tiên cao**: Request lên đầu danh sách
#### 5. **Được tin tưởng**: Người khác sẵn sàng trao đổi

**Tổng kết**: VIP treatment, dễ dàng tìm partner

---

## 🎯 Tại Sao Hệ Thống Này Hợp Lý?

### 1. **Bảo Vệ Người Dùng Tốt**
- Người có lịch sử tốt không bị ảnh hưởng bởi người xấu
- Request của người đáng tin cậy được ưu tiên → Tìm partner nhanh hơn
- Giảm thiểu rủi ro bị NO_SHOW hoặc bị hủy

### 2. **Trừng Phạt Người Xấu Công Bằng**
- Không cấm vĩnh viễn → Vẫn có cơ hội cải thiện
- Phạt nặng dần theo mức độ vi phạm
- Càng vi phạm nhiều → Càng khó tham gia

### 3. **Tạo Động Lực Cải Thiện**
- Trust score < 10: "Tôi phải cố gắng hoàn thành giao dịch để lên 10+"
- Trust score 10-19: "Tôi bị giới hạn quá nhiều, phải lên 20+"
- Trust score 20-39: "Muốn được ưu tiên và 14 ngày confirm? Phải lên 40+"
- Trust score 40+: "Duy trì hành vi tốt để giữ đặc quyền"

### 4. **Tự Động & Minh Bạch**
- Không phụ thuộc admin chủ quan
- Mọi người đều biết rõ hậu quả của hành động
- Điểm tự động cập nhật → Không thể gian lận

### 5. **Phân Biệt Rõ Người Mới vs Người Xấu**
- **Người mới**: 50 điểm, verify email → 60 điểm → Bắt đầu tốt
- **Người xấu**: NO_SHOW nhiều lần → Dưới 10 → Bị chặn
- Hệ thống không phạt người mới, chỉ phạt người có lịch sử xấu

---

## ⚖️ So Sánh Kịch Bản

### Kịch Bản A: Người Dùng Tốt (Trust 80)
```
✅ Tạo unlimited requests
✅ 14 ngày để confirm → Linh hoạt
✅ Request hiển thị đầu tiên → Nhiều người quan tâm
✅ Phản hồi khi nào cũng được
✅ Dễ dàng tìm partner
⏱️ Thời gian trung bình tìm partner: 2 giờ
```

### Kịch Bản B: Người Dùng Xấu (Trust 15)
```
⛔ Chỉ 2 requests/lần
⏰ BẮT BUỘC phản hồi trong 24h
⏱️ Chỉ 3 ngày để confirm → Áp lực cao
👎 Request bị đẩy xuống cuối → Ít người thấy
🚫 Khó tìm partner (người khác ngại trust score thấp)
⏱️ Thời gian trung bình tìm partner: 3 ngày (hoặc không có)
```

### Kết Luận
**Hệ thống tự động "trừng phạt" người xấu bằng cách làm họ khó tham gia hơn, trong khi thưởng người tốt bằng trải nghiệm VIP.**

---

## 🔄 Tự Động Cập Nhật

Trust Score được tự động cập nhật khi:

1. ✅ **Hoàn thành giao dịch** (`confirmExchange`)
2. ❌ **Hủy giao dịch** (`cancelExchange`)
3. ⏰ **Hết hạn tự động** (`autoExpireExchanges`)
4. ⭐ **Nhận review mới** (tự động trigger)

**Không cần tính thủ công!**

---

## 📈 Ví Dụ Tính Điểm

### User A - Người Dùng Tốt
```
Điểm gốc:             50
+ 10 giao dịch hoàn thành: +50  (10 × 5)
+ 5 review tốt:       +15  (5 × 3)
+ Email verified:     +10
+ Có avatar:          +5
- 1 lần hủy:          -10  (1 × 10)
───────────────────────────
= 120 → Giới hạn 100
TRUST SCORE: 100 ⭐⭐⭐
```

### User B - Người Dùng Tệ
```
Điểm gốc:             50
- 3 lần NO_SHOW:      -60  (3 × 20)
- 2 review xấu:       -30  (2 × 15)
+ 2 giao dịch hoàn thành: +10  (2 × 5)
───────────────────────────
= -30 → Giới hạn 0
TRUST SCORE: 0 🚫
```

**User B không thể tạo request mới! (< 10)**

---

## 💡 Chiến Lược Tăng Điểm

### Bắt đầu (50 điểm)
1. ✉️ Xác thực email → **60 điểm**
2. 📷 Upload avatar → **65 điểm**
3. ✅ Hoàn thành 3 giao dịch → **80 điểm**

### Duy trì điểm cao
- Luôn đến đúng hẹn (tránh NO_SHOW)
- Không hủy tùy tiện
- Giao dịch nhanh, tránh để quá hạn
- Cư xử tốt để nhận review tích cực

### Phục hồi sau vi phạm
- **Bị -20 NO_SHOW?** → Cần 4 giao dịch thành công để bù (+20)
- **Dưới 10 điểm?** → Xác thực email (+10), thêm avatar (+5) để về 15+

---

## 🔒 Bảo Mật

- ❌ **KHÔNG THỂ chỉnh sửa thủ công** (chỉ admin trong trường hợp đặc biệt)
- ✅ **Tự động tính toán** dựa trên dữ liệu thực
- 📊 **Minh bạch**: Logs chi tiết mỗi lần tính điểm
- 🛡️ **Công bằng**: Chỉ phạt người vi phạm thực sự

---

## 🧪 Testing

```powershell
# Test NO_SHOW penalty
# User2 không đến → chỉ User2 bị -20
curl -X PATCH http://localhost:3003/exchanges/{id}/cancel \
  -H "Authorization: Bearer {token}" \
  -d '{"reason":"NO_SHOW","note":"Didn't show up"}'

# Kiểm tra trust score
curl http://localhost:3003/auth/me \
  -H "Authorization: Bearer {token}"
```

---

## 📞 Support

- **Low Trust Score?** → Hoàn thành nhiều giao dịch hơn
- **Unfair Penalty?** → Liên hệ admin, cung cấp bằng chứng
- **Bug?** → Report với logs chi tiết

**🎯 Mục tiêu**: Xây dựng cộng đồng trao đổi sách đáng tin cậy và công bằng!
