import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Online Status Component
 * Hiển thị trạng thái online/offline và thời gian hoạt động cuối
 */
const OnlineStatus = ({ isOnline, lastSeenAt }) => {
  if (isOnline) {
    return (
      <div className="flex items-center gap-1 text-sm text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Đang hoạt động</span>
      </div>
    );
  }

  if (lastSeenAt) {
    const lastSeenText = formatDistanceToNow(new Date(lastSeenAt), {
      addSuffix: true,
      locale: vi,
    });

    return (
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span>Hoạt động {lastSeenText}</span>
      </div>
    );
  }

  return null;
};

export default OnlineStatus;
