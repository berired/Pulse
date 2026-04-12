import { useState } from 'react';
import { fetchWithAuth } from '../services/authHelper';
import './AdminModals.css';

export default function ReportDetailsModal({ report, onClose, onReportUpdated }) {
  const [status, setStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState(report.admin_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateStatus = async () => {
    try {
      setIsUpdating(true);
      const response = await fetchWithAuth(`/api/reports/${report.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          adminNotes,
        }),
      });

      if (response.ok) {
        alert('Report status updated successfully');
        onReportUpdated();
        onClose();
      } else {
        alert('Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Error updating report');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetchWithAuth(`/api/reports/${report.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Report deleted successfully');
        onReportUpdated();
        onClose();
      } else {
        alert('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (st) => {
    const colors = {
      not_yet_reviewed: '#ef4444',
      reviewing: '#f59e0b',
      done: '#10b981',
    };
    return colors[st] || '#94a3b8';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-body">
          <div className="reporter-details-header">
            <div className="reporter-details-avatar">
              {report.profiles?.avatar_url ? (
                <img src={report.profiles.avatar_url} alt={report.profiles.username} />
              ) : (
                <span>{report.profiles?.username?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="reporter-details-info">
              <h3>{report.profiles?.username || 'Unknown User'}</h3>
              <p>Reported on {new Date(report.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="report-grid">
            <div className="report-section">
              <h3>Report Details</h3>
              <div className="detail-row">
                <span className="label">Date:</span>
                <span className="value">{new Date(report.date).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Current Status:</span>
                <span
                  className="value status-badge"
                  style={{ backgroundColor: getStatusColor(report.status) }}
                >
                  {report.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Submitted:</span>
                <span className="value">{new Date(report.created_at).toLocaleString()}</span>
              </div>
            </div>

            {report.image_url && (
              <div className="report-section">
                <h3>Proof Image</h3>
                <img
                  src={report.image_url}
                  alt="Report proof"
                  className="report-image"
                />
              </div>
            )}
          </div>

          <div className="report-section">
            <h3>Description</h3>
            <div className="description-box">
              {report.description}
            </div>
          </div>

          <div className="report-section">
            <h3>Update Status</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateStatus();
              }}
              className="status-form"
            >
              <div className="form-group">
                <label>New Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isUpdating}
                >
                  <option value="not_yet_reviewed">Not Yet Reviewed</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group">
                <label>Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this report..."
                  rows="4"
                  disabled={isUpdating}
                />
              </div>

              <div className="button-group">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  disabled={isUpdating || isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteReport}
                  className="btn btn-danger"
                  disabled={isUpdating || isDeleting}
                >
                  {isDeleting ? 'Deleting...' : '🗑️ Delete Report'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating || isDeleting}
                >
                  {isUpdating ? 'Updating...' : 'Update Report'}
                </button>
              </div>
            </form>
          </div>

          {report.admin_notes && (
            <div className="report-section">
              <h3>Previous Notes</h3>
              <div className="notes-box">
                {report.admin_notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
