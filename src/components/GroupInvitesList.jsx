import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/supabase';
import { messagingService } from '../services/pusher';
import notificationService from '../services/notificationService';
import GroupInviteNotice from './GroupInviteNotice';
import './GroupInvitesList.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function GroupInvitesList({ onInviteResponded }) {
  const { user } = useAuth();
  const [pendingInvites, setPendingInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchPendingInvites();

    // Subscribe to new group invites via Pusher
    const unsubscribe = messagingService.subscribeGroupInvites(user.id, (newInvite) => {
      console.log('New group invite received:', newInvite);
      notificationService.playNotificationSound();
      // Refresh invites list
      fetchPendingInvites();
    });

    return () => unsubscribe?.();
  }, [user.id]);

  const fetchPendingInvites = async () => {
    setIsLoading(true);
    try {
      const session = await authService.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
      };

      const response = await fetch(`${apiUrl}/api/messages/group-invites/pending`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setPendingInvites(data.data || []);
    } catch (error) {
      console.error('Error fetching pending invites:', error);
      setPendingInvites([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    setRespondingTo(inviteId);
    try {
      const session = await authService.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
      };

      const response = await fetch(`${apiUrl}/api/messages/group-invites/${inviteId}/respond`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action: 'accept' }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to accept invite');
      }

      setPendingInvites(pendingInvites.filter((i) => i.id !== inviteId));
      onInviteResponded?.();
    } catch (error) {
      console.error('Error accepting invite:', error);
      alert('Failed to accept invite: ' + error.message);
    } finally {
      setRespondingTo(null);
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    setRespondingTo(inviteId);
    try {
      const session = await authService.getSession();
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` }),
      };

      const response = await fetch(`${apiUrl}/api/messages/group-invites/${inviteId}/respond`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action: 'decline' }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || 'Failed to decline invite');
      }

      setPendingInvites(pendingInvites.filter((i) => i.id !== inviteId));
      onInviteResponded?.();
    } catch (error) {
      console.error('Error declining invite:', error);
      alert('Failed to decline invite: ' + error.message);
    } finally {
      setRespondingTo(null);
    }
  };

  if (!pendingInvites.length) {
    return null;
  }

  return (
    <div className="group-invites-list">
      <h3 className="invites-header">Pending Group Invites</h3>
      <div className="invites-container">
        {pendingInvites.map((invite) => (
          <GroupInviteNotice
            key={invite.id}
            cohort={invite.cohort}
            inviter={invite.inviter}
            inviteId={invite.id}
            onAccept={() => handleAcceptInvite(invite.id)}
            onDecline={() => handleDeclineInvite(invite.id)}
            isLoading={respondingTo === invite.id}
          />
        ))}
      </div>
    </div>
  );
}

export default GroupInvitesList;
