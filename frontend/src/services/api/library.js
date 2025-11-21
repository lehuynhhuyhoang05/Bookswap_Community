// src/services/api/library.js
import api from './config';

export const libraryService = {
  // ========== PERSONAL LIBRARY API ==========

  /**
   * 📌 1. GET /api/v1/library/stats - Get Personal Library Stats
   */
  async getLibraryStats() {
    try {
      const response = await api.get('/api/v1/library/stats');
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (error.response?.status === 401) {
        throw { message: 'Vui lòng đăng nhập để xem thống kê thư viện' };
      }
      throw errorData || { message: 'Failed to fetch library stats' };
    }
  },

  /**
   * 📌 2. GET /api/v1/library/wanted - Get List of Wanted Books
   */
  async getWantedBooks(params = {}) {
    try {
      const response = await api.get('/api/v1/library/wanted', {
        params: {
          page: 1,
          limit: 20,
          sort_by: 'priority',
          order: 'DESC',
          ...params
        }
      });
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (error.response?.status === 401) {
        throw { message: 'Vui lòng đăng nhập để xem sách mong muốn' };
      }
      throw errorData || { message: 'Failed to fetch wanted books' };
    }
  },

  /**
   * 📌 3. POST /api/v1/library/wanted - Add Book to Wanted List
   */
  async addWantedBook(bookData) {
    try {
      console.log('📤 [LIBRARY SERVICE] Sending wanted book data:', bookData);
      
      // Clean data trước khi gửi
      const cleanedData = {
        title: bookData.title?.trim() || null,
        author: bookData.author?.trim() || null,
        isbn: bookData.isbn?.replace(/[-\s]/g, '') || null,
        category: bookData.category || 'General',
        priority: parseInt(bookData.priority) || 5,
        notes: bookData.notes?.trim() || ''
      };

      // Validation: ít nhất có title hoặc ISBN
      if (!cleanedData.title && !cleanedData.isbn) {
        throw { message: 'Vui lòng cung cấp ít nhất tên sách hoặc ISBN' };
      }

      console.log('📤 [LIBRARY SERVICE] Cleaned data:', cleanedData);
      
      const response = await api.post('/api/v1/library/wanted', cleanedData);
      console.log('✅ [LIBRARY SERVICE] Add wanted book success:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [LIBRARY SERVICE] Add wanted book error:', error);
      
      const errorData = error.response?.data;
      if (error.response?.status === 400) {
        throw { message: errorData?.message || 'Dữ liệu không hợp lệ' };
      } else if (error.response?.status === 401) {
        throw { message: 'Vui lòng đăng nhập để thêm sách mong muốn' };
      } else if (error.response?.status === 409) {
        throw { message: 'Sách đã có trong danh sách mong muốn' };
      }
      throw errorData || { message: 'Failed to add wanted book' };
    }
  },

  /**
   * 📌 4. GET /api/v1/library/wanted/{id} - Get Wanted Book Details
   */
  async getWantedBookById(wantedId) {
    try {
      const response = await api.get(`/api/v1/library/wanted/${wantedId}`);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (error.response?.status === 401) {
        throw { message: 'Vui lòng đăng nhập để xem chi tiết sách' };
      } else if (error.response?.status === 404) {
        throw { message: 'Không tìm thấy sách mong muốn' };
      }
      throw errorData || { message: 'Failed to fetch wanted book details' };
    }
  },

  /**
   * 📌 5. PATCH /api/v1/library/wanted/{id} - Update Wanted Book
   */
  async updateWantedBook(wantedId, updateData) {
    try {
      const response = await api.patch(`/api/v1/library/wanted/${wantedId}`, updateData);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (error.response?.status === 401) {
        throw { message: 'Vui lòng đăng nhập để cập nhật sách' };
      } else if (error.response?.status === 404) {
        throw { message: 'Không tìm thấy sách mong muốn' };
      } else if (error.response?.status === 409) {
        throw { message: 'ISBN trùng với sách khác trong danh sách' };
      }
      throw errorData || { message: 'Failed to update wanted book' };
    }
  },

  /**
   * 📌 6. DELETE /api/v1/library/wanted/{id} - Remove Wanted Book
   */
  async deleteWantedBook(wantedId) {
    try {
      const response = await api.delete(`/api/v1/library/wanted/${wantedId}`);
      return response.data;
    } catch (error) {
      const errorData = error.response?.data;
      if (error.response?.status === 401) {
        throw { message: 'Vui lòng đăng nhập để xóa sách' };
      } else if (error.response?.status === 404) {
        throw { message: 'Không tìm thấy sách mong muốn' };
      }
      throw errorData || { message: 'Failed to delete wanted book' };
    }
  },

  // ========== UTILITY METHODS ==========

  /**
   * 🆕 Get wanted book priorities with labels
   */
  getWantedBookPriorities() {
    return [
      { value: 1, label: 'Rất thấp' },
      { value: 2, label: 'Thấp' },
      { value: 3, label: 'Trung bình thấp' },
      { value: 4, label: 'Trung bình' },
      { value: 5, label: 'Trung bình cao' },
      { value: 6, label: 'Cao' },
      { value: 7, label: 'Rất cao' },
      { value: 8, label: 'Ưu tiên' },
      { value: 9, label: 'Rất ưu tiên' },
      { value: 10, label: 'Cực kỳ ưu tiên' }
    ];
  },

  /**
   * 🆕 Format priority for display
   */
  formatWantedBookPriority(priority) {
    const priorityMap = {
      1: 'Rất thấp',
      2: 'Thấp', 
      3: 'Trung bình thấp',
      4: 'Trung bình',
      5: 'Trung bình cao',
      6: 'Cao',
      7: 'Rất cao',
      8: 'Ưu tiên',
      9: 'Rất ưu tiên',
      10: 'Cực kỳ ưu tiên'
    };
    return priorityMap[priority] || `Ưu tiên ${priority}`;
  },

  /**
   * 🆕 Sort options for wanted books
   */
  getWantedBookSortOptions() {
    return [
      { value: 'priority', label: 'Độ ưu tiên' },
      { value: 'added_at', label: 'Ngày thêm' },
      { value: 'title', label: 'Tên sách' },
      { value: 'author', label: 'Tác giả' }
    ];
  },

  /**
   * 🆕 Validate wanted book data
   */
  validateWantedBookData(bookData) {
    const errors = [];
    
    if (!bookData.title?.trim() && !bookData.isbn?.trim()) {
      errors.push('Vui lòng cung cấp ít nhất tên sách hoặc ISBN');
    }
    
    if (bookData.priority && (bookData.priority < 1 || bookData.priority > 10)) {
      errors.push('Độ ưu tiên phải từ 1 đến 10');
    }
    
    return errors;
  },

  /**
   * 🆕 Format and clean wanted book data before sending
   */
  formatWantedBookData(bookData) {
    return {
      title: bookData.title?.trim() || null,
      author: bookData.author?.trim() || null,
      isbn: bookData.isbn?.replace(/[-\s]/g, '') || null,
      category: bookData.category || 'General',
      priority: bookData.priority ? parseInt(bookData.priority) : 5,
      notes: bookData.notes?.trim() || ''
    };
  },

  /**
   * 🆕 Retry mechanism for addWantedBook
   */
  async addWantedBookWithRetry(bookData, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [LIBRARY SERVICE] Attempt ${attempt}/${maxRetries}`);
        const result = await this.addWantedBook(bookData);
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`❌ [LIBRARY SERVICE] Attempt ${attempt} failed:`, error.message);
        
        // Chỉ retry với lỗi 400 (Bad Request) - có thể do server validation không nhất quán
        if (error.response?.status === 400 && attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          continue;
        }
        break;
      }
    }
    
    throw lastError;
  }
};

export default libraryService;