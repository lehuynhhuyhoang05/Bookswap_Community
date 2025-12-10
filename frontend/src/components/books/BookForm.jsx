import React, { useState, useEffect, useRef } from 'react';
import { useBooks } from '../../hooks/useBooks';
import { booksService } from '../../services/api/books';
import { Camera, X, Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

const BookForm = ({ book, onSubmit, loading = false, initialData = null }) => {
  const { getCategories, getBookConditions } = useBooks();
  
  const categories = [
    'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 
    'Biography', 'Business', 'Self-Help', 'Cookbooks', 'Travel',
    'Art', 'Music', 'Health', 'Sports', 'Religion', 'Philosophy',
    'Programming', 'Design', 'Education', 'Children', 'Fantasy',
    'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'Horror'
  ];

  const conditions = [
    { value: 'LIKE_NEW', label: 'Như mới', description: 'Chưa sử dụng, còn nguyên seal hoặc mới mở' },
    { value: 'VERY_GOOD', label: 'Rất tốt', description: 'Sử dụng ít, gần như mới, không có vết gấp' },
    { value: 'GOOD', label: 'Tốt', description: 'Đã sử dụng nhưng còn đẹp, có thể có vết gấp nhẹ' },
    { value: 'FAIR', label: 'Khá', description: 'Có dấu hiệu sử dụng rõ, có thể có ghi chú/highlight' },
    { value: 'POOR', label: 'Kém', description: 'Cũ, có thể thiếu trang hoặc hư hỏng nhẹ' }
  ];

  const fileInputRef = useRef(null);
  const [userPhotos, setUserPhotos] = useState([]); // File objects
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState([]); // Preview URLs
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState([]); // Server URLs
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  
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
    condition_notes: ''
  });

  useEffect(() => {
    // Priority: book prop > initialData > default
    const dataSource = book || initialData;
    console.log('📖 BookForm dataSource:', dataSource);
    if (dataSource) {
      const newFormData = {
        title: dataSource.title || '',
        author: dataSource.author || '',
        isbn: dataSource.isbn || '',
        publisher: dataSource.publisher || '',
        publish_date: dataSource.publish_date || '',
        description: dataSource.description || '',
        category: dataSource.category || '',
        language: dataSource.language || 'vi',
        page_count: dataSource.page_count || '',
        cover_image_url: dataSource.cover_image_url || '',
        book_condition: dataSource.book_condition || 'GOOD',
        condition_notes: dataSource.condition_notes || ''
      };
      console.log('📖 BookForm setting formData:', newFormData);
      setFormData(newFormData);
      // Load existing user photos if editing
      if (dataSource.user_photos && dataSource.user_photos.length > 0) {
        setUploadedPhotoUrls(dataSource.user_photos);
        setPhotoPreviewUrls(dataSource.user_photos);
      }
    }
  }, [book, initialData]);

  // Handle photo selection
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate max 5 photos
    const totalPhotos = userPhotos.length + files.length;
    if (totalPhotos > 5) {
      setUploadError('Tối đa 5 ảnh. Bạn đã chọn quá nhiều!');
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(f => !f.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setUploadError('Chỉ chấp nhận file ảnh (jpg, png, gif, webp)');
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(f => f.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setUploadError('Mỗi ảnh không được vượt quá 5MB');
      return;
    }

    setUploadError('');
    setUserPhotos(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreviewUrls(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove a photo
  const handleRemovePhoto = (index) => {
    setUserPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setUploadedPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Upload photos to server
  const handleUploadPhotos = async () => {
    if (userPhotos.length === 0) return uploadedPhotoUrls;

    setUploading(true);
    setUploadError('');

    try {
      const result = await booksService.uploadBookPhotos(userPhotos);
      const newUrls = [...uploadedPhotoUrls, ...result.urls];
      setUploadedPhotoUrls(newUrls);
      setUserPhotos([]); // Clear pending files
      return newUrls;
    } catch (error) {
      setUploadError(error.message || 'Upload ảnh thất bại');
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validate required fields
    if (!formData.title.trim() || !formData.author.trim() || !formData.category) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }

    // ✅ Validate photos - require at least 1 photo for new books
    const totalPhotos = photoPreviewUrls.length;
    if (!book && totalPhotos === 0) {
      setUploadError('Vui lòng upload ít nhất 1 ảnh sách thật của bạn');
      return;
    }

    try {
      // Upload pending photos first
      let finalPhotoUrls = uploadedPhotoUrls;
      if (userPhotos.length > 0) {
        finalPhotoUrls = await handleUploadPhotos();
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
        isbn: formData.isbn || undefined,
        condition_notes: formData.condition_notes || undefined,
        // ✅ Include user photos
        user_photos: finalPhotoUrls.length > 0 ? finalPhotoUrls : undefined
      };
      
      console.log('📖 Submitting book data:', submitData);
      onSubmit(submitData);
    } catch (error) {
      console.error('Submit error:', error);
    }
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
                {cond.label} - {cond.description}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {conditions.find(c => c.value === formData.book_condition)?.description}
          </p>
        </div>

        {/* Condition Notes */}
        <div>
          <label htmlFor="condition_notes" className="block text-sm font-medium text-gray-700">
            Ghi chú về tình trạng sách
          </label>
          <textarea
            id="condition_notes"
            name="condition_notes"
            rows={2}
            value={formData.condition_notes}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="VD: Sách còn mới 90%, có một vết gấp nhỏ ở trang 50, bìa nguyên vẹn"
          />
          <p className="text-xs text-gray-500 mt-1">
            Mô tả chi tiết tình trạng sách giúp người trao đổi có thông tin chính xác hơn
          </p>
        </div>

        {/* User Photos - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ảnh sách thật của bạn * <span className="text-gray-500">(Tối đa 5 ảnh)</span>
          </label>
          
          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
            <div className="flex items-start gap-2">
              <Camera className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Tại sao cần ảnh sách thật?</p>
                <ul className="list-disc list-inside mt-1 text-blue-600">
                  <li>Xác minh bạn thực sự sở hữu cuốn sách</li>
                  <li>Giúp người trao đổi thấy tình trạng thực tế</li>
                  <li>Tăng độ tin cậy cho profile của bạn</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Upload area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
              uploadError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoSelect}
            />
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Click để chọn ảnh hoặc kéo thả vào đây
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, GIF, WebP - Tối đa 5MB mỗi ảnh
            </p>
          </div>

          {/* Error message */}
          {uploadError && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              {uploadError}
            </div>
          )}

          {/* Photo previews */}
          {photoPreviewUrls.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {photoPreviewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Book photo ${index + 1}`}
                    className="w-full h-20 object-cover rounded-md border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(index);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {index < uploadedPhotoUrls.length && (
                    <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-xs text-center py-0.5">
                      Đã upload
                    </div>
                  )}
                </div>
              ))}
              
              {/* Add more photos button */}
              {photoPreviewUrls.length < 5 && (
                <div 
                  className="w-full h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="text-2xl text-gray-400">+</span>
                </div>
              )}
            </div>
          )}

          {/* Photo count */}
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>{photoPreviewUrls.length}/5 ảnh đã chọn</span>
            {userPhotos.length > 0 && (
              <span className="text-amber-600">
                {userPhotos.length} ảnh chưa upload (sẽ upload khi lưu)
              </span>
            )}
          </div>
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
            disabled={loading || uploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {uploading ? 'Đang upload ảnh...' : 'Đang xử lý...'}
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