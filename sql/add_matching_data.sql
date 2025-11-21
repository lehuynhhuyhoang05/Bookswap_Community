-- Add more books for matching suggestions
USE bookswap_db;

-- Add more books for vip user
REPLACE INTO books (book_id, owner_id, title, author, isbn, category, book_condition, description, status, created_at, updated_at)
VALUES 
('book-vip-5', '44444444-4444-4444-4444-444444444444', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Programming', 'GOOD', 'A Handbook of Agile Software Craftsmanship', 'AVAILABLE', NOW(), NOW()),
('book-vip-6', '44444444-4444-4444-4444-444444444444', 'Refactoring', 'Martin Fowler', '9780201485677', 'Programming', 'GOOD', 'Improving the Design of Existing Code', 'AVAILABLE', NOW(), NOW());

-- Add more books for disputer user
REPLACE INTO books (book_id, owner_id, title, author, isbn, category, book_condition, description, status, created_at, updated_at)
VALUES 
('book-disp-5', '55555555-5555-5555-5555-555555555555', 'Head First Design Patterns', 'Eric Freeman', '9780596007126', 'Programming', 'LIKE_NEW', 'A Brain-Friendly Guide', 'AVAILABLE', NOW(), NOW()),
('book-disp-6', '55555555-5555-5555-5555-555555555555', 'Design Patterns Explained', 'Alan Shalloway', '9780321247148', 'Programming', 'GOOD', 'A New Perspective on Object-Oriented Design', 'AVAILABLE', NOW(), NOW());

-- Add wanted books for vip (wants books that disputer has)
REPLACE INTO books_wanted (wanted_id, library_id, title, author, isbn, category, priority, notes)
VALUES 
('wanted-vip-3', 'lib-vip-user', 'Head First Design Patterns', 'Eric Freeman', '9780596007126', 'Programming', 3, 'Want to learn design patterns'),
('wanted-vip-4', 'lib-vip-user', 'Design Patterns Explained', 'Alan Shalloway', '9780321247148', 'Programming', 2, 'Alternative design patterns book');

-- Add wanted books for disputer (wants books that vip has)
REPLACE INTO books_wanted (wanted_id, library_id, title, author, isbn, category, priority, notes)
VALUES 
('wanted-disp-3', 'lib-disputer', 'Clean Code', 'Robert C. Martin', '9780132350884', 'Programming', 3, 'Must read for clean coding'),
('wanted-disp-4', 'lib-disputer', 'Refactoring', 'Martin Fowler', '9780201485677', 'Programming', 3, 'Want to improve refactoring skills');

-- Show summary
SELECT 'VIP Books' as Category, COUNT(*) as Count FROM books WHERE owner_id = '44444444-4444-4444-4444-444444444444'
UNION ALL
SELECT 'Disputer Books', COUNT(*) FROM books WHERE owner_id = '55555555-5555-5555-5555-555555555555'
UNION ALL
SELECT 'VIP Wanted', COUNT(*) FROM books_wanted WHERE library_id = 'lib-vip-user'
UNION ALL
SELECT 'Disputer Wanted', COUNT(*) FROM books_wanted WHERE library_id = 'lib-disputer';
