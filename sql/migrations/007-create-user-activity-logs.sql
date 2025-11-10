-- ============================================================
-- Migration: 007-create-user-activity-logs.sql
-- Description: Tạo bảng user_activity_logs để tracking hành động của users
-- Author: System
-- Date: 2025-11-05
-- ============================================================

-- Tạo bảng user_activity_logs
CREATE TABLE IF NOT EXISTS `user_activity_logs` (
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
  KEY `idx_user_activity_user` (`user_id`, `created_at` DESC),
  KEY `idx_user_activity_action` (`action`),
  KEY `idx_user_activity_created` (`created_at` DESC),
  CONSTRAINT `fk_user_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log tất cả hành động của users để audit trail';

-- Thêm index để tối ưu query theo date range
CREATE INDEX `idx_user_activity_date_range` ON `user_activity_logs` (`user_id`, `created_at`);

-- Thêm index cho việc filter theo entity_type và entity_id
CREATE INDEX `idx_user_activity_entity` ON `user_activity_logs` (`entity_type`, `entity_id`);
