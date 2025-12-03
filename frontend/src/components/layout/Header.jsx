import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // ✅ Thêm hook useAuth
import messagesService from '../../services/api/messages';
import NotificationBell from '../notifications/NotificationBell';

// Header cho Guest (chưa đăng nhập)
const HeaderGuest = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Trang chủ', href: '/', current: location.pathname === '/' },
    {
      name: 'Khám phá sách',
      href: '/books',
      current: location.pathname === '/books',
    },
    {
      name: 'Giới thiệu',
      href: '/about',
      current: location.pathname === '/about',
    },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo và main navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BS</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                BookSwap
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side navigation - Guest */}
          <div className="flex items-center space-x-4">
            <Link
              to="/auth/login"
              className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Đăng nhập
            </Link>
            <Link
              to="/auth/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Đăng ký
            </Link>

            {/* Mobile menu button */}
            <div className="sm:hidden ml-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - Guest */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1">
                <Link
                  to="/auth/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/auth/register"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

// Header cho Member (đã đăng nhập)
const HeaderMember = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Lấy thông tin user từ auth context
  const { user, logout } = useAuth();

  // ✅ Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const result = await messagesService.getUnreadCount();
        setUnreadMessageCount(result?.unread_count || result?.count || 0);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };
    
    if (user) {
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const navigation = [
    { name: 'Trang chủ', href: '/', current: location.pathname === '/' },
    {
      name: 'Khám phá sách',
      href: '/books',
      current: location.pathname === '/books',
    },
    {
      name: 'Trao đổi',
      href: '/exchange',
      current: location.pathname.startsWith('/exchange'),
    },
    {
      name: 'Tin nhắn',
      href: '/messages',
      current: location.pathname.startsWith('/messages'),
    },
    {
      name: 'Thông báo',
      href: '/notifications',
      current: location.pathname.startsWith('/notifications'),
    },
  ];

  const userNavigation = [
    { name: 'Hồ sơ', href: '/profile' },
    { name: 'Thư viện của tôi', href: '/books/my-library' },
    { name: 'Sách muốn có', href: '/library/wanted-books' },
    { name: 'Lịch hẹn', href: '/exchange/meetings' },
    { name: 'Báo cáo của tôi', href: '/reports' },
    { name: 'Cài đặt', href: '/settings' },
    // Admin link - will be filtered if not admin
    ...(user?.role === 'ADMIN' ? [{ name: '🔧 Quản trị Admin', href: '/admin', isAdmin: true }] : []),
  ];

  // ✅ Xử lý logout với auth service
  const handleLogout = async () => {
    try {
      await logout();
      setIsUserDropdownOpen(false);
      navigate('/'); // Chuyển hướng về trang chủ sau khi logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ✅ Lấy tên hiển thị từ user object
  const getUserDisplayName = () => {
    return user?.full_name || user?.email || 'Người dùng';
  };

  // ✅ Lấy chữ cái đầu cho avatar
  const getAvatarInitial = () => {
    return getUserDisplayName().charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo và main navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BS</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">
                BookSwap
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium relative`}
                >
                  {item.name}
                  {/* Unread badge for Messages */}
                  {item.name === 'Tin nhắn' && unreadMessageCount > 0 && (
                    <span className="ml-1.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side navigation - Member */}
          <div className="flex items-center space-x-4">
            <Link
              to="/exchange/create-request"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Tạo trao đổi
            </Link>

            {/* Notification Bell */}
            <NotificationBell />

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 p-1"
              >
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user.avatar_url}
                      alt={getUserDisplayName()}
                    />
                  ) : (
                    <span className="text-gray-600 font-medium">
                      {getAvatarInitial()}
                    </span>
                  )}
                </div>
                <span className="text-gray-700 hidden md:block">
                  {getUserDisplayName()}
                </span>
              </button>

              {/* Dropdown menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {/* User info */}
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <div className="font-medium">{getUserDisplayName()}</div>
                      <div className="text-gray-500 text-xs">{user?.email}</div>
                    </div>

                    {/* User navigation */}
                    {userNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserDropdownOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}

                    {/* Logout */}
                    <div className="border-t my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden ml-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu - Member */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {user?.avatar_url ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatar_url}
                        alt={getUserDisplayName()}
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {getAvatarInitial()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {getUserDisplayName()}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {userNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Overlay khi dropdown mở */}
      {isUserDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserDropdownOpen(false)}
        ></div>
      )}
    </header>
  );
};

// Header chính - tự động nhận biết trạng thái đăng nhập
const Header = () => {
  // ✅ Sử dụng useAuth để xác định trạng thái đăng nhập
  const { isAuthenticated, user } = useAuth();

  return isAuthenticated ? <HeaderMember /> : <HeaderGuest />;
};

export default Header;
