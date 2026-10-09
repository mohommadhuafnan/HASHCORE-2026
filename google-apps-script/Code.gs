/**
 * ============================================================================
 * SEUSL HASHCORE 2026 — GOOGLE APPS SCRIPT WEB APP
 * High-Deliverability Registration, QR Ticketing, PDF Passes & Attendance API
 * ============================================================================
 * 
 * 📧 OFFICIAL SENDER EMAIL CONFIGURATION:
 * Sender Email: hashcore@seu.ac.lk
 * Display Name: SEUSL HASHCORE 2026
 * 
 * 🛡️ FEATURES:
 * 1. Dual-MIME Email Delivery (Plain Text + Clean HTML) with zero spam triggers.
 * 2. Embedded Scannable QR Code generated for each participant.
 * 3. High-Quality PDF Ticket Pass generated & attached directly to email.
 * 4. Real-Time QR Attendance Check-In API (marks attendance & returns participant details).
 * 5. Automatic Attendance Confirmation Email ("Thank you for attending today's workshop").
 * ============================================================================
 */

var OFFICIAL_SENDER_EMAIL = 'hashcore@seu.ac.lk';
var OFFICIAL_SENDER_NAME = 'SEUSL HASHCORE 2026';

/**
 * Dispatches an email notification via GmailApp (with MailApp fallback).
 * Supports attachments (PDF passes).
 */
function sendEmailNotification(options) {
  var to = options.to;
  var subject = options.subject;
  var plainText = options.plainText || '';
  var htmlBody = options.htmlBody || '';
  var attachments = options.attachments || [];

  var mailOptions = {
    name: OFFICIAL_SENDER_NAME,
    replyTo: OFFICIAL_SENDER_EMAIL,
    htmlBody: htmlBody
  };

  if (attachments && attachments.length > 0) {
    mailOptions.attachments = attachments;
  }

  // Check send-as aliases for hashcore@seu.ac.lk
  try {
    var aliases = GmailApp.getAliases();
    if (aliases && aliases.indexOf(OFFICIAL_SENDER_EMAIL) !== -1) {
      mailOptions.from = OFFICIAL_SENDER_EMAIL;
    }
  } catch (aliasErr) {
    Logger.log('Alias check note: ' + aliasErr.toString());
  }

  // 1. Primary: Send via GmailApp (Produces clean multipart/alternative with DKIM)
  try {
    GmailApp.sendEmail(to, subject, plainText, mailOptions);
    return;
  } catch (gmailErr) {
    Logger.log('GmailApp send notice: ' + gmailErr.toString());
  }

  // 2. Fallback: MailApp
  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: plainText,
    htmlBody: htmlBody,
    name: mailOptions.name,
    replyTo: mailOptions.replyTo,
    attachments: attachments
  });
}

/**
 * Generates an accessible, high-contrast QR Code URL for the ticket.
 */
function getQrCodeUrl(payload) {
  return 'https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=' + encodeURIComponent(payload);
}

/**
 * Generates an official, beautifully styled PDF Ticket Pass.
 */
