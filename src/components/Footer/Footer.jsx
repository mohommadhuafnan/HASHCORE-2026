import footerKnightImg from '../../frame/00148.webp';
import sictLogo from '../../assets/SICT.png';
import logoOriginalImg from '../../assets/logo-original.png';
import './Footer.css';

export default function Footer({ onNavigateRegister }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer-citadel">
      {/* Upper Atmospheric Banner with Image 00148.png */}
      <div className="footer-visual-stage">
        <div className="knight-backdrop-wrap">
          <img 
            src={footerKnightImg} 
            alt="SEUSL Citadel Sentinel (Frame 148)" 
            className="knight-animated-img lazy-img-smooth is-loaded" 
            loading="lazy"
            decoding="async"
          />
          <div className="visual-vignette" />
          <div className="visual-scanline" />
        </div>

        {/* Floating Call to Action over the Knight Image */}
        <div className="footer-cta-container reveal-on-scroll">
          <div className="cta-badge">
            <span className="cta-pulse-dot" />
            <span>FINAL DESTINATION // THE CITADEL AWAITS</span>
          </div>
          <h2 className="cta-heading">
            BECOME A LEGEND AT <span className="text-glow">HASHCORE '26</span>
          </h2>
          <p className="cta-subtext">
            Join hundreds of collegiate developers, security researchers, and innovators at
            South Eastern University of Sri Lanka. Secure your squad roster today.
          </p>

          <div id="register" className="cta-button-group">
            <a 
              href="#register" 
              className="btn-cta-main"
              onClick={(e) => {
                if (onNavigateRegister) {
                  e.preventDefault();
                  onNavigateRegister();
                }
              }}
            >
              <span className="btn-glow-flare" />
              <span>Register Now</span>
              <svg viewBox="0 0 24 24" fill="none" className="arrow-svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <a href="#timeline" className="btn-cta-ghost">
              <span>View Key Dates</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links & University Credentials */}
      <div className="footer-links-matrix">
        <div className="section-container">
          <div className="footer-cols-grid reveal-on-scroll stagger-1">
            {/* Col 1: Brand & University Identity */}
            <div className="footer-col col-brand">
              <a href="#home" className="footer-brand-logo-link" aria-label="SEUSL HASHCORE '26 Home">
                <img 
                  src={logoOriginalImg} 
                  alt="SEUSL HASHCORE '26 Official Logo" 
                  className="footer-brand-logo-img" 
                />
              </a>
              <p className="brand-desc-footer">
                The premier annual national technology summit, CTF championship, and 24-hour hackathon
                organized by the Faculty of Technology, South Eastern University of Sri Lanka.
              </p>
              <div className="affil-badges">
                <span className="affil-pill">Faculty of Technology</span>
                <span className="affil-pill">SEUSL Campus</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="footer-col">
              <h4 className="col-heading">Summit Directory</h4>
              <ul className="footer-nav-links">
                <li><a href="#home">01 // Citadel Chamber (Hero)</a></li>
                <li><a href="#timeline">02 // Operational Timeline</a></li>
                <li><a href="#posters">03 // Posters & Share</a></li>
                <li><a href="#partners">04 // Organizers & Partners</a></li>
                <li><a href="#register" onClick={(e) => { if (onNavigateRegister) { e.preventDefault(); onNavigateRegister(); } }}>05 // Registration Portal</a></li>
              </ul>
            </div>

            {/* Col 3: Tracks & Workshops */}
            <div className="footer-col">
              <h4 className="col-heading">Flagship Tracks</h4>
              <ul className="footer-nav-links">
                <li><a href="#register" onClick={(e) => { if (onNavigateRegister) { e.preventDefault(); onNavigateRegister('CTF'); } }}>Track 01: CTF Competition Awareness</a></li>
                <li><a href="#register" onClick={(e) => { if (onNavigateRegister) { e.preventDefault(); onNavigateRegister('WEB'); } }}>Track 02: Web Development Competition Awareness</a></li>
                <li><a href="#timeline">Oct 24: Hands-on Cyber Masterclass</a></li>
                <li><a href="#timeline">Oct 31: 24H Fullstack Sprint</a></li>
                <li><a href="#posters">Official Media Press Kit</a></li>
              </ul>
            </div>

            {/* Col 4: Organization & Contact */}
            <div className="footer-col">
              <h4 className="col-heading">Organization & Media</h4>
              <div className="partner-badges-mini">
                <div className="mini-partner mini-partner-sict">
                  <span className="partner-type">Organized By</span>
                  <div className="mini-partner-brand">
                    <div className="mini-sict-icon-wrap">
                      <img src={sictLogo} alt="SICT Logo" className="mini-sict-logo" />
                    </div>
                    <span className="partner-title">SICT (Society of ICT)</span>
                  </div>
                </div>
                <div className="mini-partner">
                  <span className="partner-type">Official Media Partner</span>
                  <span className="partner-title amber">Agni Vision</span>
                </div>
              </div>
              <p className="contact-detail">
                <strong>Inquiries:</strong> hashcore@seu.ac.lk<br />
                <strong>Campus:</strong> University Park, Oluvil #32360, Sri Lanka
              </p>
            </div>
          </div>

          {/* Bottom Copyright & Back to Top Bar */}
          <div className="footer-bottom-bar">
            <p className="copyright-text">
              © 2026 South Eastern University of Sri Lanka (SEUSL). Organized by SICT. Media Partner: Agni Vision. Copyright by Mohommadhu Afnan. All Rights Reserved.
              <a href="#admin" style={{ color: '#00f59b', opacity: 0.75, textDecoration: 'none', marginLeft: '12px', fontWeight: 'bold' }}>
                &bull; Organizer Portal
              </a>
            </p>
            <button type="button" className="btn-back-to-top" onClick={scrollToTop}>
              <span>Ascend to Apex</span>
              <svg viewBox="0 0 24 24" fill="none" className="top-arrow">
                <path d="M12 19V5M5 12L12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
