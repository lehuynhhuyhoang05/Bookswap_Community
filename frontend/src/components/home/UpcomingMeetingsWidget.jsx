import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, LoadingSpinner } from '../ui';
import { MeetingCard } from '../exchanges';
import { exchangeService } from '../../services/api/exchanges';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

/**
 * Dashboard Widget for Upcoming Meetings
 * Shows next 3 upcoming meetings with quick actions
 */
const UpcomingMeetingsWidget = ({ currentUserId }) => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUpcomingMeetings();
  }, []);

  const loadUpcomingMeetings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get exchanges with meetings
      const response = await exchangeService.getExchanges({
        status: 'MEETING_SCHEDULED',
        page: 1,
        limit: 10
      });

      // Filter for upcoming meetings only
      const now = new Date();
      const upcomingMeetings = (response.data || response.items || [])
        .filter(exchange => {
          if (!exchange.meeting_time) return false;
          const meetingTime = new Date(exchange.meeting_time);
          return meetingTime > now;
        })
        .sort((a, b) => new Date(a.meeting_time) - new Date(b.meeting_time))
        .slice(0, 3); // Show max 3

      setMeetings(upcomingMeetings);
    } catch (err) {
      console.error('Failed to load upcoming meetings:', err);
      setError('Không thể tải lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadUpcomingMeetings();
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Lịch hẹn sắp tới
          </h3>
        </div>
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Lịch hẹn sắp tới
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={handleRefresh}>
            Thử lại
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-purple-600" />
          Lịch hẹn sắp tới
        </h3>
        <Button
          variant="text"
          size="sm"
          onClick={() => navigate('/exchange/list?status=MEETING_SCHEDULED')}
          className="text-purple-600 hover:text-purple-700"
        >
          Xem tất cả
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {meetings.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Không có lịch hẹn sắp tới</p>
          <p className="text-sm text-gray-500">
            Các cuộc hẹn đã đặt lịch sẽ hiển thị ở đây
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map((exchange) => (
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
              variant="reminder"
              currentUserId={currentUserId}
              requesterId={exchange.requester_id}
              ownerId={exchange.owner_id}
              exchangeId={exchange.exchange_id}
              onViewDetails={() => navigate(`/exchange/detail/${exchange.exchange_id}`)}
            />
          ))}

          {meetings.length >= 3 && (
            <div className="text-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/exchange/list?status=MEETING_SCHEDULED')}
              >
                Xem thêm lịch hẹn
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default UpcomingMeetingsWidget;
