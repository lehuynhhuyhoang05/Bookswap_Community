-- =============================================
-- Bookswap Seed Data (Full Logic Coverage)
-- Generated: 2025-11-21
-- Purpose: Provide comprehensive dataset for FE testing
-- =============================================
-- NOTE: Uses explicit UUIDs for stable references across environments
-- Safe to run multiple times after full reset (truncate all tables first)
-- =============================================
-- ENUM references (for clarity):
-- exchange.status: PENDING | ACCEPTED | COMPLETED | CANCELLED | EXPIRED
-- exchange.cancellation_reason: USER_CANCELLED | NO_SHOW | BOTH_NO_SHOW | DISPUTE | ADMIN_CANCELLED
-- review.rating: 1..5
-- member roles handled via users table

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------
-- Clean tables (ONLY use on local dev!)
-- ---------------------------------------------
TRUNCATE TABLE activity_logs;
TRUNCATE TABLE messages;
TRUNCATE TABLE conversations;
TRUNCATE TABLE reviews;
TRUNCATE TABLE exchanges;
TRUNCATE TABLE books;
TRUNCATE TABLE members;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------
-- Users & Members (cover trust tiers)
-- ---------------------------------------------
-- Tiers: <10 (banned), 10-19 (limited), 20-39 (medium), >=40 (vip)
-- We directly assign trust_score for FE filtering convenience (production uses auto calc)

INSERT INTO users (user_id, email, password_hash, role, is_email_verified, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'banned@test.com', '$2a$10$7dummypasswordhash1111111111111111111111111111111111111', 'MEMBER', 0, NOW()),
  ('00000000-0000-0000-0000-000000000002', 'limited@test.com', '$2a$10$7dummypasswordhash2222222222222222222222222222222222222', 'MEMBER', 1, NOW()),
  ('00000000-0000-0000-0000-000000000003', 'medium@test.com', '$2a$10$7dummypasswordhash3333333333333333333333333333333333333', 'MEMBER', 1, NOW()),
  ('00000000-0000-0000-0000-000000000004', 'vip@test.com', '$2a$10$7dummypasswordhash4444444444444444444444444444444444444', 'MEMBER', 1, NOW()),
  ('00000000-0000-0000-0000-000000000005', 'disputer@test.com', '$2a$10$7dummypasswordhash5555555555555555555555555555555555555', 'MEMBER', 1, NOW()),
  ('00000000-0000-0000-0000-000000000006', 'noshow@test.com', '$2a$10$7dummypasswordhash6666666666666666666666666666666666666', 'MEMBER', 1, NOW()),
  ('00000000-0000-0000-0000-000000000007', 'admin@test.com', '$2a$10$7dummypasswordhash7777777777777777777777777777777777777', 'ADMIN', 1, NOW());

INSERT INTO members (member_id, user_id, display_name, avatar_url, trust_score, created_at) VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'BannedUser', NULL, 5.00, NOW()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'LimitedUser', 'https://picsum.photos/seed/limited/100', 15.00, NOW()),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000003', 'MediumUser', 'https://picsum.photos/seed/medium/100', 30.00, NOW()),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000004', 'VipUser', 'https://picsum.photos/seed/vip/100', 65.00, NOW()),
  ('55555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000005', 'Disputer', 'https://picsum.photos/seed/disputer/100', 45.00, NOW()),
  ('66666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000006', 'NoShowGuy', 'https://picsum.photos/seed/noshow/100', 40.00, NOW());

