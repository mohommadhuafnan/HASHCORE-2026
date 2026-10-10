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
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                <span className="affil-pill">Society of ICT</span>
                <span className="affil-pill">Department of ICT</span>
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
                <li><a href="#contact">07 // Contact Us</a></li>
                <li><a href="#register" onClick={(e) => { if (onNavigateRegister) { e.preventDefault(); onNavigateRegister(); } }}>08 // Register Portal</a></li>
              </ul>
            </div>

            {/* Col 3: Tracks & Workshops */}
            <div className="footer-col">
              <h4 className="col-heading">Featured Workshops</h4>
              <ul className="footer-nav-links">
                <li><a href="#register" onClick={(e) => { if (onNavigateRegister) { e.preventDefault(); onNavigateRegister('CTF'); } }}>Workshop 01: From Awareness to Challenge</a></li>
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

              {/* Direct Communication Channels */}
              <div className="footer-contact-block">
                <a
                  href="https://wa.me/94763029413"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-contact-item whatsapp-footer-item"
                  aria-label="Chat on WhatsApp +94763029413"
                >
                  <span className="footer-contact-icon whatsapp-accent">
                    <svg viewBox="0 0 24 24" fill="none" className="f-icon" aria-hidden="true">
                      <path
                        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982 1-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.888 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.952 3.71 1.454 5.711 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.484-8.407"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <div className="footer-contact-texts">
                    <span className="fc-type">WhatsApp Hotline</span>
                    <span className="fc-value font-mono">+94 76 302 9413</span>
                  </div>
                </a>

                <a
                  href="mailto:mmbmushan@gmail.com"
                  className="footer-contact-item email-footer-item"
                  aria-label="Send Email to mmbmushan@gmail.com"
                >
                  <span className="footer-contact-icon email-accent">
                    <svg viewBox="0 0 24 24" fill="none" className="f-icon" aria-hidden="true">
                      <path
                        d="M3 8L10.89 13.26C11.56 13.71 12.44 13.71 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div className="footer-contact-texts">
                    <span className="fc-type">Official Email</span>
                    <span className="fc-value font-mono">mmbmushan@gmail.com</span>
                  </div>
                </a>
              </div>

              <p className="contact-detail">
                <strong>Campus:</strong> Faculty of Technology, SEUSL, Oluvil #32360
              </p>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="footer-bottom-bar">
            <p className="copyright-text">
              © All right reserved for hashcore.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
