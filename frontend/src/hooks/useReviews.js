import { useState, useEffect, useCallback, useRef } from 'react';
import reviewsService, { normalizeReviewsList } from '../services/api/reviews';

/* =========================
        useReviews Hook
========================= */
export const useReviews = (memberId) => {
  const DEFAULT_PAGE_SIZE = 20;
  const currentPageRef = useRef(1);

  const [stats, setStats] = useState({
    member_id: memberId,
    total_reviews: 0,
    average_rating: 0,
    average_rating_percentage: 0, // Thêm trường mới
    ratings_count: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, // Thêm distribution
  });

  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalPages: 1,
    total: 0,
  });

  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [error, setError] = useState(null);

  /* =====================================
        Load member stats
  ===================================== */
  const loadStats = useCallback(async () => {
    if (!memberId) return;
    try {
      setLoadingStats(true);
      const response = await reviewsService.getMemberStats(memberId);
      console.log('Stats response:', response);
      
      // Handle response safely - response could be the data directly or wrapped in .data
      const data = response?.data || response || {};
      
      // Cập nhật state với dữ liệu từ API
      setStats(prev => ({
        ...prev,
        member_id: data.member_id || memberId,
        total_reviews: data.total_reviews || 0,
        average_rating: data.average_rating || 0,
        // Đảm bảo ratings_count có dữ liệu từ distribution nếu ratings_count rỗng
        ratings_count: (data.ratings_count && Object.values(data.ratings_count).some(val => val > 0))
          ? data.ratings_count 
          : data.distribution || prev.ratings_count || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        distribution: data.distribution || prev.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }));
      
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to load stats');
      console.error('Error loading stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [memberId]);

  /* =====================================
        Load member reviews
  ===================================== */
  const loadReviews = useCallback(
    async (page = currentPageRef.current, pageSize = DEFAULT_PAGE_SIZE) => {
      if (!memberId) return;
      try {
        setLoadingReviews(true);
        const response = await reviewsService.getMemberReviews(memberId, { page, pageSize });
        
        // getMemberReviews trả về { data: items[], meta: {...} }
        const rawItems = response?.data || [];
        const items = normalizeReviewsList(rawItems);
        setReviews(items);

        // Lấy meta từ response
        const meta = response?.meta || {};
        const totalPages = meta.totalPages || 1;
        const total = meta.total || items.length;

        setPagination({
          page: meta.page || page,
          pageSize: meta.pageSize || pageSize,
          totalPages,
          total,
        });

        currentPageRef.current = meta.page || page;
        setError(null);
      } catch (err) {
        setError(err?.message || 'Failed to load reviews');
        setReviews([]);
        setPagination(prev => ({ ...prev, totalPages: 1, total: 0 }));
        console.error('Error loading reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    },
    [memberId]
  );

  /* =====================================
        Create / Update / Delete review
  ===================================== */
  const createReview = useCallback(
    async (reviewData) => {
      try {
        setLoadingReviews(true);
        const result = await reviewsService.createReview(reviewData);
        await loadStats();
        await loadReviews(currentPageRef.current, pagination.pageSize);
        setError(null);
        return result;
      } catch (err) {
        setError(err.message);
        console.error('Error creating review:', err);
        throw err;
      } finally {
        setLoadingReviews(false);
      }
    },
    [loadStats, loadReviews, pagination.pageSize]
  );

  const updateReview = useCallback(
    async (reviewId, updateData) => {
      try {
        setLoadingReviews(true);
        const result = await reviewsService.updateReview(reviewId, updateData);
        await loadReviews(currentPageRef.current, pagination.pageSize);
        setError(null);
        return result;
      } catch (err) {
        setError(err.message);
        console.error('Error updating review:', err);
        throw err;
      } finally {
        setLoadingReviews(false);
      }
    },
    [loadReviews, pagination.pageSize]
  );

  const deleteReview = useCallback(
    async (reviewId) => {
      try {
        setLoadingReviews(true);
        const result = await reviewsService.deleteReview(reviewId);
        await loadStats();
        await loadReviews(currentPageRef.current, pagination.pageSize);
        setError(null);
        return result;
      } catch (err) {
        setError(err.message);
        console.error('Error deleting review:', err);
        throw err;
      } finally {
        setLoadingReviews(false);
      }
    },
    [loadStats, loadReviews, pagination.pageSize]
  );

  /* =====================================
        Initial load
  ===================================== */
  useEffect(() => {
    if (memberId) {
      loadStats();
      loadReviews();
    }
  }, [memberId, loadStats, loadReviews]);

  /* =====================================
        Return hook API
  ===================================== */
  return {
    stats,
    reviews,
    pagination,
    loadingStats,
    loadingReviews,
    error,

    loadStats,
    loadReviews,

    createReview,
    updateReview,
    deleteReview,

    refresh: async () => {
      await loadStats();
      await loadReviews();
    },

    clearError: () => setError(null),
  };
}; // ok