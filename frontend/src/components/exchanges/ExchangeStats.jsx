import React from 'react';
import { Send, Inbox, Clock, RefreshCw, CheckCircle, TrendingUp } from 'lucide-react';

const ExchangeStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Sent Requests',
      titleVi: 'Yêu cầu đã gửi',
      value: stats?.total_requests_sent || 0,
      description: 'Requests you sent',
      descriptionVi: 'Yêu cầu bạn đã gửi',
      color: 'blue',
      icon: Send
    },
    {
      title: 'Received Requests',
      titleVi: 'Yêu cầu nhận được',
      value: stats?.total_requests_received || 0,
      description: 'Requests you received',
      descriptionVi: 'Yêu cầu bạn nhận được',
      color: 'green',
      icon: Inbox
    },
    {
      title: 'Pending Requests',
      titleVi: 'Yêu cầu đang chờ',
      value: stats?.pending_requests || 0,
      description: 'Awaiting response',
      descriptionVi: 'Đang chờ phản hồi',
      color: 'yellow',
      icon: Clock
    },
    {
      title: 'Active Exchanges',
      titleVi: 'Trao đổi đang diễn ra',
      value: stats?.active_exchanges || 0,
      description: 'In progress',
      descriptionVi: 'Đang tiến hành',
      color: 'indigo',
      icon: RefreshCw
    },
    {
      title: 'Completed Exchanges',
      titleVi: 'Trao đổi hoàn tất',
      value: stats?.completed_exchanges || 0,
      description: 'Successfully finished',
      descriptionVi: 'Hoàn tất thành công',
      color: 'purple',
      icon: CheckCircle
    },
    {
      title: 'Success Rate',
      titleVi: 'Tỷ lệ thành công',
      value: `${Math.round(stats?.success_rate || 0)}%`,
      description: 'Exchange success rate',
      descriptionVi: 'Tỷ lệ trao đổi thành công',
      color: 'emerald',
      icon: TrendingUp
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`border rounded-lg p-4 text-center transition-all hover:shadow-md ${getColorClasses(stat.color)}`}
            >
              <div className="flex justify-center mb-2">
                <Icon className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="font-semibold text-base mb-1">{stat.titleVi}</div>
              <div className="text-xs opacity-75">{stat.descriptionVi}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExchangeStats;