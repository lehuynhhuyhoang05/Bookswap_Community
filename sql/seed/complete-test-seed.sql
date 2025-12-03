-- =====================================================
-- COMPLETE TEST SEED DATA FOR BOOKSWAP COMMUNITY
-- Created: 2025-12-02
-- Description: Comprehensive seed data for testing all features
-- =====================================================

-- Disable foreign key checks for easier seeding
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data (in reverse dependency order)
DELETE FROM message_reactions;
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM reviews;
DELETE FROM exchange_books;
DELETE FROM exchanges;
DELETE FROM exchange_request_books;
DELETE FROM exchange_requests;
DELETE FROM book_match_pairs;
DELETE FROM exchange_suggestions;
DELETE FROM books_wanted;
DELETE FROM books;
DELETE FROM personal_libraries;
DELETE FROM notifications;
DELETE FROM violation_reports;
DELETE FROM blocked_members;
DELETE FROM members;
DELETE FROM admins;
DELETE FROM users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. USERS (Password: Test@123 for all users)
-- =====================================================
INSERT INTO users (user_id, email, password_hash, full_name, avatar_url, role, account_status, auth_provider, is_email_verified, email_verified_at, created_at) VALUES
('user-0001-0000-0000-000000000001', 'alice@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Alice Nguyen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 90 DAY),
('user-0002-0000-0000-000000000002', 'bob@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Bob Tran', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 85 DAY),
('user-0003-0000-0000-000000000003', 'charlie@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Charlie Le', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 60 DAY),
('user-0004-0000-0000-000000000004', 'diana@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Diana Pham', 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 45 DAY),
('user-0005-0000-0000-000000000005', 'eric@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Eric Hoang', 'https://api.dicebear.com/7.x/avataaars/svg?seed=eric', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 30 DAY),
('user-0006-0000-0000-000000000006', 'fiona@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Fiona Vo', 'https://api.dicebear.com/7.x/avataaars/svg?seed=fiona', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 20 DAY),
('user-0007-0000-0000-000000000007', 'george@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'George Dang', NULL, 'MEMBER', 'SUSPENDED', 'LOCAL', 1, NOW(), NOW() - INTERVAL 100 DAY),
('user-0008-0000-0000-000000000008', 'admin@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Admin BookSwap', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'ADMIN', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 365 DAY);

-- =====================================================
-- 2. MEMBERS (Profile info for each user)
-- =====================================================
INSERT INTO members (member_id, user_id, region, phone, address, bio, trust_score, average_rating, is_verified, total_exchanges, completed_exchanges, cancelled_exchanges) VALUES
('member-001-0000-0000-000000000001', 'user-0001-0000-0000-000000000001', 'Ho Chi Minh City', '0901234001', '123 Nguyen Hue, District 1, HCMC', 'Bookworm who loves sci-fi and fantasy novels. Always looking for new reads!', 85.50, 4.8, 1, 15, 12, 1),
('member-002-0000-0000-000000000002', 'user-0002-0000-0000-000000000002', 'Ho Chi Minh City', '0901234002', '456 Le Loi, District 3, HCMC', 'Tech enthusiast and avid reader. Prefer programming books and non-fiction.', 72.00, 4.2, 1, 10, 8, 2),
('member-003-0000-0000-000000000003', 'user-0003-0000-0000-000000000003', 'Hanoi', '0901234003', '789 Hoan Kiem, Hanoi', 'Literature lover from Hanoi. Looking to exchange classic Vietnamese novels.', 90.00, 4.9, 1, 20, 18, 0),
('member-004-0000-0000-000000000004', 'user-0004-0000-0000-000000000004', 'Da Nang', '0901234004', '321 Bach Dang, Da Nang', 'New to book swapping! Mostly into self-help and business books.', 55.00, 3.5, 0, 5, 3, 1),
('member-005-0000-0000-000000000005', 'user-0005-0000-0000-000000000005', 'Ho Chi Minh City', '0901234005', '654 Vo Van Tan, District 3, HCMC', 'Manga and light novel collector. Open to exchange with fellow otaku!', 68.00, 4.0, 1, 8, 6, 1),
('member-006-0000-0000-000000000006', 'user-0006-0000-0000-000000000006', 'Can Tho', '0901234006', '987 Ninh Kieu, Can Tho', 'Medical student interested in science and health books.', 50.00, 0.0, 0, 0, 0, 0),
('member-007-0000-0000-000000000007', 'user-0007-0000-0000-000000000007', 'Ho Chi Minh City', '0901234007', '111 Le Van Sy, District 3, HCMC', 'Account suspended for violations.', 15.00, 1.5, 0, 3, 1, 2);

-- =====================================================
-- 3. ADMINS
-- =====================================================
INSERT INTO admins (admin_id, user_id, admin_level, permissions, admin_since) VALUES
('admin-001-0000-0000-000000000001', 'user-0008-0000-0000-000000000008', 1, '["manage_users","manage_books","manage_exchanges","view_reports","manage_admins"]', NOW());

-- =====================================================
-- 4. PERSONAL LIBRARIES
-- =====================================================
INSERT INTO personal_libraries (library_id, member_id, total_owned_books, total_wanted_books) VALUES
('lib-0001-0000-0000-000000000001', 'member-001-0000-0000-000000000001', 4, 2),
('lib-0002-0000-0000-000000000002', 'member-002-0000-0000-000000000002', 4, 2),
('lib-0003-0000-0000-000000000003', 'member-003-0000-0000-000000000003', 4, 1),
('lib-0004-0000-0000-000000000004', 'member-004-0000-0000-000000000004', 3, 1),
('lib-0005-0000-0000-000000000005', 'member-005-0000-0000-000000000005', 3, 1),
('lib-0006-0000-0000-000000000006', 'member-006-0000-0000-000000000006', 2, 1);

-- =====================================================
-- 5. BOOKS (Diverse collection for different members)
-- =====================================================
INSERT INTO books (book_id, owner_id, title, author, isbn, publisher, description, category, language, page_count, cover_image_url, book_condition, status, views, created_at) VALUES
-- Alice's Books (member-001) - Sci-Fi & Fantasy
('book-0001-0000-0000-000000000001', 'member-001-0000-0000-000000000001', 'Dune', 'Frank Herbert', '9780441172719', 'Ace Books', 'A sweeping tale of politics, religion, and ecology on the desert planet Arrakis.', 'Science Fiction', 'en', 688, 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg', 'GOOD', 'AVAILABLE', 150, NOW() - INTERVAL 80 DAY),
('book-0002-0000-0000-000000000002', 'member-001-0000-0000-000000000001', 'The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Mariner Books', 'Bilbo Baggins embarks on an unexpected journey with a group of dwarves.', 'Fantasy', 'en', 310, 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg', 'LIKE_NEW', 'AVAILABLE', 200, NOW() - INTERVAL 75 DAY),
('book-0003-0000-0000-000000000003', 'member-001-0000-0000-000000000001', 'Foundation', 'Isaac Asimov', '9780553293357', 'Bantam Spectra', 'The Foundation series chronicles the fall of the Galactic Empire.', 'Science Fiction', 'en', 296, 'https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg', 'FAIR', 'AVAILABLE', 95, NOW() - INTERVAL 70 DAY),
('book-0004-0000-0000-000000000004', 'member-001-0000-0000-000000000001', 'Neuromancer', 'William Gibson', '9780441569595', 'Ace Books', 'A washed-up computer hacker is hired for one last job.', 'Science Fiction', 'en', 271, 'https://covers.openlibrary.org/b/isbn/9780441569595-L.jpg', 'GOOD', 'AVAILABLE', 85, NOW() - INTERVAL 65 DAY),

-- Bob's Books (member-002) - Tech & Programming
('book-0005-0000-0000-000000000005', 'member-002-0000-0000-000000000002', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Prentice Hall', 'A handbook of agile software craftsmanship.', 'Technology', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', 'GOOD', 'AVAILABLE', 320, NOW() - INTERVAL 80 DAY),
('book-0006-0000-0000-000000000006', 'member-002-0000-0000-000000000002', 'Design Patterns', 'Gang of Four', '9780201633610', 'Addison-Wesley', 'Elements of reusable object-oriented software.', 'Technology', 'en', 395, 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg', 'FAIR', 'AVAILABLE', 180, NOW() - INTERVAL 75 DAY),
('book-0007-0000-0000-000000000007', 'member-002-0000-0000-000000000002', 'The Pragmatic Programmer', 'David Thomas', '9780135957059', 'Addison-Wesley', 'Your journey to mastery, 20th Anniversary Edition.', 'Technology', 'en', 352, 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg', 'LIKE_NEW', 'AVAILABLE', 250, NOW() - INTERVAL 60 DAY),
('book-0008-0000-0000-000000000008', 'member-002-0000-0000-000000000002', 'JavaScript The Good Parts', 'Douglas Crockford', '9780596517748', 'OReilly Media', 'Unearthing the excellence in JavaScript.', 'Technology', 'en', 176, 'https://covers.openlibrary.org/b/isbn/9780596517748-L.jpg', 'GOOD', 'AVAILABLE', 145, NOW() - INTERVAL 55 DAY),

-- Charlie's Books (member-003) - Vietnamese Literature & Classics
('book-0009-0000-0000-000000000009', 'member-003-0000-0000-000000000003', 'Truyen Kieu', 'Nguyen Du', '9786041234567', 'NXB Van Hoc', 'The Tale of Kieu - Vietnam most famous literary work.', 'Literature', 'vi', 250, NULL, 'GOOD', 'AVAILABLE', 180, NOW() - INTERVAL 55 DAY),
('book-0010-0000-0000-000000000010', 'member-003-0000-0000-000000000003', 'Number One', 'Nguyen Nhat Anh', '9786041234568', 'NXB Tre', 'A heartwarming story about friendship and growing up.', 'Fiction', 'vi', 220, NULL, 'LIKE_NEW', 'AVAILABLE', 220, NOW() - INTERVAL 50 DAY),
('book-0011-0000-0000-000000000011', 'member-003-0000-0000-000000000003', '1984', 'George Orwell', '9780451524935', 'Signet Classics', 'A dystopian social science fiction novel.', 'Fiction', 'en', 328, 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', 'GOOD', 'AVAILABLE', 290, NOW() - INTERVAL 45 DAY),
('book-0012-0000-0000-000000000012', 'member-003-0000-0000-000000000003', 'To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Harper Perennial', 'A gripping tale of racial injustice in the American South.', 'Fiction', 'en', 336, 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg', 'FAIR', 'AVAILABLE', 175, NOW() - INTERVAL 40 DAY),

-- Diana's Books (member-004) - Self-Help & Business
('book-0013-0000-0000-000000000013', 'member-004-0000-0000-000000000004', 'Atomic Habits', 'James Clear', '9780735211292', 'Avery', 'Tiny changes, remarkable results.', 'Self-Help', 'en', 320, 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', 'LIKE_NEW', 'AVAILABLE', 450, NOW() - INTERVAL 40 DAY),
('book-0014-0000-0000-000000000014', 'member-004-0000-0000-000000000004', 'Rich Dad Poor Dad', 'Robert Kiyosaki', '9781612680194', 'Plata Publishing', 'What the rich teach their kids about money.', 'Business', 'en', 336, 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg', 'GOOD', 'AVAILABLE', 380, NOW() - INTERVAL 35 DAY),
('book-0015-0000-0000-000000000015', 'member-004-0000-0000-000000000004', 'The 7 Habits', 'Stephen Covey', '9781982137274', 'Simon Schuster', 'Powerful lessons in personal change.', 'Self-Help', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9781982137274-L.jpg', 'FAIR', 'AVAILABLE', 210, NOW() - INTERVAL 30 DAY),

-- Eric's Books (member-005) - Manga & Light Novels
('book-0016-0000-0000-000000000016', 'member-005-0000-0000-000000000005', 'One Piece Vol 1', 'Eiichiro Oda', '9781569319017', 'Viz Media', 'The adventure begins! Monkey D. Luffy sets sail.', 'Manga', 'en', 216, 'https://covers.openlibrary.org/b/isbn/9781569319017-L.jpg', 'GOOD', 'AVAILABLE', 280, NOW() - INTERVAL 25 DAY),
('book-0017-0000-0000-000000000017', 'member-005-0000-0000-000000000005', 'Naruto Vol 1', 'Masashi Kishimoto', '9781569319000', 'Viz Media', 'Naruto is a ninja-in-training with a sealed demon inside him.', 'Manga', 'en', 192, 'https://covers.openlibrary.org/b/isbn/9781569319000-L.jpg', 'LIKE_NEW', 'AVAILABLE', 310, NOW() - INTERVAL 20 DAY),
('book-0018-0000-0000-000000000018', 'member-005-0000-0000-000000000005', 'Sword Art Online Vol 1', 'Reki Kawahara', '9780316371247', 'Yen Press', 'Kirito must clear all 100 floors of Aincrad to escape.', 'Light Novel', 'en', 250, 'https://covers.openlibrary.org/b/isbn/9780316371247-L.jpg', 'GOOD', 'AVAILABLE', 190, NOW() - INTERVAL 15 DAY),

-- Fiona's Books (member-006) - Science & Health
('book-0019-0000-0000-000000000019', 'member-006-0000-0000-000000000006', 'Sapiens', 'Yuval Noah Harari', '9780062316097', 'Harper', 'A brief history of humankind.', 'Science', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg', 'LIKE_NEW', 'AVAILABLE', 350, NOW() - INTERVAL 18 DAY),
('book-0020-0000-0000-000000000020', 'member-006-0000-0000-000000000006', 'The Body', 'Bill Bryson', '9780385539302', 'Doubleday', 'A guide for occupants.', 'Science', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9780385539302-L.jpg', 'GOOD', 'AVAILABLE', 120, NOW() - INTERVAL 10 DAY);

-- =====================================================
-- 6. BOOKS_WANTED (uses library_id, not member_id)
-- =====================================================
INSERT INTO books_wanted (wanted_id, library_id, title, author, isbn, category, priority, notes, added_at) VALUES
-- Alice wants tech books
('want-0001-0000-0000-000000000001', 'lib-0001-0000-0000-000000000001', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 1, 'Looking for this programming classic', NOW() - INTERVAL 30 DAY),
('want-0002-0000-0000-000000000002', 'lib-0001-0000-0000-000000000001', 'The Pragmatic Programmer', 'David Thomas', NULL, 'Technology', 2, 'Any edition is fine', NOW() - INTERVAL 25 DAY),
-- Bob wants sci-fi
('want-0003-0000-0000-000000000003', 'lib-0002-0000-0000-000000000002', 'Dune', 'Frank Herbert', NULL, 'Science Fiction', 1, 'Have been wanting to read this!', NOW() - INTERVAL 28 DAY),
('want-0004-0000-0000-000000000004', 'lib-0002-0000-0000-000000000002', 'Foundation', 'Isaac Asimov', NULL, 'Science Fiction', 2, 'Classic Asimov', NOW() - INTERVAL 20 DAY),
-- Charlie wants manga
('want-0005-0000-0000-000000000005', 'lib-0003-0000-0000-000000000003', 'One Piece Vol 1', 'Eiichiro Oda', NULL, 'Manga', 3, 'Want to start this series', NOW() - INTERVAL 15 DAY),
-- Diana wants fiction
('want-0006-0000-0000-000000000006', 'lib-0004-0000-0000-000000000004', '1984', 'George Orwell', NULL, 'Fiction', 1, 'Must-read classic', NOW() - INTERVAL 12 DAY),
-- Eric wants self-help
('want-0007-0000-0000-000000000007', 'lib-0005-0000-0000-000000000005', 'Atomic Habits', 'James Clear', NULL, 'Self-Help', 1, 'Everyone recommends this', NOW() - INTERVAL 10 DAY),
-- Fiona wants literature
('want-0008-0000-0000-000000000008', 'lib-0006-0000-0000-000000000006', 'The Hobbit', 'J.R.R. Tolkien', NULL, 'Fantasy', 2, 'Love fantasy books', NOW() - INTERVAL 5 DAY);

-- =====================================================
-- 7. EXCHANGE REQUESTS (Different statuses for testing)
-- =====================================================
INSERT INTO exchange_requests (request_id, requester_id, receiver_id, status, message, created_at, responded_at) VALUES
-- PENDING requests (ready for testing accept/reject)
('req-0001-0000-0000-000000000001', 'member-002-0000-0000-000000000002', 'member-001-0000-0000-000000000001', 'PENDING', 'Hi Alice! I noticed you have Dune and I have Clean Code. Would you like to exchange?', NOW() - INTERVAL 2 DAY, NULL),
('req-0002-0000-0000-000000000002', 'member-003-0000-0000-000000000003', 'member-005-0000-0000-000000000005', 'PENDING', 'Hey Eric! I want to start reading manga. Can we trade?', NOW() - INTERVAL 1 DAY, NULL),

-- ACCEPTED requests (will create exchanges)
('req-0003-0000-0000-000000000003', 'member-001-0000-0000-000000000001', 'member-003-0000-0000-000000000003', 'ACCEPTED', 'Hi Charlie! I love Vietnamese literature. Lets exchange!', NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 9 DAY),
('req-0004-0000-0000-000000000004', 'member-004-0000-0000-000000000004', 'member-002-0000-0000-000000000002', 'ACCEPTED', 'Hi Bob! I have business books, you have tech books. Perfect match!', NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 7 DAY),

-- REJECTED request
('req-0005-0000-0000-000000000005', 'member-005-0000-0000-000000000005', 'member-001-0000-0000-000000000001', 'REJECTED', 'Hi! Want to trade manga for sci-fi?', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 14 DAY),

-- COMPLETED requests
('req-0006-0000-0000-000000000006', 'member-001-0000-0000-000000000001', 'member-002-0000-0000-000000000002', 'COMPLETED', 'Completed exchange', NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 29 DAY),

-- Additional requests for exchanges 3,4,6,7
('req-0007-0000-0000-000000000007', 'member-001-0000-0000-000000000001', 'member-005-0000-0000-000000000005', 'ACCEPTED', 'Hey Eric! Want to trade Hobbit for Naruto?', NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 5 DAY),
('req-0008-0000-0000-000000000008', 'member-002-0000-0000-000000000002', 'member-003-0000-0000-000000000003', 'ACCEPTED', 'Hi Charlie! Pragmatic Programmer for To Kill a Mockingbird?', NOW() - INTERVAL 12 DAY, NOW() - INTERVAL 10 DAY),
('req-0009-0000-0000-000000000009', 'member-004-0000-0000-000000000004', 'member-005-0000-0000-000000000005', 'CANCELLED', 'Hi Eric! Business books for manga?', NOW() - INTERVAL 16 DAY, NOW() - INTERVAL 15 DAY),
('req-0010-0000-0000-000000000010', 'member-003-0000-0000-000000000003', 'member-006-0000-0000-000000000006', 'CANCELLED', 'Hi Fiona! Want to exchange?', NOW() - INTERVAL 22 DAY, NOW() - INTERVAL 20 DAY);

-- =====================================================
-- 8. EXCHANGE REQUEST BOOKS (Books involved in each request)
-- =====================================================
INSERT INTO exchange_request_books (exchange_request_book_id, request_id, book_id, offered_by_requester, book_type) VALUES
-- Request 1: Bob offers Clean Code, wants Alice's Dune
('erb-0001-0000-0000-000000000001', 'req-0001-0000-0000-000000000001', 'book-0005-0000-0000-000000000005', 1, 'OFFERED'),
('erb-0002-0000-0000-000000000002', 'req-0001-0000-0000-000000000001', 'book-0001-0000-0000-000000000001', 0, 'REQUESTED'),

-- Request 2: Charlie offers 1984, wants Eric's One Piece
('erb-0003-0000-0000-000000000003', 'req-0002-0000-0000-000000000002', 'book-0011-0000-0000-000000000011', 1, 'OFFERED'),
('erb-0004-0000-0000-000000000004', 'req-0002-0000-0000-000000000002', 'book-0016-0000-0000-000000000016', 0, 'REQUESTED'),

-- Request 3: Alice offers Foundation, wants Charlie's Truyen Kieu
('erb-0005-0000-0000-000000000005', 'req-0003-0000-0000-000000000003', 'book-0003-0000-0000-000000000003', 1, 'OFFERED'),
('erb-0006-0000-0000-000000000006', 'req-0003-0000-0000-000000000003', 'book-0009-0000-0000-000000000009', 0, 'REQUESTED'),

-- Request 4: Diana offers Rich Dad Poor Dad, wants Bob's Design Patterns
('erb-0007-0000-0000-000000000007', 'req-0004-0000-0000-000000000004', 'book-0014-0000-0000-000000000014', 1, 'OFFERED'),
('erb-0008-0000-0000-000000000008', 'req-0004-0000-0000-000000000004', 'book-0006-0000-0000-000000000006', 0, 'REQUESTED'),

-- Request 5 (rejected): Eric offers SAO, wanted Alice's Hobbit
('erb-0009-0000-0000-000000000009', 'req-0005-0000-0000-000000000005', 'book-0018-0000-0000-000000000018', 1, 'OFFERED'),
('erb-0010-0000-0000-000000000010', 'req-0005-0000-0000-000000000005', 'book-0002-0000-0000-000000000002', 0, 'REQUESTED'),

-- Request 6 (completed): Alice offered Neuromancer, got Bob's JS Good Parts
('erb-0011-0000-0000-000000000011', 'req-0006-0000-0000-000000000006', 'book-0004-0000-0000-000000000004', 1, 'OFFERED'),
('erb-0012-0000-0000-000000000012', 'req-0006-0000-0000-000000000006', 'book-0008-0000-0000-000000000008', 0, 'REQUESTED');

-- =====================================================
-- 9. EXCHANGES (Active and historical exchanges)
-- =====================================================
INSERT INTO exchanges (exchange_id, request_id, member_a_id, member_b_id, status, meeting_location, meeting_time, meeting_notes, meeting_latitude, meeting_longitude, meeting_confirmed_by_a, meeting_confirmed_by_b, meeting_scheduled_at, meeting_scheduled_by, member_a_confirmed, member_b_confirmed, expires_at, created_at) VALUES
-- PENDING exchange (just accepted, no meeting scheduled yet) - ready for scheduleMeeting test
('exc-0001-0000-0000-000000000001', 'req-0003-0000-0000-000000000003', 'member-001-0000-0000-000000000001', 'member-003-0000-0000-000000000003', 'PENDING', NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, 0, 0, NOW() + INTERVAL 7 DAY, NOW() - INTERVAL 9 DAY),

-- ACCEPTED exchange (has meeting location but needs confirmation)
('exc-0002-0000-0000-000000000002', 'req-0004-0000-0000-000000000004', 'member-004-0000-0000-000000000004', 'member-002-0000-0000-000000000002', 'ACCEPTED', 'Highlands Coffee, District 1', NOW() + INTERVAL 3 DAY, 'Meet at the corner table', NULL, NULL, 0, 0, NOW() - INTERVAL 6 DAY, 'member-004-0000-0000-000000000004', 0, 0, NOW() + INTERVAL 14 DAY, NOW() - INTERVAL 7 DAY),

-- MEETING_SCHEDULED exchange - ready for confirmMeeting test
('exc-0003-0000-0000-000000000003', 'req-0007-0000-0000-000000000007', 'member-001-0000-0000-000000000001', 'member-005-0000-0000-000000000005', 'MEETING_SCHEDULED', 'Fahasa Bookstore, Nguyen Hue', NOW() + INTERVAL 2 DAY, 'I will bring a blue bag', 10.773831, 106.701179, 1, 0, NOW() - INTERVAL 1 DAY, 'member-001-0000-0000-000000000001', 0, 0, NOW() + INTERVAL 10 DAY, NOW() - INTERVAL 5 DAY),

-- IN_PROGRESS exchange (both confirmed meeting) - ready for completion
('exc-0004-0000-0000-000000000004', 'req-0008-0000-0000-000000000008', 'member-002-0000-0000-000000000002', 'member-003-0000-0000-000000000003', 'IN_PROGRESS', 'The Coffee House, Ba Dinh', NOW() - INTERVAL 1 HOUR, 'Exchange happening now', 21.028511, 105.804817, 1, 1, NOW() - INTERVAL 3 DAY, 'member-003-0000-0000-000000000003', 0, 0, NOW() + INTERVAL 5 DAY, NOW() - INTERVAL 10 DAY),

-- COMPLETED exchange
('exc-0005-0000-0000-000000000005', 'req-0006-0000-0000-000000000006', 'member-001-0000-0000-000000000001', 'member-002-0000-0000-000000000002', 'COMPLETED', 'Central Library HCMC', NOW() - INTERVAL 20 DAY, 'Great exchange!', 10.776889, 106.700806, 1, 1, NOW() - INTERVAL 25 DAY, 'member-001-0000-0000-000000000001', 1, 1, NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 29 DAY),

-- CANCELLED exchange
('exc-0006-0000-0000-000000000006', 'req-0009-0000-0000-000000000009', 'member-004-0000-0000-000000000004', 'member-005-0000-0000-000000000005', 'CANCELLED', 'Phuc Long Coffee', NOW() - INTERVAL 10 DAY, 'Cancelled due to schedule conflict', NULL, NULL, 0, 0, NULL, NULL, 0, 0, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 15 DAY),

-- EXPIRED exchange
('exc-0007-0000-0000-000000000007', 'req-0010-0000-0000-000000000010', 'member-003-0000-0000-000000000003', 'member-006-0000-0000-000000000006', 'EXPIRED', NULL, NULL, 'Never scheduled meeting', NULL, NULL, 0, 0, NULL, NULL, 0, 0, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 20 DAY);

-- =====================================================
-- 10. EXCHANGE BOOKS (Books in each exchange)
-- =====================================================
INSERT INTO exchange_books (exchange_book_id, exchange_id, book_id, from_member_id, to_member_id, created_at) VALUES
-- Exchange 1: Alice's Foundation <-> Charlie's Truyen Kieu
('exb-0001-0000-0000-000000000001', 'exc-0001-0000-0000-000000000001', 'book-0003-0000-0000-000000000003', 'member-001-0000-0000-000000000001', 'member-003-0000-0000-000000000003', NOW() - INTERVAL 9 DAY),
('exb-0002-0000-0000-000000000002', 'exc-0001-0000-0000-000000000001', 'book-0009-0000-0000-000000000009', 'member-003-0000-0000-000000000003', 'member-001-0000-0000-000000000001', NOW() - INTERVAL 9 DAY),

-- Exchange 2: Diana's Rich Dad <-> Bob's Design Patterns
('exb-0003-0000-0000-000000000003', 'exc-0002-0000-0000-000000000002', 'book-0014-0000-0000-000000000014', 'member-004-0000-0000-000000000004', 'member-002-0000-0000-000000000002', NOW() - INTERVAL 7 DAY),
('exb-0004-0000-0000-000000000004', 'exc-0002-0000-0000-000000000002', 'book-0006-0000-0000-000000000006', 'member-002-0000-0000-000000000002', 'member-004-0000-0000-000000000004', NOW() - INTERVAL 7 DAY),

-- Exchange 3: Alice's Hobbit <-> Eric's Naruto
('exb-0005-0000-0000-000000000005', 'exc-0003-0000-0000-000000000003', 'book-0002-0000-0000-000000000002', 'member-001-0000-0000-000000000001', 'member-005-0000-0000-000000000005', NOW() - INTERVAL 5 DAY),
('exb-0006-0000-0000-000000000006', 'exc-0003-0000-0000-000000000003', 'book-0017-0000-0000-000000000017', 'member-005-0000-0000-000000000005', 'member-001-0000-0000-000000000001', NOW() - INTERVAL 5 DAY),

-- Exchange 4: Bob's Pragmatic Programmer <-> Charlie's To Kill a Mockingbird
('exb-0007-0000-0000-000000000007', 'exc-0004-0000-0000-000000000004', 'book-0007-0000-0000-000000000007', 'member-002-0000-0000-000000000002', 'member-003-0000-0000-000000000003', NOW() - INTERVAL 10 DAY),
('exb-0008-0000-0000-000000000008', 'exc-0004-0000-0000-000000000004', 'book-0012-0000-0000-000000000012', 'member-003-0000-0000-000000000003', 'member-002-0000-0000-000000000002', NOW() - INTERVAL 10 DAY),

-- Exchange 5 (completed): Alice's Neuromancer <-> Bob's JS Good Parts
('exb-0009-0000-0000-000000000009', 'exc-0005-0000-0000-000000000005', 'book-0004-0000-0000-000000000004', 'member-001-0000-0000-000000000001', 'member-002-0000-0000-000000000002', NOW() - INTERVAL 29 DAY),
('exb-0010-0000-0000-000000000010', 'exc-0005-0000-0000-000000000005', 'book-0008-0000-0000-000000000008', 'member-002-0000-0000-000000000002', 'member-001-0000-0000-000000000001', NOW() - INTERVAL 29 DAY);

-- =====================================================
-- 11. CONVERSATIONS (Chat between members)
-- =====================================================
INSERT INTO conversations (conversation_id, exchange_request_id, member_a_id, member_b_id, total_messages, last_message_at, last_message_preview, created_at) VALUES
('conv-0001-0000-0000-000000000001', 'req-0003-0000-0000-000000000003', 'member-001-0000-0000-000000000001', 'member-003-0000-0000-000000000003', 4, NOW() - INTERVAL 8 DAY, 'Perfect! I am in Hanoi though...', NOW() - INTERVAL 9 DAY),
('conv-0002-0000-0000-000000000002', 'req-0004-0000-0000-000000000004', 'member-004-0000-0000-000000000004', 'member-002-0000-0000-000000000002', 3, NOW() - INTERVAL 5 DAY, 'Sounds good! I will be there at 3pm.', NOW() - INTERVAL 7 DAY),
('conv-0003-0000-0000-000000000003', 'req-0007-0000-0000-000000000007', 'member-001-0000-0000-000000000001', 'member-005-0000-0000-000000000005', 3, NOW() - INTERVAL 1 DAY, 'See you there! I confirmed...', NOW() - INTERVAL 5 DAY),
('conv-0004-0000-0000-000000000004', 'req-0006-0000-0000-000000000006', 'member-001-0000-0000-000000000001', 'member-002-0000-0000-000000000002', 2, NOW() - INTERVAL 20 DAY, 'Great exchange! Thanks!', NOW() - INTERVAL 29 DAY);

-- =====================================================
-- 12. MESSAGES (Chat history)
-- =====================================================
INSERT INTO messages (message_id, conversation_id, sender_id, receiver_id, content, message_type, is_read, created_at) VALUES
-- Conversation 1: Alice <-> Charlie
('msg-0001-0000-0000-000000000001', 'conv-0001-0000-0000-000000000001', 'member-001-0000-0000-000000000001', 'member-003-0000-0000-000000000003', 'Hi Charlie! Thanks for accepting my exchange request!', 'TEXT', 1, NOW() - INTERVAL 9 DAY),
('msg-0002-0000-0000-000000000002', 'conv-0001-0000-0000-000000000001', 'member-003-0000-0000-000000000003', 'member-001-0000-0000-000000000001', 'No problem Alice! I have been wanting to read Foundation. When can we meet?', 'TEXT', 1, NOW() - INTERVAL 9 DAY + INTERVAL 30 MINUTE),
('msg-0003-0000-0000-000000000003', 'conv-0001-0000-0000-000000000001', 'member-001-0000-0000-000000000001', 'member-003-0000-0000-000000000003', 'How about this weekend at the library?', 'TEXT', 1, NOW() - INTERVAL 8 DAY),
('msg-0004-0000-0000-000000000004', 'conv-0001-0000-0000-000000000001', 'member-003-0000-0000-000000000003', 'member-001-0000-0000-000000000001', 'Perfect! I am in Hanoi though. Let me check if I have a trip to HCMC planned.', 'TEXT', 0, NOW() - INTERVAL 8 DAY + INTERVAL 2 HOUR),

-- Conversation 2: Diana <-> Bob
('msg-0005-0000-0000-000000000005', 'conv-0002-0000-0000-000000000002', 'member-004-0000-0000-000000000004', 'member-002-0000-0000-000000000002', 'Hi Bob! Ready for our exchange?', 'TEXT', 1, NOW() - INTERVAL 7 DAY),
('msg-0006-0000-0000-000000000006', 'conv-0002-0000-0000-000000000002', 'member-002-0000-0000-000000000002', 'member-004-0000-0000-000000000004', 'Yes! Let us meet at Highlands Coffee on Friday.', 'TEXT', 1, NOW() - INTERVAL 6 DAY),
('msg-0007-0000-0000-000000000007', 'conv-0002-0000-0000-000000000002', 'member-004-0000-0000-000000000004', 'member-002-0000-0000-000000000002', 'Sounds good! I will be there at 3pm.', 'TEXT', 1, NOW() - INTERVAL 5 DAY),

-- Conversation 3: Alice <-> Eric
('msg-0008-0000-0000-000000000008', 'conv-0003-0000-0000-000000000003', 'member-001-0000-0000-000000000001', 'member-005-0000-0000-000000000005', 'Hey Eric! I scheduled our meeting at Fahasa Bookstore.', 'TEXT', 1, NOW() - INTERVAL 3 DAY),
('msg-0009-0000-0000-000000000009', 'conv-0003-0000-0000-000000000003', 'member-005-0000-0000-000000000005', 'member-001-0000-0000-000000000001', 'Great! I will bring Naruto Vol 1. Looking forward to The Hobbit!', 'TEXT', 1, NOW() - INTERVAL 2 DAY),
('msg-0010-0000-0000-000000000010', 'conv-0003-0000-0000-000000000003', 'member-001-0000-0000-000000000001', 'member-005-0000-0000-000000000005', 'See you there! I confirmed the meeting on my end.', 'TEXT', 0, NOW() - INTERVAL 1 DAY),

-- Conversation 4: Alice <-> Bob (completed)
('msg-0011-0000-0000-000000000011', 'conv-0004-0000-0000-000000000004', 'member-001-0000-0000-000000000001', 'member-002-0000-0000-000000000002', 'Thanks for the book Bob!', 'TEXT', 1, NOW() - INTERVAL 20 DAY),
('msg-0012-0000-0000-000000000012', 'conv-0004-0000-0000-000000000004', 'member-002-0000-0000-000000000002', 'member-001-0000-0000-000000000001', 'Great exchange! Thanks!', 'TEXT', 1, NOW() - INTERVAL 20 DAY);

-- =====================================================
-- 13. REVIEWS (Post-exchange feedback)
-- =====================================================
INSERT INTO reviews (review_id, exchange_id, reviewer_id, reviewee_id, rating, comment, trust_score_impact, created_at) VALUES
-- Reviews for completed exchange 5 (Alice <-> Bob)
('rev-0001-0000-0000-000000000001', 'exc-0005-0000-0000-000000000005', 'member-001-0000-0000-000000000001', 'member-002-0000-0000-000000000002', 5, 'Bob was very punctual and the book was in great condition! Would trade again.', 2.50, NOW() - INTERVAL 19 DAY),
('rev-0002-0000-0000-000000000002', 'exc-0005-0000-0000-000000000005', 'member-002-0000-0000-000000000002', 'member-001-0000-0000-000000000001', 5, 'Alice is a wonderful trader. Neuromancer was exactly as described. Highly recommend!', 2.50, NOW() - INTERVAL 18 DAY);

-- =====================================================
-- 14. NOTIFICATIONS
-- =====================================================
INSERT INTO notifications (notification_id, member_id, notification_type, title, content, reference_type, reference_id, is_read, created_at) VALUES
-- For Alice
('notif-001-0000-0000-000000000001', 'member-001-0000-0000-000000000001', 'EXCHANGE_REQUEST', 'New Exchange Request', 'Bob wants to exchange Clean Code for your Dune!', 'exchange_request', 'req-0001-0000-0000-000000000001', 0, NOW() - INTERVAL 2 DAY),
('notif-002-0000-0000-000000000002', 'member-001-0000-0000-000000000001', 'BOOK_MATCH', 'New Book Match!', 'We found a match for your wanted book: Clean Code', 'book_match', 'match-001', 1, NOW() - INTERVAL 20 DAY),

-- For Bob
('notif-003-0000-0000-000000000003', 'member-002-0000-0000-000000000002', 'BOOK_MATCH', 'New Book Match!', 'Alice has Dune that you are looking for!', 'book_match', 'match-003', 1, NOW() - INTERVAL 22 DAY),
('notif-004-0000-0000-000000000004', 'member-002-0000-0000-000000000002', 'MEETING_SCHEDULED', 'Meeting Scheduled', 'Diana scheduled a meeting at Highlands Coffee', 'exchange', 'exc-0002-0000-0000-000000000002', 0, NOW() - INTERVAL 6 DAY),

-- For Eric
('notif-005-0000-0000-000000000005', 'member-005-0000-0000-000000000005', 'EXCHANGE_REQUEST', 'New Exchange Request', 'Charlie wants to trade with you!', 'exchange_request', 'req-0002-0000-0000-000000000002', 0, NOW() - INTERVAL 1 DAY),
('notif-006-0000-0000-000000000006', 'member-005-0000-0000-000000000005', 'MEETING_CONFIRMED', 'Meeting Confirmed', 'Alice confirmed the meeting at Fahasa Bookstore', 'exchange', 'exc-0003-0000-0000-000000000003', 0, NOW() - INTERVAL 1 DAY),

-- For Charlie
('notif-007-0000-0000-000000000007', 'member-003-0000-0000-000000000003', 'NEW_MESSAGE', 'New Message', 'Alice sent you a message', 'conversation', 'conv-0001-0000-0000-000000000001', 0, NOW() - INTERVAL 8 DAY);

-- =====================================================
-- 15. VIOLATION REPORTS
-- =====================================================
INSERT INTO violation_reports (report_id, reporter_id, reported_member_id, report_type, description, status, priority, created_at) VALUES
('report-01-0000-0000-000000000001', 'member-001-0000-0000-000000000001', 'member-007-0000-0000-000000000007', 'NO_SHOW', 'This user did not show up to our scheduled meeting twice.', 'RESOLVED', 'HIGH', NOW() - INTERVAL 50 DAY),
('report-02-0000-0000-000000000002', 'member-003-0000-0000-000000000003', 'member-007-0000-0000-000000000007', 'SPAM', 'Someone is sending spam messages about selling books instead of exchanging.', 'PENDING', 'MEDIUM', NOW() - INTERVAL 3 DAY);

-- =====================================================
-- 16. BLOCKED MEMBERS
-- =====================================================
INSERT INTO blocked_members (block_id, blocked_by_id, blocked_member_id, reason, created_at) VALUES
('block-01-0000-0000-000000000001', 'member-001-0000-0000-000000000001', 'member-007-0000-0000-000000000007', 'Did not show up twice', NOW() - INTERVAL 45 DAY),
('block-02-0000-0000-000000000002', 'member-002-0000-0000-000000000002', 'member-007-0000-0000-000000000007', 'Rude behavior', NOW() - INTERVAL 40 DAY);

-- =====================================================
-- SUMMARY OF TEST DATA:
-- =====================================================
-- Users: 8 (6 active members, 1 suspended, 1 admin)
-- Members: 7 (with varying trust scores and exchange counts)
-- Books: 20 (across different categories)
-- Books Wanted: 8
-- Exchange Requests: 6 (2 PENDING, 2 ACCEPTED, 1 REJECTED, 1 COMPLETED)
-- Exchanges: 7 (PENDING, ACCEPTED, MEETING_SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, EXPIRED)
-- Conversations: 4
-- Messages: 12
-- Reviews: 2
-- Notifications: 7
-- 
-- TEST ACCOUNTS (Password: Test@123):
-- alice@bookswap.com (member-001) - Power user, verified, high trust score
-- bob@bookswap.com (member-002) - Active user, tech books
-- charlie@bookswap.com (member-003) - Hanoi user, highest trust
-- diana@bookswap.com (member-004) - New user, unverified
-- eric@bookswap.com (member-005) - Manga collector
-- fiona@bookswap.com (member-006) - Brand new user, no exchanges
-- george@bookswap.com (member-007) - SUSPENDED account
-- admin@bookswap.com (ADMIN) - Admin user
--
-- EXCHANGES FOR TESTING MEETING FLOW:
-- exc-0001: PENDING - Ready to schedule meeting (Alice <-> Charlie)
-- exc-0002: ACCEPTED - Has meeting info, ready to confirm (Diana <-> Bob)
-- exc-0003: MEETING_SCHEDULED - Ready for second member to confirm (Alice <-> Eric)
-- exc-0004: IN_PROGRESS - Ready to complete (Bob <-> Charlie)
-- exc-0005: COMPLETED - Done (Alice <-> Bob)
-- exc-0006: CANCELLED - Cancelled (Diana <-> Eric)
-- exc-0007: EXPIRED - Expired (Charlie <-> Fiona)
-- =====================================================

SELECT 'Seed data loaded successfully!' as Status;
