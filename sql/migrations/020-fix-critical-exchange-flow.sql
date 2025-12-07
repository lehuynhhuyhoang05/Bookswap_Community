-- Migration 020: Fix Critical Exchange Flow Issues
-- 1. Books no longer locked when creating request (only when accepted)
-- 2. Auto-expire exchanges cron job prevents books locked forever

-- NO DATABASE SCHEMA CHANGES NEEDED
-- This migration documents the business logic fixes:

-- BEFORE:
-- User A creates request → Books locked to EXCHANGING immediately
-- User B rejects → Books stay EXCHANGING (BUG!)
-- Result: Books locked unnecessarily

-- AFTER:
-- User A creates request → Books remain AVAILABLE
-- User B accepts → Books locked to EXCHANGING
-- User B rejects → Books stay AVAILABLE (CORRECT!)

-- CRON JOB ADDED:
-- @Cron(EVERY_6_HOURS) handleExpiredExchanges()
-- - Finds PENDING exchanges past expires_at
-- - Auto-cancels them
-- - Releases books to AVAILABLE
-- - Applies -5.0 trust score penalty to BOTH members

-- Example: Check for orphaned EXCHANGING books (should be none after fix)
SELECT 
    b.book_id,
    b.title,
    b.status,
    b.owner_id,
    (SELECT COUNT(*) 
     FROM exchange_books eb 
     INNER JOIN exchanges e ON eb.exchange_id = e.exchange_id 
     WHERE eb.book_id = b.book_id 
     AND e.status IN ('PENDING', 'ACCEPTED')
    ) as active_exchanges
FROM books b
WHERE b.status = 'EXCHANGING'
AND b.deleted_at IS NULL
HAVING active_exchanges = 0; -- Books stuck in EXCHANGING with no active exchange

-- Clean up any orphaned books (run manually if needed):
-- UPDATE books 
-- SET status = 'AVAILABLE' 
-- WHERE book_id IN (
--   SELECT book_id FROM books WHERE status = 'EXCHANGING'
--   AND book_id NOT IN (
--     SELECT eb.book_id FROM exchange_books eb
--     INNER JOIN exchanges e ON eb.exchange_id = e.exchange_id
--     WHERE e.status IN ('PENDING', 'ACCEPTED')
--   )
-- );
