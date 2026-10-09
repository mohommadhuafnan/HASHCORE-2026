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
var CITADEL_BG_IMAGE_URL = 'https://raw.githubusercontent.com/mohommadhuafnan/HASHCORE-2026/Afnan/public/00001.jpg';

/**
 * Dispatches an email notification via GmailApp (with MailApp fallback).
 * Supports attachments (PDF passes) with automatic retry without attachments if delivery fails.
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

  // 1. Primary: Try GmailApp with attachments
  try {
    GmailApp.sendEmail(to, subject, plainText, mailOptions);
    return true;
  } catch (gmailErr) {
    Logger.log('GmailApp send with attachments notice: ' + gmailErr.toString());
  }

  // 2. Secondary: Fallback to MailApp
  try {
    var mailAppOptions = {
      to: to,
      subject: subject,
      body: plainText,
      htmlBody: htmlBody,
      name: mailOptions.name,
      replyTo: mailOptions.replyTo
    };
    if (attachments && attachments.length > 0) {
      mailAppOptions.attachments = attachments;
    }
    MailApp.sendEmail(mailAppOptions);
    return true;
  } catch (mailErr) {
    Logger.log('MailApp send notice: ' + mailErr.toString());
  }

  // 3. Guaranteed Delivery Fallback: If sending with attachments failed, retry without attachments
  if (attachments && attachments.length > 0) {
    Logger.log('Retrying email dispatch without attachments to ensure delivery to ' + to);
    delete mailOptions.attachments;
    try {
      GmailApp.sendEmail(to, subject, plainText, mailOptions);
      return true;
    } catch (gRetryErr) {
      try {
        MailApp.sendEmail({
          to: to,
          subject: subject,
          body: plainText,
          htmlBody: htmlBody,
          name: mailOptions.name,
          replyTo: mailOptions.replyTo
        });
        return true;
      } catch (mRetryErr) {
        Logger.log('CRITICAL: All email delivery attempts failed: ' + mRetryErr.toString());
      }
    }
  }

  return false;
}

/**
 * Generates an accessible, high-contrast, high-resolution QR Code URL for the ticket.
 */
function getQrCodeUrl(payload) {
  return 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=4&data=' + encodeURIComponent(payload);
}

/**
 * Generates the official, cyber-styled PDF Ticket Pass matching the Citadel pass design.
 * Renders in A4 Landscape mode with real 00001 Citadel background image and black overlay.
 * Avoids CSS text-shadow to prevent WebKit black bounding box rendering bugs.
 */
