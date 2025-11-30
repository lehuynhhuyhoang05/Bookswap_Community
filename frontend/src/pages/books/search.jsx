// src/pages/books/search.jsx
import { Globe, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookCard from '../../components/books/BookCard';
import BookCategoriesSelect from '../../components/books/BookCategoriesSelect';
import BookConditionSelect from '../../components/books/BookConditionSelect';
import Layout from '../../components/layout/Layout';
import { LoadingSpinner } from '../../components/ui';
import Pagination from '../../components/ui/Pagination';
import Tabs from '../../components/ui/Tabs';
import { useBooks } from '../../hooks/useBooks';

const SearchBooks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    searchBooks,
    advancedSearch,
    searchGoogleBooks,
    searchWantedBooks,
    getAvailableRegions,
    loading,
    error,
  } = useBooks();
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({});
  const [searchMode, setSearchMode] = useState('basic'); // 'basic', 'advanced', 'google', 'wanted'
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [regions, setRegions] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: searchParams.get('category') || '',
    // Advanced search filters
    title: '',
    author: '',
    isbn: '',
    region: '',
    condition: '',
    sort_by: 'created_at',
    order: 'DESC',
  });
  const [googleBooksLoading, setGoogleBooksLoading] = useState(false);

  useEffect(() => {
    if (searchMode === 'advanced') {
      fetchRegions();
    }
  }, [searchMode]);

  const fetchRegions = async () => {
    try {
      const result = await getAvailableRegions();
      setRegions(result.regions || []);
    } catch (err) {
      console.error('Failed to fetch regions:', err);
    }
  };

  const fetchBooks = async () => {
    try {
      let result;

      switch (searchMode) {
        case 'basic':
          // Basic Search - cần search term hoặc category
          if (!searchTerm && !filters.category) {
            setBooks([]);
            setMeta({});
            return;
          }
          result = await searchBooks(searchTerm, {
            category: filters.category || undefined,
            page: filters.page,
            limit: filters.limit,
          });
          break;

        case 'advanced':
          // Advanced Search - có thể search với nhiều filters
          if (
            !filters.title &&
            !filters.author &&
            !filters.isbn &&
            !filters.category &&
            !filters.region &&
            !filters.condition
          ) {
            setBooks([]);
            setMeta({});
            return;
          }
          result = await advancedSearch({
            title: filters.title || undefined,
            author: filters.author || undefined,
            isbn: filters.isbn || undefined,
            category: filters.category || undefined,
            region: filters.region || undefined,
            condition: filters.condition || undefined,
            sort_by: filters.sort_by,
            order: filters.order,
            page: filters.page,
            limit: filters.limit,
          });
          break;

        case 'wanted':
          // Wanted Books Search
          if (!searchTerm && !filters.category) {
            setBooks([]);
            setMeta({});
            return;
          }
          result = await searchWantedBooks(searchTerm, {
            category: filters.category || undefined,
            page: filters.page,
            limit: filters.limit,
          });
          break;

        default:
          return;
      }

      setBooks(result.data || []);
      setMeta({ ...result.meta, source: searchMode });
    } catch (err) {
      console.error(`Failed to search books (${searchMode}):`, err);
      setBooks([]);
      setMeta({});
    }
  };

  useEffect(() => {
    if (searchMode !== 'google') {
      fetchBooks();
    }
  }, [
    searchMode,
    searchTerm,
    filters.page,
    filters.category,
    filters.title,
    filters.author,
    filters.isbn,
    filters.region,
    filters.condition,
    filters.sort_by,
    filters.order,
  ]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (searchMode === 'google') {
      handleSearchGoogleBooks();
    } else {
      setFilters((prev) => ({
        ...prev,
        page: 1,
      }));
      updateURL({ q: searchTerm, page: 1 });
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));
    updateURL({ q: '', page: 1 });
    setBooks([]);
    setMeta({});
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
    updateURL({ [key]: value, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
    updateURL({ page });
  };

  const updateURL = (params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const handleSearchGoogleBooks = async () => {
    if (!searchTerm) return;

    setGoogleBooksLoading(true);
    try {
      const result = await searchGoogleBooks({
        query: searchTerm,
        maxResults: 12,
      });

      console.log('📗 Google Books API result:', result);

      // Backend đã transform data, trả về array trực tiếp
      const googleItems = Array.isArray(result) ? result : [];

      const transformedBooks = googleItems.map((item) => ({
        book_id: item.id,
        title: item.title || 'Unknown Title',
        author: item.authors?.join(', ') || 'Unknown Author',
        isbn: item.isbn || '',
        category: 'Google Books',
        cover_image_url:
          item.imageLinks?.thumbnail || item.imageLinks?.smallThumbnail || '',
        description: item.description || '',
        published_date: item.publishedDate || '',
        publisher: item.publisher || '',
        isGoogleBook: true,
      }));

      setBooks(transformedBooks);
      setMeta({
        total: transformedBooks.length,
        page: 1,
        limit: 12,
        totalPages: 1,
        query: searchTerm,
        source: 'google',
      });

      console.log(
        '📚 Transformed books:',
        transformedBooks.length,
        transformedBooks,
      );
    } catch (err) {
      console.error('Failed to search Google Books:', err);
    } finally {
      setGoogleBooksLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    const clearedFilters = {
      category: '',
      title: '',
      author: '',
      isbn: '',
      region: '',
      condition: '',
      sort_by: 'created_at',
      order: 'DESC',
      page: 1,
      limit: 12,
    };
    setFilters((prev) => ({ ...prev, ...clearedFilters }));
    setSearchParams(new URLSearchParams());
    setBooks([]);
    setMeta({});
  };

  const renderFilters = () => {
    return (
      <>
        {/* Category Filter - Available for all modes except Google */}
        {searchMode !== 'google' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
            </label>
            <BookCategoriesSelect
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
            />
          </div>
        )}

        {/* Advanced Search Filters */}
        {searchMode === 'advanced' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sách
              </label>
              <input
                type="text"
                value={filters.title}
                onChange={(e) => handleFilterChange('title', e.target.value)}
                placeholder="Nhập tên sách..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tác giả
              </label>
              <input
                type="text"
                value={filters.author}
                onChange={(e) => handleFilterChange('author', e.target.value)}
                placeholder="Nhập tên tác giả..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ISBN
              </label>
              <input
                type="text"
                value={filters.isbn}
                onChange={(e) => handleFilterChange('isbn', e.target.value)}
                placeholder="Nhập ISBN..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vùng
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả vùng</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tình trạng
              </label>
              <BookConditionSelect
                value={filters.condition}
                onChange={(value) => handleFilterChange('condition', value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sắp xếp theo
              </label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created_at">Ngày thêm</option>
                <option value="title">Tên sách</option>
                <option value="author">Tác giả</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thứ tự
              </label>
              <select
                value={filters.order}
                onChange={(e) => handleFilterChange('order', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DESC">Giảm dần</option>
                <option value="ASC">Tăng dần</option>
              </select>
            </div>
          </>
        )}

        {/* Clear Filters Button */}
        <button
          onClick={clearFilters}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded text-sm font-medium"
        >
          Xóa bộ lọc
        </button>
      </>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Tìm kiếm sách
          </h1>

          {/* Search Mode Tabs */}
          <Tabs
            tabs={[
              { id: 'basic', name: 'Tìm kiếm cơ bản' },
              { id: 'advanced', name: 'Tìm kiếm nâng cao' },
              { id: 'wanted', name: 'Sách được yêu cầu' },
              { id: 'google', name: 'Google Books' },
            ]}
            activeTab={searchMode}
            onTabChange={(mode) => {
              setSearchMode(mode);
              setBooks([]);
              setMeta({});
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Bộ lọc</h3>

                <div className="space-y-4">{renderFilters()}</div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Search Bar - Show for basic, wanted, and google modes */}
              {(searchMode === 'basic' ||
                searchMode === 'wanted' ||
                searchMode === 'google') && (
                <div className="mb-6">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      type="text"
                      placeholder={
                        searchMode === 'google'
                          ? 'Tìm sách trên Google Books...'
                          : searchMode === 'wanted'
                            ? 'Tìm sách được yêu cầu...'
                            : 'Tìm sách theo tên, tác giả...'
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={searchMode === 'google' && googleBooksLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}
              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <>
                  {/* Results Count */}
                  {books.length > 0 && (
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-gray-600">
                        Tìm thấy{' '}
                        <span className="font-semibold">
                          {meta.total || books.length}
                        </span>{' '}
                        kết quả{' '}
                        {meta.source === 'google' && '(từ Google Books)'}
                      </div>
                      {meta.source === 'google' && (
                        <button
                          onClick={() => {
                            setBooks([]);
                            setMeta({});
                            fetchBooks();
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Quay lại tìm trong hệ thống
                        </button>
                      )}
                    </div>
                  )}

                  {books.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <div className="text-6xl mb-4">📚</div>
                      <div className="text-gray-500 text-lg mb-2">
                        {searchTerm || filters.category
                          ? 'Không tìm thấy sách nào phù hợp'
                          : `Nhập từ khóa để bắt đầu tìm kiếm${
                              searchMode === 'advanced'
                                ? ' hoặc chọn bộ lọc'
                                : ''
                            }`}
                      </div>
                      <p className="text-gray-400 mb-4">
                        {searchTerm || filters.category
                          ? `Tìm kiếm "${searchTerm}" ${filters.category ? `trong danh mục "${filters.category}"` : ''} không có kết quả`
                          : searchMode === 'google'
                            ? 'Tìm sách từ Google Books API'
                            : searchMode === 'wanted'
                              ? 'Tìm sách mà thành viên khác đang muốn'
                              : searchMode === 'advanced'
                                ? 'Sử dụng các bộ lọc để tìm kiếm chính xác'
                                : 'Tìm sách theo tên, tác giả hoặc lọc theo danh mục'}
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        {(searchTerm || filters.category) && (
                          <button
                            onClick={clearFilters}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Xóa tất cả bộ lọc
                          </button>
                        )}
                        {searchTerm && searchMode !== 'google' && (
                          <>
                            <span className="text-gray-400">hoặc</span>
                            <button
                              onClick={() => setSearchMode('google')}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                            >
                              <Globe className="w-4 h-4" />
                              Tìm trên Google Books
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {books.map((book) => (
                          <BookCard key={book.book_id} book={book} />
                        ))}
                      </div>

                      {meta.totalPages > 1 && (
                        <Pagination
                          currentPage={meta.page || filters.page}
                          totalPages={meta.totalPages}
                          onPageChange={handlePageChange}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SearchBooks;
