import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCareplansByUser, useUpdateCareplan, useDeleteCareplan } from '../hooks/useQueries';
import { Edit3, Trash2, Eye } from 'lucide-react';
import './CarePlanBuilder.css';

const CarePlanBuilder = forwardRef((props, ref) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isViewing, setIsViewing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const updateCarePlanMutation = useUpdateCareplan();
  const deleteCarePlanMutation = useDeleteCareplan();
  const { data: carePlans = [] } = useCareplansByUser(user?.id);


  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setIsViewing(false);
    setIsEditing(true);
  };

  const handleView = (plan) => {
    setSelectedPlan(plan);
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

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedPlan || !isEditing) return;

    try {
      await updateCarePlanMutation.mutateAsync({
        id: selectedPlan.id,
        userId: user.id,
        patient_name: selectedPlan.patient_name,
        template_type: selectedPlan.template_type,
        content: selectedPlan.content,
      });
      setIsEditing(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error updating care plan:', error);
      alert('Failed to update care plan');
    }
  };

  const handleCancel = () => {
    setIsViewing(false);
    setIsEditing(false);
    setSelectedPlan(null);
  };

  useImperativeHandle(ref, () => ({
    startCreating: () => {
      // This ref is kept for backward compatibility but no longer used
      // Modal opening is now handled in parent component
    },
  }));

  return (
    <div className="care-plan-builder">
      {isViewing || isEditing ? (
        <div className="care-plan-form-wrapper">
          <form onSubmit={isEditing ? handleSaveEdit : (e) => e.preventDefault()} className="care-plan-form">
            <div className="form-group">
              <label htmlFor="patientName">Patient Name *</label>
              <input
                type="text"
                id="patientName"
                value={selectedPlan?.patient_name || ''}
                onChange={(e) => setSelectedPlan({ ...selectedPlan, patient_name: e.target.value })}
                placeholder="Enter patient name"
                disabled={isViewing}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="templateType">Care Plan Type</label>
              <select
                id="templateType"
                value={selectedPlan?.template_type || 'assessment-plan'}
                onChange={(e) => setSelectedPlan({ ...selectedPlan, template_type: e.target.value })}
                disabled={isViewing}
              >
                <option value="assessment-plan">Assessment Plan</option>
                <option value="nursing-diagnosis">Nursing Diagnosis</option>
                <option value="intervention-plan">Intervention Plan</option>
                <option value="discharge-summary">Discharge Summary</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="content">Care Plan Content</label>
              <textarea
                id="content"
                value={selectedPlan?.content || ''}
                onChange={(e) => setSelectedPlan({ ...selectedPlan, content: e.target.value })}
                placeholder="Enter your care plan content here..."
                disabled={isViewing}
                rows="12"
                className="care-plan-textarea"
              />
            </div>

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
              {isEditing && (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={updateCarePlanMutation.isPending}
                >
                  Update Care Plan
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
});

CarePlanBuilder.displayName = 'CarePlanBuilder';
export default CarePlanBuilder;
