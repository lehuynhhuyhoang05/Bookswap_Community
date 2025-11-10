import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Star, 
  MapPin, 
  RefreshCw,
  Sparkles,
  BookOpen,
  Users,
  Shield,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';

const Home = () => {
  // Book data với hình ảnh thực tế
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
      genre: "Tiểu thuyết",
      exchanges: 12
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
      genre: "Self-help",
      exchanges: 8
    },
    {
      id: 3,
      title: "Tuổi Trẻ Đáng Giá Bao Nhiêu",
      author: "Rosie Nguyễn", 
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=500&fit=crop",
      location: "Đà N�ẵng",
      owner: "Lê Văn C",
      rating: 4.3,
      condition: "Tốt",
      genre: "Phát triển bản thân",
      exchanges: 15
    }
  ];

  const stats = [
    { 
      number: "15,847", 
      label: "Thành viên tích cực",
    },
    { 
      number: "28,492", 
      label: "Sách đang trao đổi",
    },
    { 
      number: "9,673", 
      label: "Giao dịch thành công", 
    }
  ];

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "An Toàn Tuyệt Đối",
      desc: "Xác thực thành viên và hệ thống đánh giá minh bạch, đáng tin cậy",
      gradient: "from-green-500 to-emerald-500",
      stats: "99% hài lòng"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Cộng Đồng Phát Triển", 
      desc: "Kết nối với hàng ngàn độc giả cùng đam mê trên khắp Việt Nam",
      gradient: "from-purple-500 to-pink-500",
      stats: "15K+ thành viên"
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Quản Lý Thông Minh",
      desc: "Theo dõi lịch sử trao đổi và quản lý tủ sách cá nhân dễ dàng",
      gradient: "from-orange-500 to-amber-500",
      stats: "Tiết kiệm 5h/tuần"
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: "Trao Đổi Nhanh Chóng",
      desc: "Quy trình trao đổi đơn giản, kết nối nhanh chóng trong vài phút",
      gradient: "from-blue-500 to-cyan-500",
      stats: "2 phút/ giao dịch"
    }
  ];

  const processSteps = [
    {
      step: "01",
      title: "Đăng Ký & Xác Minh",
      description: "Tạo tài khoản và xác minh để tham gia cộng đồng",
      icon: <Shield className="w-6 h-6" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      step: "02", 
      title: "Thêm Sách Của Bạn",
      description: "Đăng tải sách bạn có và muốn trao đổi",
      icon: <BookOpen className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      step: "03",
      title: "Kết Nối & Trao Đổi", 
      description: "Tìm kiếm và gửi yêu cầu trao đổi trong 2 phút",
      icon: <RefreshCw className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      step: "04",
      title: "Mở Rộng Tủ Sách",
      description: "Nhận sách mới và tiếp tục hành trình đọc",
      icon: <Sparkles className="w-6 h-6" />,
      gradient: "from-orange-500 to-amber-500",
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 overflow-hidden">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-20 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 text-sm font-medium mb-8"
            >
              <TrendingUp className="w-4 h-4" />
              Nền tảng trao đổi sách số 1 Việt Nam
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Trao đổi
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Sách Hay
              </span>
              Kết nối tri thức
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl"
            >
              Kết nối với hàng ngàn độc giả Việt Nam. Biến những cuốn sách cũ thành{" "}
              <span className="font-semibold text-blue-600">
                cơ hội khám phá thế giới mới
              </span>
              . Hoàn toàn miễn phí và dễ dàng.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 items-center"
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 group"
              >
                <Link to="/login" className="flex items-center gap-3">
                  <span>Bắt đầu ngay</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center gap-3 group"
              >
                <Link to="/books" className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5" />
                  <span>Khám phá sách</span>
                </Link>
              </motion.button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200/50"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Book Images */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4 relative">
              {featuredBooks.slice(0, 2).map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.2 }}
                  className={`bg-white rounded-2xl p-4 shadow-xl border border-gray-100 transform ${
                    index === 0 ? 'rotate-2' : '-rotate-2'
                  } hover:rotate-0 transition-all duration-500 hover:shadow-2xl`}
                >
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-xl mb-3"
                  />
                  <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                  <p className="text-blue-600 text-sm">{book.author}</p>
                </motion.div>
              ))}
            </div>

            {/* Floating Elements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Top 1</div>
                  <div className="text-sm text-gray-600">Nền tảng sách</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Trao đổi</div>
                  <div className="text-sm text-gray-600">2 phút</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-40 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Tính năng đột phá
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trải nghiệm{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                trao đổi
              </span>{" "}
              thông minh
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Khám phá những tính năng độc đáo được thiết kế để mang lại sự tiện lợi 
              và tin cậy tuyệt đối cho cộng đồng yêu sách
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                <div className="flex items-start gap-6">
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {feature.title}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {feature.stats}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-200 rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Quy trình đơn giản
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Bắt đầu trong{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                4 bước
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-cyan-200 to-emerald-200 -z-10"></div>

            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative group"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-all duration-300">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${step.gradient} text-white shadow-md`}
                    >
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {step.step}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED BOOKS ===== */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Sách Nổi Bật
              </h2>
              <p className="text-gray-300 text-xl">
                Khám phá những cuốn sách đang được cộng đồng yêu thích
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Link
                to="/books"
                className="group flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-semibold text-lg"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-3xl overflow-hidden hover:bg-gray-700/50 transition-all duration-500 hover:shadow-2xl border border-gray-700/50 hover:border-gray-600/50"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg">
                      {book.condition}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-gray-900/80 text-white px-3 py-2 rounded-full text-sm font-medium flex items-center space-x-1">
                      <RefreshCw className="h-4 w-4" />
                      <span>{book.exchanges}</span>
                    </span>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold flex-1 pr-4">
                      {book.title}
                    </h3>
                    <div className="flex items-center text-yellow-400 flex-shrink-0">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="text-white ml-1 text-sm">
                        {book.rating}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-6 text-lg">{book.author}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      {book.location}
                    </div>
                    <span className="bg-gray-700/50 text-gray-300 px-3 py-2 rounded-full text-sm">
                      {book.genre}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-6">
                    Chủ sở hữu: <span className="text-cyan-400 font-medium">{book.owner}</span>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-lg">
                    Yêu cầu trao đổi
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Sẵn sàng tham gia?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Đăng ký ngay và khám phá thế giới sách vô tận cùng cộng đồng BookSwap. 
              Biến những cuốn sách cũ thành cơ hội kết nối và học hỏi mới.
            </p>

            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px -10px rgba(255, 255, 255, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 group mx-auto"
            >
              <Link to="/register" className="flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                <span>Đăng ký miễn phí</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.button>

            <p className="text-blue-200 text-sm mt-6">
              Hoàn toàn miễn phí • Bảo mật tuyệt đối • Cộng đồng thân thiện
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;