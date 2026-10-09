import { useState, useMemo, useEffect, useRef } from 'react';
import './Timeline.css';

const TIMELINE_DATA = [
  {
    id: 'reg-open',
    date: 'OCTOBER 2026',
    day: '01',
    month: 'OCT',
    track: 'ALL',
    trackName: 'SEUSL DICT',
    title: 'Participant Registration Portal Opens',
    status: 'REGISTRATION OPEN',
    statusType: 'opening',
    badge: 'FREE ADMISSION',
    description: 'Registration opens for undergraduate students across all batches in the Department of Information and Communication Technology. Free participation with prior registration required.',
    highlights: ['Open to all ICT batches', 'Free participation', 'Prior registration required'],
  },
  {
    id: 'workshop-01',
    date: '24 OCTOBER 2026',
    day: '24',
    month: 'OCT',
    track: 'CTF',
    trackName: 'CYBERSECURITY · NETWORK & SECURITY',
    title: 'Workshop 01: CTF: From Awareness to Challenge',
    status: '8:30 AM – 4:30 PM',
    statusType: 'event',
    badge: 'WORKSHOP 01',
    description: 'An introduction to Capture The Flag (CTF) competitions, challenge categories, essential tools, preparation strategies, and hands-on cybersecurity challenges at SWT Hall, SEUSL.',
    highlights: [
      'CTF fundamentals & Cryptography',
      'Web Exploitation & Forensics',
      'OSINT & Beginner Roadmap',
    ],
  },
  {
    id: 'workshop-02',
    date: '31 OCTOBER 2026',
    day: '31',
    month: 'OCT',
    track: 'WEBDEV',
    trackName: 'WEB DEVELOPMENT · SOFTWARE TECH',
    title: 'Workshop 02: From Idea to Impact',
    status: '8:30 AM – 4:30 PM',
    statusType: 'event',
    badge: 'WORKSHOP 02',
    description: 'Explore how to turn real-world problems into web solutions, build prototypes, use modern development tools, and present projects in competitions at SWT Hall, SEUSL.',
    highlights: [
      'Idea Generation & UI/UX',
      'Web Dev & AI-Assisted Tools',
      'Deployment & Pitching',
    ],
  },
];

