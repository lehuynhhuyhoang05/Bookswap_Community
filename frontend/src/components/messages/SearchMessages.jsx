import { Search, X } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const SearchMessages = ({
  conversationId,
  onSearch,
  searchResults,
  loading,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) {
      return;
    }
    await onSearch({ q: searchQuery, conversation_id: conversationId });
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-10 p-4">
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tin nhắn..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <Button type="submit" disabled={searchQuery.trim().length < 2}>
            Tìm
          </Button>
        </form>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Search Results */}
      {loading && (
        <div className="mt-4 flex justify-center">
          <LoadingSpinner size="sm" />
        </div>
      )}

      {!loading && searchResults && searchResults.length > 0 && (
        <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
          <p className="text-sm text-gray-600 mb-2">
            Tìm thấy {searchResults.length} kết quả
          </p>
          {searchResults.map((msg) => (
            <div
              key={msg.message_id}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            >
              <p className="text-sm text-gray-900 line-clamp-2">
                {msg.content}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {msg.sender?.full_name} •{' '}
                {new Date(msg.sent_at).toLocaleString('vi-VN')}
              </p>
            </div>
          ))}
        </div>
      )}

      {!loading &&
        searchResults &&
        searchResults.length === 0 &&
        searchQuery && (
          <div className="mt-4 text-center text-gray-500 text-sm">
            Không tìm thấy kết quả nào
          </div>
        )}
    </div>
  );
};

export default SearchMessages;
