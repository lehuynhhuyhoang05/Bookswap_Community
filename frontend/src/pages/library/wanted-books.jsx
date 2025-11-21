import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from "../../components/layout/Layout";
import WantedBookList from "../../components/library/WantedBookList";
import { useLibrary } from "../../hooks/useLibrary";
import LibraryStats from "../../components/library/LibraryStats";

const WantedBooks = () => {
  const { 
    wantedBooks, 
    getWantedBooks, 
    deleteWantedBook,
    loading,
    error,
    clearError 
  } = useLibrary();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    loadWantedBooks();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = wantedBooks.filter(book => {
        if (!book || typeof book !== 'object') return false;
        return (
          book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(wantedBooks);
    }
  }, [searchQuery, wantedBooks]);

  const loadWantedBooks = async () => {
    try {
      await getWantedBooks();
    } catch (err) {
      console.error('Error loading wanted books:', err);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteBook = async (bookId) => {
    try {
      if (window.confirm('Bạn có chắc chắn muốn xóa sách này khỏi danh sách mong muốn?')) {
        await deleteWantedBook(bookId);
        // Không cần cập nhật state thủ công vì hook đã xử lý
      }
    } catch (err) {
      console.error('Error deleting wanted book:', err);
    }
  };

  const handleRetry = () => {
    clearError();
    loadWantedBooks();
  };

  if (loading && wantedBooks.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sách Mong Muốn</h1>
                <p className="text-gray-600 mt-2">
                  Quản lý danh sách sách bạn đang tìm kiếm để trao đổi
                </p>
              </div>
              <Link
                to="/library/add-wanted"
                className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + Thêm Sách Mong Muốn
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
                <button
                  onClick={handleRetry}
                  className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <LibraryStats books={wantedBooks} />

          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="max-w-md">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm sách mong muốn
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Tìm theo tên sách, tác giả, thể loại..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Books List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {filteredBooks.length > 0 ? (
              <WantedBookList 
                books={filteredBooks}
                onBookDeleted={handleDeleteBook}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Không tìm thấy sách phù hợp' : 'Chưa có sách mong muốn'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? 'Hãy thử tìm kiếm với từ khóa khác'
                    : 'Bắt đầu thêm sách bạn muốn tìm kiếm để trao đổi'
                  }
                </p>
                {!searchQuery && (
                  <Link
                    to="/library/add-wanted"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Thêm Sách Đầu Tiên
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WantedBooks;