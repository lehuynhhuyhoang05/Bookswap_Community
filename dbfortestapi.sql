-- Adminer 5.4.1 MySQL 8.0.44 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS `bookswap_db`;
CREATE DATABASE `bookswap_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `bookswap_db`;

DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `admin_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_level` int NOT NULL DEFAULT '1',
  `permissions` json DEFAULT NULL,
  `admin_since` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_admins_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `admins` (`admin_id`, `user_id`, `admin_level`, `permissions`, `admin_since`, `created_at`) VALUES
('6de6a9b9-ba22-11f0-aca9-daa9428e548e',	'user-005',	1,	'{\"all\": true}',	'2025-10-31 07:11:30',	'2025-11-05 08:35:48'),
('admin-uuid-001',	'admin-uuid-001',	9,	'[\"ALL\"]',	'2025-10-30 12:48:27',	'2025-10-30 12:48:27');

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `log_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `fk_audit_admin` (`admin_id`),
  KEY `idx_audit_logs_created` (`created_at` DESC),
  CONSTRAINT `fk_audit_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`admin_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log tất cả hành động của admin để audit trail';

INSERT INTO `audit_logs` (`log_id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `created_at`) VALUES
('2b4c864d-8a70-4b69-bd16-5ba8f32fc5e8',	'admin-uuid-001',	'UNLOCK_USER',	'USER',	'88a84968-25da-4a89-bfc8-71d2cb0abfba',	'{\"status\": \"LOCKED\"}',	'{\"status\": \"ACTIVE\"}',	'N/A',	NULL,	'2025-11-05 07:31:58'),
('445f8972-77b7-4498-969a-354174475474',	'admin-uuid-001',	'CANCEL_EXCHANGE',	'EXCHANGE',	'17d92bda-da86-4acd-a700-16e3f3245dd0',	'{\"status\": \"PENDING\"}',	'{\"status\": \"CANCELLED\"}',	'N/A',	NULL,	'2025-11-05 07:54:58'),
('637f83da-7c69-4165-8622-8665f2f2a278',	'admin-uuid-001',	'REMOVE_BOOK',	'BOOK',	'test-book-charlie-1',	'{\"status\": \"AVAILABLE\"}',	'{\"status\": \"REMOVED\"}',	'N/A',	NULL,	'2025-11-05 07:24:57'),
('692fafb5-9bb6-4451-ae0d-20eceeb1d7df',	'admin-uuid-001',	'UPDATE_ROLE',	'USER',	'user-005',	'{\"role\": \"MEMBER\"}',	'{\"role\": \"ADMIN\"}',	'N/A',	NULL,	'2025-11-05 07:34:37'),
('6e1d1b35-d7cc-4907-85b0-b233c4ec0d1f',	'admin-uuid-001',	'DELETE_USER',	'USER',	'user-005',	'{\"status\": \"ACTIVE\"}',	'{\"status\": \"DELETED\"}',	'N/A',	NULL,	'2025-11-05 07:30:32'),
('8062c886-ce26-46a4-9566-434c8b5087a5',	'admin-uuid-001',	'REMOVE_REVIEW',	'REVIEW',	'914e7c7b-683b-43b3-93f4-ff8ed74391a3',	'{\"review\": {\"rating\": 4, \"comment\": \"Thanks, updated comment.\", \"created_at\": \"2025-11-04T02:55:11.000Z\", \"updated_at\": \"2025-11-04T02:55:30.000Z\", \"exchange_id\": \"b19085de-d6bc-443d-a5ed-8a3508918df0\", \"reviewee_id\": \"f8392a1a-b5a5-490a-9512-6b3f923dee41\", \"reviewer_id\": \"test-member-alice\", \"trust_score_impact\": \"0.05\"}}',	NULL,	'N/A',	NULL,	'2025-11-05 07:25:43'),
('989b7373-a605-4466-84e1-c154d34bfe7f',	'admin-uuid-001',	'LOCK_USER',	'USER',	'88a84968-25da-4a89-bfc8-71d2cb0abfba',	'{\"status\": \"ACTIVE\"}',	'{\"status\": \"LOCKED\"}',	'N/A',	NULL,	'2025-11-05 07:31:32'),
('b5054e9c-feda-46ad-ae9e-dfd339912659',	'admin-uuid-001',	'RESOLVE_REPORT',	'REPORT',	'070e670a-619b-4434-b9cd-65a8045315fa',	'{\"status\": \"PENDING\"}',	'{\"status\": \"RESOLVED\", \"resolution\": \"Đã xử lý và xóa nội dung vi phạm. Removed inappropriate book and warned user.\"}',	'N/A',	NULL,	'2025-11-05 07:43:05'),
('e5fda042-63f6-47f6-a39a-663192da9a0b',	'admin-uuid-001',	'LOCK_USER',	'USER',	'user-004',	'{\"status\": \"ACTIVE\"}',	'{\"status\": \"LOCKED\"}',	'N/A',	NULL,	'2025-11-05 07:30:45');

DROP TABLE IF EXISTS `blocked_members`;
CREATE TABLE `blocked_members` (
  `block_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `blocked_by_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `blocked_member_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`block_id`),
  UNIQUE KEY `unique_block` (`blocked_by_id`,`blocked_member_id`),
  KEY `fk_blocked_member` (`blocked_member_id`),
  CONSTRAINT `fk_blocked_by` FOREIGN KEY (`blocked_by_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_blocked_member` FOREIGN KEY (`blocked_member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `book_match_pairs`;
CREATE TABLE `book_match_pairs` (
  `pair_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `suggestion_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `book_a_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `book_b_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `match_reason` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `match_score` decimal(4,3) NOT NULL DEFAULT '0.000',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pair_direction` enum('THEY_WANT_FROM_ME','I_WANT_FROM_THEM') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'THEY_WANT_FROM_ME',
  PRIMARY KEY (`pair_id`),
  KEY `fk_pairs_suggestion` (`suggestion_id`),
  KEY `fk_pairs_book_a` (`book_a_id`),
  KEY `fk_pairs_book_b` (`book_b_id`),
  CONSTRAINT `fk_pairs_book_a` FOREIGN KEY (`book_a_id`) REFERENCES `books` (`book_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pairs_book_b` FOREIGN KEY (`book_b_id`) REFERENCES `books` (`book_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pairs_suggestion` FOREIGN KEY (`suggestion_id`) REFERENCES `exchange_suggestions` (`suggestion_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `book_match_pairs` (`pair_id`, `suggestion_id`, `book_a_id`, `book_b_id`, `match_reason`, `match_score`, `created_at`, `pair_direction`) VALUES
('0aec8dfe-dec3-4d5a-90b2-7481721beb1e',	'efd13232-62f8-4086-b8f1-18e0b28c5bda',	'test-book-alice-2',	NULL,	'Exact title match, Same author, Category: Programming, High priority want',	0.900,	'2025-11-02 06:54:46',	'THEY_WANT_FROM_ME'),
('10ebd45c-5b9f-4e2b-8c8c-f15571f64016',	'efd13232-62f8-4086-b8f1-18e0b28c5bda',	'test-book-alice-1',	NULL,	'Exact title match, Same author, Category: Programming, High priority want, Excellent condition',	0.950,	'2025-11-02 06:54:46',	'THEY_WANT_FROM_ME'),
('4cebc820-f1dc-4123-8fc4-79c04fdce049',	'46967284-d330-4348-9cb8-7a873f3a7da2',	'seed-book-diego-legacy',	NULL,	'Exact title match, Same author, Category: Programming, High priority want',	0.900,	'2025-11-02 14:27:24',	'THEY_WANT_FROM_ME'),
('5d8be251-8e38-4a29-a64c-8149512c50c5',	'46967284-d330-4348-9cb8-7a873f3a7da2',	NULL,	'seed-book-bella-designit',	'Exact title match, Same author, Category: Programming, High priority want, Excellent condition',	0.950,	'2025-11-02 14:27:24',	'I_WANT_FROM_THEM'),
('8ed78bf4-947e-4f90-9252-65a50ebd1b21',	'2de3ee1e-61df-4112-ad05-37b420529d29',	NULL,	'test-book-alice-1',	'Exact title match, Same author, Category: Programming, High priority want, Excellent condition',	0.950,	'2025-11-02 10:43:48',	'I_WANT_FROM_THEM'),
('9eee8e0a-bd5c-4f55-826c-324ac7e7c504',	'efd13232-62f8-4086-b8f1-18e0b28c5bda',	NULL,	'test-book-bob-1',	'Exact title match, Same author, Category: Programming, High priority want, Excellent condition',	0.950,	'2025-11-02 06:54:46',	'I_WANT_FROM_THEM'),
('d4b79fe0-4c31-4873-a2e6-f02c61741e83',	'2de3ee1e-61df-4112-ad05-37b420529d29',	'test-book-bob-2',	NULL,	'Exact title match, Same author, Category: Programming, High priority want',	0.900,	'2025-11-02 10:43:48',	'THEY_WANT_FROM_ME'),
('d5c88aac-e2e9-466e-a507-31a02e877b9c',	'2de3ee1e-61df-4112-ad05-37b420529d29',	'test-book-bob-1',	NULL,	'Exact title match, Same author, Category: Programming, High priority want, Excellent condition',	0.950,	'2025-11-02 10:43:48',	'THEY_WANT_FROM_ME');

DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `book_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `author` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isbn` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_books_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `publisher` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `language` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'vi',
  `page_count` int DEFAULT NULL,
  `cover_image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `book_condition` enum('LIKE_NEW','GOOD','FAIR','POOR') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('AVAILABLE','EXCHANGING','REMOVED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AVAILABLE',
  `views` int NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`book_id`),
  KEY `idx_books_owner_status` (`owner_id`,`status`),
  KEY `idx_books_isbn` (`isbn`),
  KEY `idx_books_category` (`category`),
  KEY `idx_books_status` (`status`),
  KEY `idx_books_category_status` (`category`,`status`),
  KEY `idx_books_owner_status_deleted` (`owner_id`,`status`,`deleted_at`),
  KEY `idx_books_title_lower` ((lower(`title`))),
  KEY `idx_books_author_lower` ((lower(`author`))),
  FULLTEXT KEY `ft_books_search` (`title`,`author`,`description`),
  CONSTRAINT `fk_books_owner` FOREIGN KEY (`owner_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `books` (`book_id`, `owner_id`, `title`, `author`, `isbn`, `google_books_id`, `publisher`, `publish_date`, `description`, `category`, `language`, `page_count`, `cover_image_url`, `book_condition`, `status`, `views`, `deleted_at`, `created_at`, `updated_at`) VALUES
('08ee8f90-a04f-40e9-9b7c-e5ced59818bd',	'test-member-alice',	'Refactoring',	'Martin Fowler',	'9780201485677',	NULL,	'Addison-Wesley',	'1999-07-08',	'Improving the design of existing code',	'Programming',	'en',	464,	'https://example.com/refactoring.jpg',	'GOOD',	'REMOVED',	3,	'2025-11-03 15:45:02',	'2025-11-02 08:39:09',	'2025-11-03 08:45:01'),
('15670a15-af04-4558-87b3-ced929e017e7',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'a',	'a',	'a',	NULL,	NULL,	NULL,	'a',	'a',	'vi',	NULL,	NULL,	'LIKE_NEW',	'REMOVED',	1,	'2025-11-02 16:51:13',	'2025-11-02 09:51:06',	'2025-11-02 09:51:13'),
('2f3b9a50-2b6a-4d4a-9d4a-2c6a7b8c9d0e',	'test-member-alice',	'Clean Architecture',	'Robert C. Martin',	'9780134494166',	NULL,	NULL,	NULL,	NULL,	'Programming',	'vi',	NULL,	NULL,	'GOOD',	'REMOVED',	1,	'2025-11-03 15:44:32',	'2025-11-02 07:26:50',	'2025-11-03 08:44:31'),
('74218fc2-b633-11f0-8ac4-a635d8fd57db',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'The Pragmatic Programmer',	'Andrew Hunt',	'9780201616224',	NULL,	NULL,	NULL,	NULL,	'Programming',	'vi',	NULL,	NULL,	NULL,	'EXCHANGING',	22,	NULL,	'2025-10-31 08:27:35',	'2025-11-03 09:57:08'),
('8973ae20-4ffb-4960-b59b-c440a52c0a8a',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'Clean Code',	'Robert C. Martin',	'9780132350884',	'string',	'Prentice Hall',	'2008-08-01',	'A handbook of agile software craftsmanship',	'Programming',	'en',	464,	'https://example.com/cover.jpg',	'GOOD',	'EXCHANGING',	0,	NULL,	'2025-10-30 15:55:52',	'2025-11-02 07:27:07'),
('9ed5bce7-c186-4129-b8e2-7eb5ef21fd8a',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'a',	'a',	'a12322322',	NULL,	NULL,	NULL,	'a',	'Fiction',	'vi',	NULL,	NULL,	NULL,	'EXCHANGING',	0,	NULL,	'2025-11-03 09:16:33',	'2025-11-03 09:16:44'),
('book-009',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'1984',	'George Orwell',	'9780451524935',	NULL,	NULL,	NULL,	NULL,	'Fiction',	'en',	328,	NULL,	'LIKE_NEW',	'REMOVED',	80,	NULL,	'2025-10-31 07:11:30',	'2025-11-05 07:16:24'),
('book-010',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'To Kill a Mockingbird',	'Harper Lee',	'9780061120084',	NULL,	NULL,	NULL,	NULL,	'Fiction',	'en',	324,	NULL,	'GOOD',	'AVAILABLE',	58,	NULL,	'2025-10-31 07:11:30',	'2025-11-03 09:56:41'),
('book-011',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'Guns, Germs, and Steel',	'Jared Diamond',	'9780393317558',	NULL,	NULL,	NULL,	NULL,	'History',	'en',	498,	NULL,	'FAIR',	'AVAILABLE',	49,	NULL,	'2025-10-31 07:11:30',	'2025-11-03 09:56:41'),
('book-012',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'A Brief History of Time',	'Stephen Hawking',	'9780553380163',	NULL,	NULL,	NULL,	NULL,	'Science',	'en',	256,	NULL,	'GOOD',	'AVAILABLE',	71,	NULL,	'2025-10-31 07:11:30',	'2025-11-03 09:56:41'),
('book-013',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'The Great Gatsby',	'F. Scott Fitzgerald',	'9780743273565',	NULL,	NULL,	NULL,	NULL,	'Fiction',	'en',	180,	NULL,	'LIKE_NEW',	'AVAILABLE',	91,	NULL,	'2025-10-31 07:11:30',	'2025-11-03 09:56:41'),
('book-014',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'Pride and Prejudice',	'Jane Austen',	'9780141439518',	NULL,	NULL,	NULL,	NULL,	'Fiction',	'en',	432,	NULL,	'GOOD',	'AVAILABLE',	52,	NULL,	'2025-10-31 07:11:30',	'2025-11-03 09:56:41'),
('book-uuid-2',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'The Pragmatic Programmer',	'Andrew Hunt',	'9780201616224',	NULL,	NULL,	NULL,	NULL,	'Programming',	'vi',	NULL,	NULL,	NULL,	'AVAILABLE',	2,	NULL,	'2025-10-31 08:22:34',	'2025-11-03 09:56:41'),
('ceb19e64-d513-467c-82d4-a43940534858',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'string',	'string',	'string',	'string',	'string',	'2025-10-30',	'string',	'string',	'string',	0,	'string',	'LIKE_NEW',	'REMOVED',	2,	'2025-10-30 22:55:04',	'2025-10-30 15:52:53',	'2025-10-30 15:55:04'),
('e4bb24df-4011-4855-85da-88fffbba982e',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'Clean Code',	'Robert C. Martin',	'9780132350884',	'string',	'Prentice Hall',	'2008-08-01',	'A handbook of agile software craftsmanship',	'Programming',	'en',	464,	'https://example.com/cover.jpg',	'GOOD',	'EXCHANGING',	0,	NULL,	'2025-10-31 05:11:24',	'2025-10-31 08:31:29'),
('e89b8061-afee-4085-97d2-4c918b18a01a',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'Clean Code',	'Robert C. Martin',	'9780132350884',	'zyTCAlFPjgYC',	'Prentice Hall',	'2008-08-01',	'A handbook of agile software craftsmanship',	'Programming',	'en',	464,	'https://example.com/cover.jpg',	'GOOD',	'EXCHANGING',	0,	NULL,	'2025-11-02 08:26:27',	'2025-11-02 09:12:31'),
('ea64f1be-dedf-4f0d-826b-ea441caaf420',	'test-member-alice',	'clean',	'a',	'23243244',	NULL,	NULL,	NULL,	'a',	'Programming',	'vi',	NULL,	NULL,	NULL,	'EXCHANGING',	4,	NULL,	'2025-11-03 08:50:53',	'2025-11-03 09:09:41'),
('eff18dde-7ba0-4e41-9e3b-d93c381cf3dd',	'test-member-alice',	'CLEAN BY DESIGN',	'Bohdan Kolomijez',	NULL,	NULL,	NULL,	NULL,	'A practical how-to guide on setting up an EVS program for a medical facility. Many of the policies can also apply to commercial, industrial, and office settings. It contains amazing feats, secrets, charts, and tables to help the reader make significant improvements in their programs. These are supported by real-life stories and examples that show readers what to do and more importantly what not to do. The book\'s policies will help provide an operations manual that even the most cynical of insurance companies will like. What is wrong with saving money on liability insurance premiums?',	'Medical',	'vi',	NULL,	NULL,	NULL,	'EXCHANGING',	0,	NULL,	'2025-11-03 09:23:22',	'2025-11-03 09:57:08'),
('seed-book-bella-ca',	'seed-member-bella',	'Clean Architecture',	'Robert C. Martin',	'9780134494166',	NULL,	'Prentice Hall',	'2017-09-20',	'A Craftsman\'s Guide to Software Structure and Design',	'Programming',	'en',	NULL,	NULL,	'LIKE_NEW',	'EXCHANGING',	0,	NULL,	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('seed-book-bella-designit',	'seed-member-bella',	'Design It!',	'Michael Keeling',	'9781680502091',	NULL,	'Pragmatic Bookshelf',	'2017-05-01',	'From programmer to software architect',	'Programming',	'en',	NULL,	NULL,	'LIKE_NEW',	'AVAILABLE',	4,	NULL,	'2025-11-02 14:10:19',	'2025-11-03 09:13:07'),
('seed-book-diego-legacy',	'seed-member-diego',	'Working Effectively with Legacy Code',	'Michael Feathers',	'9780131177055',	NULL,	'Prentice Hall',	'2004-09-30',	'Techniques for working with legacy code',	'Programming',	'en',	NULL,	NULL,	'GOOD',	'AVAILABLE',	10,	NULL,	'2025-11-02 14:10:19',	'2025-11-03 10:36:02'),
('seed-book-diego-pp',	'seed-member-diego',	'The Pragmatic Programmer',	'Andrew Hunt',	'9780201616224',	NULL,	'Addison-Wesley',	'1999-10-30',	'Classic software craftsmanship',	'Programming',	'en',	NULL,	NULL,	'LIKE_NEW',	'REMOVED',	12,	NULL,	'2025-11-02 14:10:19',	'2025-11-05 07:16:53'),
('seed-book-nam-clrs',	'seed-member-nam',	'Introduction to Algorithms',	'Thomas H. Cormen',	'9780262033848',	NULL,	'MIT Press',	'2009-07-31',	'CLRS classic',	'Programming',	'en',	NULL,	NULL,	'GOOD',	'EXCHANGING',	10,	NULL,	'2025-11-02 14:10:19',	'2025-11-03 09:16:44'),
('test-book-alice-1',	'test-member-alice',	'Clean Code',	'Robert C. Martin',	'9780132350884',	NULL,	NULL,	NULL,	NULL,	'Programming',	'vi',	NULL,	NULL,	'LIKE_NEW',	'REMOVED',	1,	'2025-11-03 15:44:36',	'2025-11-02 06:32:16',	'2025-11-03 08:44:36'),
('test-book-alice-2',	'test-member-alice',	'The Pragmatic Programmer',	'Andy Hunt',	'9780135957059',	NULL,	NULL,	NULL,	NULL,	'Programming',	'vi',	NULL,	NULL,	'GOOD',	'REMOVED',	1,	'2025-11-03 15:44:41',	'2025-11-02 06:32:16',	'2025-11-03 08:44:40'),
('test-book-alice-3',	'test-member-alice',	'Head First Design Patterns',	'Eric Freeman',	'9780596007126',	NULL,	NULL,	NULL,	NULL,	'Programming',	'vi',	NULL,	NULL,	'FAIR',	'REMOVED',	1,	'2025-11-03 15:44:59',	'2025-11-02 06:32:16',	'2025-11-03 08:44:59'),
('test-book-bob-1',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'Design Patterns',	'Gang of Four',	'9780201633610',	NULL,	NULL,	NULL,	NULL,	'Programming',	'vi',	NULL,	NULL,	'LIKE_NEW',	'EXCHANGING',	0,	NULL,	'2025-11-02 06:32:16',	'2025-11-03 09:13:20'),
('test-book-bob-2',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'Refactoring',	'Martin Fowler',	'9780201485677',	NULL,	NULL,	NULL,	NULL,	'Programming',	'vi',	NULL,	NULL,	'GOOD',	'EXCHANGING',	10,	NULL,	'2025-11-02 06:32:16',	'2025-11-03 09:09:41'),
('test-book-bob-3',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'Domain-Driven Design',	'Eric Evans',	'9780321125217',	NULL,	NULL,	NULL,	NULL,	'Programming',	'vi',	NULL,	NULL,	'LIKE_NEW',	'EXCHANGING',	4,	NULL,	'2025-11-02 06:32:16',	'2025-11-03 09:13:48'),
('test-book-charlie-1',	'test-member-charlie',	'JavaScript: The Good Parts',	'Douglas Crockford',	'9780596517748',	NULL,	NULL,	NULL,	NULL,	'Programming',	'vi',	NULL,	NULL,	'GOOD',	'REMOVED',	2,	NULL,	'2025-11-02 06:32:16',	'2025-11-05 07:24:57'),
('test-book-charlie-2',	'test-member-charlie',	'You Don\'t Know JS',	'Kyle Simpson',	'9781491924464',	NULL,	NULL,	NULL,	NULL,	'Programming',	'vi',	NULL,	NULL,	'LIKE_NEW',	'EXCHANGING',	2,	NULL,	'2025-11-02 06:32:16',	'2025-11-03 09:13:48');

DROP TABLE IF EXISTS `books_wanted`;
CREATE TABLE `books_wanted` (
  `wanted_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `library_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `author` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isbn` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_books_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `priority` int NOT NULL DEFAULT '0',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `added_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`wanted_id`),
  UNIQUE KEY `uq_books_wanted` (`library_id`,`isbn`),
  KEY `idx_wanted_library` (`library_id`),
  KEY `idx_wanted_library_priority` (`library_id`,`priority` DESC),
  KEY `idx_wanted_category` (`category`),
  KEY `idx_wanted_title_lower` ((lower(`title`))),
  KEY `idx_wanted_author_lower` ((lower(`author`))),
  FULLTEXT KEY `ft_wanted_search` (`title`,`author`),
  CONSTRAINT `fk_wanted_library` FOREIGN KEY (`library_id`) REFERENCES `personal_libraries` (`library_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `books_wanted` (`wanted_id`, `library_id`, `title`, `author`, `isbn`, `google_books_id`, `category`, `priority`, `notes`, `added_at`, `created_at`) VALUES
('150c45b9-1937-433a-bf57-ce146a31c9c2',	'test-lib-bob',	'The Pragmatic Programmer',	'Andrew Hunt',	NULL,	NULL,	NULL,	9,	'Really want this book for collection',	'2025-11-02 10:27:48',	'2025-11-02 10:27:48'),
('3065b300-1c84-49cb-9877-227bffffaa95',	'test-lib-bob',	'The Pragmatic Programmer',	'Andrew Hunt',	NULL,	NULL,	NULL,	9,	'Really want this book for collection',	'2025-11-02 10:34:49',	'2025-11-02 10:34:49'),
('754514b8-e7a6-4828-8a04-58169de5c6ca',	'test-lib-bob',	'The Pragmatic Programmer',	'Andrew Hunt',	NULL,	NULL,	NULL,	9,	'Really want this book for collection',	'2025-11-02 10:37:26',	'2025-11-02 10:37:26'),
('929db379-fce3-4214-aca7-21545b2802ac',	'9c5f1497-c48a-47fa-8845-0a63c901b790',	'Clean1 Code',	'Robert C. Martin',	NULL,	'bCmVDwAAQBAJ',	'Programming',	9,	'Looking for hardcover edition in excellent condition',	'2025-11-16 19:38:49',	'2025-11-16 19:38:49'),
('9a4df198-38b6-45f6-a91b-d63773f98efa',	'9c5f1497-c48a-47fa-8845-0a63c901b790',	'Clean4 Code',	'Robert C. Martin',	NULL,	'bCmVDwAAQBAJ',	'Programming',	9,	'Looking for hardcover edition in excellent condition',	'2025-11-16 19:39:11',	'2025-11-16 19:39:11'),
('a2a33050-c41f-4ed3-bcc5-3f20f13fa879',	'test-lib-bob',	'Fire',	'Martin',	'2222222222',	NULL,	'fantasy',	9,	'',	'2025-11-02 10:03:54',	'2025-11-02 10:03:54'),
('c79572cb-1412-4f60-a9e0-b1671815370a',	'9c5f1497-c48a-47fa-8845-0a63c901b790',	'Clean2 Code',	'Robert C. Martin',	NULL,	'bCmVDwAAQBAJ',	'Programming',	9,	'Looking for hardcover edition in excellent condition',	'2025-11-16 19:38:57',	'2025-11-16 19:38:57'),
('cfd62b62-7966-4f91-9f3d-abb6a560d53c',	'9c5f1497-c48a-47fa-8845-0a63c901b790',	'Clean6 Code',	'Robert C. Martin',	NULL,	'bCmVDwAAQBAJ',	'Programming',	9,	'Looking for hardcover edition in excellent condition',	'2025-11-16 19:39:17',	'2025-11-16 19:39:17'),
('d1fc5362-16ff-435d-b470-93bd0ef8d142',	'test-lib-bob',	'The Pragmatic Programmer',	'Andrew Hunt',	NULL,	NULL,	NULL,	9,	'Really want this book for collection',	'2025-11-02 10:43:36',	'2025-11-02 10:43:36'),
('d4d31bea-7549-4a1a-822e-1a2009f6cded',	'test-lib-bob',	'The Pragmatic Programmer',	'Andrew Hunt',	NULL,	NULL,	NULL,	9,	'Really want this book for collection',	'2025-11-02 10:27:39',	'2025-11-02 10:27:39'),
('da66878c-dd22-4ad7-8dba-dd7f88baeda0',	'9c5f1497-c48a-47fa-8845-0a63c901b790',	'Clean3 Code',	'Robert C. Martin',	NULL,	'bCmVDwAAQBAJ',	'Programming',	9,	'Looking for hardcover edition in excellent condition',	'2025-11-16 19:39:02',	'2025-11-16 19:39:02'),
('f38b8a38-4ca6-41a5-a2d5-c190f5cb5eb3',	'9c5f1497-c48a-47fa-8845-0a63c901b790',	'Clean Code',	'Robert C. Martin',	'9780132350884',	'bCmVDwAAQBAJ',	'Programming',	9,	'Looking for hardcover edition in excellent condition',	'2025-11-16 19:38:33',	'2025-11-16 19:38:33'),
('seed-want-bella-1',	'seed-lib-bella',	'Working Effectively with Legacy Code',	'Michael Feathers',	NULL,	NULL,	'Programming',	7,	'Looks great',	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('seed-want-bella-2',	'seed-lib-bella',	'Software Engineering at Google',	'Titus Winters',	NULL,	NULL,	'Programming',	5,	'Noise item',	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('seed-want-diego-1',	'seed-lib-diego',	'Design It!',	'Michael Keeling',	NULL,	NULL,	'Programming',	8,	'High priority',	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('seed-want-nam-1',	'seed-lib-nam',	'Clean Architecture',	'Robert C. Martin',	NULL,	NULL,	'Programming',	9,	'Expect no available copy',	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('test-want-alice-1',	'test-lib-alice',	'Design Patterns',	'Gang of Four',	NULL,	NULL,	'Programming',	9,	NULL,	'2025-11-02 06:32:16',	'2025-11-02 06:32:16'),
('test-want-alice-2',	'test-lib-alice',	'Refactoring',	'Martin Fowler',	NULL,	NULL,	'Programming',	8,	NULL,	'2025-11-02 06:32:16',	'2025-11-02 06:32:16'),
('test-want-bob-2',	'test-lib-bob',	'The Pragmatic Programmer',	'Andy Hunt',	NULL,	NULL,	'Programming',	7,	NULL,	'2025-11-02 06:32:16',	'2025-11-02 06:32:16');

DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `conversation_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exchange_request_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_a_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_b_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_messages` int NOT NULL DEFAULT '0',
  `last_message_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_message_preview` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`conversation_id`),
  UNIQUE KEY `exchange_request_id` (`exchange_request_id`),
  KEY `fk_conversations_member_a` (`member_a_id`),
  KEY `fk_conversations_member_b` (`member_b_id`),
  CONSTRAINT `fk_conversations_member_a` FOREIGN KEY (`member_a_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_conversations_member_b` FOREIGN KEY (`member_b_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_conversations_request` FOREIGN KEY (`exchange_request_id`) REFERENCES `exchange_requests` (`request_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `conversations` (`conversation_id`, `exchange_request_id`, `member_a_id`, `member_b_id`, `total_messages`, `last_message_at`, `created_at`, `last_message_preview`) VALUES
('00190e89-4aee-4ef7-8e09-6127427550f6',	'2017eacd-a88b-4406-af60-b278b6ab0bd0',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	8,	'2025-11-03 20:31:44',	'2025-11-03 07:21:01',	NULL);

DROP TABLE IF EXISTS `email_verification_tokens`;
CREATE TABLE `email_verification_tokens` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_used` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  UNIQUE KEY `uq_email_verif_token` (`token`),
  KEY `idx_evt_user_expires` (`user_id`,`expires_at`),
  KEY `idx_email_verif_user` (`user_id`),
  CONSTRAINT `fk_evt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `email_verification_tokens` (`id`, `token`, `user_id`, `expires_at`, `used`, `created_at`, `is_used`) VALUES
('0810d5ae-f622-4d16-acf7-66d17b93475d',	'a3d950263db4e71da15fa276cbb4e9d78f9018333db097ea4c451bafb29cb97e',	'8bf98e65-e35d-41b3-9692-a9fbe96658d4',	'2025-11-13 07:12:58',	0,	'2025-11-12 07:12:57',	0),
('17bb1568-7361-4d3a-8bf2-8dcc13676618',	'57604cf96d4e1f9e4d0fbc2288dc260594ef3d437a99d42353587abe9b04c3d4',	'c43c9948-4850-43af-a034-9fff4d9202ac',	'2025-11-13 06:52:01',	0,	'2025-11-12 06:52:00',	0),
('40e268fb-d3b9-43fc-be83-0bd841dc1da5',	'40451ea3ebef041ece23ad7cefe2d66313f63045c684ec98dc9724bd38768001',	'416b9715-3f37-439a-b4c1-1a2770039b6c',	'2025-11-13 06:55:57',	0,	'2025-11-12 06:55:56',	0),
('51e09426-c5b6-49cd-b5bf-7e138a176a0e',	'b00659e556e8f29afd2990f28532602a11dbdced1e55fd6125d6328f7fa655cc',	'88a84968-25da-4a89-bfc8-71d2cb0abfba',	'2025-10-31 22:25:13',	0,	'2025-10-30 15:25:12',	0),
('6a85af14-0410-4c75-a27c-ed5f62f034e0',	'acb17539566def02f46218ab55451c5331148f426a032e63fa4826d153a3d5d2',	'876cace3-4676-4cc3-9c72-128d93da2e4d',	'2025-11-13 10:35:06',	0,	'2025-11-12 10:35:05',	1),
('7f920808-9aec-4052-bd80-86ab099c6192',	'b7a03ea23576b8d59efca9d1aa367c215703865d511a6107eff34300724fdf7a',	'1d712a14-8971-47ac-87cb-3123e0caa35c',	'2025-11-13 07:08:36',	0,	'2025-11-12 07:08:36',	0),
('8313cd9d-e6c6-4108-a52e-bfd2995d7da1',	'4a2556c216b07010f62232499ee263966342386bbb7df72e47b8938e96acb8f0',	'b2b805e6-f769-4714-b3b8-104b52e6cd39',	'2025-11-13 07:09:52',	0,	'2025-11-12 07:09:51',	0),
('bcda763b-5ddf-4f6c-8fbd-116b68a751e9',	'b9c04e8769256992faa864197cf6a69bbb831aea57ea302e04e3d8d1a4aa992a',	'd2a2d7e2-b139-4ee8-a028-89de6b7d6a6b',	'2025-11-13 07:04:08',	0,	'2025-11-12 07:04:07',	0),
('c916f7c1-1e6c-4b84-936a-86ba893ffbdd',	'1a437393ab85a0d67742149d50fcddb91b496f589cce029ad063e2006d6860e7',	'4e60dac4-99a6-4e29-b6a8-ac2ffe676a15',	'2025-11-13 06:57:11',	0,	'2025-11-12 06:57:11',	0),
('f1d9d0f5-c2ca-4986-a891-9dc2e2960021',	'7325686bc7f73ce35b39d25adba882017832fe39c0f3e019d52d36416741e41d',	'53c5f663-a5b7-4e11-a1f2-23d82e6f4c0d',	'2025-11-13 07:06:43',	0,	'2025-11-12 07:06:43',	0);

DROP TABLE IF EXISTS `exchange_books`;
CREATE TABLE `exchange_books` (
  `exchange_book_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exchange_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `book_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `from_member_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `to_member_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exchange_order` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`exchange_book_id`),
  UNIQUE KEY `uq_exchange_books` (`exchange_id`,`book_id`),
  KEY `fk_exbooks_book` (`book_id`),
  KEY `fk_exbooks_from` (`from_member_id`),
  KEY `fk_exbooks_to` (`to_member_id`),
  CONSTRAINT `fk_exbooks_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exbooks_exchange` FOREIGN KEY (`exchange_id`) REFERENCES `exchanges` (`exchange_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exbooks_from` FOREIGN KEY (`from_member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exbooks_to` FOREIGN KEY (`to_member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `exchange_books` (`exchange_book_id`, `exchange_id`, `book_id`, `from_member_id`, `to_member_id`, `exchange_order`, `created_at`) VALUES
('204f6a75-a460-4d56-968b-2caf2ba7010d',	'c0a11a94-28fa-4204-ac3b-5cb781c8bb20',	'8973ae20-4ffb-4960-b59b-c440a52c0a8a',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'test-member-alice',	NULL,	'2025-11-03 07:18:38'),
('2a25bf2d-23c0-4a51-9abf-f43f15beb720',	'b19085de-d6bc-443d-a5ed-8a3508918df0',	'eff18dde-7ba0-4e41-9e3b-d93c381cf3dd',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	NULL,	'2025-11-03 09:57:50'),
('779acfaf-fbdd-4e4e-819a-aefe4154b855',	'b19085de-d6bc-443d-a5ed-8a3508918df0',	'74218fc2-b633-11f0-8ac4-a635d8fd57db',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'test-member-alice',	NULL,	'2025-11-03 09:57:50'),
('7f4372b6-10a8-4cb9-89dd-7ebc86c4ecdb',	'c0a11a94-28fa-4204-ac3b-5cb781c8bb20',	'2f3b9a50-2b6a-4d4a-9d4a-2c6a7b8c9d0e',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	NULL,	'2025-11-03 07:18:37'),
('b73a3a41-61a6-4598-8936-fb693ce89442',	'17d92bda-da86-4acd-a700-16e3f3245dd0',	'test-book-bob-2',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'test-member-alice',	NULL,	'2025-11-03 09:09:59'),
('d427b731-4724-451f-ad39-43e2b098f767',	'0b1f1f15-b7a0-4eec-9f38-3749d01e4b58',	'e89b8061-afee-4085-97d2-4c918b18a01a',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'test-member-alice',	NULL,	'2025-11-02 09:22:37'),
('d9a67bb5-8a2f-4ab1-9210-038c341b332a',	'17d92bda-da86-4acd-a700-16e3f3245dd0',	'ea64f1be-dedf-4f0d-826b-ea441caaf420',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	NULL,	'2025-11-03 09:09:59'),
('f3ed52a7-85b5-4ca6-8549-00e4a8b3c2d0',	'0b1f1f15-b7a0-4eec-9f38-3749d01e4b58',	'08ee8f90-a04f-40e9-9b7c-e5ced59818bd',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	NULL,	'2025-11-02 09:22:37');

DROP TABLE IF EXISTS `exchange_request_books`;
CREATE TABLE `exchange_request_books` (
  `exchange_request_book_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `book_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `offered_by_requester` tinyint(1) NOT NULL,
  `book_type` enum('OFFERED','REQUESTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`exchange_request_book_id`),
  UNIQUE KEY `uq_exreq_books` (`request_id`,`book_id`,`book_type`),
  KEY `fk_exreqbooks_book` (`book_id`),
  CONSTRAINT `fk_exreqbooks_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exreqbooks_request` FOREIGN KEY (`request_id`) REFERENCES `exchange_requests` (`request_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `exchange_request_books` (`exchange_request_book_id`, `request_id`, `book_id`, `offered_by_requester`, `book_type`, `created_at`) VALUES
('564458fa-39f3-4516-b6dd-aacea901da06',	'2017eacd-a88b-4406-af60-b278b6ab0bd0',	'2f3b9a50-2b6a-4d4a-9d4a-2c6a7b8c9d0e',	1,	'OFFERED',	'2025-11-02 07:27:07'),
('666f949c-0898-48ac-a215-edfb186e21c9',	'666d649b-790c-413d-bc54-b5ef7c855fa0',	'test-book-bob-3',	1,	'OFFERED',	'2025-11-03 09:13:48'),
('7a40c572-a8ce-4ce1-a195-cf54b6e2a1b5',	'4ba2d926-cce2-4933-a01c-6a0d4945d4a6',	'test-book-bob-2',	0,	'REQUESTED',	'2025-11-03 09:09:41'),
('905fd714-ee40-4872-b60e-d78b93acb777',	'2017eacd-a88b-4406-af60-b278b6ab0bd0',	'8973ae20-4ffb-4960-b59b-c440a52c0a8a',	0,	'REQUESTED',	'2025-11-02 07:27:07'),
('97f2068c-7a2f-4a90-a9c0-81d4829cdcd7',	'a761bc6c-70de-4bad-b9ec-9cb8060ad423',	'9ed5bce7-c186-4129-b8e2-7eb5ef21fd8a',	1,	'OFFERED',	'2025-11-03 09:16:44'),
('9ba68d6f-0d33-4422-9808-82cbb373dcad',	'a761bc6c-70de-4bad-b9ec-9cb8060ad423',	'seed-book-nam-clrs',	0,	'REQUESTED',	'2025-11-03 09:16:44'),
('b3fd87ed-7104-4da1-a0fb-ae4a50f79191',	'd3eb9595-207d-4e1f-bf00-674208934788',	'08ee8f90-a04f-40e9-9b7c-e5ced59818bd',	1,	'OFFERED',	'2025-11-02 09:12:31'),
('b8133dc1-87a8-4c48-9158-a30d27f4c498',	'90fd00f4-702d-4fe6-b2c5-606d6359e6a6',	'74218fc2-b633-11f0-8ac4-a635d8fd57db',	0,	'REQUESTED',	'2025-11-03 09:57:08'),
('c26dcfe9-b3e3-46b8-a9d0-d4d6ee2cb290',	'90fd00f4-702d-4fe6-b2c5-606d6359e6a6',	'eff18dde-7ba0-4e41-9e3b-d93c381cf3dd',	1,	'OFFERED',	'2025-11-03 09:57:08'),
('ef0510bb-48ec-4a61-adb4-f3f5779a5cb7',	'666d649b-790c-413d-bc54-b5ef7c855fa0',	'test-book-charlie-2',	0,	'REQUESTED',	'2025-11-03 09:13:48'),
('f2e4aaae-78c5-4dc1-abdc-a881ad5d9a6e',	'4ba2d926-cce2-4933-a01c-6a0d4945d4a6',	'ea64f1be-dedf-4f0d-826b-ea441caaf420',	1,	'OFFERED',	'2025-11-03 09:09:41'),
('fda2cf11-1a38-4bba-98ae-3b4deda5331a',	'd3eb9595-207d-4e1f-bf00-674208934788',	'e89b8061-afee-4085-97d2-4c918b18a01a',	0,	'REQUESTED',	'2025-11-02 09:12:31');

DROP TABLE IF EXISTS `exchange_requests`;
CREATE TABLE `exchange_requests` (
  `request_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `requester_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED','COMPLETED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rejection_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`request_id`),
  KEY `idx_exchange_requests_status` (`status`),
  KEY `idx_exchange_requests_receiver` (`receiver_id`,`status`),
  KEY `idx_exreq_requester_status_time` (`requester_id`,`status`,`created_at`),
  KEY `idx_requests_members_status` (`requester_id`,`receiver_id`,`status`),
  CONSTRAINT `fk_exreq_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exreq_requester` FOREIGN KEY (`requester_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `exchange_requests` (`request_id`, `requester_id`, `receiver_id`, `status`, `message`, `rejection_reason`, `created_at`, `responded_at`, `updated_at`) VALUES
('2017eacd-a88b-4406-af60-b278b6ab0bd0',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'ACCEPTED',	'Hi! I would love to exchange these books with you.',	NULL,	'2025-11-02 07:27:07',	'2025-11-03 14:18:38',	'2025-11-03 07:18:37'),
('4ba2d926-cce2-4933-a01c-6a0d4945d4a6',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'ACCEPTED',	'Hi! I would love to exchange books with you.',	NULL,	'2025-11-03 09:09:41',	'2025-11-03 16:09:59',	'2025-11-03 09:09:59'),
('666d649b-790c-413d-bc54-b5ef7c855fa0',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'test-member-charlie',	'PENDING',	'Hi! I would love to exchange books with you.',	NULL,	'2025-11-03 09:13:48',	NULL,	'2025-11-03 09:13:48'),
('90fd00f4-702d-4fe6-b2c5-606d6359e6a6',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'ACCEPTED',	'Hi! I would love to exchange books with you.',	NULL,	'2025-11-03 09:57:08',	'2025-11-03 16:57:51',	'2025-11-03 09:57:50'),
('a761bc6c-70de-4bad-b9ec-9cb8060ad423',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'seed-member-nam',	'PENDING',	'Hi! I would love to exchange books with you.',	NULL,	'2025-11-03 09:16:44',	NULL,	'2025-11-03 09:16:44'),
('d3eb9595-207d-4e1f-bf00-674208934788',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'ACCEPTED',	'Hi Bob! Mình muốn trao đổi Refactoring lấy Clean Code nhé.',	NULL,	'2025-11-02 09:12:31',	'2025-11-02 16:22:38',	'2025-11-02 09:22:37');

DROP TABLE IF EXISTS `exchange_suggestions`;
CREATE TABLE `exchange_suggestions` (
  `suggestion_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_a_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_b_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `match_score` decimal(4,3) NOT NULL DEFAULT '0.000',
  `total_matching_books` int NOT NULL DEFAULT '0',
  `is_viewed` tinyint(1) NOT NULL DEFAULT '0',
  `viewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expired_at` timestamp NULL DEFAULT NULL,
  `score_breakdown` json DEFAULT NULL COMMENT 'Breakdown of match score factors',
  PRIMARY KEY (`suggestion_id`),
  KEY `idx_suggestions_memberA_view` (`member_a_id`,`is_viewed`,`created_at`),
  KEY `idx_suggestions_memberB_time` (`member_b_id`,`created_at`),
  KEY `idx_suggestions_score_created` (`member_a_id`,`match_score` DESC,`created_at` DESC),
  KEY `idx_suggestions_expired` (`expired_at`),
  CONSTRAINT `fk_sugg_member_a` FOREIGN KEY (`member_a_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sugg_member_b` FOREIGN KEY (`member_b_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `exchange_suggestions` (`suggestion_id`, `member_a_id`, `member_b_id`, `match_score`, `total_matching_books`, `is_viewed`, `viewed_at`, `created_at`, `expired_at`, `score_breakdown`) VALUES
('259b744a-5d17-4cfe-985f-e6e09bea18aa',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'seed-member-diego',	0.425,	8,	0,	NULL,	'2025-11-03 10:16:40',	'2025-11-10 17:16:40',	'{\"rating\": 0.0425, \"priority\": 0.0825, \"condition\": 0.03125, \"book_match\": 0.06249999999999999, \"geographic\": 0.05, \"trust_score\": 0.10625, \"verification\": 0.00625, \"exchange_history\": 0.04375}'),
('2b6fdc58-ee49-4910-ae15-0fdc9ee3cb1f',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	0.567,	25,	0,	NULL,	'2025-11-03 06:12:14',	'2025-11-10 13:12:14',	'{\"rating\": 0.05920000000000004, \"priority\": 0.09760000000000003, \"condition\": 0.030800000000000004, \"book_match\": 0.13119999999999998, \"geographic\": 0.05000000000000002, \"trust_score\": 0.14799999999999996, \"verification\": 0, \"exchange_history\": 0.05000000000000002}'),
('2de3ee1e-61df-4112-ad05-37b420529d29',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'test-member-alice',	2.800,	3,	0,	NULL,	'2025-11-02 10:04:01',	NULL,	NULL),
('46967284-d330-4348-9cb8-7a873f3a7da2',	'seed-member-diego',	'seed-member-bella',	1.850,	2,	0,	NULL,	'2025-11-02 14:19:29',	NULL,	NULL),
('a7116582-aeb6-45a3-a097-16d264281abb',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	0.567,	25,	1,	'2025-11-03 17:16:28',	'2025-11-03 06:18:15',	'2025-11-10 13:18:15',	'{\"rating\": 0.05920000000000004, \"priority\": 0.09760000000000003, \"condition\": 0.030800000000000004, \"book_match\": 0.13119999999999998, \"geographic\": 0.05000000000000002, \"trust_score\": 0.14799999999999996, \"verification\": 0, \"exchange_history\": 0.05000000000000002}'),
('efd13232-62f8-4086-b8f1-18e0b28c5bda',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	2.800,	3,	1,	'2025-11-02 14:05:10',	'2025-11-02 06:39:48',	NULL,	NULL);

DROP TABLE IF EXISTS `exchanges`;
CREATE TABLE `exchanges` (
  `exchange_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `request_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_a_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_b_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','ACCEPTED','COMPLETED','CANCELLED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `member_a_confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `member_b_confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `confirmed_by_a_at` timestamp NULL DEFAULT NULL,
  `confirmed_by_b_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`exchange_id`),
  UNIQUE KEY `request_id` (`request_id`),
  KEY `idx_exchanges_memberA_status` (`member_a_id`,`status`,`created_at`),
  KEY `idx_exchanges_memberB_status` (`member_b_id`,`status`,`created_at`),
  CONSTRAINT `fk_exchanges_member_a` FOREIGN KEY (`member_a_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exchanges_member_b` FOREIGN KEY (`member_b_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exchanges_request` FOREIGN KEY (`request_id`) REFERENCES `exchange_requests` (`request_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `exchanges` (`exchange_id`, `request_id`, `member_a_id`, `member_b_id`, `status`, `member_a_confirmed`, `member_b_confirmed`, `confirmed_by_a_at`, `confirmed_by_b_at`, `completed_at`, `created_at`, `updated_at`) VALUES
('0b1f1f15-b7a0-4eec-9f38-3749d01e4b58',	'd3eb9595-207d-4e1f-bf00-674208934788',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'COMPLETED',	1,	1,	'2025-11-02 16:33:21',	'2025-11-02 16:24:36',	'2025-11-02 16:33:21',	'2025-11-02 09:22:37',	'2025-11-02 09:33:21'),
('17d92bda-da86-4acd-a700-16e3f3245dd0',	'4ba2d926-cce2-4933-a01c-6a0d4945d4a6',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'CANCELLED',	0,	1,	NULL,	'2025-11-03 16:10:28',	NULL,	'2025-11-03 09:09:59',	'2025-11-05 07:54:58'),
('b19085de-d6bc-443d-a5ed-8a3508918df0',	'90fd00f4-702d-4fe6-b2c5-606d6359e6a6',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'COMPLETED',	1,	1,	'2025-11-03 17:05:23',	'2025-11-03 16:57:57',	'2025-11-03 17:05:23',	'2025-11-03 09:57:50',	'2025-11-03 10:05:23'),
('c0a11a94-28fa-4204-ac3b-5cb781c8bb20',	'2017eacd-a88b-4406-af60-b278b6ab0bd0',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'COMPLETED',	1,	1,	'2025-11-03 16:12:15',	'2025-11-03 16:15:14',	'2025-11-03 16:15:14',	'2025-11-03 07:18:37',	'2025-11-03 09:15:13');

DROP TABLE IF EXISTS `members`;
CREATE TABLE `members` (
  `member_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `trust_score` decimal(3,2) NOT NULL DEFAULT '0.00',
  `average_rating` decimal(2,1) NOT NULL DEFAULT '0.0',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `verification_date` timestamp NULL DEFAULT NULL,
  `total_exchanges` int NOT NULL DEFAULT '0',
  `completed_exchanges` int NOT NULL DEFAULT '0',
  `cancelled_exchanges` int NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`member_id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_members_region` (`region`),
  KEY `idx_members_trust_score` (`trust_score`),
  KEY `idx_members_rating` (`average_rating`),
  KEY `idx_members_trust_rating` (`trust_score` DESC,`average_rating` DESC),
  KEY `idx_members_region_verified` (`region`,`is_verified`),
  CONSTRAINT `fk_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `members` (`member_id`, `user_id`, `region`, `phone`, `address`, `bio`, `trust_score`, `average_rating`, `is_verified`, `verification_date`, `total_exchanges`, `completed_exchanges`, `cancelled_exchanges`, `created_at`, `updated_at`) VALUES
('1eb00da1-26d3-492b-8859-03d2d64de347',	'b2b805e6-f769-4714-b3b8-104b52e6cd39',	NULL,	NULL,	NULL,	NULL,	0.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-12 07:09:51',	'2025-11-12 07:09:51'),
('48976f3c-a127-4c60-b7b4-3e56b82a71e4',	'8bf98e65-e35d-41b3-9692-a9fbe96658d4',	NULL,	NULL,	NULL,	NULL,	0.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-12 07:12:57',	'2025-11-12 07:12:57'),
('66c91fe2-96ca-4ff2-ae17-d5b9c51bb29f',	'416b9715-3f37-439a-b4c1-1a2770039b6c',	NULL,	NULL,	NULL,	NULL,	0.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-12 06:55:56',	'2025-11-12 06:55:56'),
('81e1fd70-fcea-4565-87aa-8ce4e157194e',	'4e60dac4-99a6-4e29-b6a8-ac2ffe676a15',	NULL,	NULL,	NULL,	NULL,	0.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-12 06:57:11',	'2025-11-12 06:57:11'),
('c30f0b15-f193-4b4a-a2e5-ed97e2252775',	'876cace3-4676-4cc3-9c72-128d93da2e4d',	NULL,	NULL,	NULL,	NULL,	0.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-12 10:35:05',	'2025-11-12 10:35:05'),
('c4262d36-adf8-4474-a446-29b021e87c49',	'1d712a14-8971-47ac-87cb-3123e0caa35c',	NULL,	NULL,	NULL,	NULL,	0.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-12 07:08:36',	'2025-11-12 07:08:36'),
('ca166ce6-44fc-4409-8742-ef08fc2e8dcb',	'd2a2d7e2-b139-4ee8-a028-89de6b7d6a6b',	NULL,	NULL,	NULL,	NULL,	0.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-12 07:04:07',	'2025-11-12 07:04:07'),
('cb24e761-ed84-44cb-9318-56863092ec44',	'c43c9948-4850-43af-a034-9fff4d9202ac',	NULL,	NULL,	NULL,	NULL,	0.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-12 06:52:00',	'2025-11-12 06:52:00'),
('d8457c3d-c3c6-4663-bc64-8694dc72c887',	'53c5f663-a5b7-4e11-a1f2-23d82e6f4c0d',	NULL,	NULL,	NULL,	NULL,	0.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-12 07:06:43',	'2025-11-12 07:06:43'),
('f8392a1a-b5a5-490a-9512-6b3f923dee41',	'88a84968-25da-4a89-bfc8-71d2cb0abfb2',	'Hanoi',	NULL,	NULL,	NULL,	0.55,	4.0,	0,	NULL,	0,	6,	0,	'2025-11-02 06:32:16',	'2025-11-04 09:56:20'),
('f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'88a84968-25da-4a89-bfc8-71d2cb0abfba',	'Da Nang',	NULL,	NULL,	NULL,	0.00,	0.0,	1,	NULL,	0,	3,	0,	'2025-10-30 15:25:12',	'2025-11-03 09:15:13'),
('seed-member-bella',	'88a84968-25da-4a89-bfc8-71d2cb0abfb3',	'HCM',	NULL,	NULL,	'System design enthusiast',	4.20,	4.2,	1,	NULL,	0,	0,	0,	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('seed-member-diego',	'88a84968-25da-4a89-bfc8-71d2cb0abfb5',	'HCM',	NULL,	NULL,	'Likes pragmatic coding',	4.50,	4.5,	1,	NULL,	0,	0,	0,	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('seed-member-nam',	'88a84968-25da-4a89-bfc8-71d2cb0abfb6',	'HN',	NULL,	NULL,	'Algo lover',	3.90,	3.9,	1,	NULL,	0,	0,	0,	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('test-member-alice',	'88a84968-25da-4a89-bfc8-71d2cb0abfb1',	'Ho Chi Minh City',	NULL,	NULL,	NULL,	4.50,	4.5,	0,	NULL,	0,	9,	0,	'2025-11-02 06:32:16',	'2025-11-03 10:05:23'),
('test-member-charlie',	'test-user-charlie',	'Da Nang',	NULL,	NULL,	NULL,	3.80,	3.5,	0,	NULL,	0,	1,	0,	'2025-11-02 06:32:16',	'2025-11-02 06:32:16');

DROP TABLE IF EXISTS `message_reactions`;
CREATE TABLE `message_reactions` (
  `reaction_id` varchar(36) NOT NULL,
  `message_id` varchar(36) NOT NULL,
  `member_id` varchar(36) NOT NULL,
  `emoji` varchar(10) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`reaction_id`),
  UNIQUE KEY `uk_msg_emoji` (`message_id`,`member_id`,`emoji`),
  KEY `idx_message_reactions_message` (`message_id`),
  KEY `idx_message_reactions_member` (`member_id`),
  KEY `idx_message_reactions_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `message_reactions` (`reaction_id`, `message_id`, `member_id`, `emoji`, `created_at`) VALUES
('473052df-5f24-4d93-86a5-a23bd7fe2afa',	'6a1920bf-34d3-4be9-96a1-341c31ea68ee',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'👍',	'2025-11-03 13:32:01');

DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `message_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversation_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `sender_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `receiver_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `message_type` enum('TEXT','IMAGE','FILE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'TEXT',
  `attachment_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_edited` tinyint(1) DEFAULT '0',
  `edited_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`message_id`),
  KEY `fk_messages_receiver` (`receiver_id`),
  KEY `idx_messages_conversation` (`conversation_id`,`sent_at` DESC),
  KEY `idx_messages_sender_time` (`sender_id`,`sent_at`),
  KEY `idx_messages_deleted_at` (`deleted_at`,`conversation_id`),
  CONSTRAINT `fk_messages_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `messages` (`message_id`, `conversation_id`, `sender_id`, `receiver_id`, `content`, `is_read`, `read_at`, `sent_at`, `deleted_at`, `created_at`, `message_type`, `attachment_url`, `is_edited`, `edited_at`) VALUES
('458996dd-3b61-4412-b6d5-21f44de66021',	'00190e89-4aee-4ef7-8e09-6127427550f6',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'test-member-alice',	'toi iu bgia',	1,	'2025-11-03 15:01:54',	'2025-11-03 14:58:02',	NULL,	'2025-11-03 07:58:01',	'TEXT',	NULL,	0,	NULL),
('47c99ceb-ae57-4671-a04f-33e86f8d301e',	'00190e89-4aee-4ef7-8e09-6127427550f6',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'con chossss',	1,	'2025-11-03 14:54:20',	'2025-11-03 14:45:12',	NULL,	'2025-11-03 07:45:11',	'TEXT',	NULL,	0,	NULL),
('5f0cbbf7-ed5e-41b9-b826-e58625e44f0e',	'00190e89-4aee-4ef7-8e09-6127427550f6',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'test-member-alice',	'huỳnh sen là con chó',	1,	'2025-11-03 15:01:54',	'2025-11-03 14:54:36',	NULL,	'2025-11-03 07:54:35',	'TEXT',	NULL,	0,	NULL),
('6a1920bf-34d3-4be9-96a1-341c31ea68ee',	'00190e89-4aee-4ef7-8e09-6127427550f6',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'test-member-alice',	'Hi! Is?',	0,	NULL,	'2025-11-03 20:31:44',	NULL,	'2025-11-03 13:31:43',	'TEXT',	NULL,	0,	NULL),
('6e6c9401-91a0-49e3-acdf-230aab0bd0f5',	'00190e89-4aee-4ef7-8e09-6127427550f6',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'test-member-alice',	'Hi! Is?',	0,	NULL,	'2025-11-03 20:31:01',	'2025-11-03 20:31:20',	'2025-11-03 13:31:01',	'TEXT',	NULL,	0,	NULL),
('792fc6ac-a138-4f7d-a75e-1aae7572998a',	'00190e89-4aee-4ef7-8e09-6127427550f6',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'Hi! Is the book still available?',	1,	'2025-11-03 14:25:16',	'2025-11-03 14:21:02',	NULL,	'2025-11-03 07:21:01',	'TEXT',	NULL,	0,	NULL),
('adf38466-d697-478c-83eb-69eead9017ae',	'00190e89-4aee-4ef7-8e09-6127427550f6',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'test-member-alice',	'Yes! The book is still available. When would you like to meet?',	1,	'2025-11-03 14:27:16',	'2025-11-03 14:26:20',	NULL,	'2025-11-03 07:26:20',	'TEXT',	NULL,	0,	NULL),
('cfbacbb5-2a77-4771-a457-08f3b4f8e3e9',	'00190e89-4aee-4ef7-8e09-6127427550f6',	'test-member-alice',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'mày là con chó',	1,	'2025-11-03 14:54:20',	'2025-11-03 14:52:40',	NULL,	'2025-11-03 07:52:40',	'TEXT',	NULL,	0,	NULL);

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `notification_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `notification_type` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reference_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payload` json DEFAULT NULL COMMENT 'Flexible JSON payload for notification content',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  `deleted_at` datetime DEFAULT NULL COMMENT 'Soft delete timestamp',
  PRIMARY KEY (`notification_id`),
  KEY `idx_notifications_member` (`member_id`),
  KEY `idx_notifications_member_created` (`member_id`,`created_at` DESC),
  KEY `idx_notifications_member_isread` (`member_id`,`is_read`),
  CONSTRAINT `fk_notifications_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `notifications` (`notification_id`, `member_id`, `notification_type`, `title`, `content`, `reference_type`, `reference_id`, `is_read`, `read_at`, `created_at`, `payload`, `updated_at`, `deleted_at`) VALUES
('358d58cb-4aab-4a71-b193-fc4bc421ac8d',	'test-member-alice',	'TES2222T',	NULL,	NULL,	NULL,	NULL,	1,	'2025-11-05 06:41:43',	'2025-11-05 06:41:26',	'{\"message\": \"Hello World\"}',	'2025-11-05 06:41:43',	NULL),
('9e48cf50-fbee-44a0-a249-546af56fcd23',	'test-member-alice',	'TEST',	NULL,	NULL,	NULL,	NULL,	1,	'2025-11-05 06:41:15',	'2025-11-05 06:36:15',	'{\"message\": \"Hello World\"}',	'2025-11-05 06:41:15',	NULL);

DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE `password_reset_tokens` (
  `token_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `is_used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token_id`),
  UNIQUE KEY `token` (`token`),
  KEY `fk_reset_token_user` (`user_id`),
  CONSTRAINT `fk_reset_token_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `password_reset_tokens` (`token_id`, `user_id`, `token`, `expires_at`, `is_used`, `created_at`) VALUES
('1dded702-f27d-4010-bfe6-ffaab7a33010',	'876cace3-4676-4cc3-9c72-128d93da2e4d',	'c4fe0179e1e563b83c1261034fdbef8641f2a258a02e18c541c81960e0753c6f',	'2025-11-12 11:36:33',	1,	'2025-11-12 10:36:33');

DROP TABLE IF EXISTS `personal_libraries`;
CREATE TABLE `personal_libraries` (
  `library_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_owned_books` int NOT NULL DEFAULT '0',
  `total_wanted_books` int NOT NULL DEFAULT '0',
  `last_updated` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`library_id`),
  UNIQUE KEY `member_id` (`member_id`),
  CONSTRAINT `fk_libraries_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `personal_libraries` (`library_id`, `member_id`, `total_owned_books`, `total_wanted_books`, `last_updated`, `created_at`) VALUES
('9c5f1497-c48a-47fa-8845-0a63c901b790',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	2,	6,	'2025-11-16 19:39:18',	'2025-10-31 06:21:32'),
('seed-lib-bella',	'seed-member-bella',	0,	0,	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('seed-lib-diego',	'seed-member-diego',	0,	0,	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('seed-lib-nam',	'seed-member-nam',	0,	0,	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('test-lib-alice',	'test-member-alice',	0,	7,	'2025-11-02 17:43:36',	'2025-11-02 06:32:16'),
('test-lib-bob',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	0,	8,	'2025-11-02 17:43:36',	'2025-11-02 06:32:16'),
('test-lib-charlie',	'test-member-charlie',	0,	0,	NULL,	'2025-11-02 06:32:16');

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `review_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exchange_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewer_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reviewee_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `trust_score_impact` decimal(3,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `uq_reviews_once_per_exchange` (`exchange_id`,`reviewer_id`),
  KEY `fk_reviews_reviewer` (`reviewer_id`),
  KEY `idx_reviews_reviewee_time` (`reviewee_id`,`created_at`),
  CONSTRAINT `fk_reviews_exchange` FOREIGN KEY (`exchange_id`) REFERENCES `exchanges` (`exchange_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_reviewee` FOREIGN KEY (`reviewee_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_reviews_rating` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `system_statistics`;
CREATE TABLE `system_statistics` (
  `stats_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_users` bigint NOT NULL DEFAULT '0',
  `total_members` bigint NOT NULL DEFAULT '0',
  `total_books` bigint NOT NULL DEFAULT '0',
  `total_exchanges` bigint NOT NULL DEFAULT '0',
  `completed_exchanges` bigint NOT NULL DEFAULT '0',
  `active_members` bigint NOT NULL DEFAULT '0',
  `average_trust_score` decimal(3,2) NOT NULL DEFAULT '0.00',
  `books_exchanged_this_month` int NOT NULL DEFAULT '0',
  `last_calculated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`stats_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `system_statistics` (`stats_id`, `total_users`, `total_members`, `total_books`, `total_exchanges`, `completed_exchanges`, `active_members`, `average_trust_score`, `books_exchanged_this_month`, `last_calculated`, `created_at`) VALUES
('stats-uuid-001',	0,	0,	0,	0,	0,	0,	0.00,	0,	'2025-10-30 12:48:27',	'2025-10-30 12:48:27');

DROP TABLE IF EXISTS `token_blacklist`;
CREATE TABLE `token_blacklist` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_token_blacklist_token` (`token`(255)),
  KEY `idx_token_blacklist_user` (`user_id`),
  KEY `idx_token_blacklist_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


DROP TABLE IF EXISTS `user_activity_logs`;
CREATE TABLE `user_activity_logs` (
  `log_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL COMMENT 'Chi tiết về action (JSON)',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `idx_user_activity_user` (`user_id`,`created_at` DESC),
  KEY `idx_user_activity_action` (`action`),
  KEY `idx_user_activity_created` (`created_at` DESC),
  KEY `idx_user_activity_date_range` (`user_id`,`created_at`),
  KEY `idx_user_activity_entity` (`entity_type`,`entity_id`),
  CONSTRAINT `fk_user_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log tất cả hành động của users để audit trail';

INSERT INTO `user_activity_logs` (`log_id`, `user_id`, `action`, `entity_type`, `entity_id`, `metadata`, `ip_address`, `user_agent`, `created_at`) VALUES
('26f210f5-b598-493c-8ff3-764d3f04eb96',	'88a84968-25da-4a89-bfc8-71d2cb0abfb1',	'LOGIN',	NULL,	NULL,	NULL,	NULL,	NULL,	'2025-11-05 08:19:32');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('GUEST','MEMBER','ADMIN') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEMBER',
  `account_status` enum('ACTIVE','LOCKED','SUSPENDED','DELETED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `auth_provider` enum('LOCAL','GOOGLE') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LOCAL',
  `google_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_provider_googleid` (`auth_provider`,`google_id`),
  KEY `idx_users_google_id` (`google_id`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`account_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`user_id`, `email`, `password_hash`, `full_name`, `avatar_url`, `role`, `account_status`, `auth_provider`, `google_id`, `is_email_verified`, `email_verified_at`, `last_login_at`, `deleted_at`, `created_at`, `updated_at`) VALUES
('1d712a14-8971-47ac-87cb-3123e0caa35c',	'finaltest@example.com',	'$2b$10$/Qk.Dv2AoSqQPNwpv1JFe.uL/uneF5ZOEpFXfbhM14R4R.6dC1pjG',	'Final Test User',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	0,	NULL,	NULL,	NULL,	'2025-11-12 07:08:36',	'2025-11-12 07:08:36'),
('416b9715-3f37-439a-b4c1-1a2770039b6c',	'user@examplswsssssse.com',	'$2b$10$yeHOzgpa2apmnsURuJCWv.UcWrciEOOHuOVRkryWBIXijpJlI1Vmu',	'John Doe',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	0,	NULL,	NULL,	NULL,	'2025-11-12 06:55:56',	'2025-11-12 06:55:56'),
('4e60dac4-99a6-4e29-b6a8-ac2ffe676a15',	'test@example.com',	'$2b$10$NCIBLG.tBUwvClQCJchzc.GIKiY93dos1JKFtC/HKY60LX6IWIeHW',	'Test User',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	0,	NULL,	NULL,	NULL,	'2025-11-12 06:57:11',	'2025-11-12 06:57:11'),
('53c5f663-a5b7-4e11-a1f2-23d82e6f4c0d',	'testmail@example.com',	'$2b$10$9Y4SRrUoP3I3LM24Gf1n1uSbBK0V9VeLPkLaPg66gi5F915iwXZfC',	'Test Mail User',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	0,	NULL,	NULL,	NULL,	'2025-11-12 07:06:43',	'2025-11-12 07:06:43'),
('876cace3-4676-4cc3-9c72-128d93da2e4d',	'hoanglhh0026@ut.edu.vn',	'$2b$10$WPjrXe3pr30ps9I9PlGKjeKKrtZbQGVJ94Ipb9Ef.biyn.4TKRehm',	'John Doe',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	'2025-11-12 10:35:19',	NULL,	NULL,	'2025-11-12 10:35:05',	'2025-11-12 10:37:12'),
('88a84968-25da-4a89-bfc8-71d2cb0abfb1',	'alice@test.com',	'$2a$12$ko9nhmI2JYMD3dAwThZzYOX68sZIQNYJJFDaHjvXAiPXW8DZV6/hW',	'Alice Test',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	'2025-11-02 06:32:16',	'2025-11-04 16:31:20',	NULL,	'2025-11-02 06:32:16',	'2025-11-04 09:31:20'),
('88a84968-25da-4a89-bfc8-71d2cb0abfb2',	'bob@test.com',	'$2a$12$ko9nhmI2JYMD3dAwThZzYOX68sZIQNYJJFDaHjvXAiPXW8DZV6/hW',	'Bob Test',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	'2025-11-02 06:32:16',	'2025-11-03 16:15:59',	NULL,	'2025-11-02 06:32:16',	'2025-11-03 09:15:58'),
('88a84968-25da-4a89-bfc8-71d2cb0abfb3',	'bella.tran+seed@test.com',	'$2a$12$ko9nhmI2JYMD3dAwThZzYOX68sZIQNYJJFDaHjvXAiPXW8DZV6/hW	',	'Bella Tran',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-02 14:10:19',	'2025-11-02 14:14:10'),
('88a84968-25da-4a89-bfc8-71d2cb0abfb5',	'diego.nguyen@test.com',	'$2a$12$ko9nhmI2JYMD3dAwThZzYOX68sZIQNYJJFDaHjvXAiPXW8DZV6/hW',	'Diego Nguyen',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	'2025-11-02 21:18:56',	NULL,	'2025-11-02 14:10:19',	'2025-11-02 14:18:55'),
('88a84968-25da-4a89-bfc8-71d2cb0abfb6',	'nam.pham+seed@test.com',	'$2a$12$ko9nhmI2JYMD3dAwThZzYOX68sZIQNYJJFDaHjvXAiPXW8DZV6/hW	',	'Nam Pham',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-02 14:10:19',	'2025-11-02 14:15:16'),
('88a84968-25da-4a89-bfc8-71d2cb0abfba',	'user@example.com',	'$2b$10$hA5SJCdrXg9KrUIasMFkPO9clGev0WIw7JzUKLS8X1Awrb71BO7Yu',	'User1',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	'2025-11-16 19:37:23',	NULL,	'2025-10-30 15:25:12',	'2025-11-16 19:37:23'),
('8bf98e65-e35d-41b3-9692-a9fbe96658d4',	'lehuynhhuyhoang05@gmail.com',	'$2b$10$Hn/WsqJN/3MjKUA9JlnlJ.PEaijIpIUonIHfHvKPIpT4KRWIL6YTC',	'John Doe',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	0,	NULL,	NULL,	NULL,	'2025-11-12 07:12:57',	'2025-11-12 07:12:57'),
('admin-uuid-001',	'admin@bookswap.com',	'$2a$12$ko9nhmI2JYMD3dAwThZzYOX68sZIQNYJJFDaHjvXAiPXW8DZV6/hW',	'System Administrator',	NULL,	'ADMIN',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	'2025-11-05 14:15:30',	NULL,	'2025-10-30 12:48:27',	'2025-11-05 07:15:29'),
('b2b805e6-f769-4714-b3b8-104b52e6cd39',	'realtest@example.com',	'$2b$10$T8rDGBV5TOOzhW3C2yLnGuAORYUH3iMOggvsuq3PhC.iTL4LXyA5S',	'Real Email Test',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	0,	NULL,	NULL,	NULL,	'2025-11-12 07:09:51',	'2025-11-12 07:09:51'),
('c43c9948-4850-43af-a034-9fff4d9202ac',	'user@exampl22222e.com',	'$2b$10$Q8LGQDSz9vLiDrsbQCSbr.Tv/JupPrKW0nZwsKOy0RT7q/IYkzz1O',	'John Doe',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	0,	NULL,	NULL,	NULL,	'2025-11-12 06:52:00',	'2025-11-12 06:52:00'),
('d2a2d7e2-b139-4ee8-a028-89de6b7d6a6b',	'newuser@example.com',	'$2b$10$w6WflKsa9e8fIGbusJIQ.ueWJtgjSDT.P/XgtWmAFB4lN2R7za48u',	'New User Test',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	0,	NULL,	NULL,	NULL,	'2025-11-12 07:04:07',	'2025-11-12 07:04:07'),
('test-user-charlie',	'charlie@test.com',	'$2a$12$ko9nhmI2JYMD3dAwThZzYOX68sZIQNYJJFDaHjvXAiPXW8DZV6/hW',	'Charlie Test',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	'2025-11-02 06:32:16',	NULL,	NULL,	'2025-11-02 06:32:16',	'2025-11-02 06:38:53'),
('user-002',	'bob@bookswap.com',	'$2b$10$eiFnGyAzio3TWEKygYwANuFC0pFmBDtc9ePyXf7uMDyzyPY6V09ma',	'Bob Tran',	'https://i.pravatar.cc/150?img=2',	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	'2025-10-31 07:11:30',	'2025-10-31 15:24:14',	NULL,	'2025-10-31 07:11:30',	'2025-10-31 08:24:13'),
('user-003',	'carol@bookswap.com',	'$2b$10$eiFnGyAzio3TWEKygYwANuFC0pFmBDtc9ePyXf7uMDyzyPY6V09ma',	'Carol Le',	'https://i.pravatar.cc/150?img=3',	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	'2025-10-31 07:11:30',	NULL,	NULL,	'2025-10-31 07:11:30',	'2025-10-31 08:15:29'),
('user-004',	'david@bookswap.com',	'$2b$10$eiFnGyAzio3TWEKygYwANuFC0pFmBDtc9ePyXf7uMDyzyPY6V09ma',	'David Pham',	'https://i.pravatar.cc/150?img=4',	'MEMBER',	'LOCKED',	'LOCAL',	NULL,	1,	'2025-10-31 07:11:30',	NULL,	NULL,	'2025-10-31 07:11:30',	'2025-11-05 07:30:45'),
('user-005',	'emma@bookswap.com',	'$2b$10$eiFnGyAzio3TWEKygYwANuFC0pFmBDtc9ePyXf7uMDyzyPY6V09ma',	'Emma Vo',	'https://i.pravatar.cc/150?img=5',	'ADMIN',	'DELETED',	'LOCAL',	NULL,	1,	'2025-10-31 07:11:30',	NULL,	NULL,	'2025-10-31 07:11:30',	'2025-11-05 07:34:37');

DROP TABLE IF EXISTS `violation_reports`;
CREATE TABLE `violation_reports` (
  `report_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reporter_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reported_member_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reported_item_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reported_item_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','IN_REVIEW','RESOLVED','DISMISSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `priority` enum('LOW','MEDIUM','HIGH','CRITICAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `resolved_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolution` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `fk_reports_reporter` (`reporter_id`),
  KEY `fk_reports_reported` (`reported_member_id`),
  KEY `fk_reports_resolver` (`resolved_by`),
  KEY `idx_violation_status_priority` (`status`,`priority`),
  KEY `idx_violation_created` (`created_at`),
  CONSTRAINT `fk_reports_reported` FOREIGN KEY (`reported_member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reports_resolver` FOREIGN KEY (`resolved_by`) REFERENCES `admins` (`admin_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reports từ members về các vi phạm trong hệ thống';

INSERT INTO `violation_reports` (`report_id`, `reporter_id`, `reported_member_id`, `report_type`, `description`, `reported_item_type`, `reported_item_id`, `status`, `priority`, `resolved_by`, `resolution`, `created_at`, `resolved_at`) VALUES
('070e670a-619b-4434-b9cd-65a8045315fa',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	'SPAM',	'Đăng sách có nội dung quảng cáo không liên quan.',	'BOOK',	'e4bb24df-4011-4855-85da-88fffbba982e',	'RESOLVED',	'MEDIUM',	'admin-uuid-001',	'Đã xử lý và xóa nội dung vi phạm. Removed inappropriate book and warned user.',	'2025-11-05 07:42:11',	'2025-11-05 14:43:06');

-- 2025-11-21 04:07:29 UTC