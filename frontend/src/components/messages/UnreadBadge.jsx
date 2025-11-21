import React from 'react';
import Badge from '../ui/Badge';

const UnreadBadge = ({ count, showZero = false }) => {
  if (count === 0 && !showZero) {
    return null;
  }

  return (
    <Badge 
      variant="primary" 
      size="sm"
      className="min-w-5 flex justify-center"
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};

export default UnreadBadge;