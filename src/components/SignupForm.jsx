import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/supabase';
import { UserPlus, CheckCircle } from 'lucide-react';
import Stepper, { Step } from './Stepper';
import './Forms.css';

const SignupForm = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    nursingYear: '1',
    institution: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Validate email and password
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 2) {
      // Validate profile information
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }

      if (!formData.institution.trim()) {
        newErrors.institution = 'Institution is required';
      }
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

  const handleStepChange = (step) => {
    if (validateStep(currentStep)) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      return;
    }

    setLoading(true);

    try {
      await authService.signup(
        formData.email,
        formData.password,
        {
          username: formData.username,
          nursing_year: parseInt(formData.nursingYear),
          institution: formData.institution,
        }
      );

      // Show success message and switch back to login
      setErrors({
        submit: 'Account created successfully! You can now log in with your email and password.',
      });
      
      // Reset form after 1.5 seconds and switch to login
      setTimeout(() => {
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          username: '',
          nursingYear: '1',
          institution: '',
        });
        onSwitchToLogin();
      }, 1500);
    } catch (err) {
      setErrors({
        submit: err.message || 'An unexpected error occurred. Please try again.',
      });
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stepper
      onStepChange={handleStepChange}
      onFinalStepCompleted={handleSubmit}
      nextButtonText="Next"
      backButtonText="Back"
    >
      {/* Step 1: Account Credentials */}
      <Step>
        <div className="step-content">
          <h2 className="step-title">Create Your Account</h2>
          <p className="step-description">Enter your email and password to get started</p>

          {errors.submit && (
            <div className={`error-message ${errors.submit.includes('successfully') ? 'success' : ''}`}>
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="field-error">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
      </Step>

      {/* Step 2: Profile Information */}
      <Step>
        <div className="step-content">
          <h2 className="step-title">Profile Information</h2>
          <p className="step-description">Tell us a bit about yourself</p>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Choose a username"
              disabled={loading}
              autoComplete="username"
            />
            {errors.username && <p className="field-error">{errors.username}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="nursingYear">Nursing Year</label>
            <select
              id="nursingYear"
              name="nursingYear"
              value={formData.nursingYear}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="institution">Institution</label>
            <input
              type="text"
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleInputChange}
              placeholder="Your Institution"
              disabled={loading}
            />
            {errors.institution && (
              <p className="field-error">{errors.institution}</p>
            )}
          </div>
        </div>
      </Step>

      {/* Step 3: Review & Confirm */}
      <Step>
        <div className="step-content">
          <h2 className="step-title">Review & Confirm</h2>
          <p className="step-description">Please verify your information</p>

          <div className="review-section">
            <div className="review-group">
              <label>Email Address</label>
              <p className="review-value">{formData.email}</p>
            </div>

            <div className="review-group">
              <label>Username</label>
              <p className="review-value">{formData.username}</p>
            </div>

            <div className="review-group">
              <label>Nursing Year</label>
              <p className="review-value">{formData.nursingYear === '1' ? '1st Year' : formData.nursingYear === '2' ? '2nd Year' : formData.nursingYear === '3' ? '3rd Year' : '4th Year'}</p>
            </div>

            <div className="review-group">
              <label>Institution</label>
              <p className="review-value">{formData.institution}</p>
            </div>
          </div>

          <div className="review-notice">
            <CheckCircle size={20} />
            <span>Click "Complete" to create your account</span>
          </div>
        </div>
      </Step>
    </Stepper>
  );
};

export default SignupForm;
