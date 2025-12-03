-- =============================================
-- Seed Data for Reviews
-- Tạo dữ liệu mẫu cho đánh giá sau khi trao đổi hoàn tất
-- =============================================
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ==================== REVIEWS ====================
-- Lưu ý: Chỉ tạo review cho các exchange đã COMPLETED
-- Review phải unique theo (exchange_id, reviewer_id)
-- Rating: 1-5 sao
-- Trust score impact: 5 stars = +0.1, 4 stars = +0.05, 3 stars = 0, 2 stars = -0.05, 1 star = -0.1

-- Reviews for test exchanges (assuming some exchanges are completed)
-- Format: (review_id, exchange_id, reviewer_id, reviewee_id, rating, comment, trust_score_impact, created_at, updated_at)

INSERT INTO reviews (review_id, exchange_id, reviewer_id, reviewee_id, rating, comment, trust_score_impact, created_at, updated_at) VALUES
-- Alice reviews Bob (5 stars - excellent exchange)
(
    'review-001-alice-to-bob',
    'exchange-001-completed', -- Replace with actual completed exchange ID
    'test-member-alice',
    'test-member-bob',
    5,
    'Trao đổi rất tuyệt vời! Bob rất đúng giờ, sách còn mới và đúng như mô tả. Rất hài lòng với giao dịch này. Chắc chắn sẽ trao đổi lại với Bob trong tương lai!',
    0.10,
    NOW() - INTERVAL 10 DAY,
    NOW() - INTERVAL 10 DAY
),

-- Bob reviews Alice (5 stars - great condition)
(
    'review-002-bob-to-alice',
    'exchange-001-completed', -- Same exchange as above
    'test-member-bob',
    'test-member-alice',
    5,
    'Alice rất nhiệt tình và đúng hẹn. Cuốn Clean Code còn như mới. Cảm ơn Alice rất nhiều! Highly recommended!',
    0.10,
    NOW() - INTERVAL 9 DAY,
    NOW() - INTERVAL 9 DAY
),

-- Carol reviews David (4 stars - good but minor issues)
(
    'review-003-carol-to-david',
    'exchange-002-completed',
    'test-member-carol',
    'test-member-david',
    4,
    'David rất dễ tính và lịch sự. Sách trong tình trạng tốt. Chỉ có điều hơi trễ hẹn khoảng 15 phút, nhưng vẫn ổn.',
    0.05,
    NOW() - INTERVAL 8 DAY,
    NOW() - INTERVAL 8 DAY
),

-- David reviews Carol (5 stars)
(
    'review-004-david-to-carol',
    'exchange-002-completed',
    'test-member-david',
    'test-member-carol',
    5,
    'Carol rất chuyên nghiệp! Sách Good to Great rất hay và còn rất đẹp. Cảm ơn Carol!',
    0.10,
    NOW() - INTERVAL 7 DAY,
    NOW() - INTERVAL 7 DAY
),

-- Alice reviews Eve (3 stars - average)
(
    'review-005-alice-to-eve',
    'exchange-003-completed',
    'test-member-alice',
    'test-member-eve',
    3,
    'Giao dịch bình thường. Sách đúng như mô tả nhưng Eve không phản hồi tin nhắn nhanh lắm. Tuy nhiên vẫn hoàn thành tốt.',
    0.00,
    NOW() - INTERVAL 6 DAY,
    NOW() - INTERVAL 6 DAY
),

-- Eve reviews Alice (4 stars)
(
    'review-006-eve-to-alice',
    'exchange-003-completed',
    'test-member-eve',
    'test-member-alice',
    4,
    'Alice rất tốt! Sách JavaScript hay và còn mới. Chỉ có điều địa điểm hẹn hơi xa một chút.',
    0.05,
    NOW() - INTERVAL 5 DAY,
    NOW() - INTERVAL 5 DAY
),

-- Bob reviews Carol (5 stars)
(
    'review-007-bob-to-carol',
    'exchange-004-completed',
    'test-member-bob',
    'test-member-carol',
    5,
    'Perfect exchange! Carol rất nhiệt tình và chuyên nghiệp. The Lean Startup là cuốn sách tôi đang tìm. Thanks!',
    0.10,
    NOW() - INTERVAL 4 DAY,
    NOW() - INTERVAL 4 DAY
),

