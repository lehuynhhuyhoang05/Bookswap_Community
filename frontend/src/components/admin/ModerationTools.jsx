import {
  AlertCircle,
  Eye,
  MessageSquare,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAdminMessages, useAdminReviews } from '../../hooks/useAdmin';

const ModerationTools = () => {
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'messages'

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Công cụ kiểm duyệt
        </h2>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('reviews')}
              className={`${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Star className="h-5 w-5 mr-2" />
              Đánh giá (Reviews)
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Tin nhắn (Messages)
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'reviews' ? <ReviewsTab /> : <MessagesTab />}
    </div>
  );
};

// Reviews Tab Component
const ReviewsTab = () => {
  const { reviews, loading, error, fetchReviews, removeReview } =
    useAdminReviews();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    reported: false,
    rating: '',
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [filters.page, filters.limit, filters.reported, filters.rating]);

  const loadReviews = async () => {
    try {
      await fetchReviews(filters);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteReason.trim()) {
      alert('Vui lòng nhập lý do xóa review');
      return;
    }

    try {
      console.log(
        '[ReviewsTab] Deleting review:',
        selectedReview.review_id,
        'Reason:',
        deleteReason,
      );
      await removeReview(selectedReview.review_id, deleteReason);
      console.log('[ReviewsTab] Delete successful, reloading reviews...');
      setShowDeleteModal(false);
      setDeleteReason('');
      setSelectedReview(null);
      await loadReviews();
      alert('Xóa review thành công!');
    } catch (err) {
      console.error('[ReviewsTab] Delete failed:', err);
      alert('Lỗi khi xóa review: ' + err.message);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <select
          value={filters.rating}
          onChange={(e) =>
            setFilters({ ...filters, rating: e.target.value, page: 1 })
          }
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả đánh giá</option>
          <option value="1">1 sao</option>
          <option value="2">2 sao</option>
          <option value="3">3 sao</option>
          <option value="4">4 sao</option>
          <option value="5">5 sao</option>
        </select>

        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.reported}
              onChange={(e) =>
                setFilters({ ...filters, reported: e.target.checked, page: 1 })
              }
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              Chỉ hiện review bị báo cáo
            </span>
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

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {!Array.isArray(reviews) || reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy review nào
            </div>
          ) : (
            reviews.map((review) => (
              <div
                key={review.review_id}
                className={`border rounded-lg p-4 ${review.deleted ? 'bg-red-50 border-red-200' : 'border-gray-200'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        bởi {review.user_name || 'Unknown'}
                      </span>
                      {review.reported && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Bị báo cáo
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <div className="text-xs text-gray-500">
                      Sách: {review.book_title} |{' '}
                      {new Date(review.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div className="ml-4">
                    {!review.deleted && (
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Xóa
                      </button>
                    )}
                    {review.deleted && (
                      <span className="text-gray-400 text-xs">Đã xóa</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Hiển thị trang {filters.page}
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
            disabled={reviews.length < filters.limit}
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Xóa review</h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc muốn xóa review này không?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do xóa <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Nhập lý do xóa (ví dụ: Review spam hoặc xúc phạm)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReason('');
                  setSelectedReview(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteReview}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Messages Tab Component
const MessagesTab = () => {
  const {
    messages,
    conversation,
    loading,
    error,
    fetchMessages,
    fetchConversation,
    removeMessage,
  } = useAdminMessages();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    conversationId: '',
    senderId: '',
    deletedOnly: false, // Mặc định chỉ hiện messages chưa xóa
    search: '',
  });

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);

  useEffect(() => {
    loadMessages();
  }, [filters.page, filters.limit, filters.deletedOnly, filters.search]);

  const loadMessages = async () => {
    try {
      console.log('[MessagesTab] Loading messages with filters:', filters);
      await fetchMessages(filters);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadMessages();
  };

  const handleDeleteMessage = async () => {
    if (!deleteReason.trim()) {
      alert('Vui lòng nhập lý do xóa tin nhắn');
      return;
    }

    try {
      console.log(
        '[MessagesTab] Deleting message:',
        selectedMessage.message_id,
        'Reason:',
        deleteReason,
      );
      await removeMessage(selectedMessage.message_id, deleteReason);
      console.log('[MessagesTab] Delete successful, reloading messages...');
      setShowDeleteModal(false);
      setDeleteReason('');
      setSelectedMessage(null);
      await loadMessages();
      alert('Xóa tin nhắn thành công!');
    } catch (err) {
      console.error('[MessagesTab] Delete failed:', err);

      // Handle specific error cases
      let errorMessage = 'Lỗi khi xóa tin nhắn';
      if (err.message?.includes('Message is already deleted')) {
        errorMessage = 'Tin nhắn này đã được xóa trước đó';
        // Close modal and refresh data to show updated status
        setShowDeleteModal(false);
        setDeleteReason('');
        setSelectedMessage(null);
        await loadMessages();
      } else if (err.message?.includes('Message not found')) {
        errorMessage = 'Không tìm thấy tin nhắn này';
        // Close modal and refresh data
        setShowDeleteModal(false);
        setDeleteReason('');
        setSelectedMessage(null);
        await loadMessages();
      } else {
        errorMessage = err.message || 'Có lỗi xảy ra khi xóa tin nhắn';
      }

      alert(errorMessage);
    }
  };

  const handleViewConversation = async (conversationId) => {
    try {
      await fetchConversation(conversationId);
      setShowConversationModal(true);
    } catch (err) {
      alert('Lỗi khi tải conversation: ' + err.message);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <form onSubmit={handleSearch} className="col-span-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm trong nội dung tin nhắn..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </form>

        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.deletedOnly === true}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  deletedOnly: e.target.checked,
                  page: 1,
                })
              }
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Xem tin nhắn đã xóa</span>
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

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {!Array.isArray(messages) || messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy tin nhắn nào
            </div>
          ) : (
            messages
              .filter((message) => {
                // Nếu deletedOnly = true, chỉ hiển thị messages đã xóa
                if (filters.deletedOnly === true) {
                  return message.deleted;
                }
                // Nếu deletedOnly = false, chỉ hiển thị messages chưa xóa
                if (filters.deletedOnly === false) {
                  return !message.deleted;
                }
                // Nếu không có filter, hiển thị tất cả
                return true;
              })
              .map((message) => (
                <div
                  key={message.message_id}
                  className={`border rounded-lg p-4 ${message.deleted ? 'bg-red-50 border-red-200' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {message.sender_name || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleString('vi-VN')}
                        </span>
                        {message.deleted && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Đã xóa
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{message.content}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleViewConversation(message.conversation_id)
                          }
                          className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Xem conversation
                        </button>
                      </div>
                    </div>
                    <div className="ml-4">
                      {!message.deleted && (
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Hiển thị trang {filters.page}
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
            disabled={messages.length < filters.limit}
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Xóa tin nhắn
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Bạn có chắc muốn xóa tin nhắn này không?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do xóa <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Nhập lý do xóa (ví dụ: Message chứa nội dung vi phạm, spam)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReason('');
                  setSelectedMessage(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteMessage}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa tin nhắn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conversation Modal */}
      {showConversationModal && conversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Chi tiết Conversation
            </h3>

            <div className="space-y-3">
              {conversation.messages?.map((msg) => (
                <div
                  key={msg.message_id}
                  className={`p-3 rounded-lg ${msg.deleted ? 'bg-red-50' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {msg.sender_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-gray-700">{msg.content}</p>
                  {msg.deleted && (
                    <span className="text-xs text-red-600 mt-1 inline-block">
                      Đã xóa
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowConversationModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationTools;
