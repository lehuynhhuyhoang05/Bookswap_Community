import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from "../../../components/layout/Layout";
import WantedBookForm from "../../../components/library/WantedBookForm";
import { useLibrary } from "../../../hooks/useLibrary"; // ✅ Sửa thành useLibrary

const EditWantedBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getWantedBookById, updateWantedBook } = useLibrary(); // ✅ Sử dụng useLibrary
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBook();
  }, [id]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const bookData = await getWantedBookById(id);
      setBook(bookData);
    } catch (err) {
      console.error('Error loading wanted book:', err);
      setError('Không thể tải thông tin sách');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (bookData) => {
    try {
      setSubmitting(true);
      setError('');
      
      console.log('📖 Updating wanted book:', { id, ...bookData });
      
      await updateWantedBook(id, bookData);
      
      navigate('/books/my-library?tab=wanted', { 
        state: { message: 'Đã cập nhật sách mong muốn thành công!' }
      });
      
    } catch (err) {
      console.error('Error updating wanted book:', err);
      setError(err.message || 'Có lỗi xảy ra khi cập nhật sách');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/books/my-library?tab=wanted');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !book) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-red-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sách</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={handleCancel}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Quay lại danh sách
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={handleCancel}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại
              </button>
              
              <h1 className="text-3xl font-bold text-gray-900">Chỉnh Sửa Sách Mong Muốn</h1>
              <p className="text-gray-600 mt-2">
                Cập nhật thông tin sách bạn đang tìm kiếm
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Book Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <WantedBookForm 
                book={book}
                onSubmit={handleSubmit}
                loading={submitting}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditWantedBook;