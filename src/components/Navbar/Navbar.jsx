import { useState, useEffect } from 'react';
import logoImg from '../../assets/logo.png';
import './Navbar.css';

export default function Navbar({ onNavigateRegister, onNavigateHome, currentView = 'home' }) {
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

  const handleBrandClick = (e) => {
    closeMenu();
    if (onNavigateHome) {
      e.preventDefault();
      onNavigateHome();
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
      <div className="navbar-container">
        {/* Brand / Official Event Logo */}
        <a href="#home" className="navbar-brand" onClick={handleBrandClick} aria-label="HASHCORE '26 Home">
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
                className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
                onClick={handleBrandClick}
              >
                <span className="link-text">Home</span>
                <span className="link-indicator" />
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#timeline" 
                className="nav-link"
                onClick={(e) => {
                  if (currentView !== 'home' && onNavigateHome) {
                    e.preventDefault();
                    onNavigateHome();
                    setTimeout(() => {
                      const el = document.getElementById('timeline');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
              >
                <span className="link-text">Timeline</span>
                <span className="link-indicator" />
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#team" 
                className="nav-link"
                onClick={(e) => {
                  if (currentView !== 'home' && onNavigateHome) {
                    e.preventDefault();
                    onNavigateHome();
                    setTimeout(() => {
                      const el = document.getElementById('team');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
              >
                <span className="link-text">Team</span>
                <span className="link-indicator" />
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#posters" 
                className="nav-link"
                onClick={(e) => {
                  if (currentView !== 'home' && onNavigateHome) {
                    e.preventDefault();
                    onNavigateHome();
                    setTimeout(() => {
                      const el = document.getElementById('posters');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
              >
                <span className="link-text">Posters</span>
                <span className="link-indicator" />
              </a>
            </li>
            <li className="nav-item">
              <a 
                href="#partners" 
                className="nav-link"
                onClick={(e) => {
                  if (currentView !== 'home' && onNavigateHome) {
                    e.preventDefault();
                    onNavigateHome();
                    setTimeout(() => {
                      const el = document.getElementById('partners');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
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
            <a 
              href="#home" 
              className={`drawer-link ${currentView === 'home' ? 'active' : ''}`} 
              onClick={handleBrandClick}
            >
              <span className="drawer-num">01</span>
              <span>Home</span>
            </a>
            <a 
              href="#timeline" 
              className="drawer-link" 
              onClick={(e) => {
                closeMenu();
                if (currentView !== 'home' && onNavigateHome) {
                  e.preventDefault();
                  onNavigateHome();
                  setTimeout(() => {
                    const el = document.getElementById('timeline');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
            >
              <span className="drawer-num">02</span>
              <span>Timeline</span>
            </a>
            <a 
              href="#team" 
              className="drawer-link" 
              onClick={(e) => {
                closeMenu();
                if (currentView !== 'home' && onNavigateHome) {
                  e.preventDefault();
                  onNavigateHome();
                  setTimeout(() => {
                    const el = document.getElementById('team');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
            >
              <span className="drawer-num">03</span>
              <span>Organizing Team</span>
            </a>
            <a 
              href="#posters" 
              className="drawer-link" 
              onClick={(e) => {
                closeMenu();
                if (currentView !== 'home' && onNavigateHome) {
                  e.preventDefault();
                  onNavigateHome();
                  setTimeout(() => {
                    const el = document.getElementById('posters');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
            >
              <span className="drawer-num">04</span>
              <span>Posters & Share</span>
            </a>
            <a 
              href="#partners" 
              className="drawer-link" 
              onClick={(e) => {
                closeMenu();
                if (currentView !== 'home' && onNavigateHome) {
                  e.preventDefault();
                  onNavigateHome();
                  setTimeout(() => {
                    const el = document.getElementById('partners');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
            >
              <span className="drawer-num">05</span>
              <span>SICT & Media Partners</span>
            </a>
            <a 
              href="#register" 
              className={`drawer-link ${currentView === 'register' ? 'active' : ''}`} 
              onClick={handleRegisterClick}
            >
              <span className="drawer-num">06</span>
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
