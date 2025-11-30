const MessageReactions = ({
  reactions,
  onReaction,
  onRemoveReaction,
  messageId,
  currentUserId,
}) => {
  if (!reactions || reactions.length === 0) return null;

  const grouped = reactions.reduce((acc, r) => {
    if (!r || !r.emoji) return acc; // Skip invalid reactions

    const existing = acc.find((e) => e.emoji === r.emoji);
    if (existing) {
      existing.count++;
      if (r.user) existing.users.push(r.user);
      if (r.id) existing.ids.push(r.id);
      if (r.user_id === currentUserId) existing.myReaction = true;
    } else {
      acc.push({
        emoji: r.emoji,
        count: 1,
        users: r.user ? [r.user] : [],
        ids: r.id ? [r.id] : [],
        myReaction: r.user_id === currentUserId,
      });
    }
    return acc;
  }, []);

  const handleClick = (emoji, myReaction, id) => {
    if (myReaction) onRemoveReaction(messageId, id);
    else onReaction(emoji);
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {grouped.map((r) => (
        <button
          key={r.emoji}
          onClick={() => handleClick(r.emoji, r.myReaction, r.ids[0])}
          className={`text-xs px-2 py-1 rounded-full border ${r.myReaction ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'} hover:scale-110 transition-transform`}
          title={
            r.users
              .filter((u) => u && u.name)
              .map((u) => u.name)
              .join(', ') || 'Reactions'
          }
        >
          {r.emoji} {r.count}
        </button>
      ))}
    </div>
  );
};

export default MessageReactions;
