import React from 'react';
import { useBooks } from '../../hooks/useBooks';

const BookCategoriesSelect = ({ value, onChange }) => {
  const { getCategories } = useBooks();
  const categories = getCategories();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Tất cả danh mục</option>
      {categories.map(category => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
};

export default BookCategoriesSelect;