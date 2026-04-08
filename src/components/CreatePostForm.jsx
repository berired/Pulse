import { useState } from 'react';
import { Send } from 'lucide-react';
import './CreatePostForm.css';

const CATEGORIES = [
  'Clinical Stress',
  'Exam Prep',
  'Venting',
  'Study Tips',
  'Career Advice',
  'General Discussion',
];

function CreatePostForm({ onSubmit, isLoading }) {
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
  };

  const remainingChars = 5000 - content.length;

  return (
    <div className="create-post-form">
      <h3>Start a Discussion</h3>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
            rows="4"
          />
          <div className="char-count">{remainingChars} characters remaining</div>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading || !content.trim()}>
          <Send size={18} />
          {isLoading ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}

export default CreatePostForm;
