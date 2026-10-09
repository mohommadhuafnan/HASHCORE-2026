import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { checkInTicket, manualCheckIn, parseScannedQr } from '../../services/apiService';

export default function OrganizerScan({ onCheckInSuccess }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannerStatus, setScannerStatus] = useState('idle'); // idle | scanning | verifying | success | warning | error
  const [scanResult, setScanResult] = useState(null);
  const [manualQuery, setManualQuery] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualMessage, setManualMessage] = useState('');
  const [cameraError, setCameraError] = useState('');

  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Stop camera on unmount & auto-detect URL query scan
  useEffect(() => {
    // Check if opened via camera scanning link with URL parameters:
    const params = new URLSearchParams(window.location.search);
    const ticket = params.get('ticket') || params.get('id');
    const reg = params.get('reg') || params.get('regNo');
    const name = params.get('name');
    if (ticket || reg || name) {
      handleQrDecoded(window.location.href);
    }

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    setCameraError('');
    setScanResult(null);
    setScannerStatus('scanning');

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('citadel-qr-reader');
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;
          handleQrDecoded(decodedText);
        },
        (errorMessage) => {
          // Normal frame scan tick (no QR in frame yet)
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Camera start failed:', err);
      setCameraError(err.message || 'Unable to access device camera. Please check permissions.');
      setScannerStatus('idle');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }
    } catch (err) {
      console.warn('Error stopping scanner:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleQrDecoded = async (tokenString) => {
    setScannerStatus('verifying');
    // Pause camera scanning during verification
    await stopScanner();

    // Optimistically parse QR token details
    const parsed = parseScannedQr(tokenString);

    try {
      const response = await checkInTicket(tokenString);

      if (response.success && response.status === 'checked_in') {
        setScannerStatus('success');
        setScanResult({
          type: 'success',
          title: 'CHECK-IN SUCCESSFUL',
          participant: {
            ...response.participant,
            name: response.participant?.name && response.participant.name !== 'Participant' 
              ? response.participant.name 
              : (parsed.participantName || response.participant?.name || 'Participant'),
            universityRegNo: response.participant?.universityRegNo && response.participant.universityRegNo !== 'SEU Student'
              ? response.participant.universityRegNo
              : (parsed.universityRegNo || response.participant?.universityRegNo || 'SEU Student'),
            track: response.participant?.track || parsed.track || 'Competition',
            email: response.participant?.email || parsed.email || '',
            ticketId: response.participant?.ticketId || parsed.ticketId || 'CONFIRMED',
            batch: response.participant?.batch || parsed.batch || '',
            faculty: response.participant?.faculty || parsed.faculty || 'Technology',
          },
          attendance: response.attendance,
          emailStatus: 'sent',
          message: 'Attendance recorded & Welcome Message sent to participant email.',
        });
        if (onCheckInSuccess) onCheckInSuccess();
      } else if (response.status === 'already_checked_in') {
        setScannerStatus('warning');
        setScanResult({
          type: 'warning',
          title: 'ALREADY CHECKED IN',
          participant: {
            ...response.participant,
            name: response.participant?.name || parsed.participantName || 'Participant',
            universityRegNo: response.participant?.universityRegNo || parsed.universityRegNo || 'SEU Student',
          },
          attendance: response.originalAttendance,
          message: response.message || 'This participant has already been marked present.',
        });
      } else {
        setScannerStatus('error');
        setScanResult({
          type: 'error',
          title: response.status === 'cancelled_registration' ? 'REGISTRATION CANCELLED' : 'INVALID TICKET',
          message: response.message || 'This QR ticket cannot be verified.',
        });
      }
    } catch (err) {
      setScannerStatus('error');
      setScanResult({
        type: 'error',
        title: 'VERIFICATION ERROR',
        message: err.message || 'Network error verifying ticket with server.',
      });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleScanNext = () => {
    setScanResult(null);
    setScannerStatus('idle');
    startScanner();
  };

  const handleManualCheckIn = async (e) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;

    setManualLoading(true);
    setManualMessage('');
    try {
      const res = await manualCheckIn(manualQuery.trim());
      if (res.success && res.status === 'checked_in') {
        setScannerStatus('success');
        setScanResult({
          type: 'success',
          title: 'MANUAL CHECK-IN SUCCESSFUL',
          participant: res.participant,
          attendance: res.attendance,
          message: 'Participant marked present manually.',
        });
        setManualQuery('');
        if (onCheckInSuccess) onCheckInSuccess();
      } else if (res.status === 'already_checked_in') {
        setScannerStatus('warning');
        setScanResult({
          type: 'warning',
          title: 'ALREADY CHECKED IN',
          participant: res.participant,
          message: res.message || 'This participant was already checked in.',
        });
      } else {
        setManualMessage(res.error || res.message || 'Manual check-in failed');
      }
    } catch (err) {
      setManualMessage(err.message || 'Error executing manual check-in');
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="scanner-grid">
      {/* 1. Camera & QR Scanner Card */}
      <div className="scanner-view-card">
        <div className="scanner-title">
          <span>Camera QR Scanner</span>
          <span className="badge-status" style={{ background: isScanning ? 'rgba(0,245,155,0.2)' : 'rgba(255,255,255,0.1)', color: isScanning ? '#00f59b' : '#94a3b8' }}>
            {isScanning ? '● CAMERA ACTIVE' : 'IDLE'}
          </span>
        </div>

        <div className="scanner-camera-viewport">
          <div id="citadel-qr-reader" />
          {!isScanning && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(3, 8, 5, 0.95)',
              color: '#94a3b8',
              padding: '20px',
              textAlign: 'center',
              gap: '12px'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00f59b" strokeWidth="1.5">
                <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                <rect x="7" y="7" width="10" height="10" rx="1" />
              </svg>
              <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Click "Start Scanner" to activate camera</span>
            </div>
          )}
        </div>

        {cameraError && (
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem' }}>
            ⚠ {cameraError}
          </div>
        )}

        <div className="scanner-controls">
          {!isScanning ? (
            <button type="button" onClick={startScanner} className="btn-primary-scan">
              📷 Start Scanner
            </button>
          ) : (
            <button type="button" onClick={stopScanner} className="btn-secondary-scan" style={{ background: '#ef4444', border: 'none', color: '#fff' }}>
              ⏹ Stop Scanner
            </button>
          )}
        </div>

        {/* Manual Fallback Lookup */}
        <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
            Manual Lookup / Broken Screen Check-In
          </div>
          <form onSubmit={handleManualCheckIn} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Enter Reg No (e.g. SEU/IS/...) or Ticket ID"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              className="admin-input"
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={manualLoading} className="btn-secondary-scan" style={{ background: '#00f59b', color: '#030805', border: 'none' }}>
              {manualLoading ? 'Verifying...' : 'Check In'}
            </button>
          </form>
          {manualMessage && (
            <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#f87171' }}>
              {manualMessage}
            </div>
          )}
        </div>
      </div>

      {/* 2. Verification Result Card */}
      <div className="scanner-result-card">
        <div className="scanner-title">
          <span>Verification Status</span>
        </div>

        {scannerStatus === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#00f59b' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,245,155,0.2)', borderTopColor: '#00f59b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ fontWeight: '800', fontSize: '1rem' }}>VERIFYING CITADEL TICKET TOKEN...</div>
          </div>
        )}

        {scanResult && (
          <div>
            <div className={`result-status-banner ${
              scanResult.type === 'success' ? 'status-success' : scanResult.type === 'warning' ? 'status-warning' : 'status-error'
            }`}>
              <h3 className="status-title">{scanResult.title}</h3>
              <div className="status-msg">{scanResult.message}</div>
            </div>

            {scanResult.participant && (
              <div style={{ marginTop: '16px' }}>
                {/* Hero Participant Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(6, 25, 16, 0.95), rgba(3, 10, 6, 0.95))',
                  border: '2px solid #00f59b',
                  borderRadius: '12px',
                  padding: '18px',
                  marginBottom: '16px',
                  boxShadow: '0 8px 24px rgba(0, 245, 155, 0.15)'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    Participant Name
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 12px' }}>
                    {scanResult.participant.name}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                    <div style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      color: '#38bdf8',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '1rem',
                      letterSpacing: '0.05em'
                    }}>
                      REG: {scanResult.participant.universityRegNo || 'VERIFIED'}
                    </div>

                    <div style={{
                      background: 'rgba(0, 245, 155, 0.15)',
                      border: '1px solid rgba(0, 245, 155, 0.4)',
                      color: '#00f59b',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      fontSize: '0.9rem'
                    }}>
                      ID: {scanResult.participant.ticketId || scanResult.participant.registrationReference || 'PASS'}
                    </div>

                    {(scanResult.participant.track || scanResult.participant.competition) && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#f1f5f9',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: 700
                      }}>
                        {scanResult.participant.track || scanResult.participant.competition}
                      </div>
                    )}
                  </div>

                  {/* Welcome & Attendance Email Sent Pill */}
                  <div style={{
                    marginTop: '14px',
                    padding: '8px 12px',
                    background: 'rgba(0, 245, 155, 0.1)',
                    border: '1px solid rgba(0, 245, 155, 0.3)',
                    borderRadius: '8px',
                    color: '#00f59b',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>🎉</span>
                    <span>
                      Welcome Message Sent: "Welcome to SEUSL HASHCORE 2026 — Attendance Confirmed"
                      {scanResult.participant.email ? ` to ${scanResult.participant.email}` : ''}
                    </span>
                  </div>
                </div>

                <table className="result-detail-table">
                  <tbody>
                    <tr>
                      <td className="lbl">Status</td>
                      <td className="val" style={{ color: '#00f59b', fontWeight: 900 }}>PRESENT &bull; ATTENDANCE CONFIRMED</td>
                    </tr>
                    {scanResult.attendance?.checkedInAt && (
                      <tr>
                        <td className="lbl">Check-In Time</td>
                        <td className="val">
                          {new Date(scanResult.attendance.checkedInAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <button type="button" onClick={handleScanNext} className="btn-primary-scan" style={{ width: '100%', marginTop: '12px' }}>
              ▶ Scan Next Participant
            </button>
          </div>
        )}

        {!scanResult && scannerStatus !== 'verifying' && (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ margin: '0 auto 12px', opacity: 0.5 }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div style={{ fontSize: '0.9rem' }}>Awaiting QR scan or manual ticket submission</div>
          </div>
        )}
      </div>
    </div>
  );
}
