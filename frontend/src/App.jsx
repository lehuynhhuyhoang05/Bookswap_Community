import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import ScrollToTop from './components/layout/ScrollToTop';
import Home from './pages/Home';

// Auth pages
import ForgotPassword from './pages/auth/ForgotPassword';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Books pages
import AddBook from './pages/books/AddBook';
import BookDetail from './pages/books/BookDetail';
import BookList from './pages/books/BookList';
import CategoryBooks from './pages/books/CategoryBooks';
import EditBook from './pages/books/EditBook';
import MyLibrary from './pages/books/MyLibrary';
import SearchBooks from './pages/books/SearchBooks';

// Member pages
import MemberDashboard from './pages/member/MemberDashboard';

function App() {
  const [user, setUser] = useState(null);

  // Kiểm tra xem user đã đăng nhập chưa khi app khởi động
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <ScrollToTop />
      <Header user={user} onLogout={handleLogout} />

      <Routes>
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Auth routes */}
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

        {/* Books routes */}
        <Route path="/books" element={<BookList />} />
        <Route path="/books/add" element={<AddBook />} />
        <Route path="/books/edit/:id" element={<EditBook />} />
        <Route path="/books/category/:category" element={<CategoryBooks />} />
        <Route path="/books/search" element={<SearchBooks />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/my-library" element={<MyLibrary />} />

        {/* 👤 Member routes */}
        <Route path="/dashboard" element={<MemberDashboard />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
