import { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import './EventCreateModal.css';

function EventCreateModal({ selectedDate, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    startPeriod: 'AM',
    endPeriod: 'AM',
    isAllDay: false,
    location: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter an event title');
      return;
    }

    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      startPeriod: 'AM',
      endPeriod: 'AM',
      isAllDay: false,
      location: '',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Event</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter event description (optional)"
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter location (optional)"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isAllDay"
                checked={formData.isAllDay}
                onChange={handleInputChange}
              />
              All Day Event
            </label>
          </div>

          {!formData.isAllDay && (
            <div className="time-group">
              <div className="time-inputs">
                <div className="time-input">
                  <label htmlFor="startTime">From</label>
                  <div className="time-wrapper">
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                    <select
                      name="startPeriod"
                      value={formData.startPeriod}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div className="time-input">
                  <label htmlFor="endTime">To</label>
                  <div className="time-wrapper">
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                    <select
                      name="endPeriod"
                      value={formData.endPeriod}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventCreateModal;
