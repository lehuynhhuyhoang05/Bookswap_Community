import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, BookOpen, Menu, X, Bell, BookText, Heart, Plus, ChevronDown } from 'lucide-react';

// Custom hook để xử lý hover với delay
const useHover = (delay = 200) => {
  const [value, setValue] = useState(false);
  const ref = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (node) {
      const handleMouseOver = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setValue(true);
      };
      
      const handleMouseOut = () => {
        timeoutRef.current = setTimeout(() => setValue(false), delay);
      };

      node.addEventListener('mouseover', handleMouseOver);
      node.addEventListener('mouseout', handleMouseOut);

      return () => {
        node.removeEventListener('mouseover', handleMouseOver);
        node.removeEventListener('mouseout', handleMouseOut);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, [delay]);

  return [ref, value, setValue];
};

const Header = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hover hooks
  const [libraryRef, isLibraryHovered, setLibraryHovered] = useHover(200);
  const [userRef, isUserHovered, setUserHovered] = useHover(200);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchClick = () => {
    navigate('/books/search', { 
      state: { 
        from: location.pathname
      }
    });
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setUserHovered(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  // Hàm kiểm tra active route - ĐÃ FIX
  const isActiveRoute = (path, type) => {
    if (type === 'search') {
      return location.pathname === '/books/search';
    } else if (type === 'library') {
      // Kiểm tra tất cả các route liên quan đến tủ sách
      return (
        location.pathname === '/my-library' ||
        location.pathname.startsWith('/my-library/') ||
        location.pathname === '/wishlist' ||
        location.pathname.startsWith('/wishlist/') ||
        location.pathname === '/books/add' ||
        location.pathname.startsWith('/books/add/') ||
        location.pathname.startsWith('/books/edit/') || // Chỉnh sửa sách
        location.pathname.startsWith('/books/') && 
          !location.pathname.startsWith('/books/search') // Các trang sách khác nhưng không bao gồm search
      );
    } else if (path) {
      return location.pathname === path;
    }
    return false;
  };

  // Guest navigation
  const guestNavItems = [
    { path: '/', label: 'Trang chủ' },
    { path: '/books', label: 'Khám phá sách' },
    { path: '/how-it-works', label: 'Cách hoạt động' },
  ];

  // Member navigation
  const memberNavItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { 
      label: 'Tủ sách',
      type: 'dropdown',
      items: [
        { path: '/my-library', label: 'Sách của tôi', icon: BookText },
        { path: '/wishlist', label: 'Sách tôi muốn', icon: Heart },
        { path: '/books/add', label: 'Thêm sách mới', icon: Plus },
      ]
    },
    { path: '/exchanges', label: 'Trao đổi' },
    { path: '/messages', label: 'Chat' },
  ];

  const userDropdownItems = [
    { path: '/profile', label: 'Hồ sơ cá nhân' },
    { path: '/settings', label: 'Cài đặt' },
  ];

  // Render navigation cho member
  const renderMemberNavigation = () => (
    <nav className="hidden lg:flex items-center space-x-1">
      {memberNavItems.map((item) => {
        if (item.type === 'dropdown') {
          return (
            <div
              key={item.label}
              ref={libraryRef}
              className="relative"
              onMouseEnter={() => setLibraryHovered(true)}
              onMouseLeave={() => setLibraryHovered(false)}
            >
              <button
                className={`flex items-center space-x-1 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 hover:scale-105 ${
                  isLibraryHovered || isActiveRoute(null, 'library')
                    ? 'text-blue-600 bg-blue-50 shadow-lg'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span>{item.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isLibraryHovered ? 'rotate-180' : ''}`} />
              </button>

              {isLibraryHovered && (
                <div
                  className="absolute left-0 top-full mt-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50"
                >
                  {item.items.map((subItem) => {
                    const IconComponent = subItem.icon;
                    return (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300 ${
                          isActiveRoute(subItem.path) ? 'text-blue-600 font-semibold' : ''
                        }`}
                        onClick={() => setLibraryHovered(false)}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        } else {
          return (
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
          );
        }
      })}
    </nav>
  );

  // Render right side (user / guest)
  const renderRightSide = () => {
    if (user) {
      return (
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSearchClick}
            className={`p-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
              isActiveRoute(null, 'search')
                ? 'text-blue-600 bg-blue-50 shadow-lg'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <Search className="h-5 w-5" />
          </button>

          <button className="p-3 rounded-2xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300 hover:scale-105 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <div
            ref={userRef}
            className="relative"
            onMouseEnter={() => setUserHovered(true)}
            onMouseLeave={() => setUserHovered(false)}
          >
            <button className="flex items-center space-x-3 px-4 py-2 rounded-2xl text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300 hover:scale-105">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden md:block">{user?.name || 'Thành viên'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isUserHovered ? 'rotate-180' : ''}`} />
            </button>

            {isUserHovered && (
              <div className="absolute right-0 top-full w-64 mt-0 bg-white rounded-2xl shadow-2xl border border-gray-200/50 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200/50">
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>

                <div className="py-2">
                  {userDropdownItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="block px-4 py-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300"
                      onClick={() => setUserHovered(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-gray-200/50 pt-2">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:hidden flex items-center">
            <button
              className="p-3 rounded-2xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSearchClick}
            className={`p-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
              isActiveRoute(null, 'search')
                ? 'text-blue-600 bg-blue-50 shadow-lg'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-2xl text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300 hover:scale-105"
          >
            Đăng nhập
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Đăng ký
          </button>
          <div className="lg:hidden flex items-center">
            <button
              className="p-3 rounded-2xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      );
    }
  };

  // Guest nav
  const renderNavigation = () => (
    user ? renderMemberNavigation() :
    <nav className="hidden lg:flex items-center space-x-1">
      {guestNavItems.map((item) => (
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
  );

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/50'
        : 'bg-white/90 backdrop-blur-lg border-b border-gray-200/30'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-8">
            <Link 
              to={user ? "/dashboard" : "/"} 
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

            {renderNavigation()}
          </div>

          {renderRightSide()}
        </div>
      </div>
    </header>
  );
};

export default Header;