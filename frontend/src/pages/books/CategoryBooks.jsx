import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  BookOpen,
  Filter,
  Grid,
  List,
  Star,
  MapPin,
  User,
  Shield,
  Calendar,
  Eye,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Hash
} from 'lucide-react';

const CategoryBooks = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const limit = 12;

  // Mock categories for demonstration
  const categories = {
    'programming': 'Lập trình',
    'fiction': 'Tiểu thuyết',
    'non-fiction': 'Phi hư cấu',
    'science': 'Khoa học',
    'technology': 'Công nghệ',
    'business': 'Kinh doanh',
    'art': 'Nghệ thuật',
    'history': 'Lịch sử',
    'philosophy': 'Triết học',
    'self-help': 'Tự lực',
    'education': 'Giáo dục',
    'travel': 'Du lịch',
    'cooking': 'Nấu ăn',
    'health': 'Sức khỏe',
    'sports': 'Thể thao'
  };

  const conditionOptions = [
    { value: 'all', label: 'Tất cả tình trạng' },
    { value: 'NEW', label: 'Mới', color: 'from-green-500 to-emerald-500' },
    { value: 'EXCELLENT', label: 'Rất tốt', color: 'from-blue-500 to-cyan-500' },
    { value: 'GOOD', label: 'Tốt', color: 'from-amber-500 to-orange-500' },
    { value: 'FAIR', label: 'Khá', color: 'from-orange-500 to-red-500' },
    { value: 'POOR', label: 'Cũ', color: 'from-red-500 to-pink-500' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'popular', label: 'Phổ biến nhất' },
    { value: 'exchanges', label: 'Nhiều trao đổi nhất' }
  ];

  // Fetch books by category
  useEffect(() => {
    const fetchCategoryBooks = async () => {
      try {
        setLoading(true);
        
        // Simulate API call with query params
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString()
        });

        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Mock data based on category
        const mockBooks = Array.from({ length: limit }, (_, index) => {
          const conditions = ['NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
          const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
          
          return {
            id: `book-${category}-${index}`,
            title: `Sách ${categories[category] || category} ${index + 1}`,
            author: `Tác giả ${String.fromCharCode(65 + (index % 26))}`,
            category: category,
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
            created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
          };
        });

        // Filter based on search and condition
        let filteredBooks = mockBooks;
        
        if (searchQuery) {
          filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        
        if (conditionFilter !== 'all') {
          filteredBooks = filteredBooks.filter(book => 
            book.book_condition === conditionFilter
          );
        }
        
        // Sort books
        filteredBooks.sort((a, b) => {
          switch (sortBy) {
            case 'newest':
              return new Date(b.created_at) - new Date(a.created_at);
            case 'oldest':
              return new Date(a.created_at) - new Date(b.created_at);
            case 'rating':
              return parseFloat(b.rating) - parseFloat(a.rating);
            case 'popular':
              return b.views - a.views;
            case 'exchanges':
              return b.exchanges - a.exchanges;
            default:
              return 0;
          }
        });

        setBooks(filteredBooks);
        setTotalPages(Math.ceil(filteredBooks.length / limit));
      } catch (error) {
        console.error('Error fetching category books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryBooks();
  }, [category, currentPage, searchQuery, conditionFilter, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    // Search is handled in the useEffect
  };

  const handleConditionFilter = (condition) => {
    setConditionFilter(condition);
    setCurrentPage(1);
  };

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    setCurrentPage(1);
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

  if (loading && books.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link 
                to="/books"
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại danh sách</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Loading */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Đang tải sách {categories[category] || category}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/books"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại danh sách</span>
            </Link>
            
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Hash className="w-4 h-4" />
              <span>Danh mục: {categories[category] || category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-blue-100 rounded-2xl">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {categories[category] || category}
                </h1>
                <p className="text-gray-600 text-lg">
                  Khám phá {books.length} quyển sách {categories[category] ? `về ${categories[category].toLowerCase()}` : `trong danh mục ${category}`}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{books.length}</div>
              <div className="text-gray-600">sách có sẵn</div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tìm kiếm sách trong danh mục..."
                />
              </div>
            </form>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* View Mode */}
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

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition Filters */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            {conditionOptions.map(condition => (
              <button
                key={condition.value}
                onClick={() => handleConditionFilter(condition.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  conditionFilter === condition.value
                    ? condition.value === 'all' 
                      ? 'bg-blue-600 text-white'
                      : `text-white bg-gradient-to-r ${condition.color}`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {condition.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Books Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {books.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sách</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || conditionFilter !== 'all' 
                  ? 'Không có sách phù hợp với bộ lọc của bạn'
                  : `Hiện không có sách nào trong danh mục ${categories[category] || category}`
                }
              </p>
              {(searchQuery || conditionFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setConditionFilter('all');
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={`/books/${book.id}`}
                    className="block bg-white rounded-3xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
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
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
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
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-gray-600 ml-1 text-sm">{book.rating}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <RefreshCw className="w-3 h-3" />
                          <span>{book.exchanges}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{book.views}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={`/books/${book.id}`}
                    className="block bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
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
                          {book.description || `Sách ${categories[category] || category} chất lượng cao`}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(book.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-gray-600 ml-1">{book.rating}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RefreshCw className="w-4 h-4" />
                              <span>{book.exchanges} trao đổi</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{book.views} lượt xem</span>
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
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center items-center space-x-2"
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-2xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-2xl font-semibold transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-2xl border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CategoryBooks;