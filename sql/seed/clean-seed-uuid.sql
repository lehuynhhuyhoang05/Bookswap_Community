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
('7ae40e6f-42b1-4138-ae75-97fc20a045ac', 'admin@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Admin BookSwap', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'ADMIN', 'ACTIVE', 'LOCAL', 1, NOW(), NOW(), NOW() - INTERVAL 365 DAY),

-- Active Members
('318eb680-40e7-4699-94ed-7dd373f72365', 'alice@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Alice Nguyen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 90 DAY),
('d37d47ad-2a43-4ac4-81cb-6b2d42a40b6c', 'bob@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Bob Tran', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 85 DAY),
('09f8489e-59a2-4f35-8b9c-c4a5f9cfccee', 'charlie@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Charlie Le', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 60 DAY),
('64d6556e-4f71-43a4-bf05-aef579dc2f6d', 'diana@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Diana Pham', 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 45 DAY),
('f6ad66d7-6908-49cc-809e-6358182fda48', 'eric@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Eric Hoang', 'https://api.dicebear.com/7.x/avataaars/svg?seed=eric', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 30 DAY),
('20ce1d4e-0a5a-4334-b158-b226edae178f', 'fiona@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Fiona Vo', 'https://api.dicebear.com/7.x/avataaars/svg?seed=fiona', 'MEMBER', 'ACTIVE', 'LOCAL', 1, NOW(), NULL, NOW() - INTERVAL 15 DAY),

-- Special status users
('3c99df30-f73b-4908-a20f-a487de531e47', 'george@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'George Dang', NULL, 'MEMBER', 'LOCKED', 'LOCAL', 1, NOW(), NOW() - INTERVAL 60 DAY, NOW() - INTERVAL 100 DAY),
('30f5be1a-5034-476c-8bde-34aa14c40485', 'henry@bookswap.com', '$2b$10$yULSNUUEV/IAQGynEudMMu7AsdqgnfmR6Pz/hBB5xk9WR6A3ml3du', 'Henry Tran', NULL, 'MEMBER', 'SUSPENDED', 'LOCAL', 1, NOW(), NOW() - INTERVAL 90 DAY, NOW() - INTERVAL 120 DAY);

-- =====================================================
-- 2. ADMINS
-- =====================================================
INSERT INTO admins (admin_id, user_id, admin_level, permissions, admin_since, created_at) VALUES
('7ae40e6f-42b1-4138-ae75-97fc20a045ac', '7ae40e6f-42b1-4138-ae75-97fc20a045ac', 1, '["manage_users","manage_books","manage_exchanges","view_reports","manage_admins"]', NOW() - INTERVAL 365 DAY, NOW() - INTERVAL 365 DAY);

-- =====================================================
-- 3. MEMBERS (Profile info for each user)
-- =====================================================
INSERT INTO members (member_id, user_id, region, phone, address, bio, trust_score, average_rating, is_verified, verification_date, total_exchanges, completed_exchanges, cancelled_exchanges, created_at) VALUES
('97b26714-4179-4155-82d0-3f691543fd3d', '318eb680-40e7-4699-94ed-7dd373f72365', 'Ho Chi Minh City', '0901234001', '123 Nguyen Hue, District 1, HCMC', 'Bookworm who loves sci-fi and fantasy novels. Always looking for new reads!', 4.50, 4.8, 1, NOW() - INTERVAL 80 DAY, 15, 12, 1, NOW() - INTERVAL 90 DAY),
('4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'd37d47ad-2a43-4ac4-81cb-6b2d42a40b6c', 'Ho Chi Minh City', '0901234002', '456 Le Loi, District 3, HCMC', 'Tech enthusiast and avid reader. Prefer programming books and non-fiction.', 3.80, 4.2, 1, NOW() - INTERVAL 75 DAY, 10, 8, 2, NOW() - INTERVAL 85 DAY),
('bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', '09f8489e-59a2-4f35-8b9c-c4a5f9cfccee', 'Hanoi', '0901234003', '789 Hoan Kiem, Hanoi', 'Literature lover from Hanoi. Looking to exchange classic novels.', 4.70, 4.9, 1, NOW() - INTERVAL 50 DAY, 20, 18, 0, NOW() - INTERVAL 60 DAY),
('35769922-58dd-4222-90a1-a52902366d4a', '64d6556e-4f71-43a4-bf05-aef579dc2f6d', 'Da Nang', '0901234004', '321 Bach Dang, Da Nang', 'New to book swapping! Mostly into self-help and business books.', 3.20, 3.5, 0, NULL, 5, 3, 1, NOW() - INTERVAL 45 DAY),
('6a5a795b-054f-4559-892f-d1dbeeb44af3', 'f6ad66d7-6908-49cc-809e-6358182fda48', 'Ho Chi Minh City', '0901234005', '654 Vo Van Tan, District 3, HCMC', 'Manga and light novel collector. Open to exchange!', 3.60, 4.0, 1, NOW() - INTERVAL 25 DAY, 8, 6, 1, NOW() - INTERVAL 30 DAY),
('1eb76f90-147c-4f6b-8a3f-ac517ce68fd3', '20ce1d4e-0a5a-4334-b158-b226edae178f', 'Can Tho', '0901234006', '987 Ninh Kieu, Can Tho', 'Medical student interested in science and health books.', 0.00, 0.0, 0, NULL, 0, 0, 0, NOW() - INTERVAL 15 DAY),
('70eff64f-528f-41c1-a985-e8ad5da2db3a', '3c99df30-f73b-4908-a20f-a487de531e47', 'Ho Chi Minh City', '0901234007', '111 Le Van Sy, District 3, HCMC', 'Account locked for violations.', 1.50, 1.5, 0, NULL, 3, 1, 2, NOW() - INTERVAL 100 DAY),
('1770dc6b-8d3e-4724-86a2-9a00f7b3b7fc', '30f5be1a-5034-476c-8bde-34aa14c40485', 'Hanoi', '0901234008', '222 Hang Bong, Hanoi', 'Account suspended.', 0.50, 1.0, 0, NULL, 2, 0, 2, NOW() - INTERVAL 120 DAY);

-- =====================================================
-- 4. PERSONAL LIBRARIES
-- =====================================================
INSERT INTO personal_libraries (library_id, member_id, total_owned_books, total_wanted_books, last_updated, created_at) VALUES
('8abfb56e-f0e0-432f-9a4a-76dc905defca', '97b26714-4179-4155-82d0-3f691543fd3d', 5, 3, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 90 DAY),
('44ae7e79-2357-4eab-a327-0edf2a1954e0', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 5, 2, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 85 DAY),
('30c263b0-2600-4cc0-b5df-3cf9c017049f', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 4, 2, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 60 DAY),
('4a5e5d58-c839-42be-8e6c-43aef31234c7', '35769922-58dd-4222-90a1-a52902366d4a', 3, 2, NOW() - INTERVAL 5 DAY, NOW() - INTERVAL 45 DAY),
('d813814c-42cc-4b38-af9b-c42c192ff8ac', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 4, 2, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 30 DAY),
('dac03365-1ba5-42cc-a0d5-053c624004b1', '1eb76f90-147c-4f6b-8a3f-ac517ce68fd3', 2, 1, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 15 DAY);

-- =====================================================
-- 5. BOOKS (Diverse collection - moderate amount)
-- =====================================================
INSERT INTO books (book_id, owner_id, title, author, isbn, publisher, publish_date, description, category, language, page_count, cover_image_url, book_condition, status, views, created_at) VALUES
-- Alice's Books (member-001) - Sci-Fi & Fantasy
('92e48c32-f268-40d1-9dfe-0ff43f1aa3b3', '97b26714-4179-4155-82d0-3f691543fd3d', 'Dune', 'Frank Herbert', '9780441172719', 'Ace Books', '1965-06-01', 'A sweeping tale of politics, religion, and ecology on the desert planet Arrakis.', 'Science Fiction', 'en', 688, 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg', 'GOOD', 'AVAILABLE', 150, NOW() - INTERVAL 80 DAY),
('29af9223-55cf-4955-b139-6a11dfa9efde', '97b26714-4179-4155-82d0-3f691543fd3d', 'The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Mariner Books', '1937-09-21', 'Bilbo Baggins embarks on an unexpected journey.', 'Fantasy', 'en', 310, 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg', 'LIKE_NEW', 'AVAILABLE', 200, NOW() - INTERVAL 75 DAY),
('93102070-b5bc-4288-9239-ee0dd31baf41', '97b26714-4179-4155-82d0-3f691543fd3d', 'Foundation', 'Isaac Asimov', '9780553293357', 'Bantam Spectra', '1951-05-01', 'The Foundation series chronicles the fall of the Galactic Empire.', 'Science Fiction', 'en', 296, 'https://covers.openlibrary.org/b/isbn/9780553293357-L.jpg', 'FAIR', 'AVAILABLE', 95, NOW() - INTERVAL 70 DAY),
('b007c7d6-b756-4244-90d5-dfe0d0a37b85', '97b26714-4179-4155-82d0-3f691543fd3d', 'Neuromancer', 'William Gibson', '9780441569595', 'Ace Books', '1984-07-01', 'A washed-up computer hacker is hired for one last job.', 'Science Fiction', 'en', 271, 'https://covers.openlibrary.org/b/isbn/9780441569595-L.jpg', 'GOOD', 'AVAILABLE', 85, NOW() - INTERVAL 65 DAY),
('4a5e6451-e704-4d69-9c51-933f7adef764', '97b26714-4179-4155-82d0-3f691543fd3d', 'Ender Game', 'Orson Scott Card', '9780812550702', 'Tor Books', '1985-01-15', 'A young boy is trained to fight in an interstellar war.', 'Science Fiction', 'en', 324, 'https://covers.openlibrary.org/b/isbn/9780812550702-L.jpg', 'GOOD', 'AVAILABLE', 120, NOW() - INTERVAL 60 DAY),

-- Bob's Books (member-002) - Programming & Tech
('7f9d41f0-1b3e-412c-80b7-3b00ae3d1f39', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Prentice Hall', '2008-08-01', 'A handbook of agile software craftsmanship.', 'Programming', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg', 'GOOD', 'AVAILABLE', 320, NOW() - INTERVAL 80 DAY),
('0f718b52-ee26-47b8-9a39-5480fb6adfd2', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'Design Patterns', 'Gang of Four', '9780201633610', 'Addison-Wesley', '1994-10-31', 'Elements of reusable object-oriented software.', 'Programming', 'en', 395, 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg', 'FAIR', 'AVAILABLE', 180, NOW() - INTERVAL 75 DAY),
('f9bb0db8-02d5-40cb-866b-e99320eef81f', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'The Pragmatic Programmer', 'David Thomas', '9780135957059', 'Addison-Wesley', '1999-10-30', 'Your journey to mastery, 20th Anniversary Edition.', 'Programming', 'en', 352, 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg', 'LIKE_NEW', 'AVAILABLE', 250, NOW() - INTERVAL 60 DAY),
('2b82b1ec-46bd-49b2-acbc-82885a8a60c6', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'JavaScript: The Good Parts', 'Douglas Crockford', '9780596517748', 'OReilly Media', '2008-05-01', 'Unearthing the excellence in JavaScript.', 'Programming', 'en', 176, 'https://covers.openlibrary.org/b/isbn/9780596517748-L.jpg', 'GOOD', 'AVAILABLE', 145, NOW() - INTERVAL 55 DAY),
('7c3fc8c3-6e1f-434b-9c05-462fc750842b', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'Refactoring', 'Martin Fowler', '9780201485677', 'Addison-Wesley', '1999-07-08', 'Improving the design of existing code.', 'Programming', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9780201485677-L.jpg', 'GOOD', 'AVAILABLE', 160, NOW() - INTERVAL 50 DAY),

-- Charlie's Books (member-003) - Literature & Classics
('7f2d16fc-e2a3-40cf-a74a-47bef74c254c', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 'Truyện Kiều', 'Nguyễn Du', '9786041234567', 'NXB Văn Học', '1820-01-01', 'The Tale of Kieu - Vietnam most famous literary work.', 'Literature', 'vi', 250, NULL, 'GOOD', 'AVAILABLE', 180, NOW() - INTERVAL 55 DAY),
('9a8b6c3e-4959-402f-bd28-3c651d143381', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 'Số Đỏ', 'Vũ Trọng Phụng', '9786041234568', 'NXB Văn Học', '1936-01-01', 'A satirical novel about Hanoi society.', 'Literature', 'vi', 220, NULL, 'FAIR', 'AVAILABLE', 95, NOW() - INTERVAL 50 DAY),
('8698680c-e56d-42f4-9f23-39379c225cc9', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', '1984', 'George Orwell', '9780451524935', 'Signet Classics', '1949-06-08', 'A dystopian social science fiction novel.', 'Fiction', 'en', 328, 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', 'GOOD', 'AVAILABLE', 290, NOW() - INTERVAL 45 DAY),
('18aa5b66-030a-4e42-be49-1aa575d8ea16', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 'To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Harper Perennial', '1960-07-11', 'A gripping tale of racial injustice.', 'Fiction', 'en', 336, 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg', 'LIKE_NEW', 'AVAILABLE', 175, NOW() - INTERVAL 40 DAY),

-- Diana's Books (member-004) - Self-Help & Business
('096532ae-7930-49a6-aeb1-2e9c83e99a1d', '35769922-58dd-4222-90a1-a52902366d4a', 'Atomic Habits', 'James Clear', '9780735211292', 'Avery', '2018-10-16', 'Tiny changes, remarkable results.', 'Self-Help', 'en', 320, 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', 'LIKE_NEW', 'AVAILABLE', 450, NOW() - INTERVAL 40 DAY),
('c2696993-7c3f-4f45-9fdd-88d8f83c52e1', '35769922-58dd-4222-90a1-a52902366d4a', 'Rich Dad Poor Dad', 'Robert Kiyosaki', '9781612680194', 'Plata Publishing', '1997-04-01', 'What the rich teach their kids about money.', 'Business', 'en', 336, 'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg', 'GOOD', 'AVAILABLE', 380, NOW() - INTERVAL 35 DAY),
('f3657667-3b27-4d25-ad4e-9e5bab76d4d3', '35769922-58dd-4222-90a1-a52902366d4a', 'The 7 Habits', 'Stephen Covey', '9781982137274', 'Simon Schuster', '1989-08-15', 'Powerful lessons in personal change.', 'Self-Help', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9781982137274-L.jpg', 'FAIR', 'AVAILABLE', 210, NOW() - INTERVAL 30 DAY),

-- Eric's Books (member-005) - Manga & Light Novels
('46c1f721-ce07-4685-bd6c-0b7fb22f6677', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 'One Piece Vol 1', 'Eiichiro Oda', '9781569319017', 'Viz Media', '1997-07-22', 'The adventure begins! Monkey D. Luffy sets sail.', 'Manga', 'en', 216, 'https://covers.openlibrary.org/b/isbn/9781569319017-L.jpg', 'GOOD', 'AVAILABLE', 280, NOW() - INTERVAL 25 DAY),
('57913869-71d7-4855-b417-7c1990cd0a4e', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 'Naruto Vol 1', 'Masashi Kishimoto', '9781569319000', 'Viz Media', '1999-09-21', 'Naruto is a ninja-in-training.', 'Manga', 'en', 192, 'https://covers.openlibrary.org/b/isbn/9781569319000-L.jpg', 'LIKE_NEW', 'AVAILABLE', 310, NOW() - INTERVAL 20 DAY),
('b07dc083-0e7f-4c23-b706-096d53bc338d', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 'Attack on Titan Vol 1', 'Hajime Isayama', '9781612620244', 'Kodansha Comics', '2009-09-09', 'Humanity fights for survival against Titans.', 'Manga', 'en', 194, 'https://covers.openlibrary.org/b/isbn/9781612620244-L.jpg', 'GOOD', 'AVAILABLE', 265, NOW() - INTERVAL 18 DAY),
('3b0cf9c4-5dad-48b5-8203-c2e0b6e2e782', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 'Sword Art Online Vol 1', 'Reki Kawahara', '9780316371247', 'Yen Press', '2009-04-10', 'Kirito must clear all 100 floors to escape.', 'Light Novel', 'en', 250, 'https://covers.openlibrary.org/b/isbn/9780316371247-L.jpg', 'GOOD', 'AVAILABLE', 190, NOW() - INTERVAL 15 DAY),

-- Fiona's Books (member-006) - Science & Health
('28863e3f-ac43-41b8-867b-bf5672311500', '1eb76f90-147c-4f6b-8a3f-ac517ce68fd3', 'Sapiens', 'Yuval Noah Harari', '9780062316097', 'Harper', '2011-01-01', 'A brief history of humankind.', 'Science', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg', 'LIKE_NEW', 'AVAILABLE', 350, NOW() - INTERVAL 18 DAY),
('db43fcf8-36e1-4dd7-b247-d0e6145011ba', '1eb76f90-147c-4f6b-8a3f-ac517ce68fd3', 'The Body', 'Bill Bryson', '9780385539302', 'Doubleday', '2019-10-15', 'A guide for occupants.', 'Science', 'en', 464, 'https://covers.openlibrary.org/b/isbn/9780385539302-L.jpg', 'GOOD', 'AVAILABLE', 120, NOW() - INTERVAL 10 DAY);

-- =====================================================
-- 6. BOOKS_WANTED (Wishlist for members)
-- =====================================================
INSERT INTO books_wanted (wanted_id, library_id, title, author, isbn, category, priority, notes, added_at) VALUES
-- Alice wants programming books
('914e728a-81b2-4665-8f39-12e2530fdac8', '8abfb56e-f0e0-432f-9a4a-76dc905defca', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Programming', 9, 'Looking for this programming classic', NOW() - INTERVAL 30 DAY),
('6eac5088-2cc4-4055-99d3-8513907b8fd3', '8abfb56e-f0e0-432f-9a4a-76dc905defca', 'The Pragmatic Programmer', 'David Thomas', NULL, 'Programming', 8, 'Any edition is fine', NOW() - INTERVAL 25 DAY),
('5703902f-ebe8-4c23-a584-26553f07eaaf', '8abfb56e-f0e0-432f-9a4a-76dc905defca', 'Design Patterns', 'Gang of Four', NULL, 'Programming', 7, 'Classic software book', NOW() - INTERVAL 20 DAY),

-- Bob wants sci-fi
('6027c877-84a7-4082-be7c-dbdda20f61b4', '44ae7e79-2357-4eab-a327-0edf2a1954e0', 'Dune', 'Frank Herbert', NULL, 'Science Fiction', 9, 'Have been wanting to read this!', NOW() - INTERVAL 28 DAY),
('73f2c2af-94cf-4889-ab86-64832ef6f340', '44ae7e79-2357-4eab-a327-0edf2a1954e0', 'Foundation', 'Isaac Asimov', NULL, 'Science Fiction', 8, 'Classic Asimov', NOW() - INTERVAL 20 DAY),

-- Charlie wants manga and modern fiction
('a3cf8fab-653c-48e1-a976-9a1067661b6a', '30c263b0-2600-4cc0-b5df-3cf9c017049f', 'One Piece Vol 1', 'Eiichiro Oda', NULL, 'Manga', 7, 'Want to start this series', NOW() - INTERVAL 15 DAY),
('34fc228d-4197-49b4-aff0-25f5fc3fdf74', '30c263b0-2600-4cc0-b5df-3cf9c017049f', 'Atomic Habits', 'James Clear', NULL, 'Self-Help', 6, 'Everyone recommends this', NOW() - INTERVAL 10 DAY),

-- Diana wants classic literature
('1aee87ab-2f3e-4d6f-bfd0-290738a5b7a6', '4a5e5d58-c839-42be-8e6c-43aef31234c7', '1984', 'George Orwell', NULL, 'Fiction', 9, 'Must-read classic', NOW() - INTERVAL 12 DAY),
('0d56bfe0-40f1-4cfb-aa2c-321744361661', '4a5e5d58-c839-42be-8e6c-43aef31234c7', 'To Kill a Mockingbird', 'Harper Lee', NULL, 'Fiction', 8, 'Classic American literature', NOW() - INTERVAL 8 DAY),

-- Eric wants self-help and business
('c9edd96d-6b92-4321-a90b-3bae157f6f7b', 'd813814c-42cc-4b38-af9b-c42c192ff8ac', 'Atomic Habits', 'James Clear', NULL, 'Self-Help', 9, 'Want to build better habits', NOW() - INTERVAL 10 DAY),
('7e87b82b-78e0-4034-872e-48cc3b56bafc', 'd813814c-42cc-4b38-af9b-c42c192ff8ac', 'Rich Dad Poor Dad', 'Robert Kiyosaki', NULL, 'Business', 7, 'Financial education', NOW() - INTERVAL 5 DAY),

-- Fiona wants fantasy
('4e88448f-d69d-4c2f-a027-44afa3b8ae33', 'dac03365-1ba5-42cc-a0d5-053c624004b1', 'The Hobbit', 'J.R.R. Tolkien', NULL, 'Fantasy', 8, 'Love fantasy books', NOW() - INTERVAL 5 DAY);

-- =====================================================
-- 7. EXCHANGE REQUESTS (Various statuses for testing)
-- =====================================================
INSERT INTO exchange_requests (request_id, requester_id, receiver_id, status, message, rejection_reason, created_at, responded_at) VALUES
-- PENDING requests (ready for testing accept/reject)
('8354dbb3-78ab-426e-b0ee-45c66e4413b1', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', '97b26714-4179-4155-82d0-3f691543fd3d', 'PENDING', 'Hi Alice! I noticed you have Dune and I have Clean Code. Would you like to exchange?', NULL, NOW() - INTERVAL 2 DAY, NULL),
('07301474-975b-4806-b62e-d95791e8d2d8', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 'PENDING', 'Hey Eric! I want to start reading manga. Can we trade?', NULL, NOW() - INTERVAL 1 DAY, NULL),
('cffc5558-f6df-4474-abbf-eb53d3b04b15', '35769922-58dd-4222-90a1-a52902366d4a', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 'PENDING', 'Hi Charlie! I love classic literature. Want to exchange?', NULL, NOW() - INTERVAL 12 HOUR, NULL),

-- ACCEPTED requests (will create exchanges)
('0a643e3e-7a38-4973-aa3c-f96f18099d4b', '97b26714-4179-4155-82d0-3f691543fd3d', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 'ACCEPTED', 'Hi Charlie! I love Vietnamese literature. Lets exchange!', NULL, NOW() - INTERVAL 10 DAY, NOW() - INTERVAL 9 DAY),
('a82003ef-7571-4107-96ca-1fef99f36443', '35769922-58dd-4222-90a1-a52902366d4a', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'ACCEPTED', 'Hi Bob! I have business books, you have tech books. Perfect match!', NULL, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 7 DAY),
('848c1587-3f3a-46d1-bfc3-28874dc9cc72', '97b26714-4179-4155-82d0-3f691543fd3d', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 'ACCEPTED', 'Hey Eric! Want to trade Hobbit for Naruto?', NULL, NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 5 DAY),

-- REJECTED request
('3b6f8125-1bde-4ca8-8cd8-32f50e6a6a0d', '6a5a795b-054f-4559-892f-d1dbeeb44af3', '97b26714-4179-4155-82d0-3f691543fd3d', 'REJECTED', 'Hi! Want to trade manga for sci-fi?', 'Sorry, not interested in manga right now.', NOW() - INTERVAL 15 DAY, NOW() - INTERVAL 14 DAY),

-- COMPLETED request
('dd26cfa5-08bd-4b5d-ac38-3cd0e40c5d8c', '97b26714-4179-4155-82d0-3f691543fd3d', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'COMPLETED', 'Completed exchange successfully', NULL, NOW() - INTERVAL 30 DAY, NOW() - INTERVAL 29 DAY),

-- CANCELLED request
('3d32fd30-e0b4-417c-a6b0-55a3e42471ec', '35769922-58dd-4222-90a1-a52902366d4a', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 'CANCELLED', 'Want to exchange?', NULL, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 19 DAY);

-- =====================================================
-- 8. EXCHANGE REQUEST BOOKS
-- =====================================================
INSERT INTO exchange_request_books (exchange_request_book_id, request_id, book_id, offered_by_requester, book_type, created_at) VALUES
-- Request 1: Bob offers Clean Code, wants Alice's Dune
('06e94200-61a0-4fcc-994d-92ef903d7d8f', '8354dbb3-78ab-426e-b0ee-45c66e4413b1', '7f9d41f0-1b3e-412c-80b7-3b00ae3d1f39', 1, 'OFFERED', NOW() - INTERVAL 2 DAY),
('67e0e06d-0b91-42fa-97ec-483f36528f65', '8354dbb3-78ab-426e-b0ee-45c66e4413b1', '92e48c32-f268-40d1-9dfe-0ff43f1aa3b3', 0, 'REQUESTED', NOW() - INTERVAL 2 DAY),

-- Request 2: Charlie offers 1984, wants Eric's One Piece
('864de61c-5122-4f9b-99a1-5eb83b69fd65', '07301474-975b-4806-b62e-d95791e8d2d8', '8698680c-e56d-42f4-9f23-39379c225cc9', 1, 'OFFERED', NOW() - INTERVAL 1 DAY),
('0aae0c9f-0de6-4d00-808c-0e3e8af98b9f', '07301474-975b-4806-b62e-d95791e8d2d8', '46c1f721-ce07-4685-bd6c-0b7fb22f6677', 0, 'REQUESTED', NOW() - INTERVAL 1 DAY),

-- Request 3: Diana offers Atomic Habits, wants Charlie's Truyện Kiều
('293e38dd-4f52-4d58-9f2b-0e5c581884e7', 'cffc5558-f6df-4474-abbf-eb53d3b04b15', '096532ae-7930-49a6-aeb1-2e9c83e99a1d', 1, 'OFFERED', NOW() - INTERVAL 12 HOUR),
('682cdccf-6c7f-40c2-9e0a-f38c129da83e', 'cffc5558-f6df-4474-abbf-eb53d3b04b15', '7f2d16fc-e2a3-40cf-a74a-47bef74c254c', 0, 'REQUESTED', NOW() - INTERVAL 12 HOUR),

-- Request 4: Alice offers Foundation, wants Charlie's Số Đỏ
('a155419b-24cf-4414-8b31-4f41dce9b540', '0a643e3e-7a38-4973-aa3c-f96f18099d4b', '93102070-b5bc-4288-9239-ee0dd31baf41', 1, 'OFFERED', NOW() - INTERVAL 10 DAY),
('e81aeb58-8c93-4c24-9f37-fc29eacca16d', '0a643e3e-7a38-4973-aa3c-f96f18099d4b', '9a8b6c3e-4959-402f-bd28-3c651d143381', 0, 'REQUESTED', NOW() - INTERVAL 10 DAY),

-- Request 5: Diana offers Rich Dad, wants Bob's Design Patterns
('2d923abb-9257-4e75-b57b-017ef6554706', 'a82003ef-7571-4107-96ca-1fef99f36443', 'c2696993-7c3f-4f45-9fdd-88d8f83c52e1', 1, 'OFFERED', NOW() - INTERVAL 8 DAY),
('b188ff10-0ee3-44d0-8501-22b4a79204de', 'a82003ef-7571-4107-96ca-1fef99f36443', '0f718b52-ee26-47b8-9a39-5480fb6adfd2', 0, 'REQUESTED', NOW() - INTERVAL 8 DAY),

-- Request 6: Alice offers The Hobbit, wants Eric's Naruto
('1cb04777-476c-41b3-99a2-6e799d84cf3c', '848c1587-3f3a-46d1-bfc3-28874dc9cc72', '29af9223-55cf-4955-b139-6a11dfa9efde', 1, 'OFFERED', NOW() - INTERVAL 6 DAY),
('c3eb7d10-2312-4e0d-8821-44899289ca7f', '848c1587-3f3a-46d1-bfc3-28874dc9cc72', '57913869-71d7-4855-b417-7c1990cd0a4e', 0, 'REQUESTED', NOW() - INTERVAL 6 DAY),

-- Request 7: Eric offers SAO, wanted Alice's Ender's Game
('be870542-567c-4d23-be74-edee936da1ae', '3b6f8125-1bde-4ca8-8cd8-32f50e6a6a0d', '3b0cf9c4-5dad-48b5-8203-c2e0b6e2e782', 1, 'OFFERED', NOW() - INTERVAL 15 DAY),
('e3168d28-63b8-463b-82fa-95dec790de84', '3b6f8125-1bde-4ca8-8cd8-32f50e6a6a0d', '4a5e6451-e704-4d69-9c51-933f7adef764', 0, 'REQUESTED', NOW() - INTERVAL 15 DAY),

-- Request 8: Alice offers Neuromancer, got Bob's JS Good Parts
('10e7b20e-07d7-4f53-a862-aef5bd33293a', 'dd26cfa5-08bd-4b5d-ac38-3cd0e40c5d8c', 'b007c7d6-b756-4244-90d5-dfe0d0a37b85', 1, 'OFFERED', NOW() - INTERVAL 30 DAY),
('e237b0a9-bb28-4b2f-ab67-5b7e7809b9fd', 'dd26cfa5-08bd-4b5d-ac38-3cd0e40c5d8c', '2b82b1ec-46bd-49b2-acbc-82885a8a60c6', 0, 'REQUESTED', NOW() - INTERVAL 30 DAY);

-- =====================================================
-- 9. EXCHANGES (Different statuses for testing workflow)
-- =====================================================
INSERT INTO exchanges (exchange_id, request_id, member_a_id, member_b_id, status, member_a_confirmed, member_b_confirmed, confirmed_by_a_at, confirmed_by_b_at, completed_at, created_at) VALUES
-- PENDING exchange (just accepted, needs confirmation)
('09e02c95-6a1b-4134-8319-adfd30073beb', '0a643e3e-7a38-4973-aa3c-f96f18099d4b', '97b26714-4179-4155-82d0-3f691543fd3d', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 'PENDING', 0, 0, NULL, NULL, NULL, NOW() - INTERVAL 9 DAY),

-- ACCEPTED exchange (one member confirmed)
('dc719dda-d111-4051-b736-22a2e4e7532e', 'a82003ef-7571-4107-96ca-1fef99f36443', '35769922-58dd-4222-90a1-a52902366d4a', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'ACCEPTED', 1, 0, NOW() - INTERVAL 6 DAY, NULL, NULL, NOW() - INTERVAL 7 DAY),

-- ACCEPTED exchange (both confirmed, ready to complete)
('4276f09e-2950-4f27-9b33-5d349a9ccaeb', '848c1587-3f3a-46d1-bfc3-28874dc9cc72', '97b26714-4179-4155-82d0-3f691543fd3d', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 'ACCEPTED', 1, 1, NOW() - INTERVAL 4 DAY, NOW() - INTERVAL 3 DAY, NULL, NOW() - INTERVAL 5 DAY),

-- COMPLETED exchange (with reviews)
('a7b9f6f9-3fae-4089-b232-e5b6477f36a5', 'dd26cfa5-08bd-4b5d-ac38-3cd0e40c5d8c', '97b26714-4179-4155-82d0-3f691543fd3d', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'COMPLETED', 1, 1, NOW() - INTERVAL 28 DAY, NOW() - INTERVAL 27 DAY, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 29 DAY),

-- CANCELLED exchange
('47e760c7-4c70-4cd7-a66a-d2d1a2cd315f', '3d32fd30-e0b4-417c-a6b0-55a3e42471ec', '35769922-58dd-4222-90a1-a52902366d4a', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 'CANCELLED', 0, 0, NULL, NULL, NULL, NOW() - INTERVAL 19 DAY);

-- =====================================================
-- 10. EXCHANGE BOOKS
-- =====================================================
INSERT INTO exchange_books (exchange_book_id, exchange_id, book_id, from_member_id, to_member_id, exchange_order, created_at) VALUES
-- Exchange 1: Alice's Foundation <-> Charlie's Số Đỏ
('564139ae-6cf3-4e7a-8d1c-2940040c717a', '09e02c95-6a1b-4134-8319-adfd30073beb', '93102070-b5bc-4288-9239-ee0dd31baf41', '97b26714-4179-4155-82d0-3f691543fd3d', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 1, NOW() - INTERVAL 9 DAY),
('8c526242-5fad-4bb2-8457-26d6a06bd6cd', '09e02c95-6a1b-4134-8319-adfd30073beb', '9a8b6c3e-4959-402f-bd28-3c651d143381', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', '97b26714-4179-4155-82d0-3f691543fd3d', 2, NOW() - INTERVAL 9 DAY),

-- Exchange 2: Diana's Rich Dad <-> Bob's Design Patterns
('a03dac3c-71a0-4a2b-8547-aca7f686a144', 'dc719dda-d111-4051-b736-22a2e4e7532e', 'c2696993-7c3f-4f45-9fdd-88d8f83c52e1', '35769922-58dd-4222-90a1-a52902366d4a', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 1, NOW() - INTERVAL 7 DAY),
('9fde596b-9d58-484a-85a1-571f5ee657fe', 'dc719dda-d111-4051-b736-22a2e4e7532e', '0f718b52-ee26-47b8-9a39-5480fb6adfd2', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', '35769922-58dd-4222-90a1-a52902366d4a', 2, NOW() - INTERVAL 7 DAY),

-- Exchange 3: Alice's Hobbit <-> Eric's Naruto
('f0ca095c-1915-4197-a8a4-0f15594070fc', '4276f09e-2950-4f27-9b33-5d349a9ccaeb', '29af9223-55cf-4955-b139-6a11dfa9efde', '97b26714-4179-4155-82d0-3f691543fd3d', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 1, NOW() - INTERVAL 5 DAY),
('454a4364-d972-4026-9a45-3c5782b6be36', '4276f09e-2950-4f27-9b33-5d349a9ccaeb', '57913869-71d7-4855-b417-7c1990cd0a4e', '6a5a795b-054f-4559-892f-d1dbeeb44af3', '97b26714-4179-4155-82d0-3f691543fd3d', 2, NOW() - INTERVAL 5 DAY),

-- Exchange 4: Alice's Neuromancer <-> Bob's JS Good Parts
('b3536ba4-1fa5-441a-9b84-3f9e20466e1e', 'a7b9f6f9-3fae-4089-b232-e5b6477f36a5', 'b007c7d6-b756-4244-90d5-dfe0d0a37b85', '97b26714-4179-4155-82d0-3f691543fd3d', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 1, NOW() - INTERVAL 29 DAY),
('7c6a001c-13e1-4685-b84e-10cab28a47a3', 'a7b9f6f9-3fae-4089-b232-e5b6477f36a5', '2b82b1ec-46bd-49b2-acbc-82885a8a60c6', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', '97b26714-4179-4155-82d0-3f691543fd3d', 2, NOW() - INTERVAL 29 DAY);

-- =====================================================
-- 11. CONVERSATIONS
-- =====================================================
INSERT INTO conversations (conversation_id, exchange_request_id, member_a_id, member_b_id, total_messages, last_message_at, last_message_preview, created_at) VALUES
('2e6e1749-5e46-489f-80ba-08eff69937aa', '8354dbb3-78ab-426e-b0ee-45c66e4413b1', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', '97b26714-4179-4155-82d0-3f691543fd3d', 2, NOW() - INTERVAL 1 DAY, 'Let me think about it...', NOW() - INTERVAL 2 DAY),
('caaaddab-89b1-4df0-8bfe-0941ddfd58c1', '0a643e3e-7a38-4973-aa3c-f96f18099d4b', '97b26714-4179-4155-82d0-3f691543fd3d', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 5, NOW() - INTERVAL 8 DAY, 'Great! Looking forward to it.', NOW() - INTERVAL 9 DAY),
('0f726b51-ca8d-4aac-918c-53f129368c71', 'a82003ef-7571-4107-96ca-1fef99f36443', '35769922-58dd-4222-90a1-a52902366d4a', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 4, NOW() - INTERVAL 6 DAY, 'I confirmed on my end.', NOW() - INTERVAL 7 DAY),
('2b68f7c2-da97-4d36-bd4d-4d901ffea5cd', 'dd26cfa5-08bd-4b5d-ac38-3cd0e40c5d8c', '97b26714-4179-4155-82d0-3f691543fd3d', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 3, NOW() - INTERVAL 25 DAY, 'Thanks for the exchange!', NOW() - INTERVAL 29 DAY);

-- =====================================================
-- 12. MESSAGES
-- =====================================================
INSERT INTO messages (message_id, conversation_id, sender_id, receiver_id, content, message_type, is_read, read_at, sent_at, created_at) VALUES
-- Conversation 1: Bob <-> Alice
('067a0dfc-7709-42d6-98f0-db412d882bd5', '2e6e1749-5e46-489f-80ba-08eff69937aa', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', '97b26714-4179-4155-82d0-3f691543fd3d', 'Hi Alice! I noticed you have Dune. I have Clean Code. Want to exchange?', 'TEXT', 1, NOW() - INTERVAL 2 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 2 DAY, NOW() - INTERVAL 2 DAY),
('f8743266-8b4d-4a8b-8b60-3a205afc75b7', '2e6e1749-5e46-489f-80ba-08eff69937aa', '97b26714-4179-4155-82d0-3f691543fd3d', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'Let me think about it. I will get back to you soon!', 'TEXT', 1, NOW() - INTERVAL 1 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 1 DAY),

-- Conversation 2: Alice <-> Charlie
('e38bb552-b21e-483c-a3c8-1028c45f6e70', 'caaaddab-89b1-4df0-8bfe-0941ddfd58c1', '97b26714-4179-4155-82d0-3f691543fd3d', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 'Hi Charlie! Thanks for accepting my request!', 'TEXT', 1, NOW() - INTERVAL 9 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 9 DAY, NOW() - INTERVAL 9 DAY),
('b44b3686-76c2-4940-8eb0-5d1d5fd1f74a', 'caaaddab-89b1-4df0-8bfe-0941ddfd58c1', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', '97b26714-4179-4155-82d0-3f691543fd3d', 'No problem! I love sci-fi books.', 'TEXT', 1, NOW() - INTERVAL 9 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 9 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 9 DAY + INTERVAL 1 HOUR),
('5ef4f85f-6c09-4d8d-9c1d-53a144827aec', 'caaaddab-89b1-4df0-8bfe-0941ddfd58c1', '97b26714-4179-4155-82d0-3f691543fd3d', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 'When can we meet?', 'TEXT', 1, NOW() - INTERVAL 8 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 8 DAY, NOW() - INTERVAL 8 DAY),
('291f0076-ae02-4e52-a1dc-860524531236', 'caaaddab-89b1-4df0-8bfe-0941ddfd58c1', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', '97b26714-4179-4155-82d0-3f691543fd3d', 'How about this weekend?', 'TEXT', 1, NOW() - INTERVAL 8 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 8 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 8 DAY + INTERVAL 1 HOUR),
('689e2282-5d76-4165-a184-bed16586234d', 'caaaddab-89b1-4df0-8bfe-0941ddfd58c1', '97b26714-4179-4155-82d0-3f691543fd3d', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 'Great! Looking forward to it.', 'TEXT', 1, NOW() - INTERVAL 8 DAY + INTERVAL 3 HOUR, NOW() - INTERVAL 8 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 8 DAY + INTERVAL 2 HOUR),

-- Conversation 3: Diana <-> Bob
('a955971d-6605-4bd2-b328-1ef8642232a1', '0f726b51-ca8d-4aac-918c-53f129368c71', '35769922-58dd-4222-90a1-a52902366d4a', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'Hi Bob! Ready for our exchange?', 'TEXT', 1, NOW() - INTERVAL 7 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY),
('e8d82966-b825-4903-bbc4-635679fe7433', '0f726b51-ca8d-4aac-918c-53f129368c71', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', '35769922-58dd-4222-90a1-a52902366d4a', 'Yes! Let us meet this week.', 'TEXT', 1, NOW() - INTERVAL 7 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 7 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 7 DAY + INTERVAL 1 HOUR),
('dace4d31-144f-45ec-b46a-538ceb959a14', '0f726b51-ca8d-4aac-918c-53f129368c71', '35769922-58dd-4222-90a1-a52902366d4a', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'Sounds good!', 'TEXT', 1, NOW() - INTERVAL 6 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 6 DAY, NOW() - INTERVAL 6 DAY),
('a046b9ab-6150-4fd4-bdda-4a7c30564475', '0f726b51-ca8d-4aac-918c-53f129368c71', '35769922-58dd-4222-90a1-a52902366d4a', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'I confirmed on my end.', 'TEXT', 1, NOW() - INTERVAL 6 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 6 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 6 DAY + INTERVAL 1 HOUR),

-- Conversation 4: Alice <-> Bob (completed exchange)
('27192ac0-88e3-40e6-b039-4855e7b15e66', '2b68f7c2-da97-4d36-bd4d-4d901ffea5cd', '97b26714-4179-4155-82d0-3f691543fd3d', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'Thanks for the book Bob!', 'TEXT', 1, NOW() - INTERVAL 25 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 25 DAY),
('1b0e5fdd-8dee-4a92-9d56-c98383a4fb2b', '2b68f7c2-da97-4d36-bd4d-4d901ffea5cd', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', '97b26714-4179-4155-82d0-3f691543fd3d', 'You are welcome! Enjoy Neuromancer!', 'TEXT', 1, NOW() - INTERVAL 25 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 25 DAY + INTERVAL 1 HOUR, NOW() - INTERVAL 25 DAY + INTERVAL 1 HOUR),
('3308f4e5-aaa0-4f29-9439-f39b29518a46', '2b68f7c2-da97-4d36-bd4d-4d901ffea5cd', '97b26714-4179-4155-82d0-3f691543fd3d', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'Thanks for the exchange!', 'TEXT', 1, NOW() - INTERVAL 25 DAY + INTERVAL 3 HOUR, NOW() - INTERVAL 25 DAY + INTERVAL 2 HOUR, NOW() - INTERVAL 25 DAY + INTERVAL 2 HOUR);

-- =====================================================
-- 13. MESSAGE REACTIONS
-- =====================================================
INSERT INTO message_reactions (reaction_id, message_id, member_id, emoji, created_at) VALUES
('7b96f80c-2693-4f2f-9bda-ec1069cfb4b8', 'e38bb552-b21e-483c-a3c8-1028c45f6e70', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', '👍', NOW() - INTERVAL 9 DAY + INTERVAL 1 HOUR),
('35f46d07-7e2a-4d9d-a52a-22d934a6a817', '689e2282-5d76-4165-a184-bed16586234d', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', '😊', NOW() - INTERVAL 8 DAY + INTERVAL 3 HOUR),
('a2bea625-f774-4984-8c7f-a2030307ff82', '27192ac0-88e3-40e6-b039-4855e7b15e66', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', '❤️', NOW() - INTERVAL 25 DAY + INTERVAL 1 HOUR);

-- =====================================================
-- 14. REVIEWS (Post-exchange feedback)
-- =====================================================
INSERT INTO reviews (review_id, exchange_id, reviewer_id, reviewee_id, rating, comment, trust_score_impact, created_at) VALUES
-- Reviews for completed exchange 4 (Alice <-> Bob)
('2aec991e-8165-48dd-bbd4-0527d64251b3', 'a7b9f6f9-3fae-4089-b232-e5b6477f36a5', '97b26714-4179-4155-82d0-3f691543fd3d', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 5, 'Bob was very punctual and the book was in great condition! Would trade again.', 0.25, NOW() - INTERVAL 24 DAY),
('8c3587f3-2d61-4df1-be8a-a8241d00078a', 'a7b9f6f9-3fae-4089-b232-e5b6477f36a5', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', '97b26714-4179-4155-82d0-3f691543fd3d', 5, 'Alice is a wonderful trader. Neuromancer was exactly as described. Highly recommend!', 0.25, NOW() - INTERVAL 23 DAY);

-- =====================================================
-- 15. NOTIFICATIONS
-- =====================================================
INSERT INTO notifications (notification_id, member_id, notification_type, title, content, reference_type, reference_id, is_read, read_at, created_at, payload) VALUES
-- For Alice
('96d6b232-f673-480e-940c-ab5f129108c3', '97b26714-4179-4155-82d0-3f691543fd3d', 'EXCHANGE_REQUEST', 'New Exchange Request', 'Bob wants to exchange Clean Code for your Dune!', 'exchange_request', '8354dbb3-78ab-426e-b0ee-45c66e4413b1', 0, NULL, NOW() - INTERVAL 2 DAY, '{"requester_name": "Bob Tran", "book_offered": "Clean Code", "book_requested": "Dune"}'),
('d73496c3-0476-4bb3-b8d0-2229a39ebcf4', '97b26714-4179-4155-82d0-3f691543fd3d', 'BOOK_MATCH', 'New Book Match!', 'We found a match for your wanted book: Clean Code', 'book_match', 'match-001', 1, NOW() - INTERVAL 20 DAY, NOW() - INTERVAL 25 DAY, '{"book_title": "Clean Code", "owner_name": "Bob Tran"}'),
('5bce47de-657a-40dd-9331-ded1d2df2328', '97b26714-4179-4155-82d0-3f691543fd3d', 'EXCHANGE_COMPLETED', 'Exchange Completed', 'Your exchange with Bob has been completed!', 'exchange', 'a7b9f6f9-3fae-4089-b232-e5b6477f36a5', 1, NOW() - INTERVAL 24 DAY, NOW() - INTERVAL 25 DAY, '{"exchange_partner": "Bob Tran"}'),

-- For Bob
('7f435964-20af-4315-8db3-a6f94fdeb7a7', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'EXCHANGE_ACCEPTED', 'Exchange Request Accepted', 'Diana accepted your exchange request!', 'exchange_request', 'a82003ef-7571-4107-96ca-1fef99f36443', 1, NOW() - INTERVAL 7 DAY, NOW() - INTERVAL 7 DAY, '{"accepter_name": "Diana Pham"}'),
('7a2d8765-98a7-4802-a6ee-ea19187686e5', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 'BOOK_MATCH', 'New Book Match!', 'Alice has Dune that you are looking for!', 'book_match', 'match-002', 1, NOW() - INTERVAL 28 DAY, NOW() - INTERVAL 28 DAY, '{"book_title": "Dune", "owner_name": "Alice Nguyen"}'),

-- For Charlie
('c2608ed0-7fe0-446d-bdb6-722464329056', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 'EXCHANGE_REQUEST', 'New Exchange Request', 'Diana wants to exchange with you!', 'exchange_request', 'cffc5558-f6df-4474-abbf-eb53d3b04b15', 0, NULL, NOW() - INTERVAL 12 HOUR, '{"requester_name": "Diana Pham"}'),
('12012cfa-88c9-4bab-89d7-92ed38bebe56', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 'NEW_MESSAGE', 'New Message', 'Alice sent you a message', 'conversation', 'caaaddab-89b1-4df0-8bfe-0941ddfd58c1', 0, NULL, NOW() - INTERVAL 8 DAY, '{"sender_name": "Alice Nguyen", "preview": "When can we meet?"}'),

-- For Eric
('618d8a33-7a3d-4735-9fb4-9c263a96ee6c', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 'EXCHANGE_REQUEST', 'New Exchange Request', 'Charlie wants to trade with you!', 'exchange_request', '07301474-975b-4806-b62e-d95791e8d2d8', 0, NULL, NOW() - INTERVAL 1 DAY, '{"requester_name": "Charlie Le"}'),
('29892051-cd85-4eae-8911-20e995f2345c', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 'EXCHANGE_CONFIRMATION', 'Exchange Confirmed', 'Both parties confirmed the exchange with Alice', 'exchange', '4276f09e-2950-4f27-9b33-5d349a9ccaeb', 1, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 3 DAY, '{"exchange_partner": "Alice Nguyen"}');

-- =====================================================
-- 16. VIOLATION REPORTS
-- =====================================================
INSERT INTO violation_reports (report_id, reporter_id, reported_member_id, report_type, description, reported_item_type, reported_item_id, status, priority, resolved_by, resolution, created_at, resolved_at) VALUES
('3d090bdd-6b4f-4364-b18a-28c3bb2600e8', '97b26714-4179-4155-82d0-3f691543fd3d', '70eff64f-528f-41c1-a985-e8ad5da2db3a', 'NO_SHOW', 'This user did not show up to our scheduled meeting twice.', 'MEMBER', '70eff64f-528f-41c1-a985-e8ad5da2db3a', 'RESOLVED', 'HIGH', '7ae40e6f-42b1-4138-ae75-97fc20a045ac', 'User has been locked. Warning issued.', NOW() - INTERVAL 50 DAY, NOW() - INTERVAL 45 DAY),
('2fbaedff-ae72-4fc7-a889-b8949cb9622a', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', '1770dc6b-8d3e-4724-86a2-9a00f7b3b7fc', 'SPAM', 'User is sending spam messages about selling books instead of exchanging.', 'MESSAGE', 'msg-spam-001', 'PENDING', 'MEDIUM', NULL, NULL, NOW() - INTERVAL 3 DAY, NULL),
('4e9d9b76-592c-4775-b08f-d8db183ab634', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', '70eff64f-528f-41c1-a985-e8ad5da2db3a', 'INAPPROPRIATE_CONTENT', 'Book description contains inappropriate content.', 'BOOK', 'book-inappropriate', 'IN_REVIEW', 'HIGH', NULL, NULL, NOW() - INTERVAL 5 DAY, NULL);

-- =====================================================
-- 17. BLOCKED MEMBERS
-- =====================================================
INSERT INTO blocked_members (block_id, blocked_by_id, blocked_member_id, reason, created_at) VALUES
('b449627b-3985-4f57-958c-69037b9a4fb0', '97b26714-4179-4155-82d0-3f691543fd3d', '70eff64f-528f-41c1-a985-e8ad5da2db3a', 'Did not show up to scheduled meetings twice', NOW() - INTERVAL 45 DAY),
('d41dc2bd-c0d8-47f5-b168-433621fda51f', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', '70eff64f-528f-41c1-a985-e8ad5da2db3a', 'Rude and unprofessional behavior', NOW() - INTERVAL 40 DAY),
('a06a0d8b-b87e-482b-a98c-dc05f4b2ddd5', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', '1770dc6b-8d3e-4724-86a2-9a00f7b3b7fc', 'Spam messages', NOW() - INTERVAL 3 DAY);

-- =====================================================
-- 18. EXCHANGE SUGGESTIONS (Matching algorithm results)
-- =====================================================
INSERT INTO exchange_suggestions (suggestion_id, member_a_id, member_b_id, match_score, total_matching_books, is_viewed, viewed_at, created_at, expired_at, score_breakdown) VALUES
-- Alice <-> Bob (High match - both want each other's books)
('eec455f1-7c7a-41f5-a0d1-d5df5fdd13c2', '97b26714-4179-4155-82d0-3f691543fd3d', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', 0.850, 3, 1, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 25 DAY, 
'{"book_match": 0.35, "category_match": 0.20, "trust_score": 0.15, "rating": 0.10, "verification": 0.05, "exchange_history": 0.05}'),

-- Bob <-> Alice (Reverse suggestion)
('03c5c005-4ee7-40db-8694-871155283f1f', '4dce5f5f-f3ca-471e-bc2a-665eb5ec9001', '97b26714-4179-4155-82d0-3f691543fd3d', 0.850, 3, 1, NOW() - INTERVAL 3 DAY, NOW() - INTERVAL 5 DAY, NOW() + INTERVAL 25 DAY,
'{"book_match": 0.35, "category_match": 0.20, "trust_score": 0.15, "rating": 0.10, "verification": 0.05, "exchange_history": 0.05}'),

-- Charlie <-> Eric (Moderate match)
('f02b3bcc-6357-4893-9647-d359b8a08e1e', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', '6a5a795b-054f-4559-892f-d1dbeeb44af3', 0.650, 2, 0, NULL, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 28 DAY,
'{"book_match": 0.25, "category_match": 0.15, "trust_score": 0.12, "rating": 0.08, "verification": 0.05, "exchange_history": 0.05}'),

-- Diana <-> Charlie (Good match)
('b2567bac-77ec-4b44-9fd8-7e785769400a', '35769922-58dd-4222-90a1-a52902366d4a', 'bfb2da68-90ce-49b0-b6fd-7bdf6592fdc4', 0.720, 2, 1, NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 28 DAY,
'{"book_match": 0.30, "category_match": 0.15, "trust_score": 0.10, "rating": 0.08, "verification": 0.04, "exchange_history": 0.05}');

-- =====================================================
-- 19. BOOK MATCH PAIRS (Detailed book-to-book matching)
-- =====================================================
INSERT INTO book_match_pairs (pair_id, suggestion_id, book_a_id, book_b_id, match_reason, match_score, pair_direction, created_at) VALUES
-- For suggestion 1 (Alice <-> Bob)
('829113b2-a4f4-47b1-b957-9ebca042216a', 'eec455f1-7c7a-41f5-a0d1-d5df5fdd13c2', '92e48c32-f268-40d1-9dfe-0ff43f1aa3b3', '7f9d41f0-1b3e-412c-80b7-3b00ae3d1f39', 'Alice has Dune (wanted by Bob), Bob has Clean Code (wanted by Alice)', 0.900, 'THEY_WANT_FROM_ME', NOW() - INTERVAL 5 DAY),
('9a587651-67d3-4cec-8d88-3ec29737ce6a', 'eec455f1-7c7a-41f5-a0d1-d5df5fdd13c2', '7f9d41f0-1b3e-412c-80b7-3b00ae3d1f39', '92e48c32-f268-40d1-9dfe-0ff43f1aa3b3', 'Bob has Clean Code (wanted by Alice), Alice has Dune (wanted by Bob)', 0.900, 'I_WANT_FROM_THEM', NOW() - INTERVAL 5 DAY),

-- For suggestion 3 (Charlie <-> Eric)
('9c0e19a5-0fbc-4916-a993-28fe5974598a', 'f02b3bcc-6357-4893-9647-d359b8a08e1e', '8698680c-e56d-42f4-9f23-39379c225cc9', '46c1f721-ce07-4685-bd6c-0b7fb22f6677', 'Charlie has 1984, Eric has One Piece Vol 1', 0.750, 'THEY_WANT_FROM_ME', NOW() - INTERVAL 2 DAY),
('95f28605-c163-423b-9b03-6c70dd1fbed8', 'f02b3bcc-6357-4893-9647-d359b8a08e1e', '46c1f721-ce07-4685-bd6c-0b7fb22f6677', '8698680c-e56d-42f4-9f23-39379c225cc9', 'Eric has One Piece Vol 1, Charlie wants manga', 0.750, 'I_WANT_FROM_THEM', NOW() - INTERVAL 2 DAY);

-- =====================================================
-- 20. USER ACTIVITY LOGS
-- =====================================================
INSERT INTO user_activity_logs (log_id, user_id, action, entity_type, entity_id, metadata, ip_address, user_agent, created_at) VALUES
('f3e9a4f8-dffb-41cf-a436-1f93d9296735', '318eb680-40e7-4699-94ed-7dd373f72365', 'LOGIN', NULL, NULL, '{"method": "email"}', '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL 1 DAY),
('d4893cd7-2b75-49d4-8386-2c9e5225561d', '318eb680-40e7-4699-94ed-7dd373f72365', 'CREATE_BOOK', 'BOOK', '92e48c32-f268-40d1-9dfe-0ff43f1aa3b3', '{"title": "Dune"}', '192.168.1.100', 'Mozilla/5.0', NOW() - INTERVAL 80 DAY),
('ad63a5b9-a4bf-4c3e-93b7-f13c88427c39', 'd37d47ad-2a43-4ac4-81cb-6b2d42a40b6c', 'LOGIN', NULL, NULL, '{"method": "email"}', '192.168.1.101', 'Mozilla/5.0', NOW() - INTERVAL 2 DAY),
('efd224d6-6332-4c21-8c1c-d96f92b33c00', 'd37d47ad-2a43-4ac4-81cb-6b2d42a40b6c', 'CREATE_EXCHANGE_REQUEST', 'EXCHANGE_REQUEST', '8354dbb3-78ab-426e-b0ee-45c66e4413b1', '{"receiver": "member-001"}', '192.168.1.101', 'Mozilla/5.0', NOW() - INTERVAL 2 DAY),
('948045ec-be15-42e7-8e67-e4b7c3228cf3', '09f8489e-59a2-4f35-8b9c-c4a5f9cfccee', 'LOGIN', NULL, NULL, '{"method": "email"}', '192.168.1.102', 'Mozilla/5.0', NOW() - INTERVAL 3 DAY);

-- =====================================================
-- 21. AUDIT LOGS (Admin actions)
-- =====================================================
INSERT INTO audit_logs (log_id, admin_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at) VALUES
('dec986bf-7e11-4d81-8615-a18fc6e01fc6', '7ae40e6f-42b1-4138-ae75-97fc20a045ac', 'LOCK_USER', 'USER', '3c99df30-f73b-4908-a20f-a487de531e47', '{"account_status": "ACTIVE"}', '{"account_status": "LOCKED"}', '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL 45 DAY),
('aed6a8dc-73d8-4a01-8759-cca539aad93e', '7ae40e6f-42b1-4138-ae75-97fc20a045ac', 'RESOLVE_REPORT', 'REPORT', '3d090bdd-6b4f-4364-b18a-28c3bb2600e8', '{"status": "PENDING"}', '{"status": "RESOLVED", "resolution": "User has been locked"}', '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL 45 DAY),
('894eb36f-2a3c-4aeb-8683-e38aca476763', '7ae40e6f-42b1-4138-ae75-97fc20a045ac', 'SUSPEND_USER', 'USER', '30f5be1a-5034-476c-8bde-34aa14c40485', '{"account_status": "ACTIVE"}', '{"account_status": "SUSPENDED"}', '192.168.1.1', 'Mozilla/5.0', NOW() - INTERVAL 90 DAY);

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
