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
  Shield,
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

  // ✅ Endpoint NestJS
  const loginAPI = async (email, password) => {
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = "Đăng nhập thất bại";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("❌ API Error:", err);
      throw err;
    }
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
      const data = await loginAPI(formData.email, formData.password);

      // 🔹 Lưu token và thông tin người dùng
      let token = data.access_token || data.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      if (props.onLoginSuccess) {
        props.onLoginSuccess(data.user || data);
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Lỗi đăng nhập:", err);
      if (err.message.includes("401") || err.message.includes("credentials")) {
        setError("Email hoặc mật khẩu không chính xác");
      } else if (err.message.includes("404")) {
        setError("Endpoint API không tồn tại. Vui lòng kiểm tra cấu hình server.");
      } else if (err.message.includes("500")) {
        setError("Lỗi server. Vui lòng thử lại sau.");
      } else {
        setError(err.message || "Đăng nhập thất bại, vui lòng thử lại");
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
              Đăng nhập để tiếp tục hành trình đọc sách 📚
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

          {/* Form */}
          <div className="bg-gradient-to-br from-white to-gray-50/50 py-8 px-8 rounded-3xl shadow-xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm font-medium">
                    {error}
                  </span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
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
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400 block w-full pl-12 pr-4 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
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
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400 block w-full pl-12 pr-12 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-2xl transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" disabled={isLoading}/>
                  <label htmlFor="remember-me" className="ml-3 block text-sm text-gray-700 font-medium">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                <div className="text-sm">
                  <Link to="/forgotpassword" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200">
                    Quên mật khẩu?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full flex justify-center items-center space-x-3 py-4 px-4 rounded-2xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50"
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

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 inline-flex items-center space-x-1 group">
                  <span>Đăng ký ngay</span>
                  <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f')] bg-cover bg-center opacity-10" />
        <div className="m-auto text-center relative z-10 max-w-lg">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-6 leading-tight">
            BookSwap <span className="text-blue-600">Community</span>
          </h1>
          <p className="text-gray-600 text-lg">
            Nơi những cuốn sách tìm thấy chủ nhân mới 💫
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
