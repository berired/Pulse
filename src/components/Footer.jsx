import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportModal from './ReportModal';
import TermsAndConditionsModal from './TermsAndConditionsModal';
import './Footer.css';

export default function Footer() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const navigate = useNavigate();

  const navigationLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Study Guides', path: '/knowledge-exchange' },
    { label: 'Messages', path: '/messaging' },
    { label: 'Breakroom', path: '/breakroom' },
  ];

  const handleLinkClick = (path) => {
    navigate(path);
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-column">
            <h3 className="footer-title">Pulse</h3>
            <p className="footer-description">
              A comprehensive clinical collaboration platform for healthcare professionals.
            </p>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Navigation</h4>
            <nav className="footer-links">
              {navigationLinks.map((link) => (
                <button
                  key={link.path}
                  className="footer-link"
                  onClick={() => handleLinkClick(link.path)}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Support</h4>
            <div className="footer-support">
              <button 
                className="footer-link"
                onClick={() => setShowReportModal(true)}
              >
                Report an Issue
              </button>
              <button 
                className="footer-link"
                onClick={() => setShowTermsModal(true)}
              >
                Terms & Conditions
              </button>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p>&copy; 2026 Pulse. All rights reserved.</p>
        </div>
      </footer>

      <ReportModal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)} 
      />
      
      <TermsAndConditionsModal 
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)} 
      />
    </>
  );
}
