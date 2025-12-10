-- Migration: Add lock_reason and locked_until to users table
-- Purpose: Support temporary and permanent account bans from report system

-- Add lock_reason column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS lock_reason VARCHAR(500) NULL;

-- Add locked_until column for temporary bans
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL;

-- Add index for locked_until to efficiently check expired bans
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON users(locked_until);
