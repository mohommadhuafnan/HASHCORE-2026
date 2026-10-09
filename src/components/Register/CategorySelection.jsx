import sictLogo from '../../assets/SICT.png';
import RegistrationCountdown, { WORKSHOP_UNLOCK_DATES, useRegistrationCountdown } from '../common/RegistrationCountdown';

export default function CategorySelection({ onSelectTrack, onBackToHome, existingRegistration }) {
  const ctfCountdown = useRegistrationCountdown(WORKSHOP_UNLOCK_DATES.CTF);
  const webCountdown = useRegistrationCountdown(WORKSHOP_UNLOCK_DATES.WEB);
  return (
    <div className="cat-selection-container">
      {/* Top Bar Navigation */}
      <div className="cat-selection-nav">
        <button type="button" onClick={onBackToHome} className="btn-back-citadel">
          <svg viewBox="0 0 24 24" fill="none" className="back-arrow">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Return to Citadel Home</span>
        </button>

        <div className="cat-nav-badge">
          <span>SEUSL REGISTRATION MAINFRAME // 2026</span>
        </div>
      </div>

      {/* Page Heading */}
      <div className="cat-header-block">
        <div className="cat-pre-title">
          <span>DEPARTMENT OF ICT • FACULTY OF TECHNOLOGY • SEUSL</span>
          <span className="dot-divider">•</span>
          <span>HASHCORE v0.1 – 2026</span>
        </div>
        <h1 className="cat-main-title">
          CHOOSE YOUR <span className="gradient-text-emerald">WORKSHOP</span>
        </h1>
        <p className="cat-subtitle">
          Select one of the two student-led technical competition awareness workshops.
          Prior registration is free and required for participation.
        </p>
      </div>

      {/* Existing Registration Banner (if already registered) */}
      {existingRegistration && (
        <div className="existing-registration-banner" style={{
          background: 'rgba(0, 245, 155, 0.08)',
          border: '1px solid rgba(0, 245, 155, 0.3)',
          borderRadius: '14px',
          padding: '16px 20px',
          margin: '0 auto 28px',
          maxWidth: '880px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ color: '#00f59b', fontWeight: '600', fontSize: '0.95rem', marginBottom: '4px' }}>
              ✓ You already have an active registration pass ({existingRegistration.ticketId || existingRegistration.regId})
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Participant: {existingRegistration.initialsWithName} • {existingRegistration.competition || existingRegistration.track}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectTrack('VIEW_EXISTING')}
            style={{
              background: '#00f59b',
              color: '#040b07',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>View Workshop Pass</span>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '16px', height: '16px', stroke: 'currentColor', strokeWidth: '2.2' }}>
              <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}

      {/* 2 Track Cards Grid */}
      <div className="cat-grid">
        {/* ==================================================================
            WORKSHOP 1: CTF: From Awareness to Challenge
            ================================================================== */}
        <div className="cat-card ctf-variant">
          <div className="cat-card-ambient-glow" />

          <div className="cat-card-header">
            <div className="cat-track-badge">
              <span className="badge-code font-mono">WORKSHOP // 01</span>
              <span className="badge-type">24 OCT 2026</span>
            </div>
            <div className="cat-icon-crest">
              <svg viewBox="0 0 24 24" fill="none" className="track-icon-svg">
                <path d="M12 2L3 7V12C3 17.52 6.84 22.45 12 23.5C17.16 22.45 21 17.52 21 12V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 8V16M9 11L12 8L15 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="cat-card-body">
            <div className="cat-track-sub-domain" style={{ color: '#00f59b', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: '600', marginBottom: '6px' }}>
              Cybersecurity · Network & Security Technologies
            </div>
            <h2 className="cat-track-title">CTF: From Awareness to Challenge</h2>
            <p className="cat-track-desc">
              An introduction to Capture The Flag (CTF) competitions, challenge categories, essential tools, preparation strategies, and hands-on cybersecurity challenges.
            </p>

            <div className="cat-feature-list">
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>CTF Fundamentals & Competition Formats</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Cryptography, Ciphers & Hash Cracking</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Web Exploitation & Offensive Security</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Digital Forensics & Network Packet Analysis</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>OSINT (Open Source Intelligence) Techniques</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Beginner Competition Preparation Roadmap</span>
              </div>
            </div>

          </div>

          {/* Real-Time Registration Countdown */}
          <RegistrationCountdown targetDate={WORKSHOP_UNLOCK_DATES.CTF} track="CTF" />

          <div className="cat-card-footer">
            {ctfCountdown.isUnlocked ? (
              <button
                type="button"
                className="btn-select-track btn-ctf"
                onClick={() => onSelectTrack('CTF')}
              >
                <span className="btn-shine" />
                <span className="btn-text">Register for Workshop 01</span>
                <svg viewBox="0 0 24 24" fill="none" className="arrow-svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className="btn-select-track is-locked-cta"
                onClick={() => alert('Workshop 01: CTF: From Awareness to Challenge registration officially opens on October 11, 2026 at 9:30 AM.')}
                title="Registration opens October 11, 2026 at 9:30 AM"
              >
                <span className="btn-text">Opens October 11 · 9:30 AM</span>
              </button>
            )}
          </div>
        </div>

        {/* ==================================================================
            WORKSHOP 2: From Idea to Impact
            ================================================================== */}
        <div className="cat-card web-variant">
          <div className="cat-card-ambient-glow" />

          <div className="cat-card-header">
            <div className="cat-track-badge">
              <span className="badge-code font-mono">WORKSHOP // 02</span>
              <span className="badge-type">31 OCT 2026</span>
            </div>
            <div className="cat-icon-crest">
              <svg viewBox="0 0 24 24" fill="none" className="track-icon-svg">
                <path d="M16 18L22 12L16 6M8 6L2 12L8 18M14 2L10 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="cat-card-body">
            <div className="cat-track-sub-domain" style={{ color: '#ffffff', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: '600', marginBottom: '6px' }}>
              Web Development · Software Technologies
            </div>
            <h2 className="cat-track-title">From Idea to Impact</h2>
            <p className="cat-track-desc">
              Explore how to turn real-world problems into web solutions, build prototypes, use modern development tools, and present projects in competitions.
            </p>

            <div className="cat-feature-list">
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Idea Generation & Problem Formulation</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>UI/UX Design Systems & Rapid Prototyping</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Modern Web Development & Component Architecture</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>AI-Assisted Tools & Developer Acceleration</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Deployment, Hosting & Cloud Delivery</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Competition Pitching & Project Presentation</span>
              </div>
            </div>

          </div>

          {/* Real-Time Registration Countdown */}
          <RegistrationCountdown targetDate={WORKSHOP_UNLOCK_DATES.WEB} track="WEB" />

          <div className="cat-card-footer">
            {webCountdown.isUnlocked ? (
              <button
                type="button"
                className="btn-select-track btn-web"
                onClick={() => onSelectTrack('WEB')}
              >
                <span className="btn-shine" />
                <span className="btn-text">Register for Workshop 02</span>
                <svg viewBox="0 0 24 24" fill="none" className="arrow-svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                className="btn-select-track is-locked-cta"
                onClick={() => alert('Workshop 02: From Idea to Impact registration officially opens on October 16, 2026 at 9:30 AM.')}
                title="Registration opens October 16, 2026 at 9:30 AM"
              >
                <span className="btn-text">Opens October 16 · 9:30 AM</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Subtext */}

    </div>
  );
}
