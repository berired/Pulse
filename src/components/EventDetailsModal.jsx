import { X, Trash2 } from 'lucide-react';
import './EventDetailsModal.css';

function EventDetailsModal({ event, onClose, onEdit, onDelete }) {
  if (!event) return null;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete?.(event);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{event.title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="event-details">
          {event.date && (
            <div className="detail-item">
              <label>Date</label>
              <p>{event.date}</p>
            </div>
          )}

          {!event.isAllDay && event.time && (
            <div className="detail-item">
              <label>Time</label>
              <p>{event.time}</p>
            </div>
          )}

          {event.isAllDay && (
            <div className="detail-item">
              <label>Duration</label>
              <p>All Day Event</p>
            </div>
          )}

          {event.location && (
            <div className="detail-item">
              <label>Location</label>
              <p>{event.location}</p>
            </div>
          )}

          {event.description && (
            <div className="detail-item">
              <label>Description</label>
              <p>{event.description}</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          {onEdit && (
            <button className="btn-edit" onClick={() => onEdit(event)}>
              Edit Event
            </button>
          )}
          {onDelete && (
            <button className="btn-delete" onClick={handleDelete}>
              <Trash2 size={18} />
              Delete Event
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetailsModal;
