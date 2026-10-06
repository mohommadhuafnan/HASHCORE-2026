import React, { useState, useMemo, useEffect, useRef } from 'react';
import './Timeline.css';

const TIMELINE_DATA = [
  {
    id: 'ctf-open',
    date: 'OCTOBER 10, 2026',
    day: '10',
    month: 'OCT',
    track: 'CTF',
    trackName: 'CTF & CYBERSECURITY',
    title: 'CTF Squad Registration Opens',
    status: 'OPENS SOON',
    statusType: 'opening',
    badge: 'STAGE 01',
    description: 'Registration opens for undergraduate squads across Sri Lanka. Form teams of 2 to 4 members to compete in jeopardy-style and attack-defense cyber challenges.',
    highlights: ['Team size: 2-4 members', 'Automated portal verification', 'Discord squad onboarding'],
  },
  {
    id: 'webdev-open',
    date: 'OCTOBER 15, 2026',
    day: '15',
    month: 'OCT',
    track: 'WEBDEV',
    trackName: 'WEB DEVELOPMENT & HACKATHON',
    title: 'Web Dev & Hackathon Registration Opens',
    status: 'OPENS SOON',
    statusType: 'opening',
    badge: 'STAGE 02',
    description: 'Registration portal opens for fullstack developers, UI/UX designers, and systems architects. Prepare for real-world enterprise problem statements.',
    highlights: ['Individual or squads up to 4', 'Fullstack & Cloud tracks', 'Hardware/AI tracks open'],
  },
  {
    id: 'ctf-close',
    date: 'OCTOBER 20, 2026',
    day: '20',
    month: 'OCT',
    track: 'CTF',
    trackName: 'CTF & CYBERSECURITY',
    title: 'CTF Registration Hard Cutoff',
    status: 'FINAL DEADLINE',
    statusType: 'deadline',
    badge: 'CRITICAL',
    description: 'Official registration deadline for all CTF competitors. Credentials, VPN tunnel configs, and arena sandbox access distributed to verified leads.',
    highlights: ['23:59 PM Sri Lanka Time', 'VPN access credential issuance', 'Team roster freezing'],
  },
  {
    id: 'ctf-workshop',
    date: 'OCTOBER 24, 2026',
    day: '24',
    month: 'OCT',
    track: 'CTF',
    trackName: 'CTF & CYBERSECURITY',
    title: 'Live CTF Hands-On Workshop & Proving Ground',
    status: 'LIVE SESSION',
    statusType: 'event',
    badge: 'WORKSHOP',
    description: 'Masterclass conducted by elite offensive security specialists and alumni. Live hands-on labs in binary exploitation, reverse engineering, web penetration, and cryptographic warfare.',
    highlights: ['Interactive VM Labs', 'Vulnerability exploitation demo', 'Faculty of Technology Labs & Online Stream'],
  },
  {
    id: 'webdev-close',
    date: 'OCTOBER 25, 2026',
    day: '25',
    month: 'OCT',
    track: 'WEBDEV',
    trackName: 'WEB DEVELOPMENT & HACKATHON',
    title: 'Web Dev & Hackathon Registration Cutoff',
    status: 'FINAL DEADLINE',
    statusType: 'deadline',
    badge: 'CRITICAL',
    description: 'Final deadline for hackathon participant submissions. Problem domains, API credentials, and mentor pairing announcements.',
    highlights: ['23:59 PM Sri Lanka Time', 'Repo boilerplate distribution', 'Mentor assignment'],
  },
  {
    id: 'webdev-workshop',
    date: 'OCTOBER 31, 2026',
    day: '31',
    month: 'OCT',
    track: 'WEBDEV',
    trackName: 'WEB DEVELOPMENT & HACKATHON',
    title: 'Web Development Workshop & 24H Hackathon Launch',
    status: 'FLAGSHIP SPRINT',
    statusType: 'event',
    badge: 'CHAMPIONSHIP',
    description: 'Flagship workshop on modern web architecture, distributed systems, and AI integration followed immediately by the HASHCORE 24-hour sprint build.',
    highlights: ['24-Hour continuous build', 'Industry judges & live demo evaluation', 'Grand cash prizes & recruitment fast-track'],
  },
];

