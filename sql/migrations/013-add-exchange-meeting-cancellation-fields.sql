-- Migration 013: Add cancellation details to exchanges table
-- Date: 2025-11-21
-- Note: meeting_location, meeting_time, meeting_notes, cancellation_reason already exist from migration 010

ALTER TABLE exchanges
ADD COLUMN IF NOT EXISTS cancellation_details TEXT NULL AFTER cancellation_reason;
