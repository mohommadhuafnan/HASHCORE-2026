import { useEffect, useRef, useState, useCallback } from 'react';
import { frameLoader, TOTAL_FRAMES } from './frameLoader';
import SmokeCanvas from './SmokeCanvas';
import hashcoreLogo from '../../assets/logo.png';
import RegistrationCountdown, { WORKSHOP_UNLOCK_DATES, useRegistrationCountdown } from '../common/RegistrationCountdown';
import './Hero.css';

export default function Hero({ onNavigateRegister }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const textStage1Ref = useRef(null);
  const textStage2Ref = useRef(null);
  const textStage3Ref = useRef(null);
  const textStage4Ref = useRef(null);
  const scrollBarRef = useRef(null);

  // Velocity tracking ref passed to dynamic SmokeCanvas
  const scrollVelocityRef = useRef(0);

  const [initialLoaded, setInitialLoaded] = useState(false);
  const ctfCountdown = useRegistrationCountdown(WORKSHOP_UNLOCK_DATES.CTF);
  const webCountdown = useRegistrationCountdown(WORKSHOP_UNLOCK_DATES.WEB);

  // Animation & Rendering state stored in refs for 120 FPS performance with 0 React re-renders during scroll
  const animState = useRef({
    currentFrame: 0,
    targetFrame: 0,
    smoothedProgress: 0,
    lastDrawnIndex: -1,
    lastScrollY: 0,
    rafId: null,
  });

  /**
   * Draws a given frame image onto the canvas with crisp object-fit: cover
   */
  const drawFrameToCanvas = useCallback((img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1920;
    const ih = img.naturalHeight || 1080;

    const canvasRatio = cw / ch;
    const imgRatio = iw / ih;

    let dw, dh, dx, dy;
    if (canvasRatio > imgRatio) {
      dw = cw;
      dh = cw / imgRatio;
      dx = 0;
      dy = (ch - dh) / 2;
    } else {
      dh = ch;
      dw = ch * imgRatio;
      dx = (cw - dw) / 2;
      dy = 0;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  /**
   * Handles canvas resolution scaling with DPR
   */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    // Re-draw current frame immediately on resize
    const { frame } = frameLoader.getClosestFrame(animState.current.currentFrame);
    if (frame) {
      drawFrameToCanvas(frame);
    }
  }, [drawFrameToCanvas]);

  /**
   * Calculates smooth opacity and transform for each text moment
   */
  const calculateStageVisibility = (p, start, peakStart, peakEnd, end) => {
    if (p < start || p > end) {
      return { opacity: 0, translateY: p < start ? 24 : -24, display: 'none' };
    }
    let opacity = 1;
    let translateY = 0;

    if (p < peakStart) {
      const t = (p - start) / (peakStart - start);
      opacity = t;
      translateY = (1 - t) * 20;
    } else if (p > peakEnd) {
      const t = (p - peakEnd) / (end - peakEnd);
      opacity = 1 - t;
      translateY = -t * 20;
    }

    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      translateY,
      display: opacity > 0.02 ? 'flex' : 'none',
    };
  };

  /**
   * Updates text overlay elements directly via DOM styles for max 120 FPS efficiency
   */
  const updateTextLayers = useCallback((progress) => {
    // Stage 1: Beginning (0.00 -> 0.18)
    if (textStage1Ref.current) {
      const s1 = calculateStageVisibility(progress, -0.05, 0.0, 0.12, 0.18);
      textStage1Ref.current.style.opacity = s1.opacity;
      textStage1Ref.current.style.transform = `translate3d(0, ${s1.translateY}px, 0)`;
      textStage1Ref.current.style.display = s1.display;
    }

    // Stage 2: Middle - Technology / Defense (0.22 -> 0.44)
    if (textStage2Ref.current) {
      const s2 = calculateStageVisibility(progress, 0.22, 0.28, 0.38, 0.44);
      textStage2Ref.current.style.opacity = s2.opacity;
      textStage2Ref.current.style.transform = `translate3d(0, ${s2.translateY}px, 0)`;
      textStage2Ref.current.style.display = s2.display;
    }

    // Stage 3: Two Tracks Spotlight (0.48 -> 0.70)
    if (textStage3Ref.current) {
      const s3 = calculateStageVisibility(progress, 0.48, 0.54, 0.66, 0.72);
      textStage3Ref.current.style.opacity = s3.opacity;
      textStage3Ref.current.style.transform = `translate3d(0, ${s3.translateY}px, 0)`;
      textStage3Ref.current.style.display = s3.display;
    }

    // Stage 4: Arrival / The Citadel / CTA (0.76 -> 0.94)
    // Seamlessly fades out at 0.96 as the user reaches Frame 240, clearing the screen for Timeline!
    if (textStage4Ref.current) {
      const s4 = calculateStageVisibility(progress, 0.76, 0.82, 0.90, 0.96);
      textStage4Ref.current.style.opacity = s4.opacity;
      textStage4Ref.current.style.transform = `translate3d(0, ${s4.translateY}px, 0)`;
      textStage4Ref.current.style.display = s4.display;
    }
  }, []);

  /**
   * Main Render and Interpolation Loop (rAF)
   * High-precision responsive smoothing for 100% accurate frame tracking
   */
  const startAnimationLoop = useCallback(() => {
    const renderLoop = () => {
      const state = animState.current;

      // Responsive interpolation factor (fast, buttery smooth, zero sluggishness)
      const smoothingFactor = 0.16;

      const frameDelta = state.targetFrame - state.currentFrame;
      if (Math.abs(frameDelta) > 0.005) {
        state.currentFrame += frameDelta * smoothingFactor;
      } else {
        state.currentFrame = state.targetFrame;
      }

      // Compute smoothed progress [0, 1]
      state.smoothedProgress = state.currentFrame / (TOTAL_FRAMES - 1);

      // Integer frame index for canvas [0, 239]
      const targetRenderIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(state.currentFrame)));

      // Render only if index changed
      if (targetRenderIndex !== state.lastDrawnIndex) {
        const { frame } = frameLoader.getClosestFrame(targetRenderIndex);
        if (frame) {
          drawFrameToCanvas(frame);
          state.lastDrawnIndex = targetRenderIndex;
        }
      }

      // Step-by-step gradual blur for the last 30 frames (indices 210 to 239), reaching 20% blur at the final frame
      const BLUR_START_INDEX = TOTAL_FRAMES - 30; // 210
      const MAX_BLUR_PX = 8; // 20% blur level (8px Gaussian blur on 40px baseline)
      const canvas = canvasRef.current;
      if (canvas) {
        if (state.currentFrame >= BLUR_START_INDEX) {
          const blurProgress = Math.min(1, Math.max(0, (state.currentFrame - BLUR_START_INDEX) / (TOTAL_FRAMES - 1 - BLUR_START_INDEX)));
          const currentBlur = blurProgress * MAX_BLUR_PX;
          canvas.style.filter = `brightness(0.82) contrast(1.06) blur(${currentBlur.toFixed(2)}px)`;
        } else if (canvas.style.filter !== 'brightness(0.82) contrast(1.06)') {
          canvas.style.filter = 'brightness(0.82) contrast(1.06)';
        }
      }

      // Update text overlays synchronized with frame progress
      updateTextLayers(state.smoothedProgress);

      // Update progress bar
      if (scrollBarRef.current) {
        scrollBarRef.current.style.transform = `scaleX(${state.smoothedProgress})`;
        scrollBarRef.current.style.opacity = state.smoothedProgress >= 0.96 ? '0' : '1';
      }

      // Decay velocity when idle
      scrollVelocityRef.current *= 0.88;

      state.rafId = requestAnimationFrame(renderLoop);
    };

    animState.current.rafId = requestAnimationFrame(renderLoop);
  }, [drawFrameToCanvas, updateTextLayers]);

  /**
   * Passive Scroll & Gesture Listeners:
   * Maps document scroll position accurately to target frame [0, 239]
   */
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const totalScrollable = container.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;

      // Calculate accurate velocity
      const velocity = currentScrollY - animState.current.lastScrollY;
      scrollVelocityRef.current = velocity;
      const direction = velocity >= 0 ? 1 : -1;
      animState.current.lastScrollY = currentScrollY;

      // Normalized progress [0, 1]
      const progress = Math.max(0, Math.min(1, currentScrollY / totalScrollable));

      // 100% accurate target frame [0, 239]
      const target = progress * (TOTAL_FRAMES - 1);
      animState.current.targetFrame = target;

      // Trigger intelligent window preloading ahead of scroll
      frameLoader.preloadWindow(target, direction, 28);
    };

    // Wheel listener to feed smoke velocity directly
    const handleWheel = (e) => {
      scrollVelocityRef.current = e.deltaY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const anim = animState.current;
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', resizeCanvas);
      if (anim.rafId) {
        cancelAnimationFrame(anim.rafId);
      }
    };
  }, [resizeCanvas]);

  /**
   * Initialize Critical Frames and start loop
   */
  useEffect(() => {
    resizeCanvas();
    updateTextLayers(0);
    startAnimationLoop();

    // Critical first-load strategy:
    // Frame 0 loads first and draws to screen right away!
    frameLoader.loadCriticalFrames((firstFrame) => {
      if (firstFrame) {
        drawFrameToCanvas(firstFrame);
        animState.current.lastDrawnIndex = 0;
        setInitialLoaded(true);
      }
    });

    // Listen to newly cached frames to update canvas if we're waiting for a closer frame
    const unsubscribe = frameLoader.subscribe((loadedIndex) => {
      const currentIndex = Math.round(animState.current.currentFrame);
      if (Math.abs(loadedIndex - currentIndex) <= 1) {
        const { frame } = frameLoader.getClosestFrame(currentIndex);
        if (frame) {
          drawFrameToCanvas(frame);
          animState.current.lastDrawnIndex = currentIndex;
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [drawFrameToCanvas, resizeCanvas, startAnimationLoop, updateTextLayers]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="hero-scroll-container"
    >
      {/* Sticky Viewport Housing Canvas, Dynamic Smoke, and Overlays */}
      <div className={`hero-sticky-viewport ${initialLoaded ? 'is-loaded' : ''}`}>
        {/* Cinematic WebGL / 2D Canvas */}
        <canvas
          ref={canvasRef}
          className="hero-canvas"
          aria-label="3D Cinematic Camera Scroll Experience for SEUSL HASHCORE 2026"
        />

        {/* Dynamic Atmospheric Smoke System (Reacts to Idle and Scroll Velocity) */}
        <SmokeCanvas scrollVelocityRef={scrollVelocityRef} />

        {/* Cinematic Atmosphere Overlays */}
        <div className="hero-overlay-vignette" />
        <div className="hero-cyber-grid" />
        {/* Subtle Scroll Progress Bar */}
        <div className="hero-scroll-indicator-bar">
          <div ref={scrollBarRef} className="scroll-fill" />
        </div>

        {/* ==================================================================
            TEXT MOMENT 1: Beginning (0% - 20% scroll)
            University & Event Introduction
            ================================================================== */}
        <div ref={textStage1Ref} className="hero-text-stage stage-1">
          <div className="stage-content">
            <h1 className="hero-main-title hero-logo-title">
              <img
                src={hashcoreLogo}
                alt="SEUSL HASHCORE 2026 - Society of ICT"
                className="hero-main-logo"
              />
            </h1>
            <div className="hero-scroll-hint">
              <div className="mouse-icon">
                <span className="mouse-wheel" />
              </div>
              <span className="scroll-hint-text">SCROLL TO ENTER THE CITADEL</span>
            </div>
          </div>
        </div>

        {/* ==================================================================
            TEXT MOMENT 2: Middle (28% - 46% scroll)
            Technology & Proving Ground Statement
            ================================================================== */}
        <div ref={textStage2Ref} className="hero-text-stage stage-2">
          <div className="stage-content">
            <h2 className="stage-heading">
              LEARN. BUILD. WIN..<br />
              <span className="gradient-text-emerald">Grow.</span>
            </h2>
            <p className="stage-description">
              Where ICT students step into technical competitions. Explore cybersecurity challenges, modern web development, and practical innovation in a student-led environment designed for all skill levels.
            </p>
          </div>
        </div>

        {/* ==================================================================
            TEXT MOMENT 3: Later (54% - 76% scroll)
            The Two Workshop & Competition Categories
            ================================================================== */}
        <div ref={textStage3Ref} className="hero-text-stage stage-3">
          <div className="stage-content wide">
            <h2 className="stage-heading compact">
              TWO BATTLEGROUNDS. TWO WORLDS
            </h2>

            <div className="tracks-grid">
              {/* Track 1: Network & Security Technologies */}
              <div className="track-card ctf-card">
                <div className="track-card-glow" />
                <div className="track-header">
                  <span className="track-num">TRACK // 01 · 24 OCT 2026</span>
                  <div className="track-badge-icon">
                    <svg viewBox="0 0 24 24" fill="none" className="icon-svg">
                      <path d="M12 2L3 7V12C3 17.52 6.84 22.45 12 23.5C17.16 22.45 21 17.52 21 12V7L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M12 8V16M9 11L12 8L15 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <h3 className="track-title">FROM AWARENESS TO CHALLENGE</h3>
                <p className="track-desc">
                  Network & Security Technologies: An introduction to Capture The Flag (CTF) competitions,
                  challenge categories, essential tools, preparation strategies, and hands-on cybersecurity challenges.
                </p>
                <div className="track-tags">
                  <span>CTF Fundamentals</span>
                  <span>Cryptography</span>
                  <span>Web Exploitation</span>
                  <span>Digital Forensics</span>
                  <span>OSINT</span>
                  <span>Beginner Roadmap</span>
                </div>

                {/* Real-Time Registration Countdown */}
                <RegistrationCountdown targetDate={WORKSHOP_UNLOCK_DATES.CTF} track="CTF" />

                <div className="track-card-action">
                  {ctfCountdown.isUnlocked ? (
                    <a
                      href="#register"
                      className="track-enroll-btn ctf"
                      onClick={(e) => {
                        if (onNavigateRegister) {
                          e.preventDefault();
                          onNavigateRegister('CTF');
                        }
                      }}
                    >
                      <span>Register for Workshop 01</span>
                      <svg viewBox="0 0 24 24" fill="none" className="enroll-arrow">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="track-enroll-btn is-locked-cta"
                      title="Workshop 01 registration opens October 11, 2026 at 9:30 AM"
                      onClick={() => {
                        alert('Workshop 01: CTF: From Awareness to Challenge registration officially opens on October 11, 2026 at 9:30 AM.');
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="btn-lock-icon">
                        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                      </svg>
                      <span>Opens Oct 11 · 9:30 AM</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Track 2: Software Technologies */}
              <div className="track-card dev-card">
                <div className="track-card-glow" />
                <div className="track-header">
                  <span className="track-num">TRACK // 02 · 31 OCT 2026</span>
                  <div className="track-badge-icon">
                    <svg viewBox="0 0 24 24" fill="none" className="icon-svg">
                      <path d="M16 18L22 12L16 6M8 6L2 12L8 18M14 2L10 22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <h3 className="track-title">FROM IDEA TO IMPACT</h3>
                <p className="track-desc">
                  Software Technologies: Explore how to turn real-world problems into web solutions,
                  build prototypes, use modern development tools, and present projects in competitions.
                </p>
                <div className="track-tags">
                  <span>Idea Generation</span>
                  <span>UI/UX Design</span>
                  <span>Web Development</span>
                  <span>AI-Assisted Tools</span>
                  <span>Cloud Deployment</span>
                  <span>Pitching</span>
                </div>

                {/* Real-Time Registration Countdown */}
                <RegistrationCountdown targetDate={WORKSHOP_UNLOCK_DATES.WEB} track="WEB" />

                <div className="track-card-action">
                  {webCountdown.isUnlocked ? (
                    <a
                      href="#register"
                      className="track-enroll-btn web"
                      onClick={(e) => {
                        if (onNavigateRegister) {
                          e.preventDefault();
                          onNavigateRegister('WEB');
                        }
                      }}
                    >
                      <span>Register for Workshop 02</span>
                      <svg viewBox="0 0 24 24" fill="none" className="enroll-arrow">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="track-enroll-btn is-locked-cta"
                      title="Workshop 02 registration opens October 16, 2026 at 9:30 AM"
                      onClick={() => {
                        alert('Workshop 02: From Idea to Impact registration officially opens on October 16, 2026 at 9:30 AM.');
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="btn-lock-icon">
                        <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                      </svg>
                      <span>Opens Oct 16 · 9:30 AM</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================
            TEXT MOMENT 4: Ending (84% - 100% scroll)
            Grand Citadel Arrival & Call-to-Action
            ================================================================== */}
        <div ref={textStage4Ref} className="hero-text-stage stage-4">
          <div className="stage-content">
            <h2 className="stage-heading large">
              START YOUR  <span className="gradient-text-emerald">COMPETITIVE JOURNEY</span>
            </h2>
            <p className="stage-description">
              Faculty of Technology at SEUSL welcomes students of all batches to explore technical competitions and build practical skills.
            </p>
            <div className="stage-actions">
              <a
                href="#register"
                className="btn-hero-primary"
                onClick={(e) => {
                  if (onNavigateRegister) {
                    e.preventDefault();
                    onNavigateRegister();
                  }
                }}
              >
                <span className="btn-glow-ring" />
                <span className="btn-text">Register Now</span>
                <svg viewBox="0 0 24 24" fill="none" className="btn-arrow">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#timeline" className="btn-hero-secondary">
                <span>Explore Tracks</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Future Content Anchor: Next sections will naturally seamlessly dock here */}
      <div id="citadel-next-anchor" className="hero-future-anchor" />
    </section>
  );
}
