// src/services/api/books.js (đã loại bỏ phần library)
import api from './config';

export const booksService = {
  /**
   * 📌 0. POST /books/upload-photos — Upload book photos
   * @param {File[]} photos - Array of photo files to upload
   * @returns {Promise<{urls: string[], message: string}>}
   */
  async uploadBookPhotos(photos) {
    try {
      const formData = new FormData();
      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      const response = await api.post('/books/upload-photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (error.response?.status === 400) {
        throw { message: errorData?.message || 'Invalid file type or too many files' };
      }
      throw errorData || { message: 'Failed to upload photos' };
    }
  },

  /**
   * 📌 1. POST /books — Add a New Book
   */
  async addBook(bookData) {
    try {
      const response = await api.post('/books', bookData);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (error.response?.status === 404) {
        throw { message: 'Member profile not found' };
      } else if (error.response?.status === 408) {
        throw { message: 'Request timeout - Google Books or DB processing took too long' };
      }
      throw errorData || { message: 'Failed to add book' };
    }
  },

  /**
   * 📌 2. GET /books — Public Book Listing
   */
  async getBooks(params = {}) {
    try {
      const response = await api.get('/books', { 
        params: {
          page: 1,
          limit: 20,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch books' };
    }
  },

  /**
   * 📌 3. GET /books/{id} — Get Book Details
   */
  async getBookById(bookId) {
    try {
      const response = await api.get(`/books/${bookId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw { message: 'Book not found' };
      }
      throw error.response?.data || { message: 'Failed to fetch book details' };
    }
  },

  /**
   * 📌 4. PATCH /books/{id} — Update a Book
   */
  async updateBook(bookId, updateData) {
    try {
      const response = await api.patch(`/books/${bookId}`, updateData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw { message: 'You can only update your own books' };
      } else if (error.response?.status === 404) {
        throw { message: 'Book not found' };
      }
      throw error.response?.data || { message: 'Failed to update book' };
    }
  },

  /**
   * 📌 5. DELETE /books/{id} — Soft Delete Book
   */
  async deleteBook(bookId) {
    try {
      const response = await api.delete(`/books/${bookId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 403) {
        throw { message: 'Not your book' };
      } else if (error.response?.status === 404) {
        throw { message: 'Book not found' };
      }
      throw error.response?.data || { message: 'Failed to delete book' };
    }
  },

  /**
   * 📌 6. GET /books/category/{category}
   */
  async getBooksByCategory(category, params = {}) {
    try {
      const response = await api.get(`/books/category/${category}`, { 
        params: {
          page: 1,
          limit: 20,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch books by category' };
    }
  },

  /**
   * 📌 7. GET /books/google/{googleBookId}
   */
  async getGoogleBookById(googleBookId) {
    try {
      const response = await api.get(`/books/google/${googleBookId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch Google Books data' };
    }
  },

  /**
   * 📌 8. GET /books/google/isbn/{isbn}
   */
  async getGoogleBookByISBN(isbn) {
    try {
      const response = await api.get(`/books/google/isbn/${isbn}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch book by ISBN' };
    }
  },

  /**
   * 📌 9. GET /books/my-library - FIXED hoàn toàn
   */
  async getMyLibrary() {
    try {
      const response = await api.get('/books/my-library');
      console.log('📚 MyLibrary RAW Response:', response.data);
      
      const data = response.data;
      
      // ✅ Xử lý nhiều định dạng response
      if (data && typeof data === 'object') {
        // Trường hợp 1: { books: [] }
        if (Array.isArray(data.books)) {
          return data.books;
        }
        // Trường hợp 2: { data: { books: [] } }
        else if (data.data && Array.isArray(data.data.books)) {
          return data.data.books;
        }
        // Trường hợp 3: Mảng trực tiếp
        else if (Array.isArray(data)) {
          return data;
        }
      }
      
      console.warn('⚠️ Unexpected MyLibrary response format:', data);
      return [];
    } catch (error) {
      console.error('❌ MyLibrary API Error:', error);
      const errorData = error.response?.data;
      
      if (error.response?.status === 401) {
        throw { message: 'Vui lòng đăng nhập để xem thư viện của bạn' };
      } else if (error.response?.status === 404) {
        throw { message: 'Không tìm thấy thư viện' };
      }
      
      throw errorData || { message: 'Failed to fetch my library' };
    }
  },

  /**
   * 📌 10. GET /books/region/{region}
   */
  async getBooksByRegion(region, params = {}) {
    try {
      const response = await api.get(`/books/region/${region}`, { 
        params: {
          page: 1,
          limit: 20,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch books by region' };
    }
  },

  /**
   * 📌 11. GET /books/regions/available
   */
  async getAvailableRegions() {
    try {
      const response = await api.get('/books/regions/available');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch available regions' };
    }
  },

  /**
   * 📌 12. GET /books/search - Basic search
   */
  async searchBooks(query, params = {}) {
    try {
      const response = await api.get('/books/search', {
        params: { 
          q: query,
          page: 1,
          limit: 20,
          ...params 
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search books' };
    }
  },

  /**
   * 📌 13. GET /books/search/advanced - Advanced search
   */
  async advancedSearch(filters = {}) {
    try {
      const response = await api.get('/books/search/advanced', {
        params: {
          page: 1,
          limit: 20,
          sort_by: 'created_at',
          order: 'DESC',
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to perform advanced search' };
    }
  },

  /**
   * 📌 14. GET /books/search/google - Google Books search
   */
  async searchGoogleBooks(params = {}) {
    try {
      const response = await api.get('/books/search/google', { 
        params: {
          limit: 10,
          ...params 
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search Google Books' };
    }
  },

  /**
   * 📌 15. POST /books/test/auth - Test auth endpoint
   */
  async testAuth() {
    try {
      const response = await api.post('/books/test/auth');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Auth test failed' };
    }
  },

  /**
   * 📌 16. POST /books/test/no-auth - Test no-auth endpoint
   */
  async testNoAuth() {
    try {
      const response = await api.post('/books/test/no-auth');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'No-auth test failed' };
    }
  },

  /**
   * 📌 17. GET /books/wanted/search - Search wanted books
   */
  async searchWantedBooks(query, params = {}) {
    try {
      const response = await api.get('/books/wanted/search', {
        params: { 
          q: query,
          page: 1,
          limit: 20,
          ...params 
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search wanted books' };
    }
  },

  // ========== UTILITY METHODS ==========

  getCategories() {
    return [
      'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 
      'Biography', 'Business', 'Self-Help', 'Cookbooks', 'Travel',
      'Art', 'Music', 'Health', 'Sports', 'Religion', 'Philosophy',
      'Programming', 'Design', 'Education', 'Children', 'Fantasy',
      'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'Horror'
    ];
  },

  getBookConditions() {
    return [
      { value: 'LIKE_NEW', label: 'Như mới' },
      { value: 'VERY_GOOD', label: 'Rất tốt' },
      { value: 'GOOD', label: 'Tốt' },
      { value: 'FAIR', label: 'Khá' },
      { value: 'POOR', label: 'Kém' }
    ];
  },

  formatBookCondition(condition) {
    const conditions = {
      'LIKE_NEW': 'Như mới',
      'VERY_GOOD': 'Rất tốt', 
      'GOOD': 'Tốt',
      'FAIR': 'Khá',
      'POOR': 'Kém'
    };
    return conditions[condition] || condition;
  },

  getSortOptions() {
    return [
      { value: 'created_at', label: 'Ngày thêm' },
      { value: 'title', label: 'Tên sách' },
      { value: 'author', label: 'Tác giả' },
      { value: 'views', label: 'Lượt xem' }
    ];
  },

  getOrderOptions() {
    return [
      { value: 'DESC', label: 'Giảm dần' },
      { value: 'ASC', label: 'Tăng dần' }
    ];
  },

  validateBookData(bookData) {
    const errors = [];
    
    if (!bookData.title?.trim()) {
      errors.push('Tên sách là bắt buộc');
    }
    
    if (!bookData.author?.trim()) {
      errors.push('Tác giả là bắt buộc');
    }
    
    if (!bookData.category?.trim()) {
      errors.push('Danh mục là bắt buộc');
    }
    
    if (!bookData.book_condition) {
      errors.push('Tình trạng sách là bắt buộc');
    }
    
    return errors;
  },

  formatBookData(bookData) {
    return {
      ...bookData,
      page_count: bookData.page_count ? parseInt(bookData.page_count) : undefined,
    };
  }
};

export default booksService;