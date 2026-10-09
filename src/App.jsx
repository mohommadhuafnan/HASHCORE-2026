import { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Timeline from './components/Timeline/Timeline';
import Posters from './components/Posters/Posters';
import Partners from './components/Partners/Partners';
import Footer from './components/Footer/Footer';
import './App.css';

// Lazy load the full registration journey to supercharge initial page speed
const RegisterPortal = lazy(() => import('./components/Register/RegisterPortal'));
const OrganizerPortal = lazy(() => import('./components/Admin/OrganizerPortal'));

/**
 * South Eastern University of Sri Lanka (SEUSL) — HASHCORE v0.1 – 2026
 * A Student-Led Technical Competition Awareness Workshop Series
 */
function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'register' | 'admin'
  const [initialRegisterTrack, setInitialRegisterTrack] = useState(null); // 'CTF' | 'WEB' | null

  // URL Hash & Path Listener & Deep Linking (Supports /scan, #scan, /admin, #admin, etc.)
  useEffect(() => {
    const handleNavigation = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const path = (window.location.pathname || '').toLowerCase().replace(/\/+$/, '');

      if (
        path === '/scan' ||
        path.startsWith('/scan') ||
        hash === '#scan' ||
        path === '/admin' ||
        path.startsWith('/admin') ||
        hash === '#admin' ||
        hash === '#dashboard' ||
        path === '/dashboard' ||
        hash === '#organizer' ||
        path === '/organizer'
      ) {
        setCurrentView('admin');
      } else if (path === '/register' || hash === '#register') {
        setCurrentView('register');
      } else {
        setCurrentView('home');
      }
    };

    handleNavigation();
    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  // Bulletproof Global Scroll Reveal System: Guarantees no section is ever hidden
  useEffect(() => {
    const revealAllInView = () => {
      const elements = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)');
      const windowHeight = window.innerHeight;
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Reveal if element is anywhere within windowHeight + 120px margin or scrolled past
        if (rect.top <= windowHeight + 120 && rect.bottom >= -120) {
          el.classList.add('is-revealed');
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0,
        rootMargin: '120px 0px 120px 0px',
      }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    // Immediate check
    revealAllInView();

    window.addEventListener('scroll', revealAllInView, { passive: true });
    window.addEventListener('resize', revealAllInView, { passive: true });

    // Safety timers to catch delayed renders
    const t1 = setTimeout(revealAllInView, 100);
    const t2 = setTimeout(revealAllInView, 400);
    const t3 = setTimeout(revealAllInView, 1200);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', revealAllInView);
      window.removeEventListener('resize', revealAllInView);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [currentView]);

  const handleNavigateRegister = (track = null) => {
    setInitialRegisterTrack(track);
    setCurrentView('register');
    window.location.hash = '#register';
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleNavigateHome = () => {
    setInitialRegisterTrack(null);
    setCurrentView('home');
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
      window.history.pushState(null, '', '/');
    }
    window.location.hash = '#home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-citadel-root">
      {/* 1. Global Navigation Bar */}
      <Navbar 
        onNavigateRegister={() => handleNavigateRegister(null)}
        onNavigateHome={handleNavigateHome}
        currentView={currentView}
      />

      {currentView === 'register' ? (
        /* Dedicated Registration Citadel Journey (Lazy Loaded with Cyber Suspense) */
        <Suspense fallback={
          <div className="citadel-portal-loader" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#040b07',
            color: '#00f59b',
            fontFamily: 'var(--font-mono, monospace)',
            gap: '16px'
          }}>
            <div className="portal-spinner-ring" style={{
              width: '44px',
              height: '44px',
              border: '3px solid rgba(0, 245, 155, 0.15)',
              borderTopColor: '#00f59b',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span style={{ letterSpacing: '0.15em', fontSize: '0.85rem' }}>INITIALIZING CITADEL PORTAL...</span>
          </div>
        }>
          <RegisterPortal 
            onBackToHome={handleNavigateHome}
            initialTrack={initialRegisterTrack}
          />
        </Suspense>
      ) : currentView === 'admin' ? (
        /* Organizer & Attendance QR Scanner Portal */
        <Suspense fallback={
          <div className="citadel-portal-loader" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#030805',
            color: '#00f59b',
            fontFamily: 'var(--font-mono, monospace)',
            gap: '16px'
          }}>
            <div className="portal-spinner-ring" style={{
              width: '44px',
              height: '44px',
              border: '3px solid rgba(0, 245, 155, 0.15)',
              borderTopColor: '#00f59b',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span style={{ letterSpacing: '0.15em', fontSize: '0.85rem' }}>INITIALIZING ORGANIZER CITADEL...</span>
          </div>
        }>
          <OrganizerPortal onBackToHome={handleNavigateHome} />
        </Suspense>
      ) : (
        /* Standard Citadel Landing Page Experience */
        <main>
          {/* 2. 240-Frame Interactive Journey & Continuous Fixed Citadel Background */}
          <Hero onNavigateRegister={handleNavigateRegister} />

          {/* 3. Content Stream: Glides smoothly from top to bottom over Frame 240 */}
          <div className="citadel-scrolling-content">
            {/* Dual-Track Chronological Timeline */}
            <Timeline onNavigateRegister={handleNavigateRegister} />

            <div className="section-cyber-divider" aria-hidden="true" />

            {/* Transmission Posters & Live Share Hub */}
            <Posters />

            <div className="section-cyber-divider" aria-hidden="true" />

            {/* Organizers (SICT) & Media Partner (Agni Vision) */}
            <Partners />
          </div>

          {/* 4. Atmospheric Footer with Animated 00148.png Sentinel Background */}
          <Footer onNavigateRegister={handleNavigateRegister} />
        </main>
      )}
    </div>
  );
}

export default App;
