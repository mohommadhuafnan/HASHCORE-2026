import footerKnightImg from '../../frame/00148.webp';
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
              <div className="footer-brand-header">
                <div className="brand-crest-small">
                  <svg viewBox="0 0 24 24" fill="none" className="crest-svg">
                    <path d="M12 2L3 6V12C3 17.5 6.8 22.3 12 23.5C17.2 22.3 21 17.5 21 12V6L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 7V17M8 11L12 7L16 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="brand-name-footer">SEUSL HASHCORE '26</h3>
                  <span className="brand-tag-footer">Citadel of Innovation</span>
                </div>
              </div>
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
                <li><a href="#team">03 // Organizing Committee</a></li>
                <li><a href="#posters">04 // Posters & Share</a></li>
                <li><a href="#partners">05 // Organizers & Partners</a></li>
                <li><a href="#register" onClick={(e) => { if (onNavigateRegister) { e.preventDefault(); onNavigateRegister(); } }}>06 // Registration Portal</a></li>
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
                <div className="mini-partner">
                  <span className="partner-type">Organized By</span>
                  <span className="partner-title">SICT (Society of ICT)</span>
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
