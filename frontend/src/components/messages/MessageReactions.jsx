import React from 'react';

const MessageReactions = ({ reactions, onReaction, onRemoveReaction, messageId, currentUserId }) => {
  const grouped = reactions.reduce((acc, r) => {
    const existing = acc.find(e => e.emoji === r.emoji);
    if (existing) {
      existing.count++;
      existing.users.push(r.user);
      existing.ids.push(r.id);
      if (r.member_id === currentUserId || r.user_id === currentUserId) {
        existing.myReaction = true;
        existing.myReactionId = r.reaction_id || r.id;
      }
    } else {
      acc.push({ 
        emoji: r.emoji, 
        count: 1, 
        users: [r.user], 
        ids: [r.reaction_id || r.id],
        myReaction: r.member_id === currentUserId || r.user_id === currentUserId,
        myReactionId: r.reaction_id || r.id
      });
    }
    return acc;
  }, []);

  const handleClick = (emoji, myReaction, reactionId) => {
    if (myReaction) {
      onRemoveReaction(messageId, reactionId);
    } else {
      onReaction(messageId, emoji);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {grouped.map((r, idx) => (
        <button
          key={`${r.emoji}-${idx}`}
          onClick={() => handleClick(r.emoji, r.myReaction, r.myReactionId)}
          className={`text-xs px-2 py-1 rounded-full border transition-all hover:scale-110 ${
            r.myReaction 
              ? 'bg-blue-100 border-blue-400 shadow-sm' 
              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
          }`}
          title={r.users.map(u => u?.full_name || u?.name || 'Unknown').join(', ')}
        >
          <span className="mr-1">{r.emoji}</span>
          <span className="font-medium">{r.count}</span>
        </button>
      ))}
    </div>
  );
};

export default MessageReactions;
