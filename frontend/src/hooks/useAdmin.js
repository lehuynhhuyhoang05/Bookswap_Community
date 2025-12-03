import { useCallback, useState } from 'react';
import {
  cancelAdminExchange,
  deleteAdminBook,
  deleteAdminMessage,
  deleteAdminReview,
  deleteAdminUser,
  dismissAdminReport,
  getAdminBooks,
  getAdminConversation,
  getAdminDashboardStats,
  getAdminExchange,
  getAdminExchanges,
  getAdminExchangeStatistics,
  getAdminMessages,
  getAdminReport,
  getAdminReports,
  getAdminReviews,
  getAdminUser,
  getAdminUserActivities,
  getAdminUserActivityStats,
  getAdminUsers,
  lockAdminUser,
  permanentDeleteAdminBook,
  resolveAdminReport,
  unlockAdminUser,
  updateAdminUserRole,
} from '../services/api/adminIndex';

/**
 * Custom Hook for Admin Books Management
 */
export const useAdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBooks = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminBooks(params);
      const data = Array.isArray(response)
        ? response
        : response?.items || response?.data || [];
      setBooks(data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeBook = useCallback(async (bookId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteAdminBook(bookId, { reason });
      setBooks((prev) => prev.filter((book) => book.book_id !== bookId));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const permanentRemoveBook = useCallback(async (bookId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await permanentDeleteAdminBook(bookId, { reason });
      setBooks((prev) => prev.filter((book) => book.book_id !== bookId));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { books, loading, error, fetchBooks, removeBook, permanentRemoveBook };
};

/**
 * Custom Hook for Admin Users Management
 */
export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminUsers(params);
      const data = Array.isArray(response)
        ? response
        : response?.items || response?.data || [];
      setUsers(data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUser(userId);
      setCurrentUser(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeUser = useCallback(async (userId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteAdminUser(userId, { reason });
      setUsers((prev) => prev.filter((user) => user.user_id !== userId));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const lockUser = useCallback(async (userId, reason, duration) => {
    setLoading(true);
    setError(null);
    try {
      const result = await lockAdminUser(userId, { reason, duration });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const unlockUser = useCallback(async (userId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await unlockAdminUser(userId, { reason });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const changeUserRole = useCallback(async (userId, role, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateAdminUserRole(userId, { role, reason });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserActivities = useCallback(async (userId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUserActivities(userId, params);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserActivityStats = useCallback(async (userId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUserActivityStats(userId, params);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    currentUser,
    loading,
    error,
    fetchUsers,
    fetchUser,
    removeUser,
    lockUser,
    unlockUser,
    changeUserRole,
    fetchUserActivities,
    fetchUserActivityStats,
  };
};

/**
 * Custom Hook for Admin Exchanges Management
 */
export const useAdminExchanges = () => {
  const [exchanges, setExchanges] = useState([]);
  const [currentExchange, setCurrentExchange] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExchanges = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminExchanges(params);
      const data = Array.isArray(response)
        ? response
        : response?.items || response?.data || [];
      setExchanges(data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExchange = useCallback(async (exchangeId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminExchange(exchangeId);
      setCurrentExchange(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelExchange = useCallback(async (exchangeId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await cancelAdminExchange(exchangeId, { reason });
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminExchangeStatistics();
      setStatistics(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exchanges,
    currentExchange,
    statistics,
    loading,
    error,
    fetchExchanges,
    fetchExchange,
    cancelExchange,
    fetchStatistics,
  };
};

/**
 * Custom Hook for Admin Reviews Management
 */
export const useAdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminReviews(params);
      const data = Array.isArray(response)
        ? response
        : response?.items || response?.data || [];
      setReviews(data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeReview = useCallback(async (reviewId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteAdminReview(reviewId, { reason });
      setReviews((prev) =>
        prev.filter((review) => review.review_id !== reviewId),
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reviews, loading, error, fetchReviews, removeReview };
};

/**
 * Custom Hook for Admin Messages Management
 */
export const useAdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminMessages(params);
      const data = Array.isArray(response)
        ? response
        : response?.items || response?.data || [];
      setMessages(data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConversation = useCallback(async (conversationId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminConversation(conversationId);
      setConversation(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMessage = useCallback(async (messageId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteAdminMessage(messageId, { reason });
      setMessages((prev) => prev.filter((msg) => msg.message_id !== messageId));
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    messages,
    conversation,
    loading,
    error,
    fetchMessages,
    fetchConversation,
    removeMessage,
  };
};

/**
 * Custom Hook for Admin Dashboard
 */
export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDashboardStats();
      setStats(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { stats, loading, error, fetchDashboardStats };
};

/**
 * Custom Hook for Admin Reports Management
 */
export const useAdminReports = () => {
  const [reports, setReports] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminReports(params);

      const data = Array.isArray(response)
        ? response
        : response?.items || response?.data || [];

      // Log to check reportedMember data
      if (data.length > 0) {
        console.log('[useAdminReports] First report:', data[0]);
        console.log(
          '[useAdminReports] reportedMember:',
          data[0].reportedMember,
        );
        console.log(
          '[useAdminReports] reportedMember.user:',
          data[0].reportedMember?.user,
        );
      }

      setReports(data);
      return response;
    } catch (err) {
      console.error('[useAdminReports] Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchReport = useCallback(async (reportId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminReport(reportId);
      setCurrentReport(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const dismissReport = useCallback(async (reportId, reason) => {
    setLoading(true);
    setError(null);
    try {
      const result = await dismissAdminReport(reportId, { reason });
      setReports((prev) =>
        prev.map((report) =>
          report.report_id === reportId
            ? { ...report, status: 'DISMISSED' }
            : report,
        ),
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveReport = useCallback(async (reportId, data) => {
    setLoading(true);
    setError(null);
    try {
      // data có thể là string (legacy) hoặc object {resolution, penalty, trust_score_penalty}
      const payload = typeof data === 'string' 
        ? { resolution: data } 
        : data;
      const result = await resolveAdminReport(reportId, payload);
      setReports((prev) =>
        prev.map((report) =>
          report.report_id === reportId
            ? { ...report, status: 'RESOLVED' }
            : report,
        ),
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reports,
    currentReport,
    loading,
    error,
    fetchReports,
    fetchReport,
    dismissReport,
    resolveReport,
  };
};

export default {
  useAdminBooks,
  useAdminUsers,
  useAdminExchanges,
  useAdminReviews,
  useAdminMessages,
  useAdminReports,
  useAdminDashboard,
};
