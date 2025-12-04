// src/pages/library/add-wanted.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import WantedBookForm from '../../components/library/WantedBookForm';
import { useLibrary } from '../../hooks/useLibrary';

const AddWantedBook = () => {
  const { addWantedBook, loading, error, clearError } = useLibrary();
  const navigate = useNavigate();

  const handleSubmit = async (bookData) => {
    try {
      clearError();
      await addWantedBook(bookData);
      
      navigate('/books/my-library?tab=wanted', { 
        state: { message: 'Đã thêm sách mong muốn thành công!' }
      });
      
    } catch (err) {
      console.error('Error adding wanted book:', err);
    }
  };

  const handleCancel = () => {
    navigate('/books/my-library?tab=wanted');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
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
              
              <h1 className="text-3xl font-bold text-gray-900">Thêm Sách Mong Muốn</h1>
              <p className="text-gray-600 mt-2">
                Thêm sách bạn đang tìm kiếm để trao đổi với người dùng khác
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    {Array.isArray(error) ? (
                      error.map((err, index) => (
                        <div key={index}>• {err}</div>
                      ))
                    ) : (
                      error
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <WantedBookForm 
                onSubmit={handleSubmit}
                loading={loading}
                onCancel={handleCancel}
              />
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Mẹo:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Thêm mô tả chi tiết để người khác dễ nhận biết sách bạn cần</li>
                <li>• Chọn thể loại phù hợp để hệ thống gợi ý tốt hơn</li>
                <li>• Ưu tiên sách có sẵn để tăng cơ hội trao đổi thành công</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddWantedBook;