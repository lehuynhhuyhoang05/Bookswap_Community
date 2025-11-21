import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ConditionBadge from '../ui/ConditionBadge';
import Avatar from '../ui/Avatar';
import { useBooks } from '../../hooks/useBooks';

const BookDetail = ({ book }) => {
  const { getGoogleBookByISBN } = useBooks();
  const [googleBookData, setGoogleBookData] = useState(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [imageError, setImageError] = useState(false);

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
            console.log('📚 Google Books volumeInfo:', googleData.volumeInfo);
            console.log('🖼️ Google Books imageLinks:', googleData.volumeInfo?.imageLinks);
            console.log('📝 Google Books description:', googleData.volumeInfo?.description);
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
  
  // 🎯 LẤY MÔ TẢ: Ưu tiên API -> Google Books
  const bookDescription = book?.description || googleBookData?.volumeInfo?.description || null;

  // 🎯 LẤY ẢNH: Chỉ từ Google Books (API không có ảnh)
  const getCoverImage = () => {
    if (googleBookData?.volumeInfo?.imageLinks) {
      const imageLinks = googleBookData.volumeInfo.imageLinks;
      // Thử các kích thước ảnh khác nhau
      return imageLinks.thumbnail || imageLinks.smallThumbnail || imageLinks.medium || imageLinks.large;
    }
    return null;
  };

  const coverImage = getCoverImage();
  const isImageFromGoogle = !!coverImage;
  const isDescriptionFromGoogle = !book?.description && googleBookData?.volumeInfo?.description;

  console.log('🎯 FINAL DATA CHECK:', {
    hasAPIDescription: !!book?.description,
    hasGoogleDescription: !!googleBookData?.volumeInfo?.description,
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Book Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600">Tác giả: {book.author}</p>
            {loadingGoogle && (
              <p className="text-sm text-blue-600 mt-1">
                🔍 Đang tải thông tin từ Google Books...
              </p>
            )}
            {book.isbn && (
              <p className="text-sm text-gray-500 mt-1">
                ISBN: {book.isbn}
              </p>
            )}
          </div>
          <div className="mt-4 md:mt-0">
            <ConditionBadge condition={bookCondition} />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Book Info */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Book Cover Image and Description */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Book Cover Image */}
                <div className="md:col-span-1">
                  <div className="bg-gray-100 rounded-lg border border-gray-200 p-4 flex items-center justify-center h-64">
                    {coverImage && !imageError ? (
                      <img 
                        src={coverImage} 
                        alt={`Bìa sách ${book.title}`}
                        className="max-h-56 max-w-full object-contain rounded shadow-sm"
                        onError={(e) => {
                          console.error('❌ Image failed to load:', coverImage);
                          setImageError(true);
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully:', coverImage);
                          setImageError(false);
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <p className="text-sm">Không có ảnh bìa</p>
                        {book.isbn ? (
                          <p className="text-xs mt-1">ISBN: {book.isbn}</p>
                        ) : (
                          <p className="text-xs mt-1">Sách không có ISBN</p>
                        )}
                      </div>
                    )}
                  </div>
                  {isImageFromGoogle && !imageError && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Ảnh từ Google Books
                    </p>
                  )}
                  {imageError && (
                    <p className="text-xs text-red-500 text-center mt-2">
                      Lỗi tải ảnh từ Google Books
                    </p>
                  )}
                </div>

                {/* Book Description */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Mô tả sách</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-full min-h-[200px]">
                    {bookDescription ? (
                      <div>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {bookDescription}
                        </p>
                        {isDescriptionFromGoogle && (
                          <p className="text-xs text-gray-500 mt-3 border-t pt-2">
                            Mô tả từ Google Books
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="italic">Chưa có mô tả cho cuốn sách này.</p>
                        {book.isbn ? (
                          <p className="text-sm mt-2">Google Books không có mô tả cho ISBN: {book.isbn}</p>
                        ) : (
                          <p className="text-sm mt-2">Sách không có ISBN</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rest of your existing UI */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Thông tin chi tiết</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Thể loại</h4>
                    <p className="text-gray-900">{bookCategory || 'Chưa phân loại'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Tình trạng</h4>
                    <p className="text-gray-900">{getConditionText(bookCondition)}</p>
                  </div>

                  {book.isbn && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">ISBN</h4>
                      <p className="text-gray-900 font-mono">{book.isbn}</p>
                    </div>
                  )}

                  {book.page_count && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Số trang</h4>
                      <p className="text-gray-900">{book.page_count} trang</p>
                    </div>
                  )}

                  {book.publisher && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Nhà xuất bản</h4>
                      <p className="text-gray-900">{book.publisher}</p>
                    </div>
                  )}

                  {book.publish_date && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Ngày xuất bản</h4>
                      <p className="text-gray-900">{formatDate(book.publish_date)}</p>
                    </div>
                  )}

                  {book.language && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Ngôn ngữ</h4>
                      <p className="text-gray-900">{book.language}</p>
                    </div>
                  )}

                  {book.edition && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Ấn bản</h4>
                      <p className="text-gray-900">{book.edition}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Owner Info & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Owner Information */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin chủ sách</h3>
              
              <div className="flex items-center space-x-3 mb-4">
                <Avatar 
                  src={ownerUser.avatar_url} 
                  alt={ownerUser.full_name || ownerUser.username}
                  size="md"
                />
                <div>
                  <p className="font-medium text-gray-900">
                    {ownerUser.full_name || ownerUser.username || 'Ẩn danh'}
                  </p>
                  {owner.trust_score !== undefined && (
                    <p className="text-sm text-gray-500">
                      Độ tin cậy: {owner.trust_score}%
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {owner.region && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Khu vực:</span>
                    <span className="text-gray-900">{owner.region}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-500">Trạng thái:</span>
                  <span className={`font-medium ${
                    book.status === 'AVAILABLE' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {book.status === 'AVAILABLE' ? 'Có sẵn' : 'Đã cho mượn'}
                  </span>
                </div>

                {book.views !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lượt xem:</span>
                    <span className="text-gray-900">{book.views}</span>
                  </div>
                )}
              </div>

              <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-medium">
                Liên hệ trao đổi
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thao tác</h3>
              
              <div className="space-y-3">
                <Link
                  to="/books"
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Quay lại danh sách
                </Link>

                {owner.member_id && (
                  <Link
                    to={`/profile/${owner.member_id}`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-green-300 text-green-700 rounded-md hover:bg-green-50 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Xem hồ sơ chủ sách
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;