import express from 'express';
import { Registration } from '../models/Registration.js';
import { Event } from '../models/Event.js';
import { hashTicketToken } from '../services/ticketService.js';
import {
  triggerAttendanceEmailForRegistration,
  processPendingAttendanceNotifications,
} from '../services/attendanceNotificationWorker.js';
import { requireOrganizerAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Helper to extract raw token string whether organizer app passes raw token or full URL
 */
function extractRawToken(input) {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  // If it's a URL like https://domain/#verify/TOKEN or /verify/TOKEN
  const match = trimmed.match(/(?:verify\/|token=)([a-f0-9]{32,64})/i);
  if (match) return match[1];
  return trimmed;
}

/**
 * POST /api/attendance/check-in
 * Secure, atomic QR ticket check-in endpoint
 */
router.post('/check-in', requireOrganizerAuth, async (req, res) => {
  try {
    const { ticketToken, notes } = req.body;
    const rawToken = extractRawToken(ticketToken);

    if (!rawToken) {
      return res.status(400).json({
        success: false,
        status: 'invalid_ticket',
        message: 'A valid QR ticket token is required.',
      });
    }

    const tokenHash = hashTicketToken(rawToken);

    // Concurrency-Safe Atomic Conditional Update
    const updatedRegistration = await Registration.findOneAndUpdate(
      {
        'ticket.tokenHash': tokenHash,
        'ticket.status': 'active',
        registrationStatus: 'registered',
        'attendance.status': 'not_checked_in',
      },
      {
        $set: {
          'attendance.status': 'checked_in',
          'attendance.checkedInAt': new Date(),
          'attendance.checkedInBy': req.user.name || req.user.username || 'Authorized Organizer',
          'attendance.checkInMethod': 'qr_scan',
          'attendance.notes': notes || '',
          'emailNotifications.attendanceEmailStatus': 'pending',
        },
      },
      { new: true }
    ).populate('eventId');

    // 1. Success Case: Ticket verified and attendance recorded atomically
    if (updatedRegistration) {
      // Trigger attendance confirmation email asynchronously (does not block check-in response)
      triggerAttendanceEmailForRegistration(updatedRegistration._id).catch((e) =>
        console.error('[CheckIn] Async attendance email notice:', e.message)
      );

      return res.json({
        success: true,
        status: 'checked_in',
        message: 'Attendance marked successfully.',
        participant: {
          name: updatedRegistration.participantName,
          registrationReference: updatedRegistration.registrationReference,
          universityRegNo: updatedRegistration.universityRegNo,
          competition: updatedRegistration.competition,
          track: updatedRegistration.track,
          batch: updatedRegistration.batch,
          faculty: updatedRegistration.faculty,
        },
        attendance: {
          status: 'present',
          checkedInAt: updatedRegistration.attendance.checkedInAt,
          checkedInBy: updatedRegistration.attendance.checkedInBy,
        },
        attendanceEmail: {
          status: 'pending',
        },
      });
    }

    // 2. Failure Case Diagnostics: Determine exact reason why atomic update matched 0 docs
    const existing = await Registration.findOne({ 'ticket.tokenHash': tokenHash });

    if (!existing) {
      return res.status(404).json({
        success: false,
        status: 'invalid_ticket',
        message: 'The ticket is invalid or cannot be verified in the Citadel database.',
      });
    }

    if (existing.registrationStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        status: 'cancelled_registration',
        message: 'This registration has been marked as cancelled.',
        participant: {
          name: existing.participantName,
          registrationReference: existing.registrationReference,
        },
      });
    }

    if (existing.ticket.status === 'revoked') {
      return res.status(400).json({
        success: false,
        status: 'revoked_ticket',
        message: 'This ticket has been revoked or reissued. Please present the newest ticket pass.',
      });
    }

    if (existing.attendance.status === 'checked_in') {
      return res.status(409).json({
        success: false,
        status: 'already_checked_in',
        message: 'This participant has already checked in.',
        participant: {
          name: existing.participantName,
          registrationReference: existing.registrationReference,
          universityRegNo: existing.universityRegNo,
        },
        originalAttendance: {
          checkedInAt: existing.attendance.checkedInAt,
          checkedInBy: existing.attendance.checkedInBy,
        },
      });
    }

    return res.status(400).json({
      success: false,
      status: 'verification_failed',
      message: 'Ticket could not be verified for check-in.',
    });
  } catch (err) {
    console.error('[Attendance] Check-in error:', err);
    res.status(500).json({
      success: false,
      status: 'server_error',
      message: 'Internal error verifying ticket: ' + err.message,
    });
  }
});

/**
 * POST /api/attendance/manual-check-in
 * Manual lookup and check-in fallback
 */
