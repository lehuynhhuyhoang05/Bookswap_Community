import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBooks } from '../../hooks/useBooks';

const BookCard = ({ book, showActions = false, showOwner = false, onUpdate, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [coverImage, setCoverImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const { getGoogleBookByISBN } = useBooks();

  // Fetch ảnh từ Google Books nếu có ISBN (giống detail page)
  useEffect(() => {
    const fetchGoogleCover = async () => {
      if (book.isbn) {
        setImageLoading(true);
        try {
          const googleData = await getGoogleBookByISBN(book.isbn);
          if (googleData?.imageLinks) {
            const img = googleData.imageLinks.thumbnail || 
                       googleData.imageLinks.smallThumbnail || 
                       googleData.imageLinks.medium;
            if (img) {
              setCoverImage(img);
            }
          }
        } catch (error) {
          console.log('Failed to fetch Google cover:', error);
        } finally {
          setImageLoading(false);
        }
      }
    };

    fetchGoogleCover();
  }, [book.isbn, getGoogleBookByISBN]);

  // Xác định trạng thái hiển thị
  const getConditionText = (condition) => {
    const conditions = {
      'NEW': 'Mới',
      'LIKE_NEW': 'Như mới',
      'VERY_GOOD': 'Rất tốt',
      'GOOD': 'Tốt',
      'FAIR': 'Khá',
      'POOR': 'Kém',
      'like_new': 'Như mới',
      'good': 'Tốt',
      'fair': 'Khá',
      'poor': 'Kém'
    };
    return conditions[condition] || condition;
  };

  // Xác định màu sắc cho trạng thái
  const getConditionColor = (condition) => {
    const colors = {
      'NEW': 'bg-pink-100 text-pink-700',
      'LIKE_NEW': 'bg-emerald-100 text-emerald-700',
      'VERY_GOOD': 'bg-green-100 text-green-700',
      'GOOD': 'bg-blue-100 text-blue-700',
      'FAIR': 'bg-yellow-100 text-yellow-700',
      'POOR': 'bg-red-100 text-red-700',
      'like_new': 'bg-emerald-100 text-emerald-700',
      'good': 'bg-blue-100 text-blue-700',
      'fair': 'bg-yellow-100 text-yellow-700',
      'poor': 'bg-red-100 text-red-700'
    };
    return colors[condition] || 'bg-gray-100 text-gray-700';
  };

  // Xử lý xóa sách
  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa sách này?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(book.book_id || book.id);
      if (onUpdate) {
        onUpdate(); // Refresh danh sách sau khi xóa
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
      alert('Có lỗi xảy ra khi xóa sách. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Sử dụng đúng field names từ API
  const bookCondition = book.book_condition || book.condition;
  const bookCategory = book.category || book.genre;
  const owner = book.owner || {};
  const ownerUser = owner.user || {};

  // Ưu tiên: Google Books cover > cover_image_url từ DB
  const displayCover = coverImage || book.cover_image_url;

  return (
    <Link 
      to={`/books/${book.book_id || book.id}`}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Ảnh bìa sách */}
      <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
        {displayCover && (
          <img 
            src={displayCover}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
            loading="lazy"
          />
        )}
        
        {/* Loading indicator */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="animate-pulse text-center">
              <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="w-20 h-2 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
        )}
        
        {/* Placeholder - hiện khi không có ảnh */}
        {!displayCover && !imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-xs text-gray-500 font-medium line-clamp-2">{book.title}</p>
            </div>
          </div>
        )}
        
        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badge điều kiện sách */}
        <div className="absolute top-3 left-3">
          <span className={`inline-block ${getConditionColor(bookCondition)} text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm`}>
            {getConditionText(bookCondition)}
          </span>
        </div>

        {/* Quick view button on hover */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white text-indigo-600 font-semibold py-2 rounded-lg text-center text-sm">
            Xem chi tiết
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
          {book.title}
        </h3>
        <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1">
          {book.author || 'Không rõ tác giả'}
        </p>
        
        {/* Hiển thị thông tin chủ sách nếu có */}
        {showOwner && owner && (ownerUser.full_name || ownerUser.username) && (
          <div className="mb-2 sm:mb-3 flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-indigo-600">
                {(ownerUser.full_name || ownerUser.username || '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-gray-500 truncate">
              {ownerUser.full_name || ownerUser.username}
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2">
          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg font-medium truncate">
            {bookCategory || 'Khác'}
          </span>
          
          {/* ISBN - ẩn trên mobile nhỏ */}
          {book.isbn && (
            <span className="hidden sm:inline text-xs text-gray-400 truncate max-w-[100px]" title={`ISBN: ${book.isbn}`}>
              {book.isbn}
            </span>
          )}
        </div>
        
        {/* Actions for My Library - Touch friendly */}
        {showActions && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <Link 
              to={`/books/edit-book/${book.book_id || book.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-center px-3 py-2.5 sm:py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 active:bg-indigo-200 transition-colors min-h-[44px] flex items-center justify-center"
            >
              Sửa
            </Link>
            
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isDeleting}
                className={`flex-1 px-3 py-2.5 sm:py-2 text-sm font-medium rounded-lg transition-colors min-h-[44px] flex items-center justify-center ${
                  isDeleting 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200'
                }`}
              >
                {isDeleting ? '...' : 'Xóa'}
              </button>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default BookCard;