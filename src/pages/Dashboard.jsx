import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotes, usePosts, useAllUsersCount, useUserEngagementMetrics } from '../hooks/useQueries';
import {
  BookOpen,
  MessageCircle,
  Users,
  TrendingUp,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import ActivityFeed from '../components/ActivityFeed';
import './Dashboard.css';

const Dashboard = () => {
  const { user, profile } = useAuth();
  
  if (!user) return null;

  const { data: allNotes = [] } = useNotes();
  const { data: allPosts = [] } = usePosts();
  const { data: usersCount = 0 } = useAllUsersCount();
  const { data: engagementMetrics = { engagementPercentage: 0 } } = useUserEngagementMetrics(user?.id);

  const nursingYearLabels = {
    1: '1st Year',
    2: '2nd Year',
    3: '3rd Year',
    4: '4th Year',
  };

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <section className="dashboard-welcome">
        <div className="welcome-content">
          <h1>Welcome back, {profile?.username || 'Student'}</h1>
          <p>
            {nursingYearLabels[profile?.nursing_year] || 'Nursing'} •{' '}
            {profile?.institution || 'Your Institution'}
          </p>
        </div>
      </section>

      <div className="dashboard-container">
        {/* Quick Stats Section */}
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
              value={usersCount}
              color="#f59e0b"
              description="Connected peers"
            />
            <StatCard
              icon={<TrendingUp size={24} />}
              title="Engagement"
              value={`${engagementMetrics.engagementPercentage}%`}
              color="#8b5cf6"
              description="Your activity level"
            />
          </div>
        </section>

        {/* Recent Activity Section */}
        <section className="activity-section">
          <div className="activity-header">
            <h2>Recent Activity</h2>
          </div>
          <ActivityFeed notes={allNotes.slice(0, 5)} posts={allPosts.slice(0, 5)} />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
