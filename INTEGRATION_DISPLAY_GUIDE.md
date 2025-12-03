# 📍 NƠI HIỂN THỊ TÍCH HỢP EXCHANGE VỚI MESSAGES

## 🎯 Các điểm hiển thị tích hợp

### 1. **Exchange Quick Actions Panel** 
📍 **Vị trí**: Đầu chat area (ngay trên messages thread)

**Hiển thị khi nào**:
- Conversation có `exchange_request_id` (được tạo từ exchange request)
- Backend API trả về `exchange_request` object trong conversation

**Nội dung hiển thị**:
```
┌─────────────────────────────────────────────┐
│ 📦 Yêu cầu trao đổi sách                   │
│                                             │
│ ✅ Đã chấp nhận                             │
│                                             │
│ 📅 Tạo lúc: 03/12/2025, 20:30              │
│                                             │
│ [📦 Xem chi tiết] [📅 Xác nhận gặp mặt]    │
│ [✅ Hoàn thành trao đổi]                    │
└─────────────────────────────────────────────┘
```

**Code location**: 
- Component: `frontend/src/components/messages/ExchangeQuickActions.jsx`
- Usage: `frontend/src/pages/messages/index.jsx` (line ~310)

**Điều kiện render**:
```jsx
{selectedConversation?.exchange_request_id && 
 selectedConversation?.exchange_request && (
  <ExchangeQuickActions
    exchangeRequest={selectedConversation.exchange_request}
    onAction={(action) => console.log('Exchange action:', action)}
  />
)}
```

---

### 2. **Exchange Message Cards**
📍 **Vị trí**: Bên trong message thread (giữa các tin nhắn thường)

**Hiển thị khi nào**:
- Message có `metadata.type === 'exchange_action'`
- Các actions: request_created, request_accepted, meeting_confirmed, exchange_completed, etc.

**Nội dung hiển thị**:
```
        ┌────────────────────────────────┐
        │ 🎉 John Doe đã chấp nhận      │
        │    yêu cầu trao đổi           │
        │                                │
        │ 03/12/2025, 15:30             │
        └────────────────────────────────┘
```

**Code location**:
- Component: `frontend/src/components/messages/ExchangeMessageCard.jsx`
- Usage: `frontend/src/components/messages/MessageThread.jsx` (line ~53)

**Điều kiện render**:
```jsx
messages.map((message) => {
  if (message.metadata && message.metadata.type === 'exchange_action') {
    return <ExchangeMessageCard metadata={message.metadata} />
  }
  return <MessageItem message={message} />
})
```

---

### 3. **Online Status**
📍 **Vị trí**: 
- Conversation header (bên cạnh tên người dùng)
- Conversation list items (dấu chấm xanh)

**Hiển thị**:
```
┌──────────────────────────────┐
│ 👤 John Doe                  │
│ 🟢 Đang hoạt động           │
└──────────────────────────────┘

hoặc

│ ⚪ Hoạt động 5 phút trước     │
```

**Code location**:
- Component: `frontend/src/components/messages/OnlineStatus.jsx`
- Usage: `frontend/src/pages/messages/index.jsx` (line ~250)

---

### 4. **Message Status Indicators**
📍 **Vị trí**: Bên cạnh timestamp của mỗi message (chỉ cho tin nhắn của mình)

**Hiển thị**:
- ✓ = Sent (màu xám)
- ✓✓ = Delivered (màu xám)
- ✓✓ = Read (màu xanh)

**Code location**:
- Component: `frontend/src/components/messages/MessageStatus.jsx`
- Usage: `frontend/src/components/messages/MessageItem.jsx` (line ~120)

---

## 🔍 CÁCH TEST TÍCH HỢP

### Test Exchange Quick Actions:

1. **Tạo exchange request** từ trang Exchange
2. **Chấp nhận request** để tạo conversation
3. **Vào Messages** - Chọn conversation vừa tạo
4. **Xem panel màu xanh** ở đầu chat area

### Test Exchange Message Cards:

Cần gửi message có metadata:
```javascript
sendMessage({
  conversation_id: 'xxx',
  content: 'John đã chấp nhận yêu cầu trao đổi',
  metadata: {
    type: 'exchange_action',
    action: 'request_accepted',
    exchange_id: 'exchange-id',
    actor_name: 'John Doe',
    timestamp: new Date()
  }
})
```

### Test Message Status:

1. Gửi tin nhắn mới
2. Xem ✓ (sent) ngay lập tức
3. Khi receiver online → ✓✓ (delivered)
4. Khi receiver đọc → ✓✓ màu xanh (read)

### Test Online Status:

1. Mở 2 browser/tab khác nhau
2. Login 2 users khác nhau
3. Xem dấu chấm xanh 🟢 khi online
4. Disconnect → Xem "Hoạt động X phút trước"

---

## 📊 DATABASE CHECK

### Kiểm tra conversations có exchange_request:
```sql
SELECT 
  c.conversation_id,
  c.exchange_request_id,
  er.status,
  er.created_at
FROM conversations c
LEFT JOIN exchange_requests er 
  ON c.exchange_request_id = er.request_id
WHERE c.exchange_request_id IS NOT NULL
ORDER BY c.created_at DESC
LIMIT 5;
```

### Kiểm tra messages có metadata:
```sql
SELECT 
  message_id,
  content,
  metadata,
  sent_at
FROM messages
WHERE metadata IS NOT NULL
ORDER BY sent_at DESC
LIMIT 5;
```

### Kiểm tra online status:
```sql
SELECT 
  member_id,
  is_online,
  last_seen_at
FROM members
WHERE is_online = TRUE;
```

---

## 🎨 VISUAL PREVIEW

### Full Messages Page với tích hợp:

```
┌────────────────────────────────────────────────────────────┐
│  Messages                                    🔍 ⋮          │
├──────────────┬─────────────────────────────────────────────┤
│ Conversations│  John Doe                      🟢 Đang hoạt│
│              │  động                                       │
│ 🟢 John Doe  ├─────────────────────────────────────────────┤
│   Đã chấp... │  ┌───────────────────────────────────────┐ │
│              │  │ 📦 Yêu cầu trao đổi sách             │ │
│ ⚪ Alice     │  │ ✅ Đã chấp nhận                       │ │
│   Hello...   │  │ 📅 Tạo lúc: 03/12/2025               │ │
│              │  │ [📦 Xem] [📅 Xác nhận] [✅ Hoàn thành]│ │
│              │  └───────────────────────────────────────┘ │
│              │                                             │
│              │  ┌─────────────────────────┐               │
│              │  │ 🎉 John Doe đã chấp     │               │
│              │  │    nhận yêu cầu         │               │
│              │  └─────────────────────────┘               │
│              │                                             │
│              │  Hi! Ready to exchange? ✓✓ 15:30          │
│              │                                             │
│              │            Sure! Let's meet ✓ 15:31       │
│              │                                             │
│              ├─────────────────────────────────────────────┤
│              │  💬 Type a message...            📎 😊 🎤 │
└──────────────┴─────────────────────────────────────────────┘
```

---

## 🚀 NEXT STEPS

Để test đầy đủ, bạn cần:

1. ✅ Backend đã chạy (port 3000)
2. ✅ Frontend đã chạy (port 5173)
3. ✅ Database có exchange_requests data
4. ✅ Tạo conversation từ exchange request
5. ✅ Login và mở Messages page
6. ✅ Chọn conversation có exchange_request_id

Tích hợp sẽ hiển thị tự động!
