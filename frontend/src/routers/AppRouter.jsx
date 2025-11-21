import { Navigate, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Home
import Home from '../pages/home/index';

// Books
import Books from '../pages/books/index';
import MyLibrary from '../pages/books/my-library';
import AddBook from '../pages/books/add-book';
import EditBook from '../pages/books/edit-book/[id]';
import BookDetail from '../pages/books/detail/[id]';
import SearchBooks from '../pages/books/search';

// Library
import WantedBooks from '../pages/library/wanted-books';
import AddWantedBook from '../pages/library/add-wanted';
import EditWantedBook from '../pages/library/edit-wanted/[id]';

// Profile
import Profile from '../pages/profile/index';
import ProfileReviews from '../pages/profile/reviews';

// Messages
import Messages from '../pages/messages/index';
import ConversationDetail from '../pages/messages/conversation/[id]';

// Exchange Pages
import ExchangePage from '../pages/exchange/index';
import ExchangeRequests from '../pages/exchange/requests';
import ExchangesList from '../pages/exchange/list';
import ExchangeSuggestions from '../pages/exchange/suggestions';
import CreateExchangeRequest from '../pages/exchange/create-request';
import ExchangeRequestDetail from '../pages/exchange/request-detail/[id]';
import ExchangeDetail from '../pages/exchange/detail/[id]';

const AppRouter = () => (
  <Routes>

    {/* Public Routes */}
    <Route path="/" element={<Home />} />
    <Route path="/auth/login" element={<Login />} />
    <Route path="/auth/register" element={<Register />} />
    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
    <Route path="/books" element={<Books />} />
    <Route path="/books/search" element={<SearchBooks />} />
    <Route path="/books/detail/:id" element={<BookDetail />} />
    <Route path="/login" element={<Navigate to="/auth/login" replace />} />

    {/* Protected Routes */}
    {/* Books */}
    <Route path="/books/my-library" element={<PrivateRoute><MyLibrary /></PrivateRoute>} />
    <Route path="/books/add-book" element={<PrivateRoute><AddBook /></PrivateRoute>} />
    <Route path="/books/edit-book/:id" element={<PrivateRoute><EditBook /></PrivateRoute>} />

    {/* Library */}
    <Route path="/library/wanted-books" element={<PrivateRoute><WantedBooks /></PrivateRoute>} />
    <Route path="/library/add-wanted" element={<PrivateRoute><AddWantedBook /></PrivateRoute>} />
    <Route path="/library/edit-wanted/:id" element={<PrivateRoute><EditWantedBook /></PrivateRoute>} />

    {/* Profile */}
    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
    <Route path="/profile/reviews" element={<PrivateRoute><ProfileReviews /></PrivateRoute>} />

    {/* Messages */}
    <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
    <Route path="/messages/conversation/:id" element={<PrivateRoute><ConversationDetail /></PrivateRoute>} />

    {/* Exchange Routes */}
    <Route path="/exchange" element={<PrivateRoute><ExchangePage /></PrivateRoute>} />
    <Route path="/exchange/requests" element={<PrivateRoute><ExchangeRequests /></PrivateRoute>} />
    <Route path="/exchange/request/:id" element={<PrivateRoute><ExchangeRequestDetail /></PrivateRoute>} />
    <Route path="/exchange/list" element={<PrivateRoute><ExchangesList /></PrivateRoute>} />
    <Route path="/exchange/:id" element={<PrivateRoute><ExchangeDetail /></PrivateRoute>} />
    <Route path="/exchange/suggestions" element={<PrivateRoute><ExchangeSuggestions /></PrivateRoute>} />
    <Route path="/exchange/create-request" element={<PrivateRoute><CreateExchangeRequest /></PrivateRoute>} />

    {/* 404 */}
    <Route path="*" element={
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold">404 - Page Not Found</h1>
        <p className="text-gray-600 mt-2">Trang bạn tìm kiếm không tồn tại.</p>
        <div className="mt-4">
          <a href="/" className="text-blue-600 hover:text-blue-500 font-medium">Quay về trang chủ</a>
        </div>
      </div>
    } />

  </Routes>
);

export default AppRouter;