import { useState } from 'react';
import { fetchWithAuth } from '../services/authHelper';
import './ReportModal.css';

export default function ReportModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('description', formData.description);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Get auth token manually for FormData
      const token = await import('../services/authHelper').then(m => m.getAuthToken());
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          resetForm();
          onClose();
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error('Report submission error:', {
          status: response.status,
          error: errorData,
        });
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      description: '',
      image: null,
    });
    setSubmitStatus(null);
    if (document.getElementById('modalImageUpload')) {
      document.getElementById('modalImageUpload').value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Report an Issue</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="modal-title">Report Title *</label>
            <input
              type="text"
              id="modal-title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter the title of your report"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-date">Date *</label>
            <input
              type="date"
              id="modal-date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="modal-description">Description *</label>
            <textarea
              id="modal-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the issue in detail"
              rows="5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="modalImageUpload">Upload Image (for proof)</label>
            <input
              type="file"
              id="modalImageUpload"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {formData.image && (
              <p className="file-name">✓ {formData.image.name}</p>
            )}
          </div>

          {submitStatus === 'success' && (
            <div className="success-message">
              ✓ Report submitted successfully!
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="error-message">
              ✗ Failed to submit report. Please try again.
            </div>
          )}

          <div className="form-buttons">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
