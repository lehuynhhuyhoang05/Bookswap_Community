-- Migration 017: Add unique constraint to prevent duplicate conversations
-- This ensures that two members can only have one direct conversation
-- and one conversation per exchange request

-- First, remove any duplicate conversations (keep the one with most messages or earliest created)
-- For direct conversations (where exchange_request_id IS NULL)
DELETE c1 FROM conversations c1
INNER JOIN conversations c2
WHERE c1.conversation_id > c2.conversation_id
  AND c1.exchange_request_id IS NULL
  AND c2.exchange_request_id IS NULL
  AND (
    (c1.member_a_id = c2.member_a_id AND c1.member_b_id = c2.member_b_id)
    OR
    (c1.member_a_id = c2.member_b_id AND c1.member_b_id = c2.member_a_id)
  );

-- Add a computed column to help with unique constraint for direct conversations
-- This will store the smaller member_id first, ensuring bidirectional uniqueness
ALTER TABLE conversations
ADD COLUMN member_pair VARCHAR(73) GENERATED ALWAYS AS (
  CASE
    WHEN member_a_id < member_b_id THEN CONCAT(member_a_id, '-', member_b_id)
    ELSE CONCAT(member_b_id, '-', member_a_id)
  END
) STORED;

-- Create unique index for direct conversations (no exchange request)
-- This ensures two members can only have one direct conversation
-- Note: MySQL doesn't allow NULL in unique index, so we use a workaround
-- with a special value for direct conversations
ALTER TABLE conversations
ADD COLUMN conversation_type VARCHAR(10) GENERATED ALWAYS AS (
  CASE
    WHEN exchange_request_id IS NULL THEN 'direct'
    ELSE 'exchange'
  END
) STORED;

-- Unique constraint for direct conversations
CREATE UNIQUE INDEX idx_unique_direct_conversation 
ON conversations (member_pair, conversation_type);

-- Create unique index for exchange conversations
-- This ensures one conversation per exchange request
CREATE UNIQUE INDEX idx_unique_exchange_conversation
ON conversations (exchange_request_id);
