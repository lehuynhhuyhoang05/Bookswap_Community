import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConditionBadge from '../ui/ConditionBadge';
import Avatar from '../ui/Avatar';
import { useBooks } from '../../hooks/useBooks';
import { useMessages } from '../../hooks/useMessages';
import { MessageSquare, Flag, Camera, ChevronLeft, ChevronRight, X, CheckCircle } from 'lucide-react';
import CreateReportModal from '../reports/CreateReportModal';
import { toDisplayScore, getTrustBadgeConfig } from '../../utils/trustScore';

const BookDetail = ({ book }) => {
  const navigate = useNavigate();
  const { getGoogleBookByISBN } = useBooks();
  const { createDirectConversation } = useMessages();
  const [googleBookData, setGoogleBookData] = useState(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [userPhotoIndex, setUserPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // DEBUG: Log dữ liệu book từ API
  useEffect(() => {
    if (book) {
      console.log('📖 BOOK DATA FROM API:', book);
      console.log('🔍 BOOK ISBN:', book.isbn);
      console.log('📝 BOOK DESCRIPTION:', book.description);
      console.log('🖼️ COVER IMAGE FIELDS:', {
        cover_image_url: book.cover_image_url,
        image_url: book.image_url,
        cover_image: book.cover_image
      });
    }
  }, [book]);

  // Lấy dữ liệu từ Google Books bằng ISBN
  useEffect(() => {
    const fetchGoogleBookData = async () => {
      if (book?.isbn) {
        setLoadingGoogle(true);
        try {
          console.log('🚀 START: Fetching Google Books for ISBN:', book.isbn);
          const googleData = await getGoogleBookByISBN(book.isbn);
          console.log('✅ SUCCESS: Google Books response:', googleData);
          
          if (googleData) {
            // Backend đã flatten response - không có volumeInfo wrapper
            console.log('📚 Google Books data:', googleData);
            console.log('🖼️ Google Books imageLinks:', googleData.imageLinks);
            console.log('📝 Google Books description:', googleData.description);
          } else {
            console.log('❌ Google Books returned null/undefined');
          }
          
          setGoogleBookData(googleData);
        } catch (error) {
          console.error('❌ ERROR: Google Books fetch failed:', error);
          console.error('Error details:', error.response?.data || error.message);
        } finally {
          setLoadingGoogle(false);
        }
      } else {
        console.log('❌ NO ISBN: Cannot fetch Google Books data');
      }
    };

    fetchGoogleBookData();
  }, [book, getGoogleBookByISBN]);

  // Format condition text for display
  const getConditionText = (condition) => {
    const conditions = {
      'LIKE_NEW': 'Như mới',
      'GOOD': 'Tốt',
      'FAIR': 'Khá',
      'POOR': 'Cũ',
      'like_new': 'Như mới',
      'good': 'Tốt',
      'fair': 'Khá',
      'poor': 'Cũ'
    };
    return conditions[condition] || condition;
  };

  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  // Get the correct condition value
  const bookCondition = book?.book_condition || book?.condition;
  // Get the correct category/genre
  const bookCategory = book?.category || book?.genre;
  // Get owner information with fallbacks
  const owner = book?.owner || {};
  const ownerUser = owner?.user || owner;
  
  // 🎯 LẤY MÔ TẢ: Ưu tiên API -> Google Books (BE đã flatten, không có volumeInfo)
  const bookDescription = book?.description || googleBookData?.description || null;

  // 🎯 LẤY ẢNH: Chỉ từ Google Books (API không có ảnh) - BE đã flatten
  const getCoverImage = () => {
    if (googleBookData?.imageLinks) {
      const imageLinks = googleBookData.imageLinks;
      // Thử các kích thước ảnh khác nhau
      return imageLinks.thumbnail || imageLinks.smallThumbnail || imageLinks.medium || imageLinks.large;
    }
    return null;
  };

  const coverImage = getCoverImage();
  const isImageFromGoogle = !!coverImage;
  const isDescriptionFromGoogle = !book?.description && googleBookData?.description;

  console.log('🎯 FINAL DATA CHECK:', {
    hasAPIDescription: !!book?.description,
    hasGoogleDescription: !!googleBookData?.description,
    hasCoverImage: !!coverImage,
    isImageFromGoogle,
    isDescriptionFromGoogle,
    finalDescription: bookDescription,
    finalCoverImage: coverImage
  });

  // Early return nếu không có book
  if (!book) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <p className="text-gray-500">Đang tải thông tin sách...</p>
      </div>
    );
  }

  // Handle contact for exchange
  const handleContactForExchange = () => {
    if (!book || !book.book_id) {
      alert('Thông tin sách không hợp lệ');
      return;
    }

    // Kiểm tra xem có phải sách của chính mình không
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (owner?.user_id === currentUser.user_id || ownerUser?.user_id === currentUser.user_id) {
      alert('Bạn không thể tạo yêu cầu trao đổi với sách của chính mình');
      return;
    }

    // Chuyển đến trang tạo yêu cầu trao đổi với book_id
    navigate(`/exchange/create-request?wanted_book_id=${book.book_id}`);
  };

  // Handle direct chat with book owner
  const handleChatWithOwner = async () => {
    if (!book || !book.book_id) {
      alert('Thông tin sách không hợp lệ');
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const ownerId = owner?.user_id || ownerUser?.user_id;
    
    if (ownerId === currentUser.user_id) {
      alert('Đây là sách của bạn');
      return;
    }

    if (!ownerId) {
      alert('Không tìm thấy thông tin chủ sách');
      return;
    }

    setChatLoading(true);
    try {
      console.log('🚀 Creating conversation with owner:', ownerId);
      
      // Tạo hoặc lấy conversation trực tiếp
      const result = await createDirectConversation(ownerId);
      console.log('✅ Created/Retrieved conversation:', result);
      
      // Parse response đúng cấu trúc
      const conversationData = result?.data || result;
      const conversationId = conversationData?.conversation_id;
      
      if (conversationId) {
        console.log('✅ Conversation ID:', conversationId);
        // Chuyển đến trang messages với conversation_id
        navigate(`/messages?conversation_id=${conversationId}`);
      } else {
        throw new Error('Không nhận được conversation_id từ server');
      }
    } catch (error) {
      console.error('❌ Failed to create conversation:', error);
      alert('Không thể mở chat: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Hero Section - Book Cover + Basic Info */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Book Cover */}
            <div className="flex-shrink-0">
              <div className="w-48 h-64 bg-white/10 rounded-lg overflow-hidden shadow-xl mx-auto md:mx-0">
                {coverImage && !imageError ? (
                  <img
                    src={coverImage}
                    alt={`Bìa sách ${book.title}`}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/50 text-white/70">
                    <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm">Không có ảnh</span>
                  </div>
                )}
              </div>
              {isImageFromGoogle && !imageError && (
                <p className="text-xs text-white/60 text-center mt-2">📚 Từ Google Books</p>
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-3">
                <ConditionBadge condition={bookCondition} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{book.title}</h1>
              <p className="text-xl text-white/90 mb-4">
                <span className="text-white/60">bởi</span> {book.author || 'Chưa rõ tác giả'}
              </p>
              
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                {bookCategory && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    📂 {bookCategory}
                  </span>
                )}
                {book.isbn && (
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-mono">
                    ISBN: {book.isbn}
                  </span>
                )}
                {book.status === 'AVAILABLE' ? (
                  <span className="px-3 py-1 bg-green-500/80 rounded-full text-sm font-medium">
                    ✓ Có sẵn
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-500/80 rounded-full text-sm font-medium">
                    ⏳ Đã cho mượn
                  </span>
                )}
              </div>

              {loadingGoogle && (
                <p className="text-sm text-white/70 animate-pulse">
                  🔍 Đang tải thông tin từ Google Books...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Mô tả sách
              </h3>
              {bookDescription ? (
                <div>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {bookDescription}
                  </p>
                  {isDescriptionFromGoogle && (
                    <p className="text-xs text-blue-500 mt-3 pt-2 border-t border-gray-200">
                      📚 Mô tả từ Google Books
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-6">
                  <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="italic text-sm">Chưa có mô tả cho cuốn sách này</p>
                </div>
              )}
            </div>

            {/* Book Details Grid */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Thông tin chi tiết
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Thể loại</p>
                  <p className="font-medium text-gray-900">{bookCategory || 'Chưa phân loại'}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Tình trạng</p>
                  <p className="font-medium text-gray-900">{getConditionText(bookCondition)}</p>
                </div>
                {book.isbn && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">ISBN</p>
                    <p className="font-medium text-gray-900 font-mono text-sm">{book.isbn}</p>
                  </div>
                )}
                {book.page_count && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Số trang</p>
                    <p className="font-medium text-gray-900">{book.page_count}</p>
                  </div>
                )}
                {book.publisher && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">NXB</p>
                    <p className="font-medium text-gray-900">{book.publisher}</p>
                  </div>
                )}
                {book.language && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Ngôn ngữ</p>
                    <p className="font-medium text-gray-900">{book.language}</p>
                  </div>
                )}
                {book.views !== undefined && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Lượt xem</p>
                    <p className="font-medium text-gray-900">{book.views}</p>
                  </div>
                )}
              </div>

              {/* Condition Notes - if available */}
              {book.condition_notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Ghi chú tình trạng</p>
                  <p className="text-gray-700 text-sm bg-white p-3 rounded-lg">
                    {book.condition_notes}
                  </p>
                </div>
              )}
            </div>

            {/* User Photos - if available */}
            {book.user_photos && book.user_photos.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-green-600" />
                  Ảnh sách thật
                  <span className="ml-auto flex items-center gap-1 text-sm font-normal text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Đã xác minh
                  </span>
                </h3>
                
                {/* Photo Gallery */}
                <div className="relative">
                  {/* Main Photo */}
                  <div 
                    className="aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => setShowPhotoModal(true)}
                  >
                    <img
                      src={book.user_photos[userPhotoIndex]}
                      alt={`Ảnh sách ${userPhotoIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Navigation arrows */}
                  {book.user_photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setUserPhotoIndex(prev => 
                          prev === 0 ? book.user_photos.length - 1 : prev - 1
                        )}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setUserPhotoIndex(prev => 
                          prev === book.user_photos.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Photo counter */}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {userPhotoIndex + 1} / {book.user_photos.length}
                  </div>
                </div>

                {/* Thumbnails */}
                {book.user_photos.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {book.user_photos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setUserPhotoIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                          idx === userPhotoIndex 
                            ? 'border-blue-500 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={photo}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  📷 Ảnh do chủ sách chụp để xác minh sách thật
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Owner Info & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Owner Information */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Chủ sách
              </h3>
              
              <Link 
                to={`/profile/${owner.member_id}`}
                state={{ memberData: { ...owner, user: ownerUser } }}
                className="flex items-center gap-4 p-3 bg-white rounded-lg hover:shadow-md transition-shadow mb-4"
              >
                <Avatar 
                  src={ownerUser.avatar_url} 
                  alt={ownerUser.full_name || ownerUser.username}
                  size="lg"
                  className="ring-2 ring-white shadow"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {ownerUser.full_name || ownerUser.username || 'Ẩn danh'}
                  </p>
                  {owner.trust_score != null && (() => {
                    const displayScore = toDisplayScore(owner.trust_score);
                    const badgeConfig = getTrustBadgeConfig(displayScore);
                    return (
                      <div className="flex items-center gap-1 mt-1">
                        <div className={`w-2 h-2 rounded-full ${badgeConfig.badgeColor}`}></div>
                        <span className="text-sm text-gray-600">
                          {displayScore} - {badgeConfig.shortLabel}
                        </span>
                      </div>
                    );
                  })()}
                  {owner.region && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      📍 {owner.region}
                    </p>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handleContactForExchange}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Liên hệ trao đổi
                </button>

                <button 
                  onClick={handleChatWithOwner}
                  disabled={chatLoading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  <MessageSquare className="w-5 h-5" />
                  {chatLoading ? 'Đang mở...' : 'Nhắn tin'}
                </button>

                <button
                  onClick={() => setReportModalOpen(true)}
                  className="w-full py-2 px-4 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Flag className="w-4 h-4" />
                  Báo cáo vi phạm
                </button>
              </div>
            </div>

            {/* Back to list */}
            <Link
              to="/books"
              className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại khám phá
            </Link>
          </div>
        </div>
      </div>

      {/* Create Report Modal */}
      <CreateReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedMember={{
          member_id: owner.member_id,
          full_name: ownerUser.full_name || ownerUser.username || 'Người dùng'
        }}
        reportedItem={{
          type: 'BOOK',
          id: book.book_id
        }}
      />

      {/* Full Photo Modal */}
      {showPhotoModal && book.user_photos && book.user_photos.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowPhotoModal(false)}
        >
          <button
            onClick={() => setShowPhotoModal(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img
              src={book.user_photos[userPhotoIndex]}
              alt={`Ảnh sách ${userPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation */}
            {book.user_photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserPhotoIndex(prev => 
                      prev === 0 ? book.user_photos.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserPhotoIndex(prev => 
                      prev === book.user_photos.length - 1 ? 0 : prev + 1
                    );
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full">
              {userPhotoIndex + 1} / {book.user_photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;