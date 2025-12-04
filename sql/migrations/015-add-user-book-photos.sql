-- Migration 015: Add user book photos for verification
-- Description: Allow users to upload photos of their actual books for verification
-- Author: System
-- Date: 2024

-- Add user_photos JSON column to store array of photo URLs
ALTER TABLE books ADD COLUMN user_photos JSON NULL 
COMMENT 'URLs of photos taken by user showing actual book' 
AFTER cover_image_url;

-- Add condition_notes for detailed condition description
ALTER TABLE books ADD COLUMN condition_notes TEXT NULL 
COMMENT 'Description of book condition by owner' 
AFTER user_photos;

-- Update book_condition enum to add VERY_GOOD 
-- (between LIKE_NEW and GOOD for finer granularity)
ALTER TABLE books MODIFY COLUMN book_condition 
ENUM('LIKE_NEW', 'VERY_GOOD', 'GOOD', 'FAIR', 'POOR') NULL;

-- Example usage:
-- user_photos = '["https://bucket.s3.amazonaws.com/user123/book456/photo1.jpg", "https://bucket.s3.amazonaws.com/user123/book456/photo2.jpg"]'
-- condition_notes = 'Sách còn mới 90%, có một vết gấp nhỏ ở trang 50, bìa nguyên vẹn'
