import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  User, 
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const mockRegisterAPI = async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const existingEmails = ['user@example.com', 'admin@bookswap.com', 'test@test.com'];
    
    if (existingEmails.includes(userData.email)) {
      const error = new Error('Email already exists');
      error.status = 409;
      throw error;
    }

    return {
      message: 'User registered successfully',
      user: {
        id: Math.floor(Math.random() * 1000) + 3,
        email: userData.email,
        full_name: userData.full_name
      }
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.full_name) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email không hợp lệ');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await mockRegisterAPI({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      });
      
      setSuccess('Đăng ký thành công! Đang chuyển hướng...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      if (error.status === 409) {
        setError('Email đã tồn tại trong hệ thống');
      } else {
        setError('Đăng ký thất bại, vui lòng thử lại');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setFormData({
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
      password: 'Password123',
      confirmPassword: 'Password123',
      full_name: 'Nguyễn Văn Demo'
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Bắt đầu hành trình
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                đọc sách!
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Tạo tài khoản để khám phá thế giới sách cùng BookSwap
            </p>
          </div>

          {/* Demo Fill Button */}
          <div className="mb-8">
            <button
              type="button"
              onClick={handleDemoFill}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 px-4 py-3 rounded-2xl text-sm font-semibold hover:from-amber-100 hover:to-orange-100 transition-all duration-300 disabled:opacity-50 border border-amber-200 hover:border-amber-300 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Click để tự động điền thông tin demo</span>
              </div>
            </button>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50/50 py-8 px-8 rounded-3xl shadow-xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Success Message */}
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span className="text-emerald-700 text-sm font-medium">{success}</span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Full Name Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Họ và tên *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    required
                    className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400 appearance-none block w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-300 hover:border-gray-400"
                    placeholder="Nguyễn Văn A"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400 appearance-none block w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-300 hover:border-gray-400"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Mật khẩu *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400 appearance-none block w-full pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-300 hover:border-gray-400"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-2xl transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Xác nhận mật khẩu *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400 appearance-none block w-full pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-300 hover:border-gray-400"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-2xl transition-colors duration-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition duration-200 mt-1"
                  disabled={isLoading}
                />
                <label htmlFor="agree-terms" className="block text-sm text-gray-700">
                  Tôi đồng ý với{' '}
                  <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                    Điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                    Chính sách bảo mật
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full flex justify-center items-center space-x-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Đang đăng ký...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký tài khoản</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 inline-flex items-center space-x-1 group"
                >
                  <span>Đăng nhập ngay</span>
                  <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center px-12 text-center">
          <div className="max-w-md space-y-8">
            {/* Floating Book Cards */}
            <div className="grid grid-cols-2 gap-6 mb-12">
              {[
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop"
              ].map((src, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl p-4 shadow-2xl border border-gray-100 transform transition-all duration-500 hover:shadow-2xl ${
                    index === 0 ? 'rotate-3 hover:rotate-0' : '-rotate-3 hover:rotate-0'
                  } hover:scale-105`}
                >
                  <img
                    src={src}
                    alt="Book"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                </div>
              ))}
            </div>

            <h3 className="text-3xl font-bold text-gray-900">
              Tham gia cộng đồng
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Kết nối với hàng ngàn độc giả yêu sách. 
              Trao đổi, chia sẻ và cùng nhau phát triển.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">15K+</div>
                <div className="text-sm text-gray-600">Thành viên</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">28K+</div>
                <div className="text-sm text-gray-600">Sách</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">9K+</div>
                <div className="text-sm text-gray-600">Giao dịch</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;