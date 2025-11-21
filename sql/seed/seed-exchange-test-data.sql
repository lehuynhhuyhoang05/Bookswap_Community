-- =============================================
-- Seed Data for Exchange Suggestions Testing
-- Tạo users, books, wanted books để test matching algorithm
-- =============================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ==================== TEST USERS ====================
-- Password for all test users: Test@123456
INSERT INTO users (user_id, email, password_hash, full_name, role, is_email_verified, avatar_url, created_at, updated_at) VALUES
-- User 1: Alice (has many tech books, wants fiction)
('test-user-alice-001', 'alice.test@bookswap.com', '$2a$10$YourHashHere1111111111111111111111111111111111111111', 'Alice Nguyen', 'MEMBER', 1, 'https://i.pravatar.cc/150?img=1', NOW(), NOW()),
-- User 2: Bob (has fiction, wants tech books)  
('test-user-bob-002', 'bob.test@bookswap.com', '$2a$10$YourHashHere2222222222222222222222222222222222222222', 'Bob Tran', 'MEMBER', 1, 'https://i.pravatar.cc/150?img=2', NOW(), NOW()),
-- User 3: Carol (has business books, wants self-help)
('test-user-carol-003', 'carol.test@bookswap.com', '$2a$10$YourHashHere3333333333333333333333333333333333333333', 'Carol Le', 'MEMBER', 1, 'https://i.pravatar.cc/150?img=3', NOW(), NOW()),
-- User 4: David (has self-help, wants business books)
('test-user-david-004', 'david.test@bookswap.com', '$2a$10$YourHashHere4444444444444444444444444444444444444444', 'David Pham', 'MEMBER', 1, 'https://i.pravatar.cc/150?img=4', NOW(), NOW()),
-- User 5: Eve (has children books)
('test-user-eve-005', 'eve.test@bookswap.com', '$2a$10$YourHashHere5555555555555555555555555555555555555555', 'Eve Hoang', 'MEMBER', 1, 'https://i.pravatar.cc/150?img=5', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== TEST MEMBERS ====================
INSERT INTO members (member_id, user_id, phone_number, region, address, trust_score, total_exchanges, completed_exchanges, cancelled_exchanges, is_verified, average_rating, created_at, updated_at) VALUES
('test-member-alice', 'test-user-alice-001', '0901234567', 'Quận 1, TP.HCM', '123 Nguyen Hue, Q1', 75.00, 5, 4, 1, 1, 4.5, NOW(), NOW()),
('test-member-bob', 'test-user-bob-002', '0902345678', 'Quận 3, TP.HCM', '456 Le Van Sy, Q3', 80.00, 8, 7, 1, 1, 4.8, NOW(), NOW()),
('test-member-carol', 'test-user-carol-003', '0903456789', 'Quận 7, TP.HCM', '789 Nguyen Van Linh, Q7', 65.00, 3, 2, 1, 0, 4.0, NOW(), NOW()),
('test-member-david', 'test-user-david-004', '0904567890', 'Quận 10, TP.HCM', '321 3 Thang 2, Q10', 70.00, 4, 3, 1, 1, 4.3, NOW(), NOW()),
('test-member-eve', 'test-user-eve-005', '0905678901', 'Quận Binh Thanh, TP.HCM', '654 Xo Viet Nghe Tinh, BT', 60.00, 2, 1, 1, 0, 3.8, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== ALICE'S BOOKS (Tech - Available) ====================
INSERT INTO books (book_id, owner_id, title, author, isbn, category, book_condition, description, status, cover_image_url, created_at, updated_at) VALUES
('test-book-alice-1', 'test-member-alice', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 'GOOD', 'A handbook of agile software craftsmanship', 'AVAILABLE', 'https://m.media-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg', NOW(), NOW()),
('test-book-alice-2', 'test-member-alice', 'Design Patterns', 'Gang of Four', '9780201633610', 'Technology', 'VERY_GOOD', 'Elements of reusable object-oriented software', 'AVAILABLE', 'https://m.media-amazon.com/images/I/51szD9HC9pL._SX395_BO1,204,203,200_.jpg', NOW(), NOW()),
('test-book-alice-3', 'test-member-alice', 'Refactoring', 'Martin Fowler', '9780201485677', 'Technology', 'GOOD', 'Improving the design of existing code', 'AVAILABLE', 'https://m.media-amazon.com/images/I/41LBzpPXCOL._SX376_BO1,204,203,200_.jpg', NOW(), NOW()),
('test-book-alice-4', 'test-member-alice', 'JavaScript: The Good Parts', 'Douglas Crockford', '9780596517748', 'Technology', 'FAIR', 'Unearthing the excellence in JavaScript', 'AVAILABLE', 'https://m.media-amazon.com/images/I/5131OWtQRaL._SX380_BO1,204,203,200_.jpg', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== BOB'S BOOKS (Fiction - Available) ====================
INSERT INTO books (book_id, owner_id, title, author, isbn, category, book_condition, description, status, cover_image_url, created_at, updated_at) VALUES
('test-book-bob-1', 'test-member-bob', 'The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Fiction', 'VERY_GOOD', 'The story of Jay Gatsby', 'AVAILABLE', 'https://m.media-amazon.com/images/I/41iers+HWPL._SX326_BO1,204,203,200_.jpg', NOW(), NOW()),
('test-book-bob-2', 'test-member-bob', '1984', 'George Orwell', '9780451524935', 'Fiction', 'GOOD', 'Dystopian social science fiction', 'AVAILABLE', 'https://m.media-amazon.com/images/I/41E8z5qhRnL._SX277_BO1,204,203,200_.jpg', NOW(), NOW()),
('test-book-bob-3', 'test-member-bob', 'To Kill a Mockingbird', 'Harper Lee', '9780061120084', 'Fiction', 'GOOD', 'A gripping tale of racial injustice', 'AVAILABLE', 'https://m.media-amazon.com/images/I/41J-s9fHJcL._SX277_BO1,204,203,200_.jpg', NOW(), NOW()),
('test-book-bob-4', 'test-member-bob', 'Pride and Prejudice', 'Jane Austen', '9780141439518', 'Fiction', 'VERY_GOOD', 'A romantic novel of manners', 'AVAILABLE', 'https://m.media-amazon.com/images/I/41XkAqHc9oL._SX277_BO1,204,203,200_.jpg', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== CAROL'S BOOKS (Business - Available) ====================
INSERT INTO books (book_id, owner_id, title, author, isbn, category, book_condition, description, status, cover_image_url, created_at, updated_at) VALUES
('test-book-carol-1', 'test-member-carol', 'Think and Grow Rich', 'Napoleon Hill', '9781585424337', 'Business', 'GOOD', 'The philosophy of personal achievement', 'AVAILABLE', 'https://m.media-amazon.com/images/I/41RZ+o-XakL._SX310_BO1,204,203,200_.jpg', NOW(), NOW()),
('test-book-carol-2', 'test-member-carol', 'Good to Great', 'Jim Collins', '9780066620992', 'Business', 'VERY_GOOD', 'Why some companies make the leap', 'AVAILABLE', 'https://m.media-amazon.com/images/I/41flFNwWhuL._SX326_BO1,204,203,200_.jpg', NOW(), NOW()),
('test-book-carol-3', 'test-member-carol', 'The Lean Startup', 'Eric Ries', '9780307887894', 'Business', 'GOOD', 'How constant innovation creates success', 'AVAILABLE', 'https://m.media-amazon.com/images/I/41SfwtSN+CL._SX329_BO1,204,203,200_.jpg', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== DAVID'S BOOKS (Self-Help - Available) ====================
INSERT INTO books (book_id, owner_id, title, author, isbn, category, book_condition, description, status, cover_image_url, created_at, updated_at) VALUES
('test-book-david-1', 'test-member-david', 'Atomic Habits', 'James Clear', '9780735211292', 'Self-Help', 'LIKE_NEW', 'An easy way to build good habits', 'AVAILABLE', 'https://m.media-amazon.com/images/I/41V8y6UjX5L._SX329_BO1,204,203,200_.jpg', NOW(), NOW()),
('test-book-david-2', 'test-member-david', 'The 7 Habits', 'Stephen Covey', '9781982137274', 'Self-Help', 'GOOD', 'Powerful lessons in personal change', 'AVAILABLE', 'https://m.media-amazon.com/images/I/51S4wHkO+zL._SX333_BO1,204,203,200_.jpg', NOW(), NOW()),
('test-book-david-3', 'test-member-david', 'Mindset', 'Carol Dweck', '9780345472328', 'Self-Help', 'VERY_GOOD', 'The new psychology of success', 'AVAILABLE', 'https://m.media-amazon.com/images/I/41aX-LUsKfL._SX329_BO1,204,203,200_.jpg', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== EVE'S BOOKS (Children - Available) ====================
INSERT INTO books (book_id, owner_id, title, author, isbn, category, book_condition, description, status, cover_image_url, created_at, updated_at) VALUES
('test-book-eve-1', 'test-member-eve', 'Harry Potter 1', 'J.K. Rowling', '9780439708180', 'Fiction', 'GOOD', 'The Philosophers Stone', 'AVAILABLE', 'https://m.media-amazon.com/images/I/51UoqRAxwEL._SX331_BO1,204,203,200_.jpg', NOW(), NOW()),
('test-book-eve-2', 'test-member-eve', 'The Little Prince', 'Antoine de Saint-Exupéry', '9780156012195', 'Fiction', 'VERY_GOOD', 'A timeless classic tale', 'AVAILABLE', 'https://m.media-amazon.com/images/I/41DAvGdqFNL._SX297_BO1,204,203,200_.jpg', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== LIBRARIES FOR WANTED BOOKS ====================
INSERT INTO personal_libraries (library_id, member_id, created_at, updated_at) VALUES
('test-lib-alice', 'test-member-alice', NOW(), NOW()),
('test-lib-bob', 'test-member-bob', NOW(), NOW()),
('test-lib-carol', 'test-member-carol', NOW(), NOW()),
('test-lib-david', 'test-member-david', NOW(), NOW()),
('test-lib-eve', 'test-member-eve', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== ALICE WANTS (Fiction books) ====================
INSERT INTO books_wanted (wanted_id, library_id, title, author, category, priority, notes, created_at, updated_at) VALUES
('test-want-alice-1', 'test-lib-alice', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Fiction', 'HIGH', 'Want to read classic American literature', NOW(), NOW()),
('test-want-alice-2', 'test-lib-alice', '1984', 'George Orwell', 'Fiction', 'HIGH', 'Interested in dystopian novels', NOW(), NOW()),
('test-want-alice-3', 'test-lib-alice', 'Pride and Prejudice', 'Jane Austen', 'Fiction', 'NORMAL', 'Classic romance novel', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== BOB WANTS (Tech books) ====================
INSERT INTO books_wanted (wanted_id, library_id, title, author, category, priority, notes, created_at, updated_at) VALUES
('test-want-bob-1', 'test-lib-bob', 'Clean Code', 'Robert C. Martin', 'Technology', 'URGENT', 'Need for work project', NOW(), NOW()),
('test-want-bob-2', 'test-lib-bob', 'Design Patterns', 'Gang of Four', 'Technology', 'HIGH', 'Want to improve coding skills', NOW(), NOW()),
('test-want-bob-3', 'test-lib-bob', 'Refactoring', 'Martin Fowler', 'Technology', 'NORMAL', 'Interested in code quality', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== CAROL WANTS (Self-Help books) ====================
INSERT INTO books_wanted (wanted_id, library_id, title, author, category, priority, notes, created_at, updated_at) VALUES
('test-want-carol-1', 'test-lib-carol', 'Atomic Habits', 'James Clear', 'Self-Help', 'HIGH', 'Want to build better habits', NOW(), NOW()),
('test-want-carol-2', 'test-lib-carol', 'The 7 Habits', 'Stephen Covey', 'Self-Help', 'NORMAL', 'Personal development', NOW(), NOW()),
('test-want-carol-3', 'test-lib-carol', 'Mindset', 'Carol Dweck', 'Self-Help', 'NORMAL', 'Growth mindset learning', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== DAVID WANTS (Business books) ====================
INSERT INTO books_wanted (wanted_id, library_id, title, author, category, priority, notes, created_at, updated_at) VALUES
('test-want-david-1', 'test-lib-david', 'Think and Grow Rich', 'Napoleon Hill', 'Business', 'HIGH', 'Entrepreneurship inspiration', NOW(), NOW()),
('test-want-david-2', 'test-lib-david', 'Good to Great', 'Jim Collins', 'Business', 'HIGH', 'Business strategy study', NOW(), NOW()),
('test-want-david-3', 'test-lib-david', 'The Lean Startup', 'Eric Ries', 'Business', 'NORMAL', 'Startup methodology', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== EVE WANTS (Various) ====================
INSERT INTO books_wanted (wanted_id, library_id, title, author, category, priority, notes, created_at, updated_at) VALUES
('test-want-eve-1', 'test-lib-eve', 'Clean Code', 'Robert C. Martin', 'Technology', 'LOW', 'Maybe learn programming', NOW(), NOW()),
('test-want-eve-2', 'test-lib-eve', 'Atomic Habits', 'James Clear', 'Self-Help', 'NORMAL', 'Self improvement', NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- Summary:
-- - 5 test users with verified emails
-- - Each user has 2-4 available books
-- - Each user has 2-3 wanted books
-- - Perfect matches: Alice ↔ Bob, Carol ↔ David
-- - Partial match: Eve wants from multiple people
-- =============================================

SELECT 'Test data loaded successfully!' as message,
       (SELECT COUNT(*) FROM users WHERE email LIKE '%test@bookswap.com') as test_users,
       (SELECT COUNT(*) FROM books WHERE owner_id LIKE 'test-member-%') as test_books,
       (SELECT COUNT(*) FROM books_wanted WHERE library_id LIKE 'test-lib-%') as wanted_books;
