import sictLogo from '../../assets/SICT.png';

/**
 * CategorySelection:
 * Displays the two official tracks:
 * 1. CTF Competition Awareness
 * 2. Web Development Competition Awareness
 * As requested: "Our CTF competition awareness web development competition awareness this is our 2 category"
 */
export default function CategorySelection({ onSelectTrack, onBackToHome, existingRegistration }) {
  return (
    <div className="cat-selection-container">
      {/* Top Bar Navigation */}
      <div className="cat-selection-nav">
        <button type="button" onClick={onBackToHome} className="btn-back-citadel">
          <svg viewBox="0 0 24 24" fill="none" className="back-arrow">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          <span>FACULTY OF TECHNOLOGY • SEUSL</span>
          <span className="dot-divider">•</span>
          <span>HASHCORE '26</span>
        </div>
        <h1 className="cat-main-title">
          CHOOSE YOUR <span className="gradient-text-emerald">BATTLEGROUND</span>
        </h1>
        <p className="cat-subtitle">
          Select one of the two flagship competition awareness and preparation workshops.
          Equip yourself with elite competitive skills before stepping into the arena.
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
            <span>View Citadel Pass</span>
            <svg viewBox="0 0 24 24" fill="none" style={{ width: '16px', height: '16px', stroke: 'currentColor', strokeWidth: '2.2' }}>
              <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* 2 Track Cards Grid */}
      <div className="cat-grid">
        {/* ==================================================================
            CATEGORY 1: CTF Competition Awareness
            ================================================================== */}
        <div className="cat-card ctf-variant">
          <div className="cat-card-ambient-glow" />
          
          <div className="cat-card-header">
            <div className="cat-track-badge">
              <span className="badge-code font-mono">TRACK // 01</span>
              <span className="badge-type">CYBER DEFENSE</span>
            </div>
            <div className="cat-icon-crest">
              <svg viewBox="0 0 24 24" fill="none" className="track-icon-svg">
                <path d="M12 2L3 7V12C3 17.52 6.84 22.45 12 23.5C17.16 22.45 21 17.52 21 12V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V16M9 11L12 8L15 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="cat-card-body">
            <h2 className="cat-track-title">CTF Competition</h2>
            <p className="cat-track-desc">
              Master the foundational and advanced methodologies of Capture The Flag cyber competitions.
              Hands-on exposure to live target exploitation, defense strategies, cryptographic deciphering,
              and security intelligence drills.
            </p>

            <div className="cat-feature-list">
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Offensive Web Security & OWASP Top 10 Exploitation</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Cryptographic Decryption, Ciphers & Hash Cracking</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Digital Forensics, Packet Captures & Network Traces</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Binary Analysis & Reverse Engineering Fundamentals</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Live CTF Platform Onboarding & Scoring Mechanics</span>
              </div>
            </div>

            <div className="cat-specs-box">
              <div className="spec-row">
                <span className="spec-lbl">Eligibility:</span>
                <span className="spec-val">SEUSL Faculty of Technology</span>
              </div>
              <div className="spec-row">
                <span className="spec-lbl">Requirement:</span>
                <span className="spec-val">Personal Laptop with Kali Linux / VM</span>
              </div>
              <div className="spec-row">
                <span className="spec-lbl">Capacity:</span>
                <span className="spec-val text-emerald">Strict Single Registration Cap</span>
              </div>
            </div>
          </div>

          <div className="cat-card-footer">
            <button
              type="button"
              className="btn-select-track btn-ctf"
              onClick={() => onSelectTrack('CTF')}
            >
              <span className="btn-shine" />
              <span className="btn-text">Register for CTF</span>
              <svg viewBox="0 0 24 24" fill="none" className="arrow-svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ==================================================================
            CATEGORY 2: Web Development Competition
            ================================================================== */}
        <div className="cat-card web-variant">
          <div className="cat-card-ambient-glow" />

          <div className="cat-card-header">
            <div className="cat-track-badge">
              <span className="badge-code font-mono">TRACK // 02</span>
              <span className="badge-type">FULLSTACK DEV</span>
            </div>
            <div className="cat-icon-crest">
              <svg viewBox="0 0 24 24" fill="none" className="track-icon-svg">
                <path d="M16 18L22 12L16 6M8 6L2 12L8 18M14 2L10 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="cat-card-body">
            <h2 className="cat-track-title">Web Development Competition</h2>
            <p className="cat-track-desc">
              Supercharge your software engineering prowess for hackathons and high-stakes coding sprints.
              Explore modern UI architectures, dynamic animation techniques, real-time backend integrations,
              and speed development workflows.
            </p>

            <div className="cat-feature-list">
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Next-Gen Frontend Architectures (React, Modern CSS, Web APIs)</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Interactive UI/UX & Micro-animation Design Systems</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>REST & Real-time WebSockets Backend Engineering</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>Cloud Deployment, Git Collaboration & CI/CD Sprints</span>
              </div>
              <div className="feature-item">
                <span className="feature-bullet">›</span>
                <span>24-Hour Hackathon Strategy & Live Project Pitching</span>
              </div>
            </div>

            <div className="cat-specs-box">
              <div className="spec-row">
                <span className="spec-lbl">Eligibility:</span>
                <span className="spec-val">SEUSL Faculty of Technology</span>
              </div>
              <div className="spec-row">
                <span className="spec-lbl">Requirement:</span>
                <span className="spec-val">Personal Laptop with Node.js & VS Code</span>
              </div>
              <div className="spec-row">
                <span className="spec-lbl">Capacity:</span>
                <span className="spec-val text-emerald">Strict Single Registration Cap</span>
              </div>
            </div>
          </div>

          <div className="cat-card-footer">
            <button
              type="button"
              className="btn-select-track btn-web"
              onClick={() => onSelectTrack('WEB')}
            >
              <span className="btn-shine" />
              <span className="btn-text">Register for Web Development</span>
              <svg viewBox="0 0 24 24" fill="none" className="arrow-svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Subtext */}
      <div className="cat-footer-note">
        <div className="cat-organizer-pill">
          <img src={sictLogo} alt="SICT Logo" className="cat-sict-logo" />
          <span>Organized by Society of Information and Communication Technology (SICT) • Faculty of Technology • South Eastern University of Sri Lanka</span>
        </div>
      </div>
    </div>
  );
}
