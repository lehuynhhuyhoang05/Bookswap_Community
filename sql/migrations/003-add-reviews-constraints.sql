-- 003-add-reviews-constraints.sql
-- Add indexes, unique constraints, and foreign keys to stabilize reviews and members
-- Review this file before running on production. Run in a transaction where supported.

-- 1) Ensure members.user_id is unique
ALTER TABLE `members`
  ADD CONSTRAINT `uq_members_user` UNIQUE (`user_id`);

-- 2) Add alias column to members to support legacy seed strings (optional)
ALTER TABLE `members`
  ADD COLUMN IF NOT EXISTS `alias` VARCHAR(64) NULL UNIQUE;

-- 3) Create indexes on reviews for common queries
CREATE INDEX IF NOT EXISTS `idx_reviews_reviewee` ON `reviews` (`reviewee_id`);
CREATE INDEX IF NOT EXISTS `idx_reviews_exchange` ON `reviews` (`exchange_id`);

-- 4) Prevent duplicate reviews by same reviewer on same exchange
CREATE UNIQUE INDEX IF NOT EXISTS `uq_reviews_exchange_reviewer` ON `reviews` (`exchange_id`, `reviewer_id`);

-- 5) Add FK constraints (make sure referenced tables/columns exist)
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_exchange` FOREIGN KEY (`exchange_id`) REFERENCES `exchange` (`exchange_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_reviewee` FOREIGN KEY (`reviewee_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE;

-- 6) Repair common seed typos (example: mistaken member_id)
-- WARNING: run these only if you are sure about the bad IDs. Replace with your actual bad IDs.
-- DELETE FROM members WHERE member_id = 'f8392a1a-b5a5-490a-9512-6b3f923dee41';

-- End of migration
