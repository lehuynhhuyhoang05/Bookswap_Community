import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Users,
  Shield
} from "lucide-react";

const Login = (props) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  // Mock API dựa trên spec
  const mockLoginAPI = async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const demoAccounts = {
      "user@example.com": {
        password: "Password123",
        user: {
          id: 1,
          name: "Nguyễn Văn A",
          email: "user@example.com",
          role: "member",
          avatar: null,
        },
        token: "demo_token_user_123",
      },
      "admin@bookswap.com": {
        password: "Admin123",
        user: {
          id: 2,
          name: "Quản trị viên",
          email: "admin@bookswap.com",
          role: "admin",
          avatar: null,
        },
        token: "demo_token_admin_123",
      },
    };

    const account = demoAccounts[email];

    if (!account) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    if (account.password !== password) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    return {
      token: account.token,
      user: account.user,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Email không hợp lệ");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await mockLoginAPI(formData.email, formData.password);
      console.log("Login successful:", response);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Gọi callback để thông báo cho component cha (nếu có)
      if (props.onLoginSuccess) {
        props.onLoginSuccess(response.user);
      }

      // Điều hướng đến dashboard của member
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);

      if (error.status === 401) {
        setError("Email hoặc mật khẩu không chính xác");
      } else {
        setError("Đăng nhập thất bại, vui lòng thử lại");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (type) => {
    const demoAccounts = {
      user: { email: "user@example.com", password: "Password123" },
      admin: { email: "admin@bookswap.com", password: "Admin123" },
    };

    setFormData(demoAccounts[type]);
    setError("");
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Chào mừng trở lại!
            </h2>
            <p className="text-lg text-gray-600">
              Đăng nhập để tiếp tục hành trình đọc sách
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 text-center mb-4">
              Tài khoản demo (click để tự động điền):
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin("user")}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 px-4 py-3 rounded-2xl text-sm font-semibold hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 disabled:opacity-50 border border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>User Demo</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("admin")}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 px-4 py-3 rounded-2xl text-sm font-semibold hover:from-green-100 hover:to-emerald-100 transition-all duration-300 disabled:opacity-50 border border-green-200 hover:border-green-300 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin Demo</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50/50 py-8 px-8 rounded-3xl shadow-xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
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
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition duration-200"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-3 block text-sm text-gray-700 font-medium"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgotpassword"
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
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
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200 inline-flex items-center space-x-1 group"
                >
                  <span>Đăng ký ngay</span>
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
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop",
                "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop"
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
              Khám phá thế giới sách
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Tham gia cộng đồng yêu sách lớn nhất Việt Nam. 
              Trao đổi, kết nối và mở rộng tủ sách của bạn.
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

export default Login;