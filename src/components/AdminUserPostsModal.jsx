import { useState, useEffect } from 'react';
import { fetchWithAuth } from '../services/authHelper';
import './AdminModals.css';

export default function UserPostsModal({ user, onClose }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBanning, setIsBanning] = useState(false);
  const [banIPInput, setBanIPInput] = useState('');
  const [banReason, setBanReason] = useState('');

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
        <div className="modal-header">
          <div className="header-info">
            <div className="user-avatar-large">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} />
              ) : (
                <span>{user.username?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h2>{user.username}</h2>
              <p className="user-meta">{user.email}</p>
              <p className="user-meta">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="section">
            <h3>User Activity</h3>
            {loading ? (
              <div className="loading">Loading posts...</div>
            ) : posts.length > 0 ? (
              <div className="posts-list">
                {posts.map((post) => (
                  <div key={post.id} className="post-item">
                    <div className="post-type-badge">{post.type === 'post' ? '📝 Post' : '📚 Note'}</div>
                    <div className="post-content">{post.display}</div>
                    <div className="post-meta">
                      {new Date(post.created_at).toLocaleString()}
                      {post.vote_count && ` · ${post.vote_count} votes`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No posts or notes from this user</div>
            )}
          </div>

          <div className="section ban-section">
            <h3 style={{ color: '#ef4444' }}>🚫 Ban User IP</h3>
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
