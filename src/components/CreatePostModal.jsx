import { useState } from 'react';
import { Send, X } from 'lucide-react';
import './CreatePostModal.css';

const CATEGORIES = [
  'Clinical Stress',
  'Exam Prep',
  'Venting',
  'Study Tips',
  'Career Advice',
  'General Discussion',
];

function CreatePostModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General Discussion');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    await onSubmit({
      content: content.trim(),
      category,
    });

    setContent('');
    setCategory('General Discussion');
    onClose();
  };

  if (!isOpen) return null;

  const remainingChars = 5000 - content.length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Start a Discussion</h2>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-post-modal-form">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">Your post</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 5000))}
              placeholder="Share your thoughts, questions, or experiences..."
              rows="6"
              className="content-textarea"
            />
            <div className="char-count">{remainingChars} characters remaining</div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading || !content.trim()}
            >
              <Send size={18} />
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePostModal;
