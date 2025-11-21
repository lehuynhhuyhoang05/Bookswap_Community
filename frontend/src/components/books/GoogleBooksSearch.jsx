// GoogleBooksSearch.jsx
import React, { useState } from 'react';


const GoogleBooksSearch = ({ onSelect }) => {
const [keyword, setKeyword] = useState('');
const [results, setResults] = useState([]);


const searchGoogleBooks = async () => {
const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${keyword}`);
const data = await res.json();
setResults(data.items || []);
};


return (
<div className="space-y-4">
<div className="flex gap-2">
<input className="border p-2 rounded flex-1" value={keyword} placeholder="Search Google Books"
onChange={(e) => setKeyword(e.target.value)} />
<button onClick={searchGoogleBooks} className="bg-blue-500 text-white px-4 rounded">Search</button>
</div>


<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{results.map((item) => (
<div key={item.id} className="p-3 border rounded cursor-pointer" onClick={() => onSelect(item)}>
<h4 className="font-semibold">{item.volumeInfo.title}</h4>
<p className="text-sm text-gray-700">{item.volumeInfo.authors?.join(', ')}</p>
</div>
))}
</div>
</div>
);
};
export default GoogleBooksSearch;