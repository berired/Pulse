import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useQueries';
import { supabase, storageService } from '../services/supabase';
import NoteUploadForm from '../components/NoteUploadForm';
import NoteCard from '../components/NoteCard';
import FilterSidebar from '../components/FilterSidebar';
import './KnowledgeExchange.css';

function KnowledgeExchange() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search: '',
    subject: '',
    yearLevel: null,
  });

  const [sortBy, setSortBy] = useState('date');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  // Fetch notes
  const { data: notes = [], isLoading: notesLoading } = useNotes(filters);

  // Sort notes
  const sortedNotes = [...notes].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.rating_average || 0) - (a.rating_average || 0);
    } else if (sortBy === 'views') {
      return (b.view_count || 0) - (a.view_count || 0);
    }
    // Default: date
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (noteData) => {
      const { file, ...formData } = noteData;

      // Upload file to Supabase Storage
      let fileUrl = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `notes/${user.id}/${Date.now()}.${fileExt}`;

        fileUrl = await storageService.uploadFile('notes', fileName, file);
      }

      // Save note to database
      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            author_id: user.id,
            ...formData,
            file_url: fileUrl,
            file_path: fileUrl ? `notes/${user.id}/${Date.now()}` : null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setShowUploadForm(false);
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId) => {
      const { error } = await supabase.from('notes').delete().eq('id', noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  // Rate note mutation
  const rateNoteMutation = useMutation({
    mutationFn: async ({ noteId, rating }) => {
      // Check if user already rated
      const { data: existingRating } = await supabase
        .from('note_ratings')
        .select('id')
        .eq('note_id', noteId)
        .eq('user_id', user.id)
        .single();

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from('note_ratings')
          .update({ rating })
          .eq('note_id', noteId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase.from('note_ratings').insert([
          {
            note_id: noteId,
            user_id: user.id,
            rating,
          },
        ]);

        if (error) throw error;
      }

      // Recalculate average rating
      const { data: ratings } = await supabase
        .from('note_ratings')
        .select('rating')
        .eq('note_id', noteId);

      if (ratings && ratings.length > 0) {
        const average =
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

        await supabase
          .from('notes')
          .update({ rating_average: average })
          .eq('id', noteId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const handleUploadNote = useCallback(
    async (noteData) => {
      await createNoteMutation.mutateAsync(noteData);
    },
    [createNoteMutation]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  return (
    <div className="knowledge-exchange">
      <header className="knowledge-header">
        <div className="header-content">
          <h1>Knowledge Exchange</h1>
          <p>Share and discover study guides, mnemonics, and clinical notes</p>
        </div>
        <button
          className="upload-btn-primary"
          onClick={() => setShowUploadForm(!showUploadForm)}
        >
          {showUploadForm ? 'Cancel' : '+ Upload Study Guide'}
        </button>
      </header>

      <div className="knowledge-container">
        {/* Upload Form */}
        {showUploadForm && (
          <section className="upload-section">
            <NoteUploadForm onSuccess={handleUploadNote} />
          </section>
        )}

        {/* Main Content */}
        <div className="knowledge-main">
          {/* Search Bar */}
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search study guides..."
              value={searchInput}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          {/* Filter Sidebar + Notes Grid */}
          <div className="content-wrapper">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <section className="notes-section">
              {notesLoading ? (
                <div className="loading">Loading study guides...</div>
              ) : sortedNotes.length === 0 ? (
                <div className="empty-state">
                  <p>No study guides found. Be the first to share!</p>
                </div>
              ) : (
                <div className="notes-grid">
                  {sortedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      currentUserId={user.id}
                      onRate={(noteId) =>
                        rateNoteMutation.mutate({ noteId, rating: 5 })
                      }
                      onDelete={(noteId) =>
                        deleteNoteMutation.mutate(noteId)
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeExchange;
