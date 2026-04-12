import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useDirectMessages, useSendDirectMessage } from '../hooks/useQueries';
import { messagingService } from '../services/pusher';
import { authService } from '../services/supabase';
import notificationService from '../services/notificationService';
import { Send } from 'lucide-react';
import MessageRequestNotice from './MessageRequestNotice';
import './DirectMessageThread.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function DirectMessageThread({ recipientId, recipientName, onBack, senderProfile = null, isMessageRequest = false }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [requestStatus, setRequestStatus] = useState(isMessageRequest ? 'pending' : 'accepted');
  const [isRespondingToRequest, setIsRespondingToRequest] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { data: messages = [] } = useDirectMessages(user.id, recipientId);
  const sendMessage = useSendDirectMessage();

  // Subscribe to real-time messages and invalidate query on new message
  useEffect(() => {
    const unsubscribe = messagingService.subscribeDirectMessages(
      user.id,
      recipientId,
      (data) => {
        console.log('[DirectMessageThread] Pusher event received:', data);
        
        if (data.type === 'typing') {
          console.log('[DirectMessageThread] Typing indicator:', data.username);
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
        } else if (data.senderId && data.senderId !== user.id) {
          // Incoming message from other user
          console.log('[DirectMessageThread] New message from other user:', data.senderId);
          notificationService.playNotificationSound();
          // Invalidate messages query to trigger refetch
          console.log('[DirectMessageThread] Invalidating query for:', ['directMessages', user.id, recipientId]);
          queryClient.invalidateQueries({
            queryKey: ['directMessages', user.id, recipientId],
          });
        } else {
          console.log('[DirectMessageThread] Message event (ignoring own message or typing)', data);
        }
      }
    );

    return () => unsubscribe?.();
  }, [user.id, recipientId, queryClient]);

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

  const handleAcceptRequest = async (requestId) => {
    setIsRespondingToRequest(true);
    try {
      const session = await authService.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
      };

      const response = await fetch(`${apiUrl}/api/messages/requests/${requestId}/respond`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action: 'accept' }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to accept request');
      }
      
      setRequestStatus('accepted');
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request: ' + error.message);
    } finally {
      setIsRespondingToRequest(false);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setIsRespondingToRequest(true);
    try {
      const session = await authService.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
      };

      const response = await fetch(`${apiUrl}/api/messages/requests/${requestId}/respond`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action: 'decline' }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to decline request');
      }
      
      setRequestStatus('declined');
      setTimeout(onBack, 500);
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Failed to decline request: ' + error.message);
    } finally {
      setIsRespondingToRequest(false);
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
        {/* Show message request notice if pending */}
        {requestStatus === 'pending' && senderProfile && (
          <MessageRequestNotice
            sender={senderProfile}
            requestId={messages[0]?.id || 'default'}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
            isLoading={isRespondingToRequest}
          />
        )}

        {/* Show declined state */}
        {requestStatus === 'declined' && (
          <div className="request-declined-notice">
            <p>You declined this message request</p>
          </div>
        )}

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

      {/* Only show input form if request is accepted or not a request */}
      {requestStatus !== 'declined' && requestStatus !== 'pending' && (
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
      )}
    </div>
  );
}

export default DirectMessageThread;
