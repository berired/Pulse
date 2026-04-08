import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/supabase';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    nursing_year: 1,
    institution: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const nursingYears = [1, 2, 3, 4];

  // Load current profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        nursing_year: profile.nursing_year || 1,
        institution: profile.institution || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'nursing_year' ? parseInt(value) : value,
    }));
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (!formData.institution.trim()) {
      setError('Institution is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update profile in database
      const updatedProfile = await profileService.updateProfile(user.id, {
        username: formData.username,
        nursing_year: formData.nursing_year,
        institution: formData.institution,
      });

      // Update the global AuthContext
      setProfile(updatedProfile);

      setSuccess('Profile updated successfully!');
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="edit-profile-container">
        <div className="edit-profile-card">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        {/* Header */}
        <div className="edit-profile-header">
          <button
            className="back-button"
            onClick={() => navigate('/dashboard')}
            title="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Edit Profile</h1>
          <div style={{ width: '40px' }} />
        </div>

        {/* Messages */}
        {error && (
          <div className="message-box error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="message-box success-message">
            <span>✓ {success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="edit-profile-form">
          {/* Username */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              disabled={loading}
              minLength={3}
              maxLength={50}
            />
            <p className="field-description">This is your public display name</p>
          </div>

          {/* Nursing Year */}
          <div className="form-group">
            <label htmlFor="nursing_year">Nursing Year</label>
            <select
              id="nursing_year"
              name="nursing_year"
              value={formData.nursing_year}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value={1}>1st Year</option>
              <option value={2}>2nd Year</option>
              <option value={3}>3rd Year</option>
              <option value={4}>4th Year</option>
            </select>
            <p className="field-description">Your current year in the nursing program</p>
          </div>

          {/* Institution */}
          <div className="form-group">
            <label htmlFor="institution">Institution</label>
            <input
              type="text"
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleInputChange}
              placeholder="Enter your institution"
              disabled={loading}
              maxLength={100}
            />
            <p className="field-description">Your school or university name</p>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
