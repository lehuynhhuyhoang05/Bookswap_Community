import React from 'react';

const LibraryStats = ({ books }) => {
  // Đảm bảo books luôn là array
  const bookList = Array.isArray(books) ? books : [];
  
  const totalWantedBooks = bookList.length;
  const highPriorityBooks = bookList.filter(book => book.priority >= 8).length;
  const recentBooks = bookList.filter(book => {
    if (!book.added_at) return false;
    try {
      const addedDate = new Date(book.added_at);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return addedDate > oneWeekAgo;
    } catch (error) {
      return false;
    }
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <div className="text-2xl font-bold text-blue-600">{totalWantedBooks}</div>
        <div className="text-sm text-gray-600">Tổng sách mong muốn</div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <div className="text-2xl font-bold text-red-600">{highPriorityBooks}</div>
        <div className="text-sm text-gray-600">Sách ưu tiên cao</div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{recentBooks}</div>
        <div className="text-sm text-gray-600">Thêm gần đây</div>
      </div>
    </div>
  );
};

export default LibraryStats;