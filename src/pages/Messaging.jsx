import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ContactList from '../components/ContactList';
import DirectMessageThread from '../components/DirectMessageThread';
import './Messaging.css';

function Messaging() {
  const { user } = useAuth();
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedContactName, setSelectedContactName] = useState(null);

  const handleSelectContact = (contactId, contactName) => {
    setSelectedContactId(contactId);
    setSelectedContactName(contactName);
  };

  const handleBack = () => {
    setSelectedContactId(null);
    setSelectedContactName(null);
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
            <ContactList
              onSelectContact={handleSelectContact}
              selectedContactId={selectedContactId}
              currentUserId={user.id}
            />

            <div className="empty-thread">
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Messaging;
