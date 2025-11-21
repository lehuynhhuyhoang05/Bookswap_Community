// src/components/library/WantedBookList.jsx
import React from 'react';
import WantedBookCard from './WantedBookCard';

const WantedBookList = ({ books, onBookDeleted }) => {
  if (!books || books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chưa có sách nào trong danh sách mong muốn.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {books.map((book) => (
        <WantedBookCard 
          key={book.wanted_id || book.id} 
          book={book} 
          onDelete={onBookDeleted}
        />
      ))}
    </div>
  );
};

export default WantedBookList;