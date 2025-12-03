// src/pages/books/search.jsx - SỬA IMPORT
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import BookCard from '../../components/books/BookCard';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import BookCategoriesSelect from '../../components/books/BookCategoriesSelect';
import BookConditionSelect from '../../components/books/BookConditionSelect';
import { useBooks } from '../../hooks/useBooks';

const SearchBooks = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { advancedSearch, loading, error, getAvailableRegions } = useBooks();
  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({});
  const [regions, setRegions] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    region: searchParams.get('region') || '',
    condition: searchParams.get('condition') || '',
    sort_by: 'created_at',
    order: 'DESC'
  });

  useEffect(() => {
    fetchRegions();
    if (filters.q || filters.category || filters.region || filters.condition) {
      fetchBooks();
    }
  }, [filters]);

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
      const result = await advancedSearch(filters);
      setBooks(result.data);
      setMeta(result.meta);
    } catch (err) {
      console.error('Failed to search books:', err);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      q: searchTerm,
      page: 1
    }));
    updateURL({ q: searchTerm, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
    updateURL({ [key]: value, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({
      ...prev,
      page
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

  const clearFilters = () => {
    const clearedFilters = {
      q: '',
      category: '',
      region: '',
      condition: '',
      sort_by: 'created_at',
      order: 'DESC',
      page: 1
    };
    setFilters(prev => ({ ...prev, ...clearedFilters }));
    setSearchParams(new URLSearchParams());
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tìm kiếm sách</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Bộ lọc tìm kiếm</h3>
                
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục
                    </label>
                    <BookCategoriesSelect
                      value={filters.category}
                      onChange={(value) => handleFilterChange('category', value)}
                    />
                  </div>

                  {/* Region Filter */}
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
                      {regions.map(region => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Condition Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tình trạng
                    </label>
                    <BookConditionSelect
                      value={filters.condition}
                      onChange={(value) => handleFilterChange('condition', value)}
                    />
                  </div>

                  {/* Sort Options */}
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

                  {/* Clear Filters Button */}
                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded text-sm font-medium"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="mb-6">
                <SearchBar 
                  placeholder="Tìm sách theo tên, tác giả..." 
                  onSearch={handleSearch}
                  initialValue={filters.q}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {books.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-500 text-lg mb-4">
                        Không tìm thấy sách nào phù hợp.
                      </div>
                      <p className="text-gray-400">
                        Thử thay đổi điều kiện tìm kiếm hoặc xóa bộ lọc
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {books.map(book => (
                          <BookCard key={book.book_id} book={book} />
                        ))}
                      </div>

                      <Pagination
                        currentPage={meta.page}
                        totalPages={meta.totalPages}
                        onPageChange={handlePageChange}
                      />
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