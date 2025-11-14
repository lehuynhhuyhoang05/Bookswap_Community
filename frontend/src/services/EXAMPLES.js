/**
 * Books API Service Usage Examples
 *
 * This file demonstrates how to use the booksApi service in your React components
 */

import {
  deleteBook,
  fetchBookDetail,
  fetchBooks,
  searchBooks,
  updateBook,
} from './booksApi';

/**
 * EXAMPLE 1: Fetch single book detail
 * Usage in a React component:
 */
/*
import { useEffect, useState } from 'react';
import { fetchBookDetail } from '../services/booksApi';

function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBook = async () => {
      try {
        setLoading(true);
        const data = await fetchBookDetail(id);
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadBook();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{book.title}</h1>
      <p>Author: {book.author}</p>
      <p>Owner: {book.owner.user.full_name}</p>
      <p>Region: {book.owner.region}</p>
      <p>Trust Score: {book.owner.trust_score}</p>
    </div>
  );
}
*/

/**
 * EXAMPLE 2: Update book details
 * Usage in a React component:
 */
/*
async function handleUpdateBook(bookId) {
  try {
    const updatedData = {
      status: 'unavailable',
      book_condition: 'GOOD'
    };
    const result = await updateBook(bookId, updatedData);
    console.log('Book updated:', result);
  } catch (err) {
    console.error('Failed to update:', err.message);
  }
}
*/

/**
 * EXAMPLE 3: Delete book
 * Usage in a React component:
 */
/*
async function handleDeleteBook(bookId) {
  try {
    const result = await deleteBook(bookId);
    console.log('Book deleted:', result);
    // Redirect to library
    navigate('/my-library');
  } catch (err) {
    console.error('Failed to delete:', err.message);
  }
}
*/

/**
 * EXAMPLE 4: Fetch books list
 * Usage in a React component:
 */
/*
async function loadBooks() {
  try {
    const books = await fetchBooks({ 
      category: 'Programming',
      limit: 20
    });
    setBooks(books);
  } catch (err) {
    console.error('Failed to fetch books:', err.message);
  }
}
*/

/**
 * EXAMPLE 5: Search books
 * Usage in a React component:
 */
/*
async function handleSearch(query) {
  try {
    const results = await searchBooks(query);
    setSearchResults(results);
  } catch (err) {
    console.error('Failed to search:', err.message);
  }
}
*/

export default {
  fetchBookDetail,
  updateBook,
  deleteBook,
  fetchBooks,
  searchBooks,
};
