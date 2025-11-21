import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout'; // ✅ Thêm Layout
import { ExchangeList, ExchangeStats } from '../../components/exchanges';
import { Tabs, Button } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';
import { useNavigate } from 'react-router-dom';

const ExchangePage = () => {
  const [exchanges, setExchanges] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);

  const { getExchanges, getExchangeStats, confirmExchange } = useExchanges();
  const navigate = useNavigate();

  useEffect(() => {
    loadExchanges();
    loadStats();
  }, [currentPage, activeTab]);

  // Load danh sách trao đổi
  const loadExchanges = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 12 };
      if (activeTab !== 'all') {
        params.status = activeTab.toUpperCase();
      }
      
      const result = await getExchanges(params);
      setExchanges(result.items || []);
      setTotalPages(result.pages || 1);
    } catch (error) {
      console.error('Không tải được danh sách trao đổi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load thống kê trao đổi
  const loadStats = async () => {
    try {
      const result = await getExchangeStats();
      setStats(result);
    } catch (error) {
      console.error('Không tải được thống kê:', error);
    }
  };

  // Xác nhận hoàn tất trao đổi
  const handleConfirmExchange = async (exchangeId) => {
    try {
      await confirmExchange(exchangeId);
      loadExchanges(); // Tải lại danh sách để cập nhật trạng thái
    } catch (error) {
      console.error('Xác nhận trao đổi thất bại:', error);
    }
  };

  // Xem chi tiết trao đổi
  const handleViewDetail = (exchangeId) => {
    navigate(`/exchange/detail/${exchangeId}`);
  };

  // Tạo yêu cầu trao đổi mới
  const handleCreateRequest = () => {
    navigate('/exchange/suggestions');
  };

  // Các tab trạng thái
  const statusTabs = [
    { id: 'all', label: 'Tất cả trao đổi' },
    { id: 'pending', label: 'Đang chờ' },
    { id: 'accepted', label: 'Đang tiến hành' },
    { id: 'completed', label: 'Hoàn tất' },
    { id: 'cancelled', label: 'Đã hủy' }
  ];

  return (
    <Layout>
      <div className="exchange-page">
        <div className="page-header">
          <h1>Trao đổi của tôi</h1>
          <Button variant="primary" onClick={handleCreateRequest}>
            Bắt đầu trao đổi mới
          </Button>
        </div>

        {stats && <ExchangeStats stats={stats} />}

        <div className="exchange-content">
          <Tabs 
            tabs={statusTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          
          <ExchangeList 
            exchanges={exchanges}
            loading={loading}
            onViewDetail={handleViewDetail}
            onConfirm={handleConfirmExchange}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ExchangePage;
