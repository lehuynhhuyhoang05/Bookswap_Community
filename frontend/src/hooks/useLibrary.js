// src/hooks/useLibrary.js
import { useCallback, useRef, useState } from 'react';
import { libraryService } from '../services/api/library'; // ✅ Sửa từ 'book' thành 'library'

export const useLibrary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [libraryStats, setLibraryStats] = useState(null);
  const [wantedBooks, setWantedBooks] = useState([]);

  const libraryServiceRef = useRef(libraryService);

  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      console.log(
        `🔄 [USELIBRARY] Calling ${apiFunction?.name || 'anonymous'} with:`,
        args,
      );

      if (typeof apiFunction !== 'function') {
        throw new Error(`apiFunction is not a function: ${typeof apiFunction}`);
      }

      const result = await apiFunction(...args);
      console.log(`✅ [USELIBRARY] ${apiFunction.name} success:`, result);
      return result;
    } catch (err) {
      console.error(
        `❌ [USELIBRARY] ${apiFunction?.name || 'anonymous'} error:`,
        err,
      );
      const errorMessage =
        err.message || `Failed to call ${apiFunction?.name || 'anonymous'}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== LIBRARY STATS API ==========
  const getLibraryStats = useCallback(async () => {
    try {
      const result = await apiCall(libraryServiceRef.current.getLibraryStats);
      setLibraryStats(result);
      return result;
    } catch (err) {
      setLibraryStats(null);
      throw err;
    }
  }, [apiCall]);

  // ========== WANTED BOOKS API ==========
  const getWantedBooks = useCallback(
    async (params = {}) => {
      try {
        const result = await apiCall(
          libraryServiceRef.current.getWantedBooks,
          params,
        );
        const books = Array.isArray(result?.books)
          ? result.books
          : Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result)
              ? result
              : [];
        setWantedBooks(books);
        return result;
      } catch (err) {
        setWantedBooks([]);
        throw err;
      }
    },
    [apiCall],
  );

  const getWantedBookById = useCallback(
    (wantedId) =>
      apiCall(libraryServiceRef.current.getWantedBookById, wantedId),
    [apiCall],
  );

  const addWantedBook = useCallback(
    async (bookData) => {
      try {
        // Sử dụng retry mechanism từ libraryService
        const result = await libraryServiceRef.current.addWantedBookWithRetry(
          bookData,
          3,
        );

        // Refresh wanted books list after adding
        await getWantedBooks();
        return result;
      } catch (err) {
        throw err;
      }
    },
    [apiCall, getWantedBooks],
  );

  const updateWantedBook = useCallback(
    async (wantedId, updateData) => {
      try {
        const result = await apiCall(
          libraryServiceRef.current.updateWantedBook,
          wantedId,
          updateData,
        );

        // Update local state
        setWantedBooks((prev) =>
          prev.map((book) =>
            book.id === wantedId || book.wanted_id === wantedId
              ? { ...book, ...updateData }
              : book,
          ),
        );
        return result;
      } catch (err) {
        throw err;
      }
    },
    [apiCall],
  );

  const deleteWantedBook = useCallback(
    async (wantedId) => {
      try {
        const result = await apiCall(
          libraryServiceRef.current.deleteWantedBook,
          wantedId,
        );

        // Remove from local state
        setWantedBooks((prev) =>
          prev.filter(
            (book) => book.id !== wantedId && book.wanted_id !== wantedId,
          ),
        );
        return result;
      } catch (err) {
        throw err;
      }
    },
    [apiCall],
  );

  // ========== UTILITY METHODS ==========
  const getWantedBookPriorities = useCallback(() => {
    try {
      return libraryServiceRef.current.getWantedBookPriorities() || [];
    } catch (error) {
      console.error('Failed to get wanted book priorities:', error);
      return [];
    }
  }, []);

  const getWantedBookSortOptions = useCallback(() => {
    try {
      return libraryServiceRef.current.getWantedBookSortOptions() || [];
    } catch (error) {
      console.error('Failed to get wanted book sort options:', error);
      return [];
    }
  }, []);

  const formatWantedBookPriority = useCallback((priority) => {
    try {
      return (
        libraryServiceRef.current.formatWantedBookPriority(priority) ||
        `Ưu tiên ${priority}`
      );
    } catch (error) {
      console.error('Failed to format wanted book priority:', error);
      return `Ưu tiên ${priority}`;
    }
  }, []);

  const validateWantedBookData = useCallback((bookData) => {
    try {
      return libraryServiceRef.current.validateWantedBookData(bookData);
    } catch (error) {
      console.error('Failed to validate wanted book data:', error);
      return ['Lỗi xác thực dữ liệu'];
    }
  }, []);

  const formatWantedBookData = useCallback((bookData) => {
    try {
      return libraryServiceRef.current.formatWantedBookData(bookData);
    } catch (error) {
      console.error('Failed to format wanted book data:', error);
      return bookData;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const refreshWantedBooks = useCallback(
    () => getWantedBooks(),
    [getWantedBooks],
  );

  return {
    // State
    loading,
    error,
    libraryStats,
    wantedBooks,

    // Library Stats Methods
    getLibraryStats,

    // Wanted Books Methods
    getWantedBooks,
    getWantedBookById,
    addWantedBook,
    updateWantedBook,
    deleteWantedBook,

    // Utility methods
    getWantedBookPriorities,
    getWantedBookSortOptions,
    formatWantedBookPriority,
    validateWantedBookData,
    formatWantedBookData,

    // Common methods
    clearError,
    refreshWantedBooks,
  };
};

export default useLibrary;
