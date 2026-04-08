import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useSearchUsers } from '../hooks/useQueries';
import './SearchUsers.css';

export default function SearchUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const { data: searchResults = [], isLoading } = useSearchUsers(searchQuery);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(value.length > 0);
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const nursingYearLabels = {
    1: '1st',
    2: '2nd',
    3: '3rd',
    4: '4th',
  };

  return (
    <div className="search-users-container">
      <div className="search-input-wrapper">
        <Search size={20} className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearch}
          onFocus={() => searchQuery && setShowDropdown(true)}
          className="search-input"
        />
        {searchQuery && (
          <button
            className="clear-btn"
            onClick={handleClear}
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="search-dropdown" ref={dropdownRef}>
          {isLoading ? (
            <div className="search-loading">
              <span className="spinner-small"></span>
              <p>Searching...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="search-empty">
              <p>No users found</p>
            </div>
          ) : (
            <div className="search-results">
              {searchResults.map((user) => {
                const year = nursingYearLabels[user.nursing_year] || `${user.nursing_year}th`;
                return (
                  <button
                    key={user.id}
                    className="search-result-item"
                    onClick={() => handleUserClick(user.id)}
                  >
                    <div className="result-avatar">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="result-info">
                      <p className="result-username">{user.username}</p>
                      <p className="result-meta">{year} Year Nurse • {user.institution || 'No institution'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
