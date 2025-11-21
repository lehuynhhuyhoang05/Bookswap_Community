import React from 'react';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';

const ExchangeActionButtons = ({ exchange, onConfirm, onCancel, onViewDetail }) => {
  const { user } = useAuth();
  
  const isCurrentUserMemberA = user?.member_id === exchange.member_a.member_id;
  const canConfirm = exchange.status === 'ACCEPTED' && 
    ((isCurrentUserMemberA && !exchange.member_a_confirmed) || 
     (!isCurrentUserMemberA && !exchange.member_b_confirmed));

  const canCancel = exchange.status === 'PENDING' || exchange.status === 'ACCEPTED';

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onViewDetail}
      >
        Xem chi tiết
      </Button>
      
      {canConfirm && (
        <Button 
          variant="primary" 
          size="sm"
          onClick={onConfirm}
        >
          Xác nhận hoàn tất
        </Button>
      )}
      
      {canCancel && (
        <Button 
          variant="error" 
          size="sm"
          onClick={onCancel}
        >
          Hủy trao đổi
        </Button>
      )}
    </div>
  );
};

export default ExchangeActionButtons;
