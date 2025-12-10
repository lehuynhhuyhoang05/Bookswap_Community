-- Migration: Add message status tracking and exchange integration
-- Date: 2025-12-03
-- Purpose: Implement message status (sent/delivered/read) and integrate with exchanges

USE bookswap_db;

-- ============================================
-- 1. ADD MESSAGE STATUS FIELDS
-- ============================================

-- Add status field with enum
ALTER TABLE messages 
ADD COLUMN status ENUM('sent', 'delivered', 'read') NOT NULL DEFAULT 'sent' AFTER is_read;

-- Add delivered_at timestamp
ALTER TABLE messages 
ADD COLUMN delivered_at TIMESTAMP NULL AFTER read_at;

-- Add index for faster status queries
ALTER TABLE messages 
ADD INDEX idx_message_status (status, delivered_at);

-- ============================================
-- 2. ADD EXCHANGE QUICK ACTIONS IN MESSAGES
-- ============================================

-- Add exchange-related message metadata (JSON for flexibility)
ALTER TABLE messages 
ADD COLUMN metadata JSON NULL COMMENT 'Store exchange actions, book references, etc.' AFTER attachment_size;

-- Example metadata structure:
-- {
--   "type": "exchange_action",
--   "action": "confirm_meeting",
--   "exchange_id": "uuid",
--   "book_id": "uuid",
--   "meeting_location": "...",
--   "meeting_time": "2025-12-05T10:00:00"
-- }

-- ============================================
-- 3. ADD ONLINE STATUS TO MEMBERS
-- ============================================

-- Track member online status
ALTER TABLE members 
ADD COLUMN is_online TINYINT(1) NOT NULL DEFAULT 0 AFTER is_verified;

ALTER TABLE members 
ADD COLUMN last_seen_at TIMESTAMP NULL AFTER is_online;

-- Index for online status queries
ALTER TABLE members 
ADD INDEX idx_online_status (is_online, last_seen_at);

-- ============================================
-- 4. UPDATE EXISTING DATA
-- ============================================

-- Set status to 'read' for already read messages
UPDATE messages 
SET status = 'read' 
WHERE is_read = 1;

-- Set status to 'delivered' for old unread messages (assume delivered)
UPDATE messages 
SET status = 'delivered',
    delivered_at = sent_at
WHERE is_read = 0 AND sent_at < DATE_SUB(NOW(), INTERVAL 1 DAY);

-- ============================================
-- 5. ADD CONVERSATION METADATA
-- ============================================

-- Add metadata to conversations for storing quick actions, pinned messages, etc.
ALTER TABLE conversations 
ADD COLUMN metadata JSON NULL COMMENT 'Pinned messages, quick actions, exchange info' AFTER total_messages;

-- Example: { "pinned_message_id": "uuid", "exchange_id": "uuid", "quick_actions": ["confirm_meeting", "complete_exchange"] }

-- ============================================
-- 6. CREATE MESSAGE TEMPLATES TABLE (OPTIONAL)
-- ============================================

CREATE TABLE IF NOT EXISTS message_templates (
  template_id VARCHAR(36) PRIMARY KEY,
  member_id VARCHAR(36) NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('greeting', 'exchange', 'meeting', 'custom') DEFAULT 'custom',
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
  INDEX idx_member_templates (member_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default templates
INSERT INTO message_templates (template_id, member_id, title, content, category) 
SELECT 
  UUID(),
  member_id,
  'Đồng ý lịch hẹn',
  'Đồng ý! Mình sẽ có mặt đúng giờ.',
  'meeting'
FROM members 
LIMIT 1;

-- ============================================
-- 7. ADD NOTIFICATION PREFERENCES
-- ============================================

-- Add notification settings to members
ALTER TABLE members 
ADD COLUMN notification_settings JSON NULL COMMENT 'Desktop, email, sound preferences' AFTER last_seen_at;

-- Default notification settings
UPDATE members 
SET notification_settings = JSON_OBJECT(
  'desktop_enabled', true,
  'sound_enabled', true,
  'email_enabled', false,
  'new_message', true,
  'exchange_update', true
)
WHERE notification_settings IS NULL;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Migration 016 completed successfully!' AS status;

SELECT 
  COUNT(*) as total_messages,
  SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) as read_messages,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_messages,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_messages
FROM messages;
