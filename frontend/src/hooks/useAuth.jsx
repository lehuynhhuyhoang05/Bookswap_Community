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

  // Khởi tạo auth state từ localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        const savedUser = authService.getCurrentUser();

        if (token && savedUser) {
          // Verify token bằng cách gọi API getMe
          try {
            const userData = await authService.getMe();
            setUser(userData);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Token validation failed:', error);
            authService.logout();
          }
        }
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

  // Register function - ✅ ĐÃ SỬA: Không set authenticated sau khi register
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      // ✅ Chỉ gọi register service, KHÔNG set authenticated
      const response = await authService.register(userData);

      // ❌ XÓA: Không set user và isAuthenticated
      // setUser(response.user);
      // setIsAuthenticated(true);

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
      // Vẫn clear state dù API call thất bại
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password function
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

  // Reset password function
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

  // Clear error
  const clearError = () => setError(null);

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
