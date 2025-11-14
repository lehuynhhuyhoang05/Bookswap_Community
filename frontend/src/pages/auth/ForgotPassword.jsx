import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  BookOpen, 
  AlertCircle, 
  Loader2, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Shield
} from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Xu ly input
  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Goi API that den backend
  const forgotPasswordAPI = async (email) => {
    const response = await fetch('http://localhost:3000/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Gửi email thất bại');
    }

    return await response.json();
  };

  // Xu ly submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await forgotPasswordAPI(email);
      console.log('API Response:', response);

      setSuccess(
        'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.'
      );
    } catch (err) {
      console.error('ForgotPassword API Error:', err);
      setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Quên mật khẩu?
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Đừng lo lắng!
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu qua email
            </p>
          </div>

          {/* Form */}
          <div className="bg-gradient-to-br from-white to-gray-50/50 py-8 px-8 rounded-3xl shadow-xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Success Message */}
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <span className="text-emerald-700 text-sm font-medium block">Yêu cầu đã được gửi!</span>
                    <span className="text-emerald-600 text-sm">{success}</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Form input email chi hien khi chua success */}
              {!success && (
                <>
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
                        value={email}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="group w-full flex justify-center items-center space-x-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-105 active:scale-95"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Đang gửi yêu cầu...</span>
                        </>
                      ) : (
                        <>
                          <span>Gửi liên kết đặt lại</span>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>

            {/* Security Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Bảo mật</span>
              </div>
              <p className="text-xs text-blue-700">
                Hệ thống luôn trả về thành công để bảo mật, không tiết lộ email có tồn tại hay không.
              </p>
            </div>

            {/* Back to Login Link */}
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 inline-flex items-center space-x-2 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span>Quay lại đăng nhập</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center px-12 text-center">
          <div className="max-w-md space-y-8">
            <div className="relative">
              <div className="w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl border border-blue-200/50 backdrop-blur-sm transform rotate-3 shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">Bảo mật</div>
                </div>
              </div>

              <div className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-cyan-600" />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                An toàn và bảo mật
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Chúng tôi luôn đảm bảo thông tin của bạn được bảo vệ an toàn. 
                Liên kết đặt lại mật khẩu sẽ được gửi đến email của bạn.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-600">Thành công</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">2 phút</div>
                <div className="text-sm text-gray-600">Xử lý</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Hỗ trợ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; // ok nha
