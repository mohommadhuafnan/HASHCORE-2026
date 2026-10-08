import { useEffect, useRef } from 'react';
import farookImg from '../../assets/team/farook.jpg';
import rizwanImg from '../../assets/team/rizwan.jpg';
import kavinduImg from '../../assets/team/kavindu.jpg';
import zahraImg from '../../assets/team/zahra.jpg';
import tharinduImg from '../../assets/team/tharindu.jpg';
import nisalImg from '../../assets/team/nisal.jpg';
import './Team.css';

const LEADERSHIP_NODES = [
  {
    id: 'patron',
    name: 'Prof. M. Farook',
    position: 'Faculty Patron & Advisor',
    division: 'Dean, Faculty of Technology, SEUSL',
    badge: 'EXECUTIVE PATRON',
    avatar: farookImg,
  },
  {
    id: 'chair',
    name: 'Ahamed Rizwan',
    position: 'Overall Event Chair',
    division: 'President, SICT (Society of ICT)',
    badge: 'EVENT CHAIR',
    avatar: rizwanImg,
  },
];

const MEMBER_BRANCHES = [
  {
    id: 'ctf-lead',
    name: 'Kavindu Senanayake',
    position: 'Head of CTF Track',
    division: 'Cyber Security Research Lab',
    badge: 'HEAD OF CTF',
    avatar: kavinduImg,
    trackType: 'ctf',
  },
  {
    id: 'webdev-lead',
    name: 'Fathima Zahra',
    position: 'Head of Software Track',
    division: 'Fullstack Systems & AI Lead',
    badge: 'HEAD OF SOFTWARE',
    avatar: zahraImg,
    trackType: 'webdev',
  },
  {
    id: 'tech-ops',
    name: 'Tharindu Perera',
    position: 'Cloud & Infrastructure Lead',
    division: 'DevOps & Scalability Ops',
    badge: 'TECH OPS LEAD',
    avatar: tharinduImg,
    trackType: 'ctf',
  },
  {
    id: 'media-lead',
    name: 'Nisal Fernando',
    position: 'Creative Director & Media Lead',
    division: 'Executive Lead, Agni Vision',
    badge: 'MEDIA DIRECTOR',
    avatar: nisalImg,
    trackType: 'webdev',
  },
];

export default function Team() {
  const treeRef = useRef(null);

  // Scroll Lighting Animation for the Circuit Tree
  useEffect(() => {
    const handleScroll = () => {
      const el = treeRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // When the top of tree enters 75% of screen, energize the trunk
      if (rect.top <= windowHeight * 0.75) {
        el.classList.add('tree-illuminated');
      } else {
        el.classList.remove('tree-illuminated');
      }

      // Check each node card to light up individually as user scrolls
      const nodeCards = el.querySelectorAll('.tree-node-card');
      nodeCards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        if (cardRect.top <= windowHeight * 0.78) {
          card.classList.add('node-lit');
        } else {
          card.classList.remove('node-lit');
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
  }, []);

  return (
    <section id="team" className="team-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center reveal-on-scroll">
          <div className="header-badge">
            <span className="badge-pulse-dot" />
            <span>ORGANIZATIONAL HIERARCHY // COMMUNITY LEADS</span>
          </div>
          <h2 className="section-title">
            CITADEL <span className="title-gradient">ARCHITECTS</span>
          </h2>
          <p className="section-desc">
            The steering faculty mentors and specialized committee leads commanding South Eastern University of Sri Lanka's flagship summit.
          </p>
        </div>

        {/* Cyber Organizational Tree */}
        <div ref={treeRef} className="cyber-tree-wrapper">
          {/* Level 1: Leadership Tier (Top Nodes) */}
          <div className="tree-tier tier-leaders">
            {LEADERSHIP_NODES.map((leader) => (
              <div key={leader.id} className="tree-node-card leader-card">
                <div className="card-glass-glow" />
                <div className="avatar-frame">
                  <img 
                    src={leader.avatar} 
                    alt={leader.name} 
                    className="member-avatar-img lazy-img-smooth is-loaded"
                    loading="lazy" 
                    decoding="async"
                  />
                  <div className="avatar-hologram-ring" />
                </div>
                <span className="member-position-badge">{leader.badge}</span>
                <h3 className="member-name">{leader.name}</h3>
                <p className="member-position">{leader.position}</p>
                <p className="member-division">{leader.division}</p>
              </div>
            ))}
          </div>

          {/* Tree Circuit Junction (Trunk, Energy Pulse & Branch Lines) */}
          <div className="tree-circuit-junction">
            {/* Vertical Trunk Line coming down from Leaders */}
            <div className="vertical-trunk-line">
              <div className="trunk-energy-laser" />
            </div>

            {/* Central Pulse Junction Node */}
            <div className="trunk-junction-core">
              <div className="junction-pulse-ring" />
            </div>

            {/* Horizontal Bus Distribution Line */}
            <div className="horizontal-bus-line">
              <div className="bus-energy-laser" />
            </div>

            {/* Vertical Drops connecting the 4 Branch Cards */}
            <div className="bus-drop-lines">
              <div className="drop-line drop-1"><div className="drop-laser" /></div>
              <div className="drop-line drop-2"><div className="drop-laser" /></div>
              <div className="drop-line drop-3"><div className="drop-laser" /></div>
              <div className="drop-line drop-4"><div className="drop-laser" /></div>
            </div>
          </div>

          {/* Level 2: Member Branches (4 Track & Operations Leads) */}
          <div className="tree-tier tier-members">
            {MEMBER_BRANCHES.map((member) => (
              <div 
                key={member.id} 
                className={`tree-node-card member-card track-${member.trackType}`}
              >
                <div className="card-glass-glow" />
                <div className="avatar-frame small">
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="member-avatar-img lazy-img-smooth is-loaded"
                    loading="lazy" 
                    decoding="async"
                  />
                  <div className="avatar-hologram-ring" />
                </div>
                <span className="member-position-badge">{member.badge}</span>
                <h3 className="member-name">{member.name}</h3>
                <p className="member-position">{member.position}</p>
                <p className="member-division">{member.division}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
