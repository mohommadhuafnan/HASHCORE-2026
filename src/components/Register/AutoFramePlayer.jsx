import { useEffect, useRef, useState, useCallback } from 'react';
import { frameLoader, TOTAL_FRAMES } from '../Hero/frameLoader';

/**
 * AutoFramePlayer:
 * Automatically plays the 240 cinematic frames from start to finish
 * without requiring the user to scroll manually.
 * Reaches the final Frame 240 and seamlessly hands off to the Registration Portal.
 */
export default function AutoFramePlayer({ onComplete, onSkip }) {
  const canvasRef = useRef(null);
  const [currentFrameNum, setCurrentFrameNum] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);

  const animRef = useRef({
    frameIndex: 0,
    lastTime: 0,
    rafId: null,
    targetFps: 42, // Silky smooth playback (~5.5 seconds for 240 frames)
    finished: false,
  });

  const drawFrame = useCallback((img) => {
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

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);

    const { frame } = frameLoader.getClosestFrame(Math.round(animRef.current.frameIndex));
    if (frame) {
      drawFrame(frame);
    }
  }, [drawFrame]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Eager preload starting chunk
    frameLoader.preloadWindow(0, 1, 40);

    const frameInterval = 1000 / animRef.current.targetFps;

    const loop = (timestamp) => {
      if (animRef.current.finished) return;

      if (!animRef.current.lastTime) {
        animRef.current.lastTime = timestamp;
      }

      const elapsed = timestamp - animRef.current.lastTime;

      if (elapsed >= frameInterval) {
        animRef.current.lastTime = timestamp - (elapsed % frameInterval);

        const nextIndex = animRef.current.frameIndex + 1;

        if (nextIndex >= TOTAL_FRAMES - 1) {
          // Reached final frame 240!
          animRef.current.frameIndex = TOTAL_FRAMES - 1;
          animRef.current.finished = true;

          const { frame } = frameLoader.getClosestFrame(TOTAL_FRAMES - 1);
          if (frame) drawFrame(frame);

          setCurrentFrameNum(TOTAL_FRAMES);
          setProgressPercent(100);

          // Small pause at the apex frame before transition
          setTimeout(() => {
            onComplete();
          }, 350);
          return;
        }

        animRef.current.frameIndex = nextIndex;

        // Preload ahead in flight direction
        if (nextIndex % 10 === 0) {
          frameLoader.preloadWindow(nextIndex, 1, 35);
        }

        const { frame } = frameLoader.getClosestFrame(nextIndex);
        if (frame) {
          drawFrame(frame);
        }

        // Gradual blur on last 30 frames reaching 20% blur (8px) on final frame
        const BLUR_START_INDEX = TOTAL_FRAMES - 30;
        const canvas = canvasRef.current;
        if (canvas) {
          if (nextIndex >= BLUR_START_INDEX) {
            const blurProgress = Math.min(1, Math.max(0, (nextIndex - BLUR_START_INDEX) / (TOTAL_FRAMES - 1 - BLUR_START_INDEX)));
            const currentBlur = blurProgress * 8;
            canvas.style.filter = `brightness(0.82) contrast(1.06) blur(${currentBlur.toFixed(2)}px)`;
          } else {
            canvas.style.filter = 'brightness(0.82) contrast(1.06)';
          }
        }

        setCurrentFrameNum(nextIndex + 1);
        setProgressPercent(Math.round(((nextIndex + 1) / TOTAL_FRAMES) * 100));
      }

      anim.rafId = requestAnimationFrame(loop);
    };

    const anim = animRef.current;
    anim.rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (anim.rafId) {
        cancelAnimationFrame(anim.rafId);
      }
    };
  }, [drawFrame, onComplete, resizeCanvas]);

  return (
    <div className="auto-player-container">
      {/* 240-Frame Cinematic Canvas */}
      <canvas ref={canvasRef} className="auto-player-canvas" />

      {/* Atmospheric Overlays */}
      <div className="auto-player-vignette" />
      <div className="auto-player-speedlines" />
      <div className="auto-player-grid" />

      {/* Cyber Hyperdrive HUD Header */}
      <div className="auto-player-header">
        <div className="hud-badge">
          <span className="hud-dot pulsing" />
          <span>AUTONAV PROTOCOL // SEUSL CITADEL TRANSIT</span>
        </div>
        <button 
          type="button" 
          onClick={onSkip} 
          className="btn-skip-warp"
          aria-label="Skip flight sequence"
        >
          <span>Skip Sequence</span>
          <svg viewBox="0 0 24 24" fill="none" className="skip-arrow">
            <path d="M13 5L20 12L13 19M5 5L12 12L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Center Cinematic Telemetry */}
      <div className="auto-player-center-telemetry">
        <div className="telemetry-bracket left" />
        <div className="telemetry-content">
          <span className="telemetry-tag">CITADEL MAINFRAME HYPERJUMP</span>
          <h2 className="telemetry-title">APPROACHING REGISTRATION PORTAL</h2>
          <p className="telemetry-sub">Calibrating optics & aligning with Frame 240 Sentinel Base...</p>
        </div>
        <div className="telemetry-bracket right" />
      </div>

      {/* Bottom HUD: Progress & Frame Telemetry */}
      <div className="auto-player-footer">
        <div className="hud-data-row">
          <div className="hud-metric">
            <span className="metric-label">CAMERA SEQUENCE</span>
            <span className="metric-value font-mono">
              FRAME {String(currentFrameNum).padStart(3, '0')} / {TOTAL_FRAMES}
            </span>
          </div>

          <div className="hud-metric center">
            <span className="metric-status">AUTOMATIC REEL PLAYBACK</span>
            <div className="hud-soundwaves">
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </div>
          </div>

          <div className="hud-metric right">
            <span className="metric-label">WARP PROGRESS</span>
            <span className="metric-value font-mono">{progressPercent}%</span>
          </div>
        </div>

        {/* Glowing Progress Track */}
        <div className="hud-progress-track">
          <div 
            className="hud-progress-fill" 
            style={{ width: `${progressPercent}%` }}
          >
            <div className="hud-progress-glow" />
          </div>
        </div>
      </div>
    </div>
  );
}
