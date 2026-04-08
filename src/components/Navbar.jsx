import { useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  MessageCircle,
  Users,
  TrendingUp,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/supabase';
import SearchUsers from './SearchUsers';
import { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/auth');
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: <TrendingUp size={20} />,
    },
    {
      id: 'knowledge',
      label: 'Study Guides',
      path: '/knowledge-exchange',
      icon: <BookOpen size={20} />,
    },
    {
      id: 'messages',
      label: 'Messages',
      path: '/messages',
      icon: <MessageCircle size={20} />,
    },
    {
      id: 'breakroom',
      label: 'Breakroom',
      path: '/breakroom',
      icon: <Users size={20} />,
    },
    {
      id: 'clinical',
      label: 'Clinical Center',
      path: '/clinical-center',
      icon: <TrendingUp size={20} />,
    },
  ];

  const isActive = (path) => location.pathname === path;

  const nursingYearLabels = {
    1: '1st Year',
    2: '2nd Year',
    3: '3rd Year',
    4: '4th Year',
  };

  const userRole = profile?.nursing_year 
    ? `${nursingYearLabels[profile.nursing_year]} Nurse`
    : 'Nursing Student';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className="navbar-brand">
          <button
            className="brand-text"
            onClick={() => navigate('/dashboard')}
          >
            <TrendingUp size={24} />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-menu desktop">
          <div className="nav-links">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={item.label}
              >
                {item.icon}
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Search Users */}
          <SearchUsers />

          {/* User Profile Section */}
          <div className="navbar-user">
            <button
              className="user-info-button"
              onClick={() => navigate(`/profile/${user?.id}`)}
              title="View Profile"
            >
              <div className="user-avatar">
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-meta">
                <p className="user-name">{profile?.username || 'User'}</p>
                <p className="user-role">{userRole}</p>
              </div>
            </button>

            <div className="user-actions">
              <button
                className="action-btn logout"
                title="Logout"
                onClick={handleLogout}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="menu-toggle mobile"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="navbar-menu mobile">
          {/* Mobile Search */}
          <div className="mobile-search-wrapper">
            <SearchUsers />
          </div>

          <div className="mobile-nav-links">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`mobile-nav-link ${
                  isActive(item.path) ? 'active' : ''
                }`}
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            <div className="mobile-user-section">
              <button
                className="mobile-user-info-button"
                onClick={() => {
                  navigate(`/profile/${user?.id}`);
                  setIsMenuOpen(false);
                }}
              >
                <div className="user-avatar-mobile">
                  {profile?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="user-name">{profile?.username || 'User'}</p>
                  <p className="user-role">{userRole}</p>
                </div>
              </button>

              <button
                className="mobile-logout-btn"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