function generateTicketPdfBlob(p, qrUrl) {
  try {
    var ticketId = p.ticketId || 'CTF-2026-00001';
    var compTrack = (p.competitionTitle || 'Network & Security Workshop').toUpperCase();
    var batch = p.batch || '2022/2023';
    var faculty = p.faculty || 'Technology';
    var contactNo = p.contactNo || '0772117131';

    // 1. Fetch & Inline QR Code as Base64 for instant, offline PDF embedding
    var qrImgSrc = qrUrl;
    try {
      if (typeof UrlFetchApp !== 'undefined') {
        var qrResp = UrlFetchApp.fetch(qrUrl, { muteHttpExceptions: true, deadline: 10 });
        if (qrResp && qrResp.getResponseCode() === 200) {
          var base64Data = Utilities.base64Encode(qrResp.getBlob().getBytes());
          if (base64Data) {
            qrImgSrc = 'data:image/png;base64,' + base64Data;
          }
        }
      }
    } catch (qrErr) {
      qrImgSrc = qrUrl;
    }

    // 2. Fetch & Inline Citadel 00001 Background Image for PDF rendering
    var bgImgSrc = CITADEL_BG_IMAGE_URL;
    try {
      if (typeof UrlFetchApp !== 'undefined') {
        var bgResp = UrlFetchApp.fetch(CITADEL_BG_IMAGE_URL, { muteHttpExceptions: true, deadline: 10 });
        if (bgResp && bgResp.getResponseCode() === 200) {
          var bgBase64 = Utilities.base64Encode(bgResp.getBlob().getBytes());
          if (bgBase64) {
            bgImgSrc = 'data:image/jpeg;base64,' + bgBase64;
          }
        }
      }
    } catch (bgErr) {
      bgImgSrc = CITADEL_BG_IMAGE_URL;
    }

    var pdfHtml = '<!DOCTYPE html>' +
      '<html><head><meta charset="utf-8"/>' +
      '<style>' +
      '@page { size: 297mm 210mm; margin: 0; }' +
      '* { box-sizing: border-box; }' +
      'html, body { margin: 0; padding: 0; width: 297mm; height: 210mm; background-color: #030805; font-family: Helvetica, Arial, sans-serif; color: #f1f5f9; }' +
      '.page-wrapper { width: 297mm; height: 210mm; padding: 10mm; box-sizing: border-box; }' +
      '.citadel-card {' +
        'position: relative;' +
        'width: 100%;' +
        'height: 190mm;' +
        'border: 3px solid #00f59b;' +
        'border-radius: 18px;' +
        'overflow: hidden;' +
        'background-color: #040c07;' +
      '}' +
      '.bg-layer {' +
        'position: absolute;' +
        'top: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'height: 100%;' +
        'z-index: 1;' +
      '}' +
      '.black-overlay {' +
        'position: absolute;' +
        'top: 0;' +
        'left: 0;' +
        'width: 100%;' +
        'height: 100%;' +
        'background-color: rgba(3, 12, 7, 0.72);' +
        'z-index: 2;' +
      '}' +
      '.content-layer {' +
        'position: relative;' +
        'z-index: 5;' +
        'padding: 24px 34px;' +
        'height: 100%;' +
      '}' +
      '.corner-tl { position: absolute; top: 12px; left: 12px; width: 18px; height: 18px; border-top: 3px solid #ffffff; border-left: 3px solid #ffffff; z-index: 6; }' +
      '.corner-tr { position: absolute; top: 12px; right: 12px; width: 18px; height: 18px; border-top: 3px solid #ffffff; border-right: 3px solid #ffffff; z-index: 6; }' +
      '.corner-bl { position: absolute; bottom: 12px; left: 12px; width: 18px; height: 18px; border-bottom: 3px solid #ffffff; border-left: 3px solid #ffffff; z-index: 6; }' +
      '.corner-br { position: absolute; bottom: 12px; right: 12px; width: 18px; height: 18px; border-bottom: 3px solid #ffffff; border-right: 3px solid #ffffff; z-index: 6; }' +
      '.inst-badge { display: inline-block; background-color: rgba(6, 43, 27, 0.9); border: 1.5px solid #00f59b; color: #00f59b; font-size: 11px; font-weight: bold; padding: 5px 14px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1.5px; }' +
      '.pass-title { font-size: 24px; font-weight: 900; color: #ffffff; margin: 8px 0 2px 0; letter-spacing: -0.3px; }' +
      '.pass-subtitle { font-size: 13px; color: #00f59b; font-family: monospace; font-weight: bold; letter-spacing: 1px; }' +
      '.id-lbl { font-size: 11px; color: #cbd5e1; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; }' +
      '.id-val { font-size: 22px; font-weight: 900; color: #00f59b; font-family: monospace; }' +
      '.grid-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 14px; }' +
      '.grid-td { width: 50%; vertical-align: top; padding: 12px 14px; border-top: 1px solid rgba(0, 245, 155, 0.35); }' +
      '.f-lbl { font-size: 10px; color: #94a3b8; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px; }' +
      '.f-val { font-size: 16px; font-weight: bold; color: #ffffff; }' +
      '.f-val-cyan { font-size: 17px; font-weight: 900; color: #38bdf8; font-family: monospace; }' +
      '.tag-sent { display: inline-block; background-color: rgba(6, 43, 27, 0.9); border: 1px solid #00f59b; color: #00f59b; font-size: 9px; font-weight: bold; padding: 2px 7px; border-radius: 4px; vertical-align: middle; margin-left: 6px; }' +
      '.qr-wrap { background-color: #ffffff; padding: 8px; border-radius: 12px; border: 2.5px solid #00f59b; display: inline-block; }' +
      '.stamp-box { display: inline-block; border: 2.5px solid #00f59b; background-color: rgba(6, 43, 27, 0.9); border-radius: 12px; padding: 12px 24px; text-align: center; }' +
      '</style></head><body>' +
      '<div class="page-wrapper">' +
        '<div class="citadel-card">' +
          '<img src="' + bgImgSrc + '" class="bg-layer" style="width: 100%; height: 100%; object-fit: cover;" />' +
          '<div class="black-overlay"></div>' +
          '<div class="corner-tl"></div><div class="corner-tr"></div>' +
          '<div class="corner-bl"></div><div class="corner-br"></div>' +
          '<div class="content-layer">' +
            '<table width="100%" cellpadding="0" cellspacing="0" border="0">' +
              '<tr>' +
                '<td valign="top">' +
                  '<div class="inst-badge">SEUSL &bull; FACULTY OF TECHNOLOGY</div>' +
                  '<div class="pass-title">HASHCORE \'26 CITADEL PASS</div>' +
                  '<div class="pass-subtitle">' + compTrack + '</div>' +
                '</td>' +
                '<td align="right" valign="top">' +
                  '<div class="id-lbl">OFFICIAL PASS ID</div>' +
                  '<div class="id-val">' + ticketId + '</div>' +
                '</td>' +
              '</tr>' +
            '</table>' +
            '<table class="grid-table" cellpadding="0" cellspacing="0" border="0">' +
              '<tr>' +
                '<td class="grid-td">' +
                  '<div class="f-lbl">PARTICIPANT NAME</div>' +
                  '<div class="f-val" style="font-size: 17px;">' + p.participantName + '</div>' +
                '</td>' +
                '<td class="grid-td">' +
                  '<div class="f-lbl">UNIVERSITY REG NUMBER</div>' +
                  '<div class="f-val-cyan">' + p.regNo + '</div>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td class="grid-td">' +
                  '<div class="f-lbl">ACADEMIC BATCH</div>' +
                  '<div class="f-val">' + batch + '</div>' +
                '</td>' +
                '<td class="grid-td">' +
                  '<div class="f-lbl">FACULTY</div>' +
                  '<div class="f-val">' + faculty + '</div>' +
                '</td>' +
              '</tr>' +
              '<tr>' +
                '<td class="grid-td">' +
                  '<div class="f-lbl">EMAIL ADDRESS</div>' +
                  '<div class="f-val" style="font-family: monospace; font-size: 13px;">' + p.email + ' <span class="tag-sent">&#10003; EMAIL SENT</span></div>' +
                '</td>' +
                '<td class="grid-td">' +
                  '<div class="f-lbl">CONTACT NUMBER</div>' +
                  '<div class="f-val" style="font-family: monospace;">' + contactNo + '</div>' +
                '</td>' +
              '</tr>' +
            '</table>' +
            '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px;">' +
              '<tr>' +
                '<td valign="bottom">' +
                  '<div class="qr-wrap"><img src="' + qrImgSrc + '" width="155" height="155" style="display: block;" /></div>' +
                  '<div style="font-size: 10px; color: #00f59b; font-family: monospace; font-weight: bold; margin-top: 6px; letter-spacing: 0.8px;">&bull; OFFICIAL ENTRY QR PASS &bull;</div>' +
                '</td>' +
                '<td align="right" valign="bottom">' +
                  '<div class="stamp-box">' +
                    '<div style="font-size: 11px; color: #94a3b8; font-weight: bold; font-family: monospace; letter-spacing: 1.5px;">SEUSL HASHCORE</div>' +
                    '<div style="font-size: 18px; color: #00f59b; font-weight: 900; font-family: monospace; letter-spacing: 2px;">CONFIRMED</div>' +
                  '</div>' +
                '</td>' +
              '</tr>' +
            '</table>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '</body></html>';

    var blob = Utilities.newBlob(pdfHtml, 'text/html', 'ticket.html');
    return blob.getAs('application/pdf').setName('SEUSL_HASHCORE_PASS_' + ticketId + '.pdf');
  } catch (err) {
    Logger.log('PDF generation error: ' + err.toString());
    return null;
  }
}

