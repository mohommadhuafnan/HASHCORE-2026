import { useState, useEffect } from 'react';
import OrganizerScan from './OrganizerScan';
import AttendanceDashboard from './AttendanceDashboard';
import { getOrganizerSession, logoutOrganizer, loginOrganizer } from '../../services/apiService';
import './Admin.css';

export default function OrganizerPortal({ onBackToHome }) {
  const [session, setSession] = useState(getOrganizerSession());
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'dashboard'
  const [loginForm, setLoginForm] = useState({ username: 'organizer', password: '', organizerKey: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    setSession(getOrganizerSession());
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await loginOrganizer(loginForm);
      setSession(res);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Check your password or master key.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logoutOrganizer();
    setSession(null);
  };

  // If not logged in, show clean organizer login screen
  if (!session) {
    return (
      <div className="admin-portal-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="admin-login-modal">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span className="admin-badge">CITADEL COMMAND PORTAL</span>
            <h2 style={{ margin: '8px 0', fontSize: '1.4rem', color: '#fff', fontWeight: 900 }}>
              Organizer Authentication
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Sign in with your organizer credentials to access the QR scanner and attendance verification system.
            </p>
          </div>

          {loginError && (
            <div style={{ marginBottom: '16px', padding: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', fontSize: '0.82rem' }}>
              ⚠ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="admin-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password (default: hashcore2026)"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="admin-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ textAlign: 'center', margin: '4px 0', color: '#64748b', fontSize: '0.75rem' }}>
              — OR MASTER ORGANIZER KEY —
            </div>

            <div>
              <input
                type="password"
                placeholder="Enter Organizer Master Secret Key"
                value={loginForm.organizerKey}
                onChange={(e) => setLoginForm({ ...loginForm, organizerKey: e.target.value })}
                className="admin-input"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn-primary-scan"
              style={{ marginTop: '8px', width: '100%' }}
            >
              {isLoggingIn ? 'Authenticating...' : 'Enter Organizer Portal'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={onBackToHome}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              &larr; Back to Main Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-portal-root">
      <div className="admin-container">
        {/* Top Header Card */}
        <div className="admin-header-card">
          <div className="admin-brand-block">
            <span className="admin-badge">SEUSL HASHCORE '26 CITADEL</span>
            <h1>Organizer & Attendance Control Hub</h1>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
              Faculty of Technology &bull; South Eastern University of Sri Lanka
            </div>
          </div>

          <div className="admin-user-info">
            <div className="user-pill">
              Logged in: <strong style={{ color: '#00f59b' }}>{session.user?.name || session.user?.username || 'Organizer'}</strong>
            </div>
            <button type="button" onClick={handleLogout} className="btn-admin-logout">
              Log Out
            </button>
            <button type="button" onClick={onBackToHome} className="btn-admin-action" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
              Public Site &rarr;
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="admin-nav-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`tab-btn ${activeTab === 'scanner' ? 'is-active' : ''}`}
          >
            📷 QR Attendance Scanner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`tab-btn ${activeTab === 'dashboard' ? 'is-active' : ''}`}
          >
            📊 Real-Time Statistics & Participants
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'scanner' ? (
          <OrganizerScan onCheckInSuccess={() => {}} />
        ) : (
          <AttendanceDashboard />
        )}
      </div>
    </div>
  );
}
