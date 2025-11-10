-- sql/migrations/002-add-message-features.sql
-- This migration adds features for messages:
-- 1. Soft delete support (deleted_at column)
-- 2. Message reactions (emoji) with new table

-- ============================================================
-- Step 1: Add deleted_at column to messages table
-- ============================================================
ALTER TABLE messages ADD COLUMN deleted_at TIMESTAMP NULL AFTER sent_at;

-- Add index for deleted messages filtering
CREATE INDEX idx_messages_deleted_at ON messages(deleted_at, conversation_id);

-- ============================================================
-- Step 2: Create message_reactions table
-- ============================================================
CREATE TABLE message_reactions (
  reaction_id VARCHAR(36) PRIMARY KEY,
  message_id VARCHAR(36) NOT NULL,
  member_id VARCHAR(36) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_reaction_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
  CONSTRAINT fk_reaction_member FOREIGN KEY (member_id) REFERENCES members(member_id),
  
  -- Unique constraint: one emoji reaction per user per message
  CONSTRAINT unique_member_message_emoji UNIQUE KEY (message_id, member_id, emoji),
  
  -- Indexes for efficient queries
  INDEX idx_message_reactions_message (message_id),
  INDEX idx_message_reactions_member (member_id),
  INDEX idx_message_reactions_created (created_at)
);

-- ============================================================
-- Step 3: Verify setup
-- ============================================================
-- Check if deleted_at column exists
SELECT 'Step 1: Verify deleted_at column' as step;
SELECT COLUMN_NAME, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='messages' AND COLUMN_NAME='deleted_at';

-- Check if message_reactions table exists
SELECT 'Step 2: Verify message_reactions table' as step;
DESCRIBE message_reactions;

-- ============================================================
-- Notes for rollback (if needed)
-- ============================================================
-- DROP TABLE IF EXISTS message_reactions;
-- ALTER TABLE messages DROP COLUMN deleted_at;
