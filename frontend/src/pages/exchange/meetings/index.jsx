import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge } from '../../../components/ui';
import { MeetingCard } from '../../../components/exchanges';
import { useMeeting } from '../../../hooks/useMeeting';
import { exchangeService } from '../../../services/api/exchanges';
import { useAuth } from '../../../hooks/useAuth';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, Filter } from 'lucide-react';

/**
 * Meeting Management Page
 * View and manage all meetings (past, upcoming, pending confirmation)
 */
const MeetingManagementPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { confirmMeeting, startExchange, loading: actionLoading } = useMeeting();
  const [searchParams, setSearchParams] = useSearchParams();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('filter') || 'all'); // all, upcoming, past, pending
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    past: 0,
    pending: 0
  });

  useEffect(() => {
    loadMeetings();
  }, [filter]);

  const loadMeetings = async () => {
    try {
      setLoading(true);

      // Get exchanges with meetings
      const response = await exchangeService.getExchanges({
        status: 'MEETING_SCHEDULED,IN_PROGRESS',
        page: 1,
        limit: 100
      });

      const allMeetings = (response.data || response.items || [])
        .filter(exchange => exchange.meeting_time);

      // Calculate stats
      const now = new Date();
      const upcoming = allMeetings.filter(m => new Date(m.meeting_time) > now);
      const past = allMeetings.filter(m => new Date(m.meeting_time) <= now);
      const pending = allMeetings.filter(m => 
        !m.requester_confirmed_meeting || !m.owner_confirmed_meeting
      );

      setStats({
        total: allMeetings.length,
        upcoming: upcoming.length,
        past: past.length,
        pending: pending.length
      });

      // Apply filter
      let filtered = allMeetings;
      if (filter === 'upcoming') {
        filtered = upcoming;
      } else if (filter === 'past') {
        filtered = past;
      } else if (filter === 'pending') {
        filtered = pending;
      }

      // Sort by meeting time (upcoming first, then past)
      filtered.sort((a, b) => {
        const timeA = new Date(a.meeting_time);
        const timeB = new Date(b.meeting_time);
        const nowTime = now.getTime();
        
        const aIsPast = timeA < now;
        const bIsPast = timeB < now;
        
        if (aIsPast !== bIsPast) {
          return aIsPast ? 1 : -1; // Upcoming first
        }
        
        if (aIsPast) {
          return timeB - timeA; // Most recent past first
        } else {
          return timeA - timeB; // Soonest upcoming first
        }
      });

      setMeetings(filtered);
    } catch (error) {
      console.error('Failed to load meetings:', error);
      alert('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSearchParams({ filter: newFilter });
  };

  const handleConfirm = async (exchangeId) => {
    if (!confirm('Xác nhận bạn sẽ tham dự cuộc hẹn?')) return;

    try {
      await confirmMeeting(exchangeId);
      alert('✅ Đã xác nhận tham dự!');
      loadMeetings();
    } catch (error) {
      alert('❌ Xác nhận thất bại: ' + (error.message || 'Vui lòng thử lại'));
    }
  };

  const handleStart = async (exchangeId) => {
    if (!confirm('Xác nhận cả hai đã có mặt và bắt đầu trao đổi sách?')) return;

    try {
      await startExchange(exchangeId);
      alert('✅ Đã bắt đầu trao đổi!');
      loadMeetings();
    } catch (error) {
      alert('❌ Bắt đầu trao đổi thất bại: ' + (error.message || 'Vui lòng thử lại'));
    }
  };

  const getFilterBadge = (filterType) => {
    const count = stats[filterType];
    const isActive = filter === filterType;
    
    return (
      <Button
        variant={isActive ? 'primary' : 'outline'}
        size="sm"
        onClick={() => handleFilterChange(filterType)}
        className={`flex items-center gap-2 ${isActive ? '' : 'hover:bg-gray-50'}`}
      >
        {filterType === 'all' && <Calendar className="w-4 h-4" />}
        {filterType === 'upcoming' && <Clock className="w-4 h-4" />}
        {filterType === 'past' && <CheckCircle className="w-4 h-4" />}
        {filterType === 'pending' && <AlertCircle className="w-4 h-4" />}
        
        <span className="capitalize">
          {filterType === 'all' && 'Tất cả'}
          {filterType === 'upcoming' && 'Sắp tới'}
          {filterType === 'past' && 'Đã qua'}
          {filterType === 'pending' && 'Chờ xác nhận'}
        </span>
        
        <Badge variant={isActive ? 'light' : 'default'} size="sm">
          {count}
        </Badge>
      </Button>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            Quản lý lịch hẹn
          </h1>
          <p className="text-gray-600">
            Xem và quản lý tất cả lịch hẹn trao đổi sách của bạn
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                <div className="text-sm text-blue-700">Tổng số</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-900">{stats.upcoming}</div>
                <div className="text-sm text-green-700">Sắp tới</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">{stats.past}</div>
                <div className="text-sm text-purple-700">Đã qua</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-900">{stats.pending}</div>
                <div className="text-sm text-orange-700">Chờ xác nhận</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Filter className="w-5 h-5" />
              Lọc:
            </div>
            {getFilterBadge('all')}
            {getFilterBadge('upcoming')}
            {getFilterBadge('past')}
            {getFilterBadge('pending')}
          </div>
        </Card>

        {/* Meetings List */}
        {meetings.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Không có lịch hẹn
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' && 'Chưa có lịch hẹn nào được đặt'}
              {filter === 'upcoming' && 'Không có lịch hẹn sắp tới'}
              {filter === 'past' && 'Không có lịch hẹn đã qua'}
              {filter === 'pending' && 'Không có lịch hẹn chờ xác nhận'}
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/exchange/list')}
            >
              Xem danh sách giao dịch
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {meetings.map((exchange) => {
              const currentUserId = user?.member?.member_id || user?.user_id;
              const isRequester = exchange.requester_id === currentUserId;
              const needsConfirmation = isRequester 
                ? !exchange.requester_confirmed_meeting 
                : !exchange.owner_confirmed_meeting;
              const bothConfirmed = exchange.requester_confirmed_meeting && exchange.owner_confirmed_meeting;

              return (
                <MeetingCard
                  key={exchange.exchange_id}
                  meeting={{
                    location: exchange.meeting_location,
                    datetime: exchange.meeting_time,
                    notes: exchange.meeting_notes,
                    requester_confirmed: exchange.requester_confirmed_meeting,
                    owner_confirmed: exchange.owner_confirmed_meeting,
                    status: exchange.status
                  }}
                  variant="compact"
                  currentUserId={currentUserId}
                  requesterId={exchange.requester_id}
                  ownerId={exchange.owner_id}
                  exchangeId={exchange.exchange_id}
                  onConfirm={needsConfirmation ? () => handleConfirm(exchange.exchange_id) : null}
                  onStart={bothConfirmed && exchange.status === 'MEETING_SCHEDULED' ? () => handleStart(exchange.exchange_id) : null}
                  onViewDetails={() => navigate(`/exchange/detail/${exchange.exchange_id}`)}
                />
              );
            })}
          </div>
        )}

        {/* Helpful Tips */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Mẹo hữu ích
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Xác nhận tham dự sớm để đối tác biết bạn sẽ đến</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Đến đúng giờ và mang theo sách đã hứa</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Kiểm tra kỹ tình trạng sách trước khi xác nhận hoàn tất</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Gặp mặt tại nơi công cộng, an toàn</span>
            </li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
};

export default MeetingManagementPage;
