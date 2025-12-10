import React from 'react';
import ExchangeCard from './ExchangeCard';
import { Pagination, LoadingSpinner } from '../ui';

const ExchangeList = ({ 
  exchanges = [], 
  loading = false,
  onViewDetail, 
  onConfirm,
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Đang tải danh sách trao đổi...</p>
      </div>
    );
  }

  if (exchanges.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có trao đổi nào</h3>
          <p className="text-gray-600">Bạn chưa thực hiện bất kỳ trao đổi nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {exchanges.map(exchange => (
          <ExchangeCard 
            key={exchange.exchange_id} 
            exchange={exchange}
            onViewDetail={onViewDetail}
            onConfirm={onConfirm}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ExchangeList;
