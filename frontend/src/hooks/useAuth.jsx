import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Hàm refresh user dùng lại được nhiều nơi (Profile, layout, v.v.)
  const refreshUser = async () => {
    try {
      const token = authService.getToken();
      const savedUser = authService.getCurrentUser();

      if (!token || !savedUser) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      // verify token bằng API getMe
      const userData = await authService.getMe();
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error('Token validation / refresh user failed:', err);
      authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Khởi tạo auth state từ localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.login({ email, password });
      setUser(response.user);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.register(userData);
      // Không tự login sau khi register

      return response;
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to send reset email');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authService.resetPassword(token, newPassword);
      return response;
    } catch (error) {
      setError(error.message || 'Password reset failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    setUser,        // 👈 thêm setUser vào context
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    clearError,
    refreshUser,    // 👈 thêm refreshUser vào context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
