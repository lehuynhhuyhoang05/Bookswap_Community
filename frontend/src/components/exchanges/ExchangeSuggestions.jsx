import React from 'react';
import { Card, Button, Badge, Avatar, Tooltip } from '../ui';

const ExchangeSuggestions = ({ 
  suggestions = [], 
  onViewSuggestion, 
  onMarkAsViewed,
  onCreateExchange 
}) => {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Hiện tại không có gợi ý trao đổi nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map(suggestion => (
        <Card key={suggestion.suggestion_id} className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-start gap-3">
              <Avatar 
                src={suggestion.member.avatar_url} 
                alt={suggestion.member.full_name}
              />
              <div>
                <h4 className="font-semibold text-gray-900">{suggestion.member.full_name}</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="text-sm text-gray-600">⭐ {suggestion.member.average_rating}</span>
                  <span className="text-sm text-gray-600">🔄 {suggestion.member.completed_exchanges} lần trao đổi</span>
                  {suggestion.member.is_verified && (
                    <Badge variant="success" size="sm">Đã xác minh</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Tooltip content={`Chi tiết điểm khớp: ${JSON.stringify(suggestion.score_breakdown, null, 2)}`}>
                <Badge variant="primary">
                  {(suggestion.match_score * 100).toFixed(1)}% Khớp
                </Badge>
              </Tooltip>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Họ muốn từ tôi:</h5>
              <div className="space-y-2">
                {suggestion.matching_books.they_want_from_me.map((match, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{match.my_book.title}</div>
                      <div className="text-xs text-gray-600">tác giả: {match.my_book.author}</div>
                    </div>
                    <Badge variant="outline">
                      {(match.match_score * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Tôi muốn từ họ:</h5>
              <div className="space-y-2">
                {suggestion.matching_books.i_want_from_them.map((match, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium text-sm">{match.their_book.title}</div>
                      <div className="text-xs text-gray-600">tác giả: {match.their_book.author}</div>
                    </div>
                    <Badge variant="outline">
                      {(match.match_score * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onMarkAsViewed(suggestion.suggestion_id)}
            >
              Bỏ qua
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => onCreateExchange(suggestion)}
            >
              Bắt đầu trao đổi
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ExchangeSuggestions;
