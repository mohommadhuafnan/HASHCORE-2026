import { useState, useEffect } from 'react';
import './RegistrationCountdown.css';

/**
 * Official Workshop Registration Unlock Target Dates:
 * - Workshop 01 (CTF): October 11, 2026 at 9:30 AM (SLST / GMT+5:30)
 * - Workshop 02 (Web/Software): October 16, 2026 at 9:30 AM (SLST / GMT+5:30)
 */
export const WORKSHOP_UNLOCK_DATES = {
  CTF: new Date('2026-10-11T09:30:00+05:30'),
  WEB: new Date('2026-10-16T09:30:00+05:30'),
};

export function isWorkshopUnlocked(track) {
  const key = (track || '').toUpperCase();
  const target = (key === 'CTF' || key.includes('CTF')) ? WORKSHOP_UNLOCK_DATES.CTF : WORKSHOP_UNLOCK_DATES.WEB;
  if (!target) return false;
  const targetTime = target instanceof Date ? target.getTime() : new Date(target).getTime();
  return Date.now() >= targetTime;
}

export function useRegistrationCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(target) {
  const targetTime = target instanceof Date ? target.getTime() : new Date(target).getTime();
  const diff = Math.max(0, targetTime - Date.now());
  const isUnlocked = diff <= 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { diff, isUnlocked, days, hours, minutes, seconds };
}

export default function RegistrationCountdown({ targetDate, track = 'CTF', compact = false }) {
  const { isUnlocked, days, hours, minutes, seconds } = useRegistrationCountdown(targetDate);

  if (isUnlocked) {
    return (
      <div className={`reg-countdown-box is-live ${track.toLowerCase()}-accent ${compact ? 'compact' : ''}`}>
        <span className="live-pulse-dot" />
        <span className="live-status-text font-mono">REGISTRATION IS OPEN NOW</span>
      </div>
    );
  }

  return (
    <div className={`reg-countdown-box is-locked-timer ${track.toLowerCase()}-accent ${compact ? 'compact' : ''}`}>
      <div className="countdown-top-header">
        <div className="lock-label-row">
          <svg viewBox="0 0 24 24" fill="none" className="countdown-lock-svg">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1.5" fill="currentColor" />
          </svg>
          <span className="countdown-kicker font-mono">REGISTRATION OPENS IN</span>
        </div>
      </div>

      <div className="countdown-digits-grid">
        <div className="countdown-digit-cell">
          <span className="digit-val font-mono">{String(days).padStart(2, '0')}</span>
          <span className="digit-label font-mono">DAYS</span>
        </div>
        <span className="countdown-separator font-mono">:</span>
        <div className="countdown-digit-cell">
          <span className="digit-val font-mono">{String(hours).padStart(2, '0')}</span>
          <span className="digit-label font-mono">HOURS</span>
        </div>
        <span className="countdown-separator font-mono">:</span>
        <div className="countdown-digit-cell">
          <span className="digit-val font-mono">{String(minutes).padStart(2, '0')}</span>
          <span className="digit-label font-mono">MINS</span>
        </div>
        <span className="countdown-separator font-mono">:</span>
        <div className="countdown-digit-cell">
          <span className="digit-val font-mono">{String(seconds).padStart(2, '0')}</span>
          <span className="digit-label font-mono">SECS</span>
        </div>
      </div>
    </div>
  );
}
