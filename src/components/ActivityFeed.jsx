import React from 'react';
import { BookOpen, MessageCircle, ThumbsUp } from 'lucide-react';
import './ActivityFeed.css';

const ActivityFeed = ({ notes = [], posts = [] }) => {
  const activities = [
    ...notes.slice(0, 3).map((note) => ({
      id: note.id,
      type: 'note',
      title: note.title,
      subtitle: note.subject,
      time: new Date(note.created_at).toLocaleDateString(),
      icon: <BookOpen size={18} />,
    })),
    ...posts.slice(0, 3).map((post) => ({
      id: post.id,
      type: 'post',
      title: post.content.substring(0, 60) + '...',
      subtitle: post.category,
      time: new Date(post.created_at).toLocaleDateString(),
      icon: <MessageCircle size={18} />,
    })),
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  if (activities.length === 0) {
    return (
      <div className="activity-empty">
        <ThumbsUp size={32} />
        <p>No recent activity yet</p>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {activities.map((activity) => (
        <div key={activity.id} className="activity-item">
          <div className="activity-icon">{activity.icon}</div>
          <div className="activity-details">
            <h4 className="activity-title">{activity.title}</h4>
            <p className="activity-subtitle">{activity.subtitle}</p>
          </div>
          <span className="activity-time">{activity.time}</span>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
