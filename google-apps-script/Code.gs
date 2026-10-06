/**
 * ============================================================================
 * SEUSL HASHCORE '26 — GOOGLE APPS SCRIPT WEB APP
 * Automated Competition Registration, Duplicate Prevention & Participant Email Dispatcher
 * ============================================================================
 * 
 * INSTRUCTIONS TO DEPLOY:
 * 1. Open your Google Sheet (e.g. the one linked to your Google Form or create a new sheet).
 * 2. In Google Sheets, click "Extensions" -> "Apps Script".
 * 3. Delete any existing code, and paste this entire Code.gs file.
 * 4. Click "Deploy" -> "New deployment".
 * 5. Select type "Web app".
 * 6. Set Description: "HASHCORE 2026 Registration & Email Service".
 * 7. Set "Execute as": "Me".
 * 8. Set "Who has access": "Anyone" (crucial so your website can submit without login).
 * 9. Click "Deploy", authorize Google permissions when prompted, and copy the Web App URL:
 *    (e.g., https://script.google.com/macros/s/AKfycb.../exec)
 * 10. In your project root, add it to `.env`:
 *     VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
 * 
 * ============================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 30 seconds for concurrent requests to avoid race condition duplicates
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

    var ss = null;
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (ssErr) {}

    if (!ss) {
      // Official Google Sheet ID linked to Google Form
      var SPREADSHEET_ID = '1KBL8I-24O27PKY6I6-IrkkbTfLx8bKQ4hT_9GyJY';
      try {
        ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      } catch (openErr) {
        return jsonResponse({ success: false, error: 'Could not access Google Sheet: ' + openErr.message });
      }
    }

    var sheet = (ss && ss.getActiveSheet()) || (ss && ss.getSheets()[0]);
    if (!sheet) {
      return jsonResponse({ success: false, error: 'Could not find active worksheet' });
    }

    // 1. Validate & Normalize fields
    var participantName = (data.initialsWithName || '').trim();
    var batch = (data.batch || '').trim();
    var faculty = (data.faculty || 'Technology').trim();
    var regNo = (data.universityRegNo || '').trim().toUpperCase();
    var rawEmail = (data.email || '').trim().toLowerCase();
    var contactNo = (data.contactNo || '').trim();
    var whatsappNo = (data.whatsappNo || '').trim();
    var competition = (data.competition || 'CTF Competition').trim();
    var isCTF = competition.indexOf('CTF') !== -1 || (data.track === 'CTF');
    var compShort = isCTF ? 'CTF' : 'WEB';
    var competitionTitle = isCTF ? 'CTF Competition' : 'Web Development Competition';

    if (!participantName) {
      return jsonResponse({ success: false, error: 'Initial with Name is required.' });
    }

    // Validate email format
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      return jsonResponse({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!regNo) {
      return jsonResponse({ success: false, error: 'University Registration Number is required.' });
    }

    // Ensure Headers Exist
    ensureSheetHeaders(sheet);

    // 2. DUPLICATE REGISTRATION PROTECTION
    // Primary duplicate-check field: University Registering Number
    var dataRange = sheet.getDataRange().getValues();
    // Headers are in row 1 (index 0)
    for (var r = 1; r < dataRange.length; r++) {
      var existingRegNo = String(dataRange[r][6] || '').trim().toUpperCase(); // Column 7: Reg No
      var existingTicket = String(dataRange[r][1] || '').trim(); // Column 2: Ticket ID

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

    // 3. GENERATE UNIQUE TICKET ID
    // Format: CTF-2026-00001 or WEB-2026-00001
    // Sequential counter based on total existing registrations for this track
    var countForTrack = 0;
    for (var i = 1; i < dataRange.length; i++) {
      var rowComp = String(dataRange[i][2] || '');
      if (rowComp.indexOf(compShort) !== -1 || (isCTF && rowComp.indexOf('CTF') !== -1) || (!isCTF && rowComp.indexOf('Web') !== -1)) {
        countForTrack++;
      }
    }
    var nextNum = countForTrack + 1;
    var paddedNum = ('00000' + nextNum).slice(-5);
    var ticketId = compShort + '-2026-' + paddedNum;
    var registrationDate = Utilities.formatDate(new Date(), 'Asia/Colombo', "yyyy-MM-dd HH:mm:ss");

    // 4. PREPARE SHEET ROW
    // Columns:
    // 1. Timestamp | 2. Ticket ID | 3. Competition | 4. Name | 5. Batch | 6. Faculty |
    // 7. University Registering Number | 8. Email | 9. Contact Number | 10. WhatsApp Number |
    // 11. Registration Status | 12. Email Status
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
      'Pending' // Updated to 'Sent' or 'Failed' below
    ];

    sheet.appendRow(rowData);
    var newRowIndex = sheet.getLastRow();

    // 5. SEND CONFIRMATION EMAIL TO SUBMITTED EMAIL ADDRESS
    var emailSent = false;
    var emailErrorMessage = '';

    try {
      var subject = 'Registration Confirmed – ' + competitionTitle;
      var htmlBody = buildConfirmationEmailHtml({
        participantName: participantName,
        competitionTitle: competitionTitle,
        batch: batch,
        faculty: faculty,
        regNo: regNo,
        email: rawEmail,
        contactNo: contactNo,
        whatsappNo: whatsappNo,
        ticketId: ticketId,
        registrationDate: registrationDate
      });

      // MailApp.sendEmail using submitted recipient email dynamically
      MailApp.sendEmail({
        to: rawEmail,
        subject: subject,
        htmlBody: htmlBody,
        name: "SEUSL HASHCORE '26"
      });

      emailSent = true;
      sheet.getRange(newRowIndex, 12).setValue('Sent');
    } catch (mailErr) {
      Logger.log('Mail send error: ' + mailErr.toString());
      emailErrorMessage = mailErr.toString();
      sheet.getRange(newRowIndex, 12).setValue('Failed');
    }

    // 6. RETURN SUCCESS RESPONSE TO FRONTEND
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

function ensureSheetHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Ticket ID',
      'Competition',
      'Name',
      'Batch',
      'Faculty',
      'University Registering Number',
      'Email',
      'Contact Number',
      'WhatsApp Number',
      'Registration Status',
      'Email Status'
    ]);
    sheet.getRange('1:1').setFontWeight('bold').setBackground('#00f59b').setFontColor('#040806');
  }
}

function buildConfirmationEmailHtml(p) {
  var qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(p.ticketId);

  return '<!DOCTYPE html>' +
    '<html>' +
    '<head><meta charset="utf-8"><style>' +
    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #040806; color: #f1f5f9; margin: 0; padding: 20px; }' +
    '.card { max-width: 600px; margin: 0 auto; background: #08160f; border: 1px solid #00f59b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 40px rgba(0,245,155,0.15); }' +
    '.header { border-bottom: 1px solid rgba(0,245,155,0.25); padding-bottom: 20px; margin-bottom: 24px; text-align: center; }' +
    '.badge { display: inline-block; padding: 6px 14px; background: rgba(0,245,155,0.12); color: #00f59b; border: 1px solid #00f59b; border-radius: 999px; font-size: 12px; font-weight: bold; letter-spacing: 1px; }' +
    '.title { color: #ffffff; font-size: 24px; margin: 16px 0 6px; font-weight: 800; }' +
    '.sub { color: #94a3b8; font-size: 14px; margin: 0; }' +
    '.ticket-box { background: #030c08; border: 2px dashed #00f59b; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }' +
    '.ticket-lbl { font-size: 12px; color: #94a3b8; letter-spacing: 2px; }' +
    '.ticket-id { font-size: 26px; font-weight: 900; color: #00f59b; margin: 6px 0 16px; font-family: monospace; }' +
    '.table-wrap { margin: 20px 0; }' +
    '.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }' +
    '.data-table td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); }' +
    '.data-table .lbl { color: #94a3b8; width: 42%; font-weight: 500; }' +
    '.data-table .val { color: #ffffff; font-weight: 700; }' +
    '.notice { background: rgba(245,158,11,0.1); border-left: 3px solid #f59e0b; padding: 12px 16px; font-size: 13px; color: #fde68a; margin: 24px 0; border-radius: 4px; }' +
    '.footer { text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 24px; font-size: 13px; color: #64748b; line-height: 1.6; }' +
    '</style></head>' +
    '<body>' +
    '<div class="card">' +
      '<div class="header">' +
        '<span class="badge">SEUSL • FACULTY OF TECHNOLOGY</span>' +
        '<h1 class="title">Registration Confirmed</h1>' +
        '<p class="sub">Thank you for registering for ' + p.competitionTitle + '.</p>' +
      '</div>' +
      '<p>Dear <strong>' + p.participantName + '</strong>,</p>' +
      '<p>Thank you for registering for the <strong>' + p.competitionTitle + '</strong>. Your registration has been successfully received.</p>' +
      '<div class="ticket-box">' +
        '<div class="ticket-lbl">OFFICIAL TICKET ID</div>' +
        '<div class="ticket-id">' + p.ticketId + '</div>' +
        '<img src="' + qrCodeUrl + '" alt="QR Verification" width="130" height="130" style="border-radius: 8px; border: 2px solid #00f59b; background: #fff; padding: 4px;" />' +
      '</div>' +
      '<div class="table-wrap">' +
        '<table class="data-table">' +
          '<tr><td class="lbl">Participant Name</td><td class="val">' + p.participantName + '</td></tr>' +
          '<tr><td class="lbl">Competition</td><td class="val">' + p.competitionTitle + '</td></tr>' +
          '<tr><td class="lbl">Academic Batch</td><td class="val">' + p.batch + '</td></tr>' +
          '<tr><td class="lbl">Faculty</td><td class="val">' + p.faculty + '</td></tr>' +
          '<tr><td class="lbl">University Reg No</td><td class="val">' + p.regNo + '</td></tr>' +
          '<tr><td class="lbl">Email Address</td><td class="val">' + p.email + '</td></tr>' +
          '<tr><td class="lbl">Contact Number</td><td class="val">' + p.contactNo + '</td></tr>' +
          '<tr><td class="lbl">WhatsApp Number</td><td class="val">' + p.whatsappNo + '</td></tr>' +
          '<tr><td class="lbl">Registration Date</td><td class="val">' + p.registrationDate + '</td></tr>' +
        '</table>' +
      '</div>' +
      '<div class="notice">' +
        '<strong>Important:</strong> Your Ticket ID is your unique registration reference. Please keep this email for future reference. Only one submission is allowed per participant.' +
      '</div>' +
      '<p>We look forward to seeing you at the event.</p>' +
      '<div class="footer">' +
        '<strong>HASHCORE \'26 Organizing Committee</strong><br/>' +
        'Faculty of Technology • South Eastern University of Sri Lanka (SEUSL)<br/>' +
        '<span style="font-size: 11px; color: #475569;">Citadel Mainframe Verified Automated Transmission</span>' +
      '</div>' +
    '</div>' +
    '</body></html>';
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return jsonResponse({
    status: 'active',
    service: 'SEUSL HASHCORE 2026 Registration & Email API',
    timestamp: new Date()
  });
}
