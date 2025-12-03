// src/pages/reports/detail/[id].jsx
import { AlertCircle, ArrowLeft, Calendar, FileText, User, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../../components/layout/Layout';
import { Badge, Button, Card, LoadingSpinner } from '../../../components/ui';
import { useReports } from '../../../hooks/useReports';
import ReportSeverityBadge from '../../../components/reports/ReportSeverityBadge';

const ReportDetailPage = () => {
  const { reportId } = useParams();  // Match route param name :reportId
  const navigate = useNavigate();
  const { getReportById, getReportTypeLabel, getStatusLabel, loading } =
    useReports();

  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReportDetail();
  }, [reportId]);

  const loadReportDetail = async () => {
    try {
      setError('');
      const data = await getReportById(reportId);
      setReport(data);
    } catch (err) {
      console.error('[ReportDetail] Failed to load:', err);
      setError(err.message || 'Không thể tải thông tin báo cáo');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      PENDING: { variant: 'warning', label: 'Chờ xử lý', icon: '⏳' },
      IN_REVIEW: { variant: 'info', label: 'Đang xem xét', icon: '🔍' },
      RESOLVED: { variant: 'success', label: 'Đã xử lý', icon: '✅' },
      DISMISSED: { variant: 'default', label: 'Đã từ chối', icon: '❌' },
    };
    const statusConfig = config[status] || config.PENDING;
    return (
      <Badge variant={statusConfig.variant} className="text-base px-4 py-2">
        {statusConfig.icon} {statusConfig.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="text"
            onClick={() => navigate('/reports')}
            className="mb-4 text-blue-600"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không thể tải báo cáo
            </h3>
            <p className="text-gray-600">{error}</p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="text"
          onClick={() => navigate('/reports')}
          className="mb-6 text-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách báo cáo
        </Button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Chi tiết báo cáo
              </h1>
              <p className="text-gray-600">ID: {report.report_id}</p>
            </div>
            {getStatusBadge(report.status)}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Report Type */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Thông tin báo cáo
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Loại vi phạm
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {getReportTypeLabel(report.report_type)}
                </p>
              </div>

              {/* Severity Level */}
              {report.severity && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Mức độ nghiêm trọng
                  </label>
                  <ReportSeverityBadge severity={report.severity} />
                </div>
              )}

              {report.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Mô tả chi tiết
                  </label>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {report.description}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Reported Member Info */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Thông tin thành viên bị báo cáo
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  ID thành viên
                </label>
                <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">
                  {report.reported_member_id}
                </p>
              </div>

              {report.reported_member_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tên thành viên
                  </label>
                  <p className="text-gray-900 font-medium">
                    {report.reported_member_name}
                  </p>
                </div>
              )}

              {report.reported_item_type && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Loại nội dung
                    </label>
                    <p className="text-gray-900">{report.reported_item_type}</p>
                  </div>
                  {report.reported_item_id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        ID nội dung
                      </label>
                      <p className="text-gray-900 font-mono text-sm">
                        {report.reported_item_id}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {report.reported_item_title && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tiêu đề nội dung
                  </label>
                  <p className="text-gray-900">{report.reported_item_title}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Evidence Section */}
          {report.evidence_urls && report.evidence_urls.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ImageIcon className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Bằng chứng đính kèm ({report.evidence_urls.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.evidence_urls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-all group"
                  >
                    <div className="relative">
                      <img
                        src={url}
                        alt={`Bằng chứng ${index + 1}`}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-48 bg-gray-100 flex items-center justify-center">
                              <div class="text-center text-gray-500">
                                <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p class="text-sm">Tài liệu</p>
                              </div>
                            </div>
                          `;
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                          Xem chi tiết
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 text-xs text-gray-600 text-center">
                      Bằng chứng #{index + 1}
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Thời gian</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Ngày tạo báo cáo
                </label>
                <p className="text-gray-900">
                  {new Date(report.created_at).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {report.updated_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Cập nhật lần cuối
                  </label>
                  <p className="text-gray-900">
                    {new Date(report.updated_at).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}

              {report.reviewed_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Ngày xem xét
                  </label>
                  <p className="text-gray-900">
                    {new Date(report.reviewed_at).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Admin Response */}
          {(report.admin_notes ||
            report.review_result ||
            report.resolution) && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Phản hồi từ Admin
              </h2>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {report.admin_notes ||
                    report.review_result ||
                    report.resolution}
                </p>
              </div>
            </Card>
          )}

          {/* Status Info */}
          {report.status === 'PENDING' && (
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">
                    Báo cáo đang chờ xử lý
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Đội ngũ quản trị sẽ xem xét báo cáo của bạn trong thời gian
                    sớm nhất.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {report.status === 'IN_REVIEW' && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">
                    Báo cáo đang được xem xét
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Chúng tôi đang xem xét báo cáo của bạn và sẽ có phản hồi
                    sớm.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReportDetailPage;
