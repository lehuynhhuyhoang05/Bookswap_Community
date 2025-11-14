import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Circle,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = "http://localhost:3000/auth/register";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const registerAPI = async (email, password, full_name) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      return data;
    } catch (err) {
      console.error("❌ API Error:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.full_name || !formData.confirm_password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Email không hợp lệ");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await registerAPI(
        formData.email,
        formData.password,
        formData.full_name
      );

      console.log("✅ Đăng ký thành công:", data);
      alert("🎉 Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      console.error("❌ Lỗi đăng ký:", err);
      if (err.message.includes("409")) {
        setError("Email đã tồn tại, vui lòng dùng email khác.");
      } else if (err.message.includes("401")) {
        setError("Không có quyền truy cập API đăng ký.");
      } else if (err.message.includes("500")) {
        setError("Lỗi máy chủ. Vui lòng thử lại sau.");
      } else {
        setError(err.message || "Đăng ký thất bại, vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Điều kiện mật khẩu
  const passwordConditions = [
    { id: 1, label: "Tối thiểu 8 ký tự", valid: formData.password.length >= 8 },
    { id: 2, label: "Bao gồm chữ, số và ký tự đặc biệt", valid: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(formData.password) },
    { id: 3, label: "Tối thiểu 3 ký tự khác nhau", valid: new Set(formData.password).size >= 3 },
  ];
  const strength = passwordConditions.filter(c => c.valid).length;
  const progressWidth = `${(strength / 3) * 100}%`;
  const progressColor =
    strength === 1 ? "bg-red-400" :
    strength === 2 ? "bg-yellow-400" :
    strength === 3 ? "bg-green-500" :
    "bg-gray-200";

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tạo tài khoản mới ✨
            </h2>
            <p className="text-lg text-gray-600">
              Gia nhập cộng đồng đọc sách BookSwap 📚
            </p>
          </div>

          {/* Form */}
          <div className="bg-gradient-to-br from-white to-gray-50/50 py-8 px-8 rounded-3xl shadow-xl border border-gray-100">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400 block w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email <span className="text-red-500">*</span>
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
                    className="bg-white border border-gray-300 text-gray-900 placeholder-gray-400 block w-full pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 relative">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Mật khẩu <span className="text-red-500">*</span>
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
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    disabled={isLoading}
                    className="bg-white border border-gray-300 text-gray-900 block w-full pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-2xl"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>

                {/* 🔹 Password Strength / Popup */}
                {isPasswordFocused && formData.password && (
                  <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm space-y-1">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full transition-all ${progressColor}`} style={{ width: progressWidth }} />
                    </div>
                    <ul className="mt-1 space-y-1">
                      {passwordConditions.map((c) => (
                        <li key={c.id} className={`flex items-center gap-2 ${c.valid ? "text-green-600" : "text-gray-400"}`}>
                          {c.valid ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          {c.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirm_password" className="block text-sm font-semibold text-gray-700">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="bg-white border border-gray-300 text-gray-900 block w-full pl-12 pr-12 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-2xl"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full flex justify-center items-center space-x-3 py-4 px-4 rounded-2xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Đang đăng ký...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500 inline-flex items-center space-x-1"
                >
                  <span>Đăng nhập</span>
                  <Sparkles className="h-4 w-4" />
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
            Tạo tài khoản để bắt đầu hành trình trao đổi sách 💫
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
