/**
 * ============================================================================
 * SEUSL HASHCORE '26 — GOOGLE APPS SCRIPT WEB APP
 * Automated Competition Registration, Duplicate Prevention & Participant Email Dispatcher
 * ============================================================================
 * 
 * 📧 OFFICIAL SENDER EMAIL CONFIGURATION:
 * Target Official Sender: hashcore@seu.ac.lk
 * Display Name: "SEUSL HASHCORE '26"
 * 
 * TO SWITCH SENDER FROM PERSONAL EMAIL TO "hashcore@seu.ac.lk":
 * 1. Log into Google with your official account: hashcore@seu.ac.lk
 * 2. Open the Google Sheet (or go to https://script.google.com while signed in as hashcore@seu.ac.lk)
 *    (Make sure hashcore@seu.ac.lk has Editor access to the linked Google Sheet)
 * 3. Paste this updated Code.gs into the editor and click Save (💾).
 * 4. Click "Deploy" -> "New deployment" -> Select type: "Web app"
 *    - Description: "HASHCORE 2026 Production API (hashcore@seu.ac.lk)"
 *    - Execute as: "Me (hashcore@seu.ac.lk)"  <-- MUST BE hashcore@seu.ac.lk
 *    - Who has access: "Anyone"
 * 5. Click "Deploy", Authorize permissions for hashcore@seu.ac.lk.
 * 6. Copy the new Web App URL (starts with https://script.google.com/macros/s/...)
 *    and update VITE_GOOGLE_APPS_SCRIPT_URL in your project .env file.
 * ============================================================================
 */

var OFFICIAL_SENDER_EMAIL = 'hashcore@seu.ac.lk';
var OFFICIAL_SENDER_NAME = "SEUSL HASHCORE '26";

/**
 * Dispatches an HTML email ensuring:
 * - Sender display name is "SEUSL HASHCORE '26"
 * - Reply-To is "hashcore@seu.ac.lk"
 * - BCC is sent to "hashcore@seu.ac.lk" for registration records
 * - Supports Gmail alias if configured
 */
function sendEmailNotification(options) {
  var to = options.to;
  var subject = options.subject;
  var htmlBody = options.htmlBody;

  var mailOptions = {
    to: to,
    bcc: OFFICIAL_SENDER_EMAIL,
    subject: subject,
    htmlBody: htmlBody,
    name: OFFICIAL_SENDER_NAME,
    replyTo: OFFICIAL_SENDER_EMAIL
  };

  // If executing under a Google account that has hashcore@seu.ac.lk configured as send-as alias
  try {
    var aliases = GmailApp.getAliases();
    if (aliases && aliases.indexOf(OFFICIAL_SENDER_EMAIL) !== -1) {
      mailOptions.from = OFFICIAL_SENDER_EMAIL;
    }
  } catch (aliasErr) {
    Logger.log('Alias check skipped/unsupported: ' + aliasErr.toString());
  }

  // Attempt sending via GmailApp (which respects 'from' alias)
  try {
    if (mailOptions.from) {
      GmailApp.sendEmail(mailOptions.to, mailOptions.subject, "", {
        htmlBody: mailOptions.htmlBody,
        name: mailOptions.name,
        replyTo: mailOptions.replyTo,
        bcc: mailOptions.bcc,
        from: mailOptions.from
      });
      return;
    }
  } catch (gmailErr) {
    Logger.log('GmailApp send warning: ' + gmailErr.toString());
  }

  // Standard MailApp send (sends from the account executing the script)
  MailApp.sendEmail({
    to: mailOptions.to,
    bcc: mailOptions.bcc,
    subject: mailOptions.subject,
    htmlBody: mailOptions.htmlBody,
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
      var subject = 'Registration Confirmed – ' + competitionTitle + " [Pass: " + ticketId + "]";
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

      sendEmailNotification({
        to: rawEmail,
        subject: subject,
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
 * If you link this script to the Google Sheet connected to your Google Form,
 * this function automatically fires when anyone submits the Google Form!
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

    var subject = 'Registration Confirmed – ' + competitionTitle + " [Pass: " + ticketId + "]";
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

    sendEmailNotification({
      to: rawEmail,
      subject: subject,
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

function buildConfirmationEmailHtml(p) {
  var frame37Url = 'https://raw.githubusercontent.com/mohommadhuafnan/HASHCORE-2026/main/src/frame/00037.webp';

  return '<!DOCTYPE html>' +
    '<html>' +
    '<head>' +
    '<meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>SEUSL HASHCORE \'26 Official Ticket Pass</title>' +
    '</head>' +
    '<body style="margin: 0; padding: 24px 12px; background-color: #040906; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">' +
      '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 660px; margin: 0 auto;">' +
        '<!-- Top Greeting -->' +
        '<tr>' +
          '<td align="center" style="padding-bottom: 20px;">' +
            '<div style="display: inline-block; padding: 6px 18px; border-radius: 999px; background: rgba(0, 245, 155, 0.12); border: 1px solid #00f59b; color: #00f59b; font-size: 11px; font-weight: 800; letter-spacing: 2px;">' +
              'SEUSL • FACULTY OF TECHNOLOGY' +
            '</div>' +
            '<h1 style="margin: 14px 0 6px; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">' +
              'Registration Confirmed' +
            '</h1>' +
            '<p style="margin: 0; font-size: 14px; color: #94a3b8;">' +
              'Welcome to Citadel of Innovation, <strong style="color: #00f59b;">' + p.participantName + '</strong>!' +
            '</p>' +
          '</td>' +
        '</tr>' +

        '<!-- GRAND CITADEL ACCESS PASS -->' +
        '<tr>' +
          '<td style="padding: 0;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius: 20px; overflow: hidden; border: 2px solid #00f59b; box-shadow: 0 15px 45px rgba(0,0,0,0.9), 0 0 35px rgba(0,245,155,0.25); background-color: #05140d; background-image: url(\'' + frame37Url + '\'); background-size: cover; background-position: center; background-repeat: no-repeat;">' +
              '<tr>' +
                '<td style="background: rgba(3, 11, 7, 0.78); padding: 36px 30px;">' +

                  '<!-- Ticket Header -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom: 1.5px dashed rgba(255, 255, 255, 0.25); padding-bottom: 18px; margin-bottom: 22px;">' +
                    '<tr>' +
                      '<td valign="middle">' +
                        '<div style="font-size: 11px; letter-spacing: 2px; color: #cbd5e1; font-weight: 700; text-shadow: 0 2px 4px #000;">' +
                          'SEUSL • FACULTY OF TECHNOLOGY' +
                        '</div>' +
                        '<div style="font-size: 20px; font-weight: 900; color: #ffffff; margin-top: 4px; letter-spacing: 0.5px; text-shadow: 0 2px 8px #000;">' +
                          'HASHCORE \'26 CITADEL PASS' +
                        '</div>' +
                        '<div style="font-size: 12px; font-weight: 800; color: #00f59b; margin-top: 4px; letter-spacing: 1.5px; text-shadow: 0 2px 6px #000;">' +
                          p.competitionTitle.toUpperCase() +
                        '</div>' +
                      '</td>' +
                      '<td align="right" valign="middle">' +
                        '<div style="font-size: 11px; letter-spacing: 1.5px; color: #cbd5e1; font-weight: 700; text-shadow: 0 2px 4px #000;">' +
                          'OFFICIAL PASS ID' +
                        '</div>' +
                        '<div style="font-size: 22px; font-weight: 900; color: #00f59b; font-family: monospace; letter-spacing: 1px; margin-top: 4px; text-shadow: 0 0 15px rgba(0,245,155,0.6), 0 2px 6px #000;">' +
                          p.ticketId +
                        '</div>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +

                  '<!-- Ticket Data Grid -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">' +
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 8px 12px 12px 0;">' +
                        '<div style="font-size: 10px; letter-spacing: 1.5px; color: #94a3b8; font-weight: 800; text-shadow: 0 1px 3px #000;">PARTICIPANT NAME</div>' +
                        '<div style="font-size: 17px; font-weight: 900; color: #ffffff; margin-top: 3px; text-shadow: 0 2px 8px #000;">' + p.participantName + '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 8px 0 12px 12px;">' +
                        '<div style="font-size: 10px; letter-spacing: 1.5px; color: #94a3b8; font-weight: 800; text-shadow: 0 1px 3px #000;">UNIVERSITY REG NO</div>' +
                        '<div style="font-size: 15px; font-weight: 900; color: #38bdf8; font-family: monospace; margin-top: 3px; text-shadow: 0 2px 8px #000;">' + p.regNo + '</div>' +
                      '</td>' +
                    '</tr>' +
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 10px 12px 10px 0; border-top: 1px solid rgba(255,255,255,0.1);">' +
                        '<div style="font-size: 10px; letter-spacing: 1.5px; color: #94a3b8; font-weight: 800; text-shadow: 0 1px 3px #000;">ACADEMIC BATCH</div>' +
                        '<div style="font-size: 14px; font-weight: 700; color: #f1f5f9; margin-top: 3px; text-shadow: 0 2px 6px #000;">' + p.batch + '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 10px 0 10px 12px; border-top: 1px solid rgba(255,255,255,0.1);">' +
                        '<div style="font-size: 10px; letter-spacing: 1.5px; color: #94a3b8; font-weight: 800; text-shadow: 0 1px 3px #000;">FACULTY</div>' +
                        '<div style="font-size: 14px; font-weight: 700; color: #f1f5f9; margin-top: 3px; text-shadow: 0 2px 6px #000;">' + p.faculty + '</div>' +
                      '</td>' +
                    '</tr>' +
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 10px 12px 10px 0; border-top: 1px solid rgba(255,255,255,0.1);">' +
                        '<div style="font-size: 10px; letter-spacing: 1.5px; color: #94a3b8; font-weight: 800; text-shadow: 0 1px 3px #000;">REGISTERED EMAIL</div>' +
                        '<div style="font-size: 13px; font-weight: 700; color: #f1f5f9; font-family: monospace; margin-top: 3px; text-shadow: 0 2px 6px #000;">' + p.email + '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 10px 0 10px 12px; border-top: 1px solid rgba(255,255,255,0.1);">' +
                        '<div style="font-size: 10px; letter-spacing: 1.5px; color: #94a3b8; font-weight: 800; text-shadow: 0 1px 3px #000;">CONTACT NUMBER</div>' +
                        '<div style="font-size: 14px; font-weight: 700; color: #f1f5f9; font-family: monospace; margin-top: 3px; text-shadow: 0 2px 6px #000;">' + p.contactNo + '</div>' +
                      '</td>' +
                    '</tr>' +
                    '<tr>' +
                      '<td width="50%" valign="top" style="padding: 10px 12px 10px 0; border-top: 1px solid rgba(255,255,255,0.1);">' +
                        '<div style="font-size: 10px; letter-spacing: 1.5px; color: #94a3b8; font-weight: 800; text-shadow: 0 1px 3px #000;">WHATSAPP NUMBER</div>' +
                        '<div style="font-size: 14px; font-weight: 700; color: #f1f5f9; font-family: monospace; margin-top: 3px; text-shadow: 0 2px 6px #000;">' + (p.whatsappNo || p.contactNo) + '</div>' +
                      '</td>' +
                      '<td width="50%" valign="top" style="padding: 10px 0 10px 12px; border-top: 1px solid rgba(255,255,255,0.1);">' +
                        '<div style="font-size: 10px; letter-spacing: 1.5px; color: #94a3b8; font-weight: 800; text-shadow: 0 1px 3px #000;">REGISTRATION DATE</div>' +
                        '<div style="font-size: 13px; font-weight: 700; color: #f1f5f9; font-family: monospace; margin-top: 3px; text-shadow: 0 2px 6px #000;">' + p.registrationDate + '</div>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +

                  '<!-- Ticket Footer: Barcode & Confirmation Stamp -->' +
                  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1.5px dashed rgba(255, 255, 255, 0.25); padding-top: 18px;">' +
                    '<tr>' +
                      '<td valign="middle">' +
                        '<div style="letter-spacing: 4px; font-size: 22px; color: #ffffff; font-family: monospace; font-weight: 900; opacity: 0.95; text-shadow: 0 2px 4px #000;">' +
                          '||||| | |||| | || ||||| ||| | ||||' +
                        '</div>' +
                        '<div style="font-size: 10px; letter-spacing: 1.5px; color: #cbd5e1; margin-top: 4px; font-family: monospace; text-shadow: 0 1px 3px #000;">' +
                          'SEUSL CITADEL ACCESS PROTOCOL // VERIFIED' +
                        '</div>' +
                      '</td>' +
                      '<td align="right" valign="middle">' +
                        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display: inline-table; border: 2.5px solid #00f59b; border-radius: 8px; background: rgba(0, 245, 155, 0.15); padding: 8px 18px; transform: rotate(-3deg);">' +
                          '<tr>' +
                            '<td align="center">' +
                              '<div style="font-size: 9px; letter-spacing: 2px; color: #cbd5e1; font-weight: 800;">SEUSL HASHCORE</div>' +
                              '<div style="font-size: 14px; font-weight: 900; color: #00f59b; letter-spacing: 2px; margin-top: 2px;">CONFIRMED</div>' +
                            '</td>' +
                          '</tr>' +
                        '</table>' +
                      '</td>' +
                    '</tr>' +
                  '</table>' +

                '</td>' +
              '</tr>' +
            '</table>' +
          '</td>' +
        '</tr>' +

        '<!-- Notice -->' +
        '<tr>' +
          '<td style="padding: 24px 8px 12px;">' +
            '<div style="background: rgba(245, 158, 11, 0.12); border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 18px; font-size: 13px; color: #fde68a; line-height: 1.5;">' +
              '<strong>Notice:</strong> Please save this email and keep your <strong>Ticket ID (' + p.ticketId + ')</strong> accessible during event registration on competition day. Only one submission is permitted per participant.' +
            '</div>' +
          '</td>' +
        '</tr>' +

        '<!-- Footer -->' +
        '<tr>' +
          '<td align="center" style="padding: 16px 8px 24px; color: #64748b; font-size: 12px; line-height: 1.6;">' +
            '<strong style="color: #94a3b8;">HASHCORE \'26 Organizing Committee</strong><br>' +
            'Faculty of Technology • South Eastern University of Sri Lanka (SEUSL)<br>' +
            '<span style="font-size: 11px; color: #475569;">Citadel Mainframe Verified Automated Transmission</span>' +
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
 * Sends a test confirmation ticket pass from hashcore@seu.ac.lk to verifyxcode@gmail.com.
 * 
 * HOW TO RUN IN GOOGLE APPS SCRIPT:
 * 1. Log in to Google as: hashcore@seu.ac.lk
 * 2. Open this script in https://script.google.com
 * 3. In the toolbar at the top, select "testSendEmailToVerifyXcode" from the function list.
 * 4. Click "Run" (▶️).
 * 5. Check the verifyxcode@gmail.com inbox!
 */
function testSendEmailToVerifyXcode(recipient) {
  var testEmail = recipient || 'verifyxcode@gmail.com';
  var testTicketId = 'WEB-2026-TEST01';
  var testDate = Utilities.formatDate(new Date(), 'Asia/Colombo', "yyyy-MM-dd HH:mm:ss");

  var subject = "Test Verification – Web Development Competition [Pass: " + testTicketId + "]";
  var htmlBody = buildConfirmationEmailHtml({
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
  });

  sendEmailNotification({
    to: testEmail,
    subject: subject,
    htmlBody: htmlBody
  });

  var sender = 'Unknown';
  try {
    sender = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail();
  } catch (e) {}

  Logger.log("✅ Verification email successfully dispatched to: " + testEmail + " (Executed as: " + sender + ")");
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

  // Trigger test email check directly:
  // e.g. visit: https://script.google.com/macros/s/.../exec?action=test&email=verifyxcode@gmail.com
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

