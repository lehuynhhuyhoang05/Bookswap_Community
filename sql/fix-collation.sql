-- Fix collation mismatch in messages and conversations tables
-- Convert all VARCHAR columns to utf8mb4_unicode_ci

-- Fix conversations table
ALTER TABLE conversations 
  MODIFY COLUMN conversation_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY COLUMN exchange_request_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY COLUMN member_a_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY COLUMN member_b_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix messages table
ALTER TABLE messages
  MODIFY COLUMN message_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY COLUMN conversation_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY COLUMN sender_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY COLUMN receiver_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix members table (if needed)
ALTER TABLE members
  MODIFY COLUMN member_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  MODIFY COLUMN user_id VARCHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verify changes
SELECT 
  TABLE_NAME, 
  COLUMN_NAME, 
  CHARACTER_SET_NAME, 
  COLLATION_NAME 
FROM 
  INFORMATION_SCHEMA.COLUMNS 
WHERE 
  TABLE_SCHEMA = 'bookswap_db' 
  AND TABLE_NAME IN ('conversations', 'messages', 'members')
  AND COLUMN_NAME LIKE '%_id'
ORDER BY 
  TABLE_NAME, COLUMN_NAME;
