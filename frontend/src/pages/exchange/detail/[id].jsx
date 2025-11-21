import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge, Avatar, Input, Textarea } from '../../../components/ui';
import { useExchanges } from '../../../hooks/useExchanges';
import { useAuth } from '../../../hooks/useAuth';
import { 
  ArrowLeft, Users, Book, Calendar, MapPin, MessageSquare, 
  Check, X, Edit, AlertCircle, CheckCircle, Clock 
} from 'lucide-react';

/**
 * Exchange Detail Page
 * Backend API: GET /exchanges/:id
 * Response: ExchangeResponseDto
 */
const ExchangeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getExchangeDetail, 
    confirmExchange, 
    updateMeetingInfo, 
    cancelExchange 
  } = useExchanges();

  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Meeting form state
  const [editingMeeting, setEditingMeeting] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    meeting_location: '',
    meeting_time: '',
    meeting_notes: ''
  });

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelForm, setCancelForm] = useState({
    cancellation_reason: 'USER_CANCELLED',
    cancellation_details: ''
  });

  useEffect(() => {
    loadExchangeDetail();
  }, [id]);

  const loadExchangeDetail = async () => {
    setLoading(true);
    try {
      const data = await getExchangeDetail(id);
      setExchange(data);
      
      // Initialize meeting form with existing data
      setMeetingForm({
        meeting_location: data.meeting_location || '',
        meeting_time: data.meeting_time ? new Date(data.meeting_time).toISOString().slice(0, 16) : '',
        meeting_notes: data.meeting_notes || ''
      });
    } catch (error) {
      console.error('[ExchangeDetail] Failed to load:', error);
      alert('Không thể tải chi tiết giao dịch');
      navigate('/exchange/list');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMeeting = async () => {
    setActionLoading(true);
    try {
      const data = {
        meeting_location: meetingForm.meeting_location,
        meeting_time: meetingForm.meeting_time || null,
        meeting_notes: meetingForm.meeting_notes
      };
      
      await updateMeetingInfo(id, data);
      alert('Đã cập nhật lịch hẹn!');
      setEditingMeeting(false);
      loadExchangeDetail();
    } catch (error) {
      alert('Cập nhật thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirm('Xác nhận bạn đã hoàn tất trao đổi sách?')) return;
    
    setActionLoading(true);
    try {
      await confirmExchange(id);
      alert('Đã xác nhận hoàn tất!');
      loadExchangeDetail();
    } catch (error) {
      alert('Xác nhận thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelForm.cancellation_reason) {
      alert('Vui lòng chọn lý do hủy');
      return;
    }

    setActionLoading(true);
    try {
      await cancelExchange(id, cancelForm);
      alert('Đã hủy giao dịch');
      setShowCancelModal(false);
      loadExchangeDetail();
    } catch (error) {
      alert('Hủy thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { variant: 'warning', label: 'Đang chờ', icon: <Clock className="w-4 h-4" /> },
      IN_PROGRESS: { variant: 'info', label: 'Đang thực hiện', icon: <AlertCircle className="w-4 h-4" /> },
      COMPLETED: { variant: 'success', label: 'Hoàn thành', icon: <CheckCircle className="w-4 h-4" /> },
      CANCELLED: { variant: 'error', label: 'Đã hủy', icon: <X className="w-4 h-4" /> }
    };
    const config = map[status] || map.PENDING;
    return (
      <Badge variant={config.variant} className="text-lg px-4 py-2 flex items-center gap-2">
        {config.icon} {config.label}
      </Badge>
    );
  };

  const getCancellationReasonLabel = (reason) => {
    const labels = {
      USER_CANCELLED: 'Người dùng hủy',
      NO_SHOW: 'Không đến',
      BOTH_NO_SHOW: 'Cả hai không đến',
      DISPUTE: 'Tranh chấp',
      ADMIN_CANCELLED: 'Admin hủy'
    };
    return labels[reason] || reason;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!exchange) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy giao dịch</h2>
          <Button variant="primary" onClick={() => navigate('/exchange/list')} className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </Layout>
    );
  }

  // Determine current user role
  const currentMemberId = user?.member?.member_id;
  const isMemberA = currentMemberId === exchange.member_a?.member_id;
  const otherMember = isMemberA ? exchange.member_b : exchange.member_a;
  const currentConfirmed = isMemberA ? exchange.member_a_confirmed : exchange.member_b_confirmed;
  const otherConfirmed = isMemberA ? exchange.member_b_confirmed : exchange.member_a_confirmed;

  // Separate books by direction
  const booksToGive = exchange.books?.filter(book => book.from === currentMemberId) || [];
  const booksToReceive = exchange.books?.filter(book => book.to === currentMemberId) || [];

  const canEdit = exchange.status === 'PENDING' || exchange.status === 'IN_PROGRESS';
  const canConfirm = (exchange.status === 'PENDING' || exchange.status === 'IN_PROGRESS') && !currentConfirmed;
  const canCancel = exchange.status !== 'COMPLETED';

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="text" onClick={() => navigate('/exchange/list')} className="mb-4 text-blue-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chi tiết giao dịch trao đổi</h1>
            <p className="text-gray-600">ID: {exchange.exchange_id}</p>
          </div>
          {getStatusBadge(exchange.status)}
        </div>

        {/* Members Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Current User */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-4">
              <Avatar src={user?.avatar_url} alt="You" size="lg" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">Bạn</h3>
                <p className="text-sm text-gray-600">{user?.full_name || 'Người dùng'}</p>
                <div className="mt-2">
                  {currentConfirmed ? (
                    <Badge variant="success" size="sm" className="flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3" /> Đã xác nhận
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm" className="flex items-center gap-1 w-fit">
                      <Clock className="w-3 h-3" /> Chưa xác nhận
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Other Member */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-4">
              <Avatar src={otherMember?.avatar_url} alt={otherMember?.full_name} size="lg" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">Đối tác</h3>
                <p className="text-sm text-gray-600">{otherMember?.full_name || 'Người dùng'}</p>
                <div className="mt-2">
                  {otherConfirmed ? (
                    <Badge variant="success" size="sm" className="flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3" /> Đã xác nhận
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm" className="flex items-center gap-1 w-fit">
                      <Clock className="w-3 h-3" /> Chưa xác nhận
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Books Exchange */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Books to Give */}
          <Card className="p-6 bg-orange-50 border-orange-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Book className="w-5 h-5 text-orange-600" />
              Sách bạn trao ({booksToGive.length})
            </h2>
            <div className="space-y-3">
              {booksToGive.map((book) => (
                <div key={book.book_id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-semibold text-gray-900">{book.title}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Books to Receive */}
          <Card className="p-6 bg-green-50 border-green-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Book className="w-5 h-5 text-green-600" />
              Sách bạn nhận ({booksToReceive.length})
            </h2>
            <div className="space-y-3">
              {booksToReceive.map((book) => (
                <div key={book.book_id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="font-semibold text-gray-900">{book.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{book.author || 'Không rõ tác giả'}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Meeting Information */}
        <Card className="p-6 mb-6 bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Thông tin lịch hẹn
            </h2>
            {canEdit && !editingMeeting && (
              <Button variant="outline" size="sm" onClick={() => setEditingMeeting(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </div>

          {editingMeeting ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Địa điểm
                </label>
                <Input
                  value={meetingForm.meeting_location}
                  onChange={(e) => setMeetingForm({ ...meetingForm, meeting_location: e.target.value })}
                  placeholder="Nhập địa điểm gặp mặt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Thời gian
                </label>
                <Input
                  type="datetime-local"
                  value={meetingForm.meeting_time}
                  onChange={(e) => setMeetingForm({ ...meetingForm, meeting_time: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Ghi chú
                </label>
                <Textarea
                  value={meetingForm.meeting_notes}
                  onChange={(e) => setMeetingForm({ ...meetingForm, meeting_notes: e.target.value })}
                  placeholder="Ghi chú thêm về cuộc gặp..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="primary" 
                  onClick={handleUpdateMeeting}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setEditingMeeting(false)}
                  disabled={actionLoading}
                >
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">Địa điểm</div>
                  <div className="font-medium text-gray-900">
                    {exchange.meeting_location || 'Chưa đặt địa điểm'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-600">Thời gian</div>
                  <div className="font-medium text-gray-900">
                    {exchange.meeting_time 
                      ? new Date(exchange.meeting_time).toLocaleString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Chưa đặt lịch'
                    }
                  </div>
                </div>
              </div>

              {exchange.meeting_notes && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600">Ghi chú</div>
                    <div className="font-medium text-gray-900 whitespace-pre-wrap">
                      {exchange.meeting_notes}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Cancellation Info */}
        {exchange.status === 'CANCELLED' && exchange.cancellation_reason && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
              <X className="w-5 h-5" />
              Lý do hủy
            </h3>
            <div className="text-red-700">
              <div className="font-medium">{getCancellationReasonLabel(exchange.cancellation_reason)}</div>
              {exchange.cancellation_details && (
                <div className="mt-2 text-sm">{exchange.cancellation_details}</div>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        {exchange.status !== 'CANCELLED' && exchange.status !== 'COMPLETED' && (
          <Card className="p-6">
            <div className="flex gap-3 justify-end">
              {canCancel && (
                <Button 
                  variant="error"
                  onClick={() => setShowCancelModal(true)}
                  disabled={actionLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy giao dịch
                </Button>
              )}

              {canConfirm && (
                <Button 
                  variant="success"
                  onClick={handleConfirm}
                  disabled={actionLoading}
                  className="text-lg px-6"
                >
                  {actionLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Xác nhận hoàn tất
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Completion Message */}
        {exchange.status === 'COMPLETED' && (
          <Card className="p-6 bg-green-50 border-green-200 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">Giao dịch hoàn tất!</h3>
            <p className="text-green-700">
              Hoàn thành lúc: {new Date(exchange.completed_at).toLocaleString('vi-VN')}
            </p>
          </Card>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Hủy giao dịch</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do hủy
                  </label>
                  <select
                    value={cancelForm.cancellation_reason}
                    onChange={(e) => setCancelForm({ ...cancelForm, cancellation_reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USER_CANCELLED">Người dùng hủy</option>
                    <option value="NO_SHOW">Không đến</option>
                    <option value="BOTH_NO_SHOW">Cả hai không đến</option>
                    <option value="DISPUTE">Tranh chấp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chi tiết (tùy chọn)
                  </label>
                  <Textarea
                    value={cancelForm.cancellation_details}
                    onChange={(e) => setCancelForm({ ...cancelForm, cancellation_details: e.target.value })}
                    placeholder="Mô tả chi tiết lý do hủy..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="error" 
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCancelModal(false)}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  Đóng
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExchangeDetailPage;
