import { useState, useRef, useEffect } from 'react';
import { useFollowers } from '../hooks/useQueries';
import { MessageCircle, ChevronDown, User } from 'lucide-react';

function StartConversationDropdown({ currentUserId, onSelectContact }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { data: followers = [] } = useFollowers(currentUserId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFollower = (follower) => {
    onSelectContact(follower.id, follower.username);
    setIsOpen(false);
  };

  return (
    <div className="start-conversation-dropdown" ref={dropdownRef}>
      <button
        className="start-conversation-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageCircle size={18} />
        <span>Start Conversation</span>
        <ChevronDown size={18} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <p>Select a follower to message</p>
          </div>

          {followers.length === 0 ? (
            <div className="empty-followers">
              <p>No followers yet</p>
            </div>
          ) : (
            <div className="followers-list">
              {followers.map((follower) => (
                <button
                  key={follower.id}
                  className="follower-item"
                  onClick={() => handleSelectFollower(follower)}
                >
                  <div className="follower-avatar">
                    {follower.avatar_url ? (
                      <img src={follower.avatar_url} alt={follower.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                  <span className="follower-username">{follower.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default StartConversationDropdown;
