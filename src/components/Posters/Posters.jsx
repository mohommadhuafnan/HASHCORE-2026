import { useState, useEffect, useRef } from 'react';
import posterLaunchImg from '../../assets/posters/poster-launch.jpg';
import posterTeaserImg from '../../assets/posters/poster-teaser.jpg';
import './Posters.css';

// Only official posters (duplicated to enable continuous seamless 3D coverflow carousel)
const POSTERS_DATA = [
  {
    id: 'poster-launch-1',
    title: 'SEUSL HASHCORE 2026 — Official Website Launch',
    image: posterLaunchImg,
    filename: 'SEUSL-HASHCORE-2026-Website-Launch',
  },
  {
    id: 'poster-teaser-1',
    title: 'Battles of Minds in Two Worlds — Something Big is on the Way',
    image: posterTeaserImg,
    filename: 'SEUSL-HASHCORE-2026-Something-Big',
  },
  {
    id: 'poster-launch-2',
    title: 'SEUSL HASHCORE 2026 — Official Website Launch',
    image: posterLaunchImg,
    filename: 'SEUSL-HASHCORE-2026-Website-Launch',
  },
  {
    id: 'poster-teaser-2',
    title: 'Battles of Minds in Two Worlds — Something Big is on the Way',
    image: posterTeaserImg,
    filename: 'SEUSL-HASHCORE-2026-Something-Big',
  },
];

export default function Posters() {
  const [selectedPoster, setSelectedPoster] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0); // Focus on the new Launch Poster first
  const [isPaused, setIsPaused] = useState(false);

  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  // Auto-looping carousel with pause on hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % POSTERS_DATA.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + POSTERS_DATA.length) % POSTERS_DATA.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % POSTERS_DATA.length);
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
  };

  const handleDownload = async (imgUrl, filename) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${filename}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      const a = document.createElement('a');
      a.href = imgUrl;
      a.download = `${filename}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <section id="posters" className="posters-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="section-header text-center reveal-on-scroll">
          <h2 className="section-title">
            TRANSMISSION <span className="title-gradient">POSTERS</span>
          </h2>
          <p className="section-desc">
            Spread the word across your campus, developer communities, and social networks.
            Download high-resolution official posters and share event transmissions.
          </p>
        </div>

        {/* ==============================================================
            Modern 3D Looping Poster Carousel
            Center card is large, side cards are smaller with 3D looping flow
            ============================================================== */}
        <div 
          className="posters-carousel-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Ambient Cyber Light Glow behind center poster */}
          <div className="carousel-ambient-glow" />

          {/* Navigation Controls */}
          <button 
            type="button" 
            className="carousel-nav-btn prev-btn" 
            onClick={handlePrev}
            aria-label="Previous poster"
            title="Previous poster"
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-arrow-icon">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button 
            type="button" 
            className="carousel-nav-btn next-btn" 
            onClick={handleNext}
            aria-label="Next poster"
            title="Next poster"
          >
            <svg viewBox="0 0 24 24" fill="none" className="nav-arrow-icon">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 3D Carousel Stage */}
          <div className="posters-carousel-stage">
            {POSTERS_DATA.map((poster, index) => {
              const total = POSTERS_DATA.length;
              let diff = (index - activeIndex) % total;
              if (diff < -Math.floor(total / 2)) diff += total;
              if (diff > Math.floor(total / 2)) diff -= total;

              let positionClass = 'card-center';
              if (diff === -1) positionClass = 'card-left';
              else if (diff === 1) positionClass = 'card-right';
              else if (diff < -1) positionClass = 'card-far-left';
              else if (diff > 1) positionClass = 'card-far-right';

              const isCenter = diff === 0;

              return (
                <div 
                  key={poster.id} 
                  className={`poster-3d-card ${positionClass} ${isCenter ? 'is-active' : ''}`}
                  onClick={() => {
                    if (!isCenter) {
                      setActiveIndex(index);
                    }
                  }}
                >
                  {/* Poster Image Container — 100% Uncropped Full Artwork */}
                  <div 
                    className="poster-image-box" 
                    onClick={(e) => {
                      if (isCenter) {
                        e.stopPropagation();
                        setSelectedPoster(poster);
                      }
                    }}
                  >
                    <img 
                      src={poster.image} 
                      alt={poster.title} 
                      className="poster-preview-img is-loaded"
                      loading="lazy"
                      decoding="async"
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
                  </div>

                  {/* Clean Minimal Action Bar — No Bulky Text, Borderless */}
                  <div className="poster-card-actions-bar">
                    <h3 className="poster-clean-title" title={poster.title}>{poster.title}</h3>
                    <div className="poster-action-btns">
                      <button 
                        type="button" 
                        className="btn-download-poster"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(poster.image, poster.filename || poster.id);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" className="btn-icon">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Download</span>
                      </button>

                      <button 
                        type="button" 
                        className="btn-preview-poster"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPoster(poster);
                        }}
                      >
                        <span>Full View</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Looping Dots & Auto-Loop Status Indicator (2 Unique Official Posters) */}
          <div className="carousel-dots-pagination">
            {[0, 1].map((dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                className={`carousel-dot ${(activeIndex % 2) === dotIdx ? 'active' : ''}`}
                onClick={() => setActiveIndex(dotIdx)}
                aria-label={`Switch to poster ${dotIdx + 1}`}
                title={`Switch to poster ${dotIdx + 1}`}
              >
                <span className="dot-fill" />
              </button>
            ))}
            <div className="carousel-loop-tag font-mono">
              <span className={`loop-indicator ${!isPaused ? 'is-spinning' : ''}`}>⟳</span>
              <span>{isPaused ? 'PAUSED' : 'AUTO-LOOPING'}</span>
            </div>
          </div>
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
                <p>2048 x 2048 Ultra HD • Official Transmission Poster</p>
              </div>
              <button 
                type="button" 
                className="btn-download-poster primary"
                onClick={() => handleDownload(selectedPoster.image, selectedPoster.filename || selectedPoster.id)}
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
