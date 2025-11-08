import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Grid3X3,
  List,
  MapPin, 
  Star, 
  User,
  BookOpen,
  Heart,
  Share2,
  Eye,
  Calendar,
  Hash,
  Languages,
  ChevronDown,
  X,
  Loader,
  ArrowRight,
  Bookmark
} from 'lucide-react';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [likedBooks, setLikedBooks] = useState(new Set());
  const [bookmarkedBooks, setBookmarkedBooks] = useState(new Set());
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    language: '',
    location: ''
  });

  // Mock data
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockBooks = [
          {
            id: "1",
            title: "Clean Code: A Handbook of Agile Software Craftsmanship",
            author: "Robert C. Martin",
            isbn: "9780132350884",
            publisher: "Prentice Hall",
            publish_date: "2008-08-01",
            description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book is a must-read for every software developer.",
            category: "Programming",
            language: "en",
            page_count: 464,
            cover_image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop",
            book_condition: "EXCELLENT",
            location: "Quận 1, TP.HCM",
            owner: {
              name: "Nguyễn Văn A",
              avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
              rating: 4.8,
              exchanges: 24
            },
            rating: 4.7,
            exchanges: 8,
            views: 142,
            likes: 18,
            tags: ["Programming", "Software", "Best Practices", "Clean Code"],
            created_at: "2024-01-15T10:30:00Z"
          },
          {
            id: "2",
            title: "Nhà Giả Kim - Hành Trình Tìm Kiếm Vận Mệnh",
            author: "Paulo Coelho",
            isbn: "9780061122415",
            publisher: "HarperOne",
            publish_date: "1988-04-25",
            description: "Một câu chuyện tượng trưng về chàng chăn cừu Santiago trong chuyến phiêu lưu đến Ai Cập để tìm kho báu và khám phá vận mệnh của mình.",
            category: "Tiểu thuyết",
            language: "vi",
            page_count: 208,
            cover_image_url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
            book_condition: "NEW",
            location: "Ba Đình, Hà Nội",
            owner: {
              name: "Trần Thị B",
              avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
              rating: 4.9,
              exchanges: 32
            },
            rating: 4.8,
            exchanges: 12,
            views: 89,
            likes: 23,
            tags: ["Tiểu thuyết", "Tâm linh", "Phiêu lưu", "Best Seller"],
            created_at: "2024-01-10T14:20:00Z"
          },
          {
            id: "3",
            title: "Đắc Nhân Tâm - Nghệ Thuật Thu Phục Lòng Người",
            author: "Dale Carnegie",
            isbn: "9780671027032",
            publisher: "Simon & Schuster",
            publish_date: "1936-10-01",
            description: "Cuốn sách kinh điển về nghệ thuật thu phục lòng người và giao tiếp hiệu quả. Một trong những cuốn sách bán chạy nhất mọi thời đại.",
            category: "Self-help",
            language: "vi",
            page_count: 291,
            cover_image_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
            book_condition: "GOOD",
            location: "Hải Châu, Đà Nẵng",
            owner: {
              name: "Lê Văn C",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
              rating: 4.6,
              exchanges: 18
            },
            rating: 4.5,
            exchanges: 15,
            views: 203,
            likes: 31,
            tags: ["Self-help", "Giao tiếp", "Kỹ năng mềm", "Kinh điển"],
            created_at: "2024-01-08T09:15:00Z"
          },
          {
            id: "4",
            title: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
            author: "James Clear",
            isbn: "9780735211292",
            publisher: "Avery",
            publish_date: "2018-10-16",
            description: "Hướng dẫn thực tế để xây dựng thói quen tốt và phá vỡ thói quen xấu với những thay đổi nhỏ mang lại kết quả đáng kinh ngạc.",
            category: "Self-help",
            language: "en",
            page_count: 320,
            cover_image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=600&fit=crop",
            book_condition: "EXCELLENT",
            location: "Thanh Xuân, Hà Nội",
            owner: {
              name: "Phạm Thị D",
              avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
              rating: 4.7,
              exchanges: 15
            },
            rating: 4.9,
            exchanges: 7,
            views: 167,
            likes: 42,
            tags: ["Self-help", "Productivity", "Habits", "Personal Development"],
            created_at: "2024-01-12T16:45:00Z"
          },
          {
            id: "5",
            title: "Sapiens: Lược Sử Loài Người - Từ Khởi Nguyên Đến Tương Lai",
            author: "Yuval Noah Harari",
            isbn: "9780062316097",
            publisher: "Harper",
            publish_date: "2015-02-10",
            description: "Hành trình lịch sử của loài người từ thuở sơ khai đến kỷ nguyên hiện đại, khám phá cách Homo sapiens thống trị thế giới.",
            category: "Lịch sử",
            language: "vi",
            page_count: 443,
            cover_image_url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
            book_condition: "GOOD",
            location: "Quận 3, TP.HCM",
            owner: {
              name: "Hoàng Văn E",
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
              rating: 4.8,
              exchanges: 21
            },
            rating: 4.6,
            exchanges: 9,
            views: 124,
            likes: 28,
            tags: ["Lịch sử", "Nhân loại", "Khoa học", "Triết học"],
            created_at: "2024-01-05T11:30:00Z"
          },
          {
            id: "6",
            title: "Deep Work: Rules for Focused Success in a Distracted World",
            author: "Cal Newport",
            isbn: "9781455586691",
            publisher: "Grand Central Publishing",
            publish_date: "2016-01-05",
            description: "Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information.",
            category: "Productivity",
            language: "en",
            page_count: 304,
            cover_image_url: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
            book_condition: "NEW",
            location: "Cầu Giấy, Hà Nội",
            owner: {
              name: "Nguyễn Thị F",
              avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
              rating: 4.9,
              exchanges: 27
            },
            rating: 4.7,
            exchanges: 5,
            views: 98,
            likes: 19,
            tags: ["Productivity", "Focus", "Work", "Success"],
            created_at: "2024-01-18T13:20:00Z"
          }
        ];
        setBooks(mockBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = searchTerm === '' || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !filters.category || book.category === filters.category;
    const matchesCondition = !filters.condition || book.book_condition === filters.condition;
    const matchesLanguage = !filters.language || book.language === filters.language;
    const matchesLocation = !filters.location || book.location.includes(filters.location);

    return matchesSearch && matchesCategory && matchesCondition && matchesLanguage && matchesLocation;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'popular':
        return b.views - a.views;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const conditionColors = {
    'NEW': 'bg-gradient-to-r from-green-500 to-emerald-500',
    'EXCELLENT': 'bg-gradient-to-r from-blue-500 to-cyan-500',
    'GOOD': 'bg-gradient-to-r from-amber-500 to-orange-500',
    'FAIR': 'bg-gradient-to-r from-orange-500 to-red-500',
    'POOR': 'bg-gradient-to-r from-red-500 to-pink-500'
  };

  const conditionLabels = {
    'NEW': 'Mới',
    'EXCELLENT': 'Rất tốt',
    'GOOD': 'Tốt',
    'FAIR': 'Khá',
    'POOR': 'Cũ'
  };

  const handleLike = (bookId, e) => {
    e.stopPropagation();
    setLikedBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  const handleBookmark = (bookId, e) => {
    e.stopPropagation();
    setBookmarkedBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  const handleQuickView = (book, e) => {
    e.stopPropagation();
    setSelectedBook(book);
  };

  const handleCardClick = (book, e) => {
    if (e.target.closest('button')) {
      return;
    }
    navigate(`/books/${book.id}`);
  };

  const BookCard = ({ book, layout = 'grid' }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 cursor-pointer group ${
        layout === 'list' ? 'flex' : ''
      }`}
      onClick={(e) => handleCardClick(book, e)}
    >
      <div className={`relative overflow-hidden ${layout === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
        <img
          src={book.cover_image_url}
          alt={book.title}
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            layout === 'list' ? 'h-full w-full' : 'h-64 w-full'
          }`}
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-2 text-white text-sm font-semibold rounded-full shadow-lg ${conditionColors[book.book_condition]}`}>
            {conditionLabels[book.book_condition]}
          </span>
        </div>
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button 
            onClick={(e) => handleQuickView(book, e)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
            title="Xem nhanh"
          >
            <Eye className="w-4 h-4 text-gray-600 hover:text-blue-500" />
          </button>
          <button 
            onClick={(e) => handleLike(book.id, e)}
            className={`p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110 ${
              likedBooks.has(book.id) ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
            title="Thích"
          >
            <Heart className={`w-4 h-4 ${likedBooks.has(book.id) ? 'fill-current' : ''}`} />
          </button>
          <button 
            onClick={(e) => handleBookmark(book.id, e)}
            className={`p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110 ${
              bookmarkedBooks.has(book.id) ? 'text-amber-500' : 'text-gray-600 hover:text-amber-500'
            }`}
            title="Lưu lại"
          >
            <Bookmark className={`w-4 h-4 ${bookmarkedBooks.has(book.id) ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      <div className={`p-6 flex-1 ${layout === 'list' ? 'flex flex-col justify-between' : ''}`}>
        <div>
          <div className="flex items-start justify-between mb-3">
            <h3 className={`font-bold text-gray-900 line-clamp-2 ${
              layout === 'list' ? 'text-xl' : 'text-lg'
            }`}>
              {book.title}
            </h3>
            <div className="flex items-center text-yellow-400 ml-3 flex-shrink-0">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-gray-600 ml-1 text-sm">{book.rating}</span>
            </div>
          </div>

          <p className="text-blue-600 font-medium mb-3">{book.author}</p>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {book.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {book.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {book.tags.length > 3 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                +{book.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{book.location.split(',')[0]}</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{book.views}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <img
                src={book.owner.avatar}
                alt={book.owner.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="text-gray-700 font-medium">{book.owner.name}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const BookDetailModal = ({ book, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative">
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="w-full h-96 object-cover rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-2 text-white text-sm font-semibold rounded-full shadow-lg ${conditionColors[book.book_condition]}`}>
                  {conditionLabels[book.book_condition]}
                </span>
              </div>
            </div>
            
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>
              <p className="text-xl text-blue-600 font-medium mb-6">{book.author}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <BookOpen className="w-5 h-5 mr-3" />
                  <span>{book.page_count} trang</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Languages className="w-5 h-5 mr-3" />
                  <span>{book.language === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3" />
                  <span>{new Date(book.publish_date).getFullYear()}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Hash className="w-5 h-5 mr-3" />
                  <span>{book.isbn}</span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">{book.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {book.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={book.owner.avatar}
                      alt={book.owner.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">{book.owner.name}</div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span>{book.owner.rating} • {book.owner.exchanges} giao dịch</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-gray-600 mb-1">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{book.location}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {book.views} lượt xem • {book.likes} thích
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate(`/books/${book.id}`)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <span>Xem chi tiết</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button className="px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải kho sách...</p>
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
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              BookSwap
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="relative w-96">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm sách, tác giả, thể loại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thể loại</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Tất cả thể loại</option>
                    <option value="Programming">Lập trình</option>
                    <option value="Tiểu thuyết">Tiểu thuyết</option>
                    <option value="Self-help">Self-help</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Lịch sử">Lịch sử</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tình trạng</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Tất cả tình trạng</option>
                    <option value="NEW">Mới</option>
                    <option value="EXCELLENT">Rất tốt</option>
                    <option value="GOOD">Tốt</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ</label>
                  <select
                    value={filters.language}
                    onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Tất cả ngôn ngữ</option>
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="popular">Phổ biến nhất</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-600">
                  Tìm thấy <span className="font-semibold text-blue-600">{sortedBooks.length}</span> cuốn sách
                  {searchTerm && (
                    <span className="ml-2">
                      cho "<span className="font-semibold">{searchTerm}</span>"
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setFilters({ category: '', condition: '', language: '', location: '' });
                    setSearchTerm('');
                    setSortBy('newest');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* View Controls */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kho Sách</h1>
            <p className="text-gray-600 mt-2">
              Khám phá {sortedBooks.length} cuốn sách đang chờ trao đổi
              {likedBooks.size > 0 && (
                <span className="ml-2 text-blue-600">
                  • {likedBooks.size} sách đã thích
                </span>
              )}
              {bookmarkedBooks.size > 0 && (
                <span className="ml-2 text-amber-600">
                  • {bookmarkedBooks.size} sách đã lưu
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Chế độ lưới"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${
                  viewMode === 'list' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Chế độ danh sách"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Books Grid/List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${sortedBooks.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`
              ${viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'flex flex-col space-y-6'
              }
            `}
          >
            {sortedBooks.map((book) => (
              <BookCard key={book.id} book={book} layout={viewMode} />
            ))}
          </motion.div>
        </AnimatePresence>

        {sortedBooks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-3xl shadow-lg border border-gray-100"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sách phù hợp</h3>
            <p className="text-gray-600 mb-6">Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={() => {
                setFilters({ category: '', condition: '', language: '', location: '' });
                setSearchTerm('');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
            >
              Xóa tất cả bộ lọc
            </button>
          </motion.div>
        )}
      </div>

      {/* Book Detail Modal */}
      <AnimatePresence>
        {selectedBook && (
          <BookDetailModal 
            book={selectedBook} 
            onClose={() => setSelectedBook(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BookList;