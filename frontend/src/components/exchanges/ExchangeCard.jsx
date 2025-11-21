import React from 'react';
import { Badge, Button, Avatar } from '../ui';
import ExchangeStatusBadge from './ExchangeStatusBadge';
import { useAuth } from '../../hooks/useAuth';

const ExchangeCard = ({ exchange, onViewDetail, onConfirm }) => {
  const { user } = useAuth();
  
  const isCurrentUserMemberA = user?.member_id === exchange.member_a.member_id;
  const otherMember = isCurrentUserMemberA ? exchange.member_b : exchange.member_a;
  
  const canConfirm = exchange.status === 'ACCEPTED' && 
    ((isCurrentUserMemberA && !exchange.member_a_confirmed) || 
     (!isCurrentUserMemberA && !exchange.member_b_confirmed));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Trao đổi với {otherMember.full_name}
          </h3>
          <ExchangeStatusBadge status={exchange.status} />
        </div>
        <div className="text-sm text-gray-500">
          {new Date(exchange.created_at).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Avatar 
          src={otherMember.avatar_url} 
          alt={otherMember.full_name}
          size="sm"
        />
        <span className="font-medium text-gray-900">{otherMember.full_name}</span>
        {otherMember.is_verified && (
          <Badge variant="success" size="sm">Đã xác thực</Badge>
        )}
      </div>

      <div className="mb-3">
        <div className="text-gray-600 text-sm">
          <span>{exchange.books.length} sách liên quan</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Xác nhận của bạn: </span>
          <Badge 
            variant={isCurrentUserMemberA ? 
              (exchange.member_a_confirmed ? "success" : "warning") :
              (exchange.member_b_confirmed ? "success" : "warning")
            }
          >
            {isCurrentUserMemberA ? 
              (exchange.member_a_confirmed ? "Đã xác nhận" : "Chưa xác nhận") :
              (exchange.member_b_confirmed ? "Đã xác nhận" : "Chưa xác nhận")
            }
          </Badge>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Xác nhận của {otherMember.full_name}: </span>
          <Badge 
            variant={isCurrentUserMemberA ? 
              (exchange.member_b_confirmed ? "success" : "warning") :
              (exchange.member_a_confirmed ? "success" : "warning")
            }
          >
            {isCurrentUserMemberA ? 
              (exchange.member_b_confirmed ? "Đã xác nhận" : "Chưa xác nhận") :
              (exchange.member_a_confirmed ? "Đã xác nhận" : "Chưa xác nhận")
            }
          </Badge>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onViewDetail(exchange.exchange_id)}
        >
          Xem chi tiết
        </Button>
        
        {canConfirm && (
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => onConfirm(exchange.exchange_id)}
          >
            Xác nhận hoàn tất
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExchangeCard;
