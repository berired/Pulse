import { useState, useEffect } from 'react';
import { X, Search, User } from 'lucide-react';
import { useFriends } from '../hooks/useQueries';
import './CreateGroupChatModal.css';

function CreateGroupChatModal({ isOpen, onClose, currentUserId, onCreateGroup }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');

  // Get friends list
  const { data: friendsList = [], isLoading: friendsLoading } = useFriends(currentUserId);

  // Filter friends based on search query
  const filteredFriends = friendsList.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = (user) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSearchQuery('');
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (selectedUsers.length === 0) {
      alert('Please add at least one user to the group');
      return;
    }

    onCreateGroup({
      groupName: groupName.trim(),
      members: selectedUsers,
    });

    // Reset form
    setGroupName('');
    setSelectedUsers([]);
    setSearchQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content group-chat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Group Chat</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Group Name Input */}
          <div className="form-group">
            <label htmlFor="groupName">Group Name</label>
            <input
              id="groupName"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Study Group 2024"
              className="form-input"
            />
          </div>

          {/* Friends List */}
          <div className="form-group">
            <label htmlFor="search">Add Friends</label>
            <div className="group-chat-search-wrapper">
              <Search size={18} className="group-chat-search-icon" />
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends by username..."
                className="group-chat-search-input"
              />
            </div>

            {/* Friends List Display */}
            {friendsLoading ? (
              <div className="group-chat-loading">
                <p>Loading friends...</p>
              </div>
            ) : friendsList.length === 0 ? (
              <div className="group-chat-no-results">
                <p>You don't have any friends yet. Follow users and have them follow you back to become friends!</p>
              </div>
            ) : filteredFriends.length > 0 ? (
              <div className="group-chat-search-results">
                {filteredFriends.map((user) => (
                  <button
                    key={user.id}
                    className="group-chat-result-item"
                    onClick={() => handleAddUser(user)}
                    type="button"
                    disabled={selectedUsers.find((u) => u.id === user.id)}
                  >
                    <div className="group-chat-user-avatar">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} />
                      ) : (
                        <div className="group-chat-avatar-placeholder">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                    <span>{user.username}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="group-chat-no-results">
                <p>No friends match your search</p>
              </div>
            )}
          </div>

          {/* Added Members List */}
          {selectedUsers.length > 0 && (
            <div className="added-members">
              <p className="members-label">
                Added Members ({selectedUsers.length})
              </p>
              <div className="members-list">
                {selectedUsers.map((user) => (
                  <div key={user.id} className="member-chip">
                    <div className="member-avatar">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt={user.username} />
                      ) : (
                        <div className="avatar-placeholder">
                          <User size={12} />
                        </div>
                      )}
                    </div>
                    <span className="member-username">{user.username}</span>
                    <button
                      className="group-chat-remove-btn"
                      onClick={() => handleRemoveUser(user.id)}
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-create"
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length === 0}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupChatModal;
