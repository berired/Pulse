import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import './CarePlanCreateModal.css';

function CarePlanCreateModal({ isOpen, onClose, onSubmit, isLoading, editPlan }) {
  const isEditing = !!editPlan;
  
  const [formData, setFormData] = useState({
    patientName: editPlan?.patient_name || '',
    templateType: editPlan?.template_type || 'assessment-plan',
    content: editPlan?.content || '',
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleContentChange = (e) => {
    setFormData((prev) => ({ ...prev, content: e.target.value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(formData);
      setFormData({
        patientName: '',
        templateType: 'assessment-plan',
        content: '',
      });
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Care Plan' : 'Create New Care Plan'}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="patientName">Patient Name *</label>
            <input
              type="text"
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              placeholder="Enter patient name"
              required
            />
            {errors.patientName && <p className="field-error">{errors.patientName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="templateType">Template Type</label>
            <select
              id="templateType"
              name="templateType"
              value={formData.templateType}
              onChange={handleInputChange}
            >
              <option value="assessment-plan">Assessment Plan</option>
              <option value="treatment-plan">Treatment Plan</option>
              <option value="discharge-plan">Discharge Plan</option>
              <option value="nursing-plan">Nursing Plan</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Plan Content</label>
            <textarea
              id="content"
              name="content"
              value={formData.content || ''}
              onChange={handleContentChange}
              placeholder="Enter care plan details..."
              rows="8"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isLoading}>
              <Save size={18} />
              {isLoading ? 'Saving...' : 'Save Care Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CarePlanCreateModal;
