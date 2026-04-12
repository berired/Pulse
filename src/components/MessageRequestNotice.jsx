import { Check, X, Trash2 } from 'lucide-react';
import './MessageRequestNotice.css';

function MessageRequestNotice({
  sender,
  onAccept,
  onDecline,
  isLoading = false,
  requestId,
}) {
  return (
    <div className="message-request-notice">
      <div className="request-header">
        <div className="sender-info">
          <img
            src={sender?.avatar_url || '/default-avatar.png'}
            alt={sender?.username}
            className="sender-avatar"
          />
          <div className="sender-details">
            <h3>{sender?.username}</h3>
            {sender?.bio && <p className="sender-bio">{sender.bio}</p>}
            <p className="request-message">Wants to send you a message</p>
          </div>
        </div>
      </div>

      <div className="request-actions">
        <button
          className="btn-accept"
          onClick={() => onAccept(requestId)}
          disabled={isLoading}
        >
          <Check size={18} />
          <span>Accept</span>
        </button>
        <button
          className="btn-delete"
          onClick={() => onDecline(requestId)}
          disabled={isLoading}
        >
          <Trash2 size={18} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

export default MessageRequestNotice;
