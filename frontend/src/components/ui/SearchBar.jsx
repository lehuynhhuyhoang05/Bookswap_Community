// components/ui/SearchBar.jsx
import React, { useState, useEffect } from 'react';

const SearchBar = ({ placeholder, onSearch, delay = 300 }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay, onSearch]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

export default SearchBar;