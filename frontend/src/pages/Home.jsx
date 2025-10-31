import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Users, 
  Shield, 
  ArrowRight, 
  Star, 
  MapPin, 
  CheckCircle,
  TrendingUp,
  Heart,
  MessageCircle,
  BookMarked
} from 'lucide-react';

const Home = () => {
  // Updated dummy data với hình ảnh thực tế hơn
  const featuredBooks = [
    {
      id: 1,
      title: "Nhà Giả Kim",
      author: "Paulo Coelho",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=500&fit=crop",
      location: "Hà Nội",
      owner: "Nguyễn Văn A",
      rating: 4.5,
      condition: "Rất tốt",
      genre: "Tiểu thuyết"
    },
    {
      id: 2,
      title: "Đắc Nhân Tâm",
      author: "Dale Carnegie",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=500&fit=crop",
      location: "TP.HCM",
      owner: "Trần Thị B",
      rating: 4.8,
      condition: "Mới",
      genre: "Self-help"
    },
    {
      id: 3,
      title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
      author: "Rosie Nguyễn",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=500&fit=crop",
      location: "Đà Nẵng",
      owner: "Lê Văn C",
      rating: 4.3,
      condition: "Tốt",
      genre: "Phát triển bản thân"
    },
    {
      id: 4,
      title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
      author: "Nguyễn Nhật Ánh",
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=500&fit=crop",
      location: "Cần Thơ",
      owner: "Phạm Thị D",
      rating: 4.7,
      condition: "Rất tốt",
      genre: "Văn học"
    }
  ];

  const stats = [
    { 
      number: "10,000+", 
      label: "Thành viên tích cực",
      icon: <Users className="h-6 w-6" />
    },
    { 
      number: "25,000+", 
      label: "Sách đang trao đổi",
      icon: <BookOpen className="h-6 w-6" />
    },
    { 
      number: "8,000+", 
      label: "Giao dịch thành công", 
      icon: <CheckCircle className="h-6 w-6" />
    },
    { 
      number: "4.8/5", 
      label: "Đánh giá từ cộng đồng",
      icon: <Star className="h-6 w-6" />
    }
  ];

  const features = [
    {
      icon: <BookMarked className="h-10 w-10" />,
      title: "Quản lý Tủ sách Thông minh",
      description: "Tổ chức sách bạn có và sách bạn muốn một cách khoa học với hệ thống quản lý trực quan",
      benefits: ["Theo dõi dễ dàng", "Phân loại tự động", "Đề xuất thông minh"]
    },
    {
      icon: <MessageCircle className="h-10 w-10" />,
      title: "Kết nối Cộng đồng",
      description: "Giao lưu và trao đổi với những người cùng đam mê đọc sách trên khắp Việt Nam",
      benefits: ["Chat trực tiếp", "Nhóm sở thích", "Gặp gỡ offline"]
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: "Hệ thống Tin cậy",
      description: "Trao đổi an toàn với hệ thống đánh giá, xác thực và bảo vệ người dùng toàn diện",
      benefits: ["Xếp hạng uy tín", "Xác minh thành viên", "Hỗ trợ 24/7"]
    },
    {
      icon: <TrendingUp className="h-10 w-10" />,
      title: "Gợi ý Thông minh",
      description: "Nhận đề xuất trao đổi phù hợp dựa trên sở thích và vị trí của bạn",
      benefits: ["AI đề xuất", "Theo khu vực", "Cá nhân hóa"]
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Đăng ký & Tạo tủ sách",
      description: "Đăng ký tài khoản và thêm sách bạn có, sách bạn muốn vào tủ sách cá nhân"
    },
    {
      step: "02",
      title: "Tìm kiếm & Kết nối",
      description: "Khám phá sách từ thành viên khác và gửi yêu cầu trao đổi"
    },
    {
      step: "03",
      title: "Thương lượng & Thỏa thuận",
      description: "Chat trực tiếp để thảo luận về tình trạng sách và phương thức trao đổi"
    },
    {
      step: "04",
      title: "Hoàn tất & Đánh giá",
      description: "Xác nhận trao đổi thành công và để lại đánh giá cho đối tác"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-500 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 rounded-full translate-x-1/3 translate-y-1/3 opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-green-200" />
              <span className="text-green-100 text-sm font-medium">Cộng đồng yêu sách lớn nhất Việt Nam</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Trao đổi
              <span className="block text-green-200">Sách cũ - Kết nối Tri thức mới</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-4xl mx-auto leading-relaxed">
              Biến những cuốn sách cũ thành cánh cửa mở ra thế giới tri thức mới. 
              Tham gia cộng đồng <span className="font-semibold text-white">10,000+</span> độc giả Việt Nam.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="group bg-white text-green-700 px-8 py-4 rounded-xl font-bold hover:bg-green-50 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <span>Bắt đầu ngay</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/how-it-works"
                className="group border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all duration-300 text-lg backdrop-blur-sm flex items-center space-x-2"
              >
                <span>Xem cách hoạt động</span>
                <BookOpen className="h-5 w-5" />
              </Link>
            </div>
            
            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-green-200">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">An toàn & Bảo mật</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm">Hoàn toàn Miễn phí</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">10,000+ Thành viên</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 group"
              >
                <div className="text-green-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cách thức hoạt động
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Chỉ với 4 bước đơn giản, bạn đã có thể bắt đầu hành trình trao đổi sách
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 h-full">
                  <div className="text-5xl font-bold text-green-600/20 mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-green-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trải nghiệm Độc đáo
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Khám phá những tính năng được thiết kế riêng cho cộng đồng yêu sách
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Books Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Sách Đang Được Quan Tâm
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                Khám phá những cuốn sách đang được cộng đồng săn đón nhiều nhất
              </p>
            </div>
            
            <Link
              to="/books"
              className="mt-4 lg:mt-0 group flex items-center space-x-2 text-green-600 hover:text-green-700 font-semibold text-lg"
            >
              <span>Xem tất cả sách</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredBooks.map((book) => (
              <div 
                key={book.id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {book.condition}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                      {book.title}
                    </h3>
                    <div className="flex items-center text-yellow-500 ml-2 flex-shrink-0">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm text-gray-700 ml-1">
                        {book.rating}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3">{book.author}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {book.location}
                    </div>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {book.genre}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    Chủ sở hữu: <span className="text-green-600 font-medium">{book.owner}</span>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                    Yêu cầu trao đổi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Sẵn sàng khám phá thế giới sách?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Tham gia cộng đồng BookSwap ngay hôm nay và biến những cuốn sách cũ thành những cuộc gặp gỡ ý nghĩa
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-green-600 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <BookOpen className="h-5 w-5" />
              <span>Đăng ký miễn phí</span>
            </Link>
            
            <Link
              to="/login"
              className="border-2 border-gray-300 text-gray-300 px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-gray-900 transition-all duration-300 text-lg"
            >
              Đăng nhập
            </Link>
          </div>
          
          <p className="mt-6 text-gray-400 text-sm">
            Hoàn toàn miễn phí • Dễ dàng sử dụng • Cộng đồng thân thiện
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;