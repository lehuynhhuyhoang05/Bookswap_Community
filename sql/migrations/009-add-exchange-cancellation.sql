-- Migration: Add cancellation and expiration fields to exchanges table
-- Date: 2025-11-21
-- Description: Add support for exchange cancellation and auto-expiration

-- Step 1: Add EXPIRED to ExchangeStatus enum
ALTER TABLE exchanges 
MODIFY COLUMN status ENUM('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'EXPIRED') 
NOT NULL DEFAULT 'PENDING';

-- Step 2: Add cancellation tracking fields
ALTER TABLE exchanges 
ADD COLUMN cancelled_at TIMESTAMP NULL AFTER completed_at,
ADD COLUMN cancelled_by VARCHAR(36) NULL AFTER cancelled_at,
ADD COLUMN cancellation_reason ENUM('USER_CANCELLED', 'AUTO_EXPIRED', 'DISPUTE', 'NO_SHOW') NULL AFTER cancelled_by,
ADD COLUMN cancellation_note TEXT NULL AFTER cancellation_reason,
ADD COLUMN expires_at TIMESTAMP NULL AFTER cancellation_note;

-- Step 3: Add index for expiration queries
CREATE INDEX idx_exchanges_expires_status ON exchanges(expires_at, status);

-- Step 4: Set expires_at for existing PENDING exchanges (14 days from creation)
UPDATE exchanges 
SET expires_at = DATE_ADD(created_at, INTERVAL 14 DAY)
WHERE status = 'PENDING' AND expires_at IS NULL;

-- Step 5: Add foreign key for cancelled_by
ALTER TABLE exchanges
ADD CONSTRAINT fk_exchanges_cancelled_by 
FOREIGN KEY (cancelled_by) REFERENCES members(member_id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Verification queries
SELECT 'Migration completed successfully' as message;
SELECT COUNT(*) as pending_with_expiry FROM exchanges WHERE status = 'PENDING' AND expires_at IS NOT NULL;
