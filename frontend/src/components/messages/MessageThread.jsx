import { useEffect, useRef } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import MessageItem from './MessageItem';

const MessageThread = ({
  messages,
  loading,
  currentUserId,
  onDeleteMessage,
  onAddReaction,
  onRemoveReaction,
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousScrollHeight = useRef(0);
  const previousScrollTop = useRef(0);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef(null);

  // Filter out invalid messages
  const validMessages = messages.filter((msg) => msg && msg.message_id);

  const scrollToBottom = (smooth = false) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      if (smooth) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  // Track user scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      isUserScrolling.current = true;

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Reset after user stops scrolling
      scrollTimeout.current = setTimeout(() => {
        isUserScrolling.current = false;
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Check if user was at bottom before update
    const wasNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    // Use requestAnimationFrame for smooth update
    requestAnimationFrame(() => {
      if (wasNearBottom && !isUserScrolling.current) {
        // User was at bottom and not actively scrolling - scroll to new bottom smoothly
        scrollToBottom(true);
      } else if (!isUserScrolling.current) {
        // User was reading old messages - maintain position without jump
        const scrollDiff =
          container.scrollHeight - previousScrollHeight.current;
        if (scrollDiff > 0 && scrollDiff < container.clientHeight) {
          // Small update - adjust position smoothly
          container.scrollTop = previousScrollTop.current + scrollDiff;
        }
      }

      // Update refs
      previousScrollHeight.current = container.scrollHeight;
      previousScrollTop.current = container.scrollTop;
    });
  }, [validMessages]);

  // Auto-scroll to bottom on mount
  useEffect(() => {
    scrollToBottom(false);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto p-4 bg-gray-50"
      style={{
        scrollBehavior: 'smooth',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        willChange: 'scroll-position',
        backfaceVisibility: 'hidden',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {validMessages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
        </div>
      ) : (
        <div className="space-y-4">
          {validMessages.map((message) => (
            <MessageItem
              key={message.message_id}
              message={message}
              isOwn={message.is_mine}
              onDelete={onDeleteMessage}
              onAddReaction={onAddReaction}
              onRemoveReaction={onRemoveReaction}
              currentUserId={currentUserId}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageThread;
