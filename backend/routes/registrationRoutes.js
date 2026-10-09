import express from 'express';
import { Registration } from '../models/Registration.js';
import { Event } from '../models/Event.js';
import { getOrCreateDefaultEvent } from './eventRoutes.js';
import { createSecureTicket } from '../services/ticketService.js';
import { sendRegistrationConfirmationEmail } from '../services/emailService.js';
import { requireOrganizerAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/registrations
 * Public registration endpoint
 */
router.post('/', async (req, res) => {
  try {
    const data = req.body || {};

    const participantName = (data.initialsWithName || data.name || '').trim();
    const batch = (data.batch || '').trim();
    const faculty = (data.faculty || 'Technology').trim();
    const regNo = (data.universityRegNo || data.regNo || '').trim().toUpperCase();
    const rawEmail = (data.email || '').trim().toLowerCase();
    const contactNo = (data.contactNo || '').trim();
    const whatsappNo = (data.whatsappNo || contactNo || '').trim();
    const competition = (data.competition || data.track || 'Web').trim();
    const isCTF = competition.toUpperCase().indexOf('CTF') !== -1;
    const track = isCTF ? 'CTF' : 'WEB';
    const competitionTitle = isCTF ? 'CTF Competition' : 'Web Development Competition';

    // 1. Validation
    if (!participantName) {
      return res.status(400).json({ success: false, error: 'Name with Initials is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }
    if (!regNo) {
      return res.status(400).json({ success: false, error: 'University Registration Number is required.' });
    }

    // 2. Active Event Check
    const event = await getOrCreateDefaultEvent();
    if (!event.registrationOpen) {
      return res.status(400).json({ success: false, error: 'Registrations are currently closed for this event.' });
    }

    // 3. Duplicate Prevention (by University Reg No or Email for this event)
    const existingRegistration = await Registration.findOne({
      eventId: event._id,
      $or: [{ universityRegNo: regNo }, { email: rawEmail }],
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        error: 'You have already registered for this event.',
        existingTicketId: existingRegistration.registrationReference,
        universityRegNo: existingRegistration.universityRegNo,
      });
    }

    // 4. Sequential Ticket Reference Generation
    const trackCount = await Registration.countDocuments({ eventId: event._id, track });
    const nextTicketNum = trackCount + 1;
    const paddedNum = ('00000' + nextTicketNum).slice(-5);
    const ticketReference = `${track}-2026-${paddedNum}`;

    // 5. Generate Secure Token & Local QR Code with Participant Metadata
    const ticketPackage = await createSecureTicket(process.env.FRONTEND_URL, {
      ticketId: ticketReference,
      regNo,
      name: participantName,
      track,
      email: rawEmail,
      batch,
      faculty,
    });

    // 6. Save in MongoDB
    const registration = new Registration({
      eventId: event._id,
      participantName,
      email: rawEmail,
      universityRegNo: regNo,
      batch,
      faculty,
      contactNo,
      whatsappNo,
      competition: competitionTitle,
      track,
      registrationReference: ticketReference,
      registrationStatus: 'registered',
      ticket: {
        tokenHash: ticketPackage.tokenHash,
        qrDataUrl: ticketPackage.qrDataUrl,
        status: 'active',
        issuedAt: new Date(),
        version: 1,
      },
      attendance: {
        status: 'not_checked_in',
        checkedInAt: null,
      },
      emailNotifications: {
        registrationEmailStatus: 'pending',
      },
    });

    await registration.save();

    // 7. Send Registration Confirmation Email (with embedded QR code)
    let emailSent = false;
    let emailErrorMessage = '';

    try {
      const emailResult = await sendRegistrationConfirmationEmail({
        participantName,
        email: rawEmail,
        ticketId: ticketReference,
        competitionTitle,
        eventName: event.name,
        eventDate: event.date ? event.date.toLocaleDateString('en-US', { dateStyle: 'long' }) : 'October 25, 2026',
        eventTime: event.startTime,
        venue: event.venue,
        qrBuffer: ticketPackage.qrBuffer,
        regNo,
        batch,
        faculty,
      });

      if (emailResult.success) {
        emailSent = true;
        registration.emailNotifications.registrationEmailStatus = 'sent';
        registration.emailNotifications.registrationEmailSentAt = new Date();
        await registration.save();
      } else {
        emailErrorMessage = emailResult.error || 'Failed to dispatch email';
        registration.emailNotifications.registrationEmailStatus = 'failed';
        registration.emailNotifications.lastError = emailErrorMessage;
        await registration.save();
      }
    } catch (mailErr) {
      emailErrorMessage = mailErr.message;
      registration.emailNotifications.registrationEmailStatus = 'failed';
      registration.emailNotifications.lastError = mailErr.message;
      await registration.save().catch(() => {});
    }

    return res.status(201).json({
      success: true,
      ticketId: ticketReference,
      registrationReference: ticketReference,
      qrDataUrl: ticketPackage.qrDataUrl,
      rawToken: ticketPackage.rawToken, // Sent to frontend session for immediate rendering/testing
      emailSent,
      email: rawEmail,
      participantName,
      competition: competitionTitle,
      universityRegNo: regNo,
      batch,
      faculty,
      contactNo,
      whatsappNo,
      registrationDate: registration.createdAt,
      emailErrorMessage,
    });
  } catch (err) {
    console.error('[RegistrationRoutes] Error creating registration:', err);
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        error: 'A registration with this University Registration Number or Email already exists.',
      });
    }
    res.status(500).json({ success: false, error: 'Registration processing failed: ' + err.message });
  }
});

