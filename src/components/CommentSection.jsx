import { useState } from 'react';
import { Send, Trash2, Edit2, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePostComments, useCreatePostComment, useUpdatePostComment, useDeletePostComment } from '../hooks/useQueries';
import './CommentSection.css';

function CommentSection({ postId }) {
  const { user } = useAuth();
  const [newCommentContent, setNewCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const { data: comments = [], isLoading } = usePostComments(postId);
  const createCommentMutation = useCreatePostComment();
  const updateCommentMutation = useUpdatePostComment();
  const deleteCommentMutation = useDeletePostComment();

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newCommentContent.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        post_id: postId,
        author_id: user.id,
        content: newCommentContent.trim(),
      });

      setNewCommentContent('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      await updateCommentMutation.mutateAsync({
        id: commentId,
        post_id: postId,
        content: editContent.trim(),
      });

      setEditingCommentId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteCommentMutation.mutateAsync({
          commentId,
          postId,
        });
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  return (
    <div className="comment-section">
      <div className="comments-header">
        <h4>Comments ({comments.length})</h4>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {isLoading ? (
          <div className="comments-loading">
            <Loader size={18} className="spinner" />
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author-info">
                  {comment.profiles?.avatar_url && (
                    <img
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.username}
                      className="comment-avatar"
                    />
                  )}
                  <div className="comment-author-details">
                    <p className="comment-author-name">
                      {comment.profiles?.full_name || 'Unknown User'}
                    </p>
                    <p className="comment-author-username">
                      @{comment.profiles?.username || 'unknown'}
                    </p>
                  </div>
                </div>

                {comment.author_id === user?.id && (
                  <div className="comment-actions">
                    <button
                      className="comment-edit-btn"
                      onClick={() => startEditComment(comment)}
                      title="Edit comment"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="comment-delete-btn"
                      onClick={() => handleDeleteComment(comment.id)}
                      title="Delete comment"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {editingCommentId === comment.id ? (
                <div className="comment-edit-form">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="comment-edit-textarea"
                    rows="2"
                  />
                  <div className="comment-edit-buttons">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="save-btn"
                      disabled={updateCommentMutation.isPending}
                    >
                      {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditContent('');
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="comment-content">{comment.content}</p>
                  <p className="comment-date">
                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            placeholder="Add a comment..."
            rows="2"
            className="comment-textarea"
            maxLength="1500"
          />
          <div className="comment-form-footer">
            <span className="char-count">
              {1500 - newCommentContent.length} characters remaining
            </span>
            <button
              type="submit"
              className="submit-comment-btn"
              disabled={createCommentMutation.isPending || !newCommentContent.trim()}
            >
              <Send size={16} />
              {createCommentMutation.isPending ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CommentSection;
