import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  Filter,
  Globe,
  Grid,
  Hash,
  List,
  Plus,
  Search,
  Star,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { searchGoogleBooks as apiSearchGoogleBooks } from '../../services/booksApi';

const SearchBooks = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleBooks, setGoogleBooks] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: 'all',
    language: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock categories
  const categories = [
    'Programming',
    'Fiction',
    'Non-Fiction',
    'Science',
    'Technology',
    'Business',
    'Art',
    'History',
    'Philosophy',
    'Self-Help',
    'Education',
    'Travel',
    'Cooking',
    'Health',
    'Sports',
  ];

  const languageOptions = [
    { value: 'all', label: 'Tất cả ngôn ngữ' },
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'ja', label: 'Japanese' },
  ];

  // Normalize backend/google book item to UI-friendly shape
  const normalizeBook = (b) => {
    if (!b) return null;

    // ISBN: backend may return `isbn` or Google-like `industryIdentifiers`
    let isbn = b.isbn || '';
    if (
      !isbn &&
      b.industryIdentifiers &&
      Array.isArray(b.industryIdentifiers)
    ) {
      const found = b.industryIdentifiers.find((i) =>
        /ISBN/.test(i.type || ''),
      );
      if (found) isbn = found.identifier;
    }

    // Collect image links (if backend returns Google Books style imageLinks)
    const imageLinks = {
      extraLarge: b.imageLinks?.extraLarge || b.imageLinks?.extra_large || null,
      large: b.imageLinks?.large || null,
      medium: b.imageLinks?.medium || null,
      thumbnail: b.imageLinks?.thumbnail || null,
      smallThumbnail:
        b.imageLinks?.smallThumbnail || b.imageLinks?.small || null,
    };

    // Choose best available cover image: extraLarge > large > medium > thumbnail > smallThumbnail > fallback
    const cover =
      imageLinks.extraLarge ||
      imageLinks.large ||
      imageLinks.medium ||
      imageLinks.thumbnail ||
      imageLinks.smallThumbnail ||
      b.cover_image_url ||
      '';

    return {
      id:
        b.id ||
        b.book_id ||
        b.google_books_id ||
        isbn ||
        Math.random().toString(36).slice(2, 9),
      googleBookId: b.id || b.google_books_id || b.googleBookId || null,
      title: b.title || b.volumeInfo?.title || 'Untitled',
      authors: b.authors || b.volumeInfo?.authors || [],
      publisher: b.publisher || b.volumeInfo?.publisher || '',
      publishedDate: b.publishedDate || b.volumeInfo?.publishedDate || '',
      description: b.description || b.volumeInfo?.description || '',
      isbn,
      pageCount: b.pageCount || b.volumeInfo?.pageCount || 0,
      categories: b.categories || b.volumeInfo?.categories || [],
      language: b.language || b.volumeInfo?.language || '',
      cover_image_url: cover,
      imageLinks,
      averageRating: b.averageRating || b.volumeInfo?.averageRating || null,
      ratingsCount: b.ratingsCount || b.volumeInfo?.ratingsCount || 0,
      previewLink: b.previewLink || b.volumeInfo?.previewLink || '',
      infoLink: b.infoLink || b.volumeInfo?.infoLink || '',
    };
  };

  // Search function (calls backend endpoint that proxies Google Books)
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const maxResults = 20;
      const results = await apiSearchGoogleBooks(searchQuery, maxResults);

      let items = Array.isArray(results) ? results : [];

      // Normalize each book item
      items = items.map(normalizeBook).filter(Boolean);

      // Apply client-side filters
      if (filters.language && filters.language !== 'all') {
        items = items.filter(
          (b) =>
            (b.language || '').toLowerCase() === filters.language.toLowerCase(),
        );
      }
      if (filters.category && filters.category !== 'all') {
        items = items.filter((b) =>
          (b.categories || []).some(
            (c) => c && c.toLowerCase() === filters.category.toLowerCase(),
          ),
        );
      }

      setGoogleBooks(items);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (googleBook) => {
    // Navigate to AddBook with pre-filled data
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
          cover_image_url: googleBook.cover_image_url,
        },
      },
    });
  };

  const searchByISBN = async (isbn) => {
    setSearchQuery(isbn);

    setLoading(true);
    try {
      // Simulate ISBN search
      await new Promise((resolve) => setTimeout(resolve, 500));

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
        cover_image_url:
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
        publisher: 'Tech Publisher',
        averageRating: '4.5',
        ratingsCount: 150,
        previewLink: `https://books.google.com/books?id=isbn_${isbn}`,
        infoLink: `https://books.google.com/books?id=isbn_${isbn}&source=gbs_api`,
      };

      setGoogleBooks([mockBook]);
    } catch (error) {
      console.error('ISBN search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setGoogleBooks([]);
  };

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
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span>Quay lại danh sách</span>
            </Link>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-2xl transition-all ${
                  showFilters
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Tìm Kiếm Sách
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Khám phá hàng triệu đầu sách từ Google Books và thêm vào thư viện
              của bạn
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
              {['9780132350884', '9780201633610', '9780321125217'].map(
                (isbn) => (
                  <button
                    key={isbn}
                    type="button"
                    onClick={() => searchByISBN(isbn)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-all"
                  >
                    {isbn}
                  </button>
                ),
              )}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thể loại
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tất cả thể loại</option>
                    {categories.map((category) => (
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
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {languageOptions.map((option) => (
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

        {/* Results */}
        {googleBooks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 mb-8"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Globe className="w-6 h-6 mr-2 text-blue-600" />
                  Kết quả từ Google Books
                </h3>
                <span className="text-gray-600">
                  {googleBooks.length} sách được tìm thấy
                </span>
              </div>

              {viewMode === 'grid' ? (
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
                            <span className="text-gray-600 ml-1">
                              {book.averageRating}
                            </span>
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
                          title="Xem trên Google Books"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {googleBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-50 rounded-3xl p-6 hover:bg-white hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start space-x-6">
                        {book.cover_image_url ? (
                          <img
                            src={book.cover_image_url}
                            alt={book.title}
                            className="w-24 h-32 object-cover rounded-xl group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-24 h-32 bg-gray-200 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                                {book.title}
                              </h3>
                              <p className="text-blue-600 text-sm mb-2">
                                {book.authors?.join(', ')}
                              </p>
                              <p className="text-gray-600 text-sm mb-3">
                                {book.publishedDate} • {book.pageCount} trang •{' '}
                                {book.publisher}
                              </p>
                            </div>

                            {book.averageRating && (
                              <div className="flex items-center text-yellow-400 bg-white px-3 py-1 rounded-full">
                                <Star className="w-4 h-4 fill-current" />
                                <span className="text-gray-700 ml-1 text-sm font-medium">
                                  {book.averageRating}
                                </span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {book.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Hash className="w-4 h-4" />
                                <span>{book.isbn}</span>
                              </div>
                              {book.categories && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                  {book.categories[0]}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleQuickAdd(book)}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-medium text-sm flex items-center space-x-2"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Thêm nhanh</span>
                              </button>

                              <a
                                href={book.infoLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                                title="Xem trên Google Books"
                              >
                                google_books_id: googleBook.googleBookId ||
                                googleBook.id,
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && googleBooks.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-12 text-center shadow-lg border border-gray-100"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-gray-600 mb-6">
              Không có sách phù hợp với từ khóa "<strong>{searchQuery}</strong>
              ". Hãy thử tìm kiếm với từ khóa khác.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={clearSearch}
                className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all"
              >
                Xóa tìm kiếm
              </button>
              <Link
                to="/books/add"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Thêm sách mới</span>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SearchBooks;
