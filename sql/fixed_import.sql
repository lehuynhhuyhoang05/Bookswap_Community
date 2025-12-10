-- Fixed SQL Import Script
-- Đã sửa thứ tự tạo bảng và loại bỏ các lỗi

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

-- Drop and Create Database
DROP DATABASE IF EXISTS `bookswap_db`;
CREATE DATABASE `bookswap_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `bookswap_db`;

-- ============================================
-- STEP 1: Create base tables without foreign keys
-- ============================================

-- 1. Users table (base table)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `role` enum('GUEST','MEMBER','ADMIN') NOT NULL DEFAULT 'MEMBER',
  `account_status` enum('ACTIVE','LOCKED','SUSPENDED','DELETED') NOT NULL DEFAULT 'ACTIVE',
  `auth_provider` enum('LOCAL','GOOGLE') NOT NULL DEFAULT 'LOCAL',
  `google_id` varchar(255) DEFAULT NULL,
  `is_email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lock_reason` varchar(500) DEFAULT NULL,
  `locked_until` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_provider_googleid` (`auth_provider`,`google_id`),
  KEY `idx_users_google_id` (`google_id`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`account_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Members table (depends on users)
DROP TABLE IF EXISTS `members`;
CREATE TABLE `members` (
  `member_id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `bio` text,
  `trust_score` decimal(5,2) DEFAULT '50.00',
  `average_rating` decimal(2,1) NOT NULL DEFAULT '0.0',
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `is_online` tinyint(1) NOT NULL DEFAULT '0',
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `notification_settings` json DEFAULT NULL,
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
  KEY `idx_online_status` (`is_online`,`last_seen_at`),
  CONSTRAINT `fk_members_user` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`user_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Admins table
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `admin_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `admin_level` int NOT NULL DEFAULT '1',
  `permissions` json DEFAULT NULL,
  `admin_since` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `fk_admins_user` 
    FOREIGN KEY (`user_id`) 
    REFERENCES `users` (`user_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Personal Libraries
DROP TABLE IF EXISTS `personal_libraries`;
CREATE TABLE `personal_libraries` (
  `library_id` varchar(36) NOT NULL,
  `member_id` varchar(36) NOT NULL,
  `total_owned_books` int NOT NULL DEFAULT '0',
  `total_wanted_books` int NOT NULL DEFAULT '0',
  `last_updated` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`library_id`),
  UNIQUE KEY `member_id` (`member_id`),
  CONSTRAINT `fk_libraries_member` 
    FOREIGN KEY (`member_id`) 
    REFERENCES `members` (`member_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Books table
DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `book_id` varchar(36) NOT NULL,
  `owner_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `google_books_id` varchar(100) DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `description` text,
  `category` varchar(100) DEFAULT NULL,
  `language` varchar(50) NOT NULL DEFAULT 'vi',
  `page_count` int DEFAULT NULL,
  `cover_image_url` varchar(500) DEFAULT NULL,
  `book_condition` enum('LIKE_NEW','VERY_GOOD','GOOD','FAIR','POOR') DEFAULT NULL,
  `status` enum('AVAILABLE','EXCHANGING','REMOVED') NOT NULL DEFAULT 'AVAILABLE',
  `views` int NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_photos` json DEFAULT NULL,
  `condition_notes` text,
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
  CONSTRAINT `fk_books_owner` 
    FOREIGN KEY (`owner_id`) 
    REFERENCES `members` (`member_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Books Wanted
DROP TABLE IF EXISTS `books_wanted`;
CREATE TABLE `books_wanted` (
  `wanted_id` varchar(36) NOT NULL,
  `library_id` varchar(36) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `google_books_id` varchar(100) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `cover_image_url` varchar(500) DEFAULT NULL,
  `preferred_condition` enum('ANY','FAIR_UP','GOOD_UP','VERY_GOOD_UP','LIKE_NEW') DEFAULT 'ANY',
  `language` varchar(50) DEFAULT NULL,
  `priority` int DEFAULT '5',
  `notes` text,
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
  CONSTRAINT `fk_wanted_library` 
    FOREIGN KEY (`library_id`) 
    REFERENCES `personal_libraries` (`library_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Exchange Requests
DROP TABLE IF EXISTS `exchange_requests`;
CREATE TABLE `exchange_requests` (
  `request_id` varchar(36) NOT NULL,
  `requester_id` varchar(36) NOT NULL,
  `receiver_id` varchar(36) NOT NULL,
  `status` enum('PENDING','ACCEPTED','REJECTED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `message` text,
  `rejection_reason` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`request_id`),
  KEY `idx_exchange_requests_status` (`status`),
  KEY `idx_exchange_requests_receiver` (`receiver_id`,`status`),
  KEY `idx_exreq_requester_status_time` (`requester_id`,`status`,`created_at`),
  KEY `idx_requests_members_status` (`requester_id`,`receiver_id`,`status`),
  CONSTRAINT `fk_exreq_receiver` 
    FOREIGN KEY (`receiver_id`) 
    REFERENCES `members` (`member_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exreq_requester` 
    FOREIGN KEY (`requester_id`) 
    REFERENCES `members` (`member_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Exchanges
DROP TABLE IF EXISTS `exchanges`;
CREATE TABLE `exchanges` (
  `exchange_id` varchar(36) NOT NULL,
  `request_id` varchar(36) NOT NULL,
  `member_a_id` varchar(36) NOT NULL,
  `member_b_id` varchar(36) NOT NULL,
  `status` enum('PENDING','ACCEPTED','MEETING_SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED','EXPIRED') DEFAULT 'PENDING',
  `member_a_confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `member_b_confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `confirmed_by_a_at` timestamp NULL DEFAULT NULL,
  `confirmed_by_b_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` varchar(36) DEFAULT NULL,
  `cancellation_reason` enum('USER_CANCELLED','AUTO_EXPIRED','DISPUTE','NO_SHOW','BOTH_NO_SHOW','ADMIN_CANCELLED') DEFAULT NULL,
  `cancellation_note` text,
  `expires_at` timestamp NULL DEFAULT NULL,
  `meeting_location` varchar(500) DEFAULT NULL,
  `meeting_time` timestamp NULL DEFAULT NULL,
  `meeting_notes` text,
  `meeting_latitude` decimal(10,7) DEFAULT NULL,
  `meeting_longitude` decimal(10,7) DEFAULT NULL,
  `meeting_confirmed_by_a` tinyint(1) DEFAULT '0',
  `meeting_confirmed_by_b` tinyint(1) DEFAULT '0',
  `meeting_scheduled_at` timestamp NULL DEFAULT NULL,
  `meeting_scheduled_by` varchar(36) DEFAULT NULL,
  `meeting_updated_by` varchar(36) DEFAULT NULL,
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
  CONSTRAINT `fk_exchanges_cancelled_by` 
    FOREIGN KEY (`cancelled_by`) 
    REFERENCES `members` (`member_id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_exchanges_meeting_updated_by` 
    FOREIGN KEY (`meeting_updated_by`) 
    REFERENCES `members` (`member_id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_exchanges_member_a` 
    FOREIGN KEY (`member_a_id`) 
    REFERENCES `members` (`member_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exchanges_member_b` 
    FOREIGN KEY (`member_b_id`) 
    REFERENCES `members` (`member_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_exchanges_request` 
    FOREIGN KEY (`request_id`) 
    REFERENCES `exchange_requests` (`request_id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Continue with remaining tables...
-- (Các bảng còn lại tương tự, tôi sẽ tạo file đầy đủ)

SET foreign_key_checks = 1;
