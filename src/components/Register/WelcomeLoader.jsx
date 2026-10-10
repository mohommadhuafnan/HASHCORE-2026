import { useEffect, useState, useRef } from 'react';
import hashcoreLogo from '../../assets/hashcore-logo.png';
import './WelcomeLoader.css';

// Static streams outside the component to prevent re-render recreation & timer reset loops
const CTF_CODE_STREAM = [
  { type: 'comment', text: '# SEUSL HASHCORE v0.1 – 2026 // WORKSHOP 01' },
  { type: 'import', text: 'import ctf_prep, cryptography, forensics' },
  { type: 'info', text: '[*] TOPIC: From Awareness to Challenge' },
  { type: 'cmd', text: 'roadmap = ctf_prep.load_beginner_roadmap()' },
  { type: 'success', text: '[+] Loading Web Exploitation & OWASP modules' },
  { type: 'info', text: '[*] Initializing Cryptography & Ciphers lab' },
  { type: 'warn', text: '[!] Hands-on cybersecurity challenges ready' },
  { type: 'cmd', text: 'verify_session(date="24-OCT-2026", venue="SWT Hall")' },
  { type: 'success', text: '[+] Session verified: 8:30 AM – 4:30 PM' },
  { type: 'special', text: '[✓] HASHCORE{CTF_AWARENESS_WORKSHOP_READY}' },
  { type: 'highlight', text: '[>>>] MODULES READY // OPENING REGISTRATION FORM' },
];

const WEB_CODE_STREAM = [
  { type: 'comment', text: '// SEUSL HASHCORE v0.1 – 2026 // WORKSHOP 02' },
  { type: 'import', text: 'import { IdeaToImpact, Prototyping } from "workshop";' },
  { type: 'info', text: '$ vite init --template from-idea-to-impact' },
  { type: 'success', text: '✓ UI/UX & Web Development curriculum loaded' },
  { type: 'cmd', text: 'const workshop = new WebDevAwareness();' },
  { type: 'info', text: '[topics] Idea Generation, AI-Assisted Tools, Pitching' },
  { type: 'warn', text: '[session] 31 October 2026 @ SWT Hall, SEUSL' },
  { type: 'success', text: '✓ Environment configured: 8:30 AM – 4:30 PM' },
  { type: 'special', text: 'dist/modules/web-dev-impact.js compiled [OK]' },
  { type: 'highlight', text: '[✓] MODULES READY // OPENING REGISTRATION FORM' },
];

export default function WelcomeLoader({ track, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [linesCount, setLinesCount] = useState(1);
  const terminalScrollRef = useRef(null);

  const isCTF = track === 'CTF';
  const stream = isCTF ? CTF_CODE_STREAM : WEB_CODE_STREAM;

  useEffect(() => {
    const duration = 2200; // 2.2 seconds smooth progression
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      const count = Math.min(
        stream.length,
        Math.max(1, Math.floor((pct / 100) * stream.length) + 1)
      );
      setLinesCount(count);

      if (terminalScrollRef.current) {
        terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 300);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [stream, onComplete]);

  return (
    <div className={`welcome-loader-hud ${isCTF ? 'hud-ctf' : 'hud-web'}`}>
      <div className="hud-ambient-glow" />

      <div className="hud-card">
        {/* Rotating # PNG Logo in Center */}
        <div className="hud-logo-wrapper">
          <div className="hud-rotating-ring" />
          <img
            src={hashcoreLogo}
            alt="SEUSL HASHCORE Logo"
            className="hud-rotating-logo"
          />
        </div>

        {/* Track Badge & Title */}
        <div className="hud-badge font-mono">
          <span className="hud-pulsing-dot" />
          <span>{isCTF ? 'WORKSHOP 01 // FROM AWARENESS TO CHALLENGE' : 'WORKSHOP 02 // FROM IDEA TO IMPACT (WEB DEV)'}</span>
        </div>

        <h2 className="hud-title">
          {isCTF ? (
            <>PREPARING <span className="hud-accent">CTF WORKSHOP MODULES</span></>
          ) : (
            <>PREPARING <span className="hud-accent">WEB DEV WORKSHOP MODULES</span></>
          )}
        </h2>

        {/* Real Auto-scrolling Code Terminal */}
        <div className="hud-terminal">
          <div className="hud-terminal-header">
            <div className="hud-terminal-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <span className="hud-terminal-tab font-mono">
              {isCTF ? 'ctf_exploit.py' : 'web_engine.tsx'}
            </span>
            <span className="hud-live-tag font-mono">LIVE EXECUTION</span>
          </div>

          <div className="hud-terminal-body" ref={terminalScrollRef}>
            {stream.slice(0, linesCount).map((line, idx) => (
              <div key={idx} className={`hud-code-line line-${line.type} font-mono`}>
                <span className="line-num">{String(idx + 1).padStart(2, '0')}</span>
                <span className="line-text">{line.text}</span>
              </div>
            ))}
            <div className="hud-cursor-line font-mono">
              <span className="hud-cursor">▋</span>
            </div>
          </div>
        </div>

        {/* Neon Progress Bar & Percentage */}
        <div className="hud-progress-wrap">
          <div className="hud-progress-meta font-mono">
            <span>{progress < 100 ? 'ENVIRONMENT COMPILATION' : 'COMPILATION COMPLETE // LAUNCHING FORM'}</span>
            <span className="hud-progress-val">{progress}%</span>
          </div>
          <div className="hud-progress-bar">
            <div className="hud-progress-fill" style={{ width: `${progress}%` }}>
              <div className="hud-fill-glow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
