import { useEffect, useRef, useState } from 'react';
import MessageReactions from './MessageReactions';

const MessageItem = ({
  message,
  isOwn,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  currentUserId,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const pickerRef = useRef(null);
  const deleteRef = useRef(null);

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const handleEmojiClick = (emoji) => {
    onAddReaction(message.message_id, emoji);
    setShowEmojiPicker(false);
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa tin nhắn này?')) {
      console.log('🗑️ Deleting message:', message.message_id);
      onDelete(message.message_id);
      setShowDeletePopup(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
      if (deleteRef.current && !deleteRef.current.contains(e.target)) {
        setShowDeletePopup(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className={`flex gap-3 group ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-sm font-medium text-gray-600 mb-1">
            {message.sender?.full_name}
          </span>
        )}

        <div className="relative max-w-xs lg:max-w-md">
          {/* Tin nhắn bubble */}
          <div
            className={`relative rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            } transition-all duration-200 hover:shadow-md`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Thời gian và nút emoji */}
            <div className="flex items-center justify-between mt-1 min-h-[20px]">
              <span
                className={`text-xs ${
                  isOwn ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {formatTime(message.sent_at || message.created_at)}
              </span>

              {/* Nút emoji nhỏ gọn */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
                title="Thả cảm xúc"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
              </button>
            </div>

            {/* Dấu 3 chấm - bên ngoài bubble */}
            {isOwn && (
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => setShowDeletePopup(!showDeletePopup)}
                  className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
                  title="Tùy chọn"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Emoji Picker - VỊ TRÍ ĐÚNG THEO YÊU CẦU */}
          {showEmojiPicker && (
            <div
              ref={pickerRef}
              className={`absolute top-1/2 -translate-y-1/2 ${
                isOwn ? '-left-32' : '-right-32'
              } z-50`}
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-3 py-2 flex gap-2">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-xl hover:scale-125 transition-transform duration-150 w-7 h-7 flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              
              {/* Mũi tên chỉ vào tin nhắn */}
              <div className={`absolute top-1/2 -translate-y-1/2 ${
                isOwn ? '-right-1' : '-left-1'
              } w-2 h-2 bg-white border-r border-t border-gray-200 transform ${
                isOwn ? 'rotate-45' : '-rotate-45'
              }`}></div>
            </div>
          )}

          {/* Popup xóa tin nhắn - HIỂN THỊ BÊN TRÁI */}
          {showDeletePopup && (
            <div
              ref={deleteRef}
              className="absolute top-1/2 -translate-y-1/2 -left-32 z-50"
            >
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 py-2 px-1 min-w-[140px]">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Xóa tin nhắn
                </button>
              </div>

              {/* Mũi tên chỉ vào nút bên phải */}
              <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-white border-r border-t border-gray-200 transform rotate-45"></div>
            </div>
          )}
        </div>

        {/* Reaction list */}
        {message.reactions?.length > 0 && (
          <div className={`mt-1 ${isOwn ? 'mr-2' : 'ml-2'}`}>
            <MessageReactions
              reactions={message.reactions}
              onReaction={onAddReaction}
              onRemoveReaction={onRemoveReaction}
              messageId={message.message_id}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;