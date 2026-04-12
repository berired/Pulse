import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/authHelper';

export default function BannedIPsList() {
  const [bannedIPs, setBannedIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ offset: 0, limit: 20, total: 0 });

  useEffect(() => {
    fetchBannedIPs();
  }, [pagination.offset]);

  const fetchBannedIPs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: pagination.offset,
      });

      const response = await fetchWithAuth(`/api/admin/banned-ips?${params}`);

      if (response.ok) {
        const data = await response.json();
        setBannedIPs(data.bannedIPs);
        setPagination((prev) => ({ ...prev, total: data.total }));
      }
    } catch (error) {
      console.error('Error fetching banned IPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async (ipId) => {
    if (!confirm('Are you sure you want to unban this IP address?')) return;

    try {
      const response = await fetchWithAuth(`/api/admin/banned-ips/${ipId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBannedIPs(bannedIPs.filter((ip) => ip.id !== ipId));
      } else {
        alert('Failed to unban IP');
      }
    } catch (error) {
      console.error('Error unbanning IP:', error);
      alert('Error unbanning IP');
    }
  };

  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination((prev) => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
      }));
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>🚫 Banned IP Addresses</h2>
        <p className="section-subtitle">Manage IP address bans to prevent account creation from banned networks</p>
      </div>

      {loading ? (
        <div className="admin-loading">Loading banned IPs...</div>
      ) : bannedIPs.length > 0 ? (
        <>
          <div className="banned-ips-table">
            <div className="table-header">
              <div className="col-ip">IP Address</div>
              <div className="col-reason">Reason</div>
              <div className="col-banned-by">Banned By</div>
              <div className="col-date">Banned Date</div>
              <div className="col-action">Action</div>
            </div>
            {bannedIPs.map((ban) => (
              <div key={ban.id} className="table-row">
                <div className="col-ip">
                  <code className="ip-code">{ban.ip_address}</code>
                </div>
                <div className="col-reason">{ban.reason || 'No reason provided'}</div>
                <div className="col-banned-by">{ban.profiles?.username || 'System'}</div>
                <div className="col-date">{new Date(ban.banned_at).toLocaleDateString()}</div>
                <div className="col-action">
                  <button
                    onClick={() => handleUnban(ban.id)}
                    className="action-btn danger-btn"
                  >
                    Unban
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={handlePrevPage}
              disabled={pagination.offset === 0}
              className="pagination-btn"
            >
              ← Previous
            </button>
            <span className="pagination-info">
              {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of{' '}
              {pagination.total}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pagination.offset + pagination.limit >= pagination.total}
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">No banned IP addresses</div>
      )}
    </div>
  );
}
