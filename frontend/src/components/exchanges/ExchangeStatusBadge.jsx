import React from 'react';
import { Badge } from '../ui';

const ExchangeStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    const config = {
      PENDING: { variant: 'warning', label: 'Pending' },
      ACCEPTED: { variant: 'info', label: 'Accepted' },
      COMPLETED: { variant: 'success', label: 'Completed' },
      CANCELLED: { variant: 'error', label: 'Cancelled' },
      REJECTED: { variant: 'error', label: 'Rejected' }
    };
    
    return config[status] || { variant: 'default', label: status };
  };

  const { variant, label } = getStatusConfig(status);

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
};

export default ExchangeStatusBadge;