import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge, Avatar } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';
import { ArrowLeft, AlertCircle, Send, RefreshCw, Eye } from 'lucide-react';

/**
 * Exchange Suggestions Page
 * Backend API: 
 * - POST /exchanges/suggestions/generate (tạo suggestions mới)
 * - GET /exchanges/suggestions?limit=20 (lấy suggestions)
 * Response: Array<ExchangeSuggestionDto>
 */
const ExchangeSuggestionsPage = () => {
  const navigate = useNavigate();
  const { getExchangeSuggestions, generateExchangeSuggestions } = useExchanges();

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const result = await getExchangeSuggestions(20);
      // Backend returns object with 'suggestions' array
      console.log('[Suggestions] Backend response:', result);
      console.log('[Suggestions] First suggestion:', result?.suggestions?.[0]);
      setSuggestions(result?.suggestions || []);
    } catch (error) {
      console.error('[Suggestions] Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!confirm('Tạo gợi ý trao đổi mới? Quá trình này có thể mất vài giây.')) return;
    
    setGenerating(true);
    try {
      const result = await generateExchangeSuggestions();
      // Backend returns 'total' not 'generated_count'
      alert(`Đã tạo ${result.total || 0} gợi ý mới!`);
      loadSuggestions();
    } catch (error) {
      alert('Thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateRequest = (suggestion) => {
    // Navigate to create request với pre-filled data
    const data = {
      receiver_info: {
        member_id: suggestion.member?.member_id,
        full_name: suggestion.member?.full_name,
        region: suggestion.member?.region,
        trust_score: suggestion.member?.trust_score
      },
      offered_books: suggestion.matching_books?.they_want_from_me?.map(item => item.my_book).filter(Boolean) || [],
      requested_books: suggestion.matching_books?.i_want_from_them?.map(item => item.their_book).filter(Boolean) || []
    };
    
    // Store in sessionStorage để form có thể lấy
    sessionStorage.setItem('exchange_request_draft', JSON.stringify(data));
    
    // Navigate to create request page
    navigate('/exchange/create-request');
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="text" onClick={() => navigate('/exchange')} className="mb-4 text-blue-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gợi ý trao đổi</h1>
              <p className="text-gray-600">Tìm người phù hợp để trao đổi sách</p>
            </div>
            <Button 
              variant="primary" 
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tạo gợi ý mới
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : suggestions.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có gợi ý</h3>
            <p className="text-gray-600 mb-6">
              Hệ thống chưa tìm thấy người phù hợp để trao đổi
            </p>
            <Button variant="primary" onClick={handleGenerate} disabled={generating}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Tạo gợi ý ngay
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {suggestions.map((suggestion) => {
              const otherUser = suggestion.member;
              const matchScore = suggestion.match_score || 0;
              const matchPercentage = Math.round(matchScore * 100);
              
              // Get book counts - try multiple field names
              const myBooksCount = suggestion.my_books_count 
                || suggestion.matching_books?.they_want_from_me?.length 
                || 0;
              const theirBooksCount = suggestion.their_books_count 
                || suggestion.matching_books?.i_want_from_them?.length 
                || 0;
              const totalMatching = suggestion.total_matching_books || 0;

              console.log('[Suggestion Card]', {
                suggestion_id: suggestion.suggestion_id,
                myBooksCount,
                theirBooksCount,
                totalMatching,
                matching_books: suggestion.matching_books
              });

              return (
                <Card key={suggestion.suggestion_id} className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={otherUser?.avatar_url} alt={otherUser?.full_name} size="lg" />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{otherUser?.full_name}</h4>
                        <p className="text-sm text-gray-600">{otherUser?.region}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" size="sm">⭐ {otherUser?.trust_score}</Badge>
                          <Badge variant={matchPercentage >= 70 ? 'success' : 'warning'} size="sm">
                            {matchPercentage}% phù hợp
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={suggestion.is_viewed ? 'default' : 'info'}>
                        {suggestion.is_viewed ? '👁️ Đã xem' : '🆕 Mới'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(suggestion.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>

                  {/* Books Exchange Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* I Can Offer */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Send className="w-4 h-4 text-blue-600" />
                        Tôi có thể đưa ({myBooksCount})
                      </h5>
                      <div className="space-y-2">
                        {suggestion.matching_books?.they_want_from_me && suggestion.matching_books.they_want_from_me.length > 0 ? (
                          suggestion.matching_books.they_want_from_me.map((item, idx) => {
                            const book = item.my_book;
                            if (!book) return null;
                            return (
                              <div key={book.book_id || idx} className="bg-white p-3 rounded-lg shadow-sm">
                                <div className="font-medium text-sm">{book.title}</div>
                                <div className="text-xs text-gray-600">{book.author}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" size="sm">{book.condition}</Badge>
                                  {book.category && <Badge variant="info" size="sm">{book.category}</Badge>}
                                </div>
                              </div>
                            );
                          })
                        ) : myBooksCount > 0 ? (
                          <p className="text-sm text-gray-500 italic">Có {myBooksCount} cuốn sách phù hợp</p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Không có sách nào</p>
                        )}
                      </div>
                    </div>

                    {/* They Can Offer */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-green-600" />
                        Họ có thể đưa ({theirBooksCount})
                      </h5>
                      <div className="space-y-2">
                        {suggestion.matching_books?.i_want_from_them && suggestion.matching_books.i_want_from_them.length > 0 ? (
                          suggestion.matching_books.i_want_from_them.map((item, idx) => {
                            const book = item.their_book;
                            if (!book) return null;
                            return (
                              <div key={book.book_id || idx} className="bg-white p-3 rounded-lg shadow-sm">
                                <div className="font-medium text-sm">{book.title}</div>
                                <div className="text-xs text-gray-600">{book.author}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" size="sm">{book.condition}</Badge>
                                  {book.category && <Badge variant="info" size="sm">{book.category}</Badge>}
                                </div>
                              </div>
                            );
                          })
                        ) : theirBooksCount > 0 ? (
                          <p className="text-sm text-gray-500 italic">Có {theirBooksCount} cuốn sách phù hợp</p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Không có sách nào</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Match Info */}
                  {totalMatching > 0 && (
                    <div className="bg-purple-50 p-3 rounded-lg mb-4 border border-purple-200">
                      <p className="text-sm text-purple-800">
                        ✨ Có <strong>{totalMatching}</strong> sách phù hợp với mong muốn của cả hai
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/profile/${otherUser?.user_id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Xem hồ sơ
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleCreateRequest(suggestion)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Gửi yêu cầu
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExchangeSuggestionsPage;
