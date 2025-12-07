import api from './config';

export const authService = {
  /**
   * ⭐ 1. POST /auth/forgot-password
   * Yêu cầu đặt lại mật khẩu
   */
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send reset email' };
    }
  },

  /**
   * ⭐ 2. POST /auth/login
   * Đăng nhập user
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);

      if (response.data.access_token) {
        // Lưu token vào localStorage
        localStorage.setItem('accessToken', response.data.access_token);
        localStorage.setItem('refreshToken', response.data.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Lưu userRole cho admin check
        if (response.data.user?.role) {
          localStorage.setItem('userRole', response.data.user.role);
        }
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  /**
   * ⭐ 3. POST /auth/logout
   * Đăng xuất user
   */
  async logout() {
    try {
      const response = await api.post('/auth/logout');

      // Xóa token khỏi localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');

      return response.data;
    } catch (error) {
      // Vẫn xóa token dù API call thất bại
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');

      throw error.response?.data || { message: 'Logout failed' };
    }
  },

  /**
   * ⭐ 4. GET /auth/me
   * Lấy thông tin user hiện tại
   */
  async getMe() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get user profile' };
    }
  },

  /**
   * Alias for getMe (better naming)
   */
  async getProfile() {
    return this.getMe();
  },

  /**
   * ⭐ PATCH /auth/profile
   * Cập nhật thông tin profile
   */
  async updateProfile(data) {
    try {
      const response = await api.patch('/auth/profile', data);
      // Update localStorage user
      if (response.data) {
        this.updateUser(response.data);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  /**
   * ⭐ 5. POST /auth/refresh
   * Refresh access token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      if (response.data.access_token) {
        localStorage.setItem('accessToken', response.data.access_token);
      }

      return response.data;
    } catch (error) {
      // Nếu refresh thất bại, đăng xuất user
      this.logout();
      throw error.response?.data || { message: 'Token refresh failed' };
    }
  },

  /**
   * ⭐ 6. POST /auth/register
   * Đăng ký user mới
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);

      // không lưu token
      // if (response.data.access_token) {
      //   localStorage.setItem('accessToken', response.data.access_token);
      //   localStorage.setItem('refreshToken', response.data.refresh_token);
      //   localStorage.setItem('user', JSON.stringify(response.data.user));
      //   localStorage.setItem('isLoggedIn', 'true');
      // }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  /**
   * ⭐ 7. POST /auth/reset-password
   * Đặt lại mật khẩu bằng token
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset failed' };
    }
  },

  /**
   * ⭐ 8. GET /auth/reset-password
   * Trang HTML để nhập mật khẩu mới
   * Note: API này trả về HTML, có thể cần xử lý đặc biệt
   */
  async getResetPasswordPage(token) {
    try {
      const response = await api.get(`/auth/reset-password?token=${token}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: 'Failed to load reset password page',
        }
      );
    }
  },

  /**
   * ⭐ 9. GET /auth/verify-email
   * Xác minh email
   */
  async verifyEmail(token) {
    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Email verification failed' };
    }
  },

  // ========== UTILITY METHODS ==========

  /**
   * Kiểm tra xem user đã đăng nhập chưa
   */
  isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  /**
   * Lấy thông tin user từ localStorage
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  /**
   * Lấy access token
   */
  getToken() {
    return localStorage.getItem('accessToken');
  },

  /**
   * Lấy refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Cập nhật user info trong localStorage
   */
  updateUser(userData) {
    const currentUser = this.getCurrentUser();
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  },
};

export default authService;
