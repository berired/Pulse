import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCreateCareplan, useCareplansByUser, useUpdateCareplan, useDeleteCareplan } from '../hooks/useQueries';
import RichTextEditor from '../components/RichTextEditor';
import { Plus, ArrowLeft, Save, Edit3, Trash2, Eye } from 'lucide-react';
import './CarePlanBuilder.css';

const CarePlanBuilder = ({ onBack }) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [errors, setErrors] = useState({});

  // Form state for new plan
  const [formData, setFormData] = useState({
    patientName: '',
    templateType: 'assessment-plan',
    content: null,
  });

  const createCarePlanMutation = useCreateCareplan();
  const updateCarePlanMutation = useUpdateCareplan();
  const deleteCarePlanMutation = useDeleteCareplan();
  const { data: carePlans = [] } = useCareplansByUser(user?.id);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
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
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && selectedPlan) {
        // Update existing plan
        await updateCarePlanMutation.mutateAsync({
          id: selectedPlan.id,
          userId: user.id,
          patient_name: formData.patientName,
          template_type: formData.templateType,
          content: formData.content,
        });
      } else {
        // Create new plan
        await createCarePlanMutation.mutateAsync({
          userId: user.id,
          patient_name: formData.patientName,
          template_type: formData.templateType,
          content: formData.content,
        });
      }

      setFormData({
        patientName: '',
        templateType: 'assessment-plan',
        content: null,
      });
      setIsCreating(false);
      setIsEditing(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error saving care plan:', error);
      setErrors({ submit: 'Failed to save care plan. Please try again.' });
    }
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      patientName: plan.patient_name,
      templateType: plan.template_type,
      content: plan.content,
    });
    setIsViewing(false);
    setIsEditing(true);
  };

  const handleView = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      patientName: plan.patient_name,
      templateType: plan.template_type,
      content: plan.content,
    });
    setIsViewing(true);
  };

  const handleDelete = async (planId) => {
    if (window.confirm('Are you sure you want to delete this care plan?')) {
      try {
        await deleteCarePlanMutation.mutateAsync({
          id: planId,
          userId: user.id,
        });
        setIsViewing(false);
        setSelectedPlan(null);
      } catch (error) {
        console.error('Error deleting care plan:', error);
        alert('Failed to delete care plan');
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setIsViewing(false);
    setSelectedPlan(null);
    setFormData({
      patientName: '',
      templateType: 'assessment-plan',
      content: null,
    });
    setErrors({});
  };

  return (
    <div className="care-plan-builder">
      <div className="care-plan-header">
        <button onClick={onBack} className="btn-back">
          <ArrowLeft size={20} />
          Back
        </button>
        <h2>Care Plan Builder</h2>
        {!isCreating && !isEditing && !isViewing && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-create"
          >
            <Plus size={20} />
            New Plan
          </button>
        )}
      </div>

      {isCreating || isEditing || isViewing ? (
        <div className="care-plan-form-wrapper">
          <form onSubmit={handleSubmit} className="care-plan-form">
            <div className="form-group">
              <label htmlFor="patientName">Patient Name *</label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                placeholder="Enter patient name"
                disabled={isViewing}
                required
              />
              {errors.patientName && <p className="field-error">{errors.patientName}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="templateType">Care Plan Type</label>
              <select
                id="templateType"
                name="templateType"
                value={formData.templateType}
                onChange={handleInputChange}
                disabled={isViewing}
              >
                <option value="assessment-plan">Assessment Plan</option>
                <option value="nursing-diagnosis">Nursing Diagnosis</option>
                <option value="intervention-plan">Intervention Plan</option>
                <option value="discharge-summary">Discharge Summary</option>
              </select>
            </div>

            <div className="form-group">
              <label>Care Plan Content</label>
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Start writing your care plan (type '/' for commands)..."
              />
            </div>

            {errors.submit && <div className="error-message">{errors.submit}</div>}

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                {isViewing ? 'Close' : 'Cancel'}
              </button>
              {isViewing && selectedPlan && (
                <>
                  <button
                    type="button"
                    onClick={() => handleEdit(selectedPlan)}
                    className="btn-edit"
                  >
                    <Edit3 size={18} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedPlan.id)}
                    className="btn-delete"
                    disabled={deleteCarePlanMutation.isPending}
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </>
              )}
              {(isCreating || isEditing) && (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createCarePlanMutation.isPending || updateCarePlanMutation.isPending}
                >
                  <Save size={18} />
                  {createCarePlanMutation.isPending || updateCarePlanMutation.isPending
                    ? 'Saving...'
                    : isEditing ? 'Update Care Plan' : 'Save Care Plan'}
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <div className="care-plan-list">
          {carePlans.length === 0 ? (
            <div className="empty-state">
              <p>No care plans yet</p>
              <p className="text-muted">
                Create your first care plan to get started
              </p>
            </div>
          ) : (
            <div className="care-plans-grid">
              {carePlans.map((plan) => (
                <div key={plan.id} className="care-plan-item">
                  <div className="plan-header">
                    <div>
                      <h3>{plan.patient_name}</h3>
                      {plan.medical_record_number && (
                        <p className="text-muted">MRN: {plan.medical_record_number}</p>
                      )}
                    </div>
                    <span className={`badge badge-${plan.template_type}`}>
                      {plan.template_type.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <p className="plan-date">
                    Created: {new Date(plan.created_at).toLocaleDateString()}
                  </p>

                  <div className="plan-actions">
                    <button
                      className="btn-view"
                      onClick={() => handleView(plan)}
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      className="btn-edit-small"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                    <button
                      className="btn-delete-small"
                      onClick={() => handleDelete(plan.id)}
                      disabled={deleteCarePlanMutation.isPending}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CarePlanBuilder;
