# Books API Service

Centralized API service for all book-related operations in the Bookswap application.

## Installation

The service is located at `src/services/booksApi.js`

## Usage

```javascript
import {
  fetchBookDetail,
  createBook,
  updateBook,
  deleteBook,
  fetchBooks,
  searchBooks,
  extractBooksData,
  getBookId,
} from '../../services/booksApi';
```

## API Methods

### 1. `fetchBookDetail(bookId)`

Fetch detailed information about a specific book.

**Endpoint:** `GET /books/{id}`

**Parameters:**

- `bookId` (string, required) - The unique book ID

**Returns:** Promise resolving to book object

**Response Structure:**

```javascript
{
  "book_id": "uuid",
  "title": "string",
  "author": "string",
  "isbn": "string",
  "description": "string",
  "category": "string",
  "book_condition": "string", // NEW, EXCELLENT, GOOD, FAIR, POOR
  "status": "string", // available, unavailable, exchanged
  "views": 0,
  "owner": {
    "member_id": "uuid",
    "region": "string",
    "trust_score": 0,
    "user": {
      "full_name": "string",
      "avatar_url": "string"
    }
  }
}
```

**Example:**

```javascript
try {
  const book = await fetchBookDetail('book-uuid-123');
  console.log(book.title);
  console.log(book.owner.user.full_name);
} catch (error) {
  console.error('Failed to fetch book:', error.message);
}
```

---

### 2. `createBook(bookData)`

Create a new book listing.

**Endpoint:** `POST /books`

**Parameters:**

- `bookData` (object, required) - Book information

**Required Fields:**

- `title` (string) - Book title
- `author` (string) - Book author
- `book_condition` (string) - Book condition (NEW, EXCELLENT, GOOD, FAIR, POOR)

**Optional Fields:**

- `google_books_id` (string) - Google Books ID
- `isbn` (string) - ISBN number
- `publisher` (string) - Publisher name
- `publish_date` (string) - Publication date (YYYY-MM-DD)
- `description` (string) - Book description
- `category` (string) - Book category
- `language` (string) - Language code (vi, en, etc.)
- `page_count` (number) - Number of pages
- `cover_image_url` (string) - URL to book cover image

**Required:** Authentication token in localStorage

**Response Structure:**

```javascript
{
  "book_id": "uuid",
  "google_books_id": "string",
  "title": "string",
  "author": "string",
  "isbn": "string",
  "publisher": "string",
  "publish_date": "string",
  "description": "string",
  "category": "string",
  "language": "string",
  "page_count": number,
  "cover_image_url": "string",
  "book_condition": "string",
  "status": "string"
}
```

**Example:**

```javascript
try {
  const newBook = await createBook({
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    publisher: 'Prentice Hall',
    publish_date: '2008-08-01',
    description: 'A handbook of agile software craftsmanship',
    category: 'Programming',
    language: 'en',
    page_count: 464,
    cover_image_url: 'https://example.com/cover.jpg',
    book_condition: 'GOOD',
  });

  console.log('✅ Book created:', newBook.book_id);
  // Navigate to book detail page
  navigate(`/books/${newBook.book_id}`);
} catch (error) {
  console.error('Failed to create book:', error.message);
  // Handle error and show to user
  alert(`Error: ${error.message}`);
}
```

---

### 3. `updateBook(bookId, updateData)`

Update book information (only for book owner).

**Endpoint:** `PATCH /books/{id}`

**Parameters:**

- `bookId` (string, required) - The unique book ID
- `updateData` (object, required) - Fields to update

**Required:** Authentication token in localStorage

**Example:**

```javascript
try {
  const result = await updateBook('book-uuid-123', {
    status: 'unavailable',
    book_condition: 'GOOD',
  });
  console.log('Book updated successfully');
} catch (error) {
  console.error('Update failed:', error.message);
}
```

---

### 4. `deleteBook(bookId)`

Delete a book (soft delete, only for book owner).

**Endpoint:** `DELETE /books/{id}`

**Parameters:**

- `bookId` (string, required) - The unique book ID

**Required:** Authentication token in localStorage

**Example:**

```javascript
try {
  await deleteBook('book-uuid-123');
  console.log('Book deleted successfully');
  navigate('/my-library');
} catch (error) {
  console.error('Delete failed:', error.message);
}
```

---

### 5. `fetchBooks(params)`

Fetch a list of books with optional filters.

**Endpoint:** `GET /books`

**Parameters:**

- `params` (object, optional) - Query parameters like category, region, limit, etc.

**Example:**

```javascript
try {
  const books = await fetchBooks({
    category: 'Programming',
    limit: 20,
    page: 1,
  });
  console.log('Found', books.length, 'books');
} catch (error) {
  console.error('Failed to fetch books:', error.message);
}
```

---

### 6. `searchBooks(query)`

Search for books by title, author, or ISBN.

**Endpoint:** `GET /books/search`

**Parameters:**

- `query` (string, required) - Search query

**Example:**