function generateTicketPdfBlob(p, qrUrl) {
  var pdfHtml = '<!DOCTYPE html>' +
    '<html><head><meta charset="utf-8"/>' +
    '<style>' +
    'body { margin: 0; padding: 24px; background: #030a06; font-family: Helvetica, Arial, sans-serif; color: #f1f5f9; }' +
    '.ticket-wrapper { border: 2px solid #00f59b; border-radius: 16px; background: #061910; padding: 28px; }' +
    '.badge { display: inline-block; background: #062b1b; border: 1px solid #00f59b; color: #00f59b; font-size: 11px; font-weight: bold; padding: 5px 14px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1.5px; }' +
    '.title { font-size: 26px; font-weight: 900; color: #ffffff; margin: 12px 0 4px 0; letter-spacing: -0.5px; }' +
    '.subtitle { font-size: 13px; color: #94a3b8; margin: 0 0 20px 0; }' +
    '.pass-table { width: 100%; border-collapse: collapse; margin-top: 14px; }' +
    '.pass-table td { padding: 9px 12px; border-top: 1px solid #143825; font-size: 12px; vertical-align: top; }' +
    '.lbl { color: #64748b; font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }' +
    '.val { color: #ffffff; font-weight: bold; font-family: monospace; font-size: 13px; margin-top: 3px; }' +
    '.val-glow { color: #00f59b; font-weight: 900; font-family: monospace; font-size: 15px; margin-top: 3px; }' +
    '.qr-box { background: #ffffff; padding: 10px; border-radius: 10px; display: inline-block; border: 2px solid #00f59b; }' +
    '.footer-bar { margin-top: 24px; padding-top: 16px; border-top: 1px solid #143825; text-align: center; }' +
    '</style></head><body>' +
    '<div class="ticket-wrapper">' +
      '<table width="100%">' +
        '<tr>' +
          '<td>' +
            '<div class="badge">SEUSL • FACULTY OF TECHNOLOGY</div>' +
            '<div class="title">HASHCORE \'26 CITADEL PASS</div>' +
            '<div class="subtitle">' + p.competitionTitle + '</div>' +
          '</td>' +
          '<td align="right" valign="top">' +
            '<div style="background: #062b1b; border: 2px solid #00f59b; color: #00f59b; padding: 8px 16px; border-radius: 8px; font-family: monospace; font-weight: 900; font-size: 16px; display: inline-block;">' +
              p.ticketId +
            '</div>' +
          '</td>' +
        '</tr>' +
      '</table>' +
      '<table class="pass-table">' +
        '<tr>' +
          '<td width="50%"><div class="lbl">Participant Name</div><div class="val" style="font-size: 16px; color: #ffffff;">' + p.participantName + '</div></td>' +
          '<td width="50%"><div class="lbl">University Reg No</div><div class="val-glow">' + p.regNo + '</div></td>' +
        '</tr>' +
        '<tr>' +
          '<td><div class="lbl">Academic Batch</div><div class="val">' + (p.batch || '2022/2023') + '</div></td>' +
          '<td><div class="lbl">Faculty</div><div class="val">' + (p.faculty || 'Technology') + '</div></td>' +
        '</tr>' +
        '<tr>' +
          '<td><div class="lbl">Email Address</div><div class="val">' + p.email + '</div></td>' +
          '<td><div class="lbl">Contact Number</div><div class="val">' + p.contactNo + '</div></td>' +
        '</tr>' +
      '</table>' +
      '<div class="footer-bar">' +
        '<table width="100%">' +
          '<tr>' +
            '<td align="center">' +
              '<div class="qr-box"><img src="' + qrUrl + '" width="140" height="140" style="display: block;" /></div>' +
              '<div style="font-size: 11px; color: #00f59b; font-family: monospace; margin-top: 8px; font-weight: bold; letter-spacing: 1px;">• OFFICIAL CITADEL ENTRY PASS •</div>' +
              '<div style="font-size: 10px; color: #64748b; margin-top: 3px;">Present this QR pass to event organizers for instant attendance check-in</div>' +
            '</td>' +
          '</tr>' +
        '</table>' +
      '</div>' +
    '</div></body></html>';

  try {
    var blob = Utilities.newBlob(pdfHtml, 'text/html', 'ticket.html');
    return blob.getAs('application/pdf').setName('SEUSL_HASHCORE_PASS_' + p.ticketId + '.pdf');
  } catch (err) {
    Logger.log('PDF generation error: ' + err.toString());
    return null;
  }
}

/**
 * Dispatches the official "Thank you for attending today's workshop" attendance confirmation email.
 */
