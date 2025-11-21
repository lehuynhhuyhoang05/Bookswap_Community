import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const BookCard = ({ book, showActions = false, showOwner = false, onUpdate, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Xác định trạng thái hiển thị
  const getConditionText = (condition) => {
    const conditions = {
      'like_new': 'Như mới',
      'good': 'Tốt',
      'fair': 'Khá',
      'poor': 'Kém',
      'LIKE_NEW': 'Như mới',
      'GOOD': 'Tốt',
      'FAIR': 'Khá',
      'POOR': 'Kém'
    };
    return conditions[condition] || condition;
  };

  // Xác định màu sắc cho trạng thái
  const getConditionColor = (condition) => {
    const colors = {
      'like_new': 'bg-green-100 text-green-800',
      'good': 'bg-blue-100 text-blue-800',
      'fair': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-red-100 text-red-800',
      'LIKE_NEW': 'bg-green-100 text-green-800',
      'GOOD': 'bg-blue-100 text-blue-800',
      'FAIR': 'bg-yellow-100 text-yellow-800',
      'POOR': 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  // 🆕 Xử lý ảnh bìa sách
  const getCoverImage = () => {
    if (imageError || !book.cover_image_url) {
      return `https://via.placeholder.com/300x400/6B7280/FFFFFF?text=${encodeURIComponent(
        (book.title || 'Sách').substring(0, 15)
      )}`;
    }
    return book.cover_image_url;
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* 🆕 THÊM ẢNH BÌA SÁCH */}
      <div className="h-48 bg-gray-100 relative">
        <img 
          src={getCoverImage()}
          alt={book.title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        {/* 🆕 Badge điều kiện sách trên ảnh */}
        <div className="absolute top-2 left-2">
          <span className={`inline-block ${getConditionColor(bookCondition)} text-xs px-2 py-1 rounded font-medium`}>
            {getConditionText(bookCondition)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 h-14">
          {book.title}
        </h3>
        <p className="text-gray-600 mb-1 text-sm">
          <span className="font-medium">Tác giả:</span> {book.author || 'Chưa rõ'}
        </p>
        <p className="text-gray-600 mb-3 text-sm">
          <span className="font-medium">Thể loại:</span> {bookCategory || 'Khác'}
        </p>
        
        {/* Hiển thị thông tin chủ sách nếu có */}
        {showOwner && ownerUser && (
          <div className="mb-3 p-2 bg-gray-50 rounded">
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Chủ sách:</span> {ownerUser.full_name || ownerUser.username}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4">
          {/* 🆕 Thêm ISBN nếu có */}
          {book.isbn && (
            <span className="text-xs text-gray-500">
              ISBN: {book.isbn}
            </span>
          )}
          
          <div className="flex space-x-2 ml-auto">
            {/* Nút Chỉnh sửa - chỉ hiển thị trong My Library */}
            {showActions && (
              <Link 
                to={`/books/edit-book/${book.book_id || book.id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Sửa
              </Link>
            )}
            
            {/* Nút Xóa - chỉ hiển thị trong My Library và khi có onDelete function */}
            {showActions && onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${
                  isDeleting 
                    ? 'bg-red-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting ? '...' : 'Xóa'}
              </button>
            )}
            
            {/* Nút Xem chi tiết - LUÔN HIỂN THỊ */}
            <Link 
              to={`/books/detail/${book.book_id || book.id}`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;