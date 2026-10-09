/**
 * ============================================================================
 * SEUSL HASHCORE 2026 — GOOGLE APPS SCRIPT WEB APP
 * High-Deliverability Registration & Participant Email Ticket Dispatcher
 * ============================================================================
 * 
 * 📧 OFFICIAL SENDER EMAIL CONFIGURATION:
 * Sender Email: hashcore@seu.ac.lk
 * Display Name: SEUSL HASHCORE 2026
 * 
 * 🛡️ INBOX DELIVERABILITY ENHANCEMENTS:
 * 1. Dual-MIME Support: Generates both rich HTML and standard Plain-Text
 *    (prevents modern SpamAssassin / Gmail "HTML-only" spam penalty).
 * 2. Clean Inline CSS: No untrusted remote images / webp tracker files.
 * 3. Native GmailApp Dispatch: Ensures full SPF & DKIM signatures from
 *    the Google Workspace domain (seu.ac.lk).
 * 4. CAN-SPAM Compliant: Includes physical university address & contact.
 * ============================================================================
 */

var OFFICIAL_SENDER_EMAIL = 'hashcore@seu.ac.lk';
var OFFICIAL_SENDER_NAME = 'SEUSL HASHCORE 2026';

/**
 * Dispatches a dual-MIME (HTML + Plain-Text) confirmation email.
 * Prioritizes GmailApp for genuine Google Workspace DKIM/SPF headers.
 */
function sendEmailNotification(options) {
  var to = options.to;
  var subject = options.subject;
  var plainText = options.plainText || '';
  var htmlBody = options.htmlBody || '';

  var mailOptions = {
    name: OFFICIAL_SENDER_NAME,
    replyTo: OFFICIAL_SENDER_EMAIL,
    htmlBody: htmlBody
  };

  // If running from an account with hashcore@seu.ac.lk configured as send-as alias
  try {
    var aliases = GmailApp.getAliases();
    if (aliases && aliases.indexOf(OFFICIAL_SENDER_EMAIL) !== -1) {
      mailOptions.from = OFFICIAL_SENDER_EMAIL;
    }
  } catch (aliasErr) {
    Logger.log('Alias check note: ' + aliasErr.toString());
  }

  // 1. Primary: Send via GmailApp (Produces clean multipart/alternative email with DKIM)
  try {
    if (mailOptions.from) {
      GmailApp.sendEmail(to, subject, plainText, {
        htmlBody: htmlBody,
        name: mailOptions.name,
        replyTo: mailOptions.replyTo,
        from: mailOptions.from
      });
      return;
    }

    GmailApp.sendEmail(to, subject, plainText, mailOptions);
    return;
  } catch (gmailErr) {
    Logger.log('GmailApp send notice: ' + gmailErr.toString());
  }

  // 2. Fallback: MailApp with plain-text body
  MailApp.sendEmail({
    to: to,
    subject: subject,
    body: plainText,
    htmlBody: htmlBody,
    name: mailOptions.name,
    replyTo: mailOptions.replyTo
  });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 30 seconds for concurrent requests to avoid race conditions
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

    // Direct test trigger via POST: { action: "test", email: "verifyxcode@gmail.com" }
    if (data.action === 'test' || data.action === 'verify') {
      var targetEmail = data.email || 'verifyxcode@gmail.com';
      var testResult = testSendEmailToVerifyXcode(targetEmail);
      return jsonResponse({
        success: true,
        message: 'Verification test email sent to ' + targetEmail,
        details: testResult
      });
    }

    // 1. Validate & Normalize fields
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

    // Validate email format
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      return jsonResponse({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!regNo) {
      return jsonResponse({ success: false, error: 'University Registration Number is required.' });
    }

    // 2. Access Google Sheet (if bound or SPREADSHEET_ID provided)
    var ss = null;
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch (ssErr) {}

    var SPREADSHEET_ID = ''; // Optional: paste sheet ID if script is standalone
    if (!ss && SPREADSHEET_ID) {
      try {
        ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      } catch (openErr) {}
    }

    var sheet = null;
    if (ss) {
      sheet = ss.getActiveSheet() || ss.getSheets()[0];
    }

    var ticketId = '';
    var registrationDate = Utilities.formatDate(new Date(), 'Asia/Colombo', "yyyy-MM-dd HH:mm:ss");

    // 3. Handle Sheet storage & Duplicate Protection if sheet is connected
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
          'Pending'
        ];

        sheet.appendRow(rowData);
        newRowIndex = sheet.getLastRow();
      } catch (sheetErr) {
        Logger.log('Sheet logging warning: ' + sheetErr.toString());
      }
    }

    // Fallback Ticket ID if sheet was not connected
    if (!ticketId) {
      var randNum = ('00000' + Math.floor(1000 + Math.random() * 90000)).slice(-5);
      ticketId = compShort + '-2026-' + randNum;
    }

    // 4. SEND CONFIRMATION EMAIL TO PARTICIPANT FROM hashcore@seu.ac.lk
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
        registrationDate: registrationDate
      };

      var plainText = buildPlainTextEmail(emailParams);
      var htmlBody = buildConfirmationEmailHtml(emailParams);

      sendEmailNotification({
        to: rawEmail,
        subject: subject,
        plainText: plainText,
        htmlBody: htmlBody
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
      registrationDate: registrationDate
    };

    var plainText = buildPlainTextEmail(emailParams);
    var htmlBody = buildConfirmationEmailHtml(emailParams);

    sendEmailNotification({
      to: rawEmail,
      subject: subject,
      plainText: plainText,
      htmlBody: htmlBody
    });

  } catch (err) {
    Logger.log('onFormSubmit trigger error: ' + err.toString());
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
      'University Reg No',
      'Email',
      'Contact Number',
      'WhatsApp Number',
      'Registration Status',
      'Email Status'
    ]);
    sheet.getRange('1:1').setFontWeight('bold').setBackground('#00f59b').setFontColor('#040806');
  }
}