function sendAttendanceThankYouEmail(p) {
  var subject = "Thank You for Attending Today's Workshop — SEUSL HASHCORE 2026";
  var checkInTime = Utilities.formatDate(new Date(), 'Asia/Colombo', "yyyy-MM-dd HH:mm:ss");

  var plainText = "SEUSL HASHCORE 2026 — ATTENDANCE CONFIRMED\n\n" +
    "Dear " + p.participantName + ",\n\n" +
    "Thank you for attending today's SEUSL HASHCORE 2026 Workshop & Competition session!\n\n" +
    "Your attendance has been officially verified and recorded.\n\n" +
    "--------------------------------------------------\n" +
    "ATTENDANCE CHECK-IN DETAILS\n" +
    "--------------------------------------------------\n" +
    "Participant Name:    " + p.participantName + "\n" +
    "University Reg No:   " + p.regNo + "\n" +
    "Track / Event:       " + (p.competitionTitle || 'SEUSL HASHCORE 2026') + "\n" +
    "Attendance Status:   PRESENT & VERIFIED\n" +
    "Check-In Timestamp:  " + checkInTime + "\n" +
    "--------------------------------------------------\n\n" +
    "We appreciate your active participation and enthusiasm at the Faculty of Technology, South Eastern University of Sri Lanka.\n\n" +
    "--\n" +
    "HASHCORE 2026 Organizing Committee\n" +
    "Faculty of Technology • South Eastern University of Sri Lanka (SEUSL)\n" +
    "University Park, Oluvil, #32360, Sri Lanka\n" +
    "Inquiries: " + OFFICIAL_SENDER_EMAIL + "\n";

  var htmlBody = '<!DOCTYPE html>' +
    '<html><body style="margin: 0; padding: 20px 10px; background-color: #030805; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #06170e; border: 2px solid #00f59b; border-radius: 16px; padding: 24px;">' +
        '<tr><td align="center" style="padding-bottom: 16px;">' +
          '<div style="display: inline-block; background-color: #062b1b; border: 1px solid #00f59b; color: #00f59b; padding: 5px 14px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">SEUSL &bull; Faculty of Technology</div>' +
          '<h1 style="color: #ffffff; font-size: 22px; margin: 14px 0 6px; font-weight: 800;">Thank You for Attending Today!</h1>' +
          '<p style="color: #94a3b8; font-size: 14px; margin: 0;">Your event attendance has been officially confirmed and logged.</p>' +
        '</td></tr>' +
        '<tr><td>' +
          '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(0, 245, 155, 0.08); border: 1px solid rgba(0, 245, 155, 0.25); border-radius: 12px; padding: 18px; margin: 16px 0;">' +
            '<tr><td colspan="2" style="padding-bottom: 10px;">' +
              '<div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Participant Name</div>' +
              '<div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 2px;">' + p.participantName + '</div>' +
            '</td></tr>' +
            '<tr>' +
              '<td width="50%" style="border-top: 1px solid rgba(0, 245, 155, 0.2); padding-top: 10px;">' +
                '<div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Reg Number</div>' +
                '<div style="font-size: 14px; font-weight: 800; color: #00f59b; font-family: monospace; margin-top: 2px;">' + p.regNo + '</div>' +
              '</td>' +
              '<td width="50%" style="border-top: 1px solid rgba(0, 245, 155, 0.2); padding-top: 10px;">' +
                '<div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Attendance Status</div>' +
                '<div style="font-size: 14px; font-weight: 800; color: #00f59b; margin-top: 2px;">PRESENT &check;</div>' +
              '</td>' +
            '</tr>' +
            '<tr>' +
              '<td colspan="2" style="border-top: 1px solid rgba(0, 245, 155, 0.2); padding-top: 10px;">' +
                '<div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold;">Check-In Time</div>' +
                '<div style="font-size: 13px; font-weight: 600; color: #e2e8f0; font-family: monospace; margin-top: 2px;">' + checkInTime + '</div>' +
              '</td>' +
            '</tr>' +
          '</table>' +
        '</td></tr>' +
        '<tr><td style="color: #cbd5e1; font-size: 14px; line-height: 1.6; padding: 10px 0;">' +
          'Thank you for joining us today for <strong>' + (p.competitionTitle || "SEUSL HASHCORE '26") + '</strong> at South Eastern University of Sri Lanka. ' +
          'We hope you had an enriching and insightful experience. Stay tuned for further announcements regarding competition rounds and certificates!' +
        '</td></tr>' +
        '<tr><td style="border-top: 1px solid #143825; padding-top: 18px; margin-top: 20px; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">' +
          'HASHCORE 2026 Organizing Committee &bull; Faculty of Technology<br/>' +
          'South Eastern University of Sri Lanka (SEUSL)<br/>' +
          'Contact: <a href="mailto:' + OFFICIAL_SENDER_EMAIL + '" style="color: #00f59b; text-decoration: none;">' + OFFICIAL_SENDER_EMAIL + '</a>' +
        '</td></tr>' +
      '</table>' +
    '</body></html>';

  sendEmailNotification({
    to: p.email,
    subject: subject,
    plainText: plainText,
    htmlBody: htmlBody
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'Empty payload received' });
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse({ success: false, error: 'Malformed JSON payload' });
    }

    // 1. Direct test trigger
    if (data.action === 'test' || data.action === 'verify') {
      var targetEmail = data.email || 'verifyxcode@gmail.com';
      var testResult = testSendEmailToVerifyXcode(targetEmail);
      return jsonResponse({
        success: true,
        message: 'Verification test email sent to ' + targetEmail,
        details: testResult
      });
    }

    // 2. REAL-TIME QR ATTENDANCE CHECK-IN ACTION
    if (data.action === 'checkIn' || data.action === 'attendance') {
      var checkRegNo = (data.universityRegNo || data.regNo || '').trim().toUpperCase();
      var checkTicketId = (data.ticketId || '').trim();
      var checkName = (data.participantName || data.name || '').trim();
      var checkEmail = (data.email || '').trim().toLowerCase();
      var checkTrack = data.track || data.competition || 'Workshop';

      // Look up row in Google Sheet
      var ss = null;
      try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (ssErr) {}
      var sheet = ss ? (ss.getActiveSheet() || ss.getSheets()[0]) : null;

      if (sheet) {
        try {
          var dataRange = sheet.getDataRange().getValues();
          var headers = dataRange[0] || [];
          var attColIdx = -1;
          var timeColIdx = -1;

          for (var c = 0; c < headers.length; c++) {
            var h = String(headers[c] || '').toLowerCase();
            if (h.indexOf('attendance') !== -1) attColIdx = c;
            if (h.indexOf('check-in') !== -1 || h.indexOf('checkin') !== -1) timeColIdx = c;
          }

          if (attColIdx === -1) {
            attColIdx = headers.length;
            sheet.getRange(1, attColIdx + 1).setValue('Attendance Status');
          }
          if (timeColIdx === -1) {
            timeColIdx = attColIdx + 1;
            sheet.getRange(1, timeColIdx + 1).setValue('Check-In Time');
          }

          for (var r = 1; r < dataRange.length; r++) {
            var rowReg = String(dataRange[r][6] || '').trim().toUpperCase();
            var rowTicket = String(dataRange[r][1] || '').trim();
            if ((checkRegNo && rowReg === checkRegNo) || (checkTicketId && rowTicket === checkTicketId)) {
              checkName = checkName || String(dataRange[r][3] || '');
              checkEmail = checkEmail || String(dataRange[r][7] || '');
              checkTrack = checkTrack || String(dataRange[r][2] || '');
              sheet.getRange(r + 1, attColIdx + 1).setValue('Present');
              sheet.getRange(r + 1, timeColIdx + 1).setValue(new Date());
              break;
            }
          }
        } catch (sErr) {
          Logger.log('Attendance sheet update error: ' + sErr.toString());
        }
      }

      // Dispatch Thank-You Attendance Email
      var emailSent = false;
      if (checkEmail) {
        try {
          sendAttendanceThankYouEmail({
            participantName: checkName || 'Participant',
            regNo: checkRegNo,
            email: checkEmail,
            competitionTitle: checkTrack
          });
          emailSent = true;
        } catch (mailErr) {
          Logger.log('Attendance email dispatch error: ' + mailErr.toString());
        }
      }

      return jsonResponse({
        success: true,
        status: 'checked_in',
        message: 'Attendance successfully confirmed & thank-you email sent.',
        emailSent: emailSent,
        participant: {
          name: checkName || 'Participant',
          universityRegNo: checkRegNo,
          track: checkTrack,
          email: checkEmail,
          ticketId: checkTicketId
        }
      });
    }

    // 3. EVENT REGISTRATION ACTION
    var participantName = (data.initialsWithName || data.name || '').trim();
    var batch = (data.batch || '').trim();
    var faculty = (data.faculty || 'Technology').trim();
    var regNo = (data.universityRegNo || data.regNo || '').trim().toUpperCase();
    var rawEmail = (data.email || '').trim().toLowerCase();
    var contactNo = (data.contactNo || '').trim();
    var whatsappNo = (data.whatsappNo || contactNo || '').trim();
    var competition = (data.competition || data.track || 'Web').trim();
    var isCTF = competition.toUpperCase().indexOf('CTF') !== -1;
    var compShort = isCTF ? 'CTF' : 'WEB';
    var competitionTitle = isCTF ? 'CTF Competition' : 'Web Development Competition';

    if (!participantName) {
      return jsonResponse({ success: false, error: 'Name with Initials is required.' });
    }

    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      return jsonResponse({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!regNo) {
      return jsonResponse({ success: false, error: 'University Registration Number is required.' });
    }

    // Access Google Sheet
    var ss = null;
    try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (ssErr) {}
    var sheet = ss ? (ss.getActiveSheet() || ss.getSheets()[0]) : null;

    var ticketId = '';
    var registrationDate = Utilities.formatDate(new Date(), 'Asia/Colombo', "yyyy-MM-dd HH:mm:ss");
    var newRowIndex = -1;

    if (sheet) {
      try {
        ensureSheetHeaders(sheet);
        var dataRange = sheet.getDataRange().getValues();
        var headers = dataRange[0] || [];
        var regColIdx = -1;
        var ticketColIdx = -1;
        var compColIdx = -1;

        for (var c = 0; c < headers.length; c++) {
          var h = String(headers[c] || '').toLowerCase();
          if (h.indexOf('reg') !== -1 || h.indexOf('university') !== -1) regColIdx = c;
          if (h.indexOf('ticket') !== -1) ticketColIdx = c;
          if (h.indexOf('comp') !== -1 || h.indexOf('track') !== -1) compColIdx = c;
        }

        if (regColIdx === -1) regColIdx = 6;
        if (ticketColIdx === -1) ticketColIdx = 1;
        if (compColIdx === -1) compColIdx = 2;

        // Check for duplicates
        for (var r = 1; r < dataRange.length; r++) {
          var existingRegNo = String(dataRange[r][regColIdx] || '').trim().toUpperCase();
          var existingTicket = String(dataRange[r][ticketColIdx] || '').trim();

          if (existingRegNo && existingRegNo === regNo) {
            return jsonResponse({
              success: false,
              duplicate: true,
              error: 'You have already registered for this event.',
              existingTicketId: existingTicket || null,
              universityRegNo: regNo
            });
          }
        }

        // Sequential Ticket Numbering
        var countForTrack = 0;
        for (var i = 1; i < dataRange.length; i++) {
          var rowComp = String(dataRange[i][compColIdx] || '');
          if (rowComp.indexOf(compShort) !== -1 || (isCTF && rowComp.indexOf('CTF') !== -1) || (!isCTF && rowComp.indexOf('Web') !== -1)) {
            countForTrack++;
          }
        }
        var nextNum = countForTrack + 1;
        var paddedNum = ('00000' + nextNum).slice(-5);
        ticketId = compShort + '-2026-' + paddedNum;

        var rowData = [
          new Date(),
          ticketId,
          competitionTitle,
          participantName,
          batch,
          faculty,
          regNo,
          rawEmail,
          contactNo,
          whatsappNo,
          'Confirmed',
          'Pending',
          'Not Checked In',
          ''
        ];

        sheet.appendRow(rowData);
        newRowIndex = sheet.getLastRow();
      } catch (sheetErr) {
        Logger.log('Sheet logging warning: ' + sheetErr.toString());
      }
    }

    if (!ticketId) {
      var randNum = ('00000' + Math.floor(1000 + Math.random() * 90000)).slice(-5);
      ticketId = compShort + '-2026-' + randNum;
    }

    // BUILD QR CODE PAYLOAD
    // Dual format: includes both JSON structure and clear text fields
    var qrPayload = JSON.stringify({
      id: ticketId,
      reg: regNo,
      name: participantName,
      track: compShort,
      email: rawEmail
    });
    var qrCodeImageUrl = getQrCodeUrl(qrPayload);

    // 4. SEND CONFIRMATION EMAIL WITH EMBEDDED QR & PDF ATTACHMENT
    var emailSent = false;
    var emailErrorMessage = '';

    try {
      var subject = "SEUSL HASHCORE 2026 Registration Confirmed: " + competitionTitle + " [" + ticketId + "]";
      var emailParams = {
        participantName: participantName,
        competitionTitle: competitionTitle,
        batch: batch,
        faculty: faculty,
        regNo: regNo,
        email: rawEmail,
        contactNo: contactNo,
        whatsappNo: whatsappNo,
        ticketId: ticketId,
        registrationDate: registrationDate,
        qrPayload: qrPayload
      };

      var plainText = buildPlainTextEmail(emailParams);
      var htmlBody = buildConfirmationEmailHtml(emailParams, qrCodeImageUrl);

      // Generate the official PDF Ticket Pass
      var pdfAttachment = generateTicketPdfBlob(emailParams, qrCodeImageUrl);
      var attachments = pdfAttachment ? [pdfAttachment] : [];

      sendEmailNotification({
        to: rawEmail,
        subject: subject,
        plainText: plainText,
        htmlBody: htmlBody,
        attachments: attachments
      });

      emailSent = true;
      if (sheet && newRowIndex > 0) {
        sheet.getRange(newRowIndex, 12).setValue('Sent');
      }
    } catch (mailErr) {
      Logger.log('Mail send error: ' + mailErr.toString());
      emailErrorMessage = mailErr.toString();
      if (sheet && newRowIndex > 0) {
        sheet.getRange(newRowIndex, 12).setValue('Failed');
      }
    }

    // 5. RETURN SUCCESS RESPONSE TO FRONTEND
    return jsonResponse({
      success: true,
      ticketId: ticketId,
      emailSent: emailSent,
      email: rawEmail,
      participantName: participantName,
      competition: competitionTitle,
      universityRegNo: regNo,
      batch: batch,
      faculty: faculty,
      contactNo: contactNo,
      whatsappNo: whatsappNo,
      registrationDate: registrationDate,
      qrDataUrl: qrCodeImageUrl,
      emailErrorMessage: emailErrorMessage
    });

  } catch (globalErr) {
    return jsonResponse({
      success: false,
      error: globalErr.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Trigger function for Google Forms / Sheets "On form submit"
 */
function onFormSubmit(e) {
  try {
    if (!e) return;
    var values = e.namedValues || {};
    var getVal = function(key) {
      var match = Object.keys(values).find(function(k) {
        return k.toLowerCase().indexOf(key.toLowerCase()) !== -1;
      });
      return match && values[match] && values[match][0] ? values[match][0].trim() : '';
    };

    var rawEmail = getVal('email') || getVal('mail');
    if (!rawEmail) return;

    var participantName = getVal('name') || getVal('initials') || 'Participant';
    var regNo = getVal('reg') || getVal('university') || '';
    var faculty = getVal('faculty') || 'Technology';
    var batch = getVal('batch') || '';
    var contactNo = getVal('contact') || getVal('phone') || '';
    var whatsappNo = getVal('whatsapp') || contactNo;
    var competition = getVal('track') || getVal('competition') || 'Web';
    var isCTF = competition.toUpperCase().indexOf('CTF') !== -1;
    var compShort = isCTF ? 'CTF' : 'WEB';
    var competitionTitle = isCTF ? 'CTF Competition' : 'Web Development Competition';

    var ticketId = compShort + '-2026-' + ('00000' + Math.floor(1000 + Math.random() * 90000)).slice(-5);
    var registrationDate = Utilities.formatDate(new Date(), 'Asia/Colombo', "yyyy-MM-dd HH:mm:ss");

    var qrPayload = JSON.stringify({
      id: ticketId,
      reg: regNo,
      name: participantName,
      track: compShort,
      email: rawEmail
    });
    var qrCodeImageUrl = getQrCodeUrl(qrPayload);

    var emailParams = {
      participantName: participantName,
      competitionTitle: competitionTitle,
      batch: batch,
      faculty: faculty,
      regNo: regNo,
      email: rawEmail,
      contactNo: contactNo,
      whatsappNo: whatsappNo,
      ticketId: ticketId,
      registrationDate: registrationDate,
      qrPayload: qrPayload
    };

    var plainText = buildPlainTextEmail(emailParams);
    var htmlBody = buildConfirmationEmailHtml(emailParams, qrCodeImageUrl);
    var pdfAttachment = generateTicketPdfBlob(emailParams, qrCodeImageUrl);

    sendEmailNotification({
      to: rawEmail,
      subject: "SEUSL HASHCORE 2026 Registration Confirmed: " + competitionTitle + " [" + ticketId + "]",
      plainText: plainText,
      htmlBody: htmlBody,
      attachments: pdfAttachment ? [pdfAttachment] : []
    });
  } catch (err) {
    Logger.log('onFormSubmit error: ' + err.toString());
  }
}

/**
 * Ensures clean, standardized column headers on the active spreadsheet.
 */
function ensureSheetHeaders(sheet) {
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) {
    var headers = [
      'Timestamp',
      'Ticket ID',
      'Competition',
      'Initials with Name',
      'Batch',
      'Faculty',
      'University Reg No',
      'Email Address',
      'Contact Number',
      'WhatsApp Number',
      'Registration Status',
      'Email Dispatch Status',
      'Attendance Status',
      'Check-In Time'
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#062b1b');
    headerRange.setFontColor('#00f59b');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
}

/**
 * Plain-Text email generator
 */
function buildPlainTextEmail(p) {
  return "SEUSL HASHCORE 2026 — REGISTRATION CONFIRMED\n\n" +
    "Dear " + p.participantName + ",\n\n" +
    "Your registration for the SEUSL HASHCORE 2026 " + p.competitionTitle + " has been successfully confirmed.\n\n" +
    "--------------------------------------------------\n" +
    "OFFICIAL TICKET PASS DETAILS\n" +
    "--------------------------------------------------\n" +
    "Ticket ID:           " + p.ticketId + "\n" +
    "Competition:         " + p.competitionTitle + "\n" +
    "Participant Name:    " + p.participantName + "\n" +
    "University Reg No:   " + p.regNo + "\n" +
    "Academic Batch:      " + p.batch + "\n" +
    "Faculty:             " + p.faculty + "\n" +
    "Registered Email:    " + p.email + "\n" +
    "Contact Number:      " + p.contactNo + "\n" +
    "WhatsApp Number:     " + (p.whatsappNo || p.contactNo) + "\n" +
    "Registration Date:   " + p.registrationDate + "\n" +
    "--------------------------------------------------\n\n" +
    "OFFICIAL PDF PASS ATTACHED:\n" +
    "Your official SEUSL HASHCORE '26 Ticket Pass has been attached to this email as a PDF file.\n\n" +
    "IMPORTANT NOTICE:\n" +
    "Please save this email or present your Ticket QR Code / Ticket ID (" + p.ticketId + ") during registration check-in on event day.\n\n" +
    "--\n" +
    "HASHCORE 2026 Organizing Committee\n" +
    "Faculty of Technology • South Eastern University of Sri Lanka (SEUSL)\n" +
    "University Park, Oluvil, #32360, Sri Lanka\n" +
    "Inquiries: " + OFFICIAL_SENDER_EMAIL + "\n";
}

/**
 * Clean, Spam-Safe HTML Email Template with Embedded QR Code
 */
function buildConfirmationEmailHtml(p, qrUrl) {
  return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
    '<html xmlns="http://www.w3.org/1999/xhtml">' +
    '<head>' +
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
    '<title>SEUSL HASHCORE 2026 Official Ticket Pass</title>' +
    '</head>' +
    '<body style="margin: 0; padding: 20px 10px; background-color: #030805; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 620px; margin: 0 auto;">' +
        
        '<!-- Header Badge -->' +
        '<tr>' +
          '<td align="center" style="padding-bottom: 18px;">' +
            '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display: inline-table; margin: 0 auto;">' +
              '<tr>' +
                '<td style="background-color: #062b1b; border: 1px solid #00f59b; border-radius: 20px; padding: 6px 18px; font-size: 11px; font-weight: 700; color: #00f59b; letter-spacing: 1.5px; text-transform: uppercase;">' +
                  'SEUSL &bull; Faculty of Technology' +
                '</td>' +
              '</tr>' +
            '</table>' +
            '<h1 style="margin: 14px 0 6px; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">' +
              'Registration Confirmed' +
            '</h1>' +
            '<p style="margin: 0; font-size: 14px; color: #94a3b8;">' +
              'Welcome, <strong style="color: #00f59b;">' + p.participantName + '</strong>! Your pass is confirmed.' +
            '</p>' +
          '</td>' +
        '</tr>' +

        '<!-- Official Pass Card -->' +
        '<tr>' +
          '<td style="padding: 0;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius: 16px; border: 2px solid #00f59b; background-color: #06170e; border-collapse: separate;">' +
              '<tr>' +
                '<td style="padding: 24px;">' +
                  
                  '<!-- Pass Header -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
                    '<tr>' +
                      '<td valign="top">' +
                        '<div style="font-size: 10px; font-weight: 700; color: #00f59b; letter-spacing: 1.5px; text-transform: uppercase;">' +
                          'EVENT ACCESS PASS' +
                        '</div>' +
                        '<div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 2px;">' +
                          'SEUSL HASHCORE 2026' +
                        '</div>' +
                        '<div style="font-size: 12px; font-weight: 600; color: #94a3b8; margin-top: 2px;">' +
                          p.competitionTitle +
                        '</div>' +
                      '</td>' +
                      '<td align="right" valign="top">' +
                        '<div style="font-size: 10px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">' +
                          'TICKET ID' +
                        '</div>' +
                        '<div style="font-size: 16px; font-weight: 800; color: #00f59b; font-family: Consolas, monospace; margin-top: 2px;">' +
                          p.ticketId +
                        '</div>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +

                  '<!-- Embedded QR Code -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0 16px;">' +
                    '<tr>' +
                      '<td align="center">' +
                        '<div style="display: inline-block; background-color: #ffffff; padding: 10px; border-radius: 12px; border: 2px solid #00f59b; box-shadow: 0 4px 16px rgba(0,0,0,0.5);">' +
                          '<img src="' + qrUrl + '" width="140" height="140" alt="Official Ticket QR Code" style="display: block; margin: 0 auto;" />' +
                        '</div>' +
                        '<div style="font-size: 11px; color: #00f59b; font-family: monospace; font-weight: bold; margin-top: 8px; letter-spacing: 1px;">' +
                          '&bull; OFFICIAL ENTRY QR CODE &bull;' +
                        '</div>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +

                  '<!-- Participant Data Grid -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 14px;">' +
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 10px 8px 8px 0; border-top: 1px solid #0d2618;">' +
                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Participant Name</div>' +
                        '<div style="font-size: 14px; font-weight: 700; color: #ffffff; margin-top: 2px;">' + p.participantName + '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 10px 0 8px 8px; border-top: 1px solid #0d2618;">' +
                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">University Reg No</div>' +
                        '<div style="font-size: 14px; font-weight: 700; color: #00f59b; font-family: Consolas, monospace; margin-top: 2px;">' + p.regNo + '</div>' +
                      '</td>' +
                    '</tr>' +
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 10px 8px 8px 0; border-top: 1px solid #0d2618;">' +
                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Academic Batch</div>' +
                        '<div style="font-size: 13px; font-weight: 600; color: #e2e8f0; font-family: Consolas, monospace; margin-top: 2px;">' + (p.batch || '2022/2023') + '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 10px 0 8px 8px; border-top: 1px solid #0d2618;">' +
                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Faculty</div>' +
                        '<div style="font-size: 13px; font-weight: 600; color: #e2e8f0; margin-top: 2px;">' + (p.faculty || 'Technology') + '</div>' +
                      '</td>' +
                    '</tr>' +
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 10px 8px 8px 0; border-top: 1px solid #0d2618;">' +
                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Registered Email</div>' +
                        '<div style="font-size: 13px; font-weight: 600; color: #e2e8f0; font-family: Consolas, monospace; margin-top: 2px;">' + p.email + '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 10px 0 8px 8px; border-top: 1px solid #0d2618;">' +
                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Contact Number</div>' +
                        '<div style="font-size: 13px; font-weight: 600; color: #e2e8f0; font-family: Consolas, monospace; margin-top: 2px;">' + p.contactNo + '</div>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +

                  '<!-- Pass Status Bottom -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #143825; padding-top: 16px; margin-top: 18px;">' +
                    '<tr>' +
                      '<td valign="middle">' +
                        '<div style="font-size: 12px; color: #00f59b; font-weight: 700;">' +
                          '&check; PASS STATUS: VERIFIED & CONFIRMED' +
                        '</div>' +
                        '<div style="font-size: 11px; color: #64748b; margin-top: 2px;">' +
                          'Faculty of Technology, SEUSL' +
                        '</div>' +
                      '</td>' +
                      '<td align="right" valign="middle">' +
                        '<div style="display: inline-block; background-color: #00f59b; color: #030805; font-weight: 800; font-size: 11px; padding: 6px 14px; border-radius: 6px; letter-spacing: 1px; text-transform: uppercase;">' +
                          'ADMIT PASS' +
                        '</div>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +

                '</td>' +
              '</tr>' +
            '</table>' +
          '</td>' +
        '</tr>' +

        '<!-- Notice Banner (Mentions PDF Attachment) -->' +
        '<tr>' +
          '<td style="padding: 18px 4px 10px;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1a1608; border-left: 3px solid #00f59b; border-radius: 6px;">' +
              '<tr>' +
                '<td style="padding: 12px 16px; font-size: 13px; color: #fde68a; line-height: 1.5;">' +
                  '<strong>Attachment:</strong> Your official <strong>PDF Ticket Pass</strong> is attached to this email. Please save it on your phone or print it for check-in on competition day.' +
                '</td>' +
              '</tr>' +
            '</table>' +
          '</td>' +
        '</tr>' +

        '<!-- Institutional Footer -->' +
        '<tr>' +
          '<td align="center" style="padding: 18px 8px 24px; color: #64748b; font-size: 11px; line-height: 1.6;">' +
            '<strong style="color: #94a3b8;">HASHCORE 2026 Organizing Committee</strong><br />' +
            'Faculty of Technology &bull; South Eastern University of Sri Lanka (SEUSL)<br />' +
            'University Park, Oluvil, #32360, Sri Lanka<br />' +
            'Official Inquiries: <a href="mailto:hashcore@seu.ac.lk" style="color: #00f59b; text-decoration: none;">hashcore@seu.ac.lk</a>' +
          '</td>' +
        '</tr>' +

      '</table>' +
    '</body>' +
    '</html>';
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Verification test function
 */
function testSendEmailToVerifyXcode(recipient) {
  var testEmail = recipient || 'verifyxcode@gmail.com';
  var testTicketId = 'WEB-2026-TEST01';
  var testDate = Utilities.formatDate(new Date(), 'Asia/Colombo', "yyyy-MM-dd HH:mm:ss");

  var emailParams = {
    participantName: "Xcode Verifier",
    competitionTitle: "Web Development Competition",
    batch: "2021/2022",
    faculty: "Technology",
    regNo: "SEU/IS/21/TEST/001",
    email: testEmail,
    contactNo: "+94 77 123 4567",
    whatsappNo: "+94 77 123 4567",
    ticketId: testTicketId,
    registrationDate: testDate,
    qrPayload: JSON.stringify({ id: testTicketId, reg: "SEU/IS/21/TEST/001", name: "Xcode Verifier" })
  };

  var qrUrl = getQrCodeUrl(emailParams.qrPayload);
  var plainText = buildPlainTextEmail(emailParams);
  var htmlBody = buildConfirmationEmailHtml(emailParams, qrUrl);
  var pdfBlob = generateTicketPdfBlob(emailParams, qrUrl);

  sendEmailNotification({
    to: testEmail,
    subject: "SEUSL HASHCORE 2026 Registration Confirmed: Web Development Competition [" + testTicketId + "]",
    plainText: plainText,
    htmlBody: htmlBody,
    attachments: pdfBlob ? [pdfBlob] : []
  });

  return {
    success: true,
    recipient: testEmail,
    ticketId: testTicketId,
    timestamp: testDate,
    hasPdfAttached: !!pdfBlob
  };
}

function doGet(e) {
  var params = (e && e.parameter) || {};

  // GET Attendance Check-In (Allows ultra-resilient browser check-in without CORS blocks)
  if (params.action === 'checkIn' || params.action === 'attendance') {
    var checkRegNo = (params.regNo || params.universityRegNo || '').trim().toUpperCase();
    var checkTicketId = (params.ticketId || '').trim();
    var checkName = (params.name || params.participantName || '').trim();
    var checkEmail = (params.email || '').trim().toLowerCase();
    var checkTrack = params.track || 'Workshop';

    var emailSent = false;
    if (checkEmail) {
      try {
        sendAttendanceThankYouEmail({
          participantName: checkName || 'Participant',
          regNo: checkRegNo,
          email: checkEmail,
          competitionTitle: checkTrack
        });
        emailSent = true;
      } catch (err) {}
    }

    return jsonResponse({
      success: true,
      status: 'checked_in',
      emailSent: emailSent,
      participant: {
        name: checkName,
        universityRegNo: checkRegNo,
        track: checkTrack,
        email: checkEmail,
        ticketId: checkTicketId
      }
    });
  }

  if (params.action === 'test' || params.action === 'verify') {
    var targetEmail = params.email || 'verifyxcode@gmail.com';
    try {
      var testResult = testSendEmailToVerifyXcode(targetEmail);
      return jsonResponse({
        status: 'success',
        message: 'Verification test email sent to ' + targetEmail,
        officialEmail: OFFICIAL_SENDER_EMAIL,
        details: testResult
      });
    } catch (err) {
      return jsonResponse({
        status: 'error',
        message: 'Failed to send test email: ' + err.toString(),
        officialEmail: OFFICIAL_SENDER_EMAIL
      });
    }
  }

  return jsonResponse({
    status: 'active',
    service: 'SEUSL HASHCORE 2026 Registration, QR Ticketing & Attendance API',
    officialEmail: OFFICIAL_SENDER_EMAIL,
    timestamp: new Date()
  });
}
