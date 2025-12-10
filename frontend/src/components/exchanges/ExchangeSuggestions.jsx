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
            {/* Họ muốn từ tôi */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-blue-600">📤</span>
                Họ muốn từ tôi ({suggestion.matching_books.they_want_from_me?.length || 0})
              </h5>
              <div className="space-y-2">
                {(suggestion.matching_books.they_want_from_me || []).map((match, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      {match.my_book?.cover_image && (
                        <img 
                          src={match.my_book.cover_image} 
                          alt={match.my_book.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {match.my_book?.title || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {match.my_book?.author || 'N/A'}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" size="sm">
                            {match.my_book?.condition || 'N/A'}
                          </Badge>
                          <Badge variant="outline" size="sm">
                            Độ ưu tiên: {match.their_want?.priority || 'NORMAL'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!suggestion.matching_books.they_want_from_me || suggestion.matching_books.they_want_from_me.length === 0) && (
                  <p className="text-sm text-gray-500 italic">Không có sách nào</p>
                )}
              </div>
            </div>

            {/* Tôi muốn từ họ */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-green-600">📥</span>
                Tôi muốn từ họ ({suggestion.matching_books.i_want_from_them?.length || 0})
              </h5>
              <div className="space-y-2">
                {(suggestion.matching_books.i_want_from_them || []).map((match, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      {match.their_book?.cover_image && (
                        <img 
                          src={match.their_book.cover_image} 
                          alt={match.their_book.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {match.their_book?.title || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {match.their_book?.author || 'N/A'}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" size="sm">
                            {match.their_book?.condition || 'N/A'}
                          </Badge>
                          <Badge variant="outline" size="sm">
                            Độ ưu tiên: {match.my_want?.priority || 'NORMAL'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(!suggestion.matching_books.i_want_from_them || suggestion.matching_books.i_want_from_them.length === 0) && (
                  <p className="text-sm text-gray-500 italic">Không có sách nào</p>
                )}
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
