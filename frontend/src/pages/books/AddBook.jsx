import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  BookOpen,
  User,
  Camera,
  Hash,
  Languages,
  Calendar,
  MapPin,
  Star,
  Upload,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AddBook = () => {
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    google_books_id: '',
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
    book_condition: 'GOOD',
    location: ''
  });

  const [errors, setErrors] = useState({});

  // Book condition options
  const conditionOptions = [
    { value: 'NEW', label: 'Mới', color: 'from-green-500 to-emerald-500' },
    { value: 'EXCELLENT', label: 'Rất tốt', color: 'from-blue-500 to-cyan-500' },
    { value: 'GOOD', label: 'Tốt', color: 'from-amber-500 to-orange-500' },
    { value: 'FAIR', label: 'Khá', color: 'from-orange-500 to-red-500' },
    { value: 'POOR', label: 'Cũ', color: 'from-red-500 to-pink-500' }
  ];

  const languageOptions = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' }
  ];

  const categoryOptions = [
    'Programming', 'Fiction', 'Non-Fiction', 'Science', 'Technology',
    'Business', 'Art', 'History', 'Philosophy', 'Self-Help',
    'Education', 'Travel', 'Cooking', 'Health', 'Sports'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In real app, you would upload to cloud storage and get URL
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFormData(prev => ({
        ...prev,
        cover_image_url: imageUrl
      }));
    }
  };

  const removeImage = () => {
    setPreviewImage('');
    setFormData(prev => ({
      ...prev,
      cover_image_url: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Tiêu đề sách là bắt buộc';
    if (!formData.author.trim()) newErrors.author = 'Tác giả là bắt buộc';
    if (!formData.isbn.trim()) newErrors.isbn = 'ISBN là bắt buộc';
    if (!formData.description.trim()) newErrors.description = 'Mô tả là bắt buộc';
    if (!formData.category) newErrors.category = 'Thể loại là bắt buộc';
    if (!formData.page_count || formData.page_count < 1) newErrors.page_count = 'Số trang phải hợp lệ';
    if (!formData.cover_image_url) newErrors.cover_image_url = 'Ảnh bìa là bắt buộc';
    if (!formData.location.trim()) newErrors.location = 'Vị trí là bắt buộc';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          page_count: parseInt(formData.page_count),
          // Add current user info from auth context in real app
          owner_id: 'current_user_id'
        })
      });

      if (response.status === 201) {
        // Success - redirect to book list or new book detail
        navigate('/books');
      } else if (response.status === 404) {
        setErrors({ submit: 'Không tìm thấy hồ sơ người dùng. Vui lòng đăng nhập lại.' });
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Có lỗi xảy ra khi thêm sách' });
      }
    } catch (error) {
      setErrors({ submit: 'Lỗi kết nối. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  // Component for required field label
  const RequiredLabel = ({ children }) => (
    <span className="flex items-center space-x-1">
      <span>{children}</span>
      <span className="text-red-500">*</span>
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8">
      {/* Header Navigation */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <Link 
          to="/my-library"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </Link>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
        >
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Thêm Sách Mới</h1>
                <p className="text-blue-100">Chia sẻ sách của bạn với cộng đồng</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Error Message */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{errors.submit}</span>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Book Cover */}
              <div className="space-y-6">
                {/* Cover Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <RequiredLabel>Ảnh bìa sách</RequiredLabel>
                  </label>
                  
                  {previewImage ? (
                    <div className="relative">
                      <img
                        src={previewImage}
                        alt="Book cover preview"
                        className="w-full h-80 object-cover rounded-2xl shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click để tải ảnh lên</span>
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP (Max. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                  {errors.cover_image_url && (
                    <p className="mt-2 text-sm text-red-600">{errors.cover_image_url}</p>
                  )}
                </div>

                {/* Book Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <RequiredLabel>Tình trạng sách</RequiredLabel>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {conditionOptions.map((condition) => (
                      <label
                        key={condition.value}
                        className={`relative flex cursor-pointer rounded-2xl border-2 p-4 focus:outline-none ${
                          formData.book_condition === condition.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="book_condition"
                          value={condition.value}
                          checked={formData.book_condition === condition.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center">
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">
                                {condition.label}
                              </span>
                            </div>
                          </div>
                          <div className={`shrink-0 w-3 h-3 rounded-full bg-gradient-to-r ${condition.color}`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Book Details */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    <RequiredLabel>Tiêu đề sách</RequiredLabel>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.title ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Nhập tiêu đề sách..."
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Author */}
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                    <RequiredLabel>Tác giả</RequiredLabel>
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.author ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Nhập tên tác giả..."
                  />
                  {errors.author && (
                    <p className="mt-2 text-sm text-red-600">{errors.author}</p>
                  )}
                </div>

                {/* ISBN */}
                <div>
                  <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
                    <RequiredLabel>ISBN</RequiredLabel>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="isbn"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.isbn ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="9780132350884"
                    />
                  </div>
                  {errors.isbn && (
                    <p className="mt-2 text-sm text-red-600">{errors.isbn}</p>
                  )}
                </div>

                {/* Publisher & Publish Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
                      Nhà xuất bản
                    </label>
                    <input
                      type="text"
                      id="publisher"
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Prentice Hall"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày xuất bản
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="publish_date"
                        name="publish_date"
                        value={formData.publish_date}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Category & Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      <RequiredLabel>Thể loại</RequiredLabel>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.category ? 'border-red-300' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Chọn thể loại</option>
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-2 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                      Ngôn ngữ
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Languages className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        {languageOptions.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Page Count & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="page_count" className="block text-sm font-medium text-gray-700 mb-2">
                      <RequiredLabel>Số trang</RequiredLabel>
                    </label>
                    <input
                      type="number"
                      id="page_count"
                      name="page_count"
                      value={formData.page_count}
                      onChange={handleInputChange}
                      min="1"
                      className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.page_count ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="464"
                    />
                    {errors.page_count && (
                      <p className="mt-2 text-sm text-red-600">{errors.page_count}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      <RequiredLabel>Vị trí</RequiredLabel>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.location ? 'border-red-300' : 'border-gray-200'
                        }`}
                        placeholder="Quận 1, TP.HCM"
                      />
                    </div>
                    {errors.location && (
                      <p className="mt-2 text-sm text-red-600">{errors.location}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    <RequiredLabel>Mô tả sách</RequiredLabel>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.description ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Mô tả về nội dung và tình trạng sách..."
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 mt-8 pt-8 border-t border-gray-200">
              <Link
                to="/book"
                className="px-8 py-4 text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all font-semibold"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang thêm...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Thêm Sách</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddBook;