import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/supabase';
import { UserPlus, CheckCircle, Eye, EyeOff } from 'lucide-react';
import Stepper, { Step } from './Stepper';
import './Forms.css';

const SignupForm = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const submittingRef = useRef(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    username: '',
    nursingYear: '1',
    institution: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [validation, setValidation] = useState({
    email: null,
    password: null,
    username: null,
  });

  // Validation regex patterns
  const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,16}$/;
  const SPECIAL_CHAR_REGEX = /[!"#$%&'()*+,-./:;<=>?@\[\]^_`{|}~]/;
  const HAS_NUMBER = /\d/;
  const HAS_UPPERCASE = /[A-Z]/;
  const HAS_LOWERCASE = /[a-z]/;

  // Validate password requirements
  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    } else if (password.length > 16) {
      errors.push('Password must be at most 16 characters');
    }

    if (!HAS_UPPERCASE.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!HAS_LOWERCASE.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!HAS_NUMBER.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!SPECIAL_CHAR_REGEX.test(password)) {
      errors.push('Password must contain at least one special character (!\"#$%&\'()*+,-./:;<=>?@[]^_`{|}~)');
    }

    return errors;
  };

  // Validate username format
  const validateUsername = (username) => {
    if (!USERNAME_REGEX.test(username)) {
      if (username.length < 3) {
        return 'Username must be at least 3 characters';
      } else if (username.length > 16) {
        return 'Username must be at most 16 characters';
      } else {
        return 'Username can only contain letters, numbers, underscores (_), and dashes (-). No spaces allowed.';
      }
    }
    return null;
  };

  // Real-time email validation
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, email }));
    
    if (!email.trim()) {
      setValidation(prev => ({ ...prev, email: null }));
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidation(prev => ({ ...prev, email: { status: 'invalid', message: 'Invalid email format' } }));
    } else {
      // Check if email is already registered
      const checkEmail = async () => {
        const isAvailable = await authService.checkEmailAvailable(email);
        setValidation(prev => ({
          ...prev,
          email: isAvailable 
            ? { status: 'available', message: '✓ Email available' }
            : { status: 'taken', message: 'This email is already registered' }
        }));
      };
      checkEmail();
    }
  };

  // Real-time password validation
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));
    
    if (!password) {
      setValidation(prev => ({ ...prev, password: null }));
    } else {
      const requirements = {
        length: password.length >= 8 && password.length <= 16,
        uppercase: HAS_UPPERCASE.test(password),
        lowercase: HAS_LOWERCASE.test(password),
        number: HAS_NUMBER.test(password),
        special: SPECIAL_CHAR_REGEX.test(password),
      };
      setValidation(prev => ({ ...prev, password: requirements }));
    }
  };

  // Real-time username validation
  const handleUsernameChange = async (e) => {
    const username = e.target.value;
    setFormData(prev => ({ ...prev, username }));
    
    if (!username.trim()) {
      setValidation(prev => ({ ...prev, username: null }));
    } else {
      const formatError = validateUsername(username.trim());
      if (formatError) {
        setValidation(prev => ({ ...prev, username: { status: 'invalid', message: formatError } }));
      } else {
        const isAvailable = await authService.checkUsernameAvailable(username.trim());
        setValidation(prev => ({
          ...prev,
          username: isAvailable ? { status: 'available' } : { status: 'taken', message: 'This username is already taken' }
        }));
      }
    }
  };

  const validateStep = async (step) => {
    const newErrors = {};

    if (step === 1) {
      // Validate email and password
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        // Check if email is already registered
        const isAvailable = await authService.checkEmailAvailable(formData.email);
        if (!isAvailable) {
          newErrors.email = 'This email is already registered';
        }
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else {
        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
          newErrors.password = passwordErrors.join('; ');
        }
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 2) {
      // Validate profile information
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else {
        const usernameError = validateUsername(formData.username.trim());
        if (usernameError) {
          newErrors.username = usernameError;
        } else {
          // Check if username is already registered
          const isAvailable = await authService.checkUsernameAvailable(formData.username.trim());
          if (!isAvailable) {
            newErrors.username = 'This username is already taken';
          }
        }
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

  const handleStepChange = async (step) => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateStep(2);
    if (!isValid) {
      return;
    }
    // Prevent double submission
    if (submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    setErrors({});

    try {
      await authService.signup(
        formData.email,
        formData.password,
        {
          full_name: formData.full_name,
          username: formData.username,
          nursing_year: parseInt(formData.nursingYear),
          institution: formData.institution,
        }
      );

      // Show success state
      setIsSubmitSuccess(true);
    } catch (err) {
      let errorMessage = err.message || 'An unexpected error occurred.';
      
      // More specific error handling
      if (err.message.includes('rate')) {
        errorMessage = 'Too many signup attempts. Please wait a minute before trying again.';
      } else if (err.message.includes('profile')) {
        errorMessage = 'Failed to create profile. Please try again.';
      } else if (err.message.includes('already')) {
        errorMessage = 'This email is already registered.';
      }
      
      setErrors({
        submit: errorMessage
      });
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <>
      <Stepper
        onStepChange={handleStepChange}
        onFinalStepCompleted={handleSubmit}
        nextButtonText="Next"
        backButtonText="Back"
        isLoading={loading}
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
              onChange={handleEmailChange}
              placeholder="you@example.com"
              disabled={loading}
              autoComplete="email"
            />
            {validation.email && (
              <div className={`validation-feedback ${validation.email.status === 'available' || validation.email.status === 'valid' ? 'success' : 'error'}`}>
                {validation.email.message}
              </div>
            )}
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="form-group password-input-wrapper">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {validation.password && typeof validation.password === 'object' && (
              <div className="password-requirements">
                <div className={`requirement ${validation.password.length ? 'met' : 'unmet'}`}>
                  {validation.password.length ? '✓' : '✗'} 8-16 characters
                </div>
                <div className={`requirement ${validation.password.uppercase ? 'met' : 'unmet'}`}>
                  {validation.password.uppercase ? '✓' : '✗'} One uppercase letter
                </div>
                <div className={`requirement ${validation.password.lowercase ? 'met' : 'unmet'}`}>
                  {validation.password.lowercase ? '✓' : '✗'} One lowercase letter
                </div>
                <div className={`requirement ${validation.password.number ? 'met' : 'unmet'}`}>
                  {validation.password.number ? '✓' : '✗'} One number
                </div>
                <div className={`requirement ${validation.password.special ? 'met' : 'unmet'}`}>
                  {validation.password.special ? '✓' : '✗'} One special character
                </div>
              </div>
            )}
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div className="form-group password-input-wrapper">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
            <label htmlFor="full_name">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Your full name"
              disabled={loading}
              maxLength={100}
            />
            {errors.full_name && <p className="field-error">{errors.full_name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleUsernameChange}
              placeholder="Choose a username"
              disabled={loading}
              autoComplete="username"
            />
            {validation.username && (
              <div className={`validation-feedback ${validation.username.status === 'taken' || validation.username.status === 'invalid' ? 'error' : 'success'}`}>
                {validation.username.status === 'available' ? '✓ Username available' : validation.username.message}
              </div>
            )}
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
              <label>Full Name</label>
              <p className="review-value">{formData.full_name}</p>
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

      {isSubmitSuccess && (
        <div className="success-screen">
          <div className="success-content">
            <div className="success-icon">
              <CheckCircle size={64} color="#0D9488" />
            </div>
            <h2 className="success-title">Account Created Successfully!</h2>
            <p className="success-message">
              Your account has been set up. You can now log in with your email and password.
            </p>
            <button 
              className="success-button"
              onClick={() => {
                // Reset form
                setFormData({
                  email: '',
                  password: '',
                  confirmPassword: '',
                  username: '',
                  nursingYear: '1',
                  institution: '',
                });
                setValidation({
                  email: null,
                  password: null,
                  username: null,
                });
                setIsSubmitSuccess(false);
                setCurrentStep(1);
                onSwitchToLogin();
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SignupForm;
