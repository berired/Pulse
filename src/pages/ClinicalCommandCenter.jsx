import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSchedules, useClinicalRotations, useCreateSchedule } from '../hooks/useQueries';
import ScheduleCalendar from '../components/ScheduleCalendar';
import EventCreateModal from '../components/EventCreateModal';
import EventDetailsModal from '../components/EventDetailsModal';
import KanbanBoard from '../components/KanbanBoard';
import CarePlanBuilder from '../components/CarePlanBuilder';
import WikiEditor from '../components/WikiEditor';
import { Calendar, BookOpen, ClipboardList, FileText } from 'lucide-react';
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

  const { data: schedules = [] } = useSchedules(user.id);
  const { data: rotations = [] } = useClinicalRotations(user.id);
  const createScheduleMutation = useCreateSchedule();

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
      setShowCreateModal(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSelectedDate(null);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedEvent(null);
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
            <h2>Clinical Rotations</h2>
            {rotations.length > 0 ? (
              <div className="rotations-container">
                {rotations.map((rotation) => (
                  <div key={rotation.id} className="rotation-panel">
                    <h3>{rotation.title}</h3>
                    <p className="rotation-type">{rotation.rotation_type}</p>
                    <p className="rotation-dates">
                      {rotation.start_date && rotation.end_date
                        ? `${new Date(rotation.start_date).toLocaleDateString()} - ${new Date(
                            rotation.end_date
                          ).toLocaleDateString()}`
                        : 'No dates set'}
                    </p>
                    <span className={`rotation-status ${rotation.status?.toLowerCase()}`}>
                      {rotation.status}
                    </span>

                    {rotation.rotation_tasks && rotation.rotation_tasks.length > 0 && (
                      <div className="rotation-tasks">
                        <h4>Tasks:</h4>
                        <KanbanBoard
                          tasks={rotation.rotation_tasks}
                          onAddTask={() => {}}
                          onDeleteTask={() => {}}
                          onTaskMove={() => {}}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No clinical rotations yet. Create your first rotation!</p>
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
        />
      )}

      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={handleCloseDetailsModal}
        />
      )}
    </div>
  );
}

export default ClinicalCommandCenter;
