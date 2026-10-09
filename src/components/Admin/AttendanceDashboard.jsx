import { useState, useEffect } from 'react';
import {
  getAttendanceStats,
  getAttendanceList,
  downloadAttendanceCsv,
  resendTicketEmail,
  retryPendingAttendanceEmails,
  manualCheckIn,
} from '../../services/apiService';

export default function AttendanceDashboard() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionMessage, setActionMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await getAttendanceStats();
      if (res.success) setStats(res.stats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchList = async () => {
    try {
      setLoadingList(true);
      const res = await getAttendanceList({
        search,
        track: trackFilter,
        status: statusFilter,
        limit: 50,
      });
      if (res.success) setParticipants(res.items || []);
    } catch (err) {
      console.error('Failed to load participants list:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchList();
  }, [trackFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchList();
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await downloadAttendanceCsv();
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleResend = async (regId, reissue = false) => {
    try {
      setActionMessage(`Sending ticket email for ${regId}...`);
      const res = await resendTicketEmail(regId, reissue);
      if (res.success) {
        setActionMessage(`✓ ${res.message || 'Ticket email sent successfully!'}`);
      } else {
        setActionMessage(`❌ ${res.error || 'Failed to send'}`);
      }
      setTimeout(() => setActionMessage(''), 4000);
      fetchList();
    } catch (err) {
      setActionMessage('❌ Error: ' + err.message);
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  const handleRowCheckIn = async (regId) => {
    try {
      const res = await manualCheckIn(null, regId);
      if (res.success) {
        setActionMessage('✓ Attendance marked present!');
        fetchStats();
        fetchList();
      } else {
        setActionMessage(`❌ ${res.message || 'Check-in failed'}`);
      }
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionMessage('❌ Error: ' + err.message);
    }
  };

  const handleRetryEmails = async () => {
    try {
      setActionMessage('Retrying pending attendance emails...');
      const res = await retryPendingAttendanceEmails();
      setActionMessage(`✓ ${res.message || 'Worker triggered'}`);
      setTimeout(() => setActionMessage(''), 3000);
      fetchStats();
    } catch (err) {
      setActionMessage('❌ Error retrying emails: ' + err.message);
    }
  };

  return (
    <div>
      {/* 1. Statistics Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Registered</span>
          <span className="stat-value">{stats ? stats.totalRegistered : '...'}</span>
          <span className="stat-subtext">Citadel Registrations</span>
        </div>

        <div className="stat-card highlight">
          <span className="stat-label">Checked In (Present)</span>
          <span className="stat-value">{stats ? stats.totalCheckedIn : '...'}</span>
          <span className="stat-subtext">Verified at Venue</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Not Checked In</span>
          <span className="stat-value">{stats ? stats.notCheckedIn : '...'}</span>
          <span className="stat-subtext">Awaiting Arrival</span>
        </div>

        <div className="stat-card highlight">
          <span className="stat-label">Attendance Rate</span>
          <span className="stat-value">{stats ? `${stats.attendancePercentage}%` : '...'}</span>
          <span className="stat-subtext">Present vs Eligible</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Tracks (CTF / WEB)</span>
          <div style={{ marginTop: '8px', fontSize: '0.9rem', color: '#ffffff', fontWeight: 700 }}>
            CTF: {stats?.tracks?.ctf?.checkedIn || 0} / {stats?.tracks?.ctf?.registered || 0}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: 700, marginTop: '2px' }}>
            WEB: {stats?.tracks?.web?.checkedIn || 0} / {stats?.tracks?.web?.registered || 0}
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Attendance Emails</span>
          <span className="stat-value" style={{ fontSize: '1.4rem' }}>
            {stats?.emails?.pending || 0} Pending
          </span>
          {stats?.emails?.pending > 0 && (
            <button
              type="button"
              onClick={handleRetryEmails}
              style={{ marginTop: '6px', background: '#00f59b', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
            >
              Retry Pending
            </button>
          )}
        </div>
      </div>

      {actionMessage && (
        <div style={{ marginBottom: '16px', padding: '10px 16px', background: 'rgba(0, 245, 155, 0.15)', border: '1px solid #00f59b', borderRadius: '8px', color: '#00f59b', fontSize: '0.88rem', fontWeight: 700 }}>
          {actionMessage}
        </div>
      )}

      {/* 2. Participants Table Card */}
      <div className="participants-table-card">
        <div className="table-toolbar">
          <form onSubmit={handleSearchSubmit} className="search-input-wrap">
            <input
              type="text"
              placeholder="Search Name, Reg No, Ticket ID, Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-secondary-scan" style={{ padding: '8px 14px' }}>
              Search
            </button>
          </form>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Tracks</option>
              <option value="WEB">Web Development</option>
              <option value="CTF">CTF Competition</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select"
            >
              <option value="ALL">All Attendance</option>
              <option value="checked_in">Checked In</option>
              <option value="not_checked_in">Not Checked In</option>
            </select>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExporting}
              className="btn-secondary-scan"
              style={{ background: 'rgba(0, 245, 155, 0.2)', borderColor: '#00f59b', color: '#00f59b' }}
            >
              {isExporting ? 'Exporting...' : '📥 Export CSV'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          {loadingList ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              Loading Citadel Participants...
            </div>
          ) : participants.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No participant registrations match your query.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Ticket Pass</th>
                  <th>Participant</th>
                  <th>University Reg</th>
                  <th>Track</th>
                  <th>Attendance</th>
                  <th>Check-In Time</th>
                  <th>Email Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => {
                  const isChecked = p.attendance?.status === 'checked_in';
                  return (
                    <tr key={p._id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#00f59b' }}>
                        {p.registrationReference}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{p.participantName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#38bdf8' }}>
                        {p.universityRegNo}
                      </td>
                      <td>
                        <span className="badge-status" style={{ background: p.track === 'CTF' ? 'rgba(239,68,68,0.15)' : 'rgba(56,189,248,0.15)', color: p.track === 'CTF' ? '#f87171' : '#38bdf8' }}>
                          {p.track}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-status ${isChecked ? 'badge-present' : 'badge-absent'}`}>
                          {isChecked ? '✓ PRESENT' : 'ABSENT'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {p.attendance?.checkedInAt
                          ? new Date(p.attendance.checkedInAt).toLocaleTimeString()
                          : '—'}
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>
                        <div style={{ color: p.emailNotifications?.registrationEmailStatus === 'sent' ? '#00f59b' : '#94a3b8' }}>
                          Reg: {p.emailNotifications?.registrationEmailStatus || 'none'}
                        </div>
                        {isChecked && (
                          <div style={{ color: p.emailNotifications?.attendanceEmailStatus === 'sent' ? '#00f59b' : '#f59e0b' }}>
                            Att: {p.emailNotifications?.attendanceEmailStatus || 'pending'}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {!isChecked && (
                            <button
                              type="button"
                              onClick={() => handleRowCheckIn(p._id)}
                              style={{ background: '#00f59b', color: '#030805', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                              title="Mark Present Manually"
                            >
                              Check-In
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleResend(p._id, false)}
                            style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                            title="Resend Ticket Email"
                          >
                            Resend
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
