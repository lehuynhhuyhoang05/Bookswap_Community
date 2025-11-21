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
('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',	'22222222-2222-2222-2222-222222222222',	'Clean Code',	'Robert C. Martin',	'9780132350884',	NULL,	NULL,	NULL,	'Classic craftsmanship book',	NULL,	'vi',	NULL,	NULL,	'GOOD',	'AVAILABLE',	0,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',	'33333333-3333-3333-3333-333333333333',	'Refactoring',	'Martin Fowler',	'9780201485677',	NULL,	NULL,	NULL,	'Improving existing code',	NULL,	'vi',	NULL,	NULL,	'GOOD',	'AVAILABLE',	0,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3',	'44444444-4444-4444-4444-444444444444',	'Design Patterns',	'GoF',	'9780201633610',	NULL,	NULL,	NULL,	'Reusable OO patterns',	NULL,	'vi',	NULL,	NULL,	'FAIR',	'AVAILABLE',	0,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4',	'55555555-5555-5555-5555-555555555555',	'Domain-Driven Design',	'Eric Evans',	'9780321125217',	NULL,	NULL,	NULL,	'Strategic design',	NULL,	'vi',	NULL,	NULL,	'GOOD',	'AVAILABLE',	0,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5',	'66666666-6666-6666-6666-666666666666',	'The Pragmatic Programmer',	'Andrew Hunt',	'9780201616224',	NULL,	NULL,	NULL,	'Journey to mastery',	NULL,	'vi',	NULL,	NULL,	'GOOD',	'AVAILABLE',	0,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6',	'44444444-4444-4444-4444-444444444444',	'Clean Architecture',	'Robert C. Martin',	'9780134494166',	NULL,	NULL,	NULL,	'Architectural guidance',	NULL,	'vi',	NULL,	NULL,	'GOOD',	'EXCHANGING',	0,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaa7',	'22222222-2222-2222-2222-222222222222',	'Distributed Systems',	'Tanenbaum',	'9780132143011',	NULL,	NULL,	NULL,	'Concepts & design',	NULL,	'vi',	NULL,	NULL,	'FAIR',	'AVAILABLE',	0,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14');

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
('test-want-alice-1',	'9c5f1497-c48a-47fa-8845-0a63c901b790',	'Design Patterns',	'Gang of Four',	NULL,	NULL,	'Programming',	9,	NULL,	'2025-11-02 06:32:16',	'2025-11-02 06:32:16'),
('test-want-alice-2',	'9c5f1497-c48a-47fa-8845-0a63c901b790',	'Refactoring',	'Martin Fowler',	NULL,	NULL,	'Programming',	8,	NULL,	'2025-11-02 06:32:16',	'2025-11-02 06:32:16'),
('test-want-bob-2',	'test-lib-bob',	'The Pragmatic Programmer',	'Andy Hunt',	NULL,	NULL,	'Programming',	7,	NULL,	'2025-11-02 06:32:16',	'2025-11-02 06:32:16'),
('want-vip-1',	'lib-vip-user',	'Working Effectively with Legacy Code',	'Michael Feathers',	'9780131177055',	NULL,	'Programming',	9,	'Looking for this classic',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-vip-2',	'lib-vip-user',	'Software Engineering at Google',	'Titus Winters',	NULL,	NULL,	'Programming',	8,	'Want to learn Google practices',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-vip-3',	'lib-vip-user',	'Domain-Driven Design',	'Eric Evans',	'9780321125217',	NULL,	'Programming',	9,	'Essential DDD book',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-vip-4',	'lib-vip-user',	'Building Microservices',	'Sam Newman',	NULL,	NULL,	'Programming',	7,	'Microservices architecture',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-vip-5',	'lib-vip-user',	'The Phoenix Project',	'Gene Kim',	NULL,	NULL,	'Business',	6,	'DevOps novel',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-medium-1',	'lib-medium-user',	'Clean Code',	'Robert C. Martin',	'9780132350884',	NULL,	'Programming',	9,	'Must have book',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-medium-2',	'lib-medium-user',	'Design Patterns',	'GoF',	'9780201633610',	NULL,	'Programming',	8,	'Classic patterns book',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-medium-3',	'lib-medium-user',	'Refactoring',	'Martin Fowler',	NULL,	NULL,	'Programming',	7,	'Refactoring guide',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-limited-1',	'lib-limited-user',	'The Pragmatic Programmer',	'Andy Hunt',	NULL,	NULL,	'Programming',	9,	'Highly recommended',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-limited-2',	'lib-limited-user',	'Code Complete',	'Steve McConnell',	NULL,	NULL,	'Programming',	8,	'Complete coding guide',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-disputer-1',	'lib-disputer-user',	'Design Patterns',	'GoF',	'9780201633610',	NULL,	'Programming',	9,	'Want to learn design patterns',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-disputer-2',	'lib-disputer-user',	'Clean Code',	'Robert C. Martin',	'9780132350884',	NULL,	'Programming',	8,	'Essential clean code book',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-disputer-3',	'lib-disputer-user',	'Refactoring',	'Martin Fowler',	NULL,	NULL,	'Programming',	7,	'Refactoring patterns',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-noshow-1',	'lib-noshow-user',	'Clean Architecture',	'Robert C. Martin',	NULL,	NULL,	'Programming',	9,	'Architecture principles',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00'),
('want-noshow-2',	'lib-noshow-user',	'Design Patterns',	'GoF',	NULL,	NULL,	'Programming',	8,	'Classic patterns',	'2025-11-21 08:33:00',	'2025-11-21 08:33:00');

DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `conversation_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exchange_request_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
('a1000000-0000-4000-8000-000000000001',	'req00007-0000-0000-0000-000000000007',	'44444444-4444-4444-4444-444444444444',	'22222222-2222-2222-2222-222222222222',	2,	'2025-11-20 06:33:14',	'2025-11-20 06:33:14',	NULL),
('a2000000-0000-4000-8000-000000000002',	NULL,	'44444444-4444-4444-4444-444444444444',	'66666666-6666-6666-6666-666666666666',	2,	'2025-11-14 06:33:14',	'2025-11-14 06:33:14',	NULL);

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
('048b3089-4275-420f-a11e-6176a4bf96b5',	'74f220de1b8561e188282c68bbf68936f2e0be5991cb69bc15056b5f84712e67',	'1c75053d-14d3-4a9d-a03e-c890bf2bfcee',	'2025-11-22 05:20:02',	0,	'2025-11-21 05:20:02',	0),
('0810d5ae-f622-4d16-acf7-66d17b93475d',	'a3d950263db4e71da15fa276cbb4e9d78f9018333db097ea4c451bafb29cb97e',	'8bf98e65-e35d-41b3-9692-a9fbe96658d4',	'2025-11-13 07:12:58',	0,	'2025-11-12 07:12:57',	0),
('08995b81-53fc-4f5a-809d-3f84f567cb5f',	'082341912c2b6cba389b3aab9e0de60cad0d9bc496e3fbbf1a97476c8e18d11d',	'0833c3de-c688-491a-9e4e-0c6e7e3982fc',	'2025-11-22 07:43:04',	0,	'2025-11-21 07:43:03',	0),
('17bb1568-7361-4d3a-8bf2-8dcc13676618',	'57604cf96d4e1f9e4d0fbc2288dc260594ef3d437a99d42353587abe9b04c3d4',	'c43c9948-4850-43af-a034-9fff4d9202ac',	'2025-11-13 06:52:01',	0,	'2025-11-12 06:52:00',	0),
('39a19e07-e6b1-4b98-a129-bdd637d91fc5',	'4b345a93a492c77f3d4c399cb2c9cc1747078907f9f2c573ec24e5411e04c28a',	'0fdff85b-7e84-4604-8fc3-1de611762188',	'2025-11-22 07:49:28',	0,	'2025-11-21 07:49:27',	0),
('40e268fb-d3b9-43fc-be83-0bd841dc1da5',	'40451ea3ebef041ece23ad7cefe2d66313f63045c684ec98dc9724bd38768001',	'416b9715-3f37-439a-b4c1-1a2770039b6c',	'2025-11-13 06:55:57',	0,	'2025-11-12 06:55:56',	0),
('49efb4af-2ebe-4fd8-9128-f14c0c85db46',	'629a2003a3ab77e70c56990ab766cd49fc9c79f4c9e528774ae4d3e165cb0e00',	'ee4b89f3-e610-4bc4-9af6-10f69eb9c439',	'2025-11-22 04:10:15',	0,	'2025-11-21 04:10:15',	0),
('51e09426-c5b6-49cd-b5bf-7e138a176a0e',	'b00659e556e8f29afd2990f28532602a11dbdced1e55fd6125d6328f7fa655cc',	'88a84968-25da-4a89-bfc8-71d2cb0abfba',	'2025-10-31 22:25:13',	0,	'2025-10-30 15:25:12',	0),
('6a85af14-0410-4c75-a27c-ed5f62f034e0',	'acb17539566def02f46218ab55451c5331148f426a032e63fa4826d153a3d5d2',	'876cace3-4676-4cc3-9c72-128d93da2e4d',	'2025-11-13 10:35:06',	0,	'2025-11-12 10:35:05',	1),
('6d84c5c2-4059-418e-9b02-d5e6c82c5ee3',	'516316773f453c84391736c6ae7686c66ca8c0bd47fad95a0c87ca799f22fd17',	'e760af05-d043-4ecd-bc3e-91155c3f93c1',	'2025-11-22 07:10:42',	0,	'2025-11-21 07:10:41',	0),
('7a1da0ab-dbdc-482f-8bca-2acab766b7c8',	'd15501bf4ca566bb2679848553efa94eacbac8ceb3723e733f49be567f6dea36',	'4c62c3fb-484a-4803-a347-c4d4d718b635',	'2025-11-22 05:09:23',	0,	'2025-11-21 05:09:22',	0),
('7f920808-9aec-4052-bd80-86ab099c6192',	'b7a03ea23576b8d59efca9d1aa367c215703865d511a6107eff34300724fdf7a',	'1d712a14-8971-47ac-87cb-3123e0caa35c',	'2025-11-13 07:08:36',	0,	'2025-11-12 07:08:36',	0),
('8313cd9d-e6c6-4108-a52e-bfd2995d7da1',	'4a2556c216b07010f62232499ee263966342386bbb7df72e47b8938e96acb8f0',	'b2b805e6-f769-4714-b3b8-104b52e6cd39',	'2025-11-13 07:09:52',	0,	'2025-11-12 07:09:51',	0),
('84f1db9e-5526-42b2-a5ad-62d685466d3c',	'a7e157eb30685a941a896ceec65980703a7f1ee24c14bef9fd72bae8850ec581',	'6b9e8eed-333f-4747-8a62-732e810aa64b',	'2025-11-22 05:09:24',	0,	'2025-11-21 05:09:23',	0),
('8dd57a46-6697-4555-968e-eb72caeca75c',	'6113a965d11671a8620d8c1d5b902d9d9578b032b9ce32893d93343318295e4f',	'5de6e054-4bde-4430-98f2-72c7acccb3da',	'2025-11-22 06:59:33',	0,	'2025-11-21 06:59:32',	1),
('96582a6e-4e10-405e-a287-c6c42e0c6d68',	'ab8736aa36d831a28b8d1015f62d2a4eebf6c0770f4c1888ca59558583ee6a75',	'612cd880-c185-417c-8423-66638cfbef4a',	'2025-11-22 05:19:55',	0,	'2025-11-21 05:19:54',	0),
('a1effb84-ea16-4d6b-ada7-b0f54d3cc11e',	'be37ce28c620f3deadfe579034e0ac1fcc424ba9b51dfe7e758a993af2b03212',	'916d9652-a0dc-4270-8411-f141b4ff8043',	'2025-11-22 05:10:15',	0,	'2025-11-21 05:10:15',	0),
('b6eba184-9213-42e2-856e-4877a70f9cd8',	'6f881ac1e39f1fbd169ff42e45d12423abd3f58d463b8271e417c6db162c51bc',	'c6f06f35-d762-468e-beb5-875fd9682d18',	'2025-11-22 04:33:00',	0,	'2025-11-21 04:32:59',	0),
('bc900f88-4cef-4587-8492-4885c7366760',	'22b229c82983b2abeef9c783a9a7a64b309f28f426a312dd010d6765be1593c0',	'fdbdfcca-435a-4886-aad7-6e597f46506e',	'2025-11-22 04:10:24',	0,	'2025-11-21 04:10:23',	0),
('bcda763b-5ddf-4f6c-8fbd-116b68a751e9',	'b9c04e8769256992faa864197cf6a69bbb831aea57ea302e04e3d8d1a4aa992a',	'd2a2d7e2-b139-4ee8-a028-89de6b7d6a6b',	'2025-11-13 07:04:08',	0,	'2025-11-12 07:04:07',	0),
('c916f7c1-1e6c-4b84-936a-86ba893ffbdd',	'1a437393ab85a0d67742149d50fcddb91b496f589cce029ad063e2006d6860e7',	'4e60dac4-99a6-4e29-b6a8-ac2ffe676a15',	'2025-11-13 06:57:11',	0,	'2025-11-12 06:57:11',	0),
('d63b588f-0a3a-4aff-8120-89c62c130f67',	'86fa6c5e77cc678b8ee1db835df363835907c29829ef7577fdbb8cbdc3c72d48',	'30227daf-9c3c-40c9-80a0-b0c8e6db257b',	'2025-11-22 04:37:18',	0,	'2025-11-21 04:37:17',	0),
('da7ce770-fa48-4d4e-9073-2a72e4bcabfb',	'6dff9ed7b1ce2ea52e87b922fb75597b66d44a2c2f3603577175927470897c7c',	'974f6346-0918-4434-be77-f99fcb24d2d7',	'2025-11-22 04:57:25',	0,	'2025-11-21 04:57:24',	0),
('efe6655d-2e79-4352-ac77-8d200d2fc99f',	'afd9b6f4e64a00f8a79df0d58063f20a71c0dbdfa8737413bf7ce96727365e4b',	'94d1d013-a811-45cb-8e51-c7f755be185f',	'2025-11-22 05:09:24',	0,	'2025-11-21 05:09:23',	0),
('f1d9d0f5-c2ca-4986-a891-9dc2e2960021',	'7325686bc7f73ce35b39d25adba882017832fe39c0f3e019d52d36416741e41d',	'53c5f663-a5b7-4e11-a1f2-23d82e6f4c0d',	'2025-11-13 07:06:43',	0,	'2025-11-12 07:06:43',	0),
('ffa1bb55-9c17-441c-98ab-c0009fcecc56',	'e60ed803ccddb7b456f3a86557c956f1ee4cd23cb576171998d561943740e60f',	'80a78c3d-b280-414f-bd4d-35054c455f92',	'2025-11-22 04:57:18',	0,	'2025-11-21 04:57:18',	0);

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
('81000000-0000-4000-8000-000000000001',	'10000000-0000-4000-8000-000000000001',	'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3',	'44444444-4444-4444-4444-444444444444',	'33333333-3333-3333-3333-333333333333',	1,	'2025-11-11 06:33:14'),
('82000000-0000-4000-8000-000000000002',	'10000000-0000-4000-8000-000000000001',	'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',	'33333333-3333-3333-3333-333333333333',	'44444444-4444-4444-4444-444444444444',	2,	'2025-11-11 06:33:14'),
('83000000-0000-4000-8000-000000000003',	'20000000-0000-4000-8000-000000000002',	'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',	'22222222-2222-2222-2222-222222222222',	'33333333-3333-3333-3333-333333333333',	1,	'2025-11-13 06:33:14'),
('84000000-0000-4000-8000-000000000004',	'20000000-0000-4000-8000-000000000002',	'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',	'33333333-3333-3333-3333-333333333333',	'22222222-2222-2222-2222-222222222222',	2,	'2025-11-13 06:33:14'),
('85000000-0000-4000-8000-000000000005',	'30000000-0000-4000-8000-000000000003',	'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3',	'44444444-4444-4444-4444-444444444444',	'66666666-6666-6666-6666-666666666666',	1,	'2025-11-14 06:33:14'),
('86000000-0000-4000-8000-000000000006',	'30000000-0000-4000-8000-000000000003',	'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5',	'66666666-6666-6666-6666-666666666666',	'44444444-4444-4444-4444-444444444444',	2,	'2025-11-14 06:33:14'),
('87000000-0000-4000-8000-000000000007',	'40000000-0000-4000-8000-000000000004',	'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4',	'55555555-5555-5555-5555-555555555555',	'66666666-6666-6666-6666-666666666666',	1,	'2025-11-15 06:33:14'),
('88000000-0000-4000-8000-000000000008',	'40000000-0000-4000-8000-000000000004',	'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5',	'66666666-6666-6666-6666-666666666666',	'55555555-5555-5555-5555-555555555555',	2,	'2025-11-15 06:33:14'),
('89000000-0000-4000-8000-000000000009',	'50000000-0000-4000-8000-000000000005',	'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6',	'44444444-4444-4444-4444-444444444444',	'55555555-5555-5555-5555-555555555555',	1,	'2025-11-17 06:33:14'),
('8a000000-0000-4000-8000-000000000010',	'50000000-0000-4000-8000-000000000005',	'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4',	'55555555-5555-5555-5555-555555555555',	'44444444-4444-4444-4444-444444444444',	2,	'2025-11-17 06:33:14'),
('8b000000-0000-4000-8000-000000000011',	'60000000-0000-4000-8000-000000000006',	'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',	'33333333-3333-3333-3333-333333333333',	'22222222-2222-2222-2222-222222222222',	1,	'2025-11-18 06:33:14'),
('8c000000-0000-4000-8000-000000000012',	'60000000-0000-4000-8000-000000000006',	'aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaa7',	'22222222-2222-2222-2222-222222222222',	'33333333-3333-3333-3333-333333333333',	2,	'2025-11-18 06:33:14'),
('8d000000-0000-4000-8000-000000000013',	'70000000-0000-4000-8000-000000000007',	'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6',	'44444444-4444-4444-4444-444444444444',	'22222222-2222-2222-2222-222222222222',	1,	'2025-11-20 06:33:14'),
('8e000000-0000-4000-8000-000000000014',	'70000000-0000-4000-8000-000000000007',	'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',	'22222222-2222-2222-2222-222222222222',	'44444444-4444-4444-4444-444444444444',	2,	'2025-11-20 06:33:14');

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
('erb00001-0000-0000-0000-000000000001',	'req00001-0000-0000-0000-000000000001',	'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3',	1,	'OFFERED',	'2025-11-10 06:33:14'),
('erb00002-0000-0000-0000-000000000002',	'req00001-0000-0000-0000-000000000001',	'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',	0,	'REQUESTED',	'2025-11-10 06:33:14'),
('erb00003-0000-0000-0000-000000000003',	'req00002-0000-0000-0000-000000000002',	'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',	1,	'OFFERED',	'2025-11-12 06:33:14'),
('erb00004-0000-0000-0000-000000000004',	'req00002-0000-0000-0000-000000000002',	'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',	0,	'REQUESTED',	'2025-11-12 06:33:14'),
('erb00005-0000-0000-0000-000000000005',	'req00003-0000-0000-0000-000000000003',	'aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3',	1,	'OFFERED',	'2025-11-13 06:33:14'),
('erb00006-0000-0000-0000-000000000006',	'req00003-0000-0000-0000-000000000003',	'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5',	0,	'REQUESTED',	'2025-11-13 06:33:14'),
('erb00007-0000-0000-0000-000000000007',	'req00004-0000-0000-0000-000000000004',	'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4',	1,	'OFFERED',	'2025-11-14 06:33:14'),
('erb00008-0000-0000-0000-000000000008',	'req00004-0000-0000-0000-000000000004',	'aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5',	0,	'REQUESTED',	'2025-11-14 06:33:14'),
('erb00009-0000-0000-0000-000000000009',	'req00005-0000-0000-0000-000000000005',	'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6',	1,	'OFFERED',	'2025-11-16 06:33:14'),
('erb00010-0000-0000-0000-000000000010',	'req00005-0000-0000-0000-000000000005',	'aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4',	0,	'REQUESTED',	'2025-11-16 06:33:14'),
('erb00011-0000-0000-0000-000000000011',	'req00006-0000-0000-0000-000000000006',	'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2',	1,	'OFFERED',	'2025-11-17 06:33:14'),
('erb00012-0000-0000-0000-000000000012',	'req00006-0000-0000-0000-000000000006',	'aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaa7',	0,	'REQUESTED',	'2025-11-17 06:33:14'),
('erb00013-0000-0000-0000-000000000013',	'req00007-0000-0000-0000-000000000007',	'aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6',	1,	'OFFERED',	'2025-11-19 06:33:14'),
('erb00014-0000-0000-0000-000000000014',	'req00007-0000-0000-0000-000000000007',	'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1',	0,	'REQUESTED',	'2025-11-19 06:33:14');

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
('req00001-0000-0000-0000-000000000001',	'44444444-4444-4444-4444-444444444444',	'33333333-3333-3333-3333-333333333333',	'ACCEPTED',	'Swap Design Patterns for Refactoring',	NULL,	'2025-11-10 06:33:14',	NULL,	'2025-11-11 06:33:14'),
('req00002-0000-0000-0000-000000000002',	'22222222-2222-2222-2222-222222222222',	'33333333-3333-3333-3333-333333333333',	'ACCEPTED',	'Request Clean Code vs Refactoring',	NULL,	'2025-11-12 06:33:14',	NULL,	'2025-11-13 06:33:14'),
('req00003-0000-0000-0000-000000000003',	'44444444-4444-4444-4444-444444444444',	'66666666-6666-6666-6666-666666666666',	'ACCEPTED',	'Swap Design Patterns vs Pragmatic',	NULL,	'2025-11-13 06:33:14',	NULL,	'2025-11-14 06:33:14'),
('req00004-0000-0000-0000-000000000004',	'55555555-5555-5555-5555-555555555555',	'66666666-6666-6666-6666-666666666666',	'ACCEPTED',	'Try DDD for Pragmatic',	NULL,	'2025-11-14 06:33:14',	NULL,	'2025-11-15 06:33:14'),
('req00005-0000-0000-0000-000000000005',	'44444444-4444-4444-4444-444444444444',	'55555555-5555-5555-5555-555555555555',	'ACCEPTED',	'Clean Architecture vs DDD',	NULL,	'2025-11-16 06:33:14',	NULL,	'2025-11-17 06:33:14'),
('req00006-0000-0000-0000-000000000006',	'33333333-3333-3333-3333-333333333333',	'22222222-2222-2222-2222-222222222222',	'ACCEPTED',	'Refactoring for Distributed Systems',	NULL,	'2025-11-17 06:33:14',	NULL,	'2025-11-18 06:33:14'),
('req00007-0000-0000-0000-000000000007',	'44444444-4444-4444-4444-444444444444',	'22222222-2222-2222-2222-222222222222',	'PENDING',	'Offer Clean Architecture vs Clean Code',	NULL,	'2025-11-19 06:33:14',	NULL,	'2025-11-20 06:33:14');

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
  `status` enum('PENDING','ACCEPTED','COMPLETED','CANCELLED','EXPIRED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `member_a_confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `member_b_confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `confirmed_by_a_at` timestamp NULL DEFAULT NULL,
  `confirmed_by_b_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancellation_reason` enum('USER_CANCELLED','AUTO_EXPIRED','DISPUTE','NO_SHOW','BOTH_NO_SHOW','ADMIN_CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cancellation_note` text COLLATE utf8mb4_unicode_ci,
  `expires_at` timestamp NULL DEFAULT NULL,
  `meeting_location` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meeting_time` timestamp NULL DEFAULT NULL,
  `meeting_notes` text COLLATE utf8mb4_unicode_ci,
  `meeting_updated_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meeting_updated_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`exchange_id`),
  UNIQUE KEY `request_id` (`request_id`),
  KEY `idx_exchanges_memberA_status` (`member_a_id`,`status`,`created_at`),
  KEY `idx_exchanges_memberB_status` (`member_b_id`,`status`,`created_at`),
  KEY `idx_exchanges_expires_status` (`expires_at`,`status`),
  KEY `fk_exchanges_cancelled_by` (`cancelled_by`),
  KEY `idx_exchanges_meeting_time` (`meeting_time`),
  KEY `fk_exchanges_meeting_updated_by` (`meeting_updated_by`),
  CONSTRAINT `fk_exchanges_cancelled_by` FOREIGN KEY (`cancelled_by`) REFERENCES `members` (`member_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_exchanges_meeting_updated_by` FOREIGN KEY (`meeting_updated_by`) REFERENCES `members` (`member_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_exchanges_member_a` FOREIGN KEY (`member_a_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exchanges_member_b` FOREIGN KEY (`member_b_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exchanges_request` FOREIGN KEY (`request_id`) REFERENCES `exchange_requests` (`request_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `exchanges` (`exchange_id`, `request_id`, `member_a_id`, `member_b_id`, `status`, `member_a_confirmed`, `member_b_confirmed`, `confirmed_by_a_at`, `confirmed_by_b_at`, `completed_at`, `cancelled_at`, `cancelled_by`, `cancellation_reason`, `cancellation_note`, `expires_at`, `meeting_location`, `meeting_time`, `meeting_notes`, `meeting_updated_by`, `meeting_updated_at`, `created_at`, `updated_at`) VALUES
('10000000-0000-4000-8000-000000000001',	'req00001-0000-0000-0000-000000000001',	'44444444-4444-4444-4444-444444444444',	'33333333-3333-3333-3333-333333333333',	'COMPLETED',	1,	1,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	'Central Library',	'2025-11-22 06:33:14',	'Bring both books',	NULL,	NULL,	'2025-11-11 06:33:14',	'2025-11-12 06:33:14'),
('20000000-0000-4000-8000-000000000002',	'req00002-0000-0000-0000-000000000002',	'22222222-2222-2222-2222-222222222222',	'33333333-3333-3333-3333-333333333333',	'CANCELLED',	0,	0,	NULL,	NULL,	NULL,	NULL,	NULL,	'USER_CANCELLED',	NULL,	NULL,	'Cafe District 1',	'2025-11-23 06:33:14',	'Too busy to meet',	NULL,	NULL,	'2025-11-13 06:33:14',	'2025-11-13 06:33:14'),
('30000000-0000-4000-8000-000000000003',	'req00003-0000-0000-0000-000000000003',	'44444444-4444-4444-4444-444444444444',	'66666666-6666-6666-6666-666666666666',	'CANCELLED',	1,	0,	NULL,	NULL,	NULL,	NULL,	NULL,	'NO_SHOW',	NULL,	NULL,	'Co-working Space',	'2025-11-15 06:33:14',	'Did not appear',	NULL,	NULL,	'2025-11-14 06:33:14',	'2025-11-14 06:33:14'),
('40000000-0000-4000-8000-000000000004',	'req00004-0000-0000-0000-000000000004',	'55555555-5555-5555-5555-555555555555',	'66666666-6666-6666-6666-666666666666',	'CANCELLED',	0,	0,	NULL,	NULL,	NULL,	NULL,	NULL,	'BOTH_NO_SHOW',	NULL,	NULL,	'Metro Station',	'2025-11-16 06:33:14',	'None came',	NULL,	NULL,	'2025-11-15 06:33:14',	'2025-11-16 06:33:14'),
('50000000-0000-4000-8000-000000000005',	'req00005-0000-0000-0000-000000000005',	'44444444-4444-4444-4444-444444444444',	'55555555-5555-5555-5555-555555555555',	'CANCELLED',	1,	1,	NULL,	NULL,	NULL,	NULL,	NULL,	'DISPUTE',	NULL,	NULL,	'Bookstore District 3',	'2025-11-18 06:33:14',	'Disagreement about book condition',	NULL,	NULL,	'2025-11-17 06:33:14',	'2025-11-18 06:33:14'),
('60000000-0000-4000-8000-000000000006',	'req00006-0000-0000-0000-000000000006',	'33333333-3333-3333-3333-333333333333',	'22222222-2222-2222-2222-222222222222',	'EXPIRED',	0,	1,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	'Online meet',	'2025-11-20 06:33:14',	'MediumUser never confirmed',	NULL,	NULL,	'2025-11-18 06:33:14',	'2025-11-19 06:33:14'),
('70000000-0000-4000-8000-000000000007',	'req00007-0000-0000-0000-000000000007',	'44444444-4444-4444-4444-444444444444',	'22222222-2222-2222-2222-222222222222',	'PENDING',	0,	0,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	NULL,	'City Park',	'2025-11-23 06:33:14',	'Awaiting acceptance',	NULL,	NULL,	'2025-11-20 06:33:14',	'2025-11-20 06:33:14');

DROP TABLE IF EXISTS `members`;
CREATE TABLE `members` (
  `member_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `bio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `trust_score` decimal(5,2) DEFAULT '50.00',
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
('11111111-1111-1111-1111-111111111111',	'00000000-0000-0000-0000-000000000001',	NULL,	NULL,	NULL,	NULL,	5.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('144203ce-a21f-4e98-a104-e5d25a1ed469',	'0833c3de-c688-491a-9e4e-0c6e7e3982fc',	NULL,	NULL,	NULL,	NULL,	50.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-21 07:43:03',	'2025-11-21 07:43:03'),
('17b3aa43-5821-4cb9-9832-c8fae9b92e08',	'e760af05-d043-4ecd-bc3e-91155c3f93c1',	NULL,	NULL,	NULL,	NULL,	50.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-21 07:10:41',	'2025-11-21 07:10:41'),
('22222222-2222-2222-2222-222222222222',	'00000000-0000-0000-0000-000000000002',	NULL,	NULL,	NULL,	NULL,	15.00,	0.0,	0,	NULL,	2,	0,	1,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('33333333-3333-3333-3333-333333333333',	'00000000-0000-0000-0000-000000000003',	NULL,	NULL,	NULL,	NULL,	30.00,	0.0,	0,	NULL,	3,	1,	1,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('42d64038-34f3-4c4a-98fa-ceb102775492',	'0fdff85b-7e84-4604-8fc3-1de611762188',	NULL,	NULL,	NULL,	NULL,	50.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-21 07:49:27',	'2025-11-21 07:49:27'),
('44444444-4444-4444-4444-444444444444',	'00000000-0000-0000-0000-000000000004',	NULL,	NULL,	NULL,	NULL,	65.00,	0.0,	0,	NULL,	5,	2,	1,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('55555555-5555-5555-5555-555555555555',	'00000000-0000-0000-0000-000000000005',	NULL,	NULL,	NULL,	NULL,	45.00,	0.0,	0,	NULL,	4,	1,	2,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('66666666-6666-6666-6666-666666666666',	'00000000-0000-0000-0000-000000000006',	NULL,	NULL,	NULL,	NULL,	40.00,	0.0,	0,	NULL,	3,	0,	2,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('b1a033f2-607d-413d-b47c-0ad3bedd705a',	'5de6e054-4bde-4430-98f2-72c7acccb3da',	NULL,	NULL,	NULL,	NULL,	50.00,	0.0,	0,	NULL,	0,	0,	0,	'2025-11-21 06:59:32',	'2025-11-21 06:59:32'),
('f8392a1a-b5a5-490a-9512-6b3f923dee41',	'test-user-bob-002',	'Hà Nội',	'0901234568',	'Đống Đa, Hà Nội',	'Fiction and fantasy enthusiast',	80.00,	0.0,	1,	NULL,	8,	7,	0,	'2025-11-21 08:02:16',	'2025-11-21 08:02:16'),
('f8392a1a-b5a5-490a-9512-6b3f923dee4e',	'test-user-alice-001',	'Hà Nội',	'0901234567',	'Cầu Giấy, Hà Nội',	'Love tech books and programming',	75.00,	0.0,	1,	NULL,	5,	4,	0,	'2025-11-21 08:02:16',	'2025-11-21 08:02:16'),
('seed-member-bella',	'test-user-carol-003',	'Hồ Chí Minh',	'0901234569',	'Quận 1, TP.HCM',	'Business and entrepreneurship',	70.00,	0.0,	1,	NULL,	3,	3,	0,	'2025-11-21 08:02:16',	'2025-11-21 08:02:16'),
('seed-member-diego',	'test-user-david-004',	'Hồ Chí Minh',	'0901234570',	'Quận 3, TP.HCM',	'Personal development reader',	65.00,	0.0,	1,	NULL,	2,	2,	0,	'2025-11-21 08:02:16',	'2025-11-21 08:02:16'),
('seed-member-nam',	'test-user-eve-005',	'Đà Nẵng',	'0901234571',	'Hải Châu, Đà Nẵng',	'Parent looking for children books',	85.00,	0.0,	1,	NULL,	10,	9,	0,	'2025-11-21 08:02:16',	'2025-11-21 08:02:16');

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
('b1000000-0000-4000-8000-000000000001',	'a1000000-0000-4000-8000-000000000001',	'44444444-4444-4444-4444-444444444444',	'22222222-2222-2222-2222-222222222222',	'Hi, interested in your Clean Code book!',	0,	NULL,	'2025-11-20 06:33:14',	NULL,	'2025-11-20 06:33:14',	'TEXT',	NULL,	0,	NULL),
('b2000000-0000-4000-8000-000000000002',	'a1000000-0000-4000-8000-000000000001',	'22222222-2222-2222-2222-222222222222',	'44444444-4444-4444-4444-444444444444',	'Sure, would you trade Design Patterns?',	0,	NULL,	'2025-11-20 06:33:14',	NULL,	'2025-11-20 06:33:14',	'TEXT',	NULL,	0,	NULL),
('b3000000-0000-4000-8000-000000000003',	'a2000000-0000-4000-8000-000000000002',	'44444444-4444-4444-4444-444444444444',	'66666666-6666-6666-6666-666666666666',	'You missed the meeting yesterday.',	0,	NULL,	'2025-11-14 06:33:14',	NULL,	'2025-11-14 06:33:14',	'TEXT',	NULL,	0,	NULL),
('b4000000-0000-4000-8000-000000000004',	'a2000000-0000-4000-8000-000000000002',	'66666666-6666-6666-6666-666666666666',	'44444444-4444-4444-4444-444444444444',	'Sorry, something came up.',	0,	NULL,	'2025-11-14 06:33:14',	NULL,	'2025-11-14 06:33:14',	'TEXT',	NULL,	0,	NULL);

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
('9c5f1497-c48a-47fa-8845-0a63c901b790',	'f8392a1a-b5a5-490a-9512-6b3f923dee4e',	2,	7,	'2025-11-16 19:39:18',	'2025-10-31 06:21:32'),
('lib-vip-user',	'44444444-4444-4444-4444-444444444444',	2,	5,	'2025-11-21 08:33:00',	'2025-11-21 06:33:14'),
('lib-medium-user',	'33333333-3333-3333-3333-333333333333',	0,	3,	'2025-11-21 08:33:00',	'2025-11-21 06:33:14'),
('lib-limited-user',	'22222222-2222-2222-2222-222222222222',	0,	2,	'2025-11-21 08:33:00',	'2025-11-21 06:33:14'),
('lib-disputer-user',	'55555555-5555-5555-5555-555555555555',	1,	3,	'2025-11-21 08:33:00',	'2025-11-21 06:33:14'),
('lib-noshow-user',	'66666666-6666-6666-6666-666666666666',	0,	2,	'2025-11-21 08:33:00',	'2025-11-21 06:33:14'),
('seed-lib-bella',	'seed-member-bella',	0,	2,	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('seed-lib-diego',	'seed-member-diego',	0,	1,	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('seed-lib-nam',	'seed-member-nam',	0,	1,	'2025-11-02 14:10:19',	'2025-11-02 14:10:19'),
('test-lib-bob',	'f8392a1a-b5a5-490a-9512-6b3f923dee41',	0,	8,	'2025-11-02 17:43:36',	'2025-11-02 06:32:16');

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

INSERT INTO `reviews` (`review_id`, `exchange_id`, `reviewer_id`, `reviewee_id`, `rating`, `comment`, `trust_score_impact`, `created_at`, `updated_at`) VALUES
('91000000-0000-4000-8000-000000000001',	'10000000-0000-4000-8000-000000000001',	'44444444-4444-4444-4444-444444444444',	'33333333-3333-3333-3333-333333333333',	5,	'Great exchange, smooth process!',	0.00,	'2025-11-12 06:33:14',	'2025-11-12 06:33:14'),
('92000000-0000-4000-8000-000000000002',	'10000000-0000-4000-8000-000000000001',	'33333333-3333-3333-3333-333333333333',	'44444444-4444-4444-4444-444444444444',	4,	'Book as described.',	0.00,	'2025-11-12 06:33:14',	'2025-11-12 06:33:14'),
('93000000-0000-4000-8000-000000000003',	'50000000-0000-4000-8000-000000000005',	'55555555-5555-5555-5555-555555555555',	'44444444-4444-4444-4444-444444444444',	2,	'Dispute about quality.',	0.00,	'2025-11-18 06:33:14',	'2025-11-18 06:33:14'),
('94000000-0000-4000-8000-000000000004',	'50000000-0000-4000-8000-000000000005',	'44444444-4444-4444-4444-444444444444',	'55555555-5555-5555-5555-555555555555',	1,	'Condition not as stated.',	0.00,	'2025-11-18 06:33:14',	'2025-11-18 06:33:14');

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
('c1000000-0000-4000-8000-000000000001',	'00000000-0000-0000-0000-000000000004',	'CREATE_EXCHANGE_REQUEST',	'EXCHANGE_REQUEST',	'req00007-0000-0000-0000-000000000007',	'{\"info\": \"Created request\"}',	NULL,	NULL,	'2025-11-19 06:33:14'),
('c2000000-0000-4000-8000-000000000002',	'00000000-0000-0000-0000-000000000002',	'ACCEPT_EXCHANGE_REQUEST',	'EXCHANGE_REQUEST',	'req00002-0000-0000-0000-000000000002',	'{\"info\": \"Accepted request\"}',	NULL,	NULL,	'2025-11-13 06:33:14'),
('c3000000-0000-4000-8000-000000000003',	'00000000-0000-0000-0000-000000000006',	'SEND_MESSAGE',	'MESSAGE',	'b3000000-0000-4000-8000-000000000003',	'{\"content\": \"You missed the meeting\"}',	NULL,	NULL,	'2025-11-14 06:33:14'),
('c4000000-0000-4000-8000-000000000004',	'00000000-0000-0000-0000-000000000004',	'CREATE_REVIEW',	'REVIEW',	'91000000-0000-4000-8000-000000000001',	'{\"rating\": 5}',	NULL,	NULL,	'2025-11-12 06:33:14');

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
('00000000-0000-0000-0000-000000000001',	'banned@test.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	NULL,	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	0,	NULL,	NULL,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('00000000-0000-0000-0000-000000000002',	'limited@test.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	NULL,	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('00000000-0000-0000-0000-000000000003',	'medium@test.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	NULL,	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('00000000-0000-0000-0000-000000000004',	'vip@test.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	NULL,	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('00000000-0000-0000-0000-000000000005',	'disputer@test.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	NULL,	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('00000000-0000-0000-0000-000000000006',	'noshow@test.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	NULL,	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('00000000-0000-0000-0000-000000000007',	'admin@test.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	NULL,	NULL,	'ADMIN',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-21 06:33:14',	'2025-11-21 06:33:14'),
('0833c3de-c688-491a-9e4e-0c6e7e3982fc',	'testfull@exchange.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	'Test Full Exchange',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	0,	NULL,	NULL,	NULL,	'2025-11-21 07:43:03',	'2025-11-21 07:43:03'),
('0fdff85b-7e84-4604-8fc3-1de611762188',	'testexchange@api.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	'Test Exchange API',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	0,	NULL,	NULL,	NULL,	'2025-11-21 07:49:27',	'2025-11-21 07:49:27'),
('5de6e054-4bde-4430-98f2-72c7acccb3da',	'hoanglhh0026@ut.edu.vn',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	'1111122237',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	'2025-11-21 06:59:49',	'2025-11-21 07:55:46',	NULL,	'2025-11-21 06:59:32',	'2025-11-21 07:55:45'),
('e760af05-d043-4ecd-bc3e-91155c3f93c1',	'test@test.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	'Test',	NULL,	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	0,	NULL,	NULL,	NULL,	'2025-11-21 07:10:41',	'2025-11-21 07:10:41'),
('test-user-alice-001',	'alice.test@bookswap.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	'Alice Nguyen',	'https://i.pravatar.cc/150?img=1',	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-21 08:02:16',	'2025-11-21 08:02:16'),
('test-user-bob-002',	'bob.test@bookswap.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	'Bob Tran',	'https://i.pravatar.cc/150?img=2',	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-21 08:02:16',	'2025-11-21 08:02:16'),
('test-user-carol-003',	'carol.test@bookswap.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	'Carol Le',	'https://i.pravatar.cc/150?img=3',	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-21 08:02:16',	'2025-11-21 08:02:16'),
('test-user-david-004',	'david.test@bookswap.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	'David Pham',	'https://i.pravatar.cc/150?img=4',	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-21 08:02:16',	'2025-11-21 08:02:16'),
('test-user-eve-005',	'eve.test@bookswap.com',	'$2a$12$4PU63cAtqiZJNlYdFHXCVOQTA8PXAl8cMz6LA40fP3nqaBBB/ylRy',	'Eve Hoang',	'https://i.pravatar.cc/150?img=5',	'MEMBER',	'ACTIVE',	'LOCAL',	NULL,	1,	NULL,	NULL,	NULL,	'2025-11-21 08:02:16',	'2025-11-21 08:02:16');

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
