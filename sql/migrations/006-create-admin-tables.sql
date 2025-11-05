-- ============================================================
-- Migration 006: Create Admin System Tables
-- Tạo 2 bảng: audit_logs và violation_reports
-- ============================================================

-- Bảng audit_logs: Log tất cả hành động của admin
CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id VARCHAR(36) PRIMARY KEY,
    admin_id VARCHAR(36) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    action ENUM(
        'LOCK_USER',
        'UNLOCK_USER',
        'DELETE_USER',
        'UPDATE_ROLE',
        'REMOVE_BOOK',
        'RESTORE_BOOK',
        'REMOVE_REVIEW',
        'RESOLVE_REPORT',
        'DISMISS_REPORT'
    ) NOT NULL,
    entity_type VARCHAR(50) NOT NULL COMMENT 'USER, BOOK, REVIEW, REPORT, etc.',
    entity_id VARCHAR(36) NOT NULL COMMENT 'ID của entity bị tác động',
    old_value JSON DEFAULT NULL COMMENT 'Giá trị cũ trước khi thay đổi',
    new_value JSON DEFAULT NULL COMMENT 'Giá trị mới sau khi thay đổi',
    reason TEXT DEFAULT NULL COMMENT 'Lý do thực hiện action',
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_admin_created (admin_id, created_at),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng violation_reports: Reports từ members về vi phạm
CREATE TABLE IF NOT EXISTS violation_reports (
    report_id VARCHAR(36) PRIMARY KEY,
    reporter_id VARCHAR(36) NOT NULL COMMENT 'Member_id của người report',
    report_type ENUM(
        'INAPPROPRIATE_CONTENT',
        'SPAM',
        'HARASSMENT',
        'FRAUD',
        'FAKE_PROFILE',
        'OTHER'
    ) NOT NULL,
    target_type VARCHAR(50) NOT NULL COMMENT 'USER, BOOK, REVIEW, MESSAGE, etc.',
    target_id VARCHAR(36) NOT NULL COMMENT 'ID của entity bị report',
    description TEXT NOT NULL,
    evidence JSON DEFAULT NULL COMMENT 'Screenshot URLs, links, etc.',
    status ENUM('PENDING', 'IN_REVIEW', 'RESOLVED', 'DISMISSED') DEFAULT 'PENDING',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    resolution TEXT DEFAULT NULL COMMENT 'Kết luận sau khi xử lý',
    action_taken TEXT DEFAULT NULL COMMENT 'Hành động đã thực hiện',
    assigned_to VARCHAR(36) DEFAULT NULL COMMENT 'Admin_id được assign',
    resolved_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reporter_id) REFERENCES members(member_id) ON DELETE CASCADE,
    
    INDEX idx_reporter (reporter_id),
    INDEX idx_status_priority (status, priority, created_at),
    INDEX idx_target (target_type, target_id),
    INDEX idx_assigned (assigned_to, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm comment cho các bảng
ALTER TABLE audit_logs COMMENT = 'Log tất cả hành động của admin để audit trail';
ALTER TABLE violation_reports COMMENT = 'Reports từ members về các vi phạm trong hệ thống';
