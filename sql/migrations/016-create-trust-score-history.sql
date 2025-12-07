-- ============================================================
-- Migration: 016-create-trust-score-history.sql
-- Tạo bảng lưu lịch sử thay đổi trust score (MySQL version)
-- ============================================================

CREATE TABLE IF NOT EXISTS trust_score_history (
  change_id CHAR(36) PRIMARY KEY,
  member_id CHAR(36) NOT NULL,
  old_score DECIMAL(5, 2) NOT NULL,
  new_score DECIMAL(5, 2) NOT NULL,
  change_amount DECIMAL(5, 2) NOT NULL,
  reason VARCHAR(255) NOT NULL,
  source ENUM('SYSTEM', 'ADMIN', 'AUTO') NOT NULL DEFAULT 'SYSTEM',
  admin_id CHAR(36) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_trust_history_member ON trust_score_history(member_id);
CREATE INDEX idx_trust_history_created ON trust_score_history(created_at DESC);
CREATE INDEX idx_trust_history_source ON trust_score_history(source);
