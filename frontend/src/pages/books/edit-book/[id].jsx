import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import BookForm from '../../../components/books/BookForm';
import { useBooks } from '../../../hooks/useBooks';
import { 
  ArrowLeft, 
  BookOpen, 
  Edit3, 
  AlertCircle, 
  Loader2, 
  CheckCircle,
  Library,
  Sparkles,
  Save,
  User
} from 'lucide-react';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBookById, updateBook, loading: hookLoading, error: hookError } = useBooks();
  const [book, setBook] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
      setSuccessMessage(null);
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

  const getConditionLabel = (condition) => {
    const conditions = {
      'LIKE_NEW': 'Như mới',
      'VERY_GOOD': 'Rất tốt',
      'GOOD': 'Tốt',
      'FAIR': 'Khá',
      'POOR': 'Kém'
    };
    return conditions[condition] || condition;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-blue-100 text-sm mb-6">
              <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
              <span>/</span>
              <Link to="/books/my-library" className="hover:text-white transition-colors">Thư viện</Link>
              <span>/</span>
              <span className="text-white">Chỉnh sửa sách</span>
            </nav>

            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Edit3 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Chỉnh sửa thông tin sách
                </h1>
                <p className="text-blue-100 text-lg">
                  Cập nhật thông tin sách trong thư viện của bạn
                </p>
              </div>
            </div>

            {/* Quick Stats - only show when book is loaded */}
            {book && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-blue-200" />
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate" title={book.title}>{book.title}</p>
                      <p className="text-blue-200 text-sm">Tên sách</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <User className="w-8 h-8 text-emerald-300" />
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate" title={book.author}>{book.author || 'Không rõ'}</p>
                      <p className="text-blue-200 text-sm">Tác giả</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-yellow-300" />
                    <div>
                      <p className="text-white font-semibold">{book.category || 'Chưa phân loại'}</p>
                      <p className="text-blue-200 text-sm">Danh mục</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      book.status === 'AVAILABLE' ? 'bg-green-500/30' : 'bg-yellow-500/30'
                    }`}>
                      <CheckCircle className={`w-5 h-5 ${
                        book.status === 'AVAILABLE' ? 'text-green-300' : 'text-yellow-300'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-semibold">
                        {book.status === 'AVAILABLE' ? 'Có sẵn' : book.status === 'EXCHANGING' ? 'Đang trao đổi' : book.status}
                      </p>
                      <p className="text-blue-200 text-sm">Trạng thái</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[60px]">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" className="fill-slate-50"/>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại</span>
          </button>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-green-800 font-semibold">Thành công!</h3>
                <p className="text-green-600 mt-1">{successMessage}</p>
              </div>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="text-green-600 hover:text-green-800 p-1 text-xl"
              >
                ×
              </button>
            </div>
          )}

          {/* Error Display */}
          {displayError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold">Có lỗi xảy ra</h3>
                <p className="text-red-600 mt-1">{displayError}</p>
                <div className="mt-3 flex gap-3">
                  <button 
                    onClick={() => setSubmitError(null)}
                    className="text-sm text-red-600 hover:text-red-800 font-medium hover:underline"
                  >
                    Đóng thông báo
                  </button>
                  {submitError && (
                    <button 
                      onClick={fetchBook}
                      className="text-sm text-red-600 hover:text-red-800 font-medium hover:underline"
                    >
                      Thử lại
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {fetchLoading && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Đang tải thông tin sách</h3>
                <p className="text-gray-500">Vui lòng đợi trong giây lát...</p>
              </div>
            </div>
          )}

          {/* Book Not Found */}
          {!fetchLoading && !book && !displayError && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Không tìm thấy sách</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  Sách bạn đang tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.
                </p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Quay lại
                  </button>
                  <Link 
                    to="/books/my-library"
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
                  >
                    Đến thư viện
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Book Form */}
          {book && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Save className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">Cập nhật thông tin</h2>
                    <p className="text-blue-100 text-sm">Các trường có dấu (*) là bắt buộc</p>
                  </div>
                </div>
              </div>
              
              {/* Book Preview Card */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <div className="flex gap-4">
                  {/* Book Cover */}
                  <div className="w-24 h-32 bg-white rounded-lg shadow-md overflow-hidden flex-shrink-0">
                    {book.cover_image_url ? (
                      <img 
                        src={book.cover_image_url} 
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 ${book.cover_image_url ? 'hidden' : 'flex'}`}>
                      <BookOpen className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  
                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{book.title}</h3>
                    <p className="text-gray-600 mb-2">{book.author || 'Tác giả không rõ'}</p>
                    <div className="flex flex-wrap gap-2">
                      {book.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {book.category}
                        </span>
                      )}
                      {book.book_condition && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {getConditionLabel(book.book_condition)}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        book.status === 'AVAILABLE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {book.status === 'AVAILABLE' ? 'Có sẵn' : book.status === 'EXCHANGING' ? 'Đang trao đổi' : book.status}
                      </span>
                    </div>
                    {book.isbn && (
                      <p className="text-xs text-gray-500 mt-2">ISBN: {book.isbn}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Form Content */}
              <div className="p-6">
                <BookForm 
                  book={book}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  loading={hookLoading}
                  submitButtonText={hookLoading ? "Đang cập nhật..." : "Cập nhật sách"}
                  cancelButtonText="Hủy bỏ"
                />
              </div>
            </div>
          )}

          {/* Tips Section */}
          {book && (
            <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-amber-800 font-semibold mb-2">💡 Mẹo hữu ích</h3>
                  <ul className="text-amber-700 text-sm space-y-1">
                    <li>• Thêm ảnh thật của sách giúp tăng độ tin cậy</li>
                    <li>• Mô tả chi tiết tình trạng sách giúp người khác dễ quyết định</li>
                    <li>• Cập nhật danh mục chính xác giúp sách dễ được tìm thấy hơn</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EditBook;