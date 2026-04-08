import { ThumbsUp, ThumbsDown, MessageCircle, Flag } from 'lucide-react';
import './PostCard.css';

function PostCard({ post, onVote, onOpenThread, currentUserId, currentVote }) {
  const handleVoteClick = (voteType) => {
    if (currentVote?.vote_type === voteType) {
      // Remove vote if clicking same type
      onVote({ postId: post.id, voteType: null });
    } else {
      onVote({ postId: post.id, voteType });
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
            <p className="post-author-name">{post.profiles?.username}</p>
            <p className="post-date">
              {new Date(post.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {post.category && (
          <span className="post-category-badge">{post.category}</span>
        )}
      </div>

      <div className="post-body">
        <p>{post.content}</p>
      </div>

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
            onClick={() => onOpenThread(post.id)}
            title="View thread"
          >
            <MessageCircle size={18} />
            <span>{post.post_comments?.length || 0} Comments</span>
          </button>
        </div>

        <button className="report-btn" title="Report post">
          <Flag size={16} />
        </button>
      </div>
    </div>
  );
}

export default PostCard;
