import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  BookOpen,
  Camera,
  Hash,
  Languages,
  Calendar,
  MapPin,
  Upload,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  // Form state
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
    book_condition: 'GOOD',
    location: ''
  });

  const [errors, setErrors] = useState({});
  const [book, setBook] = useState(null);

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
    'Education', 'Travel', 'Cooking', 'Health', 'Sports',
    'Tiểu thuyết', 'Kinh tế', 'Tâm lý', 'Văn học', 'Thiếu nhi'
  ];

  // Fetch book data on component mount
  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        // Simulate API call to get book details
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockBook = {
          id: id,
          title: "Clean Code: A Handbook of Agile Software Craftsmanship",
          author: "Robert C. Martin",
          isbn: "9780132350884",
          publisher: "Prentice Hall",
          publish_date: "2008-08-01",
          description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book is a must-read for every software developer who wants to write code that's not just functional but also maintainable and scalable.",
          category: "Programming",
          language: "en",
          page_count: 464,
          cover_image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=crop",
          book_condition: "EXCELLENT",
          location: "Quận 1, TP.HCM"
        };
        
        setBook(mockBook);
        setFormData({
          title: mockBook.title,
          author: mockBook.author,
          isbn: mockBook.isbn,
          publisher: mockBook.publisher,
          publish_date: mockBook.publish_date,
          description: mockBook.description,
          category: mockBook.category,
          language: mockBook.language,
          page_count: mockBook.page_count.toString(),
          cover_image_url: mockBook.cover_image_url,
          book_condition: mockBook.book_condition,
          location: mockBook.location
        });
        setPreviewImage(mockBook.cover_image_url);
      } catch (error) {
        console.error('Error fetching book details:', error);
        setErrors({ fetch: 'Không thể tải thông tin sách' });
      } finally {
        setLoading(false);
      }
    };

    fetchBookData();
  }, [id]);

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
    
    if (!validateForm()) return;

    setSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Navigate to /my-library after successful update
      navigate('/my-library', { 
        state: { message: 'Cập nhật sách thành công!' } 
      });
    } catch (error) {
      setErrors({ submit: 'Lỗi kết nối. Vui lòng thử lại.' });
    } finally {
      setSubmitting(false);
    }
  };

  const RequiredLabel = ({ children }) => (
    <span className="flex items-center space-x-1">
      <span>{children}</span>
      <span className="text-red-500">*</span>
    </span>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin sách...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sách</h3>
          <p className="text-gray-600 mb-6">Cuốn sách bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link
            to="/my-library"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại thư viện</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8">
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <Link 
          to="/my-library"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Chỉnh Sửa Sách</h1>
                <p className="text-blue-100">Cập nhật thông tin sách của bạn</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{errors.submit}</span>
              </div>
            )}
            {errors.fetch && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{errors.fetch}</span>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <RequiredLabel>Ảnh bìa sách</RequiredLabel>
                  </label>
                  {previewImage ? (
                    <div className="relative">
                      <img src={previewImage} alt="Book cover preview" className="w-full h-80 object-cover rounded-2xl shadow-lg" />
                      <button type="button" onClick={removeImage} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
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
                      <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                  {errors.cover_image_url && <p className="mt-2 text-sm text-red-600">{errors.cover_image_url}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <RequiredLabel>Tình trạng sách</RequiredLabel>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {conditionOptions.map((condition) => (
                      <label key={condition.value} className={`relative flex cursor-pointer rounded-2xl border-2 p-4 focus:outline-none ${formData.book_condition === condition.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                        <input type="radio" name="book_condition" value={condition.value} checked={formData.book_condition === condition.value} onChange={handleInputChange} className="sr-only" />
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center">
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">{condition.label}</span>
                            </div>
                          </div>
                          <div className={`shrink-0 w-3 h-3 rounded-full bg-gradient-to-r ${condition.color}`} />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    <RequiredLabel>Tiêu đề sách</RequiredLabel>
                  </label>
                  <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.title ? 'border-red-300' : 'border-gray-200'}`} placeholder="Nhập tiêu đề sách..." />
                  {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
                </div>

                {/* Author */}
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                    <RequiredLabel>Tác giả</RequiredLabel>
                  </label>
                  <input type="text" id="author" name="author" value={formData.author} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.author ? 'border-red-300' : 'border-gray-200'}`} placeholder="Nhập tên tác giả..." />
                  {errors.author && <p className="mt-2 text-sm text-red-600">{errors.author}</p>}
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
                    <input type="text" id="isbn" name="isbn" value={formData.isbn} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.isbn ? 'border-red-300' : 'border-gray-200'}`} placeholder="9780132350884" />
                  </div>
                  {errors.isbn && <p className="mt-2 text-sm text-red-600">{errors.isbn}</p>}
                </div>

                {/* Publisher & Publish Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">Nhà xuất bản</label>
                    <input type="text" id="publisher" name="publisher" value={formData.publisher} onChange={handleInputChange} className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Prentice Hall" />
                  </div>
                  <div>
                    <label htmlFor="publish_date" className="block text-sm font-medium text-gray-700 mb-2">Ngày xuất bản</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input type="date" id="publish_date" name="publish_date" value={formData.publish_date} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                    </div>
                  </div>
                </div>

                {/* Category & Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2"><RequiredLabel>Thể loại</RequiredLabel></label>
                    <select id="category" name="category" value={formData.category} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.category ? 'border-red-300' : 'border-gray-200'}`}>
                      <option value="">-- Chọn thể loại --</option>
                      {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category}</p>}
                  </div>
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ</label>
                    <select id="language" name="language" value={formData.language} onChange={handleInputChange} className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                      {languageOptions.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Page count */}
                <div>
                  <label htmlFor="page_count" className="block text-sm font-medium text-gray-700 mb-2"><RequiredLabel>Số trang</RequiredLabel></label>
                  <input type="number" id="page_count" name="page_count" value={formData.page_count} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.page_count ? 'border-red-300' : 'border-gray-200'}`} placeholder="464" />
                  {errors.page_count && <p className="mt-2 text-sm text-red-600">{errors.page_count}</p>}
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2"><RequiredLabel>Vị trí sách</RequiredLabel></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} className={`w-full pl-10 pr-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.location ? 'border-red-300' : 'border-gray-200'}`} placeholder="Quận 1, TP.HCM" />
                  </div>
                  {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2"><RequiredLabel>Mô tả</RequiredLabel></label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className={`w-full px-4 py-3 rounded-2xl border-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.description ? 'border-red-300' : 'border-gray-200'}`} rows={5} placeholder="Nhập mô tả sách..."></textarea>
                  {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8 text-right">
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-8 py-3 rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Đang cập nhật...' : 'Cập nhật sách'}
                {submitting && <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M4 12a8 8 0 018-8" strokeLinecap="round"/></svg>}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditBook;
