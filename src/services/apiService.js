import { submitToGoogleForm } from './googleFormService';

/**
 * Citadel API Service:
 * Connects frontend to Express + MongoDB backend with fallback to Google Sheets.
 */

const BACKEND_URL = (import.meta.env?.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');

function getAuthHeaders() {
  const token = localStorage.getItem('hashcore_organizer_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * 1. Register Participant
 * Tries Express + MongoDB first (for QR ticket, DB persistence, and email).
 * Syncs with Google Form / Sheet.
 * Falls back to Google Apps Script / Form if backend is unreachable.
 */
export async function registerParticipant(formData) {
  let backendResult = null;
  let backendError = null;

  try {
    const res = await fetch(`${BACKEND_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      backendResult = data;
    } else {
      if (data.duplicate) {
        throw new Error(data.error || 'You have already registered for this event.');
      }
      backendError = data.error || 'Backend registration failed';
    }
  } catch (err) {
    if (err.message && err.message.includes('already registered')) {
      throw err;
    }
    console.warn('[Citadel API] Express backend unavailable or error, using Google Form sync:', err.message);
  }

  // Dual Sync: Also record to Google Form / Apps Script
  try {
    const googleResult = await submitToGoogleForm({
      ...formData,
      ticketId: backendResult?.ticketId,
    });

    if (backendResult) {
      return {
        ...backendResult,
        googleSynced: true,
      };
    }

    return googleResult;
  } catch (gErr) {
    if (backendResult) return backendResult;
    throw gErr;
  }
}

/**
 * 2. Organizer Authentication
 */
export async function loginOrganizer({ username, password, organizerKey }) {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, organizerKey }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Organizer login failed');
  }
  localStorage.setItem('hashcore_organizer_token', data.token);
  localStorage.setItem('hashcore_organizer_user', JSON.stringify(data.user));
  return data;
}

export function getOrganizerSession() {
  const token = localStorage.getItem('hashcore_organizer_token');
  const user = localStorage.getItem('hashcore_organizer_user');
  if (!token) return null;
  try {
    return { token, user: JSON.parse(user) };
  } catch {
    return { token, user: { username: 'organizer', name: 'Organizer' } };
  }
}

export function logoutOrganizer() {
  localStorage.removeItem('hashcore_organizer_token');
  localStorage.removeItem('hashcore_organizer_user');
}

/**
 * 3. Attendance Verification & Check-In
 */
export async function checkInTicket(ticketToken, notes = '') {
  const res = await fetch(`${BACKEND_URL}/api/attendance/check-in`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ticketToken, notes }),
  });
  return res.json();
}

/**
 * 4. Manual Check-In
 */
export async function manualCheckIn(query, notes = '') {
  const res = await fetch(`${BACKEND_URL}/api/attendance/manual-check-in`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ query, notes }),
  });
  return res.json();
}

/**
 * 5. Attendance Statistics
 */
export async function getAttendanceStats() {
  const res = await fetch(`${BACKEND_URL}/api/attendance/stats`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

/**
 * 6. Participant List (Paginated)
 */
export async function getAttendanceList(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BACKEND_URL}/api/attendance/list?${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

/**
 * 7. Export Attendance CSV
 */
export async function downloadAttendanceCsv() {
  const res = await fetch(`${BACKEND_URL}/api/attendance/export`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to export CSV');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SEUSL_HASHCORE_2026_Attendance_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * 8. Resend or Reissue Ticket
 */
export async function resendTicketEmail(registrationId, reissue = false) {
  const res = await fetch(`${BACKEND_URL}/api/registrations/${registrationId}/resend-ticket`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reissue }),
  });
  return res.json();
}

/**
 * 9. Retry Pending Attendance Emails
 */
export async function retryPendingAttendanceEmails() {
  const res = await fetch(`${BACKEND_URL}/api/attendance/retry-emails`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json();
}