/**
 * POST /api/registrations/:id/resend-ticket
 * Protected endpoint for organizers to resend or reissue a ticket pass
 */
router.post('/:id/resend-ticket', requireOrganizerAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reissue } = req.body;

    const registration = await Registration.findById(id).populate('eventId');
    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    let qrBuffer = null;

    if (reissue) {
      // Reissue: Invalidate previous token and generate new one
      const newTicket = await createSecureTicket(process.env.FRONTEND_URL);
      registration.ticket.tokenHash = newTicket.tokenHash;
      registration.ticket.qrDataUrl = newTicket.qrDataUrl;
      registration.ticket.version = (registration.ticket.version || 1) + 1;
      registration.ticket.issuedAt = new Date();
      registration.ticket.status = 'active';
      qrBuffer = newTicket.qrBuffer;
    } else {
      // Resend existing ticket: regenerate buffer from existing qrDataUrl
      if (registration.ticket.qrDataUrl) {
        const base64Data = registration.ticket.qrDataUrl.replace(/^data:image\/png;base64,/, '');
        qrBuffer = Buffer.from(base64Data, 'base64');
      }
    }

    const emailResult = await sendRegistrationConfirmationEmail({
      participantName: registration.participantName,
      email: registration.email,
      ticketId: registration.registrationReference,
      competitionTitle: registration.competition,
      eventName: registration.eventId?.name || "SEUSL HASHCORE '26",
      eventDate: 'October 25, 2026',
      venue: registration.eventId?.venue || 'Faculty of Technology, SEUSL, Oluvil',
      qrBuffer,
      regNo: registration.universityRegNo,
      batch: registration.batch,
      faculty: registration.faculty,
    });

    if (emailResult.success) {
      registration.emailNotifications.registrationEmailStatus = 'sent';
      registration.emailNotifications.registrationEmailSentAt = new Date();
      await registration.save();
      return res.json({ success: true, message: 'Ticket email resent successfully' });
    } else {
      registration.emailNotifications.registrationEmailStatus = 'failed';
      registration.emailNotifications.lastError = emailResult.error;
      await registration.save();
      return res.status(500).json({ success: false, error: 'Failed to resend email: ' + emailResult.error });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
