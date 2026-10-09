import { useState } from 'react';
import OrganizerScan from './OrganizerScan';
import AttendanceDashboard from './AttendanceDashboard';
import './Admin.css';

export default function OrganizerPortal({ onBackToHome }) {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'dashboard'

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
            <div className="user-pill" style={{ background: 'rgba(0, 245, 155, 0.1)', border: '1px solid rgba(0, 245, 155, 0.25)', color: '#00f59b' }}>
              ● Instant Scan Mode Active
            </div>
            <button
              type="button"
              onClick={onBackToHome}
              className="btn-admin-action"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
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
