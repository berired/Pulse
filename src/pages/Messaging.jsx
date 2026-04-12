import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ContactList from '../components/ContactList';
import DirectMessageThread from '../components/DirectMessageThread';
import StartConversationDropdown from '../components/StartConversationDropdown';
import CreateGroupChatModal from '../components/CreateGroupChatModal';
import MessageRequestsList from '../components/MessageRequestsList';
import GroupInvitesList from '../components/GroupInvitesList';
import { Users } from 'lucide-react';
import './Messaging.css';

function Messaging() {
  const { user } = useAuth();
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedContactName, setSelectedContactName] = useState(null);
  const [showGroupChatModal, setShowGroupChatModal] = useState(false);
  const [refreshRequests, setRefreshRequests] = useState(0);

  const handleSelectContact = (contactId, contactName) => {
    setSelectedContactId(contactId);
    setSelectedContactName(contactName);
  };

  const handleBack = () => {
    setSelectedContactId(null);
    setSelectedContactName(null);
  };

  const handleCreateGroupChat = (groupData) => {
    console.log('Creating group chat:', groupData);
    // TODO: Implement group chat creation in database
    setShowGroupChatModal(false);
  };

  const handleRequestsRefresh = () => {
    setRefreshRequests((prev) => prev + 1);
  };

  return (
    <div className="messaging-page">
      <header className="messaging-header">
        <h1>Messages</h1>
        <p>Real-time communication with peers and study groups</p>
      </header>

      <div className="messaging-container">
        {selectedContactId ? (
          /* Message Thread View */
          <DirectMessageThread
            recipientId={selectedContactId}
            recipientName={selectedContactName}
            onBack={handleBack}
          />
        ) : (
          /* Contact List View */
          <div className="messaging-split-view">
            <div className="contact-list-section">
              {/* Pending Requests Section */}
              <MessageRequestsList
                key={`requests-${refreshRequests}`}
                onSelectContact={handleSelectContact}
                onRequestResponded={handleRequestsRefresh}
              />

              {/* Pending Group Invites Section */}
              <GroupInvitesList
                key={`invites-${refreshRequests}`}
                onInviteResponded={handleRequestsRefresh}
              />

              {/* Action Buttons */}
              <div className="messaging-actions">
                <StartConversationDropdown
                  currentUserId={user.id}
                  onSelectContact={handleSelectContact}
                />
                <button
                  className="create-group-btn"
                  onClick={() => setShowGroupChatModal(true)}
                >
                  <Users size={18} />
                  <span>Create Group</span>
                </button>
              </div>

              {/* Conversations List */}
              <ContactList
                onSelectContact={handleSelectContact}
                selectedContactId={selectedContactId}
                currentUserId={user.id}
              />
            </div>

            <div className="empty-thread">
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Group Chat Modal */}
      <CreateGroupChatModal
        isOpen={showGroupChatModal}
        onClose={() => setShowGroupChatModal(false)}
        currentUserId={user.id}
        onCreateGroup={handleCreateGroupChat}
      />
    </div>
  );
}

export default Messaging;
