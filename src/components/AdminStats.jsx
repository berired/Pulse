import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/authHelper';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    unreviewedReports: 0,
    totalBannedIPs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetchWithAuth('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading statistics...</div>;
  }

  return (
    <div className="admin-stats">
      <div className="stat-card">
        <div className="stat-icon">👥</div>
        <div className="stat-info">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">📋</div>
        <div className="stat-info">
          <h3>Total Reports</h3>
          <p className="stat-number">{stats.totalReports}</p>
        </div>
      </div>

      <div className="stat-card warning">
        <div className="stat-icon">⚠️</div>
        <div className="stat-info">
          <h3>Unreviewed Reports</h3>
          <p className="stat-number">{stats.unreviewedReports}</p>
        </div>
      </div>

      <div className="stat-card danger">
        <div className="stat-icon">🚫</div>
        <div className="stat-info">
          <h3>Banned IPs</h3>
          <p className="stat-number">{stats.totalBannedIPs}</p>
        </div>
      </div>
    </div>
  );
}
