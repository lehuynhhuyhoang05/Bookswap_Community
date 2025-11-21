import React from 'react';

const ExchangeStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Sent Requests',
      value: stats?.total_requests_sent || 0,
      description: 'Requests you sent',
      color: 'blue'
    },
    {
      title: 'Received Requests',
      value: stats?.total_requests_received || 0,
      description: 'Requests you received',
      color: 'green'
    },
    {
      title: 'Pending Requests',
      value: stats?.pending_requests || 0,
      description: 'Awaiting response',
      color: 'yellow'
    },
    {
      title: 'Active Exchanges',
      value: stats?.active_exchanges || 0,
      description: 'In progress',
      color: 'indigo'
    },
    {
      title: 'Completed Exchanges',
      value: stats?.completed_exchanges || 0,
      description: 'Successfully finished',
      color: 'purple'
    },
    {
      title: 'Success Rate',
      value: `${stats?.success_rate || 0}%`,
      description: 'Exchange success rate',
      color: 'emerald'
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
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Exchange Statistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className={`border rounded-lg p-4 text-center ${getColorClasses(stat.color)}`}
          >
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="font-medium mb-1">{stat.title}</div>
            <div className="text-sm opacity-80">{stat.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExchangeStats;