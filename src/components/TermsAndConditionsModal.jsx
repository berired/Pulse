import './TermsAndConditionsModal.css';

export default function TermsAndConditionsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Terms and Conditions</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="terms-body">
          <section>
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing and using Pulse, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h3>2. Use License</h3>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Pulse 
              for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, 
              and under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on Pulse</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or 'mirror' the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h3>3. Disclaimer</h3>
            <p>
              The materials on Pulse are provided on an 'as is' basis. Pulse makes no warranties, expressed or implied, 
              and hereby disclaims and negates all other warranties including, without limitation, implied warranties or 
              conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property 
              or other violation of rights.
            </p>
          </section>

          <section>
            <h3>4. Limitations</h3>
            <p>
              In no event shall Pulse or its suppliers be liable for any damages (including, without limitation, damages 
              for loss of data or profit, or due to business interruption) arising out of the use or inability to use the 
              materials on Pulse, even if Pulse or an authorized representative has been notified orally or in writing of 
              the possibility of such damage.
            </p>
          </section>

          <section>
            <h3>5. Accuracy of Materials</h3>
            <p>
              The materials appearing on Pulse could include technical, typographical, or photographic errors. Pulse does 
              not warrant that any of the materials on Pulse are accurate, complete, or current. Pulse may make changes to 
              the materials contained on Pulse at any time without notice.
            </p>
          </section>

          <section>
            <h3>6. Materials and Content</h3>
            <p>
              You understand that all content posted on Pulse, whether publicly posted or privately transmitted, is the sole 
              responsibility of the person from which such content originated. This means that you are entirely responsible for 
              all content that you upload, post, email, or otherwise transmit via Pulse.
            </p>
          </section>

          <section>
            <h3>7. User Accounts</h3>
            <p>
              If you create an account on Pulse, you are responsible for maintaining the confidentiality of your account information 
              and password and for restricting access to your computer. You agree to accept responsibility for all activities that 
              occur under your account or password.
            </p>
          </section>

          <section>
            <h3>8. Prohibited Conduct</h3>
            <p>
              You agree that you will not use Pulse for any unlawful purpose or in any way that violates these Terms and Conditions. 
              Specifically, you agree not to use Pulse to:
            </p>
            <ul>
              <li>Harass, abuse, or threaten others</li>
              <li>Violate any intellectual property rights</li>
              <li>Post obscene or abusive content</li>
              <li>Attempt to gain unauthorized access to systems or networks</li>
              <li>Spam or flood the platform with unsolicited messages</li>
            </ul>
          </section>

          <section>
            <h3>9. Modifications to Terms</h3>
            <p>
              Pulse may revise these Terms and Conditions for Pulse at any time without notice. By using this site, you are 
              agreeing to be bound by the then current version of these Terms and Conditions.
            </p>
          </section>

          <section>
            <h3>10. Governing Law</h3>
            <p>
              These Terms and Conditions are governed by and construed in accordance with the applicable laws, and you irrevocably 
              submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h3>11. Contact Information</h3>
            <p>
              If you have any questions about these Terms and Conditions, please contact us through the support channel on Pulse.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
