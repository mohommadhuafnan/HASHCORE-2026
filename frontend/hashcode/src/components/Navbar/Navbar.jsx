import React, { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className={`navbar-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Brand / University & Event Identity */}
        <a href="#home" className="navbar-brand" onClick={closeMenu}>
          <div className="brand-crest">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="crest-svg">
              <path d="M12 2L3 6V12C3 17.5 6.8 22.3 12 23.5C17.2 22.3 21 17.5 21 12V6L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 7V17M8 11L12 7L16 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="crest-pulse" />
          </div>
          <div className="brand-titles">
            <span className="brand-uni">SEUSL</span>
            <div className="brand-main">
              <span className="brand-name">HASHCORE</span>
              <span className="brand-badge">'26</span>
            </div>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="navbar-nav desktop-only" aria-label="Main Navigation">
          <ul className="nav-list">
            <li className="nav-item">
              <a href="#home" className="nav-link active">
                <span className="link-text">Home</span>
                <span className="link-indicator" />
              </a>
            </li>
            <li className="nav-item">
              <a href="#timeline" className="nav-link">
                <span className="link-text">Timeline</span>
                <span className="link-indicator" />
              </a>
            </li>
            <li className="nav-item">
              <a href="#team" className="nav-link">
                <span className="link-text">Team</span>
                <span className="link-indicator" />
              </a>
            </li>
            <li className="nav-item">
              <a href="#posters" className="nav-link">
                <span className="link-text">Posters</span>
                <span className="link-indicator" />
              </a>
            </li>
            <li className="nav-item">
              <a href="#partners" className="nav-link">
                <span className="link-text">Partners</span>
                <span className="link-indicator" />
              </a>
            </li>
          </ul>
        </nav>

        {/* Right CTA Area */}
        <div className="navbar-actions desktop-only">
          <a href="#register" className="btn-register-cta">
            <span className="btn-glow" />
            <span className="btn-content">
              <span className="btn-dot" />
              Register Now
            </span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          type="button" 
          className={`hamburger-btn mobile-only ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          <span className="bar bar-1" />
          <span className="bar bar-2" />
          <span className="bar bar-3" />
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'is-open' : ''}`}>
        <div className="drawer-inner">
          <nav className="drawer-nav">
            <a href="#home" className="drawer-link active" onClick={closeMenu}>
              <span className="drawer-num">01</span>
              <span>Home</span>
            </a>
            <a href="#timeline" className="drawer-link" onClick={closeMenu}>
              <span className="drawer-num">02</span>
              <span>Timeline</span>
            </a>
            <a href="#team" className="drawer-link" onClick={closeMenu}>
              <span className="drawer-num">03</span>
              <span>Organizing Team</span>
            </a>
            <a href="#posters" className="drawer-link" onClick={closeMenu}>
              <span className="drawer-num">04</span>
              <span>Posters & Share</span>
            </a>
            <a href="#partners" className="drawer-link" onClick={closeMenu}>
              <span className="drawer-num">05</span>
              <span>SICT & Media Partners</span>
            </a>
            <a href="#register" className="drawer-link" onClick={closeMenu}>
              <span className="drawer-num">06</span>
              <span>Register Now</span>
            </a>
          </nav>
          
          <div className="drawer-cta-wrap">
            <a href="#register" className="btn-register-cta full-width" onClick={closeMenu}>
              <span className="btn-content">
                <span className="btn-dot" />
                Register Now
              </span>
            </a>
            <p className="drawer-footer-note">South Eastern University of Sri Lanka • 2026</p>
          </div>
        </div>
      </div>
    </header>
  );
}
