# Message Module - Đề xuất cải thiện

## 🎯 Ưu tiên cao (Cần thiết cho trải nghiệm tốt)

### 1. **Message Status (Trạng thái tin nhắn)**
- [ ] Hiển thị trạng thái: Đã gửi ✓, Đã nhận ✓✓, Đã đọc ✓✓ (màu xanh)
- [ ] Backend: Thêm field `delivered_at` vào Message entity
- [ ] WebSocket: Emit event khi tin nhắn được delivered/read
- [ ] UI: Icon check marks bên cạnh tin nhắn

**File cần sửa:**
```typescript
// src/infrastructure/database/entities/message.entity.ts
delivered_at: Date;  // Thời điểm người nhận nhận được tin nhắn (online)

// src/modules/messages/gateways/messages/messages.gateway.ts
emitMessageDelivered(conversationId, messageId)  // Khi user online nhận tin
```

---

### 2. **Last Seen / Online Status**
- [ ] Hiển thị "Đang hoạt động" hoặc "Hoạt động lần cuối: 5 phút trước"
- [ ] Backend: Track last activity timestamp
- [ ] WebSocket: Emit online/offline events
- [ ] UI: Dot xanh bên cạnh avatar khi online

**File cần sửa:**
```typescript
// src/infrastructure/database/entities/member.entity.ts
last_seen_at: Date;
is_online: boolean;

// Gateway: Cập nhật last_seen khi user disconnect
```

---

### 3. **Notification cho tin nhắn mới**
- [ ] Desktop notification khi nhận tin nhắn (nếu browser cho phép)
- [ ] Sound notification (tùy chọn)
- [ ] Badge count trên tab title: "(3) Messages - BookSwap"

**File mới:**
```javascript
// frontend/src/services/notifications.js
export const showMessageNotification = (sender, message) => {
  if (Notification.permission === 'granted') {
    new Notification(`${sender}`, {
      body: message,
      icon: '/logo.png'
    });
  }
};
```

---

### 4. **Image/File Preview trong chat**
- [ ] Preview ảnh trực tiếp trong chat (không cần click)
- [ ] Thumbnail cho PDF, documents
- [ ] Lightbox để xem ảnh full size
- [ ] Download button cho files

**Component mới:**
```jsx
// frontend/src/components/messages/MessageAttachment.jsx
- Image preview với lazy loading
- PDF thumbnail
- File download với progress
```

---

## 🎨 Ưu tiên trung bình (Tăng trải nghiệm)

### 5. **Message Draft (Lưu tin nhắn đang soạn)**
- [ ] Auto-save draft khi đang gõ
- [ ] Restore draft khi quay lại conversation
- [ ] LocalStorage hoặc IndexedDB

```javascript
// Auto-save every 2 seconds
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem(`draft_${conversationId}`, messageText);
  }, 2000);
  return () => clearTimeout(timer);
}, [messageText]);
```

---

### 6. **Quick Replies / Templates**
- [ ] Nút trả lời nhanh: "Đồng ý", "Cảm ơn", "Xin lỗi, đã swap rồi"
- [ ] Custom templates cho user tự tạo
- [ ] Gợi ý reply dựa trên context (AI - optional)

---

### 7. **Message Forwarding**
- [ ] Forward tin nhắn sang conversation khác
- [ ] Forward với quote (trích dẫn)

**API endpoint mới:**
```typescript
POST /api/v1/messages/forward
{
  "message_id": "uuid",
  "target_conversation_ids": ["uuid1", "uuid2"]
}
```

---

### 8. **Conversation Archive**
- [ ] Ẩn conversation nhưng không xóa
- [ ] Filter: Active / Archived
- [ ] Unarchive khi có tin nhắn mới

```typescript
// Entity: Conversation
is_archived_by_a: boolean;
is_archived_by_b: boolean;
```

---

### 9. **Message Search cải thiện**
- [ ] Search by date range
- [ ] Filter by sender
- [ ] Search attachments only
- [ ] Highlight kết quả tìm kiếm

---

### 10. **Conversation Info Panel**
- [ ] View exchange request details
- [ ] View shared books
- [ ] View media gallery (all ảnh đã gửi)
- [ ] Mute conversation

---

## 🚀 Ưu tiên thấp (Nice to have)

