import React from 'react';
import { useBooks } from '../../hooks/useBooks';

const BookConditionSelect = ({ value, onChange }) => {
  const { getBookConditions, formatBookCondition } = useBooks();
  const conditions = getBookConditions();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Tất cả tình trạng</option>
      {conditions.map(condition => (
        <option key={condition.value} value={condition.value}>
          {condition.label}
        </option>
      ))}
    </select>
  );
};

export default BookConditionSelect;