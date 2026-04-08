import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { User, Users } from 'lucide-react';
import './ContactList.css';

function ContactList({ onSelectContact, selectedContactId, currentUserId }) {
  // Get all profiles except current user
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', currentUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUserId)
        .order('username', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="contact-list">
      <div className="contact-list-header">
        <h3>Direct Messages</h3>
      </div>

      <div className="contacts-container">
        {contacts.length === 0 ? (
          <div className="empty-contacts">
            <p>No contacts yet</p>
          </div>
        ) : (
          <div className="contacts">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                className={`contact-item ${
                  selectedContactId === contact.id ? 'active' : ''
                }`}
                onClick={() => onSelectContact(contact.id, contact.username)}
              >
                <div className="contact-avatar">
                  {contact.avatar_url ? (
                    <img src={contact.avatar_url} alt={contact.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      <User size={20} />
                    </div>
                  )}
                </div>

                <div className="contact-info">
                  <p className="contact-name">{contact.username}</p>
                  <p className="contact-status">Online</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContactList;
