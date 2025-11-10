-- Migration: Consolidate duplicate member records
-- Purpose: Merge old seed/test members into consistent member_id format
-- Run Date: 2025-11-03
-- Status: MANUAL - Review before executing!

-- ============================================================
-- STEP 1: Backup critical data (Review what will be merged)
-- ============================================================
SELECT 
    m.member_id,
    m.user_id,
    u.full_name,
    u.email,
    COUNT(b.book_id) as book_count,
    COUNT(DISTINCT er1.request_id) as requests_sent,
    COUNT(DISTINCT er2.request_id) as requests_received,
    m.completed_exchanges,
    m.trust_score
FROM members m
LEFT JOIN users u ON m.user_id = u.user_id
LEFT JOIN books b ON m.member_id = b.owner_id AND b.deleted_at IS NULL
LEFT JOIN exchange_requests er1 ON m.member_id = er1.requester_id
LEFT JOIN exchange_requests er2 ON m.member_id = er2.receiver_id
WHERE m.member_id IN ('member-002', 'member-003', 'member-004', 'member-005')
GROUP BY m.member_id, m.user_id
ORDER BY m.created_at;

-- ============================================================
-- STEP 2: Identify consolidation plan
-- ============================================================
-- Analysis:
-- member-002 (user-002) Bob Tran
--   → Books: 6 total, 10 exchanges
--   → Should merge into: test-member-bob (88a84968-25da-4a89-bfc8-71d2cb0abfb2)
--   → STRATEGY: Consolidate all to test-member-bob, keep newest member record only
--
-- member-003 (user-003) Carol Le
--   → Books: 10 total
--   → Should consolidate into appropriate test-member if exists
--   → Or keep if no duplicate
--
-- Similar for member-004, member-005

-- ============================================================
-- STEP 3: For Bob - Update books from old member-002 to test-member-bob
-- ============================================================
-- IMPORTANT: Only run if you've verified this is safe!
-- UPDATE books 
-- SET owner_id = 'test-member-bob'
-- WHERE owner_id = 'member-002' AND deleted_at IS NULL;

-- ============================================================
-- STEP 4: Update all references in exchange_requests
-- ============================================================
-- UPDATE exchange_requests
-- SET receiver_id = 'test-member-bob'
-- WHERE receiver_id = 'member-002';

-- UPDATE exchange_requests
-- SET requester_id = 'test-member-bob'
-- WHERE requester_id = 'member-002';

-- ============================================================
-- STEP 5: Update personal_libraries
-- ============================================================
-- UPDATE personal_libraries
-- SET member_id = 'test-member-bob'
-- WHERE member_id = 'member-002';

-- ============================================================
-- STEP 6: Delete old member record (after all references updated)
-- ============================================================
-- DELETE FROM members
-- WHERE member_id = 'member-002'
--   AND created_at < '2025-11-02'
--   AND user_id = 'user-002';

-- ============================================================
-- STEP 7: Verify consolidation
-- ============================================================
-- Run after migration to verify data integrity:
SELECT 'member-002 references should be 0' as check_name;
SELECT COUNT(*) as count FROM exchange_requests WHERE receiver_id = 'member-002' OR requester_id = 'member-002';
SELECT COUNT(*) as count FROM books WHERE owner_id = 'member-002';
SELECT COUNT(*) as count FROM personal_libraries WHERE member_id = 'member-002';

-- ============================================================
-- STEP 8: Verify test-member-bob has all data
-- ============================================================
SELECT 
    'test-member-bob consolidated data' as check_name,
    COUNT(DISTINCT b.book_id) as total_books,
    COUNT(DISTINCT er1.request_id) as total_sent_requests,
    COUNT(DISTINCT er2.request_id) as total_received_requests
FROM members m
LEFT JOIN books b ON m.member_id = b.owner_id
LEFT JOIN exchange_requests er1 ON m.member_id = er1.requester_id
LEFT JOIN exchange_requests er2 ON m.member_id = er2.receiver_id
WHERE m.member_id = 'test-member-bob';
