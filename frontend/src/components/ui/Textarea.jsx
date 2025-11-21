import React from 'react';

const Textarea = ({ 
  value, 
  onChange, 
  placeholder = '', 
  rows = 3,
  className = '',
  disabled = false,
  ...props 
}) => {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
      } ${className}`}
      {...props}
    />
  );
};

export default Textarea;
