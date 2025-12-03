-- Migration: 014-add-meeting-arrangement.sql
-- Description: Add Meeting Arrangement fields to exchanges table
-- Date: 2024-12-02

-- =============================================
-- Step 1: Add new columns for Meeting Arrangement
-- =============================================

-- Add GPS coordinates for meeting location
ALTER TABLE exchanges 
ADD COLUMN IF NOT EXISTS meeting_latitude DECIMAL(10, 7) NULL COMMENT 'GPS latitude of meeting location';

ALTER TABLE exchanges 
ADD COLUMN IF NOT EXISTS meeting_longitude DECIMAL(10, 7) NULL COMMENT 'GPS longitude of meeting location';

-- Add meeting confirmation fields
ALTER TABLE exchanges 
ADD COLUMN IF NOT EXISTS meeting_confirmed_by_a BOOLEAN DEFAULT FALSE COMMENT 'Member A confirmed the meeting';

ALTER TABLE exchanges 
ADD COLUMN IF NOT EXISTS meeting_confirmed_by_b BOOLEAN DEFAULT FALSE COMMENT 'Member B confirmed the meeting';

ALTER TABLE exchanges 
ADD COLUMN IF NOT EXISTS meeting_scheduled_at TIMESTAMP NULL COMMENT 'When the meeting was scheduled';

ALTER TABLE exchanges 
ADD COLUMN IF NOT EXISTS meeting_scheduled_by VARCHAR(36) NULL COMMENT 'Member ID who scheduled the meeting';

-- =============================================
-- Step 2: Update Exchange Status Enum
-- =============================================

-- Modify the status enum to include new statuses
ALTER TABLE exchanges 
MODIFY COLUMN status ENUM('PENDING', 'ACCEPTED', 'MEETING_SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') 
DEFAULT 'PENDING';

-- =============================================
-- Step 3: Add indexes for better query performance
-- =============================================

-- Index for querying by status
CREATE INDEX IF NOT EXISTS idx_exchanges_status ON exchanges(status);

-- Index for querying by meeting time (for reminders)
CREATE INDEX IF NOT EXISTS idx_exchanges_meeting_time ON exchanges(meeting_time);

-- =============================================
-- Step 4: Add foreign key for meeting_scheduled_by
-- =============================================

ALTER TABLE exchanges 
ADD CONSTRAINT fk_exchange_scheduled_by 
FOREIGN KEY (meeting_scheduled_by) 
REFERENCES members(member_id) 
ON DELETE SET NULL;

-- =============================================
-- Verification Queries
-- =============================================

-- Check new columns exist
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'exchanges' 
AND COLUMN_NAME IN (
  'meeting_latitude', 
  'meeting_longitude', 
  'meeting_confirmed_by_a', 
  'meeting_confirmed_by_b',
  'meeting_scheduled_at',
  'meeting_scheduled_by'
);

-- Check status enum values
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'exchanges' AND COLUMN_NAME = 'status';
