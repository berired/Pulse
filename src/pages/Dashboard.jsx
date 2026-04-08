import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotes, usePosts } from '../hooks/useQueries';
import {
  BookOpen,
  MessageCircle,
  Users,
  TrendingUp,
  LogOut,
  Settings,
} from 'lucide-react';
import { authService } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import ActivityFeed from '../components/ActivityFeed';
import './Dashboard.css';

const Dashboard = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const { data: allNotes = [] } = useNotes();
  const { data: allPosts = [] } = usePosts();

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/auth');
  };

  const nursingYearLabels = {
    1: '1st Year',
    2: '2nd Year',
    3: '3rd Year',
    4: '4th Year',
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="profile-info">
            <div className="avatar-placeholder">
              {profile?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-greeting">
              <h1>Welcome back, {profile?.username || 'Student'}</h1>
              <p>
                {nursingYearLabels[profile?.nursing_year] || 'Nursing'} •{' '}
                {profile?.institution || 'Your Institution'}
              </p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-icon" title="Settings">
              <Settings size={20} />
            </button>
            <button
              className="btn-logout"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="stats-section">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <StatCard
              icon={<BookOpen size={24} />}
              title="Study Guides"
              value={allNotes.length}
              color="#0D9488"
              description="Uploaded resources"
            />
            <StatCard
              icon={<MessageCircle size={24} />}
              title="Discussions"
              value={allPosts.length}
              color="#10b981"
              description="Active posts"
            />
            <StatCard
              icon={<Users size={24} />}
              title="Cohort"
              value="24"
              color="#f59e0b"
              description="Connected peers"
            />
            <StatCard
              icon={<TrendingUp size={24} />}
              title="Engagement"
              value="85%"
              color="#8b5cf6"
              description="Your activity level"
            />
          </div>
        </section>

        <section className="activity-section">
          <div className="activity-header">
            <h2>Recent Activity</h2>
            <button className="btn-view-all">View All</button>
          </div>
          <ActivityFeed notes={allNotes.slice(0, 5)} posts={allPosts.slice(0, 5)} />
        </section>

        <section className="quick-access-section">
          <h2>Quick Access</h2>
          <div className="quick-access-grid">
            <button
              className="quick-access-btn"
              onClick={() => navigate('/knowledge-exchange')}
            >
              <BookOpen size={28} />
              <span>Study Guides</span>
            </button>
            <button
              className="quick-access-btn"
              onClick={() => navigate('/messages')}
            >
              <MessageCircle size={28} />
              <span>Messages</span>
            </button>
            <button
              className="quick-access-btn"
              onClick={() => navigate('/breakroom')}
            >
              <Users size={28} />
              <span>Breakroom</span>
            </button>
            <button
              className="quick-access-btn"
              onClick={() => navigate('/clinical-center')}
            >
              <TrendingUp size={28} />
              <span>Clinical Center</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
