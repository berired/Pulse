import { Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import './ProfilePostCard.css';

function ProfilePostCard({ 
  post, 
  onEdit, 
  onDelete, 
  currentUserId 
}) {
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const handleEditPost = async () => {
    if (!editContent.trim()) return;
    try {
      console.log('ProfileCard: Editing post', { id: post.id, content: editContent.trim() });
      await onEdit({ id: post.id, content: editContent.trim() });
      setIsEditingPost(false);
      console.log('ProfileCard: Edit successful');
    } catch (error) {
      console.error('ProfileCard: Edit error:', error);
      alert(`Failed to edit post: ${error.message}`);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        console.log('ProfileCard: Deleting post', post.id);
        await onDelete(post.id);
        console.log('ProfileCard: Delete successful');
      } catch (error) {
        console.error('ProfileCard: Delete error:', error);
        alert(`Failed to delete post: ${error.message}`);
      }
    }
  };

  // Only show this card if the current user is the author
  if (post.author_id !== currentUserId) {
    return null;
  }

  return (
    <div className="profile-post-card">
      {/* POST HEADER */}
      <div className="ppc-header">
        <div className="ppc-info">
          <p className="ppc-category">{post.category}</p>
          <p className="ppc-date">{new Date(post.created_at).toLocaleDateString()}</p>
        </div>

        <div className="ppc-actions-menu">
          <button
            className="ppc-menu-btn"
            onClick={() => setIsEditingPost(true)}
            title="Edit post"
          >
            <Edit2 size={16} />
          </button>
          <button
            className="ppc-menu-btn delete"
            onClick={handleDeletePost}
            title="Delete post"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* POST CONTENT */}
      {isEditingPost ? (
        <div className="ppc-edit-form">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="ppc-textarea"
            rows="4"
          />
          <div className="ppc-edit-buttons">
            <button onClick={handleEditPost} className="ppc-save-btn">Save</button>
            <button
              onClick={() => {
                setIsEditingPost(false);
                setEditContent(post.content);
              }}
              className="ppc-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="ppc-content">
          <p>{post.content}</p>
        </div>
      )}

      {/* FOOTER STATS */}
      <div className="ppc-footer">
        <div className="ppc-stats">
          <span className="ppc-stat">
            {post.vote_count || 0} votes
          </span>
          <span className="ppc-stat-separator">•</span>
          <span className="ppc-stat">
            {post.post_comments?.length || 0} comments
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProfilePostCard;
