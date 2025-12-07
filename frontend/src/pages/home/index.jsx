import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { UpcomingMeetingsWidget } from '../../components/home';
import { useAuth } from '../../hooks/useAuth';
import { useBooks } from '../../hooks/useBooks';
import { 
  BookOpen, 
  Users, 
  ArrowRight, 
  Repeat, 
  Shield, 
  Star, 
  TrendingUp, 
  MapPin,
  Heart,
  Sparkles,
  Search,
  ChevronRight,
  Gift,
  MessageCircle,
  CheckCircle,
  Award
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const { getBooks, getLibraryStats, loading, error } = useBooks();
  const [recentBooks, setRecentBooks] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 1000,
    totalBooks: 5000,
    successfulTrades: 2000,
    regions: 50
  });
  const [homeLoading, setHomeLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setHomeLoading(true);
      
      const booksResult = await getBooks({ 
        page: 1, 
        limit: 8, 
        sort_by: 'created_at', 
        order: 'DESC' 
      });
      
      let booksArray = [];
      if (Array.isArray(booksResult)) {
        booksArray = booksResult;
      } else if (booksResult && typeof booksResult === 'object') {
        booksArray = booksResult.books || booksResult.data || booksResult.items || [];
      }
      
      const processedBooks = booksArray.slice(0, 8).map(book => ({
        id: book.id || book.book_id,
        title: book.title || 'Không có tiêu đề',
        author: book.author || 'Không rõ tác giả',
        cover_image_url: book.cover_image_url || book.cover_image || book.thumbnail,
        condition: book.condition || book.book_condition || 'GOOD',
        category: book.category || book.genre || 'Khác',
        owner: book.owner
      }));
      
      setRecentBooks(processedBooks);

      try {
        const statsData = await getLibraryStats();
        if (statsData) {
          setStats(prev => ({
            totalMembers: statsData.total_members || statsData.members || prev.totalMembers,
            totalBooks: statsData.total_books || statsData.books || prev.totalBooks,
            successfulTrades: statsData.successful_trades || statsData.trades || prev.successfulTrades,
            regions: statsData.regions || statsData.total_regions || prev.regions
          }));
        }
      } catch (statsError) {
        console.log('📊 Stats API not available, using default stats');
      }

    } catch (err) {
      console.error('❌ Error loading home data:', err);
      setRecentBooks(getMockBooks());
    } finally {
      setHomeLoading(false);
    }
  };

  const getMockBooks = () => [
    {
      id: 1,
      title: 'Clean Code',
      author: 'Robert C. Martin',
      cover_image_url: 'https://via.placeholder.com/200x300/3B82F6/FFFFFF?text=Clean+Code',
      condition: 'GOOD',
      category: 'Programming'
    },
    {
      id: 2,
      title: 'Design Patterns',
      author: 'Erich Gamma',
      cover_image_url: 'https://via.placeholder.com/200x300/10B981/FFFFFF?text=Design+Patterns',
      condition: 'EXCELLENT',
      category: 'Programming'
    },
    {
      id: 3,
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt',
      cover_image_url: 'https://via.placeholder.com/200x300/8B5CF6/FFFFFF?text=Pragmatic+Programmer',
      condition: 'GOOD',
      category: 'Programming'
    },
    {
      id: 4,
      title: 'Deep Work',
      author: 'Cal Newport',
      cover_image_url: 'https://via.placeholder.com/200x300/F59E0B/FFFFFF?text=Deep+Work',
      condition: 'NEW',
      category: 'Productivity'
    }
  ];

  const formatCondition = (condition) => {
    const conditions = {
      'LIKE_NEW': 'Như mới',
      'VERY_GOOD': 'Rất tốt',
      'GOOD': 'Tốt',
      'FAIR': 'Khá',
      'POOR': 'Kém',
      'EXCELLENT': 'Xuất sắc',
      'NEW': 'Mới'
    };
    return conditions[condition] || condition;
  };

  const getConditionColor = (condition) => {
    const colors = {
      'LIKE_NEW': 'bg-emerald-100 text-emerald-700',
      'VERY_GOOD': 'bg-green-100 text-green-700',
      'GOOD': 'bg-blue-100 text-blue-700',
      'FAIR': 'bg-yellow-100 text-yellow-700',
      'POOR': 'bg-red-100 text-red-700',
      'EXCELLENT': 'bg-purple-100 text-purple-700',
      'NEW': 'bg-pink-100 text-pink-700'
    };
    return colors[condition] || 'bg-gray-100 text-gray-700';
  };

  // How it works steps
  const howItWorksSteps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: 'Tìm sách bạn muốn',
      description: 'Duyệt qua hàng nghìn cuốn sách từ cộng đồng hoặc tìm kiếm theo tên, tác giả, thể loại.'
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: 'Gửi yêu cầu trao đổi',
      description: 'Chọn sách bạn có để đổi lấy sách bạn muốn. Nhắn tin trực tiếp với chủ sách.'
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: 'Hẹn gặp & trao đổi',
      description: 'Thỏa thuận địa điểm, thời gian gặp mặt thuận tiện để trao đổi sách.'
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: 'Đánh giá & tiếp tục',
      description: 'Đánh giá giao dịch để xây dựng uy tín. Tiếp tục khám phá thêm nhiều sách mới!'
    }
  ];

  return (
    <Layout>
      {/* Hero Section - Modern Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-sm font-medium">Nền tảng trao đổi sách #1 Việt Nam</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Trao đổi sách,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  Kết nối đam mê
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg">
                Biến kệ sách cũ thành kho báu mới. Kết nối với hàng nghìn người yêu sách trên khắp Việt Nam.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/books">
                  <button className="group w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Khám phá sách
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                {user ? (
                  <Link to="/library">
                    <button className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2">
                      <Heart className="h-5 w-5" />
                      Kho sách của tôi
                    </button>
                  </Link>
                ) : (
                  <Link to="/register">
                    <button className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2">
                      <Gift className="h-5 w-5" />
                      Tham gia miễn phí
                    </button>
                  </Link>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mt-10 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{stats.totalMembers.toLocaleString()}+</p>
                    <p className="text-xs text-blue-200">Thành viên</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{stats.totalBooks.toLocaleString()}+</p>
                    <p className="text-xs text-blue-200">Cuốn sách</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{stats.successfulTrades.toLocaleString()}+</p>
                    <p className="text-xs text-blue-200">Giao dịch</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Book Showcase */}
            <div className="hidden md:block relative">
              <div className="relative w-full h-96">
                {/* Floating books animation */}
                <div className="absolute top-0 left-1/4 w-32 h-44 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-2xl transform -rotate-12 animate-float"></div>
                <div className="absolute top-10 right-1/4 w-36 h-48 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg shadow-2xl transform rotate-6 animate-float-delayed"></div>
                <div className="absolute bottom-0 left-1/3 w-40 h-52 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg shadow-2xl transform -rotate-3 animate-float"></div>
                <div className="absolute bottom-10 right-1/3 w-28 h-40 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg shadow-2xl transform rotate-12 animate-float-delayed"></div>
                
                {/* Center icon */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center">
                  <Repeat className="h-12 w-12 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Upcoming Meetings Widget - Only for logged in users */}
      {user && (
        <section className="py-8 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <UpcomingMeetingsWidget currentUserId={user?.member?.member_id || user?.user_id} />
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-blue-100 text-blue-600 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Cách thức hoạt động
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trao đổi sách chỉ với 4 bước đơn giản
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              BookSwap giúp bạn kết nối với cộng đồng yêu sách một cách dễ dàng và an toàn
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-300 to-blue-100"></div>
                )}
                
                <div className="relative bg-white rounded-2xl p-6 text-center group hover:shadow-xl transition-all duration-300">
                  {/* Step number */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Updated Design */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-100 text-green-600 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Tính năng nổi bật
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn BookSwap?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Repeat className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trao đổi thông minh</h3>
              <p className="text-gray-600 mb-4">
                Hệ thống gợi ý sách phù hợp dựa trên sở thích và wishlist của bạn. Tìm kiếm và lọc theo nhiều tiêu chí.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Gợi ý sách phù hợp
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Tìm kiếm nâng cao
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Thông báo realtime
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">An toàn & Uy tín</h3>
              <p className="text-gray-600 mb-4">
                Hệ thống Trust Score đánh giá uy tín thành viên. Báo cáo vi phạm được xử lý nhanh chóng.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Điểm uy tín Trust Score
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Xác thực tài khoản
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Hỗ trợ 24/7
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cộng đồng sôi động</h3>
              <p className="text-gray-600 mb-4">
                Kết nối với những người yêu sách trên khắp Việt Nam. Chat trực tiếp, hẹn gặp dễ dàng.
              </p>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Chat realtime
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Đặt lịch hẹn
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Đánh giá sau giao dịch
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Books Section - Enhanced */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <span className="inline-block bg-orange-100 text-orange-600 text-sm font-semibold px-4 py-2 rounded-full mb-3">
                Mới nhất
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Sách vừa được đăng</h2>
            </div>
            <Link to="/books" className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group">
              Xem tất cả
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {homeLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                  <div className="aspect-[3/4] bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentBooks.map((book, index) => (
                <Link 
                  key={book.id} 
                  to={`/books/${book.id}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {book.cover_image_url ? (
                      <img 
                        src={book.cover_image_url} 
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }}
                        loading="lazy"
                      />
                    ) : null}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* New badge for first 2 books */}
                    {index < 2 && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        MỚI
                      </div>
                    )}
                    
                    {/* Quick action */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="w-full bg-white text-blue-600 font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-1">{book.author}</p>
                    <div className="flex justify-between items-center">
                      <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg font-medium">
                        {book.category}
                      </span>
                      <span className={`inline-block text-xs px-2 py-1 rounded-lg font-medium ${getConditionColor(book.condition)}`}>
                        {formatCondition(book.condition)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile view all button */}
          <div className="mt-8 text-center md:hidden">
            <Link to="/books">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Xem tất cả sách
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - Redesigned */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cộng đồng BookSwap đang phát triển</h2>
            <p className="text-blue-200 max-w-2xl mx-auto">
              Hàng nghìn người đã tin tưởng và sử dụng BookSwap để trao đổi sách mỗi ngày
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                <Users className="h-8 w-8" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{stats.totalMembers.toLocaleString()}+</div>
              <div className="text-blue-200 font-medium">Thành viên</div>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                <BookOpen className="h-8 w-8" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{stats.totalBooks.toLocaleString()}+</div>
              <div className="text-blue-200 font-medium">Sách có sẵn</div>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{stats.successfulTrades.toLocaleString()}+</div>
              <div className="text-blue-200 font-medium">Giao dịch thành công</div>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl flex items-center justify-center">
                <MapPin className="h-8 w-8" />
              </div>
              <div className="text-4xl md:text-5xl font-bold mb-2">{stats.regions}+</div>
              <div className="text-blue-200 font-medium">Tỉnh thành</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden">
              {/* Decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="relative z-10">
                <Award className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Sẵn sàng bắt đầu hành trình đọc sách?
                </h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Đăng ký miễn phí ngay hôm nay và khám phá hàng nghìn cuốn sách đang chờ đợi bạn
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register">
                    <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg">
                      Đăng ký ngay - Miễn phí
                    </button>
                  </Link>
                  <Link to="/books">
                    <button className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 px-8 py-4 rounded-xl font-bold text-lg transition-colors">
                      Xem sách trước
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-12deg); }
          50% { transform: translateY(-20px) rotate(-12deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(6deg); }
          50% { transform: translateY(-15px) rotate(6deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </Layout>
  );
};

export default Home;