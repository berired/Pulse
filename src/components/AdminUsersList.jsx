import { useState, useEffect, useRef } from 'react';
import { fetchWithAuth } from '../services/authHelper';

export default function UsersList({ onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ offset: 0, limit: 20, total: 0 });
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.offset, search]);
  
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: pagination.offset,
        ...(search && { search }),
      });

      const response = await fetchWithAuth(`/api/admin/users?${params}`);

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination((prev) => ({ ...prev, total: data.total }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
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
        <h2>Users Management</h2>
        <input
          type="text"
          placeholder="Search users by name, email, or username..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);
            setPagination((prev) => ({ ...prev, offset: 0 }));
          }}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="admin-loading">Loading users...</div>
      ) : users.length > 0 ? (
        <>
          <div className="users-table">
            <div className="table-header">
              <div className="col-username">Username</div>
              <div className="col-name">Full Name</div>
              <div className="col-role">Role</div>
              <div className="col-joined">Joined</div>
            </div>
            {users.map((user) => (
              <div
                key={user.id}
                className="table-row"
                onClick={() => onSelectUser(user)}
              >
                <div className="col-username">
                  <div className="user-info">
                    {user.avatar_url && (
                      <img src={user.avatar_url} alt={user.username} className="user-avatar" />
                    )}
                    <span>{user.username || 'N/A'}</span>
                  </div>
                </div>
                <div className="col-name">{user.full_name || 'N/A'}</div>
                <div className="col-role">
                  <span className={`role-badge ${user.role}`}>{user.role || 'user'}</span>
                </div>
                <div className="col-joined">
                  {new Date(user.created_at).toLocaleDateString()}
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
        <div className="empty-state">No users found</div>
      )}
    </div>
  );
}
