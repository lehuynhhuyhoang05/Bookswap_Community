// src/pages/books/my-library.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import BookCard from '../../components/books/BookCard';
import { useBooks } from '../../hooks/useBooks';
import { useAuth } from '../../hooks/useAuth';

const MyLibrary = () => {
  const { getMyLibrary, deleteBook, loading: globalLoading, error } = useBooks();
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ✅ Sửa lỗi: Thêm useCallback để tránh vòng lặp vô hạn
  const fetchMyLibrary = useCallback(async () => {
    try {
      setLocalLoading(true);
      setLocalError(null);
      console.log('🔄 Fetching my library...');
      
      const result = await getMyLibrary();
      console.log('📚 MyLibrary API result:', result);
      
      // ✅ Xử lý đúng cấu trúc response: API trả về array trực tiếp hoặc { books: [] }
      if (Array.isArray(result)) {
        setBooks(result);
      } else if (result && Array.isArray(result.books)) {
        setBooks(result.books);
      } else if (result && result.data && Array.isArray(result.data.books)) {
        setBooks(result.data.books);
      } else {
        console.warn('⚠️ Unexpected result format:', result);
        setBooks([]);
      }
    } catch (err) {
      console.error('❌ Failed to fetch my library:', err);
      setLocalError(err.message || 'Failed to load library');
      setBooks([]);
    } finally {
      setLocalLoading(false);
    }
  }, [getMyLibrary]);

  // ✅ Thêm hàm xử lý xóa sách
  const handleDeleteBook = useCallback(async (bookId) => {
    try {
      setDeleteLoading(true);
      console.log('🗑️ Deleting book with ID:', bookId);
      
      await deleteBook(bookId);
      console.log('✅ Book deleted successfully');
      
      // Refresh danh sách sau khi xóa
      fetchMyLibrary();
      
      // Có thể thêm toast notification ở đây
    } catch (err) {
      console.error('❌ Failed to delete book:', err);
      setLocalError(err.message || 'Không thể xóa sách');
      throw err; // Re-throw để BookCard có thể xử lý
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteBook, fetchMyLibrary]);

  // ✅ Sửa lỗi: useEffect với dependency đúng
  useEffect(() => {
    fetchMyLibrary();
  }, [fetchMyLibrary]);

  // ✅ Hiển thị loading
  if (localLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tải thư viện...</span>
          </div>
        </div>
      </Layout>
    );
  }

  const displayError = localError || error;
  const isLoading = globalLoading || localLoading || deleteLoading;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user ? `Thư viện của ${user.username}` : 'Thư viện của tôi'}
          </h1>
          <p className="text-gray-600">
            Quản lý sách trong bộ sưu tập cá nhân của bạn
          </p>
        </div>

        {/* Add Book Button */}
        <div className="mb-6">
          <Link
            to="/books/add-book"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Thêm sách mới
          </Link>
        </div>

        {/* Error Display */}
        {displayError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-red-800 font-medium">Lỗi</h3>
                <p className="text-red-600 mt-1">{displayError}</p>
                <button 
                  onClick={fetchMyLibrary}
                  className="mt-2 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State for Delete */}
        {deleteLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-800">Đang xóa sách...</p>
            </div>
          </div>
        )}

        {/* Books Grid */}
        {books.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {displayError ? 'Không thể tải thư viện' : 'Chưa có sách trong thư viện'}
            </h3>
            <p className="text-gray-500 mb-4">
              {displayError 
                ? 'Có lỗi xảy ra khi tải dữ liệu' 
                : 'Bắt đầu xây dựng bộ sưu tập của bạn bằng cách thêm sách đầu tiên'
              }
            </p>
            <Link 
              to="/books/add-book" 
              className="inline-flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm sách mới
            </Link>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800">
                Bạn có <strong className="text-blue-900">{books.length}</strong> cuốn sách trong thư viện
              </p>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map(book => (
                <BookCard 
                  key={book.book_id || book.id} 
                  book={book} 
                  showActions 
                  onUpdate={fetchMyLibrary}
                  onDelete={handleDeleteBook} 
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyLibrary;