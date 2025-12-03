// src/pages/reports/index.jsx
import { AlertCircle, ChevronRight, Eye, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Badge, Button, Card, LoadingSpinner } from '../../components/ui';
import { useReports } from '../../hooks/useReports';
import ReportSeverityBadge from '../../components/reports/ReportSeverityBadge';

const ReportsListPage = () => {
  const navigate = useNavigate();
  const { getMyReports, getReportTypeLabel, getStatusLabel, loading } =
    useReports();

  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, [pagination.page]);

  const loadReports = async () => {
    try {
      setError('');
      const data = await getMyReports({
        page: pagination.page,
        limit: pagination.limit,
      });

      // Handle both response formats
      const reportsList = data.reports || data.items || [];
      const total = data.total || 0;

      setReports(reportsList);
      setPagination((prev) => ({
        ...prev,
        total: total,
      }));
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError(err.message || 'Không thể tải danh sách báo cáo');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { variant: 'warning', label: 'Chờ xử lý' },
      IN_REVIEW: { variant: 'info', label: 'Đang xem xét' },
      RESOLVED: { variant: 'success', label: 'Đã xử lý' },
      DISMISSED: { variant: 'default', label: 'Đã từ chối' },
    };
    const statusConfig = config[status] || config.PENDING;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Báo cáo của tôi
              </h1>
              <p className="text-gray-600">
                Quản lý các báo cáo vi phạm bạn đã gửi
              </p>
            </div>
            <Badge variant="info" className="text-lg px-4 py-2">
              {pagination.total} báo cáo
            </Badge>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </Card>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : reports.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có báo cáo nào
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn chưa gửi báo cáo vi phạm nào
            </p>
          </Card>
        ) : (
          <>
            {/* Reports List */}
            <div className="space-y-4">
              {reports.map((report) => (
                <Card
                  key={report.report_id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/reports/${report.report_id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {getReportTypeLabel(report.report_type)}
                        </h3>
                        {getStatusBadge(report.status)}
                        {report.severity && (
                          <ReportSeverityBadge severity={report.severity} />
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">
                            Thành viên bị báo cáo:
                          </span>{' '}
                          {report.reported_member_id}
                        </p>
                        {report.reported_item_type && (
                          <p>
                            <span className="font-medium">Loại nội dung:</span>{' '}
                            {report.reported_item_type}
                          </p>
                        )}
                        <p className="text-gray-500">
                          Ngày tạo:{' '}
                          {new Date(report.created_at).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reports/${report.report_id}`);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Chi tiết
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  Trước
                </Button>
                <span className="py-2 px-4 text-gray-700">
                  Trang {pagination.page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page >= totalPages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ReportsListPage;
