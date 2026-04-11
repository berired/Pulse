import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useQueries';
import { useFollowersCount, useFollowingCount, useIsFollowing, useToggleFollow } from '../hooks/useQueries';
import { supabase } from '../services/supabase';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Heart, Share2, Loader } from 'lucide-react';
import './UserProfile.css';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Fetch the profile being viewed
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Fetch followers/following counts
  const { data: followersCount, isLoading: followersLoading } = useFollowersCount(userId);
  const { data: followingCount, isLoading: followingLoading } = useFollowingCount(userId);

  // Check if current user is following this user
  const { data: isFollowing, isLoading: isFollowingLoading } = useIsFollowing(
    currentUser?.id,
    userId
  );

  // Fetch follow/unfollow mutation
  const toggleFollowMutation = useToggleFollow();

  // Fetch user's notes
  const { data: userNotes = [], isLoading: notesLoading } = useNotes({
    author_id: userId,
  });

  const isOwnProfile = currentUser?.id === userId;

  const handleToggleFollow = () => {
    if (!currentUser?.id) return;

    toggleFollowMutation.mutate({
      currentUserId: currentUser.id,
      targetUserId: userId,
      isFollowing: isFollowing,
    });
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (profileLoading) {
    return (
      <div className="user-profile">
        <div className="profile-loading">
          <Loader className="spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="user-profile">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="profile-error">
          <p>User not found</p>
        </div>
      </div>
    );
  }

  const nursingYearLabels = {
    1: '1st',
    2: '2nd',
    3: '3rd',
    4: '4th',
  };

  const nursingYear = nursingYearLabels[profileData.nursing_year] || `${profileData.nursing_year}th`;
  const userRole = `${nursingYear} Year Nurse`;

  return (
    <div className="user-profile">
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-top">
          <div className="profile-avatar-large">
            {profileData.username?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{profileData.full_name || profileData.username || 'Unknown User'}</h1>
            <p className="profile-username-handle">@{profileData.username || 'unknown'}</p>
            <p className="profile-role">{userRole}</p>
            {profileData.institution && (
              <p className="profile-institution">{profileData.institution}</p>
            )}
          </div>

          {isOwnProfile ? (
            <button className="edit-button" onClick={handleEditProfile}>
              Edit Profile
            </button>
          ) : (
            <button
              className={`follow-button ${isFollowing ? 'following' : ''}`}
              onClick={handleToggleFollow}
              disabled={toggleFollowMutation.isPending}
            >
              {toggleFollowMutation.isPending ? (
                <>
                  <Loader size={16} className="spinner-mini" />
                  {isFollowing ? 'Unfollowing...' : 'Following...'}
                </>
              ) : (
                isFollowing ? 'Unfollow' : 'Follow'
              )}
            </button>
          )}
        </div>

        {/* Stats Section */}
        <div className="profile-stats">
          <div className="stat-item">
            <p className="stat-number">
              {followersLoading ? (
                <Loader size={16} className="spinner-mini" />
              ) : (
                followersCount
              )}
            </p>
            <p className="stat-label">Followers</p>
          </div>

          <div className="stat-item">
            <p className="stat-number">
              {followingLoading ? (
                <Loader size={16} className="spinner-mini" />
              ) : (
                followingCount
              )}
            </p>
            <p className="stat-label">Following</p>
          </div>

          <div className="stat-item">
            <p className="stat-number">{userNotes.length}</p>
            <p className="stat-label">Study Guides</p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="profile-notes">
        <h2 className="notes-title">Study Guides</h2>

        {notesLoading ? (
          <div className="notes-loading">
            <Loader className="spinner" />
            <p>Loading study guides...</p>
          </div>
        ) : userNotes.length === 0 ? (
          <div className="notes-empty">
            <p>No study guides yet</p>
          </div>
        ) : (
          <div className="notes-grid">
            {userNotes.map((note) => (
              <div key={note.id} className="note-card">
                <div className="note-header">
                  <h3 className="note-title">{note.title || 'Untitled Note'}</h3>
                </div>

                <p className="note-description">
                  {note.description || 'No description provided'}
                </p>

                {note.subject && (
                  <div className="note-subject">
                    <span className="subject-badge">{note.subject}</span>
                  </div>
                )}

                <div className="note-meta">
                  <span className="note-date">
                    {note.created_at
                      ? new Date(note.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'No date'}
                  </span>
                </div>

                <div className="note-actions">
                  <button className="action-button">
                    <Heart size={18} />
                    <span>Like</span>
                  </button>
                  <button className="action-button">
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
