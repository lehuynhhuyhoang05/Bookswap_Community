import React from 'react';

const ExchangeTimeline = ({ exchange }) => {
  const events = [
    {
      date: exchange.created_at,
      title: 'Tạo trao đổi',
      description: 'Đã khởi tạo trao đổi',
      status: 'completed'
    }
  ];

  if (exchange.status === 'ACCEPTED') {
    events.push({
      date: exchange.updated_at,
      title: 'Trao đổi được chấp nhận',
      description: 'Cả hai bên đã đồng ý trao đổi',
      status: 'completed'
    });
  }

  if (exchange.member_a_confirmed) {
    events.push({
      date: exchange.member_a_confirmed_at,
      title: `${exchange.member_a.full_name} đã xác nhận`,
      description: 'Thành viên đã xác nhận hoàn tất',
      status: 'completed'
    });
  }

  if (exchange.member_b_confirmed) {
    events.push({
      date: exchange.member_b_confirmed_at,
      title: `${exchange.member_b.full_name} đã xác nhận`,
      description: 'Thành viên đã xác nhận hoàn tất',
      status: 'completed'
    });
  }

  if (exchange.status === 'COMPLETED') {
    events.push({
      date: exchange.completed_at,
      title: 'Trao đổi hoàn tất',
      description: 'Trao đổi đã được hoàn tất thành công',
      status: 'completed'
    });
  }

  // Sắp xếp các sự kiện theo thời gian
  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Dòng thời gian trao đổi</h4>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="relative flex items-start">
              <div className="absolute left-3 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></div>
              <div className="ml-8">
                <h5 className="font-medium text-gray-900">{event.title}</h5>
                <p className="text-sm text-gray-600">{event.description}</p>
                <small className="text-xs text-gray-500">
                  {new Date(event.date).toLocaleString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExchangeTimeline;
