import { Registration } from '../models/Registration.js';
import { Event } from '../models/Event.js';
import { sendAttendanceConfirmationEmail } from './emailService.js';

let isWorkerRunning = false;

/**
 * Dispatch an attendance confirmation email for a single registration document.
 * Concurrency-safe: only updates notification status; never modifies attendance record.
 */
export async function triggerAttendanceEmailForRegistration(registrationId) {
  try {
    const reg = await Registration.findById(registrationId).populate('eventId');
    if (!reg) return { success: false, error: 'Registration not found' };

    // Safety checks
    if (reg.attendance.status !== 'checked_in') {
      return { success: false, error: 'Cannot send attendance confirmation for unverified participant' };
    }
    if (reg.emailNotifications.attendanceEmailStatus === 'sent') {
      return { success: true, message: 'Attendance confirmation already dispatched' };
    }

    const eventName = reg.eventId?.name || "SEUSL HASHCORE '26";
    const venue = reg.eventId?.venue || 'Faculty of Technology, SEUSL, Oluvil';

    const result = await sendAttendanceConfirmationEmail({
      participantName: reg.participantName,
      email: reg.email,
      registrationReference: reg.registrationReference,
      eventName,
      venue,
      checkedInAt: reg.attendance.checkedInAt || new Date(),
    });

    if (result.success) {
      await Registration.findByIdAndUpdate(registrationId, {
        $set: {
          'emailNotifications.attendanceEmailStatus': 'sent',
          'emailNotifications.attendanceEmailSentAt': new Date(),
          'emailNotifications.lastError': '',
        },
      });
      console.log(`[NotificationWorker] Attendance confirmation sent to ${reg.email} [${reg.registrationReference}]`);
      return { success: true };
    } else {
      await Registration.findByIdAndUpdate(registrationId, {
        $set: {
          'emailNotifications.attendanceEmailStatus': 'failed',
          'emailNotifications.lastError': result.error || 'Transport failed',
        },
        $inc: {
          'emailNotifications.retryCount': 1,
        },
      });
      return { success: false, error: result.error };
    }
  } catch (err) {
    console.error(`[NotificationWorker] Error dispatching attendance email for ${registrationId}:`, err.message);
    await Registration.findByIdAndUpdate(registrationId, {
      $set: {
        'emailNotifications.attendanceEmailStatus': 'failed',
        'emailNotifications.lastError': err.message,
      },
      $inc: {
        'emailNotifications.retryCount': 1,
      },
    }).catch(() => {});
    return { success: false, error: err.message };
  }
}

/**
 * Periodic recovery worker: scans for pending or failed attendance emails and retries them safely.
 */
export async function processPendingAttendanceNotifications() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;

  try {
    const pendingList = await Registration.find({
      'attendance.status': 'checked_in',
      'emailNotifications.attendanceEmailStatus': { $in: ['pending', 'failed'] },
      'emailNotifications.retryCount': { $lt: 5 },
    }).limit(20);

    for (const item of pendingList) {
      await triggerAttendanceEmailForRegistration(item._id);
    }
  } catch (err) {
    console.error('[NotificationWorker] Batch retry error:', err.message);
  } finally {
    isWorkerRunning = false;
  }
}
