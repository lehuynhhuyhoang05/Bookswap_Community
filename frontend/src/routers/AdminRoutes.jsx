import { Navigate, Route, Routes } from 'react-router-dom';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminPanel from '../pages/admin/AdminPanel';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import AdminBooksPage from '../pages/admin/books/AdminBooksPage';
import AdminExchangesPage from '../pages/admin/exchanges/AdminExchangesPage';
import AdminModerationPage from '../pages/admin/moderation/AdminModerationPage';
import AdminUsersPage from '../pages/admin/users/AdminUsersPage';

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN'; // Check if user is admin

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedAdminRoute>
            <AdminPanel />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="books" element={<AdminBooksPage />} />
        <Route path="exchanges" element={<AdminExchangesPage />} />
        <Route path="moderation" element={<AdminModerationPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
