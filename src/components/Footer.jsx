import { useState } from 'react';
import ReportModal from './ReportModal';
import './Footer.css';

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          <button
            onClick={() => setIsModalOpen(true)}
            className="report-issue-btn"
          >
            📋 Report an Issue
          </button>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Pulse. All rights reserved.</p>
        </div>
      </footer>

      <ReportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
