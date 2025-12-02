import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Calendar, Clock, MessageSquare, AlertCircle, Navigation, Map } from 'lucide-react';
import { Button, Input, Textarea } from '../ui';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * MeetingScheduler Modal
 * Schedule meeting with date/time picker and location
 */
const MeetingScheduler = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  exchange,
  initialData = null,
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    meeting_location: '',
    meeting_time: '',
    meeting_notes: '',
    meeting_latitude: null,
    meeting_longitude: null
  });

  const [errors, setErrors] = useState({});
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const locationInputRef = useRef(null);
  const mapRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Fix Leaflet default marker icon issue
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        meeting_location: initialData.meeting_location || '',
        meeting_time: initialData.meeting_time 
          ? new Date(initialData.meeting_time).toISOString().slice(0, 16) 
          : '',
        meeting_notes: initialData.meeting_notes || '',
        meeting_latitude: initialData.meeting_latitude || null,
        meeting_longitude: initialData.meeting_longitude || null
      });
    }
  }, [initialData]);

  // Search location using Nominatim (OpenStreetMap)
  const searchLocation = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'vi'
          }
        }
      );
      const data = await response.json();
      setSearchResults(data);
      setShowSearchResults(data.length > 0);
    } catch (error) {
      console.error('Location search error:', error);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.meeting_location) {
        searchLocation(formData.meeting_location);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.meeting_location]);

  // Component to recenter map
  const RecenterMap = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
      if (lat && lng) {
        map.setView([lat, lng], 15);
      }
    }, [lat, lng, map]);
    return null;
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.meeting_location?.trim()) {
      newErrors.meeting_location = 'Vui lòng nhập địa điểm';
    }

    if (!formData.meeting_time) {
      newErrors.meeting_time = 'Vui lòng chọn thời gian';
    } else {
      const selectedTime = new Date(formData.meeting_time);
      const now = new Date();
      if (selectedTime < now) {
        newErrors.meeting_time = 'Thời gian phải trong tương lai';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleQuickTime = (hours) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    setFormData({
      ...formData,
      meeting_time: now.toISOString().slice(0, 16)
    });
  };

  const suggestedLocations = [
    { name: 'Highlands Coffee, District 1', lat: 10.776889, lng: 106.700806 },
    { name: 'The Coffee House, District 3', lat: 10.786531, lng: 106.694419 },
    { name: 'Fahasa Bookstore, Nguyen Hue', lat: 10.773831, lng: 106.701179 },
    { name: 'Central Library HCMC', lat: 10.776889, lng: 106.700806 }
  ];

  // Get current location using Geolocation API
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode using Nominatim
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`
          );
          const data = await response.json();
          setFormData({
            ...formData,
            meeting_location: data.display_name || `📍 Vị trí hiện tại (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
            meeting_latitude: latitude,
            meeting_longitude: longitude
          });
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          setFormData({
            ...formData,
            meeting_location: `📍 Vị trí hiện tại (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
            meeting_latitude: latitude,
            meeting_longitude: longitude
          });
        }
        
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập.');
        setGettingLocation(false);
      }
    );
  };

  // Simple location search/filter
  const handleLocationInput = (value) => {
    setFormData({ ...formData, meeting_location: value });
    
    if (value.length > 2) {
      const filtered = suggestedLocations.filter(loc => 
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setLocationSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectLocation = (location) => {
    setFormData({
      ...formData,
      meeting_location: location.name,
      meeting_latitude: location.lat,
      meeting_longitude: location.lng
    });
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Đặt lịch gặp mặt</h2>
              <p className="text-sm text-blue-100">
                {exchange?.member_b?.full_name || 'Thành viên khác'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Location */}
          <div className="mb-6 relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Địa điểm gặp mặt *
            </label>
            <div className="relative">
              <Input
                ref={locationInputRef}
                value={formData.meeting_location}
                onChange={(e) => setFormData({ ...formData, meeting_location: e.target.value })}
                placeholder="Nhập địa chỉ hoặc tên địa điểm..."
                className={errors.meeting_location ? 'border-red-500' : ''}
              />
              
              {/* Get Current Location Button */}
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={gettingLocation}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="Lấy vị trí hiện tại"
              >
                {gettingLocation ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Navigation className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.meeting_location && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.meeting_location}
              </p>
            )}

            {/* OpenStreetMap with Leaflet */}
            {formData.meeting_latitude && formData.meeting_longitude && (
              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    <span>Vị trí trên bản đồ</span>
                  </div>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${formData.meeting_latitude}&mlon=${formData.meeting_longitude}&zoom=15`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Mở OpenStreetMap ↗
                  </a>
                </div>
                <MapContainer 
                  center={[formData.meeting_latitude, formData.meeting_longitude]} 
                  zoom={15} 
                  style={{ height: '256px', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[formData.meeting_latitude, formData.meeting_longitude]}>
                    <Popup>
                      📍 Địa điểm gặp mặt
                    </Popup>
                  </Marker>
                  <RecenterMap lat={formData.meeting_latitude} lng={formData.meeting_longitude} />
                </MapContainer>
                <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500">
                  <span>📍 {formData.meeting_latitude.toFixed(6)}, {formData.meeting_longitude.toFixed(6)}</span>
                </div>
              </div>
            )}

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        meeting_location: result.display_name,
                        meeting_latitude: parseFloat(result.lat),
                        meeting_longitude: parseFloat(result.lon)
                      });
                      setShowSearchResults(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">{result.display_name}</div>
                    <div className="text-xs text-gray-500">
                      {result.type && `${result.type} • `}{result.lat}, {result.lon}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Suggested Locations */}
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">Gợi ý địa điểm phổ biến:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedLocations.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      meeting_location: loc.name,
                      meeting_latitude: loc.lat,
                      meeting_longitude: loc.lng
                    })}
                    className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    📍 {loc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Ngày & Giờ *
            </label>
            <Input
              type="datetime-local"
              value={formData.meeting_time}
              onChange={(e) => setFormData({ ...formData, meeting_time: e.target.value })}
              min={new Date().toISOString().slice(0, 16)}
              className={errors.meeting_time ? 'border-red-500' : ''}
            />
            {errors.meeting_time && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.meeting_time}
              </p>
            )}

            {/* Quick Time Suggestions */}
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">Lựa chọn nhanh:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickTime(24)}
                  className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 px-3 py-1.5 rounded-full transition-all"
                >
                  ⏰ Ngày mai
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTime(48)}
                  className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 px-3 py-1.5 rounded-full transition-all"
                >
                  📅 2 ngày nữa
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickTime(72)}
                  className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 px-3 py-1.5 rounded-full transition-all"
                >
                  🗓️ 3 ngày nữa
                </button>
              </div>
            </div>

            {/* Time Preview */}
            {formData.meeting_time && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold">
                    {new Date(formData.meeting_time).toLocaleString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Ghi chú (Tùy chọn)
            </label>
            <Textarea
              value={formData.meeting_notes}
              onChange={(e) => setFormData({ ...formData, meeting_notes: e.target.value })}
              placeholder="Ví dụ: Tôi sẽ mang túi đỏ, đến sớm 5 phút..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.meeting_notes.length}/500 ký tự
            </p>
          </div>

          {/* Tips */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              💡 Lưu ý quan trọng
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Chọn địa điểm công cộng, đông người</li>
              <li>• Nên gặp vào ban ngày để an toàn hơn</li>
              <li>• Cả hai phải xác nhận lịch hẹn mới có hiệu lực</li>
              <li>• Kiểm tra sách kỹ trước khi trao đổi</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5 mr-2" />
                  Đặt lịch hẹn
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingScheduler;
