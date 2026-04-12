import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSchedules, useClinicalRotations, useCreateSchedule, useUpdateSchedule, useDeleteSchedule, useCreateClinicalRotation, useUpdateClinicalRotation, useDeleteClinicalRotation, useCreateCareplan } from '../hooks/useQueries';
import ScheduleCalendar from '../components/ScheduleCalendar';
import EventCreateModal from '../components/EventCreateModal';
import EventDetailsModal from '../components/EventDetailsModal';
import RotationCreateModal from '../components/RotationCreateModal';
import RotationDetailsModal from '../components/RotationDetailsModal';
import CarePlanBuilder from '../components/CarePlanBuilder';
import CarePlanCreateModal from '../components/CarePlanCreateModal';
import MagicBento from '../components/MagicBento';
import { Plus } from 'lucide-react';
import './ClinicalCommandCenter.css';

function ClinicalCommandCenter() {
  const { user } = useAuth();
  const gridRef = useRef(null);
  const carePlanBuilderRef = useRef(null);
  
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

  // Care Plan states
  const [isCarePlanModalOpen, setIsCarePlanModalOpen] = useState(false);

  const { data: schedules = [] } = useSchedules(user.id);
  const { data: rotations = [] } = useClinicalRotations(user.id);
  const createScheduleMutation = useCreateSchedule();
  const updateScheduleMutation = useUpdateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  
  // Rotation mutations
  const createRotationMutation = useCreateClinicalRotation();
  const updateRotationMutation = useUpdateClinicalRotation();
  const deleteRotationMutation = useDeleteClinicalRotation();

  // Care Plan mutations
  const createCarePlanMutation = useCreateCareplan();

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

  // Care Plan Handlers
  const handleCreateCareplan = async (formData) => {
    try {
      await createCarePlanMutation.mutateAsync({
        userId: user.id,
        patient_name: formData.patientName,
        template_type: formData.templateType,
        content: formData.content,
      });

      setIsCarePlanModalOpen(false);
    } catch (error) {
      console.error('Error creating care plan:', error);
      alert('Failed to create care plan. Please try again.');
    }
  };

  const handleCloseCarePlanModal = () => {
    setIsCarePlanModalOpen(false);
  };

  return (
    <div className="clinical-command-center">
      <header className="center-header">
        <div className="header-content">
          <h1>Clinical Command Center</h1>
          <p>Manage schedules, rotations, and care plans</p>
        </div>
      </header>

      <MagicBento
        textAutoHide={true}
        enableStars={false}
        enableSpotlight={true}
        enableBorderGlow={true}
        enableTilt={false}
        enableMagnetism={false}
        clickEffect={true}
        spotlightRadius={540}
        particleCount={12}
        glowColor="13, 148, 136"
        disableAnimations={false}
      >
        {/* Rotations Card - Top Left */}
        <div className="bento-card bento-card--rotations">
          <div className="bento-card-header">
            <h2>Clinical Rotations</h2>
            <button
              className="btn-add-bento"
              onClick={() => {
                setEditRotationData(null);
                setShowRotationCreateModal(true);
              }}
              title="Add new rotation"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="bento-card-content rotations-list">
            {rotations.length > 0 ? (
              rotations.slice(0, 3).map((rotation) => (
                <div
                  key={rotation.id}
                  className="rotation-item"
                  onClick={() => handleRotationClick(rotation)}
                >
                  <div className="rotation-item-title">{rotation.hospital_name}</div>
                  <span className={`rotation-status status-${rotation.status?.toLowerCase().replace(' ', '-')}`}>
                    {rotation.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="empty-message">No rotations yet</p>
            )}
          </div>
        </div>

        {/* Calendar Card - Right Side, Larger */}
        <div className="bento-card bento-card--calendar">
          <div className="bento-card-header">
            <h2>Schedule</h2>
          </div>

          <div className="bento-card-content calendar-content">
            <ScheduleCalendar
              events={schedules}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
            />
          </div>
        </div>

        {/* Care Plans Card - Bottom Left, Larger */}
        <div className="bento-card bento-card--careplans">
          <div className="bento-card-header">
            <h2>Care Plans</h2>
            <button
              className="btn-add-bento"
              onClick={() => setIsCarePlanModalOpen(true)}
              title="Add new care plan"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="bento-card-content careplan-content">
            <CarePlanBuilder ref={carePlanBuilderRef} />
          </div>
        </div>
      </MagicBento>

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

      {/* Care Plan Modal */}
      <CarePlanCreateModal
        isOpen={isCarePlanModalOpen}
        onClose={handleCloseCarePlanModal}
        onSubmit={handleCreateCareplan}
        isLoading={createCarePlanMutation.isPending}
      />
    </div>
  );
}

export default ClinicalCommandCenter;
