-- Migration 014: Add member_a_reviewed and member_b_reviewed flags to exchanges table
-- Purpose: Track if each member has reviewed the exchange

ALTER TABLE exchanges
ADD COLUMN member_a_reviewed BOOLEAN DEFAULT FALSE,
ADD COLUMN member_b_reviewed BOOLEAN DEFAULT FALSE;

-- Update existing records based on actual reviews
UPDATE exchanges e
SET member_a_reviewed = EXISTS (
  SELECT 1 FROM reviews r
  WHERE r.exchange_id = e.exchange_id
  AND r.reviewer_id = e.member_a_id
);

UPDATE exchanges e
SET member_b_reviewed = EXISTS (
  SELECT 1 FROM reviews r
  WHERE r.exchange_id = e.exchange_id
  AND r.reviewer_id = e.member_b_id
);
