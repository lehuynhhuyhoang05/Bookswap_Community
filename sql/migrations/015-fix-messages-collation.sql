-- Fix collation mismatch in messages and conversations tables
-- Issue: Illegal mix of collations (utf8mb4_unicode_ci,IMPLICIT) and (utf8mb4_0900_ai_ci,IMPLICIT)

-- Fix conversations table
ALTER TABLE conversations 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix messages table  
ALTER TABLE messages
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Fix message_reactions table if exists
ALTER TABLE message_reactions
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Verify collations
SELECT 
  TABLE_NAME,
  TABLE_COLLATION
FROM 
  information_schema.TABLES
WHERE 
  TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('conversations', 'messages', 'message_reactions')
ORDER BY 
  TABLE_NAME;
