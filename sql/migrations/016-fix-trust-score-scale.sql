-- Migration: Fix trust score scale from 0-1 to 0-100
-- Date: 2025-12-04
-- Description: Convert all existing trust scores from 0-1 scale to 0-100 scale

-- Update all trust scores by multiplying by 100
UPDATE members 
SET trust_score = CASE 
    WHEN trust_score <= 1 THEN trust_score * 100
    ELSE trust_score  -- Already in 0-100 scale
END
WHERE trust_score IS NOT NULL;

-- Set default trust score for new members to 50 (instead of 0.5)
UPDATE members 
SET trust_score = 50.00 
WHERE trust_score = 0.00 OR trust_score IS NULL;

-- Verify the update
SELECT 
    COUNT(*) as total_members,
    MIN(trust_score) as min_score,
    MAX(trust_score) as max_score,
    AVG(trust_score) as avg_score
FROM members
WHERE trust_score IS NOT NULL;
