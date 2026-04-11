import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './RotationCreateModal.css';

function RotationCreateModal({ isOpen, onClose, onSubmit, editRotation = null, isLoading = false }) {
  const [formData, setFormData] = useState({
    hospital_name: '',
    hospital_location: '',
    ward: '',
    time_period: '',
    description: '',
    status: 'In Progress',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editRotation) {
      setFormData({
        hospital_name: editRotation.hospital_name || '',
        hospital_location: editRotation.hospital_location || '',
        ward: editRotation.ward || '',
        time_period: editRotation.time_period || '',
        description: editRotation.description || '',
        status: editRotation.status || 'In Progress',
      });
    } else {
      setFormData({
        hospital_name: '',
        hospital_location: '',
        ward: '',
        time_period: '',
        description: '',
        status: 'In Progress',
      });
    }
    setErrors({});
  }, [editRotation, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.hospital_name.trim()) {
      newErrors.hospital_name = 'Hospital name is required';
    }
    if (!formData.hospital_location.trim()) {
      newErrors.hospital_location = 'Hospital location is required';
    }
    if (!formData.ward.trim()) {
      newErrors.ward = 'Ward is required';
    }
    if (!formData.time_period.trim()) {
      newErrors.time_period = 'Time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content rotation-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editRotation ? 'Edit Clinical Rotation' : 'Add Clinical Rotation'}</h2>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="rotation-form">
          <div className="form-group">
            <label htmlFor="hospital_name">Hospital Name *</label>
            <input
              type="text"
              id="hospital_name"
              name="hospital_name"
              value={formData.hospital_name}
              onChange={handleInputChange}
              placeholder="Enter hospital name"
              disabled={isLoading}
              maxLength={255}
            />
            {errors.hospital_name && <p className="field-error">{errors.hospital_name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="hospital_location">Hospital Location *</label>
            <input
              type="text"
              id="hospital_location"
              name="hospital_location"
              value={formData.hospital_location}
              onChange={handleInputChange}
              placeholder="Enter hospital location/city"
              disabled={isLoading}
              maxLength={255}
            />
            {errors.hospital_location && <p className="field-error">{errors.hospital_location}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="ward">Ward *</label>
            <input
              type="text"
              id="ward"
              name="ward"
              value={formData.ward}
              onChange={handleInputChange}
              placeholder="e.g., ICU, Pediatrics, Emergency"
              disabled={isLoading}
              maxLength={255}
            />
            {errors.ward && <p className="field-error">{errors.ward}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="time_period">Time *</label>
            <input
              type="text"
              id="time_period"
              name="time_period"
              value={formData.time_period}
              onChange={handleInputChange}
              placeholder="e.g., 09:00 - 17:00 or Morning Shift"
              disabled={isLoading}
              maxLength={255}
            />
            {errors.time_period && <p className="field-error">{errors.time_period}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description of Task</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your tasks and responsibilities..."
              disabled={isLoading}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={isLoading}
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : editRotation ? 'Update Rotation' : 'Add Rotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RotationCreateModal;
