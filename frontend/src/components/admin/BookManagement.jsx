import { AlertCircle, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAdminBooks } from '../../hooks/useAdmin';

const BookManagement = () => {
  const { books, loading, error, fetchBooks, removeBook } = useAdminBooks();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    reported: false,
    search: '',
  });
  const [hideRemoved, setHideRemoved] = useState(true); // Ẩn sách đã xóa theo mặc định
  const [selectedBook, setSelectedBook] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadBooks();
  }, [filters.page, filters.limit, filters.status, filters.reported]);

  const loadBooks = async () => {
    try {
      await fetchBooks(filters);
    } catch (err) {
      console.error('Failed to load books:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadBooks();
  };

  const handleDeleteBook = async () => {
    if (!selectedBook || !deleteReason.trim()) {
      alert('Vui lòng nhập lý do xóa sách');
      return;
    }

    try {
      console.log(
        '[BookManagement] Deleting book:',
        selectedBook.book_id,
        'Reason:',
        deleteReason,
      );
      await removeBook(selectedBook.book_id, deleteReason);
      console.log('[BookManagement] Delete successful, reloading books...');
      setShowDeleteModal(false);
      setDeleteReason('');
      setSelectedBook(null);
      await loadBooks();
      alert('Xóa sách thành công!');
    } catch (err) {
      console.error('[BookManagement] Delete failed:', err);
      alert('Lỗi khi xóa sách: ' + err.message);
    }
  };

  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setShowDeleteModal(true);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Quản lý sách</h2>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <form onSubmit={handleSearch} className="col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sách..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value, page: 1 })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="AVAILABLE">Có sẵn</option>
            <option value="BORROWED">Đang mượn</option>
            <option value="EXCHANGING">Đang trao đổi</option>
            <option value="REMOVED">Đã xóa</option>
          </select>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.reported}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    reported: e.target.checked,
                    page: 1,
                  })
                }
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Chỉ sách bị báo cáo</span>
            </label>
          </div>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={hideRemoved}
              onChange={(e) => setHideRemoved(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Ẩn sách đã xóa</span>
          </label>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Books Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sách
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Báo cáo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!Array.isArray(books) || books.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không tìm thấy sách nào
                  </td>
                </tr>
              ) : (
                books
                  .filter((book) => !hideRemoved || book.status !== 'REMOVED')
                  .map((book) => (
                    <tr
                      key={book.book_id}
                      className={
                        book.status === 'REMOVED' ? 'bg-red-50 opacity-60' : ''
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {book.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {book.author}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {book.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            book.status === 'AVAILABLE'
                              ? 'bg-green-100 text-green-800'
                              : book.status === 'BORROWED'
                                ? 'bg-yellow-100 text-yellow-800'
                                : book.status === 'REMOVED'
                                  ? 'bg-gray-100 text-gray-800 line-through'
                                  : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {book.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {book.region}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {book.reported ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Có báo cáo
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {book.status !== 'REMOVED' && (
                          <button
                            onClick={() => openDeleteModal(book)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Xóa
                          </button>
                        )}
                        {book.status === 'REMOVED' && (
                          <span className="text-xs text-gray-500 italic">
                            Đã xóa
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Hiển thị trang {filters.page} - {filters.limit} sách mỗi trang
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              setFilters({ ...filters, page: Math.max(1, filters.page - 1) })
            }
            disabled={filters.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={books.length < filters.limit}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Xóa sách</h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc muốn xóa sách "{selectedBook?.title}"?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do xóa <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Nhập lý do xóa sách (ví dụ: Nội dung không phù hợp)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReason('');
                  setSelectedBook(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteBook}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagement;
