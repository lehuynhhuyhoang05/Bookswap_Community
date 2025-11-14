// Base URL for backend API — ensure frontend calls backend, not dev-server fallback
const API_BASE_URL = 'http://localhost:3000';

// Tìm kiếm Google Books qua API /books/search/google
export async function fetchGoogleBooksSearch(query, maxResults = 20) {
  const params = new URLSearchParams({ query, maxResults });
  const response = await fetch(
    `${API_BASE_URL}/books/search/google?${params.toString()}`,
  );
  if (!response.ok) throw new Error('Không thể tìm kiếm Google Books');
  return await response.json();
}
// Tìm kiếm sách cơ bản
export async function searchBooksBasic({ q, category, page = 1, limit = 20 }) {
  const params = new URLSearchParams({ q, category, page, limit });
  const response = await fetch(
    `${API_BASE_URL}/books/search?${params.toString()}`,
  );
  if (!response.ok) throw new Error('Không thể tìm kiếm sách');
  return await response.json();
}

// Tìm kiếm sách nâng cao
export async function searchBooksAdvanced(filters) {
  const params = new URLSearchParams(filters);
  const response = await fetch(
    `${API_BASE_URL}/books/search/advanced?${params.toString()}`,
  );
  if (!response.ok) throw new Error('Không thể tìm kiếm nâng cao');
  return await response.json();
}

// Tìm kiếm sách Google Books qua API
export async function searchGoogleBooks(query, maxResults = 20) {
  const params = new URLSearchParams({ query, maxResults });
  const response = await fetch(
    `${API_BASE_URL}/books/search/google?${params.toString()}`,
  );
  if (!response.ok) throw new Error('Không thể tìm kiếm Google Books');
  return await response.json();
}

// Lấy chi tiết Google Book theo ID
export async function fetchGoogleBookById(googleBookId) {
  const response = await fetch(`${API_BASE_URL}/books/google/${googleBookId}`);
  if (!response.ok) throw new Error('Không thể lấy chi tiết Google Book');
  return await response.json();
}

// Tìm Google Book theo ISBN
export async function fetchGoogleBookByISBN(isbn) {
  const response = await fetch(`${API_BASE_URL}/books/google/isbn/${isbn}`);
  if (!response.ok) throw new Error('Không thể tìm Google Book theo ISBN');
  return await response.json();
}
// Lấy sách theo thể loại
export async function fetchBooksByCategory(category, page = 1, limit = 20) {
  const token = localStorage.getItem('token');
  const url = `${API_BASE_URL}/books/category/${encodeURIComponent(category)}?page=${page}&limit=${limit}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error('Không thể lấy danh sách sách theo thể loại');
  }
  return await response.json();
}
/**
 * Books API Service
 * Handles all book-related API calls
 */

/**
 * Fetch book details by ID
 * GET /books/{id}
 *
 * @param {string} bookId - The book ID
 * @returns {Promise<Object>} Book details with the following structure:
 * {
 *   "book_id": "string",
 *   "title": "string",
 *   "author": "string",
 *   "isbn": "string",
 *   "description": "string",
 *   "category": "string",
 *   "book_condition": "string",
 *   "status": "string",
 *   "views": 0,
 *   "owner": {
 *     "member_id": "string",
 *     "region": "string",
 *     "trust_score": 0,
 *     "user": {
 *       "full_name": "string",
 *       "avatar_url": "string"
 *     }
 *   }
 * }
 */
export const fetchBookDetail = async (bookId) => {
  if (!bookId) {
    throw new Error('Book ID is required');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Sách không tồn tại');
      }
      throw new Error(`Lỗi API: ${response.status}`);
    }

    const data = await response.json();
    console.log('📖 Book API Response:', data);

    return data;
  } catch (error) {
    console.error('❌ Error fetching book details:', error);
    throw error;
  }
};

/**
 * Create a new book
 * POST /books
 *
 * @param {Object} bookData - Book information to create
 * @returns {Promise<Object>} Created book with the following structure:
 * {
 *   "book_id": "uuid",
 *   "google_books_id": "string",
 *   "title": "string",
 *   "author": "string",
 *   "isbn": "string",
 *   "publisher": "string",
 *   "publish_date": "string",
 *   "description": "string",
 *   "category": "string",
 *   "language": "string",
 *   "page_count": number,
 *   "cover_image_url": "string",
 *   "book_condition": "string",
 *   "status": "string"
 * }
 *
 * @example
 * const newBook = await createBook({
 *   title: "Clean Code",
 *   author: "Robert C. Martin",
 *   isbn: "9780132350884",
 *   publisher: "Prentice Hall",
 *   publish_date: "2008-08-01",
 *   description: "A handbook of agile software craftsmanship",
 *   category: "Programming",
 *   language: "en",
 *   page_count: 464,
 *   cover_image_url: "https://example.com/cover.jpg",
 *   book_condition: "GOOD"
 * });
 */
export const createBook = async (bookData) => {
  if (!bookData) {
    throw new Error('Book data is required');
  }

  if (!bookData.title) {
    throw new Error('Book title is required');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found. Please login first.');
  }

  try {
    console.log('📚 Creating new book:', bookData);

    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bookData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Vui lòng đăng nhập để thêm sách');
      }
      if (response.status === 400) {
        throw new Error('Dữ liệu sách không hợp lệ');
      }
      throw new Error(`Lỗi API: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Book created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error creating book:', error);
    throw error;
  }
};

