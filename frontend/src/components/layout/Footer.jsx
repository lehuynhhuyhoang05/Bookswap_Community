import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Mail, Facebook, Twitter, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold">BookSwap</span>
                <p className="text-blue-100 text-sm">Trao đổi sách thông minh</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md text-lg leading-relaxed">
              Kết nối cộng đồng yêu sách Việt Nam. Trao đổi sách cũ, chia sẻ tri thức, 
              và cùng nhau xây dựng văn hóa đọc bền vững.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Github, label: 'GitHub' },
                { icon: Mail, label: 'Email' }
              ].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="p-3 bg-white/10 rounded-2xl text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Liên kết nhanh</h3>
            <ul className="space-y-3">
              {[
                { to: '/books', label: 'Khám phá sách' },
                { to: '/how-it-works', label: 'Cách hoạt động' },
                { to: '/community', label: 'Cộng đồng' },
                { to: '/faq', label: 'Câu hỏi thường gặp' }
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Hỗ trợ</h3>
            <ul className="space-y-3">
              {[
                { to: '/contact', label: 'Liên hệ hỗ trợ' },
                { to: '/privacy', label: 'Chính sách bảo mật' },
                { to: '/terms', label: 'Điều khoản sử dụng' },
                { to: '/about', label: 'Về chúng tôi' }
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 block"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col lg:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm mb-4 lg:mb-0">
            © 2024 BookSwap Community. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center space-x-2 text-gray-300 text-sm">
            <span>Được tạo ra với</span>
            <Heart className="h-4 w-4 text-red-400" />
            <span>cho cộng đồng yêu sách</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;