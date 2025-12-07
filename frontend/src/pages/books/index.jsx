// src/pages/books/index.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from "../../components/layout/Layout";
import BookCard from '../../components/books/BookCard';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { useBooks } from '../../hooks/useBooks';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Star,
  MapPin,
  X,
  RefreshCw,
  Sparkles,
  ChevronDown,
  BookMarked
} from 'lucide-react';

const Books = () => {
  const { getBooks, loading: hookLoading, error: hookError } = useBooks();
  const [allBooks, setAllBooks] = useState([]); // Tất cả sách từ API
  const [filteredBooks, setFilteredBooks] = useState([]); // Sách sau khi filter
  const [meta, setMeta] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    category: '',
    condition: '',
    sort_by: 'created_at',
    order: 'DESC'
  });
  const [localError, setLocalError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  
  // Categories for filter - lấy từ data thực tế
  const categories = [
    'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History',
    'Business', 'Self-Help', 'Manga', 'Light Novel', 'Programming',
    'Văn học', 'Kinh tế', 'Khoa học', 'Công nghệ', 'Tâm lý'
  ];
  
  // Conditions for filter - match với database
  const conditions = [
    { value: 'NEW', label: 'Mới', color: 'bg-pink-100 text-pink-700' },
    { value: 'LIKE_NEW', label: 'Như mới', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'VERY_GOOD', label: 'Rất tốt', color: 'bg-green-100 text-green-700' },
    { value: 'GOOD', label: 'Tốt', color: 'bg-blue-100 text-blue-700' },
    { value: 'FAIR', label: 'Khá', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'POOR', label: 'Kém', color: 'bg-red-100 text-red-700' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'created_at_DESC', label: 'Mới nhất' },
    { value: 'created_at_ASC', label: 'Cũ nhất' },
    { value: 'title_ASC', label: 'Tên A-Z' },
    { value: 'title_DESC', label: 'Tên Z-A' }
  ];

  // Helper function để lấy condition label
  const getConditionInfo = (conditionValue) => {
    return conditions.find(c => c.value === conditionValue) || { label: conditionValue, color: 'bg-gray-100 text-gray-700' };
  };
  
  // ✅ Sửa: Thêm ref để lưu trữ getBooks ổn định
  const getBooksRef = useRef(getBooks);
  getBooksRef.current = getBooks;

  // ✅ Sửa: Thêm ref để ngăn chặn trùng lặp
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const lastSearchRef = useRef('');

  // ========== FETCH ALL BOOKS FROM API ==========
  const fetchBooks = useCallback(async (searchTerm = '') => {
    // Ngăn chặn gọi trùng lặp
    if (isFetchingRef.current) {
      console.log('⏸️ Skip duplicate API call - already fetching');
      return;
    }

    // Chỉ fetch lại khi search term thay đổi
    if (searchTerm === lastSearchRef.current && allBooks.length > 0) {
      console.log('⏸️ Skip API call - same search, use cached data');
      return;
    }

    try {
      console.log('🔄 START fetchBooks with search:', searchTerm);
      isFetchingRef.current = true;
      lastSearchRef.current = searchTerm;
      setLocalError(null);
      setLocalLoading(true);
      
      // Hủy request cũ nếu có
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      
      // Fetch nhiều sách hơn để filter ở client
      const result = await getBooksRef.current({
        page: 1,
        limit: 100, // Fetch nhiều để filter
        search: searchTerm
      });
      
      console.log('📚 Books API result:', result);
      
      let booksArray = [];
      if (result) {
        if (Array.isArray(result.data)) {
          booksArray = result.data;
        } else if (Array.isArray(result)) {
          booksArray = result;
        } else if (result.books && Array.isArray(result.books)) {
          booksArray = result.books;
        } else if (result.items && Array.isArray(result.items)) {
          booksArray = result.items;
        }
      }
      
      setAllBooks(booksArray);
      console.log('✅ Loaded', booksArray.length, 'books');
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('⏹️ Request aborted');
        return;
      }
      console.error('❌ Failed to fetch books:', err);
      setAllBooks([]);
      setLocalError(err.message || 'Không thể tải danh sách sách');
    } finally {
      isFetchingRef.current = false;
      setLocalLoading(false);
    }
  }, []);

  // ========== FILTER & SORT BOOKS LOCALLY ==========
  useEffect(() => {
    let result = [...allBooks];
    
    // Filter by category
    if (filters.category) {
      result = result.filter(book => 
        book.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    // Filter by condition - match với book_condition
    if (filters.condition) {
      result = result.filter(book => {
        const bookCondition = book.book_condition || book.condition;
        return bookCondition === filters.condition;
      });
    }
    
    // Sort
    result.sort((a, b) => {
      const { sort_by, order } = filters;
      let valueA, valueB;
      
      if (sort_by === 'title') {
        valueA = a.title?.toLowerCase() || '';
        valueB = b.title?.toLowerCase() || '';
      } else {
        valueA = new Date(a.created_at || 0).getTime();
        valueB = new Date(b.created_at || 0).getTime();
      }
      
      if (order === 'ASC') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    // Calculate pagination
    const total = result.length;
    const totalPages = Math.ceil(total / filters.limit);
    const startIndex = (filters.page - 1) * filters.limit;
    const paginatedResult = result.slice(startIndex, startIndex + filters.limit);
    
    setFilteredBooks(paginatedResult);
    setMeta({
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages
    });
    
  }, [allBooks, filters.category, filters.condition, filters.sort_by, filters.order, filters.page, filters.limit]);

  // ========== INITIAL LOAD & SEARCH ==========
  useEffect(() => {
    fetchBooks(filters.search);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters.search, fetchBooks]);

  const handleSearch = useCallback((searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  }, []);

  const handlePageChange = useCallback((page) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleRetry = useCallback(() => {
    lastSearchRef.current = ''; // Reset để force fetch lại
    fetchBooks(filters.search);
  }, [filters.search, fetchBooks]);

  const handleClearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '', page: 1 }));
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setFilters(prev => ({ ...prev, category, page: 1 }));
  }, []);

  const handleConditionChange = useCallback((condition) => {
    setFilters(prev => ({ ...prev, condition, page: 1 }));
  }, []);

  const handleSortChange = useCallback((sortValue) => {
    const [sort_by, order] = sortValue.split('_');
    setFilters(prev => ({ ...prev, sort_by, order, page: 1 }));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 12,
      search: '',
      category: '',
      condition: '',
      sort_by: 'created_at',
      order: 'DESC'
    });
  }, []);

  const hasActiveFilters = filters.search || filters.category || filters.condition;

  // Get unique categories from actual books data
  const availableCategories = useMemo(() => {
    const cats = new Set(allBooks.map(b => b.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [allBooks]);

  // Get unique conditions from actual books data
  const availableConditions = useMemo(() => {
    const conds = new Set(allBooks.map(b => b.book_condition || b.condition).filter(Boolean));
    return conditions.filter(c => conds.has(c.value));
  }, [allBooks]);

  // Hiển thị error từ hook hoặc local error
  const displayError = hookError || localError;
  // Hiển thị loading từ cả hook và local
  const isLoading = hookLoading || localLoading;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium">Khám phá hàng nghìn cuốn sách</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Tìm cuốn sách 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                bạn yêu thích
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Khám phá kho sách đa dạng từ cộng đồng BookSwap. Tìm kiếm, trao đổi và kết nối với những người yêu sách.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm theo tên sách, tác giả, ISBN..."
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-gray-800 placeholder-gray-400 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30 text-lg"
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {filters.search && (
                  <button 
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            {meta.total > 0 && (
              <div className="flex flex-wrap justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-semibold">{meta.total.toLocaleString()}</span>
                  <span className="text-white/70">cuốn sách</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-white/70">Cập nhật liên tục</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left - Filter toggles */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Filter toggle button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    showFilters || hasActiveFilters
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Bộ lọc
                  {hasActiveFilters && (
                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  )}
                </button>

                {/* Category pills - show popular ones */}
                <div className="hidden md:flex items-center gap-2">
                  {['Văn học', 'Kinh tế', 'Công nghệ'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(filters.category === cat ? '' : cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        filters.category === cat
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAllFilters}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Xóa bộ lọc
                  </button>
                )}
              </div>

              {/* Right - View mode & Sort */}
              <div className="flex items-center gap-3">
                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={`${filters.sort_by}_${filters.order}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-gray-100 text-gray-700 pl-4 pr-10 py-2.5 rounded-xl font-medium cursor-pointer hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>

                {/* View mode toggle */}
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>

                {/* Add book button */}
                <Link
                  to="/books/add-book"
                  className="hidden sm:inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  Thêm sách
                </Link>
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thể loại {availableCategories.length > 0 && `(${availableCategories.length})`}
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Tất cả thể loại</option>
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Condition Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tình trạng sách {availableConditions.length > 0 && `(${availableConditions.length})`}
                    </label>
                    <select
                      value={filters.condition}
                      onChange={(e) => handleConditionChange(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Tất cả tình trạng</option>
                      {availableConditions.map((cond) => (
                        <option key={cond.value} value={cond.value}>{cond.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Results per page */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hiển thị</label>
                    <select
                      value={filters.limit}
                      onChange={(e) => setFilters(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value={12}>12 sách / trang</option>
                      <option value={24}>24 sách / trang</option>
                      <option value={48}>48 sách / trang</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-gray-500">Đang lọc:</span>
              {filters.search && (
                <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <Search className="h-3.5 w-3.5" />
                  "{filters.search}"
                  <button onClick={handleClearSearch} className="ml-1 hover:text-indigo-900">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  <BookMarked className="h-3.5 w-3.5" />
                  {filters.category}
                  <button onClick={() => handleCategoryChange('')} className="ml-1 hover:text-purple-900">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
              {filters.condition && (
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getConditionInfo(filters.condition).color}`}>
                  <Star className="h-3.5 w-3.5" />
                  {getConditionInfo(filters.condition).label}
                  <button onClick={() => handleConditionChange('')} className="ml-1 hover:opacity-70">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Error Display */}
          {displayError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold text-lg">Lỗi tải dữ liệu</h3>
                  <p className="text-red-600 mt-1">{displayError}</p>
                  <button 
                    onClick={handleRetry}
                    className="mt-3 inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Thử lại
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
                <BookOpen className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-indigo-600" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Đang tải sách...</p>
            </div>
          )}

          {/* Content */}
          {!isLoading && (
            <>
              {filteredBooks.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {hasActiveFilters ? 'Không tìm thấy sách phù hợp' : 'Chưa có sách trong hệ thống'}
                  </h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    {hasActiveFilters 
                      ? 'Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm' 
                      : 'Hãy là người đầu tiên thêm sách và chia sẻ với cộng đồng BookSwap'
                    }
                  </p>
                  {hasActiveFilters ? (
                    <button 
                      onClick={handleClearAllFilters}
                      className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      <X className="h-5 w-5" />
                      Xóa bộ lọc
                    </button>
                  ) : (
                    <Link 
                      to="/books/add-book" 
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                      Thêm sách đầu tiên
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  {/* Results Header */}
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                      Hiển thị <span className="font-semibold text-gray-900">{filteredBooks.length}</span> sách
                      {meta.total && (
                        <span> trên tổng số <span className="font-semibold text-gray-900">{meta.total}</span></span>
                      )}
                      {meta.page && meta.totalPages > 1 && (
                        <span className="text-gray-400"> • Trang {meta.page}/{meta.totalPages}</span>
                      )}
                    </p>
                  </div>

                  {/* Books Grid/List */}
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                      {filteredBooks.map(book => (
                        <BookCard 
                          key={book.book_id || book.id} 
                          book={book}
                          showOwner
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 mb-8">
                      {filteredBooks.map(book => {
                        const bookCondition = book.book_condition || book.condition;
                        const conditionInfo = getConditionInfo(bookCondition);
                        return (
                          <Link 
                            key={book.book_id || book.id}
                            to={`/books/${book.book_id || book.id}`}
                            className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
                          >
                            <div className="w-24 h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                              <img 
                                src={book.cover_image_url || `https://via.placeholder.com/96x128/6366F1/FFFFFF?text=${encodeURIComponent(book.title?.substring(0,10) || 'Book')}`}
                                alt={book.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                                {book.title}
                              </h3>
                              <p className="text-gray-500 mt-1">{book.author || 'Không rõ tác giả'}</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {book.category && (
                                  <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                                    <BookMarked className="h-3 w-3" />
                                    {book.category}
                                  </span>
                                )}
                                {bookCondition && (
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${conditionInfo.color}`}>
                                    <Star className="h-3 w-3" />
                                    {conditionInfo.label}
                                  </span>
                                )}
                                {book.owner?.location && (
                                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs">
                                    <MapPin className="h-3 w-3" />
                                    {book.owner.location}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {meta.totalPages > 1 && (
                    <div className="flex justify-center">
                      <Pagination
                        currentPage={meta.page || 1}
                        totalPages={meta.totalPages}
                        onPageChange={handlePageChange}
                        showInfo
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Mobile Add Book FAB */}
          <Link
            to="/books/add-book"
            className="fixed bottom-6 right-6 sm:hidden w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors z-50"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Books;