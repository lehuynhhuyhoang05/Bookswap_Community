-- ============================================================
-- Migration 005: Upgrade Notifications Schema
-- Purpose: Add JSON payload, indexes, soft delete support
-- Date: 2025-11-05
-- ============================================================

USE bookswap_db;

-- Step 1: Add new columns
ALTER TABLE notifications
  ADD COLUMN payload JSON NULL COMMENT 'Flexible JSON payload for notification content',
  ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  ADD COLUMN deleted_at DATETIME NULL COMMENT 'Soft delete timestamp';

-- Step 2: Migrate existing data (content -> payload if needed)
-- If you have existing data in 'content' column and want to preserve it:
-- UPDATE notifications 
-- SET payload = JSON_OBJECT('content', content, 'title', title, 'reference_type', reference_type, 'reference_id', reference_id)
-- WHERE content IS NOT NULL OR title IS NOT NULL;

-- Step 3: Drop old columns (optional - only if you want to clean up)
-- ALTER TABLE notifications
--   DROP COLUMN title,
--   DROP COLUMN content,
--   DROP COLUMN reference_type,
--   DROP COLUMN reference_id;

-- Step 4: Add performance indexes
CREATE INDEX idx_notifications_member_created ON notifications(member_id, created_at DESC);
CREATE INDEX idx_notifications_member_isread ON notifications(member_id, is_read);

-- Step 5: Update notification_type column size
ALTER TABLE notifications 
  MODIFY COLUMN notification_type VARCHAR(64) NOT NULL;

-- ============================================================
-- Verification Queries
-- ============================================================
-- Check indexes:
-- SHOW INDEX FROM notifications;

-- Check structure:
-- DESCRIBE notifications;

-- Sample query to verify:
-- SELECT notification_id, member_id, notification_type, payload, is_read, deleted_at, created_at 
-- FROM notifications 
-- WHERE member_id = 'test-member-1' AND deleted_at IS NULL 
-- ORDER BY created_at DESC 
-- LIMIT 10;
