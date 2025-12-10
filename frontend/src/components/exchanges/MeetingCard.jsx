import React from 'react';
import { MapPin, Calendar, Clock, Check, X, AlertCircle, Navigation } from 'lucide-react';
import { Badge } from '../ui';

/**
 * MeetingCard Component
 * Compact card displaying meeting information
 */
const MeetingCard = ({ 
  meeting, 
  exchange,
  currentUserId,
  requesterId,
  ownerId,
  onConfirm,
  onStart,
  onCancel,
  onEdit,
  variant = 'full' // 'full' | 'compact' | 'reminder'
}) => {
  if (!meeting && !exchange?.meeting_location) {
    return null;
  }

  const meetingData = meeting || exchange;
  
  // Handle both datetime and meeting_time field names
  const dateTimeValue = meetingData.datetime || meetingData.meeting_time;
  const locationValue = meetingData.location || meetingData.meeting_location;
  const notesValue = meetingData.notes || meetingData.meeting_notes;
  
  if (!dateTimeValue) {
    return null; // No meeting scheduled
  }
  
  const meetingTime = new Date(dateTimeValue);
  const now = new Date();
  const timeDiff = meetingTime - now;
  const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
  const daysUntil = Math.floor(hoursUntil / 24);
  
  const isPast = timeDiff < 0;
  const isToday = daysUntil === 0 && hoursUntil >= 0;
  const isSoon = hoursUntil <= 24 && hoursUntil > 0;
  
  // Check confirmation status - backend stores in meeting.confirmed_by_a/b
  const isMemberA = currentUserId === requesterId;
  const currentMemberConfirmed = isMemberA
    ? (meetingData.meeting?.confirmed_by_a || meetingData.member_a_confirmed || meetingData.requester_confirmed_meeting)
    : (meetingData.meeting?.confirmed_by_b || meetingData.member_b_confirmed || meetingData.owner_confirmed_meeting);
  const otherMemberConfirmed = isMemberA
    ? (meetingData.meeting?.confirmed_by_b || meetingData.member_b_confirmed || meetingData.owner_confirmed_meeting)
    : (meetingData.meeting?.confirmed_by_a || meetingData.member_a_confirmed || meetingData.requester_confirmed_meeting);
  const bothConfirmed = currentMemberConfirmed && otherMemberConfirmed;

  // Debug logging
  console.log('[MeetingCard] Debug:', {
    currentUserId,
    requesterId,
    ownerId,
    isMemberA,
    confirmed_by_a: meetingData.meeting?.confirmed_by_a,
    confirmed_by_b: meetingData.meeting?.confirmed_by_b,
    currentMemberConfirmed,
    otherMemberConfirmed
  });

  const getTimeUntilText = () => {
    if (isPast) return '⚠️ Đã qua';
    if (isToday) {
      if (hoursUntil === 0) return '🔥 Ngay bây giờ!';
      return `🔥 Còn ${hoursUntil} giờ`;
    }
    if (daysUntil === 1) return '⏰ Ngày mai';
    if (daysUntil <= 7) return `📅 Còn ${daysUntil} ngày`;
    return `📆 ${meetingTime.toLocaleDateString('vi-VN')}`;
  };

  const getUrgencyColor = () => {
    if (isPast) return 'bg-red-50 border-red-200';
    if (isToday) return 'bg-orange-50 border-orange-300';
    if (isSoon) return 'bg-yellow-50 border-yellow-200';
    return 'bg-blue-50 border-blue-200';
  };

  // Compact variant for list views
  if (variant === 'compact') {
    return (
      <div className={`p-3 rounded-lg border-2 ${getUrgencyColor()} transition-all hover:shadow-md`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {locationValue}
            </span>
          </div>
          <Badge variant={bothConfirmed ? 'success' : 'warning'} size="sm">
            {bothConfirmed ? '✅ Đã xác nhận' : '⏳ Chờ xác nhận'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{getTimeUntilText()}</span>
          <span>•</span>
          <span>{meetingTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    );
  }

  // Reminder variant for dashboard
  if (variant === 'reminder') {
    return (
      <div className={`relative overflow-hidden rounded-lg border-2 ${getUrgencyColor()} p-4 shadow-md`}>
        {/* Urgency Indicator */}
        {isSoon && (
          <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
            GẤP!
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isToday ? 'bg-orange-500' : 'bg-blue-500'
          } text-white`}>
            <Calendar className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">
              {isToday ? '🔥 Gặp mặt HÔM NAY!' : 'Lịch hẹn sắp tới'}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              với {exchange?.member_b?.full_name || 'thành viên khác'}
            </p>

            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{locationValue}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4" />
                <span>{getTimeUntilText()} - {meetingTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {!bothConfirmed && (
              <div className="mt-3 p-2 bg-yellow-100 rounded-md text-xs text-yellow-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Chờ {otherMemberConfirmed ? 'bạn' : 'đối phương'} xác nhận
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                Chỉ đường
              </button>
              {bothConfirmed && exchange?.status === 'MEETING_SCHEDULED' && (
                <button 
                  onClick={onConfirm}
                  className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-md hover:bg-green-600 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Bắt đầu
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full variant for detail page
  return (
    <div className={`relative rounded-lg border-2 ${getUrgencyColor()} overflow-hidden`}>
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Thông tin lịch hẹn
          </h3>
          {bothConfirmed ? (
            <Badge className="bg-green-500 text-white border-0">
              <Check className="w-4 h-4 mr-1" />
              Cả hai đã xác nhận
            </Badge>
          ) : (
            <Badge className="bg-yellow-500 text-white border-0">
              <Clock className="w-4 h-4 mr-1" />
              Chờ xác nhận
            </Badge>
          )}
        </div>
        <div className="text-purple-100 text-sm">
          {getTimeUntilText()} • {meetingTime.toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Location */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">Địa điểm</div>
            <div className="font-semibold text-gray-900 text-lg">
              {locationValue}
            </div>
            {meetingData.latitude && meetingData.longitude && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${meetingData.latitude},${meetingData.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center gap-1"
              >
                <Navigation className="w-4 h-4" />
                Xem bản đồ & chỉ đường
              </a>
            )}
          </div>
        </div>

        {/* Time */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">Thời gian</div>
            <div className="font-semibold text-gray-900 text-lg">
              {meetingTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {!isPast && `${getTimeUntilText()}`}
              {isPast && <span className="text-red-600">⚠️ Thời gian đã qua</span>}
            </div>
          </div>
        </div>

        {/* Notes */}
        {notesValue && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              💬
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">Ghi chú</div>
              <div className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                {notesValue}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Status */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg ${currentMemberConfirmed ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-100 border-2 border-gray-300'}`}>
              <div className="text-xs text-gray-600 mb-1">Bạn</div>
              <div className="font-semibold text-sm flex items-center gap-1">
                {currentMemberConfirmed ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">Đã xác nhận</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Chưa xác nhận</span>
                  </>
                )}
              </div>
            </div>

            <div className={`p-3 rounded-lg ${otherMemberConfirmed ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-100 border-2 border-gray-300'}`}>
              <div className="text-xs text-gray-600 mb-1">Đối phương</div>
              <div className="font-semibold text-sm flex items-center gap-1">
                {otherMemberConfirmed ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">Đã xác nhận</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Chưa xác nhận</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {onConfirm && !currentMemberConfirmed && (
          <div className="border-t pt-4">
            <button
              onClick={onConfirm}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Xác nhận lịch hẹn này
            </button>
          </div>
        )}

        {onStart && bothConfirmed && (
          <div className="border-t pt-4">
            <button
              onClick={onStart}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Bắt đầu trao đổi
            </button>
          </div>
        )}

        {onEdit && (
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            ✏️ Chỉnh sửa lịch hẹn
          </button>
        )}
      </div>
    </div>
  );
};

export default MeetingCard;
