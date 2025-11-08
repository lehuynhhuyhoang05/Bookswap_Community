import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  MapPin,
  Star,
  User,
  BookOpen,
  Calendar,
  Hash,
  Languages,
  Heart,
  Share2,
  MessageCircle,
  Shield,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  Bookmark,
  Flag
} from 'lucide-react';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockBook = {
          id: id,
          title: "Clean Code: A Handbook of Agile Software Craftsmanship",
          author: "Robert C. Martin",
          isbn: "9780132350884",
          publisher: "Prentice Hall",
          publish_date: "2008-08-01",
          description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. This book is a must-read for every software developer who wants to write code that's not just functional but also maintainable and scalable.",
          category: "Programming",
          language: "en",
          page_count: 464,
          cover_image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=800&fit=crop",
          book_condition: "EXCELLENT",
          location: "Quận 1, TP.HCM",
          owner: {
            id: "user1",
            name: "Nguyễn Văn A",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            rating: 4.8,
            exchanges: 24,
            member_since: "2023-01-15",
            verified: true
          },
          rating: 4.7,
          total_ratings: 89,
          exchanges: 8,
          views: 142,
          likes: 18,
          tags: ["Programming", "Software Engineering", "Best Practices", "Clean Code", "Agile", "Development"],
          additional_info: {
            edition: "1st Edition",
            dimensions: "23.4 x 17.8 x 2.5 cm",
            weight: "780g",
            available: true,
            created_at: "2024-01-15T10:30:00Z"
          },
          similar_books: [
            {
              id: "2",
              title: "The Clean Coder",
              author: "Robert C. Martin",
              cover_image_url: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=200&h=300&fit=crop",
              rating: 4.6,
              condition: "GOOD"
            },
            {
              id: "4",
              title: "Atomic Habits",
              author: "James Clear",
              cover_image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=300&fit=crop",
              rating: 4.9,
              condition: "EXCELLENT"
            },
            {
              id: "6",
              title: "Deep Work",
              author: "Cal Newport",
              cover_image_url: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=200&h=300&fit=crop",
              rating: 4.7,
              condition: "NEW"
            }
          ]
        };
        
        setBook(mockBook);
      } catch (error) {
        console.error('Error fetching book details:', error);
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [id, navigate]);

  const conditionColors = {
    'NEW': 'from-green-500 to-emerald-500',
    'EXCELLENT': 'from-blue-500 to-cyan-500',
    'GOOD': 'from-amber-500 to-orange-500',
    'FAIR': 'from-orange-500 to-red-500',
    'POOR': 'from-red-500 to-pink-500'
  };

  const conditionLabels = {
    'NEW': 'Mới',
    'EXCELLENT': 'Rất tốt',
    'GOOD': 'Tốt',
    'FAIR': 'Khá',
    'POOR': 'Cũ'
  };

  const languageLabels = {
    'vi': 'Tiếng Việt',
    'en': 'English'
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải thông tin sách...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sách</h3>
          <p className="text-gray-600 mb-6">Cuốn sách bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link
            to="/books"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại danh sách</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/books"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Quay lại danh sách</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`p-3 rounded-2xl transition-all ${
                  isBookmarked 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              
              <button className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all">
                <Share2 className="w-5 h-5" />
              </button>
              
              <button className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all">
                <Flag className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Book Cover & Actions */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-24"
            >
              {/* Book Cover */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
                <div className="relative">
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-full rounded-2xl shadow-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-2 text-white text-sm font-semibold rounded-full shadow-lg bg-gradient-to-r ${conditionColors[book.book_condition]}`}>
                      {conditionLabels[book.book_condition]}
                    </span>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center text-yellow-400 mb-1">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{book.rating}</div>
                    <div className="text-xs text-gray-600">{book.total_ratings} đánh giá</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center text-blue-500 mb-1">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{book.exchanges}</div>
                    <div className="text-xs text-gray-600">lần trao đổi</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center text-green-500 mb-1">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{book.views}</div>
                    <div className="text-xs text-gray-600">lượt xem</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-lg flex items-center justify-center space-x-3">
                  <MessageCircle className="w-6 h-6" />
                  <span>Yêu cầu trao đổi</span>
                </button>
                
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-full py-4 rounded-2xl border-2 transition-all duration-300 font-semibold flex items-center justify-center space-x-3 ${
                    isLiked
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Đã thích' : 'Thích'} ({book.likes})</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Book Details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Book Header */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                      {book.title}
                    </h1>
                    <p className="text-2xl text-blue-600 font-semibold mb-6">
                      {book.author}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  {book.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="text-gray-700 text-lg leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Tabs Navigation */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-8">
                    {[
                      { id: 'details', label: 'Thông tin chi tiết' },
                      { id: 'owner', label: 'Chủ sở hữu' },
                      { id: 'similar', label: 'Sách tương tự' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-8">
                  {activeTab === 'details' && (
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-blue-100 rounded-2xl">
                            <Hash className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">ISBN</div>
                            <div className="font-semibold text-gray-900">{book.isbn}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-green-100 rounded-2xl">
                            <BookOpen className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Nhà xuất bản</div>
                            <div className="font-semibold text-gray-900">{book.publisher}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-purple-100 rounded-2xl">
                            <Calendar className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Ngày xuất bản</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(book.publish_date).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-amber-100 rounded-2xl">
                            <Languages className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Ngôn ngữ</div>
                            <div className="font-semibold text-gray-900">
                              {languageLabels[book.language]}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-red-100 rounded-2xl">
                            <BookOpen className="w-6 h-6 text-red-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Số trang</div>
                            <div className="font-semibold text-gray-900">{book.page_count} trang</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gray-100 rounded-2xl">
                            <MapPin className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Vị trí</div>
                            <div className="font-semibold text-gray-900">{book.location}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'owner' && (
                    <div className="flex items-start space-x-6">
                      <img
                        src={book.owner.avatar}
                        alt={book.owner.name}
                        className="w-20 h-20 rounded-2xl"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-2xl font-bold text-gray-900">{book.owner.name}</h3>
                          {book.owner.verified && (
                            <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                              <Shield className="w-4 h-4" />
                              <span>Đã xác minh</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6 mb-6">
                          <div className="text-center">
                            <div className="flex items-center justify-center text-yellow-400 mb-1">
                              <Star className="w-5 h-5 fill-current" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{book.owner.rating}</div>
                            <div className="text-xs text-gray-600">Đánh giá</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center text-blue-500 mb-1">
                              <RefreshCw className="w-5 h-5" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">{book.owner.exchanges}</div>
                            <div className="text-xs text-gray-600">Giao dịch</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="flex items-center justify-center text-green-500 mb-1">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {new Date(book.owner.member_since).getFullYear()}
                            </div>
                            <div className="text-xs text-gray-600">Tham gia</div>
                          </div>
                        </div>
                        
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium">
                          Xem trang cá nhân
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'similar' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {book.similar_books.map((similarBook) => (
                        <Link
                          key={similarBook.id}
                          to={`/books/${similarBook.id}`}
                          className="bg-gray-50 rounded-2xl p-4 hover:bg-white hover:shadow-lg transition-all group"
                        >
                          <img
                            src={similarBook.cover_image_url}
                            alt={similarBook.title}
                            className="w-full h-48 object-cover rounded-xl mb-3 group-hover:scale-105 transition-transform"
                          />
                          <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                            {similarBook.title}
                          </h4>
                          <p className="text-blue-600 text-sm mb-2">{similarBook.author}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-gray-600 ml-1 text-sm">{similarBook.rating}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full text-white bg-gradient-to-r ${conditionColors[similarBook.condition]}`}>
                              {conditionLabels[similarBook.condition]}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Thông tin bổ sung</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Tình trạng sách</span>
                    <span className="font-semibold text-gray-900">
                      {conditionLabels[book.book_condition]}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Thể loại</span>
                    <span className="font-semibold text-gray-900">{book.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Trạng thái</span>
                    <span className="flex items-center text-green-600 font-semibold">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Có sẵn để trao đổi
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Đăng từ</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(book.additional_info.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;