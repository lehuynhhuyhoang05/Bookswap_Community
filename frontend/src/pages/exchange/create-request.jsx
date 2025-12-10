import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge, Input } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';
import { useBooks } from '../../hooks/useBooks';
import { useAuth } from '../../hooks/useAuth';
import { TrustScoreWarning } from '../../components/common';
import { 
  ArrowLeft, 
  Send, 
  User, 
  BookOpen, 
  X, 
  Search, 
  Plus, 
  ShieldX, 
  AlertTriangle,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  ArrowRightLeft,
  Star
} from 'lucide-react';
import { toDisplayScore } from '../../utils/trustScore';

/**
 * Create Exchange Request Page
 * Can be pre-filled from suggestions via sessionStorage
 */
const CreateExchangeRequestPage = () => {
  const navigate = useNavigate();
  const { user, getTrustRestrictions, canPerformAction } = useAuth();
  const { createExchangeRequest } = useExchanges();
  const { myLibrary, fetchMyLibrary, searchBooks } = useBooks();

  const [loading, setLoading] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState(null); // {member_id, full_name, ...}
  const [offeredBooks, setOfferedBooks] = useState([]); // Array of book objects
  const [requestedBooks, setRequestedBooks] = useState([]); // Array of book objects
  const [message, setMessage] = useState('');

  // Trust score restrictions
  const restrictions = getTrustRestrictions();
  const canCreateExchange = canPerformAction('exchange');

  // Modal states
  const [showMyBooksModal, setShowMyBooksModal] = useState(false);
  const [showSearchBooksModal, setShowSearchBooksModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    // Load my library
    fetchMyLibrary();
    
    // Check if pre-filled from suggestions
    const draft = sessionStorage.getItem('exchange_request_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        setReceiverInfo(data.receiver_info || null);
        setOfferedBooks(data.offered_books || []);
        setRequestedBooks(data.requested_books || []);
        sessionStorage.removeItem('exchange_request_draft');
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }
  }, []);

  const handleAddOfferedBook = (book) => {
    if (!offeredBooks.find(b => b.book_id === book.book_id)) {
      setOfferedBooks([...offeredBooks, book]);
    }
    setShowMyBooksModal(false);
  };

  const handleRemoveOfferedBook = (bookId) => {
    setOfferedBooks(offeredBooks.filter(b => b.book_id !== bookId));
  };

  const handleAddRequestedBook = (book) => {
    // Prevent adding own books as requested
    if (book.owner?.member_id === user?.member?.member_id) {
      alert('❌ Không thể yêu cầu sách của chính bạn!');
      return;
    }

    // Check if book already added
    if (requestedBooks.find(b => b.book_id === book.book_id)) {
      setShowSearchBooksModal(false);
      return;
    }

    // CRITICAL: Validate single receiver
    if (receiverInfo && book.owner?.member_id !== receiverInfo.member_id) {
      alert(
        `⚠️ Bạn chỉ có thể tạo yêu cầu với 1 người!\n\n` +
        `Hiện tại đang chọn sách của: ${receiverInfo.full_name}\n` +
        `Sách này thuộc về: ${book.owner?.user?.full_name || 'người khác'}\n\n` +
        `Vui lòng tạo yêu cầu riêng cho từng người.`
      );
      return;
    }

    // Add book
    setRequestedBooks([...requestedBooks, book]);
    
    // Auto-set receiver from first book owner
    if (!receiverInfo && book.owner) {
      setReceiverInfo({
        member_id: book.owner.member_id,
        full_name: book.owner.user?.full_name || 'Unknown',
        region: book.owner.region || 'Unknown',
        trust_score: book.owner.trust_score || 0
      });
    }
    
    setShowSearchBooksModal(false);
  };

  const handleRemoveRequestedBook = (bookId) => {
    const newRequestedBooks = requestedBooks.filter(b => b.book_id !== bookId);
    setRequestedBooks(newRequestedBooks);
    
    // Clear receiver if no requested books left
    if (newRequestedBooks.length === 0) {
      setReceiverInfo(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const results = await searchBooks(searchQuery);
      // Filter: exclude only my books (allow browsing all other books)
      const otherBooks = (results.data || []).filter(
        book => book.owner?.member_id !== user?.member?.member_id
      );
      
      setSearchResults(otherBooks);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check trust score restriction
    if (!canCreateExchange) {
      alert('Điểm tin cậy của bạn quá thấp để tạo yêu cầu trao đổi. Vui lòng liên hệ quản trị viên.');
      return;
    }
    
    if (!receiverInfo?.member_id || offeredBooks.length === 0 || requestedBooks.length === 0) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      await createExchangeRequest({
        receiver_id: receiverInfo.member_id,
        offered_book_ids: offeredBooks.map(b => b.book_id),
        requested_book_ids: requestedBooks.map(b => b.book_id),
        message: message.trim() || undefined
      });
      
      alert('Đã gửi yêu cầu trao đổi!');
      navigate('/exchange/requests');
    } catch (error) {
      alert('Thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-10 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Tạo yêu cầu mới</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Tạo yêu cầu trao đổi
            </h1>
            <p className="text-white/80 text-lg">
              Đề xuất sách bạn muốn trao đổi và chọn sách bạn muốn nhận
            </p>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          
          {/* Trust Score Warning */}
          <TrustScoreWarning restrictions={restrictions} />

          {/* Blocked Message */}
          {!canCreateExchange && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShieldX className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-800 mb-2">
                    Không thể tạo yêu cầu trao đổi
                  </h3>
                  <p className="text-red-700 mb-3">
                    Điểm tin cậy của bạn hiện tại là <strong>{restrictions.score}</strong>, 
                    thấp hơn mức tối thiểu (20 điểm) để tạo yêu cầu trao đổi.
                  </p>
                  <p className="text-sm text-red-600">
                    Để khôi phục khả năng trao đổi sách, vui lòng liên hệ quản trị viên 
                    hoặc cải thiện hành vi sử dụng nền tảng.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form - only show if user can create exchange */}
          {canCreateExchange ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Receiver Info */}
              <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                receiverInfo ? 'border-indigo-200' : 'border-gray-200 border-dashed'
              }`}>
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Người nhận yêu cầu
                  </h3>
                </div>
                <div className="p-6">
                  {receiverInfo ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <User className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {receiverInfo.full_name}
                          </h4>
                          <p className="text-sm text-gray-500">{receiverInfo.region || 'Khu vực không xác định'}</p>
                          <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {toDisplayScore(receiverInfo.trust_score)}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReceiverInfo(null);
                          setRequestedBooks([]);
                        }}
                        className="text-sm text-red-600 hover:text-red-800 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Đổi người nhận
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">
                        Chưa chọn người nhận. Người nhận sẽ được tự động xác định khi bạn chọn sách muốn nhận.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Offered Books */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    Sách bạn đề nghị
                    <span className="text-red-500">*</span>
                    {offeredBooks.length > 0 && (
                      <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {offeredBooks.length}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="p-6">
                  {offeredBooks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="text-gray-500 mb-4">Chưa có sách nào được chọn</p>
                      <button
                        type="button"
                        onClick={() => setShowMyBooksModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Chọn từ thư viện
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {offeredBooks.map((book) => (
                          <div key={book.book_id} className="bg-blue-50 p-4 rounded-xl border border-blue-200 relative group hover:shadow-md transition-all">
                            <button
                              type="button"
                              onClick={() => handleRemoveOfferedBook(book.book_id)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="font-semibold text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-600 mt-1">{book.author}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-white text-gray-600 rounded-full">{book.condition}</span>
                              {book.category && (
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">{book.category}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowMyBooksModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm sách
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Requested Books */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    Sách bạn muốn nhận
                    <span className="text-red-500">*</span>
                    {requestedBooks.length > 0 && (
                      <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {requestedBooks.length}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="p-6">
                  {requestedBooks.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-green-400" />
                      </div>
                      <p className="text-gray-500 mb-4">Chưa có sách nào được chọn</p>
                      <button
                        type="button"
                        onClick={() => setShowSearchBooksModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        <Search className="w-4 h-4" />
                        Tìm kiếm sách
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {requestedBooks.map((book) => (
                          <div key={book.book_id} className="bg-green-50 p-4 rounded-xl border border-green-200 relative group hover:shadow-md transition-all">
                            <button
                              type="button"
                              onClick={() => handleRemoveRequestedBook(book.book_id)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="font-semibold text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-600 mt-1">{book.author}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-white text-gray-600 rounded-full">{book.condition}</span>
                              {book.category && (
                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">{book.category}</span>
                              )}
                            </div>
                            {book.owner && (
                              <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {book.owner.full_name}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSearchBooksModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-green-300 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm sách
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-purple-600" />
                    Lời nhắn
                    <span className="text-gray-400 text-sm font-normal ml-2">(tùy chọn)</span>
                  </h3>
                </div>
                <div className="p-6">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                    placeholder="Viết lời nhắn để giới thiệu hoặc thương lượng với người nhận..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Một lời nhắn thân thiện có thể tăng khả năng yêu cầu được chấp nhận
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                  Tóm tắt yêu cầu
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-blue-600">{offeredBooks.length}</div>
                    <div className="text-sm text-gray-600 mt-1">Sách đề nghị</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-green-600">{requestedBooks.length}</div>
                    <div className="text-sm text-gray-600 mt-1">Sách yêu cầu</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-purple-600">
                      {message.trim().length > 0 ? <CheckCircle2 className="w-8 h-8 mx-auto text-purple-600" /> : '—'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Lời nhắn</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading || !receiverInfo || offeredBooks.length === 0 || requestedBooks.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Gửi yêu cầu trao đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Blocked UI */
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tính năng bị khóa</h3>
              <p className="text-gray-500 mb-6">
                Form tạo yêu cầu trao đổi bị khóa do điểm tin cậy thấp
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Xem hồ sơ
              </button>
            </div>
          )}
        </div>
      </div>

        {/* My Books Modal */}
        {showMyBooksModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Chọn sách từ thư viện</h3>
                  </div>
                  <button
                    onClick={() => setShowMyBooksModal(false)}
                    className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {myLibrary.loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner />
                    <p className="mt-3 text-gray-500">Đang tải thư viện...</p>
                  </div>
                ) : myLibrary.items.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">Bạn chưa có sách nào trong thư viện</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myLibrary.items
                      .filter(book => book.status === 'AVAILABLE')
                      .map((book) => {
                        const isSelected = offeredBooks.find(b => b.book_id === book.book_id);
                        return (
                          <div
                            key={book.book_id}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                            }`}
                            onClick={() => !isSelected && handleAddOfferedBook(book)}
                          >
                            {isSelected && (
                              <div className="mb-2 flex items-center gap-1 text-blue-600 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Đã chọn
                              </div>
                            )}
                            <div className="font-semibold text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-600 mt-1">{book.author}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{book.condition}</span>
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">{book.status}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search Books Modal */}
        {showSearchBooksModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Tìm kiếm sách</h3>
                  </div>
                  <button
                    onClick={() => setShowSearchBooksModal(false)}
                    className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Receiver notice */}
                {receiverInfo && (
                  <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Đã chọn sách của <strong>{receiverInfo.full_name}</strong> - Chỉ có thể thêm sách của người này
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nhập tên sách, tác giả..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                  <button 
                    onClick={handleSearch} 
                    disabled={searchLoading}
                    className="px-5 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Tìm
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {searchLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <LoadingSpinner />
                    <p className="mt-3 text-gray-500">Đang tìm kiếm...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      {searchQuery ? 'Không tìm thấy sách phù hợp' : 'Nhập từ khóa để tìm kiếm sách'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((book) => {
                      const isOwnerSelected = receiverInfo && book.owner?.member_id === receiverInfo.member_id;
                      const isDifferentOwner = receiverInfo && book.owner?.member_id !== receiverInfo.member_id;
                      const isAlreadyAdded = requestedBooks.find(b => b.book_id === book.book_id);
                      
                      return (
                        <div
                          key={book.book_id}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            isAlreadyAdded
                              ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                              : isDifferentOwner 
                              ? 'border-red-200 bg-red-50 opacity-60 hover:opacity-100' 
                              : isOwnerSelected
                              ? 'border-green-300 bg-green-50 hover:border-green-500'
                              : 'border-gray-200 hover:border-green-400 hover:shadow-md'
                          }`}
                          onClick={() => !isAlreadyAdded && handleAddRequestedBook(book)}
                        >
                          {isAlreadyAdded && (
                            <div className="mb-2 flex items-center gap-1 text-green-600 text-sm font-medium">
                              <CheckCircle2 className="w-4 h-4" />
                              Đã chọn
                            </div>
                          )}
                          {isDifferentOwner && !isAlreadyAdded && (
                            <div className="mb-2 px-2 py-1 bg-red-200 text-red-800 text-xs rounded-lg inline-block">
                              ⚠️ Người khác - Cần tạo request riêng
                            </div>
                          )}
                          <div className="font-semibold text-gray-900">{book.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{book.author}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{book.condition}</span>
                            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">{book.status}</span>
                          </div>
                          {book.owner && (
                            <div className={`text-xs mt-2 flex items-center gap-1 ${
                              isDifferentOwner ? 'text-red-600 font-semibold' : 'text-gray-500'
                            }`}>
                              <User className="w-3 h-3" />
                              {book.owner.user?.full_name || 'Unknown'}
                              {book.owner.region && ` • ${book.owner.region}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </Layout>
  );
};

export default CreateExchangeRequestPage;
