-- ============================================================
-- Migration: 008-create-admins-table.sql
-- Description: Tạo bảng admins và insert admin users từ users table
-- Author: System
-- Date: 2025-11-05
-- Dependencies: Phải có users table với role='ADMIN'
-- ============================================================

-- Tạo bảng admins
CREATE TABLE IF NOT EXISTS `admins` (
  `admin_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_level` int NOT NULL DEFAULT 1 COMMENT '1=Admin, 2=Super Admin, 3=Root Admin',
  `permissions` json DEFAULT NULL COMMENT 'JSON object chứa permissions chi tiết',
  `admin_since` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày được promote thành admin',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`admin_id`),
  UNIQUE KEY `uk_admin_user` (`user_id`),
  KEY `idx_admin_level` (`admin_level`),
  KEY `idx_admin_since` (`admin_since`),
  CONSTRAINT `fk_admin_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng quản lý admins và permissions';

-- Insert admin users từ users table (chỉ insert nếu chưa tồn tại)
INSERT INTO `admins` (`admin_id`, `user_id`, `admin_level`, `permissions`, `admin_since`)
SELECT 
  UUID() as admin_id,
  u.user_id,
  CASE 
    WHEN u.email LIKE '%root%' OR u.email = 'admin@bookswap.com' THEN 3  -- Root Admin
    WHEN u.email LIKE '%super%' THEN 2                                    -- Super Admin
    ELSE 1                                                                 -- Normal Admin
  END as admin_level,
  JSON_OBJECT('all', true) as permissions,  -- Full permissions cho existing admins
  u.created_at as admin_since
FROM `users` u
WHERE u.role = 'ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM `admins` a WHERE a.user_id = u.user_id
  );

-- Verify insertion
SELECT 
  a.admin_id,
  a.user_id,
  u.email,
  u.full_name,
  a.admin_level,
  a.admin_since
FROM admins a
INNER JOIN users u ON a.user_id = u.user_id
ORDER BY a.admin_level DESC, a.admin_since ASC;
hhhhhhhhhhhhhhhhhhhh