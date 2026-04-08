import { useState, useCallback } from 'react';
import { Upload, X, Star } from 'lucide-react';
import './NoteUploadForm.css';

const SUBJECTS = [
  'Anatomy and Physiology',
  'Physiology',
  'Pharmacology',
  'Microbiology',
  'Biochemistry',
  'Diagnostics',
  'Psychology',
  'Maternal',
  'Geriatrics',
  'OB-GYN',
  'Medical Surgical',
  'Nursing Research',
  'Community Health Nursing',
  'Others',
];

function NoteUploadForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    year_level: 1,
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customSubject, setCustomSubject] = useState('');
  const [isOthersSelected, setIsOthersSelected] = useState(false);

  // Browser-side image compression
  const compressImage = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1200;
          const maxHeight = 800;

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.8);
        };
      };
    });
  }, []);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      setError(null);
      const compressed = await compressImage(selectedFile);
      setFile(compressed);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(compressed);
    } catch (err) {
      setError('Failed to process image');
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'subject') {
      setIsOthersSelected(value === 'Others');
      if (value !== 'Others') {
        setCustomSubject('');
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year_level' ? parseInt(value) : value,
    }));
  };

  const handleCustomSubjectChange = (e) => {
    setCustomSubject(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.title || !file) {
        throw new Error('Please fill in all required fields');
      }

      // Use custom subject if "Others" is selected, otherwise use formData.subject
      const finalSubject = isOthersSelected ? customSubject : formData.subject;
      
      if (!finalSubject) {
        throw new Error('Please select a subject or enter a custom subject');
      }

      // Call parent callback with form data
      if (onSuccess) {
        await onSuccess({
          ...formData,
          subject: finalSubject,
          file,
        });
      }

      // Reset form
      setFormData({
        title: '',
        subject: '',
        description: '',
        year_level: 1,
      });
      setFile(null);
      setPreview(null);
      setCustomSubject('');
      setIsOthersSelected(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="note-upload-form">
      <h2>Upload Study Guide</h2>

      <form onSubmit={handleSubmit}>
        {/* Title Field */}
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Cardiac Physiology Mnemonics"
            required
          />
        </div>

        {/* Subject Dropdown */}
        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a subject...</option>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Subject Input */}
        {isOthersSelected && (
          <div className="form-group">
            <label htmlFor="customSubject">Enter Custom Subject *</label>
            <input
              id="customSubject"
              type="text"
              value={customSubject}
              onChange={handleCustomSubjectChange}
              placeholder="e.g., Specialized Nursing Care"
              required
            />
          </div>
        )}

        {/* Year Level Dropdown */}
        <div className="form-group">
          <label htmlFor="year_level">Year Level *</label>
          <select
            id="year_level"
            name="year_level"
            value={formData.year_level}
            onChange={handleInputChange}
          >
            {[1, 2, 3, 4].map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Brief description of your study guide..."
            rows="4"
          />
        </div>

        {/* File Upload */}
        <div className="form-group">
          <label htmlFor="file">Upload File *</label>
          <div className="file-upload-box">
            {preview ? (
              <div className="file-preview">
                <img src={preview} alt="Preview" className="preview-image" />
                <button
                  type="button"
                  className="clear-preview-btn"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label htmlFor="file" className="upload-label">
                <Upload size={32} />
                <p>Click to upload or drag and drop</p>
                <p className="file-hint">PNG, JPG up to 10MB</p>
              </label>
            )}
            <input
              id="file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Submit Button */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Study Guide'}
        </button>
      </form>
    </div>
  );
}

export default NoteUploadForm;
