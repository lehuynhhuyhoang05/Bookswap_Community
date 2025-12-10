-- Migration: Add attachment support to messages
-- Created: 2025-12-03
-- Description: Add columns for file/image attachments in messages

ALTER TABLE messages 
ADD COLUMN attachment_url VARCHAR(500) NULL COMMENT 'URL to uploaded file/image',
ADD COLUMN attachment_type ENUM('image', 'file') NULL COMMENT 'Type of attachment',
ADD COLUMN attachment_name VARCHAR(255) NULL COMMENT 'Original filename',
ADD COLUMN attachment_size INT NULL COMMENT 'File size in bytes';

-- Add index for faster queries on messages with attachments
CREATE INDEX idx_messages_attachment ON messages(attachment_type, attachment_url);

-- ok