/**
 * Plain-Text email generator
 * Crucial for spam filters: provides compliant text/plain alternative.
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
    "IMPORTANT NOTICE:\n" +
    "Please save this email or keep your Ticket ID (" + p.ticketId + ") readily available during competition check-in on event day.\n\n" +
    "--\n" +
    "HASHCORE 2026 Organizing Committee\n" +
    "Faculty of Technology • South Eastern University of Sri Lanka (SEUSL)\n" +
    "University Park, Oluvil, #32360, Sri Lanka\n" +
    "Inquiries: " + OFFICIAL_SENDER_EMAIL + "\n";
}

/**
 * Clean, Spam-Safe HTML Email Template
 * Uses email-client-safe CSS, table layout, high contrast, and no remote tracker assets.
 */
function buildConfirmationEmailHtml(p) {
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
                '<td style="padding: 28px 24px;">' +

                  '<!-- Pass Top -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1px solid #143825; padding-bottom: 16px; margin-bottom: 20px;">' +
                    '<tr>' +
                      '<td valign="top">' +
                        '<div style="font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase;">' +
                          'SEUSL HASHCORE 2026' +
                        '</div>' +
                        '<div style="font-size: 18px; font-weight: 800; color: #00f59b; margin-top: 3px;">' +
                          p.competitionTitle +
                        '</div>' +
                      '</td>' +
                      '<td align="right" valign="top">' +
                        '<div style="font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase;">' +
                          'Official Ticket ID' +
                        '</div>' +
                        '<div style="font-size: 18px; font-weight: 800; color: #ffffff; font-family: Consolas, monospace; margin-top: 3px; letter-spacing: 0.5px;">' +
                          p.ticketId +
                        '</div>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +

                  '<!-- Details Grid -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' +
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 8px 8px 8px 0;">' +
                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Participant Name</div>' +
                        '<div style="font-size: 15px; font-weight: 700; color: #ffffff; margin-top: 2px;">' + p.participantName + '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 8px 0 8px 8px;">' +
                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">University Reg No</div>' +
                        '<div style="font-size: 14px; font-weight: 700; color: #38bdf8; font-family: Consolas, monospace; margin-top: 2px;">' + p.regNo + '</div>' +
                      '</td>' +
                    '</tr>' +
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 10px 8px 8px 0; border-top: 1px solid #0d2618;">' +
                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Academic Batch</div>' +
                        '<div style="font-size: 14px; font-weight: 600; color: #e2e8f0; margin-top: 2px;">' + p.batch + '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 10px 0 8px 8px; border-top: 1px solid #0d2618;">' +
                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Faculty</div>' +
                        '<div style="font-size: 14px; font-weight: 600; color: #e2e8f0; margin-top: 2px;">' + p.faculty + '</div>' +
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
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 10px 8px 8px 0; border-top: 1px solid #0d2618;">' +
                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">WhatsApp Number</div>' +
                        '<div style="font-size: 13px; font-weight: 600; color: #e2e8f0; font-family: Consolas, monospace; margin-top: 2px;">' + (p.whatsappNo || p.contactNo) + '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 10px 0 8px 8px; border-top: 1px solid #0d2618;">' +
                        '<div style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Registration Date</div>' +
                        '<div style="font-size: 13px; font-weight: 600; color: #e2e8f0; font-family: Consolas, monospace; margin-top: 2px;">' + p.registrationDate + '</div>' +
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

        '<!-- Notice Banner -->' +
        '<tr>' +
          '<td style="padding: 18px 4px 10px;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1a1608; border-left: 3px solid #f59e0b; border-radius: 6px;">' +
              '<tr>' +
                '<td style="padding: 12px 16px; font-size: 13px; color: #fde68a; line-height: 1.5;">' +
                  '<strong>Notice:</strong> Please save this email and present your <strong>Ticket ID (' + p.ticketId + ')</strong> during registration on the competition day.' +
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
 * ============================================================================
 * TEST & VERIFICATION FUNCTION
 * ============================================================================
 */
function testSendEmailToVerifyXcode(recipient) {
  var testEmail = recipient || 'verifyxcode@gmail.com';
  var testTicketId = 'WEB-2026-TEST01';
  var testDate = Utilities.formatDate(new Date(), 'Asia/Colombo', "yyyy-MM-dd HH:mm:ss");

  var subject = "SEUSL HASHCORE 2026 Registration Confirmed: Web Development Competition [" + testTicketId + "]";
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
    registrationDate: testDate
  };

  var plainText = buildPlainTextEmail(emailParams);
  var htmlBody = buildConfirmationEmailHtml(emailParams);

  sendEmailNotification({
    to: testEmail,
    subject: subject,
    plainText: plainText,
    htmlBody: htmlBody
  });

  var sender = 'Unknown';
  try {
    sender = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  } catch (e) {}

  Logger.log("✅ Verification email dispatched to: " + testEmail + " (Executed as: " + sender + ")");
  return {
    success: true,
    sender: sender,
    recipient: testEmail,
    ticketId: testTicketId,
    timestamp: testDate
  };
}

function doGet(e) {
  var params = (e && e.parameter) || {};

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

  var activeUser = 'N/A';
  var effectiveUser = 'N/A';
  try {
    activeUser = Session.getActiveUser().getEmail();
    effectiveUser = Session.getEffectiveUser().getEmail();
  } catch (uErr) {}

  return jsonResponse({
    status: 'active',
    service: 'SEUSL HASHCORE 2026 Registration & Email API',
    officialEmail: OFFICIAL_SENDER_EMAIL,
    activeUser: activeUser,
    effectiveUser: effectiveUser,
    timestamp: new Date()
  });
}
