import React from 'react';
import PropTypes from 'prop-types';

function ContactsSection({ contacts, contactStatusFilter, onContactStatusFilterChange, onUpdateInquiryStatus }) {
  const filteredContacts = contacts.filter(contact =>
    contactStatusFilter === 'all' ? true : (contact.status || 'new') === contactStatusFilter
  );

  return (
    <div className="contacts-section">
      <h2>Contact Messages</h2>
      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Inquiry Status:</label>
        <select value={contactStatusFilter} onChange={onContactStatusFilterChange}>
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      {contacts.length === 0 ? (
        <p>No messages</p>
      ) : filteredContacts.length === 0 ? (
        <p>No messages for selected status.</p>
      ) : (
        <div className="messages-list">
          {filteredContacts.map(contact => (
            <div key={contact.id} className="card">
              <div><strong>{contact.name}</strong> • {contact.email} • {new Date(contact.createdAt).toLocaleString()}</div>
              {contact.propertyTitle && (
                <div style={{ marginTop: 6 }}>
                  <strong>Listing:</strong> {contact.propertyTitle}
                </div>
              )}
              <div style={{ marginTop: 8 }}><strong>{contact.subject}</strong></div>
              <div style={{ marginTop: 6 }}>{contact.message}</div>
              <div style={{ marginTop: 10 }}>
                <label style={{ marginRight: 8 }}>Status:</label>
                <select
                  value={contact.status || 'new'}
                  onChange={event => onUpdateInquiryStatus(contact.id, event.target.value)}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ContactsSection.propTypes = {
  contacts: PropTypes.array.isRequired,
  contactStatusFilter: PropTypes.string.isRequired,
  onContactStatusFilterChange: PropTypes.func.isRequired,
  onUpdateInquiryStatus: PropTypes.func.isRequired
};

export default ContactsSection;