import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, BookOpen, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchClick = () => {
    navigate('/search');
    setIsMenuOpen(false);
  };

  const handleLogin = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  const handleRegister = () => {
    navigate('/register');
    setIsMenuOpen(false);
  };

  const isActiveRoute = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Trang chủ' },
    { path: '/books', label: 'Khám phá sách' },
    { path: '/community', label: 'Cộng đồng' },
    { path: '/how-it-works', label: 'Cách hoạt động' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/50'
        : 'bg-white/90 backdrop-blur-lg border-b border-gray-200/30'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo + Main Nav */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group flex-shrink-0"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">BookSwap</span>
                <span className="text-xs text-gray-500 -mt-1">Trao đổi sách thông minh</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                    isActiveRoute(item.path) 
                      ? 'text-blue-600 bg-blue-50 shadow-lg' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side: Search + Auth */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button
              onClick={handleSearchClick}
              className="p-3 rounded-2xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Auth Buttons */}
            <button
              onClick={handleLogin}
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
            >
              Đăng nhập
            </button>
            
            <button
              onClick={handleRegister}
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Đăng ký
            </button>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                className="p-3 rounded-2xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-2xl py-6 lg:hidden">
            <div className="px-6 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-4 rounded-2xl text-base font-semibold transition-all duration-300 ${
                    isActiveRoute(item.path) 
                      ? 'text-blue-600 bg-blue-50 shadow-lg' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Search in Mobile */}
              <button
                onClick={handleSearchClick}
                className="w-full text-left px-4 py-4 rounded-2xl text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300"
              >
                Tìm kiếm sách
              </button>

              {/* Auth Buttons in Mobile */}
              <div className="pt-4 space-y-3 border-t border-gray-200/50 mt-4">
                <button
                  onClick={handleLogin}
                  className="w-full text-left px-4 py-4 rounded-2xl text-base font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300"
                >
                  Đăng nhập
                </button>
                
                <button
                  onClick={handleRegister}
                  className="w-full text-left px-4 py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Đăng ký miễn phí
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Background Overlay for Mobile Menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;