import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { Calendar, Plus } from 'lucide-react';
import './ScheduleCalendar.css';

function ScheduleCalendar({ events, onDateSelect, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayEvents = (day) => {
    return events.filter((event) => isSameDay(new Date(event.start_time), day));
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <div className="schedule-calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-btn">
          ←
        </button>
        <h3>{format(currentDate, 'MMMM yyyy')}</h3>
        <button onClick={handleNextMonth} className="nav-btn">
          →
        </button>
      </div>

      {/* Day names */}
      <div className="calendar-weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="weekday-name">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid">
        {daysInMonth.map((day) => {
          const dayEvents = getDayEvents(day);
          const isCurrentMonth = isSameMonth(day, currentDate);

          return (
            <div
              key={day.toString()}
              className={`calendar-day ${isCurrentMonth ? '' : 'other-month'}`}
              onClick={() => onDateSelect?.(day)}
            >
              <div className="day-number">{format(day, 'd')}</div>
              <div className="day-events">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="event-dot"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                    title={event.event_name}
                  />
                ))}
                {dayEvents.length > 2 && (
                  <div className="more-events">+{dayEvents.length - 2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScheduleCalendar;
