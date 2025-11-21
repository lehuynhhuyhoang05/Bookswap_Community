import React, { useState, useEffect } from 'react';
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

  const { 
    getExchangeSuggestions, 
    generateExchangeSuggestions, 
    markSuggestionAsViewed,
    createExchangeRequest 
  } = useExchanges();

  useEffect(() => {
    loadSuggestions();
  }, []);

  // Load gợi ý
  const loadSuggestions = async () => {
    console.log("Đang tải gợi ý...");
    setLoading(true);
    try {
      const result = await getExchangeSuggestions(20);
      console.log("Gợi ý tải xong:", result);
      setSuggestions(result.suggestions || result.items || []);
    } catch (error) {
      console.error('Không tải được gợi ý trao đổi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo gợi ý mới
  const handleGenerateSuggestions = async () => {
    console.log("Bấm tạo gợi ý mới...");
    setGenerating(true);
    try {
      const result = await generateExchangeSuggestions();
      console.log("API tạo gợi ý trả về:", result);
      await loadSuggestions(); // tải lại danh sách
    } catch (error) {
      console.error('Không tạo được gợi ý mới:', error);
      alert('Không tạo được gợi ý mới, kiểm tra console');
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

  return (
    <Layout>
      <div className="exchange-suggestions-page max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Gợi ý trao đổi</h1>
          <button
            onClick={handleGenerateSuggestions}
            disabled={generating}
            className={`px-4 py-2 rounded text-white font-medium ${
              generating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {generating ? 'Đang tạo...' : 'Tạo gợi ý mới'}
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Đây là các gợi ý trao đổi cá nhân hóa dựa trên thư viện và sở thích của bạn. 
          Bắt đầu một trao đổi bằng cách gửi yêu cầu tới bất kỳ người dùng nào trong số này.
        </p>

        {loading ? (
          <div className="flex flex-col items-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Đang tải gợi ý...</p>
          </div>
        ) : (
          <ExchangeSuggestions 
            suggestions={suggestions}
            onViewSuggestion={(suggestion) => console.log('Xem:', suggestion)}
            onMarkAsViewed={handleMarkAsViewed}
            onCreateExchange={handleCreateExchange}
          />
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
