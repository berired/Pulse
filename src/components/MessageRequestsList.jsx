import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/supabase';
import { messagingService } from '../services/pusher';
import notificationService from '../services/notificationService';
import MessageRequestNotice from './MessageRequestNotice';
import './MessageRequestsList.css';  

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function MessageRequestsList({ onSelectContact, onRequestResponded }) {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
    
    // Subscribe to new message requests via Pusher
    const unsubscribe = messagingService.subscribeMessageRequests(user.id, (newRequest) => {
      console.log('New message request received:', newRequest);
      notificationService.playNotificationSound();
      // Add new request to list or refresh
      fetchPendingRequests();
    });

    return () => unsubscribe?.();
  }, [user.id]);

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    try {
      const session = await authService.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
      };

      const response = await fetch(`${apiUrl}/api/messages/requests/pending`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setPendingRequests(data.data || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setPendingRequests([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId, senderId, senderName) => {
    setRespondingTo(requestId);
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

      setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));
      // Navigate to the conversation
      onSelectContact(senderId, senderName);
      onRequestResponded?.();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request: ' + error.message);
    } finally {
      setRespondingTo(null);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setRespondingTo(requestId);
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

      setPendingRequests(pendingRequests.filter((r) => r.id !== requestId));
      onRequestResponded?.();
    } catch (error) {
      console.error('Error declining request:', error);
      alert('Failed to decline request: ' + error.message);
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
