import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/authHelper';
import './AdminModals.css';

export default function UserPostsModal({ user, onClose }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBanning, setIsBanning] = useState(false);
  const [banIPInput, setBanIPInput] = useState('');
  const [banReason, setBanReason] = useState('');
  const [postFilter, setPostFilter] = useState('all');

  useEffect(() => {
    fetchUserPosts();
  }, [user.id]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/admin/users/${user.id}/posts`);

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (e) => {
    e.preventDefault();
    if (!banIPInput.trim()) {
      alert('Please enter an IP address');
      return;
    }

    if (!confirm(`Ban this IP: ${banIPInput}?`)) return;

    try {
      setIsBanning(true);
      const response = await fetchWithAuth(`/api/admin/users/${user.id}/ban`, {
        method: 'POST',
        body: JSON.stringify({
          ipAddress: banIPInput,
          reason: banReason || `User ${user.username} banned for violating rules`,
        }),
      });

      if (response.ok) {
        alert('IP address has been banned!');
        setBanIPInput('');
        setBanReason('');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to ban IP'}`);
      }
    } catch (error) {
      console.error('Error banning IP:', error);
      alert('Error banning IP');
    } finally {
      setIsBanning(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-body">
          <div className="user-details-header">
            <div className="user-details-avatar">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} />
              ) : (
                <span>{user.username?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="user-details-info">
              <h3>{user.username}</h3>
              <p>{user.full_name || 'No name provided'}</p>
              <p className="user-joined">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
              {user.registration_ip && user.registration_ip !== 'unknown' && (
                <p className="user-registration-ip">IP: {user.registration_ip}</p>
              )}
            </div>
          </div>

          <div className="section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>User Activity</h3>
              <select
                value={postFilter}
                onChange={(e) => setPostFilter(e.target.value)}
                className="filter-select"
                style={{ width: 'auto', padding: '0.5rem' }}
              >
                <option value="all">All Posts</option>
                <option value="post">Breakroom Posts</option>
                <option value="note">Study Guides</option>
              </select>
            </div>
            {loading ? (
              <div className="loading">Loading posts...</div>
            ) : posts.filter(p => postFilter === 'all' || p.type === postFilter).length > 0 ? (
              <div className="posts-list">
                {posts.filter(p => postFilter === 'all' || p.type === postFilter).map((post) => (
                  <div key={post.id} className="post-item">
                    <div className="post-type-badge">{post.type === 'post' ? '📝 Breakroom' : '📚 Study Guide'}</div>
                    <div className="post-content">{post.display}</div>
                    <div className="post-meta">
                      {new Date(post.created_at).toLocaleString()}
                      {post.vote_count && ` · ${post.vote_count} votes`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No {postFilter === 'all' ? 'posts' : 'matching posts'} from this user</div>
            )}
          </div>

          <div className="section ban-section">
            <h3 style={{ color: '#ef4444' }}>🚫 Ban User IP</h3>
            {user.registration_ip && user.registration_ip !== 'unknown' ? (
              <>
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontSize: '0.85rem' }}>Registration IP Detected</p>
                  <p style={{ margin: 0, color: '#e5e7eb', fontSize: '1.1rem', fontWeight: '600' }}>{user.registration_ip}</p>
                </div>
                <button
                  onClick={() => {
                    setBanIPInput(user.registration_ip);
                    setBanReason(`User ${user.username} banned for violating rules`);
                  }}
                  className="btn btn-primary"
                  style={{ marginBottom: '1rem', width: '100%' }}
                >
                  ⚡ Quick Ban This IP
                </button>
                <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1rem' }}>Or set a custom IP and reason below:</p>
              </>
            ) : (
              <p style={{ color: '#f59e0b', fontSize: '0.9rem', marginBottom: '1rem' }}>⚠️ Registration IP not available</p>
            )}
            <form onSubmit={handleBanUser} className="ban-form">
              <div className="form-group">
                <label>IP Address to Ban</label>
                <input
                  type="text"
                  placeholder="e.g., 192.168.1.1"
                  value={banIPInput}
                  onChange={(e) => setBanIPInput(e.target.value)}
                  disabled={isBanning}
                />
              </div>

              <div className="form-group">
                <label>Ban Reason</label>
                <textarea
                  placeholder="Reason for banning this IP..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows="3"
                  disabled={isBanning}
                />
              </div>

              <button
                type="submit"
                disabled={isBanning}
                className="btn btn-danger"
              >
                {isBanning ? 'Banning...' : 'Ban IP Address'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