export default function Timeline({ onNavigateRegister }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const trackWrapperRef = useRef(null);
  const beamRef = useRef(null);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'ALL') return TIMELINE_DATA;
    return TIMELINE_DATA.filter((event) => event.track === activeFilter);
  }, [activeFilter]);

  // High-performance 120 FPS Scroll Lighting Animation
  useEffect(() => {
    const handleScroll = () => {
      const el = trackWrapperRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = rect.height;
      if (totalHeight <= 0) return;

      // Start lighting beam when timeline header enters 65% of viewport
      const topOffset = windowHeight * 0.65;
      const progress = (topOffset - rect.top) / totalHeight;
      const clamped = Math.max(0, Math.min(1, progress));

      // Direct style update — 0 React re-renders during scroll
      if (beamRef.current) {
        beamRef.current.style.height = `${clamped * 100}%`;
      }

      // Check each item position to illuminate with lighting
      const items = el.querySelectorAll('.timeline-item');
      items.forEach((itemEl) => {
        const itemRect = itemEl.getBoundingClientRect();
        const node = itemEl.querySelector('.timeline-node');
        const card = itemEl.querySelector('.timeline-card');

        if (itemRect.top <= windowHeight * 0.72) {
          itemEl.classList.add('is-lit');
          if (node) node.classList.add('node-illuminated');
          if (card) card.classList.add('card-illuminated');
        } else {
          itemEl.classList.remove('is-lit');
          if (node) node.classList.remove('node-illuminated');
          if (card) card.classList.remove('card-illuminated');
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [activeFilter]);

  return (
    <section id="timeline" className="timeline-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="header-badge">
            <span className="badge-pulse-dot" />
            <span>OPERATIONAL SCHEDULE // HASHCORE '26</span>
          </div>
          <h2 className="section-title">
            DUAL-TRACK <span className="title-gradient">TIMELINE</span>
          </h2>
          <p className="section-desc">
            Two distinct battlegrounds, synchronized execution. Track key registration windows,
            live workshop training dates, and competition milestones for SEUSL HASHCORE 2026.
          </p>

          {/* Interactive Filter Pills */}
          <div className="timeline-filter-bar">
            <button
              type="button"
              className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              <span>Unified Schedule</span>
              <span className="filter-count">6</span>
            </button>
            <button
              type="button"
              className={`filter-btn ctf-tab ${activeFilter === 'CTF' ? 'active' : ''}`}
              onClick={() => setActiveFilter('CTF')}
            >
              <span className="tab-indicator ctf-dot" />
              <span>CTF & Cybersecurity</span>
              <span className="filter-count">3</span>
            </button>
            <button
              type="button"
              className={`filter-btn webdev-tab ${activeFilter === 'WEBDEV' ? 'active' : ''}`}
              onClick={() => setActiveFilter('WEBDEV')}
            >
              <span className="tab-indicator webdev-dot" />
              <span>Web Dev & Hackathon</span>
              <span className="filter-count">3</span>
            </button>
          </div>
        </div>

        {/* Timeline Spine & Nodes with Scroll-Driven Lighting */}
        <div ref={trackWrapperRef} className="timeline-track-wrapper">
          {/* Central Laser Spine with Electric Lighting Beam */}
          <div className="timeline-center-spine">
            <div className="spine-base-line" />
            
            {/* Scroll-Driven Lighting Beam */}
            <div 
              ref={beamRef} 
              className="spine-lighting-beam" 
              style={{ height: '0%' }}
            >
              {/* Plasma Spark Head crackling at the tip */}
              <div className="lighting-plasma-head">
                <div className="plasma-core" />
                <div className="plasma-ring" />
                <div className="plasma-flare" />
              </div>
            </div>
          </div>

          <div className="timeline-items-list">
            {filteredEvents.map((item, index) => {
              const isEven = index % 2 === 0;
              const isCTF = item.track === 'CTF';

              return (
                <div 
                  key={item.id} 
                  data-id={item.id}
                  className={`timeline-item ${isEven ? 'item-left' : 'item-right'} ${isCTF ? 'track-ctf' : 'track-webdev'}`}
                >
                  {/* Central Node on the Spine */}
                  <div className="timeline-node">
                    <div className="node-outer-ring">
                      <div className="node-inner-core" />
                      <div className="node-energy-pulse" />
                    </div>
                    <div className="node-date-stamp">
                      <span className="stamp-day">{item.day}</span>
                      <span className="stamp-month">{item.month}</span>
                    </div>
                  </div>

                  {/* Horizontal Branch Line connecting Spine Node to Card */}
                  <div className={`timeline-branch-connector ${isEven ? 'branch-left' : 'branch-right'}`}>
                    <div className="branch-line-track" />
                    <div className="branch-line-laser" />
                    <div className="branch-line-spark" />
                  </div>

                  {/* Event Card with Electric Border & Glow */}
                  <div className="timeline-card">
                    <div className="card-ambient-glow" />
                    <div className="card-neon-trace" />
                    
                    <div className="card-top-row">
                      <span className={`track-pill ${isCTF ? 'pill-ctf' : 'pill-webdev'}`}>
                        {item.trackName}
                      </span>
                      <span className={`status-pill status-${item.statusType}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="card-date-banner">
                      <svg viewBox="0 0 24 24" fill="none" className="calendar-icon">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                        <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.8" />
                      </svg>
                      <span>{item.date}</span>
                    </div>

                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-description">{item.description}</p>

                    <div className="card-highlights">
                      {item.highlights.map((hl, i) => (
                        <div key={i} className="highlight-tag">
                          <span className="tag-check">›</span>
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>

                    <div className="card-footer-action">
                      <a 
                        href="#register" 
                        className="card-action-btn"
                        onClick={(e) => {
                          if (onNavigateRegister) {
                            e.preventDefault();
                            const trackKey = item.track === 'CTF' ? 'CTF' : 'WEB';
                            onNavigateRegister(trackKey);
                          }
                        }}
                      >
                        <span>{item.statusType === 'event' ? 'Workshop Details' : 'Register Now'}</span>
                        <svg viewBox="0 0 24 24" fill="none" className="arrow-icon">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