/**
 * Post book by ID (POST /books/{id})
 * This helper is for endpoints that expect a POST to a specific book resource.
 *
 * @param {string} bookId - The book ID
 * @param {Object} postData - Data to send in the POST body
 * @returns {Promise<Object>} Response body
 */
export const postBook = async (bookId, postData) => {
  if (!bookId) {
    throw new Error('Book ID is required');
  }

  if (!postData) {
    throw new Error('Post data is required');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found. Please login first.');
  }

  try {
    console.log(`📚 POSTing to book ${bookId}:`, postData);

    const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Vui lòng đăng nhập để thực hiện thao tác này');
      }
      if (response.status === 400) {
        throw new Error('Dữ liệu không hợp lệ');
      }
      if (response.status === 404) {
        throw new Error('Sách không tồn tại');
      }
      throw new Error(`Lỗi API: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ POST book response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error posting book:', error);
    throw error;
  }
};

/**
 * Update book details
 * PATCH /books/{id}
 *
 * @param {string} bookId - The book ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated book details
 */
export const updateBook = async (bookId, updateData) => {
  if (!bookId) {
    throw new Error('Book ID is required');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      console.error('❌ Update book failed. Status:', response.status);
      if (response.status === 403) {
        throw new Error('Bạn chỉ có thể cập nhật sách của chính mình');
      }
      if (response.status === 404) {
        throw new Error('Sách không tồn tại');
      }
      // Try to parse error message from response
      let errorMsg = `Lỗi API: ${response.status}`;
      try {
        const errData = await response.json();
        if (errData && errData.message) errorMsg = errData.message;
      } catch {}
      throw new Error(errorMsg);
    }
    // Only parse JSON if status is 200
    const data = await response.json();
    console.log('✅ Book updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating book:', error);
    throw error;
  }
};

/**
 * Delete book (soft delete)
 * DELETE /books/{id}
 *
 * @param {string} bookId - The book ID
 * @returns {Promise<Object>} Deletion response
 */
export const deleteBook = async (bookId) => {
  if (!bookId) {
    throw new Error('Book ID is required');
  }

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found. Please login again.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Bạn chỉ có thể xóa sách của chính mình');
      }
      if (response.status === 404) {
        throw new Error('Sách không tồn tại');
      }
      throw new Error(`Lỗi API: ${response.status}`);
    }

    console.log('✅ Book deleted successfully');
    // Some DELETE endpoints return empty body, avoid parsing if so
    const text = await response.text();
    if (text) {
      try {
        return JSON.parse(text);
      } catch (e) {
        return text;
      }
    }
    return {};
  } catch (error) {
    console.error('❌ Error deleting book:', error);
    throw error;
  }
};

/**
 * Fetch book list with optional filters
 * GET /books
 *
 * @param {Object} params - Query parameters (optional)
 *   - page: number (default: 1)
 *   - limit: number (default: 20)
 *   - search: string (optional)
 *   - category: string (optional)
 *   - region: string (optional)
 *
 * @returns {Promise<Object>} API response with structure:
 * {
 *   "data": [
 *     {
 *       "book_id": "uuid",
 *       "title": "string",
 *       "author": "string",
 *       "isbn": "string",
 *       "description": "string",
 *       "category": "string",
 *       "book_condition": "string",
 *       "status": "string",
 *       "views": number,
 *       "owner": {
 *         "member_id": "string",
 *         "region": "string",
 *         "trust_score": number,
 *         "user": {
 *           "full_name": "string",
 *           "avatar_url": "string"
 *         }
 *       }
 *     }
 *   ],
 *   "meta": {
 *     "total": number,
 *     "page": number,
 *     "limit": number,
 *     "totalPages": number
 *   }
 * }
 */
export const fetchBooks = async (params = {}) => {
  try {
    // Build query string
    const queryParams = new URLSearchParams();

    // Set defaults for pagination
    if (!params.page) queryParams.append('page', '1');
    if (!params.limit) queryParams.append('limit', '20');

    // Add other parameters
    Object.keys(params).forEach((key) => {
      if (
        params[key] !== undefined &&
        params[key] !== null &&
        params[key] !== ''
      ) {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_BASE_URL}/books?${queryString}`
      : `${API_BASE_URL}/books`;

    console.log(`📚 Fetching books from: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.status}`);
    }

    const data = await response.json();
    console.log('📚 Books API Response:', data);

    return data;
  } catch (error) {
    console.error('❌ Error fetching books:', error);
    throw error;
  }
};

