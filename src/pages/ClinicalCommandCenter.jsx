import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSchedules, useClinicalRotations, useCreateSchedule, useUpdateSchedule, useDeleteSchedule, useCreateClinicalRotation, useUpdateClinicalRotation, useDeleteClinicalRotation } from '../hooks/useQueries';
import ScheduleCalendar from '../components/ScheduleCalendar';
import EventCreateModal from '../components/EventCreateModal';
import EventDetailsModal from '../components/EventDetailsModal';
import RotationCreateModal from '../components/RotationCreateModal';
import RotationDetailsModal from '../components/RotationDetailsModal';
import KanbanBoard from '../components/KanbanBoard';
import CarePlanBuilder from '../components/CarePlanBuilder';
import WikiEditor from '../components/WikiEditor';
import { Calendar, BookOpen, ClipboardList, FileText, Plus } from 'lucide-react';
import './ClinicalCommandCenter.css';

const TABS = [
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'rotations', label: 'Rotations', icon: ClipboardList },
  { id: 'care-plans', label: 'Care Plans', icon: FileText },
  { id: 'wiki', label: 'Personal Wiki', icon: BookOpen },
];

function ClinicalCommandCenter() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editEventData, setEditEventData] = useState(null);
  
  // Rotation states
  const [showRotationCreateModal, setShowRotationCreateModal] = useState(false);
  const [showRotationDetailsModal, setShowRotationDetailsModal] = useState(false);
  const [selectedRotation, setSelectedRotation] = useState(null);
  const [editRotationData, setEditRotationData] = useState(null);

  const { data: schedules = [] } = useSchedules(user.id);
  const { data: rotations = [] } = useClinicalRotations(user.id);
  const createScheduleMutation = useCreateSchedule();
  const updateScheduleMutation = useUpdateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  
  // Rotation mutations
  const createRotationMutation = useCreateClinicalRotation();
  const updateRotationMutation = useUpdateClinicalRotation();
  const deleteRotationMutation = useDeleteClinicalRotation();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCreateModal(true);
  };

  const handleEventClick = (event) => {
    // Transform database event format to modal format
    const startDate = new Date(event.start_time);
    const endDate = new Date(event.end_time);

    const formattedEvent = {
      title: event.event_name,
      date: startDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: event.is_all_day
        ? 'All Day'
        : `${startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })} - ${endDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })}`,
      isAllDay: event.is_all_day,
      location: event.location,
      description: event.description,
      rawEvent: event, // Store raw event for editing
    };

    setSelectedEvent(formattedEvent);
    setShowDetailsModal(true);
  };

  const handleCreateEvent = async (formData) => {
    try {
      // Convert form data to database format
      const date = formData.date; // YYYY-MM-DD
      const startTime = formData.startTime; // HH:MM (24-hour)
      const endTime = formData.endTime; // HH:MM (24-hour)

      // Create ISO 8601 timestamps
      const startDateTime = `${date}T${startTime}:00`;
      const endDateTime = `${date}T${endTime}:00`;

      if (editEventData) {
        // Update existing event
        const eventData = {
          id: editEventData.id,
          event_name: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          start_time: startDateTime,
          end_time: endDateTime,
          is_all_day: formData.isAllDay,
        };

        await updateScheduleMutation.mutateAsync(eventData);
      } else {
        // Create new event
        const eventData = {
          user_id: user.id,
          event_name: formData.title,
          description: formData.description || null,
          location: formData.location || null,
          start_time: startDateTime,
          end_time: endDateTime,
          is_all_day: formData.isAllDay,
          event_type: 'class', // Default type; could be extended to form
        };

        await createScheduleMutation.mutateAsync(eventData);
      }

      setShowCreateModal(false);
      setSelectedDate(null);
      setEditEventData(null);
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleEditEvent = (formattedEvent) => {
    // Extract raw event from formatted event
    const rawEvent = formattedEvent.rawEvent;
    setEditEventData(rawEvent);
    setShowDetailsModal(false);
    setShowCreateModal(true);
  };

  const handleDeleteEvent = async (formattedEvent) => {
    try {
      const eventId = formattedEvent.rawEvent.id;
      await deleteScheduleMutation.mutateAsync(eventId);
      setShowDetailsModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSelectedDate(null);
    setEditEventData(null);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEvent(null);
  };

  // Rotation Handlers
  const handleCreateRotation = async (formData) => {
    try {
      const rotationData = {
        user_id: user.id,
        hospital_name: formData.hospital_name,
        hospital_location: formData.hospital_location,
        ward: formData.ward,
        time_period: formData.time_period,
        description: formData.description,
        status: formData.status,
        // Legacy fields for compatibility
        title: formData.hospital_name,
      };

      if (editRotationData) {
        // Update existing rotation
        const updateData = {
          id: editRotationData.id,
          ...rotationData,
        };
        await updateRotationMutation.mutateAsync(updateData);
      } else {
        // Create new rotation
        await createRotationMutation.mutateAsync(rotationData);
      }

      setShowRotationCreateModal(false);
      setEditRotationData(null);
      setShowRotationDetailsModal(false);
    } catch (error) {
      console.error('Error saving rotation:', error);
      alert('Failed to save rotation. Please try again.');
    }
  };

  const handleRotationClick = (rotation) => {
    setSelectedRotation(rotation);
    setShowRotationDetailsModal(true);
  };

  const handleEditRotation = (rotation) => {
    setEditRotationData(rotation);
    setShowRotationDetailsModal(false);
    setShowRotationCreateModal(true);
  };

  const handleDeleteRotation = async (rotation) => {
    try {
      await deleteRotationMutation.mutateAsync(rotation.id);
      setShowRotationDetailsModal(false);
      setSelectedRotation(null);
    } catch (error) {
      console.error('Error deleting rotation:', error);
      alert('Failed to delete rotation. Please try again.');
    }
  };

  const handleCloseRotationCreateModal = () => {
    setShowRotationCreateModal(false);
    setEditRotationData(null);
  };

  const handleCloseRotationDetailsModal = () => {
    setShowRotationDetailsModal(false);
    setSelectedRotation(null);
  };

  return (
    <div className="clinical-command-center">
      <header className="center-header">
        <div className="header-content">
          <h1>Clinical Command Center</h1>
          <p>Manage schedules, rotations, care plans, and clinical notes</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-navigation">
        {TABS.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent size={20} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="center-container">
        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <section className="tab-content">
            <h2>Your Schedule</h2>
            <ScheduleCalendar
              events={schedules}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
            />

            {selectedDate && !showCreateModal && (
              <div className="selected-date-events">
                <h3>{selectedDate.toLocaleDateString()}</h3>
                <div className="events-list">
                  {schedules
                    .filter((s) =>
                      new Date(s.start_time).toDateString() === selectedDate.toDateString()
                    )
                    .map((event) => (
                      <div key={event.id} className="event-card">
                        <h4>{event.event_name}</h4>
                        {event.description && <p>{event.description}</p>}
                        <p className="event-time">
                          {new Date(event.start_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(event.end_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {event.location && (
                          <p className="event-location">📍 {event.location}</p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Rotations Tab */}
        {activeTab === 'rotations' && (
          <section className="tab-content">
            <div className="section-header">
              <h2>Clinical Rotations</h2>
              <button
                className="btn-add-rotation"
                onClick={() => {
                  setEditRotationData(null);
                  setShowRotationCreateModal(true);
                }}
              >
                <Plus size={20} />
                Add Rotation
              </button>
            </div>

            {rotations.length > 0 ? (
              <div className="rotations-grid">
                {rotations.map((rotation) => (
                  <div
                    key={rotation.id}
                    className="rotation-card"
                    onClick={() => handleRotationClick(rotation)}
                  >
                    <div className="rotation-card-header">
                      <h3>{rotation.hospital_name}</h3>
                      <span className={`rotation-status status-${rotation.status?.toLowerCase().replace(' ', '-')}`}>
                        {rotation.status}
                      </span>
                    </div>

                    <div className="rotation-card-content">
                      <div className="rotation-field">
                        <label>Location</label>
                        <p>{rotation.hospital_location}</p>
                      </div>

                      <div className="rotation-field">
                        <label>Ward</label>
                        <p>{rotation.ward}</p>
                      </div>

                      <div className="rotation-field">
                        <label>Time</label>
                        <p>{rotation.time_period}</p>
                      </div>

                      {rotation.description && (
                        <div className="rotation-field">
                          <label>Task</label>
                          <p className="description-preview">{rotation.description.substring(0, 100)}...</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No clinical rotations yet. Click the "Add Rotation" button to create your first rotation!</p>
              </div>
            )}
          </section>
        )}

        {/* Care Plans Tab */}
        {activeTab === 'care-plans' && (
          <section className="tab-content">
            <CarePlanBuilder onBack={() => setActiveTab('schedule')} />
          </section>
        )}

        {/* Personal Wiki Tab */}
        {activeTab === 'wiki' && (
          <section className="tab-content">
            <WikiEditor onBack={() => setActiveTab('schedule')} />
          </section>
        )}
      </div>

      {/* Event Modals */}
      {showCreateModal && (
        <EventCreateModal
          selectedDate={selectedDate}
          onClose={handleCloseCreateModal}
          onSubmit={handleCreateEvent}
          editEvent={editEventData}
        />
      )}

      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={handleCloseDetailsModal}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Rotation Modals */}
      <RotationCreateModal
        isOpen={showRotationCreateModal}
        onClose={handleCloseRotationCreateModal}
        onSubmit={handleCreateRotation}
        editRotation={editRotationData}
        isLoading={
          createRotationMutation.isPending || updateRotationMutation.isPending
        }
      />

      <RotationDetailsModal
        rotation={selectedRotation}
        isOpen={showRotationDetailsModal}
        onClose={handleCloseRotationDetailsModal}
        onEdit={handleEditRotation}
        onDelete={handleDeleteRotation}
        isLoading={deleteRotationMutation.isPending}
      />
    </div>
  );
}

export default ClinicalCommandCenter;
