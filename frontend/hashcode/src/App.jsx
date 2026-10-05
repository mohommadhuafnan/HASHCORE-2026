import React from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Timeline from './components/Timeline/Timeline';
import Team from './components/Team/Team';
import Posters from './components/Posters/Posters';
import Partners from './components/Partners/Partners';
import Footer from './components/Footer/Footer';
import './App.css';

/**
 * South Eastern University of Sri Lanka (SEUSL) — HASHCORE '26
 * Flagship Cyber Citadel & Hackathon Championship
 * 
 * Architecture:
 * 1. Navbar — Clean single-layer transparent glass cyber navigation
 * 2. Hero — 240-frame interactive flight camera sequence
 *    - End frame (Frame 240) stays fixed in the background with 100% original, untouched colors
 * 3. Timeline — Dual-track animated schedule (CTF + Web Dev) scrolling over Frame 240
 * 4. Team — Organizing Committee & community architects with portraits
 * 5. Posters — Shareable transmission posters with download & live social share
 * 6. Partners — Organized by SICT & Official Media Partner Agni Vision
 * 7. Footer — Animated 00148.png sentinel stage, summit directory & registration
 */
function App() {
  return (
    <div className="app-citadel-root">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      <main>
        {/* 2. 240-Frame Interactive Journey & Continuous Fixed Citadel Background */}
        <Hero />

        {/* 3. Content Stream: Glides smoothly from top to bottom over Frame 240 */}
        <div className="citadel-scrolling-content">
          {/* Dual-Track Chronological Timeline */}
          <Timeline />

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
        <Footer />
      </main>
    </div>
  );
}

export default App;
