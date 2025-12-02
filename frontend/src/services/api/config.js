import axios from 'axios';

// Base URL, bỏ dấu / ở cuối cho gọn
const API_BASE_URL = 'http://localhost:3003';

// Tạo instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - xử lý lỗi và refresh token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Thử refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const newToken = response.data.access_token;
          localStorage.setItem('accessToken', newToken);

          // Retry request với token mới
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token thất bại, đăng xuất
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');

        // Chuyển hướng đến trang login
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      }
    }

    // Xử lý các lỗi khác
    if (error.response?.status === 403) {
      console.error(
        'Forbidden: You do not have permission to access this resource',
      );
    } else if (error.response?.status === 404) {
      console.error('Not Found: The requested resource was not found');
    } else if (error.response?.status >= 500) {
      console.error('Server Error: Please try again later');
    }

    return Promise.reject(error);
  },
);

export default api;
