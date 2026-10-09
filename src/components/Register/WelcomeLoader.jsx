import { useEffect, useState } from 'react';

/**
 * WelcomeLoader:
 * Custom, high-tech Welcome Loading Animation tailored for CTF or WEB tracks.
 * As requested: "user click the button web development or CTF user to added the welcome loading animation mention like a CTF or WEB after that came the submission forme"
 */
export default function WelcomeLoader({ track, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  const isCTF = track === 'CTF';

  const ctfLogs = [
    'ESTABLISHING ENCRYPTED PROXY // PORT 443 SECURE',
    'INITIALIZING SEUSL CTF SANDBOX PROTOCOL...',
    'INSPECTING OWASP & CRYPTOGRAPHIC CHALLENGE LABS...',
    'MOUNTING FORENSIC MEMORY PROFILER...',
    'CLEARANCE GRANTED // WELCOME TO CTF COMPETITION AWARENESS',
  ];

  const webLogs = [
    'BOOTING FULLSTACK VITE & NODE CITADEL ENGINE...',
    'SYNCING MODERN FRONTEND & UI/UX COMPONENT SCHEMAS...',
    'CONNECTING SEUSL WEBSOCKET & REST MAINFRAME...',
    'CALIBRATING 24H HACKATHON DEV SUITE...',
    'CLEARANCE GRANTED // WELCOME TO WEB DEV COMPETITION AWARENESS',
  ];

  const logs = isCTF ? ctfLogs : webLogs;

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // 2.4 seconds of stunning cyber welcome animation

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(rawProgress);

      const logIdx = Math.min(
        logs.length - 1,
        Math.floor((rawProgress / 100) * logs.length)
      );
      setCurrentLogIndex(logIdx);

      if (rawProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [logs.length, onComplete]);

  return (
    <div className={`welcome-loader-overlay ${isCTF ? 'ctf-theme' : 'web-theme'}`}>
      <div className="welcome-backdrop-scanline" />
      <div className="welcome-radial-glow" />

      <div className="welcome-center-box">
        {/* Animated Cyber Track Emblem */}
        <div className="welcome-emblem-wrap">
          <div className="emblem-ring-outer spinning" />
          <div className="emblem-ring-inner spinning-reverse" />
          
          <div className="emblem-core">
            {isCTF ? (
              /* CTF Cyber Shield Icon */
              <svg viewBox="0 0 24 24" fill="none" className="emblem-icon ctf">
                <path d="M12 2L3 7V12C3 17.52 6.84 22.45 12 23.5C17.16 22.45 21 17.52 21 12V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V16M9 11L12 8L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              /* WEB Code Brackets Icon */
              <svg viewBox="0 0 24 24" fill="none" className="emblem-icon web">
                <path d="M16 18L22 12L16 6M8 6L2 12L8 18M14 2L10 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>

        {/* Track Welcome Headers */}
        <div className="welcome-track-badge font-mono">
          <span>{isCTF ? '[ TRACK 01 // CTF SECURITY ]' : '[ TRACK 02 // WEB DEVELOPMENT ]'}</span>
        </div>

        <h1 className="welcome-main-title">
          {isCTF ? (
            <>
              Welcome to <span className="highlight-cyan">CTF</span> Registration
            </>
          ) : (
            <>
              Welcome to <span className="highlight-emerald">Web Development</span> Registration
            </>
          )}
        </h1>

        <p className="welcome-faculty-tag">
          SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY OF TECHNOLOGY
        </p>

        {/* Terminal Simulation Log Window */}
        <div className="welcome-terminal-box font-mono">
          <div className="terminal-top">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
            <span className="terminal-title">
              {isCTF ? 'ctf-sec-init.sh' : 'web-dev-init.sh'}
            </span>
          </div>
          <div className="terminal-body">
            <div className="log-line text-muted">
              {`> HASHCORE '26 SEUSL PROTOCOL LOADING...`}
            </div>
            <div className="log-line active-line">
              <span className="prompt-arrow">›</span> {logs[currentLogIndex]}
            </div>
          </div>
        </div>

        {/* Progress Bar & Numeric Readout */}
        <div className="welcome-progress-wrap">
          <div className="progress-info-row font-mono">
            <span>ENVIRONMENT SYNCHRONIZATION</span>
            <span>{progress}%</span>
          </div>
          <div className="welcome-progress-bar">
            <div 
              className="welcome-progress-bar-fill"
              style={{ width: `${progress}%` }}
            >
              <div className="bar-head-glow" />
            </div>
          </div>
        </div>

        <div className="welcome-sub-note">
          <span>Preparing participant registration form... Single submission rule applies.</span>
        </div>
      </div>
    </div>
  );
}
