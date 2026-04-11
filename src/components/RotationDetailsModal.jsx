import { X, Trash2, Edit } from 'lucide-react';
import './RotationDetailsModal.css';

function RotationDetailsModal({ rotation, isOpen, onClose, onEdit, onDelete, isLoading = false }) {
  if (!isOpen || !rotation) return null;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this clinical rotation?')) {
      onDelete?.(rotation);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content rotation-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{rotation.hospital_name}</h2>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            <X size={24} />
          </button>
        </div>

        <div className="rotation-details">
          <div className="detail-item">
            <label>Hospital Location</label>
            <p>{rotation.hospital_location}</p>
          </div>

          <div className="detail-item">
            <label>Ward</label>
            <p>{rotation.ward}</p>
          </div>

          <div className="detail-item">
            <label>Time</label>
            <p>{rotation.time_period || 'Not specified'}</p>
          </div>

          {rotation.description && (
            <div className="detail-item">
              <label>Description of Task</label>
              <p className="description-text">{rotation.description}</p>
            </div>
          )}

          <div className="detail-item">
            <label>Status</label>
            <p className={`status-badge status-${rotation.status?.toLowerCase()}`}>
              {rotation.status}
            </p>
          </div>
        </div>

        <div className="modal-actions">
          {onEdit && (
            <button className="btn-edit" onClick={() => onEdit(rotation)} disabled={isLoading}>
              <Edit size={18} />
              Edit
            </button>
          )}
          {onDelete && (
            <button className="btn-delete" onClick={handleDelete} disabled={isLoading}>
              <Trash2 size={18} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RotationDetailsModal;
