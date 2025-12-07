-- Migration 019: Update Trust Score System
-- New balanced formula:
-- - Completed exchanges: +2.0 (was +5.0 in TrustScoreService, but never applied in real-time)
-- - Review impacts: 5⭐:+1.5, 4⭐:+0.8, 2⭐:-0.8, 1⭐:-1.5 (was ±1.0/±0.5)
-- - Thresholds: <20 restricted, 20-59 limited, 60-79 normal, 80+ premium

-- Step 1: Update all review trust_score_impact to new scale
UPDATE reviews
SET trust_score_impact = CASE 
    WHEN rating = 5 THEN 1.5
    WHEN rating = 4 THEN 0.8
    WHEN rating = 3 THEN 0.0
    WHEN rating = 2 THEN -0.8
    WHEN rating = 1 THEN -1.5
    ELSE trust_score_impact
END;

-- Step 2: Recalculate all members' trust_score with new formula
-- Formula: 50 (base) + (completed_exchanges * 2) + SUM(review impacts)

UPDATE members m
SET trust_score = LEAST(100, GREATEST(0,
    50.0  -- Base score
    + (COALESCE(
        (SELECT COUNT(*) 
         FROM exchanges e 
         WHERE (e.member_a_id = m.member_id OR e.member_b_id = m.member_id) 
         AND e.status = 'COMPLETED'
        ), 0
    ) * 2.0)  -- +2.0 per completed exchange
    + COALESCE(
        (SELECT SUM(r.trust_score_impact) 
         FROM reviews r 
         WHERE r.reviewee_id = m.member_id
        ), 0
    )  -- Sum of review impacts (now using new ±1.5/±0.8 values)
));

-- Step 3: Verification query
SELECT 
    m.member_id,
    u.full_name,
    m.trust_score AS new_trust_score,
    (SELECT COUNT(*) 
     FROM exchanges e 
     WHERE (e.member_a_id = m.member_id OR e.member_b_id = m.member_id) 
     AND e.status = 'COMPLETED'
    ) AS completed_count,
    (SELECT COUNT(*) 
     FROM reviews r 
     WHERE r.reviewee_id = m.member_id AND r.rating >= 4
    ) AS good_reviews,
    (SELECT COUNT(*) 
     FROM reviews r 
     WHERE r.reviewee_id = m.member_id AND r.rating <= 2
    ) AS bad_reviews,
    -- Expected score calculation for verification
    (50.0 
     + (SELECT COUNT(*) * 2.0 
        FROM exchanges e 
        WHERE (e.member_a_id = m.member_id OR e.member_b_id = m.member_id) 
        AND e.status = 'COMPLETED'
       )
     + COALESCE(
        (SELECT SUM(r.trust_score_impact) 
         FROM reviews r 
         WHERE r.reviewee_id = m.member_id
        ), 0)
    ) AS expected_score
FROM members m
INNER JOIN users u ON m.user_id = u.user_id
ORDER BY m.trust_score DESC;

-- Expected results after migration:
-- - Users with no activity: 50.0
-- - Users with 1 completed exchange: 52.0 (50 + 2)
-- - Users with 5 completed exchanges: 60.0 (50 + 10)
-- - Users with 10 completed exchanges: 70.0 (50 + 20)
-- - Users with 1 five-star review: 51.5 (50 + 1.5) or 53.5 if also 1 exchange
-- - Trust score benefits:
--   * <20: Cannot create requests
--   * 20-59: Limited (max 2 pending if <20, 3 days expiry, 7 days if 20-59)
--   * 60-79: Normal (14 days expiry, no limits)
--   * 80-89: High priority (matching +0.1 bonus)
--   * 90-94: Very high priority (matching +0.15 bonus)
--   * 95-100: VIP (matching +0.2 bonus)
