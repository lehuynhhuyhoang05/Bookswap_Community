-- sql/migrations/011-fix-trust-score-precision.sql
-- Fix trust_score precision to accommodate 0-100 range

ALTER TABLE members 
MODIFY COLUMN trust_score DECIMAL(5,2) DEFAULT 50.00;

-- Set default trust score for existing members
UPDATE members 
SET trust_score = 50.00 
WHERE trust_score = 0.00 OR trust_score IS NULL;
