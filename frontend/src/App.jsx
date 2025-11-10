import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import ScrollToTop from "./components/layout/ScrollToTop";
import Home from "./pages/Home";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Auth pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Books pages
import BookList from "./pages/books/BookList";
import BookDetail from "./pages/books/BookDetail";
import MyLibrary from "./pages/books/MyLibrary";
import AddBook from "./pages/books/AddBook";
import EditBook from "./pages/books/EditBook";
import CategoryBooks from "./pages/books/CategoryBooks";
import SearchBooks from "./pages/books/SearchBooks";

// Member pages
import MemberDashboard from "./pages/member/MemberDashboard";

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
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/verifyemail" element={<VerifyEmail />} />

        {/* Books routes */}
        <Route path="/books" element={<BookList />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/my-library" element={<MyLibrary />} />
        <Route path="/books/add" element={<AddBook />} />
        <Route path="/books/edit/:id" element={<EditBook />} />
        <Route path="/books/category/:category" element={<CategoryBooks />} />
        <Route path="/books/search" element={<SearchBooks />} />

        {/* 👤 Member routes */}
        <Route path="/dashboard" element={<MemberDashboard />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;