import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCreateWikiPage, useWikiPagesByUser } from '../hooks/useQueries';
import TiptapEditor from '../components/TiptapEditor';
import { Plus, ArrowLeft, Save, FileText } from 'lucide-react';
import './WikiEditor.css';

const WikiEditor = ({ onBack }) => {
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Form state for new page
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: null,
    isPublic: false,
  });

  const createWikiPageMutation = useCreateWikiPage();
  const { data: wikiPages = [] } = useWikiPagesByUser(user?.id);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'title') {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleTogglePublic = () => {
    setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter page title');
      return;
    }

    try {
      await createWikiPageMutation.mutateAsync({
        userId: user.id,
        ...formData,
      });
      setFormData({
        title: '',
        slug: '',
        content: null,
        isPublic: false,
      });
      setIsCreating(false);
      alert('Wiki page created successfully!');
    } catch (error) {
      console.error('Error creating wiki page:', error);
      alert('Failed to create wiki page');
    }
  };

  return (
    <div className="wiki-editor">
      <div className="wiki-header">
        <button onClick={onBack} className="btn-back">
          <ArrowLeft size={20} />
          Back
        </button>
        <h2>Personal Wiki</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn-create"
          >
            <Plus size={20} />
            New Page
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="wiki-form-wrapper">
          <form onSubmit={handleSubmit} className="wiki-form">
            <div className="form-group">
              <label htmlFor="title">Page Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter page title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="slug">URL Slug</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="(auto-generated)"
                readOnly
              />
              <p className="slug-hint">Auto-generated from title</p>
            </div>

            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={handleTogglePublic}
              />
              <label htmlFor="isPublic">Make this page public</label>
              <p className="checkbox-hint">
                Public pages can be viewed by other students
              </p>
            </div>

            <div className="form-group">
              <label>Page Content</label>
              <TiptapEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Start writing your wiki page..."
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={createWikiPageMutation.isPending}
              >
                <Save size={18} />
                {createWikiPageMutation.isPending
                  ? 'Saving...'
                  : 'Save Page'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="wiki-pages">
          {wikiPages.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>No wiki pages yet</p>
              <p className="text-muted">
                Create your first wiki page to build your knowledge base
              </p>
            </div>
          ) : (
            <div className="pages-grid">
              {wikiPages.map((page) => (
                <div key={page.id} className="wiki-page-item">
                  <div className="page-icon">
                    <FileText size={24} />
                  </div>
                  <h3>{page.title}</h3>
                  <p className="page-slug">/{page.slug}</p>
                  {page.is_public && <span className="public-badge">Public</span>}
                  <p className="text-muted">
                    Updated: {new Date(page.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WikiEditor;
