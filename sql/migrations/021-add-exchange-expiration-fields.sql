-- Migration 021: Add expiration and cancellation timestamp to exchanges
-- Date: 2025-12-04
-- Purpose: Add expires_at and cancelled_at fields to exchanges table

USE bookswap_db;

-- Add expires_at field (for auto-expiring exchanges)
ALTER TABLE exchanges 
ADD COLUMN expires_at TIMESTAMP NULL AFTER meeting_scheduled_by;

-- Add cancelled_at field (track when exchange was cancelled)
ALTER TABLE exchanges 
ADD COLUMN cancelled_at TIMESTAMP NULL AFTER cancellation_note;

-- Set default expiration for existing PENDING exchanges (60 days from created_at)
UPDATE exchanges 
SET expires_at = DATE_ADD(created_at, INTERVAL 60 DAY)
WHERE status = 'PENDING' AND expires_at IS NULL;

-- Add index for cron job performance
CREATE INDEX idx_exchanges_expired ON exchanges(status, expires_at);

-- Verification query
SELECT 
  exchange_id,
  status,
  created_at,
  expires_at,
  cancelled_at,
  CASE 
    WHEN expires_at IS NOT NULL AND expires_at < NOW() THEN 'EXPIRED'
    ELSE 'ACTIVE'
  END as expiration_status
FROM exchanges
WHERE status = 'PENDING'
ORDER BY created_at DESC
LIMIT 10;
