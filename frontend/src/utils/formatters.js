/**
 * formatters.js
 * Các hàm định dạng dùng chung trong ứng dụng
 */

/**
 * formatDate
 * Chuyển đổi timestamp hoặc ngày sang định dạng dễ đọc
 * @param {string | number | Date} date 
 * @param {Object} options Intl.DateTimeFormat options
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const defaultOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return d.toLocaleDateString('vi-VN', { ...defaultOptions, ...options });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * formatTime
 * Chỉ hiện giờ:phút
 * @param {string | number | Date} date 
 * @returns {string}
 */
export const formatTime = (date) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

/**
 * formatDateTime
 * Hiển thị cả ngày giờ
 * @param {string | number | Date} date 
 * @returns {string}
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleString('vi-VN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

/**
 * formatRelativeTime
 * Định dạng thời gian tương đối (ví dụ: "2 giờ trước")
 * @param {string | number | Date} date 
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const now = new Date();
    const diffInMs = now - d;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) {
      return 'vừa xong';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} tuần trước`;
    } else if (diffInMonths < 12) {
      return `${diffInMonths} tháng trước`;
    } else {
      return `${diffInYears} năm trước`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return '';
  }
};

/**
 * formatRating
 * Hiển thị số rating cố định 1 chữ số thập phân
 * @param {number} rating 
 * @returns {string}
 */
export const formatRating = (rating) => {
  if (rating == null || rating === undefined) return '0.0';
  return Number.parseFloat(rating).toFixed(1);
};

/**
 * formatBookCondition
 * Định dạng điều kiện sách thành text tiếng Việt
 * @param {string} condition 
 * @returns {string}
 */
export const formatBookCondition = (condition) => {
  const conditions = {
    'new': 'Mới',
    'like_new': 'Như mới',
    'very_good': 'Rất tốt',
    'good': 'Tốt',
    'fair': 'Khá',
    'poor': 'Cũ'
  };
  return conditions[condition] || condition || 'Không xác định';
};

/**
 * formatExchangeStatus
 * Định dạng trạng thái trao đổi thành text tiếng Việt
 * @param {string} status 
 * @returns {string}
 */
export const formatExchangeStatus = (status) => {
  const statusMap = {
    'pending': 'Chờ xử lý',
    'accepted': 'Đã chấp nhận',
    'rejected': 'Đã từ chối',
    'completed': 'Đã hoàn thành',
    'cancelled': 'Đã hủy',
    'expired': 'Hết hạn'
  };
  return statusMap[status] || status || 'Không xác định';
};

/**
 * formatNumber
 * Định dạng số với dấu phân cách hàng nghìn
 * @param {number} number 
 * @returns {string}
 */
export const formatNumber = (number) => {
  if (number == null || number === undefined) return '0';
  return new Intl.NumberFormat('vi-VN').format(number);
};

/**
 * formatCurrency
 * Định dạng tiền tệ (nếu có tính năng mua bán)
 * @param {number} amount 
 * @param {string} currency 
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'VND') => {
  if (amount == null || amount === undefined) return '0 ₫';
  
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    // Fallback cho VND
    return `${formatNumber(amount)} ₫`;
  }
};

/**
 * truncateText
 * Cắt ngắn text và thêm dấu "..."
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * formatFileSize
 * Định dạng kích thước file (bytes -> KB, MB, GB)
 * @param {number} bytes 
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * formatPhoneNumber
 * Định dạng số điện thoại Việt Nam
 * @param {string} phone 
 * @returns {string}
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a Vietnam phone number
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  } else if (cleaned.length === 11 && cleaned.startsWith('84')) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{3})(\d{3})/, '+$1 $2 $3 $4');
  }
  
  return phone;
};

/**
 * formatAddress
 * Định dạng địa chỉ gọn gàng
 * @param {Object} address 
 * @returns {string}
 */
export const formatAddress = (address) => {
  if (!address || typeof address !== 'object') return '';
  
  const parts = [
    address.street,
    address.ward,
    address.district,
    address.city,
    address.country
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * capitalizeFirst
 * Viết hoa chữ cái đầu
 * @param {string} text 
 * @returns {string}
 */
export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * formatDuration
 * Định dạng thời lượng (phút -> giờ:phút)
 * @param {number} minutes 
 * @returns {string}
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0 phút';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} phút`;
  } else if (mins === 0) {
    return `${hours} giờ`;
  } else {
    return `${hours} giờ ${mins} phút`;
  }
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatRating,
  formatBookCondition,
  formatExchangeStatus,
  formatNumber,
  formatCurrency,
  truncateText,
  formatFileSize,
  formatPhoneNumber,
  formatAddress,
  capitalizeFirst,
  formatDuration
};