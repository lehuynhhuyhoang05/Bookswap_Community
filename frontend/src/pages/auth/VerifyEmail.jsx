import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  BookOpen, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  TrendingUp
} from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [error, setError] = useState('');
  
  const token = searchParams.get('token');

  const mockVerifyEmailAPI = async (token) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const validTokens = [
      'demo_verify_token_123',
      'demo_verify_token_456', 
      'demo_verify_token_789',
      'email_verification_123',
      'verify_user_456'
    ];

    if (!token || !validTokens.includes(token)) {
      const error = new Error('Invalid or expired verification token');
      error.status = 400;
      throw error;
    }

    return {
      message: 'Email verified successfully',
      user: {
        id: 1,
        name: 'Nguyễn Văn A',
        email: 'user@example.com',
        isVerified: true
      }
    };
  };

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setError('Thiếu token xác minh email');
        return;
      }

      try {
        const response = await mockVerifyEmailAPI(token);
        setVerificationStatus('success');
        
        setTimeout(() => {
          navigate('/login');
        }, 5000);
        
      } catch (error) {
        setVerificationStatus('error');
        setError('Liên kết xác minh không hợp lệ hoặc đã hết hạn');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  // Loading state
  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen flex bg-white">
        {/* Left Side - Content */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md text-center">
            <div className="flex flex-col items-center justify-center space-y-8">
              <Loader2 className="h-20 w-20 text-blue-600 animate-spin" />
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Đang xác minh email
                </h2>
                <p className="text-lg text-gray-600">
                  Vui lòng chờ trong giây lát trong khi chúng tôi xác minh địa chỉ email của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center px-12 text-center">
            <div className="max-w-md space-y-8">
              <div className="w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl border border-blue-200/50 backdrop-blur-sm flex items-center justify-center">
                <Mail className="h-16 w-16 text-blue-600" />
              </div>
              
              <h3 className="text-3xl font-bold text-gray-900">
                Xác minh email
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Bước quan trọng để bảo vệ tài khoản và trải nghiệm đầy đủ trên BookSwap.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex bg-white">
        {/* Left Side - Content */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Chúc mừng!
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Xác minh thành công
                </span>
              </h2>
              <p className="text-lg text-gray-600">
                Email của bạn đã được xác minh. Tài khoản đã sẵn sàng sử dụng!
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50/50 py-8 px-8 rounded-3xl shadow-xl border border-gray-100">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center mb-8">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                  <p className="text-green-700 text-sm font-medium">
                    🎉 Tài khoản của bạn đã được kích hoạt đầy đủ!
                  </p>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Bạn sẽ được chuyển đến trang đăng nhập sau <span className="font-bold text-blue-600">5 giây</span>...
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="group w-full flex justify-center items-center space-x-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <span>Đăng nhập ngay</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/"
                  className="group w-full flex justify-center items-center space-x-3 py-4 px-4 border border-gray-300 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <span>Khám phá BookSwap</span>
                  <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Community Stats */}
            <div className="mt-8 grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">15K+</div>
                <div className="text-sm text-gray-600">Thành viên</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">28K+</div>
                <div className="text-sm text-gray-600">Sách</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">9K+</div>
                <div className="text-sm text-gray-600">Giao dịch</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center px-12 text-center">
            <div className="max-w-md space-y-8">
              {/* Celebration Illustration */}
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl border border-green-200/50 backdrop-blur-sm transform rotate-3 shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">Chào mừng!</div>
                  </div>
                </div>
                
                {/* Floating Icons */}
                <div className="absolute -top-4 -left-4 w-14 h-14 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                </div>
              </div>

              <h3 className="text-3xl font-bold text-gray-900">
                Tham gia cộng đồng
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Bắt đầu hành trình khám phá sách và kết nối với những độc giả cùng đam mê.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Content */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Rất tiếc!
              <span className="block bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Xác minh thất bại
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              {error || 'Liên kết xác minh không hợp lệ hoặc đã hết hạn.'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50/50 py-8 px-8 rounded-3xl shadow-xl border border-gray-100">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <XCircle className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-8">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                <p className="text-red-700 text-sm font-medium">
                  Liên kết xác minh không hợp lệ. Vui lòng yêu cầu gửi lại email xác minh.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link
                to="/register"
                className="group w-full flex justify-center items-center space-x-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <span>Đăng ký lại</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/"
                className="group w-full flex justify-center items-center space-x-3 py-4 px-4 border border-gray-300 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span>Về trang chủ</span>
                <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Support Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Cần hỗ trợ?{' '}
              <a href="mailto:support@bookswap.com" className="font-semibold text-blue-600 hover:text-blue-500">
                Liên hệ hỗ trợ
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-50 via-red-50 to-orange-50 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center px-12 text-center">
          <div className="max-w-md space-y-8">
            {/* Error Illustration */}
            <div className="w-64 h-64 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-3xl border border-red-200/50 backdrop-blur-sm flex items-center justify-center">
              <Mail className="h-16 w-16 text-red-600" />
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900">
              Đừng lo lắng!
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Bạn có thể đăng ký lại hoặc liên hệ hỗ trợ để được giúp đỡ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;