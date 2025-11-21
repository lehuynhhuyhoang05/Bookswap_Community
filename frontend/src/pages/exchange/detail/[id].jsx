import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../../components/layout/Layout"; // ✅ Thêm Layout
import { Card, Button, LoadingSpinner, Avatar, Badge } from "../../../components/ui";
import { ExchangeTimeline, ExchangeStatusBadge } from "../../../components/exchanges";
import { useExchanges } from "../../../hooks/useExchanges";
import { useAuth } from "../../../hooks/useAuth";

const ExchangeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exchange, setExchange] = useState(null);
  const [loading, setLoading] = useState(true);

  const { getExchangeDetail, confirmExchange } = useExchanges();
  const { user } = useAuth();

  useEffect(() => {
    loadExchangeDetail();
  }, [id]);

  const loadExchangeDetail = async () => {
    try {
      const result = await getExchangeDetail(id);
      setExchange(result);
    } catch (error) {
      console.error('Không tải được chi tiết trao đổi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmExchange = async () => {
    try {
      await confirmExchange(id);
      loadExchangeDetail(); // Tải lại để cập nhật trạng thái
    } catch (error) {
      console.error('Không xác nhận được trao đổi:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="exchange-detail-loading">
          <LoadingSpinner size="lg" />
          <p>Đang tải chi tiết trao đổi...</p>
        </div>
      </Layout>
    );
  }

  if (!exchange) {
    return (
      <Layout>
        <div className="exchange-detail-not-found">
          <h2>Không tìm thấy trao đổi</h2>
          <p>Trao đổi bạn đang tìm kiếm không tồn tại.</p>
          <Button onClick={handleBack}>Quay lại</Button>
        </div>
      </Layout>
    );
  }

  const isCurrentUserMemberA = user?.member_id === exchange.member_a.member_id;
  const otherMember = isCurrentUserMemberA ? exchange.member_b : exchange.member_a;
  const canConfirm =
    exchange.status === 'ACCEPTED' &&
    ((isCurrentUserMemberA && !exchange.member_a_confirmed) ||
      (!isCurrentUserMemberA && !exchange.member_b_confirmed));

  return (
    <Layout>
      <div className="exchange-detail-page">
        <div className="page-header">
          <Button variant="text" onClick={handleBack}>
            ← Quay lại trao đổi
          </Button>
          <div className="header-title">
            <h1>Chi tiết trao đổi</h1>
            <ExchangeStatusBadge status={exchange.status} />
          </div>
        </div>

        <div className="exchange-detail-content">
          <div className="detail-section">
            <Card title="Thông tin trao đổi">
              <div className="exchange-info">
                <div className="info-item">
                  <strong>ID trao đổi:</strong> {exchange.exchange_id}
                </div>
                <div className="info-item">
                  <strong>Ngày tạo:</strong> {new Date(exchange.created_at).toLocaleString()}
                </div>
                {exchange.completed_at && (
                  <div className="info-item">
                    <strong>Ngày hoàn thành:</strong> {new Date(exchange.completed_at).toLocaleString()}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="detail-section">
            <Card title="Thành viên">
              <div className="members-grid">
                {[exchange.member_a, exchange.member_b].map((member, idx) => (
                  <div key={idx} className="member-card">
                    <div className="member-header">
                      <Avatar src={member.avatar_url} alt={member.full_name} size="lg" />
                      <div className="member-info">
                        <h4>{member.full_name}</h4>
                        <div className="member-badges">
                          {member.is_verified && <Badge variant="success">Đã xác thực</Badge>}
                          <Badge
                            variant={
                              (idx === 0 ? exchange.member_a_confirmed : exchange.member_b_confirmed)
                                ? 'success'
                                : 'warning'
                            }
                          >
                            {(idx === 0 ? exchange.member_a_confirmed : exchange.member_b_confirmed)
                              ? 'Đã xác nhận'
                              : 'Chưa xác nhận'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="detail-section">
            <Card title="Sách liên quan">
              <div className="books-list">
                {exchange.books.map((bookId, index) => (
                  <div key={index} className="book-item">
                    <span className="book-id">{bookId}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="detail-section">
            <ExchangeTimeline exchange={exchange} />
          </div>

          {canConfirm && (
            <div className="detail-actions">
              <Card>
                <div className="confirmation-prompt">
                  <h4>Xác nhận hoàn tất trao đổi</h4>
                  <p>
                    Vui lòng xác nhận rằng bạn đã nhận sách từ {otherMember.full_name} và trao đổi đã hoàn tất.
                  </p>
                  <Button variant="primary" onClick={handleConfirmExchange}>
                    Xác nhận hoàn tất
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExchangeDetailPage;
