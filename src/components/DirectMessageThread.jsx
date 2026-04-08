import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDirectMessages, useSendDirectMessage } from '../hooks/useQueries';
import { messagingService } from '../services/pusher';
import { Send, LogOut } from 'lucide-react';
import './DirectMessageThread.css';

function DirectMessageThread({ recipientId, recipientName, onBack }) {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { data: messages = [] } = useDirectMessages(user.id, recipientId);
  const sendMessage = useSendDirectMessage();

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = messagingService.subscribeDirectMessages(
      user.id,
      recipientId,
      (data) => {
        if (data.type === 'typing') {
          setTypingUsers((prev) => {
            const filtered = prev.filter((u) => u.userId !== data.userId);
            return [...filtered, { userId: data.userId, username: data.username }];
          });

          // Clear typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) =>
              prev.filter((u) => u.userId !== data.userId)
            );
          }, 3000);
        }
      }
    );

    return () => unsubscribe?.();
  }, [user.id, recipientId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    // Emit typing indicator
    if (!isTyping) {
      setIsTyping(true);
      messagingService.emitTyping(
        messagingService.getDirectMessageChannelName(user.id, recipientId),
        user.id,
        user.email
      );
    }

    // Clear previous timeout and set new one
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim()) return;

    try {
      await sendMessage.mutateAsync({
        senderId: user.id,
        receiverId: recipientId,
        body: messageInput.trim(),
      });

      setMessageInput('');
      setIsTyping(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="direct-message-thread">
      <div className="message-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>{recipientName}</h2>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <p>Start a conversation</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${
                  msg.sender_id === user.id ? 'own' : 'other'
                }`}
              >
                <div className="message-bubble">{msg.body}</div>
                <div className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="message other">
                <div className="message-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={messageInput}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="message-input"
        />
        <button type="submit" className="send-btn" disabled={sendMessage.isPending}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

export default DirectMessageThread;
