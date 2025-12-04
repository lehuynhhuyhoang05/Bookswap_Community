-- Migration: Add severity and evidence_urls to violation_reports
-- Run this migration if not already applied via Docker command

-- Add severity column (enum: LOW, MEDIUM, HIGH)
ALTER TABLE violation_reports 
ADD COLUMN IF NOT EXISTS severity ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM' AFTER priority;

-- Add evidence_urls column (JSON array of URLs)
ALTER TABLE violation_reports 
ADD COLUMN IF NOT EXISTS evidence_urls JSON DEFAULT NULL AFTER description;

-- Verify changes
-- DESCRIBE violation_reports;