-- ---------------------------------------------
-- Books (spread ownership, include variety)
-- Status: AVAILABLE | EXCHANGING | SOLD
-- ---------------------------------------------
INSERT INTO books (book_id, owner_member_id, title, author, isbn, book_condition, description, status, created_at) VALUES
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '22222222-2222-2222-2222-222222222222', 'Clean Code', 'Robert C. Martin', '9780132350884', 'GOOD', 'Classic craftsmanship book', 'AVAILABLE', NOW()),
  ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '33333333-3333-3333-3333-333333333333', 'Refactoring', 'Martin Fowler', '9780201485677', 'GOOD', 'Improving design of existing code', 'AVAILABLE', NOW()),
  ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '44444444-4444-4444-4444-444444444444', 'Design Patterns', 'GoF', '9780201633610', 'FAIR', 'Elements of reusable OO software', 'AVAILABLE', NOW()),
  ('aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '55555555-5555-5555-5555-555555555555', 'Domain-Driven Design', 'Eric Evans', '9780321125217', 'GOOD', 'Tackling complexity in the heart of software', 'AVAILABLE', NOW()),
  ('aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '66666666-6666-6666-6666-666666666666', 'The Pragmatic Programmer', 'Andrew Hunt', '9780201616224', 'GOOD', 'Journey to mastery', 'AVAILABLE', NOW()),
  ('aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6', '44444444-4444-4444-4444-444444444444', 'Clean Architecture', 'Robert C. Martin', '9780134494166', 'GOOD', 'Guide to building systems', 'EXCHANGING', NOW()),
  ('aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaa7', '22222222-2222-2222-2222-222222222222', 'Distributed Systems', 'Tanenbaum', '9780132143011', 'FAIR', 'Concepts & design', 'AVAILABLE', NOW());

-- ---------------------------------------------
-- Exchanges (cover every status/cancellation reason)
-- meeting_time, meeting_location, meeting_notes for FE UI
-- ---------------------------------------------
INSERT INTO exchanges (exchange_id, member_a_id, member_b_id, status, cancellation_reason, member_a_confirmed, member_b_confirmed, created_at, updated_at, meeting_time, meeting_location, meeting_notes) VALUES
  -- 1 COMPLETED (VipUser + MediumUser)
  ('exch0001-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'COMPLETED', NULL, 1, 1, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 9 DAY, NOW() + INTERVAL 1 DAY, 'Central Library', 'Bring both books'),
  -- 2 CANCELLED USER_CANCELLED (LimitedUser cancelled)
  ('exch0002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'CANCELLED', 'USER_CANCELLED', 0, 0, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY, NOW() + INTERVAL 2 DAY, 'Cafe District 1', 'Too busy to meet'),
  -- 3 CANCELLED NO_SHOW (NoShowGuy was no-show, VipUser reported)
  ('exch0003-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'CANCELLED', 'NO_SHOW', 1, 0, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 6 DAY, 'Co-working Space', 'Did not appear'),
  -- 4 CANCELLED BOTH_NO_SHOW (Disputer vs NoShowGuy both absent)
  ('exch0004-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'CANCELLED', 'BOTH_NO_SHOW', 0, 0, NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 5 DAY, 'Metro Station', 'None came'),
  -- 5 CANCELLED DISPUTE (VipUser vs Disputer) pending admin review
  ('exch0005-0000-0000-0000-000000000005', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 'CANCELLED', 'DISPUTE', 1, 1, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY, 'Bookstore District 3', 'Disagreement about book condition'),
  -- 6 EXPIRED (MediumUser failed to confirm, LimitedUser confirmed)
  ('exch0006-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'EXPIRED', NULL, 0, 1, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 1 DAY, 'Online meet', 'MediumUser never confirmed'),
  -- 7 PENDING (VipUser offered book to LimitedUser, awaiting response)
  ('exch0007-0000-0000-0000-000000000007', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'PENDING', NULL, 0, 0, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 2 DAY, 'City Park', 'Awaiting acceptance');

-- Link exchange <-> books (pivot table assumed: exchange_books)
-- If schema differs, adjust accordingly
-- role: OFFERED / REQUESTED
INSERT INTO exchange_books (exchange_book_id, exchange_id, book_id, role) VALUES
  ('ebk00001-0000-0000-0000-000000000001', 'exch0001-0000-0000-0000-000000000001', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'OFFERED'),
  ('ebk00002-0000-0000-0000-000000000002', 'exch0001-0000-0000-0000-000000000001', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'REQUESTED'),
  ('ebk00003-0000-0000-0000-000000000003', 'exch0002-0000-0000-0000-000000000002', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'OFFERED'),
  ('ebk00004-0000-0000-0000-000000000004', 'exch0002-0000-0000-0000-000000000002', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'REQUESTED'),
  ('ebk00005-0000-0000-0000-000000000005', 'exch0003-0000-0000-0000-000000000003', 'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'OFFERED'),
  ('ebk00006-0000-0000-0000-000000000006', 'exch0003-0000-0000-0000-000000000003', 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'REQUESTED'),
  ('ebk00007-0000-0000-0000-000000000007', 'exch0004-0000-0000-0000-000000000004', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'OFFERED'),
  ('ebk00008-0000-0000-0000-000000000008', 'exch0004-0000-0000-0000-000000000004', 'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'REQUESTED'),
  ('ebk00009-0000-0000-0000-000000000009', 'exch0005-0000-0000-0000-000000000005', 'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'OFFERED'),
  ('ebk00010-0000-0000-0000-000000000010', 'exch0005-0000-0000-0000-000000000005', 'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'REQUESTED'),
  ('ebk00011-0000-0000-0000-000000000011', 'exch0006-0000-0000-0000-000000000006', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'OFFERED'),
  ('ebk00012-0000-0000-0000-000000000012', 'exch0006-0000-0000-0000-000000000006', 'aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'REQUESTED'),
  ('ebk00013-0000-0000-0000-000000000013', 'exch0007-0000-0000-0000-000000000007', 'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'OFFERED'),
  ('ebk00014-0000-0000-0000-000000000014', 'exch0007-0000-0000-0000-000000000007', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'REQUESTED');

-- ---------------------------------------------
-- Reviews (good/bad distribution for trust score UI)
-- ---------------------------------------------
INSERT INTO reviews (review_id, exchange_id, reviewer_member_id, target_member_id, rating, comment, created_at) VALUES
  ('rev00001-0000-0000-0000-000000000001', 'exch0001-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 5, 'Great exchange, smooth process!', NOW() - INTERVAL 9 DAY),
  ('rev00002-0000-0000-0000-000000000002', 'exch0001-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 4, 'Book as described.', NOW() - INTERVAL 9 DAY),
  ('rev00003-0000-0000-0000-000000000003', 'exch0005-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', '44444444-4444-4444-4444-444444444444', 2, 'Dispute about quality.', NOW() - INTERVAL 3 DAY),
  ('rev00004-0000-0000-0000-000000000004', 'exch0005-0000-0000-0000-000000000005', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 1, 'Condition not as stated.', NOW() - INTERVAL 3 DAY);

-- ---------------------------------------------
-- Conversations & Messages (single vs multi message thread)
-- ---------------------------------------------
INSERT INTO conversations (conversation_id, member_a_id, member_b_id, created_at, updated_at) VALUES
  ('conv0001-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),
  ('conv0002-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY);

INSERT INTO messages (message_id, conversation_id, sender_member_id, content, created_at) VALUES
  ('msg00001-0000-0000-0000-000000000001', 'conv0001-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'Hi, interested in your Clean Code book!', NOW() - INTERVAL 1 DAY),
  ('msg00002-0000-0000-0000-000000000002', 'conv0001-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Sure, would you trade Design Patterns?', NOW() - INTERVAL 1 DAY),
  ('msg00003-0000-0000-0000-000000000003', 'conv0002-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'You missed the meeting yesterday.', NOW() - INTERVAL 7 DAY),
  ('msg00004-0000-0000-0000-000000000004', 'conv0002-0000-0000-0000-000000000002', '66666666-6666-6666-6666-666666666666', 'Sorry, something came up.', NOW() - INTERVAL 7 DAY);

-- ---------------------------------------------
-- Activity Logs (basic samples)
-- ---------------------------------------------
INSERT INTO activity_logs (activity_log_id, member_id, action, metadata, created_at) VALUES
  ('act00001-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'EXCHANGE_COMPLETED', '{"exchange_id":"exch0001-0000-0000-0000-000000000001"}', NOW() - INTERVAL 9 DAY),
  ('act00002-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'EXCHANGE_CANCELLED', '{"exchange_id":"exch0002-0000-0000-0000-000000000002","reason":"USER_CANCELLED"}', NOW() - INTERVAL 8 DAY),
  ('act00003-0000-0000-0000-000000000003', '66666666-6666-6666-6666-666666666666', 'EXCHANGE_CANCELLED', '{"exchange_id":"exch0003-0000-0000-0000-000000000003","reason":"NO_SHOW"}', NOW() - INTERVAL 7 DAY),
  ('act00004-0000-0000-0000-000000000004', '55555555-5555-5555-5555-555555555555', 'EXCHANGE_CANCELLED', '{"exchange_id":"exch0005-0000-0000-0000-000000000005","reason":"DISPUTE"}', NOW() - INTERVAL 3 DAY);

-- =============================================
-- Done
-- =============================================
