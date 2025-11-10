import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search,
  BookOpen,
  Library,
  Globe,
  Hash,
  User,
  Star,
  MapPin,
  Plus,
  ArrowRight,
  Filter,
  Grid,
  List,
  X,
  ExternalLink,
  Shield,
  RefreshCw,
  Eye,
  Calendar
} from 'lucide-react';

const SearchBooks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('internal');
  const [activeTab, setActiveTab] = useState('internal');
  const [loading, setLoading] = useState(false);
  const [internalBooks, setInternalBooks] = useState([]);
  const [googleBooks, setGoogleBooks] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    condition: 'all',
    category: 'all',
    language: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Hàm phân biệt user type
  const getUserType = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return token && user ? 'member' : 'guest';
  };

  // Lấy trang trước đó từ state hoặc dựa vào user type
  const getBackLink = () => {
    // Ưu tiên lấy từ state nếu có (khi navigate từ header)
    if (location.state?.from) {
      return location.state.from;
    }
    
    // Nếu không có state, dựa vào user type
    const userType = getUserType();
    return userType === 'member' ? '/my-library' : '/books';
  };

  const getBackLinkText = () => {
    const backLink = getBackLink();
    
    // Dựa vào đường dẫn để hiển thị text phù hợp
    if (backLink === '/my-library') {
      return 'Quay lại thư viện của tôi';
    } else if (backLink === '/books') {
      return 'Quay lại danh sách sách';
    } else if (backLink === '/dashboard') {
      return 'Quay lại dashboard';
    } else if (backLink === '/') {
      return 'Quay lại trang chủ';
    } else if (backLink === '/how-it-works') {
      return 'Quay lại cách hoạt động';
    } else if (backLink === '/exchanges') {
      return 'Quay lại trao đổi';
    } else if (backLink === '/messages') {
      return 'Quay lại chat';
    } else {
      return 'Quay lại trang trước';
    }
  };

  // Mock categories
  const categories = [
    'Programming', 'Fiction', 'Non-Fiction', 'Science', 'Technology',
    'Business', 'Art', 'History', 'Philosophy', 'Self-Help',
    'Education', 'Travel', 'Cooking', 'Health', 'Sports'
  ];

  const conditionOptions = [
    { value: 'all', label: 'Tất cả tình trạng' },
    { value: 'NEW', label: 'Mới', color: 'from-green-500 to-emerald-500' },
    { value: 'EXCELLENT', label: 'Rất tốt', color: 'from-blue-500 to-cyan-500' },
    { value: 'GOOD', label: 'Tốt', color: 'from-amber-500 to-orange-500' },
    { value: 'FAIR', label: 'Khá', color: 'from-orange-500 to-red-500' },
    { value: 'POOR', label: 'Cũ', color: 'from-red-500 to-pink-500' }
  ];

  const languageOptions = [
    { value: 'all', label: 'Tất cả ngôn ngữ' },
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'ja', label: 'Japanese' }
  ];

  // Search function
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    
    try {
      if (activeTab === 'internal') {
        await searchInternalBooks();
      } else {
        await searchGoogleBooks();
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchInternalBooks = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockInternalBooks = Array.from({ length: 8 }, (_, index) => {
      const conditions = ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      return {
        id: `internal-${index}`,
        title: `Sách ${searchQuery} ${index + 1}`,
        author: `Tác giả ${String.fromCharCode(65 + (index % 26))}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        book_condition: randomCondition,
        cover_image_url: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop&ix=${index}`,
        rating: (4 + Math.random() * 1).toFixed(1),
        total_ratings: Math.floor(Math.random() * 100),
        exchanges: Math.floor(Math.random() * 20),
        views: Math.floor(Math.random() * 500),
        location: `Quận ${(index % 12) + 1}, TP.HCM`,
        owner: {
          name: `Người dùng ${index + 1}`,
          verified: Math.random() > 0.3
        },
        isbn: `978${Math.floor(Math.random() * 1000000000)}`,
        description: `Mô tả về sách ${searchQuery} ${index + 1} - một cuốn sách rất hay và hữu ích.`,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
      };
    });

    setInternalBooks(mockInternalBooks);
  };

  const searchGoogleBooks = async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockGoogleBooks = Array.from({ length: 12 }, (_, index) => {
      const hasImage = Math.random() > 0.2;
      return {
        id: `google-${index}`,
        googleBookId: `google_books_id_${index}`,
        title: `${searchQuery} - Google Books Result ${index + 1}`,
        authors: [`Author ${String.fromCharCode(65 + (index % 26))}`],
        publishedDate: `${2000 + (index % 24)}`,
        description: `This is a description from Google Books for "${searchQuery}" result ${index + 1}. This book covers important topics and is highly recommended.`,
        isbn: `978${Math.floor(Math.random() * 1000000000)}`,
        pageCount: Math.floor(Math.random() * 500) + 100,
        categories: [categories[Math.floor(Math.random() * categories.length)]],
        language: ['en', 'vi', 'fr', 'ja'][Math.floor(Math.random() * 4)],
        cover_image_url: hasImage 
          ? `https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop&ix=${index}`
          : null,
        publisher: `Publisher ${index + 1}`,
        averageRating: (3 + Math.random() * 2).toFixed(1),
        ratingsCount: Math.floor(Math.random() * 1000),
        previewLink: `https://books.google.com/books?id=google_books_id_${index}`,
        infoLink: `https://books.google.com/books?id=google_books_id_${index}&source=gbs_api`
      };
    });

    setGoogleBooks(mockGoogleBooks);
  };

  const handleQuickAdd = (googleBook) => {
    const userType = getUserType();
    if (userType === 'guest') {
      navigate('/login', { 
        state: { 
          message: 'Vui lòng đăng nhập để thêm sách vào thư viện',
          returnUrl: '/books/search',
          from: getBackLink() // Giữ lại trang trước đó
        }
      });
      return;
    }

    navigate('/books/add', {
      state: {
        prefillData: {
          google_books_id: googleBook.googleBookId,
          title: googleBook.title,
          author: googleBook.authors?.[0] || '',
          isbn: googleBook.isbn,
          publisher: googleBook.publisher,
          publish_date: googleBook.publishedDate,
          description: googleBook.description,
          category: googleBook.categories?.[0] || '',
          language: googleBook.language,
          page_count: googleBook.pageCount,
          cover_image_url: googleBook.cover_image_url
        },
        from: getBackLink() // Giữ lại trang trước đó
      }
    });
  };

  const searchByISBN = async (isbn) => {
    setSearchQuery(isbn);
    setSearchType('isbn');
    setActiveTab('google');
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockBook = {
        id: 'isbn-result',
        googleBookId: 'special_isbn_id',
        title: `Book Found by ISBN: ${isbn}`,
        authors: ['Author from ISBN'],
        publishedDate: '2023',
        description: `This book was found using ISBN ${isbn}. It's a great book with detailed content.`,
        isbn: isbn,
        pageCount: 300,
        categories: ['Technology'],
        language: 'en',
        cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
        publisher: 'Tech Publisher',
        averageRating: '4.5',
        ratingsCount: 150,
        previewLink: `https://books.google.com/books?id=isbn_${isbn}`,
        infoLink: `https://books.google.com/books?id=isbn_${isbn}&source=gbs_api`
      };

      setGoogleBooks([mockBook]);
    } catch (error) {
      console.error('ISBN search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConditionColor = (condition) => {
    const conditionMap = {
      'NEW': 'from-green-500 to-emerald-500',
      'EXCELLENT': 'from-blue-500 to-cyan-500',
      'GOOD': 'from-amber-500 to-orange-500',
      'FAIR': 'from-orange-500 to-red-500',
      'POOR': 'from-red-500 to-pink-500'
    };
    return conditionMap[condition] || 'from-gray-500 to-gray-600';
  };

  const getConditionLabel = (condition) => {
    const labelMap = {
      'NEW': 'Mới',
      'EXCELLENT': 'Rất tốt',
      'GOOD': 'Tốt',
      'FAIR': 'Khá',
      'POOR': 'Cũ'
    };
    return labelMap[condition] || condition;
  };

  const clearSearch = () => {
    setSearchQuery('');
    setInternalBooks([]);
    setGoogleBooks([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to={getBackLink()}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span>{getBackLinkText()}</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-2xl transition-all ${
                  showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
              
              <div className="flex bg-gray-100 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Tìm Kiếm Sách</h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Tìm kiếm trong thư viện của chúng tôi hoặc khám phá hàng triệu đầu sách từ Google Books
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex space-x-4 mb-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-20 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tiêu đề, tác giả, ISBN..."
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-20 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    type="submit"
                    disabled={!searchQuery.trim() || loading}
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 rounded-r-2xl hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {loading ? 'Đang tìm...' : 'Tìm kiếm'}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick ISBN Search */}
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-gray-600 text-sm flex items-center">
                <Hash className="w-4 h-4 mr-1" />
                Tìm nhanh theo ISBN:
              </span>
              {['9780132350884', '9780201633610', '9780321125217'].map(isbn => (
                <button
                  key={isbn}
                  type="button"
                  onClick={() => searchByISBN(isbn)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-all"
                >
                  {isbn}
                </button>
              ))}
            </div>
          </form>
        </motion.div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-8 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tình trạng sách
                  </label>
                  <select
                    value={filters.condition}
                    onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {conditionOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thể loại
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả thể loại</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngôn ngữ
                  </label>
                  <select
                    value={filters.language}
                    onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {languageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Tabs */}
        {(internalBooks.length > 0 || googleBooks.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 mb-8"
          >
            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-8">
                <button
                  onClick={() => setActiveTab('internal')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-all flex items-center space-x-2 ${
                    activeTab === 'internal'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Library className="w-5 h-5" />
                  <span>Thư viện nội bộ ({internalBooks.length})</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('google')}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-all flex items-center space-x-2 ${
                    activeTab === 'google'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span>Google Books ({googleBooks.length})</span>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {/* Internal Books Results */}
              {activeTab === 'internal' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Kết quả từ thư viện nội bộ
                    </h3>
                    <span className="text-gray-600">{internalBooks.length} sách được tìm thấy</span>
                  </div>

                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {internalBooks.map((book, index) => (
                        <motion.div
                          key={book.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Link
                            to={`/books/${book.id}`}
                            className="block bg-gray-50 rounded-3xl p-4 hover:bg-white hover:shadow-lg transition-all group"
                          >
                            <div className="relative mb-4">
                              <img
                                src={book.cover_image_url}
                                alt={book.title}
                                className="w-full h-48 object-cover rounded-2xl group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute top-3 left-3">
                                <span className={`px-2 py-1 text-xs text-white font-semibold rounded-full bg-gradient-to-r ${getConditionColor(book.book_condition)}`}>
                                  {getConditionLabel(book.book_condition)}
                                </span>
                              </div>
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                              {book.title}
                            </h3>
                            <p className="text-blue-600 text-sm mb-3">{book.author}</p>
                            
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{book.location}</span>
                              </div>
                              <div className="flex items-center text-yellow-400">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-gray-600 ml-1">{book.rating}</span>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {internalBooks.map((book, index) => (
                        <motion.div
                          key={book.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            to={`/books/${book.id}`}
                            className="block bg-gray-50 rounded-3xl p-6 hover:bg-white hover:shadow-lg transition-all group"
                          >
                            <div className="flex items-start space-x-4">
                              <img
                                src={book.cover_image_url}
                                alt={book.title}
                                className="w-24 h-32 object-cover rounded-xl group-hover:scale-105 transition-transform"
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                                      {book.title}
                                    </h3>
                                    <p className="text-blue-600 text-sm">{book.author}</p>
                                  </div>
                                  <span className={`px-3 py-1 text-xs text-white font-semibold rounded-full bg-gradient-to-r ${getConditionColor(book.book_condition)}`}>
                                    {getConditionLabel(book.book_condition)}
                                  </span>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                  {book.description}
                                </p>
                                
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-1">
                                      <MapPin className="w-4 h-4" />
                                      <span>{book.location}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <User className="w-4 h-4" />
                                      <span className="flex items-center">
                                        {book.owner.name}
                                        {book.owner.verified && <Shield className="w-3 h-3 text-green-500 ml-1" />}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4">
                                    <div className="flex items-center text-yellow-400">
                                      <Star className="w-4 h-4 fill-current" />
                                      <span className="text-gray-600 ml-1">{book.rating}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <RefreshCw className="w-4 h-4" />
                                      <span>{book.exchanges} trao đổi</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Google Books Results */}
              {activeTab === 'google' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Kết quả từ Google Books
                    </h3>
                    <span className="text-gray-600">{googleBooks.length} sách được tìm thấy</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {googleBooks.map((book, index) => (
                      <motion.div
                        key={book.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-3xl p-6 hover:bg-white hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-start space-x-4 mb-4">
                          {book.cover_image_url ? (
                            <img
                              src={book.cover_image_url}
                              alt={book.title}
                              className="w-20 h-28 object-cover rounded-xl group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-20 h-28 bg-gray-200 rounded-xl flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                              {book.title}
                            </h3>
                            <p className="text-blue-600 text-sm mb-1">
                              {book.authors?.join(', ')}
                            </p>
                            <p className="text-gray-600 text-xs">
                              {book.publishedDate} • {book.pageCount} trang
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {book.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center space-x-1">
                            <Hash className="w-4 h-4" />
                            <span>{book.isbn}</span>
                          </div>
                          {book.averageRating && (
                            <div className="flex items-center text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-gray-600 ml-1">{book.averageRating}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuickAdd(book)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-medium text-sm flex items-center justify-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Thêm nhanh</span>
                          </button>
                          
                          <a
                            href={book.infoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && internalBooks.length === 0 && googleBooks.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-600 mb-6">
              Không có sách phù hợp với từ khóa "<strong>{searchQuery}</strong>". Hãy thử tìm kiếm với từ khóa khác.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={clearSearch}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all"
              >
                Xóa tìm kiếm
              </button>
              <Link
                to={getUserType() === 'member' ? '/books/add' : '/login'}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>{getUserType() === 'member' ? 'Thêm sách mới' : 'Đăng nhập để thêm sách'}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchBooks;