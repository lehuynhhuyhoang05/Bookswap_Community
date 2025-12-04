// src/pages/books/my-library.jsx
// Refactored: Professional My Library page with integrated Wanted Books
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useBooks } from '../../hooks/useBooks';
import { useLibrary } from '../../hooks/useLibrary';
import { useAuth } from '../../hooks/useAuth';
import {
  Plus,
  BookOpen,
  Heart,
  Search,
  Grid3X3,
  List,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  BookMarked,
  ArrowRightLeft,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

// Book Card Component - More professional design
const LibraryBookCard = ({ book, onDelete, viewMode = 'grid' }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getConditionConfig = (condition) => {
    const configs = {
      'LIKE_NEW': { label: 'Như mới', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      'like_new': { label: 'Như mới', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      'GOOD': { label: 'Tốt', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'good': { label: 'Tốt', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'FAIR': { label: 'Khá', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      'fair': { label: 'Khá', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      'POOR': { label: 'Cũ', color: 'bg-red-100 text-red-700 border-red-200' },
      'poor': { label: 'Cũ', color: 'bg-red-100 text-red-700 border-red-200' },
    };
    return configs[condition] || { label: condition, color: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const getStatusConfig = (status) => {
    const configs = {
      'AVAILABLE': { label: 'Có sẵn', color: 'bg-green-500', icon: CheckCircle },
      'EXCHANGING': { label: 'Đang trao đổi', color: 'bg-yellow-500', icon: ArrowRightLeft },
      'EXCHANGED': { label: 'Đã trao đổi', color: 'bg-gray-500', icon: Clock },
    };
    return configs[status] || { label: status, color: 'bg-gray-500', icon: Clock };
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa sách này khỏi thư viện?')) return;
    setIsDeleting(true);
    try {
      await onDelete(book.book_id || book.id);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Không thể xóa sách. Vui lòng thử lại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const condition = getConditionConfig(book.book_condition || book.condition);
  const status = getStatusConfig(book.status);
  const StatusIcon = status.icon;
  const bookId = book.book_id || book.id;

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300">
        {/* Image Section */}
        <div className="relative h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {book.cover_image_url && !imageError ? (
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-gray-300" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </div>
          </div>

          {/* Condition Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${condition.color}`}>
              {condition.label}
            </span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Link
              to={`/books/detail/${bookId}`}
              className="p-2 bg-white rounded-full hover:bg-blue-50 transition-colors"
              title="Xem chi tiết"
            >
              <Eye className="w-5 h-5 text-blue-600" />
            </Link>
            <Link
              to={`/books/edit-book/${bookId}`}
              className="p-2 bg-white rounded-full hover:bg-amber-50 transition-colors"
              title="Chỉnh sửa"
            >
              <Edit className="w-5 h-5 text-amber-600" />
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Xóa"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-gray-500 mb-2">{book.author || 'Chưa rõ tác giả'}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <BookMarked className="w-3 h-3" />
              {book.category || 'Khác'}
            </span>
            {book.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {book.views}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 flex gap-4">
      {/* Image */}
      <div className="w-20 h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
        {book.cover_image_url && !imageError ? (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {book.title}
            </h3>
            <p className="text-sm text-gray-500">{book.author || 'Chưa rõ tác giả'}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${condition.color}`}>
              {condition.label}
            </span>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-white ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span>{book.category || 'Khác'}</span>
          {book.isbn && <span>ISBN: {book.isbn}</span>}
          {book.views > 0 && <span>{book.views} lượt xem</span>}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Link
            to={`/books/detail/${bookId}`}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Xem chi tiết
          </Link>
          <Link
            to={`/books/edit-book/${bookId}`}
            className="px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
          >
            Chỉnh sửa
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Wanted Book Card Component
const WantedBookCard = ({ book, onDelete, viewMode = 'grid' }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Xóa sách này khỏi danh sách mong muốn?')) return;
    setIsDeleting(true);
    try {
      await onDelete(book.wanted_id || book.id);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Priority config based on numeric value
  const getPriorityConfig = (priority) => {
    const p = parseInt(priority) || 5;
    if (p >= 8) return { label: 'Ưu tiên cao', color: 'bg-red-100 text-red-700' };
    if (p >= 4) return { label: 'Bình thường', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Ưu tiên thấp', color: 'bg-gray-100 text-gray-700' };
  };
  const priority = getPriorityConfig(book.priority);

  // Preferred condition labels
  const conditionLabels = {
    'ANY': 'Bất kỳ',
    'FAIR_UP': 'Từ TB trở lên',
    'GOOD_UP': 'Từ Tốt trở lên',
    'VERY_GOOD_UP': 'Rất tốt trở lên',
    'LIKE_NEW': 'Như mới',
  };

  if (viewMode === 'grid') {
    return (
      <div className="group bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border border-rose-200 overflow-hidden hover:shadow-lg hover:border-rose-300 transition-all duration-300">
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            {book.cover_image_url ? (
              <img 
                src={book.cover_image_url} 
                alt={book.title}
                className="w-12 h-16 object-cover rounded shadow-sm"
              />
            ) : (
              <Heart className="w-8 h-8 text-rose-400" />
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority.color}`}>
              {priority.label}
            </span>
          </div>
          
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-rose-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-gray-500 mb-2">{book.author || 'Chưa rõ tác giả'}</p>
          
          {/* Condition & Language badges */}
          <div className="flex flex-wrap gap-1 mb-2">
            {book.preferred_condition && book.preferred_condition !== 'ANY' && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                {conditionLabels[book.preferred_condition] || book.preferred_condition}
              </span>
            )}
            {book.language && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                {book.language === 'vi' ? 'Tiếng Việt' : book.language === 'en' ? 'English' : book.language}
              </span>
            )}
            {book.isbn && (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                ISBN
              </span>
            )}
          </div>
          
          {book.notes && (
            <p className="text-xs text-gray-400 line-clamp-2 mb-3 italic">"{book.notes}"</p>
          )}

          <div className="flex items-center gap-2 mt-auto">
            <Link
              to={`/library/edit-wanted/${book.wanted_id || book.id}`}
              className="flex-1 py-2 text-center text-xs font-medium text-rose-600 bg-white rounded-lg hover:bg-rose-100 transition-colors border border-rose-200"
            >
              Chỉnh sửa
            </Link>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-rose-600 bg-white rounded-lg hover:bg-rose-100 transition-colors border border-rose-200 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-200 p-4 flex items-center gap-4 hover:shadow-md transition-all">
      {book.cover_image_url ? (
        <img 
          src={book.cover_image_url} 
          alt={book.title}
          className="w-12 h-16 object-cover rounded shadow-sm flex-shrink-0"
        />
      ) : (
        <Heart className="w-10 h-10 text-rose-400 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priority.color}`}>
            {priority.label}
          </span>
          {book.preferred_condition && book.preferred_condition !== 'ANY' && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
              {conditionLabels[book.preferred_condition]}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500">{book.author || 'Chưa rõ tác giả'}</p>
        {book.notes && <p className="text-xs text-gray-400 mt-1 truncate">"{book.notes}"</p>}
      </div>
      <div className="flex items-center gap-2">
        <Link
          to={`/library/edit-wanted/${book.wanted_id || book.id}`}
          className="px-3 py-1.5 text-xs font-medium text-rose-600 bg-white rounded-lg hover:bg-rose-100 border border-rose-200"
        >
          Sửa
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1.5 text-rose-600 bg-white rounded-lg hover:bg-rose-100 border border-rose-200 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Main Component
const MyLibrary = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'my-books';
  
  const { getMyLibrary, deleteBook, loading: booksLoading } = useBooks();
  const { wantedBooks, getWantedBooks, deleteWantedBook, loading: wantedLoading } = useLibrary();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [myBooks, setMyBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksResult] = await Promise.all([
        getMyLibrary(),
        getWantedBooks(),
      ]);

      if (Array.isArray(booksResult)) {
        setMyBooks(booksResult);
      } else if (booksResult?.books) {
        setMyBooks(booksResult.books);
      } else {
        setMyBooks([]);
      }
    } catch (err) {
      console.error('Load data failed:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [getMyLibrary, getWantedBooks]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setSearchQuery('');
    setFilterStatus('all');
  };

  // Filter books
  const filteredMyBooks = myBooks.filter((book) => {
    const matchSearch = !searchQuery || 
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || book.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const filteredWantedBooks = wantedBooks.filter((book) => {
    return !searchQuery || 
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Delete handlers
  const handleDeleteBook = async (bookId) => {
    await deleteBook(bookId);
    setMyBooks((prev) => prev.filter((b) => (b.book_id || b.id) !== bookId));
  };

  const handleDeleteWanted = async (bookId) => {
    await deleteWantedBook(bookId);
  };

  // Stats
  const stats = {
    totalBooks: myBooks.length,
    available: myBooks.filter((b) => b.status === 'AVAILABLE').length,
    exchanging: myBooks.filter((b) => b.status === 'EXCHANGING').length,
    wantedCount: wantedBooks.length,
  };

  const isLoading = loading || booksLoading || wantedLoading;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Thư viện của {user?.full_name || user?.username || 'bạn'}
                </h1>
                <p className="text-gray-500 mt-1">
                  Quản lý sách sở hữu và sách mong muốn trao đổi
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-6 px-4 py-2 bg-gray-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalBooks}</p>
                    <p className="text-xs text-gray-500">Sách của tôi</p>
                  </div>
                  <div className="w-px h-8 bg-gray-300" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-rose-500">{stats.wantedCount}</p>
                    <p className="text-xs text-gray-500">Sách muốn có</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mt-6 border-b border-gray-200 -mb-px">
              <button
                onClick={() => handleTabChange('my-books')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'my-books'
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Sách của tôi
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                  {stats.totalBooks}
                </span>
              </button>
              <button
                onClick={() => handleTabChange('wanted')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'wanted'
                    ? 'text-rose-600 border-rose-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                <Heart className="w-4 h-4" />
                Sách mong muốn
                <span className="ml-1 px-2 py-0.5 bg-rose-100 text-rose-600 text-xs rounded-full">
                  {stats.wantedCount}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Toolbar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'my-books' ? 'Tìm sách trong thư viện...' : 'Tìm sách mong muốn...'}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filters for My Books */}
              {activeTab === 'my-books' && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="AVAILABLE">Có sẵn ({stats.available})</option>
                  <option value="EXCHANGING">Đang trao đổi ({stats.exchanging})</option>
                </select>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={loadData}
                disabled={isLoading}
                className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Làm mới"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {/* Add Button */}
              <Link
                to={activeTab === 'my-books' ? '/books/add-book' : '/library/add-wanted'}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">
                  {activeTab === 'my-books' ? 'Thêm sách' : 'Thêm sách muốn có'}
                </span>
              </Link>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-gray-600">Đang tải...</span>
            </div>
          )}

          {/* My Books Tab */}
          {!isLoading && activeTab === 'my-books' && (
            <>
              {filteredMyBooks.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {searchQuery ? 'Không tìm thấy sách' : 'Thư viện trống'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery
                      ? 'Thử tìm kiếm với từ khóa khác'
                      : 'Hãy thêm sách đầu tiên vào thư viện của bạn'}
                  </p>
                  {!searchQuery && (
                    <Link
                      to="/books/add-book"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Thêm sách đầu tiên
                    </Link>
                  )}
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
                }>
                  {filteredMyBooks.map((book) => (
                    <LibraryBookCard
                      key={book.book_id || book.id}
                      book={book}
                      viewMode={viewMode}
                      onDelete={handleDeleteBook}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Wanted Books Tab */}
          {!isLoading && activeTab === 'wanted' && (
            <>
              {filteredWantedBooks.length === 0 ? (
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl border-2 border-dashed border-rose-300 p-12 text-center">
                  <Heart className="w-16 h-16 text-rose-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {searchQuery ? 'Không tìm thấy sách' : 'Chưa có sách mong muốn'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery
                      ? 'Thử tìm kiếm với từ khóa khác'
                      : 'Thêm những cuốn sách bạn đang tìm kiếm để dễ dàng trao đổi'}
                  </p>
                  {!searchQuery && (
                    <Link
                      to="/library/add-wanted"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Thêm sách muốn có
                    </Link>
                  )}
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
                }>
                  {filteredWantedBooks.map((book) => (
                    <WantedBookCard
                      key={book.wanted_id || book.id}
                      book={book}
                      viewMode={viewMode}
                      onDelete={handleDeleteWanted}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyLibrary;
