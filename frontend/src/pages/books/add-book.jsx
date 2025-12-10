import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import BookForm from '../../components/books/BookForm';
import { useBooks } from '../../hooks/useBooks';
import { useAuth } from '../../hooks/useAuth';
import { TrustScoreWarning } from '../../components/common';
import { AlertTriangle, ShieldX } from 'lucide-react';
import { toDisplayScore } from '../../utils/trustScore';

const AddBook = () => {
  const { addBook, loading, error } = useBooks();
  const { getTrustRestrictions, canPerformAction } = useAuth();
  const navigate = useNavigate();
  
  const restrictions = getTrustRestrictions();
  const canAddBook = canPerformAction('addBook');

  // Check for prefilled data from discover page
  const [prefillData, setPrefillData] = useState(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('prefill_book_data');
    console.log('📖 Raw prefill data from sessionStorage:', storedData);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        console.log('📖 Parsed prefill data:', parsed);
        setPrefillData(parsed);
        sessionStorage.removeItem('prefill_book_data');
      } catch (e) {
        console.error('Failed to parse prefill data:', e);
      }
    }
  }, []);

  const handleSubmit = async (bookData) => {
    if (!canAddBook) {
      alert('Điểm tin cậy của bạn quá thấp để thêm sách mới. Vui lòng liên hệ quản trị viên.');
      return;
    }
    try {
      await addBook(bookData);
      navigate('/books/my-library');
    } catch (err) {
      console.error('Failed to add book:', err);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thêm sách mới</h1>
            <p className="text-gray-600">
              Thêm sách vào thư viện cá nhân của bạn
            </p>
          </div>

          {/* Trust Score Warning */}
          <TrustScoreWarning restrictions={restrictions} />

          {/* Blocked Message */}
          {!canAddBook && (
            <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldX className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800 mb-2">
                    Không thể thêm sách
                  </h3>
                  <p className="text-red-700 mb-3">
                    Điểm tin cậy của bạn hiện tại là <strong>{restrictions.score}</strong>, 
                    thấp hơn mức tối thiểu (20 điểm) để thêm sách mới.
                  </p>
                  <p className="text-sm text-red-600">
                    Để khôi phục khả năng thêm sách, vui lòng liên hệ quản trị viên 
                    hoặc cải thiện hành vi sử dụng nền tảng.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Only show form if user can add books */}
          {canAddBook ? (
            <BookForm 
              onSubmit={handleSubmit}
              loading={loading}
              initialData={prefillData}
            />
          ) : (
            <div className="bg-gray-100 rounded-xl p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Form thêm sách bị khóa do điểm tin cậy thấp
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AddBook;