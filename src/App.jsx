import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Timeline from './components/Timeline/Timeline';
import Team from './components/Team/Team';
import Posters from './components/Posters/Posters';
import Partners from './components/Partners/Partners';
import Footer from './components/Footer/Footer';
import RegisterPortal from './components/Register/RegisterPortal';
import './App.css';

/**
 * South Eastern University of Sri Lanka (SEUSL) — HASHCORE '26
 * Flagship Cyber Citadel & Hackathon Championship
 * 
 * Architecture:
 * 1. Navbar — Clean single-layer transparent glass cyber navigation
 * 2. Hero — 240-frame interactive flight camera sequence
 *    - End frame (Frame 240) stays fixed in the background
 * 3. Timeline — Dual-track animated schedule (CTF + Web Dev) scrolling over Frame 240
 * 4. Team — Organizing Committee & community architects with portraits
 * 5. Posters — Shareable transmission posters with download & live social share
 * 6. Partners — Organized by SICT & Official Media Partner Agni Vision
 * 7. Footer — Animated 00148.png sentinel stage, summit directory & registration
 * 8. Register Portal — Automatic 240-frame flight sequence into Frame 240 background,
 *    CTF & Web Dev competition awareness tracks, welcome animation, single submission form.
 */
function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'register'
  const [initialRegisterTrack, setInitialRegisterTrack] = useState(null); // 'CTF' | 'WEB' | null

  // URL Hash Listener & Deep Linking
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#register') {
        setCurrentView('register');
      } else {
        setCurrentView('home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigateRegister = (track = null) => {
    setInitialRegisterTrack(track);
    setCurrentView('register');
    window.location.hash = '#register';
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleNavigateHome = () => {
    setInitialRegisterTrack(null);
    setCurrentView('home');
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
        /* Dedicated Registration Citadel Journey */
        <RegisterPortal 
          onBackToHome={handleNavigateHome}
          initialTrack={initialRegisterTrack}
        />
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

            {/* Organizing Committee & Community Leads */}
            <Team />

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