router.post('/manual-check-in', requireOrganizerAuth, async (req, res) => {
  try {
    const { registrationId, query, notes } = req.body;

    let filter = {};
    if (registrationId) {
      filter._id = registrationId;
    } else if (query) {
      const q = query.trim();
      filter.$or = [
        { registrationReference: q },
        { universityRegNo: q.toUpperCase() },
        { email: q.toLowerCase() },
      ];
    } else {
      return res.status(400).json({ success: false, error: 'Registration ID or query is required' });
    }

    filter.registrationStatus = 'registered';
    filter['attendance.status'] = 'not_checked_in';

    const updated = await Registration.findOneAndUpdate(
      filter,
      {
        $set: {
          'attendance.status': 'checked_in',
          'attendance.checkedInAt': new Date(),
          'attendance.checkedInBy': req.user.name || req.user.username || 'Organizer (Manual)',
          'attendance.checkInMethod': 'manual',
          'attendance.notes': notes || 'Manual check-in by organizer',
          'emailNotifications.attendanceEmailStatus': 'pending',
        },
      },
      { new: true }
    );

    if (updated) {
      triggerAttendanceEmailForRegistration(updated._id).catch(() => {});
      return res.json({
        success: true,
        status: 'checked_in',
        message: 'Manual check-in recorded successfully.',
        participant: {
          name: updated.participantName,
          registrationReference: updated.registrationReference,
          universityRegNo: updated.universityRegNo,
        },
        attendance: updated.attendance,
      });
    }

    // Check why failed
    delete filter['attendance.status'];
    delete filter.registrationStatus;
    const existing = await Registration.findOne(filter);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'No matching participant registration found.' });
    }
    if (existing.attendance.status === 'checked_in') {
      return res.status(409).json({
        success: false,
        status: 'already_checked_in',
        message: 'Participant was already checked in at ' + existing.attendance.checkedInAt,
        participant: {
          name: existing.participantName,
          registrationReference: existing.registrationReference,
        },
      });
    }

    return res.status(400).json({ success: false, error: 'Manual check-in could not be completed.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/attendance/stats
 * Real-time event statistics from MongoDB
 */
router.get('/stats', requireOrganizerAuth, async (req, res) => {
  try {
    const [
      totalRegistered,
      totalEligible,
      totalCheckedIn,
      ctfRegistered,
      ctfCheckedIn,
      webRegistered,
      webCheckedIn,
      pendingEmails,
      failedEmails,
    ] = await Promise.all([
      Registration.countDocuments(),
      Registration.countDocuments({ registrationStatus: 'registered' }),
      Registration.countDocuments({ 'attendance.status': 'checked_in' }),
      Registration.countDocuments({ track: 'CTF', registrationStatus: 'registered' }),
      Registration.countDocuments({ track: 'CTF', 'attendance.status': 'checked_in' }),
      Registration.countDocuments({ track: 'WEB', registrationStatus: 'registered' }),
      Registration.countDocuments({ track: 'WEB', 'attendance.status': 'checked_in' }),
      Registration.countDocuments({ 'emailNotifications.attendanceEmailStatus': 'pending' }),
      Registration.countDocuments({ 'emailNotifications.attendanceEmailStatus': 'failed' }),
    ]);

    const notCheckedIn = Math.max(0, totalEligible - totalCheckedIn);
    const attendancePercentage = totalEligible > 0 ? Number(((totalCheckedIn / totalEligible) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      stats: {
        totalRegistered,
        totalEligible,
        totalCheckedIn,
        notCheckedIn,
        attendancePercentage,
        tracks: {
          ctf: { registered: ctfRegistered, checkedIn: ctfCheckedIn },
          web: { registered: webRegistered, checkedIn: webCheckedIn },
        },
        emails: {
          pending: pendingEmails,
          failed: failedEmails,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/attendance/list
 * Paginated participant list with filtering and search
 */
router.get('/list', requireOrganizerAuth, async (req, res) => {
  try {
    const { search, track, status, page = 1, limit = 25 } = req.query;

    const query = {};
    if (track && track !== 'ALL') query.track = track;
    if (status && status !== 'ALL') query['attendance.status'] = status;

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { participantName: { $regex: s, $options: 'i' } },
        { universityRegNo: { $regex: s, $options: 'i' } },
        { registrationReference: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Registration.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Registration.countDocuments(query),
    ]);

    res.json({
      success: true,
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/attendance/export
 * Export attendance records as CSV
 */
router.get('/export', requireOrganizerAuth, async (req, res) => {
  try {
    const records = await Registration.find().sort({ 'attendance.checkedInAt': -1, createdAt: -1 });

    const headers = [
      'Ticket Reference',
      'Name',
      'University Reg No',
      'Track',
      'Competition',
      'Batch',
      'Faculty',
      'Email',
      'Contact',
      'Attendance Status',
      'Check-in Time',
      'Check-in Method',
      'Organizer',
      'Attendance Email Status',
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [headers.join(',')];

    for (const r of records) {
      csvRows.push(
        [
          escapeCsv(r.registrationReference),
          escapeCsv(r.participantName),
          escapeCsv(r.universityRegNo),
          escapeCsv(r.track),
          escapeCsv(r.competition),
          escapeCsv(r.batch),
          escapeCsv(r.faculty),
          escapeCsv(r.email),
          escapeCsv(r.contactNo),
          escapeCsv(r.attendance?.status || 'not_checked_in'),
          escapeCsv(r.attendance?.checkedInAt ? new Date(r.attendance.checkedInAt).toISOString() : ''),
          escapeCsv(r.attendance?.checkInMethod || ''),
          escapeCsv(r.attendance?.checkedInBy || ''),
          escapeCsv(r.emailNotifications?.attendanceEmailStatus || 'none'),
        ].join(',')
      );
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="SEUSL_HASHCORE_2026_Attendance.csv"');
    res.send(csvRows.join('\r\n'));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/attendance/retry-emails
 * Trigger durable recovery of pending or failed attendance emails
 */
router.post('/retry-emails', requireOrganizerAuth, async (req, res) => {
  try {
    await processPendingAttendanceNotifications();
    res.json({ success: true, message: 'Attendance notification retry worker triggered.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
