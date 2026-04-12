import { Check, Trash2 } from 'lucide-react';
import './GroupInviteNotice.css';

function GroupInviteNotice({
  cohort,
  inviter,
  onAccept,
  onDecline,
  isLoading = false,
  inviteId,
}) {
  return (
    <div className="group-invite-notice">
      <div className="invite-header">
        <div className="invite-info">
          <div className="cohort-icon">
            <span>👥</span>
          </div>
          <div className="invite-details">
            <h3>{cohort?.name}</h3>
            {cohort?.description && (
              <p className="cohort-description">{cohort.description}</p>
            )}
            <div className="invite-meta">
              <img
                src={inviter?.avatar_url || '/default-avatar.png'}
                alt={inviter?.username}
                className="inviter-avatar"
              />
              <p className="inviter-text">
                <span className="inviter-name">{inviter?.username}</span> invited you to join
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="invite-actions">
        <button
          className="btn-accept"
          onClick={() => onAccept(inviteId)}
          disabled={isLoading}
        >
          <Check size={18} />
          <span>Accept</span>
        </button>
        <button
          className="btn-delete"
          onClick={() => onDecline(inviteId)}
          disabled={isLoading}
        >
          <Trash2 size={18} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

export default GroupInviteNotice;
