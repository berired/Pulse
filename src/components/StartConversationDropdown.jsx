import { useState, useRef, useEffect } from 'react';
import { useFriends } from '../hooks/useQueries';
import { MessageCircle, ChevronDown, User } from 'lucide-react';

function StartConversationDropdown({ currentUserId, onSelectContact }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { data: friends = [], isLoading: friendsLoading } = useFriends(currentUserId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFollower = (friend) => {
    onSelectContact(friend.id, friend.username);
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
            <p>Select a friend to message</p>
          </div>

          {friendsLoading ? (
            <div className="loading-friends">
              <p>Loading friends...</p>
            </div>
          ) : friends.length === 0 ? (
            <div className="empty-followers">
              <p>No friends yet. Follow other users and have them follow you back to become friends!</p>
            </div>
          ) : (
            <div className="followers-list">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  className="follower-item"
                  onClick={() => handleSelectFollower(friend)}
                >
                  <div className="follower-avatar">
                    {friend.avatar_url ? (
                      <img src={friend.avatar_url} alt={friend.username} />
                    ) : (
                      <div className="avatar-placeholder">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                  <span className="follower-username">{friend.username}</span>
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
