// BookSearch.jsx
import React, { useState } from 'react';


const BookSearch = ({ onSearch }) => {
const [keyword, setKeyword] = useState('');


const handleSubmit = (e) => {
e.preventDefault();
onSearch(keyword);
};


return (
<form onSubmit={handleSubmit} className="flex gap-2">
<input
type="text"
className="border p-2 rounded-lg w-full"
placeholder="Search books..."
value={keyword}
onChange={(e) => setKeyword(e.target.value)}
/>
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg">Search</button>
</form>
);
};
export default BookSearch;