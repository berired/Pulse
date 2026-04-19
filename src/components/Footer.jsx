import { useState } from 'react';
import ReportModal from './ReportModal';
import './Footer.css';

export default function Footer() {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <button 
            className="report-button"
            onClick={() => setShowReportModal(true)}
          >
            Report an Issue
          </button>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Pulse. All rights reserved.</p>
        </div>
      </footer>
      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)} 
      />
    </>
  );
}
