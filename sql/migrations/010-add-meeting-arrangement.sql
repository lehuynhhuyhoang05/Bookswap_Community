-- Migration: Add meeting arrangement fields to exchanges table
-- Date: 2025-11-21
-- Description: Add support for meeting location, time, and notes for exchanges

-- Step 1: Add meeting arrangement fields
ALTER TABLE exchanges 
ADD COLUMN meeting_location VARCHAR(500) NULL AFTER expires_at,
ADD COLUMN meeting_time TIMESTAMP NULL AFTER meeting_location,
ADD COLUMN meeting_notes TEXT NULL AFTER meeting_time,
ADD COLUMN meeting_updated_by VARCHAR(36) NULL AFTER meeting_notes,
ADD COLUMN meeting_updated_at TIMESTAMP NULL AFTER meeting_updated_by;

-- Step 2: Add index for meeting time queries
CREATE INDEX idx_exchanges_meeting_time ON exchanges(meeting_time);

-- Step 3: Add foreign key for meeting_updated_by
ALTER TABLE exchanges
ADD CONSTRAINT fk_exchanges_meeting_updated_by 
FOREIGN KEY (meeting_updated_by) REFERENCES members(member_id) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Verification
SELECT 'Migration completed successfully' as message;
SELECT COUNT(*) as exchanges_count FROM exchanges;
