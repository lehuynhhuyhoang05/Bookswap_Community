-- Add remaining attachment columns
ALTER TABLE messages
ADD COLUMN attachment_type ENUM('image', 'file') NULL COMMENT 'Type of attachment',
ADD COLUMN attachment_name VARCHAR(255) NULL COMMENT 'Original filename',
ADD COLUMN attachment_size INT NULL COMMENT 'File size in bytes';

-- Add index for faster queries
CREATE INDEX idx_messages_attachment ON messages(attachment_type, attachment_url);
