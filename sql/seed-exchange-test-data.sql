-- Seed data for testing exchange suggestions
-- Creates 5 test users with complementary book collections

-- Clean up existing test data
DELETE FROM books_wanted WHERE library_id IN (
  SELECT library_id FROM personal_libraries WHERE member_id IN (
    SELECT member_id FROM members WHERE user_id IN (
      SELECT user_id FROM users WHERE email LIKE '%test-exchange%'
    )
  )
);

DELETE FROM books WHERE owner_id IN (
  SELECT member_id FROM members WHERE user_id IN (
    SELECT user_id FROM users WHERE email LIKE '%test-exchange%'
  )
);

DELETE FROM personal_libraries WHERE member_id IN (
  SELECT member_id FROM members WHERE user_id IN (
    SELECT user_id FROM users WHERE email LIKE '%test-exchange%'
  )
);

DELETE FROM members WHERE user_id IN (
  SELECT user_id FROM users WHERE email LIKE '%test-exchange%'
);

DELETE FROM users WHERE email LIKE '%test-exchange%';

-- Create test users
-- Password for all: Test123!@# (hashed with bcrypt)
INSERT INTO users (user_id, email, password_hash, full_name, avatar_url, role, account_status, is_email_verified, email_verified_at, created_at)
VALUES
  ('u-alice-001', 'alice.test-exchange@bookswap.com', '$2b$10$YourHashedPasswordHere', 'Alice Johnson', 'https://i.pravatar.cc/150?img=1', 'MEMBER', 'ACTIVE', 1, NOW(), NOW()),
  ('u-bob-002', 'bob.test-exchange@bookswap.com', '$2b$10$YourHashedPasswordHere', 'Bob Smith', 'https://i.pravatar.cc/150?img=2', 'MEMBER', 'ACTIVE', 1, NOW(), NOW()),
  ('u-carol-003', 'carol.test-exchange@bookswap.com', '$2b$10$YourHashedPasswordHere', 'Carol Williams', 'https://i.pravatar.cc/150?img=3', 'MEMBER', 'ACTIVE', 1, NOW(), NOW()),
  ('u-david-004', 'david.test-exchange@bookswap.com', '$2b$10$YourHashedPasswordHere', 'David Brown', 'https://i.pravatar.cc/150?img=4', 'MEMBER', 'ACTIVE', 1, NOW(), NOW()),
  ('u-eve-005', 'eve.test-exchange@bookswap.com', '$2b$10$YourHashedPasswordHere', 'Eve Davis', 'https://i.pravatar.cc/150?img=5', 'MEMBER', 'ACTIVE', 1, NOW(), NOW());

-- Create member profiles
INSERT INTO members (member_id, user_id, region, phone, address, bio, trust_score, is_verified, total_exchanges, completed_exchanges, created_at, updated_at)
VALUES
  ('m-alice-001', 'u-alice-001', 'Hà Nội', '0901234567', 'Cầu Giấy, Hà Nội', 'Love tech books and programming', 75, TRUE, 5, 4, NOW(), NOW()),
  ('m-bob-002', 'u-bob-002', 'Hà Nội', '0901234568', 'Đống Đa, Hà Nội', 'Fiction and fantasy enthusiast', 80, TRUE, 8, 7, NOW(), NOW()),
  ('m-carol-003', 'u-carol-003', 'Hồ Chí Minh', '0901234569', 'Quận 1, TP.HCM', 'Business and entrepreneurship', 70, TRUE, 3, 3, NOW(), NOW()),
  ('m-david-004', 'u-david-004', 'Hồ Chí Minh', '0901234570', 'Quận 3, TP.HCM', 'Personal development reader', 65, TRUE, 2, 2, NOW(), NOW()),
  ('m-eve-005', 'u-eve-005', 'Đà Nẵng', '0901234571', 'Hải Châu, Đà Nẵng', 'Parent looking for children books', 85, TRUE, 10, 9, NOW(), NOW());

-- Create personal libraries
INSERT INTO personal_libraries (library_id, member_id, total_owned_books, total_wanted_books, created_at)
VALUES
  ('lib-alice-001', 'm-alice-001', 0, 0, NOW()),
  ('lib-bob-002', 'm-bob-002', 0, 0, NOW()),
  ('lib-carol-003', 'm-carol-003', 0, 0, NOW()),
  ('lib-david-004', 'm-david-004', 0, 0, NOW()),
  ('lib-eve-005', 'm-eve-005', 0, 0, NOW());

