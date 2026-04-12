import { useState, useEffect, useRef } from 'react';
import './AdminDashboard.css';
import AdminStats from '../components/AdminStats';
import UsersList from '../components/AdminUsersList';
import ReportsList from '../components/AdminReportsList';
import UserPostsModal from '../components/AdminUserPostsModal';
import ReportDetailsModal from '../components/AdminReportDetailsModal';
import BannedIPsList from '../components/AdminBannedIPsList';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showUserPostsModal, setShowUserPostsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowUserPostsModal(true);
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleReportUpdated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, reports, and system settings</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📋 Reports
        </button>
        <button
          className={`tab-btn ${activeTab === 'banned' ? 'active' : ''}`}
          onClick={() => setActiveTab('banned')}
        >
          🚫 Banned IPs
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'users' && (
          <UsersList onSelectUser={handleSelectUser} />
        )}
        {activeTab === 'reports' && (
          <ReportsList onSelectReport={handleSelectReport} refreshKey={refreshKey} />
        )}
        {activeTab === 'banned' && <BannedIPsList />}
      </div>

      {showUserPostsModal && selectedUser && (
        <UserPostsModal
          user={selectedUser}
          onClose={() => {
            setShowUserPostsModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showReportModal && selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => {
            setShowReportModal(false);
            setSelectedReport(null);
          }}
          onReportUpdated={handleReportUpdated}
        />
      )}
    </div>
  );
}