export default function Timeline({ onNavigateRegister }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const trackWrapperRef = useRef(null);
  const beamRef = useRef(null);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'ALL') return TIMELINE_DATA;
    return TIMELINE_DATA.filter((event) => event.track === activeFilter || event.track === 'ALL');
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

      const topOffset = windowHeight * 0.65;
      const progress = (topOffset - rect.top) / totalHeight;
      const clamped = Math.max(0, Math.min(1, progress));

      if (beamRef.current) {
        beamRef.current.style.height = `${clamped * 100}%`;
      }

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
    <section id="workshops" className="timeline-section">
      {/* Anchor for backwards compatibility */}
      <div id="timeline" style={{ position: 'relative', top: '-80px' }} />

      <div className="section-container">
        {/* ==================================================================
            1. WORKSHOPS SCHEDULE HEADER
            ================================================================== */}
        <div className="section-header text-center reveal-on-scroll">
          <span className="section-badge font-mono">AWARENESS WORKSHOP SERIES</span>
          <h2 className="section-title">
            FEATURED <span className="title-gradient">WORKSHOPS</span>
          </h2>
          <p className="section-desc">
            Two student-led awareness workshops designed to help students explore technical competitions,
            develop practical knowledge, and gain the confidence to participate in national and international competitions.
          </p>

          {/* Interactive Filter Pills */}
          <div className="timeline-filter-bar reveal-on-scroll stagger-1">
            <button
              type="button"
              className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveFilter('ALL')}
            >
              <span>All Sessions</span>
              <span className="filter-count">3</span>
            </button>
            <button
              type="button"
              className={`filter-btn ctf-tab ${activeFilter === 'CTF' ? 'active' : ''}`}
              onClick={() => setActiveFilter('CTF')}
            >
              <span className="tab-indicator ctf-dot" />
              <span>Workshop 01: CTF</span>
              <span className="filter-count">1</span>
            </button>
            <button
              type="button"
              className={`filter-btn webdev-tab ${activeFilter === 'WEBDEV' ? 'active' : ''}`}
              onClick={() => setActiveFilter('WEBDEV')}
            >
              <span className="tab-indicator webdev-dot" />
              <span>Workshop 02: Web Dev</span>
              <span className="filter-count">1</span>
            </button>
          </div>
        </div>

        {/* ==================================================================
            TIMELINE SPINE & SCHEDULE CARDS
            ================================================================== */}
        <div ref={trackWrapperRef} className="timeline-track-wrapper">
          <div className="timeline-center-spine">
            <div className="spine-base-line" />
            <div 
              ref={beamRef} 
              className="spine-lighting-beam" 
              style={{ height: '0%' }}
            >
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
              const isWeb = item.track === 'WEBDEV';

              return (
                <div 
                  key={item.id} 
                  data-id={item.id}
                  className={`timeline-item ${isEven ? 'item-left' : 'item-right'} ${isCTF ? 'track-ctf' : isWeb ? 'track-webdev' : 'track-all'}`}
                >
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

                  <div className={`timeline-branch-connector ${isEven ? 'branch-left' : 'branch-right'}`}>
                    <div className="branch-line-track" />
                    <div className="branch-line-laser" />
                    <div className="branch-line-spark" />
                  </div>

                  <div className="timeline-card">
                    <div className="card-ambient-glow" />
                    <div className="card-neon-trace" />
                    
                    <div className="card-top-row">
                      <span className={`track-pill ${isCTF ? 'pill-ctf' : isWeb ? 'pill-webdev' : 'pill-all'}`}>
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
                            const trackKey = item.track === 'CTF' ? 'CTF' : item.track === 'WEBDEV' ? 'WEB' : null;
                            onNavigateRegister(trackKey);
                          }
                        }}
                      >
                        <span>Register Now</span>
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

        {/* ==================================================================
            2. EVENT DETAILS SECTION
            ================================================================== */}
        <div id="details" className="event-details-block reveal-on-scroll">
          <div className="section-header text-center">
            <span className="section-badge font-mono">ESSENTIAL INFORMATION</span>
            <h2 className="section-title">
              EVENT <span className="title-gradient">DETAILS</span>
            </h2>
            <p className="section-desc">
              Key logistics and participation guidelines for HASHCORE v0.1 – 2026.
            </p>
          </div>

          <div className="event-details-grid">
            <div className="detail-card">
              <div className="detail-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" className="detail-svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
              </div>
              <div className="detail-info">
                <span className="detail-tag font-mono">DATES</span>
                <h4 className="detail-title">24 October & 31 October 2026</h4>
                <p className="detail-desc">Two scheduled full-day workshops</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" className="detail-svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
              </div>
              <div className="detail-info">
                <span className="detail-tag font-mono">TIME</span>
                <h4 className="detail-title">8:30 AM – 4:30 PM</h4>
                <p className="detail-desc">Full-day hands-on interactive sessions</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" className="detail-svg">
                  <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
              </div>
              <div className="detail-info">
                <span className="detail-tag font-mono">VENUE</span>
                <h4 className="detail-title">SWT Hall, SEUSL</h4>
                <p className="detail-desc">South Eastern University of Sri Lanka</p>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" className="detail-svg">
                  <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M23 21V19C22.9986 17.1771 21.765 15.5857 20 15.13" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M16 3.13C17.7699 3.58316 19.0078 5.17799 19.0078 7.005C19.0078 8.83201 17.7699 10.4268 16 10.88" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
              </div>
              <div className="detail-info">
                <span className="detail-tag font-mono">TARGET AUDIENCE</span>
                <h4 className="detail-title">Department of ICT</h4>
                <p className="detail-desc">Students of all batches in DICT, Faculty of Technology</p>
              </div>
            </div>

            <div className="detail-card highlight-card">
              <div className="detail-icon-wrap emerald">
                <svg viewBox="0 0 24 24" fill="none" className="detail-svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
              </div>
              <div className="detail-info">
                <span className="detail-tag font-mono emerald">PARTICIPATION</span>
                <h4 className="detail-title">Free Participation</h4>
                <p className="detail-desc">Prior registration required to secure your seat</p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================
            3. WHAT YOU'LL GAIN SECTION
            ================================================================== */}
        <div id="benefits" className="benefits-block reveal-on-scroll">
          <div className="section-header text-center">
            <span className="section-badge font-mono">VALUE & EMPOWERMENT</span>
            <h2 className="section-title">
              WHAT YOU'LL <span className="title-gradient">GAIN</span>
            </h2>
            <p className="section-desc">
              Discover technical competitions, learn from student experiences, explore practical challenges,
              and take your first step towards competing.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-badge font-mono">OUTCOME // 01</div>
              <h3 className="benefit-title">Understand Technical Competitions</h3>
              <p className="benefit-desc">
                Gain deep understanding of how technical competitions and CTFs work, their problem domains, scoring models, and preparation cycles.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-badge font-mono">OUTCOME // 02</div>
              <h3 className="benefit-title">Discover Beginner Platforms & Tools</h3>
              <p className="benefit-desc">
                Discover beginner-friendly platforms, tools, and learning resources to start practicing immediately with confidence.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-badge font-mono">OUTCOME // 03</div>
              <h3 className="benefit-title">Introductory Practical Experience</h3>
              <p className="benefit-desc">
                Gain introductory practical experience through demonstrations, interactive walkthroughs, and guided technical activities.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-badge font-mono">OUTCOME // 04</div>
              <h3 className="benefit-title">Learn from Fellow Students</h3>
              <p className="benefit-desc">
                Learn from the real experiences of fellow senior students who have actively participated and achieved in technical competitions.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-badge font-mono">OUTCOME // 05</div>
              <h3 className="benefit-title">Connect & Find Teammates</h3>
              <p className="benefit-desc">
                Connect with like-minded students, share technical interests, and find potential teammates for future hackathons and CTF squads.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-badge font-mono">OUTCOME // 06</div>
              <h3 className="benefit-title">Build Competition Confidence</h3>
              <p className="benefit-desc">
                Build the practical confidence needed to participate in future national and international university technical competitions.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================================
            4. EVENT APPROACH SECTION
            ================================================================== */}
        <div className="approach-block reveal-on-scroll">
          <div className="section-header text-center">
            <span className="section-badge font-mono">METHODOLOGY</span>
            <h2 className="section-title">
              EVENT <span className="title-gradient">APPROACH</span>
            </h2>
            <p className="section-desc">
              A peer-driven model built to make technical competitions accessible, welcoming, and actionable.
            </p>
          </div>

          <div className="approach-grid">
            <div className="approach-card">
              <div className="approach-badge font-mono">PILLAR 01</div>
              <h3 className="approach-title">Students for Students</h3>
              <p className="approach-desc">
                Learn from peers and real student experiences in an encouraging, practical environment.
              </p>
            </div>

            <div className="approach-card">
              <div className="approach-badge font-mono">PILLAR 02</div>
              <h3 className="approach-title">Practical Learning</h3>
              <p className="approach-desc">
                Explore tools, platforms, demonstrations, and practical challenges that mirror real competitions.
              </p>
            </div>

            <div className="approach-card">
              <div className="approach-badge font-mono">PILLAR 03</div>
              <h3 className="approach-title">Beginner Roadmaps</h3>
              <p className="approach-desc">
                Discover actionable, step-by-step guidance on how to start preparing for technical competitions.
              </p>
            </div>

            <div className="approach-card">
              <div className="approach-badge font-mono">PILLAR 04</div>
              <h3 className="approach-title">Build Connections</h3>
              <p className="approach-desc">
                Meet potential teammates and grow your supportive technical community within the Department of ICT.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================================
            5. REGISTRATION BANNER SECTION
            ================================================================== */}
        <div className="workshop-register-banner reveal-on-scroll">
          <div className="banner-glass-box">
            <span className="banner-kicker font-mono">FREE PARTICIPATION • PRIOR REGISTRATION REQUIRED</span>
            <h2 className="banner-heading">Ready to Take on the Challenge?</h2>
            <p className="banner-subtext">
              Start your journey into technical competitions with HASHCORE v0.1 – 2026.
              Registration is free. Participants must register in advance.
            </p>
            <div className="banner-actions">
              <button
                type="button"
                className="btn-banner-register"
                onClick={() => onNavigateRegister && onNavigateRegister()}
              >
                <span>Register Now</span>
                <svg viewBox="0 0 24 24" fill="none" className="btn-arrow">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
