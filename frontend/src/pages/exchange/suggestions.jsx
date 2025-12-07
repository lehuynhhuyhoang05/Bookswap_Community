import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, Button, LoadingSpinner, Badge, Avatar } from '../../components/ui';
import { useExchanges } from '../../hooks/useExchanges';
import { 
  ArrowLeft, 
  AlertCircle, 
  Send, 
  RefreshCw, 
  Eye,
  Target,
  Sparkles,
  Star,
  MapPin,
  BookOpen,
  ArrowRight,
  Zap,
  Heart,
  Users,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  X,
  Trash2,
  Filter,
  SortDesc,
  MessageCircle
} from 'lucide-react';
import { toDisplayScore } from '../../utils/trustScore';

/**
 * Exchange Suggestions Page
 * Backend API: 
 * - POST /exchanges/suggestions/generate (tạo suggestions mới)
 * - GET /exchanges/suggestions?limit=20 (lấy suggestions)
 * - DELETE /exchanges/suggestions/{id} (xóa suggestion)
 * Response: Array<ExchangeSuggestionDto>
 */
const ExchangeSuggestionsPage = () => {
  const navigate = useNavigate();
  const { getExchangeSuggestions, generateExchangeSuggestions, deleteSuggestion, markSuggestionAsViewed } = useExchanges();

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Filters & Sort
  const [sortBy, setSortBy] = useState('match_score'); // match_score, created_at, trust_score
  const [filterUnviewed, setFilterUnviewed] = useState(false);
  const [minMatchScore, setMinMatchScore] = useState(0);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const result = await getExchangeSuggestions(20);
      console.log('[Suggestions] Backend response:', result);
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
      alert(`Đã tạo ${result.total || 0} gợi ý mới!`);
      loadSuggestions();
    } catch (error) {
      alert('Thất bại: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteSuggestion = async (suggestionId, memberName) => {
    if (!confirm(`Xóa gợi ý với ${memberName}? Bạn có thể tạo lại gợi ý sau.`)) return;
    
    setDeletingId(suggestionId);
    try {
      await deleteSuggestion(suggestionId);
      setSuggestions(prev => prev.filter(s => s.suggestion_id !== suggestionId));
    } catch (error) {
      alert('Không thể xóa: ' + (error.message || 'Vui lòng thử lại'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewSuggestion = async (suggestion) => {
    if (!suggestion.is_viewed) {
      try {
        await markSuggestionAsViewed(suggestion.suggestion_id);
        setSuggestions(prev => prev.map(s => 
          s.suggestion_id === suggestion.suggestion_id 
            ? { ...s, is_viewed: true, viewed_at: new Date().toISOString() }
            : s
        ));
      } catch (error) {
        console.error('Failed to mark as viewed:', error);
      }
    }
  };

  const handleCreateRequest = (suggestion) => {
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
    
    sessionStorage.setItem('exchange_request_draft', JSON.stringify(data));
    navigate('/exchange/create-request');
  };

  const getMatchColor = (score) => {
    if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
    if (score >= 60) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
    if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
    return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  };

  // Lọc và sắp xếp gợi ý
  const filteredSuggestions = suggestions
    .filter(s => {
      const matchPercentage = Math.round((s.match_score || 0) * 100);
      if (filterUnviewed && s.is_viewed) return false;
      if (matchPercentage < minMatchScore) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'match_score') {
        return (b.match_score || 0) - (a.match_score || 0);
      }
      if (sortBy === 'trust_score') {
        return (b.member?.trust_score || 0) - (a.member?.trust_score || 0);
      }
      if (sortBy === 'created_at') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });

  const unviewedCount = suggestions.filter(s => !s.is_viewed).length;

  return (
    <Layout>
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl"></div>
          {/* Floating sparkles */}
          <div className="absolute top-20 left-20 animate-pulse">
            <Sparkles className="w-8 h-8 text-yellow-300/40" />
          </div>
          <div className="absolute bottom-40 right-32 animate-pulse delay-100">
            <Star className="w-6 h-6 text-pink-300/40" />
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          <button 
            onClick={() => navigate('/exchange')} 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Trao đổi</span>
          </button>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Target className="h-4 w-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">AI Matching System</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Gợi ý trao đổi thông minh
            </h1>
            <p className="text-white/80 text-lg mb-6 max-w-2xl">
              Hệ thống phân tích sở thích và danh sách sách của bạn để tìm kiếm đối tác phù hợp nhất
            </p>

            {/* Quick Stats & Action */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{suggestions.length}</div>
                  <div className="text-sm text-white/70">Gợi ý phù hợp</div>
                </div>
              </div>

              {unviewedCount > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{unviewedCount}</div>
                    <div className="text-sm text-white/70">Chưa xem</div>
                  </div>
                </div>
              )}
              
              <button 
                onClick={handleGenerate}
                disabled={generating}
                className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Đang tìm kiếm...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Tạo gợi ý mới
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          
          {/* How it works - Compact */}
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                </div>
                <span>Phân tích sách của bạn</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-pink-600" />
                </div>
                <span>So khớp sở thích</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-green-600" />
                </div>
                <span>Tìm đối tác phù hợp</span>
              </div>
            </div>
          </div>

          {/* Filters & Sort Bar */}
          {suggestions.length > 0 && (
            <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <SortDesc className="w-4 h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="match_score">Độ phù hợp cao nhất</option>
                    <option value="trust_score">Điểm uy tín cao nhất</option>
                    <option value="created_at">Mới nhất</option>
                  </select>
                </div>

                {/* Min Match Score */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(Number(e.target.value))}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value={0}>Tất cả độ phù hợp</option>
                    <option value={30}>≥ 30% phù hợp</option>
                    <option value={50}>≥ 50% phù hợp</option>
                    <option value={70}>≥ 70% phù hợp</option>
                  </select>
                </div>

                {/* Unviewed filter */}
                <button
                  onClick={() => setFilterUnviewed(!filterUnviewed)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterUnviewed 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Chỉ chưa xem ({unviewedCount})
                </button>

                {/* Results count */}
                <div className="ml-auto text-sm text-gray-500">
                  Hiển thị {filteredSuggestions.length}/{suggestions.length} gợi ý
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600"></div>
                <Target className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-600" />
              </div>
              <p className="mt-4 text-gray-600 font-medium">Đang tìm kiếm gợi ý...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có gợi ý phù hợp</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Hệ thống cần phân tích dữ liệu để tìm kiếm đối tác phù hợp với bạn. Hãy thử tạo gợi ý mới!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  {generating ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Zap className="w-5 h-5" />
                  )}
                  Tạo gợi ý ngay
                </button>
                <Link to="/library">
                  <button className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all">
                    <BookOpen className="w-5 h-5" />
                    Thêm sách vào kho
                  </button>
                </Link>
              </div>
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không có gợi ý phù hợp với bộ lọc</h3>
              <p className="text-gray-600 mb-6">
                Thử thay đổi điều kiện lọc hoặc xóa bộ lọc để xem tất cả gợi ý
              </p>
              <button 
                onClick={() => { setFilterUnviewed(false); setMinMatchScore(0); }}
                className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                <X className="w-4 h-4" />
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSuggestions.map((suggestion, index) => {
                const otherUser = suggestion.member;
                const matchScore = suggestion.match_score || 0;
                const matchPercentage = Math.round(matchScore * 100);
                const matchColors = getMatchColor(matchPercentage);
                
                const myBooksCount = suggestion.my_books_count 
                  || suggestion.matching_books?.they_want_from_me?.length 
                  || 0;
                const theirBooksCount = suggestion.their_books_count 
                  || suggestion.matching_books?.i_want_from_them?.length 
                  || 0;
                const totalMatching = suggestion.total_matching_books || 0;

                return (
                  <div 
                    key={suggestion.suggestion_id} 
                    onClick={() => handleViewSuggestion(suggestion)}
                    className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-lg transition-all ${
                      !suggestion.is_viewed ? 'border-purple-200 ring-2 ring-purple-100' : 'border-gray-100'
                    }`}
                  >
                    {/* Match Score Bar */}
                    <div className="h-1.5 bg-gray-100">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          matchPercentage >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                          matchPercentage >= 40 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 
                          'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                        style={{ width: `${matchPercentage}%` }}
                      />
                    </div>

                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar src={otherUser?.avatar_url} alt={otherUser?.full_name} size="xl" />
                            {!suggestion.is_viewed && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-gray-900 text-lg">{otherUser?.full_name}</h4>
                              {!suggestion.is_viewed && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Mới</span>
                              )}
                            </div>
                            {otherUser?.region && (
                              <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                                <MapPin className="w-3 h-3" />
                                {otherUser.region}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {toDisplayScore(otherUser?.trust_score)}
                              </span>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${matchColors.bg} ${matchColors.text} border ${matchColors.border}`}>
                                <TrendingUp className="w-3.5 h-3.5" />
                                {matchPercentage}% phù hợp
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-xs text-gray-500">
                            {new Date(suggestion.created_at).toLocaleDateString('vi-VN')}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSuggestion(suggestion.suggestion_id, otherUser?.full_name);
                            }}
                            disabled={deletingId === suggestion.suggestion_id}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Xóa gợi ý này"
                          >
                            {deletingId === suggestion.suggestion_id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Books Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                        {/* Books I can offer */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                          <h5 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                              <Send className="w-4 h-4 text-white" />
                            </div>
                            Sách bạn có thể đưa
                            <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {myBooksCount}
                            </span>
                          </h5>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {suggestion.matching_books?.they_want_from_me?.length > 0 ? (
                              suggestion.matching_books.they_want_from_me.slice(0, 3).map((item, idx) => {
                                const book = item.my_book;
                                if (!book) return null;
                                return (
                                  <div key={book.book_id || idx} className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="font-medium text-gray-900 text-sm truncate">{book.title}</div>
                                    <div className="text-xs text-gray-500 truncate">{book.author}</div>
                                    <div className="flex items-center gap-1 mt-1.5">
                                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{book.condition}</span>
                                      {book.category && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">{book.category}</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-sm text-gray-500 italic py-2">Chưa có sách phù hợp</p>
                            )}
                            {suggestion.matching_books?.they_want_from_me?.length > 3 && (
                              <p className="text-xs text-blue-600 text-center py-1">
                                +{suggestion.matching_books.they_want_from_me.length - 3} cuốn khác
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Books I can get */}
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-xl border border-green-100">
                          <h5 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            Sách bạn có thể nhận
                            <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {theirBooksCount}
                            </span>
                          </h5>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {suggestion.matching_books?.i_want_from_them?.length > 0 ? (
                              suggestion.matching_books.i_want_from_them.slice(0, 3).map((item, idx) => {
                                const book = item.their_book;
                                if (!book) return null;
                                return (
                                  <div key={book.book_id || idx} className="bg-white p-3 rounded-lg shadow-sm">
                                    <div className="font-medium text-gray-900 text-sm truncate">{book.title}</div>
                                    <div className="text-xs text-gray-500 truncate">{book.author}</div>
                                    <div className="flex items-center gap-1 mt-1.5">
                                      <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{book.condition}</span>
                                      {book.category && (
                                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-600 rounded-full">{book.category}</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-sm text-gray-500 italic py-2">Chưa có sách phù hợp</p>
                            )}
                            {suggestion.matching_books?.i_want_from_them?.length > 3 && (
                              <p className="text-xs text-green-600 text-center py-1">
                                +{suggestion.matching_books.i_want_from_them.length - 3} cuốn khác
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Perfect Match Note */}
                      {totalMatching > 0 && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100 mb-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-purple-900">Trao đổi hoàn hảo!</p>
                              <p className="text-sm text-purple-700">
                                Có <strong>{totalMatching}</strong> cuốn sách phù hợp với mong muốn của cả hai bên
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3 justify-end">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${otherUser?.user_id}`);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 hover:border-gray-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Xem hồ sơ
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/messages?userId=${otherUser?.user_id}`);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-100 hover:border-gray-300 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Nhắn tin
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateRequest(suggestion);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <Send className="w-4 h-4" />
                        Gửi yêu cầu trao đổi
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExchangeSuggestionsPage;
