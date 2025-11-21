import React, { useState, useEffect } from 'react';
import { useBooks } from '../../hooks/useBooks';

const BookForm = ({ book, onSubmit, loading = false }) => {
  const { getCategories, getBookConditions } = useBooks();
  
  const categories = [
    'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 
    'Biography', 'Business', 'Self-Help', 'Cookbooks', 'Travel',
    'Art', 'Music', 'Health', 'Sports', 'Religion', 'Philosophy',
    'Programming', 'Design', 'Education', 'Children', 'Fantasy',
    'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'Horror'
  ];

  const conditions = [
    { value: 'LIKE_NEW', label: 'Như mới' },
    { value: 'VERY_GOOD', label: 'Rất tốt' },
    { value: 'GOOD', label: 'Tốt' },
    { value: 'FAIR', label: 'Khá' },
    { value: 'POOR', label: 'Kém' }
  ];
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publish_date: '',
    description: '',
    category: '',
    language: 'vi',
    page_count: '',
    cover_image_url: '',
    book_condition: 'GOOD'
  });

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        publish_date: book.publish_date || '',
        description: book.description || '',
        category: book.category || '',
        language: book.language || 'vi',
        page_count: book.page_count || '',
        cover_image_url: book.cover_image_url || '',
        book_condition: book.book_condition || 'GOOD'
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ✅ Validate required fields
    if (!formData.title.trim() || !formData.author.trim() || !formData.category) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }

    // ✅ CHUẨN BỊ DỮ LIỆU TRƯỚC KHI GỬI
    const submitData = {
      ...formData,
      // ✅ Chuyển đổi page_count thành number hoặc undefined
      page_count: formData.page_count ? parseInt(formData.page_count) : undefined,
      // ✅ Nếu publish_date rỗng thì gửi undefined thay vì chuỗi rỗng
      publish_date: formData.publish_date || undefined,
      // ✅ Đảm bảo các trường khác cũng xử lý tương tự
      publisher: formData.publisher || undefined,
      description: formData.description || undefined,
      cover_image_url: formData.cover_image_url || undefined,
      isbn: formData.isbn || undefined
    };
    
    console.log('📖 Submitting book data:', submitData);
    onSubmit(submitData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Tên sách *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập tên sách"
          />
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700">
            Tác giả *
          </label>
          <input
            type="text"
            id="author"
            name="author"
            required
            value={formData.author}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập tên tác giả"
          />
        </div>

        {/* ISBN */}
        <div>
          <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
            ISBN
          </label>
          <input
            type="text"
            id="isbn"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập mã ISBN"
          />
        </div>

        {/* Publisher */}
        <div>
          <label htmlFor="publisher" className="block text-sm font-medium text-gray-700">
            Nhà xuất bản
          </label>
          <input
            type="text"
            id="publisher"
            name="publisher"
            value={formData.publisher}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nhập tên nhà xuất bản"
          />
        </div>

        {/* Publish Date - THÊM INPUT TYPE DATE */}
        <div>
          <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700">
            Ngày xuất bản
          </label>
          <input
            type="date"
            id="publish_date"
            name="publish_date"
            value={formData.publish_date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Định dạng: YYYY-MM-DD (để trống nếu không biết)
          </p>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Danh mục *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Book Condition */}
        <div>
          <label htmlFor="book_condition" className="block text-sm font-medium text-gray-700">
            Tình trạng sách *
          </label>
          <select
            id="book_condition"
            name="book_condition"
            required
            value={formData.book_condition}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {conditions.map((cond, index) => (
              <option key={index} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Mô tả về cuốn sách"
          />
        </div>

        {/* Page Count */}
        <div>
          <label htmlFor="page_count" className="block text-sm font-medium text-gray-700">
            Số trang
          </label>
          <input
            type="number"
            id="page_count"
            name="page_count"
            min="1"
            value={formData.page_count}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Số trang"
          />
        </div>

        {/* Cover Image URL */}
        <div>
          <label htmlFor="cover_image_url" className="block text-sm font-medium text-gray-700">
            URL Ảnh bìa
          </label>
          <input
            type="url"
            id="cover_image_url"
            name="cover_image_url"
            value={formData.cover_image_url}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : (
              book ? 'Cập nhật sách' : 'Thêm sách'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;