```javascript
try {
  const results = await searchBooks('Clean Code');
  console.log('Search results:', results);
} catch (error) {
  console.error('Search failed:', error.message);
}
```

---

## Error Handling

All API methods throw errors that include a message. Common error scenarios:

```javascript
try {
  const book = await fetchBookDetail(bookId);
} catch (error) {
  if (error.message.includes('không tồn tại')) {
    // Book not found (404)
  } else if (error.message.includes('không có quyền')) {
    // Permission denied (403)
  } else if (error.message.includes('token')) {
    // Authentication error
  } else {
    // Other API error
  }
}
```

---

## Authentication

Methods that modify data (`updateBook`, `deleteBook`) require an authentication token in localStorage:

```javascript
const token = localStorage.getItem('token');
// Token is automatically included in Authorization header
```

---

## Configuration

The API base URL is configured in `booksApi.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000';
```

To change the API endpoint, modify this constant.

---

## Usage in React Components

See `EXAMPLES.js` for detailed React component examples.

### Quick Example:

```javascript
import { useEffect, useState } from 'react';
import { fetchBookDetail } from '../services/booksApi';

function BookDetailPage({ bookId }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBook = async () => {
      try {
        const data = await fetchBookDetail(bookId);
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [bookId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>{book.title}</h1>
      <p>by {book.author}</p>
      <p>
        Owner: {book.owner.user.full_name} ({book.owner.region})
      </p>
    </div>
  );
}

export default BookDetailPage;
```

---

## Helper Functions

### 7. `extractBooksData(apiResponse)`

Helper function to extract and format books data from the API response.

**Purpose:** Handles the paginated response structure: `{ data: [...], meta: {...} }`

**Parameters:**

- `apiResponse` (object) - The full API response from `fetchBooks()`

**Returns:** Object with extracted data

```javascript
{
  books: [...], // Array of book objects
  pagination: {
    total: number,      // Total books available
    page: number,       // Current page
    limit: number,      // Books per page
    totalPages: number  // Total number of pages
  }
}
```

**Example:**

```javascript
const response = await fetchBooks({ page: 1, limit: 20 });
const { books, pagination } = extractBooksData(response);

console.log(`Found ${pagination.total} books`);
console.log(`Page ${pagination.page} of ${pagination.totalPages}`);
books.forEach((book) => console.log(book.title));
```

---

### 8. `getBookId(book)`

Helper function to safely get the book ID from a book object.

**Purpose:** Handles different ID field names depending on the endpoint

**Parameters:**

- `book` (object) - The book object

**Returns:** `string|null` - The book ID or null if not found

**Supported ID fields:**

- `book_id` (preferred - from list API)
- `id` (alternate)
- `people_books_id` (alternate)

**Example:**

```javascript
const book = await fetchBookDetail(bookId);
const bookId = getBookId(book);

if (bookId) {
  navigate(`/books/${bookId}`);
} else {
  console.error('No valid book ID found');
}
```

---

## BookList Component Integration

The `BookList` component now uses the API service to fetch real data:

```javascript
import {
  fetchBooks,
  extractBooksData,
  getBookId,
} from '../../services/booksApi';

// In useEffect:
const response = await fetchBooks({ page: 1, limit: 20 });
const { books: booksData } = extractBooksData(response);

// Map books and ensure correct ID field
const mappedBooks = booksData.map((book) => ({
  ...book,
  id: getBookId(book),
  cover_image_url: book.cover_image_url || 'https://...',
}));

setBooks(mappedBooks);
```

---

## Complete Usage Examples

### Fetch and Display Books List

```javascript
import { useEffect, useState } from 'react';
import { fetchBooks, extractBooksData, getBookId } from '../services/booksApi';

function BookListPage() {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await fetchBooks({ page: 1, limit: 20 });
        const { books: booksData, pagination: pagData } =
          extractBooksData(response);

        setBooks(booksData);
        setPagination(pagData);
      } catch (error) {
        console.error('Failed to load books:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Books ({pagination.total} total)</h1>
      <div className="book-grid">
        {books.map((book) => (
          <div key={getBookId(book)}>
            <h3>{book.title}</h3>
            <p>{book.author}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookListPage;
```

### Navigate to Book Detail

```javascript
const handleViewBook = (book) => {
  const bookId = getBookId(book);
  if (bookId) {
    navigate(`/books/${bookId}`);
  }
};
```

---

## Error Handling Best Practices

```javascript
try {
  const books = await fetchBooks({ page: 1 });
  const { books: booksData } = extractBooksData(books);
} catch (error) {
  if (error.message.includes('404')) {
    console.log('Not found');
  } else if (error.message.includes('API')) {
    console.log('API error');
  } else {
    console.log('Network error');
  }
}
```

---

## API Configuration

To change the API base URL, edit `booksApi.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000'; // Change this
```

---

## Notes

- All API calls include proper error handling with meaningful error messages
- Authentication token is automatically included for protected endpoints
- Mock data fallback is available in BookList for offline testing
- Helper functions ensure compatibility with different API response structures
