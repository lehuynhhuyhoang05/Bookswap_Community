import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, BookOpen, Search } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { ExchangeSuggestions, ExchangeRequestForm } from '../../components/exchanges';
import { Button, LoadingSpinner } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';

const ExchangeSuggestionsPage = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const { 
    getExchangeSuggestions, 
    generateExchangeSuggestions, 
    markSuggestionAsViewed,
    createExchangeRequest 
  } = useExchanges();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getExchangeSuggestions(20);
      setSuggestions(result.suggestions || []);
    } catch (err) {
      console.error('Failed to load suggestions:', err);
      setError(err.message || 'Không thể tải gợi ý trao đổi');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await generateExchangeSuggestions();
      if (result.total > 0) {
        await loadSuggestions();
      } else {
        setError('Không tìm thấy gợi ý phù hợp. Hãy thêm sách vào thư viện và danh sách mong muốn.');
      }
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
      setError(err.message || 'Không thể tạo gợi ý mới');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsViewed = async (suggestionId) => {
    try {
      await markSuggestionAsViewed(suggestionId);
      setSuggestions(prev => prev.filter(s => s.suggestion_id !== suggestionId));
    } catch (error) {
      console.error('Không đánh dấu gợi ý đã xem:', error);
    }
  };

  const handleCreateExchange = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setShowRequestForm(true);
  };

  const handleSubmitRequest = async (requestData) => {
    try {
      await createExchangeRequest(requestData);
      setShowRequestForm(false);
      setSelectedSuggestion(null);
      alert('Yêu cầu trao đổi gửi thành công!');
    } catch (error) {
      console.error('Không tạo được yêu cầu trao đổi:', error);
      alert('Gửi yêu cầu thất bại, kiểm tra console');
    }
  };

  const renderEmptyState = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div className="flex justify-center mb-4">
        <Search className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Chưa có gợi ý trao đổi
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Để nhận gợi ý trao đổi, bạn cần:
      </p>
      <div className="space-y-3 mb-8 max-w-md mx-auto text-left">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Có sách trong thư viện</p>
            <p className="text-sm text-gray-600">Thêm sách bạn sẵn sàng trao đổi</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Có sách mong muốn</p>
            <p className="text-sm text-gray-600">Thêm sách bạn đang tìm kiếm</p>
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-center">
        <Button
          onClick={() => window.location.href = '/books/my-library'}
          variant="outline"
        >
          Thư viện của tôi
        </Button>
        <Button
          onClick={() => window.location.href = '/library/wanted-books'}
          variant="outline"
        >
          Sách mong muốn
        </Button>
        <Button
          onClick={handleGenerateSuggestions}
          disabled={generating}
          variant="primary"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử tạo gợi ý
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="exchange-suggestions-page max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gợi ý trao đổi</h1>
            <p className="text-gray-600 mt-1">
              Tìm kiếm các cơ hội trao đổi sách phù hợp với bạn
            </p>
          </div>
          <button
            onClick={handleGenerateSuggestions}
            disabled={generating || loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              generating || loading
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Đang tạo...' : 'Tạo gợi ý mới'}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-red-900">Không thể tải gợi ý</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600 font-medium">Đang tải gợi ý trao đổi...</p>
            <p className="text-sm text-gray-500 mt-1">Vui lòng đợi trong giây lát</p>
          </div>
        ) : suggestions.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">
                    Tìm thấy {suggestions.length} gợi ý phù hợp
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Các gợi ý được xếp hạng dựa trên mức độ phù hợp, vị trí địa lý và uy tín người dùng
                  </p>
                </div>
              </div>
            </div>

            <ExchangeSuggestions 
              suggestions={suggestions}
              onViewSuggestion={(suggestion) => console.log('View:', suggestion)}
              onMarkAsViewed={handleMarkAsViewed}
              onCreateExchange={handleCreateExchange}
            />
          </>
        )}

        {showRequestForm && selectedSuggestion && (
          <ExchangeRequestForm
            isOpen={showRequestForm}
            onClose={() => {
              setShowRequestForm(false);
              setSelectedSuggestion(null);
            }}
            onSubmit={handleSubmitRequest}
            receiver={selectedSuggestion.member}
            initialData={{
              offeredBooks: selectedSuggestion.matching_books.they_want_from_me.map(m => m.my_book),
              requestedBooks: selectedSuggestion.matching_books.i_want_from_them.map(m => m.their_book),
              message: `Xin chào ${selectedSuggestion.member.full_name}! Mình thấy chúng ta có một số sách có thể trao đổi. Bạn có muốn không?`
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default ExchangeSuggestionsPage;
