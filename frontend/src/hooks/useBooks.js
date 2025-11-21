// src/hooks/useBooks.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { booksService } from '../services/api/books';

export const useBooks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);

  const booksServiceRef = useRef(booksService);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [cats, regs] = await Promise.all([
        booksServiceRef.current.getCategories(),
        booksServiceRef.current.getAvailableRegions()
      ]);
      
      setCategories(Array.isArray(cats) ? cats : []);
      setRegions(Array.isArray(regs?.regions) ? regs.regions : []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setCategories([]);
      setRegions([]);
    }
  };

  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔄 [USEBOOKS] Calling ${apiFunction?.name || 'anonymous'} with:`, args);
      
      if (typeof apiFunction !== 'function') {
        throw new Error(`apiFunction is not a function: ${typeof apiFunction}`);
      }
      
      const result = await apiFunction(...args);
      console.log(`✅ [USEBOOKS] ${apiFunction.name} success:`, result);
      return result;
    } catch (err) {
      console.error(`❌ [USEBOOKS] ${apiFunction?.name || 'anonymous'} error:`, err);
      const errorMessage = err.message || `Failed to call ${apiFunction?.name || 'anonymous'}`;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== REGULAR BOOKS API ==========
  const getBooks = useCallback((params = {}) => 
    apiCall(booksServiceRef.current.getBooks, params), [apiCall]);

  const getBookById = useCallback((bookId) => 
    apiCall(booksServiceRef.current.getBookById, bookId), [apiCall]);

  const addBook = useCallback((bookData) => 
    apiCall(booksServiceRef.current.addBook, bookData), [apiCall]);

  const updateBook = useCallback((bookId, updateData) => 
    apiCall(booksServiceRef.current.updateBook, bookId, updateData), [apiCall]);

  const deleteBook = useCallback((bookId) => 
    apiCall(booksServiceRef.current.deleteBook, bookId), [apiCall]);

  const getBooksByCategory = useCallback((category, params = {}) => 
    apiCall(booksServiceRef.current.getBooksByCategory, category, params), [apiCall]);

  const getGoogleBookById = useCallback((googleBookId) => 
    apiCall(booksServiceRef.current.getGoogleBookById, googleBookId), [apiCall]);

  const getGoogleBookByISBN = useCallback((isbn) => 
    apiCall(booksServiceRef.current.getGoogleBookByISBN, isbn), [apiCall]);

  const getMyLibrary = useCallback(() => 
    apiCall(booksServiceRef.current.getMyLibrary), [apiCall]);

  const getBooksByRegion = useCallback((region, params = {}) => 
    apiCall(booksServiceRef.current.getBooksByRegion, region, params), [apiCall]);

  const searchBooks = useCallback((query, params = {}) => 
    apiCall(booksServiceRef.current.searchBooks, query, params), [apiCall]);

  const advancedSearch = useCallback((filters = {}) => 
    apiCall(booksServiceRef.current.advancedSearch, filters), [apiCall]);

  const searchGoogleBooks = useCallback((params = {}) => 
    apiCall(booksServiceRef.current.searchGoogleBooks, params), [apiCall]);

  const testAuth = useCallback(() => 
    apiCall(booksServiceRef.current.testAuth), [apiCall]);

  const testNoAuth = useCallback(() => 
    apiCall(booksServiceRef.current.testNoAuth), [apiCall]);

  const searchWantedBooks = useCallback((query, params = {}) => 
    apiCall(booksServiceRef.current.searchWantedBooks, query, params), [apiCall]);

  const getAvailableRegions = useCallback(async () => {
    try {
      const result = await apiCall(booksServiceRef.current.getAvailableRegions);
      const regionsList = Array.isArray(result?.regions) ? result.regions : [];
      setRegions(regionsList);
      return result;
    } catch (err) {
      console.error('Failed to fetch regions:', err);
      setRegions([]);
      return { regions: [] };
    }
  }, [apiCall]);

  // ========== UTILITY METHODS ==========
  const getCategories = useCallback(() => categories, [categories]);

  const getBookConditions = useCallback(() => {
    try {
      return booksServiceRef.current.getBookConditions() || [];
    } catch (error) {
      console.error('Failed to get book conditions:', error);
      return [];
    }
  }, []);

  const formatBookCondition = useCallback((condition) => {
    try {
      return booksServiceRef.current.formatBookCondition(condition) || condition;
    } catch (error) {
      console.error('Failed to format book condition:', error);
      return condition;
    }
  }, []);

  const getSortOptions = useCallback(() => {
    try {
      return booksServiceRef.current.getSortOptions() || [];
    } catch (error) {
      console.error('Failed to get sort options:', error);
      return [];
    }
  }, []);

  const getOrderOptions = useCallback(() => {
    try {
      return booksServiceRef.current.getOrderOptions() || [];
    } catch (error) {
      console.error('Failed to get order options:', error);
      return [];
    }
  }, []);

  const validateBookData = useCallback((bookData) => {
    try {
      return booksServiceRef.current.validateBookData(bookData);
    } catch (error) {
      console.error('Failed to validate book data:', error);
      return ['Lỗi xác thực dữ liệu'];
    }
  }, []);

  const formatBookData = useCallback((bookData) => {
    try {
      return booksServiceRef.current.formatBookData(bookData);
    } catch (error) {
      console.error('Failed to format book data:', error);
      return bookData;
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const refreshData = useCallback(() => loadInitialData(), []);

  return {
    // State
    loading,
    error,
    categories,
    regions,
    
    // Main API methods - Regular Books
    addBook,
    getBooks,
    getBookById,
    updateBook,
    deleteBook,
    getBooksByCategory,
    getGoogleBookById,
    getGoogleBookByISBN,
    getMyLibrary,
    getBooksByRegion,
    getAvailableRegions,
    searchBooks,
    advancedSearch,
    searchGoogleBooks,
    testAuth,
    testNoAuth,
    searchWantedBooks,
    
    // Utility methods
    getCategories,
    getBookConditions,
    formatBookCondition,
    getSortOptions,
    getOrderOptions,
    validateBookData,
    formatBookData,
    
    // Common methods
    clearError,
    refreshData
  };
};

export default useBooks;