-- Carol reviews Bob (5 stars)
(
    'review-008-carol-to-bob',
    'exchange-004-completed',
    'test-member-carol',
    'test-member-bob',
    5,
    'Bob rất đáng tin cậy! Cuốn 1984 trong tình trạng tuyệt vời. Rất vui khi được trao đổi sách với Bob!',
    0.10,
    NOW() - INTERVAL 3 DAY,
    NOW() - INTERVAL 3 DAY
),

-- David reviews Bob (4 stars)
(
    'review-009-david-to-bob',
    'exchange-005-completed',
    'test-member-david',
    'test-member-bob',
    4,
    'Giao dịch tốt với Bob. Sách To Kill a Mockingbird hay lắm! Chỉ tiếc là không có thời gian chat nhiều.',
    0.05,
    NOW() - INTERVAL 2 DAY,
    NOW() - INTERVAL 2 DAY
),

-- Bob reviews David (5 stars)
(
    'review-010-bob-to-david',
    'exchange-005-completed',
    'test-member-bob',
    'test-member-david',
    5,
    'David rất thân thiện và đúng giờ. Atomic Habits là cuốn sách tuyệt vời! Highly recommended member!',
    0.10,
    NOW() - INTERVAL 1 DAY,
    NOW() - INTERVAL 1 DAY
),

-- Alice reviews Carol (2 stars - below average, had issues)
(
    'review-011-alice-to-carol',
    'exchange-006-completed',
    'test-member-alice',
    'test-member-carol',
    2,
    'Có một số vấn đề trong giao dịch này. Carol đến muộn 45 phút và sách có vài trang bị rách không báo trước. Hơi thất vọng.',
    -0.05,
    NOW() - INTERVAL 12 DAY,
    NOW() - INTERVAL 12 DAY
),

-- Carol reviews Alice (3 stars - neutral after issue)
(
    'review-012-carol-to-alice',
    'exchange-006-completed',
    'test-member-carol',
    'test-member-alice',
    3,
    'Giao dịch có một chút hiểu lầm về tình trạng sách. Tuy nhiên cuối cùng cũng hoàn thành. Sách vẫn đọc được.',
    0.00,
    NOW() - INTERVAL 11 DAY,
    NOW() - INTERVAL 11 DAY
),

-- Eve reviews David (5 stars)
(
    'review-013-eve-to-david',
    'exchange-007-completed',
    'test-member-eve',
    'test-member-david',
    5,
    'David rất tốt bụng! Cho tôi mượn thêm một cuốn khác để đọc. The 7 Habits rất hay và còn mới!',
    0.10,
    NOW() - INTERVAL 15 DAY,
    NOW() - INTERVAL 15 DAY
),

-- David reviews Eve (4 stars)
(
    'review-014-david-to-eve',
    'exchange-007-completed',
    'test-member-david',
    'test-member-eve',
    4,
    'Eve rất dễ thương! The Little Prince là một cuốn sách tuyệt vời. Giao dịch suôn sẻ!',
    0.05,
    NOW() - INTERVAL 14 DAY,
    NOW() - INTERVAL 14 DAY
),

-- Alice reviews David (5 stars)
(
    'review-015-alice-to-david',
    'exchange-008-completed',
    'test-member-alice',
    'test-member-david',
    5,
    'Giao dịch hoàn hảo với David! Mindset là cuốn sách tôi đang cần. David rất nhiệt tình tư vấn về sách nữa. 10/10!',
    0.10,
    NOW() - INTERVAL 20 DAY,
    NOW() - INTERVAL 20 DAY
),

-- David reviews Alice (5 stars)
(
    'review-016-david-to-alice',
    'exchange-008-completed',
    'test-member-david',
    'test-member-alice',
    5,
    'Alice rất chuyên nghiệp! Refactoring là cuốn sách chất lượng. Cảm ơn Alice rất nhiều!',
    0.10,
    NOW() - INTERVAL 19 DAY,
    NOW() - INTERVAL 19 DAY
),

