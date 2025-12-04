-- =====================================================
-- CLEAN SEED DATA FOR BOOKSWAP COMMUNITY
-- Created: 2025-12-02
-- Description: Clean and complete seed data for testing all features
-- Password for all test accounts: Test@123
-- =====================================================

-- Disable foreign key checks for easier seeding
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- CLEAR EXISTING DATA (in reverse dependency order)
-- =====================================================
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
DELETE FROM audit_logs;
DELETE FROM user_activity_logs;
DELETE FROM admins;
DELETE FROM members;
DELETE FROM password_reset_tokens;
DELETE FROM email_verification_tokens;
DELETE FROM token_blacklist;
DELETE FROM users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. USERS (Password: Test@123 for all users)
-- Hash: $2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du
-- =====================================================
INSERT INTO users (user_id, email, password_hash, full_name, avatar_url, role, account_status, auth_provider, is_email_verified, email_verified_at, last_login_at, created_at) VALUES
-- Admin
('admin-001', 'admin@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Admin BookSwap', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'ADMIN', 'ACTIVE', 'LOCAL', 1, NOW(), NOW(), NOW() - INTERVAL 365 DAY),

-- Active Members
('user-001', 'alice@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Alice Nguyen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 90 DAY),
('user-002', 'bob@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Bob Tran', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 85 DAY),
('user-003', 'charlie@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Charlie Le', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 60 DAY),
('user-004', 'diana@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Diana Pham', 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 45 DAY),
('user-005', 'eric@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Eric Hoang', 'https://api.dicebear.com/7.x/avataaars/svg?seed=eric', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 30 DAY),
('user-006', 'fiona@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Fiona Vo', 'https://api.dicebear.com/7.x/avataaars/svg?seed=fiona', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NULL, NOW() - INTERVAL 15 DAY),

-- Special status users
('user-007', 'george@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'George Dang', NULL, 'MEMBER', 'LOCKED', 'LOCAL', 1, NOW(), NOW() - INTERVAL 60 DAY, NOW() - INTERVAL 100 DAY),
('user-008', 'henry@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Henry Tran', NULL, 'MEMBER', 'SUSPENDED', 'LOCAL', 1, NOW(), NOW() - INTERVAL 90 DAY, NOW() - INTERVAL 120 DAY);

-- =====================================================
-- 2. ADMINS
-- =====================================================
INSERT INTO admins (admin_id, user_id, admin_level, permissions, admin_since, created_at) VALUES
('admin-001', 'admin-001', 1, '["manage_users","manage_books","manage_exchanges","view_reports","manage_admins"]', NOW() - INTERVAL 365 DAY, NOW() - INTERVAL 365 DAY);

-- =====================================================
-- 3. MEMBERS (Profile info for each user)
-- =====================================================
INSERT INTO members (member_id, user_id, region, phone, address, bio, trust_score, average_rating, is_verified, verification_date, total_exchanges, completed_exchanges, cancelled_exchanges, created_at) VALUES
('member-001', 'user-001', 'Ho Chi Minh City', '0901234001', '123 Nguyen Hue, District 1, HCMC', 'Bookworm who loves sci-fi and fantasy novels. Always looking for new reads!', 90.00, 4.8, 1, NOW() - INTERVAL 80 DAY, 15, 12, 1, NOW() - INTERVAL 90 DAY),
('member-002', 'user-002', 'Ho Chi Minh City', '0901234002', '456 Le Loi, District 3, HCMC', 'Tech enthusiast and avid reader. Prefer programming books and non-fiction.', 76.00, 4.2, 1, NOW() - INTERVAL 75 DAY, 10, 8, 2, NOW() - INTERVAL 85 DAY),
('member-003', 'user-003', 'Hanoi', '0901234003', '789 Hoan Kiem, Hanoi', 'Literature lover from Hanoi. Looking to exchange classic novels.', 94.00, 4.9, 1, NOW() - INTERVAL 50 DAY, 20, 18, 0, NOW() - INTERVAL 60 DAY),
('member-004', 'user-004', 'Da Nang', '0901234004', '321 Bach Dang, Da Nang', 'New to book swapping! Mostly into self-help and business books.', 64.00, 3.5, 0, NULL, 5, 3, 1, NOW() - INTERVAL 45 DAY),
('member-005', 'user-005', 'Ho Chi Minh City', '0901234005', '654 Vo Van Tan, District 3, HCMC', 'Manga and light novel collector. Open to exchange!', 72.00, 4.0, 1, NOW() - INTERVAL 25 DAY, 8, 6, 1, NOW() - INTERVAL 30 DAY),
('member-006', 'user-006', 'Can Tho', '0901234006', '987 Ninh Kieu, Can Tho', 'Medical student interested in science and health books.', 50.00, 0.0, 0, NULL, 0, 0, 0, NOW() - INTERVAL 15 DAY),
('member-007', 'user-007', 'Ho Chi Minh City', '0901234007', '111 Le Van Sy, District 3, HCMC', 'Account locked for violations.', 15.00, 1.5, 0, NULL, 3, 1, 2, NOW() - INTERVAL 100 DAY),
('member-008', 'user-008', 'Hanoi', '0901234008', '222 Hang Bong, Hanoi', 'Account suspended.', 0.50, 1.0, 0, NULL, 2, 0, 2, NOW() - INTERVAL 120 DAY);

-- =====================================================
-- 4. PERSONAL LIBRARIES
-- =====================================================
INSERT INTO personal_libraries (library_id, member_id, total_owned_books, total_wanted_books, last_updated, created_at) VALUES
('lib-001', 'member-001', 5, 3, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 90 DAY),
('lib-002', 'member-002', 5, 2, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 85 DAY),
('lib-003', 'member-003', 4, 2, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 60 DAY),
('lib-004', 'member-004', 3, 2, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 45 DAY),
('lib-005', 'member-005', 4, 2, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 30 DAY),
('lib-006', 'member-006', 2, 1, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 15 DAY);

-- =====================================================
-- 5. BOOKS (Diverse collection - moderate amount)
-- =====================================================
INSERT INTO books (book_id, owner_id, title, author, isbn, publisher, publish_date, description, category, language, page_count, cover_image_url, book_condition, status, views, created_at) VALUES
-- Alice's Books (member-001) - Sci-Fi & Fantasy
('book-001', 'member-001', 'Dune', 'Frank Herbert', '9780441172719', 'Ace Books', '1965-06-01', 'A sweeping tale of politics, religion, and ecology on the desert planet Arrakis.', 'Science Fiction', 'en', 688, 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg', 'GOOD', 'AVAILABLE', 150, NOW() - INTERVAL 80 DAY),
('book-002', 'member-001', 'The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Mariner Books', '1937-09-21', 'Bilbo Baggins embarks on an unexpected journey.', 'Fantasy', 'en', 310, 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg', 'LIKE_NEW', 'AVAILABLE', 200, NOW() - INTERVAL 75 DAY),
('book-003', 'member-001', 'Foundation', 'Isaac Asimov', '9780553293357', 'Bantam Spectra', '1951-05-01', 'The Foundation series chronicles the fall of the Galactic Empire.', 'Science Fiction', 'en', 296, 'https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg', 'FAIR', 'AVAILABLE', 95, NOW() - INTERVAL 70 DAY),
('book-004', 'member-001', 'Neuromancer', 'William Gibson', '9780441569595', 'Ace Books', '1984-07-01', 'A washed-up computer hacker is hired for one last job.', 'Science Fiction', 'en', 271, 'https://covers.openlibrary.org/b/isbn/9780441569595-L.jpg', 'GOOD', 'AVAILABLE', 85, NOW() - INTERVAL 65 DAY),
('book-005', 'member-001', 'Ender Game', 'Orson Scott Card', '9780812550702', 'Tor Books', '1985-01-15', 'A young boy is trained to fight in an interstellar war.', 'Science Fiction', 'en', 324, 'https://covers.openlibrary.org/b/isbn/9780812550702-L.jpg', 'GOOD', 'AVAILABLE', 120, NOW() - INTERVAL 60 DAY),

-- Bob's Books (member-002) - Programming & Tech
('book-006', 'member-002', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Prentice Hall', '2008-08-01', 'A handbook of agile software craftsmanship.', 'Programming', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', 'GOOD', 'AVAILABLE', 320, NOW() - INTERVAL 80 DAY),
('book-007', 'member-002', 'Design Patterns', 'Gang of Four', '9780201633610', 'Addison-Wesley', '1994-10-31', 'Elements of reusable object-oriented software.', 'Programming', 'en', 395, 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg', 'FAIR', 'AVAILABLE', 180, NOW() - INTERVAL 75 DAY),
('book-008', 'member-002', 'The Pragmatic Programmer', 'David Thomas', '9780135957059', 'Addison-Wesley', '1999-10-30', 'Your journey to mastery, 20th Anniversary Edition.', 'Programming', 'en', 352, 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg', 'LIKE_NEW', 'AVAILABLE', 250, NOW() - INTERVAL 60 DAY),
('book-009', 'member-002', 'JavaScript: The Good Parts', 'Douglas Crockford', '9780596517748', 'OReilly Media', '2008-05-01', 'Unearthing the excellence in JavaScript.', 'Programming', 'en', 176, 'https://covers.openlibrary.org/b/isbn/9780596517748-L.jpg', 'GOOD', 'AVAILABLE', 145, NOW() - INTERVAL 55 DAY),
('book-010', 'member-002', 'Refactoring', 'Martin Fowler', '9780201485677', 'Addison-Wesley', '1999-07-08', 'Improving the design of existing code.', 'Programming', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9780201485677-L.jpg', 'GOOD', 'AVAILABLE', 160, NOW() - INTERVAL 50 DAY),

-- Charlie's Books (member-003) - Literature & Classics
('book-011', 'member-003', 'Truyện Kiều', 'Nguyễn Du', '9786041234567', 'NXB Văn Học', '1820-01-01', 'The Tale of Kieu - Vietnam most famous literary work.', 'Literature', 'vi', 250, NULL, 'GOOD', 'AVAILABLE', 180, NOW() - INTERVAL 55 DAY),
('book-012', 'member-003', 'Số Đỏ', 'Vũ Trọng Phụng', '9786041234568', 'NXB Văn Học', '1936-01-01', 'A satirical novel about Hanoi society.', 'Literature', 'vi', 220, NULL, 'FAIR', 'AVAILABLE', 95, NOW() - INTERVAL 50 DAY),
('book-013', 'member-003', '1984', 'George Orwell', '9780451524935', 'Signet Classics', '1949-06-08', 'A dystopian social science fiction novel.', 'Fiction', 'en', 328, 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', 'GOOD', 'AVAILABLE', 290, NOW() - INTERVAL 45 DAY),
('book-014', 'member-003', 'To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Harper Perennial', '1960-07-11', 'A gripping tale of racial injustice.', 'Fiction', 'en', 336, 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg', 'LIKE_NEW', 'AVAILABLE', 175, NOW() - INTERVAL 40 DAY),

-- Diana's Books (member-004) - Self-Help & Business
('book-015', 'member-004', 'Atomic Habits', 'James Clear', '9780735211292', 'Avery', '2018-10-16', 'Tiny changes, remarkable results.', 'Self-Help', 'en', 320, 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', 'LIKE_NEW', 'AVAILABLE', 450, NOW() - INTERVAL 40 DAY),
('book-016', 'member-004', 'Rich Dad Poor Dad', 'Robert Kiyosaki', '9781612680194', 'Plata Publishing', '1997-04-01', 'What the rich teach their kids about money.', 'Business', 'en', 336, 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg', 'GOOD', 'AVAILABLE', 380, NOW() - INTERVAL 35 DAY),
('book-017', 'member-004', 'The 7 Habits', 'Stephen Covey', '9781982137274', 'Simon Schuster', '1989-08-15', 'Powerful lessons in personal change.', 'Self-Help', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9781982137274-L.jpg', 'FAIR', 'AVAILABLE', 210, NOW() - INTERVAL 30 DAY),

-- Eric's Books (member-005) - Manga & Light Novels
('book-018', 'member-005', 'One Piece Vol 1', 'Eiichiro Oda', '9781569319017', 'Viz Media', '1997-07-22', 'The adventure begins! Monkey D. Luffy sets sail.', 'Manga', 'en', 216, 'https://covers.openlibrary.org/b/isbn/9781569319017-L.jpg', 'GOOD', 'AVAILABLE', 280, NOW() - INTERVAL 25 DAY),
('book-019', 'member-005', 'Naruto Vol 1', 'Masashi Kishimoto', '9781569319000', 'Viz Media', '1999-09-21', 'Naruto is a ninja-in-training.', 'Manga', 'en', 192, 'https://covers.openlibrary.org/b/isbn/9781569319000-L.jpg', 'LIKE_NEW', 'AVAILABLE', 310, NOW() - INTERVAL 20 DAY),
('book-020', 'member-005', 'Attack on Titan Vol 1', 'Hajime Isayama', '9781612620244', 'Kodansha Comics', '2009-09-09', 'Humanity fights for survival against Titans.', 'Manga', 'en', 194, 'https://covers.openlibrary.org/b/isbn/9781612620244-L.jpg', 'GOOD', 'AVAILABLE', 265, NOW() - INTERVAL 18 DAY),
('book-021', 'member-005', 'Sword Art Online Vol 1', 'Reki Kawahara', '9780316371247', 'Yen Press', '2009-04-10', 'Kirito must clear all 100 floors to escape.', 'Light Novel', 'en', 250, 'https://covers.openlibrary.org/b/isbn/9780316371247-L.jpg', 'GOOD', 'AVAILABLE', 190, NOW() - INTERVAL 15 DAY),

-- Fiona's Books (member-006) - Science & Health
('book-022', 'member-006', 'Sapiens', 'Yuval Noah Harari', '9780062316097', 'Harper', '2011-01-01', 'A brief history of humankind.', 'Science', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg', 'LIKE_NEW', 'AVAILABLE', 350, NOW() - INTERVAL 18 DAY),
('book-023', 'member-006', 'The Body', 'Bill Bryson', '9780385539302', 'Doubleday', '2019-10-15', 'A guide for occupants.', 'Science', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9780385539302-L.jpg', 'GOOD', 'AVAILABLE', 120, NOW() - INTERVAL 10 DAY);

-- =====================================================
-- 6. BOOKS_WANTED (Wishlist for members)
-- =====================================================
INSERT INTO books_wanted (wanted_id, library_id, title, author, isbn, category, priority, notes, added_at) VALUES
-- Alice wants programming books
('want-001', 'lib-001', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Programming', 9, 'Looking for this programming classic', NOW() - INTERVAL 30 DAY),
('want-002', 'lib-001', 'The Pragmatic Programmer', 'David Thomas', NULL, 'Programming', 8, 'Any edition is fine', NOW() - INTERVAL 25 DAY),
('want-003', 'lib-001', 'Design Patterns', 'Gang of Four', NULL, 'Programming', 7, 'Classic software book', NOW() - INTERVAL 20 DAY),

-- Bob wants sci-fi
('want-004', 'lib-002', 'Dune', 'Frank Herbert', NULL, 'Science Fiction', 9, 'Have been wanting to read this!', NOW() - INTERVAL 28 DAY),
('want-005', 'lib-002', 'Foundation', 'Isaac Asimov', NULL, 'Science Fiction', 8, 'Classic Asimov', NOW() - INTERVAL 20 DAY),

-- Charlie wants manga and modern fiction
('want-006', 'lib-003', 'One Piece Vol 1', 'Eiichiro Oda', NULL, 'Manga', 7, 'Want to start this series', NOW() - INTERVAL 15 DAY),
('want-007', 'lib-003', 'Atomic Habits', 'James Clear', NULL, 'Self-Help', 6, 'Everyone recommends this', NOW() - INTERVAL 10 DAY),

-- Diana wants classic literature
('want-008', 'lib-004', '1984', 'George Orwell', NULL, 'Fiction', 9, 'Must-read classic', NOW() - INTERVAL 12 DAY),
('want-009', 'lib-004', 'To Kill a Mockingbird', 'Harper Lee', NULL, 'Fiction', 8, 'Classic American literature', NOW() - INTERVAL 8 DAY),

-- Eric wants self-help and business
('want-010', 'lib-005', 'Atomic Habits', 'James Clear', NULL, 'Self-Help', 9, 'Want to build better habits', NOW() - INTERVAL 10 DAY),
('want-011', 'lib-005', 'Rich Dad Poor Dad', 'Robert Kiyosaki', NULL, 'Business', 7, 'Financial education', NOW() - INTERVAL 5 DAY),

-- Fiona wants fantasy
('want-012', 'lib-006', 'The Hobbit', 'J.R.R. Tolkien', NULL, 'Fantasy', 8, 'Love fantasy books', NOW() - INTERVAL 5 DAY);

-- =====================================================
-- 7. EXCHANGE REQUESTS (Various statuses for testing)
-- =====================================================
INSERT INTO exchange_requests (request_id, requester_id, receiver_id, status, message, rejection_reason, created_at, responded_at) VALUES
-- PENDING requests (ready for testing accept/reject)
('req-001', 'member-002', 'member-001', 'PENDING', 'Hi Alice! I noticed you have Dune and I have Clean Code. Would you like to exchange?', NULL, NOW() - INTERVAL 2 DAY, NULL),
('req-002', 'member-003', 'member-005', 'PENDING', 'Hey Eric! I want to start reading manga. Can we trade?', NULL, NOW() - INTERVAL 1 DAY, NULL),
('req-003', 'member-004', 'member-003', 'PENDING', 'Hi Charlie! I love classic literature. Want to exchange?', NULL, NOW() - INTERVAL 12 HOUR, NULL),

-- ACCEPTED requests (will create exchanges)
('req-004', 'member-001', 'member-003', 'ACCEPTED', 'Hi Charlie! I love Vietnamese literature. Lets exchange!', NULL, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 9 DAY),
('req-005', 'member-004', 'member-002', 'ACCEPTED', 'Hi Bob! I have business books, you have tech books. Perfect match!', NULL, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 7 DAY),
('req-006', 'member-001', 'member-005', 'ACCEPTED', 'Hey Eric! Want to trade Hobbit for Naruto?', NULL, NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 5 DAY),

-- REJECTED request
('req-007', 'member-005', 'member-001', 'REJECTED', 'Hi! Want to trade manga for sci-fi?', 'Sorry, not interested in manga right now.', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 14 DAY),

-- COMPLETED request
('req-008', 'member-001', 'member-002', 'COMPLETED', 'Completed exchange successfully', NULL, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 29 DAY),

-- CANCELLED request
('req-009', 'member-004', 'member-005', 'CANCELLED', 'Want to exchange?', NULL, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 19 DAY);

-- =====================================================
-- 8. EXCHANGE REQUEST BOOKS
-- =====================================================
INSERT INTO exchange_request_books (exchange_request_book_id, request_id, book_id, offered_by_requester, book_type, created_at) VALUES
-- Request 1: Bob offers Clean Code, wants Alice's Dune
('erb-001', 'req-001', 'book-006', 1, 'OFFERED', NOW() - INTERVAL 2 DAY),
('erb-002', 'req-001', 'book-001', 0, 'REQUESTED', NOW() - INTERVAL 2 DAY),

-- Request 2: Charlie offers 1984, wants Eric's One Piece
('erb-003', 'req-002', 'book-013', 1, 'OFFERED', NOW() - INTERVAL 1 DAY),
('erb-004', 'req-002', 'book-018', 0, 'REQUESTED', NOW() - INTERVAL 1 DAY),

-- Request 3: Diana offers Atomic Habits, wants Charlie's Truyện Kiều
('erb-005', 'req-003', 'book-015', 1, 'OFFERED', NOW() - INTERVAL 12 HOUR),
('erb-006', 'req-003', 'book-011', 0, 'REQUESTED', NOW() - INTERVAL 12 HOUR),

-- Request 4: Alice offers Foundation, wants Charlie's Số Đỏ
('erb-007', 'req-004', 'book-003', 1, 'OFFERED', NOW() - INTERVAL 10 DAY),
('erb-008', 'req-004', 'book-012', 0, 'REQUESTED', NOW() - INTERVAL 10 DAY),

-- Request 5: Diana offers Rich Dad, wants Bob's Design Patterns
('erb-009', 'req-005', 'book-016', 1, 'OFFERED', NOW() - INTERVAL 8 DAY),
('erb-010', 'req-005', 'book-007', 0, 'REQUESTED', NOW() - INTERVAL 8 DAY),

-- Request 6: Alice offers The Hobbit, wants Eric's Naruto
('erb-011', 'req-006', 'book-002', 1, 'OFFERED', NOW() - INTERVAL 6 DAY),
('erb-012', 'req-006', 'book-019', 0, 'REQUESTED', NOW() - INTERVAL 6 DAY),

-- Request 7: Eric offers SAO, wanted Alice's Ender's Game
('erb-013', 'req-007', 'book-021', 1, 'OFFERED', NOW() - INTERVAL 15 DAY),
('erb-014', 'req-007', 'book-005', 0, 'REQUESTED', NOW() - INTERVAL 15 DAY),

-- Request 8: Alice offers Neuromancer, got Bob's JS Good Parts
('erb-015', 'req-008', 'book-004', 1, 'OFFERED', NOW() - INTERVAL 30 DAY),
('erb-016', 'req-008', 'book-009', 0, 'REQUESTED', NOW() - INTERVAL 30 DAY);

-- =====================================================
-- 9. EXCHANGES (Different statuses for testing workflow)
-- =====================================================
INSERT INTO exchanges (exchange_id, request_id, member_a_id, member_b_id, status, member_a_confirmed, member_b_confirmed, confirmed_by_a_at, confirmed_by_b_at, completed_at, created_at) VALUES
-- PENDING exchange (just accepted, needs confirmation)
('exc-001', 'req-004', 'member-001', 'member-003', 'PENDING', 0, 0, NULL, NULL, NULL, NOW() - INTERVAL 9 DAY),

-- ACCEPTED exchange (one member confirmed)
('exc-002', 'req-005', 'member-004', 'member-002', 'ACCEPTED', 1, 0, NOW() - INTERVAL 6 DAY, NULL, NULL, NOW() - INTERVAL 7 DAY),

-- ACCEPTED exchange (both confirmed, ready to complete)
('exc-003', 'req-006', 'member-001', 'member-005', 'ACCEPTED', 1, 1, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 3 DAY, NULL, NOW() - INTERVAL 5 DAY),

-- COMPLETED exchange (with reviews)
('exc-004', 'req-008', 'member-001', 'member-002', 'COMPLETED', 1, 1, NOW() - INTERVAL 28 DAY, NOW() - INTERVAL 27 DAY, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 29 DAY),

-- CANCELLED exchange
('exc-005', 'req-009', 'member-004', 'member-005', 'CANCELLED', 0, 0, NULL, NULL, NULL, NOW() - INTERVAL 19 DAY);

-- =====================================================
-- 10. EXCHANGE BOOKS
-- =====================================================
INSERT INTO exchange_books (exchange_book_id, exchange_id, book_id, from_member_id, to_member_id, exchange_order, created_at) VALUES
-- Exchange 1: Alice's Foundation <-> Charlie's Số Đỏ
('exb-001', 'exc-001', 'book-003', 'member-001', 'member-003', 1, NOW() - INTERVAL 9 DAY),
('exb-002', 'exc-001', 'book-012', 'member-003', 'member-001', 2, NOW() - INTERVAL 9 DAY),

-- Exchange 2: Diana's Rich Dad <-> Bob's Design Patterns
('exb-003', 'exc-002', 'book-016', 'member-004', 'member-002', 1, NOW() - INTERVAL 7 DAY),
('exb-004', 'exc-002', 'book-007', 'member-002', 'member-004', 2, NOW() - INTERVAL 7 DAY),

-- Exchange 3: Alice's Hobbit <-> Eric's Naruto
('exb-005', 'exc-003', 'book-002', 'member-001', 'member-005', 1, NOW() - INTERVAL 5 DAY),
('exb-006', 'exc-003', 'book-019', 'member-005', 'member-001', 2, NOW() - INTERVAL 5 DAY),

-- Exchange 4: Alice's Neuromancer <-> Bob's JS Good Parts
('exb-007', 'exc-004', 'book-004', 'member-001', 'member-002', 1, NOW() - INTERVAL 29 DAY),
('exb-008', 'exc-004', 'book-009', 'member-002', 'member-001', 2, NOW() - INTERVAL 29 DAY);

-- =====================================================
-- 11. CONVERSATIONS
-- =====================================================
INSERT INTO conversations (conversation_id, exchange_request_id, member_a_id, member_b_id, total_messages, last_message_at, last_message_preview, created_at) VALUES
('conv-001', 'req-001', 'member-002', 'member-001', 2, NOW() - INTERVAL 1 DAY, 'Let me think about it...', NOW() - INTERVAL 2 DAY),
('conv-002', 'req-004', 'member-001', 'member-003', 5, NOW() - INTERVAL 8 DAY, 'Great! Looking forward to it.', NOW() - INTERVAL 9 DAY),
('conv-003', 'req-005', 'member-004', 'member-002', 4, NOW() - INTERVAL 6 DAY, 'I confirmed on my end.', NOW() - INTERVAL 7 DAY),
('conv-004', 'req-008', 'member-001', 'member-002', 3, NOW() - INTERVAL 25 DAY, 'Thanks for the exchange!', NOW() - INTERVAL 29 DAY);

-- =====================================================
-- 12. MESSAGES
-- =====================================================
INSERT INTO messages (message_id, conversation_id, sender_id, receiver_id, content, message_type, is_read, read_at, sent_at, created_at) VALUES
-- Conversation 1: Bob <-> Alice
('msg-001', 'conv-001', 'member-002', 'member-001', 'Hi Alice! I noticed you have Dune. I have Clean Code. Want to exchange?', 'TEXT', 1, NOW() - INTERVAL 2 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),
('msg-002', 'conv-001', 'member-001', 'member-002', 'Let me think about it. I will get back to you soon!', 'TEXT', 1, NOW() - INTERVAL 1 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),

-- Conversation 2: Alice <-> Charlie
('msg-003', 'conv-002', 'member-001', 'member-003', 'Hi Charlie! Thanks for accepting my request!', 'TEXT', 1, NOW() - INTERVAL 9 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 9 DAY),
('msg-004', 'conv-002', 'member-003', 'member-001', 'No problem! I love sci-fi books.', 'TEXT', 1, NOW() - INTERVAL 9 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 9 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 9 DAY + INTERVAL 1 HOUR),
('msg-005', 'conv-002', 'member-001', 'member-003', 'When can we meet?', 'TEXT', 1, NOW() - INTERVAL 8 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY),
('msg-006', 'conv-002', 'member-003', 'member-001', 'How about this weekend?', 'TEXT', 1, NOW() - INTERVAL 8 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 8 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 8 DAY + INTERVAL 1 HOUR),
('msg-007', 'conv-002', 'member-001', 'member-003', 'Great! Looking forward to it.', 'TEXT', 1, NOW() - INTERVAL 8 DAY + INTERVAL 3 HOUR, NOW() - INTERVAL 8 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 8 DAY + INTERVAL 2 HOUR),

-- Conversation 3: Diana <-> Bob
('msg-008', 'conv-003', 'member-004', 'member-002', 'Hi Bob! Ready for our exchange?', 'TEXT', 1, NOW() - INTERVAL 7 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY),
('msg-009', 'conv-003', 'member-002', 'member-004', 'Yes! Let us meet this week.', 'TEXT', 1, NOW() - INTERVAL 7 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 7 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 7 DAY + INTERVAL 1 HOUR),
('msg-010', 'conv-003', 'member-004', 'member-002', 'Sounds good!', 'TEXT', 1, NOW() - INTERVAL 6 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 6 DAY),
('msg-011', 'conv-003', 'member-004', 'member-002', 'I confirmed on my end.', 'TEXT', 1, NOW() - INTERVAL 6 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 6 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 6 DAY + INTERVAL 1 HOUR),

-- Conversation 4: Alice <-> Bob (completed exchange)
('msg-012', 'conv-004', 'member-001', 'member-002', 'Thanks for the book Bob!', 'TEXT', 1, NOW() - INTERVAL 25 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 25 DAY),
('msg-013', 'conv-004', 'member-002', 'member-001', 'You are welcome! Enjoy Neuromancer!', 'TEXT', 1, NOW() - INTERVAL 25 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 25 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 25 DAY + INTERVAL 1 HOUR),
('msg-014', 'conv-004', 'member-001', 'member-002', 'Thanks for the exchange!', 'TEXT', 1, NOW() - INTERVAL 25 DAY + INTERVAL 3 HOUR, NOW() - INTERVAL 25 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 25 DAY + INTERVAL 2 HOUR);

-- =====================================================
-- 13. MESSAGE REACTIONS
-- =====================================================
INSERT INTO message_reactions (reaction_id, message_id, member_id, emoji, created_at) VALUES
('react-001', 'msg-003', 'member-003', '👍', NOW() - INTERVAL 9 DAY + INTERVAL 1 HOUR),
('react-002', 'msg-007', 'member-003', '😊', NOW() - INTERVAL 8 DAY + INTERVAL 3 HOUR),
('react-003', 'msg-012', 'member-002', '❤️', NOW() - INTERVAL 25 DAY + INTERVAL 1 HOUR);

-- =====================================================
-- 14. REVIEWS (Post-exchange feedback)
-- =====================================================
INSERT INTO reviews (review_id, exchange_id, reviewer_id, reviewee_id, rating, comment, trust_score_impact, created_at) VALUES
-- Reviews for completed exchange 4 (Alice <-> Bob)
('rev-001', 'exc-004', 'member-001', 'member-002', 5, 'Bob was very punctual and the book was in great condition! Would trade again.', 0.25, NOW() - INTERVAL 24 DAY),
('rev-002', 'exc-004', 'member-002', 'member-001', 5, 'Alice is a wonderful trader. Neuromancer was exactly as described. Highly recommend!', 0.25, NOW() - INTERVAL 23 DAY);

-- =====================================================
-- 15. NOTIFICATIONS
-- =====================================================
INSERT INTO notifications (notification_id, member_id, notification_type, title, content, reference_type, reference_id, is_read, read_at, created_at, payload) VALUES
-- For Alice
('notif-001', 'member-001', 'EXCHANGE_REQUEST', 'New Exchange Request', 'Bob wants to exchange Clean Code for your Dune!', 'exchange_request', 'req-001', 0, NULL, NOW() - INTERVAL 2 DAY, '{"requester_name": "Bob Tran", "book_offered": "Clean Code", "book_requested": "Dune"}'),
('notif-002', 'member-001', 'BOOK_MATCH', 'New Book Match!', 'We found a match for your wanted book: Clean Code', 'book_match', 'match-001', 1, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 25 DAY, '{"book_title": "Clean Code", "owner_name": "Bob Tran"}'),
('notif-003', 'member-001', 'EXCHANGE_COMPLETED', 'Exchange Completed', 'Your exchange with Bob has been completed!', 'exchange', 'exc-004', 1, NOW() - INTERVAL 24 DAY, NOW() - INTERVAL 25 DAY, '{"exchange_partner": "Bob Tran"}'),

-- For Bob
('notif-004', 'member-002', 'EXCHANGE_ACCEPTED', 'Exchange Request Accepted', 'Diana accepted your exchange request!', 'exchange_request', 'req-005', 1, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY, '{"accepter_name": "Diana Pham"}'),
('notif-005', 'member-002', 'BOOK_MATCH', 'New Book Match!', 'Alice has Dune that you are looking for!', 'book_match', 'match-002', 1, NOW() - INTERVAL 28 DAY, NOW() - INTERVAL 28 DAY, '{"book_title": "Dune", "owner_name": "Alice Nguyen"}'),

-- For Charlie
('notif-006', 'member-003', 'EXCHANGE_REQUEST', 'New Exchange Request', 'Diana wants to exchange with you!', 'exchange_request', 'req-003', 0, NULL, NOW() - INTERVAL 12 HOUR, '{"requester_name": "Diana Pham"}'),
('notif-007', 'member-003', 'NEW_MESSAGE', 'New Message', 'Alice sent you a message', 'conversation', 'conv-002', 0, NULL, NOW() - INTERVAL 8 DAY, '{"sender_name": "Alice Nguyen", "preview": "When can we meet?"}'),

-- For Eric
('notif-008', 'member-005', 'EXCHANGE_REQUEST', 'New Exchange Request', 'Charlie wants to trade with you!', 'exchange_request', 'req-002', 0, NULL, NOW() - INTERVAL 1 DAY, '{"requester_name": "Charlie Le"}'),
('notif-009', 'member-005', 'EXCHANGE_CONFIRMATION', 'Exchange Confirmed', 'Both parties confirmed the exchange with Alice', 'exchange', 'exc-003', 1, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY, '{"exchange_partner": "Alice Nguyen"}');

-- =====================================================
-- 16. VIOLATION REPORTS
-- =====================================================
INSERT INTO violation_reports (report_id, reporter_id, reported_member_id, report_type, description, reported_item_type, reported_item_id, status, priority, resolved_by, resolution, created_at, resolved_at) VALUES
('report-001', 'member-001', 'member-007', 'NO_SHOW', 'This user did not show up to our scheduled meeting twice.', 'MEMBER', 'member-007', 'RESOLVED', 'HIGH', 'admin-001', 'User has been locked. Warning issued.', NOW() - INTERVAL 50 DAY, NOW() - INTERVAL 45 DAY),
('report-002', 'member-003', 'member-008', 'SPAM', 'User is sending spam messages about selling books instead of exchanging.', 'MESSAGE', 'msg-spam-001', 'PENDING', 'MEDIUM', NULL, NULL, NOW() - INTERVAL 3 DAY, NULL),
('report-003', 'member-002', 'member-007', 'INAPPROPRIATE_CONTENT', 'Book description contains inappropriate content.', 'BOOK', 'book-inappropriate', 'IN_REVIEW', 'HIGH', NULL, NULL, NOW() - INTERVAL 5 DAY, NULL);

-- =====================================================
-- 17. BLOCKED MEMBERS
-- =====================================================
INSERT INTO blocked_members (block_id, blocked_by_id, blocked_member_id, reason, created_at) VALUES
('block-001', 'member-001', 'member-007', 'Did not show up to scheduled meetings twice', NOW() - INTERVAL 45 DAY),
('block-002', 'member-002', 'member-007', 'Rude and unprofessional behavior', NOW() - INTERVAL 40 DAY),
('block-003', 'member-003', 'member-008', 'Spam messages', NOW() - INTERVAL 3 DAY);

-- =====================================================
-- 18. EXCHANGE SUGGESTIONS (Matching algorithm results)
-- =====================================================
INSERT INTO exchange_suggestions (suggestion_id, member_a_id, member_b_id, match_score, total_matching_books, is_viewed, viewed_at, created_at, expired_at, score_breakdown) VALUES
-- Alice <-> Bob (High match - both want each other's books)
('sugg-001', 'member-001', 'member-002', 0.850, 3, 1, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 25 DAY, 
'{"book_match": 0.35, "category_match": 0.20, "trust_score": 0.15, "rating": 0.10, "verification": 0.05, "exchange_history": 0.05}'),

-- Bob <-> Alice (Reverse suggestion)
('sugg-002', 'member-002', 'member-001', 0.850, 3, 1, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 25 DAY,
'{"book_match": 0.35, "category_match": 0.20, "trust_score": 0.15, "rating": 0.10, "verification": 0.05, "exchange_history": 0.05}'),

-- Charlie <-> Eric (Moderate match)
('sugg-003', 'member-003', 'member-005', 0.650, 2, 0, NULL, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 28 DAY,
'{"book_match": 0.25, "category_match": 0.15, "trust_score": 0.12, "rating": 0.08, "verification": 0.05, "exchange_history": 0.05}'),

-- Diana <-> Charlie (Good match)
('sugg-004', 'member-004', 'member-003', 0.720, 2, 1, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 28 DAY,
'{"book_match": 0.30, "category_match": 0.15, "trust_score": 0.10, "rating": 0.08, "verification": 0.04, "exchange_history": 0.05}');

-- =====================================================
-- 19. BOOK MATCH PAIRS (Detailed book-to-book matching)
-- =====================================================
INSERT INTO book_match_pairs (pair_id, suggestion_id, book_a_id, book_b_id, match_reason, match_score, pair_direction, created_at) VALUES
-- For suggestion 1 (Alice <-> Bob)
('pair-001', 'sugg-001', 'book-001', 'book-006', 'Alice has Dune (wanted by Bob), Bob has Clean Code (wanted by Alice)', 0.900, 'THEY_WANT_FROM_ME', NOW() - INTERVAL 5 DAY),
('pair-002', 'sugg-001', 'book-006', 'book-001', 'Bob has Clean Code (wanted by Alice), Alice has Dune (wanted by Bob)', 0.900, 'I_WANT_FROM_THEM', NOW() - INTERVAL 5 DAY),

-- For suggestion 3 (Charlie <-> Eric)
('pair-003', 'sugg-003', 'book-013', 'book-018', 'Charlie has 1984, Eric has One Piece Vol 1', 0.750, 'THEY_WANT_FROM_ME', NOW() - INTERVAL 2 DAY),
('pair-004', 'sugg-003', 'book-018', 'book-013', 'Eric has One Piece Vol 1, Charlie wants manga', 0.750, 'I_WANT_FROM_THEM', NOW() - INTERVAL 2 DAY);

-- =====================================================
-- 20. USER ACTIVITY LOGS
-- =====================================================
INSERT INTO user_activity_logs (log_id, user_id, action, entity_type, entity_id, metadata, ip_address, user_agent, created_at) VALUES
('log-001', 'user-001', 'LOGIN', NULL, NULL, '{"method": "email"}', '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL 1 DAY),
('log-002', 'user-001', 'CREATE_BOOK', 'BOOK', 'book-001', '{"title": "Dune"}', '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL 80 DAY),
('log-003', 'user-002', 'LOGIN', NULL, NULL, '{"method": "email"}', '192.168.1.101', 'Mozilla/5.0', NOW() - INTERVAL 2 DAY),
('log-004', 'user-002', 'CREATE_EXCHANGE_REQUEST', 'EXCHANGE_REQUEST', 'req-001', '{"receiver": "member-001"}', '192.168.1.101', 'Mozilla/5.0', NOW() - INTERVAL 2 DAY),
('log-005', 'user-003', 'LOGIN', NULL, NULL, '{"method": "email"}', '192.168.1.102', 'Mozilla/5.0', NOW() - INTERVAL 3 DAY);

-- =====================================================
-- 21. AUDIT LOGS (Admin actions)
-- =====================================================
INSERT INTO audit_logs (log_id, admin_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at) VALUES
('audit-001', 'admin-001', 'LOCK_USER', 'USER', 'user-007', '{"account_status": "ACTIVE"}', '{"account_status": "LOCKED"}', '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL 45 DAY),
('audit-002', 'admin-001', 'RESOLVE_REPORT', 'REPORT', 'report-001', '{"status": "PENDING"}', '{"status": "RESOLVED", "resolution": "User has been locked"}', '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL 45 DAY),
('audit-003', 'admin-001', 'SUSPEND_USER', 'USER', 'user-008', '{"account_status": "ACTIVE"}', '{"account_status": "SUSPENDED"}', '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL 90 DAY);

-- =====================================================
-- SUMMARY OF SEED DATA:
-- =====================================================
-- ✓ Users: 9 (1 admin, 6 active members, 1 locked, 1 suspended)
-- ✓ Members: 8 (with varying trust scores and exchange history)
-- ✓ Books: 23 (diverse categories: Sci-Fi, Programming, Literature, Self-Help, Manga, Science)
-- ✓ Books Wanted: 12 (demonstrating matching potential)
-- ✓ Exchange Requests: 9 (PENDING: 3, ACCEPTED: 3, REJECTED: 1, COMPLETED: 1, CANCELLED: 1)
-- ✓ Exchanges: 5 (PENDING: 1, ACCEPTED: 2, COMPLETED: 1, CANCELLED: 1)
-- ✓ Conversations: 4 (with realistic message history)
-- ✓ Messages: 14 (demonstrating chat functionality)
-- ✓ Message Reactions: 3
-- ✓ Reviews: 2 (for completed exchange)
-- ✓ Notifications: 9 (various types)
-- ✓ Violation Reports: 3 (PENDING: 1, IN_REVIEW: 1, RESOLVED: 1)
-- ✓ Blocked Members: 3
-- ✓ Exchange Suggestions: 4 (demonstrating matching algorithm)
-- ✓ Book Match Pairs: 4
-- ✓ User Activity Logs: 5
-- ✓ Audit Logs: 3
--
-- TEST ACCOUNTS (All passwords: Test@123):
-- ====================================
-- Admin:
--   admin@bookswap.com - Full admin access
--
-- Active Members:
--   alice@bookswap.com - Power user, high trust (4.50), verified
--   bob@bookswap.com - Active user, tech books (3.80), verified
--   charlie@bookswap.com - Hanoi user, highest trust (4.70), verified
--   diana@bookswap.com - New user, moderate trust (3.20), unverified
--   eric@bookswap.com - Manga collector (3.60), verified
--   fiona@bookswap.com - Brand new user (0.00), unverified
--
-- Problem Accounts:
--   george@bookswap.com - LOCKED account (1.50)
--   henry@bookswap.com - SUSPENDED account (0.50)
--
-- EXCHANGE WORKFLOW TESTING:
-- ====================================
-- exc-001 (PENDING): Alice <-> Charlie - Ready to confirm
-- exc-002 (ACCEPTED): Diana <-> Bob - One member confirmed, waiting for other
-- exc-003 (ACCEPTED): Alice <-> Eric - Both confirmed, ready to complete
-- exc-004 (COMPLETED): Alice <-> Bob - Completed with reviews
-- exc-005 (CANCELLED): Diana <-> Eric - Cancelled exchange
--
-- FEATURE TESTING SCENARIOS:
-- ====================================
-- 1. Book Matching: sugg-001 shows high match between Alice & Bob
-- 2. Exchange Requests: req-001, req-002, req-003 are PENDING (test accept/reject)
-- 3. Messaging: conv-001 has unread messages
-- 4. Notifications: Multiple unread notifications for testing
-- 5. Reports: report-002 and report-003 need admin action
-- 6. Blocking: member-007 is blocked by multiple users
-- 7. Reviews: exc-004 has reviews (test review system)
-- =====================================================

SELECT 'Clean seed data loaded successfully!' as Status,
       (SELECT COUNT(*) FROM users) as Total_Users,
       (SELECT COUNT(*) FROM members) as Total_Members,
       (SELECT COUNT(*) FROM books) as Total_Books,
       (SELECT COUNT(*) FROM exchanges) as Total_Exchanges,
       (SELECT COUNT(*) FROM notifications) as Total_Notifications;
