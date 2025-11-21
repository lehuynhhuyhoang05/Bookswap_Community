import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false); // ✅ Thêm state cho gửi lại
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { forgotPassword } = useAuth();

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Địa chỉ email không hợp lệ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hàm gửi lại email
  const handleResendEmail = async () => {
    setResendLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      // Có thể thêm thông báo thành công nếu muốn
    } catch (err) {
      setError(err.message || 'Gửi lại thất bại. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
    }
  };

  // Hiển thị thông báo thành công
  if (isSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="flex justify-center">
              <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">BS</span>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Đã gửi email đặt lại mật khẩu
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div className="mt-6 space-y-4">
                <p className="text-gray-600">
                  Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến:
                </p>
                <p className="font-medium text-blue-600 text-lg">{email}</p>
                <p className="text-sm text-gray-500">
                  Vui lòng kiểm tra hộp thư và làm theo hướng dẫn trong email.
                </p>
                <p className="text-xs text-gray-400">
                  💡 <strong>Lưu ý:</strong> Kiểm tra cả thư mục spam nếu bạn
                  không thấy email.
                </p>
              </div>

              {/* ✅ Hiển thị lỗi nếu có khi gửi lại */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="mt-8 space-y-3">
                <Link
                  to="/auth/login"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Quay lại đăng nhập
                </Link>

                {/* ✅ Nút gửi lại email - tự động gọi API */}
                <button
                  onClick={handleResendEmail}
                  disabled={resendLoading}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Đang gửi lại...
                    </div>
                  ) : (
                    'Gửi lại email'
                  )}
                </button>

                {/* ✅ Nút để nhập email khác (nếu cần) */}
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setError('');
                  }}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Nhập email khác
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Hiển thị form nhập email (giữ nguyên)
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">BS</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang gửi...
                    </div>
                  ) : (
                    'Gửi liên kết đặt lại mật khẩu'
                  )}
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/auth/login"
                  className="font-medium text-blue-600 hover:text-blue-500 text-sm"
                >
                  ← Quay lại đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;