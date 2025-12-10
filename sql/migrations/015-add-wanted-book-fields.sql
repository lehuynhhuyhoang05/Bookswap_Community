-- Migration: Add new fields to books_wanted table for improved matching
-- Date: 2024

-- Add preferred_condition field for condition-based matching
ALTER TABLE books_wanted 
ADD COLUMN preferred_condition ENUM('LIKE_NEW', 'VERY_GOOD', 'GOOD', 'FAIR', 'POOR') NULL
COMMENT 'Preferred minimum condition of the book';

-- Add cover_image_url for display purposes
ALTER TABLE books_wanted 
ADD COLUMN cover_image_url VARCHAR(500) NULL
COMMENT 'URL to book cover image from Google Books or other sources';

-- Add language field for language-specific matching
ALTER TABLE books_wanted 
ADD COLUMN language VARCHAR(50) NULL
COMMENT 'Preferred language of the book';

-- Add publisher field for more specific matching
ALTER TABLE books_wanted 
ADD COLUMN publisher VARCHAR(255) NULL
COMMENT 'Preferred publisher of the book';

-- Create index for better query performance
CREATE INDEX idx_books_wanted_preferred_condition ON books_wanted(preferred_condition);
CREATE INDEX idx_books_wanted_language ON books_wanted(language);
