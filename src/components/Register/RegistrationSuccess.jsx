import { useState } from 'react';
import ticketBgImg from '../../frame/00144.webp';

/**
 * RegistrationSuccess:
 * Displays the successful registration confirmation on Frame 240 background.
 * Exact Requirements:
 * ✓ Registration Confirmed
 * Welcome, [Participant Name]!
 * Your registration has been successfully completed.
 * Displays:
 * - Competition
 * - Ticket ID (CTF-2026-00001 / WEB-2026-00001)
 * - Registered Email (Confirmation email sent to participant@gmail.com)
 * - "Please check your inbox and spam/junk folder for your confirmation email."
 * - Pure Frame 00144.webp background (NO overlay layers on top of background image)
 * - Buttons at bottom: [Back to Home] [Download Ticket]
 */
export default function RegistrationSuccess({ registration, onBackToHome }) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!registration) {
    return (
      <div className="reg-success-container">
        <div className="citadel-pass-card pass-ctf" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3 className="pass-event" style={{ marginBottom: '16px' }}>NO REGISTRATION RECORD FOUND</h3>
          <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
            No registration details found in this session. Please select a competition track and complete the registration form.
          </p>
          <button type="button" onClick={onBackToHome} className="btn-back-home-primary" style={{ margin: '0 auto' }}>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    );
  }
  const isCTF = registration.track === 'CTF' || (registration.competition && registration.competition.includes('CTF'));
  const competitionName = registration.competition || (isCTF ? 'CTF Competition' : 'Web Development Competition');
  const ticketId = registration.ticketId || registration.regId || (isCTF ? 'CTF-2026-00001' : 'WEB-2026-00001');
  const isEmailSent = registration.emailSent !== false;

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const cardElement = document.getElementById('citadel-pass-card');
      if (!cardElement) {
        window.print();
        return;
      }

      // Lazy load html2canvas and jsPDF on demand to keep initial bundle lean and fast
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      // Render high resolution snapshot of ticket pass
      const canvas = await html2canvas(cardElement, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#040b07',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 landscape width (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [imgWidth + 20, imgHeight + 20],
      });

      pdf.setFillColor(4, 11, 7);
      pdf.rect(0, 0, imgWidth + 20, imgHeight + 20, 'F');
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);

      const safeTicketId = ticketId.replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`SEUSL_HASHCORE_2026_Ticket_${safeTicketId}.pdf`);
    } catch (err) {
      console.warn('Direct PDF download fallback to window.print():', err);
      const originalTitle = document.title;
      const safeId = ticketId.replace(/[^a-zA-Z0-9_-]/g, '_');
      document.title = `HASHCORE_2026_Citadel_${safeId}.pdf`;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="reg-success-container">
      {/* ==================================================================
          Grand Citadel Access Pass (Increased Size)
          Pure Frame 00144.webp background with NO overlays on top
          ================================================================== */}
      <div 
        id="citadel-pass-card"
        className={`citadel-pass-card ${isCTF ? 'pass-ctf' : 'pass-web'}`}
      >
        {/* Frame 00144 Background Layer — Clean, untouched, NO overlay layer on top */}
        <div className="pass-bg-wrap">
          <img 
            src={ticketBgImg} 
            alt="SEUSL Sentinel Frame 144" 
            className="pass-bg-img" 
          />
        </div>

        <div className="pass-corner tl" />
        <div className="pass-corner tr" />
        <div className="pass-corner bl" />
        <div className="pass-corner br" />

        {/* Ticket Header */}
        <div className="pass-header">
          <div className="pass-brand">
            <div className="pass-crest-mini">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7V12C3 17.5 6.8 22.3 12 23.5C17.2 22.3 21 17.5 21 12V6L12 2Z" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M12 7V17M8 11L12 7L16 11" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
            </div>
            <div>
              <span className="pass-inst font-mono">SEUSL • FACULTY OF TECHNOLOGY</span>
              <h3 className="pass-event">HASHCORE '26 CITADEL PASS</h3>
              <span className="pass-track-sub font-mono">{competitionName.toUpperCase()}</span>
            </div>
          </div>

          <div className="pass-id-block font-mono">
            <span className="pass-id-label">OFFICIAL PASS ID</span>
            <span className="pass-id-code">{ticketId}</span>
          </div>
        </div>

        {/* Ticket Data Grid */}
        <div className="pass-body-grid">
          <div className="pass-data-item">
            <span className="data-lbl">PARTICIPANT NAME</span>
            <span className="data-val bold">{registration.initialsWithName}</span>
          </div>

          <div className="pass-data-item">
            <span className="data-lbl">UNIVERSITY REG NUMBER</span>
            <span className="data-val font-mono highlight">{registration.universityRegNo}</span>
          </div>

          <div className="pass-data-item">
            <span className="data-lbl">ACADEMIC BATCH</span>
            <span className="data-val">{registration.batch}</span>
          </div>

          <div className="pass-data-item">
            <span className="data-lbl">FACULTY</span>
            <span className="data-val">{registration.faculty}</span>
          </div>

          <div className="pass-data-item">
            <span className="data-lbl">EMAIL ADDRESS</span>
            <div className="data-val-with-status">
              <span className="data-val font-mono">{registration.email}</span>
              {isEmailSent && <span className="email-status-tag font-mono">✓ EMAIL SENT</span>}
            </div>
          </div>

          <div className="pass-data-item">
            <span className="data-lbl">CONTACT NUMBER</span>
            <span className="data-val font-mono">{registration.contactNo}</span>
          </div>

          {registration.whatsappNo && registration.whatsappNo !== registration.contactNo && (
            <div className="pass-data-item">
              <span className="data-lbl">WHATSAPP NUMBER</span>
              <span className="data-val font-mono">{registration.whatsappNo}</span>
            </div>
          )}
        </div>

          {/* Ticket Footer (Clean - No Google Sheet/Form mentions) */}
          <div className="pass-footer">
            <div className="pass-barcode-wrap font-mono">
              <div className="mock-barcode" />
              <span className="barcode-text">SEUSL CITADEL ACCESS PROTOCOL // VERIFIED</span>
            </div>

            <div className="pass-stamp font-mono">
              <span className="stamp-line">SEUSL HASHCORE</span>
              <span className="stamp-status">CONFIRMED</span>
            </div>
          </div>
        </div>

        {/* ==================================================================
            Action Buttons AT THE BOTTOM (Under the Ticket)
            Buttons: Download Ticket | Back to Home
            ================================================================== */}
        <div className="success-actions-wrap bottom-actions">
          <button 
            type="button" 
            onClick={onBackToHome} 
            className="btn-back-home-primary"
          >
            <span>Back to Home</span>
            <svg viewBox="0 0 24 24" fill="none" className="home-arrow">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button 
            type="button" 
            onClick={handleDownloadPdf} 
            className="btn-print-receipt btn-download-pdf"
            title="Download Ticket as PDF"
            disabled={isDownloadingPdf}
          >
            {isDownloadingPdf ? (
              <>
                <span className="spinner-mini" />
                <span>Generating Ticket...</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" className="download-icon">
                  <path d="M12 3V16M12 16L7 11M12 16L17 11M4 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Download Ticket</span>
              </>
            )}
          </button>
        </div>

        {/* Single submission reminder */}
        <p className="single-sub-reminder font-mono">
          ⚠ Only one submission is allowed per participant.
        </p>
      </div>
  );
}
