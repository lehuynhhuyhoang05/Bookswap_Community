import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import BookDetail from '../../../components/books/BookDetail';
import { useBooks } from '../../../hooks/useBooks';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getBookById, loading: hookLoading, error: hookError } = useBooks();
  const [book, setBook] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      setFetchLoading(true);
      setFetchError(null);
      
      const result = await getBookById(id);
      setBook(result);
    } catch (err) {
      console.error('❌ Failed to fetch book details:', err);
      setFetchError(err.message || 'Không thể tải thông tin sách');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleRetry = () => {
    fetchBook();
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Combine loading states
  const isLoading = hookLoading || fetchLoading;
  // Combine errors
  const displayError = hookError || fetchError;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <button 
            onClick={handleBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </button>
        </div>

        {/* Error Display */}
        {displayError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-red-800 font-medium text-lg mb-2">Không thể tải thông tin sách</h3>
                <p className="text-red-600 mb-4">{displayError}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={handleRetry}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Thử lại
                  </button>
                  <button 
                    onClick={() => navigate('/books')}
                    className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    Quay lại danh sách
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !displayError && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Đang tải thông tin sách...</p>
            <p className="text-gray-500 text-sm mt-2">Vui lòng chờ trong giây lát</p>
          </div>
        )}

        {/* Book Not Found */}
        {!isLoading && !book && !displayError && (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 text-8xl mb-6">📚</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">Không tìm thấy sách</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
              Sách bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc bạn không có quyền truy cập.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate('/books')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Khám phá sách khác
              </button>
              <button 
                onClick={handleRetry}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}

        {/* Book Content */}
        {!isLoading && book && (
          <>
            {/* Success Message (if coming from edit/add) */}
            {location.state?.message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-800 font-medium">{location.state.message}</span>
                </div>
              </div>
            )}

            <BookDetail book={book} />
          </>
        )}
      </div>
    </Layout>
  );
};

export default BookDetailPage; // ok