-- Bob reviews Eve (3 stars)
(
    'review-017-bob-to-eve',
    'exchange-009-completed',
    'test-member-bob',
    'test-member-eve',
    3,
    'Giao dịch bình thường. Eve có vẻ bận nên không phản hồi nhanh. Nhưng sách Harry Potter vẫn ổn.',
    0.00,
    NOW() - INTERVAL 25 DAY,
    NOW() - INTERVAL 25 DAY
),

-- Eve reviews Bob (4 stars)
(
    'review-018-eve-to-bob',
    'exchange-009-completed',
    'test-member-eve',
    'test-member-bob',
    4,
    'Bob rất tốt! Pride and Prejudice rất đẹp. Chỉ có điều mình hơi nhầm lẫn về địa điểm hẹn ban đầu.',
    0.05,
    NOW() - INTERVAL 24 DAY,
    NOW() - INTERVAL 24 DAY
),

-- Carol reviews Eve (4 stars)
(
    'review-019-carol-to-eve',
    'exchange-010-completed',
    'test-member-carol',
    'test-member-eve',
    4,
    'Eve rất dễ thương và lịch sự. Giao dịch diễn ra tốt đẹp. Harry Potter còn khá mới!',
    0.05,
    NOW() - INTERVAL 30 DAY,
    NOW() - INTERVAL 30 DAY
),

-- Eve reviews Carol (5 stars)
(
    'review-020-eve-to-carol',
    'exchange-010-completed',
    'test-member-eve',
    'test-member-carol',
    5,
    'Carol rất tốt bụng! Think and Grow Rich là cuốn sách hay. Cảm ơn Carol đã trao đổi với mình!',
    0.10,
    NOW() - INTERVAL 29 DAY,
    NOW() - INTERVAL 29 DAY
)
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- ==================== UPDATE MEMBER STATS ====================
-- Cập nhật average_rating cho các members dựa trên reviews

UPDATE members m
SET average_rating = (
    SELECT COALESCE(AVG(r.rating), 0)
    FROM reviews r
    WHERE r.reviewee_id = m.member_id
)
WHERE m.member_id IN (
    'test-member-alice',
    'test-member-bob',
    'test-member-carol',
    'test-member-david',
    'test-member-eve'
);

-- ==================== UPDATE TRUST SCORES ====================
-- Cập nhật trust_score dựa trên tổng trust_score_impact

UPDATE members m
SET trust_score = GREATEST(0, LEAST(100, 
    m.trust_score + (
        SELECT COALESCE(SUM(r.trust_score_impact), 0)
        FROM reviews r
        WHERE r.reviewee_id = m.member_id
    )
))
WHERE m.member_id IN (
    'test-member-alice',
    'test-member-bob',
    'test-member-carol',
    'test-member-david',
    'test-member-eve'
);

SET FOREIGN_KEY_CHECKS = 1;

-- ==================== VERIFICATION QUERIES ====================
-- Kiểm tra kết quả

SELECT 
    m.member_id,
    u.full_name,
    m.average_rating,
    m.trust_score,
    COUNT(r.review_id) as total_reviews_received,
    SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) as five_star_count,
    SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) as four_star_count,
    SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) as three_star_count,
    SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) as two_star_count,
    SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) as one_star_count
FROM members m
JOIN users u ON m.user_id = u.user_id
LEFT JOIN reviews r ON r.reviewee_id = m.member_id
WHERE m.member_id IN (
    'test-member-alice',
    'test-member-bob',
    'test-member-carol',
    'test-member-david',
    'test-member-eve'
)
GROUP BY m.member_id, u.full_name, m.average_rating, m.trust_score
ORDER BY m.average_rating DESC;

-- ==================== NOTES ====================
-- 1. Thay thế 'exchange-XXX-completed' bằng ID thực của các exchange đã COMPLETED trong database
-- 2. Review chỉ có thể tạo nếu exchange có status = 'COMPLETED'
-- 3. Mỗi member chỉ có thể review 1 lần cho mỗi exchange
-- 4. Trust score impact:
--    - 5 sao: +0.10
--    - 4 sao: +0.05
--    - 3 sao: 0.00
--    - 2 sao: -0.05
--    - 1 sao: -0.10
-- 5. Trust score được giới hạn từ 0 đến 100
