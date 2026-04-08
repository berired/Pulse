import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCreateCareplan, useCareplansByUser } from '../hooks/useQueries';
import TiptapEditor from '../components/TiptapEditor';
import { Plus, ArrowLeft, Save } from 'lucide-react';
import './CarePlanBuilder.css';

const CarePlanBuilder = ({ onBack }) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form state for new plan
  const [formData, setFormData] = useState({
    patientName: '',
    medicalRecordNumber: '',
    templateType: 'assessment-plan',
    content: null,
  });

  const createCarePlanMutation = useCreateCareplan();
  const { data: carePlans = [] } = useCareplansByUser(user?.id);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName.trim()) {
      alert('Please enter patient name');
      return;
    }

    try {
      await createCarePlanMutation.mutateAsync({
        userId: user.id,
        ...formData,
      });
      setFormData({
        patientName: '',
        medicalRecordNumber: '',
        templateType: 'assessment-plan',
        content: null,
      });
      setIsCreating(false);
      alert('Care plan created successfully!');
    } catch (error) {
      console.error('Error creating care plan:', error);
      alert('Failed to create care plan');
    }
  };

  return (
    <div className="care-plan-builder">
      <div className="care-plan-header">
        <button onClick={onBack} className="btn-back">
          <ArrowLeft size={20} />
          Back
        </button>
        <h2>Care Plan Builder</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-create"
          >
            <Plus size={20} />
            New Plan
          </button>
        )}
      </div>

      {isCreating ? (
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
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="medicalRecordNumber">Medical Record Number</label>
              <input
                type="text"
                id="medicalRecordNumber"
                name="medicalRecordNumber"
                value={formData.medicalRecordNumber}
                onChange={handleInputChange}
                placeholder="MRN"
              />
            </div>

            <div className="form-group">
              <label htmlFor="templateType">Care Plan Type</label>
              <select
                id="templateType"
                name="templateType"
                value={formData.templateType}
                onChange={handleInputChange}
              >
                <option value="assessment-plan">Assessment Plan</option>
                <option value="nursing-diagnosis">Nursing Diagnosis</option>
                <option value="intervention-plan">Intervention Plan</option>
                <option value="discharge-summary">Discharge Summary</option>
              </select>
            </div>

            <div className="form-group">
              <label>Care Plan Content</label>
              <TiptapEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Enter care plan details..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={createCarePlanMutation.isPending}
              >
                <Save size={18} />
                {createCarePlanMutation.isPending
                  ? 'Saving...'
                  : 'Save Care Plan'}
              </button>
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
            carePlans.map((plan) => (
              <div key={plan.id} className="care-plan-item">
                <div className="plan-header">
                  <div>
                    <h3>{plan.patientName}</h3>
                    <p className="text-muted">{plan.medicalRecordNumber}</p>
                  </div>
                  <span className="badge">{plan.templateType}</span>
                </div>
                <p className="text-muted">
                  Created: {new Date(plan.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CarePlanBuilder;
