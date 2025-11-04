-- 004-create-notifications.sql
-- Create notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` varchar(36) NOT NULL,
  `member_id` varchar(36) NOT NULL,
  `notification_type` varchar(50) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` varchar(36) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  INDEX `idx_notifications_member` (`member_id`,`is_read`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add FK if members table exists
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notifications_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE;

-- End
