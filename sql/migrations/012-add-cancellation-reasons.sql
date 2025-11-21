-- Migration: Add BOTH_NO_SHOW and ADMIN_CANCELLED to cancellation_reason enum
-- Date: 2025-11-21
-- Description: Extend cancellation reasons to match entity definition

-- Add missing enum values to cancellation_reason
ALTER TABLE exchanges 
MODIFY COLUMN cancellation_reason ENUM(
  'USER_CANCELLED', 
  'AUTO_EXPIRED', 
  'DISPUTE', 
  'NO_SHOW', 
  'BOTH_NO_SHOW', 
  'ADMIN_CANCELLED'
) NULL;

-- Verification
SELECT 'Migration 012 completed: Added BOTH_NO_SHOW and ADMIN_CANCELLED' as message;
