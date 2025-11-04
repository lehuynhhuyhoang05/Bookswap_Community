import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  BookOpen, 
  AlertCircle, 
  Loader2, 
  CheckCircle, 
  Shield,
  ArrowRight,
  Sparkles,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token');

  // Password validation rules
  const passwordRequirements = {
    minLength: formData.new_password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(formData.new_password),
    hasNumber: /\d/.test(formData.new_password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.new_password),
    minUniqueChars: new Set(formData.new_password).size >= 3
  };

  const requirementsMet = Object.values(passwordRequirements).filter(Boolean).length;
  const totalRequirements = Object.keys(passwordRequirements).length;
  const progressPercentage = (requirementsMet / totalRequirements) * 100;
  const isPasswordValid = requirementsMet === totalRequirements;

  const mockValidateTokenAPI = async (token) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const validTokens = [
      'demo_reset_token_123',
      'demo_reset_token_456', 
      'demo_reset_token_789'
    ];

    if (!token || !validTokens.includes(token)) {
      const error = new Error('Invalid or expired token');
      error.status = 400;
      throw error;
    }

    return {
      message: 'Token is valid',
      email: 'user@example.com'
    };
  };

  const mockResetPasswordAPI = async (token, new_password) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const validTokens = [
      'demo_reset_token_123',
      'demo_reset_token_456', 
      'demo_reset_token_789'
    ];

    if (!token || !validTokens.includes(token)) {
      const error = new Error('Invalid or expired token');
      error.status = 400;
      throw error;
    }

    return {
      message: 'Password reset successfully'
    };
  };

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Thiếu token đặt lại mật khẩu');
        setIsValidatingToken(false);
        return;
      }

      try {
        await mockValidateTokenAPI(token);
        setIsValidatingToken(false);
      } catch (error) {
        setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.new_password || !formData.confirm_password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return false;
    }

    if (!isPasswordValid) {
      setError('Mật khẩu không đáp ứng yêu cầu bảo mật');
      return false;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await mockResetPasswordAPI(token, formData.new_password);
      
      setSuccess('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      if (error.status === 400) {
        setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.');
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại sau');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Loading khi đang validate token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen flex bg-white">
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md text-center">
            <div className="flex flex-col items-center justify-center space-y-6">
              <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
              <h2 className="text-3xl font-bold text-gray-900">Đang xác thực liên kết...</h2>
              <p className="text-lg text-gray-600">
                Vui lòng chờ trong giây lát
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Nếu không có token hoặc token không hợp lệ
  if (!token || error) {
    return (
      <div className="min-h-screen flex bg-white">
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-md text-center">
            <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Liên kết không hợp lệ
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {error || 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.'}
            </p>
            <Link
              to="/forgot-password"
              className="group inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span>Yêu cầu lại liên kết</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Đặt lại mật khẩu
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                mới an toàn
              </span>
            </h2>
            <p className="text-lg text-gray-600">
              Tạo mật khẩu mới để bảo vệ tài khoản của bạn
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50/50 py-8 px-8 rounded-3xl shadow-xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Success Message */}
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <div>
                    <span className="text-emerald-700 text-sm font-medium block">Thành công!</span>
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

              {/* New Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Mật khẩu mới *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    name="new_password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`bg-white border ${
                      formData.new_password ? (isPasswordValid ? 'border-green-300' : 'border-red-300') : 'border-gray-300'
                    } text-gray-900 placeholder-gray-400 appearance-none block w-full pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-300 hover:border-gray-400`}
                    placeholder="••••••••"
                    value={formData.new_password}
                    onChange={handleChange}
                    disabled={isLoading || success}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-2xl transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || success}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Password Requirements Dropdown */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowRequirements(!showRequirements)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-200 hover:bg-gray-100 transition-all duration-200"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Yêu cầu mật khẩu ({requirementsMet}/{totalRequirements})
                    </span>
                    {showRequirements ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </button>

                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          progressPercentage === 100 ? 'bg-green-500' : 
                          progressPercentage >= 66 ? 'bg-yellow-500' : 
                          progressPercentage >= 33 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Requirements List */}
                  {showRequirements && (
                    <div className="mt-3 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          {passwordRequirements.minLength ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${passwordRequirements.minLength ? 'text-green-600' : 'text-gray-600'}`}>
                            Tối thiểu 8 ký tự
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {passwordRequirements.hasLetter ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${passwordRequirements.hasLetter ? 'text-green-600' : 'text-gray-600'}`}>
                            Bao gồm chữ cái
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {passwordRequirements.hasNumber ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-600'}`}>
                            Bao gồm số
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {passwordRequirements.hasSpecialChar ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-600'}`}>
                            Bao gồm ký tự đặc biệt
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {passwordRequirements.minUniqueChars ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${passwordRequirements.minUniqueChars ? 'text-green-600' : 'text-gray-600'}`}>
                            Tối thiểu 3 ký tự khác nhau
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`bg-white border ${
                      formData.confirm_password ? 
                        (formData.new_password === formData.confirm_password && formData.confirm_password ? 'border-green-300' : 'border-red-300') 
                        : 'border-gray-300'
                    } text-gray-900 placeholder-gray-400 appearance-none block w-full pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-300 hover:border-gray-400`}
                    placeholder="••••••••"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    disabled={isLoading || success}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-2xl transition-colors duration-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading || success}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formData.confirm_password && formData.new_password === formData.confirm_password && formData.confirm_password && (
                  <p className="text-green-600 text-sm mt-1 flex items-center space-x-1">
                    <Check className="h-4 w-4" />
                    <span>Mật khẩu khớp</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading || success || !isPasswordValid}
                  className="group w-full flex justify-center items-center space-x-3 py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Đang đặt lại mật khẩu...</span>
                    </>
                  ) : (
                    <>
                      <span>Đặt lại mật khẩu</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Security Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-800">Bảo mật tài khoản</span>
              </div>
              <p className="text-xs text-blue-700">
                Mật khẩu mạnh giúp bảo vệ tài khoản của bạn khỏi các nguy cơ bảo mật.
              </p>
            </div>

            {/* Back to Login Link */}
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 inline-flex items-center space-x-2 group"
              >
                <span>Quay lại đăng nhập</span>
                <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
              </Link>
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
            {/* Security Illustration */}
            <div className="relative">
              <div className="w-64 h-64 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl border border-blue-200/50 backdrop-blur-sm transform rotate-3 shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Lock className="h-10 w-10 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">Bảo mật</div>
                </div>
              </div>
              
              {/* Floating Icons */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-white rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                Bảo vệ tài khoản
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Tạo mật khẩu mới mạnh để đảm bảo an toàn cho tài khoản BookSwap của bạn.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">99.9%</div>
                <div className="text-sm text-gray-600">An toàn</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">5 yêu cầu</div>
                <div className="text-sm text-gray-600">Mật khẩu</div>
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

export default ResetPassword;