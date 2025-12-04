-- Migration: Add request expiration and cancelled_by tracking
-- Date: 2024-12-04
-- Purpose: 
--   1. Add expires_at to exchange_requests for 14-day expiration
--   2. Add cancelled_by to exchanges to track who cancelled (for fair penalty)

-- =====================================================
-- 1. Add expires_at column to exchange_requests
-- =====================================================
ALTER TABLE exchange_requests
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL DEFAULT NULL
COMMENT 'Request expiration date (14 days from creation)';

-- Update existing PENDING requests to have an expiration date (14 days from now)
UPDATE exchange_requests 
SET expires_at = DATE_ADD(created_at, INTERVAL 14 DAY)
WHERE status = 'PENDING' AND expires_at IS NULL;

-- =====================================================
-- 2. Add cancelled_by column to exchanges
-- =====================================================
ALTER TABLE exchanges
ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(36) NULL DEFAULT NULL
COMMENT 'Member ID of who cancelled the exchange (for penalty tracking)';

-- Add index for faster expiration queries
CREATE INDEX IF NOT EXISTS idx_request_expires_status 
ON exchange_requests(status, expires_at);

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Migration 015 completed successfully' AS status;

-- Show updated structure
DESCRIBE exchange_requests;
DESCRIBE exchanges;
