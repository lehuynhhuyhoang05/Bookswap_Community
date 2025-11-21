import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge, Input } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';
import { useBooks } from '../../hooks/useBooks';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft, Send, User, BookOpen, X, Search, Plus } from 'lucide-react';

/**
 * Create Exchange Request Page
 * Can be pre-filled from suggestions via sessionStorage
 */
const CreateExchangeRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createExchangeRequest } = useExchanges();
  const { myLibrary, fetchMyLibrary, searchBooks } = useBooks();

  const [loading, setLoading] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState(null); // {member_id, full_name, ...}
  const [offeredBooks, setOfferedBooks] = useState([]); // Array of book objects
  const [requestedBooks, setRequestedBooks] = useState([]); // Array of book objects
  const [message, setMessage] = useState('');

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
    if (!requestedBooks.find(b => b.book_id === book.book_id)) {
      setRequestedBooks([...requestedBooks, book]);
      // Auto-set receiver from book owner
      if (!receiverInfo && book.owner) {
        setReceiverInfo({
          member_id: book.owner.member_id,
          full_name: book.owner.user?.full_name || 'Unknown',
          region: book.owner.region || 'Unknown',
          trust_score: book.owner.trust_score || 0
        });
      }
    }
    setShowSearchBooksModal(false);
  };

  const handleRemoveRequestedBook = (bookId) => {
    setRequestedBooks(requestedBooks.filter(b => b.book_id !== bookId));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const results = await searchBooks(searchQuery);
      // Filter out my own books
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="text" onClick={() => navigate(-1)} className="mb-4 text-blue-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Tạo yêu cầu trao đổi</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Receiver Info */}
            {receiverInfo && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {receiverInfo.full_name || 'Người dùng'}
                    </h3>
                    <p className="text-sm text-gray-600">{receiverInfo.region || 'Khu vực không xác định'}</p>
                    <Badge variant="info" size="sm" className="mt-1">
                      ⭐ {receiverInfo.trust_score || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Offered Books */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                <BookOpen className="w-5 h-5 inline mr-2 text-blue-600" />
                Sách bạn đề nghị <span className="text-red-500">*</span>
              </label>
              {offeredBooks.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">Chưa có sách nào được chọn</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMyBooksModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Chọn sách từ thư viện
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offeredBooks.map((book) => (
                      <div key={book.book_id} className="bg-blue-50 p-4 rounded-lg border border-blue-200 relative group hover:shadow-md transition-shadow">
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
                          <Badge variant="outline" size="sm">{book.condition}</Badge>
                          {book.category && <Badge variant="info" size="sm">{book.category}</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMyBooksModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sách
                  </Button>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-3 font-medium">
                📚 Tổng: {offeredBooks.length} sách
              </p>
            </div>

            {/* Requested Books */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                <BookOpen className="w-5 h-5 inline mr-2 text-green-600" />
                Sách bạn muốn nhận <span className="text-red-500">*</span>
              </label>
              {requestedBooks.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-gray-500 mb-4">Chưa có sách nào được chọn</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSearchBooksModal(true)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Tìm kiếm sách
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requestedBooks.map((book) => (
                      <div key={book.book_id} className="bg-green-50 p-4 rounded-lg border border-green-200 relative group hover:shadow-md transition-shadow">
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
                          <Badge variant="outline" size="sm">{book.condition}</Badge>
                          {book.category && <Badge variant="info" size="sm">{book.category}</Badge>}
                        </div>
                        {book.owner && (
                          <div className="text-xs text-gray-500 mt-2">
                            📍 {book.owner.full_name}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSearchBooksModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm sách
                  </Button>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-3 font-medium">
                📚 Tổng: {requestedBooks.length} sách
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                💬 Lời nhắn <span className="text-gray-400 text-sm font-normal">(tùy chọn)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Viết lời nhắn để giới thiệu hoặc thương lượng với người nhận..."
                rows="5"
              />
              <p className="text-xs text-gray-500 mt-2">
                Một lời nhắn thân thiện có thể tăng khả năng yêu cầu được chấp nhận
              </p>
            </div>

            {/* Summary Box */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-3">📋 Tóm tắt yêu cầu</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{offeredBooks.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Sách đề nghị</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">{requestedBooks.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Sách yêu cầu</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">{message.trim().length > 0 ? '✓' : '—'}</div>
                  <div className="text-sm text-gray-600 mt-1">Lời nhắn</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="px-6 py-3"
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || !receiverInfo || offeredBooks.length === 0 || requestedBooks.length === 0}
                className="px-8 py-3 text-lg"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Gửi yêu cầu trao đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* My Books Modal */}
        {showMyBooksModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Chọn sách từ thư viện của bạn</h3>
                  <button
                    onClick={() => setShowMyBooksModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {myLibrary.loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : myLibrary.items.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Bạn chưa có sách nào trong thư viện</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myLibrary.items
                      .filter(book => book.status === 'AVAILABLE')
                      .map((book) => (
                        <div
                          key={book.book_id}
                          className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
                          onClick={() => handleAddOfferedBook(book)}
                        >
                          <div className="font-semibold">{book.title}</div>
                          <div className="text-sm text-gray-600 mt-1">{book.author}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" size="sm">{book.condition}</Badge>
                            <Badge variant="success" size="sm">{book.status}</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search Books Modal */}
        {showSearchBooksModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Tìm kiếm sách</h3>
                  <button
                    onClick={() => setShowSearchBooksModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nhập tên sách..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={searchLoading}>
                    <Search className="w-4 h-4 mr-2" />
                    Tìm
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {searchLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    {searchQuery ? 'Không tìm thấy sách nào' : 'Nhập tên sách để tìm kiếm'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((book) => (
                      <div
                        key={book.book_id}
                        className="p-4 border rounded-lg hover:border-green-500 cursor-pointer transition-colors"
                        onClick={() => handleAddRequestedBook(book)}
                      >
                        <div className="font-semibold">{book.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{book.author}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" size="sm">{book.condition}</Badge>
                          <Badge variant="success" size="sm">{book.status}</Badge>
                        </div>
                        {book.owner && (
                          <div className="text-xs text-gray-500 mt-2">
                            📍 Chủ sở hữu: {book.owner.user?.full_name || 'Unknown'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CreateExchangeRequestPage;
