import sictLogo from '../../assets/SICT.png';
import agniLogo from '../../assets/Agnivision.png';
import seusllogo from '../../assets/SEUSLlogo.png';
import './Partners.css';

export default function Partners() {
  return (
    <section id="partners" className="partners-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center reveal-on-scroll">
          <span className="section-badge font-mono">EVENT ORGANIZERS</span>
          <h2 className="section-title">
            ORGANIZED BY <span className="title-gradient">SICT x DICT</span>
          </h2>
          <p className="section-desc">
            Organized by SICT, in collaboration with DICT, Faculty of Technology, SEUSL.
          </p>
        </div>

        {/* Partners Showcase Grid */}
        <div className="partners-grid">
          {/* Organizer Card: SICT */}
          <div className="partner-card organizer-card reveal-on-scroll stagger-1">
            <div className="card-top-tag">
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
                <p className="partner-sub-title">Society of ICT • Under Department of ICT (DICT)</p>
                <span className="partner-affil">Faculty of Technology • SEUSL</span>
              </div>
            </div>


            <div className="partner-card-footer">
              <span className="cred-badge">SEUSL OFFICIAL TECH BODY</span>
              <a href="https://seu.ac.lk" target="_blank" rel="noreferrer" className="partner-link">
                <span>Portal</span>
                <svg viewBox="0 0 24 24" fill="none" className="ext-icon">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* Media Partner Card: Agni Vision */}
          <div className="partner-card media-card reveal-on-scroll stagger-2">
            <div className="card-top-tag media-tag">
              <span>OFFICIAL MEDIA PARTNER</span>
            </div>

            <div className="partner-logo-box">
              {/* Official Agni Vision Emblem */}
              <div className="agni-emblem">
                <img
                  src={agniLogo}
                  alt="Agni Vision Official Logo"
                  className="agni-logo-img"
                  loading="lazy"
                />
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
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Institutional Host Badge */}
        <div className="host-endorsement-banner reveal-on-scroll stagger-3">
          <div className="host-crest-icon">
            <img
              src={seusllogo}
              alt="South Eastern University of Sri Lanka Official Crest"
              className="host-crest-img"
              loading="lazy"
            />
          </div>
          <div className="host-details">
            <span className="host-badge-tag">INSTITUTIONAL HOST & PATRON</span>
            <h4 className="host-title">SOUTH EASTERN UNIVERSITY OF SRI LANKA</h4>
            <p className="host-campus">Department of ICT, Faculty of Technology South Eastern University of Sri Lanka</p>
          </div>
        </div>
      </div>
    </section>
  );
}
