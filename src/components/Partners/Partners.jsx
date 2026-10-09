import sictLogo from '../../assets/SICT.png';
import './Partners.css';

export default function Partners() {
  return (
    <section id="partners" className="partners-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center reveal-on-scroll">
          <div className="header-badge">
            <span className="badge-pulse-dot" />
            <span>ORGANIZATIONAL MATRIX // PATRONAGE</span>
          </div>
          <h2 className="section-title">
            ORGANIZED BY <span className="title-gradient">& MEDIA PARTNERS</span>
          </h2>
          <p className="section-desc">
            Empowered by the technological leadership of the Faculty of Technology, SICT,
            and broadcasting excellence by Agni Vision.
          </p>
        </div>

        {/* Partners Showcase Grid */}
        <div className="partners-grid">
          {/* Organizer Card: SICT */}
          <div className="partner-card organizer-card reveal-on-scroll stagger-1">
            <div className="card-top-tag">
              <span className="dot emerald-pulse" />
              <span>OFFICIAL ORGANIZER</span>
            </div>

            <div className="partner-logo-box">
              {/* Official SICT Emblem */}
              <div className="sict-emblem">
                <img 
                  src={sictLogo} 
                  alt="Society of ICT (SICT) Official Logo" 
                  className="sict-logo-img" 
                  loading="lazy"
                />
                <div className="emblem-ambient-glow" />
              </div>

              <div className="partner-text-info">
                <h3 className="partner-brand-name">SICT</h3>
                <p className="partner-sub-title">Society of Information & Communication Technology</p>
                <span className="partner-affil">Faculty of Technology • SEUSL</span>
              </div>
            </div>


            <div className="partner-card-footer">
              <span className="cred-badge">SEUSL OFFICIAL TECH BODY</span>
              <a href="https://seu.ac.lk" target="_blank" rel="noreferrer" className="partner-link">
                <span>Portal</span>
                <svg viewBox="0 0 24 24" fill="none" className="ext-icon">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Media Partner Card: Agni Vision */}
          <div className="partner-card media-card reveal-on-scroll stagger-2">
            <div className="card-top-tag media-tag">
              <span className="dot amber-pulse" />
              <span>OFFICIAL MEDIA PARTNER</span>
            </div>

            <div className="partner-logo-box">
              {/* Custom Cinematic Agni Vision Emblem */}
              <div className="agni-emblem">
                <svg viewBox="0 0 100 100" fill="none" className="agni-svg">
                  <circle cx="50" cy="50" r="42" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" />
                  <circle cx="50" cy="50" r="34" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" />
                  {/* Stylized Cinema Lens Aperture & Flame Eye */}
                  <path d="M50 18 C65 30 75 40 75 55 C75 70 60 82 50 82 C40 82 25 70 25 55 C25 40 35 30 50 18 Z" stroke="#00f59b" strokeWidth="2.2" fill="rgba(0, 245, 155, 0.08)" />
                  <circle cx="50" cy="55" r="10" stroke="#f59e0b" strokeWidth="2" fill="#040806" />
                  <circle cx="50" cy="55" r="4" fill="#00f59b" />
                  {/* Rays */}
                  <line x1="50" y1="6" x2="50" y2="12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                  <line x1="94" y1="50" x2="88" y2="50" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                  <line x1="50" y1="94" x2="50" y2="88" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="50" x2="12" y2="50" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div className="emblem-ambient-glow amber-glow" />
              </div>

              <div className="partner-text-info">
                <h3 className="partner-brand-name agni-name">AGNI VISION</h3>
                <p className="partner-sub-title">Cinematic Media & Broadcasting Partner</p>
                <span className="partner-affil">Official Visual Production Network</span>
              </div>
            </div>


            <div className="partner-card-footer">
              <span className="cred-badge">EXCLUSIVE BROADCASTER</span>
              <a href="#posters" className="partner-link">
                <span>Media Vault</span>
                <svg viewBox="0 0 24 24" fill="none" className="ext-icon">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Institutional Host Badge */}
        <div className="host-endorsement-banner reveal-on-scroll stagger-3">
          <div className="host-crest-icon">
            <svg viewBox="0 0 24 24" fill="none" className="host-svg">
              <path d="M12 2L3 7V12C3 17.5 6.8 22.3 12 23.5C17.2 22.3 21 17.5 21 12V7L12 2Z" stroke="#00f59b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7V17M8 11L12 7L16 11" stroke="#00f59b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="host-details">
            <h4 className="host-title">SOUTH EASTERN UNIVERSITY OF SRI LANKA</h4>
            <p className="host-campus">Faculty of Technology • University Park, Oluvil #32360, Sri Lanka</p>
          </div>
        </div>
      </div>
    </section>
  );
}