/**
 * Fetch current user's library
 * GET /books/my-library
 * Returns an array of books owned by the current user.
 */
export const fetchMyLibrary = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication token not found. Please login first.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/books/my-library`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Vui lòng đăng nhập');
      throw new Error(`Lỗi API: ${response.status}`);
    }

    const data = await response.json();
    console.log('📚 My library response:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching my library:', error);
    throw error;
  }
};

/**
 * Search books
 * GET /books/search
 *
 * @param {string} query - Search query
 * @returns {Promise<Array>} Search results
 */
export const searchBooks = async (query) => {
  if (!query) {
    throw new Error('Search query is required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/books/search?q=${encodeURIComponent(query)}`,
    );

    if (!response.ok) {
      throw new Error(`Lỗi API: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 Search results:', data);
    return data;
  } catch (error) {
    console.error('❌ Error searching books:', error);
    throw error;
  }
};

/**
 * Helper function to extract books data from API response
 * Handles the response structure: { data: [...], meta: {...} }
 *
 * @param {Object} apiResponse - The API response object
 * @returns {Object} Extracted data with books and pagination info
 * @example
 * const response = await fetchBooks({ page: 1, limit: 20 });
 * const { books, pagination } = extractBooksData(response);
 */
export const extractBooksData = (apiResponse) => {
  if (!apiResponse) {
    return {
      books: [],
      pagination: { total: 0, page: 0, limit: 0, totalPages: 0 },
    };
  }

  const books = apiResponse.data || [];
  const meta = apiResponse.meta || {};

  return {
    books,
    pagination: {
      total: meta.total || 0,
      page: meta.page || 1,
      limit: meta.limit || 20,
      totalPages: meta.totalPages || 0,
    },
  };
};

/**
 * Helper function to get the correct book ID from a book object
 * Books can have different ID field names depending on the endpoint
 *
 * @param {Object} book - Book object
 * @returns {string|null} The book ID or null if not found
 * @example
 * const bookId = getBookId(book);
 * navigate(`/books/${bookId}`);
 */
export const getBookId = (book) => {
  if (!book) return null;
  return book.book_id || book.id || book.people_books_id || null;
};