/**
 * Dispatches the official "Welcome to SEUSL HASHCORE 2026 — Attendance Confirmed" email
 * triggered at the exact moment the organizer scans the QR code.
 */
function sendAttendanceWelcomeEmail(p) {
  var checkInTime = Utilities.formatDate(new Date(), 'Asia/Colombo', "yyyy-MM-dd HH:mm:ss");
  var ticketId = p.ticketId || p.regNo || 'CITADEL-PASS';
  var subject = "🎉 Welcome to SEUSL HASHCORE 2026 — Attendance Confirmed! [" + ticketId + "]";

  var plainText = "==================================================\n" +
    "WELCOME TO SEUSL HASHCORE 2026 — ATTENDANCE CONFIRMED\n" +
    "Faculty of Technology • South Eastern University of Sri Lanka\n" +
    "==================================================\n\n" +
    "Dear " + p.participantName + ",\n\n" +
    "WELCOME TO SEUSL HASHCORE 2026!\n\n" +
    "Your attendance has been officially confirmed and verified at the Citadel check-in gate.\n\n" +
    "--------------------------------------------------\n" +
    "ATTENDEE VERIFICATION DETAILS\n" +
    "--------------------------------------------------\n" +
    "Participant Name:    " + p.participantName + "\n" +
    "University Reg No:   " + p.regNo + "\n" +
    "Workshop Track:      " + (p.competitionTitle || 'SEUSL HASHCORE 2026') + "\n" +
    "Official Pass ID:    " + ticketId + "\n" +
    "Attendance Status:   PRESENT & VERIFIED\n" +
    "Check-In Timestamp:  " + checkInTime + " (Sri Lanka Time)\n" +
    "--------------------------------------------------\n\n" +
    "WORKSHOP DAY INSTRUCTIONS:\n" +
    "1. Keep your laptop ready and connect to the event network.\n" +
    "2. Engage actively in interactive exercises and hands-on sessions.\n" +
    "3. Workshop challenge walkthroughs and guidance will be provided live.\n\n" +
    "We wish you an inspiring learning journey and a fantastic workshop experience!\n\n" +
    "--\n" +
    "HASHCORE 2026 Organizing Committee\n" +
    "Faculty of Technology • South Eastern University of Sri Lanka (SEUSL)\n" +
    "University Park, Oluvil, #32360, Sri Lanka\n" +
    "Direct Inquiries: " + OFFICIAL_SENDER_EMAIL + "\n";

  var htmlBody = '<!DOCTYPE html>' +
    '<html><body style="margin: 0; padding: 24px 10px; background-color: #030805; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #06170e; border: 2px solid #00f59b; border-radius: 16px; padding: 28px;">' +
        '<tr><td align="center" style="padding-bottom: 18px;">' +
          '<div style="display: inline-block; background-color: #062b1b; border: 1px solid #00f59b; color: #00f59b; padding: 6px 16px; border-radius: 14px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px;">SEUSL &bull; Faculty of Technology</div>' +
          '<h1 style="color: #ffffff; font-size: 24px; margin: 16px 0 6px; font-weight: 800; letter-spacing: -0.5px;">🎉 Welcome to HASHCORE \'26!</h1>' +
          '<p style="color: #00f59b; font-size: 14px; margin: 0; font-weight: 700;">Gate Verification Successful &bull; Attendance Confirmed</p>' +
        '</td></tr>' +
        '<tr><td>' +
          '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(0, 245, 155, 0.08); border: 1px solid rgba(0, 245, 155, 0.28); border-radius: 14px; padding: 20px; margin: 16px 0;">' +
            '<tr><td colspan="2" style="padding-bottom: 12px;">' +
              '<div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Participant Name</div>' +
              '<div style="font-size: 20px; font-weight: 900; color: #ffffff; margin-top: 2px;">' + p.participantName + '</div>' +
            '</td></tr>' +
            '<tr>' +
              '<td width="50%" style="border-top: 1px solid rgba(0, 245, 155, 0.2); padding-top: 12px;">' +
                '<div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">University Reg Number</div>' +
                '<div style="font-size: 16px; font-weight: 900; color: #38bdf8; font-family: monospace; margin-top: 2px;">' + p.regNo + '</div>' +
              '</td>' +
              '<td width="50%" style="border-top: 1px solid rgba(0, 245, 155, 0.2); padding-top: 12px;">' +
                '<div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Official Pass ID</div>' +
                '<div style="font-size: 16px; font-weight: 900; color: #00f59b; font-family: monospace; margin-top: 2px;">' + ticketId + '</div>' +
              '</td>' +
            '</tr>' +
            '<tr>' +
              '<td width="50%" style="border-top: 1px solid rgba(0, 245, 155, 0.2); padding-top: 12px;">' +
                '<div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Workshop Track</div>' +
                '<div style="font-size: 14px; font-weight: 800; color: #e2e8f0; margin-top: 2px;">' + (p.competitionTitle || 'Workshop') + '</div>' +
              '</td>' +
              '<td width="50%" style="border-top: 1px solid rgba(0, 245, 155, 0.2); padding-top: 12px;">' +
                '<div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Attendance Status</div>' +
                '<div style="font-size: 14px; font-weight: 900; color: #00f59b; margin-top: 2px;">PRESENT &check;</div>' +
              '</td>' +
            '</tr>' +
            '<tr>' +
              '<td colspan="2" style="border-top: 1px solid rgba(0, 245, 155, 0.2); padding-top: 12px;">' +
                '<div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Check-In Timestamp</div>' +
                '<div style="font-size: 13px; font-weight: 700; color: #cbd5e1; font-family: monospace; margin-top: 2px;">' + checkInTime + ' (SLST)</div>' +
              '</td>' +
            '</tr>' +
          '</table>' +
        '</td></tr>' +
        '<tr><td style="color: #cbd5e1; font-size: 14px; line-height: 1.6; padding: 10px 0;">' +
          'Welcome to the South Eastern University of Sri Lanka! Your entry has been authenticated at the Citadel gate. ' +
          'Please take your seat, connect your setup, and prepare for an incredible day of challenges!' +
        '</td></tr>' +
        '<tr><td style="border-top: 1px solid #143825; padding-top: 18px; margin-top: 20px; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">' +
          'HASHCORE 2026 Organizing Committee &bull; Faculty of Technology<br/>' +
          'South Eastern University of Sri Lanka (SEUSL)<br/>' +
          'Direct Inquiries: <a href="mailto:' + OFFICIAL_SENDER_EMAIL + '" style="color: #00f59b; text-decoration: none;">' + OFFICIAL_SENDER_EMAIL + '</a>' +
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

// Backward-compatibility alias
function sendAttendanceThankYouEmail(p) {
  sendAttendanceWelcomeEmail(p);
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
      var checkTrack = data.track || data.competition || '';
      var checkBatch = (data.batch || '').trim();
      var checkFaculty = (data.faculty || '').trim();

      // Parse embedded query params from URL payload if scanned
      if (checkTicketId.indexOf('?') !== -1 || checkTicketId.indexOf('ticket=') !== -1 || checkTicketId.indexOf('&') !== -1) {
        var mTicket = checkTicketId.match(/[?&](?:ticket|id)=([^&]+)/);
        if (mTicket) checkTicketId = decodeURIComponent(mTicket[1]).trim();

        var mReg = checkTicketId.match(/[?&](?:reg|regNo)=([^&]+)/);
        if (mReg && !checkRegNo) checkRegNo = decodeURIComponent(mReg[1]).trim().toUpperCase();

        var mName = checkTicketId.match(/[?&]name=([^&]+)/);
        if (mName && !checkName) checkName = decodeURIComponent(mName[1]).trim();

        var mEmail = checkTicketId.match(/[?&]email=([^&]+)/);
        if (mEmail && !checkEmail) checkEmail = decodeURIComponent(mEmail[1]).trim().toLowerCase();

        var mTrack = checkTicketId.match(/[?&]track=([^&]+)/);
        if (mTrack && !checkTrack) checkTrack = decodeURIComponent(mTrack[1]).trim();

        var mBatch = checkTicketId.match(/[?&]batch=([^&]+)/);
        if (mBatch && !checkBatch) checkBatch = decodeURIComponent(mBatch[1]).trim();

        var mFaculty = checkTicketId.match(/[?&]faculty=([^&]+)/);
        if (mFaculty && !checkFaculty) checkFaculty = decodeURIComponent(mFaculty[1]).trim();
      }

      // Extract ticket ID pattern if embedded
      var codeMatch = checkTicketId.match(/(CTF|WEB)-2026-\d{5}/i);
      if (codeMatch) {
        checkTicketId = codeMatch[0].toUpperCase();
      }

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
            var rowTicket = String(dataRange[r][1] || '').trim();
            var rowTrack = String(dataRange[r][2] || '').trim();
            var rowName = String(dataRange[r][3] || '').trim();
            var rowBatch = String(dataRange[r][4] || '').trim();
            var rowFaculty = String(dataRange[r][5] || '').trim();
            var rowReg = String(dataRange[r][6] || '').trim().toUpperCase();
            var rowEmail = String(dataRange[r][7] || '').trim().toLowerCase();

            var matched = false;
            if (checkRegNo && rowReg === checkRegNo) matched = true;
            else if (checkTicketId && rowTicket === checkTicketId) matched = true;
            else if (checkEmail && rowEmail === checkEmail) matched = true;
            else if (checkTicketId && rowTicket && rowTicket.indexOf(checkTicketId) !== -1) matched = true;

            if (matched) {
              checkName = rowName || checkName;
              checkRegNo = rowReg || checkRegNo;
              checkEmail = rowEmail || checkEmail;
              checkTrack = rowTrack || checkTrack;
              checkTicketId = rowTicket || checkTicketId;
              checkBatch = rowBatch || checkBatch;
              checkFaculty = rowFaculty || checkFaculty;

              sheet.getRange(r + 1, attColIdx + 1).setValue('Present');
              sheet.getRange(r + 1, timeColIdx + 1).setValue(new Date());
              break;
            }
          }
        } catch (sErr) {
          Logger.log('Attendance sheet update error: ' + sErr.toString());
        }
      }

      // Default fallbacks if sheet row not found
      if (!checkTrack) checkTrack = 'Network & Security / Software Technologies Workshop';
      if (!checkName) checkName = 'Participant';
      if (!checkRegNo) checkRegNo = 'SEU Student';

      // Dispatch Official Welcome & Attendance Confirmation Email
      var emailSent = false;
      if (checkEmail && checkEmail.indexOf('@') !== -1) {
        try {
          sendAttendanceWelcomeEmail({
            participantName: checkName,
            regNo: checkRegNo,
            email: checkEmail,
            ticketId: checkTicketId,
            competitionTitle: checkTrack,
            batch: checkBatch,
            faculty: checkFaculty
          });
          emailSent = true;
        } catch (mailErr) {
          Logger.log('Welcome email dispatch error: ' + mailErr.toString());
        }
      }

      return jsonResponse({
        success: true,
        status: 'checked_in',
        message: 'Attendance confirmed & Welcome email sent to ' + (checkEmail || 'participant'),
        emailSent: emailSent,
        participant: {
          name: checkName,
          universityRegNo: checkRegNo,
          track: checkTrack,
          email: checkEmail,
          ticketId: checkTicketId || 'PASS',
          batch: checkBatch,
          faculty: checkFaculty
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
    var isCTF = competition.toUpperCase().indexOf('CTF') !== -1 || competition.toUpperCase().indexOf('SECURITY') !== -1 || competition.toUpperCase().indexOf('NETWORK') !== -1;
    var compShort = isCTF ? 'CTF' : 'WEB';
    var competitionTitle = isCTF ? 'Network & Security Technologies (CTF: Awareness to Challenge)' : 'Software Technologies (From Idea to Impact)';

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

    // BUILD UNIVERSAL SCAN & VERIFICATION URL FOR QR CODE
    var qrTargetUrl = 'https://hashcoreseu2026.vercel.app/scan?ticket=' + encodeURIComponent(ticketId) +
      '&reg=' + encodeURIComponent(regNo) +
      '&name=' + encodeURIComponent(participantName) +
      '&track=' + encodeURIComponent(compShort) +
      '&email=' + encodeURIComponent(rawEmail) +
      '&batch=' + encodeURIComponent(batch) +
      '&faculty=' + encodeURIComponent(faculty);

    var qrCodeImageUrl = getQrCodeUrl(qrTargetUrl);

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
        qrPayload: qrTargetUrl
      };

      var plainText = buildPlainTextEmail(emailParams);
      var htmlBody = buildConfirmationEmailHtml(emailParams, qrCodeImageUrl);

      // Generate the official PDF Ticket Pass safely
      var attachments = [];
      try {
        var pdfAttachment = generateTicketPdfBlob(emailParams, qrCodeImageUrl);
        if (pdfAttachment) {
          attachments.push(pdfAttachment);
        }
      } catch (pdfErr) {
        Logger.log('PDF generation error, continuing with email: ' + pdfErr.toString());
      }

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
    var isCTF = competition.toUpperCase().indexOf('CTF') !== -1 || competition.toUpperCase().indexOf('SECURITY') !== -1 || competition.toUpperCase().indexOf('NETWORK') !== -1;
    var compShort = isCTF ? 'CTF' : 'WEB';
    var competitionTitle = isCTF ? 'Network & Security Technologies (CTF: Awareness to Challenge)' : 'Software Technologies (From Idea to Impact)';

    var ticketId = compShort + '-2026-' + ('00000' + Math.floor(1000 + Math.random() * 90000)).slice(-5);
    var registrationDate = Utilities.formatDate(new Date(), 'Asia/Colombo', "yyyy-MM-dd HH:mm:ss");

    var qrTargetUrl = 'https://hashcoreseu2026.vercel.app/scan?ticket=' + encodeURIComponent(ticketId) +
      '&reg=' + encodeURIComponent(regNo) +
      '&name=' + encodeURIComponent(participantName) +
      '&track=' + encodeURIComponent(compShort) +
      '&email=' + encodeURIComponent(rawEmail) +
      '&batch=' + encodeURIComponent(batch) +
      '&faculty=' + encodeURIComponent(faculty);

    var qrCodeImageUrl = getQrCodeUrl(qrTargetUrl);

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
      qrPayload: qrTargetUrl
    };

    var plainText = buildPlainTextEmail(emailParams);
    var htmlBody = buildConfirmationEmailHtml(emailParams, qrCodeImageUrl);

    var attachments = [];
    try {
      var pdfAttachment = generateTicketPdfBlob(emailParams, qrCodeImageUrl);
      if (pdfAttachment) {
        attachments.push(pdfAttachment);
      }
    } catch (pdfErr) {
      Logger.log('PDF generation skipped in onFormSubmit: ' + pdfErr.toString());
    }

    sendEmailNotification({
      to: rawEmail,
      subject: "SEUSL HASHCORE 2026 Registration Confirmed: " + competitionTitle + " [" + ticketId + "]",
      plainText: plainText,
      htmlBody: htmlBody,
      attachments: attachments
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
      'Workshop Track',
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
    "Workshop Track:      " + p.competitionTitle + "\n" +
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

        '<!-- Official Pass Card (Full Citadel 00001 Background with Semi-Transparent Black Layer for 100% Text Legibility) -->' +
        '<tr>' +
          '<td style="padding: 0;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" background="' + CITADEL_BG_IMAGE_URL + '" style="border-radius: 16px; border: 2.5px solid #00f59b; background-image: url(\'' + CITADEL_BG_IMAGE_URL + '\'); background-size: cover; background-position: center; background-repeat: no-repeat; border-collapse: separate; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.85);">' +
              '<tr>' +
                '<!-- Semi-Transparent Black Layer on top of image layer for high contrast and legible text -->' +
                '<td style="background-color: rgba(2, 10, 5, 0.82); padding: 28px 22px;">' +
                  
                  '<!-- Pass Header -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
                    '<tr>' +
                      '<td valign="top">' +
                        '<div style="display: inline-block; background-color: rgba(6, 43, 27, 0.9); border: 1.5px solid #00f59b; border-radius: 8px; padding: 4px 12px; font-size: 10px; font-weight: 700; color: #00f59b; letter-spacing: 1.5px; text-transform: uppercase;">' +
                          'SEUSL &bull; FACULTY OF TECHNOLOGY' +
                        '</div>' +
                        '<div style="font-size: 20px; font-weight: 900; color: #ffffff; margin-top: 6px; letter-spacing: -0.3px;">' +
                          'HASHCORE \'26 CITADEL PASS' +
                        '</div>' +
                        '<div style="font-size: 12px; font-weight: 700; color: #00f59b; font-family: monospace; margin-top: 3px; letter-spacing: 1px;">' +
                          (p.competitionTitle || 'Network & Security Workshop').toUpperCase() +
                        '</div>' +
                      '</td>' +
                      '<td align="right" valign="top">' +
                        '<div style="font-size: 10px; font-weight: 700; color: #cbd5e1; letter-spacing: 1px; text-transform: uppercase;">' +
                          'OFFICIAL PASS ID' +
                        '</div>' +
                        '<div style="font-size: 18px; font-weight: 900; color: #00f59b; font-family: Consolas, monospace; margin-top: 2px;">' +
                          p.ticketId +
                        '</div>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +

                  '<!-- Embedded QR Code (Enlarged) -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 22px 0 18px;">' +
                    '<tr>' +
                      '<td align="center">' +
                        '<div style="display: inline-block; background-color: #ffffff; padding: 12px; border-radius: 14px; border: 2.5px solid #00f59b; box-shadow: 0 8px 28px rgba(0,0,0,0.85);">' +
                          '<img src="' + qrUrl + '" width="170" height="170" alt="Official Ticket QR Code" style="display: block; margin: 0 auto;" />' +
                        '</div>' +
                        '<div style="font-size: 11px; color: #00f59b; font-family: monospace; font-weight: bold; margin-top: 8px; letter-spacing: 1.5px;">' +
                          '&bull; OFFICIAL ENTRY QR PASS &bull;' +
                        '</div>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +

                  '<!-- Participant Data Grid -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 14px;">' +
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 10px 8px 8px 0; border-top: 1px solid rgba(0, 245, 155, 0.35);">' +
                        '<div style="font-size: 10px; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Participant Name</div>' +
                        '<div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-top: 2px;">' + p.participantName + '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 10px 0 8px 8px; border-top: 1px solid rgba(0, 245, 155, 0.35);">' +
                        '<div style="font-size: 10px; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">University Reg No</div>' +
                        '<div style="font-size: 15px; font-weight: 900; color: #38bdf8; font-family: Consolas, monospace; margin-top: 2px;">' + p.regNo + '</div>' +
                      '</td>' +
                    '</tr>' +
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 10px 8px 8px 0; border-top: 1px solid rgba(0, 245, 155, 0.35);">' +
                        '<div style="font-size: 10px; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Academic Batch</div>' +
                        '<div style="font-size: 13px; font-weight: 700; color: #ffffff; font-family: Consolas, monospace; margin-top: 2px;">' + (p.batch || '2022/2023') + '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 10px 0 8px 8px; border-top: 1px solid rgba(0, 245, 155, 0.35);">' +
                        '<div style="font-size: 10px; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Faculty</div>' +
                        '<div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-top: 2px;">' + (p.faculty || 'Technology') + '</div>' +
                      '</td>' +
                    '</tr>' +
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 10px 8px 8px 0; border-top: 1px solid rgba(0, 245, 155, 0.35);">' +
                        '<div style="font-size: 10px; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Registered Email</div>' +
                        '<div style="font-size: 13px; font-weight: 700; color: #ffffff; font-family: Consolas, monospace; margin-top: 2px;">' +
                          p.email + ' <span style="display: inline-block; background-color: rgba(6, 43, 27, 0.9); border: 1px solid #00f59b; color: #00f59b; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; vertical-align: middle;">&#10003; SENT</span>' +
                        '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 10px 0 8px 8px; border-top: 1px solid rgba(0, 245, 155, 0.35);">' +
                        '<div style="font-size: 10px; color: #cbd5e1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">Contact Number</div>' +
                        '<div style="font-size: 13px; font-weight: 700; color: #ffffff; font-family: Consolas, monospace; margin-top: 2px;">' + p.contactNo + '</div>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +

                  '<!-- Pass Status Bottom -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid rgba(0, 245, 155, 0.35); padding-top: 16px; margin-top: 18px;">' +
                    '<tr>' +
                      '<td valign="middle">' +
                        '<div style="font-size: 12px; color: #00f59b; font-weight: 700;">' +
                          '&#10003; PASS STATUS: VERIFIED & CONFIRMED' +
                        '</div>' +
                        '<div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">' +
                          'Faculty of Technology, SEUSL' +
                        '</div>' +
                      '</td>' +
                      '<td align="right" valign="middle">' +
                        '<div style="display: inline-block; border: 2px solid #00f59b; background-color: rgba(6, 43, 27, 0.9); border-radius: 8px; padding: 8px 16px; text-align: center;">' +
                          '<div style="font-size: 9px; color: #94a3b8; font-weight: bold; font-family: Consolas, monospace; letter-spacing: 1px;">SEUSL HASHCORE</div>' +
                          '<div style="font-size: 14px; color: #00f59b; font-weight: 900; font-family: Consolas, monospace; letter-spacing: 1.5px;">CONFIRMED</div>' +
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
                  '<strong>Attachment:</strong> Your official <strong>PDF Ticket Pass</strong> is attached to this email. Please save it on your phone or print it for check-in on workshop day.' +
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
    competitionTitle: "Software Technologies Workshop (From Idea to Impact)",
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
    subject: "SEUSL HASHCORE 2026 Registration Confirmed: Software Technologies Workshop [" + testTicketId + "]",
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
    var checkRegNo = (params.regNo || params.universityRegNo || params.reg || '').trim().toUpperCase();
    var checkTicketId = (params.ticketId || params.ticket || params.id || '').trim();
    var checkName = (params.name || params.participantName || '').trim();
    var checkEmail = (params.email || '').trim().toLowerCase();
    var checkTrack = params.track || params.competition || 'Workshop';
    var checkBatch = (params.batch || '').trim();
    var checkFaculty = (params.faculty || '').trim();
    var scanTime = Utilities.formatDate(new Date(), 'Asia/Colombo', "yyyy-MM-dd HH:mm:ss");

    // Update active sheet Attendance Status (Col 13) and Check-In Time (Col 14)
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss ? (ss.getSheetByName('Registrations') || ss.getActiveSheet()) : null;
      if (sheet && sheet.getLastRow() > 1) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          var rowTicket = String(data[i][1] || '').trim();
          var rowReg = String(data[i][6] || '').trim().toUpperCase();
          var rowMail = String(data[i][7] || '').trim().toLowerCase();
          if ((checkTicketId && rowTicket === checkTicketId) ||
              (checkRegNo && rowReg === checkRegNo) ||
              (checkEmail && rowMail === checkEmail)) {
            sheet.getRange(i + 1, 13).setValue('Checked In');
            sheet.getRange(i + 1, 14).setValue(scanTime);
            break;
          }
        }
      }
    } catch (sheetLogErr) {
      Logger.log('Sheet attendance update notice: ' + sheetLogErr.toString());
    }

    var emailSent = false;
    if (checkEmail && checkEmail.indexOf('@') !== -1) {
      try {
        sendAttendanceWelcomeEmail({
          participantName: checkName || 'Participant',
          regNo: checkRegNo,
          email: checkEmail,
          ticketId: checkTicketId,
          competitionTitle: checkTrack,
          batch: checkBatch,
          faculty: checkFaculty
        });
        emailSent = true;
      } catch (err) {
        Logger.log('doGet welcome email notice: ' + err.toString());
      }
    }

    return jsonResponse({
      success: true,
      status: 'checked_in',
      message: 'Attendance confirmed & Welcome email sent to ' + (checkEmail || 'participant'),
      emailSent: emailSent,
      scanTime: scanTime,
      participant: {
        name: checkName || 'Participant',
        universityRegNo: checkRegNo || 'SEU Student',
        track: checkTrack,
        email: checkEmail,
        ticketId: checkTicketId || 'PASS',
        batch: checkBatch,
        faculty: checkFaculty,
        scanTime: scanTime
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
