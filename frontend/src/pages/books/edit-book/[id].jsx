import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import BookForm from '../../../components/books/BookForm';
import { useBooks } from '../../../hooks/useBooks';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBookById, updateBook, loading: hookLoading, error: hookError } = useBooks();
  const [book, setBook] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBook();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      setFetchLoading(true);
      setSubmitError(null);
      console.log('📖 Fetching book with ID:', id);
      
      const result = await getBookById(id);
      console.log('✅ Book data received:', result);
      setBook(result);
    } catch (err) {
      console.error('❌ Failed to fetch book:', err);
      setSubmitError(err.message || 'Không thể tải thông tin sách');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (bookData) => {
    try {
      setSubmitError(null);
      console.log('📝 Updating book with data:', bookData);
      
      const result = await updateBook(id, bookData);
      console.log('✅ Book updated successfully:', result);
      
      // Redirect với thông báo thành công
      navigate('/books/my-library', { 
        state: { 
          message: 'Sách đã được cập nhật thành công!',
          type: 'success'
        }
      });
    } catch (err) {
      console.error('❌ Failed to update book:', err);
      setSubmitError(err.message || 'Có lỗi xảy ra khi cập nhật sách');
      
      // Scroll to top để user thấy lỗi
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc muốn hủy? Thay đổi chưa lưu sẽ bị mất.')) {
      navigate(-1);
    }
  };

  // Combine errors
  const displayError = hookError || submitError;
  const isLoading = hookLoading || fetchLoading;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chỉnh sửa sách</h1>
            <p className="text-gray-600">
              Cập nhật thông tin sách trong thư viện của bạn
            </p>
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
                  <div className="mt-2 flex gap-2">
                    <button 
                      onClick={() => setSubmitError(null)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Đóng thông báo
                    </button>
                    {submitError && (
                      <button 
                        onClick={fetchBook}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Thử lại
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {fetchLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin sách...</p>
            </div>
          )}

          {/* Book Not Found */}
          {!fetchLoading && !book && !displayError && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Không tìm thấy sách</h3>
              <p className="text-gray-500 mb-6">
                Sách bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
              </p>
              <button 
                onClick={() => navigate('/books/my-library')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Quay lại thư viện
              </button>
            </div>
          )}

          {/* Book Form */}
          {book && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <BookForm 
                book={book}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={hookLoading}
                submitButtonText={hookLoading ? "Đang cập nhật..." : "Cập nhật sách"}
                cancelButtonText="Hủy bỏ"
              />
            </div>
          )}

          {/* Debug Info (chỉ hiển thị trong development) */}
          {process.env.NODE_ENV === 'development' && book && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h4 className="text-gray-700 font-medium mb-2">🔧 Debug Info:</h4>
              <pre className="text-xs text-gray-600 overflow-auto">
                Book ID: {id}
                {JSON.stringify(book, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EditBook;