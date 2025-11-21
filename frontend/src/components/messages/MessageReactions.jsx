import React from 'react';

const MessageReactions = ({ reactions, onReaction, onRemoveReaction, messageId, currentUserId }) => {
  const grouped = reactions.reduce((acc, r) => {
    const existing = acc.find(e => e.emoji === r.emoji);
    if (existing) {
      existing.count++;
      existing.users.push(r.user);
      existing.ids.push(r.id);
    } else {
      acc.push({ emoji: r.emoji, count: 1, users: [r.user], ids: [r.id], myReaction: r.user_id === currentUserId });
    }
    return acc;
  }, []);

  const handleClick = (emoji, myReaction, id) => {
    if (myReaction) onRemoveReaction(messageId, id);
    else onReaction(emoji);
  };

  return (
    <div className="flex flex-wrap gap-1">
      {grouped.map(r => (
        <button
          key={r.emoji}
          onClick={() => handleClick(r.emoji, r.myReaction, r.ids[0])}
          className={`text-xs px-2 py-1 rounded-full border ${r.myReaction ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'}`}
          title={r.users.map(u => u.name).join(', ')}
        >
          {r.emoji} {r.count}
        </button>
      ))}
    </div>
  );
};

export default MessageReactions;
