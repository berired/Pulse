import { useState } from 'react';
import { fetchWithAuth } from '../services/authHelper';
import './AdminModals.css';

export default function ReportDetailsModal({ report, onClose, onReportUpdated }) {
  const [status, setStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState(report.admin_notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

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
        <div className="modal-header">
          <div>
            <h2>{report.title}</h2>
            <p className="report-meta">
              Submitted {report.profiles?.username && `by ${report.profiles.username}`} on{' '}
              {new Date(report.created_at).toLocaleDateString()}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
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
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isUpdating}
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
