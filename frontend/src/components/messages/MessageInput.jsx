import { useEffect, useRef, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

const MessageInput = ({ onSendMessage, disabled = false, sending = false }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  // Auto-focus input when component mounts or sending completes
  useEffect(() => {
    if (!sending && inputRef.current) {
      inputRef.current.focus();
    }
  }, [sending]);

  // Global keyboard listener for auto-focus
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Auto-focus on any key press (except special keys)
      if (
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey &&
        e.key.length === 1 &&
        inputRef.current &&
        document.activeElement !== inputRef.current
      ) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (message.trim() && !disabled && !sending) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t bg-white p-4">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          ref={inputRef}
          type="text"
          placeholder={sending ? 'Đang gửi...' : 'Nhập tin nhắn...'}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!message.trim() || disabled || sending}
          variant="primary"
          className="min-w-[80px]"
        >
          {sending ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Gửi
            </span>
          ) : (
            'Gửi'
          )}
        </Button>
      </form>
    </div>
  );
};

export default MessageInput;
