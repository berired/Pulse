import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import GroupInviteNotice from './GroupInviteNotice';
import './GroupInvitesList.css';

function GroupInvitesList({ onInviteResponded }) {
  const { user } = useAuth();
  const [pendingInvites, setPendingInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);

  useEffect(() => {
    fetchPendingInvites();
  }, []);

  const fetchPendingInvites = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/messages/group-invites/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingInvites(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending invites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    setRespondingTo(inviteId);
    try {
      const response = await fetch(`/api/messages/group-invites/${inviteId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (!response.ok) throw new Error('Failed to accept invite');

      setPendingInvites(pendingInvites.filter((i) => i.id !== inviteId));
      onInviteResponded?.();
    } catch (error) {
      console.error('Error accepting invite:', error);
    } finally {
      setRespondingTo(null);
    }
  };

  const handleDeclineInvite = async (inviteId) => {
    setRespondingTo(inviteId);
    try {
      const response = await fetch(`/api/messages/group-invites/${inviteId}/respond`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decline' }),
      });

      if (!response.ok) throw new Error('Failed to decline invite');

      setPendingInvites(pendingInvites.filter((i) => i.id !== inviteId));
      onInviteResponded?.();
    } catch (error) {
      console.error('Error declining invite:', error);
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
