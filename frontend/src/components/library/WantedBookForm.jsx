// src/components/library/WantedBookForm.jsx
import { useEffect, useState, useCallback } from 'react';
import { useBooks } from '../../hooks/useBooks';
import { useLibrary } from '../../hooks/useLibrary';
import debounce from 'lodash/debounce';

// Preferred condition options với labels tiếng Việt
const PREFERRED_CONDITIONS = [
  { value: 'ANY', label: 'Bất kỳ tình trạng nào' },
  { value: 'FAIR_UP', label: 'Từ Trung bình trở lên' },
  { value: 'GOOD_UP', label: 'Từ Tốt trở lên' },
  { value: 'VERY_GOOD_UP', label: 'Từ Rất tốt trở lên' },
  { value: 'LIKE_NEW', label: 'Chỉ sách như mới' },
];

const WantedBookForm = ({ book, onSubmit, loading = false, onCancel }) => {
  const { validateWantedBookData, formatWantedBookData } = useLibrary();
  const { categories } = useBooks();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    google_books_id: '',
    category: '',
    cover_image_url: '',
    preferred_condition: 'ANY',
    language: '',
    priority: 5,
    notes: '',
  });

  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [googleBooksResults, setGoogleBooksResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        google_books_id: book.google_books_id || '',
        category: book.category || '',
        cover_image_url: book.cover_image_url || '',
        preferred_condition: book.preferred_condition || 'ANY',
        language: book.language || '',
        priority: book.priority || 5,
        notes: book.notes || '',
      });
    }
  }, [book]);

  // Search Google Books API
  const searchGoogleBooks = useCallback(
    debounce(async (query) => {
      if (!query || query.length < 3) {
        setGoogleBooksResults([]);
        setShowSuggestions(false);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&langRestrict=vi`
        );
        const data = await response.json();
        
        if (data.items) {
          setGoogleBooksResults(data.items.map(item => ({
            id: item.id,
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors?.join(', ') || '',
            isbn: item.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                  item.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || '',
            cover_image_url: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
            category: item.volumeInfo.categories?.[0] || '',
            language: item.volumeInfo.language || '',
            publisher: item.volumeInfo.publisher || '',
          })));
          setShowSuggestions(true);
        } else {
          setGoogleBooksResults([]);
        }
      } catch (error) {
        console.error('Google Books search error:', error);
        setGoogleBooksResults([]);
      }
      setSearchLoading(false);
    }, 500),
    []
  );

  // Select a book from Google Books results
  const handleSelectGoogleBook = (googleBook) => {
    setFormData(prev => ({
      ...prev,
      title: googleBook.title,
      author: googleBook.author,
      isbn: googleBook.isbn,
      google_books_id: googleBook.id,
      cover_image_url: googleBook.cover_image_url,
      category: googleBook.category || prev.category,
      language: googleBook.language,
    }));
    setShowSuggestions(false);
    setGoogleBooksResults([]);
  };

  const validateField = (name, value) => {
    const newFieldErrors = { ...fieldErrors };

    if (name === 'title' && !value.trim()) {
      newFieldErrors.title = 'Tên sách là bắt buộc';
    } else if (name === 'title') {
      delete newFieldErrors.title;
    }

    setFieldErrors(newFieldErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateField(name, value);

    if (errors.length > 0) {
      setErrors([]);
    }

    // Trigger Google Books search when title changes
    if (name === 'title') {
      searchGoogleBooks(value);
    }
  };

  // Clear cover image
  const handleClearCover = () => {
    setFormData(prev => ({
      ...prev,
      cover_image_url: '',
      google_books_id: '',
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateWantedBookData(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const cleanedData = formatWantedBookData(formData);
    onSubmit(cleanedData);
  };

  const isSubmitDisabled = loading || Object.keys(fieldErrors).length > 0;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {book ? 'Chỉnh sửa sách mong muốn' : 'Thêm sách mong muốn'}
      </h2>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <ul className="text-red-700 text-sm">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image Preview */}
        {formData.cover_image_url && (
          <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={formData.cover_image_url}
              alt={formData.title}
              className="w-20 h-28 object-cover rounded shadow"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Ảnh bìa từ Google Books</p>
              <p className="text-xs text-gray-500 mt-1">ISBN: {formData.isbn || 'Không có'}</p>
              <button
                type="button"
                onClick={handleClearCover}
                className="text-red-600 text-xs mt-2 hover:underline"
              >
                Xóa ảnh bìa
              </button>
            </div>
          </div>
        )}

        {/* Title with Google Books Search */}
        <div className="relative">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tên sách *
          </label>
          <div className="relative">
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onFocus={() => formData.title.length >= 3 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldErrors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Nhập tên sách để tìm kiếm..."
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          {fieldErrors.title && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>
          )}

          {/* Google Books Suggestions Dropdown */}
          {showSuggestions && googleBooksResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 bg-blue-50 border-b text-xs text-blue-700">
                💡 Chọn sách từ Google Books để tự động điền thông tin
              </div>
              {googleBooksResults.map((googleBook) => (
                <div
                  key={googleBook.id}
                  onClick={() => handleSelectGoogleBook(googleBook)}
                  className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {googleBook.cover_image_url ? (
                    <img
                      src={googleBook.cover_image_url}
                      alt={googleBook.title}
                      className="w-10 h-14 object-cover rounded mr-3"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-gray-200 rounded mr-3 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">📖</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{googleBook.title}</p>
                    <p className="text-xs text-gray-500 truncate">{googleBook.author}</p>
                    {googleBook.isbn && (
                      <p className="text-xs text-gray-400">ISBN: {googleBook.isbn}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="author"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tác giả
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập tên tác giả"
          />
        </div>

        {/* ISBN field */}
        <div>
          <label
            htmlFor="isbn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ISBN (tùy chọn)
          </label>
          <input
            type="text"
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập mã ISBN-10 hoặc ISBN-13"
          />
          <p className="text-xs text-gray-500 mt-1">
            Thêm ISBN giúp hệ thống tìm đúng sách bạn cần hơn
          </p>
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Thể loại
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Chọn thể loại</option>
            {categories?.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Preferred Condition */}
        <div>
          <label
            htmlFor="preferred_condition"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tình trạng mong muốn
          </label>
          <select
            id="preferred_condition"
            name="preferred_condition"
            value={formData.preferred_condition}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {PREFERRED_CONDITIONS.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Chọn tình trạng tối thiểu bạn chấp nhận để lọc sách phù hợp
          </p>
        </div>

        {/* Language */}
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ngôn ngữ
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Không yêu cầu</option>
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="zh">中文</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Độ ưu tiên
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
              <option key={val} value={val}>
                {val} {val <= 3 ? '(Thấp)' : val <= 7 ? '(Trung bình)' : '(Cao)'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ghi chú
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ghi chú về phiên bản, tình trạng mong muốn..."
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : book ? (
              'Cập nhật sách'
            ) : (
              'Thêm sách'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WantedBookForm;
