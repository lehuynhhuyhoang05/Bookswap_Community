// BookList.jsx
import React from 'react';
import BookCard from './BookCard';


const BookList = ({ books }) => {
return (
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{books.map((b) => (
<BookCard key={b.id} book={b} />
))}
</div>
);
};
export default BookList;