// src/components/library/WantedBookForm.jsx
import { useEffect, useState } from 'react';
import { useBooks } from '../../hooks/useBooks';
import { useLibrary } from '../../hooks/useLibrary';

const WantedBookForm = ({ book, onSubmit, loading = false, onCancel }) => {
  const { validateWantedBookData, formatWantedBookData } = useLibrary();
  const { categories } = useBooks();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    priority: 5,
    notes: '',
  });

  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        category: book.category || '',
        priority: book.priority || 5,
        notes: book.notes || '',
      });
    }
  }, [book]);

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
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tên sách *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              fieldErrors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nhập tên sách"
          />
          {fieldErrors.title && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.title}</p>
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
                {val}
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
