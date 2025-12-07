// src/pages/books/book-detail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge } from '../../components/ui';
import { useBooks } from '../../hooks/useBooks';
import { booksService } from '../../services/api/books';
import { 
  ArrowLeft, 
  BookOpen, 
  User, 
  MapPin, 
  Calendar, 
  Star,
  Edit,
  Trash2,
  ExternalLink,
  ArrowRightLeft,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toDisplayScore } from '../../utils/trustScore';

/**
 * Book Detail Page
 * Shows full book information + exchange history
 */
const BookDetailPage = () => {
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const { deleteBook } = useBooks();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exchangeHistory, setExchangeHistory] = useState([]);
  const [imageError, setImageError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    // Get current user info from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserId(user.user_id);
    }
    fetchBookDetail();
  }, [bookId]);

  const fetchBookDetail = async () => {
    try {
      setLoading(true);
      const data = await booksService.getBookById(bookId);
      setBook(data);

      // Fetch exchange history for this book
      try {
        const historyResponse = await fetch(`http://localhost:3000/books/${bookId}/exchanges`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setExchangeHistory(historyData.exchanges || []);
        }
      } catch (err) {
        console.log('Exchange history not available:', err);
        setExchangeHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch book:', error);
      alert('Không thể tải thông tin sách');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc muốn xóa sách "${book.title}"?`)) return;

    try {
      await deleteBook(bookId);
      alert('Đã xóa sách thành công');
      navigate('/library');
    } catch (error) {
      alert('Không thể xóa sách: ' + (error.message || 'Vui lòng thử lại'));
    }
  };

  const getConditionBadge = (condition) => {
    const configs = {
      'LIKE_NEW': { label: 'Như mới', variant: 'success' },
      'GOOD': { label: 'Tốt', variant: 'info' },
      'FAIR': { label: 'Khá', variant: 'warning' },
      'POOR': { label: 'Cũ', variant: 'danger' },
    };
    return configs[condition] || { label: condition, variant: 'default' };
  };

  const getStatusBadge = (status) => {
    const configs = {
      'AVAILABLE': { label: 'Có sẵn', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
      'EXCHANGING': { label: 'Đang trao đổi', icon: ArrowRightLeft, color: 'text-yellow-600 bg-yellow-100' },
      'UNAVAILABLE': { label: 'Không khả dụng', icon: AlertCircle, color: 'text-gray-600 bg-gray-100' },
    };
    return configs[status] || configs['AVAILABLE'];
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sách</h2>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </Card>
      </Layout>
    );
  }

  const condition = getConditionBadge(book.book_condition || book.condition);
  const status = getStatusBadge(book.status);
  const StatusIcon = status.icon;
  
  // Check ownership by comparing current user with book owner
  const isOwner = currentUserId && book.owner?.user?.user_id === currentUserId;
  
  console.log('🔍 Ownership check:', { 
    currentUserId, 
    bookOwnerId: book.owner?.user?.user_id, 
    isOwner 
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="text" onClick={() => navigate(-1)} className="mb-4 sm:mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Book Info */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Main Info Card */}
            <Card className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Book Cover */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-36 h-48 sm:w-48 sm:h-64 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg overflow-hidden shadow-lg border-2 border-gray-200">
                    {book.cover_image_url && !imageError ? (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500 font-medium line-clamp-3">{book.title}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Details */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                      <p className="text-base sm:text-lg text-gray-600">Tác giả: {book.author || 'Không rõ'}</p>
                    </div>
                    <div className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-lg ${status.color} self-center sm:self-start`}>
                      <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium text-sm sm:text-base">{status.label}</span>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
                    {book.isbn && (
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-700">
                        <span className="font-medium">ISBN:</span>
                        <span className="font-mono text-xs sm:text-sm">{book.isbn}</span>
                      </div>
                    )}
                    {book.publisher && (
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-700">
                        <span className="font-medium">Nhà xuất bản:</span>
                        <span>{book.publisher}</span>
                      </div>
                    )}
                    {book.publish_date && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>Năm xuất bản: {new Date(book.publish_date).getFullYear()}</span>
                      </div>
                    )}
                    {book.language && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-medium">Ngôn ngữ:</span>
                        <span>{book.language === 'vi' ? 'Tiếng Việt' : book.language === 'en' ? 'English' : book.language}</span>
                      </div>
                    )}
                    {book.page_count && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <BookOpen className="w-4 h-4" />
                        <span>{book.page_count} trang</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant={condition.variant}>{condition.label}</Badge>
                    {book.category && <Badge variant="outline">{book.category}</Badge>}
                  </div>

                  {/* Description */}
                  {book.description && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                      <p className="text-gray-700 leading-relaxed">{book.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Exchange History */}
            <Card className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  Lịch sử trao đổi
                </h2>
                {exchangeHistory.length > 0 && (
                  <span className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full w-fit">
                    {exchangeHistory.length} lần trao đổi
                  </span>
                )}
              </div>

              {exchangeHistory.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-md">
                    <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 font-medium mb-1 sm:mb-2">Sách chưa từng được trao đổi</p>
                  <p className="text-xs sm:text-sm text-gray-500">Đây là cuốn sách mới được đăng</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full" />
                  
                  <div className="space-y-4">
                    {exchangeHistory.map((exchange, idx) => {
                      const fromMember = exchange.from_member || {};
                      const toMember = exchange.to_member || {};
                      const fromName = fromMember.name || 'Không rõ';
                      const toName = toMember.name || 'Không rõ';
                      const completedDate = exchange.completed_at 
                        ? new Date(exchange.completed_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit', 
                            year: 'numeric'
                          })
                        : 'N/A';
                      const otherBooks = exchange.other_books_count || 0;
                      
                      return (
                        <div
                          key={exchange.exchange_id || idx}
                          className="relative pl-12 group"
                        >
                          {/* Timeline dot */}
                          <div className="absolute left-2 top-4 w-6 h-6 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                            <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                          </div>
                          
                          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                            {/* Date badge */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>{completedDate}</span>
                              </div>
                              <Link 
                                to={`/exchange/${exchange.exchange_id}`}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                title="Xem chi tiết"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            </div>
                            
                            {/* Exchange flow */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                              {/* From member */}
                              <Link 
                                to={fromMember.member_id ? `/members/${fromMember.member_id}` : '#'}
                                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors flex-1 min-w-0 w-full sm:w-auto"
                              >
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {fromName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{fromName}</span>
                              </Link>
                              
                              {/* Arrow */}
                              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center ml-10 sm:ml-0 rotate-90 sm:rotate-0">
                                <ArrowRightLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              </div>
                              
                              {/* To member */}
                              <Link 
                                to={toMember.member_id ? `/members/${toMember.member_id}` : '#'}
                                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors flex-1 min-w-0 w-full sm:w-auto"
                              >
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {toName.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{toName}</span>
                              </Link>
                            </div>
                            
                            {/* Additional info */}
                            {otherBooks > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  Trao đổi cùng {otherBooks} cuốn sách khác
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Current owner indicator */}
                  {book.owner && (
                    <div className="relative pl-12 mt-4">
                      <div className="absolute left-2 top-3 w-6 h-6 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center z-10">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-emerald-700 font-medium">Hiện đang thuộc về:</span>
                          <Link 
                            to={`/members/${book.owner.member_id}`}
                            className="text-sm font-semibold text-emerald-800 hover:underline"
                          >
                            {book.owner.user?.full_name || 'Chủ sở hữu hiện tại'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Management & Stats */}
          <div className="space-y-4 sm:space-y-6">
            {/* Quick Actions */}
            {isOwner && (
              <Card className="p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                  Quản lý sách
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <Link to={`/books/edit-book/${book.book_id}`} className="block">
                    <Button variant="outline" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa thông tin
                    </Button>
                  </Link>
                  <Button 
                    variant="danger" 
                    onClick={handleDelete}
                    disabled={book.status === 'EXCHANGING'}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa sách
                  </Button>
                  {book.status === 'EXCHANGING' && (
                    <p className="text-xs text-amber-600 text-center">
                      ⚠️ Không thể xóa sách đang trao đổi
                    </p>
                  )}
                </div>
              </Card>
            )}

            {/* Owner Info (for non-owners viewing) */}
            {!isOwner && book.owner && (
              <Card className="p-4 sm:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  Chủ sở hữu
                </h3>
                <div>
                  <Link
                    to={`/members/${book.owner.member_id}`}
                    className="block hover:bg-gray-50 rounded-lg p-3 -mx-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {book.owner.user?.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {book.owner.user?.full_name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{toDisplayScore(book.owner.trust_score)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {book.owner.region && (
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{book.owner.region}</span>
                    </div>
                  )}

                  {book.status === 'AVAILABLE' && (
                    <Button
                      variant="primary"
                      className="w-full mt-4"
                      onClick={() => {
                        sessionStorage.setItem('exchange_request_draft', JSON.stringify({
                          receiver_info: {
                            member_id: book.owner.member_id,
                            full_name: book.owner.user?.full_name,
                            region: book.owner.region,
                            trust_score: book.owner.trust_score
                          },
                          requested_books: [book]
                        }));
                        navigate('/exchange/create');
                      }}
                    >
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Tạo yêu cầu trao đổi
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">📊 Thống kê</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Lượt trao đổi</span>
                  <span className="font-bold text-blue-600 text-base sm:text-lg">{exchangeHistory.length}</span>
                </div>
                {book.views !== undefined && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Lượt xem</span>
                    <span className="font-semibold text-gray-900">{book.views || 0}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 sm:pt-3 border-t text-xs sm:text-sm">
                  <span className="text-gray-600">Ngày thêm</span>
                  <span className="text-gray-900">
                    {new Date(book.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                {book.updated_at && book.updated_at !== book.created_at && (
                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="text-gray-600">Cập nhật lần cuối</span>
                    <span className="text-gray-900">
                      {new Date(book.updated_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookDetailPage;
