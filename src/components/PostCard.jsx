import { ThumbsUp, ThumbsDown, MessageCircle, Flag, Trash2, Edit2 } from 'lucide-react';
import { useState } from 'react';
import CommentSection from './CommentSection';
import './PostCard.css';

function PostCard({ post, onVote, onOpenThread, currentUserId, currentVote, onEdit, onDelete, hideEditDelete = false, hideActions = false }) {
  const [showComments, setShowComments] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const handleVoteClick = (voteType) => {
    if (currentVote?.vote_type === voteType) {
      // Remove vote if clicking same type
      onVote({ postId: post.id, voteType: null });
    } else {
      onVote({ postId: post.id, voteType });
    }
  };

  const handleEditPost = async () => {
    if (!editContent.trim()) return;
    await onEdit({ id: post.id, content: editContent.trim() });
    setIsEditingPost(false);
  };

  const handleDeletePost = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post.id);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author-info">
          {post.profiles?.avatar_url && (
            <img
              src={post.profiles.avatar_url}
              alt={post.profiles.username}
              className="post-author-avatar"
            />
          )}
          <div>
            <p className="post-author-name">{post.profiles?.full_name || 'Unknown User'}</p>
            <div className="post-author-meta">
              <p className="post-author-username">@{post.profiles?.username || 'unknown'}</p>
              <span className="post-date-separator">•</span>
              <p className="post-date">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="post-header-actions">
          {post.category && (
            <span className="post-category-badge">{post.category}</span>
          )}
          {!hideEditDelete && post.author_id === currentUserId && (
            <div className="post-menu">
              <button
                className="post-menu-btn"
                onClick={() => setIsEditingPost(true)}
                title="Edit post"
              >
                <Edit2 size={16} />
              </button>
              <button
                className="post-menu-btn delete"
                onClick={handleDeletePost}
                title="Delete post"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditingPost ? (
        <div className="post-edit-form">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="post-edit-textarea"
            rows="4"
          />
          <div className="post-edit-buttons">
            <button
              onClick={handleEditPost}
              className="save-btn"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditingPost(false);
                setEditContent(post.content);
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="post-body">
          <p>{post.content}</p>
        </div>
      )}

      {!hideActions && (
        <div className="post-footer">
          <div className="post-actions">
            <button
              className={`vote-btn upvote ${
                currentVote?.vote_type === 'upvote' ? 'active' : ''
              }`}
              onClick={() => handleVoteClick('upvote')}
              title="Upvote"
            >
              <ThumbsUp size={18} />
              <span>{post.vote_count > 0 ? post.vote_count : ''}</span>
            </button>

            <button
              className={`vote-btn downvote ${
                currentVote?.vote_type === 'downvote' ? 'active' : ''
              }`}
              onClick={() => handleVoteClick('downvote')}
              title="Downvote"
            >
              <ThumbsDown size={18} />
            </button>

            <button
              className="action-btn"
              onClick={() => setShowComments(!showComments)}
              title={`${post.post_comments?.length || 0} Comments`}
            >
              <MessageCircle size={18} />
              <span className="comment-count">{post.post_comments?.length || 0}</span>
            </button>
          </div>

          <button className="report-btn" title="Report post">
            <Flag size={16} />
          </button>
        </div>
      )}

      {showComments && (
        <CommentSection postId={post.id} />
      )}
    </div>
  );
}

export default PostCard;
