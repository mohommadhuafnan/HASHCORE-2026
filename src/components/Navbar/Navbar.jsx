import { useState, useEffect } from 'react';
import logoImg from '../../assets/logo.png';
import './Navbar.css';

export default function Navbar({ onNavigateRegister, onNavigateHome, currentView = 'home' }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'timeline', 'posters', 'partners'].includes(hash)) return hash;
    }
    return 'home';
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Synchronize active section with URL hash
  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'timeline', 'posters', 'partners'].includes(hash)) {
        setActiveSection(hash);
      }
    };
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, []);

  // Scroll Spy: dynamically highlight the section currently in view
  useEffect(() => {
    if (currentView !== 'home') return;

    const handleScrollSpy = () => {
      // Near top of document
      if (window.scrollY < 300) {
        setActiveSection('home');
        return;
      }

      // Near bottom of document
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120) {
        setActiveSection('partners');
        return;
      }

      const sectionIds = ['partners', 'posters', 'timeline'];
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.15) {
            setActiveSection(id);
            return;
          }
        }
      }

      const heroEl = document.getElementById('home');
      if (heroEl) {
        const rect = heroEl.getBoundingClientRect();
        if (rect.bottom > window.innerHeight * 0.3) {
          setActiveSection('home');
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [currentView]);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleHomeClick = (e) => {
    closeMenu();
    setActiveSection('home');
    if (currentView !== 'home') {
      if (onNavigateHome) {
        if (e) e.preventDefault();
        onNavigateHome();
      }
    } else {
      if (e) e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '#home');
    }
  };
  const handleBrandClick = handleHomeClick;

  const handleNavClick = (sectionId, e) => {
    closeMenu();
    setActiveSection(sectionId);

    if (currentView !== 'home') {
      if (onNavigateHome) {
        if (e) e.preventDefault();
        onNavigateHome();
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
      }
    } else {
      if (e) e.preventDefault();
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `#${sectionId}`);
      }
    }
  };

  const handleRegisterClick = (e) => {
    closeMenu();
    if (onNavigateRegister) {
      e.preventDefault();
      onNavigateRegister();
    }
  };

  return (
    <header className={`navbar-header ${scrolled || currentView === 'register' ? 'is-scrolled' : ''}`}>
      <div className="navbar-container liquid-glass-capsule">
        <div className="liquid-glass-reflection" aria-hidden="true" />
        <div className="liquid-glass-glow" aria-hidden="true" />
        <div className="liquid-glass-edge" aria-hidden="true" />

        {/* Brand / Official Event Logo */}
        <a href="#home" className="navbar-brand" onClick={handleHomeClick} aria-label="HASHCORE '26 Home">
          <img 
            src={logoImg} 
            alt="SEUSL HASHCORE '26" 
            className="navbar-brand-logo" 
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="navbar-nav desktop-only" aria-label="Main Navigation">
          <ul className="nav-list">
            <li className="nav-item">
              <a 
                href="#home" 
                className={`nav-link ${currentView === 'home' && activeSection === 'home' ? 'active' : ''}`}
                onClick={handleHomeClick}
              >
                <span className="link-text">Home</span>
                <span className="link-indicator" />
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#timeline" 
                className={`nav-link ${currentView === 'home' && activeSection === 'timeline' ? 'active' : ''}`}
                onClick={(e) => handleNavClick('timeline', e)}
              >
                <span className="link-text">Timeline</span>
                <span className="link-indicator" />
              </a>
            </li>

            <li className="nav-item">
              <a 
                href="#posters" 
                className={`nav-link ${currentView === 'home' && activeSection === 'posters' ? 'active' : ''}`}
                onClick={(e) => handleNavClick('posters', e)}
              >
                <span className="link-text">Posters</span>
                <span className="link-indicator" />
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#partners" 
                className={`nav-link ${currentView === 'home' && activeSection === 'partners' ? 'active' : ''}`}
                onClick={(e) => handleNavClick('partners', e)}
              >
                <span className="link-text">Partners</span>
                <span className="link-indicator" />
              </a>
            </li>
          </ul>
        </nav>

        {/* Right CTA Area */}
        <div className="navbar-actions desktop-only">
          <a 
            href="#register" 
            className={`btn-register-cta ${currentView === 'register' ? 'is-active' : ''}`}
            onClick={handleRegisterClick}
          >
            <span className="btn-glow" />
            <span className="btn-content">
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
      <div 
        className={`mobile-drawer ${mobileMenuOpen ? 'is-open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMenu();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className="drawer-inner">
          {/* Drawer Top Bar with Brand & Close Button */}
          <div className="drawer-top-bar">
            <div className="drawer-brand-wrap">
              <img src={logoImg} alt="SEUSL HASHCORE '26" className="drawer-brand-logo" />
            </div>
            <button 
              type="button" 
              className="drawer-close-btn"
              onClick={closeMenu}
              aria-label="Close navigation menu"
            >
              <svg viewBox="0 0 24 24" fill="none" className="close-icon-svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <nav className="drawer-nav">
            <a 
              href="#home" 
              className={`drawer-link ${currentView === 'home' && activeSection === 'home' ? 'active' : ''}`} 
              onClick={handleHomeClick}
            >
              <span className="drawer-num">01</span>
              <span>Home</span>
            </a>
            <a 
              href="#timeline" 
              className={`drawer-link ${currentView === 'home' && activeSection === 'timeline' ? 'active' : ''}`} 
              onClick={(e) => handleNavClick('timeline', e)}
            >
              <span className="drawer-num">02</span>
              <span>Timeline</span>
            </a>

            <a 
              href="#posters" 
              className={`drawer-link ${currentView === 'home' && activeSection === 'posters' ? 'active' : ''}`} 
              onClick={(e) => handleNavClick('posters', e)}
            >
              <span className="drawer-num">03</span>
              <span>Posters & Share</span>
            </a>
            <a 
              href="#partners" 
              className={`drawer-link ${currentView === 'home' && activeSection === 'partners' ? 'active' : ''}`} 
              onClick={(e) => handleNavClick('partners', e)}
            >
              <span className="drawer-num">04</span>
              <span>SICT & Media Partners</span>
            </a>
            <a 
              href="#register" 
              className={`drawer-link ${currentView === 'register' ? 'active' : ''}`} 
              onClick={handleRegisterClick}
            >
              <span className="drawer-num">05</span>
              <span>Register Now</span>
            </a>
          </nav>
          
          <div className="drawer-cta-wrap">
            <a 
              href="#register" 
              className="btn-register-cta full-width" 
              onClick={handleRegisterClick}
            >
              <span className="btn-content">
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
