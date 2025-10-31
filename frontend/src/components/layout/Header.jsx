import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  User, 
  LogOut, 
  Menu, 
  X, 
  BookMarked,
  MessageCircle,
  Bell,
  Home,
  Library,
  RefreshCw
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // State để xác định loại người dùng (có thể thay bằng context/authentication sau)
  const [userType, setUserType] = useState('guest'); // 'guest', 'member', 'admin'

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleRegister = () => {
    navigate('/register');
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setUserType('guest');
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const toggleUserType = () => {
    // Function để test chuyển đổi giữa các user type
    if (userType === 'guest') {
      setUserType('member');
    } else if (userType === 'member') {
      setUserType('admin');
    } else {
      setUserType('guest');
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Render Header cho Guest
  const renderGuestHeader = () => (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        <Link
          to="/"
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
            isActiveRoute('/') 
              ? 'text-green-600 bg-green-50' 
              : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Trang chủ</span>
        </Link>
        
        <Link
          to="/books"
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
            isActiveRoute('/books') 
              ? 'text-green-600 bg-green-50' 
              : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Khám phá sách</span>
        </Link>

        {/* Search Bar */}
        <div className="relative mx-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm sách theo tiêu đề, tác giả..."
                className="w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        <button
          onClick={handleLogin}
          className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
        >
          Đăng nhập
        </button>
        
        <button
          onClick={handleRegister}
          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition duration-200"
        >
          Đăng ký
        </button>

        {/* Debug button - có thể xóa sau */}
        <button
          onClick={toggleUserType}
          className="p-2 text-xs text-gray-400 hover:text-gray-600"
          title="Chuyển đổi user type (debug)"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          className="p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg py-4 z-50">
            <div className="px-4 space-y-2">
              <Link
                to="/"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Trang chủ</span>
              </Link>
              
              <Link
                to="/books"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>Khám phá sách</span>
              </Link>

              {/* Mobile Search */}
              <div className="px-3 py-2">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm sách..."
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>

              <button
                onClick={handleLogin}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
              >
                <User className="h-4 w-4" />
                <span>Đăng nhập</span>
              </button>
              
              <button
                onClick={handleRegister}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <span>Đăng ký</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  // Render Header cho Member
  const renderMemberHeader = () => (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        <Link
          to="/"
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
            isActiveRoute('/') 
              ? 'text-green-600 bg-green-50' 
              : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Trang chủ</span>
        </Link>
        
        <Link
          to="/books"
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
            isActiveRoute('/books') 
              ? 'text-green-600 bg-green-50' 
              : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Khám phá</span>
        </Link>

        <Link
          to="/my-books"
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
            isActiveRoute('/my-books') 
              ? 'text-green-600 bg-green-50' 
              : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
          }`}
        >
          <Library className="h-4 w-4" />
          <span>Tủ sách</span>
        </Link>

        <Link
          to="/exchanges"
          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
            isActiveRoute('/exchanges') 
              ? 'text-green-600 bg-green-50' 
              : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
          }`}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Trao đổi</span>
        </Link>

        {/* Search Bar */}
        <div className="relative mx-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm sách theo tiêu đề, tác giả..."
                className="w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-gray-400 hover:text-green-600 transition duration-200">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            3
          </span>
        </button>

        {/* Messages */}
        <button className="relative p-2 text-gray-400 hover:text-green-600 transition duration-200">
          <MessageCircle className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            5
          </span>
        </button>

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition duration-200"
          >
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">Nguyễn Văn A</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                <span>Hồ sơ cá nhân</span>
              </Link>
              <Link
                to="/my-books"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <BookMarked className="h-4 w-4" />
                <span>Tủ sách của tôi</span>
              </Link>
              <Link
                to="/messages"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Tin nhắn</span>
              </Link>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>

        {/* Debug button - có thể xóa sau */}
        <button
          onClick={toggleUserType}
          className="p-2 text-xs text-gray-400 hover:text-gray-600"
          title="Chuyển đổi user type (debug)"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </nav>

      {/* Mobile Navigation cho Member */}
      <div className="md:hidden">
        <div className="flex items-center space-x-2">
          <button className="relative p-2 text-gray-400 hover:text-green-600">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
              3
            </span>
          </button>
          
          <button
            className="p-2 rounded-md text-gray-700 hover:text-green-600 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg py-4 z-50">
            <div className="px-4 space-y-2">
              <div className="flex items-center space-x-3 px-3 py-2 border-b border-gray-100 pb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Nguyễn Văn A</div>
                  <div className="text-sm text-gray-500">Thành viên</div>
                </div>
              </div>

              <Link
                to="/"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Trang chủ</span>
              </Link>
              
              <Link
                to="/books"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <BookOpen className="h-4 w-4" />
                <span>Khám phá</span>
              </Link>

              <Link
                to="/my-books"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Library className="h-4 w-4" />
                <span>Tủ sách</span>
              </Link>

              <Link
                to="/exchanges"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Trao đổi</span>
              </Link>

              <Link
                to="/messages"
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Tin nhắn</span>
              </Link>

              {/* Mobile Search */}
              <div className="px-3 py-2">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm sách..."
                      className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-600"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <BookOpen className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">BookSwap</span>
          </Link>

          {/* Render appropriate header based on user type */}
          {userType === 'guest' ? renderGuestHeader() : renderMemberHeader()}
        </div>
      </div>
    </header>
  );
};

export default Header;