import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MessageRequestNotice from './MessageRequestNotice';
import './MessageRequestsList.css';

function MessageRequestsList({ onSelectContact, onRequestResponded }) {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/messages/requests/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId, senderId, senderName) => {
    setRespondingTo(requestId);
    try {
      const response = await fetch(`/api/messages/requests/${requestId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (!response.ok) throw new Error('Failed to accept request');

      setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));
      // Navigate to the conversation
      onSelectContact(senderId, senderName);
      onRequestResponded?.();
    } catch (error) {
      console.error('Error accepting request:', error);
    } finally {
      setRespondingTo(null);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setRespondingTo(requestId);
    try {
      const response = await fetch(`/api/messages/requests/${requestId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      });

      if (!response.ok) throw new Error('Failed to decline request');

      setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));
      onRequestResponded?.();
    } catch (error) {
      console.error('Error declining request:', error);
    } finally {
      setRespondingTo(null);
    }
  };

  if (!pendingRequests.length) {
    return null;
  }

  return (
    <div className="message-requests-list">
      <h3 className="requests-header">Pending Message Requests</h3>
      <div className="requests-container">
        {pendingRequests.map((request) => (
          <MessageRequestNotice
            key={request.id}
            sender={request.sender}
            requestId={request.id}
            onAccept={() =>
              handleAcceptRequest(request.id, request.sender_id, request.sender.username)
            }
            onDecline={() => handleDeclineRequest(request.id)}
            isLoading={respondingTo === request.id}
          />
        ))}
      </div>
    </div>
  );
}

export default MessageRequestsList;
