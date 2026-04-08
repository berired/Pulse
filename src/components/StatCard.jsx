import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, title, value, color, description }) => {
  return (
    <div className="stat-card" style={{ '--card-color': color }}>
      <div className="stat-icon" style={{ backgroundColor: `${color}20` }}>
        <span style={{ color }}>
          {icon}
        </span>
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
        <p className="stat-description">{description}</p>
      </div>
    </div>
  );
};

export default StatCard;
