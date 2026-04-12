import { ThumbsUp, ThumbsDown, MessageCircle, Flag, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import CommentSection from './CommentSection';
import './BreakroomPostCard.css';

function BreakroomPostCard({ 
  post, 
  onVote, 
  onEdit, 
  onDelete, 
  currentUserId, 
  currentVote 
}) {
  const [showComments, setShowComments] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  // Debug: Log to see if buttons should show
  const isAuthor = post.author_id === currentUserId;
  if (!isAuthor && currentUserId) {
    // Only log once per render to avoid spam
    console.log(`Post author_id: ${post.author_id}, Current user: ${currentUserId}, Is author: ${isAuthor}`);
  }

  const handleVoteClick = (voteType) => {
    if (currentVote?.vote_type === voteType) {
      onVote({ postId: post.id, voteType: null });
    } else {
      onVote({ postId: post.id, voteType });
    }
  };

  const handleEditPost = async () => {
    if (!editContent.trim()) return;
    try {
      console.log('BreakroomPostCard: Edit triggered for post', post.id);
      await onEdit({ id: post.id, content: editContent.trim() });
      setIsEditingPost(false);
      console.log('BreakroomPostCard: Edit completed successfully');
    } catch (error) {
      console.error('BreakroomPostCard: Edit error:', error);
      alert(`Failed to edit post: ${error.message}`);
    }
  };

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        console.log('BreakroomPostCard: Delete triggered for post', post.id);
        onDelete(post.id);
      } catch (error) {
        console.error('BreakroomPostCard: Delete error:', error);
        alert(`Failed to delete post: ${error.message}`);
      }
    }
  };

  return (
    <div className="breakroom-post-card">
      {/* POST HEADER */}
      <div className="bpc-header">
        <div className="bpc-author-section">
          {post.profiles?.avatar_url && (
            <img
              src={post.profiles.avatar_url}
              alt={post.profiles.username}
              className="bpc-avatar"
            />
          )}
          <div className="bpc-author-info">
            <p className="bpc-author-name">{post.profiles?.full_name || 'Unknown User'}</p>
            <p className="bpc-author-meta">@{post.profiles?.username || 'unknown'} • {new Date(post.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="bpc-header-actions">
          {post.category && (
            <span className="bpc-category-badge">{post.category}</span>
          )}
          {isAuthor && (
            <div className="bpc-menu">
              <button
                className="bpc-menu-btn"
                onClick={() => setIsEditingPost(true)}
                title="Edit post"
              >
                <Edit2 size={16} />
              </button>
              <button
                className="bpc-menu-btn delete"
                onClick={handleDeletePost}
                title="Delete post"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* POST CONTENT */}
      {isEditingPost ? (
        <div className="bpc-edit-form">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="bpc-textarea"
            rows="4"
          />
          <div className="bpc-edit-buttons">
            <button onClick={handleEditPost} className="bpc-save-btn">Save</button>
            <button
              onClick={() => {
                setIsEditingPost(false);
                setEditContent(post.content);
              }}
              className="bpc-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bpc-content">
          <p>{post.content}</p>
        </div>
      )}

      {/* POST FOOTER - ACTIONS */}
      <div className="bpc-footer">
        <div className="bpc-actions">
          {/* UPVOTE BUTTON */}
          <button
            className={`bpc-vote-btn upvote ${currentVote?.vote_type === 'upvote' ? 'active' : ''}`}
            onClick={() => handleVoteClick('upvote')}
            title="Upvote this post"
          >
            <ThumbsUp size={18} />
            <span>{post.vote_count > 0 ? post.vote_count : ''}</span>
          </button>

          {/* DOWNVOTE BUTTON */}
          <button
            className={`bpc-vote-btn downvote ${currentVote?.vote_type === 'downvote' ? 'active' : ''}`}
            onClick={() => handleVoteClick('downvote')}
            title="Downvote this post"
          >
            <ThumbsDown size={18} />
          </button>

          {/* COMMENT BUTTON */}
          <button
            className="bpc-comment-btn"
            onClick={() => setShowComments(!showComments)}
            title={`${post.post_comments?.length || 0} Comments`}
          >
            <MessageCircle size={18} />
            <span className="bpc-comment-badge">{post.post_comments?.length || 0}</span>
          </button>

          {/* REPORT BUTTON */}
          <button className="bpc-report-btn" title="Report post">
            <Flag size={16} />
          </button>
        </div>
      </div>

      {/* COMMENT SECTION */}
      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
}

export default BreakroomPostCard;
