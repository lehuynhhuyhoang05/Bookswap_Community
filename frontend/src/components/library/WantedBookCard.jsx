// src/components/library/WantedBookCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../hooks/useLibrary';

const WantedBookCard = ({ book, onDelete }) => {
  const { formatWantedBookPriority } = useLibrary();

  if (!book) return null;

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này khỏi danh sách mong muốn?')) {
      onDelete(book.wanted_id || book.id);
    }
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{book.title || 'Không có tiêu đề'}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              book.priority >= 8 ? 'bg-red-100 text-red-800' :
              book.priority >= 5 ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {formatWantedBookPriority(book.priority || 5)}
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600">
            {book.author && <p>Tác giả: {book.author}</p>}
            {book.isbn && <p>ISBN: {book.isbn}</p>}
            {book.category && <p>Thể loại: {book.category}</p>}
            {book.notes && <p className="text-gray-500 italic">"{book.notes}"</p>}
          </div>
          
          {book.added_at && (
            <p className="text-xs text-gray-400 mt-2">
              Thêm vào: {new Date(book.added_at).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
        
        <div className="flex space-x-2 ml-4">
          <Link
            to={`/library/edit-wanted/${book.wanted_id || book.id}`}
            className="inline-flex items-center px-3 py-1 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors text-sm"
          >
            Sửa
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-3 py-1 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors text-sm"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default WantedBookCard;