-- ALICE'S BOOKS (Tech/Programming) - Available for exchange
INSERT INTO books (book_id, owner_id, title, author, isbn, category, book_condition, description, cover_image_url, created_at)
VALUES
  ('book-alice-001', 'm-alice-001', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 'GOOD', 'A handbook of agile software craftsmanship', 'https://m.media-amazon.com/images/I/41xShlnTZTL._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW()),
  ('book-alice-002', 'm-alice-001', 'Design Patterns', 'Gang of Four', '9780201633610', 'Technology', 'LIKE_NEW', 'Elements of Reusable Object-Oriented Software', 'https://m.media-amazon.com/images/I/51szD9HC9pL._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW()),
  ('book-alice-003', 'm-alice-001', 'The Pragmatic Programmer', 'Andrew Hunt', '9780135957059', 'Technology', 'GOOD', 'Your Journey To Mastery', 'https://m.media-amazon.com/images/I/51W1sBPO7tL._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW());

-- BOB'S BOOKS (Fiction/Fantasy) - Available for exchange
INSERT INTO books (book_id, owner_id, title, author, isbn, category, book_condition, description, cover_image_url, created_at)
VALUES
  ('book-bob-001', 'm-bob-002', 'The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Fiction', 'GOOD', 'Classic fantasy adventure', 'https://m.media-amazon.com/images/I/51U0i9pHYhL._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW()),
  ('book-bob-002', 'm-bob-002', 'Harry Potter and the Philosopher Stone', 'J.K. Rowling', '9780439708180', 'Fiction', 'LIKE_NEW', 'First book in the Harry Potter series', 'https://m.media-amazon.com/images/I/51UoqRAxwEL._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW()),
  ('book-bob-003', 'm-bob-002', 'The Name of the Wind', 'Patrick Rothfuss', '9780756404741', 'Fiction', 'GOOD', 'Epic fantasy tale', 'https://m.media-amazon.com/images/I/51U9HJLgMeL._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW());

-- CAROL'S BOOKS (Business) - Available for exchange
INSERT INTO books (book_id, owner_id, title, author, isbn, category, book_condition, description, cover_image_url, created_at)
VALUES
  ('book-carol-001', 'm-carol-003', 'Zero to One', 'Peter Thiel', '9780804139298', 'Business', 'LIKE_NEW', 'Notes on Startups', 'https://m.media-amazon.com/images/I/41Y1yDKQmzL._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW()),
  ('book-carol-002', 'm-carol-003', 'The Lean Startup', 'Eric Ries', '9780307887894', 'Business', 'GOOD', 'How Today Entrepreneurs Use Continuous Innovation', 'https://m.media-amazon.com/images/I/51Zymoq7UnL._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW()),
  ('book-carol-003', 'm-carol-003', 'Good to Great', 'Jim Collins', '9780066620992', 'Business', 'GOOD', 'Why Some Companies Make the Leap', 'https://m.media-amazon.com/images/I/51U2qv+zC1L._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW());

-- DAVID'S BOOKS (Self-Help) - Available for exchange
INSERT INTO books (book_id, owner_id, title, author, isbn, category, book_condition, description, cover_image_url, created_at)
VALUES
  ('book-david-001', 'm-david-004', 'Atomic Habits', 'James Clear', '9780735211292', 'Self-Help', 'LIKE_NEW', 'An Easy & Proven Way to Build Good Habits', 'https://m.media-amazon.com/images/I/51Tlm0GZTXL._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW()),
  ('book-david-002', 'm-david-004', 'The 7 Habits of Highly Effective People', 'Stephen Covey', '9781982137274', 'Self-Help', 'GOOD', 'Powerful Lessons in Personal Change', 'https://m.media-amazon.com/images/I/51S+G8RXt2L._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW()),
  ('book-david-003', 'm-david-004', 'Thinking, Fast and Slow', 'Daniel Kahneman', '9780374533557', 'Psychology', 'GOOD', 'How we make decisions', 'https://m.media-amazon.com/images/I/41shZGX0y+L._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW());

-- EVE'S BOOKS (Children) - Available for exchange
INSERT INTO books (book_id, owner_id, title, author, isbn, category, book_condition, description, cover_image_url, created_at)
VALUES
  ('book-eve-001', 'm-eve-005', 'Where the Wild Things Are', 'Maurice Sendak', '9060254926', 'Children', 'GOOD', 'Classic children story', 'https://m.media-amazon.com/images/I/51tXH84yVOL._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW()),
  ('book-eve-002', 'm-eve-005', 'The Very Hungry Caterpillar', 'Eric Carle', '9780399226908', 'Children', 'LIKE_NEW', 'Popular children picture book', 'https://m.media-amazon.com/images/I/51h1aKz6xdL._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW()),
  ('book-eve-003', 'm-eve-005', 'Green Eggs and Ham', 'Dr. Seuss', '9780394800165', 'Children', 'GOOD', 'Dr. Seuss classic', 'https://m.media-amazon.com/images/I/51zHj+7q3fL._SY291_BO1,204,203,200_QL40_FMwebp_.jpg', NOW());

-- WANTED BOOKS (Create matching patterns)

-- Alice wants Fiction (what Bob has)
INSERT INTO books_wanted (wanted_id, library_id, title, author, isbn, category, priority, notes, created_at)
VALUES
  ('wanted-alice-001', 'lib-alice-001', 'The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Fiction', 3, 'Want to relax with fantasy', NOW()),
  ('wanted-alice-002', 'lib-alice-001', 'Harry Potter and the Philosopher Stone', 'J.K. Rowling', '9780439708180', 'Fiction', 2, 'Heard great reviews', NOW());

-- Bob wants Tech books (what Alice has)
INSERT INTO books_wanted (wanted_id, library_id, title, author, isbn, category, priority, notes, created_at)
VALUES
  ('wanted-bob-001', 'lib-bob-002', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 3, 'Want to improve coding skills', NOW()),
  ('wanted-bob-002', 'lib-bob-002', 'Design Patterns', 'Gang of Four', '9780201633610', 'Technology', 2, 'Need for work project', NOW());

-- Carol wants Self-Help (what David has)
INSERT INTO books_wanted (wanted_id, library_id, title, author, isbn, category, priority, notes, created_at)
VALUES
  ('wanted-carol-001', 'lib-carol-003', 'Atomic Habits', 'James Clear', '9780735211292', 'Self-Help', 3, 'Want to build better habits', NOW()),
  ('wanted-carol-002', 'lib-carol-003', 'The 7 Habits of Highly Effective People', 'Stephen Covey', '9781982137274', 'Self-Help', 2, 'Leadership development', NOW());

-- David wants Business books (what Carol has)
INSERT INTO books_wanted (wanted_id, library_id, title, author, isbn, category, priority, notes, created_at)
VALUES
  ('wanted-david-001', 'lib-david-004', 'Zero to One', 'Peter Thiel', '9780804139298', 'Business', 3, 'Want to start a business', NOW()),
  ('wanted-david-002', 'lib-david-004', 'The Lean Startup', 'Eric Ries', '9780307887894', 'Business', 2, 'Interested in startups', NOW());

-- Eve wants Children books (cross-matching with everyone for variety)
INSERT INTO books_wanted (wanted_id, library_id, title, author, isbn, category, priority, notes, created_at)
VALUES
  ('wanted-eve-001', 'lib-eve-005', 'The Giving Tree', 'Shel Silverstein', '9780060256654', 'Children', 3, 'Classic for my kids', NOW()),
  ('wanted-eve-002', 'lib-eve-005', 'Goodnight Moon', 'Margaret Wise Brown', '9780064430173', 'Children', 2, 'Bedtime stories', NOW());

-- Update library counts
UPDATE personal_libraries SET total_owned_books = 3, total_wanted_books = 2 WHERE library_id = 'lib-alice-001';
UPDATE personal_libraries SET total_owned_books = 3, total_wanted_books = 2 WHERE library_id = 'lib-bob-002';
UPDATE personal_libraries SET total_owned_books = 3, total_wanted_books = 2 WHERE library_id = 'lib-carol-003';
UPDATE personal_libraries SET total_owned_books = 3, total_wanted_books = 2 WHERE library_id = 'lib-david-004';
UPDATE personal_libraries SET total_owned_books = 3, total_wanted_books = 2 WHERE library_id = 'lib-eve-005';

-- Verify data
SELECT 'Users created:' as status, COUNT(*) as count FROM users WHERE email LIKE '%test-exchange%';
SELECT 'Members created:' as status, COUNT(*) as count FROM members WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE '%test-exchange%');
SELECT 'Books created:' as status, COUNT(*) as count FROM books WHERE owner_id IN (SELECT member_id FROM members WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE '%test-exchange%'));
SELECT 'Wanted books created:' as status, COUNT(*) as count FROM books_wanted WHERE library_id IN (SELECT library_id FROM personal_libraries WHERE member_id IN (SELECT member_id FROM members WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE '%test-exchange%')));