### 11. **Message Reactions mở rộng**
- [ ] Multiple reactions per message
- [ ] Custom reactions (stickers)
- [ ] Reaction panel popup

---

### 12. **Voice Messages**
- [ ] Record voice trong browser
- [ ] Play voice inline
- [ ] Waveform visualization

---

### 13. **Video/Voice Call**
- [ ] WebRTC video call
- [ ] Voice call
- [ ] Screen sharing (for book preview)

---

### 14. **Message Translation**
- [ ] Auto-translate nếu user khác region/language
- [ ] Integrate Google Translate API

---

### 15. **Smart Suggestions**
- [ ] Gợi ý meeting location (Google Maps)
- [ ] Gợi ý thời gian gặp
- [ ] Auto-link book ISBNs

---

## 📊 Technical Improvements

### 16. **Performance**
- [ ] Virtual scrolling cho conversation list
- [ ] Lazy load messages (chỉ load visible)
- [ ] WebSocket reconnection strategy
- [ ] Message cache (IndexedDB)

---

### 17. **Error Handling**
- [ ] Retry failed messages
- [ ] Offline queue
- [ ] Better error messages cho user

---

### 18. **Security**
- [ ] Message encryption (E2E)
- [ ] Report/Block user
- [ ] Spam detection

---

## 🎯 Đề xuất triển khai ưu tiên

**Sprint 1 (1-2 tuần):**
1. Message Status (✓✓✓)
2. Last Seen / Online Status
3. Image Preview

**Sprint 2 (1-2 tuần):**
4. Notifications
5. Message Draft
6. Quick Replies

**Sprint 3 (1-2 tuần):**
7. Conversation Archive
8. Search improvements
9. Conversation Info Panel

**Future:**
- Voice messages
- Video call
- Advanced features

---

## 💡 Code Snippets cho Priority Features

### Message Status Implementation

**Backend - Message Entity:**
```typescript
// src/infrastructure/database/entities/message.entity.ts
@Column({ type: 'datetime', nullable: true })
delivered_at: Date;

@Column({ type: 'varchar', length: 50, default: 'sent' })
status: 'sent' | 'delivered' | 'read';
```

**Backend - Gateway:**
```typescript
// When receiver is online and receives message
@SubscribeMessage('message:received')
handleMessageReceived(@ConnectedSocket() client: Socket, @MessageBody() data: { message_id: string }) {
  const messageId = data.message_id;
  
  // Update status to 'delivered'
  await this.messageRepo.update({ message_id: messageId }, {
    delivered_at: new Date(),
    status: 'delivered'
  });
  
  // Emit to sender
  this.server.to(`user:${senderId}`).emit('message:delivered', { message_id: messageId });
}
```

**Frontend - Message Component:**
```jsx
const MessageStatus = ({ message }) => {
  if (message.status === 'read') {
    return <span className="text-blue-500">✓✓</span>;
  } else if (message.status === 'delivered') {
    return <span className="text-gray-500">✓✓</span>;
  } else {
    return <span className="text-gray-400">✓</span>;
  }
};
```

---

### Online Status Implementation

**Backend - Track Online Users:**
```typescript
// messages.gateway.ts
private onlineUsers = new Map<string, { socketId: string, lastSeen: Date }>();

handleConnection(client: Socket) {
  // ... existing code
  this.onlineUsers.set(member.member_id, {
    socketId: client.id,
    lastSeen: new Date()
  });
  
  // Broadcast to contacts
  client.broadcast.emit('user:online', { member_id: member.member_id });
}

handleDisconnect(client: Socket) {
  const memberId = client.data.memberId;
  if (memberId) {
    this.onlineUsers.delete(memberId);
    
    // Update last_seen in DB
    await this.memberRepo.update({ member_id: memberId }, {
      last_seen_at: new Date()
    });
    
    client.broadcast.emit('user:offline', {
      member_id: memberId,
      last_seen: new Date()
    });
  }
}
```

**Frontend - Online Indicator:**
```jsx
const OnlineStatus = ({ memberId, lastSeen }) => {
  const { isUserOnline } = useMessages();
  const online = isUserOnline(memberId);
  
  if (online) {
    return (
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-xs text-gray-500">Đang hoạt động</span>
      </div>
    );
  }
  
  return (
    <span className="text-xs text-gray-400">
      Hoạt động {formatDistanceToNow(lastSeen)} trước
    </span>
  );
};
```

