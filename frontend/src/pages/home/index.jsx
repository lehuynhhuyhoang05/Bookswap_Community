import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useBooks } from '../../hooks/useBooks';

const Home = () => {
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
      
      // Load recent books từ API thật
      const booksResult = await getBooks({ 
        page: 1, 
        limit: 8, 
        sort_by: 'created_at', 
        order: 'DESC' 
      });
      
      console.log('📚 Home - Recent books API result:', booksResult);
      
      // Xử lý response format linh hoạt
      let booksArray = [];
      if (Array.isArray(booksResult)) {
        booksArray = booksResult;
      } else if (booksResult && typeof booksResult === 'object') {
        booksArray = booksResult.books || booksResult.data || booksResult.items || [];
      }
      
      // Đảm bảo mỗi book có đủ field cần thiết
      const processedBooks = booksArray.slice(0, 4).map(book => ({
        id: book.id || book.book_id,
        title: book.title || 'Không có tiêu đề',
        author: book.author || 'Không rõ tác giả',
        cover_image_url: book.cover_image_url || book.cover_image || book.thumbnail || 
                         `https://via.placeholder.com/200x300/3B82F6/FFFFFF?text=${encodeURIComponent(book.title || 'Book')}`,
        condition: book.condition || book.book_condition || 'GOOD',
        category: book.category || book.genre || 'Khác'
      }));
      
      setRecentBooks(processedBooks);

      // Load stats từ API thật
      try {
        const statsData = await getLibraryStats();
        console.log('📊 Home - Stats API result:', statsData);
        
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
      // Fallback to mock data nếu API fail
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Chào mừng đến BookSwap</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Trao đổi sách, kết nối đam mê. Khám phá thế giới sách rộng lớn và tìm những cuốn sách bạn yêu thích.
          </p>
          <div className="flex justify-center gap-4 flex-col sm:flex-row">
            <Link to="/books" className="inline-block">
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition duration-200">
                Khám phá sách
              </button>
            </Link>
            <Link to="/library/wanted-books" className="inline-block">
              <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg transition duration-200">
                Sách mong muốn
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn BookSwap?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Trao đổi dễ dàng</h3>
              <p className="text-gray-600">Tìm và trao đổi sách với cộng đồng yêu sách một cách đơn giản và thuận tiện</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Kết nối cộng đồng</h3>
              <p className="text-gray-600">Gặp gỡ những người có chung sở thích đọc sách và mở rộng mạng lưới quan hệ</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Đánh giá uy tín</h3>
              <p className="text-gray-600">Hệ thống đánh giá và xếp hạng đáng tin cậy giúp bạn yên tâm khi trao đổi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Books Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Sách mới đăng</h2>
            <Link to="/books" className="text-blue-600 hover:text-blue-700 font-semibold">
              Xem tất cả →
            </Link>
          </div>
          
          {homeLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4 mb-3"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-300 rounded w-16"></div>
                      <div className="h-6 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentBooks.map(book => (
                <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
                  <div className="h-48 bg-gray-200">
                    <img 
                      src={book.cover_image_url} 
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/200x300/6B7280/FFFFFF?text=${encodeURIComponent(book.title.substring(0, 20))}`;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{book.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                    <div className="flex justify-between items-center">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {book.category}
                      </span>
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {formatCondition(book.condition)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">{stats.totalMembers.toLocaleString()}+</div>
              <div className="text-blue-100">Thành viên</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{stats.totalBooks.toLocaleString()}+</div>
              <div className="text-blue-100">Sách có sẵn</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{stats.successfulTrades.toLocaleString()}+</div>
              <div className="text-blue-100">Giao dịch thành công</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">{stats.regions}+</div>
              <div className="text-blue-100">Tỉnh thành</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;