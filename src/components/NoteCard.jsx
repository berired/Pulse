import { Star, Download, Trash2 } from 'lucide-react';
import './NoteCard.css';

function NoteCard({ note, onRate, onDelete, currentUserId }) {
  const isAuthor = currentUserId === note.author_id;

  return (
    <div className="note-card">
      {note.file_url && (
        <div className="note-image">
          <img src={note.file_url} alt={note.title} />
        </div>
      )}

      <div className="note-content">
        <h3>{note.title}</h3>

        <div className="note-meta">
          <span className="subject-badge">{note.subject}</span>
          <span className="year-badge">Year {note.year_level}</span>
        </div>

        {note.description && <p className="note-description">{note.description}</p>}

        <div className="note-footer">
          <div className="author-info">
            {note.profiles?.avatar_url && (
              <img
                src={note.profiles.avatar_url}
                alt={note.profiles.username}
                className="author-avatar"
              />
            )}
            <span className="author-name">{note.profiles?.username}</span>
          </div>

          <div className="note-actions">
            <button
              className="rating-btn"
              onClick={() => onRate?.(note.id)}
              title={`Rating: ${note.rating_average || 0}`}
            >
              <Star size={18} fill={note.rating_average ? '#0D9488' : 'none'} />
              {note.rating_average ? note.rating_average.toFixed(1) : 'Rate'}
            </button>

            {note.file_url && (
              <a
                href={note.file_url}
                download
                className="action-btn"
                title="Download"
              >
                <Download size={18} />
              </a>
            )}

            {isAuthor && (
              <button
                className="action-btn delete-btn"
                onClick={() => onDelete?.(note.id)}
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="note-stats">
          <small>{note.view_count || 0} views</small>
          <small>{new Date(note.created_at).toLocaleDateString()}</small>
        </div>
      </div>
    </div>
  );
}

export default NoteCard;
