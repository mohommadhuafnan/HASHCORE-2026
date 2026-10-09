import { useEffect, useState, useRef } from 'react';
import hashcoreLogo from '../../assets/hashcore-logo.png';
import './WelcomeLoader.css';

/**
 * Modern High-Tech Coding Loading Animation:
 * Features real scrolling code streams tailored for WEB (React, Vite, TypeScript, Tailwind)
 * and CTF (Python exploit, Reverse Engineering, Sockets, OWASP payload).
 * Features the official HASHCORE logo with glowing cyber energy aura.
 */
export default function WelcomeLoader({ track, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [activeCodeLines, setActiveCodeLines] = useState([]);
  const terminalScrollRef = useRef(null);

  const isCTF = track === 'CTF';

  const ctfCodeStream = [
    { type: 'comment', text: '# SEUSL HASHCORE 2026 // CTF DEFENSE ARENA INIT' },
    { type: 'import',  text: 'import socket, ssl, hashlib, struct, sys' },
    { type: 'dim',     text: 'from pwn import remote, p64, u64, log' },
    { type: 'info',    text: '[*] TARGET: arena.hashcore2026.tech:1337 [SEUSL]' },
    { type: 'cmd',     text: 's = socket.socket(socket.AF_INET, socket.SOCK_STREAM)' },
    { type: 'success', text: '[+] Socket stream connected. Latency: 4ms' },
    { type: 'info',    text: '[*] Scanning challenge ports: 22, 80, 443, 31337... [OPEN]' },
    { type: 'warn',    text: '[!] Cryptographic schema: RSA-4096 + AES-256-GCM verified' },
    { type: 'cmd',     text: 'payload = b"A" * 72 + p64(0x7fff5fbff7c0) + shellcode' },
    { type: 'info',    text: '[*] Bypassing WAF rules // OWASP Top 10 Challenge Engine' },
    { type: 'dim',     text: 'heap_base = u64(leak.ljust(8, b"\\x00")) - 0x1e3b0' },
    { type: 'success', text: '[+] Memory leak confirmed: 0x7fff5fbff7c0 -> Executed' },
    { type: 'cmd',     text: 's.sendline(payload)' },
    { type: 'success', text: '[+] Reverse shell handshake verified: uid=0(root)' },
    { type: 'special', text: '[✓] HASHCORE{S3USL_CTF_2026_ACC3SS_GR4NT3D}' },
    { type: 'highlight', text: '[>>>] CLEARANCE 100% GRANTED // WELCOME TO CTF REGISTRATION' },
  ];

  const webCodeStream = [
    { type: 'comment', text: '// SEUSL HASHCORE 2026 // FULLSTACK COMPILATION ENGINE' },
    { type: 'import',  text: 'import React, { useState, useEffect } from "react";' },
    { type: 'dim',     text: 'import { createRoot } from "react-dom/client";' },
    { type: 'info',    text: '$ vite build --target esnext --mode production' },
    { type: 'cmd',     text: 'const app = express(); app.use(cors());' },
    { type: 'success', text: '✓ 148 modules transformed in 38ms [Vite v6.2.0]' },
    { type: 'info',    text: '[react] Compiling App.tsx & component router tree...' },
    { type: 'warn',    text: '[tailwind] Generating JIT CSS tokens & liquid glass utilities...' },
    { type: 'cmd',     text: 'const db = await MongoClient.connect(MONGO_URI);' },
    { type: 'info',    text: '[db] MongoDB Atlas cluster verified: cluster0.seusl.mongodb.net' },
    { type: 'dim',     text: 'POST /api/register -> Zod schema validation [PASS]' },
    { type: 'success', text: '✓ Webhook: Google Apps Script high-deliverability active' },
    { type: 'cmd',     text: 'wss.on("connection", ws => ws.send("READY_HASHCORE"));' },
    { type: 'success', text: '✓ WebSocket secure stream established: wss://hashcore2026.tech' },
    { type: 'special', text: 'dist/assets/index.js 288.18 kB │ gzip: 86.14 kB' },
    { type: 'highlight', text: '[✓] HACKATHON WORKSPACE READY // WELCOME TO WEB DEV REGISTRATION' },
  ];

  const stream = isCTF ? ctfCodeStream : webCodeStream;

  // Stream lines dynamically and calculate smooth progress
  useEffect(() => {
    const duration = 2600; // 2.6 seconds total runtime
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      // Number of code lines to show based on progress
      const targetLinesCount = Math.min(
        stream.length,
        Math.max(1, Math.floor((pct / 100) * stream.length) + 1)
      );

      setActiveCodeLines(stream.slice(0, targetLinesCount));

      // Auto-scroll terminal downward to show the newest code line
      if (terminalScrollRef.current) {
        terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
      }

      if (pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 350);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [stream, onComplete]);

  // Ambient scrolling background columns
  const bgCodeSnippets = isCTF
    ? [
        '0x7fff5fbff7c0\npwn.remote(target)\nasm(shellcraft.sh())\nflag = leak.split()[0]\nAES.new(key, AES.MODE_GCM)\nconnect(ip, 1337)',
        'NOP_SLED = b"\\x90"*32\nBufferOverflow(0x401142)\nMOV RAX, [RBP-0x8]\nROPgadget --binary ./ctf\nOWASP_TEST: PASS',
        'SELECT * FROM ctf_users\nJWT.verify(token, pubkey)\nsys.stdout.flush()\nRSA.importKey(secret)\npacket_sniffer.start()',
      ]
    : [
        'npm run build\nvite --host 0.0.0.0\nexport default App;\nconst [user, setUser] = useState();\nuseEffect(() => sync(), []);\nTailwind.config()',
        'POST /api/register\nres.status(200).json({ ok: true })\nMongoClient.connect()\nWebSocket("wss://seu.ac.lk")\nimport { Canvas } from "three"',
        'git commit -m "feat"\nCI/CD Pipeline: SUCCESS\nDocker container: running\nHTML5 Canvas 60fps\nBuffer.from(payload, "base64")',
      ];

  return (
    <div className={`coding-loader-backdrop ${isCTF ? 'theme-ctf' : 'theme-web'}`}>
      {/* Background Matrix / Ambient Code Waterfall */}
      <div className="ambient-code-rain" aria-hidden="true">
        {bgCodeSnippets.map((snip, i) => (
          <pre key={i} className={`rain-col rain-col-${i + 1}`}>
            {snip}
          </pre>
        ))}
      </div>

      {/* Radial Energy Back-Glow */}
      <div className="loader-center-glow" />

      <div className="coding-loader-card">
        {/* Top Header with Official Hashcore Logo */}
        <div className="loader-logo-section">
          <div className="logo-ring-wrapper">
            <div className="rotating-energy-ring" />
            <img 
              src={hashcoreLogo} 
              alt="SEUSL HASHCORE Logo" 
              className="loader-hashcore-logo" 
            />
          </div>

          <div className="loader-badge font-mono">
            <span className="pulsing-radar-dot" />
            <span>
              {isCTF 
                ? '[ CTF ARENA // CYBER DEFENSE ENVIRONMENT ]' 
                : '[ WEB SPRINT // FULLSTACK DEVELOPMENT ENVIRONMENT ]'}
            </span>
          </div>

          <h2 className="loader-heading">
            {isCTF ? (
              <>INITIALIZING <span className="highlight-color">CTF SECURITY</span></>
            ) : (
              <>COMPILING <span className="highlight-color">WEB MAINFRAME</span></>
            )}
          </h2>
          <p className="loader-subheading">
            SOUTH EASTERN UNIVERSITY OF SRI LANKA • FACULTY OF TECHNOLOGY
          </p>
        </div>

        {/* Real Dynamic Auto-Scrolling Code Terminal */}
        <div className="code-terminal-window">
          <div className="terminal-header-bar">
            <div className="terminal-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <div className="terminal-tab-title font-mono">
              <span className="file-icon">⚡</span>
              <span>{isCTF ? 'ctf_exploit_engine.py' : 'App_Fullstack_Engine.tsx'}</span>
            </div>
            <div className="terminal-live-tag font-mono">
              <span className="live-pulse" />
              <span>LIVE REEL</span>
            </div>
          </div>

          {/* Scrolling Terminal Code Body */}
          <div className="terminal-code-scroll" ref={terminalScrollRef}>
            {activeCodeLines.map((line, idx) => (
              <div key={idx} className={`code-stream-line line-${line.type} font-mono`}>
                <span className="line-num">{String(idx + 1).padStart(2, '0')}</span>
                <span className="line-text">{line.text}</span>
              </div>
            ))}
            <div className="typing-cursor-line font-mono">
              <span className="cursor-caret">▋</span>
            </div>
          </div>
        </div>

        {/* High-Tech Progress Bar & Readout */}
        <div className="loader-progress-section">
          <div className="progress-labels font-mono">
            <span>
              {progress < 100 ? 'ENVIRONMENT COMPILATION IN PROGRESS' : 'ENVIRONMENT READY // LAUNCHING FORM'}
            </span>
            <span className="progress-percent-val">{progress}%</span>
          </div>
          <div className="progress-track-bar">
            <div 
              className="progress-fill-bar" 
              style={{ width: `${progress}%` }}
            >
              <div className="fill-glow-particle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
