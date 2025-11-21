import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BS</span>
              </div>
              <span className="ml-2 text-xl font-bold">BookSwap</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Nền tảng trao đổi sách hàng đầu Việt Nam
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/books" className="hover:text-white transition-colors">
                  Khám phá sách
                </Link>
              </li>
              <li>
                <Link to="/books/search" className="hover:text-white transition-colors">
                  Tìm kiếm
                </Link>
              </li>
              <li>
                <Link to="/exchange" className="hover:text-white transition-colors">
                  Trao đổi
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/help" className="hover:text-white transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Pháp lý</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition-colors">
                  Nguyên tắc cộng đồng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} BookSwap. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;