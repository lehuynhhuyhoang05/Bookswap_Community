-- Migration 018: Fix trust_score_impact to use 0-100 scale
-- Fix review impacts to match new trust score scale (0-100)

-- Update trust_score_impact based on rating
UPDATE reviews 
SET trust_score_impact = CASE rating
    WHEN 5 THEN 1.0   -- +1 point for 5-star review
    WHEN 4 THEN 0.5   -- +0.5 point for 4-star review
    WHEN 3 THEN 0.0   -- No change for 3-star review
    WHEN 2 THEN -0.5  -- -0.5 point for 2-star review
    WHEN 1 THEN -1.0  -- -1 point for 1-star review
    ELSE 0
END;

-- Recalculate all members' trust scores based on reviews
UPDATE members m
SET trust_score = LEAST(100, GREATEST(0, 
    50 + COALESCE((
        SELECT SUM(trust_score_impact) 
        FROM reviews 
        WHERE reviewee_id = m.member_id
    ), 0)
));

-- Verification query
SELECT 
    m.member_id,
    m.trust_score,
    COUNT(r.review_id) as review_count,
    COALESCE(SUM(r.trust_score_impact), 0) as total_impact,
    (50 + COALESCE(SUM(r.trust_score_impact), 0)) as expected_score
FROM members m
LEFT JOIN reviews r ON m.member_id = r.reviewee_id
GROUP BY m.member_id, m.trust_score
HAVING m.trust_score != (50 + COALESCE(SUM(r.trust_score_impact), 0));
