import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Eye,
  Flag,
  MapPin,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  Avatar,
  Badge,
  Button,
  Card,
  LoadingSpinner,
  Tabs,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useExchanges } from '../../hooks/useExchanges';
import { useReports } from '../../hooks/useReports';
import reviewsService from '../../services/api/reviews';
import EditReviewModal from './EditReviewModal';
import ExchangeReviewModal from './ExchangeReviewModal';
import ReportModal from './ReportModal';

const ExchangesListPage = () => {
  const navigate = useNavigate();
  const { getExchanges, confirmExchange } = useExchanges();
  const { createReport, loading: reportLoading } = useReports();
  const { user } = useAuth();
  const currentUserId = user?.member?.member_id || user?.user_id;

  const [status, setStatus] = useState('');
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    exchangeId: null,
    revieweeId: null,
  });
  const [editReviewModal, setEditReviewModal] = useState({
    isOpen: false,
    review: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State cho Report Modal
  const [reportModal, setReportModal] = useState({
    isOpen: false,
    reportedMemberId: null,
    reportedMemberName: null,
  });

  useEffect(() => {
    loadExchanges();
  }, [status, page]);

  const loadExchanges = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      const result = await getExchanges(params);
      setExchanges(result.items || []);
      setTotal(result.total || 0);
      setTotalPages(result.pages || 1);
    } catch (error) {
      console.error('[Exchanges] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (exchangeId) => {
    if (!confirm('Xác nhận hoàn tất trao đổi này?')) return;
    try {
      await confirmExchange(exchangeId);
      alert('Đã xác nhận hoàn tất!');
      loadExchanges();
    } catch (error) {
      alert('Thất bại: ' + (error.message || 'Vui lòng thử lại'));
    }
  };

  const openReviewModal = (exchangeId, revieweeId) => {
    setReviewModal({ isOpen: true, exchangeId, revieweeId });
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, exchangeId: null, revieweeId: null });
  };

  const handleReviewSubmitted = async () => {
    await loadExchanges();
  };

  const openReportModal = (memberId, memberName) => {
    setReportModal({
      isOpen: true,
      reportedMemberId: memberId,
      reportedMemberName: memberName,
    });
  };

  const closeReportModal = () => {
    setReportModal({
      isOpen: false,
      reportedMemberId: null,
      reportedMemberName: null,
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { variant: 'warning', label: 'Chờ xác nhận', icon: '⏳' },
      IN_PROGRESS: { variant: 'info', label: 'Đang trao đổi', icon: '🔄' },
      COMPLETED: { variant: 'success', label: 'Hoàn tất', icon: '✅' },
      CANCELLED: { variant: 'default', label: 'Đã hủy', icon: '❌' },
    };
    const config = map[status] || map.PENDING;
    return (
      <Badge variant={config.variant}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const tabs = [
    { id: '', name: 'Tất cả' },
    { id: 'PENDING', name: '⏳ Chờ xác nhận' },
    { id: 'IN_PROGRESS', name: '🔄 Đang trao đổi' },
    { id: 'COMPLETED', name: '✅ Hoàn tất' },
    { id: 'CANCELLED', name: '❌ Đã hủy' },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="text"
            onClick={() => navigate('/exchange')}
            className="mb-4 text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Trao đổi
              </h1>
              <p className="text-gray-600">
                Theo dõi các trao đổi đang diễn ra
              </p>
            </div>
            <Badge variant="info" className="text-lg px-4 py-2">
              {total} trao đổi
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={status}
          onTabChange={(newStatus) => {
            setStatus(newStatus);
            setPage(1);
          }}
        />

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : exchanges.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có trao đổi {status ? 'với trạng thái này' : 'nào'}
            </h3>
            <p className="text-gray-600 mb-6">
              {!status && 'Bạn chưa có trao đổi nào'}
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/exchange/suggestions')}
            >
              Tìm gợi ý trao đổi
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {exchanges.map((ex) => {
              const otherMember =
                currentUserId === ex.member_a?.member_id
                  ? ex.member_b
                  : ex.member_a;

              const myBooks =
                ex.books?.filter((b) => b.from === ex.member_a?.member_id) ||
                [];
              const theirBooks =
                ex.books?.filter((b) => b.from === ex.member_b?.member_id) ||
                [];

              // Xác định revieweeId (người mà currentUser sẽ đánh giá)
              let canReview = false;
              let revieweeId = null;
              let myReview = null; // Review của currentUser nếu đã đánh giá

              if (ex.status === 'COMPLETED') {
                // Kiểm tra xem currentUser đã đánh giá hay chưa
                if (
                  ex.reviews &&
                  Array.isArray(ex.reviews) &&
                  ex.reviews.length > 0
                ) {
                  myReview = ex.reviews.find(
                    (r) => r.reviewer_id === currentUserId,
                  );
                }

                // Xác định có thể đánh giá không
                const isMemberA = currentUserId === ex.member_a?.member_id;
                const isMemberB = currentUserId === ex.member_b?.member_id;

                // Nếu chưa có myReview thì cho phép đánh giá
                if (!myReview && (isMemberA || isMemberB)) {
                  canReview = true;
                  // Xác định reviewee là người còn lại
                  if (isMemberA) {
                    revieweeId = ex.member_b?.member_id;
                  } else if (isMemberB) {
                    revieweeId = ex.member_a?.member_id;
                  }
                }
              }

              return (
                <Card key={ex.exchange_id} className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={otherMember?.avatar_url}
                        alt={otherMember?.full_name}
                        size="md"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {otherMember?.full_name || 'Người dùng'}
                        </h4>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(ex.status)}
                      <p className="text-xs text-gray-500 mt-1">
                        Bắt đầu:{' '}
                        {new Date(ex.created_at).toLocaleDateString('vi-VN')}
                      </p>
                      {ex.completed_at && (
                        <p className="text-xs text-green-600">
                          Hoàn tất:{' '}
                          {new Date(ex.completed_at).toLocaleDateString(
                            'vi-VN',
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Books Exchange Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-gray-900 mb-2">
                        📚 Sách từ {ex.member_a?.full_name || 'Người gửi'} (
                        {myBooks.length})
                      </h5>
                      <div className="space-y-2">
                        {myBooks.length === 0 ? (
                          <p className="text-sm text-gray-500">Không có sách</p>
                        ) : (
                          myBooks.map((book) => (
                            <div
                              key={book.book_id}
                              className="text-sm bg-white p-2 rounded"
                            >
                              <div className="font-medium">{book.title}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-medium text-gray-900 mb-2">
                        📚 Sách từ {ex.member_b?.full_name || 'Người nhận'} (
                        {theirBooks.length})
                      </h5>
                      <div className="space-y-2">
                        {theirBooks.length === 0 ? (
                          <p className="text-sm text-gray-500">Không có sách</p>
                        ) : (
                          theirBooks.map((book) => (
                            <div
                              key={book.book_id}
                              className="text-sm bg-white p-2 rounded"
                            >
                              <div className="font-medium">{book.title}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Meeting Info */}
                  {ex.meeting_location && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium">
                            Địa điểm: {ex.meeting_location}
                          </span>
                        </div>
                        {ex.meeting_time && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">
                              {new Date(ex.meeting_time).toLocaleString(
                                'vi-VN',
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Confirmation Status */}
                  {(ex.status === 'PENDING' || ex.status === 'IN_PROGRESS') && (
                    <div className="bg-yellow-50 p-3 rounded-lg mb-4 border border-yellow-200">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">
                            Xác nhận hoàn tất:
                          </span>
                          {ex.member_a_confirmed && (
                            <Badge variant="success" size="sm" className="ml-2">
                              {ex.member_a?.full_name || 'A'} ✓
                            </Badge>
                          )}
                          {ex.member_b_confirmed && (
                            <Badge variant="success" size="sm" className="ml-2">
                              {ex.member_b?.full_name || 'B'} ✓
                            </Badge>
                          )}
                          {!ex.member_a_confirmed && !ex.member_b_confirmed && (
                            <span className="text-gray-600 ml-2">
                              Chưa có ai xác nhận
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hiển thị review của mình nếu đã hoàn tất */}
                  {ex.status === 'COMPLETED' && myReview && (
                    <div className="mb-4 mt-4">
                      <h5 className="font-semibold text-gray-900 mb-2">
                        Đánh giá của bạn
                      </h5>
                      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">
                                {myReview.reviewer_name || 'Bạn'}
                              </span>
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                Của bạn
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${
                                    i < myReview.rating
                                      ? 'text-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                              <span className="ml-1 text-sm text-gray-600">
                                ({myReview.rating}/5)
                              </span>
                            </div>
                            {myReview.comment && (
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {myReview.comment}
                              </p>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(myReview.created_at).toLocaleDateString(
                                'vi-VN',
                                {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </div>
                          </div>

                          {/* Nút Sửa & Xóa nằm ngang, đẹp mắt */}
                          <div className="flex gap-2 mt-3 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="whitespace-nowrap bg-white text-blue-600 border border-blue-300 hover:bg-blue-50 shadow-sm transition-colors"
                              onClick={() =>
                                setEditReviewModal({
                                  isOpen: true,
                                  review: myReview,
                                })
                              }
                            >
                              Sửa đánh giá
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="whitespace-nowrap bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors"
                              loading={deleteLoading}
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    'Bạn chắc chắn muốn xóa đánh giá này?',
                                  )
                                )
                                  return;
                                setDeleteLoading(true);
                                try {
                                  await reviewsService.deleteReview(
                                    myReview.review_id,
                                  );
                                  alert('Đã xóa đánh giá!');
                                  loadExchanges();
                                } catch (err) {
                                  alert(
                                    'Xóa thất bại: ' +
                                      (err.message || 'Vui lòng thử lại'),
                                  );
                                } finally {
                                  setDeleteLoading(false);
                                }
                              }}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/exchange/${ex.exchange_id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Chi tiết
                    </Button>

                    {(ex.status === 'PENDING' ||
                      ex.status === 'IN_PROGRESS') && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleConfirm(ex.exchange_id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Xác nhận hoàn tất
                      </Button>
                    )}

                    {/* Nút Đánh giá */}
                    {canReview && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          openReviewModal(ex.exchange_id, revieweeId)
                        }
                      >
                        ✍ Đánh giá
                      </Button>
                    )}

                    {/* Nút Báo cáo */}
                    {otherMember?.member_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() =>
                          openReportModal(
                            otherMember.member_id,
                            otherMember.full_name,
                          )
                        }
                      >
                        <Flag className="w-4 h-4 mr-1" />
                        Báo cáo
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Trước
            </Button>
            <span className="py-2 px-4 text-gray-700">
              Trang {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau
            </Button>
          </div>
        )}

        {/* Modal review */}
        <ExchangeReviewModal
          isOpen={reviewModal.isOpen}
          onClose={closeReviewModal}
          exchangeId={reviewModal.exchangeId}
          revieweeId={reviewModal.revieweeId}
          onReviewSubmitted={handleReviewSubmitted}
        />

        {/* Modal cập nhật review */}
        {editReviewModal.isOpen && editReviewModal.review && (
          <EditReviewModal
            review={editReviewModal.review}
            onClose={() => setEditReviewModal({ isOpen: false, review: null })}
            onUpdated={() => {
              setEditReviewModal({ isOpen: false, review: null });
              loadExchanges();
            }}
          />
        )}

        {/* Modal báo cáo */}
        <ReportModal
          isOpen={reportModal.isOpen}
          onClose={closeReportModal}
          reportedMemberId={reportModal.reportedMemberId}
          reportedMemberName={reportModal.reportedMemberName}
        />
      </div>
    </Layout>
  );
};

export default ExchangesListPage;
