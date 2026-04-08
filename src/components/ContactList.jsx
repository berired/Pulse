import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { User, MessageSquare } from 'lucide-react';
import './ContactList.css';

function ContactList({ onSelectContact, selectedContactId, currentUserId }) {
  // Get conversations (direct messages with unique users)
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', currentUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('direct_messages')
        .select(
          `
          id,
          sender_id,
          receiver_id,
          body,
          created_at,
          sender:sender_id(id, username, avatar_url),
          receiver:receiver_id(id, username, avatar_url)
        `
        )
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner and get latest message
      const conversationMap = new Map();

      data?.forEach((msg) => {
        const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        const partner = msg.sender_id === currentUserId ? msg.receiver : msg.sender;

        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            partnerId,
            partner,
            lastMessage: msg.body,
            lastMessageTime: msg.created_at,
          });
        }
      });

      return Array.from(conversationMap.values()).sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
    },
  });

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now - messageTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return messageTime.toLocaleDateString();
  };

  return (
    <div className="contact-list">
      <div className="contact-list-header">
        <MessageSquare size={20} />
        <h3>Messages</h3>
      </div>

      <div className="contacts-container">
        {conversations.length === 0 ? (
          <div className="empty-contacts">
            <MessageSquare size={48} />
            <p>No conversations yet</p>
            <p className="empty-hint">Start a conversation to begin messaging</p>
          </div>
        ) : (
          <div className="contacts">
            {conversations.map((conv) => (
              <button
                key={conv.partnerId}
                className={`contact-item ${
                  selectedContactId === conv.partnerId ? 'active' : ''
                }`}
                onClick={() => onSelectContact(conv.partnerId, conv.partner.username)}
              >
                <div className="contact-avatar">
                  {conv.partner.avatar_url ? (
                    <img src={conv.partner.avatar_url} alt={conv.partner.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      <User size={20} />
                    </div>
                  )}
                  <div className="online-indicator"></div>
                </div>

                <div className="contact-info">
                  <p className="contact-name">{conv.partner.username}</p>
                  <p className="contact-last-message">{conv.lastMessage}</p>
                </div>

                <div className="contact-time">
                  {formatTimeAgo(conv.lastMessageTime)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactList;
