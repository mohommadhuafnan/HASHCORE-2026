import nodemailer from 'nodemailer';

/**
 * Email Service for SEUSL HASHCORE 2026
 * Handles high-deliverability transactional emails with inline CID attachments.
 */

let cachedTransporter = null;

export function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: { user, pass },
    });
  } else if (user && pass) {
    // Standard Gmail SMTP
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  } else {
    // Development / Dry-run transport
    cachedTransporter = {
      sendMail: async (mailOptions) => {
        console.log(`[EmailService:Simulated] To: ${mailOptions.to} | Subject: "${mailOptions.subject}"`);
        return { messageId: `mock-${Date.now()}` };
      },
    };
  }

  return cachedTransporter;
}

const DEFAULT_SENDER = `"SEUSL HASHCORE 2026" <${process.env.OFFICIAL_EMAIL || 'hashcore@seu.ac.lk'}>`;

/**
 * 1. Send Registration Confirmation Email with Inline QR Ticket
 */
export async function sendRegistrationConfirmationEmail({
  participantName,
  email,
  ticketId,
  competitionTitle,
  eventName = "SEUSL HASHCORE '26",
  eventDate = 'October 25, 2026',
  eventTime = '08:30 AM',
  venue = 'Faculty of Technology, South Eastern University of Sri Lanka (SEUSL), Oluvil',
  qrBuffer,
  regNo,
  batch,
  faculty = 'Technology',
}) {
  const transporter = getTransporter();
  const subject = `Your Registration Is Confirmed — ${eventName}`;

  const plainText = `Hello ${participantName},

Thank you for registering for ${eventName} (${competitionTitle}).
Your registration has been confirmed successfully.

EVENT DETAILS
Event Name: ${eventName}
Track: ${competitionTitle}
Date: ${eventDate}
Time: ${eventTime}
Venue: ${venue}

YOUR ENTRY TICKET DETAILS
Ticket ID: ${ticketId}
University Reg No: ${regNo}
Batch: ${batch}
Faculty: ${faculty}

YOUR ENTRY TICKET
Please present the QR code attached to this email to an authorized event organizer when you arrive.
Your QR ticket is unique to your registration. Please do not share it publicly.

We look forward to seeing you at the event.

Best regards,
${eventName} Organizing Committee
Faculty of Technology, South Eastern University of Sri Lanka (SEUSL)
University Park, Oluvil, #32360, Sri Lanka
Inquiries: ${process.env.OFFICIAL_EMAIL || 'hashcore@seu.ac.lk'}
`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:24px 12px;background-color:#030805;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;margin:0 auto;">
    
    <!-- Header -->
    <tr>
      <td align="center" style="padding-bottom:18px;">
        <div style="display:inline-block;background-color:#062b1b;border:1px solid #00f59b;border-radius:20px;padding:6px 18px;font-size:11px;font-weight:700;color:#00f59b;letter-spacing:1.5px;text-transform:uppercase;">
          SEUSL &bull; FACULTY OF TECHNOLOGY
        </div>
        <h1 style="margin:14px 0 6px;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
          Registration Confirmed
        </h1>
        <p style="margin:0;font-size:14px;color:#94a3b8;">
          Hello <strong style="color:#00f59b;">${participantName}</strong>, thank you for registering!
        </p>
      </td>
    </tr>

    <!-- Pass Card -->
    <tr>
      <td style="padding:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:16px;border:2px solid #00f59b;background-color:#06170e;">
          <tr>
            <td style="padding:28px 24px;">

              <!-- Pass Top -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-bottom:1px solid #143825;padding-bottom:16px;margin-bottom:20px;">
                <tr>
                  <td valign="top">
                    <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1.5px;text-transform:uppercase;">${eventName}</div>
                    <div style="font-size:18px;font-weight:800;color:#00f59b;margin-top:3px;">${competitionTitle}</div>
                  </td>
                  <td align="right" valign="top">
                    <div style="font-size:10px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">TICKET ID</div>
                    <div style="font-size:18px;font-weight:800;color:#ffffff;font-family:Consolas,monospace;margin-top:3px;">${ticketId}</div>
                  </td>
                </tr>
              </table>

              <!-- Details Grid -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td width="50%" valign="top" style="padding:6px 0;">
                    <div style="font-size:11px;color:#64748b;font-weight:600;">PARTICIPANT NAME</div>
                    <div style="font-size:14px;font-weight:700;color:#ffffff;margin-top:2px;">${participantName}</div>
                  </td>
                  <td width="50%" valign="top" style="padding:6px 0;">
                    <div style="font-size:11px;color:#64748b;font-weight:600;">UNIVERSITY REG NO</div>
                    <div style="font-size:14px;font-weight:700;color:#38bdf8;font-family:monospace;margin-top:2px;">${regNo}</div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" valign="top" style="padding:6px 0;">
                    <div style="font-size:11px;color:#64748b;font-weight:600;">EVENT DATE & TIME</div>
                    <div style="font-size:13px;font-weight:600;color:#e2e8f0;margin-top:2px;">${eventDate} &bull; ${eventTime}</div>
                  </td>
                  <td width="50%" valign="top" style="padding:6px 0;">
                    <div style="font-size:11px;color:#64748b;font-weight:600;">VENUE</div>
                    <div style="font-size:13px;font-weight:600;color:#e2e8f0;margin-top:2px;">${venue}</div>
                  </td>
                </tr>
              </table>

              <!-- QR Ticket Container (High Contrast, Centered, Embedded via CID) -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#020905;border:1px dashed #00f59b;border-radius:12px;padding:20px;text-align:center;margin-bottom:18px;">
                <tr>
                  <td align="center">
                    <div style="font-size:11px;font-weight:800;color:#00f59b;letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;">
                      &bull; OFFICIAL ENTRY QR PASS &bull;
                    </div>
                    <div style="display:inline-block;padding:12px;background:#ffffff;border-radius:8px;">
                      <img src="cid:event-ticket-qr" alt="Ticket QR Code" width="220" height="220" style="display:block;margin:0 auto;border:none;" />
                    </div>
                    <div style="font-size:12px;color:#94a3b8;margin-top:12px;max-width:380px;">
                      Present this QR code to an authorized event organizer upon arrival at the venue.
                    </div>
                  </td>
                </tr>
              </table>

              <div style="font-size:12px;color:#00f59b;font-weight:700;text-align:center;">
                &check; PASS STATUS: ACTIVE & VERIFIED
              </div>

            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" style="padding:22px 8px;color:#64748b;font-size:11px;line-height:1.6;">
        <strong style="color:#94a3b8;">${eventName} Organizing Committee</strong><br>
        Faculty of Technology &bull; South Eastern University of Sri Lanka (SEUSL)<br>
        University Park, Oluvil, #32360, Sri Lanka<br>
        Official Contact: <a href="mailto:${process.env.OFFICIAL_EMAIL || 'hashcore@seu.ac.lk'}" style="color:#00f59b;text-decoration:none;">${process.env.OFFICIAL_EMAIL || 'hashcore@seu.ac.lk'}</a>
      </td>
    </tr>

  </table>
</body>
</html>`;

  const attachments = [];
  if (qrBuffer) {
    attachments.push({
      filename: `ticket-qr-${ticketId}.png`,
      content: qrBuffer,
      cid: 'event-ticket-qr',
    });
  }

  try {
    const info = await transporter.sendMail({
      from: DEFAULT_SENDER,
      to: email,
      subject,
      text: plainText,
      html: htmlBody,
      attachments,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] Failed to send registration email to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 2. Send Attendance Confirmation Email (Automatically fired after valid check-in)
 */
export async function sendAttendanceConfirmationEmail({
  participantName,
  email,
  registrationReference,
  eventName = "SEUSL HASHCORE '26",
  eventDate = 'October 25, 2026',
  venue = 'Faculty of Technology, South Eastern University of Sri Lanka (SEUSL), Oluvil',
  checkedInAt = new Date(),
}) {
  const transporter = getTransporter();
  const subject = `You're Checked In! Attendance Confirmed — ${eventName}`;

  const formattedTime = new Date(checkedInAt).toLocaleString('en-US', {
    timeZone: process.env.TIMEZONE || 'Asia/Colombo',
    dateStyle: 'medium',
    timeStyle: 'medium',
  });

  const plainText = `Hello ${participantName},

We're happy to confirm that your attendance at ${eventName} has been successfully recorded.
Your QR ticket was verified by our event team, and you are now marked as PRESENT.

YOUR ATTENDANCE DETAILS
Event Name: ${eventName}
Participant Name: ${participantName}
Registration Reference: ${registrationReference}
Event Date: ${eventDate}
Venue: ${venue}
Check-in Time: ${formattedTime}

ATTENDANCE STATUS: CONFIRMED

Thank you for joining us.
We appreciate your participation and hope you enjoy the event.

Best regards,
${eventName} Organizing Committee
Faculty of Technology, South Eastern University of Sri Lanka (SEUSL)
University Park, Oluvil, Sri Lanka
Inquiries: ${process.env.OFFICIAL_EMAIL || 'hashcore@seu.ac.lk'}
`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:24px 12px;background-color:#030805;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;margin:0 auto;">
    
    <!-- Header -->
    <tr>
      <td align="center" style="padding-bottom:18px;">
        <div style="display:inline-block;background-color:#062b1b;border:1px solid #00f59b;border-radius:20px;padding:6px 18px;font-size:11px;font-weight:700;color:#00f59b;letter-spacing:1.5px;text-transform:uppercase;">
          ATTENDANCE CONFIRMED
        </div>
        <h1 style="margin:14px 0 6px;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
          You're Checked In!
        </h1>
        <p style="margin:0;font-size:14px;color:#94a3b8;">
          Hello <strong style="color:#00f59b;">${participantName}</strong>, your entry has been verified.
        </p>
      </td>
    </tr>

    <!-- Card -->
    <tr>
      <td style="padding:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:16px;border:2px solid #00f59b;background-color:#06170e;">
          <tr>
            <td style="padding:28px 24px;">

              <div style="background-color:#022013;border:1px solid #00f59b;border-radius:10px;padding:16px;text-align:center;margin-bottom:20px;">
                <div style="font-size:24px;font-weight:900;color:#00f59b;letter-spacing:1px;">
                  &check; STATUS: PRESENT
                </div>
                <div style="font-size:12px;color:#94a3b8;margin-top:4px;">
                  Verified by Organizer via Citadel QR Scanner
                </div>
              </div>

              <!-- Details Grid -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" valign="top" style="padding:8px 0;border-bottom:1px solid #143825;">
                    <div style="font-size:11px;color:#64748b;font-weight:600;">PARTICIPANT NAME</div>
                    <div style="font-size:14px;font-weight:700;color:#ffffff;margin-top:2px;">${participantName}</div>
                  </td>
                  <td width="50%" valign="top" style="padding:8px 0;border-bottom:1px solid #143825;">
                    <div style="font-size:11px;color:#64748b;font-weight:600;">TICKET REFERENCE</div>
                    <div style="font-size:14px;font-weight:700;color:#38bdf8;font-family:monospace;margin-top:2px;">${registrationReference}</div>
                  </td>
                </tr>
                <tr>
                  <td width="50%" valign="top" style="padding:8px 0;border-bottom:1px solid #143825;">
                    <div style="font-size:11px;color:#64748b;font-weight:600;">EVENT NAME</div>
                    <div style="font-size:13px;font-weight:600;color:#e2e8f0;margin-top:2px;">${eventName}</div>
                  </td>
                  <td width="50%" valign="top" style="padding:8px 0;border-bottom:1px solid #143825;">
                    <div style="font-size:11px;color:#64748b;font-weight:600;">CHECK-IN TIME</div>
                    <div style="font-size:13px;font-weight:600;color:#00f59b;font-family:monospace;margin-top:2px;">${formattedTime}</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:8px 0;">
                    <div style="font-size:11px;color:#64748b;font-weight:600;">VENUE</div>
                    <div style="font-size:13px;font-weight:600;color:#e2e8f0;margin-top:2px;">${venue}</div>
                  </td>
                </tr>
              </table>

              <div style="margin-top:20px;padding:14px;background-color:#040c08;border-radius:8px;font-size:12px;color:#94a3b8;line-height:1.5;">
                Thank you for joining us at ${eventName}. We appreciate your participation and wish you an inspiring experience!
              </div>

            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td align="center" style="padding:22px 8px;color:#64748b;font-size:11px;line-height:1.6;">
        <strong style="color:#94a3b8;">${eventName} Organizing Committee</strong><br>
        Faculty of Technology &bull; South Eastern University of Sri Lanka (SEUSL)<br>
        University Park, Oluvil, #32360, Sri Lanka<br>
        Official Contact: <a href="mailto:${process.env.OFFICIAL_EMAIL || 'hashcore@seu.ac.lk'}" style="color:#00f59b;text-decoration:none;">${process.env.OFFICIAL_EMAIL || 'hashcore@seu.ac.lk'}</a>
      </td>
    </tr>

  </table>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: DEFAULT_SENDER,
      to: email,
      subject,
      text: plainText,
      html: htmlBody,
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EmailService] Failed to send attendance confirmation to ${email}:`, err.message);
    return { success: false, error: err.message };
  }
}
