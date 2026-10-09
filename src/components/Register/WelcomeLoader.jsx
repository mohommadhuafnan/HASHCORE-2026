import { useEffect, useState, useRef } from 'react';
import hashcoreLogo from '../../assets/hashcore-logo.png';
import './WelcomeLoader.css';

// Static streams outside the component to prevent re-render recreation & timer reset loops
const CTF_CODE_STREAM = [
  { type: 'comment', text: '# SEUSL HASHCORE 2026 // CTF DEFENSE ARENA' },
  { type: 'import',  text: 'import socket, ssl, hashlib, struct' },
  { type: 'info',    text: '[*] TARGET: arena.hashcore2026.tech:1337' },
  { type: 'cmd',     text: 's = socket.socket(AF_INET, SOCK_STREAM)' },
  { type: 'success', text: '[+] Socket stream connected. Latency: 4ms' },
  { type: 'info',    text: '[*] Scanning ports: 22, 80, 443, 31337 [OPEN]' },
  { type: 'warn',    text: '[!] Cryptographic: RSA-4096 + AES-256-GCM' },
  { type: 'cmd',     text: 'payload = b"A"*72 + p64(0x7fff5fbff7c0)' },
  { type: 'success', text: '[+] Memory leak: 0x7fff5fbff7c0 -> Verified' },
  { type: 'special', text: '[✓] HASHCORE{S3USL_CTF_2026_ACC3SS_GR4NT3D}' },
  { type: 'highlight', text: '[>>>] ACCESS 100% GRANTED // OPENING FORM' },
];

const WEB_CODE_STREAM = [
  { type: 'comment', text: '// SEUSL HASHCORE 2026 // FULLSTACK RUNTIME' },
  { type: 'import',  text: 'import React, { useState } from "react";' },
  { type: 'info',    text: '$ vite build --mode production' },
  { type: 'success', text: '✓ 148 modules transformed in 38ms' },
  { type: 'cmd',     text: 'const db = await MongoClient.connect(URI);' },
  { type: 'info',    text: '[db] Atlas cluster verified: seusl.mongodb.net' },
  { type: 'warn',    text: '[tailwind] Liquid glass UI tokens compiled' },
  { type: 'success', text: '✓ WebSocket secure stream connected' },
  { type: 'special', text: 'dist/assets/index.js 288 kB │ gzip: 86 kB' },
  { type: 'highlight', text: '[✓] WORKSPACE 100% READY // OPENING FORM' },
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
          <span>{isCTF ? 'TRACK 01 // CTF DEFENSE ARENA' : 'TRACK 02 // FULLSTACK WEB DEV'}</span>
        </div>

        <h2 className="hud-title">
          {isCTF ? (
            <>INITIALIZING <span className="hud-accent">CTF ARENA</span></>
          ) : (
            <>INITIALIZING <span className="hud-accent">WEB DEV ARENA</span></>
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
