import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  Edit3,
  Eye,
  Filter,
  Heart,
  Loader,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { deleteBook, fetchMyLibrary } from '../../services/booksApi';

const MyLibrary = () => {
  useEffect(() => {
    const scrollDuration = 600;
    const start = window.scrollY;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / scrollDuration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, start * (1 - ease));

      if (progress < 1) requestAnimationFrame(animateScroll);
    };

    requestAnimationFrame(animateScroll);
  }, []);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    inExchange: 0,
    favorite: 0,
  });

  const [filters, setFilters] = useState({
    status: '',
    condition: '',
    category: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadMyLibrary = async () => {
      try {
        setLoading(true);
        const data = await fetchMyLibrary();

        // Map API response to UI-friendly shape
        const mapped = (Array.isArray(data) ? data : []).map((b) => ({
          id: b.book_id,
          book_id: b.book_id,
          title: b.title || '',
          author: b.author || '',
          isbn: b.isbn || '',
          publisher: b.publisher || '',
          publish_date: b.publish_date,
          description: b.description || '',
          category: b.category || '',
          language: b.language || 'vi',
          page_count: b.page_count || 0,
          cover_image_url: b.cover_image_url || '',
          book_condition: b.book_condition || 'GOOD',
          location: b.location || '',
          status:
            (b.status === 'AVAILABLE' && 'available') ||
            (b.status === 'EXCHANGING' && 'in_exchange') ||
            (b.status || '').toLowerCase(),
          added_date: b.created_at || b.updated_at,
          views: b.views || 0,
          likes: b.likes || 0,
          exchange_requests: b.exchange_requests || 0,
          tags: b.tags || [],
          is_favorite: false,
        }));

        // Filter out books with status 'removed' (soft deleted)
        const visibleBooks = mapped.filter((book) => book.status !== 'removed');
        setBooks(visibleBooks);

        const total = mapped.length;
        const available = mapped.filter(
          (book) => book.status === 'available',
        ).length;
        const inExchange = mapped.filter(
          (book) => book.status === 'in_exchange',
        ).length;
        const favorite = mapped.filter((book) => book.is_favorite).length;

        setStats({ total, available, inExchange, favorite });
      } catch (error) {
        console.error('Error loading my library:', error);
        setBooks([]);
        setStats({ total: 0, available: 0, inExchange: 0, favorite: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadMyLibrary();
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      searchTerm === '' ||
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || book.status === filters.status;
    const matchesCondition =
      !filters.condition || book.book_condition === filters.condition;
    const matchesCategory =
      !filters.category || book.category === filters.category;

    return (
      matchesSearch && matchesStatus && matchesCondition && matchesCategory
    );
  });

  const conditionColors = {
    LIKE_NEW: 'bg-gradient-to-r from-green-500 to-emerald-500',
    GOOD: 'bg-gradient-to-r from-amber-500 to-orange-500',
    FAIR: 'bg-gradient-to-r from-orange-500 to-red-500',
    POOR: 'bg-gradient-to-r from-red-500 to-pink-500',
  };

  const conditionLabels = {
    LIKE_NEW: 'Mới',
    GOOD: 'Tốt',
    FAIR: 'Khá',
    POOR: 'Cũ',
  };

  const statusColors = {
    available: 'text-green-600 bg-green-50 border-green-200',
    in_exchange: 'text-blue-600 bg-blue-50 border-blue-200',
    draft: 'text-gray-600 bg-gray-50 border-gray-200',
  };

  const statusLabels = {
    available: 'Có sẵn',
    in_exchange: 'Đang trao đổi',
    draft: 'Bản nháp',
  };

  const handleDeleteBook = async (bookId, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc muốn xóa cuốn sách này khỏi thư viện?')) {
      try {
        await deleteBook(bookId);
        // Reload library from backend
        const data = await fetchMyLibrary();
        const mapped = (Array.isArray(data) ? data : []).map((b) => ({
          id: b.book_id,
          book_id: b.book_id,
          title: b.title || '',
          author: b.author || '',
          isbn: b.isbn || '',
          publisher: b.publisher || '',
          publish_date: b.publish_date,
          description: b.description || '',
          category: b.category || '',
          language: b.language || 'vi',
          page_count: b.page_count || 0,
          cover_image_url: b.cover_image_url || '',
          book_condition: b.book_condition || 'GOOD',
          location: b.location || '',
          status:
            (b.status === 'AVAILABLE' && 'available') ||
            (b.status === 'EXCHANGING' && 'in_exchange') ||
            (b.status || '').toLowerCase(),
          added_date: b.created_at || b.updated_at,
          views: b.views || 0,
          likes: b.likes || 0,
          exchange_requests: b.exchange_requests || 0,
          tags: b.tags || [],
          is_favorite: false,
        }));
        const visibleBooks = mapped.filter((book) => book.status !== 'removed');
        setBooks(visibleBooks);

        // Cập nhật stats
        const total = visibleBooks.length;
        const available = visibleBooks.filter(
          (book) => book.status === 'available',
        ).length;
        const inExchange = visibleBooks.filter(
          (book) => book.status === 'in_exchange',
        ).length;
        const favorite = visibleBooks.filter((book) => book.is_favorite).length;
        setStats({ total, available, inExchange, favorite });

        // Có thể thêm toast notification ở đây
        console.log('Đã xóa sách thành công');
      } catch (error) {
        console.error('Lỗi khi xóa sách:', error);
        alert('Có lỗi xảy ra khi xóa sách');
      }
    }
  };

  const handleToggleFavorite = async (bookId, e) => {
    e.stopPropagation();
    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      const updatedBooks = books.map((book) =>
        book.id === bookId ? { ...book, is_favorite: !book.is_favorite } : book,
      );
      setBooks(updatedBooks);

      // Cập nhật stats
      const favorite = updatedBooks.filter((book) => book.is_favorite).length;
      setStats((prev) => ({ ...prev, favorite }));
    } catch (error) {
      console.error('Lỗi khi cập nhật yêu thích:', error);
    }
  };

  // SỬA LẠI: Sửa đường dẫn edit cho đúng với route
  const handleEditBook = (bookId, e) => {
    e.stopPropagation();
    navigate(`/books/edit/${bookId}`);
  };

  // SỬA LẠI: Thêm hàm view book detail
  const handleViewBook = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  const BookCard = ({ book }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 cursor-pointer group ${
        book.is_favorite ? 'ring-2 ring-amber-200' : ''
      }`}
      onClick={() => handleViewBook(book.id)}
    >
      <div className="relative overflow-hidden">
        <img
          src={book.cover_image_url}
          alt={book.title}
          className="object-cover h-64 w-full transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span
            className={`px-3 py-2 text-white text-sm font-semibold rounded-full shadow-lg ${conditionColors[book.book_condition]}`}
          >
            {conditionLabels[book.book_condition]}
          </span>
          <span
            className={`px-3 py-2 text-sm font-semibold rounded-full shadow-lg border ${statusColors[book.status]}`}
          >
            {statusLabels[book.status]}
          </span>
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button
            onClick={(e) => handleToggleFavorite(book.id, e)}
            className={`p-2 bg-white/90 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 ${
              book.is_favorite
                ? 'text-amber-500'
                : 'text-gray-600 hover:text-amber-500'
            }`}
          >
            <Heart
              className={`w-4 h-4 ${book.is_favorite ? 'fill-current' : ''}`}
            />
          </button>

          <button
            onClick={(e) => handleEditBook(book.id, e)}
            className="p-2 bg-white/90 rounded-full shadow-lg text-gray-600 hover:text-blue-500 hover:scale-110 transition-transform duration-200"
            title="Chỉnh sửa"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => handleDeleteBook(book.id, e)}
            className="p-2 bg-white/90 rounded-full shadow-lg text-gray-600 hover:text-red-500 hover:scale-110 transition-transform duration-200"
            title="Xóa sách"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {book.is_favorite && (
          <div className="absolute bottom-4 left-4 px-3 py-2 bg-amber-500 text-white text-sm font-semibold rounded-full shadow-lg flex items-center gap-1">
            <Star className="w-4 h-4 fill-current" />
            <span>Yêu thích</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
              {book.title}
            </h3>
            <p className="text-blue-600 font-medium mb-2">{book.author}</p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {book.description}
        </p>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{book.location}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center" title="Lượt xem">
              <Eye className="w-4 h-4 mr-1" />
              {book.views}
            </div>
            <div className="flex items-center" title="Lượt thích">
              <Heart className="w-4 h-4 mr-1" />
              {book.likes}
            </div>
            <div className="flex items-center" title="Yêu cầu trao đổi">
              <RefreshCw className="w-4 h-4 mr-1" />
              {book.exchange_requests}
            </div>
          </div>
          <div className="text-xs text-gray-400 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(book.added_date).toLocaleDateString('vi-VN')}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const QuickStats = () => {
    const statsConfig = [
      {
        label: 'Tổng số sách',
        value: stats.total,
        icon: BookOpen,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        gradient: 'from-blue-500 to-cyan-500',
      },
      {
        label: 'Có sẵn',
        value: stats.available,
        icon: CheckCircle,
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        gradient: 'from-green-500 to-emerald-500',
      },
      {
        label: 'Đang trao đổi',
        value: stats.inExchange,
        icon: RefreshCw,
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-600',
        gradient: 'from-amber-500 to-orange-500',
      },
      {
        label: 'Yêu thích',
        value: stats.favorite,
        icon: Heart,
        bgColor: 'bg-rose-100',
        textColor: 'text-rose-600',
        gradient: 'from-rose-500 to-pink-500',
      },
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map(
          ({ label, value, icon: Icon, bgColor, textColor, gradient }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {value}
                  </div>
                  <div className="text-sm text-gray-600">{label}</div>
                </div>
                <div className={`p-3 rounded-2xl ${bgColor}`}>
                  <Icon className={`w-6 h-6 ${textColor}`} />
                </div>
              </div>
            </motion.div>
          ),
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải thư viện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Thư Viện Của Tôi
              </h1>
              <p className="text-gray-600">Quản lý sách của bạn</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm sách trong thư viện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-2xl border transition-all ${
                  showFilters
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Bộ lọc</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                />
              </button>

              <Link
                to="/books/add"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                <span>Thêm sách</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <QuickStats />

        {/* Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 mb-8 overflow-hidden"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    >
                      <option value="">Tất cả trạng thái</option>
                      <option value="available">Có sẵn</option>
                      <option value="in_exchange">Đang trao đổi</option>
                      <option value="draft">Bản nháp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tình trạng sách
                    </label>
                    <select
                      value={filters.condition}
                      onChange={(e) =>
                        setFilters({ ...filters, condition: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    >
                      <option value="">Tất cả tình trạng</option>
                      <option value="LIKE_NEW">Mới</option>
                      <option value="GOOD">Tốt</option>
                      <option value="FAIR">Khá</option>
                      <option value="POOR">Cũ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thể loại
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) =>
                        setFilters({ ...filters, category: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    >
                      <option value="">Tất cả thể loại</option>
                      <option value="Programming">Lập trình</option>
                      <option value="Tiểu thuyết">Tiểu thuyết</option>
                      <option value="Self-help">Self-help</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Tìm thấy{' '}
                    <span className="font-semibold text-blue-600">
                      {filteredBooks.length}
                    </span>{' '}
                    cuốn sách
                    {searchTerm && (
                      <span>
                        {' '}
                        cho từ khóa "
                        <span className="font-semibold">{searchTerm}</span>"
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setFilters({ status: '', condition: '', category: '' });
                      setSearchTerm('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Xóa bộ lọc</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Books Grid */}
        <motion.div
          key={filteredBooks.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Không tìm thấy sách
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || Object.values(filters).some(Boolean)
                ? 'Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm'
                : 'Thư viện của bạn đang trống. Hãy thêm sách mới để bắt đầu trao đổi!'}
            </p>
            <Link
              to="/books/add"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm sách mới</span>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyLibrary;
