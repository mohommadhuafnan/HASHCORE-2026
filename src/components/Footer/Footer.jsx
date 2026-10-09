import footerKnightImg from '../../frame/00148.webp';
import sictLogo from '../../assets/SICT.png';
import agniLogo from '../../assets/Agnivision.png';
import logoOriginalImg from '../../assets/logo-original.png';
import './Footer.css';

export default function Footer({ onNavigateRegister }) {
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

        {/* Floating Call to Action over the Sentinel Image */}
        <div className="footer-cta-container reveal-on-scroll">
          <h2 className="cta-heading">
            READY TO TAKE ON THE <span className="text-glow">CHALLENGE?</span>
          </h2>
          <p className="cta-subtext">
            Start your journey into technical competitions with HASHCORE v0.1 – 2026.
            Registration is free. Participants must register in advance.
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
            <a href="#workshops" className="btn-cta-ghost">
              <span>View Workshops</span>
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
              <a href="#home" className="footer-brand-logo-link" aria-label="HASHCORE v0.1 – 2026 Home">
                <img 
                  src={logoOriginalImg} 
                  alt="HASHCORE v0.1 – 2026 Official Logo" 
                  className="footer-brand-logo-img" 
                />
              </a>
              <p className="brand-desc-footer">
                A student-led technical event series initiated under the Department of Information and Communication Technology,
                Faculty of Technology, South Eastern University of Sri Lanka.
              </p>
              <div className="affil-badges">
                <span className="affil-pill">Department of ICT (DICT)</span>
                <span className="affil-pill">Faculty of Technology</span>
                <span className="affil-pill">SEUSL</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="footer-col">
              <h4 className="col-heading">Event Directory</h4>
              <ul className="footer-nav-links">
                <li><a href="#home">01 // Home & Overview</a></li>
                <li><a href="#workshops">02 // Featured Workshops</a></li>
                <li><a href="#details">03 // Event Details</a></li>
                <li><a href="#benefits">04 // What You'll Gain</a></li>
                <li><a href="#posters">05 // Posters & Media</a></li>
                <li><a href="#partners">06 // Organizers</a></li>
                <li><a href="#register" onClick={(e) => { if (onNavigateRegister) { e.preventDefault(); onNavigateRegister(); } }}>07 // Register Portal</a></li>
              </ul>
            </div>

            {/* Col 3: Tracks & Workshops */}
            <div className="footer-col">
              <h4 className="col-heading">Featured Workshops</h4>
              <ul className="footer-nav-links">
                <li><a href="#register" onClick={(e) => { if (onNavigateRegister) { e.preventDefault(); onNavigateRegister('CTF'); } }}>Workshop 01: CTF: From Awareness to Challenge</a></li>
                <li><a href="#register" onClick={(e) => { if (onNavigateRegister) { e.preventDefault(); onNavigateRegister('WEB'); } }}>Workshop 02: From Idea to Impact</a></li>
                <li><a href="#details">Dates: October 2026 (TBA)</a></li>
                <li><a href="#details">Time: To Be Announced</a></li>
                <li><a href="#details">Venue: Faculty of Technology, SEUSL (TBA)</a></li>
              </ul>
            </div>

            {/* Col 4: Organization & Contact */}
            <div className="footer-col">
              <h4 className="col-heading">Organized By</h4>
              <div className="partner-badges-mini">
                <div className="mini-partner mini-partner-sict">
                  <span className="partner-type">Organized By</span>
                  <div className="mini-partner-brand">
                    <div className="mini-sict-icon-wrap">
                      <img src={sictLogo} alt="SICT Logo" className="mini-sict-logo" />
                    </div>
                    <span className="partner-title">Society of ICT (SICT)</span>
                  </div>
                </div>
                <div className="mini-partner">
                  <span className="partner-type">Official Media Partner</span>
                  <div className="mini-partner-brand">
                    <div className="mini-sict-icon-wrap mini-agni-icon-wrap">
                      <img src={agniLogo} alt="Agni Vision Logo" className="mini-sict-logo" />
                    </div>
                    <span className="partner-title amber">Agni Vision</span>
                  </div>
                </div>
              </div>
              <p className="contact-detail">
                <strong>Inquiries:</strong> hashcore@seu.ac.lk<br />
                <strong>Campus:</strong> University Park, Oluvil #32360, Sri Lanka
              </p>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="footer-bottom-bar">
            <p className="copyright-text">
              © 2026 South Eastern University of Sri Lanka (SEUSL). Organized by SICT. Media Partner: Agni Vision. Copyright by Mohommadhu Afnan. All Rights Reserved.
              <a href="#admin" style={{ color: '#00f59b', opacity: 0.75, textDecoration: 'none', marginLeft: '12px', fontWeight: 'bold' }}>
                &bull; Organizer Portal
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
