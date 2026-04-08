import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/supabase';
import { LogIn } from 'lucide-react';
import './Forms.css';

const LoginForm = ({ onSwitchToSignup }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      navigate('/dashboard');
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
          autoComplete="current-password"
        />
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
