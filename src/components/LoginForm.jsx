import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, profileService } from '../services/supabase';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import './Forms.css';

const LoginForm = ({ onSwitchToSignup }) => {
  const navigate = useNavigate();
  const { user, profile, setProfile } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If profile is loaded and user is set, navigate to dashboard
  useEffect(() => {
    if (user && profile) {
      navigate('/dashboard');
    }
  }, [user, profile, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email.trim()) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    try {
      await authService.login(
        formData.email,
        formData.password
      );

      // Get the current user and fetch their profile
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        try {
          const profileData = await profileService.getProfile(currentUser.id);
          setProfile(profileData);
          // Navigation will happen via useEffect above
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          // Still allow navigation even if profile fetch fails
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(
        err.message || 'Failed to login. Please check your credentials.'
      );
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email Address"
          disabled={loading}
          autoComplete="email"
        />
      </div>
 
      <div className="form-group password-input-wrapper">
        <label htmlFor="password">Password</label>
        <div className="password-input-container">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            disabled={loading}
            autoComplete="current-password"
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
      </div>

      <div className="form-group checkbox">
        <input
          type="checkbox"
          id="rememberMe"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleInputChange}
          disabled={loading}
        />
        <label htmlFor="rememberMe">Remember me on this device</label>
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        <LogIn size={18} />
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p className="form-footer">
        Don't have an account?{' '}
        <button
          type="button"
          className="link-button"
          onClick={onSwitchToSignup}
          disabled={loading}
        >
          Sign up here
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
