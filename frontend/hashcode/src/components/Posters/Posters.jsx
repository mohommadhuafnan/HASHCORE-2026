import React, { useState } from 'react';
import posterMainImg from '../../frame/00240.webp';
import posterCtfImg from '../../frame/00001.webp';
import posterWebDevImg from '../../frame/00120.webp';
import './Posters.css';

const POSTERS_DATA = [
  {
    id: 'poster-main',
    title: 'SEUSL HASHCORE 2026 — Official Summit Poster',
    category: 'FLAGSHIP EVENT POSTER',
    resolution: '1920 x 1080 Full HD',
    aspect: '16:9 Landscape',
    image: posterMainImg,
    description: 'The master citadel key visual featuring the grand castle of South Eastern University of Sri Lanka.',
    badge: 'OFFICIAL KEY VISUAL',
  },
  {
    id: 'poster-ctf',
    title: 'CTF & Cyber Defense — Track 01 Arena Poster',
    category: 'CYBERSECURITY POSTER',
    resolution: '1920 x 1080 Full HD',
    aspect: '16:9 Landscape',
    image: posterCtfImg,
    description: 'Dedicated promotional artwork for the CTF tournament, reverse engineering labs, and network defense arena.',
    badge: 'TRACK 01 PROMO',
  },
  {
    id: 'poster-webdev',
    title: 'Web Dev & Hackathon — Track 02 Sprint Poster',
    category: 'HACKATHON POSTER',
    resolution: '1920 x 1080 Full HD',
    aspect: '16:9 Landscape',
    image: posterWebDevImg,
    description: 'Official visual for the 24-hour fullstack engineering challenge and UI/UX design masterclass.',
    badge: 'TRACK 02 PROMO',
  },
];

export default function Posters() {
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleDownload = (imgUrl, filename) => {
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <section id="posters" className="posters-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="header-badge">
            <span className="badge-pulse-dot" />
            <span>MEDIA ASSETS // SHAREABLE ARCHIVES</span>
          </div>
          <h2 className="section-title">
            TRANSMISSION <span className="title-gradient">POSTERS</span>
          </h2>
          <p className="section-desc">
            Spread the word across your campus, developer communities, and social networks.
            Download high-resolution official posters and share event transmissions.
          </p>

          {/* Quick Share Hub */}
          <div className="share-hub-bar">
            <button type="button" className="share-link-btn" onClick={handleShareLink}>
              <svg viewBox="0 0 24 24" fill="none" className="share-icon">
                <path d="M10 13C10.4295 13.5741 10.9774 14.0492 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.0471 17.54 13.54L20.54 10.54C21.4508 9.59688 21.9548 8.33399 21.9434 7.02347C21.932 5.71295 21.4061 4.45781 20.4789 3.52848C19.5518 2.59915 18.2977 2.06994 16.9872 2.05481C15.6767 2.03968 14.4128 2.53982 13.4667 3.44667L11.83 5.08" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60706C11.7643 9.26329 11.0685 9.05886 10.3533 9.00768C9.63821 8.9565 8.92036 9.05973 8.24866 9.31028C7.57695 9.56083 6.96689 9.95293 6.46 10.46L3.46 13.46C2.54921 14.4031 2.04523 15.666 2.05663 16.9765C2.06803 18.2871 2.59392 19.5422 3.52108 20.4715C4.44824 21.4009 5.70229 21.9301 7.01281 21.9452C8.32333 21.9603 9.58723 21.4602 10.5333 20.5533L12.16 18.91" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{copiedToast ? 'Transmission Link Copied!' : 'Copy Event Link'}</span>
            </button>

            <div className="social-quick-shares">
              <a 
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Join South Eastern University of Sri Lanka's Flagship Event — HASHCORE '26! CTF & Hackathon: " + window.location.href)}`} 
                target="_blank" 
                rel="noreferrer" 
                className="social-share-pill"
                title="Share via WhatsApp"
              >
                <span>WhatsApp</span>
              </a>
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} 
                target="_blank" 
                rel="noreferrer" 
                className="social-share-pill"
                title="Share on LinkedIn"
              >
                <span>LinkedIn</span>
              </a>
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("SEUSL HASHCORE 2026: The Premier University Tech & Cyber Summit! ") }&url=${encodeURIComponent(window.location.href)}`} 
                target="_blank" 
                rel="noreferrer" 
                className="social-share-pill"
                title="Share on X"
              >
                <span>X / Twitter</span>
              </a>
            </div>
          </div>
        </div>

        {/* Posters Showcase Grid */}
        <div className="posters-grid">
          {POSTERS_DATA.map((poster) => (
            <div key={poster.id} className="poster-card">
              {/* Poster Image Container with Hover Overlay */}
              <div className="poster-image-box" onClick={() => setSelectedPoster(poster)}>
                <img 
                  src={poster.image} 
                  alt={poster.title} 
                  className="poster-preview-img"
                  loading="lazy"
                />
                <div className="poster-hover-overlay">
                  <div className="zoom-btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" className="zoom-svg">
                      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="11" y1="8" x2="11" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="hover-click-hint">Click to Enlarge</span>
                </div>
                <span className="poster-badge">{poster.badge}</span>
              </div>

              {/* Poster Metadata & Actions */}
              <div className="poster-card-body">
                <span className="poster-category">{poster.category}</span>
                <h3 className="poster-title">{poster.title}</h3>
                <p className="poster-description">{poster.description}</p>
                
                <div className="poster-specs">
                  <span>{poster.resolution}</span>
                  <span className="spec-dot">•</span>
                  <span>{poster.aspect}</span>
                </div>

                <div className="poster-card-actions">
                  <button 
                    type="button" 
                    className="btn-download-poster"
                    onClick={() => handleDownload(poster.image, poster.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="btn-icon">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Download Poster</span>
                  </button>

                  <button 
                    type="button" 
                    className="btn-preview-poster"
                    onClick={() => setSelectedPoster(poster)}
                  >
                    <span>Full View</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Poster Zoom */}
      {selectedPoster && (
        <div className="poster-lightbox-modal" onClick={() => setSelectedPoster(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="lightbox-close-btn"
              onClick={() => setSelectedPoster(null)}
              aria-label="Close modal"
            >
              ✕
            </button>
            <img 
              src={selectedPoster.image} 
              alt={selectedPoster.title} 
              className="lightbox-img" 
            />
            <div className="lightbox-footer">
              <div className="lightbox-titles">
                <h4>{selectedPoster.title}</h4>
                <p>{selectedPoster.resolution} • High Definition Transmission</p>
              </div>
              <button 
                type="button" 
                className="btn-download-poster primary"
                onClick={() => handleDownload(selectedPoster.image, selectedPoster.id)}
              >
                <span>Save to Device</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
