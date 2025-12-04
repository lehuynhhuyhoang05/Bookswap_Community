// src/pages/books/index.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from "../../components/layout/Layout";
import BookCard from '../../components/books/BookCard';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { useBooks } from '../../hooks/useBooks';

const Books = () => {
  const { getBooks, loading: hookLoading, error: hookError } = useBooks();
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: ''
  });
  const [localError, setLocalError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  
  // ✅ Sửa: Thêm ref để lưu trữ getBooks ổn định
  const getBooksRef = useRef(getBooks);
  getBooksRef.current = getBooks;

  // ✅ Sửa: Thêm ref để ngăn chặn trùng lặp
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const lastFiltersRef = useRef(JSON.stringify(filters));

  // ✅ Sửa: Dùng useCallback với dependencies đúng
  const fetchBooks = useCallback(async (currentFilters) => {
    // ✅ KIỂM TRA FILTERS CÓ THAY ĐỔI KHÔNG
    const currentFiltersString = JSON.stringify(currentFilters);
    
    if (currentFiltersString === lastFiltersRef.current && isFetchingRef.current) {
      console.log('⏸️ Skip duplicate API call - same filters');
      return;
    }

    // ✅ NGĂN CHẶN GỌI TRÙNG LẶP
    if (isFetchingRef.current) {
      console.log('⏸️ Skip duplicate API call - already fetching');
      return;
    }

    try {
      console.log('🔄 START fetchBooks with filters:', currentFilters);
      isFetchingRef.current = true;
      lastFiltersRef.current = currentFiltersString;
      setLocalError(null);
      setLocalLoading(true);
      
      // ✅ HỦY REQUEST CŨ NẾU CÓ
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      // ✅ Sử dụng getBooksRef.current thay vì getBooks trực tiếp
      const result = await getBooksRef.current(currentFilters);
      console.log('📚 Books API result:', result);
      
      // ✅ Xử lý response linh hoạt cho nhiều trường hợp
      if (result) {
        // Trường hợp 1: { data: [], meta: {} }
        if (Array.isArray(result.data)) {
          setBooks(result.data);
          setMeta(result.meta || {
            page: currentFilters.page,
            limit: currentFilters.limit,
            total: result.data.length,
            totalPages: Math.ceil((result.meta?.total || result.data.length) / currentFilters.limit)
          });
        } 
        // Trường hợp 2: API trả về array trực tiếp
        else if (Array.isArray(result)) {
          setBooks(result);
          setMeta({
            page: 1,
            limit: result.length,
            total: result.length,
            totalPages: 1
          });
        } 
        // Trường hợp 3: { books: [], meta: {} }
        else if (result.books && Array.isArray(result.books)) {
          setBooks(result.books);
          setMeta(result.meta || {
            page: currentFilters.page,
            limit: currentFilters.limit,
            total: result.books.length,
            totalPages: Math.ceil((result.meta?.total || result.books.length) / currentFilters.limit)
          });
        }
        // Trường hợp 4: { items: [] } - fallback
        else if (result.items && Array.isArray(result.items)) {
          setBooks(result.items);
          setMeta(result.meta || {
            page: currentFilters.page,
            limit: currentFilters.limit,
            total: result.items.length,
            totalPages: Math.ceil((result.meta?.total || result.items.length) / currentFilters.limit)
          });
        }
        else {
          console.warn('⚠️ Unexpected API response format:', result);
          setBooks([]);
          setMeta({});
          setLocalError('Định dạng dữ liệu không hợp lệ');
        }
      } else {
        // API trả về null/undefined
        setBooks([]);
        setMeta({});
        setLocalError('Không có dữ liệu trả về');
      }
    } catch (err) {
      // ✅ BỎ QUA LỖI ABORT (không phải lỗi thực sự)
      if (err.name === 'AbortError') {
        console.log('⏹️ Request aborted');
        return;
      }
      
      console.error('❌ Failed to fetch books:', err);
      setBooks([]);
      setMeta({});
      setLocalError(err.message || 'Không thể tải danh sách sách');
    } finally {
      // ✅ LUÔN RESET TRẠNG THÁI FETCHING
      isFetchingRef.current = false;
      setLocalLoading(false);
    }
  }, []); // ✅ Vẫn giữ dependencies rỗng vì dùng ref

  // ✅ Sửa: useEffect đơn giản, không phụ thuộc vào functions
  useEffect(() => {
    console.log('🎬 useEffect triggered with filters:', filters);
    fetchBooks(filters);
    
    // ✅ Cleanup: hủy request khi component unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters.page, filters.search, filters.limit]); // ✅ Loại bỏ fetchBooks từ dependencies

  const handleSearch = useCallback((searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    
    // Scroll to top khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRetry = useCallback(() => {
    fetchBooks(filters);
  }, [filters, fetchBooks]);

  const handleClearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '', page: 1 }));
  }, []);

  // Hiển thị error từ hook hoặc local error
  const displayError = hookError || localError;
  // Hiển thị loading từ cả hook và local
  const isLoading = hookLoading || localLoading;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
                📚 Khám phá sách
              </h1>
              <p className="text-blue-100 text-lg max-w-xl">
                Tìm kiếm và khám phá hàng ngàn cuốn sách từ cộng đồng BookSwap. 
                Trao đổi sách dễ dàng, kết nối người yêu sách!
              </p>
              {meta.total > 0 && (
                <p className="mt-3 text-blue-200 text-sm">
                  🔢 Hiện có <span className="font-semibold text-white">{meta.total}</span> cuốn sách đang được chia sẻ
                </p>
              )}
            </div>
            
            <Link
              to="/books/add-book"
              className="inline-flex items-center bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl w-fit gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm sách mới
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1">
              <SearchBar 
                placeholder="🔍 Tìm sách theo tên, tác giả, ISBN..." 
                onSearch={handleSearch}
                delay={300}
                className="bg-white rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Search Info */}
        {filters.search && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-blue-800">
                Kết quả tìm kiếm cho: <strong>"{filters.search}"</strong>
                {meta.total !== undefined && (
                  <span> - Tìm thấy {meta.total} kết quả</span>
                )}
              </p>
              <button
                onClick={handleClearSearch}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Xóa tìm kiếm
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {displayError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-red-800 font-medium">Lỗi tải dữ liệu</h3>
                <p className="text-red-600 mt-1">{displayError}</p>
                <button 
                  onClick={handleRetry}
                  className="mt-2 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải sách...</p>
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <>
            {books.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {filters.search ? 'Không tìm thấy sách phù hợp' : 'Chưa có sách trong hệ thống'}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {filters.search 
                    ? 'Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả' 
                    : 'Hãy là người đầu tiên thêm sách vào hệ thống và chia sẻ với cộng đồng'
                  }
                </p>
                {!filters.search && (
                  <Link 
                    to="/books/add-book" 
                    className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm sách đầu tiên
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Results Stats */}
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600">
                    Hiển thị <span className="font-semibold">{books.length}</span> sách
                    {meta.total && (
                      <span> trên tổng số <span className="font-semibold">{meta.total}</span> sách</span>
                    )}
                    {meta.page && meta.totalPages > 1 && (
                      <span> (Trang {meta.page}/{meta.totalPages})</span>
                    )}
                  </p>
                </div>

                {/* Books Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {books.map(book => (
                    <BookCard 
                      key={book.book_id || book.id} 
                      book={book}
                      showOwner
                    />
                  ))}
                </div>

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination
                      currentPage={meta.page || 1}
                      totalPages={meta.totalPages}
                      onPageChange={handlePageChange}
                      showInfo
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Books;